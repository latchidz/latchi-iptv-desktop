// ═══ 🔌 LATCHI IPTV Desktop — طبقة البيانات v1.1 (كسوي + كاش دائم) ═══
// الفلسفة: لا تحميل شامل أبداً — الفئات فقط عند الإقلاع (كاش 24س)
// وعناصر كل فئة تُجلب عند فتحها فقط وتبقى محفوظة على القرص (كاش 12س)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxThygspXN6eB8cDUfY7XavKmhXZfewEUfQqd3vARScZ5y7adterInsbXshNkgPgfiF/exec';

const TTL = {
  categories: 24 * 3600 * 1000,  // قوائم الفئات
  catItems: 12 * 3600 * 1000,   // عناصر فئة واحدة
  m3u: 12 * 3600 * 1000,        // قائمة M3U كاملة
  account: 3600 * 1000,         // معلومات الحساب
  seriesInfo: 24 * 3600 * 1000  // تفاصيل مسلسل
};

const LatchiAPI = {
  _src: null,        // { type, server?, username?, password?, categories, account?, lazy }
  _hidden: (localStorage.getItem('hidden_cats') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  _mem: {},          // كاش الذاكرة للجلسة الحالية

  // 💾 كاش القرص (عبر IPC — يبقى بعد إغلاق التطبيق)
  async cget(key) {
    if (key in this._mem) return this._mem[key];
    try {
      const v = await window.latchi.cacheGet(key);
      if (v !== null) this._mem[key] = v;
      return v;
    } catch (e) { return null; }
  },
  async cset(key, value, ttl) {
    this._mem[key] = value;
    try { await window.latchi.cacheSet(key, value, ttl); } catch (e) {}
  },

  // 🔑 التحقق عبر السكريبت (نفس أندرويد: verify_code + hidden_categories)
  async verifyCode(code, deviceId) {
    const url = `${SCRIPT_URL}?action=verify_code&code=${encodeURIComponent(code)}&device_id=${encodeURIComponent(deviceId)}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.valid === true || d.success === true) {
      const hid = String(d.hidden_categories || d.hiddenCategories || '');
      if (hid) localStorage.setItem('hidden_cats', hid);
      this._hidden = hid.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      return { ok: true, name: d.name || 'مستخدم VIP', expires: d.expires_at || '', url: d.master_url || d.playlist_url || d.m3u_url || '' };
    }
    return { ok: false, message: d.message || 'كود غير صحيح أو منتهي' };
  },

  // 🧠 كشف نوع المصدر
  parseXtream(url) {
    try {
      if (/get\.php\?/i.test(url)) {
        const u = new URL(url);
        return { server: u.origin, username: u.searchParams.get('username'), password: u.searchParams.get('password') };
      }
      const m = url.match(/^https?:\/\/([^\/]+)\/([^\/]+)\/([^\/?]+)\/?$/);
      if (m) return { server: 'http://' + m[1], username: m[2], password: m[3] };
    } catch (e) {}
    return null;
  },

  async loadSource(url) {
    const xt = LatchiAPI.parseXtream(url);
    if (xt) return LatchiAPI.loadXtream(xt);
    return LatchiAPI.loadM3u(url);
  },

  // ═══ 🚀 Xtream كسوي: الفئات فقط — لا قنوات ولا أفلام ولا مسلسلات هنا ═══
  async loadXtream(x) {
    LatchiAPI._src = { type: 'xtream', lazy: true, server: x.server, username: x.username, password: x.password, categories: { live: [], movie: [], series: [] }, account: null };
    const k = `xt:${x.server}|${x.username}`;
    const api = (action, extra = '') =>
      fetch(`${x.server}/player_api.php?username=${encodeURIComponent(x.username)}&password=${encodeURIComponent(x.password)}&action=${action}${extra}`).then(r => r.json());
    // الحساب (كاش ساعة)
    let acc = await LatchiAPI.cget(k + '|acc');
    if (!acc) {
      try { acc = await api(''); await LatchiAPI.cset(k + '|acc', acc, TTL.account); } catch (e) { acc = null; }
    }
    LatchiAPI._src.account = acc;
    // الفئات الثلاث فقط (طلبات صغيرة وسريعة — كاش 24 ساعة)
    const catActions = { live: 'get_live_categories', movie: 'get_vod_categories', series: 'get_series_categories' };
    for (const t of ['live', 'movie', 'series']) {
      let cats = await LatchiAPI.cget(k + '|cats:' + t);
      if (!cats) {
        try {
          const raw = await api(catActions[t]);
          cats = (raw || []).map(c => ({ id: String(c.category_id), name: c.category_name }));
          await LatchiAPI.cset(k + '|cats:' + t, cats, TTL.categories);
        } catch (e) { cats = []; }
      }
      LatchiAPI._src.categories[t] = LatchiAPI.filterHidden(cats);
    }
    return LatchiAPI._src;
  },

  // 🙈 إخفاء الفئات الممنوعة (نفس منطق الهاتف/التلفاز تماماً)
  filterHidden(cats) {
    if (!this._hidden.length) return cats;
    return cats.filter(c => !this._hidden.includes(String(c.name || '').trim().toLowerCase()));
  },

  // 🧭 ترتيب الفئات — نفس ترتيب واجهة التلفاز حرفياً (beIN ← الجزائر ← تونس ← عربي ← محتوى ← أجنبي)
  orderCategories(cats) {
    const l = s => String(s || '').toLowerCase();
    const isBein = s => l(s).includes('bein') || s.includes('بي ان') || s.includes('بي إن');
    const isAlgeria = s => { const v = l(s); return v.includes('alger') || v.includes('algé') || v.includes('algeria') || v.includes('الجزائر') || /(^|[^a-z])alg([^a-z]|$)/.test(v); };
    const isTunisia = s => { const v = l(s); return v.includes('tunis') || v.includes('تونس'); };
    const isArabic = s => {
      const v = l(s);
      if (isBein(v)) return false;
      if (v.includes('arab') || v.includes('عرب')) return true;
      if (v.includes('maroc') || v.includes('morocc') || v.includes('مغرب') || v.includes('maghreb') ||
          v.includes('ksa') || v.includes('saudi') || v.includes('سعود') || v.includes('مصر') || v.includes('egypt') ||
          v.includes('qatar') || v.includes('قطر') || v.includes('emarat') || v.includes('uae') || v.includes('إمارات') ||
          v.includes('libya') || v.includes('ليبيا') || v.includes('kuwait') || v.includes('كويت') || v.includes('أردن')) return true;
      return false;
    };
    const rank = (c) => {
      const v = l(c.name);
      if (isBein(v)) {
        if ((v.includes('sport') || v.includes('hd')) && !v.includes('max')) return 10;
        if (v.includes('max') || v.includes('ماكس')) return 11;
        if (v.includes('afc') || v.includes('entrai') || v.includes('entertain')) return 12;
        if (v.includes('movie') || v.includes('film') || v.includes('cinema')) return 13;
        return 14;
      }
      if (isAlgeria(v)) return 20;
      if (isTunisia(v)) return 21;
      if (isArabic(v)) return 22;
      if (v.includes('movie') || v.includes('film') || v.includes('أفلام') || v.includes('افلام')) return 40;
      if (v.includes('series') || v.includes('مسلسل')) return 41;
      if (v.includes('kid') || v.includes('أطفال') || v.includes('اطفال') || v.includes('cartoon')) return 42;
      if (v.includes('sport') || v.includes('ssc') || v.includes('alkass')) return 43;
      if (v.includes('news') || v.includes('أخبار') || v.includes('اخبار')) return 44;
      return 90;
    };
    return [...cats].sort((a, b) => (rank(a) - rank(b)) || String(a.name).localeCompare(String(b.name), 'ar'));
  },

  // ═══ 📥 جلب عناصر فئة واحدة (عند فتحها فقط) مع كاش دائم ═══
  async getCategoryItems(kind, catId, catName) {
    const x = LatchiAPI._src;
    if (!x || x.type !== 'xtream') return [];
    const kk = `xt:${x.server}|${x.username}|items:${kind}:${catId}`;
    const cached = await LatchiAPI.cget(kk);
    if (cached) return cached;
    const action = kind === 'live' ? 'get_live_streams' : kind === 'movie' ? 'get_vod_streams' : 'get_series';
    let raw = [];
    try {
      const r = await fetch(`${x.server}/player_api.php?username=${encodeURIComponent(x.username)}&password=${encodeURIComponent(x.password)}&action=${action}&category_id=${encodeURIComponent(catId)}`);
      raw = await r.json() || [];
    } catch (e) { return []; }
    // بعض الخوادم تتجاهل category_id — نرشّح محلياً دائماً
    raw = raw.filter(s => String(s.category_id) === String(catId));
    let out;
    if (kind === 'live') {
      out = raw.map(s => ({
        id: 'L' + s.stream_id, name: s.name, logo: s.stream_icon || '', group: catName || '',
        type: 'live', url: `${x.server}/live/${x.username}/${x.password}/${s.stream_id}.m3u8`,
        urlTs: `${x.server}/live/${x.username}/${x.password}/${s.stream_id}.ts`
      }));
    } else if (kind === 'movie') {
      out = raw.map(s => ({
        id: 'M' + s.stream_id, name: s.name, logo: s.stream_icon || s.cover || '', group: catName || '',
        type: 'movie', url: `${x.server}/movie/${x.username}/${x.password}/${s.stream_id}.${(s.container_extension || 'mp4')}`,
        rating: s.rating, added: s.added
      }));
    } else {
      out = raw.map(s => ({
        id: 'S' + s.series_id, name: s.name, logo: s.cover || '', group: catName || '',
        type: 'series', seriesId: s.series_id, rating: s.rating, plot: s.plot || ''
      }));
    }
    await LatchiAPI.cset(kk, out, TTL.catItems);
    return out;
  },

  // 🔍 فئات beIN (للزر السريع في الرئيسية)
  beinCategories(kind) {
    const x = LatchiAPI._src;
    if (!x || x.type !== 'xtream') return [];
    return x.categories[kind].filter(c => /bein|بي ان|بي إن/i.test(String(c.name)));
  },

  // 📄 تفاصيل مسلسل (كاش 24س)
  async loadSeriesDetails(seriesId) {
    const x = LatchiAPI._src;
    if (!x) return null;
    const kk = `xt:${x.server}|${x.username}|series:${seriesId}`;
    const cached = await LatchiAPI.cget(kk);
    if (cached) return cached;
    const d = await fetch(`${x.server}/player_api.php?username=${encodeURIComponent(x.username)}&password=${encodeURIComponent(x.password)}&action=get_series_info&series_id=${seriesId}`).then(r => r.json());
    await LatchiAPI.cset(kk, d, TTL.seriesInfo);
    return d;
  },

  // ═══ 📄 M3U: يُحمَّل مرة وتبقى القائمة كاملة محفوظة على القرص ═══
  async loadM3u(url) {
    const kk = 'm3u:' + url;
    const cached = await LatchiAPI.cget(kk);
    if (cached) {
      LatchiAPI._src = { type: 'm3u', lazy: false, live: cached.live, movies: cached.movies, series: cached.series };
      return LatchiAPI._src;
    }
    const r = await fetch(url);
    if (!r.ok) throw new Error('تعذر تحميل القائمة: ' + r.status);
    const text = await r.text();
    const parsed = LatchiAPI.parseM3uText(text);
    LatchiAPI._src = { type: 'm3u', lazy: false, live: parsed.live, movies: parsed.movies, series: parsed.series };
    // لا نحفظ القوائم الضخمة في كاش القرص إذا تجاوزت حداً معقولاً (حماية للقرص)
    const size = (parsed.live.length + parsed.movies.length + parsed.series.length);
    if (size > 0 && size <= 60000) await LatchiAPI.cset(kk, { live: parsed.live, movies: parsed.movies, series: parsed.series }, TTL.m3u);
    return LatchiAPI._src;
  },

  parseM3uText(text) {
    const lines = text.split(/\r?\n/);
    const out = { live: [], movies: [], series: [] };
    let cur = null;
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        const name = (line.split(',').slice(1).join(',') || '').trim();
        const logo = (line.match(/tvg-logo="([^"]*)"/) || [])[1] || '';
        const group = (line.match(/group-title="([^"]*)"/) || [])[1] || '';
        cur = { name, logo, group };
      } else if (!line.startsWith('#') && cur) {
        cur.url = line;
        const t = LatchiAPI.classify(cur, line);
        out[t].push(Object.assign(cur, { id: t[0] + Math.random().toString(36).slice(2, 9), type: t }));
        cur = null;
      }
    }
    return out;
  },

  // 🧭 تصنيف تلقائي (نفس منطق أندرويد)
  classify(item, url) {
    const u = url.toLowerCase(), g = (item.group || '').toLowerCase();
    if (u.includes('/series/') || u.includes('/serie/')) return 'series';
    if (u.includes('/movie/') || u.includes('/movies/') || u.includes('/vod/')) return 'movie';
    if (u.includes('/live/')) return 'live';
    if (g.includes('مسلسل') || g.includes('series')) return 'series';
    if (g.includes('فيلم') || g.includes('أفلام') || g.includes('movie') || g.includes('vod')) return 'movie';
    if (/\.(mp4|mkv|avi)$/.test(u)) return 'movie';
    return 'live';
  },

  // 📊 إحصاءات (كسلية: عدد الفئات؛ M3U: عدد العناصر)
  stats(src) {
    if (src.type === 'xtream') {
      const c = src.categories || {};
      return { live: (c.live || []).length, movies: (c.movie || []).length, series: (c.series || []).length, unit: 'فئة' };
    }
    return { live: src.live.length, movies: src.movies.length, series: src.series.length, unit: '' };
  }
};
window.LatchiAPI = LatchiAPI;
