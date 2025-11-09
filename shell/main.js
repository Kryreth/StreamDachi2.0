
// Electron shell to display local TwitchMind UI in a contained window.
const { app, BrowserWindow } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#121212',
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    icon: path.join(__dirname, 'assets', 'app.ico')
  });
  const url = process.env.APP_URL || 'http://127.0.0.1:4173/';
  win.loadURL(url);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
