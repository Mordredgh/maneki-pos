async function _eliminarFotoStorageAlFinalizar(pedido) {
    const { paths } = _fotosArray(pedido);
    if (!paths.length) return;
    try { await db.storage.from(FOTO_BUCKET).remove(paths); }
    catch(e) {
        console.warn('[Foto] No se pudo eliminar al finalizar:', e);
        if (typeof manekiToastExport === 'function')
            manekiToastExport('⚠️ Las fotos del pedido no se eliminaron de Storage. Puedes borrarlas manualmente desde Supabase.', 'warn');
    }
}

// ── Helpers de inventario para pedidos ──────────────────────────────────────
async function _descontarInventarioPedido(pedido) {
    const items = pedido.productosInventario || [];
    if (items.length === 0) return 0;
    let descontados = 0;
    // FIX 1: rollback data collected before each deduction; restored on error
    const _rollback = [];
    // P-7: snapshot de window.products para rollback completo si falla saveProducts
    const _rollbackData = window.products ? JSON.parse(JSON.stringify(window.products)) : null;
    // P-7: lookup O(1) en lugar de O(n) find() en cada iteración
    const prodMap = new Map<string, any>((window.products || []).map((p: any) => [String(p.id), p]));
    try {
    for (const item of items) {
        const prod = prodMap.get(String(item.id));
        if (!prod) continue;
        if (prod.tipo === 'servicio') continue;
        if (item.id === 'libre') continue; // ítem de precio libre, sin producto en inventario
        const cantidad = item.quantity || item.cantidad || 1;

        // FIX 3: null check on item.variante before any .indexOf() call
        if (!item.variante && item.variante !== 0) { /* no variant — skip variant parsing below */ }

        // INFO: calcular stock disponible solo para avisar — no bloquear el descuento
        // (stock insuficiente puede ocurrir por reposición pendiente; la usuaria decide)
        const _tieneMpComp = Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0;
        let _stockDisponible;
        if (prod.tipo === 'producto_variable' && _tieneMpComp) {
            const _rph = prod.rendimientoPorHoja || 1;
            let _minHojas = Infinity;
            for (const comp of prod.mpComponentes) {
                const mp = prodMap.get(String(comp.id));
                if (mp && mp.tipo !== 'servicio') {
                    const qtyComp = parseFloat(comp.qty) || 1;
                    _minHojas = Math.min(_minHojas, Math.floor((mp.stock || 0) / qtyComp));
                }
            }
            _stockDisponible = (_minHojas === Infinity ? 0 : _minHojas) * _rph;
        } else if (_tieneMpComp && Array.isArray(prod.variants) && prod.variants.length > 0) {
            const _stockVariantes = prod.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
            let _minFabricable = Infinity;
            for (const comp of prod.mpComponentes) {
                const mp = prodMap.get(String(comp.id));
                if (mp && mp.tipo !== 'servicio') {
                    const stockMp = mp.stock || 0;
                    const qtyComp = parseFloat(comp.qty) || 1;
                    _minFabricable = Math.min(_minFabricable, Math.floor(stockMp / qtyComp));
                }
            }
            _stockDisponible = _stockVariantes + (_minFabricable === Infinity ? 0 : _minFabricable);
        } else if (prod.tipo === 'producto_variable') {
            // PV sin mpComponentes: usa su propio stock numérico
            _stockDisponible = parseInt(prod.stock) || 0;
        } else {
            _stockDisponible = typeof getStockEfectivo === 'function' ? getStockEfectivo(prod) : (prod.stock || 0);
        }
        // Solo avisar si el stock es insuficiente, pero proceder con el descuento de todas formas
        if (_stockDisponible < cantidad) {
            console.warn(`[Inventario] Stock insuficiente para "${prod.name}": disponible=${_stockDisponible}, requerido=${cantidad} — se descuenta de todas formas`);
            manekiToastExport(`⚠️ Stock bajo de "${prod.name}" (disponible: ${_stockDisponible})`, 'warn');
        }

        // Descontar stock del producto terminado (PT)
        const antesPT = prod.stock || 0;
        // FIX 1: record rollback BEFORE modifying stock (including variant snapshots)
        _rollback.push({ id: prod.id, stockBefore: antesPT, variantsBefore: Array.isArray(prod.variants) && prod.variants.length > 0 ? prod.variants.map(v => ({...v})) : null });

        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            // Producto CON variantes: descontar de la variante correspondiente
            // y dejar que syncStockFromVariants recalcule prod.stock.
            // NO tocar prod.stock directamente (syncStockFromVariants lo sobreescribiría).
            if (item.variante) {
                // Variante conocida: descontar directo
                const _colIdx = item.variante.indexOf(':');
                const _vType  = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
                const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : '';
                const _ptVar  = prod.variants.find(v =>
                    (v.type || v.tipo || '') === _vType && (v.value || v.valor || '') === _vValue
                );
                if (_ptVar) { _ptVar.qty = Math.max(0, (_ptVar.qty || 0) - cantidad); }
            } else {
                // Sin variante especificada: descontar de la variante con mayor stock disponible
                const _varMayor = prod.variants.slice().sort((a, b) => (parseInt(b.qty)||0) - (parseInt(a.qty)||0))[0];
                if (_varMayor) { _varMayor.qty = Math.max(0, (parseInt(_varMayor.qty)||0) - cantidad); }
            }
            // Recalcular prod.stock desde la suma de variantes actualizadas
            if (typeof syncStockFromVariants === 'function') syncStockFromVariants(prod);
            else prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
        } else {
            // Producto SIN variantes: descontar prod.stock directamente
            prod.stock = Math.max(0, antesPT - cantidad);
        }

        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({
                productoId: prod.id, productoNombre: prod.name,
                tipo: 'salida', cantidad: -cantidad,
                motivo: `Producción pedido ${pedido.folio}`,
                stockAntes: antesPT, stockDespues: prod.stock
            });
        }
        descontados++;

        // BUG-5 FIX: calcular cuántas unidades hay que FABRICAR (vs sacar de vitrina ya producida).
        // Si el PT tiene stock propio Y mpComponentes, primero se agota el stock ya fabricado;
        // solo se descuenta MP para las unidades que excedan ese stock (a fabricar).
        // antesPT = stock real ANTES de descontar ESTA línea, incluyendo descuentos de líneas previas
        // del mismo producto. No usar _rollback.find() porque devuelve el primer snapshot
        // (stock original antes de cualquier línea), incorrecto si el mismo prod aparece 2 veces.
        const _stockFabricadoAntes = antesPT;
        const _cantidadAFabricar = Math.max(0, cantidad - _stockFabricadoAntes);

        // Descontar MP de los componentes del PT × unidades a fabricar solamente
        if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0 && _cantidadAFabricar > 0) {
            for (const comp of prod.mpComponentes) {
                const mp = prodMap.get(String(comp.id));
                if (!mp || mp.tipo === 'servicio') continue;
                const _rph = prod.rendimientoPorHoja || 1;
                // BUG-5 FIX: usar _cantidadAFabricar (unidades sin stock en vitrina)
                const cantMP = _rph > 0
                    ? Math.ceil(_cantidadAFabricar / _rph) * (parseFloat(comp.qty) || 1)
                    : (parseFloat(comp.qty) || 1) * _cantidadAFabricar;
                const antesMP = mp.stock || 0;
                // FIX 1: record rollback for MP before modifying (including variant snapshots)
                _rollback.push({ id: mp.id, stockBefore: antesMP, variantsBefore: Array.isArray(mp.variants) && mp.variants.length > 0 ? mp.variants.map(v => ({...v})) : null });

                // Si el pedido tiene variante seleccionada y la MP tiene variantes,
                // descontar de la variante específica (ej: Talla:M → restar qty de esa variante)
                if (item.variante && Array.isArray(mp.variants) && mp.variants.length > 0) {
                    const colonIdx = item.variante.indexOf(':');
                    const varType  = colonIdx !== -1 ? item.variante.slice(0, colonIdx).trim() : item.variante;
                    const varValue = colonIdx !== -1 ? item.variante.slice(colonIdx + 1).trim() : '';
                    const mpVar = mp.variants.find(v =>
                        (v.type || v.tipo || '') === varType && (v.value || v.valor || '') === varValue
                    );
                    if (mpVar) {
                        mpVar.qty = Math.max(0, (mpVar.qty || 0) - cantMP);
                    }
                    // Sincronizar stock total desde variantes
                    if (typeof syncStockFromVariants === 'function') {
                        syncStockFromVariants(mp);
                    } else {
                        mp.stock = mp.variants.reduce((s, v) => s + (v.qty || 0), 0);
                    }
                } else {
                    mp.stock = Math.max(0, antesMP - cantMP);
                }

                if (typeof registrarMovimiento === 'function') {
                    registrarMovimiento({
                        productoId: mp.id, productoNombre: mp.name,
                        tipo: 'salida', cantidad: -cantMP,
                        motivo: `MP para ${prod.name}${item.variante ? ` (${item.variante})` : ''} — pedido ${pedido.folio}`,
                        stockAntes: antesMP, stockDespues: mp.stock
                    });
                }
            }
        }
    }
    } catch(e) {
        // FIX 1: restore all stock (including variant qtys) modified before the error
        _rollback.forEach(r => {
            const p = (window.products || []).find(x => String(x.id) === String(r.id));
            if (!p) return;
            p.stock = r.stockBefore;
            if (r.variantsBefore && Array.isArray(p.variants)) {
                r.variantsBefore.forEach((snap, i) => { if (p.variants[i]) p.variants[i].qty = snap.qty; });
            }
        });
        // BUG-5: restaurar window.products completo desde snapshot si hubo error en saveProducts
        if (_rollbackData) { window.products = JSON.parse(JSON.stringify(_rollbackData)); }
        console.error('[Inventario] Error al descontar — stock restaurado:', e);
        manekiToastExport('Error al descontar inventario. Se revirtió el stock.', 'err');
        throw e;
    }
    if (descontados > 0 && typeof saveProducts === 'function') {
        try {
            await saveProducts();
        } catch(saveErr) {
            // Restaurar productos desde snapshot si saveProducts falla
            if (_rollbackData) {
                window.products = JSON.parse(JSON.stringify(_rollbackData));
            }
            console.error('[Inventario] saveProducts falló — stock restaurado desde snapshot:', saveErr);
            manekiToastExport('Error al guardar inventario. Se revirtió el stock.', 'err');
            throw saveErr;
        }
    }
    return descontados;
}

function _esProductoEmpaque(mp) {
    return mp && (mp.esEmpaque || (mp.tags||[]).some(t => t.toLowerCase() === 'empaques' || t.toLowerCase() === 'empaque'));
}

function _descontarEmpaquesInventario(pedido) {
    const empaques = pedido.empaques || [];
    if (!empaques.length) return 0;
    let descontados = 0;
    const stockOriginal = [];
    for (const emp of empaques) {
        const mp = (window.products || []).find(p => String(p.id) === String(emp.id));
        if (!_esProductoEmpaque(mp)) continue;
        const qty = emp.quantity || 1;
        const antes = mp.stock || 0;
        const variantsBefore = Array.isArray(mp.variants) && mp.variants.length > 0
            ? mp.variants.map(v => ({ ...v }))
            : null;
        stockOriginal.push({ mp, antes, variantsBefore });
        mp.stock = Math.max(0, antes - qty);
        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({ productoId: mp.id, productoNombre: mp.name,
                tipo: 'salida', cantidad: -qty,
                motivo: `Empaque pedido ${pedido.folio}`,
                stockAntes: antes, stockDespues: mp.stock });
        }
        descontados++;
    }
    if (descontados > 0 && typeof saveProducts === 'function') {
        // saveProducts() es async — usar .catch() para manejar el fallo correctamente
        // (un try/catch sincrónico no puede capturar rechazos de Promises no awaited)
        saveProducts().catch(e => {
            stockOriginal.forEach(({ mp, antes, variantsBefore }) => {
                mp.stock = antes;
                if (variantsBefore && Array.isArray(mp.variants)) {
                    variantsBefore.forEach((snap, i) => { if (mp.variants[i]) mp.variants[i].qty = snap.qty; });
                }
            });
            console.error('[Empaques] saveProducts falló — stock revertido:', e);
        });
    }
    return descontados;
}
window._descontarEmpaquesInventario = _descontarEmpaquesInventario;

function _regresarEmpaquesInventario(pedido) {
    const empaques = pedido.empaques || [];
    if (!empaques.length) return;
    for (const emp of empaques) {
        const mp = (window.products || []).find(p => String(p.id) === String(emp.id));
        if (!_esProductoEmpaque(mp)) continue;
        const qty = emp.quantity || 1;
        const antes = mp.stock || 0;
        mp.stock = antes + qty;
        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({ productoId: mp.id, productoNombre: mp.name,
                tipo: 'entrada', cantidad: qty,
                motivo: `Devolución empaque cancelación ${pedido.folio}`,
                stockAntes: antes, stockDespues: mp.stock });
        }
    }
    if (typeof saveProducts === 'function') saveProducts();
}
window._regresarEmpaquesInventario = _regresarEmpaquesInventario;

function _regresarInventarioPedido(pedido) {
    const items = pedido.productosInventario || [];
    if (items.length === 0) return;
    items.forEach(item => {
        const prod = (window.products || []).find(p => String(p.id) === String(item.id));
        if (!prod) return;
        if (prod.tipo === 'servicio') return; // servicios no tienen stock físico
        const cantidad = item.quantity || item.cantidad || 1;
        const antes = prod.stock || 0;
        prod.stock = antes + cantidad;

        // FIX 6: also restore variant stock (mirrors _descontarInventarioPedido deduction logic)
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            if (item.variante) {
                const _colIdx = item.variante.indexOf(':');
                const _vType  = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
                const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : '';
                const _ptVar  = prod.variants.find(v =>
                    (v.type || v.tipo || '') === _vType && (v.value || v.valor || '') === _vValue
                );
                if (_ptVar) { _ptVar.qty = (_ptVar.qty || 0) + cantidad; }
            } else {
                // Sin variante registrada: devolver a la de mayor stock (espejo del descuento)
                const _varMayor = prod.variants.slice().sort((a, b) => (parseInt(b.qty)||0) - (parseInt(a.qty)||0))[0];
                if (_varMayor) _varMayor.qty = (_varMayor.qty || 0) + cantidad;
            }
            if (typeof syncStockFromVariants === 'function') syncStockFromVariants(prod);
            else prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
        }

        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({
                productoId: prod.id, productoNombre: prod.name,
                tipo: 'entrada', cantidad: cantidad,
                motivo: `Cancelación pedido ${pedido.folio} (sin producir)`,
                stockAntes: antes, stockDespues: prod.stock
            });
        }
    });
    // Restaurar materias primas también
    items.forEach(item => {
        const prod = (window.products || []).find(p => String(p.id) === String(item.id));
        const comps = (prod && prod.mpComponentes) ? prod.mpComponentes : [];
        const cantidad = item.quantity || item.cantidad || 1;
        comps.forEach(c => {
            const mp = (window.products || []).find(p => String(p.id) === String(c.id));
            if (!mp || mp.tipo === 'servicio') return;
            const _rph = prod.rendimientoPorHoja || 0;
            const cantMP = _rph > 0
                ? Math.ceil(cantidad / _rph) * (parseFloat(c.qty) || 1)
                : (parseFloat(c.qty) || 1) * cantidad;
            const antes = mp.stock || 0;
            mp.stock = antes + cantMP;
            if (typeof registrarMovimiento === 'function') {
                registrarMovimiento({ productoId: mp.id, productoNombre: mp.name,
                    tipo: 'entrada', cantidad: cantMP,
                    motivo: `Devolución MP cancelación ${pedido.folio}`,
                    stockAntes: antes, stockDespues: mp.stock });
            }
        });
    });
    if (typeof saveProducts === 'function') saveProducts();
}

// Regresa PT + MP al inventario (espejo de _descontarInventarioPedido)
function _regresarInventarioCompleto(pedido) {
    const items = pedido.productosInventario || [];
    if (items.length === 0) return;
    items.forEach(item => {
        const prod = (window.products || []).find(p => String(p.id) === String(item.id));
        if (!prod || prod.tipo === 'servicio') return;
        const cantidad = item.quantity || item.cantidad || 1;

        // Regresar stock del producto terminado (con soporte de variantes)
        const antesPT = prod.stock || 0;
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            if (item.variante) {
                const _colIdx = item.variante.indexOf(':');
                const _vType  = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
                const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : '';
                const _ptVar  = prod.variants.find(v => (v.type||v.tipo||'')===_vType && (v.value||v.valor||'')===_vValue);
                if (_ptVar) _ptVar.qty = (_ptVar.qty || 0) + cantidad;
            } else {
                const _varMayor = prod.variants.slice().sort((a, b) => (parseInt(b.qty)||0) - (parseInt(a.qty)||0))[0];
                if (_varMayor) _varMayor.qty = (_varMayor.qty || 0) + cantidad;
            }
            if (typeof syncStockFromVariants === 'function') syncStockFromVariants(prod);
            else prod.stock = prod.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
        } else {
            prod.stock = antesPT + cantidad;
        }
        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({
                productoId: prod.id, productoNombre: prod.name,
                tipo: 'entrada', cantidad: cantidad,
                motivo: `Eliminación pedido ${pedido.folio}`,
                stockAntes: antesPT, stockDespues: prod.stock
            });
        }

        // Regresar materia prima de los componentes
        if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0) {
            prod.mpComponentes.forEach(comp => {
                const mp = (window.products || []).find(p => String(p.id) === String(comp.id));
                if (!mp || mp.tipo === 'servicio') return;
                // FIX-2: usar la misma fórmula que _descontarInventarioPedido (considera rendimientoPorHoja)
                const rph = prod.rendimientoPorHoja || 1;
                const cantMP = Math.ceil(cantidad / rph) * (parseFloat(comp.qty) || 1);
                const antesMP = mp.stock || 0;

                // Devolver a la variante específica si aplica; sin variante → mayor stock
                if (Array.isArray(mp.variants) && mp.variants.length > 0) {
                    if (item.variante) {
                        const colonIdx = item.variante.indexOf(':');
                        const varType  = colonIdx !== -1 ? item.variante.slice(0, colonIdx).trim() : item.variante;
                        const varValue = colonIdx !== -1 ? item.variante.slice(colonIdx + 1).trim() : '';
                        const mpVar = mp.variants.find(v =>
                            (v.type || v.tipo || '') === varType && (v.value || v.valor || '') === varValue
                        );
                        if (mpVar) mpVar.qty = (mpVar.qty || 0) + cantMP;
                    } else {
                        const _varMayorMP = mp.variants.slice().sort((a, b) => (parseInt(b.qty)||0) - (parseInt(a.qty)||0))[0];
                        if (_varMayorMP) _varMayorMP.qty = (_varMayorMP.qty || 0) + cantMP;
                    }
                    if (typeof syncStockFromVariants === 'function') {
                        syncStockFromVariants(mp);
                    } else {
                        mp.stock = mp.variants.reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
                    }
                } else {
                    mp.stock = antesMP + cantMP;
                }

                if (typeof registrarMovimiento === 'function') {
                    registrarMovimiento({
                        productoId: mp.id, productoNombre: mp.name,
                        tipo: 'entrada', cantidad: cantMP,
                        motivo: `MP devuelta — eliminación pedido ${pedido.folio}`,
                        stockAntes: antesMP, stockDespues: mp.stock
                    });
                }
            });
        }
    });
    if (typeof saveProducts === 'function') saveProducts();
}

// ── Modal de estado ──
function openPedidoStatusModal(id) {
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    _pedidoStatusActualId = id;
    document.getElementById('pedidoStatusId').value = id;
    document.getElementById('pedidoStatusFolio').textContent = p.folio || '—';
    // #9 Timeline visual de estados
    let tlContainer = document.getElementById('pedidoStatusTimeline');
    if (!tlContainer) {
        const folioEl = document.getElementById('pedidoStatusFolio');
        if (folioEl) {
            tlContainer = document.createElement('div');
            tlContainer.id = 'pedidoStatusTimeline';
            tlContainer.style.cssText = 'margin:12px 0 4px;';
            folioEl.parentElement.insertAdjacentElement('afterend', tlContainer);
        }
    }
    if (tlContainer && typeof _mkTimeline === 'function') {
        tlContainer.innerHTML = _mkTimeline(p.status || 'confirmado');
    }
    openModal('pedidoStatusModal');
}

function closePedidoStatusModal() {
    closeModal('pedidoStatusModal');
}

function setPedidoStatus(status) {
    const id = document.getElementById('pedidoStatusId').value;
    const idx = (window.pedidos || []).findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;

    if (status === 'finalizado') {
        // GUARD: advertir si total = $0 antes de finalizar
        const _pedActual = window.pedidos[idx];
        const _totalActual = Number(_pedActual?.total || 0);
        const _confirMsg = _totalActual === 0
            ? '⚠️ Este pedido tiene total $0.00. ¿Deseas finalizarlo de todas formas sin precio registrado?'
            : '¿Marcar como finalizado? El pedido pasará al historial.';
        const _confirTitle = _totalActual === 0 ? '⚠️ Pedido sin precio' : '🎉 Finalizar';
        showConfirm(_confirMsg, _confirTitle).then(async ok => {
            if (!ok) return;
            if (!window.pedidosFinalizados) window.pedidosFinalizados = [];

            // Cobro al entregar: si queda saldo, ofrecer registrarlo antes de finalizar
            const _saldoACobrar = (typeof calcSaldoPendiente === 'function') ? calcSaldoPendiente(window.pedidos[idx]) : 0;
            if (_saldoACobrar > 0.01) {
                const _cobrar = await showConfirm(
                    `💰 Saldo pendiente: $${_saldoACobrar.toFixed(2)}. ¿Registrar cobro como Efectivo ahora?`,
                    '💰 Cobro al entregar'
                );
                if (_cobrar) {
                    const _cobroId = mkId();
                    const _fechaHoyStr = typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0];
                    if (!window.pedidos[idx].pagos) window.pedidos[idx].pagos = [];
                    window.pedidos[idx].pagos.push({
                        id: _cobroId, tipo: 'abono', monto: _saldoACobrar,
                        fecha: _fechaHoyStr,
                        hora: new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}),
                        metodo: 'efectivo', nota: 'Cobro al entregar'
                    });
                    // Registrar en salesHistory como abono para que aparezca en Balance/Reportes
                    if (!window.salesHistory) window.salesHistory = [];
                    window.salesHistory.push({
                        id: _cobroId, type: 'abono',
                        folio: window.pedidos[idx].folio,
                        date: _fechaHoyStr,
                        time: new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}),
                        customer: window.pedidos[idx].cliente || 'Cliente',
                        concept: `Cobro al entregar ${window.pedidos[idx].folio}`,
                        products: [], total: _saldoACobrar, method: 'Efectivo', note: 'Cobro al entregar'
                    });
                    // Registrar en incomes para Balance
                    if (Array.isArray(window.incomes)) {
                        window.incomes.push({
                            id: _cobroId,
                            concept: `Cobro al entregar ${window.pedidos[idx].folio}`,
                            amount: _saldoACobrar,
                            date: _fechaHoyStr,
                            folioOrigen: window.pedidos[idx].folio
                        });
                        if (typeof saveIncomes === 'function') saveIncomes();
                    }
                }
            }

            const p = {
                ...window.pedidos[idx],
                status: 'finalizado',
                fechaFinalizado: new Date().toISOString(),
                productosInventario: (window.pedidos[idx].productosInventario || []).map(i => ({...i}))
            };
            _eliminarFotoStorageAlFinalizar(p); // liberar espacio en Supabase Storage

            // FIX PE-0013: si total = 0 pero hay ítems de inventario, recalcular
            // (ocurre cuando el pedido fue creado antes de que se guardara el precio correctamente)
            if (!p.total && (p.productosInventario || []).length > 0) {
                const _centsTotal = (p.productosInventario || []).reduce((s, it) => {
                    const precio = parseFloat(it.price || it.precio || 0);
                    const cant   = parseInt(it.quantity || it.cantidad || 1, 10);
                    return s + Math.round(precio * 100) * cant;
                }, 0);
                p.total = _centsTotal / 100;
                if (!p.costo) p.costo = p.total;
            }

            // Descontar inventario (PT + MP) si no se hizo al pasar a producción
            if ((p.productosInventario || []).length > 0 && !p.inventarioDescontado) {
                // FIX-ASYNC: _descontarInventarioPedido es async — await para leer el conteo real
                const _nDescont = await _descontarInventarioPedido(p);
                if (_nDescont > 0) {
                    p.inventarioDescontado = true;
                    p._inventarioYaFinalizado = true;
                }
            }
            // Descontar empaques si no se hicieron al pasar a producción
            if ((p.empaques || []).length > 0 && !p.empaquesDescontados) {
                const _nEmp = _descontarEmpaquesInventario(p);
                if (_nEmp > 0) p.empaquesDescontados = true;
            }

            const _idFinalizado = String(p.id);
            window.pedidosFinalizados.push(p);
            window.pedidos.splice(idx, 1);
            savePedidos();
            savePedidosFinalizados();
            // FIX-HISTORIAL: upsert no elimina — borrar de orders para que no reaparezca al recargar
            if (typeof (window as any).deletePedidoActivo === 'function') (window as any).deletePedidoActivo(_idFinalizado);

            // ── FIX: Registrar pedido finalizado en salesHistory para Reportes y Balance ──
            // Solo registrar lo que RESTABA por cobrar. Los anticipos/abonos anteriores
            // ya están en salesHistory como type:'anticipo' o type:'abono'.
            if (!window.salesHistory) window.salesHistory = [];
            // type='venta' = formato antiguo (pre-migración relacional) — cuenta como registrado
            const yaRegistrado = window.salesHistory.some(s => s.folio === p.folio && (s.type === 'pedido' || s.type === 'venta'));
            if (!yaRegistrado && Number(p.total || 0) > 0) {
                const _saldoFinal = typeof calcSaldoPendiente === 'function'
                    ? calcSaldoPendiente(p)
                    : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
                const saleRecord = {
                    id: mkId(),
                    type: 'pedido',
                    folio: p.folio,
                    date: (function(){ const _d = new Date(p.fechaFinalizado || Date.now()); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })(),
                    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                    customer: p.cliente || 'Cliente',
                    concept: p.concepto || p.folio,
                    products: (p.productosInventario || []).map(i => ({
                        id: i.id || i.productId || '',
                        name: i.name || i.nombre || i.concepto || p.concepto || '—',
                        quantity: Number(i.quantity || i.cantidad || 1),
                        price: Number(i.price || i.precio || 0),
                        subtotal: Number(i.quantity || 1) * Number(i.price || i.precio || 0),
                        cost: Number(i.cost || i.costo || 0)
                    })),
                    total: _saldoFinal,
                    totalPedido: Number(p.total || 0),
                    anticipo: Number(p.anticipo || 0),
                    method: (p.pagos && p.pagos.length > 0)
                        ? (p.pagos[p.pagos.length - 1].metodo || p.pagos[p.pagos.length - 1].method || 'Efectivo')
                        : (p.metodoPago || p.metodo || 'Efectivo'),
                    note: p.notas || ''
                };
                // Solo registrar si queda saldo por cobrar (si ya estaba 100% pagado, no crear registro de $0)
                if (_saldoFinal > 0) {
                    window.salesHistory.push(saleRecord);
                    if (typeof saveSalesHistory === 'function') saveSalesHistory();
                }
            }

            closePedidoStatusModal();
            renderPedidosTable();
            manekiToastExport('🎉 Pedido finalizado: ' + p.folio, 'ok');
            // #1 Confetti celebration
            if (typeof window.mkConfetti === 'function') window.mkConfetti();
            if (typeof abrirRoiEquiposModal === 'function') abrirRoiEquiposModal(p);

            // MEJ-17: actualizar estadísticas del cliente al finalizar pedido.
            // totalPurchases solo se actualizaba en ventas POS, dejando a clientes
            // de solo-pedidos con $0.00 y sin marcar como VIP aunque hubieran gastado mucho.
            if (p.cliente && window.clients) {
                const nombreNorm = p.cliente.toLowerCase().trim();
                const cli = window.clients.find(c =>
                    (p.clienteId && String(c.id) === String(p.clienteId)) ||
                    (c.name || '').toLowerCase().trim() === nombreNorm
                );
                if (cli) {
                    cli.totalPurchases = (Number(cli.totalPurchases) || 0) + Number(p.total || 0);
                    const fechaHoy = _fechaHoy();
                    if (!cli.lastPurchase || fechaHoy > cli.lastPurchase) cli.lastPurchase = fechaHoy;
                    // Promover a VIP si supera $5,000 en compras acumuladas
                    if (!cli.isVIP && cli.totalPurchases >= 5000) {
                        cli.isVIP = true;
                        cli.type = 'vip';
                        manekiToastExport(`⭐ ${cli.name} ascendido a VIP`, 'ok');
                    }
                    if (typeof saveClients === 'function') saveClients();
                }
            }
        });

    } else if (status === 'cancelado') {
        const pedido = window.pedidos[idx];
        const tieneProductos = (pedido.productosInventario || []).length > 0;

        showConfirm(`¿Cancelar el pedido ${pedido.folio || ''}?`, '❌ Sí, cancelar').then(ok => {
            if (!ok) return;

            const aplicarCancelacion = (esMerma) => {
                // Snapshot para undo
                const statusAnterior = pedido.status;
                // FIX-UNDO-CANCEL: capturar flags ANTES de que cancelar los modifique (pedido es referencia)
                const _invDescAntes = pedido.inventarioDescontado === true;
                const _empDescAntes = pedido.empaquesDescontados === true;
                const folioLabel = pedido.folio || pedido.id;
                if (typeof window.mkPushUndo === 'function') {
                    window.mkPushUndo(`Cancelar pedido ${folioLabel}`, () => {
                        const p = window.pedidos.find(x => String(x.id) === String(pedido.id));
                        if (p && p.status === 'cancelado') {
                            p.status = statusAnterior;
                            delete p.fechaCancelado;
                            // FIX-UNDO-CANCEL: re-descontar inventario si fue devuelto al cancelar
                            // para que el pedido quede consistente al volver a activo
                            if (_invDescAntes && typeof _descontarInventarioPedido === 'function') {
                                _descontarInventarioPedido(p).catch((e: any) => console.error('[Undo cancel] Error re-descontando:', e));
                                p.inventarioDescontado = true;
                            }
                            if (_empDescAntes && typeof _descontarEmpaquesInventario === 'function') {
                                _descontarEmpaquesInventario(p);
                                p.empaquesDescontados = true;
                            }
                            if (typeof savePedidos === 'function') savePedidos();
                            if (typeof renderPedidosTable === 'function') renderPedidosTable();
                        }
                    });
                    if (typeof window.mkMostrarUndoHint === 'function') window.mkMostrarUndoHint(`Cancelar pedido ${folioLabel}`);
                }

                window.pedidos[idx].status = 'cancelado';
                window.pedidos[idx].fechaCancelado = new Date().toISOString();
                if (!esMerma && pedido.inventarioDescontado) {
                    _regresarInventarioCompleto(window.pedidos[idx]);
                    window.pedidos[idx].inventarioDescontado = false;
                    if (pedido.empaquesDescontados) {
                        _regresarEmpaquesInventario(window.pedidos[idx]);
                        window.pedidos[idx].empaquesDescontados = false;
                    }
                    manekiToastExport('❌ Pedido cancelado — productos y materia prima devueltos al inventario.', 'warn');
                } else {
                    manekiToastExport('❌ Pedido cancelado' + (esMerma ? ' — materiales registrados como merma.' : '.'), 'warn');
                }
                savePedidos();
                closePedidoStatusModal();
                renderPedidosTable();
            };

            if (tieneProductos) {
                showConfirm(
                    `¿Ya comenzaste a trabajar en el pedido ${pedido.folio || ''}?\n\n` +
                    `✅ Sí → Los materiales se quedan como merma.\n` +
                    `❌ No → Los materiales regresan al inventario.`,
                    '🔧 Sí, ya se trabajó'
                ).then(yaProducido => aplicarCancelacion(yaProducido));
            } else {
                aplicarCancelacion(true);
            }
        });

    } else {
        // R2-A3: bloquear "salida" si el pedido es a domicilio y no tiene dirección de entrega
        if (status === 'salida') {
            const _pedSalida = window.pedidos[idx];
            const _tipo = (_pedSalida.tipoEntrega || _pedSalida.entrega_tipo || '').toLowerCase();
            // Considerar domicilio cuando el campo tipoEntrega lo indica, o cuando no hay tipo definido
            // y el pedido no tiene lugar de entrega (la columna "Salida" implica salida a domicilio)
            // B9: solo requerir dirección si el tipo indica entrega a domicilio explícitamente
            const _esDomicilio = _tipo.includes('domicilio') || _tipo.includes('envio') || _tipo.includes('envío');
            const _sinDireccion = !(_pedSalida.lugarEntrega || '').trim();
            if (_esDomicilio && _sinDireccion) {
                manekiToastExport('Agrega una dirección de entrega antes de marcar como Salida', 'warn');
                return;
            }
        }
        // Auto-descontar inventario al pasar a producción
        if (status === 'produccion') {
            const pedido = window.pedidos[idx];
            // FIX 4: validate total > 0 before allowing transition to produccion
            if (!pedido.total || Number(pedido.total) <= 0) {
                manekiToastExport('⚠️ El pedido no tiene total asignado. Agrega un precio antes de pasar a producción.', 'warn');
                return;
            }
            // FIX 2: guard BEFORE deduction — if already deducted, warn and return
            if (pedido.inventarioDescontado) {
                manekiToastExport('⚠️ El inventario ya fue descontado para este pedido', 'warn');
            } else if ((pedido.productosInventario || []).length > 0) {
                // BUG-1 FIX: _descontarInventarioPedido es async — fire+flag pattern.
                // El descuento en memoria ocurre antes del primer await interno de la función,
                // por lo que marcar inventarioDescontado=true de inmediato es correcto.
                _descontarInventarioPedido(pedido).then((n: number) => {
                    if (n > 0) manekiToastExport(`📦 ${n} material(es) descontado(s) del inventario.`, 'ok');
                }).catch((e: any) => console.error('[Inv setPedidoStatus]', e));
                window.pedidos[idx].inventarioDescontado = true;
            }
            // Descontar empaques del pedido
            if ((pedido.empaques || []).length > 0 && !pedido.empaquesDescontados) {
                const nEmp = _descontarEmpaquesInventario(pedido);
                if (nEmp > 0) {
                    window.pedidos[idx].empaquesDescontados = true;
                    manekiToastExport(`📦 ${nEmp} empaque(s) descontado(s).`, 'ok');
                }
            }
        }
        window.pedidos[idx].status = status;
        window.pedidos[idx].fechaUltimoEstado = new Date().toISOString();
        // MEJORA 2A: registrar historial de estados con timestamp
        if (!window.pedidos[idx].historialEstados) window.pedidos[idx].historialEstados = [];
        window.pedidos[idx].historialEstados.push({
            estado: status,
            fecha: (typeof _fechaHoy === 'function') ? _fechaHoy() : new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})
        });
        savePedidos();
        if (window.MKS) MKS.tick();
        closePedidoStatusModal();
        renderPedidosTable();
        manekiToastExport('Estado actualizado ✓', 'ok');
        // NTH-04: sugerir notificación WhatsApp al mover a produccion o salida
        const _pedWa = window.pedidos[idx];
        if ((status === 'produccion' || status === 'salida') && _pedWa && _pedWa.telefono) {
            setTimeout(() => {
                manekiToastExport(
                    `📲 ¿Notificar a ${_pedWa.cliente || 'el cliente'} por WhatsApp?`,
                    'info'
                );
            }, 800);
        }
        // FEATURE-2: botón "Pedir reseña de Google" al entregar
        if (status === 'entregado' || status === 'completado') {
            _sugerirResenaGoogle(window.pedidos[idx]);
        }
    }
}

// ── Abono a pedido ──
function openAbonoPedido(id) {
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById('abonoPedidoId').value = id;
    // Historial de pagos registrados
    const _pagosHist = (p.pagos || []).slice().reverse();
    const _historialHTML = _pagosHist.length > 0 ? `
        <div style="margin-bottom:16px;background:#f9fafb;border-radius:12px;padding:12px;border:1px solid #e5e7eb;">
            <div style="font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Pagos registrados</div>
            ${_pagosHist.map(pg => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6;">
                    <div>
                        <span style="font-size:.82rem;color:#374151;font-weight:600;">$${Number(pg.monto||pg.amount||0).toFixed(2)}</span>
                        <span style="font-size:.72rem;color:#9ca3af;margin-left:6px;">${pg.metodo||pg.method||''}</span>
                    </div>
                    <span style="font-size:.72rem;color:#9ca3af;">${pg.fecha||pg.date||''}</span>
                </div>`).join('')}
            <div style="text-align:right;font-size:.78rem;font-weight:700;color:#059669;margin-top:6px;">
                Total pagado: $${_pagosHist.reduce((s,pg)=>s+(Number(pg.monto||pg.amount||0)),0).toFixed(2)}
            </div>
        </div>` : '';
    document.getElementById('abonoPedidoInfo').innerHTML = `
        <p><b>Cliente:</b> ${typeof _esc==='function'?_esc(p.cliente):p.cliente}</p>
        <p><b>Folio:</b> ${typeof _esc==='function'?_esc(p.folio):p.folio}</p>
        <p><b>Total:</b> $${Number(p.total||0).toFixed(2)}</p>
        <p><b>Anticipo:</b> $${Number(p.anticipo||0).toFixed(2)}</p>
        <p class="font-bold text-red-600"><b>Saldo:</b> $${(typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : Math.max(0, Number(p.total||0) - Number(p.anticipo||0))).toFixed(2)}</p>
        ${_historialHTML}`;
    document.getElementById('abonoPedidoMonto').value = '';
    document.getElementById('abonoPedidoNota').value = '';
    _abonoPedidoMetodo = 'cash';
    document.querySelectorAll('.abono-ped-btn').forEach((b, i) => {
        b.style.borderColor = i === 0 ? '#C5A572' : '';
        b.style.background  = i === 0 ? '#FFF9F0' : '';
    });
    openModal('abonoPedidoModal');
}

function cerrarAbonoPedido() {
    closeModal('abonoPedidoModal');
}

function selectAbonoPedidoMethod(btn, method) {
    _abonoPedidoMetodo = method;
    document.querySelectorAll('.abono-ped-btn').forEach(b => { b.style.borderColor = ''; b.style.background = ''; });
    btn.style.borderColor = '#C5A572'; btn.style.background = '#FFF9F0';
}

let _abonoEnProceso = false;
async function confirmarAbonoPedido() {
    // BUG-PED-001 FIX: guard anti doble-click — evita que un doble-clic rápido
    // registre el mismo abono dos veces antes de que se cierre el modal.
    if (_abonoEnProceso) return;
    _abonoEnProceso = true;
    const btn = document.querySelector('#abonoModal button[onclick*="confirmarAbono"]') ||
                document.querySelector('[onclick="confirmarAbonoPedido()"]');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
    // FIX: safety timeout — liberar lock si el abono tarda más de 30 segundos
    const _abonoLockTimeout = setTimeout(() => {
        if (_abonoEnProceso) {
            _abonoEnProceso = false;
            const _btn = document.querySelector('#abonoModal button[onclick*="confirmarAbono"]') ||
                         document.querySelector('[onclick="confirmarAbonoPedido()"]');
            if (_btn) { _btn.disabled = false; _btn.style.opacity = ''; }
            manekiToastExport('⚠️ El guardado tardó demasiado. Intenta de nuevo.', 'warn');
        }
    }, 30000);
    try {
    const id = document.getElementById('abonoPedidoId').value;
    const monto = parseFloat(document.getElementById('abonoPedidoMonto').value);
    if (!monto || monto <= 0) { manekiToastExport('Ingresa un monto válido.', 'warn'); _abonoEnProceso = false; if (btn) { btn.disabled = false; btn.style.opacity = ''; } return; }
    const nota = document.getElementById('abonoPedidoNota').value.trim();
    const idx = (window.pedidos || []).findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    const p = window.pedidos[idx];
    const calcSaldo = typeof calcSaldoPendiente === 'function'
        ? calcSaldoPendiente(p)
        : Math.max(0, Number(p.total||0) - Number(p.anticipo||0));
    if (monto > calcSaldo + 0.01) {
        const ok = await showConfirm(`El abono ($${monto.toFixed(2)}) supera el saldo pendiente ($${calcSaldo.toFixed(2)}). ¿Registrar de todas formas?`);
        if (!ok) { _abonoEnProceso = false; if (btn) { btn.disabled = false; btn.style.opacity = ''; } return; }
    }
    if (!p.pagos) p.pagos = [];
    const _d = new Date();
    const abonoId = mkId();
    const _fechaLocal = _d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');

    // ── ROLLBACK FIX: guardar copias antes de mutar para poder restaurar si falla el save ──
    const _pagosBefore       = p.pagos.slice();
    const _incomesBefore     = Array.isArray(window.incomes)     ? window.incomes.slice()     : undefined;
    const _salesHistBefore   = window.salesHistory !== undefined ? window.salesHistory.slice() : undefined;

    p.pagos.push({
        id: abonoId,
        tipo: 'abono',
        monto, metodo: _abonoPedidoMetodo, nota,
        fecha: _fechaLocal,
        hora: _d.toLocaleTimeString('es-MX', {hour:'2-digit',minute:'2-digit'})
    });
    // normalizarResta recalcula anticipo y resta desde pagos[] — nunca acumular manualmente
    normalizarResta();

    // ── BUG-006 FIX: Registrar abono en Balance (incomes) ──
    // BUG-PED-02 FIX: incluir folioOrigen para que renderBalance() pueda deduplicar
    // este income cuando el pedido se finalice (totalPedidosFin excluye folios en incomes).
    if (Array.isArray(window.incomes)) {
        window.incomes.push({
            id: abonoId,
            concept: `Abono pedido ${p.folio}`,
            amount: monto,
            date: _fechaLocal,
            folioOrigen: p.folio
        });
    }

    // ── FIX: Registrar abono en salesHistory para Reportes ──
    if (window.salesHistory !== undefined) {
        window.salesHistory.push({
            id: abonoId,
            type: 'abono',
            folio: p.folio,
            date: _fechaLocal,
            time: _d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            customer: p.cliente || 'Cliente',
            concept: `Abono pedido ${p.folio}`,
            products: [],
            total: monto,
            method: _abonoPedidoMetodo === 'cash' ? 'Efectivo' : _abonoPedidoMetodo === 'card' ? 'Tarjeta' : 'Transferencia',
            note: nota
        });
    }

    // ── Persistir todo al final; si falla, revertir mutaciones en memoria ──
    try {
        await savePedidos();
        if (Array.isArray(window.incomes) && typeof saveIncomes === 'function') saveIncomes();
        if (window.salesHistory !== undefined) {
            if (typeof saveSalesHistory === 'function') saveSalesHistory();
        }
        if (typeof window._invalidarCacheVentas === 'function') window._invalidarCacheVentas();
    } catch (_saveErr) {
        // Revertir mutaciones en memoria para mantener consistencia
        p.pagos = _pagosBefore;
        normalizarResta();
        if (_incomesBefore !== undefined)   window.incomes      = _incomesBefore;
        if (_salesHistBefore !== undefined) window.salesHistory = _salesHistBefore;
        console.error('confirmarAbonoPedido: fallo al guardar, se revirtieron cambios.', _saveErr);
        manekiToastExport('❌ Error al guardar el abono. Intenta de nuevo.', 'error');
        _abonoEnProceso = false;
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
        return;
    }

    cerrarAbonoPedido();
    renderPedidosTable();
    manekiToastExport(`✅ Abono de $${monto.toFixed(2)} registrado.`, 'ok');
    } finally {
        // BUG-PED-001 FIX: liberar el lock siempre, incluso si hubo excepción
        clearTimeout(_abonoLockTimeout);
        _abonoEnProceso = false;
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    }
}

// ── Drag & Drop ──
function kanbanDragStart(event, id) {
    _kanbanDragId = id;
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.style.opacity = '0.5';
}
function kanbanDragEnd(event) { event.currentTarget.style.opacity = ''; }
function kanbanDragOver(event, col) {
    event.preventDefault();
    const el = document.getElementById('kCol-' + col);
    if (el) el.style.background = '#FFF9F0';
}
function kanbanDragLeave(event) {
    if (event.currentTarget) event.currentTarget.style.background = '';
}
async function kanbanDrop(event, newStatus) {
    event.preventDefault();
    const el = document.getElementById('kCol-' + newStatus);
    if (el) el.style.background = '';
    if (!_kanbanDragId) return;
    // UX1: loading visual en la card mientras se procesa el cambio de estado
    const _dropCard = document.querySelector(`.kanban-card[data-id="${_kanbanDragId}"]`) as HTMLElement|null;
    if (_dropCard) { _dropCard.style.opacity = '0.45'; _dropCard.style.pointerEvents = 'none'; }
    const idx = (window.pedidos || []).findIndex(p => String(p.id) === String(_kanbanDragId));
    if (idx !== -1) {
        if (newStatus === 'finalizado' || newStatus === 'completado') {
            const pedido = window.pedidos[idx];
            const ok = await showConfirm(
                `¿Finalizar el pedido ${pedido.folio || ''}? Esta acción lo moverá al historial.`,
                '📦 Finalizar pedido'
            );
            if (!ok) {
                if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
                _kanbanDragId = null;
                return;
            }
        }
        if (newStatus === 'produccion') {
            const pedido = window.pedidos[idx];
            // FIX 4: validate total > 0 before allowing drag-to-produccion
            if (!pedido.total || Number(pedido.total) <= 0) {
                manekiToastExport('⚠️ El pedido no tiene total asignado. Agrega un precio antes de pasar a producción.', 'warn');
                _kanbanDragId = null;
                return;
            }
            // FIX 2: guard BEFORE deduction — if already deducted, warn; otherwise deduct
            if (pedido.inventarioDescontado) {
                manekiToastExport('⚠️ El inventario ya fue descontado para este pedido', 'warn');
            } else if ((pedido.productosInventario || []).length > 0) {
                // BUG-2 FIX: fire+flag — igual que setPedidoStatus
                _descontarInventarioPedido(pedido).then((n: number) => {
                    if (n > 0) manekiToastExport(`📦 ${n} material(es) descontado(s) del inventario.`, 'ok');
                }).catch((e: any) => {
                    console.error('[Inv kanbanDrop]', e);
                    manekiToastExport('⚠️ Error al descontar inventario.', 'err');
                });
                window.pedidos[idx].inventarioDescontado = true;
            }
        }
        // R2-A3: bloquear arrastrar a "salida" si el pedido no tiene dirección de entrega
        if (newStatus === 'salida') {
            const _pedSalida = window.pedidos[idx];
            const _tipo = (_pedSalida.tipoEntrega || _pedSalida.entrega_tipo || '').toLowerCase();
            // B9: solo requerir dirección si el tipo indica entrega a domicilio explícitamente
            const _esDomicilio = _tipo.includes('domicilio') || _tipo.includes('envio') || _tipo.includes('envío');
            const _sinDireccion = !(_pedSalida.lugarEntrega || '').trim();
            if (_esDomicilio && _sinDireccion) {
                manekiToastExport('Agrega una dirección de entrega antes de marcar como Salida', 'warn');
                _kanbanDragId = null;
                return;
            }
        }
        // N-KANBAN-005: capturar status anterior para undo visual si falla
        const statusAnterior = window.pedidos[idx].status;
        window.pedidos[idx].status = newStatus;
        window.pedidos[idx].fechaUltimoEstado = new Date().toISOString();
        if (!window.pedidos[idx].historialEstados) window.pedidos[idx].historialEstados = [];
        window.pedidos[idx].historialEstados.push({
            estado: newStatus,
            fecha: typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})
        });
        const _pedidoMovidoId = _kanbanDragId;
        try {
            await savePedidos();
            renderPedidosTable();
            if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
            // N-ANIM-002: animación al mover card exitosamente
            const movedCard = document.querySelector(`[data-kanban-id="${_pedidoMovidoId}"], [data-id="${_pedidoMovidoId}"]`);
            if (movedCard) {
                (movedCard as HTMLElement).classList.remove('mk-kanban-card-moved');
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    (movedCard as HTMLElement).classList.add('mk-kanban-card-moved');
                }));
            }
        } catch(e) {
            // N-KANBAN-005: undo visual — restaurar status anterior
            window.pedidos[idx].status = statusAnterior;
            window.pedidos[idx].historialEstados.pop();
            const errorCard = document.querySelector(`[data-kanban-id="${_pedidoMovidoId}"], [data-id="${_pedidoMovidoId}"]`);
            if (errorCard) {
                (errorCard as HTMLElement).classList.add('mk-kanban-card-error');
            }
            manekiToastExport('❌ No se pudo mover el pedido — estado restaurado', 'err');
            if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
            else renderPedidosTable();
        }
    }
    _kanbanDragId = null;
}

// ── Selección en lote Kanban (MEJORA 4) ──────────────────────────────────────
let _kanbanSeleccionados = new Set();

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
    let barra = document.getElementById('_kanbanBarraLote');
    if (n === 0) {
        if (barra) barra.style.display = 'none';
        return;
    }
    if (!barra) {
        barra = document.createElement('div');
        barra.id = '_kanbanBarraLote';
        barra.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:1000;background:#1f2937;color:white;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,0.25);';
        document.body.appendChild(barra);
    }
    barra.style.display = 'flex';
    barra.innerHTML = `
        <span style="font-weight:700;font-size:.9rem;">${n} seleccionado${n!==1?'s':''}</span>
        <select id="_kanbanLoteStatus" style="padding:6px 12px;border-radius:8px;border:none;font-size:.85rem;background:#374151;color:white;outline:none;">
            <option value="confirmado">✅ Confirmado</option>
            <option value="pago">💰 Pago</option>
            <option value="produccion">🔧 Producción</option>
            <option value="envio">📦 Envío</option>
            <option value="salida">🚚 Salió</option>
            <option value="retirar">🏪 Retirar</option>
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
    const nuevoStatus = document.getElementById('_kanbanLoteStatus')?.value;
    if (!nuevoStatus) return;
    const _fecha = typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0];
    let cambiados = 0;
    let finalizados = 0;
    const _idsFinalizadosLote: string[] = [];

    _kanbanSeleccionados.forEach(id => {
        const idx = (window.pedidos || []).findIndex(p => String(p.id) === String(id));
        if (idx === -1) return;
        const p = window.pedidos[idx];

        // Registrar en historialEstados para cualquier status (key: estado para compatibilidad con timeline)
        p.historialEstados = [...(p.historialEstados || []), {
            estado: nuevoStatus,
            fecha: _fecha,
            hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            nota: 'Cambio en lote'
        }];

        if (nuevoStatus === 'finalizado' || nuevoStatus === 'entregado') {
            // Guard de negocio: mover a finalizados igual que el flujo normal
            if (!window.pedidosFinalizados) window.pedidosFinalizados = [];
            const pedidoFin = {
                ...p,
                status: nuevoStatus,
                fechaFinalizado: _fecha
            };
            // Descontar inventario si no se hizo antes
            // FIX-ASYNC: _descontarInventarioPedido es async; el descuento en memoria
            // ocurre antes del primer await, así que disparar + marcar flag inmediatamente es correcto
            if ((pedidoFin.productosInventario || []).filter((i: any) => i.id && i.id !== 'libre').length > 0 && !pedidoFin.inventarioDescontado) {
                _descontarInventarioPedido(pedidoFin).catch((e: any) => console.error('[Lote] Error al descontar inventario:', e));
                pedidoFin.inventarioDescontado = true;
                pedidoFin._inventarioYaFinalizado = true;
            }
            // Descontar empaques si no se hicieron antes
            if ((pedidoFin.empaques || []).length > 0 && !pedidoFin.empaquesDescontados) {
                const nEmp = _descontarEmpaquesInventario(pedidoFin);
                if (nEmp > 0) pedidoFin.empaquesDescontados = true;
            }
            window.pedidosFinalizados.push(pedidoFin);
            // Registrar en salesHistory igual que el flujo individual
            // FIX-LOTE-TOTAL: usar calcSaldoPendiente igual que el flujo individual (no pedidoFin.total)
            // para no doble-contar anticipos/abonos ya registrados en salesHistory
            if (typeof window.salesHistory !== 'undefined' && Number(pedidoFin.total) > 0) {
                const _yaRegLote = window.salesHistory.some((s: any) => s.folio === pedidoFin.folio && (s.type === 'pedido' || s.type === 'venta'));
                const _saldoLote = typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(pedidoFin) : Number(pedidoFin.total);
                if (!_yaRegLote && _saldoLote > 0) {
                    window.salesHistory.push({
                        id: pedidoFin.id, type: 'pedido', folio: pedidoFin.folio,
                        date: _fecha, customer: pedidoFin.cliente,
                        concept: pedidoFin.concepto || 'Pedido finalizado',
                        total: _saldoLote, method: 'Pedido',
                        products: pedidoFin.productosInventario || []
                    });
                    if (typeof saveSalesHistory === 'function') saveSalesHistory();
                    if (typeof window._invalidarCacheVentas === 'function') window._invalidarCacheVentas();
                }
            }
            // Actualizar totalPurchases del cliente
            if (pedidoFin.cliente && typeof window.clients !== 'undefined') {
                const _cl = (window.clients||[]).find(c => (c.name||'').toLowerCase().trim() === (pedidoFin.cliente||'').toLowerCase().trim());
                if (_cl) { _cl.totalPurchases = (_cl.totalPurchases||0) + Number(pedidoFin.total||0); if (typeof saveClients==='function') saveClients(); }
            }
            _idsFinalizadosLote.push(String(p.id));
            window.pedidos.splice(idx, 1);
            finalizados++;
        } else {
            // Guard de negocio: descontar inventario al pasar a producción
            // BUG-3 FIX: fire+flag — _descontarInventarioPedido es async
            if (nuevoStatus === 'produccion' && !p.inventarioDescontado) {
                if ((p.productosInventario || []).length > 0) {
                    _descontarInventarioPedido(p).catch((e: any) => console.error('[Lote inv]', e));
                    p.inventarioDescontado = true;
                }
            }
            p.status = nuevoStatus;
            p.fechaUltimoEstado = new Date().toISOString();
        }
        cambiados++;
    });

    if (cambiados > 0) {
        savePedidos();
        if (finalizados > 0) {
            savePedidosFinalizados();
            renderHistorialPedidos();
            // FIX-HISTORIAL: borrar de orders los pedidos finalizados en lote
            if (typeof (window as any).deletePedidoActivo === 'function') {
                _idsFinalizadosLote.forEach(id => (window as any).deletePedidoActivo(id));
            }
        }
        _kanbanSeleccionados.clear();
        _actualizarBarraLote();
        if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
        else if (typeof renderKanban === 'function') renderKanban();
        const msgFin = finalizados > 0 ? ` (${finalizados} finalizado${finalizados!==1?'s':''})` : '';
        manekiToastExport(`✅ ${cambiados} pedido${cambiados!==1?'s':''} actualizados a "${nuevoStatus}"${msgFin}.`, 'ok');
    }
}
window._aplicarCambioLote = _aplicarCambioLote;

function _cancelarSeleccionLote() {
    _kanbanSeleccionados.clear();
    _actualizarBarraLote();
    renderKanbanBoard(); // para desmarcar checkboxes
}
window._cancelarSeleccionLote = _cancelarSeleccionLote;

// ── Modo Compacto ──
function toggleKanbanCompacto() {
    _kanbanCompacto = !_kanbanCompacto;
    const btn = document.getElementById('btnKanbanCompacto');
    if (btn) { btn.style.background = _kanbanCompacto ? '#C5A572' : ''; btn.style.color = _kanbanCompacto ? 'white' : ''; }
    renderKanbanBoard();
}

// ── Reactivar pedido finalizado/cancelado → volver a activo ─────────────────
function reactivarPedido(id) {
    // Buscar primero en finalizados
    let idx = (window.pedidosFinalizados || []).findIndex(x => String(x.id) === String(id));
    let fuente = 'finalizados';

    // Si no está en finalizados, buscar en pedidos activos con status cancelado
    if (idx === -1) {
        idx = (window.pedidos || []).findIndex(x => String(x.id) === String(id) && (x.status === 'cancelado' || x.status === 'cancelar'));
        fuente = 'cancelado';
    }

    if (idx === -1) { manekiToastExport('⚠️ Pedido no encontrado.', 'warn'); return; }

    const p = fuente === 'finalizados' ? window.pedidosFinalizados[idx] : window.pedidos[idx];
    showConfirm(
        `¿Reactivar el pedido <strong>${typeof _esc==='function'?_esc(p.folio||p.id):p.folio||p.id}</strong> de <strong>${typeof _esc==='function'?_esc(p.cliente||'—'):p.cliente||'—'}</strong>?<br><small style="color:#6b7280;">Volverá al kanban como "Confirmado".</small>`,
        '↩ Reactivar pedido'
    ).then(ok => {
        if (!ok) return;
        if (!window.pedidos) window.pedidos = [];

        const _fecha = typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0];

        // BUG-4 FIX: si el inventario ya fue descontado, devolverlo antes de resetear el flag.
        // Al reactivar, el pedido vuelve a "confirmado" y al pasar a producción se descontará de nuevo.
        if (p.inventarioDescontado || p._inventarioYaFinalizado) {
            if (typeof _regresarInventarioCompleto === 'function') {
                _regresarInventarioCompleto(p);
            }
        }
        if (p.empaquesDescontados) {
            if (typeof _regresarEmpaquesInventario === 'function') {
                _regresarEmpaquesInventario(p);
            }
        }

        const reactivado = {
            ...p,
            status: 'confirmado',
            inventarioDescontado: false,
            _inventarioYaFinalizado: false,
            empaquesDescontados: false
        };
        delete reactivado.fechaFinalizado;
        delete reactivado.fechaCancelado;

        // Registrar en historialEstados
        if (!reactivado.historialEstados) reactivado.historialEstados = [];
        reactivado.historialEstados.push({
            estado: 'confirmado',
            fecha: _fecha,
            hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            nota: 'Reactivado desde historial'
        });

        if (fuente === 'finalizados') {
            const _idReactivado = String(p.id);
            window.pedidosFinalizados.splice(idx, 1);
            window.pedidos.push(reactivado);
            savePedidos();
            savePedidosFinalizados();
            // FIX-HISTORIAL: borrar de orders_finalizados para que no reaparezca en historial
            if (typeof (window as any).deletePedidoFinalizado === 'function') (window as any).deletePedidoFinalizado(_idReactivado);
        } else {
            // Cancelado en window.pedidos — solo cambiar el status
            window.pedidos[idx] = reactivado;
            savePedidos();
        }

        renderHistorialPedidos();
        renderPedidosTable();
        manekiToastExport(`↩ Pedido ${p.folio || p.id} reactivado.`, 'ok');
    });
}
window.reactivarPedido = reactivarPedido;

// ── Historial finalizados ──
// NTH-06: Paginación para historial de pedidos finalizados
let _histPage = 1;
const _HIST_PER_PAGE = 20;

function cambiarPaginaHistorial(dir) {
    _histPage = Math.max(1, _histPage + dir);
    renderHistorialPedidos();
}
window.cambiarPaginaHistorial = cambiarPaginaHistorial;

// Estado de filtros del historial (MEJORA 5)
window._historialFiltros = window._historialFiltros || { cliente: '', status: 'todos', desde: '', hasta: '' };

function renderHistorialPedidos() {
    const lista = document.getElementById('historialPedidosLista');
    if (!lista) return;
    const finalizados = window.pedidosFinalizados || [];

    // MEJORA 5: Inyectar bloque de filtros mejorados si no existe
    const _histContainer = lista.parentElement;
    if (_histContainer && !document.getElementById('histFiltrosBloque')) {
        const _filtrosDiv = document.createElement('div');
        _filtrosDiv.id = 'histFiltrosBloque';
        _filtrosDiv.style.cssText = 'background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-bottom:12px;';
        _filtrosDiv.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                <input id="histFiltroCliente" type="text" placeholder="🔍 Buscar cliente..." value="${window._historialFiltros.cliente||''}"
                    oninput="window._historialFiltros.cliente=this.value;_histPage=1;renderHistorialPedidos()"
                    style="flex:1;min-width:140px;padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;outline:none;">
                <select id="histFiltroStatus" onchange="window._historialFiltros.status=this.value;_histPage=1;renderHistorialPedidos()"
                    style="padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;outline:none;">
                    <option value="todos" ${window._historialFiltros.status==='todos'?'selected':''}>Todos los estados</option>
                    <option value="finalizado" ${window._historialFiltros.status==='finalizado'?'selected':''}>✅ Finalizado</option>
                    <option value="cancelado" ${window._historialFiltros.status==='cancelado'?'selected':''}>❌ Cancelado</option>
                </select>
                <label style="font-size:.78rem;color:#6b7280;white-space:nowrap;">Desde:
                    <input id="histFiltroDesde" type="date" value="${window._historialFiltros.desde||''}"
                        onchange="window._historialFiltros.desde=this.value;_histPage=1;renderHistorialPedidos()"
                        style="margin-left:4px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:.8rem;">
                </label>
                <label style="font-size:.78rem;color:#6b7280;white-space:nowrap;">Hasta:
                    <input id="histFiltroHasta" type="date" value="${window._historialFiltros.hasta||''}"
                        onchange="window._historialFiltros.hasta=this.value;_histPage=1;renderHistorialPedidos()"
                        style="margin-left:4px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:.8rem;">
                </label>
                <button onclick="window._historialFiltros={cliente:'',status:'todos',desde:'',hasta:''};_histPage=1;document.getElementById('histFiltroCliente').value='';document.getElementById('histFiltroStatus').value='todos';document.getElementById('histFiltroDesde').value='';document.getElementById('histFiltroHasta').value='';renderHistorialPedidos()"
                    style="padding:6px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:.78rem;background:white;color:#6b7280;cursor:pointer;">Limpiar filtros</button>
            </div>`;
        lista.insertAdjacentElement('beforebegin', _filtrosDiv);
    }

    // MEJORA 6: Tarjeta de tiempo promedio de producción
    if (_histContainer && !document.getElementById('histTiempoPromedio')) {
        const _statDiv = document.createElement('div');
        _statDiv.id = 'histTiempoPromedio';
        _statDiv.style.cssText = 'background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;margin-bottom:10px;font-size:.82rem;color:#1e40af;font-weight:600;';
        lista.insertAdjacentElement('beforebegin', _statDiv);
    }
    // Calcular tiempo promedio
    (function _calcTiempoPromedio() {
        const el = document.getElementById('histTiempoPromedio');
        if (!el) return;
        let totalDias = 0, conteo = 0;
        (window.pedidosFinalizados || []).forEach(p => {
            const fechaInicio = p.fechaPedido || p.fechaCreacion;
            if (!fechaInicio) return;
            // Última entrada del historialEstados con status de finalización
            let fechaFin = null;
            if (p.historialEstados && p.historialEstados.length > 0) {
                const ult = [...p.historialEstados].reverse().find(h => h.estado === 'finalizado' || h.estado === 'entregado');
                if (ult && ult.fecha) fechaFin = ult.fecha;
            }
            if (!fechaFin && p.fechaFinalizado) fechaFin = p.fechaFinalizado.split('T')[0];
            if (!fechaFin) return;
            const diff = Math.round((new Date(fechaFin + 'T00:00:00') - new Date(fechaInicio + 'T00:00:00')) / 86400000);
            if (diff >= 0 && diff < 365) { totalDias += diff; conteo++; }
        });
        el.textContent = conteo > 0
            ? `⏱ Tiempo promedio de entrega: ${Math.round(totalDias / conteo)} días (basado en ${conteo} pedidos finalizados)`
            : '⏱ Sin suficientes datos de tiempo de entrega aún';
    })();

    const selMes = document.getElementById('histPedidoMes');
    if (selMes && selMes.options.length <= 1) {
        const meses = [...new Set(finalizados.map(p => (p.fechaFinalizado||p.fechaPedido||'').substring(0,7)))].filter(Boolean).sort().reverse();
        selMes.innerHTML = '<option value="">Todos los meses</option>' + meses.map(m => `<option value="${m}">${m}</option>`).join('');
    }

    // MEJORA 3 + 5: combinar finalizados y cancelados
    const cancelados = (window.pedidos || []).filter(p => p.status === 'cancelado' || p.status === 'cancelar');
    // Marcar cancelados con un flag para diferenciarlos
    const canceladosMarcados = cancelados.map(p => ({ ...p, _esCancelado: true }));
    const todosHistorial = [...finalizados, ...canceladosMarcados];

    const q = ((document.getElementById('histPedidoBuscar')||{}).value || (window._historialFiltros.cliente || '')).toLowerCase().trim();
    const mes = ((selMes||{}).value||'');
    const filtroStatus = window._historialFiltros.status || 'todos';
    const filtroDesde = window._historialFiltros.desde || '';
    const filtroHasta = window._historialFiltros.hasta || '';

    let items = [...todosHistorial].sort((a, b) => {
        const fa = a.fechaFinalizado || a.fechaCancelado || a.fechaPedido || '';
        const fb = b.fechaFinalizado || b.fechaCancelado || b.fechaPedido || '';
        return fb.localeCompare(fa);
    });

    // Aplicar filtro de búsqueda por cliente
    if (q) {
        items = items.filter(p =>
            (p.cliente||'').toLowerCase().includes(q) ||
            (p.folio||'').toLowerCase().includes(q) ||
            (p.concepto||'').toLowerCase().includes(q)
        );
        _histPage = 1;
    }
    // Filtro por mes (selector existente)
    if (mes) {
        items = items.filter(p => (p.fechaFinalizado||p.fechaCancelado||p.fechaPedido||'').startsWith(mes));
        _histPage = 1;
    }
    // MEJORA 5: Filtro por status
    if (filtroStatus !== 'todos') {
        if (filtroStatus === 'cancelado') {
            items = items.filter(p => p._esCancelado);
        } else {
            items = items.filter(p => !p._esCancelado);
        }
        _histPage = 1;
    }
    // MEJORA 5: Filtro por rango de fechas
    if (filtroDesde) {
        items = items.filter(p => {
            const f = (p.fechaFinalizado||p.fechaCancelado||p.fechaPedido||'').split('T')[0];
            return f >= filtroDesde;
        });
        _histPage = 1;
    }
    if (filtroHasta) {
        items = items.filter(p => {
            const f = (p.fechaFinalizado||p.fechaCancelado||p.fechaPedido||'').split('T')[0];
            return f <= filtroHasta;
        });
        _histPage = 1;
    }

    const totalItems = items.length;

    // Op4: contador "Mostrando X de Y" + chips de filtro activo
    (function _mkHistInfo() {
        const bloque = document.getElementById('histFiltrosBloque');
        if (!bloque || !bloque.parentElement) return;
        let info = document.getElementById('mkHistFilterInfo');
        if (!info) {
            info = document.createElement('div');
            info.id = 'mkHistFilterInfo';
            info.style.cssText = 'display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-4px 0 12px;';
            bloque.insertAdjacentElement('afterend', info);
        }
        const _e = (s: any) => (typeof _esc === 'function' ? _esc(s) : String(s));
        const _statusLbl: Record<string,string> = { finalizado: '✅ Finalizado', cancelado: '❌ Cancelado' };
        const chips: string[] = [];
        if (q) chips.push(`<span class="mk-filter-chip">Buscar: ${_e(q)}<button data-tip="Quitar" onclick="_mkHistClear('cliente')">✕</button></span>`);
        if (mes) chips.push(`<span class="mk-filter-chip">Mes: ${_e(mes)}<button data-tip="Quitar" onclick="_mkHistClear('mes')">✕</button></span>`);
        if (filtroStatus !== 'todos') chips.push(`<span class="mk-filter-chip">Estado: ${_e(_statusLbl[filtroStatus] || filtroStatus)}<button data-tip="Quitar" onclick="_mkHistClear('status')">✕</button></span>`);
        if (filtroDesde) chips.push(`<span class="mk-filter-chip">Desde: ${_e(filtroDesde)}<button data-tip="Quitar" onclick="_mkHistClear('desde')">✕</button></span>`);
        if (filtroHasta) chips.push(`<span class="mk-filter-chip">Hasta: ${_e(filtroHasta)}<button data-tip="Quitar" onclick="_mkHistClear('hasta')">✕</button></span>`);
        let html = `<span class="mk-result-count">Mostrando <b>${totalItems}</b> de ${todosHistorial.length} pedido${todosHistorial.length !== 1 ? 's' : ''}</span>`;
        if (chips.length)
            html += `<div class="mk-filter-chips">${chips.join('')}<button class="mk-filter-clear" onclick="_mkHistClear('all')">Limpiar todo</button></div>`;
        info.innerHTML = html;
    })();

    const totalPages = Math.max(1, Math.ceil(totalItems / _HIST_PER_PAGE));
    if (_histPage > totalPages) _histPage = totalPages;
    const start = (_histPage - 1) * _HIST_PER_PAGE;
    const pageItems = items.slice(start, start + _HIST_PER_PAGE);

    // Render controles de paginación
    const pagEl = document.getElementById('histPaginacion');
    if (pagEl) {
        pagEl.innerHTML = totalPages <= 1 ? '' : `
            <div class="flex items-center justify-between pt-2 text-xs text-gray-500">
                <button onclick="cambiarPaginaHistorial(-1)" ${_histPage<=1?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30">← Anterior</button>
                <span>Página ${_histPage} de ${totalPages} <span class="text-gray-400">(${totalItems} pedidos)</span></span>
                <button onclick="cambiarPaginaHistorial(1)" ${_histPage>=totalPages?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30">Siguiente →</button>
            </div>`;
    }

    // Botón "Cargar más" — visible cuando se llegó al límite inicial (500)
    let _histLoadMoreBtn = document.getElementById('histLoadMoreBtn');
    const _puedeCargaMas = (window.pedidosFinalizados||[]).length >= 500 && !window._pedidosFinAllLoaded;
    if (_puedeCargaMas) {
        if (!_histLoadMoreBtn) {
            _histLoadMoreBtn = document.createElement('div');
            _histLoadMoreBtn.id = 'histLoadMoreBtn';
            _histLoadMoreBtn.style.cssText = 'text-align:center;margin-top:12px;';
            _histLoadMoreBtn.innerHTML = `<button onclick="cargarMasPedidosFinalizados()" style="padding:8px 20px;background:#F5EDD8;border:1px solid #C5A572;border-radius:10px;font-size:.82rem;font-weight:600;color:#92622A;cursor:pointer;">Cargar más pedidos ↓</button>`;
            lista.insertAdjacentElement('afterend', _histLoadMoreBtn);
        } else {
            _histLoadMoreBtn.style.display = '';
        }
    } else if (_histLoadMoreBtn) {
        _histLoadMoreBtn.style.display = 'none';
    }

    lista.innerHTML = pageItems.length === 0
        ? '<p class="text-center text-gray-400 py-6 text-sm">Sin pedidos en el historial</p>'
        : pageItems.map(p => {
            // FIX PE-0013: si total = 0 pero hay ítems, recalcular para mostrar correctamente
            let _totalMostrar = Number(p.total || 0);
            if (!_totalMostrar && (p.productosInventario || []).length > 0) {
                _totalMostrar = (p.productosInventario || []).reduce((s, it) => {
                    return s + Math.round(parseFloat(it.price || it.precio || 0) * 100) * parseInt(it.quantity || it.cantidad || 1, 10);
                }, 0) / 100;
            }
            const _esCancelado = p._esCancelado;
            const _fechaRef = _esCancelado
                ? ((p.fechaCancelado||'').split('T')[0] || p.fechaPedido || '')
                : ((p.fechaFinalizado||'').split('T')[0] || '');
            const _statusBadge = _esCancelado
                ? '<p class="text-xs text-red-500">❌ Cancelado</p>'
                : '<p class="text-xs text-green-600">✅ Finalizado</p>';
            const _botonesExtra = _esCancelado
                ? `<button onclick="reactivarPedido('${p.id}')" class="text-xs text-blue-500 hover:text-blue-700" title="Reactivar pedido cancelado">↩ Reactivar</button>`
                : `<button onclick="imprimirTicketPedido('${p.id}')" class="text-xs text-gray-400 hover:text-gray-600" title="Imprimir comprobante">🖨️</button>
                   <button onclick="exportarPedidoPDF('${p.id}')" class="text-xs text-purple-400 hover:text-purple-600" title="Descargar PDF">📄</button>
                   <button onclick="reactivarPedido('${p.id}')" class="text-xs text-blue-500 hover:text-blue-700" title="Mover de nuevo al kanban">↩ Reactivar</button>
                   <button onclick="editarPedidoFinalizado('${p.id}')" class="text-xs text-amber-500 hover:text-amber-700">✏️ Editar</button>
                   <button onclick="eliminarPedidoFinalizado('${p.id}')" class="text-xs text-red-400 hover:text-red-600">🗑 Eliminar</button>`;
            return `<div class="flex items-center justify-between p-4 ${_esCancelado ? 'bg-red-50' : 'bg-gray-50'} rounded-xl hover:bg-amber-50 transition-all">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-amber-600 text-sm">${_esc(p.folio||'—')}</span>
                    <span class="text-xs text-gray-400">${_fechaRef}</span>
                </div>
                <p class="font-semibold text-gray-800 text-sm">${_esc(p.cliente||'—')}</p>
                <p class="text-xs text-gray-500 truncate">${_esc(p.concepto||'')}</p>
            </div>
            <div class="text-right ml-4">
                <p class="font-bold text-gray-800">$${_totalMostrar.toFixed(2)}</p>
                ${_statusBadge}
                <div class="flex gap-2 justify-end mt-1">
                    ${_botonesExtra}
                </div>
            </div>
        </div>`;
        }).join('');
}

async function cargarMasPedidosFinalizados() {
    const btn = document.querySelector('#histLoadMoreBtn button');
    if (btn) { btn.disabled = true; btn.textContent = 'Cargando...'; }
    try {
        const offset = (window.pedidosFinalizados||[]).length;
        const mas = await window._loadMoreFromTable('pedidosFinalizados', offset, 200);
        if (mas && mas.length > 0) {
            (window.pedidosFinalizados||[]).push(...mas);
            window.pedidosFinalizados = window.pedidosFinalizados;
            if (mas.length < 200) window._pedidosFinAllLoaded = true;
            renderHistorialPedidos();
            manekiToastExport(`✅ ${mas.length} pedidos adicionales cargados`, 'ok');
        } else {
            window._pedidosFinAllLoaded = true;
            renderHistorialPedidos();
            manekiToastExport('Ya cargaste todos los pedidos', 'ok');
        }
    } catch(e) {
        manekiToastExport('Error al cargar más pedidos', 'err');
        if (btn) { btn.disabled = false; btn.textContent = 'Cargar más pedidos ↓'; }
    }
}
window.cargarMasPedidosFinalizados = cargarMasPedidosFinalizados;

// ============================================================
// GRUPO C — GRÁFICA ROI + RESUMEN MENSUAL + TOP CLIENTES
// ============================================================

function renderGraficaROI() {
    const canvas = document.getElementById('roiBarChart');
    if (!canvas) return;
    const equiposList = typeof equipos !== 'undefined' ? equipos : (window.equipos||[]);
    if (!equiposList.length) { canvas.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center py-8 gap-3"><p class="text-center text-gray-400 text-sm">Sin equipos registrados aún</p><button onclick="showSection(\'equipos\')" class="text-xs px-4 py-2 rounded-lg font-semibold" style="background:#C5A572;color:#fff;">+ Agregar primer equipo</button></div>'; return; }
    const ctx = canvas.getContext('2d');
    if (window._roiChart) window._roiChart.destroy();
    window._roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: equiposList.map(e => e.nombre),
            datasets: [
                { label: 'Acumulado ROI', data: equiposList.map(e => e.recuperado||0), backgroundColor: 'rgba(197,165,114,0.85)', borderRadius: 6 },
                { label: 'Meta', data: equiposList.map(e => e.metaReemplazo||e.costoOriginal||0), backgroundColor: 'rgba(216,191,216,0.5)', borderRadius: 6 }
            ]
        },
        options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } } } }
    });
}

function mostrarResumenMensual() {
    const hoy = new Date();
    const mp = new Date(hoy.getFullYear(), hoy.getMonth()-1, 1);
    const nombre = mp.toLocaleString('es-MX', {month:'long', year:'numeric'});
    const m = mp.getMonth(), y = mp.getFullYear();
    const fin = (window.pedidosFinalizados||[]).filter(p => { const f=new Date(p.fechaFinalizado||p.fechaPedido||''); return f.getMonth()===m&&f.getFullYear()===y; });
    const ventas = (typeof salesHistory!=='undefined'?salesHistory:[]).filter(v => { const f=new Date(v.date||''); return f.getMonth()===m&&f.getFullYear()===y && v.type !== 'pedido'; });
    const tv = ventas.reduce((s,v)=>s+(v.total||0),0);
    const tp = fin.reduce((s,p)=>s+(p.total||0),0);

    manekiToastExport(
      `📅 ${nombre.charAt(0).toUpperCase()+nombre.slice(1)}: 💰 POS $${tv.toFixed(2)} · 📦 ${fin.length} pedidos ($${tp.toFixed(2)}) · 🎯 Total $${(tv+tp).toFixed(2)}`,
      'ok'
    );
}

(function autoResumenMensual() {
    if (new Date().getDate() !== 1) return;
    const key = 'maneki_resumen_' + (typeof _fechaHoy==='function'?_fechaHoy():new Date().toISOString().split('T')[0]).substring(0,7);
    try {
        if (localStorage.getItem(key)) return;
        setTimeout(() => {
            mostrarResumenMensual();
            try { localStorage.setItem(key,'1'); } catch(_) {}
        }, 4000);
    } catch(_) {}
})();

function renderTopClientes() {
    const el = document.getElementById('topClientesWidget');
    if (!el) return;
    const mapa = {};
    const addEntry = (nombre, total) => {
        if (!nombre) return;
        if (!mapa[nombre]) mapa[nombre] = { nombre, pedidos: 0, total: 0 };
        mapa[nombre].pedidos++;
        mapa[nombre].total += total||0;
    };
    // Only count finalized pedidos — active ones are not yet paid (real revenue only)
    (window.pedidosFinalizados||[]).forEach(p => addEntry(p.cliente, p.total));
    // Eliminar la línea de pedidos activos — solo contar cobros reales
    const top = Object.values(mapa).sort((a,b)=>b.total-a.total).slice(0,3);
    el.innerHTML = top.length===0
        ? '<p class="text-xs text-gray-400 text-center py-2">Sin datos aún</p>'
        : top.map((c,i) => `<div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span class="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style="background:#C5A572">${i+1}</span>
            <div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-800 truncate">${_esc(c.nombre || '')}</p><p class="text-xs text-gray-400">${c.pedidos} pedidos</p></div>
            <span class="text-sm font-bold text-gray-700">$${c.total.toFixed(0)}</span>
        </div>`).join('');
}

// ── Inyectar botones extra al cargar ──
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Botón modo compacto
        if (!document.getElementById('btnKanbanCompacto')) {
            const toggleContainer = document.querySelector('#pedidos-section .flex.bg-gray-100.rounded-xl');
            if (toggleContainer) {
                const btn = document.createElement('button');
                btn.id = 'btnKanbanCompacto';
                btn.onclick = toggleKanbanCompacto;
                btn.title = 'Modo compacto';
                btn.className = 'px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-100';
                btn.innerHTML = '<i class="fas fa-grip-lines"></i>';
                toggleContainer.appendChild(btn);
            }
        }
        // NTH-03: Botones de urgencia
        if (!document.getElementById('btnKanbanUrgTodos')) {
            const kanbanBuscar = document.getElementById('kanbanBuscar');
            if (kanbanBuscar && kanbanBuscar.parentElement) {
                const wrap = document.createElement('div');
                wrap.className = 'flex gap-1 ml-2';
                wrap.style.cssText = 'align-items:center;';
                const btns = [
                    { id:'btnKanbanUrgTodos',   filtro:'todos',   label:'Todos',     color:'#C5A572' },
                    { id:'btnKanbanUrgVencido', filtro:'vencido', label:'⛔ Vencidos', color:'#dc2626' },
                    { id:'btnKanbanUrgHoy',     filtro:'hoy',     label:'🔴 Hoy',     color:'#ea580c' },
                    { id:'btnKanbanUrgProximos',filtro:'pronto',  label:'🟡 2 días',  color:'#ca8a04' },
                ];
                btns.forEach(({ id, filtro, label, color }) => {
                    const b = document.createElement('button');
                    b.id = id;
                    b.className = 'btn-kanban-urgencia px-2 py-1 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50';
                    b.textContent = label;
                    b.style.cssText = filtro === 'todos' ? `background:${color};color:white;border-color:${color};` : '';
                    b.onclick = function() { setKanbanUrgencia(filtro, b); };
                    wrap.appendChild(b);
                });
                kanbanBuscar.parentElement.appendChild(wrap);
            }
        }
    }, 1000);
});

// ── Mostrar top clientes al cargar dashboard ──
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof renderTopClientes === 'function') renderTopClientes();
    }, 2000);
});

// ── N2: Swipe touch para cambiar estado en kanban (mobile) ───────────────────
const _KANBAN_TOUCH_COLS = ['confirmado','pago','produccion','envio','salida','retirar'];

// B4: AbortController para limpiar listeners anteriores sin acumularlos
let _kanbanTouchAbort: AbortController|null = null;

function _initKanbanTouchSwipe() {
    const container = document.getElementById('vistaKanban');
    if (!container) return;
    // Limpiar listeners previos antes de añadir nuevos (evita acumulación)
    if (_kanbanTouchAbort) { _kanbanTouchAbort.abort(); }
    _kanbanTouchAbort = new AbortController();
    const { signal } = _kanbanTouchAbort;

    let _card: HTMLElement|null = null;
    let _startX = 0, _startY = 0;
    let _cardId = '', _cardStatus = '';

    container.addEventListener('touchstart', function(e: TouchEvent) {
        const card = (e.target as HTMLElement).closest('.kanban-card') as HTMLElement|null;
        if (!card) return;
        _card = card;
        _startX = e.touches[0].clientX;
        _startY = e.touches[0].clientY;
        _cardId = card.dataset.id || '';
        _cardStatus = card.dataset.status || '';
    }, { passive: true, signal } as any);

    container.addEventListener('touchmove', function(e: TouchEvent) {
        if (!_card) return;
        const dx = e.touches[0].clientX - _startX;
        const dy = e.touches[0].clientY - _startY;
        // Cancelar si el movimiento es principalmente vertical (scroll)
        if (Math.abs(dy) > Math.abs(dx) * 1.3 + 8) { _card = null; return; }
        _card.style.transform = `translateX(${dx}px)`;
        _card.style.transition = 'none';
        _card.style.opacity = String(Math.max(0.5, 1 - Math.abs(dx) / 220));
    }, { passive: true, signal } as any);

    container.addEventListener('touchend', function(e: TouchEvent) {
        if (!_card) return;
        const dx = e.changedTouches[0].clientX - _startX;
        const dy = e.changedTouches[0].clientY - _startY;
        _card.style.transform = '';
        _card.style.transition = '';
        _card.style.opacity = '';
        _card = null;

        // Umbral: 70px horizontal y más horizontal que vertical
        if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.9) return;

        const colIdx = _KANBAN_TOUCH_COLS.indexOf(_cardStatus);
        if (colIdx === -1) return;

        // Swipe derecha → avanza al siguiente estado; izquierda → retrocede
        const targetIdx = dx > 0 ? colIdx + 1 : colIdx - 1;
        if (targetIdx < 0 || targetIdx >= _KANBAN_TOUCH_COLS.length) return;
        const targetStatus = _KANBAN_TOUCH_COLS[targetIdx];

        _kanbanDragId = _cardId;
        kanbanDrop({ preventDefault: () => {} } as any, targetStatus);
    }, { passive: true, signal } as any);

    // UX8: hint de swipe en primera visita mobile (solo una vez)
    if (window.innerWidth <= 768 && !localStorage.getItem('mk_swipe_hint_shown')) {
        localStorage.setItem('mk_swipe_hint_shown', '1');
        const hint = document.createElement('div');
        hint.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(30,20,10,0.82);color:#fff;padding:9px 18px;border-radius:20px;font-size:.8rem;font-weight:600;z-index:9000;pointer-events:none;animation:fadeUp .4s ease both;';
        hint.textContent = '← Desliza las tarjetas para cambiar estado →';
        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 3500);
    }
}
(window as any)._initKanbanTouchSwipe = _initKanbanTouchSwipe;

// ── Editar pedido finalizado ──
let _editandoPedidoFinalizadoId = null;

function editarPedidoFinalizado(id) {
    const p = (window.pedidosFinalizados || []).find(x => String(x.id) === String(id));
    if (!p) return;
    _editandoPedidoFinalizadoId = id;

    // Reutilizar el modal existente de pedido, marcándolo como edición de finalizado
    const form = document.getElementById('pedidoForm');
    if (form) form.reset();
    window.pedidoProductosSeleccionados = [...(p.productosInventario || [])];

    document.getElementById('editPedidoId').value = '__finalizado__' + id;
    document.getElementById('pedidoModalTitle').textContent = '✏️ Editar Pedido Finalizado';
    document.getElementById('pedidoSubmitBtn').textContent = 'Guardar Cambios';

    document.getElementById('pedidoCliente').value    = p.cliente || '';
    document.getElementById('pedidoTelefono').value   = p.telefono || p.whatsapp || '';
    document.getElementById('pedidoRedes').value      = p.redes || p.facebook || '';
    document.getElementById('pedidoFecha').value      = p.fechaPedido || '';
    document.getElementById('pedidoEntrega').value    = p.entrega || '';
    document.getElementById('pedidoConcepto').value   = p.concepto || '';
    document.getElementById('pedidoCantidad').value   = p.cantidad || 1;
    document.getElementById('pedidoCosto').value      = p.costo || '';
    document.getElementById('pedidoAnticipo').value   = p.anticipo || 0;
    document.getElementById('pedidoNotas').value      = p.notas || '';
    document.getElementById('pedidoLugarEntrega').value = p.lugarEntrega || '';
    document.getElementById('pedidoCostoMateriales').value = p.costoMateriales || 0;
    // Si no hay productos pero hay total, pre-llenar el precio libre
    const _plFin = document.getElementById('pedidoPrecioLibre');
    if (_plFin) {
        const _tieneItems = (p.productosInventario || []).length > 0;
        _plFin.value = (!_tieneItems && (p.total || p.costo)) ? (p.total || p.costo || '') : '';
    }
    calcPedidoTotal();
    renderPedidoProductosList();

    if (typeof poblarSelectPedido === 'function') poblarSelectPedido();
    openModal('pedidoModal');
}
window.editarPedidoFinalizado = editarPedidoFinalizado;

// ── Interceptar submit para pedidos finalizados ──
(function patchPedidoFormForFinalizados() {
    const _origSubmit = document.getElementById('pedidoForm').onsubmit;
    document.getElementById('pedidoForm').addEventListener('submit', function(e) {
        const editId = document.getElementById('editPedidoId').value;
        if (!editId.startsWith('__finalizado__')) return; // manejo normal
        e.preventDefault();
        e.stopImmediatePropagation();

        const realId = editId.replace('__finalizado__', '');
        const idx = (window.pedidosFinalizados || []).findIndex(x => String(x.id) === String(realId));
        if (idx === -1) { manekiToastExport('⚠️ No se encontró el pedido.', 'warn'); return; }

        const cliente   = document.getElementById('pedidoCliente').value.trim();
        const telefono  = document.getElementById('pedidoTelefono').value.trim();
        const redes     = document.getElementById('pedidoRedes').value.trim();
        const fechaPedido = document.getElementById('pedidoFecha').value;
        const entrega   = document.getElementById('pedidoEntrega').value;
        const concepto  = document.getElementById('pedidoConcepto').value.trim();
        const anticipo  = parseFloat(document.getElementById('pedidoAnticipo').value) || 0;
        const notas     = document.getElementById('pedidoNotas').value.trim();
        const lugarEntrega = document.getElementById('pedidoLugarEntrega').value.trim();
        const costoMateriales = parseFloat(document.getElementById('pedidoCostoMateriales').value) || 0;

        // Calcular total desde items (igual que el submit normal)
        let _editFinItems = [...(window.pedidoProductosSeleccionados || [])];
        if (_editFinItems.length === 0) {
            const _plFEl = document.getElementById('pedidoPrecioLibre');
            const _plVal = _plFEl ? parseFloat(_plFEl.value) || 0 : 0;
            if (_plVal > 0) _editFinItems = [{ id: 'libre', name: concepto || 'Pedido', price: _plVal, quantity: 1, variante: null }];
        }
        const total  = window._sumLineas ? _sumLineas(_editFinItems) :
            _editFinItems.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);
        const cantidad = _editFinItems.reduce((s, it) => s + (it.quantity || 1), 0) || 1;
        const costo    = total;
        const resta    = Math.max(0, total - anticipo);

        if (!cliente || !concepto) {
            manekiToastExport('Por favor completa los campos requeridos (cliente y concepto).', 'warn');
            return;
        }
        if (total > 0 && anticipo > total) {
            manekiToastExport(`⚠️ El anticipo ($${anticipo.toFixed(2)}) supera el total ($${total.toFixed(2)}). Verifica los montos.`, 'warn');
            return;
        }

        window.pedidosFinalizados[idx] = {
            ...window.pedidosFinalizados[idx],
            cliente, telefono, redes,
            whatsapp: telefono, facebook: redes,
            fechaPedido, entrega, concepto,
            cantidad, costo, total, anticipo, resta,
            notas, lugarEntrega, costoMateriales,
            productosInventario: [..._editFinItems]
        };

        // Actualizar también el ROI historial si existe entrada para este pedido
        if (typeof roiHistorial !== 'undefined') {
            const roiIdx = roiHistorial.findIndex(h => h.folio === window.pedidosFinalizados[idx].folio);
            if (roiIdx !== -1) {
                const pct = (typeof roiConfig !== 'undefined' ? roiConfig.porcentaje : 10) / 100;
                const nuevoRoi = total * pct;
                const count    = roiHistorial[roiIdx].equiposIds.length;
                const porEquipo = count > 0 ? nuevoRoi / count : 0;
                const diff     = porEquipo - roiHistorial[roiIdx].porEquipo;
                // Actualizar recuperado de equipos con la diferencia
                roiHistorial[roiIdx].equiposIds.forEach(eqId => {
                    const eq = (typeof equipos !== 'undefined' ? equipos : []).find(e => e.id === eqId);
                    if (eq) eq.recuperado = Math.max(0, (eq.recuperado || 0) + diff);
                });
                roiHistorial[roiIdx].ganancia  = total;
                roiHistorial[roiIdx].totalRoi  = nuevoRoi;
                roiHistorial[roiIdx].porEquipo = porEquipo;
                if (typeof sbSave === 'function') {
                    sbSave('roiHistorial', roiHistorial);
                    sbSave('equipos', typeof equipos !== 'undefined' ? equipos : []);
                }
            }
        }

        // Descontar inventario (PT + MP) si no se había hecho antes y ahora hay productos
        const _pFin = window.pedidosFinalizados[idx];
        // Solo descontar si es la primera finalización Y nunca se marcó como descontado antes
        const _esPrimeraFin = !_pFin.inventarioDescontado && !_pFin._inventarioYaFinalizado;
        if (_esPrimeraFin && _editFinItems.length > 0 && _editFinItems[0].id !== 'libre') {
            // BUG-1 FIX: fire+flag para async call
            _descontarInventarioPedido(_pFin).catch((e: any) => console.error('[Inv editarFinalizado]', e));
            window.pedidosFinalizados[idx].inventarioDescontado = true;
            window.pedidosFinalizados[idx]._inventarioYaFinalizado = true;
        }

        savePedidosFinalizados();
        closeModal('pedidoModal');
        window.pedidoProductosSeleccionados = [];
        _editandoPedidoFinalizadoId = null;
        renderHistorialPedidos();
        manekiToastExport('✅ Pedido finalizado actualizado: ' + window.pedidosFinalizados[idx].folio, 'ok');
    }, true); // capture=true para ejecutar antes del listener original
})();

// ── Ticket/comprobante de pedido finalizado ──────────────────────────────────

// Op4 — limpiar un filtro de Historial desde su chip
(window as any)._mkHistClear = function(field: string) {
    const f = (window as any)._historialFiltros || ((window as any)._historialFiltros = { cliente:'', status:'todos', desde:'', hasta:'' });
    const setVal = (id: string, v: string) => { const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null; if (el) el.value = v; };
    switch (field) {
        case 'cliente': f.cliente = ''; setVal('histFiltroCliente', ''); setVal('histPedidoBuscar', ''); break;
        case 'mes':     setVal('histPedidoMes', ''); break;
        case 'status':  f.status = 'todos'; setVal('histFiltroStatus', 'todos'); break;
        case 'desde':   f.desde = ''; setVal('histFiltroDesde', ''); break;
        case 'hasta':   f.hasta = ''; setVal('histFiltroHasta', ''); break;
        case 'all':
            (window as any)._historialFiltros = { cliente:'', status:'todos', desde:'', hasta:'' };
            setVal('histFiltroCliente', ''); setVal('histPedidoBuscar', ''); setVal('histFiltroStatus', 'todos');
            setVal('histFiltroDesde', ''); setVal('histFiltroHasta', ''); setVal('histPedidoMes', '');
            break;
    }
    (window as any)._histPage = 1;
    if (typeof (window as any).renderHistorialPedidos === 'function') (window as any).renderHistorialPedidos();
};

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE-2: Sugerencia de reseña de Google al entregar un pedido
// ═══════════════════════════════════════════════════════════════════════════════
function _sugerirResenaGoogle(pedido: any) {
    if (!pedido) return;
    const link = (window as any).storeConfig?.googleReviewLink || '';
    if (!link) return; // No hay link configurado — no hacer nada
    const nombre = pedido.cliente || 'cliente';
    const concepto = pedido.concepto || 'tu pedido';
    const tel = (pedido.telefono || pedido.whatsapp || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
        `¡Hola ${nombre}! Fue un placer crear tu pedido. Si te gustó ${concepto}, ¿podrías dejarnos una reseña en Google? Nos ayuda muchísimo 🙏\n${link}`
    );
    const waUrl = tel ? `https://wa.me/${tel}?text=${msg}` : `https://wa.me/?text=${msg}`;
    setTimeout(() => {
        manekiToastExport(
            `✨ <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="color:#C5A572;font-weight:700;text-decoration:underline;">¡Pide tu reseña a ${typeof _esc==='function'?_esc(nombre):nombre}! →</a>`,
            'ok'
        );
    }, 1200);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE-1: Semáforo de materiales en kanban cards (post-render via MutationObserver)
// ═══════════════════════════════════════════════════════════════════════════════
function _calcSemaforoPedido(pedido: any): 'verde' | 'ambar' | 'rojo' {
    const items = pedido.productosInventario || [];
    if (!items.length) return 'verde';
    let conStock = 0;
    const total = items.length;
    for (const item of items) {
        if (item.id === 'libre') { conStock++; continue; }
        const prod = (window.products || []).find((p: any) => String(p.id) === String(item.id));
        if (!prod) continue;
        if (prod.tipo === 'servicio') { conStock++; continue; }
        const cantidad = item.quantity || item.cantidad || 1;
        const stock = typeof getStockEfectivo === 'function' ? getStockEfectivo(prod) : (prod.stock || 0);
        if (stock >= cantidad) conStock++;
    }
    if (total === 0) return 'verde';
    if (conStock === total) return 'verde';
    if (conStock === 0) return 'rojo';
    return 'ambar';
}

function _inyectarSemaforosKanban() {
    const cards = document.querySelectorAll('.kanban-card[data-id]');
    cards.forEach(card => {
        const id = (card as HTMLElement).dataset.id;
        if (!id) return;
        // Evitar duplicar
        if (card.querySelector('._mk-semaforo')) return;
        const pedido = (window.pedidos || []).find((p: any) => String(p.id) === String(id));
        if (!pedido) return;
        const color = _calcSemaforoPedido(pedido);
        const colorMap: Record<string, string> = { verde: '#22c55e', ambar: '#f59e0b', rojo: '#ef4444' };
        const dot = document.createElement('span');
        dot.className = '_mk-semaforo';
        dot.title = color === 'verde' ? 'Materiales completos' : color === 'ambar' ? 'Stock parcial' : 'Sin stock';
        dot.style.cssText = `position:absolute;top:7px;left:7px;width:8px;height:8px;border-radius:50%;background:${colorMap[color]};display:inline-block;z-index:10;box-shadow:0 0 0 2px rgba(255,255,255,.8);`;
        (card as HTMLElement).style.position = 'relative';
        card.appendChild(dot);
    });
}

// Observar cambios en el kanban para inyectar semáforos automáticamente
(function _initSemaforoObserver() {
    const _tryInject = () => {
        const kanban = document.getElementById('vistaKanban');
        if (!kanban) return;
        _inyectarSemaforosKanban();
        const obs = new MutationObserver(() => { _inyectarSemaforosKanban(); });
        obs.observe(kanban, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(_tryInject, 1500));
    } else {
        setTimeout(_tryInject, 1500);
    }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE-3: Checklist de producción por pedido
// ═══════════════════════════════════════════════════════════════════════════════
const _CHECKLIST_LABELS: Record<string, string> = {
    disenio: '🎨 Diseño aprobado',
    material: '📦 Material listo',
    producido: '🔧 Producido',
    empacado: '🎁 Empacado'
};
const _CHECKLIST_KEYS = ['disenio', 'material', 'producido', 'empacado'];

function _renderChecklistBar(pedido: any): string {
    const st = pedido.status || '';
    if (!['produccion', 'listo', 'envio', 'salida', 'retirar'].includes(st)) return '';
    const cl = pedido.checklist || {};
    const dots = _CHECKLIST_KEYS.map(k =>
        `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${cl[k] ? '#22c55e' : '#d1d5db'};margin:0 2px;"></span>`
    ).join('');
    return `<div class="_mk-checklist-bar" onclick="event.stopPropagation();abrirChecklistPedido('${pedido.id}')"
        title="Checklist de producción — clic para editar"
        style="cursor:pointer;display:flex;align-items:center;gap:4px;margin:4px 0 2px;padding:2px 4px;border-radius:6px;background:#f9fafb;border:1px solid #f3f4f6;width:fit-content;">
        ${dots}
        <span style="font-size:.68rem;color:#9ca3af;margin-left:2px;">${_CHECKLIST_KEYS.filter(k=>cl[k]).length}/${_CHECKLIST_KEYS.length}</span>
    </div>`;
}
(window as any)._renderChecklistBar = _renderChecklistBar;

function abrirChecklistPedido(id: string) {
    const pedido = (window.pedidos || []).find((p: any) => String(p.id) === String(id));
    if (!pedido) return;
    if (!pedido.checklist) pedido.checklist = { disenio: false, material: false, producido: false, empacado: false };

    let modal = document.getElementById('_mkChecklistModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = '_mkChecklistModal';
        modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:20px 24px;min-width:280px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.2);" onclick="event.stopPropagation()">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <h3 style="font-size:.95rem;font-weight:700;color:#1f2937;margin:0;" id="_mkClTitle">Checklist</h3>
                    <button onclick="cerrarChecklistPedido()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#6b7280;">✕</button>
                </div>
                <div id="_mkClItems" style="display:flex;flex-direction:column;gap:10px;"></div>
            </div>`;
        modal.addEventListener('click', () => cerrarChecklistPedido());
        document.body.appendChild(modal);
    }

    const title = modal.querySelector('#_mkClTitle') as HTMLElement;
    if (title) title.textContent = `Checklist — ${pedido.folio || pedido.id}`;
    const items = modal.querySelector('#_mkClItems') as HTMLElement;
    if (items) {
        items.innerHTML = _CHECKLIST_KEYS.map(k => `
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px 10px;border-radius:10px;border:1.5px solid ${pedido.checklist[k]?'#22c55e':'#e5e7eb'};background:${pedido.checklist[k]?'#f0fdf4':'#fff'};transition:.15s;">
                <input type="checkbox" ${pedido.checklist[k] ? 'checked' : ''}
                    onchange="window._toggleChecklistItem('${id}','${k}',this.checked)"
                    style="width:16px;height:16px;accent-color:#22c55e;cursor:pointer;">
                <span style="font-size:.85rem;font-weight:600;color:#374151;">${_CHECKLIST_LABELS[k]}</span>
            </label>`).join('');
    }

    modal.style.display = 'flex';
    (window as any)._checklistPedidoId = id;
}
window.abrirChecklistPedido = abrirChecklistPedido;

function cerrarChecklistPedido() {
    const modal = document.getElementById('_mkChecklistModal');
    if (modal) modal.style.display = 'none';
}
window.cerrarChecklistPedido = cerrarChecklistPedido;

(window as any)._toggleChecklistItem = function(id: string, key: string, val: boolean) {
    const pedido = (window.pedidos || []).find((p: any) => String(p.id) === String(id));
    if (!pedido) return;
    if (!pedido.checklist) pedido.checklist = {};
    pedido.checklist[key] = val;
    if (typeof savePedidos === 'function') savePedidos();
    // Re-abrir para refrescar estilos
    abrirChecklistPedido(id);
    // Actualizar dot en la card si está visible
    const bar = document.querySelector(`.kanban-card[data-id="${id}"] ._mk-checklist-bar`);
    if (bar) {
        bar.outerHTML = _renderChecklistBar(pedido);
    }
};

// Inyectar barras de checklist en cards post-render
function _inyectarChecklistBars() {
    const cards = document.querySelectorAll('.kanban-card[data-id]');
    cards.forEach(card => {
        const id = (card as HTMLElement).dataset.id;
        if (!id) return;
        if (card.querySelector('._mk-checklist-bar')) return;
        const pedido = (window.pedidos || []).find((p: any) => String(p.id) === String(id));
        if (!pedido) return;
        const bar = _renderChecklistBar(pedido);
        if (!bar) return;
        // Insertar después del nombre del cliente (p.font-semibold)
        const nameEl = card.querySelector('p.font-semibold');
        if (nameEl) {
            const tmp = document.createElement('div');
            tmp.innerHTML = bar;
            nameEl.insertAdjacentElement('afterend', tmp.firstElementChild as Element);
        }
    });
}

(function _initChecklistObserver() {
    const _tryInject = () => {
        const kanban = document.getElementById('vistaKanban');
        if (!kanban) return;
        _inyectarChecklistBars();
        const obs = new MutationObserver(() => { _inyectarChecklistBars(); });
        obs.observe(kanban, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(_tryInject, 1600));
    } else {
        setTimeout(_tryInject, 1600);
    }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE-4: Hoja de ruta del día
// ═══════════════════════════════════════════════════════════════════════════════
function abrirHojaRuta() {
    let modal = document.getElementById('_mkHojaRutaModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = '_mkHojaRutaModal';
        modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.5);align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px 0;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:16px;padding:20px 22px;width:min(640px,96vw);box-shadow:0 12px 48px rgba(0,0,0,.25);margin:auto;" onclick="event.stopPropagation()">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <h3 style="font-size:1rem;font-weight:700;color:#1f2937;margin:0;">🗺️ Hoja de Ruta del Día</h3>
                    <button onclick="cerrarHojaRuta()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#6b7280;">✕</button>
                </div>
                <div id="_mkHojaRutaContent"></div>
            </div>`;
        modal.addEventListener('click', cerrarHojaRuta);
        document.body.appendChild(modal);
    }
    renderHojaRuta();
    modal.style.display = 'flex';
}
window.abrirHojaRuta = abrirHojaRuta;

function cerrarHojaRuta() {
    const modal = document.getElementById('_mkHojaRutaModal');
    if (modal) modal.style.display = 'none';
}
window.cerrarHojaRuta = cerrarHojaRuta;

function renderHojaRuta() {
    const el = document.getElementById('_mkHojaRutaContent');
    if (!el) return;
    const hoy = typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0];
    const _e = typeof _esc === 'function' ? _esc : (s: any) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const pedidosHoy = (window.pedidos || [])
        .filter((p: any) => p.entrega === hoy)
        .sort((a: any, b: any) => {
            const da = a.direccionEntrega || a.lugarEntrega || a.direccion || '';
            const db = b.direccionEntrega || b.lugarEntrega || b.direccion || '';
            return da.localeCompare(db);
        });

    if (pedidosHoy.length === 0) {
        el.innerHTML = `<p style="text-align:center;color:#6b7280;padding:24px 0;font-size:.88rem;">No hay entregas programadas para hoy (${hoy}).</p>`;
        return;
    }

    let totalCobrar = 0;
    const rows = pedidosHoy.map((p: any) => {
        const saldo = typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : Math.max(0, Number(p.total||0) - Number(p.anticipo||0));
        totalCobrar += saldo;
        const dir = p.direccionEntrega || p.lugarEntrega || p.direccion || '';
        const mapsLink = dir
            ? `<a href="https://www.google.com/maps/search/${encodeURIComponent(dir)}" target="_blank" rel="noopener noreferrer" style="color:#C5A572;font-size:.75rem;font-weight:600;">📍 Ver en Maps</a>`
            : '';
        return `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                <div>
                    <span style="font-size:.8rem;font-weight:700;color:#C5A572;">${_e(p.folio||'—')}</span>
                    <span style="font-size:.82rem;font-weight:700;color:#1f2937;margin-left:6px;">${_e(p.cliente||'—')}</span>
                    ${p.telefono ? `<a href="https://wa.me/${(_e(p.telefono)).replace(/\D/g,'')}" target="_blank" rel="noopener noreferrer" style="font-size:.75rem;color:#25D366;margin-left:6px;">📱 ${_e(p.telefono)}</a>` : ''}
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <span style="font-size:.9rem;font-weight:700;color:${saldo>0?'#dc2626':'#22c55e'};">$${saldo.toFixed(2)}</span>
                    <br><span style="font-size:.7rem;color:#9ca3af;">${saldo>0?'Por cobrar':'Pagado'}</span>
                </div>
            </div>
            <p style="font-size:.78rem;color:#374151;margin:4px 0 2px;"><b>Concepto:</b> ${_e(p.concepto||'—')}</p>
            ${dir ? `<p style="font-size:.75rem;color:#6b7280;margin:2px 0;">${_e(dir)}</p>` : ''}
            ${mapsLink ? `<div style="margin-top:4px;">${mapsLink}</div>` : ''}
        </div>`;
    }).join('');

    el.innerHTML = `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:.82rem;font-weight:600;color:#92400e;">📅 ${hoy} — ${pedidosHoy.length} entrega${pedidosHoy.length!==1?'s':''}</span>
            <span style="font-size:.95rem;font-weight:700;color:#dc2626;">Total a cobrar: $${totalCobrar.toFixed(2)}</span>
        </div>
        ${rows}`;
}
window.renderHojaRuta = renderHojaRuta;