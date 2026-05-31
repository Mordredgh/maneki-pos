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
  function _intentarSQLite() {
    try {
      var ipc = require("electron").ipcRenderer;
      ipc.invoke("sqlite-load", { key: "storeConfig" }).then(function(result) {
        if (result && result.ok && result.value) {
          _aplicarConfigSidebar(result.value);
        }
      }).catch(function() {
      });
    } catch (e) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
          setTimeout(_intentarSQLite, 500);
        });
      }
    }
  }
  _intentarSQLite();
})();
//# sourceMappingURL=config-init.js.map
