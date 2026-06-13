// ── Cambiar vista kanban / tabla ──
function setVistaPedidos(vista) {
    _pedidoVistaActual = vista;
    const kanban  = document.getElementById('vistaKanban');
    const tabla   = document.getElementById('vistaTabla');
    const cal     = document.getElementById('vistaCalendario');
    const btnK    = document.getElementById('btnVistaKanban');
    const btnT    = document.getElementById('btnVistaTabla');
    const btnC    = document.getElementById('btnVistaCalendario');
    const activo  = '#C5973B';
    const inactivo = '';
    // ocultar todo
    [kanban, tabla, cal].forEach(el => el && el.classList.add('hidden'));
    [btnK, btnT, btnC].forEach(b => { if (b) { b.style.background = inactivo; b.style.color = '#6B7280'; } });
    if (vista === 'kanban') {
        kanban && kanban.classList.remove('hidden');
        if (btnK) { btnK.style.background = activo; btnK.style.color = 'white'; }
    } else if (vista === 'calendario') {
        cal && cal.classList.remove('hidden');
        if (btnC) { btnC.style.background = activo; btnC.style.color = 'white'; }
        if (typeof renderCalendarioPedidos === 'function') renderCalendarioPedidos();
        return;
    } else {
        tabla && tabla.classList.remove('hidden');
        if (btnT) { btnT.style.background = activo; btnT.style.color = 'white'; }
    }
    renderPedidosTable();
}

// ── Filtrar pedidos tabla ──
function filterPedidos(status, btn) {
    _pedidoFiltroActivo = status;
    _pedidosTablePage = 1;
    document.querySelectorAll('.pedido-filter').forEach(b => {
        b.style.borderColor = '#E5E7EB'; b.style.background = 'white'; b.style.color = '#4B5563';
    });
    if (btn) { btn.style.borderColor = '#C5973B'; btn.style.background = '#FFF9F0'; btn.style.color = '#C5973B'; }
    renderTablaPedidos();
}

// ── Render principal ──
function normalizarResta() {
    // Guard: incluye suma de montos para detectar ediciones en pagos existentes
    const _hash = (window.pedidos||[]).length + '_' +
        (window.pedidos||[]).reduce((s,p)=>s+(p.pagos||[]).reduce((ps,ab)=>ps+Number(ab.monto||0),0),0).toFixed(0);
    if (window._normalizarRestaHash === _hash) return;
    window._normalizarRestaHash = _hash;
    // FUENTE DE VERDAD: p.pagos[] contiene TODOS los pagos (anticipo inicial + abonos)
    // p.anticipo y p.resta se CALCULAN siempre — nunca se leen de Supabase/SQLite
    // Esto evita que versiones inconsistentes guardadas den valores distintos en cada carga.
    (window.pedidos || []).forEach(p => {
        const totalPagado = (p.pagos || []).reduce((s, ab) => s + Number(ab.monto || 0), 0);
        if (totalPagado > 0) {
            // Si hay pagos registrados, usar su suma como fuente de verdad
            p.anticipo = totalPagado;
            p.resta    = Math.max(0, Number(p.total || 0) - totalPagado);
        } else {
            // No hay pagos — usar anticipo guardado (pedido legacy o sin abonos aún)
            p.anticipo = Number(p.anticipo || 0);
            p.resta    = Math.max(0, Number(p.total || 0) - p.anticipo);
        }
    });
}
window.normalizarResta = normalizarResta;

// ── Costo de producción visible en modal (MEJORA 1) ──────────────────────────
function _calcularCostoProduccionPedido() {
    const items = window.pedidoProductosSeleccionados || [];
    let costoTotal = 0;
    items.forEach(item => {
        const prod = (window.products || []).find(p => String(p.id) === String(item.id));
        if (!prod) return;
        const qty = item.quantity || item.cantidad || 1;
        // Prioridad: costoMateriales explícito, luego mpComponentes, luego prod.costo
        if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0) {
            const costoUnit = prod.mpComponentes.reduce((s, c) => s + (parseFloat(c.costUnit) || 0) * (parseFloat(c.qty) || 1), 0);
            const rph = prod.rendimientoPorHoja || 0;
            const hojas = rph > 0 ? Math.ceil(qty / rph) : qty;
            costoTotal += costoUnit * hojas;
        } else if (prod.costoMateriales != null && prod.costoMateriales !== '') {
            costoTotal += (parseFloat(prod.costoMateriales) || 0) * qty;
        } else if (prod.costo != null && prod.costo !== '') {
            costoTotal += (parseFloat(prod.costo) || 0) * qty;
        }
    });

    // Calcular total de venta desde calcPedidoTotal logic
    let total = 0;
    if (items.length > 0) {
        total = window._sumLineas ? _sumLineas(items) :
            items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);
    } else {
        const plEl = document.getElementById('pedidoPrecioLibre');
        if (plEl) total = parseFloat(plEl.value) || 0;
    }

    const margen = total > 0 ? Math.round((total - costoTotal) / total * 100) : 0;

    // Crear o actualizar el elemento #pedidoCostoProduccion
    let el = document.getElementById('pedidoCostoProduccion');
    if (!el) {
        const btnGuardar = document.getElementById('pedidoSubmitBtn');
        if (btnGuardar && btnGuardar.parentElement) {
            el = document.createElement('div');
            el.id = 'pedidoCostoProduccion';
            el.style.cssText = 'font-size:.78rem;padding:6px 10px;border-radius:8px;margin-bottom:8px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;font-weight:600;';
            btnGuardar.parentElement.insertBefore(el, btnGuardar);
        }
    }
    if (el) {
        if (costoTotal > 0 || items.length > 0) {
            el.style.display = '';
            el.textContent = `Costo producción: $${costoTotal.toFixed(2)} | Margen estimado: ${margen}%`;
            el.style.color = margen >= 30 ? '#166534' : margen >= 10 ? '#92400e' : '#991b1b';
            el.style.background = margen >= 30 ? '#f0fdf4' : margen >= 10 ? '#fffbeb' : '#fef2f2';
            el.style.borderColor = margen >= 30 ? '#bbf7d0' : margen >= 10 ? '#fde68a' : '#fecaca';
        } else {
            el.style.display = 'none';
        }
    }
}
window._calcularCostoProduccionPedido = _calcularCostoProduccionPedido;

// UX-3: Wizard steps del modal de pedido
function _updatePedidoStep(step: number): void {
    const steps = document.querySelectorAll('#pedido-steps .step-circle');
    if (!steps.length) return;
    steps.forEach((el: any, i: number) => {
        const n = i + 1;
        el.style.background = n < step ? '#10b981' : n === step ? 'var(--mk-g500, #C5973B)' : '#e5e7eb';
        el.style.color = n <= step ? 'white' : '#6b7280';
    });
    // También colorear las labels
    const labels = document.querySelectorAll('#pedido-steps span.text-xs');
    labels.forEach((el: any, i: number) => {
        const n = i + 1;
        el.style.color = n === step ? '#C5973B' : n < step ? '#10b981' : '#9ca3af';
        el.style.fontWeight = n === step ? '700' : '400';
    });
}
(window as any)._updatePedidoStep = _updatePedidoStep;

// ── Template chips para el campo de notas ──────────────────────────────────
function pedidoInsertarTemplate(texto) {
    // MEJORA 2: insertar en el campo con foco activo (notas o notasInternas)
    const taInternas = document.getElementById('pedidoNotasInternas');
    const taNormal = document.getElementById('pedidoNotas');
    // Detectar cuál textarea tiene el foco o fue el último activo
    const ta = (taInternas && document.activeElement === taInternas) ? taInternas : taNormal;
    if (!ta) return;
    const actual = ta.value.trim();
    ta.value = actual ? actual + '\n' + texto : texto;
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
}
window.pedidoInsertarTemplate = pedidoInsertarTemplate;

function renderPedidosTable() {
    normalizarResta();
    updatePedidosStats();
    // PERF: solo renderizar la vista activa en lugar de todas
    // SAFE-01: try/catch en cada render para evitar que un error en una vista rompa todo
    const vista = _pedidoVistaActual || 'kanban';
    if (vista === 'kanban')      { try { renderKanbanBoard(); } catch(e) { console.error('[Kanban]', e); } }
    else if (vista === 'tabla')  { try { renderTablaPedidos(); } catch(e) { console.error('[TablaPedidos]', e); } }
    else if (vista === 'calendario' && typeof renderCalendarioPedidos === 'function') { try { renderCalendarioPedidos(); } catch(e) { console.error('[Calendario]', e); } }
    // Historial siempre es ligero (contenedor oculto salvo que esté visible)
    const histPanel = document.getElementById('vistaHistorial');
    if (histPanel && !histPanel.classList.contains('hidden')) { try { renderHistorialPedidos(); } catch(e) { console.error('[Historial]', e); } }
    if (typeof checkAlertasEntregas === 'function') { try { checkAlertasEntregas(); } catch(e) { console.error('[AlertasEntregas]', e); } }
    if (typeof checkAlertasCobro === 'function') { try { checkAlertasCobro(); } catch(e) { console.error('[AlertasCobro]', e); } }
    // Refresh production list if visible
    const panel = document.getElementById('listaProduccionPanel');
    if (panel && !panel.classList.contains('hidden')) { try { renderListaProduccion(); } catch(e) { console.error('[ListaProduccion]', e); } }
}

function updatePedidosStats() {
    const lista = window.pedidos || [];
    // BUG-S06 FIX: excluir cancelados — no representan dinero real por cobrar
    const activos = lista.filter(p => p.status !== 'cancelado');
    const porCobrar = activos.reduce((s, p) => s + calcSaldoPendiente(p), 0);
    const anticipos = activos.reduce((s, p) => s + (Number(p.anticipo) || 0), 0);
    const mesActual = new Date().getMonth();
    const mesYear = new Date().getFullYear();
    const esMes = activos.filter(p => {
        const fechaStr = p.fechaCreacion || p.fechaPedido || '';
        if (!fechaStr) return false;
        const mesStr = `${mesYear}-${String(mesActual+1).padStart(2,'0')}`;
        return fechaStr.startsWith(mesStr);
    }).length;
    const elActivos = document.getElementById('pedidosActivos');
    const elCobrar = document.getElementById('pedidosPorCobrar');
    const elAnticipo = document.getElementById('pedidosAnticipos');
    const elMes = document.getElementById('pedidosMes');
    if (elActivos) elActivos.textContent = activos.length;
    if (elCobrar) elCobrar.textContent = '$' + porCobrar.toFixed(2);
    if (elAnticipo) elAnticipo.textContent = '$' + anticipos.toFixed(2);
    if (elMes) elMes.textContent = esMes;
    // Actualizar badge de count en el header de la sección
    const elBadge = document.getElementById('pedidosCountBadge');
    if (elBadge) elBadge.textContent = activos.length;
}

// ── Render Kanban ──
// ── NTH-03: Filtro kanban por urgencia ──────────────────────────────────────
let _kanbanUrgenciaFiltro = 'todos'; // 'todos' | 'hoy' | 'pronto' | 'vencido'
const _kanbanExpandidos = new Set<string>(); // columnas con "ver más" expandidas
const _KANBAN_PAGE = 10;

function setKanbanUrgencia(filtro, btn) {
    _kanbanUrgenciaFiltro = filtro;
    _kanbanExpandidos.clear();
    document.querySelectorAll('.btn-kanban-urgencia').forEach(b => {
        b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    if (btn) { btn.style.background = '#C5973B'; btn.style.color = 'white'; btn.style.borderColor = '#C5973B'; }
    renderKanbanBoard();
}
window.setKanbanUrgencia = setKanbanUrgencia;

// ── Filtro por ocasión en kanban ──────────────────────────────────────────────
let _kanbanOcasionFiltro = '';
function setKanbanOcasion(ocasion: string, btn?: HTMLElement) {
    _kanbanOcasionFiltro = ocasion;
    _kanbanExpandidos.clear();
    document.querySelectorAll('.btn-kanban-ocasion').forEach((b: any) => {
        b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    if (btn) { btn.style.background = '#7c3aed'; btn.style.color = 'white'; btn.style.borderColor = '#7c3aed'; }
    renderKanbanBoard();
}
(window as any).setKanbanOcasion = setKanbanOcasion;

let _kanbanFocusMode = false;
function toggleKanbanFocus() {
    _kanbanFocusMode = !_kanbanFocusMode;
    const sidebar = document.getElementById('sidebar');
    const main    = document.querySelector('main') as HTMLElement | null;
    const searchBar = document.getElementById('global-search-bar') as HTMLElement | null;
    const btn     = document.getElementById('btnKanbanFocus');
    if (sidebar)   { sidebar.style.transform   = _kanbanFocusMode ? 'translateX(-100%)' : ''; }
    if (main)      { main.style.marginLeft      = _kanbanFocusMode ? '0' : ''; }
    if (searchBar) { searchBar.style.marginLeft = _kanbanFocusMode ? '0' : ''; }
    if (btn) {
        btn.title = _kanbanFocusMode ? 'Salir del modo focus' : 'Modo focus (ocultar sidebar)';
        btn.style.background = _kanbanFocusMode ? '#C5973B' : '';
        btn.style.color      = _kanbanFocusMode ? 'white'   : '';
    }
}
window.toggleKanbanFocus = toggleKanbanFocus;

function renderKanbanBoard() {
    // C18: skeleton mientras carga el kanban por primera vez
    const cols = ['confirmado','pago','produccion','envio','salida','retirar'];
    cols.forEach(col => {
        const el = document.getElementById('kCol-' + col);
        if (el && !el.children.length && typeof (window as any)._mkSkeletonRows === 'function') {
            el.innerHTML = `<div class="mk-table-skeleton" style="height:80px;margin:8px;border-radius:8px;opacity:0.5;"></div>`;
        }
    });
    const buscar = (document.getElementById('kanbanBuscar') || {}).value || '';
    const q = buscar.toLowerCase().trim();
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    let lista = window.pedidos || [];

    // NTH-03: aplicar filtro de urgencia
    if (_kanbanUrgenciaFiltro !== 'todos') {
        lista = lista.filter(p => {
            if (!p.entrega) return false;
            const entrega = new Date(p.entrega + 'T00:00:00');
            const diff = Math.round((entrega - hoy) / 86400000);
            if (_kanbanUrgenciaFiltro === 'vencido') return diff < 0;
            if (_kanbanUrgenciaFiltro === 'hoy')     return diff === 0;
            if (_kanbanUrgenciaFiltro === 'pronto')  return diff >= 0 && diff <= 2;
            return true;
        });
    }
    // Filtro por ocasión
    if (_kanbanOcasionFiltro) {
        lista = lista.filter(p => (p.ocasion || '') === _kanbanOcasionFiltro);
    }

    let totalVisible = 0;
    const _nsKanban = window._normSearch || (s => String(s||'').toLowerCase());
    cols.forEach(col => {
        const el = document.getElementById('kCol-' + col);
        const badge = document.getElementById('kBadge-' + col);
        if (!el) return;
        const items = lista.filter(p => (p.status||'').toLowerCase() === col && (
            !q || [p.folio, p.cliente, p.clienteNombre, p.telefono, p.whatsapp, p.concepto, p.notas, p.descripcion,
                ...(p.productosInventario||[]).map((i: any) => i.name||i.nombre||'')]
                .some(v => v && _nsKanban(String(v)).includes(_nsKanban(q)))
        ));
        totalVisible += items.length;
        if (badge) {
            badge.textContent = items.length;
            // N-KANBAN-003: badge de conteo con estilo consistente en todas las columnas
            badge.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:.7rem;font-weight:800;background:rgba(255,255,255,0.6);border-radius:9999px;margin-left:6px;color:inherit;';
        }
        // Op5: totales en vivo por columna ($ + saldo pendiente)
        const _totCol = items.reduce((s, p) => s + (Number(p.total) || 0), 0);
        const _saldoCol = items.reduce((s, p) => s + (typeof calcSaldoPendiente === 'function' ? (Number(calcSaldoPendiente(p)) || 0) : 0), 0);
        let totEl = document.getElementById('kTotal-' + col);
        if (!totEl && el.parentElement) {
            totEl = document.createElement('div');
            totEl.id = 'kTotal-' + col;
            totEl.className = 'mk-kanban-col-total';
            totEl.style.cssText = 'padding:0 8px 6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
            el.parentElement.insertBefore(totEl, el);
        }
        if (totEl) {
            totEl.innerHTML = items.length
                ? `<span>$${_totCol.toLocaleString('es-MX')}</span>` +
                  (_saldoCol > 0.5 ? `<span style="color:#dc2626;">⏳ $${_saldoCol.toLocaleString('es-MX')}</span>` : '')
                : '';
        }
        const expandido = _kanbanExpandidos.has(col);
        const visibles = expandido ? items : items.slice(0, _KANBAN_PAGE);
        const restantes = items.length - _KANBAN_PAGE;

        // N-KANBAN-002: agrupar cards por urgencia dentro de la columna
        function _kanbanGrupoHeader(label: string, n: number, color: string): string {
            return `<div style="font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:${color};padding:3px 8px 2px;margin:6px 0 3px;border-left:2.5px solid ${color};">${label} (${n})</div>`;
        }
        function _buildKanbanGrupos(cards: any[]): string {
            const urgentes: any[] = [], proximos: any[] = [], normales: any[] = [];
            const _hoyGrp = new Date(); _hoyGrp.setHours(0,0,0,0);
            cards.forEach(p => {
                const dias = (typeof window.diasHastaEntrega === 'function') ? window.diasHastaEntrega(p) : (p.entrega ? Math.round((new Date(p.entrega + 'T00:00:00').getTime() - _hoyGrp.getTime()) / 86400000) : null);
                if (dias !== null && (dias === 0 || dias === 1)) urgentes.push(p);
                else if (dias !== null && dias >= 2 && dias <= 4) proximos.push(p);
                else normales.push(p);
            });
            let html = '';
            if (urgentes.length) html += _kanbanGrupoHeader('Urgente', urgentes.length, '#dc2626') + urgentes.map(p => kanbanCardHTML(p)).join('');
            if (proximos.length) html += _kanbanGrupoHeader('Próximo', proximos.length, '#f97316') + proximos.map(p => kanbanCardHTML(p)).join('');
            if (normales.length) html += _kanbanGrupoHeader('Normal', normales.length, '#6b7280') + normales.map(p => kanbanCardHTML(p)).join('');
            return html;
        }

        // H46: colapsar columnas vacías (sin pedidos y sin filtro activo)
        const colWrapper = el.closest('[data-kanban-col]') || el.parentElement;
        if (colWrapper) {
            const isEmpty = items.length === 0 && !q && _kanbanUrgenciaFiltro === 'todos';
            colWrapper.style.transition = 'max-width 0.25s ease, opacity 0.25s ease';
            colWrapper.style.maxWidth = isEmpty ? '48px' : '';
            colWrapper.style.opacity = isEmpty ? '0.45' : '';
            colWrapper.style.overflow = isEmpty ? 'hidden' : '';
            const header = colWrapper.querySelector('[class*="kanban-header"],[class*="col-header"],h3,h4');
            if (header) (header as HTMLElement).title = isEmpty ? 'Sin pedidos — click para expandir' : '';
        }
        el.innerHTML = items.length === 0
            ? `<div style="text-align:center;padding:24px 10px;color:#d1d5db;">
                   <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="margin:0 auto 8px;display:block;">
                       <rect x="7" y="7" width="22" height="5" rx="2.5" fill="currentColor"/>
                       <rect x="7" y="16" width="22" height="5" rx="2.5" fill="currentColor" opacity=".5"/>
                       <rect x="7" y="25" width="14" height="5" rx="2.5" fill="currentColor" opacity=".25"/>
                   </svg>
                   <p style="font-size:.72rem;color:#9ca3af;">${q || _kanbanUrgenciaFiltro !== 'todos' ? 'Sin resultados' : 'Sin pedidos'}</p>
               </div>`
            : _buildKanbanGrupos(visibles)
              + (!expandido && restantes > 0
                  ? `<button data-col="${col}" onclick="window._kanbanVerMas(this.dataset.col)"
                       class="w-full mt-2 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors">
                       ↓ Ver ${restantes} más
                     </button>`
                  : '');
    });

    // Mensaje global cuando el filtro no encuentra nada en ninguna columna
    const _noResultsBanner = document.getElementById('kanbanNoResults');
    if (_noResultsBanner) {
        _noResultsBanner.style.display = (totalVisible === 0 && (q || _kanbanUrgenciaFiltro !== 'todos')) ? 'block' : 'none';
        _noResultsBanner.textContent = q
            ? `Sin pedidos que coincidan con "${q}"`
            : 'Sin pedidos con este filtro de urgencia';
    }
    // N2: inicializar swipe touch en mobile (una sola vez por contenedor)
    if (typeof (window as any)._initKanbanTouchSwipe === 'function') (window as any)._initKanbanTouchSwipe();
}

window._kanbanVerMas = function(col: string) {
    _kanbanExpandidos.add(col);
    renderKanbanBoard();
};

// N-KANBAN-004: quick-edit de fecha de entrega con doble-clic en la card
(window as any)._kanbanQuickEditFecha = function(event: MouseEvent, pedidoId: string) {
    const span = event.currentTarget as HTMLElement || event.target as HTMLElement;
    if (!span) return;
    const textoOriginal = span.textContent || '';
    // Obtener fecha actual del pedido
    const pedido = (window.pedidos || []).find((p: any) => String(p.id) === String(pedidoId));
    const fechaActual = pedido ? (pedido.entrega || '') : '';
    let _cambiado = false;

    const input = document.createElement('input');
    input.type = 'date';
    input.value = fechaActual;
    input.style.cssText = 'font-size:.72rem;border:1.5px solid #C5973B;border-radius:6px;padding:2px 6px;background:#fffbf5;outline:none;';

    span.textContent = '';
    span.appendChild(input);
    input.focus();

    input.addEventListener('change', async function() {
        _cambiado = true;
        const newDate = input.value;
        const p = (window.pedidos || []).find((x: any) => String(x.id) === String(pedidoId));
        if (p) {
            p.entrega = newDate;
            if (typeof savePedidos === 'function') await savePedidos();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
        }
        if (typeof (window as any).manekiToastExport === 'function') (window as any).manekiToastExport('✅ Fecha actualizada', 'ok');
    });

    input.addEventListener('blur', function() {
        if (!_cambiado) {
            span.innerHTML = '';
            span.textContent = textoOriginal;
        }
    });

    input.addEventListener('keydown', function(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            _cambiado = false;
            span.innerHTML = '';
            span.textContent = textoOriginal;
            input.blur();
        }
    });
};

const _statusLabel = s => ({confirmado:'✅ Confirmado',pago:'💰 Pagado',produccion:'🔧 Producción',envio:'📦 Envío',salida:'🚚 Salió',retirar:'🏪 Retirar',finalizado:'🎉 Listo',cancelado:'❌ Cancelado'})[s] || s;

function kanbanCardHTML(p) {
    const _saldo = calcSaldoPendiente(p);
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const entrega = p.entrega ? new Date(p.entrega + 'T00:00:00') : null;
    const diff = entrega ? Math.round((entrega - hoy) / 86400000) : null;
    let alertaHtml = '';
    if (diff !== null) {
        if (diff < 0) alertaHtml = '<span class="text-xs font-bold text-red-700">⛔ Vencido</span>';
        else if (diff === 0) alertaHtml = '<span class="text-xs font-bold text-red-600">🔴 ¡Hoy!</span>';
        else if (diff === 1) alertaHtml = '<span class="text-xs font-bold text-amber-600">🟡 Mañana</span>';
        else if (diff === 2) alertaHtml = '<span class="text-xs font-bold text-amber-600">🟡 2 días</span>';
    }
    // BUG-PED-005 FIX: XSS en campos de usuario — _esc() sanitiza antes de insertar en innerHTML
    const _e = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
    // MEJORA 4: checkbox de selección en lote (visible on-hover)
    const _isSelected = window._kanbanSeleccionados && window._kanbanSeleccionados.has(String(p.id));
    const _checkboxHtml = `<input type="checkbox" ${_isSelected ? 'checked' : ''}
        onchange="_toggleKanbanSelect('${p.id}', this.checked)"
        onclick="event.stopPropagation()"
        style="position:absolute;top:6px;right:6px;width:16px;height:16px;cursor:pointer;accent-color:#C5973B;opacity:${_isSelected ? '1' : '0'};transition:opacity .15s;"
        class="_kanban-check"
        title="Seleccionar para acción en lote">`;

    if (_kanbanCompacto) {
        return `<div class="kanban-card bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 select-none flex items-center gap-2"
            data-id="${p.id}" data-status="${p.status || 'confirmado'}"
            style="position:relative;" onmouseover="this.querySelector('._kanban-check').style.opacity='1'" onmouseout="if(!this.querySelector('._kanban-check').checked)this.querySelector('._kanban-check').style.opacity='0'"
            draggable="true" ondragstart="kanbanDragStart(event,'${p.id}')" ondragend="kanbanDragEnd(event)">
            ${_checkboxHtml}
            <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-amber-600">${_e(p.folio)}</span>
                <span class="text-xs text-gray-700 ml-1 truncate">${_e(p.cliente)}</span>
            </div>
            <span class="text-xs ${_saldo>0?'text-red-500':'text-green-600'} font-bold whitespace-nowrap">$${_saldo.toFixed(0)}</span>
            <button onclick="openPedidoStatusModal('${p.id}')" class="text-xs px-1 py-0.5 rounded bg-gray-100 hover:bg-amber-100 text-gray-500">⚡</button>
            <button onclick="eliminarPedido('${p.id}')" class="text-xs px-1 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-500">🗑</button>
        </div>`;
    }
    // NTH-05: badge de prioridad
    const _prioBadge = p.prioridad === 'alta'
        ? `<span class="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 ml-1">🔺 Alta</span>`
        : p.prioridad === 'baja'
        ? `<span class="text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 ml-1">🔻 Baja</span>`
        : '';
    // NTH-04: thumbnail de foto de referencia
    const _thumbUrl = (p.referenciasUrls||[])[0] || p.referenciaUrl || null;
    const _thumbHtml = _thumbUrl
        ? `<img src="${_thumbUrl}" onclick="abrirFotoReferencia('${p.id}')" class="w-full h-14 object-cover rounded-lg mb-1 cursor-pointer" onerror="this.style.display='none'" alt="Ref">`
        : '';
    // MEJORA 3: alerta visual de pedido retrasado
    const _hoyStr = (typeof _fechaHoy === 'function') ? _fechaHoy() : new Date().toISOString().split('T')[0];
    const _retrasado = p.entrega && p.entrega < _hoyStr && !['finalizado','cancelado','retirar','salida'].includes(p.status||'');
    const _retrasadoHTML = _retrasado
        ? `<div style="background:#fee2e2;border-radius:8px;padding:3px 8px;margin-bottom:4px;font-size:.72rem;font-weight:700;color:#dc2626;">
               ⏰ RETRASADO — venció ${p.entrega}
           </div>`
        : '';
    // Badge de ocasión (XV, boda, graduación, etc.)
    const _ocasionLabels: Record<string,string> = {xv:'👑 XV',boda:'💍 Boda',graduacion:'🎓 Grad.',baby_shower:'🍼 Baby',aniversario:'❤️ Aniv.',navidad:'🎄 Nav.',otro:'✨'};
    const _ocasionBadge = (p.ocasion && _ocasionLabels[p.ocasion]) ? `<span style="font-size:.65rem;font-weight:700;padding:1px 5px;border-radius:8px;background:#f5f3ff;color:#7c3aed;">${_ocasionLabels[p.ocasion]}</span>` : '';
    // Recordatorio: pedido en "Retirar" más de 3 días sin ser recogido
    const _retirarAlerta = (function(){
        if ((p.status||'') !== 'retirar') return '';
        const _fe = p.fechaUltimoEstado || null;
        if (!_fe) return '';
        const _dias = Math.round((Date.now() - new Date(_fe).getTime()) / 86400000);
        if (_dias < 3) return '';
        const _tel = (p.telefono || p.whatsapp || '').replace(/\D/g,'');
        const _waTxt = encodeURIComponent(`Hola ${p.cliente}, tu pedido ${p.folio} está listo para retirar 🛍️ ¿Cuándo pasas?`);
        return `<div style="background:#fff7ed;border-radius:8px;padding:3px 8px;margin-bottom:4px;font-size:.7rem;font-weight:700;color:#c2410c;display:flex;align-items:center;gap:6px;">⏳ ${_dias}d esperando retiro${_tel ? ` <a href="https://wa.me/52${_tel}?text=${_waTxt}" target="_blank" onclick="event.stopPropagation()" style="color:#25D366;text-decoration:none;font-size:.78rem;">📲 WA</a>` : ''}</div>`;
    })();
    // Porcentaje de pago (anticipo+abonos / total) para barra de progreso
    const _tot = Number(p.total||0);
    const _pct = _tot > 0 ? Math.min(100, Math.round(((_tot - _saldo) / _tot) * 100)) : (_saldo === 0 ? 100 : 0);
    return `<div class="kanban-card mk-kanban-card-${p.status || 'confirmado'} bg-white rounded-xl p-2 shadow-sm border border-gray-100 select-none"
        data-id="${p.id}" data-status="${p.status || 'confirmado'}"
        style="position:relative;" onmouseover="var c=this.querySelector('._kanban-check');if(c)c.style.opacity='1'" onmouseout="var c=this.querySelector('._kanban-check');if(c&&!c.checked)c.style.opacity='0'"
        draggable="true" ondragstart="kanbanDragStart(event,'${p.id}')" ondragend="kanbanDragEnd(event)">
        ${_checkboxHtml}
        ${_retrasadoHTML}
        ${_retirarAlerta}
        <div class="flex justify-between items-center mb-0.5 flex-wrap gap-1">
            <span class="text-xs font-bold text-amber-600">${_e(p.folio)}${_prioBadge ? ' ' + p.prioridad.slice(0,1).toUpperCase() : ''}${_ocasionBadge ? ' ' + _ocasionBadge : ''}</span>
            ${alertaHtml || ''}
        </div>
        <p class="font-semibold text-gray-800 text-sm leading-tight mb-0.5 truncate">${_e(p.cliente)}</p>
        <p class="text-xs text-gray-400 mb-0.5 truncate">${_e(p.concepto)}</p>
        <div class="flex justify-between items-center text-xs mb-0.5">
            <span class="text-gray-400 truncate" ondblclick="window._kanbanQuickEditFecha(event,'${_e(p.id)}')" style="cursor:pointer;" title="Doble-clic para editar fecha">📅 ${p.entrega || '—'}${p.lugarEntrega ? ` · 📍 ${_e(p.lugarEntrega)}` : ''}</span>
            <span class="ml-1 shrink-0 font-bold ${_saldo > 0 ? 'text-red-500' : 'text-green-600'}">${_saldo > 0 ? '$' + _saldo.toFixed(0) : '✓'}</span>
        </div>
        ${diff !== null ? `<div class="kanban-urgency-bar ${diff < 0 ? 'urgency-overdue' : diff === 0 ? 'urgency-urgent' : diff <= 2 ? 'urgency-soon' : 'urgency-ok'}" style="width:${diff < 0 ? 100 : Math.max(8, Math.min(100, 100 - (diff / 14 * 100)))}%;margin-bottom:4px;"></div>` : ''}
        <div class="flex flex-col gap-1">
            <button onclick="openPedidoStatusModal('${p.id}')" class="w-full text-xs py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-semibold text-gray-600">⚡ Estado</button>
            <div class="flex gap-1 items-center" style="position:relative;">
            <button onclick="openPedidoModal('${p.id}')" class="flex-1 py-1 rounded-lg border border-gray-200 hover:bg-amber-50 text-xs text-amber-600">✏️</button>
            <button onclick="openAbonoPedido('${p.id}')" class="flex-1 py-1 rounded-lg border border-gray-200 hover:bg-green-50 text-xs text-green-600">$</button>
            <button onclick="abrirWhatsAppPedido('${p.id}')" class="flex-1 py-1 rounded-lg border border-gray-200 hover:bg-green-50 text-xs" style="color:#25D366"><i class="fab fa-whatsapp"></i></button>
            <button onclick="eliminarPedido('${p.id}')" class="flex-1 py-1 rounded-lg border border-gray-200 hover:bg-red-50 text-xs text-red-500">🗑</button>
            <div style="position:relative;">
                <button onclick="(function(btn){var m=btn.nextElementSibling;m.style.display=m.style.display==='block'?'none':'block';var close=function(e){if(!btn.contains(e.target)&&!m.contains(e.target)){m.style.display='none';document.removeEventListener('click',close);}};setTimeout(function(){document.addEventListener('click',close)},0);})(this)" class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs text-gray-500 font-bold" title="Más acciones">⋯</button>
                <div style="display:none;position:absolute;right:0;bottom:calc(100% + 6px);z-index:200;background:white;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 -4px 24px rgba(0,0,0,0.13);min-width:140px;padding:4px;">
                    <button onclick="abrirFotoReferencia('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 rounded-lg text-gray-700">📷 Fotos ref.${(p.referenciasUrls||[]).length ? ' ('+((p.referenciasUrls||[]).length)+')' : p.referenciaUrl ? ' (1)' : ''}</button>
                    <button onclick="duplicarPedido('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 rounded-lg text-gray-700">⧉ Duplicar</button>
                    <button onclick="generarTicketPedido('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 rounded-lg text-gray-700">🖨️ Imprimir ticket</button>
                    <button onclick="exportarPedidoPDF('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 rounded-lg text-gray-700">📄 Descargar PDF</button>
                    <button onclick="imprimirEtiquetaPedido('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 rounded-lg text-gray-700">🏷️ Etiqueta</button>
                </div>
            </div>
            </div>
        </div>
        <div style="margin-top:5px;height:3px;background:#f3f4f6;border-radius:2px;overflow:hidden;" title="${_pct}% pagado">
            <div style="width:${_pct}%;height:100%;background:${_pct>=100?'#10b981':_pct>=50?'#f59e0b':'#ef4444'};border-radius:2px;transition:width .4s;"></div>
        </div>
    </div>`;
}

// ── Render Tabla ──
// Paginación para tabla de pedidos activos
let _pedidosTablePage = 1;
const _PEDIDOS_PER_PAGE = 25;

function _inyectarBuscadorTabla() {
    if (document.getElementById('tablaPedidosBuscar')) return;
    const tabla = document.getElementById('vistaTabla');
    if (!tabla) return;
    const bar = document.createElement('div');
    bar.id = 'tablaBuscadorBar';
    bar.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;';
    bar.innerHTML = `
        <div style="flex:1;min-width:200px;position:relative;">
            <input id="tablaPedidosBuscar" type="text" placeholder="🔍 Buscar por cliente, folio, concepto..."
                style="width:100%;padding:10px 14px 10px 36px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;background:#fff;"
                onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'"
                oninput="_pedidosTablePage=1;renderTablaPedidos()">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:.85rem;opacity:.4;">🔎</span>
        </div>
        <select id="tablaFiltroPago" onchange="_pedidosTablePage=1;renderTablaPedidos()"
            style="padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.8rem;background:#fff;cursor:pointer;">
            <option value="">💰 Pago: Todos</option>
            <option value="liquidado">✅ Liquidado</option>
            <option value="anticipo">🟡 Con anticipo</option>
            <option value="pendiente">🔴 Pendiente</option>
        </select>
        <select id="tablaFiltroUrgencia" onchange="_pedidosTablePage=1;renderTablaPedidos()"
            style="padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.8rem;background:#fff;cursor:pointer;">
            <option value="">📅 Entrega: Todas</option>
            <option value="hoy">🔴 Hoy</option>
            <option value="semana">🟡 Esta semana</option>
            <option value="vencido">⚫ Vencido</option>
        </select>`;
    tabla.prepend(bar);
}

function renderTablaPedidos() {
    _inyectarBuscadorTabla();
    const tbody = document.getElementById('pedidosTable');
    if (!tbody) return;
    // P1: hash guard — saltar re-render si los datos no cambiaron (incluye valores de filtros activos)
    const _qHash = ((document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null)?.value || '') + ((document.getElementById('tablaFiltroPago') as HTMLSelectElement|null)?.value || '') + ((document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null)?.value || '') + ((document.getElementById('pedidoFechaDesde') as HTMLInputElement|null)?.value || '') + ((document.getElementById('pedidoFechaHasta') as HTMLInputElement|null)?.value || '');
    const _tHash = (window.pedidos||[]).length + '_' + (window.pedidos||[]).reduce((s,p)=>s+Number(p.total||0)+Number(p.resta||0),0).toFixed(0) + '_' + (_pedidoFiltroActivo||'') + '_' + (_pedidoVistaActual||'') + '_' + _qHash;
    if ((tbody as any)._lastHash === _tHash) return;
    (tbody as any)._lastHash = _tHash;
    const q = ((document.getElementById('tablaPedidosBuscar') || document.getElementById('kanbanBuscar') || {}).value || '').toLowerCase().trim();
    // BUG-PED-03 FIX: comparación case-insensitive para status — Realtime puede traer
    // valores con distinto case (ej: 'Confirmado' vs 'confirmado') que causarían filtros vacíos.
    let lista = _pedidoFiltroActivo === 'todos'
        ? [...(window.pedidos || [])].reverse()
        : (window.pedidos || []).filter(p => (p.status||'').toLowerCase() === _pedidoFiltroActivo.toLowerCase()).reverse();
    if (q) {
        const _nsTabla = window._normSearch || (s => String(s||'').toLowerCase());
        const qN = _nsTabla(q);
        lista = lista.filter(p =>
            _nsTabla(p.cliente||'').includes(qN) ||
            _nsTabla(p.folio||'').includes(qN) ||
            _nsTabla(p.concepto||'').includes(qN) ||
            (p.telefono||'').includes(q) ||
            (p.whatsapp||'').includes(q)
        );
        _pedidosTablePage = 1;
    }
    // Filtro de pago
    const _fp = (document.getElementById('tablaFiltroPago')||{}).value || '';
    if (_fp) {
        lista = lista.filter(p => {
            const _r = calcSaldoPendiente(p);
            const _a = (p.pagos||[]).reduce((s,ab)=>s+Number(ab.monto||0),0) || Number(p.anticipo||0);
            if (_fp==='liquidado') return _r <= 0;
            if (_fp==='anticipo')  return _r > 0 && _a > 0;
            if (_fp==='pendiente') return _r > 0 && _a <= 0;
            return true;
        });
    }
    // Filtro de urgencia de entrega
    const _fu = (document.getElementById('tablaFiltroUrgencia')||{}).value || '';
    if (_fu) {
        const _hoyMs = new Date(); _hoyMs.setHours(0,0,0,0);
        const _fin7 = new Date(_hoyMs); _fin7.setDate(_fin7.getDate()+7);
        lista = lista.filter(p => {
            if (!p.entrega) return _fu==='vencido';
            const [yy,mm,dd] = p.entrega.split('-').map(Number);
            const fe = new Date(yy,mm-1,dd); fe.setHours(0,0,0,0);
            if (_fu==='hoy')    return fe.getTime()===_hoyMs.getTime();
            if (_fu==='semana') return fe>=_hoyMs && fe<=_fin7;
            if (_fu==='vencido') return fe<_hoyMs;
            return true;
        });
    }
    const desde = document.getElementById('pedidoFechaDesde')?.value || '';
    const hasta = document.getElementById('pedidoFechaHasta')?.value || '';
    if (desde || hasta) {
        lista = lista.filter(p => {
            const fe = p.entrega || '';
            if (desde && fe < desde) return false;
            if (hasta && fe > hasta) return false;
            return true;
        });
        _pedidosTablePage = 1;
    }
    const totalItems = lista.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / _PEDIDOS_PER_PAGE));
    if (_pedidosTablePage > totalPages) _pedidosTablePage = totalPages;
    const start = (_pedidosTablePage - 1) * _PEDIDOS_PER_PAGE;
    const page = lista.slice(start, start + _PEDIDOS_PER_PAGE);
    const statusLabel = {
        confirmado:'✅ Confirmado', pago:'💰 Pago', produccion:'🔧 Producción',
        envio:'📦 Envío', salida:'🚚 Salió', retirar:'🏪 Retirar'
    };
    const _et = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
    // N-EMPTY-002: empty states con y sin filtros activos
    const _hayFiltros = q || _fp || _fu || desde || hasta || _pedidoFiltroActivo !== 'todos';
    if (page.length === 0) {
        if (_hayFiltros) {
            tbody.innerHTML = `<tr><td colspan="99" class="text-center py-12">
                <div class="text-4xl mb-2">🔍</div>
                <p class="font-medium text-gray-500">Sin pedidos con esos filtros</p>
                <button onclick="window._limpiarTodosFiltros?.()" class="mt-3 text-xs text-amber-600 underline">Limpiar filtros</button>
            </td></tr>`;
        } else {
            tbody.innerHTML = `<tr><td colspan="99" class="text-center py-14">
                <div class="text-5xl mb-3">📋</div>
                <p class="text-lg font-medium text-gray-500">Sin pedidos registrados</p>
                <p class="text-sm text-gray-400 mb-4">Crea el primer pedido para empezar</p>
                <button onclick="openPedidoModal()" class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">+ Crear primer pedido</button>
            </td></tr>`;
        }
    } else {
    tbody.innerHTML = page.map(p => {
            const _wa  = p.telefono || p.whatsapp || '';
            const _fb  = p.redes   || p.facebook  || '';
            const _dir = p.lugarEntrega || '';
            const _r   = calcSaldoPendiente(p), _a = Number(p.anticipo||0);
            const _badge = _r<=0
                ? '<span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;font-size:.65rem;font-weight:700;background:#dcfce7;color:#166534;">Liquidado</span>'
                : _a>0
                    ? '<span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;font-size:.65rem;font-weight:700;background:#fef9c3;color:#854d0e;">Anticipo</span>'
                    : '<span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;font-size:.65rem;font-weight:700;background:#fee2e2;color:#991b1b;">Pendiente</span>';
            const _fbUrl = _fb ? (_fb.startsWith('http') ? _fb : `https://facebook.com/${_fb.replace(/^@/,'')}`) : '';
            return `<tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-bold text-amber-600">${_et(p.folio)||'—'}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                    ${typeof _mkAvatar==='function'?_mkAvatar(p.cliente):''}
                    <p class="text-sm font-semibold text-gray-800">${_et(p.cliente)||'—'}</p>
                </div>
                <div class="flex gap-1 mt-1 flex-wrap">
                    ${_wa ? `<button onclick="abrirWhatsAppPedido('${p.id}')" title="WhatsApp: ${_et(_wa)}" style="color:#fff;background:#25D366;border:none;border-radius:6px;padding:2px 7px;font-size:.78rem;font-weight:700;cursor:pointer;letter-spacing:.02em;">WA</button>` : ''}
                    ${_fb ? `<a href="${_fbUrl}" target="_blank" rel="noopener noreferrer" title="Facebook: ${_et(_fb)}" style="color:#fff;background:#1877F2;border-radius:6px;padding:2px 7px;font-size:.78rem;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:.02em;">FB</a>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500 max-w-[160px]">
                <p class="truncate">${_et(p.concepto)||'—'}</p>
                ${_dir ? `<p class="truncate mt-1" style="color:#7c3aed;">📍 ${_et(_dir)}</p>` : ''}
            </td>
            <td class="px-4 py-3 text-xs text-gray-500"><span title="${_et(p.fechaPedido)||''}">${_et((p.fechaPedido||'').split('T')[0].split(' ')[0])||'—'}</span></td>
            <td class="px-4 py-3 text-xs text-gray-500"><span title="${_et(p.entrega)||''}">${_et((p.entrega||'').split('T')[0].split(' ')[0])||'—'}</span></td>
            <td class="px-4 py-3 text-xs leading-snug">
                <div class="text-gray-500">Total: <span class="font-bold text-gray-800">$${Number(p.total||0).toFixed(2)}</span></div>
                <div class="text-gray-500">Anticipo: <span class="font-semibold text-green-700">$${Number(p.anticipo||0).toFixed(2)}</span></div>
                <div class="text-gray-500">Resta: <span class="font-bold ${_r>0?'text-red-600':'text-green-600'}">$${_r.toFixed(2)}</span> ${_badge}</div>
            </td>
            <td class="px-4 py-3 text-xs">${statusLabel[(p.status||'').toLowerCase()]||p.status||'—'}</td>
            <td class="px-4 py-3">
                <div class="flex gap-1 flex-wrap">
                    <button onclick="openPedidoStatusModal('${p.id}')" class="px-2 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-amber-50">Estado</button>
                    <button onclick="openPedidoModal('${p.id}')" class="px-2 py-1 rounded-lg bg-amber-50 text-xs text-amber-700">✏️</button>
                    <button onclick="openAbonoPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-green-50 text-xs text-green-700">$</button>
                    <button onclick="exportarPedidoPDF('${p.id}')" class="px-2 py-1 rounded-lg bg-blue-50 text-xs text-blue-700" title="Descargar PDF">📄</button>
                    <button onclick="duplicarPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-purple-50 text-xs text-purple-600" title="Duplicar">⧉</button>
                    <button onclick="eliminarPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-red-50 text-xs text-red-600">🗑</button>
                </div>
            </td>
        </tr>`;}).join('');
    } // fin del else (page.length > 0)
    // Render pagination controls
    let paginador = document.getElementById('pedidosTablePaginador');
    if (!paginador) {
        paginador = document.createElement('div');
        paginador.id = 'pedidosTablePaginador';
        paginador.className = 'flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500';
        tbody.closest('table')?.parentElement?.appendChild(paginador);
    }
    if (totalPages <= 1) { paginador.innerHTML = `<span>${totalItems} pedido${totalItems!==1?'s':''}</span>`; return; }
    paginador.innerHTML = `
        <span>${totalItems} pedidos · Página ${_pedidosTablePage} de ${totalPages}</span>
        <div class="flex gap-1">
            <button onclick="_pedidosTablePage=Math.max(1,_pedidosTablePage-1);renderTablaPedidos()" ${_pedidosTablePage===1?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">‹ Anterior</button>
            <button onclick="_pedidosTablePage=Math.min(${totalPages},_pedidosTablePage+1);renderTablaPedidos()" ${_pedidosTablePage===totalPages?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Siguiente ›</button>
        </div>`;
    // #11 Totales flotantes
    if (typeof _mkUpdatePedidosTotals === 'function') setTimeout(_mkUpdatePedidosTotals, 50);

    // N-SEARCH-003 + N-SEARCH-005: Renderizar badges de filtros activos + botón limpiar
    _renderFiltrosActivosBadges();
}

function _renderFiltrosActivosBadges() {
    // Leer valores actuales de los inputs de filtro
    const _buscar    = ((document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null)?.value || '').trim();
    const _pago      = ((document.getElementById('tablaFiltroPago') as HTMLSelectElement|null)?.value || '');
    const _urgencia  = ((document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null)?.value || '');
    const _desde     = ((document.getElementById('pedidoFechaDesde') as HTMLInputElement|null)?.value || '');
    const _hasta     = ((document.getElementById('pedidoFechaHasta') as HTMLInputElement|null)?.value || '');
    const _statusFil = _pedidoFiltroActivo !== 'todos' ? _pedidoFiltroActivo : '';

    const filtrosActivos: { label: string; reset: () => void }[] = [];
    if (_buscar)    filtrosActivos.push({ label: `🔍 "${_buscar}"`, reset: () => { const el = document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null; if (el) { el.value = ''; } _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_pago)      filtrosActivos.push({ label: _pago === 'liquidado' ? '✅ Liquidado' : _pago === 'anticipo' ? '🟡 Con anticipo' : '🔴 Pendiente', reset: () => { const el = document.getElementById('tablaFiltroPago') as HTMLSelectElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_urgencia)  filtrosActivos.push({ label: _urgencia === 'hoy' ? '🔴 Hoy' : _urgencia === 'semana' ? '🟡 Esta semana' : '⚫ Vencido', reset: () => { const el = document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_desde)     filtrosActivos.push({ label: `Desde ${_desde}`, reset: () => { const el = document.getElementById('pedidoFechaDesde') as HTMLInputElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_hasta)     filtrosActivos.push({ label: `Hasta ${_hasta}`, reset: () => { const el = document.getElementById('pedidoFechaHasta') as HTMLInputElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_statusFil) filtrosActivos.push({ label: `Estado: ${_statusFil}`, reset: () => { filterPedidos('todos', null); } });

    // Buscar o crear el contenedor de badges
    let _badgeContainer = document.getElementById('filtrosActivosBadges');
    if (!_badgeContainer) {
        const _tabla = document.getElementById('vistaTabla');
        const _bar   = document.getElementById('tablaBuscadorBar');
        if (_tabla && _bar) {
            _badgeContainer = document.createElement('div');
            _badgeContainer.id = 'filtrosActivosBadges';
            _badgeContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px;';
            _bar.insertAdjacentElement('afterend', _badgeContainer);
        }
    }
    if (!_badgeContainer) return;

    if (filtrosActivos.length === 0) {
        _badgeContainer.innerHTML = '';
        _badgeContainer.style.display = 'none';
        return;
    }
    _badgeContainer.style.display = 'flex';

    // Renderizar un badge por cada filtro activo + botón limpiar todo
    const _esc2 = window._esc || ((s: string) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    _badgeContainer.innerHTML = filtrosActivos.map((f, i) =>
        `<span data-badge-idx="${i}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600;background:#FFF9F0;color:#92622A;border:1px solid #e8d5b0;cursor:pointer;" title="Quitar filtro" onclick="window._quitarFiltroBadge(${i})">
            ${_esc2(f.label)} <span style="font-size:.7rem;opacity:.7;">✕</span>
        </span>`
    ).join('') +
    `<button onclick="window._limpiarTodosFiltros()" style="padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;cursor:pointer;">
        ✕ Limpiar filtros
    </button>`;

    // Exponer callbacks globales para los onclick inline
    (window as any)._quitarFiltroBadge = (idx: number) => {
        if (filtrosActivos[idx]) filtrosActivos[idx].reset();
    };
}

(window as any)._limpiarTodosFiltros = function() {
    const _b = document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null;
    const _p = document.getElementById('tablaFiltroPago') as HTMLSelectElement|null;
    const _u = document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null;
    const _d = document.getElementById('pedidoFechaDesde') as HTMLInputElement|null;
    const _h = document.getElementById('pedidoFechaHasta') as HTMLInputElement|null;
    if (_b) _b.value = '';
    if (_p) _p.value = '';
    if (_u) _u.value = '';
    if (_d) _d.value = '';
    if (_h) _h.value = '';
    _pedidoFiltroActivo = 'todos';
    _pedidosTablePage = 1;
    // Reflejar en los botones de filtro de status
    document.querySelectorAll('.pedido-filter').forEach((b: any) => {
        b.style.borderColor = '#E5E7EB'; b.style.background = 'white'; b.style.color = '#4B5563';
    });
    renderTablaPedidos();
};

