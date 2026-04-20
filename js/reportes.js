// ============== REPORTS MODULE ==============
// v1.1 — Limpiado de conflictos con inventory.js v2.1:
//   • ELIMINADOS: let modoEdicion, let edicionProductoId (ya en window.* via inventory.js)
//   • ELIMINADA: redefinición de editProduct (ahora solo en inventory.js)
//   • ELIMINADOS: _origCloseAddProductModal / closeAddProductModal override  
//   • ELIMINADO: window.openAddProductModal re-asignación
//   • Los parches de renderTopProducts, updateMonthlyStats, etc. se mantienen.

// ── HELPER: fuente unificada de ventas (salesHistory + pedidosFinalizados) ──
let _allVentasCache = null;
let _allVentasCacheKey = '';

function _getAllVentas() {
    const sh = window.salesHistory || [];
    const pf = window.pedidosFinalizados || [];
    const cacheKey = `${sh.length}_${pf.length}`;
    if (_allVentasCache && _allVentasCacheKey === cacheKey) return _allVentasCache;

    // 1. Folios ya en salesHistory como type:'pedido' → no duplicar desde pedidosFinalizados
    var foliosEnSH = {};
    sh.filter(function(s){ return s.type === 'pedido'; }).forEach(function(s){ if(s.folio) foliosEnSH[s.folio] = true; });

    // 2. BUG-FIX: entradas legacy en salesHistory sin type (aparecen como "POS") que en
    //    realidad son cobros de pedidos — se detectan porque su concept contiene un folio PE-XXXX
    //    o porque fueron creadas desde confirmarAbonoPedido (tienen note con folio).
    //    Las marcamos para no mostrarlas como POS duplicado.
    var idsLegacyPedido = {};
    sh.forEach(function(s) {
        if (s.type && s.type !== '') return; // ya tiene type, no es legacy
        // Si el concept o note contiene un folio PE- o el customer coincide con un pedido finalizado
        var folioEnConcepto = (s.concept || s.concepto || '').match(/PE-\d+/);
        if (folioEnConcepto) {
            idsLegacyPedido[s.id] = true;
            foliosEnSH[folioEnConcepto[0]] = true; // evitar que también entre desde pfComoVentas
            return;
        }
        // Deduplicar: intentar match por folio primero (más preciso), luego por cliente+total+fecha+concepto
        var matchPedido = pf.find(function(p) {
            // BA-08 FIX: si ambos tienen folio, deduplicar solo por folio para evitar
            // ocultar pedidos legítimos distintos con mismo cliente/total/fecha
            if (s.folio && p.folio) {
                return s.folio === p.folio && !foliosEnSH[p.folio];
            }
            // Si el pedido finalizado tiene folio pero la entrada de salesHistory no,
            // intentar match por folio incluido en el concept/note de la entrada
            if (p.folio && !s.folio) {
                var folioEnNote = (s.concept || s.concepto || s.note || '').indexOf(p.folio) !== -1;
                if (folioEnNote && !foliosEnSH[p.folio]) return true;
            }
            // Fallback conservador: match por cliente+total+fecha+concepto para evitar
            // ocultar pedidos distintos del mismo cliente con el mismo total en la misma fecha.
            // Sin folio exacto NO se deduplica, se incluyen siempre.
            if (!p.folio) {
                // No hay folio en el pedido finalizado — no se puede deduplicar con seguridad
                return false;
            }
            var fechaPed = String(p.fechaFinalizado || p.fecha || '').substring(0, 10);
            var conceptoMatch = !p.concepto || !s.concept ||
                                p.concepto === (s.concept || s.concepto || '');
            return p.cliente === s.customer &&
                   Number(p.total) === Number(s.total) &&
                   fechaPed === s.date &&
                   conceptoMatch &&
                   !foliosEnSH[p.folio];
        });
        if (matchPedido) {
            idsLegacyPedido[s.id] = true;
            foliosEnSH[matchPedido.folio] = true;
        }
    });

    // 3. salesHistory filtrado: excluir las entradas legacy identificadas como pedidos
    var shFiltrado = sh.filter(function(s) { return !idsLegacyPedido[s.id]; });

    // 4. Convertir pedidosFinalizados históricos no cubiertos por salesHistory
    var pfComoVentas = pf.filter(function(p){ return !foliosEnSH[p.folio]; }).map(function(p) {
        return {
            id: p.id,
            type: 'pedido',
            folio: p.folio,
            date: String(p.fechaFinalizado || p.fecha || p.fechaPedido || '').substring(0, 10),
            customer: p.cliente || 'Cliente',
            products: (p.productosInventario || []).map(function(i){
                return { id: i.id||'', name: i.name||i.nombre||p.concepto||'—',
                         quantity: Number(i.quantity||i.cantidad||1),
                         price: Number(i.price||i.precio||0), cost: Number(i.cost||i.costo||0) };
            }),
            total: Number(p.total || 0),
            method: p.metodoPago || p.metodo || 'Efectivo',
            concepto: p.concepto
        };
    });
    var resultado = shFiltrado.concat(pfComoVentas);

    // FIX DOBLE CONTEO: si un folio tiene type:'pedido' con total completo Y además
    // tiene registros type:'anticipo'/'abono', ajustar el total del 'pedido' para que
    // solo refleje lo que restaba (total - sum de anticipos/abonos del mismo folio).
    var anticiposPorFolio = {};
    resultado.forEach(function(s) {
        if ((s.type === 'anticipo' || s.type === 'abono') && s.folio) {
            anticiposPorFolio[s.folio] = (anticiposPorFolio[s.folio] || 0) + Number(s.total || 0);
        }
    });
    resultado.forEach(function(s) {
        if (s.type === 'pedido' && s.folio && anticiposPorFolio[s.folio]) {
            var totalOriginal = Number(s.totalPedido || s.total || 0);
            var yaCobrado = anticiposPorFolio[s.folio];
            // Solo ajustar si el total del registro parece ser el total completo del pedido
            // (es decir, no fue ya corregido con el fix de saldo pendiente)
            if (!s.totalPedido && totalOriginal > yaCobrado) {
                s.totalPedido = totalOriginal;
                s.total = Math.max(0, totalOriginal - yaCobrado);
            }
        }
    });

    _allVentasCacheKey = cacheKey;
    _allVentasCache = resultado;
    return _allVentasCache;
}

function renderValorInventario() {
    const terminados = (window.products||[]).filter(p => p.tipo !== 'materia_prima' && p.tipo !== 'servicio' && p.stock > 0);
    const totalUnidades = terminados.reduce((s, p) => s + (p.stock || 0), 0);
    const valorCosto = terminados.reduce((s, p) => s + (p.cost || 0) * (p.stock || 0), 0);
    const valorVenta = terminados.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
    const ganancia = valorVenta - valorCosto;
    const margen = valorVenta > 0 ? ((ganancia / valorVenta) * 100).toFixed(1) : 0;

    const el = id => document.getElementById(id);
    if (el('invValorCosto'))        el('invValorCosto').textContent        = '$' + valorCosto.toFixed(2);
    if (el('invValorVenta'))        el('invValorVenta').textContent        = '$' + valorVenta.toFixed(2);
    if (el('invGananciaPotencial')) el('invGananciaPotencial').textContent = '$' + ganancia.toFixed(2);
    if (el('invTotalUnidades'))     el('invTotalUnidades').textContent     = totalUnidades + ' unidades en stock';
    if (el('invTotalProductos'))    el('invTotalProductos').textContent    = terminados.length + ' productos con stock';
    if (el('invMargenPromedio'))    el('invMargenPromedio').textContent    = 'Margen potencial promedio: ' + margen + '%'; // FIX 7: clarify theoretical margin
}

let comparativaMesesChart = null;
let topProductosChart = null;
// categoryChart ya declarado en app-data.js — no redeclarar (causaría SyntaxError)
let margenCategoriaChart = null;

// ── MEJORA 4: Exportar gráfica como PNG ──────────────────────────────────────
function exportarGraficaPNG(chart, nombre) {
    if (!chart || !chart.canvas) return;
    const url = chart.toBase64Image('image/png', 1);
    const a = document.createElement('a');
    a.href = url; a.download = (nombre || 'grafica') + '.png'; a.click();
}
window.exportarGraficaPNG = exportarGraficaPNG;

// Helper: inyecta botón de exportar PNG en esquina superior derecha de un contenedor
function _inyectarBtnExport(containerId, chartVarName, fileName) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var existing = container.querySelector('.mk-export-png-btn[data-chart="' + chartVarName + '"]');
    if (existing) return;
    var btnHtml = '<button class="mk-export-png-btn" data-chart="' + chartVarName + '" ' +
        'onclick="exportarGraficaPNG(window[\'' + chartVarName + '\'], \'' + fileName + '\')" ' +
        'title="Exportar como PNG" ' +
        'style="position:absolute;top:8px;right:8px;z-index:10;background:rgba(255,255,255,0.9);' +
        'border:1px solid #E5E7EB;border-radius:8px;padding:4px 8px;cursor:pointer;' +
        'font-size:14px;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.1);" ' +
        '>📥</button>';
    // Ensure container has position:relative for absolute positioning
    var parent = container.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }
    container.insertAdjacentHTML('afterbegin', btnHtml);
}

// ── MEJORA 1: Comparativa mes a mes con año anterior ────────────────────────
function initComparativaMeses() {
    const canvas = document.getElementById('comparativaMesesChart');
    if (!canvas) return;
    if (comparativaMesesChart) {
        try { comparativaMesesChart.destroy(); } catch(e) {}
        comparativaMesesChart = null;
    }
    const meses = [], ventas = [], gastos = [], ventasAnioAnterior = [];
    const now = new Date();
    const todasVentas = _getAllVentas();
    const todasGastos = window.expenses || [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mesStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        // Mismo mes pero un año antes
        const dAnio = new Date(d.getFullYear() - 1, d.getMonth(), 1);
        const mesStrAnio = `${dAnio.getFullYear()}-${String(dAnio.getMonth()+1).padStart(2,'0')}`;
        const label = d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        meses.push(label);
        // FIX 6: exclude cancelled orders from monthly chart
        ventas.push(todasVentas.filter(function(s){ return s.date && s.date.startsWith(mesStr) && s.method !== 'Cancelado' && s.metodo !== 'cancelado'; }).reduce(function(s,v){ return s+(Number(v.total)||0); }, 0));
        gastos.push(todasGastos.filter(function(e){ return e.date && e.date.startsWith(mesStr); }).reduce(function(s, e){ return s + (e.amount || 0); }, 0));
        ventasAnioAnterior.push(todasVentas.filter(function(s){ return s.date && s.date.startsWith(mesStrAnio) && s.method !== 'Cancelado' && s.metodo !== 'cancelado'; }).reduce(function(s,v){ return s+(Number(v.total)||0); }, 0));
    }

    comparativaMesesChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                { label: 'Ventas', data: ventas, backgroundColor: '#C5A572', borderRadius: 6 },
                { label: 'Gastos', data: gastos, backgroundColor: '#FCA5A5', borderRadius: 6 },
                { label: 'Ventas año anterior', data: ventasAnioAnterior, backgroundColor: 'rgba(197,165,114,0.45)', borderRadius: 6, hidden: true }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true, ticks: { callback: function(v){ return '$' + v.toLocaleString(); } } } }
        }
    });

    // Toggle "vs. año anterior"
    var chartWrapper = canvas.closest('div[style*="height"]') || canvas.parentElement;
    if (chartWrapper && !document.getElementById('toggleAnioAnterior')) {
        chartWrapper.insertAdjacentHTML('beforeend',
            '<div style="text-align:center;margin-top:8px;">' +
            '<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:#6B7280;">' +
            '<input type="checkbox" id="toggleAnioAnterior" ' +
            'onchange="(function(cb){if(comparativaMesesChart){comparativaMesesChart.data.datasets[2].hidden=!cb.checked;comparativaMesesChart.update();}})(this)" ' +
            'style="cursor:pointer;accent-color:#C5A572;"> 📅 vs. año anterior</label></div>'
        );
    }

    // MEJORA 5: Ticket promedio y métricas por mes
    _renderTicketPromedioStats(meses, ventas, todasVentas, now);

    // Exportar PNG
    var comparativaContainer = canvas.closest('div.bg-white') || canvas.parentElement;
    if (comparativaContainer && !comparativaContainer.id) comparativaContainer.id = 'comparativaContainer';
    comparativaContainer.style.position = 'relative';
    if (!comparativaContainer.querySelector('.mk-export-png-btn')) {
        comparativaContainer.insertAdjacentHTML('afterbegin',
            '<button class="mk-export-png-btn" ' +
            'onclick="exportarGraficaPNG(comparativaMesesChart, \'ventas-mensuales\')" ' +
            'title="Exportar como PNG" ' +
            'style="position:absolute;top:8px;right:8px;z-index:10;background:rgba(255,255,255,0.9);' +
            'border:1px solid #E5E7EB;border-radius:8px;padding:4px 8px;cursor:pointer;' +
            'font-size:14px;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.1);">📥</button>'
        );
    }

    // NTH: show best and worst month summary
    const monthlyTotals = meses.map(function(lbl, i) { return { label: lbl, total: ventas[i] }; });
    const hasData = monthlyTotals.some(function(m) { return m.total > 0; });
    var summaryEl = document.getElementById('mejorPeorMes');
    if (!summaryEl) {
        summaryEl = document.createElement('p');
        summaryEl.id = 'mejorPeorMes';
        summaryEl.className = 'text-sm text-center mt-2';
        canvas.parentElement.appendChild(summaryEl);
    }
    if (hasData) {
        const best  = monthlyTotals.reduce(function(a, b) { return a.total >= b.total ? a : b; });
        const worst = monthlyTotals.reduce(function(a, b) { return a.total <= b.total ? a : b; });
        summaryEl.innerHTML =
            '<span class="text-green-600 font-semibold">📈 Mejor: ' + best.label + ' ($' + best.total.toLocaleString('es-MX') + ')</span>' +
            '&nbsp;·&nbsp;' +
            '<span class="text-red-500 font-semibold">📉 Peor: ' + worst.label + ' ($' + worst.total.toLocaleString('es-MX') + ')</span>';
        summaryEl.style.display = '';
    } else {
        summaryEl.style.display = 'none';
    }
}

// ── MEJORA 5: Ticket promedio por mes ────────────────────────────────────────
function _renderTicketPromedioStats(meses, ventas, todasVentas, now) {
    var canvas = document.getElementById('comparativaMesesChart');
    if (!canvas) return;

    // Calcular pedidos por mes para ticket promedio
    var pedidosPorMes = [];
    for (var i = 5; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        var mesStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
        var pedidosMes = todasVentas.filter(function(s){
            return s.date && s.date.startsWith(mesStr) && s.method !== 'Cancelado' && s.metodo !== 'cancelado' && s.type !== 'abono' && s.type !== 'anticipo';
        });
        pedidosPorMes.push(pedidosMes.length);
    }

    // Mes actual (último en el array)
    var mesActualIdx = meses.length - 1;
    var totalMesActual = ventas[mesActualIdx] || 0;
    var pedidosMesActual = pedidosPorMes[mesActualIdx] || 0;
    var ticketPromedio = pedidosMesActual > 0 ? (totalMesActual / pedidosMesActual) : 0;

    // Mejor mes por revenue
    var bestIdx = ventas.reduce(function(maxIdx, v, idx) { return v > ventas[maxIdx] ? idx : maxIdx; }, 0);
    var bestMes = meses[bestIdx];
    var bestTotal = ventas[bestIdx];

    var statsId = 'ticketPromedioStats';
    var existingStats = document.getElementById(statsId);
    if (existingStats) existingStats.remove();

    var chartSection = canvas.closest('div.bg-white') || canvas.parentElement;
    if (!chartSection) return;

    var statsHtml = '<div id="' + statsId + '" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid #F3F4F6;">' +
        '<div style="flex:1;min-width:120px;background:#F9FAFB;border-radius:12px;padding:12px;text-align:center;">' +
        '<p style="font-size:11px;color:#9CA3AF;margin:0 0 4px;">Ticket promedio (mes)</p>' +
        '<p style="font-size:18px;font-weight:700;color:#1F2937;margin:0;">$' + ticketPromedio.toLocaleString('es-MX', {minimumFractionDigits:0, maximumFractionDigits:0}) + '</p>' +
        '</div>' +
        '<div style="flex:1;min-width:120px;background:#F9FAFB;border-radius:12px;padding:12px;text-align:center;">' +
        '<p style="font-size:11px;color:#9CA3AF;margin:0 0 4px;">Pedidos este mes</p>' +
        '<p style="font-size:18px;font-weight:700;color:#1F2937;margin:0;">' + pedidosMesActual + ' pedidos</p>' +
        '</div>' +
        '<div style="flex:1;min-width:120px;background:#F9FAFB;border-radius:12px;padding:12px;text-align:center;">' +
        '<p style="font-size:11px;color:#9CA3AF;margin:0 0 4px;">Mejor mes (6m)</p>' +
        '<p style="font-size:15px;font-weight:700;color:#059669;margin:0;">' + bestMes + ' · $' + bestTotal.toLocaleString('es-MX', {minimumFractionDigits:0, maximumFractionDigits:0}) + '</p>' +
        '</div>' +
        '</div>';

    chartSection.insertAdjacentHTML('beforeend', statsHtml);
}

// ── MEJORA 2: Top 10 productos más vendidos (por ingresos, todo el historial) ─
function initTopProductosChart() {
    const canvas = document.getElementById('topProductosChart');
    if (!canvas) return;
    if (topProductosChart) {
        try { topProductosChart.destroy(); } catch(e) {}
        topProductosChart = null;
    }

    // Agrupar por nombre: suma cantidad e ingresos (precio * cantidad)
    const prodMap = {};
    _getAllVentas().filter(function(s){ return s.type !== 'abono' && s.type !== 'anticipo'; }).forEach(function(s) {
        (s.products || []).forEach(function(p) {
            var nombre = p.name || p.nombre || '—';
            var qty = Number(p.quantity || p.cantidad || 1);
            var precio = Number(p.price || p.precio || 0);
            if (!prodMap[nombre]) prodMap[nombre] = { cantidad: 0, ingresos: 0 };
            prodMap[nombre].cantidad += qty;
            prodMap[nombre].ingresos += precio * qty;
        });
        // pedidos sin desglose de productos — usar concepto y total
        if (!(s.products||[]).length && s.concepto) {
            var k = s.concepto;
            if (!prodMap[k]) prodMap[k] = { cantidad: 0, ingresos: 0 };
            prodMap[k].cantidad += 1;
            prodMap[k].ingresos += Number(s.total || 0);
        }
    });

    // Top 10 por ingresos generados
    const top10 = Object.entries(prodMap)
        .sort(function(a, b) { return b[1].ingresos - a[1].ingresos; })
        .slice(0, 10);

    var canvasParent = canvas.parentElement;
    if (top10.length === 0) {
        canvasParent.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding-top:80px;font-size:14px;">Sin ventas registradas</p>';
        return;
    }

    topProductosChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: top10.map(function(e){ var n = e[0]; return n.length > 22 ? n.slice(0, 22) + '…' : n; }),
            datasets: [{
                label: 'Ingresos ($)',
                data: top10.map(function(e){ return e[1].ingresos; }),
                backgroundColor: '#8B5CF6',
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            var idx = ctx.dataIndex;
                            var entry = top10[idx];
                            return ['$' + entry[1].ingresos.toLocaleString('es-MX'), entry[1].cantidad + ' unidades'];
                        }
                    }
                }
            },
            scales: { x: { beginAtZero: true, ticks: { callback: function(v){ return '$' + v.toLocaleString(); } } } }
        }
    });

    // Botón exportar PNG
    var topContainer = canvas.closest('div.bg-white') || canvasParent;
    topContainer.style.position = 'relative';
    if (!topContainer.querySelector('.mk-export-png-btn')) {
        topContainer.insertAdjacentHTML('afterbegin',
            '<button class="mk-export-png-btn" ' +
            'onclick="exportarGraficaPNG(topProductosChart, \'top-10-productos\')" ' +
            'title="Exportar como PNG" ' +
            'style="position:absolute;top:8px;right:8px;z-index:10;background:rgba(255,255,255,0.9);' +
            'border:1px solid #E5E7EB;border-radius:8px;padding:4px 8px;cursor:pointer;' +
            'font-size:14px;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.1);">📥</button>'
        );
    }
}

// ── MEJORA 3: Margen de utilidad por categoría ───────────────────────────────
function initMargenCategoriaChart() {
    // Inyectar canvas si no existe
    if (!document.getElementById('margenCategoriaCanvas')) {
        var reportesSection = document.getElementById('reportes-section');
        if (!reportesSection) return;
        // Buscar el grid de gráficas para insertar el nuevo bloque
        var gridRef = document.querySelector('#reportes-section .grid.grid-cols-1.lg\\:grid-cols-2');
        var insertTarget = gridRef || reportesSection.querySelector('.grid') || reportesSection;
        insertTarget.insertAdjacentHTML('beforeend',
            '<div id="margenCategoriaWrap" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100" style="position:relative;">' +
            '<h3 style="font-size:18px;font-weight:700;color:#1F2937;margin-bottom:16px;">📊 Margen por categoría</h3>' +
            '<div style="height:280px;position:relative;">' +
            '<canvas id="margenCategoriaCanvas"></canvas>' +
            '</div></div>'
        );
    }

    var canvas = document.getElementById('margenCategoriaCanvas');
    if (!canvas) return;

    if (margenCategoriaChart) {
        try { margenCategoriaChart.destroy(); } catch(e) {}
        margenCategoriaChart = null;
    }

    var cats = window.categories || [];
    var productos = window.products || [];
    var labels = [], datos = [], colores = [];

    cats.forEach(function(cat) {
        var prods = productos.filter(function(p) {
            return p.category === cat.id && Number(p.price||0) > 0 && Number(p.cost||0) > 0;
        });
        if (prods.length === 0) return;
        var margenTotal = prods.reduce(function(sum, p) {
            return sum + ((Number(p.price) - Number(p.cost)) / Number(p.price) * 100);
        }, 0);
        var margenProm = margenTotal / prods.length;
        labels.push(cat.name || 'Sin nombre');
        datos.push(parseFloat(margenProm.toFixed(1)));
        // Color por umbral
        if (margenProm >= 40) colores.push('#10B981');       // verde
        else if (margenProm >= 20) colores.push('#F59E0B');  // amarillo
        else colores.push('#EF4444');                         // rojo
    });

    // Fallback: si no hay categorías definidas, agrupar por campo category de products
    if (labels.length === 0) {
        var catMap = {};
        productos.forEach(function(p) {
            if (Number(p.price||0) <= 0 || Number(p.cost||0) <= 0) return;
            var k = String(p.category || 'Sin categoría');
            if (!catMap[k]) catMap[k] = [];
            catMap[k].push((Number(p.price) - Number(p.cost)) / Number(p.price) * 100);
        });
        Object.entries(catMap).forEach(function(entry) {
            var k = entry[0], arr = entry[1];
            var prom = arr.reduce(function(s,v){ return s+v; }, 0) / arr.length;
            labels.push(k);
            datos.push(parseFloat(prom.toFixed(1)));
            colores.push(prom >= 40 ? '#10B981' : prom >= 20 ? '#F59E0B' : '#EF4444');
        });
    }

    var ctx = canvas.getContext('2d');
    if (labels.length === 0) {
        ctx.font = '14px Inter'; ctx.fillStyle = '#9CA3AF'; ctx.textAlign = 'center';
        ctx.fillText('Sin datos de categorías con costo y precio', canvas.width / 2, canvas.height / 2);
        return;
    }

    margenCategoriaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Margen promedio (%)',
                data: datos,
                backgroundColor: colores,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) { return ctx.parsed.y + '% margen'; }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: function(v){ return v + '%'; } }
                }
            }
        }
    });

    // Botón exportar PNG
    var wrap = document.getElementById('margenCategoriaWrap');
    if (wrap && !wrap.querySelector('.mk-export-png-btn')) {
        wrap.insertAdjacentHTML('afterbegin',
            '<button class="mk-export-png-btn" ' +
            'onclick="exportarGraficaPNG(margenCategoriaChart, \'margen-por-categoria\')" ' +
            'title="Exportar como PNG" ' +
            'style="position:absolute;top:8px;right:8px;z-index:10;background:rgba(255,255,255,0.9);' +
            'border:1px solid #E5E7EB;border-radius:8px;padding:4px 8px;cursor:pointer;' +
            'font-size:14px;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.1);">📥</button>'
        );
    }
}
window.initMargenCategoriaChart = initMargenCategoriaChart;

function initReports() {
    updateInventoryStats();
    renderTopProducts();
    renderSalesHistory();
    updateMonthlyStats();
    updatePaymentMethods();
    renderValorInventario();
    initComparativaMeses();
    initTopProductosChart();
    initMargenCategoriaChart();
}

function updateInventoryStats() {
    const inventoryValue = (window.products||[]).reduce((sum, p) => sum + ((Number(p.cost) || 0) * (Number(p.stock) || 0)), 0);
    const activeProducts = (window.products||[]).filter(p => p.stock > 0).length;
    const lowStockCount = (window.products||[]).filter(p => {
        const s = typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (p.stock||0);
        return s > 0 && s <= (p.stockMin||5);
    }).length;
    const el = id => document.getElementById(id);
    if (el('inventoryValue'))  el('inventoryValue').textContent  = `$${inventoryValue.toFixed(2)}`;
    if (el('activeProducts'))  el('activeProducts').textContent  = activeProducts;
    if (el('lowStockCount'))   el('lowStockCount').textContent   = lowStockCount;
}

function updateMonthlyStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear  = now.getFullYear();
    // FIX 6: exclude cancelled orders from monthly stats
    const mesStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}`;
    const _allV = _getAllVentas().filter(function(s) {
        if (!s.date || s.type === 'abono' || s.type === 'anticipo') return false;
        if (s.method === 'Cancelado' || s.metodo === 'cancelado') return false;
        return s.date && String(s.date).startsWith(mesStr);
    });
    const monthlySales = _allV.reduce(function(sum,s){ return sum + Number(s.total||0); }, 0);
    const monthlyUnits = _allV.reduce(function(sum,s){
        return sum + (s.products||[]).reduce(function(a,p){ return a+Number(p.quantity||1); }, 0);
    }, 0);
    // FIX: calculate real costs from sale items instead of hardcoded 40%
    const monthlyCosts = _allV.reduce(function(total, sale) {
        var items = sale.items || sale.products || sale.productos || [];
        var saleCost = items.reduce(function(s, item) {
            return s + (Number(item.costoAlVender != null ? item.costoAlVender : (item.cost != null ? item.cost : (item.costo != null ? item.costo : 0))) * (Number(item.quantity || item.cantidad || 1)));
        }, 0);
        return total + saleCost;
    }, 0);
    const monthlyProfit = monthlySales - monthlyCosts;
    const el = id => document.getElementById(id);
    if (el('monthlySales'))     el('monthlySales').textContent     = `$${monthlySales.toFixed(2)}`;
    if (el('monthlyProfit'))    el('monthlyProfit').textContent    = `$${monthlyProfit.toFixed(2)}`;
    if (el('monthlyUnitsSold')) el('monthlyUnitsSold').textContent = `${monthlyUnits} unidades`;
}

function updatePaymentMethods() {
    const _pmVentas = _getAllVentas().filter(function(s){ return s.type !== 'abono' && s.type !== 'anticipo'; });
    const el        = id => document.getElementById(id);
    // BM-08 FIX: usar suma de montos en lugar de conteo de transacciones
    const totalMonto = _pmVentas.reduce(function(s, v){ return s + Number(v.total || v.amount || v.monto || 0); }, 0);
    if (totalMonto === 0) {
        if (el('cashPercentage'))     el('cashPercentage').textContent     = '0%';
        if (el('cardPercentage'))     el('cardPercentage').textContent     = '0%';
        if (el('transferPercentage')) el('transferPercentage').textContent = '0%';
        return;
    }
    const montoMetodo = function(m) {
        return _pmVentas
            .filter(function(s){ return s.method === m || s.paymentMethod === m; })
            .reduce(function(s, v){ return s + Number(v.total || v.amount || v.monto || 0); }, 0);
    };
    const pct = function(m) { return ((montoMetodo(m) / totalMonto) * 100).toFixed(0) + '%'; };
    if (el('cashPercentage'))     el('cashPercentage').textContent     = pct('Efectivo');
    if (el('cardPercentage'))     el('cardPercentage').textContent     = pct('Tarjeta');
    if (el('transferPercentage')) el('transferPercentage').textContent = pct('Transferencia');
}

function renderTopProducts() {
    const el = document.getElementById('topProductsList');
    if (!el) return;
    const _todasVentas = _getAllVentas().filter(function(s){ return s.type !== 'abono' && s.type !== 'anticipo'; });
    if (_todasVentas.length === 0) {
        el.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">No hay ventas registradas aún</p>';
        return;
    }

    // Índice de productos por id y por nombre para verificar tipo
    const prodIdx = {};
    (window.products || []).forEach(function(p) {
        if (p.id)   prodIdx['id:' + String(p.id)]             = p.tipo || 'producto';
        if (p.name) prodIdx['name:' + (p.name||'').toLowerCase()] = p.tipo || 'producto';
    });
    function esMPOServicio(item) {
        var tipoById   = item.id   ? prodIdx['id:'   + String(item.id)]                    : null;
        var tipoByName = item.name ? prodIdx['name:' + (item.name||'').toLowerCase()] : null;
        var tipo = tipoById || tipoByName;
        return tipo === 'materia_prima' || tipo === 'servicio';
    }

    const productSales = {};
    _todasVentas.forEach(function(sale) {
        (sale.products || []).forEach(function(item) {
            if (esMPOServicio(item)) return; // excluir materias primas y servicios
            var k = item.name || item.id || '?';
            if (!productSales[k]) productSales[k] = { name: item.name||k, sales: 0, revenue: 0 };
            productSales[k].sales   += Number(item.quantity||1);
            productSales[k].revenue += Number(item.price||0) * Number(item.quantity||1);
        });
        // pedidos sin desglose de productos — usar concepto del pedido
        if (!(sale.products||[]).length && sale.concepto) {
            var k = sale.concepto;
            if (!productSales[k]) productSales[k] = { name: k, sales: 0, revenue: 0 };
            productSales[k].sales   += 1;
            productSales[k].revenue += Number(sale.total||0);
        }
    });
    const top = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
    el.innerHTML = top.map((p, i) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm" style="background:#C5A572;">${i+1}</div>
                <div>
                    <p class="font-semibold text-gray-800">${_esc(p.name)}</p>
                    <p class="text-xs text-gray-500">${p.sales} vendidos</p>
                </div>
            </div>
            <span class="font-bold text-gray-800">$${p.revenue.toFixed(0)}</span>
        </div>`).join('') || '<p class="text-gray-400 text-sm text-center py-4">Sin datos disponibles</p>';
}

let categoryChartMode = 'inventario';

function switchCategoryTab(mode) {
    categoryChartMode = mode;
    const btnInv = document.getElementById('tabCatInventario');
    const btnVen = document.getElementById('tabCatVentas');
    const title  = document.getElementById('categoryChartTitle');
    if (mode === 'inventario') {
        if (btnInv) btnInv.className = 'px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border-2 border-amber-400';
        if (btnVen) btnVen.className = 'px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-gray-500 border-2 border-gray-200';
        if (title)  title.textContent = 'Inventario por Categoría';
    } else {
        if (btnVen) btnVen.className = 'px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border-2 border-amber-400';
        if (btnInv) btnInv.className = 'px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-gray-500 border-2 border-gray-200';
        if (title)  title.textContent = 'Ventas por Categoría';
    }
    initCategoryChart();
}

function initCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (typeof categoryChart !== 'undefined' && categoryChart) { categoryChart.destroy(); categoryChart = null; }

    let labels = [], data = [];
    if (categoryChartMode === 'inventario') {
        (window.categories||[]).forEach(cat => {
            const prods = (window.products||[]).filter(p => p.category === cat.id && p.stock > 0);
            const valor = prods.reduce((s, p) => s + (Number(p.cost)||0)*(Number(p.stock)||0), 0);
            if (valor > 0) { labels.push(cat.name); data.push(valor); }
        });
    } else {
        const catMap = {};
        _getAllVentas().forEach(sale => {
            (sale.products||[]).forEach(item => {
                const prod = (window.products||[]).find(p => String(p.id)===String(item.id)||p.name===item.name);
                const cat  = (window.categories||[]).find(c => c.id === (prod ? prod.category : null));
                const nom  = cat ? cat.name : 'Sin categoría';
                catMap[nom] = (catMap[nom]||0) + (item.price * item.quantity);
            });
        });
        Object.entries(catMap).forEach(([n, v]) => { if (v > 0) { labels.push(n); data.push(v); } });
    }

    if (labels.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Inter'; ctx.fillStyle = '#9CA3AF'; ctx.textAlign = 'center';
        ctx.fillText(categoryChartMode==='inventario' ? 'Sin productos en inventario' : 'Sin ventas registradas', canvas.width/2, canvas.height/2);
        return;
    }
    const defColors = ['#C5A572','#10B981','#3B82F6','#8B5CF6','#EF4444','#F59E0B','#EC4899','#06B6D4'];
    const chartColors = labels.map((lbl, i) => {
        const cat = (window.categories||[]).find(c => c.name === lbl);
        return (cat && cat.color) ? cat.color : defColors[i % defColors.length];
    });
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: chartColors }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } } }
        }
    });

    // MEJORA 4: Botón exportar PNG para gráfica de categorías
    var catContainer = canvas.closest('div.bg-white') || canvas.parentElement;
    if (catContainer) {
        catContainer.style.position = 'relative';
        if (!catContainer.querySelector('.mk-export-png-btn')) {
            catContainer.insertAdjacentHTML('afterbegin',
                '<button class="mk-export-png-btn" ' +
                'onclick="exportarGraficaPNG(categoryChart, \'categoria-' + categoryChartMode + '\')" ' +
                'title="Exportar como PNG" ' +
                'style="position:absolute;top:8px;right:8px;z-index:10;background:rgba(255,255,255,0.9);' +
                'border:1px solid #E5E7EB;border-radius:8px;padding:4px 8px;cursor:pointer;' +
                'font-size:14px;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.1);">📥</button>'
            );
        }
    }
}

// ── Historial de ventas ───────────────────────────────────────────────────
let salesHistoryPage = 1;
const SALES_PAGE_SIZE = 20;

function limpiarFiltroFechas() {
    const d = document.getElementById('reporteFechaDesde');
    const h = document.getElementById('reporteFechaHasta');
    if (d) d.value = '';
    if (h) h.value = '';
    salesHistoryPage = 1;
    renderSalesHistory();
}
window.limpiarFiltroFechas = limpiarFiltroFechas;

function eliminarVentaHistorial(idOrIdx) {
    const _v     = (window.salesHistory||[]).find(s => s.id === idOrIdx) || (typeof idOrIdx==='number' ? (window.salesHistory||[])[idOrIdx] : null);
    const _folio = _v ? (_v.folio||`Venta #${idOrIdx}`) : `Venta #${idOrIdx}`;
    const _total = _v ? ` por $${(_v.total||0).toFixed(2)}` : '';
    const _cli   = _v && _v.customer ? ` de ${_v.customer}` : '';
    showConfirm(`¿Eliminar ${_folio}${_cli}${_total}?\n\nEsta acción no se puede deshacer y puede afectar los reportes.`, '🗑️ Eliminar venta del historial').then(ok => {
        if (!ok) return;
        let venta = (window.salesHistory||[]).find(s => s.id === idOrIdx);
        if (!venta && typeof idOrIdx==='number') venta = (window.salesHistory||[])[idOrIdx];
        if (venta && venta.folio) {
            window.pedidosFinalizados = (window.pedidosFinalizados||[]).filter(p => p.folio !== venta.folio);
            if (typeof savePedidosFinalizados === 'function') savePedidosFinalizados();
        }
        const idx = (window.salesHistory||[]).findIndex(s => s.id === idOrIdx);
        if (idx !== -1) window.salesHistory.splice(idx, 1);
        else if (typeof idOrIdx==='number') window.salesHistory.splice(idOrIdx, 1);
        if (typeof saveSalesHistory === 'function') saveSalesHistory();
        renderSalesHistory();
        manekiToastExport('🗑️ Venta eliminada del historial', 'ok');
    });
}
window.eliminarVentaHistorial = eliminarVentaHistorial;

function renderSalesHistory() {
    const tbody = document.getElementById('salesHistoryTable');
    if (!tbody) return;
    const query      = (document.getElementById('salesSearchInput')||{}).value?.trim().toLowerCase() || '';
    const fechaDesde = (document.getElementById('reporteFechaDesde')||{}).value || '';
    const fechaHasta = (document.getElementById('reporteFechaHasta')||{}).value || '';

    const allSales = _getAllVentas().filter(s => s.type !== 'anticipo').slice().reverse();
    const filtered = allSales.filter((sale, i) => {
        const customer = (sale.customer || 'cliente general').toLowerCase();
        const folio    = (sale.folio || sale.id || String((window.salesHistory||[]).length - i)).toLowerCase();
        return (!query || customer.includes(query) || folio.includes(query)) &&
               (!fechaDesde || sale.date >= fechaDesde) &&
               (!fechaHasta || sale.date <= fechaHasta);
    });

    const total      = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / SALES_PAGE_SIZE));
    if (salesHistoryPage > totalPages) salesHistoryPage = totalPages;
    if (salesHistoryPage < 1) salesHistoryPage = 1;

    const start     = (salesHistoryPage - 1) * SALES_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + SALES_PAGE_SIZE);

    const countEl = document.getElementById('salesHistoryCount');
    if (countEl) countEl.textContent = total > 0 ? `${total} venta${total!==1?'s':''}` : '';

    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="mk-empty" style="padding:40px 24px;">
            <div class="mk-empty-icon">🧾</div>
            <p class="mk-empty-title">Sin ventas en este período</p>
            <p class="mk-empty-sub">Registra una venta desde el Punto de Venta para verla aquí.</p>
        </div></td></tr>`;
    } else {
        const typeColors  = { abono:'text-yellow-600 bg-yellow-50', pedido:'text-purple-600 bg-purple-50', pos:'text-green-600 bg-green-50' };
        const typeLabels  = { abono:'Abono', pedido:'Pedido', pos:'POS' };
        tbody.innerHTML = pageItems.map(sale => {
            const t   = sale.type || 'pos';
            const tag = `<span class="text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[t]||typeColors.pos}">${typeLabels[t]||'POS'}</span>`;
            const mc  = sale.method==='Efectivo' ? 'text-green-600' : sale.method==='Tarjeta' ? 'text-blue-600' : 'text-purple-600';
            return `<tr class="hover:bg-amber-50 transition-colors">
                <td class="px-6 py-3 text-gray-800 text-sm">${sale.date}${sale.time?'<br><span class="text-xs text-gray-400">'+sale.time+'</span>':''}</td>
                <td class="px-6 py-3"><p class="text-gray-800 font-medium">${_esc(sale.customer||'Cliente General')}</p>${tag}</td>
                <td class="px-6 py-3 text-gray-600 text-sm">${(sale.products||[]).length} item(s)</td>
                <td class="px-6 py-3"><span class="text-sm ${mc}">${sale.method||'-'}</span></td>
                <td class="px-6 py-3 text-gray-800 font-bold">$${Number(sale.total||0).toFixed(2)}</td>
                <td class="px-6 py-3 text-center flex gap-2 justify-center">
                    <button onclick="abrirDetalleSaleById('${sale.id}')" style="background:#F5EDD8;border:none;cursor:pointer;padding:6px 12px;border-radius:8px;font-size:16px;" title="Ver detalle">👁️</button>
                    <button onclick="eliminarVentaHistorial('${sale.id}')" style="background:#FEE2E2;border:none;cursor:pointer;padding:6px 12px;border-radius:8px;font-size:16px;" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }

    const pageInfo  = document.getElementById('salesPageInfo');
    const btnPrev   = document.getElementById('btnSalesPrev');
    const btnNext   = document.getElementById('btnSalesNext');
    const pagEl     = document.getElementById('salesHistoryPagination');
    if (pageInfo) pageInfo.textContent = totalPages>1 ? `Página ${salesHistoryPage} de ${totalPages}` : '';
    if (btnPrev)  btnPrev.disabled = salesHistoryPage<=1;
    if (btnNext)  btnNext.disabled = salesHistoryPage>=totalPages;
    if (pagEl)    pagEl.style.display = totalPages>1 ? 'flex' : 'none';
}
window.renderSalesHistory = renderSalesHistory;

// ── Navegación entre secciones ─────────────────────────────────────────────
function showSection(sectionName) {
    localStorage.setItem('maneki_activeSection', sectionName);

    if (sectionName !== 'bienvenida' && window._bienvenidaClock) {
        clearInterval(window._bienvenidaClock); window._bienvenidaClock = null;
    }
    // MEJ-07: _dashClock es el reloj del dashboard; destruirlo al salir para evitar
    // work innecesario en el hilo principal mientras el dashboard no está visible.
    // Se reinicia automáticamente cuando _updateDashboardImpl() se llama al volver.
    if (sectionName !== 'dashboard' && window._dashClock) {
        clearInterval(window._dashClock); window._dashClock = null;
    }

    document.querySelectorAll('main > section, section').forEach(s => {
        s.classList.add('hidden'); s.style.animation = '';
    });

    const target = document.getElementById(`${sectionName}-section`);
    if (target) {
        target.classList.remove('hidden');
        void target.offsetWidth;
        target.style.animation = 'mkSectionIn 0.38s cubic-bezier(0.16,1,0.3,1) both';
    }

    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const sidebarBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (sidebarBtn) {
        sidebarBtn.classList.add('active');
        sidebarBtn.animate([{background:'rgba(197,151,59,0.35)'},{background:'rgba(197,151,59,0.20)'}],{duration:400,easing:'ease-out'});
    }

    if (window.innerWidth < 768) document.getElementById('sidebar')?.classList.add('collapsed');

    if (sectionName === 'reportes') {
        salesHistoryPage = 1;
        const si = document.getElementById('salesSearchInput'); if (si) si.value = '';
        setTimeout(() => {
            initCategoryChart();
            renderSalesHistory();
            initComparativaMeses();
            initTopProductosChart();
            initMargenCategoriaChart();
        }, 150);
    }
    if (sectionName === 'analisis')   setTimeout(() => { if (typeof renderAnalisis === 'function') renderAnalisis(); }, 100);
    if (sectionName === 'equipos') {
        const pctInput = document.getElementById('roiPorcentajeGlobal');
        if (pctInput && typeof roiConfig !== 'undefined') pctInput.value = roiConfig.porcentaje;
        if (typeof renderEquiposGrid   === 'function') renderEquiposGrid();
        if (typeof renderRoiHistorial  === 'function') renderRoiHistorial();
        setTimeout(() => { if (typeof renderGraficaROI === 'function') renderGraficaROI(); }, 300);
    }
    if (sectionName === 'dashboard')  setTimeout(() => { if (typeof renderTopClientes === 'function') renderTopClientes(); }, 300);
    if (sectionName === 'bienvenida') if (typeof renderBienvenida === 'function') renderBienvenida();
    if (sectionName === 'pos')        setTimeout(() => { const s = document.getElementById('searchProduct'); if (s) s.focus(); }, 200);
    if (sectionName === 'inventory')  setTimeout(() => { const s = document.getElementById('inventorySearch'); if (s) s.focus(); }, 200);
    if (sectionName === 'clientes')   if (typeof renderClientsTable  === 'function') renderClientsTable();
    if (sectionName === 'categorias') if (typeof renderCategoriesGrid === 'function') renderCategoriesGrid();
}
window.showSection = showSection;

// ── Flush queue: si showSection fue llamado antes de que cargara este módulo ──
(function(){
    var realFn = showSection;
    var queue  = window._showSectionQueue || [];
    window._showSectionStub = false;
    // Ejecutar sólo la última llamada encolada (la más reciente es la que importa)
    if (queue.length) {
        var last = queue[queue.length - 1];
        try { realFn(last); } catch(e) {}
    }
    window._showSectionQueue = [];
})();

window.safeCall = function(fn, ...args) {
    if (typeof window[fn] === 'function') window[fn](...args);
    else document.addEventListener('DOMContentLoaded', () => { if (typeof window[fn] === 'function') window[fn](...args); });
};

// ── Mobile menu ────────────────────────────────────────────────────────────
function setupMobileMenu() {
    document.getElementById('openSidebar')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.remove('collapsed');
        const btn = document.getElementById('openSidebar');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    });
    document.getElementById('closeSidebar')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.add('collapsed');
        const btn = document.getElementById('openSidebar');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

// ── Gráfica de ventas 7 días ───────────────────────────────────────────────
function initChart() {
    const last7Days = [];
    const salesByDay = {};
    const _fl = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    for (let i = 6; i >= 0; i--) {
        const date = new Date(); date.setDate(date.getDate() - i);
        const dateStr = _fl(date); // FIX: fecha local, no UTC
        last7Days.push(dateStr); salesByDay[dateStr] = 0;
    }
    const _idsContados = new Set();
    // Fuente 1: salesHistory (excluir anticipos/abonos para evitar doble conteo)
    (window.salesHistory||[]).forEach(sale => {
        if (salesByDay.hasOwnProperty(sale.date) && sale.method !== 'Cancelado'
            && sale.type !== 'anticipo' && sale.type !== 'abono') {
            salesByDay[sale.date] += Number(sale.total || 0);
        }
        if (sale.id) _idsContados.add(String(sale.id));
    });
    // Fuente 2: pagos directos en pedidos (sin doble conteo)
    [...(window.pedidos||[]), ...(window.pedidosFinalizados||[])].forEach(p => {
        (p.pagos||[]).forEach(ab => {
            if (!ab.id || _idsContados.has(String(ab.id))) return;
            const fecha = (ab.fecha||'').split('T')[0];
            if (salesByDay.hasOwnProperty(fecha)) {
                salesByDay[fecha] += Number(ab.monto || 0);
                _idsContados.add(String(ab.id));
            }
        });
    });
    const labels = last7Days.map(d => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(d + 'T12:00:00').getDay()]);
    const data   = last7Days.map(d => salesByDay[d]);
    const ctx    = document.getElementById('salesChart')?.getContext('2d');
    if (!ctx) return;
    if (typeof salesWeekChart !== 'undefined' && salesWeekChart) { salesWeekChart.destroy(); salesWeekChart = null; }
    salesWeekChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label:'Ventas ($)', data, backgroundColor:'rgba(197,165,114,0.8)', borderRadius:8, borderSkipped:false }] },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero:true, grid:{color:'rgba(0,0,0,0.05)'} }, x: { grid:{display:false} } }
        }
    });

    // MEJORA 4: Botón exportar PNG para gráfica semanal del dashboard
    var salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas) {
        var salesContainer = salesChartCanvas.closest('div.bg-white') || salesChartCanvas.parentElement;
        if (salesContainer) {
            salesContainer.style.position = 'relative';
            if (!salesContainer.querySelector('.mk-export-png-btn')) {
                salesContainer.insertAdjacentHTML('afterbegin',
                    '<button class="mk-export-png-btn" ' +
                    'onclick="exportarGraficaPNG(salesWeekChart, \'ventas-7-dias\')" ' +
                    'title="Exportar como PNG" ' +
                    'style="position:absolute;top:8px;right:8px;z-index:10;background:rgba(255,255,255,0.9);' +
                    'border:1px solid #E5E7EB;border-radius:8px;padding:4px 8px;cursor:pointer;' +
                    'font-size:14px;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.1);">📥</button>'
                );
            }
        }
    }
}

// ── Search filter (POS) ────────────────────────────────────────────────────
function setupSearchFilter() {
    const input = document.getElementById('searchProduct');
    if (!input) return;
    input.addEventListener('input', function() {
        clearTimeout(window._posSearchTimeout);
        window._posSearchTimeout = setTimeout(() => { if (typeof renderProducts === 'function') renderProducts(); }, 180);
    });
}

// ── Descargar CSV de ventas ────────────────────────────────────────────────
function descargarReporteVentas() {
    const _csvVentas = _getAllVentas();
    if (!_csvVentas.length) { manekiToastExport('No hay ventas para exportar.','warn'); return; }
    const headers = ['Folio','Fecha','Hora','Cliente','Tipo','Productos','Total','Método'];
    const rows = _csvVentas.map(s => [
        s.folio||s.id, s.date, s.time||'',
        `"${s.customer}"`,
        s.type==='abono'?'Abono':s.type==='pedido'?'Pedido':'POS',
        `"${(s.products||[]).map(p=>`${p.name} x${p.quantity}`).join('; ')}"`,
        s.total.toFixed(2), s.method||''
    ]);
    const csv  = [headers.join(','),...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `Reporte_Ventas_Maneki_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
}
window.descargarReporteVentas = descargarReporteVentas;

// ── Modal detalle de venta ─────────────────────────────────────────────────
const tipos = { abono:'Abono', pedido:'Pedido', pos:'Venta POS' };

function abrirDetalleSale(idx) {
    const sale = (window.salesHistory||[])[idx];
    if (!sale) return;
    _renderDetalleSale(sale, idx);
}
window.abrirDetalleSale = abrirDetalleSale;

function abrirDetalleSaleById(id) {
    const allSales = window.salesHistory || [];
    const idx = allSales.findIndex(s => String(s.id) === String(id));
    if (idx === -1) { manekiToastExport('Venta no encontrada','err'); return; }
    _renderDetalleSale(allSales[idx], idx);
}
window.abrirDetalleSaleById = abrirDetalleSaleById;

function _renderDetalleSale(sale, idx) {
    const tipo = sale.type || 'pos';
    const el   = id => document.getElementById(id);
    if (el('detalleSaleFolio')) el('detalleSaleFolio').textContent = sale.folio || ('Venta #'+(idx+1));
    if (el('detalleSaleTipo'))  el('detalleSaleTipo').textContent  = tipos[tipo] || 'Venta';
    if (el('detalleSaleFecha')) el('detalleSaleFecha').textContent = sale.date + (sale.time?' · '+sale.time:'');
    if (el('detalleSaleMetodo')) el('detalleSaleMetodo').textContent = sale.method || '—';
    if (el('detalleSaleCliente')) el('detalleSaleCliente').textContent = sale.customer || 'Cliente General';

    const telBox   = el('detalleSaleTelBox');
    const redesBox = el('detalleSaleRedesBox');
    if (telBox)   { if(sale.telefono){telBox.classList.remove('hidden');   el('detalleSaleTel')?.setAttribute  &&(el('detalleSaleTel').textContent=sale.telefono);}  else telBox.classList.add('hidden'); }
    if (redesBox) { if(sale.redes)   {redesBox.classList.remove('hidden'); if(el('detalleSaleRedes'))el('detalleSaleRedes').textContent=sale.redes;} else redesBox.classList.add('hidden'); }

    const conceptoBox = el('detalleSaleConceptoBox');
    const conceptoTxt = [sale.concept, sale.notas].filter(Boolean).join(' · ');
    if (conceptoBox) {
        if (conceptoTxt) { conceptoBox.classList.remove('hidden'); if(el('detalleSaleConcepto'))el('detalleSaleConcepto').textContent=conceptoTxt; }
        else conceptoBox.classList.add('hidden');
    }

    const prods = sale.products || [];
    if (el('detalleSaleProductos')) {
        el('detalleSaleProductos').innerHTML = prods.length > 0
            ? prods.map(p => {
                const qty = Number(p.quantity||p.qty||1);
                const prc = Number(p.price||p.subtotal||0);
                return `<tr>
                    <td class="px-4 py-2 text-gray-800 text-sm">${_esc(p.name||p.concept||'—')}</td>
                    <td class="px-4 py-2 text-center text-gray-600 text-sm">${qty}</td>
                    <td class="px-4 py-2 text-right text-gray-600 text-sm">$${prc.toFixed(2)}</td>
                    <td class="px-4 py-2 text-right text-gray-800 font-semibold text-sm">$${(prc*qty).toFixed(2)}</td>
                </tr>`;
            }).join('')
            : '<tr><td colspan="4" class="px-4 py-4 text-center text-gray-400 text-sm">Sin productos registrados</td></tr>';
    }

    if (el('detalleSaleSubtotal')) el('detalleSaleSubtotal').textContent = '$'+Number(sale.subtotal||sale.total||0).toFixed(2);
    const desc = Number(sale.discount||0), tax = Number(sale.tax||0);
    const descRow = el('detalleSaleDescRow'), taxRow = el('detalleSaleTaxRow');
    if (descRow) { descRow.classList.toggle('hidden',!desc); if(desc&&el('detalleSaleDesc'))el('detalleSaleDesc').textContent='-$'+desc.toFixed(2); }
    if (taxRow)  { taxRow.classList.toggle ('hidden',!tax);  if(tax&&el('detalleSaleTax'))  el('detalleSaleTax').textContent ='$' +tax.toFixed(2); }
    if (el('detalleSaleTotal')) el('detalleSaleTotal').textContent = '$'+Number(sale.total||0).toFixed(2);

    if (typeof openModal === 'function') openModal('detalleSaleModal');
}

function cerrarDetalleSale() {
    if (typeof closeModal === 'function') closeModal('detalleSaleModal');
}
window.cerrarDetalleSale = cerrarDetalleSale;

// ── Sincronizar variables globales ─────────────────────────────────────────
function _syncWindowVars() {
    window.products     = typeof products     !== 'undefined' ? products     : window.products     || [];
    window.clients      = typeof clients      !== 'undefined' ? clients      : window.clients      || [];
    window.salesHistory = typeof salesHistory !== 'undefined' ? salesHistory : window.salesHistory || [];
    window.pedidos      = typeof pedidos      !== 'undefined' ? pedidos      : window.pedidos      || [];
    window.quotes       = typeof quotes       !== 'undefined' ? quotes       : window.quotes       || [];
    window.incomes      = typeof incomes      !== 'undefined' ? incomes      : window.incomes      || [];
    window.expenses     = typeof expenses     !== 'undefined' ? expenses     : window.expenses     || [];
    window.receivables  = typeof receivables  !== 'undefined' ? receivables  : window.receivables  || [];
    window.payables     = typeof payables     !== 'undefined' ? payables     : window.payables     || [];
    window.categories   = typeof categories   !== 'undefined' ? categories   : window.categories   || [];
    window.notas        = typeof notas        !== 'undefined' ? notas        : window.notas        || [];
}
window._syncWindowVars = _syncWindowVars;

// ── Parchar save* para mantener window.* sincronizado ─────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Parchamos solo si las funciones originales existen y aún no están parchadas
    ['saveProducts','saveClients','saveSalesHistory','savePedidos','saveCategories'].forEach(fnName => {
        if (typeof window[fnName] === 'function' && !window[fnName]._synced) {
            const orig = window[fnName];
            window[fnName] = function() { orig.apply(this, arguments); _syncWindowVars(); };
            window[fnName]._synced = true;
        }
    });
});

// ── Análisis de productos ──────────────────────────────────────────────────
let analisisPeriodoActual = 'mes';

function setAnalisisPeriodo(periodo) {
    analisisPeriodoActual = periodo;
    document.querySelectorAll('.analisis-periodo-btn').forEach(b => {
        b.className = 'analisis-periodo-btn px-4 py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-600 bg-white';
    });
    const btnMap = { mes:'btnPeriodoMes', '30':'btnPeriodo30', '90':'btnPeriodo90', todo:'btnPeriodoTodo', custom:'btnPeriodoCustom' };
    const activeBtn = document.getElementById(btnMap[periodo]);
    if (activeBtn) activeBtn.className = 'analisis-periodo-btn px-4 py-2 rounded-xl text-sm font-semibold border-2 border-amber-400 text-amber-700 bg-amber-50';
    const customDiv = document.getElementById('analisisCustomFechas');
    if (customDiv) customDiv.classList.toggle('hidden', periodo !== 'custom');
    renderAnalisis();
}
window.setAnalisisPeriodo = setAnalisisPeriodo;

function getAnalisisFechas() {
    const hoy = new Date();
    const _fh = typeof _fechaHoy === 'function' ? _fechaHoy : () => hoy.toISOString().split('T')[0];
    const hoyStr = _fh();
    if (analisisPeriodoActual === 'mes') {
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const _fp = `${primerDia.getFullYear()}-${String(primerDia.getMonth()+1).padStart(2,'0')}-01`;
        return { desde: _fp, hasta: hoyStr, label: 'Este mes' };
    }
    if (analisisPeriodoActual === '30') {
        const d = new Date(hoy); d.setDate(d.getDate()-30);
        const _fd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return { desde: _fd, hasta: hoyStr, label: 'Últimos 30 días' };
    }
    if (analisisPeriodoActual === '90') {
        const d = new Date(hoy); d.setDate(d.getDate()-90);
        const _fd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return { desde: _fd, hasta: hoyStr, label: 'Últimos 90 días' };
    }
    if (analisisPeriodoActual === 'todo') return { desde: '2000-01-01', hasta: hoyStr, label: 'Todo el historial' };
    if (analisisPeriodoActual === 'custom') {
        return { desde: document.getElementById('analisisDesde')?.value||'2000-01-01',
                 hasta: document.getElementById('analisisHasta')?.value||hoyStr,
                 label: `${document.getElementById('analisisDesde')?.value} → ${document.getElementById('analisisHasta')?.value}` };
    }
    return { desde: '2000-01-01', hasta: hoyStr, label: 'Todo el historial' };
}

function renderAnalisis() {
    const { desde, hasta, label } = getAnalisisFechas();
    const orden = document.getElementById('analisisOrden')?.value || 'unidades';
    const ventasFiltradas = _getAllVentas().filter(s => s.date >= desde && s.date <= hasta);
    const mapaProductos = {};
    ventasFiltradas.forEach(venta => {
        (venta.products||[]).forEach(item => {
            const key = item.name || item.id || 'Desconocido';
            if (!mapaProductos[key]) {
                const pi = (window.products||[]).find(p => String(p.id)===String(item.id)||p.name===item.name);
                mapaProductos[key] = { nombre:key, unidades:0, ingresos:0, costoUnitario:pi?Number(pi.cost||0):0, emoji:pi?(pi.image||'📦'):'📦', vecesEnVentas:0 };
            }
            const c = Number(item.quantity||1), pr = Number(item.price||item.subtotal||0);
            mapaProductos[key].unidades += c; mapaProductos[key].ingresos += pr*c; mapaProductos[key].vecesEnVentas += 1;
        });
    });
    let lista = Object.values(mapaProductos).map(p => {
        const costoTotal = p.costoUnitario * p.unidades;
        const ganancia   = p.ingresos - costoTotal;
        const margen     = p.ingresos > 0 ? (ganancia/p.ingresos*100) : 0;
        return { ...p, costoTotal, ganancia, margen };
    });
    lista.sort((a,b) => orden==='ingresos' ? b.ingresos-a.ingresos : orden==='margen' ? b.margen-a.margen : b.unidades-a.unidades);

    const totalUnidades = lista.reduce((s,p)=>s+p.unidades,0);
    const totalIngresos = lista.reduce((s,p)=>s+p.ingresos,0);
    const totalGanancia = lista.reduce((s,p)=>s+p.ganancia,0);
    const maxIngresos   = lista.length > 0 ? lista[0].ingresos : 1;

    const el = id => document.getElementById(id);
    if (el('analisisKpiProductos'))  el('analisisKpiProductos').textContent  = lista.length;
    if (el('analisisKpiUnidades'))   el('analisisKpiUnidades').textContent   = totalUnidades;
    if (el('analisisKpiIngresos'))   el('analisisKpiIngresos').textContent   = '$'+totalIngresos.toFixed(2);
    if (el('analisisKpiGanancia'))   el('analisisKpiGanancia').textContent   = '$'+totalGanancia.toFixed(2);
    if (el('analisisPeriodoLabel'))  el('analisisPeriodoLabel').textContent  = label;

    const tbody = el('analisisTabla');
    const vacio = el('analisisVacio');
    if (!tbody) return;
    if (lista.length === 0) { tbody.innerHTML=''; if(vacio) vacio.classList.remove('hidden'); return; }
    if (vacio) vacio.classList.add('hidden');

    const colores = ['#C5A572','#E9B84A','#7CB9A8','#A78BFA','#F87171','#60A5FA','#34D399'];
    tbody.innerHTML = lista.map((p,i) => {
        const pct = totalIngresos>0 ? (p.ingresos/totalIngresos*100).toFixed(1) : 0;
        const barPct = maxIngresos>0 ? (p.ingresos/maxIngresos*100).toFixed(1) : 0;
        const color = colores[i%colores.length];
        const mc = p.margen>=40?'text-green-600':p.margen>=20?'text-yellow-600':'text-red-500';
        const gc = p.ganancia>=0?'text-green-600':'text-red-500';
        const med = i===0?'🥇':i===1?'🥈':i===2?'🥉':`<span class="text-gray-400 font-bold">${i+1}</span>`;
        return `<tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-center text-lg">${med}</td>
            <td class="px-6 py-4"><div class="flex items-center gap-3"><span class="text-2xl">${p.emoji}</span>
                <div class="min-w-0"><p class="font-semibold text-gray-800 truncate max-w-[180px]">${_esc(p.nombre)}</p>
                    <div class="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden" style="max-width:140px">
                        <div class="h-full rounded-full" style="width:${barPct}%;background:${color};"></div>
                    </div></div></div></td>
            <td class="px-6 py-4 text-center"><span class="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style="background:${color};">${p.unidades}</span></td>
            <td class="px-6 py-4 text-right font-bold text-gray-800">$${p.ingresos.toFixed(2)}</td>
            <td class="px-6 py-4 text-right text-gray-500">$${p.costoTotal.toFixed(2)}</td>
            <td class="px-6 py-4 text-right font-bold ${gc}">$${p.ganancia.toFixed(2)}</td>
            <td class="px-6 py-4 text-center"><span class="font-bold ${mc}">${p.margen.toFixed(1)}%</span></td>
            <td class="px-6 py-4 text-center text-gray-600 font-medium">${pct}%</td>
        </tr>`;
    }).join('');
    renderAnalisisABC(lista, totalGanancia);
}
window.renderAnalisis = renderAnalisis;

function renderAnalisisABC(lista, totalGanancia) {
    const tbody = document.getElementById('abcTabla');
    const vacio = document.getElementById('abcVacio');
    const sorted = [...lista].sort((a,b) => b.ganancia-a.ganancia);
    const totalG = sorted.reduce((s,p)=>s+p.ganancia,0);
    const elID   = id => document.getElementById(id);

    if (sorted.length===0||totalG<=0) {
        if (tbody) tbody.innerHTML='';
        if (vacio) vacio.classList.remove('hidden');
        ['abcACount','abcAGanancia','abcBCount','abcBGanancia','abcCCount','abcCGanancia'].forEach(id => {
            const e = elID(id); if (e) e.textContent = id.includes('Count') ? '0 productos' : '$0 ganancia';
        });
        return;
    }
    if (vacio) vacio.classList.add('hidden');

    let acum = 0;
    const conClase = sorted.map(p => {
        const pi  = p.ganancia/totalG*100; acum += pi;
        return { ...p, pctInd:pi, acumulado:Math.min(acum,100), clase: acum<=80?'A':acum<=95?'B':'C' };
    });

    const A = conClase.filter(p=>p.clase==='A'), B=conClase.filter(p=>p.clase==='B'), C=conClase.filter(p=>p.clase==='C');
    const sg = a => a.reduce((s,p)=>s+p.ganancia,0);
    const pct= (n,total) => (n/total*100).toFixed(0);

    if(elID('abcACount'))     elID('abcACount').textContent     = `${A.length} producto${A.length!==1?'s':''}`;
    if(elID('abcAGanancia'))  elID('abcAGanancia').textContent  = `$${sg(A).toFixed(2)} ganancia`;
    if(elID('abcBCount'))     elID('abcBCount').textContent     = `${B.length} producto${B.length!==1?'s':''}`;
    if(elID('abcBGanancia'))  elID('abcBGanancia').textContent  = `$${sg(B).toFixed(2)} ganancia`;
    if(elID('abcCCount'))     elID('abcCCount').textContent     = `${C.length} producto${C.length!==1?'s':''}`;
    if(elID('abcCGanancia'))  elID('abcCGanancia').textContent  = `$${sg(C).toFixed(2)} ganancia`;

    const bA=A.length/sorted.length*100, bB=B.length/sorted.length*100, bC=100-bA-bB;
    if(elID('abcBarraA')) elID('abcBarraA').style.width=bA+'%';
    if(elID('abcBarraB')) elID('abcBarraB').style.width=bB+'%';
    if(elID('abcBarraC')) elID('abcBarraC').style.width=bC+'%';
    if(elID('abcBarraALabel')) elID('abcBarraALabel').textContent=`A: ${pct(A.length,sorted.length)}% de productos`;
    if(elID('abcBarraBLabel')) elID('abcBarraBLabel').textContent=`B: ${pct(B.length,sorted.length)}% de productos`;
    if(elID('abcBarraCLabel')) elID('abcBarraCLabel').textContent=`C: ${pct(C.length,sorted.length)}% de productos`;

    const cfg = { A:{dot:'bg-green-500',rec:'🔒 Stock prioritario, no descontinuar'}, B:{dot:'bg-amber-500',rec:'📦 Reposición regular'}, C:{dot:'bg-gray-400',rec:'📉 Evaluar rentabilidad'} };
    if (tbody) tbody.innerHTML = conClase.map(p => {
        const c = cfg[p.clase], gc = p.ganancia>=0?'text-green-700':'text-red-500';
        return `<tr class="hover:bg-gray-50 ${p.clase==='A'?'border-l-4 border-green-400':p.clase==='B'?'border-l-4 border-amber-400':'border-l-4 border-gray-200'}">
            <td class="px-4 py-3 text-center"><span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${c.dot} text-white text-xs font-bold shadow-sm">${p.clase}</span></td>
            <td class="px-4 py-3"><div class="flex items-center gap-2"><span class="text-xl">${p.emoji}</span>
                <span class="font-semibold text-gray-800 truncate max-w-[200px]">${p.nombre}</span></div></td>
            <td class="px-4 py-3 text-right font-bold ${gc}">$${p.ganancia.toFixed(2)}</td>
            <td class="px-4 py-3 text-right"><span class="font-semibold text-gray-700">${p.pctInd.toFixed(1)}%</span></td>
            <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-2">
                <div class="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full ${c.dot} rounded-full" style="width:${Math.min(p.acumulado,100)}%"></div>
                </div>
                <span class="text-sm font-semibold text-gray-600 w-12 text-right">${p.acumulado.toFixed(1)}%</span>
            </div></td>
            <td class="px-4 py-3 text-center text-xs font-medium text-gray-600">${c.rec}</td>
        </tr>`;
    }).join('');
}

function exportarAnalisisCSV() {
    const { desde, hasta } = getAnalisisFechas();
    const ventasFiltradas  = _getAllVentas().filter(s => s.date>=desde && s.date<=hasta);
    const mapaProductos    = {};
    ventasFiltradas.forEach(v => {
        (v.products||[]).forEach(item => {
            const key = item.name||item.id||'Desconocido';
            if (!mapaProductos[key]) {
                const pi = (window.products||[]).find(p=>String(p.id)===String(item.id)||p.name===item.name);
                mapaProductos[key] = { nombre:key, unidades:0, ingresos:0, costoUnitario:pi?Number(pi.cost||0):0 };
            }
            mapaProductos[key].unidades += Number(item.quantity||1);
            mapaProductos[key].ingresos += Number(item.price||0)*Number(item.quantity||1);
        });
    });
    const lista = Object.values(mapaProductos).map(p => {
        const costoTotal=p.costoUnitario*p.unidades, ganancia=p.ingresos-costoTotal;
        return { ...p, costoTotal, ganancia, margen:p.ingresos>0?(ganancia/p.ingresos*100).toFixed(1):0 };
    }).sort((a,b)=>b.unidades-a.unidades);
    const rows=[['Producto','Unidades','Ingresos','Costo estimado','Ganancia','Margen %']];
    lista.forEach(p=>rows.push([p.nombre,p.unidades,p.ingresos.toFixed(2),p.costoTotal.toFixed(2),p.ganancia.toFixed(2),p.margen]));
    const csv=rows.map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url;
    a.download=`Analisis_Productos_${desde}_${hasta}.csv`;
    a.click(); URL.revokeObjectURL(url);
}
window.exportarAnalisisCSV = exportarAnalisisCSV;

// ── Atajos, banner de conexión, badge POS, PIN — (funciones de UI global) ──
function mostrarAtajos() { if (typeof openModal==='function') openModal('atajosModal'); }
window.mostrarAtajos = mostrarAtajos;

function cerrarModalActivo() {
    const modales = Array.from(document.querySelectorAll('.modal.active'));
    if (modales.length > 0) {
        const ultimo = modales[modales.length-1];
        const closeBtn = ultimo.querySelector('button[onclick*="close"],button[onclick*="cerrar"]');
        if (closeBtn) closeBtn.click();
        else if (typeof closeModal==='function') closeModal(ultimo);
        return;
    }
    const am = document.getElementById('atajosModal');
    if (am && am.classList.contains('active') && typeof closeModal==='function') closeModal('atajosModal');
}
window.cerrarModalActivo = cerrarModalActivo;
document.addEventListener('keydown', e => { if (e.key==='Escape') { e.preventDefault(); cerrarModalActivo(); } });

let _lastConnectionState = null;
function mostrarBannerConexion(connected, msg) {
    if (_lastConnectionState === connected) return;
    _lastConnectionState = connected;
    const banner = document.getElementById('connectionBanner');
    if (!banner) return;
    banner.style.background = connected ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#F59E0B,#D97706)';
    banner.style.color = 'white';
    banner.textContent = (connected ? '🟢 ' : '⚡ ') + (msg || (connected ? 'Conexión restaurada' : 'Sin conexión — modo offline'));
    banner.style.display = 'block';
    const badge = document.getElementById('supabaseOfflineBadge');
    if (badge) badge.classList.toggle('hidden', connected);
    if (connected) setTimeout(() => { banner.style.display='none'; }, 5000);
}
window.mostrarBannerConexion = mostrarBannerConexion;

function actualizarBadgePOS() {
    const today = _fechaHoy();
    const hoy   = (window.salesHistory||[]).filter(s => s.date===today).length;
    const btnPos = document.querySelector('[data-section="pos"]');
    if (!btnPos) return;
    let badge = document.getElementById('sidebarBadgePOS');
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'sidebarBadgePOS';
        badge.className = 'sidebar-badge badge-warn';
        badge.style.display = 'none';
        btnPos.appendChild(badge);
    }
    if (hoy > 0) { badge.textContent=hoy>99?'99+':hoy; badge.style.display='inline-block'; badge.title=`${hoy} venta${hoy!==1?'s':''} hoy`; }
    else badge.style.display = 'none';
}
window.actualizarBadgePOS = actualizarBadgePOS;

async function cambiarPIN() {
    const actual = document.getElementById('pinActual')?.value?.trim() || '';
    const nuevo  = document.getElementById('pinNuevo')?.value?.trim()  || '';
    if (!actual||!nuevo) { manekiToastExport('⚠️ Completa ambos campos del PIN','warn'); return; }
    if (nuevo.length<4)  { manekiToastExport('⚠️ El nuevo PIN debe tener al menos 4 dígitos','warn'); return; }
    if (typeof require==='undefined') { manekiToastExport('❌ Solo disponible en la app de escritorio','err'); return; }
    try {
        const { ipcRenderer } = require('electron');
        const res = await ipcRenderer.invoke('change-pin', { pinActual:actual, pinNuevo:nuevo });
        if (res.ok) {
            manekiToastExport('✅ PIN actualizado correctamente','ok');
            if(document.getElementById('pinActual')) document.getElementById('pinActual').value='';
            if(document.getElementById('pinNuevo'))  document.getElementById('pinNuevo').value='';
        } else { manekiToastExport('❌ '+(res.error||'Error al cambiar PIN'),'err'); }
    } catch(e) { manekiToastExport('❌ Error: '+e.message,'err'); }
}
window.cambiarPIN = cambiarPIN;

function mostrarResumenDia() {
    const hoy    = _fechaHoy();
    const ventas = (window.salesHistory||[]).filter(v=>v.date===hoy&&v.method!=='Cancelado');
    const total  = ventas.reduce((s,v)=>s+(v.total||0),0);
    const pHoy   = (window.pedidos||[]).filter(p=>p.entrega===hoy&&!['cancelado'].includes(p.status||''));
    manekiToastExport(`📊 Hoy: ${ventas.length} venta${ventas.length!==1?'s':''} · $${total.toFixed(2)} · ${pHoy.length} entrega${pHoy.length!==1?'s':''} programada${pHoy.length!==1?'s':''}`, 'ok');
}
window.mostrarResumenDia = mostrarResumenDia;

// ── Botón atajos en barra superior ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const bar = document.getElementById('global-search-bar');
    if (!bar || document.getElementById('btnAtajos')) return;
    const btn = document.createElement('button');
    btn.id = 'btnAtajos'; btn.title = 'Atajos de teclado (Ctrl+Shift+?)';
    btn.innerHTML = '<i class="fas fa-keyboard text-sm"></i>';
    btn.className = 'flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all flex-shrink-0';
    btn.onclick = () => mostrarAtajos();
    bar.appendChild(btn);
});

// ── Pedidos: funciones de productos en pedido ─────────────────────────────
// (mantenidas aquí para no romper referencias existentes)
function poblarSelectPedido() {
    const sel = document.getElementById('pedidoProductoSelect');
    if (!sel) return;
    const lastId = (window.products||[]).length ? String((window.products||[])[(window.products||[]).length-1].id) : '';
    const cacheKey = (window.products||[]).length + '_' + lastId;
    if (sel._cacheKey === cacheKey) return;
    sel._cacheKey = cacheKey;
    if (!(window.products||[]).length) { sel.innerHTML='<option value="">-- Sin productos en inventario --</option>'; return; }
    sel.innerHTML = '<option value="">-- Seleccionar producto (opcional) --</option>' +
        (window.products||[]).map(p => `<option value="${p.id}">${p.name} - $${Number(p.price).toFixed(2)}</option>`).join('');
}

function filtrarProductosPedido() {
    const q    = (document.getElementById('pedidoBuscadorProducto')?.value||'').toLowerCase().trim();
    const grid = document.getElementById('pedidoProductoGrid');
    if (!grid) return;
    const lista = (window.products||[]).filter(p => p.tipo!=='materia_prima' && p.tipo!=='servicio' && (!q || p.name.toLowerCase().includes(q)));
    if (!q) { grid.classList.add('hidden'); return; }
    grid.classList.remove('hidden');
    grid.innerHTML = lista.slice(0,12).map(p => {
        const img = p.imageUrl
            ? `<img src="${p.imageUrl}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" onerror="this.style.display='none'">`
            : `<div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">${p.image||'📦'}</div>`;
        return `<div onclick="seleccionarProductoPedido('${p.id}')"
            class="cursor-pointer border border-gray-200 rounded-xl p-2 hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center gap-3">
            ${img}<div class="min-w-0">
                <div class="text-xs font-semibold text-gray-800 truncate">${p.name}</div>
                <div class="text-xs text-amber-700 font-bold">$${Number(p.price).toFixed(2)}</div>
            </div></div>`;
    }).join('');
}
window.filtrarProductosPedido = filtrarProductosPedido;

function seleccionarProductoPedido(pid) {
    const prod = (window.products||[]).find(p => String(p.id)===String(pid));
    if (!prod) return;
    document.getElementById('pedidoProductoSelect').value = pid;
    document.getElementById('pedidoProductoGrid')?.classList.add('hidden');
    if(document.getElementById('pedidoBuscadorProducto')) document.getElementById('pedidoBuscadorProducto').value='';
    const row = document.getElementById('pedidoProductoSelRow');
    if (row) row.classList.remove('hidden');
    if(document.getElementById('pedidoProductoSelNombre')) document.getElementById('pedidoProductoSelNombre').textContent = prod.name;
    if(document.getElementById('pedidoProductoSelPrecio')) document.getElementById('pedidoProductoSelPrecio').textContent = '$'+Number(prod.price).toFixed(2);
    mostrarVariantesPedido();
}
window.seleccionarProductoPedido = seleccionarProductoPedido;

function limpiarSeleccionProductoPedido() {
    if(document.getElementById('pedidoProductoSelect')) document.getElementById('pedidoProductoSelect').value='';
    document.getElementById('pedidoProductoSelRow')?.classList.add('hidden');
    document.getElementById('pedidoVarianteRow')?.classList.add('hidden');
    if(document.getElementById('pedidoBuscadorProducto')) document.getElementById('pedidoBuscadorProducto').value='';
}
window.limpiarSeleccionProductoPedido = limpiarSeleccionProductoPedido;

function mostrarVariantesPedido() {
    const pid = document.getElementById('pedidoProductoSelect')?.value;
    const row = document.getElementById('pedidoVarianteRow');
    const sel = document.getElementById('pedidoVarianteSelect');
    if (!pid||!row) { if(row) row.classList.add('hidden'); return; }
    const prod = (window.products||[]).find(p=>String(p.id)===String(pid));
    if (!prod||!prod.variants||!prod.variants.length) { row.classList.add('hidden'); return; }
    if (sel) sel.innerHTML = prod.variants.map(v=>`<option value="${v.type}: ${v.value}">${v.type}: ${v.value}</option>`).join('');
    row.classList.remove('hidden');
}

// ── Hook de submit de pedidoForm ───────────────────────────────────────────
document.addEventListener('submit', function(e) {
    if (e.target.id !== 'pedidoForm') return;
    const _editIdSnap = (document.getElementById('editPedidoId')||{}).value || '';
    setTimeout(function() {
        if (!window.pedidoProductosSeleccionados || !window.pedidoProductosSeleccionados.length) {
            window.pedidoProductosSeleccionados = []; return;
        }
        let target = _editIdSnap
            ? (window.pedidos||[]).find(p=>String(p.id)===String(_editIdSnap))
            : (window.pedidos||[])[(window.pedidos||[]).length-1];
        if (target) {
            target.productosInventario = [...window.pedidoProductosSeleccionados];
            if (!_editIdSnap) {
                window.pedidoProductosSeleccionados.forEach(item => {
                    const prod = (window.products||[]).find(p=>String(p.id)===String(item.id));
                    if (!prod) return;
                    if (prod.isKit && prod.kitComponentes && prod.kitComponentes.length) {
                        prod.kitComponentes.forEach(comp => {
                            const cp = (window.products||[]).find(p=>String(p.id)===String(comp.id));
                            if (cp) cp.stock = Math.max(0, cp.stock-(comp.quantity*item.quantity));
                        });
                    } else { prod.stock = Math.max(0, prod.stock-item.quantity); }
                });
                if (typeof saveProducts === 'function') saveProducts();
                if (typeof renderInventoryTable === 'function') renderInventoryTable();
                if (typeof renderProducts === 'function') renderProducts();
            }
            if (typeof savePedidos === 'function') savePedidos();
        }
        window.pedidoProductosSeleccionados = [];
    }, 200);
});
