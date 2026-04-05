// ============================================================
// PEDIDOS POR ENCARGO — FUNCIONES COMPLETAS
// ============================================================

let _pedidoFiltroActivo = 'todos';
let _pedidoVistaActual = 'kanban';
let _kanbanDragId = null;
let _abonoPedidoMetodo = 'cash';
let _pedidoStatusActualId = null;
let _kanbanCompacto = false;

// FIX C6: lock para evitar folios duplicados por doble-click o llamadas simultáneas
let _folioGenerando = false;

function generarFolioPedido() {
    // FIX C6: si ya hay una generación en curso, abortar para evitar duplicados
    if (_folioGenerando) return null;
    _folioGenerando = true;
    try {
    // IMPORTANTE: el contador NUNCA se recalcula desde el array de pedidos.
    // Solo se incrementa — así evitamos folios duplicados si se borran pedidos.
    // Fuente de verdad: window._folioCounter (cargado desde Supabase/localStorage al iniciar)

    // Rescate: si por alguna razón el contador no está inicializado,
    // arrancamos desde el máximo que exista en los datos locales (solo la primera vez)
    if (!window._folioCounter || window._folioCounter === 0) {
        const todosLos = [...(window.pedidos || []), ...(window.pedidosFinalizados || [])];
        const maxUsado = todosLos.reduce((max, p) => {
            if (!p.folio) return max;
            const num = parseInt((p.folio || '').replace(/^PE-0*/, ''), 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        window._folioCounter = maxUsado; // arrancamos desde el máximo existente
    }

    // Incrementar siempre — nunca recalcular
    window._folioCounter = (window._folioCounter || 0) + 1;
    const folio = 'PE-' + String(window._folioCounter).padStart(4, '0');

    // Persistir en Supabase y en localStorage como respaldo offline
    const _fc = window._folioCounter;
    if (typeof db !== 'undefined') {
        (async () => { try { await db.from('store').upsert({ key: 'folioCounter', value: String(_fc) }); } catch(e) { console.warn('[Folio] Error al persistir contador:', e?.message); } })();
    }
    try { localStorage.setItem('maneki_folioCounter', String(_fc)); } catch(e) {}

    return folio;
    } catch(e) {
        console.error('[Folio] Error generando folio:', e);
        return null;
    } finally {
        _folioGenerando = false;  // Always releases lock
    }
}

// MEJ-11: _folioCounterReady — promesa que se resuelve cuando el contador está listo.
// Usar: await window._folioCounterReady antes de llamar generarFolioPedido()
// si el contexto lo permite, para evitar colisiones al crear pedidos al inicio.
let _folioCounterResolve;
window._folioCounterReady = new Promise(res => { _folioCounterResolve = res; });

// Inicializar contador al cargar — prioridad: Supabase > localStorage > calcular desde pedidos
(async function() {
    try {
        // 1. Intentar desde Supabase
        if (typeof db !== 'undefined') {
            const { data } = await db.from('store').select('value').eq('key', 'folioCounter').maybeSingle();
            if (data && data.value) {
                const val = parseInt(data.value);
                if (!isNaN(val) && val > 0) { window._folioCounter = val; _folioCounterResolve(val); return; }
            }
        }
    } catch(e) {}
    try {
        // 2. Fallback: localStorage
        const local = localStorage.getItem('maneki_folioCounter');
        if (local) {
            const val = parseInt(local);
            if (!isNaN(val) && val > 0) { window._folioCounter = val; _folioCounterResolve(val); return; }
        }
    } catch(e) {}
    // 3. Último recurso: calcular desde pedidos existentes (solo al iniciar por primera vez)
    // generarFolioPedido() lo maneja internamente si _folioCounter es 0
    _folioCounterResolve(0);
})();

// ── Abrir modal nuevo/editar pedido ──
// NTH-05: helper para botones de prioridad
function setPedidoPrioridad(valor, btn) {
    document.getElementById('pedidoPrioridad').value = valor;
    document.querySelectorAll('.btn-prio').forEach(b => {
        b.className = b.className.replace(/border-red-300|bg-red-50|text-red-700|border-amber-300|bg-amber-50|text-amber-700|border-gray-400|bg-gray-100|text-gray-700/g, 'border-gray-200 text-gray-500');
    });
    const colorMap = { alta:'border-red-300 bg-red-50 text-red-700', normal:'border-amber-300 bg-amber-50 text-amber-700', baja:'border-gray-400 bg-gray-100 text-gray-700' };
    if (btn) {
        btn.classList.remove('border-gray-200','text-gray-500');
        (colorMap[valor]||'').split(' ').forEach(c => btn.classList.add(c));
    }
}
window.setPedidoPrioridad = setPedidoPrioridad;

function openPedidoModal(id) {
    const form = document.getElementById('pedidoForm');
    if (form) form.reset();
    window.pedidoProductosSeleccionados = [];
    window.pedidoEmpaquesSeleccionados = [];
    document.getElementById('editPedidoId').value = id || '';
    document.getElementById('pedidoModalTitle').textContent = id ? 'Editar Pedido' : 'Nuevo Pedido';
    document.getElementById('pedidoSubmitBtn').textContent = id ? 'Actualizar Pedido' : 'Guardar Pedido';
    const pList = document.getElementById('pedidoProductosList');
    if (pList) pList.innerHTML = '';
    const selRow = document.getElementById('pedidoProductoSelRow');
    if (selRow) selRow.classList.add('hidden');

    const _now = new Date();
    const hoy = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`;
    const _entrega = new Date(_now);
    _entrega.setDate(_entrega.getDate() + 7);
    const entregaStr = `${_entrega.getFullYear()}-${String(_entrega.getMonth()+1).padStart(2,'0')}-${String(_entrega.getDate()).padStart(2,'0')}`;
    document.getElementById('pedidoFecha').value = hoy;
    document.getElementById('pedidoEntrega').value = entregaStr;
    document.getElementById('pedidoCantidad').value = 1;
    document.getElementById('pedidoAnticipo').value = 0;
    document.getElementById('pedidoCostoMateriales').value = 0;
    const _plEl = document.getElementById('pedidoPrecioLibre');
    if (_plEl) _plEl.value = '';
    calcPedidoTotal();

    if (id) {
        const p = (window.pedidos || []).find(x => String(x.id) === String(id));
        if (p) {
            document.getElementById('pedidoCliente').value = p.cliente || '';
            document.getElementById('pedidoTelefono').value = p.telefono || p.whatsapp || '';
            document.getElementById('pedidoRedes').value = p.redes || p.facebook || '';
            document.getElementById('pedidoFecha').value = p.fechaPedido || hoy;
            document.getElementById('pedidoEntrega').value = p.entrega || '';
            document.getElementById('pedidoConcepto').value = p.concepto || '';
            document.getElementById('pedidoCantidad').value = p.cantidad || 1;
            document.getElementById('pedidoCosto').value = p.costo || '';
            document.getElementById('pedidoAnticipo').value = p.anticipo || 0;
            document.getElementById('pedidoNotas').value = p.notas || '';
            document.getElementById('pedidoLugarEntrega').value = p.lugarEntrega || '';
            document.getElementById('pedidoCostoMateriales').value = p.costoMateriales || 0;
            window.pedidoProductosSeleccionados = [...(p.productosInventario || [])];
            window.pedidoEmpaquesSeleccionados = [...(p.empaques || [])];
            // NTH-05: cargar prioridad
            const _prio = p.prioridad || 'normal';
            const _prioBtn = document.getElementById({ alta:'btnPrioAlta', normal:'btnPrioNormal', baja:'btnPrioBaja' }[_prio] || 'btnPrioNormal');
            setPedidoPrioridad(_prio, _prioBtn);
            // Limpiar precio libre al editar (los productos ya están cargados)
            const _plEdit = document.getElementById('pedidoPrecioLibre');
            if (_plEdit) _plEdit.value = '';
            calcPedidoTotal();
            renderPedidoProductosList();
            if (typeof renderPedidoEmpaquesList === 'function') renderPedidoEmpaquesList();
        }
    }

    if (typeof poblarSelectPedido === 'function') poblarSelectPedido();
    if (typeof poblarSelectEmpaquesPedido === 'function') poblarSelectEmpaquesPedido();

    // M6: Populate concepto suggestions from existing pedidos
    const dlConcepto = document.getElementById('conceptoSuggestions');
    if (dlConcepto && window.pedidos) {
        const unique = [...new Set((window.pedidos || []).map(p => p.concepto).filter(Boolean))];
        dlConcepto.innerHTML = unique.map(c => `<option value="${c.replace(/"/g,'&quot;')}">`).join('');
    }

    openModal('pedidoModal');
}

function closePedidoModal() {
    const editId = document.getElementById('editPedidoId').value;
    const cliente = document.getElementById('pedidoCliente').value.trim();
    const costo = document.getElementById('pedidoCosto').value;

    function _cerrar() {
        // FIX 5: state is cleared on open (not on close) to avoid stale data
        // if modal is re-opened before GC. Reset still happens in openPedidoModal().
        // FIX 8: restaurar productosInventario al cancelar edición sin guardar
        const _editId = document.getElementById('editPedidoId')?.value || '';
        if (_editId && !_editId.startsWith('__finalizado__')) {
            const _saved = (window.pedidos || []).find(p => String(p.id) === String(_editId));
            if (_saved) window.pedidoProductosSeleccionados = (_saved.productosInventario || []).map(i => ({...i}));
        }
        window.pedidoProductosSeleccionados = window.pedidoProductosSeleccionados || [];
        closeModal('pedidoModal');
    }

    if (!editId && (cliente || (costo && costo !== '0'))) {
        // Pedido nuevo con datos — preguntar antes de cerrar
        showConfirm('¿Cerrar sin guardar los cambios?', '⚠️ Cambios sin guardar').then(ok => { if (ok) _cerrar(); });
    } else if (editId && !editId.startsWith('__finalizado__')) {
        // Modo edición — comparar campos vs pedido guardado
        const saved = (window.pedidos||[]).find(p => String(p.id) === String(editId));
        if (saved) {
            const clienteActual   = (document.getElementById('pedidoCliente')||{}).value?.trim() || '';
            const conceptoActual  = (document.getElementById('pedidoConcepto')||{}).value?.trim() || '';
            const anticipoActual  = parseFloat((document.getElementById('pedidoAnticipo')||{}).value || 0);
            const itemsActuales   = (window.pedidoProductosSeleccionados||[]).length;
            const entregaActual   = (document.getElementById('pedidoEntrega')||{}).value || '';
            const notasActuales   = (document.getElementById('pedidoNotas')||{}).value?.trim() || '';
            const hayCambio = clienteActual  !== (saved.cliente||'')   ||
                              conceptoActual !== (saved.concepto||'')  ||
                              anticipoActual !== (saved.anticipo||0)   ||
                              itemsActuales  !== (saved.productosInventario||[]).length ||
                              entregaActual  !== (saved.entrega||'')   ||
                              notasActuales  !== (saved.notas||'');
            if (hayCambio) {
                showConfirm('¿Cerrar sin guardar los cambios?', '⚠️ Cambios sin guardar').then(ok => { if (ok) _cerrar(); });
                return;
            }
        }
        _cerrar();
    } else {
        _cerrar();
    }
}

function calcPedidoTotal() {
    const items = window.pedidoProductosSeleccionados || [];

    // Mostrar/ocultar campo de precio libre según si hay productos
    const precioLibreRow = document.getElementById('pedidoPrecioLibreRow');
    if (precioLibreRow) precioLibreRow.style.display = items.length === 0 ? 'flex' : 'none';

    // FIX floating point: redondear cada línea en centavos antes de sumar
    let total = window._sumLineas ? _sumLineas(items) :
        items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);

    // Precio libre: se usa cuando no hay productos del inventario
    if (total === 0 && items.length === 0) {
        const precioLibreEl = document.getElementById('pedidoPrecioLibre');
        if (precioLibreEl) total = parseFloat(precioLibreEl.value) || 0;
    }
    // FIX validación: anticipo debe ser >= 0
    const anticipoRaw = parseFloat(document.getElementById('pedidoAnticipo').value);
    const anticipo = (isNaN(anticipoRaw) || anticipoRaw < 0) ? 0 : anticipoRaw;
    if (isNaN(anticipoRaw) || anticipoRaw < 0) document.getElementById('pedidoAnticipo').value = '0';
    const saldo = window._money ? _money(Math.max(0, total - anticipo)) : Math.max(0, total - anticipo);

    // Calcular costo de materiales sumando mpComponentes de cada producto × su cantidad en el pedido
    const costoProductos = items.reduce((s, it) => {
        const prod = (window.products || []).find(p => String(p.id) === String(it.id));
        if (!prod || !Array.isArray(prod.mpComponentes) || !prod.mpComponentes.length) return s;
        const costoUnitProd = prod.mpComponentes.reduce((sc, c) => sc + (parseFloat(c.costUnit) || 0) * (parseFloat(c.qty) || 1), 0);
        const rph = prod.rendimientoPorHoja || 0;
        const hojas = rph > 0 ? Math.ceil((it.quantity || 1) / rph) : (it.quantity || 1);
        return s + costoUnitProd * hojas;
    }, 0);
    // Sumar costo de empaques seleccionados
    const costoEmpaques = (window.pedidoEmpaquesSeleccionados || []).reduce((s, emp) => {
        const mp = (window.products || []).find(p => String(p.id) === String(emp.id));
        return s + (parseFloat(mp?.cost || 0)) * (emp.quantity || 1);
    }, 0);
    const costoMat = costoProductos + costoEmpaques;

    const ganancia = total - costoMat;

    // Sincronizar campos hidden para que el submit los lea correctamente
    const cantEl = document.getElementById('pedidoCantidad');
    const costoEl = document.getElementById('pedidoCosto');
    if (cantEl) cantEl.value = items.reduce((s, it) => s + (it.quantity || 1), 0) || 1;
    if (costoEl) costoEl.value = total.toFixed(2);

    const costoMatEl = document.getElementById('pedidoCostoMateriales');
    if (costoMatEl) costoMatEl.value = costoMat.toFixed(2);

    const dispTotal = document.getElementById('pedidoTotalDisplay');
    const dispSaldo = document.getElementById('pedidoSaldo');
    const dispGan = document.getElementById('pedidoGananciaEstimada');
    if (dispTotal) {
        dispTotal.textContent = '$' + total.toFixed(2);
        // Mostrar texto informativo cuando el precio viene de productos del inventario
        let _calcHint = document.getElementById('_pedidoCalcHint');
        if (items.length > 0) {
            if (!_calcHint) {
                _calcHint = document.createElement('span');
                _calcHint.id = '_pedidoCalcHint';
                _calcHint.style.cssText = 'display:block;font-size:.68rem;color:#7c3aed;margin-top:2px;';
                dispTotal.parentElement && dispTotal.parentElement.appendChild(_calcHint);
            }
            _calcHint.textContent = '💡 Precio calculado desde los productos agregados';
        } else if (_calcHint) {
            _calcHint.textContent = '';
        }
    }
    if (dispSaldo) dispSaldo.value = '$' + saldo.toFixed(2);
    if (dispGan) {
        dispGan.value = costoMat > 0 ? '$' + ganancia.toFixed(2) + (total > 0 ? ' (' + Math.round(ganancia/total*100) + '%)' : '') : '—';
        dispGan.style.color = ganancia >= 0 ? '#16a34a' : '#dc2626';
    }
}

// ── Submit formulario de pedido ──
let _pedidoGuardando = false;
document.getElementById('pedidoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // FIX: mutex para evitar doble guardado por doble click
    if (_pedidoGuardando) { manekiToastExport('Guardando, espera un momento...', 'warn'); return; }
    const editId = document.getElementById('editPedidoId').value;
    // BUG-PED-016 FIX: si es edición de finalizado, el segundo listener (patchPedidoFormForFinalizados)
    // lo maneja. Sin este guard, este listener cerraría el modal sin guardar nada.
    if (editId && editId.startsWith('__finalizado__')) return;
    const cliente = document.getElementById('pedidoCliente').value.trim();
    const telefono = document.getElementById('pedidoTelefono').value.trim();
    const redes = document.getElementById('pedidoRedes').value.trim();
    const fechaPedido = document.getElementById('pedidoFecha').value;
    const entrega = document.getElementById('pedidoEntrega').value;
    // FIX C8: validar que la fecha de entrega no sea anterior a la fecha del pedido
    if (fechaPedido && entrega) {
        const _fPedido  = new Date(fechaPedido);
        const _fEntrega = new Date(entrega);
        if (_fEntrega < _fPedido) {
            manekiToastExport('La fecha de entrega no puede ser anterior a la fecha del pedido', 'warn');
            return;
        }
    }
    const concepto = document.getElementById('pedidoConcepto').value.trim();
    // FIX: validar que anticipo sea número positivo
    const anticipoRaw = parseFloat(document.getElementById('pedidoAnticipo').value);
    const anticipo = (!isNaN(anticipoRaw) && anticipoRaw >= 0) ? anticipoRaw : 0;
    const notas = document.getElementById('pedidoNotas').value.trim();
    const lugarEntrega = document.getElementById('pedidoLugarEntrega').value.trim();
    const costoMateriales = parseFloat(document.getElementById('pedidoCostoMateriales').value) || 0;
    // NTH-05: prioridad del pedido
    const prioridad = (document.getElementById('pedidoPrioridad')?.value) || 'normal';
    let items = [...(window.pedidoProductosSeleccionados || [])];

    // FIX SUBMIT-SYNC: leer valores actuales de los inputs inline de precio y cantidad
    // del DOM antes de calcular. Esto cubre el caso donde el usuario edita un campo
    // y hace click en Guardar sin salir del input (onchange no se dispara en ese caso).
    if (items.length > 0) {
        const list = document.getElementById('pedidoProductosList');
        if (list) {
            const priceInputs = list.querySelectorAll('input[type="number"][onchange*="editarPrecioPedidoProducto"]');
            const qtyInputs   = list.querySelectorAll('input[type="number"][onchange*="editarCantidadPedidoProducto"]');
            priceInputs.forEach(inp => {
                const match = (inp.getAttribute('onchange') || '').match(/editarPrecioPedidoProducto\((\d+)/);
                if (match) {
                    const idx = parseInt(match[1]);
                    if (items[idx] !== undefined) items[idx].price = parseFloat(inp.value) || 0;
                }
            });
            qtyInputs.forEach(inp => {
                const match = (inp.getAttribute('onchange') || '').match(/editarCantidadPedidoProducto\((\d+)/);
                if (match) {
                    const idx = parseInt(match[1]);
                    if (items[idx] !== undefined) items[idx].quantity = parseInt(inp.value) || 1;
                }
            });
        }
        // También sincronizar el array fuente para que calcPedidoTotal() sea consistente
        window.pedidoProductosSeleccionados = items;
    }

    // Precio libre: si no hay productos, crear ítem sintético con concepto y precio
    if (items.length === 0) {
        const precioLibreEl = document.getElementById('pedidoPrecioLibre');
        const precioLibre = precioLibreEl ? parseFloat(precioLibreEl.value) || 0 : 0;
        if (precioLibre > 0) {
            items = [{ id: 'libre', name: concepto || 'Pedido', price: precioLibre, quantity: 1, variante: null }];
        }
    }

    // FIX floating point: sumar líneas redondeando en centavos
    const total = window._sumLineas ? _sumLineas(items) :
        items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);
    const cantidad = items.reduce((s, it) => s + (it.quantity || 1), 0) || 1;
    const costo = total;
    const resta = Math.max(0, total - anticipo);

    if (!cliente || !concepto) {
        manekiToastExport('Por favor completa los campos requeridos (cliente y concepto).', 'warn');
        return;
    }
    // A7: validar que montos no sean negativos
    if (Number(total) < 0) { manekiToastExport('El monto no puede ser negativo', 'warn'); return; }
    if (Number(anticipo) < 0) { manekiToastExport('El monto no puede ser negativo', 'warn'); return; }
    // GUARD-1: bloquear pedido sin precio — evita el bug PE-0013
    if (total === 0) {
        manekiToastExport('⚠️ El pedido no tiene precio. Agrega productos del inventario o escribe el precio en el campo amarillo.', 'warn');
        return;
    }
    // GUARD-1 ya cubre total === 0, GUARD-2 es redundante (eliminado en FIX #14)
    if (total > 0 && anticipo > total) {
        manekiToastExport(`⚠️ El anticipo ($${anticipo.toFixed(2)}) supera el total ($${total.toFixed(2)}). Verifica los montos.`, 'warn');
        return;
    }
    _pedidoGuardando = true;
    // FIX C7: deshabilitar botón guardar durante el proceso para evitar doble envío
    const _btnSubmit = document.getElementById('pedidoSubmitBtn');
    if (_btnSubmit) { _btnSubmit.disabled = true; _btnSubmit.style.opacity = '0.6'; _btnSubmit.innerHTML = '⏳ Guardando...'; }
    if (!window.pedidos) window.pedidos = [];

    if (editId) {
        const idx = window.pedidos.findIndex(p => String(p.id) === String(editId));
        if (idx !== -1) {
            const pActual = window.pedidos[idx];

            // BUG-PED-01 + BUG-PED-007 FIX: sincronizar pagos[] cuando cambia el anticipo.
            // La lógica: el campo anticipo del formulario representa el TOTAL DESEADO de lo que
            // ya pagó el cliente. Ajustamos el pago tipo 'anticipo' en pagos[] para que
            // normalizarResta() calcule el valor correcto sin revertirlo.
            let pagosActualizados = [...(pActual.pagos || [])];
            const idxAnticipo = pagosActualizados.findIndex(ab => ab.tipo === 'anticipo');
            // Suma de abonos (todo lo que NO es el pago de anticipo inicial)
            const sumAbonos = pagosActualizados.reduce((s, ab, i) => i !== idxAnticipo ? s + Number(ab.monto || 0) : s, 0);
            // VALIDACIÓN: el anticipo no puede ser menor a los abonos ya registrados
            if (anticipo < sumAbonos) {
                manekiToastExport(`El anticipo no puede ser menor a los abonos ya registrados ($${sumAbonos.toFixed(2)})`, 'warn');
                _pedidoGuardando = false;
                if (_btnSubmit) { _btnSubmit.disabled = false; _btnSubmit.style.opacity = ''; _btnSubmit.innerHTML = editId ? 'Actualizar Pedido' : 'Guardar Pedido'; }
                return;
            }
            // Nuevo monto del anticipo: lo que el usuario declaró menos los abonos posteriores
            const nuevoMontoAnticipo = Math.max(0, anticipo - sumAbonos);
            const sumPagoActual = pagosActualizados.reduce((s, ab) => s + Number(ab.monto || 0), 0);
            const diff = anticipo - sumPagoActual;
            if (Math.abs(diff) > 0.01) {
                if (idxAnticipo >= 0) {
                    // Actualizar el monto del pago anticipo existente (incluso si queda en 0)
                    pagosActualizados[idxAnticipo] = { ...pagosActualizados[idxAnticipo], monto: nuevoMontoAnticipo };
                } else if (anticipo > 0) {
                    // Pedido legacy sin pagos[] — crear entrada de anticipo
                    const _d = new Date();
                    pagosActualizados.unshift({
                        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
                        tipo: 'anticipo', monto: anticipo,
                        fecha: `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`,
                        hora: _d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}),
                        metodo: 'efectivo', nota: 'Anticipo ajustado al editar'
                    });
                }
            }

            // Guardar alias móvil (whatsapp/facebook) para compatibilidad bidireccional
            window.pedidos[idx] = { ...pActual, cliente, telefono, redes, whatsapp: telefono, facebook: redes, fechaPedido, entrega, concepto, cantidad, costo, total, anticipo, resta, notas, lugarEntrega, costoMateriales, prioridad, pagos: pagosActualizados, productosInventario: (window.pedidoProductosSeleccionados || []).map(i => ({...i})), empaques: (window.pedidoEmpaquesSeleccionados || []).map(e => ({...e})) };
            savePedidos();
            if (window.MKS) MKS.notify();
            manekiToastExport('✅ Pedido actualizado.', 'ok');
        }
    } else {
        const folio = generarFolioPedido();
        if (!folio) {
            manekiToastExport('⚠️ Error al generar folio. Intenta de nuevo.', 'err');
            _pedidoGuardando = false;
            if (_btnSubmit) { _btnSubmit.disabled = false; _btnSubmit.style.opacity = ''; _btnSubmit.innerHTML = 'Guardar Pedido'; }
            return;
        }
        const pedido = {
            id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
            folio: folio,
            cliente, telefono, redes,
            whatsapp: telefono, facebook: redes,  // alias móvil para compatibilidad
            fechaPedido, entrega, concepto,
            cantidad, costo, total, anticipo, resta, notas, lugarEntrega, costoMateriales, prioridad,
            status: 'confirmado',
            pagos: anticipo > 0 ? [{
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
                tipo: 'anticipo',
                monto: anticipo,
                fecha: (()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })(),
                hora: new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}),
                metodo: 'efectivo', nota: 'Anticipo inicial'
            }] : [],
            productosInventario: [...items],
            empaques: [...(window.pedidoEmpaquesSeleccionados || [])],
            fechaCreacion: new Date().toISOString(),
            fechaUltimoEstado: new Date().toISOString()
        };
        window.pedidos.push(pedido);
        window.pedidoProductosSeleccionados = [];
        window.pedidoEmpaquesSeleccionados = [];
        savePedidos();
        if (window.MKS) MKS.sale();
        manekiToastExport('✅ Pedido creado: ' + pedido.folio, 'ok');
    }
    _pedidoGuardando = false;
    // FIX C7: re-habilitar botón guardar al terminar (éxito o error)
    if (_btnSubmit) { _btnSubmit.disabled = false; _btnSubmit.style.opacity = ''; _btnSubmit.innerHTML = editId ? 'Actualizar Pedido' : 'Guardar Pedido'; }
    closeModal('pedidoModal');
    renderPedidosTable();
    updatePedidosStats();
    if (typeof checkAlertasEntregas === 'function') checkAlertasEntregas();
    checkAlertasCobro();
});

// ── Cambiar vista kanban / tabla ──
function setVistaPedidos(vista) {
    _pedidoVistaActual = vista;
    const kanban  = document.getElementById('vistaKanban');
    const tabla   = document.getElementById('vistaTabla');
    const cal     = document.getElementById('vistaCalendario');
    const btnK    = document.getElementById('btnVistaKanban');
    const btnT    = document.getElementById('btnVistaTabla');
    const btnC    = document.getElementById('btnVistaCalendario');
    const activo  = '#C5A572';
    const inactivo = '';
    // ocultar todo
    [kanban, tabla, cal].forEach(el => el && el.classList.add('hidden'));
    [btnK, btnT, btnC].forEach(b => { if (b) { b.style.background = inactivo; b.style.color = '#6B7280'; } });
    if (vista === 'kanban') {
        kanban && kanban.classList.remove('hidden');
        if (btnK) { btnK.style.background = activo; btnK.style.color = 'white'; }
    } else if (vista === 'calendario') {
        cal && cal.classList.remove('hidden');
        if (btnC) { btnC.style.background = activo; btnC.style.color = 'white'; }
        if (typeof renderCalendarioPedidos === 'function') renderCalendarioPedidos();
        return;
    } else {
        tabla && tabla.classList.remove('hidden');
        if (btnT) { btnT.style.background = activo; btnT.style.color = 'white'; }
    }
    renderPedidosTable();
}

// ── Filtrar pedidos tabla ──
function filterPedidos(status, btn) {
    _pedidoFiltroActivo = status;
    _pedidosTablePage = 1;
    document.querySelectorAll('.pedido-filter').forEach(b => {
        b.style.borderColor = '#E5E7EB'; b.style.background = 'white'; b.style.color = '#4B5563';
    });
    if (btn) { btn.style.borderColor = '#C5A572'; btn.style.background = '#FFF9F0'; btn.style.color = '#C5A572'; }
    renderTablaPedidos();
}

// ── Render principal ──
function normalizarResta() {
    // FUENTE DE VERDAD: p.pagos[] contiene TODOS los pagos (anticipo inicial + abonos)
    // p.anticipo y p.resta se CALCULAN siempre — nunca se leen de Supabase/SQLite
    // Esto evita que versiones inconsistentes guardadas den valores distintos en cada carga.
    (window.pedidos || []).forEach(p => {
        const totalPagado = (p.pagos || []).reduce((s, ab) => s + Number(ab.monto || 0), 0);
        if (totalPagado > 0) {
            // Si hay pagos registrados, usar su suma como fuente de verdad
            p.anticipo = totalPagado;
            p.resta    = Math.max(0, Number(p.total || 0) - totalPagado);
        } else {
            // No hay pagos — usar anticipo guardado (pedido legacy o sin abonos aún)
            p.anticipo = Number(p.anticipo || 0);
            p.resta    = Math.max(0, Number(p.total || 0) - p.anticipo);
        }
    });
}
window.normalizarResta = normalizarResta;

function renderPedidosTable() {
    normalizarResta();
    updatePedidosStats();
    renderKanbanBoard();
    renderTablaPedidos();
    renderHistorialPedidos();
    if (typeof checkAlertasEntregas === 'function') checkAlertasEntregas();
    checkAlertasCobro();
    // Refresh production list if visible
    const panel = document.getElementById('listaProduccionPanel');
    if (panel && !panel.classList.contains('hidden')) renderListaProduccion();
}

function updatePedidosStats() {
    const lista = window.pedidos || [];
    // BUG-S06 FIX: excluir cancelados — no representan dinero real por cobrar
    const activos = lista.filter(p => p.status !== 'cancelado');
    const porCobrar = activos.reduce((s, p) => s + (Number(p.resta) || 0), 0);
    const anticipos = activos.reduce((s, p) => s + (Number(p.anticipo) || 0), 0);
    const mesActual = new Date().getMonth();
    const mesYear = new Date().getFullYear();
    const esMes = activos.filter(p => {
        const fechaStr = p.fechaCreacion || p.fechaPedido || '';
        if (!fechaStr) return false;
        const mesStr = `${mesYear}-${String(mesActual+1).padStart(2,'0')}`;
        return fechaStr.startsWith(mesStr);
    }).length;
    const elActivos = document.getElementById('pedidosActivos');
    const elCobrar = document.getElementById('pedidosPorCobrar');
    const elAnticipo = document.getElementById('pedidosAnticipos');
    const elMes = document.getElementById('pedidosMes');
    if (elActivos) elActivos.textContent = activos.length;
    if (elCobrar) elCobrar.textContent = '$' + porCobrar.toFixed(2);
    if (elAnticipo) elAnticipo.textContent = '$' + anticipos.toFixed(2);
    if (elMes) elMes.textContent = esMes;
}

// ── Render Kanban ──
// ── NTH-03: Filtro kanban por urgencia ──────────────────────────────────────
let _kanbanUrgenciaFiltro = 'todos'; // 'todos' | 'hoy' | 'pronto' | 'vencido'

function setKanbanUrgencia(filtro, btn) {
    _kanbanUrgenciaFiltro = filtro;
    document.querySelectorAll('.btn-kanban-urgencia').forEach(b => {
        b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    if (btn) { btn.style.background = '#C5A572'; btn.style.color = 'white'; btn.style.borderColor = '#C5A572'; }
    renderKanbanBoard();
}
window.setKanbanUrgencia = setKanbanUrgencia;

function renderKanbanBoard() {
    const cols = ['confirmado','pago','produccion','envio','salida','retirar'];
    const buscar = (document.getElementById('kanbanBuscar') || {}).value || '';
    const q = buscar.toLowerCase().trim();
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    let lista = window.pedidos || [];

    // NTH-03: aplicar filtro de urgencia
    if (_kanbanUrgenciaFiltro !== 'todos') {
        lista = lista.filter(p => {
            if (!p.entrega) return false;
            const entrega = new Date(p.entrega + 'T00:00:00');
            const diff = Math.round((entrega - hoy) / 86400000);
            if (_kanbanUrgenciaFiltro === 'vencido') return diff < 0;
            if (_kanbanUrgenciaFiltro === 'hoy')     return diff === 0;
            if (_kanbanUrgenciaFiltro === 'pronto')  return diff >= 0 && diff <= 2;
            return true;
        });
    }

    let totalVisible = 0;
    cols.forEach(col => {
        const el = document.getElementById('kCol-' + col);
        const badge = document.getElementById('kBadge-' + col);
        if (!el) return;
        const items = lista.filter(p => (p.status||'').toLowerCase() === col && (
            !q || (p.cliente||'').toLowerCase().includes(q) ||
            (p.folio||'').toLowerCase().includes(q) ||
            (p.concepto||'').toLowerCase().includes(q)
        ));
        totalVisible += items.length;
        if (badge) badge.textContent = items.length;
        el.innerHTML = items.length === 0
            ? `<p class="text-center text-gray-400 text-xs py-6">${q || _kanbanUrgenciaFiltro !== 'todos' ? 'Sin resultados' : 'Sin pedidos'}</p>`
            : items.map(p => kanbanCardHTML(p)).join('');
    });

    // Mensaje global cuando el filtro no encuentra nada en ninguna columna
    const _noResultsBanner = document.getElementById('kanbanNoResults');
    if (_noResultsBanner) {
        _noResultsBanner.style.display = (totalVisible === 0 && (q || _kanbanUrgenciaFiltro !== 'todos')) ? 'block' : 'none';
        _noResultsBanner.textContent = q
            ? `Sin pedidos que coincidan con "${q}"`
            : 'Sin pedidos con este filtro de urgencia';
    }
}

function kanbanCardHTML(p) {
    const _saldo = typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : Number(p.resta || 0);
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const entrega = p.entrega ? new Date(p.entrega + 'T00:00:00') : null;
    const diff = entrega ? Math.round((entrega - hoy) / 86400000) : null;
    let alertaHtml = '';
    if (diff !== null) {
        if (diff < 0) alertaHtml = '<span class="text-xs font-bold text-red-700">⛔ Vencido</span>';
        else if (diff === 0) alertaHtml = '<span class="text-xs font-bold text-red-600">🔴 ¡Hoy!</span>';
        else if (diff === 1) alertaHtml = '<span class="text-xs font-bold text-amber-600">🟡 Mañana</span>';
        else if (diff === 2) alertaHtml = '<span class="text-xs font-bold text-amber-600">🟡 2 días</span>';
    }
    // BUG-PED-005 FIX: XSS en campos de usuario — _esc() sanitiza antes de insertar en innerHTML
    const _e = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
    if (_kanbanCompacto) {
        return `<div class="kanban-card bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 select-none flex items-center gap-2"
            draggable="true" ondragstart="kanbanDragStart(event,'${p.id}')" ondragend="kanbanDragEnd(event)">
            <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-amber-600">${_e(p.folio)}</span>
                <span class="text-xs text-gray-700 ml-1 truncate">${_e(p.cliente)}</span>
            </div>
            <span class="text-xs ${_saldo>0?'text-red-500':'text-green-600'} font-bold whitespace-nowrap">$${_saldo.toFixed(0)}</span>
            <button onclick="openPedidoStatusModal('${p.id}')" class="text-xs px-1 py-0.5 rounded bg-gray-100 hover:bg-amber-100 text-gray-500">⚡</button>
            <button onclick="eliminarPedido('${p.id}')" class="text-xs px-1 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-500">🗑</button>
        </div>`;
    }
    // NTH-05: badge de prioridad
    const _prioBadge = p.prioridad === 'alta'
        ? `<span class="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 ml-1">🔺 Alta</span>`
        : p.prioridad === 'baja'
        ? `<span class="text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 ml-1">🔻 Baja</span>`
        : '';
    // NTH-04: thumbnail de foto de referencia
    const _thumbUrl = (p.referenciasUrls||[])[0] || p.referenciaUrl || null;
    const _thumbHtml = _thumbUrl
        ? `<img src="${_thumbUrl}" onclick="abrirFotoReferencia('${p.id}')" class="w-full h-14 object-cover rounded-lg mb-1 cursor-pointer" onerror="this.style.display='none'" alt="Ref">`
        : '';
    return `<div class="kanban-card bg-white rounded-xl p-3 shadow-sm border border-gray-100 select-none"
        draggable="true" ondragstart="kanbanDragStart(event,'${p.id}')" ondragend="kanbanDragEnd(event)">
        <div class="flex justify-between items-start mb-1">
            <div class="flex items-center flex-wrap gap-1">
                <span class="text-xs font-bold text-amber-600">${_e(p.folio)}</span>
                ${_prioBadge}
            </div>
            ${alertaHtml}
        </div>
        <p class="font-semibold text-gray-800 text-sm leading-tight mb-1">${_e(p.cliente)}</p>
        ${_thumbHtml}
        <p class="text-xs text-gray-500 mb-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${_e(p.concepto)}</p>
        ${p.lugarEntrega ? `<p class="text-xs mb-1 truncate" style="color:#7c3aed;">📍 ${_e(p.lugarEntrega)}</p>` : ''}
        <div class="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>📅 ${p.entrega || '—'}</span>
            <span class="${_saldo > 0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}">
                ${_saldo > 0 ? '💰 $' + _saldo.toFixed(0) : '✅ Pagado'}
            </span>
        </div>
        ${diff !== null ? `<div class="kanban-urgency-bar ${diff < 0 ? 'urgency-overdue' : diff === 0 ? 'urgency-urgent' : diff <= 2 ? 'urgency-soon' : 'urgency-ok'}" style="width:${diff < 0 ? 100 : Math.max(8, Math.min(100, 100 - (diff / 14 * 100)))}%"></div>` : ''}
        <div class="flex gap-1 mt-2 items-center" style="position:relative;">
            <button onclick="openPedidoStatusModal('${p.id}')" class="flex-1 text-xs py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-semibold text-gray-600">⚡ Estado</button>
            <button onclick="openPedidoModal('${p.id}')" class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-amber-50 text-xs text-amber-600">✏️</button>
            <button onclick="openAbonoPedido('${p.id}')" class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-green-50 text-xs text-green-600">$</button>
            <button onclick="abrirWhatsAppPedido('${p.id}')" class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-green-50 text-xs" style="color:#25D366"><i class="fab fa-whatsapp"></i></button>
            <button onclick="eliminarPedido('${p.id}')" class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-red-50 text-xs text-red-500">🗑</button>
            <div style="position:relative;">
                <button onclick="(function(btn){var m=btn.nextElementSibling;m.style.display=m.style.display==='block'?'none':'block';var close=function(e){if(!btn.contains(e.target)&&!m.contains(e.target)){m.style.display='none';document.removeEventListener('click',close);}};setTimeout(function(){document.addEventListener('click',close)},0);})(this)" class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs text-gray-500 font-bold" title="Más acciones">⋯</button>
                <div style="display:none;position:absolute;right:0;bottom:calc(100% + 6px);z-index:200;background:white;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 -4px 24px rgba(0,0,0,0.13);min-width:140px;padding:4px;">
                    <button onclick="abrirFotoReferencia('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 rounded-lg text-gray-700">📷 Fotos ref.${(p.referenciasUrls||[]).length ? ' ('+((p.referenciasUrls||[]).length)+')' : p.referenciaUrl ? ' (1)' : ''}</button>
                    <button onclick="duplicarPedido('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 rounded-lg text-gray-700">⧉ Duplicar</button>
                    <button onclick="generarTicketPedido('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 rounded-lg text-gray-700">🧾 Ticket PDF</button>
                    <button onclick="imprimirEtiquetaPedido('${p.id}')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 rounded-lg text-gray-700">🏷️ Etiqueta</button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Render Tabla ──
// Paginación para tabla de pedidos activos
let _pedidosTablePage = 1;
const _PEDIDOS_PER_PAGE = 25;

function renderTablaPedidos() {
    const tbody = document.getElementById('pedidosTable');
    if (!tbody) return;
    const q = ((document.getElementById('kanbanBuscar') || {}).value || '').toLowerCase().trim();
    // BUG-PED-03 FIX: comparación case-insensitive para status — Realtime puede traer
    // valores con distinto case (ej: 'Confirmado' vs 'confirmado') que causarían filtros vacíos.
    let lista = _pedidoFiltroActivo === 'todos'
        ? [...(window.pedidos || [])].reverse()
        : (window.pedidos || []).filter(p => (p.status||'').toLowerCase() === _pedidoFiltroActivo.toLowerCase()).reverse();
    if (q) {
        lista = lista.filter(p =>
            (p.cliente||'').toLowerCase().includes(q) ||
            (p.folio||'').toLowerCase().includes(q) ||
            (p.concepto||'').toLowerCase().includes(q) ||
            (p.telefono||'').includes(q) ||
            (p.whatsapp||'').includes(q)
        );
        _pedidosTablePage = 1;
    }
    const totalItems = lista.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / _PEDIDOS_PER_PAGE));
    if (_pedidosTablePage > totalPages) _pedidosTablePage = totalPages;
    const start = (_pedidosTablePage - 1) * _PEDIDOS_PER_PAGE;
    const page = lista.slice(start, start + _PEDIDOS_PER_PAGE);
    const statusLabel = {
        confirmado:'✅ Confirmado', pago:'💰 Pago', produccion:'🔧 Producción',
        envio:'📦 Envío', salida:'🚚 Salió', retirar:'🏪 Retirar'
    };
    const _et = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
    tbody.innerHTML = page.length === 0
        ? '<tr><td colspan="10" class="text-center py-10 text-gray-400">Sin pedidos</td></tr>'
        : page.map(p => `<tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-bold text-amber-600">${_et(p.folio)||'—'}</td>
            <td class="px-4 py-3 text-sm font-semibold text-gray-800">${_et(p.cliente)||'—'}</td>
            <td class="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">${_et(p.concepto)||'—'}</td>
            <td class="px-4 py-3 text-xs text-gray-500">${_et(p.fechaPedido)||'—'}</td>
            <td class="px-4 py-3 text-xs text-gray-500">${_et(p.entrega)||'—'}</td>
            <td class="px-4 py-3 text-sm font-bold text-gray-800">$${Number(p.total||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-green-700">$${Number(p.anticipo||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-sm font-bold ${p.resta>0?'text-red-600':'text-green-600'}">$${Number(p.resta||0).toFixed(2)}<br>${(()=>{const _r=Number(p.resta||0),_a=Number(p.anticipo||0);if(_r<=0)return'<span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;font-size:.65rem;font-weight:700;background:#dcfce7;color:#166534;">Liquidado</span>';if(_a>0)return'<span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;font-size:.65rem;font-weight:700;background:#fef9c3;color:#854d0e;">Anticipo</span>';return'<span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;font-size:.65rem;font-weight:700;background:#fee2e2;color:#991b1b;">Pendiente</span>';})()}</td>
            <td class="px-4 py-3 text-xs">${statusLabel[p.status]||p.status||'—'}</td>
            <td class="px-4 py-3">
                <div class="flex gap-1">
                    <button onclick="openPedidoStatusModal('${p.id}')" class="px-2 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-amber-50">Estado</button>
                    <button onclick="openPedidoModal('${p.id}')" class="px-2 py-1 rounded-lg bg-amber-50 text-xs text-amber-700">✏️</button>
                    <button onclick="openAbonoPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-green-50 text-xs text-green-700">$</button>
                    <button onclick="abrirWhatsAppPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-green-50 text-xs" style="color:#25D366"><i class="fab fa-whatsapp"></i></button>
                    <button onclick="duplicarPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-purple-50 text-xs text-purple-600" title="Duplicar pedido">⧉</button>
                    <button onclick="eliminarPedido('${p.id}')" class="px-2 py-1 rounded-lg bg-red-50 text-xs text-red-600">🗑</button>
                </div>
            </td>
        </tr>`).join('');
    // Render pagination controls
    let paginador = document.getElementById('pedidosTablePaginador');
    if (!paginador) {
        paginador = document.createElement('div');
        paginador.id = 'pedidosTablePaginador';
        paginador.className = 'flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500';
        tbody.closest('table')?.parentElement?.appendChild(paginador);
    }
    if (totalPages <= 1) { paginador.innerHTML = `<span>${totalItems} pedido${totalItems!==1?'s':''}</span>`; return; }
    paginador.innerHTML = `
        <span>${totalItems} pedidos · Página ${_pedidosTablePage} de ${totalPages}</span>
        <div class="flex gap-1">
            <button onclick="_pedidosTablePage=Math.max(1,_pedidosTablePage-1);renderTablaPedidos()" ${_pedidosTablePage===1?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">‹ Anterior</button>
            <button onclick="_pedidosTablePage=Math.min(${totalPages},_pedidosTablePage+1);renderTablaPedidos()" ${_pedidosTablePage===totalPages?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Siguiente ›</button>
        </div>`;
}

// ── Eliminar pedido activo ──
// ─── LISTA DE PRODUCCIÓN DEL DÍA ────────────────────────────────────────────
let _produccionFiltro = 'todos';

function toggleListaProduccion() {
    const panel = document.getElementById('listaProduccionPanel');
    if (!panel) return;
    const hidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if (hidden) {
        renderListaProduccion();
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function filtrarProduccion(filtro, btn) {
    _produccionFiltro = filtro;
    document.querySelectorAll('.prod-filter-btn').forEach(b => {
        b.style.borderColor = '#E5E7EB';
        b.style.background = 'white';
        b.style.color = '#4B5563';
    });
    if (btn) {
        btn.style.borderColor = '#7c3aed';
        btn.style.background = '#f3e8ff';
        btn.style.color = '#7c3aed';
    }
    renderListaProduccion();
}

function renderListaProduccion() {
    const container = document.getElementById('listaProduccionContent');
    if (!container) return;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const mañana = new Date(hoy); mañana.setDate(mañana.getDate() + 1);
    const enSemana = new Date(hoy); enSemana.setDate(enSemana.getDate() + 7);

    let lista = [...(window.pedidos || [])].filter(p => {
        const estadosActivos = ['confirmado','pago','produccion','envio','salida','retirar'];
        return estadosActivos.includes(p.status);
    });

    // Aplicar filtro
    if (_produccionFiltro === 'hoy') {
        lista = lista.filter(p => { if (!p.entrega) return false; const d = new Date(p.entrega + 'T00:00:00'); return d.getTime() === hoy.getTime(); });
    } else if (_produccionFiltro === 'manana') {
        lista = lista.filter(p => { if (!p.entrega) return false; const d = new Date(p.entrega + 'T00:00:00'); return d.getTime() === mañana.getTime(); });
    } else if (_produccionFiltro === 'semana') {
        lista = lista.filter(p => { if (!p.entrega) return false; const d = new Date(p.entrega + 'T00:00:00'); return d >= hoy && d <= enSemana; });
    } else if (_produccionFiltro === 'produccion') {
        lista = lista.filter(p => p.status === 'produccion');
    }

    // Ordenar por fecha de entrega
    lista.sort((a, b) => {
        if (!a.entrega) return 1;
        if (!b.entrega) return -1;
        return new Date(a.entrega) - new Date(b.entrega);
    });

    if (lista.length === 0) {
        container.innerHTML = '<div class="text-center py-10 text-gray-400"><div class="text-4xl mb-2">🎉</div><p class="text-sm">No hay pedidos para este filtro</p></div>';
        return;
    }

    const statusBadge = {
        confirmado: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">✅ Confirmado</span>',
        pago: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">💰 Pago</span>',
        produccion: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">🔧 Producción</span>',
        envio: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">📦 Envío</span>',
        salida: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">🚚 Salió</span>',
        retirar: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">🏪 Retirar</span>',
    };

    container.innerHTML = lista.map((p, idx) => {
        const entrega = p.entrega ? new Date(p.entrega + 'T00:00:00') : null;
        const diff = entrega ? Math.round((entrega - hoy) / 86400000) : null;
        let urgBg = 'bg-white border-gray-100', urgText = '';
        if (diff !== null && diff < 0) { urgBg = 'bg-red-100 border-red-300'; urgText = '<span class="text-xs font-bold text-red-700">⛔ Vencido ' + Math.abs(diff) + 'd</span>'; }
        else if (diff === 0) { urgBg = 'bg-red-50 border-red-200'; urgText = '<span class="text-xs font-bold text-red-600 animate-pulse">🔴 ¡Hoy!</span>'; }
        else if (diff !== null && diff <= 2) { urgBg = 'bg-amber-50 border-amber-200'; urgText = `<span class="text-xs font-semibold text-amber-600">🟡 ${diff === 1 ? 'Mañana' : diff + ' días'}</span>`; }

        const prods = p.productosInventario && p.productosInventario.length > 0
            ? p.productosInventario.map(i => {
                const _escProd = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
                const varLabel = i.variante ? ` <span style="font-size:.7rem;color:#7c3aed;">(${_escProd((()=>{const p=i.variante.indexOf(':');if(p===-1)return i.variante;const t=i.variante.slice(0,p).trim(),val=i.variante.slice(p+1).trim();return t+': '+(typeof _mkColorDot==='function'?_mkColorDot(t,val):val);})())})</span>` : '';
                return `<span class="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-xs mr-1 mb-1">${i.name || i.nombre}${varLabel} ×${i.quantity||1}</span>`;
              }).join('')
            : '';
        const ganancia = p.costoMateriales > 0 ? `<span class="text-xs text-green-600 font-semibold ml-2">💰 Ganancia: $${(p.total - p.costoMateriales).toFixed(2)}</span>` : '';
        const _escP = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));

        return `<div class="${urgBg} border rounded-xl p-4 flex gap-4 items-start">
            <div class="text-xl font-bold text-gray-300 w-8 text-center flex-shrink-0">${idx+1}</div>
            <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-amber-600">${p.folio||'—'}</span>
                    ${statusBadge[p.status] || ''}
                    ${urgText}
                </div>
                <p class="font-bold text-gray-800">${_escP(p.cliente)||'—'}</p>
                <p class="text-sm text-gray-600 mb-1">${_escP(p.concepto)||'—'}</p>
                ${prods ? `<div class="mb-1">${prods}</div>` : ''}
                <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>📅 Entrega: <strong>${p.entrega||'—'}</strong></span>
                    <span>💵 Total: <strong>$${Number(p.total||0).toFixed(2)}</strong></span>
                    ${p.resta > 0 ? `<span class="text-red-500 font-bold">⚠️ Resta: $${Number(p.resta).toFixed(2)}</span>` : '<span class="text-green-600 font-bold">✅ Pagado</span>'}
                    ${ganancia}
                </div>
                ${p.lugarEntrega ? `<p class="text-xs mt-1" style="color:#7c3aed;">📍 ${_escP(p.lugarEntrega)}</p>` : ''}
                ${p.notas ? `<p class="text-xs text-gray-400 mt-1 italic">📝 ${_escP(p.notas)}</p>` : ''}
            </div>
            <div class="flex flex-col gap-1 flex-shrink-0">
                <button onclick="openPedidoStatusModal('${p.id}')" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">⚡</button>
                <button onclick="abrirWhatsAppPedido('${p.id}')" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-green-50" style="color:#25D366"><i class="fab fa-whatsapp"></i></button>
            </div>
        </div>`;
    }).join('');

    const label = document.getElementById('produccionFechaLabel');
    if (label) label.textContent = `${lista.length} pedido${lista.length!==1?'s':''} activo${lista.length!==1?'s':''} · ${new Date().toLocaleDateString('es-MX', {weekday:'long',day:'numeric',month:'long'})}`;
}

function imprimirListaProduccion() {
    const content = document.getElementById('listaProduccionContent')?.innerHTML || '';
    const storeName = document.querySelector('.sidebar-store-name')?.textContent || 'Maneki Store';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>Lista de Producción</title>
        <style>body{font-family:sans-serif;padding:2rem;} h1{color:#7c3aed;} .item{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;} .folio{color:#C5A572;font-weight:bold;font-size:12px;} .cliente{font-size:14px;font-weight:700;} .concepto{font-size:13px;color:#4B5563;} .meta{font-size:12px;color:#6B7280;margin-top:4px;} @media print{body{padding:0.5rem;}}</style>
    </head><body>
        <h1>🔨 Lista de Producción</h1>
        <p style="color:#6B7280;font-size:13px;">${storeName} · ${new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        <hr style="margin:1rem 0;">
        ${content}
    </body></html>`);
    win.document.close();
    win.print();
}
// ────────────────────────────────────────────────────────────────────────────

function eliminarPedido(id) {
    const pedido = (window.pedidos || []).find(p => String(p.id) === String(id));
    if (!pedido) return;

    const tieneInventario = pedido.inventarioDescontado && (pedido.productosInventario || []).length > 0;

    const _ejecutarEliminar = async (regresarInv) => {
        if (regresarInv) _regresarInventarioCompleto(pedido);
        if (window.MKS) MKS.del();
        window.pedidos = (window.pedidos || []).filter(p => String(p.id) !== String(id));
        savePedidos();
        try {
            await db.from('orders').delete().eq('id', String(id));
        } catch(e) {
            console.warn('eliminarPedido: no se pudo borrar de orders:', e);
            manekiToastExport('Pedido eliminado localmente. Error al sincronizar con la nube.', 'warn');
        }
        renderPedidosTable();
        manekiToastExport('Pedido eliminado.', 'ok');
    };

    if (tieneInventario) {
        showConfirm('El inventario fue descontado para este pedido.\n¿Regresar productos y materia prima al inventario?', '📦 Regresar inventario').then(regresarInv => {
            showConfirm('¿Eliminar este pedido? Esta acción no se puede deshacer.', '🗑 Eliminar').then(ok => {
                if (!ok) return;
                _ejecutarEliminar(regresarInv);
            });
        });
    } else {
        showConfirm('¿Eliminar este pedido? Esta acción no se puede deshacer.', '🗑 Eliminar').then(ok => {
            if (!ok) return;
            _ejecutarEliminar(false);
        });
    }
}

// ── Foto de referencia (Supabase Storage: bucket "pedidos-referencias") ─────
const FOTO_BUCKET = 'pedidos-referencias';
let _fotoRefPedidoId = null;

const _FOTO_MAX = 20;

function _fotosArray(p) {
    if (p.referenciasUrls && p.referenciasUrls.length) return { urls: p.referenciasUrls, paths: p.referenciasPaths || [] };
    if (p.referenciaUrl) return { urls: [p.referenciaUrl], paths: p.referenciaPath ? [p.referenciaPath] : [] };
    return { urls: [], paths: [] };
}

function abrirFotoReferencia(id) {
    _fotoRefPedidoId = id;
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    const { urls } = _fotosArray(p);
    const folioEl = document.getElementById('fotoRefFolio');
    if (folioEl) folioEl.textContent = `${p.folio || id} · ${urls.length}/${_FOTO_MAX} fotos`;
    const content = document.getElementById('fotoRefContent');
    if (!content) return;

    if (!urls.length) {
        content.innerHTML = `<div onclick="document.getElementById('fotoRefInput').click()" style="border:2px dashed #d1d5db;border-radius:14px;padding:36px 20px;text-align:center;cursor:pointer;" onmouseover="this.style.borderColor='#C5A572'" onmouseout="this.style.borderColor='#d1d5db'">
            <p style="font-size:2.2rem;">📷</p>
            <p style="font-size:.85rem;color:#6b7280;margin-top:8px;font-weight:600;">Toca para subir fotos de referencia</p>
            <p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">Hasta ${_FOTO_MAX} fotos · JPG, PNG, WEBP · máx 5 MB c/u</p>
        </div>`;
    } else {
        let grid = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:4px;">';
        urls.forEach((url, i) => {
            grid += `<div style="position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#f3f4f6;cursor:pointer;" onclick="window.open('${url}','_blank')">
                <img src="${url}" style="width:100%;height:100%;object-fit:cover;">
                <button onclick="event.stopPropagation();eliminarFotoReferencia('${id}',${i})" style="position:absolute;top:3px;right:3px;background:rgba(220,38,38,.85);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:10px;cursor:pointer;line-height:1;">✕</button>
                <button onclick="event.stopPropagation();descargarFotoReferencia('${id}',${i})" style="position:absolute;bottom:3px;right:3px;background:rgba(59,130,246,.85);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:10px;cursor:pointer;line-height:1;">⬇</button>
            </div>`;
        });
        if (urls.length < _FOTO_MAX) {
            grid += `<div onclick="document.getElementById('fotoRefInput').click()" style="aspect-ratio:1;border:2px dashed #d1d5db;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:#fafafa;" onmouseover="this.style.borderColor='#C5A572'" onmouseout="this.style.borderColor='#d1d5db'">
                <span style="font-size:1.4rem;color:#9ca3af;">+</span>
                <span style="font-size:.6rem;color:#9ca3af;margin-top:2px;">Agregar</span>
            </div>`;
        }
        grid += '</div>';
        content.innerHTML = grid;
    }
    openModal('fotoReferenciaModal');
}
window.abrirFotoReferencia = abrirFotoReferencia;

async function subirFotoReferencia() {
    const input = document.getElementById('fotoRefInput');
    if (!input || !input.files.length || !_fotoRefPedidoId) return;
    const p = (window.pedidos || []).find(x => String(x.id) === String(_fotoRefPedidoId));
    if (!p) return;
    const { urls: urlsActuales, paths: pathsActuales } = _fotosArray(p);
    const disponibles = _FOTO_MAX - urlsActuales.length;
    if (disponibles <= 0) { manekiToastExport(`Ya tienes el máximo de ${_FOTO_MAX} fotos.`, 'warn'); input.value = ''; return; }
    const _filesRaw = Array.from(input.files).slice(0, disponibles);
    input.value = '';
    const filesFiltrados = [];
    for (const file of _filesRaw) {
        if (file.size > 5 * 1024 * 1024) {
            manekiToastExport(`"${file.name}" supera 5 MB — omitida.`, 'warn');
        } else {
            filesFiltrados.push(file);
        }
    }
    if (!filesFiltrados.length) return;
    manekiToastExport(`Subiendo ${filesFiltrados.length} foto(s)...`, 'ok');
    const idx = (window.pedidos || []).findIndex(x => String(x.id) === String(p.id));
    const nuevasUrls = [...urlsActuales];
    const nuevasPaths = [...pathsActuales];
    for (const file of filesFiltrados) {
        const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
        const path = `${p.id}/ref_${Date.now()}_${Math.random().toString(36).substr(2,4)}.${ext}`;
        try {
            const { error } = await db.storage.from(FOTO_BUCKET).upload(path, file, { upsert: false });
            if (error) throw error;
            const { data: { publicUrl } } = db.storage.from(FOTO_BUCKET).getPublicUrl(path);
            nuevasUrls.push(publicUrl);
            nuevasPaths.push(path);
        } catch(e) {
            console.error('[Foto] Error completo:', e);
            manekiToastExport(`❌ Error: ${e.message || JSON.stringify(e)}`, 'warn');
        }
    }
    if (idx !== -1) {
        window.pedidos[idx].referenciasUrls = nuevasUrls;
        window.pedidos[idx].referenciasPaths = nuevasPaths;
        delete window.pedidos[idx].referenciaUrl;
        delete window.pedidos[idx].referenciaPath;
        savePedidos();
    }
    manekiToastExport('✅ Foto(s) subidas correctamente.', 'ok');
    abrirFotoReferencia(p.id);
}
window.subirFotoReferencia = subirFotoReferencia;

async function descargarFotoReferencia(id, fotoIdx = 0) {
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    const { paths } = _fotosArray(p);
    const path = paths[fotoIdx];
    if (!path) return;
    try {
        const { data, error } = await db.storage.from(FOTO_BUCKET).download(path);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        const ext = path.split('.').pop().split('?')[0];
        a.href = url; a.download = `referencia_${p.folio || p.id}_${fotoIdx + 1}.${ext}`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(e) { manekiToastExport('❌ Error al descargar.', 'warn'); }
}
window.descargarFotoReferencia = descargarFotoReferencia;

async function eliminarFotoReferencia(id, fotoIdx) {
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    showConfirm('¿Eliminar esta foto?', '🗑 Eliminar').then(async ok => {
        if (!ok) return;
        const { urls, paths } = _fotosArray(p);
        const path = paths[fotoIdx];
        if (path) { try { await db.storage.from(FOTO_BUCKET).remove([path]); } catch(e) {} }
        const idx = (window.pedidos || []).findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
            const u = [...urls]; const pt = [...paths];
            u.splice(fotoIdx, 1); pt.splice(fotoIdx, 1);
            window.pedidos[idx].referenciasUrls = u;
            window.pedidos[idx].referenciasPaths = pt;
            delete window.pedidos[idx].referenciaUrl;
            delete window.pedidos[idx].referenciaPath;
            savePedidos();
        }
        abrirFotoReferencia(id);
    });
}
window.eliminarFotoReferencia = eliminarFotoReferencia;
