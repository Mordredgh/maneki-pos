"use strict";const TAGS_MATERIA_PRIMA=["Acr\xEDlico","Filamento","Tintas","Cuadro","Metales","Empaques","Vasos","Textil","Peluches","Otros"];window._mpTagsActuales=window._mpTagsActuales??[];function openAddMateriaPrimaModal(){window.modoEdicion=!1,window.edicionProductoId=null,window.currentProductImage=null,window.currentProductImageFile=null,window._mpTagsActuales=[];const i=document.getElementById("mpForm");i&&i.reset();const o=document.getElementById("mpImagePreview");o&&o.classList.add("hidden"),renderMpTags();const e=document.querySelector("#mpModal h3");e&&(e.textContent="\u{1F3ED} Nueva Materia Prima");const t=document.getElementById("mpSubmitBtn");t&&(t.textContent="\u2705 Guardar Materia Prima"),typeof openModal=="function"&&openModal("mpModal")}window.openAddMateriaPrimaModal=openAddMateriaPrimaModal,window._packComponentes=window._packComponentes??[];function injectPackModal(){const i=document.getElementById("packModal");i&&i.remove();const o=document.createElement("div");o.id="packModal",o.className="modal",o.innerHTML=`
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
                    onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- PRODUCTOS DEL PACK -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F4E6} Productos en el Pack</label>
                    <button type="button" onclick="packAbrirSelectorPT()"
                        style="padding:6px 14px;background:linear-gradient(135deg,var(--mk-gold-500),var(--mk-gold-400));color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                    ${[30,40,50,60].map(e=>`<button type="button" onclick="packAplicarMargen(${e})"
                        style="padding:4px 12px;border:1.5px solid #fde68a;border-radius:8px;background:#fffbeb;color:#92400e;font-size:.78rem;font-weight:700;cursor:pointer;">+${e}%</button>`).join("")}
                </div>
            </div>

            <!-- SKU y CATEGOR\xCDA opcionales -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">SKU (opcional)</label>
                    <input type="text" id="packSku" placeholder="Auto-generado"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
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
                style="width:100%;padding:14px;background:linear-gradient(135deg,var(--mk-gold-500),var(--mk-gold-400));color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:.02em;">
                \u2705 Guardar Pack
            </button>
        </form>
    </div>`,document.body.appendChild(o)}window.injectPackModal=injectPackModal;function openPackModal(i){injectPackModal(),window._packModoEdicion=!1,window._packEdicionId=null,window._packComponentes=[],window._packMpDirectos=[],window._packImageFile=null,window._packImageUrl=null;const o=document.getElementById("packCategory");if(o&&(window.categories||[]).forEach(e=>{const t=document.createElement("option");t.value=e.id,t.textContent=`${e.emoji||""} ${e.name}`,o.appendChild(t)}),i){const e=(window.products||[]).find(t=>String(t.id)===String(i)&&t.tipo==="pack");if(e){window._packModoEdicion=!0,window._packEdicionId=i,window._packComponentes=JSON.parse(JSON.stringify(e.packComponentes||[])),window._packMpDirectos=JSON.parse(JSON.stringify(e.packMpDirectos||[])),document.getElementById("packNombre").value=e.name||"",document.getElementById("packPrecio").value=e.price||"",document.getElementById("packSku").value=e.sku||"",o&&(o.value=e.category||"");const t=document.getElementById("packModalTitle");t&&(t.textContent="\u270F\uFE0F Editar Pack");const n=document.getElementById("packSubmitBtn");if(n&&(n.textContent="\u2705 Actualizar Pack"),e.imageUrl){window._packImageUrl=e.imageUrl;const a=document.getElementById("packImagePreview"),r=document.getElementById("packImagePreviewImg");a&&(a.style.display="block"),r&&(r.src=e.imageUrl)}}}packRenderComponentes(),packRenderMpDirectos(),packMostrarMargen(),typeof openModal=="function"&&openModal("packModal")}window.openPackModal=openPackModal;function closePackModal(){typeof closeModal=="function"&&closeModal("packModal")}window.closePackModal=closePackModal;function packHandlePhoto(i){const o=i.files[0];if(!o)return;window._packImageFile=o;const e=new FileReader;e.onload=t=>{const n=document.getElementById("packImagePreviewImg"),a=document.getElementById("packImagePreview");n&&(n.src=t.target.result),a&&(a.style.display="block")},e.readAsDataURL(o)}window.packHandlePhoto=packHandlePhoto;function packQuitarFoto(){window._packImageFile=null,window._packImageUrl=null;const i=document.getElementById("packImagePreview"),o=document.getElementById("packImageInput");i&&(i.style.display="none"),o&&(o.value="")}window.packQuitarFoto=packQuitarFoto;function packAbrirSelectorPT(){const i=document.getElementById("packPtSelector");if(!i)return;const o=i.style.display!=="none";if(i.style.display=o?"none":"block",!o){const e=document.getElementById("packPtSearch");e&&(e.value="",e.focus()),packFiltrarPT()}}window.packAbrirSelectorPT=packAbrirSelectorPT;function packFiltrarPT(){const i=(document.getElementById("packPtSearch")?.value||"").toLowerCase(),o=(window._packComponentes||[]).map(n=>String(n.productoId)),e=(window.products||[]).filter(n=>(n.tipo==="producto"||n.tipo==="producto_interno")&&!o.includes(String(n.id))&&(!i||(n.name||"").toLowerCase().includes(i))),t=document.getElementById("packPtResults");if(t){if(!e.length){t.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>';return}t.innerHTML=e.map(n=>{const a=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.2rem;">${n.image||"\u{1F4E6}"}</span>`;return`<div onclick="packSeleccionarPT('${String(n.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='#fff'">
            ${a}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(n.name)}</div>
                <div style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(n.cost||0).toFixed(2)}</div>
            </div>
            <span style="font-size:11px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`}).join("")}}window.packFiltrarPT=packFiltrarPT;function packSeleccionarPT(i){const o=(window.products||[]).find(t=>String(t.id)===String(i));if(!o||(window._packComponentes=window._packComponentes||[],window._packComponentes.find(t=>String(t.productoId)===String(i))))return;window._packComponentes.push({productoId:String(i),nombre:o.name,costoOriginal:Number(o.cost)||0,costoCustom:Number(o.cost)||0,qty:1});const e=document.getElementById("packPtSelector");e&&(e.style.display="none"),packRenderComponentes()}window.packSeleccionarPT=packSeleccionarPT;function packQuitarComponente(i){window._packComponentes=(window._packComponentes||[]).filter(o=>String(o.productoId)!==String(i)),packRenderComponentes()}window.packQuitarComponente=packQuitarComponente;function packActualizarCosto(i,o){const e=(window._packComponentes||[]).find(t=>String(t.productoId)===String(i));e&&(e.costoCustom=parseFloat(o)||0),packRecalcularCosto(),packMostrarMargen()}window.packActualizarCosto=packActualizarCosto;function packActualizarQty(i,o){const e=(window._packComponentes||[]).find(t=>String(t.productoId)===String(i));e&&(e.qty=Math.max(1,parseInt(o)||1)),packRenderComponentes()}window.packActualizarQty=packActualizarQty;function packRenderComponentes(){const i=document.getElementById("packComponentesList"),o=document.getElementById("packSinComponentes");if(!i)return;const e=window._packComponentes||[];if(!e.length){i.innerHTML='<p id="packSinComponentes" style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin productos agregados</p>',packRecalcularCosto();return}i.innerHTML=e.map(t=>{const n=(window.products||[]).find(r=>String(r.id)===String(t.productoId));return`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:12px;background:#fff;">
            ${n?.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n?.name||"")}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`:`<span style="font-size:1.3rem;">${n?.image||"\u{1F4E6}"}</span>`}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(t.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(t.costoOriginal).toFixed(2)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="1" value="${t.qty}"
                        onchange="packActualizarQty('${t.productoId}', this.value)"
                        style="width:46px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(t.costoCustom).toFixed(2)}"
                            onchange="packActualizarCosto('${t.productoId}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #fde68a;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#fde68a'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarComponente('${t.productoId}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\xD7</button>
            </div>
        </div>`}).join(""),packRecalcularCosto()}window.packRenderComponentes=packRenderComponentes;function packAbrirSelectorMP(){const i=document.getElementById("packMpSelector");if(!i)return;const o=i.style.display!=="none";if(i.style.display=o?"none":"block",!o){const e=document.getElementById("packMpSearch");e&&(e.value="",e.focus()),packFiltrarMP()}}window.packAbrirSelectorMP=packAbrirSelectorMP;function packFiltrarMP(){const i=(document.getElementById("packMpSearch")?.value||"").toLowerCase(),o=(window._packMpDirectos||[]).map(n=>String(n.id)),e=(window.products||[]).filter(n=>(n.tipo==="materia_prima"||n.tipo==="servicio")&&!o.includes(String(n.id))&&(!i||(n.name||"").toLowerCase().includes(i))),t=document.getElementById("packMpResults");if(t){if(!e.length){t.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>';return}t.innerHTML=e.map(n=>{const a=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.2rem;">${n.image||"\u{1F3ED}"}</span>`,r=n.tipo==="servicio"?'<span style="font-size:10px;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:99px;">Servicio</span>':'<span style="font-size:10px;background:#f0fdf4;color:#15803d;padding:1px 6px;border-radius:99px;">MP</span>';return`<div onclick="packSeleccionarMP('${String(n.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#fff'">
            ${a}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(n.name)}</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">${r}<span style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(n.cost||0).toFixed(2)} / ${_esc(n.unidad||"pza")}</span></div>
            </div>
            <span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`}).join("")}}window.packFiltrarMP=packFiltrarMP;function packSeleccionarMP(i){const o=(window.products||[]).find(t=>String(t.id)===String(i));if(!o||(window._packMpDirectos=window._packMpDirectos||[],window._packMpDirectos.find(t=>String(t.id)===String(i))))return;window._packMpDirectos.push({id:String(i),nombre:o.name,imagen:o.image||"\u{1F3ED}",imageUrl:o.imageUrl||null,unidad:o.unidad||"pza",costoOriginal:Number(o.cost)||0,costoCustom:Number(o.cost)||0,qty:1});const e=document.getElementById("packMpSelector");e&&(e.style.display="none"),packRenderMpDirectos()}window.packSeleccionarMP=packSeleccionarMP;function packQuitarMP(i){window._packMpDirectos=(window._packMpDirectos||[]).filter(o=>String(o.id)!==String(i)),packRenderMpDirectos()}window.packQuitarMP=packQuitarMP;function packActualizarCostoMP(i,o){const e=(window._packMpDirectos||[]).find(t=>String(t.id)===String(i));e&&(e.costoCustom=parseFloat(o)||0),packRecalcularCosto(),packMostrarMargen()}window.packActualizarCostoMP=packActualizarCostoMP;function packActualizarQtyMP(i,o){const e=(window._packMpDirectos||[]).find(t=>String(t.id)===String(i));e&&(e.qty=Math.max(.001,parseFloat(o)||1)),packRenderMpDirectos()}window.packActualizarQtyMP=packActualizarQtyMP;function packRenderMpDirectos(){const i=document.getElementById("packMpDirectosList");if(!i)return;const o=window._packMpDirectos||[];if(!o.length){i.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas adicionales</p>',packRecalcularCosto();return}i.innerHTML=o.map(e=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e9d5ff;border-radius:12px;background:#faf5ff;">
            ${e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||e.nombre||"")}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`:`<span style="font-size:1.3rem;">${e.imagen||"\u{1F3ED}"}</span>`}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(e.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(e.costoOriginal).toFixed(2)} / ${_esc(e.unidad||"pza")}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="0.001" step="0.001" value="${e.qty}"
                        onchange="packActualizarQtyMP('${e.id}', this.value)"
                        style="width:54px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#9669c4'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(e.costoCustom).toFixed(2)}"
                            onchange="packActualizarCostoMP('${e.id}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#9669c4'" onblur="this.style.borderColor='#ddd6fe'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarMP('${e.id}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\xD7</button>
            </div>
        </div>`).join(""),packRecalcularCosto()}window.packRenderMpDirectos=packRenderMpDirectos;function packRecalcularCosto(){const i=window._packComponentes||[],o=window._packMpDirectos||[],e=i.reduce((s,c)=>s+(Number(c.costoCustom)||0)*(Number(c.qty)||1),0),t=o.reduce((s,c)=>s+(Number(c.costoCustom)||0)*(Number(c.qty)||1),0),n=e+t,a=document.getElementById("packCostoDisplay"),r=document.getElementById("packCosto");a&&(a.textContent=`$${n.toFixed(2)}`),r&&(r.value=n.toFixed(2)),packMostrarMargen()}window.packRecalcularCosto=packRecalcularCosto;function packMostrarMargen(){const i=parseFloat(document.getElementById("packCosto")?.value||0)||0,o=parseFloat(document.getElementById("packPrecio")?.value||0)||0,e=document.getElementById("packMargenInfo");if(!e)return;if(!i||!o){e.textContent="";return}const t=((o-i)/o*100).toFixed(1),n=(o-i).toFixed(2),a=parseFloat(t)>=40?"#059669":parseFloat(t)>=20?"#d97706":"#ef4444";e.innerHTML=`<span style="color:${a};font-weight:700;">${t}% de margen</span> \xB7 Ganancia: <b style="color:${a};">$${n}</b>`}window.packMostrarMargen=packMostrarMargen;function packAplicarMargen(i){const o=parseFloat(document.getElementById("packCosto")?.value||0)||0;if(!o){manekiToastExport("\u26A0\uFE0F Define los componentes primero","warn");return}const e=o*(1+i/100),t=document.getElementById("packPrecio");t&&(t.value=e.toFixed(2),packMostrarMargen())}window.packAplicarMargen=packAplicarMargen;function flattenPackMpComponentes(i,o){const e={};return(i||[]).forEach(t=>{const n=(window.products||[]).find(a=>String(a.id)===String(t.productoId));!n||!n.mpComponentes||!n.mpComponentes.length||n.mpComponentes.forEach(a=>{const r=String(a.id),s=(a.qty||0)*(t.qty||1);e[r]?e[r]={...e[r],qty:e[r].qty+s}:e[r]={...a,qty:s}})}),(o||[]).forEach(t=>{const n=String(t.id),a=t.qty||1;e[n]?e[n]={...e[n],qty:e[n].qty+a}:e[n]={id:t.id,nombre:t.nombre,imagen:t.imagen,imageUrl:t.imageUrl||null,qty:a,costUnit:t.costoCustom||t.costoOriginal||0}}),Object.values(e)}window.flattenPackMpComponentes=flattenPackMpComponentes;async function guardarPack(){const i=(document.getElementById("packNombre")?.value||"").trim(),o=parseFloat(document.getElementById("packPrecio")?.value||0)||0,e=parseFloat(document.getElementById("packCosto")?.value||0)||0,t=(document.getElementById("packSku")?.value||"").trim(),n=document.getElementById("packCategory")?.value||"",a=window._packComponentes||[],r=window._packMpDirectos||[];if(!i){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("packNombre")?.focus();return}if(a.length+r.length<2){manekiToastExport("\u26A0\uFE0F Un pack necesita al menos 2 componentes en total","warn");return}if(!o||o<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("packPrecio")?.focus();return}if(o<=e){manekiToastExport("\u26A0\uFE0F El precio debe ser mayor al costo","warn"),document.getElementById("packPrecio")?.focus();return}const s=window._packModoEdicion?window._packEdicionId:null,c=(window.products||[]).find(p=>(p.name||"").trim().toLowerCase()===i.toLowerCase()&&String(p.id)!==String(s));if(c){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${c.name}"`,"warn");return}if(t&&!skuEsUnico(t,s)){manekiToastExport(`\u26A0\uFE0F El SKU "${t}" ya est\xE1 en uso`,"warn");return}const u=document.getElementById("packSubmitBtn");u&&(u.disabled=!0);try{let p=window._packImageUrl||null;if(window._packImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const d=await subirImagenStorage(window._packImageFile).catch(()=>null);d&&(p=d),window._packImageFile=null}const g=t||generateSKU(n),m=(window.categories||[]).find(d=>d.id===n),f=flattenPackMpComponentes(a,r);if(window._packModoEdicion&&window._packEdicionId){const d=(window.products||[]).findIndex(y=>String(y.id)===String(window._packEdicionId));if(d===-1){manekiToastExport("Error: pack no encontrado","err");return}const l=window.products[d],b=l.historialPrecios||[];(l.price!==o||l.cost!==e)&&b.push({fecha:new Date().toISOString(),precioAntes:l.price,costoAntes:l.cost,precioNuevo:o,costoNuevo:e}),window.products[d]=Object.assign({},l,{name:i,price:o,cost:e,sku:g,category:n,image:m?m.emoji:"\u{1F381}",imageUrl:p,tipo:"pack",packComponentes:JSON.parse(JSON.stringify(a)),packMpDirectos:JSON.parse(JSON.stringify(r)),mpComponentes:f,historialPrecios:b}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closePackModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Pack actualizado","ok")}else{const d={id:_genId(),name:i,tipo:"pack",price:o,cost:e,stock:0,stockMin:2,sku:g,category:n,image:m?m.emoji:"\u{1F381}",imageUrl:p,imageUrls:[],tags:[],variants:[],publicarTienda:!1,packComponentes:JSON.parse(JSON.stringify(a)),packMpDirectos:JSON.parse(JSON.stringify(r)),mpComponentes:f,historialPrecios:[]};window.products.push(d),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closePackModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Pack creado exitosamente","ok")}}finally{u&&(u.disabled=!1)}}window.guardarPack=guardarPack;
//# sourceMappingURL=inventory-2-pack.js.map
