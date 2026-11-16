const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { CHANNEL_PRESETS } = require('../channel-presets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename-channel')
    .setDescription('🎨 เปลี่ยนชื่อและตกแต่งห้องนี้ด้วยแม่แบบสำเร็จรูป')
    .addStringOption(opt => opt
      .setName('name')
      .setDescription('ชื่อห้องใหม่ (หรือพิมพ์ชื่อเองพร้อมไอคอน)')
      .setRequired(true)
    )
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('ห้องที่ต้องการตกแต่ง (ถ้าไม่เลือกจะแต่งห้องปัจจุบัน)')
      .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const newName = interaction.options.getString('name');

    try {
      const oldName = targetChannel.name;
      await targetChannel.setName(newName);

      const embed = new EmbedBuilder()
        .setTitle('🎨 ตกแต่งห้องสำเร็จ!')
        .setDescription(`เปลี่ยนชื่อห้องเรียบร้อยแล้ว`)
        .addFields(
          { name: 'ชื่อเดิม', value: `\`${oldName}\``, inline: true },
          { name: 'ชื่อใหม่', value: `\`${newName}\``, inline: true }
        )
        .setColor('#57F287')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ ไม่สามารถเปลี่ยนชื่อห้องได้: ${err.message}`, ephemeral: true });
    }
  },
};
