var _ = (() => {
  async function guardarMateriaPrima() {
    const gv = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    const nombre = gv("mpNombre").trim();
    const stock = parseInt(gv("mpStock")) || 0;
    const stockMin = parseInt(gv("mpStockMin")) || 5;
    const sku = gv("mpSku").trim();
    const prov = gv("mpProveedor").trim();
    const provUrl = gv("mpProveedorUrl").trim();
    const unidad = gv("mpUnidad") || "pza";
    const notas = gv("mpNotas").trim();
    const usaPaquete = document.getElementById("mpUsaPaquete")?.checked || false;
    const paqueteCantidad = parseFloat(gv("mpPaqueteCantidad")) || 0;
    const paquetePrecio = parseFloat(gv("mpPaquetePrecio")) || 0;
    let costo = 0;
    if (usaPaquete) {
      if (paqueteCantidad <= 0 || paquetePrecio <= 0) {
        manekiToastExport("\u26A0\uFE0F Ingresa la cantidad y precio del paquete", "warn");
        return;
      }
      costo = paquetePrecio / paqueteCantidad;
    } else {
      costo = parseFloat(gv("mpCosto")) || 0;
    }
    if (!nombre) {
      manekiToastExport("\u26A0\uFE0F El nombre es requerido", "warn");
      return;
    }
    if (costo <= 0) {
      manekiToastExport("\u26A0\uFE0F El costo debe ser mayor a 0", "warn");
      return;
    }
    const _excludeIdMp = window.modoEdicion ? window.edicionProductoId : null;
    const _nombreDupMp = (window.products || []).find(
      (p) => p.name.trim().toLowerCase() === nombre.toLowerCase() && String(p.id) !== String(_excludeIdMp)
    );
    if (_nombreDupMp) {
      manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${_nombreDupMp.name}". Usa un nombre diferente o edita el existente.`, "warn");
      return;
    }
    if (sku && !skuEsUnico(sku, _excludeIdMp)) {
      manekiToastExport(`\u26A0\uFE0F El SKU "${sku}" ya est\xE1 en uso`, "warn");
      return;
    }
    if (window.currentProductImageFile) {
      manekiToastExport("\u23F3 Subiendo imagen...", "ok");
      const uploaded = await subirImagenStorage(window.currentProductImageFile).catch(() => null);
      if (uploaded) {
        window.currentProductImage = uploaded;
      } else {
        manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen. Intenta de nuevo.", "warn");
      }
      window.currentProductImageFile = null;
    }
    const esEmpaque = document.getElementById("mpEsEmpaque")?.checked || false;
    const tags = [...window._mpTagsActuales || []];
    const _skuRandom = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().split("-")[0].toUpperCase() : Math.random().toString(36).slice(2, 7).toUpperCase();
    const finalSku = sku || "MP-" + _skuRandom;
    const usaVariantes = document.getElementById("mpUsaVariantes")?.checked || false;
    const variantesGuardar = usaVariantes ? [...window._mpVariantes || []] : [];
    const stockFinal = usaVariantes ? variantesGuardar.reduce((s, v) => s + (parseInt(v.qty) || 0), 0) : stock;
    if (window.modoEdicion && window.edicionProductoId !== null) {
      const idx = (window.products || []).findIndex((x) => String(x.id) === String(window.edicionProductoId));
      if (idx === -1) {
        manekiToastExport("Error: producto no encontrado", "err");
        return;
      }
      const stOld = window.products[idx].stock;
      const costoViejo = window.products[idx].cost || 0;
      const historialCostos = [...window.products[idx].historialCostos || []];
      if (costo !== costoViejo) {
        historialCostos.push({ fecha: (/* @__PURE__ */ new Date()).toISOString(), costoAntes: costoViejo, costoNuevo: costo });
      }
      window.products[idx] = Object.assign({}, window.products[idx], {
        name: nombre,
        tipo: "materia_prima",
        cost: costo,
        price: 0,
        stock: stockFinal,
        stockMin,
        sku: finalSku,
        tags,
        proveedor: prov,
        proveedorUrl: provUrl,
        unidad,
        notas,
        imageUrl: window.currentProductImage || window.products[idx].imageUrl,
        compraPaquete: usaPaquete ? { cantidad: paqueteCantidad, precio: paquetePrecio } : null,
        variants: variantesGuardar,
        usaVariantes,
        historialCostos,
        esEmpaque
      });
      if (stockFinal !== stOld) registrarMovimiento({
        productoId: window.edicionProductoId,
        productoNombre: nombre,
        tipo: "ajuste",
        cantidad: stockFinal - stOld,
        motivo: "Edici\xF3n",
        stockAntes: stOld,
        stockDespues: stockFinal
      });
      if (costo !== costoViejo) _cascadeCostMP(window.edicionProductoId, costo);
      if (usaVariantes && variantesGuardar.length > 0) _cascadeVariantesMP(window.edicionProductoId, variantesGuardar);
      saveProducts();
      renderInventoryTable();
      if (typeof updateDashboard === "function") updateDashboard();
      closeMateriaPrimaModal();
      if (window.MKS) MKS.notify();
      manekiToastExport("\u2705 Materia prima actualizada", "ok");
    } else {
      const np = {
        id: _genId(),
        name: nombre,
        tipo: "materia_prima",
        category: "materiales",
        cost: costo,
        price: 0,
        stock: stockFinal,
        stockMin,
        sku: finalSku,
        tags,
        proveedor: prov,
        proveedorUrl: provUrl,
        unidad,
        notas,
        image: "\u{1F3ED}",
        imageUrl: window.currentProductImage || null,
        variants: variantesGuardar,
        usaVariantes,
        compraPaquete: usaPaquete ? { cantidad: paqueteCantidad, precio: paquetePrecio } : null,
        esEmpaque
      };
      window.products.unshift(np);
      window._invCurrentPage = 1;
      if (stockFinal > 0) registrarMovimiento({
        productoId: np.id,
        productoNombre: np.name,
        tipo: "creacion",
        cantidad: stockFinal,
        motivo: "Alta de materia prima",
        stockAntes: 0,
        stockDespues: stockFinal
      });
      saveProducts();
      renderInventoryTable();
      if (typeof updateDashboard === "function") updateDashboard();
      closeMateriaPrimaModal();
      if (window.MKS) MKS.notify();
      manekiToastExport("\u2705 Materia prima agregada", "ok");
    }
  }
  window.guardarMateriaPrima = guardarMateriaPrima;
  function _cascadeCostMP(mpId, nuevoCosto) {
    const actualizados = [];
    (window.products || []).forEach((p) => {
      if (p.tipo === "materia_prima" || p.tipo === "servicio") return;
      if (!Array.isArray(p.mpComponentes) || !p.mpComponentes.length) return;
      const comp = p.mpComponentes.find((c) => String(c.id) === String(mpId));
      if (!comp) return;
      const costoAntes = p.cost || 0;
      comp.costUnit = nuevoCosto;
      const nuevoCostoTotal = p.mpComponentes.reduce((s, c) => s + (c.costUnit || 0) * (c.qty || 1), 0);
      p.cost = Math.round(nuevoCostoTotal * 100) / 100;
      if (!p.historialPrecios) p.historialPrecios = [];
      p.historialPrecios.push({ fecha: (/* @__PURE__ */ new Date()).toISOString(), costoAntes, costoNuevo: p.cost, precioAntes: p.price, precioNuevo: p.price });
      actualizados.push(p.name);
    });
    if (actualizados.length)
      manekiToastExport(`\u{1F4B0} Costo recalculado en: ${actualizados.join(", ")}`, "ok");
    const ptActualizados = (window.products || []).filter((p) => (p.mpComponentes || []).some((c) => String(c.id) === String(mpId)));
    const ptIds = new Set(ptActualizados.map((p) => String(p.id)));
    const pedidosAfectados = (window.pedidos || []).filter(
      (p) => !["cancelado", "finalizado"].includes(p.status || "") && (p.productosInventario || []).some((item) => ptIds.has(String(item.id)))
    );
    if (pedidosAfectados.length > 0) {
      const folios = pedidosAfectados.map((p) => p.folio || p.id).join(", ");
      manekiToastExport(
        `\u{1F4A1} ${pedidosAfectados.length} pedido(s) activo(s) usan productos afectados por este cambio de costo (${folios}). Revisa sus precios.`,
        "warn"
      );
    }
  }
  window._cascadeCostMP = _cascadeCostMP;
  function _cascadeVariantesMP(mpId, variants) {
    if (!Array.isArray(variants) || !variants.length) return;
    const actualizados = [];
    (window.products || []).forEach((p) => {
      if (p.tipo === "materia_prima" || p.tipo === "servicio") return;
      if (!Array.isArray(p.mpComponentes) || !p.mpComponentes.length) return;
      if (!p.mpComponentes.some((c) => String(c.id) === String(mpId))) return;
      p.variants = variants.map((mpV) => {
        const prev = (p.variants || []).find(
          (pV) => (pV.type || pV.tipo) === (mpV.type || mpV.tipo) && (pV.value || pV.valor) === (mpV.value || mpV.valor)
        );
        return prev ? { ...mpV, qty: prev.qty ?? mpV.qty } : { ...mpV };
      });
      p.usaVariantes = true;
      actualizados.push(p.name);
    });
    if (actualizados.length)
      manekiToastExport(`\u{1F3A8} Variantes sincronizadas en: ${actualizados.join(", ")}`, "ok");
  }
  window._cascadeVariantesMP = _cascadeVariantesMP;
  function editProduct(id) {
    const p = (window.products || []).find((x) => String(x.id) === String(id));
    if (!p) {
      console.warn("editProduct: no encontrado", id);
      return;
    }
    if (p.tipo === "materia_prima") {
      injectMpModal();
      window.modoEdicion = true;
      window.edicionProductoId = id;
      window.currentProductImage = p.imageUrl || null;
      window.currentProductImageFile = null;
      window._mpTagsActuales = [...p.tags || []];
      setTimeout(() => {
        const form = document.getElementById("mpForm");
        if (form) form.reset();
        const set = (elId, v) => {
          const el = document.getElementById(elId);
          if (el) el.value = v ?? "";
        };
        set("mpNombre", p.name);
        set("mpSku", p.sku || "");
        set("mpStock", p.stock || 0);
        set("mpStockMin", p.stockMin || 5);
        set("mpProveedor", p.proveedor || "");
        set("mpProveedorUrl", p.proveedorUrl || "");
        set("mpNotas", p.notas || "");
        setTimeout(() => {
          const su = document.getElementById("mpUnidad");
          if (su) su.value = p.unidad || "pza";
        }, 10);
        const paqChk = document.getElementById("mpUsaPaquete");
        if (p.compraPaquete && p.compraPaquete.cantidad > 0) {
          if (paqChk) {
            paqChk.checked = true;
            mpTogglePaquete();
          }
          set("mpPaqueteCantidad", p.compraPaquete.cantidad);
          set("mpPaquetePrecio", p.compraPaquete.precio);
          mpCalcCostoUnidad();
        } else {
          if (paqChk) {
            paqChk.checked = false;
            mpTogglePaquete();
          }
          set("mpCosto", p.cost || 0);
        }
        if (p.usaVariantes && Array.isArray(p.variants) && p.variants.length > 0) {
          window._mpVariantes = [...p.variants];
          const chk = document.getElementById("mpUsaVariantes");
          if (chk) {
            chk.checked = true;
            mpToggleVariantes();
          }
          renderVariantesMp();
        } else {
          _resetMpVariantesUI();
          set("mpStock", p.stock || 0);
        }
        const preImg = document.getElementById("mpPreviewImg");
        const preDiv = document.getElementById("mpImagePreview");
        if (p.imageUrl && preImg) {
          preImg.src = p.imageUrl;
          if (preDiv) preDiv.classList.remove("hidden");
        } else if (preDiv) preDiv.classList.add("hidden");
        const chkEmpaque = document.getElementById("mpEsEmpaque");
        if (chkEmpaque) chkEmpaque.checked = !!p.esEmpaque;
        renderMpTags();
        const title = document.querySelector("#mpModal h3");
        if (title) title.textContent = "\u{1F3ED} Editar Materia Prima";
        const btn = document.getElementById("mpSubmitBtn");
        if (btn) btn.textContent = "\u{1F4BE} Guardar Cambios";
        if (typeof openModal === "function") openModal("mpModal");
      }, 150);
    } else if (p.tipo === "producto_variable") {
      if (typeof injectVariableProductModal === "function") injectVariableProductModal();
      if (typeof openVariableProductModal === "function") openVariableProductModal(id);
    } else {
      injectPtModal();
      window.modoEdicion = true;
      window.edicionProductoId = id;
      window._ptVariants = Array.isArray(p.variants) ? [...p.variants] : [];
      window._ptMpComponentes = Array.isArray(p.mpComponentes) ? [...p.mpComponentes] : [];
      window._ptTagsActuales = [...p.tags || []];
      window.currentVariants = [...window._ptVariants];
      window.currentProductImage = p.imageUrl || null;
      window.currentProductImageFile = null;
      window._ptGaleriaUrls = Array.isArray(p.imageUrls) ? [...p.imageUrls] : [];
      window._ptGaleriaFiles = [];
      setTimeout(() => {
        const set = (eid, v) => {
          const el = document.getElementById(eid);
          if (el) el.value = v ?? "";
        };
        set("ptNombre", p.name);
        set("ptSku", p.sku || "");
        set("ptCosto", p.cost || 0);
        set("ptPrecio", p.price || 0);
        set("ptStockMin", p.stockMin ?? 5);
        set("ptRendimientoPorHoja", p.rendimientoPorHoja || "");
        setTimeout(() => {
          set("ptProveedorNombre", p.proveedorNombre || "");
          set("ptProveedorNotas", p.proveedorNotas || "");
        }, 200);
        poblarCategoriasPt();
        setTimeout(() => {
          const s = document.getElementById("ptCategory");
          if (s) s.value = p.category;
        }, 80);
        if (p.imageUrl) {
          const img = document.getElementById("ptPreviewImg");
          const pre = document.getElementById("ptImagePreview");
          if (img) img.src = p.imageUrl;
          if (pre) pre.classList.remove("hidden");
        }
        ptRenderGaleria();
        renderTagsPt();
        renderVariantsListPt();
        renderPtMpList();
        recalcularCostoPt();
        ptMostrarMargenInfo();
        const chk = document.getElementById("ptPublicarTienda");
        const track = document.getElementById("ptToggleTrack");
        const thumb = document.getElementById("ptToggleThumb");
        if (chk) {
          chk.checked = p.publicarTienda === true || p.tipo === "producto";
          if (track) track.style.background = chk.checked ? "#10b981" : "#d1d5db";
          if (thumb) thumb.style.transform = chk.checked ? "translateX(22px)" : "translateX(0)";
        }
        const title = document.querySelector("#ptModal h3");
        if (title) title.textContent = "\u270F\uFE0F Editar Producto Terminado";
        const btn = document.getElementById("ptSubmitBtn");
        if (btn) btn.textContent = "\u{1F4BE} Guardar Cambios";
      }, 120);
      if (typeof openModal === "function") openModal("ptModal");
    }
  }
  window.editProduct = editProduct;
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
      try {
        const oldRaw = localStorage.getItem("mkStockMovements");
        if (oldRaw) {
          const oldMovs = JSON.parse(oldRaw);
          if (Array.isArray(oldMovs) && oldMovs.length > 0) {
            if (!window.stockMovements || window.stockMovements.length === 0) {
              window.stockMovements = oldMovs;
              window.stockMovimientos = oldMovs;
              saveStockMovements();
              console.log("[Migraci\xF3n] stockMovements: " + oldMovs.length + " movimientos migrados a SQLite/Supabase.");
            }
            localStorage.removeItem("mkStockMovements");
          }
        }
      } catch (e) {
        console.warn("[Migraci\xF3n] Error migrando stockMovements:", e);
      }
    }, 3e3);
    injectMpModal();
    injectPtModal();
    setupImageUpload();
    const filterIds = ["inventorySearch", "inventoryTagFilter", "inventoryTipoFilter", "inventoryProveedorFilter"];
    filterIds.forEach((id) => {
      function attachFilter() {
        const el = document.getElementById(id);
        if (el && !el._invPagListenerAdded) {
          el.addEventListener("input", () => {
            window._invCurrentPage = 1;
            renderInventoryTable();
          });
          el.addEventListener("change", () => {
            window._invCurrentPage = 1;
            renderInventoryTable();
          });
          el._invPagListenerAdded = true;
        }
      }
      attachFilter();
      setTimeout(attachFilter, 800);
      setTimeout(attachFilter, 2e3);
    });
    setTimeout(patchInventoryButtons, 400);
    setTimeout(patchInventoryButtons, 1500);
    const _invSection = document.getElementById("inventorySection") || document.querySelector('section[id*="inventor"]') || document.querySelector('[data-section="inventory"]');
    if (_invSection) {
      const _observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.attributeName === "class" || m.attributeName === "style") {
            const el = m.target;
            const isVisible = !el.classList.contains("hidden") && el.style.display !== "none" && el.offsetParent !== null;
            if (isVisible) setTimeout(patchInventoryButtons, 80);
          }
        }
      });
      _observer.observe(_invSection, { attributes: true });
    }
    const legacyForm = document.getElementById("addProductForm");
    if (legacyForm && !legacyForm._mkSubmitBound) {
      legacyForm._mkSubmitBound = true;
      legacyForm.addEventListener("submit", function(e) {
        e.preventDefault();
        openAddProductModal();
      });
    }
  });
  function patchInventoryButtons() {
    const btn = document.querySelector('[onclick="openAddProductModal()"]');
    if (!btn) return;
    const parent = btn.parentElement;
    btn.innerHTML = "\u{1F4E6} Producto Terminado";
    btn.title = "Agregar producto terminado";
    const iconFixes = [
      { selector: '[onclick="toggleMovimientos()"]', html: "\u{1F550} Movimientos" },
      { selector: '[onclick="imprimirInventario()"]', html: "\u{1F5A8}\uFE0F Imprimir" },
      { selector: `[onclick="manekiExportar('inventario')"]`, html: "\u{1F4CA} Exportar Excel" }
    ];
    iconFixes.forEach(({ selector, html }) => {
      const el = document.querySelector(selector);
      if (el) el.innerHTML = html;
    });
    if (!parent.querySelector("[data-mp-btn]")) {
      const mpBtn = document.createElement("button");
      mpBtn.setAttribute("data-mp-btn", "1");
      mpBtn.onclick = () => {
        injectMpModal();
        openAddMateriaPrimaModal();
      };
      mpBtn.className = "px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2";
      mpBtn.style.cssText = "background:linear-gradient(135deg,#7c3aed,#a855f7);";
      mpBtn.innerHTML = "\u{1F9EA} Materia Prima";
      mpBtn.title = "Agregar materia prima";
      parent.insertBefore(mpBtn, btn);
    }
  }
  window.patchInventoryButtons = patchInventoryButtons;
  function ajustarStock(id) {
    const p = (window.products || []).find((x) => String(x.id) === String(id));
    if (!p) return;
    window._ajustarStockId = String(id);
    window.__ajustarStockIdBackup = String(id);
    const n = document.getElementById("ajustarStockNombre");
    const a = document.getElementById("ajustarStockActual");
    const c = document.getElementById("ajustarStockCantidad");
    const m = document.getElementById("ajustarStockMotivo");
    if (n) n.textContent = p.name;
    if (a) a.textContent = getStockEfectivo(p);
    if (c) {
      c.value = "";
      setTimeout(() => c.focus && c.focus(), 250);
    }
    if (m) m.value = "";
    const prEl = document.getElementById("ajusteStockPuntoReorden");
    if (prEl) prEl.value = p.puntoReorden != null ? p.puntoReorden : "";
    const modal = document.getElementById("ajustarStockModal");
    if (modal) modal.dataset.productId = String(id);
    _inyectarCamposAjusteStock(modal);
    _renderUltimosMovimientosProducto(id, modal);
    _renderSugerenciaReorden(p, modal);
    if (typeof openModal === "function") openModal("ajustarStockModal");
  }
  window.ajustarStock = ajustarStock;
  function _inyectarCamposAjusteStock(modal) {
    if (!modal || modal.querySelector("#ajusteStockMotivoSelect")) return;
    const spaceY = modal.querySelector(".space-y-3");
    if (!spaceY) return;
    const prDiv = spaceY.querySelector("#ajusteStockPuntoReorden")?.parentElement;
    const motivoDiv = document.createElement("div");
    motivoDiv.id = "_ajusteStockExtraFields";
    motivoDiv.innerHTML = `
        <div style="margin-top:10px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Motivo del ajuste</label>
            <select id="ajusteStockMotivoSelect"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;background:#fff;cursor:pointer;">
                <option value="">\u2014 Selecciona un motivo \u2014</option>
                <option value="Merma">Merma</option>
                <option value="Muestra/Regalo">Muestra / Regalo</option>
                <option value="Ajuste de conteo">Ajuste de conteo</option>
                <option value="Devoluci\xF3n a proveedor">Devoluci\xF3n a proveedor</option>
                <option value="Entrada de mercanc\xEDa">Entrada de mercanc\xEDa</option>
                <option value="Otro">Otro</option>
            </select>
        </div>
        <div style="margin-top:8px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Notas adicionales <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
            <input type="text" id="ajusteStockNotasExtra" placeholder="Ej: Lote da\xF1ado por humedad"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;">
        </div>`;
    if (prDiv) {
      spaceY.insertBefore(motivoDiv, prDiv);
    } else {
      spaceY.appendChild(motivoDiv);
    }
  }
  window._inyectarCamposAjusteStock = _inyectarCamposAjusteStock;
  function _renderUltimosMovimientosProducto(productoId, modal) {
    if (!modal) return;
    const existente = modal.querySelector("#_ajusteUltMovimientos");
    if (!existente) {
      const inner = modal.querySelector(".bg-white");
      if (!inner) return;
      const div = document.createElement("div");
      div.id = "_ajusteUltMovimientos";
      div.style.cssText = "margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;";
      inner.appendChild(div);
    }
    const container = modal.querySelector("#_ajusteUltMovimientos");
    if (!container) return;
    const movs = (window.stockMovements || []).filter((m) => String(m.productoId) === String(productoId)).slice(0, 5);
    if (!movs.length) {
      container.innerHTML = `<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin movimientos registrados</p>`;
      return;
    }
    const icons = { entrada: "\u{1F7E2}", salida: "\u{1F534}", ajuste: "\u{1F7E1}", creacion: "\u{1F535}", venta: "\u{1F7E0}", merma: "\u{1F7E4}" };
    container.innerHTML = `
        <p style="font-size:.72rem;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">\xDAltimos movimientos</p>
        ${movs.map((m) => {
      const f = new Date(m.fecha).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
      const s = m.cantidad >= 0 ? `+${m.cantidad}` : `${m.cantidad}`;
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f9fafb;font-size:.75rem;">
                <span style="font-size:13px;">${icons[m.tipo] || "\u26AA"}</span>
                <div style="flex:1;min-width:0;">
                    <span style="font-weight:600;color:#374151;">${m.tipo}</span>
                    <span style="color:#9ca3af;margin-left:4px;">${_esc(m.motivo || "")}</span>
                    <div style="color:#9ca3af;font-size:.68rem;">${f}</div>
                </div>
                <span style="font-weight:700;color:${m.cantidad >= 0 ? "#10b981" : "#ef4444"};white-space:nowrap;">${s} uds</span>
            </div>`;
    }).join("")}`;
  }
  window._renderUltimosMovimientosProducto = _renderUltimosMovimientosProducto;
  function confirmarAjusteStock() {
    const modal = document.getElementById("ajustarStockModal");
    const rawId = modal && modal.dataset.productId || window._ajustarStockId || window.__ajustarStockIdBackup;
    if (!rawId) {
      manekiToastExport("\u274C Error: no se encontr\xF3 el producto", "err");
      return;
    }
    const p = (window.products || []).find((x) => String(x.id) === String(rawId));
    if (!p) {
      manekiToastExport("\u274C Error: producto no encontrado", "err");
      return;
    }
    const cantEl = document.getElementById("ajustarStockCantidad");
    const motEl = document.getElementById("ajustarStockMotivo");
    const motSelEl = document.getElementById("ajusteStockMotivoSelect");
    const notasEl = document.getElementById("ajusteStockNotasExtra");
    if (!cantEl) {
      manekiToastExport("\u274C Error: formulario no disponible", "err");
      return;
    }
    const delta = parseInt(cantEl.value);
    const motivoSelect = motSelEl ? motSelEl.value.trim() : "";
    const motivoTexto = motEl ? motEl.value.trim() : "";
    const motivo = motivoSelect || motivoTexto || "";
    const notas = notasEl ? notasEl.value.trim() : "";
    if (isNaN(delta) || cantEl.value.trim() === "") {
      manekiToastExport("\u26A0\uFE0F Ingresa una cantidad v\xE1lida (+para agregar / -para restar)", "warn");
      cantEl.focus && cantEl.focus();
      return;
    }
    const antes = getStockEfectivo(p);
    const _stockOriginal = parseInt(p.stock) || 0;
    p.stock = Math.max(0, _stockOriginal + delta);
    if (p.variants && p.variants.length > 0 && delta !== 0) {
      if (delta > 0) {
        p.variants[0].qty = (p.variants[0].qty || 0) + delta;
      } else {
        let restante = Math.abs(delta);
        for (const v of p.variants) {
          const quitar = Math.min(v.qty || 0, restante);
          v.qty = (v.qty || 0) - quitar;
          restante -= quitar;
          if (restante <= 0) break;
        }
      }
      syncStockFromVariants(p);
    }
    const despues = getStockEfectivo(p);
    registrarMovimiento({
      productoId: p.id,
      productoNombre: p.name,
      tipo: delta >= 0 ? "entrada" : "salida",
      cantidad: delta,
      motivo,
      stockAntes: antes,
      stockDespues: despues
    });
    window.movimientosStock = window.movimientosStock || [];
    const motivoEl = document.getElementById("ajusteStockMotivoSelect");
    const notasEl2 = document.getElementById("ajusteStockNotasExtra");
    const _mvEntry = {
      id: Date.now() + Math.random(),
      fecha: typeof _fechaHoy === "function" ? _fechaHoy() : (() => {
        const d = /* @__PURE__ */ new Date();
        return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
      })(),
      productoId: p.id,
      productoNombre: p.name || p.nombre,
      deltaStock: delta,
      stockResultante: despues,
      motivo: motivoEl ? motivoEl.value : motivo || "Ajuste manual",
      notas: notasEl2 ? notasEl2.value : notas,
      usuario: "local"
    };
    window.movimientosStock.unshift(_mvEntry);
    if (window.movimientosStock.length > 200) window.movimientosStock = window.movimientosStock.slice(0, 200);
    if (typeof sbSave === "function") sbSave("movimientosStock", window.movimientosStock);
    else if (typeof guardarDatos === "function") guardarDatos();
    const prEl = document.getElementById("ajusteStockPuntoReorden");
    if (prEl && prEl.value.trim() !== "") {
      const pr = parseInt(prEl.value);
      if (!isNaN(pr) && pr >= 0) p.puntoReorden = pr;
    }
    saveProducts();
    renderInventoryTable();
    if (typeof updateDashboard === "function") updateDashboard();
    if (typeof closeModal === "function") closeModal("ajustarStockModal");
    window._ajustarStockId = null;
    window.__ajustarStockIdBackup = null;
    if (modal) delete modal.dataset.productId;
    if (window.MKS) MKS.tick();
    manekiToastExport(`\u2705 Stock de "${p.name}": ${antes} \u2192 ${despues}`, "ok");
  }
  window.confirmarAjusteStock = confirmarAjusteStock;
  function closeAjustarStockModal() {
    if (typeof closeModal === "function") closeModal("ajustarStockModal");
    else {
      const m = document.getElementById("ajustarStockModal");
      if (m) m.style.display = "none";
    }
    window._ajustarStockId = null;
    window.__ajustarStockIdBackup = null;
    const modal = document.getElementById("ajustarStockModal");
    if (modal) delete modal.dataset.productId;
  }
  window.closeAjustarStockModal = closeAjustarStockModal;
  function _renderSugerenciaReorden(producto, modal) {
    if (!modal) return;
    let container = modal.querySelector("#_sugerenciaReorden");
    if (!container) {
      const inner = modal.querySelector(".bg-white") || modal.querySelector(".space-y-3")?.parentElement;
      if (!inner) return;
      container = document.createElement("div");
      container.id = "_sugerenciaReorden";
      container.style.cssText = "margin-top:12px;padding:10px 12px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;";
      inner.appendChild(container);
    }
    const ventas30d = (window.salesHistory || []).filter((s) => {
      if (!s.date || s.method === "Cancelado") return false;
      const hace30 = /* @__PURE__ */ new Date();
      hace30.setDate(hace30.getDate() - 30);
      const fStr = `${hace30.getFullYear()}-${String(hace30.getMonth() + 1).padStart(2, "0")}-${String(hace30.getDate()).padStart(2, "0")}`;
      return s.date >= fStr;
    });
    let unidadesVendidas = 0;
    ventas30d.forEach((s) => {
      (s.products || []).forEach((p) => {
        if (String(p.id) === String(producto.id) || (p.name || "").toLowerCase() === (producto.name || "").toLowerCase()) {
          unidadesVendidas += Number(p.quantity || 1);
        }
      });
    });
    const promDiario = unidadesVendidas / 30;
    const leadTimeDias = producto.leadTime || 7;
    const stockSeguridad = Math.ceil(promDiario * 3);
    const puntoReorden = Math.ceil(promDiario * leadTimeDias) + stockSeguridad;
    const cantidadSugerida = Math.max(0, Math.ceil(promDiario * 30) - (getStockEfectivo(producto) || 0));
    if (unidadesVendidas === 0) {
      container.innerHTML = `<p style="font-size:.75rem;color:#92400E;margin:0;">\u{1F4CA} Sin ventas en los \xFAltimos 30 d\xEDas \u2014 no hay datos para sugerir reorden.</p>`;
      return;
    }
    container.innerHTML = `
        <p style="font-size:.72rem;font-weight:800;color:#92400E;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;">\u{1F4CA} Sugerencia de reorden</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Venta promedio</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${promDiario.toFixed(1)}/d\xEDa</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Punto reorden sugerido</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${puntoReorden} uds</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Pedir ahora</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${cantidadSugerida > 0 ? cantidadSugerida + " uds" : "\u2705 OK"}</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Lead time</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${leadTimeDias}d
                    <button onclick="(function(){var v=prompt('D\xEDas que tarda tu proveedor en entregar:','${leadTimeDias}');if(v&&!isNaN(v)){var p=(window.products||[]).find(x=>String(x.id)==='${producto.id}');if(p){p.leadTime=parseInt(v);if(typeof saveProducts==='function')saveProducts();manekiToastExport('\u2705 Lead time guardado: '+v+' d\xEDas','ok');}}})()"
                       style="font-size:.6rem;background:none;border:none;cursor:pointer;color:#B45309;">\u270F\uFE0F</button>
                </p>
            </div>
        </div>`;
  }
  function aplicarMargen(margen) {
    if (!margen || isNaN(margen) || margen <= 0) {
      manekiToastExport("Margen inv\xE1lido", "err");
      return;
    }
    const costo = parseFloat(document.getElementById("productCost").value);
    if (!costo || costo <= 0) {
      manekiToastExport("Primero ingresa el costo", "warn");
      return;
    }
    const precio = costo / (1 - margen / 100);
    document.getElementById("productPrice").value = precio.toFixed(2);
    const lbl = document.getElementById("precioSugeridoLabel");
    if (lbl) lbl.textContent = `\u{1F4A1} Con ${margen}% de margen: costo $${costo.toFixed(2)} \u2192 precio $${precio.toFixed(2)} (ganancia $${(precio - costo).toFixed(2)})`;
  }
  window.aplicarMargen = aplicarMargen;
  function cambiarTipoProducto(id) {
    const p = (window.products || []).find((x) => String(x.id) === String(id));
    if (!p) return;
    const esMat = (p.tipo || "producto") === "materia_prima";
    const nuevoTipo = esMat ? "producto" : "materia_prima";
    const label = esMat ? "Producto Terminado \u{1F4E6}" : "Materia Prima \u{1F3ED}";
    if (!esMat) {
      const pedidosConEsteProducto = (window.pedidos || []).filter(
        (ped) => !["cancelado", "finalizado"].includes(ped.status || "") && (ped.productosInventario || []).some((item) => String(item.id) === String(id))
      );
      if (pedidosConEsteProducto.length > 0) {
        const folios = pedidosConEsteProducto.map((ped) => ped.folio || ped.id).join(", ");
        const forzar = confirm(`\u26A0\uFE0F "${p.name}" est\xE1 en ${pedidosConEsteProducto.length} pedido(s) activo(s):
${folios}

Convertirlo a Materia Prima puede romper esos pedidos. \xBFContinuar de todas formas?`);
        if (!forzar) return;
      }
    }
    showConfirm(
      `\xBFCambiar "${p.name}" a ${label}?

${esMat ? "Se habilitar\xE1 precio de venta y variantes." : "Se ocultar\xE1 precio de venta. Solo se usar\xE1 el costo."}`,
      `Convertir a ${label}`
    ).then((ok) => {
      if (!ok) return;
      p.tipo = nuevoTipo;
      if (nuevoTipo === "materia_prima") {
        p.price = 0;
        p.variants = [];
      } else {
        if (!p.price || p.price <= 0) p.price = (p.cost || 0) * 2;
      }
      saveProducts();
      renderInventoryTable();
      manekiToastExport(`\u2705 "${p.name}" ahora es ${label}`, "ok");
    });
  }
  window.cambiarTipoProducto = cambiarTipoProducto;
  function deleteProduct(id) {
    const p = (window.products || []).find((x) => String(x.id) === String(id));
    if (!p) return;
    const pedidosConEsteProducto = (window.pedidos || []).filter(
      (p2) => !["cancelado", "finalizado"].includes(p2.status || "") && (p2.productosInventario || []).some((item) => String(item.id) === String(id))
    );
    if (pedidosConEsteProducto.length > 0) {
      const folios = pedidosConEsteProducto.map((p2) => p2.folio || p2.id).join(", ");
      const forzar = confirm(`\u26A0\uFE0F Este producto est\xE1 en ${pedidosConEsteProducto.length} pedido(s) activo(s):
${folios}

Eliminar puede romper esos pedidos. \xBFContinuar de todas formas?`);
      if (!forzar) return;
    }
    const kits = (window.products || []).filter((k) => k.isKit && k.kitComponentes && k.kitComponentes.some((c) => String(c.id) === String(id)));
    const pedidosActivos = pedidosConEsteProducto;
    let msg = `\xBFEliminar "${p.name}"?`;
    if (p.stock > 0) msg += `

Tiene ${p.stock} unidades en stock.`;
    if (kits.length) msg += `

\u26A0\uFE0F Es componente de ${kits.length} kit(s): ${kits.map((k) => k.name).join(", ")}.`;
    if (pedidosActivos.length) msg += `

\u{1F6A8} Est\xE1 en ${pedidosActivos.length} pedido(s) activo(s): ${pedidosActivos.map((o) => o.folio || o.id).join(", ")}. Eliminar el producto puede afectar esos pedidos.`;
    msg += "\n\nEsta acci\xF3n no se puede deshacer.";
    showConfirm(msg, "\u{1F5D1}\uFE0F Eliminar producto permanentemente").then(async (ok) => {
      if (!ok) return;
      if (window.MKS) MKS.del();
      window.products = window.products.filter((x) => String(x.id) !== String(id));
      try {
        products = window.products;
      } catch (e) {
      }
      saveProducts();
      renderInventoryTable();
      if (typeof updateDashboard === "function") updateDashboard();
      try {
        await db.from("products").delete().eq("id", String(id));
      } catch (e) {
        console.warn("deleteProduct: no se pudo borrar de products:", e);
      }
      manekiToastExport(`\u{1F5D1}\uFE0F "${p.name}" eliminado`, "ok");
    });
  }
  window.deleteProduct = deleteProduct;
  function calcularDisponibilidadDesdeMP(product) {
    if (!product.mpComponentes || product.mpComponentes.length === 0) return null;
    const tieneMpFisica = product.mpComponentes.some((c) => {
      const p = (window.products || []).find((x) => String(x.id) === String(c.id));
      return !p || p.tipo !== "servicio";
    });
    if (!tieneMpFisica) return null;
    let minPiezas = Infinity;
    const detalle = [];
    for (const comp of product.mpComponentes) {
      const mp = (window.products || []).find((p) => String(p.id) === String(comp.id));
      if (mp && mp.tipo === "servicio") continue;
      if (!mp) {
        product._tieneComponentesHuerfanos = true;
        continue;
      }
      const stockMp = mp ? getStockEfectivo(mp) : 0;
      const qtyNecesaria = comp.qty || 1;
      const piezasPosibles = Math.floor(stockMp / qtyNecesaria);
      detalle.push({ nombre: comp.nombre || (mp ? mp.name : "?"), stock: stockMp, qty: qtyNecesaria, posibles: piezasPosibles });
      if (piezasPosibles < minPiezas) minPiezas = piezasPosibles;
    }
    return { piezas: minPiezas === Infinity ? 0 : minPiezas, detalle };
  }
  window.calcularDisponibilidadDesdeMP = calcularDisponibilidadDesdeMP;
})();
//# sourceMappingURL=inventory-4.js.map
