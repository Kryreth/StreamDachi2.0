# Visual Studio Code Setup for StreamDachi

This guide will help you set up Visual Studio Code for easy local development and testing with StreamDachi.

## 🎯 Quick Start

1. **Open folder** in VS Code
2. **Press F5** to start
3. Server runs at `http://localhost:5000`

That's it! The configuration is already set up for you.

---

## 📁 Configuration Files

The `.vscode` folder contains pre-configured files:

- **tasks.json** - Automated tasks (build, run, test)
- **launch.json** - Debug configurations
- **settings.json** - VS Code workspace settings

These files are already created and ready to use!

---

## 🚀 Running StreamDachi

### Method 1: Press F5 (Easiest!)

1. Open StreamDachi folder in VS Code
2. **Press F5** on your keyboard
3. Server starts automatically
4. Integrated terminal shows logs

### Method 2: Run Menu

1. Click **Run** menu → **Start Debugging**
2. Or click the "Run and Debug" icon (▶️) in sidebar
3. Select "🚀 Launch StreamDachi (Local)"

### Method 3: Task Runner

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Run Task"
3. Select "🚀 Start StreamDachi (Local Mode)"

---

## 🎮 Available Tasks

Press `Ctrl+Shift+P` → "Tasks: Run Task" to access:

### 🚀 Start StreamDachi (Local Mode)
- Starts the full application
- Opens dedicated terminal
- Auto-restarts on file changes
- SQLite database mode

**Shortcut**: Terminal → Run Task → Start StreamDachi

### 📦 Install Dependencies
- Runs `npm install`
- Installs all packages
- Updates package-lock.json

**When to use**: After pulling updates or first setup

### 🔍 Type Check
- Runs TypeScript compiler
- Checks for type errors
- No output files generated

**When to use**: Before committing code

### 🗄️ Push Database Schema
- Syncs schema to database
- Works for both PostgreSQL and SQLite
- Safe migration tool

**When to use**: After changing `shared/schema.ts`

---

## 🐛 Debug Configurations

### 🚀 Launch StreamDachi (Local)
**Best for**: Quick testing
- Starts server in debug mode
- No breakpoints set
- Fast startup

### 🐛 Debug StreamDachi
**Best for**: Troubleshooting
- Full debugging capabilities
- Set breakpoints in code
- Inspect variables
- Step through code

**How to debug:**
1. Click line number to set breakpoint (red dot)
2. Press F5 to start debugging
3. Code pauses at breakpoint
4. Use debug controls (Continue, Step Over, Step Into)

---

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Start Debugging | `F5` | `F5` |
| Stop Debugging | `Shift+F5` | `Shift+F5` |
| Restart | `Ctrl+Shift+F5` | `Cmd+Shift+F5` |
| Run Task | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Toggle Terminal | `` Ctrl+` `` | `` Cmd+` `` |
| Open Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |

---

## 📝 Recommended Extensions

Install these VS Code extensions for the best experience:

### Essential
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript and JavaScript Language Features** (built-in)

### Recommended
- **Tailwind CSS IntelliSense** - Auto-complete for Tailwind
- **Error Lens** - Inline error display
- **Path Intellisense** - Auto-complete file paths
- **SQLite Viewer** - View `app.db` database
- **GitLens** - Enhanced Git features

### Optional
- **Thunder Client** - API testing
- **Better Comments** - Highlight TODOs
- **Bracket Pair Colorizer** - Rainbow brackets

---

## 🎨 Workspace Settings

The `.vscode/settings.json` file configures:

✅ **Auto-format on save** - Using Prettier
✅ **ESLint auto-fix** - Fixes issues on save
✅ **Organize imports** - Removes unused imports
✅ **TypeScript version** - Uses workspace version
✅ **File exclusions** - Hides node_modules, .git, etc.

You can customize these by editing `.vscode/settings.json`.

---

## 🔄 Development Workflow

### Typical Session

1. **Open VS Code** → Open StreamDachi folder
2. **Press F5** → Starts server
3. **Edit code** → Changes auto-reload
4. **View logs** → Integrated terminal
5. **Test in browser** → `http://localhost:5000`
6. **Stop server** → Press `Shift+F5`

### Making Changes

1. **Edit files** normally
2. **Save** (`Ctrl+S` / `Cmd+S`)
3. **Auto-reload** happens automatically (Vite HMR)
4. **Refresh browser** if needed

### Database Changes

1. **Edit** `shared/schema.ts` or `shared/schema-sqlite.ts`
2. **Run task** → "🗄️ Push Database Schema"
3. **Restart server** if needed

---

## 🐛 Debugging Tips

### Setting Breakpoints

1. **Click** left of line number (red dot appears)
2. **Start debugging** (F5)
3. **Code pauses** when breakpoint is hit
4. **Inspect** variables in left panel

### Debug Console

- **Evaluate expressions** while paused
- **Type** variable names to see values
- **Run** JavaScript commands

### Call Stack

- Shows **where you are** in code execution
- **Click** to jump to that line
- Useful for **tracing** function calls

### Variables Panel

- Shows **all variables** in current scope
- **Expand objects** to see properties
- **Watch expressions** for specific values

---

## 📊 Viewing the Database

### Using SQLite Viewer Extension

1. **Install** "SQLite Viewer" extension
2. **Right-click** `app.db` file
3. **Select** "Open Database"
4. **Browse** tables and data

### Using Command Line

```bash
# Open SQLite shell
sqlite3 app.db

# List all tables
.tables

# View table structure
.schema user_profiles

# Query data
SELECT * FROM user_profiles;

# Exit
.quit
```

---

## 🚨 Troubleshooting

### "Cannot find module"

**Solution**: Run "📦 Install Dependencies" task

### "Port 5000 already in use"

**Solutions**:
1. Stop other instances (`Shift+F5`)
2. Kill process: `taskkill /F /IM node.exe` (Windows)
3. Change port in `server/index.ts`

### Breakpoints not working

**Solutions**:
1. Use "🐛 Debug StreamDachi" configuration
2. Ensure source maps enabled
3. Restart VS Code

### Auto-format not working

**Solutions**:
1. Install Prettier extension
2. Set Prettier as default formatter
3. Check `.vscode/settings.json`

---

## 💡 Pro Tips

### Terminal Management

- **Split terminal**: Click "Split Terminal" icon
- **Multiple terminals**: Run server in one, commands in another
- **Clear terminal**: Type `clear` or `cls` (Windows)

### Quick Navigation

- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Search in all files
- `F12` - Go to definition
- `Alt+Left/Right` - Navigate back/forward

### Zen Mode

Press `Ctrl+K Z` for distraction-free coding!

### Multiple Cursors

Hold `Alt` and click to add cursors
Edit multiple lines at once!

---

## 🎯 VS Code vs Batch File

| Feature | VS Code (F5) | START_LOCAL.bat |
|---------|-------------|-----------------|
| Speed | Fast | Fast |
| Debugging | ✅ Full support | ❌ No debugging |
| Breakpoints | ✅ Yes | ❌ No |
| Integrated | ✅ In editor | ❌ Separate window |
| Auto-reload | ✅ HMR | ✅ Via Vite |
| Ease | Press F5 | Double-click |

**Recommendation**: Use VS Code (F5) for development, batch file for quick demos.

---

## 🔐 Environment Variables in VS Code

The launch configurations automatically load `.env` file variables.

**Important**: Never commit `.env` to Git!

Add to `.gitignore`:
```
.env
.env.local
```

---

## 📚 Additional Resources

- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [VS Code Tasks](https://code.visualstudio.com/docs/editor/tasks)
- [TypeScript in VS Code](https://code.visualstudio.com/docs/languages/typescript)

---

## ✨ Ready to Code!

You're all set! Here's your workflow:

1. **Open folder** in VS Code
2. **Press F5**
3. **Code & test**
4. **Press Shift+F5** to stop

Happy coding! 🎮✨
