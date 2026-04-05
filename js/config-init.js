// BUG-NEW-12 FIX: config-init.js leía solo de localStorage para mostrar logo/nombre en sidebar.
// Si el usuario migró a SQLite (flujo normal), localStorage está vacío y el logo nunca aparece.
// Solución: leer primero localStorage (síncrono, para el splash inicial), luego cuando SQLite
// esté disponible via ipcRenderer, actualizar el sidebar con los datos más frescos.

(function() {
    // ── Paso 1: aplicar desde localStorage inmediatamente (síncrono) ──
    function _aplicarConfigSidebar(cfg) {
        if (!cfg) return;
        try {
            if (cfg.logo) {
                var c = document.getElementById('sidebarLogoContainer');
                if (c) c.innerHTML = '<img src="' + cfg.logo + '" style="width:52px;height:52px;object-fit:contain;border-radius:12px;" alt="Logo">';
            }
            var h1 = document.querySelector('#sidebar .sidebar-store-name');
            var p  = document.querySelector('#sidebar .sidebar-store-slogan');
            if (h1 && cfg.name)   h1.textContent = cfg.name;
            if (p  && cfg.slogan) p.textContent  = cfg.slogan;
        } catch(e) {}
    }

    // Intento síncrono desde localStorage
    try {
        var raw = localStorage.getItem('maneki_storeConfig');
        if (raw) _aplicarConfigSidebar(JSON.parse(raw));
    } catch(e) {}

    // ── Paso 2: actualizar desde SQLite cuando esté disponible (asíncrono) ──
    // SQLite es la fuente de verdad; puede tener un logo más reciente que localStorage.
    function _intentarSQLite() {
        try {
            var ipc = require('electron').ipcRenderer;
            ipc.invoke('sqlite-load', { key: 'storeConfig' }).then(function(result) {
                if (result && result.ok && result.value) {
                    _aplicarConfigSidebar(result.value);
                }
            }).catch(function() {});
        } catch(e) {
            // Fuera de Electron o ipcRenderer no disponible aún — reintentar
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(_intentarSQLite, 500);
                });
            }
        }
    }
    _intentarSQLite();
})();
