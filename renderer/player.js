// ═══ ▶️ LATCHI IPTV Desktop v1.1 — المشغل المقاوم (سلسلة احتياطية + استعادة تلقائية) ═══
const Player = {
  video: null, hls: null, ui: null, hideTimer: null,
  current: null, isLive: true, hideCb: null, uiVisible: true,
  _candidates: [], _candIdx: 0, _netRetries: 0, _mediaRecovered: false, _mediaSwapped: false, _gen: 0,
  _played: false, _sameReload: 0, _stallMs: 0, _wd: 0,

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
    this.video.addEventListener('error', () => {
      if (this._usingHls) return; // أخطاء hls تُعالج في معالج Hls.Events.ERROR
      this._nextCandidate('خطأ في المصدر');
    });
    // مؤشر التخزين المؤقت
    this.video.addEventListener('waiting', () => { if (!this.video.paused) this.center('⏳', 0); });
    this.video.addEventListener('playing', () => {
      this.hideCenter();
      // 🛠 v1.1.2: البث اشتغل = صفّر عدادات الاستعادة (التقطعات اللحظية لا تتراكم)
      this._played = true; this._netRetries = 0; this._stallMs = 0;
      this._mediaRecovered = false; this._mediaSwapped = false;
    });
    this.video.addEventListener('canplay', () => { if (!this.video.paused) this.hideCenter(); });
    this.video.volume = parseFloat(localStorage.getItem('vol') || '1');
  },

  // 🧱 بناء سلسلة الروابط المرشحة (نفس فلسفة الهاتف: صيغ متعددة ومحاولة تباعاً)
  buildCandidates(item) {
    const url = item.url || '';
    const out = [url];
    const add = (u) => { if (u && !out.includes(u)) out.push(u); };
    if (item.urlTs) add(item.urlTs);                                   // xtream: نسخة .ts الاحتياطية
    if (/\.ts($|\?)/i.test(url)) add(url.replace(/\.ts($|\?)/i, '.m3u8$1'));  // .ts → جرّب m3u8
    if (/\.m3u8($|\?)/i.test(url)) add(url.replace(/\.m3u8($|\?)/i, '.ts$1')); // m3u8 → جرّب ts
    if (/output=ts/i.test(url)) add(url.replace(/output=ts/i, 'output=m3u8'));
    if (/output=m3u8/i.test(url)) add(url.replace(/output=m3u8/i, 'output=ts'));
    return out;
  },

  play(item, opts = {}) {
    this.current = item;
    this.isLive = item.type === 'live';
    this._gen++;                       // إلغاء أي محاولات قديمة عالقة
    this._candidates = this.buildCandidates(item);
    this._candIdx = 0; this._netRetries = 0; this._mediaRecovered = false; this._mediaSwapped = false;
    this._played = false; this._sameReload = 0; this._stallMs = 0;   // 🛠 v1.1.2
    document.getElementById('pName').textContent = item.name;
    document.getElementById('pLive').classList.toggle('hidden', !this.isLive);
    document.getElementById('pSeekWrap').style.display = this.isLive ? 'none' : 'block';
    document.getElementById('pRew').style.display = this.isLive ? 'none' : '';
    document.getElementById('pFwd').style.display = this.isLive ? 'none' : '';
    document.getElementById('pFav').textContent = App.isFav(item) ? '★ مفضلة' : '☆ مفضلة';
    this._resumeAt = (!this.isLive && opts.resumeAt) ? opts.resumeAt : 0;
    this.show('⏳ جارٍ فتح البث...', 0);
    this.flashUi();
    // 🛠 v1.1.3: أي تشغيل (قناة/فيلم/حلقة) = شاشة كاملة فوراً مثل التلفاز — Esc/رجوع يغلق ويعود للقائمة
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen)
        document.documentElement.requestFullscreen().catch(() => {});
    } catch (e) {}
    this._startWatchdog();             // 🛠 v1.1.2: حارس التقطّع الصامت
    this._tryCandidate();
  },

  // 🛠 v1.1.2: حارس التقطّع — البث يتجمد بصمت بلا أحداث خطأ → تنبيه لطيف كل 12 ثانية
  _startWatchdog() {
    clearInterval(this._wd);
    this._stallMs = 0;
    this._wd = setInterval(() => {
      if (!this._usingHls || !this.hls) return;
      const v = this.video;
      if (this._played && !v.paused && v.readyState <= 2) {
        this._stallMs += 3000;
        if (this._stallMs >= 12000) {
          this._stallMs = 0;
          this.center('⏳ استعادة البث...', 1500);
          try { this.hls.startLoad(); } catch (e) {}
        }
      } else this._stallMs = 0;
    }, 3000);
  },

  // 📺 v1.1.2: مثل الريموت — فوق/تحت = قناة تالية/سابقة (تنقل فوري بلا إعادة تحميل قائمة)
  zap(dir) {
    const ok = App.zap(dir);
    if (!ok) this.show('لا توجد قناة ' + (dir > 0 ? 'بعد' : 'قبل') + ' هذه', 900);
  },


  _tryCandidate() {
    const gen = this._gen;
    if (this.hls) { this.hls.destroy(); this.hls = null; }
    this.video.pause();
    this.video.removeAttribute('src');
    this._usingHls = false;
    if (this._candIdx >= this._candidates.length) {
      this.center('⚠ تعذر تشغيل هذه القناة — جرّب قناة أخرى أو حدّث القائمة من الإعدادات', 0);
      return;
    }
    const url = this._candidates[this._candIdx];
    if (/\.m3u8($|\?)/i.test(url) && window.Hls && Hls.isSupported()) {
      // ═══ مسار HLS (الأغلبية) ═══
      this._usingHls = true;
      this.hls = new Hls({
        // إعدادات الحاسوب الضعيف: عامل خلفي + مخزن معقول + إعادة محاولات عنيدة
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 20,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 800,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 800,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 600,
        startLevel: -1
      });
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);
      this.hls.on(Hls.Events.ERROR, (evt, data) => {
        if (gen !== this._gen) return;  // محاولة قديمة ملغاة
        if (!data.fatal) return;        // الأخطاء غير الفادحة تُتجاوز (استمرارية البث)
        const det = data.details || '';
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          // 🛠 v1.1.2 (بطلب العميل): من أول محاولة تشتغل = تمام؛ ما تشتغلش بعد المحاولات = رسالة واضحة فوراً.
          // البث الحي يتقطع لحظياً بشكل طبيعي — إذا كان البث شغالاً نصبر بذكاء (6 محاولات تصاعدية ≈ 21ث
          // والعدّال ظاهر للمشاهد في كل محاولة) ثم إعادة فتح واحدة، ثم رسالة نهائية واضحة.
          const maxR = this._played ? 6 : 3;
          if (this._netRetries < maxR && this.hls) {
            this._netRetries++;
            const delay = this._played ? Math.min(1000 * this._netRetries, 6000) : 900; // مهلة تصاعدية
            this.center(this._played
              ? '⏳ استعادة البث — محاولة ' + this._netRetries + '/' + maxR + '...'
              : '⏳ إعادة المحاولة (' + this._netRetries + '/' + maxR + ')...', 1500);
            setTimeout(() => { if (gen === this._gen && this.hls) this.hls.startLoad(); }, delay);
          } else if (this._played && this._sameReload < 1) {
            // البث كان حياً: إعادة فتح نفس الرابط من الصفر مرة واحدة أخيرة
            this._sameReload++;
            this.center('⏳ إعادة فتح البث...', 1600);
            setTimeout(() => {
              if (gen === this._gen) { this._netRetries = 0; this._mediaRecovered = false; this._mediaSwapped = false; this._tryCandidate(); }
            }, 800);
          } else if (this._played) {
            // 🛠 v1.1.2: بث كان شغالاً وانتهى فعلاً — رسالة فورية واضحة (التنقل ↑/↓ جاهز لتجربة قناة أخرى)
            this.center('⚠ تعذر استعادة هذه القناة — جرّب قناة أخرى (↑/↓) أو حدّث القائمة من الإعدادات', 0);
          } else {
            this._nextCandidate('انقطاع شبكة');
          }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          if (!this._mediaRecovered && this.hls) {
            this._mediaRecovered = true;
            this.hls.recoverMediaError();
          } else if (!this._mediaSwapped && this.hls) {
            // 🛠 v1.1.2: الخطوة الثانية الرسمية لـhls.js قبل الاستسلام
            this._mediaSwapped = true;
            this.hls.swapAudioCodec();
            this.hls.recoverMediaError();
          } else {
            this._nextCandidate('خطأ فك الترميز');
          }
        } else {
          this._nextCandidate(det);
        }
      });
    } else {
      // ═══ مسار مباشر (mp4/mkv/ts) ═══
      this.video.src = url;
      this.video.load();
      this.video.play().catch(() => {});
    }
    if (this._resumeAt) {
      const apply = () => { try { this.video.currentTime = this._resumeAt; } catch (e) {} this.video.removeEventListener('loadedmetadata', apply); };
      this.video.addEventListener('loadedmetadata', apply);
    }
    this.video.play().catch(() => {});
  },

  _nextCandidate(reason) {
    const gen = this._gen;
    this._candIdx++;
    this._netRetries = 0; this._mediaRecovered = false; this._mediaSwapped = false; this._played = false;
    if (this._candIdx < this._candidates.length) {
      this.center('⏳ تجربة صيغة بث بديلة...', 1600);
      setTimeout(() => { if (gen === this._gen) this._tryCandidate(); }, 500);
    } else {
      this.center('⚠ تعذر تشغيل هذه القناة — جرّب قناة أخرى أو حدّث القائمة من الإعدادات', 0);
    }
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
    this.center(msg, ms);
  },
  center(msg, ms = 900) {
    const c = document.getElementById('pCenter');
    c.textContent = msg; c.classList.remove('hidden');
    clearTimeout(this._ct);
    if (ms > 0) this._ct = setTimeout(() => c.classList.add('hidden'), ms);
  },
  hideCenter() {
    const c = document.getElementById('pCenter');
    if (c && (c.textContent || '').indexOf('⏳') === 0) c.classList.add('hidden');
  },
  flashUi() {
    this.ui.classList.remove('hidden-ui'); this.uiVisible = true;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.ui.classList.add('hidden-ui'); this.uiVisible = false;
    }, 3500);
  },
  close() {
    this._gen++;
    clearInterval(this._wd);           // 🛠 v1.1.2: أوقف حارس التقطّع
    if (this.hls) { this.hls.destroy(); this.hls = null; }
    this.video.pause(); this.video.removeAttribute('src'); this.video.load();
    // 🛠 v1.1.1: اخرج من ملء الشاشة + الاستدعاء مرة واحدة فقط (منع التداخل اللانهائي)
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
    const cb = this.hideCb; this.hideCb = null;
    if (cb) cb('exit');
  },
  onKey(e) {
    this.flashUi();
    switch (e.key) {
      case ' ': case 'Enter': this.toggle(); e.preventDefault(); break;
      // 📺 v1.1.2 مثل الريموت: يمين/يسار = صوت (وفي الأفلام: تقديم/ترجيع)، فوق/تحت = قناة تالية/سابقة
      case 'ArrowLeft': this.isLive ? this.volume(-.05) : this.seek(-10); e.preventDefault(); break;
      case 'ArrowRight': this.isLive ? this.volume(.05) : this.seek(10); e.preventDefault(); break;
      case 'ArrowUp': this.zap(1); e.preventDefault(); break;
      case 'ArrowDown': this.zap(-1); e.preventDefault(); break;
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
