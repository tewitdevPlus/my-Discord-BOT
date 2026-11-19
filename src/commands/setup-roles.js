const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { THEMES } = require('../auto-setup');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('👑 สร้างและตกแต่งยศของเซิร์ฟเวอร์แบบอัตโนมัติ (แยกเฉพาะระบบยศ)')
    .addStringOption(opt => opt
      .setName('theme')
      .setDescription('เลือกธีมชุดยศที่ต้องการสร้าง')
      .setRequired(true)
      .addChoices(
        { name: '🎮 เกมมิ่ง & ตี้เกม (Owner, Admin, Mod, VIP, Gamer, Bot)', value: 'gaming' },
        { name: '🌟 คอมมูนิตี้มาตรฐาน (Owner, Admin, Mod, VIP, Member, Bot)', value: 'community' },
        { name: '✨ มินิมอล & คาเฟ่ (Mastermind, Guardian, Supporter, Resident)', value: 'aesthetic' }
      )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const themeKey = interaction.options.getString('theme');
    const theme = THEMES[themeKey] || THEMES.gaming;

    try {
      const createdRoles = [];
      const skippedRoles = [];

      for (const r of theme.roles) {
        // ตรวจสอบว่ามียศนี้อยู่แล้วหรือยัง
        const existing = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === r.name.toLowerCase());
        if (existing) {
          skippedRoles.push(existing);
          continue;
        }

        try {
          const newRole = await interaction.guild.roles.create({
            name: r.name,
            color: r.color,
            hoist: r.hoist ?? true,
            mentionable: r.mentionable ?? false,
            permissions: r.permissions || []
          });
          createdRoles.push(newRole);
        } catch (roleErr) {
          console.warn(`Could not create role ${r.name}:`, roleErr.message);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('👑 สร้างชุดยศอัตโนมัติสำเร็จ!')
        .setDescription(`ติดตั้งชุดยศตามธีม **${theme.name}** เรียบร้อยแล้ว`)
        .setColor('#5865F2')
        .addFields(
          { 
            name: `✨ ยศที่สร้างใหม่ (${createdRoles.length})`, 
            value: createdRoles.length > 0 ? createdRoles.map(r => `<@&${r.id}>`).join(' • ') : 'ไม่มี (มียศเหล่านี้อยู่แล้ว)' 
          }
        )
        .setFooter({ text: 'Devplus Role Styler' })
        .setTimestamp();

      if (skippedRoles.length > 0) {
        embed.addFields({
          name: `ℹ️ ยศที่มีอยู่แล้ว (${skippedRoles.length})`,
          value: skippedRoles.map(r => `<@&${r.id}>`).join(' • ')
        });
      }

      await interaction.editReply({ embeds: [embed] });
      logModAction(interaction.guild.id, interaction.user.id, interaction.user.id, 'setup_roles', `Created auto roles for theme ${themeKey}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: `❌ เกิดข้อผิดพลาดในการสร้างยศ: ${err.message}` });
    }
  },
};
