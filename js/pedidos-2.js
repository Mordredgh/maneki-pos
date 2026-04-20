async function _eliminarFotoStorageAlFinalizar(pedido) {
    const { paths } = _fotosArray(pedido);
    if (!paths.length) return;
    try { await db.storage.from(FOTO_BUCKET).remove(paths); }
    catch(e) { console.warn('[Foto] No se pudo eliminar al finalizar:', e); }
}

// ── Helpers de inventario para pedidos ──────────────────────────────────────
function _descontarInventarioPedido(pedido) {
    const items = pedido.productosInventario || [];
    if (items.length === 0) return 0;
    let descontados = 0;
    // FIX 1: rollback data collected before each deduction; restored on error
    const _rollback = [];
    try {
    for (const item of items) {
        const prod = (window.products || []).find(p => String(p.id) === String(item.id));
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
                const mp = (window.products || []).find(x => String(x.id) === String(comp.id));
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
                const mp = (window.products || []).find(x => String(x.id) === String(comp.id));
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
        // FIX 1: record rollback BEFORE modifying stock
        _rollback.push({ id: prod.id, stockBefore: antesPT });

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

        // Descontar MP de los componentes del PT × cantidad del pedido
        if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0) {
            for (const comp of prod.mpComponentes) {
                const mp = (window.products || []).find(p => String(p.id) === String(comp.id));
                if (!mp || mp.tipo === 'servicio') continue;
                const _rph = prod.rendimientoPorHoja || 0;
                const cantMP = _rph > 0
                    ? Math.ceil(cantidad / _rph) * (parseFloat(comp.qty) || 1)
                    : (parseFloat(comp.qty) || 1) * cantidad;
                const antesMP = mp.stock || 0;
                // FIX 1: record rollback for MP before modifying
                _rollback.push({ id: mp.id, stockBefore: antesMP });

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
        // FIX 1: restore all stock modified before the error
        _rollback.forEach(r => {
            const p = (window.products || []).find(x => String(x.id) === String(r.id));
            if (p) p.stock = r.stockBefore;
        });
        console.error('[Inventario] Error al descontar — stock restaurado:', e);
        // FIX C4: notificar al usuario que el rollback se ejecutó
        manekiToastExport('Error al descontar inventario. Se revirtió el stock.', 'err');
        throw e;
    }
    if (descontados > 0 && typeof saveProducts === 'function') saveProducts();
    return descontados;
}

function _esProductoEmpaque(mp) {
    return mp && (mp.esEmpaque || (mp.tags||[]).some(t => t.toLowerCase() === 'empaques' || t.toLowerCase() === 'empaque'));
}

function _descontarEmpaquesInventario(pedido) {
    const empaques = pedido.empaques || [];
    if (!empaques.length) return 0;
    let descontados = 0;
    for (const emp of empaques) {
        const mp = (window.products || []).find(p => String(p.id) === String(emp.id));
        if (!_esProductoEmpaque(mp)) continue;
        const qty = emp.quantity || 1;
        const antes = mp.stock || 0;
        mp.stock = Math.max(0, antes - qty);
        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({ productoId: mp.id, productoNombre: mp.name,
                tipo: 'salida', cantidad: -qty,
                motivo: `Empaque pedido ${pedido.folio}`,
                stockAntes: antes, stockDespues: mp.stock });
        }
        descontados++;
    }
    if (descontados > 0 && typeof saveProducts === 'function') saveProducts();
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
        if (item.variante && Array.isArray(prod.variants) && prod.variants.length > 0) {
            const _colIdx = item.variante.indexOf(':');
            const _vType  = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
            const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : '';
            const _ptVar  = prod.variants.find(v =>
                (v.type || v.tipo || '') === _vType && (v.value || v.valor || '') === _vValue
            );
            if (_ptVar) { _ptVar.qty = (_ptVar.qty || 0) + cantidad; }
            if (typeof syncStockFromVariants === 'function') syncStockFromVariants(prod);
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

        // Regresar stock del producto terminado
        const antesPT = prod.stock || 0;
        prod.stock = antesPT + cantidad;
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
                const cantMP = (parseFloat(comp.qty) || 1) * cantidad;
                const antesMP = mp.stock || 0;

                // Devolver a la variante específica si aplica
                if (item.variante && Array.isArray(mp.variants) && mp.variants.length > 0) {
                    const colonIdx = item.variante.indexOf(':');
                    const varType  = colonIdx !== -1 ? item.variante.slice(0, colonIdx).trim() : item.variante;
                    const varValue = colonIdx !== -1 ? item.variante.slice(colonIdx + 1).trim() : '';
                    const mpVar = mp.variants.find(v =>
                        (v.type || v.tipo || '') === varType && (v.value || v.valor || '') === varValue
                    );
                    if (mpVar) {
                        mpVar.qty = (mpVar.qty || 0) + cantMP;
                    }
                    if (typeof syncStockFromVariants === 'function') {
                        syncStockFromVariants(mp);
                    } else {
                        mp.stock = mp.variants.reduce((s, v) => s + (v.qty || 0), 0);
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
        showConfirm(_confirMsg, _confirTitle).then(ok => {
            if (!ok) return;
            if (!window.pedidosFinalizados) window.pedidosFinalizados = [];
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
                const _nDescont = _descontarInventarioPedido(p);
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

            window.pedidosFinalizados.push(p);
            window.pedidos.splice(idx, 1);
            savePedidos();
            savePedidosFinalizados();

            // ── FIX: Registrar pedido finalizado en salesHistory para Reportes y Balance ──
            // Solo registrar lo que RESTABA por cobrar. Los anticipos/abonos anteriores
            // ya están en salesHistory como type:'anticipo' o type:'abono'.
            if (!window.salesHistory) window.salesHistory = [];
            const yaRegistrado = window.salesHistory.some(s => s.folio === p.folio && s.type === 'pedido');
            if (!yaRegistrado && Number(p.total || 0) > 0) {
                const _saldoFinal = typeof calcSaldoPendiente === 'function'
                    ? calcSaldoPendiente(p)
                    : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
                const saleRecord = {
                    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + '-' + Math.random().toString(36).slice(2)),
                    type: 'pedido',
                    folio: p.folio,
                    date: (p.fechaFinalizado || new Date().toISOString()).split('T')[0],
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
                    else if (typeof sbSave === 'function') sbSave('salesHistory', window.salesHistory);
                }
            }

            closePedidoStatusModal();
            renderPedidosTable();
            manekiToastExport('🎉 Pedido finalizado: ' + p.folio, 'ok');
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
                    else if (typeof sbSave === 'function') sbSave('clients', window.clients);
                }
            }
        });

    } else if (status === 'cancelado') {
        const pedido = window.pedidos[idx];
        const tieneProductos = (pedido.productosInventario || []).length > 0;

        showConfirm(`¿Cancelar el pedido ${pedido.folio || ''}?`, '❌ Sí, cancelar').then(ok => {
            if (!ok) return;

            const aplicarCancelacion = (esMerma) => {
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
            const _esDomicilio = _tipo.includes('domicilio') || _tipo.includes('envio') || _tipo.includes('envío') || _tipo === '';
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
                const n = _descontarInventarioPedido(pedido);
                if (n > 0) {
                    window.pedidos[idx].inventarioDescontado = true;
                    manekiToastExport(`📦 ${n} material(es) descontado(s) del inventario.`, 'ok');
                }
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
        <p><b>Cliente:</b> ${p.cliente}</p>
        <p><b>Folio:</b> ${p.folio}</p>
        <p><b>Total:</b> $${Number(p.total||0).toFixed(2)}</p>
        <p><b>Anticipo:</b> $${Number(p.anticipo||0).toFixed(2)}</p>
        <p class="font-bold text-red-600"><b>Saldo:</b> $${Number(p.resta||0).toFixed(2)}</p>
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
    const abonoId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + '-' + Math.random().toString(36).slice(2));
    const _fechaLocal = _d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');

    // ── ROLLBACK FIX: guardar copias antes de mutar para poder restaurar si falla el save ──
    const _pagosBefore       = p.pagos.slice();
    const _incomesBefore     = window.incomes     !== undefined ? window.incomes.slice()     : undefined;
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
    if (window.incomes !== undefined) {
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
        if (window.incomes !== undefined && typeof saveIncomes === 'function') saveIncomes();
        if (window.salesHistory !== undefined) {
            if (typeof saveSalesHistory === 'function') saveSalesHistory();
            else if (typeof sbSave === 'function') sbSave('salesHistory', window.salesHistory);
        }
        if (typeof _allVentasCache !== 'undefined') _allVentasCache = null; // invalidar caché de reportes
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
                try {
                    const n = _descontarInventarioPedido(pedido);
                    if (n > 0) {
                        window.pedidos[idx].inventarioDescontado = true;
                        manekiToastExport(`📦 ${n} material(es) descontado(s) del inventario.`, 'ok');
                    }
                } catch(e) {
                    console.error('Error al descontar inventario en kanban drop:', e);
                    manekiToastExport('⚠️ Error al descontar inventario. El pedido no fue movido.', 'err');
                    if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
                    _kanbanDragId = null;
                    return; // No cambiar status
                }
            }
        }
        // R2-A3: bloquear arrastrar a "salida" si el pedido no tiene dirección de entrega
        if (newStatus === 'salida') {
            const _pedSalida = window.pedidos[idx];
            const _tipo = (_pedSalida.tipoEntrega || _pedSalida.entrega_tipo || '').toLowerCase();
            const _esDomicilio = _tipo.includes('domicilio') || _tipo.includes('envio') || _tipo.includes('envío') || _tipo === '';
            const _sinDireccion = !(_pedSalida.lugarEntrega || '').trim();
            if (_esDomicilio && _sinDireccion) {
                manekiToastExport('Agrega una dirección de entrega antes de marcar como Salida', 'warn');
                _kanbanDragId = null;
                return;
            }
        }
        window.pedidos[idx].status = newStatus;
        window.pedidos[idx].fechaUltimoEstado = new Date().toISOString();
        if (!window.pedidos[idx].historialEstados) window.pedidos[idx].historialEstados = [];
        window.pedidos[idx].historialEstados.push({
            estado: newStatus,
            fecha: typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})
        });
        savePedidos();
        renderPedidosTable();
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
    _kanbanSeleccionados.forEach(id => {
        const idx = (window.pedidos || []).findIndex(p => String(p.id) === String(id));
        if (idx === -1) return;
        window.pedidos[idx].status = nuevoStatus;
        window.pedidos[idx].fechaUltimoEstado = new Date().toISOString();
        if (!window.pedidos[idx].historialEstados) window.pedidos[idx].historialEstados = [];
        window.pedidos[idx].historialEstados.push({
            estado: nuevoStatus,
            fecha: _fecha,
            hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            nota: 'Cambio en lote'
        });
        cambiados++;
    });
    if (cambiados > 0) {
        savePedidos();
        _kanbanSeleccionados.clear();
        _actualizarBarraLote();
        renderKanbanBoard();
        manekiToastExport(`✅ ${cambiados} pedido${cambiados!==1?'s':''} actualizados a "${nuevoStatus}".`, 'ok');
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
        `¿Reactivar el pedido <strong>${p.folio || p.id}</strong> de <strong>${p.cliente || '—'}</strong>?<br><small style="color:#6b7280;">Volverá al kanban como "Confirmado".</small>`,
        '↩ Reactivar pedido'
    ).then(ok => {
        if (!ok) return;
        if (!window.pedidos) window.pedidos = [];

        const _fecha = typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0];
        const reactivado = {
            ...p,
            status: 'confirmado',
            inventarioDescontado: false,
            _inventarioYaFinalizado: false
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
            window.pedidosFinalizados.splice(idx, 1);
            window.pedidos.push(reactivado);
            savePedidos();
            savePedidosFinalizados();
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
                   <button onclick="reactivarPedido('${p.id}')" class="text-xs text-blue-500 hover:text-blue-700" title="Mover de nuevo al kanban">↩ Reactivar</button>
                   <button onclick="editarPedidoFinalizado('${p.id}')" class="text-xs text-amber-500 hover:text-amber-700">✏️ Editar</button>
                   <button onclick="eliminarPedidoFinalizado('${p.id}')" class="text-xs text-red-400 hover:text-red-600">🗑 Eliminar</button>`;
            return `<div class="flex items-center justify-between p-4 ${_esCancelado ? 'bg-red-50' : 'bg-gray-50'} rounded-xl hover:bg-amber-50 transition-all">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-amber-600 text-sm">${p.folio||'—'}</span>
                    <span class="text-xs text-gray-400">${_fechaRef}</span>
                </div>
                <p class="font-semibold text-gray-800 text-sm">${p.cliente||'—'}</p>
                <p class="text-xs text-gray-500 truncate">${p.concepto||''}</p>
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
    const key = 'maneki_resumen_' + new Date().toISOString().substring(0,7);
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
            <div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-800 truncate">${c.nombre}</p><p class="text-xs text-gray-400">${c.pedidos} pedidos</p></div>
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
            _descontarInventarioPedido(_pFin);
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