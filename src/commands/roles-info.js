const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles-info')
    .setDescription('👥 ตรวจสอบจำนวนสมาชิกในแต่ละยศของเซิร์ฟเวอร์')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply();
    await interaction.guild.members.fetch();

    const roles = interaction.guild.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    if (roles.size === 0) {
      return interaction.editReply({ content: '❌ เซิร์ฟเวอร์นี้ยังไม่มี Role' });
    }

    const roleLines = roles.map(r => {
      const count = r.members.size;
      return `<@&${r.id}> — **${count}** คน`;
    });

    // Chunk in case of many roles
    const displayList = roleLines.slice(0, 25).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`👥 สถิติจำนวนคนในแต่ละยศ (${interaction.guild.name})`)
      .setDescription(displayList)
      .setColor('#5865F2')
      .setFooter({ text: `มียศทั้งหมด ${roles.size} ยศ` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
