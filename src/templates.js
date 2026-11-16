const { ChannelType, PermissionFlagsBits } = require('discord.js');

const TEMPLATES = {
  community: {
    name: '🌟 คอมมูนิตี้มาตรฐาน (Standard Community)',
    description: 'เหมาะสำหรับกลุ่มเพื่อน คอมมูนิตี้ทั่วไป สะอาด เรียบร้อย ใช้งานง่าย',
    categories: [
      {
        name: '✦- - 📌 ข้อมูลเซิร์ฟเวอร์ - -✦',
        channels: [
          { name: '📌┃welcome-ต้อนรับ', type: ChannelType.GuildText, readOnly: true },
          { name: '📜┃rules-กฎระเบียบ', type: ChannelType.GuildText, readOnly: true },
          { name: '📢┃announcements', type: ChannelType.GuildText, readOnly: true },
          { name: '✅┃verify-ยืนยันตัวตน', type: ChannelType.GuildText, readOnly: true },
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
          { name: '📋┃mod-logs', type: ChannelType.GuildText }
        ]
      }
    ]
  },
  gaming: {
    name: '🎮 เกมมิ่ง & ตี้เกม (Gaming & Squad)',
    description: 'เน้นหาเพื่อนเล่นเกม แชร์คลิปไฮไลท์ และห้องเสียงสำหรับเล่นเกมเป็นทีม',
    categories: [
      {
        name: '『 📌 』・INFO & WELCOME',
        channels: [
          { name: '👋┃ยินดีต้อนรับ', type: ChannelType.GuildText, readOnly: true },
          { name: '📜┃กฎเซิร์ฟเวอร์', type: ChannelType.GuildText, readOnly: true },
          { name: '📢┃ประกาศ', type: ChannelType.GuildText, readOnly: true },
          { name: '✅┃verify', type: ChannelType.GuildText, readOnly: true },
        ]
      },
      {
        name: '『 🎮 』・GAMING HUB',
        channels: [
          { name: '💬┃แชทเกมเมอร์', type: ChannelType.GuildText },
          { name: '🎯┃หาเพื่อนเล่นเกม', type: ChannelType.GuildText },
          { name: '🔥┃คลิปไฮไลท์', type: ChannelType.GuildText },
          { name: '🤖┃บอท-มินิเกม', type: ChannelType.GuildText },
        ]
      },
      {
        name: '『 🔊 』・VOICE CHANNELS',
        channels: [
          { name: '🎮┃Squad Room 1 (4 คน)', type: ChannelType.GuildVoice, userLimit: 4 },
          { name: '🎮┃Squad Room 2 (5 คน)', type: ChannelType.GuildVoice, userLimit: 5 },
          { name: '👥┃Duo Room (2 คน)', type: ChannelType.GuildVoice, userLimit: 2 },
          { name: '🔊┃ห้องพูดคุยชิลๆ', type: ChannelType.GuildVoice },
          { name: '🎵┃Music Lounge', type: ChannelType.GuildVoice },
          { name: '🌙┃AFK', type: ChannelType.GuildVoice }
        ]
      },
      {
        name: '『 🛡️ 』・STAFF ONLY',
        staffOnly: true,
        channels: [
          { name: '💬┃staff-แอดมิน', type: ChannelType.GuildText },
          { name: '📋┃server-logs', type: ChannelType.GuildText }
        ]
      }
    ]
  },
  aesthetic: {
    name: '✨ มินิมอล & คาเฟ่ (Aesthetic & Chill)',
    description: 'ดีไซน์เรียบหรู น่ารัก สไตล์มินิมอล สบายตา เหมาะสำหรับชุมชนสายชิลล์',
    categories: [
      {
        name: '─── ･ ｡ﾟ☆: *. 📜 .* :☆ﾟ. ───',
        channels: [
          { name: '🌱・welcome', type: ChannelType.GuildText, readOnly: true },
          { name: '📖・rules', type: ChannelType.GuildText, readOnly: true },
          { name: '💌・announcements', type: ChannelType.GuildText, readOnly: true },
          { name: '🩰・verify', type: ChannelType.GuildText, readOnly: true }
        ]
      },
      {
        name: '─── ･ ｡ﾟ☆: *. ☕ .* :☆ﾟ. ───',
        channels: [
          { name: '☕・main-chat', type: ChannelType.GuildText },
          { name: '🎨・art-and-media', type: ChannelType.GuildText },
          { name: '💭・qotd-คำถามประจำวัน', type: ChannelType.GuildText },
          { name: '🤖・bot-zone', type: ChannelType.GuildText }
        ]
      },
      {
        name: '─── ･ ｡ﾟ☆: *. ☁️ .* :☆ﾟ. ───',
        channels: [
          { name: '☁️・cafe-lounge', type: ChannelType.GuildVoice },
          { name: '🌿・study-and-work', type: ChannelType.GuildVoice },
          { name: '🎧・music-chill', type: ChannelType.GuildVoice },
          { name: '🌙・sleep-afk', type: ChannelType.GuildVoice }
        ]
      }
    ]
  }
};

async function applyTemplate(guild, templateKey) {
  const template = TEMPLATES[templateKey];
  if (!template) throw new Error('ไม่พบเทมเพลตที่เลือก');

  const createdChannels = [];
  const everyoneRole = guild.roles.everyone;

  for (const catData of template.categories) {
    const permissionOverwrites = [];

    if (catData.staffOnly) {
      permissionOverwrites.push({
        id: everyoneRole.id,
        deny: [PermissionFlagsBits.ViewChannel]
      });
    }

    const category = await guild.channels.create({
      name: catData.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites
    });
    createdChannels.push(category);

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
      createdChannels.push(channel);
    }
  }

  return {
    templateName: template.name,
    count: createdChannels.length
  };
}

module.exports = {
  TEMPLATES,
  applyTemplate
};
