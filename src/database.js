const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;
let isPostgres = false;
let pool = null;
let sqliteDb = null;

if (DATABASE_URL) {
  isPostgres = true;
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('🐘 ใช้งาน Cloud Database (PostgreSQL - Supabase)');
} else {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  sqliteDb = new Database(path.join(dataDir, 'bot.db'));
  sqliteDb.pragma('journal_mode = WAL');
  console.log('📁 ใช้งาน Local Database (SQLite)');
}

// In-memory cache for fast sync access (guild settings)
const guildCache = new Map();

// Initialize tables
async function initDB() {
  if (isPostgres) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guilds (
        guild_id TEXT PRIMARY KEY,
        guild_name TEXT,
        welcome_enabled INTEGER DEFAULT 0,
        welcome_channel TEXT,
        welcome_message TEXT DEFAULT 'ยินดีต้อนรับ {user} เข้าสู่ **{server}**! 🎉',
        welcome_color TEXT DEFAULT '#5865F2',
        verify_enabled INTEGER DEFAULT 0,
        verify_channel TEXT,
        verify_role TEXT,
        verify_message TEXT DEFAULT 'กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตน ✅',
        log_enabled INTEGER DEFAULT 0,
        log_channel TEXT,
        autorole_enabled INTEGER DEFAULT 0,
        autorole_id TEXT,
        stats_enabled INTEGER DEFAULT 0,
        stats_category_id TEXT,
        stats_all_channel TEXT,
        stats_online_channel TEXT,
        stats_bot_channel TEXT,
        stats_role_channel TEXT,
        stats_role_id TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS warnings (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT DEFAULT 'ไม่ระบุเหตุผล',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mod_actions (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        action TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ideas (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
    `);

    // Load initial cache from postgres
    const res = await pool.query('SELECT * FROM guilds');
    for (const row of res.rows) {
      guildCache.set(row.guild_id, row);
    }
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS guilds (
        guild_id TEXT PRIMARY KEY,
        guild_name TEXT,
        welcome_enabled INTEGER DEFAULT 0,
        welcome_channel TEXT,
        welcome_message TEXT DEFAULT 'ยินดีต้อนรับ {user} เข้าสู่ **{server}**! 🎉',
        welcome_color TEXT DEFAULT '#5865F2',
        verify_enabled INTEGER DEFAULT 0,
        verify_channel TEXT,
        verify_role TEXT,
        verify_message TEXT DEFAULT 'กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตน ✅',
        log_enabled INTEGER DEFAULT 0,
        log_channel TEXT,
        autorole_enabled INTEGER DEFAULT 0,
        autorole_id TEXT,
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

      CREATE TABLE IF NOT EXISTS ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }
}

// Initialise DB promise
const initPromise = initDB().catch(err => console.error('Database Init Error:', err));

// === Guild Settings ===
function getGuildSettings(guildId) {
  if (isPostgres) {
    return guildCache.get(guildId) || null;
  }
  return sqliteDb.prepare('SELECT * FROM guilds WHERE guild_id = ?').get(guildId);
}

async function ensureGuild(guildId, guildName) {
  if (isPostgres) {
    await initPromise;
    let existing = guildCache.get(guildId);
    if (!existing) {
      const res = await pool.query(
        `INSERT INTO guilds (guild_id, guild_name) VALUES ($1, $2)
         ON CONFLICT (guild_id) DO NOTHING
         RETURNING *`,
        [guildId, guildName]
      );
      if (res.rows.length > 0) {
        existing = res.rows[0];
      } else {
        const queryRes = await pool.query('SELECT * FROM guilds WHERE guild_id = $1', [guildId]);
        existing = queryRes.rows[0];
      }
      guildCache.set(guildId, existing);
    }
    return existing;
  } else {
    const existing = sqliteDb.prepare('SELECT * FROM guilds WHERE guild_id = ?').get(guildId);
    if (!existing) {
      sqliteDb.prepare(`
        INSERT INTO guilds (guild_id, guild_name) VALUES (?, ?)
        ON CONFLICT(guild_id) DO NOTHING
      `).run(guildId, guildName);
      return sqliteDb.prepare('SELECT * FROM guilds WHERE guild_id = ?').get(guildId);
    }
    return existing;
  }
}

async function updateGuildSettings(guildId, settings) {
  const fields = Object.keys(settings);
  const values = Object.values(settings);

  if (isPostgres) {
    await initPromise;
    const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
    const res = await pool.query(
      `UPDATE guilds SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE guild_id = $${fields.length + 1} RETURNING *`,
      [...values, guildId]
    );
    const updated = res.rows[0];
    guildCache.set(guildId, updated);
    return updated;
  } else {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const stmt = sqliteDb.prepare(`UPDATE guilds SET ${setClause}, updated_at = datetime('now') WHERE guild_id = ?`);
    stmt.run(...values, guildId);
    return sqliteDb.prepare('SELECT * FROM guilds WHERE guild_id = ?').get(guildId);
  }
}

// === Warnings ===
async function addWarning(guildId, userId, moderatorId, reason) {
  if (isPostgres) {
    return pool.query(
      'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES ($1, $2, $3, $4)',
      [guildId, userId, moderatorId, reason]
    );
  }
  return sqliteDb.prepare(
    'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)'
  ).run(guildId, userId, moderatorId, reason);
}

async function getWarnings(guildId, userId) {
  if (isPostgres) {
    const res = await pool.query('SELECT * FROM warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC', [guildId, userId]);
    return res.rows;
  }
  return sqliteDb.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC').all(guildId, userId);
}

async function getAllWarnings(guildId) {
  if (isPostgres) {
    const res = await pool.query('SELECT * FROM warnings WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 100', [guildId]);
    return res.rows;
  }
  return sqliteDb.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 100').all(guildId);
}

async function deleteWarning(id, guildId) {
  if (isPostgres) {
    return pool.query('DELETE FROM warnings WHERE id = $1 AND guild_id = $2', [id, guildId]);
  }
  return sqliteDb.prepare('DELETE FROM warnings WHERE id = ? AND guild_id = ?').run(id, guildId);
}

// === Mod Actions ===
async function logModAction(guildId, userId, moderatorId, action, reason) {
  if (isPostgres) {
    return pool.query(
      'INSERT INTO mod_actions (guild_id, user_id, moderator_id, action, reason) VALUES ($1, $2, $3, $4, $5)',
      [guildId, userId, moderatorId, action, reason]
    );
  }
  return sqliteDb.prepare(
    'INSERT INTO mod_actions (guild_id, user_id, moderator_id, action, reason) VALUES (?, ?, ?, ?, ?)'
  ).run(guildId, userId, moderatorId, action, reason);
}

async function getModActions(guildId) {
  if (isPostgres) {
    const res = await pool.query('SELECT * FROM mod_actions WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 100', [guildId]);
    return res.rows;
  }
  return sqliteDb.prepare('SELECT * FROM mod_actions WHERE guild_id = ? ORDER BY created_at DESC LIMIT 100').all(guildId);
}

// === Stats ===
async function getGuildStats(guildId) {
  if (isPostgres) {
    const wRes = await pool.query('SELECT COUNT(*) as count FROM warnings WHERE guild_id = $1', [guildId]);
    const aRes = await pool.query('SELECT COUNT(*) as count FROM mod_actions WHERE guild_id = $1', [guildId]);
    const breakdownRes = await pool.query('SELECT action, COUNT(*) as count FROM mod_actions WHERE guild_id = $1 GROUP BY action', [guildId]);
    return {
      totalWarnings: parseInt(wRes.rows[0]?.count || 0),
      totalActions: parseInt(aRes.rows[0]?.count || 0),
      actionBreakdown: breakdownRes.rows
    };
  }
  const warningCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ?').get(guildId);
  const actionCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM mod_actions WHERE guild_id = ?').get(guildId);
  const recentActions = sqliteDb.prepare('SELECT action, COUNT(*) as count FROM mod_actions WHERE guild_id = ? GROUP BY action').all(guildId);
  return {
    totalWarnings: warningCount?.count || 0,
    totalActions: actionCount?.count || 0,
    actionBreakdown: recentActions
  };
}

// === Reviews ===
async function addReview(userId, username, avatar, rating, comment) {
  if (isPostgres) {
    return pool.query(
      'INSERT INTO reviews (user_id, username, avatar, rating, comment) VALUES ($1, $2, $3, $4, $5)',
      [userId, username, avatar, rating, comment]
    );
  }
  return sqliteDb.prepare(
    'INSERT INTO reviews (user_id, username, avatar, rating, comment) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, username, avatar, rating, comment);
}

async function getReviews() {
  if (isPostgres) {
    const res = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50');
    return res.rows;
  }
  return sqliteDb.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50').all();
}

async function getReviewStats() {
  if (isPostgres) {
    const res = await pool.query('SELECT COUNT(*) as total, AVG(rating) as avgRating FROM reviews');
    const row = res.rows[0];
    return {
      total: parseInt(row?.total || 0),
      avgRating: row?.avgrating ? Number(parseFloat(row.avgrating).toFixed(1)) : 5.0
    };
  }
  const stats = sqliteDb.prepare('SELECT COUNT(*) as total, AVG(rating) as avgRating FROM reviews').get();
  return {
    total: stats?.total || 0,
    avgRating: stats?.avgRating ? Number(stats.avgRating.toFixed(1)) : 5.0
  };
}

// === Ideas ===
async function addIdea(guildId, userId, username, content) {
  if (isPostgres) {
    return pool.query(
      'INSERT INTO ideas (guild_id, user_id, username, content) VALUES ($1, $2, $3, $4)',
      [guildId, userId, username, content]
    );
  }
  return sqliteDb.prepare(
    'INSERT INTO ideas (guild_id, user_id, username, content) VALUES (?, ?, ?, ?)'
  ).run(guildId, userId, username, content);
}

async function getIdeas(guildId) {
  if (isPostgres) {
    const res = await pool.query('SELECT * FROM ideas WHERE guild_id = $1 ORDER BY created_at DESC', [guildId]);
    return res.rows;
  }
  return sqliteDb.prepare('SELECT * FROM ideas WHERE guild_id = ? ORDER BY created_at DESC').all(guildId);
}

async function deleteIdea(id, guildId) {
  if (isPostgres) {
    return pool.query('DELETE FROM ideas WHERE id = $1 AND guild_id = $2', [id, guildId]);
  }
  return sqliteDb.prepare('DELETE FROM ideas WHERE id = ? AND guild_id = ?').run(id, guildId);
}

function checkpointDatabase() {
  if (!isPostgres && sqliteDb) {
    try {
      sqliteDb.pragma('wal_checkpoint(FULL)');
      console.log('💾 [DB] บันทึก WAL Cache ลง SQLite สำเร็จ');
    } catch (e) {
      console.error('WAL checkpoint error:', e);
    }
  }
}

module.exports = {
  isPostgres,
  pool,
  initPromise,
  getGuildSettings,
  ensureGuild,
  updateGuildSettings,
  addWarning,
  getWarnings,
  getAllWarnings,
  deleteWarning,
  logModAction,
  getModActions,
  getGuildStats,
  addReview,
  getReviews,
  getReviewStats,
  addIdea,
  getIdeas,
  deleteIdea,
  checkpointDatabase
};
