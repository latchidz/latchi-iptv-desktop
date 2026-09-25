// ═══ اختبار مركز الحسابات v1.1.1 — محاكاة DOM كاملة ═══
const fs = require('fs');
const vm = require('vm');

// ─── DOM مصغّر ───
const els = {};
function makeEl(id) {
  return {
    id, innerHTML: '', textContent: '', className: '', value: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, style: {}, onclick: null, children: [], offsetParent: true,
    addEventListener() {}, appendChild(c) { this.children.push(c); },
    closest() { return null; }, querySelector() { return null; },
    querySelectorAll() { return []; }, scrollIntoView() {},
  };
}
const document = {
  getElementById: (id) => els[id] || (els[id] = makeEl(id)),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (t) => makeEl(t),
  exitFullscreen() {}, fullscreenElement: null,
};
const storage = {};
const localStorage = { getItem: k => storage[k] ?? null, setItem: (k, v) => storage[k] = String(v), removeItem: k => delete storage[k], key: i => Object.keys(storage)[i], get length() { return Object.keys(storage).length; } };

// ─── LatchiAPI وهمي + window.latchi ───
const LatchiAPI = {
  stats: () => ({ live: 10, movies: 5, series: 3, unit: 'فئة' }),
  verifyCode: null,  // يُضبط في كل اختبار
  loadSource: null,
};
const window = {
  latchi: { deviceId: async () => 'DEV1', cacheGet: async () => null, cacheSet: async () => {}, cacheClear: async () => {} },
};

const sandbox = { document, localStorage, window, LatchiAPI, setInterval: () => 0, setTimeout: (f) => 0, location: { reload() {} }, URL, console, Date, JSON, Math };
sandbox.window.LatchiAPI = LatchiAPI;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('renderer/app.js', 'utf8'), sandbox);
const App = sandbox.window.App || vm.runInContext('App', sandbox);

let pass = 0, fail = 0;
const T = (n, c) => { c ? (pass++, console.log('  ✓ ' + n)) : (fail++, console.log('  ✗✗✗ ' + n)); };

(async () => {
  console.log('═══ 1) البطاقة في الرئيسية ═══');
  App.src = { type: 'xtream', categories: { live: [], movie: [], series: [] }, account: null };
  App.user = { name: 'تجربة', code: 'LATCHI-1' };
  App.buildHome();
  const homeHtml = els['cards'].children.map(c => c.innerHTML).join('|');
  T('بطاقة «مركز الحسابات» ظهرت في الرئيسية', homeHtml.includes('مركز الحسابات'));

  console.log('═══ 2) المركز فارغ في البداية ═══');
  App.buildAccounts();
  T('حالة الفراغ معروضة', els['accountsBody'].innerHTML.includes('لا توجد حسابات محفوظة'));
  T('حقلا الإضافة موجودان (كود + M3U)', els['accountsBody'].innerHTML.includes('accCodeInput') && els['accountsBody'].innerHTML.includes('accM3uInput'));

  console.log('═══ 3) إضافة بكود تفعيل (ناجح) ═══');
  LatchiAPI.verifyCode = async () => ({ ok: true, name: 'إسكندر VIP', url: 'http://xt:80/u/p', expires: '2027-01-01' });
  LatchiAPI.loadSource = async () => ({ type: 'xtream', categories: { live: [{id:'1',name:'بث'}], movie: [], series: [] }, account: null });
  document.getElementById('accCodeInput').value = 'LATCHI-777';
  const okCode = await App.applyCode('LATCHI-777', document.getElementById('accMsg'));
  T('applyCode نجح', okCode === true);
  const list1 = App.getAccounts();
  T('الحساب حُفظ في القائمة (1)', list1.length === 1 && list1[0].kind === 'code' && list1[0].label.includes('إسكندر'));

  console.log('═══ 4) إضافة رابط M3U ═══');
  const okM3u = await App.applyM3u('http://mylist.tv/playlist.m3u', document.getElementById('accMsg'));
  T('applyM3u نجح', okM3u === true);
  const list2 = App.getAccounts();
  T('صار حسابان (كود + M3U)', list2.length === 2 && list2.some(a => a.kind === 'm3u' && a.label.includes('mylist.tv')));

  console.log('═══ 5) كود خاطئ يرفض بلا حفظ ═══');
  LatchiAPI.verifyCode = async () => ({ ok: false, message: 'الكود غير صالح' });
  const badMsg = makeEl('badMsg');
  const okBad = await App.applyCode('WRONG', badMsg);
  T('رفض مع رسالة خطأ', okBad === false && badMsg.textContent.includes('غير صالح'));
  T('لم يُحفظ شيء جديد', App.getAccounts().length === 2);

  console.log('═══ 6) العرض: النشط + دخول + حذف ═══');
  storage['source_url'] = 'http://xt:80/u/p';    // الكود نشط
  App.buildAccounts();
  const html = els['accountsBody'].innerHTML;
  T('الحساب النشط معلّم ✓', html.includes('acc-active') && html.includes('✓ نشط'));
  T('زر دخول للمسجل M3U', html.includes('data-acc-go'));
  T('زر حذف للكل', (html.match(/data-acc-del/g) || []).length === 2);
  // حذف حساب M3U
  const m3uAcc = App.getAccounts().find(a => a.kind === 'm3u');
  App.saveAccounts(App.getAccounts().filter(a => a.id !== m3uAcc.id));
  T('الحذف يعمل (بقي 1)', App.getAccounts().length === 1);

  console.log('═══ 7) الدخول لحساب محفوظ (تبديل) ═══');
  LatchiAPI.loadSource = async (url) => { App.src = { type: 'm3u', live: [{id:'L1',name:'ch'}], movies: [], series: [] }; return App.src; };
  const r = await App.loadSource('http://xt:80/u/p', false, 'http://xt:80/u/p');
  T('loadSource يحدّث source_url (تبديل)', storage['source_url'] === 'http://xt:80/u/p');

  console.log('═══ 8) الحد الأقصى 20 حساباً (مثل الهاتف) ═══');
  for (let i = 0; i < 25; i++) App.rememberAccount('m3u', 'قائمة ' + i, 'http://x' + i + '.tv/m3u');
  T('القائمة مقصوصة عند 20', App.getAccounts().length === 20);
  T('الأحدث أولاً', App.getAccounts()[0].label === 'قائمة 24');

  console.log('═══ 9) onShown يبني المركز ═══');
  App.show('accounts');
  T('البناء التلقائي عند فتح الشاشة', els['accountsBody'].innerHTML.includes('الحسابات المحفوظة'));

  console.log('\n═══ النتيجة: ' + pass + ' نجح ✓ | ' + fail + ' فشل ✗ ═══');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('خطأ:', e); process.exit(2); });
