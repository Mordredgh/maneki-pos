(function() {
    'use strict';

    // ── Remove no-transition after first paint ──
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.remove('no-transition');
        });
    }); // ── end remove no-transition ──

    // ── Button ripple effect ──
    if (!document.getElementById('mk-ripple-style')) {
        const s = document.createElement('style');
        s.id = 'mk-ripple-style';
        s.textContent = '@keyframes mkRipple { to { transform: scale(1); opacity: 0; } }';
        document.head.appendChild(s);
    }
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn || btn.classList.contains('no-ripple')) return;
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top  - size / 2;
        Object.assign(ripple.style, {
            position:'absolute', width:size+'px', height:size+'px',
            left:x+'px', top:y+'px', borderRadius:'50%',
            background:'rgba(255,255,255,0.22)',
            transform:'scale(0)', pointerEvents:'none', zIndex:'0',
            animation:'mkRipple 0.55s ease-out forwards'
        });
        const prev = btn.style.position;
        if (!prev || prev === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(() => { try { ripple.remove(); } catch(e) {} }, 580); // UI: silencioso ok
    }, { passive: true });

    // ── KPI number counter animation duplicada eliminada (FIX #19) ──

    // ── Animate KPI values when entering dashboard ──
    let _origShowSection = null;
    const _ssPatch = setInterval(() => {
        if (window.showSection && window.showSection !== _patchedShowSection) {
            _origShowSection = window.showSection;
            window.showSection = _patchedShowSection;
            clearInterval(_ssPatch);
        }
        if (++_ssAttempts > 30) clearInterval(_ssPatch);
    }, 200);
    let _ssAttempts = 0;
    function _patchedShowSection(name) {
        if (_origShowSection) _origShowSection.call(this, name);
        // Nota: la animación de KPIs la maneja updateDashboard() via animarNumero()
        // No animar aquí para evitar dos animaciones en paralelo con valores aleatorios
    }

    // ── Supabase status bar styling ──
    const supaEl = document.getElementById('supabaseStatus');
    if (supaEl && !supaEl.style.background) {
        supaEl.style.background = 'rgba(197,151,59,0.08)';
        supaEl.style.border = '1px solid rgba(197,151,59,0.12)';
    }

    console.log('%c🐱 Maneki Store Premium v4.1', 'color:#E8B84B;font-size:14px;font-weight:800;');
    console.log('%cDesign System cargado correctamente.', 'color:#A855F7;font-size:11px;');

    // ══════════════════════════════════════════════════════════════
    // #1 CONFETTI — explosión al finalizar pedido
    // ══════════════════════════════════════════════════════════════
    window.mkConfetti = function() {
        let c = document.getElementById('mk-confetti-canvas');
        if (!c) { c = document.createElement('div'); c.id = 'mk-confetti-canvas'; document.body.appendChild(c); }
        const colors = ['#C5A572','#E8B84B','#F5D080','#9B7BC4','#C4A8E0','#F2A97E','#10b981','#ef4444','#3b82f6'];
        for (let i = 0; i < 60; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = Math.random()*100+'%';
            p.style.background = colors[Math.floor(Math.random()*colors.length)];
            p.style.width = (4+Math.random()*6)+'px';
            p.style.height = (4+Math.random()*6)+'px';
            p.style.borderRadius = Math.random()>0.5?'50%':'2px';
            p.style.animationDuration = (1.5+Math.random()*2)+'s';
            p.style.animationDelay = Math.random()*0.5+'s';
            c.appendChild(p);
        }
        setTimeout(()=>{ if(c) c.innerHTML=''; }, 4000);
    };

    // ══════════════════════════════════════════════════════════════
    // #4 SONIDO — ding para entregas urgentes
    // ══════════════════════════════════════════════════════════════
    window._mkNotifSound = function() {
        try {
            const ctx = new (window.AudioContext||window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime+0.08);
            osc.frequency.setValueAtTime(1320, ctx.currentTime+0.16);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime+0.5);
        } catch(e){}
    };

    // ══════════════════════════════════════════════════════════════
    // #5 BREADCRUMB — indicador de sección en search bar
    // ══════════════════════════════════════════════════════════════
    const _sectionNames = {
        dashboard:'Dashboard', pedidos:'Pedidos por Encargo', quotes:'Cotizaciones',
        inventory:'Inventario', inventario:'Inventario', balance:'Balance',
        clientes:'Clientes', categorias:'Categorías', analisis:'Análisis',
        reportes:'Reportes', equipos:'Equipos / ROI', configuracion:'Configuración',
        bienvenida:'Inicio', envios:'Envíos'
    };
    window._mkUpdateBreadcrumb = function(section) {
        let bc = document.getElementById('mk-breadcrumb');
        if (!bc) {
            const bar = document.getElementById('global-search-bar');
            if (!bar) return;
            bc = document.createElement('div');
            bc.id = 'mk-breadcrumb';
            bar.insertBefore(bc, bar.firstChild);
        }
        const name = _sectionNames[section] || section;
        bc.innerHTML = `<span style="opacity:.5">🐱</span><span class="bc-sep">›</span><span class="bc-current">${name}</span>`;
    };

    // ══════════════════════════════════════════════════════════════
    // #6 SIDEBAR ACCORDION — agrupar herramientas avanzadas
    // ══════════════════════════════════════════════════════════════
    function _setupSidebarAccordion() {
        const sidebar = document.querySelector('#sidebar nav');
        if (!sidebar || sidebar._mkAccordion) return;
        sidebar._mkAccordion = true;
        // Buscar los botones de Análisis, Reportes, Equipos
        const targets = ['analisis','reportes','equipos'];
        const buttons = targets.map(t => sidebar.querySelector(`[data-section="${t}"]`)).filter(Boolean);
        if (buttons.length < 2) return;
        // Crear toggle
        const toggle = document.createElement('button');
        toggle.className = 'sidebar-accordion-toggle';
        toggle.innerHTML = '<span class="chevron">▼</span> Más herramientas';
        toggle.type = 'button';
        // Crear contenedor
        const container = document.createElement('div');
        container.className = 'sidebar-accordion-items';
        buttons.forEach(b => container.appendChild(b));
        // Insertar antes de Configuración
        const configBtn = sidebar.querySelector('[data-section="configuracion"]');
        if (configBtn) {
            sidebar.insertBefore(toggle, configBtn);
            sidebar.insertBefore(container, configBtn);
        }
        // Toggle behavior
        let collapsed = localStorage.getItem('mk_accordion_collapsed') === '1';
        if (collapsed) { toggle.classList.add('collapsed'); container.classList.add('collapsed'); }
        toggle.addEventListener('click', () => {
            collapsed = !collapsed;
            toggle.classList.toggle('collapsed', collapsed);
            container.classList.toggle('collapsed', collapsed);
            localStorage.setItem('mk_accordion_collapsed', collapsed?'1':'0');
        });
    }
    setTimeout(_setupSidebarAccordion, 500);

    // ══════════════════════════════════════════════════════════════
    // #7 ATAJOS DE TECLADO — overlay y FAB
    // ══════════════════════════════════════════════════════════════
    function _createShortcutsOverlay() {
        if (document.getElementById('mk-shortcuts-overlay')) return;
        const ov = document.createElement('div');
        ov.id = 'mk-shortcuts-overlay';
        ov.innerHTML = `<div id="mk-shortcuts-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:1rem;font-weight:800;margin:0;">⌨️ Atajos de teclado</h3>
                <button onclick="document.getElementById('mk-shortcuts-overlay').classList.remove('visible')" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#9ca3af;">✕</button>
            </div>
            <div class="shortcut-row"><span>Nuevo pedido / producto</span><span class="shortcut-key">N</span></div>
            <div class="shortcut-row"><span>Búsqueda global</span><span class="shortcut-key">/</span></div>
            <div class="shortcut-row"><span>Búsqueda rápida</span><span class="shortcut-key">Ctrl K</span></div>
            <div class="shortcut-row"><span>Cerrar modal / overlay</span><span class="shortcut-key">Esc</span></div>
            <div class="shortcut-row"><span>Log de errores</span><span class="shortcut-key">Ctrl ⇧ L</span></div>
            <div class="shortcut-row"><span>Mostrar atajos</span><span class="shortcut-key">?</span></div>
            <p style="font-size:.65rem;color:#9ca3af;margin-top:12px;text-align:center;">Los atajos solo funcionan cuando no estás escribiendo en un campo</p>
        </div>`;
        ov.addEventListener('click', e => { if(e.target===ov) ov.classList.remove('visible'); });
        document.body.appendChild(ov);
        // FAB button
        const fab = document.createElement('button');
        fab.id = 'mk-help-fab';
        fab.textContent = '?';
        fab.setAttribute('data-tip','Atajos de teclado');
        fab.addEventListener('click', () => ov.classList.add('visible'));
        document.body.appendChild(fab);
    }
    setTimeout(_createShortcutsOverlay, 800);
    // Hook ? key
    document.addEventListener('keydown', e => {
        if (e.key === '?' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
            e.preventDefault();
            const ov = document.getElementById('mk-shortcuts-overlay');
            if (ov) ov.classList.toggle('visible');
        }
    });

    // ══════════════════════════════════════════════════════════════
    // #8 AVATARES — función para generar avatar con iniciales
    // ══════════════════════════════════════════════════════════════
    window._mkAvatar = function(nombre) {
        const n = String(nombre||'').trim();
        const parts = n.split(/\s+/);
        const initials = parts.length >= 2
            ? (parts[0][0]+(parts[parts.length-1][0])).toUpperCase()
            : (n.substring(0,2)).toUpperCase();
        // Color determinístico basado en el nombre
        let hash = 0;
        for (let i=0; i<n.length; i++) hash = n.charCodeAt(i) + ((hash<<5)-hash);
        const colors = ['#C5A572','#9B7BC4','#F2A97E','#10b981','#3b82f6','#ef4444','#f59e0b','#06b6d4','#8b5cf6','#ec4899'];
        const bg = colors[Math.abs(hash) % colors.length];
        return `<span class="mk-avatar" style="background:${bg}">${initials}</span>`;
    };

    // ══════════════════════════════════════════════════════════════
    // #9 TIMELINE — función para generar timeline de estados
    // ══════════════════════════════════════════════════════════════
    const _TIMELINE_STEPS = [
        {key:'confirmado', label:'Confirmado', icon:'✓'},
        {key:'pago',       label:'Pago',       icon:'$'},
        {key:'produccion', label:'Producción', icon:'🔧'},
        {key:'envio',      label:'Envío',      icon:'📦'},
        {key:'salida',     label:'Salida',     icon:'🚚'},
        {key:'retirar',    label:'Retirar',    icon:'🏪'}
    ];
    window._mkTimeline = function(currentStatus) {
        const curr = (currentStatus||'confirmado').toLowerCase();
        const currIdx = _TIMELINE_STEPS.findIndex(s => s.key === curr);
        return '<div class="mk-timeline">' +
            _TIMELINE_STEPS.map((step, i) => {
                const cls = i < currIdx ? 'done' : i === currIdx ? 'active' : 'future';
                const line = i < _TIMELINE_STEPS.length-1
                    ? `<div class="mk-timeline-line ${i < currIdx ? 'done' : i === currIdx ? 'active' : ''}"></div>` : '';
                return `<div class="mk-timeline-step ${cls}">
                    <div class="mk-timeline-dot">${i <= currIdx ? step.icon : ''}</div>
                    <div class="mk-timeline-label">${step.label}</div>
                </div>${line}`;
            }).join('') + '</div>';
    };

    // ══════════════════════════════════════════════════════════════
    // #11 TOTALES FLOTANTES — barra al pie de tabla pedidos
    // ══════════════════════════════════════════════════════════════
    window._mkUpdatePedidosTotals = function() {
        const tabla = document.getElementById('vistaTabla');
        if (!tabla || tabla.classList.contains('hidden')) return;
        let bar = document.getElementById('mk-pedidos-totals-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'mk-pedidos-totals-bar';
            tabla.appendChild(bar);
        }
        const pedidos = window.pedidos || [];
        const activos = pedidos.filter(p => p.status !== 'cancelado');
        const _cs = typeof calcSaldoPendiente==='function' ? calcSaldoPendiente : (p=>Math.max(0,Number(p.total||0)-Number(p.anticipo||0)));
        const totalVenta = activos.reduce((s,p)=>s+Number(p.total||0),0);
        const totalCobrado = activos.reduce((s,p)=>s+(Number(p.total||0)-_cs(p)),0);
        const totalPendiente = activos.reduce((s,p)=>s+_cs(p),0);
        bar.innerHTML = `
            <div class="tot-item"><span class="tot-label">Pedidos</span><span class="tot-value tot-gold">${activos.length}</span></div>
            <div class="tot-item"><span class="tot-label">Total</span><span class="tot-value" style="color:#e5e7eb">$${totalVenta.toLocaleString('es-MX',{minimumFractionDigits:2})}</span></div>
            <div class="tot-item"><span class="tot-label">Cobrado</span><span class="tot-value tot-green">$${totalCobrado.toLocaleString('es-MX',{minimumFractionDigits:2})}</span></div>
            <div class="tot-item"><span class="tot-label">Pendiente</span><span class="tot-value tot-red">$${totalPendiente.toLocaleString('es-MX',{minimumFractionDigits:2})}</span></div>`;
    };

    // ══════════════════════════════════════════════════════════════
    // #12 SYNC TIME — indicador de última sincronización
    // ══════════════════════════════════════════════════════════════
    window._mkUpdateSyncTime = function() {
        let el = document.getElementById('mk-sync-time');
        if (!el) {
            const container = document.getElementById('supabaseStatus');
            if (!container) return;
            el = document.createElement('div');
            el.id = 'mk-sync-time';
            container.parentElement.appendChild(el);
        }
        const now = new Date();
        el.textContent = '↻ Sync ' + now.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
    };
    // Actualizar al cargar y cada vez que sbSave tenga éxito
    setTimeout(()=>window._mkUpdateSyncTime(), 3000);

    // ── #12 TOOLTIPS — convertir title nativos a data-tip custom ──
    function _convertTitles() {
        document.querySelectorAll('[title]:not(input):not(select):not(textarea):not([data-tip])').forEach(el => {
            const t = el.getAttribute('title');
            if (t && t.length > 0 && t.length < 80) {
                el.setAttribute('data-tip', t);
                el.removeAttribute('title');
            }
        });
    }
    // Ejecutar al inicio y observar cambios
    setTimeout(_convertTitles, 1000);
    setTimeout(_convertTitles, 3000);
    const _tipObs = new MutationObserver(() => requestAnimationFrame(_convertTitles));
    if (document.body) _tipObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['title'] });

    // ── #11 SKELETON — generar filas skeleton para tablas vacías ──
    window._mkSkeletonRows = function(cols, rows) {
        cols = cols || 6; rows = rows || 5;
        const widths = ['w-40','w-60','w-20','w-40','w-20','w-60','w-40','w-20'];
        return Array.from({length: rows}, () =>
            '<tr class="mk-table-skeleton">' +
            Array.from({length: cols}, (_, i) =>
                `<td><div class="sk-line ${widths[i % widths.length]}"></div></td>`
            ).join('') + '</tr>'
        ).join('');
    };

})();