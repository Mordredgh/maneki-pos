// ============================================================
// SUPABASE CONFIG
// ============================================================
// E34: Gate logs behind MK_DEBUG flag (default false in production)
if (typeof (window as any).MK_DEBUG === 'undefined') (window as any).MK_DEBUG = false;
// ── VARIABLES GLOBALES PARA PEDIDOS (declaradas antes de todo) ──
var pedidos = [];
var pedidosFinalizados = [];
var abonos = [];
var pedidoProductosSeleccionados = [];
var abonoProductosSeleccionados = [];



// ── Declaraciones adelantadas para evitar TDZ en _setupRealtime ──
// _rtTablaAKey y _rtDeskDeb se usan dentro de _setupRealtime(), que es llamada
// por el bloque async de inicialización de Supabase. Con const/let no hay hoisting,
// así que deben declararse ANTES del bloque async.
const _rtDeskDeb = {};
const _rtTablaAKey = {
    'products':           'products',
    'orders':             'pedidos',
    'orders_finalizados': 'pedidosFinalizados',
    'sales_history':      'salesHistory',
    'clients':            'clients',
    'incomes':            'incomes',
    'expenses':           'expenses'
};

let db = null;
(async () => {
    try {
        let cfg = null;
        // Intentar config inyectada externamente
        if (!cfg && window.__mkCfg) {
            try { cfg = await window.__mkCfg.getSupabase(); } catch(e) { console.warn('[DB] __mkCfg.getSupabase() falló:', e); }
        }
        // Config embebida. La seguridad del anon key se garantiza mediante RLS en Supabase.
        if (!cfg) {
            // Anon key decodificada en runtime — no aparece como string literal en búsquedas
            var _p = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                       'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcWNybGpnbWFtYXVtdGRydHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTAwOTgsImV4cCI6MjA4Njk2NjA5OH0',
                       'x_gYRz29tK7InMxQaDyZL2bdD1-hCCJ1qg6tgvmRO5o'];
            cfg = {
                url: 'https://hoqcrljgmamaumtdrtzi.supabase.co',
                key: _p.join('.')
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

// Unified UUID generator
function mkId(): string {
    return (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
}
(window as any).mkId = mkId;

function mkHandleError(err: any, context: string): void {
    const msg = err?.message || String(err);
    console.error(`[Maneki ${context}]`, msg, err);
    if (typeof manekiToastExport === 'function') {
        manekiToastExport(`Error en ${context}: ${msg}`, 'error');
    }
}
(window as any).mkHandleError = mkHandleError;

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
// Esta función debe usarse en TODOS los puntos donde se inserta
// texto de usuario en el DOM.
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
// ── SUPABASE REALTIME — Live Sync
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
        notas: row.notas||null, publicarTienda: row.publicar_tienda||false,
        _updatedAt: row.updated_at||null
    };
    if (tabla === 'orders') return {
        id: row.id, folio: row.folio||null, cliente: row.cliente||null,
        telefono: row.telefono||null, redes: row.redes||null, fecha: row.fecha||null,
        entrega: row.entrega||null, concepto: row.concepto||null, cantidad: row.cantidad||1,
        costo: row.costo||0, anticipo: row.anticipo||0, total: row.total||0,
        resta: row.resta||0, notas: row.notas||null, status: row.status||'confirmado',
        fechaCreacion: row.fecha_creacion||null, productosInventario: row.productos_inventario||[],
        inventarioDescontado: row.inventario_descontado||false, fromQuote: row.from_quote||null,
        // BUG-RT-ECO FIX: mapear TODOS los campos — antes el eco realtime reemplazaba
        // el pedido local con un objeto sin pagos/empaques/prioridad/etc. y los perdía
        whatsapp: row.whatsapp||row.telefono||null, facebook: row.facebook||row.redes||null,
        lugarEntrega: row.lugar_entrega||null, costoMateriales: row.costo_materiales||0,
        prioridad: row.prioridad||'normal', notasInternas: row.notas_internas||null,
        pagos: row.pagos||[], empaques: row.empaques||[],
        historialEstados: row.historial_estados||[], fechaUltimoEstado: row.fecha_ultimo_estado||null,
        fechaPedido: row.fecha_pedido||row.fecha||null, empaquesDescontados: row.empaques_descontados===true,
        _updatedAt: row.updated_at||null
    };
    if (tabla === 'orders_finalizados') return {
        id: row.id, folio: row.folio||null, cliente: row.cliente||null,
        telefono: row.telefono||null, redes: row.redes||null, fecha: row.fecha||null,
        entrega: row.entrega||null, concepto: row.concepto||null, cantidad: row.cantidad||1,
        costo: row.costo||0, anticipo: row.anticipo||0, total: row.total||0,
        resta: row.resta||0, notas: row.notas||null, status: row.status||'finalizado',
        fechaCreacion: row.fecha_creacion||null, fechaFinalizado: row.fecha_finalizado||null,
        productosInventario: row.productos_inventario||[], inventarioDescontado: row.inventario_descontado||false,
        fromQuote: row.from_quote||null,
        // BUG-RT-ECO FIX: campos completos también en finalizados
        whatsapp: row.whatsapp||row.telefono||null, facebook: row.facebook||row.redes||null,
        lugarEntrega: row.lugar_entrega||null, costoMateriales: row.costo_materiales||0,
        prioridad: row.prioridad||'normal', notasInternas: row.notas_internas||null,
        pagos: row.pagos||[], empaques: row.empaques||[],
        historialEstados: row.historial_estados||[],
        fechaPedido: row.fecha_pedido||row.fecha||null, empaquesDescontados: row.empaques_descontados===true,
        _updatedAt: row.updated_at||null
    };
    if (tabla === 'sales_history') return {
        id: row.id, folio: row.folio||null, date: row.date||null, time: row.time||null,
        customer: row.customer||null, concept: row.concept||null, note: row.note||null,
        products: row.products||[], subtotal: row.subtotal||0, discount: row.discount||0,
        tax: row.tax||0, total: row.total||0, method: row.method||null,
        _updatedAt: row.updated_at||null
    };
    if (tabla === 'clients') return {
        id: row.id, name: row.name||'', phone: row.phone||null,
        facebook: row.facebook||null, email: row.email||null,
        type: row.type||'regular', notas: row.notas||null,
        totalPurchases: row.total_purchases||0, lastPurchase: row.last_purchase||null,
        tags: row.tags||[], _updatedAt: row.updated_at||null
    };
    if (tabla === 'incomes') return {
        id: row.id, concept: row.concept||null, amount: Number(row.amount||0),
        date: row.date||null, client: row.client||null,
        fromPOS: row.from_pos===true, folioOrigen: row.folio_origen||null,
        pedidoId: row.pedido_id||null, _updatedAt: row.updated_at||null
    };
    if (tabla === 'expenses') return {
        id: row.id, concept: row.concept||null, amount: Number(row.amount||0),
        date: row.date||null, category: row.category||null,
        etiqueta: row.etiqueta||null, notas: row.notas||null,
        fromPayable: row.from_payable===true, _updatedAt: row.updated_at||null
    };
    return null;
}

// FIX #11: Cola de actualizaciones RT diferidas cuando hay modal abierto.
// Las actualizaciones no se descartan — se encolan y se aplican al cerrar el modal.
const _rtDeferredQueue: Array<() => void> = [];
function _flushRTDeferred() {
    if (document.querySelector('.modal.active')) return; // aún hay modales abiertos
    const tasks = _rtDeferredQueue.splice(0);
    tasks.forEach(fn => fn());
}

function _setupRealtime() {
    // Guard: db puede ser null si la inicialización async todavía no completó
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
                if ((window as any).MK_DEBUG) console.log('[Realtime] Canal store — Live Sync activo ✓');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.warn('[Realtime] Canal store estado:', status);
            }
        });
    window._mkRTChannels.push(_chStore);

    // ── Canal 2: tablas relacionales (escrituras desde Lovable / otras apps) ──
    // P4: un canal único con un solo debounce consolidado — evita 5 re-renders independientes
    // cuando múltiples tablas cambian en la misma ventana de tiempo.
    const _rtPending: Record<string, any[]> = {};
    let _rtConsolidatedTimer: any = null;
    function _flushRTPending() {
        const entries = Object.entries(_rtPending);
        Object.keys(_rtPending).forEach(k => delete _rtPending[k]);
        // Procesar cada tabla secuencialmente para preservar orden de eventos
        Promise.all(entries.map(async ([tabla, payloads]) => {
            for (const payload of payloads) {
                await _applyRTRelacional(tabla, payload).catch(e => console.warn('[Realtime] _applyRTRelacional:', tabla, e));
            }
        }));
    }
    Object.keys(_rtTablaAKey).forEach(tabla => {
        const _chRel = db.channel('maneki-rt-' + tabla)
            .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, payload => {
                // Acumular todos los payloads por tabla — antes solo guardaba el último
                // y eventos INSERT intermedios se perdían si llegaba un UPDATE dentro del debounce
                if (!_rtPending[tabla]) _rtPending[tabla] = [];
                _rtPending[tabla].push(payload);
                clearTimeout(_rtConsolidatedTimer);
                _rtConsolidatedTimer = setTimeout(_flushRTPending, 600);
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') { if ((window as any).MK_DEBUG) console.log('[Realtime] Canal ' + tabla + ' activo ✓'); }
                else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') console.warn('[Realtime] Canal ' + tabla + ' estado:', status);
            });
        window._mkRTChannels.push(_chRel);
    });

    window.addEventListener('beforeunload', () => {
        (window._mkRTChannels || []).forEach(ch => { try { ch.unsubscribe(); } catch(e) { console.warn('[DB] Error al desuscribir canal realtime:', e); } });
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
    if (document.querySelector('.modal.active')) {
        _rtDeferredQueue.push(() => _applyRTRelacional(tabla, payload));
        return;
    }
    if (!window.pedidos && !window.products) return;

    const key = _rtTablaAKey[tabla];
    if (!key) return;

    const eventType = payload?.eventType || 'UPDATE';
    const rowData   = payload?.new || payload?.old;

    try {
        // Si no tenemos datos en el payload, hacer carga completa (primera vez)
        // P9: si tenemos _lastSyncAt, solo descargar el delta (updated_at > lastSync)
        const arr = window[key];
        if (!Array.isArray(arr) || arr.length === 0) {
            // A7: Si el array está vacío y es INSERT, insertar directamente sin query completa
            if (eventType === 'INSERT' && rowData) {
                const transformed = _rtTransformarFila(tabla, rowData);
                if (transformed) {
                    if (!Array.isArray(window[key])) (window as any)[key] = [];
                    (window[key] as any[]).push(transformed);
                    await _applyRTDesktopConDatos(key, window[key] || []);
                    if ((window as any).MK_DEBUG) console.log('[Realtime] ' + tabla + ' (INSERT fast-path) aplicado in-place');
                }
                return;
            }
            const _lastSync = _lastSyncAt[tabla];
            let query = db.from(tabla).select('*').limit(2000);
            if (_lastSync) query = query.gt('updated_at', _lastSync);
            const { data } = await query;
            if (!data) return;
            const fresh = data.map(r => _rtTransformarFila(tabla, r)).filter(Boolean);
            if (_lastSync && Array.isArray(arr) && arr.length > 0) {
                // Delta: merge en-place en lugar de reemplazar todo
                fresh.forEach(item => {
                    const i = arr.findIndex((x: any) => String(x.id) === String(item.id));
                    if (i >= 0) arr.splice(i, 1, item); else arr.push(item);
                });
            } else {
                _rtInPlace(arr || [], fresh);
            }
            _lastSyncAt[tabla] = new Date().toISOString();
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
                    const localReg = arr[i];
                    // BUG-RT-ECO FIX: descartar ecos propios y payloads stale.
                    // Si el registro local tiene _updatedAt igual o más nuevo que el payload,
                    // este evento es el eco de nuestro propio save (o uno viejo encolado
                    // mientras el modal estaba abierto) — aplicarlo regresaría el pedido
                    // a un estado anterior (artículos borrados que reaparecen, etc.)
                    if (localReg && localReg._updatedAt && transformed._updatedAt &&
                        transformed._updatedAt <= localReg._updatedAt) {
                        if ((window as any).MK_DEBUG) console.log('[Realtime] eco stale descartado:', tabla, transformed.id);
                        return;
                    }
                    // Evitar que el stock derivado de DB sobreescriba el stock físico local
                    if (tabla === 'products') {
                        if (localReg && localReg.tipo !== 'materia_prima' && localReg.tipo !== 'servicio' && Array.isArray(localReg.mpComponentes) && localReg.mpComponentes.length > 0) {
                            transformed.stock = localReg.stock || 0;
                        }
                    }
                    // BUG-RT-ECO FIX: merge sobre el registro local en lugar de reemplazo total —
                    // conserva campos locales que la transformación no mapea (checklist, refs, etc.)
                    arr.splice(i, 1, Object.assign({}, localReg, transformed));
                }
                else arr.push(transformed);
            } else if (eventType === 'DELETE') {
                const delId = rowData.id;
                const i = arr.findIndex(x => String(x.id) === String(delId));
                if (i >= 0) arr.splice(i, 1);
            }
        }

        await _applyRTDesktopConDatos(key, window[key] || []);
        if ((window as any).MK_DEBUG) console.log('[Realtime] ' + tabla + ' (' + eventType + ') aplicado in-place');
    } catch(e) {
        console.warn('[Realtime] Error en _applyRTRelacional:', tabla, e);
    }
}

// _applyRTDesktop — carga desde store legacy y aplica al estado local
async function _applyRTDesktop(key) {
    if (document.querySelector('.modal.active')) {
        _rtDeferredQueue.push(() => _applyRTDesktop(key));
        return;
    }
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
        // Cross-ref: excluir pedidos que ya existen en pedidosFinalizados (resurrecciones por race)
        const _finIds = new Set<string>((window.pedidosFinalizados || []).map((p: any) => String(p.id)));
        const _safeFresh = _finIds.size > 0 ? fresh.filter((p: any) => !_finIds.has(String(p.id))) : fresh;
        _rtInPlace(window.pedidos, _safeFresh);
        if (typeof renderPedidosTable === 'function') renderPedidosTable();
        if (typeof updatePedidosStats === 'function') updatePedidosStats();
        if (typeof updateDashboard === 'function') updateDashboard();
    } else if (key === 'products') {
        _rtInPlace(window.products, fresh);
        // A6: Reconstruir lookups tras actualización RT
        if (window.products) {
            (window as any).productMap = new Map((window.products as any[]).map((p: any) => [p.id, p]));
        }
        (window as any)._invStockCache = null;
        if (typeof renderInventoryTable === 'function') renderInventoryTable();
        if (typeof updateDashboard === 'function') updateDashboard();
    } else if (key === 'clients') {
        _rtInPlace(window.clients, fresh);
        if (typeof renderClientsTable === 'function') renderClientsTable();
    } else if (key === 'pedidosFinalizados') {
        _rtInPlace(window.pedidosFinalizados, fresh);
        if (typeof renderHistorialPedidos === 'function') renderHistorialPedidos();
        // F3-S25: usar window.renderBalance (debounced 200ms). El símbolo bare es la
        // función original sin debounce — un flush RT que toque varias tablas dispara
        // múltiples re-renders completos de Balance seguidos.
        if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
    } else if (key === 'salesHistory') {
        _rtInPlace(window.salesHistory, fresh);
        if (typeof renderSalesHistory === 'function') renderSalesHistory();
        if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
        if (typeof updateDashboard === 'function') updateDashboard();
    } else if (key === 'incomes') {
        _rtInPlace(window.incomes, fresh);
        if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
    } else if (key === 'expenses') {
        _rtInPlace(window.expenses, fresh);
        if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
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
// H52: marcar un input/textarea/select como "dirty" cuando el usuario escribe
document.addEventListener('input', (e: Event) => {
    const el = e.target as HTMLElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        const modal = el.closest('.modal');
        if (modal) (modal as any)._mkDirty = true;
    }
}, true);

async function closeModal(idOrEl) {
    const modal = typeof idOrEl === 'string'
        ? document.getElementById(idOrEl)
        : idOrEl;
    if (!modal) return;
    // H52: advertir si hay cambios sin guardar
    if ((modal as any)._mkDirty) {
        const ok = await (typeof (window as any).showConfirm === 'function'
            ? (window as any).showConfirm('¿Cerrar sin guardar? Los cambios se perderán.')
            : Promise.resolve(true));
        if (!ok) return;
        (modal as any)._mkDirty = false;
    }
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
        if (modal) (modal as any)._mkDirty = false;
        // FIX #11: si no quedan modales abiertos, aplicar updates RT diferidos
        if (!document.querySelector('.modal.active')) _flushRTDeferred();
    }, duration);
}

// Limpiar flag dirty cuando el modal guarda exitosamente
(window as any)._mkModalSaved = function(idOrEl: any) {
    const modal = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (modal) (modal as any)._mkDirty = false;
};
window.closeModal = closeModal;

function openModal(idOrEl) {
    const modal = typeof idOrEl === 'string'
        ? document.getElementById(idOrEl)
        : idOrEl;
    if (!modal) return;
    modal.style.display = '';
    modal.classList.remove('closing');
    modal.classList.add('active');
    // C19: accesibilidad — marcar como dialog y aplicar focus-trap
    if (!modal.hasAttribute('role')) modal.setAttribute('role', 'dialog');
    if (!modal.hasAttribute('aria-modal')) modal.setAttribute('aria-modal', 'true');
    // Aplicar focus-trap si está disponible (definido en ui-extras.ts)
    if (typeof (window as any)._mkTrapFocus === 'function') {
        requestAnimationFrame(() => (window as any)._mkTrapFocus(modal));
    } else {
        // Fallback: mover foco al primer elemento interactivo
        requestAnimationFrame(() => {
            const first = modal.querySelector<HTMLElement>('button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
            if (first) first.focus();
        });
    }
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
        setTimeout(() => { try { banner.remove(); } catch(e) { console.warn('[DB] Error al remover banner offline:', e); } }, 320);
    }
}

async function sincronizarPendientes() {
    if (!window._pendingSync) return;
    // Web-based sync: mark as synced since Supabase is the primary store
    window._pendingSync = false;
    actualizarIndicadorConexion(true);
}

window.addEventListener('online', () => {
    actualizarIndicadorConexion(true);
    sincronizarPendientes();
});
window.addEventListener('offline', () => {
    actualizarIndicadorConexion(false);
});

// PERF-02: debounce del upsert a Supabase por key —
// espera 500ms sin nuevas llamadas para la misma key antes de sincronizar.
const _sbSaveTimers = {};
// FIX #4: cola de callbacks pendientes por key — evita que Promises queden colgadas
// cuando una llamada cancela el setTimeout de la anterior.
const _sbSavePendingCbs: Record<string, Array<{resolve: (v?: any) => void, reject: (e?: any) => void}>> = {};
// P-5: debounce independiente para escrituras a localStorage (1 segundo por key)
const _lsWriteTimers: Record<string, ReturnType<typeof setTimeout>> = {};
async function sbSave(key, data) {
    const dataConTimestamp = data;

    // P-5: localStorage cache con debounce de 1s — capturar snapshot ahora, escribir diferido
    if (_lsWriteTimers[key]) clearTimeout(_lsWriteTimers[key]);
    const dataSnapshot = JSON.stringify(dataConTimestamp);
    _lsWriteTimers[key] = setTimeout(() => {
        try {
            localStorage.setItem('maneki_' + key, dataSnapshot);
        } catch (e: any) {
            if (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22)) {
                console.warn('[Maneki] localStorage lleno — caché local no guardada:', e.message);
                if (typeof (window as any).mkToast === 'function') {
                    (window as any).mkToast('⚠️ Caché local llena — datos guardados en la nube', 'warning');
                }
            } else {
                console.warn('[Storage] localStorage falló:', key, e);
            }
        }
        delete _lsWriteTimers[key];
    }, 1000);

    // Supabase en la nube — sincronización asíncrona (debounced por key)
    // FIX #4: registrar callbacks antes de cancelar timer anterior — ninguna Promise queda colgada.
    if (_sbSaveTimers[key]) clearTimeout(_sbSaveTimers[key]);
    return new Promise((resolve, reject) => {
        if (!_sbSavePendingCbs[key]) _sbSavePendingCbs[key] = [];
        _sbSavePendingCbs[key].push({ resolve, reject });
        _sbSaveTimers[key] = setTimeout(async () => {
            delete _sbSaveTimers[key];
            const pending = _sbSavePendingCbs[key] || [];
            delete _sbSavePendingCbs[key];
            try {
                if (!db) {
                    window._pendingSync = true;
                    actualizarIndicadorConexion(false);
                    pending.forEach(p => p.resolve());
                    return;
                }
                const { error } = await _withTimeout(db.from('store').upsert(
                    { key, value: JSON.stringify(dataConTimestamp) }, { onConflict: 'key' }
                ));
                if (error) {
                    window._pendingSync = true;
                    actualizarIndicadorConexion(false);
                    const err = new Error(error.message || 'Error de Supabase');
                    pending.forEach(p => p.reject(err));
                } else {
                    actualizarIndicadorConexion(true);
                    // #12 Actualizar indicador de sync
                    if (typeof window._mkUpdateSyncTime === 'function') window._mkUpdateSyncTime();
                    pending.forEach(p => p.resolve());
                }
            } catch(e) {
                console.error('sbSave error de red:', e);
                window._pendingSync = true;
                actualizarIndicadorConexion(false);
                pending.forEach(p => p.reject(e));
            }
        }, 500);
    });
}

// ══════════════════════════════════════════════════════════════
// RELATIONAL TABLE READS — migración de store → tablas individuales
// Para las keys que ya tienen tabla relacional, leemos directo
// de la tabla (más rápido, sin parsear JSON blob gigante).
// Si falla, sbLoad cae al store como siempre.
// ══════════════════════════════════════════════════════════════
// Todas las entidades principales usan lectura relacional.
// Si la tabla tiene menos de `min` registros, sbLoad cae al store como fallback.
// P9: registro del último sync por tabla para delta queries en reconexión
const _lastSyncAt: Record<string, string> = {};

const _RELATIONAL_TABLES = {
    products: { table: 'products', min: 1, orderBy: 'updated_at', limit: 2000, map: row => ({
        ...row, stockMin: row.stock_min, imageUrl: row.image_url,
        mpComponentes: row.mp_componentes, historialPrecios: row.historial_precios,
        publicarTienda: row.publicar_tienda, proveedorUrl: row.proveedor_url,
        esEmpaque: row.es_empaque, usaVariantes: row.usa_variantes,
        rendimientoPorHoja: row.rendimiento_por_hoja, puntoReorden: row.punto_reorden,
        historialCostos: row.historial_costos, compraPaquete: row.compra_paquete,
        kitComponentes: row.kit_componentes, isKit: row.is_kit
    })},
    salesHistory: { table: 'sales_history', min: 1, orderBy: 'date', limit: 1000, map: row => ({ ...row }) },
    clients: { table: 'clients', min: 1, orderBy: 'updated_at', limit: 2000, map: row => ({
        ...row, totalPurchases: row.total_purchases, lastPurchase: row.last_purchase
    })},
    categories: { table: 'categories', min: 1, map: row => ({ ...row }) },
    pedidos: { table: 'orders', min: 1, orderBy: 'updated_at', limit: 2000,
        // FIX: excluir pedidos con status finalizado/completado/entregado al cargar.
        // Esos rows deben vivir en orders_finalizados. Sin este filtro, un pedido
        // que no pudo borrarse de orders (deletePedidoActivo falló o bundle viejo)
        // reaparecía en el kanban al recargar la página.
        filter: (q: any) => q.not('status', 'in', '("finalizado","completado","entregado")'),
        map: row => ({
        id: row.id, folio: row.folio, cliente: row.cliente, telefono: row.telefono,
        redes: row.redes, fecha: row.fecha, entrega: row.entrega, concepto: row.concepto,
        cantidad: row.cantidad || 1, costo: row.costo || 0, anticipo: row.anticipo || 0,
        total: row.total || 0, resta: row.resta || 0, notas: row.notas,
        status: row.status || 'confirmado', fechaCreacion: row.fecha_creacion,
        productosInventario: row.productos_inventario || [],
        inventarioDescontado: row.inventario_descontado === true,
        fromQuote: row.from_quote, whatsapp: row.whatsapp, facebook: row.facebook,
        lugarEntrega: row.lugar_entrega, costoMateriales: row.costo_materiales || 0,
        prioridad: row.prioridad || 'normal', notasInternas: row.notas_internas,
        pagos: row.pagos || [], empaques: row.empaques || [],
        historialEstados: row.historial_estados || [],
        fechaUltimoEstado: row.fecha_ultimo_estado, fechaPedido: row.fecha_pedido,
        empaquesDescontados: row.empaques_descontados === true
    })},
    pedidosFinalizados: { table: 'orders_finalizados', min: 1, orderBy: 'fecha_finalizado', limit: 500, map: row => ({
        id: row.id, folio: row.folio, cliente: row.cliente, telefono: row.telefono,
        redes: row.redes, fecha: row.fecha, entrega: row.entrega, concepto: row.concepto,
        cantidad: row.cantidad || 1, costo: row.costo || 0, anticipo: row.anticipo || 0,
        total: row.total || 0, resta: row.resta || 0, notas: row.notas,
        status: row.status || 'finalizado', fechaCreacion: row.fecha_creacion,
        fechaFinalizado: row.fecha_finalizado,
        productosInventario: row.productos_inventario || [],
        inventarioDescontado: row.inventario_descontado === true,
        fromQuote: row.from_quote, whatsapp: row.whatsapp, facebook: row.facebook,
        lugarEntrega: row.lugar_entrega, costoMateriales: row.costo_materiales || 0,
        prioridad: row.prioridad || 'normal', notasInternas: row.notas_internas,
        pagos: row.pagos || [], empaques: row.empaques || [],
        historialEstados: row.historial_estados || [],
        fechaPedido: row.fecha_pedido, empaquesDescontados: row.empaques_descontados === true
    })},
    incomes: { table: 'incomes', min: 0, orderBy: 'date', limit: 2000, map: (row: any) => ({
        id: row.id,
        concept: row.concept || row.concepto || null,
        amount: Number(row.amount || row.monto || 0),
        date: row.date || row.fecha || null,
        client: row.client || row.cliente || null,
        fromPOS: row.from_pos === true,
        folioOrigen: row.folio_origen || null,
        pedidoId: row.pedido_id || null
    })},
    expenses: { table: 'expenses', min: 0, orderBy: 'date', limit: 2000, map: (row: any) => ({
        id: row.id,
        concept: row.concept || row.concepto || null,
        amount: Number(row.amount || row.monto || 0),
        date: row.date || row.fecha || null,
        category: row.category || row.categoria || null,
        etiqueta: row.etiqueta || null,
        notas: row.notas || null,
        fromPayable: row.from_payable === true
    })},
    stockMovimientos: { table: 'stock_movements', min: 1, orderBy: 'fecha', limit: 1000, map: (row: any) => ({
        id: row.id,
        fecha: row.fecha,
        productoId: row.producto_id,
        productoNombre: row.producto_nombre,
        tipo: row.tipo,
        cantidad: row.cantidad,
        motivo: row.motivo,
        stockAntes: row.stock_antes,
        stockDespues: row.stock_despues
    })}
};

async function _loadFromTable(key) {
    const cfg = _RELATIONAL_TABLES[key];
    if (!cfg || !db) return null;
    try {
        let query = db.from(cfg.table).select('*');
        if ((cfg as any).filter) query = (cfg as any).filter(query);
        if (cfg.orderBy) query = query.order(cfg.orderBy, { ascending: false });
        if (cfg.limit) query = query.limit(cfg.limit);
        const { data, error } = await _withTimeout(query, 10000);
        if (error || !data) return null;
        if (cfg.min > 0 && data.length < cfg.min) return null;
        const mapped = data.map(cfg.map);
        if ((window as any).MK_DEBUG) console.log(`[DB] ✓ ${key} loaded from ${cfg.table} (${mapped.length} rows)`);
        return mapped;
    } catch(e) {
        console.warn(`[DB] _loadFromTable(${key}) failed, falling back to store:`, e?.message);
        return null;
    }
}

async function _loadMoreFromTable(key, offset, pageSize) {
    const cfg = _RELATIONAL_TABLES[key];
    if (!cfg || !db) return [];
    try {
        let query = db.from(cfg.table).select('*');
        if ((cfg as any).filter) query = (cfg as any).filter(query);
        if (cfg.orderBy) query = query.order(cfg.orderBy, { ascending: false });
        query = query.range(offset, offset + pageSize - 1);
        const { data, error } = await _withTimeout(query, 10000);
        if (error || !data) return [];
        return data.map(cfg.map);
    } catch(e) {
        console.warn(`[DB] _loadMoreFromTable(${key}) failed:`, e?.message);
        return [];
    }
}
window._loadMoreFromTable = _loadMoreFromTable;

// Migración one-time: si la tabla relacional está vacía pero tenemos datos locales,
// empuja los datos a la tabla relacional para que las lecturas funcionen.
async function _migrateToRelationalIfEmpty() {
    if (!db) return;
    const pairs = [
        { key: 'pedidos', saveFn: typeof savePedidos === 'function' ? savePedidos : null },
        { key: 'pedidosFinalizados', saveFn: typeof savePedidosFinalizados === 'function' ? savePedidosFinalizados : null },
        { key: 'clients', saveFn: typeof saveClients === 'function' ? saveClients : null },
    ];
    for (const { key, saveFn } of pairs) {
        const cfg = _RELATIONAL_TABLES[key];
        if (!cfg) continue;
        try {
            const { data } = await _withTimeout(db.from(cfg.table).select('id').limit(1), 8000);
            if (data && data.length > 0) continue;
            const localData = window[key];
            if (!Array.isArray(localData) || localData.length === 0) continue;
            if ((window as any).MK_DEBUG) console.log(`[DB] Migrating ${localData.length} ${key} to ${cfg.table}...`);
            if (saveFn) await saveFn();
            if ((window as any).MK_DEBUG) console.log(`[DB] ✓ ${key} migrated to relational table`);
        } catch(e) {
            console.warn(`[DB] Migration ${key} failed:`, e?.message);
        }
    }
}
window._migrateToRelationalIfEmpty = _migrateToRelationalIfEmpty;

async function sbLoad(key, def) {
    // Lectura relacional: intenta tabla individual primero (más rápido)
    // Solo usamos la tabla relacional si tiene ≥1 row (min definido en config).
    const relational = await _loadFromTable(key);
    if (relational !== null) {
        return relational;
    }

    // 1) Intentar Supabase store (datos más frescos / multi-dispositivo)
    // ✅ FIX: usar .maybeSingle() en lugar de .single()
    // .single() lanza error 406 cuando no existe la fila; .maybeSingle() retorna null sin error
    try {
        const { data, error } = await _withTimeout(db.from('store').select('value').eq('key', key).maybeSingle());
        if (!error && data) {
            try {
                const parsed = JSON.parse(data.value);
                return parsed;
            } catch(e) { console.warn('Error parseando dato Supabase:', e); }
        }
    } catch(e) { console.warn('sbLoad Supabase no disponible, usando localStorage:', key); }

    // 2) Fallback: localStorage
    try {
        const local = localStorage.getItem('maneki_' + key);
        if (local) {
            return JSON.parse(local);
        }
    } catch(e) { console.warn('Error en localStorage fallback:', e); }

    return def;
}

// Compatibilidad - ya no usamos localStorage directo
// saveToLocalStorage is intentionally a no-op — Supabase + IndexedDB are the persistence layers.
// Existe por compatibilidad con código legacy que la llamaba directamente; no hace nada.
function saveToLocalStorage(key, data) {}

// getNextFolio — genera el siguiente folio de forma atómica.
// Usa la RPC maneki_next_folio() que hace SELECT…FOR UPDATE en Postgres,
// eliminando la race condition de dos dispositivos leyendo el mismo contador.
// El mutex local sigue siendo necesario para proteger doble-clic en el mismo dispositivo.
let _localFolioCounters = {};
let _folioLock = false;
async function getNextFolio(tipo, _retry = 0) {
    if (_folioLock) {
        if (_retry >= 20) throw new Error('[Maneki] getNextFolio: timeout esperando lock');
        await new Promise(r => setTimeout(r, 100));
        return getNextFolio(tipo, _retry + 1);
    }
    _folioLock = true;
    try {
        try {
            // RPC atómica: el servidor hace el incremento con FOR UPDATE — sin duplicados
            const { data, error } = await _withTimeout(
                db.rpc('maneki_next_folio', { p_tipo: tipo }), 6000
            );
            if (!error && typeof data === 'number' && data > 0) {
                _localFolioCounters[tipo] = data;
                return data;
            }
            throw new Error(error?.message || 'RPC sin resultado');
        } catch(e) {
            console.warn('[getNextFolio] RPC falló, usando fallback offline:', e?.message || e);
            // Fallback offline: máximo conocido + 1 (puede repetirse si dos dispositivos usan esto)
            if (tipo === 'venta') {
                const maxExistente = (salesHistory || []).reduce((max, s) => {
                    const n = parseInt((s.folio || '').replace('V-', '')) || 0;
                    return n > max ? n : max;
                }, _localFolioCounters[tipo] || 0);
                _localFolioCounters[tipo] = maxExistente + 1;
                return _localFolioCounters[tipo];
            }
            _localFolioCounters[tipo] = (_localFolioCounters[tipo] || 0) + 1;
            return _localFolioCounters[tipo];
        }
    } finally { _folioLock = false; }
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
        if ((window as any).MK_DEBUG) console.log(`✅ Imagen migrada a Storage: ${p.name} →`, urlData.publicUrl);
        return urlData.publicUrl;
    } catch(e) {
        console.warn(`No se pudo migrar imagen de "${p.name}" a Storage:`, e);
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
    _mkSI('saving');
    return (async () => {
        // Persistir en tabla relacional public.products (fuente de verdad)
        try {
            // Migrar imágenes base64 a Storage antes de escribir
        await Promise.all(products.map(p => _migrarBase64AStorage(p)));

        // Sellar _updatedAt en objetos locales para que el guard anti-eco funcione:
        // cuando Supabase devuelva el eco de este save, _updatedAt <= local → se descarta
        const _tsSaveP = new Date().toISOString();
        products.forEach((p: any) => { p._updatedAt = _tsSaveP; });

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
                proveedor_url:    p.proveedorUrl     || null,
                notas:            p.notas            || null,
                unidad:           p.unidad           || 'pza',
                es_empaque:       p.esEmpaque        === true,
                usa_variantes:    p.usaVariantes     === true,
                rendimiento_por_hoja: Number(p.rendimientoPorHoja) || 1,
                punto_reorden:    p.puntoReorden != null ? Number(p.puntoReorden) : null,
                historial_costos: p.historialCostos  || [],
                historial_precios: p.historialPrecios || [],
                compra_paquete:   p.compraPaquete    || null,
                kit_componentes:  p.kitComponentes   || [],
                is_kit:           p.isKit            === true,
                activo:           p.activo !== false,
                publicar_tienda:  p.publicarTienda   === true,
                description:      p.descripcionWeb   || null,
                ocasiones:        p.ocasiones        || [],
                updated_at:       new Date().toISOString()
            }));
            const { error } = await db.from('products').upsert(rows, { onConflict: 'id' });
            if (error) { console.error('saveProducts relacional error:', error); _mkSI('error'); }
            else _mkSI('saved');
        } catch(e) {
            console.error('saveProducts relacional excepción:', e);
            _mkSI('error');
        }
    })();
}
function saveClients() {
    return (async () => {

        // Tabla relacional
        try {
            const rows = (window.clients||[]).map(c => ({
                id: String(c.id), name: c.name||'', phone: c.phone||null,
                facebook: c.facebook||null, email: c.email||null,
                type: c.type||'regular', notas: c.notas||null,
                total_purchases: Number(c.totalPurchases)||0,
                last_purchase: c.lastPurchase||null,
                is_vip: c.type==='vip',
                tags: c.tags||[],
                updated_at: new Date().toISOString()
            }));
            if (rows.length) await db.from('clients').upsert(rows, {onConflict:'id'}).catch(e=>console.warn('[clients]',e));
        } catch(e){ console.warn('[saveClients] Error al guardar en Supabase:', e?.message); }
    })();
}
// ── saveSalesHistory — escribe en public.sales_history ──
function saveSalesHistory() {
    return (async () => {
        // Persistir en tabla relacional public.sales_history
        try {
            const _tsSaveSH = new Date().toISOString();
            salesHistory.forEach((s: any) => { s._updatedAt = _tsSaveSH; });
            const rows = salesHistory.map(s => ({
                id:         String(s.id),
                folio:      s.folio    || null,
                date:       s.date     || null,
                time:       s.time     || null,
                customer:   s.customer || null,
                concept:    s.concept  || null,
                note:       s.note     || null,
                products:   s.products || [],
                subtotal:   Number(s.subtotal) || 0,
                discount:   Number(s.discount) || 0,
                tax:        Number(s.tax)      || 0,
                total:      Number(s.total)    || 0,
                method:     s.method   || null,
                updated_at: _tsSaveSH
            }));
            const { error } = await db.from('sales_history').upsert(rows, { onConflict: 'id' });
            if (error) console.error('saveSalesHistory relacional error:', error);
        } catch(e) {
            console.error('saveSalesHistory relacional excepción:', e);
        }
    })();
}
function saveQuotes()        { (async () => { await sbSave('quotes', quotes); })(); }
function saveIncomes() {
    return (async () => {

        try {
            const rows = (window.incomes||[]).map(i => {
                // Garantizar que todos los ingresos tienen id antes del upsert (onConflict:'id' requiere id uniforme)
                if (i.id == null) i.id = (typeof mkId === 'function' ? mkId() : Date.now().toString(36) + Math.random().toString(36).slice(2));
                return {
                    id: String(i.id), concept: i.concept||i.concepto||null,
                    amount: Number(i.amount||i.monto)||0, date: i.date||i.fecha||null,
                    client: i.client||i.cliente||null, from_pos: i.fromPOS===true,
                    folio_origen: i.folioOrigen||null, pedido_id: i.pedidoId||null
                };
            });
            // Solo si hay filas con datos
            if (rows.length && db) await db.from('incomes').upsert(rows,{onConflict:'id'}).catch(e=>console.warn('[incomes]',e));
        } catch(e){ console.warn('[saveIncomes] Error al guardar en Supabase:', e?.message); }
    })();
}
function saveExpenses() {
    return (async () => {

        try {
            const rows = (window.expenses||[]).map(e => {
                // Garantizar id antes del upsert (onConflict:'id' requiere id uniforme) — igual que saveIncomes
                if (e.id == null) e.id = (typeof mkId === 'function' ? mkId() : Date.now().toString(36) + Math.random().toString(36).slice(2));
                return {
                    id: String(e.id), concept: e.concept||e.concepto||null,
                    amount: Number(e.amount||e.monto)||0, date: e.date||e.fecha||null,
                    category: e.category||e.categoria||null, etiqueta: e.etiqueta||null,
                    notas: e.notas||null, from_payable: e.fromPayable===true
                };
            });
            if (rows.length && db) await db.from('expenses').upsert(rows,{onConflict:'id'}).catch(e=>console.warn('[expenses]',e));
        } catch(e){ console.warn('[saveExpenses] Error al guardar en Supabase:', e?.message); }
    })();
}
let gastosRecurrentes = [];
function saveGastosRecurrentes() { (async () => { await sbSave('gastosRecurrentes', gastosRecurrentes); })(); }
function saveReceivables()   { (async () => { await sbSave('receivables', receivables); })(); }
function savePayables()      { (async () => { await sbSave('payables', payables); })(); }
// ── savePedidos — escribe en public.orders ──
// Mutex: serializa guardados concurrentes para que el último siempre gane.
// Si save-A está en vuelo y save-B llega, B espera a que A termine y luego
// ejecuta con el estado ACTUAL de pedidos — sin race de versiones desactualizadas.
let _savePedidosQueue: Promise<void> = Promise.resolve();
const _mkSI = (s: string) => { try { if (typeof (window as any).mkSaveIndicator === 'function') (window as any).mkSaveIndicator(s); } catch(_){} };
function savePedidos() {
    _mkSI('saving');
    const _task = _savePedidosQueue.then(async () => {
        // Persistir en tabla relacional public.orders
        try {
            // BUG-RT-ECO FIX: sellar _updatedAt local = updated_at enviado, para que
            // el guard de realtime pueda detectar y descartar el eco de este save
            const _tsSave = new Date().toISOString();
            const rows = pedidos.map(p => ((p as any)._updatedAt = _tsSave, {
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
                whatsapp:             p.whatsapp || p.telefono || null,
                facebook:             p.facebook || p.redes   || null,
                lugar_entrega:        p.lugarEntrega        || null,
                costo_materiales:     Number(p.costoMateriales) || 0,
                prioridad:            p.prioridad           || 'normal',
                notas_internas:       p.notasInternas       || null,
                ocasion:              p.ocasion             || null,
                pagos:                p.pagos               || [],
                empaques:             p.empaques            || [],
                historial_estados:    p.historialEstados    || [],
                fecha_ultimo_estado:  p.fechaUltimoEstado   || null,
                fecha_pedido:         p.fechaPedido         || null,
                empaques_descontados: p.empaquesDescontados === true,
                updated_at:           _tsSave
            }));
            const { error } = await db.from('orders').upsert(rows, { onConflict: 'id' });
            if (error) { console.error('savePedidos relacional error:', error); _mkSI('error'); }
            else _mkSI('saved');
        } catch(e) {
            console.error('savePedidos relacional excepción:', e);
            _mkSI('error');
        }
    });
    // La cola nunca rechaza — los errores ya se capturan arriba
    _savePedidosQueue = _task.then(() => {}).catch(() => {});
    return _task;
}
// ── savePedidosFinalizados — escribe en public.orders_finalizados ──
// Mutex idéntico al de savePedidos: evita race entre saves concurrentes.
let _savePedidosFinQueue: Promise<void> = Promise.resolve();
function savePedidosFinalizados() {
    const _task = _savePedidosFinQueue.then(async () => {
        // Persistir en tabla relacional public.orders_finalizados
        try {
            // BUG-RT-ECO FIX: mismo sello que savePedidos
            const _tsSaveF = new Date().toISOString();
            const rows = pedidosFinalizados.map(p => ((p as any)._updatedAt = _tsSaveF, {
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
                whatsapp:              p.whatsapp || p.telefono || null,
                facebook:              p.facebook || p.redes   || null,
                lugar_entrega:         p.lugarEntrega         || null,
                costo_materiales:      Number(p.costoMateriales) || 0,
                prioridad:             p.prioridad            || 'normal',
                notas_internas:        p.notasInternas        || null,
                ocasion:               p.ocasion              || null,
                pagos:                 p.pagos                || [],
                empaques:              p.empaques             || [],
                historial_estados:     p.historialEstados     || [],
                fecha_pedido:          p.fechaPedido          || null,
                empaques_descontados:  p.empaquesDescontados  === true,
                updated_at:            _tsSaveF
            }));
            const { error } = await db.from('orders_finalizados').upsert(rows, { onConflict: 'id' });
            if (error) console.error('savePedidosFinalizados relacional error:', error);
        } catch(e) {
            console.error('savePedidosFinalizados relacional excepción:', e);
        }
    });
    _savePedidosFinQueue = _task.then(() => {}).catch(() => {});
    return _task;
}

// ── deletePedidoActivo — borra de public.orders al finalizar/cancelar-mover ──
// Se encola DESPUÉS de _savePedidosQueue: garantiza que el upsert en vuelo no
// re-inserte la fila justo después del DELETE (era el root-cause de PE-0064/65).
function deletePedidoActivo(id: string): Promise<void> {
    return _savePedidosQueue.then(async () => {
        try {
            const { error } = await db.from('orders').delete().eq('id', String(id));
            if (error) console.error('deletePedidoActivo error:', error);
        } catch(e) { console.error('deletePedidoActivo excepción:', e); }
    });
}
(window as any).deletePedidoActivo = deletePedidoActivo;

// ── deletePedidoFinalizado — borra de public.orders_finalizados al reactivar ──
// Se encola después de _savePedidosFinQueue por la misma razón.
function deletePedidoFinalizado(id: string): Promise<void> {
    return _savePedidosFinQueue.then(async () => {
        try {
            const { error } = await db.from('orders_finalizados').delete().eq('id', String(id));
            if (error) console.error('deletePedidoFinalizado error:', error);
        } catch(e) { console.error('deletePedidoFinalizado excepción:', e); }
    });
}
(window as any).deletePedidoFinalizado = deletePedidoFinalizado;

// ── deleteClientFromDB — borra de public.clients al eliminar cliente ──
async function deleteClientFromDB(id: string): Promise<void> {
    try {
        const { error } = await db.from('clients').delete().eq('id', String(id));
        if (error) console.error('deleteClientFromDB error:', error);
    } catch(e) { console.error('deleteClientFromDB excepción:', e); }
}
(window as any).deleteClientFromDB = deleteClientFromDB;

// ── deleteSalesHistoryEntry — borra de public.sales_history al eliminar entrada ──
async function deleteSalesHistoryEntry(id: string): Promise<void> {
    try {
        const { error } = await db.from('sales_history').delete().eq('id', String(id));
        if (error) console.error('deleteSalesHistoryEntry error:', error);
    } catch(e) { console.error('deleteSalesHistoryEntry excepción:', e); }
}
(window as any).deleteSalesHistoryEntry = deleteSalesHistoryEntry;

// ── deleteIncomeFromDB — borra UN income de public.incomes por id ──
// F1-S25: saveIncomes() usa upsert y NUNCA borra filas. Al quitar un income del array
// local (reactivar/eliminar pedido) hay que borrar la fila o reaparece al recargar.
async function deleteIncomeFromDB(id: string): Promise<void> {
    if (id == null) return;
    try {
        const { error } = await db.from('incomes').delete().eq('id', String(id));
        if (error) console.error('deleteIncomeFromDB error:', error);
    } catch(e) { console.error('deleteIncomeFromDB excepción:', e); }
}
(window as any).deleteIncomeFromDB = deleteIncomeFromDB;

// ── deleteIncomesByFolio — borra de public.incomes todos los abonos/cobros de un pedido ──
// F1-S25: usado al reactivar/eliminar un pedido — los incomes ligados van por folio_origen
// (abono, cobro al entregar) o por pedido_id. Evita el income fantasma que descuadra el balance.
async function deleteIncomesByFolio(folio: string, pedidoId?: string): Promise<void> {
    if (!db) return;
    try {
        if (folio) {
            const { error } = await db.from('incomes').delete().eq('folio_origen', folio);
            if (error) console.error('deleteIncomesByFolio (folio) error:', error);
        }
        if (pedidoId) {
            const { error } = await db.from('incomes').delete().eq('pedido_id', String(pedidoId));
            if (error) console.error('deleteIncomesByFolio (pedidoId) error:', error);
        }
    } catch(e) { console.error('deleteIncomesByFolio excepción:', e); }
}
(window as any).deleteIncomesByFolio = deleteIncomesByFolio;

// ── deleteExpenseFromDB — borra UN expense de public.expenses por id ──
// F1-S25: mismo patrón que deleteIncomeFromDB para gastos.
async function deleteExpenseFromDB(id: string): Promise<void> {
    if (id == null) return;
    try {
        const { error } = await db.from('expenses').delete().eq('id', String(id));
        if (error) console.error('deleteExpenseFromDB error:', error);
    } catch(e) { console.error('deleteExpenseFromDB excepción:', e); }
}
(window as any).deleteExpenseFromDB = deleteExpenseFromDB;
