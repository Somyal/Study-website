# JEE Focus Shield - Chrome Extension

## Installation (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select this `/extension` folder
5. The extension icon will appear in your toolbar

## Usage

The extension automatically activates when you start a **Focus Session** in the JEE Command Center dashboard.

### Features
- Blocks distracting sites (Instagram, Discord, Reddit, X/Twitter, YouTube Shorts) during focus sessions
- Shows a redirect page with a link back to your JEE dashboard
- Click the extension icon to see current blocker status
- Starting a focus session toggles blocking ON
- Ending the session toggles blocking OFF

## Permissions

- `declarativeNetRequest` / `declarativeNetRequestWithHostAccess` — for dynamic rule-based blocking
- `tabs` — to detect blocked URLs and communicate with tabs
- `storage` — to persist focus session state

## Supported Sites

Blocked during active focus sessions:
- instagram.com
- discord.com
- reddit.com
- x.com / twitter.com
- youtube.com / www.youtube.com

## Troubleshooting

- If blocking doesn't activate, ensure extension is enabled and a focus session is running.
- For YouTube, all pages on youtube.com are blocked during session to prevent distraction.
- Reload the dashboard page if the extension status doesn't update.

---

*JEE Focus Shield v1.0 — Companion to JEE Command Center*