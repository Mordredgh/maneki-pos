// ══════════════════════════════════════════════════════════════════════
// preload-splash.js — Preload seguro para la splash screen
// ──────────────────────────────────────────────────────────────────────
// SEC-FIX: splash tenía nodeIntegration:true — expuesto a RCE si hubiera
// XSS en splash.html. Este preload reemplaza require('electron') directo
// con contextBridge, limitando el acceso a solo los 3 canales que necesita.
// ══════════════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('splashAPI', {
  onProgress: (cb) => ipcRenderer.on('progress-update', (_, data) => cb(data)),
  onExit:     (cb) => ipcRenderer.on('splash-exit',     (_, data) => cb(data)),
  exitDone:   ()   => ipcRenderer.send('splash-exit-done'),
});
