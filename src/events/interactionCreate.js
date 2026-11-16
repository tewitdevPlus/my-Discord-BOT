const { Events, EmbedBuilder } = require('discord.js');
const { getGuildSettings, logModAction } = require('../database');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // === Slash Commands ===
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ คำสั่ง ${interaction.commandName} ผิดพลาด:`, error);
        const reply = { content: '❌ เกิดข้อผิดพลาดในการดำเนินการคำสั่ง', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // === Verify Button ===
    if (interaction.isButton() && interaction.customId === 'verify_button') {
      const settings = getGuildSettings(interaction.guild.id);
      if (!settings || !settings.verify_enabled || !settings.verify_role) {
        return interaction.reply({ content: '❌ ระบบ Verify ยังไม่ได้ตั้งค่า', ephemeral: true });
      }

      const role = interaction.guild.roles.cache.get(settings.verify_role);
      if (!role) {
        return interaction.reply({ content: '❌ ไม่พบ Role ที่ตั้งค่าไว้', ephemeral: true });
      }

      const member = interaction.member;

      if (member.roles.cache.has(role.id)) {
        return interaction.reply({ content: '✅ คุณได้ยืนยันตัวตนแล้ว!', ephemeral: true });
      }

      try {
        await member.roles.add(role);

        const embed = new EmbedBuilder()
          .setTitle('✅ ยืนยันตัวตนสำเร็จ!')
          .setDescription(`ยินดีต้อนรับ <@${member.id}> คุณได้รับ Role **${role.name}** เรียบร้อยแล้ว!`)
          .setColor('#57F287')
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Log
        if (settings.log_enabled && settings.log_channel) {
          const logChannel = interaction.guild.channels.cache.get(settings.log_channel);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setTitle('✅ Verification')
              .setDescription(`<@${member.id}> ยืนยันตัวตนสำเร็จ`)
              .setColor('#57F287')
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }
        }

        logModAction(interaction.guild.id, member.id, 'SYSTEM', 'verify', 'User verified');
      } catch (err) {
        console.error('❌ Verify error:', err);
        await interaction.reply({ content: '❌ เกิดข้อผิดพลาด กรุณาติดต่อแอดมิน', ephemeral: true });
      }
    }
  },
};
