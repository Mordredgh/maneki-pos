var pedidos = [];
var pedidosFinalizados = [];
var abonos = [];
var pedidoProductosSeleccionados = [];
var abonoProductosSeleccionados = [];
let ipcRenderer = null;
try {
  const { ipcRenderer: _ipc } = require("electron");
  ipcRenderer = _ipc;
} catch (e) {
}
const sqliteStorage = {
  // Guardar datos en SQLite local
  async set(key, value) {
    if (!ipcRenderer) return false;
    try {
      const result = await ipcRenderer.invoke("sqlite-save", { key, value });
      return result.ok;
    } catch (e) {
      console.warn("sqliteStorage.set error:", key, e);
      return false;
    }
  },
  // Cargar datos desde SQLite local
  async get(key, defaultValue = null) {
    if (!ipcRenderer) return defaultValue;
    try {
      const result = await ipcRenderer.invoke("sqlite-load", { key });
      if (result.ok && result.value !== null) return result.value;
      return defaultValue;
    } catch (e) {
      console.warn("sqliteStorage.get error:", key, e);
      return defaultValue;
    }
  },
  // Cargar múltiples claves de una sola vez (más rápido al iniciar)
  async getAll(keys) {
    if (!ipcRenderer) return {};
    try {
      const result = await ipcRenderer.invoke("sqlite-load-all", { keys });
      return result.ok ? result.data : {};
    } catch (e) {
      console.warn("sqliteStorage.getAll error:", e);
      return {};
    }
  },
  // Ver cuánto espacio está usando
  async getSize() {
    if (!ipcRenderer) return { kb: 0, dbKB: 0 };
    try {
      const result = await ipcRenderer.invoke("sqlite-size");
      return result.ok ? result : { kb: 0, dbKB: 0 };
    } catch (e) {
      return { kb: 0, dbKB: 0 };
    }
  }
};
const _rtDeskDeb = {};
const _rtTablaAKey = {
  "products": "products",
  "orders": "pedidos",
  "orders_finalizados": "pedidosFinalizados",
  "sales_history": "salesHistory"
};
let db = null;
(async () => {
  try {
    let _validarSupabaseCfg2 = function(url, key) {
      if (!url || !url.startsWith("https://") || !url.endsWith(".supabase.co")) return false;
      if (!key || String(key).length < 30) return false;
      return true;
    };
    var _validarSupabaseCfg = _validarSupabaseCfg2;
    let cfg = null;
    if (ipcRenderer) {
      try {
        cfg = await ipcRenderer.invoke("get-supabase-config");
      } catch (e) {
      }
    }
    if (!cfg && window.__mkCfg) {
      try {
        cfg = await window.__mkCfg.getSupabase();
      } catch (e) {
      }
    }
    if (!cfg) {
      var _p = [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcWNybGpnbWFtYXVtdGRydHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTAwOTgsImV4cCI6MjA4Njk2NjA5OH0",
        "x_gYRz29tK7InMxQaDyZL2bdD1-hCCJ1qg6tgvmRO5o"
      ];
      cfg = {
        url: "https://hoqcrljgmamaumtdrtzi.supabase.co",
        key: _p.join(".")
      };
    }
    if (!_validarSupabaseCfg2(cfg.url, cfg.key)) {
      console.error("[db.js] Configuraci\xF3n de Supabase inv\xE1lida \u2014 URL o API key incorrectos.");
      window._dbReady = false;
      if (typeof manekiToastExport === "function") {
        manekiToastExport("Configuraci\xF3n de Supabase inv\xE1lida \u2014 revisa URL y API key", "err");
      } else {
        document.addEventListener("DOMContentLoaded", function() {
          if (typeof manekiToastExport === "function")
            manekiToastExport("Configuraci\xF3n de Supabase inv\xE1lida \u2014 revisa URL y API key", "err");
        }, { once: true });
      }
      return;
    }
    db = supabase.createClient(cfg.url, cfg.key);
    window._dbReady = true;
    if (typeof sincronizarPendientes === "function" && window._pendingSync) sincronizarPendientes();
    if (typeof _setupRealtime === "function") _setupRealtime();
  } catch (e) {
    console.error("[db.js] No se pudo inicializar Supabase:", e);
    window._dbReady = false;
  }
})();
function _withTimeout(promise, ms) {
  ms = ms || 8e3;
  return Promise.race([
    promise,
    new Promise(function(_, reject) {
      setTimeout(function() {
        reject(new Error("Supabase timeout"));
      }, ms);
    })
  ]);
}
window._esc = function(str) {
  if (str === null || str === void 0) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
function _rtTransformarFila(tabla, row) {
  if (!row) return null;
  if (tabla === "products") return {
    id: row.id,
    name: row.name || "",
    sku: row.sku || "",
    category: row.category || "",
    tipo: row.tipo || "producto",
    cost: row.cost || 0,
    price: row.price || 0,
    stock: row.stock || 0,
    stockMin: row.stock_min || 0,
    image: row.image || null,
    imageUrl: row.image_url || null,
    tags: row.tags || [],
    variants: row.variants || [],
    mpComponentes: row.mp_componentes || [],
    proveedor: row.proveedor || null,
    notas: row.notas || null,
    publicarTienda: row.publicar_tienda || false
  };
  if (tabla === "orders") return {
    id: row.id,
    folio: row.folio || null,
    cliente: row.cliente || null,
    telefono: row.telefono || null,
    redes: row.redes || null,
    fecha: row.fecha || null,
    entrega: row.entrega || null,
    concepto: row.concepto || null,
    cantidad: row.cantidad || 1,
    costo: row.costo || 0,
    anticipo: row.anticipo || 0,
    total: row.total || 0,
    resta: row.resta || 0,
    notas: row.notas || null,
    status: row.status || "confirmado",
    fechaCreacion: row.fecha_creacion || null,
    productosInventario: row.productos_inventario || [],
    inventarioDescontado: row.inventario_descontado || false,
    fromQuote: row.from_quote || null
  };
  if (tabla === "orders_finalizados") return {
    id: row.id,
    folio: row.folio || null,
    cliente: row.cliente || null,
    telefono: row.telefono || null,
    redes: row.redes || null,
    fecha: row.fecha || null,
    entrega: row.entrega || null,
    concepto: row.concepto || null,
    cantidad: row.cantidad || 1,
    costo: row.costo || 0,
    anticipo: row.anticipo || 0,
    total: row.total || 0,
    resta: row.resta || 0,
    notas: row.notas || null,
    status: row.status || "finalizado",
    fechaCreacion: row.fecha_creacion || null,
    fechaFinalizado: row.fecha_finalizado || null,
    productosInventario: row.productos_inventario || [],
    inventarioDescontado: row.inventario_descontado || false,
    fromQuote: row.from_quote || null
  };
  if (tabla === "sales_history") return {
    id: row.id,
    folio: row.folio || null,
    date: row.date || null,
    time: row.time || null,
    customer: row.customer || null,
    concept: row.concept || null,
    note: row.note || null,
    products: row.products || [],
    subtotal: row.subtotal || 0,
    discount: row.discount || 0,
    tax: row.tax || 0,
    total: row.total || 0,
    method: row.method || null
  };
  return null;
}
function _setupRealtime() {
  if (!db) return;
  if (window._mkRTSetupDone) return;
  window._mkRTSetupDone = true;
  window._mkRTChannels = window._mkRTChannels || [];
  const _chStore = db.channel("maneki-desktop-store").on("postgres_changes", { event: "*", schema: "public", table: "store" }, (payload) => {
    const key = payload.new?.key || payload.old?.key;
    if (!key) return;
    clearTimeout(_rtDeskDeb[key]);
    _rtDeskDeb[key] = setTimeout(() => _applyRTDesktop(key).catch((e) => console.warn("[Realtime] _applyRTDesktop:", e)), 800);
  }).subscribe((status) => {
    if (status === "SUBSCRIBED") {
      actualizarIndicadorConexion(true);
      console.log("[Realtime] Canal store \u2014 Live Sync activo \u2713");
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      console.warn("[Realtime] Canal store estado:", status);
    }
  });
  window._mkRTChannels.push(_chStore);
  Object.keys(_rtTablaAKey).forEach((tabla) => {
    const _chRel = db.channel("maneki-rt-" + tabla).on("postgres_changes", { event: "*", schema: "public", table: tabla }, (payload) => {
      const debKey = "__rel_" + tabla;
      clearTimeout(_rtDeskDeb[debKey]);
      _rtDeskDeb[debKey] = setTimeout(() => _applyRTRelacional(tabla, payload).catch((e) => console.warn("[Realtime] _applyRTRelacional:", tabla, e)), 600);
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") console.log("[Realtime] Canal " + tabla + " activo \u2713");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.warn("[Realtime] Canal " + tabla + " estado:", status);
    });
    window._mkRTChannels.push(_chRel);
  });
  window.addEventListener("beforeunload", () => {
    (window._mkRTChannels || []).forEach((ch) => {
      try {
        ch.unsubscribe();
      } catch (e) {
      }
    });
  });
}
function _rtInPlace(arr, fresh) {
  if (!Array.isArray(arr) || !Array.isArray(fresh)) return;
  arr.splice(0, arr.length, ...fresh);
}
async function _applyRTRelacional(tabla, payload) {
  if (document.querySelector(".modal.active")) return;
  if (!window.pedidos && !window.products) return;
  const key = _rtTablaAKey[tabla];
  if (!key) return;
  const eventType = payload?.eventType || "UPDATE";
  const rowData = payload?.new || payload?.old;
  try {
    const arr = window[key];
    if (!Array.isArray(arr) || arr.length === 0) {
      const { data } = await db.from(tabla).select("*").limit(2e3);
      if (!data) return;
      const fresh = data.map((r) => _rtTransformarFila(tabla, r)).filter(Boolean);
      _rtInPlace(arr || [], fresh);
      sqliteStorage.set(key, fresh).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    } else if (rowData) {
      const transformed = _rtTransformarFila(tabla, rowData);
      if (!transformed) return;
      if (eventType === "INSERT") {
        const existe = arr.some((x) => String(x.id) === String(transformed.id));
        if (!existe) arr.push(transformed);
      } else if (eventType === "UPDATE") {
        const i = arr.findIndex((x) => String(x.id) === String(transformed.id));
        if (i >= 0) {
          if (tabla === "products") {
            const localP = arr[i];
            if (localP && localP.tipo !== "materia_prima" && localP.tipo !== "servicio" && Array.isArray(localP.mpComponentes) && localP.mpComponentes.length > 0) {
              transformed.stock = localP.stock || 0;
            }
          }
          arr.splice(i, 1, transformed);
        } else arr.push(transformed);
      } else if (eventType === "DELETE") {
        const delId = rowData.id;
        const i = arr.findIndex((x) => String(x.id) === String(delId));
        if (i >= 0) arr.splice(i, 1);
      }
      sqliteStorage.set(key, arr).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    }
    await _applyRTDesktopConDatos(key, window[key] || []);
    console.log("[Realtime] " + tabla + " (" + eventType + ") aplicado in-place");
  } catch (e) {
    console.warn("[Realtime] Error en _applyRTRelacional:", tabla, e);
  }
}
async function _applyRTDesktop(key) {
  if (document.querySelector(".modal.active")) return;
  if (!window.pedidos && !window.products) return;
  try {
    const fresh = await sbLoad(key, null);
    if (fresh === null) return;
    await _applyRTDesktopConDatos(key, fresh);
  } catch (e) {
    console.warn("[Realtime] Error aplicando cambio:", key, e);
  }
}
async function _applyRTDesktopConDatos(key, fresh) {
  if (!Array.isArray(fresh)) return;
  if (key === "pedidos") {
    _rtInPlace(window.pedidos, fresh);
    if (typeof renderPedidosTable === "function") renderPedidosTable();
    if (typeof updatePedidosStats === "function") updatePedidosStats();
    if (typeof updateDashboard === "function") updateDashboard();
  } else if (key === "products") {
    _rtInPlace(window.products, fresh);
    if (typeof renderInventoryTable === "function") renderInventoryTable();
    if (typeof updateDashboard === "function") updateDashboard();
  } else if (key === "clients") {
    _rtInPlace(window.clients, fresh);
    if (typeof renderClientsTable === "function") renderClientsTable();
  } else if (key === "pedidosFinalizados") {
    _rtInPlace(window.pedidosFinalizados, fresh);
    if (typeof renderHistorialPedidos === "function") renderHistorialPedidos();
    if (typeof renderBalance === "function") renderBalance();
  } else if (key === "salesHistory") {
    _rtInPlace(window.salesHistory, fresh);
    if (typeof renderSalesHistory === "function") renderSalesHistory();
    if (typeof renderBalance === "function") renderBalance();
    if (typeof updateDashboard === "function") updateDashboard();
  } else if (key === "incomes") {
    _rtInPlace(window.incomes, fresh);
    if (typeof renderBalance === "function") renderBalance();
  } else if (key === "expenses") {
    _rtInPlace(window.expenses, fresh);
    if (typeof renderBalance === "function") renderBalance();
  }
}
function _comprimirFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round(h * MAX / w);
            w = MAX;
          } else {
            w = Math.round(w * MAX / h);
            h = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.82);
      };
      img.onerror = () => resolve(file);
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
async function subirImagenStorage(file) {
  try {
    const fileComprimido = await _comprimirFile(file);
    const ext = file.name.split(".").pop();
    const fileName = `producto_${Date.now()}.${ext}`;
    const { data, error } = await db.storage.from("product-images").upload(fileName, fileComprimido, { upsert: true });
    if (error) throw error;
    const { data: urlData } = db.storage.from("product-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (e) {
    console.warn("Supabase Storage no disponible, guardando imagen localmente:", e);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        if (base64.length > 27e4) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX = 400;
            const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.src = base64;
        } else {
          resolve(base64);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}
window._pendingSync = false;
let _offlineMode = false;
function actualizarBannerOffline(n) {
  let banner = document.getElementById("offlineQueueBanner");
  if (n > 0) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "offlineQueueBanner";
      banner.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#f59e0b,#d97706);color:white;font-weight:700;font-size:0.82rem;padding:10px 20px;border-radius:99px;box-shadow:0 4px 16px rgba(245,158,11,0.4);z-index:9999;display:flex;align-items:center;gap:8px;cursor:pointer;animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;";
      banner.onclick = sincronizarPendientes;
      document.body.appendChild(banner);
    }
    const iconEl = document.createElement("i");
    iconEl.className = "fas fa-wifi-slash";
    const textEl = document.createElement("span");
    textEl.textContent = " " + n + " venta(s) guardadas offline \u2014 ";
    const linkEl = document.createElement("u");
    linkEl.textContent = "Sincronizar ahora";
    linkEl.style.cursor = "pointer";
    if (banner._syncHandler) banner.removeEventListener("click", banner._syncHandler);
    banner._syncHandler = function() {
      if (typeof sincronizarPendientes === "function") sincronizarPendientes();
    };
    linkEl.addEventListener("click", banner._syncHandler);
    banner.innerHTML = "";
    banner.appendChild(iconEl);
    banner.appendChild(textEl);
    banner.appendChild(linkEl);
  } else if (banner) {
    banner.remove();
  }
}
function closeModal(idOrEl) {
  const modal = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (!modal) return;
  if (!modal.classList.contains("active")) {
    modal.style.display = "";
    return;
  }
  modal.classList.add("closing");
  modal.classList.remove("active");
  const duration = 220;
  setTimeout(() => {
    modal.classList.remove("closing");
    modal.style.display = "";
  }, duration);
}
window.closeModal = closeModal;
function openModal(idOrEl) {
  const modal = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (!modal) return;
  modal.style.display = "";
  modal.classList.remove("closing");
  modal.classList.add("active");
}
window.openModal = openModal;
function actualizarIndicadorConexion(online) {
  const dot = document.getElementById("supabaseStatusDot");
  const txt = document.getElementById("supabaseStatusText");
  const box = document.getElementById("supabaseStatus");
  _offlineMode = !online;
  if (!dot || !txt) return;
  if (online) {
    dot.className = "w-2 h-2 rounded-full bg-green-500 flex-shrink-0 inline-block";
    txt.textContent = "Guardado en nube \u2713";
    txt.className = "text-green-700 truncate";
    if (box) {
      box.style.transition = "background 0.3s ease";
      box.style.background = "#dcfce7";
      box.style.borderColor = "#86efac";
      box.style.border = "1px solid #86efac";
      clearTimeout(box._flashTimer);
      box._flashTimer = setTimeout(() => {
        box.style.background = "";
        box.style.border = "";
        txt.textContent = "Supabase conectado";
      }, 2e3);
    }
    _ocultarBannerOfflineConexion();
  } else {
    dot.className = "w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 inline-block";
    txt.textContent = "Sin conexi\xF3n (local)";
    txt.className = "text-yellow-600 truncate";
    if (box) {
      box.style.background = "";
      box.style.border = "";
    }
    _mostrarBannerOfflineConexion();
  }
}
function _mostrarBannerOfflineConexion() {
  let banner = document.getElementById("mk-offline-banner");
  if (banner) return;
  banner = document.createElement("div");
  banner.id = "mk-offline-banner";
  banner.innerHTML = `
        <span style="font-size:1.1em">\u{1F4E1}</span>
        <span>Sin internet \u2014 trabajando en modo local. Los datos se sincronizar\xE1n al reconectarse.</span>
        <button onclick="document.getElementById('mk-offline-banner').remove()"
            style="margin-left:12px;background:rgba(255,255,255,0.2);border:none;color:white;
                   border-radius:6px;padding:2px 8px;cursor:pointer;font-size:0.85em;">\u2715</button>
    `;
  banner.style.cssText = [
    "position:fixed",
    "bottom:0",
    "left:0",
    "right:0",
    "z-index:99999",
    "background:linear-gradient(90deg,#b45309,#d97706)",
    "color:white",
    "padding:10px 20px",
    "display:flex",
    "align-items:center",
    "gap:10px",
    "font-size:0.82rem",
    "font-weight:600",
    "box-shadow:0 -4px 20px rgba(0,0,0,0.2)",
    "animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both"
  ].join(";");
  document.body.appendChild(banner);
}
function _ocultarBannerOfflineConexion() {
  const banner = document.getElementById("mk-offline-banner");
  if (banner) {
    banner.style.animation = "toastOut 0.3s ease forwards";
    setTimeout(() => {
      try {
        banner.remove();
      } catch (e) {
      }
    }, 320);
  }
}
function encolarVentaOffline(saleRecord) {
  if (!ipcRenderer) return;
  try {
    ipcRenderer.send("save-venta-pendiente", {
      id: String(saleRecord.id),
      folio: saleRecord.folio,
      date: saleRecord.date,
      ...saleRecord
    });
    ipcRenderer.invoke("count-ventas-pendientes").then((n) => actualizarBannerOffline(n)).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    manekiToastExport("\u{1F4E6} Venta " + saleRecord.folio + " guardada offline", "warn");
  } catch (e) {
    console.error("Error encolando venta offline:", e);
  }
}
async function sincronizarPendientes() {
  if (ipcRenderer) {
    try {
      const ventasPendientes = await ipcRenderer.invoke("get-ventas-pendientes");
      if (ventasPendientes && ventasPendientes.length > 0) {
        let cambiado = false;
        for (const venta of ventasPendientes) {
          const yaExiste = salesHistory.some((s) => String(s.id) === String(venta.data?.id || venta.id));
          if (!yaExiste && venta.data) {
            salesHistory.push(venta.data);
            cambiado = true;
          }
        }
        if (cambiado) {
          const { error } = await db.from("store").upsert(
            { key: "salesHistory", value: JSON.stringify(salesHistory) },
            { onConflict: "key" }
          );
          if (!error) {
            for (const venta of ventasPendientes) {
              ipcRenderer.send("delete-venta-pendiente", String(venta.id));
            }
            manekiToastExport("\u2705 " + ventasPendientes.length + " venta(s) offline sincronizadas", "ok");
          }
        } else {
          for (const venta of ventasPendientes) {
            ipcRenderer.send("delete-venta-pendiente", String(venta.id));
          }
        }
      }
      const restantes = await ipcRenderer.invoke("count-ventas-pendientes").catch(() => 0);
      actualizarBannerOffline(restantes);
    } catch (e) {
      console.error("Error sincronizando:", e);
    }
  }
  if (!window._pendingSync) return;
  const keys = [
    "categories",
    "products",
    "clients",
    "salesHistory",
    "quotes",
    "incomes",
    "expenses",
    "receivables",
    "payables",
    "pedidos",
    "equipos",
    "roiHistorial",
    "roiConfig",
    "envioAnillos",
    "gastosRecurrentes",
    "stockMovimientos",
    "pedidosFinalizados",
    "notas",
    "storeConfig"
  ];
  const upsertBatch = [];
  for (const key of keys) {
    try {
      const localData = await sqliteStorage.get(key, null);
      if (localData === null) continue;
      const localMeta = await sqliteStorage.get("__meta_" + key, null);
      const localSyncedAt = localMeta?.syncedAt || "1970-01-01T00:00:00.000Z";
      const { data: remote } = await db.from("store").select("value").eq("key", key).maybeSingle().catch(() => ({ data: null }));
      let shouldSync = true;
      if (remote && remote.value) {
        try {
          const remoteData = JSON.parse(remote.value);
          const remoteSyncedAt = remoteData?.__syncedAt || "1970-01-01T00:00:00.000Z";
          if (remoteSyncedAt > localSyncedAt) shouldSync = false;
        } catch (e) {
        }
      }
      if (!shouldSync) continue;
      upsertBatch.push({ key, value: JSON.stringify(localData) });
    } catch (e) {
    }
  }
  let ok = true;
  const BATCH_SIZE = 5;
  for (let i = 0; i < upsertBatch.length; i += BATCH_SIZE) {
    const chunk = upsertBatch.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      chunk.map((item) => db.from("store").upsert(item, { onConflict: "key" }).then((r) => r.error))
    );
    if (results.some((err) => err)) {
      ok = false;
      break;
    }
  }
  if (ok) {
    window._pendingSync = false;
    actualizarIndicadorConexion(true);
    manekiToastExport(`\u2705 ${upsertBatch.length} tablas sincronizadas con Supabase`, "ok");
  }
}
window.addEventListener("online", () => {
  actualizarIndicadorConexion(true);
  sincronizarPendientes();
});
window.addEventListener("offline", () => {
  actualizarIndicadorConexion(false);
});
setTimeout(() => {
  if (ipcRenderer) {
    ipcRenderer.invoke("count-ventas-pendientes").then((n) => {
      if (n > 0) actualizarBannerOffline(n);
    }).catch((e) => console.warn("[Maneki DB]", e?.message || e));
  }
}, 3e3);
const _sbSaveTimers = {};
async function sbSave(key, data) {
  const dataConTimestamp = data;
  const sqliteOk = await sqliteStorage.set(key, dataConTimestamp);
  if (!sqliteOk) {
    try {
      localStorage.setItem("maneki_" + key, JSON.stringify(dataConTimestamp));
    } catch (e) {
      if (e && (e.name === "QuotaExceededError" || e.code === 22)) {
        console.warn("[Storage] localStorage lleno");
      } else {
        console.warn("localStorage tambi\xE9n fall\xF3:", key, e);
      }
    }
  }
  if (_sbSaveTimers[key]) clearTimeout(_sbSaveTimers[key]);
  return new Promise((resolve, reject) => {
    _sbSaveTimers[key] = setTimeout(async () => {
      delete _sbSaveTimers[key];
      try {
        if (!db) {
          window._pendingSync = true;
          actualizarIndicadorConexion(false);
          resolve();
          return;
        }
        const { error } = await _withTimeout(db.from("store").upsert(
          { key, value: JSON.stringify(dataConTimestamp) },
          { onConflict: "key" }
        ));
        if (error) {
          window._pendingSync = true;
          actualizarIndicadorConexion(false);
          reject(new Error(error.message || "Error de Supabase"));
        } else {
          actualizarIndicadorConexion(true);
          sqliteStorage.set("__meta_" + key, { syncedAt: (/* @__PURE__ */ new Date()).toISOString() }).catch((e) => console.warn("[Maneki DB]", e?.message || e));
          if (typeof window._mkUpdateSyncTime === "function") window._mkUpdateSyncTime();
          resolve();
        }
      } catch (e) {
        console.error("sbSave error de red:", e);
        window._pendingSync = true;
        actualizarIndicadorConexion(false);
        reject(e);
      }
    }, 500);
  });
}
const _RELATIONAL_TABLES = {
  products: { table: "products", min: 1, map: (row) => ({
    ...row,
    stockMin: row.stock_min,
    imageUrl: row.image_url,
    mpComponentes: row.mp_componentes,
    historialPrecios: row.historial_precios,
    publicarTienda: row.publicar_tienda,
    proveedorUrl: row.proveedor_url,
    esEmpaque: row.es_empaque,
    usaVariantes: row.usa_variantes,
    rendimientoPorHoja: row.rendimiento_por_hoja,
    puntoReorden: row.punto_reorden,
    historialCostos: row.historial_costos,
    compraPaquete: row.compra_paquete,
    kitComponentes: row.kit_componentes,
    isKit: row.is_kit
  }) },
  salesHistory: { table: "sales_history", min: 1, orderBy: "date", limit: 1e3, map: (row) => ({ ...row }) },
  clients: { table: "clients", min: 1, map: (row) => ({
    ...row,
    totalPurchases: row.total_purchases,
    lastPurchase: row.last_purchase
  }) },
  categories: { table: "categories", min: 1, map: (row) => ({ ...row }) },
  pedidos: { table: "orders", min: 1, map: (row) => ({
    id: row.id,
    folio: row.folio,
    cliente: row.cliente,
    telefono: row.telefono,
    redes: row.redes,
    fecha: row.fecha,
    entrega: row.entrega,
    concepto: row.concepto,
    cantidad: row.cantidad || 1,
    costo: row.costo || 0,
    anticipo: row.anticipo || 0,
    total: row.total || 0,
    resta: row.resta || 0,
    notas: row.notas,
    status: row.status || "confirmado",
    fechaCreacion: row.fecha_creacion,
    productosInventario: row.productos_inventario || [],
    inventarioDescontado: row.inventario_descontado === true,
    fromQuote: row.from_quote,
    whatsapp: row.whatsapp,
    facebook: row.facebook,
    lugarEntrega: row.lugar_entrega,
    costoMateriales: row.costo_materiales || 0,
    prioridad: row.prioridad || "normal",
    notasInternas: row.notas_internas,
    pagos: row.pagos || [],
    empaques: row.empaques || [],
    historialEstados: row.historial_estados || [],
    fechaUltimoEstado: row.fecha_ultimo_estado,
    fechaPedido: row.fecha_pedido,
    empaquesDescontados: row.empaques_descontados === true
  }) },
  pedidosFinalizados: { table: "orders_finalizados", min: 1, orderBy: "fecha_finalizado", limit: 500, map: (row) => ({
    id: row.id,
    folio: row.folio,
    cliente: row.cliente,
    telefono: row.telefono,
    redes: row.redes,
    fecha: row.fecha,
    entrega: row.entrega,
    concepto: row.concepto,
    cantidad: row.cantidad || 1,
    costo: row.costo || 0,
    anticipo: row.anticipo || 0,
    total: row.total || 0,
    resta: row.resta || 0,
    notas: row.notas,
    status: row.status || "finalizado",
    fechaCreacion: row.fecha_creacion,
    fechaFinalizado: row.fecha_finalizado,
    productosInventario: row.productos_inventario || [],
    inventarioDescontado: row.inventario_descontado === true,
    fromQuote: row.from_quote,
    whatsapp: row.whatsapp,
    facebook: row.facebook,
    lugarEntrega: row.lugar_entrega,
    costoMateriales: row.costo_materiales || 0,
    prioridad: row.prioridad || "normal",
    notasInternas: row.notas_internas,
    pagos: row.pagos || [],
    empaques: row.empaques || [],
    historialEstados: row.historial_estados || [],
    fechaPedido: row.fecha_pedido,
    empaquesDescontados: row.empaques_descontados === true
  }) }
};
async function _loadFromTable(key) {
  const cfg = _RELATIONAL_TABLES[key];
  if (!cfg || !db) return null;
  try {
    let query = db.from(cfg.table).select("*");
    if (cfg.orderBy) query = query.order(cfg.orderBy, { ascending: false });
    if (cfg.limit) query = query.limit(cfg.limit);
    const { data, error } = await _withTimeout(query, 1e4);
    if (error || !data) return null;
    if (cfg.min > 0 && data.length < cfg.min) return null;
    const mapped = data.map(cfg.map);
    console.log(`[DB] \u2713 ${key} loaded from ${cfg.table} (${mapped.length} rows)`);
    return mapped;
  } catch (e) {
    console.warn(`[DB] _loadFromTable(${key}) failed, falling back to store:`, e?.message);
    return null;
  }
}
async function _loadMoreFromTable(key, offset, pageSize) {
  const cfg = _RELATIONAL_TABLES[key];
  if (!cfg || !db) return [];
  try {
    let query = db.from(cfg.table).select("*");
    if (cfg.orderBy) query = query.order(cfg.orderBy, { ascending: false });
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await _withTimeout(query, 1e4);
    if (error || !data) return [];
    return data.map(cfg.map);
  } catch (e) {
    console.warn(`[DB] _loadMoreFromTable(${key}) failed:`, e?.message);
    return [];
  }
}
window._loadMoreFromTable = _loadMoreFromTable;
async function _migrateToRelationalIfEmpty() {
  if (!db) return;
  const pairs = [
    { key: "pedidos", saveFn: typeof savePedidos === "function" ? savePedidos : null },
    { key: "pedidosFinalizados", saveFn: typeof savePedidosFinalizados === "function" ? savePedidosFinalizados : null },
    { key: "clients", saveFn: typeof saveClients === "function" ? saveClients : null }
  ];
  for (const { key, saveFn } of pairs) {
    const cfg = _RELATIONAL_TABLES[key];
    if (!cfg) continue;
    try {
      const { data } = await _withTimeout(db.from(cfg.table).select("id").limit(1), 8e3);
      if (data && data.length > 0) continue;
      const localData = window[key];
      if (!Array.isArray(localData) || localData.length === 0) continue;
      console.log(`[DB] Migrating ${localData.length} ${key} to ${cfg.table}...`);
      if (saveFn) await saveFn();
      console.log(`[DB] \u2713 ${key} migrated to relational table`);
    } catch (e) {
      console.warn(`[DB] Migration ${key} failed:`, e?.message);
    }
  }
}
window._migrateToRelationalIfEmpty = _migrateToRelationalIfEmpty;
async function sbLoad(key, def) {
  const relational = await _loadFromTable(key);
  if (relational !== null) {
    return relational;
  }
  try {
    const { data, error } = await _withTimeout(db.from("store").select("value").eq("key", key).maybeSingle());
    if (!error && data) {
      try {
        const parsed = JSON.parse(data.value);
        const _esArrayVacio = Array.isArray(parsed) && parsed.length === 0;
        if (_esArrayVacio) {
          const _sqlite = await sqliteStorage.get(key, null);
          if (_sqlite !== null && Array.isArray(_sqlite) && _sqlite.length > 0) {
            console.log(`[sbLoad] store devuelve [] para "${key}" pero SQLite tiene ${_sqlite.length} items \u2014 usando SQLite`);
            return _sqlite;
          }
        }
        sqliteStorage.set(key, parsed).catch((e) => console.warn("[Maneki DB]", e?.message || e));
        return parsed;
      } catch (e) {
        console.warn("Error parseando dato Supabase:", e);
      }
    }
  } catch (e) {
    console.warn("sbLoad Supabase no disponible, usando SQLite local:", key);
  }
  const localSQLite = await sqliteStorage.get(key, null);
  if (localSQLite !== null) {
    return localSQLite;
  }
  try {
    const local = localStorage.getItem("maneki_" + key);
    if (local) {
      const parsed = JSON.parse(local);
      sqliteStorage.set(key, parsed).then(() => {
        localStorage.removeItem("maneki_" + key);
      }).catch((e) => console.warn("[Maneki DB]", e?.message || e));
      return parsed;
    }
  } catch (e) {
    console.warn("Error en localStorage fallback:", e);
  }
  return def;
}
async function verificarEspacioAlmacenamiento() {
  try {
    const sqliteInfo = await sqliteStorage.getSize();
    const sqliteKB = sqliteInfo.dbKB || sqliteInfo.kb || 0;
    let lsBytes = 0;
    for (let k in localStorage) {
      if (localStorage.hasOwnProperty(k)) lsBytes += (localStorage[k].length + k.length) * 2;
    }
    const lsKB = Math.round(lsBytes / 1024);
    if (lsKB > 4500) {
      manekiToastExport(
        `\u2139\uFE0F Migrando datos a SQLite local (m\xE1s espacio). Un momento...`,
        "ok"
      );
    }
    return { sqliteKB, lsKB };
  } catch (e) {
    return { sqliteKB: 0, lsKB: 0 };
  }
}
setTimeout(verificarEspacioAlmacenamiento, 1e4);
window._storageCheckInterval = setInterval(verificarEspacioAlmacenamiento, 10 * 60 * 1e3);
function saveToLocalStorage(key, data) {
}
async function mostrarEstadoAlmacenamiento() {
  const info = await verificarEspacioAlmacenamiento();
  const msg = [
    `\u{1F4BE} SQLite local: ${info.sqliteKB} KB (sin l\xEDmite pr\xE1ctico)`,
    `\u{1F4CB} localStorage: ${info.lsKB} KB / 5,120 KB`,
    `\u2705 Almacenamiento principal: SQLite (ilimitado)`
  ].join("\n");
  manekiToastExport(`\u{1F4BE} SQLite: ${info.sqliteKB}KB | Cache: ${info.lsKB}KB`, "ok");
  console.log("Estado almacenamiento:\n" + msg);
}
window.mostrarEstadoAlmacenamiento = mostrarEstadoAlmacenamiento;
let _localFolioCounters = {};
let _folioLock = false;
async function getNextFolio(tipo) {
  if (_folioLock) {
    await new Promise((r) => setTimeout(r, 100));
    return getNextFolio(tipo);
  }
  _folioLock = true;
  try {
    const key = "contador_" + tipo;
    try {
      const { data } = await db.from("store").select("value").eq("key", key).maybeSingle();
      let actual = 0;
      if (data) actual = parseInt(JSON.parse(data.value)) || 0;
      const siguiente = actual + 1;
      db.from("store").upsert({ key, value: JSON.stringify(siguiente) }, { onConflict: "key" }).catch((e) => console.warn("[Maneki DB]", e?.message || e));
      _localFolioCounters[tipo] = siguiente;
      return siguiente;
    } catch (e) {
      if (tipo === "venta") {
        const maxExistente = salesHistory.reduce((max, s) => {
          const n = parseInt((s.folio || "").replace("V-", "")) || 0;
          return n > max ? n : max;
        }, _localFolioCounters[tipo] || 0);
        _localFolioCounters[tipo] = maxExistente + 1;
        return _localFolioCounters[tipo];
      }
      _localFolioCounters[tipo] = (_localFolioCounters[tipo] || 0) + 1;
      return _localFolioCounters[tipo];
    }
  } finally {
    _folioLock = false;
  }
}
function sbSaveConFeedback(key, data, nombreAmigable) {
  (async () => {
    try {
      await sbSave(key, data);
      manekiToastExport(`\u2705 ${nombreAmigable || key} guardado.`, "ok");
    } catch (e) {
      manekiToastExport(`\u274C Error al guardar ${nombreAmigable || key}. Revisa tu conexi\xF3n.`, "err");
      console.error("sbSave error:", key, e);
    }
  })();
}
function saveCategories() {
  (async () => {
    await sbSave("categories", categories);
  })();
}
let stockMovimientos = [];
function saveStockMovimientos() {
  (async () => {
    await sbSave("stockMovimientos", stockMovimientos);
  })();
}
function registrarMovimiento(productoId, productoNombre, tipo, cantidad, motivo) {
  stockMovimientos.push({
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    fecha: _fechaHoy(),
    hora: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    productoId,
    productoNombre,
    tipo,
    cantidad,
    motivo
  });
  if ((window.stockMovimientos || []).length > 500) {
    window.stockMovimientos = window.stockMovimientos.slice(-500);
  }
  if (stockMovimientos.length > 500) {
    stockMovimientos.splice(0, stockMovimientos.length - 500);
  }
  saveStockMovimientos();
}
function _comprimirBase64(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round(h * MAX / w);
          w = MAX;
        } else {
          w = Math.round(w * MAX / h);
          h = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
async function _migrarBase64AStorage(p) {
  if (!p.imageUrl || p.imageUrl.startsWith("http")) return p.imageUrl || null;
  if (!p.imageUrl.startsWith("data:")) return null;
  if (p._migrationFailed) return null;
  if (p._base64Migrated) return p.imageUrl;
  try {
    const dataUrl = await _comprimirBase64(p.imageUrl);
    const [meta, b64] = dataUrl.split(",");
    if (!meta || !b64) throw new Error("data URL malformada");
    const mime = meta.split(":")[1].split(";")[0];
    const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const fileName = `producto_${p.id}_${Date.now()}.${ext}`;
    const file = new File([blob], fileName, { type: mime });
    const { data, error } = await db.storage.from("product-images").upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = db.storage.from("product-images").getPublicUrl(fileName);
    p.imageUrl = urlData.publicUrl;
    p._base64Migrated = true;
    delete p._migrationFailed;
    console.log(`\u2705 Imagen migrada a Storage: ${p.name} \u2192`, urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.warn(`No se pudo migrar imagen de "${p.name}" a Storage:`, e);
    p._migrationFailed = true;
    return null;
  }
}
function _calcStockParaSupabase(p) {
  if (!p.mpComponentes || p.mpComponentes.length === 0) return p.stock || 0;
  const tieneMpFisica = p.mpComponentes.some((c) => {
    const mp = (window.products || []).find((x) => String(x.id) === String(c.id));
    return !mp || mp.tipo !== "servicio";
  });
  if (!tieneMpFisica) return p.stock || 0;
  let minPiezas = Infinity;
  for (const comp of p.mpComponentes) {
    const mp = (window.products || []).find((x) => String(x.id) === String(comp.id));
    if (mp && mp.tipo === "servicio") continue;
    const stockMp = mp ? mp.stock || 0 : 0;
    const qty = comp.qty || 1;
    const posibles = Math.floor(stockMp / qty);
    if (posibles < minPiezas) minPiezas = posibles;
  }
  return minPiezas === Infinity ? 0 : minPiezas;
}
function saveProducts() {
  return (async () => {
    sqliteStorage.set("products", products).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      await Promise.all(products.map((p) => _migrarBase64AStorage(p)));
      const rows = products.map((p) => ({
        id: String(p.id),
        name: p.name || "",
        sku: p.sku || "",
        category: p.category || "",
        tipo: p.tipo || "producto",
        cost: Number(p.cost) || 0,
        price: Number(p.price) || 0,
        stock: _calcStockParaSupabase(p),
        // ← stock calculado desde MPs
        stock_min: Number(p.stockMin) || 0,
        image: p.image || null,
        image_url: p.imageUrl && p.imageUrl.startsWith("http") ? p.imageUrl : null,
        tags: p.tags || [],
        variants: p.variants || [],
        mp_componentes: p.mpComponentes || [],
        proveedor: p.proveedor || null,
        proveedor_url: p.proveedorUrl || null,
        notas: p.notas || null,
        unidad: p.unidad || "pza",
        es_empaque: p.esEmpaque === true,
        usa_variantes: p.usaVariantes === true,
        rendimiento_por_hoja: Number(p.rendimientoPorHoja) || 1,
        punto_reorden: p.puntoReorden != null ? Number(p.puntoReorden) : null,
        historial_costos: p.historialCostos || [],
        historial_precios: p.historialPrecios || [],
        compra_paquete: p.compraPaquete || null,
        kit_componentes: p.kitComponentes || [],
        is_kit: p.isKit === true,
        activo: p.activo !== false,
        publicar_tienda: p.publicarTienda === true,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { error } = await db.from("products").upsert(rows, { onConflict: "id" });
      if (error) console.error("saveProducts relacional error:", error);
    } catch (e) {
      console.error("saveProducts relacional excepci\xF3n:", e);
    }
  })();
}
function saveClients() {
  (async () => {
    sqliteStorage.set("clients", clients).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      const rows = (window.clients || []).map((c) => ({
        id: String(c.id),
        name: c.name || "",
        phone: c.phone || null,
        facebook: c.facebook || null,
        email: c.email || null,
        type: c.type || "regular",
        notas: c.notas || null,
        total_purchases: Number(c.totalPurchases) || 0,
        last_purchase: c.lastPurchase || null,
        is_vip: c.type === "vip",
        tags: c.tags || []
      }));
      if (rows.length) await db.from("clients").upsert(rows, { onConflict: "id" }).catch((e) => console.warn("[clients]", e));
    } catch (e) {
    }
  })();
}
function saveSalesHistory() {
  (async () => {
    sqliteStorage.set("salesHistory", salesHistory).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      const rows = salesHistory.map((s) => ({
        id: String(s.id),
        folio: s.folio || null,
        date: s.date || null,
        time: s.time || null,
        customer: s.customer || null,
        concept: s.concept || null,
        note: s.note || null,
        products: s.products || [],
        subtotal: Number(s.subtotal) || 0,
        discount: Number(s.discount) || 0,
        tax: Number(s.tax) || 0,
        total: Number(s.total) || 0,
        method: s.method || null
      }));
      const { error } = await db.from("sales_history").upsert(rows, { onConflict: "id" });
      if (error) console.error("saveSalesHistory relacional error:", error);
    } catch (e) {
      console.error("saveSalesHistory relacional excepci\xF3n:", e);
    }
  })();
}
function saveQuotes() {
  (async () => {
    await sbSave("quotes", quotes);
  })();
}
function saveIncomes() {
  (async () => {
    sqliteStorage.set("incomes", incomes).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      const rows = (window.incomes || []).map((i) => ({
        id: typeof i.id === "number" ? i.id : void 0,
        concept: i.concept || i.concepto || null,
        amount: Number(i.amount || i.monto) || 0,
        date: i.date || i.fecha || null,
        client: i.client || i.cliente || null,
        from_pos: i.fromPOS === true,
        folio_origen: i.folioOrigen || null,
        pedido_id: i.pedidoId || null
      }));
      if (rows.length && db) await db.from("incomes").upsert(rows, { onConflict: "id" }).catch((e) => console.warn("[incomes]", e));
    } catch (e) {
    }
  })();
}
function saveExpenses() {
  (async () => {
    sqliteStorage.set("expenses", expenses).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      const rows = (window.expenses || []).map((e) => ({
        id: typeof e.id === "number" ? e.id : void 0,
        concept: e.concept || e.concepto || null,
        amount: Number(e.amount || e.monto) || 0,
        date: e.date || e.fecha || null,
        category: e.category || e.categoria || null,
        etiqueta: e.etiqueta || null,
        notas: e.notas || null,
        from_payable: e.fromPayable === true
      }));
      if (rows.length && db) await db.from("expenses").upsert(rows, { onConflict: "id" }).catch((e) => console.warn("[expenses]", e));
    } catch (e) {
    }
  })();
}
let gastosRecurrentes = [];
function saveGastosRecurrentes() {
  (async () => {
    await sbSave("gastosRecurrentes", gastosRecurrentes);
  })();
}
function saveReceivables() {
  (async () => {
    await sbSave("receivables", receivables);
  })();
}
function savePayables() {
  (async () => {
    await sbSave("payables", payables);
  })();
}
function savePedidos() {
  return (async () => {
    sqliteStorage.set("pedidos", pedidos).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      const rows = pedidos.map((p) => ({
        id: String(p.id),
        folio: p.folio || null,
        cliente: p.cliente || null,
        telefono: p.telefono || null,
        redes: p.redes || null,
        fecha: p.fechaPedido || p.fecha || null,
        // BUG-PED-012 FIX: p.fechaPedido es el campo real
        entrega: p.entrega || null,
        concepto: p.concepto || null,
        cantidad: Number(p.cantidad) || 1,
        costo: Number(p.costo) || 0,
        anticipo: Number(p.anticipo) || 0,
        total: Number(p.total) || 0,
        resta: Number(p.resta) || 0,
        notas: p.notas || null,
        status: p.status || "confirmado",
        fecha_creacion: p.fechaCreacion || null,
        productos_inventario: p.productosInventario || [],
        inventario_descontado: p.inventarioDescontado === true,
        from_quote: p.fromQuote || null,
        whatsapp: p.whatsapp || p.telefono || null,
        facebook: p.facebook || p.redes || null,
        lugar_entrega: p.lugarEntrega || null,
        costo_materiales: Number(p.costoMateriales) || 0,
        prioridad: p.prioridad || "normal",
        notas_internas: p.notasInternas || null,
        pagos: p.pagos || [],
        empaques: p.empaques || [],
        historial_estados: p.historialEstados || [],
        fecha_ultimo_estado: p.fechaUltimoEstado || null,
        fecha_pedido: p.fechaPedido || null,
        empaques_descontados: p.empaquesDescontados === true,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { error } = await db.from("orders").upsert(rows, { onConflict: "id" });
      if (error) console.error("savePedidos relacional error:", error);
    } catch (e) {
      console.error("savePedidos relacional excepci\xF3n:", e);
    }
  })();
}
function savePedidosFinalizados() {
  return (async () => {
    sqliteStorage.set("pedidosFinalizados", pedidosFinalizados).catch((e) => console.warn("[Maneki DB]", e?.message || e));
    try {
      const rows = pedidosFinalizados.map((p) => ({
        id: String(p.id),
        folio: p.folio || null,
        cliente: p.cliente || null,
        telefono: p.telefono || null,
        redes: p.redes || null,
        fecha: p.fechaPedido || p.fecha || null,
        // BUG-PED-012 FIX
        entrega: p.entrega || null,
        concepto: p.concepto || null,
        cantidad: Number(p.cantidad) || 1,
        costo: Number(p.costo) || 0,
        anticipo: Number(p.anticipo) || 0,
        total: Number(p.total) || 0,
        resta: Number(p.resta) || 0,
        notas: p.notas || null,
        status: p.status || "finalizado",
        fecha_creacion: p.fechaCreacion || null,
        fecha_finalizado: p.fechaFinalizado || null,
        productos_inventario: p.productosInventario || [],
        inventario_descontado: p.inventarioDescontado === true,
        from_quote: p.fromQuote || null,
        whatsapp: p.whatsapp || p.telefono || null,
        facebook: p.facebook || p.redes || null,
        lugar_entrega: p.lugarEntrega || null,
        costo_materiales: Number(p.costoMateriales) || 0,
        prioridad: p.prioridad || "normal",
        notas_internas: p.notasInternas || null,
        pagos: p.pagos || [],
        empaques: p.empaques || [],
        historial_estados: p.historialEstados || [],
        fecha_pedido: p.fechaPedido || null,
        empaques_descontados: p.empaquesDescontados === true,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { error } = await db.from("orders_finalizados").upsert(rows, { onConflict: "id" });
      if (error) console.error("savePedidosFinalizados relacional error:", error);
    } catch (e) {
      console.error("savePedidosFinalizados relacional excepci\xF3n:", e);
    }
  })();
}
//# sourceMappingURL=db.js.map
