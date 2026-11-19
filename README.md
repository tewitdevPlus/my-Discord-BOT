# 🤖 Devplus BOT & Web Dashboard Management System

<div align="center">

![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-v4-lightgrey.svg?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3178C6.svg?logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7.svg?logo=render&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**ระบบจัดการ Discord Bot และ Web Dashboard ควบคุมผ่านเว็บจริง ครบวงจร 100%**  
*พัฒนาโดย **tewit noita** ([@tewitdevPlus](https://github.com/tewitdevPlus))*

[🌐 เยี่ยมชม Live Web Dashboard](https://my-discord-bot-hjdi.onrender.com) • [✨ ฟีเจอร์หลัก](#-ฟีเจอร์เด่น) • [🚀 คำสั่งบอท](#-คำสั่ง-slash-commands-20-คำสั่ง) • [👨‍💻 เครดิต](#-เครดิต-ผู้พัฒนา-developer)

---

</div>

## 🌟 ฟีเจอร์เด่น (Key Features)

### 1. ⚡ Full Auto Setup (ติดตั้งระบบทั้งเซิร์ฟเวอร์ในคลิกเดียว)
- สั่งการได้ทั้งผ่านคำสั่ง `/auto-setup` หรือ **กดปุ่มบน Web Dashboard**
- สร้างยศ (Roles), สร้างหมวดหมู่ (Categories), สร้างห้อง (Channels)
- ล็อกสิทธิ์ Read-Only สำหรับห้องข้อมูล และซ่อนห้อง Staff อัตโนมัติ
- ผูกระบบ **Welcome**, **Verify**, **Auto Role**, **Logs**, และ **Server Stats** ทันทีในคลิกเดียว

### 2. 🛡️ Role & Permission Security Management (7 ระดับสิทธิ์ความปลอดภัยสูง)
- จัดระเบียบสิทธิ์และการเข้าถึงห้องอย่างเข้มงวดตามมาตรฐาน:
  1. 👑 **@FOUNDER**: สิทธิ์สูงสุด Administrator เข้าถึงได้ทุกอย่าง
  2. 🛡️ **@ADMIN**: ผู้ดูแลระบบ จัดการห้อง/สมาชิก/เตะ/แบน (ห้ามแก้ Founder)
  3. 🔧 **@STAFF**: ทีมงาน ดูแลสมาชิก/Mute/ลบข้อความ
  4. 💎 **@VIP**: สมาชิกพิเศษ ปลดล็อกห้อง Exclusive VIP Lounge
  5. 🤖 **@Bot**: ระบบอัตโนมัติ สิทธิ์เฉพาะที่จำเป็น
  6. ✅ **@Verified**: สมาชิกยืนยันตัวตนแล้ว เข้าห้องพูดคุยและห้องเสียงได้
  7. 👥 **@Member**: สมาชิกเริ่มต้น มองเห็นเฉพาะห้อง Welcome/Rules/Verify
- ล็อกและซ่อนห้องเด็ดขาด: ห้องทั่วไปซ่อนจาก @everyone และคนยังไม่ยืนยันตัวตน ป้องกันการสแปม 100%

### 3. 👑 Auto Setup Roles (สร้างและจัดชุดยศอัตโนมัติ)
- เมนูแยกเฉพาะการสร้างยศโดยไม่แตะต้องห้องเดิม ผ่านคำสั่ง `/setup-roles` หรือบน Web Dashboard
- รองรับ 4 ธีมยอดนิยม: **Security 7 ระดับ**, **เกมมิ่ง & ตี้เกม**, **คอมมูนิตี้มาตรฐาน**, **มินิมอล & คาเฟ่**

### 4. 🎭 Auto Role (แจกยศสมาชิกใหม่อัตโนมัติ)
- แจกยศให้อัตโนมัติทันทีเมื่อมีคนเข้าเซิร์ฟเวอร์ ตั้งค่าเปิด/ปิด และเลือกยศได้ผ่านคำสั่ง `/setup-autorole` และแท็บ Auto Role บนหน้าเว็บ

### 5. ☣️ โซนอันตราย (Danger Zone / Nuke Server)
- ระบบล้างห้องและยศทั้งหมดในเซิร์ฟเวอร์สำหรับเจ้าของเซิร์ฟเวอร์ (Server Owner Only)
- มีระบบป้องกันความปลอดภัย **3 ขั้นตอน (3-Stage Verification)**:
  - **รอบที่ 1**: ตรวจสอบความยินยอม
  - **รอบที่ 2**: ยืนยันผลกระทบระดับวิกฤต
  - **รอบที่ 3**: **สุ่มโจทย์คณิตศาสตร์ให้คำนวณ** ตอบถูกเท่านั้นระบบถึงจะทำการลบ!

### 6. 🌐 Modern Web Dashboard (ควบคุมผ่านเว็บจริง)
- **Discord OAuth2 Login**: เข้าสู่ระบบผ่าน Discord และระบบ Auto-Refresh รายการเซิร์ฟเวอร์ล่าสุด
- **แท็บควบคุมครบครัน**:
  - `⚡ Full Auto Setup`: รันระบบอัตโนมัติทั้งเซิร์ฟเวอร์
  - `👑 Auto สร้างยศ`: สร้างเฉพาะชุดยศตามธีม
  - `👋 Welcome`: ปรับแต่งข้อความ, สี และห้องต้อนรับ
  - `✅ Verify`: ควบคุมระบบยืนยันตัวตน
  - `👥 Auto Role`: ตั้งค่ายศแจกอัตโนมัติ
  - `📊 สถิติ & ยศ`: ติดตั้งตัวนับสถิติบนห้องเสียง และดูจำนวนคนในแต่ละยศ
  - `🎨 แต่งห้องเซิร์ฟเวอร์`: Styler ตกแต่งตามธีม และ Quick Single Channel Decorator
  - `📋 สร้างห้องจากแม่แบบ (1:1 Clone)`: คัดลอกห้องเดิมพร้อมสิทธิ์
  - `💡 คลังไอเดีย`: บันทึกไอเดียพัฒนาเซิร์ฟเวอร์
  - `🛡️ Moderation & Logs`: ดูประวัติการลงโทษและระบบความปลอดภัย
  - `☣️ โซนอันตราย (Danger)`: ล้างเซิร์ฟเวอร์พร้อมด่านคำนวณเลข
  - `👑 Admin Secret (/admin)`: ระบบเฉพาะผู้พัฒนา (`tewitplus_58868`) ตรวจสอบเซิร์ฟเวอร์ทั้งหมด

### 7. 🐘 Cloud Database (PostgreSQL - Supabase)
- บันทึกข้อมูลการตั้งค่าถาวร 100% ไม่สูญหายแม้เซิร์ฟเวอร์จะรีสตาร์ท

---

## ⚡ คำสั่ง Slash Commands (20 คำสั่ง)

| คำสั่ง | รายละเอียด |
| :--- | :--- |
| `/auto-setup` | ⚡ ติดตั้งระบบแบบ Full Auto ครบจบ (ยศ, ห้อง, สิทธิ์, Verify, Welcome) |
| `/setup-security` | 🛡️ ติดตั้งระบบ Role & Permission ความปลอดภัยสูง 7 ระดับ |
| `/setup-roles` | 👑 สร้างและตกแต่งชุดยศอัตโนมัติแยกเฉพาะระบบยศ |
| `/setup-autorole` | 🎭 ตั้งค่าระบบแจกยศอัตโนมัติเมื่อสมาชิกใหม่เข้าเซิร์ฟเวอร์ |
| `/nuke-server` | ☣️ [เมนูอันตราย] ลบห้องและยศทั้งหมด (เตือน 3 รอบ + คำนวณเลข) |
| `/setup-template` | 🎨 ตกแต่งและสร้างห้องในเซิร์ฟเวอร์อัตโนมัติจากธีมยอดนิยม |
| `/rename-channel` | ✏️ เปลี่ยนชื่อและตกแต่งห้องด้วยแม่แบบสำเร็จรูป |
| `/setup-stats` | 📊 ติดตั้งระบบนับจำนวนสมาชิก, คนออนไลน์ และยศบนห้องเสียง |
| `/roles-info` | 👥 ดูจำนวนคนในแต่ละยศของเซิร์ฟเวอร์ |
| `/setup-verify` | ✅ ติดตั้งระบบยืนยันตัวตนพร้อมปุ่มกด |
| `/setup-welcome` | 👋 ตั้งค่าห้องและข้อความต้อนรับสมาชิก |
| `/setup-log` | 📋 ตั้งค่าห้องบันทึกประวัติ (Mod Logs) |
| `/ban` / `/kick` | 🔨 แบนหรือเตะผู้ใช้ออกจากเซิร์ฟเวอร์ |
| `/mute` / `/unmute` | 🔇 มิวท์สมาชิก (Timeout) ตามระยะเวลา |
| `/warn` | ⚠️ เพิ่ม / ดู / ลบคำเตือนของสมาชิก |
| `/clear` | 🧹 ลบข้อความในห้องแชทแบบรวดเร็ว |
| `/serverinfo` / `/userinfo` | ℹ️ ดูข้อมูลเซิร์ฟเวอร์และผู้ใช้ |

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Runtime & Language**: Node.js (v22), JavaScript (ES6+)
- **Discord Library**: Discord.js v14
- **Web Dashboard**: Express.js, EJS, Passport.js (Discord OAuth2)
- **Database**: PostgreSQL (Supabase Cloud Pooler) & SQLite3 (Local fallback)
- **Session Store**: `connect-pg-simple` (PostgreSQL Session Persistence)
- **Deployment Platform**: Render.com (Web Service 24/7)
- **Version Control**: Git & GitHub

---

## 👨‍💻 เครดิต / ผู้พัฒนา (Developer)

- **ผู้พัฒนา (Creator):** **tewit noita**
- **GitHub Profile:** [@tewitdevPlus](https://github.com/tewitdevPlus)
- **Repository:** [my-Discord-BOT](https://github.com/tewitdevPlus/my-Discord-BOT)
- **Live URL:** [https://my-discord-bot-hjdi.onrender.com](https://my-discord-bot-hjdi.onrender.com)

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้ใบอนุญาต [MIT License](LICENSE)
