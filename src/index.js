require('dotenv').config();
const { createBot } = require('./bot');
const { ensureGuild } = require('./database');
const startDashboard = require('./dashboard/server');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const client = createBot();

// Ensure all guilds are in DB when bot starts
client.once('ready', () => {
  client.guilds.cache.forEach(guild => {
    ensureGuild(guild.id, guild.name);
  });
});

// ดักจับการปิดตัวของ Server (เช่น Render Restart/Spin down) ป้องกันข้อมูลหาย
function safeShutdown(signal) {
  console.log(`[SHUTDOWN] ได้รับสัญญาณ ${signal} กำลังบันทึก Database ก่อนปิดตัว...`);
  try {
    const { checkpointDatabase } = require('./database');
    checkpointDatabase();
    console.log('[SHUTDOWN] บันทึกข้อมูลและปิดระบบอย่างปลอดภัยเรียบร้อย');
  } catch (err) {
    console.error('[SHUTDOWN ERROR]:', err);
  }
  process.exit(0);
}

process.on('SIGINT', () => safeShutdown('SIGINT'));
process.on('SIGTERM', () => safeShutdown('SIGTERM'));

// Start Dashboard
startDashboard(client);

// Login
client.login(process.env.BOT_TOKEN);
