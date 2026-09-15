// جسر IPC آمن
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('latchi', {
  deviceId: () => ipcRenderer.invoke('device-id'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  openExternal: (u) => ipcRenderer.invoke('open-external', u)
});
