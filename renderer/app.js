// ═══ 🧠 LATCHI IPTV Desktop v1.1 — العقل التطبيقي (تحميل كسوي + كاش دائم) ═══
const App = {
  src: null,          // xtream: { type, categories, lazy } | m3u: { type, live[], movies[], series[] }
  user: null,         // { name, expires, code }
  screen: 'splash',
  navStack: [],       // مكدس الرجوع (نفس فلسفة التلفاز)
  favs: JSON.parse(localStorage.getItem('favs') || '[]'),
  listCtx: null,      // { kind, cat, catId, items, title, loading }

  // ═══ الإقلاع ═══
  async boot() {
    Player.init();
    Player.hideCb = () => App.back();
    // 📋 v1.0: زر اللصق المباشر (مفوَّض — يغطي كل الحقول حتى المولّدة ديناميكياً)
    document.addEventListener('click', e => {
      const b = e.target && e.target.closest ? e.target.closest('.paste-btn[data-paste]') : null;
      if (b) this.pasteTo(b.dataset.paste, b);
    });
    this.clockTick(); setInterval(() => this.clockTick(), 1000);
    // 📱 v1.0.8: ريموت الهاتف — استقبال الأوامر + تشغيل الخادم إن كان مفعّلاً + دفع الحالة كل ثانيتين
    try {
      if (window.latchi && window.latchi.onRemoteKey) window.latchi.onRemoteKey(cmd => this.remoteApplyKey(cmd));
      if (localStorage.getItem('remote_on') === '1') this.remoteServerStart(true);
      setInterval(() => this.remotePush(), 2000);
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1400)); // سبلاش قصير (سرعة الإقلاع أهم)
    const saved = localStorage.getItem('source_url');
    if (saved) {
      this.show('verify', true);
      document.getElementById('verifyMsg').textContent = '⏳ استئناف الحساب المحفوظ...';
      this.showChecking();                    // ⏳ v1.0.1: فن «جاري التحقق» أثناء الاستئناف
      try {
        await this.loadSource(saved, true, null, { welcome: true });
        this.hideChecking();
        return;
      } catch (e) { this.hideChecking(); /* نكمل لشاشة التحقق */ }
    }
    this.show('verify', true);
  },

  clockTick() {
    const el = document.getElementById('clock');
    // ⏱ v1.0.3: الساعة تمشي بالثواني كيما التلفاز
    if (el) el.textContent = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.expTick();
    this.updatePrayerChip();     // 🕌 v1.0.6: الصلاة القادمة (حساب محلي خفيف من الكاش)
  },

  // ═══ 🕌 v1.0.6: مواقيت الصلاة بالموقع الجغرافي (نفس منطق تلفاز/هاتف أندرويد) ═══
  // ipapi.co (IP) → api.aladhan.com (method=3) — كاش يومي كامل: صفر بطء على الواجهة
  async initPrayer() {
    if (this._prayerBusy) return;
    const cache = this._prayerCache();
    const today = new Date().toISOString().slice(0, 10);
    if (cache && cache.date === today && cache.timings) return;   // كاش اليوم سليم
    if (typeof fetch !== 'function') return;
    this._prayerBusy = true;
    try {
      let sig;
      try { sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(4500) : undefined; } catch (e) {}
      let lat = 36.7538, lon = 3.0588, region = 'الجزائر';       // احتياط: العاصمة (نفس أندرويد)
      try {
        const r = await fetch('https://ipapi.co/json/', sig ? { signal: sig } : {});
        const j = await r.json();
        if (j && typeof j.latitude === 'number' && typeof j.longitude === 'number') {
          lat = j.latitude; lon = j.longitude;
          region = j.city || j.region || 'الجزائر';
        }
      } catch (e) {}
      const ts = Math.floor(Date.now() / 1000);
      const r2 = await fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lon}&method=3`, sig ? { signal: sig } : {});
      const j2 = await r2.json();
      const t = j2 && j2.data && j2.data.timings;
      if (t) localStorage.setItem('prayer_cache', JSON.stringify({
        date: today, region,
        timings: { Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha }
      }));
    } catch (e) { /* فشل صامت — لا يؤثر على الواجهة */ }
    finally { this._prayerBusy = false; }
  },
  _prayerCache() { try { return JSON.parse(localStorage.getItem('prayer_cache') || 'null'); } catch (e) { return null; } },
  updatePrayerChip() {
    const chip = document.getElementById('prayerChip'), txt = document.getElementById('prayerTxt');
    if (!chip || !txt) return;
    const c = this._prayerCache();
    if (!c || !c.timings || !c.date) { chip.classList.add('hidden'); return; }
    if (c.date !== new Date().toISOString().slice(0, 10)) { this.initPrayer(); return; }   // يوم جديد → تحديث
    const names = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    let next = null, best = Infinity;
    for (const k of Object.keys(names)) {
      const p = (c.timings[k] || '').split(':');
      const mins = p.length >= 2 ? (+p[0]) * 60 + (+p[1]) : -1;
      if (mins > cur && mins - cur < best) { best = mins - cur; next = { name: names[k], time: (c.timings[k] || '').slice(0, 5) }; }
    }
    if (!next) next = { name: 'الفجر', time: (c.timings.Fajr || '').slice(0, 5) };   // بعد العشاء → فجر الغد
    txt.textContent = next.name + ' ' + next.time;
    chip.title = '🕌 مواقيت الصلاة — ' + (c.region || '') + (best < Infinity ? ' · الصلاة القادمة بعد ' + best + ' دقيقة' : '');
    chip.classList.remove('hidden');
  },

  // 📅 v1.0.3: سطر تاريخ انتهاء الصلاحية تحت الساعة — الحقيقي من الكود، أو المُدخل يدوياً مع رابط M3U
  expTick() {
    const el = document.getElementById('expLine');
    if (!el) return;
    const info = this.expiryInfo();
    el.textContent = info.text;
    el.className = 'exp-line ' + info.cls;
  },
  expiryInfo() {
    if (!this.src) return { text: '', cls: '' };
    const acc = (this.src.account && this.src.account.user_info) || {};
    let ts = null;
    if (this.src.type === 'xtream' && acc.exp_date) ts = +acc.exp_date * 1000;   // الكود: التاريخ الحقيقي من الخادم
    else {
      const url = localStorage.getItem('source_url') || '';
      const saved = this.getAccounts().find(x => x.value === url);               // M3U: التاريخ المُدخل يدوياً
      if (saved && saved.exp) ts = new Date(saved.exp + 'T23:59:59').getTime();
    }
    if (!ts) return { text: 'غير محددة المدة', cls: 'gray' };
    const dstr = new Date(ts).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const days = Math.ceil((ts - Date.now()) / 86400000);
    if (days < 0) return { text: '⛔ منتهية — ' + dstr, cls: 'red' };
    if (days <= 7) return { text: '⏳ تنتهي ' + dstr + ' · باقي ' + days + ' يوم', cls: 'orange' };
    return { text: '📅 تنتهي ' + dstr + ' · باقي ' + days + ' يوم', cls: 'green' };
  },

  // ═══ الشاشات ═══
  // ═══ 📱 v1.0.8: ريموت الهاتف ═══
  async remoteServerStart(silent) {
    try {
      if (!localStorage.getItem('remote_pin')) localStorage.setItem('remote_pin', String(Math.floor(1000 + Math.random() * 9000)));
      this._remoteInfo = await window.latchi.remoteStart({ port: 37777, pin: localStorage.getItem('remote_pin') });
    } catch (e) { this._remoteInfo = { ok: false }; }
    if (!silent) { this.buildSettings(); this.focusFirst('settings'); }
  },
  async remoteServerStop() {
    try { await window.latchi.remoteStop(); } catch (e) {}
    this._remoteInfo = null;
    this.buildSettings(); this.focusFirst('settings');
  },
  remotePush() {
    try {
      if (!window.latchi || !window.latchi.remoteState) return;
      const now = (this.screen === 'player' && Player.current) ? (Player.current.name || '')
        : (this._miniItem ? (this._miniItem.name || '') : '');
      window.latchi.remoteState({
        screen: this.screen, nowPlaying: now,
        volume: (Player.video ? Player.video.volume : 1),
        muted: !!(Player.video && Player.video.muted)
      });
    } catch (e) {}
  },
  remoteApplyKey(cmd) {
    try {
      if (!cmd) return;
      if (cmd.key) {
        // نفس حدث الكيبورد — كل منطق التنقل/المشغل يعمل كما هو (ج40: الكيبورد = الريموت)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: String(cmd.key), bubbles: true, cancelable: true }));
        this.remotePush();
        return;
      }
      if (cmd.action === 'volume' && typeof cmd.delta === 'number') {
        const d = Math.max(-0.2, Math.min(0.2, +cmd.delta));
        const pv = Player.video;
        if (pv) { pv.muted = false; pv.volume = Math.min(1, Math.max(0, pv.volume + d)); localStorage.setItem('vol', String(pv.volume)); }
        const mv = document.getElementById('miniVid');
        if (mv) mv.volume = Math.min(1, Math.max(0, mv.volume + d));
        this.remotePush();
      } else if (cmd.action === 'mute') {
        const pv = Player.video; if (pv) pv.muted = !pv.muted;
        const mv = document.getElementById('miniVid'); if (mv) mv.muted = !mv.muted;
        this.remotePush();
      }
    } catch (e) {}
  },

  show(name, resetStack = false) {
    // 🎬 v1.0.7: مغادرة شاشة القائمة (لغير المشغل) = إيقاف المشغل المصغر
    if (this.screen === 'list' && name !== 'list' && name !== 'player') this.miniStop();
    // 🎯 v1.0.4: احفظ موضع الفوكيز عند مغادرة الشاشة — الرجوع من التفاصيل يرجعك لنفس البوستر بالضبط
    if (this.screen && this.screen !== name) {
      try {
        const le = document.getElementById(this.screen);
        const fe = le && le.querySelector ? le.querySelector('.focused') : null;
        if (fe) { this._focusMem = this._focusMem || {}; this._focusMem[this.screen] = fe; }
      } catch (e) {}
    }
    if (resetStack) this.navStack = [];
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    this.screen = name;
    this.onShown(name);
    this.remotePush();     // 📱 v1.0.8
  },

  push(name) {
    this.navStack.push(this.screen);
    this.show(name);
  },
  back() {
    // 🛠 v1.1.1: كان close() يستدعي back() الذي يستدعي close() → انفجار المكدس والشاشة تعلق
    if (this.screen === 'player') {
      Player.hideCb = null;              // أوقف الاستدعاء العكسي قبل التنظيف
      Player.close();
      const prev = this.navStack.pop();
      if (prev) this.show(prev); else this.show('home', true);
      // 🎬 v1.0.7: خروج ملء الشاشة → عودة للواجهة المقسمة والمصغر يستأنف نفس العنصر
      if (prev === 'list' && this._miniItem && this.listCtx && !this.listCtx.loading) this.miniPlay(this._miniItem);
      return;
    }
    const prev = this.navStack.pop();
    if (prev) this.show(prev); else this.show('home', true);
  },

  // ═══ ⏳ v1.0.1: غطاء «جاري التحقق من الاشتراك» ═══
  showChecking() { const o = document.getElementById('checkingOv'); if (o) o.classList.remove('hidden'); },
  hideChecking() { const o = document.getElementById('checkingOv'); if (o) o.classList.add('hidden'); },

  // ═══ 👋 v1.0.1: شاشة الترحيب «مرحبا بك في عائلة لاتشي» بعد كل دخول ناجح ═══
  showWelcome() {
    clearTimeout(this._welcomeTimer);
    this.show('welcome', true);
    this._welcomeTimer = setTimeout(() => { if (this.screen === 'welcome') this.show('home', true); }, 2600);
  },

  // ═══ 🗑 v1.0.7: حذف جميع الحسابات — إعادة ضبط المصنع (تأكيد بالأسهم كيما الخروج) ═══
  showWipeDlg() {
    const d = document.getElementById('exitDlg');
    if (!d) return;
    // نعيد استعمال نافذة التأكيد بنص الحذف
    const q = d.querySelector('.exit-q'), ok = document.getElementById('exitOk');
    if (q) q.textContent = '⚠️ حذف جميع الحسابات والمفضلة نهائياً؟';
    if (ok) { ok.classList.add('exit-ok'); ok.textContent = '🗑 نعم، احذف كل شيء'; }
    this._exitAction = 'wipe';
    this.showExitDlg();
  },
  wipeAll() {
    try {
      const keep = {};   // لا نحتفظ بشيء — مسح كلي
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) keys.push(k); }
      keys.forEach(k => {
        if (k.startsWith('cw_') || k.startsWith('epg|') || k.startsWith('m3u|') || k.startsWith('xt|') ||
            ['saved_accounts', 'source_url', 'latchi_favs', 'favs', 'prayer_cache'].includes(k)) localStorage.removeItem(k);
      });
      this.favs = [];
      this.src = null; this.user = null;
      this._focusMem = {}; this._zapList = [];
      this.miniStop(); this._miniItem = null;
      try { if (typeof LatchiAPI !== 'undefined' && LatchiAPI._mem) LatchiAPI._mem = {}; } catch (e2) {}
      try { if (window.latchi && window.latchi.cacheClear) window.latchi.cacheClear(); } catch (e3) {}   // كاش القرص كذلك
    } catch (e) {}
    this.show('verify', true);
    const v = document.getElementById('verifyMsg');
    if (v) { v.className = 'verify-msg'; v.textContent = 'تم مسح جميع البيانات — أدخل كوداً أو رابطاً للبدء من جديد'; }
  },

  // ═══ ⏻ v1.0.2: نافذة تأكيد الخروج «كيما التلفاز» — أسهم + Enter ═══
  exitDlgOpen() { const d = document.getElementById('exitDlg'); return !!(d && !d.classList.contains('hidden')); },
  showExitDlg() {
    const d = document.getElementById('exitDlg');
    if (!d) return;
    d.classList.remove('hidden');
    this._exitFocus = 'cancel';           // الآمن أولاً (الإلغاء)
    this._paintExitDlg();
  },
  hideExitDlg() {
    const d = document.getElementById('exitDlg');
    if (d) {
      d.classList.add('hidden');
      const q = d.querySelector('.exit-q'), ok = document.getElementById('exitOk');
      if (q) q.textContent = 'هل تريد الخروج من التطبيق؟';
      if (ok) ok.textContent = '✓ نعم، خروج';
      this._exitAction = null;
    }
  },
  _paintExitDlg() {
    const ok = document.getElementById('exitOk'), c = document.getElementById('exitCancel');
    if (!ok || !c) return;
    ok.classList.toggle('focused', this._exitFocus === 'ok');
    c.classList.toggle('focused', this._exitFocus === 'cancel');
  },
  moveExitFocus() { this._exitFocus = this._exitFocus === 'ok' ? 'cancel' : 'ok'; this._paintExitDlg(); },
  confirmExitDlg() {
    const act = this._exitAction;
    this._exitAction = null;
    if (this._exitFocus === 'ok') { if (act === 'wipe') this.wipeAll(); else this.doQuit(); }
    else this.hideExitDlg();
  },
  doQuit() {
    try { if (window.latchi && window.latchi.quitApp) { window.latchi.quitApp(); return; } } catch (e) {}
    try { window.close(); } catch (e) {}
  },

  onShown(name) {
    if (name === 'home') { this.buildHome(); this.startHomeBgs(); this.initPrayer(); }
    if (name === 'settings') this.buildSettings();
    if (name === 'accounts') this.buildAccounts();
    this.focusFirst(name);
  },

  focusFirst(name) {
    const root = document.getElementById(name);
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
    // 🎯 v1.0.4: الرجوع لشاشة سابقة؟ الفوكيز يرجع لنفس العنصر المحفوظ (إن كان ما يزال في الصفحة)
    const mem = (this._focusMem || {})[name];
    if (mem) {
      let alive = false;
      try { alive = mem.isConnected !== false && (!root || !root.contains || root.contains(mem)); } catch (e) { alive = false; }
      if (alive) {
        mem.classList.add('focused');
        if (mem.scrollIntoView) try { mem.scrollIntoView({ block: 'nearest' }); } catch (e) {}
        return;
      }
      delete this._focusMem[name];   // العنصر لم يعد موجوداً (أعيد بناء الصفحة) — سلوك عادي
    }
    const f = root.querySelector('.focused') || root.querySelector('.tcard, .vtab, .gold-btn, .pcat, .pitem, .chan, .pcard, .ep, .acc-card, .back-btn, .tv-input, .p-btn, .mini-wrap');
    if (f) f.classList.add('focused');
  },

  // ═══ التحقق (مشترك بين شاشة الدخول ومركز الحسابات) ═══
  async applyCode(code, msgEl) {
    msgEl.className = 'verify-msg';
    if (!code) { msgEl.textContent = 'أدخل الكود أولاً'; msgEl.classList.add('err'); return false; }
    msgEl.textContent = '⏳ جارٍ التحقق...';
    this.showChecking();                      // ⏳ v1.0.1
    try {
      const deviceId = await window.latchi.deviceId();
      const res = await LatchiAPI.verifyCode(code, deviceId);
      if (!res.ok) { msgEl.textContent = '✗ ' + res.message; msgEl.classList.add('err'); return false; }
      if (!res.url) { msgEl.textContent = '✗ لا توجد قائمة مرتبطة بهذا الكود'; msgEl.classList.add('err'); return false; }
      msgEl.textContent = '✓ ' + res.name + ' — فتح القائمة...';
      msgEl.classList.add('ok');
      this.user = { name: res.name, expires: res.expires, code };
      this.rememberAccount('code', res.name + ' (' + code + ')', res.url);
      await this.loadSource(res.url, false, res.url, { welcome: true });
      return true;
    } catch (e) {
      msgEl.textContent = '✗ خطأ في الاتصال: ' + e.message; msgEl.classList.add('err'); return false;
    } finally { this.hideChecking(); }
  },

  async applyM3u(url, msgEl, expDate) {
    msgEl.className = 'verify-msg';
    if (!/^https?:\/\//.test(url)) { msgEl.textContent = 'أدخل رابط M3U صحيحاً يبدأ بـ http'; msgEl.classList.add('err'); return false; }
    msgEl.textContent = '⏳ تحميل القائمة (المرة الأولى فقط — ثم تبقى محفوظة)...';
    // 📅 v1.0.3: تاريخ الصلاحية المُدخل يدوياً مع الرابط (يظهر تحت الساعة وفي مركز الحسابات)
    const expTxt = expDate ? new Date(expDate + 'T12:00:00').toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    this.user = { name: 'M3U مباشر', expires: expTxt, code: '', expDate: expDate || '' };
    this.showChecking();                      // ⏳ v1.0.1
    try {
      await this.loadSource(url, false, url, { welcome: true });
      let host = url; try { host = new URL(url).hostname; } catch (e) {}
      this.rememberAccount('m3u', 'M3U — ' + host, url, expDate || '');
      return true;
    } catch (e) {
      msgEl.textContent = '✗ ' + e.message; msgEl.classList.add('err'); return false;
    } finally { this.hideChecking(); }
  },

  async doVerify() { return this.applyCode(document.getElementById('codeInput').value.trim(), document.getElementById('verifyMsg')); },

  async doM3u() {
    const expEl = document.getElementById('m3uExpInput');
    return this.applyM3u(document.getElementById('m3uInput').value.trim(), document.getElementById('verifyMsg'), expEl ? expEl.value : '');
  },

  async loadSource(url, silent, saveUrl, opts = {}) {
    try {
      const src = await LatchiAPI.loadSource(url);
      const empty = src.type === 'xtream'
        ? !(src.categories.live.length || src.categories.movie.length || src.categories.series.length)
        : !(src.live.length || src.movies.length || src.series.length);
      if (empty) throw new Error('القائمة فارغة أو غير صالحة');
      this.src = src;
      if (saveUrl) localStorage.setItem('source_url', saveUrl);
      // 👋 v1.0.1: «مرحبا بك في عائلة لاتشي» بعد الدخول — ثم الرئيسية
      if (opts.welcome) this.showWelcome(); else this.show('home', true);
    } catch (e) {
      if (!silent) throw e;
      localStorage.removeItem('source_url');
      this.show('verify', true);
    }
  },

  // ═══ الرئيسية ═══
  buildHome() {
    // 👤 v1.0.6: اسم المستخدم الحقيقي من الخادم في الهيدر
    const uc = document.getElementById('userChip');
    if (uc) {
      const un = (this.src && this.src.account && this.src.account.user_info && this.src.account.user_info.username)
        || (this.user && this.user.name) || '';
      uc.textContent = un ? '👤 ' + un : '👤';
      uc.title = un || '';
    }
    const s = this.src ? LatchiAPI.stats(this.src) : { live: 0, movies: 0, series: 0, unit: 'فئة' };
    const u = s.unit || '';
    // 🚀 v1.0.2: Royal Grid — نفس ترتيب تلفاز LATCHI (4 فوق / 4 تحت)
    const cards = [
      { img: 'tv_card_live', t: 'البث المباشر', c: s.live + ' ' + (u || 'قناة'), go: () => this.openList('live') },
      { img: 'tv_card_films', t: 'الأفلام', c: s.movies + ' ' + (u || 'فيلم'), go: () => this.openList('movies') },
      { img: 'tv_card_series', t: 'المسلسلات', c: s.series + ' ' + (u || 'مسلسل'), go: () => this.openList('series') },
      { img: 'tv_card_bein', t: 'beIN سبورت', c: 'القنوات الرياضية', go: () => this.openList('live', 'bein') },
      { img: 'tv_card_favorites', t: 'المفضلة', c: this.favs.length + ' عنصر', go: () => this.openList('fav') },
      { img: 'tv_card_continue', t: 'متابعة المشاهدة', c: this.continueList().length + ' عنصر', go: () => this.openList('cw') },
      { img: 'tv_card_accounts', t: 'مركز الحسابات', c: this.getAccounts().length + ' حساب محفوظ', go: () => this.push('accounts') },
      { img: 'tv_card_settings', t: 'الإعدادات', c: 'الحساب والبيانات', go: () => this.push('settings') }
    ];
    const el = document.getElementById('cards');
    el.innerHTML = '';
    cards.forEach(c => {
      const d = document.createElement('div');
      d.className = 'tcard';
      // 📺 v1.0.2: صورة خالصة 100% كتلفاز LATCHI (الفن يحمل الأيقونة والعنوان) — بلا أي طبقة نص
      d.title = `${c.t} — ${c.c}`;
      d.innerHTML = `<img class="tcard-img" src="../assets/${c.img}.webp" alt="${c.t}" onerror="this.style.display='none'">`;
      d.onclick = () => c.go();
      el.appendChild(d);
    });
  },

  // ═══ 🌌 v1.0: خلفيات الرئيسية المتغيرة (فن التلفاز — 10 خلفيات، تبديل ناعم كل 25ث) ═══
  startHomeBgs() {
    const host = document.getElementById('homeBgs');
    if (!host) return;
    if (!host.children.length) {
      for (let i = 1; i <= 10; i++) {
        const img = document.createElement('img');
        img.src = `../assets/latchi_bg_tv_${i}.webp`;
        img.alt = '';
        host.appendChild(img);
      }
    }
    const imgs = Array.from(host.children);
    let idx = Math.floor(Math.random() * imgs.length);
    imgs.forEach((im, i) => im.classList.toggle('on', i === idx));
    clearInterval(this._bgTimer);
    this._bgTimer = setInterval(() => {
      imgs[idx].classList.remove('on');
      idx = (idx + 1 + Math.floor(Math.random() * (imgs.length - 1))) % imgs.length; // لا تكرار نفس الخلفية
      imgs[idx].classList.add('on');
    }, 25000);
  },

  // ═══ 📋 v1.0: اللصق من الحافظة بضغطة زر (بلا Ctrl+V) ═══
  async pasteTo(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    let txt = '';
    try {
      if (window.latchi && window.latchi.readClipboard) txt = await window.latchi.readClipboard();
      else if (navigator.clipboard) txt = await navigator.clipboard.readText();
    } catch (e) { txt = ''; }
    txt = (txt || '').trim();
    if (txt) {
      input.value = txt;
      input.focus();
      if (btn) { btn.classList.add('pasted'); setTimeout(() => btn.classList.remove('pasted'), 700); }
    } else if (btn) {
      btn.classList.add('paste-empty'); setTimeout(() => btn.classList.remove('paste-empty'), 700);
    }
  },

  // ═══ 🎬 v1.0.7: المشغل المصغر (العمود الثالث) — يشتغل فور اختيار العنصر ═══
  miniPlay(item) {
    const v = document.getElementById('miniVid');
    if (!v) return;
    this.miniStop();
    this._miniItem = item || null;
    if (!item || !item.url) return;
    const ld = document.getElementById('miniLoad');
    if (ld) ld.classList.remove('hidden');
    v.onplaying = () => { const l = document.getElementById('miniLoad'); if (l) l.classList.add('hidden'); };
    v.onerror = () => { const l = document.getElementById('miniLoad'); if (l) l.classList.add('hidden'); };
    const url = item.url;
    if (/\.m3u8(\?|$)/i.test(url) && typeof Hls !== 'undefined' && Hls.isSupported && Hls.isSupported()) {
      try {
        this._miniHls = new Hls({ enableWorker: true });
        this._miniHls.loadSource(url);
        this._miniHls.attachMedia(v);
        this._miniHls.on(Hls.Events.ERROR, (e, d) => {
          if (d && d.fatal && item.urlTs) { try { v.src = item.urlTs; v.play().catch(() => {}); } catch (err) {} }
        });
      } catch (e) { try { v.src = url; } catch (e2) {} }
    } else {
      try { v.src = url; } catch (e) {}
    }
    try { const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  },
  miniStop() {
    try { if (this._miniHls) this._miniHls.destroy(); } catch (e) {}
    this._miniHls = null;
    const v = document.getElementById('miniVid');
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); v.onerror = null; v.onplaying = null; } catch (e) {} }
    const ld = document.getElementById('miniLoad');
    if (ld) ld.classList.add('hidden');
  },
  miniFull() {
    const it = this._miniItem;
    if (!it) return;
    this.miniStop();                       // المشغل الكامل يأخذ الدور — والرجوع يستأنف المصغر
    this.startPlay(it);
  },
  // اختيار عنصر من العمود الأوسط: تشغيل فوري في المصغر + تفاصيل في العمود الثالث
  selectItem(it) {
    this.listCtx.selected = it;
    this.renderMiniInfo();
    if (it && it.type === 'series') this.miniStop();    // المسلسل: تفاصيل + زر الحلقات (بلا تشغيل تلقائي)
    else this.miniPlay(it);
    // حدّث إبراز الصف المختار
    const items = document.getElementById('paneItems');
    if (items) [...(items.children || [])].forEach(el => el.classList && el.classList.toggle('sel', el.dataset && el.dataset.id === (it && it.id)));
  },
  renderMiniInfo() {
    const el = document.getElementById('miniInfo');
    if (!el) return;
    const it = this.listCtx && this.listCtx.selected;
    if (!it) { el.innerHTML = '<div class="mini-empty">👋 اختر قناة أو فيلماً من القائمة ليعمل هنا فوراً</div>'; return; }
    const isX = this.src && this.src.type === 'xtream';
    const live = it.type === 'live', movie = it.type === 'movie', series = it.type === 'series';
    const poster = it.logo ? `<img class="mini-poster" src="${esc(it.logo)}" onerror="this.style.display='none'">` : '';
    el.innerHTML = `
      <div class="mini-head">${poster}
        <div class="mini-meta">
          <div class="mini-name">${esc(it.name || '')}</div>
          <div class="mini-sub">${live ? '● بث مباشر' : series ? '🎬 مسلسل' : '🎞 فيلم'} ${it.group ? ' · ' + esc(it.group) : ''}</div>
          <div class="mini-epg hidden" id="miniEpg"></div>
        </div>
      </div>
      ${series ? '<button class="gold-btn" id="miniEpsBtn" style="width:100%">🎬 عرض المواسم والحلقات</button>' : ''}
      <div class="mini-desc" id="miniDesc">${live || series ? '' : '<span class="mini-desc-wait">…</span>'}</div>
      <div class="mini-btns">
        ${!series ? '<button class="p-btn mini-go" id="miniGoBtn">⛶ شاهد بملء الشاشة</button>' : ''}
        <button class="p-btn" id="miniFavBtn">${this.isFav(it) ? '★ في المفضلة' : '☆ أضف للمفضلة'}</button>
      </div>`;
    const go = document.getElementById('miniGoBtn');
    if (go) go.onclick = () => this.miniFull();
    const fv = document.getElementById('miniFavBtn');
    if (fv) fv.onclick = () => { this.toggleFav(it); this.renderMiniInfo(); };
    const eps = document.getElementById('miniEpsBtn');
    if (eps) eps.onclick = () => this.openDetails(it);
    // EPG للقنوات الحية (xtream) — نفس مصدر شريط المشغل
    if (live && isX) {
      LatchiAPI.shortEpg(it.id).then(epg => {
        const e2 = document.getElementById('miniEpg');
        if (e2 && epg && epg.title && this.listCtx && this.listCtx.selected === it) {
          e2.textContent = '📺 ' + epg.title + (epg.time ? ' · ' + epg.time : '');
          e2.classList.remove('hidden');
        }
      }).catch(() => {});
    }
    // وصف الفيلم (xtream) — get_vod_info مع كاش
    if (movie && isX) {
      LatchiAPI.vodInfo(it.id).then(info => {
        const d = document.getElementById('miniDesc');
        if (d && info && info.plot && this.listCtx && this.listCtx.selected === it) d.textContent = info.plot;
        else if (d) d.textContent = '';
      }).catch(() => { const d = document.getElementById('miniDesc'); if (d) d.textContent = ''; });
    }
  },

  continueList() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cw_') && !k.startsWith('cw_t_')) {
        try {
          const v = JSON.parse(localStorage.getItem(k));
          if (v && v.item) out.push(v);
        } catch (e) {}
      }
    }
    return out.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 30);
  },

  // ═══ القوائم (كسوية: الفئة تُحمَّل عند فتحها فقط — ومن الكاش فوراً) ═══
  async openList(kind, filter = null, catObj = null) {
    // المفضلة / المتابعة — كما هي (محلية)
    if (kind === 'fav' || kind === 'cw') {
      let items, title;
      if (kind === 'fav') { items = this.favs; title = 'المفضلة'; }
      else { items = this.continueList().map(v => Object.assign({}, v.item, { _resume: v.at, _dur: v.dur })); title = 'متابعة المشاهدة'; }
      this.listCtx = { kind, items, filter: null, title, cat: 'الكل', selected: null };
      this.miniStop(); this._miniItem = null;
      this.buildList();
      this.push('list');
      return;
    }
    // M3U: كل العناصر محمّلة أصلاً — سلوك الفلترة القديم مع فئات مرتبة
    if (this.src.type === 'm3u') {
      let items, title;
      if (kind === 'live') { items = this.src.live; title = 'البث المباشر'; }
      else if (kind === 'movies') { items = this.src.movies; title = 'الأفلام'; }
      else { items = this.src.series; title = 'المسلسلات'; }
      if (filter === 'bein') {
        items = items.filter(c => /bein|be ?n ?sports|سبورت/i.test(c.name + ' ' + (c.group || '')));
        title = 'beIN سبورت';
      }
      this.listCtx = { kind, items, filter, title, cat: 'الكل', selected: null };
      this.miniStop(); this._miniItem = null;
      this.buildList();
      this.push('list');
      return;
    }
    // ═══ Xtream كسوي ═══
    this.listCtx = { kind, filter, title: filter === 'bein' ? 'beIN سبورت' : (kind === 'live' ? 'البث المباشر' : kind === 'movies' ? 'الأفلام' : 'المسلسلات'), items: [], cat: null, loading: true, selected: null };
    this.miniStop(); this._miniItem = null;
    this.buildList();
    this.push('list');
    // beIN: نجلب فئات beIN فقط ونحمّلها (قليلة وخفيفة)
    if (filter === 'bein') {
      const beinCats = LatchiAPI.beinCategories('live');
      const merged = [];
      for (const c of beinCats) {
        const items = await LatchiAPI.getCategoryItems('live', c.id, c.name);
        merged.push(...items);
      }
      if (this.listCtx.kind === 'live' && this.listCtx.filter === 'bein') {
        this.listCtx.items = merged; this.listCtx.loading = false;
        this.listCtx.cat = beinCats.length ? beinCats[0].name : null;
        this.buildList();
      }
      return;
    }
    // فئة محددة؟
    if (catObj) { await this.loadCategory(catObj); return; }
    // نفتح أول فئة تلقائياً (نفس إحساس التلفاز: محتوى أمامك مباشرة)
    const cats = LatchiAPI.orderCategories(LatchiAPI._src.categories[kind === 'movies' ? 'movie' : kind] || []);
    if (cats.length) await this.loadCategory(cats[0]);
    else { this.listCtx.loading = false; this.buildList(); }
  },

  async loadCategory(catObj) {
    const kind = this.listCtx.kind;
    this.listCtx.cat = catObj.name;
    this.listCtx.catId = catObj.id;
    this.listCtx.loading = true;
    this.listCtx.items = [];
    this.buildList();
    const items = await LatchiAPI.getCategoryItems(kind === 'movies' ? 'movie' : kind, catObj.id, catObj.name);
    // هل ما زلنا في نفس الشاشة ونفس الفئة؟ (قد يكون المستخدم انتقل)
    if (this.screen === 'list' && this.listCtx.kind === kind && this.listCtx.catId === catObj.id) {
      this.listCtx.items = items;
      this.listCtx.loading = false;
      this.buildList();
    }
  },

  buildList() {
    // ═══ 🎬 v1.0.7: الواجهة الثلاثية — فئات (يمين) | عناصر (وسط) | مشغل مصغر + تفاصيل (يسار) ═══
    const ctx = this.listCtx || {};
    const { kind, items } = ctx;
    const paneCats = document.getElementById('paneCats');
    const paneItems = document.getElementById('paneItems');
    if (!paneCats || !paneItems) return;
    // ── العمود 1: الفئات (20%) ──
    paneCats.innerHTML = '';
    const mkCat = (label, val, go) => {
      const c = document.createElement('div');
      c.className = 'pcat' + ((ctx.cat === val) ? ' active' : '');
      c.textContent = label;
      c.onclick = go;
      paneCats.appendChild(c);
    };
    if (this.src && this.src.type === 'xtream' && ['live', 'movies', 'series'].includes(kind) && ctx.filter !== 'bein') {
      const cats = LatchiAPI.orderCategories(this.src.categories[kind === 'movies' ? 'movie' : kind] || []);
      cats.forEach(cat => mkCat(cat.name, cat.name, () => this.loadCategory(cat)));
    } else if (this.src && this.src.type === 'm3u' && Array.isArray(items)) {
      const groups = [...new Set(items.map(i => i.group || 'عام'))];
      const ranked = LatchiAPI.orderCategories(groups.map(g => ({ id: g, name: g }))).map(c => c.name);
      mkCat('🏷 الكل', 'الكل', () => { this.listCtx.cat = 'الكل'; this.buildList(); });
      ranked.forEach(g => mkCat(g, g, () => { this.listCtx.cat = g; this.buildList(); }));
    } else {
      mkCat('🏷 ' + (ctx.title || 'القائمة'), 'الكل', null);
    }
    // ── العمود 2: العناصر (40%) ──
    const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    let shown = Array.isArray(items) ? items.filter(i =>
      (ctx.cat === 'الكل' || !ctx.cat || (i.group || 'عام') === ctx.cat) &&
      (!q || (i.name || '').toLowerCase().includes(q))) : [];
    this._zapList = shown;   // 📺 قائمة التنقل بالريموت داخل المشغل
    paneItems.innerHTML = '';
    if (ctx.loading) {
      paneItems.innerHTML = '<div class="load-hint">⏳ جارٍ فتح الفئة... <span class="hint-sub">(المرة الأولى فقط — بعدها تبقى محفوظة)</span></div>';
      this.focusFirst('list');
      return;
    }
    if (!shown.length) {
      paneItems.innerHTML = `<div class="load-hint">${q ? 'لا توجد نتائج للبحث' : 'لا توجد عناصر في هذه الفئة'}</div>`;
      this.focusFirst('list');
      return;
    }
    const self = this;
    const mkRow = (it) => {
      const d = document.createElement('div');
      d.className = 'pitem' + (ctx.selected && ctx.selected.id === it.id ? ' sel' : '');
      d.dataset.id = it.id;
      const live = it.type === 'live';
      d.innerHTML = `<img loading="lazy" decoding="async" src="${esc(it.logo || '')}" onerror="this.style.visibility='hidden'">
        <div class="pi-t"><div class="pi-n">${esc(it.name || '')}</div><div class="pi-g">${live ? '● مباشر' : (it.group ? esc(it.group) : '')}</div></div>
        ${live ? '<span class="rec-dot"></span>' : '<span class="pi-play">▶</span>'}`;
      d.onclick = () => self.selectItem(it);
      return d;
    };
    // 🎯 رسم على دفعات (حماية الحاسوب الضعيف مهما طالت القائمة)
    const BATCH = 60;
    (function renderChunk(i) {
      const end = Math.min(i + BATCH, shown.length);
      const frag = document.createDocumentFragment();
      for (let j = i; j < end; j++) frag.appendChild(mkRow(shown[j]));
      paneItems.appendChild(frag);
      if (end < shown.length) requestAnimationFrame(() => renderChunk(end));
      else self.focusFirst('list');
    })(0);
    // ── العمود 3: المشغل المصغر + التفاصيل ──
    this.renderMiniInfo();
  },

  posterCard(it) {
    const w = document.createElement('div'); w.className = 'pwrap';
    const d = document.createElement('div'); d.className = 'pcard';
    const fav = this.isFav(it) ? '<span class="fav-star">★</span>' : '';
    const prog = it._resume ? `<div style="text-align:center;color:#7CE38B;font-size:10.5px;margin-top:2px">▶ ${fmt(it._resume)} / ${fmt(it._dur)}</div>` : '';
    d.innerHTML = `${fav}<img loading="lazy" decoding="async" src="${it.logo || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22190%22%3E%3Crect fill=%22%230A0E22%22 width=%22320%22 height=%22190%22%3E%3Ctext x=%22160%22 y=%22110%22 fill=%22%23D9A94E%22 font-size=%2252%22 text-anchor=%22middle%22%3E🎬%3C/text%3E%3C/svg%3E'">
      <div class="pt">${esc(it.name)}</div>${prog}<div class="pc"><span>${esc(it.group || '')}</span></div>`;
    d.onclick = () => this.openDetails(it);
    w.appendChild(d);
    return w;
  },

  chanRow(it) {
    const d = document.createElement('div');
    d.className = 'chan';
    const live = it.type === 'live';
    d.innerHTML = `<img loading="lazy" decoding="async" src="${it.logo || ''}" onerror="this.style.visibility='hidden'">
      <div><div class="n">${esc(it.name)}</div><div class="g">${esc(it.group || '')}</div></div>
      <div class="now">${live ? '<span class="rec-dot">●</span> مباشر' : '🎬'}</div>`;
    d.onclick = () => {
      if (it.type === 'series') this.openDetails(it);
      else this.startPlay(it);
    };
    return d;
  },

  // ═══ التفاصيل ═══
  async openDetails(it) {
    const body = document.getElementById('detailsBody');
    body.innerHTML = '<div class="load-hint">⏳ تحميل التفاصيل...</div>';
    this.push('details');
    let seasons = [];
    if (it.type === 'series' && it.seriesId) {
      try {
        const d = await LatchiAPI.loadSeriesDetails(it.seriesId);
        const info = d && d.info || {};
        seasons = Object.entries(d.episodes || {}).map(([sNum, eps]) => ({
          num: sNum,
          episodes: Object.values(eps).map(e => ({
            id: 'E' + e.id, name: e.title || ('الحلقة ' + e.episode_num), episodeNum: e.episode_num,
            url: `${LatchiAPI._src.server}/series/${LatchiAPI._src.username}/${LatchiAPI._src.password}/${e.id}.${(e.container_extension || 'mp4')}`,
            plot: (e.info && e.info.plot) || info.plot || '', dur: (e.info && e.info.duration) || ''
          }))
        })).sort((a, b) => (+a.num) - (+b.num));
        it.plot = it.plot || info.plot || '';
      } catch (e) {}
    }
    const btnFav = this.isFav(it) ? '★ في المفضلة' : '☆ إضافة للمفضلة';
    // 📺 v1.1.2: قائمة التنقل بين الحلقات بالريموت — نفس معرفات النقر حرفياً (حفظ متابعة المشاهدة)
    if (it.type === 'series') this._zapList = seasons.flatMap(s => s.episodes)
      .map((e, i) => ({ id: 'S' + it.seriesId + '_' + i, name: e.name, url: e.url, type: 'movie', logo: it.logo, group: it.name }));
    body.innerHTML = `
      <div class="d-poster"><img src="${it.logo || ''}" onerror="this.style.display='none'"></div>
      <div class="d-info">
        <div class="d-title">${esc(it.name)}</div>
        <div class="d-meta">${esc(it.group || '')}${it.rating ? ' • ⭐ ' + esc(String(it.rating)) : ''}${this.user?.expires ? ' • صالح حتى: ' + esc(this.user.expires) : ''}</div>
        <div class="d-desc">${esc((it.plot || '').slice(0, 600) || 'لا يوجد وصف متاح لهذا المحتوى.')}</div>
        <div class="d-actions">
          ${it.type === 'series' ? '' : `<button class="gold-btn play-btn" id="dPlay">▶ تشغيل</button>`}
          <button class="p-btn" id="dFav" style="font-size:15px;padding:13px 24px">${btnFav}</button>
        </div>
        ${seasons.map(s => `
          <div class="seasons">
            <div class="season-title">🎬 الموسم ${esc(String(s.num))} <span style="color:#8A90B8;font-size:13px">(${s.episodes.length} حلقة)</span></div>
            <div class="eps-lane">
              ${s.episodes.map(e => `<div class="ep" data-url="${esc(e.url)}" data-name="${esc(e.name)}">
                <div class="en">▶ ${esc(String(e.episodeNum || ''))}</div>
                <div class="et">${esc(e.name)}</div>
                <div class="ed">${esc((e.dur || ''))}</div>
                <div class="prog">${e.resumeTxt || ''}</div>
              </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>`;
    const play = document.getElementById('dPlay');
    if (play) play.onclick = () => this.startPlay(it);
    document.getElementById('dFav').onclick = () => {
      this.toggleFav(it);
      document.getElementById('dFav').textContent = this.isFav(it) ? '★ في المفضلة' : '☆ إضافة للمفضلة';
    };
    body.querySelectorAll('.ep').forEach((el, i) => {
      el.onclick = () => this.startPlay(this._zapList ? this._zapList[i] : { id: 'S' + it.seriesId + '_' + i, name: el.dataset.name, url: el.dataset.url, type: 'movie', logo: it.logo, group: it.name });
    });
    this.focusFirst('details');
  },

  // ═══ التشغيل ═══
  startPlay(it) {
    const resume = it._resume || (parseInt((localStorage.getItem('cw_' + it.id) || '{"at":0}').match(/"at":(\d+)/) || [0, 0])[1]);
    if (this.screen !== 'player') this.push('player');   // 🛠 v1.1.2: لا دفع مزدوج عند التنقل بين القنوات
    Player.hideCb = () => App.back();    // 🛠 v1.1.1: يُعاد تسليحه في كل تشغيل (لنهاية الحلقة/الخروج)
    Player.play(it, { resumeAt: (resume && resume > 15) ? resume : 0 });
  },

  // 📺 v1.1.2: تنقل بالريموت — قناة تالية/سابقة من نفس القائمة المعروضة (فوري، من الذاكرة، بلا أي إعادة تحميل)
  zap(dir) {
    const list = this._zapList;
    if (!Array.isArray(list) || !list.length || !Player.current) return false;
    const idx = list.findIndex(x => x.id === Player.current.id);
    if (idx < 0) return false;
    const next = list[idx + dir];
    if (!next) return false;              // آخر/أول قناة في القائمة
    this.startPlay(next);
    return true;
  },

  // ═══ المفضلة ═══
  isFav(it) { return this.favs.some(f => f.id === it.id && f.name === it.name); },
  toggleFav(it) {
    if (this.isFav(it)) this.favs = this.favs.filter(f => !(f.id === it.id && f.name === it.name));
    else this.favs.push({ id: it.id, name: it.name, logo: it.logo, group: it.group, type: it.type, url: it.url, seriesId: it.seriesId, plot: it.plot });
    localStorage.setItem('favs', JSON.stringify(this.favs));
  },

  // ═══ الإعدادات ═══
  buildSettings() {
    const s = this.src ? LatchiAPI.stats(this.src) : { live: 0, movies: 0, series: 0, unit: '' };
    const acc = (this.src && this.src.account && this.src.account.user_info) || {};
    const exp = acc.exp_date ? new Date(+acc.exp_date * 1000).toLocaleDateString('ar-DZ') : (this.user?.expires || '—');
    const conns = acc.active_connections != null ? `${acc.active_connections} / ${acc.max_connections}` : '—';
    const unitTxt = s.unit || '';
    document.getElementById('settingsBody').innerHTML = `
      <div class="set-card"><h3>👤 الحساب</h3>
        <div class="row"><span>الاسم</span><b>${esc(this.user?.name || '—')}</b></div>
        <div class="row"><span>الكود</span><b>${esc(this.user?.code || 'M3U مباشر')}</b></div>
        <div class="row"><span>ينتهي في</span><b>${esc(String(exp))}</b></div>
        <div class="row"><span>الاتصالات</span><b>${esc(conns)}</b></div>
        <div class="row"><span>الحسابات المحفوظة</span><button class="p-btn" id="openAccounts">👤 مركز الحسابات</button></div>
      </div>
      <div class="set-card"><h3>📊 المحتوى</h3>
        <div class="row"><span>فئات القنوات</span><b>${s.live} ${unitTxt}</b></div>
        <div class="row"><span>فئات الأفلام</span><b>${s.movies} ${unitTxt}</b></div>
        <div class="row"><span>فئات المسلسلات</span><b>${s.series} ${unitTxt}</b></div>
        <div class="row"><span>المصدر</span><b>${this.src?.type === 'xtream' ? 'Xtream Codes' : 'M3U'}</b></div>
        <div class="row"><span>التحميل</span><b style="color:#7CE38B">كسوي + تخزين محلي دائم</b></div>
      </div>
      <div class="set-card"><h3>🔄 التحديث</h3>
        <div class="row" style="display:block"><span style="display:block;margin-bottom:8px;color:#8A90B8;font-size:13px">يجلب أحدث الفئات والقنوات من الخادم (يمسح النسخ المحفوظة)</span>
        <button class="p-btn" id="refreshList">🔄 تحديث القائمة الآن</button></div>
      </div>
      <div class="set-card"><h3>🧹 البيانات</h3>
        <div class="row"><span>تفريغ متابعة المشاهدة</span><button class="p-btn" id="clearCw">تفريغ</button></div>
        <div class="row"><span>تفريغ المفضلة</span><button class="p-btn" id="clearFav">تفريغ</button></div>
      </div>
      <div class="set-card"><h3>🎮 ريموت الهاتف</h3>
        <div class="row"><span>خادم التحكم (واي فاي المنزل)</span><button class="p-btn" id="remoteToggle">${localStorage.getItem('remote_on') === '1' ? '⏹ إيقاف' : '▶ تشغيل'}</button></div>
        <div class="row"><span>الحالة</span><b style="color:${localStorage.getItem('remote_on') === '1' ? '#7CE38B' : '#8A90B8'}">${localStorage.getItem('remote_on') === '1' ? 'يعمل الآن' : 'متوقف'}</b></div>
        <div class="row"><span>رمز الربط</span><b style="letter-spacing:4px;color:var(--gold)">${esc(localStorage.getItem('remote_pin') || '—')}</b></div>
        <div class="row"><span>الشبكة</span><b style="font-size:12px">${esc((this._remoteInfo && this._remoteInfo.ips || []).join(' ، ') || '—')}${(this._remoteInfo && this._remoteInfo.port) ? ':' + this._remoteInfo.port : ''}</b></div>
        <div class="row" style="display:block"><span style="display:block;margin-bottom:8px;color:#8A90B8;font-size:13px">ثبّت تطبيق «LATCHI Remote» على الهاتف، اجعل الهاتف على نفس الواي فاي، واربط برمز الربط أعلاه.</span>
        <button class="p-btn" id="remoteNewPin">🔄 رمز ربط جديد</button></div>
      </div>
      <div class="set-card"><h3>🚪 الخروج</h3>
        <button class="gold-btn danger-btn" id="logout" style="width:100%">تسجيل الخروج والعودة للتحقق</button>
      </div>`;
    document.getElementById('refreshList').onclick = async () => {
      document.getElementById('refreshList').textContent = '⏳ جارٍ التحديث...';
      try { await window.latchi.cacheClear(); } catch (e) {}
      const saved = localStorage.getItem('source_url');
      if (saved) {
        try { await this.loadSource(saved, true); this.show('home', true); return; } catch (e) {}
      }
      document.getElementById('refreshList').textContent = '✗ تعذر التحديث — تحقق من الاتصال';
    };
    document.getElementById('clearCw').onclick = () => {
      Object.keys(localStorage).filter(k => k.startsWith('cw_')).forEach(k => localStorage.removeItem(k));
      this.buildSettings(); this.focusFirst('settings');
    };
    document.getElementById('clearFav').onclick = () => { localStorage.removeItem('favs'); this.favs = []; this.buildSettings(); this.focusFirst('settings'); };
    const rTgl = document.getElementById('remoteToggle');
    if (rTgl) rTgl.onclick = () => {
      if (localStorage.getItem('remote_on') === '1') { localStorage.removeItem('remote_on'); this.remoteServerStop(); }
      else { localStorage.setItem('remote_on', '1'); this.remoteServerStart(false); }
    };
    const rPin = document.getElementById('remoteNewPin');
    if (rPin) rPin.onclick = () => {
      localStorage.setItem('remote_pin', String(Math.floor(1000 + Math.random() * 9000)));
      if (localStorage.getItem('remote_on') === '1') this.remoteServerStart(false);
      else { this.buildSettings(); this.focusFirst('settings'); }
    };
    document.getElementById('logout').onclick = () => {
      localStorage.removeItem('source_url');
      location.reload();
    };
    document.getElementById('openAccounts').onclick = () => this.push('accounts');
  },

  // ═══ 👤 مركز الحسابات (مثل الهاتف: كود أو M3U مباشر + تبديل بين المحفوظات) ═══
  getAccounts() {
    try { return JSON.parse(localStorage.getItem('saved_accounts') || '[]'); } catch (e) { return []; }
  },
  saveAccounts(l) { localStorage.setItem('saved_accounts', JSON.stringify(l)); },
  rememberAccount(kind, label, value, exp) {
    if (!value) return;
    const list = this.getAccounts().filter(a => a.value !== value);
    list.unshift({ id: 'a' + Date.now() + Math.floor(Math.random() * 999), kind, label: label || 'حساب', value, exp: exp || '', addedAt: new Date().toLocaleDateString('ar-DZ') });
    this.saveAccounts(list.slice(0, 20));   // حد أقصى 20 مثل الهاتف
  },

  buildAccounts() {
    const acc = (this.src && this.src.account && this.src.account.user_info) || {};
    const isX = this.src && this.src.type === 'xtream';
    const curUrl = localStorage.getItem('source_url') || '';
    const list = this.getAccounts();
    // 📅 v1.0.3: صلاحية M3U اليدوية (من الحقل) تُحسب كالحقيقية
    const savedAcc = list.find(x => x.value === curUrl);
    const m3uExp = (!isX && savedAcc && savedAcc.exp) ? new Date(savedAcc.exp + 'T23:59:59').getTime() : null;
    const expTs = isX ? (acc.exp_date ? +acc.exp_date * 1000 : null) : m3uExp;
    const exp = expTs ? new Date(expTs).toLocaleDateString('ar-DZ') : (this.user?.expires || '—');
    // 🎨 شارة الصلاحية الملونة (أخضر/برتقالي/أحمر/رمادي) — كود أو M3U يدوي
    let badge;
    if (expTs) {
      const days = Math.ceil((+acc.exp_date * 1000 - Date.now()) / 86400000);
      if (days < 0) badge = '<span class="badge-exp red">⛔ منتهي الصلاحية</span>';
      else if (days <= 7) badge = `<span class="badge-exp orange">⏳ ${days} يوم متبقٍ</span>`;
      else badge = `<span class="badge-exp green">✓ ${days} يوم متبقٍ</span>`;
    } else badge = '<span class="badge-exp gray">غير محدد</span>';
    const created = acc.created_at ? new Date(+acc.created_at * 1000).toLocaleDateString('ar-DZ') : '';
    // 🎨 v1.0: بطاقات الحسابات — كل الحسابات ظاهرة دفعة واحدة؛
    // النقر/OK على البطاقة يفتح الحساب مباشرة، والأسهم تتنقل بينها بسلاسة.
    const rows = list.length ? `<div class="acc-cards">${list.map(a => {
      const active = a.value === curUrl;
      return `
      <div class="acc-card${active ? ' acc-active' : ''}" data-acc-id="${a.id}"${active ? ' data-acc-home="1"' : ` data-acc-go="${a.id}"`} tabindex="0">
        ${active ? '<span class="acc-now">✓ نشط الآن</span>' : ''}
        <button class="acc-del" data-acc-del="${a.id}" title="حذف هذا الحساب">🗑</button>
        <div class="acc-ico">${a.kind === 'code' ? '🎫' : '🔗'}</div>
        <b class="acc-lbl">${esc(a.label)}</b>
        <span class="acc-sub">${a.kind === 'code' ? 'كود تفعيل' : 'M3U مباشر'}${a.exp ? ' · 📅 ينتهي ' + esc(a.exp) : ''}</span>
        <span class="acc-open">${active ? 'اضغط للعودة للرئيسية' : 'اضغط للفتح مباشرة ←'}</span>
      </div>`;
    }).join('')}</div>` : '<div class="acc-empty">لا توجد حسابات محفوظة بعد — أضف واحداً بالأسفل 👇</div>';
    document.getElementById('accountsBody').innerHTML = `
      <div class="set-card"><h3>🗂 حساباتك (${list.length}/20) — انقر حساباً لفتحه مباشرة</h3>${rows}
        <div class="hint-sub" style="margin-top:8px">الأسهم تتنقل بين البطاقات وOK تفتح المحددة — 🗑 بالزاوية تحذف حساباً واحداً</div>
      </div>
      <div class="set-card"><h3>👤 الحساب الحالي</h3>
        <div class="row"><span>الاسم</span><b>${esc(this.user?.name || '—')}</b></div>
        ${acc.username ? `<div class="row"><span>مستخدم الخادم</span><b>${esc(acc.username)}</b></div>` : ''}
        <div class="row"><span>النوع</span><b>${isX ? 'Xtream Codes' : (this.src ? 'M3U مباشر' : '—')}</b></div>
        ${acc.status ? `<div class="row"><span>الحالة</span><b class="${acc.status === 'Active' ? 'ok-txt' : 'bad-txt'}">${acc.status === 'Active' ? '✓ نشط' : esc(acc.status)}</b></div>` : ''}
        ${created ? `<div class="row"><span>تاريخ الإنشاء</span><b>${created}</b></div>` : ''}
        <div class="row"><span>ينتهي في</span><b>${esc(String(exp))} ${badge}</b></div>
        ${acc.max_connections ? `<div class="row"><span>حد الأجهزة</span><b>${esc(String(acc.max_connections))} جهاز</b></div>` : ''}
        ${acc.active_connections != null ? `<div class="row"><span>متصل الآن</span><b>${esc(String(acc.active_connections))} / ${esc(String(acc.max_connections != null ? acc.max_connections : '—'))}</b></div>` : ''}
      </div>
      <div class="set-card"><h3>➕ إضافة بكود التفعيل</h3>
        <div class="input-row" style="margin-bottom:10px">
          <input id="accCodeInput" class="tv-input" placeholder="أدخل كود التفعيل هنا..." style="width:100%">
          <button class="paste-btn" data-paste="accCodeInput" title="لصق من الحافظة"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button>
        </div>
        <button class="gold-btn" id="accCodeBtn" style="width:100%">🎫 تفعيل ودخول</button>
      </div>
      <div class="set-card"><h3>🔗 إضافة رابط M3U مباشر</h3>
        <div class="input-row" style="margin-bottom:10px">
          <input id="accM3uInput" class="tv-input" placeholder="http://... (رابط get.php أو .m3u)" style="width:100%">
          <input id="accExpInput" class="tv-input" type="date" title="تاريخ انتهاء صلاحية الرابط (اختياري — يظهر تحت الساعة)" style="width:100%;margin-top:8px">
          <button class="paste-btn" data-paste="accM3uInput" title="لصق من الحافظة"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button>
        </div>
        <button class="gold-btn" id="accM3uBtn" style="width:100%">🔗 إضافة ودخول</button>
      </div>
      <div class="set-card"><h3>⚠️ منطقة الخطر</h3>
        <button class="danger-btn" id="accWipeBtn">🗑 حذف جميع الحسابات</button>
        <div class="hint-sub" style="margin-top:8px">يمسح الحسابات وكل ما يخصها فقط (المفضلة وسجل المشاهدة والكاش) ويعود لشاشة إدخال الحساب — التطبيق نفسه لا يُغلق ولا يُعاد ضبطه</div>
      </div>
      <div class="set-card"><div id="accMsg" class="verify-msg"></div></div>`;
    document.getElementById('accWipeBtn').onclick = () => this.showWipeDlg();
    document.getElementById('accCodeBtn').onclick = () => this.applyCode(document.getElementById('accCodeInput').value.trim(), document.getElementById('accMsg'));
    document.getElementById('accM3uBtn').onclick = () => this.applyM3u(document.getElementById('accM3uInput').value.trim(), document.getElementById('accMsg'), document.getElementById('accExpInput').value);
    document.getElementById('accCodeInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('accCodeBtn').click(); });
    document.getElementById('accM3uInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('accM3uBtn').click(); });
    // 🎨 v1.0: البطاقة كاملة قابلة للنقر — فتح مباشر أو عودة للرئيسية إن كانت نشطة
    document.querySelectorAll('.acc-card').forEach(card => card.onclick = async () => {
      if (card.dataset.accHome) { this.show('home', true); return; }   // الحساب النشط: الرئيسية
      const a = list.find(x => x.id === card.dataset.accGo);
      if (!a) return;
      const msg = document.getElementById('accMsg');
      msg.className = 'verify-msg'; msg.textContent = '⏳ جارٍ الدخول إلى ' + a.label + '...';
      this.showChecking();                    // ⏳ v1.0.1
      try { await this.loadSource(a.value, false, a.value, { welcome: true }); }
      catch (e) { msg.textContent = '✗ تعذر الدخول — قد يكون الحساب منتهياً: ' + e.message; msg.classList.add('err'); }
      finally { this.hideChecking(); }
    });
    document.querySelectorAll('[data-acc-del]').forEach(b => b.onclick = (ev) => {
      ev.stopPropagation();                   // 🗑 الحذف لا يفتح البطاقة
      this.saveAccounts(this.getAccounts().filter(x => x.id !== b.dataset.accDel));
      this.buildAccounts(); this.focusFirst('accounts');
    });
  }
};
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ═══ ⌨️ التنقل المكاني (فلسفة الريموت: أسهم + OK + رجوع) ═══
// 🎯 v1.0.5: تنقل شبكة البوسترات بالفهرس الرياضي — لا هندسة ولا أخطاء:
// ↑↓ = صف كامل (بثلاثة دائماً)، ←→ = عنصر عنصر باحترام RTL مع التفاف داخل الصف (لا طريق مسدود أبداً)
function gridNav(dx, dy) {
  const active = document.querySelector('.screen.active');
  if (!active || !active.querySelector) return false;
  const cur = active.querySelector('.pcard.focused');
  const grid = active.querySelector('.poster-grid');
  if (!cur || !grid || !grid.contains(cur)) return false;
  const cards = [...grid.querySelectorAll('.pcard')];   // كل البطاقات — حتى غير المرسومة بعد (content-visibility)
  let i = cards.indexOf(cur);
  if (i < 0 || cards.length < 2) return false;
  let cols = 3;
  try {
    if (typeof getComputedStyle === 'function') {
      const n = getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
      if (n >= 1) cols = n;
    }
  } catch (e) {}
  let j;
  if (dy !== 0) {
    j = i + dy * cols;                                  // صف كامل: بثلاثة (أو أعمدة النافذة الصغيرة)
    if (j < 0 || j >= cards.length) return false;       // حافة القائمة → دع spatialMove يقرر (الفئات فوق)
  } else {
    const rowStart = Math.floor(i / cols) * cols;
    const rowEnd = Math.min(rowStart + cols, cards.length) - 1;
    j = i - dx;                                         // RTL: السهم الأيسر = العنصر التالي
    if (j < rowStart) j = rowEnd;                       // التفاف داخل الصف — يمين→يسار
    if (j > rowEnd) j = rowStart;
  }
  const t = cards[j];
  if (!t) return false;
  cur.classList.remove('focused');
  t.classList.add('focused');
  try { (t.parentElement || t).scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
  return true;
}

function spatialMove(dx, dy) {
  const root = document.querySelector('.screen.active');
  if (!root) return;
  const cur = root.querySelector('.focused');
  const focusables = [...root.querySelectorAll('.tcard, .vtab, .gold-btn, .pcat, .pitem, .cat-chip, .chan, .pcard, .ep, .acc-card, .back-btn, .tv-input, .p-btn, .mini-wrap, .set-card .p-btn')].filter(el => el.offsetParent);
  if (!focusables.length) return;
  if (!cur) { focusables[0].classList.add('focused'); return; }
  const cr = cur.getBoundingClientRect();
  let best = null, bestScore = Infinity;
  for (const el of focusables) {
    if (el === cur) continue;
    const r = el.getBoundingClientRect();
    const ddx = (r.left + r.width / 2) - (cr.left + cr.width / 2);
    const ddy = (r.top + r.height / 2) - (cr.top + cr.height / 2);
    const wrongDir = (dx > 0 && ddx < 10) || (dx < 0 && ddx > -10) || (dy > 0 && ddy < 10) || (dy < 0 && ddy > -10);
    if (wrongDir) continue;
    const cross = dx !== 0 ? Math.abs(ddy) : Math.abs(ddx);
    const main = dx !== 0 ? Math.abs(ddx) : Math.abs(ddy);
    const score = main + cross * 2.5;
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (best) {
    cur.classList.remove('focused');
    best.classList.add('focused');
    best.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
}

document.addEventListener('keydown', (e) => {
  // داخل حقل إدخال: الأسهم تحرّك المؤشر وEsc يغادر الحقل فقط
  if (e.target && e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') { e.target.blur(); e.preventDefault(); }
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
    return; // الكتابة حرة داخل الحقل
  }
  // ⏻ v1.0.2: نافذة الخروج مفتوحة → الأسهم تنقل بين نعم/إلغاء وEnter يؤكد
  if (App.exitDlgOpen()) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') App.moveExitFocus();
    else if (e.key === 'Enter') App.confirmExitDlg();
    else if (e.key === 'Escape' || e.key === 'Backspace') App.hideExitDlg();
    e.preventDefault();
    return;
  }
  if (App.screen === 'player') {
    if (e.key === 'Escape' || e.key === 'BrowserBack') { App.back(); }
    else if (e.key === 'Home' || e.key === 'BrowserHome') { App.show('home', true); }
    else Player.onKey(e);
    return;
  }
  const cur = document.querySelector('.screen.active .focused');
  switch (e.key) {
    case 'ArrowUp': if (!gridNav(0, -1)) spatialMove(0, -1); e.preventDefault(); break;
    case 'ArrowDown': if (!gridNav(0, 1)) spatialMove(0, 1); e.preventDefault(); break;
    case 'ArrowLeft': if (!gridNav(-1, 0)) spatialMove(-1, 0); e.preventDefault(); break;
    case 'ArrowRight': if (!gridNav(1, 0)) spatialMove(1, 0); e.preventDefault(); break;
    case 'Enter': if (cur) { cur.click(); if (cur.classList.contains('tv-input')) cur.focus(); } e.preventDefault(); break;
    case 'Escape': case 'Backspace': case 'BrowserBack':    // 🎮 v1.0.3: ريموت البلوتوث يرسل BrowserBack لزر الرجوع
      if (App.screen === 'home') App.showExitDlg();          // ⏻ v1.0.2: زر الرجوع في الرئيسية = تأكيد الخروج كيما التلفاز
      else if (App.screen !== 'verify') App.back();
      e.preventDefault(); break;
    case 'Home': case 'BrowserHome':                          // 🏠 v1.0.3: زر Home بالريموت = الرئيسية
      App.show('home', true); e.preventDefault(); break;
    case 'PageUp': case 'PageDown': {                         // 📄 v1.0.3: تمرير القوائم الطويلة كيما التلفاز
      const sc = document.querySelector('.screen.active .list-body') || document.querySelector('.screen.active #accountsBody');
      if (sc) sc.scrollBy({ top: (e.key === 'PageUp' ? -1 : 1) * sc.clientHeight * 0.8, behavior: 'smooth' });
      e.preventDefault(); break;
    }
  }
});
// 🖱 v1.0.2: المؤشر يختفي بعد 2.5ث بلا حركة داخل المشغل (كيما التلفاز)
let _curTimer = null;
document.addEventListener('mousemove', () => {
  const b = document.body;
  if (b) b.classList.remove('no-cursor');
  if (App.screen === 'player' && typeof Player !== 'undefined') { try { Player.flashUi(); } catch (e) {} }   // 📺 v1.0.6
  clearTimeout(_curTimer);
  _curTimer = setTimeout(() => {
    if (App.screen === 'player' && b) b.classList.add('no-cursor');
  }, 2500);
});
// الفأرة = نفس التركيز
document.addEventListener('mouseover', (e) => {
  const t = e.target.closest('.tcard, .vtab, .gold-btn, .pcat, .pitem, .cat-chip, .chan, .pcard, .ep, .back-btn, .p-btn, .tv-input, .mini-wrap');
  if (t && t.offsetParent) {
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
    t.classList.add('focused');
  }
});

// ═══ الربط ═══
document.querySelectorAll('.vtab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.vtab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  document.getElementById('vtab-code').classList.toggle('hidden', t.dataset.tab !== 'code');
  document.getElementById('vtab-m3u').classList.toggle('hidden', t.dataset.tab !== 'm3u');
  App.focusFirst('verify');
});
document.querySelectorAll('.nav-back').forEach(b => b.onclick = () => App.back());
document.getElementById('miniWrap').onclick = () => App.miniFull();
document.getElementById('exitBtn').onclick = () => App.showExitDlg();
document.getElementById('exitOk').onclick = () => App.doQuit();
document.getElementById('exitCancel').onclick = () => App.hideExitDlg();
document.getElementById('exitDlg').onclick = (e) => { if (e.target === e.currentTarget) App.hideExitDlg(); };
document.getElementById('codeBtn').onclick = () => App.doVerify();
document.getElementById('m3uBtn').onclick = () => App.doM3u();
document.getElementById('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') App.doVerify(); });
document.getElementById('m3uInput').addEventListener('keydown', e => { if (e.key === 'Enter') App.doM3u(); });
document.getElementById('searchInput').addEventListener('input', () => { if (App.screen === 'list') App.buildList(); });

App.boot();
