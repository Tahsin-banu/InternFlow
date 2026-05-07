<div align="center">

<img src="https://img.shields.io/badge/InternFlow-v1.0.0-FF8C6B?style=for-the-badge&logo=vercel&logoColor=white" alt="Version" />
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

<br />
<br />

```
  ___       _                 _____ _
 |_ _|_ __ | |_ ___ _ __ _ _|  ___| | _____      __
  | || '_ \| __/ _ \ '__| '_ \ |_  | |/ _ \ \ /\ / /
  | || | | | ||  __/ |  | | | |  _| | | (_) \ V  V /
 |___|_| |_|\__\___|_|  |_| |_|_|   |_|\___/ \_/\_/
```

# 🚀 InternFlow

### A Modern Internship Management Dashboard

**Built with pure HTML, CSS & Vanilla JavaScript — No frameworks. No backend. No limits.**

[🌐 Live Demo](https://intern-flow-two.vercel.app/) &nbsp;•&nbsp; [📂 View Code](https://github.com/Tahsin-banu/internflow) &nbsp;•&nbsp; [🐛 Report Bug](https://github.com/Tahsin-banu/internflow/issues) &nbsp;•&nbsp; [💡 Request Feature](https://github.com/Tahsin-banu/internflow/issues)

<br/>

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages & Functionality](#-pages--functionality)
- [localStorage Architecture](#-localstorage-architecture)
- [Deployment](#-deployment-on-vercel)
- [What I Learned](#-what-i-learned)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**InternFlow** is a fully functional, frontend-only Internship Management System built as a portfolio project. It provides a complete SaaS-style dashboard experience where interns can:

- Register and securely log in with per-user data isolation
- Submit tasks with detailed descriptions and file attachments
- Track their progress through real-time stats and activity charts
- Manage deadlines via an interactive calendar
- Stay updated with an in-app notification system

> 💡 **The Challenge:** Build a complete, multi-user, data-persistent web application using **zero backend, zero frameworks, and zero databases** — only the browser's localStorage API.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Register, Login, Logout with form validation and per-user data isolation |
| 📊 **Live Dashboard** | Real-time stats, 7-day Chart.js activity bar chart, recent submissions & deadlines |
| 📤 **Task Submission** | Full form with drag & drop file upload, domain category & status selector |
| 📋 **Task Management** | Search, filter by status/date, inline edit, delete with confirmation modal |
| 📅 **Calendar View** | Dynamic monthly calendar mapping tasks to submission dates |
| 👤 **Profile Page** | Editable name, role, bio with initials avatar and live statistics |
| 🔔 **Notifications** | Auto-logged timestamped alerts for every user action |
| ⚙️ **Settings** | Dark/Light mode toggle, toast preferences, data management |
| 🎨 **Premium UI/UX** | Animations, toast notifications, empty states, fully mobile responsive |
| 🌙 **Theme Toggle** | Dark/Light mode with preference saved to localStorage |

---

## 🛠️ Tech Stack

This project was intentionally built with **zero external frameworks** to demonstrate core web fundamentals:

```
Frontend Only
├── HTML5          → Semantic page structure & accessibility
├── CSS3           → Custom properties, flexbox, grid, animations
├── JavaScript     → ES6+, DOM manipulation, event handling
├── Chart.js       → Activity bar chart (loaded via CDN)
└── localStorage   → Client-side data persistence
```

> **Why no frameworks?** The goal was to deeply understand how the web platform works — routing, state management, DOM updates — by implementing everything from scratch.

---

## 📁 Project Structure

```
internflow/
│
├── 📄 index.html          # Single HTML file containing all page sections
├── 🎨 style.css           # Complete stylesheet with CSS custom properties
├── ⚙️  script.js           # All application logic (17 organized sections)
└── 📖 README.md           # You are here
```

> This is a true **Single Page Application (SPA)** — one HTML file, all pages toggled via JavaScript.

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No Node.js, no npm, no build tools required

### Run Locally

**Option 1 — Direct open (simplest):**
```bash
# 1. Clone the repository
git clone https://github.com/Tahsin-banu/internflow.git

# 2. Navigate into the folder
cd internflow

# 3. Open index.html in your browser
# Double-click index.html OR drag it into your browser
```

**Option 2 — VS Code Live Server (recommended for development):**
```bash
# 1. Clone the repository
git clone https://github.com/Tahsin-banu/internflow.git

# 2. Open the folder in VS Code
code internflow

# 3. Install the "Live Server" extension in VS Code
# 4. Right-click index.html → "Open with Live Server"
# 5. App opens at http://localhost:5500
```

### First Time Setup
1. Open the app in your browser
2. Click **"Register"** and create a free account
3. Log in and explore your personal dashboard
4. Submit your first task via **"Submit Task"** in the sidebar

---

## 📱 Pages & Functionality

### 🔐 Authentication
- **Register** — Name, Email, Password with real-time validation
- **Login** — Email + Password matching against localStorage users
- **Logout** — Clears session, redirects to login
- Each user's data is completely isolated using their unique user ID as a key prefix

### 📊 Dashboard
- **Welcome banner** — Personalized greeting with current date
- **4 Stats cards** — Total, Pending, Completed, Overdue task counts
- **Activity chart** — Chart.js bar chart showing submissions over last 7 days
- **Upcoming deadlines** — Pending tasks due within 7 days
- **Recent submissions** — Last 5 tasks in a clean table
- **Submission Rules** — Always-visible guidelines panel

### 📤 Submit Task
- Task title, description, date, status & domain/category fields
- **Drag & Drop upload zone** with file name preview
- Browse file fallback with clean UI
- Success toast on submission

### 📋 My Tasks
- All submitted tasks rendered as interactive cards
- **Search** by title or description
- **Filter** by status (All / Pending / Completed)
- **Filter** by exact date
- **Edit modal** — Update any field inline
- **Delete** with confirmation modal to prevent accidents

### 📅 Calendar
- Full monthly calendar grid
- Prev / Next month navigation
- Today's date highlighted with accent color
- Task dots rendered on their submission dates

### 👤 Profile
- Initials-based avatar (auto-generated from name)
- Live task statistics (Total / Completed / Pending)
- Edit name, role/domain, and bio
- Changes persist immediately to localStorage

### 🔔 Notifications
- Auto-logged on: task submit, task edit, task delete, profile update
- Timestamped entries with type icons (success / danger / info)
- Badge count on sidebar nav item

### ⚙️ Settings
- Dark / Light mode toggle (persisted to localStorage)
- Toast notification toggle
- Clear all task data button
- App version display

---

## 🗄️ localStorage Architecture

All data is namespaced with the `if_` prefix to avoid collisions:

```javascript
// Global keys
localStorage.getItem('if_users')          // Array of all registered users
localStorage.getItem('if_currentUser')    // Currently logged-in user object
localStorage.getItem('if_loggedIn')       // "true" or absent
localStorage.getItem('if_theme')          // "dark" or "light"

// Per-user keys (isolated by userId)
localStorage.getItem('if_tasks_{userId}')   // User's task array
localStorage.getItem('if_notifs_{userId}')  // User's notification array
```

> **Multi-user support:** Because tasks are keyed by `userId`, multiple people can register and use the app on the same browser without seeing each other's data.

---

## ☁️ Deployment on Vercel

### Method 1 — Drag & Drop (30 seconds)
1. Go to [vercel.com](https://vercel.com) and sign up for free
2. Click **"Add New Project"** → **"Deploy"**
3. Drag your `internflow` folder onto the upload area
4. Click **Deploy** → Your site is live! 🎉

### Method 2 — GitHub Integration (recommended)
```bash
# 1. Push your code to GitHub
git init
git add .
git commit -m "🚀 Initial commit — InternFlow v1.0"
git remote add origin https://github.com/Tahsin-banu/internflow.git
git push -u origin main

# 2. Go to vercel.com → Import Git Repository
# 3. Select your internflow repo
# 4. Leave all settings as default
# 5. Click Deploy
```

**Vercel Settings:**
| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Root Directory | `/` (leave blank) |
| Build Command | *(leave blank)* |
| Output Directory | *(leave blank)* |

Every `git push` to `main` will auto-redeploy your site. ✨

---

## 🧠 What I Learned

Building InternFlow without any frameworks taught me:

- ✅ How **SPA routing** works — hiding/showing DOM sections on nav click
- ✅ How to manage **application state** using plain JavaScript objects
- ✅ How to architect **per-user data isolation** with localStorage key namespacing
- ✅ How to implement **drag & drop** file upload with native browser events
- ✅ How to use **Chart.js** for dynamic, theme-aware data visualizations
- ✅ How to build **modals, toasts & confirmations** without any UI library
- ✅ How CSS **Custom Properties** enable instant theme switching
- ✅ How to write **XSS-safe** HTML rendering using `escapeHTML()` helpers

---

## 🔮 Future Improvements

- [ ] 🔥 Firebase / Supabase backend integration for real data persistence
- [ ] 📧 Email verification and password reset flow
- [ ] 👨‍💼 Admin panel — manager view of all intern submissions
- [ ] 📊 Advanced analytics — completion rate, streak tracker
- [ ] 🔔 Browser Push Notifications for deadline reminders
- [ ] 📎 Real file upload via Cloudinary or Firebase Storage
- [ ] 🌐 Google OAuth login
- [ ] 📱 PWA support — install as a mobile app

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated.**

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m "✨ Add AmazingFeature"

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📄 License

Distributed under the **MIT License.** Feel free to use this project for your own portfolio!

---

## 📬 Contact

**Tahsin Banu**
- 🔗 LinkedIn: [linkedin.com/in/tahsin-banu-837502365](https://www.linkedin.com/in/tahsin-banu-837502365/)
- 🐙 GitHub: [github.com/Tahsin-banu](https://github.com/Tahsin-banu)
- 📧 Email: suhanatahsin294@gmail.com

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! It means a lot. ⭐**

Made with ❤️ and a lot of ☕ by [Tahsin Banu](https://github.com/Tahsin-banu)

<img src="https://img.shields.io/github/stars/Tahsin-banu/internflow?style=social" />
<img src="https://img.shields.io/github/forks/Tahsin-banu/internflow?style=social" />

</div>
