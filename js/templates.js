// ══════════════════════════════════════════════════════════════
// MANEKI — Lazy HTML Templates
// Solo la sección Configuración usa <template> lazy por ahora.
// Dashboard y Pedidos tienen demasiadas dependencias de initApp()
// para ser templates seguros.
// ══════════════════════════════════════════════════════════════
(function() {
    'use strict';
    const _activated = new Set();

    function _activate(sectionId) {
        if (_activated.has(sectionId)) return;
        const section = document.getElementById(sectionId);
        if (!section) return;
        const tpl = section.querySelector('template');
        if (!tpl) return;
        section.appendChild(tpl.content.cloneNode(true));
        tpl.remove();
        _activated.add(sectionId);
        // Re-cargar UI de config si es la sección de configuración
        if (sectionId === 'configuracion-section') {
            if (typeof loadStoreConfigUI === 'function') loadStoreConfigUI();
            if (typeof loadLogoUI === 'function') loadLogoUI();
        }
    }

    // Exponer para uso manual
    window._mkActivateTemplate = _activate;

    // Hookear showSection cuando esté disponible
    const _poll = setInterval(() => {
        if (!window.showSection || !window.showSection._mk4) return;
        clearInterval(_poll);
        const _prev = window.showSection;
        window.showSection = function(name) {
            _activate(name + '-section');
            return _prev.apply(this, arguments);
        };
        window.showSection._mk4 = _prev._mk4;
    }, 150);
    // Timeout de seguridad
    setTimeout(() => clearInterval(_poll), 15000);
})();
