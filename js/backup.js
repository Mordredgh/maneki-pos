var _ = (() => {
  function cerrarBackupModal() {
    document.getElementById("backupModal").style.display = "none";
  }
  function _buildBackupObject() {
    return {
      version: "2.1",
      fecha: (/* @__PURE__ */ new Date()).toISOString(),
      tienda: window.storeConfig && window.storeConfig.name || "Maneki Store",
      datos: {
        products: window.products || [],
        salesHistory: window.salesHistory || [],
        pedidos: window.pedidos || [],
        pedidosFinalizados: window.pedidosFinalizados || [],
        abonos: window.abonos || [],
        receivables: window.receivables || [],
        payables: window.payables || [],
        incomes: window.incomes || [],
        expenses: window.expenses || [],
        categories: window.categories || [],
        quotes: window.quotes || [],
        equipos: equipos || [],
        roiHistorial: roiHistorial || [],
        roiConfig: roiConfig || { porcentaje: 10 },
        envioAnillos: envioAnillos || [],
        notas: window.notas || [],
        clients: window.clients || [],
        storeConfig: window.storeConfig || {},
        gastosRecurrentes: window.gastosRecurrentes || [],
        stockMovimientos: window.stockMovimientos || window.stockMovements || [],
        folioCounter: window._folioCounter || 0
      }
    };
  }
  function exportarBackupJSON() {
    const backup = _buildBackupObject();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Maneki_Backup_${typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function exportarBackupComprimido() {
    const backup = _buildBackupObject();
    const json = JSON.stringify(backup);
    const datosStr = JSON.stringify(backup.datos);
    let hash = 0;
    for (let i = 0; i < datosStr.length; i++) {
      hash = (hash << 5) - hash + datosStr.charCodeAt(i) | 0;
    }
    backup.checksum = hash;
    const pakoUrl = "https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js";
    if (typeof window.pako === "undefined") {
      await window._mkLoadCDN(pakoUrl);
    }
    try {
      const jsonFinal = JSON.stringify(backup);
      const compressed = window.pako.gzip(jsonFinal);
      const blob = new Blob([compressed], { type: "application/gzip" });
      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      const originalMB = (jsonFinal.length / 1024 / 1024).toFixed(2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Maneki_Backup_${typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json.gz`;
      a.click();
      URL.revokeObjectURL(url);
      manekiToastExport(`\u{1F4E6} Backup comprimido: ${originalMB}MB \u2192 ${sizeMB}MB (${Math.round((1 - blob.size / jsonFinal.length) * 100)}% menos)`, "ok");
    } catch (e) {
      console.error("[Backup] Error comprimiendo:", e);
      manekiToastExport("\u26A0\uFE0F Error al comprimir, exportando sin comprimir...", "warn");
      exportarBackupJSON();
    }
  }
  window.exportarBackupComprimido = exportarBackupComprimido;
  document.getElementById("backupModal").addEventListener("click", function(e) {
    if (e.target === this) cerrarBackupModal();
  });
  (function initAutoBackup() {
    const INTERVAL_MS = 2 * 60 * 60 * 1e3;
    const LS_KEY = "maneki_lastAutoBackup";
    async function _doAutoBackup() {
      try {
        const backup = {
          version: "2.1",
          fecha: (/* @__PURE__ */ new Date()).toISOString(),
          tienda: window.storeConfig && window.storeConfig.name || "Maneki Store",
          datos: {
            products: window.products || [],
            salesHistory: window.salesHistory || [],
            pedidos: window.pedidos || [],
            pedidosFinalizados: window.pedidosFinalizados || [],
            abonos: window.abonos || [],
            receivables: window.receivables || [],
            payables: window.payables || [],
            incomes: window.incomes || [],
            expenses: window.expenses || [],
            categories: window.categories || [],
            quotes: window.quotes || [],
            equipos: typeof equipos !== "undefined" ? equipos : [],
            roiHistorial: typeof roiHistorial !== "undefined" ? roiHistorial : [],
            roiConfig: typeof roiConfig !== "undefined" ? roiConfig : { porcentaje: 10 },
            envioAnillos: typeof envioAnillos !== "undefined" ? envioAnillos : [],
            notas: window.notas || [],
            clients: window.clients || [],
            storeConfig: window.storeConfig || {},
            gastosRecurrentes: window.gastosRecurrentes || [],
            stockMovimientos: window.stockMovimientos || window.stockMovements || [],
            folioCounter: window._folioCounter || 0
          }
        };
        if (typeof sqliteStorage !== "undefined" && sqliteStorage.set) {
          await sqliteStorage.set("autoBackup", backup);
          await sqliteStorage.set("autoBackupDate", (/* @__PURE__ */ new Date()).toISOString());
        } else {
          try {
            localStorage.setItem("maneki_autoBackup", JSON.stringify(backup));
          } catch (e) {
          }
        }
        localStorage.setItem(LS_KEY, (/* @__PURE__ */ new Date()).toISOString());
      } catch (e) {
        console.warn("[AutoBackup]", e);
      }
    }
    setInterval(_doAutoBackup, INTERVAL_MS);
    window.getUltimoAutoBackup = function() {
      const last = localStorage.getItem(LS_KEY);
      if (!last) return "Sin auto-backups a\xFAn";
      return "\xDAltimo auto-backup: " + new Date(last).toLocaleString("es-MX");
    };
    const _origAbrir = window.abrirModalBackup;
    window.abrirModalBackup = function() {
      _origAbrir && _origAbrir();
      const el = document.getElementById("bkAutoBackup");
      if (el) el.textContent = window.getUltimoAutoBackup();
    };
  })();
})();
//# sourceMappingURL=backup.js.map
