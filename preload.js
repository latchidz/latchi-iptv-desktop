// جسر IPC آمن
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('latchi', {
  deviceId: () => ipcRenderer.invoke('device-id'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  openExternal: (u) => ipcRenderer.invoke('open-external', u),
  // 💾 كاش القرص — التحميل مرة واحدة فقط
  cacheGet: (k) => ipcRenderer.invoke('cache-get', k),
  cacheSet: (k, v, ttl) => ipcRenderer.invoke('cache-set', k, v, ttl),
  cacheClear: () => ipcRenderer.invoke('cache-clear'),
  // 📋 v1.0: زر اللصق المباشر
  readClipboard: () => ipcRenderer.invoke('clipboard-read')
});
