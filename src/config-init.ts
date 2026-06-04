// config-init.js — runs synchronously in <head> before anything else.
// 1) showSection stub (queues calls until navigation.ts loads)
// 2) Sidebar logo/name from localStorage cache

(function() {
    // ── showSection stub: prevents ReferenceError before modules load ──
    var _queue: string[] = [];
    (window as any).showSection = function(name: string) {
        _queue.push(name);
    };
    (window as any)._showSectionQueue = _queue;
    (window as any)._showSectionStub  = true;

    // ── Sidebar config from localStorage (síncrono, for splash) ──
    function _aplicarConfigSidebar(cfg: any) {
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

    try {
        var raw = localStorage.getItem('maneki_storeConfig');
        if (raw) _aplicarConfigSidebar(JSON.parse(raw));
    } catch(e) {}
})();
