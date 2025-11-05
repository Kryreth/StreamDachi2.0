# StreamDachi - Local Mode Setup Guide

StreamDachi now supports **dual-mode operation**: it automatically runs on **PostgreSQL** when on Replit (web mode) and **SQLite** when running locally on your computer (no internet required).

## 🌍 How It Works

The application **automatically detects** which environment it's running in:

- **Replit (Web Mode)**: Uses PostgreSQL/Neon serverless database
- **Local Mode**: Uses SQLite with `app.db` file (no internet needed)

Detection happens via `process.env.REPLIT` - no manual configuration required!

---

## 💻 Running Locally (Windows)

### Quick Start - Three Ways to Start!

#### Option 1: Batch File (Double-Click)
1. **Download** all files to your computer
2. **Double-click** `START_LOCAL.bat`
3. **Open browser** to `http://localhost:5000`

#### Option 2: Visual Studio Code (Recommended for Development)
1. **Open folder** in VS Code
2. **Press F5** or click the "Run and Debug" button (▶️)
3. Select "🚀 Launch StreamDachi (Local)"
4. **Auto-opens** at `http://localhost:5000`

#### Option 3: VS Code Task Runner
1. **Open VS Code**
2. **Press** `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Run Task" and select **Tasks: Run Task**
4. Select "🚀 Start StreamDachi (Local Mode)"
5. **Opens** in integrated terminal

### What Happens

The launchers will:
- Install all dependencies (`npm install`) if needed
- Create `app.db` SQLite database automatically
- Start the server on port 5000
- Connect to Twitch using your credentials

---

## 🐧 Running Locally (Linux/Mac)

### Quick Start

```bash
# Make the script executable
chmod +x run_local.sh

# Run the script
./run_local.sh
```

### Manual Start

If you prefer to run commands manually:

```bash
# Install dependencies
npm install

# Start the server
npx tsx server/index.ts
```

The server will automatically:
- Detect local environment
- Create `app.db` if it doesn't exist
- Start on `http://localhost:5000`

---

## 📦 Database File

### Location
- **File**: `app.db` (created in project root)
- **Type**: SQLite database with WAL mode enabled

### Important Notes

1. **Backup**: Copy `app.db` to backup your data
2. **Fresh Start**: Delete `app.db` to reset everything
3. **Portable**: Move `app.db` with your project files

### What's Stored

All your StreamDachi data:
- Chat messages and AI analysis
- User profiles (VIPs, mods, subs)
- Voice AI responses and transcriptions
- Settings and configurations
- Raid history and mod actions

---

## 🔄 Switching Between Modes

### Web → Local

1. Download the project
2. Run `run_local.bat` (Windows) or `run_local.sh` (Linux/Mac)
3. Fresh SQLite database created automatically

### Local → Web

1. Upload to Replit
2. Run normally - auto-detects Replit environment
3. Uses PostgreSQL database automatically

**Note**: Data does NOT sync between modes - they use separate databases.

---

## 🔧 Configuration

### No Configuration Needed!

The dual-mode system automatically:
- Detects your environment
- Selects the correct database
- Uses appropriate connection settings

### Environment Variables (Required for Full Features)

Create a `.env` file in the project root:

```env
# Twitch Integration (Required)
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here

# AI Features (Required)
GROQ_API_KEY=your_groq_key_here

# Session Security (Required)
SESSION_SECRET=your_random_secret_here
```

**How to Get API Keys:**

1. **Twitch**: Visit [Twitch Developer Console](https://dev.twitch.tv/console/apps)
   - Create a new application
   - Set OAuth Redirect URL to `http://localhost:5000/auth/twitch/callback`
   - Copy Client ID and Client Secret

2. **Groq AI**: Visit [Groq Console](https://console.groq.com/)
   - Sign up for free account
   - Create new API key
   - Copy the key (starts with `gsk_`)

3. **Session Secret**: Generate a random string
   - Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or any random 64+ character string

---

## 📦 System Requirements & Dependencies

### Prerequisites

Before running StreamDachi locally, ensure you have:

1. **Node.js** (v18 or higher)
   - Download: [https://nodejs.org/](https://nodejs.org/)
   - Check version: `node --version`

2. **npm** (comes with Node.js)
   - Check version: `npm --version`

3. **Git** (optional, for cloning)
   - Download: [https://git-scm.com/](https://git-scm.com/)

### Core Dependencies

StreamDachi uses these major packages (auto-installed via `npm install`):

#### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Fast build tool and dev server
- **Wouter** - Lightweight routing (10+ pages)
- **TanStack Query v5** - Server state management
- **Tailwind CSS** - Styling framework
- **Shadcn UI** - Component library (New York variant)
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library
- **Recharts** - Data visualization charts
- **Framer Motion** - Animations

#### Backend
- **Express.js** - Web server framework
- **WebSocket (ws)** - Real-time communication
- **Drizzle ORM** - Type-safe database ORM
- **better-sqlite3** - SQLite driver (local mode)
- **@neondatabase/serverless** - PostgreSQL driver (web mode)
- **tsx** - TypeScript execution
- **Passport.js** - Authentication

#### External APIs
- **tmi.js** - Twitch chat/IRC integration
- **groq-sdk** - Groq AI API (Llama models)
- **Web Speech API** - Voice recognition (browser)
- **Puter.js** - Text-to-Speech (free unlimited)

#### Development Tools
- **TypeScript** - Type safety
- **drizzle-kit** - Database migrations
- **Zod** - Schema validation
- **ESBuild** - Fast bundler

### Full Dependency List

Run `npm install` to automatically install all 70+ packages, including:

**UI Components**: 25+ Radix UI primitives (dialog, dropdown, select, etc.)
**TypeScript Types**: @types packages for all major libraries
**Utilities**: clsx, tailwind-merge, class-variance-authority
**Forms**: react-hook-form, @hookform/resolvers
**Session Management**: express-session, connect-pg-simple
**Date Handling**: date-fns
**And more!**

All dependencies are listed in `package.json` and auto-installed.

---

## 🚀 Features Available Offline

When running locally, you can use:

✅ **Full Chat Integration** - Twitch IRC connection
✅ **AI Analysis** - Groq AI (requires internet for API calls)
✅ **Voice Recognition** - Browser-based (offline capable)
✅ **TTS Voice** - Puter.js (requires internet)
✅ **Database** - SQLite (completely offline)
✅ **All Dashboard Features** - Analytics, monitoring, settings

---

## 📁 File Structure

```
StreamDachi/
├── app.db              # SQLite database (created automatically)
├── run_local.bat       # Windows launcher
├── run_local.sh        # Linux/Mac launcher
├── server/
│   ├── db-config.ts    # Dual-mode database config
│   ├── db.ts           # Database exports
│   └── ...
├── shared/
│   ├── schema.ts       # PostgreSQL schema
│   └── schema-sqlite.ts # SQLite schema
└── ...
```

---

## 🐛 Troubleshooting

### "Database connection failed"

**Replit Mode**: Check DATABASE_URL environment variable
**Local Mode**: Ensure write permissions in project folder

### "Port 5000 already in use"

Kill the process using port 5000 or change the port in `server/index.ts`

### "npm install fails"

Try:
```bash
npm cache clean --force
npm install
```

### "App won't start locally"

1. Check you have Node.js installed (`node --version`)
2. Ensure all dependencies installed (`npm install`)
3. Check for error messages in console
4. Try deleting `app.db` and restarting

---

## 🔐 Security Notes

### Local Mode

- **No external database** - All data stored in `app.db`
- **File permissions** - Secure your `app.db` file
- **API keys** - Store in `.env` file (don't commit!)

### Web Mode (Replit)

- **Replit Secrets** - Uses built-in secrets management
- **PostgreSQL** - Hosted securely on Neon
- **HTTPS** - Automatic SSL encryption

---

## 💡 Tips

1. **Development**: Use Replit for testing with full database features
2. **Portable Demo**: Use local mode to demo without internet
3. **Backup**: Copy `app.db` regularly when using local mode
4. **Performance**: SQLite is faster for single-user scenarios

---

## 📊 Differences Between Modes

| Feature | Web (PostgreSQL) | Local (SQLite) |
|---------|------------------|----------------|
| Database Type | PostgreSQL/Neon | SQLite |
| Internet Required | Yes | Only for APIs |
| Data Location | Cloud | Local file |
| Setup Complexity | Automatic | Automatic |
| Performance | Excellent | Faster (local) |
| Concurrent Users | Many | Single user |
| Backup | Replit handles it | Copy app.db |

---

## ❓ FAQ

**Q: Can I use the same database in both modes?**
A: No - they're separate databases. Export/import not yet implemented.

**Q: Which mode should I use?**
A: Replit for production, local for development/offline demos.

**Q: Will my data sync?**
A: No - web and local databases are independent.

**Q: Can I migrate data between modes?**
A: Not automatically - you'd need to export/import manually.

**Q: Does local mode need internet?**
A: Yes for Twitch API, Groq AI, and Puter.js TTS. Database works offline.

---

## 🎉 Ready to Go!

Your StreamDachi installation now supports both modes:

- **On Replit**: Just run normally (auto-detects)
- **On Your Computer**: Run `run_local.bat` or `run_local.sh`

Enjoy StreamDachi wherever you are! 🚀
