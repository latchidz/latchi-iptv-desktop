// ═══ ج54: اختبار E2E — إثبات حل شكاوى النسخة القديمة + ميزة الموقع الحقيقي للصلاة ═══
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
require('./test_xtream_mock.js');
const RemoteServer = require('./remote');

const cacheDir = () => { const dir = path.join(app.getPath('userData'), 'cache'); try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {} return dir; };
const cacheFile = (key) => path.join(cacheDir(), crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 24) + '.json');
ipcMain.handle('set-fullscreen', () => {});
ipcMain.handle('is-fullscreen', () => false);
ipcMain.handle('app-quit', () => app.quit());
ipcMain.handle('clipboard-read', () => '');
ipcMain.handle('device-id', () => 'PC-TEST');
ipcMain.handle('app-info', () => ({ version: '1.1.2', name: 'LATCHI IPTV', platform: os.platform() }));
ipcMain.handle('open-external', () => {});
ipcMain.handle('cache-get', (e, key) => { try { const f = cacheFile(key); if (!fs.existsSync(f)) return null; return JSON.parse(fs.readFileSync(f, 'utf8')).v ?? null; } catch (err) { return null; } });
ipcMain.handle('cache-set', (e, key, value) => { try { fs.writeFileSync(cacheFile(key), JSON.stringify({ v: value })); return true; } catch (err) { return false; } });
ipcMain.handle('cache-clear', () => true);
let win = null;
ipcMain.handle('remote-start', (e, cfg) => {
  try {
    const r = RemoteServer.start({ port: 37777, pin: '', getWin: () => win, appVer: '1.1.2' });
    return { ok: !!r.ok, ips: RemoteServer.lanIps(), port: RemoteServer.port, pin: '' };
  } catch (err) { return { ok: false }; }
});
ipcMain.handle('remote-stop', () => ({ ok: true }));
ipcMain.on('remote-state', () => {});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const consoleLines = [];

app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 1280, height: 720, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, webSecurity: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.on('console-message', (_e, lvl, msg) => { consoleLines.push(`[${lvl}] ${msg}`); });
  win.webContents.once('did-finish-load', async () => {
    const out = {};
    try {
      // ── 1) شكوى السبلاش العالقة: يجب أن يتجاوز الإقلاع السبلاش خلال ~2ث (بلا حساب → شاشة التفعيل)
      await sleep(2600);
      out.boot = await win.webContents.executeJavaScript(`(() => ({
        screen: App.screen,
        splashGone: App.screen !== 'splash',
        verifyFieldsOk: !!(document.getElementById('codeInput') && document.getElementById('codeBtn')),
        remoteOk: !!(App._remoteInfo && App._remoteInfo.ok)
      }))()`);

      // ── 2) زرع مصدر + الرئيسية: فحص الشريط العلوي الكامل + زر البحث يعمل فعلاً
      out.home = await win.webContents.executeJavaScript(`(async () => {
        const r = {};
        App.src = { type: 'xtream', categories: { live: [{id:'1',name:'وطني'}], movie: [{id:'2',name:'عربي'}], series: [{id:'3',name:'دراما'}] } };
        LatchiAPI._src = { type: 'xtream', server: 'http://127.0.0.1:8899', username: 'u', password: 'p', categories: App.src.categories };
        App.user = { name: 'اختبار', expires: '2027-01-01', code: '123456' };
        App.show('home', true);
        await new Promise(r2 => setTimeout(r2, 700));
        const clock = document.getElementById('clock');
        r.clockRunning = !!(clock && String(clock.textContent).trim().length >= 3);
        r.searchBtnHasIcon = (document.getElementById('globalSearchBtn').innerHTML || '').includes('svg');
        r.searchBtnHasClick = typeof document.getElementById('globalSearchBtn').onclick === 'function';
        r.userChipFilled = (document.getElementById('userChip').innerHTML || '').length > 0;
        r.exitBtnHasIcon = (document.getElementById('exitBtn').innerHTML || '').includes('svg');
        // زر البحث يفتح فعلاً (بمصدر مفعّل)
        document.getElementById('globalSearchBtn').click();
        await new Promise(r2 => setTimeout(r2, 300));
        r.searchOpens = App.gsearchOpen();
        App.gsearchClose();
        return r;
      })()`);

      // ── 3) ميزة الموقع الحقيقي: حوار الولايات → اختيار سطيف → حفظ + مواقيت سطيف من aladhan (شبكة حقيقية)
      out.prayer = await win.webContents.executeJavaScript(`(async () => {
        const r = {};
        // افتح الحوار بالنقر على الشريحة
        document.getElementById('prayerChip').onclick();
        await new Promise(r2 => setTimeout(r2, 250));
        r.dlgOpen = !!(document.getElementById('prayerDlg') && document.getElementById('prayerDlg').classList.contains('on'));
        r.cityRows = document.querySelectorAll('#prayerDlg .pcat').length;
        // ابحث عن صف سطيف وانقره
        const rows = [...document.querySelectorAll('#prayerDlg .pcat')];
        const setif = rows.find(x => x.textContent.includes('سطيف'));
        r.setifFound = !!setif;
        if (setif) setif.click();
        await new Promise(r2 => setTimeout(r2, 250));
        r.dlgClosedAfterPick = !(document.getElementById('prayerDlg').classList.contains('on'));
        r.savedCity = localStorage.getItem('prayer_city');
        // انتظر جلب المواقيت من aladhan بالإحداثيات الحقيقية (شبكة)
        await new Promise(r2 => setTimeout(r2, 6000));
        const pc = JSON.parse(localStorage.getItem('prayer_cache') || 'null');
        r.prayerCache = pc ? { region: pc.region, hasTimings: !!(pc.timings && pc.timings.Maghrib) } : null;
        // الشريحة تعرض المدينة + الصلاة القادمة
        const txt = document.getElementById('prayerTxt').textContent;
        r.chipText = txt;
        r.chipShowsCity = txt.includes('سطيف');
        return r;
      })()`);

    } catch (e) {
      out.ERROR = String(e && e.stack || e);
    }
    console.log('=====J54-RESULT=====');
    console.log(JSON.stringify(out, null, 1));
    console.log('=====CONSOLE=====');
    console.log(consoleLines.filter(l => !/Security Warning|security risks|electronjs.org|For more info|once the app|enabled. This|Policy set|will not show/.test(l)).slice(0, 20).join('\n'));
    app.exit(0);
  });
});
app.on('window-all-closed', () => app.quit());
