function _levenshtein(t,o){const i=t.length,r=o.length,a=Array.from({length:i+1},(s,n)=>Array.from({length:r+1},(l,p)=>p===0?n:0));for(let s=1;s<=r;s++)a[0][s]=s;for(let s=1;s<=i;s++)for(let n=1;n<=r;n++)a[s][n]=t[s-1]===o[n-1]?a[s-1][n-1]:1+Math.min(a[s-1][n],a[s][n-1],a[s-1][n-1]);return a[i][r]}function _fuzzyMatch(t,o,i=2){return t=t.toLowerCase().trim(),o=o.toLowerCase(),!t||o.includes(t)?!0:o.split(/[\s,.-]+/).some(a=>{const s=a.substring(0,t.length+2);return s.length>=t.length-1&&_levenshtein(t,s)<=i})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){if(!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0)return null;let o=1/0;for(const i of t.mpComponentes){const r=(window.products||[]).find(n=>String(n.id)===String(i.id));if(!r)return 0;const a=typeof getStockEfectivo=="function"?getStockEfectivo(r):r.stock||0,s=parseFloat(i.qty)||1;o=Math.min(o,Math.floor(a/s))}return o===1/0?0:o}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",r=>{r.target===t&&(t.style.display="none")}),document.body.appendChild(t));const i=[...new Set((window.products||[]).map(r=>r.category).filter(Boolean))].map(r=>{const a=(window.categories||[]).find(s=>String(s.id)===String(r));return`<option value="${_esc(r)}">${_esc(a?a.emoji?a.emoji+" "+a.name:a.name:r)}</option>`}).join("");t.innerHTML=`
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
                    ${i}
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
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,i=document.getElementById("bulkPrecioSoloMP")?.checked||!1,r=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(a=>r&&String(a.category)!==r?!1:o&&i?!0:!(o&&!(!a.tipo||a.tipo==="producto"||a.tipo==="producto_interno"||a.tipo==="pack")||i&&a.tipo!=="materia_prima")).map(a=>{const s=i&&!o?"cost":"price",n=parseFloat(a[s])||0,l=Math.max(0,Math.round(n*(1+t/100)*100)/100);return{p:a,campoKey:s,precioActual:n,precioNuevo:l}}).filter(a=>a.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const o=_bulkPrecioGetAfectados();if(!o.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=o.slice(0,50).map(({p:i,campoKey:r,precioActual:a,precioNuevo:s})=>{const n=s-a,l=n>0?"#16a34a":n<0?"#dc2626":"#6b7280",p=r==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(i.name)}">${_esc(i.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${p}: $${a.toFixed(2)}</span>
            <span style="font-weight:700;color:${l};white-space:nowrap;">\u2192 $${s.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,i=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",r=o>0?"+":"",a=t.slice(0,5).map(({p:s,precioActual:n,precioNuevo:l})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(s.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${n.toFixed(2)}</span>
            <span style="font-weight:700;color:${l>n?"#16a34a":"#dc2626"};">\u2192 $${l.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${r}${o}%</strong> al ${i} de <strong>${t.length}</strong> producto(s):</p>
                ${a}
             </div>`,"\u2705 Confirmar cambio masivo").then(s=>{s&&(t.forEach(({p:n,campoKey:l,precioNuevo:p})=>{n[l]=p,n.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${r}${o}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:s,campoKey:n,precioNuevo:l})=>{s[n]=l,s.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const o=window.products||[],i=o.length+"_"+o.reduce((e,u)=>e+Number(u.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||""),r=document.getElementById("invDualContainer");if(r&&r._lastHash===i)return;r&&(r._lastHash=i);let a=document.getElementById("invDualContainer");if(!a){const e=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;a=document.createElement("div"),a.id="invDualContainer",a.style.cssText="display:flex;flex-direction:column;gap:0;",e.parentNode.insertBefore(a,e),e.style.display="none"}const s=window.products||[],n=new Map(s.map(e=>[String(e.id),typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0]));if(window._invStockCache=n,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const e=document.createElement("style");e.id="invExtraColStyles",e.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(e)}let l=document.getElementById("invExtraColToggle");if(l||(l=document.createElement("button"),l.id="invExtraColToggle",l.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",l.textContent="Mostrar SKU/Proveedor",l.addEventListener("click",()=>{const e=document.getElementById("invDualContainer");if(!e)return;const u=e.classList.toggle("inv-show-extra");l.textContent=u?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),a.parentNode.insertBefore(l,a)),s.length===0){a.innerHTML=`
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
        </div>`;return}const p=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",x=(document.getElementById("inventoryTagFilter")||{}).value||"",f=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function M(e){const u=window._normSearch||(g=>String(g||"").toLowerCase()),d=u(p),y=u(f),b=g=>!x||g.tags&&g.tags.includes(x),h=g=>!f||u(g.proveedor||"").includes(y);if(!p)return e.filter(g=>b(g)&&h(g));const v=e.filter(g=>(u(g.name).includes(d)||u(g.sku||"").includes(d)||u(g.proveedor||"").includes(d)||u(g.notas||"").includes(d)||(g.tags||[]).some(F=>u(F).includes(d)))&&b(g)&&h(g));return v.length>0?v:e.filter(g=>(_fuzzyMatch(d,g.name||"")||_fuzzyMatch(d,g.sku||"")||_fuzzyMatch(d,g.proveedor||""))&&b(g)&&h(g))}const $=M(s.filter(e=>e.tipo==="materia_prima")),L=M(s.filter(e=>e.tipo==="servicio")),m=M(s.filter(e=>e.tipo==="producto_variable")),j=M(s.filter(e=>!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack"));function R(e){if(!window._invSortCol)return e;const u=window._invSortCol,d=window._invSortDir;return[...e].sort((y,b)=>{let h,v;return u==="name"?(h=(y.name||"").toLowerCase(),v=(b.name||"").toLowerCase()):u==="sku"?(h=(y.sku||"").toLowerCase(),v=(b.sku||"").toLowerCase()):u==="category"?(h=(y.category||"").toLowerCase(),v=(b.category||"").toLowerCase()):u==="price"?(h=Number(y.price)||0,v=Number(b.price)||0):u==="stock"?(h=Number(y.stock)||0,v=Number(b.stock)||0):u==="margin"&&(h=y.cost&&y.price?(y.price-y.cost)/y.price:-1,v=b.cost&&b.price?(b.price-b.cost)/b.price:-1),h<v?d==="asc"?-1:1:h>v?d==="asc"?1:-1:0})}function J(e,u){const d=String(e.id),y=n.get(d)??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0),b=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3ED}"}</span>`;let h;y===0?h='<span class="badge-danger">Agotado</span>':y<=(e.stockMin||5)?h='<span class="badge-warning">Bajo Stock</span>':h='<span class="badge-success">Disponible</span>';const v=(window.categories||[]).find(z=>z.id===e.category),g=v?v.name:e.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${u*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${d}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${b}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.historialCostos&&e.historialCostos.length?`<span title="Este producto ha tenido ${e.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#7c3aed;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialCostos.length} cambio${e.historialCostos.length>1?"s":""}</span>`:""}
                    ${e.compraPaquete?`<div style="font-size:10px;color:#7c3aed;margin-top:2px;">\u{1F4E6} Paquete: ${e.compraPaquete.cantidad} uds \xB7 $${Number(e.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(z=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#7c3aed;border:1px solid #e9d5ff;">${_esc(z)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(g)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(e.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${d}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${d}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${y} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(e.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${h}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${d}')" title="Editar" aria-label="Editar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button type="button" onclick="ajustarStock('${d}')" title="Ajustar stock" aria-label="Ajustar stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4E6}</button>
                    <button type="button" onclick="duplicarProducto('${d}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button type="button" onclick="registrarMerma('${d}')" title="Registrar merma/p\xE9rdida" aria-label="Registrar merma"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C9}</button>
                    ${e.proveedorUrl?`<button type="button" onclick="window.open(this.dataset.url,'_blank')" data-url="${_esc(e.proveedorUrl)}" title="Abrir proveedor" aria-label="Abrir proveedor" style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F517}</button>`:""}
                    <button type="button" onclick="cambiarTipoProducto('${d}')" title="Convertir a Producto Terminado" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F4E6}</button>
                    <button type="button" onclick="deleteProduct('${d}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function Q(e,u){const d=String(e.id),y=`<span style="font-size:1.6rem;">${e.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${u*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${d}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${y}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(b=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc(b)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${d}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="deleteProduct('${d}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function q(e,u){const d=String(e.id),y=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F4E6}"}</span>`,b=(window.categories||[]).find(c=>c.id===e.category),h=b?b.name:e.category||"",v=calcularDisponibilidadDesdeMP(e);let g,z;if(v!==null){const c=v.piezas,w=c===0?"#ef4444":c<=3?"#f59e0b":"#10b981",P=c===0?"#fee2e2":c<=3?"#fef3c7":"#d1fae5",B=v.detalle.map(S=>`${S.nombre}: ${S.stock}\xF7${S.qty}=${S.posibles}pzs`).join(" | ");g=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(B)}"
                        style="padding:3px 12px;border-radius:8px;background:${P};color:${w};
                               font-weight:700;font-size:.95rem;border:1px solid ${w}33;cursor:help;">
                        ${c}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,z=c===0?'<span class="badge-danger">Sin stock MP</span>':c<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const c=n.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0),w=e.stockMin||5,P=c===0?"#ef4444":c<=w?"#f59e0b":"#10b981";g=`<span style="padding:3px 12px;border-radius:8px;background:${c===0?"#fee2e2":c<=w?"#fef3c7":"#d1fae5"};color:${P};font-weight:700;font-size:.95rem;">${c}</span>`,z=c===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Agotado</span>':c<=w?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Disponible</span>'}const F=e.variants&&e.variants.length>0?e.variants.map(c=>`
                <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f3f4f6;border-radius:8px;font-size:11px;margin:1px;">
                    <b>${_esc(c.type)}:</b>${_mkColorDot(c.type,_esc(c.value))}
                    <span style="background:#e0f2fe;color:#0369a1;padding:0 4px;border-radius:99px;font-weight:600;">${c.qty??0}</span>
                </span>`).join(""):'<span class="text-xs text-gray-400">Sin variantes</span>',T=Number(e.cost)||0,N=Number(e.price)||0,D=T&&N?(()=>{const c=(N-T)/N*100,w=c>=40?"#10b981":c>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${w};">${c.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,c).toFixed(0)}%;background:${w};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${u*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${d}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${y}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${e.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${e.tipo==="pack"&&e.packComponentes&&e.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${e.packComponentes.map(c=>`${c.qty>1?c.qty+"\xD7 ":""}${_esc(c.nombre)}`).join(" + ")}</div>`:""}
                    ${e.historialPrecios&&e.historialPrecios.length?`<span title="Este producto ha tenido ${e.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialPrecios.length} cambio${e.historialPrecios.length>1?"s":""}</span>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(e.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(e.proveedorNombre)}</b>${e.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(c=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(c)}</span>`).join("")}</div>`:""}
                    ${(()=>{const c=calcularProducibles(e);if(c===null)return"";const w=c>=5?"#16a34a":c>=1?"#d97706":"#dc2626",P=c>=5?"#d1fae5":c>=1?"#fef3c7":"#fee2e2",B=c===0?"Sin stock MP":`Producibles: ${c}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${P};color:${w};border:1px solid ${w}33;">\u{1F3ED} ${B}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(h)}</td>
            <td class="px-4 py-3">${F}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${d}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(e.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${d}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${g}</td>
            <td class="px-4 py-3">${z}</td>
            <td class="px-4 py-3">${D}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${e.tipo==="pack"?`<button type="button" onclick="openPackModal('${d}')" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`:`<button type="button" onclick="editProduct('${d}')" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`}
                    <button type="button" onclick="duplicarProducto('${d}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    ${e.tipo!=="pack"?`<button type="button" onclick="cambiarTipoProducto('${d}')" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${e.movimientos&&e.movimientos.length?`<button type="button" onclick="verMovimientosProducto('${d}')" title="Ver movimientos de stock (${e.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>`:""}
                    <button type="button" onclick="deleteProduct('${d}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function A(e,u){const d=String(e.id),y=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3AF}"}</span>`,b=(e.tablaPreciosVariable||[]).slice().sort((E,H)=>E.cantidadMin-H.cantidadMin),h=b.length?b.map(E=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${E.cantidadMin} pzas = $${Number(E.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',v=(e.mpComponentes||[]).length,g=(window.categories||[]).find(E=>String(E.id)===String(e.category)),z=g?`${g.emoji||""} ${g.name}`:"\u2014",F=b,T=F.length?F[0].precio/(F[0].cantidadMin||1):0,N=T>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${T.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',D=calcularDisponibilidadDesdeMP(e);let c,w;if(D!==null){const E=D.piezas,H=E===0?"#ef4444":E<=3?"#f59e0b":"#10b981",W=E===0?"#fee2e2":E<=3?"#fef3c7":"#d1fae5",_=D.detalle.map(I=>`${I.nombre}: ${I.stock}\xF7${I.qty}=${I.posibles}pzs`).join(" | ");c=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(_)}" style="padding:3px 12px;border-radius:8px;background:${W};color:${H};font-weight:700;font-size:.95rem;border:1px solid ${H}33;cursor:help;">${E}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,w=E===0?'<span class="badge-danger">Sin stock MP</span>':E<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else c='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',w='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const P=(e.mpComponentes||[]).reduce((E,H)=>E+(parseFloat(H.costUnit)||0)*(parseFloat(H.qty)||1),0),B=e.rendimientoPorHoja||1,S=B>0?P/B:P,k=T>0?Math.round((T-S)/T*100):0,K=k>=40?"#10b981":k>=20?"#f59e0b":"#ef4444",X=T>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${K};">${k}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,k)}%;background:${K};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${u*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${d}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${y}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${e.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${e.rendimientoPorHoja} uds/hoja \xB7 ${v} MP${v!==1?"s":""}</div>`:v>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${v} MP${v!==1?"s":""}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(E=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(E)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(z)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${h}</div></td>
            <td class="px-4 py-3 text-right">${N}</td>
            <td class="px-4 py-3">${c}</td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">${X}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${d}')" title="Editar" aria-label="Editar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button type="button" onclick="duplicarProducto('${d}')" title="Duplicar" aria-label="Duplicar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button type="button" onclick="deleteProduct('${d}')" title="Eliminar" aria-label="Eliminar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function U({id:e,title:u,titleColor:d,titleBg:y,btnLabel:b,btnOnclick:h,btnColor:v,extraBtnHTML:g,products:z,renderFila:F,headers:T,emptyMsg:N}){const D=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(z.length===0&&D)return"";const c=R(z),w=`_invPage_${e}`,P=window._invPageSize||10;window[w]=window[w]||1;const B=c.length,S=Math.max(1,Math.ceil(B/P));window[w]>S&&(window[w]=1);const k=window[w],K=(k-1)*P,X=c.slice(K,K+P),E=X.length===0?`<tr><td colspan="${T.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${N}</td></tr>`:X.map((_,I)=>F(_,I)).join(""),H=T.map(_=>{const I=_.colId==="sku"?" inv-col-hidden-sku":_.colId==="proveedor"?" inv-col-hidden-prov":"",G=_.align==="right"?" text-right":" text-left";return _.sortKey?`<th class="px-4 py-3${G} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${I}" onclick="sortInventory('${_.sortKey}')" style="white-space:nowrap;">${_.label} \u2195</th>`:`<th class="px-4 py-3${G} text-xs font-semibold text-gray-500 uppercase tracking-wide${I}" style="white-space:nowrap;">${_.label}</th>`}).join("");let W="";if(S>1||B>P){const _=Math.min(K+P,B);W=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${K+1}\u2013${_}</b> de <b>${B}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${e}',${k-1})" ${k<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${k<=1?"default":"pointer"};opacity:${k<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,S)},(I,G)=>{let C=k<=3?G+1:k+G-2;return C<1&&(C=null),C>S&&(C=null),C===null?"":`<button onclick="invSectionPage('${e}',${C})" style="min-width:30px;padding:4px 8px;border:1px solid ${C===k?"#C5973B":"#e5e7eb"};border-radius:7px;background:${C===k?"#C5973B":"#fff"};color:${C===k?"#fff":"#374151"};font-weight:${C===k?700:400};font-size:13px;cursor:${C===k?"default":"pointer"};" ${C===k?"disabled":""}>${C}</button>`}).join("")}
                    <button onclick="invSectionPage('${e}',${k+1})" ${k>=S?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${k>=S?"default":"pointer"};opacity:${k>=S?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${d}33;box-shadow:0 2px 12px ${d}11;">
            <!-- Header de secci\xF3n -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:${y};border-bottom:1.5px solid ${d}33;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;font-weight:800;color:${d};">${u}</span>
                    <span style="background:${d};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${B}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${g||""}
                    <button onclick="${h}"
                        style="padding:7px 16px;background:${v};color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${b}
                    </button>
                </div>
            </div>
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${H}</tr>
                    </thead>
                    <tbody>${E}</tbody>
                </table>
            </div>
            ${W}
        </div>`}const O=s.filter(e=>!e.deletedAt),oe=O.length,ne=O.reduce((e,u)=>{const d=n.get(String(u.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(u):parseInt(u.stock)||0);return e+(Number(u.cost)||0)*Math.max(0,d)},0),ee=O.filter(e=>(n.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0))<=(e.stockMin||5)).length,Y=O.filter(e=>(!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")&&Number(e.price)>0),Z=Y.length?Y.reduce((e,u)=>{const d=Number(u.price)||0,y=Number(u.cost)||0;return e+(d>0?(d-y)/d*100:0)},0)/Y.length:0;let V=document.getElementById("invKpiBar");V||(V=document.createElement("div"),V.id="invKpiBar",a.parentNode.insertBefore(V,a)),V.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${oe}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#7c3aed;">$${ne.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${ee>0?"#ef4444":"#10b981"};">${ee}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${Z>=40?"#10b981":Z>=20?"#f59e0b":"#ef4444"};">${Z.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const te=U({id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#C5973B",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",extraBtnHTML:'<button type="button" onclick="injectPackModal();openPackModal()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:j,renderFila:q,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"})+U({id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:m,renderFila:A,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."})+U({id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#7c3aed",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:$,renderFila:J,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"})+U({id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#6d28d9",titleBg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:L,renderFila:Q,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."});(p||x||f).length>0&&!te.trim()?a.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                style="padding:10px 22px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:.875rem;font-weight:700;cursor:pointer;">
                Limpiar b\xFAsqueda
            </button>
        </div>`:a.innerHTML=te}function invSectionPage(t,o){const i=`_invPage_${t}`,r=window.products||[],a=t==="mp"?r.filter(f=>f.tipo==="materia_prima"):t==="svc"?r.filter(f=>f.tipo==="servicio"):t==="pv"?r.filter(f=>f.tipo==="producto_variable"):r.filter(f=>!f.tipo||f.tipo==="producto"||f.tipo==="producto_interno"||f.tipo==="pack"),s=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",n=(document.getElementById("inventoryTagFilter")||{}).value||"",l=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",p=a.filter(f=>{const M=!s||f.name.toLowerCase().includes(s)||(f.sku||"").toLowerCase().includes(s)||(f.proveedor||"").toLowerCase().includes(s)||(f.notas||"").toLowerCase().includes(s)||(f.tags||[]).some(m=>m.toLowerCase().includes(s)),$=!n||f.tags&&f.tags.includes(n),L=!l||(f.proveedor||"").toLowerCase().includes(l);return M&&$&&L}),x=Math.max(1,Math.ceil(p.length/(window._invPageSize||10)));window[i]=Math.max(1,Math.min(o,x)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,o,i,r,a){let s=document.getElementById("inventoryPaginationBar");if(!s){const x=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!x)return;s=document.createElement("div"),s.id="inventoryPaginationBar",x.insertAdjacentElement("afterend",s)}if(o<=1&&i<=a){s.innerHTML="";return}const n=Math.min(r+a,i),l=`Mostrando <b>${r+1}\u2013${n}</b> de <b>${i}</b> productos`;function p(){const x=[],f=(M,$)=>{for(let L=M;L<=$;L++)x.push(L)};return o<=7?f(1,o):(x.push(1),t>4&&x.push("..."),f(Math.max(2,t-2),Math.min(o-1,t+2)),t<o-3&&x.push("..."),x.push(o)),x.map(M=>{if(M==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const $=M===t;return`<button onclick="invGoToPage(${M})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${$?"#C5973B":"#e5e7eb"};
                       background:${$?"#C5973B":"white"};color:${$?"white":"#374151"};
                       font-weight:${$?"700":"500"};font-size:13px;cursor:${$?"default":"pointer"};
                       transition:all 0.15s;"
                ${$?"disabled":""}>${M}</button>`}).join("")}s.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${l}</span>
                <select onchange="invChangePageSize(this.value)"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(x=>`<option value="${x}" ${x===a?"selected":""}>${x} por p\xE1gina</option>`).join("")}
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
                ${p()}
                <button onclick="invGoToPage(${t+1})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button onclick="invGoToPage(${o})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const o=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(t,o)),renderInventoryTable();const i=document.getElementById("inventoryTable");i&&i.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){window._invPageSize=parseInt(t),window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const i=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",r=(document.getElementById("movTipoFilter")||{}).value||"";let a=window.stockMovements||[];i&&(a=a.filter(m=>m.productoNombre?.toLowerCase().includes(i)||(m.motivo||"").toLowerCase().includes(i))),r&&(a=a.filter(m=>(m.tipo||"")===r));const s=_fechaHoy?_fechaHoy():new Date().toISOString().split("T")[0],n=(window.stockMovements||[]).filter(m=>{try{const j=new Date(m.fecha);return j.getFullYear()+"-"+("0"+(j.getMonth()+1)).slice(-2)+"-"+("0"+j.getDate()).slice(-2)===s}catch{return!1}}),l={};n.forEach(m=>{l[m.tipo]=(l[m.tipo]||0)+1});const p={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},x={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let f=document.getElementById("movResumenHoy");f||(f=document.createElement("div"),f.id="movResumenHoy",o.parentNode.insertBefore(f,o));const M=Object.keys(l).map(m=>`${p[m]||"\u26AA"} ${x[m]||m}: <strong>${l[m]}</strong>`);f.innerHTML=M.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${M.join("&nbsp;&nbsp;")}
           </div>`:"";let $=document.getElementById("movExportCSVBtn");if($||($=document.createElement("button"),$.id="movExportCSVBtn",$.textContent="\u{1F4E5} Exportar historial CSV",$.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",$.onclick=function(){const m=window.stockMovements||[];let R=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;m.forEach(A=>{const U=[new Date(A.fecha).toLocaleString("es-MX"),A.productoNombre||"",A.tipo||"",A.cantidad,A.motivo||"",A.stockAntes??"",A.stockDespues??""];R+=U.map(O=>`"${String(O).replace(/"/g,'""')}"`).join(",")+`
`});const J=new Blob([R],{type:"text/csv;charset=utf-8;"}),Q=URL.createObjectURL(J),q=document.createElement("a");q.href=Q,q.download=`movimientos-${s}.csv`,q.click(),URL.revokeObjectURL(Q)},o.parentNode.insertBefore($,o)),!a.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const L={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=a.slice(0,200).map(m=>{const j=new Date(m.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),R=m.cantidad>=0?`+${m.cantidad}`:`${m.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${L[m.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(m.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${j} \xB7 ${m.tipo} \xB7 ${_esc(m.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${m.cantidad>=0?"#10b981":"#ef4444"};">${R} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${m.stockAntes} \u2192 ${m.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){confirm("\xBFBorrar todo el historial de movimientos?")&&(window.stockMovements=[],saveStockMovements(),renderMovimientos())}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const o=document.getElementById(t);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const i={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(r=>{const a=new Date(r.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),s=r.cantidad>=0?`+${r.cantidad}`:`${r.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${i[r.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(r.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${a} \xB7 ${r.tipo} \xB7 ${_esc(r.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${r.cantidad>=0?"#10b981":"#ef4444"};">${s} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${r.stockAntes} \u2192 ${r.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const o=(window.products||[]).find(r=>String(r.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const i=JSON.parse(JSON.stringify(o));i.id=_genId(),i.name="Copia de "+o.name,i.sku=(o.sku||"")+"-C",i.stock=0,i.historialPrecios=[],i.historialCostos=[],window.products.unshift(i),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${i.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(n=>!n.tipo||n.tipo==="producto"||n.tipo==="producto_interno"),o=t.map(n=>{const l=n.price>0&&n.cost>0?(n.price-n.cost)/n.price*100:null;return{...n,_margen:l}}).sort((n,l)=>(l._margen??-1/0)-(n._margen??-1/0)),i=o.map((n,l)=>{const p=n._margen!==null?n._margen.toFixed(1)+"%":"\u2014",x=n.price>0&&n.cost>0?"$"+(n.price-n.cost).toFixed(2):"\u2014",f=n._margen===null?"#9ca3af":n._margen>=50?"#16a34a":n._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${l===0?"\u{1F947}":l===1?"\u{1F948}":l===2?"\u{1F949}":`${l+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(n.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(n.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(n.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${x}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${f};font-size:14px;">${p}</td>
        </tr>`}).join(""),r=o.filter(n=>n._margen!==null).reduce((n,l,p,x)=>n+l._margen/x.length,0),a=o[0];let s=document.getElementById("_mkRentabilidadModal");s||(s=document.createElement("div"),s.id="_mkRentabilidadModal",s.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",s.addEventListener("click",n=>{n.target===s&&(s.style.display="none")}),document.body.appendChild(s)),s.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${o.some(n=>n._margen!==null)?r.toFixed(1)+"%":"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">M\xE1s rentable</div>
                    <div style="font-size:.95rem;font-weight:700;color:#16a34a;margin-top:4px;">${a?_esc(a.name):"\u2014"}</div>
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
                    <tbody>${i||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,s.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(i=>{i.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),t.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#7c3aed;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const o=(window.pedidos||[]).filter(r=>!["cancelado","finalizado"].includes(r.status||"")&&(r.productosInventario||[]).some(a=>t.includes(String(a.id))));if(o.length>0){const r=o.map(a=>a.folio||a.id).slice(0,5).join(", ");if(!confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${r}). \xBFEliminar de todas formas?`))return}if(!confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`))return;const i=[...t];if(window.products=(window.products||[]).filter(r=>!i.includes(String(r.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",i)}catch(r){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",r)}manekiToastExport(`\u{1F5D1} ${i.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),o=(window.products||[]).filter(p=>t.includes(String(p.id))),i="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",r=o.map(p=>[p.tipo||"pt",p.name,p.sku||"",p.cost||0,p.price||0,p.stock||0,p.stockMin||5,p.proveedor||"",p.notas||""].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")),a="\uFEFF"+i+`
`+r.join(`
`),s=new Blob([a],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(s),l=document.createElement("a");l.href=n,l.download="inventario_seleccion.csv",l.click(),URL.revokeObjectURL(n),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const o=await new Promise(r=>{const a=document.getElementById("mkBatchCatModal");a&&a.remove();const n=(window.categories||[]).map(p=>`<option value="${p.id}">${p.emoji||""} ${p.name}</option>`).join(""),l=document.createElement("div");l.id="mkBatchCatModal",l.className="mk-modal-overlay",l.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
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
      </div>`,window._mkBCR=p=>{l.remove(),r(p)},document.body.appendChild(l),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!o)return;const i=(window.categories||[]).find(r=>String(r.id)===String(o));if(!i){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(r=>{t.includes(String(r.id))&&(r.category=i.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};window._mkInvSetTipo=function(t){const o=document.getElementById("inventoryTipoFilter");o&&(o.value=t,o.dispatchEvent(new Event("change")))},window._mkInvClearOne=function(t){const o=document.getElementById(t);o&&(o.value="",o.dispatchEvent(new Event(t==="inventorySearch"?"input":"change")))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(o=>{const i=document.getElementById(o);i&&(i.value="")});const t=document.getElementById("inventorySearch");t?(t.value="",t.dispatchEvent(new Event("input"))):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),o=document.getElementById("mkInvTipoSeg");!t||!o||o.querySelectorAll("button").forEach(i=>i.classList.toggle("active",i.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),o=t?.parentElement;if(!(!t||!o)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const i=document.createElement("div");i.id="mkInvTipoSeg",i.className="mk-segmented",i.setAttribute("role","group"),i.setAttribute("aria-label","Tipo de producto"),i.innerHTML=[...t.options].map(r=>{const a=_MK_TIPO_LABELS[r.value]??(r.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${r.value}" onclick="_mkInvSetTipo('${r.value}')">${a}</button>`}).join(""),t.parentElement.insertBefore(i,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const i=document.createElement("span");i.id="mkInvDensity",i.style.marginLeft="auto",i.innerHTML=window.mkRenderDensityToggle(),o.appendChild(i),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const i=document.createElement("div");i.id="mkInvFilterInfo",i.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",o.parentElement.insertBefore(i,o.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const o=document.getElementById("invDualContainer"),i=o?o.querySelectorAll(".inv-bulk-cb").length:0,r=(window.products||[]).length,a=document.getElementById("inventorySearch"),s=document.getElementById("inventoryTagFilter"),n=document.getElementById("inventoryProveedorFilter"),l=document.getElementById("inventoryTipoFilter"),p=[];a&&a.value.trim()&&p.push(`<span class="mk-filter-chip">Buscar: ${_esc(a.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),l&&l.value&&p.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[l.value]||l.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),s&&s.value&&p.push(`<span class="mk-filter-chip">Tag: ${_esc(s.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),n&&n.value&&p.push(`<span class="mk-filter-chip">Proveedor: ${_esc(n.options[n.selectedIndex]?.text||n.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let x=`<span class="mk-result-count">Mostrando <b>${i}</b> de ${r} producto${r!==1?"s":""}</span>`;p.length&&(x+=`<div class="mk-filter-chips">${p.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=x,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const o=new Set([...t.querySelectorAll(".inv-bulk-cb")].map(l=>String(l.dataset.id))),i=window._invStockCache;let r=0,a=0,s=0;(window.products||[]).forEach(l=>{if(!o.has(String(l.id)))return;s++;const p=i?.get(String(l.id))??(Number(l.stock)||0);r+=(Number(l.price)||0)*p,p<=(Number(l.stockMin)||5)&&a++});let n=document.getElementById("mkInvSummary");if(s===0){n&&n.remove();return}n||(n=document.createElement("div"),n.id="mkInvSummary",n.className="mk-table-summary",n.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(n,t.nextSibling)),n.innerHTML=`<span>Valor de inventario: <b>$${r.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${s} producto${s!==1?"s":""}</span>`+(a>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${a} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const o=window.renderInventoryTable;if(typeof o!="function"||o._mkWrapped)return;const i=function(...r){const a=o.apply(this,r);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return a};i._mkWrapped=!0,window.renderInventoryTable=i})();
//# sourceMappingURL=inventory-5.js.map
