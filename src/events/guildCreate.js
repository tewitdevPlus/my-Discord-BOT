const { Events } = require('discord.js');
const { ensureGuild } = require('../database');

module.exports = {
  name: Events.GuildCreate,
  execute(guild) {
    ensureGuild(guild.id, guild.name);
    console.log(`📥 เข้าร่วมเซิร์ฟเวอร์: ${guild.name} (${guild.id})`);
  },
};
