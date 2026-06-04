function injectPtModal(){const o=document.getElementById("ptModal");o&&o.remove();const e=document.createElement("div");e.id="ptModal",e.className="modal",e.innerHTML=`
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
                    <label style="padding:6px 14px;background:#C5A572;color:#fff;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- MATERIAS PRIMAS Y SERVICIOS QUE LO CONFORMAN -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F3ED} Materias Primas y Servicios</label>
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
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
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
                            ${[30,50,100,150].map(t=>`<button type="button" onclick="ptAplicarMargen(${t})"
                                style="padding:5px 10px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;border:1.5px solid #fde68a;background:#fff;color:#92400e;transition:all .15s;"
                                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fff'">${t}%</button>`).join("")}
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
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Precio de Venta *</label>
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
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3AF} Piezas por hoja / unidad de MP <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <input type="number" id="ptRendimientoPorHoja" min="1" placeholder="Ej: 12 (stickers que caben en 1 hoja)"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                <p style="font-size:.72rem;color:#9ca3af;margin-top:5px;">Si vendes por cantidad (ej. 100 stickers), el sistema divide entre este n\xFAmero para calcular cu\xE1ntas hojas descontar del inventario y calcular el costo.</p>
            </div>

            <!-- STOCK M\xCDNIMO -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F514} Stock m\xEDnimo de alerta</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="number" id="ptStockMin" min="0" step="1" value="5"
                        style="width:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                    <span style="font-size:.8rem;color:#6b7280;">Se te notificar\xE1 cuando el stock baje de este n\xFAmero</span>
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

            <button type="button" id="ptSubmitBtn" onclick="guardarProductoTerminado()"
                style="width:100%;padding:16px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:8px;letter-spacing:.02em;">
                \u2705 Agregar Producto
            </button>
        </form>
    </div>`,document.body.appendChild(e),setTimeout(()=>{const t=document.getElementById("ptProductImage");t&&!t._mkBound&&(t._mkBound=!0,t.addEventListener("change",function(d){const l=d.target.files[0];if(!l)return;window.currentProductImageFile=l;const c=new FileReader;c.onload=u=>{const x=document.getElementById("ptPreviewImg"),g=document.getElementById("ptImagePreview");x&&(x.src=u.target.result),g&&g.classList.remove("hidden"),window.currentProductImage=u.target.result},c.readAsDataURL(l)}));const i=document.getElementById("ptPublicarTienda"),n=document.getElementById("ptToggleTrack"),r=document.getElementById("ptToggleThumb");if(i&&n&&r){const d=()=>{n.style.background=i.checked?"#10b981":"#d1d5db",r.style.transform=i.checked?"translateX(22px)":"translateX(0)"};i.addEventListener("change",d),d()}poblarCategoriasPt(),renderTagsPt();const a=document.getElementById("ptPrecio");if(a&&a.addEventListener("input",()=>ptMostrarMargenInfo()),!document.getElementById("ptProveedorNombre")){const d=document.getElementById("ptSubmitBtn");d&&d.insertAdjacentHTML("beforebegin",`
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
                </div>`)}},80)}window.injectPtModal=injectPtModal;function poblarCategoriasPt(){const o=document.getElementById("ptCategory");if(!o)return;const e=window.categories||[];o.innerHTML=e.map(t=>`<option value="${_esc(t.id)}">${t.emoji||""} ${_esc(t.name)}</option>`).join("")}window.poblarCategoriasPt=poblarCategoriasPt;function renderTagsPt(){const o=document.getElementById("ptTagsGrid");o&&(o.innerHTML=TAGS_PT.map(e=>{const t=(window._ptTagsActuales||[]).includes(e);return`<button type="button" onclick="toggleTagPt('${e}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${t?"#C5A572":"#e5e7eb"};background:${t?"#FFF9F0":"#fff"};color:${t?"#92400e":"#6b7280"};">
            ${e}</button>`}).join(""))}window.renderTagsPt=renderTagsPt;function toggleTagPt(o){window._ptTagsActuales=window._ptTagsActuales||[];const e=window._ptTagsActuales.indexOf(o);e>-1?window._ptTagsActuales.splice(e,1):window._ptTagsActuales.push(o),renderTagsPt()}window.toggleTagPt=toggleTagPt;function poblarCategoriasPv(){const o=document.getElementById("pvCategory");if(!o)return;const t=(window.categories||[]).map(i=>`<option value="${_esc(i.id)}">${i.emoji||""} ${_esc(i.name)}</option>`).join("");o.innerHTML='<option value="">Sin categor\xEDa</option>'+t}window.poblarCategoriasPv=poblarCategoriasPv;function renderTagsPv(){const o=document.getElementById("pvTagsGrid");o&&(o.innerHTML=TAGS_PT.map(e=>{const t=(window._pvTagsActuales||[]).includes(e);return`<button type="button" onclick="toggleTagPv('${e}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${t?"#7c3aed":"#e5e7eb"};background:${t?"#f5f3ff":"#fff"};color:${t?"#7c3aed":"#6b7280"};">
            ${e}</button>`}).join(""))}window.renderTagsPv=renderTagsPv;function toggleTagPv(o){window._pvTagsActuales=window._pvTagsActuales||[];const e=window._pvTagsActuales.indexOf(o);e>-1?window._pvTagsActuales.splice(e,1):window._pvTagsActuales.push(o),renderTagsPv()}window.toggleTagPv=toggleTagPv;function agregarVariantePt(){const o=(document.getElementById("ptVarTipo")?.value||"").trim(),e=(document.getElementById("ptVarValor")?.value||"").trim();if(!o||!e){manekiToastExport("\u26A0\uFE0F Ingresa tipo y valor de la variante","warn");return}if(window._ptVariants=window._ptVariants||[],window._ptVariants.some(i=>i.type===o&&i.value===e)){manekiToastExport(`\u26A0\uFE0F La variante ${o}: ${e} ya existe`,"warn");return}window._ptVariants.push({type:o,value:e,qty:0}),document.getElementById("ptVarTipo")&&(document.getElementById("ptVarTipo").value=""),document.getElementById("ptVarValor")&&(document.getElementById("ptVarValor").value=""),renderVariantsListPt(),document.getElementById("ptVarTipo")?.focus()}window.agregarVariantePt=agregarVariantePt;function eliminarVariantePt(o){(window._ptVariants||[]).splice(o,1),renderVariantsListPt()}window.eliminarVariantePt=eliminarVariantePt;function updateVariantQtyPt(o,e){window._ptVariants&&window._ptVariants[o]&&(window._ptVariants[o].qty=Math.max(0,parseInt(e)||0))}window.updateVariantQtyPt=updateVariantQtyPt;function renderVariantsListPt(){window.currentVariants=window._ptVariants||[];const o=document.getElementById("ptVariantsList");if(o){if(!window._ptVariants||!window._ptVariants.length){o.innerHTML='<p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>';return}o.innerHTML=window._ptVariants.map((e,t)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;">
            <span style="flex:1;font-size:.85rem;color:#374151;">${_esc(e.type)}: ${_mkColorDot(e.type,_esc(e.value))}</span>
            <div style="display:flex;align-items:center;gap:4px;">
                <button type="button" onclick="updateVariantQtyPt(${t},${(e.qty||0)-1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${e.qty||0}" min="0" onchange="updateVariantQtyPt(${t},this.value)"
                    style="width:46px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVariantQtyPt(${t},${(e.qty||0)+1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="eliminarVariantePt(${t})"
                style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\u2715</button>
        </div>`).join("")}}window.renderVariantsListPt=renderVariantsListPt;function abrirSelectorMpPt(){const o=document.getElementById("ptMpSelector");o&&(o.style.display=o.style.display==="none"?"block":"none",o.style.display==="block"&&(filtrarMpSelector(),document.getElementById("ptMpSearch")?.focus()))}window.abrirSelectorMpPt=abrirSelectorMpPt;function filtrarMpSelector(){const o=(document.getElementById("ptMpSearch")?.value||"").toLowerCase(),e=(window.products||[]).filter(n=>n.tipo==="materia_prima"||n.tipo==="servicio"),t=document.getElementById("ptMpResults");if(!t)return;const i=o?e.filter(n=>(n.name||"").toLowerCase().includes(o)):e;if(!i.length){t.innerHTML='<p style="font-size:.8rem;color:#9ca3af;padding:8px;">No hay materias primas ni servicios registrados</p>';return}t.innerHTML=i.map(n=>{const r=(window._ptMpComponentes||[]).some(c=>String(c.id)===String(n.id)),a=n.tipo==="servicio",d=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.4rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${n.image||(a?"\u2699\uFE0F":"\u{1F3ED}")}</span>`,l=a?`<div style="font-size:.72rem;color:#6d28d9;font-weight:600;">\u2699\uFE0F Servicio \xB7 $${Number(n.cost||0).toFixed(2)}/uso</div>`:`<div style="font-size:.72rem;color:#6b7280;">Stock: ${n.stock||0} \xB7 Costo: $${Number(n.cost||0).toFixed(2)}</div>`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${r?"#f0fdf4":"#fff"};border:1.5px solid ${r?"#6ee7b7":"#e5e7eb"};cursor:pointer;transition:all .1s;"
            onclick="seleccionarMpPt('${String(n.id).replace(/'/g,"\\'")}')">
            ${d}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(n.name)}</div>
                ${l}
            </div>
            <span style="font-size:.78rem;font-weight:700;color:${r?"#059669":"#7c3aed"};">${r?"\u2713 Agregado":"+ Agregar"}</span>
        </div>`}).join("")}window.filtrarMpSelector=filtrarMpSelector;function seleccionarMpPt(o){const e=(window.products||[]).find(i=>String(i.id)===String(o)&&(i.tipo==="materia_prima"||i.tipo==="servicio"));if(!e)return;if(window._ptMpComponentes=window._ptMpComponentes||[],window._ptMpComponentes.find(i=>String(i.id)===String(o))){manekiToastExport(`"${e.name}" ya fue agregado`,"warn");return}if(window._ptMpComponentes.push({id:e.id,nombre:e.name,imageUrl:e.imageUrl||null,imagen:e.image||"\u{1F3ED}",qty:1,costUnit:Number(e.cost||0)}),Array.isArray(e.variants)&&e.variants.length>0){window._ptVariants=window._ptVariants||[];let i=0;e.variants.forEach(n=>{const r=n.type||n.tipo||"",a=n.value||n.valor||"";if(!r||!a)return;window._ptVariants.some(l=>(l.type||l.tipo)===r&&(l.value||l.valor)===a)||(window._ptVariants.push({type:r,value:a,qty:n.qty||0}),i++)}),i>0&&(renderVariantsListPt(),manekiToastExport(`\u2705 Se importaron ${i} variante(s) de "${e.name}"`,"ok"))}renderPtMpList(),recalcularCostoPt(),filtrarMpSelector()}window.seleccionarMpPt=seleccionarMpPt;function quitarMpPt(o){(window._ptMpComponentes||[]).splice(o,1),renderPtMpList(),recalcularCostoPt()}window.quitarMpPt=quitarMpPt;function updateMpQtyPt(o,e){window._ptMpComponentes&&window._ptMpComponentes[o]&&(window._ptMpComponentes[o].qty=Math.max(.01,parseFloat(e)||1),recalcularCostoPt())}window.updateMpQtyPt=updateMpQtyPt;function renderPtMpList(){const o=document.getElementById("ptMpList");if(!o)return;const e=window._ptMpComponentes||[];if(!e.length){o.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas agregadas</p>',document.getElementById("ptDisponibilidadBox")&&(document.getElementById("ptDisponibilidadBox").style.display="none");return}o.innerHTML=e.map((t,i)=>{const n=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.nombre||t.name||"")}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;flex-shrink:0;">`:`<span style="font-size:1.4rem;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${t.imagen||"\u{1F3ED}"}</span>`,r=(t.qty*t.costUnit).toFixed(2);return`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;">
            ${n}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(t.nombre)}</div>
                <div style="font-size:.72rem;color:#6b7280;">$${t.costUnit.toFixed(2)}/ud \xB7 Subtotal: <b style="color:#92400e;">$${r}</b></div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                <button type="button" onclick="updateMpQtyPt(${i},${(t.qty||1)-1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${t.qty}" min="0.01" step="0.01" onchange="updateMpQtyPt(${i},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:3px 4px;font-size:.85rem;font-weight:700;">
                <button type="button" onclick="updateMpQtyPt(${i},${(t.qty||1)+1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="quitarMpPt(${i})"
                style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u2715</button>
        </div>`}).join(""),calcularDisponibilidadPt()}window.renderPtMpList=renderPtMpList;function recalcularCostoPt(){const o=window._ptMpComponentes||[],e=o.reduce((n,r)=>n+r.qty*r.costUnit,0),t=document.getElementById("ptCosto");t&&(t.value=e.toFixed(2));const i=document.getElementById("ptCostoDesglose");i&&o.length?i.textContent=o.map(n=>`${n.nombre} \xD7${n.qty} = $${(n.qty*n.costUnit).toFixed(2)}`).join(" \xB7 "):i&&(i.textContent=""),ptMostrarMargenInfo(),calcularDisponibilidadPt()}window.recalcularCostoPt=recalcularCostoPt;function calcularDisponibilidadPt(){const o=window._ptMpComponentes||[],e=document.getElementById("ptDisponibilidadBox"),t=document.getElementById("ptDisponibilidadNum"),i=document.getElementById("ptDisponibilidadDetalle");if(!e||!o.length){e&&(e.style.display="none");return}e.style.display="block";let n=1/0;const r=o.map(a=>{const d=(window.products||[]).find(u=>String(u.id)===String(a.id));if(d&&d.tipo==="servicio")return`${a.nombre}: \u2699\uFE0F servicio (sin l\xEDmite de stock)`;const l=d&&d.stock||0,c=a.qty>0?Math.floor(l/a.qty):0;return c<n&&(n=c),`${a.nombre}: ${l} uds \xF7 ${a.qty} = ${c} piezas`});isFinite(n)||(n=0),t&&(t.textContent=n,t.style.color=n>0?"#059669":"#ef4444"),i&&(i.innerHTML=r.join("<br>"))}window.calcularDisponibilidadPt=calcularDisponibilidadPt;function ptAplicarMargen(o){const e=parseFloat(document.getElementById("ptCosto")?.value||0)||0;if(!e){manekiToastExport("\u26A0\uFE0F Define el costo primero","warn");return}const t=e*(1+o/100),i=document.getElementById("ptPrecio");i&&(i.value=t.toFixed(2),ptMostrarMargenInfo())}window.ptAplicarMargen=ptAplicarMargen;function ptAplicarMargenCustom(){const o=parseFloat(document.getElementById("ptMargenCustom")?.value||0);!o||o<=0||ptAplicarMargen(o)}window.ptAplicarMargenCustom=ptAplicarMargenCustom;function ptActualizarPrecioSugerido(){ptMostrarMargenInfo()}window.ptActualizarPrecioSugerido=ptActualizarPrecioSugerido;function ptMostrarMargenInfo(){const o=parseFloat(document.getElementById("ptCosto")?.value||0)||0,e=parseFloat(document.getElementById("ptPrecio")?.value||0)||0,t=document.getElementById("ptMargenInfo");if(!t)return;if(!o||!e){t.textContent="";return}const i=((e-o)/e*100).toFixed(1),n=(e-o).toFixed(2),r=parseFloat(i)>=40?"#059669":parseFloat(i)>=20?"#d97706":"#ef4444";t.innerHTML=`<span style="color:${r};font-weight:700;">${i}% de margen</span> \xB7 Ganancia por pieza: <b style="color:${r};">$${n}</b>`}window.ptMostrarMargenInfo=ptMostrarMargenInfo;async function guardarProductoTerminado(){const o=s=>{const m=document.getElementById(s);return m?m.value:""},e=o("ptNombre").trim(),t=o("ptSku").trim(),i=o("ptCategory"),n=parseFloat(o("ptCosto"))||0,r=parseFloat(o("ptPrecio"))||0,a=parseInt(o("ptStockMin"))||5,d=parseFloat(o("ptRendimientoPorHoja"))||0,l=o("ptProveedorNombre").trim(),c=o("ptProveedorNotas").trim();if(!e){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("ptNombre")?.focus();return}if(!r||r<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("ptPrecio")?.focus();return}if(r<n){manekiToastExport("\u26A0\uFE0F El precio no puede ser menor al costo","warn"),document.getElementById("ptPrecio")?.focus();return}const u=window.modoEdicion?window.edicionProductoId:null,x=(window.products||[]).find(s=>(s.name||"").trim().toLowerCase()===e.toLowerCase()&&String(s.id)!==String(u));if(x){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${x.name}". Usa un nombre diferente o edita el existente.`,"warn"),document.getElementById("ptNombre")?.focus();return}if(t&&!skuEsUnico(t,u)){manekiToastExport(`\u26A0\uFE0F El SKU "${t}" ya est\xE1 en uso`,"warn");return}let g=n;const w=window._ptMpComponentes||[];if(g===0)if(w.length>0){const s=w.reduce((m,y)=>{const v=(window.products||[]).find(C=>String(C.id)===String(y.id));return m+(y.qty||0)*(v&&v.cost?v.cost:y.costUnit||0)},0);if(s>0&&await showConfirm(`El costo calculado basado en materias primas es $${s.toFixed(2)}. \xBFDeseas usarlo como costo del producto?`)){g=s;const y=document.getElementById("ptCosto");y&&(y.value=g.toFixed(2))}}else manekiToastExport("\u26A0\uFE0F El costo del producto est\xE1 en $0. Considera agregar un costo.","warn");const f=document.getElementById("ptSubmitBtn"),b=typeof btnLoading=="function"?btnLoading(f):()=>{};f&&(f.disabled=!0);try{if(window.currentProductImageFile){manekiToastExport("\u23F3 Subiendo imagen principal...","ok");const p=await subirImagenStorage(window.currentProductImageFile).catch(()=>null);p?window.currentProductImage=p:manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen principal. Intenta de nuevo.","warn"),window.currentProductImageFile=null}const s=window._ptGaleriaFiles||[];if(s.length>0){manekiToastExport(`\u23F3 Subiendo ${s.length} foto(s) de galer\xEDa...`,"ok");const p=await Promise.all(s.map(P=>subirImagenStorage(P).catch(()=>null))),h=p.filter(Boolean),k=p.filter(P=>P===null).length;k>0&&manekiToastExport(`\u26A0\uFE0F ${k} foto(s) de galer\xEDa no se pudieron subir.`,"warn"),window._ptGaleriaUrls=[...window._ptGaleriaUrls||[],...h],window._ptGaleriaFiles=[]}const m=[...window._ptGaleriaUrls||[]],y=document.getElementById("ptPublicarTienda")?.checked??!1,v=(window.categories||[]).find(p=>p.id===i),C=t||generateSKU(i),E=[...window._ptTagsActuales||[]],I=[...window._ptMpComponentes||[]];if(window.currentVariants=[...window._ptVariants||[]],window.modoEdicion&&window.edicionProductoId!==null){const p=(window.products||[]).findIndex(_=>String(_.id)===String(window.edicionProductoId));if(p===-1){manekiToastExport("Error: producto no encontrado","err");return}const h=window.products[p].stock,k=window.products[p],P=k.price,S=k.cost,z=k.historialPrecios||[];(P!==r||S!==g)&&z.push({fecha:new Date().toISOString(),precioAntes:P,costoAntes:S,precioNuevo:r,costoNuevo:g}),window.products[p]=Object.assign({},window.products[p],{name:e,category:i,tipo:y?"producto":"producto_interno",cost:g,price:r,stockMin:a,tags:E,sku:C,mpComponentes:I,publicarTienda:y,image:v?v.emoji:window.products[p].image,imageUrl:window.currentProductImage||window.products[p].imageUrl,imageUrls:m.length>0?m:window.products[p].imageUrls||[],variants:[...window.currentVariants],historialPrecios:z,rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:c,movimientos:window.products[p].movimientos||[]}),syncStockFromVariants(window.products[p]);const M=getStockEfectivo(window.products[p]);M!==h&&registrarMovimiento({productoId:window.edicionProductoId,productoNombre:e,tipo:"ajuste",cantidad:M-h,motivo:"Edici\xF3n",stockAntes:h,stockDespues:M});const T=M-h;T!==0&&(window.products[p].movimientos=window.products[p].movimientos||[],window.products[p].movimientos.unshift({id:Date.now(),fecha:_fechaHoy(),delta:T,stockResultante:M,motivo:"Edici\xF3n manual",usuario:"local"}),window.products[p].movimientos.length>30&&(window.products[p].movimientos=window.products[p].movimientos.slice(0,30))),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),b(!0),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto actualizado","ok")}else{const p={id:_genId(),name:e,category:i,tipo:y?"producto":"producto_interno",cost:g,price:r,stock:0,stockMin:a,tags:E,sku:C,mpComponentes:I,publicarTienda:y,image:v?v.emoji:"\u{1F4E6}",imageUrl:window.currentProductImage||null,imageUrls:m,variants:[...window.currentVariants],rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:c,movimientos:[]};syncStockFromVariants(p),window.products.push(p),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),b(!0),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto agregado exitosamente","ok")}}finally{f&&(f.disabled=!1)}}window.guardarProductoTerminado=guardarProductoTerminado;const TAGS_MATERIA_PRIMA=["Acr\xEDlico","Filamento","Tintas","Cuadro","Metales","Empaques","Vasos","Textil","Peluches","Otros"];window._mpTagsActuales=window._mpTagsActuales??[];function openAddMateriaPrimaModal(){window.modoEdicion=!1,window.edicionProductoId=null,window.currentProductImage=null,window.currentProductImageFile=null,window._mpTagsActuales=[];const o=document.getElementById("mpForm");o&&o.reset();const e=document.getElementById("mpImagePreview");e&&e.classList.add("hidden"),renderMpTags();const t=document.querySelector("#mpModal h3");t&&(t.textContent="\u{1F3ED} Nueva Materia Prima");const i=document.getElementById("mpSubmitBtn");i&&(i.textContent="\u2705 Guardar Materia Prima"),typeof openModal=="function"&&openModal("mpModal")}window.openAddMateriaPrimaModal=openAddMateriaPrimaModal,window._packComponentes=window._packComponentes??[];function injectPackModal(){const o=document.getElementById("packModal");o&&o.remove();const e=document.createElement("div");e.id="packModal",e.className="modal",e.innerHTML=`
    <div style="background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(21,4,50,0.2);max-width:640px;width:100%;margin:auto;max-height:94vh;overflow-y:auto;padding:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 id="packModalTitle" style="font-size:1.4rem;font-weight:800;color:#1a0533;">\u{1F381} Nuevo Pack</h3>
            <button onclick="closePackModal()" style="font-size:1.6rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;">\xD7</button>
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
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F4E6} Productos en el Pack</label>
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
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F3ED} Materias Primas Adicionales</label>
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
                    ${[30,40,50,60].map(t=>`<button type="button" onclick="packAplicarMargen(${t})"
                        style="padding:4px 12px;border:1.5px solid #fde68a;border-radius:8px;background:#fffbeb;color:#92400e;font-size:.78rem;font-weight:700;cursor:pointer;">+${t}%</button>`).join("")}
                </div>
            </div>

            <!-- SKU y CATEGOR\xCDA opcionales -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">SKU (opcional)</label>
                    <input type="text" id="packSku" placeholder="Auto-generado"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">Categor\xEDa (opcional)</label>
                    <select id="packCategory"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;background:#fff;">
                        <option value="">Sin categor\xEDa</option>
                    </select>
                </div>
            </div>

            <!-- FOTO DEL PACK -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4F7} Foto del Pack (opcional)</label>
                <input type="file" id="packImageInput" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;box-sizing:border-box;cursor:pointer;"
                    onchange="packHandlePhoto(this)">
                <div id="packImagePreview" style="display:none;margin-top:10px;text-align:center;">
                    <img id="packImagePreviewImg" src="" style="max-width:160px;max-height:160px;border-radius:12px;object-fit:cover;border:1.5px solid #e5e7eb;">
                    <button type="button" onclick="packQuitarFoto()" style="display:block;margin:6px auto 0;font-size:.75rem;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:700;">\u2715 Quitar foto</button>
                </div>
            </div>

            <button type="button" id="packSubmitBtn" onclick="guardarPack()"
                style="width:100%;padding:14px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:.02em;">
                \u2705 Guardar Pack
            </button>
        </form>
    </div>`,document.body.appendChild(e)}window.injectPackModal=injectPackModal;function openPackModal(o){injectPackModal(),window._packModoEdicion=!1,window._packEdicionId=null,window._packComponentes=[],window._packMpDirectos=[],window._packImageFile=null,window._packImageUrl=null;const e=document.getElementById("packCategory");if(e&&(window.categories||[]).forEach(t=>{const i=document.createElement("option");i.value=t.id,i.textContent=`${t.emoji||""} ${t.name}`,e.appendChild(i)}),o){const t=(window.products||[]).find(i=>String(i.id)===String(o)&&i.tipo==="pack");if(t){window._packModoEdicion=!0,window._packEdicionId=o,window._packComponentes=JSON.parse(JSON.stringify(t.packComponentes||[])),window._packMpDirectos=JSON.parse(JSON.stringify(t.packMpDirectos||[])),document.getElementById("packNombre").value=t.name||"",document.getElementById("packPrecio").value=t.price||"",document.getElementById("packSku").value=t.sku||"",e&&(e.value=t.category||"");const i=document.getElementById("packModalTitle");i&&(i.textContent="\u270F\uFE0F Editar Pack");const n=document.getElementById("packSubmitBtn");if(n&&(n.textContent="\u2705 Actualizar Pack"),t.imageUrl){window._packImageUrl=t.imageUrl;const r=document.getElementById("packImagePreview"),a=document.getElementById("packImagePreviewImg");r&&(r.style.display="block"),a&&(a.src=t.imageUrl)}}}packRenderComponentes(),packRenderMpDirectos(),packMostrarMargen(),typeof openModal=="function"&&openModal("packModal")}window.openPackModal=openPackModal;function closePackModal(){typeof closeModal=="function"&&closeModal("packModal")}window.closePackModal=closePackModal;function packHandlePhoto(o){const e=o.files[0];if(!e)return;window._packImageFile=e;const t=new FileReader;t.onload=i=>{const n=document.getElementById("packImagePreviewImg"),r=document.getElementById("packImagePreview");n&&(n.src=i.target.result),r&&(r.style.display="block")},t.readAsDataURL(e)}window.packHandlePhoto=packHandlePhoto;function packQuitarFoto(){window._packImageFile=null,window._packImageUrl=null;const o=document.getElementById("packImagePreview"),e=document.getElementById("packImageInput");o&&(o.style.display="none"),e&&(e.value="")}window.packQuitarFoto=packQuitarFoto;function packAbrirSelectorPT(){const o=document.getElementById("packPtSelector");if(!o)return;const e=o.style.display!=="none";if(o.style.display=e?"none":"block",!e){const t=document.getElementById("packPtSearch");t&&(t.value="",t.focus()),packFiltrarPT()}}window.packAbrirSelectorPT=packAbrirSelectorPT;function packFiltrarPT(){const o=(document.getElementById("packPtSearch")?.value||"").toLowerCase(),e=(window._packComponentes||[]).map(n=>String(n.productoId)),t=(window.products||[]).filter(n=>(n.tipo==="producto"||n.tipo==="producto_interno")&&!e.includes(String(n.id))&&(!o||(n.name||"").toLowerCase().includes(o))),i=document.getElementById("packPtResults");if(i){if(!t.length){i.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>';return}i.innerHTML=t.map(n=>{const r=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.2rem;">${n.image||"\u{1F4E6}"}</span>`;return`<div onclick="packSeleccionarPT('${String(n.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='#fff'">
            ${r}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(n.name)}</div>
                <div style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(n.cost||0).toFixed(2)}</div>
            </div>
            <span style="font-size:11px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`}).join("")}}window.packFiltrarPT=packFiltrarPT;function packSeleccionarPT(o){const e=(window.products||[]).find(i=>String(i.id)===String(o));if(!e||(window._packComponentes=window._packComponentes||[],window._packComponentes.find(i=>String(i.productoId)===String(o))))return;window._packComponentes.push({productoId:String(o),nombre:e.name,costoOriginal:Number(e.cost)||0,costoCustom:Number(e.cost)||0,qty:1});const t=document.getElementById("packPtSelector");t&&(t.style.display="none"),packRenderComponentes()}window.packSeleccionarPT=packSeleccionarPT;function packQuitarComponente(o){window._packComponentes=(window._packComponentes||[]).filter(e=>String(e.productoId)!==String(o)),packRenderComponentes()}window.packQuitarComponente=packQuitarComponente;function packActualizarCosto(o,e){const t=(window._packComponentes||[]).find(i=>String(i.productoId)===String(o));t&&(t.costoCustom=parseFloat(e)||0),packRecalcularCosto(),packMostrarMargen()}window.packActualizarCosto=packActualizarCosto;function packActualizarQty(o,e){const t=(window._packComponentes||[]).find(i=>String(i.productoId)===String(o));t&&(t.qty=Math.max(1,parseInt(e)||1)),packRenderComponentes()}window.packActualizarQty=packActualizarQty;function packRenderComponentes(){const o=document.getElementById("packComponentesList"),e=document.getElementById("packSinComponentes");if(!o)return;const t=window._packComponentes||[];if(!t.length){o.innerHTML='<p id="packSinComponentes" style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin productos agregados</p>',packRecalcularCosto();return}o.innerHTML=t.map(i=>{const n=(window.products||[]).find(a=>String(a.id)===String(i.productoId));return`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:12px;background:#fff;">
            ${n?.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n?.name||"")}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`:`<span style="font-size:1.3rem;">${n?.image||"\u{1F4E6}"}</span>`}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(i.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(i.costoOriginal).toFixed(2)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="1" value="${i.qty}"
                        onchange="packActualizarQty('${i.productoId}', this.value)"
                        style="width:46px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(i.costoCustom).toFixed(2)}"
                            onchange="packActualizarCosto('${i.productoId}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #fde68a;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#fde68a'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarComponente('${i.productoId}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\xD7</button>
            </div>
        </div>`}).join(""),packRecalcularCosto()}window.packRenderComponentes=packRenderComponentes;function packAbrirSelectorMP(){const o=document.getElementById("packMpSelector");if(!o)return;const e=o.style.display!=="none";if(o.style.display=e?"none":"block",!e){const t=document.getElementById("packMpSearch");t&&(t.value="",t.focus()),packFiltrarMP()}}window.packAbrirSelectorMP=packAbrirSelectorMP;function packFiltrarMP(){const o=(document.getElementById("packMpSearch")?.value||"").toLowerCase(),e=(window._packMpDirectos||[]).map(n=>String(n.id)),t=(window.products||[]).filter(n=>(n.tipo==="materia_prima"||n.tipo==="servicio")&&!e.includes(String(n.id))&&(!o||(n.name||"").toLowerCase().includes(o))),i=document.getElementById("packMpResults");if(i){if(!t.length){i.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>';return}i.innerHTML=t.map(n=>{const r=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.2rem;">${n.image||"\u{1F3ED}"}</span>`,a=n.tipo==="servicio"?'<span style="font-size:10px;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:99px;">Servicio</span>':'<span style="font-size:10px;background:#f0fdf4;color:#15803d;padding:1px 6px;border-radius:99px;">MP</span>';return`<div onclick="packSeleccionarMP('${String(n.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#fff'">
            ${r}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(n.name)}</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">${a}<span style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(n.cost||0).toFixed(2)} / ${_esc(n.unidad||"pza")}</span></div>
            </div>
            <span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`}).join("")}}window.packFiltrarMP=packFiltrarMP;function packSeleccionarMP(o){const e=(window.products||[]).find(i=>String(i.id)===String(o));if(!e||(window._packMpDirectos=window._packMpDirectos||[],window._packMpDirectos.find(i=>String(i.id)===String(o))))return;window._packMpDirectos.push({id:String(o),nombre:e.name,imagen:e.image||"\u{1F3ED}",imageUrl:e.imageUrl||null,unidad:e.unidad||"pza",costoOriginal:Number(e.cost)||0,costoCustom:Number(e.cost)||0,qty:1});const t=document.getElementById("packMpSelector");t&&(t.style.display="none"),packRenderMpDirectos()}window.packSeleccionarMP=packSeleccionarMP;function packQuitarMP(o){window._packMpDirectos=(window._packMpDirectos||[]).filter(e=>String(e.id)!==String(o)),packRenderMpDirectos()}window.packQuitarMP=packQuitarMP;function packActualizarCostoMP(o,e){const t=(window._packMpDirectos||[]).find(i=>String(i.id)===String(o));t&&(t.costoCustom=parseFloat(e)||0),packRecalcularCosto(),packMostrarMargen()}window.packActualizarCostoMP=packActualizarCostoMP;function packActualizarQtyMP(o,e){const t=(window._packMpDirectos||[]).find(i=>String(i.id)===String(o));t&&(t.qty=Math.max(.001,parseFloat(e)||1)),packRenderMpDirectos()}window.packActualizarQtyMP=packActualizarQtyMP;function packRenderMpDirectos(){const o=document.getElementById("packMpDirectosList");if(!o)return;const e=window._packMpDirectos||[];if(!e.length){o.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas adicionales</p>',packRecalcularCosto();return}o.innerHTML=e.map(t=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e9d5ff;border-radius:12px;background:#faf5ff;">
            ${t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||t.nombre||"")}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`:`<span style="font-size:1.3rem;">${t.imagen||"\u{1F3ED}"}</span>`}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(t.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(t.costoOriginal).toFixed(2)} / ${_esc(t.unidad||"pza")}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="0.001" step="0.001" value="${t.qty}"
                        onchange="packActualizarQtyMP('${t.id}', this.value)"
                        style="width:54px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(t.costoCustom).toFixed(2)}"
                            onchange="packActualizarCostoMP('${t.id}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#ddd6fe'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarMP('${t.id}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\xD7</button>
            </div>
        </div>`).join(""),packRecalcularCosto()}window.packRenderMpDirectos=packRenderMpDirectos;function packRecalcularCosto(){const o=window._packComponentes||[],e=window._packMpDirectos||[],t=o.reduce((d,l)=>d+(Number(l.costoCustom)||0)*(Number(l.qty)||1),0),i=e.reduce((d,l)=>d+(Number(l.costoCustom)||0)*(Number(l.qty)||1),0),n=t+i,r=document.getElementById("packCostoDisplay"),a=document.getElementById("packCosto");r&&(r.textContent=`$${n.toFixed(2)}`),a&&(a.value=n.toFixed(2)),packMostrarMargen()}window.packRecalcularCosto=packRecalcularCosto;function packMostrarMargen(){const o=parseFloat(document.getElementById("packCosto")?.value||0)||0,e=parseFloat(document.getElementById("packPrecio")?.value||0)||0,t=document.getElementById("packMargenInfo");if(!t)return;if(!o||!e){t.textContent="";return}const i=((e-o)/e*100).toFixed(1),n=(e-o).toFixed(2),r=parseFloat(i)>=40?"#059669":parseFloat(i)>=20?"#d97706":"#ef4444";t.innerHTML=`<span style="color:${r};font-weight:700;">${i}% de margen</span> \xB7 Ganancia: <b style="color:${r};">$${n}</b>`}window.packMostrarMargen=packMostrarMargen;function packAplicarMargen(o){const e=parseFloat(document.getElementById("packCosto")?.value||0)||0;if(!e){manekiToastExport("\u26A0\uFE0F Define los componentes primero","warn");return}const t=e*(1+o/100),i=document.getElementById("packPrecio");i&&(i.value=t.toFixed(2),packMostrarMargen())}window.packAplicarMargen=packAplicarMargen;function flattenPackMpComponentes(o,e){const t={};return(o||[]).forEach(i=>{const n=(window.products||[]).find(r=>String(r.id)===String(i.productoId));!n||!n.mpComponentes||!n.mpComponentes.length||n.mpComponentes.forEach(r=>{const a=String(r.id),d=(r.qty||0)*(i.qty||1);t[a]?t[a]={...t[a],qty:t[a].qty+d}:t[a]={...r,qty:d}})}),(e||[]).forEach(i=>{const n=String(i.id),r=i.qty||1;t[n]?t[n]={...t[n],qty:t[n].qty+r}:t[n]={id:i.id,nombre:i.nombre,imagen:i.imagen,imageUrl:i.imageUrl||null,qty:r,costUnit:i.costoCustom||i.costoOriginal||0}}),Object.values(t)}window.flattenPackMpComponentes=flattenPackMpComponentes;async function guardarPack(){const o=(document.getElementById("packNombre")?.value||"").trim(),e=parseFloat(document.getElementById("packPrecio")?.value||0)||0,t=parseFloat(document.getElementById("packCosto")?.value||0)||0,i=(document.getElementById("packSku")?.value||"").trim(),n=document.getElementById("packCategory")?.value||"",r=window._packComponentes||[],a=window._packMpDirectos||[];if(!o){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("packNombre")?.focus();return}if(r.length+a.length<2){manekiToastExport("\u26A0\uFE0F Un pack necesita al menos 2 componentes en total","warn");return}if(!e||e<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("packPrecio")?.focus();return}if(e<=t){manekiToastExport("\u26A0\uFE0F El precio debe ser mayor al costo","warn"),document.getElementById("packPrecio")?.focus();return}const d=window._packModoEdicion?window._packEdicionId:null,l=(window.products||[]).find(u=>(u.name||"").trim().toLowerCase()===o.toLowerCase()&&String(u.id)!==String(d));if(l){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${l.name}"`,"warn");return}if(i&&!skuEsUnico(i,d)){manekiToastExport(`\u26A0\uFE0F El SKU "${i}" ya est\xE1 en uso`,"warn");return}const c=document.getElementById("packSubmitBtn");c&&(c.disabled=!0);try{let u=window._packImageUrl||null;if(window._packImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const f=await subirImagenStorage(window._packImageFile).catch(()=>null);f&&(u=f),window._packImageFile=null}const x=i||generateSKU(n),g=(window.categories||[]).find(f=>f.id===n),w=flattenPackMpComponentes(r,a);if(window._packModoEdicion&&window._packEdicionId){const f=(window.products||[]).findIndex(m=>String(m.id)===String(window._packEdicionId));if(f===-1){manekiToastExport("Error: pack no encontrado","err");return}const b=window.products[f],s=b.historialPrecios||[];(b.price!==e||b.cost!==t)&&s.push({fecha:new Date().toISOString(),precioAntes:b.price,costoAntes:b.cost,precioNuevo:e,costoNuevo:t}),window.products[f]=Object.assign({},b,{name:o,price:e,cost:t,sku:x,category:n,image:g?g.emoji:"\u{1F381}",imageUrl:u,tipo:"pack",packComponentes:JSON.parse(JSON.stringify(r)),packMpDirectos:JSON.parse(JSON.stringify(a)),mpComponentes:w,historialPrecios:s}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closePackModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Pack actualizado","ok")}else{const f={id:_genId(),name:o,tipo:"pack",price:e,cost:t,stock:0,stockMin:2,sku:x,category:n,image:g?g.emoji:"\u{1F381}",imageUrl:u,imageUrls:[],tags:[],variants:[],publicarTienda:!1,packComponentes:JSON.parse(JSON.stringify(r)),packMpDirectos:JSON.parse(JSON.stringify(a)),mpComponentes:w,historialPrecios:[]};window.products.push(f),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closePackModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Pack creado exitosamente","ok")}}finally{c&&(c.disabled=!1)}}window.guardarPack=guardarPack,window._pvMpComponentes=[],window._pvTablaPreciosVariable=[];function injectVariableProductModal(){const o=document.getElementById("pvModal");o&&o.remove();const e=document.createElement("div");e.id="pvModal",e.className="modal",e.innerHTML=`
    <div class="modal-content" style="max-width:580px;max-height:90vh;overflow-y:auto;border-radius:20px;padding:28px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:1.3rem;font-weight:800;color:#1a0533;">\u{1F3A8} Producto Variable</h3>
            <button onclick="closeModal('pvModal')" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>
        <form id="pvForm" onsubmit="guardarProductoVariable(event)" style="display:flex;flex-direction:column;gap:16px;">
            <input type="hidden" id="pvEditId" value="">

            <!-- IMAGEN -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4F7} Imagen del Producto</label>
                <input type="file" id="pvProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;box-sizing:border-box;">
                <div id="pvImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="pvPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- Nombre -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4DD} Nombre del producto *</label>
                <input type="text" id="pvNombre" required placeholder="Ej: Stickers 5x5 cm, Tarjetas de presentaci\xF3n"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
            </div>

            <!-- Rendimiento por hoja -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F3AF} Piezas por hoja / unidad de MP</label>
                <input type="number" id="pvRendimiento" min="1" placeholder="Ej: 12 (cu\xE1ntas piezas caben en 1 hoja)"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
                <p class="text-xs text-gray-400 mt-1">El sistema dividir\xE1 la cantidad del pedido entre este n\xFAmero para calcular hojas a descontar.</p>
            </div>

            <!-- Materias primas -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <label class="text-sm font-semibold text-gray-700">\u{1F3ED} Materias Primas y Servicios</label>
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
                    <label class="text-sm font-semibold text-gray-700">\u{1F4B0} Tabla de precios por cantidad</label>
                    <button type="button" onclick="pvAgregarRangoPrecio()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:#059669;">+ Agregar rango</button>
                </div>
                <p class="text-xs text-gray-400 mb-2">Si el cliente pide una cantidad que no est\xE1 exacta, se usa el precio del rango inferior m\xE1s cercano.</p>
                <div id="pvTablaPreciosList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>

            <!-- SKU -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">C\xF3digo SKU <span class="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" id="pvSku" placeholder="Se genera autom\xE1ticamente si lo dejas vac\xEDo"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm">
            </div>

            <!-- CATEGOR\xCDA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categor\xEDa</label>
                <select id="pvCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                    <option value="">Sin categor\xEDa</option>
                </select>
            </div>

            <!-- TAGS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Tags / Etiquetas</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="pvTagsGrid"></div>
            </div>

            <!-- NOTAS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4CB} Notas internas <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <textarea id="pvNotas" rows="2" placeholder="Especificaciones, materiales, observaciones..."
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
            </div>

            <button type="submit" id="pvSubmitBtn"
                class="w-full py-3 rounded-xl text-white font-bold text-base mt-2"
                style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                \u2705 Guardar Producto Variable
            </button>
        </form>
    </div>`,document.body.appendChild(e)}window.injectVariableProductModal=injectVariableProductModal;function pvFiltrarMP(o){const e=document.getElementById("pvMpSuggestions");if(!e)return;const t=(window.products||[]).filter(i=>i.tipo==="materia_prima"||i.tipo==="servicio").filter(i=>!o||(i.name||"").toLowerCase().includes(o.toLowerCase()));if(!t.length){e.style.display="none";return}e.style.display="block",e.innerHTML=t.slice(0,8).map(i=>`<div onclick="pvSeleccionarMP('${i.id}')"
            style="padding:8px 12px;cursor:pointer;font-size:.85rem;border-bottom:1px solid #f3f4f6;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background=''">
            ${_esc(i.name||"")} <span style="color:#9ca3af;font-size:.75rem;">$${Number(i.cost||0).toFixed(2)}/ud</span>
        </div>`).join("")}window.pvFiltrarMP=pvFiltrarMP;function pvSeleccionarMP(o){const e=(window.products||[]).find(t=>String(t.id)===String(o));if(e){if((window._pvMpComponentes||[]).find(t=>String(t.id)===String(o))){manekiToastExport("Ya est\xE1 agregado","warn");return}window._pvMpComponentes.push({id:e.id,name:e.name,qty:1,costUnit:e.cost||0}),document.getElementById("pvBuscarMP").value="",document.getElementById("pvMpSuggestions").style.display="none",pvRenderMpList()}}window.pvSeleccionarMP=pvSeleccionarMP;function pvAgregarComponente(){const o=document.getElementById("pvBuscarMP");o&&(o.focus(),pvFiltrarMP(o.value||""))}window.pvAgregarComponente=pvAgregarComponente;function pvRenderMpList(){const o=document.getElementById("pvMpList");if(!o)return;const e=window._pvMpComponentes||[];if(!e.length){o.innerHTML='<p class="text-xs text-gray-400">Sin componentes a\xFAn.</p>';return}const t=e.reduce((i,n)=>i+(parseFloat(n.costUnit)||0)*(parseFloat(n.qty)||1),0);o.innerHTML=e.map((i,n)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f5f3ff;border-radius:10px;font-size:.82rem;">
            <span style="flex:1;font-weight:600;color:#4c1d95;">${_esc(i.name||"")}</span>
            <span style="color:#9ca3af;">qty:</span>
            <input type="number" min="0.01" step="0.01" value="${i.qty}"
                onchange="pvEditarQtyComp(${n}, this.value)"
                style="width:50px;padding:3px 6px;border:1px solid #ddd6fe;border-radius:6px;text-align:center;font-size:.8rem;">
            <span style="color:#7c3aed;font-weight:600;min-width:55px;text-align:right;">$${((parseFloat(i.costUnit)||0)*(parseFloat(i.qty)||1)).toFixed(2)}</span>
            <button onclick="pvQuitarComp(${n})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">\u2715</button>
        </div>`).join("")+`<div style="text-align:right;font-size:.78rem;color:#7c3aed;font-weight:700;padding:4px 10px 0;">Costo por hoja: $${t.toFixed(2)}</div>`}window.pvRenderMpList=pvRenderMpList;function pvEditarQtyComp(o,e){window._pvMpComponentes[o]&&(window._pvMpComponentes[o].qty=parseFloat(e)||1),pvRenderMpList()}window.pvEditarQtyComp=pvEditarQtyComp;function pvQuitarComp(o){window._pvMpComponentes.splice(o,1),pvRenderMpList()}window.pvQuitarComp=pvQuitarComp;function pvAgregarRangoPrecio(){window._pvTablaPreciosVariable||(window._pvTablaPreciosVariable=[]),window._pvTablaPreciosVariable.push({cantidadMin:"",precio:""}),pvRenderTablaPreciosList()}window.pvAgregarRangoPrecio=pvAgregarRangoPrecio;function pvRenderTablaPreciosList(){const o=document.getElementById("pvTablaPreciosList");if(!o)return;const e=window._pvTablaPreciosVariable||[];if(!e.length){o.innerHTML='<p class="text-xs text-gray-400">Sin rangos. Agrega al menos uno.</p>';return}o.innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;margin-bottom:4px;padding:0 4px;">
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Cantidad m\xEDnima</span>
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Precio total ($)</span>
            <span style="font-size:.72rem;font-weight:700;color:#0369a1;">$/pieza</span>
            <span></span>
        </div>`+e.map((t,i)=>{const n=t.cantidadMin>0&&t.precio>0?(t.precio/t.cantidadMin).toFixed(2):"\u2014";return`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
            <input type="number" min="1" placeholder="Ej: 10" value="${t.cantidadMin}"
                onchange="pvEditarRango(${i},'cantidadMin',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-center">
            <input type="number" min="0" step="0.01" placeholder="Ej: 50.00" value="${t.precio}"
                onchange="pvEditarRango(${i},'precio',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none text-center"
                style="color:#059669;font-weight:600;">
            <span style="font-size:.85rem;font-weight:700;color:#0369a1;text-align:center;padding:8px 4px;background:#e0f2fe;border-radius:8px;">$${n}</span>
            <button onclick="pvQuitarRango(${i})"
                style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;padding:0 4px;">\u2715</button>
        </div>`}).join("")}window.pvRenderTablaPreciosList=pvRenderTablaPreciosList;function pvEditarRango(o,e,t){window._pvTablaPreciosVariable[o]&&(window._pvTablaPreciosVariable[o][e]=e==="cantidadMin"?parseInt(t)||0:parseFloat(t)||0)}window.pvEditarRango=pvEditarRango;function pvQuitarRango(o){window._pvTablaPreciosVariable.splice(o,1),pvRenderTablaPreciosList()}window.pvQuitarRango=pvQuitarRango;function openVariableProductModal(o){if(injectVariableProductModal(),window._pvMpComponentes=[],window._pvTablaPreciosVariable=[],window._pvTagsActuales=[],window._pvProductImage=null,window._pvProductImageFile=null,setTimeout(()=>{const e=document.getElementById("pvProductImage");e&&!e._mkBound&&(e._mkBound=!0,e.addEventListener("change",function(t){const i=t.target.files[0];if(!i)return;window._pvProductImageFile=i;const n=new FileReader;n.onload=r=>{const a=document.getElementById("pvPreviewImg"),d=document.getElementById("pvImagePreview");a&&(a.src=r.target.result),d&&d.classList.remove("hidden"),window._pvProductImage=r.target.result},n.readAsDataURL(i)})),poblarCategoriasPv(),renderTagsPv()},80),o){const e=(window.products||[]).find(t=>String(t.id)===String(o));e&&(window._pvMpComponentes=(e.mpComponentes||[]).map(t=>({...t})),window._pvTablaPreciosVariable=(e.tablaPreciosVariable||[]).map(t=>({...t})),window._pvTagsActuales=[...e.tags||[]],window._pvProductImage=e.imageUrl||null,setTimeout(()=>{const t=(a,d)=>{const l=document.getElementById(a);l&&(l.value=d??"")};t("pvNombre",e.name),t("pvSku",e.sku||""),t("pvRendimiento",e.rendimientoPorHoja||""),t("pvEditId",o),t("pvNotas",e.notas||"");const i=document.getElementById("pvCategory");if(i&&e.category&&(i.value=e.category),e.imageUrl){const a=document.getElementById("pvPreviewImg"),d=document.getElementById("pvImagePreview");a&&(a.src=e.imageUrl),d&&d.classList.remove("hidden")}pvRenderMpList(),pvRenderTablaPreciosList(),renderTagsPv();const n=document.querySelector("#pvModal h3");n&&(n.textContent="\u{1F3A8} Editar Producto Variable");const r=document.getElementById("pvSubmitBtn");r&&(r.textContent="\u{1F4BE} Guardar Cambios")},80))}else setTimeout(()=>{pvRenderMpList(),pvRenderTablaPreciosList()},80);openModal("pvModal")}window.openVariableProductModal=openVariableProductModal;async function guardarProductoVariable(o){o&&o.preventDefault();const e=s=>{const m=document.getElementById(s);return m?m.value:""},t=e("pvNombre").trim(),i=e("pvSku").trim(),n=parseFloat(e("pvRendimiento"))||0,r=e("pvEditId"),a=e("pvCategory")||"",d=e("pvNotas").trim(),l=[...window._pvTagsActuales||[]];if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn");return}const c=(window._pvTablaPreciosVariable||[]).filter(s=>s.cantidadMin>0&&s.precio>0);if(!c.length){manekiToastExport("\u26A0\uFE0F Agrega al menos un rango de precio","warn");return}const u=document.getElementById("pvSubmitBtn");u&&(u.disabled=!0,u.textContent="\u23F3 Guardando...");const x=()=>{u&&(u.disabled=!1,u.textContent=r?"\u{1F4BE} Guardar Cambios":"\u2705 Guardar Producto Variable")};let g=window._pvProductImage||"";if(window._pvProductImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const s=await subirImagenStorage(window._pvProductImageFile).catch(()=>null);s&&(g=s),window._pvProductImageFile=null}c.sort((s,m)=>s.cantidadMin-m.cantidadMin);const w=(window._pvMpComponentes||[]).map(s=>({...s})),f=w.reduce((s,m)=>s+(parseFloat(m.costUnit)||0)*(parseFloat(m.qty)||1),0),b=i||"PV-"+mkId().split("-")[0].toUpperCase();if(r){const s=(window.products||[]).findIndex(m=>String(m.id)===String(r));if(s===-1){manekiToastExport("Producto no encontrado","err"),x();return}window.products[s]=Object.assign({},window.products[s],{name:t,tipo:"producto_variable",sku:b,rendimientoPorHoja:n,mpComponentes:w,tablaPreciosVariable:c,cost:f,price:c[c.length-1].precio,category:a,tags:l,notas:d,imageUrl:g||window.products[s].imageUrl||""}),manekiToastExport("\u2705 Producto variable actualizado","ok")}else{const s={id:_genId(),name:t,tipo:"producto_variable",sku:b,rendimientoPorHoja:n,mpComponentes:w,tablaPreciosVariable:c,cost:f,price:c[c.length-1].precio,stock:0,image:"\u{1F3A8}",category:a,tags:l,notas:d,imageUrl:g};window.products.unshift(s),manekiToastExport("\u2705 Producto variable creado","ok")}x(),saveProducts(),renderInventoryTable(),closeModal("pvModal")}window.guardarProductoVariable=guardarProductoVariable;function pvGetPrecio(o,e){const t=(o.tablaPreciosVariable||[]).slice().sort((r,a)=>r.cantidadMin-a.cantidadMin);if(!t.length)return 0;let i=t[0];for(const r of t)if(e>=r.cantidadMin)i=r;else break;const n=i.cantidadMin||1;return i.precio/n}window.pvGetPrecio=pvGetPrecio;function verMovimientosProducto(o){const e=(window.products||[]).find(a=>String(a.id)===String(o));if(!e)return;e.movimientos||(e.movimientos=[]);const t=(e.movimientos||[]).slice(0,5),i=document.getElementById("_mkMovimientosModal");i&&i.remove();const n=t.length?t.map(a=>{const d=a.delta>0?"#059669":"#dc2626",l=a.delta>0?"#d1fae5":"#fee2e2",c=a.delta>0?"+":"";return`<tr>
            <td style="padding:6px 10px;font-size:.8rem;color:#6b7280;">${_esc(a.fecha||"\u2014")}</td>
            <td style="padding:6px 10px;text-align:center;">
                <span style="background:${l};color:${d};font-weight:700;padding:2px 10px;border-radius:8px;font-size:.8rem;">${c}${a.delta}</span>
            </td>
            <td style="padding:6px 10px;text-align:center;font-size:.8rem;font-weight:600;color:#374151;">${a.stockResultante}</td>
            <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${_esc(a.motivo||"\u2014")}</td>
        </tr>`}).join(""):'<tr><td colspan="4" style="padding:14px;text-align:center;font-size:.8rem;color:#9ca3af;">Sin movimientos registrados</td></tr>',r=document.createElement("div");r.id="_mkMovimientosModal",r.style.cssText="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);",r.innerHTML=`
    <div style="background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,0.2);max-width:560px;width:95%;padding:24px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <div style="font-size:1.05rem;font-weight:800;color:#1a0533;">\u{1F4CB} \xDAltimos movimientos de stock</div>
                <div style="font-size:.78rem;color:#9ca3af;margin-top:2px;">${_esc(e.name)}</div>
            </div>
            <button onclick="document.getElementById('_mkMovimientosModal').remove()"
                style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;line-height:1;">\xD7</button>
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
            <tbody>${n}</tbody>
        </table>
        ${t.length===0||(e.movimientos||[]).length<=5?"":`<p style="font-size:.72rem;color:#9ca3af;text-align:center;margin-top:10px;">Mostrando los \xFAltimos 5 de ${(e.movimientos||[]).length} movimientos</p>`}
    </div>`,document.body.appendChild(r),r.addEventListener("click",function(a){a.target===r&&r.remove()})}window.verMovimientosProducto=verMovimientosProducto;
//# sourceMappingURL=inventory-2.js.map
