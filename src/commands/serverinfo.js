const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('📊 แสดงข้อมูลเซิร์ฟเวอร์'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '👑 เจ้าของ', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 สมาชิก', value: `${guild.memberCount}`, inline: true },
        { name: '🤖 บอท', value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true },
        { name: '📺 ห้องแชท', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🏷️ Role', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emoji', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '📅 สร้างเมื่อ', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🔒 Verification Level', value: `${guild.verificationLevel}`, inline: true },
        { name: '🆔 ID', value: guild.id, inline: true }
      )
      .setColor('#5865F2')
      .setTimestamp();

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 512 }));
    }

    await interaction.reply({ embeds: [embed] });
  },
};
