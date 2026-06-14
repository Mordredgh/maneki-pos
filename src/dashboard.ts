// ============== DASHBOARD ==============
// Shim: calcSaldoPendiente vive en balance.bundle (lazy). Usar _csp() en dashboard.
const _csp = (p: any): number => typeof (window as any).calcSaldoPendiente === 'function'
    ? (window as any).calcSaldoPendiente(p)
    : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));

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
            // #4 Sonido de notificación para entregas urgentes
            if (typeof window._mkNotifSound === 'function') window._mkNotifSound();
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
                const saldo = _csp(p).toFixed(2);
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
                            <p class="text-sm font-bold text-gray-800">${fmtMoney(Number(p.total||0))}</p>
                            ${Number(saldo)>0 ? `<p class="text-xs font-semibold" style="color:#ea580c;">💸 Pendiente: $${saldo}</p>` : '<p class="text-xs text-green-600 font-semibold">✅ Pagado</p>'}
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
// PERF: usa _fmtFast para frames intermedios (toFixed, ~0.1ms) y toLocaleString
// solo en el valor final (~8ms) — evita el rAF >50ms violation.
const _fmtFast = (v: number): string => {
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    const int = Math.floor(abs);
    const dec = Math.round((abs - int) * 100).toString().padStart(2, '0');
    return sign + int.toLocaleString('es-MX') + '.' + dec;
};
const _fmtFinal = (v: number): string =>
    Number(v).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2});

function animarNumero(el, desde, hasta, duracion, prefijo, sufijo) {
    if (!el) return;
    if (el._animFrame) cancelAnimationFrame(el._animFrame);
    if (!duracion || desde === hasta) {
        el.textContent = prefijo + _fmtFinal(hasta) + sufijo;
        return;
    }
    const startTime = performance.now();
    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duracion, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = desde + (hasta - desde) * eased;
        if (progress < 1) {
            el.textContent = prefijo + _fmtFast(current) + sufijo;
            el._animFrame = requestAnimationFrame(step);
        } else {
            el._animFrame = null;
            el.textContent = prefijo + _fmtFinal(hasta) + sufijo;
        }
    }
    el._animFrame = requestAnimationFrame(step);
}
window.animarNumero = animarNumero;

// Throttle: si updateDashboard se llama múltiples veces seguidas,
// solo ejecuta la última llamada después de 150ms de silencio.
// Esto evita animaciones en paralelo cuando varios eventos disparan el update.
// N-UI-6: Animación "pop" transitoria para badges al actualizarse
function _animateBadgePop(el: HTMLElement | null): void {
    if (!el) return;
    el.style.transform = 'scale(1.35)';
    el.style.transition = 'transform 0.15s ease-out';
    setTimeout(() => {
        el.style.transform = 'scale(1)';
    }, 150);
}

let _updateDashboardTimer = null;
let _lastDashboardHash: string | null = null;
function updateDashboard() {
    if (_updateDashboardTimer) clearTimeout(_updateDashboardTimer);
    _updateDashboardTimer = setTimeout(() => {
        _updateDashboardTimer = null;
        // P-4: hash guard — saltar render completo si los datos no cambiaron
        const _newHash = [
            (window.salesHistory || []).length,
            (window.pedidos || []).length,
            (window.pedidosFinalizados || []).length,
            (window.expenses || []).length,
            (window.incomes || []).length
        ].join('_');
        // Visibilidad: si el dashboard no está activo, solo actualizar badges (ligero)
        // y forzar re-render completo la próxima vez que el usuario navegue a dashboard.
        const _activeSection = localStorage.getItem('maneki_activeSection') || '';
        const _dashVisible = !_activeSection || _activeSection === 'dashboard' || _activeSection === 'bienvenida';
        if (!_dashVisible) {
            if (_newHash !== _lastDashboardHash) {
                _lastDashboardHash = null; // invalidar para que re-renderice al volver
                try { actualizarSidebarBadges(); } catch(e) {}
            }
            return;
        }
        if (_newHash === _lastDashboardHash) return;
        _lastDashboardHash = _newHash;
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
    const _ayerD = new Date(now); _ayerD.setDate(_ayerD.getDate() - 1);
    const _ayer = `${_ayerD.getFullYear()}-${String(_ayerD.getMonth()+1).padStart(2,'0')}-${String(_ayerD.getDate()).padStart(2,'0')}`;
    let todaySales = 0, totalSales = 0, totalCosts = 0, costsMesAnterior = 0, monthlySales = 0, ventasMesActual = 0, ventasMesAnterior = 0, _ventasAyer = 0;
    // Una sola pasada sobre salesHistory — calcula KPIs de hoy, mes actual, mes anterior y ayer.
    for (const s of (salesHistory || [])) {
        if (s.method === 'Cancelado') continue;
        if (s.type === 'pedido' || s.type === 'abono' || s.type === 'anticipo') continue;
        const t = s.total || 0;
        const d = s.date || '';
        if (d === today)                        todaySales     += t;
        else if (d === _ayer)                   _ventasAyer    += t;
        if (d.startsWith(mesActualStr))       { totalSales += t; totalCosts += (s.products || []).reduce((a: number, p: any) => a + ((p.costoAlVender ?? p.cost ?? 0) * (p.quantity || 1)), 0); monthlySales += t; ventasMesActual += t; }
        else if (d.startsWith(mesAnteriorStr)){ ventasMesAnterior += t; costsMesAnterior += (s.products || []).reduce((a: number, p: any) => a + ((p.costoAlVender ?? p.cost ?? 0) * (p.quantity || 1)), 0); }
    }
    // Pedidos finalizados — usar p.total como fuente de verdad (igual que balance.js)
    for (const p of (window.pedidosFinalizados || [])) {
        if (!p.total) continue;
        const fecha = ((p.fechaFinalizado || p.fecha || '')).split('T')[0];
        if (!fecha) continue;
        const monto = Number(p.total);
        const costo = Number(p.costoMateriales || p.costo || 0);
        if (fecha === today)                           { todaySales  += monto; }
        else if (fecha === _ayer)                      { _ventasAyer += monto; }
        if (fecha.startsWith(mesActualStr))          { totalSales += monto; totalCosts += costo; monthlySales += monto; ventasMesActual += monto; }
        else if (fecha.startsWith(mesAnteriorStr))   { ventasMesAnterior += monto; costsMesAnterior += costo; }
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
    if (monthSalesEl) monthSalesEl.textContent = fmtMoney(monthlySales);

    // ── Stock bajo + Predictivo — una sola pasada O(n) ──
    const _gse = typeof getStockEfectivo === 'function' ? getStockEfectivo : (p: any) => p.stock || 0;
    const lowStockItems: any[] = [], outOfStock: any[] = [];
    for (const p of (products || [])) {
        const s = _gse(p);
        if (s === 0) outOfStock.push(p);
        else if (s <= (p.stockMin || 5)) lowStockItems.push(p);
    }
    const lowStockBadge = document.getElementById('lowStockBadge');
    if (lowStockBadge) lowStockBadge.textContent = (lowStockItems.length + outOfStock.length) + ' items';
    // UX5: badge de stock crítico en el sidebar para visibilidad sin entrar al módulo
    const _sidebarBadgeInv = document.getElementById('sidebarBadgeInventory');
    if (_sidebarBadgeInv) {
        const _totalAlerts = lowStockItems.length + outOfStock.length;
        if (_totalAlerts > 0) {
            const _prevInvVal = (_sidebarBadgeInv as any)._lastVal;
            _sidebarBadgeInv.textContent = String(_totalAlerts);
            _sidebarBadgeInv.style.display = '';
            _sidebarBadgeInv.title = `${outOfStock.length} agotado(s) · ${lowStockItems.length} bajo stock`;
            // N-UI-6: pop animation si el valor cambió
            if (_prevInvVal !== _totalAlerts) _animateBadgePop(_sidebarBadgeInv);
            (_sidebarBadgeInv as any)._lastVal = _totalAlerts;
        } else {
            _sidebarBadgeInv.style.display = 'none';
            (_sidebarBadgeInv as any)._lastVal = 0;
        }
    }

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
        const totalVendido = (ventasPorProductoId[k] || 0) || (ventasPorProductoNombre[kn] || 0);
        const promDiario = totalVendido / 30;
        if (!promDiario) return null;
        const _gse2 = typeof getStockEfectivo === 'function' ? getStockEfectivo : (p => p.stock || 0);
        return Math.floor(_gse2(producto) / promDiario);
    }

    // N-TOOLTIP-003: helper para calcular promDiario de un producto
    function _promDiarioProd(producto) {
        const k = String(producto.id || '');
        const kn = (producto.name || '').toLowerCase();
        const totalVendido = (ventasPorProductoId[k] || 0) || (ventasPorProductoNombre[kn] || 0);
        return totalVendido / 30;
    }

    const lowStockList = document.getElementById('dashLowStockList');
    if (lowStockList) {
        const all = [...outOfStock.map(p => ({...p, out: true})), ...lowStockItems];
        if (all.length === 0) {
            lowStockList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Todo en orden 👍</p>';
        } else {
            lowStockList.innerHTML = all.slice(0, 8).map(p => {
                const dias = p.out ? null : diasRestantes(p);
                const _gse3 = typeof getStockEfectivo === 'function' ? getStockEfectivo : (x => x.stock || 0);
                const _stockActual = _gse3(p);
                const _prom = _promDiarioProd(p);
                let predBadge = '';
                if (p.out) {
                    // N-TOOLTIP-003: tooltip en badge Agotado
                    predBadge = `<span class="pred-badge pred-critico" title="Sin stock — reorden urgente">Agotado</span>`;
                } else if (dias !== null) {
                    // N-TOOLTIP-003: tooltip con detalle de cálculo
                    const _tooltipText = `Prom. ventas: ${_prom.toFixed(1)} u/día · Stock actual: ${_stockActual} u · Estimado: ~${dias} días`;
                    if      (dias <= 2)  predBadge = `<span class="pred-badge pred-critico" title="${_tooltipText}">~${dias}d ⚠️</span>`;
                    else if (dias <= 5)  predBadge = `<span class="pred-badge pred-urgente" title="${_tooltipText}">~${dias}d</span>`;
                    else if (dias <= 14) predBadge = `<span class="pred-badge pred-pronto"  title="${_tooltipText}">~${dias}d</span>`;
                    else                predBadge = `<span class="pred-badge pred-ok"       title="${_tooltipText}">~${dias}d</span>`;
                } else {
                    // N-TOOLTIP-003: tooltip en badge Sin datos
                    predBadge = `<span class="pred-badge" style="background:#f3f4f6;color:#9ca3af;" title="Sin historial de ventas — no se puede predecir">${p.stock} uds</span>`;
                }
                return `
                <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <span class="text-base flex-shrink-0">${p.image || '📦'}</span>
                        <span class="text-xs text-gray-700 truncate">${_esc(p.name)}</span>
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
    const _calcSaldo = _csp;
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
    // _ventasAyer y _ayer ya calculados en el loop principal de salesHistory

    // Sincronizar KPIs de la sección bienvenida (evita recalcular en renderBienvenida)
    const _fmtMorn = (v: number) => '$' + v.toLocaleString('es-MX', {minimumFractionDigits:0, maximumFractionDigits:0});
    const _mds = document.getElementById('mornDailySales');
    const _mrv = document.getElementById('mornReceivable');
    const _mss = document.getElementById('mornSalesSub');
    if (_mds) _mds.textContent = _fmtMorn(todaySales);
    if (_mrv) _mrv.textContent = _fmtMorn(accountsReceivable);
    if (_mss) {
        if (_ventasAyer > 0) {
            const _pct = Math.round((todaySales - _ventasAyer) / _ventasAyer * 100);
            _mss.textContent = (_pct >= 0 ? '▲ +' : '▼ ') + Math.abs(_pct) + '% vs ayer';
            (_mss as HTMLElement).style.color = _pct >= 0 ? '#16a34a' : '#dc2626';
        } else {
            const _cntHoy = (salesHistory || []).filter((s:any) => s.date === today && s.method !== 'Cancelado' && !['pedido','abono','anticipo'].includes(s.type||'')).length;
            _mss.textContent = `${_cntHoy} venta${_cntHoy !== 1 ? 's' : ''} hoy`;
            (_mss as HTMLElement).style.color = '';
        }
    }

    const _kpiAnim = (el: any, val: number) => {
        if (!el) return;
        const prev = (el._mkLast ?? null);
        el._mkLast = val;
        animarNumero(el, prev ?? val, val, prev === null || prev === val ? 0 : 500, '$', '');
    };
    // D4: inyectar hover/transition en tarjetas KPI una sola vez
    if (!document.getElementById('_mkKpiHoverStyles')) {
        const _kpiSt = document.createElement('style');
        _kpiSt.id = '_mkKpiHoverStyles';
        _kpiSt.textContent = `
            #dailySales, #netProfit, #accountsReceivable, #dashActivePedidos {
                transition: transform .15s ease, box-shadow .15s ease;
            }
            #dailySales:hover, #netProfit:hover, #accountsReceivable:hover { color: var(--mk-gold-500, #C9933A) !important; }
            [id="dailySales"], [id="netProfit"], [id="accountsReceivable"], [id="dashActivePedidos"] {
                transition: color .15s ease;
            }
        `;
        const _kpiCards = [ds, np, ar, ap].map(el => el?.closest('.kpi-card, [class*="rounded-xl"], [class*="card"], [style*="border-radius"]') as HTMLElement | null);
        _kpiCards.forEach(card => {
            if (card && !card.dataset.mkKpiHover) {
                card.dataset.mkKpiHover = '1';
                card.style.transition = 'transform .15s ease, box-shadow .15s ease';
                card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; });
                card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
            }
        });
        document.head.appendChild(_kpiSt);
    }
    _kpiAnim(ds, todaySales);
    if (np) {
        _kpiAnim(np, netProfit);
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
    _kpiAnim(ar, accountsReceivable);
    if (ap) {
        ap.textContent = activePedidos;
        // Feature: KPI pedidos activos clickeable — navega a pedidos
        const apCard = ap.closest('[class*="card"], .rounded-xl, [style*="border-radius"]') as HTMLElement | null;
        if (apCard && !apCard._mkKpiClick) {
            apCard._mkKpiClick = true;
            apCard.style.cursor = 'pointer';
            // No agregar title — el tooltip nativo del browser aparece como barra negra
            apCard.addEventListener('click', () => { if (typeof showSection === 'function') showSection('pedidos'); });
        }
    }
    // Defer chart renders escalonados — cada rAF/setTimeout cede el hilo al browser
    // para que pueda pintar entre renders pesados (cashflow ~100ms solo).
    requestAnimationFrame(() => {
        try { renderSparkline(); } catch(e) {}
        try { renderComparativaSemanal(); } catch(e) {}
        try { checkGastosInusuales(); } catch(e) {}
        try { renderHeatmapPedidos(); } catch(e) {}
        // cashflow y clima en un frame posterior para no bloquear el primer paint
        setTimeout(() => {
            try { renderCashFlowChart(); } catch(e) {}
            setTimeout(() => { try { renderWidgetClima(); } catch(e) {} }, 0);
        }, 0);
    });

    // R2-A5: Desglose "Me deben" por cliente — onclick en la tarjeta
    const arCard = ar ? ar.closest('[onclick]') || ar.parentElement : null;
    if (arCard && !arCard._meDeben_handler) {
        arCard._meDeben_handler = true;
        arCard.style.cursor = 'pointer';
        arCard.addEventListener('click', function() {
            const pedidosArr = window.pedidos || pedidos || [];
            const _calcS = _csp;
            // Agrupar por cliente los pedidos con saldo > 0
            // U4-S26: capturar también el teléfono para ofrecer recordatorio por WhatsApp
            const mapa: Record<string, { monto: number; tel: string }> = {};
            pedidosArr
                .filter(p => !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase()))
                .forEach(p => {
                    const saldo = _calcS(p);
                    if (saldo <= 0) return;
                    const nombre = p.cliente || 'Sin nombre';
                    if (!mapa[nombre]) mapa[nombre] = { monto: 0, tel: '' };
                    mapa[nombre].monto += saldo;
                    if (!mapa[nombre].tel) {
                        const _t = String(p.telefono || p.whatsapp || '').replace(/\D/g,'');
                        if (_t) mapa[nombre].tel = _t;
                    }
                });
            const entradas = Object.entries(mapa).sort((a, b) => b[1].monto - a[1].monto);
            if (entradas.length === 0) {
                manekiToastExport('No hay saldos pendientes por cobrar', 'ok');
                return;
            }
            const total = entradas.reduce((s, [,v]) => s + v.monto, 0);
            // U4-S26: texto plano para copiar/compartir el desglose completo
            const _resumenTexto = 'Saldos pendientes (Me deben):\n'
                + entradas.map(([n, i]) => `• ${n}: ${fmtMoney(i.monto)}`).join('\n')
                + `\n\nTotal: ${fmtMoney(total)}`;
            // Mostrar desglose en modal propio en lugar de alert() del OS
            const _isDark = document.body.classList.contains('dark');
            const _rowTextColor = _isDark ? '#e5e7eb' : '#374151';
            const _rowBorderColor = _isDark ? '#334155' : '#f3f4f6';
            const filas = entradas.map(([nombre, info]) => {
                const _waTxt = encodeURIComponent(`Hola ${nombre}, te recordamos tu saldo pendiente de ${fmtMoney(info.monto)} con Maneki Store 😊 ¿Cómo te gustaría liquidarlo?`);
                const _waLink = info.tel
                    ? `<a href="https://wa.me/52${info.tel}?text=${_waTxt}" target="_blank" onclick="event.stopPropagation()" title="Recordar por WhatsApp" style="color:#25D366;text-decoration:none;font-size:1rem;margin-left:10px;flex-shrink:0;"><i class="fab fa-whatsapp"></i></a>`
                    : '';
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid ${_rowBorderColor};">
                    <span style="font-size:.85rem;color:${_rowTextColor};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(nombre)}</span>
                    <span style="font-size:.85rem;font-weight:700;color:#dc2626;margin-left:12px;white-space:nowrap;">${fmtMoney(info.monto)}</span>
                    ${_waLink}
                </div>`;
            }).join('');
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
                    <button id="_meDeben_copy" class="mk-btn-primary" style="margin-top:14px;width:100%;justify-content:center;">📋 Copiar desglose</button>
                </div>`;
                document.body.appendChild(_mdc);
                document.getElementById('_meDeben_close').addEventListener('click', () => { _mdc.style.display = 'none'; });
                _mdc.addEventListener('click', e => { if (e.target === _mdc) _mdc.style.display = 'none'; });
                // U4-S26: copiar el desglose actual (texto guardado en el elemento en cada apertura)
                document.getElementById('_meDeben_copy').addEventListener('click', () => {
                    const txt = (_mdc as any)._resumen || '';
                    const _ok = () => manekiToastExport('📋 Desglose copiado al portapapeles', 'ok');
                    const _fallback = () => {
                        try {
                            const ta = document.createElement('textarea');
                            ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0;';
                            document.body.appendChild(ta); ta.select();
                            document.execCommand('copy'); ta.remove(); _ok();
                        } catch(e) { manekiToastExport('No se pudo copiar', 'warn'); }
                    };
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(txt).then(_ok).catch(_fallback);
                    } else { _fallback(); }
                });
            }
            (_mdc as any)._resumen = _resumenTexto;
            document.getElementById('_meDeben_body').innerHTML = filas;
            document.getElementById('_meDeben_totalVal').textContent = fmtMoney(total);
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
        const _ganActual   = ventasMesActual   - totalCosts;
        const _ganAnterior = ventasMesAnterior - costsMesAnterior;
        const _ganDiffPct  = _ganAnterior > 0 ? Math.round(((_ganActual - _ganAnterior) / _ganAnterior) * 100) : null;
        const _ganTrend    = _ganDiffPct === null ? '' : _ganDiffPct >= 0
            ? `<span style="color:#16a34a;font-size:.65rem;font-weight:700;">▲${_ganDiffPct}%</span>`
            : `<span style="color:#dc2626;font-size:.65rem;font-weight:700;">▼${Math.abs(_ganDiffPct)}%</span>`;
        mesVsAnteriorEl.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
                <span style="font-size:.72rem;color:#6b7280;text-transform:capitalize;">${mesActualNombre}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:1rem;font-weight:900;color:#1e40af;">${fmtMoney(ventasMesActual)}</span>
                    ${trend}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:.72rem;color:#9ca3af;text-transform:capitalize;">${mesAnteriorNombre}</span>
                <span style="font-size:.82rem;font-weight:600;color:#9ca3af;">${fmtMoney(ventasMesAnterior)}</span>
            </div>
            ${ventasMesAnterior > 0 ? `
            <div style="background:#dbeafe;border-radius:99px;height:5px;overflow:hidden;margin-bottom:8px;">
                <div style="background:#3b82f6;height:100%;border-radius:99px;width:${barPct}%;transition:width .6s ease;"></div>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
                <span style="font-size:.68rem;color:#15803d;font-weight:700;">💰 Ganancia neta</span>
                <div style="display:flex;align-items:center;gap:5px;">
                    <span style="font-size:.78rem;font-weight:800;color:${_ganActual>=0?'#15803d':'#dc2626'};">${fmtMoney(_ganActual)}</span>
                    ${_ganTrend}
                </div>
            </div>
            ${ventasMesAnterior > 0 ? '' : '<p style="font-size:.7rem;color:#9ca3af;text-align:center;padding-top:6px;">Sin historial del mes anterior</p>'}`;
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

    // Widgets secundarios diferidos — los KPIs y entregas se pintan antes.
    // Cada setTimeout(0) cede el hilo al browser para que pueda repintar entre cada bloque.
    actualizarSidebarBadges();
    if (typeof actualizarBadgePOS === 'function') actualizarBadgePOS();
    setTimeout(() => {
        try { checkAlertasEntregas(); } catch(e) {}
        try { checkPedidosSinMovimiento(); } catch(e) {}
        try { renderSyncIndicator(); } catch(e) {}
        setTimeout(() => {
            try { _renderAtencionHoy(); } catch(e) {}
            try { _renderDiaMasRentable(); } catch(e) {}
            try { renderResumenDia(); } catch(e) {}
            try { renderAccesosRapidos(); } catch(e) {}
            try { _renderWidgetTemporadas(); } catch(e) {}
        }, 0);
    }, 0);
}

// NTH-08: Widget día más rentable de la semana ──────────────────────────────
function _renderDiaMasRentable() {
    const el = document.getElementById('diaMasRentableWidget');
    if (!el) return;
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const totales = [0,0,0,0,0,0,0];
    const fechasVistas = [new Set(),new Set(),new Set(),new Set(),new Set(),new Set(),new Set()];
    const _hace90 = new Date(); _hace90.setDate(_hace90.getDate() - 90);
    const _hace90str = `${_hace90.getFullYear()}-${String(_hace90.getMonth()+1).padStart(2,'0')}-${String(_hace90.getDate()).padStart(2,'0')}`;
    const fuentes = [
        ...(window.salesHistory||[]).filter(s => s.date && s.date >= _hace90str && s.method !== 'Cancelado' && s.type !== 'anticipo' && s.type !== 'abono'),
        ...(window.pedidosFinalizados||[]).filter(p => (p.fechaFinalizado||p.fecha||'').split('T')[0] >= _hace90str).map(p => ({ date:(p.fechaFinalizado||p.fecha||'').split('T')[0], total:p.total }))
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
        _csp(p) > 0
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
        el.innerHTML = items.map(i => `<div class="text-sm py-1 border-b border-gray-100">${typeof _esc === 'function' ? _esc(i) : i}</div>`).join('');
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
                // doble rAF para reiniciar animación sin forced reflow (evita void offsetWidth)
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    badgePedidos.classList.add('badge-new');
                    _animateBadgePop(badgePedidos);
                }));
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
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    badgeInv.classList.add('badge-new');
                    _animateBadgePop(badgeInv);
                }));
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
                <button onclick="typeof openPedidoStatusModal==='function'?openPedidoStatusModal('${_esc(p.id)}'):window._mkLazyLoad('pedidos').then(()=>openPedidoStatusModal('${_esc(p.id)}'))" style="font-size:.7rem;color:#6b7280;background:none;border:1px solid #d1d5db;border-radius:6px;padding:2px 8px;cursor:pointer;margin-top:4px;">Actualizar</button>
            </div>
        </div>`).join('');
}
window.checkPedidosSinMovimiento = checkPedidosSinMovimiento;

// ── MEJ-NEW-1: Indicador de sincronización con Supabase ──────────────────────
function renderSyncIndicator() {
    // Determinar estado de conexión
    let estado = 'ok'; // 'ok' | 'syncing' | 'offline'
    if (!navigator.onLine) {
        estado = 'offline';
    } else if (window._supabaseOnline === false) {
        estado = 'offline';
    } else if (window._supabaseSyncing === true) {
        estado = 'syncing';
    }

    const iconMap   = { ok: '🟢', syncing: '🟡', offline: '🔴' };
    const labelMap  = { ok: 'Sincronizado', syncing: 'Sincronizando...', offline: 'Sin conexión' };
    const colorMap  = { ok: '#16a34a', syncing: '#d97706', offline: '#dc2626' };
    const icon  = iconMap[estado];
    const label = labelMap[estado];
    const color = colorMap[estado];

    const indicadorStyle = 'display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:600;padding:3px 10px;border-radius:99px;background:rgba(255,255,255,.85);border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:default;user-select:none;';
    let el = document.getElementById('syncIndicator');
    if (!el) {
        // Buscar el header del dashboard e inyectar el indicador
        const header = document.getElementById('dashDate')?.closest('.flex, header, [class*="header"]')
            || document.getElementById('dashGreeting')?.closest('.flex, [class*="header"], [class*="card"]')
            || document.querySelector('#dashboard-section, #dashboardSection, [id*="dashboard"]');
        if (!header) {
            console.warn('[SyncIndicator] No se encontró contenedor de header para el indicador de sync');
            // Fallback: intentar agregar al footer del sidebar
            const fallback = document.querySelector('#sidebar footer, #sidebar .mt-auto, aside footer');
            if (fallback && !document.getElementById('syncIndicator')) {
                const indicadorHTML = `<div id="syncIndicator" style="${indicadorStyle}margin:8px;"></div>`;
                fallback.insertAdjacentHTML('afterbegin', indicadorHTML);
                el = document.getElementById('syncIndicator');
            }
            if (!el) return;
        } else {
            el = document.createElement('div');
            el.id = 'syncIndicator';
            el.style.cssText = indicadorStyle;
            header.insertAdjacentElement('afterbegin', el);
        }
    }
    el.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;"></span><span style="color:${color};">${label}</span>`;

    // Registrar listener online/offline una sola vez
    if (!window._syncIndicatorBound) {
        window._syncIndicatorBound = true;
        window.addEventListener('online',  () => renderSyncIndicator());
        window.addEventListener('offline', () => renderSyncIndicator());
    }

    // FIX-8: banner de offline más visible en la parte superior del contenido principal
    _toggleSyncBanner(estado === 'offline' || estado === 'error');
}
window.renderSyncIndicator = renderSyncIndicator;

function _toggleSyncBanner(offline) {
    let banner = document.getElementById('syncOfflineBanner');
    if (offline) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'syncOfflineBanner';
            banner.style.cssText = 'background:#ef4444;color:white;text-align:center;padding:4px 12px;font-size:12px;font-weight:600;position:sticky;top:0;z-index:100';
            banner.textContent = '⚠️ Sin conexión — los cambios se guardarán localmente';
            const main = document.querySelector('main, .main-content, #mainContent');
            if (main) main.insertAdjacentElement('afterbegin', banner);
        }
    } else {
        if (banner) banner.remove();
    }
}
window._toggleSyncBanner = _toggleSyncBanner;

// ── MEJ-NEW-2: Resumen del día (card de bienvenida) ──────────────────────────
function renderResumenDia() {
    const now  = new Date();
    const hora = now.getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

    const fechaStr = now.toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    // Capitalizar primera letra
    const fechaCap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);

    const hoy = (typeof window._fechaHoy === 'function') ? window._fechaHoy() : (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    })();

    const pedidosActivos = (window.pedidos || []).filter(p =>
        !['finalizado','cancelado'].includes((p.status || '').toLowerCase())
    );
    const nActivos = pedidosActivos.length;

    const nHoy = pedidosActivos.filter(p => (p.entrega || p.fechaEntrega) === hoy).length;

    const totalPorCobrar = pedidosActivos.reduce((acc, p) => acc + _csp(p), 0);

    const sinFecha = pedidosActivos.filter(p => !p.entrega && !p.fechaEntrega).length;

    const nombreTienda = window.storeConfig?.name || window.storeConfig?.storeName || window.storeName || 'Maneki';

    const html = `
        <div id="resumenDia" style="background:linear-gradient(135deg,#fff9f0 0%,#fffbf5 100%);border:1.5px solid #f5e6cc;border-radius:18px;padding:20px 22px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
                <div>
                    <h2 style="font-size:1.15rem;font-weight:800;color:#1f2937;margin:0;">${saludo}, ${nombreTienda} 🐱</h2>
                    <p style="font-size:.8rem;color:#9ca3af;margin:2px 0 0;">${fechaCap}</p>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;">
                <div style="background:#fff;border-radius:12px;padding:10px 12px;border:1px solid #f3e8d0;cursor:pointer;transition:box-shadow .15s;" class="hover:shadow-md" onclick="showSection('pedidos')" title="Ver pedidos">
                    <p style="font-size:1.4rem;font-weight:900;color:#C5973B;margin:0;">${nActivos}</p>
                    <p style="font-size:.7rem;color:#6b7280;margin:2px 0 0;">pedidos activos</p>
                </div>
                <div style="background:#fff;border-radius:12px;padding:10px 12px;border:1px solid #f3e8d0;cursor:pointer;transition:box-shadow .15s;" class="hover:shadow-md" onclick="showSection('pedidos');typeof setPedidoFiltro==='function'&&setPedidoFiltro('entregado')" title="Ver entregas de hoy">
                    <p style="font-size:1.4rem;font-weight:900;color:#f97316;margin:0;">${nHoy}</p>
                    <p style="font-size:.7rem;color:#6b7280;margin:2px 0 0;">para entregar hoy</p>
                </div>
                <div style="background:#fff;border-radius:12px;padding:10px 12px;border:1px solid #f3e8d0;">
                    <p style="font-size:1.1rem;font-weight:900;color:#dc2626;margin:0;">${fmtMoney(totalPorCobrar)}</p>
                    <p style="font-size:.7rem;color:#6b7280;margin:2px 0 0;">por cobrar</p>
                </div>
                ${sinFecha > 0 ? `<div style="background:#fef9c3;border-radius:12px;padding:10px 12px;border:1px solid #fde68a;">
                    <p style="font-size:1.4rem;font-weight:900;color:#b45309;margin:0;">${sinFecha}</p>
                    <p style="font-size:.7rem;color:#92400e;margin:2px 0 0;">sin fecha de entrega</p>
                </div>` : ''}
            </div>
        </div>`;

    // Actualizar si ya existe, o inyectar antes del primer contenido del dashboard
    const existing = document.getElementById('resumenDia');
    if (existing) {
        // Actualizar solo el contenido interno — no reemplazar el nodo para no romper
        // la referencia que usa accesosRapidos (insertAdjacentElement afterend)
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const newContent = temp.firstElementChild;
        if (newContent) existing.innerHTML = newContent.innerHTML;
        return;
    }

    // Buscar el contenedor raíz del dashboard para insertar al inicio
    const dashRoot = document.querySelector('#dashboard-section > div, #dashboardSection > div, [id*="dashboard-section"] > div')
        || document.getElementById('dashGoalBar')?.closest('.p-6, .p-4, [class*="card"]')?.parentElement;
    if (dashRoot) {
        dashRoot.insertAdjacentHTML('afterbegin', html);
    }
}
window.renderResumenDia = renderResumenDia;

// ── MEJ-NEW-3: Accesos rápidos (quick actions) ───────────────────────────────
function renderAccesosRapidos() {
    if (document.getElementById('accesosRapidos')) return; // No duplicar

    const acciones = [
        { emoji: '➕', label: 'Nuevo Pedido',     fn: () => { if (typeof openPedidoModal === 'function') openPedidoModal(); else manekiToastExport('Módulo no cargado', 'warn'); } },
        { emoji: '📦', label: 'Inventario',       fn: () => { if (typeof showSection === 'function') showSection('inventario'); } },
        { emoji: '💰', label: 'Registrar Cobro',  fn: () => { if (typeof openIncomeModal === 'function') openIncomeModal(); else if (typeof showSection === 'function') showSection('balance'); } },
        { emoji: '📊', label: 'Reportes',         fn: () => { if (typeof showSection === 'function') showSection('reportes'); } },
        { emoji: '👤', label: 'Clientes',         fn: () => { if (typeof showSection === 'function') showSection('clientes'); } },
    ];

    const container = document.createElement('div');
    container.id = 'accesosRapidos';
    container.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:8px;padding:12px 16px;margin-bottom:16px;';

    acciones.forEach((a, i) => {
        const btn = document.createElement('button');
        btn.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px 8px;min-height:64px;background:#fff;border:1.5px solid #f3f4f6;border-radius:14px;cursor:pointer;font-family:inherit;transition:border-color .15s,box-shadow .15s;';
        btn.innerHTML = `<span style="font-size:1.5rem;line-height:1;">${a.emoji}</span><span style="font-size:.68rem;font-weight:700;color:#374151;text-align:center;line-height:1.2;">${a.label}</span>`;
        btn.title = a.label;
        btn.addEventListener('click', a.fn);
        btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#C5973B'; btn.style.boxShadow = '0 2px 8px rgba(197,165,114,.18)'; });
        btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#f3f4f6'; btn.style.boxShadow = ''; });
        container.appendChild(btn);
    });

    // Inyectar después del resumenDia si existe, o al inicio del dashboard
    const afterResumen = document.getElementById('resumenDia');
    if (afterResumen) {
        afterResumen.insertAdjacentElement('afterend', container);
        return;
    }
    const dashRoot = document.querySelector('#dashboard-section > div, #dashboardSection > div, [id*="dashboard-section"] > div')
        || document.getElementById('dashGoalBar')?.closest('.p-6, .p-4, [class*="card"]')?.parentElement;
    if (dashRoot) {
        dashRoot.insertAdjacentElement('afterbegin', container);
    }
}
window.renderAccesosRapidos = renderAccesosRapidos;

// ══════════════════════════════════════════════════════════════
// N-VIZ-001: Regresión lineal para línea de tendencia en gráficas
// ══════════════════════════════════════════════════════════════
function _calcTrend(data: number[]): number[] {
    const n = data.length;
    if (n < 2) return data.map(() => 0);
    const xMean = (n - 1) / 2;
    const yMean = data.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    data.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
    const slope = den ? num / den : 0;
    const intercept = yMean - slope * xMean;
    return data.map((_, x) => Math.max(0, Math.round(slope * x + intercept)));
}

// ══════════════════════════════════════════════════════════════
// #14 — GRÁFICA FLUJO DE CAJA (Ingresos vs Gastos últimas 8 semanas)
// ══════════════════════════════════════════════════════════════
let _cashFlowChart = null;
function renderCashFlowChart() {
    const canvas = document.getElementById('dashCashFlowChart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') return;

    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const semanas = 8;
    const _fLocal = (d: Date) => d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);

    // Calcular límite inferior (inicio de la semana más antigua) — O(1)
    const limiteInf = new Date(hoy);
    limiteInf.setDate(limiteInf.getDate() - (semanas - 1) * 7 - 6);
    const limiteInfStr = _fLocal(limiteInf);

    // Construir los rangos de semana una sola vez
    const rangos: Array<{ini: string; fin: string; label: string}> = [];
    for (let i = semanas - 1; i >= 0; i--) {
        const finSemana = new Date(hoy); finSemana.setDate(hoy.getDate() - i * 7);
        const iniSemana = new Date(finSemana); iniSemana.setDate(finSemana.getDate() - 6);
        rangos.push({
            ini: _fLocal(iniSemana),
            fin: _fLocal(finSemana),
            label: iniSemana.getDate() + '/' + (iniSemana.getMonth()+1) + ' - ' + finSemana.getDate() + '/' + (finSemana.getMonth()+1)
        });
    }

    // Una sola pasada O(n) sobre cada fuente — en lugar de 8 pasadas
    const ingresos = new Array(semanas).fill(0);
    const gastos   = new Array(semanas).fill(0);

    (window.salesHistory||[]).forEach((s: any) => {
        if (!s.date || s.method==='Cancelado' || s.type==='abono' || s.type==='anticipo') return;
        if (s.date < limiteInfStr) return;
        for (let i = 0; i < semanas; i++) {
            if (s.date >= rangos[i].ini && s.date <= rangos[i].fin) { ingresos[i] += Number(s.total||0); break; }
        }
    });
    (window.pedidosFinalizados||[]).forEach((p: any) => {
        const f = ((p.fechaFinalizado||p.fecha||'')).split('T')[0];
        if (!f || f < limiteInfStr) return;
        for (let i = 0; i < semanas; i++) {
            if (f >= rangos[i].ini && f <= rangos[i].fin) { ingresos[i] += Number(p.total||0); break; }
        }
    });
    (window.expenses||[]).forEach((e: any) => {
        if (!e.date || e.date < limiteInfStr) return;
        for (let i = 0; i < semanas; i++) {
            if (e.date >= rangos[i].ini && e.date <= rangos[i].fin) { gastos[i] += Number(e.amount||0); break; }
        }
    });

    ingresos.forEach((v, i) => { ingresos[i] = Math.round(v); });
    gastos.forEach((v, i)   => { gastos[i]   = Math.round(v); });
    const labels = rangos.map(r => r.label);

    // Actualizar en lugar de destroy+new — ahorra ~80-120ms por render
    if (_cashFlowChart) {
        _cashFlowChart.data.labels = labels;
        _cashFlowChart.data.datasets[0].data = ingresos;
        _cashFlowChart.data.datasets[1].data = gastos;
        _cashFlowChart.data.datasets[2].data = _calcTrend(ingresos);
        _cashFlowChart.update('none');
        return;
    }

    _cashFlowChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: ingresos,
                    backgroundColor: 'rgba(22, 163, 74, 0.7)',
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Gastos',
                    data: gastos,
                    backgroundColor: 'rgba(220, 38, 38, 0.55)',
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Tendencia',
                    data: _calcTrend(ingresos),
                    type: 'line' as any,
                    borderColor: 'rgba(197,151,59,0.7)',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: false,
                    tension: 0,
                    order: 0,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: true, position: 'top', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toLocaleString('es-MX')
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, callback: v => '$'+v.toLocaleString('es-MX') } }
            }
        }
    });
}
window.renderCashFlowChart = renderCashFlowChart;

// ══════════════════════════════════════════════════════════════
// RESUMEN SEMANAL PARA WHATSAPP
// ══════════════════════════════════════════════════════════════
function generarResumenSemanalWA() {
    const hoy = new Date();
    const hace7 = new Date(hoy); hace7.setDate(hace7.getDate() - 7);
    const _f = d => d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
    const ini = _f(hace7), fin = _f(hoy);

    let ventasTotal = 0, ventasCount = 0;
    (window.salesHistory||[]).forEach(s => {
        if (!s.date || s.method==='Cancelado' || s.type==='abono' || s.type==='anticipo') return;
        if (s.date >= ini && s.date <= fin) { ventasTotal += Number(s.total||0); ventasCount++; }
    });
    (window.pedidosFinalizados||[]).forEach(p => {
        const f = (p.fechaFinalizado||p.fecha||'').split('T')[0];
        if (f >= ini && f <= fin) { ventasTotal += Number(p.total||0); ventasCount++; }
    });

    let gastosTotal = 0;
    (window.expenses||[]).forEach(e => {
        if (e.date && e.date >= ini && e.date <= fin) gastosTotal += Number(e.amount||0);
    });

    const pedidosNuevos = (window.pedidos||[]).filter(p => {
        const f = (p.fechaPedido||p.fechaCreacion||p.fecha||'').split('T')[0];
        return f >= ini && f <= fin;
    }).length;

    const neto = ventasTotal - gastosTotal;
    const ticket = ventasCount > 0 ? (ventasTotal / ventasCount) : 0;

    const texto = `📊 *Resumen Semanal — Maneki Store*\n` +
        `📅 ${ini} al ${fin}\n\n` +
        `💰 Ventas: $${ventasTotal.toLocaleString('es-MX',{minimumFractionDigits:2})} (${ventasCount} ventas)\n` +
        `💸 Gastos: $${gastosTotal.toLocaleString('es-MX',{minimumFractionDigits:2})}\n` +
        `📈 Neto: $${neto.toLocaleString('es-MX',{minimumFractionDigits:2})} ${neto >= 0 ? '✅' : '⚠️'}\n` +
        `🎫 Ticket promedio: $${ticket.toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0})}\n` +
        `📋 Pedidos nuevos: ${pedidosNuevos}\n\n` +
        `_Generado desde Maneki POS_`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            manekiToastExport('📋 Resumen copiado — pégalo en WhatsApp', 'ok');
        });
    } else {
        // A8: mostrar en modal en vez de prompt nativo
        if (typeof showConfirm === 'function') {
            showConfirm(`📋 Copia este resumen:\n\n${texto.substring(0, 300)}...`, 'Resumen WA generado');
        } else {
            manekiToastExport('Copia el resumen desde la consola', 'info');
        }
    }
    return texto;
}
window.generarResumenSemanalWA = generarResumenSemanalWA;

// ══════════════════════════════════════════════════════════════
// ALERTA DE GASTOS INUSUALES
// ══════════════════════════════════════════════════════════════
function checkGastosInusuales() {
    const expenses = window.expenses || [];
    if (expenses.length < 10) return;

    const hoy = new Date();
    const mesActual = hoy.getFullYear()+'-'+('0'+(hoy.getMonth()+1)).slice(-2);

    const porCategoria: Record<string, number[]> = {};
    expenses.forEach(e => {
        if (!e.date) return;
        const mes = e.date.substring(0, 7);
        const cat = e.etiqueta || e.category || 'Otros';
        if (!porCategoria[cat]) porCategoria[cat] = [];
        if (mes !== mesActual) porCategoria[cat].push(Number(e.amount || 0));
    });

    const gastosMesActual: Record<string, number> = {};
    expenses.forEach(e => {
        if (!e.date || !e.date.startsWith(mesActual)) return;
        const cat = e.etiqueta || e.category || 'Otros';
        gastosMesActual[cat] = (gastosMesActual[cat] || 0) + Number(e.amount || 0);
    });

    const alertas: Array<{cat: string, actual: number, promedio: number}> = [];
    for (const [cat, historial] of Object.entries(porCategoria)) {
        if (historial.length < 2) continue;
        const promedio = historial.reduce((s, v) => s + v, 0) / historial.length;
        const actual = gastosMesActual[cat] || 0;
        if (actual > promedio * 2 && actual > 100) {
            alertas.push({ cat, actual, promedio });
        }
    }

    if (alertas.length === 0) return;

    let banner = document.getElementById('alertaGastosInusuales');
    if (!banner) {
        const dashRoot = document.querySelector('#dashboard-section .grid, #dashboardSection .grid') ||
                         document.getElementById('semanalWidget')?.parentElement;
        if (!dashRoot) return;
        banner = document.createElement('div');
        banner.id = 'alertaGastosInusuales';
        dashRoot.insertAdjacentElement('beforeend', banner);
    }

    banner.innerHTML = `
        <div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:14px;padding:14px 16px;margin-top:12px;">
            <p style="font-size:.78rem;font-weight:800;color:#991B1B;margin:0 0 8px;">⚠️ Gastos inusuales este mes</p>
            ${alertas.map(a => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #FEE2E2;">
                    <span style="font-size:.75rem;color:#7F1D1D;">${a.cat}</span>
                    <span style="font-size:.75rem;font-weight:700;color:#DC2626;">$${a.actual.toFixed(0)} <span style="font-weight:400;color:#9CA3AF;">(prom: $${a.promedio.toFixed(0)})</span></span>
                </div>
            `).join('')}
        </div>`;
}
window.checkGastosInusuales = checkGastosInusuales;

// ══════════════════════════════════════════════════════════════
// WIDGET DE CLIMA — OpenMeteo (gratis, sin API key)
// ══════════════════════════════════════════════════════════════
let _climaCache: {data: any, ts: number} | null = null;
let _climaAbort: AbortController | null = null;
async function renderWidgetClima() {
    let card = document.getElementById('widgetClima');
    if (!card) {
        const target = document.getElementById('semanalWidget')?.parentElement
            || document.querySelector('#dashboard-section .space-y-4, #dashboardSection .space-y-4');
        if (!target) return;
        card = document.createElement('div');
        card.id = 'widgetClima';
        target.insertAdjacentElement('beforeend', card);
    }

    // Cache de 30 minutos
    if (_climaCache && (Date.now() - _climaCache.ts) < 30 * 60 * 1000) {
        _renderClimaHTML(card, _climaCache.data);
        return;
    }

    card.innerHTML = `<div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:1.2rem;">🌡️</span>
        <span style="font-size:.75rem;color:#0369A1;">Cargando clima...</span>
    </div>`;

    try {
        // Cancelar fetch previo si la sección cambió antes de que terminara
        if (_climaAbort) { _climaAbort.abort(); }
        _climaAbort = new AbortController();
        // Coordenadas Monterrey, NL
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.6866&longitude=-100.3161&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FMonterrey&forecast_days=1', { signal: _climaAbort.signal });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        _climaCache = { data, ts: Date.now() };
        _climaAbort = null;
        _renderClimaHTML(card, data);
    } catch(e: any) {
        if (e?.name === 'AbortError') return; // navegación antes de que terminara el fetch
        // H50: fallback visible cuando falla la API del clima
        card.innerHTML = `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:1.1rem;">🌤</span>
            <span style="font-size:.72rem;color:#9ca3af;">Clima no disponible</span>
        </div>`;
    }
}

function _climaIcono(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 2) return '🌤️';
    if (code <= 3) return '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌧️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    if (code <= 99) return '⛈️';
    return '🌡️';
}

function _climaDesc(code: number): string {
    if (code === 0) return 'Despejado';
    if (code <= 2) return 'Parcialmente nublado';
    if (code <= 3) return 'Nublado';
    if (code <= 48) return 'Neblina';
    if (code <= 57) return 'Llovizna';
    if (code <= 67) return 'Lluvia';
    if (code <= 77) return 'Nieve';
    if (code <= 82) return 'Chubascos';
    if (code <= 99) return 'Tormenta';
    return 'Variable';
}

function _renderClimaHTML(card: HTMLElement, data: any) {
    const cur = data.current;
    const daily = data.daily;
    const temp = Math.round(cur.temperature_2m);
    const max = Math.round(daily.temperature_2m_max[0]);
    const min = Math.round(daily.temperature_2m_min[0]);
    const icon = _climaIcono(cur.weathercode);
    const desc = _climaDesc(cur.weathercode);
    const humedad = cur.relativehumidity_2m;
    const viento = Math.round(cur.windspeed_10m);

    card.innerHTML = `
        <div style="background:linear-gradient(135deg,#FFF9F0,#FFF5E6);border:1px solid #F5E6CC;border-radius:14px;padding:12px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:2rem;line-height:1;">${icon}</span>
                    <div>
                        <p style="font-size:1.4rem;font-weight:800;color:#92622A;margin:0;line-height:1;">${temp}°C</p>
                        <p style="font-size:.7rem;color:#C5973B;margin:1px 0 0;">${desc} · Monterrey</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:.72rem;color:#6B7280;margin:0;">↑${max}° ↓${min}°</p>
                    <p style="font-size:.7rem;color:#6B7280;margin:2px 0 0;">💧${humedad}% 💨${viento}km/h</p>
                </div>
            </div>
        </div>`;
}
window.renderWidgetClima = renderWidgetClima;

// ══════════════════════════════════════════════════════════════
// Feature: Widget cuenta regresiva a temporadas
// ══════════════════════════════════════════════════════════════
function _renderWidgetTemporadas() {
    const container = document.getElementById('widgetTemporadas');
    if (!container) return;

    const hoy = new Date();
    const year = hoy.getFullYear();

    // N-ésimo <weekday> de un mes (weekday: 0=domingo … 6=sábado). Devuelve el día del mes.
    // Para fechas MOVIBLES como el Día del Padre (3er domingo de junio en México) que
    // cambian de día cada año — hardcodear el día las deja mal casi siempre.
    const _nthWeekday = (y: number, mes: number, weekday: number, n: number): number => {
        const primerDia = new Date(y, mes, 1).getDay();
        const offset = (weekday - primerDia + 7) % 7;
        return 1 + offset + (n - 1) * 7;
    };

    const temporadas = [
        { nombre: 'Día de Reyes',          emoji: '👑', mes: 0,  dia: 6  },
        { nombre: 'Día de la Candelaria',  emoji: '🕯️', mes: 1,  dia: 2  },
        { nombre: 'San Valentín',          emoji: '💝', mes: 1,  dia: 14 },
        { nombre: 'Día de la Mujer',       emoji: '💐', mes: 2,  dia: 8  },
        { nombre: 'Día del Contador',      emoji: '🧮', mes: 2,  dia: 25 },
        { nombre: 'Día del Autismo',       emoji: '🧩', mes: 3,  dia: 2  },
        { nombre: 'Día de la Secretaria',  emoji: '💼', mes: 3,  dia: 26 },
        { nombre: 'Día del Niño',          emoji: '🧸', mes: 3,  dia: 30 },
        { nombre: 'Día de las Madres',     emoji: '🌸', mes: 4,  dia: 10 },
        { nombre: 'Día de la Enfermera',   emoji: '🩺', mes: 4,  dia: 12 },
        { nombre: 'Día del Maestro',       emoji: '📚', mes: 4,  dia: 15 },
        { nombre: 'Día del Estudiante',    emoji: '🎒', mes: 4,  dia: 23 },
        { nombre: 'Día del Padre',         emoji: '👔', mes: 5,  dia: 21, diaFn: (y: number) => _nthWeekday(y, 5, 0, 3) }, // 3er domingo de junio (movible)
        { nombre: 'Graduaciones',          emoji: '🎓', mes: 5,  dia: 20 },
        { nombre: 'Día del Orgullo LGBT+', emoji: '🏳️‍🌈', mes: 5,  dia: 28 },
        { nombre: 'Día del Ingeniero',     emoji: '⚙️', mes: 6,  dia: 1  },
        { nombre: 'Día del Abogado',       emoji: '⚖️', mes: 6,  dia: 12 },
        { nombre: 'Día del Amigo',         emoji: '🤝', mes: 6,  dia: 20 },
        { nombre: 'Regreso a Clases',      emoji: '📓', mes: 7,  dia: 19 },
        { nombre: 'Día del Nutriólogo',    emoji: '🥗', mes: 7,  dia: 16 },
        { nombre: 'Día del Abuelo/a',      emoji: '👴', mes: 7,  dia: 28 },
        { nombre: 'Independencia MX',      emoji: '🇲🇽', mes: 8,  dia: 16 },
        { nombre: 'Día del Psicólogo',     emoji: '🧠', mes: 9,  dia: 22 },
        { nombre: 'Cáncer de Mama',        emoji: '🎀', mes: 9,  dia: 19 },
        { nombre: 'Día del Médico',        emoji: '⚕️', mes: 9,  dia: 23 },
        { nombre: 'Halloween',             emoji: '🎃', mes: 9,  dia: 31 },
        { nombre: 'Día de Muertos',        emoji: '💀', mes: 10, dia: 2  },
        { nombre: 'Virgen de Guadalupe',   emoji: '🌹', mes: 11, dia: 12 },
        { nombre: 'Posadas',               emoji: '🎁', mes: 11, dia: 16 },
        { nombre: 'Navidad',               emoji: '🎄', mes: 11, dia: 25 },
        { nombre: 'Año Nuevo',             emoji: '🎆', mes: 11, dia: 31 },
    ];

    // Ordenar las 3 próximas temporadas
    const proximas: any[] = temporadas.map(t => {
        // Fechas movibles: si la temporada define diaFn, se calcula el día para el año en uso.
        const _diaPara = (y: number) => (typeof (t as any).diaFn === 'function' ? (t as any).diaFn(y) : t.dia);
        let fecha = new Date(year, t.mes, _diaPara(year));
        if (fecha < hoy) fecha = new Date(year + 1, t.mes, _diaPara(year + 1));
        const diff = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return { ...t, fecha, diasRestantes: diff };
    }).sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 3);

    if (!proximas.length) return;

    container.innerHTML = proximas.map((proxima, idx) => {
        const ventasAnoPasado = (window.salesHistory || []).filter((s: any) => {
            if (!s.date) return false;
            const [yr, mo] = s.date.split('-');
            return Number(yr) === year - 1 && Number(mo) === proxima.mes + 1;
        }).reduce((sum: number, s: any) => sum + (s.total || 0), 0);

        const urgencia = proxima.diasRestantes <= 14 ? '#dc2626' : proxima.diasRestantes <= 30 ? '#d97706' : '#059669';
        const bg = idx === 0 ? '#f9fafb' : '#fff';
        const border = idx === 0 ? '1.5px solid #e5e7eb' : '1px solid #f3f4f6';

        return `<div class="flex items-center gap-3 p-3 rounded-xl" style="background:${bg};border:${border};${idx > 0 ? 'margin-top:6px;' : ''}">
            <span style="font-size:${idx === 0 ? '1.8rem' : '1.3rem'}">${proxima.emoji}</span>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-700" style="font-size:${idx === 0 ? '.8rem' : '.73rem'};margin:0;">${proxima.nombre}</p>
                <p class="text-gray-500" style="font-size:.7rem;margin:1px 0 0;">${proxima.fecha.toLocaleDateString('es-MX',{day:'numeric',month:'short'})}</p>
                ${ventasAnoPasado > 0 ? `<p style="font-size:.65rem;color:#9ca3af;margin:1px 0 0;">Año pasado: $${ventasAnoPasado.toLocaleString('es-MX')}</p>` : ''}
            </div>
            <div class="text-center" style="min-width:36px;">
                <p style="font-size:${idx === 0 ? '1.1rem' : '.9rem'};font-weight:800;color:${urgencia};margin:0;">${proxima.diasRestantes}</p>
                <p style="font-size:.62rem;color:#9ca3af;margin:0;">días</p>
            </div>
        </div>`;
    }).join('');
}
window._renderWidgetTemporadas = _renderWidgetTemporadas;

// ══════════════════════════════════════════════════════════════
// Feature: Semáforo de saturación en fechas de entrega
// ══════════════════════════════════════════════════════════════
function _getSaturacionFecha(fechaStr: string): string {
    const count = (window.pedidos || []).filter((p: any) =>
        p.entrega === fechaStr &&
        !['entregado','completado','cancelado'].includes(p.status)
    ).length;
    if (count <= 2) return '#22c55e';
    if (count <= 4) return '#f59e0b';
    return '#ef4444';
}
window._getSaturacionFecha = _getSaturacionFecha;

// ══════════════════════════════════════════════════════════════
// N-VIZ-003: Heatmap de pedidos por día y hora
// ══════════════════════════════════════════════════════════════
let _heatmapModo: 'count' | 'amount' = 'count';
function renderHeatmapPedidos(): void {
    const el = document.getElementById('dashHeatmapWidget');
    if (!el) return;

    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const bloques = ['6–9','9–12','12–15','15–18','18–21','21+'];
    const gridCount: number[][] = Array.from({length: 7}, () => new Array(6).fill(0));
    const gridAmount: number[][] = Array.from({length: 7}, () => new Array(6).fill(0));

    // Fuentes: pedidos + salesHistory
    const fuentesPedidos = [
        ...(window.pedidos || []).map((p: any) => ({ ts: p.fechaCreacion || p.fecha, monto: Number(p.total||0) })),
        ...(window.pedidosFinalizados || []).map((p: any) => ({ ts: p.fechaCreacion || p.fechaFinalizado || p.fecha, monto: Number(p.total||0) })),
    ];
    const fuentesSales = (window.salesHistory || []).map((s: any) => ({
        ts: s.createdAt || (s.date ? s.date + 'T12:00:00' : null),
        monto: Number(s.total||0)
    }));
    [...fuentesPedidos, ...fuentesSales].forEach(({ ts, monto }) => {
        if (!ts) return;
        try {
            const d = new Date(ts);
            if (isNaN(d.getTime())) return;
            const dia = d.getDay();
            const hora = d.getHours();
            const bloque = hora < 6 ? 5 : hora < 9 ? 0 : hora < 12 ? 1 : hora < 15 ? 2 : hora < 18 ? 3 : hora < 21 ? 4 : 5;
            gridCount[dia][bloque]++;
            gridAmount[dia][bloque] += monto;
        } catch(_) {}
    });

    const grid = _heatmapModo === 'amount' ? gridAmount : gridCount;
    const maxVal = Math.max(...grid.flat(), 1);
    const bg = (v: number) => {
        const t = v / maxVal;
        if (t === 0) return '#f9fafb';
        if (t < 0.25) return 'rgba(197,151,59,0.12)';
        if (t < 0.5)  return 'rgba(197,151,59,0.32)';
        if (t < 0.75) return 'rgba(197,151,59,0.58)';
        return 'rgba(197,151,59,0.85)';
    };
    const fg = (v: number) => v / maxVal > 0.5 ? '#5c3a00' : '#6b7280';
    const fmt = (v: number) => _heatmapModo === 'amount'
        ? (v >= 1000 ? '$' + (v/1000).toFixed(1) + 'k' : v > 0 ? '$' + v.toFixed(0) : '')
        : (v > 0 ? String(v) : '');

    // FIX-UI: altura fija en vez de aspect-ratio:1 — en pantallas anchas los
    // cuadros crecían enormes y el heatmap dominaba el dashboard
    el.innerHTML = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
            <div style="display:inline-flex;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;font-size:.65rem;">
                <button onclick="_heatmapModo='count';renderHeatmapPedidos()" style="padding:3px 10px;cursor:pointer;background:${_heatmapModo==='count'?'#C5973B':'#fff'};color:${_heatmapModo==='count'?'#fff':'#6b7280'};border:none;font-weight:600;font-size:.65rem;">Pedidos</button>
                <button onclick="_heatmapModo='amount';renderHeatmapPedidos()" style="padding:3px 10px;cursor:pointer;background:${_heatmapModo==='amount'?'#C5973B':'#fff'};color:${_heatmapModo==='amount'?'#fff':'#6b7280'};border:none;font-weight:600;font-size:.65rem;">Montos</button>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:36px repeat(6,minmax(0,1fr));gap:2px;font-size:.62rem;max-width:520px;">
            <div></div>
            ${bloques.map(b => `<div style="text-align:center;color:#9ca3af;font-weight:700;padding-bottom:2px;">${b}</div>`).join('')}
            ${dias.map((dia, d) => `
                <div style="color:#6b7280;font-weight:700;display:flex;align-items:center;">${dia}</div>
                ${grid[d].map((v, b) => `
                    <div title="${gridCount[d][b]} pedidos · $${gridAmount[d][b].toFixed(0)}" style="height:26px;border-radius:4px;background:${bg(v)};display:flex;align-items:center;justify-content:center;color:${fg(v)};font-weight:${v>0?'700':'400'};font-size:.58rem;">
                        ${fmt(v)}
                    </div>
                `).join('')}
            `).join('')}
        </div>`;
}
window.renderHeatmapPedidos = renderHeatmapPedidos;
window._heatmapModo = _heatmapModo;