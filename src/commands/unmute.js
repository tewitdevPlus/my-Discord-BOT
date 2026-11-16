const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 ยกเลิกมิวท์สมาชิก')
    .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้ที่ต้องการยกเลิกมิวท์').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ ไม่พบผู้ใช้นี้ในเซิร์ฟเวอร์', ephemeral: true });
    }

    try {
      await member.timeout(null);

      const embed = new EmbedBuilder()
        .setTitle('🔊 ยกเลิกมิวท์')
        .setDescription(`**${user.tag}** ถูกยกเลิกมิวท์แล้ว`)
        .setColor('#57F287')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ ไม่สามารถยกเลิกมิวท์ได้: ${err.message}`, ephemeral: true });
    }
  },
};
