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

// Start Dashboard
startDashboard(client);

// Login
client.login(process.env.BOT_TOKEN);
