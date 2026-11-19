const express = require('express');
const router = express.Router();
const db = require('../../database');
const { executeFullAutoSetup } = require('../../auto-setup');

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
    return res.status(400).json({ error: 'กรุณาเลือกห้อง Verify และกด "บันทึก" ก่อนส่งหน้า Verify' });
  }

  try {
    let guild = req.client.guilds.cache.get(req.params.guildId);
    if (!guild) {
      guild = await req.client.guilds.fetch(req.params.guildId).catch(() => null);
    }
    if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์ หรือบอทไม่ได้อยู่ในเซิร์ฟเวอร์นี้' });

    let channel = guild.channels.cache.get(settings.verify_channel);
    if (!channel) {
      channel = await guild.channels.fetch(settings.verify_channel).catch(() => null);
    }
    if (!channel) return res.status(404).json({ error: 'ไม่พบห้อง Verify ในเซิร์ฟเวอร์ (อาจถูกลบไปแล้ว)' });

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

    await channel.send({ embeds: [embed], components: [row] });
    res.json({ success: true });
  } catch (err) {
    console.error('Verify send error:', err);
    res.status(500).json({ error: 'บอทไม่มีสิทธิ์ส่งข้อความในห้องนี้ (Missing Permissions) กรุณาให้สิทธิ์ Administrator กับบอท' });
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

// POST save all / force checkpoint database
router.post('/guilds/:guildId/save-all', checkGuildPermission, (req, res) => {
  try {
    db.checkpointDatabase();
    res.json({ success: true, message: 'บันทึกข้อมูลและเซฟฐานข้อมูลสำเร็จเรียบร้อย ข้อมูลปลอดภัย 100%' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST clone channel
router.post('/guilds/:guildId/clone-channel', checkGuildPermission, async (req, res) => {
  const { templateChannelId, newChannelName } = req.body;
  if (!templateChannelId || !newChannelName) {
    return res.status(400).json({ error: 'กรุณาระบุห้องแม่แบบและชื่อห้องใหม่' });
  }

  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  const templateChannel = guild.channels.cache.get(templateChannelId);
  if (!templateChannel) return res.status(404).json({ error: 'ไม่พบห้องแม่แบบที่เลือก' });

  try {
    const overwrites = templateChannel.permissionOverwrites.cache.map(p => ({
      id: p.id,
      allow: p.allow.bitfield,
      deny: p.deny.bitfield,
      type: p.type
    }));

    const newChannel = await guild.channels.create({
      name: newChannelName.trim(),
      type: templateChannel.type,
      parent: templateChannel.parentId,
      topic: templateChannel.topic || null,
      nsfw: templateChannel.nsfw || false,
      rateLimitPerUser: templateChannel.rateLimitPerUser || 0,
      permissionOverwrites: overwrites
    });

    db.logModAction(guild.id, req.user.id, req.user.id, 'clone_channel', `Cloned #${templateChannel.name} -> #${newChannel.name}`);
    res.json({ success: true, channelId: newChannel.id, channelName: newChannel.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ideas
router.get('/guilds/:guildId/ideas', checkGuildPermission, (req, res) => {
  try {
    const ideas = db.getIdeas(req.params.guildId);
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST idea
router.post('/guilds/:guildId/ideas', checkGuildPermission, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกไอเดีย' });
  }
  try {
    db.addIdea(req.params.guildId, req.user.id, req.user.username, content.trim());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE idea
router.delete('/guilds/:guildId/ideas/:id', checkGuildPermission, (req, res) => {
  try {
    db.deleteIdea(req.params.id, req.params.guildId);
    res.json({ success: true });
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

// POST Full Auto Setup
router.post('/guilds/:guildId/auto-setup', checkGuildPermission, async (req, res) => {
  const { theme, withStats } = req.body;
  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์ หรือบอทไม่ได้อยู่ในเซิร์ฟเวอร์นี้' });

  try {
    const result = await executeFullAutoSetup(guild, theme || 'gaming', { withStats: withStats ?? true });
    db.logModAction(guild.id, req.user.id, req.user.id, 'auto_setup_web', `Executed Full Auto Setup via Dashboard with theme ${theme || 'gaming'}`);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Auto setup API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST Nuke Server via Web Dashboard
router.post('/guilds/:guildId/nuke', checkGuildPermission, async (req, res) => {
  const { num1, num2, answer } = req.body;
  const guild = req.client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'ไม่พบเซิร์ฟเวอร์' });

  // ตรวจสอบว่าผู้สั่งการคือ Owner หรือไม่
  if (guild.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'คำสั่งอันตรายสูงสุดนี้อนุญาตเฉพาะเจ้าของเซิร์ฟเวอร์ (Server Owner) เท่านั้น!' });
  }

  // ตรวจสอบผลการคำนวณเลข
  if (!num1 || !num2 || answer !== (num1 + num2)) {
    return res.status(400).json({ error: 'ผลการคำนวณไม่ถูกต้อง! การล้างเซิร์ฟเวอร์ถูกยกเลิก' });
  }

  try {
    db.logModAction(guild.id, req.user.id, req.user.id, 'nuke_server_web', 'Owner executed full server purge via Web Dashboard');

    // 1. ลบ Roles ทั้งหมดที่บอทมีสิทธิ์ลบ
    const botMember = guild.members.me;
    const roles = Array.from(guild.roles.cache.values());
    for (const role of roles) {
      if (role.id === guild.id) continue;
      if (role.managed) continue;
      if (botMember && role.position >= botMember.roles.highest.position) continue;
      try {
        await role.delete('Nuke Authorized via Web Dashboard');
      } catch (e) {}
    }

    // 2. ลบ Channels ทั้งหมดและสร้างห้องใหม่
    let noticeCh = null;
    try {
      noticeCh = await guild.channels.create({
        name: '🧹┃server-reset',
        reason: 'Nuke complete channel'
      });
    } catch (e) {}

    const channels = Array.from(guild.channels.cache.values());
    for (const ch of channels) {
      if (noticeCh && ch.id === noticeCh.id) continue;
      try {
        await ch.delete('Nuke Authorized via Web Dashboard');
      } catch (e) {}
    }

    if (noticeCh) {
      await noticeCh.send('🧹 **เซิร์ฟเวอร์ได้รับการรีเซ็ตเรียบร้อยแล้วผ่าน Web Dashboard**\nคุณสามารถใช้คำสั่ง `/setup-security` หรือไปที่ Web Dashboard เพื่อสร้างระบบใหม่ได้ทันที').catch(() => {});
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Nuke web error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
