(function() {
  function _aplicarConfigSidebar(cfg) {
    if (!cfg) return;
    try {
      if (cfg.logo) {
        var c = document.getElementById("sidebarLogoContainer");
        if (c) c.innerHTML = '<img src="' + cfg.logo + '" style="width:52px;height:52px;object-fit:contain;border-radius:12px;" alt="Logo">';
      }
      var h1 = document.querySelector("#sidebar .sidebar-store-name");
      var p = document.querySelector("#sidebar .sidebar-store-slogan");
      if (h1 && cfg.name) h1.textContent = cfg.name;
      if (p && cfg.slogan) p.textContent = cfg.slogan;
    } catch (e) {
    }
  }
  try {
    var raw = localStorage.getItem("maneki_storeConfig");
    if (raw) _aplicarConfigSidebar(JSON.parse(raw));
  } catch (e) {
  }
  try {
    var cached = localStorage.getItem("mk_storeConfig");
    if (cached) _aplicarConfigSidebar(JSON.parse(cached));
  } catch (e) {}
})();
//# sourceMappingURL=config-init.js.map
