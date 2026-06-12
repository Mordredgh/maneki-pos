// ============================================================
// PEDIDOS POR ENCARGO — FUNCIONES COMPLETAS
// ============================================================

let _pedidoFiltroActivo = 'todos';
let _pedidoVistaActual = 'kanban';
let _kanbanDragId = null;
let _abonoPedidoMetodo = 'cash';
let _pedidoStatusActualId = null;
let _kanbanCompacto = false;

// generarFolioPedido — llama la RPC atómica maneki_next_folio (SELECT...FOR UPDATE en Postgres).
// Garantiza unicidad entre dispositivos. La RPC usa la key 'contador_PE' en la tabla store.
async function generarFolioPedido(): Promise<string | null> {
    try {
        const n = await getNextFolio('PE');
        window._folioCounter = n;
        try { localStorage.setItem('maneki_folioCounter', String(n)); } catch(_) {}
        return 'PE-' + String(n).padStart(4, '0');
    } catch(e) {
        console.error('[Folio] Error generando folio:', e);
        return null;
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
    // MEJORA 2: limpiar notasInternas al abrir modal (no está en el form nativo)
    const _niReset = document.getElementById('pedidoNotasInternas');
    if (_niReset) _niReset.value = '';
    window.pedidoProductosSeleccionados = [];
    window.pedidoEmpaquesSeleccionados = [];
    document.getElementById('editPedidoId').value = id || '';
    document.getElementById('pedidoModalTitle').textContent = id ? 'Editar Pedido' : 'Nuevo Pedido';
    document.getElementById('pedidoSubmitBtn').textContent = id ? 'Actualizar Pedido' : 'Guardar Pedido';
    const pList = document.getElementById('pedidoProductosList');
    if (pList) pList.innerHTML = '';
    const selRow = document.getElementById('pedidoProductoSelRow');
    if (selRow) selRow.classList.add('hidden');

    // FIX-6: usar _fechaHoy() para evitar UTC shift
    const hoy = typeof _fechaHoy === 'function' ? _fechaHoy() : (()=>{ const _d=new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();
    const _entrega = new Date(hoy + 'T12:00:00'); // parsear desde fecha local evita UTC shift
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

    // MEJORA 2: Crear campo notasInternas dinámicamente si no existe
    (function _inyectarNotasInternas() {
        if (document.getElementById('pedidoNotasInternas')) return;
        const taNotas = document.getElementById('pedidoNotas');
        if (!taNotas) return;
        const wrapper = document.createElement('div');
        wrapper.id = 'pedidoNotasInternasWrapper';
        wrapper.style.cssText = 'margin-top:8px;';
        wrapper.innerHTML = `
            <label style="display:block;font-size:.75rem;font-weight:600;color:#6b7280;margin-bottom:4px;">
                🔒 Notas internas <span style="font-weight:400;font-style:italic;">(solo equipo — no va al cliente)</span>
            </label>
            <textarea id="pedidoNotasInternas" rows="2" placeholder="Notas internas (solo equipo — no va al cliente)"
                style="width:100%;border:2px dashed #d1d5db;border-radius:8px;padding:8px 10px;font-size:.83rem;resize:vertical;outline:none;background:#fafafa;color:#374151;"
                onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#d1d5db'"></textarea>`;
        taNotas.parentElement.insertAdjacentElement('afterend', wrapper);
    })();

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
            // MEJORA 2: cargar notasInternas
            const _niEl = document.getElementById('pedidoNotasInternas');
            if (_niEl) _niEl.value = p.notasInternas || '';
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

    // UX-3: activar step 1 al abrir el modal
    _updatePedidoStep(1);

    // UX-3: step 3 cuando concepto recibe focus
    (function _setupWizardFocusListeners() {
        const _conceptoEl = document.getElementById('pedidoConcepto');
        const _precioEl   = document.getElementById('pedidoCosto') || document.getElementById('pedidoPrecioLibre');
        if (_conceptoEl && !((_conceptoEl as any)._wizardFocus)) {
            (_conceptoEl as any)._wizardFocus = true;
            _conceptoEl.addEventListener('focus', () => _updatePedidoStep(3));
        }
        if (_precioEl && !((_precioEl as any)._wizardFocus)) {
            (_precioEl as any)._wizardFocus = true;
            _precioEl.addEventListener('focus', () => _updatePedidoStep(4));
        }
    })();

    // M6: Populate concepto suggestions from existing pedidos
    const dlConcepto = document.getElementById('conceptoSuggestions');
    if (dlConcepto && window.pedidos) {
        const unique = [...new Set((window.pedidos || []).map(p => p.concepto).filter(Boolean))];
        dlConcepto.innerHTML = unique.map(c => `<option value="${c.replace(/"/g,'&quot;')}">`).join('');
    }

    // N-UI-12: listener en el campo cliente para mostrar botón "Usar último pedido"
    (function _setupDuplicarUltimoPedido() {
        const _clienteInput = document.getElementById('pedidoCliente') as HTMLInputElement|null;
        if (!_clienteInput) return;
        // Remover listener previo si existe
        if ((window as any)._duplicarClienteHandler) {
            _clienteInput.removeEventListener('input', (window as any)._duplicarClienteHandler);
            _clienteInput.removeEventListener('change', (window as any)._duplicarClienteHandler);
        }
        const _handler = function() {
            const _nombre = _clienteInput.value.trim().toLowerCase();
            // Remover botón previo si existe
            const _btnPrev = document.getElementById('btnDuplicarUltimoPedido');
            if (_btnPrev) _btnPrev.remove();

            // N-PEDIDOS-004: mostrar saldo pendiente de pedidos anteriores del cliente
            (function _mostrarSaldoCliente() {
                const _todosActivos = (window.pedidos || []).filter((p: any) =>
                    (p.cliente || '').toLowerCase().trim() === _nombre && p.status !== 'cancelado'
                );
                const _saldoTotal = _todosActivos.reduce((s: number, p: any) => s + (typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : 0), 0);
                let _warn = document.getElementById('clienteSaldoWarning');
                if (_saldoTotal > 0 && _nombre) {
                    if (!_warn) {
                        _warn = document.createElement('div');
                        _warn.id = 'clienteSaldoWarning';
                        _clienteInput.insertAdjacentElement('afterend', _warn);
                    }
                    _warn.style.cssText = 'background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:6px 12px;font-size:.74rem;color:#92400e;margin-top:4px;display:flex;align-items:center;gap:6px;';
                    _warn.innerHTML = `💳 Saldo pendiente de pedidos anteriores: <strong>$${_saldoTotal.toFixed(2)}</strong>`;
                } else if (_warn) {
                    _warn.remove();
                }
            })();

            // N-PEDIDOS-005: precio sugerido basado en historial del cliente
            (function _mostrarPrecioSugerido() {
                const _todosHist = [...(window.pedidos || []), ...(window.pedidosFinalizados || [])].filter((p: any) =>
                    (p.cliente || '').toLowerCase().trim() === _nombre && Number(p.total || 0) > 0
                );
                let _hint = document.getElementById('precioSugeridoHint');
                if (_todosHist.length >= 2 && _nombre) {
                    const _promedio = _todosHist.reduce((s: number, p: any) => s + Number(p.total || 0), 0) / _todosHist.length;
                    // Buscar el input de precio en el modal
                    const _precioEl = document.getElementById('pedidoCosto') || document.getElementById('pedidoPrecioLibre') || document.getElementById('pedidoTotal');
                    if (_precioEl) {
                        if (!_hint) {
                            _hint = document.createElement('div');
                            _hint.id = 'precioSugeridoHint';
                            _precioEl.insertAdjacentElement('afterend', _hint);
                        }
                        _hint.style.cssText = 'font-size:.7rem;color:#9ca3af;margin-top:3px;display:flex;align-items:center;gap:4px;';
                        _hint.innerHTML = `💡 Promedio histórico de este cliente: <strong style="color:#C5973B;">$${_promedio.toFixed(2)}</strong>`;
                    }
                } else if (_hint) {
                    _hint.remove();
                }
            })();
            if (!_nombre) return;

            // Buscar pedidos del cliente (activos + finalizados)
            const _todos = [...(window.pedidos || []), ...(window.pedidosFinalizados || [])];
            const _delCliente = _todos.filter(p =>
                (p.cliente || '').toLowerCase().trim() === _nombre
            );
            if (_delCliente.length === 0) return;

            // Ordenar por fecha de creación descendente para obtener el último
            _delCliente.sort((a, b) => {
                const fa = a.fechaCreacion || a.fechaPedido || '';
                const fb = b.fechaCreacion || b.fechaPedido || '';
                return fb.localeCompare(fa);
            });
            const _ultimo = _delCliente[0];
            if (!_ultimo) return;

            const _esc3 = (window as any)._esc || ((s: string) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
            const _btn = document.createElement('button');
            _btn.type = 'button';
            _btn.id = 'btnDuplicarUltimoPedido';
            _btn.style.cssText = 'display:block;margin-top:4px;font-size:.75rem;color:#d97706;text-decoration:underline;background:none;border:none;cursor:pointer;padding:0;';
            _btn.textContent = '📋 Usar estructura del último pedido';
            _btn.onclick = function() {
                // Pre-llenar modal con datos del último pedido (NO: fecha entrega, anticipo, folio, cliente)
                const _conceptoEl = document.getElementById('pedidoConcepto') as HTMLInputElement|null;
                const _notasEl    = document.getElementById('pedidoNotas') as HTMLTextAreaElement|null;
                const _niEl       = document.getElementById('pedidoNotasInternas') as HTMLTextAreaElement|null;
                const _lugarEl    = document.getElementById('pedidoLugarEntrega') as HTMLInputElement|null;

                if (_conceptoEl && _ultimo.concepto) _conceptoEl.value = _esc3(_ultimo.concepto);
                if (_notasEl && _ultimo.notas) _notasEl.value = _esc3(_ultimo.notas);
                if (_niEl && _ultimo.notasInternas) _niEl.value = _esc3(_ultimo.notasInternas);
                if (_lugarEl && _ultimo.lugarEntrega) _lugarEl.value = _esc3(_ultimo.lugarEntrega);

                // Pre-llenar productos/items del último pedido (copiar profundo)
                const _itemsPrev = (_ultimo.productosInventario || []).map((i: any) => ({...i}));
                window.pedidoProductosSeleccionados = _itemsPrev;
                if (typeof renderPedidoProductosList === 'function') renderPedidoProductosList();
                if (_itemsPrev.length > 0 && typeof calcPedidoTotal === 'function') calcPedidoTotal();

                // Pre-llenar empaques del último pedido
                const _empaquesPrev = (_ultimo.empaques || []).map((e: any) => ({...e}));
                window.pedidoEmpaquesSeleccionados = _empaquesPrev;
                if (typeof renderPedidoEmpaquesList === 'function') renderPedidoEmpaquesList();

                if (typeof manekiToastExport === 'function') manekiToastExport('📋 Estructura del último pedido pre-cargada.', 'ok');
                _btn.remove();
            };
            _clienteInput.insertAdjacentElement('afterend', _btn);
        };
        (window as any)._duplicarClienteHandler = _handler;
        _clienteInput.addEventListener('input', _handler);
        _clienteInput.addEventListener('change', _handler);
    })();

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
            const niEl = document.getElementById('pedidoNotasInternas');
            const niActual = niEl ? niEl.value.trim() : '';
            const niOriginal = saved.notasInternas || '';
            const hayCambio = clienteActual  !== (saved.cliente||'')   ||
                              conceptoActual !== (saved.concepto||'')  ||
                              anticipoActual !== (saved.anticipo||0)   ||
                              itemsActuales  !== (saved.productosInventario||[]).length ||
                              entregaActual  !== (saved.entrega||'')   ||
                              notasActuales  !== (saved.notas||'')     ||
                              niActual       !== niOriginal;
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

    // UX-3: activar step 2 cuando se agrega un producto al pedido
    if (items.length > 0 && typeof _updatePedidoStep === 'function') _updatePedidoStep(2);

    // Mostrar/ocultar campo de precio libre según si hay productos
    const precioLibreRow = document.getElementById('pedidoPrecioLibreRow');
    if (precioLibreRow) precioLibreRow.style.display = items.length === 0 ? 'flex' : 'none';

    // FIX floating point: redondear cada línea en centavos antes de sumar
    let total = window._sumLineas ? _sumLineas(items) :
        items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);

    // Precio libre: se usa cuando no hay productos del inventario
    if (total === 0 && items.length === 0) {
        const precioLibreEl = document.getElementById('pedidoPrecioLibre') as HTMLInputElement|null;
        if (precioLibreEl && precioLibreEl.value.trim()) {
            const rawVal = precioLibreEl.value.replace(/[$,\s]/g, '');
            const parsed = parseFloat(rawVal);
            if (isNaN(parsed)) {
                if (typeof manekiToastExport === 'function') manekiToastExport('⚠️ Precio inválido — ingresa solo números', 'warn');
                precioLibreEl.value = '';
            } else {
                total = parsed;
            }
        }
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
    // MEJORA 1: actualizar costo de producción visible
    if (typeof _calcularCostoProduccionPedido === 'function') _calcularCostoProduccionPedido();
}

// ── Submit formulario de pedido ──
let _pedidoGuardando = false;
document.getElementById('pedidoForm').addEventListener('submit', async function(e) {
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
    const notasInternas = (document.getElementById('pedidoNotasInternas')?.value || '').trim();
    const lugarEntrega = document.getElementById('pedidoLugarEntrega').value.trim();
    const costoMateriales = parseFloat(document.getElementById('pedidoCostoMateriales').value) || 0;
    // NTH-05: prioridad del pedido
    const prioridad = (document.getElementById('pedidoPrioridad')?.value) || 'normal';
    let items = [...(window.pedidoProductosSeleccionados || [])];

    // FIX SUBMIT-SYNC: leer valores actuales de los inputs inline de precio y cantidad
    // del DOM antes de calcular. Esto cubre el caso donde el usuario edita un campo
    // y hace click en Guardar sin salir del input (onchange no se dispara en ese caso).
    // SAFETY: solo sobreescribir precio si el valor del DOM es un número positivo válido
    // (evita sobrescribir precios correctos con 0 cuando el input queda vacío).
    if (items.length > 0) {
        const list = document.getElementById('pedidoProductosList');
        if (list) {
            const priceInputs = list.querySelectorAll('input[type="number"][onchange*="editarPrecioPedidoProducto"]');
            const qtyInputs   = list.querySelectorAll('input[type="number"][onchange*="editarCantidadPedidoProducto"]');
            priceInputs.forEach(inp => {
                const match = (inp.getAttribute('onchange') || '').match(/editarPrecioPedidoProducto\((\d+)/);
                if (match) {
                    const idx = parseInt(match[1]);
                    const parsed = parseFloat(inp.value);
                    // Solo sobreescribir si el DOM tiene un número válido ≥ 0
                    if (items[idx] !== undefined && !isNaN(parsed) && inp.value.trim() !== '') {
                        items[idx].price = parsed;
                    }
                }
            });
            qtyInputs.forEach(inp => {
                const match = (inp.getAttribute('onchange') || '').match(/editarCantidadPedidoProducto\((\d+)/);
                if (match) {
                    const idx = parseInt(match[1]);
                    const parsed = parseInt(inp.value);
                    if (items[idx] !== undefined && !isNaN(parsed) && parsed > 0) {
                        items[idx].quantity = parsed;
                    }
                }
            });
        }
        // Sincronizar array fuente para que calcPedidoTotal() sea consistente
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

    if (!cliente) {
        const clienteInput = document.getElementById('pedidoCliente');
        if (clienteInput) {
            clienteInput.style.borderColor = '#ef4444';
            clienteInput.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
            clienteInput.focus();
            setTimeout(() => { clienteInput.style.borderColor = ''; clienteInput.style.boxShadow = ''; }, 3000);
        }
        manekiToastExport('Por favor escribe el nombre del cliente.', 'warn');
        return;
    }
    // A7: validar que montos no sean negativos
    if (Number(total) < 0) { manekiToastExport('El monto no puede ser negativo', 'warn'); return; }
    if (Number(anticipo) < 0) { manekiToastExport('El monto no puede ser negativo', 'warn'); return; }
    // GUARD-1: advertir si no hay precio, pero solo bloquear cuando tampoco hay productos
    // (si hay items en el array, el total podría ser 0 por producto sin precio asignado — dejar pasar con aviso)
    if (total === 0 && items.length === 0) {
        manekiToastExport('⚠️ El pedido no tiene precio. Agrega productos del inventario o escribe el precio en el campo amarillo.', 'warn');
        return;
    }
    if (total === 0 && items.length > 0) {
        manekiToastExport('⚠️ Los productos tienen precio $0. Verifica los precios antes de guardar.', 'warn');
        // No bloqueamos — dejamos guardar con advertencia
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
    // FIX: safety timeout — liberar lock si el guardado tarda más de 30 segundos
    const _lockTimeout = setTimeout(() => {
        if (_pedidoGuardando) {
            _pedidoGuardando = false;
            const _btn = document.getElementById('pedidoSubmitBtn');
            if (_btn) { _btn.disabled = false; _btn.style.opacity = ''; _btn.innerHTML = 'Guardar Pedido'; }
            manekiToastExport('⚠️ El guardado tardó demasiado. Intenta de nuevo.', 'warn');
        }
    }, 30000);
    if (!window.pedidos) window.pedidos = [];

    if (editId) {
        const idx = window.pedidos.findIndex(p => String(p.id) === String(editId));
        if (idx !== -1) {
            const pActual = window.pedidos[idx];

            // BUG-2 FIX: ajustar stock cuando el pedido ya tiene inventarioDescontado === true
            if (pActual.inventarioDescontado === true) {
                _ajustarStockDiferencia(pActual.productosInventario, window.pedidoProductosSeleccionados || []);
            }

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
                clearTimeout(_lockTimeout);
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
                        id: mkId(),
                        tipo: 'anticipo', monto: anticipo,
                        fecha: `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`,
                        hora: _d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}),
                        metodo: 'efectivo', nota: 'Anticipo ajustado al editar'
                    });
                }
            }

            // Guardar alias móvil (whatsapp/facebook) para compatibilidad bidireccional
            window.pedidos[idx] = { ...pActual, cliente, telefono, redes, whatsapp: telefono, facebook: redes, fechaPedido, entrega, concepto, cantidad, costo, total, anticipo, resta, notas, notasInternas, lugarEntrega, costoMateriales, prioridad, pagos: pagosActualizados, productosInventario: (window.pedidoProductosSeleccionados || []).map(i => ({...i})), empaques: (window.pedidoEmpaquesSeleccionados || []).map(e => ({...e})) };
            await savePedidos();
            if (window.MKS) MKS.notify();
            manekiToastExport('✅ Pedido actualizado.', 'ok');
        }
    } else {
        const folio = await generarFolioPedido();
        if (!folio) {
            manekiToastExport('⚠️ No se pudo generar folio único. Verifica conexión y recarga la página.', 'err');
            clearTimeout(_lockTimeout);
            _pedidoGuardando = false;
            if (_btnSubmit) { _btnSubmit.disabled = false; _btnSubmit.style.opacity = ''; _btnSubmit.innerHTML = 'Guardar Pedido'; }
            return;
        }
        const pedido = {
            id: mkId(),
            folio: folio,
            cliente, telefono, redes,
            whatsapp: telefono, facebook: redes,  // alias móvil para compatibilidad
            fechaPedido, entrega, concepto,
            cantidad, costo, total, anticipo, resta, notas, notasInternas, lugarEntrega, costoMateriales, prioridad,
            status: 'confirmado',
            pagos: anticipo > 0 ? [{
                id: mkId(),
                tipo: 'anticipo',
                monto: anticipo,
                fecha: (typeof _fechaHoy === 'function' ? _fechaHoy() : (()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })()),
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
        await savePedidos();
        if (window.MKS) MKS.sale();
        manekiToastExport('✅ Pedido creado: ' + pedido.folio, 'ok');
    }
    clearTimeout(_lockTimeout);
    _pedidoGuardando = false;
    // FIX C7: re-habilitar botón guardar al terminar (éxito o error)
    if (_btnSubmit) { _btnSubmit.disabled = false; _btnSubmit.style.opacity = ''; _btnSubmit.innerHTML = editId ? 'Actualizar Pedido' : 'Guardar Pedido'; }
    closeModal('pedidoModal');
    renderPedidosTable();
    updatePedidosStats();
    if (typeof checkAlertasEntregas === 'function') checkAlertasEntregas();
    if (typeof checkAlertasCobro === 'function') checkAlertasCobro();
});

// ── BUG-2: Ajustar stock cuando se edita un pedido que ya descontó inventario ──
function _ajustarStockDiferencia(antesItems, despuesItems) {
    const prodMap = new Map((window.products||[]).map(p => [String(p.id), p]));
    const mapAntes = {};
    (antesItems||[]).forEach(i => { mapAntes[String(i.id)] = (mapAntes[String(i.id)]||0) + (i.quantity||i.cantidad||1); });
    const mapDespues = {};
    (despuesItems||[]).forEach(i => { mapDespues[String(i.id)] = (mapDespues[String(i.id)]||0) + (i.quantity||i.cantidad||1); });
    const todosIds = new Set([...Object.keys(mapAntes), ...Object.keys(mapDespues)]);
    let cambios = 0;
    todosIds.forEach(id => {
        const cant_antes = mapAntes[id] || 0;
        const cant_despues = mapDespues[id] || 0;
        const diff = cant_despues - cant_antes;
        if (diff === 0) return;
        const prod = prodMap.get(id);
        if (!prod || prod.tipo === 'servicio') return;
        if (diff > 0) {
            prod.stock = Math.max(0, (prod.stock||0) - diff);
        } else {
            prod.stock = (prod.stock||0) + Math.abs(diff);
        }
        cambios++;
    });
    if (cambios > 0) { saveProducts(); if (typeof renderInventoryTable === 'function') renderInventoryTable(); }
    return cambios;
}
window._ajustarStockDiferencia = _ajustarStockDiferencia;

// ══════════════════════════════════════════════════════════════
// FEATURE 1: Parser de WhatsApp para pre-llenar pedido
// ══════════════════════════════════════════════════════════════
let _waDatosExtraidos: any = null;

function abrirParserWA() {
    // Inyectar modal si no existe
    if (!document.getElementById('waParserModal')) {
        const div = document.createElement('div');
        div.innerHTML = `<div id="waParserModal" class="fixed inset-0 z-50 hidden items-center justify-center" style="background:rgba(0,0,0,0.5);">
  <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
    <h3 class="text-lg font-bold text-gray-800 mb-3">📱 Pegar mensaje de WhatsApp</h3>
    <p class="text-sm text-gray-500 mb-3">Pega el mensaje y extraeremos los datos del pedido automáticamente.</p>
    <textarea id="waParserInput" rows="8" class="w-full border rounded-xl p-3 text-sm resize-none" placeholder="Hola! Me llamo María García, mi teléfono es 8112345678. Quiero 2 tazas personalizadas con foto, para el 20 de junio. Doy anticipo de $200..."></textarea>
    <div id="waParserPreview" class="hidden mt-3 bg-gray-50 rounded-xl p-3 text-sm"></div>
    <div class="flex gap-2 mt-4">
      <button type="button" onclick="closeModal('waParserModal')" class="flex-1 py-2 rounded-xl text-sm" style="background:#f3f4f6;color:#374151;">Cancelar</button>
      <button type="button" onclick="_analizarWAMsg()" class="flex-1 py-2 rounded-xl text-sm font-semibold" style="background:#7c3aed;color:white;">Analizar</button>
      <button type="button" id="waParserApplyBtn" onclick="_aplicarDatosWA()" class="hidden flex-1 py-2 rounded-xl text-sm font-semibold" style="background:#059669;color:white;">Usar datos</button>
    </div>
  </div>
</div>`;
        document.body.appendChild(div.firstElementChild);
    }
    // Limpiar estado previo
    const input = document.getElementById('waParserInput') as HTMLTextAreaElement|null;
    if (input) input.value = '';
    const preview = document.getElementById('waParserPreview');
    if (preview) { preview.innerHTML = ''; preview.classList.add('hidden'); }
    const applyBtn = document.getElementById('waParserApplyBtn');
    if (applyBtn) applyBtn.classList.add('hidden');
    _waDatosExtraidos = null;
    openModal('waParserModal');
}

function _analizarWAMsg() {
    const input = document.getElementById('waParserInput') as HTMLTextAreaElement|null;
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) { if (typeof manekiToastExport === 'function') manekiToastExport('Pega un mensaje de WhatsApp primero', 'warn'); return; }

    const _e = (window as any)._esc || ((s: string) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));

    // Extraer nombre
    let nombre = '';
    const regexNombre = [
        /me llamo\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
        /soy\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
        /mi nombre es\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
    ];
    for (const rx of regexNombre) {
        const m = texto.match(rx);
        if (m) { nombre = m[1].trim(); break; }
    }
    if (!nombre) {
        // Fallback: primera secuencia de palabras capitalizadas
        const mCap = texto.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/);
        if (mCap) nombre = mCap[1].trim();
    }

    // Extraer teléfono
    let telefono = '';
    const mTel = texto.match(/(?:\+52\s*)?(?:\(?\d{2,3}\)?\s*[-.\s]?)?\d{4}[-.\s]?\d{4}/);
    if (mTel) {
        telefono = mTel[0].replace(/\D/g, '');
        if (telefono.startsWith('52') && telefono.length === 12) telefono = telefono.slice(2);
    }

    // Extraer concepto/producto
    let concepto = '';
    const regexConcepto = [
        /(?:quiero|necesito|pedido de|ordenar)\s+([^.,\n]+)/i,
    ];
    for (const rx of regexConcepto) {
        const m = texto.match(rx);
        if (m) { concepto = m[1].trim(); break; }
    }

    // Extraer fecha de entrega
    let fechaEntrega = '';
    const MESES_MAP: Record<string, string> = {
        enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06',
        julio:'07', agosto:'08', septiembre:'09', octubre:'10', noviembre:'11', diciembre:'12'
    };
    const mFecha1 = texto.match(/para el\s+(\d{1,2})\s+de\s+(\w+)/i);
    if (mFecha1) {
        const dia = mFecha1[1].padStart(2,'0');
        const mes = MESES_MAP[mFecha1[2].toLowerCase()];
        if (mes) {
            const anio = new Date().getFullYear();
            fechaEntrega = `${anio}-${mes}-${dia}`;
        }
    }
    if (!fechaEntrega) {
        const mFecha2 = texto.match(/para el\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i);
        if (mFecha2) {
            const anio = mFecha2[3] ? (mFecha2[3].length === 2 ? '20' + mFecha2[3] : mFecha2[3]) : String(new Date().getFullYear());
            fechaEntrega = `${anio}-${mFecha2[2].padStart(2,'0')}-${mFecha2[1].padStart(2,'0')}`;
        }
    }

    // Extraer anticipo/total
    let anticipo = '';
    const mMonto = texto.match(/\$\s*(\d[\d,]*(?:\.\d{1,2})?)/);
    if (mMonto) anticipo = mMonto[1].replace(/,/g, '');

    _waDatosExtraidos = { nombre, telefono, concepto, fechaEntrega, anticipo };

    // Mostrar preview
    const preview = document.getElementById('waParserPreview');
    if (preview) {
        const filas = [
            ['👤 Nombre', nombre || '<span style="color:#9ca3af">No detectado</span>'],
            ['📱 Teléfono', telefono || '<span style="color:#9ca3af">No detectado</span>'],
            ['🛍️ Concepto', concepto || '<span style="color:#9ca3af">No detectado</span>'],
            ['📅 Entrega', fechaEntrega || '<span style="color:#9ca3af">No detectado</span>'],
            ['💵 Anticipo', anticipo ? '$' + anticipo : '<span style="color:#9ca3af">No detectado</span>'],
        ];
        preview.innerHTML = '<table style="width:100%;border-collapse:collapse;">'
            + filas.map(([k, v]) => `<tr><td style="padding:3px 6px;font-weight:600;color:#374151;font-size:.8rem;white-space:nowrap;">${k}</td><td style="padding:3px 6px;color:#1f2937;font-size:.8rem;">${v}</td></tr>`).join('')
            + '</table>';
        preview.classList.remove('hidden');
    }

    const applyBtn = document.getElementById('waParserApplyBtn');
    if (applyBtn) applyBtn.classList.remove('hidden');
}

function _aplicarDatosWA() {
    if (!_waDatosExtraidos) return;
    const { nombre, telefono, concepto, fechaEntrega, anticipo } = _waDatosExtraidos;

    closeModal('waParserModal');

    // Abrir modal de nuevo pedido si no está abierto
    if (typeof openPedidoModal === 'function') openPedidoModal('');

    // Pequeño delay para que el modal se renderice antes de rellenar
    setTimeout(() => {
        const clienteEl = document.getElementById('pedidoCliente') as HTMLInputElement|null;
        const telefonoEl = document.getElementById('pedidoTelefono') as HTMLInputElement|null;
        const conceptoEl = document.getElementById('pedidoConcepto') as HTMLInputElement|null;
        const entregaEl = document.getElementById('pedidoEntrega') as HTMLInputElement|null;
        const anticipoEl = document.getElementById('pedidoAnticipo') as HTMLInputElement|null;

        if (clienteEl && nombre) { clienteEl.value = nombre; clienteEl.dispatchEvent(new Event('input')); }
        if (telefonoEl && telefono) telefonoEl.value = telefono;
        if (conceptoEl && concepto) conceptoEl.value = concepto;
        if (entregaEl && fechaEntrega) entregaEl.value = fechaEntrega;
        if (anticipoEl && anticipo) { anticipoEl.value = anticipo; if (typeof calcPedidoTotal === 'function') calcPedidoTotal(); }

        if (typeof manekiToastExport === 'function') manekiToastExport('📱 Datos del mensaje pre-cargados.', 'ok');
    }, 300);
}

window.abrirParserWA = abrirParserWA;
window._analizarWAMsg = _analizarWAMsg;
window._aplicarDatosWA = _aplicarDatosWA;

