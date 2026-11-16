const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addWarning, getWarnings, clearWarnings, deleteWarning } = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ จัดการคำเตือน')
    .addSubcommand(sub => sub
      .setName('add')
      .setDescription('เพิ่มคำเตือน')
      .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('เหตุผล'))
    )
    .addSubcommand(sub => sub
      .setName('list')
      .setDescription('ดูคำเตือนของผู้ใช้')
      .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('remove')
      .setDescription('ลบคำเตือน')
      .addIntegerOption(opt => opt.setName('id').setDescription('ID คำเตือน').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('clear')
      .setDescription('ล้างคำเตือนทั้งหมดของผู้ใช้')
      .addUserOption(opt => opt.setName('user').setDescription('ผู้ใช้').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'ไม่ระบุเหตุผล';

      addWarning(interaction.guild.id, user.id, interaction.user.id, reason);
      const warnings = getWarnings(interaction.guild.id, user.id);

      const embed = new EmbedBuilder()
        .setTitle('⚠️ เพิ่มคำเตือน')
        .setDescription(`**${user.tag}** ได้รับคำเตือน`)
        .addFields(
          { name: '📝 เหตุผล', value: reason },
          { name: '📊 คำเตือนทั้งหมด', value: `${warnings.length} ครั้ง`, inline: true }
        )
        .setColor('#FEE75C')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'list') {
      const user = interaction.options.getUser('user');
      const warnings = getWarnings(interaction.guild.id, user.id);

      if (warnings.length === 0) {
        return interaction.reply({ content: `✅ **${user.tag}** ไม่มีคำเตือน`, ephemeral: true });
      }

      const warningList = warnings.map((w, i) =>
        `**#${w.id}** — ${w.reason}\n> โดย <@${w.moderator_id}> • <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>`
      ).join('\n\n');

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ คำเตือนของ ${user.tag}`)
        .setDescription(warningList)
        .setColor('#FEE75C')
        .setFooter({ text: `ทั้งหมด ${warnings.length} คำเตือน` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (sub === 'remove') {
      const id = interaction.options.getInteger('id');
      const result = deleteWarning(id, interaction.guild.id);

      if (result.changes === 0) {
        return interaction.reply({ content: '❌ ไม่พบคำเตือน ID นี้', ephemeral: true });
      }

      await interaction.reply({ content: `✅ ลบคำเตือน #${id} สำเร็จ`, ephemeral: true });

    } else if (sub === 'clear') {
      const user = interaction.options.getUser('user');
      const result = clearWarnings(interaction.guild.id, user.id);

      await interaction.reply({ content: `✅ ล้างคำเตือนของ **${user.tag}** ทั้งหมด ${result.changes} รายการ`, ephemeral: true });
    }
  },
};
