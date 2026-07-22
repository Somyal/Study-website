# ⚡ JEE Command Center

> A sleek, gamified, distraction-free preparation dashboard designed specifically for JEE Main and JEE Advanced aspirants.

![JEE Command Center](https://img.shields.io/badge/Status-Production--Ready-10b981?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20TailwindCSS%20%7C%20JavaScript-06b6d4?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge)

---

## 🌟 Overview

**JEE Command Center** is a client-side single-file web application built to help engineering aspirants track syllabus completion, log mock test analytics, manage daily study hours, and eliminate distractions—all with a gamified experience that keeps motivation high.

Everything runs locally in your browser with zero backend requirements. Your data is stored safely in `localStorage` with full offline availability and export/import support.

---

## ✨ Key Features

### 📚 Restructured Syllabus Tracker
* **Preloaded Syllabus:** Hardcoded Class 11 and Class 12 topics across Physics, Chemistry, and Mathematics (80+ chapters total).
* **Chemistry Sub-Divisions:** Structured categorization into *Physical*, *Organic*, and *Inorganic Chemistry*.
* **4-Stage Completion:** Track chapters through **Theory** 📖, **DPPs/Sheets** 📝, **PYQs** 🏆, and **Revision** 🔄.
* **Revision Heatmap:** Interactive color indicators showing revision recency:
  * 🟢 **Green:** Revised within the last 7 days.
  * 🟡 **Yellow:** Revised 8–21 days ago.
  * 🔴 **Red:** Needs revision (>21 days ago).
* **Confidence Stars:** Interactive 1–5 star rating for every chapter with animated micro-interactions.

### 🎮 Distraction-Free Focus Portal
* **Embedded Study Platform:** Embed your primary video/lecture portal (e.g., Physics Wallah, Unacademy) directly inside the app.
* **🖥️ Fullscreen Focus Mode:** One-click full-screen toggle for distraction-free watching.
* **⏱️ Auto-Session Stopwatch:** Launching the portal starts a live session timer. Ending a session automatically calculates study hours, awards **+100 XP**, and logs the session to your tracker!

### 📊 Mock Test & Analytics Engine
* **Detailed Test Logging:** Track Physics, Chemistry, and Math breakdown scores (out of 300), total attempts, and incorrect entries.
* **Subject-Wise Averages & Radar:** Instant visual analytics for average scores, best performance, and subject accuracy.
* **Chart.js Visualizations:** Dynamic line charts tracking overall test score trends against target goals.

### 🎯 Subject Goals & Target Tracking
* Set individual target completion percentages and score goals for Physics, Chemistry, and Math.
* Semi-circle gauge visuals comparing current progress against your set milestones.

### 🏆 Gamification & Rewards
* **Daily Streaks (🔥):** Keep your momentum going by logging daily activities.
* **XP System (⚡):** Earn XP for completing chapter stages (+50 XP), logging study sessions (+100 XP), and beating mock test targets (+200 XP).
* **16 Unlockable Badges:** Unlock milestone cards like *Physics Wizard*, *Century Club*, *Streak Master*, and *PYQ Slayer*.

### ⏱️ Daily Study Hours Logger
* Separate logging for **Lecture Time** vs. **Problem-Solving / Practice Time**.
* Animated circular gauge comparing today's logged hours against your daily target.
* Weekly bar chart visualizing study consistency over the last 7 days.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend:** HTML5, Modern CSS, Vanilla JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
* **Charts:** [Chart.js](https://www.chartjs.org/) (via CDN)
* **Fonts:** Inter & JetBrains Mono (via Google Fonts)
* **Storage:** Browser `localStorage` (Key: `jeeCommandCenter_v3`)

---

## 🚀 Quick Setup & Usage

### Running Locally
1. Clone the repository:
   ```bash}_
   git clone [https://somyal.github.io/Study-website/](https://somyal.github.io/Study-website/)
   
   
💾 Data Backup & Privacy

All data is strictly stored locally on your device. To ensure you never lose your progress:

    Go to Settings & Backup tab inside the dashboard.

    Click ⬇️ Export Data (JSON) to download a complete backup file.

    Use ⬆️ Import Data (JSON) to restore your progress on any new device or browser.

📜 License

Distributed under the MIT License. Feel free to fork, customize, and adapt for your personal study workflow!
