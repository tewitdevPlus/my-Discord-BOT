const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 มิวท์สมาชิก (Timeout)')
    .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้ที่ต้องการมิวท์').setRequired(true))
    .addIntegerOption(opt => opt
      .setName('duration')
      .setDescription('ระยะเวลา (นาที)')
      .setRequired(true)
      .addChoices(
        { name: '1 นาที', value: 1 },
        { name: '5 นาที', value: 5 },
        { name: '10 นาที', value: 10 },
        { name: '30 นาที', value: 30 },
        { name: '1 ชั่วโมง', value: 60 },
        { name: '6 ชั่วโมง', value: 360 },
        { name: '12 ชั่วโมง', value: 720 },
        { name: '1 วัน', value: 1440 },
        { name: '7 วัน', value: 10080 },
      ))
    .addStringOption(opt => opt.setName('reason').setDescription('เหตุผล'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'ไม่ระบุเหตุผล';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ ไม่พบผู้ใช้นี้ในเซิร์ฟเวอร์', ephemeral: true });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({ content: '❌ คุณไม่สามารถมิวท์ตัวเองได้', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ ไม่สามารถมิวท์ผู้ใช้นี้ได้', ephemeral: true });
    }

    try {
      await member.timeout(duration * 60 * 1000, reason);

      const durationText = duration >= 1440 ? `${duration / 1440} วัน` :
                           duration >= 60 ? `${duration / 60} ชั่วโมง` :
                           `${duration} นาที`;

      const embed = new EmbedBuilder()
        .setTitle('🔇 มิวท์สมาชิก')
        .setDescription(`**${user.tag}** ถูกมิวท์`)
        .addFields(
          { name: '👤 ผู้ถูกมิวท์', value: `<@${user.id}>`, inline: true },
          { name: '🛡️ แอดมิน', value: `<@${interaction.user.id}>`, inline: true },
          { name: '⏱️ ระยะเวลา', value: durationText, inline: true },
          { name: '📝 เหตุผล', value: reason }
        )
        .setColor('#EB459E')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      logModAction(interaction.guild.id, user.id, interaction.user.id, 'mute', `${durationText} - ${reason}`);
    } catch (err) {
      await interaction.reply({ content: `❌ ไม่สามารถมิวท์ได้: ${err.message}`, ephemeral: true });
    }
  },
};
