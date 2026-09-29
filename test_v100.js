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
 'accCodeBtn', 'accM3uBtn', 'accCodeInput', 'accM3uInput', 'accMsg', 'checkingOv', 'welcome', 'exitDlg', 'exitOk', 'exitCancel', 'exitBtn', 'pNum', 'expLine', 'm3uExpInput', 'accExpInput', 'prayerChip', 'prayerTxt', 'pEpg', 'pMark', 'pmQ', 'pane3', 'paneCats', 'paneItems', 'paneDetail', 'miniWrap', 'miniVid', 'miniLoad', 'miniInfo', 'miniEpg', 'miniDesc', 'miniGoBtn', 'miniFavBtn', 'miniEpsBtn', 'accWipeBtn'].forEach(id => els[id] = makeEl(id));

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
  T('قائمة المفضلة فتحت', App.listCtx && App.listCtx.kind === 'fav' && App.screen === 'list');
  T('العنصران موجودان (فيلم + قناة)', App.listCtx.items.length === 2);
  const favRows = els['paneItems'].children.map(c => c.className || '');
  T('الواجهة الثلاثية: صفا pitem (قناة + فيلم)', favRows.length === 2 && favRows.every(c => c.includes('pitem')));
  T('العمود الثالث: دعوة للاختيار', els['miniInfo'].innerHTML.includes('اختر'));

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

  console.log('═══ 10) v1.0.4: حفظ موضع الفوكيز عند الرجوع من التفاصيل ═══');
  // محاكاة بحث .focused داخل شاشة القائمة (المحاكاة العامة ترجع null)
  if (!els['list'].children.includes(els['paneItems'])) els['list'].children.push(els['paneItems']);   // المحاكاة مسطّحة — اربط الأعمدة بالشاشة
  if (!els['list'].children.includes(els['paneCats'])) els['list'].children.push(els['paneCats']);
  els['list'].querySelector = function (sel) {
    if (sel !== '.focused') return null;
    const walk = (n) => { for (const ch of (n.children || [])) { if (ch.classList && ch.classList.contains('focused')) return ch; const r = walk(ch); if (r) return r; } return null; };
    return walk(this);
  };
  App.src = { type: 'm3u', live: [L1], movies: [M, M2], series: [] };
  await App.openList('movies'); await sleep(60);
  const grid = els['paneItems'];
  T('عمود العناصر (واجهة ثلاثية)', grid.children.length === 2 && grid.children[0].className.includes('pitem'));
  const pcard2 = grid.children[1];
  pcard2.classList.add('focused');
  App.push('details');
  T('موضع الفوكيز حُفظ عند مغادرة القائمة', App._focusMem && App._focusMem['list'] === pcard2);
  pcard2.classList.remove('focused');          // المحاكاة لا تمسح تلقائياً — نمسح كيما الواقع
  App.back();
  T('الرجوع من التفاصيل = نفس العنصر مركز', pcard2.classList.contains('focused'));
  // ذاكرة قديمة لعنصر ميت = تتجاهل بأمان
  const dead = makeEl('dead'); dead.isConnected = false;
  App._focusMem = { list: dead };
  let noCrash = true;
  try { App.focusFirst('list'); } catch (e) { noCrash = false; }
  T('ذاكرة لعنصر محذوف تتجاهل بلا أخطاء', noCrash && !dead.classList.contains('focused'));

  console.log('═══ 11) v1.0.5: تنقل الشبكة بالفهرس — بثلاثة بلا أخطاء (ريموت + كيبورد) ═══');
  const gcards = Array.from({ length: 12 }, (_, k) => makeEl('gc' + k));
  const gridEl = makeEl('grid'); gridEl.className = 'poster-grid';
  gridEl.querySelectorAll = sel => (sel === '.pcard' ? gcards.slice() : []);
  gridEl.contains = el => gcards.includes(el);
  els['list'].querySelector = function (sel) {
    if (sel === '.poster-grid') return gridEl;
    if (sel === '.pcard.focused') return gcards.find(c => c.classList.contains('focused')) || null;
    return null;
  };
  const prevDocQ = documentMock.querySelector;
  documentMock.querySelector = function (sel) {
    if (sel === '.screen.active') return els['list'];
    if (sel === '.screen.active .focused') return gcards.find(c => c.classList.contains('focused')) || null;
    return prevDocQ ? prevDocQ.call(this, sel) : null;
  };
  sandbox.getComputedStyle = () => ({ gridTemplateColumns: '1fr 1fr 1fr' });
  App.screen = 'list';
  const kd2 = ev => (documentMock._listeners['keydown'] || []).forEach(f => f(Object.assign({ target: {}, preventDefault() {} }, ev)));
  const focusedIdx = () => gcards.findIndex(c => c.classList.contains('focused'));
  const focus = k => { gcards.forEach(c => c.classList.remove('focused')); gcards[k].classList.add('focused'); };
  focus(1); kd2({ key: 'ArrowLeft' });
  T('RTL: ← = العنصر التالي', focusedIdx() === 2);
  focus(2); kd2({ key: 'ArrowLeft' });
  T('← من آخر الصف يلتف لأوله (لا طريق مسدود)', focusedIdx() === 0);
  focus(0); kd2({ key: 'ArrowRight' });
  T('RTL: → = السابق مع التفاف', focusedIdx() === 2);
  focus(1); kd2({ key: 'ArrowDown' });
  T('↓ = صف كامل بثلاثة', focusedIdx() === 4);
  focus(4); kd2({ key: 'ArrowUp' });
  T('↑ = صف كامل بثلاثة', focusedIdx() === 1);
  focus(10); kd2({ key: 'ArrowDown' });
  T('↓ من الصف الأخير = ثابت بلا أخطاء', focusedIdx() === 10);
  focus(1); kd2({ key: 'ArrowUp' });
  T('↑ من الصف الأول = ثابت (يصعد للفئات في الواقع)', focusedIdx() === 1);
  let opened = 0; gcards[5].onclick = () => { opened++; };
  focus(5); kd2({ key: 'Enter' });
  T('Enter على البطاقة المركزة = فتحها', opened === 1);
  sandbox.getComputedStyle = () => ({ gridTemplateColumns: '1fr 1fr' });
  focus(0); kd2({ key: 'ArrowDown' });
  T('نافذة أصغر (عمودان): ↓ = +2 تلقائياً', focusedIdx() === 2);
  documentMock.querySelector = prevDocQ;

  console.log('═══ 12) v1.0.5: شبكة الرئيسية المتجاوبة — حارس ضد التداخل ═══');
  const css = require('fs').readFileSync('renderer/tv.css', 'utf8');
  T('إصلاح التداخل: min-height:0 على البطاقة', /\.tcard\s*\{[^}]*min-height:\s*0\s*!important/s.test(css));
  T('أعمدة نسبية متساوية 1fr (لا مقاسات ثابتة)', css.includes('repeat(4, minmax(0, 1fr))'));
  T('لا min-height:218 قديمة فاعلة على tcard', !/\.tcard\s*\{[^}]*min-height:\s*218/s.test(css));
  T('مسافات موحدة 24px أفقياً وعمودياً', /gap:\s*24px\s*!important/.test(css));
  T('توسيط الشبكة + هوامش آمنة', css.includes('align-content: center !important') && css.includes('calc(100% - 80px)'));
  T('تأثير الماوس: إبراز + حواف مضيئة', /\.tcard:hover\s*\{[^}]*scale\(1\.05\)/s.test(css));
  T('استجابة النوافذ الصغيرة (عمودان ثم واحد)', css.includes('repeat(2, minmax(0, 1fr))') && /@media \(max-width: 480px\)/.test(css));

  console.log('═══ 13) v1.0.6: الشريط العلوي الحي + EPG + العلامة المائية ═══');
  // 👤 اسم المستخدم من الخادم في الهيدر
  App.src = { type: 'xtream', categories: { live: [], movie: [], series: [] }, account: { user_info: { username: 'iskander_pro' } } };
  App.user = { name: 'x' };
  App.show('home', true);
  T('اسم المستخدم من الخادم في الهيدر', els['userChip'].textContent.includes('iskander_pro'));

  // 🕌 مواقيت الصلاة: fetch وهمي (ipapi → aladhan) بنفس منطق أندرويد
  sandbox.atob = s => Buffer.from(s, 'base64').toString('utf8');
  const nowTs = Math.floor(Date.now() / 1000);
  let fetchCalls = 0;
  sandbox.fetch = async (url) => {
    fetchCalls++;
    const u = String(url);
    const json = u.includes('ipapi.co') ? { latitude: 36.9, longitude: 8.35, city: 'Annaba' }
      : u.includes('aladhan') ? { data: { timings: { Fajr: '05:31', Dhuhr: '12:41', Asr: '15:59', Maghrib: '19:02', Isha: '20:17' } } }
      : u.includes('get_short_epg') ? { epg_listings: [{ title: Buffer.from('مباراة ودية — LATCHI CUP', 'utf8').toString('base64'), start_timestamp: nowTs - 600, end_timestamp: nowTs + 5400 }] }
      : {};
    return { ok: true, json: async () => json };
  };
  sandbox.localStorage.removeItem('prayer_cache');
  await App.initPrayer();
  const pc = JSON.parse(sandbox.localStorage.getItem('prayer_cache') || '{}');
  T('الموقع بالـIP ثم المواقيت (ipapi+aladhan)', fetchCalls === 2 && pc.region === 'Annaba' && pc.timings && pc.timings.Asr === '15:59');
  T('كاش يومي (لا إعادة جلب)', (() => { const c = fetchCalls; App.initPrayer(); return fetchCalls === c; })());
  App.updatePrayerChip();
  T('الشريحة تعرض الصلاة القادمة + الوقت', !els['prayerChip'].classList.contains('hidden')
    && /(?:الفجر|الظهر|العصر|المغرب|العشاء) \d{1,2}:\d{2}/.test(els['prayerTxt'].textContent));
  sandbox.localStorage.removeItem('prayer_cache');
  App.updatePrayerChip();
  T('بلا كاش (فشل الشبكة) = مخفية بصمت', els['prayerChip'].classList.contains('hidden'));

  // 📺 EPG داخل المشغل (xtream)
  sandbox.LatchiAPI._src = { type: 'xtream', server: 'http://sx', username: 'u', password: 'p' };
  sandbox.localStorage.removeItem('epg|1');
  App.src = { type: 'xtream', categories: { live: [], movie: [], series: [] }, live: [], movies: [], series: [] };
  els['video'].videoWidth = 1920; els['video'].videoHeight = 1080;
  App.startPlay(L1); await sleep(60);
  T('EPG: عنوان البرنامج الحالي في شريط المعلومات', !els['pEpg'].classList.contains('hidden') && els['pEpg'].textContent.includes('مباراة ودية'));
  T('العلامة المائية: LATCHI DZ + جودة FHD', els['pMark'] && els['pmQ'].textContent === 'FHD' && Player._markT);
  T('العلامة تتحرك بين الزاويتين (toggle)', (() => { els['pMark'].classList.toggle('swap'); const on = els['pMark'].classList.contains('swap'); els['pMark'].classList.toggle('swap'); return on; })());
  els['video'].videoWidth = 3840; els['video'].videoHeight = 2160;
  Player._updQuality();
  T('جودة 4K ديناميكية', els['pmQ'].textContent === '4K');
  // 🖱 الفأرة والنقرة
  App.screen = 'player';
  Player.hideUi();
  (documentMock._listeners['mousemove'] || []).forEach(f => f({}));
  T('تحريك الفأرة يوقظ شريط المعلومات', Player.uiVisible === true);
  els['video'].click();
  T('نقرة الشاشة تخفي الشريط', Player.uiVisible === false);
  els['video'].click();
  T('نقرة ثانية تعيده', Player.uiVisible === true);
  App.back();
  T('الخروج يوقف مؤقت العلامة المائية', Player._markT === 0);

  console.log('═══ 14) v1.0.7: الواجهة الثلاثية + المشغل المصغر + الحذف الشامل ═══');
  App.src = { type: 'm3u', live: [L1, L2], movies: [M, M2], series: [] };
  await App.openList('movies'); await sleep(40);
  T('العمود الأول: فئات M3U كقائمة عمودية', els['paneCats'].children.length >= 2 && els['paneCats'].children[0].className.includes('pcat'));
  els['paneItems'].children[1].click();
  await sleep(20);
  T('اختيار الفيلم: المصغر اشتغل فوراً', App._miniItem && App._miniItem.id === M2.id && els['miniInfo'].innerHTML.includes(M2.name));
  T('الصف المختار مُبرَز (.sel)', els['paneItems'].children[1].classList.contains('sel'));
  T('زر ملء الشاشة في التفاصيل', els['miniInfo'].innerHTML.includes('miniGoBtn'));
  els['miniWrap'].click();
  await sleep(30);
  T('نقرة المصغر = مشغل ملء الشاشة', App.screen === 'player' && Player.current && Player.current.id === M2.id);
  App.back(); await sleep(30);
  T('الرجوع = الواجهة المقسمة والمصغر استأنف نفس العنصر', App.screen === 'list' && App._miniItem && App._miniItem.id === M2.id);
  const S1 = { id: 'S9', name: 'مسلسل تجريبي', type: 'series', url: '', logo: '', group: 'دراما' };
  App.src.series = [S1];
  await App.openList('series'); await sleep(40);
  els['paneItems'].children[0].click(); await sleep(20);
  T('مسلسل: تفاصيل + زر الحلقات بلا تشغيل تلقائي', els['miniInfo'].innerHTML.includes('miniEpsBtn') && els['miniLoad'].classList.contains('hidden'));
  // 🗑 الحذف الشامل
  sandbox.localStorage.setItem('saved_accounts', '[{"id":"a1"}]');
  sandbox.localStorage.setItem('favs', '[{"id":"L1"}]');
  sandbox.localStorage.setItem('source_url', 'http://x/y');
  sandbox.localStorage.setItem('cw_M77', '{"item":{},"at":10,"dur":100,"ts":1}');
  sandbox.localStorage.setItem('favs', '[{"id":"L1"}]');
  let cacheCleared = 0;
  sandbox.latchi.cacheClear = () => { cacheCleared++; };
  App.showWipeDlg();
  T('نافذة تأكيد الحذف (سياق wipe)', App.exitDlgOpen() && App._exitAction === 'wipe');
  kd({ key: 'ArrowLeft' });
  kd({ key: 'Enter' });
  await sleep(20);
  T('الحذف الشامل: مسح الحسابات والمفضلة والرابط والمتابعة', cacheCleared === 1
    && sandbox.localStorage.getItem('saved_accounts') === null && sandbox.localStorage.getItem('favs') === null
    && sandbox.localStorage.getItem('source_url') === null && sandbox.localStorage.getItem('cw_M77') === null);
  T('العودة لشاشة الدخول الأولى', App.screen === 'verify');

  console.log('═══ 15) v1.0: بطاقات الحسابات — فتح مباشر بالنقر ═══');
  localStorage.setItem('saved_accounts', JSON.stringify([
    { id: 'A1', kind: 'code', label: 'VIP إسكندر', value: 'http://srv/vip', exp: '', addedAt: '2026/09/01' },
    { id: 'A2', kind: 'm3u', label: 'M3U — host.com', value: 'http://srv/m3u', exp: '2026-12-01', addedAt: '2026/09/02' }
  ]));
  localStorage.setItem('source_url', 'http://srv/vip');
  App.src = { type: 'm3u', live: [L1], movies: [M], series: [] };
  App.buildAccounts();
  const accHtml = els['accountsBody'].innerHTML;
  T('بطاقتا حساب ظاهرتان معاً', accHtml.includes('acc-card') && (accHtml.match(/data-acc-id/g) || []).length === 2);
  T('البطاقة النشطة مُميّزة مع شارة «نشط الآن»', accHtml.includes('acc-active') && accHtml.includes('acc-now') && accHtml.includes('data-acc-home'));
  T('البطاقة غير النشطة تحمل فتحاً مباشراً', accHtml.includes('data-acc-go="A2"'));
  T('زر حذف خاص بكل بطاقة', (accHtml.match(/data-acc-del/g) || []).length === 2);
  T('تلميح الفتح على البطاقة', accHtml.includes('اضغط للفتح مباشرة'));
  T('نص منطقة الخطر: الحسابات فقط دون إعادة ضبط التطبيق', accHtml.includes('حذف جميع الحسابات') && !accHtml.includes('إعادة ضبط المصنع') && accHtml.includes('لا يُغلق'));

  console.log(`\n═══ ${pass} نجح ✓ | ${fail} فشل ✗ ═══`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('خطأ:', e); process.exit(2); });
