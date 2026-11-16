const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { ensureGuild, updateGuildSettings } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('👋 ตั้งค่าระบบต้อนรับ')
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('ห้องสำหรับส่งข้อความต้อนรับ')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true))
    .addStringOption(opt => opt
      .setName('message')
      .setDescription('ข้อความต้อนรับ (ใช้ {user}, {username}, {server}, {membercount})'))
    .addStringOption(opt => opt
      .setName('color')
      .setDescription('สี Embed (เช่น #FF5733)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const color = interaction.options.getString('color');

    ensureGuild(interaction.guild.id, interaction.guild.name);

    const settings = {
      welcome_enabled: 1,
      welcome_channel: channel.id,
    };
    if (message) settings.welcome_message = message;
    if (color) settings.welcome_color = color;

    updateGuildSettings(interaction.guild.id, settings);

    const previewMsg = (message || 'ยินดีต้อนรับ {user} เข้าสู่ **{server}**! 🎉')
      .replace(/{user}/g, `<@${interaction.user.id}>`)
      .replace(/{username}/g, interaction.user.username)
      .replace(/{server}/g, interaction.guild.name)
      .replace(/{membercount}/g, interaction.guild.memberCount);

    const embed = new EmbedBuilder()
      .setTitle('✅ ตั้งค่าระบบต้อนรับสำเร็จ!')
      .addFields(
        { name: '📺 ห้อง', value: `<#${channel.id}>`, inline: true },
        { name: '🎨 สี', value: color || '#5865F2', inline: true },
        { name: '💬 ตัวอย่างข้อความ', value: previewMsg }
      )
      .setColor(color || '#5865F2')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
