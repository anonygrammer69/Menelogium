# 🧠📅 Menologium

**Menologium** is your intelligent calendar companion.  
A minimal, AI-powered (soon™) calendar that automates your reminders and keeps your time sacred.

> _Currently in Alpha – Calendar is fully functional. Notifications run via n8n. AI scheduling coming soon._

![Menologium Banner](https://iili.io/3bq4i9n.md.png)

---

## ✨ Alpha-0.1.1 – What Works

- ✅ **Interactive Calendar**  
  Create, view, and manage your events with a clean and simple UI.

- 📧 **Confirmation Emails**  
  Triggered automatically via **n8n** when new events are added.

- ⏰ **Reminder Emails**  
  Scheduled and dispatched through **n8n** before your events start.

---

## 🛠️ Tech Stack

- **Frontend**: React+Vite
- **Backend**: n8n (workflow automation)  
- **Database**: Firebase Firestore  
- **Email Automation**: n8n + SMTP
- **Scheduling**: n8n Cron Workflows  
- **AI**: (Coming Soon) Natural Language Scheduling

---

## 🧪 Local Setup

```bash
git clone https://github.com/your-username/menologium.git
cd menologium
npm install
npm run dev
