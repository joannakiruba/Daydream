const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('daydream', {
  platform: process.platform,
});
