// ═══ 🔌 LATCHI IPTV Desktop — طبقة البيانات (تحقق + Xtream + M3U) ═══
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxThygspXN6eB8cDUfY7XavKmhXZfewEUfQqd3vARScZ5y7adterInsbXshNkgPgfiF/exec';

const LatchiAPI = {

  // 🔑 التحقق عبر السكريبت (نفس أندرويد: verify_code)
  async verifyCode(code, deviceId) {
    const url = `${SCRIPT_URL}?action=verify_code&code=${encodeURIComponent(code)}&device_id=${encodeURIComponent(deviceId)}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.valid === true || d.success === true) {
      return { ok: true, name: d.name || 'مستخدم VIP', expires: d.expires_at || '', url: d.master_url || d.playlist_url || d.m3u_url || '' };
    }
    return { ok: false, message: d.message || 'كود غير صحيح أو منتهي' };
  },

  // 🧠 كشف نوع المصدر وتحميله
  async loadSource(url) {
    // نمط Xtream: /get.php أو host:port/user/pass
    const xt = LatchiAPI.parseXtream(url);
    if (xt) return LatchiAPI.loadXtream(xt);
    return LatchiAPI.loadM3u(url);
  },

  parseXtream(url) {
    try {
      if (/get\.php\?/i.test(url)) {
        const u = new URL(url);
        return { server: u.origin, username: u.searchParams.get('username'), password: u.searchParams.get('password') };
      }
      const m = url.match(/^https?:\/\/([^\/]+)\/([^\/]+)\/([^\/?]+)\/?$/);
      if (m) return { server: 'http://' + m[1], username: m[2], password: m[3] };
    } catch (e) {}
    // تحقق إضافي: نجرّب player_api مباشرة
    return null;
  },

  async loadXtream(x) {
    LatchiAPI._src = { server: x.server, username: x.username, password: x.password };
    const api = (action, extra = '') =>
      fetch(`${x.server}/player_api.php?username=${encodeURIComponent(x.username)}&password=${encodeURIComponent(x.password)}&action=${action}${extra}`).then(r => r.json());
    const out = { type: 'xtream', server: x.server, live: [], movies: [], series: [], categories: { live: [], movie: [], series: [] } };
    try { out.account = await api('') } catch (e) { out.account = null; }
    // الفئات
    for (const t of ['live', 'movie', 'series']) {
      try {
        const cats = await api(`get_${t}_categories`);
        out.categories[t] = (cats || []).map(c => ({ id: c.category_id, name: c.category_name }));
      } catch (e) {}
    }
    const catName = (t, id) => { const c = out.categories[t].find(c => c.id === id); return c ? c.name : (t === 'live' ? 'Live' : t === 'movie' ? 'أفلام' : 'مسلسلات'); };
    // البث المباشر
    try {
      const ls = await api('get_live_streams');
      out.live = (ls || []).map(s => ({
        id: 'L' + s.stream_id, name: s.name, logo: s.stream_icon || '', group: catName('live', s.category_id),
        type: 'live', url: `${x.server}/live/${x.username}/${x.password}/${s.stream_id}.m3u8`
      }));
    } catch (e) {}
    // الأفلام
    try {
      const vs = await api('get_vod_streams');
      out.movies = (vs || []).map(s => ({
        id: 'M' + s.stream_id, name: s.name, logo: s.stream_icon || s.cover || '', group: catName('movie', s.category_id),
        type: 'movie', url: `${x.server}/movie/${x.username}/${x.password}/${s.stream_id}.${(s.container_extension || 'mp4')}`,
        rating: s.rating, added: s.added
      }));
    } catch (e) {}
    // المسلسلات
    try {
      const ss = await api('get_series');
      out.series = (ss || []).map(s => ({
        id: 'S' + s.series_id, name: s.name, logo: s.cover || '', group: catName('series', s.category_id),
        type: 'series', seriesId: s.series_id, rating: s.rating, plot: s.plot || ''
      }));
    } catch (e) {}
    return out;
  },

  // تفاصيل مسلسل (المواسم والحلقات)
  async loadSeriesDetails(seriesId) {
    const x = LatchiAPI._src;
    if (!x) return null;
    return fetch(`${x.server}/player_api.php?username=${encodeURIComponent(x.username)}&password=${encodeURIComponent(x.password)}&action=get_series_info&series_id=${seriesId}`).then(r => r.json());
  },

  // 📄 تحليل M3U
  async loadM3u(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('تعذر تحميل القائمة: ' + r.status);
    const text = await r.text();
    return LatchiAPI.parseM3uText(text);
  },

  parseM3uText(text) {
    const lines = text.split(/\r?\n/);
    const out = { type: 'm3u', live: [], movies: [], series: [] };
    let cur = null;
    const ext = (text.match(/#EXTINF/g) || []).length;
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

  // 📊 إحصاءات سريعة
  stats(src) { return { live: src.live.length, movies: src.movies.length, series: src.series.length }; }
};
window.LatchiAPI = LatchiAPI;
