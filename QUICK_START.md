# 🚀 StreamDachi - Quick Start Guide

## Choose Your Mode

StreamDachi works in **two modes** automatically:

### 🌍 **Replit (Web) Mode** ← You're here now!
- Runs on Replit with PostgreSQL database
- Already configured and working
- No setup needed

### 💻 **Local Mode** ← For testing on your computer
- Runs on your computer with SQLite
- Perfect for making edits and testing
- No internet needed for database

---

## 🎯 Running Locally (Super Easy!)

### Windows

**Just double-click:**
```
START_LOCAL.bat
```

That's it! The launcher will:
- ✅ Check if packages are installed
- ✅ Install them if needed (first time only)
- ✅ Start the server on `http://localhost:5000`
- ✅ Show you when it's ready

**Stop the server:** Press `Ctrl+C` in the window

---

### Mac / Linux

**Open Terminal and run:**
```bash
./run_local.sh
```

**First time only:** Make it executable
```bash
chmod +x run_local.sh
./run_local.sh
```

---

## 📁 What You'll See

When you start local mode:

```
  ===================================================
    STREAMDACHI - LOCAL MODE
  ===================================================

  Database: SQLite (app.db)
  Server: http://localhost:5000

  [1/2] Checking dependencies...
  Dependencies OK!

  [2/2] Starting StreamDachi...

  ===================================================
    SERVER RUNNING
  ===================================================

  Open your browser to: http://localhost:5000

  Press Ctrl+C to stop the server
  ===================================================
```

**Now open your browser:** `http://localhost:5000`

---

## 🔄 Workflow for Testing Changes

### While Replit is Running:

1. **Download your project** to your computer
2. **Double-click** `START_LOCAL.bat` (Windows) or run `./run_local.sh` (Mac/Linux)
3. **Open** `http://localhost:5000` in your browser
4. **Make edits** to the code on your computer
5. **Test changes** on your local server
6. **Upload changes** back to Replit when ready

### Why This Works:

- **Replit stays live** - Your production site keeps running
- **Local testing** - Test changes without affecting live site
- **Separate databases** - Local SQLite vs Replit PostgreSQL
- **Edit safely** - Break things locally without consequences

---

## 📊 File Locations

### Local Mode Creates:

- `app.db` - Your SQLite database (backup this file!)
- `node_modules/` - Installed packages (don't backup)

### You Can:

- **Backup**: Copy `app.db` to save your data
- **Reset**: Delete `app.db` to start fresh
- **Share**: Send `app.db` with project files

---

## 💡 Pro Tips

### First Time Setup

1. **Run once** - Let it install packages (takes ~1 minute)
2. **Keep window open** - Don't close the terminal
3. **Browser auto-opens** - Visit `http://localhost:5000`

### Daily Use

1. **Double-click launcher** - Starts instantly
2. **Edit code** - Changes reload automatically (Vite HMR)
3. **Ctrl+C** to stop - Always use this to shut down properly

### Troubleshooting

**Port already in use?**
- Close the old terminal window
- Or kill the process: `taskkill /F /IM node.exe` (Windows)

**Database error?**
- Delete `app.db` and restart
- Check file permissions

**Can't find npm?**
- Install Node.js from nodejs.org
- Restart terminal after installing

---

## 🎯 Common Scenarios

### Scenario 1: Quick Test
```
1. Double-click START_LOCAL.bat
2. Wait 5 seconds
3. Open http://localhost:5000
4. Done!
```

### Scenario 2: Making Edits
```
1. Start local mode
2. Open code in your editor
3. Edit files
4. Browser auto-refreshes (Vite)
5. Test your changes
6. Press Ctrl+C when done
```

### Scenario 3: Testing Before Replit Update
```
1. Make changes locally
2. Test thoroughly
3. If good: Upload to Replit
4. If bad: Ctrl+C and try again
```

---

## ⚡ Speed Tips

### Make a Desktop Shortcut (Windows)

1. **Right-click** `START_LOCAL.bat`
2. **Send to** → Desktop (create shortcut)
3. **Rename** to "StreamDachi Local"
4. **Double-click** the shortcut anytime!

### Pin to Taskbar (Windows)

1. Create shortcut (above)
2. Drag shortcut to taskbar
3. One-click launch!

### Create Alias (Mac/Linux)

Add to `~/.bashrc` or `~/.zshrc`:
```bash
alias streamdachi="cd /path/to/StreamDachi && ./run_local.sh"
```

Now just type `streamdachi` in terminal!

---

## 🔐 Environment Variables

Local mode needs the same API keys as web mode:

**Create `.env` file in project root:**
```env
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
SESSION_SECRET=random_string_here
```

**Get API Keys:**
- Twitch: https://dev.twitch.tv/console/apps
- Groq: https://console.groq.com/

---

## 🎉 You're Ready!

**Windows:** Double-click `START_LOCAL.bat`
**Mac/Linux:** Run `./run_local.sh`

Open `http://localhost:5000` and enjoy StreamDachi!

---

## 📞 Need Help?

Check these files:
- `LOCAL_SETUP.md` - Detailed setup guide
- `README.md` - Project documentation

Happy streaming! 🎮✨
