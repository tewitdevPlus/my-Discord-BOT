const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'bot.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS guilds (
    guild_id TEXT PRIMARY KEY,
    guild_name TEXT,

    -- Welcome
    welcome_enabled INTEGER DEFAULT 0,
    welcome_channel TEXT,
    welcome_message TEXT DEFAULT 'ยินดีต้อนรับ {user} เข้าสู่ **{server}**! 🎉',
    welcome_color TEXT DEFAULT '#5865F2',

    -- Verify
    verify_enabled INTEGER DEFAULT 0,
    verify_channel TEXT,
    verify_role TEXT,
    verify_message TEXT DEFAULT 'กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตน ✅',

    -- Logging
    log_enabled INTEGER DEFAULT 0,
    log_channel TEXT,

    -- Auto Role
    autorole_enabled INTEGER DEFAULT 0,
    autorole_id TEXT,

    -- Server Stats Counters
    stats_enabled INTEGER DEFAULT 0,
    stats_category_id TEXT,
    stats_all_channel TEXT,
    stats_online_channel TEXT,
    stats_bot_channel TEXT,
    stats_role_channel TEXT,
    stats_role_id TEXT,

    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT DEFAULT 'ไม่ระบุเหตุผล',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mod_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// === Guild Settings ===
const getGuild = db.prepare('SELECT * FROM guilds WHERE guild_id = ?');
const upsertGuild = db.prepare(`
  INSERT INTO guilds (guild_id, guild_name) VALUES (?, ?)
  ON CONFLICT(guild_id) DO UPDATE SET guild_name = excluded.guild_name, updated_at = datetime('now')
`);

function getGuildSettings(guildId) {
  return getGuild.get(guildId);
}

function ensureGuild(guildId, guildName) {
  const existing = getGuild.get(guildId);
  if (!existing) {
    upsertGuild.run(guildId, guildName);
    return getGuild.get(guildId);
  }
  return existing;
}

function updateGuildSettings(guildId, settings) {
  const fields = Object.keys(settings);
  const values = Object.values(settings);
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const stmt = db.prepare(`UPDATE guilds SET ${setClause}, updated_at = datetime('now') WHERE guild_id = ?`);
  stmt.run(...values, guildId);
  return getGuild.get(guildId);
}

// === Warnings ===
const addWarningStmt = db.prepare(`
  INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)
`);
const getWarningsStmt = db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC');
const getAllWarningsStmt = db.prepare('SELECT * FROM warnings WHERE guild_id = ? ORDER BY created_at DESC LIMIT 100');
const deleteWarningStmt = db.prepare('DELETE FROM warnings WHERE id = ? AND guild_id = ?');
const clearWarningsStmt = db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?');

function addWarning(guildId, userId, moderatorId, reason) {
  return addWarningStmt.run(guildId, userId, moderatorId, reason);
}

function getWarnings(guildId, userId) {
  return getWarningsStmt.all(guildId, userId);
}

function getAllWarnings(guildId) {
  return getAllWarningsStmt.all(guildId);
}

function deleteWarning(id, guildId) {
  return deleteWarningStmt.run(id, guildId);
}

function clearWarnings(guildId, userId) {
  return clearWarningsStmt.run(guildId, userId);
}

// === Mod Actions ===
const logActionStmt = db.prepare(`
  INSERT INTO mod_actions (guild_id, user_id, moderator_id, action, reason) VALUES (?, ?, ?, ?, ?)
`);
const getActionsStmt = db.prepare('SELECT * FROM mod_actions WHERE guild_id = ? ORDER BY created_at DESC LIMIT 100');

function logModAction(guildId, userId, moderatorId, action, reason) {
  return logActionStmt.run(guildId, userId, moderatorId, action, reason);
}

function getModActions(guildId) {
  return getActionsStmt.all(guildId);
}

// === Stats ===
function getGuildStats(guildId) {
  const warningCount = db.prepare('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ?').get(guildId);
  const actionCount = db.prepare('SELECT COUNT(*) as count FROM mod_actions WHERE guild_id = ?').get(guildId);
  const recentActions = db.prepare('SELECT action, COUNT(*) as count FROM mod_actions WHERE guild_id = ? GROUP BY action').all(guildId);
  return {
    totalWarnings: warningCount.count,
    totalActions: actionCount.count,
    actionBreakdown: recentActions
  };
}

// === Reviews ===
const addReviewStmt = db.prepare(`
  INSERT INTO reviews (user_id, username, avatar, rating, comment) VALUES (?, ?, ?, ?, ?)
`);
const getReviewsStmt = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50');
const getReviewStatsStmt = db.prepare('SELECT COUNT(*) as total, AVG(rating) as avgRating FROM reviews');

function addReview(userId, username, avatar, rating, comment) {
  return addReviewStmt.run(userId, username, avatar, rating, comment);
}

function getReviews() {
  return getReviewsStmt.all();
}

function getReviewStats() {
  const stats = getReviewStatsStmt.get();
  return {
    total: stats.total || 0,
    avgRating: stats.avgRating ? Number(stats.avgRating.toFixed(1)) : 5.0
  };
}

module.exports = {
  db,
  getGuildSettings,
  ensureGuild,
  updateGuildSettings,
  addWarning,
  getWarnings,
  getAllWarnings,
  deleteWarning,
  clearWarnings,
  logModAction,
  getModActions,
  getGuildStats,
  addReview,
  getReviews,
  getReviewStats
};
