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
    if (el) el.textContent = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
  },

  // ═══ الشاشات ═══
  show(name, resetStack = false) {
    if (resetStack) this.navStack = [];
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    this.screen = name;
    this.onShown(name);
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

  onShown(name) {
    if (name === 'home') { this.buildHome(); this.startHomeBgs(); }
    if (name === 'settings') this.buildSettings();
    if (name === 'accounts') this.buildAccounts();
    this.focusFirst(name);
  },

  focusFirst(name) {
    const root = document.getElementById(name);
    const f = root.querySelector('.focused') || root.querySelector('.tcard, .vtab, .gold-btn, .cat-chip, .chan, .pcard, .ep, .back-btn, .tv-input, .p-btn');
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
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

  async applyM3u(url, msgEl) {
    msgEl.className = 'verify-msg';
    if (!/^https?:\/\//.test(url)) { msgEl.textContent = 'أدخل رابط M3U صحيحاً يبدأ بـ http'; msgEl.classList.add('err'); return false; }
    msgEl.textContent = '⏳ تحميل القائمة (المرة الأولى فقط — ثم تبقى محفوظة)...';
    this.user = { name: 'M3U مباشر', expires: '', code: '' };
    this.showChecking();                      // ⏳ v1.0.1
    try {
      await this.loadSource(url, false, url, { welcome: true });
      let host = url; try { host = new URL(url).hostname; } catch (e) {}
      this.rememberAccount('m3u', 'M3U — ' + host, url);
      return true;
    } catch (e) {
      msgEl.textContent = '✗ ' + e.message; msgEl.classList.add('err'); return false;
    } finally { this.hideChecking(); }
  },

  async doVerify() { return this.applyCode(document.getElementById('codeInput').value.trim(), document.getElementById('verifyMsg')); },

  async doM3u() { return this.applyM3u(document.getElementById('m3uInput').value.trim(), document.getElementById('verifyMsg')); },

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
    const s = this.src ? LatchiAPI.stats(this.src) : { live: 0, movies: 0, series: 0, unit: 'فئة' };
    const u = s.unit || '';
    const cards = [
      { img: 'tv_card_live', t: 'البث المباشر', c: s.live + ' ' + (u || 'قناة'), go: () => this.openList('live') },
      { img: 'tv_card_bein', t: 'beIN سبورت', c: 'القنوات الرياضية', go: () => this.openList('live', 'bein') },
      { img: 'tv_card_films', t: 'الأفلام', c: s.movies + ' ' + (u || 'فيلم'), go: () => this.openList('movies') },
      { img: 'tv_card_series', t: 'المسلسلات', c: s.series + ' ' + (u || 'مسلسل'), go: () => this.openList('series') },
      { img: 'tv_card_favorites', t: 'المفضلة', c: this.favs.length + ' عنصر', go: () => this.openList('fav') },
      { img: 'ic_glow_play', t: 'متابعة المشاهدة', c: this.continueList().length + ' عنصر', go: () => this.openList('cw') },
      { img: 'tv_card_accounts', t: 'مركز الحسابات', c: this.getAccounts().length + ' حساب محفوظ', go: () => this.push('accounts') },
      { img: 'tv_card_settings', t: 'الإعدادات', c: 'الحساب والبيانات', go: () => this.push('settings') }
    ];
    const el = document.getElementById('cards');
    el.innerHTML = '';
    cards.forEach(c => {
      const d = document.createElement('div');
      d.className = 'tcard';
      // 🖼 v1.0: صورة البطاقة الرسمية من فن التلفاز + تعمية فوقها + المحتوى
      d.innerHTML = `<img class="tcard-img" src="../assets/${c.img}.webp" alt="" onerror="this.style.display='none'">
        <div class="tcard-shade"></div>
        <div class="tcard-body"><div class="t">${c.t}</div><div class="c">${c.c}</div></div>`;
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
      this.listCtx = { kind, items, filter: null, title, cat: 'الكل' };
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
      this.listCtx = { kind, items, filter, title, cat: 'الكل' };
      this.buildList();
      this.push('list');
      return;
    }
    // ═══ Xtream كسوي ═══
    this.listCtx = { kind, filter, title: filter === 'bein' ? 'beIN سبورت' : (kind === 'live' ? 'البث المباشر' : kind === 'movies' ? 'الأفلام' : 'المسلسلات'), items: [], cat: null, loading: true };
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
    const ctx = this.listCtx || {};
    const { kind, items, title } = ctx;
    const body = document.getElementById('listBody');
    // ═══ شريط الفئات ═══
    const catsBar = document.getElementById('catsBar');
    catsBar.innerHTML = '';
    const mk = (label, val, cb) => {
      const c = document.createElement('div');
      c.className = 'cat-chip' + ((ctx.cat === val || (cb && cb.isActive)) ? ' active' : '');
      c.textContent = label;
      c.onclick = () => cb ? cb.go() : null;
      catsBar.appendChild(c);
    };
    if (this.src && this.src.type === 'xtream' && ['live', 'movies', 'series'].includes(kind) && ctx.filter !== 'bein') {
      // فئات الخادم — مخفاة الممنوعة + ترتيب التلفاز
      const rawCats = this.src.categories[kind === 'movies' ? 'movie' : kind] || [];
      const cats = LatchiAPI.orderCategories(rawCats);
      cats.forEach(cat => mk(cat.name, cat.name, { go: () => this.loadCategory(cat), isActive: ctx.cat === cat.name }));
    } else if (this.src && this.src.type === 'm3u' && Array.isArray(items)) {
      // M3U: مجموعات القائمة نفسها مرتبة بترتيب التلفاز
      const groups = [...new Set(items.map(i => i.group || 'عام'))];
      const ranked = LatchiAPI.orderCategories(groups.map(g => ({ id: g, name: g }))).map(c => c.name);
      const cur = ctx.cat || 'الكل';
      mk('🏷 الكل', 'الكل', { go: () => { this.listCtx.cat = 'الكل'; this.buildList(); }, isActive: cur === 'الكل' });
      ranked.forEach(g => mk(g, g, { go: () => { this.listCtx.cat = g; this.buildList(); }, isActive: cur === g }));
    }
    // ═══ العناصر ═══
    const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    let shown = Array.isArray(items) ? items.filter(i =>
      (ctx.cat === 'الكل' || !ctx.cat || (i.group || 'عام') === ctx.cat) &&
      (!q || (i.name || '').toLowerCase().includes(q))) : [];
    // Xtream: العناصر كلها من نفس الفئة أصلاً (لا فلترة إضافية بالفئة)
    this._zapList = shown;   // 📺 v1.1.2: قائمة التنقل بالريموت (فوق/تحت داخل المشغل)
    body.innerHTML = '';
    if (ctx.loading) {
      body.innerHTML = '<div class="load-hint">⏳ جارٍ فتح الفئة... <span class="hint-sub">(المرة الأولى فقط — بعدها تبقى محفوظة)</span></div>';
      this.focusFirst('list');
      return;
    }
    const isPoster = ['movies', 'series', 'fav', 'cw'].includes(kind) && shown[0] && shown[0].type !== 'live';
    const mixed = ['fav', 'cw'].includes(kind);   // ⭐ v1.0: قوائم مختلطة (قنوات + أفلام/حلقات معاً)
    if (!shown.length) {
      body.innerHTML = `<div class="load-hint">${q ? 'لا توجد نتائج للبحث' : 'لا توجد عناصر في هذه الفئة'}</div>`;
      this.focusFirst('list');
      return;
    }
    const container = document.createElement('div');
    container.className = isPoster ? 'poster-grid' : 'chan-list';
    if (mixed && isPoster) container.classList.add('mixed-list');
    body.appendChild(container);
    // 🎯 رسم على دفعات (حماية الحاسوب الضعيف: لا تجميد واجهة مهما طالت القائمة)
    const BATCH = 60;
    const self = this;
    // ⭐ v1.0: في القوائم المختلطة — البث الحي صف قناة، والباقي بطاقة بوستر
    const mkItem = (it) => (mixed && it.type === 'live') ? self.chanRow(it) : (isPoster ? self.posterCard(it) : self.chanRow(it));
    (function renderChunk(i) {
      const end = Math.min(i + BATCH, shown.length);
      const frag = document.createDocumentFragment();
      for (let j = i; j < end; j++) frag.appendChild(mkItem(shown[j]));
      container.appendChild(frag);
      if (end < shown.length) requestAnimationFrame(() => renderChunk(end));
      else self.focusFirst('list');
    })(0);
  },

  posterCard(it) {
    const w = document.createElement('div'); w.className = 'pwrap';
    const d = document.createElement('div'); d.className = 'pcard';
    const fav = this.isFav(it) ? '<span class="fav-star">★</span>' : '';
    const prog = it._resume ? `<div style="text-align:center;color:#7CE38B;font-size:10.5px;margin-top:2px">▶ ${fmt(it._resume)} / ${fmt(it._dur)}</div>` : '';
    d.innerHTML = `${fav}<img loading="lazy" decoding="async" src="${it.logo || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22180%22%3E%3Crect fill=%22%230A0E22%22 width=%22120%22 height=%22180%22%3E%3Ctext x=%2260%22 y=%2295%22 fill=%22%23D9A94E%22 font-size=%2240%22 text-anchor=%22middle%22%3E🎬%3C/text%3E%3C/svg%3E'">
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
  rememberAccount(kind, label, value) {
    if (!value) return;
    const list = this.getAccounts().filter(a => a.value !== value);
    list.unshift({ id: 'a' + Date.now() + Math.floor(Math.random() * 999), kind, label: label || 'حساب', value, addedAt: new Date().toLocaleDateString('ar-DZ') });
    this.saveAccounts(list.slice(0, 20));   // حد أقصى 20 مثل الهاتف
  },

  buildAccounts() {
    const acc = (this.src && this.src.account && this.src.account.user_info) || {};
    const isX = this.src && this.src.type === 'xtream';
    const exp = acc.exp_date ? new Date(+acc.exp_date * 1000).toLocaleDateString('ar-DZ') : (this.user?.expires || '—');
    // 🎨 v1.0: شارة الصلاحية الملونة (أخضر/برتقالي/أحمر/رمادي)
    let badge;
    if (!isX) badge = '<span class="badge-exp gray">غير متوفر — رابط مباشر</span>';
    else if (acc.exp_date) {
      const days = Math.ceil((+acc.exp_date * 1000 - Date.now()) / 86400000);
      if (days < 0) badge = '<span class="badge-exp red">⛔ منتهي الصلاحية</span>';
      else if (days <= 7) badge = `<span class="badge-exp orange">⏳ ${days} يوم متبقٍ</span>`;
      else badge = `<span class="badge-exp green">✓ ${days} يوم متبقٍ</span>`;
    } else badge = '<span class="badge-exp gray">غير محدد</span>';
    const created = acc.created_at ? new Date(+acc.created_at * 1000).toLocaleDateString('ar-DZ') : '';
    const curUrl = localStorage.getItem('source_url') || '';
    const list = this.getAccounts();
    const rows = list.length ? list.map(a => `
      <div class="acc-row${a.value === curUrl ? ' acc-active' : ''}">
        <div class="acc-info"><b>${esc(a.label)}</b><span>${a.kind === 'code' ? '🎫 كود تفعيل' : '🔗 M3U مباشر'} · أضيف ${esc(a.addedAt || '')}</span></div>
        <div class="acc-actions">
          ${a.value === curUrl ? '<span class="acc-now">✓ نشط</span>' : `<button class="p-btn" data-acc-go="${a.id}">🚪 دخول</button>`}
          <button class="p-btn" data-acc-del="${a.id}">🗑 حذف</button>
        </div>
      </div>`).join('') : '<div class="acc-empty">لا توجد حسابات محفوظة بعد — أضف واحداً بالأسفل 👇</div>';
    document.getElementById('accountsBody').innerHTML = `
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
      <div class="set-card"><h3>📋 الحسابات المحفوظة (${list.length}/20)</h3>${rows}</div>
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
          <button class="paste-btn" data-paste="accM3uInput" title="لصق من الحافظة"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button>
        </div>
        <button class="gold-btn" id="accM3uBtn" style="width:100%">🔗 إضافة ودخول</button>
      </div>
      <div class="set-card"><div id="accMsg" class="verify-msg"></div></div>`;
    document.getElementById('accCodeBtn').onclick = () => this.applyCode(document.getElementById('accCodeInput').value.trim(), document.getElementById('accMsg'));
    document.getElementById('accM3uBtn').onclick = () => this.applyM3u(document.getElementById('accM3uInput').value.trim(), document.getElementById('accMsg'));
    document.getElementById('accCodeInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('accCodeBtn').click(); });
    document.getElementById('accM3uInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('accM3uBtn').click(); });
    document.querySelectorAll('[data-acc-go]').forEach(b => b.onclick = async () => {
      const a = list.find(x => x.id === b.dataset.accGo);
      if (!a) return;
      const msg = document.getElementById('accMsg');
      msg.className = 'verify-msg'; msg.textContent = '⏳ جارٍ الدخول إلى ' + a.label + '...';
      this.showChecking();                    // ⏳ v1.0.1
      try { await this.loadSource(a.value, false, a.value, { welcome: true }); }
      catch (e) { msg.textContent = '✗ تعذر الدخول — قد يكون الحساب منتهياً: ' + e.message; msg.classList.add('err'); }
      finally { this.hideChecking(); }
    });
    document.querySelectorAll('[data-acc-del]').forEach(b => b.onclick = () => {
      this.saveAccounts(this.getAccounts().filter(x => x.id !== b.dataset.accDel));
      this.buildAccounts(); this.focusFirst('accounts');
    });
  }
};
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ═══ ⌨️ التنقل المكاني (فلسفة الريموت: أسهم + OK + رجوع) ═══
function spatialMove(dx, dy) {
  const root = document.querySelector('.screen.active');
  if (!root) return;
  const cur = root.querySelector('.focused');
  const focusables = [...root.querySelectorAll('.tcard, .vtab, .gold-btn, .cat-chip, .chan, .pcard, .ep, .back-btn, .tv-input, .p-btn, .set-card .p-btn')].filter(el => el.offsetParent);
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
  if (App.screen === 'player') {
    if (e.key === 'Escape') { App.back(); }
    else Player.onKey(e);
    return;
  }
  const cur = document.querySelector('.screen.active .focused');
  switch (e.key) {
    case 'ArrowUp': spatialMove(0, -1); e.preventDefault(); break;
    case 'ArrowDown': spatialMove(0, 1); e.preventDefault(); break;
    case 'ArrowLeft': spatialMove(-1, 0); e.preventDefault(); break;
    case 'ArrowRight': spatialMove(1, 0); e.preventDefault(); break;
    case 'Enter': if (cur) { cur.click(); if (cur.classList.contains('tv-input')) cur.focus(); } e.preventDefault(); break;
    case 'Escape': case 'Backspace': if (App.screen !== 'verify' && App.screen !== 'home') App.back(); e.preventDefault(); break;
  }
});
// الفأرة = نفس التركيز
document.addEventListener('mouseover', (e) => {
  const t = e.target.closest('.tcard, .vtab, .gold-btn, .cat-chip, .chan, .pcard, .ep, .back-btn, .p-btn, .tv-input');
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
document.getElementById('codeBtn').onclick = () => App.doVerify();
document.getElementById('m3uBtn').onclick = () => App.doM3u();
document.getElementById('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') App.doVerify(); });
document.getElementById('m3uInput').addEventListener('keydown', e => { if (e.key === 'Enter') App.doM3u(); });
document.getElementById('searchInput').addEventListener('input', () => { if (App.screen === 'list') App.buildList(); });

App.boot();
