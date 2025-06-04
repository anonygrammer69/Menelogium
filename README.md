# 🧠📅 Menelogium

**Menelogium** is your intelligent calendar companion.  
A minimal, elegant, AI-powered (soon™) calendar that automates your scheduling and keeps your time sacred.

> _Currently in Alpha – Calendar is fully functional. Notifications run via n8n. AI scheduling coming soon._

![Menelogium Banner](https://iili.io/3bq4i9n.md.png)

---

## ✨ Alpha-0.1.1 – What Works

- ✅ **Interactive Calendar**
  
  Create, view, and manage your events with a clean and simple UI.

- 📧 **Confirmation Emails**
  
  Triggered automatically via **n8n** when new events are added.

- ⏰ **Reminder Emails**
    
  Scheduled and dispatched through **n8n** before your events start.

## ✨ Alpha-0.1.2 - What's new

- ✨ **UI Revamp** ✨
  
  A brand new, more modern and clean look has been implemented for the calendar grid for a better User Experience and visual aesthetics.
  A whole new background theme has also been laid down, enhancing the overall appearence of the app.

- 📃 **New Side-Bar Menu**
  
  A new side-bar menu has also been added in this update, which augments layout organization, eases navigation through the calendar for the user, and provides a base for more new features!
  
---

## 🛠️ Tech Stack

- **Frontend**: React+Typescript+Vite
- **Backend**: n8n (workflow automation)  
- **Database**: Firebase Firestore  
- **Email Automation**: n8n + SMTP
- **Scheduling**: n8n Cron Workflows  
- **AI**: (Coming Soon) Natural Language Scheduling, Natural Language Processing

---

## 🧪 Local Setup

```bash
git clone https://github.com/your-username/menologium.git
cd menologium
npm install
npm run dev
