// ═══ ▶️ LATCHI IPTV Desktop — المشغل (hls.js + تحكم تلفازي) ═══
const Player = {
  video: null, hls: null, ui: null, hideTimer: null,
  current: null, isLive: true, hideCb: null, uiVisible: true,

  init() {
    this.video = document.getElementById('video');
    this.ui = document.getElementById('playerUi');
    document.getElementById('pPlay').onclick = () => this.toggle();
    document.getElementById('pRew').onclick = () => this.seek(-10);
    document.getElementById('pFwd').onclick = () => this.seek(10);
    document.getElementById('pVol').onclick = () => this.toggleMute();
    document.getElementById('pFull').onclick = () => this.fullscreen();
    document.getElementById('pExit').onclick = () => this.close();
    document.getElementById('pFav').onclick = () => this.fav();
    document.getElementById('pSeekWrap').onclick = (e) => this.seekTo(e);
    this.video.addEventListener('timeupdate', () => this.onTime());
    this.video.addEventListener('ended', () => { if (this.hideCb) this.hideCb('ended'); });
    this.video.addEventListener('error', () => this.center('⚠ تعذر تشغيل القناة', 2200));
    this.video.volume = parseFloat(localStorage.getItem('vol') || '1');
  },

  play(item, opts = {}) {
    this.current = item;
    this.isLive = item.type === 'live';
    document.getElementById('pName').textContent = item.name;
    document.getElementById('pLive').classList.toggle('hidden', !this.isLive);
    document.getElementById('pSeekWrap').style.display = this.isLive ? 'none' : 'block';
    document.getElementById('pRew').style.display = this.isLive ? 'none' : '';
    document.getElementById('pFwd').style.display = this.isLive ? 'none' : '';
    document.getElementById('pFav').textContent = App.isFav(item) ? '★ مفضلة' : '☆ مفضلة';
    if (this.hls) { this.hls.destroy(); this.hls = null; }
    const url = item.url;
    if (/\.m3u8($|\?)/i.test(url) && window.Hls && Hls.isSupported()) {
      this.hls = new Hls({ maxBufferLength: 30 });
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);
    } else {
      this.video.src = url;
    }
    // استئناف موضع المشاهدة (VOD)
    if (!this.isLive && opts.resumeAt) this.video.currentTime = opts.resumeAt;
    this.show('▶');
    this.flashUi();
  },

  toggle() {
    if (this.video.paused) { this.video.play(); this.show('▶'); }
    else { this.video.pause(); this.show('⏸'); }
  },
  seek(s) {
    if (this.isLive) return;
    this.video.currentTime = Math.max(0, this.video.currentTime + s);
    this.show(s > 0 ? '⏩' : '⏪', 700);
  },
  seekTo(e) {
    if (this.isLive || !this.video.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    this.video.currentTime = ((r.right - e.clientX) / r.width) * this.video.duration; // RTL
  },
  toggleMute() {
    this.video.muted = !this.video.muted;
    this.show(this.video.muted ? '🔇' : '🔊', 700);
  },
  volume(d) {
    this.video.muted = false;
    this.video.volume = Math.min(1, Math.max(0, this.video.volume + d));
    localStorage.setItem('vol', this.video.volume);
    this.show('🔊 ' + Math.round(this.video.volume * 100) + '%', 700);
  },
  fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  },
  fav() {
    App.toggleFav(this.current);
    document.getElementById('pFav').textContent = App.isFav(this.current) ? '★ مفضلة' : '☆ مفضلة';
    this.show(App.isFav(this.current) ? '★ أضيفت للمفضلة' : '☆ أُزيلت من المفضلة', 1200);
  },
  onTime() {
    if (this.isLive) return;
    const d = this.video.duration || 0, t = this.video.currentTime || 0;
    document.getElementById('pSeekFill').style.width = d ? (t / d * 100) + '%' : '0%';
    document.getElementById('pTime').textContent = fmt(t) + ' / ' + fmt(d);
    // متابعة المشاهدة — حفظ كل 5 ثوان
    if (this.current && d > 60 && t > 15 && t < d - 30) {
      const key = 'cw_' + this.current.id;
      const last = parseInt(localStorage.getItem('cw_t_' + this.current.id) || '0');
      if (Date.now() - last > 5000) {
        localStorage.setItem(key, JSON.stringify({ item: this.current, at: t, dur: d, ts: Date.now() }));
        localStorage.setItem('cw_t_' + this.current.id, Date.now());
      }
    }
  },
  show(msg, ms = 900) {
    const c = document.getElementById('pCenter');
    c.textContent = msg; c.classList.remove('hidden');
    clearTimeout(this._ct); this._ct = setTimeout(() => c.classList.add('hidden'), ms);
  },
  flashUi() {
    this.ui.classList.remove('hidden-ui'); this.uiVisible = true;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.ui.classList.add('hidden-ui'); this.uiVisible = false;
    }, 3500);
  },
  close() {
    if (this.hls) { this.hls.destroy(); this.hls = null; }
    this.video.pause(); this.video.removeAttribute('src'); this.video.load();
    if (this.hideCb) this.hideCb('exit');
  },
  onKey(e) {
    this.flashUi();
    switch (e.key) {
      case ' ': case 'Enter': this.toggle(); e.preventDefault(); break;
      case 'ArrowLeft': this.isLive ? this.volume(.1) : this.seek(-10); e.preventDefault(); break;
      case 'ArrowRight': this.isLive ? this.volume(-.1) : this.seek(10); e.preventDefault(); break;
      case 'ArrowUp': this.volume(.1); e.preventDefault(); break;
      case 'ArrowDown': this.volume(-.1); e.preventDefault(); break;
      case 'f': case 'F': this.fullscreen(); break;
      case 'm': case 'M': this.toggleMute(); break;
    }
  }
};
function fmt(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}
window.Player = Player;
