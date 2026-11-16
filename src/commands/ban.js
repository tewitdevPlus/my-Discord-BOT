const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 แบนสมาชิกออกจากเซิร์ฟเวอร์')
    .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้ที่ต้องการแบน').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('เหตุผล'))
    .addIntegerOption(opt => opt.setName('days').setDescription('ลบข้อความย้อนหลังกี่วัน (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'ไม่ระบุเหตุผล';
    const days = interaction.options.getInteger('days') || 0;
    const member = interaction.guild.members.cache.get(user.id);

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ คุณไม่สามารถแบนตัวเองได้', ephemeral: true });
    }

    if (member && !member.bannable) {
      return interaction.reply({ content: '❌ ไม่สามารถแบนผู้ใช้นี้ได้ (Role สูงกว่าหรือเท่ากับบอท)', ephemeral: true });
    }

    try {
      await interaction.guild.members.ban(user.id, { deleteMessageDays: days, reason });

      const embed = new EmbedBuilder()
        .setTitle('🔨 แบนสมาชิก')
        .setDescription(`**${user.tag}** ถูกแบนจากเซิร์ฟเวอร์`)
        .addFields(
          { name: '👤 ผู้ถูกแบน', value: `<@${user.id}>`, inline: true },
          { name: '🛡️ แอดมิน', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📝 เหตุผล', value: reason }
        )
        .setColor('#ED4245')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      logModAction(interaction.guild.id, user.id, interaction.user.id, 'ban', reason);
    } catch (err) {
      await interaction.reply({ content: `❌ ไม่สามารถแบนได้: ${err.message}`, ephemeral: true });
    }
  },
};
