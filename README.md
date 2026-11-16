# 🤖 Discord Bot + Web Dashboard

Discord Bot ภาษาไทยที่มาพร้อมระบบ **Verify**, **Welcome**, **Moderation** และ **Web Dashboard** สำหรับจัดการทุกอย่างผ่านเว็บ!

## ✨ ฟีเจอร์

### ✅ ระบบ Verify
- สมาชิกใหม่กดปุ่มเพื่อยืนยันตัวตน
- รับ Role อัตโนมัติเมื่อ Verify สำเร็จ
- ปรับแต่งข้อความและห้อง Verify ได้

### 👋 ระบบ Welcome
- ส่งข้อความต้อนรับอัตโนมัติพร้อม Embed สวยๆ
- ปรับแต่งข้อความ, สี, ห้อง ได้
- รองรับตัวแปร: `{user}`, `{username}`, `{server}`, `{membercount}`

### 🛡️ จัดการเซิร์ฟเวอร์ (Moderation)
- `/ban` — แบนสมาชิก
- `/kick` — เตะสมาชิก
- `/mute` — มิวท์สมาชิก (Timeout)
- `/unmute` — ยกเลิกมิวท์
- `/warn add/list/remove/clear` — จัดการคำเตือน
- `/clear` — ลบข้อความ
- `/serverinfo` — ข้อมูลเซิร์ฟเวอร์
- `/userinfo` — ข้อมูลผู้ใช้

### 🌐 Web Dashboard
- เข้าสู่ระบบด้วย Discord OAuth2
- ตั้งค่า Welcome, Verify, Log, Auto Role ผ่านเว็บ
- ดูประวัติการดำเนินการ (Mod Logs)
- จัดการคำเตือน (Warnings)

---

## 🚀 วิธีติดตั้ง

### 1. สร้าง Discord Bot

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. กด **New Application** → ตั้งชื่อ → **Create**
3. ไปที่ **Bot** → **Add Bot**
4. เปิด **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. คัดลอก **Token** (ไว้ใส่ใน `.env`)
6. ไปที่ **OAuth2** → คัดลอก **Client ID** และ **Client Secret**
7. ตั้ง **Redirects** เป็น: `http://localhost:3000/auth/callback`

### 2. ติดตั้ง Dependencies

```bash
cd discord-bot
npm install
```

### 3. ตั้งค่า .env

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
BOT_TOKEN=ใส่_BOT_TOKEN_ที่นี่
CLIENT_ID=ใส่_CLIENT_ID_ที่นี่
CLIENT_SECRET=ใส่_CLIENT_SECRET_ที่นี่
DASHBOARD_PORT=3000
CALLBACK_URL=http://localhost:3000/auth/callback
SESSION_SECRET=สุ่มค่ามาใส่
```

### 4. ลงทะเบียน Slash Commands

```bash
npm run deploy
```

### 5. เชิญ Bot เข้าเซิร์ฟเวอร์

ไปที่ Discord Developer Portal → OAuth2 → URL Generator:
- Scopes: `bot`, `applications.commands`
- Permissions: `Administrator` (หรือเลือกเฉพาะที่ต้องการ)

### 6. รัน Bot

```bash
npm start
```

เปิดเว็บ: **http://localhost:3000**

---

## 📁 โครงสร้างโปรเจกต์

```
discord-bot/
├── src/
│   ├── index.js              # Entry point
│   ├── bot.js                # Bot setup
│   ├── database.js           # SQLite database
│   ├── deploy-commands.js    # Register slash commands
│   ├── events/               # Discord events
│   │   ├── ready.js
│   │   ├── guildMemberAdd.js
│   │   ├── guildCreate.js
│   │   └── interactionCreate.js
│   ├── commands/             # Slash commands
│   │   ├── ban.js
│   │   ├── kick.js
│   │   ├── mute.js
│   │   ├── unmute.js
│   │   ├── warn.js
│   │   ├── clear.js
│   │   ├── setup-welcome.js
│   │   ├── setup-verify.js
│   │   ├── setup-log.js
│   │   ├── serverinfo.js
│   │   └── userinfo.js
│   └── dashboard/            # Web Dashboard
│       ├── server.js
│       ├── routes/
│       │   └── api.js
│       ├── views/
│       │   ├── index.ejs
│       │   ├── dashboard.ejs
│       │   └── guild.ejs
│       └── public/
│           └── css/
│               └── style.css
├── data/                     # SQLite database (auto-created)
├── package.json
├── .env.example
└── README.md
```

---

## 🎨 Dashboard Screenshots

Dashboard มี 4 แท็บหลัก:
1. **Welcome** — ตั้งค่าระบบต้อนรับ (ห้อง, ข้อความ, สี)
2. **Verify** — ตั้งค่าระบบยืนยันตัวตน (ห้อง, Role)
3. **Moderation** — ตั้งค่า Log Channel & Auto Role
4. **Logs** — ดูประวัติ Ban/Kick/Mute/Warn

---

## 📝 License

MIT
