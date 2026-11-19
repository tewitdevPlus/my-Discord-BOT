const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { ensureGuild, updateGuildSettings } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-autorole')
    .setDescription('🎭 ตั้งค่าระบบแจกยศอัตโนมัติเมื่อสมาชิกใหม่เข้าเซิร์ฟเวอร์ (Auto Role)')
    .addRoleOption(opt => opt
      .setName('role')
      .setDescription('ยศที่จะแจกให้อัตโนมัติเมื่อมีคนเข้าเซิร์ฟ')
      .setRequired(true)
    )
    .addBooleanOption(opt => opt
      .setName('enabled')
      .setDescription('เปิดหรือปิดการใช้งาน Auto Role')
      .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const enabled = interaction.options.getBoolean('enabled') ?? true;

    ensureGuild(interaction.guild.id, interaction.guild.name);

    // ตรวจสอบระดับความสูงของยศบอทกับยศเป้าหมาย
    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: `⚠️ บอทไม่สามารถแจกยศ <@&${role.id}> ได้ เนื่องจากยศนี้อยู่สูงกว่าหรือเท่ากับยศของบอท กรุณาลากยศของบอทให้อยู่สูงกว่ายศนี้ใน Server Settings > Roles`,
        ephemeral: true
      });
    }

    updateGuildSettings(interaction.guild.id, {
      autorole_enabled: enabled ? 1 : 0,
      autorole_id: role.id
    });

    const embed = new EmbedBuilder()
      .setTitle('🎭 ตั้งค่าระบบ Auto Role สำเร็จ!')
      .setDescription(enabled 
        ? `สมาชิกใหม่ทุกคนที่เข้ามาจะได้รับยศ <@&${role.id}> โดยอัตโนมัติทันที!` 
        : `ปิดการใช้งานระบบ Auto Role เรียบร้อยแล้ว`)
      .addFields(
        { name: '🏷️ ยศที่ตั้งค่า', value: `<@&${role.id}>`, inline: true },
        { name: '⚡ สถานะ', value: enabled ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน', inline: true }
      )
      .setColor('#57F287')
      .setFooter({ text: 'Devplus Auto Role System' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
