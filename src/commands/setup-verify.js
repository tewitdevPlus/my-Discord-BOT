const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { ensureGuild, updateGuildSettings } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-verify')
    .setDescription('✅ ตั้งค่าระบบยืนยันตัวตน')
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('ห้องสำหรับ Verify')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true))
    .addRoleOption(opt => opt
      .setName('role')
      .setDescription('Role ที่จะให้เมื่อ Verify สำเร็จ')
      .setRequired(true))
    .addStringOption(opt => opt
      .setName('message')
      .setDescription('ข้อความบนหน้า Verify'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const message = interaction.options.getString('message');

    ensureGuild(interaction.guild.id, interaction.guild.name);

    const settings = {
      verify_enabled: 1,
      verify_channel: channel.id,
      verify_role: role.id,
    };
    if (message) settings.verify_message = message;

    updateGuildSettings(interaction.guild.id, settings);

    // Send verify panel to the channel
    const verifyEmbed = new EmbedBuilder()
      .setTitle('✅ ยืนยันตัวตน | Verification')
      .setDescription(message || 'กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตน ✅')
      .setColor('#5865F2')
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_button')
          .setLabel('✅ ยืนยันตัวตน')
          .setStyle(ButtonStyle.Success)
      );

    try {
      await channel.send({ embeds: [verifyEmbed], components: [row] });
    } catch (sendErr) {
      return interaction.editReply({ content: `❌ บอทไม่สามารถส่งข้อความลงในห้อง <#${channel.id}> ได้: กรุณาตรวจสอบว่าบอทมีสิทธิ์ Send Messages / View Channel ในห้องนั้นหรือไม่` });
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ ตั้งค่าระบบ Verify สำเร็จ!')
      .setDescription(`บอทได้ส่งแผงยืนยันตัวตนไปยังห้อง <#${channel.id}> เรียบร้อยแล้ว!`)
      .addFields(
        { name: '📺 ห้อง', value: `<#${channel.id}>`, inline: true },
        { name: '🏷️ Role', value: `<@&${role.id}>`, inline: true }
      )
      .setColor('#57F287')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
