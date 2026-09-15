// 🖥️ LATCHI IPTV Desktop — العملية الرئيسية
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#060913',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false  // خوادم البث/السكريبت تتطلب CORS مفتوحاً (تطبيق مشغّل محلي)
    }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.setMenuBarVisibility(false);
}

// 🆔 معرّف جهاز ثابت (لنظام التحقق — نفس فلسفة أندرويد)
ipcMain.handle('device-id', () => {
  const ifaces = os.networkInterfaces();
  let mac = '';
  for (const list of Object.values(ifaces)) {
    const eth = (list || []).find(i => i && i.mac && i.mac !== '00:00:00:00:00:00');
    if (eth) { mac = eth.mac; break; }
  }
  const raw = `${os.hostname()}|${mac}|${os.platform()}|${os.arch()}`;
  return 'PC-' + crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12).toUpperCase();
});

ipcMain.handle('app-info', () => ({
  version: app.getVersion(),
  name: 'LATCHI IPTV',
  platform: os.platform()
}));

ipcMain.handle('open-external', (e, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) shell.openExternal(url);
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
