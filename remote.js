// 📱 v1.0.8: خادم الريموت — تطبيق الهاتف يتحكم في الحاسوب عبر الواي فاي المنزلي
// بلا أي اعتماديات خارجية: http + dgram من Node فقط.
//   - HTTP  :37777 → /ping (تعريف) | /status (الحالة) | /cmd (أوامر)
//   - UDP   :37778 → بث «LATCHI_REMOTE_DISCOVER» من الهاتف → يرد الخادم بنفسه (اكتشاف تلقائي)
// الحماية: رمز PIN (اختياري — يُطلب من الهاتف في كل طلب عبر ترويسة x-pin).

const http = require('http');
const dgram = require('dgram');
const os = require('os');

const RemoteServer = {
  httpSrv: null,
  udpSock: null,
  pin: '',
  port: 37777,
  discPort: 37778,
  state: { screen: 'home', nowPlaying: '', volume: 1, muted: false },   // آخر حالة دفعها الرندرر
  clients: 0,
  getWin: null,          // () => BrowserWindow

  running() { return !!this.httpSrv; },

  start({ port, pin, getWin }) {
    if (this.httpSrv) return { ok: true, already: true };
    this.port = port || 37777;
    this.pin = String(pin || '');
    this.getWin = getWin;
    const self = this;

    // ─── HTTP ───
    this.httpSrv = http.createServer((req, res) => {
      const send = (code, obj) => {
        const body = JSON.stringify(obj);
        res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end(body);
      };
      let ip = req.socket.remoteAddress || '';
      if (ip) self.clients = Math.max(self.clients, 0) + 0;   // (عدّاد تقريبي — يُحدَّث بالأوامر)
      if (req.method === 'GET' && req.url.startsWith('/ping')) {
        return send(200, { ok: true, app: 'LATCHI_REMOTE', name: os.hostname(), pin: !!self.pin, ver: '1.0.8' });
      }
      // ما تبقى يتطلب PIN إن كان مفعّلاً
      if (self.pin) {
        const h = (req.headers['x-pin'] || req.headers['X-Pin'] || '').trim();
        if (h !== self.pin) return send(401, { ok: false, error: 'bad_pin' });
      }
      if (req.method === 'GET' && req.url.startsWith('/status')) {
        return send(200, { ok: true, state: self.state });
      }
      if (req.method === 'POST' && req.url.startsWith('/cmd')) {
        let buf = '';
        req.on('data', c => { buf += c; if (buf.length > 2048) req.destroy(); });
        req.on('end', () => {
          try {
            const cmd = JSON.parse(buf || '{}');
            const w = self.getWin && self.getWin();
            if (!w || w.isDestroyed()) return send(503, { ok: false, error: 'no_window' });
            w.webContents.send('remote-key', cmd);
            self.clients++;
            return send(200, { ok: true });
          } catch (e) { return send(400, { ok: false, error: 'bad_json' }); }
        });
        return;
      }
      send(404, { ok: false, error: 'not_found' });
    });
    this.httpSrv.on('error', (e) => { try { console.error('remote http error:', e.message); } catch (x) {} });

    // ─── اكتشاف UDP ───
    try {
      this.udpSock = dgram.createSocket('udp4');
      this.udpSock.on('error', () => {});
      this.udpSock.on('message', (msg, rinfo) => {
        try {
          if (String(msg).trim() !== 'LATCHI_REMOTE_DISCOVER') return;
          const reply = Buffer.from(JSON.stringify({
            app: 'LATCHI_REMOTE', name: os.hostname(), port: self.port, pin: !!self.pin
          }));
          self.udpSock.send(reply, rinfo.port, rinfo.address);
        } catch (e) {}
      });
      this.udpSock.bind(this.discPort);
    } catch (e) { /* الاكتشاف اختياري — HTTP يبقى شغالاً */ }

    this.httpSrv.listen(this.port, '0.0.0.0');
    return { ok: true };
  },

  stop() {
    try { if (this.httpSrv) this.httpSrv.close(); } catch (e) {}
    try { if (this.udpSock) this.udpSock.close(); } catch (e) {}
    this.httpSrv = null; this.udpSock = null; this.clients = 0;
    return { ok: true };
  },

  pushState(s) {
    if (s && typeof s === 'object') this.state = {
      screen: String(s.screen || this.state.screen),
      nowPlaying: String(s.nowPlaying || ''),
      volume: (typeof s.volume === 'number') ? s.volume : this.state.volume,
      muted: !!s.muted
    };
  },

  lanIps() {
    const out = [];
    try {
      const ifs = os.networkInterfaces();
      for (const name of Object.keys(ifs)) {
        for (const it of ifs[name] || []) {
          if (it.family === 'IPv4' && !it.internal) out.push(it.address);
        }
      }
    } catch (e) {}
    return out;
  }
};

module.exports = RemoteServer;
