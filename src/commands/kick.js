const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 เตะสมาชิกออกจากเซิร์ฟเวอร์')
    .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้ที่ต้องการเตะ').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('เหตุผล'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'ไม่ระบุเหตุผล';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ ไม่พบผู้ใช้นี้ในเซิร์ฟเวอร์', ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ คุณไม่สามารถเตะตัวเองได้', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ ไม่สามารถเตะผู้ใช้นี้ได้', ephemeral: true });
    }

    try {
      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setTitle('👢 เตะสมาชิก')
        .setDescription(`**${user.tag}** ถูกเตะออกจากเซิร์ฟเวอร์`)
        .addFields(
          { name: '👤 ผู้ถูกเตะ', value: `<@${user.id}>`, inline: true },
          { name: '🛡️ แอดมิน', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📝 เหตุผล', value: reason }
        )
        .setColor('#FEE75C')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      logModAction(interaction.guild.id, user.id, interaction.user.id, 'kick', reason);
    } catch (err) {
      await interaction.reply({ content: `❌ ไม่สามารถเตะได้: ${err.message}`, ephemeral: true });
    }
  },
};
