const express = require('express');
const router = express.Router();
const db = require('../../database');

// Check guild permission middleware
function checkGuildPermission(req, res, next) {
  const guildId = req.params.guildId;
  const userGuild = req.user.guilds.find(g => g.id === guildId);
  if (!userGuild || !((parseInt(userGuild.permissions) & 0x20) === 0x20 || (parseInt(userGuild.permissions) & 0x8) === 0x8)) {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' });
  }
  next();
}

// GET guild settings
router.get('/guilds/:guildId/settings', checkGuildPermission, (req, res) => {
  const settings = db.getGuildSettings(req.params.guildId);
  if (!settings) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });
  res.json(settings);
});

// PUT update guild settings
router.put('/guilds/:guildId/settings', checkGuildPermission, (req, res) => {
  const allowedFields = [
    'welcome_enabled', 'welcome_channel', 'welcome_message', 'welcome_color',
    'verify_enabled', 'verify_channel', 'verify_role', 'verify_message',
    'log_enabled', 'log_channel',
    'autorole_enabled', 'autorole_id',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'ไม่มีข้อมูลที่ต้องการอัพเดท' });
  }

  const settings = db.updateGuildSettings(req.params.guildId, updates);
  res.json({ success: true, settings });
});

// GET guild stats
router.get('/guilds/:guildId/stats', checkGuildPermission, (req, res) => {
  const stats = db.getGuildStats(req.params.guildId);
  res.json(stats);
});

// GET warnings
router.get('/guilds/:guildId/warnings', checkGuildPermission, (req, res) => {
  const warnings = db.getAllWarnings(req.params.guildId);
  res.json(warnings);
});

// DELETE warning
router.delete('/guilds/:guildId/warnings/:warningId', checkGuildPermission, (req, res) => {
  db.deleteWarning(parseInt(req.params.warningId), req.params.guildId);
  res.json({ success: true });
});

// GET mod actions / logs
router.get('/guilds/:guildId/logs', checkGuildPermission, (req, res) => {
  const actions = db.getModActions(req.params.guildId);
  res.json(actions);
});

// POST resend verify panel
router.post('/guilds/:guildId/verify/resend', checkGuildPermission, async (req, res) => {
  const settings = db.getGuildSettings(req.params.guildId);
  if (!settings || !settings.verify_channel) {
    return res.status(400).json({ error: 'ยังไม่ได้ตั้งค่าห้อง Verify' });
  }

  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  const channel = guild.channels.cache.get(settings.verify_channel);
  if (!channel) return res.status(404).json({ error: 'ไม่พบห้อง Verify' });

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const embed = new EmbedBuilder()
    .setTitle('✅ ยืนยันตัวตน | Verification')
    .setDescription(settings.verify_message || 'กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตน ✅')
    .setColor('#5865F2')
    .setFooter({ text: guild.name, iconURL: guild.iconURL() })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅ ยืนยันตัวตน')
        .setStyle(ButtonStyle.Success)
    );

  try {
    await channel.send({ embeds: [embed], components: [row] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available templates
router.get('/templates', (req, res) => {
  const { TEMPLATES } = require('../../templates');
  res.json(TEMPLATES);
});

// POST apply template to guild
router.post('/guilds/:guildId/template/apply', checkGuildPermission, async (req, res) => {
  const { theme } = req.body;
  if (!theme) return res.status(400).json({ error: 'กรุณาเลือกธีม' });

  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  try {
    const { applyTemplate } = require('../../templates');
    const result = await applyTemplate(guild, theme);
    db.logModAction(guild.id, req.user.id, req.user.id, 'setup_template', `Applied ${theme} via Web`);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET channel presets for individual styling
router.get('/channel-presets', (req, res) => {
  const { CHANNEL_PRESETS } = require('../../channel-presets');
  res.json(CHANNEL_PRESETS);
});

// POST rename/style specific channel
router.post('/guilds/:guildId/channels/:channelId/rename', checkGuildPermission, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'กรุณาระบุชื่อห้อง' });

  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  const channel = guild.channels.cache.get(req.params.channelId);
  if (!channel) return res.status(404).json({ error: 'ไม่พบห้องที่ระบุ' });

  try {
    const oldName = channel.name;
    await channel.setName(name);
    db.logModAction(guild.id, req.user.id, req.user.id, 'rename_channel', `${oldName} -> ${name}`);
    res.json({ success: true, oldName, newName: name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST setup server stats from web
router.post('/guilds/:guildId/stats/setup', checkGuildPermission, async (req, res) => {
  const { roleId } = req.body;
  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  try {
    const { setupServerStats } = require('../../stats-manager');
    const result = await setupServerStats(guild, roleId);
    db.logModAction(guild.id, req.user.id, req.user.id, 'setup_stats', 'Enabled server stats counter');
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET roles with member counts
router.get('/guilds/:guildId/roles-detail', checkGuildPermission, async (req, res) => {
  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  try {
    await guild.members.fetch();
    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        memberCount: r.members.size
      }));
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
