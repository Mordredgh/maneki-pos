(function() {
    'use strict';

    // ── Remove no-transition after first paint ──
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.remove('no-transition');
        });
    }); // ── end remove no-transition ──

    // ── POS ticket live clock ──
    function updateTicketClock() {
        const el = document.getElementById('ticketDateTime');
        if (!el) return;
        const now = new Date();
        el.textContent = now.toLocaleDateString('es-MX', {
            weekday:'short', day:'2-digit', month:'short'
        }) + ' · ' + now.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' });
    }
    updateTicketClock();
    setInterval(updateTicketClock, 30000);

    // ── Patch updateTotals to show item count in POS ──
    let _patchAttempts = 0;
    const _patchInterval = setInterval(() => {
        if (window.updateTotals) {
            const _orig = window.updateTotals;
            window.updateTotals = function() {
                _orig.apply(this, arguments);
                try {
                    const items = document.querySelectorAll('#ticketItems > div');
                    const label = document.getElementById('totalItemsLabel');
                    if (label) {
                        const count = items.length;
                        label.textContent = count === 0 ? 'Vacío' : count + ' producto' + (count !== 1 ? 's' : '');
                    }
                } catch(e) { console.warn('Error en sbLoad local fallback:', e); }
            };
            clearInterval(_patchInterval);
        }
        if (++_patchAttempts > 30) clearInterval(_patchInterval);
    }, 200);

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

    console.log('%c🐱 Maneki Store Premium v3.0', 'color:#E8B84B;font-size:14px;font-weight:800;');
    console.log('%cDesign System cargado correctamente.', 'color:#A855F7;font-size:11px;');
})();