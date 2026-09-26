// ═══ اختبار v1.0 الشامل — يعمل بـnode (محاكاة DOM/Electron/HLS كاملة) ═══
// يغطي: المفضلة من المشغل → قائمة المفضلة المختلطة، زر اللصق (+ التفويض + الحافظة الفارغة)،
// مركز الحسابات الكامل + شارات الصلاحية، البطاقات المصورة + الخلفيات العشر، المشغل (أول محاولة + zap + رجوع)
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0;
function T(name, cond) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗✗✗ ' + name); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── محاكاة DOM ───
const els = {};
function makeEl(id) {
  const el = {
    id, _h: {}, children: [], dataset: {}, style: {}, value: '', _html: '', className: '', textContent: '',
    offsetParent: true, paused: true, muted: false, volume: 1, duration: 0, currentTime: 0, readyState: 4, error: null,
    addEventListener(ev, f) { (el._h[ev] = el._h[ev] || []).push(f); },
    removeEventListener(ev, f) { el._h[ev] = (el._h[ev] || []).filter(x => x !== f); },
    fire(ev, arg) { (el._h[ev] || []).forEach(f => f(arg || {})); },
    appendChild(c) { if (c && c._fragment) el.children.push(...c.children); else el.children.push(c); return c; },
    closest(sel) { return (el._closestSelf && el.className && sel.includes(el.className.split(' ')[0])) ? el : null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    click() { if (el.onclick) el.onclick({ target: el, currentTarget: el, clientX: 0 }); },
    focus() { el._focused = true; },
    scrollIntoView() {},
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, width: 100, height: 50 }; },
    play() { el.paused = false; return Promise.resolve(); },
    pause() { el.paused = true; },
    load() {}, removeAttribute() {}, canPlayType() { return 'probably'; },
    requestFullscreen() { return Promise.resolve(); }
  };
  Object.defineProperty(el, 'innerHTML', { get() { return el._html; }, set(v) { el._html = String(v); el.children = []; } });
  const set = new Set();
  el.classList = {
    add: (...c) => c.forEach(x => set.add(x)), remove: (...c) => c.forEach(x => set.delete(x)),
    toggle: (c, f) => { if (f === undefined) { set.has(c) ? set.delete(c) : set.add(c); } else if (f) set.add(c); else set.delete(c); },
    contains: c => set.has(c)
  };
  return el;
}
['splash', 'verify', 'verifyMsg', 'codeInput', 'codeBtn', 'm3uInput', 'm3uBtn', 'vtab-code', 'vtab-m3u',
 'home', 'homeBgs', 'clock', 'userChip', 'cards', 'list', 'searchInput', 'catsBar', 'listBody',
 'details', 'detailsBody', 'settings', 'settingsBody', 'accounts', 'accountsBody', 'player', 'video', 'playerUi',
 'pName', 'pLive', 'pTime', 'pSeekWrap', 'pSeekFill', 'pPlay', 'pRew', 'pFwd', 'pVol', 'pFull', 'pFav', 'pExit', 'pCenter',
 'accCodeBtn', 'accM3uBtn', 'accCodeInput', 'accM3uInput', 'accMsg', 'checkingOv', 'welcome', 'exitDlg', 'exitOk', 'exitCancel', 'exitBtn', 'pNum', 'expLine', 'm3uExpInput', 'accExpInput'].forEach(id => els[id] = makeEl(id));

const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }, key: i => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; }
};
const documentMock = {
  _listeners: {},
  getElementById: id => els[id] || null,
  createElement: () => makeEl('dyn'),
  createDocumentFragment: () => { const f = makeEl('frag'); f._fragment = true; return f; },
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener(ev, f) { (this._listeners[ev] = this._listeners[ev] || []).push(f); },
  documentElement: { requestFullscreen() { return Promise.resolve(); } },
  fullscreenElement: null, exitFullscreen() {}
};
let clipText = '';

// ─── FakeHls (الأحداث الحرفية كما يستعملها المشغل) ───
class FakeHls {
  constructor(cfg) { this.cfg = cfg; this._hh = {}; FakeHls.last = this; }
  static isSupported() { return true; }
  loadSource(u) { this.url = u; }
  attachMedia(v) { this.media = v; }
  on(ev, f) { (this._hh[ev] = this._hh[ev] || []).push(f); }
  fire(ev, data) { (this._hh[ev] || []).forEach(f => f(ev, data)); }
  destroy() { this.destroyed = true; }
  startLoad() {} recoverMediaError() {} swapAudioCodec() {}
}
FakeHls.Events = { ERROR: 'ERROR', MEDIA_ATTACHED: 'MEDIA_ATTACHED', MANIFEST_PARSED: 'MANIFEST_PARSED' };
FakeHls.ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' };

// ─── الـsandbox ───
const sandbox = {
  console, setTimeout, setInterval, clearTimeout, clearInterval,
  requestAnimationFrame: f => f(),
  localStorage, document: documentMock, navigator: {},
  Hls: FakeHls, latchi: { readClipboard: async () => clipText }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ['renderer/api.js', 'renderer/player.js', 'renderer/app.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f });
const App = vm.runInContext('App', sandbox), Player = vm.runInContext('Player', sandbox);

(async () => {
  await sleep(1700);   // سبلاش boot

  const L1 = { id: 'L1', name: 'القناة الأولى', type: 'live', url: 'http://x/a.m3u8', logo: '', group: 'رياضة' };
  const L2 = { id: 'L2', name: 'قناة الثانية', type: 'live', url: 'http://x/b.m3u8', logo: '', group: 'رياضة' };
  const M2 = { id: 'M88', name: 'فيلم ثانٍ', type: 'movie', url: 'http://x/g.mp4', logo: '', group: 'أفلام' };
  const M = { id: 'M77', name: 'فيلم تجريبي', type: 'movie', url: 'http://x/f.mp4', logo: '', group: 'أفلام' };

  console.log('═══ 1) المفضلة من المشغل (فيلم) ═══');
  App.src = { type: 'm3u', live: [L1, L2], movies: [M], series: [] };
  App.user = { name: 'تست', expires: '2027-01-01' };
  App.show('home', true);
  App.startPlay(M);
  await sleep(40);
  T('المشغل فتح الفيلم', els['pName'].textContent === 'فيلم تجريبي' && Player.current.id === 'M77');
  Player.fav();
  T('أُضيف للمفضلة (this.favs)', App.isFav(M));
  T('حُفظ في localStorage', JSON.parse(store['favs']).length === 1);
  T('الزر تحول إلى ★', els['pFav'].textContent.includes('★'));
  Player.fav();
  T('الضغط ثانية يزيله', !App.isFav(M) && App.favs.length === 0);
  Player.fav();                       // أعده للسيناريو 2
  App.startPlay(L1); await sleep(40); // قناة مباشرة → مسار HLS
  Player.fav();
  T('قناة مباشرة أيضاً في المفضلة', App.favs.some(f => f.id === 'L1') && App.favs.length === 2);

  console.log('═══ 2) المفضلة تظهر فعلياً في قائمة المفضلة (مختلطة) ═══');
  App.back();                          // رجوع للمشغِّل السابق؟ → للقائمة/الرئيسية
  await App.openList('fav');
  const body = els['listBody'];
  const cont = body.children[0];
  T('قائمة المفضلة فتحت', App.listCtx && App.listCtx.kind === 'fav' && App.screen === 'list');
  T('العنصران موجودان (فيلم + قناة)', App.listCtx.items.length === 2);
  T('حاوية poster-grid', cont && cont.className.includes('poster-grid'));
  const rendered = cont.children.map(c => c.className);
  T('القناة صف chan والفيلم بطاقة pwrap', rendered.some(c => c.includes('chan')) && rendered.some(c => c.includes('pwrap')));

  console.log('═══ 3) زر اللصق (بلا Ctrl+V) ═══');
  clipText = 'http://paste.test/playlist.m3u';
  const pbtn = makeEl('pb'); pbtn.className = 'paste-btn';
  await App.pasteTo('m3uInput', pbtn);
  T('الرابط لُصق في الحقل', els['m3uInput'].value === clipText);
  T('الزر وميض أخضر .pasted', pbtn.classList.contains('pasted'));
  // عبر التفويض (نفس المستمع الذي يسجله boot على document)
  clipText = 'LATCHI-2026';
  const pb2 = makeEl('pb2'); pb2.className = 'paste-btn'; pb2._closestSelf = true; pb2.dataset.paste = 'codeInput';
  (documentMock._listeners['click'] || []).forEach(f => f({ target: pb2 }));
  await sleep(30);
  T('زر التفعيل لُصق عبر التفويض', els['codeInput'].value === 'LATCHI-2026');
  // حافظة فارغة → لا لصق + وميض أحمر خفيف
  clipText = '   ';
  const before = els['m3uInput'].value;
  const pb3 = makeEl('pb3'); pb3.className = 'paste-btn';
  await App.pasteTo('m3uInput', pb3);
  T('حافظة فارغة: لا تغيير + .paste-empty', els['m3uInput'].value === before && pb3.classList.contains('paste-empty'));

  console.log('═══ 4) مركز الحسابات الكامل + شارات الصلاحية ═══');
  const now = Math.floor(Date.now() / 1000);
  App.src = { type: 'xtream', account: { user_info: { username: 'latchi_vip', status: 'Active', created_at: now - 30 * 86400, exp_date: now + 3 * 86400, max_connections: 2, active_connections: 1 } } };
  App.user = { name: 'إسكندر' };
  App.buildAccounts();
  let html = els['accountsBody'].innerHTML;
  T('تفاصيل كاملة (مستخدم الخادم/الحالة/الإنشاء/الأجهزة/متصل الآن)',
    html.includes('latchi_vip') && html.includes('نشط') && html.includes('تاريخ الإنشاء') && html.includes('حد الأجهزة') && html.includes('متصل الآن'));
  T('شارة برتقالية (3 أيام ≤ 7)', html.includes('badge-exp orange') && html.includes('3 يوم'));
  App.src.account.user_info.exp_date = now + 30 * 86400; App.buildAccounts();
  T('شارة خضراء (>7 أيام)', els['accountsBody'].innerHTML.includes('badge-exp green'));
  App.src.account.user_info.exp_date = now - 86400; App.buildAccounts();
  T('شارة حمراء (منتهي)', els['accountsBody'].innerHTML.includes('منتهي'));
  App.src = { type: 'm3u', live: [L1], movies: [M], series: [] }; App.buildAccounts();
  T('M3U: رمادي «رابط مباشر»', els['accountsBody'].innerHTML.includes('badge-exp gray'));
  T('زر لصق في حقلَي المركز', els['accountsBody'].innerHTML.includes('data-paste="accM3uInput"') && els['accountsBody'].innerHTML.includes('data-paste="accCodeInput"'));

  console.log('═══ 5) بطاقات الرئيسية المصورة + الخلفيات العشر ═══');
  App.show('home', true);
  const cards = els['cards'].children;
  T('8 بطاقات', cards.length === 8);
  T('ترتيب تلفاز: بث/أفلام/مسلسلات/beIN فوق', cards[0]._html.includes('tv_card_live.webp')
    && cards[1]._html.includes('tv_card_films.webp') && cards[2]._html.includes('tv_card_series.webp')
    && cards[3]._html.includes('tv_card_bein.webp'));
  T('تحت: مفضلة/متابعة/حسابات/إعدادات', cards[4]._html.includes('tv_card_favorites.webp')
    && cards[5]._html.includes('tv_card_continue.webp') && cards[6]._html.includes('tv_card_accounts.webp')
    && cards[7]._html.includes('tv_card_settings.webp'));
  T('صورة خالصة بلا طبقة نص (كيما التلفاز)', !cards[0]._html.includes('tcard-body')
    && !cards[0]._html.includes('tcard-shade'));
  const bgs = els['homeBgs'].children;
  T('10 خلفيات محمّلة', bgs.length === 10 && bgs[0].src.includes('latchi_bg_tv_1.webp'));
  T('خلفية واحدة ظاهرة (.on)', bgs.filter(b => b.classList.contains('on')).length === 1);

  console.log('═══ 6) المشغل — من أول محاولة تشتغل (قاعدة العميل) + zap + رجوع ═══');
  App.src.live = [L1, L2];              // قناتان للـzap
  await App.openList('live');
  App.startPlay(L1); await sleep(40);
  T('مسار HLS على القناة', Player._usingHls === true && FakeHls.last && FakeHls.last.url === L1.url);
  els['video'].fire('playing');
  T('اشتغل بلا أي رسالة خطأ', Player._played === true && !els['pCenter'].textContent.includes('تعذر'));
  Player.zap(1);
  T('zap ↑ ينتقل للقناة التالية', Player.current.id === 'L2');
  App.back();
  T('الرجوع يعود للقائمة', App.screen === 'list' && els['player'].classList.contains !== undefined);

  console.log('═══ 7) v1.0.1: غطاء «جاري التحقق» + شاشة الترحيب ═══');
  sandbox.LatchiAPI.loadSource = async () => ({ type: 'm3u', live: [L1, L2], movies: [M], series: [] });
  sandbox.latchi.deviceId = async () => 'test-device';
  sandbox.LatchiAPI.verifyCode = async () => ({ ok: true, name: 'حساب VIP', url: 'http://t/x.m3u', expires: '2027-01-01' });
  App.showChecking();
  T('غطاء التحقق يظهر', !els['checkingOv'].classList.contains('hidden'));
  App.hideChecking();
  T('غطاء التحقق يختفي', els['checkingOv'].classList.contains('hidden'));
  await App.loadSource('http://t/x.m3u', false, 'http://t/x.m3u', { welcome: true });
  T('الدخول الناجح → شاشة الترحيب', App.screen === 'welcome' && els['checkingOv'].classList.contains('hidden'));
  T('الرابط محفوظ', localStorage.getItem('source_url') === 'http://t/x.m3u');
  await sleep(2700);
  T('بعد الترحيب → الرئيسية تلقائياً', App.screen === 'home');
  await App.loadSource('http://t/x.m3u', true);
  T('تحديث بلا ترحيب → الرئيسية مباشرة', App.screen === 'home');
  // applyCode كاملاً: كود → تحقق → ترحيب
  App.show('verify', true);
  const okCode = await App.applyCode('TEST-2026', els['verifyMsg']);
  T('applyCode من البداية للنهاية (كود→ترحيب)', okCode === true && App.screen === 'welcome' && els['checkingOv'].classList.contains('hidden'));
  await sleep(2700);
  T('انتهى بالرئيسية', App.screen === 'home');

  console.log('═══ 8) v1.0.2: نافذة الخروج + ريموت المشغل + ملء الشاشة ═══');
  const kd = ev => (documentMock._listeners['keydown'] || []).forEach(f => f(Object.assign({ target: {}, preventDefault() {} }, ev)));
  App.show('home', true);
  let quitFired = 0;
  sandbox.latchi.quitApp = () => { quitFired++; };
  App.showExitDlg();
  T('نافذة الخروج تظهر', App.exitDlgOpen());
  T('الإلغاء مركّز افتراضياً (الآمن)', els['exitCancel'].classList.contains('focused') && !els['exitOk'].classList.contains('focused'));
  kd({ key: 'ArrowLeft' });
  T('السهم ينقل التركيز إلى «نعم»', els['exitOk'].classList.contains('focused'));
  kd({ key: 'Enter' });
  T('Enter على «نعم» = خروج', quitFired === 1);
  App.showExitDlg(); kd({ key: 'Escape' });
  T('Esc يلغي النافذة', !App.exitDlgOpen());
  kd({ key: 'Backspace' });
  T('زر الرجوع في الرئيسية يفتح نافذة الخروج', App.exitDlgOpen());
  App.hideExitDlg();
  els['exitCancel'].click ? null : null;

  // ريموت المشغل
  const fsCalls = [];
  sandbox.latchi.setFullscreen = (on) => { fsCalls.push(on); };
  sandbox.latchi.isFullscreen = async () => true;
  App.src = { type: 'm3u', live: [L1, L2], movies: [M], series: [] };
  await App.openList('live');
  App.startPlay(L1); await sleep(40);
  T('التشغيل يعيد تأكيد ملء الشاشة (IPC)', fsCalls.includes(true));
  T('الأزرار ظاهرة بعد التشغيل', Player.uiVisible === true);
  els['pRew'].style.display = 'none'; els['pFwd'].style.display = 'none';   // بث حي
  Player.onKey({ key: 'ArrowLeft', preventDefault() {} });
  T('← يركّز زر التشغيل', els['pPlay'].classList.contains('focused'));
  Player.onKey({ key: 'ArrowLeft', preventDefault() {} });
  T('← ثانية يركّز التالي (الصوت)', els['pVol'].classList.contains('focused') && !els['pPlay'].classList.contains('focused'));
  Player.onKey({ key: 'Enter', preventDefault() {} });
  T('Enter يفعّل زر الصوت (كتم)', els['video'].muted === true);
  // مخفية (بعد 3.5ث): كل ضغة أولى تتصرف كيما الريموت الكلاسيكي
  Player.uiVisible = false;
  Player.playerBtns().forEach(b => b.classList.remove('focused'));   // مؤقت الإخفاء يمسح التركيز
  Player.video.volume = 0.5;
  Player.onKey({ key: 'ArrowRight', preventDefault() {} });
  T('مخفية: يمين = صوت+ (0.5→0.55)', Math.abs(Player.video.volume - 0.55) < 0.001);
  Player.uiVisible = false;                                          // محاكاة 3.5ث انقضت من جديد
  Player.onKey({ key: 'Enter', preventDefault() {} });
  T('مخفية: Enter = تشغيل/إيقاف', Player.video.paused === true);

  console.log('═══ 9) v1.0.3: ساعة بالثواني + صلاحية + قناة بالرقم + ريموت ═══');
  // الساعة بالثواني
  App.clockTick();
  T('الساعة تعرض ثواني (فاصلتان)', (els['clock'].textContent.match(/:/g) || []).length >= 2);
  // الصلاحية من الكود (xtream حقيقي)
  App.src = { type: 'xtream', account: { user_info: { exp_date: Math.floor((Date.now() + 40 * 86400000) / 1000) } }, live: [L1], movies: [], series: [] };
  App.clockTick();
  T('صلاحية الكود تحت الساعة (أخضر + تاريخ)', els['expLine'].textContent.includes('تنتهي') && els['expLine'].className.includes('green'));
  App.src.account.user_info.exp_date = Math.floor((Date.now() - 86400000) / 1000);
  App.clockTick();
  T('منتهية = أحمر', els['expLine'].className.includes('red') && els['expLine'].textContent.includes('منتهية'));
  // صلاحية M3U يدوية من الحساب المحفوظ
  sandbox.localStorage.setItem('source_url', 'http://mylist/m.php');
  App.src = { type: 'm3u', live: [L1], movies: [], series: [] };
  App.saveAccounts([{ id: 'a1', kind: 'm3u', label: 'M3U — mylist', value: 'http://mylist/m.php', exp: '2027-06-15', addedAt: '' }]);
  App.clockTick();
  T('صلاحية M3U اليدوية تحت الساعة', els['expLine'].textContent.includes('2027') && !els['expLine'].className.includes('red'));
  // مركز الحسابات: حقل التاريخ + الشارة
  App.buildAccounts();
  T('حقل تاريخ الصلاحية في نموذج M3U', els['accountsBody'].innerHTML.includes('accExpInput'));
  T('الشارة الخضراء للتاريخ اليدوي', els['accountsBody'].innerHTML.includes('badge-exp green'));
  T('صف الحساب يعرض «ينتهي»', els['accountsBody'].innerHTML.includes('ينتهي 2027-06-15'));

  // القناة بالرقم (ريموت التلفاز)
  App.src = { type: 'm3u', live: [L1, L2, M, M2], movies: [], series: [] };
  App.saveAccounts([]);
  await App.openList('live');
  App.startPlay(L1); await sleep(40);
  Player.onKey({ key: '3', preventDefault() {} });
  T('الرقم يظهر في OSD', els['pNum'].classList.contains('on') && els['pNum'].textContent === '3');
  Player._commitNum();
  T('الانتقال للقناة رقم 3', Player.current && Player.current.id === M.id);
  Player.onKey({ key: '9', preventDefault() {} });
  Player._commitNum();
  T('رقم خارج النطاق = رسالة وبلا تغيير', Player.current.id === M.id);
  T('OSD اختفى', !els['pNum'].classList.contains('on'));
  // عدد مزدوج (قائمة >9): «12» فوري لأن maxLen=2
  const many = [L1, L2, M, M2].concat(Array.from({ length: 10 }, (_, i) => ({ id: 'X' + i, name: 'ق' + i, type: 'live', url: 'http://x/' + i })));
  App.src.live = many; App.openList('live'); await sleep(20);
  App.startPlay(many[0]); await sleep(40);
  Player.onKey({ key: '1', preventDefault() {} });
  T('«1» ينتظر رقم ثانٍ', Player._numBuf === '1');
  Player.onKey({ key: '2', preventDefault() {} });
  T('«12» ينتقل فوراً (14 قناة)', Player.current && Player.current.id === 'X7');
  // PageUp/PageDown = قناة تالية/سابقة
  Player.onKey({ key: 'PageUp', preventDefault() {} });
  T('PageUp = القناة التالية', Player.current.id === 'X8');
  Player.onKey({ key: 'PageDown', preventDefault() {} });
  T('PageDown = السابقة', Player.current.id === 'X7');
  // BrowserBack في المشغل = رجوع
  let bb = 0; const oldBack = App.back.bind(App); App.back = () => { bb++; oldBack(); };
  documentMock._listeners['keydown'].forEach(f => f({ key: 'BrowserBack', target: {}, preventDefault() {} }));
  App.back = oldBack;
  T('BrowserBack بالريموت = رجوع من المشغل', bb === 1);

  console.log(`\n═══ ${pass} نجح ✓ | ${fail} فشل ✗ ═══`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('خطأ:', e); process.exit(2); });
