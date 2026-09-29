"use strict";function _levenshtein(t,e){const s=t.length,r=e.length,i=Array.from({length:s+1},(a,n)=>Array.from({length:r+1},(l,d)=>d===0?n:0));for(let a=1;a<=r;a++)i[0][a]=a;for(let a=1;a<=s;a++)for(let n=1;n<=r;n++)i[a][n]=t[a-1]===e[n-1]?i[a-1][n-1]:1+Math.min(i[a-1][n],i[a][n-1],i[a-1][n-1]);return i[s][r]}window._levenshtein=_levenshtein;function _fuzzyMatch(t,e,s=2){return t=t.toLowerCase().trim(),e=e.toLowerCase(),!t||e.includes(t)?!0:e.split(/[\s,.-]+/).some(i=>{const a=i.substring(0,t.length+2);return a.length>=t.length-1&&_levenshtein(t,a)<=s})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){return!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0?null:typeof window.calcularPiezasFabricables=="function"?window.calcularPiezasFabricables(t):0}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",r=>{r.target===t&&(t.style.display="none")}),document.body.appendChild(t));const s=[...new Set((window.products||[]).map(r=>r.category).filter(Boolean))].map(r=>{const i=(window.categories||[]).find(a=>String(a.id)===String(r));return`<option value="${_esc(r)}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:r)}</option>`}).join("");t.innerHTML=`
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
                    ${s}
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
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function abrirBulkStockModal(){let t=document.getElementById("bulkStockModal");t||(t=document.createElement("div"),t.id="bulkStockModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",r=>{r.target===t&&(t.style.display="none")}),document.body.appendChild(t));const s=[...new Set((window.products||[]).filter(r=>r.tipo==="materia_prima").map(r=>r.category).filter(Boolean))].map(r=>{const i=(window.categories||[]).find(a=>String(a.id)===String(r));return`<option value="${_esc(String(r))}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:String(r))}</option>`}).join("");t.innerHTML=`
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
                    ${s}
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
    </div>`,t.style.display="flex",_bulkStockPreview()}window.abrirBulkStockModal=abrirBulkStockModal;function _bulkStockPreview(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),e=document.getElementById("bulkStockCat")?.value||"",s=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!e||String(i.category)===e)),r=document.getElementById("bulkStockPreviewList");if(r){if(t===0){r.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ingresa una cantidad distinta de 0</p>';return}r.innerHTML=`
        <div style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:6px;">${s.length} producto${s.length!==1?"s":""} afectados:</div>
        ${s.slice(0,20).map(i=>{const a=typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0,n=Math.max(0,a+t);return`<div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f3f4f6;font-size:.76rem;">
                <span>${_esc(i.name)}</span>
                <span>${a} \u2192 <b style="color:${t>0?"#16a34a":"#dc2626"}">${n}</b></span>
            </div>`}).join("")}
        ${s.length>20?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:6px;">...y ${s.length-20} m\xE1s</p>`:""}`}}window._bulkStockPreview=_bulkStockPreview;async function _bulkStockAplicar(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),e=document.getElementById("bulkStockCat")?.value||"";if(t===0){manekiToastExport("Ingresa una cantidad distinta de 0","warn");return}const s=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!e||String(i.category)===e));if(s.length===0){manekiToastExport("Sin productos para ajustar","warn");return}const r=typeof getStockEfectivo=="function"?getStockEfectivo:i=>Number(i.stock)||0;s.forEach(i=>{const a=r(i);i.stock=Math.max(0,a+t),typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:i.id,productoNombre:i.name,tipo:t>0?"entrada":"merma",cantidad:Math.abs(t),motivo:`Ajuste masivo ${t>0?"+":""}${t}`,stockAntes:a,stockDespues:i.stock})}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkStockModal").style.display="none",manekiToastExport(`\u2705 Stock ajustado en ${s.length} producto(s)`,"ok")}window._bulkStockAplicar=_bulkStockAplicar;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,e=document.getElementById("bulkPrecioSoloPT")?.checked||!1,s=document.getElementById("bulkPrecioSoloMP")?.checked||!1,r=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(i=>r&&String(i.category)!==r?!1:e&&s?!0:!(e&&!(!i.tipo||i.tipo==="producto"||i.tipo==="producto_interno"||i.tipo==="pack")||s&&i.tipo!=="materia_prima")).map(i=>{const a=s&&!e?"cost":"price",n=Number(i[a])||0,l=Math.max(0,Math.round(n*(1+t/100)*100)/100);return{p:i,campoKey:a,precioActual:n,precioNuevo:l}}).filter(i=>i.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const e=_bulkPrecioGetAfectados();if(!e.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=e.slice(0,50).map(({p:s,campoKey:r,precioActual:i,precioNuevo:a})=>{const n=a-i,l=n>0?"#16a34a":n<0?"#dc2626":"#6b7280",d=r==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(s.name)}">${_esc(s.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${d}: $${i.toFixed(2)}</span>
            <span style="font-weight:700;color:${l};white-space:nowrap;">\u2192 $${a.toFixed(2)}</span>
        </div>`}).join("")+(e.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${e.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const e=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,s=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",r=e>0?"+":"",i=t.slice(0,5).map(({p:a,precioActual:n,precioNuevo:l})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(a.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${n.toFixed(2)}</span>
            <span style="font-weight:700;color:${l>n?"#16a34a":"#dc2626"};">\u2192 $${l.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${r}${e}%</strong> al ${s} de <strong>${t.length}</strong> producto(s):</p>
                ${i}
             </div>`,"\u2705 Confirmar cambio masivo").then(a=>{a&&(t.forEach(({p:n,campoKey:l,precioNuevo:d})=>{n[l]=d,n.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${r}${e}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:a,campoKey:n,precioNuevo:l})=>{a[n]=l,a.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function inventoryVariantGridHTML(t){const e=(t.variants||[]).filter(n=>n.size&&n.color);if(!e.length)return"";const s=[...new Set(e.map(n=>String(n.size)))].slice(0,5),r=[...new Set(e.map(n=>String(n.color)))].slice(0,4),i=(t.mpComponentes||[]).length&&typeof calcularPiezasFabricables=="function"?Math.max(0,Number(calcularPiezasFabricables(t))||0):0,a=s.map(n=>`<tr><th scope="row">${_esc(n)}</th>${r.map(l=>{const d=e.find(y=>y.size===n&&y.color===l);if(!d)return'<td class="pos-variant-missing" aria-label="Combinaci\xF3n no configurada">\u2014</td>';const c=Math.max(0,Number(d.qty)||0),p=c?"available":i?"makeable":"unavailable",b=c?`${c} terminadas`:i?"Fabricable con material compartido":"Sin material disponible";return`<td class="pos-variant-${p}" title="${_esc(n)}, ${_esc(l)}: ${b}" aria-label="${_esc(n)}, ${_esc(l)}: ${b}">${c||(i?"\u25D0":"0")}</td>`}).join("")}</tr>`).join("");return`<div class="pos-variant-preview"><div class="pos-variant-preview-title">Tallas y colores <span><i class="pos-variant-key pos-variant-available"></i> Terminadas \xB7 <i class="pos-variant-key pos-variant-makeable"></i> Fabricables \xB7 <i class="pos-variant-key pos-variant-unavailable"></i> Sin material</span></div><div class="pos-variant-preview-scroll"><table><thead><tr><th></th>${r.map(n=>`<th scope="col">${_esc(n)}</th>`).join("")}</tr></thead><tbody>${a}</tbody></table></div><small>${i} fabricables con material compartido; no se suman por variante.</small><button type="button" data-action="posAbrirMatriz" data-arg="${_esc(String(t.id))}" class="mk-toolbar-btn">Ver matriz completa</button></div>`}function inventoryCardHTML(t,e,s){const r=_esc(String(t.id)),i=_esc(t.name||"Sin nombre"),a=t.imageUrl?`<button type="button" class="pos-inv-image-button" data-action="inventoryOpenGallery" data-arg="${r}" aria-label="Ampliar fotos de ${i}"><img src="${_esc(t.imageUrl)}" alt="${i}" loading="lazy" style="width:100%;height:132px;object-fit:cover;border-radius:12px;background:#f8f4ec;"></button>`:`<div aria-hidden="true" style="height:132px;display:grid;place-items:center;border-radius:12px;background:#f8f4ec;font-size:2.6rem;">${_esc(t.image||(s==="mp"?"\u{1F3ED}":"\u{1F4E6}"))}</div>`,n=(t.tablaPreciosVariable||[]).slice().sort((b,y)=>Number(b.cantidadMin)-Number(y.cantidadMin)),l=s==="pv"&&n.length?Number(n[0].precio)/Math.max(1,Number(n[0].cantidadMin)):Number(s==="mp"||s==="svc"?t.cost:t.price),d=s==="svc"?"Servicio":`${Math.max(0,Number(e)||0)} disponibles`,c=s!=="svc"&&e<=Number(t.stockMin??5),p={pt:"Producto",pv:"Precio por cantidad",mp:"Materia prima",svc:"Servicio"}[s]||"Producto";return`<article class="pos-inv-card" data-id="${r}" style="background:#fff;border:1px solid #e6e2d8;border-radius:16px;padding:12px;box-shadow:0 3px 14px #1c4f320d;display:flex;flex-direction:column;gap:8px;min-width:0;">
        ${a}
        <div style="font-size:.69rem;color:#678d47;font-weight:800;text-transform:uppercase;letter-spacing:.06em;">${p}</div>
        <strong style="font-size:.96rem;color:#243529;line-height:1.3;min-height:2.5em;">${i}</strong>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:1.08rem;font-weight:800;color:#1c4f32;">${fmtMoney(Number.isFinite(l)?l:0)}</span>
            <span style="font-size:.73rem;font-weight:700;color:${c?"#a63126":"#236449"};background:${c?"#fff0ed":"#eaf7ee"};border-radius:99px;padding:4px 8px;">${d}</span>
        </div>
        ${s==="pt"||s==="pv"?inventoryVariantGridHTML(t):""}
        ${typeof window.posRecordSyncStatus=="function"?`<small class="pos-record-sync" data-sync-table="products" data-sync-id="${r}" data-state="${window.posRecordSyncStatus("products",String(t.id)).state}">${window.posRecordSyncStatus("products",String(t.id)).text}</small>`:""}
        <div style="display:flex;gap:7px;margin-top:auto;">
            <button type="button" data-action="editProduct" data-arg="${r}" class="mk-toolbar-btn" style="flex:1;justify-content:center;">Editar</button>
            ${s==="svc"?"":`<button type="button" data-action="ajustarStock" data-arg="${r}" class="mk-toolbar-btn" style="flex:1;justify-content:center;">Ajustar</button>`}
        </div>
    </article>`}window.inventoryCardHTML=inventoryCardHTML;function inventoryOpenGallery(t){const e=(window.products||[]).find(y=>String(y.id)===String(t));if(!e)return;const s=[...new Set([e.imageUrl,...e.imageUrls||[]].filter(y=>{try{const P=new URL(y,location.origin);return["https:","http:","blob:"].includes(P.protocol)||/^data:image\/(?:webp|png|jpeg|gif);base64,/i.test(String(y))}catch{return!1}}))];if(!s.length)return;const r=document.createElement("dialog");r.className="pos-gallery-dialog";const i=document.createElement("h2");i.textContent=e.name||"Fotos del producto";const a=document.createElement("button");a.type="button",a.textContent="Cerrar",a.className="mk-toolbar-btn",a.onclick=()=>r.close();const n=document.createElement("img");n.alt=i.textContent||"Producto";const l=document.createElement("span"),d=document.createElement("button");d.type="button",d.textContent="\u2190 Anterior",d.className="mk-toolbar-btn";const c=document.createElement("button");c.type="button",c.textContent="Siguiente \u2192",c.className="mk-toolbar-btn";let p=0;const b=()=>{n.src=String(s[p]),l.textContent=`${p+1} de ${s.length}`,d.disabled=p===0,c.disabled=p===s.length-1};d.onclick=()=>{p--,b()},c.onclick=()=>{p++,b()},r.append(i,a,n,d,l,c),r.addEventListener("close",()=>r.remove()),document.body.appendChild(r),b(),r.showModal()}window.inventoryOpenGallery=inventoryOpenGallery;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const e=window._invViewMode||(window._invViewMode=localStorage.getItem("mk-inventory-view")==="cards"?"cards":"table");document.getElementById("inventoryPaginationBar")?.remove();const s=window.products||[],r=document.getElementById("inventoryTipoFilter")?.value||"",i=["pt","pv","mp","svc"].map(o=>`${o}:${window[`_invPage_${o}`]||1}`).join("|"),a=s.length+"_"+s.reduce((o,m)=>o+Number(m.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+r+"_"+i+"_"+(window._invPageSize||10)+"_"+(window._invSortCol||"")+"_"+(window._invSortDir||""),n=document.getElementById("invDualContainer");n&&(n._lastHash=a);let l=document.getElementById("invDualContainer");if(!l){const o=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;l=document.createElement("div"),l.id="invDualContainer",l.style.cssText="display:flex;flex-direction:column;gap:0;",o.parentNode.insertBefore(l,o),o.style.display="none"}let d=document.getElementById("invViewToggle");d||(d=document.createElement("button"),d.id="invViewToggle",d.className="mk-toolbar-btn",d.style.cssText="margin:0 0 10px 8px;",d.addEventListener("click",()=>{window._invViewMode=window._invViewMode==="cards"?"table":"cards",localStorage.setItem("mk-inventory-view",window._invViewMode),renderInventoryTable()}),l.parentNode.insertBefore(d,l)),d.textContent=e==="cards"?"\u2637 Ver tabla":"\u25A6 Ver tarjetas",d.setAttribute("aria-label",e==="cards"?"Cambiar inventario a tabla":"Cambiar inventario a tarjetas");const c=window.products||[],p=new Map(c.map(o=>[String(o.id),typeof getStockEfectivo=="function"?getStockEfectivo(o):Number(o.stock)||0]));if(window._invStockCache=p,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const o=document.createElement("style");o.id="invExtraColStyles",o.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(o)}let b=document.getElementById("invExtraColToggle");if(b||(b=document.createElement("button"),b.id="invExtraColToggle",b.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",b.textContent="Mostrar SKU/Proveedor",b.addEventListener("click",()=>{const o=document.getElementById("invDualContainer");if(!o)return;const m=o.classList.toggle("inv-show-extra");b.textContent=m?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),l.parentNode.insertBefore(b,l)),b.style.display=e==="cards"?"none":"",c.length===0){l.innerHTML=`
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
        </div>`;return}const y=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",P=(document.getElementById("inventoryTagFilter")||{}).value||"",x=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function C(o){const m=window._normSearch||(h=>String(h||"").toLowerCase()),f=m(y),$=m(x),w=h=>!P||h.tags&&h.tags.includes(P),k=h=>!x||m(h.proveedor||"").includes($);if(!y)return o.filter(h=>w(h)&&k(h));const M=o.filter(h=>(m(h.name).includes(f)||m(h.sku||"").includes(f)||m(h.proveedor||"").includes(f)||m(h.notas||"").includes(f)||(h.tags||[]).some(X=>m(X).includes(f)))&&w(h)&&k(h));return M.length>0?M:o.filter(h=>(_fuzzyMatch(f,h.name||"")||_fuzzyMatch(f,h.sku||"")||_fuzzyMatch(f,h.proveedor||""))&&w(h)&&k(h))}const F=C(c.filter(o=>o.tipo==="materia_prima")),G=C(c.filter(o=>o.tipo==="servicio")),_=C(c.filter(o=>o.tipo==="producto_variable")),T=C(c.filter(o=>!o.tipo||o.tipo==="producto"||o.tipo==="producto_interno"||o.tipo==="pack")),j=new Set([...T,..._].map(o=>String(o.id))),u=window.productMap||new Map(c.map(o=>[String(o.id),o])),v=new Map;for(const o of c)o.mpComponentes&&o.mpComponentes.length>0&&j.has(String(o.id))&&v.set(String(o.id),calcularDisponibilidadDesdeMP(o,u,p));function z(o){if(!window._invSortCol)return o;const m=window._invSortCol,f=window._invSortDir;return[...o].sort(($,w)=>{let k,M;return m==="name"?(k=($.name||"").toLowerCase(),M=(w.name||"").toLowerCase()):m==="sku"?(k=($.sku||"").toLowerCase(),M=(w.sku||"").toLowerCase()):m==="category"?(k=($.category||"").toLowerCase(),M=(w.category||"").toLowerCase()):m==="price"?(k=Number($.price)||0,M=Number(w.price)||0):m==="stock"?(k=Number($.stock)||0,M=Number(w.stock)||0):m==="margin"&&(k=$.cost&&$.price?($.price-$.cost)/$.price:-1,M=w.cost&&w.price?(w.price-w.cost)/w.price:-1),k<M?f==="asc"?-1:1:k>M?f==="asc"?1:-1:0})}function V(o,m){const f=String(o.id),$=p.get(f)??(typeof getStockEfectivo=="function"?getStockEfectivo(o):parseInt(o.stock)||0),w=o.imageUrl?`<button type="button" class="pos-inv-image-button" data-action="inventoryOpenGallery" data-arg="${_esc(f)}" aria-label="Ampliar fotos de ${_esc(o.name||"producto")}"><img src="${_esc(o.imageUrl)}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy"></button>`:`<span style="font-size:1.6rem;">${o.image||"\u{1F3ED}"}</span>`;let k;$===0?k='<span class="badge-danger"><i class="fas fa-circle-xmark"></i> Agotado</span>':$<=(o.stockMin||5)?k='<span class="badge-warning"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':k='<span class="badge-success"><i class="fas fa-circle-check"></i> Disponible</span>';const M=(window.categories||[]).find(D=>D.id===o.category),h=M?M.name:o.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(h)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#9669c4;font-weight:600;">$${Number(o.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(o.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${f}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <button type="button" class="pos-inv-edit pos-inv-edit--stock" data-action="editarStockInline" aria-label="Ajustar existencias" data-arg="${f}" title="Ajustar existencias">
                        ${$} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(o.unidad||"pza")}</span>
                    </button>
                </div>
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    <button type="button" data-action="editProduct" data-arg="${f}" title="Editar" aria-label="Editar" class="pos-inv-icon"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="ajustarStock" data-arg="${f}" title="Ajustar stock" aria-label="Ajustar stock" class="pos-inv-icon">\u{1F4E6}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" data-action="_invMpMenu" data-arg="${f}" data-pass-el="before" title="M\xE1s acciones" aria-label="M\xE1s acciones" class="pos-inv-icon"><i class="fas fa-ellipsis"></i></button>
                    </div>
                </div>
            </td>
        </tr>`}function U(o,m){const f=String(o.id),$=`<span style="font-size:1.6rem;">${o.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
                    <button data-action="openServicioModal" data-arg="${f}" title="Editar"
                        aria-label="Editar" class="pos-inv-icon"><i class="fas fa-pen"></i></button>
                    <button data-action="deleteProduct" data-arg="${f}" title="Eliminar"
                        aria-label="Eliminar" class="pos-inv-icon"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function Y(o,m){const f=String(o.id),$=o.imageUrl?`<button type="button" class="pos-inv-image-button" data-action="inventoryOpenGallery" data-arg="${_esc(f)}" aria-label="Ampliar fotos de ${_esc(o.name||"producto")}"><img src="${_esc(o.imageUrl)}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy"></button>`:`<span style="font-size:1.6rem;">${o.image||"\u{1F4E6}"}</span>`,w=(window.categories||[]).find(g=>g.id===o.category),k=w?w.name:o.category||"",M=v.get(f)??null;let h,D;if(M!==null){const g=M.piezas,I=g===0?"#ef4444":g<=3?"#f59e0b":"#10b981",B=g===0?"#fee2e2":g<=3?"#fef3c7":"#d1fae5",S=M.detalle.map(R=>`${R.nombre}: ${R.stock}\xF7${R.qty}=${R.posibles}pzs`).join(" | ");h=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(S)}"
                        style="padding:3px 12px;border-radius:8px;background:${B};color:${I};
                               font-weight:700;font-size:.95rem;border:1px solid ${I}33;cursor:help;">
                        ${g}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,D=g===0?'<span class="badge-danger">Sin stock MP</span>':g<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const g=p.get(String(o.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(o):o.stock||0),I=o.stockMin||5,B=g===0?"#ef4444":g<=I?"#f59e0b":"#10b981";h=`<span style="padding:3px 12px;border-radius:8px;background:${g===0?"#fee2e2":g<=I?"#fef3c7":"#d1fae5"};color:${B};font-weight:700;font-size:.95rem;">${g}</span>`,D=g===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-xmark"></i> Agotado</span>':g<=I?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-check"></i> Disponible</span>'}const X=`_invVar_${f}_open`,H=window[X]===!0,Q=o.variants&&o.variants.length>0?`<div>
                <button data-action="_mkInvToggleVarCollapse" data-arg="${f}" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${H?"\u25B2":"\u25B6"} ${o.variants.length} variante${o.variants.length!==1?"s":""}
                </button>
                ${H?'<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">'+o.variants.map(g=>`
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(g.type)}:</span>
                        ${_mkColorDot(g.type,_esc(g.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(g.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${g.qty??0}</span>
                    </div>`).join("")+"</div>":""}
               </div>`:'<span class="text-xs text-gray-400">Sin variantes</span>',J=Number(o.cost)||0,K=Number(o.price)||0,q=J&&K?(()=>{const g=(K-J)/K*100,I=g>=40?"#10b981":g>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${I};">${g.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,g).toFixed(0)}%;background:${I};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
                    ${(()=>{const g=calcularProducibles(o);if(g===null)return"";const I=g>=5?"#16a34a":g>=1?"#d97706":"#dc2626",B=g>=5?"#d1fae5":g>=1?"#fef3c7":"#fee2e2",S=g===0?"Sin stock MP":`Producibles: ${g}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${B};color:${I};border:1px solid ${I}33;">\u{1F3ED} ${S}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(k)}</td>
            <td class="px-4 py-3">${Q}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" style="font-size:.95rem;"><button type="button" class="pos-inv-edit" data-action="invInlineEditPrice" data-arg="${f}" aria-label="Editar precio">$${Number(o.price||0).toFixed(2)} <span>Editar</span></button></td>
            <td class="px-4 py-3">${h}<button type="button" class="pos-inv-edit pos-inv-edit--stock" data-action="invInlineEditStock" data-arg="${f}">Ajustar stock</button></td>
            <td class="px-4 py-3">${D}</td>
            <td class="px-4 py-3">${q}</td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    ${o.tipo==="pack"?`<button type="button" data-action="openPackModal" data-arg="${f}" title="Editar Pack" aria-label="Editar pack"
                            class="pos-inv-icon"><i class="fas fa-pen"></i></button>`:`<button type="button" data-action="editProduct" data-arg="${f}" title="Editar" aria-label="Editar producto"
                            class="pos-inv-icon"><i class="fas fa-pen"></i></button>`}
                    <button type="button" data-action="duplicarProducto" data-arg="${f}" title="Duplicar" aria-label="Duplicar producto"
                        class="pos-inv-icon"><i class="fas fa-copy"></i></button>
                    ${o.tipo!=="pack"?`<button type="button" data-action="cambiarTipoProducto" data-arg="${f}" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        class="pos-inv-icon">\u2192\u{1F9EA}</button>`:""}
                    ${o.movimientos&&o.movimientos.length?`<button type="button" data-action="verMovimientosProducto" data-arg="${f}" title="Ver movimientos de stock (${o.movimientos.length})" aria-label="Ver movimientos de stock"
                        class="pos-inv-icon"><i class="fas fa-copy"></i></button>`:""}
                    <button type="button" data-action="abrirMovimientoProducto" data-arg="${f}" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        class="pos-inv-icon"><i class="fas fa-chart-line"></i></button>
                    <button type="button" data-action="archivarProducto" data-arg="${f}" title="${o.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        class="pos-inv-icon">${o.activo===!1?'<i class="fas fa-lock-open"></i>':'<i class="fas fa-box-archive"></i>'}</button>
                    <button type="button" data-action="deleteProduct" data-arg="${f}" title="Eliminar" aria-label="Eliminar producto"
                        class="pos-inv-icon"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function A(o,m){const f=String(o.id),$=o.imageUrl?`<button type="button" class="pos-inv-image-button" data-action="inventoryOpenGallery" data-arg="${_esc(f)}" aria-label="Ampliar fotos de ${_esc(o.name||"producto")}"><img src="${_esc(o.imageUrl)}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy"></button>`:`<span style="font-size:1.6rem;">${o.image||"\u{1F3AF}"}</span>`,w=(o.tablaPreciosVariable||[]).slice().sort((E,W)=>E.cantidadMin-W.cantidadMin),k=w.length?w.map(E=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${E.cantidadMin} pzas = $${Number(E.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',M=(o.mpComponentes||[]).length,h=(window.categories||[]).find(E=>String(E.id)===String(o.category)),D=h?`${h.emoji||""} ${h.name}`:"\u2014",X=w,H=X.length?X[0].precio/(X[0].cantidadMin||1):0,ot=H>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${H.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',Q=v.get(String(o.id))??null;let J,K;if(Q!==null){const E=Q.piezas,W=E===0?"#ef4444":E<=3?"#f59e0b":"#10b981",rt=E===0?"#fee2e2":E<=3?"#fef3c7":"#d1fae5",lt=Q.detalle.map(tt=>`${tt.nombre}: ${tt.stock}\xF7${tt.qty}=${tt.posibles}pzs`).join(" | ");J=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(lt)}" style="padding:3px 12px;border-radius:8px;background:${rt};color:${W};font-weight:700;font-size:.95rem;border:1px solid ${W}33;cursor:help;">${E}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,K=E===0?'<span class="badge-danger">Sin stock MP</span>':E<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else J='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',K='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const q=(o.mpComponentes||[]).reduce((E,W)=>E+(parseFloat(W.costUnit)||0)*(parseFloat(W.qty)||1),0),g=o.rendimientoPorHoja||1,I=g>0?q/g:q,B=H>0?Math.round((H-I)/H*100):0,S=B>=40?"#10b981":B>=20?"#f59e0b":"#ef4444",R=H>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${S};">${B}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,B)}%;background:${S};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
            <td class="px-4 py-3">${K}</td>
            <td class="px-4 py-3">${R}</td>
            <td class="px-2 py-3">
                <div class="pos-inv-actions">
                    <button type="button" data-action="editProduct" data-arg="${f}" title="Editar" aria-label="Editar producto con precio por cantidad"
                        class="pos-inv-icon"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="duplicarProducto" data-arg="${f}" title="Duplicar" aria-label="Duplicar producto con precio por cantidad"
                        class="pos-inv-icon"><i class="fas fa-copy"></i></button>
                    <button type="button" data-action="deleteProduct" data-arg="${f}" title="Eliminar" aria-label="Eliminar producto con precio por cantidad"
                        class="pos-inv-icon"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function Z({id:o,title:m,titleColor:f,titleBg:$,btnLabel:w,btnOnclick:k,btnColor:M=null,extraBtnHTML:h="",products:D,renderFila:X,headers:H,emptyMsg:ot}){const Q=document.getElementById("inventoryTipoFilter")?.value||"";if(Q==="materia"&&o!=="mp"||Q==="producto"&&o==="mp")return"";const J=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(D.length===0&&J)return"";const K=z(D),q=`_invPage_${o}`,g=window._invPageSize||10;window[q]=window[q]||1;const I=K.length,B=Math.max(1,Math.ceil(I/g));window[q]>B&&(window[q]=1);const S=window[q],R=(S-1)*g,E=K.slice(R,R+g),W=E.length===0?`<tr><td colspan="${H.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${ot}</td></tr>`:E.map((L,nt)=>X(L,nt)).join(""),rt=E.length?E.map(L=>inventoryCardHTML(L,v.get(String(L.id))?.piezas??p.get(String(L.id))??0,o)).join(""):`<p style="padding:24px;color:#6b7280;">${ot}</p>`,lt=H.map(L=>{const nt=L.colId==="sku"?" inv-col-hidden-sku":L.colId==="proveedor"?" inv-col-hidden-prov":"",it=L.align==="right"?" text-right":" text-left";return L.sortKey?`<th class="px-4 py-3${it} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${nt}" data-action="sortInventory" data-arg="${L.sortKey}" style="white-space:nowrap;">${L.label} \u2195</th>`:`<th class="px-4 py-3${it} text-xs font-semibold text-gray-500 uppercase tracking-wide${nt}" style="white-space:nowrap;">${L.label}</th>`}).join("");let tt="";if(B>1||I>g){const L=Math.min(R+g,I);tt=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${R+1}\u2013${L}</b> de <b>${I}</b></span>
                <div style="display:flex;gap:4px;">
                    <button data-action="invSectionPage" data-arg="${o}" data-arg2="${S-1}" onclick="invSectionPage('${o}', ${S-1})" ${S<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${S<=1?"default":"pointer"};opacity:${S<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,B)},(nt,it)=>{let N=S<=3?it+1:S+it-2;return N<1&&(N=null),N>B&&(N=null),N===null?"":`<button data-action="invSectionPage" data-arg="${o}" data-arg2="${N}" onclick="invSectionPage('${o}', ${N})" style="min-width:30px;padding:4px 8px;border:1px solid ${N===S?"#FFD166":"#e5e7eb"};border-radius:7px;background:${N===S?"#FFD166":"#fff"};color:${N===S?"#fff":"#374151"};font-weight:${N===S?700:400};font-size:13px;cursor:${N===S?"default":"pointer"};" ${N===S?"disabled":""}>${N}</button>`}).join("")}
                    <button data-action="invSectionPage" data-arg="${o}" data-arg2="${S+1}" onclick="invSectionPage('${o}', ${S+1})" ${S>=B?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${S>=B?"default":"pointer"};opacity:${S>=B?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}const xt=`_invSec_${o}_collapsed`,dt=window[xt]===!0;return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${f}33;box-shadow:0 2px 12px ${f}11;">
            <!-- Header de secci\xF3n (clicable para colapsar) -->
            <div class="pos-inv-section-head" style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${$};border-bottom:${dt?"none":"1.5px solid "+f+"33"};cursor:pointer;" data-action="_mkInvToggleCollapse" data-arg="${o}">
                <div class="pos-inv-section-title" style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${f};transition:transform .2s;">${dt?"\u25B6":"\u25BC"}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${f};">${m}</span>
                    <span style="background:${f};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${I}</span>
                </div>
                <div class="pos-inv-section-tools" style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${h||""}
                    <button type="button" data-action="_mkInvAddBtnAction" data-arg="${o}" onclick="_mkInvAddBtnAction('${o}')" class="mk-btn-primary">
                        ${w}
                    </button>
                </div>
            </div>
            ${dt?"":`
            <!-- Vista de inventario -->
            ${e==="cards"?`<div class="pos-inv-card-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;padding:16px;background:#fdfbf7;">${rt}</div>`:`<div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${lt}</tr>
                    </thead>
                    <tbody>${W}</tbody>
                </table>
            </div>`}
            ${tt}`}
        </div>`}const O=c.filter(o=>!o.deletedAt),ct=O.length,gt=O.reduce((o,m)=>{const f=p.get(String(m.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(m):Number(m.stock)||0);return o+(Number(m.cost)||0)*Math.max(0,f)},0),pt=O.filter(o=>(p.get(String(o.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(o):Number(o.stock)||0))<=(o.stockMin||5)).length,at=O.filter(o=>(!o.tipo||o.tipo==="producto"||o.tipo==="producto_interno"||o.tipo==="pack")&&Number(o.price)>0),st=at.length?at.reduce((o,m)=>{const f=Number(m.price)||0,$=Number(m.cost)||0;return o+(f>0?(f-$)/f*100:0)},0)/at.length:0;let et=document.getElementById("invKpiBar");et||(et=document.createElement("div"),et.id="invKpiBar",l.parentNode.insertBefore(et,l)),et.innerHTML=`
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
    </div>`;const ut=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#9A6500",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",extraBtnHTML:'<button type="button" data-action="_mkInvCreatePack" onclick="_mkInvCreatePack()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" data-action="abrirBulkPrecioModal" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:T,renderFila:Y,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos con precio por cantidad",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Precio por cantidad",btnOnclick:"injectVariableProductModal();openVariableProductModal()",products:_,renderFila:A,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos con precio por cantidad. Agrega playeras, stickers o tarjetas."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#76469c",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",extraBtnHTML:'<button type="button" data-action="abrirBulkStockModal" onclick="abrirBulkStockModal()" class="mk-toolbar-btn">\u{1F4E6} Ajustar stock masivo</button>',products:F,renderFila:V,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#7d4fa3",titleBg:"linear-gradient(135deg,#f5f3ff,#f6ecff)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",products:G,renderFila:U,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],mt=(y||P||x).length>0;let ft=!1;for(const o of ut){const m=Z(o);m&&(ft=!0);let f=document.getElementById(`invSec_${o.id}`);f||(f=document.createElement("div"),f.id=`invSec_${o.id}`,l.appendChild(f));const $=o.products.map(k=>[k.id,k.updatedAt||"",k.stock||0,k.price||0,k.cost||0,k.activo===!1?"0":"1"].join(":")).join("|"),w=o.products.length+"_"+$+"_"+(window[`_invPage_${o.id}`]||1)+"_"+(window._invPageSize||10)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r+"_"+e;f._hash!==w&&(f.innerHTML=m,f._hash=w)}const bt=new Set(ut.map(o=>`invSec_${o.id}`));for(let o=l.children.length-1;o>=0;o--){const m=l.children[o];m.id&&m.id.startsWith("invSec_")&&!bt.has(m.id)&&m.remove()}mt&&!ft&&(l.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(t,e){const s=`_invPage_${t}`,r=window.products||[],i=t==="mp"?r.filter(p=>p.tipo==="materia_prima"):t==="svc"?r.filter(p=>p.tipo==="servicio"):t==="pv"?r.filter(p=>p.tipo==="producto_variable"):r.filter(p=>!p.tipo||p.tipo==="producto"||p.tipo==="producto_interno"||p.tipo==="pack"),a=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",n=(document.getElementById("inventoryTagFilter")||{}).value||"",l=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",d=i.filter(p=>{const b=!a||p.name.toLowerCase().includes(a)||(p.sku||"").toLowerCase().includes(a)||(p.proveedor||"").toLowerCase().includes(a)||(p.notas||"").toLowerCase().includes(a)||(p.tags||[]).some(x=>x.toLowerCase().includes(a)),y=!n||p.tags&&p.tags.includes(n),P=!l||(p.proveedor||"").toLowerCase().includes(l);return b&&y&&P}),c=Math.max(1,Math.ceil(d.length/(window._invPageSize||10)));window[s]=Math.max(1,Math.min(e,c)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,e,s,r,i){let a=document.getElementById("inventoryPaginationBar");if(!a){const c=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!c)return;a=document.createElement("div"),a.id="inventoryPaginationBar",c.insertAdjacentElement("afterend",a)}if(e<=1&&s<=i){a.innerHTML="";return}const n=Math.min(r+i,s),l=`Mostrando <b>${r+1}\u2013${n}</b> de <b>${s}</b> productos`;function d(){const c=[],p=(b,y)=>{for(let P=b;P<=y;P++)c.push(P)};return e<=7?p(1,e):(c.push(1),t>4&&c.push("..."),p(Math.max(2,t-2),Math.min(e-1,t+2)),t<e-3&&c.push("..."),c.push(e)),c.map(b=>{if(b==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const y=b===t;return`<button data-action="invGoToPage" data-arg="${b}"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${y?"#FFD166":"#e5e7eb"};
                       background:${y?"#FFD166":"white"};color:${y?"white":"#374151"};
                       font-weight:${y?"700":"500"};font-size:13px;cursor:${y?"default":"pointer"};
                       transition:all 0.15s;"
                ${y?"disabled":""}>${b}</button>`}).join("")}a.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${l}</span>
                <select data-change="invChangePageSize" data-pass-el="1"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(c=>`<option value="${c}" ${c===i?"selected":""}>${c} por p\xE1gina</option>`).join("")}
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
                ${d()}
                <button data-action="invGoToPage" data-arg="${t+1}" ${t===e?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===e?"default":"pointer"};opacity:${t===e?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button data-action="invGoToPage" data-arg="${e}" ${t===e?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===e?"default":"pointer"};opacity:${t===e?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const s=(typeof t=="string"?parseInt(t):t)||1,i=Array.from(document.querySelectorAll('[id^="invSec_"]')).find(n=>n.offsetParent!==null&&n.textContent?.includes("Mostrando"))?.id?.replace("invSec_","");if(i&&typeof invSectionPage=="function")invSectionPage(i,s);else{const n=Math.max(1,Math.ceil((window.products||[]).length/(window._invPageSize||10)));window._invCurrentPage=Math.max(1,Math.min(s,n)),renderInventoryTable()}const a=document.getElementById("inventoryTable");a&&a.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){const e=typeof t=="object"&&t?t.value:t;window._invPageSize=parseInt(e)||10,window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;function _invMpMenu(t,e){const s=(window.products||[]).find(c=>String(c.id)===String(e));if(!s)return;const r=!!s.proveedorUrl,i=s.activo===!1?"desarchivar":"archivar",a=document.getElementById("_invMpMenuDrop");if(a&&(a.remove(),a.dataset.pid===e))return;const n=document.createElement("div");n.id="_invMpMenuDrop",n.dataset.pid=e,n.style.cssText="position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:172px;overflow:hidden;font-size:.78rem;";const l=(c,p)=>`style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:${c};text-align:left;" onmouseover="this.style.background='${p}'" onmouseout="this.style.background='none'"`;n.innerHTML=`
        <button data-action="registrarMerma" data-arg="${e}" data-close-menu-drop="true" ${l("#d97706","#fffbeb")}>\u{1F4C9} Registrar merma</button>
        <button data-action="duplicarProducto" data-arg="${e}" data-close-menu-drop="true" ${l("#9669c4","#f5f3ff")}>\u{1F4CB} Duplicar</button>
        <button data-action="cambiarTipoProducto" data-arg="${e}" data-close-menu-drop="true" ${l("#b45309","#fef9c3")}>\u2192\u{1F4E6} Convertir a PT</button>
        <button data-action="abrirMovimientoProducto" data-arg="${e}" data-close-menu-drop="true" ${l("#4338ca","#eef2ff")}>\u{1F4C8} Ver gr\xE1fica</button>
        ${r?`<button data-action="_mkInvOpenProveedor" data-arg="${e}" data-close-menu-drop="true" ${l("#16a34a","#f0fdf4")}>\u{1F517} Abrir proveedor</button>`:""}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button data-action="archivarProducto" data-arg="${e}" data-close-menu-drop="true" ${l("#6b7280","#f9fafb")}>\u{1F4C1} ${i==="desarchivar"?"Desarchivar":"Archivar"}</button>
        <button data-action="deleteProduct" data-arg="${e}" data-close-menu-drop="true" ${l("#dc2626","#fef2f2")}>\u{1F5D1}\uFE0F Eliminar</button>
    `,document.body.appendChild(n);const d=t.getBoundingClientRect();n.style.top=d.bottom+window.scrollY+4+"px",n.style.left=Math.min(d.left+window.scrollX,window.innerWidth-180)+"px",setTimeout(()=>document.addEventListener("click",function c(p){n.contains(p.target)||(n.remove(),document.removeEventListener("click",c))}),0)}window._invMpMenu=_invMpMenu;function _mkInvToggleVarCollapse(t){const e=`_invVar_${t}_open`;window[e]=!window[e],renderInventoryTable()}window._mkInvToggleVarCollapse=_mkInvToggleVarCollapse;function _mkInvOpenProveedor(t){const e=(window.products||[]).find(s=>String(s.id)===String(t));e?.proveedorUrl&&window.open(e.proveedorUrl,"_blank")}window._mkInvOpenProveedor=_mkInvOpenProveedor;function _mkInvToggleCollapse(t){const e=`_invSec_${t}_collapsed`;window[e]=!window[e],renderInventoryTable()}window._mkInvToggleCollapse=_mkInvToggleCollapse;function _mkInvAddBtnAction(t){t==="pt"?typeof window.openAddProductModal=="function"&&window.openAddProductModal():t==="pv"?(typeof window.injectVariableProductModal=="function"&&window.injectVariableProductModal(),typeof window.openVariableProductModal=="function"&&window.openVariableProductModal()):t==="mp"?(typeof window.injectMpModal=="function"&&window.injectMpModal(),typeof window.openAddMateriaPrimaModal=="function"&&window.openAddMateriaPrimaModal()):t==="svc"&&(typeof window.injectSvcModal=="function"&&window.injectSvcModal(),typeof window.openServicioModal=="function"&&window.openServicioModal())}window._mkInvAddBtnAction=_mkInvAddBtnAction;function _mkInvCreatePack(){typeof window.injectPackModal=="function"&&window.injectPackModal(),typeof window.openPackModal=="function"&&window.openPackModal()}window._mkInvCreatePack=_mkInvCreatePack;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const e=document.getElementById("movimientosLista");if(!e)return;const s=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",r=(document.getElementById("movTipoFilter")||{}).value||"";let i=window.stockMovements||[];s&&(i=i.filter(x=>x.productoNombre?.toLowerCase().includes(s)||(x.motivo||"").toLowerCase().includes(s))),r&&(i=i.filter(x=>(x.tipo||"")===r));const a=_fechaHoy(),n=(window.stockMovements||[]).filter(x=>{try{const C=new Date(x.fecha);return C.getFullYear()+"-"+("0"+(C.getMonth()+1)).slice(-2)+"-"+("0"+C.getDate()).slice(-2)===a}catch{return!1}}),l={};n.forEach(x=>{l[x.tipo]=(l[x.tipo]||0)+1});const d={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},c={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let p=document.getElementById("movResumenHoy");p||(p=document.createElement("div"),p.id="movResumenHoy",e.parentNode.insertBefore(p,e));const b=Object.keys(l).map(x=>`${d[x]||"\u26AA"} ${c[x]||x}: <strong>${l[x]}</strong>`);p.innerHTML=b.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${b.join("&nbsp;&nbsp;")}
           </div>`:"";let y=document.getElementById("movExportCSVBtn");if(y||(y=document.createElement("button"),y.id="movExportCSVBtn",y.textContent="\u{1F4E5} Exportar historial CSV",y.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",y.onclick=function(){const x=window.stockMovements||[];let F=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;x.forEach(j=>{const u=[new Date(j.fecha).toLocaleString("es-MX"),j.productoNombre||"",j.tipo||"",j.cantidad,j.motivo||"",j.stockAntes??"",j.stockDespues??""];F+=u.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")+`
`});const G=new Blob([F],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(G),T=document.createElement("a");T.href=_,T.download=`movimientos-${a}.csv`,T.click(),URL.revokeObjectURL(_)},e.parentNode.insertBefore(y,e)),!i.length){e.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const P={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};e.innerHTML=i.slice(0,200).map(x=>{const C=new Date(x.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),F=x.cantidad>=0?`+${x.cantidad}`:`${x.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${P[x.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(x.productoNombre||(x.productoId&&!(window.products||[]).find(G=>String(G.id)===String(x.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${C} \xB7 ${x.tipo} \xB7 ${_esc(x.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${x.cantidad>=0?"#10b981":"#ef4444"};">${F} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${x.stockAntes} \u2192 ${x.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){showConfirm("Se borrar\xE1 permanentemente todo el historial de movimientos de inventario.","\xBFBorrar historial?").then(t=>{t&&(window.stockMovements=[],window.stockMovimientos=[],saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").delete().neq("id","00000000-0000-0000-0000-000000000000").then(({error:e})=>{e&&console.warn("[Inv] Error limpiando stock_movements relacional:",e.message)}),renderMovimientos())})}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const e=document.getElementById(t);if(!e)return;if(!window.stockMovements||!window.stockMovements.length){e.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const s={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};e.innerHTML=window.stockMovements.slice(0,100).map(r=>{const i=new Date(r.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),a=r.cantidad>=0?`+${r.cantidad}`:`${r.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${s[r.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(r.productoNombre||(r.productoId&&!(window.products||[]).find(n=>String(n.id)===String(r.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${i} \xB7 ${r.tipo} \xB7 ${_esc(r.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${r.cantidad>=0?"#10b981":"#ef4444"};">${a} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${r.stockAntes} \u2192 ${r.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const e=(window.products||[]).find(r=>String(r.id)===String(t));if(!e){manekiToastExport("Producto no encontrado","err");return}const s=JSON.parse(JSON.stringify(e));s.id=_genId(),s.name="Copia de "+e.name,s.sku=(e.sku||"")+"-C",s.stock=0,s.historialPrecios=[],s.historialCostos=[],window.products.unshift(s),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${s.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(n=>!n.tipo||n.tipo==="producto"||n.tipo==="producto_interno"),e=t.map(n=>{const l=n.price>0&&n.cost>0?(n.price-n.cost)/n.price*100:null;return{...n,_margen:l}}).sort((n,l)=>(l._margen??-1/0)-(n._margen??-1/0)),s=e.map((n,l)=>{const d=n._margen!==null?n._margen.toFixed(1)+"%":"\u2014",c=n.price>0&&n.cost>0?"$"+(n.price-n.cost).toFixed(2):"\u2014",p=n._margen===null?"#9ca3af":n._margen>=50?"#16a34a":n._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${l===0?"\u{1F947}":l===1?"\u{1F948}":l===2?"\u{1F949}":`${l+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(n.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(n.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(n.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${c}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${p};font-size:14px;">${d}</td>
        </tr>`}).join(""),r=e.filter(n=>n._margen!==null).reduce((n,l,d,c)=>n+l._margen/c.length,0),i=e[0];let a=document.getElementById("_mkRentabilidadModal");a||(a=document.createElement("div"),a.id="_mkRentabilidadModal",a.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",a.addEventListener("click",n=>{n.target===a&&(a.style.display="none")}),document.body.appendChild(a)),a.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${e.some(n=>n._margen!==null)?r.toFixed(1)+"%":"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">M\xE1s rentable</div>
                    <div style="font-size:.95rem;font-weight:700;color:#16a34a;margin-top:4px;">${i?_esc(i.name):"\u2014"}</div>
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
                    <tbody>${s||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,a.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(s=>{s.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let e=document.getElementById("invBulkBar");if(e||(e=document.createElement("div"),e.id="invBulkBar",e.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(e)),t.length===0){e.style.display="none";return}e.style.display="flex",e.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#9669c4;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const e=(window.pedidos||[]).filter(i=>!["cancelado","finalizado"].includes(i.status||"")&&(i.productosInventario||[]).some(a=>t.includes(String(a.id))));if(e.length>0){const i=e.map(n=>n.folio||n.id).slice(0,5).join(", ");if(!(typeof showConfirm=="function"?await showConfirm(`\u26A0\uFE0F ${e.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`,"Productos en pedidos activos"):confirm(`\u26A0\uFE0F ${e.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`)))return}if(!(typeof showConfirm=="function"?await showConfirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`,"\u{1F5D1} Confirmar eliminaci\xF3n"):confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`)))return;const r=[...t];if(window.products=(window.products||[]).filter(i=>!r.includes(String(i.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",r)}catch(i){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",i)}manekiToastExport(`\u{1F5D1} ${r.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),e=(window.products||[]).filter(d=>t.includes(String(d.id))),s="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",r=e.map(d=>[d.tipo||"pt",d.name,d.sku||"",d.cost||0,d.price||0,d.stock||0,d.stockMin||5,d.proveedor||"",d.notas||""].map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")),i="\uFEFF"+s+`
`+r.join(`
`),a=new Blob([i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(a),l=document.createElement("a");l.href=n,l.download="inventario_seleccion.csv",l.click(),URL.revokeObjectURL(n),manekiToastExport(`\u{1F4E5} ${e.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const e=await new Promise(r=>{const i=document.getElementById("mkBatchCatModal");i&&i.remove();const n=(window.categories||[]).map(d=>`<option value="${d.id}">${d.emoji||""} ${d.name}</option>`).join(""),l=document.createElement("div");l.id="mkBatchCatModal",l.className="mk-modal-overlay",l.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C1} Cambiar categor\xEDa en lote</h3>
          <p style="font-size:.8rem;color:#6b7280;margin-bottom:10px;">${t.length} producto(s) seleccionado(s)</p>
          <select id="mkBatchCatSel" class="mk-input w-full mb-4">
              <option value="">Seleccionar categor\xEDa...</option>
              ${n}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkBatchCatModal').remove();window._mkBCR(null)">Cancelar</button>
              <button type="button" class="mk-btn-primary" onclick="window._mkBCR((document.getElementById('mkBatchCatSel') as HTMLSelectElement).value||null)">Aplicar</button>
          </div>
      </div>`,window._mkBCR=d=>{l.remove(),r(d)},document.body.appendChild(l),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!e)return;const s=(window.categories||[]).find(r=>String(r.id)===String(e));if(!s){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(r=>{t.includes(String(r.id))&&(r.category=s.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};function _mkInvResetPages(){window._invCurrentPage=1,["pt","pv","mp","svc"].forEach(t=>{window[`_invPage_${t}`]=1})}function _mkInvDispatchFilter(t,e){const s=t._invPagListenerAdded;t.dispatchEvent(new Event(e,{bubbles:!0})),!s&&typeof renderInventoryTable=="function"&&renderInventoryTable()}window._mkInvSetTipo=function(t){const e=document.getElementById("inventoryTipoFilter");e&&(e.value=t,_mkInvResetPages(),_mkInvSyncSeg(),_mkInvDispatchFilter(e,"change"))},window._mkInvClearOne=function(t){const e=document.getElementById(t);e&&(e.value="",_mkInvResetPages(),_mkInvDispatchFilter(e,t==="inventorySearch"?"input":"change"))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(e=>{const s=document.getElementById(e);s&&(s.value="")}),_mkInvResetPages();const t=document.getElementById("inventorySearch");t?(t.value="",_mkInvDispatchFilter(t,"input")):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),e=document.getElementById("mkInvTipoSeg");!t||!e||e.querySelectorAll("button").forEach(s=>s.classList.toggle("active",s.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),e=t?.parentElement;if(!(!t||!e)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const s=document.createElement("div");s.id="mkInvTipoSeg",s.className="mk-segmented",s.setAttribute("role","group"),s.setAttribute("aria-label","Tipo de producto"),s.innerHTML=[...t.options].map(r=>{const i=_MK_TIPO_LABELS[r.value]??(r.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${r.value}" onclick="_mkInvSetTipo('${r.value}')">${i}</button>`}).join(""),t.parentElement.insertBefore(s,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const s=document.createElement("span");s.id="mkInvDensity",s.style.marginLeft="auto",s.innerHTML=window.mkRenderDensityToggle(),e.appendChild(s),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const s=document.createElement("div");s.id="mkInvFilterInfo",s.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",e.parentElement.insertBefore(s,e.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const s=document.createElement("div");s.id="mkInvHerramientas",s.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",s.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock m\xEDnimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gr\xE1fica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
      <button type="button" onclick="abrirMovimientosRecientes()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Ver \xFAltimos movimientos de inventario"><i class="fas fa-history" style="margin-right:5px;"></i>Movimientos recientes</button>
    `;const r=document.getElementById("mkInvFilterInfo");r?r.parentElement.insertBefore(s,r):e.parentElement.insertBefore(s,e.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const e=document.getElementById("invDualContainer"),s=e?e.querySelectorAll(window._invViewMode==="cards"?".pos-inv-card":".inv-bulk-cb").length:0,r=(window.products||[]).length,i=document.getElementById("inventorySearch"),a=document.getElementById("inventoryTagFilter"),n=document.getElementById("inventoryProveedorFilter"),l=document.getElementById("inventoryTipoFilter"),d=[];i&&i.value.trim()&&d.push(`<span class="mk-filter-chip">Buscar: ${_esc(i.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),l&&l.value&&d.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[l.value]||l.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),a&&a.value&&d.push(`<span class="mk-filter-chip">Tag: ${_esc(a.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),n&&n.value&&d.push(`<span class="mk-filter-chip">Proveedor: ${_esc(n.options[n.selectedIndex]?.text||n.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let c=`<span class="mk-result-count">Mostrando <b>${s}</b> de ${r} producto${r!==1?"s":""}</span>`;d.length&&(c+=`<div class="mk-filter-chips">${d.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=c,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const e=new Set([...t.querySelectorAll(window._invViewMode==="cards"?".pos-inv-card":".inv-bulk-cb")].map(l=>String(l.dataset.id))),s=window._invStockCache;let r=0,i=0,a=0;(window.products||[]).forEach(l=>{if(!e.has(String(l.id)))return;a++;const d=s?.get(String(l.id))??(Number(l.stock)||0);r+=(Number(l.cost)||0)*Math.max(0,d),d<=(Number(l.stockMin)||5)&&i++});let n=document.getElementById("mkInvSummary");if(a===0){n&&n.remove();return}n||(n=document.createElement("div"),n.id="mkInvSummary",n.className="mk-table-summary",n.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(n,t.nextSibling)),n.innerHTML=`<span>Valor en costo: <b>$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${a} producto${a!==1?"s":""}</span>`+(i>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${i} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const e=window.renderInventoryTable;if(typeof e!="function"||e._mkWrapped)return;const s=function(...r){const i=e.apply(this,r);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return i};s._mkWrapped=!0,window.renderInventoryTable=s})();function _mkInvModal(t,e,s,r="700px"){let i=document.getElementById(t+"_ov");i||(i=document.createElement("div"),i.id=t+"_ov",i.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(i)),i.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${r};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${e}</h3>
        <button onclick="document.getElementById('${t}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${s}</div>
    </div>`,i.onclick=a=>{a.target===i&&i.remove()},i.style.display="flex"}function abrirConteoFisico(){const t=(window.products||[]).filter(i=>i.tipo!=="servicio"&&i.activo!==!1);if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const e=_esc,r=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${t.map((i,a)=>{const n=typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0;return`<tr style="${a%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${e(i.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${e(i.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${n}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${n}" data-pid="${e(i.id)}" data-sistema="${n}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",r,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const t=document.querySelectorAll("#mkConteo_ov .conteo-input");let e=0;if(t.forEach(s=>{const r=s.dataset.pid,i=Number(s.dataset.sistema),a=Number(s.value);if(isNaN(a)||a===i)return;const n=(window.products||[]).find(d=>String(d.id)===String(r));if(!n)return;const l=a-i;n.stock=a,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:n.id,productoNombre:n.name,tipo:l>0?"entrada_manual":"salida_manual",cantidad:Math.abs(l),motivo:"Conteo f\xEDsico",stockAntes:i,stockDespues:a}),e++}),e===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${e} ajuste${e!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const t=(window.products||[]).filter(i=>i.tipo==="servicio"||i.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0)<=(Number(i.stockMin)||5));if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const e=_esc,s={};t.forEach(i=>{const a=i.proveedor||"Sin proveedor";s[a]||(s[a]=[]),s[a].push(i)});const r=Object.entries(s).map(([i,a])=>{const n=e(i),l=a.map(d=>{const c=typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0,p=Number(d.stockMin)||5,b=Math.max(1,p*2-c);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${e(d.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${c}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${p}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#FFD166;">${b}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${e(d.unidad||"pza")}</td></tr>`}).join("");return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${n} (${a.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:
${a.map(d=>`\u2022 ${d.name}: ${Math.max(1,(Number(d.stockMin)||5)*2-(typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0))} ${d.unidad||"pza"}`).join(`
`)}`)}" target="_blank"
            style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#25D366;color:white;text-decoration:none;font-weight:700;">\u{1F4F2} WA</a>
          <button onclick="_mkExportReabCSV('${n}')" style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#10b981;color:white;border:none;cursor:pointer;font-weight:700;">\u{1F4E5} CSV</button>
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
        <tbody>${l}</tbody>
      </table>
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${t.length} productos`,r,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(t){const s=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(n=>{if(n.tipo==="servicio"||n.activo===!1)return!1;const l=n.proveedor||"Sin proveedor";return t&&l!==t?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5)}).map(n=>{const l=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0,d=Number(n.stockMin)||5;return`"${n.name}",${l},${d},${Math.max(1,d*2-l)},${n.unidad||"pza"},"${n.proveedor||""}"`})].join(`
`),r=document.createElement("a");r.href=URL.createObjectURL(new Blob([s],{type:"text/csv;charset=utf-8;"}));const i=new Date,a=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;r.download=`reabastecimiento_${a}.csv`,r.click()};function mostrarDonutCategoria(){const t=_esc,e={};(window.products||[]).forEach(l=>{if(l.tipo==="servicio"||l.activo===!1)return;const d=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,c=(Number(l.price)||0)*d,p=l.category||"Sin categor\xEDa";e[p]=(e[p]||0)+c});const s=Object.entries(e).sort((l,d)=>d[1]-l[1]),r=s.reduce((l,[,d])=>l+d,0),i=["#FFD166","#9669c4","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#9669c4","#f97316","#14b8a6"],a=s.map(([l,d],c)=>{const p=r>0?(d/r*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i[c%i.length]};margin-right:6px;"></span>
        ${t(l)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${d.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${p}%</td>
    </tr>`}).join(""),n=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Valor de inventario (precio \xD7 stock) por categor\xEDa. Total: <b>$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></p>
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
      <canvas id="mkDonutCat" width="200" height="200" style="flex-shrink:0;max-width:200px;"></canvas>
      <table style="flex:1;min-width:200px;border-collapse:collapse;">
        <thead><tr style="font-size:.75rem;color:#9ca3af;">
          <th style="padding:6px 12px;text-align:left;">Categor\xEDa</th>
          <th style="padding:6px 12px;text-align:right;">Valor</th>
          <th style="padding:6px 12px;text-align:right;">%</th>
        </tr></thead>
        <tbody>${a}</tbody>
        <tfoot><tr style="border-top:2px solid #e5e7eb;font-weight:800;">
          <td style="padding:8px 12px;">Total</td>
          <td style="padding:8px 12px;text-align:right;">$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
          <td style="padding:8px 12px;text-align:right;">100%</td>
        </tr></tfoot>
      </table>
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",n,"700px"),setTimeout(()=>{const l=document.getElementById("mkDonutCat");if(l)try{const d=window.Chart;if(typeof d>"u"){l.style.display="none";return}new d(l,{type:"doughnut",data:{labels:s.map(([c])=>c),datasets:[{data:s.map(([,c])=>Math.round(c)),backgroundColor:s.map((c,p)=>i[p%i.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{l&&(l.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const t=_esc,e=new Date;e.setDate(e.getDate()-60);const s={};(window.pedidosFinalizados||[]).forEach(n=>{const l=n.fechaFinalizado||n.entrega||"";l&&new Date(l)<e||(n.productosInventario||[]).forEach(d=>{!d.id||d.id==="libre"||(s[String(d.id)]=(s[String(d.id)]||0)+(Number(d.quantity||d.cantidad)||1))})});const r=(window.products||[]).filter(n=>n.tipo!=="servicio"&&n.activo!==!1&&s[String(n.id)]);if(!r.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const a=`
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
      <tbody>${r.map(n=>{const l=s[String(n.id)]||0,d=l/60,c=Math.max(1,Math.ceil(d*14)),p=Number(n.stockMin)||0,b=c!==p?`<span style="color:${c>p?"#10b981":"#f59e0b"};font-weight:700;">${c>p?"\u25B2":"\u25BC"} ${c}</span>`:`<span style="color:#6b7280;">${c} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${t(n.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${p}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${b}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${t(n.id)}" data-nuevo="${c}" class="mkStockMinCb" style="accent-color:#FFD166;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",a,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const t=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let e=0;t.forEach(s=>{const r=s.dataset.pid,i=Number(s.dataset.nuevo),a=(window.products||[]).find(n=>String(n.id)===String(r));!a||isNaN(i)||(a.stockMin=i,e++)}),e&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${e} producto${e!==1?"s":""}`,"ok"))};function archivarProducto(t){const e=(window.products||[]).find(a=>String(a.id)===String(t));if(!e)return;const s=e.activo!==!1,r=s?"archivar":"desarchivar",i=s?`\xBFArchivar "${e.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${e.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(i,s?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(a=>{a&&(e.activo=!s,e.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(s?`\u{1F4C1} "${e.name}" archivado`:`\u{1F513} "${e.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(t){const e=_esc,s=(window.products||[]).find(u=>String(u.id)===String(t));if(!s){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const r=Date.now()-90*864e5,i=new Set,a=[],n=u=>{if(!u)return;const v=u.fecha?new Date(u.fecha+(u.hora?"T"+u.hora:"")).getTime():u.timestamp?new Date(u.timestamp).getTime():0;if(v&&v<r)return;const z=u.id||String(u.productoId||t)+"_"+v+"_"+(u.cantidad||0);i.has(z)||(i.add(z),a.push({...u,_ts:v||Date.now()}))};(s.movimientos||[]).forEach(n),(window.stockMovimientos||[]).filter(u=>String(u.productoId)===String(t)).forEach(n),a.sort((u,v)=>v._ts-u._ts);const l=[];for(let u=12;u>=0;u--){const v=new Date(Date.now()-u*7*864e5),z=new Date(v.getTime()-7*864e5),V=`${z.getDate()}/${z.getMonth()+1}`;let U=0,Y=0;a.forEach(A=>{if(A._ts>=z.getTime()&&A._ts<v.getTime()){const Z=A.stockDespues!=null&&A.stockAntes!=null?Number(A.stockDespues)-Number(A.stockAntes):0,O=(A.tipo||"").toLowerCase();Z>0||O.includes("entrada")||O.includes("compra")||O.includes("ajuste_positivo")?U+=Math.abs(Number(A.cantidad)||Math.abs(Z)||1):Y+=Math.abs(Number(A.cantidad)||Math.abs(Z)||1)}}),l.push({label:V,entradas:U,salidas:Y})}const d=Math.max(1,...l.map(u=>Math.max(u.entradas,u.salidas))),c=480,p=100,b=Math.floor((c-20)/l.length/2)-1,y=l.map((u,v)=>{const z=10+v*(b*2+4),V=Math.round(u.entradas/d*(p-20)),U=Math.round(u.salidas/d*(p-20));return`
      <rect x="${z}" y="${p-10-V}" width="${b}" height="${V}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${u.entradas}"/>
      <rect x="${z+b+1}" y="${p-10-U}" width="${b}" height="${U}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${u.salidas}"/>
      <text x="${z+b}" y="${p-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${u.label}</text>`}).join(""),P=a.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">\u25A0 Entradas</span>
        <span style="color:#ef4444;">\u25A0 Salidas</span>
      </div>
      <svg viewBox="0 0 ${c} ${p}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${p-10}" x2="${c-10}" y2="${p-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${y}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">\u2190 13 semanas</div>
    </div>`,x={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},C=a.slice(0,30).map(u=>{const v=u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):"\u2014"),z=u.hora||"",V=x[u.tipo||""]||u.tipo||"\u2014",U=u.stockDespues!=null&&u.stockAntes!=null?Number(u.stockDespues)-Number(u.stockAntes):0,Y=Number(u.cantidad)||Math.abs(U)||0,A=U>0||(u.tipo||"").includes("entrada")||(u.tipo||"").includes("compra"),Z=A?"#10b981":"#ef4444",O=A?`+${Y}`:`-${Y}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${e(v)} ${z?`<span style="color:#9ca3af;font-size:.72rem;">${e(z.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${e(V)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${Z};">${O}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${u.stockDespues!=null?u.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e(u.motivo||"")}">${e(u.motivo||"")}</td>
    </tr>`}).join(""),F=typeof getStockEfectivo=="function"?getStockEfectivo(s):Number(s.stock)||0,G=a.reduce((u,v)=>{const z=v.stockDespues!=null&&v.stockAntes!=null?Number(v.stockDespues)-Number(v.stockAntes):0;return u+(z>0||(v.tipo||"").includes("entrada")||(v.tipo||"").includes("compra")?Math.abs(Number(v.cantidad)||Math.abs(z)||0):0)},0),_=a.reduce((u,v)=>{const z=v.stockDespues!=null&&v.stockAntes!=null?Number(v.stockDespues)-Number(v.stockAntes):0,V=z>0||(v.tipo||"").includes("entrada")||(v.tipo||"").includes("compra");return u+(V?0:Math.abs(Number(v.cantidad)||Math.abs(z)||0))},0),T=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${F}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Stock actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">+${G}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Entradas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#fef2f2;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#ef4444;">-${_}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Salidas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#374151;">${a.length}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Movimientos</div>
      </div>
    </div>
    ${P}
    ${a.length>0?`
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      <thead><tr style="background:#f9fafb;font-size:.73rem;color:#9ca3af;font-weight:700;">
        <th style="padding:7px 10px;text-align:left;">Fecha</th>
        <th style="padding:7px 10px;text-align:left;">Tipo</th>
        <th style="padding:7px 10px;text-align:center;">Cant.</th>
        <th style="padding:7px 10px;text-align:center;">Stock</th>
        <th style="padding:7px 10px;text-align:left;">Motivo</th>
      </tr></thead>
      <tbody>${C}</tbody>
    </table>
    ${a.length>30?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${a.length-30} m\xE1s</p>`:""}`:""}
  `,j=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button onclick="(function(){
        var movs=${JSON.stringify(a.map(u=>({fecha:u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):""),hora:u.hora||"",tipo:u.tipo||"",cantidad:u.cantidad||0,motivo:u.motivo||"",stockAntes:u.stockAntes??"",stockDespues:u.stockDespues??""})))};
        var headers=['Fecha','Hora','Tipo','Cantidad','Motivo','Stock antes','Stock despu\xE9s'];
        var csv=headers.join(',')+'\\n';
        movs.forEach(function(m){
          var row=[m.fecha,m.hora,m.tipo,m.cantidad,m.motivo,m.stockAntes,m.stockDespues];
          csv+=row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',')+'\\n';
        });
        var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;a.download='kardex-${e(s.name||"producto").replace(/[^a-zA-Z0-9]/g,"_")}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('\u{1F4E5} Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        \u{1F4E5} Exportar CSV
      </button>
    </div>
    ${T}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${e(s.name||"Producto")} (90d)`,j,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const t=window.inventarioSnapshots||[];if(t.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const e=[...t].sort((_,T)=>(_.fecha||"").localeCompare(T.fecha||"")),s=e.map(_=>_.fecha||""),r=e.map(_=>Number(_.valorTotal||_.valor||0)),i=540,a=140,n=Math.max(1,...r),l=Math.min(...r),d=n-l||1,p=`<polyline points="${r.map((_,T)=>{const j=20+T/Math.max(1,r.length-1)*(i-40),u=a-20-(_-l)/d*(a-40);return`${j},${u}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,b=r.map((_,T)=>{const j=20+T/Math.max(1,r.length-1)*(i-40),u=a-20-(_-l)/d*(a-40);return`<circle cx="${j}" cy="${u}" r="3.5" fill="#6366f1" opacity=".9"><title>${s[T]}: $${_.toLocaleString("es-MX")}</title></circle>`}).join(""),y=s.filter((_,T)=>T===0||T===s.length-1||T%Math.ceil(s.length/6)===0).map((_,T,j)=>`<text x="${20+s.indexOf(_)/Math.max(1,s.length-1)*(i-40)}" y="${a-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${_.slice(5)}</text>`).join(""),P=r[r.length-1]||0,x=r[0]||0,C=x>0?((P-x)/x*100).toFixed(1):"\u2014",F=Number(C)>=0?"#10b981":"#ef4444",G=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${P.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${F};">${Number(C)>=0?"+":""}${C}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variaci\xF3n total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${e.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${i} ${a}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${a-20}" x2="${i-10}" y2="${a-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${p}${b}${y}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">\u2190 Valor de inventario en costo \xB7 ${e.length} puntos</p>
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",G,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;function abrirMovimientosRecientes(){const t=_esc,e=[...window.stockMovements||window.stockMovimientos||[]].slice(0,50);if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin movimientos registrados a\xFAn","warn");return}const s={ajuste:"#6366f1",entrada:"#10b981",compra:"#10b981",merma:"#ef4444",salida:"#ef4444",descuento:"#f59e0b",produccion:"#f59e0b",conteo:"#3b82f6",ajuste_positivo:"#10b981"},r=e.map(a=>{const n=(a.fecha||"").split("T"),l=n[0]||"",d=(n[1]||"").substring(0,5),c=(a.tipo||"").toLowerCase(),p=a.stockDespues!=null&&a.stockAntes!=null?Number(a.stockDespues)-Number(a.stockAntes):0,b=p>0||c.includes("entrada")||c.includes("compra")||c.includes("ajuste_positivo"),y=Number(a.cantidad)||Math.abs(p)||0,P=b?`<span style="color:#10b981;font-weight:700;">+${y}</span>`:`<span style="color:#ef4444;font-weight:700;">\u2212${y}</span>`,x=s[c]||"#6b7280",C=`<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${x}22;color:${x};font-size:.7rem;font-weight:700;">${t(a.tipo||"\u2014")}</span>`,F=a.productoId?`<button onclick="abrirMovimientoProducto('${t(String(a.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${t(a.productoNombre||a.productoId)}</button>`:`<span style="font-size:.8rem;">${t(a.productoNombre||"\u2014")}</span>`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${t(l)} <span style="color:#9ca3af;font-size:.7rem;">${d}</span></td>
      <td style="padding:6px 10px;">${F}</td>
      <td style="padding:6px 10px;">${C}</td>
      <td style="padding:6px 10px;text-align:center;">${P}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${a.stockDespues!=null?a.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.74rem;color:#9ca3af;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t(a.motivo||"")}">${t(a.motivo||"")}</td>
    </tr>`}).join(""),i=`
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
    </div>`;_mkInvModal("mkMovRecientes","\u{1F4CB} Movimientos Recientes \u2014 Inventario",i,"820px")}window.abrirMovimientosRecientes=abrirMovimientosRecientes;
//# sourceMappingURL=inventory-5.js.map
