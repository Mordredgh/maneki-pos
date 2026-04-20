// ============== EQUIPOS / ROI ==============

let equipos = [];
let roiHistorial = [];
let roiConfig = { porcentaje: 10 };
let _roiPedidoData = null; // temp data while modal is open

function saveEquipos() { sbSave('equipos', equipos); }
function saveRoiHistorial() { sbSave('roiHistorial', roiHistorial); }
function saveAbonos() {} // removed - ventas en abonos eliminated
function saveRoiConfig() {
    const pct = parseFloat(document.getElementById('roiPorcentajeGlobal').value) || 10;
    roiConfig.porcentaje = Math.min(100, Math.max(1, pct));
    sbSave('roiConfig', roiConfig);
    manekiToastExport('✅ Porcentaje ROI guardado: ' + roiConfig.porcentaje + '%', 'ok');
}

function openEquipoModal(id) {
    const modal = document.getElementById('equipoModal');
    document.getElementById('equipoEditId').value = '';
    document.getElementById('equipoNombre').value = '';
    document.getElementById('equipoEmoji').value = '🔧';
    document.getElementById('equipoCostoOriginal').value = '';
    document.getElementById('equipoMetaReemplazo').value = '';
    document.getElementById('equipoModalTitle').textContent = 'Agregar Equipo';
    const display = document.getElementById('equipoEmojiDisplay');
    if (display) display.textContent = '🔧';
    const search = document.getElementById('equipoEmojiSearch');
    if (search) search.value = '';

    // MEJ-4: campo metaMensual — crear dinámicamente si no existe en el modal
    _ensureMetaMensualField();
    const metaMensualInput = document.getElementById('equipoMetaMensual');
    if (metaMensualInput) metaMensualInput.value = '';

    if (id) {
        const eq = equipos.find(e => e.id === id);
        if (eq) {
            document.getElementById('equipoEditId').value = eq.id;
            document.getElementById('equipoNombre').value = eq.nombre;
            document.getElementById('equipoEmoji').value = eq.emoji || '🔧';
            if (display) display.textContent = eq.emoji || '🔧';
            document.getElementById('equipoCostoOriginal').value = eq.costoOriginal;
            document.getElementById('equipoMetaReemplazo').value = eq.metaReemplazo;
            if (metaMensualInput) metaMensualInput.value = eq.metaMensual || '';
            document.getElementById('equipoModalTitle').textContent = 'Editar Equipo';
        }
    }
    openModal(modal);
    setTimeout(() => renderEquipoEmojiGrid(), 50);
}

// Crea el campo metaMensual en el modal si no existe aún
function _ensureMetaMensualField() {
    if (document.getElementById('equipoMetaMensual')) return;
    // Buscar el contenedor de los campos numéricos (grid de 2 cols) para agregar el campo después
    const gridCols = document.querySelector('#equipoModal .grid.grid-cols-2');
    if (!gridCols) return;
    const div = document.createElement('div');
    div.style.marginTop = '4px';
    div.innerHTML = `<label class="block text-sm font-semibold text-gray-600 mb-1" for="equipoMetaMensual">Meta mensual ($)</label>
        <input type="number" id="equipoMetaMensual" placeholder="Ej: 5000" min="0"
               class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:outline-none">
        <p class="text-xs text-gray-400 mt-1">Cuánto quieres recuperar por mes con este equipo</p>`;
    gridCols.insertAdjacentElement('afterend', div);
}
function closeEquipoModal() { closeModal('equipoModal'); }

function saveEquipo() {
    const nombre = document.getElementById('equipoNombre').value.trim();
    const emoji = document.getElementById('equipoEmoji').value.trim() || '🔧';
    const costoOriginal = parseFloat(document.getElementById('equipoCostoOriginal').value) || 0;
    const metaReemplazo = parseFloat(document.getElementById('equipoMetaReemplazo').value) || costoOriginal;
    // MEJ-4: leer metaMensual (campo creado dinámicamente)
    const metaMensual = parseFloat(document.getElementById('equipoMetaMensual')?.value) || 0;
    if (!nombre) { manekiToastExport('⚠️ Ingresa el nombre del equipo', 'warn'); return; }
    if (!costoOriginal) { manekiToastExport('⚠️ Ingresa el costo original del equipo', 'warn'); return; }

    const editId = document.getElementById('equipoEditId').value;
    if (editId) {
        const idx = equipos.findIndex(e => String(e.id) === String(editId));
        if (idx !== -1) {
            equipos[idx] = { ...equipos[idx], nombre, emoji, costoOriginal, metaReemplazo, metaMensual };
        }
        manekiToastExport('✅ Equipo actualizado', 'ok');
    } else {
        equipos.push({
            id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
            nombre, emoji, costoOriginal, metaReemplazo, metaMensual,
            recuperado: 0,
            historialPagos: []  // MEJ-5: historial de pagos
        });
        manekiToastExport('✅ Equipo agregado', 'ok');
    }
    saveEquipos();
    closeEquipoModal();
    renderEquiposGrid();
}

function deleteEquipo(id) {
    showConfirm('¿Eliminar este equipo? Se perderá su historial de ROI.', '🗑️ Eliminar equipo')
    .then(ok => {
        if (!ok) return;
        equipos = equipos.filter(e => e.id !== id);
        roiHistorial = roiHistorial.filter(h => !h.equiposIds.includes(id));
        saveEquipos(); saveRoiHistorial();
        renderEquiposGrid(); renderRoiHistorial();
        manekiToastExport('🗑️ Equipo eliminado', 'ok');
    });
}

function renderEquiposGrid() {
    const grid = document.getElementById('equiposGrid');
    if (!grid) return;
    if (equipos.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400">
            <i class="fas fa-tools text-5xl mb-4 block opacity-30"></i>
            <p class="text-lg font-medium">Aún no tienes equipos registrados</p>
            <p class="text-sm mt-1">Agrega tu primer equipo para empezar a calcular el ROI</p>
            <button onclick="openEquipoModal()" class="mt-4 px-6 py-2 rounded-xl text-white font-semibold" style="background:#C5A572;">+ Agregar equipo</button>
        </div>`;
        return;
    }
    grid.innerHTML = equipos.map(eq => {
        // Migrar: asegurar que historialPagos exista
        if (!eq.historialPagos) eq.historialPagos = [];

        const pctRecuperado = eq.costoOriginal > 0 ? Math.min(100, (eq.recuperado / eq.costoOriginal) * 100) : 0;
        const pctMeta = eq.metaReemplazo > 0 ? Math.min(100, (eq.recuperado / eq.metaReemplazo) * 100) : 0;
        const faltaInversion = Math.max(0, eq.costoOriginal - eq.recuperado);
        const faltaMeta = Math.max(0, eq.metaReemplazo - eq.recuperado);
        const invertida = pctRecuperado >= 100;

        const barColorInv = invertida ? '#10B981' : '#C5A572';
        const barColorMeta = pctMeta >= 100 ? '#10B981' : '#8B5CF6';

        // MEJ-4: barra de progreso metaMensual
        // Calcular recuperado este mes (suma de pagos del mes actual en historialPagos)
        const mesActual = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
        const recuperadoMes = (eq.historialPagos || [])
            .filter(h => h.fecha && h.fecha.startsWith(mesActual))
            .reduce((s, h) => s + Number(h.monto || 0), 0);
        const metaMensual = Number(eq.metaMensual) || 0;
        let metaMensualHTML = '';
        if (metaMensual > 0) {
            const pctMensual = Math.min(100, (recuperadoMes / metaMensual) * 100);
            const barColorMensual = pctMensual < 50 ? '#ef4444' : pctMensual < 80 ? '#f59e0b' : '#10b981';
            metaMensualHTML = `
            <!-- MEJ-4: Meta mensual -->
            <div class="mb-3" style="padding-top:8px;border-top:1px solid #f3f4f6;">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>📅 Meta mensual</span>
                    <span class="font-semibold" style="color:${barColorMensual}">${pctMensual.toFixed(1)}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${pctMensual}%;background:${barColorMensual};"></div>
                </div>
                <p class="text-xs mt-1" style="color:${barColorMensual};">Meta: $${metaMensual.toLocaleString('es-MX')} | Recuperado: $${recuperadoMes.toLocaleString('es-MX')} (${pctMensual.toFixed(0)}%)</p>
            </div>`;
        }

        // MEJ-5: lista de últimos 5 pagos del historial
        const ultimos5 = [...(eq.historialPagos || [])].reverse().slice(0, 5);
        const pagosHTML = ultimos5.length === 0
            ? '<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin pagos registrados aún</p>'
            : ultimos5.map(h => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f9fafb;font-size:.72rem;">
                    <div>
                        <span style="color:#374151;font-weight:600;">$${Number(h.monto||0).toLocaleString('es-MX',{minimumFractionDigits:2})}</span>
                        ${h.concepto ? `<span style="color:#9ca3af;margin-left:6px;">${_esc(h.concepto)}</span>` : ''}
                    </div>
                    <span style="color:#9ca3af;">${h.fecha||''}</span>
                </div>`).join('');

        return `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${_esc(eq.emoji || '🔧')}</span>
                    <div>
                        <h4 class="font-bold text-gray-800 text-lg leading-tight">${_esc(eq.nombre)}</h4>
                        <p class="text-xs text-gray-400">Inversión: $${eq.costoOriginal.toLocaleString('es-MX')}</p>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="openEquipoModal('${eq.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50"><i class="fas fa-edit text-sm"></i></button>
                    <button onclick="deleteEquipo('${eq.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><i class="fas fa-trash text-sm"></i></button>
                </div>
            </div>

            <!-- Recuperado de inversión -->
            <div class="mb-3">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>💰 Recuperado de inversión</span>
                    <span class="font-semibold" style="color:${barColorInv}">${pctRecuperado.toFixed(1)}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${pctRecuperado}%;background:${barColorInv};"></div>
                </div>
                <div class="flex justify-between text-xs mt-1">
                    <span class="text-green-600 font-medium">$${eq.recuperado.toLocaleString('es-MX')} ahorrado</span>
                    <span class="text-red-400">${faltaInversion > 0 ? 'Falta $' + faltaInversion.toLocaleString('es-MX') : '✅ ¡Inversión recuperada!'}</span>
                </div>
            </div>

            <!-- Meta de reemplazo -->
            <div class="mb-1">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>🆕 Meta reemplazo ($${eq.metaReemplazo.toLocaleString('es-MX')})</span>
                    <span class="font-semibold" style="color:${barColorMeta}">${pctMeta.toFixed(1)}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${pctMeta}%;background:${barColorMeta};"></div>
                </div>
                <p class="text-xs mt-1 text-right" style="color:${barColorMeta}">${faltaMeta > 0 ? 'Falta $' + faltaMeta.toLocaleString('es-MX') + ' para equipo nuevo' : '✅ ¡Ya puedes comprar equipo nuevo!'}</p>
            </div>

            ${metaMensualHTML}

            <!-- MEJ-5: botón Ver pagos + historial -->
            <div style="margin-top:10px;border-top:1px solid #f3f4f6;padding-top:8px;">
                <button onclick="_togglePagosEquipo('${eq.id}')"
                        style="font-size:.72rem;color:#6b7280;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:3px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;">
                    📋 Ver pagos <span id="pagosCount_${eq.id}" style="background:#f3f4f6;border-radius:99px;padding:1px 6px;">${eq.historialPagos.length}</span>
                </button>
                <div id="pagosHistorial_${eq.id}" style="display:none;margin-top:8px;">${pagosHTML}</div>
            </div>
        </div>`;
    }).join('');
}

// MEJ-5: toggle visibilidad del historial de pagos de un equipo
function _togglePagosEquipo(eqId) {
    const div = document.getElementById('pagosHistorial_' + eqId);
    if (!div) return;
    div.style.display = div.style.display === 'none' ? 'block' : 'none';
}
window._togglePagosEquipo = _togglePagosEquipo;

// MEJ-5: registrar un pago en el historial de un equipo
// Llamar desde confirmarRoiEquipos y confirmarRoiManual para mantener el historial
function _registrarPagoEquipo(eqId, monto, concepto) {
    const idx = equipos.findIndex(e => e.id === eqId);
    if (idx === -1) return;
    if (!equipos[idx].historialPagos) equipos[idx].historialPagos = [];
    const fecha = (typeof window._fechaHoy === 'function') ? window._fechaHoy()
        : new Date().toISOString().split('T')[0];
    equipos[idx].historialPagos.push({
        id: Date.now(),
        fecha,
        monto: Number(monto) || 0,
        concepto: concepto || '',
        tipo: 'pago'
    });
}
window._registrarPagoEquipo = _registrarPagoEquipo;

function renderRoiHistorial() {
    const tbody = document.getElementById('roiHistorialBody');
    if (!tbody) return;
    if (roiHistorial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="mk-empty" style="padding:36px 24px;"><div class="mk-empty-icon">⚖️</div><p class="mk-empty-title">Sin movimientos aún</p><p class="mk-empty-sub">Registra ingresos o gastos para ver tu balance aquí.</p></div></td></tr>`;
        return;
    }
    const sorted = [...roiHistorial].reverse();
    tbody.innerHTML = sorted.map(h => {
        const nombres = h.equiposIds.map(id => {
            const eq = equipos.find(e => e.id === id);
            return eq ? `${_esc(eq.emoji || '🔧')} ${_esc(eq.nombre)}` : '(equipo eliminado)';
        }).join(', ');
        // NTH-16: mostrar fecha del registro ROI
        const fechaStr = h.fecha ? `<div class="text-xs text-gray-400">${h.fecha}</div>` : '';
        const folioLabel = h.folio === '__manual__'
            ? `<span class="text-xs text-gray-500 italic">${_esc(h.concepto||'Manual')}</span>`
            : `<span class="font-semibold text-amber-700">${_esc(h.folio||'—')}</span>`;
        return `<tr class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3">${folioLabel}${fechaStr}</td>
            <td class="px-4 py-3 text-gray-600 text-xs">${nombres}</td>
            <td class="px-4 py-3 text-right text-green-600 font-medium">$${Number(h.ganancia||0).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
            <td class="px-4 py-3 text-right text-amber-600 font-medium">$${Number(h.totalRoi||0).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
            <td class="px-4 py-3 text-right text-purple-600 font-medium">$${Number(h.porEquipo||0).toLocaleString('es-MX', {minimumFractionDigits:2})}</td>
        </tr>`;
    }).join('');
}

// Called when pedido is finalized — opens the ROI equipment selector
function abrirRoiEquiposModal(pedido) {
    if (equipos.length === 0) return; // No equipos registered, skip
    _roiPedidoData = pedido;

    // Ganancia = total cobrado al cliente (el "costo" en pedido es precio unitario, total = cant*costo)
    const ganancia = pedido.total || 0;
    document.getElementById('roiPedidoFolio').textContent = pedido.folio;
    document.getElementById('roiGananciaEstimada').textContent = '$' + ganancia.toLocaleString('es-MX', {minimumFractionDigits:2});
    document.getElementById('roiPctDisplay').textContent = roiConfig.porcentaje + '%';
    document.getElementById('roiPedidoId').value = pedido.id;

    // Render equipment checkboxes
    const lista = document.getElementById('roiEquiposLista');
    lista.innerHTML = equipos.map(eq => `
        <label class="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-amber-300 cursor-pointer transition-all" id="roiEqLabel_${eq.id}">
            <input type="checkbox" value="${eq.id}" class="roi-equipo-check w-4 h-4 accent-amber-500" onchange="actualizarCalculoRoi()">
            <span class="text-xl">${_esc(eq.emoji || '🔧')}</span>
            <span class="font-medium text-gray-700">${_esc(eq.nombre)}</span>
        </label>
    `).join('');

    // MEJ-5: inyectar campo "Concepto del pago" si no existe
    _ensureRoiConceptoField();
    const roiConceptoEl = document.getElementById('roiConceptoPago');
    if (roiConceptoEl) roiConceptoEl.value = `ROI pedido ${pedido.folio || ''}`.trim();

    actualizarCalculoRoi();
    openModal('roiEquiposModal');
}

// Inyecta campo concepto en el modal ROI si no existe
function _ensureRoiConceptoField() {
    if (document.getElementById('roiConceptoPago')) return;
    const lista = document.getElementById('roiEquiposLista');
    if (!lista) return;
    const div = document.createElement('div');
    div.style.marginBottom = '12px';
    div.innerHTML = `<label style="font-size:.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Concepto del pago (opcional)</label>
        <input type="text" id="roiConceptoPago" placeholder="Ej: ROI pedido MAN-045"
               style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;"
               onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">`;
    lista.insertAdjacentElement('afterend', div);
}

function cerrarRoiEquiposModal() {
    closeModal('roiEquiposModal');
    _roiPedidoData = null;
}

// Elimina entradas del historial ROI de un pedido y resta lo recuperado a los equipos
function limpiarRoiDePedido(pedidoId) {
    const entradas = roiHistorial.filter(h => h.pedidoId === pedidoId || h.folio === (pedidos.find(p=>p.id===pedidoId)||{}).folio);
    if (entradas.length === 0) return;
    // Revertir el recuperado de cada equipo
    entradas.forEach(h => {
        h.equiposIds.forEach(eqId => {
            const idx = equipos.findIndex(e => e.id === eqId);
            if (idx !== -1) {
                equipos[idx].recuperado = Math.max(0, (equipos[idx].recuperado || 0) - h.porEquipo);
            }
        });
    });
    saveEquipos();
    // Eliminar entradas del historial por pedidoId o folio
    roiHistorial = roiHistorial.filter(h => {
        if (h.pedidoId) return h.pedidoId !== pedidoId;
        // fallback for old entries without pedidoId: try to match folio from finalized
        return true;
    });
    saveRoiHistorial();
    if (document.getElementById('equipos-section') && !document.getElementById('equipos-section').classList.contains('hidden')) {
        renderEquiposGrid();
        renderRoiHistorial();
    }
}

function actualizarCalculoRoi() {
    const checks = document.querySelectorAll('.roi-equipo-check:checked');
    const count = checks.length;
    const pedidoId = document.getElementById('roiPedidoId').value; // mantener como string
    const pedido = _roiPedidoData;
    const ganancia = pedido ? (pedido.total || 0) : 0;
    const totalRoi = ganancia * (roiConfig.porcentaje / 100);
    const porEquipo = count > 0 ? totalRoi / count : 0;

    document.getElementById('roiEquiposCount').textContent = count;
    document.getElementById('roiPorEquipoDisplay').textContent = '$' + porEquipo.toLocaleString('es-MX', {minimumFractionDigits:2});

    // Highlight selected labels
    document.querySelectorAll('.roi-equipo-check').forEach(ch => {
        const label = ch.closest('label');
        if (ch.checked) {
            label.style.borderColor = '#C5A572';
            label.style.background = '#FFF9F0';
        } else {
            label.style.borderColor = '';
            label.style.background = '';
        }
    });
}

function confirmarRoiEquipos() {
    const checks = Array.from(document.querySelectorAll('.roi-equipo-check:checked'));
    if (checks.length === 0) { manekiToastExport('⚠️ Selecciona al menos un equipo', 'warn'); return; }

    const pedido = _roiPedidoData;
    const ganancia = pedido.total || 0;
    const totalRoi = ganancia * (roiConfig.porcentaje / 100);
    const porEquipo = totalRoi / checks.length;
    const equiposIds = checks.map(ch => ch.value); // IDs son UUID strings, no números

    // MEJ-5: leer concepto del campo inyectado en el modal
    const conceptoPago = document.getElementById('roiConceptoPago')?.value.trim() || `ROI pedido ${pedido.folio || ''}`.trim();
    equiposIds.forEach(id => {
        const idx = equipos.findIndex(e => e.id === id);
        if (idx !== -1) {
            equipos[idx].recuperado = (equipos[idx].recuperado || 0) + porEquipo;
            // MEJ-5: registrar pago en historial del equipo
            _registrarPagoEquipo(id, porEquipo, conceptoPago);
        }
    });
    saveEquipos();

    // Save to historial
    roiHistorial.push({
        fecha: (typeof _fechaHoy === 'function') ? _fechaHoy() : new Date().toISOString().split('T')[0],
        folio: pedido.folio,
        pedidoId: pedido.id,
        equiposIds,
        ganancia,
        totalRoi,
        porEquipo
    });
    saveRoiHistorial();

    cerrarRoiEquiposModal();
    renderEquiposGrid();
    renderRoiHistorial();
    manekiToastExport(`💰 ROI registrado: $${porEquipo.toLocaleString('es-MX', {minimumFractionDigits:2})} por equipo`, 'ok');
}

// ============== NTH-17: ROI MANUAL (sin pedido) ==============

function abrirRoiManualModal() {
    const lista = document.getElementById('roiManualEquiposLista');
    if (lista) {
        lista.innerHTML = equipos.map(eq => `
            <label class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-amber-50" style="border-color:#e5e7eb;">
                <input type="checkbox" class="roi-manual-check" value="${eq.id}" onchange="calcRoiManual()" style="accent-color:#C5A572;">
                <span class="text-lg">${eq.emoji || '🔧'}</span>
                <span class="text-sm font-semibold text-gray-700">${_esc(eq.nombre)}</span>
            </label>`).join('');
    }
    const pctEl = document.getElementById('roiManualPct');
    if (pctEl) pctEl.textContent = roiConfig.porcentaje + '%';
    const ganEl = document.getElementById('roiManualGanancia');
    if (ganEl) ganEl.value = '';
    const porEl = document.getElementById('roiManualPorEquipo');
    if (porEl) porEl.textContent = '$0.00';
    openModal(document.getElementById('roiManualModal'));
}

function cerrarRoiManualModal() { closeModal('roiManualModal'); }

function calcRoiManual() {
    const ganancia = parseFloat(document.getElementById('roiManualGanancia')?.value) || 0;
    const checks = Array.from(document.querySelectorAll('.roi-manual-check:checked'));
    const count = checks.length;
    const totalRoi = ganancia * (roiConfig.porcentaje / 100);
    const porEquipo = count > 0 ? totalRoi / count : 0;
    const pctEl = document.getElementById('roiManualPct');
    if (pctEl) pctEl.textContent = roiConfig.porcentaje + '%';
    const porEl = document.getElementById('roiManualPorEquipo');
    if (porEl) porEl.textContent = '$' + porEquipo.toLocaleString('es-MX', {minimumFractionDigits:2});
    document.querySelectorAll('.roi-manual-check').forEach(ch => {
        const label = ch.closest('label');
        if (ch.checked) { label.style.borderColor = '#C5A572'; label.style.background = '#FFF9F0'; }
        else { label.style.borderColor = ''; label.style.background = ''; }
    });
}

function confirmarRoiManual() {
    const concepto = document.getElementById('roiManualConcepto')?.value.trim();
    const ganancia = parseFloat(document.getElementById('roiManualGanancia')?.value) || 0;
    const checks = Array.from(document.querySelectorAll('.roi-manual-check:checked'));
    if (!concepto) { manekiToastExport('⚠️ Ingresa un concepto', 'warn'); return; }
    if (!ganancia) { manekiToastExport('⚠️ Ingresa el monto de ganancia', 'warn'); return; }
    if (checks.length === 0) { manekiToastExport('⚠️ Selecciona al menos un equipo', 'warn'); return; }

    const totalRoi = ganancia * (roiConfig.porcentaje / 100);
    const porEquipo = totalRoi / checks.length;
    const equiposIds = checks.map(ch => ch.value);

    equiposIds.forEach(id => {
        const idx = equipos.findIndex(e => e.id === id);
        if (idx !== -1) {
            equipos[idx].recuperado = (equipos[idx].recuperado || 0) + porEquipo;
            // MEJ-5: registrar pago en historial del equipo
            _registrarPagoEquipo(id, porEquipo, concepto);
        }
    });
    saveEquipos();

    roiHistorial.push({
        fecha: window._fechaHoy ? window._fechaHoy() : new Date().toISOString().split('T')[0],
        folio: '__manual__',
        concepto,
        pedidoId: null,
        equiposIds,
        ganancia,
        totalRoi,
        porEquipo
    });
    saveRoiHistorial();

    cerrarRoiManualModal();
    renderEquiposGrid();
    renderRoiHistorial();
    manekiToastExport(`💰 ROI manual registrado: $${porEquipo.toLocaleString('es-MX', {minimumFractionDigits:2})} por equipo`, 'ok');
}

        // ============== NOTAS RÁPIDAS DASHBOARD ==============

let notas = [];

function agregarNota() {
    const input = document.getElementById('notaInput');
    const texto = input.value.trim();
    if (!texto) return;

    const nota = {
        id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        texto: texto,
        fecha: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        done: false
    };

    notas.unshift(nota);
    input.value = '';
    sbSave('notas', notas);
    renderNotas();
}

function toggleNota(id) {
    const nota = notas.find(n => n.id === id);
    if (nota) {
        nota.done = !nota.done;
        sbSave('notas', notas);
        renderNotas();
    }
}

function eliminarNota(id) {
    notas = notas.filter(n => n.id !== id);
    sbSave('notas', notas);
    renderNotas();
}

function renderNotas() {
    const lista = document.getElementById('notasList');
    const count = document.getElementById('notasCount');
    if (!lista) return;

    const pendientes = notas.filter(n => !n.done).length;
    if (count) count.textContent = pendientes + ' pendiente' + (pendientes !== 1 ? 's' : '');

    if (notas.length === 0) {
        lista.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Sin notas por ahora</p>';
        return;
    }

    lista.innerHTML = notas.map(nota => `
        <div class="flex items-start gap-3 p-3 rounded-xl border transition-all ${nota.done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'}">
            <button onclick="toggleNota('${nota.id}')"
                    class="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${nota.done ? 'border-green-400 bg-green-400' : 'border-gray-300 hover:border-yellow-400'}"
                    style="${nota.done ? '' : ''}">
                ${nota.done ? '<i class="fas fa-check text-white" style="font-size:9px"></i>' : ''}
            </button>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 ${nota.done ? 'line-through text-gray-400' : ''}">${_esc(nota.texto)}</p>
                <p class="text-xs text-gray-400 mt-0.5">${nota.fecha} · ${nota.hora}</p>
            </div>
            <button onclick="eliminarNota('${nota.id}')"
                    class="text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                <i class="fas fa-times text-xs"></i>
            </button>
        </div>
    `).join('');
}
  // ============== AUTOCOMPLETADO CLIENTES POS ==============

let autocompleteIndex = -1;
let selectedClient = null;

function searchClientAutocomplete(query) {
    const dropdown = document.getElementById('clientAutocompleteDropdown');
    autocompleteIndex = -1;

    if (!query || query.trim().length < 1) {
        dropdown.classList.add('hidden');
        return;
    }

    const q = query.toLowerCase().trim();
    const matches = clients.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    ).slice(0, 6);

    if (matches.length === 0) {
        dropdown.innerHTML = `
            <div class="autocomplete-item">
                <p class="client-detail">No encontrado — se registrará como nuevo cliente</p>
            </div>`;
        dropdown.classList.remove('hidden');
        return;
    }

    dropdown.innerHTML = matches.map((c, i) => `
        <div class="autocomplete-item" data-index="${i}" onclick="selectClientFromAutocomplete('${c.id}')">
            <div class="flex items-center justify-between">
                <span class="client-name">${_esc(c.name)}</span>
                ${c.type === 'vip' ? '<span class="client-vip">⭐ VIP</span>' : ''}
            </div>
            <p class="client-detail">
                ${c.phone ? '📱 ' + _esc(c.phone) : ''}
                ${c.email ? ' · ✉️ ' + _esc(c.email) : ''}
            </p>
        </div>
    `).join('');

    dropdown.classList.remove('hidden');
}

function selectClientFromAutocomplete(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    selectedClient = client;
    document.getElementById('customerName').value = client.name;
    document.getElementById('clientAutocompleteDropdown').classList.add('hidden');

    // Mostrar info del cliente
    const infoBox = document.getElementById('selectedClientInfo');
    document.getElementById('selectedClientPhone').textContent = client.phone ? '📱 ' + client.phone : '';
    document.getElementById('selectedClientEmail').textContent = client.email ? '✉️ ' + client.email : '';
    document.getElementById('selectedClientType').textContent = client.type === 'vip' ? '⭐ Cliente VIP' : '👤 Cliente registrado';
    infoBox.classList.remove('hidden');
}

function clearSelectedClient() {
    selectedClient = null;
    document.getElementById('customerName').value = '';
    document.getElementById('selectedClientInfo').classList.add('hidden');
    document.getElementById('clientAutocompleteDropdown').classList.add('hidden');
}

function handleAutocompleteKey(event) {
    const dropdown = document.getElementById('clientAutocompleteDropdown');
    const items = dropdown.querySelectorAll('.autocomplete-item[data-index]');

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
        items.forEach((el, i) => el.classList.toggle('selected', i === autocompleteIndex));
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        autocompleteIndex = Math.max(autocompleteIndex - 1, 0);
        items.forEach((el, i) => el.classList.toggle('selected', i === autocompleteIndex));
    } else if (event.key === 'Enter' && autocompleteIndex >= 0) {
        event.preventDefault();
        items[autocompleteIndex]?.click();
    } else if (event.key === 'Escape') {
        dropdown.classList.add('hidden');
    }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('#customerName') && !e.target.closest('#clientAutocompleteDropdown')) {
        const dropdown = document.getElementById('clientAutocompleteDropdown');
        if (dropdown) dropdown.classList.add('hidden');
    }
});