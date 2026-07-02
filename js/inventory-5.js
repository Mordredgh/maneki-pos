"use strict";function _levenshtein(e,o){const r=e.length,s=o.length,i=Array.from({length:r+1},(n,a)=>Array.from({length:s+1},(l,d)=>d===0?a:0));for(let n=1;n<=s;n++)i[0][n]=n;for(let n=1;n<=r;n++)for(let a=1;a<=s;a++)i[n][a]=e[n-1]===o[a-1]?i[n-1][a-1]:1+Math.min(i[n-1][a],i[n][a-1],i[n-1][a-1]);return i[r][s]}window._levenshtein=_levenshtein;function _fuzzyMatch(e,o,r=2){return e=e.toLowerCase().trim(),o=o.toLowerCase(),!e||o.includes(e)?!0:o.split(/[\s,.-]+/).some(i=>{const n=i.substring(0,e.length+2);return n.length>=e.length-1&&_levenshtein(e,n)<=r})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(e){if(!Array.isArray(e.mpComponentes)||e.mpComponentes.length===0)return null;let o=1/0;for(const r of e.mpComponentes){const s=(window.products||[]).find(a=>String(a.id)===String(r.id));if(!s)return 0;const i=typeof getStockEfectivo=="function"?getStockEfectivo(s):s.stock||0,n=parseFloat(r.qty)||1;o=Math.min(o,Math.floor(i/n))}return o===1/0?0:o}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let e=document.getElementById("bulkPrecioModal");e||(e=document.createElement("div"),e.id="bulkPrecioModal",e.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",e.addEventListener("click",s=>{s.target===e&&(e.style.display="none")}),document.body.appendChild(e));const r=[...new Set((window.products||[]).map(s=>s.category).filter(Boolean))].map(s=>{const i=(window.categories||[]).find(n=>String(n.id)===String(s));return`<option value="${_esc(s)}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:s)}</option>`}).join("");e.innerHTML=`
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
    </div>`,e.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function abrirBulkStockModal(){let e=document.getElementById("bulkStockModal");e||(e=document.createElement("div"),e.id="bulkStockModal",e.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",e.addEventListener("click",s=>{s.target===e&&(e.style.display="none")}),document.body.appendChild(e));const r=[...new Set((window.products||[]).filter(s=>s.tipo==="materia_prima").map(s=>s.category).filter(Boolean))].map(s=>{const i=(window.categories||[]).find(n=>String(n.id)===String(s));return`<option value="${_esc(String(s))}">${_esc(i?i.emoji?i.emoji+" "+i.name:i.name:String(s))}</option>`}).join("");e.innerHTML=`
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
    </div>`,e.style.display="flex",_bulkStockPreview()}window.abrirBulkStockModal=abrirBulkStockModal;function _bulkStockPreview(){const e=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),o=document.getElementById("bulkStockCat")?.value||"",r=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!o||String(i.category)===o)),s=document.getElementById("bulkStockPreviewList");if(s){if(e===0){s.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ingresa una cantidad distinta de 0</p>';return}s.innerHTML=`
        <div style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:6px;">${r.length} producto${r.length!==1?"s":""} afectados:</div>
        ${r.slice(0,20).map(i=>{const n=typeof getStockEfectivo=="function"?getStockEfectivo(i):parseInt(i.stock)||0,a=Math.max(0,n+e);return`<div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f3f4f6;font-size:.76rem;">
                <span>${_esc(i.name)}</span>
                <span>${n} \u2192 <b style="color:${e>0?"#16a34a":"#dc2626"}">${a}</b></span>
            </div>`}).join("")}
        ${r.length>20?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:6px;">...y ${r.length-20} m\xE1s</p>`:""}`}}window._bulkStockPreview=_bulkStockPreview;async function _bulkStockAplicar(){const e=parseInt(document.getElementById("bulkStockCantidad")?.value||"0"),o=document.getElementById("bulkStockCat")?.value||"";if(e===0){manekiToastExport("Ingresa una cantidad distinta de 0","warn");return}const r=(window.products||[]).filter(i=>i.tipo==="materia_prima"&&(!o||String(i.category)===o));if(r.length===0){manekiToastExport("Sin productos para ajustar","warn");return}const s=typeof getStockEfectivo=="function"?getStockEfectivo:i=>parseInt(i.stock)||0;r.forEach(i=>{const n=s(i);i.stock=Math.max(0,n+e),typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:i.id,productoNombre:i.name,tipo:e>0?"entrada":"merma",cantidad:Math.abs(e),motivo:`Ajuste masivo ${e>0?"+":""}${e}`,stockAntes:n,stockDespues:i.stock})}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkStockModal").style.display="none",manekiToastExport(`\u2705 Stock ajustado en ${r.length} producto(s)`,"ok")}window._bulkStockAplicar=_bulkStockAplicar;function _bulkPrecioGetAfectados(){const e=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,r=document.getElementById("bulkPrecioSoloMP")?.checked||!1,s=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(i=>s&&String(i.category)!==s?!1:o&&r?!0:!(o&&!(!i.tipo||i.tipo==="producto"||i.tipo==="producto_interno"||i.tipo==="pack")||r&&i.tipo!=="materia_prima")).map(i=>{const n=r&&!o?"cost":"price",a=parseFloat(i[n])||0,l=Math.max(0,Math.round(a*(1+e/100)*100)/100);return{p:i,campoKey:n,precioActual:a,precioNuevo:l}}).filter(i=>i.precioActual>0)}function bulkPrecioPreview(){const e=document.getElementById("bulkPrecioPreviewList");if(!e)return;const o=_bulkPrecioGetAfectados();if(!o.length){e.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}e.innerHTML=o.slice(0,50).map(({p:r,campoKey:s,precioActual:i,precioNuevo:n})=>{const a=n-i,l=a>0?"#16a34a":a<0?"#dc2626":"#6b7280",d=s==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(r.name)}">${_esc(r.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${d}: $${i.toFixed(2)}</span>
            <span style="font-weight:700;color:${l};white-space:nowrap;">\u2192 $${n.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const e=_bulkPrecioGetAfectados();if(!e.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,r=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",s=o>0?"+":"",i=e.slice(0,5).map(({p:n,precioActual:a,precioNuevo:l})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(n.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${a.toFixed(2)}</span>
            <span style="font-weight:700;color:${l>a?"#16a34a":"#dc2626"};">\u2192 $${l.toFixed(2)}</span>
        </div>`).join("")+(e.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${e.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${s}${o}%</strong> al ${r} de <strong>${e.length}</strong> producto(s):</p>
                ${i}
             </div>`,"\u2705 Confirmar cambio masivo").then(n=>{n&&(e.forEach(({p:a,campoKey:l,precioNuevo:d})=>{a[l]=d,a.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${e.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${s}${o}% a ${e.length} producto(s)? Ver preview arriba.`))return;e.forEach(({p:n,campoKey:a,precioNuevo:l})=>{n[a]=l,n.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${e.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const e=document.getElementById("inventoryTable");if(!e)return;const o=window.products||[],r=document.getElementById("inventoryTipoFilter")?.value||"",s=o.length+"_"+o.reduce((t,x)=>t+Number(x.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+r,i=document.getElementById("invDualContainer");if(i&&i._lastHash===s)return;i&&(i._lastHash=s);let n=document.getElementById("invDualContainer");if(!n){const t=e.closest('table, .overflow-x-auto, [class*="overflow"]')||e.parentElement;n=document.createElement("div"),n.id="invDualContainer",n.style.cssText="display:flex;flex-direction:column;gap:0;",t.parentNode.insertBefore(n,t),t.style.display="none"}const a=window.products||[],l=new Map(a.map(t=>[String(t.id),typeof getStockEfectivo=="function"?getStockEfectivo(t):parseInt(t.stock)||0]));if(window._invStockCache=l,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const t=document.createElement("style");t.id="invExtraColStyles",t.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(t)}let d=document.getElementById("invExtraColToggle");if(d||(d=document.createElement("button"),d.id="invExtraColToggle",d.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",d.textContent="Mostrar SKU/Proveedor",d.addEventListener("click",()=>{const t=document.getElementById("invDualContainer");if(!t)return;const x=t.classList.toggle("inv-show-extra");d.textContent=x?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),n.parentNode.insertBefore(d,n)),a.length===0){n.innerHTML=`
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
        </div>`;return}const g=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",c=(document.getElementById("inventoryTagFilter")||{}).value||"",k=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function y(t){const x=window._normSearch||(v=>String(v||"").toLowerCase()),u=x(g),w=x(k),$=v=>!c||v.tags&&v.tags.includes(c),S=v=>!k||x(v.proveedor||"").includes(w);if(!g)return t.filter(v=>$(v)&&S(v));const M=t.filter(v=>(x(v.name).includes(u)||x(v.sku||"").includes(u)||x(v.proveedor||"").includes(u)||x(v.notas||"").includes(u)||(v.tags||[]).some(W=>x(W).includes(u)))&&$(v)&&S(v));return M.length>0?M:t.filter(v=>(_fuzzyMatch(u,v.name||"")||_fuzzyMatch(u,v.sku||"")||_fuzzyMatch(u,v.proveedor||""))&&$(v)&&S(v))}const T=y(a.filter(t=>t.tipo==="materia_prima")),b=y(a.filter(t=>t.tipo==="servicio")),B=y(a.filter(t=>t.tipo==="producto_variable")),F=y(a.filter(t=>!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack")),G=new Set([...F,...B].map(t=>String(t.id))),_=window.productMap||new Map(a.map(t=>[String(t.id),t])),z=new Map;for(const t of a)t.mpComponentes&&t.mpComponentes.length>0&&G.has(String(t.id))&&z.set(String(t.id),calcularDisponibilidadDesdeMP(t,_,l));function L(t){if(!window._invSortCol)return t;const x=window._invSortCol,u=window._invSortDir;return[...t].sort((w,$)=>{let S,M;return x==="name"?(S=(w.name||"").toLowerCase(),M=($.name||"").toLowerCase()):x==="sku"?(S=(w.sku||"").toLowerCase(),M=($.sku||"").toLowerCase()):x==="category"?(S=(w.category||"").toLowerCase(),M=($.category||"").toLowerCase()):x==="price"?(S=Number(w.price)||0,M=Number($.price)||0):x==="stock"?(S=Number(w.stock)||0,M=Number($.stock)||0):x==="margin"&&(S=w.cost&&w.price?(w.price-w.cost)/w.price:-1,M=$.cost&&$.price?($.price-$.cost)/$.price:-1),S<M?u==="asc"?-1:1:S>M?u==="asc"?1:-1:0})}function f(t,x){const u=String(t.id),w=l.get(u)??(typeof getStockEfectivo=="function"?getStockEfectivo(t):parseInt(t.stock)||0),$=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${t.image||"\u{1F3ED}"}</span>`;let S;w===0?S='<span class="badge-danger"><i class="fas fa-circle-xmark"></i> Agotado</span>':w<=(t.stockMin||5)?S='<span class="badge-warning"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':S='<span class="badge-success"><i class="fas fa-circle-check"></i> Disponible</span>';const M=(window.categories||[]).find(A=>A.id===t.category),v=M?M.name:t.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    ${t.historialCostos&&t.historialCostos.length?`<span title="Este producto ha tenido ${t.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#9669c4;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${t.historialCostos.length} cambio${t.historialCostos.length>1?"s":""}</span>`:""}
                    ${t.compraPaquete?`<div style="font-size:10px;color:#9669c4;margin-top:2px;">\u{1F4E6} Paquete: ${t.compraPaquete.cantidad} uds \xB7 $${Number(t.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map(A=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#9669c4;border:1px solid #e9d5ff;">${_esc(A)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(v)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#9669c4;font-weight:600;">$${Number(t.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(t.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${u}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${u}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${w} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(t.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${S}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;align-items:center;">
                    <button type="button" onclick="editProduct('${u}')" title="Editar" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;"><i class="fas fa-pen"></i></button>
                    <button type="button" onclick="ajustarStock('${u}')" title="Ajustar stock" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">\u{1F4E6}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" onclick="_invMpMenu(this,'${u}',${!!t.proveedorUrl},'${t.activo===!1?"desarchivar":"archivar"}')" title="M\xE1s acciones" style="width:30px;height:30px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;font-weight:700;color:#6b7280;"><i class="fas fa-ellipsis"></i></button>
                    </div>
                </div>
            </td>
        </tr>`}function h(t,x){const u=String(t.id),w=`<span style="font-size:1.6rem;">${t.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map($=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f6ecff;color:#7d4fa3;border:1px solid #dfbfff;">${_esc($)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#7d4fa3;">$${Number(t.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#f6ecff;color:#7d4fa3;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${u}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteProduct('${u}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function P(t,x){const u=String(t.id),w=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${t.image||"\u{1F4E6}"}</span>`,$=(window.categories||[]).find(m=>m.id===t.category),S=$?$.name:t.category||"",M=z.get(u)??null;let v,A;if(M!==null){const m=M.piezas,C=m===0?"#ef4444":m<=3?"#f59e0b":"#10b981",j=m===0?"#fee2e2":m<=3?"#fef3c7":"#d1fae5",E=M.detalle.map(R=>`${R.nombre}: ${R.stock}\xF7${R.qty}=${R.posibles}pzs`).join(" | ");v=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(E)}"
                        style="padding:3px 12px;border-radius:8px;background:${j};color:${C};
                               font-weight:700;font-size:.95rem;border:1px solid ${C}33;cursor:help;">
                        ${m}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,A=m===0?'<span class="badge-danger">Sin stock MP</span>':m<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const m=l.get(String(t.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(t):t.stock||0),C=t.stockMin||5,j=m===0?"#ef4444":m<=C?"#f59e0b":"#10b981";v=`<span style="padding:3px 12px;border-radius:8px;background:${m===0?"#fee2e2":m<=C?"#fef3c7":"#d1fae5"};color:${j};font-weight:700;font-size:.95rem;">${m}</span>`,A=m===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-xmark"></i> Agotado</span>':m<=C?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;"><i class="fas fa-circle-check"></i> Disponible</span>'}const W=`_invVar_${u}_open`,H=window[W]===!0,Y=t.variants&&t.variants.length>0?`<div>
                <button onclick="(()=>{window['_invVar_${u}_open']=!window['_invVar_${u}_open'];renderInventoryTable()})()" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${H?"\u25B2":"\u25B6"} ${t.variants.length} variante${t.variants.length!==1?"s":""}
                </button>
                ${H?'<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">'+t.variants.map(m=>`
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(m.type)}:</span>
                        ${_mkColorDot(m.type,_esc(m.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(m.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${m.qty??0}</span>
                    </div>`).join("")+"</div>":""}
               </div>`:'<span class="text-xs text-gray-400">Sin variantes</span>',Z=Number(t.cost)||0,q=Number(t.price)||0,X=Z&&q?(()=>{const m=(q-Z)/q*100,C=m>=40?"#10b981":m>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${C};">${m.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,m).toFixed(0)}%;background:${C};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    ${t._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${t.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${t.tipo==="pack"&&t.packComponentes&&t.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${t.packComponentes.map(m=>`${m.qty>1?m.qty+"\xD7 ":""}${_esc(m.nombre)}`).join(" + ")}</div>`:""}
                    ${t.historialPrecios&&t.historialPrecios.length?`<span title="Este producto ha tenido ${t.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${t.historialPrecios.length} cambio${t.historialPrecios.length>1?"s":""}</span>`:""}
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(t.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(t.proveedorNombre)}</b>${t.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map(m=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(m)}</span>`).join("")}</div>`:""}
                    ${(()=>{const m=calcularProducibles(t);if(m===null)return"";const C=m>=5?"#16a34a":m>=1?"#d97706":"#dc2626",j=m>=5?"#d1fae5":m>=1?"#fef3c7":"#fee2e2",E=m===0?"Sin stock MP":`Producibles: ${m}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${j};color:${C};border:1px solid ${C}33;">\u{1F3ED} ${E}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(S)}</td>
            <td class="px-4 py-3">${Y}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${u}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(t.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${u}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${v}</td>
            <td class="px-4 py-3">${A}</td>
            <td class="px-4 py-3">${X}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${t.tipo==="pack"?`<button type="button" onclick="openPackModal('${u}')" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>`:`<button type="button" onclick="editProduct('${u}')" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>`}
                    <button type="button" onclick="duplicarProducto('${u}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>
                    ${t.tipo!=="pack"?`<button type="button" onclick="cambiarTipoProducto('${u}')" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${t.movimientos&&t.movimientos.length?`<button type="button" onclick="verMovimientosProducto('${u}')" title="Ver movimientos de stock (${t.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>`:""}
                    <button type="button" onclick="abrirMovimientoProducto('${u}')" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-chart-line"></i></button>
                    <button type="button" onclick="archivarProducto('${u}')" title="${t.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${t.activo===!1?'<i class="fas fa-lock-open"></i>':'<i class="fas fa-box-archive"></i>'}</button>
                    <button type="button" onclick="deleteProduct('${u}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function U(t,x){const u=String(t.id),w=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${t.image||"\u{1F3AF}"}</span>`,$=(t.tablaPreciosVariable||[]).slice().sort((I,Q)=>I.cantidadMin-Q.cantidadMin),S=$.length?$.map(I=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${I.cantidadMin} pzas = $${Number(I.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',M=(t.mpComponentes||[]).length,v=(window.categories||[]).find(I=>String(I.id)===String(t.category)),A=v?`${v.emoji||""} ${v.name}`:"\u2014",W=$,H=W.length?W[0].precio/(W[0].cantidadMin||1):0,re=H>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${H.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',Y=z.get(String(t.id))??null;let Z,q;if(Y!==null){const I=Y.piezas,Q=I===0?"#ef4444":I<=3?"#f59e0b":"#10b981",de=I===0?"#fee2e2":I<=3?"#fef3c7":"#d1fae5",se=Y.detalle.map(te=>`${te.nombre}: ${te.stock}\xF7${te.qty}=${te.posibles}pzs`).join(" | ");Z=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(se)}" style="padding:3px 12px;border-radius:8px;background:${de};color:${Q};font-weight:700;font-size:.95rem;border:1px solid ${Q}33;cursor:help;">${I}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,q=I===0?'<span class="badge-danger">Sin stock MP</span>':I<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else Z='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',q='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const X=(t.mpComponentes||[]).reduce((I,Q)=>I+(parseFloat(Q.costUnit)||0)*(parseFloat(Q.qty)||1),0),m=t.rendimientoPorHoja||1,C=m>0?X/m:X,j=H>0?Math.round((H-C)/H*100):0,E=j>=40?"#10b981":j>=20?"#f59e0b":"#ef4444",R=H>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${E};">${j}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,j)}%;background:${E};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${u}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${t.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${t.rendimientoPorHoja} uds/hoja \xB7 ${M} MP${M!==1?"s":""}</div>`:M>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${M} MP${M!==1?"s":""}</div>`:""}
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map(I=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(I)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(A)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${S}</div></td>
            <td class="px-4 py-3 text-right">${re}</td>
            <td class="px-4 py-3">${Z}</td>
            <td class="px-4 py-3">${q}</td>
            <td class="px-4 py-3">${R}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${u}')" title="Editar" aria-label="Editar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-pen"></i></button>
                    <button type="button" onclick="duplicarProducto('${u}')" title="Duplicar" aria-label="Duplicar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>
                    <button type="button" onclick="deleteProduct('${u}')" title="Eliminar" aria-label="Eliminar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`}function K({id:t,title:x,titleColor:u,titleBg:w,btnLabel:$,btnOnclick:S,btnColor:M,extraBtnHTML:v,products:A,renderFila:W,headers:H,emptyMsg:re}){const Y=document.getElementById("inventoryTipoFilter")?.value||"";if(Y==="materia"&&t!=="mp"||Y==="producto"&&t==="mp")return"";const Z=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(A.length===0&&Z)return"";const q=L(A),X=`_invPage_${t}`,m=window._invPageSize||10;window[X]=window[X]||1;const C=q.length,j=Math.max(1,Math.ceil(C/m));window[X]>j&&(window[X]=1);const E=window[X],R=(E-1)*m,I=q.slice(R,R+m),Q=I.length===0?`<tr><td colspan="${H.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${re}</td></tr>`:I.map((V,ne)=>W(V,ne)).join(""),de=H.map(V=>{const ne=V.colId==="sku"?" inv-col-hidden-sku":V.colId==="proveedor"?" inv-col-hidden-prov":"",ie=V.align==="right"?" text-right":" text-left";return V.sortKey?`<th class="px-4 py-3${ie} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${ne}" onclick="sortInventory('${V.sortKey}')" style="white-space:nowrap;">${V.label} \u2195</th>`:`<th class="px-4 py-3${ie} text-xs font-semibold text-gray-500 uppercase tracking-wide${ne}" style="white-space:nowrap;">${V.label}</th>`}).join("");let se="";if(j>1||C>m){const V=Math.min(R+m,C);se=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${R+1}\u2013${V}</b> de <b>${C}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${t}',${E-1})" ${E<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${E<=1?"default":"pointer"};opacity:${E<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,j)},(ne,ie)=>{let N=E<=3?ie+1:E+ie-2;return N<1&&(N=null),N>j&&(N=null),N===null?"":`<button onclick="invSectionPage('${t}',${N})" style="min-width:30px;padding:4px 8px;border:1px solid ${N===E?"#FFD166":"#e5e7eb"};border-radius:7px;background:${N===E?"#FFD166":"#fff"};color:${N===E?"#fff":"#374151"};font-weight:${N===E?700:400};font-size:13px;cursor:${N===E?"default":"pointer"};" ${N===E?"disabled":""}>${N}</button>`}).join("")}
                    <button onclick="invSectionPage('${t}',${E+1})" ${E>=j?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${E>=j?"default":"pointer"};opacity:${E>=j?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}const te=`_invSec_${t}_collapsed`,ce=window[te]===!0;return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${u}33;box-shadow:0 2px 12px ${u}11;">
            <!-- Header de secci\xF3n (clicable para colapsar) -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${w};border-bottom:${ce?"none":"1.5px solid "+u+"33"};cursor:pointer;" onclick="(()=>{const k='_invSec_${t}_collapsed';window[k]=!window[k];renderInventoryTable()})()">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${u};transition:transform .2s;">${ce?"\u25B6":"\u25BC"}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${u};">${x}</span>
                    <span style="background:${u};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${C}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;" onclick="event.stopPropagation()">
                    ${v||""}
                    <button onclick="${S}" class="mk-btn-primary"
                        style="padding:7px 16px;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${$}
                    </button>
                </div>
            </div>
            ${ce?"":`
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${de}</tr>
                    </thead>
                    <tbody>${Q}</tbody>
                </table>
            </div>
            ${se}`}
        </div>`}const O=a.filter(t=>!t.deletedAt),D=O.length,ee=O.reduce((t,x)=>{const u=l.get(String(x.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(x):parseInt(x.stock)||0);return t+(Number(x.cost)||0)*Math.max(0,u)},0),J=O.filter(t=>(l.get(String(t.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(t):parseInt(t.stock)||0))<=(t.stockMin||5)).length,ae=O.filter(t=>(!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack")&&Number(t.price)>0),le=ae.length?ae.reduce((t,x)=>{const u=Number(x.price)||0,w=Number(x.cost)||0;return t+(u>0?(u-w)/u*100:0)},0)/ae.length:0;let oe=document.getElementById("invKpiBar");oe||(oe=document.createElement("div"),oe.id="invKpiBar",n.parentNode.insertBefore(oe,n)),oe.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${D}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#9669c4;">$${ee.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${J>0?"#ef4444":"#10b981"};">${J}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${le>=40?"#10b981":le>=20?"#f59e0b":"#ef4444"};">${le.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const pe=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#FFD166",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",extraBtnHTML:'<button type="button" onclick="injectPackModal();openPackModal()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:F,renderFila:P,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",products:B,renderFila:U,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#9669c4",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",extraBtnHTML:'<button type="button" onclick="abrirBulkStockModal()" class="mk-toolbar-btn">\u{1F4E6} Ajustar stock masivo</button>',products:T,renderFila:f,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#7d4fa3",titleBg:"linear-gradient(135deg,#f5f3ff,#f6ecff)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",products:b,renderFila:h,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],ue=(g||c||k).length>0;let fe=!1;for(const t of pe){const x=K(t);x&&(fe=!0);let u=document.getElementById(`invSec_${t.id}`);u||(u=document.createElement("div"),u.id=`invSec_${t.id}`,n.appendChild(u));const w=t.products.length+"_"+t.products.reduce(($,S)=>$+String(S.id),"")+"_"+(window[`_invPage_${t.id}`]||1)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r;u._hash!==w&&(u.innerHTML=x,u._hash=w)}const ge=new Set(pe.map(t=>`invSec_${t.id}`));for(let t=n.children.length-1;t>=0;t--){const x=n.children[t];x.id&&x.id.startsWith("invSec_")&&!ge.has(x.id)&&x.remove()}ue&&!fe&&(n.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(e,o){const r=`_invPage_${e}`,s=window.products||[],i=e==="mp"?s.filter(c=>c.tipo==="materia_prima"):e==="svc"?s.filter(c=>c.tipo==="servicio"):e==="pv"?s.filter(c=>c.tipo==="producto_variable"):s.filter(c=>!c.tipo||c.tipo==="producto"||c.tipo==="producto_interno"||c.tipo==="pack"),n=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",a=(document.getElementById("inventoryTagFilter")||{}).value||"",l=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",d=i.filter(c=>{const k=!n||c.name.toLowerCase().includes(n)||(c.sku||"").toLowerCase().includes(n)||(c.proveedor||"").toLowerCase().includes(n)||(c.notas||"").toLowerCase().includes(n)||(c.tags||[]).some(b=>b.toLowerCase().includes(n)),y=!a||c.tags&&c.tags.includes(a),T=!l||(c.proveedor||"").toLowerCase().includes(l);return k&&y&&T}),g=Math.max(1,Math.ceil(d.length/(window._invPageSize||10)));window[r]=Math.max(1,Math.min(o,g)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(e,o,r,s,i){let n=document.getElementById("inventoryPaginationBar");if(!n){const g=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!g)return;n=document.createElement("div"),n.id="inventoryPaginationBar",g.insertAdjacentElement("afterend",n)}if(o<=1&&r<=i){n.innerHTML="";return}const a=Math.min(s+i,r),l=`Mostrando <b>${s+1}\u2013${a}</b> de <b>${r}</b> productos`;function d(){const g=[],c=(k,y)=>{for(let T=k;T<=y;T++)g.push(T)};return o<=7?c(1,o):(g.push(1),e>4&&g.push("..."),c(Math.max(2,e-2),Math.min(o-1,e+2)),e<o-3&&g.push("..."),g.push(o)),g.map(k=>{if(k==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const y=k===e;return`<button onclick="invGoToPage(${k})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${y?"#FFD166":"#e5e7eb"};
                       background:${y?"#FFD166":"white"};color:${y?"white":"#374151"};
                       font-weight:${y?"700":"500"};font-size:13px;cursor:${y?"default":"pointer"};
                       transition:all 0.15s;"
                ${y?"disabled":""}>${k}</button>`}).join("")}n.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${l}</span>
                <select onchange="invChangePageSize(this.value)"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(g=>`<option value="${g}" ${g===i?"selected":""}>${g} por p\xE1gina</option>`).join("")}
                </select>
            </div>
            <!-- Controles de p\xE1gina -->
            <div style="display:flex;align-items:center;gap:4px;">
                <button onclick="invGoToPage(1)" ${e===1?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${e===1?"default":"pointer"};opacity:${e===1?.4:1};font-size:13px;"
                    title="Primera p\xE1gina">\u27E8\u27E8</button>
                <button onclick="invGoToPage(${e-1})" ${e===1?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${e===1?"default":"pointer"};opacity:${e===1?.4:1};font-size:13px;"
                    title="P\xE1gina anterior">\u2039</button>
                ${d()}
                <button onclick="invGoToPage(${e+1})" ${e===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${e===o?"default":"pointer"};opacity:${e===o?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button onclick="invGoToPage(${o})" ${e===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${e===o?"default":"pointer"};opacity:${e===o?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(e){const o=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(e,o)),renderInventoryTable();const r=document.getElementById("inventoryTable");r&&r.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(e){window._invPageSize=parseInt(e),window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;function _invMpMenu(e,o,r,s){const i=document.getElementById("_invMpMenuDrop");if(i&&(i.remove(),i.dataset.pid===o))return;const n=document.createElement("div");n.id="_invMpMenuDrop",n.dataset.pid=o,n.style.cssText="position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:172px;overflow:hidden;font-size:.78rem;";const a=(d,g)=>`style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:${d};text-align:left;" onmouseover="this.style.background='${g}'" onmouseout="this.style.background='none'"`;n.innerHTML=`
        <button onclick="registrarMerma('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#d97706","#fffbeb")}>\u{1F4C9} Registrar merma</button>
        <button onclick="duplicarProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#9669c4","#f5f3ff")}>\u{1F4CB} Duplicar</button>
        <button onclick="cambiarTipoProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#b45309","#fef9c3")}>\u2192\u{1F4E6} Convertir a PT</button>
        <button onclick="abrirMovimientoProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#4338ca","#eef2ff")}>\u{1F4C8} Ver gr\xE1fica</button>
        ${r?`<button onclick="(()=>{const p=(window.products||[]).find(x=>String(x.id)==='${o}');if(p?.proveedorUrl)window.open(p.proveedorUrl,'_blank');document.getElementById('_invMpMenuDrop')?.remove()})()" ${a("#16a34a","#f0fdf4")}>\u{1F517} Abrir proveedor</button>`:""}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button onclick="archivarProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#6b7280","#f9fafb")}>\u{1F4C1} ${s==="desarchivar"?"Desarchivar":"Archivar"}</button>
        <button onclick="deleteProduct('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#dc2626","#fef2f2")}>\u{1F5D1}\uFE0F Eliminar</button>
    `,document.body.appendChild(n);const l=e.getBoundingClientRect();n.style.top=l.bottom+window.scrollY+4+"px",n.style.left=Math.min(l.left+window.scrollX,window.innerWidth-180)+"px",setTimeout(()=>document.addEventListener("click",function d(g){n.contains(g.target)||(n.remove(),document.removeEventListener("click",d))}),0)}window._invMpMenu=_invMpMenu;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const r=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("movTipoFilter")||{}).value||"";let i=window.stockMovements||[];r&&(i=i.filter(b=>b.productoNombre?.toLowerCase().includes(r)||(b.motivo||"").toLowerCase().includes(r))),s&&(i=i.filter(b=>(b.tipo||"")===s));const n=_fechaHoy(),a=(window.stockMovements||[]).filter(b=>{try{const B=new Date(b.fecha);return B.getFullYear()+"-"+("0"+(B.getMonth()+1)).slice(-2)+"-"+("0"+B.getDate()).slice(-2)===n}catch{return!1}}),l={};a.forEach(b=>{l[b.tipo]=(l[b.tipo]||0)+1});const d={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},g={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let c=document.getElementById("movResumenHoy");c||(c=document.createElement("div"),c.id="movResumenHoy",o.parentNode.insertBefore(c,o));const k=Object.keys(l).map(b=>`${d[b]||"\u26AA"} ${g[b]||b}: <strong>${l[b]}</strong>`);c.innerHTML=k.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${k.join("&nbsp;&nbsp;")}
           </div>`:"";let y=document.getElementById("movExportCSVBtn");if(y||(y=document.createElement("button"),y.id="movExportCSVBtn",y.textContent="\u{1F4E5} Exportar historial CSV",y.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",y.onclick=function(){const b=window.stockMovements||[];let F=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;b.forEach(L=>{const f=[new Date(L.fecha).toLocaleString("es-MX"),L.productoNombre||"",L.tipo||"",L.cantidad,L.motivo||"",L.stockAntes??"",L.stockDespues??""];F+=f.map(h=>`"${String(h).replace(/"/g,'""')}"`).join(",")+`
`});const G=new Blob([F],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(G),z=document.createElement("a");z.href=_,z.download=`movimientos-${n}.csv`,z.click(),URL.revokeObjectURL(_)},o.parentNode.insertBefore(y,o)),!i.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const T={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=i.slice(0,200).map(b=>{const B=new Date(b.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),F=b.cantidad>=0?`+${b.cantidad}`:`${b.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${T[b.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(b.productoNombre||(b.productoId&&!(window.products||[]).find(G=>String(G.id)===String(b.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${B} \xB7 ${b.tipo} \xB7 ${_esc(b.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${b.cantidad>=0?"#10b981":"#ef4444"};">${F} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${b.stockAntes} \u2192 ${b.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){showConfirm("Se borrar\xE1 permanentemente todo el historial de movimientos de inventario.","\xBFBorrar historial?").then(e=>{e&&(window.stockMovements=[],window.stockMovimientos=[],saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").delete().neq("id","00000000-0000-0000-0000-000000000000").then(({error:o})=>{o&&console.warn("[Inv] Error limpiando stock_movements relacional:",o.message)}),renderMovimientos())})}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const e=document.getElementById("movimientosPanel");e&&(e.classList.toggle("hidden"),e.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(e){const o=document.getElementById(e);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const r={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(s=>{const i=new Date(s.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),n=s.cantidad>=0?`+${s.cantidad}`:`${s.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${r[s.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(s.productoNombre||(s.productoId&&!(window.products||[]).find(a=>String(a.id)===String(s.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${i} \xB7 ${s.tipo} \xB7 ${_esc(s.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${s.cantidad>=0?"#10b981":"#ef4444"};">${n} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${s.stockAntes} \u2192 ${s.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(e){const o=(window.products||[]).find(s=>String(s.id)===String(e));if(!o){manekiToastExport("Producto no encontrado","err");return}const r=JSON.parse(JSON.stringify(o));r.id=_genId(),r.name="Copia de "+o.name,r.sku=(o.sku||"")+"-C",r.stock=0,r.historialPrecios=[],r.historialCostos=[],window.products.unshift(r),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${r.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const e=(window.products||[]).filter(a=>!a.tipo||a.tipo==="producto"||a.tipo==="producto_interno"),o=e.map(a=>{const l=a.price>0&&a.cost>0?(a.price-a.cost)/a.price*100:null;return{...a,_margen:l}}).sort((a,l)=>(l._margen??-1/0)-(a._margen??-1/0)),r=o.map((a,l)=>{const d=a._margen!==null?a._margen.toFixed(1)+"%":"\u2014",g=a.price>0&&a.cost>0?"$"+(a.price-a.cost).toFixed(2):"\u2014",c=a._margen===null?"#9ca3af":a._margen>=50?"#16a34a":a._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${l===0?"\u{1F947}":l===1?"\u{1F948}":l===2?"\u{1F949}":`${l+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(a.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(a.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(a.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${g}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${c};font-size:14px;">${d}</td>
        </tr>`}).join(""),s=o.filter(a=>a._margen!==null).reduce((a,l,d,g)=>a+l._margen/g.length,0),i=o[0];let n=document.getElementById("_mkRentabilidadModal");n||(n=document.createElement("div"),n.id="_mkRentabilidadModal",n.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",n.addEventListener("click",a=>{a.target===n&&(n.style.display="none")}),document.body.appendChild(n)),n.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${o.some(a=>a._margen!==null)?s.toFixed(1)+"%":"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">M\xE1s rentable</div>
                    <div style="font-size:.95rem;font-weight:700;color:#16a34a;margin-top:4px;">${i?_esc(i.name):"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Total productos</div>
                    <div style="font-size:1.6rem;font-weight:800;color:#374151;">${e.length}</div>
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
        </div>`,n.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(e){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(e){document.querySelectorAll(".inv-bulk-cb").forEach(r=>{r.checked=e.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(e=>e.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const e=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),e.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${e.length} seleccionado${e.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#9669c4;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(e=>e.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const e=invGetSelectedIds();if(!e.length)return;const o=(window.pedidos||[]).filter(i=>!["cancelado","finalizado"].includes(i.status||"")&&(i.productosInventario||[]).some(n=>e.includes(String(n.id))));if(o.length>0){const i=o.map(a=>a.folio||a.id).slice(0,5).join(", ");if(!(typeof showConfirm=="function"?await showConfirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`,"Productos en pedidos activos"):confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`)))return}if(!(typeof showConfirm=="function"?await showConfirm(`\xBFEliminar ${e.length} producto(s)? Esta acci\xF3n no se puede deshacer.`,"\u{1F5D1} Confirmar eliminaci\xF3n"):confirm(`\xBFEliminar ${e.length} producto(s)? Esta acci\xF3n no se puede deshacer.`)))return;const s=[...e];if(window.products=(window.products||[]).filter(i=>!s.includes(String(i.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",s)}catch(i){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",i)}manekiToastExport(`\u{1F5D1} ${s.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const e=invGetSelectedIds(),o=(window.products||[]).filter(d=>e.includes(String(d.id))),r="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",s=o.map(d=>[d.tipo||"pt",d.name,d.sku||"",d.cost||0,d.price||0,d.stock||0,d.stockMin||5,d.proveedor||"",d.notas||""].map(g=>`"${String(g).replace(/"/g,'""')}"`).join(",")),i="\uFEFF"+r+`
`+s.join(`
`),n=new Blob([i],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(n),l=document.createElement("a");l.href=a,l.download="inventario_seleccion.csv",l.click(),URL.revokeObjectURL(a),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const e=invGetSelectedIds();if(!e.length)return;const o=await new Promise(s=>{const i=document.getElementById("mkBatchCatModal");i&&i.remove();const a=(window.categories||[]).map(d=>`<option value="${d.id}">${d.emoji||""} ${d.name}</option>`).join(""),l=document.createElement("div");l.id="mkBatchCatModal",l.className="mk-modal-overlay",l.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C1} Cambiar categor\xEDa en lote</h3>
          <p style="font-size:.8rem;color:#6b7280;margin-bottom:10px;">${e.length} producto(s) seleccionado(s)</p>
          <select id="mkBatchCatSel" class="mk-input w-full mb-4">
              <option value="">Seleccionar categor\xEDa...</option>
              ${a}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkBatchCatModal').remove();window._mkBCR(null)">Cancelar</button>
              <button type="button" class="mk-btn-primary" onclick="window._mkBCR((document.getElementById('mkBatchCatSel') as HTMLSelectElement).value||null)">Aplicar</button>
          </div>
      </div>`,window._mkBCR=d=>{l.remove(),s(d)},document.body.appendChild(l),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!o)return;const r=(window.categories||[]).find(s=>String(s.id)===String(o));if(!r){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(s=>{e.includes(String(s.id))&&(s.category=r.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${e.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};window._mkInvSetTipo=function(e){const o=document.getElementById("inventoryTipoFilter");o&&(o.value=e,o.dispatchEvent(new Event("change")))},window._mkInvClearOne=function(e){const o=document.getElementById(e);o&&(o.value="",o.dispatchEvent(new Event(e==="inventorySearch"?"input":"change")))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(o=>{const r=document.getElementById(o);r&&(r.value="")});const e=document.getElementById("inventorySearch");e?(e.value="",e.dispatchEvent(new Event("input"))):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const e=document.getElementById("inventoryTipoFilter"),o=document.getElementById("mkInvTipoSeg");!e||!o||o.querySelectorAll("button").forEach(r=>r.classList.toggle("active",r.dataset.v===e.value))}function _mkInvToolbarOnce(){const e=document.getElementById("inventoryTipoFilter"),o=e?.parentElement;if(!(!e||!o)){if(!document.getElementById("mkInvTipoSeg")){e.style.display="none";const r=document.createElement("div");r.id="mkInvTipoSeg",r.className="mk-segmented",r.setAttribute("role","group"),r.setAttribute("aria-label","Tipo de producto"),r.innerHTML=[...e.options].map(s=>{const i=_MK_TIPO_LABELS[s.value]??(s.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${s.value}" onclick="_mkInvSetTipo('${s.value}')">${i}</button>`}).join(""),e.parentElement.insertBefore(r,e)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const r=document.createElement("span");r.id="mkInvDensity",r.style.marginLeft="auto",r.innerHTML=window.mkRenderDensityToggle(),o.appendChild(r),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const r=document.createElement("div");r.id="mkInvFilterInfo",r.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",o.parentElement.insertBefore(r,o.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const r=document.createElement("div");r.id="mkInvHerramientas",r.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",r.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock m\xEDnimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gr\xE1fica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
      <button type="button" onclick="abrirMovimientosRecientes()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Ver \xFAltimos movimientos de inventario"><i class="fas fa-history" style="margin-right:5px;"></i>Movimientos recientes</button>
    `;const s=document.getElementById("mkInvFilterInfo");s?s.parentElement.insertBefore(r,s):o.parentElement.insertBefore(r,o.nextSibling)}}}function _mkInvCounterChips(){const e=document.getElementById("mkInvFilterInfo");if(!e)return;const o=document.getElementById("invDualContainer"),r=o?o.querySelectorAll(".inv-bulk-cb").length:0,s=(window.products||[]).length,i=document.getElementById("inventorySearch"),n=document.getElementById("inventoryTagFilter"),a=document.getElementById("inventoryProveedorFilter"),l=document.getElementById("inventoryTipoFilter"),d=[];i&&i.value.trim()&&d.push(`<span class="mk-filter-chip">Buscar: ${_esc(i.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),l&&l.value&&d.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[l.value]||l.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),n&&n.value&&d.push(`<span class="mk-filter-chip">Tag: ${_esc(n.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),a&&a.value&&d.push(`<span class="mk-filter-chip">Proveedor: ${_esc(a.options[a.selectedIndex]?.text||a.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let g=`<span class="mk-result-count">Mostrando <b>${r}</b> de ${s} producto${s!==1?"s":""}</span>`;d.length&&(g+=`<div class="mk-filter-chips">${d.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),e.innerHTML=g,_mkInvSyncSeg()}function _mkInvSummaryRow(){const e=document.getElementById("invDualContainer");if(!e||!e.parentElement)return;const o=new Set([...e.querySelectorAll(".inv-bulk-cb")].map(l=>String(l.dataset.id))),r=window._invStockCache;let s=0,i=0,n=0;(window.products||[]).forEach(l=>{if(!o.has(String(l.id)))return;n++;const d=r?.get(String(l.id))??(Number(l.stock)||0);s+=(Number(l.cost)||0)*Math.max(0,d),d<=(Number(l.stockMin)||5)&&i++});let a=document.getElementById("mkInvSummary");if(n===0){a&&a.remove();return}a||(a=document.createElement("div"),a.id="mkInvSummary",a.className="mk-table-summary",a.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",e.parentElement.insertBefore(a,e.nextSibling)),a.innerHTML=`<span>Valor en costo: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${n} producto${n!==1?"s":""}</span>`+(i>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${i} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const o=window.renderInventoryTable;if(typeof o!="function"||o._mkWrapped)return;const r=function(...s){const i=o.apply(this,s);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return i};r._mkWrapped=!0,window.renderInventoryTable=r})();function _mkInvModal(e,o,r,s="700px"){let i=document.getElementById(e+"_ov");i||(i=document.createElement("div"),i.id=e+"_ov",i.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(i)),i.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${s};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${o}</h3>
        <button onclick="document.getElementById('${e}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${r}</div>
    </div>`,i.onclick=n=>{n.target===i&&i.remove()},i.style.display="flex"}function abrirConteoFisico(){const e=(window.products||[]).filter(i=>i.tipo!=="servicio"&&i.activo!==!1);if(!e.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const o=_esc,s=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${e.map((i,n)=>{const a=typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0;return`<tr style="${n%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${o(i.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${o(i.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${a}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${a}" data-pid="${o(i.id)}" data-sistema="${a}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",s,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const e=document.querySelectorAll("#mkConteo_ov .conteo-input");let o=0;if(e.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.sistema),n=Number(r.value);if(isNaN(n)||n===i)return;const a=(window.products||[]).find(d=>String(d.id)===String(s));if(!a)return;const l=n-i;a.stock=n,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:a.id,productoNombre:a.name,tipo:l>0?"entrada_manual":"salida_manual",cantidad:Math.abs(l),motivo:"Conteo f\xEDsico",stockAntes:i,stockDespues:n}),o++}),o===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${o} ajuste${o!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const e=(window.products||[]).filter(i=>i.tipo==="servicio"||i.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0)<=(Number(i.stockMin)||5));if(!e.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const o=_esc,r={};e.forEach(i=>{const n=i.proveedor||"Sin proveedor";r[n]||(r[n]=[]),r[n].push(i)});const s=Object.entries(r).map(([i,n])=>{const a=o(i),l=n.map(c=>{const k=typeof getStockEfectivo=="function"?getStockEfectivo(c):Number(c.stock)||0,y=Number(c.stockMin)||5,T=Math.max(1,y*2-k);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${o(c.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${k}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${y}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#FFD166;">${T}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${o(c.unidad||"pza")}</td></tr>`}).join(""),d=encodeURIComponent(`Hola, necesito reabastecer:
${n.map(c=>{const k=Number(c.stock)||0,y=Number(c.stockMin)||5;return`\u2022 ${c.name}: ${Math.max(1,y*2-k)} ${c.unidad||"pza"}`}).join(`
`)}`),g=p?.proveedorUrl?.startsWith("http")?p.proveedorUrl:`https://wa.me/?text=${d}`;return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
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
        <tbody>${l}</tbody>
      </table>
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${e.length} productos`,s,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(e){const r=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(a=>{if(a.tipo==="servicio"||a.activo===!1)return!1;const l=a.proveedor||"Sin proveedor";return e&&l!==e?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(a):Number(a.stock)||0)<=(Number(a.stockMin)||5)}).map(a=>{const l=typeof getStockEfectivo=="function"?getStockEfectivo(a):Number(a.stock)||0,d=Number(a.stockMin)||5;return`"${a.name}",${l},${d},${Math.max(1,d*2-l)},${a.unidad||"pza"},"${a.proveedor||""}"`})].join(`
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([r],{type:"text/csv;charset=utf-8;"}));const i=new Date,n=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;s.download=`reabastecimiento_${n}.csv`,s.click()};function mostrarDonutCategoria(){const e=_esc,o={};(window.products||[]).forEach(l=>{if(l.tipo==="servicio"||l.activo===!1)return;const d=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,g=(Number(l.price)||0)*d,c=l.category||"Sin categor\xEDa";o[c]=(o[c]||0)+g});const r=Object.entries(o).sort((l,d)=>d[1]-l[1]),s=r.reduce((l,[,d])=>l+d,0),i=["#FFD166","#9669c4","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#9669c4","#f97316","#14b8a6"],n=r.map(([l,d],g)=>{const c=s>0?(d/s*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i[g%i.length]};margin-right:6px;"></span>
        ${e(l)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${d.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
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
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",a,"700px"),setTimeout(()=>{const l=document.getElementById("mkDonutCat");if(l)try{const d=window.Chart;if(typeof d>"u"){l.style.display="none";return}new d(l,{type:"doughnut",data:{labels:r.map(([g])=>g),datasets:[{data:r.map(([,g])=>Math.round(g)),backgroundColor:r.map((g,c)=>i[c%i.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{l&&(l.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const e=_esc,o=new Date;o.setDate(o.getDate()-60);const r={};(window.pedidosFinalizados||[]).forEach(a=>{const l=a.fechaFinalizado||a.entrega||"";l&&new Date(l)<o||(a.productosInventario||[]).forEach(d=>{!d.id||d.id==="libre"||(r[String(d.id)]=(r[String(d.id)]||0)+(Number(d.quantity||d.cantidad)||1))})});const s=(window.products||[]).filter(a=>a.tipo!=="servicio"&&a.activo!==!1&&r[String(a.id)]);if(!s.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const n=`
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
      <tbody>${s.map(a=>{const l=r[String(a.id)]||0,d=l/60,g=Math.max(1,Math.ceil(d*14)),c=Number(a.stockMin)||0,k=g!==c?`<span style="color:${g>c?"#10b981":"#f59e0b"};font-weight:700;">${g>c?"\u25B2":"\u25BC"} ${g}</span>`:`<span style="color:#6b7280;">${g} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${e(a.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${c}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${k}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${e(a.id)}" data-nuevo="${g}" class="mkStockMinCb" style="accent-color:#FFD166;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",n,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const e=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let o=0;e.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.nuevo),n=(window.products||[]).find(a=>String(a.id)===String(s));!n||isNaN(i)||(n.stockMin=i,o++)}),o&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${o} producto${o!==1?"s":""}`,"ok"))};function archivarProducto(e){const o=(window.products||[]).find(n=>String(n.id)===String(e));if(!o)return;const r=o.activo!==!1,s=r?"archivar":"desarchivar",i=r?`\xBFArchivar "${o.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${o.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(i,r?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(n=>{n&&(o.activo=!r,o.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(r?`\u{1F4C1} "${o.name}" archivado`:`\u{1F513} "${o.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(e){const o=_esc,r=(window.products||[]).find(f=>String(f.id)===String(e));if(!r){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const s=Date.now()-90*864e5,i=new Set,n=[],a=f=>{if(!f)return;const h=f.fecha?new Date(f.fecha+(f.hora?"T"+f.hora:"")).getTime():f.timestamp?new Date(f.timestamp).getTime():0;if(h&&h<s)return;const P=f.id||String(f.productoId||e)+"_"+h+"_"+(f.cantidad||0);i.has(P)||(i.add(P),n.push({...f,_ts:h||Date.now()}))};(r.movimientos||[]).forEach(a),(window.stockMovimientos||[]).filter(f=>String(f.productoId)===String(e)).forEach(a),n.sort((f,h)=>h._ts-f._ts);const l=[];for(let f=12;f>=0;f--){const h=new Date(Date.now()-f*7*864e5),P=new Date(h.getTime()-7*864e5),U=`${P.getDate()}/${P.getMonth()+1}`;let K=0,O=0;n.forEach(D=>{if(D._ts>=P.getTime()&&D._ts<h.getTime()){const ee=D.stockDespues!=null&&D.stockAntes!=null?Number(D.stockDespues)-Number(D.stockAntes):0,J=(D.tipo||"").toLowerCase();ee>0||J.includes("entrada")||J.includes("compra")||J.includes("ajuste_positivo")?K+=Math.abs(Number(D.cantidad)||Math.abs(ee)||1):O+=Math.abs(Number(D.cantidad)||Math.abs(ee)||1)}}),l.push({label:U,entradas:K,salidas:O})}const d=Math.max(1,...l.map(f=>Math.max(f.entradas,f.salidas))),g=480,c=100,k=Math.floor((g-20)/l.length/2)-1,y=l.map((f,h)=>{const P=10+h*(k*2+4),U=Math.round(f.entradas/d*(c-20)),K=Math.round(f.salidas/d*(c-20));return`
      <rect x="${P}" y="${c-10-U}" width="${k}" height="${U}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${f.entradas}"/>
      <rect x="${P+k+1}" y="${c-10-K}" width="${k}" height="${K}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${f.salidas}"/>
      <text x="${P+k}" y="${c-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${f.label}</text>`}).join(""),T=n.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
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
    </div>`,b={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},B=n.slice(0,30).map(f=>{const h=f.fecha||(f._ts?new Date(f._ts).toLocaleDateString("es-MX"):"\u2014"),P=f.hora||"",U=b[f.tipo||""]||f.tipo||"\u2014",K=f.stockDespues!=null&&f.stockAntes!=null?Number(f.stockDespues)-Number(f.stockAntes):0,O=Number(f.cantidad)||Math.abs(K)||0,D=K>0||(f.tipo||"").includes("entrada")||(f.tipo||"").includes("compra"),ee=D?"#10b981":"#ef4444",J=D?`+${O}`:`-${O}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${o(h)} ${P?`<span style="color:#9ca3af;font-size:.72rem;">${o(P.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${o(U)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${ee};">${J}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${f.stockDespues!=null?f.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o(f.motivo||"")}">${o(f.motivo||"")}</td>
    </tr>`}).join(""),F=typeof getStockEfectivo=="function"?getStockEfectivo(r):Number(r.stock)||0,G=n.reduce((f,h)=>{const P=h.stockDespues!=null&&h.stockAntes!=null?Number(h.stockDespues)-Number(h.stockAntes):0;return f+(P>0||(h.tipo||"").includes("entrada")||(h.tipo||"").includes("compra")?Math.abs(Number(h.cantidad)||Math.abs(P)||0):0)},0),_=n.reduce((f,h)=>{const P=h.stockDespues!=null&&h.stockAntes!=null?Number(h.stockDespues)-Number(h.stockAntes):0,U=P>0||(h.tipo||"").includes("entrada")||(h.tipo||"").includes("compra");return f+(U?0:Math.abs(Number(h.cantidad)||Math.abs(P)||0))},0),z=`
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
        a.href=url;a.download='kardex-${o(r.name||"producto").replace(/[^a-zA-Z0-9]/g,"_")}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('\u{1F4E5} Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        \u{1F4E5} Exportar CSV
      </button>
    </div>
    ${z}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${o(r.name||"Producto")} (90d)`,L,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const e=window.inventarioSnapshots||[];if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const o=[...e].sort((_,z)=>(_.fecha||"").localeCompare(z.fecha||"")),r=o.map(_=>_.fecha||""),s=o.map(_=>Number(_.valorTotal||_.valor||0)),i=540,n=140,a=Math.max(1,...s),l=Math.min(...s),d=a-l||1,c=`<polyline points="${s.map((_,z)=>{const L=20+z/Math.max(1,s.length-1)*(i-40),f=n-20-(_-l)/d*(n-40);return`${L},${f}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,k=s.map((_,z)=>{const L=20+z/Math.max(1,s.length-1)*(i-40),f=n-20-(_-l)/d*(n-40);return`<circle cx="${L}" cy="${f}" r="3.5" fill="#6366f1" opacity=".9"><title>${r[z]}: $${_.toLocaleString("es-MX")}</title></circle>`}).join(""),y=r.filter((_,z)=>z===0||z===r.length-1||z%Math.ceil(r.length/6)===0).map((_,z,L)=>`<text x="${20+r.indexOf(_)/Math.max(1,r.length-1)*(i-40)}" y="${n-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${_.slice(5)}</text>`).join(""),T=s[s.length-1]||0,b=s[0]||0,B=b>0?((T-b)/b*100).toFixed(1):"\u2014",F=Number(B)>=0?"#10b981":"#ef4444",G=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${T.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${F};">${Number(B)>=0?"+":""}${B}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variaci\xF3n total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${o.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${i} ${n}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${n-20}" x2="${i-10}" y2="${n-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${c}${k}${y}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">\u2190 Valor de inventario en costo \xB7 ${o.length} puntos</p>
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",G,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;function abrirMovimientosRecientes(){const e=_esc,o=[...window.stockMovements||window.stockMovimientos||[]].slice(0,50);if(o.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin movimientos registrados a\xFAn","warn");return}const r={ajuste:"#6366f1",entrada:"#10b981",compra:"#10b981",merma:"#ef4444",salida:"#ef4444",descuento:"#f59e0b",produccion:"#f59e0b",conteo:"#3b82f6",ajuste_positivo:"#10b981"},s=o.map(n=>{const a=(n.fecha||"").split("T"),l=a[0]||"",d=(a[1]||"").substring(0,5),g=(n.tipo||"").toLowerCase(),c=n.stockDespues!=null&&n.stockAntes!=null?Number(n.stockDespues)-Number(n.stockAntes):0,k=c>0||g.includes("entrada")||g.includes("compra")||g.includes("ajuste_positivo"),y=Number(n.cantidad)||Math.abs(c)||0,T=k?`<span style="color:#10b981;font-weight:700;">+${y}</span>`:`<span style="color:#ef4444;font-weight:700;">\u2212${y}</span>`,b=r[g]||"#6b7280",B=`<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${b}22;color:${b};font-size:.7rem;font-weight:700;">${e(n.tipo||"\u2014")}</span>`,F=n.productoId?`<button onclick="abrirMovimientoProducto('${e(String(n.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${e(n.productoNombre||n.productoId)}</button>`:`<span style="font-size:.8rem;">${e(n.productoNombre||"\u2014")}</span>`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${e(l)} <span style="color:#9ca3af;font-size:.7rem;">${d}</span></td>
      <td style="padding:6px 10px;">${F}</td>
      <td style="padding:6px 10px;">${B}</td>
      <td style="padding:6px 10px;text-align:center;">${T}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${n.stockDespues!=null?n.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.74rem;color:#9ca3af;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e(n.motivo||"")}">${e(n.motivo||"")}</td>
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
