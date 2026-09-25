// 🖥️ LATCHI IPTV Desktop — العملية الرئيسية
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

let win = null;

// 📀 مجلد الكاش الدائم (يحفظ الفئات والعناصر على القرص — لا تحميل متكرر)
const cacheDir = () => {
  const dir = path.join(app.getPath('userData'), 'cache');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  return dir;
};
const cacheFile = (key) => path.join(cacheDir(), crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 24) + '.json');

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    maximize: true,   // 🛠 v1.1.3: النافذة تأخذ مقاس الشاشة كاملاً (طلب العميل)
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

// ═══ 💾 كاش القرص الدائم (الفئة تُحمَّل مرة واحدة وتبقى محفوظة) ═══
ipcMain.handle('cache-get', (e, key) => {
  try {
    const f = cacheFile(key);
    if (!fs.existsSync(f)) return null;
    const entry = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (entry && typeof entry.exp === 'number' && Date.now() > entry.exp) {
      try { fs.unlinkSync(f); } catch (e2) {}
      return null;  // انتهت صلاحيته — يُعاد جلبه من الخادم
    }
    return (entry && entry.v !== undefined) ? entry.v : null;
  } catch (err) { return null; }
});

ipcMain.handle('cache-set', (e, key, value, ttlMs) => {
  try {
    const entry = { v: value, exp: Date.now() + (parseInt(ttlMs, 10) || 12 * 3600 * 1000), ts: Date.now() };
    fs.writeFileSync(cacheFile(key), JSON.stringify(entry));
    return true;
  } catch (err) { return false; }
});

ipcMain.handle('cache-clear', () => {
  try {
    for (const f of fs.readdirSync(cacheDir())) {
      try { fs.unlinkSync(path.join(cacheDir(), f)); } catch (e2) {}
    }
    return true;
  } catch (err) { return false; }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
