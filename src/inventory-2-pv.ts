// ═══════════════════════════════════════════════════════════════════
// PRODUCTO VARIABLE — Stickers, tarjetas, cualquier producto con
// precio por rangos de cantidad
// ═══════════════════════════════════════════════════════════════════

window._pvMpComponentes = [];
window._pvTablaPreciosVariable = [];

function injectVariableProductModal() {
    const existing = document.getElementById('pvModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'pvModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content" style="max-width:580px;max-height:90vh;overflow-y:auto;border-radius:20px;padding:28px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:1.3rem;font-weight:800;color:#1a0533;">🎨 Producto Variable</h3>
            <button onclick="closeModal('pvModal')" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;">×</button>
        </div>
        <form id="pvForm" onsubmit="guardarProductoVariable(event)" style="display:flex;flex-direction:column;gap:16px;">
            <input type="hidden" id="pvEditId" value="">

            <!-- IMAGEN -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">📷 Imagen del Producto</label>
                <input type="file" id="pvProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;box-sizing:border-box;">
                <div id="pvImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="pvPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- Nombre -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">📝 Nombre del producto *</label>
                <input type="text" id="pvNombre" required placeholder="Ej: Stickers 5x5 cm, Tarjetas de presentación"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
            </div>

            <!-- Rendimiento por hoja -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">🎯 Piezas por hoja / unidad de MP</label>
                <input type="number" id="pvRendimiento" min="1" placeholder="Ej: 12 (cuántas piezas caben en 1 hoja)"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
                <p class="text-xs text-gray-400 mt-1">El sistema dividirá la cantidad del pedido entre este número para calcular hojas a descontar.</p>
            </div>

            <!-- Materias primas -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <label class="text-sm font-semibold text-gray-700">🏭 Materias Primas y Servicios</label>
                    <button type="button" onclick="pvAgregarComponente()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:linear-gradient(135deg,#9669c4,#ab84d1);">+ Agregar componente</button>
                </div>
                <div style="margin-bottom:8px;">
                    <input type="text" id="pvBuscarMP" placeholder="Buscar materia prima..."
                        oninput="pvFiltrarMP(this.value)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <div id="pvMpSuggestions" style="display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;margin-top:4px;max-height:150px;overflow-y:auto;z-index:10;position:relative;"></div>
                </div>
                <div id="pvMpList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>

            <!-- Tabla de precios -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <label class="text-sm font-semibold text-gray-700">💰 Tabla de precios por cantidad</label>
                    <button type="button" onclick="pvAgregarRangoPrecio()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:#059669;">+ Agregar rango</button>
                </div>
                <p class="text-xs text-gray-400 mb-2">Si el cliente pide una cantidad que no está exacta, se usa el precio del rango inferior más cercano.</p>
                <div id="pvTablaPreciosList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>

            <!-- SKU -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Código SKU <span class="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" id="pvSku" placeholder="Se genera automáticamente si lo dejas vacío"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm">
            </div>

            <!-- CATEGORÍA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categoría</label>
                <select id="pvCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                    <option value="">Sin categoría</option>
                </select>
            </div>

            <!-- TAGS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🏷️ Tags / Etiquetas</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="pvTagsGrid"></div>
            </div>

            <!-- NOTAS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">📋 Notas internas <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <textarea id="pvNotas" rows="2" placeholder="Especificaciones, materiales, observaciones..."
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
            </div>

            <button type="submit" id="pvSubmitBtn"
                class="w-full py-3 rounded-xl text-white font-bold text-base mt-2"
                style="background:linear-gradient(135deg,#9669c4,#ab84d1);">
                ✅ Guardar Producto Variable
            </button>
        </form>
    </div>`;
    document.body.appendChild(modal);
}
window.injectVariableProductModal = injectVariableProductModal;

function pvFiltrarMP(q) {
    const box = document.getElementById('pvMpSuggestions');
    if (!box) return;
    const mps = (window.products || []).filter(p =>
        p.tipo === 'materia_prima' || p.tipo === 'servicio'
    ).filter(p => !q || (p.name || '').toLowerCase().includes(q.toLowerCase()));
    if (!mps.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML = mps.slice(0, 8).map(p =>
        `<div onclick="pvSeleccionarMP('${p.id}')"
            style="padding:8px 12px;cursor:pointer;font-size:.85rem;border-bottom:1px solid #f3f4f6;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background=''">
            ${_esc(p.name || '')} <span style="color:#9ca3af;font-size:.75rem;">$${Number(p.cost||0).toFixed(2)}/ud</span>
        </div>`
    ).join('');
}
window.pvFiltrarMP = pvFiltrarMP;

function pvSeleccionarMP(id) {
    const mp = (window.products || []).find(p => String(p.id) === String(id));
    if (!mp) return;
    if ((window._pvMpComponentes || []).find(c => String(c.id) === String(id))) {
        manekiToastExport('Ya está agregado', 'warn'); return;
    }
    window._pvMpComponentes.push({ id: mp.id, name: mp.name, qty: 1, costUnit: mp.cost || 0 });
    document.getElementById('pvBuscarMP').value = '';
    document.getElementById('pvMpSuggestions').style.display = 'none';
    pvRenderMpList();
}
window.pvSeleccionarMP = pvSeleccionarMP;

function pvAgregarComponente() {
    const input = document.getElementById('pvBuscarMP');
    if (input) { input.focus(); pvFiltrarMP(input.value || ''); }
}
window.pvAgregarComponente = pvAgregarComponente;

function pvRenderMpList() {
    const list = document.getElementById('pvMpList');
    if (!list) return;
    const comps = window._pvMpComponentes || [];
    if (!comps.length) { list.innerHTML = '<p class="text-xs text-gray-400">Sin componentes aún.</p>'; return; }
    const costoTotal = comps.reduce((s, c) => s + (parseFloat(c.costUnit)||0) * (parseFloat(c.qty)||1), 0);
    list.innerHTML = comps.map((c, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f5f3ff;border-radius:10px;font-size:.82rem;">
            <span style="flex:1;font-weight:600;color:#4c1d95;">${_esc(c.name || '')}</span>
            <span style="color:#9ca3af;">qty:</span>
            <input type="number" min="0.01" step="0.01" value="${c.qty}"
                onchange="pvEditarQtyComp(${i}, this.value)"
                style="width:50px;padding:3px 6px;border:1px solid #ddd6fe;border-radius:6px;text-align:center;font-size:.8rem;">
            <span style="color:#9669c4;font-weight:600;min-width:55px;text-align:right;">$${((parseFloat(c.costUnit)||0)*(parseFloat(c.qty)||1)).toFixed(2)}</span>
            <button onclick="pvQuitarComp(${i})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">✕</button>
        </div>`).join('') +
        `<div style="text-align:right;font-size:.78rem;color:#9669c4;font-weight:700;padding:4px 10px 0;">Costo por hoja: $${costoTotal.toFixed(2)}</div>`;
}
window.pvRenderMpList = pvRenderMpList;

function pvEditarQtyComp(idx, val) {
    if (window._pvMpComponentes[idx]) window._pvMpComponentes[idx].qty = parseFloat(val) || 1;
    pvRenderMpList();
}
window.pvEditarQtyComp = pvEditarQtyComp;

function pvQuitarComp(idx) {
    window._pvMpComponentes.splice(idx, 1);
    pvRenderMpList();
}
window.pvQuitarComp = pvQuitarComp;

function pvAgregarRangoPrecio() {
    if (!window._pvTablaPreciosVariable) window._pvTablaPreciosVariable = [];
    window._pvTablaPreciosVariable.push({ cantidadMin: '', precio: '' });
    pvRenderTablaPreciosList();
}
window.pvAgregarRangoPrecio = pvAgregarRangoPrecio;

function pvRenderTablaPreciosList() {
    const list = document.getElementById('pvTablaPreciosList');
    if (!list) return;
    const tabla = window._pvTablaPreciosVariable || [];
    if (!tabla.length) {
        list.innerHTML = '<p class="text-xs text-gray-400">Sin rangos. Agrega al menos uno.</p>';
        return;
    }
    list.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;margin-bottom:4px;padding:0 4px;">
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Cantidad mínima</span>
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Precio total ($)</span>
            <span style="font-size:.72rem;font-weight:700;color:#0369a1;">$/pieza</span>
            <span></span>
        </div>` +
        tabla.map((r, i) => {
            const unitario = (r.cantidadMin > 0 && r.precio > 0)
                ? (r.precio / r.cantidadMin).toFixed(2)
                : '—';
            return `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
            <input type="number" min="1" placeholder="Ej: 10" value="${r.cantidadMin}"
                onchange="pvEditarRango(${i},'cantidadMin',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-center">
            <input type="number" min="0" step="0.01" placeholder="Ej: 50.00" value="${r.precio}"
                onchange="pvEditarRango(${i},'precio',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none text-center"
                style="color:#059669;font-weight:600;">
            <span style="font-size:.85rem;font-weight:700;color:#0369a1;text-align:center;padding:8px 4px;background:#e0f2fe;border-radius:8px;">$${unitario}</span>
            <button onclick="pvQuitarRango(${i})"
                style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;padding:0 4px;">✕</button>
        </div>`;
        }).join('');
}
window.pvRenderTablaPreciosList = pvRenderTablaPreciosList;

function pvEditarRango(idx, campo, valor) {
    if (window._pvTablaPreciosVariable[idx]) {
        window._pvTablaPreciosVariable[idx][campo] = campo === 'cantidadMin' ? parseInt(valor)||0 : parseFloat(valor)||0;
    }
}
window.pvEditarRango = pvEditarRango;

function pvQuitarRango(idx) {
    window._pvTablaPreciosVariable.splice(idx, 1);
    pvRenderTablaPreciosList();
}
window.pvQuitarRango = pvQuitarRango;

function openVariableProductModal(editId) {
    injectVariableProductModal();
    window._pvMpComponentes = [];
    window._pvTablaPreciosVariable = [];
    window._pvTagsActuales = [];
    window._pvProductImage = null;
    window._pvProductImageFile = null;

    // Configurar listener de imagen
    setTimeout(() => {
        const imgInput = document.getElementById('pvProductImage');
        if (imgInput && !imgInput._mkBound) {
            imgInput._mkBound = true;
            imgInput.addEventListener('change', function(e) {
                const file = e.target.files[0]; if (!file) return;
                window._pvProductImageFile = file;
                const reader = new FileReader();
                reader.onload = ev => {
                    const img = document.getElementById('pvPreviewImg');
                    const pre = document.getElementById('pvImagePreview');
                    if (img) img.src = ev.target.result;
                    if (pre) pre.classList.remove('hidden');
                    window._pvProductImage = ev.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
        poblarCategoriasPv();
        renderTagsPv();
    }, 80);

    if (editId) {
        const p = (window.products || []).find(x => String(x.id) === String(editId));
        if (p) {
            window._pvMpComponentes = (p.mpComponentes || []).map(c => ({...c}));
            window._pvTablaPreciosVariable = (p.tablaPreciosVariable || []).map(r => ({...r}));
            window._pvTagsActuales = [...(p.tags || [])];
            window._pvProductImage = p.imageUrl || null;
            setTimeout(() => {
                const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
                set('pvNombre', p.name);
                set('pvSku', p.sku || '');
                set('pvRendimiento', p.rendimientoPorHoja || '');
                set('pvEditId', editId);
                set('pvNotas', p.notas || '');
                // Categoría
                const catSel = document.getElementById('pvCategory');
                if (catSel && p.category) catSel.value = p.category;
                // Imagen previa
                if (p.imageUrl) {
                    const img = document.getElementById('pvPreviewImg');
                    const pre = document.getElementById('pvImagePreview');
                    if (img) img.src = p.imageUrl;
                    if (pre) pre.classList.remove('hidden');
                }
                pvRenderMpList();
                pvRenderTablaPreciosList();
                renderTagsPv();
                const title = document.querySelector('#pvModal h3');
                if (title) title.textContent = '🎨 Editar Producto Variable';
                const btn = document.getElementById('pvSubmitBtn');
                if (btn) btn.textContent = '💾 Guardar Cambios';
            }, 80);
        }
    } else {
        setTimeout(() => {
            pvRenderMpList();
            pvRenderTablaPreciosList();
        }, 80);
    }
    openModal('pvModal');
}
window.openVariableProductModal = openVariableProductModal;

async function guardarProductoVariable(e) {
    if (e) e.preventDefault();
    const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const nombre = gv('pvNombre').trim();
    const sku = gv('pvSku').trim();
    const rendimiento = parseFloat(gv('pvRendimiento')) || 0;
    const editId = gv('pvEditId');
    const category = gv('pvCategory') || '';
    const notas = gv('pvNotas').trim();
    const tags = [...(window._pvTagsActuales || [])];

    if (!nombre) { manekiToastExport('⚠️ El nombre es requerido', 'warn'); return; }
    const tabla = (window._pvTablaPreciosVariable || []).filter(r => r.cantidadMin > 0 && r.precio > 0);
    if (!tabla.length) { manekiToastExport('⚠️ Agrega al menos un rango de precio', 'warn'); return; }

    // Spinner
    const _btn = document.getElementById('pvSubmitBtn');
    if (_btn) { _btn.disabled = true; _btn.textContent = '⏳ Guardando...'; }
    const _restore = () => { if (_btn) { _btn.disabled = false; _btn.textContent = editId ? '💾 Guardar Cambios' : '✅ Guardar Producto Variable'; } };

    // Subir imagen si hay archivo nuevo
    let imageUrl = window._pvProductImage || '';
    if (window._pvProductImageFile) {
        manekiToastExport('⏳ Subiendo imagen...', 'ok');
        const uploaded = await subirImagenStorage(window._pvProductImageFile).catch(() => null);
        if (uploaded) imageUrl = uploaded;
        window._pvProductImageFile = null;
    }

    // Ordenar tabla por cantidadMin ascendente
    tabla.sort((a, b) => a.cantidadMin - b.cantidadMin);
    const mpComps = (window._pvMpComponentes || []).map(c => ({...c}));
    const costoHoja = mpComps.reduce((s, c) => s + (parseFloat(c.costUnit)||0) * (parseFloat(c.qty)||1), 0);

    const finalSku = sku || ('PV-' + mkId().split('-')[0].toUpperCase());

    if (editId) {
        const idx = (window.products || []).findIndex(x => String(x.id) === String(editId));
        if (idx === -1) { manekiToastExport('Producto no encontrado', 'err'); _restore(); return; }
        window.products[idx] = Object.assign({}, window.products[idx], {
            name: nombre, tipo: 'producto_variable',
            sku: finalSku, rendimientoPorHoja: rendimiento,
            mpComponentes: mpComps, tablaPreciosVariable: tabla,
            cost: costoHoja, price: tabla[tabla.length - 1].precio,
            category, tags, notas,
            imageUrl: imageUrl || window.products[idx].imageUrl || '',
        });
        manekiToastExport('✅ Producto variable actualizado', 'ok');
    } else {
        const np = {
            id: _genId(), name: nombre, tipo: 'producto_variable',
            sku: finalSku, rendimientoPorHoja: rendimiento,
            mpComponentes: mpComps, tablaPreciosVariable: tabla,
            cost: costoHoja, price: tabla[tabla.length - 1].precio,
            stock: 0, image: '🎨', category, tags, notas, imageUrl,
        };
        window.products.unshift(np);
        manekiToastExport('✅ Producto variable creado', 'ok');
    }

    _restore();
    saveProducts();
    renderInventoryTable();
    closeModal('pvModal');
}
window.guardarProductoVariable = guardarProductoVariable;

// Función para obtener precio de un producto variable según cantidad
function pvGetPrecio(product, cantidad) {
    // precio guardado es el TOTAL del rango (ej: 50 pzas = $150 total)
    // devolvemos precio UNITARIO para que el pedido multiplique por cantidad correctamente
    const tabla = (product.tablaPreciosVariable || []).slice().sort((a, b) => a.cantidadMin - b.cantidadMin);
    if (!tabla.length) return 0;
    let rangoElegido = tabla[0];
    for (const rango of tabla) {
        if (cantidad >= rango.cantidadMin) rangoElegido = rango;
        else break;
    }
    const min = rangoElegido.cantidadMin || 1;
    return rangoElegido.precio / min; // precio unitario
}
window.pvGetPrecio = pvGetPrecio;

// ── Mejora 2: Modal de movimientos de stock por producto ──────────────────
function verMovimientosProducto(pid) {
    const prod = (window.products || []).find(p => String(p.id) === String(pid));
    if (!prod) return;
    // FIX-1: migrar campo en runtime para productos heredados sin movimientos
    if (!prod.movimientos) prod.movimientos = [];
    const movs = (prod.movimientos || []).slice(0, 5);

    // Remover modal previo si existe
    const _prev = document.getElementById('_mkMovimientosModal');
    if (_prev) _prev.remove();

    const filas = movs.length ? movs.map(m => {
        const clr = m.delta > 0 ? '#059669' : '#dc2626';
        const bg  = m.delta > 0 ? '#d1fae5' : '#fee2e2';
        const signo = m.delta > 0 ? '+' : '';
        return `<tr>
            <td style="padding:6px 10px;font-size:.8rem;color:#6b7280;">${_esc(m.fecha||'—')}</td>
            <td style="padding:6px 10px;text-align:center;">
                <span style="background:${bg};color:${clr};font-weight:700;padding:2px 10px;border-radius:8px;font-size:.8rem;">${signo}${m.delta}</span>
            </td>
            <td style="padding:6px 10px;text-align:center;font-size:.8rem;font-weight:600;color:#374151;">${m.stockResultante}</td>
            <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${_esc(m.motivo||'—')}</td>
        </tr>`;
    }).join('') : `<tr><td colspan="4" style="padding:14px;text-align:center;font-size:.8rem;color:#9ca3af;">Sin movimientos registrados</td></tr>`;

    const modal = document.createElement('div');
    modal.id = '_mkMovimientosModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);';
    modal.innerHTML = `
    <div style="background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,0.2);max-width:560px;width:95%;padding:24px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <div style="font-size:1.05rem;font-weight:800;color:#1a0533;">📋 Últimos movimientos de stock</div>
                <div style="font-size:.78rem;color:#9ca3af;margin-top:2px;">${_esc(prod.name)}</div>
            </div>
            <button onclick="document.getElementById('_mkMovimientosModal').remove()"
                style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;line-height:1;">×</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:#f9fafb;">
                    <th style="padding:6px 10px;text-align:left;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Fecha</th>
                    <th style="padding:6px 10px;text-align:center;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Cambio</th>
                    <th style="padding:6px 10px;text-align:center;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Stock final</th>
                    <th style="padding:6px 10px;text-align:left;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Motivo</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        ${movs.length === 0 || (prod.movimientos || []).length <= 5 ? '' : `<p style="font-size:.72rem;color:#9ca3af;text-align:center;margin-top:10px;">Mostrando los últimos 5 de ${(prod.movimientos || []).length} movimientos</p>`}
    </div>`;
    document.body.appendChild(modal);
    // Cerrar al hacer clic fuera del panel
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}
window.verMovimientosProducto = verMovimientosProducto;
