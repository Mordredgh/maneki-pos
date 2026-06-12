"use strict";function _levenshtein(t,o){const r=t.length,s=o.length,n=Array.from({length:r+1},(i,a)=>Array.from({length:s+1},(l,c)=>c===0?a:0));for(let i=1;i<=s;i++)n[0][i]=i;for(let i=1;i<=r;i++)for(let a=1;a<=s;a++)n[i][a]=t[i-1]===o[a-1]?n[i-1][a-1]:1+Math.min(n[i-1][a],n[i][a-1],n[i-1][a-1]);return n[r][s]}function _fuzzyMatch(t,o,r=2){return t=t.toLowerCase().trim(),o=o.toLowerCase(),!t||o.includes(t)?!0:o.split(/[\s,.-]+/).some(n=>{const i=n.substring(0,t.length+2);return i.length>=t.length-1&&_levenshtein(t,i)<=r})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){if(!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0)return null;let o=1/0;for(const r of t.mpComponentes){const s=(window.products||[]).find(a=>String(a.id)===String(r.id));if(!s)return 0;const n=typeof getStockEfectivo=="function"?getStockEfectivo(s):s.stock||0,i=parseFloat(r.qty)||1;o=Math.min(o,Math.floor(n/i))}return o===1/0?0:o}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",s=>{s.target===t&&(t.style.display="none")}),document.body.appendChild(t));const r=[...new Set((window.products||[]).map(s=>s.category).filter(Boolean))].map(s=>{const n=(window.categories||[]).find(i=>String(i.id)===String(s));return`<option value="${_esc(s)}">${_esc(n?n.emoji?n.emoji+" "+n.name:n.name:s)}</option>`}).join("");t.innerHTML=`
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
                    <input type="checkbox" id="bulkPrecioSoloPT" onchange="bulkPrecioPreview()" style="accent-color:#C5973B;">
                    Solo Productos Terminados
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;">
                    <input type="checkbox" id="bulkPrecioSoloMP" onchange="bulkPrecioPreview()" style="accent-color:#7c3aed;">
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
            <button onclick="bulkPrecioAplicar()"
                style="padding:8px 18px;border:none;border-radius:10px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;">\u2705 Aplicar</button>
        </div>
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,r=document.getElementById("bulkPrecioSoloMP")?.checked||!1,s=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(n=>s&&String(n.category)!==s?!1:o&&r?!0:!(o&&!(!n.tipo||n.tipo==="producto"||n.tipo==="producto_interno"||n.tipo==="pack")||r&&n.tipo!=="materia_prima")).map(n=>{const i=r&&!o?"cost":"price",a=parseFloat(n[i])||0,l=Math.max(0,Math.round(a*(1+t/100)*100)/100);return{p:n,campoKey:i,precioActual:a,precioNuevo:l}}).filter(n=>n.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const o=_bulkPrecioGetAfectados();if(!o.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=o.slice(0,50).map(({p:r,campoKey:s,precioActual:n,precioNuevo:i})=>{const a=i-n,l=a>0?"#16a34a":a<0?"#dc2626":"#6b7280",c=s==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(r.name)}">${_esc(r.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${c}: $${n.toFixed(2)}</span>
            <span style="font-weight:700;color:${l};white-space:nowrap;">\u2192 $${i.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,r=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",s=o>0?"+":"",n=t.slice(0,5).map(({p:i,precioActual:a,precioNuevo:l})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(i.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${a.toFixed(2)}</span>
            <span style="font-weight:700;color:${l>a?"#16a34a":"#dc2626"};">\u2192 $${l.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${s}${o}%</strong> al ${r} de <strong>${t.length}</strong> producto(s):</p>
                ${n}
             </div>`,"\u2705 Confirmar cambio masivo").then(i=>{i&&(t.forEach(({p:a,campoKey:l,precioNuevo:c})=>{a[l]=c,a.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${s}${o}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:i,campoKey:a,precioNuevo:l})=>{i[a]=l,i.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const o=window.products||[],r=document.getElementById("inventoryTipoFilter")?.value||"",s=o.length+"_"+o.reduce((e,m)=>e+Number(m.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+r,n=document.getElementById("invDualContainer");if(n&&n._lastHash===s)return;n&&(n._lastHash=s);let i=document.getElementById("invDualContainer");if(!i){const e=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;i=document.createElement("div"),i.id="invDualContainer",i.style.cssText="display:flex;flex-direction:column;gap:0;",e.parentNode.insertBefore(i,e),e.style.display="none"}const a=window.products||[],l=new Map(a.map(e=>[String(e.id),typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0]));window._invStockCache=l;const c=window.productMap||new Map(a.map(e=>[String(e.id),e])),f=new Map;for(const e of a)e.mpComponentes&&e.mpComponentes.length>0&&f.set(String(e.id),calcularDisponibilidadDesdeMP(e,c,l));if(typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const e=document.createElement("style");e.id="invExtraColStyles",e.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(e)}let d=document.getElementById("invExtraColToggle");if(d||(d=document.createElement("button"),d.id="invExtraColToggle",d.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",d.textContent="Mostrar SKU/Proveedor",d.addEventListener("click",()=>{const e=document.getElementById("invDualContainer");if(!e)return;const m=e.classList.toggle("inv-show-extra");d.textContent=m?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),i.parentNode.insertBefore(d,i)),a.length===0){i.innerHTML=`
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
        </div>`;return}const h=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",w=(document.getElementById("inventoryTagFilter")||{}).value||"",T=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function b(e){const m=window._normSearch||(y=>String(y||"").toLowerCase()),g=m(h),k=m(T),$=y=>!w||y.tags&&y.tags.includes(w),E=y=>!T||m(y.proveedor||"").includes(k);if(!h)return e.filter(y=>$(y)&&E(y));const S=e.filter(y=>(m(y.name).includes(g)||m(y.sku||"").includes(g)||m(y.proveedor||"").includes(g)||m(y.notas||"").includes(g)||(y.tags||[]).some(V=>m(V).includes(g)))&&$(y)&&E(y));return S.length>0?S:e.filter(y=>(_fuzzyMatch(g,y.name||"")||_fuzzyMatch(g,y.sku||"")||_fuzzyMatch(g,y.proveedor||""))&&$(y)&&E(y))}const H=b(a.filter(e=>e.tipo==="materia_prima")),q=b(a.filter(e=>e.tipo==="servicio")),ee=b(a.filter(e=>e.tipo==="producto_variable")),Y=b(a.filter(e=>!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack"));function Q(e){if(!window._invSortCol)return e;const m=window._invSortCol,g=window._invSortDir;return[...e].sort((k,$)=>{let E,S;return m==="name"?(E=(k.name||"").toLowerCase(),S=($.name||"").toLowerCase()):m==="sku"?(E=(k.sku||"").toLowerCase(),S=($.sku||"").toLowerCase()):m==="category"?(E=(k.category||"").toLowerCase(),S=($.category||"").toLowerCase()):m==="price"?(E=Number(k.price)||0,S=Number($.price)||0):m==="stock"?(E=Number(k.stock)||0,S=Number($.stock)||0):m==="margin"&&(E=k.cost&&k.price?(k.price-k.cost)/k.price:-1,S=$.cost&&$.price?($.price-$.cost)/$.price:-1),E<S?g==="asc"?-1:1:E>S?g==="asc"?1:-1:0})}function u(e,m){const g=String(e.id),k=l.get(g)??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0),$=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3ED}"}</span>`;let E;k===0?E='<span class="badge-danger">Agotado</span>':k<=(e.stockMin||5)?E='<span class="badge-warning">Bajo Stock</span>':E='<span class="badge-success">Disponible</span>';const S=(window.categories||[]).find(j=>j.id===e.category),y=S?S.name:e.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${g}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.historialCostos&&e.historialCostos.length?`<span title="Este producto ha tenido ${e.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#7c3aed;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialCostos.length} cambio${e.historialCostos.length>1?"s":""}</span>`:""}
                    ${e.compraPaquete?`<div style="font-size:10px;color:#7c3aed;margin-top:2px;">\u{1F4E6} Paquete: ${e.compraPaquete.cantidad} uds \xB7 $${Number(e.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(j=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#7c3aed;border:1px solid #e9d5ff;">${_esc(j)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(y)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(e.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${g}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${g}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${k} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(e.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${E}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${g}')" title="Editar" aria-label="Editar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button type="button" onclick="ajustarStock('${g}')" title="Ajustar stock" aria-label="Ajustar stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4E6}</button>
                    <button type="button" onclick="duplicarProducto('${g}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button type="button" onclick="registrarMerma('${g}')" title="Registrar merma/p\xE9rdida" aria-label="Registrar merma"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C9}</button>
                    ${e.proveedorUrl?`<button type="button" onclick="window.open(this.dataset.url,'_blank')" data-url="${_esc(e.proveedorUrl)}" title="Abrir proveedor" aria-label="Abrir proveedor" style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F517}</button>`:""}
                    <button type="button" onclick="cambiarTipoProducto('${g}')" title="Convertir a Producto Terminado" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F4E6}</button>
                    <button type="button" onclick="abrirMovimientoProducto('${g}')" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C8}</button>
                    <button type="button" onclick="deleteProduct('${g}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function v(e,m){const g=String(e.id),k=`<span style="font-size:1.6rem;">${e.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${g}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map($=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc($)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${g}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="deleteProduct('${g}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function M(e,m){const g=String(e.id),k=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F4E6}"}</span>`,$=(window.categories||[]).find(x=>x.id===e.category),E=$?$.name:e.category||"",S=f.get(g)??null;let y,j;if(S!==null){const x=S.piezas,P=x===0?"#ef4444":x<=3?"#f59e0b":"#10b981",I=x===0?"#fee2e2":x<=3?"#fef3c7":"#d1fae5",L=S.detalle.map(D=>`${D.nombre}: ${D.stock}\xF7${D.qty}=${D.posibles}pzs`).join(" | ");y=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(L)}"
                        style="padding:3px 12px;border-radius:8px;background:${I};color:${P};
                               font-weight:700;font-size:.95rem;border:1px solid ${P}33;cursor:help;">
                        ${x}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,j=x===0?'<span class="badge-danger">Sin stock MP</span>':x<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const x=l.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0),P=e.stockMin||5,I=x===0?"#ef4444":x<=P?"#f59e0b":"#10b981";y=`<span style="padding:3px 12px;border-radius:8px;background:${x===0?"#fee2e2":x<=P?"#fef3c7":"#d1fae5"};color:${I};font-weight:700;font-size:.95rem;">${x}</span>`,j=x===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Agotado</span>':x<=P?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Disponible</span>'}const V=e.variants&&e.variants.length>0?e.variants.map(x=>`
                <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f3f4f6;border-radius:8px;font-size:11px;margin:1px;">
                    <b>${_esc(x.type)}:</b>${_mkColorDot(x.type,_esc(x.value))}
                    <span style="background:#e0f2fe;color:#0369a1;padding:0 4px;border-radius:99px;font-weight:600;">${x.qty??0}</span>
                </span>`).join(""):'<span class="text-xs text-gray-400">Sin variantes</span>',N=Number(e.cost)||0,J=Number(e.price)||0,W=N&&J?(()=>{const x=(J-N)/J*100,P=x>=40?"#10b981":x>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${P};">${x.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,x).toFixed(0)}%;background:${P};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${g}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${e.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${e.tipo==="pack"&&e.packComponentes&&e.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${e.packComponentes.map(x=>`${x.qty>1?x.qty+"\xD7 ":""}${_esc(x.nombre)}`).join(" + ")}</div>`:""}
                    ${e.historialPrecios&&e.historialPrecios.length?`<span title="Este producto ha tenido ${e.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialPrecios.length} cambio${e.historialPrecios.length>1?"s":""}</span>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(e.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(e.proveedorNombre)}</b>${e.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(x=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(x)}</span>`).join("")}</div>`:""}
                    ${(()=>{const x=calcularProducibles(e);if(x===null)return"";const P=x>=5?"#16a34a":x>=1?"#d97706":"#dc2626",I=x>=5?"#d1fae5":x>=1?"#fef3c7":"#fee2e2",L=x===0?"Sin stock MP":`Producibles: ${x}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${I};color:${P};border:1px solid ${P}33;">\u{1F3ED} ${L}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(E)}</td>
            <td class="px-4 py-3">${V}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${g}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(e.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${g}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${y}</td>
            <td class="px-4 py-3">${j}</td>
            <td class="px-4 py-3">${W}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${e.tipo==="pack"?`<button type="button" onclick="openPackModal('${g}')" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`:`<button type="button" onclick="editProduct('${g}')" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`}
                    <button type="button" onclick="duplicarProducto('${g}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    ${e.tipo!=="pack"?`<button type="button" onclick="cambiarTipoProducto('${g}')" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${e.movimientos&&e.movimientos.length?`<button type="button" onclick="verMovimientosProducto('${g}')" title="Ver movimientos de stock (${e.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>`:""}
                    <button type="button" onclick="abrirMovimientoProducto('${g}')" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C8}</button>
                    <button type="button" onclick="deleteProduct('${g}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function R(e,m){const g=String(e.id),k=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3AF}"}</span>`,$=(e.tablaPreciosVariable||[]).slice().sort((z,O)=>z.cantidadMin-O.cantidadMin),E=$.length?$.map(z=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${z.cantidadMin} pzas = $${Number(z.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',S=(e.mpComponentes||[]).length,y=(window.categories||[]).find(z=>String(z.id)===String(e.category)),j=y?`${y.emoji||""} ${y.name}`:"\u2014",V=$,N=V.length?V[0].precio/(V[0].cantidadMin||1):0,J=N>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${N.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',W=f.get(String(e.id))??null;let x,P;if(W!==null){const z=W.piezas,O=z===0?"#ef4444":z<=3?"#f59e0b":"#10b981",se=z===0?"#fee2e2":z<=3?"#fef3c7":"#d1fae5",ae=W.detalle.map(C=>`${C.nombre}: ${C.stock}\xF7${C.qty}=${C.posibles}pzs`).join(" | ");x=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(ae)}" style="padding:3px 12px;border-radius:8px;background:${se};color:${O};font-weight:700;font-size:.95rem;border:1px solid ${O}33;cursor:help;">${z}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,P=z===0?'<span class="badge-danger">Sin stock MP</span>':z<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else x='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',P='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const I=(e.mpComponentes||[]).reduce((z,O)=>z+(parseFloat(O.costUnit)||0)*(parseFloat(O.qty)||1),0),L=e.rendimientoPorHoja||1,D=L>0?I/L:I,F=N>0?Math.round((N-D)/N*100):0,_=F>=40?"#10b981":F>=20?"#f59e0b":"#ef4444",Z=N>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${_};">${F}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,F)}%;background:${_};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${g}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${k}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${e.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${e.rendimientoPorHoja} uds/hoja \xB7 ${S} MP${S!==1?"s":""}</div>`:S>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${S} MP${S!==1?"s":""}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(z=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(z)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(j)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${E}</div></td>
            <td class="px-4 py-3 text-right">${J}</td>
            <td class="px-4 py-3">${x}</td>
            <td class="px-4 py-3">${P}</td>
            <td class="px-4 py-3">${Z}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${g}')" title="Editar" aria-label="Editar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button type="button" onclick="duplicarProducto('${g}')" title="Duplicar" aria-label="Duplicar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button type="button" onclick="deleteProduct('${g}')" title="Eliminar" aria-label="Eliminar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function U({id:e,title:m,titleColor:g,titleBg:k,btnLabel:$,btnOnclick:E,btnColor:S,extraBtnHTML:y,products:j,renderFila:V,headers:N,emptyMsg:J}){const W=document.getElementById("inventoryTipoFilter")?.value||"";if(W==="materia"&&e!=="mp"||W==="producto"&&e==="mp")return"";const x=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(j.length===0&&x)return"";const P=Q(j),I=`_invPage_${e}`,L=window._invPageSize||10;window[I]=window[I]||1;const D=P.length,F=Math.max(1,Math.ceil(D/L));window[I]>F&&(window[I]=1);const _=window[I],Z=(_-1)*L,z=P.slice(Z,Z+L),O=z.length===0?`<tr><td colspan="${N.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${J}</td></tr>`:z.map((C,oe)=>V(C,oe)).join(""),se=N.map(C=>{const oe=C.colId==="sku"?" inv-col-hidden-sku":C.colId==="proveedor"?" inv-col-hidden-prov":"",ne=C.align==="right"?" text-right":" text-left";return C.sortKey?`<th class="px-4 py-3${ne} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${oe}" onclick="sortInventory('${C.sortKey}')" style="white-space:nowrap;">${C.label} \u2195</th>`:`<th class="px-4 py-3${ne} text-xs font-semibold text-gray-500 uppercase tracking-wide${oe}" style="white-space:nowrap;">${C.label}</th>`}).join("");let ae="";if(F>1||D>L){const C=Math.min(Z+L,D);ae=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${Z+1}\u2013${C}</b> de <b>${D}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${e}',${_-1})" ${_<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${_<=1?"default":"pointer"};opacity:${_<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,F)},(oe,ne)=>{let A=_<=3?ne+1:_+ne-2;return A<1&&(A=null),A>F&&(A=null),A===null?"":`<button onclick="invSectionPage('${e}',${A})" style="min-width:30px;padding:4px 8px;border:1px solid ${A===_?"#C5973B":"#e5e7eb"};border-radius:7px;background:${A===_?"#C5973B":"#fff"};color:${A===_?"#fff":"#374151"};font-weight:${A===_?700:400};font-size:13px;cursor:${A===_?"default":"pointer"};" ${A===_?"disabled":""}>${A}</button>`}).join("")}
                    <button onclick="invSectionPage('${e}',${_+1})" ${_>=F?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${_>=F?"default":"pointer"};opacity:${_>=F?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${g}33;box-shadow:0 2px 12px ${g}11;">
            <!-- Header de secci\xF3n -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:${k};border-bottom:1.5px solid ${g}33;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;font-weight:800;color:${g};">${m}</span>
                    <span style="background:${g};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${D}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${y||""}
                    <button onclick="${E}"
                        style="padding:7px 16px;background:${S};color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${$}
                    </button>
                </div>
            </div>
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${se}</tr>
                    </thead>
                    <tbody>${O}</tbody>
                </table>
            </div>
            ${ae}
        </div>`}const K=a.filter(e=>!e.deletedAt),B=K.length,X=K.reduce((e,m)=>{const g=l.get(String(m.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(m):parseInt(m.stock)||0);return e+(Number(m.cost)||0)*Math.max(0,g)},0),G=K.filter(e=>(l.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0))<=(e.stockMin||5)).length,ie=K.filter(e=>(!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")&&Number(e.price)>0),re=ie.length?ie.reduce((e,m)=>{const g=Number(m.price)||0,k=Number(m.cost)||0;return e+(g>0?(g-k)/g*100:0)},0)/ie.length:0;let te=document.getElementById("invKpiBar");te||(te=document.createElement("div"),te.id="invKpiBar",i.parentNode.insertBefore(te,i)),te.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${B}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#7c3aed;">$${X.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${G>0?"#ef4444":"#10b981"};">${G}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${re>=40?"#10b981":re>=20?"#f59e0b":"#ef4444"};">${re.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const le=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#C5973B",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",extraBtnHTML:'<button type="button" onclick="injectPackModal();openPackModal()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:Y,renderFila:M,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:ee,renderFila:R,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#7c3aed",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:H,renderFila:u,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#6d28d9",titleBg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:q,renderFila:v,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],ce=(h||w||T).length>0;let de=!1;for(const e of le){const m=U(e);m&&(de=!0);let g=document.getElementById(`invSec_${e.id}`);g||(g=document.createElement("div"),g.id=`invSec_${e.id}`,i.appendChild(g));const k=e.products.length+"_"+e.products.reduce(($,E)=>$+String(E.id),"")+"_"+(window[`_invPage_${e.id}`]||1)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r;g._hash!==k&&(g.innerHTML=m,g._hash=k)}const pe=new Set(le.map(e=>`invSec_${e.id}`));for(let e=i.children.length-1;e>=0;e--){const m=i.children[e];m.id&&m.id.startsWith("invSec_")&&!pe.has(m.id)&&m.remove()}ce&&!de&&(i.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                style="padding:10px 22px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:.875rem;font-weight:700;cursor:pointer;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(t,o){const r=`_invPage_${t}`,s=window.products||[],n=t==="mp"?s.filter(d=>d.tipo==="materia_prima"):t==="svc"?s.filter(d=>d.tipo==="servicio"):t==="pv"?s.filter(d=>d.tipo==="producto_variable"):s.filter(d=>!d.tipo||d.tipo==="producto"||d.tipo==="producto_interno"||d.tipo==="pack"),i=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",a=(document.getElementById("inventoryTagFilter")||{}).value||"",l=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",c=n.filter(d=>{const h=!i||d.name.toLowerCase().includes(i)||(d.sku||"").toLowerCase().includes(i)||(d.proveedor||"").toLowerCase().includes(i)||(d.notas||"").toLowerCase().includes(i)||(d.tags||[]).some(b=>b.toLowerCase().includes(i)),w=!a||d.tags&&d.tags.includes(a),T=!l||(d.proveedor||"").toLowerCase().includes(l);return h&&w&&T}),f=Math.max(1,Math.ceil(c.length/(window._invPageSize||10)));window[r]=Math.max(1,Math.min(o,f)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,o,r,s,n){let i=document.getElementById("inventoryPaginationBar");if(!i){const f=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!f)return;i=document.createElement("div"),i.id="inventoryPaginationBar",f.insertAdjacentElement("afterend",i)}if(o<=1&&r<=n){i.innerHTML="";return}const a=Math.min(s+n,r),l=`Mostrando <b>${s+1}\u2013${a}</b> de <b>${r}</b> productos`;function c(){const f=[],d=(h,w)=>{for(let T=h;T<=w;T++)f.push(T)};return o<=7?d(1,o):(f.push(1),t>4&&f.push("..."),d(Math.max(2,t-2),Math.min(o-1,t+2)),t<o-3&&f.push("..."),f.push(o)),f.map(h=>{if(h==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const w=h===t;return`<button onclick="invGoToPage(${h})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${w?"#C5973B":"#e5e7eb"};
                       background:${w?"#C5973B":"white"};color:${w?"white":"#374151"};
                       font-weight:${w?"700":"500"};font-size:13px;cursor:${w?"default":"pointer"};
                       transition:all 0.15s;"
                ${w?"disabled":""}>${h}</button>`}).join("")}i.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${l}</span>
                <select onchange="invChangePageSize(this.value)"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(f=>`<option value="${f}" ${f===n?"selected":""}>${f} por p\xE1gina</option>`).join("")}
                </select>
            </div>
            <!-- Controles de p\xE1gina -->
            <div style="display:flex;align-items:center;gap:4px;">
                <button onclick="invGoToPage(1)" ${t===1?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===1?"default":"pointer"};opacity:${t===1?.4:1};font-size:13px;"
                    title="Primera p\xE1gina">\u27E8\u27E8</button>
                <button onclick="invGoToPage(${t-1})" ${t===1?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===1?"default":"pointer"};opacity:${t===1?.4:1};font-size:13px;"
                    title="P\xE1gina anterior">\u2039</button>
                ${c()}
                <button onclick="invGoToPage(${t+1})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button onclick="invGoToPage(${o})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const o=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(t,o)),renderInventoryTable();const r=document.getElementById("inventoryTable");r&&r.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){window._invPageSize=parseInt(t),window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const r=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("movTipoFilter")||{}).value||"";let n=window.stockMovements||[];r&&(n=n.filter(b=>b.productoNombre?.toLowerCase().includes(r)||(b.motivo||"").toLowerCase().includes(r))),s&&(n=n.filter(b=>(b.tipo||"")===s));const i=_fechaHoy?_fechaHoy():new Date().toISOString().split("T")[0],a=(window.stockMovements||[]).filter(b=>{try{const H=new Date(b.fecha);return H.getFullYear()+"-"+("0"+(H.getMonth()+1)).slice(-2)+"-"+("0"+H.getDate()).slice(-2)===i}catch{return!1}}),l={};a.forEach(b=>{l[b.tipo]=(l[b.tipo]||0)+1});const c={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},f={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let d=document.getElementById("movResumenHoy");d||(d=document.createElement("div"),d.id="movResumenHoy",o.parentNode.insertBefore(d,o));const h=Object.keys(l).map(b=>`${c[b]||"\u26AA"} ${f[b]||b}: <strong>${l[b]}</strong>`);d.innerHTML=h.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${h.join("&nbsp;&nbsp;")}
           </div>`:"";let w=document.getElementById("movExportCSVBtn");if(w||(w=document.createElement("button"),w.id="movExportCSVBtn",w.textContent="\u{1F4E5} Exportar historial CSV",w.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",w.onclick=function(){const b=window.stockMovements||[];let q=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;b.forEach(u=>{const v=[new Date(u.fecha).toLocaleString("es-MX"),u.productoNombre||"",u.tipo||"",u.cantidad,u.motivo||"",u.stockAntes??"",u.stockDespues??""];q+=v.map(M=>`"${String(M).replace(/"/g,'""')}"`).join(",")+`
`});const ee=new Blob([q],{type:"text/csv;charset=utf-8;"}),Y=URL.createObjectURL(ee),Q=document.createElement("a");Q.href=Y,Q.download=`movimientos-${i}.csv`,Q.click(),URL.revokeObjectURL(Y)},o.parentNode.insertBefore(w,o)),!n.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const T={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=n.slice(0,200).map(b=>{const H=new Date(b.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),q=b.cantidad>=0?`+${b.cantidad}`:`${b.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${T[b.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(b.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${H} \xB7 ${b.tipo} \xB7 ${_esc(b.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${b.cantidad>=0?"#10b981":"#ef4444"};">${q} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${b.stockAntes} \u2192 ${b.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){confirm("\xBFBorrar todo el historial de movimientos?")&&(window.stockMovements=[],saveStockMovements(),renderMovimientos())}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const o=document.getElementById(t);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const r={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(s=>{const n=new Date(s.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),i=s.cantidad>=0?`+${s.cantidad}`:`${s.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${r[s.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(s.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${n} \xB7 ${s.tipo} \xB7 ${_esc(s.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${s.cantidad>=0?"#10b981":"#ef4444"};">${i} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${s.stockAntes} \u2192 ${s.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const o=(window.products||[]).find(s=>String(s.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const r=JSON.parse(JSON.stringify(o));r.id=_genId(),r.name="Copia de "+o.name,r.sku=(o.sku||"")+"-C",r.stock=0,r.historialPrecios=[],r.historialCostos=[],window.products.unshift(r),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${r.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(a=>!a.tipo||a.tipo==="producto"||a.tipo==="producto_interno"),o=t.map(a=>{const l=a.price>0&&a.cost>0?(a.price-a.cost)/a.price*100:null;return{...a,_margen:l}}).sort((a,l)=>(l._margen??-1/0)-(a._margen??-1/0)),r=o.map((a,l)=>{const c=a._margen!==null?a._margen.toFixed(1)+"%":"\u2014",f=a.price>0&&a.cost>0?"$"+(a.price-a.cost).toFixed(2):"\u2014",d=a._margen===null?"#9ca3af":a._margen>=50?"#16a34a":a._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${l===0?"\u{1F947}":l===1?"\u{1F948}":l===2?"\u{1F949}":`${l+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(a.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(a.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(a.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${f}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${d};font-size:14px;">${c}</td>
        </tr>`}).join(""),s=o.filter(a=>a._margen!==null).reduce((a,l,c,f)=>a+l._margen/f.length,0),n=o[0];let i=document.getElementById("_mkRentabilidadModal");i||(i=document.createElement("div"),i.id="_mkRentabilidadModal",i.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",i.addEventListener("click",a=>{a.target===i&&(i.style.display="none")}),document.body.appendChild(i)),i.innerHTML=`
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
                    <tbody>${r||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,i.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(r=>{r.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),t.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#7c3aed;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const o=(window.pedidos||[]).filter(s=>!["cancelado","finalizado"].includes(s.status||"")&&(s.productosInventario||[]).some(n=>t.includes(String(n.id))));if(o.length>0){const s=o.map(n=>n.folio||n.id).slice(0,5).join(", ");if(!confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${s}). \xBFEliminar de todas formas?`))return}if(!confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`))return;const r=[...t];if(window.products=(window.products||[]).filter(s=>!r.includes(String(s.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",r)}catch(s){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",s)}manekiToastExport(`\u{1F5D1} ${r.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),o=(window.products||[]).filter(c=>t.includes(String(c.id))),r="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",s=o.map(c=>[c.tipo||"pt",c.name,c.sku||"",c.cost||0,c.price||0,c.stock||0,c.stockMin||5,c.proveedor||"",c.notas||""].map(f=>`"${String(f).replace(/"/g,'""')}"`).join(",")),n="\uFEFF"+r+`
`+s.join(`
`),i=new Blob([n],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(i),l=document.createElement("a");l.href=a,l.download="inventario_seleccion.csv",l.click(),URL.revokeObjectURL(a),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const o=await new Promise(s=>{const n=document.getElementById("mkBatchCatModal");n&&n.remove();const a=(window.categories||[]).map(c=>`<option value="${c.id}">${c.emoji||""} ${c.name}</option>`).join(""),l=document.createElement("div");l.id="mkBatchCatModal",l.className="mk-modal-overlay",l.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
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
      </div>`,window._mkBCR=c=>{l.remove(),s(c)},document.body.appendChild(l),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!o)return;const r=(window.categories||[]).find(s=>String(s.id)===String(o));if(!r){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(s=>{t.includes(String(s.id))&&(s.category=r.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};window._mkInvSetTipo=function(t){const o=document.getElementById("inventoryTipoFilter");o&&(o.value=t,o.dispatchEvent(new Event("change")))},window._mkInvClearOne=function(t){const o=document.getElementById(t);o&&(o.value="",o.dispatchEvent(new Event(t==="inventorySearch"?"input":"change")))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(o=>{const r=document.getElementById(o);r&&(r.value="")});const t=document.getElementById("inventorySearch");t?(t.value="",t.dispatchEvent(new Event("input"))):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),o=document.getElementById("mkInvTipoSeg");!t||!o||o.querySelectorAll("button").forEach(r=>r.classList.toggle("active",r.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),o=t?.parentElement;if(!(!t||!o)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const r=document.createElement("div");r.id="mkInvTipoSeg",r.className="mk-segmented",r.setAttribute("role","group"),r.setAttribute("aria-label","Tipo de producto"),r.innerHTML=[...t.options].map(s=>{const n=_MK_TIPO_LABELS[s.value]??(s.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${s.value}" onclick="_mkInvSetTipo('${s.value}')">${n}</button>`}).join(""),t.parentElement.insertBefore(r,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const r=document.createElement("span");r.id="mkInvDensity",r.style.marginLeft="auto",r.innerHTML=window.mkRenderDensityToggle(),o.appendChild(r),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const r=document.createElement("div");r.id="mkInvFilterInfo",r.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",o.parentElement.insertBefore(r,o.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const r=document.createElement("div");r.id="mkInvHerramientas",r.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",r.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario">\u{1F4CB} Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor">\u{1F6D2} Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa">\u{1F4CA} Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos">\u{1F916} Stock m\xEDnimo</button>
    `;const s=document.getElementById("mkInvFilterInfo");s?s.parentElement.insertBefore(r,s):o.parentElement.insertBefore(r,o.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const o=document.getElementById("invDualContainer"),r=o?o.querySelectorAll(".inv-bulk-cb").length:0,s=(window.products||[]).length,n=document.getElementById("inventorySearch"),i=document.getElementById("inventoryTagFilter"),a=document.getElementById("inventoryProveedorFilter"),l=document.getElementById("inventoryTipoFilter"),c=[];n&&n.value.trim()&&c.push(`<span class="mk-filter-chip">Buscar: ${_esc(n.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),l&&l.value&&c.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[l.value]||l.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),i&&i.value&&c.push(`<span class="mk-filter-chip">Tag: ${_esc(i.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),a&&a.value&&c.push(`<span class="mk-filter-chip">Proveedor: ${_esc(a.options[a.selectedIndex]?.text||a.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let f=`<span class="mk-result-count">Mostrando <b>${r}</b> de ${s} producto${s!==1?"s":""}</span>`;c.length&&(f+=`<div class="mk-filter-chips">${c.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=f,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const o=new Set([...t.querySelectorAll(".inv-bulk-cb")].map(l=>String(l.dataset.id))),r=window._invStockCache;let s=0,n=0,i=0;(window.products||[]).forEach(l=>{if(!o.has(String(l.id)))return;i++;const c=r?.get(String(l.id))??(Number(l.stock)||0);s+=(Number(l.cost)||0)*Math.max(0,c),c<=(Number(l.stockMin)||5)&&n++});let a=document.getElementById("mkInvSummary");if(i===0){a&&a.remove();return}a||(a=document.createElement("div"),a.id="mkInvSummary",a.className="mk-table-summary",a.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(a,t.nextSibling)),a.innerHTML=`<span>Valor en costo: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${i} producto${i!==1?"s":""}</span>`+(n>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${n} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const o=window.renderInventoryTable;if(typeof o!="function"||o._mkWrapped)return;const r=function(...s){const n=o.apply(this,s);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return n};r._mkWrapped=!0,window.renderInventoryTable=r})();function _mkInvModal(t,o,r,s="700px"){let n=document.getElementById(t+"_ov");n||(n=document.createElement("div"),n.id=t+"_ov",n.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(n)),n.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${s};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${o}</h3>
        <button onclick="document.getElementById('${t}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${r}</div>
    </div>`,n.onclick=i=>{i.target===n&&n.remove()},n.style.display="flex"}function abrirConteoFisico(){const t=(window.products||[]).filter(n=>n.tipo!=="servicio"&&n.activo!==!1);if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const o=typeof window._esc=="function"?window._esc:n=>String(n||""),s=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${t.map((n,i)=>{const a=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0;return`<tr style="${i%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${o(n.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${o(n.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${a}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${a}" data-pid="${o(n.id)}" data-sistema="${a}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" style="padding:9px 24px;border-radius:10px;background:linear-gradient(135deg,#C5A572,#a8864f);color:white;border:none;cursor:pointer;font-weight:700;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",s,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const t=document.querySelectorAll("#mkConteo_ov .conteo-input");let o=0;if(t.forEach(r=>{const s=r.dataset.pid,n=Number(r.dataset.sistema),i=Number(r.value);if(isNaN(i)||i===n)return;const a=(window.products||[]).find(c=>String(c.id)===String(s));if(!a)return;const l=i-n;a.stock=i,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:a.id,productoNombre:a.name,tipo:l>0?"entrada_manual":"salida_manual",cantidad:Math.abs(l),motivo:"Conteo f\xEDsico",stockAntes:n,stockDespues:i}),o++}),o===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${o} ajuste${o!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const t=(window.products||[]).filter(n=>n.tipo==="servicio"||n.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5));if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const o=typeof window._esc=="function"?window._esc:n=>String(n||""),r={};t.forEach(n=>{const i=n.proveedor||"Sin proveedor";r[i]||(r[i]=[]),r[i].push(n)});const s=Object.entries(r).map(([n,i])=>{const a=o(n),l=i.map(d=>{const h=typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0,w=Number(d.stockMin)||5,T=Math.max(1,w*2-h);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${o(d.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${h}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${w}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#C5A572;">${T}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${o(d.unidad||"pza")}</td></tr>`}).join(""),c=encodeURIComponent(`Hola, necesito reabastecer:
${i.map(d=>{const h=Number(d.stock)||0,w=Number(d.stockMin)||5;return`\u2022 ${d.name}: ${Math.max(1,w*2-h)} ${d.unidad||"pza"}`}).join(`
`)}`),f=p?.proveedorUrl?.startsWith("http")?p.proveedorUrl:`https://wa.me/?text=${c}`;return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${a} (${i.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:
${i.map(d=>`\u2022 ${d.name}: ${Math.max(1,(Number(d.stockMin)||5)*2-(typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0))} ${d.unidad||"pza"}`).join(`
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
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${t.length} productos`,s,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(t){const r=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(n=>{if(n.tipo==="servicio"||n.activo===!1)return!1;const i=n.proveedor||"Sin proveedor";return t&&i!==t?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5)}).map(n=>{const i=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0,a=Number(n.stockMin)||5;return`"${n.name}",${i},${a},${Math.max(1,a*2-i)},${n.unidad||"pza"},"${n.proveedor||""}"`})].join(`
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([r],{type:"text/csv;charset=utf-8;"})),s.download=`reabastecimiento_${new Date().toISOString().split("T")[0]}.csv`,s.click()};function mostrarDonutCategoria(){const t=typeof window._esc=="function"?window._esc:l=>String(l||""),o={};(window.products||[]).forEach(l=>{if(l.tipo==="servicio"||l.activo===!1)return;const c=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,f=(Number(l.price)||0)*c,d=l.category||"Sin categor\xEDa";o[d]=(o[d]||0)+f});const r=Object.entries(o).sort((l,c)=>c[1]-l[1]),s=r.reduce((l,[,c])=>l+c,0),n=["#C5A572","#7c3aed","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#f97316","#14b8a6"],i=r.map(([l,c],f)=>{const d=s>0?(c/s*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${n[f%n.length]};margin-right:6px;"></span>
        ${t(l)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${c.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${d}%</td>
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
        <tbody>${i}</tbody>
        <tfoot><tr style="border-top:2px solid #e5e7eb;font-weight:800;">
          <td style="padding:8px 12px;">Total</td>
          <td style="padding:8px 12px;text-align:right;">$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
          <td style="padding:8px 12px;text-align:right;">100%</td>
        </tr></tfoot>
      </table>
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",a,"700px"),setTimeout(()=>{const l=document.getElementById("mkDonutCat");if(l)try{const c=window.Chart;if(typeof c>"u"){l.style.display="none";return}new c(l,{type:"doughnut",data:{labels:r.map(([f])=>f),datasets:[{data:r.map(([,f])=>Math.round(f)),backgroundColor:r.map((f,d)=>n[d%n.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{l&&(l.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const t=typeof window._esc=="function"?window._esc:a=>String(a||""),o=new Date;o.setDate(o.getDate()-60);const r={};(window.pedidosFinalizados||[]).forEach(a=>{const l=a.fechaFinalizado||a.entrega||"";l&&new Date(l)<o||(a.productosInventario||[]).forEach(c=>{!c.id||c.id==="libre"||(r[String(c.id)]=(r[String(c.id)]||0)+(Number(c.quantity||c.cantidad)||1))})});const s=(window.products||[]).filter(a=>a.tipo!=="servicio"&&a.activo!==!1&&r[String(a.id)]);if(!s.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const i=`
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
      <tbody>${s.map(a=>{const l=r[String(a.id)]||0,c=l/60,f=Math.max(1,Math.ceil(c*14)),d=Number(a.stockMin)||0,h=f!==d?`<span style="color:${f>d?"#10b981":"#f59e0b"};font-weight:700;">${f>d?"\u25B2":"\u25BC"} ${f}</span>`:`<span style="color:#6b7280;">${f} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${t(a.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${c.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${h}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${t(a.id)}" data-nuevo="${f}" class="mkStockMinCb" style="accent-color:#C5A572;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" style="padding:9px 24px;border-radius:10px;background:linear-gradient(135deg,#C5A572,#a8864f);color:white;border:none;cursor:pointer;font-weight:700;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",i,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const t=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let o=0;t.forEach(r=>{const s=r.dataset.pid,n=Number(r.dataset.nuevo),i=(window.products||[]).find(a=>String(a.id)===String(s));!i||isNaN(n)||(i.stockMin=n,o++)}),o&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${o} producto${o!==1?"s":""}`,"ok"))};function abrirMovimientoProducto(t){const o=typeof window._esc=="function"?window._esc:u=>String(u||""),r=(window.products||[]).find(u=>String(u.id)===String(t));if(!r){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const s=Date.now()-90*864e5,n=new Set,i=[],a=u=>{if(!u)return;const v=u.fecha?new Date(u.fecha+(u.hora?"T"+u.hora:"")).getTime():u.timestamp?new Date(u.timestamp).getTime():0;if(v&&v<s)return;const M=u.id||String(u.productoId||t)+"_"+v+"_"+(u.cantidad||0);n.has(M)||(n.add(M),i.push({...u,_ts:v||Date.now()}))};(r.movimientos||[]).forEach(a),(window.stockMovimientos||[]).filter(u=>String(u.productoId)===String(t)).forEach(a),i.sort((u,v)=>v._ts-u._ts);const l=[];for(let u=12;u>=0;u--){const v=new Date(Date.now()-u*7*864e5),M=new Date(v.getTime()-7*864e5),R=`${M.getDate()}/${M.getMonth()+1}`;let U=0,K=0;i.forEach(B=>{if(B._ts>=M.getTime()&&B._ts<v.getTime()){const X=B.stockDespues!=null&&B.stockAntes!=null?Number(B.stockDespues)-Number(B.stockAntes):0,G=(B.tipo||"").toLowerCase();X>0||G.includes("entrada")||G.includes("compra")||G.includes("ajuste_positivo")?U+=Math.abs(Number(B.cantidad)||Math.abs(X)||1):K+=Math.abs(Number(B.cantidad)||Math.abs(X)||1)}}),l.push({label:R,entradas:U,salidas:K})}const c=Math.max(1,...l.map(u=>Math.max(u.entradas,u.salidas))),f=480,d=100,h=Math.floor((f-20)/l.length/2)-1,w=l.map((u,v)=>{const M=10+v*(h*2+4),R=Math.round(u.entradas/c*(d-20)),U=Math.round(u.salidas/c*(d-20));return`
      <rect x="${M}" y="${d-10-R}" width="${h}" height="${R}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${u.entradas}"/>
      <rect x="${M+h+1}" y="${d-10-U}" width="${h}" height="${U}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${u.salidas}"/>
      <text x="${M+h}" y="${d-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${u.label}</text>`}).join(""),T=i.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">\u25A0 Entradas</span>
        <span style="color:#ef4444;">\u25A0 Salidas</span>
      </div>
      <svg viewBox="0 0 ${f} ${d}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${d-10}" x2="${f-10}" y2="${d-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${w}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">\u2190 13 semanas</div>
    </div>`,b={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},H=i.slice(0,30).map(u=>{const v=u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):"\u2014"),M=u.hora||"",R=b[u.tipo||""]||u.tipo||"\u2014",U=u.stockDespues!=null&&u.stockAntes!=null?Number(u.stockDespues)-Number(u.stockAntes):0,K=Number(u.cantidad)||Math.abs(U)||0,B=U>0||(u.tipo||"").includes("entrada")||(u.tipo||"").includes("compra"),X=B?"#10b981":"#ef4444",G=B?`+${K}`:`-${K}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${o(v)} ${M?`<span style="color:#9ca3af;font-size:.72rem;">${o(M.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${o(R)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${X};">${G}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${u.stockDespues!=null?u.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o(u.motivo||"")}">${o(u.motivo||"")}</td>
    </tr>`}).join(""),q=typeof getStockEfectivo=="function"?getStockEfectivo(r):Number(r.stock)||0,ee=i.reduce((u,v)=>{const M=v.stockDespues!=null&&v.stockAntes!=null?Number(v.stockDespues)-Number(v.stockAntes):0;return u+(M>0||(v.tipo||"").includes("entrada")||(v.tipo||"").includes("compra")?Math.abs(Number(v.cantidad)||Math.abs(M)||0):0)},0),Y=i.reduce((u,v)=>{const M=v.stockDespues!=null&&v.stockAntes!=null?Number(v.stockDespues)-Number(v.stockAntes):0,R=M>0||(v.tipo||"").includes("entrada")||(v.tipo||"").includes("compra");return u+(R?0:Math.abs(Number(v.cantidad)||Math.abs(M)||0))},0),Q=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${q}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Stock actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">+${ee}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Entradas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#fef2f2;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#ef4444;">-${Y}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Salidas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#374151;">${i.length}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Movimientos</div>
      </div>
    </div>
    ${T}
    ${i.length>0?`
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      <thead><tr style="background:#f9fafb;font-size:.73rem;color:#9ca3af;font-weight:700;">
        <th style="padding:7px 10px;text-align:left;">Fecha</th>
        <th style="padding:7px 10px;text-align:left;">Tipo</th>
        <th style="padding:7px 10px;text-align:center;">Cant.</th>
        <th style="padding:7px 10px;text-align:center;">Stock</th>
        <th style="padding:7px 10px;text-align:left;">Motivo</th>
      </tr></thead>
      <tbody>${H}</tbody>
    </table>
    ${i.length>30?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${i.length-30} m\xE1s</p>`:""}`:""}
  `;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${o(r.name||"Producto")} (90d)`,Q,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;
//# sourceMappingURL=inventory-5.js.map
