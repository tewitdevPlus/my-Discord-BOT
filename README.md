# 🤖 Discord Bot & Web Dashboard Management System

<div align="center">

![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-v4-lightgrey.svg?logo=express&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7.svg?logo=render&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**ระบบจัดการ Discord Bot ครบวงจร พร้อม Web Dashboard ควบคุมผ่านเว็บจริง**  
*พัฒนาโดย **tewit noita** ([@tewitdevPlus](https://github.com/tewitdevPlus))*

[🌐 เยี่ยมชม Live Web Dashboard](https://my-discord-bot-hjdi.onrender.com) • [✨ ฟีเจอร์หลัก](#-ฟีเจอร์เด่น) • [🚀 คำสั่งบอท](#-คำสั่ง-slash-commands) • [👨‍💻 เครดิต](#-เครดิต-ผู้พัฒนา-developer)

---

</div>

## 🌟 ฟีเจอร์เด่น (Key Features)

### 1. 🌐 Web Dashboard (ควบคุมผ่านเว็บ)
- **Discord OAuth2 Login**: เข้าสู่ระบบด้วยบัญชี Discord พร้อมสิทธิ์การจัดการเซิร์ฟเวอร์
- **ตั้งค่าแบบเรียลไทม์**: ปรับแต่งข้อความต้อนรับ, ห้อง Verify, สี Embed และบันทึกได้ทันที
- **Responsive Design**: ใช้งานได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน

### 2. ✅ ระบบยืนยันตัวตน (Verification System)
- สมาชิกใหม่กดปุ่ม **"✅ ยืนยันตัวตน"** เพื่อรับยศอัตโนมัติ
- ป้องกันบอทและผู้ใช้สแปมเข้ามาก่อกวน
- แจ้งเตือน Log ไปยังห้องแอดมินเมื่อมีผู้ใช้ยืนยันตัวตน

### 3. 👋 ระบบต้อนรับสมาชิกใหม่ (Welcome System)
- ส่งข้อความต้อนรับแบบ Embed สวยงามอัตโนมัติ
- รองรับตัวแปรแทนค่า: `{user}`, `{username}`, `{server}`, `{membercount}`
- เลือกห้องและปรับแต่งสี Embed ได้ตามใจชอบ

### 4. 📊 ระบบนับสถิติเซิร์ฟเวอร์ (Server Stats Counters)
- สร้าง Voice Channel บนสุดของเซิร์ฟเวอร์เพื่อแสดงสถิติแบบเรียลไทม์:
  - `👥 สมาชิกทั้งหมด: XX`
  - `🟢 ออนไลน์: XX`
  - `🤖 บอท: XX`
  - `👑 นับตามยศพิเศษ (เช่น VIP): XX`
- อัปเดตอัตโนมัติเมื่อมีคนเข้า-ออก หรือเปลี่ยนสถานะ

### 5. 🎨 ระบบตกแต่งและจัดเซิร์ฟเวอร์อัตโนมัติ (Server Styler)
- **เทมเพลตทั้งเซิร์ฟเวอร์**:
  - 🌟 **คอมมูนิตี้มาตรฐาน**: เรียบร้อย พร้อมเส้นคั่น `┃`
  - 🎮 **เกมมิ่ง & ตี้เกม**: มีห้อง Duo / Squad และห้องแชร์ไฮไลท์
  - ✨ **มินิมอล & คาเฟ่**: ดีไซน์น่ารัก สบายตาสไตล์คาเฟ่
- **ตกแต่งทีละห้อง (Quick Preset)**: มีแม่แบบชื่อห้องยอดนิยมให้คลิกเปลี่ยนชื่อได้ทันที

### 6. 🛡️ ระบบดูแลความปลอดภัย & สตาฟ (Moderation & Logs)
- คำสั่งจัดการสมาชิก: `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/clear`
- บันทึกประวัติการลงโทษ (Mod Logs) พร้อมดูย้อนหลังผ่าน Dashboard ได้

---

## ⚡ คำสั่ง Slash Commands

| คำสั่ง | รายละเอียด |
| :--- | :--- |
| `/setup-template` | ตกแต่งและสร้างห้องในเซิร์ฟเวอร์อัตโนมัติจากธีมยอดนิยม |
| `/rename-channel` | เปลี่ยนชื่อและตกแต่งห้องด้วยแม่แบบสำเร็จรูป |
| `/setup-stats` | ติดตั้งระบบนับจำนวนสมาชิก, คนออนไลน์ และยศบนห้องเสียง |
| `/roles-info` | ดูจำนวนคนในแต่ละยศของเซิร์ฟเวอร์ |
| `/setup-verify` | ติดตั้งระบบยืนยันตัวตนพร้อมปุ่มกด |
| `/setup-welcome` | ตั้งค่าห้องและข้อความต้อนรับสมาชิก |
| `/setup-log` | ตั้งค่าห้องบันทึกประวัติ (Mod Logs) |
| `/ban` / `/kick` | แบนหรือเตะผู้ใช้ออกจากเซิร์ฟเวอร์ |
| `/mute` / `/unmute` | มิวท์สมาชิก (Timeout) ตามระยะเวลา |
| `/warn` | เพิ่ม / ดู / ลบคำเตือนของสมาชิก |
| `/clear` | ลบข้อความในห้องแชทแบบรวดเร็ว |
| `/serverinfo` / `/userinfo` | ดูข้อมูลเซิร์ฟเวอร์และผู้ใช้ |

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Backend / Bot**: Node.js, Discord.js v14
- **Web Dashboard**: Express.js, EJS Template Engine, Passport.js (Discord OAuth2)
- **Database**: SQLite3 (better-sqlite3)
- **Cloud Hosting**: Render.com (24/7 Hosting)
- **Version Control**: Git & GitHub

---

## 👨‍💻 เครดิต / ผู้พัฒนา (Developer)

- **ผู้พัฒนา (Creator):** **tewit noita**
- **GitHub:** [@tewitdevPlus](https://github.com/tewitdevPlus)
- **Repository:** [my-Discord-BOT](https://github.com/tewitdevPlus/my-Discord-BOT)

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้ใบอนุญาต [MIT License](LICENSE)
