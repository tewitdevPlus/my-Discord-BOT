const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { logModAction } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke-server')
    .setDescription('⚠️ [เมนูอันตรายขั้นสูงสุด] ลบห้องและยศทั้งหมดในเซิร์ฟเวอร์ (เตือน 3 ชั้น + คำนวณเลข)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // จำกัดให้เฉพาะ Owner ของ Discord Server เท่านั้นที่มีสิทธิ์ใช้คำสั่งนี้
    if (interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: '⛔ **ปฏิเสธคำขอ:** คำสั่งนี้เป็นเมนูอันตรายสูงสุด อนุญาตให้เฉพาะ **เจ้าของเซิร์ฟเวอร์ (Server Owner)** ตัวจริงเป็นผู้สั่งการเท่านั้น!',
        ephemeral: true
      });
    }

    // === ชั้นที่ 1: คำเตือนระดับที่ 1 ===
    const embed1 = new EmbedBuilder()
      .setTitle('⚠️ [คำเตือนชั้นที่ 1 / 3] เมนูอันตรายขั้นสูงสุด (PURGE ALL)')
      .setDescription(
        'คุณกำลังจะเปิดใช้งานระบบ **ล้างเซิร์ฟเวอร์ (Nuke Server)**!\n\n' +
        '🚨 **สิ่งที่จะเกิดขึ้นหากดำเนินการต่อ:**\n' +
        '• ห้องและหมวดหมู่ทั้งหมดในเซิร์ฟเวอร์จะถูก **ลบถาวร** (ไม่สามารถกู้คืนได้)\n' +
        '• ยศ (Roles) ทั้งหมดที่บอทมีสิทธิ์ลบจะถูก **ลบถาวร**\n\n' +
        'คุณแน่ใจจริงหรือไม่ว่าจะดำเนินการต่อ?'
      )
      .setColor('#FFA500')
      .setFooter({ text: 'ชั้นที่ 1 จาก 3 • มีเวลาตัดสินใจ 60 วินาที' })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('nuke_confirm_1')
        .setLabel('⚠️ ฉันเข้าใจความเสี่ยง ยืนยันไปชั้นที่ 2')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('nuke_cancel_1')
        .setLabel('❌ ยกเลิกเดี๋ยวนี้')
        .setStyle(ButtonStyle.Secondary)
    );

    const replyMsg = await interaction.reply({
      embeds: [embed1],
      components: [row1],
      ephemeral: true,
      fetchReply: true
    });

    // ตัวดักฟังการกดยืนยันชั้นที่ 1
    const filter = i => i.user.id === interaction.user.id;
    const collector1 = replyMsg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector1.on('collect', async i1 => {
      if (i1.customId === 'nuke_cancel_1') {
        return i1.update({
          content: '✅ ยกเลิกการล้างเซิร์ฟเวอร์เรียบร้อย ปลอดภัย 100%',
          embeds: [],
          components: []
        });
      }

      // === ชั้นที่ 2: คำเตือนระดับที่ 2 (เตือนซ้ำแบบรุนแรง) ===
      const embed2 = new EmbedBuilder()
        .setTitle('🚨 [คำเตือนชั้นที่ 2 / 3] ยืนยันครั้งสุดท้ายก่อนเข้าสู่ระบบปลดล็อก!')
        .setDescription(
          '🔥 **คำเตือนครั้งสุดท้าย:**\n' +
          'การกระทำนี้จะ **ลบข้อมูล โครงสร้าง แชท และประวัติทั้งหมดทิ้งทันที**\n' +
          'หากคุณไม่ได้ตั้งใจ หรือคิดว่าอาจจะเสียดายในภายหลัง **กรุณากดยกเลิกตอนนี้**\n\n' +
          'หากคุณยังยืนยันที่จะทำต่อ กดปุ่มด้านล่างเพื่อแก้โจทย์คำนวณรหัสลับในชั้นที่ 3'
        )
        .setColor('#ED4245')
        .setFooter({ text: 'ชั้นที่ 2 จาก 3 • ระบบความปลอดภัยเซิร์ฟเวอร์' })
        .setTimestamp();

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('nuke_confirm_2')
          .setLabel('🔥 ฉันยังยืนยัน (เข้าสู่ชั้นที่ 3: คำนวณรหัส)')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('nuke_cancel_2')
          .setLabel('🛡️ เปลี่ยนใจแล้ว ยกเลิก')
          .setStyle(ButtonStyle.Success)
      );

      await i1.update({ embeds: [embed2], components: [row2] });

      const collector2 = replyMsg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

      collector2.on('collect', async i2 => {
        if (i2.customId === 'nuke_cancel_2') {
          return i2.update({
            content: '✅ ยกเลิกการล้างเซิร์ฟเวอร์เรียบร้อย เซิร์ฟเวอร์ของคุณยังคงปลอดภัย',
            embeds: [],
            components: []
          });
        }

        // === ชั้นที่ 3: คำนวณโจทย์คณิตศาสตร์สุ่ม (Math Challenge Modal) ===
        const num1 = Math.floor(Math.random() * 80) + 20; // 20 - 99
        const num2 = Math.floor(Math.random() * 80) + 10; // 10 - 89
        const correctAnswer = num1 + num2;

        const modal = new ModalBuilder()
          .setCustomId(`nuke_modal_${correctAnswer}`)
          .setTitle('🧮 ชั้นที่ 3: แก้โจทย์เลขเพื่อยืนยันลบ');

        const mathInput = new TextInputBuilder()
          .setCustomId('math_answer')
          .setLabel(`จงคำนวณ: ${num1} + ${num2} เท่ากับเท่าใด?`)
          .setPlaceholder('ใส่คำตอบตัวเลขที่ถูกต้องที่นี่')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(6);

        const firstActionRow = new ActionRowBuilder().addComponents(mathInput);
        modal.addComponents(firstActionRow);

        await i2.showModal(modal);

        // ดักจับการส่ง Modal
        try {
          const modalSubmit = await i2.awaitModalSubmit({
            filter: m => m.customId.startsWith('nuke_modal_') && m.user.id === interaction.user.id,
            time: 60000
          });

          const userAnswer = parseInt(modalSubmit.fields.getTextInputValue('math_answer').trim());

          if (userAnswer !== correctAnswer) {
            return modalSubmit.reply({
              content: `❌ **คำนวณผิด!** (คำตอบที่ถูกต้องคือ ${correctAnswer}) ระบบยกเลิกคำสั่งล้างเซิร์ฟเวอร์ทันทีเพื่อความปลอดภัย!`,
              ephemeral: true
            });
          }

          // === เริ่มกระบวนการลบทุกอย่างในเซิร์ฟเวอร์ ===
          await modalSubmit.reply({
            content: '☣️ **รหัสถูกต้อง! เริ่มต้นกระบวนการล้างเซิร์ฟเวอร์ (Nuking Server)...**',
            ephemeral: true
          });

          logModAction(interaction.guild.id, interaction.user.id, interaction.user.id, 'nuke_server', 'Owner executed full server purge');

          const guild = interaction.guild;

          // 1. ลบ Roles ทั้งหมด (ยกเว้น @everyone และ Role ที่สูงกว่าบอท)
          const botMember = guild.members.me;
          const roles = Array.from(guild.roles.cache.values());
          for (const role of roles) {
            if (role.id === guild.id) continue; // ข้าม @everyone
            if (role.managed) continue; // ข้าม Role ที่ระบบบอทสร้างอัตโนมัติ
            if (botMember && role.position >= botMember.roles.highest.position) continue; // ข้าม Role ที่สูงกว่าบอท

            try {
              await role.delete('Nuke Server Authorization Passed');
            } catch (err) {
              console.warn(`Failed to delete role ${role.name}:`, err.message);
            }
          }

          // 2. ลบ Channels ทั้งหมด (เก็บไว้ 1 ห้องสำหรับแจ้งสถานะ)
          let finalNoticeChannel = null;
          try {
            finalNoticeChannel = await guild.channels.create({
              name: '🧹┃server-reset',
              reason: 'Nuke complete channel'
            });
          } catch (e) {}

          const channels = Array.from(guild.channels.cache.values());
          for (const ch of channels) {
            if (finalNoticeChannel && ch.id === finalNoticeChannel.id) continue;
            try {
              await ch.delete('Nuke Server Authorization Passed');
            } catch (err) {
              console.warn(`Failed to delete channel ${ch.name}:`, err.message);
            }
          }

          if (finalNoticeChannel) {
            const finalEmbed = new EmbedBuilder()
              .setTitle('🧹 ล้างเซิร์ฟเวอร์เรียบร้อย (Server Cleared)')
              .setDescription(
                'ห้องและยศทั้งหมดได้รับการรีเซ็ตเรียบร้อยแล้วโดยคำสั่งของเจ้าของเซิร์ฟเวอร์\n\n' +
                '💡 **คุณสามารถเริ่มต้นสร้างระบบใหม่ได้อย่างง่ายดาย:**\n' +
                '• พิมพ์ `/setup-security` เพื่อติดตั้งระบบรักษาความปลอดภัย 7 ระดับใหม่ทันที\n' +
                '• พิมพ์ `/auto-setup` เพื่อสร้างห้องและยศธีมเกมมิ่ง/คอมมูนิตี้แบบรวดเร็ว'
              )
              .setColor('#5865F2')
              .setFooter({ text: 'Devplus Reset Engine' })
              .setTimestamp();

            await finalNoticeChannel.send({ embeds: [finalEmbed] }).catch(() => {});
          }

        } catch (modalErr) {
          // หมดเวลาหรือปิด modal
        }
      });
    });
  },
};
