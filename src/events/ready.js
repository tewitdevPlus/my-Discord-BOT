const { Events } = require('discord.js');
const { ensureGuild } = require('../database');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log(`║  🤖 Bot พร้อมใช้งาน: ${client.user.tag}`);
    console.log(`║  📡 Servers: ${client.guilds.cache.size}`);
    console.log(`║  👥 Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`);
    console.log(`║  🌐 Dashboard: http://localhost:${process.env.DASHBOARD_PORT || 3000}`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    client.user.setActivity('🛡️ Protecting Server', { type: 3 });

    // Periodic Server Stats Updater (every 10 minutes)
    const { updateServerStats } = require('../stats-manager');
    setInterval(() => {
      client.guilds.cache.forEach(guild => {
        updateServerStats(guild).catch(() => {});
      });
    }, 10 * 60 * 1000);
  },
};
