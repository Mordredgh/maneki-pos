// ============================================================
// SUPABASE CONFIG
// ============================================================
// ===== ELECTRON IPC (Notificaciones y SQLite offline) =====
// ── VARIABLES GLOBALES PARA PEDIDOS (declaradas antes de todo) ──
var pedidos = [];
var pedidosFinalizados = [];
var abonos = [];
var pedidoProductosSeleccionados = [];
var abonoProductosSeleccionados = [];

let ipcRenderer = null;
try {
    const { ipcRenderer: _ipc } = require('electron');
    ipcRenderer = _ipc;
} catch(e) { /* Corriendo fuera de Electron, ipcRenderer no disponible */ }

// ══════════════════════════════════════════════════════════════
// SQLITE STORAGE — capa de persistencia sin límite de espacio
// Usa SQLite local (via IPC) como almacenamiento principal,
// con localStorage como respaldo de emergencia
// ══════════════════════════════════════════════════════════════
const sqliteStorage = {
    // Guardar datos en SQLite local
    async set(key, value) {
        if (!ipcRenderer) return false;
        try {
            const result = await ipcRenderer.invoke('sqlite-save', { key, value });
            return result.ok;
        } catch(e) {
            console.warn('sqliteStorage.set error:', key, e);
            return false;
        }
    },

    // Cargar datos desde SQLite local
    async get(key, defaultValue = null) {
        if (!ipcRenderer) return defaultValue;
        try {
            const result = await ipcRenderer.invoke('sqlite-load', { key });
            if (result.ok && result.value !== null) return result.value;
            return defaultValue;
        } catch(e) {
            console.warn('sqliteStorage.get error:', key, e);
            return defaultValue;
        }
    },

    // Cargar múltiples claves de una sola vez (más rápido al iniciar)
    async getAll(keys) {
        if (!ipcRenderer) return {};
        try {
            const result = await ipcRenderer.invoke('sqlite-load-all', { keys });
            return result.ok ? result.data : {};
        } catch(e) {
            console.warn('sqliteStorage.getAll error:', e);
            return {};
        }
    },

    // Ver cuánto espacio está usando
    async getSize() {
        if (!ipcRenderer) return { kb: 0, dbKB: 0 };
        try {
            const result = await ipcRenderer.invoke('sqlite-size');
            return result.ok ? result : { kb: 0, dbKB: 0 };
        } catch(e) { return { kb: 0, dbKB: 0 }; }
    }
};
// ==========================================================

// MEJ-02: Las credenciales de Supabase deberían moverse al proceso principal (main.js)
// y exponerse al renderer via contextBridge en el preload. Mientras se migra,
// BUG-NEW-02 FIX: Credenciales Supabase fuera del código visible en DevTools como strings.
// Con contextIsolation:false (requerido por el proyecto por compatibilidad con require() en renderer),
// contextBridge no expone nada en window. En su lugar usamos ipcRenderer directamente,
// que sí está disponible con nodeIntegration:true.
// ── Declaraciones adelantadas para evitar TDZ en _setupRealtime ──
// _rtTablaAKey y _rtDeskDeb se usan dentro de _setupRealtime(), que es llamada
// por el bloque async de inicialización de Supabase. Con const/let no hay hoisting,
// así que deben declararse ANTES del bloque async.
const _rtDeskDeb = {};
const _rtTablaAKey = {
    'products':           'products',
    'orders':             'pedidos',
    'orders_finalizados': 'pedidosFinalizados',
    'sales_history':      'salesHistory'
};

let db = null;
(async () => {
    try {
        let cfg = null;
        // Intentar via ipcRenderer (ya inicializado en línea 12, mismo que usa SQLite)
        if (ipcRenderer) {
            try {
                cfg = await ipcRenderer.invoke('get-supabase-config');
            } catch(e) { /* handler no disponible aún — usar fallback */ }
        }
        // Fallback: contextBridge (si nodeIntegration:false)
        if (!cfg && window.__mkCfg) {
            try { cfg = await window.__mkCfg.getSupabase(); } catch(e) {}
        }
        // Fallback final: config embebida. La seguridad del anon key se garantiza
        // mediante políticas RLS en Supabase — ocultarla del renderer no aporta
        // seguridad real en una app Electron de escritorio local.
        if (!cfg) {
            cfg = {
                url: 'https://hoqcrljgmamaumtdrtzi.supabase.co',
                key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcWNybGpnbWFtYXVtdGRydHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTAwOTgsImV4cCI6MjA4Njk2NjA5OH0.x_gYRz29tK7InMxQaDyZL2bdD1-hCCJ1qg6tgvmRO5o'
            };
        }
        // R2-A2: Validar configuración de Supabase antes de crear el cliente
        function _validarSupabaseCfg(url, key) {
            if (!url || !url.startsWith('https://') || !url.endsWith('.supabase.co')) return false;
            if (!key || String(key).length < 30) return false;
            return true;
        }
        if (!_validarSupabaseCfg(cfg.url, cfg.key)) {
            console.error('[db.js] Configuración de Supabase inválida — URL o API key incorrectos.');
            window._dbReady = false;
            if (typeof manekiToastExport === 'function') {
                manekiToastExport('Configuración de Supabase inválida — revisa URL y API key', 'err');
            } else {
                // manekiToastExport puede no estar disponible aún; reintentar al cargar DOM
                document.addEventListener('DOMContentLoaded', function() {
                    if (typeof manekiToastExport === 'function')
                        manekiToastExport('Configuración de Supabase inválida — revisa URL y API key', 'err');
                }, { once: true });
            }
            return;
        }
        db = supabase.createClient(cfg.url, cfg.key);
        window._dbReady = true;
        // Usar typeof para evitar ReferenceError si _pendingSync aún no fue declarada (TDZ con let)
        if (typeof sincronizarPendientes === 'function' && window._pendingSync) sincronizarPendientes();
        if (typeof _setupRealtime === 'function') _setupRealtime();
    } catch(e) {
        console.error('[db.js] No se pudo inicializar Supabase:', e);
        window._dbReady = false;
    }
})();

// ── Timeout wrapper para queries Supabase (evita UI freeze) ──────────
function _withTimeout(promise, ms) {
    ms = ms || 8000;
    return Promise.race([
        promise,
        new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Supabase timeout')); }, ms);
        })
    ]);
}

// ══════════════════════════════════════════════════════════════
// MEJ-01: _esc() — Sanitizador HTML global anti-XSS
// En Electron, un XSS en innerHTML con datos de usuario puede
// escalar a RCE via IPC/Node. Esta función debe usarse en TODOS
// los puntos donde se inserta texto de usuario en el DOM.
// ══════════════════════════════════════════════════════════════
window._esc = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

// ══════════════════════════════════════════════════════
// ── SUPABASE REALTIME — Live Sync (escritorio)
// BUG-010 FIX: ahora escucha tanto la tabla store (legacy)
// como las tablas relacionales (products, orders, etc.)
// MEJ-13: UPDATE in-place desde payload — sin SELECT * completo
// ══════════════════════════════════════════════════════
// Transforma una fila relacional al esquema local del CRM
function _rtTransformarFila(tabla, row) {
    if (!row) return null;
    if (tabla === 'products') return {
        id: row.id, name: row.name||'', sku: row.sku||'', category: row.category||'',
        tipo: row.tipo||'producto', cost: row.cost||0, price: row.price||0,
        stock: row.stock||0, stockMin: row.stock_min||0, image: row.image||null,
        imageUrl: row.image_url||null, tags: row.tags||[], variants: row.variants||[],
        mpComponentes: row.mp_componentes||[], proveedor: row.proveedor||null,
        notas: row.notas||null, publicarTienda: row.publicar_tienda||false
    };
    if (tabla === 'orders') return {
        id: row.id, folio: row.folio||null, cliente: row.cliente||null,
        telefono: row.telefono||null, redes: row.redes||null, fecha: row.fecha||null,
        entrega: row.entrega||null, concepto: row.concepto||null, cantidad: row.cantidad||1,
        costo: row.costo||0, anticipo: row.anticipo||0, total: row.total||0,
        resta: row.resta||0, notas: row.notas||null, status: row.status||'confirmado',
        fechaCreacion: row.fecha_creacion||null, productosInventario: row.productos_inventario||[],
        inventarioDescontado: row.inventario_descontado||false, fromQuote: row.from_quote||null
    };
    if (tabla === 'orders_finalizados') return {
        id: row.id, folio: row.folio||null, cliente: row.cliente||null,
        telefono: row.telefono||null, redes: row.redes||null, fecha: row.fecha||null,
        entrega: row.entrega||null, concepto: row.concepto||null, cantidad: row.cantidad||1,
        costo: row.costo||0, anticipo: row.anticipo||0, total: row.total||0,
        resta: row.resta||0, notas: row.notas||null, status: row.status||'finalizado',
        fechaCreacion: row.fecha_creacion||null, fechaFinalizado: row.fecha_finalizado||null,
        productosInventario: row.productos_inventario||[], inventarioDescontado: row.inventario_descontado||false,
        fromQuote: row.from_quote||null
    };
    if (tabla === 'sales_history') return {
        id: row.id, folio: row.folio||null, date: row.date||null, time: row.time||null,
        customer: row.customer||null, concept: row.concept||null, note: row.note||null,
        products: row.products||[], subtotal: row.subtotal||0, discount: row.discount||0,
        tax: row.tax||0, total: row.total||0, method: row.method||null
    };
    return null;
}

function _setupRealtime() {
    // Guard: db puede ser null si la inicialización async todavía no completó
    // (ej. config.js llama _setupRealtime() antes de que ipcRenderer.invoke resuelva)
    if (!db) return;
    // Guard: evitar canales duplicados si se llama más de una vez
    if (window._mkRTSetupDone) return;
    window._mkRTSetupDone = true;
    // ── Canal 1: tabla store (key-value legacy, escrituras del CRM) ──
    window._mkRTChannels = window._mkRTChannels || [];
    const _chStore = db.channel('maneki-desktop-store')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store' }, payload => {
            const key = payload.new?.key || payload.old?.key;
            if (!key) return;
            clearTimeout(_rtDeskDeb[key]);
            _rtDeskDeb[key] = setTimeout(() => _applyRTDesktop(key).catch(e => console.warn('[Realtime] _applyRTDesktop:', e)), 800);
        })
        .subscribe(status => {
            if (status === 'SUBSCRIBED') {
                actualizarIndicadorConexion(true);
                console.log('[Realtime] Canal store — Live Sync activo ✓');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.warn('[Realtime] Canal store estado:', status);
            }
        });
    window._mkRTChannels.push(_chStore);

    // ── Canal 2: tablas relacionales (escrituras desde Lovable / otras apps) ──
    // MEJ-13: UPDATE in-place desde payload — evita SELECT * completo por cada evento
    Object.keys(_rtTablaAKey).forEach(tabla => {
        const _chRel = db.channel('maneki-rt-' + tabla)
            .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, payload => {
                const debKey = '__rel_' + tabla;
                clearTimeout(_rtDeskDeb[debKey]);
                _rtDeskDeb[debKey] = setTimeout(() => _applyRTRelacional(tabla, payload).catch(e => console.warn('[Realtime] _applyRTRelacional:', tabla, e)), 600);
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') console.log('[Realtime] Canal ' + tabla + ' activo ✓');
                else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') console.warn('[Realtime] Canal ' + tabla + ' estado:', status);
            });
        window._mkRTChannels.push(_chRel);
    });

    window.addEventListener('beforeunload', () => {
        (window._mkRTChannels || []).forEach(ch => { try { ch.unsubscribe(); } catch(e) {} });
    });
}

// Actualiza arrays in-place para no romper referencias de otras variables let
function _rtInPlace(arr, fresh) {
    if (!Array.isArray(arr) || !Array.isArray(fresh)) return;
    arr.splice(0, arr.length, ...fresh);
}

// MEJ-13: Aplica cambio relacional en memoria sin recargar tabla completa.
// Usa el payload del evento (INSERT/UPDATE/DELETE) para modificar el array local.
async function _applyRTRelacional(tabla, payload) {
    if (document.querySelector('.modal.active')) return;
    if (!window.pedidos && !window.products) return;

    const key = _rtTablaAKey[tabla];
    if (!key) return;

    const eventType = payload?.eventType || 'UPDATE';
    const rowData   = payload?.new || payload?.old;

    try {
        // Si no tenemos datos en el payload, hacer carga completa (primera vez)
        const arr = window[key];
        if (!Array.isArray(arr) || arr.length === 0) {
            const { data } = await db.from(tabla).select('*').limit(2000);
            if (!data) return;
            const fresh = data.map(r => _rtTransformarFila(tabla, r)).filter(Boolean);
            _rtInPlace(arr || [], fresh);
            sqliteStorage.set(key, fresh).catch(e => console.warn('[Maneki DB]', e?.message || e));
        } else if (rowData) {
            // UPDATE in-place desde el payload — O(1) para un registro
            const transformed = _rtTransformarFila(tabla, rowData);
            if (!transformed) return;
            if (eventType === 'INSERT') {
                const existe = arr.some(x => String(x.id) === String(transformed.id));
                if (!existe) arr.push(transformed);
            } else if (eventType === 'UPDATE') {
                const i = arr.findIndex(x => String(x.id) === String(transformed.id));
                if (i >= 0) {
                    // Evitar que el stock derivado de DB sobreescriba el stock físico local
                    if (tabla === 'products') {
                        const localP = arr[i];
                        if (localP && localP.tipo !== 'materia_prima' && localP.tipo !== 'servicio' && Array.isArray(localP.mpComponentes) && localP.mpComponentes.length > 0) {
                            transformed.stock = localP.stock || 0;
                        }
                    }
                    arr.splice(i, 1, transformed);
                }
                else arr.push(transformed);
            } else if (eventType === 'DELETE') {
                const delId = rowData.id;
                const i = arr.findIndex(x => String(x.id) === String(delId));
                if (i >= 0) arr.splice(i, 1);
            }
            sqliteStorage.set(key, arr).catch(e => console.warn('[Maneki DB]', e?.message || e));
        }

        await _applyRTDesktopConDatos(key, window[key] || []);
        console.log('[Realtime] ' + tabla + ' (' + eventType + ') aplicado in-place');
    } catch(e) {
        console.warn('[Realtime] Error en _applyRTRelacional:', tabla, e);
    }
}

// _applyRTDesktop — carga desde store legacy y aplica al estado local
async function _applyRTDesktop(key) {
    if (document.querySelector('.modal.active')) return;
    if (!window.pedidos && !window.products) return;
    try {
        const fresh = await sbLoad(key, null);
        if (fresh === null) return;
        await _applyRTDesktopConDatos(key, fresh);
    } catch(e) {
        console.warn('[Realtime] Error aplicando cambio:', key, e);
    }
}

// _applyRTDesktopConDatos — aplica datos ya cargados y re-renderiza la UI.
// Compartido por _applyRTDesktop (canal store) y _applyRTRelacional (tablas relacionales).
async function _applyRTDesktopConDatos(key, fresh) {
    if (!Array.isArray(fresh)) return;
    if (key === 'pedidos') {
        _rtInPlace(window.pedidos, fresh);
        if (typeof renderPedidosTable === 'function') renderPedidosTable();
        if (typeof updatePedidosStats === 'function') updatePedidosStats();
        if (typeof updateDashboard === 'function') updateDashboard();
    } else if (key === 'products') {
        _rtInPlace(window.products, fresh);
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof renderInventoryTable === 'function') renderInventoryTable();
        if (typeof updateDashboard === 'function') updateDashboard();
    } else if (key === 'clients') {
        _rtInPlace(window.clients, fresh);
        if (typeof renderClientsTable === 'function') renderClientsTable();
    } else if (key === 'pedidosFinalizados') {
        _rtInPlace(window.pedidosFinalizados, fresh);
        if (typeof renderHistorialPedidos === 'function') renderHistorialPedidos();
        if (typeof renderBalance === 'function') renderBalance();
    } else if (key === 'salesHistory') {
        _rtInPlace(window.salesHistory, fresh);
        if (typeof renderSalesHistory === 'function') renderSalesHistory();
        if (typeof renderBalance === 'function') renderBalance();
        if (typeof updateDashboard === 'function') updateDashboard();
    } else if (key === 'incomes') {
        _rtInPlace(window.incomes, fresh);
        if (typeof renderBalance === 'function') renderBalance();
    } else if (key === 'expenses') {
        _rtInPlace(window.expenses, fresh);
        if (typeof renderBalance === 'function') renderBalance();
    }
}

// BUG-009 FIX: comprimir imagen antes de subir a Supabase Storage
// Evita rechazos por tamaño y reduce uso de bandwidth
function _comprimirFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 1200;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else       { w = Math.round(w * MAX / h); h = MAX; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.82);
            };
            img.onerror = () => resolve(file);
            img.src = ev.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

async function subirImagenStorage(file) {
    // BUG7 FIX: si falla Supabase Storage, guardar como base64 local
    try {
        // BUG-009 FIX: comprimir antes de subir para evitar rechazos por tamaño
        const fileComprimido = await _comprimirFile(file);
        const ext = file.name.split('.').pop();
        const fileName = `producto_${Date.now()}.${ext}`;
        const { data, error } = await db.storage
            .from('product-images')
            .upload(fileName, fileComprimido, { upsert: true });
        if (error) throw error;
        const { data: urlData } = db.storage
            .from('product-images')
            .getPublicUrl(fileName);
        return urlData.publicUrl;
    } catch(e) {
        console.warn('Supabase Storage no disponible, guardando imagen localmente:', e);
        // Convertir imagen a base64 como respaldo offline
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                // Comprimir si es muy grande (max ~200KB en base64)
                const base64 = ev.target.result;
                if (base64.length > 270000) {
                    // Reducir calidad usando canvas
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX = 400;
                        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
                        canvas.width  = img.width  * ratio;
                        canvas.height = img.height * ratio;
                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                    img.src = base64;
                } else {
                    resolve(base64);
                }
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }
}

// FIX #7: variable única — usar solo window._pendingSync para evitar desincronización
window._pendingSync = false;
let _offlineMode = false;

// ── Banner offline queue ──────────────────────────────────────────
function actualizarBannerOffline(n) {
    let banner = document.getElementById('offlineQueueBanner');
    if (n > 0) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'offlineQueueBanner';
            banner.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#f59e0b,#d97706);color:white;font-weight:700;font-size:0.82rem;padding:10px 20px;border-radius:99px;box-shadow:0 4px 16px rgba(245,158,11,0.4);z-index:9999;display:flex;align-items:center;gap:8px;cursor:pointer;animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;';
            banner.onclick = sincronizarPendientes;
            document.body.appendChild(banner);
        }
        const iconEl = document.createElement('i');
        iconEl.className = 'fas fa-wifi-slash';
        const textEl = document.createElement('span');
        textEl.textContent = ' ' + n + ' venta(s) guardadas offline — ';
        const linkEl = document.createElement('u');
        linkEl.textContent = 'Sincronizar ahora';
        linkEl.style.cursor = 'pointer';
        if (banner._syncHandler) banner.removeEventListener('click', banner._syncHandler);
        banner._syncHandler = function() { if (typeof sincronizarPendientes === 'function') sincronizarPendientes(); };
        linkEl.addEventListener('click', banner._syncHandler);
        banner.innerHTML = '';
        banner.appendChild(iconEl);
        banner.appendChild(textEl);
        banner.appendChild(linkEl);
    } else if (banner) {
        banner.remove();
    }
}

// ── MODAL CLOSE — animación de salida universal ──────────────────
function closeModal(idOrEl) {
    const modal = typeof idOrEl === 'string'
        ? document.getElementById(idOrEl)
        : idOrEl;
    if (!modal) return;
    if (!modal.classList.contains('active')) {
        modal.style.display = '';
        return;
    }
    modal.classList.add('closing');
    modal.classList.remove('active');
    const duration = 220;
    setTimeout(() => {
        modal.classList.remove('closing');
        modal.style.display = '';
    }, duration);
}
window.closeModal = closeModal;

function openModal(idOrEl) {
    const modal = typeof idOrEl === 'string'
        ? document.getElementById(idOrEl)
        : idOrEl;
    if (!modal) return;
    modal.style.display = '';
    modal.classList.remove('closing');
    modal.classList.add('active');
}
window.openModal = openModal;

function actualizarIndicadorConexion(online) {
    const dot  = document.getElementById('supabaseStatusDot');
    const txt  = document.getElementById('supabaseStatusText');
    const box  = document.getElementById('supabaseStatus');
    _offlineMode = !online;
    if (!dot || !txt) return;
    if (online) {
        dot.className = 'w-2 h-2 rounded-full bg-green-500 flex-shrink-0 inline-block';
        txt.textContent = 'Guardado en nube ✓';
        txt.className = 'text-green-700 truncate';
        if (box) {
            box.style.transition = 'background 0.3s ease';
            box.style.background = '#dcfce7';
            box.style.borderColor = '#86efac';
            box.style.border = '1px solid #86efac';
            clearTimeout(box._flashTimer);
            box._flashTimer = setTimeout(() => {
                box.style.background = '';
                box.style.border = '';
                txt.textContent = 'Supabase conectado';
            }, 2000);
        }
        _ocultarBannerOfflineConexion();
    } else {
        dot.className = 'w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 inline-block';
        txt.textContent = 'Sin conexión (local)';
        txt.className = 'text-yellow-600 truncate';
        if (box) { box.style.background = ''; box.style.border = ''; }
        _mostrarBannerOfflineConexion();
    }
}

function _mostrarBannerOfflineConexion() {
    let banner = document.getElementById('mk-offline-banner');
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'mk-offline-banner';
    banner.innerHTML = `
        <span style="font-size:1.1em">📡</span>
        <span>Sin internet — trabajando en modo local. Los datos se sincronizarán al reconectarse.</span>
        <button onclick="document.getElementById('mk-offline-banner').remove()"
            style="margin-left:12px;background:rgba(255,255,255,0.2);border:none;color:white;
                   border-radius:6px;padding:2px 8px;cursor:pointer;font-size:0.85em;">✕</button>
    `;
    banner.style.cssText = [
        'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:99999',
        'background:linear-gradient(90deg,#b45309,#d97706)',
        'color:white', 'padding:10px 20px',
        'display:flex', 'align-items:center', 'gap:10px',
        'font-size:0.82rem', 'font-weight:600',
        'box-shadow:0 -4px 20px rgba(0,0,0,0.2)',
        'animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both'
    ].join(';');
    document.body.appendChild(banner);
}
function _ocultarBannerOfflineConexion() {
    const banner = document.getElementById('mk-offline-banner');
    if (banner) {
        banner.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => { try { banner.remove(); } catch(e) {} }, 320);
    }
}

// ── Guardar venta en cola offline ────────────────────────────────
function encolarVentaOffline(saleRecord) {
    if (!ipcRenderer) return;
    try {
        ipcRenderer.send('save-venta-pendiente', {
            id: String(saleRecord.id),
            folio: saleRecord.folio,
            date: saleRecord.date,
            ...saleRecord
        });
        ipcRenderer.invoke('count-ventas-pendientes').then(n => actualizarBannerOffline(n)).catch(e => console.warn('[Maneki DB]', e?.message || e));
        manekiToastExport('📦 Venta ' + saleRecord.folio + ' guardada offline', 'warn');
    } catch(e) { console.error('Error encolando venta offline:', e); }
}

async function sincronizarPendientes() {
    if (ipcRenderer) {
        try {
            const ventasPendientes = await ipcRenderer.invoke('get-ventas-pendientes');
            if (ventasPendientes && ventasPendientes.length > 0) {
                let cambiado = false;
                for (const venta of ventasPendientes) {
                    const yaExiste = salesHistory.some(s => String(s.id) === String(venta.data?.id || venta.id));
                    if (!yaExiste && venta.data) {
                        salesHistory.push(venta.data);
                        cambiado = true;
                    }
                }
                if (cambiado) {
                    const { error } = await db.from('store').upsert(
                        { key: 'salesHistory', value: JSON.stringify(salesHistory) },
                        { onConflict: 'key' }
                    );
                    if (!error) {
                        for (const venta of ventasPendientes) {
                            ipcRenderer.send('delete-venta-pendiente', String(venta.id));
                        }
                        manekiToastExport('✅ ' + ventasPendientes.length + ' venta(s) offline sincronizadas', 'ok');
                    }
                } else {
                    for (const venta of ventasPendientes) {
                        ipcRenderer.send('delete-venta-pendiente', String(venta.id));
                    }
                }
            }
            const restantes = await ipcRenderer.invoke('count-ventas-pendientes').catch(() => 0);
            actualizarBannerOffline(restantes);
        } catch(e) { console.error('Error sincronizando:', e); }
    }

    if (!window._pendingSync) return;
    // MEJ-03 FIX: usar sqliteStorage como fuente de re-sync (no localStorage).
    // localStorage puede tener datos desactualizados de sesiones anteriores y
    // sobrescribir datos más nuevos que ya están en Supabase.
    const keys = ['categories','products','clients','salesHistory','quotes',
                  'incomes','expenses','receivables','payables','pedidos',
                  'equipos','roiHistorial','roiConfig','envioAnillos',
                  'gastosRecurrentes','stockMovimientos','pedidosFinalizados','notas','storeConfig'];
    let ok = true;
    for (const key of keys) {
        try {
            // Leer desde sqliteStorage (fuente primaria, siempre actualizada)
            const localData = await sqliteStorage.get(key, null);
            if (localData === null) continue;
            // FIX #5: usar timestamp de sync para resolver conflictos, no array.length
            const localMeta = await sqliteStorage.get('__meta_' + key, null);
            const localSyncedAt = localMeta?.syncedAt || '1970-01-01T00:00:00.000Z';
            const { data: remote } = await db.from('store').select('value').eq('key', key).maybeSingle().catch(() => ({ data: null }));
            let shouldSync = true;
            if (remote && remote.value) {
                try {
                    const remoteData = JSON.parse(remote.value);
                    const remoteSyncedAt = remoteData?.__syncedAt || '1970-01-01T00:00:00.000Z';
                    // Solo sobrescribir si nuestro sync local es más nuevo que el remoto
                    if (remoteSyncedAt > localSyncedAt) {
                        shouldSync = false; // Supabase tiene datos más recientes
                    }
                } catch(e) { /* si no se puede parsear el remoto, sincronizar */ }
            }
            if (!shouldSync) continue;
            const { error } = await db.from('store').upsert(
                { key, value: JSON.stringify(localData) }, { onConflict: 'key' }
            );
            if (error) { ok = false; break; }
        } catch(e) { ok = false; break; }
    }
    if (ok) {
        window._pendingSync = false;
        actualizarIndicadorConexion(true);
        manekiToastExport('✅ Datos sincronizados con Supabase', 'ok');
    }
}

window.addEventListener('online', () => {
    actualizarIndicadorConexion(true);
    sincronizarPendientes();
});
window.addEventListener('offline', () => {
    actualizarIndicadorConexion(false);
});

// Revisar ventas pendientes al iniciar
setTimeout(() => {
    if (ipcRenderer) {
        ipcRenderer.invoke('count-ventas-pendientes')
            .then(n => { if (n > 0) actualizarBannerOffline(n); })
            .catch(e => console.warn('[Maneki DB]', e?.message || e));
    }
}, 3000);

async function sbSave(key, data) {
    // FIX #3: __syncedAt ya no se pone en arrays (JSON.stringify lo ignora).
    // El timestamp de sync se guarda como metadato separado en la key '__meta_<key>'.
    const dataConTimestamp = data;

    // 1) SQLite local primero — sin límite de espacio, sin internet
    const sqliteOk = await sqliteStorage.set(key, dataConTimestamp);
    if (!sqliteOk) {
        try { localStorage.setItem('maneki_' + key, JSON.stringify(dataConTimestamp)); } catch(e) {
            if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
                console.warn('[Storage] localStorage lleno');
            } else {
                console.warn('localStorage también falló:', key, e);
            }
        }
    }
    // 2) Supabase en la nube — sincronización asíncrona
    try {
        if (!db) {
            // db aún inicializándose — encolar para sync cuando esté listo. SQLite ya guardó.
            window._pendingSync = true;
            actualizarIndicadorConexion(false);
            return;
        }
        const { error } = await _withTimeout(db.from('store').upsert(
            { key, value: JSON.stringify(dataConTimestamp) }, { onConflict: 'key' }
        ));
        if (error) {
            window._pendingSync = true;
            actualizarIndicadorConexion(false);
            throw new Error(error.message || 'Error de Supabase');
        }
        else {
            actualizarIndicadorConexion(true);
            // FIX #3: guardar timestamp de sync como metadato separado
            sqliteStorage.set('__meta_' + key, { syncedAt: new Date().toISOString() }).catch(e => console.warn('[Maneki DB]', e?.message || e));
        }
    } catch(e) {
        console.error('sbSave error de red:', e);
        window._pendingSync = true;
        actualizarIndicadorConexion(false);
        throw e;
    }
}

async function sbLoad(key, def) {
    // 1) Intentar Supabase primero (datos más frescos / multi-dispositivo)
    // ✅ FIX: usar .maybeSingle() en lugar de .single()
    // .single() lanza error 406 cuando no existe la fila; .maybeSingle() retorna null sin error
    try {
        const { data, error } = await _withTimeout(db.from('store').select('value').eq('key', key).maybeSingle());
        if (!error && data) {
            try {
                const parsed = JSON.parse(data.value);
                // Guardar en SQLite local como caché (sin esperar)
                sqliteStorage.set(key, parsed).catch(e => console.warn('[Maneki DB]', e?.message || e));
                return parsed;
            } catch(e) { console.warn('Error parseando dato Supabase:', e); }
        }
    } catch(e) { console.warn('sbLoad Supabase no disponible, usando SQLite local:', key); }

    // 2) Fallback: SQLite local (sin límite, sin internet)
    const localSQLite = await sqliteStorage.get(key, null);
    if (localSQLite !== null) {
        return localSQLite;
    }

    // 3) Último recurso: localStorage (por si hay datos viejos)
    try {
        const local = localStorage.getItem('maneki_' + key);
        if (local) {
            const parsed = JSON.parse(local);
            // Migrar a SQLite si se encontró en localStorage
            sqliteStorage.set(key, parsed).then(() => {
                localStorage.removeItem('maneki_' + key);
            }).catch(e => console.warn('[Maneki DB]', e?.message || e));
            return parsed;
        }
    } catch(e) { console.warn('Error en localStorage fallback:', e); }

    return def;
}

// SQLITE MONITOR: mostrar info de almacenamiento real (SQLite, sin límite)
async function verificarEspacioAlmacenamiento() {
    try {
        const sqliteInfo = await sqliteStorage.getSize();
        const sqliteKB = sqliteInfo.dbKB || sqliteInfo.kb || 0;

        let lsBytes = 0;
        for (let k in localStorage) {
            if (localStorage.hasOwnProperty(k)) lsBytes += (localStorage[k].length + k.length) * 2;
        }
        const lsKB = Math.round(lsBytes / 1024);

        if (lsKB > 4500) {
            manekiToastExport(
                `ℹ️ Migrando datos a SQLite local (más espacio). Un momento...`,
                'ok'
            );
        }
        return { sqliteKB, lsKB };
    } catch(e) { return { sqliteKB: 0, lsKB: 0 }; }
}
// FIX #17: almacenar referencia del interval para posible cleanup
setTimeout(verificarEspacioAlmacenamiento, 10000);
window._storageCheckInterval = setInterval(verificarEspacioAlmacenamiento, 10 * 60 * 1000);

// Compatibilidad - ya no usamos localStorage directo
function saveToLocalStorage(key, data) {}

// ─── Ver estado del almacenamiento desde la app ───────────────
async function mostrarEstadoAlmacenamiento() {
    const info = await verificarEspacioAlmacenamiento();
    const msg = [
        `💾 SQLite local: ${info.sqliteKB} KB (sin límite práctico)`,
        `📋 localStorage: ${info.lsKB} KB / 5,120 KB`,
        `✅ Almacenamiento principal: SQLite (ilimitado)`,
    ].join('\n');
    manekiToastExport(`💾 SQLite: ${info.sqliteKB}KB | Cache: ${info.lsKB}KB`, 'ok');
    console.log('Estado almacenamiento:\n' + msg);
}
window.mostrarEstadoAlmacenamiento = mostrarEstadoAlmacenamiento;

// BUG #15 FIX: getNextFolio con fallback offline
// ✅ FIX: usar .maybeSingle() en lugar de .single() para evitar error 406
let _localFolioCounters = {};
async function getNextFolio(tipo) {
    const key = 'contador_' + tipo;
    try {
        const { data } = await db.from('store').select('value').eq('key', key).maybeSingle();
        let actual = 0;
        if (data) actual = parseInt(JSON.parse(data.value)) || 0;
        const siguiente = actual + 1;
        db.from('store').upsert({ key: key, value: JSON.stringify(siguiente) }, { onConflict: 'key' })
            .catch(e => console.warn('[Maneki DB]', e?.message || e));
        _localFolioCounters[tipo] = siguiente;
        return siguiente;
    } catch(e) {
        // Fallback offline: usar máximo de folios existentes en salesHistory
        if (tipo === 'venta') {
            const maxExistente = salesHistory.reduce((max, s) => {
                const n = parseInt((s.folio || '').replace('V-', '')) || 0;
                return n > max ? n : max;
            }, _localFolioCounters[tipo] || 0);
            _localFolioCounters[tipo] = maxExistente + 1;
            return _localFolioCounters[tipo];
        }
        _localFolioCounters[tipo] = (_localFolioCounters[tipo] || 0) + 1;
        return _localFolioCounters[tipo];
    }
}

// Wrapper con manejo de errores visible
// UX-07 FIX: sbSaveConFeedback antes mostraba toast de éxito siempre,
// aunque Supabase hubiera devuelto un error interno. Ahora sbSave lanza
// si hay error de red/Supabase, y este wrapper lo captura correctamente.
function sbSaveConFeedback(key, data, nombreAmigable) {
    (async () => {
        try {
            await sbSave(key, data);
            // Toast de éxito solo si no hubo excepción
            manekiToastExport(`✅ ${nombreAmigable || key} guardado.`, 'ok');
        } catch(e) {
            manekiToastExport(`❌ Error al guardar ${nombreAmigable || key}. Revisa tu conexión.`, 'err');
            console.error('sbSave error:', key, e);
        }
    })();
}

function saveCategories()  { (async () => { await sbSave('categories', categories); })(); }
let stockMovimientos = [];
function saveStockMovimientos() { (async () => { await sbSave('stockMovimientos', stockMovimientos); })(); }

function registrarMovimiento(productoId, productoNombre, tipo, cantidad, motivo) {
    stockMovimientos.push({
        id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        fecha: _fechaHoy(),
        hora: new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'}),
        productoId, productoNombre, tipo, cantidad, motivo
    });
    if ((window.stockMovimientos || []).length > 500) {
        window.stockMovimientos = window.stockMovimientos.slice(-500);
    }
    if (stockMovimientos.length > 500) {
        stockMovimientos.splice(0, stockMovimientos.length - 500);
    }
    saveStockMovimientos();
}
// ── Comprime un data URL base64 usando Canvas (max 1200px, calidad 0.82) ──
// Devuelve un nuevo data URL JPEG comprimido, siempre < 1 MB aprox.
function _comprimirBase64(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const MAX = 1200;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else       { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(dataUrl); // Si falla, usar original
        img.src = dataUrl;
    });
}

// ── Sube imagen base64 a Supabase Storage y actualiza el producto ──
// Usa atob() (sin fetch) para evitar bloqueos CSP. Comprime antes de subir
// para no superar el límite de 2 MB del bucket product-images.
async function _migrarBase64AStorage(p) {
    if (!p.imageUrl || p.imageUrl.startsWith('http')) return p.imageUrl || null;
    if (!p.imageUrl.startsWith('data:')) return null;
    // MEJ-18: si ya falló antes, no reintentar hasta próxima sesión
    if (p._migrationFailed) return null;
    // MEJ-18: si ya migró exitosamente, no volver a intentar
    if (p._base64Migrated) return p.imageUrl;
    try {
        // 1) Comprimir antes de subir (evita el límite de 2 MB del bucket)
        const dataUrl = await _comprimirBase64(p.imageUrl);

        // 2) Parsear el data URL manualmente con atob() — sin fetch()
        const [meta, b64] = dataUrl.split(',');
        if (!meta || !b64) throw new Error('data URL malformada');
        const mime = meta.split(':')[1].split(';')[0]; // "image/jpeg"
        const ext  = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';

        // 3) Decodificar base64 a Uint8Array sin usar fetch()
        const binary = atob(b64);
        const bytes  = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });

        // 4) Subir a Storage
        const fileName = `producto_${p.id}_${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: mime });

        const { data, error } = await db.storage
            .from('product-images')
            .upload(fileName, file, { upsert: true });
        if (error) throw error;

        const { data: urlData } = db.storage
            .from('product-images')
            .getPublicUrl(fileName);

        // 5) Actualizar el producto en memoria con la URL pública
        p.imageUrl = urlData.publicUrl;
        p._base64Migrated = true; // MEJ-18: no re-intentar
        delete p._migrationFailed;
        console.log(`✅ Imagen migrada a Storage: ${p.name} →`, urlData.publicUrl);
        return urlData.publicUrl;
    } catch(e) {
        console.warn(`No se pudo migrar imagen de "${p.name}" a Storage:`, e);
        p._migrationFailed = true; // MEJ-18: evitar re-intentos en este ciclo de vida
        return null;
    }
}

// ── saveProducts — dual write: store (legacy) + public.products (relacional) ──
// Para productos terminados con mpComponentes, calcula el stock real desde MPs
// antes de escribir a la tabla relacional, para que Lovable muestre el stock correcto.
function _calcStockParaSupabase(p) {
    // Solo calcular si es producto terminado con componentes MP
    if (!p.mpComponentes || p.mpComponentes.length === 0) return p.stock || 0;
    const tieneMpFisica = p.mpComponentes.some(c => {
        const mp = (window.products || []).find(x => String(x.id) === String(c.id));
        return !mp || mp.tipo !== 'servicio';
    });
    if (!tieneMpFisica) return p.stock || 0;
    let minPiezas = Infinity;
    for (const comp of p.mpComponentes) {
        const mp = (window.products || []).find(x => String(x.id) === String(comp.id));
        if (mp && mp.tipo === 'servicio') continue;
        const stockMp = mp ? (mp.stock || 0) : 0;
        const qty = comp.qty || 1;
        const posibles = Math.floor(stockMp / qty);
        if (posibles < minPiezas) minPiezas = posibles;
    }
    return minPiezas === Infinity ? 0 : minPiezas;
}

function saveProducts() {
    return (async () => {
        // 1) Siempre escribir al store legacy (el CRM lo sigue leyendo de aquí)
        await sbSave('products', products);

        // 2) Dual write a tabla relacional public.products (para Lovable/web)
        try {
            // Migrar imágenes base64 a Storage antes de escribir
        await Promise.all(products.map(p => _migrarBase64AStorage(p)));

        const rows = products.map(p => ({
                id:               String(p.id),
                name:             p.name             || '',
                sku:              p.sku              || '',
                category:         p.category         || '',
                tipo:             p.tipo             || 'producto',
                cost:             Number(p.cost)     || 0,
                price:            Number(p.price)    || 0,
                stock:            _calcStockParaSupabase(p),   // ← stock calculado desde MPs
                stock_min:        Number(p.stockMin) || 0,
                image:            p.image            || null,
                image_url:        (p.imageUrl && p.imageUrl.startsWith('http')) ? p.imageUrl : null,
                tags:             p.tags             || [],
                variants:         p.variants         || [],
                mp_componentes:   p.mpComponentes    || [],
                proveedor:        p.proveedor        || null,
                notas:            p.notas            || null,
                publicar_tienda:  p.publicarTienda   === true,
                updated_at:       new Date().toISOString()
            }));
            const { error } = await db.from('products').upsert(rows, { onConflict: 'id' });
            if (error) console.error('saveProducts relacional error:', error);
        } catch(e) {
            console.error('saveProducts relacional excepción:', e);
        }
    })();
}
function saveClients()       { (async () => { await sbSave('clients', clients); })(); }
// ── saveSalesHistory — dual write: store (legacy) + public.sales_history ──
function saveSalesHistory() {
    (async () => {
        // 1) Store legacy
        await sbSave('salesHistory', salesHistory);

        // 2) Tabla relacional public.sales_history
        try {
            const rows = salesHistory.map(s => ({
                id:       String(s.id),
                folio:    s.folio    || null,
                date:     s.date     || null,
                time:     s.time     || null,
                customer: s.customer || null,
                concept:  s.concept  || null,
                note:     s.note     || null,
                products: s.products || [],
                subtotal: Number(s.subtotal) || 0,
                discount: Number(s.discount) || 0,
                tax:      Number(s.tax)      || 0,
                total:    Number(s.total)    || 0,
                method:   s.method   || null
            }));
            const { error } = await db.from('sales_history').upsert(rows, { onConflict: 'id' });
            if (error) console.error('saveSalesHistory relacional error:', error);
        } catch(e) {
            console.error('saveSalesHistory relacional excepción:', e);
        }
    })();
}
function saveQuotes()        { (async () => { await sbSave('quotes', quotes); })(); }
function saveIncomes()       { (async () => { await sbSave('incomes', incomes); })(); }
function saveExpenses()      { (async () => { await sbSave('expenses', expenses); })(); }
let gastosRecurrentes = [];
function saveGastosRecurrentes() { (async () => { await sbSave('gastosRecurrentes', gastosRecurrentes); })(); }
function saveReceivables()   { (async () => { await sbSave('receivables', receivables); })(); }
function savePayables()      { (async () => { await sbSave('payables', payables); })(); }
// ── savePedidos — dual write: store (legacy) + public.orders ──
function savePedidos() {
    return (async () => {
        // 1) Store legacy
        await sbSave('pedidos', pedidos);

        // 2) Tabla relacional public.orders
        try {
            const rows = pedidos.map(p => ({
                id:                   String(p.id),
                folio:                p.folio               || null,
                cliente:              p.cliente             || null,
                telefono:             p.telefono            || null,
                redes:                p.redes               || null,
                fecha:                p.fechaPedido         || p.fecha || null,  // BUG-PED-012 FIX: p.fechaPedido es el campo real
                entrega:              p.entrega             || null,
                concepto:             p.concepto            || null,
                cantidad:             Number(p.cantidad)    || 1,
                costo:                Number(p.costo)       || 0,
                anticipo:             Number(p.anticipo)    || 0,
                total:                Number(p.total)       || 0,
                resta:                Number(p.resta)       || 0,
                notas:                p.notas               || null,
                status:               p.status              || 'confirmado',
                fecha_creacion:       p.fechaCreacion       || null,
                productos_inventario: p.productosInventario || [],
                inventario_descontado: p.inventarioDescontado === true,
                from_quote:           p.fromQuote           || null,
                updated_at:           new Date().toISOString()
            }));
            const { error } = await db.from('orders').upsert(rows, { onConflict: 'id' });
            if (error) console.error('savePedidos relacional error:', error);
        } catch(e) {
            console.error('savePedidos relacional excepción:', e);
        }
    })();
}
// ── savePedidosFinalizados — dual write: store (legacy) + public.orders_finalizados ──
function savePedidosFinalizados() {
    return (async () => {
        // 1) Store legacy
        await sbSave('pedidosFinalizados', pedidosFinalizados);

        // 2) Tabla relacional public.orders_finalizados
        try {
            const rows = pedidosFinalizados.map(p => ({
                id:                    String(p.id),
                folio:                 p.folio                || null,
                cliente:               p.cliente              || null,
                telefono:              p.telefono             || null,
                redes:                 p.redes                || null,
                fecha:                 p.fechaPedido          || p.fecha || null,  // BUG-PED-012 FIX
                entrega:               p.entrega              || null,
                concepto:              p.concepto             || null,
                cantidad:              Number(p.cantidad)     || 1,
                costo:                 Number(p.costo)        || 0,
                anticipo:              Number(p.anticipo)     || 0,
                total:                 Number(p.total)        || 0,
                resta:                 Number(p.resta)        || 0,
                notas:                 p.notas                || null,
                status:                p.status               || 'finalizado',
                fecha_creacion:        p.fechaCreacion        || null,
                fecha_finalizado:      p.fechaFinalizado      || null,
                productos_inventario:  p.productosInventario  || [],
                inventario_descontado: p.inventarioDescontado === true,
                from_quote:            p.fromQuote            || null,
                updated_at:            new Date().toISOString()
            }));
            const { error } = await db.from('orders_finalizados').upsert(rows, { onConflict: 'id' });
            if (error) console.error('savePedidosFinalizados relacional error:', error);
        } catch(e) {
            console.error('savePedidosFinalizados relacional excepción:', e);
        }
    })();
}
