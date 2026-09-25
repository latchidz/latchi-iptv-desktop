// ═══ اختبار v1.1.2: صبر البث الحي + الريموت + التنقل بين القنوات ═══
const fs = require('fs');
const vm = require('vm');

// ─── DOM مصغّر ───
const els = {};
function makeEl(id) {
  return {
    id, innerHTML: '', textContent: '', className: '', value: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, style: {}, onclick: null, children: [], offsetParent: true, readyState: 4,
    addEventListener(ev, fn) { (this['_h' + ev] = this['_h' + ev] || []).push(fn); },
    fire(ev, arg) { (this['_h' + ev] || []).forEach(f => f(arg || {})); },
    closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    appendChild(c) { this.children.push(c); }, scrollIntoView() {}, getBoundingClientRect() { return { right: 100, width: 100 }; },
    paused: true, muted: false, volume: 1, duration: 0, currentTime: 0,
    play() { this.paused = false; return Promise.resolve(); }, pause() { this.paused = true; },
    load() {}, removeAttribute() {}, requestFullscreen() {},
  };
}
const document = {
  getElementById: (id) => els[id] || (els[id] = makeEl(id)),
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener: () => {}, createElement: (t) => makeEl(t),
  createDocumentFragment: () => makeEl('frag'),
  exitFullscreen() {}, fullscreenElement: null, documentElement: makeEl('root'),
};
const storage = {};
const localStorage = { getItem: k => storage[k] ?? null, setItem: (k, v) => storage[k] = String(v), removeItem: k => delete storage[k], key: i => Object.keys(storage)[i], get length() { return Object.keys(storage).length; } };

// ─── Hls وهمي ───
const hlsLog = [];
let hlsErrorCb = null;
class FakeHls {
  constructor(cfg) { this.cfg = cfg; hlsLog.push('new'); }
  loadSource(u) { hlsLog.push('load:' + u.slice(-12)); }
  attachMedia() { hlsLog.push('attach'); }
  on(ev, cb) { if (String(ev).includes('ERROR')) hlsErrorCb = cb; }
  startLoad() { hlsLog.push('startLoad'); }
  recoverMediaError() { hlsLog.push('recoverMedia'); }
  swapAudioCodec() { hlsLog.push('swapAudio'); }
  destroy() { hlsLog.push('destroy'); }
}
FakeHls.isSupported = () => true;
FakeHls.Events = { ERROR: 'ERROR' };
FakeHls.ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' };

const window = {
  latchi: { deviceId: async () => 'D', cacheGet: async () => null, cacheSet: async () => {} },
  Hls: FakeHls,
};
const LatchiAPI = { stats: () => ({ live: 1, movies: 1, series: 1, unit: 'فئة' }), verifyCode: async () => ({ ok: true }), loadSource: async () => ({}) };

// setTimeout فوري (تجاهل التأخيرات) + setInterval يُسجّل فقط
const timers = [];
function fastTimeout(fn, ms) { timers.push({ fn, ms }); fn(); return timers.length; }
function noopInterval(fn) { return 0; }

const sandbox = {
  document, localStorage, window, LatchiAPI, Hls: FakeHls, Date, JSON, Math, URL, console,
  setTimeout: fastTimeout, clearTimeout: () => {}, setInterval: noopInterval, clearInterval: () => {},
  requestAnimationFrame: (f) => f(), location: { reload() {} }, App: undefined, Player: undefined,
};
window.LatchiAPI = LatchiAPI;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('renderer/app.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('renderer/player.js', 'utf8'), sandbox);
const App = vm.runInContext('App', sandbox);
const Player = vm.runInContext('Player', sandbox);
App.src = { type: 'xtream', categories: { live: [], movie: [], series: [] } };
App.user = { name: 'تجربة' };
Player.init();

let pass = 0, fail = 0;
const T = (n, c) => { c ? (pass++, console.log('  ✓ ' + n)) : (fail++, console.log('  ✗✗✗ ' + n)); };
const netErr = () => hlsErrorCb && hlsErrorCb({}, { fatal: true, type: 'networkError', details: 'fragLoadError' });
const medErr = () => hlsErrorCb && hlsErrorCb({}, { fatal: true, type: 'mediaError', details: 'bufferStalled' });
const started = () => els['video'].fire('playing');   // البث اشتغل

console.log('═══ 1) الصبر على البث الحي (المشكلة الرئيسية) ═══');
App._zapList = [{ id: 'L1', name: 'beIN 1', type: 'live', url: 'http://s/live/1.m3u8', urlTs: 'http://s/live/1.ts' }];
App.startPlay(App._zapList[0]);
started();                                  // كنت أتفرج عادي...
hlsLog.length = 0;
for (let i = 0; i < 6; i++) netErr();       // 6 انقطاعات متتالية (قديماً: قفز للمرشح الثاني بعد 2)
const hops = hlsLog.filter(x => x === 'load:').length;
const sl = hlsLog.filter(x => x === 'startLoad').length;
T('6 أخطاء متتالية والبث كان حياً: بلا تغيير صيغة (0 load جديد)', hops === 0);
T('كلها startLoad على نفس البث (صبر)', sl >= 6);
T('ما زلنا على المرشح الأول (m3u8)', Player._candIdx === 0);

console.log('═══ 2) التقطعات المنفصلة لا تتراكم ═══');
netErr(); started(); T('بعد الاستعادة (playing) تُصفَّر العدادات', Player._netRetries === 0);
netErr(); netErr();
T('تقطع جديد بعد استعادة = يبدأ العد من جديد (لم يقفز)', Player._candIdx === 0 && Player._netRetries <= 2);

console.log('═══ 3) قبل أن يشتغل البث: أسرع لكن ليس متسرعاً (4 محاولات ثم بديل) ═══');
App.startPlay({ id: 'L2', name: 'ch2', type: 'live', url: 'http://s/live/2.m3u8', urlTs: 'http://s/live/2.ts' });
hlsLog.length = 0;                          // ملاحظة: _played=false (لم يبدأ)
for (let i = 0; i < 5; i++) netErr();
T('بعد 4 محاولات بلا تشغيل → يجرّب المرشح التالي (.ts)', Player._candIdx === 1);
T('رسالة «تعذر» لم تظهر بعد (لا يزال هناك مرشحون)', !els['pCenter'].textContent.includes('تعذر'));

console.log('═══ 4) خطأ الميديا: خطوتان رسميتان قبل الاستسلام ═══');
App.startPlay({ id: 'L4', name: 'ch4', type: 'live', url: 'http://s/live/4.m3u8', urlTs: 'http://s/live/4.ts' });
started(); hlsLog.length = 0;
medErr(); medErr();
T('recoverMediaError ثم swapAudioCodec (وليس قفزاً فورياً)', hlsLog.includes('recoverMedia') && hlsLog.includes('swapAudio'));
T('ما زلنا على نفس المرشح', Player._candIdx === 0);

console.log('═══ 5) الريموت: ↑↓ قنوات، ←→ صوت ═══');
App._zapList = [
  { id: 'A', name: 'القناة 1', type: 'live', url: 'http://s/a.m3u8' },
  { id: 'B', name: 'القناة 2', type: 'live', url: 'http://s/b.m3u8' },
  { id: 'C', name: 'القناة 3', type: 'live', url: 'http://s/c.m3u8' },
];
App.startPlay(App._zapList[1]);            // أتفرج على القناة 2
Player.onKey({ key: 'ArrowUp', preventDefault() {} });
T('↑ = القناة التالية (صار على 3)', Player.current.id === 'C');
Player.onKey({ key: 'ArrowDown', preventDefault() {} });
Player.onKey({ key: 'ArrowDown', preventDefault() {} });
T('↓↓ = رجع للقناة 1', Player.current.id === 'A');
Player.onKey({ key: 'ArrowDown', preventDefault() {} });
T('↓ في أول قناة = رسالة «لا توجد قناة قبل»', els['pCenter'].textContent.includes('لا توجد قناة'));
els['video'].volume = 0.5;
Player.onKey({ key: 'ArrowRight', preventDefault() {} });
T('→ = رفع الصوت', els['video'].volume > 0.5 + 1e-9);
Player.onKey({ key: 'ArrowLeft', preventDefault() {} });
T('← = خفض الصوت', Math.abs(els['video'].volume - 0.5) < 1e-6);

console.log('═══ 6) التنقل الفوري: بلا دفع مزدوج للمكدس ═══');
const stackLen = App.navStack.length;
Player.onKey({ key: 'ArrowUp', preventDefault() {} });
Player.onKey({ key: 'ArrowUp', preventDefault() {} });
T('3 تنقلات متتالية = المكدس لم يتضخم', App.navStack.length === stackLen);
App.back();
T('رجوع واحد يكفي للعودة للقائمة', App.screen !== 'player');

console.log('═══ 7) حلقات المسلسل: معرفات موحدة ═══');
App._zapList = [
  { id: 'S5_0', name: 'ح1', type: 'movie', url: 'http://s/e1.mp4' },
  { id: 'S5_1', name: 'ح2', type: 'movie', url: 'http://s/e2.mp4' },
];
App.startPlay(App._zapList[0]);
Player.onKey({ key: 'ArrowUp', preventDefault() {} });
T('↑ داخل المسلسل = الحلقة التالية', Player.current.id === 'S5_1' && Player.current.name === 'ح2');

console.log('\n═══ النتيجة: ' + pass + ' نجح ✓ | ' + fail + ' فشل ✗ ═══');
process.exit(fail ? 1 : 0);
