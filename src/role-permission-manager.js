const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensureGuild, updateGuildSettings, logModAction } = require('./database');
const { setupServerStats } = require('./stats-manager');

/**
 * โครงสร้าง Role & Permission มาตรฐานความปลอดภัยสูง
 */
const SECURITY_ROLES = [
  {
    key: 'FOUNDER',
    name: '👑 FOUNDER',
    color: '#E74C3C', // แดง
    hoist: true,
    mentionable: true,
    permissions: [PermissionFlagsBits.Administrator]
  },
  {
    key: 'ADMIN',
    name: '🛡️ ADMIN',
    color: '#E67E22', // ส้ม
    hoist: true,
    mentionable: true,
    permissions: [
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.MuteMembers,
      PermissionFlagsBits.DeafenMembers,
      PermissionFlagsBits.MoveMembers,
      PermissionFlagsBits.ViewAuditLog
    ]
  },
  {
    key: 'STAFF',
    name: '🔧 STAFF',
    color: '#F1C40F', // เหลือง
    hoist: true,
    mentionable: true,
    permissions: [
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.MuteMembers,
      PermissionFlagsBits.DeafenMembers,
      PermissionFlagsBits.MoveMembers
    ]
  },
  {
    key: 'VIP',
    name: '💎 VIP',
    color: '#9B59B6', // ม่วง
    hoist: true,
    mentionable: true,
    permissions: [
      PermissionFlagsBits.ChangeNickname,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks
    ]
  },
  {
    key: 'BOT',
    name: '🤖 Bot',
    color: '#3498DB', // ฟ้า
    hoist: true,
    mentionable: false,
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages
    ]
  },
  {
    key: 'VERIFIED',
    name: '✅ Verified',
    color: '#2ECC71', // เขียว
    hoist: true,
    mentionable: false,
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.AddReactions,
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak,
      PermissionFlagsBits.UseVAD
    ]
  },
  {
    key: 'MEMBER',
    name: '👥 Member',
    color: '#95A5A6', // เทา
    hoist: false,
    mentionable: false,
    permissions: [] // ไม่มีสิทธิ์พิเศษ ได้เฉพาะห้องสาธารณะเริ่มต้น
  }
];

/**
 * ออกแบบโครงสร้าง Category & Channel ตามสิทธิ์ 7 ระดับ
 */
function buildCategoriesConfig(rolesMap, everyoneRole) {
  const founder = rolesMap.FOUNDER;
  const admin = rolesMap.ADMIN;
  const staff = rolesMap.STAFF;
  const vip = rolesMap.VIP;
  const verified = rolesMap.VERIFIED;
  const member = rolesMap.MEMBER;

  return [
    // 1. หมวดหมู่ข้อมูลสาธารณะ (Member & Everyone ดูได้ แต่พิมพ์ไม่ได้)
    {
      name: '📌- - ข้อมูลเซิร์ฟเวอร์ - -📌',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions]
        }
      ],
      channels: [
        {
          name: '👋┃ยินดีต้อนรับ-welcome',
          type: ChannelType.GuildText,
          isWelcome: true,
          overwrites: []
        },
        {
          name: '📜┃กฎระเบียบ-rules',
          type: ChannelType.GuildText,
          defaultContent: '📜 **กฎระเบียบเซิร์ฟเวอร์**\n1. ให้เกียรติซึ่งกันและกัน ไม่ใช้ถ้อยคำหยาบคายรุนแรง\n2. ห้ามสแปมข้อความ ลิงก์อันตราย หรือโปรโมทโดยไม่ได้รับอนุญาต\n3. ปฏิบัติตามคำแนะนำของทีมงาน Staff\n4. ตรวจสอบและกดยืนยันตัวตนที่ห้อง ✅┃ยืนยันตัวตน เพื่อปลดล็อกห้องพูดคุยทั้งหมด',
          overwrites: []
        },
        {
          name: '📢┃ประกาศ-announcements',
          type: ChannelType.GuildText,
          overwrites: []
        },
        {
          name: '✅┃ยืนยันตัวตน-verify',
          type: ChannelType.GuildText,
          isVerify: true,
          overwrites: [
            {
              id: verified.id,
              deny: [PermissionFlagsBits.ViewChannel] // คนที่ verify ผ่านแล้ว ซ่อนห้องนี้ไปเลย ไม่ให้เกะกะ
            }
          ]
        }
      ]
    },

    // 2. หมวดหมู่พูดคุยทั่วไป (ต้อง Verified ขึ้นไปเท่านั้น! ซ่อนจาก @everyone และ Member)
    {
      name: '💬- - พื้นที่สมาชิก (VERIFIED) - -💬',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: member.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: verified.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks]
        }
      ],
      channels: [
        { name: '💬┃พูดคุยทั่วไป', type: ChannelType.GuildText },
        { name: '📷┃รูปภาพและมีม', type: ChannelType.GuildText },
        { name: '🤖┃คำสั่งบอท', type: ChannelType.GuildText },
        { name: '💡┃ข้อเสนอแนะ-feedback', type: ChannelType.GuildText }
      ]
    },

    // 3. หมวดหมู่ห้องเสียง (Verified ขึ้นไป)
    {
      name: '🔊- - ห้องเสียงทั่วไป - -🔊',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
        },
        {
          id: member.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
        },
        {
          id: verified.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.UseVAD]
        }
      ],
      channels: [
        { name: '🔊┃ห้องนั่งเล่น 1', type: ChannelType.GuildVoice },
        { name: '🔊┃ห้องนั่งเล่น 2', type: ChannelType.GuildVoice },
        { name: '👥┃Duo Talk (2 คน)', type: ChannelType.GuildVoice, userLimit: 2 },
        { name: '🎮┃Squad Room (4 คน)', type: ChannelType.GuildVoice, userLimit: 4 },
        { name: '🎵┃ฟังเพลงชิลๆ', type: ChannelType.GuildVoice },
        { name: '🌙┃AFK-ไม่อยู่', type: ChannelType.GuildVoice }
      ]
    },

    // 4. หมวดหมู่ VIP LOUNGE (เฉพาะ VIP, STAFF, ADMIN, FOUNDER)
    {
      name: '💎- - VIP LOUNGE - -💎',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: verified.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: vip.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: staff.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: admin.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        }
      ],
      channels: [
        { name: '💎┃vip-chat', type: ChannelType.GuildText },
        { name: '🎁┃vip-perks-สิทธิพิเศษ', type: ChannelType.GuildText },
        { name: '🔊┃VIP Private Voice', type: ChannelType.GuildVoice }
      ]
    },

    // 5. หมวดหมู่ STAFF & ADMIN (เฉพาะทีมงาน Staff, Admin, Founder)
    {
      name: '🛡️- - STAFF & OPERATIONS - -🛡️',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: verified.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: vip.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: staff.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        },
        {
          id: admin.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        }
      ],
      channels: [
        { name: '💬┃staff-discussion', type: ChannelType.GuildText },
        { name: '🚨┃member-reports', type: ChannelType.GuildText },
        { name: '📋┃bot-logs', type: ChannelType.GuildText, isLog: true },
        { name: '🔊┃Staff Voice Meeting', type: ChannelType.GuildVoice }
      ]
    },

    // 6. หมวดหมู่ ADMIN SECRET (เฉพาะ Admin & Founder เท่านั้น ห้าม Staff เข้า)
    {
      name: '🔒- - ADMIN EXECUTIVE - -🔒',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: staff.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: admin.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        }
      ],
      channels: [
        { name: '👑┃founder-admin-chat', type: ChannelType.GuildText },
        { name: '📊┃audit-management', type: ChannelType.GuildText },
        { name: '🔊┃Executive Lounge', type: ChannelType.GuildVoice }
      ]
    }
  ];
}

/**
 * ฟังก์ชันหลักในการรันระบบจัดการยศและสิทธิ์แบบ 100% Comprehensive
 */
async function executeRolePermissionSetup(guild, options = { withStats: true }) {
  await ensureGuild(guild.id, guild.name);
  const everyoneRole = guild.roles.everyone;

  // 1. ตรวจสอบและสร้าง/อัปเดต Role ทั้ง 7 ระดับ
  const rolesMap = {};

  for (const roleDef of SECURITY_ROLES) {
    let existing = guild.roles.cache.find(r => r.name.toLowerCase() === roleDef.name.toLowerCase());
    if (!existing) {
      existing = await guild.roles.create({
        name: roleDef.name,
        color: roleDef.color,
        hoist: roleDef.hoist,
        mentionable: roleDef.mentionable,
        permissions: roleDef.permissions || []
      });
    } else {
      // ปรับแต่งสีและสิทธิ์ให้ตรงตามข้อกำหนดความปลอดภัย
      await existing.edit({
        color: roleDef.color,
        hoist: roleDef.hoist,
        mentionable: roleDef.mentionable,
        permissions: roleDef.permissions || []
      }).catch(() => {});
    }
    rolesMap[roleDef.key] = existing;
  }

  // 2. จัดสร้างหมวดหมู่และห้องตามข้อกำหนด Permission Overwrite ที่เข้มงวด
  const categoriesConfig = buildCategoriesConfig(rolesMap, everyoneRole);
  let welcomeChannel = null;
  let verifyChannel = null;
  let logChannel = null;
  let createdChannelsCount = 0;

  for (const catConfig of categoriesConfig) {
    const category = await guild.channels.create({
      name: catConfig.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: catConfig.permissionOverwrites
    });
    createdChannelsCount++;

    for (const chData of catConfig.channels) {
      const chOverwrites = chData.overwrites ? [...chData.overwrites] : [];

      const chOptions = {
        name: chData.name,
        type: chData.type,
        parent: category.id,
        permissionOverwrites: chOverwrites
      };

      if (chData.userLimit) {
        chOptions.userLimit = chData.userLimit;
      }

      const channel = await guild.channels.create(chOptions);
      createdChannelsCount++;

      if (chData.isWelcome) welcomeChannel = channel;
      if (chData.isVerify) verifyChannel = channel;
      if (chData.isLog) logChannel = channel;

      if (chData.defaultContent) {
        await channel.send(chData.defaultContent).catch(() => {});
      }
    }
  }

  // 3. ผูกระบบอัตโนมัติ (Auto Role, Welcome, Verify, Logs) เข้าสู่ Database
  const dbUpdates = {
    // 3.1 สมาชิกใหม่เข้าห้อง แจกยศ @Member อัตโนมัติ (เห็นแค่ห้อง Welcome/Rules/Verify)
    autorole_enabled: 1,
    autorole_id: rolesMap.MEMBER.id,

    // 3.2 กดยืนยันตัวตน รับยศ @Verified (ปลดล็อกห้องคุยทั้งหมด)
    verify_enabled: 1,
    verify_channel: verifyChannel ? verifyChannel.id : null,
    verify_role: rolesMap.VERIFIED.id,
    verify_message: '🛡️ **ระบบยืนยันตัวตน | Discord Security Verification**\nกดยืนยันตัวตนด้านล่างเพื่อรับยศ ✅ **Verified** และปลดล็อกห้องพูดคุยทั้งหมดในเซิร์ฟเวอร์!',

    // 3.3 Welcome Card
    welcome_enabled: welcomeChannel ? 1 : 0,
    welcome_channel: welcomeChannel ? welcomeChannel.id : null,
    welcome_message: '🎉 ยินดีต้อนรับ {user} เข้าสู่ **{server}**! กรุณาอ่านกฎระเบียบและยืนยันตัวตนเพื่อเข้าสู่คอมมูนิตี้ ✨ (สมาชิกคนที่ {membercount})',
    welcome_color: '#5865F2',

    // 3.4 Logs
    log_enabled: logChannel ? 1 : 0,
    log_channel: logChannel ? logChannel.id : null
  };

  await updateGuildSettings(guild.id, dbUpdates);

  // 4. ส่งปุ่ม Verify ลงห้อง Verify
  if (verifyChannel) {
    const verifyEmbed = new EmbedBuilder()
      .setTitle('🛡️ ระบบยืนยันตัวตน | Member Verification')
      .setDescription(
        'ยินดีต้อนรับสู่เซิร์ฟเวอร์อย่างเป็นทางการ!\n\n' +
        '📌 **ขั้นตอนการเข้าใช้งาน:**\n' +
        '1. อ่านกฎระเบียบประจำเซิร์ฟเวอร์\n' +
        '2. กดปุ่ม **"✅ ยืนยันตัวตน (รับยศ Verified)"** ด้านล่าง\n' +
        '3. ระบบจะมอบยศ <@&' + rolesMap.VERIFIED.id + '> เพื่อปลดล็อกห้องสนทนาทั้งหมดทันที'
      )
      .setColor('#2ECC71')
      .setFooter({ text: guild.name, iconURL: guild.iconURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅ ยืนยันตัวตน (รับยศ Verified)')
        .setStyle(ButtonStyle.Success)
    );

    await verifyChannel.send({ embeds: [verifyEmbed], components: [row] }).catch(() => {});
  }

  // 5. ติดตั้ง Server Stats (ถ้าเลือกเปิด)
  let statsCreated = null;
  if (options.withStats) {
    try {
      statsCreated = await setupServerStats(guild, rolesMap.VERIFIED.id);
    } catch (e) {
      console.warn('Server stats setup error:', e.message);
    }
  }

  return {
    rolesMap,
    createdChannelsCount,
    welcomeChannel,
    verifyChannel,
    logChannel,
    statsCreated
  };
}

module.exports = {
  SECURITY_ROLES,
  executeRolePermissionSetup
};
