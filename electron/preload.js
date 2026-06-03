const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkOnline: () => ipcRenderer.invoke('check-online'),
  isElectron: true,
});
