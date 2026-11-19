const { Events, EmbedBuilder } = require('discord.js');
const { ensureGuild } = require('../database');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const settings = await ensureGuild(member.guild.id, member.guild.name);
      if (!settings) return;

      // === Welcome System ===
      if (settings.welcome_enabled && settings.welcome_channel) {
        let channel = member.guild.channels.cache.get(settings.welcome_channel);
        if (!channel) {
          channel = await member.guild.channels.fetch(settings.welcome_channel).catch(() => null);
        }

        if (channel) {
          const message = (settings.welcome_message || 'ยินดีต้อนรับ {user} เข้าสู่ **{server}**! 🎉')
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{membercount}/g, member.guild.memberCount);

          const embed = new EmbedBuilder()
            .setTitle('👋 ยินดีต้อนรับ!')
            .setDescription(message)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setColor(settings.welcome_color || '#5865F2')
            .setFooter({ text: `สมาชิกคนที่ #${member.guild.memberCount}` })
            .setTimestamp();

          await channel.send({ embeds: [embed] }).catch(err => {
            console.error('❌ ส่งข้อความต้อนรับไม่สำเร็จ:', err.message);
          });
        }
      }

      // === Auto Role ===
      if (settings.autorole_enabled && settings.autorole_id) {
        try {
          let role = member.guild.roles.cache.get(settings.autorole_id);
          if (!role) {
            role = await member.guild.roles.fetch(settings.autorole_id).catch(() => null);
          }
          if (role) {
            await member.roles.add(role);
          }
        } catch (err) {
          console.error('❌ เพิ่ม Auto Role ไม่สำเร็จ:', err.message);
        }
      }

      // Update Stats
      const { updateServerStats } = require('../stats-manager');
      updateServerStats(member.guild).catch(() => {});
    } catch (error) {
      console.error('Error in guildMemberAdd event:', error);
    }
  },
};
