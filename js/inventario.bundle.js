"use strict";function renderCategoriesGrid(){const t=document.getElementById("categoriesGrid");t.innerHTML=categories.map(e=>{const o=products.filter(n=>n.category===e.id).length,a=_esc(e.color||"#C5A572"),r=_esc(e.id);return`
                    <div class="category-card bg-white p-6 rounded-2xl shadow-sm border-2 transition-all hover:shadow-md" style="border-color: ${a}20; border-top: 4px solid ${a}">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style="background: ${a}20">${_esc(e.emoji)}</div>
                            <div class="flex gap-1">
                                <button data-catid="${r}" data-cataction="edit" class="cat-action-btn p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Editar categor\xEDa">
                                    <i class="fas fa-edit text-sm"></i>
                                </button>
                                <button data-catid="${r}" data-cataction="delete" class="cat-action-btn p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar categor\xEDa">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">${_esc(e.name)}</h3>
                        <p class="text-sm font-medium" style="color: ${e.color||"#C5A572"}">${o} producto${o!==1?"s":""}</p>
                    </div>
                `}).join("")}document.addEventListener("click",function(t){const e=t.target.closest(".cat-action-btn[data-catid]");if(!e)return;const o=e.dataset.catid,a=e.dataset.cataction;a==="edit"?editCategory(o):a==="delete"&&deleteCategory(o)});function selectCategoryColor(t){document.getElementById("categoryColor").value=t,document.querySelectorAll(".color-btn").forEach(e=>{e.style.borderColor=e.dataset.color===t?"#374151":"transparent",e.style.transform=e.dataset.color===t?"scale(1.2)":"scale(1)"})}function closeAddCategoryModal(){closeModal("addCategoryModal"),document.getElementById("addCategoryForm").reset()}document.getElementById("addCategoryForm").addEventListener("submit",function(t){t.preventDefault();const e=document.getElementById("categoryName").value,o=document.getElementById("categoryEmoji").value;let a=e.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_\u00e0-\u00ff]/g,""),r=a,n=2;for(;categories.find(c=>c.id.toLowerCase()===r.toLowerCase());)r=a+"_"+n++;const d=document.getElementById("categoryColor")?.value||"#C5A572",i={id:r,name:e,emoji:o,color:d};categories.push(i),saveCategories(),renderCategoriesGrid(),updateCategorySelects(),closeAddCategoryModal(),manekiToastExport("\u2705 Categor\xEDa creada exitosamente","ok")});function deleteCategory(t){const e=products.filter(a=>a.category===t).length;if(e>0){manekiToastExport(`No puedes eliminar esta categor\xEDa: tiene ${e} producto(s) asociado(s).`,"error");return}const o=categories.find(a=>a.id===t);showConfirm(`La categor\xEDa "${o?o.name:"esta categor\xEDa"}" ser\xE1 eliminada permanentemente.`,"\u26A0\uFE0F Eliminar categor\xEDa").then(a=>{a&&(categories=categories.filter(r=>r.id!==t),saveCategories(),renderCategoriesGrid(),updateCategorySelects())})}function editCategory(t){const e=categories.find(o=>o.id===t);e&&(document.getElementById("editCategoryId").value=e.id,document.getElementById("editCategoryName").value=e.name,document.getElementById("editCategoryEmoji").value=e.emoji||"\u{1F4E6}",document.getElementById("editSelectedEmojiDisplay").textContent=e.emoji||"\u{1F4E6}",document.getElementById("editEmojiSearch").value="",document.getElementById("editCategoryColor").value=e.color||"#C5A572",openModal("editCategoryModal"),setTimeout(()=>{selectEditColor(e.color||"#C5A572"),renderEditEmojiGrid()},50))}function closeEditCategoryModal(){closeModal("editCategoryModal")}function selectEditColor(t){document.getElementById("editCategoryColor").value=t,document.querySelectorAll(".edit-color-btn").forEach(e=>{e.style.borderColor=e.dataset.color===t?"#374151":"transparent",e.style.transform=e.dataset.color===t?"scale(1.2)":"scale(1)"})}function renderEditEmojiGrid(t=""){const e=document.getElementById("editEmojiGrid");if(!e)return;const o=t.toLowerCase().trim(),a=emojiCategories.flatMap(r=>r.emojis);if(o){const r=a.filter((i,c)=>!0),n={regalo:["\u{1F381}","\u{1F380}","\u{1F38A}"],ropa:["\u{1F457}","\u{1F455}","\u{1F454}"],taza:["\u2615","\u{1F375}"],llave:["\u{1F511}","\u{1F5DD}\uFE0F"],peluche:["\u{1F9F8}","\u{1F43B}"],joya:["\u{1F48D}","\u{1F48E}"]};let d=[];Object.entries(n).forEach(([i,c])=>{(i.includes(o)||o.includes(i))&&d.push(...c)}),d.length===0&&(d=a),e.innerHTML=`<div class="flex flex-wrap gap-1">${[...new Set(d)].map(i=>`<button type="button" onclick="selectEditEmoji('${i}')" class="edit-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${i}</button>`).join("")}</div>`;return}e.innerHTML=emojiCategories.map(r=>`
                <div class="mb-2">
                    <p class="text-xs font-semibold text-gray-400 mb-1">${r.label}</p>
                    <div class="flex flex-wrap gap-1">
                        ${r.emojis.map(n=>`<button type="button" onclick="selectEditEmoji('${n}')" class="edit-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${n}</button>`).join("")}
                    </div>
                </div>`).join("")}function selectEditEmoji(t){document.getElementById("editCategoryEmoji").value=t,document.getElementById("editSelectedEmojiDisplay").textContent=t,document.querySelectorAll(".edit-emoji-btn").forEach(e=>{e.style.background=e.textContent.trim()===t?"#FFF9F0":"",e.style.border=e.textContent.trim()===t?"2px solid #C5A572":""})}function filterEditEmojis(t){renderEditEmojiGrid(t)}function saveEditCategory(){const t=document.getElementById("editCategoryId").value,e=document.getElementById("editCategoryName").value.trim(),o=document.getElementById("editCategoryEmoji").value||"\u{1F4E6}",a=document.getElementById("editCategoryColor").value||"#C5A572";if(!e){manekiToastExport("\u26A0\uFE0F El nombre no puede estar vac\xEDo","warn");return}const r=categories.findIndex(n=>n.id===t);r!==-1&&(categories[r].name=e,categories[r].emoji=o,categories[r].color=a,products.forEach(n=>{n.category===t&&!n.imageUrl&&(n.image=o)}),saveCategories(),saveProducts(),renderCategoriesGrid(),updateCategorySelects(),closeEditCategoryModal(),manekiToastExport("\u2705 Categor\xEDa actualizada","ok"))}function updateCategorySelects(){const t=categories.map(e=>`<option value="${_esc(e.id)}">${_esc(e.emoji)} ${_esc(e.name)}</option>`).join("");["productCategory","ptCategory","mpCategory"].forEach(e=>{const o=document.getElementById(e);if(!o)return;const a=o.value;o.innerHTML=t,a&&o.querySelector(`option[value="${CSS.escape?CSS.escape(a):a}"]`)&&(o.value=a)})}
//# sourceMappingURL=categorias.js.map

;
"use strict";typeof window.showSection>"u"&&(window.showSection=function(t){document.querySelectorAll('section[id$="-section"], section[id$="Section"]').forEach(i=>{i.classList.add("hidden"),i.style.display=""});const e=document.getElementById(t+"-section")||document.getElementById(t+"Section");e&&e.classList.remove("hidden")}),(function(){const t={rojo:"#ef4444",roja:"#ef4444",red:"#ef4444",azul:"#3b82f6",azules:"#3b82f6",blue:"#3b82f6","azul marino":"#1e3a8a",marino:"#1e3a8a",verde:"#22c55e",green:"#22c55e",amarillo:"#eab308",amarilla:"#eab308",yellow:"#eab308",dorado:"#d97706",gold:"#d97706",negro:"#1f2937",negra:"#1f2937",black:"#1f2937",blanco:"#f9fafb",blanca:"#f9fafb",white:"#f9fafb",rosa:"#ec4899",pink:"#ec4899","rosa mexicano":"#e91e8c",morado:"#a855f7",morada:"#a855f7",violeta:"#8b5cf6",lila:"#c084fc",lavanda:"#c4b5fd",purple:"#a855f7",naranja:"#f97316",orange:"#f97316",gris:"#9ca3af",grise:"#9ca3af",gray:"#9ca3af",grey:"#9ca3af",plateado:"#94a3b8",silver:"#94a3b8",caf\u00E9:"#92400e",cafe:"#92400e",marr\u00F3n:"#92400e",marron:"#92400e",brown:"#78350f",beige:"#e5c9a0",crema:"#fef3c7",turquesa:"#06b6d4",celeste:"#7dd3fc",cian:"#22d3ee",cyan:"#22d3ee",aqua:"#22d3ee",coral:"#f87171",salmon:"#fca5a5",salm\u00F3n:"#fca5a5",oliva:"#84cc16",olive:"#65a30d",magenta:"#e879f9",fucsia:"#e879f9",fuchsia:"#e879f9",vino:"#9f1239",burgundy:"#9f1239",guinda:"#9f1239",indigo:"#6366f1","azul cielo":"#7dd3fc","azul rey":"#2563eb","azul claro":"#93c5fd","verde militar":"#4d7c0f","verde lim\xF3n":"#a3e635","verde menta":"#6ee7b7","verde oliva":"#65a30d","rojo vino":"#9f1239"},e={rojo:"\u{1F534}",roja:"\u{1F534}",red:"\u{1F534}",azul:"\u{1F535}",blue:"\u{1F535}","azul marino":"\u{1F535}",marino:"\u{1F535}",verde:"\u{1F7E2}",green:"\u{1F7E2}",amarillo:"\u{1F7E1}",amarilla:"\u{1F7E1}",yellow:"\u{1F7E1}",dorado:"\u{1F7E1}",gold:"\u{1F7E1}",negro:"\u26AB",negra:"\u26AB",black:"\u26AB",blanco:"\u26AA",blanca:"\u26AA",white:"\u26AA",rosa:"\u{1FA77}",pink:"\u{1FA77}","rosa mexicano":"\u{1FA77}",morado:"\u{1F7E3}",morada:"\u{1F7E3}",violeta:"\u{1F7E3}",lila:"\u{1F7E3}",purple:"\u{1F7E3}",naranja:"\u{1F7E0}",orange:"\u{1F7E0}",caf\u00E9:"\u{1F7E4}",cafe:"\u{1F7E4}",marr\u00F3n:"\u{1F7E4}",marron:"\u{1F7E4}",brown:"\u{1F7E4}",beige:"\u{1F7E4}",crema:"\u{1F7E1}",gris:"\u{1FA76}",plateado:"\u{1FA76}",silver:"\u{1FA76}",gray:"\u{1FA76}",grey:"\u{1FA76}",turquesa:"\u{1F535}",celeste:"\u{1F535}",cian:"\u{1F535}",cyan:"\u{1F535}",coral:"\u{1F534}",salmon:"\u{1FA77}",salm\u00F3n:"\u{1FA77}",vino:"\u{1F534}",burgundy:"\u{1F534}",guinda:"\u{1F534}",magenta:"\u{1F7E3}",fucsia:"\u{1F7E3}",fuchsia:"\u{1F7E3}",indigo:"\u{1F7E3}"},i=o=>/color|colour|color\s*\/\s*tono/i.test(o||"");window._mkColorDot=function(o,n){const r=typeof _esc=="function"?_esc:(p=>String(p||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"));if(!i(o))return`<span style="font-weight:600;">${r(n)}</span>`;const a=(n||"").toLowerCase().trim(),s=t[a],c=a==="blanco"||a==="blanca"||a==="white"||a==="crema"?"#d1d5db":"transparent";return s?`<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${s};border:1.5px solid ${c};flex-shrink:0;"></span>${r(n)}</span>`:`<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${n.startsWith("#")||/^(rgb|hsl)/.test(n)?n:"#d1d5db"};border:1.5px solid #e5e7eb;flex-shrink:0;"></span>${r(n)}</span>`},window._mkColorEmoji=function(o,n){if(!i(o))return n;const r=(n||"").toLowerCase().trim(),a=e[r];return a?`${a} ${n}`:n}})(),window._normSearch=function(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")},window._money=function(t){return Math.round((parseFloat(t)||0)*100)/100},window._sumLineas=function(t,e,i){return e=e||"price",i=i||"quantity",t.reduce((o,n)=>{const r=Math.round((parseFloat(n[e])||0)*100)*(parseInt(n[i])||1);return o+r},0)/100},window._ajustarStockId=window._ajustarStockId??null,window.currentVariants=window.currentVariants??[],window.currentProductImage=window.currentProductImage??null,window.currentProductImageFile=window.currentProductImageFile??null,window.modoEdicion=window.modoEdicion??!1,window.edicionProductoId=window.edicionProductoId??null,window._invSortCol=window._invSortCol??null,window._invSortDir=window._invSortDir??"asc",window._invCurrentPage=window._invCurrentPage??1,window._invPageSize=window._invPageSize??10,window.stockMovements=window.stockMovements??window.stockMovimientos??[],window._kitComponentes=window._kitComponentes??[];function saveStockMovements(){window.stockMovimientos=window.stockMovements,sbSave("stockMovimientos",window.stockMovements)}function registrarMovimiento({productoId:t,productoNombre:e,tipo:i,cantidad:o,motivo:n,stockAntes:r,stockDespues:a}){window.stockMovements.unshift({id:mkId(),fecha:(typeof _fechaHoy=="function"?_fechaHoy():new Date().toISOString().split("T")[0])+"T"+new Date().toLocaleTimeString("es-MX"),productoId:t,productoNombre:e,tipo:i,cantidad:o,motivo:n||"",stockAntes:r,stockDespues:a}),window.stockMovements.length>500&&(window.stockMovements.splice(500),window.stockMovimientos=window.stockMovements),saveStockMovements()}window.registrarMovimiento=registrarMovimiento,typeof _esc>"u"&&(window._esc=function(t){return t==null?"":String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")});function _genId(){return"p"+mkId().replace(/-/g,"")}function getStockEfectivo(t){const e=t.variants&&t.variants.length>0,i=t.mpComponentes&&t.mpComponentes.length>0;function o(){if(t.mpComponentes.every(a=>{const s=(window.products||[]).find(c=>String(c.id)===String(a.id));return s&&s.tipo==="servicio"}))return 0;let r=1/0;return t.mpComponentes.forEach(a=>{const s=(window.products||[]).find(c=>String(c.id)===String(a.id));if(s&&s.tipo!=="servicio"){const c=parseFloat(s.stock)||0,p=parseFloat(a.qty)||1,d=parseFloat(a.rendimientoPorHoja)||1,l=Math.floor(c/p*d);l<r&&(r=l)}}),r===1/0?0:r}if(e){const n=t.variants.reduce((r,a)=>r+(parseInt(a.qty)||0),0);return i?n+o():n}if(i){if(t.mpComponentes.every(s=>{const c=(window.products||[]).find(p=>String(p.id)===String(s.id));return c&&c.tipo==="servicio"}))return parseInt(t.stock)||0;const r=parseInt(t.stock)||0,a=o();return r+a}return parseInt(t.stock)||0}window.getStockEfectivo=getStockEfectivo;function _normVariante(t){return(t||"").replace(/\s*:\s*/g,":").trim().toLowerCase()}window._normVariante=_normVariante;function mostrarListaCompras(t){t||(window._listaComprasChecked={});const e=["confirmado","pago","produccion","envio","salida","retirar"],i=(window.pedidos||[]).filter(a=>e.includes(a.status)&&!a.inventarioDescontado),o={};i.forEach(a=>{(a.productosInventario||[]).forEach(s=>{const c=(s.id||s.name)+"|"+(s.variante||s.variant||"");(s.id||s.name)&&(o[c]||(o[c]={id:s.id,nombre:s.name||s.nombre,variante:s.variante||s.variant||"",necesario:0,pedidosRef:[]}),o[c].necesario+=s.quantity||s.cantidad||1,o[c].pedidosRef.push(a.folio||a.id))})});const n=Object.values(o).map(a=>{const s=(window.products||[]).find(d=>String(d.id)===String(a.id));let c=0;if(s)if(a.variante){const d=(s.variants||[]).find(l=>_normVariante(l.value)===_normVariante(a.variante)||_normVariante(`${l.type}:${l.value}`)===_normVariante(a.variante));c=d?d.qty||0:getStockEfectivo(s)}else c=typeof getStockEfectivo=="function"?getStockEfectivo(s):s.stock||0;const p=Math.max(0,a.necesario-c);return{...a,disponible:c,faltan:p}}).sort((a,s)=>s.faltan-a.faltan);n.forEach(a=>{const s=(window.products||[]).find(c=>String(c.id)===String(a.id));a.costoUnit=s&&parseFloat(s.cost)||0,a.costoTotal=a.faltan*a.costoUnit});const r=document.getElementById("listaComprasContent");if(r){if(n.length===0)r.innerHTML='<p style="color:#9ca3af;text-align:center;padding:32px 0;font-size:.875rem;">No hay pedidos activos con materiales asignados.</p>';else{const a=n.filter(d=>d.faltan>0),s=n.filter(d=>d.faltan===0);let c="";if(a.length>0){const d=a.reduce((l,m)=>l+m.costoTotal,0);c+=`<p style="font-size:.7rem;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">\u26A0\uFE0F Necesitas comprar (${a.length})</p>`,c+=`<table style="width:100%;border-collapse:collapse;font-size:.78rem;margin-bottom:4px;">
                <thead><tr style="background:#fef9c3;color:#92400e;font-size:.68rem;">
                    <th style="padding:6px 8px;text-align:left;border-bottom:1px solid #fcd34d;">Producto</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Stock</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Necesitas</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Faltan</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo c/u</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo est.</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">\u2713</th>
                </tr></thead><tbody>`,a.forEach(l=>{const m=(l.id||l.nombre)+"|"+(l.variante||""),u=!!window._listaComprasChecked[m],g=u?"background:#f0fdf4;text-decoration:line-through;color:#6b7280;":"background:#fef3c7;",x=m.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),w=(window.products||[]).find(b=>String(b.id)===String(l.id)),f=w&&w.proveedorUrl?w.proveedorUrl.trim():"",y=f?`<a href="${_esc(f)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:3px;font-size:.65rem;padding:2px 6px;border-radius:999px;background:#dbeafe;color:#1d4ed8;text-decoration:none;font-weight:700;">\u{1F6D2} Comprar</a>`:"";c+=`<tr style="${g}border-bottom:1px solid #fde68a;">
                    <td style="padding:8px 8px;">
                        <span style="font-weight:700;">${_esc(l.nombre)}</span>${l.variante?` <span style="font-weight:400;color:#92400e;font-size:.7rem;">(${_esc(l.variante)})</span>`:""}
                        <div style="font-size:.65rem;color:#9ca3af;">Pedidos: ${[...new Set(l.pedidosRef)].map(b=>_esc(b)).join(", ")}</div>
                        ${y}
                    </td>
                    <td style="text-align:center;padding:8px 6px;">${l.disponible}</td>
                    <td style="text-align:center;padding:8px 6px;">${l.necesario}</td>
                    <td style="text-align:center;padding:8px 6px;font-weight:900;color:#d97706;">${l.faltan}</td>
                    <td style="text-align:right;padding:8px 6px;">${l.costoUnit>0?"$"+l.costoUnit.toFixed(2):"\u2014"}</td>
                    <td style="text-align:right;padding:8px 6px;font-weight:700;color:#b45309;">${l.costoTotal>0?"$"+l.costoTotal.toFixed(2):"\u2014"}</td>
                    <td style="text-align:center;padding:8px 6px;">
                        ${u?'<span style="color:#16a34a;font-size:.75rem;font-weight:700;">\u2713 Comprado</span>':`<input type="checkbox" onchange="window._lcToggleComprado('${x}')" style="width:16px;height:16px;cursor:pointer;">`}
                    </td>
                </tr>`}),c+=`</tbody><tfoot><tr style="background:#fef9c3;font-weight:800;color:#b45309;">
                <td colspan="5" style="padding:8px 8px;text-align:right;font-size:.78rem;">\u{1F4B0} Total estimado:</td>
                <td style="padding:8px 6px;text-align:right;font-size:.85rem;">$${d.toFixed(2)}</td>
                <td></td>
            </tr></tfoot></table>`}s.length>0&&(c+=`<p style="font-size:.7rem;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;">\u2705 Stock suficiente (${s.length})</p>`,c+=s.map(d=>`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:4px;">
                    <p style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(d.nombre)}${d.variante?` <span style="font-weight:400;color:#6b7280;">(${_esc(d.variante)})</span>`:""}</p>
                    <p style="font-size:.78rem;color:#16a34a;font-weight:700;">Stock: ${d.disponible} / Necesitas: ${d.necesario}</p>
                </div>`).join("")),a.length===0&&(c='<p style="color:#16a34a;text-align:center;padding:12px 0;font-size:.9rem;font-weight:700;">\u2705 Tienes stock suficiente para todos los pedidos activos.</p>'+c),a.length>0&&(c+=`<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
                <button onclick="window._lcWhatsApp()" style="flex:1;min-width:160px;background:#25d366;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">\u{1F4F2} Enviar por WhatsApp al proveedor</button>
                <button onclick="window._lcExportCSV()" style="flex:1;min-width:140px;background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar CSV</button>
            </div>`);const p=(window.products||[]).filter(d=>(!d.tipo||d.tipo==="producto"||d.tipo==="producto_interno"||d.tipo==="pack")&&Array.isArray(d.mpComponentes)&&d.mpComponentes.length>0).map(d=>({prod:d,producibles:typeof calcularProducibles=="function"?calcularProducibles(d)??0:0})).sort((d,l)=>l.producibles-d.producibles).slice(0,5);if(p.length>0){let d=`<div style="margin-top:20px;padding:14px 16px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;">
                <p style="font-size:.7rem;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">\u{1F3ED} Top 5 m\xE1s producibles ahora</p>
                <div style="display:flex;flex-direction:column;gap:6px;">`;p.forEach(({prod:l,producibles:m})=>{const u=m>=5?"#16a34a":m>=1?"#d97706":"#dc2626",g=m>=5?"#d1fae5":m>=1?"#fef3c7":"#fee2e2";d+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
                    <span style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(l.name)}</span>
                    <span style="padding:2px 10px;border-radius:99px;font-size:.75rem;font-weight:700;background:${g};color:${u};">${m} uds</span>
                </div>`}),d+="</div></div>",c+=d}r.innerHTML=c}window._lcToggleComprado=function(a){window._listaComprasChecked||(window._listaComprasChecked={}),window._listaComprasChecked[a]=!0,mostrarListaCompras(!0)},window._lcWhatsApp=function(){const a=n.filter(l=>l.faltan>0);if(!a.length)return;const s=_fechaHoy(),c=a.reduce((l,m)=>l+m.costoTotal,0);let p=`\u{1F4E6} Lista de compras Maneki Store
Fecha: ${s}

`;a.forEach(l=>{const m=l.nombre+(l.variante?` (${l.variante})`:"");l.costoUnit>0?p+=`\u2022 ${m}: ${l.faltan} uds ($${l.costoUnit.toFixed(2)} c/u = $${l.costoTotal.toFixed(2)})
`:p+=`\u2022 ${m}: ${l.faltan} uds
`}),c>0&&(p+=`
\u{1F4B0} Total estimado: $${c.toFixed(2)}`);const d="https://api.whatsapp.com/send?text="+encodeURIComponent(p);window.open(d,"_blank")},window._lcExportCSV=function(){const a=n.filter(u=>u.faltan>0),s=["Producto","Variante","Cantidad requerida","Stock actual","Faltante","Costo unitario","Costo total"],c=a.map(u=>[u.nombre,u.variante||"",u.necesario,u.disponible,u.faltan,u.costoUnit.toFixed(2),u.costoTotal.toFixed(2)]);let p=s.join(",")+`
`;c.forEach(u=>{p+=u.map(g=>`"${String(g).replace(/"/g,'""')}"`).join(",")+`
`});const d=new Blob([p],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(d),m=document.createElement("a");m.href=l,m.download=`lista-compras-${_fechaHoy()}.csv`,m.click(),URL.revokeObjectURL(l)},openModal("listaComprasModal")}}window.mostrarListaCompras=mostrarListaCompras;function syncStockFromVariants(t){t.variants&&t.variants.length>0&&(t.stock=t.variants.reduce((e,i)=>e+(parseInt(i.qty)||0),0))}function setupImageUpload(){["productImage","mpProductImage"].forEach(t=>{const e=document.getElementById(t);!e||e._mkBound||(e._mkBound=!0,e.addEventListener("change",function(i){const o=i.target.files[0];if(!o)return;window.currentProductImageFile=o;const n=new FileReader,r=t==="mpProductImage";n.onload=a=>{const s=document.getElementById(r?"mpPreviewImg":"previewImg"),c=document.getElementById(r?"mpImagePreview":"imagePreview");s&&(s.src=a.target.result),c&&c.classList.remove("hidden")},n.readAsDataURL(o)}))})}window.setupImageUpload=setupImageUpload;function sortInventory(t){window._invSortDir=window._invSortCol===t&&window._invSortDir==="asc"?"desc":"asc",window._invSortCol=t,window._invCurrentPage=1,document.querySelectorAll(".sortable-th").forEach(e=>{e.classList.remove("asc","desc"),e.getAttribute("onclick")===`sortInventory('${t}')`&&e.classList.add(window._invSortDir)}),renderInventoryTable()}window.sortInventory=sortInventory;let _lastTelegramAlert=window._lastTelegramStockAlert||0;function _pedidosQueUsanMP(t){const e=["confirmado","pago","produccion","envio","salida","retirar","pendiente"];return(window.pedidos||[]).filter(i=>e.includes(i.status||"")?(i.productosInventario||[]).some(o=>{const n=(window.products||[]).find(r=>String(r.id)===String(o.id));return n?(n.mpComponentes||[]).some(r=>String(r.id)===String(t)):!1}):!1)}window._pedidosQueUsanMP=_pedidosQueUsanMP;function checkStockAlerts(){const t=window.products||[],e=t.filter(c=>getStockEfectivo(c)===0),i=t.filter(c=>{const p=getStockEfectivo(c);return p>0&&p<=(c.puntoReorden??c.stockMin??5)}),o=i.filter(c=>c.tipo==="materia_prima"),n=e.filter(c=>c.tipo==="materia_prima");[...n,...o].forEach(c=>{const p=_pedidosQueUsanMP(c.id);if(p.length>0){const d=p.map(l=>l.folio||l.id).slice(0,5).join(", ");manekiToastExport(`\u{1F6A8} URGENTE: "${c.name}" con stock cr\xEDtico \u2014 afecta pedidos: ${d}`,"err")}}),e.length&&manekiToastExport(`\u{1F534} ${e.length} producto(s) agotado(s)`,"warn"),i.length&&manekiToastExport(`\u26A0\uFE0F ${i.length} producto(s) con stock bajo`,"warn"),n.length?manekiToastExport(`\u{1F3ED} ${n.length} materia(s) prima(s) AGOTADAS \u2014 producci\xF3n bloqueada`,"err"):o.length&&manekiToastExport(`\u{1F3ED} ${o.length} materia(s) prima(s) con stock bajo`,"warn");const a=document.getElementById("sidebarBadgeMP");if(a){const c=o.length+n.length;c>0?(a.textContent=c,a.style.display="inline-block"):a.style.display="none"}(e.length>0||i.length>0)&&_notificarStockTelegram({agotados:e,bajos:i,mpAgotadas:n,mpBajas:o}),(n.length||o.length)&&_alertaStockWA(n,o)}window.checkStockAlerts=checkStockAlerts;async function _notificarStockTelegram({agotados:t,bajos:e,mpAgotadas:i,mpBajas:o}){const n=Date.now();if(n-_lastTelegramAlert<3600*1e3)return;window._lastTelegramStockAlert=n,_lastTelegramAlert=n;const r=window.storeConfig||{},a=r.telegramBotToken;if(!a){console.warn("Telegram: telegramBotToken no configurado, omitiendo notificaci\xF3n de stock.");return}const s=[r.telegramChatId1,r.telegramChatId2].filter(Boolean);if(!s.length)return;const c=[];t.length&&(c.push(`\u{1F534} *Agotados (${t.length}):*`),t.slice(0,10).forEach(d=>c.push(`  \u2022 ${d.name} \u2014 stock: 0`))),e.length&&(c.push(`\u26A0\uFE0F *Stock bajo (${e.length}):*`),e.slice(0,10).forEach(d=>c.push(`  \u2022 ${d.name} \u2014 stock: ${d.stock} (m\xEDn: ${d.stockMin||5})`))),i.length&&c.push(`\u{1F3ED} *MP AGOTADAS \u2014 producci\xF3n bloqueada:* ${i.map(d=>d.name).join(", ")}`);const p=`\u{1F4E6} *Alerta de inventario \u2014 Maneki Store*

${c.join(`
`)}`;for(const d of s)try{await fetch(`https://api.telegram.org/bot${a}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:d,text:p,parse_mode:"Markdown"})})}catch(l){console.warn("Telegram stock alert error:",l)}}window._notificarStockTelegram=_notificarStockTelegram;function _alertaStockWA(t,e){const i=document.getElementById("_mkStockWAAlert");i&&i.remove();const o=[];t.length&&o.push(`\u{1F534} Agotadas: ${t.map(a=>a.name).join(", ")}`),e.length&&o.push(`\u26A0\uFE0F Stock bajo: ${e.map(a=>a.name).join(", ")}`);const n=encodeURIComponent(`\u{1F3ED} *Maneki \u2014 Alerta de Inventario*

${o.join(`
`)}

_Reabastece pronto para no detener producci\xF3n._`),r=document.createElement("div");r.id="_mkStockWAAlert",r.style.cssText="position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;border:2px solid #25D366;border-radius:14px;padding:14px 18px;box-shadow:0 4px 24px rgba(0,0,0,0.15);max-width:300px;font-size:13px;line-height:1.4;",r.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#1f2937;font-size:14px;">\u{1F3ED} MP cr\xEDtica</strong>
            <button onclick="document.getElementById('_mkStockWAAlert').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;line-height:1;">\xD7</button>
        </div>
        <div style="color:#6b7280;margin-bottom:10px;">${o.map(a=>_esc(a)).join("<br>")}</div>
        <button onclick="window.open('https://api.whatsapp.com/send?text=${n}','_blank')" style="width:100%;padding:8px 12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">
            \u{1F4F1} Avisar por WhatsApp
        </button>`,document.body.appendChild(r)}window._alertaStockWA=_alertaStockWA;function exportarInventarioCSV(){const t=["SKU","Nombre","Categor\xEDa","Tipo","Costo","Precio","Stock","Stock M\xEDn","Margen%","Producibles","Proveedor","Proveedor URL","Estado","Tags","Variantes","\xDAltima actualizaci\xF3n"],e=(window.products||[]).map(a=>{const s=((window.categories||[]).find(u=>u.id===a.category)||{}).name||a.category,c=a.cost&&a.price?((a.price-a.cost)/a.price*100).toFixed(0)+"%":"",p=typeof getStockEfectivo=="function"?getStockEfectivo(a):a.stock||0,d=p===0?"Agotado":p<=(a.stockMin||5)?"Bajo Stock":"Disponible",l=typeof calcularProducibles=="function"?calcularProducibles(a)??"":"",m=a.updatedAt?new Date(a.updatedAt).toLocaleString("es-MX"):"";return[a.sku,a.name,s,a.tipo||"producto",a.cost||0,a.price||0,p,a.stockMin||5,c,l,a.proveedor||"",a.proveedorUrl||"",d,(a.tags||[]).join("; "),(a.variants||[]).map(u=>`${u.type}:${u.value}(${u.qty??0})`).join("; "),m].map(u=>`"${String(u).replace(/"/g,'""')}"`).join(",")}),i=[t.join(","),...e].join(`
`),o=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(o),r=document.createElement("a");r.href=n,r.download=`inventario_${typeof _fechaHoy=="function"?_fechaHoy():new Date().toISOString().slice(0,10)}.csv`,r.click(),URL.revokeObjectURL(n),manekiToastExport("\u{1F4E5} Inventario exportado como CSV","ok")}window.exportarInventarioCSV=exportarInventarioCSV;function editarStockInline(t){const e=(window.products||[]).find(n=>String(n.id)===String(t));if(!e)return;const i=document.getElementById(`stock-cell-${t}`);if(!i)return;i.innerHTML=`
        <div style="display:flex;align-items:center;gap:4px;">
            <input id="inline-stock-${t}" type="number" min="0" value="${typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0}"
                style="width:60px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;"
                onkeydown="if(event.key==='Enter')confirmarStockInline('${t}');if(event.key==='Escape')renderInventoryTable();">
            <button onclick="confirmarStockInline('${t}')"
                style="width:24px;height:24px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">\u2713</button>
            <button onclick="renderInventoryTable()"
                style="width:24px;height:24px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;cursor:pointer;font-size:12px;">\u2715</button>
        </div>`;const o=document.getElementById(`inline-stock-${t}`);o&&o.focus()}window.editarStockInline=editarStockInline;function confirmarStockInline(t){const e=(window.products||[]).find(r=>String(r.id)===String(t));if(!e)return;const i=document.getElementById(`inline-stock-${t}`);if(!i)return;const o=parseInt(i.value);if(isNaN(o)||o<0){manekiToastExport("Stock inv\xE1lido","err");return}const n=typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0;if(e.stock=o,Array.isArray(e.variants)&&e.variants.length>0){const r=o-n;r!==0&&e.variants[0]&&(e.variants[0].qty=Math.max(0,(parseInt(e.variants[0].qty)||0)+r)),typeof syncStockFromVariants=="function"&&syncStockFromVariants(e)}registrarMovimiento({productoId:e.id,productoNombre:e.name,tipo:"ajuste",cantidad:o-n,motivo:"Edici\xF3n inline",stockAntes:n,stockDespues:o}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),manekiToastExport(`\u2705 Stock de "${e.name}" \u2192 ${o}`,"ok")}window.confirmarStockInline=confirmarStockInline;function poblarFiltroProveedores(){const t=document.getElementById("inventoryProveedorFilter");if(!t)return;const e=t.value,i=[...new Set((window.products||[]).map(o=>(o.proveedor||"").trim()).filter(Boolean))].sort((o,n)=>o.localeCompare(n,"es"));t.innerHTML='<option value="">\u{1F3EA} Todos los proveedores</option>'+i.map(o=>`<option value="${_esc(o)}"${e===o?"selected":""}>${_esc(o)}</option>`).join("")}window.poblarFiltroProveedores=poblarFiltroProveedores;function invInlineEditStock(t,e){const i=(window.products||[]).find(a=>String(a.id)===String(t));if(!i)return;const o=parseFloat(i.stock)||0,n=document.createElement("input");n.type="number",n.min="0",n.step="0.01",n.value=o,n.style.cssText="width:60px;padding:2px 6px;border:1.5px solid #7c3aed;border-radius:6px;font-size:.85rem;text-align:center;";const r=async()=>{const a=parseFloat(n.value);if(!isNaN(a)&&a!==o){const s=o;i.stock=a,registrarMovimiento({productoId:i.id,productoNombre:i.name,tipo:"ajuste",cantidad:a-s,motivo:"Edici\xF3n inline",stockAntes:s,stockDespues:a}),saveProducts(),manekiToastExport(`Stock actualizado: ${i.name} \u2192 ${a}`,"ok")}renderInventoryTable()};n.addEventListener("blur",r),n.addEventListener("keydown",a=>{a.key==="Enter"&&n.blur(),a.key==="Escape"&&(n.value=o,n.blur())}),e.innerHTML="",e.appendChild(n),n.focus(),n.select()}window.invInlineEditStock=invInlineEditStock;function invInlineEditPrice(t,e){const i=(window.products||[]).find(a=>String(a.id)===String(t));if(!i)return;const o=parseFloat(i.price)||0,n=document.createElement("input");n.type="number",n.min="0",n.step="0.01",n.value=o.toFixed(2),n.style.cssText="width:80px;padding:2px 6px;border:1.5px solid #C5A572;border-radius:6px;font-size:.85rem;text-align:center;font-weight:700;";const r=()=>{const a=parseFloat(n.value);!isNaN(a)&&a>=0&&a!==o&&(i.historialPrecios||(i.historialPrecios=[]),i.historialPrecios.push({precio:o,fecha:typeof _fechaHoy=="function"?_fechaHoy():new Date().toISOString().split("T")[0]}),i.price=a,typeof saveProducts=="function"&&saveProducts(),typeof manekiToastExport=="function"&&manekiToastExport(`Precio actualizado: ${i.name} \u2192 $${a.toFixed(2)}`,"ok")),typeof renderInventoryTable=="function"&&renderInventoryTable()};n.addEventListener("blur",r),n.addEventListener("keydown",a=>{a.key==="Enter"&&n.blur(),a.key==="Escape"&&(n.value=o.toFixed(2),n.blur())}),e.innerHTML="",e.appendChild(n),n.focus(),n.select()}window.invInlineEditPrice=invInlineEditPrice;async function registrarMerma(t){const e=(window.products||[]).find(r=>String(r.id)===String(t));if(!e){manekiToastExport("Producto no encontrado","err");return}const i=await new Promise(r=>{const a=document.getElementById("mkMermaModal");a&&a.remove();const s=document.createElement("div");s.id="mkMermaModal",s.className="mk-modal-overlay",s.innerHTML=`<div class="mk-modal-box" style="max-width:380px">
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C9} Registrar Merma</h3>
            <label style="font-size:.8rem;color:#6b7280;">Cantidad (${e.unidad||"pza"})</label>
            <input id="mkMermaCant" type="number" min="0.01" step="0.01" value="1" class="mk-input w-full mt-1 mb-3" placeholder="Ej: 2.5">
            <label style="font-size:.8rem;color:#6b7280;">Motivo</label>
            <input id="mkMermaMotivo" type="text" class="mk-input w-full mt-1 mb-4" value="Material da\xF1ado" placeholder="Ej: Material da\xF1ado">
            <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkMermaModal').remove();window._mkMermaResolve(null)">Cancelar</button>
                <button type="button" class="mk-btn-primary" onclick="window._mkMermaResolve({cantidad:document.getElementById('mkMermaCant').value,motivo:document.getElementById('mkMermaMotivo').value})">Confirmar</button>
            </div>
        </div>`,window._mkMermaResolve=c=>{s.remove(),r(c)},document.body.appendChild(s),setTimeout(()=>document.getElementById("mkMermaCant")?.focus(),50)});if(!i||!i.cantidad||parseFloat(i.cantidad)<=0)return;const o=parseFloat(i.cantidad);if(!o||o<=0){manekiToastExport("\u26A0\uFE0F Cantidad inv\xE1lida","warn");return}const n=i.motivo||"Sin especificar";if(Array.isArray(e.variants)&&e.variants.length){const r=e.variants.reduce((p,d)=>p+(parseFloat(d.qty)||0),0),a=[...e.variants].sort((p,d)=>(parseFloat(d.qty)||0)-(parseFloat(p.qty)||0));let s=o;for(const p of a){if(s<=0)break;const d=e.variants.find(u=>u.type===p.type&&u.value===p.value);if(!d)continue;const l=parseFloat(d.qty)||0,m=Math.min(l,s);d.qty=Math.max(0,l-m),s-=m}typeof syncStockFromVariants=="function"&&syncStockFromVariants(e);const c=e.variants.reduce((p,d)=>p+(parseFloat(d.qty)||0),0);registrarMovimiento({productoId:e.id,productoNombre:e.name,tipo:"merma",cantidad:-o,motivo:n||"Sin especificar",stockAntes:r,stockDespues:c})}else{const r=parseFloat(e.stock)||0,a=Math.max(0,r-o);e.stock=a,registrarMovimiento({productoId:e.id,productoNombre:e.name,tipo:"merma",cantidad:-o,motivo:n||"Sin especificar",stockAntes:r,stockDespues:a})}saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),manekiToastExport(`\u{1F4C9} Merma: -${o} ${e.unidad||"pza"} de "${e.name}"`,"warn")}window.registrarMerma=registrarMerma;function addVariant(){const t=document.getElementById("variantType"),e=document.getElementById("variantValue"),i=t?t.value.trim():"",o=e?e.value.trim():"";if(!i||!o){typeof manekiToastExport=="function"&&manekiToastExport("Por favor completa tipo y valor de la variante","warn");return}if((window.currentVariants||[]).some(r=>r.type===i&&r.value===o)){typeof manekiToastExport=="function"&&manekiToastExport(`\u26A0\uFE0F La variante ${i}: ${o} ya existe`,"warn");return}window.currentVariants.push({type:i,value:o,qty:0}),renderVariantsList(),t&&(t.value=""),e&&(e.value=""),t&&t.focus()}window.addVariant=addVariant;function updateVariantQty(t,e){const i=parseInt(e);!isNaN(i)&&i>=0&&(window.currentVariants[t].qty=i)}window.updateVariantQty=updateVariantQty;function renderVariantsList(){const t=document.getElementById("variantsList");if(t){if(!window.currentVariants||window.currentVariants.length===0){t.innerHTML='<span class="text-xs text-gray-400 italic">Sin variantes agregadas</span>';return}t.innerHTML=window.currentVariants.map((e,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:6px;">
            <div style="flex:1;min-width:0;">
                <span style="font-size:12px;color:#374151;">${_esc(e.type)}: ${_mkColorDot(e.type,_esc(e.value))}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <label style="font-size:11px;color:#6b7280;font-weight:600;white-space:nowrap;">Piezas:</label>
                <div style="display:flex;align-items:center;gap:2px;">
                    <button type="button" onclick="(function(){var n=parseInt(document.getElementById('vqty-${i}').value)||0;if(n>0){document.getElementById('vqty-${i}').value=n-1;updateVariantQty(${i},n-1);}})()"
                        style="width:22px;height:22px;border:1px solid #d1d5db;border-radius:5px;background:#fff;cursor:pointer;font-size:13px;font-weight:bold;color:#6b7280;display:flex;align-items:center;justify-content:center;padding:0;">\u2212</button>
                    <input id="vqty-${i}" type="number" min="0" value="${e.qty??0}"
                        oninput="updateVariantQty(${i}, this.value)"
                        style="width:54px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;font-weight:600;color:#4f46e5;">
                    <button type="button" onclick="(function(){var n=parseInt(document.getElementById('vqty-${i}').value)||0;document.getElementById('vqty-${i}').value=n+1;updateVariantQty(${i},n+1);})()"
                        style="width:22px;height:22px;border:1px solid #d1d5db;border-radius:5px;background:#fff;cursor:pointer;font-size:13px;font-weight:bold;color:#6b7280;display:flex;align-items:center;justify-content:center;padding:0;">+</button>
                </div>
                <span style="font-size:11px;color:#9ca3af;">pzs</span>
            </div>
            <button type="button" onclick="removeVariant(${i})"
                style="width:24px;height:24px;background:#fee2e2;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u2715</button>
        </div>`).join("")}}window.renderVariantsList=renderVariantsList;function removeVariant(t){window.currentVariants.splice(t,1),renderVariantsList()}window.removeVariant=removeVariant;function descontarStockVariante(t,e,i,o){const n=(window.products||[]).find(a=>String(a.id)===String(t));if(!n||!n.variants)return;const r=n.variants.find(a=>a.type===e&&a.value===i);r&&(r.qty=Math.max(0,(r.qty||0)-o)),syncStockFromVariants(n),saveProducts()}window.descontarStockVariante=descontarStockVariante;function generateSKU(t){const i={tazas:"TAZ",llaveros:"LLV",libretas:"LIB",peluches:"PEL",otros:"OTR"}[t]||"PRD",o=(window.products||[]).filter(r=>r.category===t&&r.sku&&r.sku.startsWith(`MNK-${i}-`)).map(r=>parseInt((r.sku||"").split("-").pop())||0),n=(o.length?Math.max(...o):0)+1;return`MNK-${i}-${String(n).padStart(3,"0")}`}window.generateSKU=generateSKU;function skuEsUnico(t,e){const i=t.toLowerCase();return!(window.products||[]).some(o=>{if(!o.sku||o.sku.toLowerCase()!==i||e&&String(o.id)===String(e))return!1;if(e){const n=(window.products||[]).find(r=>String(r.id)===String(e));if(n&&n.sku&&n.sku.toLowerCase()===i)return!1}return!0})}window._ptGaleriaUrls=window._ptGaleriaUrls??[],window._ptGaleriaFiles=window._ptGaleriaFiles??[];function ptRenderGaleria(){const t=document.getElementById("ptGaleriaPreview"),e=document.getElementById("ptGaleriaVacia");if(!t)return;const i=window._ptGaleriaUrls||[],o=window._ptGaleriaFiles||[],n=i.length+o.length;e&&(e.style.display=n?"none":"block"),[...t.children].forEach(r=>{r.id!=="ptGaleriaVacia"&&r.remove()}),i.forEach((r,a)=>{const s=document.createElement("div");s.style="position:relative;width:120px;height:120px;",s.innerHTML=`<img src="${r}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #e5e7eb;">
            <button type="button" onclick="ptEliminarFotoGaleria('url',${a})"
                style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.75rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;">\u2715</button>`,t.appendChild(s)}),o.forEach((r,a)=>{const s=document.createElement("div");s.style="position:relative;width:120px;height:120px;",s.dataset.fileIdx=a;const c=document.createElement("img");c.style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #C5A572;opacity:.85;";const p=new FileReader;p.onload=l=>{c.src=l.target.result},p.readAsDataURL(r);const d=document.createElement("button");d.type="button",d.innerHTML="\u2715",d.style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.7rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;",d.onclick=()=>ptEliminarFotoGaleria("file",a),s.appendChild(c),s.appendChild(d),t.appendChild(s)})}window.ptRenderGaleria=ptRenderGaleria;function ptAgregarFotosGaleria(t){if(!t||!t.length)return;const e=20,i=(window._ptGaleriaUrls||[]).length+(window._ptGaleriaFiles||[]).length,o=e-i;if(o<=0){manekiToastExport(`Ya tienes ${e} fotos en la galer\xEDa`,"warn");return}const n=Array.from(t).slice(0,o);window._ptGaleriaFiles=[...window._ptGaleriaFiles||[],...n],ptRenderGaleria();const r=document.getElementById("ptGaleriaInput");r&&(r.value="")}window.ptAgregarFotosGaleria=ptAgregarFotosGaleria;function ptEliminarFotoGaleria(t,e){t==="url"?(window._ptGaleriaUrls||[]).splice(e,1):(window._ptGaleriaFiles||[]).splice(e,1),ptRenderGaleria()}window.ptEliminarFotoGaleria=ptEliminarFotoGaleria;function openAddProductModal(){injectPtModal(),window.modoEdicion=!1,window.edicionProductoId=null,window.currentVariants=[],window.currentProductImage=null,window.currentProductImageFile=null,window._ptMpComponentes=[],window._ptVariants=[],window._ptTagsActuales=[],window._tagsActuales=[],window._ptGaleriaUrls=[],window._ptGaleriaFiles=[];const t=document.getElementById("ptForm");t&&t.reset();const e=document.getElementById("ptImagePreview");e&&e.classList.add("hidden"),renderPtMpList(),renderVariantsListPt(),recalcularCostoPt(),ptRenderGaleria(),typeof updateCategorySelects=="function"&&updateCategorySelects();const i=document.querySelector("#ptModal h3");i&&(i.textContent="\u{1F4E6} Nuevo Producto Terminado");const o=document.getElementById("ptSubmitBtn");o&&(o.textContent="\u2705 Agregar Producto"),typeof openModal=="function"&&openModal("ptModal")}window.openAddProductModal=openAddProductModal;function closePtModal(){typeof closeModal=="function"&&closeModal("ptModal");const t=document.getElementById("ptForm");t&&t.reset(),window.modoEdicion=!1,window.edicionProductoId=null,window.currentVariants=[],window.currentProductImage=null,window.currentProductImageFile=null,window._ptMpComponentes=[],window._ptVariants=[],window._ptTagsActuales=[],window._tagsActuales=[],window._ptGaleriaUrls=[],window._ptGaleriaFiles=[]}window.closePtModal=closePtModal;function closeAddProductModal(){closePtModal()}window.closeAddProductModal=closeAddProductModal,window.openPtModal=openAddProductModal,window.openMpModal=function(){typeof window.injectMpModal=="function"&&window.injectMpModal(),typeof openModal=="function"&&openModal("mpModal")},window.openSvcModal=function(){typeof window.injectSvcModal=="function"&&window.injectSvcModal(),typeof openModal=="function"&&openModal("svcModal")};function parseCsvLine(t){const e=[];let i="",o=!1;for(let n=0;n<t.length;n++){const r=t[n];r==='"'?o&&t[n+1]==='"'?(i+='"',n++):o=!o:r===","&&!o?(e.push(i),i=""):i+=r}return e.push(i),e}window.parseCsvLine=parseCsvLine;async function importarInventarioCSV(t){const e=t.files[0];if(!e)return;const o=(await e.text()).split(`
`).map(c=>c.trim()).filter(Boolean);if(o.length<2){manekiToastExport("\u26A0\uFE0F CSV vac\xEDo o sin datos","warn");return}const n=o[0].replace(/^\uFEFF/,""),r=parseCsvLine(n).map(c=>c.toLowerCase().trim());let a=0,s=0;for(let c=1;c<o.length;c++){const p=parseCsvLine(o[c]),d={};if(r.forEach((y,b)=>{d[y]=(p[b]||"").trim()}),!d.nombre){s++;continue}const l=(d.tipo||"pt").toLowerCase(),m=parseFloat(d.costo)||0,u=parseFloat(d.precio)||0,g=parseFloat(d.stock)||0,x=parseInt(d.stock_min)||5;if((window.products||[]).find(y=>y.name.trim().toLowerCase()===d.nombre.toLowerCase())){s++;continue}const w=d.sku||"IMP-"+mkId().split("-")[0].toUpperCase(),f={id:mkId(),name:d.nombre,sku:w,cost:m,price:u,stock:g,stockMin:x,proveedor:d.proveedor||"",notas:d.notas||"",image:l==="mp"||l==="materia_prima"?"\u{1F3ED}":l==="svc"||l==="servicio"?"\u2699\uFE0F":"\u{1F4E6}",tags:[],historialPrecios:[],historialCostos:[],variants:[]};l==="mp"||l==="materia_prima"?f.tipo="materia_prima":l==="svc"||l==="servicio"?(f.tipo="servicio",f.stock=0):f.tipo=u>0?"producto":"producto_interno",window.products||(window.products=[]),window.products.push(f),a++}a>0?(saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),manekiToastExport(`\u2705 Importados ${a} productos${s>0?` (${s} errores/duplicados omitidos)`:""}`,"ok")):manekiToastExport(`\u26A0\uFE0F No se import\xF3 ning\xFAn producto. ${s} errores/duplicados.`,"warn"),t.value=""}window.importarInventarioCSV=importarInventarioCSV;function descargarTemplateCSV(){const t="tipo,nombre,sku,categoria,costo,precio,stock,stock_min,proveedor,notas",e=["pt,Taza personalizada,,Tazas,45.00,150.00,10,3,Proveedor ABC,Taza blanca 11oz","mp,Vinil blanco mate,,Materiales,15.00,,50,10,Distribuidora XYZ,Hoja 60x30cm","svc,Impresi\xF3n directa,,Servicios,8.00,,0,0,,Por hoja impresa"].join(`
`),i=t+`
`+e,o=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(o),r=document.createElement("a");r.href=n,r.download="template_inventario_maneki.csv",r.click(),URL.revokeObjectURL(n)}window.descargarTemplateCSV=descargarTemplateCSV;async function guardarSnapshotInventario(){if(!window.products||window.products.length===0){manekiToastExport("No hay productos para guardar snapshot","warn");return}window.inventarioSnapshots||(window.inventarioSnapshots=[]);const t=_fechaHoy(),e=window.inventarioSnapshots.find(o=>o.fecha===t);if(e){if(!await showConfirm(`Ya hay un snapshot del ${t}. \xBFReemplazarlo?`))return;const o=window.inventarioSnapshots.indexOf(e);window.inventarioSnapshots.splice(o,1)}const i={fecha:t,hora:new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),totalProductos:window.products.length,valorTotal:window.products.reduce((o,n)=>o+(parseFloat(n.cost)||0)*(parseFloat(n.stock)||0),0),items:window.products.map(o=>({id:o.id,name:o.name,tipo:o.tipo||"pt",stock:o.stock||0,cost:o.cost||0,price:o.price||0,sku:o.sku||""}))};if(window.inventarioSnapshots.unshift(i),window.inventarioSnapshots=window.inventarioSnapshots.slice(0,30),typeof sbSave=="function")sbSave("inventarioSnapshots",window.inventarioSnapshots);else try{localStorage.setItem("inventarioSnapshots",JSON.stringify(window.inventarioSnapshots))}catch{}manekiToastExport(`\u{1F4F8} Snapshot guardado: ${t} \u2014 ${i.totalProductos} productos, $${i.valorTotal.toFixed(2)} en inventario`,"ok")}window.guardarSnapshotInventario=guardarSnapshotInventario;function verSnapshotsInventario(){const t=window.inventarioSnapshots||[];if(!t.length){manekiToastExport("Sin snapshots guardados a\xFAn","warn");return}const e=t.map(o=>`
    <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:700;color:#1a0533;">${o.fecha} <span style="color:#9ca3af;font-weight:400;font-size:.8rem;">${o.hora||""}</span></div>
        <div style="font-size:.8rem;color:#6b7280;">${o.totalProductos} productos \xB7 $${Number(o.valorTotal||0).toFixed(2)} en inventario</div>
      </div>
      <button onclick="exportarSnapshotCSV('${o.fecha}')" style="padding:4px 12px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:.75rem;cursor:pointer;">\u{1F4E5} CSV</button>
    </div>`).join("");let i=document.getElementById("_snapshotModal");i||(i=document.createElement("div"),i.id="_snapshotModal",i.className="modal",document.body.appendChild(i)),i.innerHTML=`
    <div style="background:#fff;border-radius:20px;max-width:500px;width:100%;margin:auto;max-height:80vh;overflow-y:auto;padding:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">\u{1F4F8} Snapshots de Inventario</h3>
        <button onclick="closeModal('_snapshotModal')" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;">\xD7</button>
      </div>
      <p style="font-size:.8rem;color:#9ca3af;margin-bottom:12px;">Fotograf\xEDas del estado del inventario en fechas espec\xEDficas.</p>
      ${e}
    </div>`,openModal("_snapshotModal")}window.verSnapshotsInventario=verSnapshotsInventario;function exportarSnapshotCSV(t){const e=(window.inventarioSnapshots||[]).find(c=>c.fecha===t);if(!e)return;const i="nombre,tipo,sku,stock,costo,precio",o=e.items.map(c=>[c.name,c.tipo,c.sku,c.stock,c.cost,c.price].map(p=>`"${String(p||"").replace(/"/g,'""')}"`).join(",")),n="\uFEFF"+i+`
`+o.join(`
`),r=new Blob([n],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(r),s=document.createElement("a");s.href=a,s.download=`snapshot_inventario_${t}.csv`,s.click(),URL.revokeObjectURL(a)}window.exportarSnapshotCSV=exportarSnapshotCSV;function abrirBulkEditPrecios(){const t=(window.products||[]).filter(n=>n.tipo!=="materia_prima"&&n.tipo!=="servicio"&&Number(n.price||0)>0);if(t.length===0){manekiToastExport("No hay productos con precio para editar","warn");return}let e=document.getElementById("_bulkEditModal");e||(e=document.createElement("div"),e.id="_bulkEditModal",e.style.cssText="position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;",document.body.appendChild(e));const i=[...new Set(t.map(n=>n.category||n.categoria||"Sin categor\xEDa"))];e.innerHTML=`
        <div style="background:#fff;border-radius:20px;max-width:520px;width:calc(100% - 32px);max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 25px 60px rgba(0,0,0,.25);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:1.1rem;font-weight:800;color:#1F2937;margin:0;">\u{1F4CA} Actualizaci\xF3n masiva de precios</h3>
                <button onclick="document.getElementById('_bulkEditModal').style.display='none'" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9CA3AF;">\xD7</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
                <div>
                    <label style="font-size:.75rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Aplicar a</label>
                    <select id="_bulkCatFilter" style="width:100%;padding:8px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.82rem;">
                        <option value="">Todos los productos</option>
                        ${i.map(n=>`<option value="${_esc(n)}">${_esc(n)}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="font-size:.75rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Ajuste</label>
                    <div style="display:flex;gap:6px;">
                        <select id="_bulkTipo" style="padding:8px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.82rem;">
                            <option value="pct_up">\u25B2 % aumento</option>
                            <option value="pct_dn">\u25BC % descuento</option>
                            <option value="fixed">= Precio fijo</option>
                        </select>
                        <input type="number" id="_bulkValor" placeholder="10" min="0" step="0.01"
                            style="width:80px;padding:8px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.82rem;text-align:center;">
                    </div>
                </div>
            </div>
            <div id="_bulkPreview" style="max-height:260px;overflow-y:auto;border:1px solid #F3F4F6;border-radius:12px;margin-bottom:14px;">
                <div style="padding:12px;text-align:center;color:#9CA3AF;font-size:.8rem;">Configura el ajuste para ver la vista previa</div>
            </div>
            <div style="display:flex;gap:8px;">
                <button onclick="document.getElementById('_bulkEditModal').style.display='none'"
                    style="flex:1;padding:10px;border:1.5px solid #E5E7EB;border-radius:12px;background:#fff;font-size:.85rem;cursor:pointer;">Cancelar</button>
                <button id="_bulkApplyBtn" onclick="_aplicarBulkPrecios()"
                    style="flex:2;padding:10px;background:linear-gradient(135deg,#C5973B,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:.85rem;font-weight:700;cursor:pointer;">
                    \u2705 Aplicar cambios
                </button>
            </div>
        </div>`,e.style.display="flex";const o=()=>_renderBulkPreview();e.querySelector("#_bulkCatFilter")?.addEventListener("change",o),e.querySelector("#_bulkTipo")?.addEventListener("change",o),e.querySelector("#_bulkValor")?.addEventListener("input",o)}window.abrirBulkEditPrecios=abrirBulkEditPrecios;function _calcBulkPrecio(t,e,i){return e==="pct_up"?t*(1+i/100):e==="pct_dn"?t*(1-i/100):e==="fixed"?i:t}function _getBulkProductos(){const t=document.getElementById("_bulkCatFilter")?.value||"";return(window.products||[]).filter(e=>!(e.tipo==="materia_prima"||e.tipo==="servicio"||Number(e.price||0)<=0||t&&(e.category||e.categoria||"Sin categor\xEDa")!==t))}function _renderBulkPreview(){const t=document.getElementById("_bulkPreview");if(!t)return;const e=document.getElementById("_bulkTipo")?.value||"pct_up",i=parseFloat(document.getElementById("_bulkValor")?.value||"0"),o=_getBulkProductos();if(!i||i<=0){t.innerHTML='<div style="padding:12px;text-align:center;color:#9CA3AF;font-size:.8rem;">Ingresa un valor para ver la vista previa</div>';return}t.innerHTML=`
        <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#F9FAFB;">
                <th style="padding:8px 10px;text-align:left;font-size:.7rem;color:#6B7280;font-weight:700;">Producto</th>
                <th style="padding:8px 10px;text-align:right;font-size:.7rem;color:#6B7280;font-weight:700;">Precio actual</th>
                <th style="padding:8px 10px;text-align:right;font-size:.7rem;color:#6B7280;font-weight:700;">Nuevo precio</th>
            </tr></thead>
            <tbody>
                ${o.slice(0,30).map(n=>{const r=_calcBulkPrecio(Number(n.price),e,i),a=r-Number(n.price),s=a>0?"#16A34A":a<0?"#DC2626":"#6B7280";return`<tr style="border-bottom:1px solid #F3F4F6;">
                        <td style="padding:6px 10px;font-size:.78rem;color:#374151;">${_esc(n.name)}</td>
                        <td style="padding:6px 10px;font-size:.78rem;color:#6B7280;text-align:right;">$${Number(n.price).toFixed(2)}</td>
                        <td style="padding:6px 10px;font-size:.78rem;font-weight:700;color:${s};text-align:right;">$${r.toFixed(2)}</td>
                    </tr>`}).join("")}
                ${o.length>30?`<tr><td colspan="3" style="padding:6px 10px;font-size:.72rem;color:#9CA3AF;text-align:center;">... y ${o.length-30} m\xE1s</td></tr>`:""}
            </tbody>
        </table>`}window._renderBulkPreview=_renderBulkPreview;async function _aplicarBulkPrecios(){const t=document.getElementById("_bulkTipo")?.value||"pct_up",e=parseFloat(document.getElementById("_bulkValor")?.value||"0"),i=_getBulkProductos();if(!e||e<=0||i.length===0){manekiToastExport("Configura un valor v\xE1lido","warn");return}const o=t==="pct_up"?`+${e}%`:t==="pct_dn"?`-${e}%`:`precio fijo $${e}`;await(typeof showConfirm=="function"?showConfirm(`\xBFAplicar ${o} a ${i.length} producto(s)?`,"Confirmar cambio masivo"):Promise.resolve(confirm(`\xBFAplicar ${o} a ${i.length} producto(s)?`)))&&(i.forEach(r=>{const a=Math.max(.01,_calcBulkPrecio(Number(r.price),t,e));r.historialPrecios||(r.historialPrecios=[]),r.historialPrecios.push({precio:Number(r.price),fecha:typeof _fechaHoy=="function"?_fechaHoy():new Date().toISOString().split("T")[0],motivo:`Bulk: ${o}`}),r.price=parseFloat(a.toFixed(2))}),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof window._rebuildProductMap=="function"&&window._rebuildProductMap(),document.getElementById("_bulkEditModal").style.display="none",manekiToastExport(`\u2705 ${o} aplicado a ${i.length} producto(s)`,"ok"))}window._aplicarBulkPrecios=_aplicarBulkPrecios;function imprimirEtiquetasBatch(t){const e=t?(window.products||[]).filter(n=>t.includes(String(n.id))):(window.products||[]).filter(n=>n.tipo!=="materia_prima"&&n.tipo!=="servicio"&&Number(n.price||0)>0);if(e.length===0){manekiToastExport("No hay productos para imprimir etiquetas","warn");return}const i=e.map(n=>`
        <div style="width:63mm;height:38mm;border:1px solid #ddd;border-radius:6px;padding:5mm 4mm;
                    display:inline-flex;flex-direction:column;justify-content:space-between;
                    margin:2mm;page-break-inside:avoid;box-sizing:border-box;vertical-align:top;">
            <div>
                <div style="font-size:9pt;font-weight:800;color:#1a0533;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.2;">${_esc(n.name)}</div>
                ${n.sku?`<div style="font-size:7pt;color:#9ca3af;margin-top:1mm;">SKU: ${_esc(n.sku)}</div>`:""}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                <div style="font-size:16pt;font-weight:900;color:#C5A572;">$${Number(n.price).toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:2})}</div>
                <div style="font-size:7pt;color:#9ca3af;text-align:right;">${_esc(n.category||n.categoria||"")}</div>
            </div>
        </div>`).join(""),o=window.open("","_blank");if(!o){manekiToastExport("Activa ventanas emergentes para imprimir","warn");return}o.document.write(`<!DOCTYPE html><html><head>
        <title>Etiquetas \u2014 Maneki Store</title>
        <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Outfit', Arial, sans-serif; margin: 0; }
            .header { text-align:center; padding:4mm 0; color:#9ca3af; font-size:8pt; border-bottom:1px solid #eee; margin-bottom:4mm; }
            @media print { .no-print { display:none; } }
        </style>
    </head><body>
        <div class="header no-print">${e.length} etiquetas \xB7 Maneki Store \xB7 <button onclick="window.print()" style="padding:4px 12px;background:#C5A572;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:8pt;">\u{1F5A8}\uFE0F Imprimir</button></div>
        ${i}
    </body></html>`),o.document.close(),setTimeout(()=>o.print(),500)}window.imprimirEtiquetasBatch=imprimirEtiquetasBatch;let _calcPrecioProdId=null;function _inyectarCalculadoraModal(){if(document.getElementById("calculadoraPrecioModal"))return;const t=document.createElement("div");t.innerHTML=`<div id="calculadoraPrecioModal" class="fixed inset-0 z-50 hidden items-center justify-center" style="background:rgba(0,0,0,0.5);">
  <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
    <h3 class="text-base font-bold text-gray-800 mb-4">\u{1F9EE} Calculadora de precio</h3>
    <div class="space-y-3">
      <div>
        <label class="text-xs text-gray-500">Costo de materiales ($)</label>
        <input id="calcCostoMP" type="number" class="w-full border rounded-xl px-3 py-2 text-sm mt-1" placeholder="0.00" oninput="_calcPrecio()">
      </div>
      <div>
        <label class="text-xs text-gray-500">Horas de trabajo</label>
        <input id="calcHoras" type="number" class="w-full border rounded-xl px-3 py-2 text-sm mt-1" placeholder="0" oninput="_calcPrecio()">
      </div>
      <div>
        <label class="text-xs text-gray-500">Tu tarifa por hora ($)</label>
        <input id="calcTarifa" type="number" class="w-full border rounded-xl px-3 py-2 text-sm mt-1" placeholder="100" oninput="_calcPrecio()">
      </div>
      <div>
        <label class="text-xs text-gray-500">Margen de ganancia (%)</label>
        <input id="calcMargen" type="number" class="w-full border rounded-xl px-3 py-2 text-sm mt-1" value="30" oninput="_calcPrecio()">
      </div>
    </div>
    <div id="calcResultado" class="hidden mt-4 p-3 rounded-xl text-center" style="background:#f0fdf4;">
      <p class="text-xs text-gray-500">Precio sugerido</p>
      <p id="calcPrecioFinal" class="text-2xl font-bold" style="color:#059669;">$0.00</p>
      <p id="calcDesglose" class="text-xs text-gray-400 mt-1"></p>
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="closeModal('calculadoraPrecioModal')" class="flex-1 btn-secondary py-2 rounded-xl text-sm">Cerrar</button>
      <button onclick="_aplicarPrecioCalculado()" id="calcAplicarBtn" class="hidden flex-1 btn-primary py-2 rounded-xl text-sm">Aplicar precio</button>
    </div>
  </div>
</div>`,document.body.appendChild(t.firstElementChild)}function _calcPrecio(){const t=parseFloat(document.getElementById("calcCostoMP")?.value)||0,e=parseFloat(document.getElementById("calcHoras")?.value)||0,i=parseFloat(document.getElementById("calcTarifa")?.value)||0,o=parseFloat(document.getElementById("calcMargen")?.value)||0,n=e*i,r=t+n,a=r*(1+o/100),s=document.getElementById("calcResultado"),c=document.getElementById("calcPrecioFinal"),p=document.getElementById("calcDesglose"),d=document.getElementById("calcAplicarBtn");if(r<=0){s&&s.classList.add("hidden"),d&&d.classList.add("hidden");return}const l=a-r;s&&s.classList.remove("hidden"),c&&(c.textContent=`$${a.toFixed(2)}`),p&&(p.textContent=`Mat: $${t.toFixed(2)} + M.O.: $${n.toFixed(2)} + Ganancia: $${l.toFixed(2)}`),d&&_calcPrecioProdId&&d.classList.remove("hidden")}window._calcPrecio=_calcPrecio;function _aplicarPrecioCalculado(){if(!_calcPrecioProdId)return;const t=document.getElementById("calcPrecioFinal");if(!t)return;const e=parseFloat(t.textContent?.replace("$","")||"0");if(!e||e<=0){manekiToastExport("Calcula un precio primero","warn");return}const i=["ptPrice","productPrice","mpPrice"];let o=!1;for(const n of i){const r=document.getElementById(n);if(r){r.value=e.toFixed(2),r.dispatchEvent(new Event("input")),o=!0;break}}if(!o){const n=(window.products||[]).find(r=>String(r.id)===String(_calcPrecioProdId));n&&(n.price=e,saveProducts(),renderInventoryTable())}closeModal("calculadoraPrecioModal"),manekiToastExport(`\u2705 Precio $${e.toFixed(2)} aplicado`,"ok")}window._aplicarPrecioCalculado=_aplicarPrecioCalculado;function abrirCalculadoraPrecio(t){_inyectarCalculadoraModal(),_calcPrecioProdId=t||null;const e=t?(window.products||[]).find(r=>String(r.id)===String(t)):null,i=document.getElementById("calcCostoMP");i&&e&&(i.value=String(parseFloat(e.costo||e.cost||0)||0));const o=document.getElementById("calcResultado");o&&o.classList.add("hidden");const n=document.getElementById("calcAplicarBtn");n&&n.classList.add("hidden"),openModal("calculadoraPrecioModal")}window.abrirCalculadoraPrecio=abrirCalculadoraPrecio;function _registrarCambioHistorialCosto(t,e){const i=parseFloat(t.costo||t.cost||0);if(isNaN(i))return;const o=parseFloat(String(e))||0;if(i===o)return;t.costoHistorial||(t.costoHistorial=[]),t.costoHistorial.length===0&&o>0&&t.costoHistorial.push({fecha:_fechaHoy(),valor:o}),t.costoHistorial.push({fecha:_fechaHoy(),valor:i}),t.costoHistorial.length>20&&(t.costoHistorial=t.costoHistorial.slice(-20));const n=t.costoHistorial;if(n.length>=2){const r=n[n.length-2].valor,a=n[n.length-1].valor;if(r>0&&a>r*1.1){const s=((a-r)/r*100).toFixed(1);manekiToastExport(`\u26A0\uFE0F El costo de "${t.name}" subi\xF3 ${s}% (de $${r.toFixed(2)} a $${a.toFixed(2)})`,"warn")}}}window._registrarCambioHistorialCosto=_registrarCambioHistorialCosto;let _compraProdId=null;function _inyectarRegistrarCompraModal(){if(document.getElementById("registrarCompraModal"))return;const t=document.createElement("div");t.innerHTML=`<div id="registrarCompraModal" class="fixed inset-0 z-50 hidden items-center justify-center" style="background:rgba(0,0,0,0.5);">
  <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
    <h3 class="text-base font-bold text-gray-800 mb-4">\u{1F4E6} Registrar compra recibida</h3>
    <input id="compraProductoNombre" class="w-full border rounded-xl px-3 py-2 text-sm mb-3 bg-gray-50" readonly>
    <div class="space-y-3">
      <div>
        <label class="text-xs text-gray-500">Cantidad recibida</label>
        <input id="compraCantidad" type="number" class="w-full border rounded-xl px-3 py-2 text-sm mt-1" placeholder="1" min="0.01" step="0.01">
      </div>
      <div>
        <label class="text-xs text-gray-500">Costo unitario ($) \u2014 deja vac\xEDo si no cambia</label>
        <input id="compraCosto" type="number" class="w-full border rounded-xl px-3 py-2 text-sm mt-1" placeholder="0.00" step="0.01">
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="closeModal('registrarCompraModal')" class="flex-1 btn-secondary py-2 rounded-xl text-sm">Cancelar</button>
      <button onclick="_confirmarCompra()" class="flex-1 btn-primary py-2 rounded-xl text-sm">Registrar</button>
    </div>
  </div>
</div>`,document.body.appendChild(t.firstElementChild)}function registrarCompraRecibida(t,e,i){const o=(window.products||[]).find(p=>String(p.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const n=parseFloat(String(e))||0;if(n<=0){manekiToastExport("Cantidad inv\xE1lida","warn");return}const r=parseFloat(o.costo||o.cost||0)||0;if(Array.isArray(o.variants)&&o.variants.length>0){const p=[...o.variants].sort((l,m)=>(parseFloat(m.qty)||0)-(parseFloat(l.qty)||0)),d=o.variants.find(l=>l.type===p[0].type&&l.value===p[0].value);d&&(d.qty=(parseFloat(d.qty)||0)+n),typeof syncStockFromVariants=="function"&&syncStockFromVariants(o)}else o.stock=(parseFloat(o.stock)||0)+n;let a=r;i&&i>0&&(a=i,o.costo=i,o.cost=i,_registrarCambioHistorialCosto(o,r)),window.expenses||(window.expenses=[]);const s=n*a;s>0&&(window.expenses.push({id:mkId(),concepto:`Compra de MP: ${o.name}`,monto:s,fecha:_fechaHoy(),categoria:"Inventario",nota:`${n} uds \xD7 $${a.toFixed(2)}`}),typeof saveExpenses=="function"&&saveExpenses()),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard();const c=s>0?` \xB7 Gasto de $${s.toFixed(2)} en Balance`:"";manekiToastExport(`\u2705 Compra registrada: +${n} unidades de ${o.name}${c}`,"ok")}window.registrarCompraRecibida=registrarCompraRecibida;function abrirRegistrarCompra(t){_inyectarRegistrarCompraModal(),_compraProdId=t||null;const e=t?(window.products||[]).find(r=>String(r.id)===String(t)):null,i=document.getElementById("compraProductoNombre");i&&e&&(i.value=e.name||"");const o=document.getElementById("compraCantidad");o&&(o.value="");const n=document.getElementById("compraCosto");n&&e&&(n.value=String(parseFloat(e.costo||e.cost||0)||"")),openModal("registrarCompraModal")}window.abrirRegistrarCompra=abrirRegistrarCompra;function _confirmarCompra(){if(!_compraProdId)return;const t=document.getElementById("compraCantidad"),e=document.getElementById("compraCosto"),i=parseFloat(t?.value||"0"),o=parseFloat(e?.value||"0");if(!i||i<=0){manekiToastExport("Ingresa una cantidad v\xE1lida","warn");return}closeModal("registrarCompraModal"),registrarCompraRecibida(_compraProdId,i,o)}window._confirmarCompra=_confirmarCompra;let _qrStream=null,_qrDetectorInst=null,_qrScanInterval=null;window._abrirQRScanner=async function(){typeof window.openModal=="function"&&window.openModal("qrScannerModal");const t=document.getElementById("qrVideo"),e=document.getElementById("qrStatus"),i=document.getElementById("qrManualWrap");if(t&&(t.style.display=""),!(typeof window.BarcodeDetector<"u")){t&&(t.style.display="none"),e&&(e.textContent="Esc\xE1ner no disponible en este navegador."),i&&(i.style.display="");return}try{if(_qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}),!t)return;t.srcObject=_qrStream,await t.play(),_qrDetectorInst=new window.BarcodeDetector({formats:["qr_code","ean_13","ean_8","upc_a","upc_e","code_128","code_39","data_matrix"]}),e&&(e.textContent="Buscando c\xF3digo..."),_qrScanInterval=setInterval(async()=>{if(t.videoWidth)try{const n=await _qrDetectorInst.detect(t);if(n&&n.length>0){const r=String(n[0].rawValue||"").trim();if(!r)return;window._cerrarQRScanner();const a=document.getElementById("inventorySearch");a&&(a.value=r,a.dispatchEvent(new Event("input"))),typeof window.manekiToastExport=="function"&&window.manekiToastExport(`\u{1F4F7} C\xF3digo: ${r}`,"ok")}}catch{}},350)}catch{e&&(e.textContent="No se pudo acceder a la c\xE1mara."),i&&(i.style.display="")}},window._cerrarQRScanner=function(){typeof window.closeModal=="function"&&window.closeModal("qrScannerModal"),_qrScanInterval&&(clearInterval(_qrScanInterval),_qrScanInterval=null),_qrStream&&(_qrStream.getTracks().forEach(e=>e.stop()),_qrStream=null);const t=document.getElementById("qrVideo");t&&(t.srcObject=null)},window._qrManualBuscar=function(){const t=document.getElementById("qrManualInput");if(!t||!t.value.trim())return;const e=t.value.trim();window._cerrarQRScanner();const i=document.getElementById("inventorySearch");i&&(i.value=e,i.dispatchEvent(new Event("input")))},window._ptMpComponentes=window._ptMpComponentes??[],window._ptVariants=window._ptVariants??[],window._ptTagsActuales=window._ptTagsActuales??[];const TAGS_PT=["Oferta","Nuevo","Destacado","Favorito","Agotado"];
//# sourceMappingURL=inventory-1.js.map

;
"use strict";function injectPtModal(){const e=document.getElementById("ptModal");e&&e.remove();const t=document.createElement("div");t.id="ptModal",t.className="modal",t.innerHTML=`
    <div style="background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(21,4,50,0.2);max-width:680px;width:100%;margin:auto;max-height:94vh;overflow-y:auto;padding:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 style="font-size:1.4rem;font-weight:800;color:#1a0533;">\u{1F4E6} Nuevo Producto Terminado</h3>
            <button onclick="closePtModal()" style="font-size:1.6rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>

        <form id="ptForm" class="space-y-5" onsubmit="return false;">

            <!-- IMAGEN -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4F7} Imagen del Producto</label>
                <input type="file" id="ptProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;">
                <div id="ptImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="ptPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- GALER\xCDA DE FOTOS -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F5BC}\uFE0F Galer\xEDa de fotos <span style="font-weight:400;color:#9ca3af;">(hasta 20)</span></label>
                    <label style="padding:6px 14px;background:#C5A572;color:#fff;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar fotos
                        <input type="file" id="ptGaleriaInput" accept="image/*" multiple style="display:none;" onchange="ptAgregarFotosGaleria(this.files)">
                    </label>
                </div>
                <div id="ptGaleriaPreview" style="display:flex;flex-wrap:wrap;gap:8px;min-height:48px;">
                    <p id="ptGaleriaVacia" style="font-size:.8rem;color:#9ca3af;width:100%;text-align:center;padding:8px 0;">Sin fotos en galer\xEDa</p>
                </div>
            </div>

            <!-- NOMBRE -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Nombre del Producto *</label>
                <input type="text" id="ptNombre" required placeholder="Ej: Playera Personalizada"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- MATERIAS PRIMAS Y SERVICIOS QUE LO CONFORMAN -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F3ED} Materias Primas y Servicios</label>
                    <button type="button" onclick="abrirSelectorMpPt()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar componente
                    </button>
                </div>
                <div id="ptMpList" style="display:flex;flex-direction:column;gap:8px;">
                    <p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin componentes agregados</p>
                </div>
                <!-- Selector inline de MP y Servicios -->
                <div id="ptMpSelector" style="display:none;margin-top:12px;border-top:1.5px solid #e5e7eb;padding-top:12px;">
                    <input type="text" id="ptMpSearch" placeholder="Buscar materia prima o servicio..."
                        oninput="filtrarMpSelector()"
                        style="width:100%;padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;margin-bottom:10px;box-sizing:border-box;">
                    <div id="ptMpResults" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
                <!-- Disponibilidad estimada -->
                <div id="ptDisponibilidadBox" style="display:none;margin-top:12px;background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:10px;padding:10px 14px;">
                    <div style="font-size:.78rem;font-weight:700;color:#065f46;">\u{1F4CA} Piezas que puedes fabricar ahora:</div>
                    <div id="ptDisponibilidadNum" style="font-size:1.6rem;font-weight:800;color:#059669;line-height:1.2;">0</div>
                    <div id="ptDisponibilidadDetalle" style="font-size:.72rem;color:#6b7280;margin-top:4px;"></div>
                </div>
            </div>

            <!-- SKU -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">C\xF3digo SKU</label>
                <input type="text" id="ptSku" placeholder="Se generar\xE1 autom\xE1ticamente si est\xE1 vac\xEDo"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- CATEGOR\xCDA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categor\xEDa</label>
                <select id="ptCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                </select>
            </div>

            <!-- VARIANTES -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:12px;">\u{1F3A8} Variantes (Opcional)</label>
                <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;">
                    <input type="text" id="ptVarTipo" placeholder="Tipo: Talla, Color..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                    <input type="text" id="ptVarValor" placeholder="Valor: M, Rojo..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVariantePt();}">
                    <button type="button" onclick="agregarVariantePt()"
                        style="padding:10px 14px;background:#C5A572;color:#fff;border:none;border-radius:10px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
                </div>
                <div id="ptVariantsList" style="display:flex;flex-direction:column;gap:6px;">
                    <p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>
                </div>
            </div>

            <!-- TAGS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Tags / Etiquetas</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="ptTagsGrid"></div>
            </div>

            <!-- COSTO y MARGEN -->
            <div style="background:linear-gradient(135deg,#fffbeb,#fef9f0);border:1.5px solid #fde68a;border-radius:14px;padding:16px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4B0} Costo total</label>
                        <div style="position:relative;">
                            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                            <input type="number" id="ptCosto" step="0.01" min="0" value="0"
                                oninput="ptActualizarPrecioSugerido()"
                                style="width:100%;padding:10px 14px 10px 28px;border:1.5px solid #fde68a;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;font-weight:700;">
                        </div>
                        <p id="ptCostoDesglose" style="font-size:.72rem;color:#92400e;margin-top:4px;line-height:1.4;"></p>
                    </div>
                    <div>
                        <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4A1} Margen sugerido</label>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                            ${[30,50,100,150].map(o=>`<button type="button" onclick="ptAplicarMargen(${o})"
                                style="padding:5px 10px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;border:1.5px solid #fde68a;background:#fff;color:#92400e;transition:all .15s;"
                                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fff'">${o}%</button>`).join("")}
                        </div>
                        <div style="display:flex;gap:6px;">
                            <input type="number" id="ptMargenCustom" placeholder="%" min="0" max="999"
                                style="width:70px;padding:6px 10px;border:1.5px solid #fde68a;border-radius:8px;font-size:.85rem;outline:none;">
                            <button type="button" onclick="ptAplicarMargenCustom()"
                                style="padding:6px 12px;background:#C5A572;color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;">Aplicar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PRECIO DE VENTA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Precio de Venta *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                    <input type="number" id="ptPrecio" required step="0.01" min="0"
                        style="width:100%;padding:12px 16px 12px 28px;border:2px solid #C5A572;border-radius:12px;font-size:1.1rem;font-weight:700;outline:none;box-sizing:border-box;color:#1a0533;"
                        onfocus="this.style.borderColor='#E8B84B'" onblur="this.style.borderColor='#C5A572'">
                </div>
                <div id="ptMargenInfo" style="font-size:.78rem;color:#6b7280;margin-top:6px;"></div>
            </div>

            <!-- RENDIMIENTO POR HOJA (stickers, etc.) -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3AF} Piezas por hoja / unidad de MP <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <input type="number" id="ptRendimientoPorHoja" min="1" placeholder="Ej: 12 (stickers que caben en 1 hoja)"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                <p style="font-size:.72rem;color:#9ca3af;margin-top:5px;">Si vendes por cantidad (ej. 100 stickers), el sistema divide entre este n\xFAmero para calcular cu\xE1ntas hojas descontar del inventario y calcular el costo.</p>
            </div>

            <!-- STOCK M\xCDNIMO -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F514} Stock m\xEDnimo de alerta</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="number" id="ptStockMin" min="0" step="1" value="5"
                        style="width:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                    <span style="font-size:.8rem;color:#6b7280;">Se te notificar\xE1 cuando el stock baje de este n\xFAmero</span>
                </div>
            </div>

            <!-- PUBLICAR EN TIENDA -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1.5px solid #6ee7b7;border-radius:14px;">
                <div>
                    <div style="font-size:.9rem;font-weight:700;color:#065f46;">\u{1F310} Publicar en tienda online</div>
                    <div style="font-size:.75rem;color:#6b7280;margin-top:2px;">Visible en manekistore.com.mx</div>
                </div>
                <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer;">
                    <input type="checkbox" id="ptPublicarTienda" style="opacity:0;width:0;height:0;">
                    <span style="position:absolute;inset:0;background:#d1d5db;border-radius:99px;transition:background .2s;"
                        id="ptToggleTrack"></span>
                    <span style="position:absolute;top:3px;left:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);"
                        id="ptToggleThumb"></span>
                </label>
            </div>

            <button type="button" id="ptSubmitBtn" onclick="guardarProductoTerminado()"
                style="width:100%;padding:16px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:8px;letter-spacing:.02em;">
                \u2705 Agregar Producto
            </button>
        </form>
    </div>`,document.body.appendChild(t),setTimeout(()=>{const o=document.getElementById("ptProductImage");o&&!o._mkBound&&(o._mkBound=!0,o.addEventListener("change",function(d){const l=d.target.files[0];if(!l)return;window.currentProductImageFile=l;const c=new FileReader;c.onload=b=>{const v=document.getElementById("ptPreviewImg"),m=document.getElementById("ptImagePreview");v&&(v.src=b.target.result),m&&m.classList.remove("hidden"),window.currentProductImage=b.target.result},c.readAsDataURL(l)}));const i=document.getElementById("ptPublicarTienda"),n=document.getElementById("ptToggleTrack"),r=document.getElementById("ptToggleThumb");if(i&&n&&r){const d=()=>{n.style.background=i.checked?"#10b981":"#d1d5db",r.style.transform=i.checked?"translateX(22px)":"translateX(0)"};i.addEventListener("change",d),d()}poblarCategoriasPt(),renderTagsPt();const s=document.getElementById("ptPrecio");if(s&&s.addEventListener("input",()=>ptMostrarMargenInfo()),!document.getElementById("ptProveedorNombre")){const d=document.getElementById("ptSubmitBtn");d&&d.insertAdjacentHTML("beforebegin",`
                <div id="ptProveedorSection" style="background:#f0fdf4;border:1.5px solid #6ee7b7;border-radius:14px;padding:16px;">
                    <div style="font-size:.85rem;font-weight:700;color:#065f46;margin-bottom:12px;">\u{1F3ED} Informaci\xF3n del Proveedor <span style="font-weight:400;color:#9ca3af;">(opcional)</span></div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <input type="text" id="ptProveedorNombre" placeholder="Nombre del proveedor"
                            style="width:100%;padding:10px 14px;border:1.5px solid #6ee7b7;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;background:#fff;"
                            onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#6ee7b7'">
                        <textarea id="ptProveedorNotas" rows="2" placeholder="Notas del proveedor (precio referencia, condiciones, etc.)"
                            style="width:100%;padding:10px 14px;border:1.5px solid #6ee7b7;border-radius:10px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;background:#fff;"
                            onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#6ee7b7'"></textarea>
                    </div>
                </div>`)}},80)}window.injectPtModal=injectPtModal;function poblarCategoriasPt(){const e=document.getElementById("ptCategory");if(!e)return;const t=window.categories||[];e.innerHTML=t.map(o=>`<option value="${_esc(o.id)}">${o.emoji||""} ${_esc(o.name)}</option>`).join("")}window.poblarCategoriasPt=poblarCategoriasPt;function renderTagsPt(){const e=document.getElementById("ptTagsGrid");e&&(e.innerHTML=TAGS_PT.map(t=>{const o=(window._ptTagsActuales||[]).includes(t);return`<button type="button" onclick="toggleTagPt('${t}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${o?"#C5A572":"#e5e7eb"};background:${o?"#FFF9F0":"#fff"};color:${o?"#92400e":"#6b7280"};">
            ${t}</button>`}).join(""))}window.renderTagsPt=renderTagsPt;function toggleTagPt(e){window._ptTagsActuales=window._ptTagsActuales||[];const t=window._ptTagsActuales.indexOf(e);t>-1?window._ptTagsActuales.splice(t,1):window._ptTagsActuales.push(e),renderTagsPt()}window.toggleTagPt=toggleTagPt;function poblarCategoriasPv(){const e=document.getElementById("pvCategory");if(!e)return;const o=(window.categories||[]).map(i=>`<option value="${_esc(i.id)}">${i.emoji||""} ${_esc(i.name)}</option>`).join("");e.innerHTML='<option value="">Sin categor\xEDa</option>'+o}window.poblarCategoriasPv=poblarCategoriasPv;function renderTagsPv(){const e=document.getElementById("pvTagsGrid");e&&(e.innerHTML=TAGS_PT.map(t=>{const o=(window._pvTagsActuales||[]).includes(t);return`<button type="button" onclick="toggleTagPv('${t}')"
            style="padding:5px 14px;border-radius:99px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;
            border:1.5px solid ${o?"#7c3aed":"#e5e7eb"};background:${o?"#f5f3ff":"#fff"};color:${o?"#7c3aed":"#6b7280"};">
            ${t}</button>`}).join(""))}window.renderTagsPv=renderTagsPv;function toggleTagPv(e){window._pvTagsActuales=window._pvTagsActuales||[];const t=window._pvTagsActuales.indexOf(e);t>-1?window._pvTagsActuales.splice(t,1):window._pvTagsActuales.push(e),renderTagsPv()}window.toggleTagPv=toggleTagPv;function agregarVariantePt(){const e=(document.getElementById("ptVarTipo")?.value||"").trim(),t=(document.getElementById("ptVarValor")?.value||"").trim();if(!e||!t){manekiToastExport("\u26A0\uFE0F Ingresa tipo y valor de la variante","warn");return}if(window._ptVariants=window._ptVariants||[],window._ptVariants.some(i=>i.type===e&&i.value===t)){manekiToastExport(`\u26A0\uFE0F La variante ${e}: ${t} ya existe`,"warn");return}window._ptVariants.push({type:e,value:t,qty:0}),document.getElementById("ptVarTipo")&&(document.getElementById("ptVarTipo").value=""),document.getElementById("ptVarValor")&&(document.getElementById("ptVarValor").value=""),renderVariantsListPt(),document.getElementById("ptVarTipo")?.focus()}window.agregarVariantePt=agregarVariantePt;function eliminarVariantePt(e){(window._ptVariants||[]).splice(e,1),renderVariantsListPt()}window.eliminarVariantePt=eliminarVariantePt;function updateVariantQtyPt(e,t){window._ptVariants&&window._ptVariants[e]&&(window._ptVariants[e].qty=Math.max(0,parseInt(t)||0))}window.updateVariantQtyPt=updateVariantQtyPt;function renderVariantsListPt(){window.currentVariants=window._ptVariants||[];const e=document.getElementById("ptVariantsList");if(e){if(!window._ptVariants||!window._ptVariants.length){e.innerHTML='<p style="font-size:.8rem;color:#9ca3af;">Sin variantes agregadas</p>';return}e.innerHTML=window._ptVariants.map((t,o)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;">
            <span style="flex:1;font-size:.85rem;color:#374151;">${_esc(t.type)}: ${_mkColorDot(t.type,_esc(t.value))}</span>
            <div style="display:flex;align-items:center;gap:4px;">
                <button type="button" onclick="updateVariantQtyPt(${o},${(t.qty||0)-1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${t.qty||0}" min="0" onchange="updateVariantQtyPt(${o},this.value)"
                    style="width:46px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVariantQtyPt(${o},${(t.qty||0)+1});renderVariantsListPt();"
                    style="width:22px;height:22px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="eliminarVariantePt(${o})"
                style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\u2715</button>
        </div>`).join("")}}window.renderVariantsListPt=renderVariantsListPt;function abrirSelectorMpPt(){const e=document.getElementById("ptMpSelector");e&&(e.style.display=e.style.display==="none"?"block":"none",e.style.display==="block"&&(filtrarMpSelector(),document.getElementById("ptMpSearch")?.focus()))}window.abrirSelectorMpPt=abrirSelectorMpPt;function filtrarMpSelector(){const e=(document.getElementById("ptMpSearch")?.value||"").toLowerCase(),t=(window.products||[]).filter(n=>n.tipo==="materia_prima"||n.tipo==="servicio"),o=document.getElementById("ptMpResults");if(!o)return;const i=e?t.filter(n=>(n.name||"").toLowerCase().includes(e)):t;if(!i.length){o.innerHTML='<p style="font-size:.8rem;color:#9ca3af;padding:8px;">No hay materias primas ni servicios registrados</p>';return}o.innerHTML=i.map(n=>{const r=(window._ptMpComponentes||[]).some(c=>String(c.id)===String(n.id)),s=n.tipo==="servicio",d=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.4rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${n.image||(s?"\u2699\uFE0F":"\u{1F3ED}")}</span>`,l=s?`<div style="font-size:.72rem;color:#6d28d9;font-weight:600;">\u2699\uFE0F Servicio \xB7 $${Number(n.cost||0).toFixed(2)}/uso</div>`:`<div style="font-size:.72rem;color:#6b7280;">Stock: ${n.stock||0} \xB7 Costo: $${Number(n.cost||0).toFixed(2)}</div>`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${r?"#f0fdf4":"#fff"};border:1.5px solid ${r?"#6ee7b7":"#e5e7eb"};cursor:pointer;transition:all .1s;"
            onclick="seleccionarMpPt('${String(n.id).replace(/'/g,"\\'")}')">
            ${d}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(n.name)}</div>
                ${l}
            </div>
            <span style="font-size:.78rem;font-weight:700;color:${r?"#059669":"#7c3aed"};">${r?"\u2713 Agregado":"+ Agregar"}</span>
        </div>`}).join("")}window.filtrarMpSelector=filtrarMpSelector;function seleccionarMpPt(e){const t=(window.products||[]).find(i=>String(i.id)===String(e)&&(i.tipo==="materia_prima"||i.tipo==="servicio"));if(!t)return;if(window._ptMpComponentes=window._ptMpComponentes||[],window._ptMpComponentes.find(i=>String(i.id)===String(e))){manekiToastExport(`"${t.name}" ya fue agregado`,"warn");return}if(window._ptMpComponentes.push({id:t.id,nombre:t.name,imageUrl:t.imageUrl||null,imagen:t.image||"\u{1F3ED}",qty:1,costUnit:Number(t.cost||0)}),Array.isArray(t.variants)&&t.variants.length>0){window._ptVariants=window._ptVariants||[];let i=0;t.variants.forEach(n=>{const r=n.type||n.tipo||"",s=n.value||n.valor||"";if(!r||!s)return;window._ptVariants.some(l=>(l.type||l.tipo)===r&&(l.value||l.valor)===s)||(window._ptVariants.push({type:r,value:s,qty:n.qty||0}),i++)}),i>0&&(renderVariantsListPt(),manekiToastExport(`\u2705 Se importaron ${i} variante(s) de "${t.name}"`,"ok"))}renderPtMpList(),recalcularCostoPt(),filtrarMpSelector()}window.seleccionarMpPt=seleccionarMpPt;function quitarMpPt(e){(window._ptMpComponentes||[]).splice(e,1),renderPtMpList(),recalcularCostoPt()}window.quitarMpPt=quitarMpPt;function updateMpQtyPt(e,t){window._ptMpComponentes&&window._ptMpComponentes[e]&&(window._ptMpComponentes[e].qty=Math.max(.01,parseFloat(t)||1),recalcularCostoPt())}window.updateMpQtyPt=updateMpQtyPt;function renderPtMpList(){const e=document.getElementById("ptMpList");if(!e)return;const t=window._ptMpComponentes||[];if(!t.length){e.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas agregadas</p>',document.getElementById("ptDisponibilidadBox")&&(document.getElementById("ptDisponibilidadBox").style.display="none");return}e.innerHTML=t.map((o,i)=>{const n=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.nombre||o.name||"")}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;flex-shrink:0;">`:`<span style="font-size:1.4rem;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${o.imagen||"\u{1F3ED}"}</span>`,r=(o.qty*o.costUnit).toFixed(2);return`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;">
            ${n}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(o.nombre)}</div>
                <div style="font-size:.72rem;color:#6b7280;">$${o.costUnit.toFixed(2)}/ud \xB7 Subtotal: <b style="color:#92400e;">$${r}</b></div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                <button type="button" onclick="updateMpQtyPt(${i},${(o.qty||1)-1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${o.qty}" min="0.01" step="0.01" onchange="updateMpQtyPt(${i},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #e5e7eb;border-radius:8px;padding:3px 4px;font-size:.85rem;font-weight:700;">
                <button type="button" onclick="updateMpQtyPt(${i},${(o.qty||1)+1});renderPtMpList();"
                    style="width:24px;height:24px;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <button type="button" onclick="quitarMpPt(${i})"
                style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.06);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">\u2715</button>
        </div>`}).join(""),calcularDisponibilidadPt()}window.renderPtMpList=renderPtMpList;function recalcularCostoPt(){const e=window._ptMpComponentes||[],t=e.reduce((n,r)=>n+r.qty*r.costUnit,0),o=document.getElementById("ptCosto");o&&(o.value=t.toFixed(2));const i=document.getElementById("ptCostoDesglose");i&&e.length?i.textContent=e.map(n=>`${n.nombre} \xD7${n.qty} = $${(n.qty*n.costUnit).toFixed(2)}`).join(" \xB7 "):i&&(i.textContent=""),ptMostrarMargenInfo(),calcularDisponibilidadPt()}window.recalcularCostoPt=recalcularCostoPt;function calcularDisponibilidadPt(){const e=window._ptMpComponentes||[],t=document.getElementById("ptDisponibilidadBox"),o=document.getElementById("ptDisponibilidadNum"),i=document.getElementById("ptDisponibilidadDetalle");if(!t||!e.length){t&&(t.style.display="none");return}t.style.display="block";let n=1/0;const r=e.map(s=>{const d=(window.products||[]).find(b=>String(b.id)===String(s.id));if(d&&d.tipo==="servicio")return`${s.nombre}: \u2699\uFE0F servicio (sin l\xEDmite de stock)`;const l=d&&d.stock||0,c=s.qty>0?Math.floor(l/s.qty):0;return c<n&&(n=c),`${s.nombre}: ${l} uds \xF7 ${s.qty} = ${c} piezas`});isFinite(n)||(n=0),o&&(o.textContent=n,o.style.color=n>0?"#059669":"#ef4444"),i&&(i.innerHTML=r.join("<br>"))}window.calcularDisponibilidadPt=calcularDisponibilidadPt;function ptAplicarMargen(e){const t=parseFloat(document.getElementById("ptCosto")?.value||0)||0;if(!t){manekiToastExport("\u26A0\uFE0F Define el costo primero","warn");return}const o=t*(1+e/100),i=document.getElementById("ptPrecio");i&&(i.value=o.toFixed(2),ptMostrarMargenInfo())}window.ptAplicarMargen=ptAplicarMargen;function ptAplicarMargenCustom(){const e=parseFloat(document.getElementById("ptMargenCustom")?.value||0);!e||e<=0||ptAplicarMargen(e)}window.ptAplicarMargenCustom=ptAplicarMargenCustom;function ptActualizarPrecioSugerido(){ptMostrarMargenInfo()}window.ptActualizarPrecioSugerido=ptActualizarPrecioSugerido;function ptMostrarMargenInfo(){const e=parseFloat(document.getElementById("ptCosto")?.value||0)||0,t=parseFloat(document.getElementById("ptPrecio")?.value||0)||0,o=document.getElementById("ptMargenInfo");if(!o)return;if(!e||!t){o.textContent="";return}const i=((t-e)/t*100).toFixed(1),n=(t-e).toFixed(2),r=parseFloat(i)>=40?"#059669":parseFloat(i)>=20?"#d97706":"#ef4444";o.innerHTML=`<span style="color:${r};font-weight:700;">${i}% de margen</span> \xB7 Ganancia por pieza: <b style="color:${r};">$${n}</b>`}window.ptMostrarMargenInfo=ptMostrarMargenInfo;async function guardarProductoTerminado(){const e=p=>{const g=document.getElementById(p);return g?g.value:""},t=e("ptNombre").trim(),o=e("ptSku").trim(),i=e("ptCategory"),n=parseFloat(e("ptCosto"))||0,r=parseFloat(e("ptPrecio"))||0,s=parseInt(e("ptStockMin"))||5,d=parseFloat(e("ptRendimientoPorHoja"))||0,l=e("ptProveedorNombre").trim(),c=e("ptProveedorNotas").trim();if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("ptNombre")?.focus();return}if(!r||r<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("ptPrecio")?.focus();return}if(r<n){manekiToastExport("\u26A0\uFE0F El precio no puede ser menor al costo","warn"),document.getElementById("ptPrecio")?.focus();return}const b=window.modoEdicion?window.edicionProductoId:null,v=(window.products||[]).find(p=>(p.name||"").trim().toLowerCase()===t.toLowerCase()&&String(p.id)!==String(b));if(v){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${v.name}". Usa un nombre diferente o edita el existente.`,"warn"),document.getElementById("ptNombre")?.focus();return}if(o&&!skuEsUnico(o,b)){manekiToastExport(`\u26A0\uFE0F El SKU "${o}" ya est\xE1 en uso`,"warn");return}let m=n;const E=window._ptMpComponentes||[];if(m===0)if(E.length>0){const p=E.reduce((g,u)=>{const f=(window.products||[]).find(P=>String(P.id)===String(u.id));return g+(u.qty||0)*(f&&f.cost?f.cost:u.costUnit||0)},0);if(p>0&&await showConfirm(`El costo calculado basado en materias primas es $${p.toFixed(2)}. \xBFDeseas usarlo como costo del producto?`)){m=p;const u=document.getElementById("ptCosto");u&&(u.value=m.toFixed(2))}}else manekiToastExport("\u26A0\uFE0F El costo del producto est\xE1 en $0. Considera agregar un costo.","warn");const h=document.getElementById("ptSubmitBtn"),I=typeof btnLoading=="function"?btnLoading(h):()=>{};h&&(h.disabled=!0);try{if(window.currentProductImageFile){manekiToastExport("\u23F3 Subiendo imagen principal...","ok");const a=await subirImagenStorage(window.currentProductImageFile).catch(()=>null);a?window.currentProductImage=a:manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen principal. Intenta de nuevo.","warn"),window.currentProductImageFile=null}const p=window._ptGaleriaFiles||[];if(p.length>0){manekiToastExport(`\u23F3 Subiendo ${p.length} foto(s) de galer\xEDa...`,"ok");const a=await Promise.all(p.map(w=>subirImagenStorage(w).catch(()=>null))),x=a.filter(Boolean),y=a.filter(w=>w===null).length;y>0&&manekiToastExport(`\u26A0\uFE0F ${y} foto(s) de galer\xEDa no se pudieron subir.`,"warn"),window._ptGaleriaUrls=[...window._ptGaleriaUrls||[],...x],window._ptGaleriaFiles=[]}const g=[...window._ptGaleriaUrls||[]],u=document.getElementById("ptPublicarTienda")?.checked??!1,f=(window.categories||[]).find(a=>a.id===i),P=o||generateSKU(i),M=[...window._ptTagsActuales||[]],T=[...window._ptMpComponentes||[]];if(window.currentVariants=[...window._ptVariants||[]],window.modoEdicion&&window.edicionProductoId!==null){const a=(window.products||[]).findIndex(S=>String(S.id)===String(window.edicionProductoId));if(a===-1){manekiToastExport("Error: producto no encontrado","err");return}const x=window.products[a].stock,y=window.products[a],w=y.price,C=y.cost,z=y.historialPrecios||[];(w!==r||C!==m)&&z.push({fecha:new Date().toISOString(),precioAntes:w,costoAntes:C,precioNuevo:r,costoNuevo:m}),window.products[a]=Object.assign({},window.products[a],{name:t,category:i,tipo:u?"producto":"producto_interno",cost:m,price:r,stockMin:s,tags:M,sku:P,mpComponentes:T,publicarTienda:u,image:f?f.emoji:window.products[a].image,imageUrl:window.currentProductImage||window.products[a].imageUrl,imageUrls:g.length>0?g:window.products[a].imageUrls||[],variants:[...window.currentVariants],historialPrecios:z,rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:c,movimientos:window.products[a].movimientos||[]}),syncStockFromVariants(window.products[a]);const k=getStockEfectivo(window.products[a]);k!==x&&registrarMovimiento({productoId:window.edicionProductoId,productoNombre:t,tipo:"ajuste",cantidad:k-x,motivo:"Edici\xF3n",stockAntes:x,stockDespues:k});const $=k-x;$!==0&&(window.products[a].movimientos=window.products[a].movimientos||[],window.products[a].movimientos.unshift({id:Date.now(),fecha:_fechaHoy(),delta:$,stockResultante:k,motivo:"Edici\xF3n manual",usuario:"local"}),window.products[a].movimientos.length>30&&(window.products[a].movimientos=window.products[a].movimientos.slice(0,30))),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),I(!0),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto actualizado","ok")}else{const a={id:_genId(),name:t,category:i,tipo:u?"producto":"producto_interno",cost:m,price:r,stock:0,stockMin:s,tags:M,sku:P,mpComponentes:T,publicarTienda:u,image:f?f.emoji:"\u{1F4E6}",imageUrl:window.currentProductImage||null,imageUrls:g,variants:[...window.currentVariants],rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:c,movimientos:[]};syncStockFromVariants(a),window.products.push(a),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),I(!0),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto agregado exitosamente","ok")}}finally{h&&(h.disabled=!1)}}window.guardarProductoTerminado=guardarProductoTerminado;
//# sourceMappingURL=inventory-2-pt.js.map

;
"use strict";const TAGS_MATERIA_PRIMA=["Acr\xEDlico","Filamento","Tintas","Cuadro","Metales","Empaques","Vasos","Textil","Peluches","Otros"];window._mpTagsActuales=window._mpTagsActuales??[];function openAddMateriaPrimaModal(){window.modoEdicion=!1,window.edicionProductoId=null,window.currentProductImage=null,window.currentProductImageFile=null,window._mpTagsActuales=[];const i=document.getElementById("mpForm");i&&i.reset();const o=document.getElementById("mpImagePreview");o&&o.classList.add("hidden"),renderMpTags();const e=document.querySelector("#mpModal h3");e&&(e.textContent="\u{1F3ED} Nueva Materia Prima");const t=document.getElementById("mpSubmitBtn");t&&(t.textContent="\u2705 Guardar Materia Prima"),typeof openModal=="function"&&openModal("mpModal")}window.openAddMateriaPrimaModal=openAddMateriaPrimaModal,window._packComponentes=window._packComponentes??[];function injectPackModal(){const i=document.getElementById("packModal");i&&i.remove();const o=document.createElement("div");o.id="packModal",o.className="modal",o.innerHTML=`
    <div style="background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(21,4,50,0.2);max-width:640px;width:100%;margin:auto;max-height:94vh;overflow-y:auto;padding:32px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 id="packModalTitle" style="font-size:1.4rem;font-weight:800;color:#1a0533;">\u{1F381} Nuevo Pack</h3>
            <button onclick="closePackModal()" style="font-size:1.6rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>

        <form id="packForm" novalidate style="display:flex;flex-direction:column;gap:18px;">

            <!-- NOMBRE -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Nombre del Pack *</label>
                <input type="text" id="packNombre" placeholder="Ej: Pack Boxer + Calcetas"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- PRODUCTOS DEL PACK -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F4E6} Productos en el Pack</label>
                    <button type="button" onclick="packAbrirSelectorPT()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar producto
                    </button>
                </div>
                <!-- Lista de componentes seleccionados -->
                <div id="packComponentesList" style="display:flex;flex-direction:column;gap:8px;">
                    <p id="packSinComponentes" style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin productos agregados</p>
                </div>
                <!-- Buscador inline de PTs -->
                <div id="packPtSelector" style="display:none;margin-top:12px;border-top:1.5px solid #e5e7eb;padding-top:12px;">
                    <input type="text" id="packPtSearch" placeholder="Buscar producto terminado..."
                        oninput="packFiltrarPT()"
                        style="width:100%;padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;margin-bottom:10px;box-sizing:border-box;">
                    <div id="packPtResults" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
            </div>

            <!-- MATERIAS PRIMAS ADICIONALES -->
            <div style="background:#fafafa;border:1.5px solid #e9d5ff;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F3ED} Materias Primas Adicionales</label>
                    <button type="button" onclick="packAbrirSelectorMP()"
                        style="padding:6px 14px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        + Agregar MP
                    </button>
                </div>
                <div id="packMpDirectosList" style="display:flex;flex-direction:column;gap:8px;">
                    <p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas adicionales</p>
                </div>
                <div id="packMpSelector" style="display:none;margin-top:12px;border-top:1.5px solid #e5e7eb;padding-top:12px;">
                    <input type="text" id="packMpSearch" placeholder="Buscar materia prima o servicio..."
                        oninput="packFiltrarMP()"
                        style="width:100%;padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;margin-bottom:10px;box-sizing:border-box;">
                    <div id="packMpResults" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
            </div>

            <!-- COSTO TOTAL CALCULADO -->
            <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <div style="font-size:.75rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.04em;">Costo Total del Pack</div>
                    <div style="font-size:1.5rem;font-weight:800;color:#b45309;" id="packCostoDisplay">$0.00</div>
                </div>
                <input type="number" id="packCosto" style="display:none;" step="0.01" min="0" value="0">
            </div>

            <!-- PRECIO DE VENTA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Precio de Venta *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:700;">$</span>
                    <input type="number" id="packPrecio" step="0.01" min="0" placeholder="0.00"
                        oninput="packMostrarMargen()"
                        style="width:100%;padding:12px 16px 12px 28px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div id="packMargenInfo" style="font-size:.8rem;margin-top:6px;min-height:18px;"></div>
                <!-- Sugerir por margen -->
                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                    ${[30,40,50,60].map(e=>`<button type="button" onclick="packAplicarMargen(${e})"
                        style="padding:4px 12px;border:1.5px solid #fde68a;border-radius:8px;background:#fffbeb;color:#92400e;font-size:.78rem;font-weight:700;cursor:pointer;">+${e}%</button>`).join("")}
                </div>
            </div>

            <!-- SKU y CATEGOR\xCDA opcionales -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">SKU (opcional)</label>
                    <input type="text" id="packSku" placeholder="Auto-generado"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div>
                    <label style="display:block;font-size:.78rem;font-weight:700;color:#374151;margin-bottom:6px;">Categor\xEDa (opcional)</label>
                    <select id="packCategory"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;background:#fff;">
                        <option value="">Sin categor\xEDa</option>
                    </select>
                </div>
            </div>

            <!-- FOTO DEL PACK -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4F7} Foto del Pack (opcional)</label>
                <input type="file" id="packImageInput" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;box-sizing:border-box;cursor:pointer;"
                    onchange="packHandlePhoto(this)">
                <div id="packImagePreview" style="display:none;margin-top:10px;text-align:center;">
                    <img id="packImagePreviewImg" src="" style="max-width:160px;max-height:160px;border-radius:12px;object-fit:cover;border:1.5px solid #e5e7eb;">
                    <button type="button" onclick="packQuitarFoto()" style="display:block;margin:6px auto 0;font-size:.75rem;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:700;">\u2715 Quitar foto</button>
                </div>
            </div>

            <button type="button" id="packSubmitBtn" onclick="guardarPack()"
                style="width:100%;padding:14px;background:linear-gradient(135deg,#C5A572,#E8B84B);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:.02em;">
                \u2705 Guardar Pack
            </button>
        </form>
    </div>`,document.body.appendChild(o)}window.injectPackModal=injectPackModal;function openPackModal(i){injectPackModal(),window._packModoEdicion=!1,window._packEdicionId=null,window._packComponentes=[],window._packMpDirectos=[],window._packImageFile=null,window._packImageUrl=null;const o=document.getElementById("packCategory");if(o&&(window.categories||[]).forEach(e=>{const t=document.createElement("option");t.value=e.id,t.textContent=`${e.emoji||""} ${e.name}`,o.appendChild(t)}),i){const e=(window.products||[]).find(t=>String(t.id)===String(i)&&t.tipo==="pack");if(e){window._packModoEdicion=!0,window._packEdicionId=i,window._packComponentes=JSON.parse(JSON.stringify(e.packComponentes||[])),window._packMpDirectos=JSON.parse(JSON.stringify(e.packMpDirectos||[])),document.getElementById("packNombre").value=e.name||"",document.getElementById("packPrecio").value=e.price||"",document.getElementById("packSku").value=e.sku||"",o&&(o.value=e.category||"");const t=document.getElementById("packModalTitle");t&&(t.textContent="\u270F\uFE0F Editar Pack");const n=document.getElementById("packSubmitBtn");if(n&&(n.textContent="\u2705 Actualizar Pack"),e.imageUrl){window._packImageUrl=e.imageUrl;const a=document.getElementById("packImagePreview"),r=document.getElementById("packImagePreviewImg");a&&(a.style.display="block"),r&&(r.src=e.imageUrl)}}}packRenderComponentes(),packRenderMpDirectos(),packMostrarMargen(),typeof openModal=="function"&&openModal("packModal")}window.openPackModal=openPackModal;function closePackModal(){typeof closeModal=="function"&&closeModal("packModal")}window.closePackModal=closePackModal;function packHandlePhoto(i){const o=i.files[0];if(!o)return;window._packImageFile=o;const e=new FileReader;e.onload=t=>{const n=document.getElementById("packImagePreviewImg"),a=document.getElementById("packImagePreview");n&&(n.src=t.target.result),a&&(a.style.display="block")},e.readAsDataURL(o)}window.packHandlePhoto=packHandlePhoto;function packQuitarFoto(){window._packImageFile=null,window._packImageUrl=null;const i=document.getElementById("packImagePreview"),o=document.getElementById("packImageInput");i&&(i.style.display="none"),o&&(o.value="")}window.packQuitarFoto=packQuitarFoto;function packAbrirSelectorPT(){const i=document.getElementById("packPtSelector");if(!i)return;const o=i.style.display!=="none";if(i.style.display=o?"none":"block",!o){const e=document.getElementById("packPtSearch");e&&(e.value="",e.focus()),packFiltrarPT()}}window.packAbrirSelectorPT=packAbrirSelectorPT;function packFiltrarPT(){const i=(document.getElementById("packPtSearch")?.value||"").toLowerCase(),o=(window._packComponentes||[]).map(n=>String(n.productoId)),e=(window.products||[]).filter(n=>(n.tipo==="producto"||n.tipo==="producto_interno")&&!o.includes(String(n.id))&&(!i||(n.name||"").toLowerCase().includes(i))),t=document.getElementById("packPtResults");if(t){if(!e.length){t.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>';return}t.innerHTML=e.map(n=>{const a=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.2rem;">${n.image||"\u{1F4E6}"}</span>`;return`<div onclick="packSeleccionarPT('${String(n.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='#fff'">
            ${a}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(n.name)}</div>
                <div style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(n.cost||0).toFixed(2)}</div>
            </div>
            <span style="font-size:11px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`}).join("")}}window.packFiltrarPT=packFiltrarPT;function packSeleccionarPT(i){const o=(window.products||[]).find(t=>String(t.id)===String(i));if(!o||(window._packComponentes=window._packComponentes||[],window._packComponentes.find(t=>String(t.productoId)===String(i))))return;window._packComponentes.push({productoId:String(i),nombre:o.name,costoOriginal:Number(o.cost)||0,costoCustom:Number(o.cost)||0,qty:1});const e=document.getElementById("packPtSelector");e&&(e.style.display="none"),packRenderComponentes()}window.packSeleccionarPT=packSeleccionarPT;function packQuitarComponente(i){window._packComponentes=(window._packComponentes||[]).filter(o=>String(o.productoId)!==String(i)),packRenderComponentes()}window.packQuitarComponente=packQuitarComponente;function packActualizarCosto(i,o){const e=(window._packComponentes||[]).find(t=>String(t.productoId)===String(i));e&&(e.costoCustom=parseFloat(o)||0),packRecalcularCosto(),packMostrarMargen()}window.packActualizarCosto=packActualizarCosto;function packActualizarQty(i,o){const e=(window._packComponentes||[]).find(t=>String(t.productoId)===String(i));e&&(e.qty=Math.max(1,parseInt(o)||1)),packRenderComponentes()}window.packActualizarQty=packActualizarQty;function packRenderComponentes(){const i=document.getElementById("packComponentesList"),o=document.getElementById("packSinComponentes");if(!i)return;const e=window._packComponentes||[];if(!e.length){i.innerHTML='<p id="packSinComponentes" style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin productos agregados</p>',packRecalcularCosto();return}i.innerHTML=e.map(t=>{const n=(window.products||[]).find(r=>String(r.id)===String(t.productoId));return`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:12px;background:#fff;">
            ${n?.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n?.name||"")}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`:`<span style="font-size:1.3rem;">${n?.image||"\u{1F4E6}"}</span>`}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(t.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(t.costoOriginal).toFixed(2)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="1" value="${t.qty}"
                        onchange="packActualizarQty('${t.productoId}', this.value)"
                        style="width:46px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(t.costoCustom).toFixed(2)}"
                            onchange="packActualizarCosto('${t.productoId}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #fde68a;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#C5A572'" onblur="this.style.borderColor='#fde68a'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarComponente('${t.productoId}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\xD7</button>
            </div>
        </div>`}).join(""),packRecalcularCosto()}window.packRenderComponentes=packRenderComponentes;function packAbrirSelectorMP(){const i=document.getElementById("packMpSelector");if(!i)return;const o=i.style.display!=="none";if(i.style.display=o?"none":"block",!o){const e=document.getElementById("packMpSearch");e&&(e.value="",e.focus()),packFiltrarMP()}}window.packAbrirSelectorMP=packAbrirSelectorMP;function packFiltrarMP(){const i=(document.getElementById("packMpSearch")?.value||"").toLowerCase(),o=(window._packMpDirectos||[]).map(n=>String(n.id)),e=(window.products||[]).filter(n=>(n.tipo==="materia_prima"||n.tipo==="servicio")&&!o.includes(String(n.id))&&(!i||(n.name||"").toLowerCase().includes(i))),t=document.getElementById("packMpResults");if(t){if(!e.length){t.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px;">Sin resultados</p>';return}t.innerHTML=e.map(n=>{const a=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.2rem;">${n.image||"\u{1F3ED}"}</span>`,r=n.tipo==="servicio"?'<span style="font-size:10px;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:99px;">Servicio</span>':'<span style="font-size:10px;background:#f0fdf4;color:#15803d;padding:1px 6px;border-radius:99px;">MP</span>';return`<div onclick="packSeleccionarMP('${String(n.id)}')"
            style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #e5e7eb;background:#fff;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='#fff'">
            ${a}
            <div style="flex:1;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;">${_esc(n.name)}</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">${r}<span style="font-size:.75rem;color:#9ca3af;">Costo: $${Number(n.cost||0).toFixed(2)} / ${_esc(n.unidad||"pza")}</span></div>
            </div>
            <span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:99px;">+ Agregar</span>
        </div>`}).join("")}}window.packFiltrarMP=packFiltrarMP;function packSeleccionarMP(i){const o=(window.products||[]).find(t=>String(t.id)===String(i));if(!o||(window._packMpDirectos=window._packMpDirectos||[],window._packMpDirectos.find(t=>String(t.id)===String(i))))return;window._packMpDirectos.push({id:String(i),nombre:o.name,imagen:o.image||"\u{1F3ED}",imageUrl:o.imageUrl||null,unidad:o.unidad||"pza",costoOriginal:Number(o.cost)||0,costoCustom:Number(o.cost)||0,qty:1});const e=document.getElementById("packMpSelector");e&&(e.style.display="none"),packRenderMpDirectos()}window.packSeleccionarMP=packSeleccionarMP;function packQuitarMP(i){window._packMpDirectos=(window._packMpDirectos||[]).filter(o=>String(o.id)!==String(i)),packRenderMpDirectos()}window.packQuitarMP=packQuitarMP;function packActualizarCostoMP(i,o){const e=(window._packMpDirectos||[]).find(t=>String(t.id)===String(i));e&&(e.costoCustom=parseFloat(o)||0),packRecalcularCosto(),packMostrarMargen()}window.packActualizarCostoMP=packActualizarCostoMP;function packActualizarQtyMP(i,o){const e=(window._packMpDirectos||[]).find(t=>String(t.id)===String(i));e&&(e.qty=Math.max(.001,parseFloat(o)||1)),packRenderMpDirectos()}window.packActualizarQtyMP=packActualizarQtyMP;function packRenderMpDirectos(){const i=document.getElementById("packMpDirectosList");if(!i)return;const o=window._packMpDirectos||[];if(!o.length){i.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas adicionales</p>',packRecalcularCosto();return}i.innerHTML=o.map(e=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e9d5ff;border-radius:12px;background:#faf5ff;">
            ${e.imageUrl?`<img src="${e.imageUrl}" alt="${_esc(e.name||e.nombre||"")}" style="width:34px;height:34px;object-fit:cover;border-radius:8px;">`:`<span style="font-size:1.3rem;">${e.imagen||"\u{1F3ED}"}</span>`}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(e.nombre)}</div>
                <div style="font-size:.72rem;color:#9ca3af;">Costo original: $${Number(e.costoOriginal).toFixed(2)} / ${_esc(e.unidad||"pza")}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Cant.</div>
                    <input type="number" min="0.001" step="0.001" value="${e.qty}"
                        onchange="packActualizarQtyMP('${e.id}', this.value)"
                        style="width:54px;padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.82rem;text-align:center;outline:none;"
                        onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(e.costoCustom).toFixed(2)}"
                            onchange="packActualizarCostoMP('${e.id}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#ddd6fe'">
                    </div>
                </div>
                <button type="button" onclick="packQuitarMP('${e.id}')"
                    style="width:26px;height:26px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">\xD7</button>
            </div>
        </div>`).join(""),packRecalcularCosto()}window.packRenderMpDirectos=packRenderMpDirectos;function packRecalcularCosto(){const i=window._packComponentes||[],o=window._packMpDirectos||[],e=i.reduce((s,c)=>s+(Number(c.costoCustom)||0)*(Number(c.qty)||1),0),t=o.reduce((s,c)=>s+(Number(c.costoCustom)||0)*(Number(c.qty)||1),0),n=e+t,a=document.getElementById("packCostoDisplay"),r=document.getElementById("packCosto");a&&(a.textContent=`$${n.toFixed(2)}`),r&&(r.value=n.toFixed(2)),packMostrarMargen()}window.packRecalcularCosto=packRecalcularCosto;function packMostrarMargen(){const i=parseFloat(document.getElementById("packCosto")?.value||0)||0,o=parseFloat(document.getElementById("packPrecio")?.value||0)||0,e=document.getElementById("packMargenInfo");if(!e)return;if(!i||!o){e.textContent="";return}const t=((o-i)/o*100).toFixed(1),n=(o-i).toFixed(2),a=parseFloat(t)>=40?"#059669":parseFloat(t)>=20?"#d97706":"#ef4444";e.innerHTML=`<span style="color:${a};font-weight:700;">${t}% de margen</span> \xB7 Ganancia: <b style="color:${a};">$${n}</b>`}window.packMostrarMargen=packMostrarMargen;function packAplicarMargen(i){const o=parseFloat(document.getElementById("packCosto")?.value||0)||0;if(!o){manekiToastExport("\u26A0\uFE0F Define los componentes primero","warn");return}const e=o*(1+i/100),t=document.getElementById("packPrecio");t&&(t.value=e.toFixed(2),packMostrarMargen())}window.packAplicarMargen=packAplicarMargen;function flattenPackMpComponentes(i,o){const e={};return(i||[]).forEach(t=>{const n=(window.products||[]).find(a=>String(a.id)===String(t.productoId));!n||!n.mpComponentes||!n.mpComponentes.length||n.mpComponentes.forEach(a=>{const r=String(a.id),s=(a.qty||0)*(t.qty||1);e[r]?e[r]={...e[r],qty:e[r].qty+s}:e[r]={...a,qty:s}})}),(o||[]).forEach(t=>{const n=String(t.id),a=t.qty||1;e[n]?e[n]={...e[n],qty:e[n].qty+a}:e[n]={id:t.id,nombre:t.nombre,imagen:t.imagen,imageUrl:t.imageUrl||null,qty:a,costUnit:t.costoCustom||t.costoOriginal||0}}),Object.values(e)}window.flattenPackMpComponentes=flattenPackMpComponentes;async function guardarPack(){const i=(document.getElementById("packNombre")?.value||"").trim(),o=parseFloat(document.getElementById("packPrecio")?.value||0)||0,e=parseFloat(document.getElementById("packCosto")?.value||0)||0,t=(document.getElementById("packSku")?.value||"").trim(),n=document.getElementById("packCategory")?.value||"",a=window._packComponentes||[],r=window._packMpDirectos||[];if(!i){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("packNombre")?.focus();return}if(a.length+r.length<2){manekiToastExport("\u26A0\uFE0F Un pack necesita al menos 2 componentes en total","warn");return}if(!o||o<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("packPrecio")?.focus();return}if(o<=e){manekiToastExport("\u26A0\uFE0F El precio debe ser mayor al costo","warn"),document.getElementById("packPrecio")?.focus();return}const s=window._packModoEdicion?window._packEdicionId:null,c=(window.products||[]).find(p=>(p.name||"").trim().toLowerCase()===i.toLowerCase()&&String(p.id)!==String(s));if(c){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${c.name}"`,"warn");return}if(t&&!skuEsUnico(t,s)){manekiToastExport(`\u26A0\uFE0F El SKU "${t}" ya est\xE1 en uso`,"warn");return}const u=document.getElementById("packSubmitBtn");u&&(u.disabled=!0);try{let p=window._packImageUrl||null;if(window._packImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const d=await subirImagenStorage(window._packImageFile).catch(()=>null);d&&(p=d),window._packImageFile=null}const g=t||generateSKU(n),m=(window.categories||[]).find(d=>d.id===n),f=flattenPackMpComponentes(a,r);if(window._packModoEdicion&&window._packEdicionId){const d=(window.products||[]).findIndex(y=>String(y.id)===String(window._packEdicionId));if(d===-1){manekiToastExport("Error: pack no encontrado","err");return}const l=window.products[d],b=l.historialPrecios||[];(l.price!==o||l.cost!==e)&&b.push({fecha:new Date().toISOString(),precioAntes:l.price,costoAntes:l.cost,precioNuevo:o,costoNuevo:e}),window.products[d]=Object.assign({},l,{name:i,price:o,cost:e,sku:g,category:n,image:m?m.emoji:"\u{1F381}",imageUrl:p,tipo:"pack",packComponentes:JSON.parse(JSON.stringify(a)),packMpDirectos:JSON.parse(JSON.stringify(r)),mpComponentes:f,historialPrecios:b}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closePackModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Pack actualizado","ok")}else{const d={id:_genId(),name:i,tipo:"pack",price:o,cost:e,stock:0,stockMin:2,sku:g,category:n,image:m?m.emoji:"\u{1F381}",imageUrl:p,imageUrls:[],tags:[],variants:[],publicarTienda:!1,packComponentes:JSON.parse(JSON.stringify(a)),packMpDirectos:JSON.parse(JSON.stringify(r)),mpComponentes:f,historialPrecios:[]};window.products.push(d),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closePackModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Pack creado exitosamente","ok")}}finally{u&&(u.disabled=!1)}}window.guardarPack=guardarPack;
//# sourceMappingURL=inventory-2-pack.js.map

;
"use strict";window._pvMpComponentes=[],window._pvTablaPreciosVariable=[];function injectVariableProductModal(){const o=document.getElementById("pvModal");o&&o.remove();const e=document.createElement("div");e.id="pvModal",e.className="modal",e.innerHTML=`
    <div class="modal-content" style="max-width:580px;max-height:90vh;overflow-y:auto;border-radius:20px;padding:28px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:1.3rem;font-weight:800;color:#1a0533;">\u{1F3A8} Producto Variable</h3>
            <button onclick="closeModal('pvModal')" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>
        <form id="pvForm" onsubmit="guardarProductoVariable(event)" style="display:flex;flex-direction:column;gap:16px;">
            <input type="hidden" id="pvEditId" value="">

            <!-- IMAGEN -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4F7} Imagen del Producto</label>
                <input type="file" id="pvProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;box-sizing:border-box;">
                <div id="pvImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="pvPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- Nombre -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4DD} Nombre del producto *</label>
                <input type="text" id="pvNombre" required placeholder="Ej: Stickers 5x5 cm, Tarjetas de presentaci\xF3n"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
            </div>

            <!-- Rendimiento por hoja -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F3AF} Piezas por hoja / unidad de MP</label>
                <input type="number" id="pvRendimiento" min="1" placeholder="Ej: 12 (cu\xE1ntas piezas caben en 1 hoja)"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
                <p class="text-xs text-gray-400 mt-1">El sistema dividir\xE1 la cantidad del pedido entre este n\xFAmero para calcular hojas a descontar.</p>
            </div>

            <!-- Materias primas -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <label class="text-sm font-semibold text-gray-700">\u{1F3ED} Materias Primas y Servicios</label>
                    <button type="button" onclick="pvAgregarComponente()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:linear-gradient(135deg,#7c3aed,#a855f7);">+ Agregar componente</button>
                </div>
                <div style="margin-bottom:8px;">
                    <input type="text" id="pvBuscarMP" placeholder="Buscar materia prima..."
                        oninput="pvFiltrarMP(this.value)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <div id="pvMpSuggestions" style="display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;margin-top:4px;max-height:150px;overflow-y:auto;z-index:10;position:relative;"></div>
                </div>
                <div id="pvMpList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>

            <!-- Tabla de precios -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <label class="text-sm font-semibold text-gray-700">\u{1F4B0} Tabla de precios por cantidad</label>
                    <button type="button" onclick="pvAgregarRangoPrecio()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:#059669;">+ Agregar rango</button>
                </div>
                <p class="text-xs text-gray-400 mb-2">Si el cliente pide una cantidad que no est\xE1 exacta, se usa el precio del rango inferior m\xE1s cercano.</p>
                <div id="pvTablaPreciosList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>

            <!-- SKU -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">C\xF3digo SKU <span class="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" id="pvSku" placeholder="Se genera autom\xE1ticamente si lo dejas vac\xEDo"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm">
            </div>

            <!-- CATEGOR\xCDA -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categor\xEDa</label>
                <select id="pvCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                    <option value="">Sin categor\xEDa</option>
                </select>
            </div>

            <!-- TAGS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3F7}\uFE0F Tags / Etiquetas</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="pvTagsGrid"></div>
            </div>

            <!-- NOTAS -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F4CB} Notas internas <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <textarea id="pvNotas" rows="2" placeholder="Especificaciones, materiales, observaciones..."
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
            </div>

            <button type="submit" id="pvSubmitBtn"
                class="w-full py-3 rounded-xl text-white font-bold text-base mt-2"
                style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                \u2705 Guardar Producto Variable
            </button>
        </form>
    </div>`,document.body.appendChild(e)}window.injectVariableProductModal=injectVariableProductModal;function pvFiltrarMP(o){const e=document.getElementById("pvMpSuggestions");if(!e)return;const t=(window.products||[]).filter(n=>n.tipo==="materia_prima"||n.tipo==="servicio").filter(n=>!o||(n.name||"").toLowerCase().includes(o.toLowerCase()));if(!t.length){e.style.display="none";return}e.style.display="block",e.innerHTML=t.slice(0,8).map(n=>`<div onclick="pvSeleccionarMP('${n.id}')"
            style="padding:8px 12px;cursor:pointer;font-size:.85rem;border-bottom:1px solid #f3f4f6;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background=''">
            ${_esc(n.name||"")} <span style="color:#9ca3af;font-size:.75rem;">$${Number(n.cost||0).toFixed(2)}/ud</span>
        </div>`).join("")}window.pvFiltrarMP=pvFiltrarMP;function pvSeleccionarMP(o){const e=(window.products||[]).find(t=>String(t.id)===String(o));if(e){if((window._pvMpComponentes||[]).find(t=>String(t.id)===String(o))){manekiToastExport("Ya est\xE1 agregado","warn");return}window._pvMpComponentes.push({id:e.id,name:e.name,qty:1,costUnit:e.cost||0}),document.getElementById("pvBuscarMP").value="",document.getElementById("pvMpSuggestions").style.display="none",pvRenderMpList()}}window.pvSeleccionarMP=pvSeleccionarMP;function pvAgregarComponente(){const o=document.getElementById("pvBuscarMP");o&&(o.focus(),pvFiltrarMP(o.value||""))}window.pvAgregarComponente=pvAgregarComponente;function pvRenderMpList(){const o=document.getElementById("pvMpList");if(!o)return;const e=window._pvMpComponentes||[];if(!e.length){o.innerHTML='<p class="text-xs text-gray-400">Sin componentes a\xFAn.</p>';return}const t=e.reduce((n,r)=>n+(parseFloat(r.costUnit)||0)*(parseFloat(r.qty)||1),0);o.innerHTML=e.map((n,r)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f5f3ff;border-radius:10px;font-size:.82rem;">
            <span style="flex:1;font-weight:600;color:#4c1d95;">${_esc(n.name||"")}</span>
            <span style="color:#9ca3af;">qty:</span>
            <input type="number" min="0.01" step="0.01" value="${n.qty}"
                onchange="pvEditarQtyComp(${r}, this.value)"
                style="width:50px;padding:3px 6px;border:1px solid #ddd6fe;border-radius:6px;text-align:center;font-size:.8rem;">
            <span style="color:#7c3aed;font-weight:600;min-width:55px;text-align:right;">$${((parseFloat(n.costUnit)||0)*(parseFloat(n.qty)||1)).toFixed(2)}</span>
            <button onclick="pvQuitarComp(${r})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">\u2715</button>
        </div>`).join("")+`<div style="text-align:right;font-size:.78rem;color:#7c3aed;font-weight:700;padding:4px 10px 0;">Costo por hoja: $${t.toFixed(2)}</div>`}window.pvRenderMpList=pvRenderMpList;function pvEditarQtyComp(o,e){window._pvMpComponentes[o]&&(window._pvMpComponentes[o].qty=parseFloat(e)||1),pvRenderMpList()}window.pvEditarQtyComp=pvEditarQtyComp;function pvQuitarComp(o){window._pvMpComponentes.splice(o,1),pvRenderMpList()}window.pvQuitarComp=pvQuitarComp;function pvAgregarRangoPrecio(){window._pvTablaPreciosVariable||(window._pvTablaPreciosVariable=[]),window._pvTablaPreciosVariable.push({cantidadMin:"",precio:""}),pvRenderTablaPreciosList()}window.pvAgregarRangoPrecio=pvAgregarRangoPrecio;function pvRenderTablaPreciosList(){const o=document.getElementById("pvTablaPreciosList");if(!o)return;const e=window._pvTablaPreciosVariable||[];if(!e.length){o.innerHTML='<p class="text-xs text-gray-400">Sin rangos. Agrega al menos uno.</p>';return}o.innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;margin-bottom:4px;padding:0 4px;">
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Cantidad m\xEDnima</span>
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Precio total ($)</span>
            <span style="font-size:.72rem;font-weight:700;color:#0369a1;">$/pieza</span>
            <span></span>
        </div>`+e.map((t,n)=>{const r=t.cantidadMin>0&&t.precio>0?(t.precio/t.cantidadMin).toFixed(2):"\u2014";return`
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
            <input type="number" min="1" placeholder="Ej: 10" value="${t.cantidadMin}"
                onchange="pvEditarRango(${n},'cantidadMin',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-center">
            <input type="number" min="0" step="0.01" placeholder="Ej: 50.00" value="${t.precio}"
                onchange="pvEditarRango(${n},'precio',this.value);pvRenderTablaPreciosList()"
                class="px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none text-center"
                style="color:#059669;font-weight:600;">
            <span style="font-size:.85rem;font-weight:700;color:#0369a1;text-align:center;padding:8px 4px;background:#e0f2fe;border-radius:8px;">$${r}</span>
            <button onclick="pvQuitarRango(${n})"
                style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;padding:0 4px;">\u2715</button>
        </div>`}).join("")}window.pvRenderTablaPreciosList=pvRenderTablaPreciosList;function pvEditarRango(o,e,t){window._pvTablaPreciosVariable[o]&&(window._pvTablaPreciosVariable[o][e]=e==="cantidadMin"?parseInt(t)||0:parseFloat(t)||0)}window.pvEditarRango=pvEditarRango;function pvQuitarRango(o){window._pvTablaPreciosVariable.splice(o,1),pvRenderTablaPreciosList()}window.pvQuitarRango=pvQuitarRango;function openVariableProductModal(o){if(injectVariableProductModal(),window._pvMpComponentes=[],window._pvTablaPreciosVariable=[],window._pvTagsActuales=[],window._pvProductImage=null,window._pvProductImageFile=null,setTimeout(()=>{const e=document.getElementById("pvProductImage");e&&!e._mkBound&&(e._mkBound=!0,e.addEventListener("change",function(t){const n=t.target.files[0];if(!n)return;window._pvProductImageFile=n;const r=new FileReader;r.onload=a=>{const i=document.getElementById("pvPreviewImg"),s=document.getElementById("pvImagePreview");i&&(i.src=a.target.result),s&&s.classList.remove("hidden"),window._pvProductImage=a.target.result},r.readAsDataURL(n)})),poblarCategoriasPv(),renderTagsPv()},80),o){const e=(window.products||[]).find(t=>String(t.id)===String(o));e&&(window._pvMpComponentes=(e.mpComponentes||[]).map(t=>({...t})),window._pvTablaPreciosVariable=(e.tablaPreciosVariable||[]).map(t=>({...t})),window._pvTagsActuales=[...e.tags||[]],window._pvProductImage=e.imageUrl||null,setTimeout(()=>{const t=(i,s)=>{const c=document.getElementById(i);c&&(c.value=s??"")};t("pvNombre",e.name),t("pvSku",e.sku||""),t("pvRendimiento",e.rendimientoPorHoja||""),t("pvEditId",o),t("pvNotas",e.notas||"");const n=document.getElementById("pvCategory");if(n&&e.category&&(n.value=e.category),e.imageUrl){const i=document.getElementById("pvPreviewImg"),s=document.getElementById("pvImagePreview");i&&(i.src=e.imageUrl),s&&s.classList.remove("hidden")}pvRenderMpList(),pvRenderTablaPreciosList(),renderTagsPv();const r=document.querySelector("#pvModal h3");r&&(r.textContent="\u{1F3A8} Editar Producto Variable");const a=document.getElementById("pvSubmitBtn");a&&(a.textContent="\u{1F4BE} Guardar Cambios")},80))}else setTimeout(()=>{pvRenderMpList(),pvRenderTablaPreciosList()},80);openModal("pvModal")}window.openVariableProductModal=openVariableProductModal;async function guardarProductoVariable(o){o&&o.preventDefault();const e=d=>{const p=document.getElementById(d);return p?p.value:""},t=e("pvNombre").trim(),n=e("pvSku").trim(),r=parseFloat(e("pvRendimiento"))||0,a=e("pvEditId"),i=e("pvCategory")||"",s=e("pvNotas").trim(),c=[...window._pvTagsActuales||[]];if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn");return}const l=(window._pvTablaPreciosVariable||[]).filter(d=>d.cantidadMin>0&&d.precio>0);if(!l.length){manekiToastExport("\u26A0\uFE0F Agrega al menos un rango de precio","warn");return}const m=document.getElementById("pvSubmitBtn");m&&(m.disabled=!0,m.textContent="\u23F3 Guardando...");const b=()=>{m&&(m.disabled=!1,m.textContent=a?"\u{1F4BE} Guardar Cambios":"\u2705 Guardar Producto Variable")};let u=window._pvProductImage||"";if(window._pvProductImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const d=await subirImagenStorage(window._pvProductImageFile).catch(()=>null);d&&(u=d),window._pvProductImageFile=null}l.sort((d,p)=>d.cantidadMin-p.cantidadMin);const g=(window._pvMpComponentes||[]).map(d=>({...d})),v=g.reduce((d,p)=>d+(parseFloat(p.costUnit)||0)*(parseFloat(p.qty)||1),0),f=n||"PV-"+mkId().split("-")[0].toUpperCase();if(a){const d=(window.products||[]).findIndex(p=>String(p.id)===String(a));if(d===-1){manekiToastExport("Producto no encontrado","err"),b();return}window.products[d]=Object.assign({},window.products[d],{name:t,tipo:"producto_variable",sku:f,rendimientoPorHoja:r,mpComponentes:g,tablaPreciosVariable:l,cost:v,price:l[l.length-1].precio,category:i,tags:c,notas:s,imageUrl:u||window.products[d].imageUrl||""}),manekiToastExport("\u2705 Producto variable actualizado","ok")}else{const d={id:_genId(),name:t,tipo:"producto_variable",sku:f,rendimientoPorHoja:r,mpComponentes:g,tablaPreciosVariable:l,cost:v,price:l[l.length-1].precio,stock:0,image:"\u{1F3A8}",category:i,tags:c,notas:s,imageUrl:u};window.products.unshift(d),manekiToastExport("\u2705 Producto variable creado","ok")}b(),saveProducts(),renderInventoryTable(),closeModal("pvModal")}window.guardarProductoVariable=guardarProductoVariable;function pvGetPrecio(o,e){const t=(o.tablaPreciosVariable||[]).slice().sort((a,i)=>a.cantidadMin-i.cantidadMin);if(!t.length)return 0;let n=t[0];for(const a of t)if(e>=a.cantidadMin)n=a;else break;const r=n.cantidadMin||1;return n.precio/r}window.pvGetPrecio=pvGetPrecio;function verMovimientosProducto(o){const e=(window.products||[]).find(i=>String(i.id)===String(o));if(!e)return;e.movimientos||(e.movimientos=[]);const t=(e.movimientos||[]).slice(0,5),n=document.getElementById("_mkMovimientosModal");n&&n.remove();const r=t.length?t.map(i=>{const s=i.delta>0?"#059669":"#dc2626",c=i.delta>0?"#d1fae5":"#fee2e2",l=i.delta>0?"+":"";return`<tr>
            <td style="padding:6px 10px;font-size:.8rem;color:#6b7280;">${_esc(i.fecha||"\u2014")}</td>
            <td style="padding:6px 10px;text-align:center;">
                <span style="background:${c};color:${s};font-weight:700;padding:2px 10px;border-radius:8px;font-size:.8rem;">${l}${i.delta}</span>
            </td>
            <td style="padding:6px 10px;text-align:center;font-size:.8rem;font-weight:600;color:#374151;">${i.stockResultante}</td>
            <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${_esc(i.motivo||"\u2014")}</td>
        </tr>`}).join(""):'<tr><td colspan="4" style="padding:14px;text-align:center;font-size:.8rem;color:#9ca3af;">Sin movimientos registrados</td></tr>',a=document.createElement("div");a.id="_mkMovimientosModal",a.style.cssText="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);",a.innerHTML=`
    <div style="background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,0.2);max-width:560px;width:95%;padding:24px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <div style="font-size:1.05rem;font-weight:800;color:#1a0533;">\u{1F4CB} \xDAltimos movimientos de stock</div>
                <div style="font-size:.78rem;color:#9ca3af;margin-top:2px;">${_esc(e.name)}</div>
            </div>
            <button onclick="document.getElementById('_mkMovimientosModal').remove()"
                style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;line-height:1;">\xD7</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:#f9fafb;">
                    <th style="padding:6px 10px;text-align:left;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Fecha</th>
                    <th style="padding:6px 10px;text-align:center;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Cambio</th>
                    <th style="padding:6px 10px;text-align:center;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Stock final</th>
                    <th style="padding:6px 10px;text-align:left;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Motivo</th>
                </tr>
            </thead>
            <tbody>${r}</tbody>
        </table>
        ${t.length===0||(e.movimientos||[]).length<=5?"":`<p style="font-size:.72rem;color:#9ca3af;text-align:center;margin-top:10px;">Mostrando los \xFAltimos 5 de ${(e.movimientos||[]).length} movimientos</p>`}
    </div>`,document.body.appendChild(a),a.addEventListener("click",function(i){i.target===a&&a.remove()})}window.verMovimientosProducto=verMovimientosProducto;
//# sourceMappingURL=inventory-2-pv.js.map

;
"use strict";function _resetMpVariantesUI(){window._mpVariantes=[];const t=document.getElementById("mpUsaVariantes");t&&(t.checked=!1);const e=document.getElementById("mpVariantesPanel");e&&(e.style.display="none");const o=document.getElementById("mpVariantesSlider");o&&(o.style.background="#d1d5db");const n=document.getElementById("mpVariantesThumb");n&&(n.style.left="3px");const a=document.getElementById("mpStockRow");a&&(a.style.opacity="1");const i=document.getElementById("mpStock");i&&(i.readOnly=!1,i.value=0);const r=document.getElementById("mpVariantesList");r&&(r.innerHTML='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>');const d=document.getElementById("mpVariantesStockTotal");d&&(d.style.display="none")}function closeMateriaPrimaModal(){typeof closeModal=="function"&&closeModal("mpModal");const t=document.getElementById("mpForm");t&&t.reset(),window.modoEdicion=!1,window.edicionProductoId=null,window.currentProductImage=null,window.currentProductImageFile=null,window._mpTagsActuales=[],_resetMpVariantesUI(),renderMpTags()}window.closeMateriaPrimaModal=closeMateriaPrimaModal;function renderMpTags(){const t=document.getElementById("mpTagsGrid");if(!t)return;t.innerHTML=TAGS_MATERIA_PRIMA.map(o=>{const n=(window._mpTagsActuales||[]).includes(o);return`<button type="button" onclick="toggleMpTag('${o}')"
            id="mptag-${o.replace(/[^a-zA-Z0-9]/g,"")}"
            style="padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;
                border:1.5px solid ${n?"#C5A572":"#e5e7eb"};
                background:${n?"#FFF9F0":"#fff"};
                color:${n?"#92400e":"#6b7280"};">
            ${o}
        </button>`}).join("");const e=document.getElementById("mpTagsCustomSelected");if(e){const o=(window._mpTagsActuales||[]).filter(n=>!TAGS_MATERIA_PRIMA.includes(n));e.innerHTML=o.map(n=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#fef3c7;border:1px solid #fde68a;border-radius:99px;font-size:12px;font-weight:600;color:#92400e;">
                ${_esc(n)}
                <button type="button" onclick="removeMpTag('${_esc(n)}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:0 1px;line-height:1;">\u2715</button>
            </span>`).join("")}}window.renderMpTags=renderMpTags;function toggleMpTag(t){window._mpTagsActuales=window._mpTagsActuales||[];const e=window._mpTagsActuales.indexOf(t);e>-1?window._mpTagsActuales.splice(e,1):window._mpTagsActuales.push(t),renderMpTags()}window.toggleMpTag=toggleMpTag;function removeMpTag(t){window._mpTagsActuales=(window._mpTagsActuales||[]).filter(e=>e!==t),renderMpTags()}window.removeMpTag=removeMpTag;function agregarMpTagCustom(){const t=document.getElementById("mpTagCustomInput");if(!t)return;const e=t.value.trim();e&&(window._mpTagsActuales=window._mpTagsActuales||[],window._mpTagsActuales.includes(e)||(window._mpTagsActuales.push(e),renderMpTags()),t.value="",t.focus())}window.agregarMpTagCustom=agregarMpTagCustom;function injectMpModal(){if(document.getElementById("mpModal"))return;const t=document.createElement("div");t.id="mpModal",t.className="modal",t.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-fade-in" style="margin-left:auto;margin-right:auto;max-height:92vh;overflow-y:auto;">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800">\u{1F3ED} Nueva Materia Prima</h3>
            <button onclick="closeMateriaPrimaModal()" class="text-gray-400 hover:text-gray-600" style="font-size:1.4rem;line-height:1;background:none;border:none;cursor:pointer;">
                \xD7
            </button>
        </div>

        <form id="mpForm" class="space-y-5" novalidate>

            <!-- Imagen -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4F7} Imagen (opcional)</label>
                <input type="file" id="mpProductImage" accept="image/*"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 outline-none">
                <div id="mpImagePreview" class="mt-3 hidden">
                    <img id="mpPreviewImg" class="w-24 h-24 object-cover rounded-xl border border-gray-200 mx-auto" src="" alt="Preview">
                </div>
            </div>

            <!-- Nombre -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input type="text" id="mpNombre" required
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                       placeholder="Ej: Filamento PLA Blanco 1kg">
            </div>

            <!-- SKU -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">C\xF3digo SKU</label>
                <input type="text" id="mpSku"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                       placeholder="Se generar\xE1 autom\xE1ticamente si est\xE1 vac\xEDo">
            </div>

            <!-- Tags de material -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">\u{1F3F7}\uFE0F Tipo de Material</label>
                <div id="mpTagsGrid" class="flex flex-wrap gap-2 mb-3"></div>
                <div class="flex gap-2 mt-2">
                    <input type="text" id="mpTagCustomInput"
                        placeholder="Agregar tipo personalizado..."
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarMpTagCustom();}"
                        class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2">
                    <button type="button" onclick="agregarMpTagCustom()"
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:#C5A572">+ Agregar</button>
                </div>
                <div id="mpTagsCustomSelected" class="flex flex-wrap gap-2 mt-2"></div>
            </div>

            <!-- Compra por paquete o unidad -->
            <div style="background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1.5px solid #e9d5ff;border-radius:14px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <label class="block text-sm font-semibold" style="color:#7c3aed;">\u{1F4B0} Costo</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:.78rem;color:#9ca3af;">\xBFCompras por paquete?</span>
                        <label style="position:relative;display:inline-block;width:38px;height:21px;cursor:pointer;">
                            <input type="checkbox" id="mpUsaPaquete" onchange="mpTogglePaquete()"
                                style="opacity:0;width:0;height:0;position:absolute;">
                            <span id="mpPaqueteSlider"
                                style="position:absolute;inset:0;background:#d1d5db;border-radius:99px;transition:.2s;">
                                <span style="position:absolute;left:3px;top:3px;width:15px;height:15px;background:#fff;border-radius:50%;transition:.2s;display:block;" id="mpPaqueteThumb"></span>
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Modo unidad simple (default) -->
                <div id="mpCostoSimple">
                    <label style="font-size:.78rem;color:#6b7280;margin-bottom:4px;display:block;">Costo por unidad *</label>
                    <div style="position:relative;">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;">$</span>
                        <input type="number" id="mpCosto" required step="0.01" min="0"
                               style="width:100%;padding:10px 14px 10px 28px;border:1.5px solid #e9d5ff;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;font-weight:600;"
                               placeholder="0.00"
                               onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e9d5ff'">
                    </div>
                </div>

                <!-- Modo paquete (toggle) -->
                <div id="mpCostoPaquete" style="display:none;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                        <div>
                            <label style="font-size:.78rem;color:#6b7280;margin-bottom:4px;display:block;">Unidades por paquete</label>
                            <input type="number" id="mpPaqueteCantidad" step="1" min="1" placeholder="Ej: 100"
                                oninput="mpCalcCostoUnidad()"
                                style="width:100%;padding:10px 12px;border:1.5px solid #e9d5ff;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;"
                                onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e9d5ff'">
                        </div>
                        <div>
                            <label style="font-size:.78rem;color:#6b7280;margin-bottom:4px;display:block;">Precio del paquete</label>
                            <div style="position:relative;">
                                <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-weight:600;font-size:.85rem;">$</span>
                                <input type="number" id="mpPaquetePrecio" step="0.01" min="0" placeholder="0.00"
                                    oninput="mpCalcCostoUnidad()"
                                    style="width:100%;padding:10px 12px 10px 24px;border:1.5px solid #e9d5ff;border-radius:10px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;"
                                    onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e9d5ff'">
                            </div>
                        </div>
                    </div>
                    <!-- Resultado: costo por unidad calculado -->
                    <div id="mpCostoUnidadBox" style="background:#ede9fe;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:.72rem;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Costo por unidad</div>
                            <div style="font-size:1.4rem;font-weight:800;color:#5b21b6;" id="mpCostoUnidadResult">$0.00</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:.72rem;color:#9ca3af;">Este valor se usa para producci\xF3n</div>
                            <input type="number" id="mpCostoCalculado" step="0.001" min="0" style="display:none;">
                        </div>
                    </div>
                    <p style="font-size:.72rem;color:#9ca3af;margin-top:6px;text-align:center;">
                        \u{1F4A1} Cuando agregues stock, ingresa las unidades totales (no paquetes)
                    </p>
                </div>
            </div>

            <!-- VARIANTES de Materia Prima (Talla, Color, etc.) -->
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <label style="font-size:.88rem;font-weight:700;color:#374151;">\u{1F3A8} \xBFTiene variantes? (Talla, Color, etc.)</label>
                    <label style="position:relative;display:inline-block;width:38px;height:21px;cursor:pointer;">
                        <input type="checkbox" id="mpUsaVariantes" onchange="mpToggleVariantes()"
                            style="opacity:0;width:0;height:0;position:absolute;">
                        <span id="mpVariantesSlider"
                            style="position:absolute;inset:0;background:#d1d5db;border-radius:99px;transition:.2s;">
                            <span style="position:absolute;left:3px;top:3px;width:15px;height:15px;background:#fff;border-radius:50%;transition:.2s;display:block;" id="mpVariantesThumb"></span>
                        </span>
                    </label>
                </div>
                <div id="mpVariantesPanel" style="display:none;">
                    <p style="font-size:.75rem;color:#9ca3af;margin-bottom:10px;">Cada variante tiene su propio stock. El stock total se calcular\xE1 sumando todas las variantes.</p>
                    <div style="display:flex;gap:8px;margin-bottom:10px;">
                        <input type="text" id="mpVarTipo" placeholder="Tipo: Talla, Color..."
                            style="flex:1;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.85rem;outline:none;"
                            onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVarianteMp();}">
                        <input type="text" id="mpVarValor" placeholder="Valor: M, Rojo..."
                            style="flex:1;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.85rem;outline:none;"
                            onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVarianteMp();}">
                        <button type="button" onclick="agregarVarianteMp()"
                            style="padding:8px 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:.82rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
                    </div>
                    <!-- Accesos r\xE1pidos de tipos comunes -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                        <span style="font-size:.72rem;color:#9ca3af;align-self:center;">R\xE1pidos:</span>
                        <button type="button" onclick="mpVarTipoRapido('Talla')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Talla</button>
                        <button type="button" onclick="mpVarTipoRapido('Color')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Color</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','S')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">S</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','M')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">M</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','L')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">L</button>
                        <button type="button" onclick="mpVarTipoRapido('Talla','XL')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">XL</button>
                        <button type="button" onclick="mpVarTipoRapido('Color','Negro')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Negro</button>
                        <button type="button" onclick="mpVarTipoRapido('Color','Blanco')" style="padding:3px 10px;border:1px solid #e2e8f0;border-radius:99px;font-size:.75rem;background:#f9fafb;cursor:pointer;">Blanco</button>
                    </div>
                    <div id="mpVariantesList" style="display:flex;flex-direction:column;gap:6px;">
                        <span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>
                    </div>
                    <div id="mpVariantesStockTotal" style="display:none;margin-top:10px;padding:8px 12px;background:#ede9fe;border-radius:10px;font-size:.82rem;font-weight:700;color:#5b21b6;text-align:center;"></div>
                </div>
            </div>

            <!-- Stock y Stock M\xEDnimo -->
            <div class="grid grid-cols-2 gap-4">
                <div id="mpStockRow">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4E6} Stock Inicial</label>
                    <input type="number" id="mpStock" required min="0" value="0"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">\u26A0\uFE0F Stock M\xEDnimo</label>
                    <input type="number" id="mpStockMin" min="0" value="5"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
                    <p class="text-xs text-gray-400 mt-1">Alerta cuando baje de este n\xFAmero</p>
                </div>
            </div>

            <!-- Unidad de medida -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4D0} Unidad de medida</label>
                <select id="mpUnidad" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none" style="background:#fff;">
                    <option value="pza">Pieza (pza)</option>
                    <option value="hoja">Hoja</option>
                    <option value="rollo">Rollo</option>
                    <option value="m">Metro (m)</option>
                    <option value="cm">Cent\xEDmetro (cm)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="par">Par</option>
                    <option value="bolsa">Bolsa</option>
                </select>
            </div>

            <!-- Proveedor -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F3ED} Proveedor</label>
                <input type="text" id="mpProveedor"
                       placeholder="Ej: Mercado Libre, Proveedor ABC"
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
            </div>

            <!-- Link del proveedor -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F517} Link del proveedor (opcional)</label>
                <input type="url" id="mpProveedorUrl"
                       placeholder="https://www.mercadolibre.com.mx/..."
                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none">
            </div>

            <!-- Notas -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\u{1F4DD} Notas internas</label>
                <textarea id="mpNotas" rows="2"
                    placeholder="Ej: usar solo para impresora X, guardar en lugar seco..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm resize-none"></textarea>
            </div>

            <button type="submit" id="mpSubmitBtn"
                    class="btn-primary w-full py-4 rounded-xl text-white font-bold text-lg mt-4"
                    style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                \u2705 Guardar Materia Prima
            </button>
        </form>
    </div>`,document.body.appendChild(t),setTimeout(()=>{const e=document.getElementById("mpProductImage");e&&!e._mkBound&&(e._mkBound=!0,e.addEventListener("change",function(n){const a=n.target.files[0];if(!a)return;window.currentProductImageFile=a;const i=new FileReader;i.onload=r=>{const d=document.getElementById("mpPreviewImg"),l=document.getElementById("mpImagePreview");d&&(d.src=r.target.result),l&&l.classList.remove("hidden")},i.readAsDataURL(a)}));const o=document.getElementById("mpForm");o&&!o._mkSubmitBound&&(o._mkSubmitBound=!0,o.addEventListener("submit",async function(n){n.preventDefault(),await guardarMateriaPrima()}))},100)}window.injectMpModal=injectMpModal;const _SVC_EMOJIS=["\u2699\uFE0F","\u{1F527}","\u{1F4A1}","\u{1F5A8}\uFE0F","\u2702\uFE0F","\u{1F529}","\u{1F4BB}","\u{1F3A8}","\u{1F525}","\u26A1","\u{1F9F2}","\u{1F6E0}\uFE0F"];function injectSvcModal(){if(document.getElementById("svcModal"))return;const t=document.createElement("div");t.id="svcModal",t.className="modal",t.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in" style="margin:auto;max-height:90vh;overflow-y:auto;">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">\u2699\uFE0F <span id="svcModalTitle">Nuevo Servicio</span></h3>
            <button onclick="closeServicioModal()" style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;">\xD7</button>
        </div>
        <form id="svcForm" class="space-y-5" onsubmit="event.preventDefault();guardarServicio();">
            <input type="hidden" id="svcEditId">

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <input type="text" id="svcNombre" required placeholder="Ej: Uso de l\xE1ser, Vinil textil (pieza)..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">\xCDcono</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    ${_SVC_EMOJIS.map(e=>`<button type="button" onclick="document.getElementById('svcEmoji').value='${e}';document.querySelectorAll('.svc-emoji-btn').forEach(b=>b.style.background='#f3f4f6');this.style.background='#ede9fe';" class="svc-emoji-btn" style="width:38px;height:38px;border-radius:10px;border:1px solid #e5e7eb;background:#f3f4f6;font-size:1.3rem;cursor:pointer;">${e}</button>`).join("")}
                </div>
                <input type="hidden" id="svcEmoji" value="\u2699\uFE0F">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Costo por uso *</label>
                <div style="position:relative;">
                    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#6b7280;font-weight:700;">$</span>
                    <input type="number" id="svcCosto" required min="0" step="0.01" placeholder="0.00"
                        class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
                </div>
                <p class="text-xs text-gray-400 mt-1">Cu\xE1nto cuesta cada vez que usas este servicio en un producto</p>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">SKU (opcional)</label>
                <input type="text" id="svcSku" placeholder="Se genera autom\xE1ticamente si est\xE1 vac\xEDo"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-400">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                <textarea id="svcNotas" rows="2" placeholder="Ej: Costo incluye electricidad + depreciaci\xF3n de la m\xE1quina"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none focus:border-indigo-400"></textarea>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl text-white font-bold text-base" style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);">
                \u{1F4BE} Guardar Servicio
            </button>
        </form>
    </div>`,document.body.appendChild(t),t.addEventListener("click",e=>{e.target===t&&closeServicioModal()})}window.injectSvcModal=injectSvcModal;function openServicioModal(t){if(injectSvcModal(),document.getElementById("svcEditId").value=t||"",document.getElementById("svcModalTitle").textContent=t?"Editar Servicio":"Nuevo Servicio",document.getElementById("svcNombre").value="",document.getElementById("svcEmoji").value="\u2699\uFE0F",document.getElementById("svcCosto").value="",document.getElementById("svcSku").value="",document.getElementById("svcNotas").value="",document.querySelectorAll(".svc-emoji-btn").forEach(e=>e.style.background="#f3f4f6"),t){const e=(window.products||[]).find(o=>String(o.id)===String(t));e&&(document.getElementById("svcNombre").value=e.name||"",document.getElementById("svcEmoji").value=e.image||"\u2699\uFE0F",document.getElementById("svcCosto").value=e.cost||"",document.getElementById("svcSku").value=e.sku||"",document.getElementById("svcNotas").value=e.notas||"",document.querySelectorAll(".svc-emoji-btn").forEach(o=>{o.textContent===(e.image||"\u2699\uFE0F")&&(o.style.background="#ede9fe")}))}openModal("svcModal")}window.openServicioModal=openServicioModal;async function guardarServicio(){const t=document.getElementById("svcNombre").value.trim(),e=parseFloat(document.getElementById("svcCosto").value)||0,o=document.getElementById("svcEmoji").value||"\u2699\uFE0F",n=document.getElementById("svcNotas").value.trim(),a=document.getElementById("svcSku").value.trim(),i=document.getElementById("svcEditId").value;if(!t){manekiToastExport("El nombre es requerido.","warn");return}const r=mkId().split("-")[0].toUpperCase(),d=a||`SVC-${r}`;if(window.products||(window.products=[]),i){const l=window.products.findIndex(s=>String(s.id)===String(i));l!==-1&&(window.products[l]={...window.products[l],name:t,cost:e,image:o,notas:n,sku:d})}else window.products.push({id:_genId(),name:t,tipo:"servicio",cost:e,price:0,stock:null,stockMin:null,category:"servicios",image:o,notas:n,sku:d,tags:[]});saveProducts(),renderInventoryTable(),closeServicioModal(),window.MKS&&MKS.notify(),manekiToastExport(`\u2705 Servicio "${t}" guardado.`,"ok")}window.guardarServicio=guardarServicio;function closeServicioModal(){closeModal("svcModal")}window.closeServicioModal=closeServicioModal;function mpTogglePaquete(){const t=document.getElementById("mpUsaPaquete"),e=document.getElementById("mpCostoSimple"),o=document.getElementById("mpCostoPaquete"),n=document.getElementById("mpPaqueteSlider"),a=document.getElementById("mpPaqueteThumb"),i=document.getElementById("mpCosto");!t||!e||!o||(t.checked?(e.style.display="none",o.style.display="block",n&&(n.style.background="#7c3aed"),a&&(a.style.left="20px"),i&&i.removeAttribute("required"),mpCalcCostoUnidad()):(e.style.display="block",o.style.display="none",n&&(n.style.background="#d1d5db"),a&&(a.style.left="3px"),i&&i.setAttribute("required","")))}window.mpTogglePaquete=mpTogglePaquete;function mpCalcCostoUnidad(){const t=parseFloat(document.getElementById("mpPaqueteCantidad")?.value)||0,e=parseFloat(document.getElementById("mpPaquetePrecio")?.value)||0,o=document.getElementById("mpCostoUnidadResult"),n=document.getElementById("mpCostoCalculado")||document.getElementById("mpCosto");if(t>0&&e>0){const a=e/t;o&&(o.textContent="$"+a.toFixed(4).replace(/\.?0+$/,"")),n&&(n.value=a.toFixed(4));const i=document.getElementById("mpCostoUnidadBox");i&&(i.style.background="#ede9fe")}else o&&(o.textContent="$0.00"),n&&(n.value="")}window.mpCalcCostoUnidad=mpCalcCostoUnidad,window._mpVariantes=window._mpVariantes??[];function mpToggleVariantes(){const t=document.getElementById("mpUsaVariantes"),e=document.getElementById("mpVariantesPanel"),o=document.getElementById("mpVariantesSlider"),n=document.getElementById("mpVariantesThumb"),a=document.getElementById("mpStockRow");if(!t||!e)return;const i=t.checked;if(e.style.display=i?"block":"none",o&&(o.style.background=i?"#6366f1":"#d1d5db"),n&&(n.style.left=i?"20px":"3px"),a){a.style.opacity=i?"0.4":"1";const r=document.getElementById("mpStock");if(r)if(r.readOnly=i,i)r.value=0;else{const d=(window._mpVariantes||[]).reduce((l,s)=>l+(parseInt(s.qty)||0),0);d>0&&(r.value=d)}}i||(window._mpVariantes=[],renderVariantesMp())}window.mpToggleVariantes=mpToggleVariantes;function mpVarTipoRapido(t,e){const o=document.getElementById("mpVarTipo"),n=document.getElementById("mpVarValor");o&&(o.value=t),n&&(e?(n.value=e,agregarVarianteMp()):(n.value="",n.focus()))}window.mpVarTipoRapido=mpVarTipoRapido;function agregarVarianteMp(){const t=(document.getElementById("mpVarTipo")?.value||"").trim(),e=(document.getElementById("mpVarValor")?.value||"").trim();if(!t||!e){manekiToastExport("\u26A0\uFE0F Ingresa tipo y valor de la variante","warn");return}if(window._mpVariantes=window._mpVariantes||[],window._mpVariantes.find(i=>i.type===t&&i.value===e)){manekiToastExport("\u26A0\uFE0F Ya existe esta variante","warn");return}window._mpVariantes.push({type:t,value:e,qty:0});const n=document.getElementById("mpVarTipo"),a=document.getElementById("mpVarValor");n&&(n.value=""),a&&(a.value=""),document.getElementById("mpVarTipo")?.focus(),renderVariantesMp()}window.agregarVarianteMp=agregarVarianteMp;function eliminarVarianteMp(t){(window._mpVariantes||[]).splice(t,1),renderVariantesMp()}window.eliminarVarianteMp=eliminarVarianteMp;function updateVarianteMpQty(t,e){window._mpVariantes&&window._mpVariantes[t]&&(window._mpVariantes[t].qty=Math.max(0,parseInt(e)||0),actualizarStockTotalMp())}window.updateVarianteMpQty=updateVarianteMpQty;function actualizarStockTotalMp(){const t=(window._mpVariantes||[]).reduce((n,a)=>n+(parseInt(a.qty)||0),0),e=document.getElementById("mpVariantesStockTotal");e&&((window._mpVariantes||[]).length>0?(e.style.display="block",e.textContent=`\u{1F4E6} Stock total: ${t} unidades`):e.style.display="none");const o=document.getElementById("mpStock");o&&document.getElementById("mpUsaVariantes")?.checked&&(o.value=t)}function renderVariantesMp(){const t=document.getElementById("mpVariantesList");if(t){if(!window._mpVariantes||!window._mpVariantes.length){t.innerHTML='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin variantes agregadas</span>',actualizarStockTotalMp();return}t.innerHTML=window._mpVariantes.map((e,o)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;">
            <div style="flex:1;min-width:0;">
                <span style="font-size:.85rem;color:#374151;">${_esc(e.type)}: ${_mkColorDot(e.type,_esc(e.value))}</span>
            </div>
            <label style="font-size:.75rem;color:#6b7280;font-weight:600;white-space:nowrap;">Stock:</label>
            <div style="display:flex;align-items:center;gap:2px;">
                <button type="button" onclick="updateVarianteMpQty(${o},${(e.qty||0)-1});renderVariantesMp();"
                    style="width:22px;height:22px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">\u2212</button>
                <input type="number" value="${e.qty||0}" min="0"
                    onchange="updateVarianteMpQty(${o},this.value)"
                    style="width:52px;text-align:center;border:1.5px solid #6366f1;border-radius:8px;padding:2px 4px;font-weight:700;font-size:.85rem;">
                <button type="button" onclick="updateVarianteMpQty(${o},${(e.qty||0)+1});renderVariantesMp();"
                    style="width:22px;height:22px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">+</button>
            </div>
            <span style="font-size:.72rem;color:#9ca3af;">pzs</span>
            <button type="button" onclick="eliminarVarianteMp(${o})"
                style="width:24px;height:24px;background:#fee2e2;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;">\u2715</button>
        </div>`).join(""),actualizarStockTotalMp()}}window.renderVariantesMp=renderVariantesMp;
//# sourceMappingURL=inventory-3.js.map

;
"use strict";async function guardarMateriaPrima(){const i=m=>{const y=document.getElementById(m);return y?y.value:""},t=i("mpNombre").trim(),n=parseInt(i("mpStock"))||0,o=parseInt(i("mpStockMin"))||5,r=i("mpSku").trim(),s=i("mpProveedor").trim(),e=i("mpProveedorUrl").trim(),a=i("mpUnidad")||"pza",u=i("mpNotas").trim(),d=document.getElementById("mpUsaPaquete")?.checked||!1,c=parseFloat(i("mpPaqueteCantidad"))||0,l=parseFloat(i("mpPaquetePrecio"))||0;let p=0;if(d){if(c<=0||l<=0){manekiToastExport("\u26A0\uFE0F Ingresa la cantidad y precio del paquete","warn");return}p=l/c}else p=parseFloat(i("mpCosto"))||0;if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn");return}if(p<=0){manekiToastExport("\u26A0\uFE0F El costo debe ser mayor a 0","warn");return}const v=window.modoEdicion?window.edicionProductoId:null,k=(window.products||[]).find(m=>m.name.trim().toLowerCase()===t.toLowerCase()&&String(m.id)!==String(v));if(k){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${k.name}". Usa un nombre diferente o edita el existente.`,"warn");return}if(r&&!skuEsUnico(r,v)){manekiToastExport(`\u26A0\uFE0F El SKU "${r}" ya est\xE1 en uso`,"warn");return}if(window.currentProductImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const m=await subirImagenStorage(window.currentProductImageFile).catch(()=>null);m?window.currentProductImage=m:manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen. Intenta de nuevo.","warn"),window.currentProductImageFile=null}const E=document.getElementById("mpEsEmpaque")?.checked||!1,M=[...window._mpTagsActuales||[]],h=mkId().split("-")[0].toUpperCase(),S=r||"MP-"+h,f=document.getElementById("mpUsaVariantes")?.checked||!1,w=f?[...window._mpVariantes||[]]:[],g=f?w.reduce((m,y)=>m+(parseInt(y.qty)||0),0):n;if(window.modoEdicion&&window.edicionProductoId!==null){const m=(window.products||[]).findIndex(P=>String(P.id)===String(window.edicionProductoId));if(m===-1){manekiToastExport("Error: producto no encontrado","err");return}const y=window.products[m].stock,b=window.products[m].cost||0,I=[...window.products[m].historialCostos||[]];p!==b&&I.push({fecha:new Date().toISOString(),costoAntes:b,costoNuevo:p}),window.products[m]=Object.assign({},window.products[m],{name:t,tipo:"materia_prima",cost:p,price:0,stock:g,stockMin:o,sku:S,tags:M,proveedor:s,proveedorUrl:e,unidad:a,notas:u,imageUrl:window.currentProductImage||window.products[m].imageUrl,compraPaquete:d?{cantidad:c,precio:l}:null,variants:w,usaVariantes:f,historialCostos:I,esEmpaque:E}),g!==y&&registrarMovimiento({productoId:window.edicionProductoId,productoNombre:t,tipo:"ajuste",cantidad:g-y,motivo:"Edici\xF3n",stockAntes:y,stockDespues:g}),p!==b&&_cascadeCostMP(window.edicionProductoId,p),f&&w.length>0&&_cascadeVariantesMP(window.edicionProductoId,w),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closeMateriaPrimaModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Materia prima actualizada","ok")}else{const m={id:_genId(),name:t,tipo:"materia_prima",category:"materiales",cost:p,price:0,stock:g,stockMin:o,sku:S,tags:M,proveedor:s,proveedorUrl:e,unidad:a,notas:u,image:"\u{1F3ED}",imageUrl:window.currentProductImage||null,variants:w,usaVariantes:f,compraPaquete:d?{cantidad:c,precio:l}:null,esEmpaque:E};window.products.unshift(m),window._invCurrentPage=1,g>0&&registrarMovimiento({productoId:m.id,productoNombre:m.name,tipo:"creacion",cantidad:g,motivo:"Alta de materia prima",stockAntes:0,stockDespues:g}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closeMateriaPrimaModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Materia prima agregada","ok")}}window.guardarMateriaPrima=guardarMateriaPrima;function _cascadeCostMP(i,t){const n=[];(window.products||[]).forEach(e=>{if(e.tipo==="materia_prima"||e.tipo==="servicio"||!Array.isArray(e.mpComponentes)||!e.mpComponentes.length)return;const a=e.mpComponentes.find(c=>String(c.id)===String(i));if(!a)return;const u=e.cost||0;a.costUnit=t;const d=e.mpComponentes.reduce((c,l)=>c+(l.costUnit||0)*(l.qty||1),0);e.cost=Math.round(d*100)/100,e.historialPrecios||(e.historialPrecios=[]),e.historialPrecios.push({fecha:new Date().toISOString(),costoAntes:u,costoNuevo:e.cost,precioAntes:e.price,precioNuevo:e.price}),n.push(e.name)}),n.length&&manekiToastExport(`\u{1F4B0} Costo recalculado en: ${n.join(", ")}`,"ok");const o=(window.products||[]).filter(e=>(e.mpComponentes||[]).some(a=>String(a.id)===String(i))),r=new Set(o.map(e=>String(e.id))),s=(window.pedidos||[]).filter(e=>!["cancelado","finalizado"].includes(e.status||"")&&(e.productosInventario||[]).some(a=>r.has(String(a.id))));if(s.length>0){const e=s.map(a=>a.folio||a.id).join(", ");manekiToastExport(`\u{1F4A1} ${s.length} pedido(s) activo(s) usan productos afectados por este cambio de costo (${e}). Revisa sus precios.`,"warn")}}window._cascadeCostMP=_cascadeCostMP;function _cascadeVariantesMP(i,t){if(!Array.isArray(t)||!t.length)return;const n=[];(window.products||[]).forEach(o=>{o.tipo==="materia_prima"||o.tipo==="servicio"||!Array.isArray(o.mpComponentes)||!o.mpComponentes.length||o.mpComponentes.some(r=>String(r.id)===String(i))&&(o.variants=t.map(r=>{const s=(o.variants||[]).find(e=>(e.type||e.tipo)===(r.type||r.tipo)&&(e.value||e.valor)===(r.value||r.valor));return s?{...r,qty:s.qty??r.qty}:{...r}}),o.usaVariantes=!0,n.push(o.name))}),n.length&&manekiToastExport(`\u{1F3A8} Variantes sincronizadas en: ${n.join(", ")}`,"ok")}window._cascadeVariantesMP=_cascadeVariantesMP;function editProduct(i){const t=(window.products||[]).find(n=>String(n.id)===String(i));if(!t){console.warn("editProduct: no encontrado",i);return}t.tipo==="materia_prima"?(injectMpModal(),window.modoEdicion=!0,window.edicionProductoId=i,window.currentProductImage=t.imageUrl||null,window.currentProductImageFile=null,window._mpTagsActuales=[...t.tags||[]],setTimeout(()=>{const n=document.getElementById("mpForm");n&&n.reset();const o=(c,l)=>{const p=document.getElementById(c);p&&(p.value=l??"")};o("mpNombre",t.name),o("mpSku",t.sku||""),o("mpStock",t.stock||0),o("mpStockMin",t.stockMin||5),o("mpProveedor",t.proveedor||""),o("mpProveedorUrl",t.proveedorUrl||""),o("mpNotas",t.notas||""),setTimeout(()=>{const c=document.getElementById("mpUnidad");c&&(c.value=t.unidad||"pza")},10);const r=document.getElementById("mpUsaPaquete");if(t.compraPaquete&&t.compraPaquete.cantidad>0?(r&&(r.checked=!0,mpTogglePaquete()),o("mpPaqueteCantidad",t.compraPaquete.cantidad),o("mpPaquetePrecio",t.compraPaquete.precio),mpCalcCostoUnidad()):(r&&(r.checked=!1,mpTogglePaquete()),o("mpCosto",t.cost||0)),t.usaVariantes&&Array.isArray(t.variants)&&t.variants.length>0){window._mpVariantes=[...t.variants];const c=document.getElementById("mpUsaVariantes");c&&(c.checked=!0,mpToggleVariantes()),renderVariantesMp()}else _resetMpVariantesUI(),o("mpStock",t.stock||0);const s=document.getElementById("mpPreviewImg"),e=document.getElementById("mpImagePreview");t.imageUrl&&s?(s.src=t.imageUrl,e&&e.classList.remove("hidden")):e&&e.classList.add("hidden");const a=document.getElementById("mpEsEmpaque");a&&(a.checked=!!t.esEmpaque),renderMpTags();const u=document.querySelector("#mpModal h3");u&&(u.textContent="\u{1F3ED} Editar Materia Prima");const d=document.getElementById("mpSubmitBtn");d&&(d.textContent="\u{1F4BE} Guardar Cambios"),typeof openModal=="function"&&openModal("mpModal")},150)):t.tipo==="producto_variable"?(typeof injectVariableProductModal=="function"&&injectVariableProductModal(),typeof openVariableProductModal=="function"&&openVariableProductModal(i)):(injectPtModal(),window.modoEdicion=!0,window.edicionProductoId=i,window._ptVariants=Array.isArray(t.variants)?[...t.variants]:[],window._ptMpComponentes=Array.isArray(t.mpComponentes)?[...t.mpComponentes]:[],window._ptTagsActuales=[...t.tags||[]],window.currentVariants=[...window._ptVariants],window.currentProductImage=t.imageUrl||null,window.currentProductImageFile=null,window._ptGaleriaUrls=Array.isArray(t.imageUrls)?[...t.imageUrls]:[],window._ptGaleriaFiles=[],setTimeout(()=>{const n=(u,d)=>{const c=document.getElementById(u);c&&(c.value=d??"")};if(n("ptNombre",t.name),n("ptSku",t.sku||""),n("ptCosto",t.cost||0),n("ptPrecio",t.price||0),n("ptStockMin",t.stockMin??5),n("ptRendimientoPorHoja",t.rendimientoPorHoja||""),setTimeout(()=>{n("ptProveedorNombre",t.proveedorNombre||""),n("ptProveedorNotas",t.proveedorNotas||"")},200),poblarCategoriasPt(),setTimeout(()=>{const u=document.getElementById("ptCategory");u&&(u.value=t.category)},80),t.imageUrl){const u=document.getElementById("ptPreviewImg"),d=document.getElementById("ptImagePreview");u&&(u.src=t.imageUrl),d&&d.classList.remove("hidden")}ptRenderGaleria(),renderTagsPt(),renderVariantsListPt(),renderPtMpList(),recalcularCostoPt(),ptMostrarMargenInfo();const o=document.getElementById("ptPublicarTienda"),r=document.getElementById("ptToggleTrack"),s=document.getElementById("ptToggleThumb");o&&(o.checked=t.publicarTienda===!0||t.tipo==="producto",r&&(r.style.background=o.checked?"#10b981":"#d1d5db"),s&&(s.style.transform=o.checked?"translateX(22px)":"translateX(0)"));const e=document.querySelector("#ptModal h3");e&&(e.textContent="\u270F\uFE0F Editar Producto Terminado");const a=document.getElementById("ptSubmitBtn");a&&(a.textContent="\u{1F4BE} Guardar Cambios")},120),typeof openModal=="function"&&openModal("ptModal"))}window.editProduct=editProduct,document.addEventListener("DOMContentLoaded",function(){setTimeout(()=>{try{const o=localStorage.getItem("mkStockMovements");if(o){const r=JSON.parse(o);Array.isArray(r)&&r.length>0&&((!window.stockMovements||window.stockMovements.length===0)&&(window.stockMovements=r,window.stockMovimientos=r,saveStockMovements(),console.log("[Migraci\xF3n] stockMovements: "+r.length+" movimientos migrados a SQLite/Supabase.")),localStorage.removeItem("mkStockMovements"))}}catch(o){console.warn("[Migraci\xF3n] Error migrando stockMovements:",o)}},3e3),injectMpModal(),injectPtModal(),setupImageUpload(),["inventorySearch","inventoryTagFilter","inventoryTipoFilter","inventoryProveedorFilter"].forEach(o=>{function r(){const s=document.getElementById(o);s&&!s._invPagListenerAdded&&(s.addEventListener("input",()=>{window._invCurrentPage=1,renderInventoryTable()}),s.addEventListener("change",()=>{window._invCurrentPage=1,renderInventoryTable()}),s._invPagListenerAdded=!0)}r(),setTimeout(r,800),setTimeout(r,2e3)}),setTimeout(patchInventoryButtons,400);const t=document.getElementById("inventorySection")||document.querySelector('section[id*="inventor"]')||document.querySelector('[data-section="inventory"]');t&&new MutationObserver(r=>{for(const s of r)if(s.attributeName==="class"||s.attributeName==="style"){const e=s.target;!e.classList.contains("hidden")&&e.style.display!=="none"&&e.offsetParent!==null&&setTimeout(patchInventoryButtons,80)}}).observe(t,{attributes:!0});const n=document.getElementById("addProductForm");n&&!n._mkSubmitBound&&(n._mkSubmitBound=!0,n.addEventListener("submit",function(o){o.preventDefault(),openAddProductModal()}))});function patchInventoryButtons(){const i=document.querySelector('[onclick="openAddProductModal()"]');if(!i)return;const t=i.parentElement;if(i.innerHTML="\u{1F4E6} Producto Terminado",i.title="Agregar producto terminado",[{selector:'[onclick="toggleMovimientos()"]',html:"\u{1F550} Movimientos"},{selector:'[onclick="imprimirInventario()"]',html:"\u{1F5A8}\uFE0F Imprimir"},{selector:`[onclick="manekiExportar('inventario')"]`,html:"\u{1F4CA} Exportar Excel"}].forEach(({selector:o,html:r})=>{const s=document.querySelector(o);s&&(s.innerHTML=r)}),!t.querySelector("[data-mp-btn]")){const o=document.createElement("button");o.setAttribute("data-mp-btn","1"),o.onclick=()=>{injectMpModal(),openAddMateriaPrimaModal()},o.className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2",o.style.cssText="background:linear-gradient(135deg,#7c3aed,#a855f7);",o.innerHTML="\u{1F9EA} Materia Prima",o.title="Agregar materia prima",t.insertBefore(o,i)}}window.patchInventoryButtons=patchInventoryButtons;function ajustarStock(i){const t=(window.products||[]).find(u=>String(u.id)===String(i));if(!t)return;window._ajustarStockId=String(i),window.__ajustarStockIdBackup=String(i);const n=document.getElementById("ajustarStockNombre"),o=document.getElementById("ajustarStockActual"),r=document.getElementById("ajustarStockCantidad"),s=document.getElementById("ajustarStockMotivo");n&&(n.textContent=t.name),o&&(o.textContent=getStockEfectivo(t)),r&&(r.value="",setTimeout(()=>r.focus&&r.focus(),250)),s&&(s.value="");const e=document.getElementById("ajusteStockPuntoReorden");e&&(e.value=t.puntoReorden!=null?t.puntoReorden:"");const a=document.getElementById("ajustarStockModal");a&&(a.dataset.productId=String(i)),_inyectarCamposAjusteStock(a),_renderUltimosMovimientosProducto(i,a),_renderSugerenciaReorden(t,a),typeof openModal=="function"&&openModal("ajustarStockModal")}window.ajustarStock=ajustarStock;function _inyectarCamposAjusteStock(i){if(!i||i.querySelector("#ajusteStockMotivoSelect"))return;const t=i.querySelector(".space-y-3");if(!t)return;const n=t.querySelector("#ajusteStockPuntoReorden")?.parentElement,o=document.createElement("div");o.id="_ajusteStockExtraFields",o.innerHTML=`
        <div style="margin-top:10px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Motivo del ajuste</label>
            <select id="ajusteStockMotivoSelect"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;background:#fff;cursor:pointer;">
                <option value="">\u2014 Selecciona un motivo \u2014</option>
                <option value="Merma">Merma</option>
                <option value="Muestra/Regalo">Muestra / Regalo</option>
                <option value="Ajuste de conteo">Ajuste de conteo</option>
                <option value="Devoluci\xF3n a proveedor">Devoluci\xF3n a proveedor</option>
                <option value="Entrada de mercanc\xEDa">Entrada de mercanc\xEDa</option>
                <option value="Otro">Otro</option>
            </select>
        </div>
        <div style="margin-top:8px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Notas adicionales <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
            <input type="text" id="ajusteStockNotasExtra" placeholder="Ej: Lote da\xF1ado por humedad"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;">
        </div>`,n?t.insertBefore(o,n):t.appendChild(o)}window._inyectarCamposAjusteStock=_inyectarCamposAjusteStock;function _renderUltimosMovimientosProducto(i,t){if(!t)return;if(!t.querySelector("#_ajusteUltMovimientos")){const e=t.querySelector(".bg-white");if(!e)return;const a=document.createElement("div");a.id="_ajusteUltMovimientos",a.style.cssText="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;",e.appendChild(a)}const o=t.querySelector("#_ajusteUltMovimientos");if(!o)return;const r=(window.stockMovements||[]).filter(e=>String(e.productoId)===String(i)).slice(0,5);if(!r.length){o.innerHTML='<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin movimientos registrados</p>';return}const s={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=`
        <p style="font-size:.72rem;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">\xDAltimos movimientos</p>
        ${r.map(e=>{const a=new Date(e.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),u=e.cantidad>=0?`+${e.cantidad}`:`${e.cantidad}`;return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f9fafb;font-size:.75rem;">
                <span style="font-size:13px;">${s[e.tipo]||"\u26AA"}</span>
                <div style="flex:1;min-width:0;">
                    <span style="font-weight:600;color:#374151;">${e.tipo}</span>
                    <span style="color:#9ca3af;margin-left:4px;">${_esc(e.motivo||"")}</span>
                    <div style="color:#9ca3af;font-size:.68rem;">${a}</div>
                </div>
                <span style="font-weight:700;color:${e.cantidad>=0?"#10b981":"#ef4444"};white-space:nowrap;">${u} uds</span>
            </div>`}).join("")}`}window._renderUltimosMovimientosProducto=_renderUltimosMovimientosProducto;function confirmarAjusteStock(){const i=document.getElementById("ajustarStockModal"),t=i&&i.dataset.productId||window._ajustarStockId||window.__ajustarStockIdBackup;if(!t){manekiToastExport("\u274C Error: no se encontr\xF3 el producto","err");return}const n=(window.products||[]).find(f=>String(f.id)===String(t));if(!n){manekiToastExport("\u274C Error: producto no encontrado","err");return}const o=document.getElementById("ajustarStockCantidad"),r=document.getElementById("ajustarStockMotivo"),s=document.getElementById("ajusteStockMotivoSelect"),e=document.getElementById("ajusteStockNotasExtra");if(!o){manekiToastExport("\u274C Error: formulario no disponible","err");return}const a=parseInt(o.value),u=s?s.value.trim():"",d=r?r.value.trim():"",c=u||d||"",l=e?e.value.trim():"";if(isNaN(a)||o.value.trim()===""){manekiToastExport("\u26A0\uFE0F Ingresa una cantidad v\xE1lida (+para agregar / -para restar)","warn"),o.focus&&o.focus();return}const p=getStockEfectivo(n),v=parseInt(n.stock)||0;if(n.stock=Math.max(0,v+a),n.variants&&n.variants.length>0&&a!==0){if(a>0)n.variants[0].qty=(n.variants[0].qty||0)+a;else{let f=Math.abs(a);for(const w of n.variants){const g=Math.min(w.qty||0,f);if(w.qty=(w.qty||0)-g,f-=g,f<=0)break}}syncStockFromVariants(n)}const k=getStockEfectivo(n);registrarMovimiento({productoId:n.id,productoNombre:n.name,tipo:a>=0?"entrada":"salida",cantidad:a,motivo:c,stockAntes:p,stockDespues:k}),window.movimientosStock=window.movimientosStock||[];const E=document.getElementById("ajusteStockMotivoSelect"),M=document.getElementById("ajusteStockNotasExtra"),h={id:Date.now()+Math.random(),fecha:typeof _fechaHoy=="function"?_fechaHoy():(()=>{const f=new Date;return f.getFullYear()+"-"+("0"+(f.getMonth()+1)).slice(-2)+"-"+("0"+f.getDate()).slice(-2)})(),productoId:n.id,productoNombre:n.name||n.nombre,deltaStock:a,stockResultante:k,motivo:E?E.value:c||"Ajuste manual",notas:M?M.value:l,usuario:"local"};window.movimientosStock.unshift(h),window.movimientosStock.length>200&&(window.movimientosStock=window.movimientosStock.slice(0,200)),typeof sbSave=="function"?sbSave("movimientosStock",window.movimientosStock):typeof guardarDatos=="function"&&guardarDatos();const S=document.getElementById("ajusteStockPuntoReorden");if(S&&S.value.trim()!==""){const f=parseInt(S.value);!isNaN(f)&&f>=0&&(n.puntoReorden=f)}saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),typeof closeModal=="function"&&closeModal("ajustarStockModal"),window._ajustarStockId=null,window.__ajustarStockIdBackup=null,i&&delete i.dataset.productId,window.MKS&&MKS.tick(),manekiToastExport(`\u2705 Stock de "${n.name}": ${p} \u2192 ${k}`,"ok")}window.confirmarAjusteStock=confirmarAjusteStock;function closeAjustarStockModal(){if(typeof closeModal=="function")closeModal("ajustarStockModal");else{const t=document.getElementById("ajustarStockModal");t&&(t.style.display="none")}window._ajustarStockId=null,window.__ajustarStockIdBackup=null;const i=document.getElementById("ajustarStockModal");i&&delete i.dataset.productId}window.closeAjustarStockModal=closeAjustarStockModal;function _renderSugerenciaReorden(i,t){if(!t)return;let n=t.querySelector("#_sugerenciaReorden");if(!n){const c=t.querySelector(".bg-white")||t.querySelector(".space-y-3")?.parentElement;if(!c)return;n=document.createElement("div"),n.id="_sugerenciaReorden",n.style.cssText="margin-top:12px;padding:10px 12px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;",c.appendChild(n)}const o=(window.salesHistory||[]).filter(c=>{if(!c.date||c.method==="Cancelado")return!1;const l=new Date;l.setDate(l.getDate()-30);const p=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`;return c.date>=p});let r=0;o.forEach(c=>{(c.products||[]).forEach(l=>{(String(l.id)===String(i.id)||(l.name||"").toLowerCase()===(i.name||"").toLowerCase())&&(r+=Number(l.quantity||1))})});const s=r/30,e=i.leadTime||7,a=Math.ceil(s*3),u=Math.ceil(s*e)+a,d=Math.max(0,Math.ceil(s*30)-(getStockEfectivo(i)||0));if(r===0){n.innerHTML='<p style="font-size:.75rem;color:#92400E;margin:0;">\u{1F4CA} Sin ventas en los \xFAltimos 30 d\xEDas \u2014 no hay datos para sugerir reorden.</p>';return}n.innerHTML=`
        <p style="font-size:.72rem;font-weight:800;color:#92400E;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;">\u{1F4CA} Sugerencia de reorden</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Venta promedio</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${s.toFixed(1)}/d\xEDa</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Punto reorden sugerido</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${u} uds</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Pedir ahora</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${d>0?d+" uds":"\u2705 OK"}</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Lead time</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${e}d
                    <button onclick="(function(){var v=prompt('D\xEDas que tarda tu proveedor en entregar:','${e}');if(v&&!isNaN(v)){var p=(window.products||[]).find(x=>String(x.id)==='${i.id}');if(p){p.leadTime=parseInt(v);if(typeof saveProducts==='function')saveProducts();manekiToastExport('\u2705 Lead time guardado: '+v+' d\xEDas','ok');}}})()"
                       style="font-size:.6rem;background:none;border:none;cursor:pointer;color:#B45309;">\u270F\uFE0F</button>
                </p>
            </div>
        </div>`}function aplicarMargen(i){if(!i||isNaN(i)||i<=0){manekiToastExport("Margen inv\xE1lido","err");return}const t=parseFloat(document.getElementById("productCost").value);if(!t||t<=0){manekiToastExport("Primero ingresa el costo","warn");return}const n=t/(1-i/100);document.getElementById("productPrice").value=n.toFixed(2);const o=document.getElementById("precioSugeridoLabel");o&&(o.textContent=`\u{1F4A1} Con ${i}% de margen: costo $${t.toFixed(2)} \u2192 precio $${n.toFixed(2)} (ganancia $${(n-t).toFixed(2)})`)}window.aplicarMargen=aplicarMargen;async function cambiarTipoProducto(i){const t=(window.products||[]).find(s=>String(s.id)===String(i));if(!t)return;const n=(t.tipo||"producto")==="materia_prima",o=n?"producto":"materia_prima",r=n?"Producto Terminado \u{1F4E6}":"Materia Prima \u{1F3ED}";if(!n){const s=(window.pedidos||[]).filter(e=>!["cancelado","finalizado"].includes(e.status||"")&&(e.productosInventario||[]).some(a=>String(a.id)===String(i)));if(s.length>0){const e=s.map(u=>u.folio||u.id).join(", ");if(!await showConfirm(`\u26A0\uFE0F "${t.name}" est\xE1 en ${s.length} pedido(s) activo(s):
${e}

Convertirlo a Materia Prima puede romper esos pedidos. \xBFContinuar de todas formas?`))return}}showConfirm(`\xBFCambiar "${t.name}" a ${r}?

${n?"Se habilitar\xE1 precio de venta y variantes.":"Se ocultar\xE1 precio de venta. Solo se usar\xE1 el costo."}`,`Convertir a ${r}`).then(s=>{s&&(t.tipo=o,o==="materia_prima"?(t.price=0,t.variants=[]):(!t.price||t.price<=0)&&(t.price=(t.cost||0)*2),saveProducts(),renderInventoryTable(),manekiToastExport(`\u2705 "${t.name}" ahora es ${r}`,"ok"))})}window.cambiarTipoProducto=cambiarTipoProducto;async function deleteProduct(i){const t=(window.products||[]).find(e=>String(e.id)===String(i));if(!t)return;const n=(window.pedidos||[]).filter(e=>!["cancelado","finalizado"].includes(e.status||"")&&(e.productosInventario||[]).some(a=>String(a.id)===String(i)));if(n.length>0){const e=n.map(u=>u.folio||u.id).join(", ");if(!await showConfirm(`\u26A0\uFE0F Este producto est\xE1 en ${n.length} pedido(s) activo(s):
${e}

Eliminar puede romper esos pedidos. \xBFContinuar de todas formas?`))return}const o=(window.products||[]).filter(e=>e.isKit&&e.kitComponentes&&e.kitComponentes.some(a=>String(a.id)===String(i))),r=n;let s=`\xBFEliminar "${t.name}"?`;t.stock>0&&(s+=`

Tiene ${t.stock} unidades en stock.`),o.length&&(s+=`

\u26A0\uFE0F Es componente de ${o.length} kit(s): ${o.map(e=>e.name).join(", ")}.`),r.length&&(s+=`

\u{1F6A8} Est\xE1 en ${r.length} pedido(s) activo(s): ${r.map(e=>e.folio||e.id).join(", ")}. Eliminar el producto puede afectar esos pedidos.`),s+=`

Esta acci\xF3n no se puede deshacer.`,showConfirm(s,"\u{1F5D1}\uFE0F Eliminar producto permanentemente").then(async e=>{if(!e)return;window.MKS&&MKS.del();const a=JSON.parse(JSON.stringify(t)),u=window.products.findIndex(d=>String(d.id)===String(i));typeof window.mkPushUndo=="function"&&(window.mkPushUndo(`Eliminar "${t.name}"`,()=>{window.products.some(d=>String(d.id)===String(a.id))||(window.products.splice(u,0,a),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof window._rebuildProductMap=="function"&&window._rebuildProductMap())}),typeof window.mkMostrarUndoHint=="function"&&window.mkMostrarUndoHint(`Eliminar "${t.name}"`)),window.products=window.products.filter(d=>String(d.id)!==String(i));try{products=window.products}catch{}saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard();try{await db.from("products").delete().eq("id",String(i))}catch(d){console.warn("deleteProduct: no se pudo borrar de products:",d)}manekiToastExport(`\u{1F5D1}\uFE0F "${t.name}" eliminado`,"ok")})}window.deleteProduct=deleteProduct;function calcularDisponibilidadDesdeMP(i,t,n){if(!i.mpComponentes||i.mpComponentes.length===0)return null;const o=t||window.productMap,r=o?d=>o.get(String(d)):d=>(window.products||[]).find(c=>String(c.id)===String(d)),s=n?d=>n.get(String(d.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(d):parseInt(d.stock)||0):d=>typeof getStockEfectivo=="function"?getStockEfectivo(d):parseInt(d.stock)||0;if(!i.mpComponentes.some(d=>{const c=r(d.id);return!c||c.tipo!=="servicio"}))return null;let a=1/0;const u=[];for(const d of i.mpComponentes){const c=r(d.id);if(c&&c.tipo==="servicio")continue;if(!c){i._tieneComponentesHuerfanos=!0;continue}const l=s(c),p=d.qty||1,v=Math.floor(l/p);u.push({nombre:d.nombre||(c?c.name:"?"),stock:l,qty:p,posibles:v}),v<a&&(a=v)}return{piezas:a===1/0?0:a,detalle:u}}window.calcularDisponibilidadDesdeMP=calcularDisponibilidadDesdeMP;
//# sourceMappingURL=inventory-4.js.map

;
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
