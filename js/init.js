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

    console.log('%c🐱 Maneki Store Premium v4.0', 'color:#E8B84B;font-size:14px;font-weight:800;');
    console.log('%cDesign System cargado correctamente.', 'color:#A855F7;font-size:11px;');

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