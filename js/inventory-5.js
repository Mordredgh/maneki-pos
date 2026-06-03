function _levenshtein(t,o){const s=t.length,n=o.length,a=Array.from({length:s+1},(r,i)=>Array.from({length:n+1},(c,x)=>x===0?i:0));for(let r=1;r<=n;r++)a[0][r]=r;for(let r=1;r<=s;r++)for(let i=1;i<=n;i++)a[r][i]=t[r-1]===o[i-1]?a[r-1][i-1]:1+Math.min(a[r-1][i],a[r][i-1],a[r-1][i-1]);return a[s][n]}function _fuzzyMatch(t,o,s=2){return t=t.toLowerCase().trim(),o=o.toLowerCase(),!t||o.includes(t)?!0:o.split(/[\s,.-]+/).some(a=>{const r=a.substring(0,t.length+2);return r.length>=t.length-1&&_levenshtein(t,r)<=s})}window._fuzzyMatch=_fuzzyMatch;function calcularProducibles(t){if(!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0)return null;let o=1/0;for(const s of t.mpComponentes){const n=(window.products||[]).find(i=>String(i.id)===String(s.id));if(!n)return 0;const a=typeof getStockEfectivo=="function"?getStockEfectivo(n):n.stock||0,r=parseFloat(s.qty)||1;o=Math.min(o,Math.floor(a/r))}return o===1/0?0:o}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",n=>{n.target===t&&(t.style.display="none")}),document.body.appendChild(t));const s=[...new Set((window.products||[]).map(n=>n.category).filter(Boolean))].map(n=>{const a=(window.categories||[]).find(r=>String(r.id)===String(n));return`<option value="${_esc(n)}">${_esc(a?a.emoji?a.emoji+" "+a.name:a.name:n)}</option>`}).join("");t.innerHTML=`
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
            <button onclick="bulkPrecioAplicar()"
                style="padding:8px 18px;border:none;border-radius:10px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;">\u2705 Aplicar</button>
        </div>
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,s=document.getElementById("bulkPrecioSoloMP")?.checked||!1,n=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(a=>n&&String(a.category)!==n?!1:o&&s?!0:!(o&&!(!a.tipo||a.tipo==="producto"||a.tipo==="producto_interno"||a.tipo==="pack")||s&&a.tipo!=="materia_prima")).map(a=>{const r=s&&!o?"cost":"price",i=parseFloat(a[r])||0,c=Math.max(0,Math.round(i*(1+t/100)*100)/100);return{p:a,campoKey:r,precioActual:i,precioNuevo:c}}).filter(a=>a.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const o=_bulkPrecioGetAfectados();if(!o.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=o.slice(0,50).map(({p:s,campoKey:n,precioActual:a,precioNuevo:r})=>{const i=r-a,c=i>0?"#16a34a":i<0?"#dc2626":"#6b7280",x=n==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(s.name)}">${_esc(s.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${x}: $${a.toFixed(2)}</span>
            <span style="font-weight:700;color:${c};white-space:nowrap;">\u2192 $${r.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}bulkPrecioPreview();const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,s=document.getElementById("bulkPrecioSoloMP")?.checked&&!document.getElementById("bulkPrecioSoloPT")?.checked?"costo":"precio",n=o>0?"+":"",a=t.slice(0,5).map(({p:r,precioActual:i,precioNuevo:c})=>`<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(r.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${i.toFixed(2)}</span>
            <span style="font-weight:700;color:${c>i?"#16a34a":"#dc2626"};">\u2192 $${c.toFixed(2)}</span>
        </div>`).join("")+(t.length>5?`<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">\u2026y ${t.length-5} m\xE1s</p>`:"");if(typeof showConfirm=="function")showConfirm(`<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${n}${o}%</strong> al ${s} de <strong>${t.length}</strong> producto(s):</p>
                ${a}
             </div>`,"\u2705 Confirmar cambio masivo").then(r=>{r&&(t.forEach(({p:i,campoKey:c,precioNuevo:x})=>{i[c]=x,i.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))});else{if(!confirm(`\xBFAplicar ${n}${o}% a ${t.length} producto(s)? Ver preview arriba.`))return;t.forEach(({p:r,campoKey:i,precioNuevo:c})=>{r[i]=c,r.updatedAt=new Date().toISOString()}),typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok")}}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;const o=window.products||[],s=o.length+"_"+o.reduce((e,p)=>e+Number(p.stock||0),0).toFixed(0)+"_"+(document.getElementById("inventorySearch")?.value||""),n=document.getElementById("invDualContainer");if(n&&n._lastHash===s)return;n&&(n._lastHash=s);let a=document.getElementById("invDualContainer");if(!a){const e=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;a=document.createElement("div"),a.id="invDualContainer",a.style.cssText="display:flex;flex-direction:column;gap:0;",e.parentNode.insertBefore(a,e),e.style.display="none"}const r=window.products||[],i=new Map(r.map(e=>[String(e.id),typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0]));if(window._invStockCache=i,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const e=document.createElement("style");e.id="invExtraColStyles",e.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(e)}let c=document.getElementById("invExtraColToggle");if(c||(c=document.createElement("button"),c.id="invExtraColToggle",c.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",c.textContent="Mostrar SKU/Proveedor",c.addEventListener("click",()=>{const e=document.getElementById("invDualContainer");if(!e)return;const p=e.classList.toggle("inv-show-extra");c.textContent=p?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),a.parentNode.insertBefore(c,a)),r.length===0){a.innerHTML=`
        <div class="mk-empty" style="padding:48px 24px;text-align:center;">
            <div class="mk-empty-icon">\u{1F4E6}</div>
            <p class="mk-empty-title">Sin productos a\xFAn</p>
            <p class="mk-empty-sub">Tu inventario est\xE1 vac\xEDo. Agrega tu primer producto para empezar.</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
                <button onclick="openAddProductModal()" class="btn-primary px-5 py-2.5 rounded-xl text-sm">
                    \u{1F4E6} Agregar Producto Terminado
                </button>
                <button onclick="injectMpModal();openAddMateriaPrimaModal()"
                    class="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                    \u{1F3ED} Agregar Materia Prima
                </button>
            </div>
        </div>`;return}const x=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",b=(document.getElementById("inventoryTagFilter")||{}).value||"",f=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function z(e){const p=window._normSearch||(g=>String(g||"").toLowerCase()),l=p(x),y=p(f),m=g=>!b||g.tags&&g.tags.includes(b),h=g=>!f||p(g.proveedor||"").includes(y);if(!x)return e.filter(g=>m(g)&&h(g));const v=e.filter(g=>(p(g.name).includes(l)||p(g.sku||"").includes(l)||p(g.proveedor||"").includes(l)||p(g.notas||"").includes(l)||(g.tags||[]).some(F=>p(F).includes(l)))&&m(g)&&h(g));return v.length>0?v:e.filter(g=>(_fuzzyMatch(l,g.name||"")||_fuzzyMatch(l,g.sku||"")||_fuzzyMatch(l,g.proveedor||""))&&m(g)&&h(g))}const $=z(r.filter(e=>e.tipo==="materia_prima")),I=z(r.filter(e=>e.tipo==="servicio")),u=z(r.filter(e=>e.tipo==="producto_variable")),L=z(r.filter(e=>!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack"));function U(e){if(!window._invSortCol)return e;const p=window._invSortCol,l=window._invSortDir;return[...e].sort((y,m)=>{let h,v;return p==="name"?(h=(y.name||"").toLowerCase(),v=(m.name||"").toLowerCase()):p==="sku"?(h=(y.sku||"").toLowerCase(),v=(m.sku||"").toLowerCase()):p==="category"?(h=(y.category||"").toLowerCase(),v=(m.category||"").toLowerCase()):p==="price"?(h=Number(y.price)||0,v=Number(m.price)||0):p==="stock"?(h=Number(y.stock)||0,v=Number(m.stock)||0):p==="margin"&&(h=y.cost&&y.price?(y.price-y.cost)/y.price:-1,v=m.cost&&m.price?(m.price-m.cost)/m.price:-1),h<v?l==="asc"?-1:1:h>v?l==="asc"?1:-1:0})}function J(e,p){const l=String(e.id),y=i.get(l)??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0),m=e.imageUrl?`<img src="${e.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3ED}"}</span>`;let h;y===0?h='<span class="badge-danger">Agotado</span>':y<=(e.stockMin||5)?h='<span class="badge-warning">Bajo Stock</span>':h='<span class="badge-success">Disponible</span>';const v=(window.categories||[]).find(E=>E.id===e.category),g=v?v.name:e.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${p*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${l}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${m}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.historialCostos&&e.historialCostos.length?`<span title="Este producto ha tenido ${e.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#7c3aed;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialCostos.length} cambio${e.historialCostos.length>1?"s":""}</span>`:""}
                    ${e.compraPaquete?`<div style="font-size:10px;color:#7c3aed;margin-top:2px;">\u{1F4E6} Paquete: ${e.compraPaquete.cantidad} uds \xB7 $${Number(e.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(E=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#7c3aed;border:1px solid #e9d5ff;">${_esc(E)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(g)}</td>
            <td class="px-4 py-3" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(e.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${l}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${l}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${y} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(e.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${h}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button onclick="editProduct('${l}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="ajustarStock('${l}')" title="Ajustar stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4E6}</button>
                    <button onclick="duplicarProducto('${l}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button onclick="registrarMerma('${l}')" title="Registrar merma/p\xE9rdida"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C9}</button>
                    ${e.proveedorUrl?`<button onclick="window.open(this.dataset.url,'_blank')" data-url="${_esc(e.proveedorUrl)}" title="Abrir proveedor" style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F517}</button>`:""}
                    <button onclick="cambiarTipoProducto('${l}')" title="Convertir a Producto Terminado"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F4E6}</button>
                    <button onclick="deleteProduct('${l}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function G(e,p){const l=String(e.id),y=`<span style="font-size:1.6rem;">${e.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${p*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${l}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${y}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(m=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc(m)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${l}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="deleteProduct('${l}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function O(e,p){const l=String(e.id),y=e.imageUrl?`<img src="${e.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F4E6}"}</span>`,m=(window.categories||[]).find(d=>d.id===e.category),h=m?m.name:e.category||"",v=calcularDisponibilidadDesdeMP(e);let g,E;if(v!==null){const d=v.piezas,w=d===0?"#ef4444":d<=3?"#f59e0b":"#10b981",M=d===0?"#fee2e2":d<=3?"#fef3c7":"#d1fae5",_=v.detalle.map(S=>`${S.nombre}: ${S.stock}\xF7${S.qty}=${S.posibles}pzs`).join(" | ");g=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(_)}"
                        style="padding:3px 12px;border-radius:8px;background:${M};color:${w};
                               font-weight:700;font-size:.95rem;border:1px solid ${w}33;cursor:help;">
                        ${d}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,E=d===0?'<span class="badge-danger">Sin stock MP</span>':d<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const d=i.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0),w=e.stockMin||5,M=d===0?"#ef4444":d<=w?"#f59e0b":"#10b981";g=`<span style="padding:3px 12px;border-radius:8px;background:${d===0?"#fee2e2":d<=w?"#fef3c7":"#d1fae5"};color:${M};font-weight:700;font-size:.95rem;">${d}</span>`,E=d===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Agotado</span>':d<=w?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Disponible</span>'}const F=e.variants&&e.variants.length>0?e.variants.map(d=>`
                <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f3f4f6;border-radius:8px;font-size:11px;margin:1px;">
                    <b>${_esc(d.type)}:</b>${_mkColorDot(d.type,_esc(d.value))}
                    <span style="background:#e0f2fe;color:#0369a1;padding:0 4px;border-radius:99px;font-weight:600;">${d.qty??0}</span>
                </span>`).join(""):'<span class="text-xs text-gray-400">Sin variantes</span>',B=Number(e.cost)||0,H=Number(e.price)||0,D=B&&H?(()=>{const d=(H-B)/H*100,w=d>=40?"#10b981":d>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${w};">${d.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,d).toFixed(0)}%;background:${w};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${p*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${l}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${y}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${e.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${e.tipo==="pack"&&e.packComponentes&&e.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${e.packComponentes.map(d=>`${d.qty>1?d.qty+"\xD7 ":""}${_esc(d.nombre)}`).join(" + ")}</div>`:""}
                    ${e.historialPrecios&&e.historialPrecios.length?`<span title="Este producto ha tenido ${e.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialPrecios.length} cambio${e.historialPrecios.length>1?"s":""}</span>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(e.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(e.proveedorNombre)}</b>${e.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(d=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(d)}</span>`).join("")}</div>`:""}
                    ${(()=>{const d=calcularProducibles(e);if(d===null)return"";const w=d>=5?"#16a34a":d>=1?"#d97706":"#dc2626",M=d>=5?"#d1fae5":d>=1?"#fef3c7":"#fee2e2",_=d===0?"Sin stock MP":`Producibles: ${d}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${M};color:${w};border:1px solid ${w}33;">\u{1F3ED} ${_}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(h)}</td>
            <td class="px-4 py-3">${F}</td>
            <td class="px-4 py-3 text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${l}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(e.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${l}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${g}</td>
            <td class="px-4 py-3">${E}</td>
            <td class="px-4 py-3">${D}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${e.tipo==="pack"?`<button onclick="openPackModal('${l}')" title="Editar Pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`:`<button onclick="editProduct('${l}')" title="Editar"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`}
                    <button onclick="duplicarProducto('${l}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    ${e.tipo!=="pack"?`<button onclick="cambiarTipoProducto('${l}')" title="Convertir a Materia Prima"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${e.movimientos&&e.movimientos.length?`<button onclick="verMovimientosProducto('${l}')" title="Ver movimientos de stock (${e.movimientos.length})"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>`:""}
                    <button onclick="deleteProduct('${l}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function A(e,p){const l=String(e.id),y=e.imageUrl?`<img src="${e.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3AF}"}</span>`,m=(e.tablaPreciosVariable||[]).slice().sort((P,N)=>P.cantidadMin-N.cantidadMin),h=m.length?m.map(P=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${P.cantidadMin} pzas = $${Number(P.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',v=(e.mpComponentes||[]).length,g=(window.categories||[]).find(P=>String(P.id)===String(e.category)),E=g?`${g.emoji||""} ${g.name}`:"\u2014",F=m,B=F.length?F[0].precio/(F[0].cantidadMin||1):0,H=B>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${B.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',D=calcularDisponibilidadDesdeMP(e);let d,w;if(D!==null){const P=D.piezas,N=P===0?"#ef4444":P<=3?"#f59e0b":"#10b981",X=P===0?"#fee2e2":P<=3?"#fef3c7":"#d1fae5",T=D.detalle.map(j=>`${j.nombre}: ${j.stock}\xF7${j.qty}=${j.posibles}pzs`).join(" | ");d=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(T)}" style="padding:3px 12px;border-radius:8px;background:${X};color:${N};font-weight:700;font-size:.95rem;border:1px solid ${N}33;cursor:help;">${P}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,w=P===0?'<span class="badge-danger">Sin stock MP</span>':P<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else d='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',w='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const M=(e.mpComponentes||[]).reduce((P,N)=>P+(parseFloat(N.costUnit)||0)*(parseFloat(N.qty)||1),0),_=e.rendimientoPorHoja||1,S=_>0?M/_:M,k=B>0?Math.round((B-S)/B*100):0,K=k>=40?"#10b981":k>=20?"#f59e0b":"#ef4444",Q=B>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${K};">${k}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,k)}%;background:${K};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${p*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${l}"
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
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(P=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(P)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(E)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${h}</div></td>
            <td class="px-4 py-3">${H}</td>
            <td class="px-4 py-3">${d}</td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">${Q}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button onclick="editProduct('${l}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="duplicarProducto('${l}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button onclick="deleteProduct('${l}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function R({id:e,title:p,titleColor:l,titleBg:y,btnLabel:m,btnOnclick:h,btnColor:v,extraBtnHTML:g,products:E,renderFila:F,headers:B,emptyMsg:H}){const D=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(E.length===0&&D)return"";const d=U(E),w=`_invPage_${e}`,M=window._invPageSize||10;window[w]=window[w]||1;const _=d.length,S=Math.max(1,Math.ceil(_/M));window[w]>S&&(window[w]=1);const k=window[w],K=(k-1)*M,Q=d.slice(K,K+M),P=Q.length===0?`<tr><td colspan="${B.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${H}</td></tr>`:Q.map((T,j)=>F(T,j)).join(""),N=B.map(T=>{const j=T.colId==="sku"?" inv-col-hidden-sku":T.colId==="proveedor"?" inv-col-hidden-prov":"";return T.sortKey?`<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${j}" onclick="sortInventory('${T.sortKey}')" style="white-space:nowrap;">${T.label} \u2195</th>`:`<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide${j}" style="white-space:nowrap;">${T.label}</th>`}).join("");let X="";if(S>1||_>M){const T=Math.min(K+M,_);X=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${K+1}\u2013${T}</b> de <b>${_}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${e}',${k-1})" ${k<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${k<=1?"default":"pointer"};opacity:${k<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,S)},(j,te)=>{let C=k<=3?te+1:k+te-2;return C<1&&(C=null),C>S&&(C=null),C===null?"":`<button onclick="invSectionPage('${e}',${C})" style="min-width:30px;padding:4px 8px;border:1px solid ${C===k?"#C5973B":"#e5e7eb"};border-radius:7px;background:${C===k?"#C5973B":"#fff"};color:${C===k?"#fff":"#374151"};font-weight:${C===k?700:400};font-size:13px;cursor:${C===k?"default":"pointer"};" ${C===k?"disabled":""}>${C}</button>`}).join("")}
                    <button onclick="invSectionPage('${e}',${k+1})" ${k>=S?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${k>=S?"default":"pointer"};opacity:${k>=S?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${l}33;box-shadow:0 2px 12px ${l}11;">
            <!-- Header de secci\xF3n -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:${y};border-bottom:1.5px solid ${l}33;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;font-weight:800;color:${l};">${p}</span>
                    <span style="background:${l};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${_}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${g||""}
                    <button onclick="${h}"
                        style="padding:7px 16px;background:${v};color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${m}
                    </button>
                </div>
            </div>
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${N}</tr>
                    </thead>
                    <tbody>${P}</tbody>
                </table>
            </div>
            ${X}
        </div>`}const q=r.filter(e=>!e.deletedAt),oe=q.length,ne=q.reduce((e,p)=>{const l=i.get(String(p.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(p):parseInt(p.stock)||0);return e+(Number(p.cost)||0)*Math.max(0,l)},0),Z=q.filter(e=>(i.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0))<=(e.stockMin||5)).length,W=q.filter(e=>(!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")&&Number(e.price)>0),Y=W.length?W.reduce((e,p)=>{const l=Number(p.price)||0,y=Number(p.cost)||0;return e+(l>0?(l-y)/l*100:0)},0)/W.length:0;let V=document.getElementById("invKpiBar");V||(V=document.createElement("div"),V.id="invKpiBar",a.parentNode.insertBefore(V,a)),V.innerHTML=`
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
            <div style="font-size:1.6rem;font-weight:800;color:${Z>0?"#ef4444":"#10b981"};">${Z}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${Y>=40?"#10b981":Y>=20?"#f59e0b":"#ef4444"};">${Y.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;const ee=R({id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#C5973B",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",extraBtnHTML:'<button onclick="injectPackModal();openPackModal()" style="padding:7px 16px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F381} Crear Pack</button><button onclick="abrirBulkPrecioModal()" style="padding:7px 16px;background:linear-gradient(135deg,#0369a1,#38bdf8);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4CA} Actualizar precios</button>',products:L,renderFila:O,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"})+R({id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",btnColor:"linear-gradient(135deg,#0284c7,#38bdf8)",products:u,renderFila:A,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."})+R({id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#7c3aed",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",btnColor:"linear-gradient(135deg,#7c3aed,#a855f7)",products:$,renderFila:J,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"})+R({id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#6d28d9",titleBg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",btnColor:"linear-gradient(135deg,#6d28d9,#8b5cf6)",products:I,renderFila:G,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."});(x||b||f).length>0&&!ee.trim()?a.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                style="padding:10px 22px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:.875rem;font-weight:700;cursor:pointer;">
                Limpiar b\xFAsqueda
            </button>
        </div>`:a.innerHTML=ee}function invSectionPage(t,o){const s=`_invPage_${t}`,n=window.products||[],a=t==="mp"?n.filter(f=>f.tipo==="materia_prima"):t==="svc"?n.filter(f=>f.tipo==="servicio"):t==="pv"?n.filter(f=>f.tipo==="producto_variable"):n.filter(f=>!f.tipo||f.tipo==="producto"||f.tipo==="producto_interno"||f.tipo==="pack"),r=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",i=(document.getElementById("inventoryTagFilter")||{}).value||"",c=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",x=a.filter(f=>{const z=!r||f.name.toLowerCase().includes(r)||(f.sku||"").toLowerCase().includes(r)||(f.proveedor||"").toLowerCase().includes(r)||(f.notas||"").toLowerCase().includes(r)||(f.tags||[]).some(u=>u.toLowerCase().includes(r)),$=!i||f.tags&&f.tags.includes(i),I=!c||(f.proveedor||"").toLowerCase().includes(c);return z&&$&&I}),b=Math.max(1,Math.ceil(x.length/(window._invPageSize||10)));window[s]=Math.max(1,Math.min(o,b)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,o,s,n,a){let r=document.getElementById("inventoryPaginationBar");if(!r){const b=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!b)return;r=document.createElement("div"),r.id="inventoryPaginationBar",b.insertAdjacentElement("afterend",r)}if(o<=1&&s<=a){r.innerHTML="";return}const i=Math.min(n+a,s),c=`Mostrando <b>${n+1}\u2013${i}</b> de <b>${s}</b> productos`;function x(){const b=[],f=(z,$)=>{for(let I=z;I<=$;I++)b.push(I)};return o<=7?f(1,o):(b.push(1),t>4&&b.push("..."),f(Math.max(2,t-2),Math.min(o-1,t+2)),t<o-3&&b.push("..."),b.push(o)),b.map(z=>{if(z==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const $=z===t;return`<button onclick="invGoToPage(${z})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${$?"#C5973B":"#e5e7eb"};
                       background:${$?"#C5973B":"white"};color:${$?"white":"#374151"};
                       font-weight:${$?"700":"500"};font-size:13px;cursor:${$?"default":"pointer"};
                       transition:all 0.15s;"
                ${$?"disabled":""}>${z}</button>`}).join("")}r.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${c}</span>
                <select onchange="invChangePageSize(this.value)"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(b=>`<option value="${b}" ${b===a?"selected":""}>${b} por p\xE1gina</option>`).join("")}
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
                ${x()}
                <button onclick="invGoToPage(${t+1})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button onclick="invGoToPage(${o})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const o=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(t,o)),renderInventoryTable();const s=document.getElementById("inventoryTable");s&&s.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){window._invPageSize=parseInt(t),window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const s=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",n=(document.getElementById("movTipoFilter")||{}).value||"";let a=window.stockMovements||[];s&&(a=a.filter(u=>u.productoNombre?.toLowerCase().includes(s)||(u.motivo||"").toLowerCase().includes(s))),n&&(a=a.filter(u=>(u.tipo||"")===n));const r=_fechaHoy?_fechaHoy():new Date().toISOString().split("T")[0],i=(window.stockMovements||[]).filter(u=>{try{const L=new Date(u.fecha);return L.getFullYear()+"-"+("0"+(L.getMonth()+1)).slice(-2)+"-"+("0"+L.getDate()).slice(-2)===r}catch{return!1}}),c={};i.forEach(u=>{c[u.tipo]=(c[u.tipo]||0)+1});const x={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},b={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let f=document.getElementById("movResumenHoy");f||(f=document.createElement("div"),f.id="movResumenHoy",o.parentNode.insertBefore(f,o));const z=Object.keys(c).map(u=>`${x[u]||"\u26AA"} ${b[u]||u}: <strong>${c[u]}</strong>`);f.innerHTML=z.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${z.join("&nbsp;&nbsp;")}
           </div>`:"";let $=document.getElementById("movExportCSVBtn");if($||($=document.createElement("button"),$.id="movExportCSVBtn",$.textContent="\u{1F4E5} Exportar historial CSV",$.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",$.onclick=function(){const u=window.stockMovements||[];let U=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;u.forEach(A=>{const R=[new Date(A.fecha).toLocaleString("es-MX"),A.productoNombre||"",A.tipo||"",A.cantidad,A.motivo||"",A.stockAntes??"",A.stockDespues??""];U+=R.map(q=>`"${String(q).replace(/"/g,'""')}"`).join(",")+`
`});const J=new Blob([U],{type:"text/csv;charset=utf-8;"}),G=URL.createObjectURL(J),O=document.createElement("a");O.href=G,O.download=`movimientos-${r}.csv`,O.click(),URL.revokeObjectURL(G)},o.parentNode.insertBefore($,o)),!a.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const I={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=a.slice(0,200).map(u=>{const L=new Date(u.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),U=u.cantidad>=0?`+${u.cantidad}`:`${u.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${I[u.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(u.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${L} \xB7 ${u.tipo} \xB7 ${_esc(u.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${u.cantidad>=0?"#10b981":"#ef4444"};">${U} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${u.stockAntes} \u2192 ${u.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){confirm("\xBFBorrar todo el historial de movimientos?")&&(window.stockMovements=[],saveStockMovements(),renderMovimientos())}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const o=document.getElementById(t);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const s={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(n=>{const a=new Date(n.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),r=n.cantidad>=0?`+${n.cantidad}`:`${n.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${s[n.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(n.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${a} \xB7 ${n.tipo} \xB7 ${_esc(n.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${n.cantidad>=0?"#10b981":"#ef4444"};">${r} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${n.stockAntes} \u2192 ${n.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const o=(window.products||[]).find(n=>String(n.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const s=JSON.parse(JSON.stringify(o));s.id=_genId(),s.name="Copia de "+o.name,s.sku=(o.sku||"")+"-C",s.stock=0,s.historialPrecios=[],s.historialCostos=[],window.products.unshift(s),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${s.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(i=>!i.tipo||i.tipo==="producto"||i.tipo==="producto_interno"),o=t.map(i=>{const c=i.price>0&&i.cost>0?(i.price-i.cost)/i.price*100:null;return{...i,_margen:c}}).sort((i,c)=>(c._margen??-1/0)-(i._margen??-1/0)),s=o.map((i,c)=>{const x=i._margen!==null?i._margen.toFixed(1)+"%":"\u2014",b=i.price>0&&i.cost>0?"$"+(i.price-i.cost).toFixed(2):"\u2014",f=i._margen===null?"#9ca3af":i._margen>=50?"#16a34a":i._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${c===0?"\u{1F947}":c===1?"\u{1F948}":c===2?"\u{1F949}":`${c+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(i.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(i.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(i.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${b}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${f};font-size:14px;">${x}</td>
        </tr>`}).join(""),n=o.filter(i=>i._margen!==null).reduce((i,c,x,b)=>i+c._margen/b.length,0),a=o[0];let r=document.getElementById("_mkRentabilidadModal");r||(r=document.createElement("div"),r.id="_mkRentabilidadModal",r.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",r.addEventListener("click",i=>{i.target===r&&(r.style.display="none")}),document.body.appendChild(r)),r.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${o.some(i=>i._margen!==null)?n.toFixed(1)+"%":"\u2014"}</div>
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
                    <tbody>${s||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,r.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(s=>{s.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),t.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#7c3aed;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const o=(window.pedidos||[]).filter(n=>!["cancelado","finalizado"].includes(n.status||"")&&(n.productosInventario||[]).some(a=>t.includes(String(a.id))));if(o.length>0){const n=o.map(a=>a.folio||a.id).slice(0,5).join(", ");if(!confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${n}). \xBFEliminar de todas formas?`))return}if(!confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`))return;const s=[...t];if(window.products=(window.products||[]).filter(n=>!s.includes(String(n.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",s)}catch(n){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",n)}manekiToastExport(`\u{1F5D1} ${s.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),o=(window.products||[]).filter(x=>t.includes(String(x.id))),s="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",n=o.map(x=>[x.tipo||"pt",x.name,x.sku||"",x.cost||0,x.price||0,x.stock||0,x.stockMin||5,x.proveedor||"",x.notas||""].map(b=>`"${String(b).replace(/"/g,'""')}"`).join(",")),a="\uFEFF"+s+`
`+n.join(`
`),r=new Blob([a],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(r),c=document.createElement("a");c.href=i,c.download="inventario_seleccion.csv",c.click(),URL.revokeObjectURL(i),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const o=prompt(`Selecciona categor\xEDa (ingresa el ID o nombre):

${(window.categories||[]).map(n=>`${n.id}: ${n.emoji||""} ${n.name}`).join(`
`)}`);if(!o)return;const s=(window.categories||[]).find(n=>String(n.id)===o.trim()||n.name.toLowerCase().includes(o.toLowerCase()));if(!s){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(n=>{t.includes(String(n.id))&&(n.category=s.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;
//# sourceMappingURL=inventory-5.js.map
