"use strict";function _resetMpVariantesUI(){window._mpVariantes=[];const t=document.getElementById("mpUsaVariantes");t&&(t.checked=!1);const e=document.getElementById("mpVariantesPanel");e&&(e.style.display="none");const o=document.getElementById("mpVariantesSlider");o&&(o.style.background="#d1d5db");const n=document.getElementById("mpVariantesThumb");n&&(n.style.left="3px");const a=document.getElementById("mpStockRow");a&&(a.style.opacity="1");const i=document.getElementById("mpStock");i&&(i.readOnly=!1,i.value=0);const r=document.getElementById("mpVariantesList");r&&(r.innerHTML='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>');const d=document.getElementById("mpVariantesStockTotal");d&&(d.style.display="none")}function closeMateriaPrimaModal(){typeof closeModal=="function"&&closeModal("mpModal");const t=document.getElementById("mpForm");t&&t.reset(),window.modoEdicion=!1,window.edicionProductoId=null,window.currentProductImage=null,window.currentProductImageFile=null,window._mpTagsActuales=[],_resetMpVariantesUI(),renderMpTags()}window.closeMateriaPrimaModal=closeMateriaPrimaModal;function renderMpTags(){const t=document.getElementById("mpTagsGrid");if(!t)return;t.innerHTML=TAGS_MATERIA_PRIMA.map(o=>{const n=(window._mpTagsActuales||[]).includes(o);return`<button type="button" onclick="toggleMpTag('${o}')"
            id="mptag-${o.replace(/[^a-zA-Z0-9]/g,"")}"
            style="padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;
                border:1.5px solid ${n?"#C5973B":"#e5e7eb"};
                background:${n?"#FFF9F0":"#fff"};
                color:${n?"#92400e":"#6b7280"};">
            ${o}
        </button>`}).join("");const e=document.getElementById("mpTagsCustomSelected");if(e){const o=(window._mpTagsActuales||[]).filter(n=>!TAGS_MATERIA_PRIMA.includes(n));e.innerHTML=o.map(n=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#fef3c7;border:1px solid #fde68a;border-radius:99px;font-size:12px;font-weight:600;color:#92400e;">
                ${_esc(n)}
                <button type="button" onclick="removeMpTag('${_esc(n)}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:0 1px;line-height:1;">\u2715</button>
            </span>`).join("")}}window.renderMpTags=renderMpTags;function toggleMpTag(t){window._mpTagsActuales=window._mpTagsActuales||[];const e=window._mpTagsActuales.indexOf(t);e>-1?window._mpTagsActuales.splice(e,1):window._mpTagsActuales.push(t),renderMpTags()}window.toggleMpTag=toggleMpTag;function removeMpTag(t){window._mpTagsActuales=(window._mpTagsActuales||[]).filter(e=>e!==t),renderMpTags()}window.removeMpTag=removeMpTag;function agregarMpTagCustom(){const t=document.getElementById("mpTagCustomInput");if(!t)return;const e=t.value.trim();e&&(window._mpTagsActuales=window._mpTagsActuales||[],window._mpTagsActuales.includes(e)||(window._mpTagsActuales.push(e),renderMpTags()),t.value="",t.focus())}window.agregarMpTagCustom=agregarMpTagCustom;function injectMpModal(){if(document.getElementById("mpModal"))return;const t=document.createElement("div");t.id="mpModal",t.className="modal",t.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-fade-in" style="margin-left:auto;margin-right:auto;max-height:92vh;overflow-y:auto;">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800">\u{1F3ED} Nueva Materia Prima</h3>
            <button onclick="closeMateriaPrimaModal()" class="text-gray-400 hover:text-gray-600" style="font-size:1.4rem;line-height:1;background:none;border:none;cursor:pointer;">
                \xD7
            </button>
        </div>

        <form id="mpForm" class="space-y-5" novalidate>

            <!-- Imagen -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4F7} Imagen (opcional)</label>
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
                <label class="block text-sm font-semibold text-gray-700 mb-2">C\xF3digo SKU</label>
                <input type="text" id="mpSku"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                       placeholder="Se generar\xE1 autom\xE1ticamente si est\xE1 vac\xEDo">
            </div>

            <!-- Tags de material -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">\u{1F3F7}\uFE0F Tipo de Material</label>
                <div id="mpTagsGrid" class="flex flex-wrap gap-2 mb-3"></div>
                <div class="flex gap-2 mt-2">
                    <input type="text" id="mpTagCustomInput"
                        placeholder="Agregar tipo personalizado..."
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarMpTagCustom();}"
                        class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2">
                    <button type="button" onclick="agregarMpTagCustom()"
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:#C5973B">+ Agregar</button>
                </div>
                <div id="mpTagsCustomSelected" class="flex flex-wrap gap-2 mt-2"></div>
            </div>

            <!-- Compra por paquete o unidad -->
            <div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1.5px solid #e9d5ff;border-radius:14px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <label class="block text-sm font-semibold" style="color:#7c3aed;">\u{1F4B0} Costo</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:.78rem;color:#9ca3af;">\xBFCompras por paquete?</span>
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
                            <div style="font-size:.72rem;color:#9ca3af;">Este valor se usa para producci\xF3n</div>
                            <input type="number" id="mpCostoCalculado" step="0.001" min="0" style="display:none;">
                        </div>
                    </div>
                    <p style="font-size:.72rem;color:#9ca3af;margin-top:6px;text-align:center;">
                        \u{1F4A1} Cuando agregues stock, ingresa las unidades totales (no paquetes)
                    </p>
                </div>
            </div>

            <!-- VARIANTES de Materia Prima (Talla, Color, etc.) -->
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <label style="font-size:.88rem;font-weight:700;color:#374151;">\u{1F3A8} \xBFTiene variantes? (Talla, Color, etc.)</label>
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
                    <p style="font-size:.75rem;color:#9ca3af;margin-bottom:10px;">Cada variante tiene su propio stock. El stock total se calcular\xE1 sumando todas las variantes.</p>
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
                    <!-- Accesos r\xE1pidos de tipos comunes -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                        <span style="font-size:.72rem;color:#9ca3af;align-self:center;">R\xE1pidos:</span>
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

            <!-- Stock y Stock M\xEDnimo -->
            <div class="grid grid-cols-2 gap-4">
                <div id="mpStockRow">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4E6} Stock Inicial</label>
                    <input type="number" id="mpStock" required min="0" value="0"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">\u26A0\uFE0F Stock M\xEDnimo</label>
                    <input type="number" id="mpStockMin" min="0" value="5"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
                    <p class="text-xs text-gray-400 mt-1">Alerta cuando baje de este n\xFAmero</p>
                </div>
            </div>

            <!-- Unidad de medida -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4D0} Unidad de medida</label>
                <select id="mpUnidad" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none" style="background:#fff;">
                    <option value="pza">Pieza (pza)</option>
                    <option value="hoja">Hoja</option>
                    <option value="rollo">Rollo</option>
                    <option value="m">Metro (m)</option>
                    <option value="cm">Cent\xEDmetro (cm)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="par">Par</option>
                    <option value="bolsa">Bolsa</option>
                </select>
            </div>

            <!-- Proveedor -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F3ED} Proveedor</label>
                <input type="text" id="mpProveedor"
                       placeholder="Ej: Mercado Libre, Proveedor ABC"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
            </div>

            <!-- Link del proveedor -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F517} Link del proveedor (opcional)</label>
                <input type="url" id="mpProveedorUrl"
                       placeholder="https://www.mercadolibre.com.mx/..."
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
            </div>

            <!-- Notas -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4DD} Notas internas</label>
                <textarea id="mpNotas" rows="2"
                    placeholder="Ej: usar solo para impresora X, guardar en lugar seco..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm resize-none"></textarea>
            </div>

            <button type="submit" id="mpSubmitBtn"
                    class="btn-primary w-full py-4 rounded-xl text-white font-bold text-lg mt-4"
                    style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                \u2705 Guardar Materia Prima
            </button>
        </form>
    </div>`,document.body.appendChild(t),setTimeout(()=>{const e=document.getElementById("mpProductImage");e&&!e._mkBound&&(e._mkBound=!0,e.addEventListener("change",function(n){const a=n.target.files[0];if(!a)return;window.currentProductImageFile=a;const i=new FileReader;i.onload=r=>{const d=document.getElementById("mpPreviewImg"),l=document.getElementById("mpImagePreview");d&&(d.src=r.target.result),l&&l.classList.remove("hidden")},i.readAsDataURL(a)}));const o=document.getElementById("mpForm");o&&!o._mkSubmitBound&&(o._mkSubmitBound=!0,o.addEventListener("submit",async function(n){n.preventDefault(),await guardarMateriaPrima()}))},100)}window.injectMpModal=injectMpModal;const _SVC_EMOJIS=["\u2699\uFE0F","\u{1F527}","\u{1F4A1}","\u{1F5A8}\uFE0F","\u2702\uFE0F","\u{1F529}","\u{1F4BB}","\u{1F3A8}","\u{1F525}","\u26A1","\u{1F9F2}","\u{1F6E0}\uFE0F"];function injectSvcModal(){if(document.getElementById("svcModal"))return;const t=document.createElement("div");t.id="svcModal",t.className="modal",t.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in" style="margin:auto;max-height:90vh;overflow-y:auto;">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">\u2699\uFE0F <span id="svcModalTitle">Nuevo Servicio</span></h3>
            <button onclick="closeServicioModal()" style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>
        <form id="svcForm" class="space-y-5" onsubmit="event.preventDefault();guardarServicio();">
            <input type="hidden" id="svcEditId">

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input type="text" id="svcNombre" required placeholder="Ej: Uso de l\xE1ser, Vinil textil (pieza)..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\xCDcono</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    ${_SVC_EMOJIS.map(e=>`<button type="button" onclick="document.getElementById('svcEmoji').value='${e}';document.querySelectorAll('.svc-emoji-btn').forEach(b=>b.style.background='#f3f4f6');this.style.background='#ede9fe';" class="svc-emoji-btn" style="width:38px;height:38px;border-radius:10px;border:1px solid #e5e7eb;background:#f3f4f6;font-size:1.3rem;cursor:pointer;">${e}</button>`).join("")}
                </div>
                <input type="hidden" id="svcEmoji" value="\u2699\uFE0F">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Costo por uso *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#6b7280;font-weight:700;">$</span>
                    <input type="number" id="svcCosto" required min="0" step="0.01" placeholder="0.00"
                        class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
                </div>
                <p class="text-xs text-gray-400 mt-1">Cu\xE1nto cuesta cada vez que usas este servicio en un producto</p>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">SKU (opcional)</label>
                <input type="text" id="svcSku" placeholder="Se genera autom\xE1ticamente si est\xE1 vac\xEDo"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                <textarea id="svcNotas" rows="2" placeholder="Ej: Costo incluye electricidad + depreciaci\xF3n de la m\xE1quina"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none focus:border-indigo-400"></textarea>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl text-white font-bold text-base" style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);">
                \u{1F4BE} Guardar Servicio
            </button>
        </form>
    </div>`,document.body.appendChild(t),t.addEventListener("click",e=>{e.target===t&&closeServicioModal()})}window.injectSvcModal=injectSvcModal;function openServicioModal(t){if(injectSvcModal(),document.getElementById("svcEditId").value=t||"",document.getElementById("svcModalTitle").textContent=t?"Editar Servicio":"Nuevo Servicio",document.getElementById("svcNombre").value="",document.getElementById("svcEmoji").value="\u2699\uFE0F",document.getElementById("svcCosto").value="",document.getElementById("svcSku").value="",document.getElementById("svcNotas").value="",document.querySelectorAll(".svc-emoji-btn").forEach(e=>e.style.background="#f3f4f6"),t){const e=(window.products||[]).find(o=>String(o.id)===String(t));e&&(document.getElementById("svcNombre").value=e.name||"",document.getElementById("svcEmoji").value=e.image||"\u2699\uFE0F",document.getElementById("svcCosto").value=e.cost||"",document.getElementById("svcSku").value=e.sku||"",document.getElementById("svcNotas").value=e.notas||"",document.querySelectorAll(".svc-emoji-btn").forEach(o=>{o.textContent===(e.image||"\u2699\uFE0F")&&(o.style.background="#ede9fe")}))}openModal("svcModal")}window.openServicioModal=openServicioModal;async function guardarServicio(){const t=document.getElementById("svcNombre").value.trim(),e=parseFloat(document.getElementById("svcCosto").value)||0,o=document.getElementById("svcEmoji").value||"\u2699\uFE0F",n=document.getElementById("svcNotas").value.trim(),a=document.getElementById("svcSku").value.trim(),i=document.getElementById("svcEditId").value;if(!t){manekiToastExport("El nombre es requerido.","warn");return}const r=mkId().split("-")[0].toUpperCase(),d=a||`SVC-${r}`;if(window.products||(window.products=[]),i){const l=window.products.findIndex(s=>String(s.id)===String(i));l!==-1&&(window.products[l]={...window.products[l],name:t,cost:e,image:o,notas:n,sku:d})}else window.products.push({id:_genId(),name:t,tipo:"servicio",cost:e,price:0,stock:null,stockMin:null,category:"servicios",image:o,notas:n,sku:d,tags:[]});saveProducts(),renderInventoryTable(),closeServicioModal(),window.MKS&&MKS.notify(),manekiToastExport(`\u2705 Servicio "${t}" guardado.`,"ok")}window.guardarServicio=guardarServicio;function closeServicioModal(){closeModal("svcModal")}window.closeServicioModal=closeServicioModal;function mpTogglePaquete(){const t=document.getElementById("mpUsaPaquete"),e=document.getElementById("mpCostoSimple"),o=document.getElementById("mpCostoPaquete"),n=document.getElementById("mpPaqueteSlider"),a=document.getElementById("mpPaqueteThumb"),i=document.getElementById("mpCosto");!t||!e||!o||(t.checked?(e.style.display="none",o.style.display="block",n&&(n.style.background="#7c3aed"),a&&(a.style.left="20px"),i&&i.removeAttribute("required"),mpCalcCostoUnidad()):(e.style.display="block",o.style.display="none",n&&(n.style.background="#d1d5db"),a&&(a.style.left="3px"),i&&i.setAttribute("required","")))}window.mpTogglePaquete=mpTogglePaquete;function mpCalcCostoUnidad(){const t=parseFloat(document.getElementById("mpPaqueteCantidad")?.value)||0,e=parseFloat(document.getElementById("mpPaquetePrecio")?.value)||0,o=document.getElementById("mpCostoUnidadResult"),n=document.getElementById("mpCostoCalculado")||document.getElementById("mpCosto");if(t>0&&e>0){const a=e/t;o&&(o.textContent="$"+a.toFixed(4).replace(/\.?0+$/,"")),n&&(n.value=a.toFixed(4));const i=document.getElementById("mpCostoUnidadBox");i&&(i.style.background="#ede9fe")}else o&&(o.textContent="$0.00"),n&&(n.value="")}window.mpCalcCostoUnidad=mpCalcCostoUnidad,window._mpVariantes=window._mpVariantes??[];function mpToggleVariantes(){const t=document.getElementById("mpUsaVariantes"),e=document.getElementById("mpVariantesPanel"),o=document.getElementById("mpVariantesSlider"),n=document.getElementById("mpVariantesThumb"),a=document.getElementById("mpStockRow");if(!t||!e)return;const i=t.checked;if(e.style.display=i?"block":"none",o&&(o.style.background=i?"#6366f1":"#d1d5db"),n&&(n.style.left=i?"20px":"3px"),a){a.style.opacity=i?"0.4":"1";const r=document.getElementById("mpStock");if(r)if(r.readOnly=i,i)r.value=0;else{const d=(window._mpVariantes||[]).reduce((l,s)=>l+(parseInt(s.qty)||0),0);d>0&&(r.value=d)}}i||(window._mpVariantes=[],renderVariantesMp())}window.mpToggleVariantes=mpToggleVariantes;function mpVarTipoRapido(t,e){const o=document.getElementById("mpVarTipo"),n=document.getElementById("mpVarValor");o&&(o.value=t),n&&(e?(n.value=e,agregarVarianteMp()):(n.value="",n.focus()))}window.mpVarTipoRapido=mpVarTipoRapido;function agregarVarianteMp(){const t=(document.getElementById("mpVarTipo")?.value||"").trim(),e=(document.getElementById("mpVarValor")?.value||"").trim();if(!t||!e){manekiToastExport("\u26A0\uFE0F Ingresa tipo y valor de la variante","warn");return}if(window._mpVariantes=window._mpVariantes||[],window._mpVariantes.find(i=>i.type===t&&i.value===e)){manekiToastExport("\u26A0\uFE0F Ya existe esta variante","warn");return}window._mpVariantes.push({type:t,value:e,qty:0});const n=document.getElementById("mpVarTipo"),a=document.getElementById("mpVarValor");n&&(n.value=""),a&&(a.value=""),document.getElementById("mpVarTipo")?.focus(),renderVariantesMp()}window.agregarVarianteMp=agregarVarianteMp;function eliminarVarianteMp(t){(window._mpVariantes||[]).splice(t,1),renderVariantesMp()}window.eliminarVarianteMp=eliminarVarianteMp;function updateVarianteMpQty(t,e){window._mpVariantes&&window._mpVariantes[t]&&(window._mpVariantes[t].qty=Math.max(0,parseInt(e)||0),actualizarStockTotalMp())}window.updateVarianteMpQty=updateVarianteMpQty;function actualizarStockTotalMp(){const t=(window._mpVariantes||[]).reduce((n,a)=>n+(parseInt(a.qty)||0),0),e=document.getElementById("mpVariantesStockTotal");e&&((window._mpVariantes||[]).length>0?(e.style.display="block",e.textContent=`\u{1F4E6} Stock total: ${t} unidades`):e.style.display="none");const o=document.getElementById("mpStock");o&&document.getElementById("mpUsaVariantes")?.checked&&(o.value=t)}function renderVariantesMp(){const t=document.getElementById("mpVariantesList");if(t){if(!window._mpVariantes||!window._mpVariantes.length){t.innerHTML='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>',actualizarStockTotalMp();return}t.innerHTML=window._mpVariantes.map((e,o)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;">
            <div style="flex:1;min-width:0;">
                <span style="font-size:.85rem;color:#374151;">${_esc(e.type)}: ${_mkColorDot(e.type,_esc(e.value))}</span>
            </div>
            <label style="font-size:.75rem;color:#6b7280;font-weight:600;white-space:nowrap;">Stock:</label>
            <div style="display:flex;align-items:center;gap:2px;">
                <button type="button" onclick="updateVarianteMpQty(${o},${(e.qty||0)-1});renderVariantesMp();"
                    style="width:22px;height:22px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${e.qty||0}" min="0"
                    onchange="updateVarianteMpQty(${o},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #6366f1;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVarianteMpQty(${o},${(e.qty||0)+1});renderVariantesMp();"
                    style="width:22px;height:22px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <span style="font-size:.72rem;color:#9ca3af;">pzs</span>
            <button type="button" onclick="eliminarVarianteMp(${o})"
                style="width:24px;height:24px;background:#fee2e2;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;">\u2715</button>
        </div>`).join(""),actualizarStockTotalMp()}}window.renderVariantesMp=renderVariantesMp;
//# sourceMappingURL=inventory-3.js.map
