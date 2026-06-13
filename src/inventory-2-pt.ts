function injectPtModal() {
    // Destruir y recrear siempre para que los cambios de código se reflejen
    const existing = document.getElementById('ptModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'ptModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(21,4,50,0.2);max-width:680px;width:100%;margin:auto;max-height:94vh;overflow-y:auto;padding:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 style="font-size:1.4rem;font-weight:800;color:#1a0533;">📦 Nuevo Producto Terminado</h3>
            <button onclick="closePtModal()" style="font-size:1.6rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;">×</button>
        </div>

        <form id="ptForm" class="space-y-5" onsubmit="return false;">

            <!-- IMAGEN -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">📷 Imagen del Producto</label>
                <input type="file" id="ptProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;">
                <div id="ptImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="ptPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- GALERÍA DE FOTOS -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">🖼️ Galería de fotos <span style="font-weight:400;color:#9ca3af;">(hasta 20)</span></label>
                    <label style="padding:6px 14px;background:#C5973B;color:#fff;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar fotos
                        <input type="file" id="ptGaleriaInput" accept="image/*" multiple style="display:none;" onchange="ptAgregarFotosGaleria(this.files)">
                    </label>
                </div>
                <div id="ptGaleriaPreview" style="display:flex;flex-wrap:wrap;gap:8px;min-height:48px;">
                    <p id="ptGaleriaVacia" style="font-size:.8rem;color:#9ca3af;width:100%;text-align:center;padding:8px 0;">Sin fotos en galería</p>
                </div>
            </div>

            <!-- NOMBRE -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Nombre del Producto *</label>
                <input type="text" id="ptNombre" required placeholder="Ej: Playera Personalizada"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- MATERIAS PRIMAS Y SERVICIOS QUE LO CONFORMAN -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">🏭 Materias Primas y Servicios</label>
                    <button type="button" onclick="abrirSelectorMpPt()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar componente
                    </button>
                </div>
                <div id="ptMpList" style="display:flex;flex-direction:column;gap:8px;">
                    <p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin componentes agregados</p>
                </div>
                <!-- Selector inline de MP y Servicios -->
                <div id="ptMpSelector" style="display:none;margin-top:12px;border-top:1.5px solid #e5e7eb;padding-top:12px;">
                    <input type="text" id="ptMpSearch" placeholder="Buscar materia prima o servicio..."
                        oninput="filtrarMpSelector()"
                        style="width:100%;padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;margin-bottom:10px;box-sizing:border-box;">
                    <div id="ptMpResults" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
                <!-- Disponibilidad estimada -->
                <div id="ptDisponibilidadBox" style="display:none;margin-top:12px;background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:10px;padding:10px 14px;">
                    <div style="font-size:.78rem;font-weight:700;color:#065f46;">📊 Piezas que puedes fabricar ahora:</div>
                    <div id="ptDisponibilidadNum" style="font-size:1.6rem;font-weight:800;color:#059669;line-height:1.2;">0</div>
                    <div id="ptDisponibilidadDetalle" style="font-size:.72rem;color:#6b7280;margin-top:4px;"></div>
                </div>
            </div>

            <!-- SKU -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Código SKU</label>
                <input type="text" id="ptSku" placeholder="Se generará automáticamente si está vacío"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- CATEGORÍA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categoría</label>
                <select id="ptCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                </select>
            </div>

            <!-- VARIANTES -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:12px;">🎨 Variantes (Opcional)</label>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;">
                    <input type="text" id="ptVarTipo" placeholder="Tipo: Talla, Color..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                    <input type="text" id="ptVarValor" placeholder="Valor: M, Rojo..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVariantePt();}">
                    <button type="button" onclick="agregarVariantePt()"
                        style="padding:10px 14px;background:#C5973B;color:#fff;border:none;border-radius:10px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
                </div>
                <div id="ptVariantsList" style="display:flex;flex-direction:column;gap:6px;">
                    <p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>
                </div>
            </div>

            <!-- TAGS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🏷️ Tags / Etiquetas</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="ptTagsGrid"></div>
            </div>

            <!-- COSTO y MARGEN -->
            <div style="background:linear-gradient(135deg,#fffbeb,#fef9f0);border:1.5px solid #fde68a;border-radius:14px;padding:16px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">💰 Costo total</label>
                        <div style="position:relative;">
                            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                            <input type="number" id="ptCosto" step="0.01" min="0" value="0"
                                oninput="ptActualizarPrecioSugerido()"
                                style="width:100%;padding:10px 14px 10px 28px;border:1.5px solid #fde68a;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;font-weight:700;">
                        </div>
                        <p id="ptCostoDesglose" style="font-size:.72rem;color:#92400e;margin-top:4px;line-height:1.4;"></p>
                    </div>
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">💡 Margen sugerido</label>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                            ${[30,50,100,150].map(m=>`<button type="button" onclick="ptAplicarMargen(${m})"
                                style="padding:5px 10px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;border:1.5px solid #fde68a;background:#fff;color:#92400e;transition:all .15s;"
                                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fff'">${m}%</button>`).join('')}
                        </div>
                        <div style="display:flex;gap:6px;">
                            <input type="number" id="ptMargenCustom" placeholder="%" min="0" max="999"
                                style="width:70px;padding:6px 10px;border:1.5px solid #fde68a;border-radius:8px;font-size:.85rem;outline:none;">
                            <button type="button" onclick="ptAplicarMargenCustom()"
                                style="padding:6px 12px;background:#C5973B;color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PRECIO DE VENTA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🏷️ Precio de Venta *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                    <input type="number" id="ptPrecio" required step="0.01" min="0"
                        style="width:100%;padding:12px 16px 12px 28px;border:2px solid #C5973B;border-radius:12px;font-size:1.1rem;font-weight:700;outline:none;box-sizing:border-box;color:#1a0533;"
                        onfocus="this.style.borderColor='#E8B84B'" onblur="this.style.borderColor='#C5973B'">
                </div>
                <div id="ptMargenInfo" style="font-size:.78rem;color:#6b7280;margin-top:6px;"></div>
            </div>

            <!-- RENDIMIENTO POR HOJA (stickers, etc.) -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🎯 Piezas por hoja / unidad de MP <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <input type="number" id="ptRendimientoPorHoja" min="1" placeholder="Ej: 12 (stickers que caben en 1 hoja)"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                <p style="font-size:.72rem;color:#9ca3af;margin-top:5px;">Si vendes por cantidad (ej. 100 stickers), el sistema divide entre este número para calcular cuántas hojas descontar del inventario y calcular el costo.</p>
            </div>

            <!-- STOCK MÍNIMO -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🔔 Stock mínimo de alerta</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="number" id="ptStockMin" min="0" step="1" value="5"
                        style="width:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                    <span style="font-size:.8rem;color:#6b7280;">Se te notificará cuando el stock baje de este número</span>
                </div>
            </div>

            <!-- PUBLICAR EN TIENDA -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1.5px solid #6ee7b7;border-radius:14px;">
                <div>
                    <div style="font-size:.9rem;font-weight:700;color:#065f46;">🌐 Publicar en tienda online</div>
                    <div style="font-size:.75rem;color:#6b7280;margin-top:2px;">Visible en manekistore.com.mx</div>
                </div>
                <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer;">
                    <input type="checkbox" id="ptPublicarTienda" style="opacity:0;width:0;height:0;">
                    <span style="position:absolute;inset:0;background:#d1d5db;border-radius:99px;transition:background .2s;"
                        id="ptToggleTrack"></span>
                    <span style="position:absolute;top:3px;left:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);"
                        id="ptToggleThumb"></span>
                </label>
            </div>

            <button type="button" id="ptSubmitBtn" onclick="guardarProductoTerminado()"
                style="width:100%;padding:16px;background:linear-gradient(135deg,#C5973B,#E8B84B);color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:8px;letter-spacing:.02em;">
                ✅ Agregar Producto
            </button>
        </form>
    </div>`;
    document.body.appendChild(modal);

    // Setup imagen
    setTimeout(() => {
        const imgInput = document.getElementById('ptProductImage');
        if (imgInput && !imgInput._mkBound) {
            imgInput._mkBound = true;
            imgInput.addEventListener('change', function(e) {
                const file = e.target.files[0]; if (!file) return;
                window.currentProductImageFile = file;
                const reader = new FileReader();
                reader.onload = ev => {
                    const img = document.getElementById('ptPreviewImg');
                    const pre = document.getElementById('ptImagePreview');
                    if (img) img.src = ev.target.result;
                    if (pre) pre.classList.remove('hidden');
                    window.currentProductImage = ev.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
        // Toggle visual "Publicar en tienda"
        const ptChk = document.getElementById('ptPublicarTienda');
        const ptTrack = document.getElementById('ptToggleTrack');
        const ptThumb = document.getElementById('ptToggleThumb');
        if (ptChk && ptTrack && ptThumb) {
            const syncToggle = () => {
                ptTrack.style.background = ptChk.checked ? '#10b981' : '#d1d5db';
                ptThumb.style.transform  = ptChk.checked ? 'translateX(22px)' : 'translateX(0)';
            };
            ptChk.addEventListener('change', syncToggle);
            syncToggle();
        }
        // Poblar categorías
        poblarCategoriasPt();
        // Render tags iniciales
        renderTagsPt();
        // Update precio cuando cambia costo
        const precioInput = document.getElementById('ptPrecio');
        if (precioInput) precioInput.addEventListener('input', () => ptMostrarMargenInfo());

        // ── Inyectar campos de proveedor si no existen aún ──────────────────
        if (!document.getElementById('ptProveedorNombre')) {
            const ptSubmitBtn = document.getElementById('ptSubmitBtn');
            if (ptSubmitBtn) {
                ptSubmitBtn.insertAdjacentHTML('beforebegin', `
                <div id="ptProveedorSection" style="background:#f0fdf4;border:1.5px solid #6ee7b7;border-radius:14px;padding:16px;">
                    <div style="font-size:.85rem;font-weight:700;color:#065f46;margin-bottom:12px;">🏭 Información del Proveedor <span style="font-weight:400;color:#9ca3af;">(opcional)</span></div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <input type="text" id="ptProveedorNombre" placeholder="Nombre del proveedor"
                            style="width:100%;padding:10px 14px;border:1.5px solid #6ee7b7;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;background:#fff;"
                            onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#6ee7b7'">
                        <textarea id="ptProveedorNotas" rows="2" placeholder="Notas del proveedor (precio referencia, condiciones, etc.)"
                            style="width:100%;padding:10px 14px;border:1.5px solid #6ee7b7;border-radius:10px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;background:#fff;"
                            onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#6ee7b7'"></textarea>
                    </div>
                </div>`);
            }
        }
    }, 80);
}
window.injectPtModal = injectPtModal;

function poblarCategoriasPt() {
    const sel = document.getElementById('ptCategory');
    if (!sel) return;
    const cats = window.categories || [];
    sel.innerHTML = cats.map(c => `<option value="${_esc(c.id)}">${c.emoji||''} ${_esc(c.name)}</option>`).join('');
}
window.poblarCategoriasPt = poblarCategoriasPt;

// ── Tags PT ────────────────────────────────────────────────────────────────
function renderTagsPt() {
    const grid = document.getElementById('ptTagsGrid');
    if (!grid) return;
    grid.innerHTML = TAGS_PT.map(tag => {
        const active = (window._ptTagsActuales||[]).includes(tag);
        return `<button type="button" onclick="toggleTagPt('${tag}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${active?'#C5973B':'#e5e7eb'};background:${active?'#FFF9F0':'#fff'};color:${active?'#92400e':'#6b7280'};">
            ${tag}</button>`;
    }).join('');
}
window.renderTagsPt = renderTagsPt;

function toggleTagPt(tag) {
    window._ptTagsActuales = window._ptTagsActuales || [];
    const i = window._ptTagsActuales.indexOf(tag);
    if (i>-1) window._ptTagsActuales.splice(i,1); else window._ptTagsActuales.push(tag);
    renderTagsPt();
}
window.toggleTagPt = toggleTagPt;

// ── Helpers PV: categorías y tags ──────────────────────────────────────────
function poblarCategoriasPv() {
    const sel = document.getElementById('pvCategory');
    if (!sel) return;
    const cats = window.categories || [];
    const optsCats = cats.map(c => `<option value="${_esc(c.id)}">${c.emoji||''} ${_esc(c.name)}</option>`).join('');
    sel.innerHTML = '<option value="">Sin categoría</option>' + optsCats;
}
window.poblarCategoriasPv = poblarCategoriasPv;

function renderTagsPv() {
    const grid = document.getElementById('pvTagsGrid');
    if (!grid) return;
    grid.innerHTML = TAGS_PT.map(tag => {
        const active = (window._pvTagsActuales||[]).includes(tag);
        return `<button type="button" onclick="toggleTagPv('${tag}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${active?'#7c3aed':'#e5e7eb'};background:${active?'#f5f3ff':'#fff'};color:${active?'#7c3aed':'#6b7280'};">
            ${tag}</button>`;
    }).join('');
}
window.renderTagsPv = renderTagsPv;

function toggleTagPv(tag) {
    window._pvTagsActuales = window._pvTagsActuales || [];
    const i = window._pvTagsActuales.indexOf(tag);
    if (i > -1) window._pvTagsActuales.splice(i, 1); else window._pvTagsActuales.push(tag);
    renderTagsPv();
}
window.toggleTagPv = toggleTagPv;

// ── Variantes PT ───────────────────────────────────────────────────────────
function agregarVariantePt() {
    const tipo  = (document.getElementById('ptVarTipo')?.value||'').trim();
    const valor = (document.getElementById('ptVarValor')?.value||'').trim();
    if (!tipo||!valor) { manekiToastExport('⚠️ Ingresa tipo y valor de la variante','warn'); return; }
    window._ptVariants = window._ptVariants||[];
    const existe = window._ptVariants.some(v => v.type === tipo && v.value === valor);
    if (existe) {
        manekiToastExport(`⚠️ La variante ${tipo}: ${valor} ya existe`, 'warn');
        return;
    }
    window._ptVariants.push({type:tipo, value:valor, qty:0});
    if (document.getElementById('ptVarTipo'))  document.getElementById('ptVarTipo').value='';
    if (document.getElementById('ptVarValor')) document.getElementById('ptVarValor').value='';
    renderVariantsListPt();
    document.getElementById('ptVarTipo')?.focus();
}
window.agregarVariantePt = agregarVariantePt;

function eliminarVariantePt(idx) {
    (window._ptVariants||[]).splice(idx,1);
    renderVariantsListPt();
}
window.eliminarVariantePt = eliminarVariantePt;

function updateVariantQtyPt(idx, val) {
    if (window._ptVariants && window._ptVariants[idx]) {
        window._ptVariants[idx].qty = Math.max(0, parseInt(val)||0);
    }
}
window.updateVariantQtyPt = updateVariantQtyPt;

function renderVariantsListPt() {
    window.currentVariants = window._ptVariants || [];
    const el = document.getElementById('ptVariantsList');
    if (!el) return;
    if (!window._ptVariants||!window._ptVariants.length) {
        el.innerHTML='<p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>'; return;
    }
    el.innerHTML = window._ptVariants.map((v,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;">
            <span style="flex:1;font-size:.85rem;color:#374151;">${_esc(v.type)}: ${_mkColorDot(v.type,_esc(v.value))}</span>
            <div style="display:flex;align-items:center;gap:4px;">
                <button type="button" onclick="updateVariantQtyPt(${i},${(v.qty||0)-1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">−</button>
                <input type="number" value="${v.qty||0}" min="0" onchange="updateVariantQtyPt(${i},this.value)"
                    style="width:46px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVariantQtyPt(${i},${(v.qty||0)+1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="eliminarVariantePt(${i})"
                style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>`).join('');
}
window.renderVariantsListPt = renderVariantsListPt;

// ── Selector de Materia Prima ──────────────────────────────────────────────
function abrirSelectorMpPt() {
    const box = document.getElementById('ptMpSelector');
    if (!box) return;
    box.style.display = box.style.display==='none'?'block':'none';
    if (box.style.display==='block') { filtrarMpSelector(); document.getElementById('ptMpSearch')?.focus(); }
}
window.abrirSelectorMpPt = abrirSelectorMpPt;

function filtrarMpSelector() {
    const q = (document.getElementById('ptMpSearch')?.value||'').toLowerCase();
    const componentes = (window.products||[]).filter(p => p.tipo==='materia_prima' || p.tipo==='servicio');
    const res = document.getElementById('ptMpResults');
    if (!res) return;
    const lista = q ? componentes.filter(p=>(p.name||'').toLowerCase().includes(q)) : componentes;
    if (!lista.length) { res.innerHTML='<p style="font-size:.8rem;color:#9ca3af;padding:8px;">No hay materias primas ni servicios registrados</p>'; return; }
    res.innerHTML = lista.map(p => {
        const yaAgregado = (window._ptMpComponentes||[]).some(c=>String(c.id)===String(p.id));
        const esSvc = p.tipo === 'servicio';
        const imgH = p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${_esc(p.name||'')}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;">`
            : `<span style="font-size:1.4rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${p.image||(esSvc?'⚙️':'🏭')}</span>`;
        const infoExtra = esSvc
            ? `<div style="font-size:.72rem;color:#6d28d9;font-weight:600;">⚙️ Servicio · $${Number(p.cost||0).toFixed(2)}/uso</div>`
            : `<div style="font-size:.72rem;color:#6b7280;">Stock: ${p.stock||0} · Costo: $${Number(p.cost||0).toFixed(2)}</div>`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${yaAgregado?'#f0fdf4':'#fff'};border:1.5px solid ${yaAgregado?'#6ee7b7':'#e5e7eb'};cursor:pointer;transition:all .1s;"
            onclick="seleccionarMpPt('${String(p.id).replace(/'/g,"\\'")}')">
            ${imgH}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(p.name)}</div>
                ${infoExtra}
            </div>
            <span style="font-size:.78rem;font-weight:700;color:${yaAgregado?'#059669':'#7c3aed'};">${yaAgregado?'✓ Agregado':'+ Agregar'}</span>
        </div>`;
    }).join('');
}
window.filtrarMpSelector = filtrarMpSelector;

function seleccionarMpPt(id) {
    const mp = (window.products||[]).find(p=>String(p.id)===String(id)&&(p.tipo==='materia_prima'||p.tipo==='servicio'));
    if (!mp) return;
    window._ptMpComponentes = window._ptMpComponentes||[];
    const existe = window._ptMpComponentes.find(c=>String(c.id)===String(id));
    if (existe) { manekiToastExport(`"${mp.name}" ya fue agregado`,'warn'); return; }
    window._ptMpComponentes.push({ id:mp.id, nombre:mp.name, imageUrl:mp.imageUrl||null, imagen:mp.image||'🏭', qty:1, costUnit:Number(mp.cost||0) });

    // Auto-importar variantes de la MP al PT para poder elegirlas al crear pedidos
    if (Array.isArray(mp.variants) && mp.variants.length > 0) {
        window._ptVariants = window._ptVariants || [];
        let importadas = 0;
        mp.variants.forEach(v => {
            const varType  = v.type  || v.tipo  || '';
            const varValue = v.value || v.valor || '';
            if (!varType || !varValue) return;
            const yaExiste = window._ptVariants.some(pv =>
                (pv.type || pv.tipo) === varType && (pv.value || pv.valor) === varValue
            );
            if (!yaExiste) {
                window._ptVariants.push({ type: varType, value: varValue, qty: v.qty || 0 });
                importadas++;
            }
        });
        if (importadas > 0) {
            renderVariantsListPt();
            manekiToastExport(`✅ Se importaron ${importadas} variante(s) de "${mp.name}"`, 'ok');
        }
    }

    renderPtMpList();
    recalcularCostoPt();
    filtrarMpSelector(); // actualizar checkmarks
}
window.seleccionarMpPt = seleccionarMpPt;

function quitarMpPt(idx) {
    (window._ptMpComponentes||[]).splice(idx,1);
    renderPtMpList();
    recalcularCostoPt();
}
window.quitarMpPt = quitarMpPt;

function updateMpQtyPt(idx, val) {
    if (window._ptMpComponentes && window._ptMpComponentes[idx]) {
        window._ptMpComponentes[idx].qty = Math.max(0.01, parseFloat(val)||1);
        recalcularCostoPt();
    }
}
window.updateMpQtyPt = updateMpQtyPt;

function renderPtMpList() {
    const el = document.getElementById('ptMpList');
    if (!el) return;
    const comps = window._ptMpComponentes||[];
    if (!comps.length) {
        el.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas agregadas</p>';
        document.getElementById('ptDisponibilidadBox') && (document.getElementById('ptDisponibilidadBox').style.display='none');
        return;
    }
    el.innerHTML = comps.map((c,i) => {
        const imgH = c.imageUrl
            ? `<img src="${c.imageUrl}" alt="${_esc(c.nombre||c.name||'')}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;flex-shrink:0;">`
            : `<span style="font-size:1.4rem;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${c.imagen||'🏭'}</span>`;
        const subtotal = (c.qty*c.costUnit).toFixed(2);
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;">
            ${imgH}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(c.nombre)}</div>
                <div style="font-size:.72rem;color:#6b7280;">$${c.costUnit.toFixed(2)}/ud · Subtotal: <b style="color:#92400e;">$${subtotal}</b></div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                <button type="button" onclick="updateMpQtyPt(${i},${(c.qty||1)-1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">−</button>
                <input type="number" value="${c.qty}" min="0.01" step="0.01" onchange="updateMpQtyPt(${i},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:3px 4px;font-size:.85rem;font-weight:700;">
                <button type="button" onclick="updateMpQtyPt(${i},${(c.qty||1)+1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="quitarMpPt(${i})"
                style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
        </div>`;
    }).join('');
    calcularDisponibilidadPt();
}
window.renderPtMpList = renderPtMpList;

// ── Cálculo de costo y disponibilidad ─────────────────────────────────────
function recalcularCostoPt() {
    const comps = window._ptMpComponentes||[];
    const total = comps.reduce((s,c) => s+(c.qty*c.costUnit), 0);
    const costoInput = document.getElementById('ptCosto');
    if (costoInput) costoInput.value = total.toFixed(2);
    // Mostrar desglose
    const desglose = document.getElementById('ptCostoDesglose');
    if (desglose && comps.length) {
        desglose.textContent = comps.map(c=>`${c.nombre} ×${c.qty} = $${(c.qty*c.costUnit).toFixed(2)}`).join(' · ');
    } else if (desglose) desglose.textContent='';
    ptMostrarMargenInfo();
    calcularDisponibilidadPt();
}
window.recalcularCostoPt = recalcularCostoPt;

// Cuántas piezas puedo fabricar con el stock actual de MP
function calcularDisponibilidadPt() {
    const comps = window._ptMpComponentes||[];
    const box   = document.getElementById('ptDisponibilidadBox');
    const num   = document.getElementById('ptDisponibilidadNum');
    const det   = document.getElementById('ptDisponibilidadDetalle');
    if (!box||!comps.length) { if(box) box.style.display='none'; return; }
    box.style.display='block';
    let minPiezas = Infinity;
    const detalles = comps.map(c => {
        const mp = (window.products||[]).find(p=>String(p.id)===String(c.id));
        if (mp && mp.tipo === 'servicio') return `${c.nombre}: ⚙️ servicio (sin límite de stock)`;
        const stockActual = mp ? (mp.stock||0) : 0;
        const piezas = c.qty>0 ? Math.floor(stockActual/c.qty) : 0;
        if (piezas < minPiezas) minPiezas = piezas;
        return `${c.nombre}: ${stockActual} uds ÷ ${c.qty} = ${piezas} piezas`;
    });
    if (!isFinite(minPiezas)) minPiezas = 0;
    if (num) {
        num.textContent = minPiezas;
        num.style.color = minPiezas>0?'#059669':'#ef4444';
    }
    if (det) det.innerHTML = detalles.join('<br>');
}
window.calcularDisponibilidadPt = calcularDisponibilidadPt;

function ptAplicarMargen(pct) {
    const costo = parseFloat(document.getElementById('ptCosto')?.value||0)||0;
    if (!costo) { manekiToastExport('⚠️ Define el costo primero','warn'); return; }
    const precio = costo * (1 + pct/100);
    const inp = document.getElementById('ptPrecio');
    if (inp) { inp.value = precio.toFixed(2); ptMostrarMargenInfo(); }
}
window.ptAplicarMargen = ptAplicarMargen;

function ptAplicarMargenCustom() {
    const pct = parseFloat(document.getElementById('ptMargenCustom')?.value||0);
    if (!pct||pct<=0) return;
    ptAplicarMargen(pct);
}
window.ptAplicarMargenCustom = ptAplicarMargenCustom;

function ptActualizarPrecioSugerido() { ptMostrarMargenInfo(); }
window.ptActualizarPrecioSugerido = ptActualizarPrecioSugerido;

function ptMostrarMargenInfo() {
    const costo  = parseFloat(document.getElementById('ptCosto')?.value||0)||0;
    const precio = parseFloat(document.getElementById('ptPrecio')?.value||0)||0;
    const info   = document.getElementById('ptMargenInfo');
    if (!info) return;
    if (!costo||!precio) { info.textContent=''; return; }
    const margen = ((precio-costo)/precio*100).toFixed(1);
    const ganancia = (precio-costo).toFixed(2);
    const color = parseFloat(margen)>=40?'#059669':parseFloat(margen)>=20?'#d97706':'#ef4444';
    info.innerHTML = `<span style="color:${color};font-weight:700;">${margen}% de margen</span> · Ganancia por pieza: <b style="color:${color};">$${ganancia}</b>`;
}
window.ptMostrarMargenInfo = ptMostrarMargenInfo;

// ── Guardar Producto Terminado ─────────────────────────────────────────────
async function guardarProductoTerminado() {
    const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const nombre   = gv('ptNombre').trim();
    const sku      = gv('ptSku').trim();
    const catId    = gv('ptCategory');
    const costo    = parseFloat(gv('ptCosto'))||0;
    const precio   = parseFloat(gv('ptPrecio'))||0;
    const stockMin = parseInt(gv('ptStockMin')) || 5;
    const rendimientoPorHoja = parseFloat(gv('ptRendimientoPorHoja')) || 0;
    const proveedorNombre = gv('ptProveedorNombre').trim();
    const proveedorNotas  = gv('ptProveedorNotas').trim();

    if (!nombre) { manekiToastExport('⚠️ El nombre es requerido','warn'); document.getElementById('ptNombre')?.focus(); return; }
    if (!precio||precio<=0) { manekiToastExport('⚠️ El precio de venta debe ser mayor a $0','warn'); document.getElementById('ptPrecio')?.focus(); return; }
    if (precio<costo) { manekiToastExport('⚠️ El precio no puede ser menor al costo','warn'); document.getElementById('ptPrecio')?.focus(); return; }
    // GUARD: detectar nombre duplicado (exacto) y similar (fuzzy >80%)
    const _excludeIdPt = window.modoEdicion ? window.edicionProductoId : null;
    const _nombreDupPt = (window.products||[]).find(p =>
        (p.name || '').trim().toLowerCase() === nombre.toLowerCase() && String(p.id) !== String(_excludeIdPt)
    );
    if (_nombreDupPt) {
        manekiToastExport(`⚠️ Ya existe un producto llamado "${_nombreDupPt.name}". Usa un nombre diferente o edita el existente.`, 'warn');
        document.getElementById('ptNombre')?.focus(); return;
    }
    // Detector de similares: ratio = 1 - levenshtein / maxLen > 0.80 → advertencia no bloqueante
    if (typeof _fuzzyMatch === 'function') {
        const _similarPt = (window.products||[]).find(p => {
            if (String(p.id) === String(_excludeIdPt)) return false;
            const a = nombre.toLowerCase(), b = (p.name||'').toLowerCase();
            if (a === b) return false; // ya detectado arriba
            const maxLen = Math.max(a.length, b.length);
            if (maxLen < 4) return false;
            // Usar levenshtein si está disponible en window
            if (typeof (window as any)._levenshtein === 'function') {
                const dist = (window as any)._levenshtein(a, b);
                return (1 - dist / maxLen) >= 0.80;
            }
            return false;
        });
        if (_similarPt) {
            manekiToastExport(`⚠️ Nombre similar a "${_similarPt.name}" ya existente. Si es diferente, continúa guardando.`, 'warn');
            // Solo advierte, no bloquea
        }
    }
    if (sku && !skuEsUnico(sku, _excludeIdPt)) {
        manekiToastExport(`⚠️ El SKU "${sku}" ya está en uso`,'warn'); return;
    }

    // ── Mejora 3: Validación de costo cero con sugerencia automática ────────
    let costoFinal = costo;
    const _mpCompsParaValidar = window._ptMpComponentes || [];
    if (costoFinal === 0) {
        if (_mpCompsParaValidar.length > 0) {
            // Calcular costo desde materias primas
            const _costoCalculado = _mpCompsParaValidar.reduce((sum, comp) => {
                const _mp = (window.products || []).find(p => String(p.id) === String(comp.id));
                return sum + ((comp.qty || 0) * ((_mp && _mp.cost) ? _mp.cost : (comp.costUnit || 0)));
            }, 0);
            if (_costoCalculado > 0) {
                const _usarCosto = await showConfirm(`El costo calculado basado en materias primas es $${_costoCalculado.toFixed(2)}. ¿Deseas usarlo como costo del producto?`);
                if (_usarCosto) {
                    costoFinal = _costoCalculado;
                    const _costoInput = document.getElementById('ptCosto');
                    if (_costoInput) _costoInput.value = costoFinal.toFixed(2);
                }
            }
        } else {
            // Sin MPs y costo 0 → solo advertencia, no bloquea
            manekiToastExport('⚠️ El costo del producto está en $0. Considera agregar un costo.', 'warn');
        }
    }

    // FIX loading state: deshabilitar botón para evitar doble guardado
    const _btn = document.getElementById('ptSubmitBtn');
    const _done = typeof btnLoading === 'function' ? btnLoading(_btn) : () => {};
    if (_btn) _btn.disabled = true;

    try {
        // Subir imagen principal si hay
        if (window.currentProductImageFile) {
            manekiToastExport('⏳ Subiendo imagen principal...','ok');
            const uploaded = await subirImagenStorage(window.currentProductImageFile).catch(()=>null);
            if (uploaded) {
                window.currentProductImage = uploaded;
            } else {
                manekiToastExport('⚠️ No se pudo subir la imagen principal. Intenta de nuevo.', 'warn');
            }
            window.currentProductImageFile = null;
        }

        // Subir fotos de galería pendientes
        const galeriaFiles = window._ptGaleriaFiles || [];
        if (galeriaFiles.length > 0) {
            manekiToastExport(`⏳ Subiendo ${galeriaFiles.length} foto(s) de galería...`, 'ok');
            const subidas = await Promise.all(galeriaFiles.map(f => subirImagenStorage(f).catch(() => null)));
            const urlsNuevas = subidas.filter(Boolean);
            const fallidas = subidas.filter(x => x === null).length;
            if (fallidas > 0) manekiToastExport(`⚠️ ${fallidas} foto(s) de galería no se pudieron subir.`, 'warn');
            window._ptGaleriaUrls = [...(window._ptGaleriaUrls || []), ...urlsNuevas];
            window._ptGaleriaFiles = [];
        }
        const imageUrls = [...(window._ptGaleriaUrls || [])];

        const publicarTienda = document.getElementById('ptPublicarTienda')?.checked ?? false;
        const cat = (window.categories||[]).find(c=>c.id===catId);
        const finalSku = sku || generateSKU(catId);
        const tags = [...(window._ptTagsActuales||[])];
        const mpComps = [...(window._ptMpComponentes||[])];

        // Sincronizar window.currentVariants con _ptVariants
        window.currentVariants = [...(window._ptVariants||[])];

        if (window.modoEdicion && window.edicionProductoId !== null) {
            const idx = (window.products||[]).findIndex(x=>String(x.id)===String(window.edicionProductoId));
            if (idx===-1) { manekiToastExport('Error: producto no encontrado','err'); return; }
            const stOld = window.products[idx].stock;
            // Guardar historial de precio si cambió
            const productoAnterior = window.products[idx];
            const precioAnterior = productoAnterior.price;
            const costoAnterior = productoAnterior.cost;
            const historialPrecios = productoAnterior.historialPrecios || [];
            if (precioAnterior !== precio || costoAnterior !== costoFinal) {
                historialPrecios.push({
                    fecha: new Date().toISOString(),
                    precioAntes: precioAnterior,
                    costoAntes: costoAnterior,
                    precioNuevo: precio,
                    costoNuevo: costoFinal
                });
            }
            window.products[idx] = Object.assign({}, window.products[idx], {
                name:nombre, category:catId, tipo: publicarTienda ? 'producto' : 'producto_interno',
                cost:costoFinal, price:precio, stockMin,
                tags, sku:finalSku,
                mpComponentes: mpComps,
                publicarTienda,
                image: cat ? cat.emoji : window.products[idx].image,
                imageUrl: window.currentProductImage || window.products[idx].imageUrl,
                imageUrls: imageUrls.length > 0 ? imageUrls : (window.products[idx].imageUrls || []),
                variants:[...window.currentVariants],
                historialPrecios,
                rendimientoPorHoja,
                proveedorNombre,
                proveedorNotas,
                movimientos: window.products[idx].movimientos || [],
            });
            syncStockFromVariants(window.products[idx]);
            const stNew = getStockEfectivo(window.products[idx]);
            if (stNew!==stOld) registrarMovimiento({productoId:window.edicionProductoId,
                productoNombre:nombre, tipo:'ajuste', cantidad:stNew-stOld,
                motivo:'Edición', stockAntes:stOld, stockDespues:stNew});
            // ── Mejora 2: registrar en movimientos por-producto ─────────────
            const _deltaStockPt = stNew - stOld;
            if (_deltaStockPt !== 0) {
                window.products[idx].movimientos = window.products[idx].movimientos || [];
                window.products[idx].movimientos.unshift({
                    id: Date.now(),
                    fecha: _fechaHoy(),
                    delta: _deltaStockPt,
                    stockResultante: stNew,
                    motivo: 'Edición manual',
                    usuario: 'local'
                });
                if (window.products[idx].movimientos.length > 30)
                    window.products[idx].movimientos = window.products[idx].movimientos.slice(0, 30);
            }
            saveProducts(); renderInventoryTable();
            if (typeof updateDashboard==='function') updateDashboard();
            _done(true);
            closePtModal();
            if (window.MKS) MKS.notify();
            manekiToastExport('✅ Producto actualizado','ok');
        } else {
            const np = {
                id:_genId(), name:nombre, category:catId, tipo: publicarTienda ? 'producto' : 'producto_interno',
                cost:costoFinal, price:precio, stock:0,
                stockMin, tags, sku:finalSku,
                mpComponentes: mpComps,
                publicarTienda,
                image: cat ? cat.emoji : '📦',
                imageUrl: window.currentProductImage||null,
                imageUrls: imageUrls,
                variants:[...window.currentVariants],
                rendimientoPorHoja,
                proveedorNombre,
                proveedorNotas,
                movimientos: [],
            };
            syncStockFromVariants(np);
            window.products.push(np);
            saveProducts(); renderInventoryTable();
            if (typeof updateDashboard==='function') updateDashboard();
            _done(true);
            closePtModal();
            if (window.MKS) MKS.notify();
            manekiToastExport('✅ Producto agregado exitosamente','ok');
        }
    } finally {
        if (_btn) _btn.disabled = false;
    }
}
window.guardarProductoTerminado = guardarProductoTerminado;
