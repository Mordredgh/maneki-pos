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

const _deviceId = (() => {
    try {
        const key = 'maneki_device_id';
        let id = localStorage.getItem(key);
        if (!id) {
            id = mkId();
            localStorage.setItem(key, id);
        }
        return id;
    } catch (_) {
        return mkId();
    }
})();
(window as any)._mkDeviceId = _deviceId;

const _kvState = _loadLocalMirror('kvState') || {};
const _pendingKV: Record<string, string> = _kvState.pending || _loadLocalMirror('pendingKV') || {};
const _kvBases: Record<string, string | null> = _kvState.bases || {};
const _kvExpected: Record<string, Array<string | null>> = _kvState.expected || {};
type PendingRowWrite = { batch?: string; reason?:string; table: string; rows?: any[]; field?: string; value?: string; expected?: Record<string, any> };
const _pendingRows: PendingRowWrite[] = _loadLocalMirror('pendingRows') || [];
const _rowBases: Record<string, Record<string, any>> = _loadLocalMirror('rowBases') || {};
let _rowFlush: Promise<void> | null = null;
const _kvWriteQueues: Record<string, Promise<void>> = {};
let _posOperation: {id:string;reason:string;writes:PendingRowWrite[];tasks:Promise<any>[]} | null = null;
async function posRunOperation<T>(action:()=>Promise<T>,reason='Operacion del POS'):Promise<T> {
    if(_posOperation)throw new Error('Termina la operacion en curso antes de iniciar otra.');
    if(_rowFlush) await _rowFlush;
    if(_posOperation)throw new Error('Hay otra operacion en curso.');
    const operation={id:mkId(),reason,writes:[] as PendingRowWrite[],tasks:[] as Promise<any>[]};
    const keys=['products','pedidos','pedidosFinalizados','clients','salesHistory','incomes','expenses','stockMovements','stockMovimientos'];
    const before=Object.fromEntries(keys.map(k=>[k,JSON.stringify(window[k] || [])]));
    let prepared=false;
    _posOperation=operation;
    try {
        const value=await action();
        // Incluye guardados antiguos sin await y los que estos encolan.
        let completed=0;
        while(completed<operation.tasks.length){const tasks=operation.tasks.slice(completed);completed=operation.tasks.length;await Promise.all(tasks);}
        if(operation.writes.length){
            _pendingRows.push(...operation.writes);
            try{_persistPendingRows();}catch(e){_pendingRows.splice(-operation.writes.length);throw e;}
        }
        prepared=true;
        _posOperation=null;
        try {await _flushPendingRows();} catch(e:any){
            throw Object.assign(new Error('Operacion completa pendiente de sincronizar. No repitas el cobro. '+(e.message||'')),{pendingSync:true,code:e.code});
        }
        _mkSI('saved');
        return value;
    } catch(e) {
        if(!prepared){
            for(const key of keys){window[key]=JSON.parse(before[key]);_mirrorLocal(key,window[key]);}
            products=window.products;clients=window.clients;salesHistory=window.salesHistory;
            incomes=window.incomes;expenses=window.expenses;pedidos=window.pedidos;pedidosFinalizados=window.pedidosFinalizados;
        }
        throw e;
    } finally {_posOperation=null;actualizarEstadoGuardado();}
}
window.addEventListener('beforeunload',(event)=>{
    if(_posOperation){event.preventDefault();event.returnValue='';}
});

let db = null;
(window as any)._posDBReady = (async () => {
    try {
        if ((window as any)._posTabReady && !await (window as any)._posTabReady) return;
        let cfg = null;
        // Intentar config inyectada externamente
        if (!cfg && window.__mkCfg) {
            try { cfg = await window.__mkCfg.getSupabase(); } catch(e: any) { console.warn('[DB] __mkCfg.getSupabase() falló:', e); }
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
        if (typeof requirePOSAdmin === 'function') await requirePOSAdmin(db);
        window._dbReady = true;
        // Usar typeof para evitar ReferenceError si _pendingSync aún no fue declarada (TDZ con let)
        if (typeof sincronizarPendientes === 'function' && window._pendingSync) sincronizarPendientes();
        if (typeof _setupRealtime === 'function') _setupRealtime();
    } catch(e: any) {
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
function posFechaLocal(value:string):string {
    if(!value || !value.includes('T'))return value||'';
    const d=new Date(value);if(Number.isNaN(d.getTime()))return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
// Importes MXN en centavos enteros; compartidos por modulos iniciales y diferidos.
function posCentavos(value:any):number {
    const n=Number(value);if(!Number.isFinite(n))return 0;
    const magnitude=Math.abs(n);
    return Math.sign(n)*Math.round((magnitude+Number.EPSILON*magnitude)*100);
}
function mkRound2(value:any):number {return posCentavos(value)/100;}
function posTotalPagado(p:any):number {
    const cents=(p.pagos||[]).reduce((sum:number,ab:any)=>sum+posCentavos(ab.monto??ab.amount??0),0);
    return cents>0?cents/100:mkRound2(p.anticipo||0);
}
function calcSaldoPendiente(p:any):number {return Math.max(0,posCentavos(p.total)-posCentavos(posTotalPagado(p)))/100;}
window.mkRound2=mkRound2;window.calcSaldoPendiente=calcSaldoPendiente;
(window as any).mkId = mkId;

function _stampLocalSave(records: any[], ts: string) {
    (records || []).forEach((r: any) => {
        r._updatedAt = ts;
        r._updatedBy = _deviceId;
    });
}

function mkHandleError(err: any, context: string): void {
    const msg = err?.message || String(err);
    console.error(`[Bicho Capricho ${context}]`, msg, err);
    if (typeof manekiToastExport === 'function') {
        manekiToastExport(`Error en ${context}: ${msg}`, 'error');
    }
}
(window as any).mkHandleError = mkHandleError;

// ── Timeout wrapper para queries Supabase (evita UI freeze) ──────────
function _withTimeout(promise, ms = 8000) {
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
    _rememberRowBases(tabla, [row]);
    // ponytail: carga inicial y Realtime comparten el contrato relacional.
    const cfg = _RELATIONAL_TABLES[_rtTablaAKey[tabla]];
    return cfg ? cfg.map(row) : null;
}

// FIX #11: Cola de actualizaciones RT diferidas cuando hay modal abierto.
// Las actualizaciones no se descartan — se encolan y se aplican al cerrar el modal.
const _rtDeferredQueue: Array<() => void> = [];
function _flushRTDeferred() {
    if (document.querySelector('.modal.active, dialog[open]')) return; // aún hay modales abiertos
    const tasks = _rtDeferredQueue.splice(0);
    tasks.forEach(fn => fn());
}

window._flushRTDeferred = _flushRTDeferred;

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
        (window._mkRTChannels || []).forEach(ch => { try { ch.unsubscribe(); } catch(e: any) { console.warn('[DB] Error al desuscribir canal realtime:', e); } });
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
    if (document.querySelector('.modal.active, dialog[open]')) {
        _rtDeferredQueue.push(() => _applyRTRelacional(tabla, payload));
        return;
    }
    if (!window.pedidos && !window.products) return;

    const key = _rtTablaAKey[tabla];
    if (!key) return;
    if (_pendingRows.some(op => op.table === tabla)) return;

    const eventType = payload?.eventType || 'UPDATE';
    const rowData = eventType === 'DELETE' ? payload?.old : payload?.new;

    try {
        // Si no tenemos datos en el payload, hacer carga completa (primera vez)
        const arr = window[key];
        if (!Array.isArray(arr) || arr.length === 0) {
            // A7: Si el array está vacío y es INSERT, insertar directamente sin query completa
            if (eventType === 'INSERT' && rowData) {
                const transformed = _rtTransformarFila(tabla, rowData);
                if (transformed) {
                    if (!Array.isArray(window[key])) (window as any)[key] = [];
                    ((window as any)[key] as any[]).push(transformed);
                    await _applyRTDesktopConDatos(key, window[key] || []);
                    if ((window as any).MK_DEBUG) console.log('[Realtime] ' + tabla + ' (INSERT fast-path) aplicado in-place');
                }
                return;
            }
            let query = db.from(tabla).select('*').limit(2000);
            const relCfg = _RELATIONAL_TABLES[key];
            if (relCfg && (relCfg as any).filter) query = (relCfg as any).filter(query);
            const { data, error } = await query;
            if (error) throw error;
            if (!data) return;
            const fresh = data.map(r => _rtTransformarFila(tabla, r)).filter(Boolean);
            if (!Array.isArray(arr)) (window as any)[key] = [];
            _rtInPlace(window[key], fresh);
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
                    // D3: anti-eco por identidad. Si el payload trae _updatedBy de este
                    // dispositivo, es nuestro eco. Para tablas sin esa metadata, solo se
                    // descarta la coincidencia exacta sellada por este dispositivo.
                    const ownPayload = transformed._updatedBy && transformed._updatedBy === _deviceId;
                    const ownExactEcho = localReg && localReg._updatedBy === _deviceId &&
                        localReg._updatedAt && transformed._updatedAt &&
                        transformed._updatedAt === localReg._updatedAt;
                    if (ownPayload || ownExactEcho) {
                        if ((window as any).MK_DEBUG) console.log('[Realtime] eco propio descartado:', tabla, transformed.id);
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
    } catch(e: any) {
        console.warn('[Realtime] Error en _applyRTRelacional:', tabla, e);
    }
}

// _applyRTDesktop — carga desde store legacy y aplica al estado local
async function _applyRTDesktop(key) {
    if (document.querySelector('.modal.active, dialog[open]')) {
        _rtDeferredQueue.push(() => _applyRTDesktop(key));
        return;
    }
    if (!window.pedidos && !window.products) return;
    try {
        const fresh = await sbLoad(key, null);
        if (fresh === null) return;
        if (_isOwnStorePayload(fresh)) {
            if ((window as any).MK_DEBUG) console.log('[Realtime] eco propio store descartado:', key);
            return;
        }
        await _applyRTDesktopConDatos(key, fresh);
    } catch(e: any) {
        console.warn('[Realtime] Error aplicando cambio:', key, e);
    }
}

function _isOwnStorePayload(fresh: any): boolean {
    if (Array.isArray(fresh)) {
        const stamped = fresh.filter((x: any) => x && x._updatedBy);
        return stamped.length > 0 && stamped.every((x: any) => x._updatedBy === _deviceId);
    }
    return !!(fresh && typeof fresh === 'object' && fresh._updatedBy === _deviceId);
}

// _applyRTDesktopConDatos — aplica datos ya cargados y re-renderiza la UI.
// Compartido por _applyRTDesktop (canal store) y _applyRTRelacional (tablas relacionales).
async function _applyRTDesktopConDatos(key, fresh) {
    const _kvRender: Record<string, () => void> = {
        quotes: () => {
            if (typeof renderQuotesTable === 'function') renderQuotesTable();
        },
        receivables: () => {
            if (typeof renderReceivablesList === 'function') renderReceivablesList();
            if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
        },
        payables: () => {
            if (typeof renderPayablesList === 'function') renderPayablesList();
            if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
        },
        gastosRecurrentes: () => {
            if (typeof renderRecurrentesPanel === 'function') renderRecurrentesPanel();
            if (typeof (window as any).renderBalance === 'function') (window as any).renderBalance();
        },
        storeConfig: () => {
            if (typeof loadStoreConfigUI === 'function') loadStoreConfigUI();
            if (typeof loadLogoUI === 'function') loadLogoUI();
            if (typeof updateStorePreview === 'function') updateStorePreview();
        }
    };

    if (_kvRender[key]) {
        (window as any)[key] = fresh;
        try {
            if (key === 'quotes') quotes = fresh;
            else if (key === 'receivables') receivables = fresh;
            else if (key === 'payables') payables = fresh;
            else if (key === 'gastosRecurrentes') gastosRecurrentes = fresh;
            else if (key === 'storeConfig') storeConfig = fresh;
        } catch (_) {}
        _kvRender[key]();
        return;
    }

    if (!Array.isArray(fresh)) return;
    if (key === 'pedidos') {
        // Cross-ref: excluir pedidos que ya existen en pedidosFinalizados (resurrecciones por race)
        const _finIds = new Set<string>((window.pedidosFinalizados || []).map((p: any) => String(p.id)));
        const _safeFresh = fresh.filter((p: any) =>
            !_finIds.has(String(p.id)) && !['finalizado', 'completado', 'entregado'].includes(p.status));
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
function _comprimirFile(file):Promise<Blob> {
    return new Promise((resolve, reject) => {
        if (!String(file.type || '').startsWith('image/')) { reject(new Error('Selecciona un archivo de imagen válido.')); return; }
        if (file.size > 20 * 1024 * 1024) { reject(new Error('La imagen supera 20 MB. Usa una copia más pequeña.')); return; }
        let finished = false;
        const finish = (error?, blob?) => { if (finished) return; finished = true; clearTimeout(timer); error ? reject(error) : resolve(blob); };
        const timer = setTimeout(() => finish(new Error('La imagen tardó demasiado en procesarse. Prueba con otra foto.')), 15000);
        const reader = new FileReader();
        reader.onerror = () => finish(new Error('No se pudo leer la imagen. Selecciónala de nuevo.'));
        reader.onload = ev => {
            const img = new Image();
            img.onerror = () => finish(new Error('No se pudo abrir la imagen. Puede estar dañada o tener un formato incompatible.'));
            img.onload = () => {
                if (finished) return;
                try {
                    const ratio = Math.min(1200 / img.width, 1200 / img.height, 1);
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(img.width * ratio)); canvas.height = Math.max(1, Math.round(img.height * ratio));
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(blob => finish(blob ? null : new Error('No se pudo procesar la imagen.'), blob), 'image/webp', 0.82);
                } catch (_) { finish(new Error('No se pudo procesar la imagen. Prueba con otra foto.')); }
            };
            img.src = ev.target.result as string;
        };
        reader.readAsDataURL(file);
    });
}

async function subirImagenStorage(file) {
    // ponytail: comprimir una vez; el respaldo local usa la misma imagen reducida.
    const compressed = await _comprimirFile(file);
    try {
        const ext = compressed.type === 'image/webp' ? 'webp' : compressed.type === 'image/png' ? 'png' : 'jpg';
        const fileName = `producto_${mkId()}.${ext}`;
        const { error } = await db.storage.from('product-images').upload(fileName, compressed, { upsert: true, contentType: compressed.type });
        if (error) throw error;
        const { data } = db.storage.from('product-images').getPublicUrl(fileName);
        return data.publicUrl;
    } catch (_) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = ev => resolve(ev.target.result);
            reader.onerror = () => reject(new Error('No se pudo conservar la imagen. Selecciónala de nuevo.'));
            reader.readAsDataURL(compressed);
        });
    }
}

// FIX #7: variable única — usar solo window._pendingSync para evitar desincronización
window._pendingSync = Object.keys(_pendingKV).length > 0 || _pendingRows.length > 0;
if (window._pendingSync && db) sincronizarPendientes();
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
        if (!document.querySelector('.modal.active, dialog[open]')) _flushRTDeferred();
        if (['ptModal','mpModal','pvModal','svcModal','packModal'].includes(modal.id) && typeof (window as any).posRestaurarLugarInventario === 'function') (window as any).posRestaurarLugarInventario();
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
            const first = modal.querySelector('button,input,select,textarea,[tabindex]:not([tabindex="-1"])') as HTMLElement | null;
            if (first) first.focus();
        });
    }
}
window.openModal = openModal;

function actualizarIndicadorConexion(online) {
    actualizarEstadoGuardado();
    online = Boolean(online) && (typeof navigator === 'undefined' || navigator.onLine !== false);
    const dot  = document.getElementById('supabaseStatusDot');
    const txt  = document.getElementById('supabaseStatusText');
    const box  = document.getElementById('supabaseStatus');
    _offlineMode = !online;
    if (box) clearTimeout(box._flashTimer);
    if (!dot || !txt) return;
    if (online) {
        dot.className = 'w-2 h-2 rounded-full bg-green-500 flex-shrink-0 inline-block';
        txt.textContent = 'Supabase conectado';
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
        <span>Sin conexión. Conserva esta sesión y revisa los guardados pendientes al reconectarte.</span>
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
        setTimeout(() => { try { banner.remove(); } catch(e: any) { console.warn('[DB] Error al remover banner offline:', e); } }, 320);
    }
}

async function sincronizarPendientes() {
    if (!db) return;
    await Promise.allSettled([_savePedidosQueue, _savePedidosFinQueue]);
    await Promise.allSettled([_flushPendingRows(), ...Object.entries(_pendingKV).map(([key, snapshot]) => _writePendingKV(key, snapshot))]);
    actualizarIndicadorConexion(!window._pendingSync);
}

function _persistPendingKV() {
    window._pendingSync = Object.keys(_pendingKV).length > 0 || _pendingRows.length > 0;
    localStorage.setItem('maneki_kvState', JSON.stringify({pending:_pendingKV,bases:_kvBases,expected:_kvExpected}));
}

// ponytail: journal ordenado por dispositivo; cada upsert es idempotente por id.
// No proporciona transacciones entre tablas ni resuelve conflictos entre dispositivos.
function _persistPendingRows() {
    // No truncar ni ocultar cuota: sin journal durable no se confirma el guardado.
    localStorage.setItem('maneki_pendingRows', JSON.stringify(_pendingRows));
    actualizarEstadoGuardado();
    window._pendingSync = _pendingRows.length > 0 || Object.keys(_pendingKV).length > 0;
}
function _queueRowWrite(op: PendingRowWrite): Promise<{ error: null }> {
    const snapshot = JSON.parse(JSON.stringify(op));
    const bases = JSON.parse(JSON.stringify(_rowBases[op.table] || {}));
    for (const pending of [..._pendingRows,...(_posOperation?.writes||[])].filter(p => p.table === op.table)) {
        if (pending.rows) pending.rows.forEach(row => bases[row.id] = {...bases[row.id], ...row});
        else Object.keys(bases).forEach(id => { if (String(bases[id][pending.field!]) === pending.value) delete bases[id]; });
    }
    snapshot.expected = {};
    if (op.rows) {
        snapshot.rows=snapshot.rows.filter(row=>!bases[row.id] || Object.keys(row).some(k=>k!=='updated_at' && !_sameStoredValue(row[k],bases[row.id][k])));
        if(!snapshot.rows.length)return (_posOperation?Promise.resolve():_flushPendingRows()).then(()=>({error:null as null})).catch(error=>{throw Object.assign(new Error(error.message),{code:error.code,pendingSync:_pendingRows.length>0});});
        snapshot.rows.forEach(row => snapshot.expected[row.id] = bases[row.id] || null);
    }
    else Object.values(bases).forEach((row:any) => { if (String(row[op.field!]) === op.value) snapshot.expected[row.id] = row; });
    if(_posOperation){snapshot.batch=_posOperation.id;snapshot.reason=_posOperation.reason;_posOperation.writes.push(snapshot);return Promise.resolve({error:null});}
    _pendingRows.push(snapshot);
    try { _persistPendingRows(); }
    catch (e) { _pendingRows.pop(); return Promise.reject(e); }
    return _flushPendingRows().then(() => ({ error: null })).catch(error => {
        throw Object.assign(new Error(error?.message || 'Sincronización pendiente'), { code:error?.code, pendingSync: _pendingRows.includes(snapshot) });
    });
}
function _sameStoredValue(a:any,b:any):boolean {
    if(a===b)return true;
    if(a==null || b==null)return a==null && b==null;
    if(typeof a==='number' && typeof b==='string' && b.trim()!=='')return Number(b)===a;
    if(typeof b==='number' && typeof a==='string' && a.trim()!=='')return Number(a)===b;
    if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>_sameStoredValue(v,b[i]));
    if(typeof a==='object' && typeof b==='object'){const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.prototype.hasOwnProperty.call(b,k)&&_sameStoredValue(a[k],b[k]));}
    return false;
}
function _upsertRelational(table: string, rows: any[]): Promise<{ error: null }> {
    if (!rows.length) return Promise.resolve({ error: null });
    if (rows.some(r => r.id == null || String(r.id) === 'undefined')) return Promise.reject(new Error('Registro sin id estable'));
    return _queueRowWrite({ table, rows });
}
function _deleteRelational(table: string, field: string, value: string): Promise<void> {
    if (value == null || value === '') return Promise.resolve();
    return _trackSave(_queueRowWrite({ table, field, value: String(value) }).then(() => {}));
}
function _flushPendingRows(): Promise<void> {
    if (_rowFlush) return _rowFlush;
    if (!_pendingRows.length) return Promise.resolve();
    _rowFlush = (async () => {
        while (_pendingRows.length) {
            if (!db) throw new Error('Sin conexión a Supabase');
            const op = _pendingRows[0];
            if(op.batch && typeof db.rpc==='function') {
                const group=_pendingRows.filter(p=>p.batch===op.batch);
                const result=await _withTimeout(db.rpc('pos_apply_operation',{p_id:op.batch,p_operations:group}),15000);
                if(result.error)throw result.error;
                group.forEach((item,i)=>{
                    if(item.rows)_rememberRowBases(item.table,result.data?.[i] || item.rows);
                    else {const bases=_rowBases[item.table]||{};Object.keys(bases).forEach(id=>{if(String(bases[id][item.field!])===item.value)delete bases[id];});}
                });
                _pendingRows.splice(0,group.length);
                try{_persistPendingRows();}catch(e){_pendingRows.unshift(...group);throw e;}
                continue;
            }
            if (typeof db.rpc === 'function' && !op.expected) throw Object.assign(new Error('Pendiente de una version anterior: exporta el respaldo y revisa antes de sincronizar.'),{code:'40001'});
            let result = typeof db.rpc === 'function'
                ? await _withTimeout(db.rpc('pos_apply_write', {p_table:op.table, p_rows:op.rows || null,
                    p_expected:op.expected, p_field:op.field || null, p_value:op.value || null}), 15000)
                : op.rows
                ? await db.from(op.table).upsert(op.rows, { onConflict: 'id' })
                : await db.from(op.table).delete().eq(op.field, op.value);
            if (result.error) throw result.error;
            if (op.rows) _rememberRowBases(op.table, result.data || op.rows);
            else {
                const bases = _rowBases[op.table] || {};
                Object.keys(bases).forEach(id => { if (String(bases[id][op.field!]) === op.value) delete bases[id]; });
                _mirrorLocal('rowBases', _rowBases);
            }
            _pendingRows.shift();
            try { _persistPendingRows(); }
            catch (e) { _pendingRows.unshift(op); throw e; }
        }
    })().catch(error => {
        if (error?.code === '40001') _showSyncConflict(error.message);
        throw error;
    }).finally(() => { _rowFlush = null; });
    return _rowFlush;
}
function _showSyncConflict(message: string) {
    if (!document.body || typeof document.createElement !== 'function') return;
    let banner=document.getElementById('pos-sync-conflict');
    if (banner) return;
    banner=document.createElement('section'); banner.id='pos-sync-conflict';
    banner.setAttribute('role','alert');
    banner.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:100000;background:#fff3cd;color:#382b00;padding:16px;font:15px system-ui';
    banner.textContent=message+' La sincronizacion esta detenida. Conserva esta ventana y revisa ambos cambios antes de continuar. ';
    const button=document.createElement('button'); button.textContent='Descargar pendientes';
    button.onclick=()=>{
        const url=URL.createObjectURL(new Blob([JSON.stringify({version:2,fecha:new Date().toISOString(),pendingRows:_pendingRows,pendingKV:_pendingKV,expectedKV:_kvExpected},null,2)],{type:'application/json'}));
        const link=document.createElement('a'); link.href=url; link.download='bicho-pendientes.json'; link.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    banner.appendChild(button); const review=document.createElement('button');review.textContent='Revisar cambios';review.onclick=abrirRevisionSync;banner.appendChild(review);document.body.appendChild(banner);actualizarEstadoGuardado();
}
function _rememberRowBases(table: string, rows: any[]) {
    const bases = _rowBases[table] || (_rowBases[table] = {});
    rows.forEach(row => { if (row.id != null) bases[row.id] = JSON.parse(JSON.stringify(row)); });
    _mirrorLocal('rowBases', _rowBases);
}
function _overlayPendingRows(key: string, data: any[]): any[] {
    const cfg = _RELATIONAL_TABLES[key];
    if (!cfg) return data;
    let result = [...data];
    for (const op of _pendingRows.filter(o => o.table === cfg.table)) {
        if (op.rows) {
            for (const raw of op.rows) {
                const row = cfg.map(raw), i = result.findIndex(r => String(r.id) === String(row.id));
                if (i < 0) result.push(row); else result[i] = { ...result[i], ...row };
            }
        } else {
            const field = ({ folio_origen: 'folioOrigen', pedido_id: 'pedidoId' } as any)[op.field!] || op.field!;
            result = result.filter(r => String(r[field]) !== op.value);
        }
    }
    return result;
}

function _writePendingKV(key: string, snapshot: string): Promise<void> {
    const task = (_kvWriteQueues[key] || Promise.resolve()).catch(() => {}).then(async () => {
        if (_pendingKV[key] !== snapshot) return;
        if (!db) throw new Error('Sin conexión a Supabase');
        if (typeof db.rpc === 'function' && !_kvExpected[key]) throw new Error('Pendiente KV anterior: revisa el respaldo antes de sincronizar.');
        const expected=[...(_kvExpected[key] || [null])];
        // Guardar el valor intentado permite recuperar una respuesta perdida sin pisar cambios ajenos.
        _kvExpected[key] = [...new Set([...expected,snapshot])];
        _persistPendingKV();
        const { error } = await _withTimeout(typeof db.rpc === 'function'
            ? db.rpc('pos_apply_store',{p_key:key,p_value:snapshot,p_expected:expected})
            : db.from('store').upsert({ key, value: snapshot }, { onConflict: 'key' }));
        if (error) {
            if(error.code==='40001') _showSyncConflict(error.message);
            throw new Error(error.message || 'Error de Supabase');
        }
        _kvBases[key]=snapshot;
        if (_pendingKV[key] === snapshot) { delete _pendingKV[key]; delete _kvExpected[key]; }
        else _kvExpected[key]=[snapshot];
        _persistPendingKV();
    });
    _kvWriteQueues[key] = task;
    const clear=()=>{if(_kvWriteQueues[key]===task)delete _kvWriteQueues[key];};
    task.then(clear,clear);
    return task;
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
async function sbSave(key, data) {
    const dataConTimestamp = data;
    const _tsKV = new Date().toISOString();
    if (Array.isArray(dataConTimestamp)) {
        _stampLocalSave(dataConTimestamp, _tsKV);
    } else if (dataConTimestamp && typeof dataConTimestamp === 'object') {
        dataConTimestamp._updatedAt = _tsKV;
        dataConTimestamp._updatedBy = _deviceId;
    }

    const dataSnapshot = JSON.stringify(dataConTimestamp);
    _mirrorLocal(key, dataConTimestamp);
    if (!_kvExpected[key]) _kvExpected[key]=[_kvBases[key] ?? null];
    _pendingKV[key] = dataSnapshot;
    _persistPendingKV();

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
                await _writePendingKV(key, dataSnapshot);
                actualizarIndicadorConexion(!window._pendingSync);
                if (typeof window._mkUpdateSyncTime === 'function') window._mkUpdateSyncTime();
                pending.forEach(p => p.resolve());
            } catch(e: any) {
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
const _lastRelationalLoadStatus: Record<string, 'ok' | 'empty' | 'error'> = {};
const _LOCAL_MIRROR_LIMITS: Record<string, number> = {
    salesHistory: 1000,
    pedidosFinalizados: 500,
    stockMovimientos: 1000
};

function _mirrorLocal(key: string, data: any) {
    try {
        const limit = _LOCAL_MIRROR_LIMITS[key];
        const payload = Array.isArray(data) && limit ? data.slice(-limit) : data;
        localStorage.setItem('maneki_' + key, JSON.stringify(payload));
    } catch(e: any) {
        if (e?.name === 'QuotaExceededError') console.warn(`[DB] Espejo local lleno para ${key}; se omite fallback local.`);
        else console.warn(`[DB] No se pudo actualizar espejo local ${key}:`, e?.message || e);
    }
}

function _loadLocalMirror(key: string) {
    try {
        const local = localStorage.getItem('maneki_' + key);
        return local ? JSON.parse(local) : null;
    } catch(e: any) {
        console.warn('Error en localStorage fallback:', e);
        return null;
    }
}

const _RELATIONAL_TABLES = {
    products: { table: 'products', min: 1, orderBy: 'updated_at', limit: 2000, map: row => ({
        ...row, stockMin: row.stock_min, imageUrl: row.image_url,
        mpComponentes: row.mp_componentes, historialPrecios: row.historial_precios,
        tablaPreciosVariable: row.tabla_precios_variable || [],
        publicarTienda: row.publicar_tienda, proveedorUrl: row.proveedor_url,
        descripcionWeb: row.description,
        esEmpaque: row.es_empaque, usaVariantes: row.usa_variantes,
        rendimientoPorHoja: row.rendimiento_por_hoja, puntoReorden: row.punto_reorden,
        historialCostos: row.historial_costos, compraPaquete: row.compra_paquete,
        kitComponentes: row.kit_componentes, isKit: row.is_kit,
        _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null
    })},
    salesHistory: { table: 'sales_history', min: 1, orderBy: 'date', limit: 1000, map: row => ({ ...row, _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null }) },
    clients: { table: 'clients', min: 1, orderBy: 'updated_at', limit: 2000, map: row => ({
        ...row, totalPurchases: row.total_purchases, lastPurchase: row.last_purchase,
        _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null
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
        posDetalle: row.pos_detalle?.ficha || {}, checklist: row.pos_detalle?.checklist || {},
        referenciasUrls: row.pos_detalle?.referenciasUrls || [], referenciasPaths: row.pos_detalle?.referenciasPaths || [],
        referenciaUrl: row.pos_detalle?.referenciaUrl || null, referenciaPath: row.pos_detalle?.referenciaPath || null,
        fromQuote: row.from_quote, whatsapp: row.whatsapp, facebook: row.facebook,
        ocasion: row.ocasion,
        lugarEntrega: row.lugar_entrega, costoMateriales: row.costo_materiales || 0,
        prioridad: row.prioridad || 'normal', notasInternas: row.notas_internas,
        pagos: row.pagos || [], empaques: row.empaques || [],
        historialEstados: row.historial_estados || [],
        fechaUltimoEstado: row.fecha_ultimo_estado, fechaPedido: row.fecha_pedido,
        empaquesDescontados: row.empaques_descontados === true,
        _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null
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
        posDetalle: row.pos_detalle?.ficha || {}, checklist: row.pos_detalle?.checklist || {},
        referenciasUrls: row.pos_detalle?.referenciasUrls || [], referenciasPaths: row.pos_detalle?.referenciasPaths || [],
        referenciaUrl: row.pos_detalle?.referenciaUrl || null, referenciaPath: row.pos_detalle?.referenciaPath || null,
        fromQuote: row.from_quote, whatsapp: row.whatsapp, facebook: row.facebook,
        ocasion: row.ocasion,
        lugarEntrega: row.lugar_entrega, costoMateriales: row.costo_materiales || 0,
        prioridad: row.prioridad || 'normal', notasInternas: row.notas_internas,
        pagos: row.pagos || [], empaques: row.empaques || [],
        historialEstados: row.historial_estados || [],
        fechaPedido: row.fecha_pedido, empaquesDescontados: row.empaques_descontados === true,
        _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null
    })},
    incomes: { table: 'incomes', min: 0, orderBy: 'date', limit: 2000, map: (row: any) => ({
        id: row.id,
        concept: row.concept || row.concepto || null,
        amount: Number(row.amount || row.monto || 0),
        date: row.date || row.fecha || null,
        client: row.client || row.cliente || null,
        fromPOS: row.from_pos === true,
        folioOrigen: row.folio_origen || null,
        pedidoId: row.pedido_id || null,
        method: row.method || row.metodo || null,
        _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null
    })},
    expenses: { table: 'expenses', min: 0, orderBy: 'date', limit: 2000, map: (row: any) => ({
        id: row.id,
        concept: row.concept || row.concepto || null,
        amount: Number(row.amount || row.monto || 0),
        date: row.date || row.fecha || null,
        category: row.category || row.categoria || null,
        etiqueta: row.etiqueta || null,
        notas: row.notas || null,
        fromPayable: row.from_payable === true,
        method: row.method || null,
        _updatedAt: row.updated_at, _updatedBy: row._updated_by || row.updated_by || null
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
        _lastRelationalLoadStatus[key] = 'ok';
        let query = db.from(cfg.table).select('*');
        if ((cfg as any).filter) query = (cfg as any).filter(query);
        if (cfg.orderBy) query = query.order(cfg.orderBy, { ascending: false });
        if (cfg.limit) query = query.limit(cfg.limit);
        const { data, error } = await _withTimeout(query, 10000);
        if (error || !data) {
            _lastRelationalLoadStatus[key] = 'error';
            return null;
        }
        _rememberRowBases(cfg.table, data);
        if (cfg.min > 0 && data.length < cfg.min) {
            _lastRelationalLoadStatus[key] = 'empty';
            return key === 'categories' ? null : [];
        }
        const mapped = data.map(cfg.map);
        if ((window as any).MK_DEBUG) console.log(`[DB] ✓ ${key} loaded from ${cfg.table} (${mapped.length} rows)`);
        return mapped;
    } catch(e: any) {
        _lastRelationalLoadStatus[key] = 'error';
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
        _rememberRowBases(cfg.table, data);
        return data.map(cfg.map);
    } catch(e: any) {
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
        } catch(e: any) {
            console.warn(`[DB] Migration ${key} failed:`, e?.message);
        }
    }
}
window._migrateToRelationalIfEmpty = _migrateToRelationalIfEmpty;

async function sbLoad(key, def) {
    if (!_RELATIONAL_TABLES[key] && _pendingKV[key]) return JSON.parse(_pendingKV[key]);
    // Lectura relacional: intenta tabla individual primero (más rápido)
    // Solo usamos la tabla relacional si tiene ≥1 row (min definido en config).
    const relational = await _loadFromTable(key);
    if (relational !== null) {
        return _overlayPendingRows(key, relational);
    }
    if (_RELATIONAL_TABLES[key] && _lastRelationalLoadStatus[key] === 'error') {
        const mirror = _loadLocalMirror(key);
        if (mirror !== null) return Array.isArray(mirror) ? _overlayPendingRows(key, mirror) : mirror;
    }

    // 1) Intentar Supabase store (datos más frescos / multi-dispositivo)
    // ✅ FIX: usar .maybeSingle() en lugar de .single()
    // .single() lanza error 406 cuando no existe la fila; .maybeSingle() retorna null sin error
    try {
        const { data, error } = await _withTimeout(db.from('store').select('value').eq('key', key).maybeSingle());
        if (!error && data) {
            try {
                const parsed = JSON.parse(data.value);
                _kvBases[key]=data.value;
                _persistPendingKV();
                return parsed;
            } catch(e: any) { console.warn('Error parseando dato Supabase:', e); }
        }
    } catch(e: any) { console.warn('sbLoad Supabase no disponible, usando localStorage:', key); }

    // 2) Fallback: localStorage
    const mirror = _loadLocalMirror(key);
    if (mirror !== null) return Array.isArray(mirror) ? _overlayPendingRows(key, mirror) : mirror;

    return Array.isArray(def) ? _overlayPendingRows(key, def) : def;
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
        if (_retry >= 20) throw new Error('[Bicho Capricho] getNextFolio: timeout esperando lock');
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
        } catch(e: any) {
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
        } catch(e: any) {
            manekiToastExport(`❌ Error al guardar ${nombreAmigable || key}. Revisa tu conexión.`, 'err');
            console.error('sbSave error:', key, e);
        }
    })();
}

// ── saveCategories — escribe en public.categories (tabla relacional) ──
// R3-S30 FIX: antes escribía solo en store.categories via sbSave(), pero sbLoad()
// lee de la tabla relacional 'categories' primero (tiene min:1 fila configurado en
// _RELATIONAL_TABLES) — cualquier categoría creada/editada se perdía al recargar
// porque nunca llegaba a la tabla que realmente se lee.
function saveCategories() {
    return (async () => {
        try {
            const rows = categories.map(c => ({
                id: String(c.id), name: c.name || '',
                emoji: c.emoji || '📦', color: c.color || '#FFD166'
            }));
            if (!rows.length) return;
            // BUG R3-S30b: el primer fix no revisaba {error} de la respuesta — un error
            // del servidor (constraint, RLS, etc.) se tragaba en silencio y el caller
            // creía que había guardado bien.
            const { error } = await _upsertRelational('categories', rows);
            if (error) throw error;
        } catch(e: any) { console.warn('[saveCategories] Error al guardar en Supabase:', (e as any)?.message); throw e; }
    })();
}
// ── deleteCategoryFromDB — borra de public.categories al eliminar categoría ──
function deleteCategoryFromDB(id: string): Promise<void> {
    return _deleteRelational('categories', 'id', id);
}
(window as any).deleteCategoryFromDB = deleteCategoryFromDB;
let stockMovimientos = [];
function saveStockMovimientos() { (async () => { await sbSave('stockMovimientos', stockMovimientos); })(); }

// ── Comprime un data URL base64 usando Canvas (max 1200px, calidad 0.82) ──
// Devuelve un nuevo data URL JPEG comprimido, siempre < 1 MB aprox.
function _comprimirBase64(dataUrl): Promise<string> {
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
    } catch(e: any) {
        console.warn(`No se pudo migrar imagen de "${p.name}" a Storage:`, e);
        return null;
    }
}

// ── saveProducts — dual write: store (legacy) + public.products (relacional) ──
// Para productos terminados con mpComponentes, calcula el stock real desde MPs
// antes de escribir a la tabla relacional, para que Lovable muestre el stock correcto.
function _calcStockParaSupabase(p) {
    const stockVariantes = Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants.reduce((sum, v) => sum + (parseFloat(v.qty) || 0), 0)
        : null;
    const stockBase = stockVariantes !== null ? stockVariantes : (parseFloat(p.stock) || 0);
    if (!p.mpComponentes || p.mpComponentes.length === 0) return stockBase;
    const calc = (window as any).calcularPiezasFabricables;
    const fabricable = typeof calc === 'function' ? calc(p) : _calcPiezasFabricablesFallback(p);
    return stockBase + fabricable;
}

function _calcPiezasFabricablesFallback(p) {
    let minPiezas = Infinity;
    let tieneMpFisica = false;
    for (const comp of p.mpComponentes) {
        const mp = (window.products || []).find(x => String(x.id) === String(comp.id));
        if (mp && mp.tipo === 'servicio') continue;
        if (!mp) return 0;
        tieneMpFisica = true;
        const stockMp = Array.isArray(mp.variants) && mp.variants.length > 0
            ? mp.variants.reduce((sum, v) => sum + (Number(v.qty) || 0), 0)
            : (Number(mp.stock) || 0);
        const qty = parseFloat(comp.qty) || 1;
        const rendimiento = parseFloat(comp.rendimientoPorHoja) || parseFloat(p.rendimientoPorHoja) || 1;
        const posibles = Math.floor(stockMp / qty) * rendimiento;
        if (posibles < minPiezas) minPiezas = posibles;
    }
    if (!tieneMpFisica) return 0;
    return minPiezas === Infinity ? 0 : Math.floor(minPiezas);
}

function _trackSave<T>(task: Promise<T>): Promise<T> {
    if(_posOperation)_posOperation.tasks.push(task);
    // El caller con await recibe el fallo; los callers antiguos sin await también lo ven en pantalla.
    task.catch(() => {
        _mkSI('error');
        if (typeof manekiToastExport === 'function') {
            manekiToastExport('No se guardó en la nube. Conserva esta sesión y vuelve a intentar.', 'error');
        }
    });
    return task;
}

function saveProducts() {
    _mirrorLocal('products', products);
    _mkSI('saving');
    return _trackSave((async () => {
        // Persistir en tabla relacional public.products (fuente de verdad)
        try {
            // Migrar imágenes base64 a Storage antes de escribir
        await Promise.all(products.map(p => _migrarBase64AStorage(p)));

        // Sellar _updatedAt en objetos locales para que el guard anti-eco funcione:
        // cuando Supabase devuelva el eco de este save, _updatedAt <= local → se descarta
        const _tsSaveP = new Date().toISOString();
        _stampLocalSave(products, _tsSaveP);

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
                tabla_precios_variable: p.tablaPreciosVariable || [],
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
                updated_at:       _tsSaveP
            }));
            const { error } = await _upsertRelational('products', rows);
            if (error) throw error;
            else { _mirrorLocal('products', products); _mkSI('saved'); }
        } catch(e: any) {
            console.error('saveProducts relacional excepción:', e);
            _mkSI('error');
            throw e;
        }
    })());
}
function saveClients() {
    _mirrorLocal('clients', window.clients || []);
    return _trackSave((async () => {

        // Tabla relacional
        try {
            const _tsSaveC = new Date().toISOString();
            _stampLocalSave(window.clients || [], _tsSaveC);
            const rows = (window.clients||[]).map(c => ({
                id: String(c.id), name: c.name||'', phone: c.phone||null,
                facebook: c.facebook||null, email: c.email||null,
                type: c.type||'regular', notas: c.notas||null,
                total_purchases: Number(c.totalPurchases)||0,
                last_purchase: c.lastPurchase||null,
                is_vip: c.type==='vip',
                tags: c.tags||[],
                updated_at: _tsSaveC
            }));
            if (rows.length) {
                const { error } = await _upsertRelational('clients', rows);
                if (error) throw error;
                else _mirrorLocal('clients', window.clients || []);
            } else {
                _mirrorLocal('clients', window.clients || []);
            }
        } catch(e: any){ console.warn('[saveClients] Error al guardar en Supabase:', e?.message); throw e; }
    })());
}
// ── saveSalesHistory — escribe en public.sales_history ──
function saveSalesHistory() {
    _mirrorLocal('salesHistory', salesHistory);
    return _trackSave((async () => {
        // Persistir en tabla relacional public.sales_history
        try {
            const _tsSaveSH = new Date().toISOString();
            _stampLocalSave(salesHistory, _tsSaveSH);
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
                type:       s.type     || null,
                discount_percent: Number(s.discountPercent ?? s.discount_percent) || 0,
                tax_percent: Number(s.taxPercent ?? s.tax_percent) || 0,
                pedido_id: s.pedidoId ?? s.pedido_id ?? null,
                folio_origen: s.folioOrigen ?? s.folio_origen ?? null
            }));
            const { error } = await _upsertRelational('sales_history', rows);
            if (error) throw error;
            else _mirrorLocal('salesHistory', salesHistory);
        } catch(e: any) {
            console.error('saveSalesHistory relacional excepción:', e);
            throw e;
        }
    })());
}
function saveQuotes()        { return _trackSave(sbSave('quotes', quotes)); }
function saveIncomes() {
    return _trackSave((async () => {

        try {
            const _tsSaveI = new Date().toISOString();
            _stampLocalSave(window.incomes || [], _tsSaveI);
            const rows = (window.incomes||[]).map(i => {
                // Garantizar que todos los ingresos tienen id antes del upsert (onConflict:'id' requiere id uniforme)
                if (i.id == null) i.id = (typeof mkId === 'function' ? mkId() : Date.now().toString(36) + Math.random().toString(36).slice(2));
                return {
                    id: String(i.id), concept: i.concept||i.concepto||null,
                    amount: Number(i.amount||i.monto)||0, date: i.date||i.fecha||null,
                    client: i.client||i.cliente||null, from_pos: i.fromPOS===true,
                    folio_origen: i.folioOrigen||null, pedido_id: i.pedidoId||null,
                    method: i.method || i.metodo || null
                };
            });
            // Solo si hay filas con datos
            _mirrorLocal('incomes', window.incomes || []);
            if (rows.length) {
                await _upsertRelational('incomes', rows);
                _mirrorLocal('incomes', window.incomes || []);
            } else {
                _mirrorLocal('incomes', window.incomes || []);
            }
        } catch(e: any){ console.warn('[saveIncomes] Error al guardar en Supabase:', e?.message); throw e; }
    })());
}
function saveExpenses() {
    return _trackSave((async () => {

        try {
            const _tsSaveE = new Date().toISOString();
            _stampLocalSave(window.expenses || [], _tsSaveE);
            const rows = (window.expenses||[]).map(e => {
                // Garantizar id antes del upsert (onConflict:'id' requiere id uniforme) — igual que saveIncomes
                if (e.id == null) e.id = (typeof mkId === 'function' ? mkId() : Date.now().toString(36) + Math.random().toString(36).slice(2));
                return {
                    id: String(e.id), concept: e.concept||e.concepto||null,
                    amount: Number(e.amount||e.monto)||0, date: e.date||e.fecha||null,
                    category: e.category||e.categoria||null, etiqueta: e.etiqueta||null,
                    notas: e.notas||null, from_payable: e.fromPayable===true, method: e.method||e.metodo||null
                };
            });
            _mirrorLocal('expenses', window.expenses || []);
            if (rows.length) {
                const { error } = await _upsertRelational('expenses', rows);
                if (error) throw error;
                else _mirrorLocal('expenses', window.expenses || []);
            } else {
                _mirrorLocal('expenses', window.expenses || []);
            }
        } catch(e: any){ console.warn('[saveExpenses] Error al guardar en Supabase:', e?.message); throw e; }
    })());
}
let gastosRecurrentes = [];
function saveGastosRecurrentes() { return _trackSave(sbSave('gastosRecurrentes', gastosRecurrentes)); }
function saveReceivables()   { return _trackSave(sbSave('receivables', receivables)); }
function savePayables()      { return _trackSave(sbSave('payables', payables)); }
// ── savePedidos — escribe en public.orders ──
// Mutex: serializa guardados concurrentes para que el último siempre gane.
// Si save-A está en vuelo y save-B llega, B espera a que A termine y luego
// ejecuta con el estado ACTUAL de pedidos — sin race de versiones desactualizadas.
let _savePedidosQueue: Promise<void> = Promise.resolve();
const _mkSI = (s: string) => { try { if(s==='saved' && (_posOperation || window._pendingSync))s='saving'; if (typeof (window as any).mkSaveIndicator === 'function') (window as any).mkSaveIndicator(s); } catch(_){} };
function savePedidos() {
    _mirrorLocal('pedidos', pedidos);
    _mkSI('saving');
    const _task = _savePedidosQueue.then(async () => {
        // Persistir en tabla relacional public.orders
        try {
            // BUG-RT-ECO FIX: sellar _updatedAt local = updated_at enviado, para que
            // el guard de realtime pueda detectar y descartar el eco de este save
            const _tsSave = new Date().toISOString();
            _stampLocalSave(pedidos, _tsSave);
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
                pos_detalle: {ficha:p.posDetalle||{},checklist:p.checklist||{},referenciasUrls:p.referenciasUrls||[],referenciasPaths:p.referenciasPaths||[],referenciaUrl:p.referenciaUrl||null,referenciaPath:p.referenciaPath||null},
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
            const { error } = await _upsertRelational('orders', rows);
            if (error) throw error;
            else { _mirrorLocal('pedidos', pedidos); _mkSI('saved'); }
        } catch(e: any) {
            console.error('savePedidos relacional excepción:', e);
            _mkSI('error');
            throw e;
        }
    });
    // La cola nunca rechaza — los errores ya se capturan arriba
    _savePedidosQueue = _task.then(() => {}).catch(() => {});
    return _trackSave(_task);
}
// ── savePedidosFinalizados — escribe en public.orders_finalizados ──
// Mutex idéntico al de savePedidos: evita race entre saves concurrentes.
let _savePedidosFinQueue: Promise<void> = Promise.resolve();
function savePedidosFinalizados() {
    _mirrorLocal('pedidosFinalizados', pedidosFinalizados);
    const _task = _savePedidosFinQueue.then(async () => {
        // Persistir en tabla relacional public.orders_finalizados
        try {
            // BUG-RT-ECO FIX: mismo sello que savePedidos
            const _tsSaveF = new Date().toISOString();
            _stampLocalSave(pedidosFinalizados, _tsSaveF);
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
                pos_detalle: {ficha:p.posDetalle||{},checklist:p.checklist||{},referenciasUrls:p.referenciasUrls||[],referenciasPaths:p.referenciasPaths||[],referenciaUrl:p.referenciaUrl||null,referenciaPath:p.referenciaPath||null},
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
            const { error } = await _upsertRelational('orders_finalizados', rows);
            if (error) throw error;
            else _mirrorLocal('pedidosFinalizados', pedidosFinalizados);
        } catch(e: any) {
            console.error('savePedidosFinalizados relacional excepción:', e);
            throw e;
        }
    });
    _savePedidosFinQueue = _task.then(() => {}).catch(() => {});
    return _trackSave(_task);
}

// ── deletePedidoActivo — borra de public.orders al finalizar/cancelar-mover ──
// Se encola DESPUÉS de _savePedidosQueue: garantiza que el upsert en vuelo no
// re-inserte la fila justo después del DELETE (era el root-cause de PE-0064/65).
function deletePedidoActivo(id: string): Promise<void> {
    return _trackSave(_savePedidosQueue.then(() => _deleteRelational('orders', 'id', id)));
}
(window as any).deletePedidoActivo = deletePedidoActivo;

// ── deletePedidoFinalizado — borra de public.orders_finalizados al reactivar ──
// Se encola después de _savePedidosFinQueue por la misma razón.
function deletePedidoFinalizado(id: string): Promise<void> {
    return _trackSave(_savePedidosFinQueue.then(() => _deleteRelational('orders_finalizados', 'id', id)));
}
(window as any).deletePedidoFinalizado = deletePedidoFinalizado;

// ── deleteClientFromDB — borra de public.clients al eliminar cliente ──
function deleteClientFromDB(id: string): Promise<void> {
    return _deleteRelational('clients', 'id', id);
}
(window as any).deleteClientFromDB = deleteClientFromDB;

// ── deleteSalesHistoryEntry — borra de public.sales_history al eliminar entrada ──
function deleteSalesHistoryEntry(id: string): Promise<void> {
    return _deleteRelational('sales_history', 'id', id);
}
(window as any).deleteSalesHistoryEntry = deleteSalesHistoryEntry;

// ── deleteIncomeFromDB — borra UN income de public.incomes por id ──
// F1-S25: saveIncomes() usa upsert y NUNCA borra filas. Al quitar un income del array
// local (reactivar/eliminar pedido) hay que borrar la fila o reaparece al recargar.
function deleteIncomeFromDB(id: string): Promise<void> {
    return _deleteRelational('incomes', 'id', id);
}
(window as any).deleteIncomeFromDB = deleteIncomeFromDB;

// ── deleteIncomesByFolio — borra de public.incomes todos los abonos/cobros de un pedido ──
// F1-S25: usado al reactivar/eliminar un pedido — los incomes ligados van por folio_origen
// (abono, cobro al entregar) o por pedido_id. Evita el income fantasma que descuadra el balance.
function deleteIncomesByFolio(folio: string, pedidoId?: string): Promise<void> {
    return _trackSave(Promise.all([
        _deleteRelational('incomes', 'folio_origen', folio),
        _deleteRelational('incomes', 'pedido_id', pedidoId!)
    ]).then(() => {}));
}
(window as any).deleteIncomesByFolio = deleteIncomesByFolio;

// ── deleteExpenseFromDB — borra UN expense de public.expenses por id ──
// F1-S25: mismo patrón que deleteIncomeFromDB para gastos.
function deleteExpenseFromDB(id: string): Promise<void> {
    return _deleteRelational('expenses', 'id', id);
}
(window as any).deleteExpenseFromDB = deleteExpenseFromDB;

function posSyncStatus() {
    const pending = _pendingRows.length + Object.keys(_pendingKV).length;
    const conflict = !!document.getElementById('pos-sync-conflict');
    return {pending, state:conflict?'conflict':pending?'pending':'saved',
        text:conflict?'Requiere revisión · hay cambios de otro dispositivo':pending?`${pending} guardados pendientes · pulsa para revisar`:
        (typeof navigator!=='undefined' && !navigator.onLine)?'Sin conexión · sin guardados pendientes':'Guardado · al día'};
}
function posRecordSyncStatus(table: string, id: string) {
    const relevant = [..._pendingRows, ...(_posOperation?.writes || [])].some(op => op.table === table &&
        (op.rows?.some(row => String(row.id) === String(id)) || (op.field === 'id' && op.value === String(id))));
    const conflict = relevant && !!document.getElementById('pos-sync-conflict');
    return { state: conflict ? 'conflict' : relevant ? 'pending' : 'saved', text: conflict ? 'Conflicto: revisar este registro' : relevant ? 'Pendiente de sincronizar' : 'Guardado' };
}
window.posRecordSyncStatus = posRecordSyncStatus;
function actualizarEstadoGuardado() {
    const el=document.getElementById('pos-save-status');
    if(el){const status=posSyncStatus(); el.textContent=status.text; el.dataset.state=status.state;}
    document.querySelectorAll('[data-sync-table][data-sync-id]').forEach(record => {
        const status = posRecordSyncStatus(record.dataset.syncTable || '', record.dataset.syncId || '');
        record.textContent = status.text; record.dataset.state = status.state;
    });
}
function posExportPending() {
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:2,fecha:new Date().toISOString(),pendingRows:_pendingRows,pendingKV:_pendingKV,expectedKV:_kvExpected},null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='bicho-pendientes.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function abrirRevisionSync() {
    if(_posOperation){manekiToastExport('Espera a que termine el guardado en curso.','warn');return;}
    await Promise.allSettled([_rowFlush,...Object.values(_kvWriteQueues)]);
    const dialog=document.createElement('dialog');dialog.className='pos-sync-dialog';
    const title=document.createElement('h2');title.textContent='Revisar guardados';dialog.appendChild(title);
    const description=document.createElement('p'); description.textContent='Compara tus cambios con la nube. No cierres esta sesión si hay pendientes.';dialog.appendChild(description);
    const view=document.createElement('pre');dialog.appendChild(view);
    const addButton=(label:string,fn:()=>any)=>{const b=document.createElement('button');b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e:any){description.textContent=e.message;}finally{b.disabled=false;}};dialog.appendChild(b);return b;};
    addButton('Descargar respaldo',posExportPending);
    addButton('Cerrar',()=>{dialog.close();dialog.remove();});
    document.body.appendChild(dialog);dialog.showModal();
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});
    const queued=JSON.stringify({rows:_pendingRows,kv:_pendingKV});
    const verify=()=>{if(_posOperation || _rowFlush || Object.keys(_kvWriteQueues).length || queued!==JSON.stringify({rows:_pendingRows,kv:_pendingKV}))throw new Error('Los guardados cambiaron o siguen en curso. Cierra y vuelve a revisar.');};
    if(!_pendingRows.length && !Object.keys(_pendingKV).length){view.textContent='Todos los cambios están guardados.';return;}
    const observed:Record<string,any>={};const observedKV:Record<string,string|null>={};
    try {
        for(const table of [...new Set(_pendingRows.map(op=>op.table))]) {
            observed[table]={};
            for(let offset=0;;offset+=1000){
                const {data,error}=await db.from(table).select('*').order('id').range(offset,offset+999);if(error)throw error;
                Object.assign(observed[table],Object.fromEntries((data||[]).map(r=>[String(r.id),r])));
                if(!data || data.length<1000)break;
            }
        }
        for(const key of Object.keys(_pendingKV)) {
            const {data,error}=await db.from('store').select('value').eq('key',key).maybeSingle();if(error)throw error;
            observedKV[key]=data?.value ?? null;
        }
        view.textContent=posDescribeConflicts(_pendingRows,observed,_pendingKV,observedKV);
        const label=document.createElement('label');const confirm=document.createElement('input');confirm.type='checkbox';label.append(confirm,document.createTextNode(' He comparado los cambios. Autorizo la opción que elija para TODOS los pendientes.'));dialog.appendChild(label);
        addButton('Conservar mis cambios y reintentar',async()=>{
            verify();if(!confirm.checked)throw new Error('Marca la confirmación después de comparar los cambios.');
            posExportPending();
            posRebasePending(observed,observedKV);
            document.getElementById('pos-sync-conflict')?.remove();
            await sincronizarPendientes();actualizarEstadoGuardado();
            if(window._pendingSync)throw new Error('Aún quedan pendientes. Cierra y vuelve a revisar; no repitas el cobro.');
            dialog.close();
        });
        addButton('Usar nube y descartar pendientes locales',async()=>{
            verify();if(!confirm.checked)throw new Error('Marca la confirmación. Esta opción descarta TODOS los pendientes locales y descarga un respaldo.');
            posExportPending();
            _pendingRows.splice(0);Object.keys(_pendingKV).forEach(k=>{delete _pendingKV[k];delete _kvExpected[k];});
            _persistPendingRows();_persistPendingKV();location.reload();
        });
    } catch(e:any){description.textContent='No se pudo consultar la nube: '+e.message;view.textContent='Tus cambios siguen en este dispositivo. Puedes descargar el respaldo y volver a revisar cuando haya conexión.';}
}
function posDescribeConflicts(operations:PendingRowWrite[],observed:Record<string,any>,localKV:Record<string,string>,remoteKV:Record<string,string|null>):string {
    const names={products:'Inventario',orders:'Pedidos',orders_finalizados:'Historial de pedidos',incomes:'Ingresos',expenses:'Gastos',sales_history:'Cobros',clients:'Clientes',categories:'Categorías',stock_movements:'Movimientos'};
    const fields={stock:'Existencias',price:'Precio',cost:'Costo',amount:'Importe',total:'Total',resta:'Saldo',anticipo:'Anticipo',status:'Estado',name:'Nombre',cliente:'Cliente',concept:'Concepto',entrega:'Entrega'};
    const value=(v:any)=>v==null?'sin valor':typeof v==='object'?JSON.stringify(v):String(v);
    const lines:string[]=[];
    for(const op of operations){
        lines.push(names[op.table]||op.table);
        if(!op.rows){lines.push('Eliminar: '+Object.values(op.expected||{}).map((r:any)=>r?.folio||r?.name||r?.concept||r?.id).join(', '));continue;}
        for(const row of op.rows){
            const remote=observed[op.table]?.[row.id];
            const changes=Object.keys(row).filter(k=>!['id','updated_at','created_at'].includes(k) && value(row[k])!==value(remote?.[k]));
            if(!changes.length)continue;
            lines.push('\n'+(row.folio||row.name||row.concept||row.cliente||row.id));
            for(const k of changes)lines.push(`${fields[k]||k.replace(/_/g,' ')}: dispositivo ${value(row[k])} · nube ${value(remote?.[k])}`);
        }
    }
    for(const key of Object.keys(localKV))lines.push(`\nConfiguración ${key}: dispositivo ${localKV[key]} · nube ${remoteKV[key]??'sin valor'}`);
    return lines.join('\n');
}
function posRebasePending(observed:Record<string,any>,observedKV:Record<string,string|null>) {
    const bases=JSON.parse(JSON.stringify(observed));
    const batches:Record<string,string>={};
    for(const op of _pendingRows) {
        if(op.batch)op.batch=batches[op.batch] || (batches[op.batch]=mkId());
        const table=bases[op.table] || {};op.expected={};
        if(op.rows)for(const row of op.rows){op.expected[row.id]=table[row.id] || null;table[row.id]={...table[row.id],...row};}
        else for(const id of Object.keys(table))if(String(table[id][op.field!])===op.value){op.expected[id]=table[id];delete table[id];}
    }
    Object.keys(_pendingKV).forEach(k=>_kvExpected[k]=[observedKV[k]??null]);
    _persistPendingRows();_persistPendingKV();
}
document.addEventListener('DOMContentLoaded',actualizarEstadoGuardado);
