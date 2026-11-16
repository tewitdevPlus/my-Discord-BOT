const CHANNEL_PRESETS = [
  // ข้อมูลเซิร์ฟเวอร์
  { category: '📌 ข้อมูลทั่วไป', label: '👋 ต้อนรับ', name: '📌┃welcome', desc: 'ห้องต้อนรับสมาชิกใหม่' },
  { category: '📌 ข้อมูลทั่วไป', label: '📜 กฎระเบียบ', name: '📜┃rules-กฎระเบียบ', desc: 'ห้องกฎเกณฑ์ของเซิร์ฟเวอร์' },
  { category: '📌 ข้อมูลทั่วไป', label: '📢 ประกาศ', name: '📢┃announcements', desc: 'ห้องประกาศข่าวสาร' },
  { category: '📌 ข้อมูลทั่วไป', label: '✅ ยืนยันตัวตน', name: '✅┃verify-ยืนยันตัวตน', desc: 'ห้องกดปุ่ม Verify' },
  { category: '📌 ข้อมูลทั่วไป', label: '🎭 รับยศ', name: '🎭┃roles-รับยศ', desc: 'ห้องเลือก Role' },
  { category: '📌 ข้อมูลทั่วไป', label: '🔗 ลิงก์ต่างๆ', name: '🔗┃links-and-info', desc: 'ห้องรวมช่องทางติดต่อ' },

  // พูดคุย & บันเทิง
  { category: '💬 ชุมชน & พูดคุย', label: '💬 แชทหลัก', name: '💬┃คุยทั่วไป', desc: 'ห้องแชทหลักของเซิร์ฟเวอร์' },
  { category: '💬 ชุมชน & พูดคุย', label: '📷 แชร์รูป/มีม', name: '📷┃มีม-และรูปภาพ', desc: 'ห้องส่งรูปภาพและคลิป' },
  { category: '💬 ชุมชน & พูดคุย', label: '🤖 คำสั่งบอท', name: '🤖┃คำสั่งบอท', desc: 'ห้องพิมพ์คำสั่งบอท' },
  { category: '💬 ชุมชน & พูดคุย', label: '💡 เสนอแนะ', name: '💡┃ข้อเสนอแนะ', desc: 'ห้องแนะนำติชมเซิร์ฟเวอร์' },
  { category: '💬 ชุมชน & พูดคุย', label: '🎁 แจกของ', name: '🎉┃giveaway-กิจกรรม', desc: 'ห้องสุ่มแจกของรางวัล' },

  // เกมมิ่ง
  { category: '🎮 เกมมิ่ง', label: '🎯 หาเพื่อนเล่นเกม', name: '🎯┃หาตี้เล่นเกม', desc: 'ห้องชวนเล่นเกม' },
  { category: '🎮 เกมมิ่ง', label: '🔥 ไฮไลท์การเล่น', name: '🔥┃ไฮไลท์-gameplay', desc: 'ห้องลงคลิปสวยๆ' },
  { category: '🎮 เกมมิ่ง', label: '🎮 อัปเดตเกม', name: '🎮┃game-news', desc: 'ห้องข่าวสารเกม' },

  // ห้องเสียง
  { category: '🔊 ห้องเสียง (Voice)', label: '🔊 ห้องนั่งเล่น 1', name: '🔊┃ห้องนั่งเล่น 1', desc: 'ห้องคุยเสียงทั่วไป' },
  { category: '🔊 ห้องเสียง (Voice)', label: '🔊 ห้องนั่งเล่น 2', name: '🔊┃ห้องนั่งเล่น 2', desc: 'ห้องคุยเสียงทั่วไป' },
  { category: '🔊 ห้องเสียง (Voice)', label: '🎵 ฟังเพลง', name: '🎵┃ฟังเพลง-music', desc: 'ห้องเปิดเพลง' },
  { category: '🔊 ห้องเสียง (Voice)', label: '👥 Duo (2 คน)', name: '👥┃Duo Room (2 คน)', desc: 'ห้องคุย 2 คน' },
  { category: '🔊 ห้องเสียง (Voice)', label: '🎮 Squad (4 คน)', name: '🎮┃Squad Room (4 คน)', desc: 'ห้องตี้ 4 คน' },
  { category: '🔊 ห้องเสียง (Voice)', label: '🌙 ห้อง AFK', name: '🌙┃AFK-ไม่อยู่', desc: 'ห้องไม่อยู่หน้าจอ' },

  // แอดมิน & สตาฟ
  { category: '🛡️ ทีมงาน', label: '💬 แชทสตาฟ', name: '💬┃staff-chat', desc: 'ห้องพูดคุยเฉพาะทีมงาน' },
  { category: '🛡️ ทีมงาน', label: '📋 บันทึก Log', name: '📋┃mod-logs', desc: 'ห้องเก็บประวัติการกระทำ' },
];

module.exports = {
  CHANNEL_PRESETS
};
