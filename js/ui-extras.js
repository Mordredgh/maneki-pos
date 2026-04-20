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
            ]);

            ['renderInventoryTable','renderClientsTable','renderSalesHistory',
             'renderPedidosTable','renderQuotesTable',
             'updateDashboard','renderProducts','renderBalance'].forEach(fn => {
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
        manekiToastExport('⚠️ Error: SheetJS no cargó. Verifica tu conexión a internet.', 'err');
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
                num(p.anticipo), num(p.resta), p.status||'', p.notas||''
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
// Helper: fecha local YYYY-MM-DD (evita bug UTC donde toISOString() puede dar el día siguiente)
function _fechaLocal(d) {
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
function _totalVentasDia(dStr) {
    const sh = window.salesHistory || salesHistory || [];

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

    return total;
}

function renderSparkline() {
    const canvas = document.getElementById('sparklineGanancia');
    if (!canvas) return;
    const now = new Date();
    const datos = [], labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dStr = _fechaLocal(d);
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
            total += _totalVentasDia(_fechaLocal(d));
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

function animarNumero(el, inicio, fin, duracion, prefijo, sufijo) {
    if (!el) return;
    // Cancelar animación previa (animarNumero)
    if (el._animFrame) { cancelAnimationFrame(el._animFrame); el._animFrame = null; }
    el.innerHTML = '';
    // Escribir valor final inmediatamente si no hay duración
    if (!duracion || inicio === fin) {
        el.textContent = prefijo + (Number.isInteger(fin) ? Math.round(fin) : fin.toFixed(2)) + sufijo;
        return;
    }
    const range = fin - inicio;
    const startTime = performance.now();
    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duracion, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const valor = inicio + range * eased;
        el.textContent = prefijo + (Number.isInteger(fin) ? Math.round(valor) : valor.toFixed(2)) + sufijo;
        if (progress < 1) {
            el._animFrame = requestAnimationFrame(step);
        } else {
            el._animFrame = null;
            // Garantizar valor final exacto
            el.textContent = prefijo + (Number.isInteger(fin) ? Math.round(fin) : fin.toFixed(2)) + sufijo;
        }
    }
    el._animFrame = requestAnimationFrame(step);
}

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
        document.body.appendChild(container);
    }

    const icons = { ok: '✓', warn: '!', err: '✕', info: 'i' };
    const titles = { ok: 'Completado', warn: 'Aviso', err: 'Error', info: 'Info' };
    const t = tipo || 'ok';
    const icon = icons[t] || icons.ok;
    const title = titles[t] || titles.ok;

    const toast = document.createElement('div');
    toast.className = `mk-toast ${t}`;
    toast.innerHTML = `
        <div class="mk-toast-icon">${icon}</div>
        <div class="mk-toast-body">
            <div class="mk-toast-title">${title}</div>
            <div class="mk-toast-msg">${msg}</div>
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
        ? `<img src="${p.imageUrl}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" onerror="this.style.display='none'">`
        : `<span class="text-lg flex-shrink-0">${p.image||'📦'}</span>`;
      html += `<div class="px-4 py-2 hover:bg-amber-50 cursor-pointer flex items-center gap-3"
          data-id="${p.id.replace(/"/g,'')}"
          onmousedown="cerrarBusquedaGlobal(); showSection('inventory'); setTimeout(()=>{ if(typeof editProduct==='function') editProduct(this.dataset.id); },300);">
        ${img}
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate">${p.name}</div>
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
          <div class="font-medium text-gray-800">${c.name}</div>
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

    // ── AJUSTAR STOCK MODAL ──────────────────────────────────────
    function closeAjustarStockModal() {
      closeModal('ajustarStockModal');
      window._ajustarStockId = null;
      const modal = document.getElementById('ajustarStockModal');
      if (modal) delete modal.dataset.productId;
    }
    function confirmarAjusteStock() {
      // Leer id desde el modal (data attribute) o window — soporta ambas versiones
      const modal = document.getElementById('ajustarStockModal');
      const rawId = (modal && modal.dataset.productId) || window._ajustarStockId;
      if (!rawId) {
        manekiToastExport('❌ Error: no se encontró el producto', 'error');
        return;
      }
      const allProducts = window.products || products || [];
      const p = allProducts.find(x => String(x.id) === String(rawId));
      if (!p) {
        manekiToastExport('❌ Error: producto no encontrado', 'error');
        return;
      }
      const cantEl = document.getElementById('ajustarStockCantidad');
      const num = parseInt(cantEl ? cantEl.value : '');
      if (isNaN(num) || cantEl.value.trim() === '') {
        manekiToastExport('⚠️ Ingresa una cantidad válida (+para agregar / -para restar)', 'warn');
        if (cantEl) cantEl.focus();
        return;
      }
      if (num === 0) {
        manekiToastExport('⚠️ La cantidad no puede ser 0', 'warn');
        return;
      }
      const stockActual = (p.variants && p.variants.length > 0)
        ? p.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0)
        : (parseInt(p.stock) || 0);
      const nuevoStock = Math.max(0, stockActual + num);
      const motivo = document.getElementById('ajustarStockMotivo').value.trim() || 'Ajuste manual';
      p.stock = nuevoStock;
      // Si tiene variantes, ajustar la primera disponible
      if (p.variants && p.variants.length > 0 && num !== 0) {
        if (num > 0) {
          p.variants[0].qty = (p.variants[0].qty || 0) + num;
        } else {
          let restante = Math.abs(num);
          for (const v of p.variants) {
            const quitar = Math.min(v.qty || 0, restante);
            v.qty = (v.qty || 0) - quitar;
            restante -= quitar;
            if (restante <= 0) break;
          }
        }
        p.stock = p.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
      }
      // Registrar movimiento (compatible con ambas firmas)
      if (typeof registrarMovimiento === 'function') {
        try {
          // Firma nueva: ({productoId, productoNombre, tipo, cantidad, motivo, stockAntes, stockDespues})
          registrarMovimiento({
            productoId: p.id, productoNombre: p.name,
            tipo: num > 0 ? 'entrada' : 'salida',
            cantidad: num, motivo,
            stockAntes: stockActual, stockDespues: p.stock
          });
        } catch(e) {
          // Firma vieja: (id, name, tipo, cantidad, motivo)
          try { registrarMovimiento(p.id, p.name, num > 0 ? 'entrada' : 'salida', Math.abs(num), motivo); } catch(e2) {}
        }
      }
      if (typeof saveProducts  === 'function') saveProducts();
      if (typeof renderInventoryTable === 'function') renderInventoryTable();
      if (typeof renderProducts === 'function') renderProducts();
      if (typeof updateDashboard === 'function') updateDashboard();
      closeAjustarStockModal();
      manekiToastExport(`✅ Stock de "${p.name}": ${stockActual} → ${p.stock}`, 'ok');
    }
    window.closeAjustarStockModal = closeAjustarStockModal;
    window.confirmarAjusteStock = confirmarAjusteStock;

// ── Ctrl+K / Cmd+K — enfocar buscador global ──────────────────────────────
// ── NTH-19: N = nuevo, Esc = cerrar modal, R = recargar dashboard ─────────
document.addEventListener('keydown', function(e) {
    // Ctrl+K / Cmd+K — global search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) { searchInput.focus(); searchInput.select(); }
        return;
    }

    // Skip if typing in an input/textarea/select/contenteditable
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
    // Skip if a modal is open (except Esc which should close it)
    const anyModal = document.querySelector('.modal-overlay[style*="flex"], .modal-overlay.active, [id$="Modal"][style*="flex"]');

    // Esc — cerrar el modal visible más reciente
    if (e.key === 'Escape') {
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
});

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