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
                    <label style="padding:6px 14px;background:#C5A572;color:#fff;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
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
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
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
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                    <input type="text" id="ptVarValor" placeholder="Valor: M, Rojo..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVariantePt();}">
                    <button type="button" onclick="agregarVariantePt()"
                        style="padding:10px 14px;background:#C5A572;color:#fff;border:none;border-radius:10px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
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
                                style="padding:6px 12px;background:#C5A572;color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;">Aplicar</button>
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
                        style="width:100%;padding:12px 16px 12px 28px;border:2px solid #C5A572;border-radius:12px;font-size:1.1rem;font-weight:700;outline:none;box-sizing:border-box;color:#1a0533;"
                        onfocus="this.style.borderColor='#E8B84B'" onblur="this.style.borderColor='#C5A572'">
                </div>
                <div id="ptMargenInfo" style="font-size:.78rem;color:#6b7280;margin-top:6px;"></div>
            </div>

            <!-- RENDIMIENTO POR HOJA (stickers, etc.) -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🎯 Piezas por hoja / unidad de MP <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <input type="number" id="ptRendimientoPorHoja" min="1" placeholder="Ej: 12 (stickers que caben en 1 hoja)"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                <p style="font-size:.72rem;color:#9ca3af;margin-top:5px;">Si vendes por cantidad (ej. 100 stickers), el sistema divide entre este número para calcular cuántas hojas descontar del inventario y calcular el costo.</p>
            </div>

            <!-- STOCK MÍNIMO -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">🔔 Stock mínimo de alerta</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="number" id="ptStockMin" min="0" step="1" value="5"
                        style="width:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
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
                style="width:100%;padding:16px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:8px;letter-spacing:.02em;">
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
            border:1.5px solid ${active?'#C5A572':'#e5e7eb'};background:${active?'#FFF9F0':'#fff'};color:${active?'#92400e':'#6b7280'};">
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
            ? `<img src="${p.imageUrl}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;">`
            : `<span style="font-size:1.4rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${p.image||(esSvc?'⚙️':'🏭')}</span>`;
        const infoExtra = esSvc
            ? `<div style="font-size:.72rem;color:#6d28d9;font-weight:600;">⚙️ Servicio · $${Number(p.cost||0).toFixed(2)}/uso</div>`
            : `<div style="font-size:.72rem;color:#6b7280;">Stock: ${p.stock||0} · Costo: $${Number(p.cost||0).toFixed(2)}</div>`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${yaAgregado?'#f0fdf4':'#fff'};border:1.5px solid ${yaAgregado?'#6ee7b7':'#e5e7eb'};cursor:pointer;transition:all .1s;"
            onclick="seleccionarMpPt('${p.id}')">
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
            ? `<img src="${c.imageUrl}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;flex-shrink:0;">`
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
    // GUARD: detectar nombre duplicado (no solo SKU)
    const _excludeIdPt = window.modoEdicion ? window.edicionProductoId : null;
    const _nombreDupPt = (window.products||[]).find(p =>
        p.name.trim().toLowerCase() === nombre.toLowerCase() && String(p.id) !== String(_excludeIdPt)
    );
    if (_nombreDupPt) {
        manekiToastExport(`⚠️ Ya existe un producto llamado "${_nombreDupPt.name}". Usa un nombre diferente o edita el existente.`, 'warn');
        document.getElementById('ptNombre')?.focus(); return;
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
                const _usarCosto = confirm(`El costo calculado basado en materias primas es $${_costoCalculado.toFixed(2)}. ¿Deseas usarlo como costo del producto?`);
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
            if (typeof renderProducts==='function') renderProducts();
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
            if (typeof renderProducts==='function') renderProducts();
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
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- PRODUCTOS DEL PACK -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">📦 Productos en el Pack</label>
                    <button type="button" onclick="packAbrirSelectorPT()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar producto
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
                        style="padding:6px 14px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
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
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
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

            <button type="button" id="packSubmitBtn" onclick="guardarPack()"
                style="width:100%;padding:14px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:.02em;">
                ✅ Guardar Pack
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
        (!q || p.name.toLowerCase().includes(q))
    );
    const res = document.getElementById('packPtResults');
    if (!res) return;
    if (!pts.length) {
        res.innerHTML = `<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>`;
        return;
    }
    res.innerHTML = pts.map(p => {
        const img = p.imageUrl
            ? `<img src="${p.imageUrl}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`
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
            ? `<img src="${pt.imageUrl}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`
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
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(c.costoCustom).toFixed(2)}"
                            onchange="packActualizarCosto('${c.productoId}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #fde68a;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#fde68a'">
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
        (!q || p.name.toLowerCase().includes(q))
    );
    const res = document.getElementById('packMpResults');
    if (!res) return;
    if (!mps.length) {
        res.innerHTML = `<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>`;
        return;
    }
    res.innerHTML = mps.map(p => {
        const img = p.imageUrl
            ? `<img src="${p.imageUrl}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`
            : `<span style="font-size:1.2rem;">${p.image || '🏭'}</span>`;
        const tipoBadge = p.tipo === 'servicio'
            ? `<span style="font-size:10px;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:99px;">Servicio</span>`
            : `<span style="font-size:10px;background:#f0fdf4;color:#15803d;padding:1px 6px;border-radius:99px;">MP</span>`;
        return `<div onclick="packSeleccionarMP('${String(p.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#fff'">
            ${img}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(p.name)}</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">${tipoBadge}<span style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(p.cost||0).toFixed(2)} / ${_esc(p.unidad||'pza')}</span></div>
            </div>
            <span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:99px;">+ Agregar</span>
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
            ? `<img src="${m.imageUrl}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`
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
                        onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(m.costoCustom).toFixed(2)}"
                            onchange="packActualizarCostoMP('${m.id}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#ddd6fe'">
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
        p.name.trim().toLowerCase() === nombre.toLowerCase() && String(p.id) !== String(excludeId)
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
            if (typeof renderProducts === 'function') renderProducts();
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
            if (typeof renderProducts === 'function') renderProducts();
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
                        style="background:linear-gradient(135deg,#7c3aed,#a855f7);">+ Agregar componente</button>
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
                style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
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
    ).filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
    if (!mps.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML = mps.slice(0, 8).map(p =>
        `<div onclick="pvSeleccionarMP('${p.id}')"
            style="padding:8px 12px;cursor:pointer;font-size:.85rem;border-bottom:1px solid #f3f4f6;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background=''">
            ${p.name} <span style="color:#9ca3af;font-size:.75rem;">$${Number(p.cost||0).toFixed(2)}/ud</span>
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
            <span style="flex:1;font-weight:600;color:#4c1d95;">${c.name}</span>
            <span style="color:#9ca3af;">qty:</span>
            <input type="number" min="0.01" step="0.01" value="${c.qty}"
                onchange="pvEditarQtyComp(${i}, this.value)"
                style="width:50px;padding:3px 6px;border:1px solid #ddd6fe;border-radius:6px;text-align:center;font-size:.8rem;">
            <span style="color:#7c3aed;font-weight:600;min-width:55px;text-align:right;">$${((parseFloat(c.costUnit)||0)*(parseFloat(c.qty)||1)).toFixed(2)}</span>
            <button onclick="pvQuitarComp(${i})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">✕</button>
        </div>`).join('') +
        `<div style="text-align:right;font-size:.78rem;color:#7c3aed;font-weight:700;padding:4px 10px 0;">Costo por hoja: $${costoTotal.toFixed(2)}</div>`;
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

    const finalSku = sku || ('PV-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().split('-')[0].toUpperCase() : Math.random().toString(36).slice(2,7).toUpperCase()));

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
    if (typeof renderProducts === 'function') renderProducts();
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
        ${movs.length === 0 || prod.movimientos.length <= 5 ? '' : `<p style="font-size:.72rem;color:#9ca3af;text-align:center;margin-top:10px;">Mostrando los últimos 5 de ${prod.movimientos.length} movimientos</p>`}
    </div>`;
    document.body.appendChild(modal);
    // Cerrar al hacer clic fuera del panel
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}
window.verMovimientosProducto = verMovimientosProducto;
