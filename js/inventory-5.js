"use strict";function _levenshtein(t,e){const r=t.length,s=e.length,i=Array.from({length:r+1},(n,a)=>Array.from({length:s+1},(d,l)=>l===0?a:0));for(let n=1;n<=s;n++)i[0][n]=n;for(let n=1;n<=r;n++)for(let a=1;a<=s;a++)i[n][a]=t[n-1]===e[a-1]?i[n-1][a-1]:1+Math.min(i[n-1][a],i[n][a-1],i[n-1][a-1]);return i[r][s]}window._levenshtein=_levenshtein;function _fuzzyMatch(t,e,r=2){return t=t.toLowerCase().trim(),e=e.toLowerCase(),!t||e.includes(t)?!0:e.split(/[\s,.-]+/).some(i=>{const n=i.substring(0,t.length+2);return n.length>=t.length-1&&_levenshtein(t,n)<=r})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){if(!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0)return null;let e=1/0;for(const r of t.mpComponentes){const s=(window.products||[]).find(a=>String(a.id)===String(r.id));if(!s)return 0;const i=typeof getStockEfectivo=="function"?getStockEfectivo(s):s.stock||0,n=parseFloat(r.qty)||1;e=Math.min(e,Math.floor(i/n))}return e===1/0?0:e}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",s=>{s.target===t&&(t.style.display="none")}),document.body.appendChild(t));const r=[...new Set((window.products||[]).map(s=>s.category).filter(Boolean))].map(s=>{const i=(window.categories||[]).find(n=>String(n.id)===String(s));return`<option value="${_esc(s)}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:s)}</option>`}).join("");t.innerHTML=`
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
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function abrirBulkStockModal(){let t=document.getElementById("bulkStockModal");t||(t=document.createElement("div"),t.id="bulkStockModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",s=>{s.target===t&&(t.style.display="none")}),document.body.appendChild(t));const r=[...new Set((window.products||[]).filter(s=>s.tipo==="materia_prima").map(s=>s.category).filter(Boolean))].map(s=>{const i=(window.categories||[]).find(n=>String(n.id)===String(s));return`<option value="${_esc(String(s))}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:String(s))}</option>`}).join("");t.innerHTML=`
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
    </div>`,t.style.display="flex",_bulkStockPreview()}window.abrirBulkStockModal=abrirBulkStockModal;function _bulkStockPreview(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),e=document.getElementById("bulkStockCat")?.value||"",r=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!e||String(i.category)===e)),s=document.getElementById("bulkStockPreviewList");if(s){if(t===0){s.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ingresa una cantidad distinta de 0</p>';return}s.innerHTML=`
        <div style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:6px;">${r.length} producto${r.length!==1?"s":""} afectados:</div>
        ${r.slice(0,20).map(i=>{const n=typeof getStockEfectivo=="function"?getStockEfectivo(i):parseInt(i.stock)||0,a=Math.max(0,n+t);return`<div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f3f4f6;font-size:.76rem;">
                <span>${_esc(i.name)}</span>
                <span>${n} \u2192 <b style="color:${t>0?"#16a34a":"#dc2626"}">${a}</b></span>
            </div>`}).join("")}
        ${r.length>20?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:6px;">...y ${r.length-20} m\xE1s</p>`:""}`}}window._bulkStockPreview=_bulkStockPreview;async function _bulkStockAplicar(){const t=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),e=document.getElementById("bulkStockCat")?.value||"";if(t===0){manekiToastExport("Ingresa una cantidad distinta de 0","warn");return}const r=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!e||String(i.category)===e));if(r.length===0){manekiToastExport("Sin productos para ajustar","warn");return}const s=typeof getStockEfectivo=="function"?getStockEfectivo:i=>parseInt(i.stock)||0;r.forEach(i=>{const n=s(i);i.stock=Math.max(0,n+t),typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:i.id,productoNombre:i.name,tipo:t>0?"entrada":"merma",cantidad:Math.abs(t),motivo:`Ajuste masivo ${t>0?"+":""}${t}`,stockAntes:n,stockDespues:i.stock})}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkStockModal").style.display="none",manekiToastExport(`\u2705 Stock ajustado en ${r.length} producto(s)`,"ok")}window._bulkStockAplicar=_bulkStockAplicar;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,e=document.getElementById("bulkPrecioSoloPT")?.checked||!1,r=document.getElementById("bulkPrecioSoloMP")?.checked||!1,s=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(i=>s&&String(i.category)!==s?!1:e&&r?!0:!(e&&!(!i.tipo||i.tipo==="producto"||i.tipo==="producto_interno"||i.tipo==="pack")||r&&i.tipo!=="materia_prima")).map(i=>{const n=r&&!e?"cost":"price",a=parseFloat(i[n])||0,d=Math.max(0,Math.round(a*(1+t/100)*100)/100);return{p:i,campoKey:n,precioActual:a,precioNuevo:d}}).filter(i=>i.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const e=_bulkPrecioGetAfectados();if(!e.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=e.slice(0,50).map(({p:r,campoKey:s,precioActual:i,precioNuevo:n})=>{const a=n-i,d=a>0?"#16a34a":a<0?"#dc2626":"#6b7280",l=s==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(r.name)}">${_esc(r.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${l}: $${i.toFixed(2)}</span>
            <span style="font-weight:700;color:${d};white-space:nowrap;">\u2192 $${n.toFixed(2)}</span>
        </div>`}).join("")+(e.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${e.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const e=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,r=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",s=e>0?"+":"",i=t.slice(0,5).map(({p:n,precioActual:a,precioNuevo:d})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(n.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${a.toFixed(2)}</span>
            <span style="font-weight:700;color:${d>a?"#16a34a":"#dc2626"};">\u2192 $${d.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${s}${e}%</strong> al ${r} de <strong>${t.length}</strong> producto(s):</p>
                ${i}
             </div>`,"\u2705 Confirmar cambio masivo").then(n=>{n&&(t.forEach(({p:a,campoKey:d,precioNuevo:l})=>{a[d]=l,a.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${s}${e}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:n,campoKey:a,precioNuevo:d})=>{n[a]=d,n.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const e=window.products||[],r=document.getElementById("inventoryTipoFilter")?.value||"",s=e.length+"_"+e.reduce((o,x)=>o+Number(x.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+r,i=document.getElementById("invDualContainer");if(i&&i._lastHash===s)return;i&&(i._lastHash=s);let n=document.getElementById("invDualContainer");if(!n){const o=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;n=document.createElement("div"),n.id="invDualContainer",n.style.cssText="display:flex;flex-direction:column;gap:0;",o.parentNode.insertBefore(n,o),o.style.display="none"}const a=window.products||[],d=new Map(a.map(o=>[String(o.id),typeof getStockEfectivo=="function"?getStockEfectivo(o):parseInt(o.stock)||0]));if(window._invStockCache=d,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const o=document.createElement("style");o.id="invExtraColStyles",o.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(o)}let l=document.getElementById("invExtraColToggle");if(l||(l=document.createElement("button"),l.id="invExtraColToggle",l.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",l.textContent="Mostrar SKU/Proveedor",l.addEventListener("click",()=>{const o=document.getElementById("invDualContainer");if(!o)return;const x=o.classList.toggle("inv-show-extra");l.textContent=x?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),n.parentNode.insertBefore(l,n)),a.length===0){n.innerHTML=`
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
        </div>`;return}const g=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",c=(document.getElementById("inventoryTagFilter")||{}).value||"",w=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function y(o){const x=window._normSearch||(v=>String(v||"").toLowerCase()),u=x(g),k=x(w),$=v=>!c||v.tags&&v.tags.includes(c),E=v=>!w||x(v.proveedor||"").includes(k);if(!g)return o.filter(v=>$(v)&&E(v));const S=o.filter(v=>(x(v.name).includes(u)||x(v.sku||"").includes(u)||x(v.proveedor||"").includes(u)||x(v.notas||"").includes(u)||(v.tags||[]).some(W=>x(W).includes(u)))&&$(v)&&E(v));return S.length>0?S:o.filter(v=>(_fuzzyMatch(u,v.name||"")||_fuzzyMatch(u,v.sku||"")||_fuzzyMatch(u,v.proveedor||""))&&$(v)&&E(v))}const T=y(a.filter(o=>o.tipo==="materia_prima")),b=y(a.filter(o=>o.tipo==="servicio")),B=y(a.filter(o=>o.tipo==="producto_variable")),D=y(a.filter(o=>!o.tipo||o.tipo==="producto"||o.tipo==="producto_interno"||o.tipo==="pack")),G=new Set([...D,...B].map(o=>String(o.id))),_=window.productMap||new Map(a.map(o=>[String(o.id),o])),z=new Map;for(const o of a)o.mpComponentes&&o.mpComponentes.length>0&&G.has(String(o.id))&&z.set(String(o.id),calcularDisponibilidadDesdeMP(o,_,d));function L(o){if(!window._invSortCol)return o;const x=window._invSortCol,u=window._invSortDir;return[...o].sort((k,$)=>{let E,S;return x==="name"?(E=(k.name||"").toLowerCase(),S=($.name||"").toLowerCase()):x==="sku"?(E=(k.sku||"").toLowerCase(),S=($.sku||"").toLowerCase()):x==="category"?(E=(k.category||"").toLowerCase(),S=($.category||"").toLowerCase()):x==="price"?(E=Number(k.price)||0,S=Number($.price)||0):x==="stock"?(E=Number(k.stock)||0,S=Number($.stock)||0):x==="margin"&&(E=k.cost&&k.price?(k.price-k.cost)/k.price:-1,S=$.cost&&$.price?($.price-$.cost)/$.price:-1),E<S?u==="asc"?-1:1:E>S?u==="asc"?1:-1:0})}function f(o,x){const u=String(o.id),k=d.get(u)??(typeof getStockEfectivo=="function"?getStockEfectivo(o):parseInt(o.stock)||0),$=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${o.image||"\u{1F3ED}"}</span>`;let E;k===0?E='<span class="badge-danger"><i class="fas fa-circle-xmark"></i> Agotado</span>':k<=(o.stockMin||5)?E='<span class="badge-warning"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':E='<span class="badge-success"><i class="fas fa-circle-check"></i> Disponible</span>';const S=(window.categories||[]).find(F=>F.id===o.category),v=S?S.name:o.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    ${o.historialCostos&&o.historialCostos.length?`<span title="Este producto ha tenido ${o.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#9669c4;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${o.historialCostos.length} cambio${o.historialCostos.length>1?"s":""}</span>`:""}
                    ${o.compraPaquete?`<div style="font-size:10px;color:#9669c4;margin-top:2px;">\u{1F4E6} Paquete: ${o.compraPaquete.cantidad} uds \xB7 $${Number(o.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(F=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#9669c4;border:1px solid #e9d5ff;">${_esc(F)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(v)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#9669c4;font-weight:600;">$${Number(o.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(o.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${u}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span data-dblclick="editarStockInline" data-arg="${u}" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${k} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(o.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${E}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;align-items:center;">
                    <button type="button" data-action="editProduct" data-arg="${u}" title="Editar" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;"><i class="fas fa-pen"></i></button>
                    <button type="button" data-action="ajustarStock" data-arg="${u}" title="Ajustar stock" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">\u{1F4E6}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" data-action="_invMpMenu" data-arg="${u}" data-pass-el="before" title="M\xE1s acciones" style="width:30px;height:30px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;font-weight:700;color:#6b7280;"><i class="fas fa-ellipsis"></i></button>
                    </div>
                </div>
            </td>
        </tr>`}function h(o,x){const u=String(o.id),k=`<span style="font-size:1.6rem;">${o.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map($=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f6ecff;color:#7d4fa3;border:1px solid #dfbfff;">${_esc($)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#7d4fa3;">$${Number(o.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#f6ecff;color:#7d4fa3;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button data-action="openServicioModal" data-arg="${u}" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>
                    <button data-action="deleteProduct" data-arg="${u}" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function P(o,x){const u=String(o.id),k=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${o.image||"\u{1F4E6}"}</span>`,$=(window.categories||[]).find(m=>m.id===o.category),E=$?$.name:o.category||"",S=z.get(u)??null;let v,F;if(S!==null){const m=S.piezas,I=m===0?"#ef4444":m<=3?"#f59e0b":"#10b981",j=m===0?"#fee2e2":m<=3?"#fef3c7":"#d1fae5",M=S.detalle.map(R=>`${R.nombre}: ${R.stock}\xF7${R.qty}=${R.posibles}pzs`).join(" | ");v=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(M)}"
                        style="padding:3px 12px;border-radius:8px;background:${j};color:${I};
                               font-weight:700;font-size:.95rem;border:1px solid ${I}33;cursor:help;">
                        ${m}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,F=m===0?'<span class="badge-danger">Sin stock MP</span>':m<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const m=d.get(String(o.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(o):o.stock||0),I=o.stockMin||5,j=m===0?"#ef4444":m<=I?"#f59e0b":"#10b981";v=`<span style="padding:3px 12px;border-radius:8px;background:${m===0?"#fee2e2":m<=I?"#fef3c7":"#d1fae5"};color:${j};font-weight:700;font-size:.95rem;">${m}</span>`,F=m===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-xmark"></i> Agotado</span>':m<=I?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-check"></i> Disponible</span>'}const W=`_invVar_${u}_open`,H=window[W]===!0,Y=o.variants&&o.variants.length>0?`<div>
                <button data-action="_mkInvToggleVarCollapse" data-arg="${u}" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${H?"\u25B2":"\u25B6"} ${o.variants.length} variante${o.variants.length!==1?"s":""}
                </button>
                ${H?'<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">'+o.variants.map(m=>`
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(m.type)}:</span>
                        ${_mkColorDot(m.type,_esc(m.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(m.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${m.qty??0}</span>
                    </div>`).join("")+"</div>":""}
               </div>`:'<span class="text-xs text-gray-400">Sin variantes</span>',Z=Number(o.cost)||0,q=Number(o.price)||0,X=Z&&q?(()=>{const m=(q-Z)/q*100,I=m>=40?"#10b981":m>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${I};">${m.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,m).toFixed(0)}%;background:${I};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    ${o._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${o.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${o.tipo==="pack"&&o.packComponentes&&o.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${o.packComponentes.map(m=>`${m.qty>1?m.qty+"\xD7 ":""}${_esc(m.nombre)}`).join(" + ")}</div>`:""}
                    ${o.historialPrecios&&o.historialPrecios.length?`<span title="Este producto ha tenido ${o.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${o.historialPrecios.length} cambio${o.historialPrecios.length>1?"s":""}</span>`:""}
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(o.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(o.proveedorNombre)}</b>${o.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(m=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(m)}</span>`).join("")}</div>`:""}
                    ${(()=>{const m=calcularProducibles(o);if(m===null)return"";const I=m>=5?"#16a34a":m>=1?"#d97706":"#dc2626",j=m>=5?"#d1fae5":m>=1?"#fef3c7":"#fee2e2",M=m===0?"Sin stock MP":`Producibles: ${m}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${j};color:${I};border:1px solid ${I}33;">\u{1F3ED} ${M}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(E)}</td>
            <td class="px-4 py-3">${Y}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" data-dblclick="invInlineEditPrice" data-arg="${u}" data-pass-el="true" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(o.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" data-dblclick="invInlineEditStock" data-arg="${u}" data-pass-el="true" style="cursor:pointer;" title="Doble-click para editar stock">${v}</td>
            <td class="px-4 py-3">${F}</td>
            <td class="px-4 py-3">${X}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${o.tipo==="pack"?`<button type="button" data-action="openPackModal" data-arg="${u}" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>`:`<button type="button" data-action="editProduct" data-arg="${u}" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>`}
                    <button type="button" data-action="duplicarProducto" data-arg="${u}" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>
                    ${o.tipo!=="pack"?`<button type="button" data-action="cambiarTipoProducto" data-arg="${u}" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${o.movimientos&&o.movimientos.length?`<button type="button" data-action="verMovimientosProducto" data-arg="${u}" title="Ver movimientos de stock (${o.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>`:""}
                    <button type="button" data-action="abrirMovimientoProducto" data-arg="${u}" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-chart-line"></i></button>
                    <button type="button" data-action="archivarProducto" data-arg="${u}" title="${o.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${o.activo===!1?'<i class="fas fa-lock-open"></i>':'<i class="fas fa-box-archive"></i>'}</button>
                    <button type="button" data-action="deleteProduct" data-arg="${u}" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function U(o,x){const u=String(o.id),k=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#f9fafb;" loading="lazy">`:`<span style="font-size:1.6rem;">${o.image||"\u{1F3AF}"}</span>`,$=(o.tablaPreciosVariable||[]).slice().sort((C,Q)=>C.cantidadMin-Q.cantidadMin),E=$.length?$.map(C=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${C.cantidadMin} pzas = $${Number(C.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',S=(o.mpComponentes||[]).length,v=(window.categories||[]).find(C=>String(C.id)===String(o.category)),F=v?`${v.emoji||""} ${v.name}`:"\u2014",W=$,H=W.length?W[0].precio/(W[0].cantidadMin||1):0,rt=H>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${H.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',Y=z.get(String(o.id))??null;let Z,q;if(Y!==null){const C=Y.piezas,Q=C===0?"#ef4444":C<=3?"#f59e0b":"#10b981",lt=C===0?"#fee2e2":C<=3?"#fef3c7":"#d1fae5",st=Y.detalle.map(et=>`${et.nombre}: ${et.stock}\xF7${et.qty}=${et.posibles}pzs`).join(" | ");Z=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(st)}" style="padding:3px 12px;border-radius:8px;background:${lt};color:${Q};font-weight:700;font-size:.95rem;border:1px solid ${Q}33;cursor:help;">${C}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,q=C===0?'<span class="badge-danger">Sin stock MP</span>':C<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else Z='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',q='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const X=(o.mpComponentes||[]).reduce((C,Q)=>C+(parseFloat(Q.costUnit)||0)*(parseFloat(Q.qty)||1),0),m=o.rendimientoPorHoja||1,I=m>0?X/m:X,j=H>0?Math.round((H-I)/H*100):0,M=j>=40?"#10b981":j>=20?"#f59e0b":"#ef4444",R=H>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${M};">${j}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,j)}%;background:${M};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                data-change="invBulkToggle" data-pass-el="before">
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(o.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${o.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${o.rendimientoPorHoja} uds/hoja \xB7 ${S} MP${S!==1?"s":""}</div>`:S>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${S} MP${S!==1?"s":""}</div>`:""}
                    ${o.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(o.notas)}">${_esc(o.notas)}</div>`:""}
                    ${o.tags&&o.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${o.tags.map(C=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(C)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(o.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(F)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${E}</div></td>
            <td class="px-4 py-3 text-right">${rt}</td>
            <td class="px-4 py-3">${Z}</td>
            <td class="px-4 py-3">${q}</td>
            <td class="px-4 py-3">${R}</td>
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
        </tr>`}function K({id:o,title:x,titleColor:u,titleBg:k,btnLabel:$,btnOnclick:E,btnColor:S,extraBtnHTML:v,products:F,renderFila:W,headers:H,emptyMsg:rt}){const Y=document.getElementById("inventoryTipoFilter")?.value||"";if(Y==="materia"&&o!=="mp"||Y==="producto"&&o==="mp")return"";const Z=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(F.length===0&&Z)return"";const q=L(F),X=`_invPage_${o}`,m=window._invPageSize||10;window[X]=window[X]||1;const I=q.length,j=Math.max(1,Math.ceil(I/m));window[X]>j&&(window[X]=1);const M=window[X],R=(M-1)*m,C=q.slice(R,R+m),Q=C.length===0?`<tr><td colspan="${H.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${rt}</td></tr>`:C.map((V,nt)=>W(V,nt)).join(""),lt=H.map(V=>{const nt=V.colId==="sku"?" inv-col-hidden-sku":V.colId==="proveedor"?" inv-col-hidden-prov":"",it=V.align==="right"?" text-right":" text-left";return V.sortKey?`<th class="px-4 py-3${it} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${nt}" data-action="sortInventory" data-arg="${V.sortKey}" style="white-space:nowrap;">${V.label} \u2195</th>`:`<th class="px-4 py-3${it} text-xs font-semibold text-gray-500 uppercase tracking-wide${nt}" style="white-space:nowrap;">${V.label}</th>`}).join("");let st="";if(j>1||I>m){const V=Math.min(R+m,I);st=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${R+1}\u2013${V}</b> de <b>${I}</b></span>
                <div style="display:flex;gap:4px;">
                    <button data-action="invSectionPage" data-arg="${o}" data-arg2="${M-1}" ${M<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${M<=1?"default":"pointer"};opacity:${M<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,j)},(nt,it)=>{let N=M<=3?it+1:M+it-2;return N<1&&(N=null),N>j&&(N=null),N===null?"":`<button data-action="invSectionPage" data-arg="${o}" data-arg2="${N}" style="min-width:30px;padding:4px 8px;border:1px solid ${N===M?"#FFD166":"#e5e7eb"};border-radius:7px;background:${N===M?"#FFD166":"#fff"};color:${N===M?"#fff":"#374151"};font-weight:${N===M?700:400};font-size:13px;cursor:${N===M?"default":"pointer"};" ${N===M?"disabled":""}>${N}</button>`}).join("")}
                    <button data-action="invSectionPage" data-arg="${o}" data-arg2="${M+1}" ${M>=j?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${M>=j?"default":"pointer"};opacity:${M>=j?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}const et=`_invSec_${o}_collapsed`,ct=window[et]===!0;return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${u}33;box-shadow:0 2px 12px ${u}11;">
            <!-- Header de secci\xF3n (clicable para colapsar) -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${k};border-bottom:${ct?"none":"1.5px solid "+u+"33"};cursor:pointer;" data-action="_mkInvToggleCollapse" data-arg="${o}">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${u};transition:transform .2s;">${ct?"\u25B6":"\u25BC"}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${u};">${x}</span>
                    <span style="background:${u};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${I}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;" onclick="event.stopPropagation()">
                    ${v||""}
                    <button data-action="_mkInvAddBtnAction" data-arg="${o}" class="mk-btn-primary"
                        style="padding:7px 16px;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${$}
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
                    <tbody>${Q}</tbody>
                </table>
            </div>
            ${st}`}
        </div>`}const O=a.filter(o=>!o.deletedAt),A=O.length,tt=O.reduce((o,x)=>{const u=d.get(String(x.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(x):parseInt(x.stock)||0);return o+(Number(x.cost)||0)*Math.max(0,u)},0),J=O.filter(o=>(d.get(String(o.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(o):parseInt(o.stock)||0))<=(o.stockMin||5)).length,at=O.filter(o=>(!o.tipo||o.tipo==="producto"||o.tipo==="producto_interno"||o.tipo==="pack")&&Number(o.price)>0),dt=at.length?at.reduce((o,x)=>{const u=Number(x.price)||0,k=Number(x.cost)||0;return o+(u>0?(u-k)/u*100:0)},0)/at.length:0;let ot=document.getElementById("invKpiBar");ot||(ot=document.createElement("div"),ot.id="invKpiBar",n.parentNode.insertBefore(ot,n)),ot.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${A}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#9669c4;">$${tt.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${J>0?"#ef4444":"#10b981"};">${J}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${dt>=40?"#10b981":dt>=20?"#f59e0b":"#ef4444"};">${dt.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const pt=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#FFD166",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",extraBtnHTML:'<button type="button" data-action="_mkInvCreatePack" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" data-action="abrirBulkPrecioModal" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:D,renderFila:P,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",products:B,renderFila:U,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#9669c4",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",extraBtnHTML:'<button type="button" data-action="abrirBulkStockModal" class="mk-toolbar-btn">\u{1F4E6} Ajustar stock masivo</button>',products:T,renderFila:f,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#7d4fa3",titleBg:"linear-gradient(135deg,#f5f3ff,#f6ecff)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",products:b,renderFila:h,headers:[{label:'<input type="checkbox" class="inv-bulk-all" data-change="invBulkToggleAll" data-pass-el="before" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],ut=(g||c||w).length>0;let ft=!1;for(const o of pt){const x=K(o);x&&(ft=!0);let u=document.getElementById(`invSec_${o.id}`);u||(u=document.createElement("div"),u.id=`invSec_${o.id}`,n.appendChild(u));const k=o.products.length+"_"+o.products.reduce(($,E)=>$+String(E.id),"")+"_"+(window[`_invPage_${o.id}`]||1)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r;u._hash!==k&&(u.innerHTML=x,u._hash=k)}const gt=new Set(pt.map(o=>`invSec_${o.id}`));for(let o=n.children.length-1;o>=0;o--){const x=n.children[o];x.id&&x.id.startsWith("invSec_")&&!gt.has(x.id)&&x.remove()}ut&&!ft&&(n.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(t,e){const r=`_invPage_${t}`,s=window.products||[],i=t==="mp"?s.filter(c=>c.tipo==="materia_prima"):t==="svc"?s.filter(c=>c.tipo==="servicio"):t==="pv"?s.filter(c=>c.tipo==="producto_variable"):s.filter(c=>!c.tipo||c.tipo==="producto"||c.tipo==="producto_interno"||c.tipo==="pack"),n=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",a=(document.getElementById("inventoryTagFilter")||{}).value||"",d=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",l=i.filter(c=>{const w=!n||c.name.toLowerCase().includes(n)||(c.sku||"").toLowerCase().includes(n)||(c.proveedor||"").toLowerCase().includes(n)||(c.notas||"").toLowerCase().includes(n)||(c.tags||[]).some(b=>b.toLowerCase().includes(n)),y=!a||c.tags&&c.tags.includes(a),T=!d||(c.proveedor||"").toLowerCase().includes(d);return w&&y&&T}),g=Math.max(1,Math.ceil(l.length/(window._invPageSize||10)));window[r]=Math.max(1,Math.min(e,g)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,e,r,s,i){let n=document.getElementById("inventoryPaginationBar");if(!n){const g=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!g)return;n=document.createElement("div"),n.id="inventoryPaginationBar",g.insertAdjacentElement("afterend",n)}if(e<=1&&r<=i){n.innerHTML="";return}const a=Math.min(s+i,r),d=`Mostrando <b>${s+1}\u2013${a}</b> de <b>${r}</b> productos`;function l(){const g=[],c=(w,y)=>{for(let T=w;T<=y;T++)g.push(T)};return e<=7?c(1,e):(g.push(1),t>4&&g.push("..."),c(Math.max(2,t-2),Math.min(e-1,t+2)),t<e-3&&g.push("..."),g.push(e)),g.map(w=>{if(w==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const y=w===t;return`<button data-action="invGoToPage" data-arg="${w}"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${y?"#FFD166":"#e5e7eb"};
                       background:${y?"#FFD166":"white"};color:${y?"white":"#374151"};
                       font-weight:${y?"700":"500"};font-size:13px;cursor:${y?"default":"pointer"};
                       transition:all 0.15s;"
                ${y?"disabled":""}>${w}</button>`}).join("")}n.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${d}</span>
                <select data-change="invChangePageSize" data-pass-el="1"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(g=>`<option value="${g}" ${g===i?"selected":""}>${g} por p\xE1gina</option>`).join("")}
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
        </div>`}function invGoToPage(t){const e=typeof t=="string"?parseInt(t):t,r=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(e||1,r)),renderInventoryTable();const s=document.getElementById("inventoryTable");s&&s.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){const e=typeof t=="object"&&t?t.value:t;window._invPageSize=parseInt(e)||10,window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;function _invMpMenu(t,e){const r=(window.products||[]).find(g=>String(g.id)===String(e));if(!r)return;const s=!!r.proveedorUrl,i=r.activo===!1?"desarchivar":"archivar",n=document.getElementById("_invMpMenuDrop");if(n&&(n.remove(),n.dataset.pid===e))return;const a=document.createElement("div");a.id="_invMpMenuDrop",a.dataset.pid=e,a.style.cssText="position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:172px;overflow:hidden;font-size:.78rem;";const d=(g,c)=>`style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:${g};text-align:left;" onmouseover="this.style.background='${c}'" onmouseout="this.style.background='none'"`;a.innerHTML=`
        <button data-action="registrarMerma" data-arg="${e}" data-close-menu-drop="true" ${d("#d97706","#fffbeb")}>\u{1F4C9} Registrar merma</button>
        <button data-action="duplicarProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#9669c4","#f5f3ff")}>\u{1F4CB} Duplicar</button>
        <button data-action="cambiarTipoProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#b45309","#fef9c3")}>\u2192\u{1F4E6} Convertir a PT</button>
        <button data-action="abrirMovimientoProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#4338ca","#eef2ff")}>\u{1F4C8} Ver gr\xE1fica</button>
        ${s?`<button data-action="_mkInvOpenProveedor" data-arg="${e}" data-close-menu-drop="true" ${d("#16a34a","#f0fdf4")}>\u{1F517} Abrir proveedor</button>`:""}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button data-action="archivarProducto" data-arg="${e}" data-close-menu-drop="true" ${d("#6b7280","#f9fafb")}>\u{1F4C1} ${i==="desarchivar"?"Desarchivar":"Archivar"}</button>
        <button data-action="deleteProduct" data-arg="${e}" data-close-menu-drop="true" ${d("#dc2626","#fef2f2")}>\u{1F5D1}\uFE0F Eliminar</button>
    `,document.body.appendChild(a);const l=t.getBoundingClientRect();a.style.top=l.bottom+window.scrollY+4+"px",a.style.left=Math.min(l.left+window.scrollX,window.innerWidth-180)+"px",setTimeout(()=>document.addEventListener("click",function g(c){a.contains(c.target)||(a.remove(),document.removeEventListener("click",g))}),0)}window._invMpMenu=_invMpMenu;function _mkInvToggleVarCollapse(t){const e=`_invVar_${t}_open`;window[e]=!window[e],renderInventoryTable()}window._mkInvToggleVarCollapse=_mkInvToggleVarCollapse;function _mkInvOpenProveedor(t){const e=(window.products||[]).find(r=>String(r.id)===String(t));e?.proveedorUrl&&window.open(e.proveedorUrl,"_blank")}window._mkInvOpenProveedor=_mkInvOpenProveedor;function _mkInvToggleCollapse(t){const e=`_invSec_${t}_collapsed`;window[e]=!window[e],renderInventoryTable()}window._mkInvToggleCollapse=_mkInvToggleCollapse;function _mkInvAddBtnAction(t){t==="pt"?typeof window.openAddProductModal=="function"&&window.openAddProductModal():t==="pv"?(typeof window.injectVariableProductModal=="function"&&window.injectVariableProductModal(),typeof window.openVariableProductModal=="function"&&window.openVariableProductModal()):t==="mp"?(typeof window.injectMpModal=="function"&&window.injectMpModal(),typeof window.openAddMateriaPrimaModal=="function"&&window.openAddMateriaPrimaModal()):t==="svc"&&(typeof window.injectSvcModal=="function"&&window.injectSvcModal(),typeof window.openServicioModal=="function"&&window.openServicioModal())}window._mkInvAddBtnAction=_mkInvAddBtnAction;function _mkInvCreatePack(){typeof window.injectPackModal=="function"&&window.injectPackModal(),typeof window.openPackModal=="function"&&window.openPackModal()}window._mkInvCreatePack=_mkInvCreatePack;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const e=document.getElementById("movimientosLista");if(!e)return;const r=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("movTipoFilter")||{}).value||"";let i=window.stockMovements||[];r&&(i=i.filter(b=>b.productoNombre?.toLowerCase().includes(r)||(b.motivo||"").toLowerCase().includes(r))),s&&(i=i.filter(b=>(b.tipo||"")===s));const n=_fechaHoy(),a=(window.stockMovements||[]).filter(b=>{try{const B=new Date(b.fecha);return B.getFullYear()+"-"+("0"+(B.getMonth()+1)).slice(-2)+"-"+("0"+B.getDate()).slice(-2)===n}catch{return!1}}),d={};a.forEach(b=>{d[b.tipo]=(d[b.tipo]||0)+1});const l={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},g={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let c=document.getElementById("movResumenHoy");c||(c=document.createElement("div"),c.id="movResumenHoy",e.parentNode.insertBefore(c,e));const w=Object.keys(d).map(b=>`${l[b]||"\u26AA"} ${g[b]||b}: <strong>${d[b]}</strong>`);c.innerHTML=w.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${w.join("&nbsp;&nbsp;")}
           </div>`:"";let y=document.getElementById("movExportCSVBtn");if(y||(y=document.createElement("button"),y.id="movExportCSVBtn",y.textContent="\u{1F4E5} Exportar historial CSV",y.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",y.onclick=function(){const b=window.stockMovements||[];let D=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;b.forEach(L=>{const f=[new Date(L.fecha).toLocaleString("es-MX"),L.productoNombre||"",L.tipo||"",L.cantidad,L.motivo||"",L.stockAntes??"",L.stockDespues??""];D+=f.map(h=>`"${String(h).replace(/"/g,'""')}"`).join(",")+`
`});const G=new Blob([D],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(G),z=document.createElement("a");z.href=_,z.download=`movimientos-${n}.csv`,z.click(),URL.revokeObjectURL(_)},e.parentNode.insertBefore(y,e)),!i.length){e.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const T={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};e.innerHTML=i.slice(0,200).map(b=>{const B=new Date(b.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),D=b.cantidad>=0?`+${b.cantidad}`:`${b.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${T[b.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(b.productoNombre||(b.productoId&&!(window.products||[]).find(G=>String(G.id)===String(b.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${B} \xB7 ${b.tipo} \xB7 ${_esc(b.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${b.cantidad>=0?"#10b981":"#ef4444"};">${D} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${b.stockAntes} \u2192 ${b.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){showConfirm("Se borrar\xE1 permanentemente todo el historial de movimientos de inventario.","\xBFBorrar historial?").then(t=>{t&&(window.stockMovements=[],window.stockMovimientos=[],saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").delete().neq("id","00000000-0000-0000-0000-000000000000").then(({error:e})=>{e&&console.warn("[Inv] Error limpiando stock_movements relacional:",e.message)}),renderMovimientos())})}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const e=document.getElementById(t);if(!e)return;if(!window.stockMovements||!window.stockMovements.length){e.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const r={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};e.innerHTML=window.stockMovements.slice(0,100).map(s=>{const i=new Date(s.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),n=s.cantidad>=0?`+${s.cantidad}`:`${s.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${r[s.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(s.productoNombre||(s.productoId&&!(window.products||[]).find(a=>String(a.id)===String(s.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${i} \xB7 ${s.tipo} \xB7 ${_esc(s.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${s.cantidad>=0?"#10b981":"#ef4444"};">${n} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${s.stockAntes} \u2192 ${s.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const e=(window.products||[]).find(s=>String(s.id)===String(t));if(!e){manekiToastExport("Producto no encontrado","err");return}const r=JSON.parse(JSON.stringify(e));r.id=_genId(),r.name="Copia de "+e.name,r.sku=(e.sku||"")+"-C",r.stock=0,r.historialPrecios=[],r.historialCostos=[],window.products.unshift(r),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${r.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(a=>!a.tipo||a.tipo==="producto"||a.tipo==="producto_interno"),e=t.map(a=>{const d=a.price>0&&a.cost>0?(a.price-a.cost)/a.price*100:null;return{...a,_margen:d}}).sort((a,d)=>(d._margen??-1/0)-(a._margen??-1/0)),r=e.map((a,d)=>{const l=a._margen!==null?a._margen.toFixed(1)+"%":"\u2014",g=a.price>0&&a.cost>0?"$"+(a.price-a.cost).toFixed(2):"\u2014",c=a._margen===null?"#9ca3af":a._margen>=50?"#16a34a":a._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${d===0?"\u{1F947}":d===1?"\u{1F948}":d===2?"\u{1F949}":`${d+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(a.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(a.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(a.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${g}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${c};font-size:14px;">${l}</td>
        </tr>`}).join(""),s=e.filter(a=>a._margen!==null).reduce((a,d,l,g)=>a+d._margen/g.length,0),i=e[0];let n=document.getElementById("_mkRentabilidadModal");n||(n=document.createElement("div"),n.id="_mkRentabilidadModal",n.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",n.addEventListener("click",a=>{a.target===n&&(n.style.display="none")}),document.body.appendChild(n)),n.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${e.some(a=>a._margen!==null)?s.toFixed(1)+"%":"\u2014"}</div>
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
        </div>`,n.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(r=>{r.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let e=document.getElementById("invBulkBar");if(e||(e=document.createElement("div"),e.id="invBulkBar",e.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(e)),t.length===0){e.style.display="none";return}e.style.display="flex",e.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#9669c4;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const e=(window.pedidos||[]).filter(i=>!["cancelado","finalizado"].includes(i.status||"")&&(i.productosInventario||[]).some(n=>t.includes(String(n.id))));if(e.length>0){const i=e.map(a=>a.folio||a.id).slice(0,5).join(", ");if(!(typeof showConfirm=="function"?await showConfirm(`\u26A0\uFE0F ${e.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`,"Productos en pedidos activos"):confirm(`\u26A0\uFE0F ${e.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`)))return}if(!(typeof showConfirm=="function"?await showConfirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`,"\u{1F5D1} Confirmar eliminaci\xF3n"):confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`)))return;const s=[...t];if(window.products=(window.products||[]).filter(i=>!s.includes(String(i.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",s)}catch(i){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",i)}manekiToastExport(`\u{1F5D1} ${s.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),e=(window.products||[]).filter(l=>t.includes(String(l.id))),r="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",s=e.map(l=>[l.tipo||"pt",l.name,l.sku||"",l.cost||0,l.price||0,l.stock||0,l.stockMin||5,l.proveedor||"",l.notas||""].map(g=>`"${String(g).replace(/"/g,'""')}"`).join(",")),i="\uFEFF"+r+`
`+s.join(`
`),n=new Blob([i],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(n),d=document.createElement("a");d.href=a,d.download="inventario_seleccion.csv",d.click(),URL.revokeObjectURL(a),manekiToastExport(`\u{1F4E5} ${e.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const e=await new Promise(s=>{const i=document.getElementById("mkBatchCatModal");i&&i.remove();const a=(window.categories||[]).map(l=>`<option value="${l.id}">${l.emoji||""} ${l.name}</option>`).join(""),d=document.createElement("div");d.id="mkBatchCatModal",d.className="mk-modal-overlay",d.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C1} Cambiar categor\xEDa en lote</h3>
          <p style="font-size:.8rem;color:#6b7280;margin-bottom:10px;">${t.length} producto(s) seleccionado(s)</p>
          <select id="mkBatchCatSel" class="mk-input w-full mb-4">
              <option value="">Seleccionar categor\xEDa...</option>
              ${a}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkBatchCatModal').remove();window._mkBCR(null)">Cancelar</button>
              <button type="button" class="mk-btn-primary" onclick="window._mkBCR((document.getElementById('mkBatchCatSel') as HTMLSelectElement).value||null)">Aplicar</button>
          </div>
      </div>`,window._mkBCR=l=>{d.remove(),s(l)},document.body.appendChild(d),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!e)return;const r=(window.categories||[]).find(s=>String(s.id)===String(e));if(!r){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(s=>{t.includes(String(s.id))&&(s.category=r.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};window._mkInvSetTipo=function(t){const e=document.getElementById("inventoryTipoFilter");e&&(e.value=t,e.dispatchEvent(new Event("change")))},window._mkInvClearOne=function(t){const e=document.getElementById(t);e&&(e.value="",e.dispatchEvent(new Event(t==="inventorySearch"?"input":"change")))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(e=>{const r=document.getElementById(e);r&&(r.value="")});const t=document.getElementById("inventorySearch");t?(t.value="",t.dispatchEvent(new Event("input"))):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),e=document.getElementById("mkInvTipoSeg");!t||!e||e.querySelectorAll("button").forEach(r=>r.classList.toggle("active",r.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),e=t?.parentElement;if(!(!t||!e)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const r=document.createElement("div");r.id="mkInvTipoSeg",r.className="mk-segmented",r.setAttribute("role","group"),r.setAttribute("aria-label","Tipo de producto"),r.innerHTML=[...t.options].map(s=>{const i=_MK_TIPO_LABELS[s.value]??(s.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${s.value}" onclick="_mkInvSetTipo('${s.value}')">${i}</button>`}).join(""),t.parentElement.insertBefore(r,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const r=document.createElement("span");r.id="mkInvDensity",r.style.marginLeft="auto",r.innerHTML=window.mkRenderDensityToggle(),e.appendChild(r),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const r=document.createElement("div");r.id="mkInvFilterInfo",r.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",e.parentElement.insertBefore(r,e.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const r=document.createElement("div");r.id="mkInvHerramientas",r.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",r.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock m\xEDnimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gr\xE1fica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
      <button type="button" onclick="abrirMovimientosRecientes()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Ver \xFAltimos movimientos de inventario"><i class="fas fa-history" style="margin-right:5px;"></i>Movimientos recientes</button>
    `;const s=document.getElementById("mkInvFilterInfo");s?s.parentElement.insertBefore(r,s):e.parentElement.insertBefore(r,e.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const e=document.getElementById("invDualContainer"),r=e?e.querySelectorAll(".inv-bulk-cb").length:0,s=(window.products||[]).length,i=document.getElementById("inventorySearch"),n=document.getElementById("inventoryTagFilter"),a=document.getElementById("inventoryProveedorFilter"),d=document.getElementById("inventoryTipoFilter"),l=[];i&&i.value.trim()&&l.push(`<span class="mk-filter-chip">Buscar: ${_esc(i.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),d&&d.value&&l.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[d.value]||d.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),n&&n.value&&l.push(`<span class="mk-filter-chip">Tag: ${_esc(n.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),a&&a.value&&l.push(`<span class="mk-filter-chip">Proveedor: ${_esc(a.options[a.selectedIndex]?.text||a.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let g=`<span class="mk-result-count">Mostrando <b>${r}</b> de ${s} producto${s!==1?"s":""}</span>`;l.length&&(g+=`<div class="mk-filter-chips">${l.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=g,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const e=new Set([...t.querySelectorAll(".inv-bulk-cb")].map(d=>String(d.dataset.id))),r=window._invStockCache;let s=0,i=0,n=0;(window.products||[]).forEach(d=>{if(!e.has(String(d.id)))return;n++;const l=r?.get(String(d.id))??(Number(d.stock)||0);s+=(Number(d.cost)||0)*Math.max(0,l),l<=(Number(d.stockMin)||5)&&i++});let a=document.getElementById("mkInvSummary");if(n===0){a&&a.remove();return}a||(a=document.createElement("div"),a.id="mkInvSummary",a.className="mk-table-summary",a.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(a,t.nextSibling)),a.innerHTML=`<span>Valor en costo: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${n} producto${n!==1?"s":""}</span>`+(i>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${i} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const e=window.renderInventoryTable;if(typeof e!="function"||e._mkWrapped)return;const r=function(...s){const i=e.apply(this,s);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return i};r._mkWrapped=!0,window.renderInventoryTable=r})();function _mkInvModal(t,e,r,s="700px"){let i=document.getElementById(t+"_ov");i||(i=document.createElement("div"),i.id=t+"_ov",i.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(i)),i.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${s};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${e}</h3>
        <button onclick="document.getElementById('${t}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${r}</div>
    </div>`,i.onclick=n=>{n.target===i&&i.remove()},i.style.display="flex"}function abrirConteoFisico(){const t=(window.products||[]).filter(i=>i.tipo!=="servicio"&&i.activo!==!1);if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const e=_esc,s=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${t.map((i,n)=>{const a=typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0;return`<tr style="${n%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${e(i.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${e(i.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${a}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${a}" data-pid="${e(i.id)}" data-sistema="${a}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",s,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const t=document.querySelectorAll("#mkConteo_ov .conteo-input");let e=0;if(t.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.sistema),n=Number(r.value);if(isNaN(n)||n===i)return;const a=(window.products||[]).find(l=>String(l.id)===String(s));if(!a)return;const d=n-i;a.stock=n,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:a.id,productoNombre:a.name,tipo:d>0?"entrada_manual":"salida_manual",cantidad:Math.abs(d),motivo:"Conteo f\xEDsico",stockAntes:i,stockDespues:n}),e++}),e===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${e} ajuste${e!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const t=(window.products||[]).filter(i=>i.tipo==="servicio"||i.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0)<=(Number(i.stockMin)||5));if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const e=_esc,r={};t.forEach(i=>{const n=i.proveedor||"Sin proveedor";r[n]||(r[n]=[]),r[n].push(i)});const s=Object.entries(r).map(([i,n])=>{const a=e(i),d=n.map(c=>{const w=typeof getStockEfectivo=="function"?getStockEfectivo(c):Number(c.stock)||0,y=Number(c.stockMin)||5,T=Math.max(1,y*2-w);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${e(c.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${w}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${y}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#FFD166;">${T}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${e(c.unidad||"pza")}</td></tr>`}).join(""),l=encodeURIComponent(`Hola, necesito reabastecer:
${n.map(c=>{const w=Number(c.stock)||0,y=Number(c.stockMin)||5;return`\u2022 ${c.name}: ${Math.max(1,y*2-w)} ${c.unidad||"pza"}`}).join(`
`)}`),g=p?.proveedorUrl?.startsWith("http")?p.proveedorUrl:`https://wa.me/?text=${l}`;return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${a} (${n.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:
${n.map(c=>`\u2022 ${c.name}: ${Math.max(1,(Number(c.stockMin)||5)*2-(typeof getStockEfectivo=="function"?getStockEfectivo(c):Number(c.stock)||0))} ${c.unidad||"pza"}`).join(`
`)}`)}" target="_blank"
            style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#25D366;color:white;text-decoration:none;font-weight:700;">\u{1F4F2} WA</a>
          <button onclick="_mkExportReabCSV('${a}')" style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#10b981;color:white;border:none;cursor:pointer;font-weight:700;">\u{1F4E5} CSV</button>
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
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${t.length} productos`,s,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(t){const r=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(a=>{if(a.tipo==="servicio"||a.activo===!1)return!1;const d=a.proveedor||"Sin proveedor";return t&&d!==t?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(a):Number(a.stock)||0)<=(Number(a.stockMin)||5)}).map(a=>{const d=typeof getStockEfectivo=="function"?getStockEfectivo(a):Number(a.stock)||0,l=Number(a.stockMin)||5;return`"${a.name}",${d},${l},${Math.max(1,l*2-d)},${a.unidad||"pza"},"${a.proveedor||""}"`})].join(`
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([r],{type:"text/csv;charset=utf-8;"}));const i=new Date,n=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;s.download=`reabastecimiento_${n}.csv`,s.click()};function mostrarDonutCategoria(){const t=_esc,e={};(window.products||[]).forEach(d=>{if(d.tipo==="servicio"||d.activo===!1)return;const l=typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0,g=(Number(d.price)||0)*l,c=d.category||"Sin categor\xEDa";e[c]=(e[c]||0)+g});const r=Object.entries(e).sort((d,l)=>l[1]-d[1]),s=r.reduce((d,[,l])=>d+l,0),i=["#FFD166","#9669c4","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#9669c4","#f97316","#14b8a6"],n=r.map(([d,l],g)=>{const c=s>0?(l/s*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i[g%i.length]};margin-right:6px;"></span>
        ${t(d)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${l.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${c}%</td>
    </tr>`}).join(""),a=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Valor de inventario (precio \xD7 stock) por categor\xEDa. Total: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></p>
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
      <canvas id="mkDonutCat" width="200" height="200" style="flex-shrink:0;max-width:200px;"></canvas>
      <table style="flex:1;min-width:200px;border-collapse:collapse;">
        <thead><tr style="font-size:.75rem;color:#9ca3af;">
          <th style="padding:6px 12px;text-align:left;">Categor\xEDa</th>
          <th style="padding:6px 12px;text-align:right;">Valor</th>
          <th style="padding:6px 12px;text-align:right;">%</th>
        </tr></thead>
        <tbody>${n}</tbody>
        <tfoot><tr style="border-top:2px solid #e5e7eb;font-weight:800;">
          <td style="padding:8px 12px;">Total</td>
          <td style="padding:8px 12px;text-align:right;">$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
          <td style="padding:8px 12px;text-align:right;">100%</td>
        </tr></tfoot>
      </table>
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",a,"700px"),setTimeout(()=>{const d=document.getElementById("mkDonutCat");if(d)try{const l=window.Chart;if(typeof l>"u"){d.style.display="none";return}new l(d,{type:"doughnut",data:{labels:r.map(([g])=>g),datasets:[{data:r.map(([,g])=>Math.round(g)),backgroundColor:r.map((g,c)=>i[c%i.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{d&&(d.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const t=_esc,e=new Date;e.setDate(e.getDate()-60);const r={};(window.pedidosFinalizados||[]).forEach(a=>{const d=a.fechaFinalizado||a.entrega||"";d&&new Date(d)<e||(a.productosInventario||[]).forEach(l=>{!l.id||l.id==="libre"||(r[String(l.id)]=(r[String(l.id)]||0)+(Number(l.quantity||l.cantidad)||1))})});const s=(window.products||[]).filter(a=>a.tipo!=="servicio"&&a.activo!==!1&&r[String(a.id)]);if(!s.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const n=`
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
      <tbody>${s.map(a=>{const d=r[String(a.id)]||0,l=d/60,g=Math.max(1,Math.ceil(l*14)),c=Number(a.stockMin)||0,w=g!==c?`<span style="color:${g>c?"#10b981":"#f59e0b"};font-weight:700;">${g>c?"\u25B2":"\u25BC"} ${g}</span>`:`<span style="color:#6b7280;">${g} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${t(a.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${c}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${w}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${t(a.id)}" data-nuevo="${g}" class="mkStockMinCb" style="accent-color:#FFD166;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",n,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const t=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let e=0;t.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.nuevo),n=(window.products||[]).find(a=>String(a.id)===String(s));!n||isNaN(i)||(n.stockMin=i,e++)}),e&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${e} producto${e!==1?"s":""}`,"ok"))};function archivarProducto(t){const e=(window.products||[]).find(n=>String(n.id)===String(t));if(!e)return;const r=e.activo!==!1,s=r?"archivar":"desarchivar",i=r?`\xBFArchivar "${e.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${e.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(i,r?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(n=>{n&&(e.activo=!r,e.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(r?`\u{1F4C1} "${e.name}" archivado`:`\u{1F513} "${e.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(t){const e=_esc,r=(window.products||[]).find(f=>String(f.id)===String(t));if(!r){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const s=Date.now()-90*864e5,i=new Set,n=[],a=f=>{if(!f)return;const h=f.fecha?new Date(f.fecha+(f.hora?"T"+f.hora:"")).getTime():f.timestamp?new Date(f.timestamp).getTime():0;if(h&&h<s)return;const P=f.id||String(f.productoId||t)+"_"+h+"_"+(f.cantidad||0);i.has(P)||(i.add(P),n.push({...f,_ts:h||Date.now()}))};(r.movimientos||[]).forEach(a),(window.stockMovimientos||[]).filter(f=>String(f.productoId)===String(t)).forEach(a),n.sort((f,h)=>h._ts-f._ts);const d=[];for(let f=12;f>=0;f--){const h=new Date(Date.now()-f*7*864e5),P=new Date(h.getTime()-7*864e5),U=`${P.getDate()}/${P.getMonth()+1}`;let K=0,O=0;n.forEach(A=>{if(A._ts>=P.getTime()&&A._ts<h.getTime()){const tt=A.stockDespues!=null&&A.stockAntes!=null?Number(A.stockDespues)-Number(A.stockAntes):0,J=(A.tipo||"").toLowerCase();tt>0||J.includes("entrada")||J.includes("compra")||J.includes("ajuste_positivo")?K+=Math.abs(Number(A.cantidad)||Math.abs(tt)||1):O+=Math.abs(Number(A.cantidad)||Math.abs(tt)||1)}}),d.push({label:U,entradas:K,salidas:O})}const l=Math.max(1,...d.map(f=>Math.max(f.entradas,f.salidas))),g=480,c=100,w=Math.floor((g-20)/d.length/2)-1,y=d.map((f,h)=>{const P=10+h*(w*2+4),U=Math.round(f.entradas/l*(c-20)),K=Math.round(f.salidas/l*(c-20));return`
      <rect x="${P}" y="${c-10-U}" width="${w}" height="${U}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${f.entradas}"/>
      <rect x="${P+w+1}" y="${c-10-K}" width="${w}" height="${K}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${f.salidas}"/>
      <text x="${P+w}" y="${c-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${f.label}</text>`}).join(""),T=n.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">\u25A0 Entradas</span>
        <span style="color:#ef4444;">\u25A0 Salidas</span>
      </div>
      <svg viewBox="0 0 ${g} ${c}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${c-10}" x2="${g-10}" y2="${c-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${y}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">\u2190 13 semanas</div>
    </div>`,b={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},B=n.slice(0,30).map(f=>{const h=f.fecha||(f._ts?new Date(f._ts).toLocaleDateString("es-MX"):"\u2014"),P=f.hora||"",U=b[f.tipo||""]||f.tipo||"\u2014",K=f.stockDespues!=null&&f.stockAntes!=null?Number(f.stockDespues)-Number(f.stockAntes):0,O=Number(f.cantidad)||Math.abs(K)||0,A=K>0||(f.tipo||"").includes("entrada")||(f.tipo||"").includes("compra"),tt=A?"#10b981":"#ef4444",J=A?`+${O}`:`-${O}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${e(h)} ${P?`<span style="color:#9ca3af;font-size:.72rem;">${e(P.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${e(U)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${tt};">${J}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${f.stockDespues!=null?f.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e(f.motivo||"")}">${e(f.motivo||"")}</td>
    </tr>`}).join(""),D=typeof getStockEfectivo=="function"?getStockEfectivo(r):Number(r.stock)||0,G=n.reduce((f,h)=>{const P=h.stockDespues!=null&&h.stockAntes!=null?Number(h.stockDespues)-Number(h.stockAntes):0;return f+(P>0||(h.tipo||"").includes("entrada")||(h.tipo||"").includes("compra")?Math.abs(Number(h.cantidad)||Math.abs(P)||0):0)},0),_=n.reduce((f,h)=>{const P=h.stockDespues!=null&&h.stockAntes!=null?Number(h.stockDespues)-Number(h.stockAntes):0,U=P>0||(h.tipo||"").includes("entrada")||(h.tipo||"").includes("compra");return f+(U?0:Math.abs(Number(h.cantidad)||Math.abs(P)||0))},0),z=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${D}</div>
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
        <div style="font-size:1.4rem;font-weight:800;color:#374151;">${n.length}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Movimientos</div>
      </div>
    </div>
    ${T}
    ${n.length>0?`
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      <thead><tr style="background:#f9fafb;font-size:.73rem;color:#9ca3af;font-weight:700;">
        <th style="padding:7px 10px;text-align:left;">Fecha</th>
        <th style="padding:7px 10px;text-align:left;">Tipo</th>
        <th style="padding:7px 10px;text-align:center;">Cant.</th>
        <th style="padding:7px 10px;text-align:center;">Stock</th>
        <th style="padding:7px 10px;text-align:left;">Motivo</th>
      </tr></thead>
      <tbody>${B}</tbody>
    </table>
    ${n.length>30?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${n.length-30} m\xE1s</p>`:""}`:""}
  `,L=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button onclick="(function(){
        var movs=${JSON.stringify(n.map(f=>({fecha:f.fecha||(f._ts?new Date(f._ts).toLocaleDateString("es-MX"):""),hora:f.hora||"",tipo:f.tipo||"",cantidad:f.cantidad||0,motivo:f.motivo||"",stockAntes:f.stockAntes??"",stockDespues:f.stockDespues??""})))};
        var headers=['Fecha','Hora','Tipo','Cantidad','Motivo','Stock antes','Stock despu\xE9s'];
        var csv=headers.join(',')+'\\n';
        movs.forEach(function(m){
          var row=[m.fecha,m.hora,m.tipo,m.cantidad,m.motivo,m.stockAntes,m.stockDespues];
          csv+=row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',')+'\\n';
        });
        var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;a.download='kardex-${e(r.name||"producto").replace(/[^a-zA-Z0-9]/g,"_")}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('\u{1F4E5} Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        \u{1F4E5} Exportar CSV
      </button>
    </div>
    ${z}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${e(r.name||"Producto")} (90d)`,L,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const t=window.inventarioSnapshots||[];if(t.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const e=[...t].sort((_,z)=>(_.fecha||"").localeCompare(z.fecha||"")),r=e.map(_=>_.fecha||""),s=e.map(_=>Number(_.valorTotal||_.valor||0)),i=540,n=140,a=Math.max(1,...s),d=Math.min(...s),l=a-d||1,c=`<polyline points="${s.map((_,z)=>{const L=20+z/Math.max(1,s.length-1)*(i-40),f=n-20-(_-d)/l*(n-40);return`${L},${f}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,w=s.map((_,z)=>{const L=20+z/Math.max(1,s.length-1)*(i-40),f=n-20-(_-d)/l*(n-40);return`<circle cx="${L}" cy="${f}" r="3.5" fill="#6366f1" opacity=".9"><title>${r[z]}: $${_.toLocaleString("es-MX")}</title></circle>`}).join(""),y=r.filter((_,z)=>z===0||z===r.length-1||z%Math.ceil(r.length/6)===0).map((_,z,L)=>`<text x="${20+r.indexOf(_)/Math.max(1,r.length-1)*(i-40)}" y="${n-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${_.slice(5)}</text>`).join(""),T=s[s.length-1]||0,b=s[0]||0,B=b>0?((T-b)/b*100).toFixed(1):"\u2014",D=Number(B)>=0?"#10b981":"#ef4444",G=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${T.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${D};">${Number(B)>=0?"+":""}${B}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variaci\xF3n total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${e.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${i} ${n}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${n-20}" x2="${i-10}" y2="${n-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${c}${w}${y}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">\u2190 Valor de inventario en costo \xB7 ${e.length} puntos</p>
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",G,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;function abrirMovimientosRecientes(){const t=_esc,e=[...window.stockMovements||window.stockMovimientos||[]].slice(0,50);if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin movimientos registrados a\xFAn","warn");return}const r={ajuste:"#6366f1",entrada:"#10b981",compra:"#10b981",merma:"#ef4444",salida:"#ef4444",descuento:"#f59e0b",produccion:"#f59e0b",conteo:"#3b82f6",ajuste_positivo:"#10b981"},s=e.map(n=>{const a=(n.fecha||"").split("T"),d=a[0]||"",l=(a[1]||"").substring(0,5),g=(n.tipo||"").toLowerCase(),c=n.stockDespues!=null&&n.stockAntes!=null?Number(n.stockDespues)-Number(n.stockAntes):0,w=c>0||g.includes("entrada")||g.includes("compra")||g.includes("ajuste_positivo"),y=Number(n.cantidad)||Math.abs(c)||0,T=w?`<span style="color:#10b981;font-weight:700;">+${y}</span>`:`<span style="color:#ef4444;font-weight:700;">\u2212${y}</span>`,b=r[g]||"#6b7280",B=`<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${b}22;color:${b};font-size:.7rem;font-weight:700;">${t(n.tipo||"\u2014")}</span>`,D=n.productoId?`<button onclick="abrirMovimientoProducto('${t(String(n.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${t(n.productoNombre||n.productoId)}</button>`:`<span style="font-size:.8rem;">${t(n.productoNombre||"\u2014")}</span>`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${t(d)} <span style="color:#9ca3af;font-size:.7rem;">${l}</span></td>
      <td style="padding:6px 10px;">${D}</td>
      <td style="padding:6px 10px;">${B}</td>
      <td style="padding:6px 10px;text-align:center;">${T}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${n.stockDespues!=null?n.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.74rem;color:#9ca3af;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t(n.motivo||"")}">${t(n.motivo||"")}</td>
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
        <tbody>${s}</tbody>
      </table>
    </div>`;_mkInvModal("mkMovRecientes","\u{1F4CB} Movimientos Recientes \u2014 Inventario",i,"820px")}window.abrirMovimientosRecientes=abrirMovimientosRecientes;
//# sourceMappingURL=inventory-5.js.map
