// ============== BALANCE MODULE ==============

// FIX 1 — _fechaLocal() removed: use global _fechaHoy() (config.js) directly
// (having a local _fechaLocal() here caused a collision with ui-extras.ts's
//  _fechaLocal(d) that accepts a Date argument — after balance.ts loaded, the
//  no-arg version overwrote the global, making sparkline and comparativa semanal
//  always return today's date instead of a historical one.)

// FIX 5 — CxC unificada: calcula saldo pendiente de un pedido usando pagos[] como fuente de verdad
const calcSaldoPendiente = (p) => {
    const sumPagos = (p.pagos || []).reduce((s, ab) => s + Number(ab.monto || 0), 0);
    const totalPagado = sumPagos > 0 ? sumPagos : Number(p.anticipo || 0);
    return Math.max(0, Number(p.total || 0) - totalPagado);
};
window.calcSaldoPendiente = calcSaldoPendiente;

// M1: Normalización de acentos para búsquedas en balance
function _norm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const _escBal = window._esc;

// MEJORA-3: Etiquetas de movimientos — definidas temprano para uso en renders
const _ETIQUETAS = [
    { valor: 'produccion',  label: 'Producción',  color: '#7c3aed', bg: '#ede9fe' },
    { valor: 'marketing',   label: 'Marketing',   color: '#db2777', bg: '#fce7f3' },
    { valor: 'envios',      label: 'Envíos',      color: '#0284c7', bg: '#e0f2fe' },
    { valor: 'servicios',   label: 'Servicios',   color: '#0f766e', bg: '#ccfbf1' },
    { valor: 'materiales',  label: 'Materiales',  color: '#b45309', bg: '#fef3c7' },
    { valor: 'ventas',      label: 'Ventas',      color: '#16a34a', bg: '#dcfce7' },
    { valor: 'nomina',      label: 'Nómina',      color: '#dc2626', bg: '#fee2e2' },
    { valor: 'otro',        label: 'Otro',        color: '#6b7280', bg: '#f3f4f6' },
];
window._ETIQUETAS = _ETIQUETAS;

let _balanceMesOffset = 0;

function cambiarMesBalance(dir) {
    _balanceMesOffset += dir;
    renderBalanceMensual();
}

function renderBalanceMensual() {
    const now = new Date();
    now.setMonth(now.getMonth() + _balanceMesOffset);
    const year = now.getFullYear();
    const month = now.getMonth();
    const mesStr = `${year}-${String(month+1).padStart(2,'0')}`;
    const label = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

    const labelEl = document.getElementById('balanceMesLabel');
    if (labelEl) labelEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);

    // Ventas directas del mes (excluir pedidos, abonos y anticipos para no duplicar)
    const ventasMes = (window.salesHistory||[]).filter(s =>
        s.date && s.date.startsWith(mesStr) &&
        s.method !== 'Cancelado' &&
        s.type !== 'pedido' &&   // pedidos se cuentan por separado abajo
        s.type !== 'abono'  &&   // BUG-S07 FIX: abonos ya están en ingresos o en pedido.total
        s.type !== 'anticipo'    // BUG-S07 FIX: anticipos sintéticos no son ventas directas
    );
    // BUG-BAL-01 FIX: calcular como números puros; _money solo en display
    const totalVentas = ventasMes.reduce((s, v) => s + (Number(v.total) || 0), 0);

    // Pedidos finalizados del mes (total cobrado real, no solo anticipo)
    const pedidosFinMes = (window.pedidosFinalizados||[])
        .filter(p => ((p.fechaFinalizado||p.fecha||'')).startsWith(mesStr));
    // BUG-BAL-01 FIX: calcular como números puros; _money solo en display
    const totalPedidos = pedidosFinMes.reduce((s, p) => s + (Number(p.total) || 0), 0);
    const numPedidos = pedidosFinMes.length;

    // Gastos del mes (excluir los que vinieron de cuentas por pagar ya pagadas — se contaron en totalPayables en su momento)
    const gastosMes = (window.expenses||[]).filter(e => e.date && e.date.startsWith(mesStr) && !e.fromPayable);
    // BUG-BAL-01 FIX: calcular como números puros; _money solo en display
    const totalGastos = gastosMes.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    // Neto
    const neto = totalVentas + totalPedidos - totalGastos;

    const el = id => document.getElementById(id);
    if (el('balMesVentas')) el('balMesVentas').textContent = '$' + totalVentas.toFixed(2);
    if (el('balMesVentasN')) el('balMesVentasN').textContent = ventasMes.length + ' ventas';
    if (el('balMesPedidos')) el('balMesPedidos').textContent = '$' + totalPedidos.toFixed(2);
    if (el('balMesPedidosN')) el('balMesPedidosN').textContent = numPedidos + ' pedidos';
    if (el('balMesGastos')) el('balMesGastos').textContent = '$' + totalGastos.toFixed(2);
    if (el('balMesGastosN')) el('balMesGastosN').textContent = gastosMes.length + ' gastos';
    if (el('balMesNeto')) el('balMesNeto').textContent = '$' + neto.toFixed(2);
    const _bgHero = el('balMesNetoBg');
    if (_bgHero) {
        _bgHero.style.background = neto >= 0 ? '#f0fdf4' : '#fef2f2';
        _bgHero.style.borderColor = neto >= 0 ? '#bbf7d0' : '#fecaca';
    }
    const _netoColor = neto >= 0 ? '#166534' : '#dc2626';
    const _labelColor = neto >= 0 ? '#15803d' : '#dc2626';
    const _subColor = neto >= 0 ? '#16a34a' : '#ef4444';
    if (el('balMesNetoLabel')) { el('balMesNetoLabel').textContent = 'Neto del mes'; el('balMesNetoLabel').style.color = _labelColor; }
    if (el('balMesNeto')) el('balMesNeto').style.color = _netoColor;
    if (el('balMesNetoSub')) { el('balMesNetoSub').textContent = neto >= 0 ? 'Mes positivo' : 'Mes negativo'; el('balMesNetoSub').style.color = _subColor; }

    // FEATURE-2: Anticipos de pedidos activos cobrados en el mes
    _renderAnticiposPedidosActivos(mesStr);

    // NTH-13: Gráfica de categorías de gastos
    _renderGraficaCategorias(gastosMes, mesStr);
    // NTH-14: Botón exportar balance (CSV mejorado)
    _renderExportarBalanceBtn(mesStr);
    // MEJORA-4: Utilidad neta prominente
    _renderUtilidadNeta(totalVentas + totalPedidos, totalGastos);
    // MEJORA-1: Proyección de cashflow
    renderProyeccionCashflow();

    // N-UI-1: Empty state cuando no hay ingresos NI gastos en el mes
    const _noDataThisMonth = ventasMes.length === 0 && numPedidos === 0 && gastosMes.length === 0;
    let _balEmptyCard = document.getElementById('balEmptyMesCard');
    if (_noDataThisMonth) {
        if (!_balEmptyCard) {
            _balEmptyCard = document.createElement('div');
            _balEmptyCard.id = 'balEmptyMesCard';
            const _anchor = document.getElementById('balMesNetoBg');
            if (_anchor) _anchor.parentElement.insertBefore(_balEmptyCard, _anchor.nextSibling);
        }
        _balEmptyCard.innerHTML = `
            <div class="text-center py-12 text-gray-400" style="background:#fff;border-radius:16px;border:1.5px dashed #e5e7eb;margin-bottom:16px;">
                <div style="font-size:2.5rem;margin-bottom:10px;">📊</div>
                <p style="font-size:.95rem;font-weight:600;color:#6b7280;margin-bottom:4px;">Sin registros este mes</p>
                <p style="font-size:.8rem;color:#9ca3af;">Registra tu primer ingreso o gasto</p>
            </div>`;
        _balEmptyCard.style.display = '';
    } else if (_balEmptyCard) {
        _balEmptyCard.style.display = 'none';
    }

    // N-VIZ-002: Donut chart de gastos por categoría
    renderBalancePieChart();
}

// FEATURE-2: Anticipos cobrados en el mes de pedidos activos ──────────────
function _renderAnticiposPedidosActivos(mesStr: string) {
    let card = document.getElementById('balAnticiposActivosCard');
    if (!card) {
        const anchor = document.getElementById('balMesNetoBg');
        if (!anchor) return;
        card = document.createElement('div');
        card.id = 'balAnticiposActivosCard';
        anchor.parentElement.insertBefore(card, anchor.nextSibling);
    }
    const pedidosActivos = (window.pedidos || []).filter(p =>
        !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase())
    );
    let totalAnticipos = 0;
    pedidosActivos.forEach(p => {
        (p.pagos || []).forEach(pg => {
            if ((pg.fecha || pg.date || '').startsWith(mesStr)) {
                totalAnticipos += Number(pg.monto || pg.amount || 0);
            }
        });
        // Compatibilidad legacy: anticipo sin pagos[]
        if ((!p.pagos || p.pagos.length === 0) && p.anticipo && (p.fechaPedido || '').startsWith(mesStr)) {
            totalAnticipos += Number(p.anticipo || 0);
        }
    });
    if (totalAnticipos <= 0) { card.innerHTML = ''; card.style.display = 'none'; return; }
    card.style.display = '';
    card.className = 'bg-amber-50 rounded-xl p-3 border border-amber-200 mb-4';
    card.innerHTML = `<p class="text-xs text-amber-700 font-semibold">
        💰 Anticipos en pedidos activos: <span class="font-extrabold">$${totalAnticipos.toFixed(2)}</span>
        <span class="font-normal text-amber-600 ml-1">(no incluidos en ingresos del mes)</span>
    </p>`;
}

// NTH-13: Gráfica de categorías de gastos ─────────────────────────────────
const _GASTO_CATEGORIAS = ['Materiales', 'Envío', 'Publicidad', 'Renta', 'Servicios', 'Personal', 'Otros'];

function _renderGraficaCategorias(gastosMes, mesStr) {
    let container = document.getElementById('balCatGastosContainer');
    if (!container) {
        const anchor = document.getElementById('balMesNetoBg');
        if (!anchor) return;
        container = document.createElement('div');
        container.id = 'balCatGastosContainer';
        container.className = 'bg-white rounded-xl p-4 border border-gray-100 mb-4';
        anchor.parentElement.insertBefore(container, anchor.nextSibling);
    }
    if (!gastosMes.length) { container.innerHTML = ''; return; }

    // Agrupar por categoría
    const mapa = {};
    gastosMes.forEach(e => {
        const cat = e.categoria || 'Otros';
        mapa[cat] = (mapa[cat] || 0) + Number(e.amount || 0);
    });
    const total = Object.values(mapa).reduce((s, v) => s + v, 0);
    const sorted = Object.entries(mapa).sort((a, b) => b[1] - a[1]);

    const colores = ['#C5973B','#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6'];
    const barras = sorted.map(([cat, monto], i) => {
        const pct = total > 0 ? (monto / total * 100).toFixed(1) : 0;
        const color = colores[i % colores.length];
        return `<div class="mb-2">
            <div class="flex justify-between text-xs mb-0.5">
                <span class="font-medium text-gray-700">${_escBal(cat)}</span>
                <span class="text-gray-500">$${monto.toFixed(2)} <span style="color:${color}">(${pct}%)</span></span>
            </div>
            <div class="h-2 rounded-full bg-gray-100">
                <div class="h-2 rounded-full transition-all" style="width:${pct}%;background:${color}"></div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-gray-700">📊 Gastos por categoría</h4>
            <span class="text-xs text-gray-400">${gastosMes.length} egresos</span>
        </div>
        ${barras}`;
}

window._GASTO_CATEGORIAS = _GASTO_CATEGORIAS;

// N-VIZ-002: Donut chart de gastos por categoría en balance ──────────────────
function renderBalancePieChart(): void {
    if (typeof (window as any).Chart === 'undefined') return;

    // Determinar mes actual
    const now = new Date();
    const mesActual = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

    // Agrupar gastos por categoría
    const expByCat: Record<string, number> = {};
    ((window as any).expenses || []).forEach((e: any) => {
        if (!e.date?.startsWith(mesActual)) return;
        const cat = e.etiqueta || e.category || e.concepto || 'Otros';
        expByCat[cat] = (expByCat[cat] || 0) + Number(e.amount || 0);
    });

    const labels = Object.keys(expByCat).sort((a, b) => expByCat[b] - expByCat[a]);
    const data = labels.map(k => expByCat[k]);

    if (!labels.length) {
        const container = document.getElementById('balancePieContainer');
        if (container) container.style.display = 'none';
        return;
    }

    // Obtener o crear canvas
    let container = document.getElementById('balancePieContainer');
    if (!container) {
        // Buscar un lugar adecuado en la sección balance para inyectar
        const balanceSection = document.getElementById('balance-section');
        const insertTarget = balanceSection?.querySelector('.mk-card:last-child, [id*="gastos"], [id*="balance"]')
            || balanceSection?.querySelector('.mk-card');
        if (!insertTarget) return;
        container = document.createElement('div');
        container.id = 'balancePieContainer';
        container.className = 'mk-card';
        container.style.cssText = 'padding:20px 22px;margin-top:16px;';
        container.innerHTML = `
            <div class="mk-chart-title" style="color:#7C3AED;">
              <span>🍩 Gastos por categoría — mes actual</span>
            </div>
            <div style="height:220px;position:relative;margin-top:12px;">
              <canvas id="balancePieChart"></canvas>
            </div>`;
        insertTarget.insertAdjacentElement('afterend', container);
    }
    container.style.display = '';

    // Defer Chart.js init al siguiente frame para evitar forced reflow
    // (Chart.js lee getBoundingClientRect del canvas al inicializar)
    requestAnimationFrame(() => {
    const canvas = document.getElementById('balancePieChart') as HTMLCanvasElement;
    if (!canvas) return;

    const colors = ['#8B5CF6','#F59E0B','#10B981','#EF4444','#3B82F6','#F97316','#EC4899','#6366F1','#14B8A6','#A855F7'];

    const existingChart = (window as any)._balancePieChart;
    if (existingChart) {
        existingChart.data.labels = labels;
        existingChart.data.datasets[0].data = data;
        existingChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);
        existingChart.update('none');
    } else {
        (window as any)._balancePieChart = new (window as any).Chart(canvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderColor: '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { font: { size: 11, family: 'Outfit' }, boxWidth: 12, padding: 10 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx: any) => ` ${ctx.label}: $${ctx.parsed.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}`
                        }
                    }
                }
            }
        });
    }
    }); // end requestAnimationFrame
}
(window as any).renderBalancePieChart = renderBalancePieChart;

// MEJORA-5: Botón exportar CSV mejorado ──────────────────────────────────────────
function _renderExportarBalanceBtn(mesStr) {
    let btn = document.getElementById('btnExportarBalance');
    if (!btn) {
        const labelEl = document.getElementById('balanceMesLabel');
        if (!labelEl) return;
        btn = document.createElement('button');
        btn.id = 'btnExportarBalance';
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors';
        btn.innerHTML = '📥 Exportar mes';
        labelEl.parentElement.appendChild(btn);
    }
    btn.onclick = () => exportarBalanceMesCSV(mesStr);
}

function exportarBalanceMesCSV(mesStr) {
    // Reunir movimientos del mes: ingresos + egresos
    const filas = [['Fecha', 'Tipo', 'Concepto', 'Monto', 'Etiqueta', 'Recurrente']];
    const ingMes = (window.incomes||[]).filter(i => (i.date||'').startsWith(mesStr));
    const expMes = (window.expenses||[]).filter(e => (e.date||'').startsWith(mesStr) && !e.fromPayable);
    const todos = [
        ...ingMes.map(i => ({ fecha: i.date||'', tipo: 'ingreso', concepto: i.concept||'', monto: Number(i.amount||0), etiqueta: i.etiqueta||'', recurrente: i.recurrente ? 'sí' : 'no' })),
        ...expMes.map(e => ({ fecha: e.date||'', tipo: 'gasto', concepto: e.concept||'', monto: Number(e.amount||0), etiqueta: e.etiqueta||'', recurrente: (e.recurrente||e.recurrenteAuto) ? 'sí' : 'no' }))
    ].sort((a,b) => a.fecha.localeCompare(b.fecha));
    todos.forEach(r => filas.push([r.fecha, r.tipo, r.concepto, r.monto.toFixed(2), r.etiqueta, r.recurrente]));
    // Generar CSV
    const csv = filas.map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance_${mesStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    manekiToastExport(`✅ CSV balance_${mesStr}.csv descargado`, 'ok');
}
window.exportarBalanceMesCSV = exportarBalanceMesCSV;
function toggleMovimientos() {
    const panel = document.getElementById('movimientosPanel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) _renderMovimientosBalance();
}

function _renderMovimientosBalance() {
    const q = _norm(document.getElementById('movBuscar')?.value || '');
    const lista = document.getElementById('movimientosLista');
    const filtrados = [...(window.stockMovimientos||[])].reverse().filter(m =>
        !q || _norm(m.productoNombre).includes(q) || _norm(m.motivo).includes(q)
    );
    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="text-gray-400 text-center py-8 text-sm">Sin movimientos registrados</p>';
        return;
    }
    const colores = { salida: 'bg-red-50 text-red-600', entrada: 'bg-green-50 text-green-600', ajuste: 'bg-blue-50 text-blue-600' };
    const iconos = { salida: '↓', entrada: '↑', ajuste: '⇄' };
    lista.innerHTML = filtrados.map(m => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${colores[m.tipo] || 'bg-gray-100 text-gray-600'}">${iconos[m.tipo] || '?'}</span>
                <div>
                    <p class="font-semibold text-gray-800 text-sm">${_escBal(m.productoNombre)}</p>
                    <p class="text-xs text-gray-400">${_escBal(m.motivo)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-sm ${m.tipo === 'salida' ? 'text-red-600' : 'text-green-600'}">${m.tipo === 'salida' ? '-' : '+'}${m.cantidad}</p>
                <p class="text-xs text-gray-400">${_escBal(m.fecha)} ${_escBal(m.hora)}</p>
            </div>
        </div>
    `).join('');
}

function limpiarMovimientos() {
    showConfirm('Se borrará todo el historial de movimientos de stock. Esta acción no se puede deshacer.', '⚠️ Limpiar historial').then(ok => {
        if (!ok) return;
        window.stockMovimientos = [];
        window.stockMovements = []; // alias si existe
        saveStockMovimientos();
        _renderMovimientosBalance();
        manekiToastExport('🗑️ Historial limpiado', 'ok');
    });
}
function eliminarPedidoFinalizado(id) {
    const pedido = pedidosFinalizados.find(p => String(p.id) === String(id));
    if (!pedido) return;
    showConfirm(`El pedido ${pedido.folio || id} será eliminado del historial de ventas.`, '⚠️ Eliminar pedido').then(ok => {
        if (!ok) return;
        const _idElim = String(id);
        const _folioElim = pedido.folio || '';
        pedidosFinalizados = pedidosFinalizados.filter(p => String(p.id) !== _idElim);
        savePedidosFinalizados();
        // Borrar TODOS los registros del folio: venta final, anticipos, abonos.
        // El registro de venta usa id=mkId() (nunca coincide con el id del pedido),
        // por eso antes el filtro por id no borraba nada y el ingreso quedaba fantasma.
        const _idsShElim = salesHistory
            .filter(s => _folioElim ? (s.folio === _folioElim || String(s.id) === _idElim) : String(s.id) === _idElim)
            .map(s => String(s.id));
        salesHistory = salesHistory.filter(s => !_idsShElim.includes(String(s.id)));
        saveSalesHistory();
        // FIX-ELIM: upsert no elimina — borrar de orders_finalizados y sales_history en Supabase
        if (typeof (window as any).deletePedidoFinalizado === 'function') (window as any).deletePedidoFinalizado(_idElim);
        if (typeof (window as any).deleteSalesHistoryEntry === 'function') {
            _idsShElim.forEach((shId: string) => (window as any).deleteSalesHistoryEntry(shId));
        }
        if (typeof _allVentasCache !== 'undefined') _allVentasCache = null;
        renderHistorialPedidos();
        renderSalesHistory();
        manekiToastExport('🗑️ Pedido eliminado', 'ok');
    });
}
// renderHistorialPedidos — versión activa definida más abajo (usa window.pedidosFinalizados)
function procesarGastosRecurrentes() {
    if (!Array.isArray(gastosRecurrentes) || gastosRecurrentes.length === 0) return;
    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}`;
    let huboNuevos = false;

    gastosRecurrentes.forEach(gr => {
        // BUG-BAL-03 FIX: verificar solo gastos auto-generados (recurrenteAuto===true),
        // para que gastos manuales con el mismo nombre no bloqueen el recurrente.
        const yaExiste = expenses.some(e =>
            e.recurrenteAuto === true &&
            e.concept === gr.concept &&
            e.date && e.date.startsWith(mesActual)
        );
        if (!yaExiste) {
            // FIX 3: clamp day to last day of month (handles day 29-31 in short months)
            const ano = hoy.getFullYear();
            const mes = hoy.getMonth(); // 0-based
            const ultimoDia = new Date(ano, mes + 1, 0).getDate();
            const diaValido = Math.min(gr.dia || 1, ultimoDia);
            const fecha = `${mesActual}-${String(diaValido).padStart(2,'0')}`;
            expenses.push({
                id: mkId(), // BUG-011 FIX: evitar ID número flotante
                concept: gr.concept,
                concepto: gr.concept,
                amount: gr.amount,
                monto: gr.amount,
                date: fecha,
                fecha: fecha,
                recurrenteAuto: true
            });
            huboNuevos = true;
        }
    });

    if (huboNuevos) {
        saveExpenses();
        // FIX 5: no mostrar toast automático — se ejecuta en segundo plano al cargar la sección
    }
}
function toggleRecurrentesPanel() {
    const panel = document.getElementById('recurrentesPanel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderRecurrentesPanel();
}

function renderRecurrentesPanel() {
    const lista = document.getElementById('recurrentesLista');
    if (!lista) return;
    if (!gastosRecurrentes || gastosRecurrentes.length === 0) {
        lista.innerHTML = '<p class="text-xs text-amber-600">Sin gastos recurrentes. Marca "recurrente" al agregar un gasto.</p>';
        return;
    }
    lista.innerHTML = gastosRecurrentes.map((gr, i) => {
        // NTH-15: mostrar el día del mes en que cae el gasto recurrente
        const diaStr = gr.dia ? `<span class="text-xs text-gray-400 ml-1">(día ${gr.dia})</span>` : '';
        return `<div class="flex justify-between items-center py-1">
            <span class="text-xs text-amber-800 font-semibold">${_escBal(gr.concept)} — $${Number(gr.amount).toFixed(2)}/mes ${diaStr}</span>
            <button onclick="eliminarRecurrente(${i})" class="text-red-400 hover:text-red-600 text-xs">✕</button>
        </div>`;
    }).join('');
}

function eliminarRecurrente(idx) {
    showConfirm('Este gasto recurrente ya no se registrará automáticamente.', '¿Eliminar gasto recurrente?').then(ok => {
        if (!ok) return;
        gastosRecurrentes.splice(idx, 1);
        saveGastosRecurrentes();
        renderRecurrentesPanel();
        manekiToastExport('🗑️ Gasto recurrente eliminado', 'ok');
    });
}

// FIX-2: Panel de gestión de ingresos recurrentes ─────────────────────────
function toggleIngresosRecurrentesPanel() {
    let panel = document.getElementById('ingresosRecurrentesPanel');
    if (!panel) {
        // Crear el panel la primera vez junto al panel de gastos recurrentes
        const gastosPanel = document.getElementById('recurrentesPanel');
        if (!gastosPanel) return;
        panel = document.createElement('div');
        panel.id = 'ingresosRecurrentesPanel';
        panel.className = 'hidden mt-2 p-3 bg-green-50 border border-green-200 rounded-xl';
        panel.innerHTML = '<ul id="ingresosRecurrentesLista"></ul>';
        gastosPanel.parentElement.insertBefore(panel, gastosPanel.nextSibling);
    }
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderIngresosRecurrentesPanel();
}

function renderIngresosRecurrentesPanel() {
    const lista = document.getElementById('ingresosRecurrentesLista');
    if (!lista) return;
    const arr = window.ingresosRecurrentes || [];
    if (arr.length === 0) {
        lista.innerHTML = '<p class="text-xs text-green-700">Sin ingresos recurrentes configurados.</p>';
        return;
    }
    lista.innerHTML = arr.map((ir, i) => {
        const diaStr = ir.dia ? `<span class="text-xs text-gray-400 ml-1">(día ${ir.dia})</span>` : '';
        return `<div class="flex justify-between items-center py-1">
            <span class="text-xs text-green-800 font-semibold">${_escBal(ir.concept)} — $${Number(ir.amount).toFixed(2)}/mes ${diaStr}</span>
            <button onclick="eliminarIngresoRecurrente(${i})" class="text-red-400 hover:text-red-600 text-xs">🗑️ Eliminar</button>
        </div>`;
    }).join('');
}

function eliminarIngresoRecurrente(idx) {
    window.ingresosRecurrentes.splice(idx, 1);
    saveIngresosRecurrentes();
    renderIngresosRecurrentesPanel();
    manekiToastExport('✅ Ingreso recurrente eliminado', 'ok');
}

window.toggleIngresosRecurrentesPanel = toggleIngresosRecurrentesPanel;
window.renderIngresosRecurrentesPanel = renderIngresosRecurrentesPanel;
window.eliminarIngresoRecurrente = eliminarIngresoRecurrente;
window.eliminarPedidoFinalizado = eliminarPedidoFinalizado;

        function renderBalance() {
            procesarGastosRecurrentes();
            procesarIngresosRecurrentes();

            // MODELO DE CONTABILIDAD (C3-FIX):
            // · totalIncomeManual = incomes manuales sin fromPOS y sin folioOrigen
            //   Los incomes con folioOrigen (anticipos/abonos) ya están dentro de p.total;
            //   excluirlos aquí evita doble conteo.
            // · totalPedidosFin = p.total de pedidosFinalizados SIN filtro por foliosEnIncomes.
            //   Bug anterior: si un pedido tenía income con folioOrigen, caía fuera de AMBAS fuentes → ingreso perdido.
            const listaIncomes = (window.incomes||[]);
            const totalIncomeManual = listaIncomes
                .filter(i => !i.fromPOS && !i.folioOrigen)
                .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

            // Pedidos finalizados: p.total es el ingreso completo independiente de cómo se pagó
            const totalPedidosFin = (window.pedidosFinalizados||[])
                .reduce((sum, p) => sum + Number(p.total||0), 0);

            // Ventas directas — desde salesHistory (sin type y no canceladas)
            const totalPOS = (window.salesHistory||[])
                .filter(s => s.type !== 'pedido' && s.type !== 'abono' && s.type !== 'anticipo' && s.method !== 'Cancelado')
                .reduce((sum, s) => sum + Number(s.total||0), 0);

            const totalIncome = totalIncomeManual + totalPedidosFin + totalPOS;

            // FIX BC-05: exclude expenses that originated from a paid payable (already counted via markAsPaid)
            const totalExpenses = (window.expenses||[])
                .filter(e => !e.fromPayable)
                .reduce((sum, e) => sum + (Number(e.amount || e.monto) || 0), 0);
            // Cuentas por cobrar = receivables manuales + saldos pendientes de pedidos
            // FIX 5: use calcSaldoPendiente() helper for unified CxC calculation
            const totalReceivables =
                receivables.filter(r => r.status === 'pending').reduce((sum, r) => sum + (Number(r.amount)||0), 0) +
                (window.pedidos||[])
                    .filter(p => !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase()))
                    .reduce((sum, p) => sum + calcSaldoPendiente(p), 0);
            const totalPayables = payables.filter(p => p.status === 'pending').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            
            document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
            document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
            document.getElementById('totalReceivables').textContent = `$${totalReceivables.toFixed(2)}`;
            document.getElementById('totalPayables').textContent = `$${totalPayables.toFixed(2)}`;
            
            renderBalanceMensual();
            renderIncomeList();
            renderExpenseList();
            renderReceivablesList();
            renderPayablesList();
        }
        
     function renderIncomeList() {
    const q = _norm(document.getElementById('buscarIngresos')?.value || '');
    // MEJORA-3: filtro por etiqueta
    const etqFiltro = document.getElementById('filtroEtiquetaIngresos')?.value || '';
    _ensureEtiquetaFiltro('incomeList', 'filtroEtiquetaIngresos', 'renderIncomeList');
    const container = document.getElementById('incomeList');
    // FEATURE-1: filtrar por mes activo
    const _ahoraInc = new Date();
    _ahoraInc.setMonth(_ahoraInc.getMonth() + _balanceMesOffset);
    const _mesActivoInc = `${_ahoraInc.getFullYear()}-${String(_ahoraInc.getMonth()+1).padStart(2,'0')}`;
    let listaInc = incomes.filter(i => (i.date||'').startsWith(_mesActivoInc));
    if (q) listaInc = listaInc.filter(i => _norm(i.concept).includes(q) || (i.date||'').includes(q));
    if (etqFiltro) listaInc = listaInc.filter(i => (i.etiqueta||'') === etqFiltro);
    // Badge informativo debajo del selector de mes
    _renderMesBadge(_mesActivoInc, listaInc.length, null);
    container.innerHTML = listaInc.length === 0
        ? '<div class="mk-empty-state"><div class="mk-empty-icon">📭</div><p class="mk-empty-title">Sin ingresos registrados</p><p class="mk-empty-sub">Agrega tu primer ingreso del mes</p></div>'
        : listaInc.slice().reverse().map(income => `
            <div class="mk-tx-income flex justify-between items-center p-3 bg-green-50 rounded-xl mb-2">
                <div>
                    <p class="font-semibold text-gray-800">${_esc(income.concept)}</p>
                    <p class="text-xs text-gray-500">${_esc(income.date)}${income.etiqueta ? ' ' + _etiquetaBadge(income.etiqueta) : ''}${income.recurrente ? ' <span class="text-xs text-blue-500 font-semibold">↺</span>' : ''}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-green-600">+$${Number(income.amount||0).toFixed(2)}</span>
                    <button onclick="editBalanceItem('income', '${_esc(String(income.id))}')" class="text-blue-400 hover:text-blue-600" title="Editar">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteBalanceItem('income', '${_esc(String(income.id))}')" class="text-red-400 hover:text-red-600" title="Eliminar">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `).join('');
}
        
        function renderExpenseList() {
    const q = _norm(document.getElementById('buscarEgresos')?.value || '');
    // MEJORA-3: filtro por etiqueta en egresos
    const etqFiltro = document.getElementById('filtroEtiquetaEgresos')?.value || '';
    _ensureEtiquetaFiltro('expenseList', 'filtroEtiquetaEgresos', 'renderExpenseList');
    const container = document.getElementById('expenseList');
    // FEATURE-1: filtrar por mes activo
    const _ahoraExp = new Date();
    _ahoraExp.setMonth(_ahoraExp.getMonth() + _balanceMesOffset);
    const _mesActivoExp = `${_ahoraExp.getFullYear()}-${String(_ahoraExp.getMonth()+1).padStart(2,'0')}`;
    let listaExp = expenses.filter(e => (e.date||'').startsWith(_mesActivoExp) && !e.fromPayable);
    if (q) listaExp = listaExp.filter(e => _norm(e.concept).includes(q) || (e.date||'').includes(q));
    if (etqFiltro) listaExp = listaExp.filter(e => (e.etiqueta||'') === etqFiltro);
    // Actualizar badge con conteo de egresos
    _renderMesBadge(_mesActivoExp, null, listaExp.length);
    container.innerHTML = listaExp.length === 0
        ? '<div class="mk-empty-state"><div class="mk-empty-icon">📭</div><p class="mk-empty-title">Sin egresos registrados</p><p class="mk-empty-sub">Agrega tu primer egreso del mes</p></div>'
        : listaExp.slice().reverse().map(expense => `
            <div class="mk-tx-expense flex justify-between items-center p-3 bg-red-50 rounded-xl mb-2">
                <div>
                    <p class="font-semibold text-gray-800">${_esc(expense.concept)}</p>
                    <p class="text-xs text-gray-500">${_esc(expense.date)}${expense.categoria ? ` · <span style="color:#C5973B;font-weight:600">${_esc(expense.categoria)}</span>` : ''}${expense.etiqueta ? ' ' + _etiquetaBadge(expense.etiqueta) : ''}${expense.recurrente ? ' <span class="text-xs text-orange-500 font-semibold">↺</span>' : ''}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-red-600">-$${Number(expense.amount||0).toFixed(2)}</span>
                    <button onclick="editBalanceItem('expense', '${_esc(String(expense.id))}')" class="text-blue-400 hover:text-blue-600" title="Editar">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteBalanceItem('expense', '${_esc(String(expense.id))}')" class="text-red-400 hover:text-red-600" title="Eliminar">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `).join('');
}
        
        function renderReceivablesList() {
            const container = document.getElementById('receivablesList');
            const orden = (document.getElementById('cxcOrden')?.value) || 'dias';
            let lista = [...receivables];
            const hoy = new Date(); hoy.setHours(0,0,0,0);

            // calcular días
            lista = lista.map(rec => {
                const fechaCreacion = rec.createdAt ? new Date(rec.createdAt) : (rec.dueDate ? new Date(rec.dueDate + 'T00:00:00') : null);
                const diasPendiente = fechaCreacion ? Math.round((hoy - fechaCreacion) / 86400000) : 0;
                return { ...rec, diasPendiente };
            });

            if (orden === 'dias') lista.sort((a,b) => b.diasPendiente - a.diasPendiente);
            else if (orden === 'monto') lista.sort((a,b) => b.amount - a.amount);
            else lista.sort((a,b) => (a.client||'').localeCompare(b.client||''));

            // Resumen rápido
            const totalCxC = lista.filter(r => !r.status || r.status === 'pending').reduce((s,r) => s + (Number(r.amount)||0), 0);
            const vencidas = lista.filter(r => r.diasPendiente > 30).length;
            const resumen = document.getElementById('cxcResumen');
            if (resumen) {
                resumen.innerHTML = `
                    <div class="px-3 py-1.5 rounded-xl bg-blue-50 text-xs font-semibold text-blue-700">Total: $${totalCxC.toFixed(2)}</div>
                    <div class="px-3 py-1.5 rounded-xl bg-red-50 text-xs font-semibold text-red-700">${lista.length} deudores</div>
                    ${vencidas > 0 ? `<div class="px-3 py-1.5 rounded-xl bg-orange-50 text-xs font-semibold text-orange-700">⚠️ ${vencidas} +30 días</div>` : ''}`;
            }

            container.innerHTML = lista.map(rec => {
                const urgencia = rec.diasPendiente > 30 ? 'bg-red-50 border-red-200' : rec.diasPendiente > 14 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';
                const diasLabel = rec.diasPendiente === 0 ? 'Hoy' : rec.diasPendiente > 0 ? `${rec.diasPendiente} días` : '—';
                const diasColor = rec.diasPendiente > 30 ? 'text-red-600' : rec.diasPendiente > 14 ? 'text-orange-600' : 'text-blue-600';
                const waLink = rec.phone ? `<a href="https://wa.me/52${rec.phone.replace(/\\D/g,'')}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg hover:bg-green-100 transition-all" style="color:#25D366" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>` : '';
                return `
                <div class="flex justify-between items-center p-3 rounded-xl border ${urgencia}">
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-800 text-sm">${_escBal(rec.client)}</p>
                        <p class="text-xs text-gray-500">Vence: ${_escBal(rec.dueDate)}</p>
                        ${rec.concept ? `<p class="text-xs text-gray-400">${_escBal(rec.concept)}</p>` : ''}
                    </div>
                    <div class="text-right flex items-center gap-2">
                        <div>
                            <p class="font-bold text-blue-600">$${Number(rec.amount||0).toFixed(2)}</p>
                            <p class="text-xs font-semibold ${diasColor}">⏱ ${diasLabel}</p>
                        </div>
                        <div class="flex flex-col gap-1">
                            ${waLink}
                            <button onclick="markAsPaid('receivable', '${rec.id}')" class="p-1.5 rounded-lg hover:bg-green-100 text-xs text-green-600 transition-all" title="Marcar pagado"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                </div>`;
            }).join('') || '<div class="mk-empty"><div class="mk-empty-icon">📭</div><div class="mk-empty-title">Sin cuentas por cobrar</div><div class="mk-empty-sub">No hay saldos pendientes de clientes</div></div>';

            // CxC de pedidos activos
            renderCxCPedidos();
        }

        function renderCxCPedidos() {
            const container = document.getElementById('cxcPedidosList');
            if (!container) return;
            const hoy = new Date(); hoy.setHours(0,0,0,0);
            const conSaldo = (window.pedidos || [])
                .filter(p => calcSaldoPendiente(p) > 0)
                .map(p => {
                    const fechaRef = p.fechaPedido ? new Date(p.fechaPedido + 'T00:00:00') : null;
                    const dias = fechaRef ? Math.round((hoy - fechaRef) / 86400000) : 0;
                    return { ...p, dias, _saldo: calcSaldoPendiente(p) };
                })
                .sort((a,b) => b.dias - a.dias);

            if (conSaldo.length === 0) {
                container.innerHTML = '<p class="text-xs text-gray-400 text-center py-2">Todos los pedidos están al corriente 🎉</p>';
                return;
            }
            container.innerHTML = conSaldo.map(p => {
                const diasColor = p.dias > 30 ? 'text-red-600' : p.dias > 14 ? 'text-orange-600' : 'text-gray-500';
                const diasLabel = p.dias === 0 ? 'Hoy' : `${p.dias}d`;
                const _safeId = String(p.id).replace(/'/g, '');
                // BUG-2 FIX: guards para funciones del bundle de pedidos
                const waBtn = p.telefono ? `<button onclick="typeof abrirWhatsAppPedido==='function'?abrirWhatsAppPedido('${_safeId}'):manekiToastExport('Carga la sección de Pedidos primero','warn')" class="p-1.5 rounded-lg hover:bg-green-100 text-xs" style="color:#25D366"><i class="fab fa-whatsapp"></i></button>` : '';
                return `<div class="flex items-center gap-2 p-2 bg-blue-50 rounded-xl">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-amber-600">${p.folio}</p>
                        <p class="text-xs text-gray-700 truncate">${p.cliente}</p>
                    </div>
                    <span class="text-xs font-bold text-red-600 whitespace-nowrap">$${Number(p._saldo).toFixed(2)}</span>
                    <span class="text-xs font-semibold ${diasColor} whitespace-nowrap">${diasLabel}</span>
                    ${waBtn}
                    <button onclick="typeof openAbonoPedido==='function'?openAbonoPedido('${_safeId}'):manekiToastExport('Carga la sección de Pedidos primero','warn')" class="p-1.5 rounded-lg hover:bg-green-100 text-xs text-green-600"><i class="fas fa-dollar-sign"></i></button>
                </div>`;
            }).join('');
        }
        
        function renderPayablesList() {
            const container = document.getElementById('payablesList');
            container.innerHTML = payables.map(pay => `
                <div class="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                    <div>
                        <p class="font-semibold text-gray-800">${_escBal(pay.supplier)}</p>
                        <p class="text-xs text-gray-500">Vence: ${_escBal(pay.dueDate)}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-orange-600">$${Number(pay.amount||0).toFixed(2)}</p>
                        <button onclick="markAsPaid('payable', '${_escBal(String(pay.id))}')" class="text-xs text-green-600 hover:text-green-700">
                            Marcar pagado
                        </button>
                    </div>
                </div>
            `).join('') || '<div class="mk-empty"><div class="mk-empty-icon">🗂️</div><div class="mk-empty-title">Sin cuentas por pagar</div><div class="mk-empty-sub">No hay pagos pendientes a proveedores</div></div>';
        }
        
        // UX9: poblar datalist con últimas 10 descripciones únicas de incomes+expenses
        function _poblarConceptosSuggestions() {
            const inputEl = document.getElementById('transactionConcept') as HTMLInputElement|null;
            if (!inputEl) return;
            inputEl.setAttribute('list', 'transactionConceptSuggestions');
            let dl = document.getElementById('transactionConceptSuggestions');
            if (!dl) {
                dl = document.createElement('datalist');
                dl.id = 'transactionConceptSuggestions';
                inputEl.insertAdjacentElement('afterend', dl);
            }
            const _lsKey = 'mk_concepto_historial';
            let hist: string[] = [];
            try { hist = JSON.parse(localStorage.getItem(_lsKey) || '[]'); } catch(e) {}
            // Completar con conceptos reales de incomes/expenses si el historial está vacío
            if (hist.length < 5) {
                const fromDB = [
                    ...(window.incomes||[]).map((i: any) => i.concept||''),
                    ...(window.expenses||[]).map((e: any) => e.concept||'')
                ].filter(Boolean);
                hist = [...new Set([...hist, ...fromDB])].slice(-20);
            }
            dl.innerHTML = hist.slice(-10).reverse()
                .map((c: string) => `<option value="${c.replace(/"/g,'&quot;')}">`)
                .join('');
        }
        // Guardar concepto en historial localStorage al submit
        (function _hookConceptoHistorial() {
            const form = document.getElementById('transactionForm');
            if (!form || (form as any)._conceptoHookDone) return;
            (form as any)._conceptoHookDone = true;
            form.addEventListener('submit', function() {
                const val = (document.getElementById('transactionConcept') as HTMLInputElement|null)?.value?.trim();
                if (!val) return;
                const _lsKey = 'mk_concepto_historial';
                try {
                    let hist: string[] = JSON.parse(localStorage.getItem(_lsKey) || '[]');
                    hist = hist.filter((h: string) => h !== val);
                    hist.push(val);
                    localStorage.setItem(_lsKey, JSON.stringify(hist.slice(-20)));
                } catch(e) {}
            });
        })();

        function openIncomeModal() {
            // BUG-BAL-04 FIX: reset primero para que no borre los valores asignados después
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionModalTitle').textContent = 'Nuevo Ingreso';
            document.getElementById('transactionType').value = 'income';
            document.getElementById('clientFieldContainer').classList.add('hidden');
            // MEJORA-2: mostrar checkbox recurrente también para ingresos
            document.getElementById('recurrenteContainer').classList.remove('hidden');
            document.getElementById('transactionRecurrente').checked = false;
            document.getElementById('transactionSubmitBtn').textContent = '💾 Guardar';
            const modal = document.getElementById('transactionModal');
            modal.dataset.editId = '';
            modal.dataset.editType = '';
            // MEJORA-3: mostrar etiqueta para ingresos (categoría de movimiento)
            _toggleEtiquetaField(true);
            _toggleCatField(false);
            _poblarConceptosSuggestions();
            openModal(modal);
        }
        
        function openExpenseModal() {
            // BUG-BAL-04 FIX: reset primero para que no borre los valores asignados después
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionModalTitle').textContent = 'Nuevo Egreso';
            _poblarConceptosSuggestions();
            document.getElementById('transactionType').value = 'expense';
            document.getElementById('clientFieldContainer').classList.add('hidden');
            document.getElementById('recurrenteContainer').classList.remove('hidden');
            document.getElementById('transactionRecurrente').checked = false;
            document.getElementById('transactionSubmitBtn').textContent = '💾 Guardar';
            const modal = document.getElementById('transactionModal');
            modal.dataset.editId = '';
            modal.dataset.editType = '';
            // NTH-13: mostrar selector de categoría solo para egresos
            _toggleCatField(true);
            // MEJORA-3: mostrar etiqueta para egresos
            _toggleEtiquetaField(true);
            openModal(modal);
        }
        
        function openReceivableModal() {
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionModalTitle').textContent = 'Nueva Cuenta por Cobrar';
            document.getElementById('transactionType').value = 'receivable';
            document.getElementById('clientFieldContainer').classList.remove('hidden');
            document.getElementById('transactionSubmitBtn').textContent = '💾 Guardar';
            const modal = document.getElementById('transactionModal');
            modal.dataset.editId = '';
            modal.dataset.editType = '';
            openModal(modal);
        }
        
        function openPayableModal() {
            document.getElementById('transactionModalTitle').textContent = 'Nueva Cuenta por Pagar';
            document.getElementById('transactionType').value = 'payable';
            document.getElementById('clientFieldContainer').classList.remove('hidden');
            document.getElementById('transactionSubmitBtn').textContent = '💾 Guardar';
            const modal = document.getElementById('transactionModal');
            modal.dataset.editId = '';
            modal.dataset.editType = '';
            document.getElementById('transactionForm').reset();
            openModal(modal);
        }
        
        // FIX-3: Editar movimiento existente (ingreso o gasto) ─────────────────────
        function editBalanceItem(type, id) {
            const list = type === 'income' ? incomes : expenses;
            const item = list.find(i => String(i.id) === String(id));
            if (!item) return;

            document.getElementById('transactionForm').reset();
            document.getElementById('transactionModalTitle').textContent = type === 'income' ? 'Editar Ingreso' : 'Editar Egreso';
            document.getElementById('transactionType').value = type;
            document.getElementById('transactionConcept').value = item.concept || '';
            document.getElementById('transactionAmount').value = item.amount || '';
            document.getElementById('transactionDate').value = item.date || '';
            document.getElementById('clientFieldContainer').classList.add('hidden');
            document.getElementById('recurrenteContainer').classList.remove('hidden');
            document.getElementById('transactionRecurrente').checked = !!(item.recurrente);
            document.getElementById('transactionSubmitBtn').textContent = '💾 Guardar';

            const modal = document.getElementById('transactionModal');
            modal.dataset.editId = String(item.id);
            modal.dataset.editType = type;

            if (type === 'expense') {
                _toggleCatField(true);
                const catEl = document.getElementById('transactionCategoria');
                if (catEl) catEl.value = item.categoria || '';
            } else {
                _toggleCatField(false);
            }

            // MEJORA-3: restaurar etiqueta al editar
            _toggleEtiquetaField(true);
            const etqEl = document.getElementById('transactionEtiqueta');
            if (etqEl) etqEl.value = item.etiqueta || '';

            openModal(modal);
        }
        window.editBalanceItem = editBalanceItem;

        // NTH-13: Mostrar/ocultar campo categoría en modal de transacción ─────────
        function _toggleCatField(show) {
            let wrap = document.getElementById('transactionCategoriaWrap');
            if (!wrap) {
                // Crear campo la primera vez y añadirlo antes del botón submit
                const recContainer = document.getElementById('recurrenteContainer');
                if (!recContainer) return;
                wrap = document.createElement('div');
                wrap.id = 'transactionCategoriaWrap';
                wrap.className = 'mb-3';
                wrap.innerHTML = `<label class="block text-xs font-semibold text-gray-600 mb-1">Categoría del gasto</label>
                    <select id="transactionCategoria" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
                        <option value="">Sin categoría</option>
                        ${_GASTO_CATEGORIAS.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select>`;
                recContainer.parentElement.insertBefore(wrap, recContainer);
            }
            wrap.style.display = show ? '' : 'none';
            const sel = document.getElementById('transactionCategoria');
            if (sel && !show) sel.value = '';
        }

        // ── Exponer funciones de balance globalmente ──
        window.openIncomeModal = openIncomeModal;
        window.openExpenseModal = openExpenseModal;
        window.openReceivableModal = openReceivableModal;
        window.openPayableModal = openPayableModal;
        window.renderBalance = typeof mkDebounce === 'function' ? mkDebounce(renderBalance, 200) : renderBalance;
        window.renderIncomeList = renderIncomeList;
        window.renderExpenseList = renderExpenseList;
        window.renderReceivablesList = renderReceivablesList;
        window.renderPayablesList = renderPayablesList;
        window.renderCxCPedidos = renderCxCPedidos;
        window.renderBalanceMensual = renderBalanceMensual;
        window.cambiarMesBalance = cambiarMesBalance;

        // FEATURE-1: badge "Mostrando mes X — N ingresos · N egresos"
        function _renderMesBadge(mesActivo: string, numIngresos: number|null, numEgresos: number|null) {
            let badge = document.getElementById('balMesFiltradoBadge');
            if (!badge) {
                const labelEl = document.getElementById('balanceMesLabel');
                if (!labelEl) return;
                badge = document.createElement('p');
                badge.id = 'balMesFiltradoBadge';
                badge.style.cssText = 'font-size:.75rem;color:#6b7280;margin-top:2px;';
                labelEl.parentElement.insertBefore(badge, labelEl.nextSibling);
            }
            // Acumular conteos (se llama dos veces: una para ingresos, otra para egresos)
            const prev = (badge as any)._counts || { inc: null, exp: null };
            if (numIngresos !== null) prev.inc = numIngresos;
            if (numEgresos !== null) prev.exp = numEgresos;
            (badge as any)._counts = prev;
            const [anio, mes] = mesActivo.split('-');
            const label = new Date(Number(anio), Number(mes)-1, 1)
                .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
            const incStr = prev.inc !== null ? `${prev.inc} ingreso${prev.inc !== 1 ? 's' : ''}` : '…';
            const expStr = prev.exp !== null ? `${prev.exp} egreso${prev.exp !== 1 ? 's' : ''}` : '…';
            badge.textContent = `Mostrando ${label} · ${incStr} · ${expStr}`;
        }

        // BUG-1 FIX: closeTransactionModal — faltaba completamente
        function closeTransactionModal() {
            closeModal('transactionModal');
            const form = document.getElementById('transactionForm') as HTMLFormElement | null;
            if (form) form.reset();
            const modal = document.getElementById('transactionModal');
            if (modal) { modal.dataset.editId = ''; modal.dataset.editType = ''; }
        }
        window.closeTransactionModal = closeTransactionModal;


        const _txForm = document.getElementById('transactionForm');
        if (_txForm && !_txForm._mkBound) {
            _txForm._mkBound = true;
            _txForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // FIX-SPINNER: deshabilitar botón mientras se guarda
    const submitBtn = e.target.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Guardando...'; }
    const _restoreBtn = () => { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '💾 Guardar'; } };

    const modal = document.getElementById('transactionModal');
    const editId = modal.dataset.editId ? modal.dataset.editId : null;
    const editType = modal.dataset.editType || null;

    const type = document.getElementById('transactionType').value;
    const concept = document.getElementById('transactionConcept').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const date = document.getElementById('transactionDate').value;
    const client = document.getElementById('transactionClient')?.value || '';

    if (!concept) { _restoreBtn(); manekiToastExport('⚠️ Escribe un concepto para la transacción.', 'warn'); return; }
    if (!Number.isFinite(amount) || amount <= 0) { _restoreBtn(); manekiToastExport('⚠️ Ingresa un monto válido mayor a $0.', 'warn'); return; }
    if (!date) { _restoreBtn(); manekiToastExport('⚠️ Selecciona una fecha.', 'warn'); return; }

    // ── MODO EDICIÓN ──
    if (editId && editType) {
        const list = editType === 'income' ? incomes : expenses;
        const item = list.find(i => String(i.id) === String(editId));
        if (item) {
            item.concept = concept;
            item.concepto = concept;
            item.amount = amount;
            item.monto = amount;
            item.date = date;
            item.fecha = date;
            item.client = client;
            item.cliente = client;
            if (editType === 'expense') item.categoria = document.getElementById('transactionCategoria')?.value || item.categoria || '';
            // MEJORA-3: guardar etiqueta en edición
            item.etiqueta = document.getElementById('transactionEtiqueta')?.value || item.etiqueta || '';
        }
        if (editType === 'income') saveIncomes();
        else saveExpenses();

        _restoreBtn();
        closeTransactionModal();
        renderBalance();
        updateDashboard();
        return;
    }

    // ── MODO CREAR ──
    const newItem = {
        id: mkId(),
        concept: concept,
        concepto: concept,
        amount: amount,
        monto: amount,
        date: date,
        fecha: date,
        client: client,
        cliente: client,
        categoria: document.getElementById('transactionCategoria')?.value || '',
        etiqueta: document.getElementById('transactionEtiqueta')?.value || ''
    };

    if (type === 'income') {
        // MEJORA-2: soporte recurrente para ingresos
        const esRecurrenteInc = document.getElementById('transactionRecurrente')?.checked;
        if (esRecurrenteInc) {
            newItem.recurrente = true;
            if (!window.ingresosRecurrentes) window.ingresosRecurrentes = [];
            window.ingresosRecurrentes.push({ concept, amount, dia: (date && date.includes('-')) ? parseInt(date.split('-')[2], 10) || 1 : (new Date(date).getDate() || 1) });
            saveIngresosRecurrentes();
        }
        incomes.push(newItem);
        saveIncomes();
    } else if (type === 'expense') {
        const esRecurrente = document.getElementById('transactionRecurrente')?.checked;
        if (esRecurrente) {
            newItem.recurrente = true;
            if (!gastosRecurrentes) gastosRecurrentes = [];
            gastosRecurrentes.push({ concept, amount, dia: (date && date.includes('-')) ? parseInt(date.split('-')[2], 10) || 1 : (new Date(date).getDate() || 1) });
            saveGastosRecurrentes();
        }
        expenses.push(newItem);
        saveExpenses();
    } else if (type === 'receivable') {
        receivables.push({ ...newItem, status: 'pending' });
        saveReceivables();
    } else if (type === 'payable') {
        payables.push({ ...newItem, status: 'pending' });
        savePayables();
    }

    _restoreBtn();
    closeTransactionModal();
    renderBalance();
    updateDashboard();
});
        } // end if (!_txForm._mkBound)

        // ══════════════════════════════════════════════════════════════════
        // MEJORA-3: Etiquetas — badge, filtro, campo en modal
        // (_ETIQUETAS definido al inicio del módulo para evitar TDZ)
        // ══════════════════════════════════════════════════════════════════

        function _etiquetaBadge(valor) {
            if (!valor) return '';
            const e = _ETIQUETAS.find(x => x.valor === valor);
            if (!e) return `<span class="text-xs px-1.5 py-0.5 rounded-full font-semibold" style="background:#f3f4f6;color:#6b7280">${valor}</span>`;
            return `<span class="text-xs px-1.5 py-0.5 rounded-full font-semibold" style="background:${e.bg};color:${e.color}">${e.label}</span>`;
        }

        // Inyecta el select de etiqueta en el modal (una sola vez)
        function _toggleEtiquetaField(show) {
            let wrap = document.getElementById('transactionEtiquetaWrap');
            if (!wrap) {
                const recContainer = document.getElementById('recurrenteContainer');
                if (!recContainer) return;
                wrap = document.createElement('div');
                wrap.id = 'transactionEtiquetaWrap';
                wrap.className = 'mb-3';
                const opts = _ETIQUETAS.map(e => `<option value="${e.valor}">${e.label}</option>`).join('');
                wrap.innerHTML = `<label class="block text-xs font-semibold text-gray-600 mb-1">Etiqueta</label>
                    <select id="transactionEtiqueta" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
                        <option value="">Sin etiqueta</option>${opts}
                    </select>`;
                recContainer.parentElement.insertBefore(wrap, recContainer);
            }
            wrap.style.display = show ? '' : 'none';
            const sel = document.getElementById('transactionEtiqueta');
            if (sel && !show) sel.value = '';
        }

        // Inserta el select de filtro por etiqueta encima del contenedor de lista
        function _ensureEtiquetaFiltro(listId, filtroId, renderFn) {
            if (document.getElementById(filtroId)) return;
            const listEl = document.getElementById(listId);
            if (!listEl || !listEl.parentElement) return;
            const opts = _ETIQUETAS.map(e => `<option value="${e.valor}">${e.label}</option>`).join('');
            const wrap = document.createElement('div');
            wrap.className = 'mb-2';
            wrap.innerHTML = `<select id="${filtroId}" onchange="${renderFn}()"
                class="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 bg-white">
                <option value="">Todas las etiquetas</option>${opts}
            </select>`;
            listEl.parentElement.insertBefore(wrap, listEl);
        }

        // ══════════════════════════════════════════════════════════════════
        // MEJORA-2: Ingresos recurrentes
        // ══════════════════════════════════════════════════════════════════
        if (!window.ingresosRecurrentes) window.ingresosRecurrentes = [];

        function saveIngresosRecurrentes() {
            (async () => { await sbSave('ingresosRecurrentes', window.ingresosRecurrentes); })();
        }
        window.saveIngresosRecurrentes = saveIngresosRecurrentes;

        function procesarIngresosRecurrentes() {
            if (!Array.isArray(window.ingresosRecurrentes) || window.ingresosRecurrentes.length === 0) return;
            const hoy = new Date();
            const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}`;
            let huboNuevos = false;
            window.ingresosRecurrentes.forEach(ir => {
                // FIX-1: usar variable local `incomes` (fuente de verdad) en vez de window.incomes
                const yaExiste = incomes.some(i =>
                    i.recurrenteAuto === true &&
                    i.concept === ir.concept &&
                    (i.date||'').startsWith(mesActual)
                );
                if (!yaExiste) {
                    const ano = hoy.getFullYear();
                    const mes = hoy.getMonth();
                    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
                    const diaValido = Math.min(ir.dia || 1, ultimoDia);
                    const fecha = `${mesActual}-${String(diaValido).padStart(2,'0')}`;
                    incomes.push({
                        id: mkId(),
                        concept: ir.concept,
                        concepto: ir.concept,
                        amount: ir.amount,
                        monto: ir.amount,
                        date: fecha,
                        fecha: fecha,
                        recurrenteAuto: true
                    });
                    huboNuevos = true;
                }
            });
            if (huboNuevos) saveIncomes();
        }
        window.procesarIngresosRecurrentes = procesarIngresosRecurrentes;

        // ══════════════════════════════════════════════════════════════════
        // MEJORA-4: Utilidad neta prominente
        // ══════════════════════════════════════════════════════════════════
        function _renderUtilidadNeta(totalIngresos, totalGastos) {
            const utilidad = totalIngresos - totalGastos;
            const margen = totalIngresos > 0 ? (utilidad / totalIngresos * 100) : 0;
            const esPos = utilidad > 0;
            const esNeg = utilidad < 0;
            const textColor = esPos ? '#15803d' : esNeg ? '#dc2626' : '#ca8a04';

            let card = document.getElementById('balUtilidadNetaCard');
            if (!card) {
                const anchor = document.getElementById('balMesNetoBg');
                if (!anchor) return;
                card = document.createElement('div');
                card.id = 'balUtilidadNetaCard';
                anchor.parentElement.insertBefore(card, anchor.nextSibling);
            }
            card.className = 'bg-white rounded-xl p-4 border border-gray-100 mb-4';
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-400 mb-0.5">Utilidad neta acumulada</p>
                        <p class="text-2xl font-extrabold" style="color:${textColor}">$${utilidad.toFixed(2)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-400 mb-0.5">Margen</p>
                        <p class="text-lg font-bold" style="color:${textColor}">${totalIngresos === 0 ? 'N/A' : (isFinite(margen) ? margen.toFixed(1) + '%' : 'N/A')}</p>
                    </div>
                </div>`;
        }

        // ══════════════════════════════════════════════════════════════════
        // MEJORA-1: Proyección de cashflow
        // ══════════════════════════════════════════════════════════════════
        function renderProyeccionCashflow() {
            const hoy = new Date(); hoy.setHours(0,0,0,0);
            const pedidosActivos = (window.pedidos||[]).filter(p => {
                if (!p.entrega) return false;
                const fe = new Date(p.entrega + 'T00:00:00');
                const diff = Math.round((fe - hoy) / 86400000);
                return diff >= 0 && diff <= 30 &&
                    !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase());
            });

            // Siempre re-renderizar o limpiar el card
            let card = document.getElementById('balCashflowCard');

            function _cashflowAnchor() {
                return document.getElementById('balUtilidadNetaCard') ||
                    document.getElementById('balCatGastosContainer') ||
                    document.getElementById('balMesNetoBg');
            }

            if (pedidosActivos.length === 0) {
                if (!card) {
                    const anchor = _cashflowAnchor();
                    if (!anchor) return;
                    card = document.createElement('div');
                    card.id = 'balCashflowCard';
                    anchor.parentElement.insertBefore(card, anchor.nextSibling);
                }
                card.className = 'bg-white rounded-xl p-4 border border-gray-100 mb-4';
                card.innerHTML = '<p style="text-align:center;color:#9ca3af;font-size:12px;padding:8px 0">Sin pedidos activos con entrega en los próximos 30 días</p>';
                return;
            }

            const buckets = [
                { label: 'Esta semana',       min: 0,  max: 7,  cobros: 0, gastos: 0 },
                { label: 'Próximas 2 semanas',min: 8,  max: 14, cobros: 0, gastos: 0 },
                { label: 'Este mes',          min: 15, max: 30, cobros: 0, gastos: 0 },
            ];

            pedidosActivos.forEach(p => {
                const fe = new Date(p.entrega + 'T00:00:00');
                const diff = Math.round((fe - hoy) / 86400000);
                const saldo = typeof calcSaldoPendiente === 'function'
                    ? calcSaldoPendiente(p)
                    : Math.max(0, Number(p.total||0) - Number(p.anticipo||0));
                const bk = buckets.find(b => diff >= b.min && diff <= b.max);
                if (bk) bk.cobros += saldo;
            });

            // Gastos recurrentes programados en los periodos
            if (Array.isArray(gastosRecurrentes)) {
                gastosRecurrentes.forEach(gr => {
                    const diaGasto = gr.dia || 1;
                    // Calcular la fecha del gasto este mes
                    const ano = hoy.getFullYear();
                    const mes = hoy.getMonth();
                    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
                    const diaReal = Math.min(diaGasto, ultimoDia);
                    const fechaGasto = new Date(ano, mes, diaReal);
                    fechaGasto.setHours(0,0,0,0);
                    const diff = Math.round((fechaGasto - hoy) / 86400000);
                    const bk = buckets.find(b => diff >= b.min && diff <= b.max);
                    if (bk) bk.gastos += Number(gr.amount||0);
                });
            }

            if (!card) {
                const anchor = _cashflowAnchor();
                if (!anchor) return;
                card = document.createElement('div');
                card.id = 'balCashflowCard';
                anchor.parentElement.insertBefore(card, anchor.nextSibling);
            }

            const filas = buckets.map(b => {
                const neto = b.cobros - b.gastos;
                const netoColor = neto >= 0 ? '#15803d' : '#dc2626';
                return `<tr class="border-t border-gray-100">
                    <td class="py-1.5 pr-2 text-xs font-medium text-gray-700">${b.label}</td>
                    <td class="py-1.5 pr-2 text-xs text-green-700 font-semibold text-right">$${b.cobros.toFixed(2)}</td>
                    <td class="py-1.5 pr-2 text-xs text-red-600 font-semibold text-right">$${b.gastos.toFixed(2)}</td>
                    <td class="py-1.5 text-xs font-bold text-right" style="color:${netoColor}">$${neto.toFixed(2)}</td>
                </tr>`;
            }).join('');

            card.className = 'bg-white rounded-xl p-4 border border-gray-100 mb-4';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-gray-700">Flujo de efectivo</h4>
                    <span class="text-xs text-gray-400">${pedidosActivos.length} pedidos activos</span>
                </div>
                <table class="w-full">
                    <thead><tr>
                        <th class="text-left text-xs text-gray-400 pb-1 pr-2">Período</th>
                        <th class="text-right text-xs text-gray-400 pb-1 pr-2">Cobros esperados</th>
                        <th class="text-right text-xs text-gray-400 pb-1 pr-2">Gastos prog.</th>
                        <th class="text-right text-xs text-gray-400 pb-1">Neto proyectado</th>
                    </tr></thead>
                    <tbody>${filas}</tbody>
                </table>`;
        }
        window.renderProyeccionCashflow = renderProyeccionCashflow;

        function markAsPaid(type, id) {
            if (type === 'receivable') {
                const index = receivables.findIndex(r => String(r.id) === String(id));
                if (index !== -1) {
                    const rec = receivables[index];
                    const amount = rec.amount;
                    // FIX #10: concepto descriptivo con nombre del cliente
                    const concept = `Cobro realizado: ${rec.client || rec.concept || 'CxC #' + id}`;
                    receivables.splice(index, 1);
                    incomes.push({ id: mkId(), concept, amount, date: _fechaHoy() }); // FIX 1: fecha local
                    saveReceivables();
                    saveIncomes();
                }
            } else if (type === 'payable') {
                const index = payables.findIndex(p => String(p.id) === String(id));
                if (index !== -1) {
                    const pay = payables[index];
                    const amount = pay.amount;
                    // FIX #10: concepto descriptivo con nombre del proveedor
                    const concept = `Pago realizado: ${pay.supplier || pay.concept || 'CxP #' + id}`;
                    payables.splice(index, 1);
                    expenses.push({ id: mkId(), concept, amount, date: _fechaHoy(), fromPayable: true }); // FIX 1: fecha local; fromPayable: evitar doble conteo
                    savePayables();
                    saveExpenses();
                }
            }
            
            renderBalance();
            updateDashboard();
        }