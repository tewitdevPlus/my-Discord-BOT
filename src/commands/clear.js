const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 ลบข้อความในห้องแชท')
    .addIntegerOption(opt => opt
      .setName('amount')
      .setDescription('จำนวนข้อความที่ต้องการลบ (1-100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100))
    .addUserOption(opt => opt.setName('user').setDescription('ลบเฉพาะข้อความของผู้ใช้นี้'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      let deleted;
      if (user) {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const filtered = messages.filter(m => m.author.id === user.id).first(amount);
        deleted = await interaction.channel.bulkDelete(filtered, true);
      } else {
        deleted = await interaction.channel.bulkDelete(amount, true);
      }

      const embed = new EmbedBuilder()
        .setTitle('🧹 ลบข้อความ')
        .setDescription(`ลบ **${deleted.size}** ข้อความสำเร็จ${user ? ` (ของ <@${user.id}>)` : ''}`)
        .setColor('#57F287')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logModAction(interaction.guild.id, user?.id || 'channel', interaction.user.id, 'clear', `${deleted.size} messages`);
    } catch (err) {
      await interaction.editReply({ content: `❌ ลบข้อความไม่สำเร็จ: ${err.message}` });
    }
  },
};
