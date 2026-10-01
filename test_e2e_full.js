// ═══ ج53: اختبار E2E شامل — التطبيق الحقيقي داخل Electron + خادم xtream وهمي ═══
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
require('./test_xtream_mock.js');
const RemoteServer = require('./remote');

// ═══ نفس معالجات IPC من main.js (كي يعمل التطبيق الحقيقي بلا تعديل) ═══
const cacheDir = () => { const dir = path.join(app.getPath('userData'), 'cache'); try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {} return dir; };
const cacheFile = (key) => path.join(cacheDir(), crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 24) + '.json');
ipcMain.handle('set-fullscreen', (e, on) => {});
ipcMain.handle('is-fullscreen', () => false);
ipcMain.handle('app-quit', () => app.quit());
ipcMain.handle('clipboard-read', () => '');
ipcMain.handle('device-id', () => 'PC-TEST');
ipcMain.handle('app-info', () => ({ version: '1.1.1', name: 'LATCHI IPTV', platform: os.platform() }));
ipcMain.handle('open-external', () => {});
ipcMain.handle('cache-get', (e, key) => { try { const f = cacheFile(key); if (!fs.existsSync(f)) return null; return JSON.parse(fs.readFileSync(f, 'utf8')).v ?? null; } catch (err) { return null; } });
ipcMain.handle('cache-set', (e, key, value, ttl) => { try { fs.writeFileSync(cacheFile(key), JSON.stringify({ v: value, exp: Date.now() + 99999999 })); return true; } catch (err) { return false; } });
ipcMain.handle('cache-clear', () => true);
ipcMain.handle('remote-start', (e, cfg) => {
  try {
    const r = RemoteServer.start({ port: (cfg && cfg.port) || 37777, pin: (cfg && cfg.pin) || '', getWin: () => win, appVer: '1.1.1' });
    return { ok: !!r.ok, ips: RemoteServer.lanIps(), port: RemoteServer.port, pin: RemoteServer.pin };
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
});
ipcMain.handle('remote-stop', () => { try { RemoteServer.stop(); } catch (e) {} return { ok: true }; });
ipcMain.on('remote-state', (e, st) => { try { RemoteServer.pushState(st); } catch (err) {} });

let win = null;
const consoleLines = [];

const httpReq = (method, url, body) => new Promise((resolve) => {
  const req = http.request(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {} }, (res) => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => { try { resolve({ code: res.statusCode, json: JSON.parse(b) }); } catch (e) { resolve({ code: res.statusCode, raw: b.slice(0, 200) }); } });
  });
  req.on('error', (e) => resolve({ error: String(e) }));
  if (body) req.write(body);
  req.end();
});
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
      await sleep(3000);   // boot + remoteStart + فهرسة استباقية

      // ── 1) الإقلاع: هل boot اشتغل والتطبيق حي؟
      out.boot = await win.webContents.executeJavaScript(`(async () => ({
        screen: App.screen, bootOk: App.screen !== 'splash',
        playerVideo: !!Player.video, playerUi: !!Player.ui,
        remoteInfo: App._remoteInfo || null,
        pPlayLen: (document.getElementById('pPlay').innerHTML || '').length,
        pExitLen: (document.getElementById('pExit').innerHTML || '').length,
        vtabCodeHasInput: !!document.getElementById('codeInput'),
        vtabCodeBtn: !!document.getElementById('codeBtn')
      }))()`);

      // ── 2) زرع مصدر xtream وهمي (خادم 8899) + جاسوس الأوامر
      await win.webContents.executeJavaScript(`(async () => {
        App.src = { type: 'xtream', categories: { live: [{id:'1',name:'وطني'},{id:'9',name:'رياضة'}], movie: [{id:'2',name:'عربي'}], series: [{id:'3',name:'دراما'},{id:'8',name:'تركية'}] } };
        LatchiAPI._src = { type: 'xtream', server: 'http://127.0.0.1:8899', username: 'u', password: 'p', categories: App.src.categories };
        window.__spy = [];
        const orig = App.remoteApplyKey.bind(App);
        App.remoteApplyKey = (cmd) => { window.__spy.push(cmd); return orig(cmd); };
        App._gsIdx = null;
        return true;
      })()`);

      // ── 3) الريموت عبر HTTP فعلي: ping ثم cmd ثم search
      out.ping = await httpReq('GET', 'http://127.0.0.1:37777/ping');
      out.cmd = await httpReq('POST', 'http://127.0.0.1:37777/cmd', JSON.stringify({ action: 'volume', delta: 0.05 }));
      await sleep(400);
      out.spy = await win.webContents.executeJavaScript(`window.__spy`);
      out.search = await httpReq('GET', 'http://127.0.0.1:37777/search?q=' + encodeURIComponent('الجزائر'));

      // ── 4) قسم المسلسلات + لوحة المواسم والحلقات
      out.series = await win.webContents.executeJavaScript(`(async () => {
        const r = {};
        await App.openList('series');
        r.screen = App.screen;
        r.miniWrapHidden = document.getElementById('miniWrap').style.display === 'none';
        // اختر مسلسل النور (seriesId 7)
        const it = { id: 'S7', name: 'مسلسل النور', type: 'series', seriesId: '7', logo: '', group: 'دراما' };
        App.selectItem(it);
        await new Promise(r2 => setTimeout(r2, 1200));   // تحميل المواسم من الخادم الوهمي
        const seasons = [...document.querySelectorAll('.sp-season')];
        r.seasonCount = seasons.length;
        r.seasonLabels = seasons.map(s => s.textContent.replace(/\\s+/g, ' ').trim());
        r.epsShown = document.querySelectorAll('.sp-ep').length;
        r.epsFirstSeason = [...document.querySelectorAll('.sp-ep .n')].map(e => e.textContent.trim());
        // اضغط الموسم 2 → حلقات الموسم 2 فقط
        const s2 = seasons[1];
        if (s2) s2.click();
        await new Promise(r2 => setTimeout(r2, 300));
        r.epsAfterSeason2 = document.querySelectorAll('.sp-ep').length;
        r.eps2Names = [...document.querySelectorAll('.sp-ep .t')].map(e => e.textContent.trim());
        r.activeSeason = (document.querySelector('.sp-season.active') || {}).textContent || '';
        r.zapListLen = (App._zapList || []).length;
        // zapList للموسم الثاني: أول عنصر يجب أن يكون حلقة الموسم 2 الأولى (201)
        r.zap2First = (App._zapList || []).map(z => z.name).slice(0, 8);
        return r;
      })()`);

      // ── 5) المصغر والتكبير السلس (قناة live)
      out.miniFull = await win.webContents.executeJavaScript(`(async () => {
        const r = {};
        await App.openList('live');
        r.miniWrapVisible = document.getElementById('miniWrap').style.display !== 'none';
        App.listCtx = { kind: 'live', items: [{id:'L11', name:'قناة الجزائر الأولى', type:'live', url:'http://127.0.0.1:8899/fake.m3u8', group:'وطني'}], cat: 'الكل', title: 'البث', selected: null, loading: false };
        App.buildList();
        App.selectItem(App.listCtx.items[0]);
        await new Promise(r2 => setTimeout(r2, 600));
        App.miniFull();
        await new Promise(r2 => setTimeout(r2, 400));
        r.screen = App.screen;
        r.playerActive = document.getElementById('player').classList.contains('active');
        r.miniInsidePlayer = !!document.getElementById('miniVid').closest('#player');
        r.miniClass = document.getElementById('miniVid').className;
        r.pName = document.getElementById('pName').textContent;
        r.pFavText = (document.getElementById('pFav').innerHTML || '').includes('مفضلة');
        r.pPlayLen = (document.getElementById('pPlay').innerHTML || '').length;
        const cs = getComputedStyle(document.getElementById('miniVid'));
        r.miniComputed = { position: cs.position, width: cs.width, height: cs.height };
        // ارجوع للخلف → المصغر يعود
        App.back();
        await new Promise(r2 => setTimeout(r2, 300));
        r.afterBackScreen = App.screen;
        r.miniBackInDetail = !!document.getElementById('miniVid').closest('#paneDetail');
        return r;
      })()`);

      // ── 6) تشغيل حلقة من لوحة المسلسل (remotePlay لمسلسل)
      out.remotePlaySeries = await win.webContents.executeJavaScript(`(async () => {
        const r = await App.remotePlay({ id: 'S7', name: 'مسلسل النور', type: 'series', seriesId: '7', logo: '', group: 'دراما' });
        await new Promise(r2 => setTimeout(r2, 1200));
        return { reply: r, screen: App.screen, seasonsShown: document.querySelectorAll('.sp-season').length, miniWrapHidden: document.getElementById('miniWrap').style.display === 'none' };
      })()`);

    } catch (e) {
      out.ERROR = String(e && e.stack || e);
    }
    console.log('=====E2E-RESULT=====');
    console.log(JSON.stringify(out, null, 1));
    console.log('=====CONSOLE=====');
    console.log(consoleLines.filter(l => !/Security Warning|security risks|electronjs.org|For more info|once the app|enabled. This|Policy set|will not show/.test(l)).slice(0, 25).join('\n'));
    app.exit(0);
  });
});
app.on('window-all-closed', () => app.quit());
