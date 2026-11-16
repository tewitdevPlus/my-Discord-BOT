const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { TEMPLATES, applyTemplate } = require('../templates');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-template')
    .setDescription('🎨 ตกแต่งและสร้างห้องในเซิร์ฟเวอร์อัตโนมัติจากธีมยอดนิยม')
    .addStringOption(opt => opt
      .setName('theme')
      .setDescription('เลือกธีมที่ต้องการนำมาตกแต่งเซิร์ฟเวอร์')
      .setRequired(true)
      .addChoices(
        { name: '🌟 คอมมูนิตี้มาตรฐาน (Standard Community)', value: 'community' },
        { name: '🎮 เกมมิ่ง & ตี้เกม (Gaming Hub)', value: 'gaming' },
        { name: '✨ มินิมอล & คาเฟ่ (Aesthetic & Chill)', value: 'aesthetic' }
      )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const themeKey = interaction.options.getString('theme');
    const template = TEMPLATES[themeKey];

    await interaction.deferReply();

    try {
      const result = await applyTemplate(interaction.guild, themeKey);

      const embed = new EmbedBuilder()
        .setTitle('🎨 ตกแต่งเซิร์ฟเวอร์สำเร็จ!')
        .setDescription(`นำเข้าโครงสร้าง **${result.templateName}** เรียบร้อยแล้ว`)
        .addFields(
          { name: '📂 จำนวนห้องที่สร้าง', value: `${result.count} หมวดหมู่และห้อง`, inline: true },
          { name: '🔒 การตั้งค่าสิทธิ์', value: 'ตั้งค่า Read-only สำหรับห้องข้อมูล และซ่อนห้อง Staff ให้เรียบร้อยแล้ว', inline: false }
        )
        .setColor('#57F287')
        .setFooter({ text: 'คุณสามารถไปตั้งค่า Welcome / Verify ให้ตรงกับห้องใหม่ได้ผ่าน Web Dashboard' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logModAction(interaction.guild.id, interaction.user.id, interaction.user.id, 'setup_template', `Applied ${themeKey}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: `❌ เกิดข้อผิดพลาดในการสร้างห้อง: ${err.message}` });
    }
  },
};
