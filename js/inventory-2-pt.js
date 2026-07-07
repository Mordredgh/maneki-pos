"use strict";function injectPtModal(){const e=document.getElementById("ptModal");e&&e.remove();const t=document.createElement("div");t.id="ptModal",t.className="modal",t.innerHTML=`
    <div style="background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(21,4,50,0.2);max-width:680px;width:100%;margin:auto;max-height:94vh;overflow-y:auto;padding:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 style="font-size:1.4rem;font-weight:800;color:#1a0533;">\u{1F4E6} Nuevo Producto Terminado</h3>
            <button onclick="closePtModal()" style="font-size:1.6rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>

        <form id="ptForm" class="space-y-5" onsubmit="return false;">

            <!-- IMAGEN -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4F7} Imagen del Producto</label>
                <input type="file" id="ptProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;">
                <div id="ptImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="ptPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- GALER\xCDA DE FOTOS -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F5BC}\uFE0F Galer\xEDa de fotos <span style="font-weight:400;color:#9ca3af;">(hasta 20)</span></label>
                    <label style="padding:6px 14px;background:#FFD166;color:#fff;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar fotos
                        <input type="file" id="ptGaleriaInput" accept="image/*" multiple style="display:none;" onchange="ptAgregarFotosGaleria(this.files)">
                    </label>
                </div>
                <div id="ptGaleriaPreview" style="display:flex;flex-wrap:wrap;gap:8px;min-height:48px;">
                    <p id="ptGaleriaVacia" style="font-size:.8rem;color:#9ca3af;width:100%;text-align:center;padding:8px 0;">Sin fotos en galer\xEDa</p>
                </div>
            </div>

            <!-- NOMBRE -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Nombre del Producto *</label>
                <input type="text" id="ptNombre" required placeholder="Ej: Playera Personalizada"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- MATERIAS PRIMAS Y SERVICIOS QUE LO CONFORMAN -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F3ED} Materias Primas y Servicios</label>
                    <button type="button" onclick="abrirSelectorMpPt()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#9669c4,#ab84d1);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                    <div style="font-size:.78rem;font-weight:700;color:#065f46;">\u{1F4CA} Piezas que puedes fabricar ahora:</div>
                    <div id="ptDisponibilidadNum" style="font-size:1.6rem;font-weight:800;color:#059669;line-height:1.2;">0</div>
                    <div id="ptDisponibilidadDetalle" style="font-size:.72rem;color:#6b7280;margin-top:4px;"></div>
                </div>
            </div>

            <!-- SKU -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">C\xF3digo SKU</label>
                <input type="text" id="ptSku" placeholder="Se generar\xE1 autom\xE1ticamente si est\xE1 vac\xEDo"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- CATEGOR\xCDA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categor\xEDa</label>
                <select id="ptCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                </select>
            </div>

            <!-- VARIANTES -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:12px;">\u{1F3A8} Variantes (Opcional)</label>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;">
                    <input type="text" id="ptVarTipo" placeholder="Tipo: Talla, Color..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                    <input type="text" id="ptVarValor" placeholder="Valor: M, Rojo..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVariantePt();}">
                    <button type="button" onclick="agregarVariantePt()"
                        style="padding:10px 14px;background:#FFD166;color:#fff;border:none;border-radius:10px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
                </div>
                <div id="ptVariantsList" style="display:flex;flex-direction:column;gap:6px;">
                    <p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>
                </div>
            </div>

            <!-- TAGS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Tags / Etiquetas</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="ptTagsGrid"></div>
            </div>

            <!-- COSTO y MARGEN -->
            <div style="background:linear-gradient(135deg,#fffbeb,#fef9f0);border:1.5px solid #fde68a;border-radius:14px;padding:16px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4B0} Costo total</label>
                        <div style="position:relative;">
                            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                            <input type="number" id="ptCosto" step="0.01" min="0" value="0"
                                oninput="ptActualizarPrecioSugerido()"
                                style="width:100%;padding:10px 14px 10px 28px;border:1.5px solid #fde68a;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;font-weight:700;">
                        </div>
                        <p id="ptCostoDesglose" style="font-size:.72rem;color:#92400e;margin-top:4px;line-height:1.4;"></p>
                    </div>
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4A1} Margen sugerido</label>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                            ${[30,50,100,150].map(o=>`<button type="button" onclick="ptAplicarMargen(${o})"
                                style="padding:5px 10px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;border:1.5px solid #fde68a;background:#fff;color:#92400e;transition:all .15s;"
                                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fff'">${o}%</button>`).join("")}
                        </div>
                        <div style="display:flex;gap:6px;">
                            <input type="number" id="ptMargenCustom" placeholder="%" min="0" max="999"
                                style="width:70px;padding:6px 10px;border:1.5px solid #fde68a;border-radius:8px;font-size:.85rem;outline:none;">
                            <button type="button" onclick="ptAplicarMargenCustom()"
                                style="padding:6px 12px;background:#FFD166;color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PRECIO DE VENTA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Precio de Venta *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                    <input type="number" id="ptPrecio" required step="0.01" min="0"
                        style="width:100%;padding:12px 16px 12px 28px;border:2px solid #FFD166;border-radius:12px;font-size:1.1rem;font-weight:700;outline:none;box-sizing:border-box;color:#1a0533;"
                        onfocus="this.style.borderColor='#FFDD85'" onblur="this.style.borderColor='#FFD166'">
                </div>
                <div id="ptMargenInfo" style="font-size:.78rem;color:#6b7280;margin-top:6px;"></div>
            </div>

            <!-- RENDIMIENTO POR HOJA (stickers, etc.) -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3AF} Piezas por hoja / unidad de MP <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <input type="number" id="ptRendimientoPorHoja" min="1" placeholder="Ej: 12 (stickers que caben en 1 hoja)"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                <p style="font-size:.72rem;color:#9ca3af;margin-top:5px;">Si vendes por cantidad (ej. 100 stickers), el sistema divide entre este n\xFAmero para calcular cu\xE1ntas hojas descontar del inventario y calcular el costo.</p>
            </div>

            <!-- STOCK M\xCDNIMO -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F514} Stock m\xEDnimo de alerta</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="number" id="ptStockMin" min="0" step="1" value="5"
                        style="width:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                    <span style="font-size:.8rem;color:#6b7280;">Se te notificar\xE1 cuando el stock baje de este n\xFAmero</span>
                </div>
            </div>

            <!-- DESCRIPCI\xD3N PARA WEB -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F310} Descripci\xF3n para tienda online <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <textarea id="ptDescripcionWeb" rows="2" placeholder="Ej: Taza personalizada con foto y nombre, ideal para regalo. Incluye dise\xF1o gratis."
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                <p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">Aparece bajo el nombre del producto en manekistore.com.mx</p>
            </div>

            <!-- OCASIONES -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:10px;">\u{1F389} Ocasiones <span style="font-weight:400;color:#9ca3af;">(para filtrar en tienda)</span></label>
                <div id="ptOcasionesGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${[{id:"cumpleanos",emoji:"\u{1F382}",label:"Cumplea\xF1os"},{id:"san-valentin",emoji:"\u{1F495}",label:"San Valent\xEDn"},{id:"bodas-xv",emoji:"\u{1F48D}",label:"Bodas y XV a\xF1os"},{id:"graduaciones",emoji:"\u{1F393}",label:"Graduaciones"},{id:"empresarial",emoji:"\u{1F3E2}",label:"Empresarial"},{id:"navidad",emoji:"\u{1F384}",label:"Navidad y A\xF1o Nuevo"}].map(o=>`
                        <label id="ptOcLabel_${o.id}" style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:.82rem;font-weight:500;color:#374151;transition:all .15s;">
                            <input type="checkbox" id="ptOc_${o.id}" value="${o.id}" style="accent-color:#FFD166;width:15px;height:15px;cursor:pointer;"
                                onchange="(function(el){var lbl=document.getElementById('ptOcLabel_${o.id}');lbl.style.borderColor=el.checked?'#FFD166':'#e5e7eb';lbl.style.background=el.checked?'#fdf8f0':''})(this)">
                            ${o.emoji} ${o.label}
                        </label>`).join("")}
                </div>
            </div>

            <!-- PUBLICAR EN TIENDA -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1.5px solid #6ee7b7;border-radius:14px;">
                <div>
                    <div style="font-size:.9rem;font-weight:700;color:#065f46;">\u{1F310} Publicar en tienda online</div>
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

            <button type="button" id="ptSubmitBtn" onclick="guardarProductoTerminado()" class="mk-btn-primary" style="width:100%;justify-content:center;padding:16px;font-size:1rem;margin-top:8px;letter-spacing:.02em;">
                <i class="fas fa-check"></i> Agregar Producto
            </button>
        </form>
    </div>`,document.body.appendChild(t),setTimeout(()=>{const o=document.getElementById("ptProductImage");o&&!o._mkBound&&(o._mkBound=!0,o.addEventListener("change",function(d){const l=d.target.files[0];if(!l)return;window.currentProductImageFile=l;const m=new FileReader;m.onload=b=>{const h=document.getElementById("ptPreviewImg"),g=document.getElementById("ptImagePreview");h&&(h.src=b.target.result),g&&g.classList.remove("hidden"),window.currentProductImage=b.target.result},m.readAsDataURL(l)}));const i=document.getElementById("ptPublicarTienda"),n=document.getElementById("ptToggleTrack"),a=document.getElementById("ptToggleThumb");if(i&&n&&a){const d=()=>{n.style.background=i.checked?"#10b981":"#d1d5db",a.style.transform=i.checked?"translateX(22px)":"translateX(0)"};i.addEventListener("change",d),d()}poblarCategoriasPt(),renderTagsPt();const s=document.getElementById("ptPrecio");if(s&&s.addEventListener("input",()=>ptMostrarMargenInfo()),!document.getElementById("ptProveedorNombre")){const d=document.getElementById("ptSubmitBtn");d&&d.insertAdjacentHTML("beforebegin",`
                <div id="ptProveedorSection" style="background:#f0fdf4;border:1.5px solid #6ee7b7;border-radius:14px;padding:16px;">
                    <div style="font-size:.85rem;font-weight:700;color:#065f46;margin-bottom:12px;">\u{1F3ED} Informaci\xF3n del Proveedor <span style="font-weight:400;color:#9ca3af;">(opcional)</span></div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <input type="text" id="ptProveedorNombre" placeholder="Nombre del proveedor"
                            style="width:100%;padding:10px 14px;border:1.5px solid #6ee7b7;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;background:#fff;"
                            onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#6ee7b7'">
                        <textarea id="ptProveedorNotas" rows="2" placeholder="Notas del proveedor (precio referencia, condiciones, etc.)"
                            style="width:100%;padding:10px 14px;border:1.5px solid #6ee7b7;border-radius:10px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;background:#fff;"
                            onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#6ee7b7'"></textarea>
                    </div>
                </div>`)}},80)}window.injectPtModal=injectPtModal;function poblarCategoriasPt(){const e=document.getElementById("ptCategory");if(!e)return;const t=window.categories||[];e.innerHTML=t.map(o=>`<option value="${_esc(o.id)}">${o.emoji||""} ${_esc(o.name)}</option>`).join("")}window.poblarCategoriasPt=poblarCategoriasPt;function renderTagsPt(){const e=document.getElementById("ptTagsGrid");e&&(e.innerHTML=TAGS_PT.map(t=>{const o=(window._ptTagsActuales||[]).includes(t);return`<button type="button" onclick="toggleTagPt('${t}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${o?"#FFD166":"#e5e7eb"};background:${o?"#FFF9F0":"#fff"};color:${o?"#92400e":"#6b7280"};">
            ${t}</button>`}).join(""))}window.renderTagsPt=renderTagsPt;function toggleTagPt(e){window._ptTagsActuales=window._ptTagsActuales||[];const t=window._ptTagsActuales.indexOf(e);t>-1?window._ptTagsActuales.splice(t,1):window._ptTagsActuales.push(e),renderTagsPt()}window.toggleTagPt=toggleTagPt;function poblarCategoriasPv(){const e=document.getElementById("pvCategory");if(!e)return;const o=(window.categories||[]).map(i=>`<option value="${_esc(i.id)}">${i.emoji||""} ${_esc(i.name)}</option>`).join("");e.innerHTML='<option value="">Sin categor\xEDa</option>'+o}window.poblarCategoriasPv=poblarCategoriasPv;function renderTagsPv(){const e=document.getElementById("pvTagsGrid");e&&(e.innerHTML=TAGS_PT.map(t=>{const o=(window._pvTagsActuales||[]).includes(t);return`<button type="button" onclick="toggleTagPv('${t}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${o?"#9669c4":"#e5e7eb"};background:${o?"#f5f3ff":"#fff"};color:${o?"#9669c4":"#6b7280"};">
            ${t}</button>`}).join(""))}window.renderTagsPv=renderTagsPv;function toggleTagPv(e){window._pvTagsActuales=window._pvTagsActuales||[];const t=window._pvTagsActuales.indexOf(e);t>-1?window._pvTagsActuales.splice(t,1):window._pvTagsActuales.push(e),renderTagsPv()}window.toggleTagPv=toggleTagPv;function agregarVariantePt(){const e=(document.getElementById("ptVarTipo")?.value||"").trim(),t=(document.getElementById("ptVarValor")?.value||"").trim();if(!e||!t){manekiToastExport("\u26A0\uFE0F Ingresa tipo y valor de la variante","warn");return}if(window._ptVariants=window._ptVariants||[],window._ptVariants.some(i=>i.type===e&&i.value===t)){manekiToastExport(`\u26A0\uFE0F La variante ${e}: ${t} ya existe`,"warn");return}window._ptVariants.push({type:e,value:t,qty:0}),document.getElementById("ptVarTipo")&&(document.getElementById("ptVarTipo").value=""),document.getElementById("ptVarValor")&&(document.getElementById("ptVarValor").value=""),renderVariantsListPt(),document.getElementById("ptVarTipo")?.focus()}window.agregarVariantePt=agregarVariantePt;function eliminarVariantePt(e){(window._ptVariants||[]).splice(e,1),renderVariantsListPt()}window.eliminarVariantePt=eliminarVariantePt;function updateVariantQtyPt(e,t){window._ptVariants&&window._ptVariants[e]&&(window._ptVariants[e].qty=Math.max(0,parseInt(t)||0))}window.updateVariantQtyPt=updateVariantQtyPt;function renderVariantsListPt(){window.currentVariants=window._ptVariants||[];const e=document.getElementById("ptVariantsList");if(e){if(!window._ptVariants||!window._ptVariants.length){e.innerHTML='<p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>';return}e.innerHTML=window._ptVariants.map((t,o)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;">
            <span style="flex:1;font-size:.85rem;color:#374151;">${_esc(t.type)}: ${_mkColorDot(t.type,_esc(t.value))}</span>
            <div style="display:flex;align-items:center;gap:4px;">
                <button type="button" onclick="updateVariantQtyPt(${o},${(t.qty||0)-1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${t.qty||0}" min="0" onchange="updateVariantQtyPt(${o},this.value)"
                    style="width:46px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVariantQtyPt(${o},${(t.qty||0)+1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="eliminarVariantePt(${o})"
                style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\u2715</button>
        </div>`).join("")}}window.renderVariantsListPt=renderVariantsListPt;function abrirSelectorMpPt(){const e=document.getElementById("ptMpSelector");e&&(e.style.display=e.style.display==="none"?"block":"none",e.style.display==="block"&&(filtrarMpSelector(),document.getElementById("ptMpSearch")?.focus()))}window.abrirSelectorMpPt=abrirSelectorMpPt;function filtrarMpSelector(){const e=(document.getElementById("ptMpSearch")?.value||"").toLowerCase(),t=(window.products||[]).filter(n=>n.tipo==="materia_prima"||n.tipo==="servicio"),o=document.getElementById("ptMpResults");if(!o)return;const i=e?t.filter(n=>(n.name||"").toLowerCase().includes(e)):t;if(!i.length){o.innerHTML='<p style="font-size:.8rem;color:#9ca3af;padding:8px;">No hay materias primas ni servicios registrados</p>';return}o.innerHTML=i.map(n=>{const a=(window._ptMpComponentes||[]).some(m=>String(m.id)===String(n.id)),s=n.tipo==="servicio",d=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.4rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${n.image||(s?"\u2699\uFE0F":"\u{1F3ED}")}</span>`,l=s?`<div style="font-size:.72rem;color:#7d4fa3;font-weight:600;">\u2699\uFE0F Servicio \xB7 $${Number(n.cost||0).toFixed(2)}/uso</div>`:`<div style="font-size:.72rem;color:#6b7280;">Stock: ${n.stock||0} \xB7 Costo: $${Number(n.cost||0).toFixed(2)}</div>`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${a?"#f0fdf4":"#fff"};border:1.5px solid ${a?"#6ee7b7":"#e5e7eb"};cursor:pointer;transition:all .1s;"
            onclick="seleccionarMpPt('${String(n.id).replace(/'/g,"\\'")}')">
            ${d}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(n.name)}</div>
                ${l}
            </div>
            <span style="font-size:.78rem;font-weight:700;color:${a?"#059669":"#9669c4"};">${a?"\u2713 Agregado":"+ Agregar"}</span>
        </div>`}).join("")}window.filtrarMpSelector=filtrarMpSelector;function seleccionarMpPt(e){const t=(window.products||[]).find(i=>String(i.id)===String(e)&&(i.tipo==="materia_prima"||i.tipo==="servicio"));if(!t)return;if(window._ptMpComponentes=window._ptMpComponentes||[],window._ptMpComponentes.find(i=>String(i.id)===String(e))){manekiToastExport(`"${t.name}" ya fue agregado`,"warn");return}if(window._ptMpComponentes.push({id:t.id,nombre:t.name,imageUrl:t.imageUrl||null,imagen:t.image||"\u{1F3ED}",qty:1,costUnit:Number(t.cost||0)}),Array.isArray(t.variants)&&t.variants.length>0){window._ptVariants=window._ptVariants||[];let i=0;t.variants.forEach(n=>{const a=n.type||n.tipo||"",s=n.value||n.valor||"";if(!a||!s)return;window._ptVariants.some(l=>(l.type||l.tipo)===a&&(l.value||l.valor)===s)||(window._ptVariants.push({type:a,value:s,qty:n.qty||0}),i++)}),i>0&&(renderVariantsListPt(),manekiToastExport(`\u2705 Se importaron ${i} variante(s) de "${t.name}"`,"ok"))}renderPtMpList(),recalcularCostoPt(),filtrarMpSelector()}window.seleccionarMpPt=seleccionarMpPt;function quitarMpPt(e){(window._ptMpComponentes||[]).splice(e,1),renderPtMpList(),recalcularCostoPt()}window.quitarMpPt=quitarMpPt;function updateMpQtyPt(e,t){window._ptMpComponentes&&window._ptMpComponentes[e]&&(window._ptMpComponentes[e].qty=Math.max(.01,parseFloat(t)||1),recalcularCostoPt())}window.updateMpQtyPt=updateMpQtyPt;function renderPtMpList(){const e=document.getElementById("ptMpList");if(!e)return;const t=window._ptMpComponentes||[];if(!t.length){e.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas agregadas</p>',document.getElementById("ptDisponibilidadBox")&&(document.getElementById("ptDisponibilidadBox").style.display="none");return}e.innerHTML=t.map((o,i)=>{const n=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.nombre||o.name||"")}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;flex-shrink:0;">`:`<span style="font-size:1.4rem;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${o.imagen||"\u{1F3ED}"}</span>`,a=(o.qty*o.costUnit).toFixed(2);return`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;">
            ${n}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(o.nombre)}</div>
                <div style="font-size:.72rem;color:#6b7280;">$${o.costUnit.toFixed(2)}/ud \xB7 Subtotal: <b style="color:#92400e;">$${a}</b></div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                <button type="button" onclick="updateMpQtyPt(${i},${(o.qty||1)-1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${o.qty}" min="0.01" step="0.01" onchange="updateMpQtyPt(${i},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:3px 4px;font-size:.85rem;font-weight:700;">
                <button type="button" onclick="updateMpQtyPt(${i},${(o.qty||1)+1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="quitarMpPt(${i})"
                style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u2715</button>
        </div>`}).join(""),calcularDisponibilidadPt()}window.renderPtMpList=renderPtMpList;function recalcularCostoPt(){const e=window._ptMpComponentes||[],t=e.reduce((n,a)=>n+a.qty*a.costUnit,0),o=document.getElementById("ptCosto");o&&(o.value=t.toFixed(2));const i=document.getElementById("ptCostoDesglose");i&&e.length?i.textContent=e.map(n=>`${n.nombre} \xD7${n.qty} = $${(n.qty*n.costUnit).toFixed(2)}`).join(" \xB7 "):i&&(i.textContent=""),ptMostrarMargenInfo(),calcularDisponibilidadPt()}window.recalcularCostoPt=recalcularCostoPt;function calcularDisponibilidadPt(){const e=window._ptMpComponentes||[],t=document.getElementById("ptDisponibilidadBox"),o=document.getElementById("ptDisponibilidadNum"),i=document.getElementById("ptDisponibilidadDetalle");if(!t||!e.length){t&&(t.style.display="none");return}t.style.display="block";let n=1/0;const a=e.map(s=>{const d=(window.products||[]).find(b=>String(b.id)===String(s.id));if(d&&d.tipo==="servicio")return`${s.nombre}: \u2699\uFE0F servicio (sin l\xEDmite de stock)`;const l=d&&d.stock||0,m=s.qty>0?Math.floor(l/s.qty):0;return m<n&&(n=m),`${s.nombre}: ${l} uds \xF7 ${s.qty} = ${m} piezas`});isFinite(n)||(n=0),o&&(o.textContent=n,o.style.color=n>0?"#059669":"#ef4444"),i&&(i.innerHTML=a.join("<br>"))}window.calcularDisponibilidadPt=calcularDisponibilidadPt;function ptAplicarMargen(e){const t=parseFloat(document.getElementById("ptCosto")?.value||0)||0;if(!t){manekiToastExport("\u26A0\uFE0F Define el costo primero","warn");return}const o=t*(1+e/100),i=document.getElementById("ptPrecio");i&&(i.value=o.toFixed(2),ptMostrarMargenInfo())}window.ptAplicarMargen=ptAplicarMargen;function ptAplicarMargenCustom(){const e=parseFloat(document.getElementById("ptMargenCustom")?.value||0);!e||e<=0||ptAplicarMargen(e)}window.ptAplicarMargenCustom=ptAplicarMargenCustom;function ptActualizarPrecioSugerido(){ptMostrarMargenInfo()}window.ptActualizarPrecioSugerido=ptActualizarPrecioSugerido;function ptMostrarMargenInfo(){const e=parseFloat(document.getElementById("ptCosto")?.value||0)||0,t=parseFloat(document.getElementById("ptPrecio")?.value||0)||0,o=document.getElementById("ptMargenInfo");if(!o)return;if(!e||!t){o.textContent="";return}const i=((t-e)/t*100).toFixed(1),n=(t-e).toFixed(2),a=parseFloat(i)>=40?"#059669":parseFloat(i)>=20?"#d97706":"#ef4444";o.innerHTML=`<span style="color:${a};font-weight:700;">${i}% de margen</span> \xB7 Ganancia por pieza: <b style="color:${a};">$${n}</b>`}window.ptMostrarMargenInfo=ptMostrarMargenInfo;async function guardarProductoTerminado(){const e=p=>{const u=document.getElementById(p);return u?u.value:""},t=e("ptNombre").trim(),o=e("ptSku").trim(),i=e("ptCategory"),n=parseFloat(e("ptCosto"))||0,a=parseFloat(e("ptPrecio"))||0,s=parseInt(e("ptStockMin"))||5,d=parseFloat(e("ptRendimientoPorHoja"))||0,l=e("ptProveedorNombre").trim(),m=e("ptProveedorNotas").trim();if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("ptNombre")?.focus();return}if(!a||a<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("ptPrecio")?.focus();return}if(a<n){manekiToastExport("\u26A0\uFE0F El precio no puede ser menor al costo","warn"),document.getElementById("ptPrecio")?.focus();return}const b=window.modoEdicion?window.edicionProductoId:null,h=(window.products||[]).find(p=>(p.name||"").trim().toLowerCase()===t.toLowerCase()&&String(p.id)!==String(b));if(h){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${h.name}". Usa un nombre diferente o edita el existente.`,"warn"),document.getElementById("ptNombre")?.focus();return}if(typeof _fuzzyMatch=="function"){const p=(window.products||[]).find(u=>{if(String(u.id)===String(b))return!1;const c=t.toLowerCase(),f=(u.name||"").toLowerCase();if(c===f)return!1;const x=Math.max(c.length,f.length);return x<4?!1:typeof window._levenshtein=="function"?1-window._levenshtein(c,f)/x>=.8:!1});p&&manekiToastExport(`\u26A0\uFE0F Nombre similar a "${p.name}" ya existente. Si es diferente, contin\xFAa guardando.`,"warn")}if(o&&!skuEsUnico(o,b)){manekiToastExport(`\u26A0\uFE0F El SKU "${o}" ya est\xE1 en uso`,"warn");return}let g=n;const M=window._ptMpComponentes||[];if(g===0)if(M.length>0){const p=M.reduce((u,c)=>{const f=(window.products||[]).find(x=>String(x.id)===String(c.id));return u+(c.qty||0)*(f&&f.cost?f.cost:c.costUnit||0)},0);if(p>0&&await showConfirm(`El costo calculado basado en materias primas es $${p.toFixed(2)}. \xBFDeseas usarlo como costo del producto?`)){g=p;const c=document.getElementById("ptCosto");c&&(c.value=g.toFixed(2))}}else manekiToastExport("\u26A0\uFE0F El costo del producto est\xE1 en $0. Considera agregar un costo.","warn");const k=document.getElementById("ptSubmitBtn"),I=typeof btnLoading=="function"?btnLoading(k):()=>{};k&&(k.disabled=!0);try{if(window.currentProductImageFile){manekiToastExport("\u23F3 Subiendo imagen principal...","ok");const r=await subirImagenStorage(window.currentProductImageFile).catch(()=>null);r?window.currentProductImage=r:manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen principal. Intenta de nuevo.","warn"),window.currentProductImageFile=null}const p=window._ptGaleriaFiles||[];if(p.length>0){manekiToastExport(`\u23F3 Subiendo ${p.length} foto(s) de galer\xEDa...`,"ok");const r=await Promise.all(p.map(v=>subirImagenStorage(v).catch(()=>null))),y=r.filter(Boolean),w=r.filter(v=>v===null).length;w>0&&manekiToastExport(`\u26A0\uFE0F ${w} foto(s) de galer\xEDa no se pudieron subir.`,"warn"),window._ptGaleriaUrls=[...window._ptGaleriaUrls||[],...y],window._ptGaleriaFiles=[]}const u=[...window._ptGaleriaUrls||[]],c=document.getElementById("ptPublicarTienda")?.checked??!1,f=document.getElementById("ptDescripcionWeb")?.value?.trim()||"",x=["cumpleanos","san-valentin","bodas-xv","graduaciones","empresarial","navidad"].filter(r=>document.getElementById(`ptOc_${r}`)?.checked),P=(window.categories||[]).find(r=>r.id===i),T=o||generateSKU(i),z=[...window._ptTagsActuales||[]],$=[...window._ptMpComponentes||[]];if(window.currentVariants=[...window._ptVariants||[]],window.modoEdicion&&window.edicionProductoId!==null){const r=(window.products||[]).findIndex(F=>String(F.id)===String(window.edicionProductoId));if(r===-1){manekiToastExport("Error: producto no encontrado","err");return}const y=window.products[r].stock,w=window.products[r],v=w.price,C=w.cost,S=w.historialPrecios||[];(v!==a||C!==g)&&S.push({fecha:new Date().toISOString(),precioAntes:v,costoAntes:C,precioNuevo:a,costoNuevo:g}),window.products[r]=Object.assign({},window.products[r],{name:t,category:i,tipo:c?"producto":"producto_interno",cost:g,price:a,stockMin:s,tags:z,sku:T,mpComponentes:$,publicarTienda:c,descripcionWeb:f,ocasiones:x,image:P?P.emoji:window.products[r].image,imageUrl:window.currentProductImage||window.products[r].imageUrl,imageUrls:u.length>0?u:window.products[r].imageUrls||[],variants:[...window.currentVariants],historialPrecios:S,rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:m,movimientos:window.products[r].movimientos||[]}),syncStockFromVariants(window.products[r]);const E=getStockEfectivo(window.products[r]);E!==y&&registrarMovimiento({productoId:window.edicionProductoId,productoNombre:t,tipo:"ajuste",cantidad:E-y,motivo:"Edici\xF3n",stockAntes:y,stockDespues:E});const _=E-y;_!==0&&(window.products[r].movimientos=window.products[r].movimientos||[],window.products[r].movimientos.unshift({id:Date.now(),fecha:_fechaHoy(),delta:_,stockResultante:E,motivo:"Edici\xF3n manual",usuario:"local"}),window.products[r].movimientos.length>30&&(window.products[r].movimientos=window.products[r].movimientos.slice(0,30))),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),I(!0),typeof window._mkModalSaved=="function"&&window._mkModalSaved("ptModal"),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto actualizado","ok")}else{const r={id:_genId(),name:t,category:i,tipo:c?"producto":"producto_interno",cost:g,price:a,stock:0,stockMin:s,tags:z,sku:T,mpComponentes:$,publicarTienda:c,descripcionWeb:f,ocasiones:x,image:P?P.emoji:"\u{1F4E6}",imageUrl:window.currentProductImage||null,imageUrls:u,variants:[...window.currentVariants],rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:m,movimientos:[]};syncStockFromVariants(r),window.products.push(r),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),I(!0),typeof window._mkModalSaved=="function"&&window._mkModalSaved("ptModal"),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto agregado exitosamente","ok")}}finally{k&&(k.disabled=!1)}}window.guardarProductoTerminado=guardarProductoTerminado;
//# sourceMappingURL=inventory-2-pt.js.map
