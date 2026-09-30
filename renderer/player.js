// ═══ ▶️ LATCHI IPTV Desktop v1.1 — المشغل المقاوم (سلسلة احتياطية + استعادة تلقائية) ═══
const Player = {
  video: null, hls: null, ui: null, hideTimer: null,
  current: null, isLive: true, hideCb: null, uiVisible: true,
  _candidates: [], _candIdx: 0, _netRetries: 0, _mediaRecovered: false, _mediaSwapped: false, _gen: 0,
  _played: false, _sameReload: 0, _stallMs: 0, _wd: 0, _markT: 0,

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
    this._bindVideoEvents(this.video);
  },

  // 🔗 ربط أحداث عنصر فيديو (مرة واحدة لكل عنصر) — يستعمل أيضاً لعنصر المصغر عند التكبير السلس
  _bindVideoEvents(v) {
    if (!v) return;
    try { v.volume = parseFloat(localStorage.getItem('vol') || '1'); } catch (e) {}
    if (v._latchiBound) return;
    v._latchiBound = true;
    // 📺 v1.0.6: الضغط على الشاشة = إظهار/إخفاء شريط المعلومات (كيما التلفاز)
    v.onclick = () => { if (this.uiVisible) this.hideUi(); else this.flashUi(); };
    // 🎚 v1.0.6: جودة البث الحية (SD/HD/FHD/4K) للعلامة المائية
    v.addEventListener('loadedmetadata', () => this._updQuality());
    v.addEventListener('resize', () => this._updQuality());
    v.addEventListener('timeupdate', () => this.onTime());
    v.addEventListener('ended', () => { if (this.hideCb) this.hideCb('ended'); });
    v.addEventListener('error', () => {
      if (this._usingHls) return; // أخطاء hls تُعالج في معالج Hls.Events.ERROR
      this._nextCandidate('خطأ في المصدر');
    });
    // مؤشر التخزين المؤقت
    v.addEventListener('waiting', () => { if (!v.paused) this.center('⏳', 0); });
    v.addEventListener('playing', () => {
      this.hideCenter();
      // 🛠 v1.1.2: البث اشتغل = صفّر عدادات الاستعادة (التقطعات اللحظية لا تتراكم)
      this._played = true; this._netRetries = 0; this._stallMs = 0;
      this._mediaRecovered = false; this._mediaSwapped = false;
    });
    v.addEventListener('canplay', () => { if (!v.paused) this.hideCenter(); });
  },

  // ═══ 🎬 v1.0.0 (طلب العميل): تكبير سلس من المصغر — نفس عنصر الفيديو ونفس البث، بلا أي إعادة تحميل ═══
  takeOver(item) {
    if (this._miniFs) this.exitMiniFs();
    const miniVid = document.getElementById('miniVid');
    if (!miniVid) { this.play(item); return; }        // احتياط: مسار عادي
    this._origVideo = this.video;
    this._miniFs = true;
    try { this._miniSlot = miniVid.parentNode || null; } catch (e) { this._miniSlot = null; }
    try {
      const op = this._origVideo.parentNode;
      if (op && op.insertBefore) op.insertBefore(miniVid, this._origVideo);
    } catch (e) {}
    try { this._origVideo.style.display = 'none'; } catch (e) {}
    miniVid.classList.add('fs-from-mini');
    this.video = miniVid;                             // كل أزرار المشغل تعمل على نفس البث الجاري
    this._bindVideoEvents(miniVid);
    // تهيئة واجهة المشغل حول البث الجاري — دون أي لمس للمصدر
    this.current = item;
    this.isLive = item.type === 'live';
    this._gen++;
    this._played = true; this._netRetries = 0; this._stallMs = 0; this._sameReload = 0;
    this._mediaRecovered = false; this._mediaSwapped = false;
    this._candidates = this.buildCandidates(item); this._candIdx = 0;
    this._resumeAt = 0;
    document.getElementById('pName').textContent = item.name;
    document.getElementById('pLive').classList.toggle('hidden', !this.isLive);
    document.getElementById('pSeekWrap').style.display = this.isLive ? 'none' : 'block';
    document.getElementById('pRew').style.display = this.isLive ? 'none' : '';
    document.getElementById('pFwd').style.display = this.isLive ? 'none' : '';
    document.getElementById('pFav').textContent = App.isFav(item) ? '★ مفضلة' : '☆ مفضلة';
    this.hideCenter();
    this.flashUi();
    try { if (window.latchi && window.latchi.setFullscreen) window.latchi.setFullscreen(true); } catch (e) {}
    this._startWatchdog();
    this.loadEpg(item);
    this._startMark();
  },

  // 🎬 إنهاء التكبير السلس: نفس العنصر يعود لمكانه في المصغر — البث لم يتوقف لحظة
  exitMiniFs() {
    if (!this._miniFs) return false;
    this._miniFs = false;
    const miniVid = document.getElementById('miniVid');
    try {
      if (this._miniSlot && this._miniSlot.appendChild && miniVid) this._miniSlot.appendChild(miniVid);
      if (miniVid) miniVid.classList.remove('fs-from-mini');
    } catch (e) {}
    try { if (this._origVideo) { this._origVideo.style.display = ''; this.video = this._origVideo; } } catch (e) {}
    this._origVideo = null; this._miniSlot = null;
    // أوقف مؤقتات واجهة المشغل — البث نفسه مستمر في المصغر
    clearInterval(this._wd); this._wd = 0;
    clearInterval(this._markT); this._markT = 0;
    const _epgEl = document.getElementById('pEpg'); if (_epgEl) { _epgEl.classList.add('hidden'); _epgEl.textContent = ''; }
    this._numBuf = ''; this._timeBuf = ''; clearTimeout(this._numT); clearTimeout(this._timeT); try { this.hideNumOsd(); } catch (e) {}
    try { this.hideUi(); } catch (e) {}
    return true;
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
    // 🎬 v1.0.0: تشغيل جديد أثناء التكبير السلس (تبديل قناة) — أنهِ الوضع واقتل بث المصغر القديم
    if (this._miniFs) {
      this.exitMiniFs();
      try { if (typeof App !== 'undefined' && App.miniStopHard) App.miniStopHard(); } catch (e) {}
      try { if (typeof App !== 'undefined' && App._miniItem) App._miniItem = item; } catch (e) {}
    }
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
    // 📺 v1.0.2: التطبيق كله بملء الشاشة دائماً (نافذة التلفاز) — إعادة تأكيد عبر IPC عند أي تشغيل
    try { if (window.latchi && window.latchi.setFullscreen) window.latchi.setFullscreen(true); } catch (e) {}
    this._startWatchdog();             // 🛠 v1.1.2: حارس التقطّع الصامت
    this.loadEpg(item);                // 📺 v1.0.6: البرنامج الحالي (EPG) في شريط المعلومات
    this._startMark();                 // 💧 v1.0.6: العلامة المائية العائمة (حماية من احتراق الشاشة)
    this._tryCandidate();
  },

  // ═══ 📺 v1.0.6: شريط معلومات المشغل — EPG من الخادم (xtream) ═══
  async loadEpg(item) {
    const el = document.getElementById('pEpg');
    if (!el) return;
    if (!item || item.type !== 'live' || !(typeof LatchiAPI !== 'undefined' && LatchiAPI._src && LatchiAPI._src.type === 'xtream')) {
      el.classList.add('hidden'); el.textContent = '';
      return;
    }
    try {
      const epg = await LatchiAPI.shortEpg(item.id);
      if (Player.current !== item) return;                    // غيّرنا القناة أثناء الجلب
      if (epg && epg.title) {
        el.textContent = '📺 ' + epg.title + (epg.time ? '  ·  ' + epg.time : '');
        el.classList.remove('hidden');
      } else { el.classList.add('hidden'); el.textContent = ''; }
    } catch (e) { el.classList.add('hidden'); }
  },

  // ═══ 💧 v1.0.6: العلامة المائية العائمة — LATCHI DZ + الجودة، تتنقل كل 15 ثانية ═══
  _startMark() {
    clearInterval(this._markT);
    const m0 = document.getElementById('pMark');
    if (m0) m0.classList.remove('swap');      // تبدأ من اليمين دائماً
    this._markT = setInterval(() => {
      const m = document.getElementById('pMark');
      if (m) m.classList.toggle('swap');      // يمين ↔ يسار (transition في CSS)
    }, 15000);
    this._updQuality();
  },
  _updQuality() {
    const q = document.getElementById('pmQ');
    if (!q) return;
    const w = this.video.videoWidth || 0, h = this.video.videoHeight || 0;
    q.textContent = (w >= 3840 || h >= 2160) ? '4K' : (w >= 1920 || h >= 1080) ? 'FHD' : (w >= 1280 || h >= 720) ? 'HD' : (w ? 'SD' : '—');
  },

  hideUi() {                                  // 📺 v1.0.6: إخفاء فوري (نقرة الشاشة)
    this.ui.classList.add('hidden-ui'); this.uiVisible = false;
    this.playerBtns().forEach(b => b.classList.remove('focused'));
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
  // 🔢 v1.0.3: قناة بالرقم كيما التلفاز الحقيقي — الأرقام تظهر أعلى الشاشة وتنتقل مباشرة
  channelNumber(d) {
    this._numBuf = (this._numBuf || '') + d;
    const list = App._zapList || [];
    clearTimeout(this._numT);
    this.showNumOsd(this._numBuf);
    if (this._numBuf.length >= String(list.length).length) { this._commitNum(); return; }   // اكتمل العدد
    this._numT = setTimeout(() => this._commitNum(), 1400);                                  // مهلة كيما التلفاز
  },
  _commitNum() {
    const n = parseInt(this._numBuf || '0', 10);
    this._numBuf = ''; this._timeBuf = ''; clearTimeout(this._numT); clearTimeout(this._timeT);
    const list = App._zapList || [];
    if (!n || n > list.length) { this.hideNumOsd(); this.show('القناة ' + n + ' غير متوفرة', 1200); return; }
    this.showNumOsd(String(n));          // الرقم يبقى ظاهراً لحظة الانتقال كيما التلفاز
    App.startPlay(list[n - 1]);
  },
  showNumOsd(s) {
    const el = document.getElementById('pNum');
    if (!el) return;
    el.textContent = s;
    el.classList.add('on');
    clearTimeout(this._numT2);
    this._numT2 = setTimeout(() => this.hideNumOsd(), 1200);
  },
  hideNumOsd() { const el = document.getElementById('pNum'); if (el) el.classList.remove('on'); },

  zap(dir) {
    const ok = App.zap(dir);
    if (!ok) this.show('لا توجد قناة ' + (dir > 0 ? 'بعد' : 'قبل') + ' هذه', 900);
  },

  // ⏱️ ج50: الانتقال الزمني بالأرقام — كيما مشغل التلفاز بالضبط (طلب العميل):
  // الأرقام تظهر على الشاشة كوقت (HH:MM:SS)، 6 أرقام كاملة = قفز فوري،
  // أرقام أقل = قفز بعد 1.1ث من آخر رقم. للقراءة من اليمين: ثوانٍ ثم دقائق ثم ساعات.
  timeNumber(d) {
    this._timeBuf = (this._timeBuf || '') + d;
    if (this._timeBuf.length > 6) this._timeBuf = this._timeBuf.slice(-6);
    clearTimeout(this._timeT);
    this.showNumOsd('⏩ ' + this.fmtTime6(this._timeBuf));
    if (this._timeBuf.length >= 6) this._commitTime();
    else this._timeT = setTimeout(() => this._commitTime(), 1100);
  },
  _commitTime() {
    const raw = this._timeBuf || '';
    this._timeBuf = '';
    clearTimeout(this._timeT);
    if (!raw) { this.hideNumOsd(); return; }
    const secs = this.parseTime6(raw);
    const d = this.video.duration || 0;
    const target = (d > 0) ? Math.min(Math.max(secs, 0), Math.max(0, d - 2)) : secs;
    try { this.video.currentTime = target; } catch (e) {}
    this.showNumOsd('⏩ ' + this.fmtTime6(String(raw).padStart(6, '0')));
  },
  fmtTime6(raw) {
    const p = String(raw || '').padStart(6, '0');
    return p.slice(0, 2) + ':' + p.slice(2, 4) + ':' + p.slice(4, 6);
  },
  parseTime6(raw) {
    const p = String(raw || '').replace(/\D/g, '').padStart(6, '0').slice(-6);
    return (+p.slice(0, 2)) * 3600 + (+p.slice(2, 4)) * 60 + (+p.slice(4, 6));
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
  async fullscreen() {
    let on = true;
    try { if (window.latchi && window.latchi.isFullscreen) on = await window.latchi.isFullscreen(); } catch (e) {}
    try { if (window.latchi && window.latchi.setFullscreen) window.latchi.setFullscreen(!on); } catch (e) {}
    this.show(on ? '🗗 نافذة' : '⛶ شاشة كاملة', 900);
  },
  // 🎛 v1.0.2: أزرار المشغل كيما التلفاز — قائمة الأزرار المرئية
  playerBtns() {
    return ['pPlay', 'pRew', 'pFwd', 'pVol', 'pFull', 'pFav', 'pExit']
      .map(id => document.getElementById(id))
      .filter(b => b && b.offsetParent && b.style.display !== 'none');
  },
  // ←→ تنقل التركيز بين الأزرار (RTL: اليسار = التالي بصرياً) مع دوران دائري
  moveBtnFocus(dir) {
    const btns = this.playerBtns();
    if (!btns.length) return;
    let i = btns.findIndex(b => b.classList.contains('focused'));
    if (i < 0) { btns[dir > 0 ? 0 : btns.length - 1].classList.add('focused'); return; }
    btns[i].classList.remove('focused');
    i = (i + dir + btns.length) % btns.length;
    btns[i].classList.add('focused');
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
    this.hideTimer = setTimeout(() => this.hideUi(), 3500);
  },
  close() {
    this._gen++;
    clearInterval(this._wd);           // 🛠 v1.1.2: أوقف حارس التقطّع
    // 🎬 v1.0.0: عودة من التكبير السلس — البث يستمر في المصغر بلا أي إعادة تحميل
    if (this._miniFs) {
      try { if (typeof App !== 'undefined') App._miniFsReturn = true; } catch (e) {}   // back() لا يعيد التحميل
      this.exitMiniFs();
      const cb = this.hideCb; this.hideCb = null;
      if (cb) cb('exit');
      return;
    }
    if (this.hls) { this.hls.destroy(); this.hls = null; }
    clearInterval(this._markT); this._markT = 0;                      // 💧 v1.0.6
    const _epgEl = document.getElementById('pEpg'); if (_epgEl) { _epgEl.classList.add('hidden'); _epgEl.textContent = ''; }
    this._numBuf = ''; this._timeBuf = ''; clearTimeout(this._numT); clearTimeout(this._timeT); this.hideNumOsd();   // 🔢 v1.0.3 ⏱️ ج50
    this.video.pause(); this.video.removeAttribute('src'); this.video.load();
    // 📺 v1.0.2: نبقى بملء الشاشة — التطبيق تلفاز (الخروج فقط من نافذة التأكيد)
    const cb = this.hideCb; this.hideCb = null;
    if (cb) cb('exit');
  },
  onKey(e) {
    // 🔢 v1.0.3: أرقام الريموت (1-9) = قناة بالرقم + PageUp/Down = قناة تالية/سابقة — يعملان دائماً كيما التلفاز
    // ⏱️ ج50: في الأفلام والمسلسلات الأرقام = انتقال زمني HHMMSS كيما مشغل التلفاز بالضبط (000100 = دقيقة واحدة)
    if (e.key >= '0' && e.key <= '9') { if (this.isLive) this.channelNumber(e.key); else this.timeNumber(e.key); e.preventDefault(); return; }
    // 🔢 ج48 (لوحة أرقام الريموت): ⌫ يمسح آخر رقم مُدخل — كيما التلفاز
    if (e.key === 'Backspace') {
      if (this.isLive && this._numBuf) {
        this._numBuf = this._numBuf.slice(0, -1);
        clearTimeout(this._numT);
        if (this._numBuf) {
          this.showNumOsd(this._numBuf);
          this._numT = setTimeout(() => this._commitNum(), 1400);
        } else this.hideNumOsd();
      } else if (!this.isLive && this._timeBuf) {
        // ⏱️ ج50: مسح آخر رقم من الوقت المُدخل
        this._timeBuf = this._timeBuf.slice(0, -1);
        clearTimeout(this._timeT);
        if (this._timeBuf) {
          this.showNumOsd('⏩ ' + this.fmtTime6(this._timeBuf));
          this._timeT = setTimeout(() => this._commitTime(), 1100);
        } else this.hideNumOsd();
      }
      e.preventDefault(); return;
    }
    // ↵ ج48: Enter يؤكد رقم القناة فوراً أثناء الكتابة (باقي السلوك كما هو)
    if (e.key === 'Enter' && this.isLive && this._numBuf) { this._commitNum(); e.preventDefault(); return; }
    // ↵ ج50: Enter يؤكد الوقت المُدخل فوراً (أفلام/مسلسلات)
    if (e.key === 'Enter' && !this.isLive && this._timeBuf) { this._commitTime(); e.preventDefault(); return; }
    if (e.key === 'PageUp') { this.flashUi(); this.zap(1); e.preventDefault(); return; }
    if (e.key === 'PageDown') { this.flashUi(); this.zap(-1); e.preventDefault(); return; }
    const wasVisible = this.uiVisible;    // 📺 v1.0.2: احكم على الحالة قبل إيقاظ الواجهة
    this.flashUi();
    if (wasVisible) {
      // 🎛 v1.0.2 (ريموت التلفاز): الأزرار ظاهرة → ←/→ تنقل بينها وEnter يفعّل المركز عليه
      switch (e.key) {
        case 'ArrowLeft': this.moveBtnFocus(1); e.preventDefault(); return;    // RTL: يسار = التالي
        case 'ArrowRight': this.moveBtnFocus(-1); e.preventDefault(); return;
        case 'ArrowUp': this.zap(1); e.preventDefault(); return;
        case 'ArrowDown': this.zap(-1); e.preventDefault(); return;
        case 'Enter': {
          const f = this.playerBtns().find(b => b.classList.contains('focused'));
          if (f) f.click(); else App.guideToggle();   // 📺 ج50: OK = دليل القنوات والفئات كيما التلفاز
          e.preventDefault(); return;
        }
        case ' ': this.toggle(); e.preventDefault(); return;
        case 'f': case 'F': this.fullscreen(); return;
        case 'm': case 'M': this.toggleMute(); return;
      }
      return;
    }
    // 📺 v1.1.2 مثل الريموت: يمين/يسار = صوت (وفي الأفلام: تقديم/ترجيع)، فوق/تحت = قناة تالية/سابقة
    switch (e.key) {
      case ' ': this.toggle(); e.preventDefault(); break;
      case 'Enter': if (App.guideOpen()) App.guideClose(); else App.guideToggle(); e.preventDefault(); break;   // 📺 ج50
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
