// ============== DASHBOARD ==============

        // ============== ALERTAS ENTREGAS PRÓXIMAS ==============
        function checkAlertasEntregas() {
            const estadosActivos = ['confirmado','pago','produccion','envio','salida','retirar'];

            // MEJ-16: usar diasHastaEntrega() centralizado (definida en _updateDashboardImpl)
            const _dias = (p) => (typeof window.diasHastaEntrega === 'function')
                ? window.diasHastaEntrega(p.entrega || p.fechaEntrega)
                : (() => { const [y,m,d] = (p.entrega||p.fechaEntrega||'').split('-').map(Number); const hoy=new Date(); hoy.setHours(0,0,0,0); return Math.round((new Date(y,m-1,d)-hoy)/86400000); })();

            const pedidosAlerta = pedidos.filter(p => {
                if (!estadosActivos.includes(p.status)) return false;
                const diff = _dias(p);
                return diff !== null && diff >= 0 && diff <= 2;
            }).map(p => ({ ...p, diffDias: _dias(p) }))
              .sort((a,b) => a.diffDias - b.diffDias);

            const banner = document.getElementById('alertaEntregas');
            const lista  = document.getElementById('alertaEntregasLista');
            if (!banner || !lista) return;

            if (pedidosAlerta.length === 0) {
                banner.classList.remove('visible');
                return;
            }

            banner.classList.add('visible');
            document.getElementById('alertaSubtitulo').textContent =
                pedidosAlerta.length === 1
                    ? '1 pedido requiere tu atención'
                    : `${pedidosAlerta.length} pedidos requieren tu atención`;

            lista.innerHTML = pedidosAlerta.map(p => {
                let clase, etiqueta, icono;
                if (p.diffDias === 0) {
                    clase = 'hoy'; etiqueta = '¡Hoy!'; icono = '🔴';
                } else if (p.diffDias === 1) {
                    clase = 'manana'; etiqueta = 'Mañana'; icono = '🟠';
                } else {
                    clase = 'dos-dias'; etiqueta = 'En 2 días'; icono = '🟡';
                }
                // FIX: usar calcSaldoPendiente (fuente de verdad unificada de CxC) en lugar de p.anticipo directo
                const saldo = (typeof window.calcSaldoPendiente === 'function'
                    ? window.calcSaldoPendiente(p)
                    : Math.max(0, Number(p.total||0) - Number(p.anticipo||0))
                ).toFixed(2);
                return `
                    <div class="alerta-pedido-card ${clase}">
                        <span class="text-2xl">${icono}</span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-gray-800 text-sm">${_esc(p.folio || '')}</span>
                                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    p.diffDias===0 ? 'bg-red-100 text-red-700' :
                                    p.diffDias===1 ? 'bg-orange-100 text-orange-700' :
                                                     'bg-yellow-100 text-yellow-700'}">${etiqueta}</span>
                            </div>
                            <p class="text-gray-700 text-sm font-medium truncate">${_esc(p.cliente)}</p>
                            <p class="text-gray-500 text-xs truncate">${_esc(p.concepto || '')}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-sm font-bold text-gray-800">$${Number(p.total||0).toFixed(2)}</p>
                            ${Number(saldo)>0 ? `<p class="text-xs text-red-600 font-semibold">Saldo: $${saldo}</p>` : '<p class="text-xs text-green-600 font-semibold">✓ Pagado</p>'}
                            <p class="text-xs text-gray-400">${_esc(p.entrega)}</p>
                        </div>
                    </div>`;
            }).join('');
        }

        function cerrarAlertaEntregas() {
            const banner = document.getElementById('alertaEntregas');
            if (banner) banner.classList.remove('visible');
        }
// BUG4 FIX: función duplicada eliminada — usar mostrarResumenDia() definida abajo
// ── animarNumero: anima un valor numérico en un elemento ──────────────────
// Protegida contra llamadas múltiples simultáneas — cancela animación previa
// antes de iniciar una nueva para evitar valores aleatorios intermedios.
function animarNumero(el, desde, hasta, duracion, prefijo, sufijo) {
    if (!el) return;
    // Cancelar animación previa en este elemento
    if (el._animFrame) cancelAnimationFrame(el._animFrame);
    // Si la duración es 0 o el valor es igual, escribir directo
    if (!duracion || desde === hasta) {
        el.textContent = prefijo + Number(hasta).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2}) + sufijo;
        return;
    }
    const startTime = performance.now();
    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duracion, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = desde + (hasta - desde) * eased;
        el.textContent = prefijo + Number(current).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2}) + sufijo;
        if (progress < 1) {
            el._animFrame = requestAnimationFrame(step);
        } else {
            el._animFrame = null;
            // Valor final exacto
            el.textContent = prefijo + Number(hasta).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2}) + sufijo;
        }
    }
    el._animFrame = requestAnimationFrame(step);
}
window.animarNumero = animarNumero;

// Throttle: si updateDashboard se llama múltiples veces seguidas,
// solo ejecuta la última llamada después de 150ms de silencio.
// Esto evita animaciones en paralelo cuando varios eventos disparan el update.
let _updateDashboardTimer = null;
function updateDashboard() {
    if (_updateDashboardTimer) clearTimeout(_updateDashboardTimer);
    _updateDashboardTimer = setTimeout(() => {
        _updateDashboardTimer = null;
        _updateDashboardImpl();
    }, 150);
}
window.updateDashboard = updateDashboard;

// MEJ-16: Función utilitaria centralizada para calcular días hasta una fecha de entrega.
// Evita la inconsistencia entre Math.round() y Math.ceil() en distintos módulos.
// Siempre opera en hora local (sin conversión UTC) para evitar errores de ±1 día.
window.diasHastaEntrega = function(fechaStr) {
    if (!fechaStr) return null;
    try {
        const [y, m, d] = fechaStr.split('-').map(Number);
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const entrega = new Date(y, m - 1, d);
        return Math.round((entrega - hoy) / 86400000);
    } catch(e) { return null; }
};

function _updateDashboardImpl() {
    // PENDIENTE-01 FIX: normalizar anticipo/resta de pedidos ANTES de calcular "Me deben".
    // normalizarResta() recalcula p.anticipo y p.resta desde p.pagos[] como fuente de verdad.
    // Necesario porque renderPedidosTable() (que llama normalizarResta) puede no haber corrido
    // aún cuando updateDashboard se ejecuta en el primer frame de init.
    if (typeof normalizarResta === 'function') normalizarResta();

    const now = new Date();
    // FIX: usar fecha local, NO toISOString() que devuelve UTC y puede dar el día incorrecto de noche
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    // ── Saludo dinámico ──
    const hour = now.getHours();
    const greeting = hour < 12 ? '¡Buenos días!' : hour < 19 ? '¡Buenas tardes!' : '¡Buenas noches!';
    const greetingEmoji = hour < 12 ? '☀️' : hour < 19 ? '🌤️' : '🌙';
    const el = document.getElementById('dashGreeting');
    const ee = document.getElementById('dashGreetingEmoji');
    const sn = document.getElementById('dashStoreName');
    if (el) el.textContent = greeting;
    if (ee) ee.textContent = greetingEmoji;
    if (sn) sn.textContent = storeConfig ? storeConfig.name : 'Maneki Store';

    // ── Fecha y hora ──
    const dateEl = document.getElementById('dashDate');
    const timeEl = document.getElementById('dashTime');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    // MEJ-07: reloj del dashboard usa _dashClock (separado del _liveClock del POS)
    // FIX A11: siempre limpiar el intervalo anterior antes de crear uno nuevo
    // FIX 3: sin segundos — intervalo de 60s es suficiente
    if (window._dashClock) { clearInterval(window._dashClock); window._dashClock = null; }
    window._dashClock = setInterval(() => {
            const t = document.getElementById('dashTime');
            if (t) {
                const n = new Date();
                t.textContent = n.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                const h = n.getHours();
                const g = document.getElementById('dashGreeting');
                const ge = document.getElementById('dashGreetingEmoji');
                if (g) g.textContent = h < 12 ? '¡Buenos días!' : h < 19 ? '¡Buenas tardes!' : '¡Buenas noches!';
                if (ge) ge.textContent = h < 12 ? '☀️' : h < 19 ? '🌤️' : '🌙';
            }
        }, 60000);

    // MEJ-04: Una sola pasada O(n) sobre salesHistory en lugar de 6 iteraciones separadas.
    // Calcula todaySales, totalSales, totalCosts, monthlySales, ventasMesActual y ventasMesAnterior
    // en un único for loop — reduce ~60% del tiempo de cómputo con historiales grandes.
    const mesActualStr = today.substring(0, 7);
    const fechaPrevMes = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const mesAnteriorStr = `${fechaPrevMes.getFullYear()}-${String(fechaPrevMes.getMonth() + 1).padStart(2, '0')}`;
    let todaySales = 0, totalSales = 0, totalCosts = 0, monthlySales = 0, ventasMesActual = 0, ventasMesAnterior = 0;
    // Solo ventas POS reales — excluir pedidos/abonos/anticipos (igual que balance.js)
    // para evitar doble conteo con los pedidosFinalizados que se suman abajo.
    for (const s of (salesHistory || [])) {
        if (s.method === 'Cancelado') continue;
        if (s.type === 'pedido' || s.type === 'abono' || s.type === 'anticipo') continue;
        const t = s.total || 0;
        const c = (s.products || []).reduce((a, p) => a + ((p.costoAlVender ?? p.cost ?? 0) * (p.quantity || 1)), 0);
        if (s.date === today)                             todaySales     += t;
        if (s.date && s.date.startsWith(mesActualStr))  { totalSales += t; totalCosts += c; monthlySales += t; ventasMesActual  += t; }
        if (s.date && s.date.startsWith(mesAnteriorStr)) ventasMesAnterior += t;
    }
    // Pedidos finalizados — usar p.total como fuente de verdad (igual que balance.js)
    // Solo pedidosFinalizados, no pedidos activos (esos aún no están cobrados)
    for (const p of (window.pedidosFinalizados || [])) {
        if (!p.total) continue;
        const fecha = ((p.fechaFinalizado || p.fecha || '')).split('T')[0];
        if (!fecha) continue;
        const monto = Number(p.total);
        if (fecha === today)                           todaySales     += monto;
        if (fecha.startsWith(mesActualStr))          { totalSales += monto; monthlySales   += monto; ventasMesActual  += monto; }
        if (fecha.startsWith(mesAnteriorStr))          ventasMesAnterior += monto;
    }
    const netProfit = totalSales - totalCosts;
    // NTH-02: cargar meta mensual desde storeConfig la primera vez (persistente)
    const goalInput = document.getElementById('dashMonthGoal');
    if (goalInput && !goalInput.dataset.mkLoaded && window.storeConfig?.metaMensual) {
        goalInput.value = window.storeConfig.metaMensual;
        goalInput.dataset.mkLoaded = '1';
    }
    const goal = parseFloat(goalInput?.value) || 5000;
    const goalPct = Math.min(Math.round((monthlySales / goal) * 100), 100);

    const goalBar = document.getElementById('dashGoalBar');
    const goalPctEl = document.getElementById('dashGoalPercent');
    const monthSalesEl = document.getElementById('dashMonthSales');
    if (goalBar) goalBar.style.width = goalPct + '%';
    if (goalPctEl) goalPctEl.textContent = goalPct + '% de tu meta mensual';
    if (monthSalesEl) monthSalesEl.textContent = '$' + monthlySales.toFixed(2);

    // ── Stock bajo + Predictivo ──
    const _gse = typeof getStockEfectivo === 'function' ? getStockEfectivo : (p => p.stock || 0);
    const lowStockItems = products.filter(p => {
        const s = _gse(p);
        return s > 0 && s <= (p.stockMin || 5);
    });
    const outOfStock = products.filter(p => _gse(p) === 0);
    const lowStockBadge = document.getElementById('lowStockBadge');
    if (lowStockBadge) lowStockBadge.textContent = (lowStockItems.length + outOfStock.length) + ' items';

    // Calcular promedio de ventas por día para cada producto (últimos 30 días)
    const hace30 = new Date(); hace30.setDate(hace30.getDate() - 30);
    const hace30str = `${hace30.getFullYear()}-${String(hace30.getMonth()+1).padStart(2,'0')}-${String(hace30.getDate()).padStart(2,'0')}`;
    const ventasRecientes = salesHistory.filter(s => s.date >= hace30str && s.method !== 'Cancelado');

    // Pre-calcular mapa de ventas por producto (O(n)) antes del loop de productos
    const ventasPorProductoId = {};
    const ventasPorProductoNombre = {};
    (ventasRecientes || []).forEach(s => {
        (s.products || s.items || []).forEach(p => {
            const k = String(p.id || '');
            const kn = (p.name || '').toLowerCase();
            if (k) ventasPorProductoId[k] = (ventasPorProductoId[k] || 0) + (p.quantity || 1);
            if (kn) ventasPorProductoNombre[kn] = (ventasPorProductoNombre[kn] || 0) + (p.quantity || 1);
        });
    });

    function diasRestantes(producto) {
        const k = String(producto.id || '');
        const kn = (producto.name || '').toLowerCase();
        const totalVendido = (ventasPorProductoId[k] || 0) + (ventasPorProductoNombre[kn] || 0);
        const promDiario = totalVendido / 30;
        if (!promDiario) return null;
        const _gse2 = typeof getStockEfectivo === 'function' ? getStockEfectivo : (p => p.stock || 0);
        return Math.floor(_gse2(producto) / promDiario);
    }

    const lowStockList = document.getElementById('dashLowStockList');
    if (lowStockList) {
        const all = [...outOfStock.map(p => ({...p, out: true})), ...lowStockItems];
        if (all.length === 0) {
            lowStockList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Todo en orden 👍</p>';
        } else {
            lowStockList.innerHTML = all.slice(0, 8).map(p => {
                const dias = p.out ? null : diasRestantes(p);
                let predBadge = '';
                if (p.out) {
                    predBadge = `<span class="pred-badge pred-critico">Agotado</span>`;
                } else if (dias !== null) {
                    if      (dias <= 2)  predBadge = `<span class="pred-badge pred-critico">~${dias}d ⚠️</span>`;
                    else if (dias <= 5)  predBadge = `<span class="pred-badge pred-urgente">~${dias}d</span>`;
                    else if (dias <= 14) predBadge = `<span class="pred-badge pred-pronto">~${dias}d</span>`;
                    else                predBadge = `<span class="pred-badge pred-ok">~${dias}d</span>`;
                } else {
                    predBadge = `<span class="pred-badge" style="background:#f3f4f6;color:#9ca3af;">${p.stock} uds</span>`;
                }
                return `
                <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <span class="text-base flex-shrink-0">${p.image || '📦'}</span>
                        <span class="text-xs text-gray-700 truncate">${p.name}</span>
                    </div>
                    <div class="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        ${!p.out ? `<span class="text-xs text-gray-400">${p.stock}u</span>` : ''}
                        ${predBadge}
                    </div>
                </div>`;
            }).join('');
        }
    }

    // ── Cuentas por cobrar ──
    // Recalcular SIEMPRE desde datos crudos — no confiar en p.resta ni p.anticipo de Supabase.
    // FIX 8: use calcSaldoPendiente from balance.js (window.calcSaldoPendiente) for unified CxC
    const _calcSaldo = (typeof window.calcSaldoPendiente === 'function')
        ? window.calcSaldoPendiente
        : (p) => {
            const sumPagos = (p.pagos || []).reduce((s, ab) => s + Number(ab.monto || 0), 0);
            const totalPagado = sumPagos > 0 ? sumPagos : Number(p.anticipo || 0);
            return Math.max(0, Number(p.total || 0) - totalPagado);
          };
    const accountsReceivable = [
        ...receivables.filter(r => r.status === 'pending').map(r => r.amount || 0),
        ...pedidos
            .filter(p => !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase()))
            .map(p => _calcSaldo(p))
            .filter(v => v > 0)
    ].reduce((s, v) => s + v, 0);

    // ── Pedidos activos ──
    const activePedidos = pedidos.filter(p =>
        !['finalizado', 'cancelado'].includes((p.status || '').toLowerCase())
    ).length;

    // ── Entregas próximas (7 días) ──
    // MEJ-16: usar diasHastaEntrega() centralizado
    const upcoming = pedidos.filter(p => {
        const fecha = p.entrega || p.fechaEntrega;
        if (!fecha) return false;
        const dias = window.diasHastaEntrega(fecha);
        return dias !== null && dias >= 0 && dias <= 7
            && !['entregado','cancelado'].includes((p.status||p.estado||'').toLowerCase());
    }).sort((a, b) => {
        return window.diasHastaEntrega(a.entrega||a.fechaEntrega) - window.diasHastaEntrega(b.entrega||b.fechaEntrega);
    });

    const upcomingEl = document.getElementById('dashUpcomingDeliveries');
    if (upcomingEl) {
        if (upcoming.length === 0) {
            upcomingEl.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Sin entregas próximas 🎉</p>';
        } else {
            upcomingEl.innerHTML = upcoming.map(p => {
                // MEJ-16: usar diasHastaEntrega() (Math.round consistente con checkAlertasEntregas)
                const daysLeft = window.diasHastaEntrega(p.entrega || p.fechaEntrega);
                const urgency = daysLeft <= 1 ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-green-600';
                // MEJ-01: _esc() en todos los campos de usuario
                return `
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 px-2 rounded-lg"
                         onclick="showSection('pedidos')">
                        <div>
                            <p class="text-xs font-semibold text-gray-800">${_esc(p.cliente || '—')}</p>
                            <p class="text-xs text-gray-400">${_esc(p.concepto || '')} · ${_esc(p.folio || '')}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold ${urgency}">${daysLeft === 0 ? '¡Hoy!' : daysLeft === 1 ? 'Mañana' : 'En ' + daysLeft + ' días'}</p>
                            <p class="text-xs text-gray-400">${_esc(p.entrega || p.fechaEntrega)}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // ── Actualizar valores en pantalla ──
    const ds = document.getElementById('dailySales');
    const np = document.getElementById('netProfit');
    const ar = document.getElementById('accountsReceivable');
    const ap = document.getElementById('dashActivePedidos');
    if (ds) animarNumero(ds, 0, todaySales, 700, '$', '');
    if (np) {
        animarNumero(np, 0, netProfit, 700, '$', '');
        np.style.color = netProfit < 0 ? '#dc2626' : '';
        // Etiquetar ganancia neta como mes actual
        const npLabel = np.closest('.kpi-card, [class*="card"], .rounded-xl')?.querySelector('.kpi-label, .text-xs, .text-gray-500, small');
        if (npLabel && /ganancia/i.test(npLabel.textContent)) {
            npLabel.textContent = 'Ganancia Neta';
            let npSub = npLabel.nextElementSibling;
            if (!npSub || npSub.id === 'netProfit') {
                npSub = document.createElement('span');
                npSub.style.cssText = 'font-size:.65rem;color:#9ca3af;display:block;margin-top:1px;';
                npLabel.insertAdjacentElement('afterend', npSub);
            }
            const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            npSub.textContent = meses[now.getMonth()] + ' ' + now.getFullYear();
        }
    }
    renderSparkline();
    renderComparativaSemanal();
    if (ar) animarNumero(ar, 0, accountsReceivable, 700, '$', '');
    if (ap) ap.textContent = activePedidos;

    // R2-A5: Desglose "Me deben" por cliente — onclick en la tarjeta
    const arCard = ar ? ar.closest('[onclick]') || ar.parentElement : null;
    if (arCard && !arCard._meDeben_handler) {
        arCard._meDeben_handler = true;
        arCard.style.cursor = 'pointer';
        arCard.addEventListener('click', function() {
            const pedidosArr = window.pedidos || pedidos || [];
            const _calcS = (typeof window.calcSaldoPendiente === 'function')
                ? window.calcSaldoPendiente
                : (p) => Math.max(0, Number(p.total||0) - Number(p.anticipo||0));
            // Agrupar por cliente los pedidos con saldo > 0
            const mapa = {};
            pedidosArr
                .filter(p => !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase()))
                .forEach(p => {
                    const saldo = _calcS(p);
                    if (saldo <= 0) return;
                    const nombre = p.cliente || 'Sin nombre';
                    mapa[nombre] = (mapa[nombre] || 0) + saldo;
                });
            const entradas = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
            if (entradas.length === 0) {
                manekiToastExport('No hay saldos pendientes por cobrar', 'ok');
                return;
            }
            const total = entradas.reduce((s, [,v]) => s + v, 0);
            // Mostrar desglose en modal propio en lugar de alert() del OS
            const _isDark = document.body.classList.contains('dark');
            const _rowTextColor = _isDark ? '#e5e7eb' : '#374151';
            const _rowBorderColor = _isDark ? '#334155' : '#f3f4f6';
            const filas = entradas.map(([nombre, monto]) =>
                `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid ${_rowBorderColor};">
                    <span style="font-size:.85rem;color:${_rowTextColor};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(nombre)}</span>
                    <span style="font-size:.85rem;font-weight:700;color:#dc2626;margin-left:12px;white-space:nowrap;">$${monto.toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                </div>`
            ).join('');
            // Usar showConfirm como modal informativo (botón Aceptar = ok, sin cancelar)
            // Inyectar HTML en el div de confirmación si el sistema de modales lo soporta,
            // o bien usar un modal inline creado dinámicamente.
            let _mdc = document.getElementById('_meDeben_modal');
            // Remove stale modal so dark mode colors are re-evaluated on each open
            if (_mdc) { _mdc.remove(); _mdc = null; }
            if (!_mdc) {
                const isDark = document.body.classList.contains('dark');
                const bgColor = isDark ? '#1e293b' : '#fff';
                const textColor = isDark ? '#e5e7eb' : '#1f2937';
                const borderColor = isDark ? '#334155' : '#e5e7eb';
                _mdc = document.createElement('div');
                _mdc.id = '_meDeben_modal';
                _mdc.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);';
                _mdc.innerHTML = `<div style="background:${bgColor};border-radius:16px;padding:24px;width:min(420px,90vw);max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 style="font-size:1rem;font-weight:800;color:${textColor};margin:0;">📋 Me deben — desglose</h3>
                        <button id="_meDeben_close" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9ca3af;line-height:1;">×</button>
                    </div>
                    <div id="_meDeben_body" style="overflow-y:auto;flex:1;"></div>
                    <div id="_meDeben_total" style="margin-top:14px;padding-top:10px;border-top:2px solid ${borderColor};display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:.85rem;font-weight:600;color:#6b7280;">Total</span>
                        <span id="_meDeben_totalVal" style="font-size:1.1rem;font-weight:900;color:#dc2626;"></span>
                    </div>
                </div>`;
                document.body.appendChild(_mdc);
                document.getElementById('_meDeben_close').addEventListener('click', () => { _mdc.style.display = 'none'; });
                _mdc.addEventListener('click', e => { if (e.target === _mdc) _mdc.style.display = 'none'; });
            }
            document.getElementById('_meDeben_body').innerHTML = filas;
            document.getElementById('_meDeben_totalVal').textContent = '$' + total.toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
            _mdc.style.display = 'flex';
        });
    }

    // ── Pedidos por estado ──
    const estadosLabel = {
        confirmado:'Confirmado', pago:'Pago parcial', produccion:'En producción',
        envio:'En envío', salida:'Listo / Salida', retirar:'Por retirar',
        finalizado:'Finalizado', cancelado:'Cancelado'
    };
    const estadosColor = {
        confirmado:'#3b82f6', pago:'#f59e0b', produccion:'#8b5cf6',
        envio:'#06b6d4', salida:'#10b981', retirar:'#f97316',
        finalizado:'#6b7280', cancelado:'#ef4444'
    };
    const conteoEstados = {};
    pedidos.forEach(p => {
        const s = (p.status || 'confirmado').toLowerCase();
        conteoEstados[s] = (conteoEstados[s] || 0) + 1;
    });
    const pedidosEstadoEl = document.getElementById('dashPedidosEstado');
    if (pedidosEstadoEl) {
        const conDatos = Object.keys(estadosLabel).filter(s => conteoEstados[s] > 0);
        if (conDatos.length === 0) {
            pedidosEstadoEl.innerHTML = '<p style="color:#9ca3af;font-size:.75rem;text-align:center;padding:16px 0;">Sin pedidos registrados</p>';
        } else {
            pedidosEstadoEl.innerHTML = conDatos.map(s => `
                <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.04);">
                    <span style="width:8px;height:8px;border-radius:50%;background:${estadosColor[s]};flex-shrink:0;"></span>
                    <span style="font-size:.74rem;color:#374151;flex:1;">${estadosLabel[s]}</span>
                    <span style="font-size:.82rem;font-weight:800;color:${estadosColor[s]};">${conteoEstados[s]}</span>
                </div>`).join('');
        }
    }

    // ── Mes actual vs mes anterior ──
    // Nota: ventasMesActual y ventasMesAnterior ya fueron calculados en la pasada única O(n) de arriba.
    // fechaPrevMes se necesita solo para el nombre del mes anterior en el UI.
    const mesVsAnteriorEl = document.getElementById('dashMesVsAnterior');
    if (mesVsAnteriorEl) {
        const diffPct = ventasMesAnterior > 0
            ? Math.round(((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100) : null;
        const trend = diffPct === null ? '' : diffPct >= 0
            ? `<span style="color:#16a34a;font-weight:800;font-size:.74rem;">&#9650; ${diffPct}%</span>`
            : `<span style="color:#dc2626;font-weight:800;font-size:.74rem;">&#9660; ${Math.abs(diffPct)}%</span>`;
        const barPct = ventasMesAnterior > 0 ? Math.min(100, Math.round((ventasMesActual / ventasMesAnterior) * 100)) : 0;
        const mesActualNombre = now.toLocaleDateString('es-MX', { month: 'long' });
        const mesAnteriorNombre = fechaPrevMes.toLocaleDateString('es-MX', { month: 'long' });
        mesVsAnteriorEl.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
                <span style="font-size:.72rem;color:#6b7280;text-transform:capitalize;">${mesActualNombre}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:1rem;font-weight:900;color:#1e40af;">$${ventasMesActual.toLocaleString('es-MX',{maximumFractionDigits:0})}</span>
                    ${trend}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="font-size:.72rem;color:#9ca3af;text-transform:capitalize;">${mesAnteriorNombre}</span>
                <span style="font-size:.82rem;font-weight:600;color:#9ca3af;">$${ventasMesAnterior.toLocaleString('es-MX',{maximumFractionDigits:0})}</span>
            </div>
            ${ventasMesAnterior > 0 ? `
            <div style="background:#dbeafe;border-radius:99px;height:6px;overflow:hidden;">
                <div style="background:#3b82f6;height:100%;border-radius:99px;width:${barPct}%;transition:width .6s ease;"></div>
            </div>
            <p style="font-size:.65rem;color:#93c5fd;margin-top:4px;text-align:right;">${barPct}% del mes anterior</p>
            ` : '<p style="font-size:.7rem;color:#93c5fd;text-align:center;padding-top:8px;">Sin historial del mes anterior</p>'}`;
    }

    // ── Material más usado ──
    const materialConteo = {};
    [...(pedidosFinalizados || []), ...pedidos.filter(p => (p.status||'').toLowerCase() === 'finalizado')]
        .forEach(p => {
            (p.productosInventario || []).forEach(item => {
                const nombre = item.nombre || item.name || '';
                if (!nombre) return;
                materialConteo[nombre] = (materialConteo[nombre] || 0) + (item.cantidad || item.quantity || 1);
            });
        });
    const topMateriales = Object.entries(materialConteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const materialTopEl = document.getElementById('dashMaterialTop');
    if (materialTopEl) {
        if (topMateriales.length === 0) {
            materialTopEl.innerHTML = '<p style="color:#9ca3af;font-size:.75rem;text-align:center;padding:16px 0;">Sin datos de pedidos finalizados</p>';
        } else {
            const maxVal = topMateriales[0][1];
            const colores = ['#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe'];
            materialTopEl.innerHTML = topMateriales.map(([nombre, cnt], i) => {
                const pct = Math.round((cnt / maxVal) * 100);
                return `
                <div style="margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                        <span style="font-size:.72rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:78%;">${nombre}</span>
                        <span style="font-size:.72rem;font-weight:800;color:#7e22ce;">${cnt}x</span>
                    </div>
                    <div style="background:#f3e8ff;border-radius:99px;height:5px;overflow:hidden;">
                        <div style="background:${colores[i]};height:100%;border-radius:99px;width:${pct}%;transition:width .6s ease;"></div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    _renderAtencionHoy();
    _renderDiaMasRentable();
    checkAlertasEntregas();
    checkPedidosSinMovimiento();
    actualizarSidebarBadges();
    if (typeof actualizarBadgePOS === 'function') actualizarBadgePOS();
}

// NTH-08: Widget día más rentable de la semana ──────────────────────────────
function _renderDiaMasRentable() {
    const el = document.getElementById('diaMasRentableWidget');
    if (!el) return;
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const totales = [0,0,0,0,0,0,0];
    const fechasVistas = [new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set()];
    const fuentes = [
        ...(window.salesHistory||[]).filter(s => s.date && s.method !== 'Cancelado' && s.type !== 'anticipo' && s.type !== 'abono'),
        ...(window.pedidosFinalizados||[]).map(p => ({ date:(p.fechaFinalizado||p.fecha||'').split('T')[0], total:p.total }))
    ];
    fuentes.forEach(s => {
        if (!s.date) return;
        const d = new Date(s.date + 'T12:00:00');
        if (isNaN(d)) return;
        const dia = d.getDay();
        totales[dia] += Number(s.total||0);
        fechasVistas[dia].add(s.date);
    });
    const promedios = totales.map((t,i) => fechasVistas[i].size > 0 ? t / fechasVistas[i].size : 0);
    const maxVal = Math.max(...promedios, 1);
    const maxDia = promedios.indexOf(maxVal);
    el.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;">
        ${dias.map((nombre,i) => {
            const pct = Math.round((promedios[i]/maxVal)*100);
            const esMejor = i === maxDia;
            return `<div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:.72rem;width:62px;color:${esMejor?'#065f46':'#6b7280'};font-weight:${esMejor?'700':'400'}">${nombre}</span>
                <div style="flex:1;height:8px;background:#f3f4f6;border-radius:99px;overflow:hidden;">
                    <div style="height:100%;border-radius:99px;width:${pct}%;background:${esMejor?'#10b981':'#a7f3d0'};transition:width .5s ease;"></div>
                </div>
                <span style="font-size:.68rem;width:52px;text-align:right;color:${esMejor?'#065f46':'#9ca3af'};font-weight:${esMejor?'700':'400'}">$${promedios[i].toLocaleString('es-MX',{maximumFractionDigits:0})}</span>
                ${esMejor ? '<span style="font-size:.65rem;">🏆</span>' : ''}
            </div>`;
        }).join('')}
        </div>`;
}

function _renderAtencionHoy() {
    const el = document.getElementById('atencionHoyList');
    if (!el) return;

    const hoy = window._fechaHoy ? window._fechaHoy() : (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    })();
    const items = [];

    // Pedidos con saldo pendiente
    const porCobrar = (window.pedidos || []).filter(p =>
        p.status !== 'cancelado' &&
        (typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : (p.resta || 0)) > 0
    );
    if (porCobrar.length > 0) {
        items.push(`💳 ${porCobrar.length} pedido${porCobrar.length > 1 ? 's' : ''} con saldo pendiente`);
    }

    // Pedidos sin anticipo
    const sinAnticipo = (window.pedidos || []).filter(p =>
        p.status !== 'cancelado' && !p.anticipo && !(p.pagos && p.pagos.length > 0)
    );
    if (sinAnticipo.length > 0) {
        items.push(`⚠️ ${sinAnticipo.length} pedido${sinAnticipo.length > 1 ? 's' : ''} sin anticipo registrado`);
    }

    // Entregas vencidas
    const vencidos = (window.pedidos || []).filter(p => {
        if (!p.entrega || p.status === 'cancelado' || p.status === 'finalizado') return false;
        return new Date(p.entrega + 'T00:00:00') < new Date(hoy + 'T00:00:00');
    });
    if (vencidos.length > 0) {
        items.push(`🚨 ${vencidos.length} entrega${vencidos.length > 1 ? 's' : ''} vencida${vencidos.length > 1 ? 's' : ''}`);
    }

    if (items.length === 0) {
        el.innerHTML = '<span class="text-green-600 text-sm">✅ Todo en orden por hoy</span>';
    } else {
        el.innerHTML = items.map(i => `<div class="text-sm py-1 border-b border-gray-100">${i}</div>`).join('');
    }
}
window._renderAtencionHoy = _renderAtencionHoy;
        
        // ── SIDEBAR BADGES — contadores en tiempo real ───────────────────
function actualizarSidebarBadges() {
    // Badge Pedidos: pedidos activos (no entregados ni cancelados)
    const badgePedidos = document.getElementById('sidebarBadgePedidos');
    if (badgePedidos) {
        const activos = (pedidos || []).filter(p =>
            !['finalizado','cancelado'].includes((p.status || '').toLowerCase())
        ).length;
        const prevVal = badgePedidos._lastVal;
        if (activos > 0) {
            badgePedidos.textContent = activos > 99 ? '99+' : activos;
            badgePedidos.style.display = 'inline-block';
            // Animación pop solo si el número cambió
            if (prevVal !== activos) {
                badgePedidos.classList.remove('badge-new');
                void badgePedidos.offsetWidth;
                badgePedidos.classList.add('badge-new');
            }
            // Urgente si hay pedidos con entrega próxima ≤2 días — MEJ-16: diasHastaEntrega()
            const urgentes = (pedidos || []).filter(p => {
                const f = p.entrega || p.fechaEntrega;
                if (!f || ['finalizado','cancelado'].includes((p.status||'').toLowerCase())) return false;
                const dias = (typeof window.diasHastaEntrega === 'function')
                    ? window.diasHastaEntrega(f)
                    : (() => { const [y,m,d] = f.split('-').map(Number); const h=new Date(); h.setHours(0,0,0,0); return Math.round((new Date(y,m-1,d)-h)/86400000); })();
                return dias !== null && dias >= 0 && dias <= 2;
            }).length;
            badgePedidos.className = 'sidebar-badge' + (urgentes > 0 ? '' : ' badge-warn') + ' badge-new';
        } else {
            badgePedidos.style.display = 'none';
        }
        badgePedidos._lastVal = activos;

        // Sync tray badge with pedidos urgentes count
        try {
            if (ipcRenderer) {
                ipcRenderer.send('update-tray-badge', { urgentes, total: activos });
            }
        } catch(e) {}
    }

    // Badge Inventario: productos con stock bajo o agotado
    const badgeInv = document.getElementById('sidebarBadgeInventory');
    if (badgeInv) {
        const bajos = (products || []).filter(p =>
            p.stock === 0 || (p.stock > 0 && p.stock <= (p.stockMin || 5))
        ).length;
        const prevVal = badgeInv._lastVal;
        if (bajos > 0) {
            badgeInv.textContent = bajos > 99 ? '99+' : bajos;
            badgeInv.style.display = 'inline-block';
            if (prevVal !== bajos) {
                badgeInv.classList.remove('badge-new');
                void badgeInv.offsetWidth;
                badgeInv.classList.add('badge-new');
            }
            // Rojo si hay agotados, ámbar si solo stock bajo
            const agotados = (products || []).filter(p => p.stock === 0).length;
            badgeInv.className = 'sidebar-badge' + (agotados > 0 ? '' : ' badge-warn') + ' badge-new';
        } else {
            badgeInv.style.display = 'none';
        }
        badgeInv._lastVal = bajos;
    }
}
window.actualizarSidebarBadges = actualizarSidebarBadges;

// ── Pedidos sin movimiento ────────────────────────────────────────────────
function checkPedidosSinMovimiento() {
    const DIAS = 3;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const estadosActivos = ['confirmado','pago','produccion','envio','salida','retirar'];
    const estadosLabel = {
        confirmado:'Confirmado', pago:'Pago parcial', produccion:'En producción',
        envio:'En envío', salida:'Salida', retirar:'Por retirar'
    };

    const sinMov = (pedidos || []).filter(p => {
        if (!estadosActivos.includes(p.status)) return false;
        const ref = new Date(p.fechaUltimoEstado || p.fechaCreacion);
        ref.setHours(0,0,0,0);
        return Math.round((hoy - ref) / 86400000) >= DIAS;
    }).map(p => {
        const ref = new Date(p.fechaUltimoEstado || p.fechaCreacion);
        ref.setHours(0,0,0,0);
        return { ...p, diasSinMov: Math.round((hoy - ref) / 86400000) };
    }).sort((a, b) => b.diasSinMov - a.diasSinMov);

    const banner = document.getElementById('alertaSinMovimiento');
    const lista  = document.getElementById('alertaSinMovimientoLista');
    if (!banner || !lista) return;

    if (sinMov.length === 0) { banner.classList.remove('visible'); return; }

    banner.classList.add('visible');
    const sub = document.getElementById('alertaSinMovimientoSubtitulo');
    if (sub) sub.textContent = sinMov.length === 1
        ? `1 pedido sin avance hace más de ${DIAS} días`
        : `${sinMov.length} pedidos sin avance hace más de ${DIAS} días`;

    lista.innerHTML = sinMov.map(p => `
        <div class="alerta-pedido-card" style="border-color:#9ca3af;">
            <span class="text-2xl">⏸️</span>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-gray-800 text-sm">${_esc(p.folio || '')}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${estadosLabel[p.status] || p.status}</span>
                </div>
                <p class="text-gray-700 text-sm font-medium truncate">${_esc(p.cliente)}</p>
                <p class="text-gray-500 text-xs truncate">${_esc(p.concepto || '')}</p>
            </div>
            <div class="text-right shrink-0">
                <p class="text-sm font-bold text-gray-500">${p.diasSinMov}d sin cambios</p>
                ${p.entrega ? `<p class="text-xs text-gray-400">Entrega: ${_esc(p.entrega)}</p>` : ''}
                <button onclick="openPedidoStatusModal('${_esc(p.id)}')" style="font-size:.7rem;color:#6b7280;background:none;border:1px solid #d1d5db;border-radius:6px;padding:2px 8px;cursor:pointer;margin-top:4px;">Actualizar</button>
            </div>
        </div>`).join('');
}
window.checkPedidosSinMovimiento = checkPedidosSinMovimiento;