function checkAlertasEntregas() {
  const estadosActivos = ["confirmado", "pago", "produccion", "envio", "salida", "retirar"];
  const _dias = (p) => typeof window.diasHastaEntrega === "function" ? window.diasHastaEntrega(p.entrega || p.fechaEntrega) : (() => {
    const [y, m, d] = (p.entrega || p.fechaEntrega || "").split("-").map(Number);
    const hoy = /* @__PURE__ */ new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - hoy) / 864e5);
  })();
  const pedidosAlerta = pedidos.filter((p) => {
    if (!estadosActivos.includes(p.status)) return false;
    const diff = _dias(p);
    return diff !== null && diff >= 0 && diff <= 2;
  }).map((p) => ({ ...p, diffDias: _dias(p) })).sort((a, b) => a.diffDias - b.diffDias);
  const banner = document.getElementById("alertaEntregas");
  const lista = document.getElementById("alertaEntregasLista");
  if (!banner || !lista) return;
  if (pedidosAlerta.length === 0) {
    banner.classList.remove("visible");
    return;
  }
  banner.classList.add("visible");
  if (typeof window._mkNotifSound === "function") window._mkNotifSound();
  document.getElementById("alertaSubtitulo").textContent = pedidosAlerta.length === 1 ? "1 pedido requiere tu atenci\xF3n" : `${pedidosAlerta.length} pedidos requieren tu atenci\xF3n`;
  lista.innerHTML = pedidosAlerta.map((p) => {
    let clase, etiqueta, icono;
    if (p.diffDias === 0) {
      clase = "hoy";
      etiqueta = "\xA1Hoy!";
      icono = "\u{1F534}";
    } else if (p.diffDias === 1) {
      clase = "manana";
      etiqueta = "Ma\xF1ana";
      icono = "\u{1F7E0}";
    } else {
      clase = "dos-dias";
      etiqueta = "En 2 d\xEDas";
      icono = "\u{1F7E1}";
    }
    const saldo = (typeof window.calcSaldoPendiente === "function" ? window.calcSaldoPendiente(p) : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0))).toFixed(2);
    return `
                    <div class="alerta-pedido-card ${clase}">
                        <span class="text-2xl">${icono}</span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-gray-800 text-sm">${_esc(p.folio || "")}</span>
                                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${p.diffDias === 0 ? "bg-red-100 text-red-700" : p.diffDias === 1 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}">${etiqueta}</span>
                            </div>
                            <p class="text-gray-700 text-sm font-medium truncate">${_esc(p.cliente)}</p>
                            <p class="text-gray-500 text-xs truncate">${_esc(p.concepto || "")}</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-sm font-bold text-gray-800">$${Number(p.total || 0).toFixed(2)}</p>
                            ${Number(saldo) > 0 ? `<p class="text-xs font-semibold" style="color:#ea580c;">\u{1F4B8} Pendiente: $${saldo}</p>` : '<p class="text-xs text-green-600 font-semibold">\u2705 Pagado</p>'}
                            <p class="text-xs text-gray-400">${_esc(p.entrega)}</p>
                        </div>
                    </div>`;
  }).join("");
}
function cerrarAlertaEntregas() {
  const banner = document.getElementById("alertaEntregas");
  if (banner) banner.classList.remove("visible");
}
function animarNumero(el, desde, hasta, duracion, prefijo, sufijo) {
  if (!el) return;
  if (el._animFrame) cancelAnimationFrame(el._animFrame);
  if (!duracion || desde === hasta) {
    el.textContent = prefijo + Number(hasta).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + sufijo;
    return;
  }
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duracion, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = desde + (hasta - desde) * eased;
    el.textContent = prefijo + Number(current).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + sufijo;
    if (progress < 1) {
      el._animFrame = requestAnimationFrame(step);
    } else {
      el._animFrame = null;
      el.textContent = prefijo + Number(hasta).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + sufijo;
    }
  }
  el._animFrame = requestAnimationFrame(step);
}
window.animarNumero = animarNumero;
let _updateDashboardTimer = null;
function updateDashboard() {
  if (_updateDashboardTimer) clearTimeout(_updateDashboardTimer);
  _updateDashboardTimer = setTimeout(() => {
    _updateDashboardTimer = null;
    _updateDashboardImpl();
  }, 150);
}
window.updateDashboard = updateDashboard;
window.diasHastaEntrega = function(fechaStr) {
  if (!fechaStr) return null;
  try {
    const [y, m, d] = fechaStr.split("-").map(Number);
    const hoy = /* @__PURE__ */ new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(y, m - 1, d);
    return Math.round((entrega - hoy) / 864e5);
  } catch (e) {
    return null;
  }
};
function _updateDashboardImpl() {
  if (typeof normalizarResta === "function") normalizarResta();
  const now = /* @__PURE__ */ new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? "\xA1Buenos d\xEDas!" : hour < 19 ? "\xA1Buenas tardes!" : "\xA1Buenas noches!";
  const greetingEmoji = hour < 12 ? "\u2600\uFE0F" : hour < 19 ? "\u{1F324}\uFE0F" : "\u{1F319}";
  const el = document.getElementById("dashGreeting");
  const ee = document.getElementById("dashGreetingEmoji");
  const sn = document.getElementById("dashStoreName");
  if (el) el.textContent = greeting;
  if (ee) ee.textContent = greetingEmoji;
  if (sn) sn.textContent = storeConfig ? storeConfig.name : "Maneki Store";
  const dateEl = document.getElementById("dashDate");
  const timeEl = document.getElementById("dashTime");
  if (dateEl) dateEl.textContent = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  if (timeEl) timeEl.textContent = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  if (window._dashClock) {
    clearInterval(window._dashClock);
    window._dashClock = null;
  }
  window._dashClock = setInterval(() => {
    const t = document.getElementById("dashTime");
    if (t) {
      const n = /* @__PURE__ */ new Date();
      t.textContent = n.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
      const h = n.getHours();
      const g = document.getElementById("dashGreeting");
      const ge = document.getElementById("dashGreetingEmoji");
      if (g) g.textContent = h < 12 ? "\xA1Buenos d\xEDas!" : h < 19 ? "\xA1Buenas tardes!" : "\xA1Buenas noches!";
      if (ge) ge.textContent = h < 12 ? "\u2600\uFE0F" : h < 19 ? "\u{1F324}\uFE0F" : "\u{1F319}";
    }
  }, 6e4);
  const mesActualStr = today.substring(0, 7);
  const fechaPrevMes = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesAnteriorStr = `${fechaPrevMes.getFullYear()}-${String(fechaPrevMes.getMonth() + 1).padStart(2, "0")}`;
  let todaySales = 0, totalSales = 0, totalCosts = 0, monthlySales = 0, ventasMesActual = 0, ventasMesAnterior = 0;
  for (const s of salesHistory || []) {
    if (s.method === "Cancelado") continue;
    if (s.type === "pedido" || s.type === "abono" || s.type === "anticipo") continue;
    const t = s.total || 0;
    const c = (s.products || []).reduce((a, p) => a + (p.costoAlVender ?? p.cost ?? 0) * (p.quantity || 1), 0);
    if (s.date === today) todaySales += t;
    if (s.date && s.date.startsWith(mesActualStr)) {
      totalSales += t;
      totalCosts += c;
      monthlySales += t;
      ventasMesActual += t;
    }
    if (s.date && s.date.startsWith(mesAnteriorStr)) ventasMesAnterior += t;
  }
  for (const p of window.pedidosFinalizados || []) {
    if (!p.total) continue;
    const fecha = (p.fechaFinalizado || p.fecha || "").split("T")[0];
    if (!fecha) continue;
    const monto = Number(p.total);
    if (fecha === today) todaySales += monto;
    if (fecha.startsWith(mesActualStr)) {
      totalSales += monto;
      monthlySales += monto;
      ventasMesActual += monto;
    }
    if (fecha.startsWith(mesAnteriorStr)) ventasMesAnterior += monto;
  }
  const netProfit = totalSales - totalCosts;
  const goalInput = document.getElementById("dashMonthGoal");
  if (goalInput && !goalInput.dataset.mkLoaded && window.storeConfig?.metaMensual) {
    goalInput.value = window.storeConfig.metaMensual;
    goalInput.dataset.mkLoaded = "1";
  }
  const goal = parseFloat(goalInput?.value) || 5e3;
  const goalPct = Math.min(Math.round(monthlySales / goal * 100), 100);
  const goalBar = document.getElementById("dashGoalBar");
  const goalPctEl = document.getElementById("dashGoalPercent");
  const monthSalesEl = document.getElementById("dashMonthSales");
  if (goalBar) goalBar.style.width = goalPct + "%";
  if (goalPctEl) goalPctEl.textContent = goalPct + "% de tu meta mensual";
  if (monthSalesEl) monthSalesEl.textContent = "$" + monthlySales.toFixed(2);
  const _gse = typeof getStockEfectivo === "function" ? getStockEfectivo : ((p) => p.stock || 0);
  const lowStockItems = products.filter((p) => {
    const s = _gse(p);
    return s > 0 && s <= (p.stockMin || 5);
  });
  const outOfStock = products.filter((p) => _gse(p) === 0);
  const lowStockBadge = document.getElementById("lowStockBadge");
  if (lowStockBadge) lowStockBadge.textContent = lowStockItems.length + outOfStock.length + " items";
  const hace30 = /* @__PURE__ */ new Date();
  hace30.setDate(hace30.getDate() - 30);
  const hace30str = `${hace30.getFullYear()}-${String(hace30.getMonth() + 1).padStart(2, "0")}-${String(hace30.getDate()).padStart(2, "0")}`;
  const ventasRecientes = salesHistory.filter((s) => s.date >= hace30str && s.method !== "Cancelado");
  const ventasPorProductoId = {};
  const ventasPorProductoNombre = {};
  (ventasRecientes || []).forEach((s) => {
    (s.products || s.items || []).forEach((p) => {
      const k = String(p.id || "");
      const kn = (p.name || "").toLowerCase();
      if (k) ventasPorProductoId[k] = (ventasPorProductoId[k] || 0) + (p.quantity || 1);
      if (kn) ventasPorProductoNombre[kn] = (ventasPorProductoNombre[kn] || 0) + (p.quantity || 1);
    });
  });
  function diasRestantes(producto) {
    const k = String(producto.id || "");
    const kn = (producto.name || "").toLowerCase();
    const totalVendido = ventasPorProductoId[k] || 0 || (ventasPorProductoNombre[kn] || 0);
    const promDiario = totalVendido / 30;
    if (!promDiario) return null;
    const _gse2 = typeof getStockEfectivo === "function" ? getStockEfectivo : ((p) => p.stock || 0);
    return Math.floor(_gse2(producto) / promDiario);
  }
  const lowStockList = document.getElementById("dashLowStockList");
  if (lowStockList) {
    const all = [...outOfStock.map((p) => ({ ...p, out: true })), ...lowStockItems];
    if (all.length === 0) {
      lowStockList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Todo en orden \u{1F44D}</p>';
    } else {
      lowStockList.innerHTML = all.slice(0, 8).map((p) => {
        const dias = p.out ? null : diasRestantes(p);
        let predBadge = "";
        if (p.out) {
          predBadge = `<span class="pred-badge pred-critico">Agotado</span>`;
        } else if (dias !== null) {
          if (dias <= 2) predBadge = `<span class="pred-badge pred-critico">~${dias}d \u26A0\uFE0F</span>`;
          else if (dias <= 5) predBadge = `<span class="pred-badge pred-urgente">~${dias}d</span>`;
          else if (dias <= 14) predBadge = `<span class="pred-badge pred-pronto">~${dias}d</span>`;
          else predBadge = `<span class="pred-badge pred-ok">~${dias}d</span>`;
        } else {
          predBadge = `<span class="pred-badge" style="background:#f3f4f6;color:#9ca3af;">${p.stock} uds</span>`;
        }
        return `
                <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <span class="text-base flex-shrink-0">${p.image || "\u{1F4E6}"}</span>
                        <span class="text-xs text-gray-700 truncate">${_esc(p.name)}</span>
                    </div>
                    <div class="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        ${!p.out ? `<span class="text-xs text-gray-400">${p.stock}u</span>` : ""}
                        ${predBadge}
                    </div>
                </div>`;
      }).join("");
    }
  }
  const _calcSaldo = typeof window.calcSaldoPendiente === "function" ? window.calcSaldoPendiente : (p) => {
    const sumPagos = (p.pagos || []).reduce((s, ab) => s + Number(ab.monto || 0), 0);
    const totalPagado = sumPagos > 0 ? sumPagos : Number(p.anticipo || 0);
    return Math.max(0, Number(p.total || 0) - totalPagado);
  };
  const accountsReceivable = [
    ...receivables.filter((r) => r.status === "pending").map((r) => r.amount || 0),
    ...pedidos.filter((p) => !["finalizado", "cancelado", "entregado"].includes((p.status || "").toLowerCase())).map((p) => _calcSaldo(p)).filter((v) => v > 0)
  ].reduce((s, v) => s + v, 0);
  const activePedidos = pedidos.filter(
    (p) => !["finalizado", "cancelado"].includes((p.status || "").toLowerCase())
  ).length;
  const upcoming = pedidos.filter((p) => {
    const fecha = p.entrega || p.fechaEntrega;
    if (!fecha) return false;
    const dias = window.diasHastaEntrega(fecha);
    return dias !== null && dias >= 0 && dias <= 7 && !["entregado", "cancelado"].includes((p.status || p.estado || "").toLowerCase());
  }).sort((a, b) => {
    return window.diasHastaEntrega(a.entrega || a.fechaEntrega) - window.diasHastaEntrega(b.entrega || b.fechaEntrega);
  });
  const upcomingEl = document.getElementById("dashUpcomingDeliveries");
  if (upcomingEl) {
    if (upcoming.length === 0) {
      upcomingEl.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Sin entregas pr\xF3ximas \u{1F389}</p>';
    } else {
      upcomingEl.innerHTML = upcoming.map((p) => {
        const daysLeft = window.diasHastaEntrega(p.entrega || p.fechaEntrega);
        const urgency = daysLeft <= 1 ? "text-red-500" : daysLeft <= 3 ? "text-orange-500" : "text-green-600";
        return `
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 px-2 rounded-lg"
                         onclick="showSection('pedidos')">
                        <div>
                            <p class="text-xs font-semibold text-gray-800">${_esc(p.cliente || "\u2014")}</p>
                            <p class="text-xs text-gray-400">${_esc(p.concepto || "")} \xB7 ${_esc(p.folio || "")}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold ${urgency}">${daysLeft === 0 ? "\xA1Hoy!" : daysLeft === 1 ? "Ma\xF1ana" : "En " + daysLeft + " d\xEDas"}</p>
                            <p class="text-xs text-gray-400">${_esc(p.entrega || p.fechaEntrega)}</p>
                        </div>
                    </div>
                `;
      }).join("");
    }
  }
  const ds = document.getElementById("dailySales");
  const np = document.getElementById("netProfit");
  const ar = document.getElementById("accountsReceivable");
  const ap = document.getElementById("dashActivePedidos");
  if (ds) animarNumero(ds, 0, todaySales, 700, "$", "");
  if (np) {
    animarNumero(np, 0, netProfit, 700, "$", "");
    np.style.color = netProfit < 0 ? "#dc2626" : "";
    const npLabel = np.closest('.kpi-card, [class*="card"], .rounded-xl')?.querySelector(".kpi-label, .text-xs, .text-gray-500, small");
    if (npLabel && /ganancia/i.test(npLabel.textContent)) {
      npLabel.textContent = "Ganancia Neta";
      let npSub = npLabel.nextElementSibling;
      if (!npSub || npSub.id === "netProfit") {
        npSub = document.createElement("span");
        npSub.style.cssText = "font-size:.65rem;color:#9ca3af;display:block;margin-top:1px;";
        npLabel.insertAdjacentElement("afterend", npSub);
      }
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      npSub.textContent = meses[now.getMonth()] + " " + now.getFullYear();
    }
  }
  if (ar) animarNumero(ar, 0, accountsReceivable, 700, "$", "");
  if (ap) ap.textContent = activePedidos;
  try {
    renderSparkline();
  } catch (e) {
  }
  try {
    renderComparativaSemanal();
  } catch (e) {
  }
  try {
    renderCashFlowChart();
  } catch (e) {
  }
  try {
    checkGastosInusuales();
  } catch (e) {
  }
  try {
    renderWidgetClima();
  } catch (e) {
  }
  const arCard = ar ? ar.closest("[onclick]") || ar.parentElement : null;
  if (arCard && !arCard._meDeben_handler) {
    arCard._meDeben_handler = true;
    arCard.style.cursor = "pointer";
    arCard.addEventListener("click", function() {
      const pedidosArr = window.pedidos || pedidos || [];
      const _calcS = typeof window.calcSaldoPendiente === "function" ? window.calcSaldoPendiente : (p) => Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
      const mapa = {};
      pedidosArr.filter((p) => !["finalizado", "cancelado", "entregado"].includes((p.status || "").toLowerCase())).forEach((p) => {
        const saldo = _calcS(p);
        if (saldo <= 0) return;
        const nombre = p.cliente || "Sin nombre";
        mapa[nombre] = (mapa[nombre] || 0) + saldo;
      });
      const entradas = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
      if (entradas.length === 0) {
        manekiToastExport("No hay saldos pendientes por cobrar", "ok");
        return;
      }
      const total = entradas.reduce((s, [, v]) => s + v, 0);
      const _isDark = document.body.classList.contains("dark");
      const _rowTextColor = _isDark ? "#e5e7eb" : "#374151";
      const _rowBorderColor = _isDark ? "#334155" : "#f3f4f6";
      const filas = entradas.map(
        ([nombre, monto]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid ${_rowBorderColor};">
                    <span style="font-size:.85rem;color:${_rowTextColor};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(nombre)}</span>
                    <span style="font-size:.85rem;font-weight:700;color:#dc2626;margin-left:12px;white-space:nowrap;">$${monto.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>`
      ).join("");
      let _mdc = document.getElementById("_meDeben_modal");
      if (_mdc) {
        _mdc.remove();
        _mdc = null;
      }
      if (!_mdc) {
        const isDark = document.body.classList.contains("dark");
        const bgColor = isDark ? "#1e293b" : "#fff";
        const textColor = isDark ? "#e5e7eb" : "#1f2937";
        const borderColor = isDark ? "#334155" : "#e5e7eb";
        _mdc = document.createElement("div");
        _mdc.id = "_meDeben_modal";
        _mdc.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);";
        _mdc.innerHTML = `<div style="background:${bgColor};border-radius:16px;padding:24px;width:min(420px,90vw);max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 style="font-size:1rem;font-weight:800;color:${textColor};margin:0;">\u{1F4CB} Me deben \u2014 desglose</h3>
                        <button id="_meDeben_close" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9ca3af;line-height:1;">\xD7</button>
                    </div>
                    <div id="_meDeben_body" style="overflow-y:auto;flex:1;"></div>
                    <div id="_meDeben_total" style="margin-top:14px;padding-top:10px;border-top:2px solid ${borderColor};display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:.85rem;font-weight:600;color:#6b7280;">Total</span>
                        <span id="_meDeben_totalVal" style="font-size:1.1rem;font-weight:900;color:#dc2626;"></span>
                    </div>
                </div>`;
        document.body.appendChild(_mdc);
        document.getElementById("_meDeben_close").addEventListener("click", () => {
          _mdc.style.display = "none";
        });
        _mdc.addEventListener("click", (e) => {
          if (e.target === _mdc) _mdc.style.display = "none";
        });
      }
      document.getElementById("_meDeben_body").innerHTML = filas;
      document.getElementById("_meDeben_totalVal").textContent = "$" + total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      _mdc.style.display = "flex";
    });
  }
  const estadosLabel = {
    confirmado: "Confirmado",
    pago: "Pago parcial",
    produccion: "En producci\xF3n",
    envio: "En env\xEDo",
    salida: "Listo / Salida",
    retirar: "Por retirar",
    finalizado: "Finalizado",
    cancelado: "Cancelado"
  };
  const estadosColor = {
    confirmado: "#3b82f6",
    pago: "#f59e0b",
    produccion: "#8b5cf6",
    envio: "#06b6d4",
    salida: "#10b981",
    retirar: "#f97316",
    finalizado: "#6b7280",
    cancelado: "#ef4444"
  };
  const conteoEstados = {};
  pedidos.forEach((p) => {
    const s = (p.status || "confirmado").toLowerCase();
    conteoEstados[s] = (conteoEstados[s] || 0) + 1;
  });
  const pedidosEstadoEl = document.getElementById("dashPedidosEstado");
  if (pedidosEstadoEl) {
    const conDatos = Object.keys(estadosLabel).filter((s) => conteoEstados[s] > 0);
    if (conDatos.length === 0) {
      pedidosEstadoEl.innerHTML = '<p style="color:#9ca3af;font-size:.75rem;text-align:center;padding:16px 0;">Sin pedidos registrados</p>';
    } else {
      pedidosEstadoEl.innerHTML = conDatos.map((s) => `
                <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.04);">
                    <span style="width:8px;height:8px;border-radius:50%;background:${estadosColor[s]};flex-shrink:0;"></span>
                    <span style="font-size:.74rem;color:#374151;flex:1;">${estadosLabel[s]}</span>
                    <span style="font-size:.82rem;font-weight:800;color:${estadosColor[s]};">${conteoEstados[s]}</span>
                </div>`).join("");
    }
  }
  const mesVsAnteriorEl = document.getElementById("dashMesVsAnterior");
  if (mesVsAnteriorEl) {
    const diffPct = ventasMesAnterior > 0 ? Math.round((ventasMesActual - ventasMesAnterior) / ventasMesAnterior * 100) : null;
    const trend = diffPct === null ? "" : diffPct >= 0 ? `<span style="color:#16a34a;font-weight:800;font-size:.74rem;">&#9650; ${diffPct}%</span>` : `<span style="color:#dc2626;font-weight:800;font-size:.74rem;">&#9660; ${Math.abs(diffPct)}%</span>`;
    const barPct = ventasMesAnterior > 0 ? Math.min(100, Math.round(ventasMesActual / ventasMesAnterior * 100)) : 0;
    const mesActualNombre = now.toLocaleDateString("es-MX", { month: "long" });
    const mesAnteriorNombre = fechaPrevMes.toLocaleDateString("es-MX", { month: "long" });
    mesVsAnteriorEl.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
                <span style="font-size:.72rem;color:#6b7280;text-transform:capitalize;">${mesActualNombre}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:1rem;font-weight:900;color:#1e40af;">$${ventasMesActual.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</span>
                    ${trend}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="font-size:.72rem;color:#9ca3af;text-transform:capitalize;">${mesAnteriorNombre}</span>
                <span style="font-size:.82rem;font-weight:600;color:#9ca3af;">$${ventasMesAnterior.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</span>
            </div>
            ${ventasMesAnterior > 0 ? `
            <div style="background:#dbeafe;border-radius:99px;height:6px;overflow:hidden;">
                <div style="background:#3b82f6;height:100%;border-radius:99px;width:${barPct}%;transition:width .6s ease;"></div>
            </div>
            <p style="font-size:.65rem;color:#93c5fd;margin-top:4px;text-align:right;">${barPct}% del mes anterior</p>
            ` : '<p style="font-size:.7rem;color:#93c5fd;text-align:center;padding-top:8px;">Sin historial del mes anterior</p>'}`;
  }
  const materialConteo = {};
  [...pedidosFinalizados || [], ...pedidos.filter((p) => (p.status || "").toLowerCase() === "finalizado")].forEach((p) => {
    (p.productosInventario || []).forEach((item) => {
      const nombre = item.nombre || item.name || "";
      if (!nombre) return;
      materialConteo[nombre] = (materialConteo[nombre] || 0) + (item.cantidad || item.quantity || 1);
    });
  });
  const topMateriales = Object.entries(materialConteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const materialTopEl = document.getElementById("dashMaterialTop");
  if (materialTopEl) {
    if (topMateriales.length === 0) {
      materialTopEl.innerHTML = '<p style="color:#9ca3af;font-size:.75rem;text-align:center;padding:16px 0;">Sin datos de pedidos finalizados</p>';
    } else {
      const maxVal = topMateriales[0][1];
      const colores = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
      materialTopEl.innerHTML = topMateriales.map(([nombre, cnt], i) => {
        const pct = Math.round(cnt / maxVal * 100);
        return `
                <div style="margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                        <span style="font-size:.72rem;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:78%;">${nombre}</span>
                        <span style="font-size:.72rem;font-weight:800;color:#7e22ce;">${cnt}x</span>
                    </div>
                    <div style="background:#f3e8ff;border-radius:99px;height:5px;overflow:hidden;">
                        <div style="background:${colores[i]};height:100%;border-radius:99px;width:${pct}%;transition:width .6s ease;"></div>
                    </div>
                </div>`;
      }).join("");
    }
  }
  _renderAtencionHoy();
  _renderDiaMasRentable();
  checkAlertasEntregas();
  checkPedidosSinMovimiento();
  actualizarSidebarBadges();
  if (typeof actualizarBadgePOS === "function") actualizarBadgePOS();
  renderSyncIndicator();
  renderResumenDia();
  renderAccesosRapidos();
}
function _renderDiaMasRentable() {
  const el = document.getElementById("diaMasRentableWidget");
  if (!el) return;
  const dias = ["Domingo", "Lunes", "Martes", "Mi\xE9rcoles", "Jueves", "Viernes", "S\xE1bado"];
  const totales = [0, 0, 0, 0, 0, 0, 0];
  const fechasVistas = [/* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()];
  const fuentes = [
    ...(window.salesHistory || []).filter((s) => s.date && s.method !== "Cancelado" && s.type !== "anticipo" && s.type !== "abono"),
    ...(window.pedidosFinalizados || []).map((p) => ({ date: (p.fechaFinalizado || p.fecha || "").split("T")[0], total: p.total }))
  ];
  fuentes.forEach((s) => {
    if (!s.date) return;
    const d = /* @__PURE__ */ new Date(s.date + "T12:00:00");
    if (isNaN(d)) return;
    const dia = d.getDay();
    totales[dia] += Number(s.total || 0);
    fechasVistas[dia].add(s.date);
  });
  const promedios = totales.map((t, i) => fechasVistas[i].size > 0 ? t / fechasVistas[i].size : 0);
  const maxVal = Math.max(...promedios, 1);
  const maxDia = promedios.indexOf(maxVal);
  el.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;">
        ${dias.map((nombre, i) => {
    const pct = Math.round(promedios[i] / maxVal * 100);
    const esMejor = i === maxDia;
    return `<div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:.72rem;width:62px;color:${esMejor ? "#065f46" : "#6b7280"};font-weight:${esMejor ? "700" : "400"}">${nombre}</span>
                <div style="flex:1;height:8px;background:#f3f4f6;border-radius:99px;overflow:hidden;">
                    <div style="height:100%;border-radius:99px;width:${pct}%;background:${esMejor ? "#10b981" : "#a7f3d0"};transition:width .5s ease;"></div>
                </div>
                <span style="font-size:.68rem;width:52px;text-align:right;color:${esMejor ? "#065f46" : "#9ca3af"};font-weight:${esMejor ? "700" : "400"}">$${promedios[i].toLocaleString("es-MX", { maximumFractionDigits: 0 })}</span>
                ${esMejor ? '<span style="font-size:.65rem;">\u{1F3C6}</span>' : ""}
            </div>`;
  }).join("")}
        </div>`;
}
function _renderAtencionHoy() {
  const el = document.getElementById("atencionHoyList");
  if (!el) return;
  const hoy = window._fechaHoy ? window._fechaHoy() : (() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const items = [];
  const porCobrar = (window.pedidos || []).filter(
    (p) => p.status !== "cancelado" && (typeof calcSaldoPendiente === "function" ? calcSaldoPendiente(p) : p.resta || 0) > 0
  );
  if (porCobrar.length > 0) {
    items.push(`\u{1F4B3} ${porCobrar.length} pedido${porCobrar.length > 1 ? "s" : ""} con saldo pendiente`);
  }
  const sinAnticipo = (window.pedidos || []).filter(
    (p) => p.status !== "cancelado" && !p.anticipo && !(p.pagos && p.pagos.length > 0)
  );
  if (sinAnticipo.length > 0) {
    items.push(`\u26A0\uFE0F ${sinAnticipo.length} pedido${sinAnticipo.length > 1 ? "s" : ""} sin anticipo registrado`);
  }
  const vencidos = (window.pedidos || []).filter((p) => {
    if (!p.entrega || p.status === "cancelado" || p.status === "finalizado") return false;
    return /* @__PURE__ */ new Date(p.entrega + "T00:00:00") < /* @__PURE__ */ new Date(hoy + "T00:00:00");
  });
  if (vencidos.length > 0) {
    items.push(`\u{1F6A8} ${vencidos.length} entrega${vencidos.length > 1 ? "s" : ""} vencida${vencidos.length > 1 ? "s" : ""}`);
  }
  if (items.length === 0) {
    el.innerHTML = '<span class="text-green-600 text-sm">\u2705 Todo en orden por hoy</span>';
  } else {
    el.innerHTML = items.map((i) => `<div class="text-sm py-1 border-b border-gray-100">${i}</div>`).join("");
  }
}
window._renderAtencionHoy = _renderAtencionHoy;
function actualizarSidebarBadges() {
  const badgePedidos = document.getElementById("sidebarBadgePedidos");
  if (badgePedidos) {
    const activos = (pedidos || []).filter(
      (p) => !["finalizado", "cancelado"].includes((p.status || "").toLowerCase())
    ).length;
    const prevVal = badgePedidos._lastVal;
    if (activos > 0) {
      badgePedidos.textContent = activos > 99 ? "99+" : activos;
      badgePedidos.style.display = "inline-block";
      if (prevVal !== activos) {
        badgePedidos.classList.remove("badge-new");
        void badgePedidos.offsetWidth;
        badgePedidos.classList.add("badge-new");
      }
      const urgentes2 = (pedidos || []).filter((p) => {
        const f = p.entrega || p.fechaEntrega;
        if (!f || ["finalizado", "cancelado"].includes((p.status || "").toLowerCase())) return false;
        const dias = typeof window.diasHastaEntrega === "function" ? window.diasHastaEntrega(f) : (() => {
          const [y, m, d] = f.split("-").map(Number);
          const h = /* @__PURE__ */ new Date();
          h.setHours(0, 0, 0, 0);
          return Math.round((new Date(y, m - 1, d) - h) / 864e5);
        })();
        return dias !== null && dias >= 0 && dias <= 2;
      }).length;
      badgePedidos.className = "sidebar-badge" + (urgentes2 > 0 ? "" : " badge-warn") + " badge-new";
    } else {
      badgePedidos.style.display = "none";
    }
    badgePedidos._lastVal = activos;
    try {
      if (ipcRenderer) {
        ipcRenderer.send("update-tray-badge", { urgentes, total: activos });
      }
    } catch (e) {
    }
  }
  const badgeInv = document.getElementById("sidebarBadgeInventory");
  if (badgeInv) {
    const bajos = (products || []).filter(
      (p) => p.stock === 0 || p.stock > 0 && p.stock <= (p.stockMin || 5)
    ).length;
    const prevVal = badgeInv._lastVal;
    if (bajos > 0) {
      badgeInv.textContent = bajos > 99 ? "99+" : bajos;
      badgeInv.style.display = "inline-block";
      if (prevVal !== bajos) {
        badgeInv.classList.remove("badge-new");
        void badgeInv.offsetWidth;
        badgeInv.classList.add("badge-new");
      }
      const agotados = (products || []).filter((p) => p.stock === 0).length;
      badgeInv.className = "sidebar-badge" + (agotados > 0 ? "" : " badge-warn") + " badge-new";
    } else {
      badgeInv.style.display = "none";
    }
    badgeInv._lastVal = bajos;
  }
}
window.actualizarSidebarBadges = actualizarSidebarBadges;
function checkPedidosSinMovimiento() {
  const DIAS = 3;
  const hoy = /* @__PURE__ */ new Date();
  hoy.setHours(0, 0, 0, 0);
  const estadosActivos = ["confirmado", "pago", "produccion", "envio", "salida", "retirar"];
  const estadosLabel = {
    confirmado: "Confirmado",
    pago: "Pago parcial",
    produccion: "En producci\xF3n",
    envio: "En env\xEDo",
    salida: "Salida",
    retirar: "Por retirar"
  };
  const sinMov = (pedidos || []).filter((p) => {
    if (!estadosActivos.includes(p.status)) return false;
    const ref = new Date(p.fechaUltimoEstado || p.fechaCreacion);
    ref.setHours(0, 0, 0, 0);
    return Math.round((hoy - ref) / 864e5) >= DIAS;
  }).map((p) => {
    const ref = new Date(p.fechaUltimoEstado || p.fechaCreacion);
    ref.setHours(0, 0, 0, 0);
    return { ...p, diasSinMov: Math.round((hoy - ref) / 864e5) };
  }).sort((a, b) => b.diasSinMov - a.diasSinMov);
  const banner = document.getElementById("alertaSinMovimiento");
  const lista = document.getElementById("alertaSinMovimientoLista");
  if (!banner || !lista) return;
  if (sinMov.length === 0) {
    banner.classList.remove("visible");
    return;
  }
  banner.classList.add("visible");
  const sub = document.getElementById("alertaSinMovimientoSubtitulo");
  if (sub) sub.textContent = sinMov.length === 1 ? `1 pedido sin avance hace m\xE1s de ${DIAS} d\xEDas` : `${sinMov.length} pedidos sin avance hace m\xE1s de ${DIAS} d\xEDas`;
  lista.innerHTML = sinMov.map((p) => `
        <div class="alerta-pedido-card" style="border-color:#9ca3af;">
            <span class="text-2xl">\u23F8\uFE0F</span>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-gray-800 text-sm">${_esc(p.folio || "")}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${estadosLabel[p.status] || p.status}</span>
                </div>
                <p class="text-gray-700 text-sm font-medium truncate">${_esc(p.cliente)}</p>
                <p class="text-gray-500 text-xs truncate">${_esc(p.concepto || "")}</p>
            </div>
            <div class="text-right shrink-0">
                <p class="text-sm font-bold text-gray-500">${p.diasSinMov}d sin cambios</p>
                ${p.entrega ? `<p class="text-xs text-gray-400">Entrega: ${_esc(p.entrega)}</p>` : ""}
                <button onclick="openPedidoStatusModal('${_esc(p.id)}')" style="font-size:.7rem;color:#6b7280;background:none;border:1px solid #d1d5db;border-radius:6px;padding:2px 8px;cursor:pointer;margin-top:4px;">Actualizar</button>
            </div>
        </div>`).join("");
}
window.checkPedidosSinMovimiento = checkPedidosSinMovimiento;
function renderSyncIndicator() {
  let estado = "ok";
  if (!navigator.onLine) {
    estado = "offline";
  } else if (window._supabaseOnline === false) {
    estado = "offline";
  } else if (window._supabaseSyncing === true) {
    estado = "syncing";
  }
  const iconMap = { ok: "\u{1F7E2}", syncing: "\u{1F7E1}", offline: "\u{1F534}" };
  const labelMap = { ok: "Sincronizado", syncing: "Sincronizando...", offline: "Sin conexi\xF3n" };
  const colorMap = { ok: "#16a34a", syncing: "#d97706", offline: "#dc2626" };
  const icon = iconMap[estado];
  const label = labelMap[estado];
  const color = colorMap[estado];
  const indicadorStyle = "display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:600;padding:3px 10px;border-radius:99px;background:rgba(255,255,255,.85);border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:default;user-select:none;";
  let el = document.getElementById("syncIndicator");
  if (!el) {
    const header = document.getElementById("dashDate")?.closest('.flex, header, [class*="header"]') || document.getElementById("dashGreeting")?.closest('.flex, [class*="header"], [class*="card"]') || document.querySelector('#dashboard-section, #dashboardSection, [id*="dashboard"]');
    if (!header) {
      console.warn("[SyncIndicator] No se encontr\xF3 contenedor de header para el indicador de sync");
      const fallback = document.querySelector("#sidebar footer, #sidebar .mt-auto, aside footer");
      if (fallback && !document.getElementById("syncIndicator")) {
        const indicadorHTML = `<div id="syncIndicator" style="${indicadorStyle}margin:8px;"></div>`;
        fallback.insertAdjacentHTML("afterbegin", indicadorHTML);
        el = document.getElementById("syncIndicator");
      }
      if (!el) return;
    } else {
      el = document.createElement("div");
      el.id = "syncIndicator";
      el.style.cssText = indicadorStyle;
      header.insertAdjacentElement("afterbegin", el);
    }
  }
  el.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;"></span><span style="color:${color};">${label}</span>`;
  if (!window._syncIndicatorBound) {
    window._syncIndicatorBound = true;
    window.addEventListener("online", () => renderSyncIndicator());
    window.addEventListener("offline", () => renderSyncIndicator());
  }
  _toggleSyncBanner(estado === "offline" || estado === "error");
}
window.renderSyncIndicator = renderSyncIndicator;
function _toggleSyncBanner(offline) {
  let banner = document.getElementById("syncOfflineBanner");
  if (offline) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "syncOfflineBanner";
      banner.style.cssText = "background:#ef4444;color:white;text-align:center;padding:4px 12px;font-size:12px;font-weight:600;position:sticky;top:0;z-index:100";
      banner.textContent = "\u26A0\uFE0F Sin conexi\xF3n \u2014 los cambios se guardar\xE1n localmente";
      const main = document.querySelector("main, .main-content, #mainContent");
      if (main) main.insertAdjacentElement("afterbegin", banner);
    }
  } else {
    if (banner) banner.remove();
  }
}
window._toggleSyncBanner = _toggleSyncBanner;
function renderResumenDia() {
  const now = /* @__PURE__ */ new Date();
  const hora = now.getHours();
  const saludo = hora < 12 ? "Buenos d\xEDas" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const fechaStr = now.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const fechaCap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
  const hoy = typeof window._fechaHoy === "function" ? window._fechaHoy() : (() => {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const pedidosActivos = (window.pedidos || []).filter(
    (p) => !["finalizado", "cancelado"].includes((p.status || "").toLowerCase())
  );
  const nActivos = pedidosActivos.length;
  const nHoy = pedidosActivos.filter((p) => (p.entrega || p.fechaEntrega) === hoy).length;
  const _calcS = typeof window.calcSaldoPendiente === "function" ? window.calcSaldoPendiente : (p) => Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
  const totalPorCobrar = pedidosActivos.reduce((acc, p) => acc + _calcS(p), 0);
  const sinFecha = pedidosActivos.filter((p) => !p.entrega && !p.fechaEntrega).length;
  const nombreTienda = window.storeConfig?.name || window.storeConfig?.storeName || window.storeName || "Maneki";
  const html = `
        <div id="resumenDia" style="background:linear-gradient(135deg,#fff9f0 0%,#fffbf5 100%);border:1.5px solid #f5e6cc;border-radius:18px;padding:20px 22px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
                <div>
                    <h2 style="font-size:1.15rem;font-weight:800;color:#1f2937;margin:0;">${saludo}, ${nombreTienda} \u{1F431}</h2>
                    <p style="font-size:.8rem;color:#9ca3af;margin:2px 0 0;">${fechaCap}</p>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;">
                <div style="background:#fff;border-radius:12px;padding:10px 12px;border:1px solid #f3e8d0;">
                    <p style="font-size:1.4rem;font-weight:900;color:#C5A572;margin:0;">${nActivos}</p>
                    <p style="font-size:.7rem;color:#6b7280;margin:2px 0 0;">pedidos activos</p>
                </div>
                <div style="background:#fff;border-radius:12px;padding:10px 12px;border:1px solid #f3e8d0;">
                    <p style="font-size:1.4rem;font-weight:900;color:#f97316;margin:0;">${nHoy}</p>
                    <p style="font-size:.7rem;color:#6b7280;margin:2px 0 0;">para entregar hoy</p>
                </div>
                <div style="background:#fff;border-radius:12px;padding:10px 12px;border:1px solid #f3e8d0;">
                    <p style="font-size:1.1rem;font-weight:900;color:#dc2626;margin:0;">$${totalPorCobrar.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p style="font-size:.7rem;color:#6b7280;margin:2px 0 0;">por cobrar</p>
                </div>
                ${sinFecha > 0 ? `<div style="background:#fef9c3;border-radius:12px;padding:10px 12px;border:1px solid #fde68a;">
                    <p style="font-size:1.4rem;font-weight:900;color:#b45309;margin:0;">${sinFecha}</p>
                    <p style="font-size:.7rem;color:#92400e;margin:2px 0 0;">sin fecha de entrega</p>
                </div>` : ""}
            </div>
        </div>`;
  const existing = document.getElementById("resumenDia");
  if (existing) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const newContent = temp.firstElementChild;
    if (newContent) existing.innerHTML = newContent.innerHTML;
    return;
  }
  const dashRoot = document.querySelector('#dashboard-section > div, #dashboardSection > div, [id*="dashboard-section"] > div') || document.getElementById("dashGoalBar")?.closest('.p-6, .p-4, [class*="card"]')?.parentElement;
  if (dashRoot) {
    dashRoot.insertAdjacentHTML("afterbegin", html);
  }
}
window.renderResumenDia = renderResumenDia;
function renderAccesosRapidos() {
  if (document.getElementById("accesosRapidos")) return;
  const acciones = [
    { emoji: "\u2795", label: "Nuevo Pedido", fn: () => {
      if (typeof openPedidoModal === "function") openPedidoModal();
      else manekiToastExport("M\xF3dulo no cargado", "warn");
    } },
    { emoji: "\u{1F4E6}", label: "Inventario", fn: () => {
      if (typeof showSection === "function") showSection("inventario");
    } },
    { emoji: "\u{1F4B0}", label: "Registrar Cobro", fn: () => {
      if (typeof openIncomeModal === "function") openIncomeModal();
      else if (typeof showSection === "function") showSection("balance");
    } },
    { emoji: "\u{1F4CA}", label: "Reportes", fn: () => {
      if (typeof showSection === "function") showSection("reportes");
    } },
    { emoji: "\u{1F464}", label: "Clientes", fn: () => {
      if (typeof showSection === "function") showSection("clientes");
    } }
  ];
  const container = document.createElement("div");
  container.id = "accesosRapidos";
  container.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:8px;padding:12px 16px;margin-bottom:16px;";
  acciones.forEach((a, i) => {
    const btn = document.createElement("button");
    btn.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px 8px;min-height:64px;background:#fff;border:1.5px solid #f3f4f6;border-radius:14px;cursor:pointer;font-family:inherit;transition:border-color .15s,box-shadow .15s;";
    btn.innerHTML = `<span style="font-size:1.5rem;line-height:1;">${a.emoji}</span><span style="font-size:.68rem;font-weight:700;color:#374151;text-align:center;line-height:1.2;">${a.label}</span>`;
    btn.title = a.label;
    btn.addEventListener("click", a.fn);
    btn.addEventListener("mouseenter", () => {
      btn.style.borderColor = "#C5A572";
      btn.style.boxShadow = "0 2px 8px rgba(197,165,114,.18)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.borderColor = "#f3f4f6";
      btn.style.boxShadow = "";
    });
    container.appendChild(btn);
  });
  const afterResumen = document.getElementById("resumenDia");
  if (afterResumen) {
    afterResumen.insertAdjacentElement("afterend", container);
    return;
  }
  const dashRoot = document.querySelector('#dashboard-section > div, #dashboardSection > div, [id*="dashboard-section"] > div') || document.getElementById("dashGoalBar")?.closest('.p-6, .p-4, [class*="card"]')?.parentElement;
  if (dashRoot) {
    dashRoot.insertAdjacentElement("afterbegin", container);
  }
}
window.renderAccesosRapidos = renderAccesosRapidos;
let _cashFlowChart = null;
function renderCashFlowChart() {
  const canvas = document.getElementById("dashCashFlowChart");
  if (!canvas) return;
  if (typeof Chart === "undefined") return;
  const hoy = /* @__PURE__ */ new Date();
  hoy.setHours(0, 0, 0, 0);
  const semanas = 8;
  const labels = [], ingresos = [], gastos = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const finSemana = new Date(hoy);
    finSemana.setDate(finSemana.getDate() - i * 7);
    const iniSemana = new Date(finSemana);
    iniSemana.setDate(iniSemana.getDate() - 6);
    const _fLocal = (d) => d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    const ini = _fLocal(iniSemana), fin = _fLocal(finSemana);
    let ingreso = 0;
    (window.salesHistory || []).forEach((s) => {
      if (!s.date || s.method === "Cancelado" || s.type === "abono" || s.type === "anticipo") return;
      if (s.date >= ini && s.date <= fin) ingreso += Number(s.total || 0);
    });
    (window.pedidosFinalizados || []).forEach((p) => {
      const f = (p.fechaFinalizado || p.fecha || "").split("T")[0];
      if (f >= ini && f <= fin) ingreso += Number(p.total || 0);
    });
    let gasto = 0;
    (window.expenses || []).forEach((e) => {
      if (e.date && e.date >= ini && e.date <= fin) gasto += Number(e.amount || 0);
    });
    const label = iniSemana.getDate() + "/" + (iniSemana.getMonth() + 1) + " - " + finSemana.getDate() + "/" + (finSemana.getMonth() + 1);
    labels.push(label);
    ingresos.push(Math.round(ingreso));
    gastos.push(Math.round(gasto));
  }
  if (_cashFlowChart) {
    _cashFlowChart.destroy();
    _cashFlowChart = null;
  }
  _cashFlowChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Ingresos",
          data: ingresos,
          backgroundColor: "rgba(22, 163, 74, 0.7)",
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: "Gastos",
          data: gastos,
          backgroundColor: "rgba(220, 38, 38, 0.55)",
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: true, position: "top", labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.dataset.label + ": $" + ctx.parsed.y.toLocaleString("es-MX")
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 10 }, callback: (v) => "$" + v.toLocaleString("es-MX") } }
      }
    }
  });
}
window.renderCashFlowChart = renderCashFlowChart;
function generarResumenSemanalWA() {
  const hoy = /* @__PURE__ */ new Date();
  const hace7 = new Date(hoy);
  hace7.setDate(hace7.getDate() - 7);
  const _f = (d) => d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  const ini = _f(hace7), fin = _f(hoy);
  let ventasTotal = 0, ventasCount = 0;
  (window.salesHistory || []).forEach((s) => {
    if (!s.date || s.method === "Cancelado" || s.type === "abono" || s.type === "anticipo") return;
    if (s.date >= ini && s.date <= fin) {
      ventasTotal += Number(s.total || 0);
      ventasCount++;
    }
  });
  (window.pedidosFinalizados || []).forEach((p) => {
    const f = (p.fechaFinalizado || p.fecha || "").split("T")[0];
    if (f >= ini && f <= fin) {
      ventasTotal += Number(p.total || 0);
      ventasCount++;
    }
  });
  let gastosTotal = 0;
  (window.expenses || []).forEach((e) => {
    if (e.date && e.date >= ini && e.date <= fin) gastosTotal += Number(e.amount || 0);
  });
  const pedidosNuevos = (window.pedidos || []).filter((p) => {
    const f = (p.fechaPedido || p.fechaCreacion || p.fecha || "").split("T")[0];
    return f >= ini && f <= fin;
  }).length;
  const neto = ventasTotal - gastosTotal;
  const ticket = ventasCount > 0 ? ventasTotal / ventasCount : 0;
  const texto = `\u{1F4CA} *Resumen Semanal \u2014 Maneki Store*
\u{1F4C5} ${ini} al ${fin}

\u{1F4B0} Ventas: $${ventasTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} (${ventasCount} ventas)
\u{1F4B8} Gastos: $${gastosTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
\u{1F4C8} Neto: $${neto.toLocaleString("es-MX", { minimumFractionDigits: 2 })} ${neto >= 0 ? "\u2705" : "\u26A0\uFE0F"}
\u{1F3AB} Ticket promedio: $${ticket.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
\u{1F4CB} Pedidos nuevos: ${pedidosNuevos}

_Generado desde Maneki POS_`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto).then(() => {
      manekiToastExport("\u{1F4CB} Resumen copiado \u2014 p\xE9galo en WhatsApp", "ok");
    });
  } else {
    prompt("Copia este texto para WhatsApp:", texto);
  }
  return texto;
}
window.generarResumenSemanalWA = generarResumenSemanalWA;
function checkGastosInusuales() {
  const expenses = window.expenses || [];
  if (expenses.length < 10) return;
  const hoy = /* @__PURE__ */ new Date();
  const mesActual = hoy.getFullYear() + "-" + ("0" + (hoy.getMonth() + 1)).slice(-2);
  const porCategoria = {};
  expenses.forEach((e) => {
    if (!e.date) return;
    const mes = e.date.substring(0, 7);
    const cat = e.etiqueta || e.category || "Otros";
    if (!porCategoria[cat]) porCategoria[cat] = [];
    if (mes !== mesActual) porCategoria[cat].push(Number(e.amount || 0));
  });
  const gastosMesActual = {};
  expenses.forEach((e) => {
    if (!e.date || !e.date.startsWith(mesActual)) return;
    const cat = e.etiqueta || e.category || "Otros";
    gastosMesActual[cat] = (gastosMesActual[cat] || 0) + Number(e.amount || 0);
  });
  const alertas = [];
  for (const [cat, historial] of Object.entries(porCategoria)) {
    if (historial.length < 2) continue;
    const promedio = historial.reduce((s, v) => s + v, 0) / historial.length;
    const actual = gastosMesActual[cat] || 0;
    if (actual > promedio * 2 && actual > 100) {
      alertas.push({ cat, actual, promedio });
    }
  }
  if (alertas.length === 0) return;
  let banner = document.getElementById("alertaGastosInusuales");
  if (!banner) {
    const dashRoot = document.querySelector("#dashboard-section .grid, #dashboardSection .grid") || document.getElementById("semanalWidget")?.parentElement;
    if (!dashRoot) return;
    banner = document.createElement("div");
    banner.id = "alertaGastosInusuales";
    dashRoot.insertAdjacentElement("beforeend", banner);
  }
  banner.innerHTML = `
        <div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:14px;padding:14px 16px;margin-top:12px;">
            <p style="font-size:.78rem;font-weight:800;color:#991B1B;margin:0 0 8px;">\u26A0\uFE0F Gastos inusuales este mes</p>
            ${alertas.map((a) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #FEE2E2;">
                    <span style="font-size:.75rem;color:#7F1D1D;">${a.cat}</span>
                    <span style="font-size:.75rem;font-weight:700;color:#DC2626;">$${a.actual.toFixed(0)} <span style="font-weight:400;color:#9CA3AF;">(prom: $${a.promedio.toFixed(0)})</span></span>
                </div>
            `).join("")}
        </div>`;
}
window.checkGastosInusuales = checkGastosInusuales;
let _climaCache = null;
async function renderWidgetClima() {
  let card = document.getElementById("widgetClima");
  if (!card) {
    const target = document.getElementById("semanalWidget")?.parentElement || document.querySelector("#dashboard-section .space-y-4, #dashboardSection .space-y-4");
    if (!target) return;
    card = document.createElement("div");
    card.id = "widgetClima";
    target.insertAdjacentElement("beforeend", card);
  }
  if (_climaCache && Date.now() - _climaCache.ts < 30 * 60 * 1e3) {
    _renderClimaHTML(card, _climaCache.data);
    return;
  }
  card.innerHTML = `<div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:1.2rem;">\u{1F321}\uFE0F</span>
        <span style="font-size:.75rem;color:#0369A1;">Cargando clima...</span>
    </div>`;
  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=25.6866&longitude=-100.3161&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FMonterrey&forecast_days=1");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    _climaCache = { data, ts: Date.now() };
    _renderClimaHTML(card, data);
  } catch (e) {
    card.innerHTML = "";
  }
}
function _climaIcono(code) {
  if (code === 0) return "\u2600\uFE0F";
  if (code <= 2) return "\u{1F324}\uFE0F";
  if (code <= 3) return "\u2601\uFE0F";
  if (code <= 48) return "\u{1F32B}\uFE0F";
  if (code <= 57) return "\u{1F327}\uFE0F";
  if (code <= 67) return "\u{1F327}\uFE0F";
  if (code <= 77) return "\u2744\uFE0F";
  if (code <= 82) return "\u{1F326}\uFE0F";
  if (code <= 99) return "\u26C8\uFE0F";
  return "\u{1F321}\uFE0F";
}
function _climaDesc(code) {
  if (code === 0) return "Despejado";
  if (code <= 2) return "Parcialmente nublado";
  if (code <= 3) return "Nublado";
  if (code <= 48) return "Neblina";
  if (code <= 57) return "Llovizna";
  if (code <= 67) return "Lluvia";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  if (code <= 99) return "Tormenta";
  return "Variable";
}
function _renderClimaHTML(card, data) {
  const cur = data.current;
  const daily = data.daily;
  const temp = Math.round(cur.temperature_2m);
  const max = Math.round(daily.temperature_2m_max[0]);
  const min = Math.round(daily.temperature_2m_min[0]);
  const icon = _climaIcono(cur.weathercode);
  const desc = _climaDesc(cur.weathercode);
  const humedad = cur.relativehumidity_2m;
  const viento = Math.round(cur.windspeed_10m);
  card.innerHTML = `
        <div style="background:linear-gradient(135deg,#EFF6FF,#F0F9FF);border:1px solid #BFDBFE;border-radius:14px;padding:12px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:2rem;line-height:1;">${icon}</span>
                    <div>
                        <p style="font-size:1.4rem;font-weight:800;color:#1E40AF;margin:0;line-height:1;">${temp}\xB0C</p>
                        <p style="font-size:.7rem;color:#3B82F6;margin:1px 0 0;">${desc} \xB7 Monterrey</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:.72rem;color:#6B7280;margin:0;">\u2191${max}\xB0 \u2193${min}\xB0</p>
                    <p style="font-size:.7rem;color:#6B7280;margin:2px 0 0;">\u{1F4A7}${humedad}% \u{1F4A8}${viento}km/h</p>
                </div>
            </div>
        </div>`;
}
window.renderWidgetClima = renderWidgetClima;
//# sourceMappingURL=dashboard.js.map
