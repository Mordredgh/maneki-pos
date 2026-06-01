if (typeof window.showSection === "undefined") {
  window.showSection = function(name) {
    document.querySelectorAll('section[id$="-section"], section[id$="Section"]').forEach((s) => {
      s.classList.add("hidden");
      s.style.display = "";
    });
    const sec = document.getElementById(name + "-section") || document.getElementById(name + "Section");
    if (sec) {
      sec.classList.remove("hidden");
    }
  };
}
(function() {
  const COLORES = {
    rojo: "#ef4444",
    roja: "#ef4444",
    red: "#ef4444",
    azul: "#3b82f6",
    azules: "#3b82f6",
    blue: "#3b82f6",
    "azul marino": "#1e3a8a",
    "marino": "#1e3a8a",
    verde: "#22c55e",
    green: "#22c55e",
    amarillo: "#eab308",
    amarilla: "#eab308",
    yellow: "#eab308",
    dorado: "#d97706",
    gold: "#d97706",
    negro: "#1f2937",
    negra: "#1f2937",
    black: "#1f2937",
    blanco: "#f9fafb",
    blanca: "#f9fafb",
    white: "#f9fafb",
    rosa: "#ec4899",
    pink: "#ec4899",
    "rosa mexicano": "#e91e8c",
    morado: "#a855f7",
    morada: "#a855f7",
    violeta: "#8b5cf6",
    lila: "#c084fc",
    lavanda: "#c4b5fd",
    purple: "#a855f7",
    naranja: "#f97316",
    orange: "#f97316",
    gris: "#9ca3af",
    grise: "#9ca3af",
    gray: "#9ca3af",
    grey: "#9ca3af",
    plateado: "#94a3b8",
    silver: "#94a3b8",
    caf\u00E9: "#92400e",
    cafe: "#92400e",
    "marr\xF3n": "#92400e",
    marron: "#92400e",
    brown: "#78350f",
    beige: "#e5c9a0",
    crema: "#fef3c7",
    turquesa: "#06b6d4",
    celeste: "#7dd3fc",
    cian: "#22d3ee",
    cyan: "#22d3ee",
    aqua: "#22d3ee",
    coral: "#f87171",
    salmon: "#fca5a5",
    salm\u00F3n: "#fca5a5",
    oliva: "#84cc16",
    olive: "#65a30d",
    magenta: "#e879f9",
    fucsia: "#e879f9",
    fuchsia: "#e879f9",
    vino: "#9f1239",
    burgundy: "#9f1239",
    guinda: "#9f1239",
    indigo: "#6366f1",
    "azul cielo": "#7dd3fc",
    "azul rey": "#2563eb",
    "azul claro": "#93c5fd",
    "verde militar": "#4d7c0f",
    "verde lim\xF3n": "#a3e635",
    "verde menta": "#6ee7b7",
    "verde oliva": "#65a30d",
    "rojo vino": "#9f1239"
  };
  const EMOJI = {
    rojo: "\u{1F534}",
    roja: "\u{1F534}",
    red: "\u{1F534}",
    azul: "\u{1F535}",
    blue: "\u{1F535}",
    "azul marino": "\u{1F535}",
    marino: "\u{1F535}",
    verde: "\u{1F7E2}",
    green: "\u{1F7E2}",
    amarillo: "\u{1F7E1}",
    amarilla: "\u{1F7E1}",
    yellow: "\u{1F7E1}",
    dorado: "\u{1F7E1}",
    gold: "\u{1F7E1}",
    negro: "\u26AB",
    negra: "\u26AB",
    black: "\u26AB",
    blanco: "\u26AA",
    blanca: "\u26AA",
    white: "\u26AA",
    rosa: "\u{1FA77}",
    pink: "\u{1FA77}",
    "rosa mexicano": "\u{1FA77}",
    morado: "\u{1F7E3}",
    morada: "\u{1F7E3}",
    violeta: "\u{1F7E3}",
    lila: "\u{1F7E3}",
    purple: "\u{1F7E3}",
    naranja: "\u{1F7E0}",
    orange: "\u{1F7E0}",
    caf\u00E9: "\u{1F7E4}",
    cafe: "\u{1F7E4}",
    marr\u00F3n: "\u{1F7E4}",
    marron: "\u{1F7E4}",
    brown: "\u{1F7E4}",
    beige: "\u{1F7E4}",
    crema: "\u{1F7E1}",
    gris: "\u{1FA76}",
    plateado: "\u{1FA76}",
    silver: "\u{1FA76}",
    gray: "\u{1FA76}",
    grey: "\u{1FA76}",
    turquesa: "\u{1F535}",
    celeste: "\u{1F535}",
    cian: "\u{1F535}",
    cyan: "\u{1F535}",
    coral: "\u{1F534}",
    salmon: "\u{1FA77}",
    salm\u00F3n: "\u{1FA77}",
    vino: "\u{1F534}",
    burgundy: "\u{1F534}",
    guinda: "\u{1F534}",
    magenta: "\u{1F7E3}",
    fucsia: "\u{1F7E3}",
    fuchsia: "\u{1F7E3}",
    indigo: "\u{1F7E3}"
  };
  const esColor = (t) => /color|colour|color\s*\/\s*tono/i.test(t || "");
  window._mkColorDot = function(tipo, valor) {
    const _e = typeof _esc === "function" ? _esc : ((s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"));
    if (!esColor(tipo)) return `<span style="font-weight:600;">${_e(valor)}</span>`;
    const key = (valor || "").toLowerCase().trim();
    const css = COLORES[key];
    const borde = key === "blanco" || key === "blanca" || key === "white" || key === "crema" ? "#d1d5db" : "transparent";
    if (css) return `<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${css};border:1.5px solid ${borde};flex-shrink:0;"></span>${_e(valor)}</span>`;
    return `<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${valor.startsWith("#") || /^(rgb|hsl)/.test(valor) ? valor : "#d1d5db"};border:1.5px solid #e5e7eb;flex-shrink:0;"></span>${_e(valor)}</span>`;
  };
  window._mkColorEmoji = function(tipo, valor) {
    if (!esColor(tipo)) return valor;
    const key = (valor || "").toLowerCase().trim();
    const em = EMOJI[key];
    return em ? `${em} ${valor}` : valor;
  };
})();
window._normSearch = function _normSearch(str) {
  return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
window._money = function(v) {
  return Math.round((parseFloat(v) || 0) * 100) / 100;
};
window._sumLineas = function(items, precioKey, cantKey) {
  precioKey = precioKey || "price";
  cantKey = cantKey || "quantity";
  return items.reduce((s, it) => {
    const linea = Math.round((parseFloat(it[precioKey]) || 0) * 100) * (parseInt(it[cantKey]) || 1);
    return s + linea;
  }, 0) / 100;
};
window._ajustarStockId = window._ajustarStockId ?? null;
window.currentVariants = window.currentVariants ?? [];
window.currentProductImage = window.currentProductImage ?? null;
window.currentProductImageFile = window.currentProductImageFile ?? null;
window.modoEdicion = window.modoEdicion ?? false;
window.edicionProductoId = window.edicionProductoId ?? null;
window._invSortCol = window._invSortCol ?? null;
window._invSortDir = window._invSortDir ?? "asc";
window._invCurrentPage = window._invCurrentPage ?? 1;
window._invPageSize = window._invPageSize ?? 10;
window.stockMovements = window.stockMovements ?? window.stockMovimientos ?? [];
window._kitComponentes = window._kitComponentes ?? [];
function saveStockMovements() {
  window.stockMovimientos = window.stockMovements;
  sbSave("stockMovimientos", window.stockMovements);
}
function registrarMovimiento({ productoId, productoNombre, tipo, cantidad, motivo, stockAntes, stockDespues }) {
  window.stockMovements.unshift({
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    fecha: (typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]) + "T" + (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX"),
    productoId,
    productoNombre,
    tipo,
    cantidad,
    motivo: motivo || "",
    stockAntes,
    stockDespues
  });
  if (window.stockMovements.length > 500) {
    window.stockMovements.splice(500);
    window.stockMovimientos = window.stockMovements;
  }
  saveStockMovements();
}
window.registrarMovimiento = registrarMovimiento;
if (typeof _esc === "undefined") {
  window._esc = function(str) {
    if (str == null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  };
}
function _genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return "p" + crypto.randomUUID().replace(/-/g, "");
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function getStockEfectivo(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (parseInt(v.qty) || 0), 0);
  }
  if (product.mpComponentes && product.mpComponentes.length > 0) {
    const allServices = product.mpComponentes.every((c) => {
      const mp = (window.products || []).find((x) => String(x.id) === String(c.id));
      return mp && mp.tipo === "servicio";
    });
    if (allServices) return parseInt(product.stock) || 0;
    let minPiezas = Infinity;
    product.mpComponentes.forEach((c) => {
      const mp = (window.products || []).find((x) => String(x.id) === String(c.id));
      if (mp && mp.tipo !== "servicio") {
        const stockMp = mp.stock || 0;
        const qty = parseFloat(c.qty) || 1;
        const pzas = Math.floor(stockMp / qty);
        if (pzas < minPiezas) minPiezas = pzas;
      }
    });
    const stockManual = parseInt(product.stock) || 0;
    const stockFabricable = minPiezas === Infinity ? 0 : minPiezas;
    return stockManual + stockFabricable;
  }
  return parseInt(product.stock) || 0;
}
window.getStockEfectivo = getStockEfectivo;
function mostrarListaCompras(esRerender) {
  if (!esRerender) window._listaComprasChecked = {};
  const estadosPendientes = ["confirmado", "pago", "produccion", "envio", "salida", "retirar"];
  const pedidosPendientes = (window.pedidos || []).filter(
    (p) => estadosPendientes.includes(p.status) && !p.inventarioDescontado
  );
  const necesidades = {};
  pedidosPendientes.forEach((ped) => {
    (ped.productosInventario || []).forEach((item) => {
      const key = (item.id || item.name) + "|" + (item.variante || item.variant || "");
      if (!(item.id || item.name)) return;
      if (!necesidades[key]) {
        necesidades[key] = {
          id: item.id,
          nombre: item.name || item.nombre,
          variante: item.variante || item.variant || "",
          necesario: 0,
          pedidosRef: []
        };
      }
      necesidades[key].necesario += item.quantity || item.cantidad || 1;
      necesidades[key].pedidosRef.push(ped.folio || ped.id);
    });
  });
  const resultado = Object.values(necesidades).map((n) => {
    const prod = (window.products || []).find((p) => String(p.id) === String(n.id));
    let disponible = 0;
    if (prod) {
      if (n.variante) {
        const variante = (prod.variants || []).find(
          (v) => v.value === n.variante || `${v.type}: ${v.value}` === n.variante
        );
        disponible = variante ? variante.qty || 0 : getStockEfectivo(prod);
      } else {
        disponible = typeof getStockEfectivo === "function" ? getStockEfectivo(prod) : prod.stock || 0;
      }
    }
    const faltan = Math.max(0, n.necesario - disponible);
    return { ...n, disponible, faltan };
  }).sort((a, b) => b.faltan - a.faltan);
  resultado.forEach((r) => {
    const prod = (window.products || []).find((p) => String(p.id) === String(r.id));
    r.costoUnit = prod ? parseFloat(prod.cost) || 0 : 0;
    r.costoTotal = r.faltan * r.costoUnit;
  });
  const content = document.getElementById("listaComprasContent");
  if (!content) return;
  if (resultado.length === 0) {
    content.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:32px 0;font-size:.875rem;">No hay pedidos activos con materiales asignados.</p>';
  } else {
    const faltantes = resultado.filter((r) => r.faltan > 0);
    const suficientes = resultado.filter((r) => r.faltan === 0);
    let html = "";
    if (faltantes.length > 0) {
      const totalEstimado = faltantes.reduce((s, r) => s + r.costoTotal, 0);
      html += `<p style="font-size:.7rem;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">\u26A0\uFE0F Necesitas comprar (${faltantes.length})</p>`;
      html += `<table style="width:100%;border-collapse:collapse;font-size:.78rem;margin-bottom:4px;">
                <thead><tr style="background:#fef9c3;color:#92400e;font-size:.68rem;">
                    <th style="padding:6px 8px;text-align:left;border-bottom:1px solid #fcd34d;">Producto</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Stock</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Necesitas</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Faltan</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo c/u</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo est.</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">\u2713</th>
                </tr></thead><tbody>`;
      faltantes.forEach((r) => {
        const key = (r.id || r.nombre) + "|" + (r.variante || "");
        const comprado = !!window._listaComprasChecked[key];
        const rowStyle = comprado ? "background:#f0fdf4;text-decoration:line-through;color:#6b7280;" : "background:#fef3c7;";
        const escapedKey = key.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const prod = (window.products || []).find((p) => String(p.id) === String(r.id));
        const provUrl = prod && prod.proveedorUrl ? prod.proveedorUrl.trim() : "";
        const buyBtn = provUrl ? `<a href="${_esc(provUrl)}" target="_blank" style="display:inline-block;margin-top:3px;font-size:.65rem;padding:2px 6px;border-radius:999px;background:#dbeafe;color:#1d4ed8;text-decoration:none;font-weight:700;">\u{1F6D2} Comprar</a>` : "";
        html += `<tr style="${rowStyle}border-bottom:1px solid #fde68a;">
                    <td style="padding:8px 8px;">
                        <span style="font-weight:700;">${_esc(r.nombre)}</span>${r.variante ? ` <span style="font-weight:400;color:#92400e;font-size:.7rem;">(${_esc(r.variante)})</span>` : ""}
                        <div style="font-size:.65rem;color:#9ca3af;">Pedidos: ${[...new Set(r.pedidosRef)].map((f) => _esc(f)).join(", ")}</div>
                        ${buyBtn}
                    </td>
                    <td style="text-align:center;padding:8px 6px;">${r.disponible}</td>
                    <td style="text-align:center;padding:8px 6px;">${r.necesario}</td>
                    <td style="text-align:center;padding:8px 6px;font-weight:900;color:#d97706;">${r.faltan}</td>
                    <td style="text-align:right;padding:8px 6px;">${r.costoUnit > 0 ? "$" + r.costoUnit.toFixed(2) : "\u2014"}</td>
                    <td style="text-align:right;padding:8px 6px;font-weight:700;color:#b45309;">${r.costoTotal > 0 ? "$" + r.costoTotal.toFixed(2) : "\u2014"}</td>
                    <td style="text-align:center;padding:8px 6px;">
                        ${comprado ? '<span style="color:#16a34a;font-size:.75rem;font-weight:700;">\u2713 Comprado</span>' : `<input type="checkbox" onchange="window._lcToggleComprado('${escapedKey}')" style="width:16px;height:16px;cursor:pointer;">`}
                    </td>
                </tr>`;
      });
      html += `</tbody><tfoot><tr style="background:#fef9c3;font-weight:800;color:#b45309;">
                <td colspan="5" style="padding:8px 8px;text-align:right;font-size:.78rem;">\u{1F4B0} Total estimado:</td>
                <td style="padding:8px 6px;text-align:right;font-size:.85rem;">$${totalEstimado.toFixed(2)}</td>
                <td></td>
            </tr></tfoot></table>`;
    }
    if (suficientes.length > 0) {
      html += `<p style="font-size:.7rem;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;">\u2705 Stock suficiente (${suficientes.length})</p>`;
      html += suficientes.map((r) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:4px;">
                    <p style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(r.nombre)}${r.variante ? ` <span style="font-weight:400;color:#6b7280;">(${_esc(r.variante)})</span>` : ""}</p>
                    <p style="font-size:.78rem;color:#16a34a;font-weight:700;">Stock: ${r.disponible} / Necesitas: ${r.necesario}</p>
                </div>`).join("");
    }
    if (faltantes.length === 0) {
      html = '<p style="color:#16a34a;text-align:center;padding:12px 0;font-size:.9rem;font-weight:700;">\u2705 Tienes stock suficiente para todos los pedidos activos.</p>' + html;
    }
    if (faltantes.length > 0) {
      html += `<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
                <button onclick="window._lcWhatsApp()" style="flex:1;min-width:160px;background:#25d366;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">\u{1F4F2} Enviar por WhatsApp al proveedor</button>
                <button onclick="window._lcExportCSV()" style="flex:1;min-width:140px;background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar CSV</button>
            </div>`;
    }
    const ptProducibles = (window.products || []).filter((p) => (!p.tipo || p.tipo === "producto" || p.tipo === "producto_interno" || p.tipo === "pack") && Array.isArray(p.mpComponentes) && p.mpComponentes.length > 0).map((p) => ({ prod: p, producibles: typeof calcularProducibles === "function" ? calcularProducibles(p) ?? 0 : 0 })).sort((a, b) => b.producibles - a.producibles).slice(0, 5);
    if (ptProducibles.length > 0) {
      let topHtml = `<div style="margin-top:20px;padding:14px 16px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;">
                <p style="font-size:.7rem;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">\u{1F3ED} Top 5 m\xE1s producibles ahora</p>
                <div style="display:flex;flex-direction:column;gap:6px;">`;
      ptProducibles.forEach(({ prod, producibles }) => {
        const clr = producibles >= 5 ? "#16a34a" : producibles >= 1 ? "#d97706" : "#dc2626";
        const bg = producibles >= 5 ? "#d1fae5" : producibles >= 1 ? "#fef3c7" : "#fee2e2";
        topHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
                    <span style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(prod.name)}</span>
                    <span style="padding:2px 10px;border-radius:99px;font-size:.75rem;font-weight:700;background:${bg};color:${clr};">${producibles} uds</span>
                </div>`;
      });
      topHtml += `</div></div>`;
      html += topHtml;
    }
    content.innerHTML = html;
  }
  window._lcToggleComprado = function(key) {
    if (!window._listaComprasChecked) window._listaComprasChecked = {};
    window._listaComprasChecked[key] = true;
    mostrarListaCompras(true);
  };
  window._lcWhatsApp = function() {
    const faltantes = resultado.filter((r) => r.faltan > 0);
    if (!faltantes.length) return;
    const fecha = _fechaHoy();
    const totalEst = faltantes.reduce((s, r) => s + r.costoTotal, 0);
    let msg = `\u{1F4E6} Lista de compras Maneki Store
Fecha: ${fecha}

`;
    faltantes.forEach((r) => {
      const nombre = r.nombre + (r.variante ? ` (${r.variante})` : "");
      if (r.costoUnit > 0) {
        msg += `\u2022 ${nombre}: ${r.faltan} uds ($${r.costoUnit.toFixed(2)} c/u = $${r.costoTotal.toFixed(2)})
`;
      } else {
        msg += `\u2022 ${nombre}: ${r.faltan} uds
`;
      }
    });
    if (totalEst > 0) msg += `
\u{1F4B0} Total estimado: $${totalEst.toFixed(2)}`;
    const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
  };
  window._lcExportCSV = function() {
    const faltantes = resultado.filter((r) => r.faltan > 0);
    const headers = ["Producto", "Variante", "Cantidad requerida", "Stock actual", "Faltante", "Costo unitario", "Costo total"];
    const rows = faltantes.map((r) => [
      r.nombre,
      r.variante || "",
      r.necesario,
      r.disponible,
      r.faltan,
      r.costoUnit.toFixed(2),
      r.costoTotal.toFixed(2)
    ]);
    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lista-compras-${_fechaHoy()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  openModal("listaComprasModal");
}
window.mostrarListaCompras = mostrarListaCompras;
function syncStockFromVariants(product) {
  if (product.variants && product.variants.length > 0) {
    product.stock = product.variants.reduce((sum, v) => sum + (parseInt(v.qty) || 0), 0);
  }
}
function setupImageUpload() {
  ["productImage", "mpProductImage"].forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (!input || input._mkBound) return;
    input._mkBound = true;
    input.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (!file) return;
      window.currentProductImageFile = file;
      const reader = new FileReader();
      const isMp = inputId === "mpProductImage";
      reader.onload = (ev) => {
        const img = document.getElementById(isMp ? "mpPreviewImg" : "previewImg");
        const pre = document.getElementById(isMp ? "mpImagePreview" : "imagePreview");
        if (img) img.src = ev.target.result;
        if (pre) pre.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    });
  });
}
window.setupImageUpload = setupImageUpload;
function sortInventory(col) {
  window._invSortDir = window._invSortCol === col ? window._invSortDir === "asc" ? "desc" : "asc" : "asc";
  window._invSortCol = col;
  window._invCurrentPage = 1;
  document.querySelectorAll(".sortable-th").forEach((th) => {
    th.classList.remove("asc", "desc");
    if (th.getAttribute("onclick") === `sortInventory('${col}')`) th.classList.add(window._invSortDir);
  });
  renderInventoryTable();
}
window.sortInventory = sortInventory;
let _lastTelegramAlert = window._lastTelegramStockAlert || 0;
function _pedidosQueUsanMP(mpId) {
  const estadosActivos = ["confirmado", "pago", "produccion", "envio", "salida", "retirar", "pendiente"];
  return (window.pedidos || []).filter((ped) => {
    if (!estadosActivos.includes(ped.status || "")) return false;
    return (ped.productosInventario || []).some((item) => {
      const prod = (window.products || []).find((p) => String(p.id) === String(item.id));
      if (!prod) return false;
      return (prod.mpComponentes || []).some((c) => String(c.id) === String(mpId));
    });
  });
}
window._pedidosQueUsanMP = _pedidosQueUsanMP;
function checkStockAlerts() {
  const todos = window.products || [];
  const agotados = todos.filter((p) => getStockEfectivo(p) === 0);
  const bajos = todos.filter((p) => {
    const s = getStockEfectivo(p);
    return s > 0 && s <= (p.puntoReorden ?? p.stockMin ?? 5);
  });
  const mpBajas = bajos.filter((p) => p.tipo === "materia_prima");
  const mpAgotadas = agotados.filter((p) => p.tipo === "materia_prima");
  const mpCriticas = [...mpAgotadas, ...mpBajas];
  mpCriticas.forEach((mp) => {
    const pedAfectados = _pedidosQueUsanMP(mp.id);
    if (pedAfectados.length > 0) {
      const folios = pedAfectados.map((p) => p.folio || p.id).slice(0, 5).join(", ");
      manekiToastExport(`\u{1F6A8} URGENTE: "${mp.name}" con stock cr\xEDtico \u2014 afecta pedidos: ${folios}`, "err");
    }
  });
  if (agotados.length) manekiToastExport(`\u{1F534} ${agotados.length} producto(s) agotado(s)`, "warn");
  if (bajos.length) manekiToastExport(`\u26A0\uFE0F ${bajos.length} producto(s) con stock bajo`, "warn");
  if (mpAgotadas.length) manekiToastExport(`\u{1F3ED} ${mpAgotadas.length} materia(s) prima(s) AGOTADAS \u2014 producci\xF3n bloqueada`, "err");
  else if (mpBajas.length) manekiToastExport(`\u{1F3ED} ${mpBajas.length} materia(s) prima(s) con stock bajo`, "warn");
  const mpBadge = document.getElementById("sidebarBadgeMP");
  if (mpBadge) {
    const total = mpBajas.length + mpAgotadas.length;
    if (total > 0) {
      mpBadge.textContent = total;
      mpBadge.style.display = "inline-block";
    } else mpBadge.style.display = "none";
  }
  const hayProblemas = agotados.length > 0 || bajos.length > 0;
  if (hayProblemas) _notificarStockTelegram({ agotados, bajos, mpAgotadas, mpBajas });
  if (mpAgotadas.length || mpBajas.length) _alertaStockWA(mpAgotadas, mpBajas);
}
window.checkStockAlerts = checkStockAlerts;
async function _notificarStockTelegram({ agotados, bajos, mpAgotadas, mpBajas }) {
  const now = Date.now();
  if (now - _lastTelegramAlert < 60 * 60 * 1e3) return;
  window._lastTelegramStockAlert = now;
  _lastTelegramAlert = now;
  const cfg = window.storeConfig || {};
  const BOT_TOKEN = cfg.telegramBotToken;
  if (!BOT_TOKEN) {
    console.warn("Telegram: telegramBotToken no configurado, omitiendo notificaci\xF3n de stock.");
    return;
  }
  const chatIds = [cfg.telegramChatId1, cfg.telegramChatId2].filter(Boolean);
  if (!chatIds.length) return;
  const lineas = [];
  if (agotados.length) {
    lineas.push(`\u{1F534} *Agotados (${agotados.length}):*`);
    agotados.slice(0, 10).forEach((p) => lineas.push(`  \u2022 ${p.name} \u2014 stock: 0`));
  }
  if (bajos.length) {
    lineas.push(`\u26A0\uFE0F *Stock bajo (${bajos.length}):*`);
    bajos.slice(0, 10).forEach((p) => lineas.push(`  \u2022 ${p.name} \u2014 stock: ${p.stock} (m\xEDn: ${p.stockMin || 5})`));
  }
  if (mpAgotadas.length) lineas.push(`\u{1F3ED} *MP AGOTADAS \u2014 producci\xF3n bloqueada:* ${mpAgotadas.map((p) => p.name).join(", ")}`);
  const msg = `\u{1F4E6} *Alerta de inventario \u2014 Maneki Store*

${lineas.join("\n")}`;
  for (const chatId of chatIds) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" })
      });
    } catch (e) {
      console.warn("Telegram stock alert error:", e);
    }
  }
}
window._notificarStockTelegram = _notificarStockTelegram;
function _alertaStockWA(agotadas, bajas) {
  const existente = document.getElementById("_mkStockWAAlert");
  if (existente) existente.remove();
  const partes = [];
  if (agotadas.length) partes.push(`\u{1F534} Agotadas: ${agotadas.map((p) => p.name).join(", ")}`);
  if (bajas.length) partes.push(`\u26A0\uFE0F Stock bajo: ${bajas.map((p) => p.name).join(", ")}`);
  const msgWA = encodeURIComponent(`\u{1F3ED} *Maneki \u2014 Alerta de Inventario*

${partes.join("\n")}

_Reabastece pronto para no detener producci\xF3n._`);
  const div = document.createElement("div");
  div.id = "_mkStockWAAlert";
  div.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;border:2px solid #25D366;border-radius:14px;padding:14px 18px;box-shadow:0 4px 24px rgba(0,0,0,0.15);max-width:300px;font-size:13px;line-height:1.4;";
  div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#1f2937;font-size:14px;">\u{1F3ED} MP cr\xEDtica</strong>
            <button onclick="document.getElementById('_mkStockWAAlert').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;line-height:1;">\xD7</button>
        </div>
        <div style="color:#6b7280;margin-bottom:10px;">${partes.map((p) => _esc(p)).join("<br>")}</div>
        <button onclick="window.open('https://api.whatsapp.com/send?text=${msgWA}','_blank')" style="width:100%;padding:8px 12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">
            \u{1F4F1} Avisar por WhatsApp
        </button>`;
  document.body.appendChild(div);
}
window._alertaStockWA = _alertaStockWA;
function exportarInventarioCSV() {
  const headers = ["SKU", "Nombre", "Categor\xEDa", "Tipo", "Costo", "Precio", "Stock", "Stock M\xEDn", "Margen%", "Producibles", "Proveedor", "Proveedor URL", "Estado", "Tags", "Variantes", "\xDAltima actualizaci\xF3n"];
  const rows = (window.products || []).map((p) => {
    const cat = ((window.categories || []).find((c) => c.id === p.category) || {}).name || p.category;
    const margen = p.cost && p.price ? ((p.price - p.cost) / p.price * 100).toFixed(0) + "%" : "";
    const _stExport = typeof getStockEfectivo === "function" ? getStockEfectivo(p) : p.stock || 0;
    const estado = _stExport === 0 ? "Agotado" : _stExport <= (p.stockMin || 5) ? "Bajo Stock" : "Disponible";
    const producibles = typeof calcularProducibles === "function" ? calcularProducibles(p) ?? "" : "";
    const updatedAt = p.updatedAt ? new Date(p.updatedAt).toLocaleString("es-MX") : "";
    return [
      p.sku,
      p.name,
      cat,
      p.tipo || "producto",
      p.cost || 0,
      p.price || 0,
      _stExport,
      p.stockMin || 5,
      margen,
      producibles,
      p.proveedor || "",
      p.proveedorUrl || "",
      estado,
      (p.tags || []).join("; "),
      (p.variants || []).map((v) => `${v.type}:${v.value}(${v.qty ?? 0})`).join("; "),
      updatedAt
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventario_${typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  manekiToastExport("\u{1F4E5} Inventario exportado como CSV", "ok");
}
window.exportarInventarioCSV = exportarInventarioCSV;
function editarStockInline(id) {
  const p = (window.products || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  const cell = document.getElementById(`stock-cell-${id}`);
  if (!cell) return;
  cell.innerHTML = `
        <div style="display:flex;align-items:center;gap:4px;">
            <input id="inline-stock-${id}" type="number" min="0" value="${typeof getStockEfectivo === "function" ? getStockEfectivo(p) : p.stock || 0}"
                style="width:60px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;"
                onkeydown="if(event.key==='Enter')confirmarStockInline('${id}');if(event.key==='Escape')renderInventoryTable();">
            <button onclick="confirmarStockInline('${id}')"
                style="width:24px;height:24px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">\u2713</button>
            <button onclick="renderInventoryTable()"
                style="width:24px;height:24px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;cursor:pointer;font-size:12px;">\u2715</button>
        </div>`;
  const inp = document.getElementById(`inline-stock-${id}`);
  if (inp) inp.focus();
}
window.editarStockInline = editarStockInline;
function confirmarStockInline(id) {
  const p = (window.products || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  const inp = document.getElementById(`inline-stock-${id}`);
  if (!inp) return;
  const nuevo = parseInt(inp.value);
  if (isNaN(nuevo) || nuevo < 0) {
    manekiToastExport("Stock inv\xE1lido", "err");
    return;
  }
  const antes = typeof getStockEfectivo === "function" ? getStockEfectivo(p) : p.stock || 0;
  p.stock = nuevo;
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const diff = nuevo - antes;
    if (diff !== 0 && p.variants[0]) p.variants[0].qty = Math.max(0, (parseInt(p.variants[0].qty) || 0) + diff);
    if (typeof syncStockFromVariants === "function") syncStockFromVariants(p);
  }
  registrarMovimiento({
    productoId: p.id,
    productoNombre: p.name,
    tipo: "ajuste",
    cantidad: nuevo - antes,
    motivo: "Edici\xF3n inline",
    stockAntes: antes,
    stockDespues: nuevo
  });
  saveProducts();
  renderInventoryTable();
  if (typeof updateDashboard === "function") updateDashboard();
  manekiToastExport(`\u2705 Stock de "${p.name}" \u2192 ${nuevo}`, "ok");
}
window.confirmarStockInline = confirmarStockInline;
function poblarFiltroProveedores() {
  const sel = document.getElementById("inventoryProveedorFilter");
  if (!sel) return;
  const current = sel.value;
  const proveedores = [...new Set(
    (window.products || []).map((p) => (p.proveedor || "").trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es"));
  sel.innerHTML = '<option value="">\u{1F3EA} Todos los proveedores</option>' + proveedores.map((pr) => `<option value="${_esc(pr)}"${current === pr ? "selected" : ""}>${_esc(pr)}</option>`).join("");
}
window.poblarFiltroProveedores = poblarFiltroProveedores;
function invInlineEditStock(id, td) {
  const product = (window.products || []).find((p) => String(p.id) === String(id));
  if (!product) return;
  const prev = parseFloat(product.stock) || 0;
  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.step = "0.01";
  input.value = prev;
  input.style.cssText = "width:60px;padding:2px 6px;border:1.5px solid #7c3aed;border-radius:6px;font-size:.85rem;text-align:center;";
  const commit = async () => {
    const nv = parseFloat(input.value);
    if (!isNaN(nv) && nv !== prev) {
      const antes = prev;
      product.stock = nv;
      registrarMovimiento({
        productoId: product.id,
        productoNombre: product.name,
        tipo: "ajuste",
        cantidad: nv - antes,
        motivo: "Edici\xF3n inline",
        stockAntes: antes,
        stockDespues: nv
      });
      saveProducts();
      manekiToastExport(`Stock actualizado: ${product.name} \u2192 ${nv}`, "ok");
    }
    renderInventoryTable();
  };
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.value = prev;
      input.blur();
    }
  });
  td.innerHTML = "";
  td.appendChild(input);
  input.focus();
  input.select();
}
window.invInlineEditStock = invInlineEditStock;
async function registrarMerma(id) {
  const p = (window.products || []).find((x) => String(x.id) === String(id));
  if (!p) {
    manekiToastExport("Producto no encontrado", "err");
    return;
  }
  const cantStr = prompt(`\xBFCu\xE1ntas ${p.unidad || "pza"} de "${p.name}" se perdieron o da\xF1aron?`, "1");
  if (cantStr === null) return;
  const cant = parseInt(cantStr);
  if (!cant || cant <= 0) {
    manekiToastExport("\u26A0\uFE0F Cantidad inv\xE1lida", "warn");
    return;
  }
  const motivo = prompt("\xBFMotivo de la merma?", "Material da\xF1ado");
  if (motivo === null) return;
  const stAntes = getStockEfectivo(p);
  const stDespues = Math.max(0, stAntes - cant);
  p.stock = stDespues;
  if (Array.isArray(p.variants) && p.variants.length) {
    let restante = cant;
    for (const v of p.variants) {
      if (restante <= 0) break;
      const q = parseInt(v.qty) || 0;
      const rem = Math.min(q, restante);
      v.qty = q - rem;
      restante -= rem;
    }
    if (typeof syncStockFromVariants === "function") syncStockFromVariants(p);
  }
  registrarMovimiento({
    productoId: p.id,
    productoNombre: p.name,
    tipo: "merma",
    cantidad: -cant,
    motivo: motivo || "Sin especificar",
    stockAntes: stAntes,
    stockDespues: stDespues
  });
  saveProducts();
  renderInventoryTable();
  if (typeof updateDashboard === "function") updateDashboard();
  manekiToastExport(`\u{1F4C9} Merma: -${cant} ${p.unidad || "pza"} de "${p.name}"`, "warn");
}
window.registrarMerma = registrarMerma;
function addVariant() {
  const typeEl = document.getElementById("variantType");
  const valueEl = document.getElementById("variantValue");
  const type = typeEl ? typeEl.value.trim() : "";
  const value = valueEl ? valueEl.value.trim() : "";
  if (!type || !value) {
    if (typeof manekiToastExport === "function")
      manekiToastExport("Por favor completa tipo y valor de la variante", "warn");
    return;
  }
  const existe = (window.currentVariants || []).some((v) => v.type === type && v.value === value);
  if (existe) {
    if (typeof manekiToastExport === "function")
      manekiToastExport(`\u26A0\uFE0F La variante ${type}: ${value} ya existe`, "warn");
    return;
  }
  window.currentVariants.push({ type, value, qty: 0 });
  renderVariantsList();
  if (typeEl) typeEl.value = "";
  if (valueEl) valueEl.value = "";
  if (typeEl) typeEl.focus();
}
window.addVariant = addVariant;
function updateVariantQty(index, val) {
  const n = parseInt(val);
  if (!isNaN(n) && n >= 0) {
    window.currentVariants[index].qty = n;
  }
}
window.updateVariantQty = updateVariantQty;
function renderVariantsList() {
  const container = document.getElementById("variantsList");
  if (!container) return;
  if (!window.currentVariants || window.currentVariants.length === 0) {
    container.innerHTML = '<span class="text-xs text-gray-400 italic">Sin variantes agregadas</span>';
    return;
  }
  container.innerHTML = window.currentVariants.map((v, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:6px;">
            <div style="flex:1;min-width:0;">
                <span style="font-size:12px;color:#374151;">${_esc(v.type)}: ${_mkColorDot(v.type, _esc(v.value))}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <label style="font-size:11px;color:#6b7280;font-weight:600;white-space:nowrap;">Piezas:</label>
                <div style="display:flex;align-items:center;gap:2px;">
                    <button type="button" onclick="(function(){var n=parseInt(document.getElementById('vqty-${i}').value)||0;if(n>0){document.getElementById('vqty-${i}').value=n-1;updateVariantQty(${i},n-1);}})()"
                        style="width:22px;height:22px;border:1px solid #d1d5db;border-radius:5px;background:#fff;cursor:pointer;font-size:13px;font-weight:bold;color:#6b7280;display:flex;align-items:center;justify-content:center;padding:0;">\u2212</button>
                    <input id="vqty-${i}" type="number" min="0" value="${v.qty ?? 0}"
                        oninput="updateVariantQty(${i}, this.value)"
                        style="width:54px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;font-weight:600;color:#4f46e5;">
                    <button type="button" onclick="(function(){var n=parseInt(document.getElementById('vqty-${i}').value)||0;document.getElementById('vqty-${i}').value=n+1;updateVariantQty(${i},n+1);})()"
                        style="width:22px;height:22px;border:1px solid #d1d5db;border-radius:5px;background:#fff;cursor:pointer;font-size:13px;font-weight:bold;color:#6b7280;display:flex;align-items:center;justify-content:center;padding:0;">+</button>
                </div>
                <span style="font-size:11px;color:#9ca3af;">pzs</span>
            </div>
            <button type="button" onclick="removeVariant(${i})"
                style="width:24px;height:24px;background:#fee2e2;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u2715</button>
        </div>`).join("");
}
window.renderVariantsList = renderVariantsList;
function removeVariant(index) {
  window.currentVariants.splice(index, 1);
  renderVariantsList();
}
window.removeVariant = removeVariant;
function descontarStockVariante(productoId, variantType, variantValue, cantidad) {
  const p = (window.products || []).find((x) => String(x.id) === String(productoId));
  if (!p || !p.variants) return;
  const v = p.variants.find((v2) => v2.type === variantType && v2.value === variantValue);
  if (v) v.qty = Math.max(0, (v.qty || 0) - cantidad);
  syncStockFromVariants(p);
  saveProducts();
}
window.descontarStockVariante = descontarStockVariante;
function generateSKU(categoryId) {
  const map = { tazas: "TAZ", llaveros: "LLV", libretas: "LIB", peluches: "PEL", otros: "OTR" };
  const prefix = map[categoryId] || "PRD";
  const nums = (window.products || []).filter((p) => p.category === categoryId && p.sku && p.sku.startsWith(`MNK-${prefix}-`)).map((p) => parseInt((p.sku || "").split("-").pop()) || 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `MNK-${prefix}-${String(next).padStart(3, "0")}`;
}
window.generateSKU = generateSKU;
function skuEsUnico(sku, excludeId) {
  const skuLow = sku.toLowerCase();
  return !(window.products || []).some((p) => {
    if (!p.sku || p.sku.toLowerCase() !== skuLow) return false;
    if (excludeId && String(p.id) === String(excludeId)) return false;
    if (excludeId) {
      const actual = (window.products || []).find((x) => String(x.id) === String(excludeId));
      if (actual && actual.sku && actual.sku.toLowerCase() === skuLow) return false;
    }
    return true;
  });
}
window._ptGaleriaUrls = window._ptGaleriaUrls ?? [];
window._ptGaleriaFiles = window._ptGaleriaFiles ?? [];
function ptRenderGaleria() {
  const cont = document.getElementById("ptGaleriaPreview");
  const vacia = document.getElementById("ptGaleriaVacia");
  if (!cont) return;
  const urls = window._ptGaleriaUrls || [];
  const files = window._ptGaleriaFiles || [];
  const total = urls.length + files.length;
  if (vacia) vacia.style.display = total ? "none" : "block";
  [...cont.children].forEach((el) => {
    if (el.id !== "ptGaleriaVacia") el.remove();
  });
  urls.forEach((url, i) => {
    const div = document.createElement("div");
    div.style = "position:relative;width:120px;height:120px;";
    div.innerHTML = `<img src="${url}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #e5e7eb;">
            <button type="button" onclick="ptEliminarFotoGaleria('url',${i})"
                style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.75rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;">\u2715</button>`;
    cont.appendChild(div);
  });
  files.forEach((file, i) => {
    const div = document.createElement("div");
    div.style = "position:relative;width:120px;height:120px;";
    div.dataset.fileIdx = i;
    const img = document.createElement("img");
    img.style = "width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #C5A572;opacity:.85;";
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = "\u2715";
    btn.style = "position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.7rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;";
    btn.onclick = () => ptEliminarFotoGaleria("file", i);
    div.appendChild(img);
    div.appendChild(btn);
    cont.appendChild(div);
  });
}
window.ptRenderGaleria = ptRenderGaleria;
function ptAgregarFotosGaleria(fileList) {
  if (!fileList || !fileList.length) return;
  const MAX = 20;
  const actual = (window._ptGaleriaUrls || []).length + (window._ptGaleriaFiles || []).length;
  const disponibles = MAX - actual;
  if (disponibles <= 0) {
    manekiToastExport(`Ya tienes ${MAX} fotos en la galer\xEDa`, "warn");
    return;
  }
  const archivos = Array.from(fileList).slice(0, disponibles);
  window._ptGaleriaFiles = [...window._ptGaleriaFiles || [], ...archivos];
  ptRenderGaleria();
  const input = document.getElementById("ptGaleriaInput");
  if (input) input.value = "";
}
window.ptAgregarFotosGaleria = ptAgregarFotosGaleria;
function ptEliminarFotoGaleria(tipo, idx) {
  if (tipo === "url") {
    (window._ptGaleriaUrls || []).splice(idx, 1);
  } else {
    (window._ptGaleriaFiles || []).splice(idx, 1);
  }
  ptRenderGaleria();
}
window.ptEliminarFotoGaleria = ptEliminarFotoGaleria;
function openAddProductModal() {
  injectPtModal();
  window.modoEdicion = false;
  window.edicionProductoId = null;
  window.currentVariants = [];
  window.currentProductImage = null;
  window.currentProductImageFile = null;
  window._ptMpComponentes = [];
  window._tagsActuales = [];
  window._ptGaleriaUrls = [];
  window._ptGaleriaFiles = [];
  const form = document.getElementById("ptForm");
  if (form) form.reset();
  const pre = document.getElementById("ptImagePreview");
  if (pre) pre.classList.add("hidden");
  renderPtMpList();
  renderVariantsListPt();
  recalcularCostoPt();
  ptRenderGaleria();
  if (typeof updateCategorySelects === "function") updateCategorySelects();
  const title = document.querySelector("#ptModal h3");
  if (title) title.textContent = "\u{1F4E6} Nuevo Producto Terminado";
  const btn = document.getElementById("ptSubmitBtn");
  if (btn) btn.textContent = "\u2705 Agregar Producto";
  if (typeof openModal === "function") openModal("ptModal");
}
window.openAddProductModal = openAddProductModal;
function closePtModal() {
  if (typeof closeModal === "function") closeModal("ptModal");
  const form = document.getElementById("ptForm");
  if (form) form.reset();
  window.modoEdicion = false;
  window.edicionProductoId = null;
  window.currentVariants = [];
  window.currentProductImage = null;
  window.currentProductImageFile = null;
  window._ptMpComponentes = [];
  window._tagsActuales = [];
  window._ptGaleriaUrls = [];
  window._ptGaleriaFiles = [];
}
window.closePtModal = closePtModal;
function closeAddProductModal() {
  closePtModal();
}
window.closeAddProductModal = closeAddProductModal;
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
window.parseCsvLine = parseCsvLine;
async function importarInventarioCSV(input) {
  const file = input.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    manekiToastExport("\u26A0\uFE0F CSV vac\xEDo o sin datos", "warn");
    return;
  }
  const firstLine = lines[0].replace(/^\uFEFF/, "");
  const headers = parseCsvLine(firstLine).map((h) => h.toLowerCase().trim());
  let importados = 0, errores = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || "").trim();
    });
    if (!row.nombre) {
      errores++;
      continue;
    }
    const tipo = (row.tipo || "pt").toLowerCase();
    const costo = parseFloat(row.costo) || 0;
    const precio = parseFloat(row.precio) || 0;
    const stock = parseFloat(row.stock) || 0;
    const stockMin = parseInt(row.stock_min) || 5;
    if ((window.products || []).find((p) => p.name.trim().toLowerCase() === row.nombre.toLowerCase())) {
      errores++;
      continue;
    }
    const sku = row.sku || "IMP-" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().split("-")[0].toUpperCase() : Math.random().toString(36).slice(2, 7).toUpperCase());
    const baseProduct = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name: row.nombre,
      sku,
      cost: costo,
      price: precio,
      stock,
      stockMin,
      proveedor: row.proveedor || "",
      notas: row.notas || "",
      image: tipo === "mp" || tipo === "materia_prima" ? "\u{1F3ED}" : tipo === "svc" || tipo === "servicio" ? "\u2699\uFE0F" : "\u{1F4E6}",
      tags: [],
      historialPrecios: [],
      historialCostos: [],
      variants: []
    };
    if (tipo === "mp" || tipo === "materia_prima") {
      baseProduct.tipo = "materia_prima";
    } else if (tipo === "svc" || tipo === "servicio") {
      baseProduct.tipo = "servicio";
      baseProduct.stock = 0;
    } else {
      baseProduct.tipo = precio > 0 ? "producto" : "producto_interno";
    }
    if (!window.products) window.products = [];
    window.products.push(baseProduct);
    importados++;
  }
  if (importados > 0) {
    saveProducts();
    renderInventoryTable();
    if (typeof updateDashboard === "function") updateDashboard();
    manekiToastExport(`\u2705 Importados ${importados} productos${errores > 0 ? ` (${errores} errores/duplicados omitidos)` : ""}`, "ok");
  } else {
    manekiToastExport(`\u26A0\uFE0F No se import\xF3 ning\xFAn producto. ${errores} errores/duplicados.`, "warn");
  }
  input.value = "";
}
window.importarInventarioCSV = importarInventarioCSV;
function descargarTemplateCSV() {
  const headers = "tipo,nombre,sku,categoria,costo,precio,stock,stock_min,proveedor,notas";
  const examples = [
    "pt,Taza personalizada,,Tazas,45.00,150.00,10,3,Proveedor ABC,Taza blanca 11oz",
    "mp,Vinil blanco mate,,Materiales,15.00,,50,10,Distribuidora XYZ,Hoja 60x30cm",
    "svc,Impresi\xF3n directa,,Servicios,8.00,,0,0,,Por hoja impresa"
  ].join("\n");
  const csv = headers + "\n" + examples;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_inventario_maneki.csv";
  a.click();
  URL.revokeObjectURL(url);
}
window.descargarTemplateCSV = descargarTemplateCSV;
function guardarSnapshotInventario() {
  if (!window.products || window.products.length === 0) {
    manekiToastExport("No hay productos para guardar snapshot", "warn");
    return;
  }
  if (!window.inventarioSnapshots) window.inventarioSnapshots = [];
  const fecha = _fechaHoy();
  const existeHoy = window.inventarioSnapshots.find((s) => s.fecha === fecha);
  if (existeHoy) {
    if (!confirm(`Ya hay un snapshot del ${fecha}. \xBFReemplazarlo?`)) return;
    const idx = window.inventarioSnapshots.indexOf(existeHoy);
    window.inventarioSnapshots.splice(idx, 1);
  }
  const snapshot = {
    fecha,
    hora: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    totalProductos: window.products.length,
    valorTotal: window.products.reduce((s, p) => s + (parseFloat(p.cost) || 0) * (parseFloat(p.stock) || 0), 0),
    items: window.products.map((p) => ({
      id: p.id,
      name: p.name,
      tipo: p.tipo || "pt",
      stock: p.stock || 0,
      cost: p.cost || 0,
      price: p.price || 0,
      sku: p.sku || ""
    }))
  };
  window.inventarioSnapshots.unshift(snapshot);
  window.inventarioSnapshots = window.inventarioSnapshots.slice(0, 30);
  if (typeof sbSave === "function") {
    sbSave("inventarioSnapshots", window.inventarioSnapshots);
  } else {
    try {
      localStorage.setItem("inventarioSnapshots", JSON.stringify(window.inventarioSnapshots));
    } catch (e) {
    }
  }
  manekiToastExport(`\u{1F4F8} Snapshot guardado: ${fecha} \u2014 ${snapshot.totalProductos} productos, $${snapshot.valorTotal.toFixed(2)} en inventario`, "ok");
}
window.guardarSnapshotInventario = guardarSnapshotInventario;
function verSnapshotsInventario() {
  const snaps = window.inventarioSnapshots || [];
  if (!snaps.length) {
    manekiToastExport("Sin snapshots guardados a\xFAn", "warn");
    return;
  }
  const listHtml = snaps.map((s) => `
    <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:700;color:#1a0533;">${s.fecha} <span style="color:#9ca3af;font-weight:400;font-size:.8rem;">${s.hora || ""}</span></div>
        <div style="font-size:.8rem;color:#6b7280;">${s.totalProductos} productos \xB7 $${Number(s.valorTotal || 0).toFixed(2)} en inventario</div>
      </div>
      <button onclick="exportarSnapshotCSV('${s.fecha}')" style="padding:4px 12px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:.75rem;cursor:pointer;">\u{1F4E5} CSV</button>
    </div>`).join("");
  let modal = document.getElementById("_snapshotModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "_snapshotModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;max-width:500px;width:100%;margin:auto;max-height:80vh;overflow-y:auto;padding:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">\u{1F4F8} Snapshots de Inventario</h3>
        <button onclick="closeModal('_snapshotModal')" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;">\xD7</button>
      </div>
      <p style="font-size:.8rem;color:#9ca3af;margin-bottom:12px;">Fotograf\xEDas del estado del inventario en fechas espec\xEDficas.</p>
      ${listHtml}
    </div>`;
  openModal("_snapshotModal");
}
window.verSnapshotsInventario = verSnapshotsInventario;
function exportarSnapshotCSV(fecha) {
  const snap = (window.inventarioSnapshots || []).find((s) => s.fecha === fecha);
  if (!snap) return;
  const headers = "nombre,tipo,sku,stock,costo,precio";
  const rows = snap.items.map((p) => [p.name, p.tipo, p.sku, p.stock, p.cost, p.price].map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(","));
  const csv = "\uFEFF" + headers + "\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `snapshot_inventario_${fecha}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
window.exportarSnapshotCSV = exportarSnapshotCSV;
function abrirBulkEditPrecios() {
  const prods = (window.products || []).filter((p) => p.tipo !== "materia_prima" && p.tipo !== "servicio" && Number(p.price || 0) > 0);
  if (prods.length === 0) {
    manekiToastExport("No hay productos con precio para editar", "warn");
    return;
  }
  let modal = document.getElementById("_bulkEditModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "_bulkEditModal";
    modal.style.cssText = "position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;";
    document.body.appendChild(modal);
  }
  const cats = [...new Set(prods.map((p) => p.category || p.categoria || "Sin categor\xEDa"))];
  modal.innerHTML = `
        <div style="background:#fff;border-radius:20px;max-width:520px;width:calc(100% - 32px);max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 25px 60px rgba(0,0,0,.25);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:1.1rem;font-weight:800;color:#1F2937;margin:0;">\u{1F4CA} Actualizaci\xF3n masiva de precios</h3>
                <button onclick="document.getElementById('_bulkEditModal').style.display='none'" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9CA3AF;">\xD7</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
                <div>
                    <label style="font-size:.75rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Aplicar a</label>
                    <select id="_bulkCatFilter" style="width:100%;padding:8px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.82rem;">
                        <option value="">Todos los productos</option>
                        ${cats.map((c) => `<option value="${_esc(c)}">${_esc(c)}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="font-size:.75rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Ajuste</label>
                    <div style="display:flex;gap:6px;">
                        <select id="_bulkTipo" style="padding:8px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.82rem;">
                            <option value="pct_up">\u25B2 % aumento</option>
                            <option value="pct_dn">\u25BC % descuento</option>
                            <option value="fixed">= Precio fijo</option>
                        </select>
                        <input type="number" id="_bulkValor" placeholder="10" min="0" step="0.01"
                            style="width:80px;padding:8px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.82rem;text-align:center;">
                    </div>
                </div>
            </div>
            <div id="_bulkPreview" style="max-height:260px;overflow-y:auto;border:1px solid #F3F4F6;border-radius:12px;margin-bottom:14px;">
                <div style="padding:12px;text-align:center;color:#9CA3AF;font-size:.8rem;">Configura el ajuste para ver la vista previa</div>
            </div>
            <div style="display:flex;gap:8px;">
                <button onclick="document.getElementById('_bulkEditModal').style.display='none'"
                    style="flex:1;padding:10px;border:1.5px solid #E5E7EB;border-radius:12px;background:#fff;font-size:.85rem;cursor:pointer;">Cancelar</button>
                <button id="_bulkApplyBtn" onclick="_aplicarBulkPrecios()"
                    style="flex:2;padding:10px;background:linear-gradient(135deg,#C5973B,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:.85rem;font-weight:700;cursor:pointer;">
                    \u2705 Aplicar cambios
                </button>
            </div>
        </div>`;
  modal.style.display = "flex";
  const update = () => _renderBulkPreview();
  modal.querySelector("#_bulkCatFilter")?.addEventListener("change", update);
  modal.querySelector("#_bulkTipo")?.addEventListener("change", update);
  modal.querySelector("#_bulkValor")?.addEventListener("input", update);
}
window.abrirBulkEditPrecios = abrirBulkEditPrecios;
function _calcBulkPrecio(precioActual, tipo, valor) {
  if (tipo === "pct_up") return precioActual * (1 + valor / 100);
  if (tipo === "pct_dn") return precioActual * (1 - valor / 100);
  if (tipo === "fixed") return valor;
  return precioActual;
}
function _getBulkProductos() {
  const catFilter = document.getElementById("_bulkCatFilter")?.value || "";
  return (window.products || []).filter((p) => {
    if (p.tipo === "materia_prima" || p.tipo === "servicio") return false;
    if (Number(p.price || 0) <= 0) return false;
    if (catFilter) {
      const cat = p.category || p.categoria || "Sin categor\xEDa";
      if (cat !== catFilter) return false;
    }
    return true;
  });
}
function _renderBulkPreview() {
  const container = document.getElementById("_bulkPreview");
  if (!container) return;
  const tipo = document.getElementById("_bulkTipo")?.value || "pct_up";
  const valor = parseFloat(document.getElementById("_bulkValor")?.value || "0");
  const prods = _getBulkProductos();
  if (!valor || valor <= 0) {
    container.innerHTML = `<div style="padding:12px;text-align:center;color:#9CA3AF;font-size:.8rem;">Ingresa un valor para ver la vista previa</div>`;
    return;
  }
  container.innerHTML = `
        <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#F9FAFB;">
                <th style="padding:8px 10px;text-align:left;font-size:.7rem;color:#6B7280;font-weight:700;">Producto</th>
                <th style="padding:8px 10px;text-align:right;font-size:.7rem;color:#6B7280;font-weight:700;">Precio actual</th>
                <th style="padding:8px 10px;text-align:right;font-size:.7rem;color:#6B7280;font-weight:700;">Nuevo precio</th>
            </tr></thead>
            <tbody>
                ${prods.slice(0, 30).map((p) => {
    const nuevo = _calcBulkPrecio(Number(p.price), tipo, valor);
    const diff = nuevo - Number(p.price);
    const color = diff > 0 ? "#16A34A" : diff < 0 ? "#DC2626" : "#6B7280";
    return `<tr style="border-bottom:1px solid #F3F4F6;">
                        <td style="padding:6px 10px;font-size:.78rem;color:#374151;">${_esc(p.name)}</td>
                        <td style="padding:6px 10px;font-size:.78rem;color:#6B7280;text-align:right;">$${Number(p.price).toFixed(2)}</td>
                        <td style="padding:6px 10px;font-size:.78rem;font-weight:700;color:${color};text-align:right;">$${nuevo.toFixed(2)}</td>
                    </tr>`;
  }).join("")}
                ${prods.length > 30 ? `<tr><td colspan="3" style="padding:6px 10px;font-size:.72rem;color:#9CA3AF;text-align:center;">... y ${prods.length - 30} m\xE1s</td></tr>` : ""}
            </tbody>
        </table>`;
}
window._renderBulkPreview = _renderBulkPreview;
async function _aplicarBulkPrecios() {
  const tipo = document.getElementById("_bulkTipo")?.value || "pct_up";
  const valor = parseFloat(document.getElementById("_bulkValor")?.value || "0");
  const prods = _getBulkProductos();
  if (!valor || valor <= 0 || prods.length === 0) {
    manekiToastExport("Configura un valor v\xE1lido", "warn");
    return;
  }
  const label = tipo === "pct_up" ? `+${valor}%` : tipo === "pct_dn" ? `-${valor}%` : `precio fijo $${valor}`;
  const ok = await (typeof showConfirm === "function" ? showConfirm(`\xBFAplicar ${label} a ${prods.length} producto(s)?`, "Confirmar cambio masivo") : Promise.resolve(confirm(`\xBFAplicar ${label} a ${prods.length} producto(s)?`)));
  if (!ok) return;
  prods.forEach((p) => {
    const nuevo = Math.max(0.01, _calcBulkPrecio(Number(p.price), tipo, valor));
    if (!p.historialPrecios) p.historialPrecios = [];
    p.historialPrecios.push({ precio: Number(p.price), fecha: typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0], motivo: `Bulk: ${label}` });
    p.price = parseFloat(nuevo.toFixed(2));
  });
  if (typeof saveProducts === "function") saveProducts();
  if (typeof renderInventoryTable === "function") renderInventoryTable();
  if (typeof window._rebuildProductMap === "function") window._rebuildProductMap();
  document.getElementById("_bulkEditModal").style.display = "none";
  manekiToastExport(`\u2705 ${label} aplicado a ${prods.length} producto(s)`, "ok");
}
window._aplicarBulkPrecios = _aplicarBulkPrecios;
function imprimirEtiquetasBatch(ids) {
  const prods = ids ? (window.products || []).filter((p) => ids.includes(String(p.id))) : (window.products || []).filter((p) => p.tipo !== "materia_prima" && p.tipo !== "servicio" && Number(p.price || 0) > 0);
  if (prods.length === 0) {
    manekiToastExport("No hay productos para imprimir etiquetas", "warn");
    return;
  }
  const etiquetasHTML = prods.map((p) => `
        <div style="width:63mm;height:38mm;border:1px solid #ddd;border-radius:6px;padding:5mm 4mm;
                    display:inline-flex;flex-direction:column;justify-content:space-between;
                    margin:2mm;page-break-inside:avoid;box-sizing:border-box;vertical-align:top;">
            <div>
                <div style="font-size:9pt;font-weight:800;color:#1a0533;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.2;">${_esc(p.name)}</div>
                ${p.sku ? `<div style="font-size:7pt;color:#9ca3af;margin-top:1mm;">SKU: ${_esc(p.sku)}</div>` : ""}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                <div style="font-size:16pt;font-weight:900;color:#C5A572;">$${Number(p.price).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
                <div style="font-size:7pt;color:#9ca3af;text-align:right;">${_esc(p.category || p.categoria || "")}</div>
            </div>
        </div>`).join("");
  const win = window.open("", "_blank");
  if (!win) {
    manekiToastExport("Activa ventanas emergentes para imprimir", "warn");
    return;
  }
  win.document.write(`<!DOCTYPE html><html><head>
        <title>Etiquetas \u2014 Maneki Store</title>
        <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Outfit', Arial, sans-serif; margin: 0; }
            .header { text-align:center; padding:4mm 0; color:#9ca3af; font-size:8pt; border-bottom:1px solid #eee; margin-bottom:4mm; }
            @media print { .no-print { display:none; } }
        </style>
    </head><body>
        <div class="header no-print">${prods.length} etiquetas \xB7 Maneki Store \xB7 <button onclick="window.print()" style="padding:4px 12px;background:#C5A572;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:8pt;">\u{1F5A8}\uFE0F Imprimir</button></div>
        ${etiquetasHTML}
    </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}
window.imprimirEtiquetasBatch = imprimirEtiquetasBatch;
window._ptMpComponentes = window._ptMpComponentes ?? [];
window._ptVariants = window._ptVariants ?? [];
window._ptTagsActuales = window._ptTagsActuales ?? [];
const TAGS_PT = ["Oferta", "Nuevo", "Destacado", "Favorito", "Agotado"];
//# sourceMappingURL=inventory-1.js.map
