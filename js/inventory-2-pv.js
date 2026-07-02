"use strict";window._pvMpComponentes=[],window._pvTablaPreciosVariable=[];function injectVariableProductModal(){const o=document.getElementById("pvModal");o&&o.remove();const e=document.createElement("div");e.id="pvModal",e.className="modal",e.innerHTML=`
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
                style="background:linear-gradient(135deg,#9669c4,#ab84d1);">
                \u2705 Guardar Producto Variable
            </button>
        </form>
    </div>`,document.body.appendChild(e)}window.injectVariableProductModal=injectVariableProductModal;function pvFiltrarMP(o){const e=document.getElementById("pvMpSuggestions");if(!e)return;const t=(window.products||[]).filter(n=>n.tipo==="materia_prima"||n.tipo==="servicio").filter(n=>!o||(n.name||"").toLowerCase().includes(o.toLowerCase()));if(!t.length){e.style.display="none";return}e.style.display="block",e.innerHTML=t.slice(0,8).map(n=>`<div onclick="pvSeleccionarMP('${n.id}')"
            style="padding:8px 12px;cursor:pointer;font-size:.85rem;border-bottom:1px solid #f3f4f6;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background=''">
            ${_esc(n.name||"")} <span style="color:#9ca3af;font-size:.75rem;">$${Number(n.cost||0).toFixed(2)}/ud</span>
        </div>`).join("")}window.pvFiltrarMP=pvFiltrarMP;function pvSeleccionarMP(o){const e=(window.products||[]).find(t=>String(t.id)===String(o));if(e){if((window._pvMpComponentes||[]).find(t=>String(t.id)===String(o))){manekiToastExport("Ya est\xE1 agregado","warn");return}window._pvMpComponentes.push({id:e.id,name:e.name,qty:1,costUnit:e.cost||0}),document.getElementById("pvBuscarMP").value="",document.getElementById("pvMpSuggestions").style.display="none",pvRenderMpList()}}window.pvSeleccionarMP=pvSeleccionarMP;function pvAgregarComponente(){const o=document.getElementById("pvBuscarMP");o&&(o.focus(),pvFiltrarMP(o.value||""))}window.pvAgregarComponente=pvAgregarComponente;function pvRenderMpList(){const o=document.getElementById("pvMpList");if(!o)return;const e=window._pvMpComponentes||[];if(!e.length){o.innerHTML='<p class="text-xs text-gray-400">Sin componentes a\xFAn.</p>';return}const t=e.reduce((n,r)=>n+(parseFloat(r.costUnit)||0)*(parseFloat(r.qty)||1),0);o.innerHTML=e.map((n,r)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f5f3ff;border-radius:10px;font-size:.82rem;">
            <span style="flex:1;font-weight:600;color:#4c1d95;">${_esc(n.name||"")}</span>
            <span style="color:#9ca3af;">qty:</span>
            <input type="number" min="0.01" step="0.01" value="${n.qty}"
                onchange="pvEditarQtyComp(${r}, this.value)"
                style="width:50px;padding:3px 6px;border:1px solid #ddd6fe;border-radius:6px;text-align:center;font-size:.8rem;">
            <span style="color:#9669c4;font-weight:600;min-width:55px;text-align:right;">$${((parseFloat(n.costUnit)||0)*(parseFloat(n.qty)||1)).toFixed(2)}</span>
            <button onclick="pvQuitarComp(${r})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">\u2715</button>
        </div>`).join("")+`<div style="text-align:right;font-size:.78rem;color:#9669c4;font-weight:700;padding:4px 10px 0;">Costo por hoja: $${t.toFixed(2)}</div>`}window.pvRenderMpList=pvRenderMpList;function pvEditarQtyComp(o,e){window._pvMpComponentes[o]&&(window._pvMpComponentes[o].qty=parseFloat(e)||1),pvRenderMpList()}window.pvEditarQtyComp=pvEditarQtyComp;function pvQuitarComp(o){window._pvMpComponentes.splice(o,1),pvRenderMpList()}window.pvQuitarComp=pvQuitarComp;function pvAgregarRangoPrecio(){window._pvTablaPreciosVariable||(window._pvTablaPreciosVariable=[]),window._pvTablaPreciosVariable.push({cantidadMin:"",precio:""}),pvRenderTablaPreciosList()}window.pvAgregarRangoPrecio=pvAgregarRangoPrecio;function pvRenderTablaPreciosList(){const o=document.getElementById("pvTablaPreciosList");if(!o)return;const e=window._pvTablaPreciosVariable||[];if(!e.length){o.innerHTML='<p class="text-xs text-gray-400">Sin rangos. Agrega al menos uno.</p>';return}o.innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;margin-bottom:4px;padding:0 4px;">
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Cantidad m\xEDnima</span>
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Precio total ($)</span>
            <span style="font-size:.72rem;font-weight:700;color:#0369a1;">$/pieza</span>
            <span></span>
        </div>`+e.map((t,n)=>{const r=t.cantidadMin>0&&t.precio>0?(t.precio/t.cantidadMin).toFixed(2):"\u2014";return`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
            <input type="number" min="1" placeholder="Ej: 10" value="${t.cantidadMin}"
                onchange="pvEditarRango(${n},'cantidadMin',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-center">
            <input type="number" min="0" step="0.01" placeholder="Ej: 50.00" value="${t.precio}"
                onchange="pvEditarRango(${n},'precio',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none text-center"
                style="color:#059669;font-weight:600;">
            <span style="font-size:.85rem;font-weight:700;color:#0369a1;text-align:center;padding:8px 4px;background:#e0f2fe;border-radius:8px;">$${r}</span>
            <button onclick="pvQuitarRango(${n})"
                style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;padding:0 4px;">\u2715</button>
        </div>`}).join("")}window.pvRenderTablaPreciosList=pvRenderTablaPreciosList;function pvEditarRango(o,e,t){window._pvTablaPreciosVariable[o]&&(window._pvTablaPreciosVariable[o][e]=e==="cantidadMin"?parseInt(t)||0:parseFloat(t)||0)}window.pvEditarRango=pvEditarRango;function pvQuitarRango(o){window._pvTablaPreciosVariable.splice(o,1),pvRenderTablaPreciosList()}window.pvQuitarRango=pvQuitarRango;function openVariableProductModal(o){if(injectVariableProductModal(),window._pvMpComponentes=[],window._pvTablaPreciosVariable=[],window._pvTagsActuales=[],window._pvProductImage=null,window._pvProductImageFile=null,setTimeout(()=>{const e=document.getElementById("pvProductImage");e&&!e._mkBound&&(e._mkBound=!0,e.addEventListener("change",function(t){const n=t.target.files[0];if(!n)return;window._pvProductImageFile=n;const r=new FileReader;r.onload=a=>{const i=document.getElementById("pvPreviewImg"),s=document.getElementById("pvImagePreview");i&&(i.src=a.target.result),s&&s.classList.remove("hidden"),window._pvProductImage=a.target.result},r.readAsDataURL(n)})),poblarCategoriasPv(),renderTagsPv()},80),o){const e=(window.products||[]).find(t=>String(t.id)===String(o));e&&(window._pvMpComponentes=(e.mpComponentes||[]).map(t=>({...t})),window._pvTablaPreciosVariable=(e.tablaPreciosVariable||[]).map(t=>({...t})),window._pvTagsActuales=[...e.tags||[]],window._pvProductImage=e.imageUrl||null,setTimeout(()=>{const t=(i,s)=>{const c=document.getElementById(i);c&&(c.value=s??"")};t("pvNombre",e.name),t("pvSku",e.sku||""),t("pvRendimiento",e.rendimientoPorHoja||""),t("pvEditId",o),t("pvNotas",e.notas||"");const n=document.getElementById("pvCategory");if(n&&e.category&&(n.value=e.category),e.imageUrl){const i=document.getElementById("pvPreviewImg"),s=document.getElementById("pvImagePreview");i&&(i.src=e.imageUrl),s&&s.classList.remove("hidden")}pvRenderMpList(),pvRenderTablaPreciosList(),renderTagsPv();const r=document.querySelector("#pvModal h3");r&&(r.textContent="\u{1F3A8} Editar Producto Variable");const a=document.getElementById("pvSubmitBtn");a&&(a.textContent="\u{1F4BE} Guardar Cambios")},80))}else setTimeout(()=>{pvRenderMpList(),pvRenderTablaPreciosList()},80);openModal("pvModal")}window.openVariableProductModal=openVariableProductModal;async function guardarProductoVariable(o){o&&o.preventDefault();const e=d=>{const p=document.getElementById(d);return p?p.value:""},t=e("pvNombre").trim(),n=e("pvSku").trim(),r=parseFloat(e("pvRendimiento"))||0,a=e("pvEditId"),i=e("pvCategory")||"",s=e("pvNotas").trim(),c=[...window._pvTagsActuales||[]];if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn");return}const l=(window._pvTablaPreciosVariable||[]).filter(d=>d.cantidadMin>0&&d.precio>0);if(!l.length){manekiToastExport("\u26A0\uFE0F Agrega al menos un rango de precio","warn");return}const m=document.getElementById("pvSubmitBtn");m&&(m.disabled=!0,m.textContent="\u23F3 Guardando...");const b=()=>{m&&(m.disabled=!1,m.textContent=a?"\u{1F4BE} Guardar Cambios":"\u2705 Guardar Producto Variable")};let u=window._pvProductImage||"";if(window._pvProductImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const d=await subirImagenStorage(window._pvProductImageFile).catch(()=>null);d&&(u=d),window._pvProductImageFile=null}l.sort((d,p)=>d.cantidadMin-p.cantidadMin);const g=(window._pvMpComponentes||[]).map(d=>({...d})),v=g.reduce((d,p)=>d+(parseFloat(p.costUnit)||0)*(parseFloat(p.qty)||1),0),f=n||"PV-"+mkId().split("-")[0].toUpperCase();if(a){const d=(window.products||[]).findIndex(p=>String(p.id)===String(a));if(d===-1){manekiToastExport("Producto no encontrado","err"),b();return}window.products[d]=Object.assign({},window.products[d],{name:t,tipo:"producto_variable",sku:f,rendimientoPorHoja:r,mpComponentes:g,tablaPreciosVariable:l,cost:v,price:l[l.length-1].precio,category:i,tags:c,notas:s,imageUrl:u||window.products[d].imageUrl||""}),manekiToastExport("\u2705 Producto variable actualizado","ok")}else{const d={id:_genId(),name:t,tipo:"producto_variable",sku:f,rendimientoPorHoja:r,mpComponentes:g,tablaPreciosVariable:l,cost:v,price:l[l.length-1].precio,stock:0,image:"\u{1F3A8}",category:i,tags:c,notas:s,imageUrl:u};window.products.unshift(d),manekiToastExport("\u2705 Producto variable creado","ok")}b(),saveProducts(),renderInventoryTable(),closeModal("pvModal")}window.guardarProductoVariable=guardarProductoVariable;function pvGetPrecio(o,e){const t=(o.tablaPreciosVariable||[]).slice().sort((a,i)=>a.cantidadMin-i.cantidadMin);if(!t.length)return 0;let n=t[0];for(const a of t)if(e>=a.cantidadMin)n=a;else break;const r=n.cantidadMin||1;return n.precio/r}window.pvGetPrecio=pvGetPrecio;function verMovimientosProducto(o){const e=(window.products||[]).find(i=>String(i.id)===String(o));if(!e)return;e.movimientos||(e.movimientos=[]);const t=(e.movimientos||[]).slice(0,5),n=document.getElementById("_mkMovimientosModal");n&&n.remove();const r=t.length?t.map(i=>{const s=i.delta>0?"#059669":"#dc2626",c=i.delta>0?"#d1fae5":"#fee2e2",l=i.delta>0?"+":"";return`<tr>
            <td style="padding:6px 10px;font-size:.8rem;color:#6b7280;">${_esc(i.fecha||"\u2014")}</td>
            <td style="padding:6px 10px;text-align:center;">
                <span style="background:${c};color:${s};font-weight:700;padding:2px 10px;border-radius:8px;font-size:.8rem;">${l}${i.delta}</span>
            </td>
            <td style="padding:6px 10px;text-align:center;font-size:.8rem;font-weight:600;color:#374151;">${i.stockResultante}</td>
            <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${_esc(i.motivo||"\u2014")}</td>
        </tr>`}).join(""):'<tr><td colspan="4" style="padding:14px;text-align:center;font-size:.8rem;color:#9ca3af;">Sin movimientos registrados</td></tr>',a=document.createElement("div");a.id="_mkMovimientosModal",a.style.cssText="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);",a.innerHTML=`
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
            <tbody>${r}</tbody>
        </table>
        ${t.length===0||(e.movimientos||[]).length<=5?"":`<p style="font-size:.72rem;color:#9ca3af;text-align:center;margin-top:10px;">Mostrando los \xFAltimos 5 de ${(e.movimientos||[]).length} movimientos</p>`}
    </div>`,document.body.appendChild(a),a.addEventListener("click",function(i){i.target===a&&a.remove()})}window.verMovimientosProducto=verMovimientosProducto;
//# sourceMappingURL=inventory-2-pv.js.map
