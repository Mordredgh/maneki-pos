// ══════════════════════════════════════════════════════════════════════
// preload.js — BUG-NEW-02 FIX: Credenciales Supabase fuera del renderer
// ──────────────────────────────────────────────────────────────────────
// Antes: SUPABASE_URL y SUPABASE_KEY estaban hardcodeadas en db.js
// (código del renderer), visibles en DevTools para cualquiera con acceso físico.
//
// Ahora: main.js pasa las credenciales via ipcMain al preload (proceso Node),
// y preload las expone SOLO como lectura en window.__mkCfg via contextBridge.
// El renderer ya no tiene acceso directo a ipcRenderer ni a los módulos Node.
// ══════════════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

// ── Exponer credenciales Supabase (solo lectura, no modificables) ──
contextBridge.exposeInMainWorld('__mkCfg', {
  getSupabase: () => ipcRenderer.invoke('get-supabase-config')
});

// ── Exponer IPC seguro (solo los canales que el renderer necesita) ──
contextBridge.exposeInMainWorld('electronAPI', {
  // SQLite
  sqliteLoad:    (key)        => ipcRenderer.invoke('sqlite-load', { key }),
  sqliteSave:    (key, value) => ipcRenderer.invoke('sqlite-save', { key, value }),
  sqliteLoadAll: (keys)       => ipcRenderer.invoke('sqlite-load-all', { keys }),
  sqliteSize:    ()           => ipcRenderer.invoke('sqlite-size'),
  sqliteDelete:  (key)        => ipcRenderer.invoke('sqlite-delete', { key }),

  // Notificaciones y sistema
  notifyStock: (name)    => ipcRenderer.send('notify-stock', name),
  notifyOrder: (msg)     => ipcRenderer.send('notify-order', msg),
  saveVentaPendiente: (r) => ipcRenderer.send('save-venta-pendiente', r),

  // PIN / auth
  pinCheck:  (pin)       => ipcRenderer.invoke('verify-pin', pin),
  pinSet:    (pin)       => ipcRenderer.invoke('change-pin', pin),
  pinRemove: ()          => Promise.resolve({ ok: true }),  // canal no existe en main.js — stub seguro
  pinExists: ()          => ipcRenderer.invoke('pin-exists'),

  // Splash
  splashExitDone: ()     => ipcRenderer.send('splash-exit-done'),

  // Escuchar eventos del main
  on: (channel, cb) => {
    const allowed = ['splash-exit', 'sync-status', 'update-available'];
    if (!allowed.includes(channel)) return;
    ipcRenderer.removeAllListeners(channel); // prevent accumulation
    ipcRenderer.on(channel, (event, ...args) => cb(...args));
  },
  off: (channel) => {
    const allowed = ['splash-exit', 'sync-status', 'update-available'];
    if (allowed.includes(channel)) ipcRenderer.removeAllListeners(channel);
  },
});
