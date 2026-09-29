"use strict";function _levenshtein(t,e){const a=t.length,r=e.length,n=Array.from({length:a+1},(i,s)=>Array.from({length:r+1},(d,l)=>l===0?s:0));for(let i=1;i<=r;i++)n[0][i]=i;for(let i=1;i<=a;i++)for(let s=1;s<=r;s++)n[i][s]=t[i-1]===e[s-1]?n[i-1][s-1]:1+Math.min(n[i-1][s],n[i][s-1],n[i-1][s-1]);return n[a][r]}window._levenshtein=_levenshtein;function _fuzzyMatch(t,e,a=2){return t=t.toLowerCase().trim(),e=e.toLowerCase(),!t||e.includes(t)?!0:e.split(/[\s,.-]+/).some(n=>{const i=n.substring(0,t.length+2);return i.length>=t.length-1&&_levenshtein(t,i)<=a})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){return!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0?null:typeof window.calcularPiezasFabricables=="function"?window.calcularPiezasFabricables(t):0}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",r=>{r.target===t&&(t.style.display="none")}),document.body.appendChild(t));const a=[...new Set((window.products||[]).map(r=>r.category).filter(Boolean))].map(r=>{const n=(window.categories||[]).find(i=>String(i.id)===String(r));return`<option value="${_esc(r)}">${_esc(n?n.emoji?n.emoji+" "+n.name:n.name:r)}</option>`}).join("");t.innerHTML=`
    <div style="background:#fff;border-radius:20px;width:min(540px,95vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;background:linear-gradient(135deg,#fef3c7,#fff7ed);display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h2 style="font-size:1.1rem;font-weight:800;color:#92400e;margin:0;">\u{1F4CA} Actualizar precios masivamente</h2>
                <p style="font-size:.75rem;color:#b45309;margin:4px 0 0;">Aplica un porcentaje de cambio a m\xFAltiples productos</p>
            </div>
            <button onclick="document.getElementById('bulkPrecioModal').style.display='none'"
                style="width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:16px;">\u2715</button>
        </div>
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">% de cambio en precio</label>
                <div style="display:flex;align-items:center;gap:8px;">
                    <input type="range" id="bulkPrecioRange" min="-50" max="200" value="0"
                        oninput="document.getElementById('bulkPrecioNum').value=this.value;bulkPrecioPreview()"
                        style="flex:1;">
                    <input type="number" id="bulkPrecioNum" min="-50" max="200" value="0"
                        oninput="document.getElementById('bulkPrecioRange').value=this.value;bulkPrecioPreview()"
                        style="width:72px;padding:6px 8px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;font-weight:700;text-align:center;">
                    <span style="font-size:.9rem;font-weight:700;color:#374151;">%</span>
                </div>
                <p style="font-size:.7rem;color:#9ca3af;margin-top:3px;">Negativo = descuento \xB7 Positivo = aumento</p>
            </div>
            <div style="display:flex;gap:20px;flex-wrap:wrap;">
                <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;">
                    <input type="checkbox" id="bulkPrecioSoloPT" onchange="bulkPrecioPreview()" style="accent-color:#FFD166;">
                    Solo Productos Terminados
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;">
                    <input type="checkbox" id="bulkPrecioSoloMP" onchange="bulkPrecioPreview()" style="accent-color:#9669c4;">
                    Solo Materias Primas (costo)
                </label>
            </div>
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Categor\xEDa (opcional)</label>
                <select id="bulkPrecioCat" onchange="bulkPrecioPreview()"
                    style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.85rem;outline:none;">
                    <option value="">Todas las categor\xEDas</option>
                    ${a}
                </select>
            </div>
            <div id="bulkPrecioPreviewList" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;max-height:220px;overflow-y:auto;padding:8px;">
                <p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ajusta los filtros y haz clic en Vista previa</p>
            </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;gap:8px;justify-content:flex-end;">
            <button onclick="document.getElementById('bulkPrecioModal').style.display='none'"
                style="padding:8px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.85rem;cursor:pointer;">Cancelar</button>
            <button onclick="bulkPrecioPreview()"
                style="padding:8px 18px;border:none;border-radius:10px;background:#e0f2fe;color:#0369a1;font-size:.85rem;font-weight:700;cursor:pointer;">\u{1F441} Vista previa</button>
            <button onclick="bulkPrecioAplicar()" class="mk-btn-primary">\u2705 Aplicar</button>
        </div>
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function abrirBulkStockModal(){let t=document.getElementById("bulkStockModal");t||(t=document.createElement("div"),t.id="bulkStockModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",r=>{r.target===t&&(t.style.display="none")}),document.body.appendChild(t));const a=[...new Set((window.products||[]).filter(r=>r.tipo==="materia_prima").map(r=>r.category).filter(Boolean))].map(r=>{const n=(window.categories||[]).find(i=>String(i.id)===String(r));return`<option value="${_esc(String(r))}">${_esc(n?n.emoji?n.emoji+" "+n.name:n.name:String(r))}</option>`}).join("");t.innerHTML=`
    <div style="background:#fff;border-radius:20px;width:min(520px,95vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;background:linear-gradient(135deg,#f0fdf4,#dcfce7);display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h2 style="font-size:1.1rem;font-weight:800;color:#15803d;margin:0;">\u{1F4E6} Ajuste masivo de stock</h2>
                <p style="font-size:.75rem;color:#16a34a;margin:4px 0 0;">Suma o resta stock a m\xFAltiples materias primas</p>
            </div>
            <button onclick="document.getElementById('bulkStockModal').style.display='none'" style="width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:16px;">\u2715</button>
        </div>
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Cantidad a ajustar</label>
                <div style="display:flex;align-items:center;gap:8px;">
                    <input type="number" id="bulkStockCantidad" value="0" step="1"
                        oninput="_bulkStockPreview()"
                        style="width:100px;padding:8px 10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:1rem;font-weight:700;text-align:center;">
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <span style="font-size:.75rem;color:#6b7280;">Positivo = suma \xB7 Negativo = resta</span>
                        <div style="display:flex;gap:6px;">
                            <button onclick="const el=document.getElementById('bulkStockCantidad');el.value=String(parseInt(el.value||'0')-1);_bulkStockPreview()" style="padding:3px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-weight:700;">\u2212</button>
                            <button onclick="const el=document.getElementById('bulkStockCantidad');el.value=String(parseInt(el.value||'0')+1);_bulkStockPreview()" style="padding:3px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-weight:700;">+</button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Categor\xEDa (opcional)</label>
                <select id="bulkStockCat" onchange="_bulkStockPreview()"
                    style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.85rem;outline:none;">
                    <option value="">Todas las categor\xEDas</option>
                    ${a}
                </select>
            </div>
            <div id="bulkStockPreviewList" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;max-height:220px;overflow-y:auto;padding:8px;">
                <p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ajusta los par\xE1metros para ver el resultado</p>
            </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;gap:8px;justify-content:flex-end;">
            <button onclick="document.getElementById('bulkStockModal').style.display='none'" style="padding:8px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.85rem;cursor:pointer;">Cancelar</button>
            <button onclick="_bulkStockPreview()" style="padding:8px 18px;border:none;border-radius:10px;background:#d1fae5;color:#065f46;font-size:.85rem;font-weight:700;cursor:pointer;">\u{1F441} Vista previa</button>
            <button onclick="_bulkStockAplicar()" style="padding:8px 18px;border:none;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;">\u2705 Aplicar</button>
        </div>
    </div>`,t.style.display="flex",_bulkStockPreview()}window.abrirBulkStockModal=abrirBulkStockModal;function _bulkStockPreview(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),e=document.getElementById("bulkStockCat")?.value||"",a=(window.products||[]).filter(n=>n.tipo==="materia_prima"&&(!e||String(n.category)===e)),r=document.getElementById("bulkStockPreviewList");if(r){if(t===0){r.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ingresa una cantidad distinta de 0</p>';return}r.innerHTML=`
        <div style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:6px;">${a.length} producto${a.length!==1?"s":""} afectados:</div>
        ${a.slice(0,20).map(n=>{const i=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0,s=Math.max(0,i+t);return`<div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f3f4f6;font-size:.76rem;">
                <span>${_esc(n.name)}</span>
                <span>${i} \u2192 <b style="color:${t>0?"#16a34a":"#dc2626"}">${s}</b></span>
            </div>`}).join("")}
        ${a.length>20?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:6px;">...y ${a.length-20} m\xE1s</p>`:""}`}}window._bulkStockPreview=_bulkStockPreview;async function _bulkStockAplicar(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),e=document.getElementById("bulkStockCat")?.value||"";if(t===0){manekiToastExport("Ingresa una cantidad distinta de 0","warn");return}const a=(window.products||[]).filter(n=>n.tipo==="materia_prima"&&(!e||String(n.category)===e));if(a.length===0){manekiToastExport("Sin productos para ajustar","warn");return}const r=typeof getStockEfectivo=="function"?getStockEfectivo:n=>Number(n.stock)||0;a.forEach(n=>{const i=r(n);n.stock=Math.max(0,i+t),typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:n.id,productoNombre:n.name,tipo:t>0?"entrada":"merma",cantidad:Math.abs(t),motivo:`Ajuste masivo ${t>0?"+":""}${t}`,stockAntes:i,stockDespues:n.stock})}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkStockModal").style.display="none",manekiToastExport(`\u2705 Stock ajustado en ${a.length} producto(s)`,"ok")}window._bulkStockAplicar=_bulkStockAplicar;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,e=document.getElementById("bulkPrecioSoloPT")?.checked||!1,a=document.getElementById("bulkPrecioSoloMP")?.checked||!1,r=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(n=>r&&String(n.category)!==r?!1:e&&a?!0:!(e&&!(!n.tipo||n.tipo==="producto"||n.tipo==="producto_interno"||n.tipo==="pack")||a&&n.tipo!=="materia_prima")).map(n=>{const i=a&&!e?"cost":"price",s=Number(n[i])||0,d=Math.max(0,Math.round(s*(1+t/100)*100)/100);return{p:n,campoKey:i,precioActual:s,precioNuevo:d}}).filter(n=>n.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const e=_bulkPrecioGetAfectados();if(!e.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=e.slice(0,50).map(({p:a,campoKey:r,precioActual:n,precioNuevo:i})=>{const s=i-n,d=s>0?"#16a34a":s<0?"#dc2626":"#6b7280",l=r==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(a.name)}">${_esc(a.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${l}: $${n.toFixed(2)}</span>
            <span style="font-weight:700;color:${d};white-space:nowrap;">\u2192 $${i.toFixed(2)}</span>
        </div>`}).join("")+(e.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${e.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const e=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,a=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",r=e>0?"+":"",n=t.slice(0,5).map(({p:i,precioActual:s,precioNuevo:d})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(i.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${s.toFixed(2)}</span>
            <span style="font-weight:700;color:${d>s?"#16a34a":"#dc2626"};">\u2192 $${d.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${r}${e}%</strong> al ${a} de <strong>${t.length}</strong> producto(s):</p>
                ${n}
             </div>`,"\u2705 Confirmar cambio masivo").then(i=>{i&&(t.forEach(({p:s,campoKey:d,precioNuevo:l})=>{s[d]=l,s.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${r}${e}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:i,campoKey:s,precioNuevo:d})=>{i[s]=d,i.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function inventoryCardHTML(t,e,a){const r=_esc(String(t.id)),n=_esc(t.name||"Sin nombre"),i=t.imageUrl?`<img src="${_esc(t.imageUrl)}" alt="${n}" loading="lazy" style="width:100%;height:132px;object-fit:cover;border-radius:12px;background:#f8f4ec;">`:`<div aria-hidden="true" style="height:132px;display:grid;place-items:center;border-radius:12px;background:#f8f4ec;font-size:2.6rem;">${_esc(t.image||(a==="mp"?"\u{1F3ED}":"\u{1F4E6}"))}</div>`,s=(t.tablaPreciosVariable||[]).slice().sort((b,h)=>Number(b.cantidadMin)-Number(h.cantidadMin)),d=a==="pv"&&s.length?Number(s[0].precio)/Math.max(1,Number(s[0].cantidadMin)):Number(a==="mp"||a==="svc"?t.cost:t.price),l=a==="svc"?"Servicio":`${Math.max(0,Number(e)||0)} disponibles`,c=a!=="svc"&&e<=Number(t.stockMin??5),p={pt:"Producto",pv:"Precio por cantidad",mp:"Materia prima",svc:"Servicio"}[a]||"Producto";return`<article class="pos-inv-card" data-id="${r}" style="background:#fff;border:1px solid #e6e2d8;border-radius:16px;padding:12px;box-shadow:0 3px 14px #1c4f320d;display:flex;flex-direction:column;gap:8px;min-width:0;">
        ${i}
        <div style="font-size:.69rem;color:#678d47;font-weight:800;text-transform:uppercase;letter-spacing:.06em;">${p}</div>
        <strong style="font-size:.96rem;color:#243529;line-height:1.3;min-height:2.5em;">${n}</strong>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:1.08rem;font-weight:800;color:#1c4f32;">$${Number.isFinite(d)?d.toFixed(2):"0.00"}</span>
            <span style="font-size:.73rem;font-weight:700;color:${c?"#a63126":"#236449"};background:${c?"#fff0ed":"#eaf7ee"};border-radius:99px;padding:4px 8px;">${l}</span>
        </div>
        <div style="display:flex;gap:7px;margin-top:auto;">
            <button type="button" data-action="editProduct" data-arg="${r}" class="mk-toolbar-btn" style="flex:1;justify-content:center;">Editar</button>
            ${a==="svc"?"":`<button type="button" data-action="ajustarStock" data-arg="${r}" class="mk-toolbar-btn" style="flex:1;justify-content:center;">Ajustar</button>`}
        </div>
    </article>`}window.inventoryCardHTML=inventoryCardHTML;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const e=window._invViewMode||(window._invViewMode=localStorage.getItem("mk-inventory-view")==="cards"?"cards":"table");document.getElementById("inventoryPaginationBar")?.remove();const a=window.products||[],r=document.getElementById("inventoryTipoFilter")?.value||"",n=["pt","pv","mp","svc"].map(o=>`${o}:${window[`_invPage_${o}`]||1}`).join("|"),i=a.length+"_"+a.reduce((o,m)=>o+Number(m.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+r+"_"+n+"_"+(window._invPageSize||10)+"_"+(window._invSortCol||"")+"_"+(window._invSortDir||""),s=document.getElementById("invDualContainer");s&&(s._lastHash=i);let d=document.getElementById("invDualContainer");if(!d){const o=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;d=document.createElement("div"),d.id="invDualContainer",d.style.cssText="display:flex;flex-direction:column;gap:0;",o.parentNode.insertBefore(d,o),o.style.display="none"}let l=document.getElementById("invViewToggle");l||(l=document.createElement("button"),l.id="invViewToggle",l.className="mk-toolbar-btn",l.style.cssText="margin:0 0 10px 8px;",l.addEventListener("click",()=>{window._invViewMode=window._invViewMode==="cards"?"table":"cards",localStorage.setItem("mk-inventory-view",window._invViewMode),renderInventoryTable()}),d.parentNode.insertBefore(l,d)),l.textContent=e==="cards"?"\u2637 Ver tabla":"\u25A6 Ver tarjetas",l.setAttribute("aria-label",e==="cards"?"Cambiar inventario a tabla":"Cambiar inventario a tarjetas");const c=window.products||[],p=new Map(c.map(o=>[String(o.id),typeof getStockEfectivo=="function"?getStockEfectivo(o):Number(o.stock)||0]));if(window._invStockCache=p,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const o=document.createElement("style");o.id="invExtraColStyles",o.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(o)}let b=document.getElementById("invExtraColToggle");if(b||(b=document.createElement("button"),b.id="invExtraColToggle",b.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",b.textContent="Mostrar SKU/Proveedor",b.addEventListener("click",()=>{const o=document.getElementById("invDualContainer");if(!o)return;const m=o.classList.toggle("inv-show-extra");b.textContent=m?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),d.parentNode.insertBefore(b,d)),b.style.display=e==="cards"?"none":"",c.length===0){d.innerHTML=`
        <div class="mk-empty" style="padding:48px 24px;text-align:center;">
            <div class="mk-empty-icon">\u{1F4E6}</div>
            <p class="mk-empty-title">Sin productos a\xFAn</p>
            <p class="mk-empty-sub">Tu inventario est\xE1 vac\xEDo. Agrega tu primer producto para empezar.</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
                <button onclick="openAddProductModal()" class="mk-btn-primary">
                    \u{1F4E6} Agregar Producto Terminado
                </button>
                <button onclick="injectMpModal();openAddMateriaPrimaModal()" class="mk-toolbar-btn">
                    \u{1F3ED} Agregar Materia Prima
                </button>
            </div>
        </div>`;return}const h=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",I=(document.getElementById("inventoryTagFilter")||{}).value||"",x=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function z(o){const m=window._normSearch||(v=>String(v||"").toLowerCase()),u=m(h),$=m(x),w=v=>!I||v.tags&&v.tags.includes(I),k=v=>!x||m(v.proveedor||"").includes($);if(!h)return o.filter(v=>w(v)&&k(v));const M=o.filter(v=>(m(v.name).includes(u)||m(v.sku||"").includes(u)||m(v.proveedor||"").includes(u)||m(v.notas||"").includes(u)||(v.tags||[]).some(G=>m(G).includes(u)))&&w(v)&&k(v));return M.length>0?M:o.filter(v=>(_fuzzyMatch(u,v.name||"")||_fuzzyMatch(u,v.sku||"")||_fuzzyMatch(u,v.proveedor||""))&&w(v)&&k(v))}const F=z(c.filter(o=>o.tipo==="materia_prima")),X=z(c.filter(o=>o.tipo==="servicio")),_=z(c.filter(o=>o.tipo==="producto_variable")),C=z(c.filter(o=>!o.tipo||o.tipo==="producto"||o.tipo==="producto_interno"||o.tipo==="pack")),j=new Set([...C,..._].map(o=>String(o.id))),f=window.productMap||new Map(c.map(o=>[String(o.id),o])),y=new Map;for(const o of c)o.mpComponentes&&o.mpComponentes.length>0&&j.has(String(o.id))&&y.set(String(o.id),calcularDisponibilidadDesdeMP(o,f,p));function P(o){if(!window._invSortCol)return o;const m=window._invSortCol,u=window._invSortDir;return[...o].sort(($,w)=>{let k,M;return m==="name"?(k=($.name||"").toLowerCase(),M=(w.name||"").toLowerCase()):m==="sku"?(k=($.sku||"").toLowerCase(),M=(w.sku||"").toLowerCase()):m==="category"?(k=($.category||"").toLowerCase(),M=(w.category||"").toLowerCase()):m==="price"?(k=Number($.price)||0,M=Number(w.price)||0):m==="stock"?(k=Number($.stock)||0,M=Number(w.stock)||0):m==="margin"&&(k=$.cost&&$.price?($.price-$.cost)/$.price:-1,M=w.cost&&w.price?(w.price-w.cost)/w.price:-1),k<M?u==="asc"?-1:1:k>M?u==="asc"?1:-1:0})}function R(o,m){const u=String(o.id),$=p.get(u)??(typeof getStockEfectivo=="function"?getStockEfectivo(o):parseInt(o.stock)||0),w=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${o.image||"\u{1F3ED}"}</span>`;let k;$===0?k='<span class="badge-danger"><i class="fas fa-circle-xmark"></i> Agotado</span>':$<=(o.stockMin||5)?k='<span class="badge-warning"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':k='<span class="badge-success"><i class="fas fa-circle-check"></i> Disponible</span>';const M=(window.categories||[]).find(D=>D.id===o.category),v=M?M.name:o.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    ${o.historialCostos&&o.historialCostos.length?`<span title="Este producto ha tenido ${o.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#9669c4;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${o.historialCostos.length} cambio${o.historialCostos.length>1?"s":""}</span>`:""}
                    ${o.compraPaquete?`<div style="font-size:10px;color:#9669c4;margin-top:2px;">\u{1F4E6} Paquete: ${o.compraPaquete.cantidad} uds \xB7 $${Number(o.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(D=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#9669c4;border:1px solid #e9d5ff;">${_esc(D)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(v)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#9669c4;font-weight:600;">$${Number(o.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(o.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${u}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <button type="button" class="pos-inv-edit pos-inv-edit--stock" data-action="editarStockInline" aria-label="Ajustar existencias" data-arg="${u}" title="Ajustar existencias">
                        ${$} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(o.unidad||"pza")}</span>
                    </button>
                </div>
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    <button type="button" data-action="editProduct" data-arg="${u}" title="Editar" aria-label="Editar" class="pos-inv-icon"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="ajustarStock" data-arg="${u}" title="Ajustar stock" aria-label="Ajustar stock" class="pos-inv-icon">\u{1F4E6}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" data-action="_invMpMenu" data-arg="${u}" data-pass-el="before" title="M\xE1s acciones" aria-label="M\xE1s acciones" class="pos-inv-icon"><i class="fas fa-ellipsis"></i></button>
                    </div>
                </div>
            </td>
        </tr>`}function U(o,m){const u=String(o.id),$=`<span style="font-size:1.6rem;">${o.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(w=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f6ecff;color:#7d4fa3;border:1px solid #dfbfff;">${_esc(w)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#7d4fa3;">$${Number(o.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#f6ecff;color:#7d4fa3;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    <button data-action="openServicioModal" data-arg="${u}" title="Editar"
                        aria-label="Editar" class="pos-inv-icon"><i class="fas fa-pen"></i></button>
                    <button data-action="deleteProduct" data-arg="${u}" title="Eliminar"
                        aria-label="Eliminar" class="pos-inv-icon"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function Y(o,m){const u=String(o.id),$=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${o.image||"\u{1F4E6}"}</span>`,w=(window.categories||[]).find(g=>g.id===o.category),k=w?w.name:o.category||"",M=y.get(u)??null;let v,D;if(M!==null){const g=M.piezas,T=g===0?"#ef4444":g<=3?"#f59e0b":"#10b981",B=g===0?"#fee2e2":g<=3?"#fef3c7":"#d1fae5",S=M.detalle.map(V=>`${V.nombre}: ${V.stock}\xF7${V.qty}=${V.posibles}pzs`).join(" | ");v=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(S)}"
                        style="padding:3px 12px;border-radius:8px;background:${B};color:${T};
                               font-weight:700;font-size:.95rem;border:1px solid ${T}33;cursor:help;">
                        ${g}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,D=g===0?'<span class="badge-danger">Sin stock MP</span>':g<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const g=p.get(String(o.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(o):o.stock||0),T=o.stockMin||5,B=g===0?"#ef4444":g<=T?"#f59e0b":"#10b981";v=`<span style="padding:3px 12px;border-radius:8px;background:${g===0?"#fee2e2":g<=T?"#fef3c7":"#d1fae5"};color:${B};font-weight:700;font-size:.95rem;">${g}</span>`,D=g===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-xmark"></i> Agotado</span>':g<=T?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-check"></i> Disponible</span>'}const G=`_invVar_${u}_open`,H=window[G]===!0,Q=o.variants&&o.variants.length>0?`<div>
                <button data-action="_mkInvToggleVarCollapse" data-arg="${u}" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${H?"\u25B2":"\u25B6"} ${o.variants.length} variante${o.variants.length!==1?"s":""}
                </button>
                ${H?'<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">'+o.variants.map(g=>`
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(g.type)}:</span>
                        ${_mkColorDot(g.type,_esc(g.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(g.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${g.qty??0}</span>
                    </div>`).join("")+"</div>":""}
               </div>`:'<span class="text-xs text-gray-400">Sin variantes</span>',J=Number(o.cost)||0,O=Number(o.price)||0,q=J&&O?(()=>{const g=(O-J)/O*100,T=g>=40?"#10b981":g>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${T};">${g.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,g).toFixed(0)}%;background:${T};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    ${o._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${o.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${o.tipo==="pack"&&o.packComponentes&&o.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${o.packComponentes.map(g=>`${g.qty>1?g.qty+"\xD7 ":""}${_esc(g.nombre)}`).join(" + ")}</div>`:""}
                    ${o.historialPrecios&&o.historialPrecios.length?`<span title="Este producto ha tenido ${o.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${o.historialPrecios.length} cambio${o.historialPrecios.length>1?"s":""}</span>`:""}
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(o.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(o.proveedorNombre)}</b>${o.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(g=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(g)}</span>`).join("")}</div>`:""}
                    ${(()=>{const g=calcularProducibles(o);if(g===null)return"";const T=g>=5?"#16a34a":g>=1?"#d97706":"#dc2626",B=g>=5?"#d1fae5":g>=1?"#fef3c7":"#fee2e2",S=g===0?"Sin stock MP":`Producibles: ${g}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${B};color:${T};border:1px solid ${T}33;">\u{1F3ED} ${S}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(k)}</td>
            <td class="px-4 py-3">${Q}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" style="font-size:.95rem;"><button type="button" class="pos-inv-edit" data-action="invInlineEditPrice" data-arg="${u}" aria-label="Editar precio">$${Number(o.price||0).toFixed(2)} <span>Editar</span></button></td>
            <td class="px-4 py-3">${v}<button type="button" class="pos-inv-edit pos-inv-edit--stock" data-action="invInlineEditStock" data-arg="${u}">Ajustar stock</button></td>
            <td class="px-4 py-3">${D}</td>
            <td class="px-4 py-3">${q}</td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    ${o.tipo==="pack"?`<button type="button" data-action="openPackModal" data-arg="${u}" title="Editar Pack" aria-label="Editar pack"
                            class="pos-inv-icon"><i class="fas fa-pen"></i></button>`:`<button type="button" data-action="editProduct" data-arg="${u}" title="Editar" aria-label="Editar producto"
                            class="pos-inv-icon"><i class="fas fa-pen"></i></button>`}
                    <button type="button" data-action="duplicarProducto" data-arg="${u}" title="Duplicar" aria-label="Duplicar producto"
                        class="pos-inv-icon"><i class="fas fa-copy"></i></button>
                    ${o.tipo!=="pack"?`<button type="button" data-action="cambiarTipoProducto" data-arg="${u}" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        class="pos-inv-icon">\u2192\u{1F9EA}</button>`:""}
                    ${o.movimientos&&o.movimientos.length?`<button type="button" data-action="verMovimientosProducto" data-arg="${u}" title="Ver movimientos de stock (${o.movimientos.length})" aria-label="Ver movimientos de stock"
                        class="pos-inv-icon"><i class="fas fa-copy"></i></button>`:""}
                    <button type="button" data-action="abrirMovimientoProducto" data-arg="${u}" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        class="pos-inv-icon"><i class="fas fa-chart-line"></i></button>
                    <button type="button" data-action="archivarProducto" data-arg="${u}" title="${o.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        class="pos-inv-icon">${o.activo===!1?'<i class="fas fa-lock-open"></i>':'<i class="fas fa-box-archive"></i>'}</button>
                    <button type="button" data-action="deleteProduct" data-arg="${u}" title="Eliminar" aria-label="Eliminar producto"
                        class="pos-inv-icon"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function A(o,m){const u=String(o.id),$=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${o.image||"\u{1F3AF}"}</span>`,w=(o.tablaPreciosVariable||[]).slice().sort((E,W)=>E.cantidadMin-W.cantidadMin),k=w.length?w.map(E=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${E.cantidadMin} pzas = $${Number(E.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',M=(o.mpComponentes||[]).length,v=(window.categories||[]).find(E=>String(E.id)===String(o.category)),D=v?`${v.emoji||""} ${v.name}`:"\u2014",G=w,H=G.length?G[0].precio/(G[0].cantidadMin||1):0,ot=H>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${H.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',Q=y.get(String(o.id))??null;let J,O;if(Q!==null){const E=Q.piezas,W=E===0?"#ef4444":E<=3?"#f59e0b":"#10b981",rt=E===0?"#fee2e2":E<=3?"#fef3c7":"#d1fae5",dt=Q.detalle.map(tt=>`${tt.nombre}: ${tt.stock}\xF7${tt.qty}=${tt.posibles}pzs`).join(" | ");J=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(dt)}" style="padding:3px 12px;border-radius:8px;background:${rt};color:${W};font-weight:700;font-size:.95rem;border:1px solid ${W}33;cursor:help;">${E}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,O=E===0?'<span class="badge-danger">Sin stock MP</span>':E<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else J='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',O='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const q=(o.mpComponentes||[]).reduce((E,W)=>E+(parseFloat(W.costUnit)||0)*(parseFloat(W.qty)||1),0),g=o.rendimientoPorHoja||1,T=g>0?q/g:q,B=H>0?Math.round((H-T)/H*100):0,S=B>=40?"#10b981":B>=20?"#f59e0b":"#ef4444",V=H>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${S};">${B}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,B)}%;background:${S};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${o.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${o.rendimientoPorHoja} uds/hoja \xB7 ${M} MP${M!==1?"s":""}</div>`:M>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${M} MP${M!==1?"s":""}</div>`:""}
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(E=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(E)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(D)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${k}</div></td>
            <td class="px-4 py-3 text-right">${ot}</td>
            <td class="px-4 py-3">${J}</td>
            <td class="px-4 py-3">${O}</td>
            <td class="px-4 py-3">${V}</td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    <button type="button" data-action="editProduct" data-arg="${u}" title="Editar" aria-label="Editar producto con precio por cantidad"
                        class="pos-inv-icon"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="duplicarProducto" data-arg="${u}" title="Duplicar" aria-label="Duplicar producto con precio por cantidad"
                        class="pos-inv-icon"><i class="fas fa-copy"></i></button>
                    <button type="button" data-action="deleteProduct" data-arg="${u}" title="Eliminar" aria-label="Eliminar producto con precio por cantidad"
                        class="pos-inv-icon"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function Z({id:o,title:m,titleColor:u,titleBg:$,btnLabel:w,btnOnclick:k,btnColor:M=null,extraBtnHTML:v="",products:D,renderFila:G,headers:H,emptyMsg:ot}){const Q=document.getElementById("inventoryTipoFilter")?.value||"";if(Q==="materia"&&o!=="mp"||Q==="producto"&&o==="mp")return"";const J=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(D.length===0&&J)return"";const O=P(D),q=`_invPage_${o}`,g=window._invPageSize||10;window[q]=window[q]||1;const T=O.length,B=Math.max(1,Math.ceil(T/g));window[q]>B&&(window[q]=1);const S=window[q],V=(S-1)*g,E=O.slice(V,V+g),W=E.length===0?`<tr><td colspan="${H.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${ot}</td></tr>`:E.map((L,nt)=>G(L,nt)).join(""),rt=E.length?E.map(L=>inventoryCardHTML(L,y.get(String(L.id))?.piezas??p.get(String(L.id))??0,o)).join(""):`<p style="padding:24px;color:#6b7280;">${ot}</p>`,dt=H.map(L=>{const nt=L.colId==="sku"?" inv-col-hidden-sku":L.colId==="proveedor"?" inv-col-hidden-prov":"",it=L.align==="right"?" text-right":" text-left";return L.sortKey?`<th class="px-4 py-3${it} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${nt}" data-action="sortInventory" data-arg="${L.sortKey}" style="white-space:nowrap;">${L.label} \u2195</th>`:`<th class="px-4 py-3${it} text-xs font-semibold text-gray-500 uppercase tracking-wide${nt}" style="white-space:nowrap;">${L.label}</th>`}).join("");let tt="";if(B>1||T>g){const L=Math.min(V+g,T);tt=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${V+1}\u2013${L}</b> de <b>${T}</b></span>
                <div style="display:flex;gap:4px;">
                    <button data-action="invSectionPage" data-arg="${o}" data-arg2="${S-1}" onclick="invSectionPage('${o}', ${S-1})" ${S<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${S<=1?"default":"pointer"};opacity:${S<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,B)},(nt,it)=>{let N=S<=3?it+1:S+it-2;return N<1&&(N=null),N>B&&(N=null),N===null?"":`<button data-action="invSectionPage" data-arg="${o}" data-arg2="${N}" onclick="invSectionPage('${o}', ${N})" style="min-width:30px;padding:4px 8px;border:1px solid ${N===S?"#FFD166":"#e5e7eb"};border-radius:7px;background:${N===S?"#FFD166":"#fff"};color:${N===S?"#fff":"#374151"};font-weight:${N===S?700:400};font-size:13px;cursor:${N===S?"default":"pointer"};" ${N===S?"disabled":""}>${N}</button>`}).join("")}
                    <button data-action="invSectionPage" data-arg="${o}" data-arg2="${S+1}" onclick="invSectionPage('${o}', ${S+1})" ${S>=B?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${S>=B?"default":"pointer"};opacity:${S>=B?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}const bt=`_invSec_${o}_collapsed`,lt=window[bt]===!0;return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${u}33;box-shadow:0 2px 12px ${u}11;">
            <!-- Header de secci\xF3n (clicable para colapsar) -->
            <div class="pos-inv-section-head" style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${$};border-bottom:${lt?"none":"1.5px solid "+u+"33"};cursor:pointer;" data-action="_mkInvToggleCollapse" data-arg="${o}">
                <div class="pos-inv-section-title" style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${u};transition:transform .2s;">${lt?"\u25B6":"\u25BC"}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${u};">${m}</span>
                    <span style="background:${u};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${T}</span>
                </div>
                <div class="pos-inv-section-tools" style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${v||""}
                    <button type="button" data-action="_mkInvAddBtnAction" data-arg="${o}" onclick="_mkInvAddBtnAction('${o}')" class="mk-btn-primary">
                        ${w}
                    </button>
                </div>
            </div>
            ${lt?"":`
            <!-- Vista de inventario -->
            ${e==="cards"?`<div class="pos-inv-card-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;padding:16px;background:#fdfbf7;">${rt}</div>`:`<div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${dt}</tr>
                    </thead>
                    <tbody>${W}</tbody>
                </table>
            </div>`}
            ${tt}`}
        </div>`}const K=c.filter(o=>!o.deletedAt),ct=K.length,gt=K.reduce((o,m)=>{const u=p.get(String(m.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(m):Number(m.stock)||0);return o+(Number(m.cost)||0)*Math.max(0,u)},0),pt=K.filter(o=>(p.get(String(o.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(o):Number(o.stock)||0))<=(o.stockMin||5)).length,at=K.filter(o=>(!o.tipo||o.tipo==="producto"||o.tipo==="producto_interno"||o.tipo==="pack")&&Number(o.price)>0),st=at.length?at.reduce((o,m)=>{const u=Number(m.price)||0,$=Number(m.cost)||0;return o+(u>0?(u-$)/u*100:0)},0)/at.length:0;let et=document.getElementById("invKpiBar");et||(et=document.createElement("div"),et.id="invKpiBar",d.parentNode.insertBefore(et,d)),et.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${ct}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#9669c4;">$${gt.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${pt>0?"#ef4444":"#10b981"};">${pt}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${st>=40?"#10b981":st>=20?"#f59e0b":"#ef4444"};">${st.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const ft=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#9A6500",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",extraBtnHTML:'<button type="button" data-action="_mkInvCreatePack" onclick="_mkInvCreatePack()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" data-action="abrirBulkPrecioModal" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:C,renderFila:Y,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos con precio por cantidad",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Precio por cantidad",btnOnclick:"injectVariableProductModal();openVariableProductModal()",products:_,renderFila:A,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos con precio por cantidad. Agrega playeras, stickers o tarjetas."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#76469c",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",extraBtnHTML:'<button type="button" data-action="abrirBulkStockModal" onclick="abrirBulkStockModal()" class="mk-toolbar-btn">\u{1F4E6} Ajustar stock masivo</button>',products:F,renderFila:R,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#7d4fa3",titleBg:"linear-gradient(135deg,#f5f3ff,#f6ecff)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",products:X,renderFila:U,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],mt=(h||I||x).length>0;let ut=!1;for(const o of ft){const m=Z(o);m&&(ut=!0);let u=document.getElementById(`invSec_${o.id}`);u||(u=document.createElement("div"),u.id=`invSec_${o.id}`,d.appendChild(u));const $=o.products.map(k=>[k.id,k.updatedAt||"",k.stock||0,k.price||0,k.cost||0,k.activo===!1?"0":"1"].join(":")).join("|"),w=o.products.length+"_"+$+"_"+(window[`_invPage_${o.id}`]||1)+"_"+(window._invPageSize||10)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r+"_"+e;u._hash!==w&&(u.innerHTML=m,u._hash=w)}const xt=new Set(ft.map(o=>`invSec_${o.id}`));for(let o=d.children.length-1;o>=0;o--){const m=d.children[o];m.id&&m.id.startsWith("invSec_")&&!xt.has(m.id)&&m.remove()}mt&&!ut&&(d.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(t,e){const a=`_invPage_${t}`,r=window.products||[],n=t==="mp"?r.filter(p=>p.tipo==="materia_prima"):t==="svc"?r.filter(p=>p.tipo==="servicio"):t==="pv"?r.filter(p=>p.tipo==="producto_variable"):r.filter(p=>!p.tipo||p.tipo==="producto"||p.tipo==="producto_interno"||p.tipo==="pack"),i=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("inventoryTagFilter")||{}).value||"",d=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",l=n.filter(p=>{const b=!i||p.name.toLowerCase().includes(i)||(p.sku||"").toLowerCase().includes(i)||(p.proveedor||"").toLowerCase().includes(i)||(p.notas||"").toLowerCase().includes(i)||(p.tags||[]).some(x=>x.toLowerCase().includes(i)),h=!s||p.tags&&p.tags.includes(s),I=!d||(p.proveedor||"").toLowerCase().includes(d);return b&&h&&I}),c=Math.max(1,Math.ceil(l.length/(window._invPageSize||10)));window[a]=Math.max(1,Math.min(e,c)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,e,a,r,n){let i=document.getElementById("inventoryPaginationBar");if(!i){const c=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!c)return;i=document.createElement("div"),i.id="inventoryPaginationBar",c.insertAdjacentElement("afterend",i)}if(e<=1&&a<=n){i.innerHTML="";return}const s=Math.min(r+n,a),d=`Mostrando <b>${r+1}\u2013${s}</b> de <b>${a}</b> productos`;function l(){const c=[],p=(b,h)=>{for(let I=b;I<=h;I++)c.push(I)};return e<=7?p(1,e):(c.push(1),t>4&&c.push("..."),p(Math.max(2,t-2),Math.min(e-1,t+2)),t<e-3&&c.push("..."),c.push(e)),c.map(b=>{if(b==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const h=b===t;return`<button data-action="invGoToPage" data-arg="${b}"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${h?"#FFD166":"#e5e7eb"};
                       background:${h?"#FFD166":"white"};color:${h?"white":"#374151"};
                       font-weight:${h?"700":"500"};font-size:13px;cursor:${h?"default":"pointer"};
                       transition:all 0.15s;"
                ${h?"disabled":""}>${b}</button>`}).join("")}i.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${d}</span>
                <select data-change="invChangePageSize" data-pass-el="1"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(c=>`<option value="${c}" ${c===n?"selected":""}>${c} por p\xE1gina</option>`).join("")}
                </select>
            </div>
            <!-- Controles de p\xE1gina -->
            <div style="display:flex;align-items:center;gap:4px;">
                <button data-action="invGoToPage" data-arg="1" ${t===1?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===1?"default":"pointer"};opacity:${t===1?.4:1};font-size:13px;"
                    title="Primera p\xE1gina">\u27E8\u27E8</button>
                <button data-action="invGoToPage" data-arg="${t-1}" ${t===1?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===1?"default":"pointer"};opacity:${t===1?.4:1};font-size:13px;"
                    title="P\xE1gina anterior">\u2039</button>
                ${l()}
                <button data-action="invGoToPage" data-arg="${t+1}" ${t===e?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===e?"default":"pointer"};opacity:${t===e?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button data-action="invGoToPage" data-arg="${e}" ${t===e?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===e?"default":"pointer"};opacity:${t===e?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const a=(typeof t=="string"?parseInt(t):t)||1,n=Array.from(document.querySelectorAll('[id^="invSec_"]')).find(s=>s.offsetParent!==null&&s.textContent?.includes("Mostrando"))?.id?.replace("invSec_","");if(n&&typeof invSectionPage=="function")invSectionPage(n,a);else{const s=Math.max(1,Math.ceil((window.products||[]).length/(window._invPageSize||10)));window._invCurrentPage=Math.max(1,Math.min(a,s)),renderInventoryTable()}const i=document.getElementById("inventoryTable");i&&i.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){const e=typeof t=="object"&&t?t.value:t;window._invPageSize=parseInt(e)||10,window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;function _invMpMenu(t,e){const a=(window.products||[]).find(c=>String(c.id)===String(e));if(!a)return;const r=!!a.proveedorUrl,n=a.activo===!1?"desarchivar":"archivar",i=document.getElementById("_invMpMenuDrop");if(i&&(i.remove(),i.dataset.pid===e))return;const s=document.createElement("div");s.id="_invMpMenuDrop",s.dataset.pid=e,s.style.cssText="position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:172px;overflow:hidden;font-size:.78rem;";const d=(c,p)=>`style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:${c};text-align:left;" onmouseover="this.style.background='${p}'" onmouseout="this.style.background='none'"`;s.innerHTML=`
        <button data-action="registrarMerma" data-arg="${e}" data-close-menu-drop="true" ${d("#d97706","#fffbeb")}>\u{1F4C9} Registrar merma</button>
        <button data-action="duplicarProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#9669c4","#f5f3ff")}>\u{1F4CB} Duplicar</button>
        <button data-action="cambiarTipoProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#b45309","#fef9c3")}>\u2192\u{1F4E6} Convertir a PT</button>
        <button data-action="abrirMovimientoProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#4338ca","#eef2ff")}>\u{1F4C8} Ver gr\xE1fica</button>
        ${r?`<button data-action="_mkInvOpenProveedor" data-arg="${e}" data-close-menu-drop="true" ${d("#16a34a","#f0fdf4")}>\u{1F517} Abrir proveedor</button>`:""}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button data-action="archivarProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#6b7280","#f9fafb")}>\u{1F4C1} ${n==="desarchivar"?"Desarchivar":"Archivar"}</button>
        <button data-action="deleteProduct" data-arg="${e}" data-close-menu-drop="true" ${d("#dc2626","#fef2f2")}>\u{1F5D1}\uFE0F Eliminar</button>
    `,document.body.appendChild(s);const l=t.getBoundingClientRect();s.style.top=l.bottom+window.scrollY+4+"px",s.style.left=Math.min(l.left+window.scrollX,window.innerWidth-180)+"px",setTimeout(()=>document.addEventListener("click",function c(p){s.contains(p.target)||(s.remove(),document.removeEventListener("click",c))}),0)}window._invMpMenu=_invMpMenu;function _mkInvToggleVarCollapse(t){const e=`_invVar_${t}_open`;window[e]=!window[e],renderInventoryTable()}window._mkInvToggleVarCollapse=_mkInvToggleVarCollapse;function _mkInvOpenProveedor(t){const e=(window.products||[]).find(a=>String(a.id)===String(t));e?.proveedorUrl&&window.open(e.proveedorUrl,"_blank")}window._mkInvOpenProveedor=_mkInvOpenProveedor;function _mkInvToggleCollapse(t){const e=`_invSec_${t}_collapsed`;window[e]=!window[e],renderInventoryTable()}window._mkInvToggleCollapse=_mkInvToggleCollapse;function _mkInvAddBtnAction(t){t==="pt"?typeof window.openAddProductModal=="function"&&window.openAddProductModal():t==="pv"?(typeof window.injectVariableProductModal=="function"&&window.injectVariableProductModal(),typeof window.openVariableProductModal=="function"&&window.openVariableProductModal()):t==="mp"?(typeof window.injectMpModal=="function"&&window.injectMpModal(),typeof window.openAddMateriaPrimaModal=="function"&&window.openAddMateriaPrimaModal()):t==="svc"&&(typeof window.injectSvcModal=="function"&&window.injectSvcModal(),typeof window.openServicioModal=="function"&&window.openServicioModal())}window._mkInvAddBtnAction=_mkInvAddBtnAction;function _mkInvCreatePack(){typeof window.injectPackModal=="function"&&window.injectPackModal(),typeof window.openPackModal=="function"&&window.openPackModal()}window._mkInvCreatePack=_mkInvCreatePack;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const e=document.getElementById("movimientosLista");if(!e)return;const a=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",r=(document.getElementById("movTipoFilter")||{}).value||"";let n=window.stockMovements||[];a&&(n=n.filter(x=>x.productoNombre?.toLowerCase().includes(a)||(x.motivo||"").toLowerCase().includes(a))),r&&(n=n.filter(x=>(x.tipo||"")===r));const i=_fechaHoy(),s=(window.stockMovements||[]).filter(x=>{try{const z=new Date(x.fecha);return z.getFullYear()+"-"+("0"+(z.getMonth()+1)).slice(-2)+"-"+("0"+z.getDate()).slice(-2)===i}catch{return!1}}),d={};s.forEach(x=>{d[x.tipo]=(d[x.tipo]||0)+1});const l={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},c={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let p=document.getElementById("movResumenHoy");p||(p=document.createElement("div"),p.id="movResumenHoy",e.parentNode.insertBefore(p,e));const b=Object.keys(d).map(x=>`${l[x]||"\u26AA"} ${c[x]||x}: <strong>${d[x]}</strong>`);p.innerHTML=b.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${b.join("&nbsp;&nbsp;")}
           </div>`:"";let h=document.getElementById("movExportCSVBtn");if(h||(h=document.createElement("button"),h.id="movExportCSVBtn",h.textContent="\u{1F4E5} Exportar historial CSV",h.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",h.onclick=function(){const x=window.stockMovements||[];let F=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;x.forEach(j=>{const f=[new Date(j.fecha).toLocaleString("es-MX"),j.productoNombre||"",j.tipo||"",j.cantidad,j.motivo||"",j.stockAntes??"",j.stockDespues??""];F+=f.map(y=>`"${String(y).replace(/"/g,'""')}"`).join(",")+`
`});const X=new Blob([F],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(X),C=document.createElement("a");C.href=_,C.download=`movimientos-${i}.csv`,C.click(),URL.revokeObjectURL(_)},e.parentNode.insertBefore(h,e)),!n.length){e.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const I={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};e.innerHTML=n.slice(0,200).map(x=>{const z=new Date(x.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),F=x.cantidad>=0?`+${x.cantidad}`:`${x.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${I[x.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(x.productoNombre||(x.productoId&&!(window.products||[]).find(X=>String(X.id)===String(x.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${z} \xB7 ${x.tipo} \xB7 ${_esc(x.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${x.cantidad>=0?"#10b981":"#ef4444"};">${F} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${x.stockAntes} \u2192 ${x.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){showConfirm("Se borrar\xE1 permanentemente todo el historial de movimientos de inventario.","\xBFBorrar historial?").then(t=>{t&&(window.stockMovements=[],window.stockMovimientos=[],saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").delete().neq("id","00000000-0000-0000-0000-000000000000").then(({error:e})=>{e&&console.warn("[Inv] Error limpiando stock_movements relacional:",e.message)}),renderMovimientos())})}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const e=document.getElementById(t);if(!e)return;if(!window.stockMovements||!window.stockMovements.length){e.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const a={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};e.innerHTML=window.stockMovements.slice(0,100).map(r=>{const n=new Date(r.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),i=r.cantidad>=0?`+${r.cantidad}`:`${r.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${a[r.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(r.productoNombre||(r.productoId&&!(window.products||[]).find(s=>String(s.id)===String(r.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${n} \xB7 ${r.tipo} \xB7 ${_esc(r.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${r.cantidad>=0?"#10b981":"#ef4444"};">${i} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${r.stockAntes} \u2192 ${r.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const e=(window.products||[]).find(r=>String(r.id)===String(t));if(!e){manekiToastExport("Producto no encontrado","err");return}const a=JSON.parse(JSON.stringify(e));a.id=_genId(),a.name="Copia de "+e.name,a.sku=(e.sku||"")+"-C",a.stock=0,a.historialPrecios=[],a.historialCostos=[],window.products.unshift(a),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${a.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(s=>!s.tipo||s.tipo==="producto"||s.tipo==="producto_interno"),e=t.map(s=>{const d=s.price>0&&s.cost>0?(s.price-s.cost)/s.price*100:null;return{...s,_margen:d}}).sort((s,d)=>(d._margen??-1/0)-(s._margen??-1/0)),a=e.map((s,d)=>{const l=s._margen!==null?s._margen.toFixed(1)+"%":"\u2014",c=s.price>0&&s.cost>0?"$"+(s.price-s.cost).toFixed(2):"\u2014",p=s._margen===null?"#9ca3af":s._margen>=50?"#16a34a":s._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${d===0?"\u{1F947}":d===1?"\u{1F948}":d===2?"\u{1F949}":`${d+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(s.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(s.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(s.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${c}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${p};font-size:14px;">${l}</td>
        </tr>`}).join(""),r=e.filter(s=>s._margen!==null).reduce((s,d,l,c)=>s+d._margen/c.length,0),n=e[0];let i=document.getElementById("_mkRentabilidadModal");i||(i=document.createElement("div"),i.id="_mkRentabilidadModal",i.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",i.addEventListener("click",s=>{s.target===i&&(i.style.display="none")}),document.body.appendChild(i)),i.innerHTML=`
        <div style="background:white;border-radius:20px;width:min(820px,95vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
            <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#fef3c7,#fff7ed);">
                <div>
                    <h2 style="font-size:1.2rem;font-weight:700;color:#92400e;margin:0;">\u{1F4CA} Reporte de Rentabilidad</h2>
                    <p style="font-size:12px;color:#b45309;margin:4px 0 0;">Ranking de productos por margen de ganancia</p>
                </div>
                <button onclick="document.getElementById('_mkRentabilidadModal').style.display='none'"
                    style="width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:white;cursor:pointer;font-size:16px;">\u2715</button>
            </div>
            <div style="display:flex;gap:16px;padding:16px 24px;background:#fffbeb;border-bottom:1px solid #fef3c7;">
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Margen promedio</div>
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${e.some(s=>s._margen!==null)?r.toFixed(1)+"%":"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">M\xE1s rentable</div>
                    <div style="font-size:.95rem;font-weight:700;color:#16a34a;margin-top:4px;">${n?_esc(n.name):"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Total productos</div>
                    <div style="font-size:1.6rem;font-weight:800;color:#374151;">${t.length}</div>
                </div>
            </div>
            <div style="overflow-y:auto;flex:1;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="position:sticky;top:0;background:#f9fafb;">
                        <tr>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">#</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Producto</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Costo</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Precio</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Ganancia</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Margen</th>
                        </tr>
                    </thead>
                    <tbody>${a||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,i.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(a=>{a.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let e=document.getElementById("invBulkBar");if(e||(e=document.createElement("div"),e.id="invBulkBar",e.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(e)),t.length===0){e.style.display="none";return}e.style.display="flex",e.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#9669c4;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const e=(window.pedidos||[]).filter(n=>!["cancelado","finalizado"].includes(n.status||"")&&(n.productosInventario||[]).some(i=>t.includes(String(i.id))));if(e.length>0){const n=e.map(s=>s.folio||s.id).slice(0,5).join(", ");if(!(typeof showConfirm=="function"?await showConfirm(`\u26A0\uFE0F ${e.length} pedido(s) activo(s) usan estos productos (${n}). \xBFEliminar de todas formas?`,"Productos en pedidos activos"):confirm(`\u26A0\uFE0F ${e.length} pedido(s) activo(s) usan estos productos (${n}). \xBFEliminar de todas formas?`)))return}if(!(typeof showConfirm=="function"?await showConfirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`,"\u{1F5D1} Confirmar eliminaci\xF3n"):confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`)))return;const r=[...t];if(window.products=(window.products||[]).filter(n=>!r.includes(String(n.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",r)}catch(n){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",n)}manekiToastExport(`\u{1F5D1} ${r.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),e=(window.products||[]).filter(l=>t.includes(String(l.id))),a="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",r=e.map(l=>[l.tipo||"pt",l.name,l.sku||"",l.cost||0,l.price||0,l.stock||0,l.stockMin||5,l.proveedor||"",l.notas||""].map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")),n="\uFEFF"+a+`
`+r.join(`
`),i=new Blob([n],{type:"text/csv;charset=utf-8;"}),s=URL.createObjectURL(i),d=document.createElement("a");d.href=s,d.download="inventario_seleccion.csv",d.click(),URL.revokeObjectURL(s),manekiToastExport(`\u{1F4E5} ${e.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const e=await new Promise(r=>{const n=document.getElementById("mkBatchCatModal");n&&n.remove();const s=(window.categories||[]).map(l=>`<option value="${l.id}">${l.emoji||""} ${l.name}</option>`).join(""),d=document.createElement("div");d.id="mkBatchCatModal",d.className="mk-modal-overlay",d.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C1} Cambiar categor\xEDa en lote</h3>
          <p style="font-size:.8rem;color:#6b7280;margin-bottom:10px;">${t.length} producto(s) seleccionado(s)</p>
          <select id="mkBatchCatSel" class="mk-input w-full mb-4">
              <option value="">Seleccionar categor\xEDa...</option>
              ${s}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkBatchCatModal').remove();window._mkBCR(null)">Cancelar</button>
              <button type="button" class="mk-btn-primary" onclick="window._mkBCR((document.getElementById('mkBatchCatSel') as HTMLSelectElement).value||null)">Aplicar</button>
          </div>
      </div>`,window._mkBCR=l=>{d.remove(),r(l)},document.body.appendChild(d),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!e)return;const a=(window.categories||[]).find(r=>String(r.id)===String(e));if(!a){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(r=>{t.includes(String(r.id))&&(r.category=a.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};function _mkInvResetPages(){window._invCurrentPage=1,["pt","pv","mp","svc"].forEach(t=>{window[`_invPage_${t}`]=1})}function _mkInvDispatchFilter(t,e){const a=t._invPagListenerAdded;t.dispatchEvent(new Event(e,{bubbles:!0})),!a&&typeof renderInventoryTable=="function"&&renderInventoryTable()}window._mkInvSetTipo=function(t){const e=document.getElementById("inventoryTipoFilter");e&&(e.value=t,_mkInvResetPages(),_mkInvSyncSeg(),_mkInvDispatchFilter(e,"change"))},window._mkInvClearOne=function(t){const e=document.getElementById(t);e&&(e.value="",_mkInvResetPages(),_mkInvDispatchFilter(e,t==="inventorySearch"?"input":"change"))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(e=>{const a=document.getElementById(e);a&&(a.value="")}),_mkInvResetPages();const t=document.getElementById("inventorySearch");t?(t.value="",_mkInvDispatchFilter(t,"input")):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),e=document.getElementById("mkInvTipoSeg");!t||!e||e.querySelectorAll("button").forEach(a=>a.classList.toggle("active",a.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),e=t?.parentElement;if(!(!t||!e)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const a=document.createElement("div");a.id="mkInvTipoSeg",a.className="mk-segmented",a.setAttribute("role","group"),a.setAttribute("aria-label","Tipo de producto"),a.innerHTML=[...t.options].map(r=>{const n=_MK_TIPO_LABELS[r.value]??(r.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${r.value}" onclick="_mkInvSetTipo('${r.value}')">${n}</button>`}).join(""),t.parentElement.insertBefore(a,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const a=document.createElement("span");a.id="mkInvDensity",a.style.marginLeft="auto",a.innerHTML=window.mkRenderDensityToggle(),e.appendChild(a),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const a=document.createElement("div");a.id="mkInvFilterInfo",a.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",e.parentElement.insertBefore(a,e.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const a=document.createElement("div");a.id="mkInvHerramientas",a.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",a.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock m\xEDnimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gr\xE1fica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
      <button type="button" onclick="abrirMovimientosRecientes()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Ver \xFAltimos movimientos de inventario"><i class="fas fa-history" style="margin-right:5px;"></i>Movimientos recientes</button>
    `;const r=document.getElementById("mkInvFilterInfo");r?r.parentElement.insertBefore(a,r):e.parentElement.insertBefore(a,e.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const e=document.getElementById("invDualContainer"),a=e?e.querySelectorAll(window._invViewMode==="cards"?".pos-inv-card":".inv-bulk-cb").length:0,r=(window.products||[]).length,n=document.getElementById("inventorySearch"),i=document.getElementById("inventoryTagFilter"),s=document.getElementById("inventoryProveedorFilter"),d=document.getElementById("inventoryTipoFilter"),l=[];n&&n.value.trim()&&l.push(`<span class="mk-filter-chip">Buscar: ${_esc(n.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),d&&d.value&&l.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[d.value]||d.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),i&&i.value&&l.push(`<span class="mk-filter-chip">Tag: ${_esc(i.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),s&&s.value&&l.push(`<span class="mk-filter-chip">Proveedor: ${_esc(s.options[s.selectedIndex]?.text||s.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let c=`<span class="mk-result-count">Mostrando <b>${a}</b> de ${r} producto${r!==1?"s":""}</span>`;l.length&&(c+=`<div class="mk-filter-chips">${l.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=c,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const e=new Set([...t.querySelectorAll(window._invViewMode==="cards"?".pos-inv-card":".inv-bulk-cb")].map(d=>String(d.dataset.id))),a=window._invStockCache;let r=0,n=0,i=0;(window.products||[]).forEach(d=>{if(!e.has(String(d.id)))return;i++;const l=a?.get(String(d.id))??(Number(d.stock)||0);r+=(Number(d.cost)||0)*Math.max(0,l),l<=(Number(d.stockMin)||5)&&n++});let s=document.getElementById("mkInvSummary");if(i===0){s&&s.remove();return}s||(s=document.createElement("div"),s.id="mkInvSummary",s.className="mk-table-summary",s.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(s,t.nextSibling)),s.innerHTML=`<span>Valor en costo: <b>$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${i} producto${i!==1?"s":""}</span>`+(n>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${n} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const e=window.renderInventoryTable;if(typeof e!="function"||e._mkWrapped)return;const a=function(...r){const n=e.apply(this,r);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return n};a._mkWrapped=!0,window.renderInventoryTable=a})();function _mkInvModal(t,e,a,r="700px"){let n=document.getElementById(t+"_ov");n||(n=document.createElement("div"),n.id=t+"_ov",n.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(n)),n.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${r};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${e}</h3>
        <button onclick="document.getElementById('${t}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${a}</div>
    </div>`,n.onclick=i=>{i.target===n&&n.remove()},n.style.display="flex"}function abrirConteoFisico(){const t=(window.products||[]).filter(n=>n.tipo!=="servicio"&&n.activo!==!1);if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const e=_esc,r=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${t.map((n,i)=>{const s=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0;return`<tr style="${i%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${e(n.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${e(n.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${s}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${s}" data-pid="${e(n.id)}" data-sistema="${s}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",r,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const t=document.querySelectorAll("#mkConteo_ov .conteo-input");let e=0;if(t.forEach(a=>{const r=a.dataset.pid,n=Number(a.dataset.sistema),i=Number(a.value);if(isNaN(i)||i===n)return;const s=(window.products||[]).find(l=>String(l.id)===String(r));if(!s)return;const d=i-n;s.stock=i,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:s.id,productoNombre:s.name,tipo:d>0?"entrada_manual":"salida_manual",cantidad:Math.abs(d),motivo:"Conteo f\xEDsico",stockAntes:n,stockDespues:i}),e++}),e===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${e} ajuste${e!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const t=(window.products||[]).filter(n=>n.tipo==="servicio"||n.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5));if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const e=_esc,a={};t.forEach(n=>{const i=n.proveedor||"Sin proveedor";a[i]||(a[i]=[]),a[i].push(n)});const r=Object.entries(a).map(([n,i])=>{const s=e(n),d=i.map(l=>{const c=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,p=Number(l.stockMin)||5,b=Math.max(1,p*2-c);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${e(l.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${c}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${p}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#FFD166;">${b}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${e(l.unidad||"pza")}</td></tr>`}).join("");return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${s} (${i.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:
${i.map(l=>`\u2022 ${l.name}: ${Math.max(1,(Number(l.stockMin)||5)*2-(typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0))} ${l.unidad||"pza"}`).join(`
`)}`)}" target="_blank"
            style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#25D366;color:white;text-decoration:none;font-weight:700;">\u{1F4F2} WA</a>
          <button onclick="_mkExportReabCSV('${s}')" style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#10b981;color:white;border:none;cursor:pointer;font-weight:700;">\u{1F4E5} CSV</button>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="font-size:.75rem;color:#6b7280;">
          <th style="padding:6px 10px;text-align:left;">Producto</th>
          <th style="padding:6px 10px;text-align:center;">Stock</th>
          <th style="padding:6px 10px;text-align:center;">M\xEDn.</th>
          <th style="padding:6px 10px;text-align:center;">Pedir</th>
          <th style="padding:6px 10px;">Unidad</th>
        </tr></thead>
        <tbody>${d}</tbody>
      </table>
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${t.length} productos`,r,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(t){const a=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(s=>{if(s.tipo==="servicio"||s.activo===!1)return!1;const d=s.proveedor||"Sin proveedor";return t&&d!==t?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(s):Number(s.stock)||0)<=(Number(s.stockMin)||5)}).map(s=>{const d=typeof getStockEfectivo=="function"?getStockEfectivo(s):Number(s.stock)||0,l=Number(s.stockMin)||5;return`"${s.name}",${d},${l},${Math.max(1,l*2-d)},${s.unidad||"pza"},"${s.proveedor||""}"`})].join(`
`),r=document.createElement("a");r.href=URL.createObjectURL(new Blob([a],{type:"text/csv;charset=utf-8;"}));const n=new Date,i=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;r.download=`reabastecimiento_${i}.csv`,r.click()};function mostrarDonutCategoria(){const t=_esc,e={};(window.products||[]).forEach(d=>{if(d.tipo==="servicio"||d.activo===!1)return;const l=typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0,c=(Number(d.price)||0)*l,p=d.category||"Sin categor\xEDa";e[p]=(e[p]||0)+c});const a=Object.entries(e).sort((d,l)=>l[1]-d[1]),r=a.reduce((d,[,l])=>d+l,0),n=["#FFD166","#9669c4","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#9669c4","#f97316","#14b8a6"],i=a.map(([d,l],c)=>{const p=r>0?(l/r*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${n[c%n.length]};margin-right:6px;"></span>
        ${t(d)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${l.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${p}%</td>
    </tr>`}).join(""),s=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Valor de inventario (precio \xD7 stock) por categor\xEDa. Total: <b>$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></p>
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
      <canvas id="mkDonutCat" width="200" height="200" style="flex-shrink:0;max-width:200px;"></canvas>
      <table style="flex:1;min-width:200px;border-collapse:collapse;">
        <thead><tr style="font-size:.75rem;color:#9ca3af;">
          <th style="padding:6px 12px;text-align:left;">Categor\xEDa</th>
          <th style="padding:6px 12px;text-align:right;">Valor</th>
          <th style="padding:6px 12px;text-align:right;">%</th>
        </tr></thead>
        <tbody>${i}</tbody>
        <tfoot><tr style="border-top:2px solid #e5e7eb;font-weight:800;">
          <td style="padding:8px 12px;">Total</td>
          <td style="padding:8px 12px;text-align:right;">$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
          <td style="padding:8px 12px;text-align:right;">100%</td>
        </tr></tfoot>
      </table>
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",s,"700px"),setTimeout(()=>{const d=document.getElementById("mkDonutCat");if(d)try{const l=window.Chart;if(typeof l>"u"){d.style.display="none";return}new l(d,{type:"doughnut",data:{labels:a.map(([c])=>c),datasets:[{data:a.map(([,c])=>Math.round(c)),backgroundColor:a.map((c,p)=>n[p%n.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{d&&(d.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const t=_esc,e=new Date;e.setDate(e.getDate()-60);const a={};(window.pedidosFinalizados||[]).forEach(s=>{const d=s.fechaFinalizado||s.entrega||"";d&&new Date(d)<e||(s.productosInventario||[]).forEach(l=>{!l.id||l.id==="libre"||(a[String(l.id)]=(a[String(l.id)]||0)+(Number(l.quantity||l.cantidad)||1))})});const r=(window.products||[]).filter(s=>s.tipo!=="servicio"&&s.activo!==!1&&a[String(s.id)]);if(!r.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const i=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:14px;">Basado en el consumo real de los \xFAltimos 60 d\xEDas. Stock m\xEDnimo sugerido = 14 d\xEDas de cobertura.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="font-size:.75rem;color:#9ca3af;background:#f9fafb;">
        <th style="padding:7px 10px;text-align:left;">Producto</th>
        <th style="padding:7px 10px;text-align:center;">Uso 60d</th>
        <th style="padding:7px 10px;text-align:center;">Promedio</th>
        <th style="padding:7px 10px;text-align:center;">Actual</th>
        <th style="padding:7px 10px;text-align:center;">Sugerido</th>
        <th style="padding:7px 10px;text-align:center;">\u2713</th>
      </tr></thead>
      <tbody>${r.map(s=>{const d=a[String(s.id)]||0,l=d/60,c=Math.max(1,Math.ceil(l*14)),p=Number(s.stockMin)||0,b=c!==p?`<span style="color:${c>p?"#10b981":"#f59e0b"};font-weight:700;">${c>p?"\u25B2":"\u25BC"} ${c}</span>`:`<span style="color:#6b7280;">${c} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${t(s.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${p}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${b}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${t(s.id)}" data-nuevo="${c}" class="mkStockMinCb" style="accent-color:#FFD166;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",i,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const t=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let e=0;t.forEach(a=>{const r=a.dataset.pid,n=Number(a.dataset.nuevo),i=(window.products||[]).find(s=>String(s.id)===String(r));!i||isNaN(n)||(i.stockMin=n,e++)}),e&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${e} producto${e!==1?"s":""}`,"ok"))};function archivarProducto(t){const e=(window.products||[]).find(i=>String(i.id)===String(t));if(!e)return;const a=e.activo!==!1,r=a?"archivar":"desarchivar",n=a?`\xBFArchivar "${e.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${e.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(n,a?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(i=>{i&&(e.activo=!a,e.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(a?`\u{1F4C1} "${e.name}" archivado`:`\u{1F513} "${e.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(t){const e=_esc,a=(window.products||[]).find(f=>String(f.id)===String(t));if(!a){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const r=Date.now()-90*864e5,n=new Set,i=[],s=f=>{if(!f)return;const y=f.fecha?new Date(f.fecha+(f.hora?"T"+f.hora:"")).getTime():f.timestamp?new Date(f.timestamp).getTime():0;if(y&&y<r)return;const P=f.id||String(f.productoId||t)+"_"+y+"_"+(f.cantidad||0);n.has(P)||(n.add(P),i.push({...f,_ts:y||Date.now()}))};(a.movimientos||[]).forEach(s),(window.stockMovimientos||[]).filter(f=>String(f.productoId)===String(t)).forEach(s),i.sort((f,y)=>y._ts-f._ts);const d=[];for(let f=12;f>=0;f--){const y=new Date(Date.now()-f*7*864e5),P=new Date(y.getTime()-7*864e5),R=`${P.getDate()}/${P.getMonth()+1}`;let U=0,Y=0;i.forEach(A=>{if(A._ts>=P.getTime()&&A._ts<y.getTime()){const Z=A.stockDespues!=null&&A.stockAntes!=null?Number(A.stockDespues)-Number(A.stockAntes):0,K=(A.tipo||"").toLowerCase();Z>0||K.includes("entrada")||K.includes("compra")||K.includes("ajuste_positivo")?U+=Math.abs(Number(A.cantidad)||Math.abs(Z)||1):Y+=Math.abs(Number(A.cantidad)||Math.abs(Z)||1)}}),d.push({label:R,entradas:U,salidas:Y})}const l=Math.max(1,...d.map(f=>Math.max(f.entradas,f.salidas))),c=480,p=100,b=Math.floor((c-20)/d.length/2)-1,h=d.map((f,y)=>{const P=10+y*(b*2+4),R=Math.round(f.entradas/l*(p-20)),U=Math.round(f.salidas/l*(p-20));return`
      <rect x="${P}" y="${p-10-R}" width="${b}" height="${R}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${f.entradas}"/>
      <rect x="${P+b+1}" y="${p-10-U}" width="${b}" height="${U}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${f.salidas}"/>
      <text x="${P+b}" y="${p-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${f.label}</text>`}).join(""),I=i.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">\u25A0 Entradas</span>
        <span style="color:#ef4444;">\u25A0 Salidas</span>
      </div>
      <svg viewBox="0 0 ${c} ${p}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${p-10}" x2="${c-10}" y2="${p-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${h}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">\u2190 13 semanas</div>
    </div>`,x={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},z=i.slice(0,30).map(f=>{const y=f.fecha||(f._ts?new Date(f._ts).toLocaleDateString("es-MX"):"\u2014"),P=f.hora||"",R=x[f.tipo||""]||f.tipo||"\u2014",U=f.stockDespues!=null&&f.stockAntes!=null?Number(f.stockDespues)-Number(f.stockAntes):0,Y=Number(f.cantidad)||Math.abs(U)||0,A=U>0||(f.tipo||"").includes("entrada")||(f.tipo||"").includes("compra"),Z=A?"#10b981":"#ef4444",K=A?`+${Y}`:`-${Y}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${e(y)} ${P?`<span style="color:#9ca3af;font-size:.72rem;">${e(P.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${e(R)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${Z};">${K}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${f.stockDespues!=null?f.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e(f.motivo||"")}">${e(f.motivo||"")}</td>
    </tr>`}).join(""),F=typeof getStockEfectivo=="function"?getStockEfectivo(a):Number(a.stock)||0,X=i.reduce((f,y)=>{const P=y.stockDespues!=null&&y.stockAntes!=null?Number(y.stockDespues)-Number(y.stockAntes):0;return f+(P>0||(y.tipo||"").includes("entrada")||(y.tipo||"").includes("compra")?Math.abs(Number(y.cantidad)||Math.abs(P)||0):0)},0),_=i.reduce((f,y)=>{const P=y.stockDespues!=null&&y.stockAntes!=null?Number(y.stockDespues)-Number(y.stockAntes):0,R=P>0||(y.tipo||"").includes("entrada")||(y.tipo||"").includes("compra");return f+(R?0:Math.abs(Number(y.cantidad)||Math.abs(P)||0))},0),C=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${F}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Stock actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">+${X}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Entradas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#fef2f2;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#ef4444;">-${_}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Salidas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#374151;">${i.length}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Movimientos</div>
      </div>
    </div>
    ${I}
    ${i.length>0?`
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      <thead><tr style="background:#f9fafb;font-size:.73rem;color:#9ca3af;font-weight:700;">
        <th style="padding:7px 10px;text-align:left;">Fecha</th>
        <th style="padding:7px 10px;text-align:left;">Tipo</th>
        <th style="padding:7px 10px;text-align:center;">Cant.</th>
        <th style="padding:7px 10px;text-align:center;">Stock</th>
        <th style="padding:7px 10px;text-align:left;">Motivo</th>
      </tr></thead>
      <tbody>${z}</tbody>
    </table>
    ${i.length>30?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${i.length-30} m\xE1s</p>`:""}`:""}
  `,j=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button onclick="(function(){
        var movs=${JSON.stringify(i.map(f=>({fecha:f.fecha||(f._ts?new Date(f._ts).toLocaleDateString("es-MX"):""),hora:f.hora||"",tipo:f.tipo||"",cantidad:f.cantidad||0,motivo:f.motivo||"",stockAntes:f.stockAntes??"",stockDespues:f.stockDespues??""})))};
        var headers=['Fecha','Hora','Tipo','Cantidad','Motivo','Stock antes','Stock despu\xE9s'];
        var csv=headers.join(',')+'\\n';
        movs.forEach(function(m){
          var row=[m.fecha,m.hora,m.tipo,m.cantidad,m.motivo,m.stockAntes,m.stockDespues];
          csv+=row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',')+'\\n';
        });
        var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;a.download='kardex-${e(a.name||"producto").replace(/[^a-zA-Z0-9]/g,"_")}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('\u{1F4E5} Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        \u{1F4E5} Exportar CSV
      </button>
    </div>
    ${C}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${e(a.name||"Producto")} (90d)`,j,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const t=window.inventarioSnapshots||[];if(t.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const e=[...t].sort((_,C)=>(_.fecha||"").localeCompare(C.fecha||"")),a=e.map(_=>_.fecha||""),r=e.map(_=>Number(_.valorTotal||_.valor||0)),n=540,i=140,s=Math.max(1,...r),d=Math.min(...r),l=s-d||1,p=`<polyline points="${r.map((_,C)=>{const j=20+C/Math.max(1,r.length-1)*(n-40),f=i-20-(_-d)/l*(i-40);return`${j},${f}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,b=r.map((_,C)=>{const j=20+C/Math.max(1,r.length-1)*(n-40),f=i-20-(_-d)/l*(i-40);return`<circle cx="${j}" cy="${f}" r="3.5" fill="#6366f1" opacity=".9"><title>${a[C]}: $${_.toLocaleString("es-MX")}</title></circle>`}).join(""),h=a.filter((_,C)=>C===0||C===a.length-1||C%Math.ceil(a.length/6)===0).map((_,C,j)=>`<text x="${20+a.indexOf(_)/Math.max(1,a.length-1)*(n-40)}" y="${i-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${_.slice(5)}</text>`).join(""),I=r[r.length-1]||0,x=r[0]||0,z=x>0?((I-x)/x*100).toFixed(1):"\u2014",F=Number(z)>=0?"#10b981":"#ef4444",X=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${I.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${F};">${Number(z)>=0?"+":""}${z}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variaci\xF3n total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${e.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${n} ${i}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${i-20}" x2="${n-10}" y2="${i-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${p}${b}${h}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">\u2190 Valor de inventario en costo \xB7 ${e.length} puntos</p>
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",X,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;function abrirMovimientosRecientes(){const t=_esc,e=[...window.stockMovements||window.stockMovimientos||[]].slice(0,50);if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin movimientos registrados a\xFAn","warn");return}const a={ajuste:"#6366f1",entrada:"#10b981",compra:"#10b981",merma:"#ef4444",salida:"#ef4444",descuento:"#f59e0b",produccion:"#f59e0b",conteo:"#3b82f6",ajuste_positivo:"#10b981"},r=e.map(i=>{const s=(i.fecha||"").split("T"),d=s[0]||"",l=(s[1]||"").substring(0,5),c=(i.tipo||"").toLowerCase(),p=i.stockDespues!=null&&i.stockAntes!=null?Number(i.stockDespues)-Number(i.stockAntes):0,b=p>0||c.includes("entrada")||c.includes("compra")||c.includes("ajuste_positivo"),h=Number(i.cantidad)||Math.abs(p)||0,I=b?`<span style="color:#10b981;font-weight:700;">+${h}</span>`:`<span style="color:#ef4444;font-weight:700;">\u2212${h}</span>`,x=a[c]||"#6b7280",z=`<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${x}22;color:${x};font-size:.7rem;font-weight:700;">${t(i.tipo||"\u2014")}</span>`,F=i.productoId?`<button onclick="abrirMovimientoProducto('${t(String(i.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${t(i.productoNombre||i.productoId)}</button>`:`<span style="font-size:.8rem;">${t(i.productoNombre||"\u2014")}</span>`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${t(d)} <span style="color:#9ca3af;font-size:.7rem;">${l}</span></td>
      <td style="padding:6px 10px;">${F}</td>
      <td style="padding:6px 10px;">${z}</td>
      <td style="padding:6px 10px;text-align:center;">${I}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${i.stockDespues!=null?i.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.74rem;color:#9ca3af;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t(i.motivo||"")}">${t(i.motivo||"")}</td>
    </tr>`}).join(""),n=`
    <p style="font-size:.78rem;color:#9ca3af;margin-bottom:10px;">\xDAltimos ${e.length} movimientos de inventario \xB7 Haz clic en el producto para ver su kardex completo</p>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:.8rem;">
        <thead>
          <tr style="background:#f9fafb;font-size:.72rem;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">
            <th style="padding:7px 10px;text-align:left;">Fecha</th>
            <th style="padding:7px 10px;text-align:left;">Producto</th>
            <th style="padding:7px 10px;text-align:left;">Tipo</th>
            <th style="padding:7px 10px;text-align:center;">Cant.</th>
            <th style="padding:7px 10px;text-align:center;">Stock final</th>
            <th style="padding:7px 10px;text-align:left;">Motivo</th>
          </tr>
        </thead>
        <tbody>${r}</tbody>
      </table>
    </div>`;_mkInvModal("mkMovRecientes","\u{1F4CB} Movimientos Recientes \u2014 Inventario",n,"820px")}window.abrirMovimientosRecientes=abrirMovimientosRecientes;
//# sourceMappingURL=inventory-5.js.map
