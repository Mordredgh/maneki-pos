let backupDataPendiente = null;
function abrirModalBackup() {
  document.getElementById("bkProductos").textContent = (window.products || []).length;
  document.getElementById("bkVentas").textContent = (window.salesHistory || []).length;
  document.getElementById("bkPedidos").textContent = (window.pedidos || []).length + (window.pedidosFinalizados || []).length;
  document.getElementById("dropZoneFileName").classList.add("hidden");
  document.getElementById("dropZoneFileName").textContent = "";
  document.getElementById("backupFileInput").value = "";
  const btn = document.getElementById("btnRestaurar");
  btn.disabled = true;
  btn.style.background = "#E5E7EB";
  btn.style.color = "#9CA3AF";
  btn.style.cursor = "not-allowed";
  backupDataPendiente = null;
  document.getElementById("backupModal").style.display = "flex";
}
function cerrarBackupModal() {
  document.getElementById("backupModal").style.display = "none";
}
function exportarBackupJSON() {
  const backup = {
    version: "2.1",
    fecha: (/* @__PURE__ */ new Date()).toISOString(),
    tienda: window.storeConfig && window.storeConfig.name || "Maneki Store",
    datos: {
      products: window.products || [],
      salesHistory: window.salesHistory || [],
      pedidos: window.pedidos || [],
      pedidosFinalizados: window.pedidosFinalizados || [],
      // BUG FIX: faltaba historial de pedidos
      // abonos: incluidos en pedidos[n].pagos — se exportan también por compatibilidad con backups legacy
      abonos: window.abonos || [],
      receivables: window.receivables || [],
      payables: window.payables || [],
      // BUG FIX: faltaban cuentas por pagar
      incomes: window.incomes || [],
      expenses: window.expenses || [],
      categories: window.categories || [],
      quotes: window.quotes || [],
      equipos: equipos || [],
      roiHistorial: roiHistorial || [],
      roiConfig: roiConfig || { porcentaje: 10 },
      envioAnillos: envioAnillos || [],
      notas: window.notas || [],
      // BUG FIX: faltaban notas
      clients: window.clients || [],
      storeConfig: window.storeConfig || {},
      gastosRecurrentes: window.gastosRecurrentes || [],
      stockMovimientos: window.stockMovimientos || window.stockMovements || [],
      folioCounter: window._folioCounter || 0
    }
  };
  const datosStr = JSON.stringify(backup.datos);
  let hash = 0;
  for (let i = 0; i < datosStr.length; i++) {
    hash = ((hash << 5) - hash + datosStr.charCodeAt(i)) | 0;
  }
  backup.checksum = hash;
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Maneki_Backup_${typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function handleBackupDrop(e) {
  e.preventDefault();
  document.getElementById("dropZone").style.borderColor = "#BFDBFE";
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".json")) procesarArchivoBackup(file);
  else {
    manekiToastExport("Por favor selecciona un archivo .json válido.", "err");
  }
}
function cargarArchivoBackup(event) {
  const file = event.target.files[0];
  if (file) procesarArchivoBackup(file);
}
function _validarEstructuraBackup(data) {
  if (!data || typeof data !== "object") return "No es un objeto JSON válido";
  if (!data.datos || typeof data.datos !== "object") return "Falta la propiedad 'datos'";
  const keysRequeridas = ["products", "pedidos"];
  for (const k of keysRequeridas) {
    if (data.datos[k] !== undefined && !Array.isArray(data.datos[k]))
      return `'${k}' debe ser un array`;
  }
  const keysArray = ["salesHistory","pedidosFinalizados","clients","categories","incomes","expenses","receivables","payables","quotes","equipos"];
  for (const k of keysArray) {
    if (data.datos[k] !== undefined && !Array.isArray(data.datos[k]))
      return `'${k}' debe ser un array`;
  }
  if (data.datos.storeConfig !== undefined && typeof data.datos.storeConfig !== "object")
    return "'storeConfig' debe ser un objeto";
  return null;
}
function procesarArchivoBackup(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.datos) throw new Error("Formato inválido");
      const err = _validarEstructuraBackup(data);
      if (err) throw new Error("Backup inválido: " + err);
      if (data.checksum !== undefined) {
        const datosStr = JSON.stringify(data.datos);
        let h = 0;
        for (let i = 0; i < datosStr.length; i++) {
          h = ((h << 5) - h + datosStr.charCodeAt(i)) | 0;
        }
        if (h !== data.checksum) {
          manekiToastExport("⚠️ El checksum del backup no coincide — el archivo pudo haberse modificado", "warn");
        }
      }
      backupDataPendiente = data;
      const label = document.getElementById("dropZoneFileName");
      label.textContent = `✅ ${file.name}`;
      label.classList.remove("hidden");
      const btn = document.getElementById("btnRestaurar");
      btn.disabled = false;
      btn.style.background = "#2563EB";
      btn.style.color = "white";
      btn.style.cursor = "pointer";
    } catch (err) {
      manekiToastExport("El archivo no es un backup válido de Maneki Store.", "err");
      backupDataPendiente = null;
    }
  };
  reader.readAsText(file);
}
function restaurarBackup() {
  if (!backupDataPendiente) return;
  const d = backupDataPendiente.datos;
  const fecha = backupDataPendiente.fecha ? new Date(backupDataPendiente.fecha).toLocaleDateString("es-MX") : "desconocida";
  showConfirm(
    `⚠️ ACCIÓN IRREVERSIBLE

Se reemplazarán TODOS los datos actuales con el backup del ${fecha}.

Se recomienda exportar un backup de seguridad antes de continuar.

¿Estás completamente seguro?`,
    "🔴 Restaurar backup — esto borrará todo"
  ).then((ok) => {
    if (!ok) return;
    (async () => {
      try {
        if (d.products !== void 0) {
          window.products = d.products;
          products = d.products;
          await saveProducts();
        }
        if (d.salesHistory !== void 0) {
          window.salesHistory = d.salesHistory;
          salesHistory = d.salesHistory;
          await saveSalesHistory();
        }
        if (d.pedidos !== void 0) {
          window.pedidos = d.pedidos;
          pedidos = d.pedidos;
          await savePedidos();
        }
        if (d.abonos !== void 0) {
          window.abonos = Array.isArray(d.abonos) ? d.abonos : [];
          await sbSave("abonos", window.abonos);
        }
        if (d.pedidosFinalizados !== void 0) {
          window.pedidosFinalizados = d.pedidosFinalizados;
          pedidosFinalizados = d.pedidosFinalizados;
          await savePedidosFinalizados();
        }
        if (d.notas !== void 0) {
          window.notas = d.notas;
          await sbSave("notas", window.notas);
        }
        if (d.receivables !== void 0) {
          window.receivables = d.receivables;
          await sbSave("receivables", receivables);
        }
        if (d.payables !== void 0) {
          window.payables = d.payables;
          await sbSave("payables", window.payables);
        }
        if (d.incomes !== void 0) {
          window.incomes = d.incomes;
          incomes = d.incomes;
          await saveIncomes();
        }
        if (d.expenses !== void 0) {
          window.expenses = d.expenses;
          expenses = d.expenses;
          await saveExpenses();
        }
        if (d.categories !== void 0) {
          window.categories = d.categories;
          await sbSave("categories", categories);
        }
        if (d.quotes !== void 0) {
          window.quotes = d.quotes;
          await sbSave("quotes", quotes);
        }
        if (d.equipos !== void 0) {
          equipos = d.equipos;
          await sbSave("equipos", equipos);
        }
        if (d.roiHistorial !== void 0) {
          roiHistorial = d.roiHistorial;
          await sbSave("roiHistorial", roiHistorial);
        }
        if (d.roiConfig !== void 0) {
          roiConfig = d.roiConfig;
          await sbSave("roiConfig", roiConfig);
        }
        if (d.envioAnillos !== void 0) {
          envioAnillos = d.envioAnillos;
          await sbSave("envioAnillos", envioAnillos);
        }
        if (d.clients !== void 0) {
          window.clients = d.clients;
          clients = d.clients;
          await saveClients();
        }
        if (d.storeConfig !== void 0) {
          window.storeConfig = d.storeConfig;
          await sbSave("storeConfig", storeConfig);
        }
        if (d.gastosRecurrentes !== void 0) {
          window.gastosRecurrentes = d.gastosRecurrentes;
          await sbSave("gastosRecurrentes", gastosRecurrentes);
        }
        if (d.stockMovimientos !== void 0) {
          window.stockMovimientos = d.stockMovimientos;
          window.stockMovements = d.stockMovimientos;
          await sbSave("stockMovimientos", window.stockMovimientos);
        }
        if (d.folioCounter !== void 0 && Number(d.folioCounter) > 0) {
          window._folioCounter = Number(d.folioCounter);
          await sbSave("folioCounter", String(window._folioCounter));
          try {
            localStorage.setItem("maneki_folioCounter", String(window._folioCounter));
          } catch (_) {
          }
        }
        cerrarBackupModal();
        manekiToastExport("✅ Backup restaurado exitosamente. La página se recargará.", "ok");
        setTimeout(() => location.reload(), 500);
      } catch (err) {
        manekiToastExport("❌ Error al restaurar: " + err.message, "error");
      }
    })();
  });
}
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
    if (!last) return "Sin auto-backups aún";
    return "Último auto-backup: " + new Date(last).toLocaleString("es-MX");
  };
  const _origAbrir = window.abrirModalBackup;
  window.abrirModalBackup = function() {
    _origAbrir && _origAbrir();
    const el = document.getElementById("bkAutoBackup");
    if (el) el.textContent = window.getUltimoAutoBackup();
  };
})();
//# sourceMappingURL=backup.js.map
