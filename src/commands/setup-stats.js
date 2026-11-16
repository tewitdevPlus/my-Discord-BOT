const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { setupServerStats, updateServerStats } = require('../stats-manager');
const { ensureGuild } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-stats')
    .setDescription('📊 ติดตั้งระบบนับจำนวนสมาชิก, คนออนไลน์ และยศบนห้องเสียงอัตโนมัติ')
    .addRoleOption(opt => opt
      .setName('role')
      .setDescription('ยศพิเศษที่ต้องการนับจำนวน (เช่น ยศ VIP, แอดมิน)')
      .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply();
    ensureGuild(interaction.guild.id, interaction.guild.name);

    const role = interaction.options.getRole('role');

    try {
      const res = await setupServerStats(interaction.guild, role?.id);

      const embed = new EmbedBuilder()
        .setTitle('📊 ติดตั้ง Server Stats สำเร็จ!')
        .setDescription('บอทได้สร้างห้องนับสถิติบนสุดของเซิร์ฟเวอร์เรียบร้อยแล้ว:')
        .addFields(
          { name: '👥 สมาชิกทั้งหมด', value: `<#${res.allCh.id}>`, inline: true },
          { name: '🟢 ออนไลน์', value: `<#${res.onlineCh.id}>`, inline: true },
          { name: '🤖 บอท', value: `<#${res.botCh.id}>`, inline: true }
        )
        .setColor('#5865F2')
        .setFooter({ text: 'ระบบจะอัปเดตสถิติอัตโนมัติเมื่อมีคนเข้า-ออก หรือเปลี่ยนสถานะ' })
        .setTimestamp();

      if (res.roleCh && role) {
        embed.addFields({ name: `👑 ยศ ${role.name}`, value: `<#${res.roleCh.id}>`, inline: true });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: `❌ เกิดข้อผิดพลาด: ${err.message}` });
    }
  },
};
