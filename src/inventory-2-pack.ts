// ══════════════════════════════════════════════════════════════════════════
// ── MODAL MATERIA PRIMA ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// Tags predefinidos para materia prima
const TAGS_MATERIA_PRIMA = ['Acrílico','Filamento','Tintas','Cuadro','Metales','Empaques','Vasos','Textil','Peluches','Otros'];

// Estado tags materia prima
window._mpTagsActuales = window._mpTagsActuales ?? [];

function openAddMateriaPrimaModal() {
    window.modoEdicion = false; window.edicionProductoId = null;
    window.currentProductImage = null; window.currentProductImageFile = null;
    window._mpTagsActuales = [];

    const form = document.getElementById('mpForm');
    if (form) form.reset();

    // Resetear imagen
    const pre = document.getElementById('mpImagePreview');
    if (pre) pre.classList.add('hidden');

    // Render tags
    renderMpTags();

    const title = document.querySelector('#mpModal h3');
    if (title) title.textContent = '🏭 Nueva Materia Prima';
    const btn = document.getElementById('mpSubmitBtn');
    if (btn) btn.textContent = '✅ Guardar Materia Prima';

    if (typeof openModal === 'function') openModal('mpModal');
}
window.openAddMateriaPrimaModal = openAddMateriaPrimaModal;

// ══════════════════════════════════════════════════════════════════════════
// ── MODAL PACK (conjunto de Productos Terminados) ────────────────────────
// ══════════════════════════════════════════════════════════════════════════

window._packComponentes = window._packComponentes ?? [];

function injectPackModal() {
    const existing = document.getElementById('packModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'packModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(21,4,50,0.2);max-width:640px;width:100%;margin:auto;max-height:94vh;overflow-y:auto;padding:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 id="packModalTitle" style="font-size:1.4rem;font-weight:800;color:#1a0533;">🎁 Nuevo Pack</h3>
            <button onclick="closePackModal()" style="font-size:1.6rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;">×</button>
        </div>

        <form id="packForm" novalidate style="display:flex;flex-direction:column;gap:18px;">

            <!-- NOMBRE -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Nombre del Pack *</label>
                <input type="text" id="packNombre" placeholder="Ej: Pack Boxer + Calcetas"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- PRODUCTOS DEL PACK -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">📦 Productos en el Pack</label>
                    <button type="button" onclick="packAbrirSelectorPT()" class="mk-btn-primary" style="padding:6px 14px;font-size:.8rem;">
                        <i class="fas fa-plus"></i> Agregar producto
                    </button>
                </div>
                <!-- Lista de componentes seleccionados -->
                <div id="packComponentesList" style="display:flex;flex-direction:column;gap:8px;">
                    <p id="packSinComponentes" style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin productos agregados</p>
                </div>
                <!-- Buscador inline de PTs -->
                <div id="packPtSelector" style="display:none;margin-top:12px;border-top:1.5px solid #e5e7eb;padding-top:12px;">
                    <input type="text" id="packPtSearch" placeholder="Buscar producto terminado..."
                        oninput="packFiltrarPT()"
                        style="width:100%;padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;margin-bottom:10px;box-sizing:border-box;">
                    <div id="packPtResults" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
            </div>

            <!-- MATERIAS PRIMAS ADICIONALES -->
            <div style="background:#fafafa;border:1.5px solid #e9d5ff;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">🏭 Materias Primas Adicionales</label>
                    <button type="button" onclick="packAbrirSelectorMP()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#9669c4,#ab84d1);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar MP
                    </button>
                </div>
                <div id="packMpDirectosList" style="display:flex;flex-direction:column;gap:8px;">
                    <p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas adicionales</p>
                </div>
                <div id="packMpSelector" style="display:none;margin-top:12px;border-top:1.5px solid #e5e7eb;padding-top:12px;">
                    <input type="text" id="packMpSearch" placeholder="Buscar materia prima o servicio..."
                        oninput="packFiltrarMP()"
                        style="width:100%;padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;margin-bottom:10px;box-sizing:border-box;">
                    <div id="packMpResults" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
            </div>

            <!-- COSTO TOTAL CALCULADO -->
            <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <div style="font-size:.75rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.04em;">Costo Total del Pack</div>
                    <div style="font-size:1.5rem;font-weight:800;color:#b45309;" id="packCostoDisplay">$0.00</div>
                </div>
                <input type="number" id="packCosto" style="display:none;" step="0.01" min="0" value="0">
            </div>

            <!-- PRECIO DE VENTA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Precio de Venta *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:700;">$</span>
                    <input type="number" id="packPrecio" step="0.01" min="0" placeholder="0.00"
                        oninput="packMostrarMargen()"
                        style="width:100%;padding:12px 16px 12px 28px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div id="packMargenInfo" style="font-size:.8rem;margin-top:6px;min-height:18px;"></div>
                <!-- Sugerir por margen -->
                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                    ${[30,40,50,60].map(m=>`<button type="button" onclick="packAplicarMargen(${m})"
                        style="padding:4px 12px;border:1.5px solid #fde68a;border-radius:8px;background:#fffbeb;color:#92400e;font-size:.78rem;font-weight:700;cursor:pointer;">+${m}%</button>`).join('')}
                </div>
            </div>

            <!-- SKU y CATEGORÍA opcionales -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">SKU (opcional)</label>
                    <input type="text" id="packSku" placeholder="Auto-generado"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">Categoría (opcional)</label>
                    <select id="packCategory"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;background:#fff;">
                        <option value="">Sin categoría</option>
                    </select>
                </div>
            </div>

            <!-- FOTO DEL PACK -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">📷 Foto del Pack (opcional)</label>
                <input type="file" id="packImageInput" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;box-sizing:border-box;cursor:pointer;"
                    onchange="packHandlePhoto(this)">
                <div id="packImagePreview" style="display:none;margin-top:10px;text-align:center;">
                    <img id="packImagePreviewImg" src="" style="max-width:160px;max-height:160px;border-radius:12px;object-fit:cover;border:1.5px solid #e5e7eb;">
                    <button type="button" onclick="packQuitarFoto()" style="display:block;margin:6px auto 0;font-size:.75rem;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:700;">✕ Quitar foto</button>
                </div>
            </div>

            <button type="button" id="packSubmitBtn" onclick="guardarPack()" class="mk-btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:1rem;letter-spacing:.02em;">
                <i class="fas fa-check"></i> Guardar Pack
            </button>
        </form>
    </div>`;
    document.body.appendChild(modal);
}
window.injectPackModal = injectPackModal;

function openPackModal(editId) {
    injectPackModal();
    window._packModoEdicion = false;
    window._packEdicionId = null;
    window._packComponentes = [];
    window._packMpDirectos = [];
    window._packImageFile = null;
    window._packImageUrl = null;

    // Poblar categorías
    const sel = document.getElementById('packCategory');
    if (sel) {
        (window.categories || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id; opt.textContent = `${c.emoji || ''} ${c.name}`;
            sel.appendChild(opt);
        });
    }

    if (editId) {
        const pack = (window.products || []).find(p => String(p.id) === String(editId) && p.tipo === 'pack');
        if (pack) {
            window._packModoEdicion = true;
            window._packEdicionId = editId;
            window._packComponentes = JSON.parse(JSON.stringify(pack.packComponentes || []));
            window._packMpDirectos = JSON.parse(JSON.stringify(pack.packMpDirectos || []));
            document.getElementById('packNombre').value = pack.name || '';
            document.getElementById('packPrecio').value = pack.price || '';
            document.getElementById('packSku').value = pack.sku || '';
            if (sel) sel.value = pack.category || '';
            const title = document.getElementById('packModalTitle');
            if (title) title.textContent = '✏️ Editar Pack';
            const btn = document.getElementById('packSubmitBtn');
            if (btn) btn.textContent = '✅ Actualizar Pack';
            if (pack.imageUrl) {
                window._packImageUrl = pack.imageUrl;
                const prev = document.getElementById('packImagePreview');
                const prevImg = document.getElementById('packImagePreviewImg');
                if (prev) prev.style.display = 'block';
                if (prevImg) prevImg.src = pack.imageUrl;
            }
        }
    }

    packRenderComponentes();
    packRenderMpDirectos();
    packMostrarMargen();
    if (typeof openModal === 'function') openModal('packModal');
}
window.openPackModal = openPackModal;

function closePackModal() {
    if (typeof closeModal === 'function') closeModal('packModal');
}
window.closePackModal = closePackModal;

function packHandlePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    window._packImageFile = file;
    const reader = new FileReader();
    reader.onload = e => {
        const img = document.getElementById('packImagePreviewImg');
        const preview = document.getElementById('packImagePreview');
        if (img) img.src = e.target.result;
        if (preview) preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}
window.packHandlePhoto = packHandlePhoto;

function packQuitarFoto() {
    window._packImageFile = null;
    window._packImageUrl = null;
    const preview = document.getElementById('packImagePreview');
    const input = document.getElementById('packImageInput');
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
}
window.packQuitarFoto = packQuitarFoto;

// ── Selector de PTs para el Pack ──────────────────────────────────────────
function packAbrirSelectorPT() {
    const sel = document.getElementById('packPtSelector');
    if (!sel) return;
    const isOpen = sel.style.display !== 'none';
    sel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
        const inp = document.getElementById('packPtSearch');
        if (inp) { inp.value = ''; inp.focus(); }
        packFiltrarPT();
    }
}
window.packAbrirSelectorPT = packAbrirSelectorPT;

function packFiltrarPT() {
    const q = (document.getElementById('packPtSearch')?.value || '').toLowerCase();
    const yaAgregados = (window._packComponentes || []).map(c => String(c.productoId));
    const pts = (window.products || []).filter(p =>
        (p.tipo === 'producto' || p.tipo === 'producto_interno') &&
        !yaAgregados.includes(String(p.id)) &&
        (!q || (p.name || '').toLowerCase().includes(q))
    );
    const res = document.getElementById('packPtResults');
    if (!res) return;
    if (!pts.length) {
        res.innerHTML = `<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>`;
        return;
    }
    res.innerHTML = pts.map(p => {
        const img = p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${_esc(p.name||'')}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`
            : `<span style="font-size:1.2rem;">${p.image || '📦'}</span>`;
        return `<div onclick="packSeleccionarPT('${String(p.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='#fff'">
            ${img}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(p.name)}</div>
                <div style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(p.cost||0).toFixed(2)}</div>
            </div>
            <span style="font-size:11px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`;
    }).join('');
}
window.packFiltrarPT = packFiltrarPT;

function packSeleccionarPT(productoId) {
    const pt = (window.products || []).find(p => String(p.id) === String(productoId));
    if (!pt) return;
    window._packComponentes = window._packComponentes || [];
    if (window._packComponentes.find(c => String(c.productoId) === String(productoId))) return;
    window._packComponentes.push({
        productoId: String(productoId),
        nombre: pt.name,
        costoOriginal: Number(pt.cost) || 0,
        costoCustom: Number(pt.cost) || 0,
        qty: 1
    });
    // Cerrar selector
    const sel = document.getElementById('packPtSelector');
    if (sel) sel.style.display = 'none';
    packRenderComponentes();
}
window.packSeleccionarPT = packSeleccionarPT;

function packQuitarComponente(productoId) {
    window._packComponentes = (window._packComponentes || []).filter(c => String(c.productoId) !== String(productoId));
    packRenderComponentes();
}
window.packQuitarComponente = packQuitarComponente;

function packActualizarCosto(productoId, valor) {
    const comp = (window._packComponentes || []).find(c => String(c.productoId) === String(productoId));
    if (comp) comp.costoCustom = parseFloat(valor) || 0;
    packRecalcularCosto();
    packMostrarMargen();
}
window.packActualizarCosto = packActualizarCosto;

function packActualizarQty(productoId, valor) {
    const comp = (window._packComponentes || []).find(c => String(c.productoId) === String(productoId));
    if (comp) comp.qty = Math.max(1, parseInt(valor) || 1);
    packRenderComponentes();
}
window.packActualizarQty = packActualizarQty;

function packRenderComponentes() {
    const lista = document.getElementById('packComponentesList');
    const sinMsg = document.getElementById('packSinComponentes');
    if (!lista) return;
    const comps = window._packComponentes || [];
    if (!comps.length) {
        lista.innerHTML = `<p id="packSinComponentes" style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin productos agregados</p>`;
        packRecalcularCosto();
        return;
    }
    lista.innerHTML = comps.map(c => {
        const pt = (window.products || []).find(p => String(p.id) === String(c.productoId));
        const img = pt?.imageUrl
            ? `<img src="${pt.imageUrl}" alt="${_esc(pt?.name||'')}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`
            : `<span style="font-size:1.3rem;">${pt?.image || '📦'}</span>`;
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:12px;background:#fff;">
            ${img}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(c.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(c.costoOriginal).toFixed(2)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="1" value="${c.qty}"
                        onchange="packActualizarQty('${c.productoId}', this.value)"
                        style="width:46px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(c.costoCustom).toFixed(2)}"
                            onchange="packActualizarCosto('${c.productoId}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #fde68a;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#fde68a'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarComponente('${c.productoId}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">×</button>
            </div>
        </div>`;
    }).join('');
    packRecalcularCosto();
}
window.packRenderComponentes = packRenderComponentes;

// ── Selector de Materias Primas directas para el Pack ─────────────────────
function packAbrirSelectorMP() {
    const sel = document.getElementById('packMpSelector');
    if (!sel) return;
    const isOpen = sel.style.display !== 'none';
    sel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
        const inp = document.getElementById('packMpSearch');
        if (inp) { inp.value = ''; inp.focus(); }
        packFiltrarMP();
    }
}
window.packAbrirSelectorMP = packAbrirSelectorMP;

function packFiltrarMP() {
    const q = (document.getElementById('packMpSearch')?.value || '').toLowerCase();
    const yaAgregados = (window._packMpDirectos || []).map(m => String(m.id));
    const mps = (window.products || []).filter(p =>
        (p.tipo === 'materia_prima' || p.tipo === 'servicio') &&
        !yaAgregados.includes(String(p.id)) &&
        (!q || (p.name || '').toLowerCase().includes(q))
    );
    const res = document.getElementById('packMpResults');
    if (!res) return;
    if (!mps.length) {
        res.innerHTML = `<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>`;
        return;
    }
    res.innerHTML = mps.map(p => {
        const img = p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${_esc(p.name||'')}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`
            : `<span style="font-size:1.2rem;">${p.image || '🏭'}</span>`;
        const tipoBadge = p.tipo === 'servicio'
            ? `<span style="font-size:10px;background:#f6ecff;color:#7d4fa3;padding:1px 6px;border-radius:99px;">Servicio</span>`
            : `<span style="font-size:10px;background:#f0fdf4;color:#15803d;padding:1px 6px;border-radius:99px;">MP</span>`;
        return `<div onclick="packSeleccionarMP('${String(p.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#fff'">
            ${img}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(p.name)}</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">${tipoBadge}<span style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(p.cost||0).toFixed(2)} / ${_esc(p.unidad||'pza')}</span></div>
            </div>
            <span style="font-size:11px;background:#f6ecff;color:#7d4fa3;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`;
    }).join('');
}
window.packFiltrarMP = packFiltrarMP;

function packSeleccionarMP(mpId) {
    const mp = (window.products || []).find(p => String(p.id) === String(mpId));
    if (!mp) return;
    window._packMpDirectos = window._packMpDirectos || [];
    if (window._packMpDirectos.find(m => String(m.id) === String(mpId))) return;
    window._packMpDirectos.push({
        id: String(mpId),
        nombre: mp.name,
        imagen: mp.image || '🏭',
        imageUrl: mp.imageUrl || null,
        unidad: mp.unidad || 'pza',
        costoOriginal: Number(mp.cost) || 0,
        costoCustom: Number(mp.cost) || 0,
        qty: 1
    });
    const sel = document.getElementById('packMpSelector');
    if (sel) sel.style.display = 'none';
    packRenderMpDirectos();
}
window.packSeleccionarMP = packSeleccionarMP;

function packQuitarMP(mpId) {
    window._packMpDirectos = (window._packMpDirectos || []).filter(m => String(m.id) !== String(mpId));
    packRenderMpDirectos();
}
window.packQuitarMP = packQuitarMP;

function packActualizarCostoMP(mpId, valor) {
    const mp = (window._packMpDirectos || []).find(m => String(m.id) === String(mpId));
    if (mp) mp.costoCustom = parseFloat(valor) || 0;
    packRecalcularCosto();
    packMostrarMargen();
}
window.packActualizarCostoMP = packActualizarCostoMP;

function packActualizarQtyMP(mpId, valor) {
    const mp = (window._packMpDirectos || []).find(m => String(m.id) === String(mpId));
    if (mp) mp.qty = Math.max(0.001, parseFloat(valor) || 1);
    packRenderMpDirectos();
}
window.packActualizarQtyMP = packActualizarQtyMP;

function packRenderMpDirectos() {
    const lista = document.getElementById('packMpDirectosList');
    if (!lista) return;
    const mps = window._packMpDirectos || [];
    if (!mps.length) {
        lista.innerHTML = `<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas adicionales</p>`;
        packRecalcularCosto();
        return;
    }
    lista.innerHTML = mps.map(m => {
        const img = m.imageUrl
            ? `<img src="${m.imageUrl}" alt="${_esc(m.name||m.nombre||'')}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`
            : `<span style="font-size:1.3rem;">${m.imagen || '🏭'}</span>`;
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e9d5ff;border-radius:12px;background:#faf5ff;">
            ${img}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(m.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(m.costoOriginal).toFixed(2)} / ${_esc(m.unidad||'pza')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="0.001" step="0.001" value="${m.qty}"
                        onchange="packActualizarQtyMP('${m.id}', this.value)"
                        style="width:54px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#9669c4'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(m.costoCustom).toFixed(2)}"
                            onchange="packActualizarCostoMP('${m.id}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #dfbfff;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#9669c4'" onblur="this.style.borderColor='#dfbfff'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarMP('${m.id}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">×</button>
            </div>
        </div>`;
    }).join('');
    packRecalcularCosto();
}
window.packRenderMpDirectos = packRenderMpDirectos;

function packRecalcularCosto() {
    const comps = window._packComponentes || [];
    const mps   = window._packMpDirectos || [];
    const totalPTs = comps.reduce((sum, c) => sum + (Number(c.costoCustom) || 0) * (Number(c.qty) || 1), 0);
    const totalMPs = mps.reduce((sum, m) => sum + (Number(m.costoCustom) || 0) * (Number(m.qty) || 1), 0);
    const total = totalPTs + totalMPs;
    const display = document.getElementById('packCostoDisplay');
    const hidden  = document.getElementById('packCosto');
    if (display) display.textContent = `$${total.toFixed(2)}`;
    if (hidden)  hidden.value = total.toFixed(2);
    packMostrarMargen();
}
window.packRecalcularCosto = packRecalcularCosto;

function packMostrarMargen() {
    const costo  = parseFloat(document.getElementById('packCosto')?.value || 0) || 0;
    const precio = parseFloat(document.getElementById('packPrecio')?.value || 0) || 0;
    const info   = document.getElementById('packMargenInfo');
    if (!info) return;
    if (!costo || !precio) { info.textContent = ''; return; }
    const margen = ((precio - costo) / precio * 100).toFixed(1);
    const ganancia = (precio - costo).toFixed(2);
    const color = parseFloat(margen) >= 40 ? '#059669' : parseFloat(margen) >= 20 ? '#d97706' : '#ef4444';
    info.innerHTML = `<span style="color:${color};font-weight:700;">${margen}% de margen</span> · Ganancia: <b style="color:${color};">$${ganancia}</b>`;
}
window.packMostrarMargen = packMostrarMargen;

function packAplicarMargen(pct) {
    const costo = parseFloat(document.getElementById('packCosto')?.value || 0) || 0;
    if (!costo) { manekiToastExport('⚠️ Define los componentes primero', 'warn'); return; }
    const precio = costo * (1 + pct / 100);
    const inp = document.getElementById('packPrecio');
    if (inp) { inp.value = precio.toFixed(2); packMostrarMargen(); }
}
window.packAplicarMargen = packAplicarMargen;

// ── Aplanar mpComponentes de todos los PTs + MPs directas del pack ─────────
function flattenPackMpComponentes(packComponentes, packMpDirectos) {
    const mpMap = {};
    // 1. MPs heredadas de cada PT componente
    (packComponentes || []).forEach(pc => {
        const pt = (window.products || []).find(p => String(p.id) === String(pc.productoId));
        if (!pt || !pt.mpComponentes || !pt.mpComponentes.length) return;
        pt.mpComponentes.forEach(comp => {
            const key = String(comp.id);
            const totalQty = (comp.qty || 0) * (pc.qty || 1);
            if (mpMap[key]) {
                mpMap[key] = { ...mpMap[key], qty: mpMap[key].qty + totalQty };
            } else {
                mpMap[key] = { ...comp, qty: totalQty };
            }
        });
    });
    // 2. MPs directas agregadas al pack
    (packMpDirectos || []).forEach(mp => {
        const key = String(mp.id);
        const totalQty = (mp.qty || 1);
        if (mpMap[key]) {
            mpMap[key] = { ...mpMap[key], qty: mpMap[key].qty + totalQty };
        } else {
            mpMap[key] = { id: mp.id, nombre: mp.nombre, imagen: mp.imagen, imageUrl: mp.imageUrl || null, qty: totalQty, costUnit: mp.costoCustom || mp.costoOriginal || 0 };
        }
    });
    return Object.values(mpMap);
}
window.flattenPackMpComponentes = flattenPackMpComponentes;

// ── Guardar Pack ──────────────────────────────────────────────────────────
async function guardarPack() {
    const nombre  = (document.getElementById('packNombre')?.value || '').trim();
    const precio  = parseFloat(document.getElementById('packPrecio')?.value || 0) || 0;
    const costo   = parseFloat(document.getElementById('packCosto')?.value || 0) || 0;
    const sku     = (document.getElementById('packSku')?.value || '').trim();
    const catId   = document.getElementById('packCategory')?.value || '';
    const comps   = window._packComponentes || [];
    const mpDirs  = window._packMpDirectos || [];

    if (!nombre) { manekiToastExport('⚠️ El nombre es requerido', 'warn'); document.getElementById('packNombre')?.focus(); return; }
    if ((comps.length + mpDirs.length) < 2) { manekiToastExport('⚠️ Un pack necesita al menos 2 componentes en total', 'warn'); return; }
    if (!precio || precio <= 0) { manekiToastExport('⚠️ El precio de venta debe ser mayor a $0', 'warn'); document.getElementById('packPrecio')?.focus(); return; }
    if (precio <= costo) { manekiToastExport('⚠️ El precio debe ser mayor al costo', 'warn'); document.getElementById('packPrecio')?.focus(); return; }

    const excludeId = window._packModoEdicion ? window._packEdicionId : null;
    const nombreDup = (window.products || []).find(p =>
        (p.name || '').trim().toLowerCase() === nombre.toLowerCase() && String(p.id) !== String(excludeId)
    );
    if (nombreDup) { manekiToastExport(`⚠️ Ya existe un producto llamado "${nombreDup.name}"`, 'warn'); return; }
    if (sku && !skuEsUnico(sku, excludeId)) { manekiToastExport(`⚠️ El SKU "${sku}" ya está en uso`, 'warn'); return; }

    const btn = document.getElementById('packSubmitBtn');
    if (btn) btn.disabled = true;

    try {
        // Subir imagen si hay una nueva seleccionada
        let packImageUrl = window._packImageUrl || null;
        if (window._packImageFile) {
            manekiToastExport('⏳ Subiendo imagen...', 'ok');
            const uploaded = await subirImagenStorage(window._packImageFile).catch(() => null);
            if (uploaded) { packImageUrl = uploaded; }
            window._packImageFile = null;
        }

        const finalSku     = sku || generateSKU(catId);
        const cat          = (window.categories || []).find(c => c.id === catId);
        const mpComponentes = flattenPackMpComponentes(comps, mpDirs);

        if (window._packModoEdicion && window._packEdicionId) {
            const idx = (window.products || []).findIndex(x => String(x.id) === String(window._packEdicionId));
            if (idx === -1) { manekiToastExport('Error: pack no encontrado', 'err'); return; }
            const anterior = window.products[idx];
            const historial = anterior.historialPrecios || [];
            if (anterior.price !== precio || anterior.cost !== costo) {
                historial.push({ fecha: new Date().toISOString(), precioAntes: anterior.price, costoAntes: anterior.cost, precioNuevo: precio, costoNuevo: costo });
            }
            window.products[idx] = Object.assign({}, anterior, {
                name: nombre, price: precio, cost: costo, sku: finalSku,
                category: catId, image: cat ? cat.emoji : '🎁',
                imageUrl: packImageUrl,
                tipo: 'pack', packComponentes: JSON.parse(JSON.stringify(comps)),
                packMpDirectos: JSON.parse(JSON.stringify(mpDirs)),
                mpComponentes, historialPrecios: historial
            });
            saveProducts(); renderInventoryTable();
                    if (typeof updateDashboard === 'function') updateDashboard();
            closePackModal();
            if (window.MKS) MKS.notify();
            manekiToastExport('✅ Pack actualizado', 'ok');
        } else {
            const np = {
                id: _genId(), name: nombre, tipo: 'pack',
                price: precio, cost: costo, stock: 0, stockMin: 2,
                sku: finalSku, category: catId,
                image: cat ? cat.emoji : '🎁', imageUrl: packImageUrl, imageUrls: [],
                tags: [], variants: [], publicarTienda: false,
                packComponentes: JSON.parse(JSON.stringify(comps)),
                packMpDirectos: JSON.parse(JSON.stringify(mpDirs)),
                mpComponentes, historialPrecios: []
            };
            window.products.push(np);
            saveProducts(); renderInventoryTable();
                    if (typeof updateDashboard === 'function') updateDashboard();
            closePackModal();
            if (window.MKS) MKS.notify();
            manekiToastExport('✅ Pack creado exitosamente', 'ok');
        }
    } finally {
        if (btn) btn.disabled = false;
    }
}
window.guardarPack = guardarPack;
