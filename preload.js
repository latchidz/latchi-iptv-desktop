// جسر IPC آمن
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('latchi', {
  deviceId: () => ipcRenderer.invoke('device-id'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  openExternal: (u) => ipcRenderer.invoke('open-external', u),
  // كاش القرص — التحميل مرة واحدة فقط
  cacheGet: (k) => ipcRenderer.invoke('cache-get', k),
  cacheSet: (k, v, ttl) => ipcRenderer.invoke('cache-set', k, v, ttl),
  cacheClear: () => ipcRenderer.invoke('cache-clear'),
  // v1.0: زر اللصق المباشر
  readClipboard: () => ipcRenderer.invoke('clipboard-read'),
  // v1.0.2: ملء الشاشة + الخروج
  setFullscreen: (on) => ipcRenderer.invoke('set-fullscreen', on),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  quitApp: () => ipcRenderer.invoke('app-quit'),
  // v1.0.8: الريموت
  remoteStart: (cfg) => ipcRenderer.invoke('remote-start', cfg),
  remoteStop: () => ipcRenderer.invoke('remote-stop'),
  remoteState: (st) => ipcRenderer.send('remote-state', st),
  onRemoteKey: (cb) => ipcRenderer.on('remote-key', (_e, cmd) => cb(cmd))
});
