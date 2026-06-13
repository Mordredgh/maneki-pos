// Guard: _esc puede estar definida globalmente por otro módulo,
// pero definimos una local por si este archivo carga antes
if (typeof _esc !== 'function') {
    window._esc = function(s) {
        return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    };
}

// ── FIX: clearAllData nunca había sido definida ───────────────
function clearAllData() {
    showConfirm('Esto eliminará productos, ventas, pedidos, clientes y todo el historial. Esta acción NO se puede deshacer.', '⚠️ ¿Borrar TODOS los datos?').then(ok1 => {
    if (!ok1) return;
    showConfirm('🚨 SEGUNDA CONFIRMACIÓN: ¿Realmente deseas borrar absolutamente todo?', 'Confirmación final').then(ok2 => {
        if (!ok2) return;

    (async () => {
        try {
            // Resetear via window (sincronizadas por _syncWindowVars)
            window.products = []; window.clients = []; window.salesHistory = [];
            window.quotes = []; window.incomes = []; window.expenses = [];
            window.receivables = []; window.payables = [];
            window.abonos = []; window.pedidos = []; window.notas = [];
            // MEJ-12: pedidosFinalizados y abonos también deben limpiarse en memoria
            // o siguen apareciendo en Balance y Reportes hasta recargar la página
            window.pedidosFinalizados = []; window.abonos = [];
            window.stockMovements = []; window.stockMovimientos = [];
            equipos = []; roiHistorial = []; roiConfig = { porcentaje: 10 };

            await Promise.all([
                sbSave('products', []), sbSave('clients', []), sbSave('salesHistory', []),
                sbSave('quotes', []), sbSave('incomes', []), sbSave('expenses', []),
                sbSave('receivables', []), sbSave('payables', []),
                sbSave('abonos', []), sbSave('pedidos', []), sbSave('notas', []),
                sbSave('equipos', []), sbSave('roiHistorial', []),
                sbSave('roiConfig', { porcentaje: 10 }),
                sbSave('gastosRecurrentes', []), sbSave('stockMovimientos', []),
                sbSave('pedidosFinalizados', []),
                typeof db !== 'undefined' && db ? (db as any).from('stock_movements').delete().neq('id','00000000-0000-0000-0000-000000000000') : Promise.resolve(),
            ]);

            ['renderInventoryTable','renderClientsTable','renderSalesHistory',
             'renderPedidosTable','renderQuotesTable',
             'updateDashboard','renderBalance'].forEach(fn => {
                if (typeof window[fn] === 'function') window[fn]();
            });

            manekiToastExport('✅ Todos los datos borrados correctamente', 'ok');
        } catch(err) {
            console.error('clearAllData error:', err);
            manekiToastExport('❌ Error al borrar datos: ' + (err.message || ''), 'err');
        }
    })();
    }); 
    }); 
}

// ── EXPORTAR A EXCEL ──────────────────────────────────────────
// Lee desde window.* que son sincronizados por _syncWindowVars() al cargar
function manekiExportar(tipo) {
    if (typeof XLSX === 'undefined') {
        manekiToastExport('⏳ Cargando exportador Excel...', 'info');
        window._mkLoadCDN('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
            .then(function () { manekiExportar(tipo); });
        return;
    }

    let filas = [];
    let nombreArchivo = '';
    let nombreHoja = '';
    const hoy = (() => {
        const d = new Date();
        return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    })();

    const fmt = (v) => {
        if (!v) return '';
        try { const d = new Date(v); return isNaN(d) ? String(v) : d.toLocaleDateString('es-MX'); }
        catch { return String(v); }
    };
    const num = (v) => isNaN(parseFloat(v)) ? '0.00' : parseFloat(v).toFixed(2);

    if (tipo === 'ventas') {
        nombreArchivo = `Ventas_${hoy}.xlsx`;
        nombreHoja = 'Ventas';
        const datos = window.salesHistory || [];
        if (!datos.length) { manekiToastExport('No hay ventas para exportar', 'warn'); return; }
        filas.push(['Folio', 'Fecha', 'Hora', 'Cliente', 'Concepto', 'Productos', 'Subtotal', 'Descuento', 'IVA', 'Total', 'Método de Pago']);
        datos.forEach(v => {
            const prods = (v.products || []).map(p =>
                `${p.name||p.nombre||''} x${p.qty||p.cantidad||1} ($${num((p.price||p.precio||0)*(p.qty||p.cantidad||1))})`
            ).join(' | ') || v.concept || '—';
            filas.push([v.folio||v.id||'', fmt(v.date), v.time||'', v.customer||'',
                v.concept||'', prods, num(v.subtotal), num(v.discount), num(v.tax), num(v.total), v.method||'']);
        });

    } else if (tipo === 'pedidos') {
        nombreArchivo = `Pedidos_${hoy}.xlsx`;
        nombreHoja = 'Pedidos';
        // MEJ-10: incluir pedidos activos Y finalizados para reporte contable completo
        const datosActivos    = (window.pedidos || []).map(p => ({ ...p, _tipo: 'Activo' }));
        const datosFinalizados = (window.pedidosFinalizados || []).map(p => ({ ...p, _tipo: 'Finalizado' }));
        const datos = [...datosActivos, ...datosFinalizados]
            .sort((a, b) => (b.fechaCreacion || b.fecha || '').localeCompare(a.fechaCreacion || a.fecha || ''));
        if (!datos.length) { manekiToastExport('No hay pedidos para exportar', 'warn'); return; }
        filas.push(['Tipo','Folio','Cliente','Teléfono','Redes/Canal','Fecha Pedido','Fecha Entrega','Fecha Finalizado','Concepto','Cantidad','Costo Unit.','Total','Anticipo','Saldo','Estado','Notas']);
        datos.forEach(p => {
            filas.push([
                p._tipo||'Activo', p.folio||p.id||'', p.cliente||'', p.telefono||'', p.redes||'',
                fmt(p.fechaCreacion||p.fecha), fmt(p.entrega), fmt(p.fechaFinalizado||''),
                p.concepto||'', p.cantidad||1, num(p.costo), num(p.total),
                num(p.anticipo), num(calcSaldoPendiente(p)), p.status||'', p.notas||''
            ]);
        });

    } else if (tipo === 'clientes') {
        nombreArchivo = `Clientes_${hoy}.xlsx`;
        nombreHoja = 'Clientes';
        const datos = window.clients || [];
        if (!datos.length) { manekiToastExport('No hay clientes para exportar', 'warn'); return; }
        filas.push(['Nombre','Teléfono','Facebook/Redes','Email','Tipo','Total Compras ($)','Última Compra']);
        datos.forEach(c => {
            filas.push([c.name||'', c.phone||'', c.facebook||'', c.email||'', c.type||'regular', num(c.totalPurchases), fmt(c.lastPurchase)]);
        });

    } else if (tipo === 'inventario') {
        nombreArchivo = `Inventario_${hoy}.xlsx`;
        nombreHoja = 'Inventario';
        const datos = window.products || [];
        if (!datos.length) { manekiToastExport('No hay productos para exportar', 'warn'); return; }
        const getCat = (id) => {
            const cats = window.categories || [];
            const c = cats.find(c => c.id === id);
            return c ? (c.name || id) : (id || '');
        };
        filas.push(['SKU','Nombre','Categoría','Stock','Precio Costo ($)','Precio Venta ($)','Margen %','Variantes']);
        datos.forEach(p => {
            const costo = parseFloat(p.cost||0), venta = parseFloat(p.price||0);
            const margen = costo > 0 ? ((venta-costo)/costo*100).toFixed(1)+'%' : '—';
            filas.push([p.sku||'', p.name||'', getCat(p.category), p.stock||0,
                costo.toFixed(2), venta.toFixed(2), margen, (p.variants||[]).join(', ')||'—']);
        });
    } else { return; }

    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(filas);
        ws['!cols'] = filas[0].map((_, ci) => ({
            wch: Math.min(Math.max(...filas.map(r => String(r[ci]??'').length))+3, 45)
        }));
        XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
        XLSX.writeFile(wb, nombreArchivo);
        manekiToastExport(`✅ ${filas.length-1} registros exportados → ${nombreArchivo}`, 'ok');
    } catch(err) {
        console.error('manekiExportar error:', err);
        manekiToastExport('❌ Error al generar archivo: ' + (err.message||''), 'err');
    }
}

// MEJ-15: renderSparkline usa chart.update() para actualizar datos sin destruir el chart.
// Destruir+crear en cada updateDashboard() tiene costo de inicialización (~5ms) y puede
// causar memory leaks si hay animaciones en vuelo. chart.update() es O(datos) sin overhead.
let sparklineChart = null;
// Helper: fecha local YYYY-MM-DD para un Date pasado como argumento
// (renombrada de _fechaLocal → _fechaLocalDe para no colisionar con balance.ts
//  que tenía una _fechaLocal() sin argumentos — la colisión hacía que sparkline
//  y comparativaSemanal siempre recibieran la fecha de HOY en vez de la histórica)
function _fechaLocalDe(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Helper: total de ventas para una fecha local, combinando salesHistory + pagos directos en pedidos
// PENDIENTE-02 FIX: versión correcta con deduplicación por folio y fuente secundaria p.pagos[].
//
// Reglas de conteo:
//   · type:'pedido' (pedido finalizado) — se cuenta, representa el total cobrado
//   · type:'anticipo'/'abono' para un folio FINALIZADO — se omite (ya está en type:'pedido')
//   · type:'anticipo'/'abono' para un folio ACTIVO — se cuenta (único registro de ese cobro)
//   · Sin type (venta POS) — siempre se cuenta
//   · Fuente secundaria p.pagos[]: pagos con id que NO estén ya en salesHistory se suman
//     para cubrir abonos guardados antes del fix de salesHistory, y anticipos iniciales de
//     pedidos que no pasaron por _inyectarAnticiposEnSalesHistory.
// Cache de _totalVentasDia — se invalida automáticamente cuando cambia la longitud de los datos.
// Sin esto, sparkline (7 llamadas) + comparativa semanal (14 llamadas) hacen O(42n) iteraciones.
let _vtdCache: Map<string, number> | null = null;
let _vtdCacheKey = '';
(window as any)._invalidarVentasDiaCache = () => { _vtdCache = null; };

function _totalVentasDia(dStr) {
    const sh = window.salesHistory || salesHistory || [];
    const ck = `${sh.length}_${(window.pedidos||[]).length}_${(window.pedidosFinalizados||[]).length}`;
    if (!_vtdCache || _vtdCacheKey !== ck) { _vtdCache = new Map(); _vtdCacheKey = ck; }
    if (_vtdCache.has(dStr)) return _vtdCache.get(dStr);

    // Folios que ya tienen registro 'type:pedido' completo en salesHistory (finalizados)
    const foliosFinalizados = new Set(
        sh.filter(s => s.type === 'pedido').map(s => s.folio).filter(Boolean)
    );

    const idsContados = new Set();
    let total = 0;

    // 1. Fuente principal: salesHistory
    sh.forEach(s => {
        if (s.method === 'Cancelado') return;
        // Normalizar fecha: quitar parte de hora si viene en formato UTC
        const fecha = (s.date || '').split('T')[0];
        if (fecha !== dStr) return;
        // Evitar doble conteo: omitir anticipo/abono si el pedido ya tiene registro 'pedido'
        if ((s.type === 'anticipo' || s.type === 'abono') && foliosFinalizados.has(s.folio)) return;
        if (s.id) idsContados.add(String(s.id));
        total += Number(s.total || 0);
    });

    // 2. Fuente secundaria: p.pagos[] de pedidos activos no registrados en salesHistory
    //    (cubre anticipos/abonos guardados antes del fix o sin paso por salesHistory)
    [...(window.pedidos || []), ...(window.pedidosFinalizados || [])].forEach(p => {
        // Si el pedido finalizado ya está contado via type:'pedido', omitir sus pagos individuales
        if (foliosFinalizados.has(p.folio)) return;
        (p.pagos || []).forEach(ab => {
            if (ab.id && idsContados.has(String(ab.id))) return;
            const fecha = (ab.fecha || '').split('T')[0];
            if (fecha !== dStr) return;
            const monto = Number(ab.monto || 0);
            if (!monto) return;
            total += monto;
            if (ab.id) idsContados.add(String(ab.id));
        });
    });

    _vtdCache!.set(dStr, total);
    return total;
}

function renderSparkline() {
    const canvas = document.getElementById('sparklineGanancia');
    if (!canvas) return;
    if (typeof Chart === 'undefined') return; // Chart.js aún no cargó
    const now = new Date();
    const datos = [], labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dStr = _fechaLocalDe(d);
        labels.push(d.toLocaleDateString('es-MX', {weekday:'short'}));
        datos.push(_totalVentasDia(dStr));
    }
    const tieneData = datos.some(d => d !== 0);
    const borderColor = tieneData ? 'rgba(34,197,94,0.9)' : 'rgba(156,163,175,0.5)';
    const bgColor     = tieneData ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.05)';

    if (sparklineChart) {
        // Actualizar datos en el chart existente — evita destroy+create
        sparklineChart.data.labels = labels;
        sparklineChart.data.datasets[0].data = datos;
        sparklineChart.data.datasets[0].borderColor = borderColor;
        sparklineChart.data.datasets[0].backgroundColor = bgColor;
        sparklineChart.update('active');
        return;
    }

    sparklineChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{ data: datos,
                borderColor, borderWidth: 2, fill: true, backgroundColor: bgColor,
                pointRadius: 3, pointBackgroundColor: 'rgba(34,197,94,1)', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: {
                callbacks: { label: ctx => '$' + Number(ctx.raw).toFixed(2), title: lbs => lbs[0] }
            }},
            scales: { x: { display: false }, y: { display: false } },
            animation: { duration: 800, easing: 'easeOutQuart' },
            onResize: null
        }
    });
}

function renderComparativaSemanal() {
    const hoy = new Date();
    const getWeekSales = (offsetDays) => {
        let total = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - offsetDays - i);
            total += _totalVentasDia(_fechaLocalDe(d));
        }
        return total;
    };
    const estaSemana = getWeekSales(0);
    const semanaAnterior = getWeekSales(7);
    const diff = estaSemana - semanaAnterior;
    const pct = semanaAnterior > 0 ? ((diff / semanaAnterior) * 100).toFixed(1) : (estaSemana > 0 ? 100 : 0);
    const up = diff >= 0;

    const contenedor = document.getElementById('semanalWidget');
    if (!contenedor) return;
    contenedor.className = '';
    contenedor.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-gray-700 text-sm">📊 Esta semana vs anterior</h4>
                <span class="text-xs font-semibold px-2 py-1 rounded-full ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">
                    ${up ? '▲' : '▼'} ${Math.abs(pct)}%
                </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-gray-400 mb-1">Esta semana</p>
                    <p class="font-bold text-gray-800">$${estaSemana.toFixed(2)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-gray-400 mb-1">Semana anterior</p>
                    <p class="font-bold text-gray-500">$${semanaAnterior.toFixed(2)}</p>
                </div>
            </div>
            <div class="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div class="h-2 rounded-full transition-all duration-700" 
                    style="width: ${Math.min(semanaAnterior > 0 ? (estaSemana/semanaAnterior*100) : (estaSemana>0?100:0), 100)}%; background: ${up ? '#10B981' : '#EF4444'}"></div>
            </div>
        </div>`;
}

// animarNumero: definida en dashboard.js — duplicado eliminado aquí

// ===== #67 TOGGLE DE PRIVACIDAD =====
let _privacidadActiva = false;
function togglePrivacidad() {
    _privacidadActiva = !_privacidadActiva;
    const btn   = document.getElementById('privacyToggleBtn');
    const icon  = document.getElementById('privacyIcon');
    const label = document.getElementById('privacyLabel');
    // Targets: montos en dashboard, monto total en POS, me deben, ganancia
    const targets = document.querySelectorAll(
        '#dailySales, #netProfit, #accountsReceivable, #dashMonthSales, #dashGoalPercent, .privacy-target'
    );
    targets.forEach(el => {
        if (_privacidadActiva) el.classList.add('privacy-hidden');
        else                   el.classList.remove('privacy-hidden');
    });
    if (_privacidadActiva) {
        btn.classList.add('active');
        icon.className  = 'fas fa-eye-slash';
        label.textContent = 'Visible';
        manekiToastExport('🔒 Modo privacidad activado', 'warn');
    } else {
        btn.classList.remove('active');
        icon.className  = 'fas fa-eye';
        label.textContent = 'Privacidad';
    }
}

// ===== #56 TRANSICIONES DE BOTONES =====
/**
 * btnLoading(btn) — pone spinner en el botón.
 * Devuelve función btnDone(success) para restaurarlo.
 * Uso:  const done = btnLoading(btn); ... await accion(); done(true);
 */
function btnLoading(btn) {
    if (!btn) return () => {};
    const original = btn.innerHTML;
    const originalBg = btn.style.background;
    btn.classList.add('btn-loading');
    btn.innerHTML = '<span class="btn-label"></span>';
    return function btnDone(success = true) {
        btn.classList.remove('btn-loading');
        btn.innerHTML = original;
        if (success) {
            btn.classList.add('btn-success-flash');
            setTimeout(() => btn.classList.remove('btn-success-flash'), 700);
        }
    };
}



function manekiToastExport(msg, tipo) {
    // Premium toast system v3.0
    let container = document.getElementById('mk-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mk-toast-container';
        container.className = 'mk-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    const icons = { ok: '✓', warn: '!', err: '✕', info: 'i' };
    const titles = { ok: 'Completado', warn: 'Aviso', err: 'Error', info: 'Info' };
    const t = tipo || 'ok';
    const icon = icons[t] || icons.ok;
    const title = titles[t] || titles.ok;

    const toast = document.createElement('div');
    toast.className = `mk-toast ${t}`;
    const _escT = typeof window._esc==='function'?window._esc:(s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    toast.innerHTML = `
        <div class="mk-toast-icon">${icon}</div>
        <div class="mk-toast-body">
            <div class="mk-toast-title">${title}</div>
            <div class="mk-toast-msg">${_escT(msg)}</div>
        </div>
        <div class="mk-toast-progress"></div>`;

    // Deduplicación: si ya hay un toast con el mismo mensaje activo, solo resetea su timer
    const existingToasts = container.querySelectorAll('.mk-toast:not(.out)');
    for (const existing of existingToasts) {
        if (existing.querySelector('.mk-toast-msg')?.textContent === msg) {
            if (existing._timer) clearTimeout(existing._timer);
            existing._timer = setTimeout(() => dismissToast(existing), 3600);
            existing.classList.remove('out');
            return; // no crear duplicado
        }
    }

    toast.addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    // Auto-dismiss
    const timer = setTimeout(() => dismissToast(toast), 3600);
    toast._timer = timer;

    // Max 3 toasts visibles — elimina el más antiguo si se supera
    const toasts = container.querySelectorAll('.mk-toast:not(.out)');
    if (toasts.length > 3) dismissToast(toasts[0]);
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains('out')) return;
    if (toast._timer) clearTimeout(toast._timer);
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
}

// Alias for backward compatibility
function manekiToast(msg, tipo) { manekiToastExport(msg, tipo); }

// ===== FUZZY SEARCH HELPER =====
function fuzzyMatch(str, query) {
  if (!str || !query) return false;
  str = str.toLowerCase();
  query = query.toLowerCase();
  // Exact includes check first (fast path)
  if (str.includes(query)) return true;
  // Fuzzy: score-based character matching
  let qi = 0;
  for (let si = 0; si < str.length && qi < query.length; si++) {
    if (str[si] === query[qi]) qi++;
  }
  // All query chars found in order = fuzzy match
  if (qi === query.length) return true;
  // Also handle common Spanish typos: remove accents for comparison
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const sn = normalize(str), qn = normalize(query);
  if (sn.includes(qn)) return true;
  // Allow 1 character substitution for queries >= 4 chars
  if (query.length >= 4) {
    let diff = 0;
    const shorter = Math.min(str.length, query.length);
    for (let i = 0; i < shorter; i++) {
      if (str[i] !== query[i]) diff++;
    }
    diff += Math.abs(str.length - query.length);
    if (diff <= 1) return true;
  }
  return false;
}

// ===== DEBOUNCE para buscador global =====
let _searchDebounceTimer = null;
function _debouncedSearch(value) {
  clearTimeout(_searchDebounceTimer);
  _searchDebounceTimer = setTimeout(() => busquedaGlobal(value), 160);
}

// ===== BUSCADOR GLOBAL (CORREGIDO — navegación funcional) =====
function busquedaGlobal(query) {
  const panel = document.getElementById('globalSearchResults');
  if (!panel) return; // panel no existe en este contexto
  if (!query || query.trim().length < 2) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    return;
  }
  const q = query.toLowerCase();
  let html = '';

  // Productos — navega a inventario y destaca el producto
  const prods = (window.products || []).filter(p =>
    fuzzyMatch(p.name, q) ||
    fuzzyMatch(p.sku, q) ||
    fuzzyMatch(p.proveedor, q) ||
    (p.tags && p.tags.some(t => fuzzyMatch(t, q)))
  );
  if (prods.length > 0) {
    html += `<div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-b">📦 Productos</div>`;
    prods.slice(0,4).forEach(p => {
      const img = p.imageUrl
        ? `<img src="${p.imageUrl}" alt="${_esc(p.name||'')}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" onerror="this.style.display='none'">`
        : `<span class="text-lg flex-shrink-0">${p.image||'📦'}</span>`;
      html += `<div class="px-4 py-2 hover:bg-amber-50 cursor-pointer flex items-center gap-3"
          data-id="${p.id.replace(/"/g,'')}"
          onmousedown="cerrarBusquedaGlobal(); showSection('inventory'); setTimeout(()=>{ if(typeof editProduct==='function') editProduct(this.dataset.id); },300);">
        ${img}
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate">${_esc(p.name)}</div>
          <div class="text-xs text-gray-400">Stock: ${p.stock ?? '—'} · SKU: ${p.sku||'—'}</div>
        </div>
        <div class="text-amber-700 font-bold text-sm flex-shrink-0">$${Number(p.price||0).toFixed(2)}</div>
      </div>`;
    });
  }

  // Clientes — navega a clientes
  const clis = (window.clients || []).filter(c =>
    fuzzyMatch(c.name, q) ||
    (c.phone && c.phone.includes(q)) ||
    (c.telefono && c.telefono.includes(q))
  );
  if (clis.length > 0) {
    html += `<div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-t mt-1">👤 Clientes</div>`;
    clis.slice(0,4).forEach(c => {
      const ventas = (window.salesHistory || []).filter(s => (s.customer||'').toLowerCase() === c.name.toLowerCase()).length;
      const pedidosCli = (window.pedidos || []).filter(p => (p.cliente||'').toLowerCase() === c.name.toLowerCase()).length;
      html += `<div class="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
          onmousedown="cerrarBusquedaGlobal(); showSection('clientes'); setTimeout(()=>{ const searchInput = document.getElementById('searchClient'); if(searchInput && '${c.name.replace(/'/g,"\\'")}') { searchInput.value = '${c.name.replace(/'/g,"\\'")}'; searchInput.dispatchEvent(new Event('input', { bubbles: true })); } }, 200);">
        <span class="text-lg">👤</span>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800">${_esc(c.name)}</div>
          <div class="text-xs text-gray-400">${c.phone||c.telefono||'Sin teléfono'} · ${ventas} venta${ventas!==1?'s':''} · ${pedidosCli} pedido${pedidosCli!==1?'s':''}</div>
        </div>
        <div class="text-blue-400 text-xs flex-shrink-0">Ver →</div>
      </div>`;
    });
  }

  // Pedidos — navega a pedidos
  const peds = (window.pedidos || []).filter(p =>
    fuzzyMatch(p.cliente, q) ||
    fuzzyMatch(p.folio, q) ||
    fuzzyMatch(p.concepto, q)
  );
  if (peds.length > 0) {
    html += `<div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-t mt-1">🛍️ Pedidos</div>`;
    peds.slice(0,4).forEach(p => {
      const statusColors = { pendiente:'text-yellow-500', confirmado:'text-blue-500', produccion:'text-purple-500', finalizado:'text-green-500', cancelado:'text-red-400' };
      const color = statusColors[p.status] || 'text-gray-500';
      html += `<div class="px-4 py-2 hover:bg-yellow-50 cursor-pointer flex items-center gap-3"
          onmousedown="cerrarBusquedaGlobal(); showSection('pedidos'); setTimeout(()=>{ const el=document.getElementById('kanbanBuscar'); if(el){el.value='${(p.cliente||'').replace(/'/g,"\\'")}'; el.dispatchEvent(new Event('input')); }},200);">
        <span class="text-lg">🛍️</span>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800">${p.folio||'—'} — ${p.cliente||'Sin nombre'}</div>
          <div class="text-xs text-gray-400 truncate">${p.concepto||'Sin descripción'} · Entrega: ${p.entrega||'—'}</div>
        </div>
        <div class="flex flex-col items-end flex-shrink-0">
          <span class="font-bold text-sm text-gray-700">$${Number(p.total||0).toFixed(2)}</span>
          <span class="text-xs ${color} capitalize">${p.status||'—'}</span>
        </div>
      </div>`;
    });
  }

  // Ventas del historial
  const ventas = (window.salesHistory || []).filter(s =>
    fuzzyMatch(s.customer, q) ||
    fuzzyMatch(s.folio, q) ||
    fuzzyMatch(s.concept, q)
  );
  if (ventas.length > 0) {
    html += `<div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-t mt-1">💰 Ventas</div>`;
    ventas.slice(0,3).forEach(v => {
      const escFolio = (v.folio||'').replace(/'/g,"\\'");
      html += `<div class="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-center gap-3" onmousedown="irAReportes(); setTimeout(function(){ var inp = document.getElementById('salesSearchInput'); if(inp){ inp.value='${escFolio}'; inp.dispatchEvent(new Event('input')); } }, 300);">
        <span class="text-lg">💰</span>
        <div class="flex-1 min-w-0"><div class="font-medium text-gray-800">${v.customer||'Cliente General'}</div>
        <div class="text-xs text-gray-400">${v.date||'—'} · ${v.method||'—'}</div></div>
        <div class="font-bold text-sm text-green-700 flex-shrink-0">$${Number(v.total||0).toFixed(2)}</div>
      </div>`;
    });
  }

  if (!html) {
    html = `<div class="px-4 py-6 text-center text-gray-400 text-sm">Sin resultados para "<b>${query}</b>"</div>`;
  }
  panel.innerHTML = html;
  panel.classList.remove('hidden');
}

function cerrarBusquedaGlobal() {
  const panel = document.getElementById('globalSearchResults');
  if (panel) { panel.classList.add('hidden'); panel.innerHTML = ''; }
}

function irAProducto() {
  cerrarBusquedaGlobal();
  document.getElementById('globalSearchInput').value = '';
  showSection('inventory');
}

function irACliente() {
  cerrarBusquedaGlobal();
  document.getElementById('globalSearchInput').value = '';
  showSection('clientes');
}

function irAPedido() {
  cerrarBusquedaGlobal();
  document.getElementById('globalSearchInput').value = '';
  showSection('pedidos');
}

function irAReportes() {
  cerrarBusquedaGlobal();
  document.getElementById('globalSearchInput').value = '';
  showSection('reportes');
}

    // ── CONFIRM MODAL REUTILIZABLE — BUG-NEW-06 FIX: thread-safe con queue ──
    // Antes: _confirmResolve era una sola variable; si se llamaba showConfirm()
    // mientras otro confirm estaba abierto, la primera Promise quedaba huérfana (nunca resolvía).
    // Ahora: se usa una cola FIFO — cada llamada espera a que la anterior cierre.
    const _confirmQueue = [];
    let _confirmBusy = false;

    function _processConfirmQueue() {
        if (_confirmBusy || _confirmQueue.length === 0) return;
        _confirmBusy = true;
        const { message, title, resolve } = _confirmQueue.shift();
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        window._confirmCurrentResolve = resolve;
        openModal('confirmModal');
    }

    function showConfirm(message, title = '¿Estás seguro?') {
        return new Promise(resolve => {
            _confirmQueue.push({ message, title, resolve });
            _processConfirmQueue();
        });
    }
    function confirmModalResolve(result) {
        closeModal('confirmModal');
        _confirmBusy = false;
        if (window._confirmCurrentResolve) {
            window._confirmCurrentResolve(result);
            window._confirmCurrentResolve = null;
        }
        // Procesar siguiente en la cola (si hay)
        setTimeout(_processConfirmQueue, 250);
    }
    window.showConfirm = showConfirm;
    window.confirmModalResolve = confirmModalResolve;

    // ── PROMPT MODAL REUTILIZABLE ──────────────────────────────────────────────
    // Existía showConfirm pero NO un equivalente para pedir texto, así que el código
    // caía en prompt() nativo (bloqueante y feo). showPrompt() cierra ese hueco.
    // Devuelve Promise<string|null> — null si el usuario cancela.
    function showPrompt(message, defaultValue = '', title = 'Ingresar valor') {
        return new Promise(resolve => {
            let ov = document.getElementById('mkPromptOverlay');
            if (ov) ov.remove();
            ov = document.createElement('div');
            ov.id = 'mkPromptOverlay';
            ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,15,20,.55);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);';
            const box = document.createElement('div');
            box.style.cssText = 'background:#fff;border-radius:16px;padding:24px;width:min(420px,90vw);box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:inherit;';
            box.innerHTML =
                '<h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:#1f2937;">' + _esc(title) + '</h3>' +
                '<p style="margin:0 0 14px;font-size:14px;color:#6b7280;">' + _esc(message) + '</p>' +
                '<input id="mkPromptInput" type="text" style="width:100%;box-sizing:border-box;padding:11px 13px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:15px;outline:none;" />' +
                '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">' +
                '<button id="mkPromptCancel" style="padding:9px 18px;border:1.5px solid #e5e7eb;background:#fff;border-radius:10px;font-weight:600;cursor:pointer;color:#374151;">Cancelar</button>' +
                '<button id="mkPromptOk" class="mk-btn-primary" style="padding:9px 18px;border:none;border-radius:10px;font-weight:600;cursor:pointer;">Guardar</button>' +
                '</div>';
            ov.appendChild(box);
            document.body.appendChild(ov);
            const input: any = document.getElementById('mkPromptInput');
            input.value = defaultValue;
            const done = (val) => { ov.remove(); resolve(val); };
            document.getElementById('mkPromptCancel').onclick = () => done(null);
            document.getElementById('mkPromptOk').onclick = () => done(input.value);
            ov.onclick = (e) => { if (e.target === ov) done(null); };
            input.onkeydown = (e) => {
                if (e.key === 'Enter') { e.preventDefault(); done(input.value); }
                else if (e.key === 'Escape') { e.preventDefault(); done(null); }
            };
            setTimeout(() => { input.focus(); input.select(); }, 30);
        });
    }
    window.showPrompt = showPrompt;

// ── Ctrl+K / Cmd+K — enfocar buscador global ──────────────────────────────
// ── NTH-19: N = nuevo, Esc = cerrar modal, R = recargar dashboard ─────────
document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+L — abrir log de errores
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        if (typeof _abrirErrorLog === 'function') _abrirErrorLog();
        return;
    }

    // Ctrl+1..9 — navegación rápida a secciones
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const _sectionKeys: Record<string, string> = {
            '1': 'bienvenida', '2': 'pedidos', '3': 'inventory',
            '4': 'balance', '5': 'reportes', '6': 'clientes',
            '7': 'envios', '8': 'equipos', '9': 'backup'
        };
        if (_sectionKeys[e.key]) {
            e.preventDefault();
            if (typeof showSection === 'function') showSection(_sectionKeys[e.key]);
            return;
        }
    }

    // Ctrl+K / Cmd+K — command palette (navega + ejecuta acciones)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (typeof (window as any).mkOpenCommandPalette === 'function') {
            (window as any).mkOpenCommandPalette();
        } else {
            const searchInput = document.getElementById('globalSearchInput');
            if (searchInput) { (searchInput as HTMLInputElement).focus(); (searchInput as HTMLInputElement).select(); }
        }
        return;
    }

    // Skip if typing in an input/textarea/select/contenteditable
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
    // Skip if a modal is open (except Esc which should close it)
    const anyModal = document.querySelector('.modal-overlay[style*="flex"], .modal-overlay.active, [id$="Modal"][style*="flex"]');

    // Esc — cerrar overlay de búsqueda o modal visible más reciente
    if (e.key === 'Escape') {
        const overlay = document.getElementById('busquedaGlobalOverlay');
        if (overlay && overlay.style.display !== 'none') {
            e.preventDefault();
            _cerrarBusquedaOverlay();
            return;
        }
        const errorModal = document.getElementById('errorLogModal');
        if (errorModal && errorModal.style.display !== 'none') {
            e.preventDefault();
            errorModal.style.display = 'none';
            return;
        }
        const visibleModals = Array.from(document.querySelectorAll('[id$="Modal"]')).filter(m => {
            const s = window.getComputedStyle(m);
            return s.display !== 'none' && s.visibility !== 'hidden';
        });
        if (visibleModals.length > 0) {
            e.preventDefault();
            const topModal = visibleModals[visibleModals.length - 1];
            // BUG-IDX-10 FIX: confirmModal necesita pasar por confirmModalResolve(false)
            // para limpiar _confirmBusy y procesar la cola de confirms pendientes.
            if (topModal.id === 'confirmModal') {
                if (typeof confirmModalResolve === 'function') {
                    confirmModalResolve(false);
                } else {
                    closeModal('confirmModal');
                }
                return;
            }
            closeModal(topModal);
        }
        return;
    }

    // "/" — abrir búsqueda global overlay (cuando no hay input activo)
    if (e.key === '/') {
        const overlay = document.getElementById('busquedaGlobalOverlay');
        if (overlay) {
            e.preventDefault();
            _abrirBusquedaOverlay();
            return;
        }
    }

    // If a modal is open, don't trigger N or R
    if (anyModal) return;

    // N — nuevo pedido o nuevo producto según sección activa
    if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const seccionActiva = document.querySelector('.mk-section.active, [id^="section-"].active, section.active');
        const secId = seccionActiva?.id || '';
        if (secId.includes('inventario') || secId.includes('producto') || secId.includes('catalog')) {
            if (typeof openProductModal === 'function') openProductModal();
        } else {
            // Default: nuevo pedido
            if (typeof openPedidoModal === 'function') openPedidoModal();
        }
        return;
    }

    // R — recargar dashboard
    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (typeof updateDashboard === 'function') updateDashboard();
        return;
    }

    // Ctrl+A: seleccionar todos en inventario
    if (e.ctrlKey && e.key === 'a' && !e.shiftKey && !e.altKey) {
        const section = document.querySelector('section:not(.hidden[style*="display: none"]):not(.hidden)')?.id;
        if (section?.includes('inventory') || section?.includes('inventario')) {
            e.preventDefault();
            const checkboxes = Array.from(document.querySelectorAll('#inventoryTable input[type="checkbox"], .product-checkbox, [data-product-checkbox]')) as HTMLInputElement[];
            if (checkboxes.length === 0) { (window as any).manekiToastExport?.('Sin productos para seleccionar', 'warn'); return; }
            const allChecked = checkboxes.every(cb => cb.checked);
            checkboxes.forEach(cb => { cb.checked = !allChecked; cb.dispatchEvent(new Event('change')); });
            if (typeof (window as any).toggleSeleccionarTodos === 'function') (window as any).toggleSeleccionarTodos(!allChecked);
            (window as any).manekiToastExport?.(allChecked ? '☐ Selección limpiada' : `☑ ${checkboxes.length} productos seleccionados`, 'info');
        }
    }

    // Ctrl+Q: abrir cotizaciones
    if (e.ctrlKey && (e.key === 'q' || e.key === 'Q') && !e.shiftKey) {
        e.preventDefault();
        if (typeof (window as any).openQuoteModal === 'function') (window as any).openQuoteModal();
        else if (typeof (window as any).showSection === 'function') (window as any).showSection('analisis');
        (window as any).manekiToastExport?.('📊 Cotizaciones (Ctrl+Q)', 'info');
    }

    // Ctrl+E: exportar
    if (e.ctrlKey && (e.key === 'e' || e.key === 'E') && !e.shiftKey) {
        e.preventDefault();
        const activeSection = document.querySelector('section:not(.hidden):not([style*="display: none"])')?.id?.replace('-section','') || '';
        const exportFns: Record<string, string> = {
            inventario:  'exportarInventarioExcel',
            inventory:   'exportarInventarioExcel',
            balance:     'exportarBalanceMesCSV',
            pedidos:     'exportarPedidosCSV',
            clientes:    'exportarClientesCSV',
            reportes:    'exportarReportePDF',
        };
        const fnName = exportFns[activeSection];
        if (fnName && typeof (window as any)[fnName] === 'function') {
            (window as any)[fnName]();
        } else {
            (window as any).manekiToastExport?.('No hay exportación disponible en esta sección', 'warn');
        }
    }

});

// ══════════════════════════════════════════════════════════════════════════
// UNDO GLOBAL — Ctrl+Z para deshacer la última acción importante
// ══════════════════════════════════════════════════════════════════════════
interface UndoAction {
    descripcion: string;
    fn: () => void;
}
const _mkUndoStack: UndoAction[] = [];
const _MK_UNDO_MAX = 10;
let _undoToastTimer: ReturnType<typeof setTimeout> | null = null;

function mkPushUndo(descripcion: string, fn: () => void) {
    _mkUndoStack.push({ descripcion, fn });
    if (_mkUndoStack.length > _MK_UNDO_MAX) _mkUndoStack.shift();
}
window.mkPushUndo = mkPushUndo;

function _mkUndo() {
    const action = _mkUndoStack.pop();
    if (!action) {
        manekiToastExport('Nada que deshacer', 'warn');
        return;
    }
    try {
        action.fn();
        manekiToastExport(`↩️ Deshecho: ${action.descripcion}`, 'ok');
    } catch(e) {
        manekiToastExport('Error al deshacer', 'err');
    }
}

// Mostrar toast de "Puedes deshacer" después de una acción importante
function mkMostrarUndoHint(descripcion: string) {
    if (_undoToastTimer) clearTimeout(_undoToastTimer);
    let hint = document.getElementById('_mkUndoHint');
    if (!hint) {
        hint = document.createElement('div');
        hint.id = '_mkUndoHint';
        hint.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9997;background:#1F2937;color:#fff;padding:8px 16px;border-radius:10px;font-size:.78rem;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.25);transition:opacity .3s;white-space:nowrap;';
        document.body.appendChild(hint);
    }
    hint.innerHTML = `<span>↩️ ${typeof _esc === 'function' ? _esc(descripcion) : descripcion}</span><kbd onclick="_mkUndo()" style="background:#374151;border:1px solid #4B5563;border-radius:5px;padding:2px 7px;font-size:.72rem;cursor:pointer;font-family:inherit;">Ctrl+Z</kbd>`;
    hint.style.opacity = '1';
    hint.style.display = 'flex';
    _undoToastTimer = setTimeout(() => {
        if (hint) { hint.style.opacity = '0'; setTimeout(() => { if (hint) hint.style.display = 'none'; }, 300); }
    }, 5000);
}
window.mkMostrarUndoHint = mkMostrarUndoHint;

// Atajo Ctrl+Z — solo si no hay input activo
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
        e.preventDefault();
        _mkUndo();
    }
});

// ══════════════════════════════════════════════════════════════════════════
// Op2 — DENSIDAD DE TABLA (Cómodo / Compacto) — persistida en localStorage
// ══════════════════════════════════════════════════════════════════════════
function mkAplicarDensidad() {
    const compacto = localStorage.getItem('mk_density') === 'compact';
    document.body.classList.toggle('mk-dense', compacto);
    document.querySelectorAll('.mk-density-toggle').forEach(tg => {
        tg.querySelectorAll('button').forEach(b => {
            b.classList.toggle('active', (b.dataset.density === 'compact') === compacto);
        });
    });
}
function mkToggleDensidad(modo?: string) {
    const actual = localStorage.getItem('mk_density') === 'compact' ? 'compact' : 'comfortable';
    const nuevo = modo || (actual === 'compact' ? 'comfortable' : 'compact');
    localStorage.setItem('mk_density', nuevo);
    mkAplicarDensidad();
}
(window as any).mkToggleDensidad = mkToggleDensidad;
(window as any).mkAplicarDensidad = mkAplicarDensidad;
// Inyecta el control segmentado Cómodo/Compacto en un contenedor dado
(window as any).mkRenderDensityToggle = function(): string {
    return `<div class="mk-density-toggle" role="group" aria-label="Densidad de tabla">
        <button type="button" data-density="comfortable" onclick="mkToggleDensidad('comfortable')" data-tip="Vista cómoda">Cómodo</button>
        <button type="button" data-density="compact" onclick="mkToggleDensidad('compact')" data-tip="Más filas por pantalla">Compacto</button>
    </div>`;
};
document.addEventListener('DOMContentLoaded', mkAplicarDensidad);
mkAplicarDensidad();

// ══════════════════════════════════════════════════════════════════════════
// Op5 — COMMAND PALETTE (Ctrl+K) — navega y ejecuta acciones sin mouse
// ══════════════════════════════════════════════════════════════════════════
interface MkCommand { ico: string; label: string; sub?: string; keys: string; group: string; run: () => void; }

function _mkCall(fn: string, ...args: any[]) {
    const f = (window as any)[fn];
    if (typeof f === 'function') { f(...args); return true; }
    manekiToastExport('Acción no disponible aquí', 'warn');
    return false;
}

function _mkBuildCommands(): MkCommand[] {
    const nav = (s: string) => () => _mkCall('showSection', s);
    return [
        // Navegación
        { ico:'🏠', label:'Ir a Dashboard',     keys:'inicio home bienvenida panel', group:'Navegar', run: nav('bienvenida') },
        { ico:'📋', label:'Ir a Pedidos',        keys:'orders kanban encargos',      group:'Navegar', run: nav('pedidos') },
        { ico:'📦', label:'Ir a Inventario',     keys:'productos stock materia',     group:'Navegar', run: nav('inventory') },
        { ico:'💰', label:'Ir a Balance',        keys:'cxc cxp ingresos gastos',     group:'Navegar', run: nav('balance') },
        { ico:'📊', label:'Ir a Reportes',       keys:'graficas estadisticas ventas',group:'Navegar', run: nav('reportes') },
        { ico:'👥', label:'Ir a Clientes',       keys:'customers rfm contactos',     group:'Navegar', run: nav('clientes') },
        { ico:'🚚', label:'Ir a Envíos',         keys:'shipping mapa anillos',       group:'Navegar', run: nav('envios') },
        { ico:'⚙️', label:'Ir a Equipos / ROI',  keys:'maquinas inversion roi',      group:'Navegar', run: nav('equipos') },
        { ico:'🗂️', label:'Ir a Configuración',  keys:'settings ajustes tema',       group:'Navegar', run: nav('configuracion') },
        { ico:'💾', label:'Ir a Respaldo',       keys:'backup exportar importar',    group:'Navegar', run: nav('backup') },
        // Acciones
        { ico:'➕', label:'Nuevo pedido',        sub:'N', keys:'crear orden encargo', group:'Acción', run: () => _mkCall('openPedidoModal') },
        { ico:'🏷️', label:'Nuevo producto',      keys:'crear inventario alta',       group:'Acción', run: () => _mkCall('openAddProductModal') },
        { ico:'🧾', label:'Nueva cotización',    sub:'Ctrl+Q', keys:'quote presupuesto', group:'Acción', run: () => { if (typeof (window as any).openQuoteModal==='function') (window as any).openQuoteModal(); else _mkCall('showSection','analisis'); } },
        { ico:'📤', label:'Exportar inventario', keys:'excel csv descargar',         group:'Acción', run: () => _mkCall('exportarInventarioExcel') },
        { ico:'📤', label:'Exportar balance',    keys:'csv descargar mes',           group:'Acción', run: () => _mkCall('exportarBalanceMesCSV') },
        { ico:'📤', label:'Exportar clientes',   keys:'csv descargar',               group:'Acción', run: () => _mkCall('exportarClientesCSV') },
        { ico:'🔄', label:'Recargar dashboard',  sub:'R', keys:'refresh actualizar',  group:'Acción', run: () => _mkCall('updateDashboard') },
        // Preferencias
        { ico:'🌓', label:'Alternar modo oscuro', keys:'dark light tema',            group:'Preferencias', run: () => _mkCall('toggleDarkMode') },
        { ico:'↕️', label:'Alternar densidad de tabla', keys:'compacto comodo filas', group:'Preferencias', run: () => mkToggleDensidad() },
        { ico:'⌨️', label:'Ver atajos de teclado', sub:'?', keys:'shortcuts ayuda',   group:'Preferencias', run: () => _mkCall('mostrarAtajos') },
        // Pedidos activos (dinámico)
        ...((window.pedidos || []).slice(0, 20).map((p: any) => ({
            ico: '📋',
            label: `${p.folio || '—'} · ${p.cliente || '—'}`,
            keys: [p.folio, p.cliente, p.concepto, p.telefono].filter(Boolean).join(' ').toLowerCase(),
            group: 'Pedidos',
            run: () => { _mkCall('showSection', 'pedidos'); setTimeout(() => { const inp = document.getElementById('kanbanBuscar') as HTMLInputElement|null; if (inp) { inp.value = p.folio || ''; inp.dispatchEvent(new Event('input')); } }, 300); }
        }))),
        // Pedidos finalizados recientes
        ...((window.pedidosFinalizados || []).slice(-10).reverse().slice(0, 5).map((p: any) => ({
            ico: '✅',
            label: `${p.folio || '—'} · ${p.cliente || '—'} (finalizado)`,
            keys: [p.folio, p.cliente, p.concepto].filter(Boolean).join(' ').toLowerCase(),
            group: 'Pedidos',
            run: () => { _mkCall('showSection', 'pedidos'); setTimeout(() => _mkCall('mostrarHistorialPedidos'), 400); }
        }))),
    ];
}

let _mkCmdkCommands: MkCommand[] = [];
let _mkCmdkFiltered: MkCommand[] = [];
let _mkCmdkActive = 0;

function _mkEnsureCmdkDom() {
    if (document.getElementById('mk-cmdk-overlay')) return;
    const ov = document.createElement('div');
    ov.id = 'mk-cmdk-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Paleta de comandos');
    ov.innerHTML = `<div id="mk-cmdk">
        <input id="mk-cmdk-input" type="text" placeholder="Escribe un comando o sección…" autocomplete="off" spellcheck="false" aria-label="Buscar comando">
        <div id="mk-cmdk-list" role="listbox"></div>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) mkCloseCommandPalette(); });
    const input = ov.querySelector('#mk-cmdk-input') as HTMLInputElement;
    input.addEventListener('input', () => { _mkCmdkActive = 0; _mkRenderCmdk(input.value); });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); _mkCmdkActive = Math.min(_mkCmdkActive + 1, _mkCmdkFiltered.length - 1); _mkHighlightCmdk(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); _mkCmdkActive = Math.max(_mkCmdkActive - 1, 0); _mkHighlightCmdk(); }
        else if (e.key === 'Enter') { e.preventDefault(); _mkRunCmdk(_mkCmdkActive); }
        else if (e.key === 'Escape') { e.preventDefault(); mkCloseCommandPalette(); }
    });
}

function _mkRenderCmdk(q: string) {
    const list = document.getElementById('mk-cmdk-list');
    if (!list) return;
    const term = (q || '').trim().toLowerCase();
    _mkCmdkFiltered = !term ? _mkCmdkCommands
        : _mkCmdkCommands.filter(c => (c.label + ' ' + c.keys + ' ' + c.group).toLowerCase().includes(term));
    if (_mkCmdkFiltered.length === 0) {
        list.innerHTML = `<div class="mk-cmdk-empty">Sin resultados para “${typeof _esc==='function'?_esc(q):q}”</div>`;
        return;
    }
    let html = ''; let lastGroup = '';
    _mkCmdkFiltered.forEach((c, i) => {
        if (c.group !== lastGroup) { html += `<div class="mk-cmdk-group">${c.group}</div>`; lastGroup = c.group; }
        html += `<div class="mk-cmdk-item${i === _mkCmdkActive ? ' active' : ''}" role="option" data-idx="${i}" onclick="_mkRunCmdkGlobal(${i})">
            <span class="mk-cmdk-ico">${c.ico}</span><span>${c.label}</span>${c.sub ? `<span class="mk-cmdk-sub">${c.sub}</span>` : ''}</div>`;
    });
    list.innerHTML = html;
}

function _mkHighlightCmdk() {
    const list = document.getElementById('mk-cmdk-list');
    if (!list) return;
    list.querySelectorAll('.mk-cmdk-item').forEach((el, i) => {
        const on = i === _mkCmdkActive;
        el.classList.toggle('active', on);
        if (on) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    });
}

function _mkRunCmdk(idx: number) {
    const cmd = _mkCmdkFiltered[idx];
    if (!cmd) return;
    mkCloseCommandPalette();
    setTimeout(() => { try { cmd.run(); } catch(err) { manekiToastExport('Error al ejecutar comando', 'err'); } }, 60);
}
(window as any)._mkRunCmdkGlobal = _mkRunCmdk;

function mkOpenCommandPalette() {
    _mkEnsureCmdkDom();
    _mkCmdkCommands = _mkBuildCommands();
    _mkCmdkActive = 0;
    const ov = document.getElementById('mk-cmdk-overlay');
    const input = document.getElementById('mk-cmdk-input') as HTMLInputElement;
    if (!ov || !input) return;
    input.value = '';
    _mkRenderCmdk('');
    ov.classList.add('visible');
    setTimeout(() => input.focus(), 30);
}
function mkCloseCommandPalette() {
    document.getElementById('mk-cmdk-overlay')?.classList.remove('visible');
}
(window as any).mkOpenCommandPalette = mkOpenCommandPalette;
(window as any).mkCloseCommandPalette = mkCloseCommandPalette;

// ═══════════════════════════════════════════════════════════════════════════
// ── MEJORA 1: BÚSQUEDA GLOBAL OVERLAY (Ctrl+K / "/") ─────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _normSearch(texto) {
    if (!texto) return '';
    return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function _matchBusqueda(valor, q) {
    if (!valor || !q) return false;
    return _normSearch(valor).includes(q);
}

function _abrirBusquedaOverlay() {
    const overlay = document.getElementById('busquedaGlobalOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    const input = document.getElementById('busquedaGlobalInput');
    if (input) { input.value = ''; input.focus(); }
    document.getElementById('busquedaGlobalResultados').innerHTML = '';
}

function _cerrarBusquedaOverlay() {
    const overlay = document.getElementById('busquedaGlobalOverlay');
    if (overlay) overlay.style.display = 'none';
    const input = document.getElementById('busquedaGlobalInput');
    if (input) input.value = '';
    const resultados = document.getElementById('busquedaGlobalResultados');
    if (resultados) resultados.innerHTML = '';
}

function _busquedaOverlayRender(q) {
    const contenedor = document.getElementById('busquedaGlobalResultados');
    if (!contenedor) return;
    if (!q || q.trim().length < 2) { contenedor.innerHTML = ''; return; }
    const qn = _normSearch(q.trim());

    let html = '';
    let hayResultados = false;

    // ── Pedidos activos + finalizados ──
    const todosLosPedidos = [
        ...(window.pedidos || []),
        ...(window.pedidosFinalizados || [])
    ];
    const pedidosFiltrados = todosLosPedidos.filter(p =>
        _matchBusqueda(p.folio, qn) ||
        _matchBusqueda(p.cliente, qn) ||
        _matchBusqueda(p.concepto, qn)
    ).slice(0, 5);

    if (pedidosFiltrados.length > 0) {
        hayResultados = true;
        const statusColors = { pendiente:'#f59e0b', confirmado:'#3b82f6', produccion:'#8b5cf6', finalizado:'#10b981', cancelado:'#ef4444' };
        html += `<div style="padding:6px 12px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f3f4f6">📦 Pedidos</div>`;
        pedidosFiltrados.forEach((p, i) => {
            const color = statusColors[p.status] || '#6b7280';
            html += `<div class="busq-resultado" data-tipo="pedido" data-folio="${_esc(p.folio||'')}" data-cliente="${_esc(p.cliente||'')}" data-idx="${i}" tabindex="-1"
                style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9fafb">
                <span style="font-size:18px">🛍️</span>
                <div style="flex:1; min-width:0">
                    <div style="font-weight:600; color:#111827; font-size:13px">${_esc(p.folio||'—')} — ${_esc(p.cliente||'Sin nombre')}</div>
                    <div style="font-size:11px; color:#9ca3af; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${_esc(p.concepto||'Sin descripción')}</div>
                </div>
                <div style="text-align:right; flex-shrink:0">
                    <div style="font-weight:700; font-size:13px; color:#374151">$${Number(p.total||0).toFixed(2)}</div>
                    <div style="font-size:11px; color:${color}; text-transform:capitalize">${_esc(p.status||'—')}</div>
                </div>
            </div>`;
        });
    }

    // ── Productos ──
    const productosFiltrados = (window.products || []).filter(p =>
        _matchBusqueda(p.name, qn) ||
        _matchBusqueda(p.sku, qn) ||
        _matchBusqueda(p.codigo, qn)
    ).slice(0, 5);

    if (productosFiltrados.length > 0) {
        hayResultados = true;
        html += `<div style="padding:6px 12px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f3f4f6; border-top:1px solid #f3f4f6; margin-top:4px">🏷️ Productos</div>`;
        productosFiltrados.forEach((p, i) => {
            const stock = p.stock ?? '—';
            html += `<div class="busq-resultado" data-tipo="producto" data-id="${_esc(String(p.id||''))}" data-idx="${i}" tabindex="-1"
                style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9fafb">
                <span style="font-size:18px">${p.image||'📦'}</span>
                <div style="flex:1; min-width:0">
                    <div style="font-weight:600; color:#111827; font-size:13px">${_esc(p.name||'Sin nombre')}</div>
                    <div style="font-size:11px; color:#9ca3af">SKU: ${_esc(p.sku||'—')} · Stock: ${stock}</div>
                </div>
                <div style="font-weight:700; font-size:13px; color:#b45309; flex-shrink:0">$${Number(p.price||0).toFixed(2)}</div>
            </div>`;
        });
    }

    // ── Clientes (usa window.clients según nombre real del array) ──
    const clientesFiltrados = (window.clients || []).filter(c =>
        _matchBusqueda(c.name, qn) ||
        _matchBusqueda(c.phone, qn) ||
        _matchBusqueda(c.telefono, qn)
    ).slice(0, 5);

    if (clientesFiltrados.length > 0) {
        hayResultados = true;
        html += `<div style="padding:6px 12px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f3f4f6; border-top:1px solid #f3f4f6; margin-top:4px">👤 Clientes</div>`;
        clientesFiltrados.forEach((c, i) => {
            html += `<div class="busq-resultado" data-tipo="cliente" data-nombre="${_esc(c.name||'')}" data-idx="${i}" tabindex="-1"
                style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9fafb">
                <span style="font-size:18px">👤</span>
                <div style="flex:1; min-width:0">
                    <div style="font-weight:600; color:#111827; font-size:13px">${_esc(c.name||'Sin nombre')}</div>
                    <div style="font-size:11px; color:#9ca3af">${_esc(c.phone||c.telefono||'Sin teléfono')}</div>
                </div>
                <div style="font-size:11px; color:#6b7280; flex-shrink:0">Ver →</div>
            </div>`;
        });
    }

    if (!hayResultados) {
        html = `<div style="padding:32px 16px; text-align:center; color:#9ca3af; font-size:14px">Sin resultados para "<b>${_esc(q)}</b>"</div>`;
    }

    contenedor.innerHTML = html;

    // Evento click en resultados
    contenedor.querySelectorAll('.busq-resultado').forEach(el => {
        el.addEventListener('mousedown', function(ev) {
            ev.preventDefault();
            _seleccionarResultadoBusqueda(this);
        });
        el.addEventListener('mouseover', function() {
            _resaltarResultado(this);
        });
    });
}

function _seleccionarResultadoBusqueda(el) {
    const tipo = el.dataset.tipo;
    _cerrarBusquedaOverlay();
    if (tipo === 'pedido') {
        if (typeof showSection === 'function') showSection('pedidos');
        const folio = el.dataset.folio;
        const cliente = el.dataset.cliente;
        setTimeout(() => {
            const buscarEl = document.getElementById('kanbanBuscar');
            if (buscarEl && folio) {
                buscarEl.value = folio;
                buscarEl.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (buscarEl && cliente) {
                buscarEl.value = cliente;
                buscarEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 200);
    } else if (tipo === 'producto') {
        if (typeof showSection === 'function') showSection('inventario');
        const id = el.dataset.id;
        setTimeout(() => {
            if (id && typeof editProduct === 'function') editProduct(id);
        }, 300);
    } else if (tipo === 'cliente') {
        if (typeof showSection === 'function') showSection('clientes');
        const nombre = el.dataset.nombre;
        setTimeout(() => {
            const searchInput = document.getElementById('searchClient');
            if (searchInput && nombre) {
                searchInput.value = nombre;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 200);
    }
}

function _resaltarResultado(el) {
    const contenedor = document.getElementById('busquedaGlobalResultados');
    if (!contenedor) return;
    contenedor.querySelectorAll('.busq-resultado').forEach(r => {
        r.style.background = '';
        delete r.dataset.resaltado;
    });
    el.style.background = '#f0f9ff';
    el.dataset.resaltado = '1';
}

function _navResultados(direccion) {
    const contenedor = document.getElementById('busquedaGlobalResultados');
    if (!contenedor) return;
    const items = Array.from(contenedor.querySelectorAll('.busq-resultado'));
    if (!items.length) return;
    const actual = items.findIndex(i => i.dataset.resaltado === '1');
    items.forEach(i => { i.style.background = ''; delete i.dataset.resaltado; });
    let siguiente = actual + direccion;
    if (siguiente < 0) siguiente = items.length - 1;
    if (siguiente >= items.length) siguiente = 0;
    items[siguiente].style.background = '#f0f9ff';
    items[siguiente].dataset.resaltado = '1';
    items[siguiente].scrollIntoView({ block: 'nearest' });
}

function initBusquedaGlobal() {
    if (document.getElementById('busquedaGlobalOverlay')) return; // ya existe

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'busquedaGlobalOverlay';
    overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:flex-start; justify-content:center; padding-top:10vh';
    overlay.innerHTML = `
        <div style="background:white; border-radius:12px; width:600px; max-width:90vw; max-height:70vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px rgba(0,0,0,0.3)">
            <div style="padding:16px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; gap:8px">
                <span>🔍</span>
                <input id="busquedaGlobalInput" type="text" placeholder="Buscar pedidos, productos, clientes..."
                    style="flex:1; border:none; outline:none; font-size:16px">
                <kbd style="background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:12px; color:#6b7280; border:1px solid #e5e7eb">ESC</kbd>
            </div>
            <div id="busquedaGlobalResultados" style="overflow-y:auto; flex:1; padding:8px"></div>
        </div>`;
    document.body.appendChild(overlay);

    // FIX-7: Agregar hint Ctrl+K junto al input de búsqueda
    const inputWrapper = document.querySelector('#busquedaGlobalOverlay input')?.parentElement;
    if (inputWrapper && !inputWrapper.querySelector('._busq-kbd')) {
        inputWrapper.insertAdjacentHTML('beforeend',
            '<kbd class="_busq-kbd" style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:4px;padding:2px 6px;font-size:11px;color:#6b7280;pointer-events:none">Ctrl+K</kbd>'
        );
    }

    // Cerrar al hacer clic en el fondo
    overlay.addEventListener('mousedown', function(e) {
        if (e.target === overlay) _cerrarBusquedaOverlay();
    });

    // Input con debounce 250ms
    let _bgTimer = null;
    const input = document.getElementById('busquedaGlobalInput');
    input.addEventListener('input', function() {
        clearTimeout(_bgTimer);
        _bgTimer = setTimeout(() => _busquedaOverlayRender(this.value), 250);
    });

    // Navegación con teclado dentro del overlay
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { _cerrarBusquedaOverlay(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); _navResultados(1); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); _navResultados(-1); return; }
        if (e.key === 'Enter') {
            e.preventDefault();
            const contenedor = document.getElementById('busquedaGlobalResultados');
            const resaltado = contenedor && contenedor.querySelector('[data-resaltado="1"]');
            if (resaltado) _seleccionarResultadoBusqueda(resaltado);
            return;
        }
    });
}

// initModoCompacto eliminado — botón removido del sidebar

// ═══════════════════════════════════════════════════════════════════════════
// ── MEJORA 3: LOG DE ERRORES (Ctrl+Shift+L) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function initErrorLog() {
    // Captura de errores globales
    window._errorLog = window._errorLog || [];

    const _prevOnerror = window.onerror;
    window.onerror = function(msg, src, line, col, err) {
        // Encadenar con handler anterior
        if (typeof _prevOnerror === 'function') _prevOnerror(msg, src, line, col, err);
        // Agregar al log propio
        window._errorLog = window._errorLog || [];
        window._errorLog.unshift({ ts: new Date().toISOString(), tipo: 'error', msg, src, line, stack: err?.stack });
        if (window._errorLog.length > 50) window._errorLog.pop();
    };

    const _prevUnhandled = window._unhandledRejectionHandler || null;
    const _unhandledHandler = function(e) {
        // Encadenar con handler anterior si existe
        if (typeof _prevUnhandled === 'function') _prevUnhandled(e);
        window._errorLog = window._errorLog || [];
        window._errorLog.unshift({
            ts: new Date().toISOString(),
            tipo: 'promise',
            msg: String(e.reason),
            stack: e.reason && e.reason.stack ? e.reason.stack : null
        });
        if (window._errorLog.length > 50) window._errorLog.pop();
    };
    window._unhandledRejectionHandler = _unhandledHandler;
    window.addEventListener('unhandledrejection', _unhandledHandler);

    // Crear modal si no existe
    if (document.getElementById('errorLogModal')) return;

    const modal = document.createElement('div');
    modal.id = 'errorLogModal';
    modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:10000; align-items:center; justify-content:center';
    modal.innerHTML = `
        <div style="background:#1e1e1e; border-radius:12px; width:800px; max-width:95vw; max-height:80vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 60px rgba(0,0,0,0.5); color:#d4d4d4; font-family:monospace">
            <div style="padding:14px 18px; border-bottom:1px solid #333; display:flex; align-items:center; gap:8px; background:#252526">
                <span style="font-size:16px">🐛</span>
                <span style="font-weight:700; font-size:14px; color:#e9e9e9">Log de Errores</span>
                <span id="errorLogCount" style="background:#ef4444; color:white; border-radius:999px; padding:1px 7px; font-size:11px; margin-left:4px"></span>
                <div style="margin-left:auto; display:flex; gap:8px">
                    <button id="errorLogCopyBtn"
                        style="background:#0e639c; border:none; border-radius:6px; padding:5px 10px; color:white; cursor:pointer; font-size:12px">📋 Copiar log</button>
                    <button id="errorLogClearBtn"
                        style="background:#5a1d1d; border:none; border-radius:6px; padding:5px 10px; color:#f87171; cursor:pointer; font-size:12px">🗑️ Limpiar</button>
                    <button id="errorLogCloseBtn"
                        style="background:#3c3c3c; border:none; border-radius:6px; padding:5px 10px; color:#9ca3af; cursor:pointer; font-size:12px">✕ Cerrar</button>
                </div>
            </div>
            <div id="errorLogLista" style="overflow-y:auto; flex:1; padding:12px"></div>
        </div>`;
    document.body.appendChild(modal);

    // Eventos del modal
    modal.querySelector('#errorLogCloseBtn').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.querySelector('#errorLogCopyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(window._errorLog, null, 2))
            .then(() => manekiToastExport('📋 Log copiado al portapapeles', 'ok'))
            .catch(() => manekiToastExport('❌ No se pudo copiar', 'err'));
    });
    modal.querySelector('#errorLogClearBtn').addEventListener('click', () => {
        window._errorLog = [];
        _renderErrorLog();
        manekiToastExport('🗑️ Log limpiado', 'info');
    });
    // Cerrar al clic en fondo
    modal.addEventListener('mousedown', function(e) {
        if (e.target === modal) modal.style.display = 'none';
    });
}

function _renderErrorLog() {
    const lista = document.getElementById('errorLogLista');
    const countEl = document.getElementById('errorLogCount');
    if (!lista) return;
    const log = window._errorLog || [];
    if (countEl) {
        countEl.textContent = log.length;
        countEl.style.display = log.length ? 'inline' : 'none';
    }
    if (!log.length) {
        lista.innerHTML = '<div style="padding:40px; text-align:center; color:#6b7280; font-size:14px">✅ No hay errores registrados</div>';
        return;
    }
    lista.innerHTML = log.map((entry, i) => {
        const ts = entry.ts ? entry.ts.replace('T', ' ').split('.')[0] : '—';
        const tipoBadge = entry.tipo === 'error'
            ? '<span style="background:#ef4444; color:white; border-radius:4px; padding:1px 6px; font-size:10px">ERROR</span>'
            : '<span style="background:#f59e0b; color:white; border-radius:4px; padding:1px 6px; font-size:10px">PROMISE</span>';
        const srcInfo = entry.src ? `${entry.src}:${entry.line||'?'}` : '';
        const stackHtml = entry.stack
            ? `<pre style="margin:6px 0 0; padding:8px; background:#111; border-radius:4px; font-size:10px; color:#9ca3af; overflow-x:auto; white-space:pre-wrap; word-break:break-all">${_esc(entry.stack)}</pre>`
            : '';
        return `<div style="margin-bottom:10px; padding:10px 12px; background:#252526; border-radius:8px; border-left:3px solid ${entry.tipo==='error'?'#ef4444':'#f59e0b'}">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap">
                <span style="color:#6b7280; font-size:10px">${_esc(ts)}</span>
                ${tipoBadge}
                ${srcInfo ? `<span style="color:#4ec9b0; font-size:10px">${_esc(srcInfo)}</span>` : ''}
            </div>
            <div style="color:#ce9178; font-size:12px; word-break:break-word">${_esc(String(entry.msg||''))}</div>
            ${stackHtml}
        </div>`;
    }).join('');
}

function _abrirErrorLog() {
    const modal = document.getElementById('errorLogModal');
    if (!modal) { initErrorLog(); }
    const m = document.getElementById('errorLogModal');
    if (!m) return;
    m.style.display = 'flex';
    _renderErrorLog();
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Inicializar todas las mejoras al cargar el DOM ────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

(function _initMejoras() {
    function _run() {
        initBusquedaGlobal();
        initErrorLog();
        initResponsive();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _run);
    } else {
        _run();
    }
})();

// ── FM-06: confirmarResetTotal — movido de script inline en index.html ────
function confirmarResetTotal() {
    showConfirm(
        '⚠️ Esta acción eliminará TODOS los datos: productos, pedidos, clientes y ventas. No se puede deshacer.\n\n¿Estás completamente seguro?',
        '🗑️ Borrar todos los datos'
    ).then(function(ok) {
        if (!ok) return;
        showConfirm(
            '🚨 ÚLTIMA CONFIRMACIÓN: Se borrarán absolutamente todos los datos. ¿Confirmas?',
            '⛔ Confirmación final'
        ).then(function(ok2) {
            if (!ok2) return;
            clearAllData();
        });
    });
}

// ══════════════════════════════════════════
// FIX-8: Bottom nav activo según sección
// ══════════════════════════════════════════

function _actualizarBottomNavActivo(seccion) {
    const mapSection = { dashboard: 0, pedidos: 1, inventory: 2, balance: 3 };
    document.querySelectorAll('#mobileBottomNav button').forEach((btn, i) => {
        btn.style.color = i === mapSection[seccion] ? '#C9933A' : '#6b7280';
    });
}
window._actualizarBottomNavActivo = _actualizarBottomNavActivo;

// ══════════════════════════════════════════
// SISTEMA RESPONSIVE — Detección de dispositivo
// ══════════════════════════════════════════

window._dispositivoActual = 'desktop'; // 'desktop' | 'tablet' | 'mobile'

function detectarDispositivo() {
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains('sidebar-open');
    if (isOpen) { closeSidebar(); } else { openSidebar(); }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('sidebar-open');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

// Exponer globalmente
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;

function _aplicarModoDispositivo() {
    const dispositivo = detectarDispositivo();
    const anterior = window._dispositivoActual;
    window._dispositivoActual = dispositivo;

    document.body.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
    document.body.classList.add('device-' + dispositivo);

    // En mobile: activar compact mode automáticamente solo si no hay preferencia explícita
    if (dispositivo === 'mobile') {
        const pref = localStorage.getItem('maneki_compactMode');
        if (pref === null) {
            // null = nunca se ha guardado = aplicar default sin fijar en localStorage
            document.body.classList.add('compact-mode');
        } else if (pref === '1') {
            document.body.classList.add('compact-mode');
        }
        // Si pref === '0': el usuario lo desactivó explícitamente, respetar
    } else if (anterior === 'mobile' && dispositivo !== 'mobile') {
        // Al pasar de mobile a desktop: respetar preferencia guardada
        const pref = localStorage.getItem('maneki_compactMode');
        if (!pref) document.body.classList.remove('compact-mode');
    }

    // En desktop: siempre cerrar sidebar overlay
    if (dispositivo === 'desktop') {
        closeSidebar();
    }

    // Actualizar topbar mobile: agregar padding-top al main cuando topbar visible
    const mainEls = document.querySelectorAll('.ml-64, main, #mainContent, .main-content');
    mainEls.forEach(el => {
        el.style.paddingTop = dispositivo !== 'desktop' ? '56px' : '';
    });

    // Cerrar sidebar si cambió a desktop mientras estaba abierto
    if (dispositivo === 'desktop') {
        document.body.style.overflow = '';
    }
}

function initResponsive() {
    // Aplicar modo inicial
    _aplicarModoDispositivo();

    // Listener de resize con debounce
    let _resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(_aplicarModoDispositivo, 150);
    });

    // Cerrar sidebar al navegar en mobile (parchear showSection)
    const _origShowSection = window.showSection;
    if (typeof _origShowSection === 'function') {
        window.showSection = function(...args) {
            if (window._dispositivoActual !== 'desktop') closeSidebar();
            const result = _origShowSection.apply(this, args);
            // FIX-8: actualizar bottom nav según sección activa
            if (args[0] && typeof _actualizarBottomNavActivo === 'function') {
                _actualizarBottomNavActivo(args[0]);
            }
            return result;
        };
    }

    // Swipe derecha para abrir sidebar (touch)
    let _touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        _touchStartX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - _touchStartX;
        // Abrir sidebar: swipe desde borde izquierdo
        if (_touchStartX < 30 && dx > 60) { openSidebar(); return; }
        // Cerrar sidebar con swipe-left: verificar que no sea en el Kanban
        if (dx < -60) {
            const enKanban = e.target.closest('#vistaKanban, .kanban-board, [class*="kanban"]');
            if (!enKanban) closeSidebar();
        }
    }, { passive: true });

    // Actualizar bottom nav según sección activa
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#mobileBottomNav button');
        if (!btn) return;
        document.querySelectorAll('#mobileBottomNav button').forEach(b => {
            b.style.color = '#6b7280';
        });
        btn.style.color = '#C9933A';
    });
}

// ══════════════════════════════════════════════════════════════
// #10 — UNDO TOAST: toast con botón "Deshacer" para operaciones destructivas
// ══════════════════════════════════════════════════════════════
function manekiUndoToast(msg, undoFn, duracion) {
    duracion = duracion || 6000;
    let container = document.getElementById('mk-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mk-toast-container';
        container.className = 'mk-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'mk-toast warn';
    toast.style.cursor = 'default';
    const _id = 'undo_' + Date.now();
    toast.innerHTML = `
        <div class="mk-toast-icon">↩</div>
        <div class="mk-toast-body" style="flex:1">
            <div class="mk-toast-msg">${msg}</div>
        </div>
        <button id="${_id}" style="background:#C5973B;color:white;border:none;border-radius:8px;padding:6px 16px;font-weight:700;font-size:.82rem;cursor:pointer;white-space:nowrap;">Deshacer</button>
        <div class="mk-toast-progress" style="animation-duration:${duracion}ms"></div>`;
    container.appendChild(toast);
    let _undone = false;
    toast.querySelector('#'+_id).addEventListener('click', (e) => {
        e.stopPropagation();
        if (_undone) return;
        _undone = true;
        if (typeof undoFn === 'function') undoFn();
        dismissToast(toast);
        manekiToastExport('✅ Acción revertida', 'ok');
    });
    const timer = setTimeout(() => { if (!_undone) dismissToast(toast); }, duracion);
    toast._timer = timer;
}
window.manekiUndoToast = manekiUndoToast;

// ══════════════════════════════════════════════════════════════
// #9 — LOADING SKELETON: muestra estado de carga al iniciar la app
// ══════════════════════════════════════════════════════════════
(function _loadingSkeleton() {
    const style = document.createElement('style');
    style.textContent = `
@keyframes mkShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.mk-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:800px 100%;animation:mkShimmer 1.5s infinite;border-radius:8px;min-height:20px}
#mk-loading-overlay{position:fixed;inset:0;background:rgba(250,248,245,0.97);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;transition:opacity .4s}
#mk-loading-overlay.fade-out{opacity:0;pointer-events:none}
.mk-loading-spinner{width:44px;height:44px;border:3.5px solid #e5e7eb;border-top-color:#C5973B;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'mk-loading-overlay';
    overlay.innerHTML = `
        <img src="logo.png" alt="" style="height:64px;object-fit:contain;opacity:.85" onerror="this.style.display='none'">
        <div class="mk-loading-spinner"></div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#9ca3af;font-weight:500" id="mk-loading-text">Cargando Maneki Store...</p>`;
    if (document.body) document.body.appendChild(overlay);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));

    // Quitar cuando los datos estén listos (o máximo 5 segundos)
    function _dismiss() {
        const el = document.getElementById('mk-loading-overlay');
        if (!el) return;
        el.classList.add('fade-out');
        setTimeout(() => el.remove(), 500);
    }
    // Escuchar señal de datos cargados
    const _check = setInterval(() => {
        if (window._dbReady !== undefined && (window.products || []).length >= 0 && typeof window.updateDashboard === 'function') {
            clearInterval(_check);
            _dismiss();
        }
    }, 200);
    // Fallback: máximo 5 segundos
    setTimeout(() => { clearInterval(_check); _dismiss(); }, 5000);
})();

// ══════════════════════════════════════════════════════════════
// #15 — OFFLINE BANNER: indicador claro de modo sin conexión
// ══════════════════════════════════════════════════════════════
(function _offlineBanner() {
    const style = document.createElement('style');
    style.textContent = `
#mk-offline-banner{position:fixed;top:0;left:0;right:0;z-index:10001;background:linear-gradient(135deg,#dc2626,#b91c1c);color:white;text-align:center;padding:8px 16px;font-size:.82rem;font-weight:600;transform:translateY(-100%);transition:transform .3s ease;display:flex;align-items:center;justify-content:center;gap:8px}
#mk-offline-banner.visible{transform:translateY(0)}
#mk-offline-banner .pulse{width:8px;height:8px;background:#fca5a5;border-radius:50%;animation:offPulse 1.5s infinite}
@keyframes offPulse{0%,100%{opacity:1}50%{opacity:.3}}`;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'mk-offline-banner';
    banner.innerHTML = '<span class="pulse"></span> Sin conexión a internet — los cambios se guardan localmente y se sincronizarán al reconectarse';
    if (document.body) document.body.appendChild(banner);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(banner));

    function _update() {
        const el = document.getElementById('mk-offline-banner');
        if (!el) return;
        if (!navigator.onLine) el.classList.add('visible');
        else el.classList.remove('visible');
    }
    window.addEventListener('online', () => {
        _update();
        manekiToastExport('🌐 Conexión restaurada — sincronizando...', 'ok');
        // Intentar sincronizar pendientes
        if (typeof sincronizarPendientes === 'function') setTimeout(sincronizarPendientes, 500);
    });
    window.addEventListener('offline', _update);
    _update();
})();

// C19: Focus-trap para accesibilidad en modales
(window as any)._mkTrapFocus = function(modal: HTMLElement) {
    const focusables = Array.from(modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();
    function handler(e: KeyboardEvent) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }
    (modal as any)._focusTrapHandler = handler;
    modal.addEventListener('keydown', handler);
};
(window as any)._mkReleaseFocus = function(modal: HTMLElement) {
    if ((modal as any)._focusTrapHandler) {
        modal.removeEventListener('keydown', (modal as any)._focusTrapHandler);
        delete (modal as any)._focusTrapHandler;
    }
};

// H51: Indicador global persistente de guardado/sincronización
(window as any).mkSaveIndicator = function(state: 'saving' | 'saved' | 'error') {
    let el = document.getElementById('mkSaveIndicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mkSaveIndicator';
        el.style.cssText = 'position:fixed;bottom:56px;right:16px;font-size:11px;padding:4px 10px;border-radius:20px;transition:opacity 0.4s;z-index:8888;pointer-events:none;opacity:0;white-space:nowrap;';
        document.body.appendChild(el);
    }
    if (state === 'saving') {
        el.textContent = '⟳ Guardando...';
        el.style.background = '#fef9c3'; el.style.color = '#854d0e'; el.style.border = '1px solid #fde047';
        el.style.opacity = '1';
    } else if (state === 'saved') {
        el.textContent = '✓ Guardado';
        el.style.background = '#f0fdf4'; el.style.color = '#166534'; el.style.border = '1px solid #bbf7d0';
        el.style.opacity = '1';
        setTimeout(() => { if (el) el.style.opacity = '0'; }, 2000);
    } else if (state === 'error') {
        el.textContent = '✗ Error al guardar';
        el.style.background = '#fef2f2'; el.style.color = '#991b1b'; el.style.border = '1px solid #fecaca';
        el.style.opacity = '1';
        setTimeout(() => { if (el) el.style.opacity = '0'; }, 4000);
    }
};