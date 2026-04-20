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
    // Ctrl+Shift+L — abrir log de errores
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        if (typeof _abrirErrorLog === 'function') _abrirErrorLog();
        return;
    }

    // Ctrl+K / Cmd+K — global search overlay
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Intentar abrir overlay modal primero, fallback al input inline
        const overlay = document.getElementById('busquedaGlobalOverlay');
        if (overlay) {
            _abrirBusquedaOverlay();
        } else {
            const searchInput = document.getElementById('globalSearchInput');
            if (searchInput) { searchInput.focus(); searchInput.select(); }
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
});

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
    contenedor.querySelectorAll('.busq-resultado').forEach(r => r.style.background = '');
    el.style.background = '#f0f9ff';
    el._resaltado = true;
}

function _navResultados(direccion) {
    const contenedor = document.getElementById('busquedaGlobalResultados');
    if (!contenedor) return;
    const items = Array.from(contenedor.querySelectorAll('.busq-resultado'));
    if (!items.length) return;
    const actual = items.findIndex(i => i.style.background === 'rgb(240, 249, 255)' || i._resaltado);
    items.forEach(i => { i.style.background = ''; i._resaltado = false; });
    let siguiente = actual + direccion;
    if (siguiente < 0) siguiente = items.length - 1;
    if (siguiente >= items.length) siguiente = 0;
    items[siguiente].style.background = '#f0f9ff';
    items[siguiente]._resaltado = true;
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
            const resaltado = contenedor && contenedor.querySelector('.busq-resultado[style*="rgb(240, 249, 255)"]');
            if (resaltado) _seleccionarResultadoBusqueda(resaltado);
            return;
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ── MEJORA 2: MODO COMPACTO ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function initModoCompacto() {
    // Inyectar estilos CSS del modo compacto
    if (!document.getElementById('maneki-compact-styles')) {
        const style = document.createElement('style');
        style.id = 'maneki-compact-styles';
        style.textContent = `
            body.compact-mode table td,
            body.compact-mode table th { padding: 4px 8px !important; font-size: 12px !important; }
            body.compact-mode .card { padding: 8px !important; }
            body.compact-mode .kanban-card { padding: 6px 8px !important; }
            body.compact-mode .stat-card { padding: 8px !important; }
            body.compact-mode h2 { font-size: 1rem !important; }
            body.compact-mode .text-sm { font-size: 11px !important; }
        `;
        document.head.appendChild(style);
    }

    // Crear botón si no existe
    if (document.getElementById('compactModeBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'compactModeBtn';
    btn.title = 'Modo compacto';
    btn.style.cssText = 'background:none; border:1px solid #d1d5db; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:16px; color:#6b7280; display:flex; align-items:center; gap:4px; line-height:1';

    const compactoActivo = localStorage.getItem('maneki_compactMode') === '1';
    if (compactoActivo) {
        document.body.classList.add('compact-mode');
        btn.textContent = '⊡';
        btn.title = 'Modo compacto activo — clic para desactivar';
    } else {
        btn.textContent = '⊟';
        btn.title = 'Activar modo compacto';
    }

    btn.addEventListener('click', function() {
        const activo = document.body.classList.toggle('compact-mode');
        btn.textContent = activo ? '⊡' : '⊟';
        btn.title = activo ? 'Modo compacto activo — clic para desactivar' : 'Activar modo compacto';
        localStorage.setItem('maneki_compactMode', activo ? '1' : '0');
        manekiToastExport(activo ? '⊡ Modo compacto activado' : '⊟ Modo normal', 'info');
    });

    // Inyectar en la barra de navegación
    const destino = document.querySelector('nav') ||
                    document.getElementById('topbar') ||
                    document.querySelector('[id*="topbar"]') ||
                    document.querySelector('header') ||
                    document.querySelector('.navbar') ||
                    document.querySelector('.topnav');

    if (destino) {
        // Intentar poner al final de la nav
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex; align-items:center; margin-left:auto; padding:0 8px';
        wrapper.appendChild(btn);
        destino.appendChild(wrapper);
    } else {
        // Fallback: esquina superior derecha fija
        btn.style.cssText += '; position:fixed; top:8px; right:8px; z-index:8888; background:white; box-shadow:0 1px 4px rgba(0,0,0,0.15)';
        document.body.appendChild(btn);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ── MEJORA 3: LOG DE ERRORES (Ctrl+Shift+L) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function initErrorLog() {
    // Captura de errores globales
    window._errorLog = window._errorLog || [];

    window.onerror = function(msg, src, line, col, err) {
        window._errorLog.unshift({
            ts: new Date().toISOString(),
            tipo: 'error',
            msg: String(msg),
            src: src,
            line: line,
            stack: err && err.stack ? err.stack : null
        });
        if (window._errorLog.length > 50) window._errorLog.pop();
    };

    window.addEventListener('unhandledrejection', function(e) {
        window._errorLog.unshift({
            ts: new Date().toISOString(),
            tipo: 'promise',
            msg: String(e.reason),
            stack: e.reason && e.reason.stack ? e.reason.stack : null
        });
        if (window._errorLog.length > 50) window._errorLog.pop();
    });

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
        initModoCompacto();
        initErrorLog();
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