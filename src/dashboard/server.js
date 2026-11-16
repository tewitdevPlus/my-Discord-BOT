const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);
const apiRoutes = require('./routes/api');

function startDashboard(client) {
  const app = express();
  const PORT = process.env.DASHBOARD_PORT || 3000;

  // View Engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Middleware
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session
  app.use(session({
    store: new SQLiteStore({ dir: path.join(__dirname, '..', '..', 'data'), db: 'sessions.db' }),
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
  }));

  // Passport
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds'],
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Make client available to routes
  app.use((req, res, next) => {
    req.client = client;
    res.locals.user = req.user || null;
    next();
  });

  // Auth middleware
  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
  }

  // === Auth Routes ===
  app.get('/auth/login', passport.authenticate('discord'));

  app.get('/auth/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard')
  );

  app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
  });

  // === Pages ===
  app.get('/', (req, res) => {
    res.render('index', {
      botName: client.user?.username || 'Discord Bot',
      botAvatar: client.user?.displayAvatarURL({ size: 128 }) || '',
      serverCount: client.guilds.cache.size,
      userCount: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
    });
  });

  app.get('/dashboard', isAuthenticated, (req, res) => {
    // Filter guilds where user has MANAGE_GUILD permission
    const userGuilds = req.user.guilds.filter(g =>
      (parseInt(g.permissions) & 0x20) === 0x20 || // MANAGE_GUILD
      (parseInt(g.permissions) & 0x8) === 0x8       // ADMINISTRATOR
    );

    const mutualGuilds = userGuilds.map(g => ({
      ...g,
      botIn: client.guilds.cache.has(g.id),
      iconURL: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
    }));

    res.render('dashboard', { guilds: mutualGuilds });
  });

  app.get('/dashboard/:guildId', isAuthenticated, (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.redirect('/dashboard');

    // Check permission
    const userGuild = req.user.guilds.find(g => g.id === req.params.guildId);
    if (!userGuild || !((parseInt(userGuild.permissions) & 0x20) === 0x20 || (parseInt(userGuild.permissions) & 0x8) === 0x8)) {
      return res.redirect('/dashboard');
    }

    const db = require('../database');
    const settings = db.ensureGuild(guild.id, guild.name);
    const stats = db.getGuildStats(guild.id);

    res.render('guild', {
      guild: {
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL({ size: 128 }),
        memberCount: guild.memberCount,
        channels: guild.channels.cache
          .filter(c => c.type === 0) // Text channels
          .map(c => ({ id: c.id, name: c.name })),
        roles: guild.roles.cache
          .filter(r => r.id !== guild.id && !r.managed)
          .sort((a, b) => b.position - a.position)
          .map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
      },
      settings,
      stats,
    });
  });

  // === API Routes ===
  app.use('/api', isAuthenticated, apiRoutes);

  app.listen(PORT, () => {
    console.log(`🌐 Dashboard พร้อมใช้งาน: http://localhost:${PORT}`);
  });
}

module.exports = startDashboard;
