function _resetMpVariantesUI() {
    window._mpVariantes = [];
    const chk = document.getElementById('mpUsaVariantes');
    if (chk) chk.checked = false;
    const panel = document.getElementById('mpVariantesPanel');
    if (panel) panel.style.display = 'none';
    const slider = document.getElementById('mpVariantesSlider');
    if (slider) slider.style.background = '#d1d5db';
    const thumb = document.getElementById('mpVariantesThumb');
    if (thumb) thumb.style.left = '3px';
    const stockRow = document.getElementById('mpStockRow');
    if (stockRow) { stockRow.style.opacity = '1'; }
    const stockEl = document.getElementById('mpStock');
    if (stockEl) { stockEl.readOnly = false; stockEl.value = 0; }
    const listEl = document.getElementById('mpVariantesList');
    if (listEl) listEl.innerHTML = '<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>';
    const totalBox = document.getElementById('mpVariantesStockTotal');
    if (totalBox) totalBox.style.display = 'none';
}

function closeMateriaPrimaModal() {
    if (typeof closeModal === 'function') closeModal('mpModal');
    const form = document.getElementById('mpForm');
    if (form) form.reset();
    window.modoEdicion = false; window.edicionProductoId = null;
    window.currentProductImage = null; window.currentProductImageFile = null;
    window._mpTagsActuales = [];
    _resetMpVariantesUI();
    renderMpTags();
}
window.closeMateriaPrimaModal = closeMateriaPrimaModal;

function renderMpTags() {
    const container = document.getElementById('mpTagsGrid');
    if (!container) return;
    container.innerHTML = TAGS_MATERIA_PRIMA.map(tag => {
        const active = (window._mpTagsActuales || []).includes(tag);
        return `<button type="button" onclick="toggleMpTag('${tag}')"
            id="mptag-${tag.replace(/[^a-zA-Z0-9]/g,'')}"
            style="padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;
                border:1.5px solid ${active ? '#C5A572' : '#e5e7eb'};
                background:${active ? '#FFF9F0' : '#fff'};
                color:${active ? '#92400e' : '#6b7280'};">
            ${tag}
        </button>`;
    }).join('');

    // Mostrar tags personalizados seleccionados
    const customContainer = document.getElementById('mpTagsCustomSelected');
    if (customContainer) {
        const customTags = (window._mpTagsActuales || []).filter(t => !TAGS_MATERIA_PRIMA.includes(t));
        customContainer.innerHTML = customTags.map(t =>
            `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#fef3c7;border:1px solid #fde68a;border-radius:99px;font-size:12px;font-weight:600;color:#92400e;">
                ${_esc(t)}
                <button type="button" onclick="removeMpTag('${_esc(t)}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:0 1px;line-height:1;">✕</button>
            </span>`
        ).join('');
    }
}
window.renderMpTags = renderMpTags;

function toggleMpTag(tag) {
    window._mpTagsActuales = window._mpTagsActuales || [];
    const idx = window._mpTagsActuales.indexOf(tag);
    if (idx > -1) window._mpTagsActuales.splice(idx, 1);
    else window._mpTagsActuales.push(tag);
    renderMpTags();
}
window.toggleMpTag = toggleMpTag;

function removeMpTag(tag) {
    window._mpTagsActuales = (window._mpTagsActuales || []).filter(t => t !== tag);
    renderMpTags();
}
window.removeMpTag = removeMpTag;

function agregarMpTagCustom() {
    const input = document.getElementById('mpTagCustomInput');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    window._mpTagsActuales = window._mpTagsActuales || [];
    if (!window._mpTagsActuales.includes(val)) {
        window._mpTagsActuales.push(val);
        renderMpTags();
    }
    input.value = '';
    input.focus();
}
window.agregarMpTagCustom = agregarMpTagCustom;

// Inyectar el modal de Materia Prima en el DOM cuando esté listo
function injectMpModal() {
    if (document.getElementById('mpModal')) return; // Ya existe

    const modal = document.createElement('div');
    modal.id = 'mpModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-fade-in" style="margin-left:auto;margin-right:auto;max-height:92vh;overflow-y:auto;">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800">🏭 Nueva Materia Prima</h3>
            <button onclick="closeMateriaPrimaModal()" class="text-gray-400 hover:text-gray-600" style="font-size:1.4rem;line-height:1;background:none;border:none;cursor:pointer;">
                ×
            </button>
        </div>

        <form id="mpForm" class="space-y-5" novalidate>

            <!-- Imagen -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">📷 Imagen (opcional)</label>
                <input type="file" id="mpProductImage" accept="image/*"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 outline-none">
                <div id="mpImagePreview" class="mt-3 hidden">
                    <img id="mpPreviewImg" class="w-24 h-24 object-cover rounded-xl border border-gray-200 mx-auto" src="" alt="Preview">
                </div>
            </div>

            <!-- Nombre -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input type="text" id="mpNombre" required
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                       placeholder="Ej: Filamento PLA Blanco 1kg">
            </div>

            <!-- SKU -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Código SKU</label>
                <input type="text" id="mpSku"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                       placeholder="Se generará automáticamente si está vacío">
            </div>

            <!-- Tags de material -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">🏷️ Tipo de Material</label>
                <div id="mpTagsGrid" class="flex flex-wrap gap-2 mb-3"></div>
                <div class="flex gap-2 mt-2">
                    <input type="text" id="mpTagCustomInput"
                        placeholder="Agregar tipo personalizado..."
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarMpTagCustom();}"
                        class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2">
                    <button type="button" onclick="agregarMpTagCustom()"
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:#C5A572">+ Agregar</button>
                </div>
                <div id="mpTagsCustomSelected" class="flex flex-wrap gap-2 mt-2"></div>
            </div>

            <!-- Compra por paquete o unidad -->
            <div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1.5px solid #e9d5ff;border-radius:14px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <label class="block text-sm font-semibold" style="color:#7c3aed;">💰 Costo</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:.78rem;color:#9ca3af;">¿Compras por paquete?</span>
                        <label style="position:relative;display:inline-block;width:38px;height:21px;cursor:pointer;">
                            <input type="checkbox" id="mpUsaPaquete" onchange="mpTogglePaquete()"
                                style="opacity:0;width:0;height:0;position:absolute;">
                            <span id="mpPaqueteSlider"
                                style="position:absolute;inset:0;background:#d1d5db;border-radius:99px;transition:.2s;">
                                <span style="position:absolute;left:3px;top:3px;width:15px;height:15px;background:#fff;border-radius:50%;transition:.2s;display:block;" id="mpPaqueteThumb"></span>
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Modo unidad simple (default) -->
                <div id="mpCostoSimple">
                    <label style="font-size:.78rem;color:#6b7280;margin-bottom:4px;display:block;">Costo por unidad *</label>
                    <div style="position:relative;">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                        <input type="number" id="mpCosto" required step="0.01" min="0"
                               style="width:100%;padding:10px 14px 10px 28px;border:1.5px solid #e9d5ff;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;font-weight:600;"
                               placeholder="0.00"
                               onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e9d5ff'">
                    </div>
                </div>

                <!-- Modo paquete (toggle) -->
                <div id="mpCostoPaquete" style="display:none;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                        <div>
                            <label style="font-size:.78rem;color:#6b7280;margin-bottom:4px;display:block;">Unidades por paquete</label>
                            <input type="number" id="mpPaqueteCantidad" step="1" min="1" placeholder="Ej: 100"
                                oninput="mpCalcCostoUnidad()"
                                style="width:100%;padding:10px 12px;border:1.5px solid #e9d5ff;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;"
                                onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e9d5ff'">
                        </div>
                        <div>
                            <label style="font-size:.78rem;color:#6b7280;margin-bottom:4px;display:block;">Precio del paquete</label>
                            <div style="position:relative;">
                                <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;font-size:.85rem;">$</span>
                                <input type="number" id="mpPaquetePrecio" step="0.01" min="0" placeholder="0.00"
                                    oninput="mpCalcCostoUnidad()"
                                    style="width:100%;padding:10px 12px 10px 24px;border:1.5px solid #e9d5ff;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;"
                                    onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e9d5ff'">
                            </div>
                        </div>
                    </div>
                    <!-- Resultado: costo por unidad calculado -->
                    <div id="mpCostoUnidadBox" style="background:#ede9fe;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:.72rem;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Costo por unidad</div>
                            <div style="font-size:1.4rem;font-weight:800;color:#5b21b6;" id="mpCostoUnidadResult">$0.00</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:.72rem;color:#9ca3af;">Este valor se usa para producción</div>
                            <input type="number" id="mpCostoCalculado" step="0.001" min="0" style="display:none;">
                        </div>
                    </div>
                    <p style="font-size:.72rem;color:#9ca3af;margin-top:6px;text-align:center;">
                        💡 Cuando agregues stock, ingresa las unidades totales (no paquetes)
                    </p>
                </div>
            </div>

            <!-- VARIANTES de Materia Prima (Talla, Color, etc.) -->
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <label style="font-size:.88rem;font-weight:700;color:#374151;">🎨 ¿Tiene variantes? (Talla, Color, etc.)</label>
                    <label style="position:relative;display:inline-block;width:38px;height:21px;cursor:pointer;">
                        <input type="checkbox" id="mpUsaVariantes" onchange="mpToggleVariantes()"
                            style="opacity:0;width:0;height:0;position:absolute;">
                        <span id="mpVariantesSlider"
                            style="position:absolute;inset:0;background:#d1d5db;border-radius:99px;transition:.2s;">
                            <span style="position:absolute;left:3px;top:3px;width:15px;height:15px;background:#fff;border-radius:50%;transition:.2s;display:block;" id="mpVariantesThumb"></span>
                        </span>
                    </label>
                </div>
                <div id="mpVariantesPanel" style="display:none;">
                    <p style="font-size:.75rem;color:#9ca3af;margin-bottom:10px;">Cada variante tiene su propio stock. El stock total se calculará sumando todas las variantes.</p>
                    <div style="display:flex;gap:8px;margin-bottom:10px;">
                        <input type="text" id="mpVarTipo" placeholder="Tipo: Talla, Color..."
                            style="flex:1;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.85rem;outline:none;"
                            onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVarianteMp();}">
                        <input type="text" id="mpVarValor" placeholder="Valor: M, Rojo..."
                            style="flex:1;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.85rem;outline:none;"
                            onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVarianteMp();}">
                        <button type="button" onclick="agregarVarianteMp()"
                            style="padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:.82rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
                    </div>
                    <!-- Accesos rápidos de tipos comunes -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                        <span style="font-size:.72rem;color:#9ca3af;align-self:center;">Rápidos:</span>
                        <button type="button" onclick="mpVarTipoRapido('Talla')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Talla</button>
                        <button type="button" onclick="mpVarTipoRapido('Color')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Color</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','S')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">S</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','M')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">M</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','L')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">L</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','XL')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">XL</button>
                        <button type="button" onclick="mpVarTipoRapido('Color','Negro')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Negro</button>
                        <button type="button" onclick="mpVarTipoRapido('Color','Blanco')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Blanco</button>
                    </div>
                    <div id="mpVariantesList" style="display:flex;flex-direction:column;gap:6px;">
                        <span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>
                    </div>
                    <div id="mpVariantesStockTotal" style="display:none;margin-top:10px;padding:8px 12px;background:#ede9fe;border-radius:10px;font-size:.82rem;font-weight:700;color:#5b21b6;text-align:center;"></div>
                </div>
            </div>

            <!-- Stock y Stock Mínimo -->
            <div class="grid grid-cols-2 gap-4">
                <div id="mpStockRow">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">📦 Stock Inicial</label>
                    <input type="number" id="mpStock" required min="0" value="0"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">⚠️ Stock Mínimo</label>
                    <input type="number" id="mpStockMin" min="0" value="5"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
                    <p class="text-xs text-gray-400 mt-1">Alerta cuando baje de este número</p>
                </div>
            </div>

            <!-- Unidad de medida -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">📐 Unidad de medida</label>
                <select id="mpUnidad" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none" style="background:#fff;">
                    <option value="pza">Pieza (pza)</option>
                    <option value="hoja">Hoja</option>
                    <option value="rollo">Rollo</option>
                    <option value="m">Metro (m)</option>
                    <option value="cm">Centímetro (cm)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="par">Par</option>
                    <option value="bolsa">Bolsa</option>
                </select>
            </div>

            <!-- Proveedor -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">🏭 Proveedor</label>
                <input type="text" id="mpProveedor"
                       placeholder="Ej: Mercado Libre, Proveedor ABC"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
            </div>

            <!-- Link del proveedor -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">🔗 Link del proveedor (opcional)</label>
                <input type="url" id="mpProveedorUrl"
                       placeholder="https://www.mercadolibre.com.mx/..."
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
            </div>

            <!-- Notas -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">📝 Notas internas</label>
                <textarea id="mpNotas" rows="2"
                    placeholder="Ej: usar solo para impresora X, guardar en lugar seco..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm resize-none"></textarea>
            </div>

            <button type="submit" id="mpSubmitBtn"
                    class="btn-primary w-full py-4 rounded-xl text-white font-bold text-lg mt-4"
                    style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                ✅ Guardar Materia Prima
            </button>
        </form>
    </div>`;

    document.body.appendChild(modal);

    // Setup imagen upload para el nuevo modal
    setTimeout(() => {
        const input = document.getElementById('mpProductImage');
        if (input && !input._mkBound) {
            input._mkBound = true;
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                window.currentProductImageFile = file;
                const reader = new FileReader();
                reader.onload = ev => {
                    const img = document.getElementById('mpPreviewImg');
                    const pre = document.getElementById('mpImagePreview');
                    if (img) img.src = ev.target.result;
                    if (pre) pre.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            });
        }

        // Form submit de materia prima
        const mpForm = document.getElementById('mpForm');
        if (mpForm && !mpForm._mkSubmitBound) {
            mpForm._mkSubmitBound = true;
            mpForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await guardarMateriaPrima();
            });
        }
    }, 100);
}
window.injectMpModal = injectMpModal;

// ══════════════════════════════════════════════════════════════════════════════
// SERVICIOS Y CONSUMIBLES — tipo:'servicio' (sin stock, solo costo por uso)
// ══════════════════════════════════════════════════════════════════════════════
const _SVC_EMOJIS = ['⚙️','🔧','💡','🖨️','✂️','🔩','💻','🎨','🔥','⚡','🧲','🛠️'];

function injectSvcModal() {
    if (document.getElementById('svcModal')) return;
    const modal = document.createElement('div');
    modal.id = 'svcModal';
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in" style="margin:auto;max-height:90vh;overflow-y:auto;">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">⚙️ <span id="svcModalTitle">Nuevo Servicio</span></h3>
            <button onclick="closeServicioModal()" style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;">×</button>
        </div>
        <form id="svcForm" class="space-y-5" onsubmit="event.preventDefault();guardarServicio();">
            <input type="hidden" id="svcEditId">

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input type="text" id="svcNombre" required placeholder="Ej: Uso de láser, Vinil textil (pieza)..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Ícono</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    ${_SVC_EMOJIS.map(e=>`<button type="button" onclick="document.getElementById('svcEmoji').value='${e}';document.querySelectorAll('.svc-emoji-btn').forEach(b=>b.style.background='#f3f4f6');this.style.background='#ede9fe';" class="svc-emoji-btn" style="width:38px;height:38px;border-radius:10px;border:1px solid #e5e7eb;background:#f3f4f6;font-size:1.3rem;cursor:pointer;">${e}</button>`).join('')}
                </div>
                <input type="hidden" id="svcEmoji" value="⚙️">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Costo por uso *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#6b7280;font-weight:700;">$</span>
                    <input type="number" id="svcCosto" required min="0" step="0.01" placeholder="0.00"
                        class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
                </div>
                <p class="text-xs text-gray-400 mt-1">Cuánto cuesta cada vez que usas este servicio en un producto</p>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">SKU (opcional)</label>
                <input type="text" id="svcSku" placeholder="Se genera automáticamente si está vacío"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                <textarea id="svcNotas" rows="2" placeholder="Ej: Costo incluye electricidad + depreciación de la máquina"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none focus:border-indigo-400"></textarea>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl text-white font-bold text-base" style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);">
                💾 Guardar Servicio
            </button>
        </form>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeServicioModal(); });
}
window.injectSvcModal = injectSvcModal;

function openServicioModal(editId) {
    injectSvcModal();
    document.getElementById('svcEditId').value = editId || '';
    document.getElementById('svcModalTitle').textContent = editId ? 'Editar Servicio' : 'Nuevo Servicio';
    document.getElementById('svcNombre').value = '';
    document.getElementById('svcEmoji').value = '⚙️';
    document.getElementById('svcCosto').value = '';
    document.getElementById('svcSku').value = '';
    document.getElementById('svcNotas').value = '';
    // Resetear botones emoji
    document.querySelectorAll('.svc-emoji-btn').forEach(b => b.style.background = '#f3f4f6');

    if (editId) {
        const p = (window.products||[]).find(x => String(x.id) === String(editId));
        if (p) {
            document.getElementById('svcNombre').value = p.name || '';
            document.getElementById('svcEmoji').value = p.image || '⚙️';
            document.getElementById('svcCosto').value = p.cost || '';
            document.getElementById('svcSku').value = p.sku || '';
            document.getElementById('svcNotas').value = p.notas || '';
            // Marcar emoji activo
            document.querySelectorAll('.svc-emoji-btn').forEach(b => {
                if (b.textContent === (p.image || '⚙️')) b.style.background = '#ede9fe';
            });
        }
    }
    openModal('svcModal');
}
window.openServicioModal = openServicioModal;

async function guardarServicio() {
    const nombre = document.getElementById('svcNombre').value.trim();
    const costo  = parseFloat(document.getElementById('svcCosto').value) || 0;
    const emoji  = document.getElementById('svcEmoji').value || '⚙️';
    const notas  = document.getElementById('svcNotas').value.trim();
    const skuInput = document.getElementById('svcSku').value.trim();
    const editId = document.getElementById('svcEditId').value;

    if (!nombre) { manekiToastExport('El nombre es requerido.', 'warn'); return; }

    // BUG-INV-SKU FIX: Date.now().slice(-5) solo da 5 dígitos → colisión frecuente.
    // Usar crypto.randomUUID() o un fallback más largo para garantizar unicidad.
    const _skuSuffix = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID().split('-')[0].toUpperCase()
        : String(Date.now()).slice(-8) + Math.random().toString(36).slice(2,5).toUpperCase();
    const sku = skuInput || `SVC-${_skuSuffix}`;
    if (!window.products) window.products = [];

    if (editId) {
        const idx = window.products.findIndex(p => String(p.id) === String(editId));
        if (idx !== -1) {
            window.products[idx] = { ...window.products[idx], name: nombre, cost: costo, image: emoji, notas, sku };
        }
    } else {
        window.products.push({
            id: _genId(), name: nombre, tipo: 'servicio',
            cost: costo, price: 0, stock: null, stockMin: null,
            category: 'servicios', image: emoji, notas, sku, tags: []
        });
    }
    saveProducts();
    renderInventoryTable();
    closeServicioModal();
    if (window.MKS) MKS.notify();
    manekiToastExport(`✅ Servicio "${nombre}" guardado.`, 'ok');
}
window.guardarServicio = guardarServicio;

function closeServicioModal() { closeModal('svcModal'); }
window.closeServicioModal = closeServicioModal;

// ── Funciones de compra por paquete (MP) ─────────────────────────────────
function mpTogglePaquete() {
    const chk    = document.getElementById('mpUsaPaquete');
    const simple = document.getElementById('mpCostoSimple');
    const paq    = document.getElementById('mpCostoPaquete');
    const slider = document.getElementById('mpPaqueteSlider');
    const thumb  = document.getElementById('mpPaqueteThumb');
    const costoInput = document.getElementById('mpCosto');

    if (!chk || !simple || !paq) return;

    if (chk.checked) {
        simple.style.display = 'none';
        paq.style.display = 'block';
        if (slider) slider.style.background = '#7c3aed';
        if (thumb)  thumb.style.left = '20px';
        // mpCosto ya no es requerido directamente — lo llena mpCalcCostoUnidad
        if (costoInput) costoInput.removeAttribute('required');
        mpCalcCostoUnidad();
    } else {
        simple.style.display = 'block';
        paq.style.display = 'none';
        if (slider) slider.style.background = '#d1d5db';
        if (thumb)  thumb.style.left = '3px';
        if (costoInput) costoInput.setAttribute('required', '');
    }
}
window.mpTogglePaquete = mpTogglePaquete;

function mpCalcCostoUnidad() {
    const cant  = parseFloat(document.getElementById('mpPaqueteCantidad')?.value) || 0;
    const precio = parseFloat(document.getElementById('mpPaquetePrecio')?.value) || 0;
    const resultEl  = document.getElementById('mpCostoUnidadResult');
    const costoHidden = document.getElementById('mpCostoCalculado') || document.getElementById('mpCosto');

    if (cant > 0 && precio > 0) {
        const costoUnidad = precio / cant;
        if (resultEl) resultEl.textContent = '$' + costoUnidad.toFixed(4).replace(/\.?0+$/, '') ;
        if (costoHidden) costoHidden.value = costoUnidad.toFixed(4);
        // Color según el resultado
        const box = document.getElementById('mpCostoUnidadBox');
        if (box) box.style.background = '#ede9fe';
    } else {
        if (resultEl) resultEl.textContent = '$0.00';
        if (costoHidden) costoHidden.value = '';
    }
}
window.mpCalcCostoUnidad = mpCalcCostoUnidad;

// ══════════════════════════════════════════════════════════════════════════
// ── VARIANTES DE MATERIA PRIMA ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
window._mpVariantes = window._mpVariantes ?? [];

function mpToggleVariantes() {
    const chk = document.getElementById('mpUsaVariantes');
    const panel = document.getElementById('mpVariantesPanel');
    const slider = document.getElementById('mpVariantesSlider');
    const thumb = document.getElementById('mpVariantesThumb');
    const stockRow = document.getElementById('mpStockRow');
    if (!chk || !panel) return;
    const on = chk.checked;
    panel.style.display = on ? 'block' : 'none';
    if (slider) slider.style.background = on ? '#6366f1' : '#d1d5db';
    if (thumb) thumb.style.left = on ? '20px' : '3px';
    // Si activamos variantes, el campo de stock general se oculta (el stock viene de las variantes)
    if (stockRow) {
        stockRow.style.opacity = on ? '0.4' : '1';
        const inp = document.getElementById('mpStock');
        if (inp) {
            inp.readOnly = on;
            if (on) {
                inp.value = 0;
            } else {
                // BUG-INV-STOCK FIX: al desactivar variantes, transferir el total
                // acumulado al campo de stock simple para no perder los datos.
                const varTotal = (window._mpVariantes || [])
                    .reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
                if (varTotal > 0) inp.value = varTotal;
            }
        }
    }
    if (!on) { window._mpVariantes = []; renderVariantesMp(); }
}
window.mpToggleVariantes = mpToggleVariantes;

function mpVarTipoRapido(tipo, valor) {
    const tipoEl = document.getElementById('mpVarTipo');
    const valorEl = document.getElementById('mpVarValor');
    if (tipoEl) tipoEl.value = tipo;
    if (valorEl) {
        if (valor) { valorEl.value = valor; agregarVarianteMp(); }
        else { valorEl.value = ''; valorEl.focus(); }
    }
}
window.mpVarTipoRapido = mpVarTipoRapido;

function agregarVarianteMp() {
    const tipo  = (document.getElementById('mpVarTipo')?.value || '').trim();
    const valor = (document.getElementById('mpVarValor')?.value || '').trim();
    if (!tipo || !valor) { manekiToastExport('⚠️ Ingresa tipo y valor de la variante', 'warn'); return; }
    window._mpVariantes = window._mpVariantes || [];
    // Evitar duplicados exactos
    const existe = window._mpVariantes.find(v => v.type === tipo && v.value === valor);
    if (existe) { manekiToastExport('⚠️ Ya existe esta variante', 'warn'); return; }
    window._mpVariantes.push({ type: tipo, value: valor, qty: 0 });
    const tipoEl = document.getElementById('mpVarTipo');
    const valorEl = document.getElementById('mpVarValor');
    if (tipoEl) tipoEl.value = '';
    if (valorEl) { valorEl.value = ''; }
    document.getElementById('mpVarTipo')?.focus();
    renderVariantesMp();
}
window.agregarVarianteMp = agregarVarianteMp;

function eliminarVarianteMp(idx) {
    (window._mpVariantes || []).splice(idx, 1);
    renderVariantesMp();
}
window.eliminarVarianteMp = eliminarVarianteMp;

function updateVarianteMpQty(idx, val) {
    if (window._mpVariantes && window._mpVariantes[idx]) {
        window._mpVariantes[idx].qty = Math.max(0, parseInt(val) || 0);
        actualizarStockTotalMp();
    }
}
window.updateVarianteMpQty = updateVarianteMpQty;

function actualizarStockTotalMp() {
    const total = (window._mpVariantes || []).reduce((s, v) => s + (parseInt(v.qty) || 0), 0);
    const box = document.getElementById('mpVariantesStockTotal');
    if (box) {
        if ((window._mpVariantes || []).length > 0) {
            box.style.display = 'block';
            box.textContent = `📦 Stock total: ${total} unidades`;
        } else {
            box.style.display = 'none';
        }
    }
    // Sincronizar campo mpStock con la suma
    const stockEl = document.getElementById('mpStock');
    if (stockEl && document.getElementById('mpUsaVariantes')?.checked) {
        stockEl.value = total;
    }
}

function renderVariantesMp() {
    const container = document.getElementById('mpVariantesList');
    if (!container) return;
    if (!window._mpVariantes || !window._mpVariantes.length) {
        container.innerHTML = '<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>';
        actualizarStockTotalMp();
        return;
    }
    container.innerHTML = window._mpVariantes.map((v, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;">
            <div style="flex:1;min-width:0;">
                <span style="font-size:.85rem;color:#374151;">${_esc(v.type)}: ${_mkColorDot(v.type,_esc(v.value))}</span>
            </div>
            <label style="font-size:.75rem;color:#6b7280;font-weight:600;white-space:nowrap;">Stock:</label>
            <div style="display:flex;align-items:center;gap:2px;">
                <button type="button" onclick="updateVarianteMpQty(${i},${(v.qty||0)-1});renderVariantesMp();"
                    style="width:22px;height:22px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">−</button>
                <input type="number" value="${v.qty||0}" min="0"
                    onchange="updateVarianteMpQty(${i},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #6366f1;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVarianteMpQty(${i},${(v.qty||0)+1});renderVariantesMp();"
                    style="width:22px;height:22px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <span style="font-size:.72rem;color:#9ca3af;">pzs</span>
            <button type="button" onclick="eliminarVarianteMp(${i})"
                style="width:24px;height:24px;background:#fee2e2;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>`).join('');
    actualizarStockTotalMp();
}
window.renderVariantesMp = renderVariantesMp;
