// ═══ 🧠 LATCHI IPTV Desktop — العقل التطبيقي (شاشات + تنقل تلفازي) ═══
const App = {
  src: null,          // { type, live[], movies[], series[], account? }
  user: null,         // { name, expires, code }
  screen: 'splash',
  navStack: [],       // مكدس الرجوع (نفس فلسفة التلفاز)
  favs: JSON.parse(localStorage.getItem('favs') || '[]'),
  listCtx: null,      // سياق الشاشة الحالية { kind, items, cat }

  // ═══ الإقلاع ═══
  async boot() {
    Player.init();
    Player.hideCb = () => App.back();
    this.clockTick(); setInterval(() => this.clockTick(), 1000);
    await new Promise(r => setTimeout(r, 2600)); // السبلاش (نفس إحساس التلفاز)
    const saved = localStorage.getItem('source_url');
    if (saved) {
      this.show('verify', true);
      document.getElementById('verifyMsg').textContent = '⏳ استئناف الحساب المحفوظ...';
      try {
        await this.loadSource(saved, true);
        return;
      } catch (e) { /* نكمل لشاشة التحقق */ }
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
    if (!resetStack && !['splash'].includes(name)) {
      // إدارة المكدس
    }
    this.onShown(name);
  },

  push(name) {
    this.navStack.push(this.screen);
    this.show(name);
  },
  back() {
    if (this.screen === 'player') { Player.close(); return; }
    const prev = this.navStack.pop();
    if (prev) this.show(prev); else this.show('home', true);
  },

  onShown(name) {
    if (name === 'home') this.buildHome();
    if (name === 'settings') this.buildSettings();
    this.focusFirst(name);
  },

  focusFirst(name) {
    const root = document.getElementById(name);
    const f = root.querySelector('.focused') || root.querySelector('.tcard, .vtab, .gold-btn, .cat-chip, .chan, .pcard, .ep, .back-btn, .tv-input, .p-btn');
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
    if (f) f.classList.add('focused');
  },

  // ═══ التحقق ═══
  async doVerify() {
    const code = document.getElementById('codeInput').value.trim();
    const msg = document.getElementById('verifyMsg');
    msg.className = 'verify-msg';
    if (!code) { msg.textContent = 'أدخل الكود أولاً'; msg.classList.add('err'); return; }
    msg.textContent = '⏳ جارٍ التحقق...';
    try {
      const deviceId = await window.latchi.deviceId();
      const res = await LatchiAPI.verifyCode(code, deviceId);
      if (!res.ok) { msg.textContent = '✗ ' + res.message; msg.classList.add('err'); return; }
      if (!res.url) { msg.textContent = '✗ لا توجد قائمة مرتبطة بهذا الكود'; msg.classList.add('err'); return; }
      msg.textContent = '✓ ' + res.name + ' — تحميل المحتوى...'; msg.classList.add('ok');
      this.user = { name: res.name, expires: res.expires, code };
      await this.loadSource(res.url, false, res.url);
    } catch (e) {
      msg.textContent = '✗ خطأ في الاتصال: ' + e.message; msg.classList.add('err');
    }
  },

  async doM3u() {
    const url = document.getElementById('m3uInput').value.trim();
    const msg = document.getElementById('verifyMsg');
    msg.className = 'verify-msg';
    if (!/^https?:\/\//.test(url)) { msg.textContent = 'أدخل رابط M3U صحيحاً يبدأ بـ http'; msg.classList.add('err'); return; }
    msg.textContent = '⏳ تحميل القائمة...';
    this.user = { name: 'M3U مباشر', expires: '', code: '' };
    try { await this.loadSource(url, false, url); }
    catch (e) { msg.textContent = '✗ ' + e.message; msg.classList.add('err'); }
  },

  async loadSource(url, silent, saveUrl) {
    try {
      const src = await LatchiAPI.loadSource(url);
      if (!src.live.length && !src.movies.length && !src.series.length) throw new Error('القائمة فارغة أو غير صالحة');
      this.src = src;
      if (saveUrl) localStorage.setItem('source_url', saveUrl);
      this.show('home', true);
    } catch (e) {
      localStorage.removeItem('source_url');
      if (silent) throw e;
      const msg = document.getElementById('verifyMsg');
      msg.textContent = '✗ ' + e.message; msg.classList.add('err');
    }
  },

  // ═══ الرئيسية ═══
  buildHome() {
    const s = LatchiAPI.stats(this.src);
    document.getElementById('userChip').textContent = '👤 ' + (this.user?.name || '');
    const cards = [
      { ic: '📡', t: 'البث المباشر', c: s.live + ' قناة', go: () => this.openList('live') },
      { ic: '⚽', t: 'beIN سبورت', c: 'القنوات الرياضية', go: () => this.openList('live', 'bein') },
      { ic: '🎬', t: 'الأفلام', c: s.movies + ' فيلم', go: () => this.openList('movies') },
      { ic: '📺', t: 'المسلسلات', c: s.series + ' مسلسل', go: () => this.openList('series') },
      { ic: '⭐', t: 'المفضلة', c: this.favs.length + ' عنصر', go: () => this.openList('fav') },
      { ic: '⏯', t: 'متابعة المشاهدة', c: this.continueList().length + ' عنصر', go: () => this.openList('cw') },
      { ic: '⚙️', t: 'الإعدادات', c: 'الحساب والبيانات', go: () => this.push('settings') }
    ];
    const el = document.getElementById('cards');
    el.innerHTML = '';
    cards.forEach(c => {
      const d = document.createElement('div');
      d.className = 'tcard';
      d.innerHTML = `<span class="ic">${c.ic}</span><div class="t">${c.t}</div><div class="c">${c.c}</div>`;
      d.onclick = () => c.go();
      el.appendChild(d);
    });
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

  // ═══ القوائم ═══
  openList(kind, filter = null) {
    let items, title;
    if (kind === 'live') { items = this.src.live; title = 'البث المباشر'; }
    else if (kind === 'movies') { items = this.src.movies; title = 'الأفلام'; }
    else if (kind === 'series') { items = this.src.series; title = 'المسلسلات'; }
    else if (kind === 'fav') {
      items = this.favs;
      title = 'المفضلة';
    } else if (kind === 'cw') {
      items = this.continueList().map(v => Object.assign({}, v.item, { _resume: v.at, _dur: v.dur }));
      title = 'متابعة المشاهدة';
    }
    if (filter === 'bein') {
      items = items.filter(c => /bein|be ?n ?sports|سبورت/i.test(c.name + ' ' + (c.group || '')));
      title = 'beIN سبورت';
    }
    this.listCtx = { kind, items, filter, title };
    this.buildList();
    this.push('list');
  },

  buildList() {
    const { kind, items, title } = this.listCtx;
    // الفئات
    const groups = [...new Set(items.map(i => i.group || 'عام'))].sort((a, b) => a.localeCompare(b, 'ar'));
    const catsBar = document.getElementById('catsBar');
    const cur = this.listCtx.cat || 'الكل';
    catsBar.innerHTML = '';
    const mk = (label, val) => {
      const c = document.createElement('div');
      c.className = 'cat-chip' + (cur === val ? ' active focused' : '');
      c.textContent = label;
      c.onclick = () => { this.listCtx.cat = val; this.buildList(); };
      catsBar.appendChild(c);
    };
    mk('🏷 الكل', 'الكل');
    groups.forEach(g => mk(g, g));
    // العناصر
    const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    let shown = items.filter(i => (cur === 'الكل' || (i.group || 'عام') === cur) && (!q || (i.name || '').toLowerCase().includes(q)));
    const body = document.getElementById('listBody');
    body.innerHTML = '';
    const isPoster = ['movies', 'series', 'fav', 'cw'].includes(kind) && shown[0] && shown[0].type !== 'live';
    if (isPoster) {
      const grid = document.createElement('div');
      grid.className = 'poster-grid';
      shown.forEach(it => grid.appendChild(this.posterCard(it)));
      body.appendChild(grid);
    } else {
      const list = document.createElement('div');
      list.className = 'chan-list';
      shown.forEach(it => list.appendChild(this.chanRow(it)));
      body.appendChild(list);
    }
    if (!shown.length) body.innerHTML = '<div style="text-align:center;color:#8A90B8;font-size:18px;padding:60px">لا توجد نتائج</div>';
    this.focusFirst('list');
  },

  posterCard(it) {
    const w = document.createElement('div'); w.className = 'pwrap';
    const d = document.createElement('div'); d.className = 'pcard';
    const fav = this.isFav(it) ? '<span class="fav-star">★</span>' : '';
    const prog = it._resume ? `<div style="text-align:center;color:#7CE38B;font-size:10.5px;margin-top:2px">▶ ${fmt(it._resume)} / ${fmt(it._dur)}</div>` : '';
    d.innerHTML = `${fav}<img loading="lazy" src="${it.logo || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22180%22%3E%3Crect fill=%22%230A0E22%22 width=%22120%22 height=%22180%22/%3E%3Ctext x=%2260%22 y=%2295%22 fill=%22%23D9A94E%22 font-size=%2240%22 text-anchor=%22middle%22%3E🎬%3C/text%3E%3C/svg%3E'">
      <div class="pt">${esc(it.name)}</div>${prog}<div class="pc"><span>${esc(it.group || '')}</span></div>`;
    d.onclick = () => this.openDetails(it);
    w.appendChild(d);
    return w;
  },

  chanRow(it) {
    const d = document.createElement('div');
    d.className = 'chan';
    const live = it.type === 'live';
    d.innerHTML = `<img loading="lazy" src="${it.logo || ''}" onerror="this.style.visibility='hidden'">
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
    body.innerHTML = '<div style="color:#8A90B8;font-size:18px;padding:40px">⏳ تحميل التفاصيل...</div>';
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
            ${s.episodes.map(e => `<div class="ep" data-url="${esc(e.url)}" data-name="${esc(e.name)}">
              <div class="en">${esc(String(e.episodeNum || ''))}</div>
              <div><div class="et">${esc(e.name)}</div><div class="ed">${esc((e.dur || ''))}</div></div>
              <div class="prog">${e.resumeTxt || ''}</div>
            </div>`).join('')}
          </div>`).join('')}
      </div>`;
    const play = document.getElementById('dPlay');
    if (play) play.onclick = () => this.startPlay(it);
    document.getElementById('dFav').onclick = () => {
      this.toggleFav(it);
      document.getElementById('dFav').textContent = this.isFav(it) ? '★ في المفضلة' : '☆ إضافة للمفضلة';
    };
    body.querySelectorAll('.ep').forEach((el, i) => {
      el.onclick = () => this.startPlay({ id: 'S' + it.seriesId + '_' + i, name: el.dataset.name, url: el.dataset.url, type: 'movie', logo: it.logo, group: it.name });
    });
    this.focusFirst('details');
  },

  // ═══ التشغيل ═══
  startPlay(it) {
    const resume = it._resume || (parseInt((localStorage.getItem('cw_' + it.id) || '{"at":0}').match(/"at":(\d+)/) || [0, 0])[1]);
    this.push('player');
    Player.play(it, { resumeAt: (resume && resume > 15) ? resume : 0 });
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
    const s = this.src ? LatchiAPI.stats(this.src) : { live: 0, movies: 0, series: 0 };
    const acc = (this.src && this.src.account && this.src.account.user_info) || {};
    const exp = acc.exp_date ? new Date(+acc.exp_date * 1000).toLocaleDateString('ar-DZ') : (this.user?.expires || '—');
    const conns = acc.active_connections != null ? `${acc.active_connections} / ${acc.max_connections}` : '—';
    document.getElementById('settingsBody').innerHTML = `
      <div class="set-card"><h3>👤 الحساب</h3>
        <div class="row"><span>الاسم</span><b>${esc(this.user?.name || '—')}</b></div>
        <div class="row"><span>الكود</span><b>${esc(this.user?.code || 'M3U مباشر')}</b></div>
        <div class="row"><span>ينتهي في</span><b>${esc(String(exp))}</b></div>
        <div class="row"><span>الاتصالات</span><b>${esc(conns)}</b></div>
      </div>
      <div class="set-card"><h3>📊 المحتوى</h3>
        <div class="row"><span>القنوات</span><b>${s.live}</b></div>
        <div class="row"><span>الأفلام</span><b>${s.movies}</b></div>
        <div class="row"><span>المسلسلات</span><b>${s.series}</b></div>
        <div class="row"><span>المصدر</span><b>${this.src?.type === 'xtream' ? 'Xtream Codes' : 'M3U'}</b></div>
      </div>
      <div class="set-card"><h3>🧹 البيانات</h3>
        <div class="row"><span>تفريغ متابعة المشاهدة</span><button class="p-btn" id="clearCw">تفريغ</button></div>
        <div class="row"><span>تفريغ المفضلة</span><button class="p-btn" id="clearFav">تفريغ</button></div>
      </div>
      <div class="set-card"><h3>🚪 الخروج</h3>
        <button class="gold-btn danger-btn" id="logout" style="width:100%">تسجيل الخروج والعودة للتحقق</button>
      </div>`;
    document.getElementById('clearCw').onclick = () => {
      Object.keys(localStorage).filter(k => k.startsWith('cw_')).forEach(k => localStorage.removeItem(k));
      this.buildSettings(); this.focusFirst('settings');
    };
    document.getElementById('clearFav').onclick = () => { localStorage.removeItem('favs'); this.favs = []; this.buildSettings(); this.focusFirst('settings'); };
    document.getElementById('logout').onclick = () => {
      localStorage.removeItem('source_url');
      location.reload();
    };
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
