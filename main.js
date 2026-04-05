const {
  app, BrowserWindow, ipcMain,
  Notification, Tray, Menu, screen,
  globalShortcut, nativeImage
} = require('electron');

// ═══════════════════════════════════════════════════════════════════════
//  OPTIMIZACIONES DE HARDWARE
//  Ryzen 7 5700x · RTX 3060 12 GB · 32 GB DDR4 3200 · M.2 NVMe 1 TB
//  Deben aplicarse ANTES de app.ready — van al inicio del archivo
// ═══════════════════════════════════════════════════════════════════════

// ── Silenciar advertencia cosmética de file:// origins (inofensiva en Electron) ─
app.commandLine.appendSwitch('allow-file-access-from-files');

// ── RTX 3060: GPU Rasterization y compositing ────────────────────────
// Fuerza que Chromium use la GPU para pintar, componer y animar la UI.
// Sin esto Electron usa software rendering (CPU) → mucho más lento.
app.commandLine.appendSwitch('enable-gpu-rasterization');            // tiles de la página pintados en GPU
app.commandLine.appendSwitch('enable-zero-copy');                    // texturas directo a VRAM sin pasar por CPU RAM
app.commandLine.appendSwitch('enable-hardware-overlays', 'single-fullscreen,single-on-top,underlay');
app.commandLine.appendSwitch('ignore-gpu-blocklist');                // ignorar lista negra de drivers (RTX 30xx no la necesita)
app.commandLine.appendSwitch('enable-oop-rasterization');            // rasterización en proceso separado → UI principal más fluida
app.commandLine.appendSwitch('use-gl', 'desktop');                   // OpenGL nativo de Windows, no ANGLE emulado

// ── RTX 3060: Canvas y video acelerado ──────────────────────────────
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');        // canvas HTML dibujado por la GPU
app.commandLine.appendSwitch('enable-accelerated-video-decode');     // decode de imágenes/video en hardware

// ── Ryzen 7 5700x: Threads para rasterización ───────────────────────
// 8 cores / 16 threads — dar más workers a Chromium para pintar en paralelo
app.commandLine.appendSwitch('num-raster-threads', '4');             // 4 threads dedicados a rasterizar
app.commandLine.appendSwitch('enable-main-frame-before-activation'); // frame listo antes de animar — menos jank

// ── 32 GB DDR4 3200: Heap de V8 y caché de assets ───────────────────
// Por default V8 usa ~1.4 GB. Con 32 GB podemos darle 4 GB al motor JS.
// Más heap = menos pauses de GC = UI más suave sin interrupciones.
app.commandLine.appendSwitch('js-flags', [
  '--max-old-space-size=4096',     // heap viejo de V8: 4 GB (default ~1.4 GB)
  '--max-semi-space-size=128',     // semi-space más grande → GC minor menos frecuente
  '--turbo-fast-api-calls',        // llamadas nativas más rápidas
  '--no-expose-wasm-performance-hints'
].join(' '));

// ── M.2 NVMe: Caché de disco para assets ─────────────────────────────
// 512 MB de caché HTTP/assets en disco. El M.2 lee a 3500 MB/s,
// así que cachear imágenes y recursos aquí es casi tan rápido como RAM.
app.commandLine.appendSwitch('disk-cache-size', String(512 * 1024 * 1024));
app.commandLine.appendSwitch('media-cache-size', String(256 * 1024 * 1024));

// ── Rendering sin límites artificiales ──────────────────────────────
app.commandLine.appendSwitch('disable-frame-rate-limit');            // sin cap artificial de FPS
app.commandLine.appendSwitch('disable-gpu-vsync');                   // VSync lo maneja el monitor/driver, no Chromium
app.commandLine.appendSwitch('unlimited-storage');                   // sin límite de 5 MB de localStorage

// ── Features de Chromium que mejoran rendering ───────────────────────
app.commandLine.appendSwitch('enable-features', [
  'VaapiVideoDecoder',       // decode de video por hardware
  'CanvasOopRasterization',  // canvas también en proceso separado
  'RawDraw',                 // path de rendering más directo en Windows
  'EnableDrDc'               // Display Render Delegated Compositing
].join(','));

// ════════════════════════════════════════════════════════════════════════
const path    = require('path');
const fs      = require('fs');
const zlib    = require('zlib');
const crypto  = require('crypto');
const sqlite3 = require('sqlite3').verbose();

let tray = null;
let win;
let splash;

// ─── PIN SEGURO (hash SHA-256 con salt único por instalación) ────────
function getPinFilePath()  { return path.join(app.getPath('userData'), 'maneki_pin.hash'); }
function getSaltFilePath() { return path.join(app.getPath('userData'), 'maneki_pin.salt'); }

function getOrCreateSalt() {
  const saltPath = getSaltFilePath();
  try {
    if (fs.existsSync(saltPath)) {
      const s = fs.readFileSync(saltPath, 'utf8').trim();
      if (s.length >= 32) return s;
    }
    const newSalt = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(saltPath, newSalt, { encoding: 'utf8', mode: 0o600 });
    return newSalt;
  } catch(e) {
    return crypto.createHash('sha256').update(app.getPath('userData')).digest('hex');
  }
}

function hashPin(pin) {
  return crypto.createHash('sha256')
    .update(getOrCreateSalt() + String(pin))
    .digest('hex');
}
function loadStoredPinHash() {
  try {
    const f = getPinFilePath();
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  } catch(e) {}
  // FIX #20: no generar PIN default — devolver null para forzar setup en primer uso
  return null;
}
function savePin(newPin) {
  try {
    fs.writeFileSync(getPinFilePath(), hashPin(String(newPin)), { encoding: 'utf8', mode: 0o600 });
    return true;
  } catch(e) {
    console.error('[PIN] Error al guardar:', e.message);
    return false;
  }
}

// ─── PIN BRUTE FORCE PROTECTION ──────────────────────────────────────
const _pinAttempts = { count: 0, lockUntil: 0 };

// ─── HELPER: ícono multiplataforma ───────────────────────────────────
function notifIcon() {
  const candidates = [
    path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(__dirname, 'icon.ico'),
    path.join(__dirname, 'icon.png'),
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return nativeImage.createEmpty();
}

// ─── SINGLE INSTANCE LOCK ────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized() || !win.isVisible()) win.show(); win.focus(); }
  });
}

// ─── BASE DE DATOS LOCAL ──────────────────────────────────────────────
let db = null;
let dbPath = '';

function initDB() {
  dbPath = path.join(app.getPath('userData'), 'maneki_local.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error abriendo SQLite:', err);
  });

  // ════════════════════════════════════════════════════════════════════
  //  SQLite — MODO MÁXIMO RENDIMIENTO
  //  M.2 NVMe 1 TB + 32 GB DDR4 3200 MHz
  //
  //  Estrategia: mantener TODA la DB en RAM (512 MB caché + 2 GB mmap).
  //  El M.2 NVMe tiene latencia ~0.05 ms vs ~0.5 ms de SATA,
  //  pero la DDR4 tiene latencia ~0.05 µs → 1000x más rápido que el M.2.
  //  Una vez que un dato está en el caché, ya no toca el disco nunca más.
  // ════════════════════════════════════════════════════════════════════

  // WAL mode: lecturas y escrituras NO se bloquean entre sí.
  // El WAL file vive en el M.2 — checkpoint a ~3500 MB/s, sin fricción.
  db.run('PRAGMA journal_mode=WAL');

  // NORMAL: fsync solo al hacer WAL checkpoint, no en cada commit.
  // Los datos están seguros: el WAL los protege ante cortes de luz.
  db.run('PRAGMA synchronous=NORMAL');

  // Integridad referencial
  db.run('PRAGMA foreign_keys=ON');

  // ── Caché de páginas: 512 MB en DDR4 ────────────────────────────
  // 512 MB de 32 GB = 1.5% de la RAM total. Completamente insignificante.
  // DDR4 3200 dual-channel → ~50 GB/s de ancho de banda.
  // Una página cacheada se lee en ~10 ns vs ~50,000 ns del M.2 → 5000x.
  // Prefijo '-' = KB: -524288 = 512 MB
  db.run('PRAGMA cache_size=-524288');

  // ── Temporales en RAM ────────────────────────────────────────────
  // ORDER BY, GROUP BY, JOINs y subconsultas crean tablas temporales.
  // MEMORY = nunca tocan el disco — pasan directo por la DDR4.
  // Crítico para los reportes y análisis de Maneki.
  db.run('PRAGMA temp_store=MEMORY');

  // ── Memory-mapped I/O: ventana de 2 GB ──────────────────────────
  // SQLite mapea el archivo DB al espacio de memoria virtual del proceso.
  // Windows gestiona las páginas: cargadas una vez → lecturas a velocidad RAM.
  // 2 GB cubre cualquier DB realista de un POS — incluso con años de historial.
  db.run('PRAGMA mmap_size=2147483648');

  // ── Tamaño de página: 8 KB ───────────────────────────────────────
  // Óptimo para registros con imágenes en base64 (blobs medianos/grandes).
  // 8 KB × 524288 páginas de caché = 4 GB de espacio de caché efectivo.
  // Solo aplica en DBs nuevas — ignorado si el archivo ya existe.
  db.run('PRAGMA page_size=8192');

  // ── WAL checkpoint suave ─────────────────────────────────────────
  // Checkpoint cada 2000 páginas (~16 MB WAL). El M.2 a 3500 MB/s
  // hace el checkpoint en ~5ms — imperceptible.
  db.run('PRAGMA wal_autocheckpoint=2000');

  // ── Optimizar query planner al arranque ─────────────────────────
  // Actualiza estadísticas de índices. Con M.2 tarda < 20 ms.
  // El query planner elige mejores plans de ejecución → queries más rápidas.
  db.run('PRAGMA optimize');

  db.serialize(() => {
    // Tabla legacy — mantener para compatibilidad
    db.run(`CREATE TABLE IF NOT EXISTS productos_local (
      id TEXT PRIMARY KEY, nombre TEXT, precio REAL, stock INTEGER, categoria TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ventas_pendientes (
      id TEXT PRIMARY KEY, folio TEXT, datos TEXT, fecha TEXT
    )`);

    // Almacén universal (reemplaza localStorage)
    db.run(`CREATE TABLE IF NOT EXISTS store_local (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_store_updated ON store_local(updated_at)`);

    db.run(`CREATE TABLE IF NOT EXISTS ventas_historial (
      id TEXT PRIMARY KEY,
      folio TEXT, fecha TEXT, hora TEXT,
      cliente TEXT, total REAL, metodo TEXT,
      datos TEXT, sincronizado INTEGER DEFAULT 0
    )`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas_historial(fecha)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas_historial(cliente)`);

    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY, nombre TEXT, categoria TEXT,
      precio REAL, costo REAL, stock INTEGER, stock_min INTEGER DEFAULT 5,
      sku TEXT, imagen_url TEXT, imagen_base64 TEXT,
      tipo TEXT DEFAULT 'producto', tags TEXT, variantes TEXT,
      notas TEXT, proveedor TEXT, es_kit INTEGER DEFAULT 0,
      kit_componentes TEXT, datos_extra TEXT,
      sincronizado INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    )`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_productos_stock     ON productos(stock)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_productos_nombre    ON productos(nombre)`);

    db.run(`CREATE TABLE IF NOT EXISTS pedidos_local (
      id TEXT PRIMARY KEY, folio TEXT, cliente TEXT,
      fecha TEXT, entrega TEXT, total REAL, anticipo REAL DEFAULT 0,
      status TEXT DEFAULT 'pendiente', datos TEXT,
      sincronizado INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    )`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pedidos_entrega ON pedidos_local(entrega)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pedidos_status  ON pedidos_local(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos_local(cliente)`);

    console.log('✅ SQLite inicializado en:', dbPath);
  });
}

// ─── HELPERS promisify ────────────────────────────────────────────────
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
  });
}
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}

// ─── AUTO-BACKUP DIARIO ───────────────────────────────────────────────
function programarBackupDiario() {
  const backupDir = path.join(app.getPath('userData'), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  function hacerBackup() {
    try {
      if (!dbPath || !db) return;
      const fecha  = new Date().toISOString().split('T')[0];
      const destGz = path.join(backupDir, `maneki_backup_${fecha}.db.gz`);
      if (fs.existsSync(destGz)) return;

      const destRaw = path.join(backupDir, `maneki_backup_${fecha}.db`);
      const safePath = path.resolve(backupDir, path.basename(destRaw));
      if (!safePath.startsWith(path.resolve(backupDir))) {
        console.error('Ruta de backup inválida:', safePath);
        return;
      }
      db.run(`VACUUM INTO ?`, [safePath], (err) => {
        if (err) {
          db.run('PRAGMA wal_checkpoint(TRUNCATE)', [], () => {
            _comprimirYLimpiar(dbPath, destGz, backupDir, null, fecha);
          });
          return;
        }
        _comprimirYLimpiar(destRaw, destGz, backupDir, () => {
          try { fs.unlinkSync(destRaw); } catch(e) {}
        }, fecha);
      });
    } catch(e) { console.error('Error en auto-backup:', e); }
  }

  function _comprimirYLimpiar(src, destGz, dir, onDone, _fecha) {
    // chunks de 256 KB — óptimo para lectura secuencial en M.2 NVMe
    const gzip = zlib.createGzip({ level: 6, memLevel: 9 });
    const out  = fs.createWriteStream(destGz);
    fs.createReadStream(src, { highWaterMark: 256 * 1024 }).pipe(gzip).pipe(out);
    out.on('finish', () => {
      try {
        // FIX #18: verificar integridad mínima del backup comprimido
        const stat = fs.statSync(destGz);
        if (stat.size < 100) {
          console.error('Backup corrupto (tamaño < 100 bytes), eliminando:', destGz);
          try { fs.unlinkSync(destGz); } catch(e) {}
          onDone && onDone();
          return;
        }
      } catch(e) {
        console.error('Error verificando backup:', e);
      }
      try {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.db.gz')).sort();
        if (files.length > 30)
          files.slice(0, files.length - 30).forEach(f => {
            try { fs.unlinkSync(path.join(dir, f)); } catch(e) {}
          });
      } catch(e) {}
      if (win && !win.isDestroyed()) {
        new Notification({
          title: '💾 Respaldo automático completado',
          body: `Base de datos respaldada (${_fecha || new Date().toISOString().split('T')[0]}).`,
          icon: notifIcon()
        }).show();
      }
      onDone && onDone();
    });
    out.on('error', (err) => {
      console.error('Error comprimiendo backup:', err);
      try { fs.unlinkSync(destGz); } catch(e) {}
      onDone && onDone();
    });
  }

  function msHastaMedianoche() {
    const ahora = new Date();
    const mn = new Date(ahora); mn.setHours(24, 0, 0, 0);
    return mn - ahora;
  }

  setTimeout(hacerBackup, 5000);
  setTimeout(() => { hacerBackup(); setInterval(hacerBackup, 24 * 60 * 60 * 1000); }, msHastaMedianoche());
}

// ─── WINDOW STATE ─────────────────────────────────────────────────────
function getStatePath() { return path.join(app.getPath('userData'), 'window-state.json'); }
function loadWindowState() {
  try {
    const sp = getStatePath();
    if (fs.existsSync(sp)) return JSON.parse(fs.readFileSync(sp, 'utf8'));
  } catch(e) {}
  return { width: 1280, height: 800, maximized: true };
}
function saveWindowState() {
  if (!win || win.isDestroyed()) return;
  try {
    const isMax   = win.isMaximized();
    const display = screen.getDisplayNearestPoint(win.getBounds());
    const bounds  = isMax ? display.workAreaSize : win.getBounds();
    fs.writeFileSync(getStatePath(), JSON.stringify({
      width: bounds.width || 1280, height: bounds.height || 800,
      x: isMax ? display.bounds.x : bounds.x,
      y: isMax ? display.bounds.y : bounds.y,
      maximized: isMax, displayId: display.id
    }));
  } catch(e) {}
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────
function createSplash(phase) {
  if (splash && !splash.isDestroyed()) {
    splash.show(); if (!splash.isMaximized()) splash.maximize(); splash.focus(); return;
  }
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  splash = new BrowserWindow({
    width, height, minWidth: 900, minHeight: 600,
    frame: false, transparent: false, alwaysOnTop: false,
    resizable: false, skipTaskbar: false, center: true,
    backgroundColor: '#150428',
    icon: notifIcon(),
    webPreferences: {
      // SEC-FIX: nodeIntegration desactivado en splash — preload expone solo lo necesario
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload-splash.js'),
      backgroundThrottling: false,
    }
  });
  splash.maximize();
  splash.loadFile('splash.html');
  splash.setMenuBarVisibility(false);
}

function closeSplash() {
  if (splash && !splash.isDestroyed()) { splash.close(); splash = null; }
}

function closeSplashAnimated(callback) {
  if (!splash || splash.isDestroyed()) { callback && callback(); return; }
  splash.webContents.send('splash-exit');
  const timeout = setTimeout(() => { closeSplash(); callback && callback(); }, 600);
  ipcMain.once('splash-exit-done', () => {
    clearTimeout(timeout); closeSplash(); callback && callback();
  });
}

// ─── VENTANA PRINCIPAL ────────────────────────────────────────────────
function createWindow() {
  const state = loadWindowState();
  const displays = screen.getAllDisplays();
  let validPos = false;
  if (state.x !== undefined && state.y !== undefined) {
    validPos = displays.some(d => {
      const b = d.bounds;
      return state.x >= b.x && state.y >= b.y &&
             state.x < b.x + b.width && state.y < b.y + b.height;
    });
  }

  win = new BrowserWindow({
    width: state.width || 1280, height: state.height || 800,
    x: validPos ? state.x : undefined, y: validPos ? state.y : undefined,
    minWidth: 900, minHeight: 600,
    show: false,
    title: 'Maneki Store',
    icon: notifIcon(),
    backgroundColor: '#FAFAFE',      // fondo antes del HTML → sin flash blanco al arrancar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,      // mantenido por compatibilidad con código legacy (ipcRenderer directo)
      preload: path.join(__dirname, 'preload.js'),  // BUG-NEW-02: expone __mkCfg y electronAPI via contextBridge
      backgroundThrottling: false,
      v8CacheOptions: 'bypassHeatCheck',
    }
  });

  win.loadFile('login.html');
  win.setMenuBarVisibility(false);
  if (state.maximized !== false) win.maximize();

  ['resize', 'move'].forEach(evt => win.on(evt, () => {
    if (!win.isMaximized()) saveWindowState();
  }));
  win.on('maximize',   () => saveWindowState());
  win.on('unmaximize', () => saveWindowState());

  win.on('close', (e) => {
    saveWindowState();
    if (!app._quitting) {
      e.preventDefault();
      win.webContents.executeJavaScript(`
        (function() {
          try {
            const hoy = new Date().toISOString().split('T')[0];
            const peds = window.pedidos || [];
            return peds.filter(function(p) {
              return p.entrega === hoy &&
                     !['finalizado','cancelado'].includes((p.status || '').toLowerCase());
            }).length;
          } catch(e) { return 0; }
        })()
      `).then(urgentes => {
        if (urgentes > 0) {
          new Notification({
            title: '⚠️ Maneki — Entregas para hoy',
            body: `Tienes ${urgentes} pedido${urgentes > 1 ? 's' : ''} con entrega hoy. La app sigue en la bandeja.`,
            icon: notifIcon()
          }).show();
        }
        win.hide();
      }).catch(() => win.hide());
    }
  });

  win.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      closeSplashAnimated(() => {
        win.show();
        if (state.maximized !== false) win.maximize();
      });
    }, 400);
  });

  // SEC-M3: Deshabilitar DevTools en producción
  if (app.isPackaged) {
    win.webContents.on('devtools-opened', () => {
      win.webContents.closeDevTools();
    });
  }
}

// ─── SYSTEM TRAY ─────────────────────────────────────────────────────
function createTray() {
  try { tray = new Tray(path.join(__dirname, 'icon.ico')); }
  catch(e) {
    try { tray = new Tray(path.join(__dirname, 'icon.png')); }
    catch(e2) { tray = new Tray(nativeImage.createEmpty()); }
  }
  const contextMenu = Menu.buildFromTemplate([
    { label: '🐱 Maneki Store', enabled: false },
    { type: 'separator' },
    { label: '📂 Abrir',          click: () => { if (win) { win.show(); win.focus(); } } },
    { label: '📊 Dashboard',      click: () => showAndNav('dashboard') },
    { label: '📋 Pedidos',        click: () => showAndNav('pedidos') },
    { type: 'separator' },
    { label: '⌨️ Atajos (Ctrl+Shift+?)', click: () => {
        if (win) { win.show(); win.focus();
          win.webContents.executeJavaScript(`typeof mostrarAtajos==='function'&&mostrarAtajos()`).catch(()=>{}); }
    }},
    { type: 'separator' },
    { label: '❌ Cerrar aplicación', click: () => { app._quitting = true; app.quit(); } }
  ]);
  tray.setToolTip('Maneki Store — Sistema de Gestión');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { if (win) { win.show(); win.focus(); } });
}

// ALTA-02 FIX: whitelist de secciones válidas — evita inyección de JS arbitrario
// via el argumento `section` si el valor viniera de una fuente no confiable.
const _VALID_SECTIONS = new Set([
  'dashboard','pedidos','inventario','clientes','balance',
  'reportes','envios','equipos','whatsapp','backup','configuracion'
]);
function showAndNav(section) {
  if (!win) return;
  if (!_VALID_SECTIONS.has(String(section))) return;  // rechazar secciones inválidas
  win.show(); win.focus();
  win.webContents.executeJavaScript(
    `typeof showSection==='function'&&showSection('${section}')`
  ).catch(() => {});
}

// ─── APP READY ───────────────────────────────────────────────────────
app.whenReady().then(() => {
  initDB();
  createSplash('startup');
  createWindow();
  createTray();
  programarBackupDiario();

  const autostartFile = path.join(app.getPath('userData'), 'autostart.json');
  let autostartEnabled = true;
  try {
    if (fs.existsSync(autostartFile))
      autostartEnabled = JSON.parse(fs.readFileSync(autostartFile, 'utf8')).enabled !== false;
  } catch(e) {}
  app.setLoginItemSettings({ openAtLogin: autostartEnabled, openAsHidden: true });

  const shortcuts = [
    ['CommandOrControl+Shift+N', () => showAndNav('inventory')],
    ['CommandOrControl+Shift+D', () => showAndNav('dashboard')],
    ['CommandOrControl+Shift+P', () => showAndNav('pedidos')],
    ['CommandOrControl+Shift+C', () => showAndNav('clientes')],
  ];
  shortcuts.forEach(([key, fn]) => {
    try { globalShortcut.register(key, fn); }
    catch(e) { console.warn('Shortcut no registrado:', key, e.message); }
  });
  globalShortcut.register('F5', () => {
    if (win) win.webContents.executeJavaScript(
      `typeof refrescarPagina==='function'&&refrescarPagina()`
    ).catch(() => {});
  });
  try {
    // 'Slash' no es válido en Electron en Windows — usar '?' que es Shift+/
    const slashShortcut = process.platform === 'darwin' ? 'CommandOrControl+Shift+/' : 'CommandOrControl+Shift+?';
    globalShortcut.register(slashShortcut, () => {
      if (win) { win.show(); win.focus();
        win.webContents.executeJavaScript(`typeof mostrarAtajos==='function'&&mostrarAtajos()`).catch(()=>{}); }
    });
  } catch(e) {
    console.warn('No se pudo registrar shortcut de ayuda:', e.message);
  }
});

app.setAppUserModelId('Maneki Store');

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  if (db) {
    // FIX #6: secuenciar checkpoint → close con callbacks para evitar WAL corruption
    try {
      db.run('PRAGMA wal_checkpoint(TRUNCATE)', [], (err) => {
        if (err) console.warn('Checkpoint error al cerrar:', err.message);
        db.close((closeErr) => {
          if (closeErr) console.error('Error cerrando DB:', closeErr);
        });
      });
    } catch(e) { 
      console.error('Error en cleanup de DB al cerrar:', e);
      try { db.close(); } catch(e2) {} 
    }
  }
  saveWindowState();
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin' && app._quitting) app.quit();
});

app.on('activate', () => {
  if (win && !win.isDestroyed()) { win.show(); win.focus(); }
});

// ═══════════════════════════════════════════════════════════════════════
// IPC HANDLERS
// ═══════════════════════════════════════════════════════════════════════
// FIX 5 SKIP: _setupRealtime no existe en main.js — vive en js/db.js (renderer).
// El guard de canales duplicados debe aplicarse en js/db.js si es necesario.

ipcMain.handle('verify-pin', async (event, pinIngresado) => {
  const now = Date.now();
  if (now < _pinAttempts.lockUntil) {
    const secs = Math.ceil((_pinAttempts.lockUntil - now) / 1000);
    return { ok: false, locked: true, msg: `Demasiados intentos. Espera ${secs}s` };
  }
  const stored = loadStoredPinHash();
  // FIX #20: si no hay PIN guardado, cualquier PIN es válido (primer uso)
  if (!stored) { _pinAttempts.count = 0; return { ok: true }; }
  const valid = hashPin(String(pinIngresado)) === stored;
  if (!valid) {
    _pinAttempts.count++;
    if (_pinAttempts.count >= 5) {
      const lockDuration = _pinAttempts.count >= 15 ? 3600000
          : _pinAttempts.count >= 10 ? 600000
          : 120000;
      _pinAttempts.lockUntil = Date.now() + lockDuration;
      const mins = Math.round(lockDuration / 60000);
      return { ok: false, locked: true, msg: `Demasiados intentos. Cuenta bloqueada ${mins} minuto${mins > 1 ? 's' : ''}` };
    }
    return { ok: false };
  }
  _pinAttempts.count = 0;
  return { ok: true };
});

ipcMain.handle('pin-exists', async () => {
  return loadStoredPinHash() !== null;
});

ipcMain.handle('change-pin', async (event, { pinActual, pinNuevo }) => {
  if (typeof pinActual !== 'string' || typeof pinNuevo !== 'string') {
    return { ok: false, error: 'Formato de PIN inválido' };
  }
  if (pinNuevo.length < 4 || pinNuevo.length > 20) {
    return { ok: false, error: 'El PIN debe tener entre 4 y 20 caracteres' };
  }
  const stored = loadStoredPinHash();
  // FIX #20: si no hay PIN guardado, no requerir PIN actual (setup inicial)
  if (stored && hashPin(String(pinActual)) !== stored)
    return { ok: false, error: 'PIN actual incorrecto' };
  savePin(pinNuevo);
  return { ok: true };
});

ipcMain.once('login-success', () => {
  win.hide();
  createSplash('loading');
  win.webContents.executeJavaScript("localStorage.removeItem('maneki_activeSection')").catch(() => {});
  win.loadFile('index.html');
  if (win._splashFallback) clearTimeout(win._splashFallback);
  win._splashFallback = setTimeout(() => {
    closeSplash();
    if (win && !win.isDestroyed() && !win.isVisible()) { win.show(); win.maximize(); }
  }, 15000);
});

ipcMain.on('splash-progress', (event, { step, total, label }) => {
  if (splash && !splash.isDestroyed())
    splash.webContents.send('progress-update', { step, total, label });
});

ipcMain.on('splash-done', () => {
  if (win._splashFallback) { clearTimeout(win._splashFallback); win._splashFallback = null; }
  if (splash && !splash.isDestroyed()) {
    splash.webContents.send('progress-update', { step: 6, total: 6, label: '¡Listo!' });
    setTimeout(() => {
      closeSplashAnimated(() => { if (win && !win.isDestroyed()) { win.show(); win.maximize(); } });
    }, 500);
  } else {
    if (win && !win.isDestroyed()) { win.show(); win.maximize(); }
  }
});

ipcMain.on('notify-stock', (event, productName) => {
  const safeName = String(productName || '').substring(0, 100);
  new Notification({
    title: '⚠️ Stock Bajo en Maneki Store',
    body: `El producto "${safeName}" tiene menos de 5 unidades.`,
    icon: notifIcon()
  }).show();
});

ipcMain.on('notify-connection', (event, { connected, msg }) => {
  const safeMsg = String(msg || (connected ? 'Sincronización activa' : 'Sin conexión')).substring(0, 200);
  new Notification({
    title: connected ? '🟢 Maneki Store — Conectado' : '🔴 Maneki Store — Sin conexión',
    body: safeMsg,
    icon: notifIcon()
  }).show();
});

ipcMain.on('update-tray-badge', (event, { urgentes, total }) => {
  if (!tray) return;
  try {
    if (urgentes > 0) {
      app.setBadgeCount && app.setBadgeCount(urgentes);
      tray.setToolTip(`Maneki Store — ${urgentes} pedido${urgentes > 1 ? 's' : ''} urgente${urgentes > 1 ? 's' : ''} 🔴`);
    } else if (total > 0) {
      app.setBadgeCount && app.setBadgeCount(0);
      tray.setToolTip(`Maneki Store — ${total} pedido${total > 1 ? 's' : ''} activo${total > 1 ? 's' : ''}`);
    } else {
      app.setBadgeCount && app.setBadgeCount(0);
      tray.setToolTip('Maneki Store — Sistema de Gestión');
    }
  } catch(e) {}
});

ipcMain.handle('get-backup-dir', () => path.join(app.getPath('userData'), 'backups'));

ipcMain.handle('get-autostart', () => {
  try {
    const f = path.join(app.getPath('userData'), 'autostart.json');
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8')).enabled !== false;
  } catch(e) {}
  return true;
});
ipcMain.handle('set-autostart', (event, enabled) => {
  try {
    const f = path.join(app.getPath('userData'), 'autostart.json');
    fs.writeFileSync(f, JSON.stringify({ enabled: !!enabled }), 'utf8');
    app.setLoginItemSettings({ openAtLogin: !!enabled, openAsHidden: true });
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.on('save-local', (event, productos) => {
  if (!db) return;
  const stmt = db.prepare('INSERT OR REPLACE INTO productos_local VALUES (?, ?, ?, ?, ?)');
  productos.forEach(p => stmt.run(p.id, p.nombre, p.precio, p.stock, p.categoria));
  stmt.finalize();
});

ipcMain.on('save-venta-pendiente', (event, venta) => {
  if (!db) return;
  db.run(
    'INSERT OR REPLACE INTO ventas_pendientes VALUES (?, ?, ?, ?)',
    [String(venta.id), venta.folio, JSON.stringify(venta), venta.date],
    err => { if (err) console.error('Error guardando venta pendiente:', err); }
  );
});

ipcMain.handle('get-ventas-pendientes', () => {
  if (!db) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM ventas_pendientes', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => { try { return JSON.parse(r.datos); } catch(e) { return null; } }).filter(Boolean));
    });
  });
});

ipcMain.on('delete-venta-pendiente', (event, ventaId) => {
  if (!db) return;
  db.run('DELETE FROM ventas_pendientes WHERE id = ?', [String(ventaId)]);
});

ipcMain.handle('count-ventas-pendientes', () => {
  if (!db) return Promise.resolve(0);
  return new Promise(resolve => {
    db.get('SELECT COUNT(*) as n FROM ventas_pendientes', [], (err, row) => {
      resolve(err ? 0 : row.n);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SQLITE LOCAL — handlers para reemplazar localStorage
// ═══════════════════════════════════════════════════════════════════════

ipcMain.handle('sqlite-save', async (event, { key, value }) => {
  if (!db) return { ok: false, error: 'DB no inicializada' };
  try {
    const json = typeof value === 'string' ? value : JSON.stringify(value);
    await dbRun(
      `INSERT INTO store_local (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
      [key, json]
    );
    return { ok: true };
  } catch(e) {
    console.error('sqlite-save error:', key, e);
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('sqlite-load', async (event, { key }) => {
  if (!db) return { ok: false, value: null };
  try {
    const row = await dbGet('SELECT value FROM store_local WHERE key = ?', [key]);
    if (!row) return { ok: true, value: null };
    return { ok: true, value: JSON.parse(row.value) };
  } catch(e) {
    console.error('sqlite-load error:', key, e);
    return { ok: false, value: null };
  }
});

ipcMain.handle('sqlite-load-all', async (event, { keys }) => {
  if (!db) return { ok: false, data: {} };
  if (!Array.isArray(keys) || keys.length === 0 || keys.length > 200) {
    return { ok: false, data: {} };
  }
  const safeKeys = keys.filter(k => typeof k === 'string' && k.length < 256);
  if (!safeKeys.length) return { ok: false, data: {} };
  try {
    const placeholders = safeKeys.map(() => '?').join(',');
    const rows = await dbAll(
      `SELECT key, value FROM store_local WHERE key IN (${placeholders})`, safeKeys
    );
    const result = {};
    rows.forEach(row => {
      try { result[row.key] = JSON.parse(row.value); } catch(e) { result[row.key] = null; }
    });
    return { ok: true, data: result };
  } catch(e) {
    console.error('sqlite-load-all error:', e);
    return { ok: false, data: {} };
  }
});

// ── BUG-NEW-02 FIX: Credenciales Supabase expuestas via ipcMain, nunca en renderer ──
// El renderer llama window.__mkCfg.getSupabase() → preload → ipcRenderer.invoke → aquí.
// Las claves NUNCA llegan al código JS del renderer como string hardcodeado.
ipcMain.handle('get-supabase-config', () => ({
  url: 'https://hoqcrljgmamaumtdrtzi.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcWNybGpnbWFtYXVtdGRydHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTAwOTgsImV4cCI6MjA4Njk2NjA5OH0.x_gYRz29tK7InMxQaDyZL2bdD1-hCCJ1qg6tgvmRO5o'
}));

ipcMain.handle('sqlite-size', async () => {
  if (!db) return { ok: false, kb: 0 };
  try {
    const row     = await dbGet(`SELECT ROUND(SUM(LENGTH(key) + LENGTH(value)) / 1024.0, 1) as kb FROM store_local`);
    const fileRow = await dbGet(`PRAGMA page_count`);
    const sizeRow = await dbGet(`PRAGMA page_size`);
    const dbKB    = fileRow && sizeRow ? Math.round((fileRow.page_count * sizeRow.page_size) / 1024) : 0;
    return { ok: true, kb: row ? row.kb : 0, dbKB };
  } catch(e) { return { ok: false, kb: 0 }; }
});

ipcMain.handle('sqlite-delete', async (event, { key }) => {
  if (!db) return { ok: false };
  try {
    await dbRun('DELETE FROM store_local WHERE key = ?', [key]);
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});
