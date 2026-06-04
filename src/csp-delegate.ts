// ═══════════════════════════════════════════════════════════════
// CSP EVENT DELEGATION — replaces all inline onclick/onchange/oninput
// Enables strict CSP (no 'unsafe-inline' in script-src)
// ═══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── Click delegation: [data-action] ──────────────────────────
    document.addEventListener('click', function (e) {
        var el = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
        if (!el) return;
        var action = el.dataset.action!;
        var fn = (window as any)[action];
        if (typeof fn !== 'function') {
            console.warn('[CSP] Unknown action:', action);
            return;
        }
        if (el.dataset.closeDd) {
            document.querySelectorAll('.inv-hdr-dd').forEach(function (d: any) { d.style.display = 'none'; });
        }
        var arg = el.dataset.arg;
        var arg2 = el.dataset.arg2;
        var passEl = el.dataset.passEl;
        if (passEl === 'before') fn(el, arg);
        else if (passEl) fn(arg, el);
        else if (arg2 !== undefined) fn(arg, arg2);
        else if (arg !== undefined) fn(arg);
        else fn();
    });

    // ── Modal backdrop close: [data-backdrop] ────────────────────
    document.addEventListener('click', function (e) {
        var el = e.target as HTMLElement;
        if (!el.hasAttribute('data-backdrop')) return;
        var action = el.dataset.backdrop || '';
        if (action) {
            var fn = (window as any)[action];
            if (typeof fn === 'function') fn();
        } else if (el.id) {
            closeModal(el.id);
        }
    });

    // ── Change delegation: [data-change] ─────────────────────────
    document.addEventListener('change', function (e) {
        var el = e.target as HTMLElement;
        var action = el.dataset.change;
        if (!action) return;
        var fn = (window as any)[action];
        if (typeof fn !== 'function') return;
        if (el.dataset.passEl) fn(el);
        else fn();
    });

    // ── Input delegation: [data-oninput] ─────────────────────────
    document.addEventListener('input', function (e) {
        var el = e.target as HTMLElement;
        var action = el.dataset.oninput;
        if (!action) return;
        var fn = (window as any)[action];
        if (typeof fn === 'function') fn(el);
    });

    // ── Submit prevention: [data-prevent-submit] ─────────────────
    document.addEventListener('submit', function (e) {
        if ((e.target as HTMLElement).hasAttribute('data-prevent-submit')) {
            e.preventDefault();
        }
    });

    // ── Keyboard delegation: [data-onkeydown] ────────────────────
    document.addEventListener('keydown', function (e) {
        var el = e.target as HTMLElement;
        var action = el.dataset.onkeydown;
        if (!action) return;
        var fn = (window as any)[action];
        if (typeof fn === 'function') fn(e);
    });

    // ── Dropdown toggle helper ───────────────────────────────────
    (window as any)._mkToggleDropdown = function (btn: HTMLElement) {
        var m = btn.nextElementSibling as HTMLElement;
        if (!m) return;
        var open = m.style.display !== 'block';
        document.querySelectorAll('.inv-hdr-dd').forEach(function (d: any) { d.style.display = 'none'; });
        if (open) {
            m.style.display = 'block';
            var close = function (e: MouseEvent) {
                if (!btn.contains(e.target as Node) && !m.contains(e.target as Node)) {
                    m.style.display = 'none';
                    document.removeEventListener('click', close);
                }
            };
            setTimeout(function () { document.addEventListener('click', close); }, 0);
        }
    };

    // ── Meta mensual change handler ──────────────────────────────
    (window as any)._mkMetaMensualChange = function (el: HTMLInputElement) {
        var v = Math.max(1, parseFloat(el.value) || 5000);
        el.value = String(v);
        storeConfig.metaMensual = v;
        updateDashboard();
        sbSave('storeConfig', storeConfig);
    };

    // ── Shortcuts overlay toggle ─────────────────────────────────
    (window as any)._mkShowShortcuts = function () {
        if (typeof (window as any)._createShortcutsOverlay === 'function') {
            (window as any)._createShortcutsOverlay();
            var overlay = document.getElementById('mk-shortcuts-overlay');
            if (overlay) overlay.classList.add('visible');
        }
    };

    // ── Reset tutorial ───────────────────────────────────────────
    (window as any)._mkResetTutorial = function () {
        showConfirm('¿Reiniciar el tutorial? La página se recargará.', 'Tutorial').then(function (ok: boolean) {
            if (ok) {
                localStorage.removeItem('mk_onboarding_done');
                window.location.reload();
            }
        });
    };

    // ── showSection + closeSidebar combo ──────────────────────────
    (window as any)._mkNavSidebar = function (section: string) {
        showSection(section);
        if (typeof (window as any).closeSidebar === 'function') (window as any).closeSidebar();
    };

    // ── toggleSidebar safe call ──────────────────────────────────
    (window as any)._mkToggleSidebar = function () {
        if (typeof (window as any).toggleSidebar === 'function') (window as any).toggleSidebar();
    };

    // ── Apply custom margin from input ───────────────────────────
    (window as any)._mkApplyCustomMargin = function () {
        var el = document.getElementById('margenCustom');
        if (el) (window as any).aplicarMargen(parseInt(el.value));
    };

    // ── showSection + openPedidoModal combo ──────────────────────
    (window as any)._mkNewPedido = function () {
        showSection('pedidos');
        setTimeout(function () { openPedidoModal(); }, 300);
    };

    // ── Trigger pedido form submit ───────────────────────────────
    (window as any)._mkSubmitPedidoForm = function () {
        var form = document.getElementById('pedidoForm');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    };

    // ── Sales history pagination ─────────────────────────────────
    (window as any)._mkSalesPagePrev = function () {
        (window as any).salesHistoryPage--;
        if (typeof (window as any).renderSalesHistory === 'function') (window as any).renderSalesHistory();
    };
    (window as any)._mkSalesPageNext = function () {
        (window as any).salesHistoryPage++;
        if (typeof (window as any).renderSalesHistory === 'function') (window as any).renderSalesHistory();
    };

    // ── Clear pedido date filters ────────────────────────────────
    (window as any)._mkClearPedidoFechas = function () {
        var desde = document.getElementById('pedidoFechaDesde');
        var hasta = document.getElementById('pedidoFechaHasta');
        if (desde) desde.value = '';
        if (hasta) hasta.value = '';
        if (typeof (window as any).filterPedidos === 'function') (window as any).filterPedidos('todos');
        if (typeof renderPedidosTable === 'function') renderPedidosTable();
    };

    // ── Hide alerta cobro ────────────────────────────────────────
    (window as any)._mkHideAlertaCobro = function () {
        var el = document.getElementById('alertaCobro');
        if (el) el.classList.add('hidden');
    };

    // ── Safe call pattern ────────────────────────────────────────
    (window as any)._mkSafeCall = function (fnName: string) {
        var fn = (window as any)[fnName];
        if (typeof fn === 'function') fn();
    };

    // ── Click file input trigger ─────────────────────────────────
    (window as any)._mkClickInput = function (id: string) {
        var el = document.getElementById(id);
        if (el) el.click();
    };

    // ── Save filtro actual ───────────────────────────────────────
    (window as any)._mkGuardarFiltro = function () {
        if (typeof (window as any)._guardarFiltroActual === 'function') (window as any)._guardarFiltroActual();
    };

    // ── Sales history reset page on filter change ────────────────
    (window as any)._mkSalesReset = function () {
        (window as any).salesHistoryPage = 1;
        if (typeof (window as any).renderSalesHistory === 'function') (window as any).renderSalesHistory();
    };

    // ── Load saved filter ────────────────────────────────────────
    (window as any)._mkCargarFiltro = function (el: HTMLSelectElement) {
        if (typeof (window as any)._cargarFiltroGuardado === 'function') {
            (window as any)._cargarFiltroGuardado(el.value);
        }
        el.value = '';
    };

    // ── Debounced oninput wrappers ──────────────────────────────
    (window as any)._mkDebounceMov = function () {
        clearTimeout((window as any)._movT);
        (window as any)._movT = setTimeout(renderMovimientos, 160);
    };
    (window as any)._mkDebounceInv = function () {
        clearTimeout((window as any)._invSearchT);
        (window as any)._invSearchT = setTimeout(function () { renderInventoryTable(); }, 160);
    };
    (window as any)._mkDebounceInc = function () {
        clearTimeout((window as any)._incT);
        (window as any)._incT = setTimeout(function () { renderIncomeList(); }, 160);
    };
    (window as any)._mkDebounceExp = function () {
        clearTimeout((window as any)._expT);
        (window as any)._expT = setTimeout(function () { renderExpenseList(); }, 160);
    };
    (window as any)._mkDebouncePed = function () {
        clearTimeout((window as any)._pedT);
        (window as any)._pedT = setTimeout(renderPedidosTable, 160);
    };
    (window as any)._mkDebounceHp = function () {
        clearTimeout((window as any)._hpT);
        (window as any)._hpT = setTimeout(renderHistorialPedidos, 160);
    };

    // ── Blur delegation: [data-onblur] ──────────────────────────
    document.addEventListener('focusout', function (e) {
        var el = e.target as HTMLElement;
        var action = el.dataset.onblur;
        if (!action) return;
        var fn = (window as any)[action];
        if (typeof fn === 'function') fn(el);
    });

    // ── Focus delegation: [data-onfocus] ─────────────────────────
    document.addEventListener('focusin', function (e) {
        var el = e.target as HTMLElement;
        var action = el.dataset.onfocus;
        if (!action) return;
        var fn = (window as any)[action];
        if (typeof fn === 'function') fn(el);
    });

    // ── Global search blur handler ──────────────────────────────
    (window as any)._mkBlurBusquedaGlobal = function () {
        setTimeout(function () { cerrarBusquedaGlobal(); }, 200);
    };

    // ── Image error delegation ──────────────────────────────────
    document.addEventListener('error', function (e) {
        var el = e.target as HTMLElement;
        if (el.tagName !== 'IMG') return;
        var fallback = el.dataset.errorFallback;
        if (fallback === 'hide') {
            el.style.display = 'none';
            if (el.dataset.errorHtml) {
                el.insertAdjacentHTML('afterend', el.dataset.errorHtml);
            }
        } else if (fallback === 'sibling') {
            el.style.display = 'none';
            var next = el.nextElementSibling as HTMLElement;
            if (next) next.style.display = 'inline';
        }
    }, true);

    // ── Filtros guardados en pedidos (was inline <script>) ──────
    (function () {
        var FK = 'mk_filtros_guardados';
        function _getFiltros() { try { return JSON.parse(localStorage.getItem(FK) || '[]'); } catch (e) { return []; } }
        function _guardarFiltroActual() {
            var nombre = prompt('Nombre para este filtro:');
            if (!nombre || !nombre.trim()) return;
            var filtros = {
                buscar: (document.getElementById('pedidoBuscar') || {}).value || (document.getElementById('tablaBuscarInput') || {}).value || '',
                pago: (document.getElementById('filtroPago') || {}).value || (document.getElementById('filtroStatusPago') || {}).value || '',
                urgencia: (document.getElementById('filtroUrgencia') || {}).value || '',
                desde: (document.getElementById('pedidoFechaDesde') || {}).value || '',
                hasta: (document.getElementById('pedidoFechaHasta') || {}).value || ''
            };
            var guardados = _getFiltros();
            guardados.push({ nombre: nombre.trim(), filtros: filtros });
            localStorage.setItem(FK, JSON.stringify(guardados));
            _actualizarSelectFiltros();
        }
        function _cargarFiltroGuardado(nombre: string) {
            if (!nombre) return;
            var guardados = _getFiltros();
            var f = guardados.find(function (g: any) { return g.nombre === nombre; });
            if (!f) return;
            function set(id: string, val: string) { var el = document.getElementById(id); if (el) el.value = val; }
            set('pedidoBuscar', f.filtros.buscar); set('tablaBuscarInput', f.filtros.buscar);
            set('filtroPago', f.filtros.pago); set('filtroStatusPago', f.filtros.pago);
            set('filtroUrgencia', f.filtros.urgencia);
            set('pedidoFechaDesde', f.filtros.desde);
            set('pedidoFechaHasta', f.filtros.hasta);
            ((window as any).renderTablaPedidos || (window as any).filtrarPedidos || (window as any).renderPedidosTable || (window as any).renderKanbanBoard || function () { })();
        }
        function _actualizarSelectFiltros() {
            var sel = document.getElementById('filtrosGuardadosSelect');
            if (!sel) return;
            var guardados = _getFiltros();
            sel.innerHTML = '<option value="">📁 Mis filtros...</option>' +
                guardados.map(function (g: any) { return '<option value="' + g.nombre.replace(/"/g, '&quot;') + '">' + g.nombre + '</option>'; }).join('');
        }
        (window as any)._guardarFiltroActual = _guardarFiltroActual;
        (window as any)._cargarFiltroGuardado = _cargarFiltroGuardado;
        (window as any)._actualizarSelectFiltros = _actualizarSelectFiltros;
        document.addEventListener('DOMContentLoaded', _actualizarSelectFiltros);
    })();

})();
