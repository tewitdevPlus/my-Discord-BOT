const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { ensureGuild, updateGuildSettings } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-log')
    .setDescription('📋 ตั้งค่าห้อง Log')
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('ห้องสำหรับ Log')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    ensureGuild(interaction.guild.id, interaction.guild.name);
    updateGuildSettings(interaction.guild.id, {
      log_enabled: 1,
      log_channel: channel.id,
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ ตั้งค่าห้อง Log สำเร็จ!')
      .setDescription(`ห้อง Log: <#${channel.id}>`)
      .setColor('#57F287')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
