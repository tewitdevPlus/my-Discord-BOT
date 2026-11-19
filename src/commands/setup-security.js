const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { executeRolePermissionSetup } = require('../role-permission-manager');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-security')
    .setDescription('🛡️ ติดตั้งระบบ Role & Permission ความปลอดภัยสูง (7 ระดับสิทธิ์ + ซ่อนห้องตามยศ)')
    .addBooleanOption(opt => opt
      .setName('stats')
      .setDescription('ติดตั้งระบบห้องเสียงนับสถิติ (Server Stats) ด้วยหรือไม่')
      .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const withStats = interaction.options.getBoolean('stats') ?? true;

    try {
      const result = await executeRolePermissionSetup(interaction.guild, { withStats });

      const embed = new EmbedBuilder()
        .setTitle('🛡️ ติดตั้งระบบ Role & Permission สำเร็จ 100%!')
        .setDescription('เซิร์ฟเวอร์ของคุณได้รับการจัดระเบียบสิทธิ์และความปลอดภัยตามมาตรฐานครบถ้วน:')
        .addFields(
          {
            name: '👑 7 ระดับสิทธิ์ (Hierarchy Roles)',
            value: 
              `1. <@&${result.rolesMap.FOUNDER.id}> (สิทธิ์สูงสุด Administrator)\n` +
              `2. <@&${result.rolesMap.ADMIN.id}> (ผู้ดูแลระบบ จัดการห้อง/สมาชิก/เตะ/แบน)\n` +
              `3. <@&${result.rolesMap.STAFF.id}> (ทีมงาน ดูแลสมาชิก/Mute/ลบข้อความ)\n` +
              `4. <@&${result.rolesMap.VIP.id}> (สมาชิกพิเศษ เข้าห้อง VIP Exclusive)\n` +
              `5. <@&${result.rolesMap.BOT.id}> (บอทและระบบอัตโนมัติ)\n` +
              `6. <@&${result.rolesMap.VERIFIED.id}> (สมาชิกยืนยันตัวตน เข้าห้องคุยทั่วไปได้)\n` +
              `7. <@&${result.rolesMap.MEMBER.id}> (สมาชิกใหม่ เห็นเฉพาะห้องต้อนรับ/กฎ/Verify)`,
            inline: false
          },
          {
            name: '🔒 การล็อกและซ่อนห้อง (Security Isolation)',
            value: 
              `• **ห้องทั่วไป**: ซ่อนจาก @everyone และ @Member (มองเห็นเฉพาะ @Verified ขึ้นไป)\n` +
              `• **ห้อง VIP**: อนุญาตเฉพาะ @VIP, @STAFF, @ADMIN, @FOUNDER\n` +
              `• **ห้อง STAFF**: ซ่อนจากสมาชิกทั่วไป อนุญาตเฉพาะทีมงาน\n` +
              `• **ห้อง ADMIN Executive**: ซ่อนจาก Staff อนุญาตเฉพาะ Admin/Founder เท่านั้น`,
            inline: false
          },
          {
            name: '⚡ ระบบ Auto ทำงานทันที',
            value: 
              `• **Auto Role**: แจกยศ <@&${result.rolesMap.MEMBER.id}> ทันทีเมื่อคนเข้าเซิร์ฟ\n` +
              `• **Verify System**: กดยืนยันตัวตนที่ <#${result.verifyChannel?.id}> เพื่อรับยศ <@&${result.rolesMap.VERIFIED.id}>\n` +
              `• **Welcome Card**: ส่งการ์ดต้อนรับที่ <#${result.welcomeChannel?.id}>\n` +
              `• **Logs**: บันทึกเหตุการณ์ที่ <#${result.logChannel?.id}>`,
            inline: false
          }
        )
        .setColor('#2ECC71')
        .setFooter({ text: 'Devplus Security Suite • Role & Permission Management' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      logModAction(interaction.guild.id, interaction.user.id, interaction.user.id, 'setup_security', 'Installed 7-Tier Role & Permission Security System');
    } catch (err) {
      console.error('Setup security error:', err);
      await interaction.editReply({ content: `❌ เกิดข้อผิดพลาดในการติดตั้งระบบรักษาความปลอดภัย: ${err.message}` });
    }
  },
};
