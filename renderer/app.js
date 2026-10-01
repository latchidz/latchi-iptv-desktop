// ═══ LATCHI IPTV Desktop v1.1 — العقل التطبيقي (تحميل كسوي + كاش دائم) ═══

// ═══ ج51: أيقونات متجهة موحدة (Material Design) — بلا أي إيموجي في الواجهة إطلاقاً ═══
const SVGI = {
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  live: 'M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z',
  movie: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z',
  series: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12V7l5.5 3.5L12 14z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  starO: 'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  mosque: 'M12 4c-1.2 0-2.3.6-3 1.5L7.1 4.6c-.5-.2-1.1.2-1.1.8V8H4v11h16V8h-2V5.4c0-.6-.6-1-1.1-.8L15 5.5C14.3 4.6 13.2 4 12 4zm-4 13H7v-4h1v4zm3 0h-1v-4h1v4zm3 0h-1v-4h1v4zm3 0h-1v-4h1v4z',
  power: 'M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z',
  play: 'M8 5v14l11-7z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  chevL: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  chevR: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 11H11V7h1.5v4.5l3.9 2.3-.75 1.25-4.15-2.55z',
  tv: 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z',
  pc: 'M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  key: 'M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
  phone: 'M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z',
  link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  down: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  x: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  doc: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  cal: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
  calk: 'M22 3h-4l-4 5-2-2.5L6 3H2l7 9-7 9h4l4.5-6L13 17.5 18 21h4l-7-9 7-9z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  save: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z',
  wifi: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z',
  wave: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  folder: 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  tag: 'M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z',
  dots: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  refresh: 'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  full: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
  mute: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'
};
function ic(n, sz) {
  return '<svg class="ic" data-ic="' + n + '" width="' + (sz || 16) + '" height="' + (sz || 16) + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + (SVGI[n] || '') + '"/></svg>';
}

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
    // v1.0: زر اللصق المباشر (مفوَّض — يغطي كل الحقول حتى المولّدة ديناميكياً)
    document.addEventListener('click', e => {
      const b = e.target && e.target.closest ? e.target.closest('.paste-btn[data-paste]') : null;
      if (b) this.pasteTo(b.dataset.paste, b);
    });
    this.clockTick(); setInterval(() => this.clockTick(), 1000);
    // v1.0.8: ريموت الهاتف — استقبال الأوامر + تشغيل الخادم إن كان مفعّلاً + دفع الحالة كل ثانيتين
    try {
      if (window.latchi && window.latchi.onRemoteKey) window.latchi.onRemoteKey(cmd => this.remoteApplyKey(cmd));
      // (طلب العميل): الخادم يعمل تلقائياً منذ الإقلاع — بلا رمز — يُعطَّل فقط من الإعدادات
      if (localStorage.getItem('remote_on') !== '0') this.remoteServerStart(true);
      setInterval(() => this.remotePush(), 2000);
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1400)); // سبلاش قصير (سرعة الإقلاع أهم)
    const saved = localStorage.getItem('source_url');
    if (saved) {
      this.show('verify', true);
      document.getElementById('verifyMsg').textContent = 'استئناف الحساب المحفوظ...';
      this.showChecking();                    // v1.0.1: فن «جاري التحقق» أثناء الاستئناف
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
    // v1.0.3: الساعة تمشي بالثواني كيما التلفاز
    if (el) el.textContent = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.expTick();
    this.updatePrayerChip();     // v1.0.6: الصلاة القادمة (حساب محلي خفيف من الكاش)
  },

  // ═══ v1.0.6: مواقيت الصلاة بالموقع الجغرافي (نفس منطق تلفاز/هاتف أندرويد) ═══
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
    chip.title = 'مواقيت الصلاة — ' + (c.region || '') + (best < Infinity ? ' · الصلاة القادمة بعد ' + best + ' دقيقة' : '');
    chip.classList.remove('hidden');
  },

  // v1.0.3: سطر تاريخ انتهاء الصلاحية تحت الساعة — الحقيقي من الكود، أو المُدخل يدوياً مع رابط M3U
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
    if (days < 0) return { text: 'منتهية — ' + dstr, cls: 'red' };
    if (days <= 7) return { text: 'تنتهي ' + dstr + ' · باقي ' + days + ' يوم', cls: 'orange' };
    return { text: 'تنتهي ' + dstr + ' · باقي ' + days + ' يوم', cls: 'green' };
  },

  // ═══ الشاشات ═══
  // ═══ v1.0.8: ريموت الهاتف ═══
  async remoteServerStart(silent) {
    try {
      // (طلب العميل): بلا رمز إطلاقاً — أي هاتف على نفس الواي فاي ينقر الحاسوب فيتصل مباشرة
      this._remoteInfo = await window.latchi.remoteStart({ port: 37777, pin: '' });
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
        const k = String(cmd.key);
        // ج50: كيبورد الريموت — الحرف القابل للطباعة يُدرج مباشرة في الحقل المركّز (البحث...)
        // (حدث الكيبورد الاصطناعي وحده لا يكتب في الحقول — الإدراج الصريح + حدث input يشغّل البحث فوراً)
        const ae = (document.activeElement && document.activeElement.tagName) ? document.activeElement : null;
        const isField = !!(ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA') && !ae.readOnly && !ae.disabled);
        if (isField && k.length === 1) {
          const st = (ae.selectionStart != null) ? ae.selectionStart : ae.value.length;
          const en = (ae.selectionEnd != null) ? ae.selectionEnd : st;
          ae.value = ae.value.slice(0, st) + k + ae.value.slice(en);
          try { ae.setSelectionRange(st + 1, st + 1); } catch (e) {}
          ae.dispatchEvent(new Event('input', { bubbles: true }));
          this.remotePush();
          return;
        }
        if (isField && k === 'Backspace') {
          const st = (ae.selectionStart != null) ? ae.selectionStart : ae.value.length;
          const en = (ae.selectionEnd != null) ? ae.selectionEnd : st;
          if (en > st) { ae.value = ae.value.slice(0, st) + ae.value.slice(en); try { ae.setSelectionRange(st, st); } catch (e) {} }
          else if (st > 0) { ae.value = ae.value.slice(0, st - 1) + ae.value.slice(st); try { ae.setSelectionRange(st - 1, st - 1); } catch (e) {} }
          ae.dispatchEvent(new Event('input', { bubbles: true }));
          this.remotePush();
          return;
        }
        // نفس حدث الكيبورد — كل منطق التنقل/المشغل يعمل كما هو (ج40: الكيبورد = الريموت)
        // ج50: يُرسل على العنصر المركّز إن كان حقلاً (كي تعمل مستمعات Enter الخاصة بالحقول) وإلا على document
        const tgt = isField ? ae : document;
        tgt.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
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
      } else if (cmd.action === 'mouse') {
        // ج48 (لوحة اللمس في الريموت): تحريك/نقر/تمرير حقيقي داخل التطبيق
        this._remoteMouse(cmd);
      } else if (cmd.action === 'search') {
        // ج51: الريموت يطلب فتح البحث الشامل على الحاسوب
        this.show('player', true);
        this.gsearchOpen2();
        this.remotePush();
      } else if (cmd.action === 'play' && cmd.item) {
        // ج51: الريموت شغّل نتيجة بحث — تبديل فوري لما يعرضه الحاسوب
        this.remotePlay(cmd.item);
        this.remotePush();
      }
    } catch (e) {}
  },

  // ═══ ج48: مؤشر افتراضي من لوحة لمس الهاتف — حركة + نقر + تمرير حقيقي ═══
  _mouseEnsure() {
    if (!this._mcur) {
      const d = document.createElement('div');
      d.id = 'remoteCursor';
      if (document.body && document.body.appendChild) document.body.appendChild(d);
      this._mcur = d;
      this._mx = Math.round((window.innerWidth || 1280) / 2);
      this._my = Math.round((window.innerHeight || 720) / 2);
    }
    return this._mcur;
  },
  _remoteMouse(cmd) {
    try {
      this._mouseEnsure();
      if (typeof cmd.dx === 'number' || typeof cmd.dy === 'number') {
        const sp = 1.7;                                   // حساسية لوحة اللمس
        this._mx = Math.min((window.innerWidth || 1280) - 1, Math.max(0, this._mx + Math.round((cmd.dx || 0) * sp)));
        this._my = Math.min((window.innerHeight || 720) - 1, Math.max(0, this._my + Math.round((cmd.dy || 0) * sp)));
      }
      // أظهر حلقة المؤشر ثم أخفها بعد ثبات قصير
      const c = this._mcur;
      try { c.style.left = this._mx + 'px'; c.style.top = this._my + 'px'; c.classList.add('on'); } catch (e) {}
      clearTimeout(this._mcurT);
      this._mcurT = setTimeout(() => { try { c.classList.remove('on'); } catch (e) {} }, 1600);
      const el = (document.elementFromPoint ? document.elementFromPoint(this._mx, this._my) : null);
      if (el) {
        // التحويم = فوكيس (ج41) — أقرب عنصر تفاعلي تحت المؤشر
        const focusable = el.closest ? el.closest('button, input, textarea, [onclick], .acc-card, .tcard, .pcard, .pcat, .pitem, .chan, .ep, .gd-ep, .vtab, .cat-chip, [tabindex]:not([tabindex="-1"])') : null;
        if (focusable && focusable.focus) { try { focusable.focus(); } catch (e) {} }
        try { el.dispatchEvent(new MouseEvent('mousemove', { clientX: this._mx, clientY: this._my, bubbles: true })); } catch (e) {}
      }
      if (cmd.click && el) {
        try { el.dispatchEvent(new MouseEvent('mousedown', { clientX: this._mx, clientY: this._my, bubbles: true })); } catch (e) {}
        try { el.dispatchEvent(new MouseEvent('mouseup', { clientX: this._mx, clientY: this._my, bubbles: true })); } catch (e) {}
        if (el.click) { try { el.click(); } catch (e) {} }
        this.remotePush();
      }
      if (cmd.wheel && el) {
        // تمرير حقيقي لأقرب حاوية قابلة للتمرير تحت المؤشر
        let n = el;
        while (n && n !== document.body) {
          if (n.scrollHeight > n.clientHeight + 4) { try { n.scrollBy(0, cmd.wheel * 140); } catch (e) {} break; }
          n = n.parentElement;
        }
      }
    } catch (e) {}
  },

  show(name, resetStack = false) {
    // v1.0.7: مغادرة شاشة القائمة (لغير المشغل) = إيقاف المشغل المصغر
    if (this.screen === 'list' && name !== 'list' && name !== 'player') this.miniStop();
    // v1.0.0: مغادرة شاشة المشغل (لغيرها) أثناء التكبير السلس = أعد العنصر لمكانه بهدوء
    if (this.screen === 'player' && name !== 'player' && typeof Player !== 'undefined' && Player._miniFs) {
      try { Player.exitMiniFs(); } catch (e) {}
      this._miniFsReturn = false;
    }
    // v1.0.4: احفظ موضع الفوكيز عند مغادرة الشاشة — الرجوع من التفاصيل يرجعك لنفس البوستر بالضبط
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
    this.remotePush();     // v1.0.8
  },

  push(name) {
    this.navStack.push(this.screen);
    this.show(name);
  },
  back() {
    // v1.1.1: كان close() يستدعي back() الذي يستدعي close() → انفجار المكدس والشاشة تعلق
    if (this.screen === 'player') {
      Player.hideCb = null;              // أوقف الاستدعاء العكسي قبل التنظيف
      Player.close();
      const prev = this.navStack.pop();
      if (prev) this.show(prev); else this.show('home', true);
      // v1.0.0: خروج ملء الشاشة → عودة للواجهة المقسمة.
      // من التكبير السلس: البث نفسه مستمر في المصغر (لا إعادة تحميل إطلاقاً) —
      // غير ذلك: المصغر يستأنف نفس العنصر (سلوك v1.0.7).
      if (prev === 'list' && this._miniItem && this.listCtx && !this.listCtx.loading) {
        if (this._miniFsReturn) this._miniFsReturn = false;
        else this.miniPlay(this._miniItem);
      }
      return;
    }
    const prev = this.navStack.pop();
    if (prev) this.show(prev); else this.show('home', true);
  },

  // ═══ v1.0.1: غطاء «جاري التحقق من الاشتراك» ═══
  showChecking() { const o = document.getElementById('checkingOv'); if (o) o.classList.remove('hidden'); },
  hideChecking() { const o = document.getElementById('checkingOv'); if (o) o.classList.add('hidden'); },

  // ═══ v1.0.1: شاشة الترحيب «مرحبا بك في عائلة لاتشي» بعد كل دخول ناجح ═══
  showWelcome() {
    clearTimeout(this._welcomeTimer);
    this.show('welcome', true);
    this._welcomeTimer = setTimeout(() => { if (this.screen === 'welcome') this.show('home', true); }, 2600);
  },

  // ═══ v1.0.7: حذف جميع الحسابات — إعادة ضبط المصنع (تأكيد بالأسهم كيما الخروج) ═══
  showWipeDlg() {
    const d = document.getElementById('exitDlg');
    if (!d) return;
    // نعيد استعمال نافذة التأكيد بنص الحذف
    const q = d.querySelector('.exit-q'), ok = document.getElementById('exitOk');
    if (q) q.textContent = 'حذف جميع الحسابات والمفضلة نهائياً؟';
    if (ok) { ok.classList.add('exit-ok'); ok.textContent = 'نعم، احذف كل شيء'; }
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
    this.hideExitDlg();   // ج50: إخفاء نافذة التأكيد بعد الحذف — كانت تبقى معلّقة فوق شاشة الدخول
    const v = document.getElementById('verifyMsg');
    if (v) { v.className = 'verify-msg'; v.textContent = 'تم مسح جميع البيانات — أدخل كوداً أو رابطاً للبدء من جديد'; }
  },

  // ═══ v1.0.2: نافذة تأكيد الخروج «كيما التلفاز» — أسهم + Enter ═══
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
      if (ok) ok.textContent = 'نعم، خروج';
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
    // v1.0.4: الرجوع لشاشة سابقة؟ الفوكيز يرجع لنفس العنصر المحفوظ (إن كان ما يزال في الصفحة)
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
    const f = root.querySelector('.focused') || root.querySelector('.tcard, .vtab, .gold-btn, .pcat, .pitem, .chan, .pcard, .ep, .acc-card, .back-btn, .tv-input, .p-btn, .mini-wrap, .sp-season, .sp-ep');
    if (f) f.classList.add('focused');
  },

  // ═══ التحقق (مشترك بين شاشة الدخول ومركز الحسابات) ═══
  async applyCode(code, msgEl) {
    msgEl.className = 'verify-msg';
    if (!code) { msgEl.textContent = 'أدخل الكود أولاً'; msgEl.classList.add('err'); return false; }
    msgEl.textContent = 'جارٍ التحقق...';
    this.showChecking();                      // v1.0.1
    try {
      const deviceId = await window.latchi.deviceId();
      const res = await LatchiAPI.verifyCode(code, deviceId);
      if (!res.ok) { msgEl.textContent =  res.message; msgEl.classList.add('err'); return false; }
      if (!res.url) { msgEl.textContent = 'لا توجد قائمة مرتبطة بهذا الكود'; msgEl.classList.add('err'); return false; }
      msgEl.textContent = res.name + ' — فتح القائمة...';
      msgEl.classList.add('ok');
      this.user = { name: res.name, expires: res.expires, code };
      this.rememberAccount('code', res.name + ' (' + code + ')', res.url);
      await this.loadSource(res.url, false, res.url, { welcome: true });
      return true;
    } catch (e) {
      msgEl.textContent = 'خطأ في الاتصال: ' + e.message; msgEl.classList.add('err'); return false;
    } finally { this.hideChecking(); }
  },

  async applyM3u(url, msgEl, expDate) {
    msgEl.className = 'verify-msg';
    if (!/^https?:\/\//.test(url)) { msgEl.textContent = 'أدخل رابط M3U صحيحاً يبدأ بـ http'; msgEl.classList.add('err'); return false; }
    msgEl.textContent = 'تحميل القائمة (المرة الأولى فقط — ثم تبقى محفوظة)...';
    // v1.0.3: تاريخ الصلاحية المُدخل يدوياً مع الرابط (يظهر تحت الساعة وفي مركز الحسابات)
    const expTxt = expDate ? new Date(expDate + 'T12:00:00').toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    this.user = { name: 'M3U مباشر', expires: expTxt, code: '', expDate: expDate || '' };
    this.showChecking();                      // v1.0.1
    try {
      await this.loadSource(url, false, url, { welcome: true });
      let host = url; try { host = new URL(url).hostname; } catch (e) {}
      this.rememberAccount('m3u', 'M3U — ' + host, url, expDate || '');
      return true;
    } catch (e) {
      msgEl.textContent =  e.message; msgEl.classList.add('err'); return false;
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
      // ج53: فهرسة البحث الشامل تبدأ فوراً بالخلفية بعد تحميل المصدر —
      // حتى يكون بحث الريموت جاهزاً (مهلة الهاتف قصيرة ولا تحتمل فهرسة من الصفر)
      setTimeout(() => { try { this._gsIndex(); } catch (e) {} }, 2500);
      // v1.0.1: «مرحبا بك في عائلة لاتشي» بعد الدخول — ثم الرئيسية
      if (opts.welcome) this.showWelcome(); else this.show('home', true);
    } catch (e) {
      if (!silent) throw e;
      localStorage.removeItem('source_url');
      this.show('verify', true);
    }
  },

  // ═══ الرئيسية ═══
  buildHome() {
    // v1.0.6: اسم المستخدم الحقيقي من الخادم في الهيدر
    const uc = document.getElementById('userChip');
    if (uc) {
      const un = (this.src && this.src.account && this.src.account.user_info && this.src.account.user_info.username)
        || (this.user && this.user.name) || '';
      uc.innerHTML = un ? (ic('user', 15) + ' ' + un) : ic('user', 15);
      uc.title = un || '';
    }
    const s = this.src ? LatchiAPI.stats(this.src) : { live: 0, movies: 0, series: 0, unit: 'فئة' };
    const u = s.unit || '';
    // v1.0.2: Royal Grid — نفس ترتيب تلفاز LATCHI (4 فوق / 4 تحت)
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
      // v1.0.2: صورة خالصة 100% كتلفاز LATCHI (الفن يحمل الأيقونة والعنوان) — بلا أي طبقة نص
      d.title = `${c.t} — ${c.c}`;
      d.innerHTML = `<img class="tcard-img" src="../assets/${c.img}.webp" alt="${c.t}" onerror="this.style.display='none'">`;
      d.onclick = () => c.go();
      el.appendChild(d);
    });
  },

  // ═══ v1.0: خلفيات الرئيسية المتغيرة (فن التلفاز — 10 خلفيات، تبديل ناعم كل 25ث) ═══
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

  // ═══ v1.0: اللصق من الحافظة بضغطة زر (بلا Ctrl+V) ═══
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

  // ═══ v1.0.7: المشغل المصغر (العمود الثالث) — يشتغل فور اختيار العنصر ═══
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
  // v1.0.0 (طلب العميل): التكبير من المصغر = نفس البث يستمر مباشرة — بلا أي إعادة تحميل.
  // ننقل نفس عنصر الفيديو إلى شاشة المشغل (البث لم يتوقف) وكل أزرار المشغل تعمل عليه.
  miniFull() {
    const it = this._miniItem;
    if (!it) return;
    if (this.screen !== 'player') this.push('player');
    Player.hideCb = () => App.back();
    Player.takeOver(it);
  },

  // يهدم بث المصغر تماماً (دون مساس _miniItem) — عند تبديل القناة من وضع التكبير السلس
  miniStopHard() {
    if (this._miniHls) { try { this._miniHls.destroy(); } catch (e) {} this._miniHls = null; }
    const v = document.getElementById('miniVid');
    if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} }
    const l = document.getElementById('miniLoad'); if (l) l.classList.add('hidden');
  },
  // اختيار عنصر من العمود الأوسط: تشغيل فوري في المصغر + تفاصيل في العمود الثالث
  selectItem(it) {
    this.listCtx.selected = it;
    const mw = document.getElementById('miniWrap');
    // ج53: المسلسل = لوحة البوستر والمواسم والحلقات في العمود الثالث (بلا مصغر) — طلب العميل
    if (it && it.type === 'series') {
      this.miniStop(); this._miniItem = null;
      if (mw) mw.style.display = 'none';
      this.renderSeriesPanel(it);
    } else {
      if (mw) mw.style.display = '';
      this.renderMiniInfo();
      this.miniPlay(it);
    }
    // حدّث إبراز الصف المختار
    const items = document.getElementById('paneItems');
    if (items) [...(items.children || [])].forEach(el => el.classList && el.classList.toggle('sel', el.dataset && el.dataset.id === (it && it.id)));
  },
  renderMiniInfo() {
    const el = document.getElementById('miniInfo');
    if (!el) return;
    const it = this.listCtx && this.listCtx.selected;
    if (!it) { el.innerHTML = '<div class="mini-empty">اختر قناة أو فيلماً من القائمة ليعمل هنا فوراً</div>'; return; }
    const isX = this.src && this.src.type === 'xtream';
    const live = it.type === 'live', movie = it.type === 'movie', series = it.type === 'series';
    const poster = it.logo ? `<img class="mini-poster" src="${esc(it.logo)}" onerror="this.style.display='none'">` : '';
    el.innerHTML = `
      <div class="mini-head">${poster}
        <div class="mini-meta">
          <div class="mini-name">${esc(it.name || '')}</div>
          <div class="mini-sub">${live ? '● بث مباشر' : series ? ic('series', 13) + ' مسلسل' : ic('movie', 13) + ' فيلم'} ${it.group ? ' · ' + esc(it.group) : ''}</div>
          <div class="mini-epg hidden" id="miniEpg"></div>
        </div>
      </div>
      ${series ? '<button class="gold-btn" id="miniEpsBtn" style="width:100%">' + ic('series', 14) + ' عرض المواسم والحلقات</button>' : ''}
      <div class="mini-desc" id="miniDesc">${live || series ? '' : '<span class="mini-desc-wait">…</span>'}</div>
      <div class="mini-btns">
        ${!series ? '<button class="p-btn mini-go" id="miniGoBtn">' + ic('play', 13) + ' شاهد بملء الشاشة</button>' : ''}
        <button class="p-btn" id="miniFavBtn">${this.isFav(it) ? ic('star', 13) + ' في المفضلة' : ic('starO', 13) + ' أضف للمفضلة'}</button>
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
          e2.innerHTML = ic('tv', 12) + ' ' + esc(epg.title) + (epg.time ? ' · ' + esc(epg.time) : '');
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

  // ═══ ج53: لوحة المسلسل في العمود الثالث — بوستر + مواسم مرقمة + حلقات الموسم المحدد فقط ═══
  // (طلب العميل: الفئات يميناً | المسلسلات وسطاً | البوستر والمواسم والحلقات يساراً — بلا مشغل مصغر)
  async renderSeriesPanel(it) {
    const el = document.getElementById('miniInfo');
    if (!el || !it || it.type !== 'series') return;
    const isX = this.src && this.src.type === 'xtream';
    el.innerHTML = `
      <div class="sp-head">
        ${it.logo ? `<img class="sp-poster" src="${esc(it.logo)}" onerror="this.style.display='none'">` : ''}
        <div class="sp-meta">
          <div class="sp-name">${esc(it.name || '')}</div>
          <div class="sp-sub">${ic('series', 13)} مسلسل${it.group ? ' · ' + esc(it.group) : ''}${it.rating ? ' · ' + ic('star', 11) + ' ' + esc(String(it.rating)) : ''}</div>
        </div>
      </div>
      <button class="p-btn" id="spFavBtn" style="width:100%">${this.isFav(it) ? ic('star', 13) + ' في المفضلة' : ic('starO', 13) + ' أضف للمفضلة'}</button>
      <div class="sp-loading" id="spLoading">تحميل المواسم والحلقات...</div>
      <div class="sp-body" id="spBody"></div>`;
    const fv = document.getElementById('spFavBtn');
    if (fv) fv.onclick = () => {
      this.toggleFav(it);
      fv.innerHTML = this.isFav(it) ? ic('star', 13) + ' في المفضلة' : ic('starO', 13) + ' أضف للمفضلة';
    };
    // تحميل المواسم والحلقات (نفس مصدر شاشة التفاصيل — كاش القرص)
    let seasons = [];
    if (it.seriesId && isX) {
      try {
        const d = await LatchiAPI.loadSeriesDetails(it.seriesId);
        const info = (d && d.info) || {};
        seasons = Object.entries((d && d.episodes) || {}).map(([sNum, eps]) => ({
          num: sNum,
          episodes: Object.values(eps).map(e => ({
            name: e.title || ('الحلقة ' + e.episode_num), episodeNum: e.episode_num,
            url: `${LatchiAPI._src.server}/series/${LatchiAPI._src.username}/${LatchiAPI._src.password}/${e.id}.${(e.container_extension || 'mp4')}`,
            dur: (e.info && e.info.duration) || ''
          }))
        })).sort((a, b) => (+a.num) - (+b.num));
        it.plot = it.plot || info.plot || '';
      } catch (e) {}
    }
    // تغيّر الاختيار أثناء التحميل؟ اخرج بصمت
    if (!(this.listCtx && this.listCtx.selected === it)) return;
    const loading = document.getElementById('spLoading');
    if (loading) loading.remove();
    const body = document.getElementById('spBody');
    if (!body) return;
    if (!seasons.length) {
      // m3u أو بلا مواسم: تشغيل مباشر كالسلوك القديم
      body.innerHTML = `
        ${it.plot ? `<div class="sp-desc">${esc(it.plot.slice(0, 300))}</div>` : ''}
        <button class="gold-btn" id="spPlay" style="width:100%;margin-top:8px">${ic('play', 14)} شاهد الآن بملء الشاشة</button>`;
      const pb = document.getElementById('spPlay');
      if (pb) pb.onclick = () => this.startPlay(it);
      return;
    }
    let curSeason = 0;
    const allEps = seasons.flatMap(s => s.episodes.map(e => Object.assign({ season: s.num }, e)));
    this._zapList = allEps.map((e, i) => ({ id: it.id + '_E' + i, name: e.name, url: e.url, type: 'movie', logo: it.logo, group: it.name }));
    const renderSeasons = () => {
      const s = seasons[curSeason];
      const firstIdx = allEps.findIndex(e => e.season === s.num);
      body.innerHTML = `
        ${it.plot ? `<div class="sp-desc">${esc(it.plot.slice(0, 260))}</div>` : ''}
        <div class="sp-seasons-lbl">${ic('series', 13)} المواسم</div>
        <div class="sp-seasons">${seasons.map((ss, i) => `
          <div class="pcat sp-season${i === curSeason ? ' active' : ''}" data-i="${i}">
            ${ic('series', 12)} الموسم ${esc(String(ss.num))} <span class="sp-cnt">(${ss.episodes.length})</span>
          </div>`).join('')}
        </div>
        <div class="sp-season-title">${ic('play', 12)} حلقات الموسم ${esc(String(s.num))} <span class="sp-cnt">(${s.episodes.length} حلقة)</span></div>
        <div class="sp-eps">${s.episodes.map((e, i) => `
          <div class="gd-ep sp-ep" data-url="${esc(e.url)}" data-name="${esc(e.name)}" data-zi="${firstIdx + i}">
            <span class="n">${esc(String(e.episodeNum || (i + 1)))}</span><span class="t">${esc(e.name)}</span><span class="d">${esc(e.dur || '')}</span>
          </div>`).join('')}
        </div>`;
      body.querySelectorAll('.sp-season').forEach(el2 => {
        el2.onclick = () => { curSeason = +el2.dataset.i; renderSeasons(); };
      });
      body.querySelectorAll('.sp-ep').forEach(el2 => {
        el2.onclick = () => {
          const zi = parseInt(el2.dataset.zi || '0', 10);
          const epIt = (this._zapList && this._zapList[zi]) || { id: it.id + '_' + el2.dataset.name, name: el2.dataset.name, url: el2.dataset.url, type: 'movie', logo: it.logo, group: it.name };
          this.startPlay(epIt);
        };
      });
    };
    renderSeasons();
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
    // ═══ v1.0.7: الواجهة الثلاثية — فئات (يمين) | عناصر (وسط) | مشغل مصغر + تفاصيل (يسار) ═══
    // ج53: قسم المسلسلات = بلا مشغل مصغر — العمود الثالث للبوستر والمواسم والحلقات (طلب العميل)
    const isSeriesCtx = !!(this.listCtx && this.listCtx.kind === 'series' && (this.listCtx.selected ? this.listCtx.selected.type === 'series' : true));
    const mw = document.getElementById('miniWrap');
    if (mw) mw.style.display = isSeriesCtx ? 'none' : '';
    if (isSeriesCtx && !(this.listCtx.selected && this.listCtx.selected.type === 'series' && document.getElementById('spBody'))) {
      const mi = document.getElementById('miniInfo');
      if (mi) mi.innerHTML = '<div class="mini-empty">' + ic('series', 14) + ' اختر مسلسلاً من الوسط — يظهر بوسته ومواسمه وحلقاته هنا</div>';
    }
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
      mkCat(ic('tag', 12) + ' الكل', 'الكل', () => { this.listCtx.cat = 'الكل'; this.buildList(); });
      ranked.forEach(g => mkCat(g, g, () => { this.listCtx.cat = g; this.buildList(); }));
    } else {
      mkCat(ic('tag', 12) + ' ' + (ctx.title || 'القائمة'), 'الكل', null);
    }
    // ── العمود 2: العناصر (40%) ──
    const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    let shown = Array.isArray(items) ? items.filter(i =>
      (ctx.cat === 'الكل' || !ctx.cat || (i.group || 'عام') === ctx.cat) &&
      (!q || (i.name || '').toLowerCase().includes(q))) : [];
    this._zapList = shown;   // قائمة التنقل بالريموت داخل المشغل
    paneItems.innerHTML = '';
    if (ctx.loading) {
      paneItems.innerHTML = '<div class="load-hint">جارٍ فتح الفئة... <span class="hint-sub">(المرة الأولى فقط — بعدها تبقى محفوظة)</span></div>';
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
        ${live ? '<span class="rec-dot"></span>' : `<span class="pi-play">${ic('play', 10)}</span>`}`;
      d.onclick = () => self.selectItem(it);
      return d;
    };
    // رسم على دفعات (حماية الحاسوب الضعيف مهما طالت القائمة)
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
    const fav = this.isFav(it) ? '<span class="fav-star">' + ic('star', 12) + '</span>' : '';
    const prog = it._resume ? `<div style="text-align:center;color:#7CE38B;font-size:10.5px;margin-top:2px">${ic('play', 9)} ${fmt(it._resume)} / ${fmt(it._dur)}</div>` : '';
    d.innerHTML = `${fav}<img loading="lazy" decoding="async" src="${it.logo || ''}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22190%22%3E%3Crect fill=%22%230A0E22%22 width=%22320%22 height=%22190%22%3E%3Ctext x=%22160%22 y=%22110%22 fill=%22%23D9A94E%22 font-size=%2252%22 text-anchor=%22middle%22%3E%3C/text%3E%3C/svg%3E'">
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
      <div class="now">${live ? '<span class="rec-dot">●</span> مباشر' : ic('movie', 13)}</div>`;
    d.onclick = () => {
      if (it.type === 'series') this.openDetails(it);
      else this.startPlay(it);
    };
    return d;
  },

  // ═══ التفاصيل ═══
  async openDetails(it) {
    const body = document.getElementById('detailsBody');
    body.innerHTML = '<div class="load-hint">تحميل التفاصيل...</div>';
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
    const btnFav = this.isFav(it) ? ic('star', 13) + ' في المفضلة' : ic('starO', 13) + ' إضافة للمفضلة';
    // v1.1.2: قائمة التنقل بين الحلقات بالريموت — نفس معرفات النقر حرفياً (حفظ متابعة المشاهدة)
    if (it.type === 'series') this._zapList = seasons.flatMap(s => s.episodes)
      .map((e, i) => ({ id: 'S' + it.seriesId + '_' + i, name: e.name, url: e.url, type: 'movie', logo: it.logo, group: it.name }));
    body.innerHTML = `
      <div class="d-poster"><img src="${it.logo || ''}" onerror="this.style.display='none'"></div>
      <div class="d-info">
        <div class="d-title">${esc(it.name)}</div>
        <div class="d-meta">${esc(it.group || '')}${it.rating ? ' • ' + ic('star', 11) + ' ' + esc(String(it.rating)) : ''}${this.user?.expires ? ' • صالح حتى: ' + esc(this.user.expires) : ''}</div>
        <div class="d-desc">${esc((it.plot || '').slice(0, 600) || 'لا يوجد وصف متاح لهذا المحتوى.')}</div>
        <div class="d-actions">
          ${it.type === 'series' ? '' : `<button class="gold-btn play-btn" id="dPlay">${ic('play', 14)} تشغيل</button>`}
          <button class="p-btn" id="dFav" style="font-size:15px;padding:13px 24px">${btnFav}</button>
        </div>
        ${seasons.map(s => `
          <div class="seasons">
            <div class="season-title">${ic('series', 13)} الموسم ${esc(String(s.num))} <span style="color:#8A90B8;font-size:13px">(${s.episodes.length} حلقة)</span></div>
            <div class="eps-lane">
              ${s.episodes.map(e => `<div class="ep" data-url="${esc(e.url)}" data-name="${esc(e.name)}">
                <div class="en">${ic('play', 10)} ${esc(String(e.episodeNum || ''))}</div>
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
      document.getElementById('dFav').innerHTML = this.isFav(it) ? ic('star', 13) + ' في المفضلة' : ic('starO', 13) + ' إضافة للمفضلة';
    };
    body.querySelectorAll('.ep').forEach((el, i) => {
      el.onclick = () => this.startPlay(this._zapList ? this._zapList[i] : { id: 'S' + it.seriesId + '_' + i, name: el.dataset.name, url: el.dataset.url, type: 'movie', logo: it.logo, group: it.name });
    });
    this.focusFirst('details');
  },

  // ═══ ج51: البحث الشامل — قنوات وأفلام ومسلسلات في كل المحتوى دفعة واحدة ═══
// زر في الشريط العلوي + متاح للريموت (remoteSearch/remotePlay) — النتيجة تشتغل فوراً بملء الشاشة.
gsearchOpen() { return !!(this._gs && this._gs.root && this._gs.root.classList.contains('on')); },
gsearchToggle() { this.gsearchOpen() ? this.gsearchClose() : this.gsearchOpen2(); },
gsearchOpen2() {
  if (!this.src) return;
  if (!this._gs) this._gsBuild();
  const g = this._gs;
  g.root.classList.remove('hidden');
  g.root.classList.add('on');
  g.input.value = '';
  g.body.innerHTML = '<div class="gsearch-hint">اكتب اسم قناة أو فيلم أو مسلسل — النتائج من كل المحتوى</div>';
  try { g.input.focus(); } catch (e) {}
},
gsearchClose() {
  const g = this._gs; if (!g) return;
  g.root.classList.add('hidden');
  g.root.classList.remove('on');
  clearTimeout(g.debounce);
  try { g.input.blur(); } catch (e) {}
  try { g.root.querySelectorAll('.focused').forEach(el => el.classList.remove('focused')); } catch (e) {}
},
_gsBuild() {
  const mk = (cls, parent, html) => {
    const d = document.createElement('div');
    d.className = cls;
    if (html != null) d.innerHTML = html;
    parent.appendChild(d);
    return d;
  };
  const root = mk('gsearch-ov hidden', document.getElementById('player'));   // كيما دليل ج50: داخل شاشة المشغل
  const panel = mk('gsearch-panel', root);
  const bar = mk('gsearch-bar', panel);
  const gl = mk('gl', bar, ic('search', 22));
  const input = document.createElement('input');
  input.className = 'gsearch-input';
  input.placeholder = 'بحث شامل — قناة، فيلم، مسلسل…';
  input.type = 'text';
  input.autocomplete = 'off';
  bar.appendChild(input);
  const close = document.createElement('button');
  close.className = 'gsearch-close ic-btn';
  close.innerHTML = ic('x', 14) + ' إغلاق';
  bar.appendChild(close);
  const body = mk('gsearch-body', panel);
  const self = this;
  const g = { root, panel, input, body, close, debounce: null, lastQ: '' };
  root.onclick = (e) => { if (e && e.target === root) self.gsearchClose(); };
  close.onclick = () => self.gsearchClose();
  input.addEventListener('input', () => {
    clearTimeout(g.debounce);
    const q = (input.value || '').trim();
    if (!q) { body.innerHTML = '<div class="gsearch-hint">اكتب اسم قناة أو فيلم أو مسلسل — النتائج من كل المحتوى</div>'; return; }
    g.debounce = setTimeout(async () => {
      if (q.length >= 2) {
        const res = await self.globalSearch(q);
        if ((input.value || '').trim() !== q) return;   // تغيّر الاستعلام أثناء البحث
        self._gsRender(res, q);
      }
    }, 260);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { self.gsearchClose(); e.preventDefault(); return; }
    if (e.key === 'Enter') {
      const f = body.querySelector('.focused') || (body.querySelector('.pitem'));
      if (f && f.click) f.click();
      e.preventDefault();
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      self._gsNav(e.key === 'ArrowDown' ? 1 : -1);
      e.preventDefault();
    }
  });
  this._gs = g;
},
_gsNav(dir) {
  const g = this._gs; if (!g) return;
  let rows = [];
  try { rows = [...g.body.querySelectorAll('.pitem')].filter(el => el.offsetParent); } catch (e) { return; }
  if (!rows.length) return;
  let idx = rows.findIndex(r => r.classList.contains('focused'));
  rows.forEach(r => r.classList.remove('focused'));
  idx = (idx + dir + rows.length) % rows.length;
  rows[idx].classList.add('focused');
  try { rows[idx].scrollIntoView({ block: 'nearest' }); } catch (e) {}
},
async globalSearch(q, opts) {
  q = String(q || '').trim().toLowerCase();
  if (!q) return [];
  const out = [];
  const push = (arr, type) => {
    for (const it of (arr || [])) {
      const n = String(it.name || '').toLowerCase();
      if (n.includes(q)) out.push({ id: it.id, name: it.name, type: it.type || type, group: it.group || '', logo: it.logo || '', url: it.url || '', seriesId: it.seriesId || '' });
      if (out.length >= 120) return;
    }
  };
  if (this.src.type === 'm3u') {
    push(this.src.live, 'live'); push(this.src.movies, 'movie'); push(this.src.series, 'series');
    return out;
  }
  // Xtream: فهرسة كل الفئات مرة واحدة (كاش قرص دائم) ثم البحث في الذاكرة
  await this._gsIndex();
  push(this._gsIdx && this._gsIdx.items, 'live');
  return out;
},
async _gsIndex() {
  if (this._gsIdx && this._gsIdx.done) return;
  const g = this._gs; const self = this;
  if (this._gsIdx && this._gsIdx.loading) {
    await new Promise(r => { const t = setInterval(() => { if (!self._gsIdx.loading) { clearInterval(t); r(); } }, 150); });
    return;
  }
  this._gsIdx = { loading: true, done: false, items: [] };
  const types = [['live', 'live'], ['movie', 'movie'], ['series', 'series']];
  const kindMap = { live: 'live', movie: 'movie', series: 'series' };
  for (const [t] of types) {
    try {
      const cats = LatchiAPI.orderCategories(this.src.categories[t] || []);
      for (let i = 0; i < cats.length; i++) {
        try {
          const items = await LatchiAPI.getCategoryItems(kindMap[t], cats[i].id, cats[i].name);
          this._gsIdx.items.push(...(items || []).map(x => Object.assign({ type: t === 'movie' ? 'movie' : t }, x)));
        } catch (e) {}
        if (g && this.gsearchOpen()) {
          g.body.innerHTML = '<div class="gsearch-prog">جارٍ فهرسة المحتوى… ' + (i + 1) + '/' + cats.length + '</div>';
        }
      }
    } catch (e) {}
  }
  this._gsIdx.loading = false;
  this._gsIdx.done = true;
},
_gsRender(res, q) {
  const g = this._gs; if (!g) return;
  const body = g.body;
  if (!res || !res.length) {
    body.innerHTML = '<div class="gsearch-hint">لا توجد نتائج مطابقة لـ «' + esc(q) + '»</div>';
    return;
  }
  const groups = { live: [], movie: [], series: [] };
  res.forEach(r => { if (groups[r.type]) groups[r.type].push(r); });
  const LBL = { live: 'بث مباشر', movie: 'أفلام', series: 'مسلسلات' };
  const ICN = { live: 'live', movie: 'movie', series: 'series' };
  let html = '';
  const self = this;
  for (const t of ['live', 'movie', 'series']) {
    if (!groups[t].length) continue;
    html += '<div class="gsearch-sec">' + ic(ICN[t], 15) + ' ' + LBL[t] + ' <span style="color:#8A90B8;font-weight:normal">(' + groups[t].length + ')</span></div>';
    for (const r of groups[t]) {
      html += '<div class="pitem" data-gs="' + esc(JSON.stringify(r)) + '"><img loading="lazy" decoding="async" src="' + esc(r.logo || '') + '" onerror="this.style.visibility=\'hidden\'">' +
        '<div class="pi-t"><div class="pi-n">' + esc(r.name || '') + '</div><div class="pi-g">' + (r.group ? esc(r.group) : '') + '</div></div>' +
        (t === 'live' ? '<span class="rec-dot"></span>' : '<span class="pi-play">' + ic('play', 13) + '</span>') + '</div>';
    }
  }
  body.innerHTML = html;
  body.querySelectorAll('.pitem').forEach(el => {
    el.onclick = () => {
      let it = null;
      try { it = JSON.parse(el.dataset.gs); } catch (e) { return; }
      self.gsearchClose();
      self.gsPlay(it);
    };
  });
},
// تشغيل نتيجة بحث (من الواجهة أو من الريموت): مباشر/فيلم = ملء الشاشة فوراً | مسلسل = شاشة المواسم والحلقات
gsPlay(it) {
  if (!it) return;
  if (it.type === 'series') { this.openDetails(it); return; }
  this.startPlay(it);
},
// ج51: واجهة الريموت — البحث في محتوى هذا الحاسوب والنتائج قابلة للتشغيل عن بعد
async remoteSearch(q) {
  try {
    const res = await this.globalSearch(q);
    return { ok: true, results: (res || []).slice(0, 60).map(r => ({ id: r.id, name: r.name, type: r.type, group: r.group, logo: r.logo })) };
  } catch (e) { return { ok: false, results: [] }; }
},
// ▶ ج51: الريموت يضغط نتيجة → تبديل ما يشغَّل فوراً على الحاسوب
// ج53: المسلسل يفتح قسم المسلسلات مع لوحة البوستر والمواسم والحلقات (بدل شاشة التفاصيل القديمة)
async remotePlay(item) {
  try {
    if (!item || !item.type) return { ok: false };
    const full = this._findItem(item) || item;
    this.gsearchClose();
    if (full.type === 'series') {
      try { await this.openList('series'); } catch (e) {}
      this.selectItem(full);
      return { ok: true, opened: 'series' };
    }
    this.startPlay(full);
    return { ok: true, opened: 'player' };
  } catch (e) { return { ok: false }; }
},
_findItem(ref) {
  const byId = (arr) => (arr || []).find(x => String(x.id) === String(ref.id) || (x.url && ref.url && x.url === ref.url));
  if (this.src && this.src.type === 'm3u') {
    return byId(this.src.live) || byId(this.src.movies) || byId(this.src.series) || ref;
  }
  if (this._gsIdx && this._gsIdx.items) {
    const hit = byId(this._gsIdx.items);
    if (hit) return hit;
  }
  // xtream بلا فهرسة: ابحث بالفهرس السريع (قد يكون فارغاً — نستعمل المرجع كما هو)
  return ref;
},

// ═══ ج50: دليل القنوات والفئات داخل المشغل (زر OK/Enter) — كيما واجهة القائمة تماماً ═══
  // ثلاثة أعمدة: الفئات (يمين) | القنوات/الأفلام/المسلسلات (وسط) | التفاصيل والحلقات (يسار — مكان المشغل المصغر)
  // الحلقة تُفتح مباشرة بملء الشاشة، والقناة تُبدَّل فوراً — والبث يبقى ظاهراً خلف الدليل.
  guideOpen() { return !!(this._guide && this._guide.root && this._guide.root.classList.contains('on')); },
  guideToggle() { this.guideOpen() ? this.guideClose() : this.guideOpen2(); },
  guideOpen2() {
    if (!this.src) return;
    if (!this._guide) this._guideBuild();
    const g = this._guide;
    g.root.classList.remove('hidden');
    g.root.classList.add('on');
    // نفتح النوع المناسب لما يشغَّل الآن
    const t = (Player.current && Player.current.type) || 'live';
    const kind = (t === 'live' || t === 'movie' || t === 'series') ? (t === 'movie' ? 'movies' : t) : 'live';
    this._guideLoadKind(kind);
  },
  guideClose() {
    const g = this._guide; if (!g) return;
    g.root.classList.add('hidden');
    g.root.classList.remove('on');
    try { g.root.querySelectorAll('.focused').forEach(el => el.classList.remove('focused')); } catch (e) {}
  },
  _guideBuild() {
    const mk = (cls, parent, html) => {
      const d = document.createElement('div');
      d.className = cls;
      if (html != null) d.innerHTML = html;
      parent.appendChild(d);
      return d;
    };
    const root = mk('guide-ov hidden', document.getElementById('player'));
    const panel = mk('guide-panel', root);
    const head = mk('guide-head', panel);
    const title = mk('g-title', head, 'دليل القنوات');
    const kinds = mk('g-kinds', head);
    const close = document.createElement('button');
    close.className = 'g-close ic-btn'; close.innerHTML = ic('x', 12) + ' إغلاق';
    head.appendChild(close);
    const body = mk('guide-body', panel);
    const cats = mk('g-cats', body);
    const items = mk('g-items', body);
    const detail = mk('g-detail', body);
    mk('g-hint', panel, '↑↓←→ تنقل &nbsp;•&nbsp; Enter اختيار &nbsp;•&nbsp; Esc إغلاق &nbsp;•&nbsp; الأرقام تعمل كالمعتاد');
    root.onclick = (e) => { if (e && e.target === root) this.guideClose(); };
    close.onclick = () => this.guideClose();
    const self = this;
    const KINDS = [['live', ic('live', 13) + ' بث مباشر'], ['movies', ic('movie', 13) + ' أفلام'], ['series', ic('series', 13) + ' مسلسلات']];
    const kindBtns = {};
    KINDS.forEach(([k, label]) => {
      const b = document.createElement('button');
      b.className = 'g-kind';
      b.innerHTML = label;   // ج51: التسميات تحمل أيقونات SVG
      b.onclick = () => self._guideLoadKind(k);
      kinds.appendChild(b);
      kindBtns[k] = b;
    });
    this._guide = { root, title, kinds: kindBtns, cats, items, detail, kind: null, cat: null, catId: null, list: [], sel: null };
  },
  _guideLoadKind(kind) {
    const g = this._guide; if (!g) return;
    g.kind = kind; g.cat = 'الكل'; g.catId = null; g.list = []; g.sel = null;
    Object.keys(g.kinds).forEach(k => g.kinds[k].classList.toggle('active', k === kind));
    g.title.textContent = kind === 'live' ? 'قائمة القنوات' : kind === 'movies' ? 'الأفلام' : 'المسلسلات';
    g.cats.innerHTML = '';
    const mkCat = (label, val, go) => {
      const c = document.createElement('div');
      c.className = 'pcat' + ((g.cat === val) ? ' active' : '');
      c.textContent = label;
      c.onclick = go;
      g.cats.appendChild(c);
      return c;
    };
    const isX = this.src && this.src.type === 'xtream';
    const kindApi = kind === 'movies' ? 'movie' : kind;
    if (isX) {
      const cats = LatchiAPI.orderCategories(this.src.categories[kindApi] || []);
      cats.forEach(cat => mkCat(cat.name, cat.name, () => this._guideLoadCatX(cat)));
      this._guideLoadCatX(cats[0] || null);
    } else {
      const arr = this.src[kind] || [];
      const groups = [...new Set(arr.map(i => i.group || 'عام'))];
      const ranked = LatchiAPI.orderCategories(groups.map(x => ({ id: x, name: x }))).map(c => c.name);
      mkCat(ic('tag', 12) + ' الكل', 'الكل', () => this._guideM3uFilter('الكل'));
      ranked.forEach(x => mkCat(x, x, () => this._guideM3uFilter(x)));
      // فئة المحتوى الجاري تلقائياً
      const cur = Player.current;
      const curGrp = cur && (cur.group || 'عام');
      const curKind = cur ? (cur.type === 'movie' ? 'movies' : cur.type) : null;
      this._guideM3uFilter((cur && curKind === kind && ranked.includes(curGrp)) ? curGrp : 'الكل');
    }
  },
  _guideM3uFilter(cat) {
    const g = this._guide; if (!g || !this.src || this.src.type !== 'm3u') return;
    g.cat = cat;
    [...g.cats.children].forEach(c => c.classList.toggle('active', c.textContent === cat || (cat === 'الكل' && c.textContent.indexOf('الكل') >= 0)));
    const arr = this.src[g.kind] || [];
    const list = (cat === 'الكل') ? arr : arr.filter(i => (i.group || 'عام') === cat);
    this._guideRenderItems(list);
  },
  async _guideLoadCatX(cat) {
    const g = this._guide; if (!g) return;
    if (!cat) { this._guideRenderItems([]); return; }
    g.cat = cat.name; g.catId = cat.id;
    [...g.cats.children].forEach(c => c.classList.toggle('active', c.textContent === cat.name));
    g.items.innerHTML = '<div class="load-hint">جارٍ فتح الفئة...</div>';
    try {
      const items = await LatchiAPI.getCategoryItems(g.kind === 'movies' ? 'movie' : g.kind, cat.id, cat.name);
      if (this.guideOpen() && g.kind && g.catId === cat.id) this._guideRenderItems(items);
    } catch (e) { if (this.guideOpen()) this._guideRenderItems([]); }
  },
  _guideRenderItems(list) {
    const g = this._guide; if (!g) return;
    g.list = list || [];
    g.items.innerHTML = '';
    if (!g.list.length) { g.items.innerHTML = '<div class="load-hint">لا توجد عناصر في هذه الفئة</div>'; return; }
    const cur = Player.current;
    const frag = document.createDocumentFragment();
    const self = this;
    g.list.forEach(it => {
      const d = document.createElement('div');
      d.className = 'pitem' + ((cur && cur.id === it.id) ? ' sel' : '');
      d.dataset.id = it.id;
      const live = it.type === 'live';
      d.innerHTML = `<img loading="lazy" decoding="async" src="${esc(it.logo || '')}" onerror="this.style.visibility='hidden'">
        <div class="pi-t"><div class="pi-n">${esc(it.name || '')}</div><div class="pi-g">${live ? '● مباشر' : (it.group ? esc(it.group) : '')}</div></div>
        ${live ? '<span class="rec-dot"></span>' : `<span class="pi-play">${ic('play', 10)}</span>`}`;
      d.onclick = () => self._guidePick(it, d);
      frag.appendChild(d);
    });
    g.items.appendChild(frag);
    // فوكس على العنصر الجاري (كيما التلفاز)
    const sel = g.list.findIndex(it => cur && it.id === cur.id);
    if (sel >= 0) {
      try {
        const el = g.items.children[sel];
        if (el && el.classList) { el.classList.add('focused'); try { el.scrollIntoView({ block: 'center' }); } catch (e) {} }
      } catch (e) {}
    }
    this._guideDetail(cur && (g.list.some(x => x.id === cur.id) ? cur : null));
  },
  // اختيار عنصر من عمود الوسط: قناة/فيلم = تشغيل فوري | مسلسل = مواسم وحلقات في عمود التفاصيل
  _guidePick(it, rowEl) {
    const g = this._guide; if (!g || !it) return;
    g.sel = it;
    [...g.items.children].forEach(c => c.classList && c.classList.toggle('sel', c === rowEl || (c.dataset && c.dataset.id === it.id)));
    if (it.type === 'series') { this._guideSeries(it); return; }
    this.guideClose();
    this.startPlay(it);                       // ملء الشاشة مباشرة (مع استئناف المشاهدة للأفلام)
  },
  // تفاصيل المسلسل: المواسم والحلقات في عمود التفاصيل (مكان المشغل المصغر) — كيما openDetails
  async _guideSeries(it) {
    const g = this._guide; if (!g) return;
    const body = g.detail;
    body.innerHTML = '<div class="load-hint">تحميل المواسم والحلقات...</div>';
    let seasons = [];
    if (it.seriesId && this.src && this.src.type === 'xtream') {
      try {
        const d = await LatchiAPI.loadSeriesDetails(it.seriesId);
        const info = (d && d.info) || {};
        seasons = Object.entries((d && d.episodes) || {}).map(([sNum, eps]) => ({
          num: sNum,
          episodes: Object.values(eps).map(e => ({
            name: e.title || ('الحلقة ' + e.episode_num), episodeNum: e.episode_num,
            url: `${LatchiAPI._src.server}/series/${LatchiAPI._src.username}/${LatchiAPI._src.password}/${e.id}.${(e.container_extension || 'mp4')}`,
            dur: (e.info && e.info.duration) || ''
          }))
        })).sort((a, b) => (+a.num) - (+b.num));
        it.plot = it.plot || info.plot || '';
      } catch (e) {}
    }
    if (!this.guideOpen()) return;
    const eps = seasons.flatMap(s => s.episodes.map(e => Object.assign({ type: 'movie', logo: it.logo, group: it.name, id: it.id + '_E' + (e.episodeNum || 0) }, e)));
    body.innerHTML = `
      <div class="gd-head">${it.logo ? `<img class="gd-poster" src="${esc(it.logo)}" onerror="this.style.display='none'">` : ''}
        <div><div class="gd-name">${esc(it.name || '')}</div>
        <div class="gd-sub">${ic('series', 12)} مسلسل ${it.group ? ' · ' + esc(it.group) : ''}</div></div>
      </div>
      <div class="gd-desc">${esc((it.plot || '').slice(0, 400) || '')}</div>
      ${eps.length ? '' : '<button class="gold-btn" id="gdPlay" style="width:100%;margin:6px 0 10px">' + ic('play', 14) + ' شاهد الآن بملء الشاشة</button>'}
      ${seasons.map(s => `
        <div class="gd-season">${ic('series', 13)} الموسم ${esc(String(s.num))} <span style="color:#8A90B8;font-size:12px">(${s.episodes.length})</span></div>
        ${s.episodes.map(e => `<div class="gd-ep" data-url="${esc(e.url)}" data-name="${esc(e.name)}">
          <span class="n">${ic('play', 10)} ${esc(String(e.episodeNum || ''))}</span><span class="t">${esc(e.name)}</span><span class="d">${esc(e.dur || '')}</span>
        </div>`).join('')}`).join('')}`;
    const pb = document.getElementById('gdPlay');
    if (pb) pb.onclick = () => { this.guideClose(); this.startPlay(it); };
    body.querySelectorAll('.gd-ep').forEach((el) => {
      const url = el.dataset.url, name = el.dataset.name;
      el.onclick = () => {
        const epIt = { id: it.id + '_' + name, name: name, url: url, type: 'movie', logo: it.logo, group: it.name };
        this.guideClose();
        this.startPlay(epIt);                 // الحلقة تفتح مباشرة بملء الشاشة
      };
    });
  },
  // تفاصيل سريعة (قناة/فيلم) في عمود التفاصيل
  _guideDetail(it) {
    const g = this._guide; if (!g) return;
    const body = g.detail;
    if (!it) {
      body.innerHTML = '<div class="mini-empty">اختر من القائمة: القناة تُبدَّل فوراً • المسلسل يفتح مواسمه وحلقاته هنا</div>';
      return;
    }
    const live = it.type === 'live';
    body.innerHTML = `
      <div class="gd-head">${it.logo ? `<img class="gd-poster" src="${esc(it.logo)}" onerror="this.style.display='none'">` : ''}
        <div><div class="gd-name">${esc(it.name || '')}</div>
        <div class="gd-sub">${live ? '● بث مباشر' : it.type === 'series' ? ic('series', 12) + ' مسلسل' : ic('movie', 12) + ' فيلم'} ${it.group ? ' · ' + esc(it.group) : ''}</div></div>
      </div>
      <div class="gd-epg hidden" id="gdEpg"></div>
      <div class="gd-desc" id="gdDesc">${live || it.type === 'series' ? '' : '<span class="mini-desc-wait">…</span>'}</div>
      <div class="gd-note">${live ? ic('play', 10) + ' اختيارها يبدّل القناة فوراً' : it.type === 'series' ? ic('series', 10) + ' اختيارها يفتح المواسم والحلقات هنا' : ic('play', 10) + ' تُفتح مباشرة بملء الشاشة (مع استئناف المشاهدة)'}</div>`;
    if (live && this.src && this.src.type === 'xtream') {
      LatchiAPI.shortEpg(it.id).then(epg => {
        const e2 = document.getElementById('gdEpg');
        if (e2 && epg && epg.title) { e2.innerHTML = ic('tv', 12) + ' ' + esc(epg.title) + (epg.time ? ' · ' + esc(epg.time) : ''); e2.classList.remove('hidden'); }
      }).catch(() => {});
    }
    if (it.type === 'movie' && this.src && this.src.type === 'xtream') {
      LatchiAPI.vodInfo(it.id).then(info => {
        const d = document.getElementById('gdDesc');
        if (d) d.textContent = (info && info.plot) || '';
      }).catch(() => {});
    }
  },
  // تنقل الفوكيس داخل الدليل (هندسي — كيما spatialMove لكن داخل الدليل فقط)
  guideNav(dx, dy) {
    const g = this._guide; if (!g || !g.root) return false;
    let focusables = [];
    try { focusables = [...g.root.querySelectorAll('.pcat, .pitem, .gd-ep, .g-kind, .g-close, #gdPlay')].filter(el => el.offsetParent); } catch (e) { return false; }
    if (!focusables.length) return false;
    let cur = null;
    try { cur = g.root.querySelector('.focused'); } catch (e) {}
    if (!cur) { focusables[0].classList.add('focused'); return true; }
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
      try { best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
      if (best.className && String(best.className).indexOf('pitem') >= 0) {
        // معاينة حية في عمود التفاصيل أثناء التنقل
        const it = g.list.find(x => String(x.id) === String((best.dataset && best.dataset.id)));
        if (it) this._guideDetail(it);
      }
      return true;
    }
    return false;
  },
  guideEnter() {
    const g = this._guide; if (!g || !g.root) return;
    let f = null;
    try { f = g.root.querySelector('.focused'); } catch (e) {}
    if (f && f.click) f.click();
  },

  // ═══ التشغيل ═══
  startPlay(it) {
    const resume = it._resume || (parseInt((localStorage.getItem('cw_' + it.id) || '{"at":0}').match(/"at":(\d+)/) || [0, 0])[1]);
    if (this.screen !== 'player') this.push('player');   // v1.1.2: لا دفع مزدوج عند التنقل بين القنوات
    Player.hideCb = () => App.back();    // v1.1.1: يُعاد تسليحه في كل تشغيل (لنهاية الحلقة/الخروج)
    Player.play(it, { resumeAt: (resume && resume > 15) ? resume : 0 });
  },

  // v1.1.2: تنقل بالريموت — قناة تالية/سابقة من نفس القائمة المعروضة (فوري، من الذاكرة، بلا أي إعادة تحميل)
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
      <div class="set-card"><h3>${ic('user', 14)} الحساب</h3>
        <div class="row"><span>الاسم</span><b>${esc(this.user?.name || '—')}</b></div>
        <div class="row"><span>الكود</span><b>${esc(this.user?.code || 'M3U مباشر')}</b></div>
        <div class="row"><span>ينتهي في</span><b>${esc(String(exp))}</b></div>
        <div class="row"><span>الاتصالات</span><b>${esc(conns)}</b></div>
        <div class="row"><span>الحسابات المحفوظة</span><button class="p-btn ic-btn" id="openAccounts">${ic('user', 13)} مركز الحسابات</button></div>
      </div>
      <div class="set-card"><h3>${ic('folder', 14)} المحتوى</h3>
        <div class="row"><span>فئات القنوات</span><b>${s.live} ${unitTxt}</b></div>
        <div class="row"><span>فئات الأفلام</span><b>${s.movies} ${unitTxt}</b></div>
        <div class="row"><span>فئات المسلسلات</span><b>${s.series} ${unitTxt}</b></div>
        <div class="row"><span>المصدر</span><b>${this.src?.type === 'xtream' ? 'Xtream Codes' : 'M3U'}</b></div>
        <div class="row"><span>التحميل</span><b style="color:#7CE38B">كسوي + تخزين محلي دائم</b></div>
      </div>
      <div class="set-card"><h3>${ic('refresh', 14)} التحديث</h3>
        <div class="row" style="display:block"><span style="display:block;margin-bottom:8px;color:#8A90B8;font-size:13px">يجلب أحدث الفئات والقنوات من الخادم (يمسح النسخ المحفوظة)</span>
        <button class="p-btn ic-btn" id="refreshList">${ic('refresh', 13)} تحديث القائمة الآن</button></div>
      </div>
      <div class="set-card"><h3>${ic('save', 14)} البيانات</h3>
        <div class="row"><span>تفريغ متابعة المشاهدة</span><button class="p-btn" id="clearCw">تفريغ</button></div>
        <div class="row"><span>تفريغ المفضلة</span><button class="p-btn" id="clearFav">تفريغ</button></div>
      </div>
      <div class="set-card"><h3>${ic('phone', 14)} ريموت الهاتف</h3>
        <div class="row"><span>خادم التحكم (واي فاي المنزل)</span><button class="p-btn" id="remoteToggle">${localStorage.getItem('remote_on') === '1' ? ic('x', 12) + ' إيقاف' : ic('play', 12) + ' تشغيل'}</button></div>
        <div class="row"><span>الحالة</span><b style="color:${localStorage.getItem('remote_on') === '1' ? '#7CE38B' : '#8A90B8'}">${localStorage.getItem('remote_on') === '1' ? 'يعمل الآن' : 'متوقف'}</b></div>
        <div class="row"><span>الاتصال</span><b style="color:#7CE38B">تلقائي — بلا أي رمز</b></div>
        <div class="row"><span>الشبكة</span><b style="font-size:12px">${esc((this._remoteInfo && this._remoteInfo.ips || []).join(' ، ') || '—')}${(this._remoteInfo && this._remoteInfo.port) ? ':' + this._remoteInfo.port : ''}</b></div>
        <div class="row" style="display:block"><span style="display:block;margin-bottom:8px;color:#8A90B8;font-size:13px">ثبّت تطبيق «LATCHI Remote» على الهاتف واجعله على نفس الواي فاي — سيظهر هذا الحاسوب في قائمة الهاتف، انقر عليه للتحكم مباشرة.</span></div>
      </div>
      <div class="set-card"><h3>${ic('power', 14)} الخروج</h3>
        <button class="gold-btn danger-btn" id="logout" style="width:100%">تسجيل الخروج والعودة للتحقق</button>
      </div>`;
    document.getElementById('refreshList').onclick = async () => {
      document.getElementById('refreshList').textContent = 'جارٍ التحديث...';
      try { await window.latchi.cacheClear(); } catch (e) {}
      const saved = localStorage.getItem('source_url');
      if (saved) {
        try { await this.loadSource(saved, true); this.show('home', true); return; } catch (e) {}
      }
      document.getElementById('refreshList').textContent = 'تعذر التحديث — تحقق من الاتصال';
    };
    document.getElementById('clearCw').onclick = () => {
      Object.keys(localStorage).filter(k => k.startsWith('cw_')).forEach(k => localStorage.removeItem(k));
      this.buildSettings(); this.focusFirst('settings');
    };
    document.getElementById('clearFav').onclick = () => { localStorage.removeItem('favs'); this.favs = []; this.buildSettings(); this.focusFirst('settings'); };
    const rTgl = document.getElementById('remoteToggle');
    if (rTgl) rTgl.onclick = () => {
      if (localStorage.getItem('remote_on') !== '0') { localStorage.setItem('remote_on', '0'); this.remoteServerStop(); }
      else { localStorage.setItem('remote_on', '1'); this.remoteServerStart(false); }
    };
    document.getElementById('logout').onclick = () => {
      localStorage.removeItem('source_url');
      location.reload();
    };
    document.getElementById('openAccounts').onclick = () => this.push('accounts');
  },

  // ═══ مركز الحسابات (مثل الهاتف: كود أو M3U مباشر + تبديل بين المحفوظات) ═══
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
    // v1.0.3: صلاحية M3U اليدوية (من الحقل) تُحسب كالحقيقية
    const savedAcc = list.find(x => x.value === curUrl);
    const m3uExp = (!isX && savedAcc && savedAcc.exp) ? new Date(savedAcc.exp + 'T23:59:59').getTime() : null;
    const expTs = isX ? (acc.exp_date ? +acc.exp_date * 1000 : null) : m3uExp;
    const exp = expTs ? new Date(expTs).toLocaleDateString('ar-DZ') : (this.user?.expires || '—');
    // شارة الصلاحية الملونة (أخضر/برتقالي/أحمر/رمادي) — كود أو M3U يدوي
    let badge;
    if (expTs) {
      const days = Math.ceil((+acc.exp_date * 1000 - Date.now()) / 86400000);
      if (days < 0) badge = '<span class="badge-exp red">منتهي الصلاحية</span>';
      else if (days <= 7) badge = `<span class="badge-exp orange">${days} يوم متبقٍ</span>`;
      else badge = `<span class="badge-exp green">${days} يوم متبقٍ</span>`;
    } else badge = '<span class="badge-exp gray">غير محدد</span>';
    const created = acc.created_at ? new Date(+acc.created_at * 1000).toLocaleDateString('ar-DZ') : '';
    // v1.0: بطاقات الحسابات — كل الحسابات ظاهرة دفعة واحدة؛
    // النقر/OK على البطاقة يفتح الحساب مباشرة، والأسهم تتنقل بينها بسلاسة.
    const rows = list.length ? `<div class="acc-cards">${list.map(a => {
      const active = a.value === curUrl;
      return `
      <div class="acc-card${active ? ' acc-active' : ''}" data-acc-id="${a.id}"${active ? ' data-acc-home="1"' : ` data-acc-go="${a.id}"`} tabindex="0">
        ${active ? '<span class="acc-now">نشط الآن</span>' : ''}
        <button class="acc-del" data-acc-del="${a.id}" title="حذف هذا الحساب">${ic('trash', 13)}</button>
        <div class="acc-ico">${a.kind === 'code' ? ic('key', 19) : ic('link', 19)}</div>
        <b class="acc-lbl">${esc(a.label)}</b>
        <span class="acc-sub">${a.kind === 'code' ? 'كود تفعيل' : 'M3U مباشر'}${a.exp ? ' · ينتهي ' + esc(a.exp) : ''}</span>
        <span class="acc-open">${active ? 'اضغط للعودة للرئيسية' : 'اضغط للفتح مباشرة ←'}</span>
      </div>`;
    }).join('')}</div>` : '<div class="acc-empty">لا توجد حسابات محفوظة بعد — أضف واحداً بالأسفل</div>';
    document.getElementById('accountsBody').innerHTML = `
      <div class="set-card"><h3>${ic('folder', 14)} حساباتك (${list.length}/20) — انقر حساباً لفتحه مباشرة</h3>${rows}
        <div class="hint-sub" style="margin-top:8px">الأسهم تتنقل بين البطاقات وOK تفتح المحددة — زر الحذف بالزاوية يحذف حساباً واحداً</div>
      </div>
      <div class="set-card"><h3>${ic('user', 14)} الحساب الحالي</h3>
        <div class="row"><span>الاسم</span><b>${esc(this.user?.name || '—')}</b></div>
        ${acc.username ? `<div class="row"><span>مستخدم الخادم</span><b>${esc(acc.username)}</b></div>` : ''}
        <div class="row"><span>النوع</span><b>${isX ? 'Xtream Codes' : (this.src ? 'M3U مباشر' : '—')}</b></div>
        ${acc.status ? `<div class="row"><span>الحالة</span><b class="${acc.status === 'Active' ? 'ok-txt' : 'bad-txt'}">${acc.status === 'Active' ? 'نشط' : esc(acc.status)}</b></div>` : ''}
        ${created ? `<div class="row"><span>تاريخ الإنشاء</span><b>${created}</b></div>` : ''}
        <div class="row"><span>ينتهي في</span><b>${esc(String(exp))} ${badge}</b></div>
        ${acc.max_connections ? `<div class="row"><span>حد الأجهزة</span><b>${esc(String(acc.max_connections))} جهاز</b></div>` : ''}
        ${acc.active_connections != null ? `<div class="row"><span>متصل الآن</span><b>${esc(String(acc.active_connections))} / ${esc(String(acc.max_connections != null ? acc.max_connections : '—'))}</b></div>` : ''}
      </div>
      <div class="set-card"><h3>${ic('add', 14)} إضافة بكود التفعيل</h3>
        <div class="input-row" style="margin-bottom:10px">
          <input id="accCodeInput" class="tv-input" placeholder="أدخل كود التفعيل هنا..." style="width:100%">
          <button class="paste-btn" data-paste="accCodeInput" title="لصق من الحافظة"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button>
        </div>
        <button class="gold-btn ic-btn" id="accCodeBtn" style="width:100%">${ic('key', 14)} تفعيل ودخول</button>
      </div>
      <div class="set-card"><h3>${ic('link', 14)} إضافة رابط M3U مباشر</h3>
        <div class="input-row" style="margin-bottom:10px">
          <input id="accM3uInput" class="tv-input" placeholder="http://... (رابط get.php أو .m3u)" style="width:100%">
          <input id="accExpInput" class="tv-input" type="date" title="تاريخ انتهاء صلاحية الرابط (اختياري — يظهر تحت الساعة)" style="width:100%;margin-top:8px">
          <button class="paste-btn" data-paste="accM3uInput" title="لصق من الحافظة"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg></button>
        </div>
        <button class="gold-btn ic-btn" id="accM3uBtn" style="width:100%">${ic('link', 14)} إضافة ودخول</button>
      </div>
      <div class="set-card"><h3>${ic('warn', 14)} منطقة الخطر</h3>
        <button class="danger-btn ic-btn" id="accWipeBtn">${ic('trash', 14)} حذف جميع الحسابات</button>
        <div class="hint-sub" style="margin-top:8px">يمسح الحسابات وكل ما يخصها فقط (المفضلة وسجل المشاهدة والكاش) ويعود لشاشة إدخال الحساب — التطبيق نفسه لا يُغلق ولا يُعاد ضبطه</div>
      </div>
      <div class="set-card"><div id="accMsg" class="verify-msg"></div></div>`;
    document.getElementById('accWipeBtn').onclick = () => this.showWipeDlg();
    document.getElementById('accCodeBtn').onclick = () => this.applyCode(document.getElementById('accCodeInput').value.trim(), document.getElementById('accMsg'));
    document.getElementById('accM3uBtn').onclick = () => this.applyM3u(document.getElementById('accM3uInput').value.trim(), document.getElementById('accMsg'), document.getElementById('accExpInput').value);
    document.getElementById('accCodeInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('accCodeBtn').click(); });
    document.getElementById('accM3uInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('accM3uBtn').click(); });
    // v1.0: البطاقة كاملة قابلة للنقر — فتح مباشر أو عودة للرئيسية إن كانت نشطة
    document.querySelectorAll('.acc-card').forEach(card => card.onclick = async () => {
      if (card.dataset.accHome) { this.show('home', true); return; }   // الحساب النشط: الرئيسية
      const a = list.find(x => x.id === card.dataset.accGo);
      if (!a) return;
      const msg = document.getElementById('accMsg');
      msg.className = 'verify-msg'; msg.textContent = 'جارٍ الدخول إلى ' + a.label + '...';
      this.showChecking();                    // v1.0.1
      try { await this.loadSource(a.value, false, a.value, { welcome: true }); }
      catch (e) { msg.textContent = 'تعذر الدخول — قد يكون الحساب منتهياً: ' + e.message; msg.classList.add('err'); }
      finally { this.hideChecking(); }
    });
    document.querySelectorAll('[data-acc-del]').forEach(b => b.onclick = (ev) => {
      ev.stopPropagation();                   // الحذف لا يفتح البطاقة
      this.saveAccounts(this.getAccounts().filter(x => x.id !== b.dataset.accDel));
      this.buildAccounts(); this.focusFirst('accounts');
    });
  }
};
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ═══ التنقل المكاني (فلسفة الريموت: أسهم + OK + رجوع) ═══
// v1.0.5: تنقل شبكة البوسترات بالفهرس الرياضي — لا هندسة ولا أخطاء:
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
  const focusables = [...root.querySelectorAll('.tcard, .vtab, .gold-btn, .pcat, .pitem, .cat-chip, .chan, .pcard, .ep, .acc-card, .back-btn, .tv-input, .p-btn, .mini-wrap, .set-card .p-btn, .gsearch-chip, .sp-season, .sp-ep')].filter(el => el.offsetParent);
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
  // v1.0.2: نافذة الخروج مفتوحة → الأسهم تنقل بين نعم/إلغاء وEnter يؤكد
  if (App.exitDlgOpen()) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') App.moveExitFocus();
    else if (e.key === 'Enter') App.confirmExitDlg();
    else if (e.key === 'Escape' || e.key === 'Backspace') App.hideExitDlg();
    e.preventDefault();
    return;
  }
  if (App.screen === 'player') {
    // ج50: دليل القنوات مفتوح داخل المشغل → الأسهم وEnter وEsc تخدم الدليل
    if (App.guideOpen()) {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack') { App.guideClose(); e.preventDefault(); return; }
      if (e.key === 'Home' || e.key === 'BrowserHome') { App.guideClose(); App.show('home', true); e.preventDefault(); return; }
      switch (e.key) {
        case 'ArrowUp': App.guideNav(0, -1); e.preventDefault(); return;
        case 'ArrowDown': App.guideNav(0, 1); e.preventDefault(); return;
        case 'ArrowLeft': App.guideNav(-1, 0); e.preventDefault(); return;
        case 'ArrowRight': App.guideNav(1, 0); e.preventDefault(); return;
        case 'Enter': App.guideEnter(); e.preventDefault(); return;
      }
      // ما تبقى (أرقام القناة، مسافة، f...) يمر للمشغل كالمعتاد — كيما التلفاز
    }
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
    case 'Escape': case 'Backspace': case 'BrowserBack':    // v1.0.3: ريموت البلوتوث يرسل BrowserBack لزر الرجوع
      if (App.screen === 'home') App.showExitDlg();          // v1.0.2: زر الرجوع في الرئيسية = تأكيد الخروج كيما التلفاز
      else if (App.screen !== 'verify') App.back();
      e.preventDefault(); break;
    case 'Home': case 'BrowserHome':                          // v1.0.3: زر Home بالريموت = الرئيسية
      App.show('home', true); e.preventDefault(); break;
    case 'PageUp': case 'PageDown': {                         // v1.0.3: تمرير القوائم الطويلة كيما التلفاز
      const sc = document.querySelector('.screen.active .list-body') || document.querySelector('.screen.active #accountsBody');
      if (sc) sc.scrollBy({ top: (e.key === 'PageUp' ? -1 : 1) * sc.clientHeight * 0.8, behavior: 'smooth' });
      e.preventDefault(); break;
    }
  }
});
// v1.0.2: المؤشر يختفي بعد 2.5ث بلا حركة داخل المشغل (كيما التلفاز)
let _curTimer = null;
document.addEventListener('mousemove', () => {
  const b = document.body;
  if (b) b.classList.remove('no-cursor');
  if (App.screen === 'player' && typeof Player !== 'undefined') { try { Player.flashUi(); } catch (e) {} }   // v1.0.6
  clearTimeout(_curTimer);
  _curTimer = setTimeout(() => {
    if (App.screen === 'player' && b) b.classList.add('no-cursor');
  }, 2500);
});
// الفأرة = نفس التركيز
document.addEventListener('mouseover', (e) => {
  const t = e.target.closest('.tcard, .vtab, .gold-btn, .pcat, .pitem, .cat-chip, .chan, .pcard, .ep, .back-btn, .p-btn, .tv-input, .mini-wrap, .sp-season, .sp-ep');
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
// ج51: أيقونات الشريط العلوي المتجهة + زر البحث الشامل
try {
  const gsBtn = document.getElementById('globalSearchBtn');
  if (gsBtn) { gsBtn.innerHTML = ic('search', 18); gsBtn.classList.add('ic-btn'); gsBtn.onclick = () => App.gsearchToggle(); }
  const uc0 = document.getElementById('userChip'); if (uc0 && !String(uc0.textContent || '').trim() && !uc0.innerHTML.trim()) uc0.innerHTML = ic('user', 15);
  const eb0 = document.getElementById('exitBtn'); if (eb0 && !eb0.innerHTML.trim()) eb0.innerHTML = ic('power', 15);
  const pr0 = document.getElementById('prayerIc'); if (pr0) pr0.innerHTML = ic('mosque', 14);
  // عناصر الواجهة الثابتة (كانت إيموجي في HTML — الآن أيقونات متجهة)
// ج53 إصلاح ج51: الأيقونة تُضاف لزر التبويب نفسه — ليس لحاوية الحقول (كانت تمسح codeInput/codeBtn
// وتوقف سكربت app.js كلياً عند الربط بالأسفل → التطبيق لا يقلع أبداً)
const vtc = document.querySelector('.vtab[data-tab="code"]'); if (vtc && !vtc.querySelector('svg')) vtc.innerHTML = ic('key', 13) + ' كود التفعيل';
const vtm = document.querySelector('.vtab[data-tab="m3u"]'); if (vtm && !vtm.querySelector('svg')) vtm.innerHTML = ic('link', 13) + ' رابط M3U';
  const cb0 = document.getElementById('codeBtn'); if (cb0) cb0.innerHTML = ic('check', 14) + ' تحقق الآن';
  const mb0 = document.getElementById('m3uBtn'); if (mb0) mb0.innerHTML = ic('down', 14) + ' حمّل القائمة';
  const ml0 = document.getElementById('miniLoad'); if (ml0) ml0.innerHTML = '<svg class="ic spinner" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>';
  const mf0 = document.querySelector('.mini-fs'); if (mf0) mf0.innerHTML = ic('full', 13) + ' ملء الشاشة';
  const ei0 = document.getElementById('exitIc'); if (ei0) ei0.innerHTML = ic('power', 30);
  const eo0 = document.getElementById('exitOk'); if (eo0) eo0.innerHTML = ic('check', 13) + ' نعم، خروج';
  const ec0 = document.getElementById('exitCancel'); if (ec0) ec0.innerHTML = ic('x', 13) + ' إلغاء';
} catch (e) {}
// ج53: كل الربط محصّن — عنصر مفقود لا يوقف سكربت التطبيق أبداً
const _el = (id) => document.getElementById(id);
if (_el('exitOk')) _el('exitOk').onclick = () => App.doQuit();
if (_el('exitCancel')) _el('exitCancel').onclick = () => App.hideExitDlg();
if (_el('exitDlg')) _el('exitDlg').onclick = (e) => { if (e.target === e.currentTarget) App.hideExitDlg(); };
if (_el('codeBtn')) _el('codeBtn').onclick = () => App.doVerify();
if (_el('m3uBtn')) _el('m3uBtn').onclick = () => App.doM3u();
if (_el('codeInput')) _el('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') App.doVerify(); });
if (_el('m3uInput')) _el('m3uInput').addEventListener('keydown', e => { if (e.key === 'Enter') App.doM3u(); });
if (_el('searchInput')) _el('searchInput').addEventListener('input', () => { if (App.screen === 'list') App.buildList(); });

App.boot();
