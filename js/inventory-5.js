"use strict";function _levenshtein(t,o){const a=t.length,s=o.length,n=Array.from({length:a+1},(i,r)=>Array.from({length:s+1},(l,c)=>c===0?r:0));for(let i=1;i<=s;i++)n[0][i]=i;for(let i=1;i<=a;i++)for(let r=1;r<=s;r++)n[i][r]=t[i-1]===o[r-1]?n[i-1][r-1]:1+Math.min(n[i-1][r],n[i][r-1],n[i-1][r-1]);return n[a][s]}window._levenshtein=_levenshtein;function _fuzzyMatch(t,o,a=2){return t=t.toLowerCase().trim(),o=o.toLowerCase(),!t||o.includes(t)?!0:o.split(/[\s,.-]+/).some(n=>{const i=n.substring(0,t.length+2);return i.length>=t.length-1&&_levenshtein(t,i)<=a})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){if(!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0)return null;let o=1/0;for(const a of t.mpComponentes){const s=(window.products||[]).find(r=>String(r.id)===String(a.id));if(!s)return 0;const n=typeof getStockEfectivo=="function"?getStockEfectivo(s):s.stock||0,i=parseFloat(a.qty)||1;o=Math.min(o,Math.floor(n/i))}return o===1/0?0:o}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",s=>{s.target===t&&(t.style.display="none")}),document.body.appendChild(t));const a=[...new Set((window.products||[]).map(s=>s.category).filter(Boolean))].map(s=>{const n=(window.categories||[]).find(i=>String(i.id)===String(s));return`<option value="${_esc(s)}">${_esc(n?n.emoji?n.emoji+" "+n.name:n.name:s)}</option>`}).join("");t.innerHTML=`
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
            <button onclick="bulkPrecioAplicar()"
                style="padding:8px 18px;border:none;border-radius:10px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;">\u2705 Aplicar</button>
        </div>
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,a=document.getElementById("bulkPrecioSoloMP")?.checked||!1,s=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(n=>s&&String(n.category)!==s?!1:o&&a?!0:!(o&&!(!n.tipo||n.tipo==="producto"||n.tipo==="producto_interno"||n.tipo==="pack")||a&&n.tipo!=="materia_prima")).map(n=>{const i=a&&!o?"cost":"price",r=parseFloat(n[i])||0,l=Math.max(0,Math.round(r*(1+t/100)*100)/100);return{p:n,campoKey:i,precioActual:r,precioNuevo:l}}).filter(n=>n.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const o=_bulkPrecioGetAfectados();if(!o.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=o.slice(0,50).map(({p:a,campoKey:s,precioActual:n,precioNuevo:i})=>{const r=i-n,l=r>0?"#16a34a":r<0?"#dc2626":"#6b7280",c=s==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(a.name)}">${_esc(a.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${c}: $${n.toFixed(2)}</span>
            <span style="font-weight:700;color:${l};white-space:nowrap;">\u2192 $${i.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;async function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,a=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",s=o>0?"+":"",n=t.slice(0,5).map(({p:i,precioActual:r,precioNuevo:l})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(i.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${r.toFixed(2)}</span>
            <span style="font-weight:700;color:${l>r?"#16a34a":"#dc2626"};">\u2192 $${l.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${s}${o}%</strong> al ${a} de <strong>${t.length}</strong> producto(s):</p>
                ${n}
             </div>`,"\u2705 Confirmar cambio masivo").then(i=>{i&&(t.forEach(({p:r,campoKey:l,precioNuevo:c})=>{r[l]=c,r.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!await showConfirm(`\xBFAplicar ${s}${o}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:i,campoKey:r,precioNuevo:l})=>{i[r]=l,i.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const o=window.products||[],a=document.getElementById("inventoryTipoFilter")?.value||"",s=o.length+"_"+o.reduce((e,m)=>e+Number(m.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||"")+"_"+a,n=document.getElementById("invDualContainer");if(n&&n._lastHash===s)return;n&&(n._lastHash=s);let i=document.getElementById("invDualContainer");if(!i){const e=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;i=document.createElement("div"),i.id="invDualContainer",i.style.cssText="display:flex;flex-direction:column;gap:0;",e.parentNode.insertBefore(i,e),e.style.display="none"}const r=window.products||[],l=new Map(r.map(e=>[String(e.id),typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0]));window._invStockCache=l;const c=window.productMap||new Map(r.map(e=>[String(e.id),e])),g=new Map;for(const e of r)e.mpComponentes&&e.mpComponentes.length>0&&g.set(String(e.id),calcularDisponibilidadDesdeMP(e,c,l));if(typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const e=document.createElement("style");e.id="invExtraColStyles",e.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(e)}let d=document.getElementById("invExtraColToggle");if(d||(d=document.createElement("button"),d.id="invExtraColToggle",d.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",d.textContent="Mostrar SKU/Proveedor",d.addEventListener("click",()=>{const e=document.getElementById("invDualContainer");if(!e)return;const m=e.classList.toggle("inv-show-extra");d.textContent=m?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),i.parentNode.insertBefore(d,i)),r.length===0){i.innerHTML=`
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
        </div>`;return}const h=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",w=(document.getElementById("inventoryTagFilter")||{}).value||"",I=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function b(e){const m=window._normSearch||(y=>String(y||"").toLowerCase()),f=m(h),k=m(I),$=y=>!w||y.tags&&y.tags.includes(w),E=y=>!I||m(y.proveedor||"").includes(k);if(!h)return e.filter(y=>$(y)&&E(y));const S=e.filter(y=>(m(y.name).includes(f)||m(y.sku||"").includes(f)||m(y.proveedor||"").includes(f)||m(y.notas||"").includes(f)||(y.tags||[]).some(W=>m(W).includes(f)))&&$(y)&&E(y));return S.length>0?S:e.filter(y=>(_fuzzyMatch(f,y.name||"")||_fuzzyMatch(f,y.sku||"")||_fuzzyMatch(f,y.proveedor||""))&&$(y)&&E(y))}const L=b(r.filter(e=>e.tipo==="materia_prima")),O=b(r.filter(e=>e.tipo==="servicio")),G=b(r.filter(e=>e.tipo==="producto_variable")),M=b(r.filter(e=>!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack"));function C(e){if(!window._invSortCol)return e;const m=window._invSortCol,f=window._invSortDir;return[...e].sort((k,$)=>{let E,S;return m==="name"?(E=(k.name||"").toLowerCase(),S=($.name||"").toLowerCase()):m==="sku"?(E=(k.sku||"").toLowerCase(),S=($.sku||"").toLowerCase()):m==="category"?(E=(k.category||"").toLowerCase(),S=($.category||"").toLowerCase()):m==="price"?(E=Number(k.price)||0,S=Number($.price)||0):m==="stock"?(E=Number(k.stock)||0,S=Number($.stock)||0):m==="margin"&&(E=k.cost&&k.price?(k.price-k.cost)/k.price:-1,S=$.cost&&$.price?($.price-$.cost)/$.price:-1),E<S?f==="asc"?-1:1:E>S?f==="asc"?1:-1:0})}function B(e,m){const f=String(e.id),k=l.get(f)??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0),$=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3ED}"}</span>`;let E;k===0?E='<span class="badge-danger">Agotado</span>':k<=(e.stockMin||5)?E='<span class="badge-warning">Bajo Stock</span>':E='<span class="badge-success">Disponible</span>';const S=(window.categories||[]).find(F=>F.id===e.category),y=S?S.name:e.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(F=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#7c3aed;border:1px solid #e9d5ff;">${_esc(F)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(y)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(e.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${f}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${f}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${k} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(e.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${E}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${f}')" title="Editar" aria-label="Editar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button type="button" onclick="ajustarStock('${f}')" title="Ajustar stock" aria-label="Ajustar stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4E6}</button>
                    <button type="button" onclick="duplicarProducto('${f}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button type="button" onclick="registrarMerma('${f}')" title="Registrar merma/p\xE9rdida" aria-label="Registrar merma"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C9}</button>
                    ${e.proveedorUrl?`<button type="button" onclick="window.open(this.dataset.url,'_blank')" data-url="${_esc(e.proveedorUrl)}" title="Abrir proveedor" aria-label="Abrir proveedor" style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F517}</button>`:""}
                    <button type="button" onclick="cambiarTipoProducto('${f}')" title="Convertir a Producto Terminado" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F4E6}</button>
                    <button type="button" onclick="abrirMovimientoProducto('${f}')" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C8}</button>
                    <button type="button" onclick="archivarProducto('${f}')" title="${e.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${e.activo===!1?"\u{1F513}":"\u{1F4C1}"}</button>
                    <button type="button" onclick="deleteProduct('${f}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function u(e,m){const f=String(e.id),k=`<span style="font-size:1.6rem;">${e.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
                    <button onclick="openServicioModal('${f}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="deleteProduct('${f}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function v(e,m){const f=String(e.id),k=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F4E6}"}</span>`,$=(window.categories||[]).find(x=>x.id===e.category),E=$?$.name:e.category||"",S=g.get(f)??null;let y,F;if(S!==null){const x=S.piezas,T=x===0?"#ef4444":x<=3?"#f59e0b":"#10b981",D=x===0?"#fee2e2":x<=3?"#fef3c7":"#d1fae5",H=S.detalle.map(V=>`${V.nombre}: ${V.stock}\xF7${V.qty}=${V.posibles}pzs`).join(" | ");y=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(H)}"
                        style="padding:3px 12px;border-radius:8px;background:${D};color:${T};
                               font-weight:700;font-size:.95rem;border:1px solid ${T}33;cursor:help;">
                        ${x}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,F=x===0?'<span class="badge-danger">Sin stock MP</span>':x<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const x=l.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0),T=e.stockMin||5,D=x===0?"#ef4444":x<=T?"#f59e0b":"#10b981";y=`<span style="padding:3px 12px;border-radius:8px;background:${x===0?"#fee2e2":x<=T?"#fef3c7":"#d1fae5"};color:${D};font-weight:700;font-size:.95rem;">${x}</span>`,F=x===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Agotado</span>':x<=T?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Disponible</span>'}const W=e.variants&&e.variants.length>0?e.variants.map(x=>`
                <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f3f4f6;border-radius:8px;font-size:11px;margin:1px;">
                    <b>${_esc(x.type)}:</b>${_mkColorDot(x.type,_esc(x.value))}
                    <span style="background:#e0f2fe;color:#0369a1;padding:0 4px;border-radius:99px;font-weight:600;">${x.qty??0}</span>
                </span>`).join(""):'<span class="text-xs text-gray-400">Sin variantes</span>',U=Number(e.cost)||0,ee=Number(e.price)||0,Y=U&&ee?(()=>{const x=(ee-U)/ee*100,T=x>=40?"#10b981":x>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${T};">${x.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,x).toFixed(0)}%;background:${T};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
                    ${(()=>{const x=calcularProducibles(e);if(x===null)return"";const T=x>=5?"#16a34a":x>=1?"#d97706":"#dc2626",D=x>=5?"#d1fae5":x>=1?"#fef3c7":"#fee2e2",H=x===0?"Sin stock MP":`Producibles: ${x}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${D};color:${T};border:1px solid ${T}33;">\u{1F3ED} ${H}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(E)}</td>
            <td class="px-4 py-3">${W}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${f}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(e.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${f}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${y}</td>
            <td class="px-4 py-3">${F}</td>
            <td class="px-4 py-3">${Y}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${e.tipo==="pack"?`<button type="button" onclick="openPackModal('${f}')" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`:`<button type="button" onclick="editProduct('${f}')" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`}
                    <button type="button" onclick="duplicarProducto('${f}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    ${e.tipo!=="pack"?`<button type="button" onclick="cambiarTipoProducto('${f}')" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${e.movimientos&&e.movimientos.length?`<button type="button" onclick="verMovimientosProducto('${f}')" title="Ver movimientos de stock (${e.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>`:""}
                    <button type="button" onclick="abrirMovimientoProducto('${f}')" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C8}</button>
                    <button type="button" onclick="archivarProducto('${f}')" title="${e.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${e.activo===!1?"\u{1F513}":"\u{1F4C1}"}</button>
                    <button type="button" onclick="deleteProduct('${f}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function z(e,m){const f=String(e.id),k=e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3AF}"}</span>`,$=(e.tablaPreciosVariable||[]).slice().sort((_,Q)=>_.cantidadMin-Q.cantidadMin),E=$.length?$.map(_=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${_.cantidadMin} pzas = $${Number(_.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',S=(e.mpComponentes||[]).length,y=(window.categories||[]).find(_=>String(_.id)===String(e.category)),F=y?`${y.emoji||""} ${y.name}`:"\u2014",W=$,U=W.length?W[0].precio/(W[0].cantidadMin||1):0,ee=U>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${U.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',Y=g.get(String(e.id))??null;let x,T;if(Y!==null){const _=Y.piezas,Q=_===0?"#ef4444":_<=3?"#f59e0b":"#10b981",se=_===0?"#fee2e2":_<=3?"#fef3c7":"#d1fae5",re=Y.detalle.map(j=>`${j.nombre}: ${j.stock}\xF7${j.qty}=${j.posibles}pzs`).join(" | ");x=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(re)}" style="padding:3px 12px;border-radius:8px;background:${se};color:${Q};font-weight:700;font-size:.95rem;border:1px solid ${Q}33;cursor:help;">${_}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,T=_===0?'<span class="badge-danger">Sin stock MP</span>':_<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else x='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',T='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const D=(e.mpComponentes||[]).reduce((_,Q)=>_+(parseFloat(Q.costUnit)||0)*(parseFloat(Q.qty)||1),0),H=e.rendimientoPorHoja||1,V=H>0?D/H:D,K=U>0?Math.round((U-V)/U*100):0,P=K>=40?"#10b981":K>=20?"#f59e0b":"#ef4444",te=U>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${P};">${K}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,K)}%;background:${P};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${m*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
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
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(_=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(_)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(F)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${E}</div></td>
            <td class="px-4 py-3 text-right">${ee}</td>
            <td class="px-4 py-3">${x}</td>
            <td class="px-4 py-3">${T}</td>
            <td class="px-4 py-3">${te}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${f}')" title="Editar" aria-label="Editar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button type="button" onclick="duplicarProducto('${f}')" title="Duplicar" aria-label="Duplicar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button type="button" onclick="deleteProduct('${f}')" title="Eliminar" aria-label="Eliminar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function q({id:e,title:m,titleColor:f,titleBg:k,btnLabel:$,btnOnclick:E,btnColor:S,extraBtnHTML:y,products:F,renderFila:W,headers:U,emptyMsg:ee}){const Y=document.getElementById("inventoryTipoFilter")?.value||"";if(Y==="materia"&&e!=="mp"||Y==="producto"&&e==="mp")return"";const x=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(F.length===0&&x)return"";const T=C(F),D=`_invPage_${e}`,H=window._invPageSize||10;window[D]=window[D]||1;const V=T.length,K=Math.max(1,Math.ceil(V/H));window[D]>K&&(window[D]=1);const P=window[D],te=(P-1)*H,_=T.slice(te,te+H),Q=_.length===0?`<tr><td colspan="${U.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${ee}</td></tr>`:_.map((j,ne)=>W(j,ne)).join(""),se=U.map(j=>{const ne=j.colId==="sku"?" inv-col-hidden-sku":j.colId==="proveedor"?" inv-col-hidden-prov":"",ie=j.align==="right"?" text-right":" text-left";return j.sortKey?`<th class="px-4 py-3${ie} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${ne}" onclick="sortInventory('${j.sortKey}')" style="white-space:nowrap;">${j.label} \u2195</th>`:`<th class="px-4 py-3${ie} text-xs font-semibold text-gray-500 uppercase tracking-wide${ne}" style="white-space:nowrap;">${j.label}</th>`}).join("");let re="";if(K>1||V>H){const j=Math.min(te+H,V);re=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${te+1}\u2013${j}</b> de <b>${V}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${e}',${P-1})" ${P<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${P<=1?"default":"pointer"};opacity:${P<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,K)},(ne,ie)=>{let R=P<=3?ie+1:P+ie-2;return R<1&&(R=null),R>K&&(R=null),R===null?"":`<button onclick="invSectionPage('${e}',${R})" style="min-width:30px;padding:4px 8px;border:1px solid ${R===P?"#C5973B":"#e5e7eb"};border-radius:7px;background:${R===P?"#C5973B":"#fff"};color:${R===P?"#fff":"#374151"};font-weight:${R===P?700:400};font-size:13px;cursor:${R===P?"default":"pointer"};" ${R===P?"disabled":""}>${R}</button>`}).join("")}
                    <button onclick="invSectionPage('${e}',${P+1})" ${P>=K?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${P>=K?"default":"pointer"};opacity:${P>=K?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${f}33;box-shadow:0 2px 12px ${f}11;">
            <!-- Header de secci\xF3n -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:${k};border-bottom:1.5px solid ${f}33;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;font-weight:800;color:${f};">${m}</span>
                    <span style="background:${f};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${V}</span>
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
                    <tbody>${Q}</tbody>
                </table>
            </div>
            ${re}
        </div>`}const N=r.filter(e=>!e.deletedAt),Z=N.length,A=N.reduce((e,m)=>{const f=l.get(String(m.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(m):parseInt(m.stock)||0);return e+(Number(m.cost)||0)*Math.max(0,f)},0),J=N.filter(e=>(l.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0))<=(e.stockMin||5)).length,X=N.filter(e=>(!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")&&Number(e.price)>0),ae=X.length?X.reduce((e,m)=>{const f=Number(m.price)||0,k=Number(m.cost)||0;return e+(f>0?(f-k)/f*100:0)},0)/X.length:0;let oe=document.getElementById("invKpiBar");oe||(oe=document.createElement("div"),oe.id="invKpiBar",i.parentNode.insertBefore(oe,i)),oe.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${Z}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#7c3aed;">$${A.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${J>0?"#ef4444":"#10b981"};">${J}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${ae>=40?"#10b981":ae>=20?"#f59e0b":"#ef4444"};">${ae.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const le=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#C5973B",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",extraBtnHTML:'<button type="button" onclick="injectPackModal();openPackModal()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:M,renderFila:v,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:G,renderFila:z,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#7c3aed",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:L,renderFila:B,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#6d28d9",titleBg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",products:O,renderFila:u,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],ce=(h||w||I).length>0;let de=!1;for(const e of le){const m=q(e);m&&(de=!0);let f=document.getElementById(`invSec_${e.id}`);f||(f=document.createElement("div"),f.id=`invSec_${e.id}`,i.appendChild(f));const k=e.products.length+"_"+e.products.reduce(($,E)=>$+String(E.id),"")+"_"+(window[`_invPage_${e.id}`]||1)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+a;f._hash!==k&&(f.innerHTML=m,f._hash=k)}const pe=new Set(le.map(e=>`invSec_${e.id}`));for(let e=i.children.length-1;e>=0;e--){const m=i.children[e];m.id&&m.id.startsWith("invSec_")&&!pe.has(m.id)&&m.remove()}ce&&!de&&(i.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                style="padding:10px 22px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:.875rem;font-weight:700;cursor:pointer;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(t,o){const a=`_invPage_${t}`,s=window.products||[],n=t==="mp"?s.filter(d=>d.tipo==="materia_prima"):t==="svc"?s.filter(d=>d.tipo==="servicio"):t==="pv"?s.filter(d=>d.tipo==="producto_variable"):s.filter(d=>!d.tipo||d.tipo==="producto"||d.tipo==="producto_interno"||d.tipo==="pack"),i=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",r=(document.getElementById("inventoryTagFilter")||{}).value||"",l=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",c=n.filter(d=>{const h=!i||d.name.toLowerCase().includes(i)||(d.sku||"").toLowerCase().includes(i)||(d.proveedor||"").toLowerCase().includes(i)||(d.notas||"").toLowerCase().includes(i)||(d.tags||[]).some(b=>b.toLowerCase().includes(i)),w=!r||d.tags&&d.tags.includes(r),I=!l||(d.proveedor||"").toLowerCase().includes(l);return h&&w&&I}),g=Math.max(1,Math.ceil(c.length/(window._invPageSize||10)));window[a]=Math.max(1,Math.min(o,g)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,o,a,s,n){let i=document.getElementById("inventoryPaginationBar");if(!i){const g=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!g)return;i=document.createElement("div"),i.id="inventoryPaginationBar",g.insertAdjacentElement("afterend",i)}if(o<=1&&a<=n){i.innerHTML="";return}const r=Math.min(s+n,a),l=`Mostrando <b>${s+1}\u2013${r}</b> de <b>${a}</b> productos`;function c(){const g=[],d=(h,w)=>{for(let I=h;I<=w;I++)g.push(I)};return o<=7?d(1,o):(g.push(1),t>4&&g.push("..."),d(Math.max(2,t-2),Math.min(o-1,t+2)),t<o-3&&g.push("..."),g.push(o)),g.map(h=>{if(h==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const w=h===t;return`<button onclick="invGoToPage(${h})"
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
                    ${[10,25,50,100].map(g=>`<option value="${g}" ${g===n?"selected":""}>${g} por p\xE1gina</option>`).join("")}
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
        </div>`}function invGoToPage(t){const o=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(t,o)),renderInventoryTable();const a=document.getElementById("inventoryTable");a&&a.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){window._invPageSize=parseInt(t),window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const a=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("movTipoFilter")||{}).value||"";let n=window.stockMovements||[];a&&(n=n.filter(b=>b.productoNombre?.toLowerCase().includes(a)||(b.motivo||"").toLowerCase().includes(a))),s&&(n=n.filter(b=>(b.tipo||"")===s));const i=_fechaHoy?_fechaHoy():new Date().toISOString().split("T")[0],r=(window.stockMovements||[]).filter(b=>{try{const L=new Date(b.fecha);return L.getFullYear()+"-"+("0"+(L.getMonth()+1)).slice(-2)+"-"+("0"+L.getDate()).slice(-2)===i}catch{return!1}}),l={};r.forEach(b=>{l[b.tipo]=(l[b.tipo]||0)+1});const c={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},g={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let d=document.getElementById("movResumenHoy");d||(d=document.createElement("div"),d.id="movResumenHoy",o.parentNode.insertBefore(d,o));const h=Object.keys(l).map(b=>`${c[b]||"\u26AA"} ${g[b]||b}: <strong>${l[b]}</strong>`);d.innerHTML=h.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${h.join("&nbsp;&nbsp;")}
           </div>`:"";let w=document.getElementById("movExportCSVBtn");if(w||(w=document.createElement("button"),w.id="movExportCSVBtn",w.textContent="\u{1F4E5} Exportar historial CSV",w.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",w.onclick=function(){const b=window.stockMovements||[];let O=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;b.forEach(B=>{const u=[new Date(B.fecha).toLocaleString("es-MX"),B.productoNombre||"",B.tipo||"",B.cantidad,B.motivo||"",B.stockAntes??"",B.stockDespues??""];O+=u.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")+`
`});const G=new Blob([O],{type:"text/csv;charset=utf-8;"}),M=URL.createObjectURL(G),C=document.createElement("a");C.href=M,C.download=`movimientos-${i}.csv`,C.click(),URL.revokeObjectURL(M)},o.parentNode.insertBefore(w,o)),!n.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const I={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=n.slice(0,200).map(b=>{const L=new Date(b.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),O=b.cantidad>=0?`+${b.cantidad}`:`${b.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${I[b.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(b.productoNombre||(b.productoId&&!(window.products||[]).find(G=>String(G.id)===String(b.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${L} \xB7 ${b.tipo} \xB7 ${_esc(b.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${b.cantidad>=0?"#10b981":"#ef4444"};">${O} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${b.stockAntes} \u2192 ${b.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){showConfirm("Se borrar\xE1 permanentemente todo el historial de movimientos de inventario.","\xBFBorrar historial?").then(t=>{t&&(window.stockMovements=[],window.stockMovimientos=[],saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").delete().neq("id","00000000-0000-0000-0000-000000000000").then(({error:o})=>{o&&console.warn("[Inv] Error limpiando stock_movements relacional:",o.message)}),renderMovimientos())})}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const o=document.getElementById(t);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const a={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(s=>{const n=new Date(s.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),i=s.cantidad>=0?`+${s.cantidad}`:`${s.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${a[s.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(s.productoNombre||(s.productoId&&!(window.products||[]).find(r=>String(r.id)===String(s.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${n} \xB7 ${s.tipo} \xB7 ${_esc(s.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${s.cantidad>=0?"#10b981":"#ef4444"};">${i} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${s.stockAntes} \u2192 ${s.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const o=(window.products||[]).find(s=>String(s.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const a=JSON.parse(JSON.stringify(o));a.id=_genId(),a.name="Copia de "+o.name,a.sku=(o.sku||"")+"-C",a.stock=0,a.historialPrecios=[],a.historialCostos=[],window.products.unshift(a),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${a.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(r=>!r.tipo||r.tipo==="producto"||r.tipo==="producto_interno"),o=t.map(r=>{const l=r.price>0&&r.cost>0?(r.price-r.cost)/r.price*100:null;return{...r,_margen:l}}).sort((r,l)=>(l._margen??-1/0)-(r._margen??-1/0)),a=o.map((r,l)=>{const c=r._margen!==null?r._margen.toFixed(1)+"%":"\u2014",g=r.price>0&&r.cost>0?"$"+(r.price-r.cost).toFixed(2):"\u2014",d=r._margen===null?"#9ca3af":r._margen>=50?"#16a34a":r._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${l===0?"\u{1F947}":l===1?"\u{1F948}":l===2?"\u{1F949}":`${l+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(r.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(r.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(r.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${g}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${d};font-size:14px;">${c}</td>
        </tr>`}).join(""),s=o.filter(r=>r._margen!==null).reduce((r,l,c,g)=>r+l._margen/g.length,0),n=o[0];let i=document.getElementById("_mkRentabilidadModal");i||(i=document.createElement("div"),i.id="_mkRentabilidadModal",i.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",i.addEventListener("click",r=>{r.target===i&&(i.style.display="none")}),document.body.appendChild(i)),i.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${o.some(r=>r._margen!==null)?s.toFixed(1)+"%":"\u2014"}</div>
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
        </div>`,i.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(a=>{a.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),t.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#7c3aed;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const o=(window.pedidos||[]).filter(s=>!["cancelado","finalizado"].includes(s.status||"")&&(s.productosInventario||[]).some(n=>t.includes(String(n.id))));if(o.length>0){const s=o.map(n=>n.folio||n.id).slice(0,5).join(", ");if(!confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${s}). \xBFEliminar de todas formas?`))return}if(!confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`))return;const a=[...t];if(window.products=(window.products||[]).filter(s=>!a.includes(String(s.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",a)}catch(s){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",s)}manekiToastExport(`\u{1F5D1} ${a.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),o=(window.products||[]).filter(c=>t.includes(String(c.id))),a="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",s=o.map(c=>[c.tipo||"pt",c.name,c.sku||"",c.cost||0,c.price||0,c.stock||0,c.stockMin||5,c.proveedor||"",c.notas||""].map(g=>`"${String(g).replace(/"/g,'""')}"`).join(",")),n="\uFEFF"+a+`
`+s.join(`
`),i=new Blob([n],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(i),l=document.createElement("a");l.href=r,l.download="inventario_seleccion.csv",l.click(),URL.revokeObjectURL(r),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;async function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const o=await new Promise(s=>{const n=document.getElementById("mkBatchCatModal");n&&n.remove();const r=(window.categories||[]).map(c=>`<option value="${c.id}">${c.emoji||""} ${c.name}</option>`).join(""),l=document.createElement("div");l.id="mkBatchCatModal",l.className="mk-modal-overlay",l.innerHTML=`<div class="mk-modal-box" style="max-width:360px">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C1} Cambiar categor\xEDa en lote</h3>
          <p style="font-size:.8rem;color:#6b7280;margin-bottom:10px;">${t.length} producto(s) seleccionado(s)</p>
          <select id="mkBatchCatSel" class="mk-input w-full mb-4">
              <option value="">Seleccionar categor\xEDa...</option>
              ${r}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkBatchCatModal').remove();window._mkBCR(null)">Cancelar</button>
              <button type="button" class="mk-btn-primary" onclick="window._mkBCR((document.getElementById('mkBatchCatSel') as HTMLSelectElement).value||null)">Aplicar</button>
          </div>
      </div>`,window._mkBCR=c=>{l.remove(),s(c)},document.body.appendChild(l),setTimeout(()=>document.getElementById("mkBatchCatSel")?.focus(),50)});if(!o)return;const a=(window.categories||[]).find(s=>String(s.id)===String(o));if(!a){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(s=>{t.includes(String(s.id))&&(s.category=a.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;const _MK_TIPO_LABELS={"":"Todos",producto:"Productos",materia:"Materia Prima"};window._mkInvSetTipo=function(t){const o=document.getElementById("inventoryTipoFilter");o&&(o.value=t,o.dispatchEvent(new Event("change")))},window._mkInvClearOne=function(t){const o=document.getElementById(t);o&&(o.value="",o.dispatchEvent(new Event(t==="inventorySearch"?"input":"change")))},window._mkInvClearFilters=function(){["inventoryTagFilter","inventoryProveedorFilter","inventoryTipoFilter"].forEach(o=>{const a=document.getElementById(o);a&&(a.value="")});const t=document.getElementById("inventorySearch");t?(t.value="",t.dispatchEvent(new Event("input"))):typeof renderInventoryTable=="function"&&renderInventoryTable()};function _mkInvSyncSeg(){const t=document.getElementById("inventoryTipoFilter"),o=document.getElementById("mkInvTipoSeg");!t||!o||o.querySelectorAll("button").forEach(a=>a.classList.toggle("active",a.dataset.v===t.value))}function _mkInvToolbarOnce(){const t=document.getElementById("inventoryTipoFilter"),o=t?.parentElement;if(!(!t||!o)){if(!document.getElementById("mkInvTipoSeg")){t.style.display="none";const a=document.createElement("div");a.id="mkInvTipoSeg",a.className="mk-segmented",a.setAttribute("role","group"),a.setAttribute("aria-label","Tipo de producto"),a.innerHTML=[...t.options].map(s=>{const n=_MK_TIPO_LABELS[s.value]??(s.textContent||"").replace(/^[^\p{L}]+/u,"").trim();return`<button type="button" data-v="${s.value}" onclick="_mkInvSetTipo('${s.value}')">${n}</button>`}).join(""),t.parentElement.insertBefore(a,t)}if(!document.getElementById("mkInvDensity")&&typeof window.mkRenderDensityToggle=="function"){const a=document.createElement("span");a.id="mkInvDensity",a.style.marginLeft="auto",a.innerHTML=window.mkRenderDensityToggle(),o.appendChild(a),typeof window.mkAplicarDensidad=="function"&&window.mkAplicarDensidad()}if(!document.getElementById("mkInvFilterInfo")){const a=document.createElement("div");a.id="mkInvFilterInfo",a.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;",o.parentElement.insertBefore(a,o.nextSibling)}if(!document.getElementById("mkInvHerramientas")){const a=document.createElement("div");a.id="mkInvHerramientas",a.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;",a.innerHTML=`
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo f\xEDsico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo f\xEDsico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categor\xEDa"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categor\xEDa</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock m\xEDnimo autom\xE1tico desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock m\xEDnimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gr\xE1fica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
    `;const s=document.getElementById("mkInvFilterInfo");s?s.parentElement.insertBefore(a,s):o.parentElement.insertBefore(a,o.nextSibling)}}}function _mkInvCounterChips(){const t=document.getElementById("mkInvFilterInfo");if(!t)return;const o=document.getElementById("invDualContainer"),a=o?o.querySelectorAll(".inv-bulk-cb").length:0,s=(window.products||[]).length,n=document.getElementById("inventorySearch"),i=document.getElementById("inventoryTagFilter"),r=document.getElementById("inventoryProveedorFilter"),l=document.getElementById("inventoryTipoFilter"),c=[];n&&n.value.trim()&&c.push(`<span class="mk-filter-chip">Buscar: ${_esc(n.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">\u2715</button></span>`),l&&l.value&&c.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[l.value]||l.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">\u2715</button></span>`),i&&i.value&&c.push(`<span class="mk-filter-chip">Tag: ${_esc(i.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">\u2715</button></span>`),r&&r.value&&c.push(`<span class="mk-filter-chip">Proveedor: ${_esc(r.options[r.selectedIndex]?.text||r.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">\u2715</button></span>`);let g=`<span class="mk-result-count">Mostrando <b>${a}</b> de ${s} producto${s!==1?"s":""}</span>`;c.length&&(g+=`<div class="mk-filter-chips">${c.join("")}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`),t.innerHTML=g,_mkInvSyncSeg()}function _mkInvSummaryRow(){const t=document.getElementById("invDualContainer");if(!t||!t.parentElement)return;const o=new Set([...t.querySelectorAll(".inv-bulk-cb")].map(l=>String(l.dataset.id))),a=window._invStockCache;let s=0,n=0,i=0;(window.products||[]).forEach(l=>{if(!o.has(String(l.id)))return;i++;const c=a?.get(String(l.id))??(Number(l.stock)||0);s+=(Number(l.cost)||0)*Math.max(0,c),c<=(Number(l.stockMin)||5)&&n++});let r=document.getElementById("mkInvSummary");if(i===0){r&&r.remove();return}r||(r=document.createElement("div"),r.id="mkInvSummary",r.className="mk-table-summary",r.style.cssText="display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;",t.parentElement.insertBefore(r,t.nextSibling)),r.innerHTML=`<span>Valor en costo: <b>$${s.toLocaleString("es-MX",{maximumFractionDigits:0})}</b></span><span style="color:var(--tx-muted);">${i} producto${i!==1?"s":""}</span>`+(n>0?`<span style="color:#dc2626;font-weight:800;">\u26A0 ${n} bajo stock</span>`:'<span style="color:#059669;font-weight:700;">\u2713 stock saludable</span>')}(function(){const o=window.renderInventoryTable;if(typeof o!="function"||o._mkWrapped)return;const a=function(...s){const n=o.apply(this,s);try{_mkInvToolbarOnce(),_mkInvCounterChips(),_mkInvSummaryRow()}catch{}return n};a._mkWrapped=!0,window.renderInventoryTable=a})();function _mkInvModal(t,o,a,s="700px"){let n=document.getElementById(t+"_ov");n||(n=document.createElement("div"),n.id=t+"_ov",n.style.cssText="position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;",document.body.appendChild(n)),n.innerHTML=`
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${s};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${o}</h3>
        <button onclick="document.getElementById('${t}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">\u2715</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${a}</div>
    </div>`,n.onclick=i=>{i.target===n&&n.remove()},n.style.display="flex"}function abrirConteoFisico(){const t=(window.products||[]).filter(n=>n.tipo!=="servicio"&&n.activo!==!1);if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin productos para contar","warn");return}const o=typeof window._esc=="function"?window._esc:n=>String(n||""),s=`
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades f\xEDsicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categor\xEDa</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo f\xEDsico</th>
      </tr></thead>
      <tbody>${t.map((n,i)=>{const r=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0;return`<tr style="${i%2?"background:#f9fafb":""}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${o(n.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${o(n.category||"\u2014")}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${r}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${r}" data-pid="${o(n.id)}" data-sistema="${r}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" style="padding:9px 24px;border-radius:10px;background:linear-gradient(135deg,#C5A572,#a8864f);color:white;border:none;cursor:pointer;font-weight:700;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",s,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const t=document.querySelectorAll("#mkConteo_ov .conteo-input");let o=0;if(t.forEach(a=>{const s=a.dataset.pid,n=Number(a.dataset.sistema),i=Number(a.value);if(isNaN(i)||i===n)return;const r=(window.products||[]).find(c=>String(c.id)===String(s));if(!r)return;const l=i-n;r.stock=i,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:r.id,productoNombre:r.name,tipo:l>0?"entrada_manual":"salida_manual",cantidad:Math.abs(l),motivo:"Conteo f\xEDsico",stockAntes:n,stockDespues:i}),o++}),o===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${o} ajuste${o!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const t=(window.products||[]).filter(n=>n.tipo==="servicio"||n.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5));if(!t.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const o=typeof window._esc=="function"?window._esc:n=>String(n||""),a={};t.forEach(n=>{const i=n.proveedor||"Sin proveedor";a[i]||(a[i]=[]),a[i].push(n)});const s=Object.entries(a).map(([n,i])=>{const r=o(n),l=i.map(d=>{const h=typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0,w=Number(d.stockMin)||5,I=Math.max(1,w*2-h);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${o(d.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${h}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${w}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#C5A572;">${I}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${o(d.unidad||"pza")}</td></tr>`}).join(""),c=encodeURIComponent(`Hola, necesito reabastecer:
${i.map(d=>{const h=Number(d.stock)||0,w=Number(d.stockMin)||5;return`\u2022 ${d.name}: ${Math.max(1,w*2-h)} ${d.unidad||"pza"}`}).join(`
`)}`),g=p?.proveedorUrl?.startsWith("http")?p.proveedorUrl:`https://wa.me/?text=${c}`;return`<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${r} (${i.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:
${i.map(d=>`\u2022 ${d.name}: ${Math.max(1,(Number(d.stockMin)||5)*2-(typeof getStockEfectivo=="function"?getStockEfectivo(d):Number(d.stock)||0))} ${d.unidad||"pza"}`).join(`
`)}`)}" target="_blank"
            style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#25D366;color:white;text-decoration:none;font-weight:700;">\u{1F4F2} WA</a>
          <button onclick="_mkExportReabCSV('${r}')" style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#10b981;color:white;border:none;cursor:pointer;font-weight:700;">\u{1F4E5} CSV</button>
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
    </div>`}).join("");_mkInvModal("mkReab",`\u{1F6D2} Reabastecimiento \u2014 ${t.length} productos`,s,"720px")}window.abrirReabastecimiento=abrirReabastecimiento,window._mkExportReabCSV=function(t){const a=["Producto,Stock actual,Stock m\xEDnimo,Cantidad a pedir,Unidad,Proveedor",...(window.products||[]).filter(n=>{if(n.tipo==="servicio"||n.activo===!1)return!1;const i=n.proveedor||"Sin proveedor";return t&&i!==t?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0)<=(Number(n.stockMin)||5)}).map(n=>{const i=typeof getStockEfectivo=="function"?getStockEfectivo(n):Number(n.stock)||0,r=Number(n.stockMin)||5;return`"${n.name}",${i},${r},${Math.max(1,r*2-i)},${n.unidad||"pza"},"${n.proveedor||""}"`})].join(`
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([a],{type:"text/csv;charset=utf-8;"})),s.download=`reabastecimiento_${new Date().toISOString().split("T")[0]}.csv`,s.click()};function mostrarDonutCategoria(){const t=typeof window._esc=="function"?window._esc:l=>String(l||""),o={};(window.products||[]).forEach(l=>{if(l.tipo==="servicio"||l.activo===!1)return;const c=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,g=(Number(l.price)||0)*c,d=l.category||"Sin categor\xEDa";o[d]=(o[d]||0)+g});const a=Object.entries(o).sort((l,c)=>c[1]-l[1]),s=a.reduce((l,[,c])=>l+c,0),n=["#C5A572","#7c3aed","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#f97316","#14b8a6"],i=a.map(([l,c],g)=>{const d=s>0?(c/s*100).toFixed(1):"0";return`<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${n[g%n.length]};margin-right:6px;"></span>
        ${t(l)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${c.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${d}%</td>
    </tr>`}).join(""),r=`
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
    </div>`;_mkInvModal("mkDonut","\u{1F4CA} Valor de Inventario por Categor\xEDa",r,"700px"),setTimeout(()=>{const l=document.getElementById("mkDonutCat");if(l)try{const c=window.Chart;if(typeof c>"u"){l.style.display="none";return}new c(l,{type:"doughnut",data:{labels:a.map(([g])=>g),datasets:[{data:a.map(([,g])=>Math.round(g)),backgroundColor:a.map((g,d)=>n[d%n.length]),borderWidth:2}]},options:{plugins:{legend:{display:!1}},cutout:"65%",responsive:!1}})}catch{l&&(l.style.display="none")}},100)}window.mostrarDonutCategoria=mostrarDonutCategoria;function sugerirStockMinimo(){const t=typeof window._esc=="function"?window._esc:r=>String(r||""),o=new Date;o.setDate(o.getDate()-60);const a={};(window.pedidosFinalizados||[]).forEach(r=>{const l=r.fechaFinalizado||r.entrega||"";l&&new Date(l)<o||(r.productosInventario||[]).forEach(c=>{!c.id||c.id==="libre"||(a[String(c.id)]=(a[String(c.id)]||0)+(Number(c.quantity||c.cantidad)||1))})});const s=(window.products||[]).filter(r=>r.tipo!=="servicio"&&r.activo!==!1&&a[String(r.id)]);if(!s.length){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos de consumo en los \xFAltimos 60 d\xEDas","warn");return}const i=`
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
      <tbody>${s.map(r=>{const l=a[String(r.id)]||0,c=l/60,g=Math.max(1,Math.ceil(c*14)),d=Number(r.stockMin)||0,h=g!==d?`<span style="color:${g>d?"#10b981":"#f59e0b"};font-weight:700;">${g>d?"\u25B2":"\u25BC"} ${g}</span>`:`<span style="color:#6b7280;">${g} (sin cambio)</span>`;return`<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${t(r.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${l}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${c.toFixed(1)}/d\xEDa</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${d}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${h}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${t(r.id)}" data-nuevo="${g}" class="mkStockMinCb" style="accent-color:#C5A572;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" style="padding:9px 24px;border-radius:10px;background:linear-gradient(135deg,#C5A572,#a8864f);color:white;border:none;cursor:pointer;font-weight:700;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",i,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const t=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let o=0;t.forEach(a=>{const s=a.dataset.pid,n=Number(a.dataset.nuevo),i=(window.products||[]).find(r=>String(r.id)===String(s));!i||isNaN(n)||(i.stockMin=n,o++)}),o&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${o} producto${o!==1?"s":""}`,"ok"))};function archivarProducto(t){const o=(window.products||[]).find(i=>String(i.id)===String(t));if(!o)return;const a=o.activo!==!1,s=a?"archivar":"desarchivar",n=a?`\xBFArchivar "${o.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${o.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(n,a?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(i=>{i&&(o.activo=!a,o.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(a?`\u{1F4C1} "${o.name}" archivado`:`\u{1F513} "${o.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(t){const o=typeof window._esc=="function"?window._esc:u=>String(u||""),a=(window.products||[]).find(u=>String(u.id)===String(t));if(!a){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const s=Date.now()-90*864e5,n=new Set,i=[],r=u=>{if(!u)return;const v=u.fecha?new Date(u.fecha+(u.hora?"T"+u.hora:"")).getTime():u.timestamp?new Date(u.timestamp).getTime():0;if(v&&v<s)return;const z=u.id||String(u.productoId||t)+"_"+v+"_"+(u.cantidad||0);n.has(z)||(n.add(z),i.push({...u,_ts:v||Date.now()}))};(a.movimientos||[]).forEach(r),(window.stockMovimientos||[]).filter(u=>String(u.productoId)===String(t)).forEach(r),i.sort((u,v)=>v._ts-u._ts);const l=[];for(let u=12;u>=0;u--){const v=new Date(Date.now()-u*7*864e5),z=new Date(v.getTime()-7*864e5),q=`${z.getDate()}/${z.getMonth()+1}`;let N=0,Z=0;i.forEach(A=>{if(A._ts>=z.getTime()&&A._ts<v.getTime()){const J=A.stockDespues!=null&&A.stockAntes!=null?Number(A.stockDespues)-Number(A.stockAntes):0,X=(A.tipo||"").toLowerCase();J>0||X.includes("entrada")||X.includes("compra")||X.includes("ajuste_positivo")?N+=Math.abs(Number(A.cantidad)||Math.abs(J)||1):Z+=Math.abs(Number(A.cantidad)||Math.abs(J)||1)}}),l.push({label:q,entradas:N,salidas:Z})}const c=Math.max(1,...l.map(u=>Math.max(u.entradas,u.salidas))),g=480,d=100,h=Math.floor((g-20)/l.length/2)-1,w=l.map((u,v)=>{const z=10+v*(h*2+4),q=Math.round(u.entradas/c*(d-20)),N=Math.round(u.salidas/c*(d-20));return`
      <rect x="${z}" y="${d-10-q}" width="${h}" height="${q}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${u.entradas}"/>
      <rect x="${z+h+1}" y="${d-10-N}" width="${h}" height="${N}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${u.salidas}"/>
      <text x="${z+h}" y="${d-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${u.label}</text>`}).join(""),I=i.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">\u25A0 Entradas</span>
        <span style="color:#ef4444;">\u25A0 Salidas</span>
      </div>
      <svg viewBox="0 0 ${g} ${d}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${d-10}" x2="${g-10}" y2="${d-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${w}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">\u2190 13 semanas</div>
    </div>`,b={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},L=i.slice(0,30).map(u=>{const v=u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):"\u2014"),z=u.hora||"",q=b[u.tipo||""]||u.tipo||"\u2014",N=u.stockDespues!=null&&u.stockAntes!=null?Number(u.stockDespues)-Number(u.stockAntes):0,Z=Number(u.cantidad)||Math.abs(N)||0,A=N>0||(u.tipo||"").includes("entrada")||(u.tipo||"").includes("compra"),J=A?"#10b981":"#ef4444",X=A?`+${Z}`:`-${Z}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${o(v)} ${z?`<span style="color:#9ca3af;font-size:.72rem;">${o(z.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${o(q)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${J};">${X}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${u.stockDespues!=null?u.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o(u.motivo||"")}">${o(u.motivo||"")}</td>
    </tr>`}).join(""),O=typeof getStockEfectivo=="function"?getStockEfectivo(a):Number(a.stock)||0,G=i.reduce((u,v)=>{const z=v.stockDespues!=null&&v.stockAntes!=null?Number(v.stockDespues)-Number(v.stockAntes):0;return u+(z>0||(v.tipo||"").includes("entrada")||(v.tipo||"").includes("compra")?Math.abs(Number(v.cantidad)||Math.abs(z)||0):0)},0),M=i.reduce((u,v)=>{const z=v.stockDespues!=null&&v.stockAntes!=null?Number(v.stockDespues)-Number(v.stockAntes):0,q=z>0||(v.tipo||"").includes("entrada")||(v.tipo||"").includes("compra");return u+(q?0:Math.abs(Number(v.cantidad)||Math.abs(z)||0))},0),C=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${O}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Stock actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">+${G}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Entradas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#fef2f2;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#ef4444;">-${M}</div>
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
      <tbody>${L}</tbody>
    </table>
    ${i.length>30?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${i.length-30} m\xE1s</p>`:""}`:""}
  `,B=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button onclick="(function(){
        var movs=${JSON.stringify(i.map(u=>({fecha:u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):""),hora:u.hora||"",tipo:u.tipo||"",cantidad:u.cantidad||0,motivo:u.motivo||"",stockAntes:u.stockAntes??"",stockDespues:u.stockDespues??""})))};
        var headers=['Fecha','Hora','Tipo','Cantidad','Motivo','Stock antes','Stock despu\xE9s'];
        var csv=headers.join(',')+'\\n';
        movs.forEach(function(m){
          var row=[m.fecha,m.hora,m.tipo,m.cantidad,m.motivo,m.stockAntes,m.stockDespues];
          csv+=row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',')+'\\n';
        });
        var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;a.download='kardex-${o(a.name||"producto").replace(/[^a-zA-Z0-9]/g,"_")}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('\u{1F4E5} Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        \u{1F4E5} Exportar CSV
      </button>
    </div>
    ${C}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${o(a.name||"Producto")} (90d)`,B,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const t=window.inventarioSnapshots||[];if(t.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const o=[...t].sort((M,C)=>(M.fecha||"").localeCompare(C.fecha||"")),a=o.map(M=>M.fecha||""),s=o.map(M=>Number(M.valorTotal||M.valor||0)),n=540,i=140,r=Math.max(1,...s),l=Math.min(...s),c=r-l||1,d=`<polyline points="${s.map((M,C)=>{const B=20+C/Math.max(1,s.length-1)*(n-40),u=i-20-(M-l)/c*(i-40);return`${B},${u}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,h=s.map((M,C)=>{const B=20+C/Math.max(1,s.length-1)*(n-40),u=i-20-(M-l)/c*(i-40);return`<circle cx="${B}" cy="${u}" r="3.5" fill="#6366f1" opacity=".9"><title>${a[C]}: $${M.toLocaleString("es-MX")}</title></circle>`}).join(""),w=a.filter((M,C)=>C===0||C===a.length-1||C%Math.ceil(a.length/6)===0).map((M,C,B)=>`<text x="${20+a.indexOf(M)/Math.max(1,a.length-1)*(n-40)}" y="${i-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${M.slice(5)}</text>`).join(""),I=s[s.length-1]||0,b=s[0]||0,L=b>0?((I-b)/b*100).toFixed(1):"\u2014",O=Number(L)>=0?"#10b981":"#ef4444",G=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${I.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${O};">${Number(L)>=0?"+":""}${L}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variaci\xF3n total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${o.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${n} ${i}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${i-20}" x2="${n-10}" y2="${i-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${d}${h}${w}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">\u2190 Valor de inventario en costo \xB7 ${o.length} puntos</p>
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",G,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;
//# sourceMappingURL=inventory-5.js.map
