async function _eliminarFotoStorageAlFinalizar(pedido) {
  const { paths } = _fotosArray(pedido);
  if (!paths.length) return;
  try {
    await db.storage.from(FOTO_BUCKET).remove(paths);
  } catch (e) {
    console.warn("[Foto] No se pudo eliminar al finalizar:", e);
  }
}
function _descontarInventarioPedido(pedido) {
  const items = pedido.productosInventario || [];
  if (items.length === 0) return 0;
  let descontados = 0;
  const _rollback = [];
  try {
    for (const item of items) {
      const prod = (window.products || []).find((p) => String(p.id) === String(item.id));
      if (!prod) continue;
      if (prod.tipo === "servicio") continue;
      if (item.id === "libre") continue;
      const cantidad = item.quantity || item.cantidad || 1;
      if (!item.variante && item.variante !== 0) {
      }
      const _tieneMpComp = Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0;
      let _stockDisponible;
      if (prod.tipo === "producto_variable" && _tieneMpComp) {
        const _rph = prod.rendimientoPorHoja || 1;
        let _minHojas = Infinity;
        for (const comp of prod.mpComponentes) {
          const mp = (window.products || []).find((x) => String(x.id) === String(comp.id));
          if (mp && mp.tipo !== "servicio") {
            const qtyComp = parseFloat(comp.qty) || 1;
            _minHojas = Math.min(_minHojas, Math.floor((mp.stock || 0) / qtyComp));
          }
        }
        _stockDisponible = (_minHojas === Infinity ? 0 : _minHojas) * _rph;
      } else if (_tieneMpComp && Array.isArray(prod.variants) && prod.variants.length > 0) {
        const _stockVariantes = prod.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
        let _minFabricable = Infinity;
        for (const comp of prod.mpComponentes) {
          const mp = (window.products || []).find((x) => String(x.id) === String(comp.id));
          if (mp && mp.tipo !== "servicio") {
            const stockMp = mp.stock || 0;
            const qtyComp = parseFloat(comp.qty) || 1;
            _minFabricable = Math.min(_minFabricable, Math.floor(stockMp / qtyComp));
          }
        }
        _stockDisponible = _stockVariantes + (_minFabricable === Infinity ? 0 : _minFabricable);
      } else if (prod.tipo === "producto_variable") {
        _stockDisponible = parseInt(prod.stock) || 0;
      } else {
        _stockDisponible = typeof getStockEfectivo === "function" ? getStockEfectivo(prod) : prod.stock || 0;
      }
      if (_stockDisponible < cantidad) {
        console.warn(`[Inventario] Stock insuficiente para "${prod.name}": disponible=${_stockDisponible}, requerido=${cantidad} \u2014 se descuenta de todas formas`);
        manekiToastExport(`\u26A0\uFE0F Stock bajo de "${prod.name}" (disponible: ${_stockDisponible})`, "warn");
      }
      const antesPT = prod.stock || 0;
      _rollback.push({ id: prod.id, stockBefore: antesPT });
      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        if (item.variante) {
          const _colIdx = item.variante.indexOf(":");
          const _vType = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
          const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : "";
          const _ptVar = prod.variants.find(
            (v) => (v.type || v.tipo || "") === _vType && (v.value || v.valor || "") === _vValue
          );
          if (_ptVar) {
            _ptVar.qty = Math.max(0, (_ptVar.qty || 0) - cantidad);
          }
        } else {
          const _varMayor = prod.variants.slice().sort((a, b) => (parseInt(b.qty) || 0) - (parseInt(a.qty) || 0))[0];
          if (_varMayor) {
            _varMayor.qty = Math.max(0, (parseInt(_varMayor.qty) || 0) - cantidad);
          }
        }
        if (typeof syncStockFromVariants === "function") syncStockFromVariants(prod);
        else prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
      } else {
        prod.stock = Math.max(0, antesPT - cantidad);
      }
      if (typeof registrarMovimiento === "function") {
        registrarMovimiento({
          productoId: prod.id,
          productoNombre: prod.name,
          tipo: "salida",
          cantidad: -cantidad,
          motivo: `Producci\xF3n pedido ${pedido.folio}`,
          stockAntes: antesPT,
          stockDespues: prod.stock
        });
      }
      descontados++;
      if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0) {
        for (const comp of prod.mpComponentes) {
          const mp = (window.products || []).find((p) => String(p.id) === String(comp.id));
          if (!mp || mp.tipo === "servicio") continue;
          const _rph = prod.rendimientoPorHoja || 1;
          const cantMP = _rph > 0 ? Math.ceil(cantidad / _rph) * (parseFloat(comp.qty) || 1) : (parseFloat(comp.qty) || 1) * cantidad;
          const antesMP = mp.stock || 0;
          _rollback.push({ id: mp.id, stockBefore: antesMP });
          if (item.variante && Array.isArray(mp.variants) && mp.variants.length > 0) {
            const colonIdx = item.variante.indexOf(":");
            const varType = colonIdx !== -1 ? item.variante.slice(0, colonIdx).trim() : item.variante;
            const varValue = colonIdx !== -1 ? item.variante.slice(colonIdx + 1).trim() : "";
            const mpVar = mp.variants.find(
              (v) => (v.type || v.tipo || "") === varType && (v.value || v.valor || "") === varValue
            );
            if (mpVar) {
              mpVar.qty = Math.max(0, (mpVar.qty || 0) - cantMP);
            }
            if (typeof syncStockFromVariants === "function") {
              syncStockFromVariants(mp);
            } else {
              mp.stock = mp.variants.reduce((s, v) => s + (v.qty || 0), 0);
            }
          } else {
            mp.stock = Math.max(0, antesMP - cantMP);
          }
          if (typeof registrarMovimiento === "function") {
            registrarMovimiento({
              productoId: mp.id,
              productoNombre: mp.name,
              tipo: "salida",
              cantidad: -cantMP,
              motivo: `MP para ${prod.name}${item.variante ? ` (${item.variante})` : ""} \u2014 pedido ${pedido.folio}`,
              stockAntes: antesMP,
              stockDespues: mp.stock
            });
          }
        }
      }
    }
  } catch (e) {
    _rollback.forEach((r) => {
      const p = (window.products || []).find((x) => String(x.id) === String(r.id));
      if (p) p.stock = r.stockBefore;
    });
    console.error("[Inventario] Error al descontar \u2014 stock restaurado:", e);
    manekiToastExport("Error al descontar inventario. Se revirti\xF3 el stock.", "err");
    throw e;
  }
  if (descontados > 0 && typeof saveProducts === "function") saveProducts();
  return descontados;
}
function _esProductoEmpaque(mp) {
  return mp && (mp.esEmpaque || (mp.tags || []).some((t) => t.toLowerCase() === "empaques" || t.toLowerCase() === "empaque"));
}
function _descontarEmpaquesInventario(pedido) {
  const empaques = pedido.empaques || [];
  if (!empaques.length) return 0;
  let descontados = 0;
  for (const emp of empaques) {
    const mp = (window.products || []).find((p) => String(p.id) === String(emp.id));
    if (!_esProductoEmpaque(mp)) continue;
    const qty = emp.quantity || 1;
    const antes = mp.stock || 0;
    mp.stock = Math.max(0, antes - qty);
    if (typeof registrarMovimiento === "function") {
      registrarMovimiento({
        productoId: mp.id,
        productoNombre: mp.name,
        tipo: "salida",
        cantidad: -qty,
        motivo: `Empaque pedido ${pedido.folio}`,
        stockAntes: antes,
        stockDespues: mp.stock
      });
    }
    descontados++;
  }
  if (descontados > 0 && typeof saveProducts === "function") saveProducts();
  return descontados;
}
window._descontarEmpaquesInventario = _descontarEmpaquesInventario;
function _regresarEmpaquesInventario(pedido) {
  const empaques = pedido.empaques || [];
  if (!empaques.length) return;
  for (const emp of empaques) {
    const mp = (window.products || []).find((p) => String(p.id) === String(emp.id));
    if (!_esProductoEmpaque(mp)) continue;
    const qty = emp.quantity || 1;
    const antes = mp.stock || 0;
    mp.stock = antes + qty;
    if (typeof registrarMovimiento === "function") {
      registrarMovimiento({
        productoId: mp.id,
        productoNombre: mp.name,
        tipo: "entrada",
        cantidad: qty,
        motivo: `Devoluci\xF3n empaque cancelaci\xF3n ${pedido.folio}`,
        stockAntes: antes,
        stockDespues: mp.stock
      });
    }
  }
  if (typeof saveProducts === "function") saveProducts();
}
window._regresarEmpaquesInventario = _regresarEmpaquesInventario;
function _regresarInventarioPedido(pedido) {
  const items = pedido.productosInventario || [];
  if (items.length === 0) return;
  items.forEach((item) => {
    const prod = (window.products || []).find((p) => String(p.id) === String(item.id));
    if (!prod) return;
    if (prod.tipo === "servicio") return;
    const cantidad = item.quantity || item.cantidad || 1;
    const antes = prod.stock || 0;
    prod.stock = antes + cantidad;
    if (item.variante && Array.isArray(prod.variants) && prod.variants.length > 0) {
      const _colIdx = item.variante.indexOf(":");
      const _vType = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
      const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : "";
      const _ptVar = prod.variants.find(
        (v) => (v.type || v.tipo || "") === _vType && (v.value || v.valor || "") === _vValue
      );
      if (_ptVar) {
        _ptVar.qty = (_ptVar.qty || 0) + cantidad;
      }
      if (typeof syncStockFromVariants === "function") syncStockFromVariants(prod);
    }
    if (typeof registrarMovimiento === "function") {
      registrarMovimiento({
        productoId: prod.id,
        productoNombre: prod.name,
        tipo: "entrada",
        cantidad,
        motivo: `Cancelaci\xF3n pedido ${pedido.folio} (sin producir)`,
        stockAntes: antes,
        stockDespues: prod.stock
      });
    }
  });
  items.forEach((item) => {
    const prod = (window.products || []).find((p) => String(p.id) === String(item.id));
    const comps = prod && prod.mpComponentes ? prod.mpComponentes : [];
    const cantidad = item.quantity || item.cantidad || 1;
    comps.forEach((c) => {
      const mp = (window.products || []).find((p) => String(p.id) === String(c.id));
      if (!mp || mp.tipo === "servicio") return;
      const _rph = prod.rendimientoPorHoja || 0;
      const cantMP = _rph > 0 ? Math.ceil(cantidad / _rph) * (parseFloat(c.qty) || 1) : (parseFloat(c.qty) || 1) * cantidad;
      const antes = mp.stock || 0;
      mp.stock = antes + cantMP;
      if (typeof registrarMovimiento === "function") {
        registrarMovimiento({
          productoId: mp.id,
          productoNombre: mp.name,
          tipo: "entrada",
          cantidad: cantMP,
          motivo: `Devoluci\xF3n MP cancelaci\xF3n ${pedido.folio}`,
          stockAntes: antes,
          stockDespues: mp.stock
        });
      }
    });
  });
  if (typeof saveProducts === "function") saveProducts();
}
function _regresarInventarioCompleto(pedido) {
  const items = pedido.productosInventario || [];
  if (items.length === 0) return;
  items.forEach((item) => {
    const prod = (window.products || []).find((p) => String(p.id) === String(item.id));
    if (!prod || prod.tipo === "servicio") return;
    const cantidad = item.quantity || item.cantidad || 1;
    const antesPT = prod.stock || 0;
    prod.stock = antesPT + cantidad;
    if (typeof registrarMovimiento === "function") {
      registrarMovimiento({
        productoId: prod.id,
        productoNombre: prod.name,
        tipo: "entrada",
        cantidad,
        motivo: `Eliminaci\xF3n pedido ${pedido.folio}`,
        stockAntes: antesPT,
        stockDespues: prod.stock
      });
    }
    if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0) {
      prod.mpComponentes.forEach((comp) => {
        const mp = (window.products || []).find((p) => String(p.id) === String(comp.id));
        if (!mp || mp.tipo === "servicio") return;
        const rph = prod.rendimientoPorHoja || 1;
        const cantMP = Math.ceil(cantidad / rph) * (parseFloat(comp.qty) || 1);
        const antesMP = mp.stock || 0;
        if (item.variante && Array.isArray(mp.variants) && mp.variants.length > 0) {
          const colonIdx = item.variante.indexOf(":");
          const varType = colonIdx !== -1 ? item.variante.slice(0, colonIdx).trim() : item.variante;
          const varValue = colonIdx !== -1 ? item.variante.slice(colonIdx + 1).trim() : "";
          const mpVar = mp.variants.find(
            (v) => (v.type || v.tipo || "") === varType && (v.value || v.valor || "") === varValue
          );
          if (mpVar) {
            mpVar.qty = (mpVar.qty || 0) + cantMP;
          }
          if (typeof syncStockFromVariants === "function") {
            syncStockFromVariants(mp);
          } else {
            mp.stock = mp.variants.reduce((s, v) => s + (v.qty || 0), 0);
          }
        } else {
          mp.stock = antesMP + cantMP;
        }
        if (typeof registrarMovimiento === "function") {
          registrarMovimiento({
            productoId: mp.id,
            productoNombre: mp.name,
            tipo: "entrada",
            cantidad: cantMP,
            motivo: `MP devuelta \u2014 eliminaci\xF3n pedido ${pedido.folio}`,
            stockAntes: antesMP,
            stockDespues: mp.stock
          });
        }
      });
    }
  });
  if (typeof saveProducts === "function") saveProducts();
}
function openPedidoStatusModal(id) {
  const p = (window.pedidos || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  _pedidoStatusActualId = id;
  document.getElementById("pedidoStatusId").value = id;
  document.getElementById("pedidoStatusFolio").textContent = p.folio || "\u2014";
  let tlContainer = document.getElementById("pedidoStatusTimeline");
  if (!tlContainer) {
    const folioEl = document.getElementById("pedidoStatusFolio");
    if (folioEl) {
      tlContainer = document.createElement("div");
      tlContainer.id = "pedidoStatusTimeline";
      tlContainer.style.cssText = "margin:12px 0 4px;";
      folioEl.parentElement.insertAdjacentElement("afterend", tlContainer);
    }
  }
  if (tlContainer && typeof _mkTimeline === "function") {
    tlContainer.innerHTML = _mkTimeline(p.status || "confirmado");
  }
  openModal("pedidoStatusModal");
}
function closePedidoStatusModal() {
  closeModal("pedidoStatusModal");
}
function setPedidoStatus(status) {
  const id = document.getElementById("pedidoStatusId").value;
  const idx = (window.pedidos || []).findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return;
  if (status === "finalizado") {
    const _pedActual = window.pedidos[idx];
    const _totalActual = Number(_pedActual?.total || 0);
    const _confirMsg = _totalActual === 0 ? "\u26A0\uFE0F Este pedido tiene total $0.00. \xBFDeseas finalizarlo de todas formas sin precio registrado?" : "\xBFMarcar como finalizado? El pedido pasar\xE1 al historial.";
    const _confirTitle = _totalActual === 0 ? "\u26A0\uFE0F Pedido sin precio" : "\u{1F389} Finalizar";
    showConfirm(_confirMsg, _confirTitle).then((ok) => {
      if (!ok) return;
      if (!window.pedidosFinalizados) window.pedidosFinalizados = [];
      const p = {
        ...window.pedidos[idx],
        status: "finalizado",
        fechaFinalizado: (/* @__PURE__ */ new Date()).toISOString(),
        productosInventario: (window.pedidos[idx].productosInventario || []).map((i) => ({ ...i }))
      };
      _eliminarFotoStorageAlFinalizar(p);
      if (!p.total && (p.productosInventario || []).length > 0) {
        const _centsTotal = (p.productosInventario || []).reduce((s, it) => {
          const precio = parseFloat(it.price || it.precio || 0);
          const cant = parseInt(it.quantity || it.cantidad || 1, 10);
          return s + Math.round(precio * 100) * cant;
        }, 0);
        p.total = _centsTotal / 100;
        if (!p.costo) p.costo = p.total;
      }
      if ((p.productosInventario || []).length > 0 && !p.inventarioDescontado) {
        const _nDescont = _descontarInventarioPedido(p);
        if (_nDescont > 0) {
          p.inventarioDescontado = true;
          p._inventarioYaFinalizado = true;
        }
      }
      if ((p.empaques || []).length > 0 && !p.empaquesDescontados) {
        const _nEmp = _descontarEmpaquesInventario(p);
        if (_nEmp > 0) p.empaquesDescontados = true;
      }
      window.pedidosFinalizados.push(p);
      window.pedidos.splice(idx, 1);
      savePedidos();
      savePedidosFinalizados();
      if (!window.salesHistory) window.salesHistory = [];
      const yaRegistrado = window.salesHistory.some((s) => s.folio === p.folio && s.type === "pedido");
      if (!yaRegistrado && Number(p.total || 0) > 0) {
        const _saldoFinal = typeof calcSaldoPendiente === "function" ? calcSaldoPendiente(p) : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
        const saleRecord = {
          id: mkId(),
          type: "pedido",
          folio: p.folio,
          date: (p.fechaFinalizado || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0],
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          customer: p.cliente || "Cliente",
          concept: p.concepto || p.folio,
          products: (p.productosInventario || []).map((i) => ({
            id: i.id || i.productId || "",
            name: i.name || i.nombre || i.concepto || p.concepto || "\u2014",
            quantity: Number(i.quantity || i.cantidad || 1),
            price: Number(i.price || i.precio || 0),
            subtotal: Number(i.quantity || 1) * Number(i.price || i.precio || 0),
            cost: Number(i.cost || i.costo || 0)
          })),
          total: _saldoFinal,
          totalPedido: Number(p.total || 0),
          anticipo: Number(p.anticipo || 0),
          method: p.pagos && p.pagos.length > 0 ? p.pagos[p.pagos.length - 1].metodo || p.pagos[p.pagos.length - 1].method || "Efectivo" : p.metodoPago || p.metodo || "Efectivo",
          note: p.notas || ""
        };
        if (_saldoFinal > 0) {
          window.salesHistory.push(saleRecord);
          if (typeof saveSalesHistory === "function") saveSalesHistory();
        }
      }
      closePedidoStatusModal();
      renderPedidosTable();
      manekiToastExport("\u{1F389} Pedido finalizado: " + p.folio, "ok");
      if (typeof window.mkConfetti === "function") window.mkConfetti();
      if (typeof abrirRoiEquiposModal === "function") abrirRoiEquiposModal(p);
      if (p.cliente && window.clients) {
        const nombreNorm = p.cliente.toLowerCase().trim();
        const cli = window.clients.find(
          (c) => p.clienteId && String(c.id) === String(p.clienteId) || (c.name || "").toLowerCase().trim() === nombreNorm
        );
        if (cli) {
          cli.totalPurchases = (Number(cli.totalPurchases) || 0) + Number(p.total || 0);
          const fechaHoy = _fechaHoy();
          if (!cli.lastPurchase || fechaHoy > cli.lastPurchase) cli.lastPurchase = fechaHoy;
          if (!cli.isVIP && cli.totalPurchases >= 5e3) {
            cli.isVIP = true;
            cli.type = "vip";
            manekiToastExport(`\u2B50 ${cli.name} ascendido a VIP`, "ok");
          }
          if (typeof saveClients === "function") saveClients();
        }
      }
    });
  } else if (status === "cancelado") {
    const pedido = window.pedidos[idx];
    const tieneProductos = (pedido.productosInventario || []).length > 0;
    showConfirm(`\xBFCancelar el pedido ${pedido.folio || ""}?`, "\u274C S\xED, cancelar").then((ok) => {
      if (!ok) return;
      const aplicarCancelacion = (esMerma) => {
        const statusAnterior = pedido.status;
        const folioLabel = pedido.folio || pedido.id;
        if (typeof window.mkPushUndo === "function") {
          window.mkPushUndo(`Cancelar pedido ${folioLabel}`, () => {
            const p = window.pedidos.find((x) => String(x.id) === String(pedido.id));
            if (p && p.status === "cancelado") {
              p.status = statusAnterior;
              delete p.fechaCancelado;
              if (typeof savePedidos === "function") savePedidos();
              if (typeof renderPedidosTable === "function") renderPedidosTable();
            }
          });
          if (typeof window.mkMostrarUndoHint === "function") window.mkMostrarUndoHint(`Cancelar pedido ${folioLabel}`);
        }
        window.pedidos[idx].status = "cancelado";
        window.pedidos[idx].fechaCancelado = (/* @__PURE__ */ new Date()).toISOString();
        if (!esMerma && pedido.inventarioDescontado) {
          _regresarInventarioCompleto(window.pedidos[idx]);
          window.pedidos[idx].inventarioDescontado = false;
          if (pedido.empaquesDescontados) {
            _regresarEmpaquesInventario(window.pedidos[idx]);
            window.pedidos[idx].empaquesDescontados = false;
          }
          manekiToastExport("\u274C Pedido cancelado \u2014 productos y materia prima devueltos al inventario.", "warn");
        } else {
          manekiToastExport("\u274C Pedido cancelado" + (esMerma ? " \u2014 materiales registrados como merma." : "."), "warn");
        }
        savePedidos();
        closePedidoStatusModal();
        renderPedidosTable();
      };
      if (tieneProductos) {
        showConfirm(
          `\xBFYa comenzaste a trabajar en el pedido ${pedido.folio || ""}?

\u2705 S\xED \u2192 Los materiales se quedan como merma.
\u274C No \u2192 Los materiales regresan al inventario.`,
          "\u{1F527} S\xED, ya se trabaj\xF3"
        ).then((yaProducido) => aplicarCancelacion(yaProducido));
      } else {
        aplicarCancelacion(true);
      }
    });
  } else {
    if (status === "salida") {
      const _pedSalida = window.pedidos[idx];
      const _tipo = (_pedSalida.tipoEntrega || _pedSalida.entrega_tipo || "").toLowerCase();
      const _esDomicilio = _tipo.includes("domicilio") || _tipo.includes("envio") || _tipo.includes("env\xEDo") || _tipo === "";
      const _sinDireccion = !(_pedSalida.lugarEntrega || "").trim();
      if (_esDomicilio && _sinDireccion) {
        manekiToastExport("Agrega una direcci\xF3n de entrega antes de marcar como Salida", "warn");
        return;
      }
    }
    if (status === "produccion") {
      const pedido = window.pedidos[idx];
      if (!pedido.total || Number(pedido.total) <= 0) {
        manekiToastExport("\u26A0\uFE0F El pedido no tiene total asignado. Agrega un precio antes de pasar a producci\xF3n.", "warn");
        return;
      }
      if (pedido.inventarioDescontado) {
        manekiToastExport("\u26A0\uFE0F El inventario ya fue descontado para este pedido", "warn");
      } else if ((pedido.productosInventario || []).length > 0) {
        const n = _descontarInventarioPedido(pedido);
        if (n > 0) {
          window.pedidos[idx].inventarioDescontado = true;
          manekiToastExport(`\u{1F4E6} ${n} material(es) descontado(s) del inventario.`, "ok");
        }
      }
      if ((pedido.empaques || []).length > 0 && !pedido.empaquesDescontados) {
        const nEmp = _descontarEmpaquesInventario(pedido);
        if (nEmp > 0) {
          window.pedidos[idx].empaquesDescontados = true;
          manekiToastExport(`\u{1F4E6} ${nEmp} empaque(s) descontado(s).`, "ok");
        }
      }
    }
    window.pedidos[idx].status = status;
    window.pedidos[idx].fechaUltimoEstado = (/* @__PURE__ */ new Date()).toISOString();
    if (!window.pedidos[idx].historialEstados) window.pedidos[idx].historialEstados = [];
    window.pedidos[idx].historialEstados.push({
      estado: status,
      fecha: typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      hora: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    });
    savePedidos();
    if (window.MKS) MKS.tick();
    closePedidoStatusModal();
    renderPedidosTable();
    manekiToastExport("Estado actualizado \u2713", "ok");
    const _pedWa = window.pedidos[idx];
    if ((status === "produccion" || status === "salida") && _pedWa && _pedWa.telefono) {
      setTimeout(() => {
        manekiToastExport(
          `\u{1F4F2} \xBFNotificar a ${_pedWa.cliente || "el cliente"} por WhatsApp?`,
          "info"
        );
      }, 800);
    }
  }
}
function openAbonoPedido(id) {
  const p = (window.pedidos || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  document.getElementById("abonoPedidoId").value = id;
  const _pagosHist = (p.pagos || []).slice().reverse();
  const _historialHTML = _pagosHist.length > 0 ? `
        <div style="margin-bottom:16px;background:#f9fafb;border-radius:12px;padding:12px;border:1px solid #e5e7eb;">
            <div style="font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Pagos registrados</div>
            ${_pagosHist.map((pg) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6;">
                    <div>
                        <span style="font-size:.82rem;color:#374151;font-weight:600;">$${Number(pg.monto || pg.amount || 0).toFixed(2)}</span>
                        <span style="font-size:.72rem;color:#9ca3af;margin-left:6px;">${pg.metodo || pg.method || ""}</span>
                    </div>
                    <span style="font-size:.72rem;color:#9ca3af;">${pg.fecha || pg.date || ""}</span>
                </div>`).join("")}
            <div style="text-align:right;font-size:.78rem;font-weight:700;color:#059669;margin-top:6px;">
                Total pagado: $${_pagosHist.reduce((s, pg) => s + Number(pg.monto || pg.amount || 0), 0).toFixed(2)}
            </div>
        </div>` : "";
  document.getElementById("abonoPedidoInfo").innerHTML = `
        <p><b>Cliente:</b> ${typeof _esc === "function" ? _esc(p.cliente) : p.cliente}</p>
        <p><b>Folio:</b> ${typeof _esc === "function" ? _esc(p.folio) : p.folio}</p>
        <p><b>Total:</b> $${Number(p.total || 0).toFixed(2)}</p>
        <p><b>Anticipo:</b> $${Number(p.anticipo || 0).toFixed(2)}</p>
        <p class="font-bold text-red-600"><b>Saldo:</b> $${(typeof calcSaldoPendiente === "function" ? calcSaldoPendiente(p) : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0))).toFixed(2)}</p>
        ${_historialHTML}`;
  document.getElementById("abonoPedidoMonto").value = "";
  document.getElementById("abonoPedidoNota").value = "";
  _abonoPedidoMetodo = "cash";
  document.querySelectorAll(".abono-ped-btn").forEach((b, i) => {
    b.style.borderColor = i === 0 ? "#C5A572" : "";
    b.style.background = i === 0 ? "#FFF9F0" : "";
  });
  openModal("abonoPedidoModal");
}
function cerrarAbonoPedido() {
  closeModal("abonoPedidoModal");
}
function selectAbonoPedidoMethod(btn, method) {
  _abonoPedidoMetodo = method;
  document.querySelectorAll(".abono-ped-btn").forEach((b) => {
    b.style.borderColor = "";
    b.style.background = "";
  });
  btn.style.borderColor = "#C5A572";
  btn.style.background = "#FFF9F0";
}
let _abonoEnProceso = false;
async function confirmarAbonoPedido() {
  if (_abonoEnProceso) return;
  _abonoEnProceso = true;
  const btn = document.querySelector('#abonoModal button[onclick*="confirmarAbono"]') || document.querySelector('[onclick="confirmarAbonoPedido()"]');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.6";
  }
  const _abonoLockTimeout = setTimeout(() => {
    if (_abonoEnProceso) {
      _abonoEnProceso = false;
      const _btn = document.querySelector('#abonoModal button[onclick*="confirmarAbono"]') || document.querySelector('[onclick="confirmarAbonoPedido()"]');
      if (_btn) {
        _btn.disabled = false;
        _btn.style.opacity = "";
      }
      manekiToastExport("\u26A0\uFE0F El guardado tard\xF3 demasiado. Intenta de nuevo.", "warn");
    }
  }, 3e4);
  try {
    const id = document.getElementById("abonoPedidoId").value;
    const monto = parseFloat(document.getElementById("abonoPedidoMonto").value);
    if (!monto || monto <= 0) {
      manekiToastExport("Ingresa un monto v\xE1lido.", "warn");
      _abonoEnProceso = false;
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = "";
      }
      return;
    }
    const nota = document.getElementById("abonoPedidoNota").value.trim();
    const idx = (window.pedidos || []).findIndex((p2) => String(p2.id) === String(id));
    if (idx === -1) return;
    const p = window.pedidos[idx];
    const calcSaldo = typeof calcSaldoPendiente === "function" ? calcSaldoPendiente(p) : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
    if (monto > calcSaldo + 0.01) {
      const ok = await showConfirm(`El abono ($${monto.toFixed(2)}) supera el saldo pendiente ($${calcSaldo.toFixed(2)}). \xBFRegistrar de todas formas?`);
      if (!ok) {
        _abonoEnProceso = false;
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = "";
        }
        return;
      }
    }
    if (!p.pagos) p.pagos = [];
    const _d = /* @__PURE__ */ new Date();
    const abonoId = mkId();
    const _fechaLocal = _d.getFullYear() + "-" + String(_d.getMonth() + 1).padStart(2, "0") + "-" + String(_d.getDate()).padStart(2, "0");
    const _pagosBefore = p.pagos.slice();
    const _incomesBefore = window.incomes !== void 0 ? window.incomes.slice() : void 0;
    const _salesHistBefore = window.salesHistory !== void 0 ? window.salesHistory.slice() : void 0;
    p.pagos.push({
      id: abonoId,
      tipo: "abono",
      monto,
      metodo: _abonoPedidoMetodo,
      nota,
      fecha: _fechaLocal,
      hora: _d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    });
    normalizarResta();
    if (window.incomes !== void 0) {
      window.incomes.push({
        id: abonoId,
        concept: `Abono pedido ${p.folio}`,
        amount: monto,
        date: _fechaLocal,
        folioOrigen: p.folio
      });
    }
    if (window.salesHistory !== void 0) {
      window.salesHistory.push({
        id: abonoId,
        type: "abono",
        folio: p.folio,
        date: _fechaLocal,
        time: _d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        customer: p.cliente || "Cliente",
        concept: `Abono pedido ${p.folio}`,
        products: [],
        total: monto,
        method: _abonoPedidoMetodo === "cash" ? "Efectivo" : _abonoPedidoMetodo === "card" ? "Tarjeta" : "Transferencia",
        note: nota
      });
    }
    try {
      await savePedidos();
      if (window.incomes !== void 0 && typeof saveIncomes === "function") saveIncomes();
      if (window.salesHistory !== void 0) {
        if (typeof saveSalesHistory === "function") saveSalesHistory();
      }
      if (typeof _allVentasCache !== "undefined") _allVentasCache = null;
    } catch (_saveErr) {
      p.pagos = _pagosBefore;
      normalizarResta();
      if (_incomesBefore !== void 0) window.incomes = _incomesBefore;
      if (_salesHistBefore !== void 0) window.salesHistory = _salesHistBefore;
      console.error("confirmarAbonoPedido: fallo al guardar, se revirtieron cambios.", _saveErr);
      manekiToastExport("\u274C Error al guardar el abono. Intenta de nuevo.", "error");
      _abonoEnProceso = false;
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = "";
      }
      return;
    }
    cerrarAbonoPedido();
    renderPedidosTable();
    manekiToastExport(`\u2705 Abono de $${monto.toFixed(2)} registrado.`, "ok");
  } finally {
    clearTimeout(_abonoLockTimeout);
    _abonoEnProceso = false;
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = "";
    }
  }
}
function kanbanDragStart(event, id) {
  _kanbanDragId = id;
  event.dataTransfer.effectAllowed = "move";
  event.currentTarget.style.opacity = "0.5";
}
function kanbanDragEnd(event) {
  event.currentTarget.style.opacity = "";
}
function kanbanDragOver(event, col) {
  event.preventDefault();
  const el = document.getElementById("kCol-" + col);
  if (el) el.style.background = "#FFF9F0";
}
function kanbanDragLeave(event) {
  if (event.currentTarget) event.currentTarget.style.background = "";
}
async function kanbanDrop(event, newStatus) {
  event.preventDefault();
  const el = document.getElementById("kCol-" + newStatus);
  if (el) el.style.background = "";
  if (!_kanbanDragId) return;
  const idx = (window.pedidos || []).findIndex((p) => String(p.id) === String(_kanbanDragId));
  if (idx !== -1) {
    if (newStatus === "finalizado" || newStatus === "completado") {
      const pedido = window.pedidos[idx];
      const ok = await showConfirm(
        `\xBFFinalizar el pedido ${pedido.folio || ""}? Esta acci\xF3n lo mover\xE1 al historial.`,
        "\u{1F4E6} Finalizar pedido"
      );
      if (!ok) {
        if (typeof renderKanbanBoard === "function") renderKanbanBoard();
        _kanbanDragId = null;
        return;
      }
    }
    if (newStatus === "produccion") {
      const pedido = window.pedidos[idx];
      if (!pedido.total || Number(pedido.total) <= 0) {
        manekiToastExport("\u26A0\uFE0F El pedido no tiene total asignado. Agrega un precio antes de pasar a producci\xF3n.", "warn");
        _kanbanDragId = null;
        return;
      }
      if (pedido.inventarioDescontado) {
        manekiToastExport("\u26A0\uFE0F El inventario ya fue descontado para este pedido", "warn");
      } else if ((pedido.productosInventario || []).length > 0) {
        try {
          const n = _descontarInventarioPedido(pedido);
          if (n > 0) {
            window.pedidos[idx].inventarioDescontado = true;
            manekiToastExport(`\u{1F4E6} ${n} material(es) descontado(s) del inventario.`, "ok");
          }
        } catch (e) {
          console.error("Error al descontar inventario en kanban drop:", e);
          manekiToastExport("\u26A0\uFE0F Error al descontar inventario. El pedido no fue movido.", "err");
          if (typeof renderKanbanBoard === "function") renderKanbanBoard();
          _kanbanDragId = null;
          return;
        }
      }
    }
    if (newStatus === "salida") {
      const _pedSalida = window.pedidos[idx];
      const _tipo = (_pedSalida.tipoEntrega || _pedSalida.entrega_tipo || "").toLowerCase();
      const _esDomicilio = _tipo.includes("domicilio") || _tipo.includes("envio") || _tipo.includes("env\xEDo") || _tipo === "";
      const _sinDireccion = !(_pedSalida.lugarEntrega || "").trim();
      if (_esDomicilio && _sinDireccion) {
        manekiToastExport("Agrega una direcci\xF3n de entrega antes de marcar como Salida", "warn");
        _kanbanDragId = null;
        return;
      }
    }
    window.pedidos[idx].status = newStatus;
    window.pedidos[idx].fechaUltimoEstado = (/* @__PURE__ */ new Date()).toISOString();
    if (!window.pedidos[idx].historialEstados) window.pedidos[idx].historialEstados = [];
    window.pedidos[idx].historialEstados.push({
      estado: newStatus,
      fecha: typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      hora: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    });
    savePedidos();
    renderPedidosTable();
  }
  _kanbanDragId = null;
}
let _kanbanSeleccionados = /* @__PURE__ */ new Set();
function _toggleKanbanSelect(id, checked) {
  if (checked) {
    _kanbanSeleccionados.add(String(id));
  } else {
    _kanbanSeleccionados.delete(String(id));
  }
  _actualizarBarraLote();
}
window._toggleKanbanSelect = _toggleKanbanSelect;
function _actualizarBarraLote() {
  const n = _kanbanSeleccionados.size;
  let barra = document.getElementById("_kanbanBarraLote");
  if (n === 0) {
    if (barra) barra.style.display = "none";
    return;
  }
  if (!barra) {
    barra = document.createElement("div");
    barra.id = "_kanbanBarraLote";
    barra.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:1000;background:#1f2937;color:white;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,0.25);";
    document.body.appendChild(barra);
  }
  barra.style.display = "flex";
  barra.innerHTML = `
        <span style="font-weight:700;font-size:.9rem;">${n} seleccionado${n !== 1 ? "s" : ""}</span>
        <select id="_kanbanLoteStatus" style="padding:6px 12px;border-radius:8px;border:none;font-size:.85rem;background:#374151;color:white;outline:none;">
            <option value="confirmado">\u2705 Confirmado</option>
            <option value="pago">\u{1F4B0} Pago</option>
            <option value="produccion">\u{1F527} Producci\xF3n</option>
            <option value="envio">\u{1F4E6} Env\xEDo</option>
            <option value="salida">\u{1F69A} Sali\xF3</option>
            <option value="retirar">\u{1F3EA} Retirar</option>
        </select>
        <button onclick="_aplicarCambioLote()"
            style="padding:7px 18px;border-radius:8px;background:#C5A572;color:white;border:none;cursor:pointer;font-weight:700;font-size:.85rem;">
            Aplicar
        </button>
        <button onclick="_cancelarSeleccionLote()"
            style="padding:7px 12px;border-radius:8px;background:#4b5563;color:white;border:none;cursor:pointer;font-size:.85rem;">
            Cancelar
        </button>`;
}
window._actualizarBarraLote = _actualizarBarraLote;
function _aplicarCambioLote() {
  const nuevoStatus = document.getElementById("_kanbanLoteStatus")?.value;
  if (!nuevoStatus) return;
  const _fecha = typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let cambiados = 0;
  let finalizados = 0;
  _kanbanSeleccionados.forEach((id) => {
    const idx = (window.pedidos || []).findIndex((p2) => String(p2.id) === String(id));
    if (idx === -1) return;
    const p = window.pedidos[idx];
    p.historialEstados = [...p.historialEstados || [], {
      estado: nuevoStatus,
      fecha: _fecha,
      hora: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      nota: "Cambio en lote"
    }];
    if (nuevoStatus === "finalizado" || nuevoStatus === "entregado") {
      if (!window.pedidosFinalizados) window.pedidosFinalizados = [];
      const pedidoFin = {
        ...p,
        status: nuevoStatus,
        fechaFinalizado: _fecha
      };
      if ((pedidoFin.productosInventario || []).length > 0 && !pedidoFin.inventarioDescontado) {
        try {
          const n = _descontarInventarioPedido(pedidoFin);
          if (n > 0) {
            pedidoFin.inventarioDescontado = true;
            pedidoFin._inventarioYaFinalizado = true;
          }
        } catch (e) {
          console.error("[Lote] Error al descontar inventario:", e);
        }
      }
      if ((pedidoFin.empaques || []).length > 0 && !pedidoFin.empaquesDescontados) {
        const nEmp = _descontarEmpaquesInventario(pedidoFin);
        if (nEmp > 0) pedidoFin.empaquesDescontados = true;
      }
      window.pedidosFinalizados.push(pedidoFin);
      if (typeof window.salesHistory !== "undefined" && pedidoFin.total) {
        window.salesHistory.push({
          id: pedidoFin.id,
          type: "pedido",
          folio: pedidoFin.folio,
          date: _fecha,
          customer: pedidoFin.cliente,
          concept: pedidoFin.concepto || "Pedido finalizado",
          total: Number(pedidoFin.total),
          method: "Pedido",
          products: pedidoFin.productosInventario || []
        });
        if (typeof saveSalesHistory === "function") saveSalesHistory();
      }
      if (pedidoFin.cliente && typeof window.clients !== "undefined") {
        const _cl = (window.clients || []).find((c) => (c.name || "").toLowerCase().trim() === (pedidoFin.cliente || "").toLowerCase().trim());
        if (_cl) {
          _cl.totalPurchases = (_cl.totalPurchases || 0) + Number(pedidoFin.total || 0);
          if (typeof saveClients === "function") saveClients();
        }
      }
      window.pedidos.splice(idx, 1);
      finalizados++;
    } else {
      if (nuevoStatus === "produccion" && !p.inventarioDescontado) {
        if ((p.productosInventario || []).length > 0) {
          try {
            const n = _descontarInventarioPedido(p);
            if (n > 0) p.inventarioDescontado = true;
          } catch (e) {
            console.error("[Lote] Error al descontar inventario:", e);
          }
        }
      }
      p.status = nuevoStatus;
      p.fechaUltimoEstado = (/* @__PURE__ */ new Date()).toISOString();
    }
    cambiados++;
  });
  if (cambiados > 0) {
    guardarDatos ? guardarDatos() : savePedidos();
    if (finalizados > 0) {
      savePedidosFinalizados();
      renderHistorialPedidos();
    }
    _kanbanSeleccionados.clear();
    _actualizarBarraLote();
    if (typeof renderKanbanBoard === "function") renderKanbanBoard();
    else if (typeof renderKanban === "function") renderKanban();
    const msgFin = finalizados > 0 ? ` (${finalizados} finalizado${finalizados !== 1 ? "s" : ""})` : "";
    manekiToastExport(`\u2705 ${cambiados} pedido${cambiados !== 1 ? "s" : ""} actualizados a "${nuevoStatus}"${msgFin}.`, "ok");
  }
}
window._aplicarCambioLote = _aplicarCambioLote;
function _cancelarSeleccionLote() {
  _kanbanSeleccionados.clear();
  _actualizarBarraLote();
  renderKanbanBoard();
}
window._cancelarSeleccionLote = _cancelarSeleccionLote;
function toggleKanbanCompacto() {
  _kanbanCompacto = !_kanbanCompacto;
  const btn = document.getElementById("btnKanbanCompacto");
  if (btn) {
    btn.style.background = _kanbanCompacto ? "#C5A572" : "";
    btn.style.color = _kanbanCompacto ? "white" : "";
  }
  renderKanbanBoard();
}
function reactivarPedido(id) {
  let idx = (window.pedidosFinalizados || []).findIndex((x) => String(x.id) === String(id));
  let fuente = "finalizados";
  if (idx === -1) {
    idx = (window.pedidos || []).findIndex((x) => String(x.id) === String(id) && (x.status === "cancelado" || x.status === "cancelar"));
    fuente = "cancelado";
  }
  if (idx === -1) {
    manekiToastExport("\u26A0\uFE0F Pedido no encontrado.", "warn");
    return;
  }
  const p = fuente === "finalizados" ? window.pedidosFinalizados[idx] : window.pedidos[idx];
  showConfirm(
    `\xBFReactivar el pedido <strong>${typeof _esc === "function" ? _esc(p.folio || p.id) : p.folio || p.id}</strong> de <strong>${typeof _esc === "function" ? _esc(p.cliente || "\u2014") : p.cliente || "\u2014"}</strong>?<br><small style="color:#6b7280;">Volver\xE1 al kanban como "Confirmado".</small>`,
    "\u21A9 Reactivar pedido"
  ).then((ok) => {
    if (!ok) return;
    if (!window.pedidos) window.pedidos = [];
    const _fecha = typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const reactivado = {
      ...p,
      status: "confirmado",
      inventarioDescontado: false,
      _inventarioYaFinalizado: false,
      empaquesDescontados: false
    };
    delete reactivado.fechaFinalizado;
    delete reactivado.fechaCancelado;
    if (!reactivado.historialEstados) reactivado.historialEstados = [];
    reactivado.historialEstados.push({
      estado: "confirmado",
      fecha: _fecha,
      hora: (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      nota: "Reactivado desde historial"
    });
    if (fuente === "finalizados") {
      window.pedidosFinalizados.splice(idx, 1);
      window.pedidos.push(reactivado);
      savePedidos();
      savePedidosFinalizados();
    } else {
      window.pedidos[idx] = reactivado;
      savePedidos();
    }
    renderHistorialPedidos();
    renderPedidosTable();
    manekiToastExport(`\u21A9 Pedido ${p.folio || p.id} reactivado.`, "ok");
  });
}
window.reactivarPedido = reactivarPedido;
let _histPage = 1;
const _HIST_PER_PAGE = 20;
function cambiarPaginaHistorial(dir) {
  _histPage = Math.max(1, _histPage + dir);
  renderHistorialPedidos();
}
window.cambiarPaginaHistorial = cambiarPaginaHistorial;
window._historialFiltros = window._historialFiltros || { cliente: "", status: "todos", desde: "", hasta: "" };
function renderHistorialPedidos() {
  const lista = document.getElementById("historialPedidosLista");
  if (!lista) return;
  const finalizados = window.pedidosFinalizados || [];
  const _histContainer = lista.parentElement;
  if (_histContainer && !document.getElementById("histFiltrosBloque")) {
    const _filtrosDiv = document.createElement("div");
    _filtrosDiv.id = "histFiltrosBloque";
    _filtrosDiv.style.cssText = "background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-bottom:12px;";
    _filtrosDiv.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                <input id="histFiltroCliente" type="text" placeholder="\u{1F50D} Buscar cliente..." value="${window._historialFiltros.cliente || ""}"
                    oninput="window._historialFiltros.cliente=this.value;_histPage=1;renderHistorialPedidos()"
                    style="flex:1;min-width:140px;padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;outline:none;">
                <select id="histFiltroStatus" onchange="window._historialFiltros.status=this.value;_histPage=1;renderHistorialPedidos()"
                    style="padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;outline:none;">
                    <option value="todos" ${window._historialFiltros.status === "todos" ? "selected" : ""}>Todos los estados</option>
                    <option value="finalizado" ${window._historialFiltros.status === "finalizado" ? "selected" : ""}>\u2705 Finalizado</option>
                    <option value="cancelado" ${window._historialFiltros.status === "cancelado" ? "selected" : ""}>\u274C Cancelado</option>
                </select>
                <label style="font-size:.78rem;color:#6b7280;white-space:nowrap;">Desde:
                    <input id="histFiltroDesde" type="date" value="${window._historialFiltros.desde || ""}"
                        onchange="window._historialFiltros.desde=this.value;_histPage=1;renderHistorialPedidos()"
                        style="margin-left:4px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:.8rem;">
                </label>
                <label style="font-size:.78rem;color:#6b7280;white-space:nowrap;">Hasta:
                    <input id="histFiltroHasta" type="date" value="${window._historialFiltros.hasta || ""}"
                        onchange="window._historialFiltros.hasta=this.value;_histPage=1;renderHistorialPedidos()"
                        style="margin-left:4px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:.8rem;">
                </label>
                <button onclick="window._historialFiltros={cliente:'',status:'todos',desde:'',hasta:''};_histPage=1;document.getElementById('histFiltroCliente').value='';document.getElementById('histFiltroStatus').value='todos';document.getElementById('histFiltroDesde').value='';document.getElementById('histFiltroHasta').value='';renderHistorialPedidos()"
                    style="padding:6px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:.78rem;background:white;color:#6b7280;cursor:pointer;">Limpiar filtros</button>
            </div>`;
    lista.insertAdjacentElement("beforebegin", _filtrosDiv);
  }
  if (_histContainer && !document.getElementById("histTiempoPromedio")) {
    const _statDiv = document.createElement("div");
    _statDiv.id = "histTiempoPromedio";
    _statDiv.style.cssText = "background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;margin-bottom:10px;font-size:.82rem;color:#1e40af;font-weight:600;";
    lista.insertAdjacentElement("beforebegin", _statDiv);
  }
  (function _calcTiempoPromedio() {
    const el = document.getElementById("histTiempoPromedio");
    if (!el) return;
    let totalDias = 0, conteo = 0;
    (window.pedidosFinalizados || []).forEach((p) => {
      const fechaInicio = p.fechaPedido || p.fechaCreacion;
      if (!fechaInicio) return;
      let fechaFin = null;
      if (p.historialEstados && p.historialEstados.length > 0) {
        const ult = [...p.historialEstados].reverse().find((h) => h.estado === "finalizado" || h.estado === "entregado");
        if (ult && ult.fecha) fechaFin = ult.fecha;
      }
      if (!fechaFin && p.fechaFinalizado) fechaFin = p.fechaFinalizado.split("T")[0];
      if (!fechaFin) return;
      const diff = Math.round((/* @__PURE__ */ new Date(fechaFin + "T00:00:00") - /* @__PURE__ */ new Date(fechaInicio + "T00:00:00")) / 864e5);
      if (diff >= 0 && diff < 365) {
        totalDias += diff;
        conteo++;
      }
    });
    el.textContent = conteo > 0 ? `\u23F1 Tiempo promedio de entrega: ${Math.round(totalDias / conteo)} d\xEDas (basado en ${conteo} pedidos finalizados)` : "\u23F1 Sin suficientes datos de tiempo de entrega a\xFAn";
  })();
  const selMes = document.getElementById("histPedidoMes");
  if (selMes && selMes.options.length <= 1) {
    const meses = [...new Set(finalizados.map((p) => (p.fechaFinalizado || p.fechaPedido || "").substring(0, 7)))].filter(Boolean).sort().reverse();
    selMes.innerHTML = '<option value="">Todos los meses</option>' + meses.map((m) => `<option value="${m}">${m}</option>`).join("");
  }
  const cancelados = (window.pedidos || []).filter((p) => p.status === "cancelado" || p.status === "cancelar");
  const canceladosMarcados = cancelados.map((p) => ({ ...p, _esCancelado: true }));
  const todosHistorial = [...finalizados, ...canceladosMarcados];
  const q = ((document.getElementById("histPedidoBuscar") || {}).value || (window._historialFiltros.cliente || "")).toLowerCase().trim();
  const mes = (selMes || {}).value || "";
  const filtroStatus = window._historialFiltros.status || "todos";
  const filtroDesde = window._historialFiltros.desde || "";
  const filtroHasta = window._historialFiltros.hasta || "";
  let items = [...todosHistorial].sort((a, b) => {
    const fa = a.fechaFinalizado || a.fechaCancelado || a.fechaPedido || "";
    const fb = b.fechaFinalizado || b.fechaCancelado || b.fechaPedido || "";
    return fb.localeCompare(fa);
  });
  if (q) {
    items = items.filter(
      (p) => (p.cliente || "").toLowerCase().includes(q) || (p.folio || "").toLowerCase().includes(q) || (p.concepto || "").toLowerCase().includes(q)
    );
    _histPage = 1;
  }
  if (mes) {
    items = items.filter((p) => (p.fechaFinalizado || p.fechaCancelado || p.fechaPedido || "").startsWith(mes));
    _histPage = 1;
  }
  if (filtroStatus !== "todos") {
    if (filtroStatus === "cancelado") {
      items = items.filter((p) => p._esCancelado);
    } else {
      items = items.filter((p) => !p._esCancelado);
    }
    _histPage = 1;
  }
  if (filtroDesde) {
    items = items.filter((p) => {
      const f = (p.fechaFinalizado || p.fechaCancelado || p.fechaPedido || "").split("T")[0];
      return f >= filtroDesde;
    });
    _histPage = 1;
  }
  if (filtroHasta) {
    items = items.filter((p) => {
      const f = (p.fechaFinalizado || p.fechaCancelado || p.fechaPedido || "").split("T")[0];
      return f <= filtroHasta;
    });
    _histPage = 1;
  }
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / _HIST_PER_PAGE));
  if (_histPage > totalPages) _histPage = totalPages;
  const start = (_histPage - 1) * _HIST_PER_PAGE;
  const pageItems = items.slice(start, start + _HIST_PER_PAGE);
  const pagEl = document.getElementById("histPaginacion");
  if (pagEl) {
    pagEl.innerHTML = totalPages <= 1 ? "" : `
            <div class="flex items-center justify-between pt-2 text-xs text-gray-500">
                <button onclick="cambiarPaginaHistorial(-1)" ${_histPage <= 1 ? "disabled" : ""} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30">\u2190 Anterior</button>
                <span>P\xE1gina ${_histPage} de ${totalPages} <span class="text-gray-400">(${totalItems} pedidos)</span></span>
                <button onclick="cambiarPaginaHistorial(1)" ${_histPage >= totalPages ? "disabled" : ""} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30">Siguiente \u2192</button>
            </div>`;
  }
  let _histLoadMoreBtn = document.getElementById("histLoadMoreBtn");
  const _puedeCargaMas = (window.pedidosFinalizados || []).length >= 500 && !window._pedidosFinAllLoaded;
  if (_puedeCargaMas) {
    if (!_histLoadMoreBtn) {
      _histLoadMoreBtn = document.createElement("div");
      _histLoadMoreBtn.id = "histLoadMoreBtn";
      _histLoadMoreBtn.style.cssText = "text-align:center;margin-top:12px;";
      _histLoadMoreBtn.innerHTML = `<button onclick="cargarMasPedidosFinalizados()" style="padding:8px 20px;background:#F5EDD8;border:1px solid #C5A572;border-radius:10px;font-size:.82rem;font-weight:600;color:#92622A;cursor:pointer;">Cargar m\xE1s pedidos \u2193</button>`;
      lista.insertAdjacentElement("afterend", _histLoadMoreBtn);
    } else {
      _histLoadMoreBtn.style.display = "";
    }
  } else if (_histLoadMoreBtn) {
    _histLoadMoreBtn.style.display = "none";
  }
  lista.innerHTML = pageItems.length === 0 ? '<p class="text-center text-gray-400 py-6 text-sm">Sin pedidos en el historial</p>' : pageItems.map((p) => {
    let _totalMostrar = Number(p.total || 0);
    if (!_totalMostrar && (p.productosInventario || []).length > 0) {
      _totalMostrar = (p.productosInventario || []).reduce((s, it) => {
        return s + Math.round(parseFloat(it.price || it.precio || 0) * 100) * parseInt(it.quantity || it.cantidad || 1, 10);
      }, 0) / 100;
    }
    const _esCancelado = p._esCancelado;
    const _fechaRef = _esCancelado ? (p.fechaCancelado || "").split("T")[0] || p.fechaPedido || "" : (p.fechaFinalizado || "").split("T")[0] || "";
    const _statusBadge = _esCancelado ? '<p class="text-xs text-red-500">\u274C Cancelado</p>' : '<p class="text-xs text-green-600">\u2705 Finalizado</p>';
    const _botonesExtra = _esCancelado ? `<button onclick="reactivarPedido('${p.id}')" class="text-xs text-blue-500 hover:text-blue-700" title="Reactivar pedido cancelado">\u21A9 Reactivar</button>` : `<button onclick="imprimirTicketPedido('${p.id}')" class="text-xs text-gray-400 hover:text-gray-600" title="Imprimir comprobante">\u{1F5A8}\uFE0F</button>
                   <button onclick="reactivarPedido('${p.id}')" class="text-xs text-blue-500 hover:text-blue-700" title="Mover de nuevo al kanban">\u21A9 Reactivar</button>
                   <button onclick="editarPedidoFinalizado('${p.id}')" class="text-xs text-amber-500 hover:text-amber-700">\u270F\uFE0F Editar</button>
                   <button onclick="eliminarPedidoFinalizado('${p.id}')" class="text-xs text-red-400 hover:text-red-600">\u{1F5D1} Eliminar</button>`;
    return `<div class="flex items-center justify-between p-4 ${_esCancelado ? "bg-red-50" : "bg-gray-50"} rounded-xl hover:bg-amber-50 transition-all">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-amber-600 text-sm">${_esc(p.folio || "\u2014")}</span>
                    <span class="text-xs text-gray-400">${_fechaRef}</span>
                </div>
                <p class="font-semibold text-gray-800 text-sm">${_esc(p.cliente || "\u2014")}</p>
                <p class="text-xs text-gray-500 truncate">${_esc(p.concepto || "")}</p>
            </div>
            <div class="text-right ml-4">
                <p class="font-bold text-gray-800">$${_totalMostrar.toFixed(2)}</p>
                ${_statusBadge}
                <div class="flex gap-2 justify-end mt-1">
                    ${_botonesExtra}
                </div>
            </div>
        </div>`;
  }).join("");
}
async function cargarMasPedidosFinalizados() {
  const btn = document.querySelector("#histLoadMoreBtn button");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Cargando...";
  }
  try {
    const offset = (window.pedidosFinalizados || []).length;
    const mas = await window._loadMoreFromTable("pedidosFinalizados", offset, 200);
    if (mas && mas.length > 0) {
      (window.pedidosFinalizados || []).push(...mas);
      window.pedidosFinalizados = window.pedidosFinalizados;
      if (mas.length < 200) window._pedidosFinAllLoaded = true;
      renderHistorialPedidos();
      manekiToastExport(`\u2705 ${mas.length} pedidos adicionales cargados`, "ok");
    } else {
      window._pedidosFinAllLoaded = true;
      renderHistorialPedidos();
      manekiToastExport("Ya cargaste todos los pedidos", "ok");
    }
  } catch (e) {
    manekiToastExport("Error al cargar m\xE1s pedidos", "err");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Cargar m\xE1s pedidos \u2193";
    }
  }
}
window.cargarMasPedidosFinalizados = cargarMasPedidosFinalizados;
function renderGraficaROI() {
  const canvas = document.getElementById("roiBarChart");
  if (!canvas) return;
  const equiposList = typeof equipos !== "undefined" ? equipos : window.equipos || [];
  if (!equiposList.length) {
    canvas.parentElement.innerHTML = `<div class="flex flex-col items-center justify-center py-8 gap-3"><p class="text-center text-gray-400 text-sm">Sin equipos registrados a\xFAn</p><button onclick="showSection('equipos')" class="text-xs px-4 py-2 rounded-lg font-semibold" style="background:#C5A572;color:#fff;">+ Agregar primer equipo</button></div>`;
    return;
  }
  const ctx = canvas.getContext("2d");
  if (window._roiChart) window._roiChart.destroy();
  window._roiChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: equiposList.map((e) => e.nombre),
      datasets: [
        { label: "Acumulado ROI", data: equiposList.map((e) => e.recuperado || 0), backgroundColor: "rgba(197,165,114,0.85)", borderRadius: 6 },
        { label: "Meta", data: equiposList.map((e) => e.metaReemplazo || e.costoOriginal || 0), backgroundColor: "rgba(216,191,216,0.5)", borderRadius: 6 }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => "$" + v.toLocaleString() } } } }
  });
}
function mostrarResumenMensual() {
  const hoy = /* @__PURE__ */ new Date();
  const mp = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const nombre = mp.toLocaleString("es-MX", { month: "long", year: "numeric" });
  const m = mp.getMonth(), y = mp.getFullYear();
  const fin = (window.pedidosFinalizados || []).filter((p) => {
    const f = new Date(p.fechaFinalizado || p.fechaPedido || "");
    return f.getMonth() === m && f.getFullYear() === y;
  });
  const ventas = (typeof salesHistory !== "undefined" ? salesHistory : []).filter((v) => {
    const f = new Date(v.date || "");
    return f.getMonth() === m && f.getFullYear() === y && v.type !== "pedido";
  });
  const tv = ventas.reduce((s, v) => s + (v.total || 0), 0);
  const tp = fin.reduce((s, p) => s + (p.total || 0), 0);
  manekiToastExport(
    `\u{1F4C5} ${nombre.charAt(0).toUpperCase() + nombre.slice(1)}: \u{1F4B0} POS $${tv.toFixed(2)} \xB7 \u{1F4E6} ${fin.length} pedidos ($${tp.toFixed(2)}) \xB7 \u{1F3AF} Total $${(tv + tp).toFixed(2)}`,
    "ok"
  );
}
(function autoResumenMensual() {
  if ((/* @__PURE__ */ new Date()).getDate() !== 1) return;
  const key = "maneki_resumen_" + (typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]).substring(0, 7);
  try {
    if (localStorage.getItem(key)) return;
    setTimeout(() => {
      mostrarResumenMensual();
      try {
        localStorage.setItem(key, "1");
      } catch (_) {
      }
    }, 4e3);
  } catch (_) {
  }
})();
function renderTopClientes() {
  const el = document.getElementById("topClientesWidget");
  if (!el) return;
  const mapa = {};
  const addEntry = (nombre, total) => {
    if (!nombre) return;
    if (!mapa[nombre]) mapa[nombre] = { nombre, pedidos: 0, total: 0 };
    mapa[nombre].pedidos++;
    mapa[nombre].total += total || 0;
  };
  (window.pedidosFinalizados || []).forEach((p) => addEntry(p.cliente, p.total));
  const top = Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 3);
  el.innerHTML = top.length === 0 ? '<p class="text-xs text-gray-400 text-center py-2">Sin datos a\xFAn</p>' : top.map((c, i) => `<div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span class="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style="background:#C5A572">${i + 1}</span>
            <div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-800 truncate">${c.nombre}</p><p class="text-xs text-gray-400">${c.pedidos} pedidos</p></div>
            <span class="text-sm font-bold text-gray-700">$${c.total.toFixed(0)}</span>
        </div>`).join("");
}
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    if (!document.getElementById("btnKanbanCompacto")) {
      const toggleContainer = document.querySelector("#pedidos-section .flex.bg-gray-100.rounded-xl");
      if (toggleContainer) {
        const btn = document.createElement("button");
        btn.id = "btnKanbanCompacto";
        btn.onclick = toggleKanbanCompacto;
        btn.title = "Modo compacto";
        btn.className = "px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-100";
        btn.innerHTML = '<i class="fas fa-grip-lines"></i>';
        toggleContainer.appendChild(btn);
      }
    }
    if (!document.getElementById("btnKanbanUrgTodos")) {
      const kanbanBuscar = document.getElementById("kanbanBuscar");
      if (kanbanBuscar && kanbanBuscar.parentElement) {
        const wrap = document.createElement("div");
        wrap.className = "flex gap-1 ml-2";
        wrap.style.cssText = "align-items:center;";
        const btns = [
          { id: "btnKanbanUrgTodos", filtro: "todos", label: "Todos", color: "#C5A572" },
          { id: "btnKanbanUrgVencido", filtro: "vencido", label: "\u26D4 Vencidos", color: "#dc2626" },
          { id: "btnKanbanUrgHoy", filtro: "hoy", label: "\u{1F534} Hoy", color: "#ea580c" },
          { id: "btnKanbanUrgProximos", filtro: "pronto", label: "\u{1F7E1} 2 d\xEDas", color: "#ca8a04" }
        ];
        btns.forEach(({ id, filtro, label, color }) => {
          const b = document.createElement("button");
          b.id = id;
          b.className = "btn-kanban-urgencia px-2 py-1 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50";
          b.textContent = label;
          b.style.cssText = filtro === "todos" ? `background:${color};color:white;border-color:${color};` : "";
          b.onclick = function() {
            setKanbanUrgencia(filtro, b);
          };
          wrap.appendChild(b);
        });
        kanbanBuscar.parentElement.appendChild(wrap);
      }
    }
  }, 1e3);
});
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    if (typeof renderTopClientes === "function") renderTopClientes();
  }, 2e3);
});
let _editandoPedidoFinalizadoId = null;
function editarPedidoFinalizado(id) {
  const p = (window.pedidosFinalizados || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  _editandoPedidoFinalizadoId = id;
  const form = document.getElementById("pedidoForm");
  if (form) form.reset();
  window.pedidoProductosSeleccionados = [...p.productosInventario || []];
  document.getElementById("editPedidoId").value = "__finalizado__" + id;
  document.getElementById("pedidoModalTitle").textContent = "\u270F\uFE0F Editar Pedido Finalizado";
  document.getElementById("pedidoSubmitBtn").textContent = "Guardar Cambios";
  document.getElementById("pedidoCliente").value = p.cliente || "";
  document.getElementById("pedidoTelefono").value = p.telefono || p.whatsapp || "";
  document.getElementById("pedidoRedes").value = p.redes || p.facebook || "";
  document.getElementById("pedidoFecha").value = p.fechaPedido || "";
  document.getElementById("pedidoEntrega").value = p.entrega || "";
  document.getElementById("pedidoConcepto").value = p.concepto || "";
  document.getElementById("pedidoCantidad").value = p.cantidad || 1;
  document.getElementById("pedidoCosto").value = p.costo || "";
  document.getElementById("pedidoAnticipo").value = p.anticipo || 0;
  document.getElementById("pedidoNotas").value = p.notas || "";
  document.getElementById("pedidoLugarEntrega").value = p.lugarEntrega || "";
  document.getElementById("pedidoCostoMateriales").value = p.costoMateriales || 0;
  const _plFin = document.getElementById("pedidoPrecioLibre");
  if (_plFin) {
    const _tieneItems = (p.productosInventario || []).length > 0;
    _plFin.value = !_tieneItems && (p.total || p.costo) ? p.total || p.costo || "" : "";
  }
  calcPedidoTotal();
  renderPedidoProductosList();
  if (typeof poblarSelectPedido === "function") poblarSelectPedido();
  openModal("pedidoModal");
}
window.editarPedidoFinalizado = editarPedidoFinalizado;
(function patchPedidoFormForFinalizados() {
  const _origSubmit = document.getElementById("pedidoForm").onsubmit;
  document.getElementById("pedidoForm").addEventListener("submit", function(e) {
    const editId = document.getElementById("editPedidoId").value;
    if (!editId.startsWith("__finalizado__")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const realId = editId.replace("__finalizado__", "");
    const idx = (window.pedidosFinalizados || []).findIndex((x) => String(x.id) === String(realId));
    if (idx === -1) {
      manekiToastExport("\u26A0\uFE0F No se encontr\xF3 el pedido.", "warn");
      return;
    }
    const cliente = document.getElementById("pedidoCliente").value.trim();
    const telefono = document.getElementById("pedidoTelefono").value.trim();
    const redes = document.getElementById("pedidoRedes").value.trim();
    const fechaPedido = document.getElementById("pedidoFecha").value;
    const entrega = document.getElementById("pedidoEntrega").value;
    const concepto = document.getElementById("pedidoConcepto").value.trim();
    const anticipo = parseFloat(document.getElementById("pedidoAnticipo").value) || 0;
    const notas = document.getElementById("pedidoNotas").value.trim();
    const lugarEntrega = document.getElementById("pedidoLugarEntrega").value.trim();
    const costoMateriales = parseFloat(document.getElementById("pedidoCostoMateriales").value) || 0;
    let _editFinItems = [...window.pedidoProductosSeleccionados || []];
    if (_editFinItems.length === 0) {
      const _plFEl = document.getElementById("pedidoPrecioLibre");
      const _plVal = _plFEl ? parseFloat(_plFEl.value) || 0 : 0;
      if (_plVal > 0) _editFinItems = [{ id: "libre", name: concepto || "Pedido", price: _plVal, quantity: 1, variante: null }];
    }
    const total = window._sumLineas ? _sumLineas(_editFinItems) : _editFinItems.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);
    const cantidad = _editFinItems.reduce((s, it) => s + (it.quantity || 1), 0) || 1;
    const costo = total;
    const resta = Math.max(0, total - anticipo);
    if (!cliente || !concepto) {
      manekiToastExport("Por favor completa los campos requeridos (cliente y concepto).", "warn");
      return;
    }
    if (total > 0 && anticipo > total) {
      manekiToastExport(`\u26A0\uFE0F El anticipo ($${anticipo.toFixed(2)}) supera el total ($${total.toFixed(2)}). Verifica los montos.`, "warn");
      return;
    }
    window.pedidosFinalizados[idx] = {
      ...window.pedidosFinalizados[idx],
      cliente,
      telefono,
      redes,
      whatsapp: telefono,
      facebook: redes,
      fechaPedido,
      entrega,
      concepto,
      cantidad,
      costo,
      total,
      anticipo,
      resta,
      notas,
      lugarEntrega,
      costoMateriales,
      productosInventario: [..._editFinItems]
    };
    if (typeof roiHistorial !== "undefined") {
      const roiIdx = roiHistorial.findIndex((h) => h.folio === window.pedidosFinalizados[idx].folio);
      if (roiIdx !== -1) {
        const pct = (typeof roiConfig !== "undefined" ? roiConfig.porcentaje : 10) / 100;
        const nuevoRoi = total * pct;
        const count = roiHistorial[roiIdx].equiposIds.length;
        const porEquipo = count > 0 ? nuevoRoi / count : 0;
        const diff = porEquipo - roiHistorial[roiIdx].porEquipo;
        roiHistorial[roiIdx].equiposIds.forEach((eqId) => {
          const eq = (typeof equipos !== "undefined" ? equipos : []).find((e2) => e2.id === eqId);
          if (eq) eq.recuperado = Math.max(0, (eq.recuperado || 0) + diff);
        });
        roiHistorial[roiIdx].ganancia = total;
        roiHistorial[roiIdx].totalRoi = nuevoRoi;
        roiHistorial[roiIdx].porEquipo = porEquipo;
        if (typeof sbSave === "function") {
          sbSave("roiHistorial", roiHistorial);
          sbSave("equipos", typeof equipos !== "undefined" ? equipos : []);
        }
      }
    }
    const _pFin = window.pedidosFinalizados[idx];
    const _esPrimeraFin = !_pFin.inventarioDescontado && !_pFin._inventarioYaFinalizado;
    if (_esPrimeraFin && _editFinItems.length > 0 && _editFinItems[0].id !== "libre") {
      _descontarInventarioPedido(_pFin);
      window.pedidosFinalizados[idx].inventarioDescontado = true;
      window.pedidosFinalizados[idx]._inventarioYaFinalizado = true;
    }
    savePedidosFinalizados();
    closeModal("pedidoModal");
    window.pedidoProductosSeleccionados = [];
    _editandoPedidoFinalizadoId = null;
    renderHistorialPedidos();
    manekiToastExport("\u2705 Pedido finalizado actualizado: " + window.pedidosFinalizados[idx].folio, "ok");
  }, true);
})();
//# sourceMappingURL=pedidos-2.js.map
