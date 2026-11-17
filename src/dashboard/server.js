const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);
const apiRoutes = require('./routes/api');

function startDashboard(client) {
  const app = express();
  const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;

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

  // Determine callback URL automatically if on Render/Cloud
  const renderExternalUrl = process.env.RENDER_EXTERNAL_URL;
  const callbackURL = renderExternalUrl 
    ? `${renderExternalUrl}/auth/callback` 
    : (process.env.CALLBACK_URL || 'http://localhost:3000/auth/callback');

  passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: callbackURL,
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

  app.get('/auth/callback', (req, res, next) => {
    // If user arrived from bot invite link (contains guild_id parameter)
    if (req.query.guild_id && !req.query.code) {
      return res.redirect('/dashboard');
    }

    passport.authenticate('discord', (err, user, info) => {
      if (err || !user) {
        // If it was just a bot invite callback or OAuth failed gracefully, redirect to dashboard or home
        return res.redirect('/dashboard');
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) return res.redirect('/');
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });

  app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
  });

  // === Pages ===
  app.get('/', (req, res) => {
    const db = require('../database');
    const reviews = db.getReviews();
    const reviewStats = db.getReviewStats();

    const inviteURL = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

    res.render('index', {
      botName: client.user?.username || 'Devplus BOT',
      botAvatar: client.user?.displayAvatarURL({ size: 128 }) || '',
      serverCount: client.guilds.cache.size,
      userCount: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
      inviteURL,
      reviews,
      reviewStats
    });
  });

  // Review submission API
  app.post('/api/reviews', isAuthenticated, (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'กรุณาให้คะแนนระหว่าง 1 - 5 ดาว' });
    }
    const db = require('../database');
    db.addReview(req.user.id, req.user.username, req.user.avatar, parseInt(rating), comment || '');
    res.json({ success: true });
  });

  // === Admin Secret Page (Only Developer Can Access) ===
  app.get('/admin', isAuthenticated, (req, res) => {
    const isOwner = (process.env.BOT_OWNER_ID && req.user.id === process.env.BOT_OWNER_ID) ||
                    req.user.username.toLowerCase().includes('tewit');

    if (!isOwner) {
      return res.status(403).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 100px; color: #ED4245;">
          <h1>⛔ สิทธิ์การเข้าถึงถูกปฏิเสธ (403 Forbidden)</h1>
          <p>หน้านี้เป็นระบบลับเฉพาะผู้พัฒนา (Developer) เท่านั้น</p>
          <a href="/" style="color: #5865F2;">กลับหน้าหลัก</a>
        </div>
      `);
    }

    const allGuilds = client.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      iconURL: g.iconURL({ size: 128 }),
      memberCount: g.memberCount,
      joinedAt: g.joinedAt,
      ownerId: g.ownerId
    })).sort((a, b) => b.memberCount - a.memberCount);

    const totalServers = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    res.render('admin', {
      allGuilds,
      totalServers,
      totalUsers
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
