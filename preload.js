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
  // Supabase config
  getSupabase: () => ipcRenderer.invoke('get-supabase-config'),
  // SQLite
  sqliteLoad:    (key)        => ipcRenderer.invoke('sqlite-load', { key }),
  sqliteSave:    (key, value) => ipcRenderer.invoke('sqlite-save', { key, value }),
  sqliteLoadAll: (keys)       => ipcRenderer.invoke('sqlite-load-all', { keys }),
  sqliteSize:    ()           => ipcRenderer.invoke('sqlite-size'),
  sqliteDelete:  (key)        => ipcRenderer.invoke('sqlite-delete', { key }),

  // Notificaciones y sistema
  notifyStock: (name)    => ipcRenderer.send('notify-stock', name),
  notifyOrder: (msg)     => ipcRenderer.send('notify-order', msg),
  notifyConnection: (d)  => ipcRenderer.send('notify-connection', d),
  saveVentaPendiente: (r) => ipcRenderer.send('save-venta-pendiente', r),
  deleteVentaPendiente: (id) => ipcRenderer.send('delete-venta-pendiente', id),
  getVentasPendientes: () => ipcRenderer.invoke('get-ventas-pendientes'),
  countVentasPendientes: () => ipcRenderer.invoke('count-ventas-pendientes'),
  updateTrayBadge: (d)   => ipcRenderer.send('update-tray-badge', d),

  // PIN / auth
  pinCheck:  (pin)       => ipcRenderer.invoke('verify-pin', pin),
  pinSet:    (data)      => ipcRenderer.invoke('change-pin', data),
  pinRemove: ()          => { console.warn("[PIN] pinRemove no implementado"); return Promise.resolve({ ok: false, error: "no implementado" }); },
  pinExists: ()          => ipcRenderer.invoke('pin-exists'),

  // Splash
  splashProgress: (d)    => ipcRenderer.send('splash-progress', d),
  splashDone: ()         => ipcRenderer.send('splash-done'),
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
