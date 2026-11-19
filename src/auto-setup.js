const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensureGuild, updateGuildSettings, logModAction } = require('./database');
const { setupServerStats } = require('./stats-manager');

const THEMES = {
  gaming: {
    name: '🎮 เกมมิ่ง & ตี้เกม (Gaming Hub)',
    roles: [
      { name: '👑 Owner / เจ้าของ', color: '#E74C3C', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ Admin / ดูแลระบบ', color: '#E67E22', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers] },
      { name: '⚔️ Moderator', color: '#F1C40F', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers] },
      { name: '💎 VIP / สปอนเซอร์', color: '#9B59B6', hoist: true, mentionable: true },
      { name: '🎮 Gamer / สมาชิก', color: '#2ECC71', hoist: true, mentionable: false },
      { name: '🤖 Bot', color: '#3498DB', hoist: true, mentionable: false },
      { name: '🔒 Unverified', color: '#95A5A6', hoist: false, mentionable: false }
    ],
    verifiedRoleName: '🎮 Gamer / สมาชิก',
    categories: [
      {
        name: '📌- - ข้อมูล & กฎระเบียบ - -📌',
        channels: [
          { name: '👋┃ยินดีต้อนรับ', type: ChannelType.GuildText, isWelcome: true, readOnly: true },
          { name: '📜┃กฎเซิร์ฟเวอร์', type: ChannelType.GuildText, readOnly: true, defaultContent: '📜 **กฎระเบียบของเซิร์ฟเวอร์**\n1. สุภาพและให้เกียรติซึ่งกันและกัน\n2. ห้ามสแปมข้อความหรือส่งลิงก์อันตราย\n3. ห้ามโฆษณาโดยไม่ได้รับอนุญาต\n4. ปฏิบัติตามคำแนะนำของ Staff อย่างเคร่งครัด' },
          { name: '📢┃ประกาศ', type: ChannelType.GuildText, readOnly: true },
          { name: '✅┃ยืนยันตัวตน', type: ChannelType.GuildText, isVerify: true, readOnly: true }
        ]
      },
      {
        name: '🎮- - พื้นที่พูดคุย & เล่นเกม - -🎮',
        channels: [
          { name: '💬┃แชทเกมเมอร์', type: ChannelType.GuildText },
          { name: '🎯┃หาเพื่อนเล่นเกม', type: ChannelType.GuildText },
          { name: '🔥┃คลิปไฮไลท์-มีม', type: ChannelType.GuildText },
          { name: '🤖┃คำสั่งบอท', type: ChannelType.GuildText }
        ]
      },
      {
        name: '🔊- - ห้องเสียงเกมมิ่ง - -🔊',
        channels: [
          { name: '🎮┃Squad Room 1 (4 คน)', type: ChannelType.GuildVoice, userLimit: 4 },
          { name: '🎮┃Squad Room 2 (5 คน)', type: ChannelType.GuildVoice, userLimit: 5 },
          { name: '👥┃Duo Room (2 คน)', type: ChannelType.GuildVoice, userLimit: 2 },
          { name: '🔊┃ห้องพูดคุยทั่วไป', type: ChannelType.GuildVoice },
          { name: '🎵┃Music Lounge', type: ChannelType.GuildVoice },
          { name: '🌙┃AFK', type: ChannelType.GuildVoice }
        ]
      },
      {
        name: '🛡️- - ห้องเจ้าหน้าที่ STAFF - -🛡️',
        staffOnly: true,
        channels: [
          { name: '💬┃staff-chat', type: ChannelType.GuildText },
          { name: '📋┃bot-logs', type: ChannelType.GuildText, isLog: true }
        ]
      }
    ]
  },
  community: {
    name: '🌟 คอมมูนิตี้มาตรฐาน (Standard Community)',
    roles: [
      { name: '👑 ผู้ก่อตั้ง / Owner', color: '#E74C3C', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ แอดมิน / Admin', color: '#E67E22', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers] },
      { name: '👮 เจ้าหน้าที่ / Moderator', color: '#F1C40F', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages] },
      { name: '✨ สมาชิกคนพิเศษ / VIP', color: '#E91E63', hoist: true, mentionable: true },
      { name: '👥 สมาชิก / Member', color: '#2ECC71', hoist: true, mentionable: false },
      { name: '🤖 Bot', color: '#3498DB', hoist: true, mentionable: false },
      { name: '🔒 Unverified', color: '#95A5A6', hoist: false, mentionable: false }
    ],
    verifiedRoleName: '👥 สมาชิก / Member',
    categories: [
      {
        name: '✦- - 📌 ข้อมูลเซิร์ฟเวอร์ - -✦',
        channels: [
          { name: '👋┃welcome-ต้อนรับ', type: ChannelType.GuildText, isWelcome: true, readOnly: true },
          { name: '📜┃rules-กฎระเบียบ', type: ChannelType.GuildText, readOnly: true, defaultContent: '📜 **กฎระเบียบประจำเซิร์ฟเวอร์**\n1. โปรดใช้คำสุภาพในการสนทนา\n2. ห้ามก่อความวุ่นวาย ป่วน หรือด่าทอผู้อื่น\n3. ห้ามส่งภาพหรือลิงก์ที่ไม่เหมาะสม\n4. มีปัญหาติดต่อ Staff ได้ทันที' },
          { name: '📢┃announcements', type: ChannelType.GuildText, readOnly: true },
          { name: '✅┃verify-ยืนยันตัวตน', type: ChannelType.GuildText, isVerify: true, readOnly: true }
        ]
      },
      {
        name: '✦- - 💬 คอมมูนิตี้ - -✦',
        channels: [
          { name: '💬┃พูดคุยทั่วไป', type: ChannelType.GuildText },
          { name: '📷┃รูปภาพและมีม', type: ChannelType.GuildText },
          { name: '🤖┃คำสั่งบอท', type: ChannelType.GuildText },
          { name: '💡┃เสนอแนะ-suggestion', type: ChannelType.GuildText }
        ]
      },
      {
        name: '✦- - 🔊 ห้องพูดคุย - -✦',
        channels: [
          { name: '🔊┃ห้องนั่งเล่น 1', type: ChannelType.GuildVoice },
          { name: '🔊┃ห้องนั่งเล่น 2', type: ChannelType.GuildVoice },
          { name: '🎵┃ฟังเพลง', type: ChannelType.GuildVoice },
          { name: '🌙┃AFK-ไม่อยู่', type: ChannelType.GuildVoice }
        ]
      },
      {
        name: '✦- - 🛡️ เจ้าหน้าที่ - -✦',
        staffOnly: true,
        channels: [
          { name: '💬┃staff-chat', type: ChannelType.GuildText },
          { name: '📋┃mod-logs', type: ChannelType.GuildText, isLog: true }
        ]
      }
    ]
  },
  aesthetic: {
    name: '✨ มินิมอล & คาเฟ่ (Aesthetic & Chill)',
    roles: [
      { name: '👑 ˖˚ Mastermind', color: '#FF7675', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.Administrator] },
      { name: '🛡️ ˖˚ Guardian', color: '#FAB1A0', hoist: true, mentionable: true, permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages] },
      { name: '🌷 ˖˚ Lovely Supporter', color: '#FD79A8', hoist: true, mentionable: true },
      { name: '☕ ˖˚ Resident (สมาชิก)', color: '#55EFC4', hoist: true, mentionable: false },
      { name: '🤖 ˖˚ Helper Bot', color: '#74B9FF', hoist: true, mentionable: false },
      { name: '🔒 ˖˚ Unverified', color: '#DFE6E9', hoist: false, mentionable: false }
    ],
    verifiedRoleName: '☕ ˖˚ Resident (สมาชิก)',
    categories: [
      {
        name: '─── ･ ｡ﾟ☆: *. 📜 ข้อมูล .* :☆ﾟ. ───',
        channels: [
          { name: '🌱・welcome', type: ChannelType.GuildText, isWelcome: true, readOnly: true },
          { name: '📖・rules', type: ChannelType.GuildText, readOnly: true, defaultContent: '📖 **Welcome to our chill space**\n1. Be kind, warm and respectful to each other.\n2. No spam or promotional links without permission.\n3. Keep conversations peaceful and chill.' },
          { name: '💌・announcements', type: ChannelType.GuildText, readOnly: true },
          { name: '🩰・verify', type: ChannelType.GuildText, isVerify: true, readOnly: true }
        ]
      },
      {
        name: '─── ･ ｡ﾟ☆: *. ☕ พื้นที่พักผ่อน .* :☆ﾟ. ───',
        channels: [
          { name: '☕・main-chat', type: ChannelType.GuildText },
          { name: '🎨・art-and-media', type: ChannelType.GuildText },
          { name: '💭・qotd-คำถามประจำวัน', type: ChannelType.GuildText },
          { name: '🤖・bot-zone', type: ChannelType.GuildText }
        ]
      },
      {
        name: '─── ･ ｡ﾟ☆: *. ☁️ คาเฟ่เสียง .* :☆ﾟ. ───',
        channels: [
          { name: '☁️・cafe-lounge', type: ChannelType.GuildVoice },
          { name: '🌿・study-and-work', type: ChannelType.GuildVoice },
          { name: '🎧・music-chill', type: ChannelType.GuildVoice },
          { name: '🌙・sleep-afk', type: ChannelType.GuildVoice }
        ]
      },
      {
        name: '─── ･ ｡ﾟ☆: *. 🛡️ STAFF .* :☆ﾟ. ───',
        staffOnly: true,
        channels: [
          { name: '💬・staff-lounge', type: ChannelType.GuildText },
          { name: '📋・audit-logs', type: ChannelType.GuildText, isLog: true }
        ]
      }
    ]
  }
};

async function executeFullAutoSetup(guild, themeKey = 'gaming', options = { withStats: true }) {
  const theme = THEMES[themeKey] || THEMES.gaming;
  ensureGuild(guild.id, guild.name);

  const everyoneRole = guild.roles.everyone;
  const createdRoles = {};

  // 1. สร้าง Roles ที่จำเป็น
  for (const r of theme.roles) {
    try {
      // ตรวจสอบว่ามียศนี้อยู่แล้วหรือยัง
      let existing = guild.roles.cache.find(role => role.name === r.name);
      if (!existing) {
        existing = await guild.roles.create({
          name: r.name,
          color: r.color,
          hoist: r.hoist ?? true,
          mentionable: r.mentionable ?? false,
          permissions: r.permissions || []
        });
      }
      createdRoles[r.name] = existing;
    } catch (err) {
      console.warn(`Could not create role ${r.name}:`, err.message);
    }
  }

  const memberRole = createdRoles[theme.verifiedRoleName] || Object.values(createdRoles)[0];
  const adminRole = createdRoles[theme.roles[1]?.name] || createdRoles[theme.roles[0]?.name];

  let welcomeChannel = null;
  let verifyChannel = null;
  let logChannel = null;
  let totalChannelsCount = 0;

  // 2. สร้าง Categories และ Channels พร้อม Permissions
  for (const catData of theme.categories) {
    const permissionOverwrites = [];

    if (catData.staffOnly) {
      permissionOverwrites.push({
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.ViewChannel]
      });
      if (adminRole) {
        permissionOverwrites.push({
          id: adminRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        });
      }
    }

    const category = await guild.channels.create({
      name: catData.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites
    });
    totalChannelsCount++;

    for (const chData of catData.channels) {
      const channelOverwrites = [];

      if (chData.readOnly) {
        channelOverwrites.push({
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions]
        });
      }

      const chOptions = {
        name: chData.name,
        type: chData.type,
        parent: category.id,
        permissionOverwrites: channelOverwrites
      };

      if (chData.userLimit) {
        chOptions.userLimit = chData.userLimit;
      }

      const channel = await guild.channels.create(chOptions);
      totalChannelsCount++;

      if (chData.isWelcome) welcomeChannel = channel;
      if (chData.isVerify) verifyChannel = channel;
      if (chData.isLog) logChannel = channel;

      // ส่งเนื้อหาเบื้องต้นถ้ามี
      if (chData.defaultContent) {
        await channel.send(chData.defaultContent).catch(() => {});
      }
    }
  }

  // 3. ผูกระบบอัตโนมัติเข้า Database ทันที
  const dbUpdates = {};

  // Welcome System
  if (welcomeChannel) {
    dbUpdates.welcome_enabled = 1;
    dbUpdates.welcome_channel = welcomeChannel.id;
    dbUpdates.welcome_message = '🎉 ยินดีต้อนรับ {user} เข้าสู่ **{server}**! ยินดีที่ได้รู้จักครับ ✨ (สมาชิกคนที่ {membercount})';
    dbUpdates.welcome_color = '#5865F2';
  }

  // Auto Role (ให้ยศสมาชิกตอนเข้าเซิร์ฟทันทีถ้าไม่มี verify หรือจะใช้คู่กัน)
  if (memberRole) {
    dbUpdates.autorole_enabled = 1;
    dbUpdates.autorole_id = memberRole.id;
  }

  // Verify System
  if (verifyChannel && memberRole) {
    dbUpdates.verify_enabled = 1;
    dbUpdates.verify_channel = verifyChannel.id;
    dbUpdates.verify_role = memberRole.id;
    dbUpdates.verify_message = '🛡️ **ระบบยืนยันตัวตน | Verification System**\nคลิกปุ่มด้านล่างเพื่อรับยศและเข้าใช้งานเซิร์ฟเวอร์เต็มรูปแบบ!';

    // ส่ง Verify Embed + Button ไปที่ห้อง Verify ทันที
    const verifyEmbed = new EmbedBuilder()
      .setTitle('🛡️ ยืนยันตัวตน | Verification')
      .setDescription('ยินดีต้อนรับเข้าสู่เซิร์ฟเวอร์!\nกรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตนและรับยศเข้าห้องพูดคุยทั้งหมด ✅')
      .setColor('#57F287')
      .setFooter({ text: guild.name, iconURL: guild.iconURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅ ยืนยันตัวตน (รับยศ)')
        .setStyle(ButtonStyle.Success)
    );

    await verifyChannel.send({ embeds: [verifyEmbed], components: [row] }).catch(() => {});
  }

  // Log System
  if (logChannel) {
    dbUpdates.log_enabled = 1;
    dbUpdates.log_channel = logChannel.id;
  }

  updateGuildSettings(guild.id, dbUpdates);

  // 4. ติดตั้ง Server Stats ถ้าเลือกเปิด
  let statsCreated = null;
  if (options.withStats) {
    try {
      statsCreated = await setupServerStats(guild, memberRole ? memberRole.id : null);
    } catch (e) {
      console.warn('Auto Stats Setup Warning:', e.message);
    }
  }

  return {
    themeName: theme.name,
    rolesCount: Object.keys(createdRoles).length,
    channelsCount: totalChannelsCount,
    welcomeChannel,
    verifyChannel,
    logChannel,
    memberRole,
    statsCreated
  };
}

module.exports = {
  THEMES,
  executeFullAutoSetup
};
