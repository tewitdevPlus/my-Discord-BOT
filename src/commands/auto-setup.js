const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { THEMES, executeFullAutoSetup } = require('../auto-setup');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auto-setup')
    .setDescription('⚡ ติดตั้งระบบเซิร์ฟเวอร์แบบ Full Auto (สร้างยศ, ห้อง, สิทธิ์, Verify, Welcome ครบจบ)')
    .addStringOption(opt => opt
      .setName('theme')
      .setDescription('เลือกธีมของเซิร์ฟเวอร์ที่ต้องการ')
      .setRequired(true)
      .addChoices(
        { name: '🎮 เกมมิ่ง & ตี้เกม (Gaming Hub)', value: 'gaming' },
        { name: '🌟 คอมมูนิตี้มาตรฐาน (Standard Community)', value: 'community' },
        { name: '✨ มินิมอล & คาเฟ่ (Aesthetic & Chill)', value: 'aesthetic' }
      )
    )
    .addBooleanOption(opt => opt
      .setName('stats')
      .setDescription('ต้องการติดตั้งห้องสถิติเสียง (Server Stats) ด้วยหรือไม่')
      .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const themeKey = interaction.options.getString('theme');
    const withStats = interaction.options.getBoolean('stats') ?? true;

    try {
      const result = await executeFullAutoSetup(interaction.guild, themeKey, { withStats });

      const embed = new EmbedBuilder()
        .setTitle('⚡ ติดตั้ง Full Auto Setup สำเร็จเรียบร้อย!')
        .setDescription(`เซิร์ฟเวอร์ของคุณได้รับการตกแต่งและติดตั้งระบบตามธีม **${result.themeName}** พร้อมใช้งานทันที!`)
        .addFields(
          { name: '👑 ยศ (Roles)', value: `สร้างและจัดสีเรียบร้อย **${result.rolesCount} ยศ** (เช่น ${result.memberRole ? `<@&${result.memberRole.id}>` : 'Member'})`, inline: false },
          { name: '📂 ห้อง & หมวดหมู่', value: `สร้างทั้งหมด **${result.channelsCount} ช่องทาง** (แยก Read-Only และ Staff Only ให้เสร็จสรรพ)`, inline: false },
          { name: '👋 ระบบต้อนรับ (Welcome)', value: result.welcomeChannel ? `พร้อมส่งการ์ดต้อนรับที่ <#${result.welcomeChannel.id}>` : 'ไม่ได้สร้าง', inline: true },
          { name: '✅ ระบบยืนยันตัวตน (Verify)', value: result.verifyChannel ? `ส่งปุ่มกดรับยศไปที่ <#${result.verifyChannel.id}> แล้ว` : 'ไม่ได้สร้าง', inline: true },
          { name: '📋 ระบบบันทึก (Mod Logs)', value: result.logChannel ? `พร้อมบันทึกที่ <#${result.logChannel.id}>` : 'ไม่ได้สร้าง', inline: true }
        )
        .setColor('#57F287')
        .setFooter({ text: 'Devplus Full Auto Suite • ปรับแต่งเพิ่มเติมได้ที่ Web Dashboard' })
        .setTimestamp();

      if (result.statsCreated) {
        embed.addFields({
          name: '📊 สถิติเซิร์ฟเวอร์ (Stats)',
          value: 'สร้างห้องเสียงนับจำนวนสมาชิก, คนออนไลน์ และบอทไว้ด้านบนสุดของเซิร์ฟเวอร์เรียบร้อย!',
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });
      logModAction(interaction.guild.id, interaction.user.id, interaction.user.id, 'auto_setup', `Executed Full Auto Setup with theme ${themeKey}`);
    } catch (err) {
      console.error('Error in auto-setup command:', err);
      await interaction.editReply({ content: `❌ เกิดข้อผิดพลาดในการรันระบบ Auto Setup: ${err.message}` });
    }
  },
};
