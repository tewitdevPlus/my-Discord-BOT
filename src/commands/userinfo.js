const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('👤 แสดงข้อมูลผู้ใช้')
    .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้')),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📛 ชื่อในเซิร์ฟ', value: member?.displayName || user.username, inline: true },
        { name: '🤖 บอท', value: user.bot ? '✅' : '❌', inline: true },
        { name: '📅 สร้างบัญชี', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 เข้าร่วมเซิร์ฟ', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
        { name: '🏷️ Role', value: member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'ไม่มี' : 'N/A' }
      )
      .setColor(member?.displayHexColor || '#5865F2')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
