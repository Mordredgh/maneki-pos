var _ = (() => {
  if (typeof _esc !== "function") {
    window._esc = function(s) {
      return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };
  }
  function manekiToastExport(msg, tipo) {
    let container = document.getElementById("mk-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "mk-toast-container";
      container.className = "mk-toast-container";
      document.body.appendChild(container);
    }
    const icons = { ok: "\u2713", warn: "!", err: "\u2715", info: "i" };
    const titles = { ok: "Completado", warn: "Aviso", err: "Error", info: "Info" };
    const t = tipo || "ok";
    const icon = icons[t] || icons.ok;
    const title = titles[t] || titles.ok;
    const toast = document.createElement("div");
    toast.className = `mk-toast ${t}`;
    const _escT = typeof window._esc === "function" ? window._esc : ((s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    toast.innerHTML = `
        <div class="mk-toast-icon">${icon}</div>
        <div class="mk-toast-body">
            <div class="mk-toast-title">${title}</div>
            <div class="mk-toast-msg">${_escT(msg)}</div>
        </div>
        <div class="mk-toast-progress"></div>`;
    const existingToasts = container.querySelectorAll(".mk-toast:not(.out)");
    for (const existing of existingToasts) {
      if (existing.querySelector(".mk-toast-msg")?.textContent === msg) {
        if (existing._timer) clearTimeout(existing._timer);
        existing._timer = setTimeout(() => dismissToast(existing), 3600);
        existing.classList.remove("out");
        return;
      }
    }
    toast.addEventListener("click", () => dismissToast(toast));
    container.appendChild(toast);
    const timer = setTimeout(() => dismissToast(toast), 3600);
    toast._timer = timer;
    const toasts = container.querySelectorAll(".mk-toast:not(.out)");
    if (toasts.length > 3) dismissToast(toasts[0]);
  }
  function dismissToast(toast) {
    if (!toast || toast.classList.contains("out")) return;
    if (toast._timer) clearTimeout(toast._timer);
    toast.classList.add("out");
    setTimeout(() => toast.remove(), 300);
  }
  const _confirmQueue = [];
  let _confirmBusy = false;
  function _processConfirmQueue() {
    if (_confirmBusy || _confirmQueue.length === 0) return;
    _confirmBusy = true;
    const { message, title, resolve } = _confirmQueue.shift();
    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalMessage").textContent = message;
    window._confirmCurrentResolve = resolve;
    openModal("confirmModal");
  }
  function showConfirm(message, title = "\xBFEst\xE1s seguro?") {
    return new Promise((resolve) => {
      _confirmQueue.push({ message, title, resolve });
      _processConfirmQueue();
    });
  }
  function confirmModalResolve(result) {
    closeModal("confirmModal");
    _confirmBusy = false;
    if (window._confirmCurrentResolve) {
      window._confirmCurrentResolve(result);
      window._confirmCurrentResolve = null;
    }
    setTimeout(_processConfirmQueue, 250);
  }
  window.showConfirm = showConfirm;
  window.confirmModalResolve = confirmModalResolve;
  function closeAjustarStockModal() {
    closeModal("ajustarStockModal");
    window._ajustarStockId = null;
    const modal = document.getElementById("ajustarStockModal");
    if (modal) delete modal.dataset.productId;
  }
  function confirmarAjusteStock() {
    const modal = document.getElementById("ajustarStockModal");
    const rawId = modal && modal.dataset.productId || window._ajustarStockId;
    if (!rawId) {
      manekiToastExport("\u274C Error: no se encontr\xF3 el producto", "error");
      return;
    }
    const allProducts = window.products || products || [];
    const p = allProducts.find((x) => String(x.id) === String(rawId));
    if (!p) {
      manekiToastExport("\u274C Error: producto no encontrado", "error");
      return;
    }
    const cantEl = document.getElementById("ajustarStockCantidad");
    const num = parseInt(cantEl ? cantEl.value : "");
    if (isNaN(num) || cantEl.value.trim() === "") {
      manekiToastExport("\u26A0\uFE0F Ingresa una cantidad v\xE1lida (+para agregar / -para restar)", "warn");
      if (cantEl) cantEl.focus();
      return;
    }
    if (num === 0) {
      manekiToastExport("\u26A0\uFE0F La cantidad no puede ser 0", "warn");
      return;
    }
    const stockActual = p.variants && p.variants.length > 0 ? p.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0) : parseInt(p.stock) || 0;
    const nuevoStock = Math.max(0, stockActual + num);
    const motivo = document.getElementById("ajustarStockMotivo").value.trim() || "Ajuste manual";
    p.stock = nuevoStock;
    if (p.variants && p.variants.length > 0 && num !== 0) {
      if (num > 0) {
        p.variants[0].qty = (p.variants[0].qty || 0) + num;
      } else {
        let restante = Math.abs(num);
        for (const v of p.variants) {
          const quitar = Math.min(v.qty || 0, restante);
          v.qty = (v.qty || 0) - quitar;
          restante -= quitar;
          if (restante <= 0) break;
        }
      }
      p.stock = p.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
    }
    if (typeof registrarMovimiento === "function") {
      try {
        registrarMovimiento({
          productoId: p.id,
          productoNombre: p.name,
          tipo: num > 0 ? "entrada" : "salida",
          cantidad: num,
          motivo,
          stockAntes: stockActual,
          stockDespues: p.stock
        });
      } catch (e) {
        try {
          registrarMovimiento(p.id, p.name, num > 0 ? "entrada" : "salida", Math.abs(num), motivo);
        } catch (e2) {
        }
      }
    }
    if (typeof saveProducts === "function") saveProducts();
    if (typeof renderInventoryTable === "function") renderInventoryTable();
    if (typeof updateDashboard === "function") updateDashboard();
    closeAjustarStockModal();
    manekiToastExport(`\u2705 Stock de "${p.name}": ${stockActual} \u2192 ${p.stock}`, "ok");
  }
  window.closeAjustarStockModal = closeAjustarStockModal;
  window.confirmarAjusteStock = confirmarAjusteStock;
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
      e.preventDefault();
      if (typeof _abrirErrorLog === "function") _abrirErrorLog();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const _sectionKeys = {
        "1": "bienvenida",
        "2": "pedidos",
        "3": "inventory",
        "4": "balance",
        "5": "reportes",
        "6": "clientes",
        "7": "envios",
        "8": "equipos",
        "9": "backup"
      };
      if (_sectionKeys[e.key]) {
        e.preventDefault();
        if (typeof showSection === "function") showSection(_sectionKeys[e.key]);
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const overlay = document.getElementById("busquedaGlobalOverlay");
      if (overlay) {
        _abrirBusquedaOverlay();
      } else {
        const searchInput = document.getElementById("globalSearchInput");
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      return;
    }
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) return;
    const anyModal = document.querySelector('.modal-overlay[style*="flex"], .modal-overlay.active, [id$="Modal"][style*="flex"]');
    if (e.key === "Escape") {
      const overlay = document.getElementById("busquedaGlobalOverlay");
      if (overlay && overlay.style.display !== "none") {
        e.preventDefault();
        _cerrarBusquedaOverlay();
        return;
      }
      const errorModal = document.getElementById("errorLogModal");
      if (errorModal && errorModal.style.display !== "none") {
        e.preventDefault();
        errorModal.style.display = "none";
        return;
      }
      const visibleModals = Array.from(document.querySelectorAll('[id$="Modal"]')).filter((m) => {
        const s = window.getComputedStyle(m);
        return s.display !== "none" && s.visibility !== "hidden";
      });
      if (visibleModals.length > 0) {
        e.preventDefault();
        const topModal = visibleModals[visibleModals.length - 1];
        if (topModal.id === "confirmModal") {
          if (typeof confirmModalResolve === "function") {
            confirmModalResolve(false);
          } else {
            closeModal("confirmModal");
          }
          return;
        }
        closeModal(topModal);
      }
      return;
    }
    if (e.key === "/") {
      const overlay = document.getElementById("busquedaGlobalOverlay");
      if (overlay) {
        e.preventDefault();
        _abrirBusquedaOverlay();
        return;
      }
    }
    if (anyModal) return;
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      const seccionActiva = document.querySelector('.mk-section.active, [id^="section-"].active, section.active');
      const secId = seccionActiva?.id || "";
      if (secId.includes("inventario") || secId.includes("producto") || secId.includes("catalog")) {
        if (typeof openProductModal === "function") openProductModal();
      } else {
        if (typeof openPedidoModal === "function") openPedidoModal();
      }
      return;
    }
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      if (typeof updateDashboard === "function") updateDashboard();
      return;
    }
  });
  const _mkUndoStack = [];
  const _MK_UNDO_MAX = 10;
  let _undoToastTimer = null;
  function mkPushUndo(descripcion, fn) {
    _mkUndoStack.push({ descripcion, fn });
    if (_mkUndoStack.length > _MK_UNDO_MAX) _mkUndoStack.shift();
  }
  window.mkPushUndo = mkPushUndo;
  function _mkUndo() {
    const action = _mkUndoStack.pop();
    if (!action) {
      manekiToastExport("Nada que deshacer", "warn");
      return;
    }
    try {
      action.fn();
      manekiToastExport(`\u21A9\uFE0F Deshecho: ${action.descripcion}`, "ok");
    } catch (e) {
      manekiToastExport("Error al deshacer", "err");
    }
  }
  function mkMostrarUndoHint(descripcion) {
    if (_undoToastTimer) clearTimeout(_undoToastTimer);
    let hint = document.getElementById("_mkUndoHint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "_mkUndoHint";
      hint.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9997;background:#1F2937;color:#fff;padding:8px 16px;border-radius:10px;font-size:.78rem;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.25);transition:opacity .3s;white-space:nowrap;";
      document.body.appendChild(hint);
    }
    hint.innerHTML = `<span>\u21A9\uFE0F ${descripcion}</span><kbd onclick="_mkUndo()" style="background:#374151;border:1px solid #4B5563;border-radius:5px;padding:2px 7px;font-size:.72rem;cursor:pointer;font-family:inherit;">Ctrl+Z</kbd>`;
    hint.style.opacity = "1";
    hint.style.display = "flex";
    _undoToastTimer = setTimeout(() => {
      if (hint) {
        hint.style.opacity = "0";
        setTimeout(() => {
          if (hint) hint.style.display = "none";
        }, 300);
      }
    }, 5e3);
  }
  window.mkMostrarUndoHint = mkMostrarUndoHint;
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      _mkUndo();
    }
  });
  function _normSearch(texto) {
    if (!texto) return "";
    return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function _matchBusqueda(valor, q) {
    if (!valor || !q) return false;
    return _normSearch(valor).includes(q);
  }
  function _abrirBusquedaOverlay() {
    const overlay = document.getElementById("busquedaGlobalOverlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    const input = document.getElementById("busquedaGlobalInput");
    if (input) {
      input.value = "";
      input.focus();
    }
    document.getElementById("busquedaGlobalResultados").innerHTML = "";
  }
  function _cerrarBusquedaOverlay() {
    const overlay = document.getElementById("busquedaGlobalOverlay");
    if (overlay) overlay.style.display = "none";
    const input = document.getElementById("busquedaGlobalInput");
    if (input) input.value = "";
    const resultados = document.getElementById("busquedaGlobalResultados");
    if (resultados) resultados.innerHTML = "";
  }
  function _busquedaOverlayRender(q) {
    const contenedor = document.getElementById("busquedaGlobalResultados");
    if (!contenedor) return;
    if (!q || q.trim().length < 2) {
      contenedor.innerHTML = "";
      return;
    }
    const qn = _normSearch(q.trim());
    let html = "";
    let hayResultados = false;
    const todosLosPedidos = [
      ...window.pedidos || [],
      ...window.pedidosFinalizados || []
    ];
    const pedidosFiltrados = todosLosPedidos.filter(
      (p) => _matchBusqueda(p.folio, qn) || _matchBusqueda(p.cliente, qn) || _matchBusqueda(p.concepto, qn)
    ).slice(0, 5);
    if (pedidosFiltrados.length > 0) {
      hayResultados = true;
      const statusColors = { pendiente: "#f59e0b", confirmado: "#3b82f6", produccion: "#8b5cf6", finalizado: "#10b981", cancelado: "#ef4444" };
      html += `<div style="padding:6px 12px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f3f4f6">\u{1F4E6} Pedidos</div>`;
      pedidosFiltrados.forEach((p, i) => {
        const color = statusColors[p.status] || "#6b7280";
        html += `<div class="busq-resultado" data-tipo="pedido" data-folio="${_esc(p.folio || "")}" data-cliente="${_esc(p.cliente || "")}" data-idx="${i}" tabindex="-1"
                style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9fafb">
                <span style="font-size:18px">\u{1F6CD}\uFE0F</span>
                <div style="flex:1; min-width:0">
                    <div style="font-weight:600; color:#111827; font-size:13px">${_esc(p.folio || "\u2014")} \u2014 ${_esc(p.cliente || "Sin nombre")}</div>
                    <div style="font-size:11px; color:#9ca3af; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${_esc(p.concepto || "Sin descripci\xF3n")}</div>
                </div>
                <div style="text-align:right; flex-shrink:0">
                    <div style="font-weight:700; font-size:13px; color:#374151">$${Number(p.total || 0).toFixed(2)}</div>
                    <div style="font-size:11px; color:${color}; text-transform:capitalize">${_esc(p.status || "\u2014")}</div>
                </div>
            </div>`;
      });
    }
    const productosFiltrados = (window.products || []).filter(
      (p) => _matchBusqueda(p.name, qn) || _matchBusqueda(p.sku, qn) || _matchBusqueda(p.codigo, qn)
    ).slice(0, 5);
    if (productosFiltrados.length > 0) {
      hayResultados = true;
      html += `<div style="padding:6px 12px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f3f4f6; border-top:1px solid #f3f4f6; margin-top:4px">\u{1F3F7}\uFE0F Productos</div>`;
      productosFiltrados.forEach((p, i) => {
        const stock = p.stock ?? "\u2014";
        html += `<div class="busq-resultado" data-tipo="producto" data-id="${_esc(String(p.id || ""))}" data-idx="${i}" tabindex="-1"
                style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9fafb">
                <span style="font-size:18px">${p.image || "\u{1F4E6}"}</span>
                <div style="flex:1; min-width:0">
                    <div style="font-weight:600; color:#111827; font-size:13px">${_esc(p.name || "Sin nombre")}</div>
                    <div style="font-size:11px; color:#9ca3af">SKU: ${_esc(p.sku || "\u2014")} \xB7 Stock: ${stock}</div>
                </div>
                <div style="font-weight:700; font-size:13px; color:#b45309; flex-shrink:0">$${Number(p.price || 0).toFixed(2)}</div>
            </div>`;
      });
    }
    const clientesFiltrados = (window.clients || []).filter(
      (c) => _matchBusqueda(c.name, qn) || _matchBusqueda(c.phone, qn) || _matchBusqueda(c.telefono, qn)
    ).slice(0, 5);
    if (clientesFiltrados.length > 0) {
      hayResultados = true;
      html += `<div style="padding:6px 12px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f3f4f6; border-top:1px solid #f3f4f6; margin-top:4px">\u{1F464} Clientes</div>`;
      clientesFiltrados.forEach((c, i) => {
        html += `<div class="busq-resultado" data-tipo="cliente" data-nombre="${_esc(c.name || "")}" data-idx="${i}" tabindex="-1"
                style="padding:10px 14px; cursor:pointer; display:flex; align-items:center; gap:10px; border-bottom:1px solid #f9fafb">
                <span style="font-size:18px">\u{1F464}</span>
                <div style="flex:1; min-width:0">
                    <div style="font-weight:600; color:#111827; font-size:13px">${_esc(c.name || "Sin nombre")}</div>
                    <div style="font-size:11px; color:#9ca3af">${_esc(c.phone || c.telefono || "Sin tel\xE9fono")}</div>
                </div>
                <div style="font-size:11px; color:#6b7280; flex-shrink:0">Ver \u2192</div>
            </div>`;
      });
    }
    if (!hayResultados) {
      html = `<div style="padding:32px 16px; text-align:center; color:#9ca3af; font-size:14px">Sin resultados para "<b>${_esc(q)}</b>"</div>`;
    }
    contenedor.innerHTML = html;
    contenedor.querySelectorAll(".busq-resultado").forEach((el) => {
      el.addEventListener("mousedown", function(ev) {
        ev.preventDefault();
        _seleccionarResultadoBusqueda(this);
      });
      el.addEventListener("mouseover", function() {
        _resaltarResultado(this);
      });
    });
  }
  function _seleccionarResultadoBusqueda(el) {
    const tipo = el.dataset.tipo;
    _cerrarBusquedaOverlay();
    if (tipo === "pedido") {
      if (typeof showSection === "function") showSection("pedidos");
      const folio = el.dataset.folio;
      const cliente = el.dataset.cliente;
      setTimeout(() => {
        const buscarEl = document.getElementById("kanbanBuscar");
        if (buscarEl && folio) {
          buscarEl.value = folio;
          buscarEl.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (buscarEl && cliente) {
          buscarEl.value = cliente;
          buscarEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 200);
    } else if (tipo === "producto") {
      if (typeof showSection === "function") showSection("inventario");
      const id = el.dataset.id;
      setTimeout(() => {
        if (id && typeof editProduct === "function") editProduct(id);
      }, 300);
    } else if (tipo === "cliente") {
      if (typeof showSection === "function") showSection("clientes");
      const nombre = el.dataset.nombre;
      setTimeout(() => {
        const searchInput = document.getElementById("searchClient");
        if (searchInput && nombre) {
          searchInput.value = nombre;
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 200);
    }
  }
  function _resaltarResultado(el) {
    const contenedor = document.getElementById("busquedaGlobalResultados");
    if (!contenedor) return;
    contenedor.querySelectorAll(".busq-resultado").forEach((r) => {
      r.style.background = "";
      delete r.dataset.resaltado;
    });
    el.style.background = "#f0f9ff";
    el.dataset.resaltado = "1";
  }
  function _navResultados(direccion) {
    const contenedor = document.getElementById("busquedaGlobalResultados");
    if (!contenedor) return;
    const items = Array.from(contenedor.querySelectorAll(".busq-resultado"));
    if (!items.length) return;
    const actual = items.findIndex((i) => i.dataset.resaltado === "1");
    items.forEach((i) => {
      i.style.background = "";
      delete i.dataset.resaltado;
    });
    let siguiente = actual + direccion;
    if (siguiente < 0) siguiente = items.length - 1;
    if (siguiente >= items.length) siguiente = 0;
    items[siguiente].style.background = "#f0f9ff";
    items[siguiente].dataset.resaltado = "1";
    items[siguiente].scrollIntoView({ block: "nearest" });
  }
  function initBusquedaGlobal() {
    if (document.getElementById("busquedaGlobalOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "busquedaGlobalOverlay";
    overlay.style.cssText = "display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:flex-start; justify-content:center; padding-top:10vh";
    overlay.innerHTML = `
        <div style="background:white; border-radius:12px; width:600px; max-width:90vw; max-height:70vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px rgba(0,0,0,0.3)">
            <div style="padding:16px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; gap:8px">
                <span>\u{1F50D}</span>
                <input id="busquedaGlobalInput" type="text" placeholder="Buscar pedidos, productos, clientes..."
                    style="flex:1; border:none; outline:none; font-size:16px">
                <kbd style="background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:12px; color:#6b7280; border:1px solid #e5e7eb">ESC</kbd>
            </div>
            <div id="busquedaGlobalResultados" style="overflow-y:auto; flex:1; padding:8px"></div>
        </div>`;
    document.body.appendChild(overlay);
    const inputWrapper = document.querySelector("#busquedaGlobalOverlay input")?.parentElement;
    if (inputWrapper && !inputWrapper.querySelector("._busq-kbd")) {
      inputWrapper.insertAdjacentHTML(
        "beforeend",
        '<kbd class="_busq-kbd" style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:4px;padding:2px 6px;font-size:11px;color:#6b7280;pointer-events:none">Ctrl+K</kbd>'
      );
    }
    overlay.addEventListener("mousedown", function(e) {
      if (e.target === overlay) _cerrarBusquedaOverlay();
    });
    let _bgTimer = null;
    const input = document.getElementById("busquedaGlobalInput");
    input.addEventListener("input", function() {
      clearTimeout(_bgTimer);
      _bgTimer = setTimeout(() => _busquedaOverlayRender(this.value), 250);
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        _cerrarBusquedaOverlay();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        _navResultados(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        _navResultados(-1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const contenedor = document.getElementById("busquedaGlobalResultados");
        const resaltado = contenedor && contenedor.querySelector('[data-resaltado="1"]');
        if (resaltado) _seleccionarResultadoBusqueda(resaltado);
        return;
      }
    });
  }
  function initErrorLog() {
    window._errorLog = window._errorLog || [];
    const _prevOnerror = window.onerror;
    window.onerror = function(msg, src, line, col, err) {
      if (typeof _prevOnerror === "function") _prevOnerror(msg, src, line, col, err);
      window._errorLog = window._errorLog || [];
      window._errorLog.unshift({ ts: (/* @__PURE__ */ new Date()).toISOString(), tipo: "error", msg, src, line, stack: err?.stack });
      if (window._errorLog.length > 50) window._errorLog.pop();
    };
    const _prevUnhandled = window._unhandledRejectionHandler || null;
    const _unhandledHandler = function(e) {
      if (typeof _prevUnhandled === "function") _prevUnhandled(e);
      window._errorLog = window._errorLog || [];
      window._errorLog.unshift({
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        tipo: "promise",
        msg: String(e.reason),
        stack: e.reason && e.reason.stack ? e.reason.stack : null
      });
      if (window._errorLog.length > 50) window._errorLog.pop();
    };
    window._unhandledRejectionHandler = _unhandledHandler;
    window.addEventListener("unhandledrejection", _unhandledHandler);
    if (document.getElementById("errorLogModal")) return;
    const modal = document.createElement("div");
    modal.id = "errorLogModal";
    modal.style.cssText = "display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:10000; align-items:center; justify-content:center";
    modal.innerHTML = `
        <div style="background:#1e1e1e; border-radius:12px; width:800px; max-width:95vw; max-height:80vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 60px rgba(0,0,0,0.5); color:#d4d4d4; font-family:monospace">
            <div style="padding:14px 18px; border-bottom:1px solid #333; display:flex; align-items:center; gap:8px; background:#252526">
                <span style="font-size:16px">\u{1F41B}</span>
                <span style="font-weight:700; font-size:14px; color:#e9e9e9">Log de Errores</span>
                <span id="errorLogCount" style="background:#ef4444; color:white; border-radius:999px; padding:1px 7px; font-size:11px; margin-left:4px"></span>
                <div style="margin-left:auto; display:flex; gap:8px">
                    <button id="errorLogCopyBtn"
                        style="background:#0e639c; border:none; border-radius:6px; padding:5px 10px; color:white; cursor:pointer; font-size:12px">\u{1F4CB} Copiar log</button>
                    <button id="errorLogClearBtn"
                        style="background:#5a1d1d; border:none; border-radius:6px; padding:5px 10px; color:#f87171; cursor:pointer; font-size:12px">\u{1F5D1}\uFE0F Limpiar</button>
                    <button id="errorLogCloseBtn"
                        style="background:#3c3c3c; border:none; border-radius:6px; padding:5px 10px; color:#9ca3af; cursor:pointer; font-size:12px">\u2715 Cerrar</button>
                </div>
            </div>
            <div id="errorLogLista" style="overflow-y:auto; flex:1; padding:12px"></div>
        </div>`;
    document.body.appendChild(modal);
    modal.querySelector("#errorLogCloseBtn").addEventListener("click", () => {
      modal.style.display = "none";
    });
    modal.querySelector("#errorLogCopyBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(JSON.stringify(window._errorLog, null, 2)).then(() => manekiToastExport("\u{1F4CB} Log copiado al portapapeles", "ok")).catch(() => manekiToastExport("\u274C No se pudo copiar", "err"));
    });
    modal.querySelector("#errorLogClearBtn").addEventListener("click", () => {
      window._errorLog = [];
      _renderErrorLog();
      manekiToastExport("\u{1F5D1}\uFE0F Log limpiado", "info");
    });
    modal.addEventListener("mousedown", function(e) {
      if (e.target === modal) modal.style.display = "none";
    });
  }
  function _renderErrorLog() {
    const lista = document.getElementById("errorLogLista");
    const countEl = document.getElementById("errorLogCount");
    if (!lista) return;
    const log = window._errorLog || [];
    if (countEl) {
      countEl.textContent = log.length;
      countEl.style.display = log.length ? "inline" : "none";
    }
    if (!log.length) {
      lista.innerHTML = '<div style="padding:40px; text-align:center; color:#6b7280; font-size:14px">\u2705 No hay errores registrados</div>';
      return;
    }
    lista.innerHTML = log.map((entry, i) => {
      const ts = entry.ts ? entry.ts.replace("T", " ").split(".")[0] : "\u2014";
      const tipoBadge = entry.tipo === "error" ? '<span style="background:#ef4444; color:white; border-radius:4px; padding:1px 6px; font-size:10px">ERROR</span>' : '<span style="background:#f59e0b; color:white; border-radius:4px; padding:1px 6px; font-size:10px">PROMISE</span>';
      const srcInfo = entry.src ? `${entry.src}:${entry.line || "?"}` : "";
      const stackHtml = entry.stack ? `<pre style="margin:6px 0 0; padding:8px; background:#111; border-radius:4px; font-size:10px; color:#9ca3af; overflow-x:auto; white-space:pre-wrap; word-break:break-all">${_esc(entry.stack)}</pre>` : "";
      return `<div style="margin-bottom:10px; padding:10px 12px; background:#252526; border-radius:8px; border-left:3px solid ${entry.tipo === "error" ? "#ef4444" : "#f59e0b"}">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap">
                <span style="color:#6b7280; font-size:10px">${_esc(ts)}</span>
                ${tipoBadge}
                ${srcInfo ? `<span style="color:#4ec9b0; font-size:10px">${_esc(srcInfo)}</span>` : ""}
            </div>
            <div style="color:#ce9178; font-size:12px; word-break:break-word">${_esc(String(entry.msg || ""))}</div>
            ${stackHtml}
        </div>`;
    }).join("");
  }
  function _abrirErrorLog() {
    const modal = document.getElementById("errorLogModal");
    if (!modal) {
      initErrorLog();
    }
    const m = document.getElementById("errorLogModal");
    if (!m) return;
    m.style.display = "flex";
    _renderErrorLog();
  }
  (function _initMejoras() {
    function _run() {
      initBusquedaGlobal();
      initErrorLog();
      initResponsive();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", _run);
    } else {
      _run();
    }
  })();
  function _actualizarBottomNavActivo(seccion) {
    const mapSection = { dashboard: 0, pedidos: 1, inventory: 2, balance: 3 };
    document.querySelectorAll("#mobileBottomNav button").forEach((btn, i) => {
      btn.style.color = i === mapSection[seccion] ? "#C9933A" : "#6b7280";
    });
  }
  window._actualizarBottomNavActivo = _actualizarBottomNavActivo;
  window._dispositivoActual = "desktop";
  function detectarDispositivo() {
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  }
  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains("sidebar-open");
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
  function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.add("sidebar-open");
    if (overlay) overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar) sidebar.classList.remove("sidebar-open");
    if (overlay) overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }
  window.toggleSidebar = toggleSidebar;
  window.openSidebar = openSidebar;
  window.closeSidebar = closeSidebar;
  function _aplicarModoDispositivo() {
    const dispositivo = detectarDispositivo();
    const anterior = window._dispositivoActual;
    window._dispositivoActual = dispositivo;
    document.body.classList.remove("device-desktop", "device-tablet", "device-mobile");
    document.body.classList.add("device-" + dispositivo);
    if (dispositivo === "mobile") {
      const pref = localStorage.getItem("maneki_compactMode");
      if (pref === null) {
        document.body.classList.add("compact-mode");
      } else if (pref === "1") {
        document.body.classList.add("compact-mode");
      }
    } else if (anterior === "mobile" && dispositivo !== "mobile") {
      const pref = localStorage.getItem("maneki_compactMode");
      if (!pref) document.body.classList.remove("compact-mode");
    }
    if (dispositivo === "desktop") {
      closeSidebar();
    }
    const mainEls = document.querySelectorAll(".ml-64, main, #mainContent, .main-content");
    mainEls.forEach((el) => {
      el.style.paddingTop = dispositivo !== "desktop" ? "56px" : "";
    });
    if (dispositivo === "desktop") {
      document.body.style.overflow = "";
    }
  }
  function initResponsive() {
    _aplicarModoDispositivo();
    let _resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(_aplicarModoDispositivo, 150);
    });
    const _origShowSection = window.showSection;
    if (typeof _origShowSection === "function") {
      window.showSection = function(...args) {
        if (window._dispositivoActual !== "desktop") closeSidebar();
        const result = _origShowSection.apply(this, args);
        if (args[0] && typeof _actualizarBottomNavActivo === "function") {
          _actualizarBottomNavActivo(args[0]);
        }
        return result;
      };
    }
    let _touchStartX = 0;
    document.addEventListener("touchstart", (e) => {
      _touchStartX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - _touchStartX;
      if (_touchStartX < 30 && dx > 60) {
        openSidebar();
        return;
      }
      if (dx < -60) {
        const enKanban = e.target.closest('#vistaKanban, .kanban-board, [class*="kanban"]');
        if (!enKanban) closeSidebar();
      }
    }, { passive: true });
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("#mobileBottomNav button");
      if (!btn) return;
      document.querySelectorAll("#mobileBottomNav button").forEach((b) => {
        b.style.color = "#6b7280";
      });
      btn.style.color = "#C9933A";
    });
  }
  function manekiUndoToast(msg, undoFn, duracion) {
    duracion = duracion || 6e3;
    let container = document.getElementById("mk-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "mk-toast-container";
      container.className = "mk-toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "mk-toast warn";
    toast.style.cursor = "default";
    const _id = "undo_" + Date.now();
    toast.innerHTML = `
        <div class="mk-toast-icon">\u21A9</div>
        <div class="mk-toast-body" style="flex:1">
            <div class="mk-toast-msg">${msg}</div>
        </div>
        <button id="${_id}" style="background:#C5A572;color:white;border:none;border-radius:8px;padding:6px 16px;font-weight:700;font-size:.82rem;cursor:pointer;white-space:nowrap;">Deshacer</button>
        <div class="mk-toast-progress" style="animation-duration:${duracion}ms"></div>`;
    container.appendChild(toast);
    let _undone = false;
    toast.querySelector("#" + _id).addEventListener("click", (e) => {
      e.stopPropagation();
      if (_undone) return;
      _undone = true;
      if (typeof undoFn === "function") undoFn();
      dismissToast(toast);
      manekiToastExport("\u2705 Acci\xF3n revertida", "ok");
    });
    const timer = setTimeout(() => {
      if (!_undone) dismissToast(toast);
    }, duracion);
    toast._timer = timer;
  }
  window.manekiUndoToast = manekiUndoToast;
  (function _loadingSkeleton() {
    const style = document.createElement("style");
    style.textContent = `
@keyframes mkShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.mk-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:800px 100%;animation:mkShimmer 1.5s infinite;border-radius:8px;min-height:20px}
#mk-loading-overlay{position:fixed;inset:0;background:rgba(250,248,245,0.97);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;transition:opacity .4s}
#mk-loading-overlay.fade-out{opacity:0;pointer-events:none}
.mk-loading-spinner{width:44px;height:44px;border:3.5px solid #e5e7eb;border-top-color:#C5A572;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
    const overlay = document.createElement("div");
    overlay.id = "mk-loading-overlay";
    overlay.innerHTML = `
        <img src="logo.png" alt="" style="height:64px;object-fit:contain;opacity:.85" onerror="this.style.display='none'">
        <div class="mk-loading-spinner"></div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#9ca3af;font-weight:500" id="mk-loading-text">Cargando Maneki Store...</p>`;
    if (document.body) document.body.appendChild(overlay);
    else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(overlay));
    function _dismiss() {
      const el = document.getElementById("mk-loading-overlay");
      if (!el) return;
      el.classList.add("fade-out");
      setTimeout(() => el.remove(), 500);
    }
    const _check = setInterval(() => {
      if (window._dbReady !== void 0 && (window.products || []).length >= 0 && typeof window.updateDashboard === "function") {
        clearInterval(_check);
        _dismiss();
      }
    }, 200);
    setTimeout(() => {
      clearInterval(_check);
      _dismiss();
    }, 5e3);
  })();
  (function _offlineBanner() {
    const style = document.createElement("style");
    style.textContent = `
#mk-offline-banner{position:fixed;top:0;left:0;right:0;z-index:10001;background:linear-gradient(135deg,#dc2626,#b91c1c);color:white;text-align:center;padding:8px 16px;font-size:.82rem;font-weight:600;transform:translateY(-100%);transition:transform .3s ease;display:flex;align-items:center;justify-content:center;gap:8px}
#mk-offline-banner.visible{transform:translateY(0)}
#mk-offline-banner .pulse{width:8px;height:8px;background:#fca5a5;border-radius:50%;animation:offPulse 1.5s infinite}
@keyframes offPulse{0%,100%{opacity:1}50%{opacity:.3}}`;
    document.head.appendChild(style);
    const banner = document.createElement("div");
    banner.id = "mk-offline-banner";
    banner.innerHTML = '<span class="pulse"></span> Sin conexi\xF3n a internet \u2014 los cambios se guardan localmente y se sincronizar\xE1n al reconectarse';
    if (document.body) document.body.appendChild(banner);
    else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(banner));
    function _update() {
      const el = document.getElementById("mk-offline-banner");
      if (!el) return;
      if (!navigator.onLine) el.classList.add("visible");
      else el.classList.remove("visible");
    }
    window.addEventListener("online", () => {
      _update();
      manekiToastExport("\u{1F310} Conexi\xF3n restaurada \u2014 sincronizando...", "ok");
      if (typeof sincronizarPendientes === "function") setTimeout(sincronizarPendientes, 500);
    });
    window.addEventListener("offline", _update);
    _update();
  })();
})();
//# sourceMappingURL=ui-extras.js.map
