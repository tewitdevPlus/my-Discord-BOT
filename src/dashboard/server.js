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
  let sessionStore;
  if (process.env.DATABASE_URL) {
    const pgSession = require('connect-pg-simple')(session);
    const { pool } = require('../database');
    sessionStore = new pgSession({
      pool: pool,
      tableName: 'session'
    });
    console.log('🐘 Session ใช้งาน PostgreSQL');
  } else {
    sessionStore = new SQLiteStore({ dir: path.join(__dirname, '..', '..', 'data'), db: 'sessions.db' });
  }

  app.use(session({
    store: sessionStore,
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
    profile.accessToken = accessToken;
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
  app.get('/', async (req, res) => {
    try {
      const db = require('../database');
      const reviews = await db.getReviews();
      const reviewStats = await db.getReviewStats();

      const inviteURL = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

      res.render('index', {
        botName: client.user?.username || 'Devplus BOT',
        botAvatar: client.user?.displayAvatarURL({ size: 128 }) || '',
        serverCount: client.guilds.cache.size,
        userCount: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
        inviteURL,
        reviews: Array.isArray(reviews) ? reviews : [],
        reviewStats: reviewStats || { total: 0, avgRating: 5.0 }
      });
    } catch (err) {
      console.error('Home page error:', err);
      res.render('index', {
        botName: client.user?.username || 'Devplus BOT',
        botAvatar: '',
        serverCount: 0,
        userCount: 0,
        inviteURL: '#',
        reviews: [],
        reviewStats: { total: 0, avgRating: 5.0 }
      });
    }
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

  // Reset all reviews (Owner only)
  app.post('/api/reviews/reset', isAuthenticated, async (req, res) => {
    const isOwner = req.user.username === 'tewitplus_58868' ||
                    (process.env.BOT_OWNER_ID && req.user.id === process.env.BOT_OWNER_ID);
    if (!isOwner) {
      return res.status(403).json({ error: 'เฉพาะเจ้าของบอทเท่านั้นที่รีเซ็ทรีวิวได้' });
    }
    try {
      const db = require('../database');
      await db.clearReviews();
      res.json({ success: true });
    } catch (err) {
      console.error('Reset reviews error:', err);
      res.status(500).json({ error: 'ไม่สามารถรีเซ็ทรีวิวได้' });
    }
  });

  // === Admin Secret Page (Only Developer Can Access) ===
  app.get('/admin', isAuthenticated, (req, res) => {
    const isOwner = req.user.username === 'tewitplus_58868' || 
                    (process.env.BOT_OWNER_ID && req.user.id === process.env.BOT_OWNER_ID);

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

  app.get('/dashboard', isAuthenticated, async (req, res) => {
    // 1. Get guilds from user profile
    let userGuilds = Array.isArray(req.user.guilds) ? req.user.guilds : [];

    // 2. Also include all guilds where the bot is currently in (ensures server never disappears)
    const botGuilds = client.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      permissions: 0x8, // Admin access if bot is present and user is owner
      owner: g.ownerId === req.user.id
    }));

    // Merge bot guilds with user guilds (avoid duplicates)
    const allGuildsMap = new Map();
    for (const g of userGuilds) {
      allGuildsMap.set(g.id, g);
    }
    for (const bg of botGuilds) {
      if (!allGuildsMap.has(bg.id)) {
        allGuildsMap.set(bg.id, bg);
      }
    }

    const mergedList = Array.from(allGuildsMap.values());

    // Filter guilds where user has MANAGE_GUILD (0x20) or ADMIN (0x8) or is guild owner
    const manageableGuilds = mergedList.filter(g =>
      g.owner ||
      (parseInt(g.permissions) & 0x20) === 0x20 ||
      (parseInt(g.permissions) & 0x8) === 0x8
    );

    const mutualGuilds = manageableGuilds.map(g => ({
      ...g,
      botIn: client.guilds.cache.has(g.id),
      iconURL: g.icon ? (g.icon.startsWith('http') ? g.icon : `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`) : null,
    }));

    res.render('dashboard', { guilds: mutualGuilds });
  });

  // Manual refresh guilds route: force Discord re-auth to refresh guilds list without logging out
  app.get('/dashboard-refresh', (req, res, next) => {
    passport.authenticate('discord', {
      prompt: 'none'
    })(req, res, next);
  });

  app.get('/dashboard/:guildId', isAuthenticated, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.redirect('/dashboard');

    // Check permission
    const userGuild = req.user.guilds.find(g => g.id === req.params.guildId);
    if (!userGuild || !((parseInt(userGuild.permissions) & 0x20) === 0x20 || (parseInt(userGuild.permissions) & 0x8) === 0x8)) {
      return res.redirect('/dashboard');
    }

    const db = require('../database');
    const settings = await db.ensureGuild(guild.id, guild.name);
    const stats = await db.getGuildStats(guild.id);

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
