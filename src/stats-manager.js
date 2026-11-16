const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings, updateGuildSettings } = require('./database');

async function updateServerStats(guild) {
  const settings = getGuildSettings(guild.id);
  if (!settings || !settings.stats_enabled) return;

  try {
    await guild.members.fetch();
  } catch (e) {
    // ignore
  }

  const totalMembers = guild.memberCount;
  const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;
  const botCount = guild.members.cache.filter(m => m.user.bot).size;
  const humanCount = totalMembers - botCount;

  // Update All Members channel
  if (settings.stats_all_channel) {
    const ch = guild.channels.cache.get(settings.stats_all_channel);
    if (ch) await ch.setName(`👥 สมาชิกทั้งหมด: ${totalMembers}`).catch(() => {});
  }

  // Update Online channel
  if (settings.stats_online_channel) {
    const ch = guild.channels.cache.get(settings.stats_online_channel);
    if (ch) await ch.setName(`🟢 ออนไลน์: ${onlineMembers}`).catch(() => {});
  }

  // Update Bot channel
  if (settings.stats_bot_channel) {
    const ch = guild.channels.cache.get(settings.stats_bot_channel);
    if (ch) await ch.setName(`🤖 บอท: ${botCount}`).catch(() => {});
  }

  // Update Role channel
  if (settings.stats_role_channel && settings.stats_role_id) {
    const role = guild.roles.cache.get(settings.stats_role_id);
    const ch = guild.channels.cache.get(settings.stats_role_channel);
    if (role && ch) {
      const count = guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;
      await ch.setName(`👑 ${role.name}: ${count}`).catch(() => {});
    }
  }
}

async function setupServerStats(guild, roleId = null) {
  const everyoneRole = guild.roles.everyone;

  // Create Category on top
  const category = await guild.channels.create({
    name: '📊 SERVER STATS 📊',
    type: ChannelType.GuildCategory,
    position: 0,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.Connect], // Lock voice channel so people don't join
      }
    ]
  });

  await guild.members.fetch().catch(() => {});
  const totalMembers = guild.memberCount;
  const botCount = guild.members.cache.filter(m => m.user.bot).size;
  const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;

  const allCh = await guild.channels.create({
    name: `👥 สมาชิกทั้งหมด: ${totalMembers}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionFlagsBits.Connect] }]
  });

  const onlineCh = await guild.channels.create({
    name: `🟢 ออนไลน์: ${onlineMembers}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionFlagsBits.Connect] }]
  });

  const botCh = await guild.channels.create({
    name: `🤖 บอท: ${botCount}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionFlagsBits.Connect] }]
  });

  let roleCh = null;
  if (roleId) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      const count = guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;
      roleCh = await guild.channels.create({
        name: `👑 ${role.name}: ${count}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionFlagsBits.Connect] }]
      });
    }
  }

  updateGuildSettings(guild.id, {
    stats_enabled: 1,
    stats_category_id: category.id,
    stats_all_channel: allCh.id,
    stats_online_channel: onlineCh.id,
    stats_bot_channel: botCh.id,
    stats_role_channel: roleCh?.id || null,
    stats_role_id: roleId || null
  });

  return { category, allCh, onlineCh, botCh, roleCh };
}

module.exports = {
  updateServerStats,
  setupServerStats
};
