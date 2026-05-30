// ══════════════════════════════════════════════════════════════
// MANEKI — Lazy HTML Templates
// Clones <template> content into sections on first visit.
// Reduces initial DOM from ~3400 active nodes to ~2700.
// Template contents are inert — browser doesn't create live
// DOM nodes, load images, or execute inline scripts until cloned.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    var _activated = new Set();
    // Sections: dashboard-section, pedidos-section, configuracion-section

    /**
     * Activate a section's <template>: clone its content into
     * the section and remove the <template> tag.
     */
    function _activateTemplate(sectionId) {
        if (_activated.has(sectionId)) return;
        var section = document.getElementById(sectionId);
        if (!section) return;
        var tpl = section.querySelector('template');
        if (!tpl) return;
        section.appendChild(tpl.content.cloneNode(true));
        tpl.remove();
        _activated.add(sectionId);
    }

    // Expose for external callers (e.g. tests or manual triggering)
    window._mkActivateTemplate = _activateTemplate;

    // ── Patch showSection to activate templates on first visit ──
    // showSection is defined in reportes.js (lazy-loaded), so we
    // poll until it exists, then wrap it once.
    var _patchInterval = setInterval(function () {
        if (typeof window.showSection !== 'function') return;
        // Don't patch the inventory-1.js stub (it lacks _mk4 flag)
        // Wait for the real showSection from reportes.js
        if (!window.showSection._mk4) return;
        clearInterval(_patchInterval);

        var _prev = window.showSection;
        window.showSection = function (name) {
            _activateTemplate(name + '-section');
            return _prev.apply(this, arguments);
        };
        // Preserve flags so other patches (design-system, ui-extras) recognize it
        window.showSection._mk4 = true;
        if (_prev._enviosHook) window.showSection._enviosHook = true;
    }, 50);

    // ── Auto-activate dashboard on DOMContentLoaded ─────────────
    // Dashboard is the default visible section; its template must
    // be live before dashboard.js tries to populate KPI elements.
    document.addEventListener('DOMContentLoaded', function () {
        _activateTemplate('dashboard-section');
    });
})();
