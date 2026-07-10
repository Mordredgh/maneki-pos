"use strict";function _levenshtein(t,o){const r=t.length,s=o.length,i=Array.from({length:r+1},(a,n)=>Array.from({length:s+1},(d,l)=>l===0?n:0));for(let a=1;a<=s;a++)i[0][a]=a;for(let a=1;a<=r;a++)for(let n=1;n<=s;n++)i[a][n]=t[a-1]===o[n-1]?i[a-1][n-1]:1+Math.min(i[a-1][n],i[a][n-1],i[a-1][n-1]);return i[r][s]}window._levenshtein=_levenshtein;function _fuzzyMatch(t,o,r=2){return t=t.toLowerCase().trim(),o=o.toLowerCase(),!t||o.includes(t)?!0:o.split(/[\s,.-]+/).some(i=>{const a=i.substring(0,t.length+2);return a.length>=t.length-1&&_levenshtein(t,a)<=r})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){return!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0?null:typeof window.calcularPiezasFabricables=="function"?window.calcularPiezasFabricables(t):0}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",s=>{s.target===t&&(t.style.display="none")}),document.body.appendChild(t));const r=[...new Set((window.products||[]).map(s=>s.category).filter(Boolean))].map(s=>{const i=(window.categories||[]).find(a=>String(a.id)===String(s));return`<option value="${_esc(s)}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:s)}</option>`}).join("");t.innerHTML=`
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
                    ${r}
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
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function abrirBulkStockModal(){let t=document.getElementById("bulkStockModal");t||(t=document.createElement("div"),t.id="bulkStockModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",s=>{s.target===t&&(t.style.display="none")}),document.body.appendChild(t));const r=[...new Set((window.products||[]).filter(s=>s.tipo==="materia_prima").map(s=>s.category).filter(Boolean))].map(s=>{const i=(window.categories||[]).find(a=>String(a.id)===String(s));return`<option value="${_esc(String(s))}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:String(s))}</option>`}).join("");t.innerHTML=`
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
                    ${r}
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
    </div>`,t.style.display="flex",_bulkStockPreview()}window.abrirBulkStockModal=abrirBulkStockModal;function _bulkStockPreview(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),o=document.getElementById("bulkStockCat")?.value||"",r=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!o||String(i.category)===o)),s=document.getElementById("bulkStockPreviewList");if(s){if(t===0){s.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ingresa una cantidad distinta de 0</p>';return}s.innerHTML=`
        <div style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:6px;">${r.length} producto${r.length!==1?"s":""} afectados:</div>
        ${r.slice(0,20).map(i=>{const a=typeof getStockEfectivo=="function"?getStockEfectivo(i):parseInt(i.stock)||0,n=Math.max(0,a+t);return`<div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f3f4f6;font-size:.76rem;">
                <span>${_esc(i.name)}</span>
                <span>${a} \u2192 <b style="color:${t>0?"#16a34a":"#dc2626"}">${n}</b></span>
            </div>`}).join("")}
        ${r.length>20?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:6px;">...y ${r.length-20} m\xE1s</p>`:""}`}}window._bulkStockPreview=_bulkStockPreview;async function _bulkStockAplicar(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),o=document.getElementById("bulkStockCat")?.value||"";if(t===0){manekiToastExport("Ingresa una cantidad distinta de 0","warn");return}const r=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!o||String(i.category)===o));if(r.length===0){manekiToastExport("Sin productos para ajustar","warn");return}const s=typeof getStockEfectivo=="function"?getStockEfectivo:i=>parseInt(i.stock)||0;r.forEach(i=>{const a=s(i);i.stock=Math.max(0,a+t),typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:i.id,productoNombre:i.name,tipo:t>0?"entrada":"merma",cantidad:Math.abs(t),motivo:`Ajuste masivo ${t>0?"+":""}${t}`,stockAntes:a,stockDespues:i.stock})}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkStockModal").style.display="none",manekiToastExport(`\u2705 Stock ajustado en ${r.length} producto(s)`,"ok")}window._bulkStockAplicar=_bulkStockAplicar;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,r=document.getElementById("bulkPrecioSoloMP")?.checked||!1,s=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(i=>s&&String(i.category)!==s?!1:o&&r?!0:!(o&&!(!i.tipo||i.tipo==="producto"||i.tipo==="producto_interno"||i.tipo==="pack")||r&&i.tipo!=="materia_prima")).map(i=>{const a=r&&!o?"cost":"price",n=parseFloat(i[a])||0,d=Math.max(0,Math.round(n*(1+t/100)*100)/100);return{p:i,campoKey:a,precioActual:n,precioNuevo:d}}).filter(i=>i.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const o=_bulkPrecioGetAfectados();if(!o.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=o.slice(0,50).map(({p:r,campoKey:s,precioActual:i,precioNuevo:a})=>{const n=a-i,d=n>0?"#16a34a":n<0?"#dc2626":"#6b7280",l=s==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(r.name)}">${_esc(r.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${l}: $${i.toFixed(2)}</span>
            <span style="font-weight:700;color:${d};white-space:nowrap;">\u2192 $${a.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,r=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",s=o>0?"+":"",i=t.slice(0,5).map(({p:a,precioActual:n,precioNuevo:d})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(a.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${n.toFixed(2)}</span>
            <span style="font-weight:700;color:${d>n?"#16a34a":"#dc2626"};">\u2192 $${d.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${s}${o}%</strong> al ${r} de <strong>${t.length}</strong> producto(s):</p>
                ${i}
             </div>`,"\u2705 Confirmar cambio masivo").then(a=>{a&&(t.forEach(({p:n,campoKey:d,precioNuevo:l})=>{n[d]=l,n.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${s}${o}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:a,campoKey:n,precioNuevo:d})=>{a[n]=d,a.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;document.getElementById("inventoryPaginationBar")?.remove();const o=window.products||[],r=document.getElementById("inventoryTipoFilter")?.value||"",s=["pt","pv","mp","svc"].map(e=>`${e}:${window[`_invPage_${e}`]||1}`).join("|"),i=o.length+"_"+o.reduce((e,m)=>e+Number(m.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+r+"_"+s+"_"+(window._invPageSize||10)+"_"+(window._invSortCol||"")+"_"+(window._invSortDir||""),a=document.getElementById("invDualContainer");a&&(a._lastHash=i);let n=document.getElementById("invDualContainer");if(!n){const e=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;n=document.createElement("div"),n.id="invDualContainer",n.style.cssText="display:flex;flex-direction:column;gap:0;",e.parentNode.insertBefore(n,e),e.style.display="none"}const d=window.products||[],l=new Map(d.map(e=>[String(e.id),typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0]));if(window._invStockCache=l,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const e=document.createElement("style");e.id="invExtraColStyles",e.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(e)}let p=document.getElementById("invExtraColToggle");if(p||(p=document.createElement("button"),p.id="invExtraColToggle",p.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",p.textContent="Mostrar SKU/Proveedor",p.addEventListener("click",()=>{const e=document.getElementById("invDualContainer");if(!e)return;const m=e.classList.toggle("inv-show-extra");p.textContent=m?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),n.parentNode.insertBefore(p,n)),d.length===0){n.innerHTML=`
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
        </div>`;return}const f=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",v=(document.getElementById("inventoryTagFilter")||{}).value||"",w=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function C(e){const m=window._normSearch||(b=>String(b||"").toLowerCase()),u=m(f),$=m(w),h=b=>!v||b.tags&&b.tags.includes(v),k=b=>!w||m(b.proveedor||"").includes($);if(!f)return e.filter(b=>h(b)&&k(b));const M=e.filter(b=>(m(b.name).includes(u)||m(b.sku||"").includes(u)||m(b.proveedor||"").includes(u)||m(b.notas||"").includes(u)||(b.tags||[]).some(X=>m(X).includes(u)))&&h(b)&&k(b));return M.length>0?M:e.filter(b=>(_fuzzyMatch(u,b.name||"")||_fuzzyMatch(u,b.sku||"")||_fuzzyMatch(u,b.proveedor||""))&&h(b)&&k(b))}const x=C(d.filter(e=>e.tipo==="materia_prima")),j=C(d.filter(e=>e.tipo==="servicio")),D=C(d.filter(e=>e.tipo==="producto_variable")),V=C(d.filter(e=>!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")),E=new Set([...V,...D].map(e=>String(e.id))),I=window.productMap||new Map(d.map(e=>[String(e.id),e])),T=new Map;for(const e of d)e.mpComponentes&&e.mpComponentes.length>0&&E.has(String(e.id))&&T.set(String(e.id),calcularDisponibilidadDesdeMP(e,I,l));function c(e){if(!window._invSortCol)return e;const m=window._invSortCol,u=window._invSortDir;return[...e].sort(($,h)=>{let k,M;return m==="name"?(k=($.name||"").toLowerCase(),M=(h.name||"").toLowerCase()):m==="sku"?(k=($.sku||"").toLowerCase(),M=(h.sku||"").toLowerCase()):m==="category"?(k=($.category||"").toLowerCase(),M=(h.category||"").toLowerCase()):m==="price"?(k=Number($.price)||0,M=Number(h.price)||0):m==="stock"?(k=Number($.stock)||0,M=Number(h.stock)||0):m==="margin"&&(k=$.cost&&$.price?($.price-$.cost)/$.price:-1,M=h.cost&&h.price?(h.price-h.cost)/h.price:-1),k<M?u==="asc"?-1:1:k>M?u==="asc"?1:-1:0})}function y(e,m){const u=String(e.id),$=l.get(u)??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0),h=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3ED}"}</span>`;let k;$===0?k='<span class="badge-danger"><i class="fas fa-circle-xmark"></i> Agotado</span>':$<=(e.stockMin||5)?k='<span class="badge-warning"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':k='<span class="badge-success"><i class="fas fa-circle-check"></i> Disponible</span>';const M=(window.categories||[]).find(F=>F.id===e.category),b=M?M.name:e.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${h}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.historialCostos&&e.historialCostos.length?`<span title="Este producto ha tenido ${e.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#9669c4;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialCostos.length} cambio${e.historialCostos.length>1?"s":""}</span>`:""}
                    ${e.compraPaquete?`<div style="font-size:10px;color:#9669c4;margin-top:2px;">\u{1F4E6} Paquete: ${e.compraPaquete.cantidad} uds \xB7 $${Number(e.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(F=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#9669c4;border:1px solid #e9d5ff;">${_esc(F)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(b)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#9669c4;font-weight:600;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(e.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${u}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span data-dblclick="editarStockInline" data-arg="${u}" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${$} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(e.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;align-items:center;">
                    <button type="button" data-action="editProduct" data-arg="${u}" title="Editar" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="ajustarStock" data-arg="${u}" title="Ajustar stock" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">\u{1F4E6}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" data-action="_invMpMenu" data-arg="${u}" data-pass-el="before" title="M\xE1s acciones" style="width:30px;height:30px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;font-weight:700;color:#6b7280;"><i class="fas fa-ellipsis"></i></button>
                    </div>
                </div>
            </td>
        </tr>`}function _(e,m){const u=String(e.id),$=`<span style="font-size:1.6rem;">${e.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(h=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f6ecff;color:#7d4fa3;border:1px solid #dfbfff;">${_esc(h)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#7d4fa3;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#f6ecff;color:#7d4fa3;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button data-action="openServicioModal" data-arg="${u}" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>
                    <button data-action="deleteProduct" data-arg="${u}" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function U(e,m){const u=String(e.id),$=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F4E6}"}</span>`,h=(window.categories||[]).find(g=>g.id===e.category),k=h?h.name:e.category||"",M=T.get(u)??null;let b,F;if(M!==null){const g=M.piezas,P=g===0?"#ef4444":g<=3?"#f59e0b":"#10b981",B=g===0?"#fee2e2":g<=3?"#fef3c7":"#d1fae5",S=M.detalle.map(H=>`${H.nombre}: ${H.stock}\xF7${H.qty}=${H.posibles}pzs`).join(" | ");b=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(S)}"
                        style="padding:3px 12px;border-radius:8px;background:${B};color:${P};
                               font-weight:700;font-size:.95rem;border:1px solid ${P}33;cursor:help;">
                        ${g}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,F=g===0?'<span class="badge-danger">Sin stock MP</span>':g<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const g=l.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0),P=e.stockMin||5,B=g===0?"#ef4444":g<=P?"#f59e0b":"#10b981";b=`<span style="padding:3px 12px;border-radius:8px;background:${g===0?"#fee2e2":g<=P?"#fef3c7":"#d1fae5"};color:${B};font-weight:700;font-size:.95rem;">${g}</span>`,F=g===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-xmark"></i> Agotado</span>':g<=P?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-check"></i> Disponible</span>'}const X=`_invVar_${u}_open`,N=window[X]===!0,W=e.variants&&e.variants.length>0?`<div>
                <button data-action="_mkInvToggleVarCollapse" data-arg="${u}" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${N?"\u25B2":"\u25B6"} ${e.variants.length} variante${e.variants.length!==1?"s":""}
                </button>
                ${N?'<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">'+e.variants.map(g=>`
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(g.type)}:</span>
                        ${_mkColorDot(g.type,_esc(g.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(g.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${g.qty??0}</span>
                    </div>`).join("")+"</div>":""}
               </div>`:'<span class="text-xs text-gray-400">Sin variantes</span>',Q=Number(e.cost)||0,O=Number(e.price)||0,q=Q&&O?(()=>{const g=(O-Q)/O*100,P=g>=40?"#10b981":g>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${P};">${g.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,g).toFixed(0)}%;background:${P};border-radius:99px;"></div>
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
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${e.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${e.tipo==="pack"&&e.packComponentes&&e.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${e.packComponentes.map(g=>`${g.qty>1?g.qty+"\xD7 ":""}${_esc(g.nombre)}`).join(" + ")}</div>`:""}
                    ${e.historialPrecios&&e.historialPrecios.length?`<span title="Este producto ha tenido ${e.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialPrecios.length} cambio${e.historialPrecios.length>1?"s":""}</span>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(e.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(e.proveedorNombre)}</b>${e.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(g=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(g)}</span>`).join("")}</div>`:""}
                    ${(()=>{const g=calcularProducibles(e);if(g===null)return"";const P=g>=5?"#16a34a":g>=1?"#d97706":"#dc2626",B=g>=5?"#d1fae5":g>=1?"#fef3c7":"#fee2e2",S=g===0?"Sin stock MP":`Producibles: ${g}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${B};color:${P};border:1px solid ${P}33;">\u{1F3ED} ${S}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(k)}</td>
            <td class="px-4 py-3">${W}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" data-dblclick="invInlineEditPrice" data-arg="${u}" data-pass-el="true" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(e.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" data-dblclick="invInlineEditStock" data-arg="${u}" data-pass-el="true" style="cursor:pointer;" title="Doble-click para editar stock">${b}</td>
            <td class="px-4 py-3">${F}</td>
            <td class="px-4 py-3">${q}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${e.tipo==="pack"?`<button type="button" data-action="openPackModal" data-arg="${u}" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>`:`<button type="button" data-action="editProduct" data-arg="${u}" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>`}
                    <button type="button" data-action="duplicarProducto" data-arg="${u}" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>
                    ${e.tipo!=="pack"?`<button type="button" data-action="cambiarTipoProducto" data-arg="${u}" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${e.movimientos&&e.movimientos.length?`<button type="button" data-action="verMovimientosProducto" data-arg="${u}" title="Ver movimientos de stock (${e.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>`:""}
                    <button type="button" data-action="abrirMovimientoProducto" data-arg="${u}" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-chart-line"></i></button>
                    <button type="button" data-action="archivarProducto" data-arg="${u}" title="${e.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${e.activo===!1?'<i class="fas fa-lock-open"></i>':'<i class="fas fa-box-archive"></i>'}</button>
                    <button type="button" data-action="deleteProduct" data-arg="${u}" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function K(e,m){const u=String(e.id),$=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3AF}"}</span>`,h=(e.tablaPreciosVariable||[]).slice().sort((z,G)=>z.cantidadMin-G.cantidadMin),k=h.length?h.map(z=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${z.cantidadMin} pzas = $${Number(z.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',M=(e.mpComponentes||[]).length,b=(window.categories||[]).find(z=>String(z.id)===String(e.category)),F=b?`${b.emoji||""} ${b.name}`:"\u2014",X=h,N=X.length?X[0].precio/(X[0].cantidadMin||1):0,it=N>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${N.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',W=T.get(String(e.id))??null;let Q,O;if(W!==null){const z=W.piezas,G=z===0?"#ef4444":z<=3?"#f59e0b":"#10b981",lt=z===0?"#fee2e2":z<=3?"#fef3c7":"#d1fae5",at=W.detalle.map(tt=>`${tt.nombre}: ${tt.stock}\xF7${tt.qty}=${tt.posibles}pzs`).join(" | ");Q=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(at)}" style="padding:3px 12px;border-radius:8px;background:${lt};color:${G};font-weight:700;font-size:.95rem;border:1px solid ${G}33;cursor:help;">${z}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,O=z===0?'<span class="badge-danger">Sin stock MP</span>':z<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else Q='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',O='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const q=(e.mpComponentes||[]).reduce((z,G)=>z+(parseFloat(G.costUnit)||0)*(parseFloat(G.qty)||1),0),g=e.rendimientoPorHoja||1,P=g>0?q/g:q,B=N>0?Math.round((N-P)/N*100):0,S=B>=40?"#10b981":B>=20?"#f59e0b":"#ef4444",H=N>0?`<div style="min-width:48px;">
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
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${e.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${e.rendimientoPorHoja} uds/hoja \xB7 ${M} MP${M!==1?"s":""}</div>`:M>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${M} MP${M!==1?"s":""}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(z=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(z)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(F)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${k}</div></td>
            <td class="px-4 py-3 text-right">${it}</td>
            <td class="px-4 py-3">${Q}</td>
            <td class="px-4 py-3">${O}</td>
            <td class="px-4 py-3">${H}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" data-action="editProduct" data-arg="${u}" title="Editar" aria-label="Editar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="duplicarProducto" data-arg="${u}" title="Duplicar" aria-label="Duplicar service"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>
                    <button type="button" data-action="deleteProduct" data-arg="${u}" title="Eliminar" aria-label="Eliminar service"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function J({id:e,title:m,titleColor:u,titleBg:$,btnLabel:h,btnOnclick:k,btnColor:M,extraBtnHTML:b,products:F,renderFila:X,headers:N,emptyMsg:it}){const W=document.getElementById("inventoryTipoFilter")?.value||"";if(W==="materia"&&e!=="mp"||W==="producto"&&e==="mp")return"";const Q=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(F.length===0&&Q)return"";const O=c(F),q=`_invPage_${e}`,g=window._invPageSize||10;window[q]=window[q]||1;const P=O.length,B=Math.max(1,Math.ceil(P/g));window[q]>B&&(window[q]=1);const S=window[q],H=(S-1)*g,z=O.slice(H,H+g),G=z.length===0?`<tr><td colspan="${N.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${it}</td></tr>`:z.map((R,ot)=>X(R,ot)).join(""),lt=N.map(R=>{const ot=R.colId==="sku"?" inv-col-hidden-sku":R.colId==="proveedor"?" inv-col-hidden-prov":"",nt=R.align==="right"?" text-right":" text-left";return R.sortKey?`<th class="px-4 py-3${nt} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${ot}" data-action="sortInventory" data-arg="${R.sortKey}" style="white-space:nowrap;">${R.label} \u2195</th>`:`<th class="px-4 py-3${nt} text-xs font-semibold text-gray-500 uppercase tracking-wide${ot}" style="white-space:nowrap;">${R.label}</th>`}).join("");let at="";if(B>1||P>g){const R=Math.min(H+g,P);at=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${H+1}\u2013${R}</b> de <b>${P}</b></span>
                <div style="display:flex;gap:4px;">
                    <button data-action="invSectionPage" data-arg="${e}" data-arg2="${S-1}" onclick="invSectionPage('${e}', ${S-1})" ${S<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${S<=1?"default":"pointer"};opacity:${S<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,B)},(ot,nt)=>{let A=S<=3?nt+1:S+nt-2;return A<1&&(A=null),A>B&&(A=null),A===null?"":`<button data-action="invSectionPage" data-arg="${e}" data-arg2="${A}" onclick="invSectionPage('${e}', ${A})" style="min-width:30px;padding:4px 8px;border:1px solid ${A===S?"#FFD166":"#e5e7eb"};border-radius:7px;background:${A===S?"#FFD166":"#fff"};color:${A===S?"#fff":"#374151"};font-weight:${A===S?700:400};font-size:13px;cursor:${A===S?"default":"pointer"};" ${A===S?"disabled":""}>${A}</button>`}).join("")}
                    <button data-action="invSectionPage" data-arg="${e}" data-arg2="${S+1}" onclick="invSectionPage('${e}', ${S+1})" ${S>=B?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${S>=B?"default":"pointer"};opacity:${S>=B?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}const tt=`_invSec_${e}_collapsed`,ct=window[tt]===!0;return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${u}33;box-shadow:0 2px 12px ${u}11;">
            <!-- Header de secci\xF3n (clicable para colapsar) -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${$};border-bottom:${ct?"none":"1.5px solid "+u+"33"};cursor:pointer;" data-action="_mkInvToggleCollapse" data-arg="${e}">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${u};transition:transform .2s;">${ct?"\u25B6":"\u25BC"}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${u};">${m}</span>
                    <span style="background:${u};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${P}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${b||""}
                    <button type="button" data-action="_mkInvAddBtnAction" data-arg="${e}" onclick="_mkInvAddBtnAction('${e}')" class="mk-btn-primary"
                        style="padding:7px 16px;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${h}
                    </button>
                </div>
            </div>
            ${ct?"":`
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${lt}</tr>
                    </thead>
                    <tbody>${G}</tbody>
                </table>
            </div>
            ${at}`}
        </div>`}const L=d.filter(e=>!e.deletedAt),Y=L.length,Z=L.reduce((e,m)=>{const u=l.get(String(m.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(m):parseInt(m.stock)||0);return e+(Number(m.cost)||0)*Math.max(0,u)},0),rt=L.filter(e=>(l.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0))<=(e.stockMin||5)).length,st=L.filter(e=>(!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")&&Number(e.price)>0),dt=st.length?st.reduce((e,m)=>{const u=Number(m.price)||0,$=Number(m.cost)||0;return e+(u>0?(u-$)/u*100:0)},0)/st.length:0;let et=document.getElementById("invKpiBar");et||(et=document.createElement("div"),et.id="invKpiBar",n.parentNode.insertBefore(et,n)),et.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${Y}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#9669c4;">$${Z.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${rt>0?"#ef4444":"#10b981"};">${rt}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${dt>=40?"#10b981":dt>=20?"#f59e0b":"#ef4444"};">${dt.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const pt=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#FFD166",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",extraBtnHTML:'<button type="button" data-action="_mkInvCreatePack" onclick="_mkInvCreatePack()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" data-action="abrirBulkPrecioModal" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:V,renderFila:U,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",products:D,renderFila:K,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#9669c4",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",extraBtnHTML:'<button type="button" data-action="abrirBulkStockModal" onclick="abrirBulkStockModal()" class="mk-toolbar-btn">\u{1F4E6} Ajustar stock masivo</button>',products:x,renderFila:y,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#7d4fa3",titleBg:"linear-gradient(135deg,#f5f3ff,#f6ecff)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",products:j,renderFila:_,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],ut=(f||v||w).length>0;let ft=!1;for(const e of pt){const m=J(e);m&&(ft=!0);let u=document.getElementById(`invSec_${e.id}`);u||(u=document.createElement("div"),u.id=`invSec_${e.id}`,n.appendChild(u));const $=e.products.map(k=>[k.id,k.updatedAt||"",k.stock||0,k.price||0,k.cost||0,k.activo===!1?"0":"1"].join(":")).join("|"),h=e.products.length+"_"+$+"_"+(window[`_invPage_${e.id}`]||1)+"_"+(window._invPageSize||10)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r;u._hash!==h&&(u.innerHTML=m,u._hash=h)}const gt=new Set(pt.map(e=>`invSec_${e.id}`));for(let e=n.children.length-1;e>=0;e--){const m=n.children[e];m.id&&m.id.startsWith("invSec_")&&!gt.has(m.id)&&m.remove()}ut&&!ft&&(n.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(t,o){const r=`_invPage_${t}`,s=window.products||[],i=t==="mp"?s.filter(f=>f.tipo==="materia_prima"):t==="svc"?s.filter(f=>f.tipo==="servicio"):t==="pv"?s.filter(f=>f.tipo==="producto_variable"):s.filter(f=>!f.tipo||f.tipo==="producto"||f.tipo==="producto_interno"||f.tipo==="pack"),a=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",n=(document.getElementById("inventoryTagFilter")||{}).value||"",d=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",l=i.filter(f=>{const v=!a||f.name.toLowerCase().includes(a)||(f.sku||"").toLowerCase().includes(a)||(f.proveedor||"").toLowerCase().includes(a)||(f.notas||"").toLowerCase().includes(a)||(f.tags||[]).some(x=>x.toLowerCase().includes(a)),w=!n||f.tags&&f.tags.includes(n),C=!d||(f.proveedor||"").toLowerCase().includes(d);return v&&w&&C}),p=Math.max(1,Math.ceil(l.length/(window._invPageSize||10)));window[r]=Math.max(1,Math.min(o,p)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,o,r,s,i){let a=document.getElementById("inventoryPaginationBar");if(!a){const p=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!p)return;a=document.createElement("div"),a.id="inventoryPaginationBar",p.insertAdjacentElement("afterend",a)}if(o<=1&&r<=i){a.innerHTML="";return}const n=Math.min(s+i,r),d=`Mostrando <b>${s+1}\u2013${n}</b> de <b>${r}</b> productos`;function l(){const p=[],f=(v,w)=>{for(let C=v;C<=w;C++)p.push(C)};return o<=7?f(1,o):(p.push(1),t>4&&p.push("..."),f(Math.max(2,t-2),Math.min(o-1,t+2)),t<o-3&&p.push("..."),p.push(o)),p.map(v=>{if(v==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const w=v===t;return`<button data-action="invGoToPage" data-arg="${v}"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${w?"#FFD166":"#e5e7eb"};
                       background:${w?"#FFD166":"white"};color:${w?"white":"#374151"};
                       font-weight:${w?"700":"500"};font-size:13px;cursor:${w?"default":"pointer"};
                       transition:all 0.15s;"
                ${w?"disabled":""}>${v}</button>`}).join("")}a.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${d}</span>
                <select data-change="invChangePageSize" data-pass-el="1"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(p=>`<option value="${p}" ${p===i?"selected":""}>${p} por p\xE1gina</option>`).join("")}
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
                <button data-action="invGoToPage" data-arg="${t+1}" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button data-action="invGoToPage" data-arg="${o}" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const r=(typeof t=="string"?parseInt(t):t)||1,i=Array.from(document.querySelectorAll('[id^="invSec_"]')).find(n=>n.offsetParent!==null&&n.textContent?.includes("Mostrando"))?.id?.replace("invSec_","");if(i&&typeof invSectionPage=="function")invSectionPage(i,r);else{const n=Math.max(1,Math.ceil((window.products||[]).length/(window._invPageSize||10)));window._invCurrentPage=Math.max(1,Math.min(r,n)),renderInventoryTable()}const a=document.getElementById("inventoryTable");a&&a.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){const o=typeof t=="object"&&t?t.value:t;window._invPageSize=parseInt(o)||10,window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;function _invMpMenu(t,o){const r=(window.products||[]).find(p=>String(p.id)===String(o));if(!r)return;const s=!!r.proveedorUrl,i=r.activo===!1?"desarchivar":"archivar",a=document.getElementById("_invMpMenuDrop");if(a&&(a.remove(),a.dataset.pid===o))return;const n=document.createElement("div");n.id="_invMpMenuDrop",n.dataset.pid=o,n.style.cssText="position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:172px;overflow:hidden;font-size:.78rem;";const d=(p,f)=>`style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:${p};text-align:left;" onmouseover="this.style.background='${f}'" onmouseout="this.style.background='none'"`;n.innerHTML=`
        <button data-action="registrarMerma" data-arg="${o}" data-close-menu-drop="true" ${d("#d97706","#fffbeb")}>\u{1F4C9} Registrar merma</button>
        <button data-action="duplicarProducto" data-arg="${o}" data-close-menu-drop="true" ${d("#9669c4","#f5f3ff")}>\u{1F4CB} Duplicar</button>
        <button data-action="cambiarTipoProducto" data-arg="${o}" data-close-menu-drop="true" ${d("#b45309","#fef9c3")}>\u2192\u{1F4E6} Convertir a PT</button>
        <button data-action="abrirMovimientoProducto" data-arg="${o}" data-close-menu-drop="true" ${d("#4338ca","#eef2ff")}>\u{1F4C8} Ver gr\xE1fica</button>
        ${s?`<button data-action="_mkInvOpenProveedor" data-arg="${o}" data-close-menu-drop="true" ${d("#16a34a","#f0fdf4")}>\u{1F517} Abrir proveedor</button>`:""}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button data-action="archivarProducto" data-arg="${o}" data-close-menu-drop="true" ${d("#6b7280","#f9fafb")}>\u{1F4C1} ${i==="desarchivar"?"Desarchivar":"Archivar"}</button>
        <button data-action="deleteProduct" data-arg="${o}" data-close-menu-drop="true" ${d("#dc2626","#fef2f2")}>\u{1F5D1}\uFE0F Eliminar</button>
    `,document.body.appendChild(n);const l=t.getBoundingClientRect();n.style.top=l.bottom+window.scrollY+4+"px",n.style.left=Math.min(l.left+window.scrollX,window.innerWidth-180)+"px",setTimeout(()=>document.addEventListener("click",function p(f){n.contains(f.target)||(n.remove(),document.removeEventListener("click",p))}),0)}window._invMpMenu=_invMpMenu;function _mkInvToggleVarCollapse(t){const o=`_invVar_${t}_open`;window[o]=!window[o],renderInventoryTable()}window._mkInvToggleVarCollapse=_mkInvToggleVarCollapse;function _mkInvOpenProveedor(t){const o=(window.products||[]).find(r=>String(r.id)===String(t));o?.proveedorUrl&&window.open(o.proveedorUrl,"_blank")}window._mkInvOpenProveedor=_mkInvOpenProveedor;function _mkInvToggleCollapse(t){const o=`_invSec_${t}_collapsed`;window[o]=!window[o],renderInventoryTable()}window._mkInvToggleCollapse=_mkInvToggleCollapse;function _mkInvAddBtnAction(t){t==="pt"?typeof window.openAddProductModal=="function"&&window.openAddProductModal():t==="pv"?(typeof window.injectVariableProductModal=="function"&&window.injectVariableProductModal(),typeof window.openVariableProductModal=="function"&&window.openVariableProductModal()):t==="mp"?(typeof window.injectMpModal=="function"&&window.injectMpModal(),typeof window.openAddMateriaPrimaModal=="function"&&window.openAddMateriaPrimaModal()):t==="svc"&&(typeof window.injectSvcModal=="function"&&window.injectSvcModal(),typeof window.openServicioModal=="function"&&window.openServicioModal())}window._mkInvAddBtnAction=_mkInvAddBtnAction;function _mkInvCreatePack(){typeof window.injectPackModal=="function"&&window.injectPackModal(),typeof window.openPackModal=="function"&&window.openPackModal()}window._mkInvCreatePack=_mkInvCreatePack;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const r=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("movTipoFilter")||{}).value||"";let i=window.stockMovements||[];r&&(i=i.filter(x=>x.productoNombre?.toLowerCase().includes(r)||(x.motivo||"").toLowerCase().includes(r))),s&&(i=i.filter(x=>(x.tipo||"")===s));const a=_fechaHoy(),n=(window.stockMovements||[]).filter(x=>{try{const j=new Date(x.fecha);return j.getFullYear()+"-"+("0"+(j.getMonth()+1)).slice(-2)+"-"+("0"+j.getDate()).slice(-2)===a}catch{return!1}}),d={};n.forEach(x=>{d[x.tipo]=(d[x.tipo]||0)+1});const l={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},p={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let f=document.getElementById("movResumenHoy");f||(f=document.createElement("div"),f.id="movResumenHoy",o.parentNode.insertBefore(f,o));const v=Object.keys(d).map(x=>`${l[x]||"\u26AA"} ${p[x]||x}: <strong>${d[x]}</strong>`);f.innerHTML=v.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${v.join("&nbsp;&nbsp;")}
           </div>`:"";let w=document.getElementById("movExportCSVBtn");if(w||(w=document.createElement("button"),w.id="movExportCSVBtn",w.textContent="\u{1F4E5} Exportar historial CSV",w.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",w.onclick=function(){const x=window.stockMovements||[];let D=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;x.forEach(T=>{const c=[new Date(T.fecha).toLocaleString("es-MX"),T.productoNombre||"",T.tipo||"",T.cantidad,T.motivo||"",T.stockAntes??"",T.stockDespues??""];D+=c.map(y=>`"${String(y).replace(/"/g,'""')}"`).join(",")+`
`});const V=new Blob([D],{type:"text/csv;charset=utf-8;"}),E=URL.createObjectURL(V),I=document.createElement("a");I.href=E,I.download=`movimientos-${a}.csv`,I.click(),URL.revokeObjectURL(E)},o.parentNode.insertBefore(w,o)),!i.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const C={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=i.slice(0,200).map(x=>{const j=new Date(x.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),D=x.cantidad>=0?`+${x.cantidad}`:`${x.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${C[x.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(x.productoNombre||(x.productoId&&!(window.products||[]).find(V=>String(V.id)===String(x.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${j} \xB7 ${x.tipo} \xB7 ${_esc(x.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${x.cantidad>=0?"#10b981":"#ef4444"};">${D} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${x.stockAntes} \u2192 ${x.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){showConfirm("Se borrar\xE1 permanentemente todo el historial de movimientos de inventario.","\xBFBorrar historial?").then(t=>{t&&(window.stockMovements=[],window.stockMovimientos=[],saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").delete().neq("id","00000000-0000-0000-0000-000000000000").then(({error:o})=>{o&&console.warn("[Inv] Error limpiando stock_movements relacional:",o.message)}),renderMovimientos())})}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const o=document.getElementById(t);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const r={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(s=>{const i=new Date(s.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),a=s.cantidad>=0?`+${s.cantidad}`:`${s.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${r[s.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(s.productoNombre||(s.productoId&&!(window.products||[]).find(n=>String(n.id)===String(s.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${i} \xB7 ${s.tipo} \xB7 ${_esc(s.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${s.cantidad>=0?"#10b981":"#ef4444"};">${a} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${s.stockAntes} \u2192 ${s.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const o=(window.products||[]).find(s=>String(s.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const r=JSON.parse(JSON.stringify(o));r.id=_genId(),r.name="Copia de "+o.name,r.sku=(o.sku||"")+"-C",r.stock=0,r.historialPrecios=[],r.historialCostos=[],window.products.unshift(r),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${r.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(n=>!n.tipo||n.tipo==="producto"||n.tipo==="producto_interno"),o=t.map(n=>{const d=n.price>0&&n.cost>0?(n.price-n.cost)/n.price*100:null;return{...n,_margen:d}}).sort((n,d)=>(d._margen??-1/0)-(n._margen??-1/0)),r=o.map((n,d)=>{const l=n._margen!==null?n._margen.toFixed(1)+"%":"\u2014",p=n.price>0&&n.cost>0?"$"+(n.price-n.cost).toFixed(2):"\u2014",f=n._margen===null?"#9ca3af":n._margen>=50?"#16a34a":n._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${d===0?"\u{1F947}":d===1?"\u{1F948}":d===2?"\u{1F949}":`${d+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(n.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(n.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(n.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${p}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${f};font-size:14px;">${l}</td>
        </tr>`}).join(""),s=o.filter(n=>n._margen!==null).reduce((n,d,l,p)=>n+d._margen/p.length,0),i=o[0];let a=document.getElementById("_mkRentabilidadModal");a||(a=document.createElement("div"),a.id="_mkRentabilidadModal",a.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",a.addEventListener("click",n=>{n.target===a&&(a.style.display="none")}),document.body.appendChild(a)),a.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${o.some(n=>n._margen!==null)?s.toFixed(1)+"%":"\u2014"}</div>
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
                    <tbody>${r||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,a.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(r=>{r.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),t.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#9669c4;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const o=(window.pedidos||[]).filter(i=>!["cancelado","finalizado"].includes(i.status||"")&&(i.productosInventario||[]).some(a=>t.includes(String(a.id))));if(o.length>0){const i=o.map(n=>n.folio||n.id).slice(0,5).join(", ");if(!(typeof showConfirm=="function"?await showConfirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`,"Productos en pedidos activos"):confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`)))return}if(!(typeof showConfirm=="function"?await showConfirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`,"\u{1F5D1} Confirmar eliminaci\xF3n"):confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`)))return;const s=[...t];if(window.products=(window.products||[]).filter(i=>!s.includes(String(i.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",s)}catch(i){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",i)}manekiToastExport(`\u{1F5D1} ${s.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),o=(window.products||[]).filter(l=>t.includes(String(l.id))),r="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",s=o.map(l=>[l.tipo||"pt",l.name,l.sku||"",l.cost||0,l.price||0,l.stock||0,l.stockMin||5,l.proveedor||"",l.notas||""].map(p=>`"${String(p).replace(/"/g,'""')}"`).join(",")),i="\uFEFF"+r+`
`+s.join(`
`),a=new Blob([i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(a),d=document.createElement("a");d.href=n,d.download="inventario_seleccion.csv",d.click(),URL.revokeObjectURL(n),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const o=await new Promise(s=>{const i=document.getElementById("mkBatchCatModal");i&&i.remove();const n=(window.categories||[]).map(l=>`<option value="${l.id}">${l.emoji||""} ${l.name}</option>`).join(""),d=document.createElement("div");d.id="mkBatchCatModal",d.className="mk-modal-overlay",d.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
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
      </div>`,window._mkBCR=l=>{d.remove(),s(l)},document.body.appendChild(d),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!o)return;const r=(window.categories||[]).find(s=>String(s.id)===String(o));if(!r){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(s=>{t.includes(String(s.id))&&(s.category=r.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};function _mkInvResetPages(){window._invCurrentPage=1,["pt","pv","mp","svc"].forEach(t=>{window[`_invPage_${t}`]=1})}function _mkInvDispatchFilter(t,o){const r=t._invPagListenerAdded;t.dispatchEvent(new Event(o,{bubbles:!0})),!r&&typeof renderInventoryTable=="function"&&renderInventoryTable()}window._mkInvSetTipo=function(t){const o=document.getElementById("inventoryTipoFilter");o&&(o.value=t,_mkInvResetPages(),_mkInvSyncSeg(),_mkInvDispatchFilter(o,"change"))},window._mkInvClearOne=function(t){const o=document.getElementById(t);o&&(o.value="",_mkInvResetPages(),_mkInvDispatchFilter(o,t==="inventorySearch"?"input":"change"))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(o=>{const r=document.getElementById(o);r&&(r.value="")}),_mkInvResetPages();const t=document.getElementById("inventorySearch");t?(t.value="",_mkInvDispatchFilter(t,"input")):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),o=document.getElementById("mkInvTipoSeg");!t||!o||o.querySelectorAll("button").forEach(r=>r.classList.toggle("active",r.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),o=t?.parentElement;if(!(!t||!o)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const r=document.createElement("div");r.id="mkInvTipoSeg",r.className="mk-segmented",r.setAttribute("role","group"),r.setAttribute("aria-label","Tipo de producto"),r.innerHTML=[...t.options].map(s=>{const i=_MK_TIPO_LABELS[s.value]??(s.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${s.value}" onclick="_mkInvSetTipo('${s.value}')">${i}</button>`}).join(""),t.parentElement.insertBefore(r,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const r=document.createElement("span");r.id="mkInvDensity",r.style.marginLeft="auto",r.innerHTML=window.mkRenderDensityToggle(),o.appendChild(r),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const r=document.createElement("div");r.id="mkInvFilterInfo",r.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",o.parentElement.insertBefore(r,o.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const r=document.createElement("div");r.id="mkInvHerramientas",r.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",r.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock m\xEDnimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gr\xE1fica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
      <button type="button" onclick="abrirMovimientosRecientes()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Ver \xFAltimos movimientos de inventario"><i class="fas fa-history" style="margin-right:5px;"></i>Movimientos recientes</button>
    `;const s=document.getElementById("mkInvFilterInfo");s?s.parentElement.insertBefore(r,s):o.parentElement.insertBefore(r,o.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const o=document.getElementById("invDualContainer"),r=o?o.querySelectorAll(".inv-bulk-cb").length:0,s=(window.products||[]).length,i=document.getElementById("inventorySearch"),a=document.getElementById("inventoryTagFilter"),n=document.getElementById("inventoryProveedorFilter"),d=document.getElementById("inventoryTipoFilter"),l=[];i&&i.value.trim()&&l.push(`<span class="mk-filter-chip">Buscar: ${_esc(i.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),d&&d.value&&l.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[d.value]||d.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),a&&a.value&&l.push(`<span class="mk-filter-chip">Tag: ${_esc(a.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),n&&n.value&&l.push(`<span class="mk-filter-chip">Proveedor: ${_esc(n.options[n.selectedIndex]?.text||n.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let p=`<span class="mk-result-count">Mostrando <b>${r}</b> de ${s} producto${s!==1?"s":""}</span>`;l.length&&(p+=`<div class="mk-filter-chips">${l.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=p,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const o=new Set([...t.querySelectorAll(".inv-bulk-cb")].map(d=>String(d.dataset.id))),r=window._invStockCache;let s=0,i=0,a=0;(window.products||[]).forEach(d=>{if(!o.has(String(d.id)))return;a++;const l=r?.get(String(d.id))??(Number(d.stock)||0);s+=(Number(d.cost)||0)*Math.max(0,l),l<=(Number(d.stockMin)||5)&&i++});let n=document.getElementById("mkInvSummary");if(a===0){n&&n.remove();return}n||(n=document.createElement("div"),n.id="mkInvSummary",n.className="mk-table-summary",n.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(n,t.nextSibling)),n.innerHTML=`<span>Valor en costo: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${a} producto${a!==1?"s":""}</span>`+(i>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${i} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const o=window.renderInventoryTable;if(typeof o!="function"||o._mkWrapped)return;const r=function(...s){const i=o.apply(this,s);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return i};r._mkWrapped=!0,window.renderInventoryTable=r})();function _mkInvModal(t,o,r,s="700px"){let i=document.getElementById(t+"_ov");i||(i=document.createElement("div"),i.id=t+"_ov",i.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(i)),i.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${s};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${o}</h3>
        <button onclick="document.getElementById('${t}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${r}</div>
    </div>`,i.onclick=a=>{a.target===i&&i.remove()},i.style.display="flex"}function abrirConteoFisico(){const t=(window.products||[]).filter(i=>i.tipo!=="servicio"&&i.activo!==!1);if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const o=_esc,s=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${t.map((i,a)=>{const n=typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0;return`<tr style="${a%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${o(i.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${o(i.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${n}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${n}" data-pid="${o(i.id)}" data-sistema="${n}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",s,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const t=document.querySelectorAll("#mkConteo_ov .conteo-input");let o=0;if(t.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.sistema),a=Number(r.value);if(isNaN(a)||a===i)return;const n=(window.products||[]).find(l=>String(l.id)===String(s));if(!n)return;const d=a-i;n.stock=a,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:n.id,productoNombre:n.name,tipo:d>0?"entrada_manual":"salida_manual",cantidad:Math.abs(d),motivo:"Conteo f\xEDsico",stockAntes:i,stockDespues:a}),o++}),o===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${o} ajuste${o!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const t=(window.products||[]).filter(i=>i.tipo==="servicio"||i.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0)<=(Number(i.stockMin)||5));if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const o=_esc,r={};t.forEach(i=>{const a=i.proveedor||"Sin proveedor";r[a]||(r[a]=[]),r[a].push(i)});const s=Object.entries(r).map(([i,a])=>{const n=o(i),d=a.map(l=>{const p=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,f=Number(l.stockMin)||5,v=Math.max(1,f*2-p);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${o(l.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${p}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${f}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#FFD166;">${v}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${o(l.unidad||"pza")}</td></tr>`}).join("");return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${n} (${a.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:
${a.map(l=>`\u2022 ${l.name}: ${Math.max(1,(Number(l.stockMin)||5)*2-(typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0))} ${l.unidad||"pza"}`).join(`
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
        <tbody>${d}</tbody>
      </table>
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${t.length} productos`,s,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(t){const r=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(n=>{if(n.tipo==="servicio"||n.activo===!1)return!1;const d=n.proveedor||"Sin proveedor";return t&&d!==t?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5)}).map(n=>{const d=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0,l=Number(n.stockMin)||5;return`"${n.name}",${d},${l},${Math.max(1,l*2-d)},${n.unidad||"pza"},"${n.proveedor||""}"`})].join(`
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([r],{type:"text/csv;charset=utf-8;"}));const i=new Date,a=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;s.download=`reabastecimiento_${a}.csv`,s.click()};function mostrarDonutCategoria(){const t=_esc,o={};(window.products||[]).forEach(d=>{if(d.tipo==="servicio"||d.activo===!1)return;const l=typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0,p=(Number(d.price)||0)*l,f=d.category||"Sin categor\xEDa";o[f]=(o[f]||0)+p});const r=Object.entries(o).sort((d,l)=>l[1]-d[1]),s=r.reduce((d,[,l])=>d+l,0),i=["#FFD166","#9669c4","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#9669c4","#f97316","#14b8a6"],a=r.map(([d,l],p)=>{const f=s>0?(l/s*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i[p%i.length]};margin-right:6px;"></span>
        ${t(d)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${l.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${f}%</td>
    </tr>`}).join(""),n=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Valor de inventario (precio \xD7 stock) por categor\xEDa. Total: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></p>
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
          <td style="padding:8px 12px;text-align:right;">$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
          <td style="padding:8px 12px;text-align:right;">100%</td>
        </tr></tfoot>
      </table>
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",n,"700px"),setTimeout(()=>{const d=document.getElementById("mkDonutCat");if(d)try{const l=window.Chart;if(typeof l>"u"){d.style.display="none";return}new l(d,{type:"doughnut",data:{labels:r.map(([p])=>p),datasets:[{data:r.map(([,p])=>Math.round(p)),backgroundColor:r.map((p,f)=>i[f%i.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{d&&(d.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const t=_esc,o=new Date;o.setDate(o.getDate()-60);const r={};(window.pedidosFinalizados||[]).forEach(n=>{const d=n.fechaFinalizado||n.entrega||"";d&&new Date(d)<o||(n.productosInventario||[]).forEach(l=>{!l.id||l.id==="libre"||(r[String(l.id)]=(r[String(l.id)]||0)+(Number(l.quantity||l.cantidad)||1))})});const s=(window.products||[]).filter(n=>n.tipo!=="servicio"&&n.activo!==!1&&r[String(n.id)]);if(!s.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const a=`
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
      <tbody>${s.map(n=>{const d=r[String(n.id)]||0,l=d/60,p=Math.max(1,Math.ceil(l*14)),f=Number(n.stockMin)||0,v=p!==f?`<span style="color:${p>f?"#10b981":"#f59e0b"};font-weight:700;">${p>f?"\u25B2":"\u25BC"} ${p}</span>`:`<span style="color:#6b7280;">${p} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${t(n.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${f}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${v}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${t(n.id)}" data-nuevo="${p}" class="mkStockMinCb" style="accent-color:#FFD166;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",a,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const t=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let o=0;t.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.nuevo),a=(window.products||[]).find(n=>String(n.id)===String(s));!a||isNaN(i)||(a.stockMin=i,o++)}),o&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${o} producto${o!==1?"s":""}`,"ok"))};function archivarProducto(t){const o=(window.products||[]).find(a=>String(a.id)===String(t));if(!o)return;const r=o.activo!==!1,s=r?"archivar":"desarchivar",i=r?`\xBFArchivar "${o.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${o.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(i,r?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(a=>{a&&(o.activo=!r,o.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(r?`\u{1F4C1} "${o.name}" archivado`:`\u{1F513} "${o.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(t){const o=_esc,r=(window.products||[]).find(c=>String(c.id)===String(t));if(!r){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const s=Date.now()-90*864e5,i=new Set,a=[],n=c=>{if(!c)return;const y=c.fecha?new Date(c.fecha+(c.hora?"T"+c.hora:"")).getTime():c.timestamp?new Date(c.timestamp).getTime():0;if(y&&y<s)return;const _=c.id||String(c.productoId||t)+"_"+y+"_"+(c.cantidad||0);i.has(_)||(i.add(_),a.push({...c,_ts:y||Date.now()}))};(r.movimientos||[]).forEach(n),(window.stockMovimientos||[]).filter(c=>String(c.productoId)===String(t)).forEach(n),a.sort((c,y)=>y._ts-c._ts);const d=[];for(let c=12;c>=0;c--){const y=new Date(Date.now()-c*7*864e5),_=new Date(y.getTime()-7*864e5),U=`${_.getDate()}/${_.getMonth()+1}`;let K=0,J=0;a.forEach(L=>{if(L._ts>=_.getTime()&&L._ts<y.getTime()){const Y=L.stockDespues!=null&&L.stockAntes!=null?Number(L.stockDespues)-Number(L.stockAntes):0,Z=(L.tipo||"").toLowerCase();Y>0||Z.includes("entrada")||Z.includes("compra")||Z.includes("ajuste_positivo")?K+=Math.abs(Number(L.cantidad)||Math.abs(Y)||1):J+=Math.abs(Number(L.cantidad)||Math.abs(Y)||1)}}),d.push({label:U,entradas:K,salidas:J})}const l=Math.max(1,...d.map(c=>Math.max(c.entradas,c.salidas))),p=480,f=100,v=Math.floor((p-20)/d.length/2)-1,w=d.map((c,y)=>{const _=10+y*(v*2+4),U=Math.round(c.entradas/l*(f-20)),K=Math.round(c.salidas/l*(f-20));return`
      <rect x="${_}" y="${f-10-U}" width="${v}" height="${U}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${c.entradas}"/>
      <rect x="${_+v+1}" y="${f-10-K}" width="${v}" height="${K}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${c.salidas}"/>
      <text x="${_+v}" y="${f-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${c.label}</text>`}).join(""),C=a.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">\u25A0 Entradas</span>
        <span style="color:#ef4444;">\u25A0 Salidas</span>
      </div>
      <svg viewBox="0 0 ${p} ${f}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${f-10}" x2="${p-10}" y2="${f-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${w}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">\u2190 13 semanas</div>
    </div>`,x={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},j=a.slice(0,30).map(c=>{const y=c.fecha||(c._ts?new Date(c._ts).toLocaleDateString("es-MX"):"\u2014"),_=c.hora||"",U=x[c.tipo||""]||c.tipo||"\u2014",K=c.stockDespues!=null&&c.stockAntes!=null?Number(c.stockDespues)-Number(c.stockAntes):0,J=Number(c.cantidad)||Math.abs(K)||0,L=K>0||(c.tipo||"").includes("entrada")||(c.tipo||"").includes("compra"),Y=L?"#10b981":"#ef4444",Z=L?`+${J}`:`-${J}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${o(y)} ${_?`<span style="color:#9ca3af;font-size:.72rem;">${o(_.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${o(U)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${Y};">${Z}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${c.stockDespues!=null?c.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o(c.motivo||"")}">${o(c.motivo||"")}</td>
    </tr>`}).join(""),D=typeof getStockEfectivo=="function"?getStockEfectivo(r):Number(r.stock)||0,V=a.reduce((c,y)=>{const _=y.stockDespues!=null&&y.stockAntes!=null?Number(y.stockDespues)-Number(y.stockAntes):0;return c+(_>0||(y.tipo||"").includes("entrada")||(y.tipo||"").includes("compra")?Math.abs(Number(y.cantidad)||Math.abs(_)||0):0)},0),E=a.reduce((c,y)=>{const _=y.stockDespues!=null&&y.stockAntes!=null?Number(y.stockDespues)-Number(y.stockAntes):0,U=_>0||(y.tipo||"").includes("entrada")||(y.tipo||"").includes("compra");return c+(U?0:Math.abs(Number(y.cantidad)||Math.abs(_)||0))},0),I=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${D}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Stock actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">+${V}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Entradas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#fef2f2;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#ef4444;">-${E}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Salidas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#374151;">${a.length}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Movimientos</div>
      </div>
    </div>
    ${C}
    ${a.length>0?`
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      <thead><tr style="background:#f9fafb;font-size:.73rem;color:#9ca3af;font-weight:700;">
        <th style="padding:7px 10px;text-align:left;">Fecha</th>
        <th style="padding:7px 10px;text-align:left;">Tipo</th>
        <th style="padding:7px 10px;text-align:center;">Cant.</th>
        <th style="padding:7px 10px;text-align:center;">Stock</th>
        <th style="padding:7px 10px;text-align:left;">Motivo</th>
      </tr></thead>
      <tbody>${j}</tbody>
    </table>
    ${a.length>30?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${a.length-30} m\xE1s</p>`:""}`:""}
  `,T=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button onclick="(function(){
        var movs=${JSON.stringify(a.map(c=>({fecha:c.fecha||(c._ts?new Date(c._ts).toLocaleDateString("es-MX"):""),hora:c.hora||"",tipo:c.tipo||"",cantidad:c.cantidad||0,motivo:c.motivo||"",stockAntes:c.stockAntes??"",stockDespues:c.stockDespues??""})))};
        var headers=['Fecha','Hora','Tipo','Cantidad','Motivo','Stock antes','Stock despu\xE9s'];
        var csv=headers.join(',')+'\\n';
        movs.forEach(function(m){
          var row=[m.fecha,m.hora,m.tipo,m.cantidad,m.motivo,m.stockAntes,m.stockDespues];
          csv+=row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',')+'\\n';
        });
        var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;a.download='kardex-${o(r.name||"producto").replace(/[^a-zA-Z0-9]/g,"_")}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('\u{1F4E5} Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        \u{1F4E5} Exportar CSV
      </button>
    </div>
    ${I}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${o(r.name||"Producto")} (90d)`,T,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const t=window.inventarioSnapshots||[];if(t.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const o=[...t].sort((E,I)=>(E.fecha||"").localeCompare(I.fecha||"")),r=o.map(E=>E.fecha||""),s=o.map(E=>Number(E.valorTotal||E.valor||0)),i=540,a=140,n=Math.max(1,...s),d=Math.min(...s),l=n-d||1,f=`<polyline points="${s.map((E,I)=>{const T=20+I/Math.max(1,s.length-1)*(i-40),c=a-20-(E-d)/l*(a-40);return`${T},${c}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,v=s.map((E,I)=>{const T=20+I/Math.max(1,s.length-1)*(i-40),c=a-20-(E-d)/l*(a-40);return`<circle cx="${T}" cy="${c}" r="3.5" fill="#6366f1" opacity=".9"><title>${r[I]}: $${E.toLocaleString("es-MX")}</title></circle>`}).join(""),w=r.filter((E,I)=>I===0||I===r.length-1||I%Math.ceil(r.length/6)===0).map((E,I,T)=>`<text x="${20+r.indexOf(E)/Math.max(1,r.length-1)*(i-40)}" y="${a-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${E.slice(5)}</text>`).join(""),C=s[s.length-1]||0,x=s[0]||0,j=x>0?((C-x)/x*100).toFixed(1):"\u2014",D=Number(j)>=0?"#10b981":"#ef4444",V=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${C.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${D};">${Number(j)>=0?"+":""}${j}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variaci\xF3n total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${o.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${i} ${a}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${a-20}" x2="${i-10}" y2="${a-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${f}${v}${w}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">\u2190 Valor de inventario en costo \xB7 ${o.length} puntos</p>
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",V,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;function abrirMovimientosRecientes(){const t=_esc,o=[...window.stockMovements||window.stockMovimientos||[]].slice(0,50);if(o.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin movimientos registrados a\xFAn","warn");return}const r={ajuste:"#6366f1",entrada:"#10b981",compra:"#10b981",merma:"#ef4444",salida:"#ef4444",descuento:"#f59e0b",produccion:"#f59e0b",conteo:"#3b82f6",ajuste_positivo:"#10b981"},s=o.map(a=>{const n=(a.fecha||"").split("T"),d=n[0]||"",l=(n[1]||"").substring(0,5),p=(a.tipo||"").toLowerCase(),f=a.stockDespues!=null&&a.stockAntes!=null?Number(a.stockDespues)-Number(a.stockAntes):0,v=f>0||p.includes("entrada")||p.includes("compra")||p.includes("ajuste_positivo"),w=Number(a.cantidad)||Math.abs(f)||0,C=v?`<span style="color:#10b981;font-weight:700;">+${w}</span>`:`<span style="color:#ef4444;font-weight:700;">\u2212${w}</span>`,x=r[p]||"#6b7280",j=`<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${x}22;color:${x};font-size:.7rem;font-weight:700;">${t(a.tipo||"\u2014")}</span>`,D=a.productoId?`<button onclick="abrirMovimientoProducto('${t(String(a.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${t(a.productoNombre||a.productoId)}</button>`:`<span style="font-size:.8rem;">${t(a.productoNombre||"\u2014")}</span>`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${t(d)} <span style="color:#9ca3af;font-size:.7rem;">${l}</span></td>
      <td style="padding:6px 10px;">${D}</td>
      <td style="padding:6px 10px;">${j}</td>
      <td style="padding:6px 10px;text-align:center;">${C}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${a.stockDespues!=null?a.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.74rem;color:#9ca3af;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t(a.motivo||"")}">${t(a.motivo||"")}</td>
    </tr>`}).join(""),i=`
    <p style="font-size:.78rem;color:#9ca3af;margin-bottom:10px;">\xDAltimos ${o.length} movimientos de inventario \xB7 Haz clic en el producto para ver su kardex completo</p>
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
        <tbody>${s}</tbody>
      </table>
    </div>`;_mkInvModal("mkMovRecientes","\u{1F4CB} Movimientos Recientes \u2014 Inventario",i,"820px")}window.abrirMovimientosRecientes=abrirMovimientosRecientes;
//# sourceMappingURL=inventory-5.js.map
