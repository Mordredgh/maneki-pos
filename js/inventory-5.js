function calcularProducibles(t){if(!Array.isArray(t.mpComponentes)||t.mpComponentes.length===0)return null;let o=1/0;for(const n of t.mpComponentes){const i=(window.products||[]).find(a=>String(a.id)===String(n.id));if(!i)return 0;const r=typeof getStockEfectivo=="function"?getStockEfectivo(i):i.stock||0,d=parseFloat(n.qty)||1;o=Math.min(o,Math.floor(r/d))}return o===1/0?0:o}window.calcularProducibles=calcularProducibles;function abrirBulkPrecioModal(){let t=document.getElementById("bulkPrecioModal");t||(t=document.createElement("div"),t.id="bulkPrecioModal",t.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",t.addEventListener("click",i=>{i.target===t&&(t.style.display="none")}),document.body.appendChild(t));const n=[...new Set((window.products||[]).map(i=>i.category).filter(Boolean))].map(i=>{const r=(window.categories||[]).find(d=>String(d.id)===String(i));return`<option value="${_esc(i)}">${_esc(r?r.emoji?r.emoji+" "+r.name:r.name:i)}</option>`}).join("");t.innerHTML=`
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
                    ${n}
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
    </div>`,t.style.display="flex",bulkPrecioPreview()}window.abrirBulkPrecioModal=abrirBulkPrecioModal;function _bulkPrecioGetAfectados(){const t=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0,o=document.getElementById("bulkPrecioSoloPT")?.checked||!1,n=document.getElementById("bulkPrecioSoloMP")?.checked||!1,i=(document.getElementById("bulkPrecioCat")?.value||"").trim();return(window.products||[]).filter(r=>i&&String(r.category)!==i?!1:o&&n?!0:!(o&&!(!r.tipo||r.tipo==="producto"||r.tipo==="producto_interno"||r.tipo==="pack")||n&&r.tipo!=="materia_prima")).map(r=>{const d=n&&!o?"cost":"price",a=parseFloat(r[d])||0,x=Math.max(0,Math.round(a*(1+t/100)*100)/100);return{p:r,campoKey:d,precioActual:a,precioNuevo:x}}).filter(r=>r.precioActual>0)}function bulkPrecioPreview(){const t=document.getElementById("bulkPrecioPreviewList");if(!t)return;const o=_bulkPrecioGetAfectados();if(!o.length){t.innerHTML='<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';return}t.innerHTML=o.slice(0,50).map(({p:n,campoKey:i,precioActual:r,precioNuevo:d})=>{const a=d-r,x=a>0?"#16a34a":a<0?"#dc2626":"#6b7280",u=i==="cost"?"Costo":"Precio";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(n.name)}">${_esc(n.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${u}: $${r.toFixed(2)}</span>
            <span style="font-weight:700;color:${x};white-space:nowrap;">\u2192 $${d.toFixed(2)}</span>
        </div>`}).join("")+(o.length>50?`<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${o.length-50} m\xE1s</p>`:"")}window.bulkPrecioPreview=bulkPrecioPreview;function bulkPrecioAplicar(){const t=_bulkPrecioGetAfectados();if(!t.length){manekiToastExport("Sin productos que actualizar","warn");return}const o=parseFloat(document.getElementById("bulkPrecioNum")?.value)||0;confirm(`\xBFAplicar ${o>0?"+":""}${o}% a ${t.length} producto(s)?`)&&(t.forEach(({p:n,campoKey:i,precioNuevo:r})=>{n[i]=r,n.updatedAt=new Date().toISOString()}),typeof guardarDatos=="function"?guardarDatos():typeof saveProducts=="function"&&saveProducts(),renderInventoryTable(),document.getElementById("bulkPrecioModal").style.display="none",manekiToastExport(`\u2705 Precios actualizados en ${t.length} producto(s)`,"ok"))}window.bulkPrecioAplicar=bulkPrecioAplicar;function renderInventoryTable(){const t=document.getElementById("inventoryTable");if(!t)return;let o=document.getElementById("invDualContainer");if(!o){const e=t.closest('table, .overflow-x-auto, [class*="overflow"]')||t.parentElement;o=document.createElement("div"),o.id="invDualContainer",o.style.cssText="display:flex;flex-direction:column;gap:0;",e.parentNode.insertBefore(o,e),e.style.display="none"}const n=window.products||[],i=new Map(n.map(e=>[String(e.id),typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0]));if(window._invStockCache=i,typeof poblarFiltroProveedores=="function"&&poblarFiltroProveedores(),!document.getElementById("invExtraColStyles")){const e=document.createElement("style");e.id="invExtraColStyles",e.textContent=`
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `,document.head.appendChild(e)}let r=document.getElementById("invExtraColToggle");if(r||(r=document.createElement("button"),r.id="invExtraColToggle",r.style.cssText="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;",r.textContent="Mostrar SKU/Proveedor",r.addEventListener("click",()=>{const e=document.getElementById("invDualContainer");if(!e)return;const c=e.classList.toggle("inv-show-extra");r.textContent=c?"Ocultar SKU/Proveedor":"Mostrar SKU/Proveedor"}),o.parentNode.insertBefore(r,o)),n.length===0){o.innerHTML=`
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
        </div>`;return}const d=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",a=(document.getElementById("inventoryTagFilter")||{}).value||"",x=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function u(e){const c=window._normSearch||(p=>String(p||"").toLowerCase()),s=c(d),b=c(x);return e.filter(p=>{const w=!d||c(p.name).includes(s)||c(p.sku||"").includes(s)||c(p.proveedor||"").includes(s)||c(p.notas||"").includes(s)||(p.tags||[]).some(z=>c(z).includes(s)),y=!a||p.tags&&p.tags.includes(a),E=!x||c(p.proveedor||"").includes(b);return w&&y&&E})}const m=u(n.filter(e=>e.tipo==="materia_prima")),g=u(n.filter(e=>e.tipo==="servicio")),P=u(n.filter(e=>e.tipo==="producto_variable")),k=u(n.filter(e=>!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack"));function I(e){if(!window._invSortCol)return e;const c=window._invSortCol,s=window._invSortDir;return[...e].sort((b,p)=>{let w,y;return c==="name"?(w=(b.name||"").toLowerCase(),y=(p.name||"").toLowerCase()):c==="sku"?(w=(b.sku||"").toLowerCase(),y=(p.sku||"").toLowerCase()):c==="category"?(w=(b.category||"").toLowerCase(),y=(p.category||"").toLowerCase()):c==="price"?(w=Number(b.price)||0,y=Number(p.price)||0):c==="stock"?(w=Number(b.stock)||0,y=Number(p.stock)||0):c==="margin"&&(w=b.cost&&b.price?(b.price-b.cost)/b.price:-1,y=p.cost&&p.price?(p.price-p.cost)/p.price:-1),w<y?s==="asc"?-1:1:w>y?s==="asc"?1:-1:0})}function f(e,c){const s=String(e.id),b=i.get(s)??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0),p=e.imageUrl?`<img src="${e.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3ED}"}</span>`;let w;b===0?w='<span class="badge-danger">Agotado</span>':b<=(e.stockMin||5)?w='<span class="badge-warning">Bajo Stock</span>':w='<span class="badge-success">Disponible</span>';const y=(window.categories||[]).find(z=>z.id===e.category),E=y?y.name:e.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${c*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${s}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${p}</td>
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
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(E)}</td>
            <td class="px-4 py-3" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(e.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${s}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${s}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${b} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(e.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button onclick="editProduct('${s}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="ajustarStock('${s}')" title="Ajustar stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4E6}</button>
                    <button onclick="duplicarProducto('${s}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button onclick="registrarMerma('${s}')" title="Registrar merma/p\xE9rdida"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C9}</button>
                    ${e.proveedorUrl?`<button onclick="window.open(this.dataset.url,'_blank')" data-url="${_esc(e.proveedorUrl)}" title="Abrir proveedor" style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F517}</button>`:""}
                    <button onclick="cambiarTipoProducto('${s}')" title="Convertir a Producto Terminado"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F4E6}</button>
                    <button onclick="deleteProduct('${s}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function L(e,c){const s=String(e.id),b=`<span style="font-size:1.6rem;">${e.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${c*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${s}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${b}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(p=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc(p)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(e.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${s}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="deleteProduct('${s}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function q(e,c){const s=String(e.id),b=e.imageUrl?`<img src="${e.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F4E6}"}</span>`,p=(window.categories||[]).find(l=>l.id===e.category),w=p?p.name:e.category||"",y=calcularDisponibilidadDesdeMP(e);let E,z;if(y!==null){const l=y.piezas,v=l===0?"#ef4444":l<=3?"#f59e0b":"#10b981",M=l===0?"#fee2e2":l<=3?"#fef3c7":"#d1fae5",C=y.detalle.map(S=>`${S.nombre}: ${S.stock}\xF7${S.qty}=${S.posibles}pzs`).join(" | ");E=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(C)}"
                        style="padding:3px 12px;border-radius:8px;background:${M};color:${v};
                               font-weight:700;font-size:.95rem;border:1px solid ${v}33;cursor:help;">
                        ${l}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,z=l===0?'<span class="badge-danger">Sin stock MP</span>':l<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const l=i.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0),v=e.stockMin||5,M=l===0?"#ef4444":l<=v?"#f59e0b":"#10b981";E=`<span style="padding:3px 12px;border-radius:8px;background:${l===0?"#fee2e2":l<=v?"#fef3c7":"#d1fae5"};color:${M};font-weight:700;font-size:.95rem;">${l}</span>`,z=l===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Agotado</span>':l<=v?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">Disponible</span>'}const H=e.variants&&e.variants.length>0?e.variants.map(l=>`
                <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f3f4f6;border-radius:8px;font-size:11px;margin:1px;">
                    <b>${_esc(l.type)}:</b>${_mkColorDot(l.type,_esc(l.value))}
                    <span style="background:#e0f2fe;color:#0369a1;padding:0 4px;border-radius:99px;font-weight:600;">${l.qty??0}</span>
                </span>`).join(""):'<span class="text-xs text-gray-400">Sin variantes</span>',B=Number(e.cost)||0,K=Number(e.price)||0,U=B&&K?(()=>{const l=(K-B)/K*100,v=l>=40?"#10b981":l>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${v};">${l.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,l).toFixed(0)}%;background:${v};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${c*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${s}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${b}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    ${e._tieneComponentesHuerfanos?'<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">\u26A0\uFE0F MP faltante</span>':""}
                    ${e.tipo==="pack"?'<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">\u{1F381} Pack</span>':""}
                    ${e.tipo==="pack"&&e.packComponentes&&e.packComponentes.length?`<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${e.packComponentes.map(l=>`${l.qty>1?l.qty+"\xD7 ":""}${_esc(l.nombre)}`).join(" + ")}</div>`:""}
                    ${e.historialPrecios&&e.historialPrecios.length?`<span title="Este producto ha tenido ${e.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${e.historialPrecios.length} cambio${e.historialPrecios.length>1?"s":""}</span>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.proveedorNombre?`<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(e.proveedorNotas||"")}">\u{1F3ED} Proveedor: <b>${_esc(e.proveedorNombre)}</b>${e.proveedorNotas?" \u2139\uFE0F":""}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map(l=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(l)}</span>`).join("")}</div>`:""}
                    ${(()=>{const l=calcularProducibles(e);if(l===null)return"";const v=l>=5?"#16a34a":l>=1?"#d97706":"#dc2626",M=l>=5?"#d1fae5":l>=1?"#fef3c7":"#fee2e2",C=l===0?"Sin stock MP":`Producibles: ${l}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${M};color:${v};border:1px solid ${v}33;">\u{1F3ED} ${C}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(w)}</td>
            <td class="px-4 py-3">${H}</td>
            <td class="px-4 py-3 text-gray-800 font-semibold" style="font-size:.95rem;">$${Number(e.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${s}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${E}</td>
            <td class="px-4 py-3">${z}</td>
            <td class="px-4 py-3">${U}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${e.tipo==="pack"?`<button onclick="openPackModal('${s}')" title="Editar Pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`:`<button onclick="editProduct('${s}')" title="Editar"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`}
                    <button onclick="duplicarProducto('${s}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    ${e.tipo!=="pack"?`<button onclick="cambiarTipoProducto('${s}')" title="Convertir a Materia Prima"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${e.movimientos&&e.movimientos.length?`<button onclick="verMovimientosProducto('${s}')" title="Ver movimientos de stock (${e.movimientos.length})"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>`:""}
                    <button onclick="deleteProduct('${s}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function X(e,c){const s=String(e.id),b=e.imageUrl?`<img src="${e.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${e.image||"\u{1F3AF}"}</span>`,p=(e.tablaPreciosVariable||[]).slice().sort(($,N)=>$.cantidadMin-N.cantidadMin),w=p.length?p.map($=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${$.cantidadMin} pzas = $${Number($.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',y=(e.mpComponentes||[]).length,E=(window.categories||[]).find($=>String($.id)===String(e.category)),z=E?`${E.emoji||""} ${E.name}`:"\u2014",H=p,B=H.length?H[0].precio/(H[0].cantidadMin||1):0,K=B>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${B.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',U=calcularDisponibilidadDesdeMP(e);let l,v;if(U!==null){const $=U.piezas,N=$===0?"#ef4444":$<=3?"#f59e0b":"#10b981",Q=$===0?"#fee2e2":$<=3?"#fef3c7":"#d1fae5",j=U.detalle.map(T=>`${T.nombre}: ${T.stock}\xF7${T.qty}=${T.posibles}pzs`).join(" | ");l=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(j)}" style="padding:3px 12px;border-radius:8px;background:${Q};color:${N};font-weight:700;font-size:.95rem;border:1px solid ${N}33;cursor:help;">${$}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,v=$===0?'<span class="badge-danger">Sin stock MP</span>':$<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else l='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',v='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const M=(e.mpComponentes||[]).reduce(($,N)=>$+(parseFloat(N.costUnit)||0)*(parseFloat(N.qty)||1),0),C=e.rendimientoPorHoja||1,S=C>0?M/C:M,h=B>0?Math.round((B-S)/B*100):0,R=h>=40?"#10b981":h>=20?"#f59e0b":"#ef4444",G=B>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${R};">${h}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,h)}%;background:${R};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${c*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${s}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${b}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(e.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${e.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${e.rendimientoPorHoja} uds/hoja \xB7 ${y} MP${y!==1?"s":""}</div>`:y>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${y} MP${y!==1?"s":""}</div>`:""}
                    ${e.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(e.notas)}">${_esc(e.notas)}</div>`:""}
                    ${e.tags&&e.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${e.tags.map($=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc($)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(e.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(z)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${w}</div></td>
            <td class="px-4 py-3">${K}</td>
            <td class="px-4 py-3">${l}</td>
            <td class="px-4 py-3">${v}</td>
            <td class="px-4 py-3">${G}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button onclick="editProduct('${s}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="duplicarProducto('${s}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    <button onclick="deleteProduct('${s}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function D({id:e,title:c,titleColor:s,titleBg:b,btnLabel:p,btnOnclick:w,btnColor:y,extraBtnHTML:E,products:z,renderFila:H,headers:B,emptyMsg:K}){const U=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(z.length===0&&U)return"";const l=I(z),v=`_invPage_${e}`,M=window._invPageSize||10;window[v]=window[v]||1;const C=l.length,S=Math.max(1,Math.ceil(C/M));window[v]>S&&(window[v]=1);const h=window[v],R=(h-1)*M,G=l.slice(R,R+M),$=G.length===0?`<tr><td colspan="${B.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${K}</td></tr>`:G.map((j,T)=>H(j,T)).join(""),N=B.map(j=>{const T=j.colId==="sku"?" inv-col-hidden-sku":j.colId==="proveedor"?" inv-col-hidden-prov":"";return j.sortKey?`<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${T}" onclick="sortInventory('${j.sortKey}')" style="white-space:nowrap;">${j.label} \u2195</th>`:`<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide${T}" style="white-space:nowrap;">${j.label}</th>`}).join("");let Q="";if(S>1||C>M){const j=Math.min(R+M,C);Q=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${R+1}\u2013${j}</b> de <b>${C}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${e}',${h-1})" ${h<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${h<=1?"default":"pointer"};opacity:${h<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,S)},(T,Z)=>{let _=h<=3?Z+1:h+Z-2;return _<1&&(_=null),_>S&&(_=null),_===null?"":`<button onclick="invSectionPage('${e}',${_})" style="min-width:30px;padding:4px 8px;border:1px solid ${_===h?"#C5973B":"#e5e7eb"};border-radius:7px;background:${_===h?"#C5973B":"#fff"};color:${_===h?"#fff":"#374151"};font-weight:${_===h?700:400};font-size:13px;cursor:${_===h?"default":"pointer"};" ${_===h?"disabled":""}>${_}</button>`}).join("")}
                    <button onclick="invSectionPage('${e}',${h+1})" ${h>=S?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${h>=S?"default":"pointer"};opacity:${h>=S?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${s}33;box-shadow:0 2px 12px ${s}11;">
            <!-- Header de secci\xF3n -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:${b};border-bottom:1.5px solid ${s}33;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;font-weight:800;color:${s};">${c}</span>
                    <span style="background:${s};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${C}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${E||""}
                    <button onclick="${w}"
                        style="padding:7px 16px;background:${y};color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${p}
                    </button>
                </div>
            </div>
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${N}</tr>
                    </thead>
                    <tbody>${$}</tbody>
                </table>
            </div>
            ${Q}
        </div>`}const F=n.filter(e=>!e.deletedAt),A=F.length,J=F.reduce((e,c)=>{const s=i.get(String(c.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(c):parseInt(c.stock)||0);return e+(Number(c.cost)||0)*Math.max(0,s)},0),V=F.filter(e=>(i.get(String(e.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(e):parseInt(e.stock)||0))<=(e.stockMin||5)).length,W=F.filter(e=>(!e.tipo||e.tipo==="producto"||e.tipo==="producto_interno"||e.tipo==="pack")&&Number(e.price)>0),Y=W.length?W.reduce((e,c)=>{const s=Number(c.price)||0,b=Number(c.cost)||0;return e+(s>0?(s-b)/s*100:0)},0)/W.length:0;let O=document.getElementById("invKpiBar");O||(O=document.createElement("div"),O.id="invKpiBar",o.parentNode.insertBefore(O,o)),O.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${A}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#7c3aed;">$${J.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${V>0?"#ef4444":"#10b981"};">${V}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${Y>=40?"#10b981":Y>=20?"#f59e0b":"#ef4444"};">${Y.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`,o.innerHTML=D({id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#C5973B",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",btnColor:"linear-gradient(135deg,#C5A572,#E8B84B)",extraBtnHTML:'<button onclick="injectPackModal();openPackModal()" style="padding:7px 16px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F381} Crear Pack</button><button onclick="abrirBulkPrecioModal()" style="padding:7px 16px;background:linear-gradient(135deg,#0369a1,#38bdf8);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4CA} Actualizar precios</button>',products:k,renderFila:q,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"})+D({id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",btnColor:"linear-gradient(135deg,#0284c7,#38bdf8)",products:P,renderFila:X,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."})+D({id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#7c3aed",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",btnColor:"linear-gradient(135deg,#7c3aed,#a855f7)",products:m,renderFila:f,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"})+D({id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#6d28d9",titleBg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",btnColor:"linear-gradient(135deg,#6d28d9,#8b5cf6)",products:g,renderFila:L,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."})}function invSectionPage(t,o){const n=`_invPage_${t}`,i=window.products||[],r=t==="mp"?i.filter(g=>g.tipo==="materia_prima"):t==="svc"?i.filter(g=>g.tipo==="servicio"):t==="pv"?i.filter(g=>g.tipo==="producto_variable"):i.filter(g=>!g.tipo||g.tipo==="producto"||g.tipo==="producto_interno"||g.tipo==="pack"),d=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",a=(document.getElementById("inventoryTagFilter")||{}).value||"",x=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",u=r.filter(g=>{const P=!d||g.name.toLowerCase().includes(d)||(g.sku||"").toLowerCase().includes(d)||(g.proveedor||"").toLowerCase().includes(d)||(g.notas||"").toLowerCase().includes(d)||(g.tags||[]).some(f=>f.toLowerCase().includes(d)),k=!a||g.tags&&g.tags.includes(a),I=!x||(g.proveedor||"").toLowerCase().includes(x);return P&&k&&I}),m=Math.max(1,Math.ceil(u.length/(window._invPageSize||10)));window[n]=Math.max(1,Math.min(o,m)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(t,o,n,i,r){let d=document.getElementById("inventoryPaginationBar");if(!d){const m=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!m)return;d=document.createElement("div"),d.id="inventoryPaginationBar",m.insertAdjacentElement("afterend",d)}if(o<=1&&n<=r){d.innerHTML="";return}const a=Math.min(i+r,n),x=`Mostrando <b>${i+1}\u2013${a}</b> de <b>${n}</b> productos`;function u(){const m=[],g=(P,k)=>{for(let I=P;I<=k;I++)m.push(I)};return o<=7?g(1,o):(m.push(1),t>4&&m.push("..."),g(Math.max(2,t-2),Math.min(o-1,t+2)),t<o-3&&m.push("..."),m.push(o)),m.map(P=>{if(P==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const k=P===t;return`<button onclick="invGoToPage(${P})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${k?"#C5973B":"#e5e7eb"};
                       background:${k?"#C5973B":"white"};color:${k?"white":"#374151"};
                       font-weight:${k?"700":"500"};font-size:13px;cursor:${k?"default":"pointer"};
                       transition:all 0.15s;"
                ${k?"disabled":""}>${P}</button>`}).join("")}d.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tama\xF1o -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${x}</span>
                <select onchange="invChangePageSize(this.value)"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(m=>`<option value="${m}" ${m===r?"selected":""}>${m} por p\xE1gina</option>`).join("")}
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
                ${u()}
                <button onclick="invGoToPage(${t+1})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="P\xE1gina siguiente">\u203A</button>
                <button onclick="invGoToPage(${o})" ${t===o?"disabled":""}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${t===o?"default":"pointer"};opacity:${t===o?.4:1};font-size:13px;"
                    title="\xDAltima p\xE1gina">\u27E9\u27E9</button>
            </div>
        </div>`}function invGoToPage(t){const o=Math.ceil((window.products||[]).length/window._invPageSize);window._invCurrentPage=Math.max(1,Math.min(t,o)),renderInventoryTable();const n=document.getElementById("inventoryTable");n&&n.closest("section, .section, main")?.scrollTo({top:0,behavior:"smooth"})}function invChangePageSize(t){window._invPageSize=parseInt(t),window._invCurrentPage=1,renderInventoryTable()}window.invGoToPage=invGoToPage,window.invChangePageSize=invChangePageSize;function invResetPage(){window._invCurrentPage=1}window.invResetPage=invResetPage,window.renderInventoryTable=renderInventoryTable;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const n=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",i=(document.getElementById("movTipoFilter")||{}).value||"";let r=window.stockMovements||[];n&&(r=r.filter(f=>f.productoNombre?.toLowerCase().includes(n)||(f.motivo||"").toLowerCase().includes(n))),i&&(r=r.filter(f=>(f.tipo||"")===i));const d=_fechaHoy?_fechaHoy():new Date().toISOString().split("T")[0],a=(window.stockMovements||[]).filter(f=>{try{const L=new Date(f.fecha);return L.getFullYear()+"-"+("0"+(L.getMonth()+1)).slice(-2)+"-"+("0"+L.getDate()).slice(-2)===d}catch{return!1}}),x={};a.forEach(f=>{x[f.tipo]=(x[f.tipo]||0)+1});const u={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},m={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let g=document.getElementById("movResumenHoy");g||(g=document.createElement("div"),g.id="movResumenHoy",o.parentNode.insertBefore(g,o));const P=Object.keys(x).map(f=>`${u[f]||"\u26AA"} ${m[f]||f}: <strong>${x[f]}</strong>`);g.innerHTML=P.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${P.join("&nbsp;&nbsp;")}
           </div>`:"";let k=document.getElementById("movExportCSVBtn");if(k||(k=document.createElement("button"),k.id="movExportCSVBtn",k.textContent="\u{1F4E5} Exportar historial CSV",k.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",k.onclick=function(){const f=window.stockMovements||[];let q=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;f.forEach(A=>{const J=[new Date(A.fecha).toLocaleString("es-MX"),A.productoNombre||"",A.tipo||"",A.cantidad,A.motivo||"",A.stockAntes??"",A.stockDespues??""];q+=J.map(V=>`"${String(V).replace(/"/g,'""')}"`).join(",")+`
`});const X=new Blob([q],{type:"text/csv;charset=utf-8;"}),D=URL.createObjectURL(X),F=document.createElement("a");F.href=D,F.download=`movimientos-${d}.csv`,F.click(),URL.revokeObjectURL(D)},o.parentNode.insertBefore(k,o)),!r.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const I={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=r.slice(0,200).map(f=>{const L=new Date(f.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),q=f.cantidad>=0?`+${f.cantidad}`:`${f.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${I[f.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(f.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${L} \xB7 ${f.tipo} \xB7 ${_esc(f.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${f.cantidad>=0?"#10b981":"#ef4444"};">${q} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${f.stockAntes} \u2192 ${f.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderMovimientos=renderMovimientos;function limpiarMovimientosInventario(){confirm("\xBFBorrar todo el historial de movimientos?")&&(window.stockMovements=[],saveStockMovements(),renderMovimientos())}window.limpiarMovimientosInventario=limpiarMovimientosInventario;function toggleMovimientosInventario(){const t=document.getElementById("movimientosPanel");t&&(t.classList.toggle("hidden"),t.classList.contains("hidden")||renderMovimientos())}window.toggleMovimientosInventario=toggleMovimientosInventario;function renderStockMovements(t){const o=document.getElementById(t);if(!o)return;if(!window.stockMovements||!window.stockMovements.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const n={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=window.stockMovements.slice(0,100).map(i=>{const r=new Date(i.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),d=i.cantidad>=0?`+${i.cantidad}`:`${i.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${n[i.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(i.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${r} \xB7 ${i.tipo} \xB7 ${_esc(i.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${i.cantidad>=0?"#10b981":"#ef4444"};">${d} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${i.stockAntes} \u2192 ${i.stockDespues}</div>
            </div>
        </div>`}).join("")}window.renderStockMovements=renderStockMovements;function duplicarProducto(t){const o=(window.products||[]).find(i=>String(i.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const n=JSON.parse(JSON.stringify(o));n.id=_genId(),n.name="Copia de "+o.name,n.sku=(o.sku||"")+"-C",n.stock=0,n.historialPrecios=[],n.historialCostos=[],window.products.unshift(n),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4CB} "${n.name}" creado \u2014 ed\xEDtalo para ajustar stock y SKU`,"ok")}window.duplicarProducto=duplicarProducto;function abrirReporteRentabilidad(){const t=(window.products||[]).filter(a=>!a.tipo||a.tipo==="producto"||a.tipo==="producto_interno"),o=t.map(a=>{const x=a.price>0&&a.cost>0?(a.price-a.cost)/a.price*100:null;return{...a,_margen:x}}).sort((a,x)=>(x._margen??-1/0)-(a._margen??-1/0)),n=o.map((a,x)=>{const u=a._margen!==null?a._margen.toFixed(1)+"%":"\u2014",m=a.price>0&&a.cost>0?"$"+(a.price-a.cost).toFixed(2):"\u2014",g=a._margen===null?"#9ca3af":a._margen>=50?"#16a34a":a._margen>=30?"#d97706":"#dc2626";return`<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${x===0?"\u{1F947}":x===1?"\u{1F948}":x===2?"\u{1F949}":`${x+1}.`}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(a.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(a.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(a.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${m}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${g};font-size:14px;">${u}</td>
        </tr>`}).join(""),i=o.filter(a=>a._margen!==null).reduce((a,x,u,m)=>a+x._margen/m.length,0),r=o[0];let d=document.getElementById("_mkRentabilidadModal");d||(d=document.createElement("div"),d.id="_mkRentabilidadModal",d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;",d.addEventListener("click",a=>{a.target===d&&(d.style.display="none")}),document.body.appendChild(d)),d.innerHTML=`
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
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${o.some(a=>a._margen!==null)?i.toFixed(1)+"%":"\u2014"}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">M\xE1s rentable</div>
                    <div style="font-size:.95rem;font-weight:700;color:#16a34a;margin-top:4px;">${r?_esc(r.name):"\u2014"}</div>
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
                    <tbody>${n||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`,d.style.display="flex"}window.abrirReporteRentabilidad=abrirReporteRentabilidad;function invBulkToggle(t){invUpdateBulkBar()}window.invBulkToggle=invBulkToggle;function invBulkToggleAll(t){document.querySelectorAll(".inv-bulk-cb").forEach(n=>{n.checked=t.checked}),invUpdateBulkBar()}window.invBulkToggleAll=invBulkToggleAll;function invGetSelectedIds(){return[...document.querySelectorAll(".inv-bulk-cb:checked")].map(t=>t.dataset.id)}window.invGetSelectedIds=invGetSelectedIds;function invUpdateBulkBar(){const t=invGetSelectedIds();let o=document.getElementById("invBulkBar");if(o||(o=document.createElement("div"),o.id="invBulkBar",o.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;",document.body.appendChild(o)),t.length===0){o.style.display="none";return}o.style.display="flex",o.innerHTML=`
    <span style="font-weight:700;font-size:.9rem;">${t.length} seleccionado${t.length>1?"s":""}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#7c3aed;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4C1} Categor\xEDa</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F5D1} Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">\u2715 Cancelar</button>
  `}window.invUpdateBulkBar=invUpdateBulkBar;function invBulkDesseleccionar(){document.querySelectorAll(".inv-bulk-cb, .inv-bulk-all").forEach(t=>t.checked=!1),invUpdateBulkBar()}window.invBulkDesseleccionar=invBulkDesseleccionar;async function invBulkEliminar(){const t=invGetSelectedIds();if(!t.length)return;const o=(window.pedidos||[]).filter(i=>!["cancelado","finalizado"].includes(i.status||"")&&(i.productosInventario||[]).some(r=>t.includes(String(r.id))));if(o.length>0){const i=o.map(r=>r.folio||r.id).slice(0,5).join(", ");if(!confirm(`\u26A0\uFE0F ${o.length} pedido(s) activo(s) usan estos productos (${i}). \xBFEliminar de todas formas?`))return}if(!confirm(`\xBFEliminar ${t.length} producto(s)? Esta acci\xF3n no se puede deshacer.`))return;const n=[...t];if(window.products=(window.products||[]).filter(i=>!n.includes(String(i.id))),saveProducts(),renderInventoryTable(),invUpdateBulkBar(),typeof db<"u"&&db)try{await db.from("products").delete().in("id",n)}catch(i){console.warn("[BulkEliminar] Error al eliminar de Supabase relacional:",i)}manekiToastExport(`\u{1F5D1} ${n.length} producto(s) eliminados`,"ok")}window.invBulkEliminar=invBulkEliminar;function invBulkExportar(){const t=invGetSelectedIds(),o=(window.products||[]).filter(u=>t.includes(String(u.id))),n="tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas",i=o.map(u=>[u.tipo||"pt",u.name,u.sku||"",u.cost||0,u.price||0,u.stock||0,u.stockMin||5,u.proveedor||"",u.notas||""].map(m=>`"${String(m).replace(/"/g,'""')}"`).join(",")),r="\uFEFF"+n+`
`+i.join(`
`),d=new Blob([r],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(d),x=document.createElement("a");x.href=a,x.download="inventario_seleccion.csv",x.click(),URL.revokeObjectURL(a),manekiToastExport(`\u{1F4E5} ${o.length} productos exportados`,"ok")}window.invBulkExportar=invBulkExportar;function invBulkCambiarCategoria(){const t=invGetSelectedIds();if(!t.length)return;const o=prompt(`Selecciona categor\xEDa (ingresa el ID o nombre):

${(window.categories||[]).map(i=>`${i.id}: ${i.emoji||""} ${i.name}`).join(`
`)}`);if(!o)return;const n=(window.categories||[]).find(i=>String(i.id)===o.trim()||i.name.toLowerCase().includes(o.toLowerCase()));if(!n){manekiToastExport("Categor\xEDa no encontrada","warn");return}(window.products||[]).forEach(i=>{t.includes(String(i.id))&&(i.category=n.id)}),saveProducts(),renderInventoryTable(),manekiToastExport(`\u{1F4C1} Categor\xEDa actualizada en ${t.length} producto(s)`,"ok")}window.invBulkCambiarCategoria=invBulkCambiarCategoria;
//# sourceMappingURL=inventory-5.js.map
