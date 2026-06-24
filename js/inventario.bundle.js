"use strict";function renderCategoriesGrid(){const t=document.getElementById("categoriesGrid");t.innerHTML=categories.map(e=>{const o=products.filter(n=>n.category===e.id).length,a=_esc(e.color||"#C5973B"),r=_esc(e.id);return`
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
                        <p class="text-sm font-medium" style="color: ${e.color||"#C5973B"}">${o} producto${o!==1?"s":""}</p>
                    </div>
                `}).join("")}document.addEventListener("click",function(t){const e=t.target.closest(".cat-action-btn[data-catid]");if(!e)return;const o=e.dataset.catid,a=e.dataset.cataction;a==="edit"?editCategory(o):a==="delete"&&deleteCategory(o)});function selectCategoryColor(t){document.getElementById("categoryColor").value=t,document.querySelectorAll(".color-btn").forEach(e=>{e.style.borderColor=e.dataset.color===t?"#374151":"transparent",e.style.transform=e.dataset.color===t?"scale(1.2)":"scale(1)"})}function closeAddCategoryModal(){closeModal("addCategoryModal"),document.getElementById("addCategoryForm").reset()}document.getElementById("addCategoryForm").addEventListener("submit",function(t){t.preventDefault();const e=document.getElementById("categoryName").value,o=document.getElementById("categoryEmoji").value;let a=e.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_\u00e0-\u00ff]/g,""),r=a,n=2;for(;categories.find(c=>c.id.toLowerCase()===r.toLowerCase());)r=a+"_"+n++;const d=document.getElementById("categoryColor")?.value||"#C5973B",i={id:r,name:e,emoji:o,color:d};categories.push(i),saveCategories(),renderCategoriesGrid(),updateCategorySelects(),closeAddCategoryModal(),manekiToastExport("\u2705 Categor\xEDa creada exitosamente","ok")});function deleteCategory(t){const e=products.filter(a=>a.category===t).length;if(e>0){manekiToastExport(`No puedes eliminar esta categor\xEDa: tiene ${e} producto(s) asociado(s).`,"error");return}const o=categories.find(a=>a.id===t);showConfirm(`La categor\xEDa "${o?o.name:"esta categor\xEDa"}" ser\xE1 eliminada permanentemente.`,"\u26A0\uFE0F Eliminar categor\xEDa").then(a=>{a&&(categories=categories.filter(r=>r.id!==t),saveCategories(),renderCategoriesGrid(),updateCategorySelects())})}function editCategory(t){const e=categories.find(o=>o.id===t);e&&(document.getElementById("editCategoryId").value=e.id,document.getElementById("editCategoryName").value=e.name,document.getElementById("editCategoryEmoji").value=e.emoji||"\u{1F4E6}",document.getElementById("editSelectedEmojiDisplay").textContent=e.emoji||"\u{1F4E6}",document.getElementById("editEmojiSearch").value="",document.getElementById("editCategoryColor").value=e.color||"#C5973B",openModal("editCategoryModal"),setTimeout(()=>{selectEditColor(e.color||"#C5973B"),renderEditEmojiGrid()},50))}function closeEditCategoryModal(){closeModal("editCategoryModal")}function selectEditColor(t){document.getElementById("editCategoryColor").value=t,document.querySelectorAll(".edit-color-btn").forEach(e=>{e.style.borderColor=e.dataset.color===t?"#374151":"transparent",e.style.transform=e.dataset.color===t?"scale(1.2)":"scale(1)"})}function renderEditEmojiGrid(t=""){const e=document.getElementById("editEmojiGrid");if(!e)return;const o=t.toLowerCase().trim(),a=emojiCategories.flatMap(r=>r.emojis);if(o){const r=a.filter((i,c)=>!0),n={regalo:["\u{1F381}","\u{1F380}","\u{1F38A}"],ropa:["\u{1F457}","\u{1F455}","\u{1F454}"],taza:["\u2615","\u{1F375}"],llave:["\u{1F511}","\u{1F5DD}\uFE0F"],peluche:["\u{1F9F8}","\u{1F43B}"],joya:["\u{1F48D}","\u{1F48E}"]};let d=[];Object.entries(n).forEach(([i,c])=>{(i.includes(o)||o.includes(i))&&d.push(...c)}),d.length===0&&(d=a),e.innerHTML=`<div class="flex flex-wrap gap-1">${[...new Set(d)].map(i=>`<button type="button" onclick="selectEditEmoji('${i}')" class="edit-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${i}</button>`).join("")}</div>`;return}e.innerHTML=emojiCategories.map(r=>`
                <div class="mb-2">
                    <p class="text-xs font-semibold text-gray-400 mb-1">${r.label}</p>
                    <div class="flex flex-wrap gap-1">
                        ${r.emojis.map(n=>`<button type="button" onclick="selectEditEmoji('${n}')" class="edit-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${n}</button>`).join("")}
                    </div>
                </div>`).join("")}function selectEditEmoji(t){document.getElementById("editCategoryEmoji").value=t,document.getElementById("editSelectedEmojiDisplay").textContent=t,document.querySelectorAll(".edit-emoji-btn").forEach(e=>{e.style.background=e.textContent.trim()===t?"#FFF9F0":"",e.style.border=e.textContent.trim()===t?"2px solid #C5973B":""})}function filterEditEmojis(t){renderEditEmojiGrid(t)}function saveEditCategory(){const t=document.getElementById("editCategoryId").value,e=document.getElementById("editCategoryName").value.trim(),o=document.getElementById("editCategoryEmoji").value||"\u{1F4E6}",a=document.getElementById("editCategoryColor").value||"#C5973B";if(!e){manekiToastExport("\u26A0\uFE0F El nombre no puede estar vac\xEDo","warn");return}const r=categories.findIndex(n=>n.id===t);r!==-1&&(categories[r].name=e,categories[r].emoji=o,categories[r].color=a,products.forEach(n=>{n.category===t&&!n.imageUrl&&(n.image=o)}),saveCategories(),saveProducts(),renderCategoriesGrid(),updateCategorySelects(),closeEditCategoryModal(),manekiToastExport("\u2705 Categor\xEDa actualizada","ok"))}function updateCategorySelects(){const t=categories.map(e=>`<option value="${_esc(e.id)}">${_esc(e.emoji)} ${_esc(e.name)}</option>`).join("");["productCategory","ptCategory","mpCategory"].forEach(e=>{const o=document.getElementById(e);if(!o)return;const a=o.value;o.innerHTML=t,a&&o.querySelector(`option[value="${CSS.escape?CSS.escape(a):a}"]`)&&(o.value=a)})}
//# sourceMappingURL=categorias.js.map

;
"use strict";typeof window.showSection>"u"&&(window.showSection=function(t){document.querySelectorAll('section[id$="-section"], section[id$="Section"]').forEach(i=>{i.classList.add("hidden"),i.style.display=""});const e=document.getElementById(t+"-section")||document.getElementById(t+"Section");e&&e.classList.remove("hidden")}),(function(){const t={rojo:"#ef4444",roja:"#ef4444",red:"#ef4444",azul:"#3b82f6",azules:"#3b82f6",blue:"#3b82f6","azul marino":"#1e3a8a",marino:"#1e3a8a",verde:"#22c55e",green:"#22c55e",amarillo:"#eab308",amarilla:"#eab308",yellow:"#eab308",dorado:"#d97706",gold:"#d97706",negro:"#1f2937",negra:"#1f2937",black:"#1f2937",blanco:"#f9fafb",blanca:"#f9fafb",white:"#f9fafb",rosa:"#ec4899",pink:"#ec4899","rosa mexicano":"#e91e8c",morado:"#a855f7",morada:"#a855f7",violeta:"#8b5cf6",lila:"#c084fc",lavanda:"#c4b5fd",purple:"#a855f7",naranja:"#f97316",orange:"#f97316",gris:"#9ca3af",grise:"#9ca3af",gray:"#9ca3af",grey:"#9ca3af",plateado:"#94a3b8",silver:"#94a3b8",caf\u00E9:"#92400e",cafe:"#92400e",marr\u00F3n:"#92400e",marron:"#92400e",brown:"#78350f",beige:"#e5c9a0",crema:"#fef3c7",turquesa:"#06b6d4",celeste:"#7dd3fc",cian:"#22d3ee",cyan:"#22d3ee",aqua:"#22d3ee",coral:"#f87171",salmon:"#fca5a5",salm\u00F3n:"#fca5a5",oliva:"#84cc16",olive:"#65a30d",magenta:"#e879f9",fucsia:"#e879f9",fuchsia:"#e879f9",vino:"#9f1239",burgundy:"#9f1239",guinda:"#9f1239",indigo:"#6366f1","azul cielo":"#7dd3fc","azul rey":"#2563eb","azul claro":"#93c5fd","verde militar":"#4d7c0f","verde lim\xF3n":"#a3e635","verde menta":"#6ee7b7","verde oliva":"#65a30d","rojo vino":"#9f1239"},e={rojo:"\u{1F534}",roja:"\u{1F534}",red:"\u{1F534}",azul:"\u{1F535}",blue:"\u{1F535}","azul marino":"\u{1F535}",marino:"\u{1F535}",verde:"\u{1F7E2}",green:"\u{1F7E2}",amarillo:"\u{1F7E1}",amarilla:"\u{1F7E1}",yellow:"\u{1F7E1}",dorado:"\u{1F7E1}",gold:"\u{1F7E1}",negro:"\u26AB",negra:"\u26AB",black:"\u26AB",blanco:"\u26AA",blanca:"\u26AA",white:"\u26AA",rosa:"\u{1FA77}",pink:"\u{1FA77}","rosa mexicano":"\u{1FA77}",morado:"\u{1F7E3}",morada:"\u{1F7E3}",violeta:"\u{1F7E3}",lila:"\u{1F7E3}",purple:"\u{1F7E3}",naranja:"\u{1F7E0}",orange:"\u{1F7E0}",caf\u00E9:"\u{1F7E4}",cafe:"\u{1F7E4}",marr\u00F3n:"\u{1F7E4}",marron:"\u{1F7E4}",brown:"\u{1F7E4}",beige:"\u{1F7E4}",crema:"\u{1F7E1}",gris:"\u{1FA76}",plateado:"\u{1FA76}",silver:"\u{1FA76}",gray:"\u{1FA76}",grey:"\u{1FA76}",turquesa:"\u{1F535}",celeste:"\u{1F535}",cian:"\u{1F535}",cyan:"\u{1F535}",coral:"\u{1F534}",salmon:"\u{1FA77}",salm\u00F3n:"\u{1FA77}",vino:"\u{1F534}",burgundy:"\u{1F534}",guinda:"\u{1F534}",magenta:"\u{1F7E3}",fucsia:"\u{1F7E3}",fuchsia:"\u{1F7E3}",indigo:"\u{1F7E3}"},i=o=>/color|colour|color\s*\/\s*tono/i.test(o||"");window._mkColorDot=function(o,n){const a=_esc;if(!i(o))return`<span style="font-weight:600;">${a(n)}</span>`;const r=(n||"").toLowerCase().trim(),c=t[r],l=r==="blanco"||r==="blanca"||r==="white"||r==="crema"?"#d1d5db":"transparent";return c?`<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};border:1.5px solid ${l};flex-shrink:0;"></span>${a(n)}</span>`:`<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${n.startsWith("#")||/^(rgb|hsl)/.test(n)?n:"#d1d5db"};border:1.5px solid #e5e7eb;flex-shrink:0;"></span>${a(n)}</span>`},window._mkColorEmoji=function(o,n){if(!i(o))return n;const a=(n||"").toLowerCase().trim(),r=e[a];return r?`${r} ${n}`:n}})(),window._normSearch=function(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")},window._money=function(t){return Math.round((parseFloat(t)||0)*100)/100},window._sumLineas=function(t,e,i){return e=e||"price",i=i||"quantity",t.reduce((o,n)=>{const a=Math.round((parseFloat(n[e])||0)*100)*(parseInt(n[i])||1);return o+a},0)/100},window._ajustarStockId=window._ajustarStockId??null,window.currentVariants=window.currentVariants??[],window.currentProductImage=window.currentProductImage??null,window.currentProductImageFile=window.currentProductImageFile??null,window.modoEdicion=window.modoEdicion??!1,window.edicionProductoId=window.edicionProductoId??null,window._invSortCol=window._invSortCol??null,window._invSortDir=window._invSortDir??"asc",window._invCurrentPage=window._invCurrentPage??1,window._invPageSize=window._invPageSize??10,window.stockMovements=window.stockMovements??window.stockMovimientos??[],window._kitComponentes=window._kitComponentes??[];function saveStockMovements(){window.stockMovimientos=window.stockMovements,sbSave("stockMovimientos",window.stockMovements)}function registrarMovimiento({productoId:t,productoNombre:e,tipo:i,cantidad:o,motivo:n,stockAntes:a,stockDespues:r}){const c=mkId(),l=new Date().toISOString();window.stockMovements.unshift({id:c,fecha:_fechaHoy()+"T"+new Date().toLocaleTimeString("es-MX"),productoId:t,productoNombre:e,tipo:i,cantidad:o,motivo:n||"",stockAntes:a,stockDespues:r}),window.stockMovements.length>500&&(window.stockMovements.splice(500),window.stockMovimientos=window.stockMovements),saveStockMovements(),typeof db<"u"&&db&&db.from("stock_movements").insert({id:c,producto_id:String(t),producto_nombre:e||null,tipo:i,cantidad:o,motivo:n||null,stock_antes:a!=null?Number(a):null,stock_despues:r!=null?Number(r):null,fecha:l}).then(({error:d})=>{d&&console.warn("[Stock] Fallo insert stock_movements:",d.message)})}window.registrarMovimiento=registrarMovimiento;function _genId(){return"p"+mkId().replace(/-/g,"")}function getStockEfectivo(t){const e=t.variants&&t.variants.length>0,i=t.mpComponentes&&t.mpComponentes.length>0;function o(){if(t.mpComponentes.every(r=>{const c=(window.products||[]).find(l=>String(l.id)===String(r.id));return c&&c.tipo==="servicio"}))return 0;let a=1/0;return t.mpComponentes.forEach(r=>{const c=(window.products||[]).find(l=>String(l.id)===String(r.id));if(c&&c.tipo!=="servicio"){const l=parseFloat(c.stock)||0,d=parseFloat(r.qty)||1,s=parseFloat(r.rendimientoPorHoja)||1,p=Math.floor(l/d*s);p<a&&(a=p)}}),a===1/0?0:a}if(e){const n=t.variants.reduce((a,r)=>a+(parseInt(r.qty)||0),0);return i?n+o():n}if(i){if(t.mpComponentes.every(c=>{const l=(window.products||[]).find(d=>String(d.id)===String(c.id));return l&&l.tipo==="servicio"}))return parseInt(t.stock)||0;const a=parseInt(t.stock)||0,r=o();return a+r}return parseInt(t.stock)||0}window.getStockEfectivo=getStockEfectivo;function _normVariante(t){return(t||"").replace(/\s*:\s*/g,":").trim().toLowerCase()}window._normVariante=_normVariante;let _listaComprasModo="ahora";function mostrarListaCompras(t){t||(window._listaComprasChecked={});const e=["confirmado","pago","produccion","envio","salida","retirar"],i=new Date;i.setHours(0,0,0,0);const o=new Date(i);o.setDate(o.getDate()+7);const n=(window.pedidos||[]).filter(d=>{if(!e.includes(d.status)||d.inventarioDescontado)return!1;if(_listaComprasModo==="ahora"){if(d.status==="produccion"||d.status==="salida"||d.status==="retirar")return!0;if(!d.entrega)return!1;const s=new Date(d.entrega+"T00:00:00");return s>=i&&s<=o}return!0}),a={};n.forEach(d=>{(d.productosInventario||[]).forEach(s=>{const p=(s.id||s.name)+"|"+(s.variante||s.variant||"");(s.id||s.name)&&(a[p]||(a[p]={id:s.id,nombre:s.name||s.nombre,variante:s.variante||s.variant||"",necesario:0,pedidosRef:[]}),a[p].necesario+=s.quantity||s.cantidad||1,a[p].pedidosRef.push(d.folio||d.id))})});const r=Object.values(a).map(d=>{const s=(window.products||[]).find(u=>String(u.id)===String(d.id));let p=0;if(s)if(d.variante){const u=(s.variants||[]).find(m=>_normVariante(m.value)===_normVariante(d.variante)||_normVariante(`${m.type}:${m.value}`)===_normVariante(d.variante));p=u?u.qty||0:getStockEfectivo(s)}else p=typeof getStockEfectivo=="function"?getStockEfectivo(s):s.stock||0;const f=Math.max(0,d.necesario-p);return{...d,disponible:p,faltan:f}}).sort((d,s)=>s.faltan-d.faltan);r.forEach(d=>{const s=(window.products||[]).find(p=>String(p.id)===String(d.id));d.costoUnit=s&&parseFloat(s.cost)||0,d.costoTotal=d.faltan*d.costoUnit});const c=document.getElementById("listaComprasContent");if(!c)return;const l=`
        <div style="display:flex;gap:0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:12px;font-size:.78rem;">
            <button onclick="_listaComprasModo='ahora';mostrarListaCompras(true)" style="flex:1;padding:7px 0;border:none;cursor:pointer;font-weight:700;background:${_listaComprasModo==="ahora"?"#C5973B":"#fff"};color:${_listaComprasModo==="ahora"?"#fff":"#6b7280"};">\u{1F525} Necesitas ahora</button>
            <button onclick="_listaComprasModo='pipeline';mostrarListaCompras(true)" style="flex:1;padding:7px 0;border:none;cursor:pointer;font-weight:700;background:${_listaComprasModo==="pipeline"?"#C5973B":"#fff"};color:${_listaComprasModo==="pipeline"?"#fff":"#6b7280"};">\u{1F4CB} Pipeline completo</button>
        </div>`;if(r.length===0)c.innerHTML=l+'<p style="color:#9ca3af;text-align:center;padding:32px 0;font-size:.875rem;">No hay pedidos activos con materiales asignados.</p>';else{const d=r.filter(u=>u.faltan>0),s=r.filter(u=>u.faltan===0);let p=l;if(d.length>0){const u=d.reduce((m,g)=>m+g.costoTotal,0);p+=`<p style="font-size:.7rem;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">\u26A0\uFE0F Necesitas comprar (${d.length})</p>`,p+=`<table style="width:100%;border-collapse:collapse;font-size:.78rem;margin-bottom:4px;">
                <thead><tr style="background:#fef9c3;color:#92400e;font-size:.68rem;">
                    <th style="padding:6px 8px;text-align:left;border-bottom:1px solid #fcd34d;">Producto</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Stock</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Necesitas</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Faltan</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo c/u</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo est.</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">\u2713</th>
                </tr></thead><tbody>`,d.forEach(m=>{const g=(m.id||m.nombre)+"|"+(m.variante||""),w=!!window._listaComprasChecked[g],y=w?"background:#f0fdf4;text-decoration:line-through;color:#6b7280;":"background:#fef3c7;",b=g.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),x=(window.products||[]).find(v=>String(v.id)===String(m.id)),h=x&&x.proveedorUrl?x.proveedorUrl.trim():"",k=h?`<a href="${_esc(h)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:3px;font-size:.65rem;padding:2px 6px;border-radius:999px;background:#dbeafe;color:#1d4ed8;text-decoration:none;font-weight:700;">\u{1F6D2} Comprar</a>`:"";p+=`<tr style="${y}border-bottom:1px solid #fde68a;">
                    <td style="padding:8px 8px;">
                        <span style="font-weight:700;">${_esc(m.nombre)}</span>${m.variante?` <span style="font-weight:400;color:#92400e;font-size:.7rem;">(${_esc(m.variante)})</span>`:""}
                        <div style="font-size:.65rem;color:#9ca3af;">Pedidos: ${[...new Set(m.pedidosRef)].map(v=>_esc(v)).join(", ")}</div>
                        ${k}
                    </td>
                    <td style="text-align:center;padding:8px 6px;">${m.disponible}</td>
                    <td style="text-align:center;padding:8px 6px;">${m.necesario}</td>
                    <td style="text-align:center;padding:8px 6px;font-weight:900;color:#d97706;">${m.faltan}</td>
                    <td style="text-align:right;padding:8px 6px;">${m.costoUnit>0?"$"+m.costoUnit.toFixed(2):"\u2014"}</td>
                    <td style="text-align:right;padding:8px 6px;font-weight:700;color:#b45309;">${m.costoTotal>0?"$"+m.costoTotal.toFixed(2):"\u2014"}</td>
                    <td style="text-align:center;padding:8px 6px;">
                        ${w?'<span style="color:#16a34a;font-size:.75rem;font-weight:700;">\u2713 Comprado</span>':`<input type="checkbox" onchange="window._lcToggleComprado('${b}')" style="width:16px;height:16px;cursor:pointer;">`}
                    </td>
                </tr>`}),p+=`</tbody><tfoot><tr style="background:#fef9c3;font-weight:800;color:#b45309;">
                <td colspan="5" style="padding:8px 8px;text-align:right;font-size:.78rem;">\u{1F4B0} Total estimado:</td>
                <td style="padding:8px 6px;text-align:right;font-size:.85rem;">$${u.toFixed(2)}</td>
                <td></td>
            </tr></tfoot></table>`}s.length>0&&(p+=`<p style="font-size:.7rem;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;">\u2705 Stock suficiente (${s.length})</p>`,p+=s.map(u=>`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:4px;">
                    <p style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(u.nombre)}${u.variante?` <span style="font-weight:400;color:#6b7280;">(${_esc(u.variante)})</span>`:""}</p>
                    <p style="font-size:.78rem;color:#16a34a;font-weight:700;">Stock: ${u.disponible} / Necesitas: ${u.necesario}</p>
                </div>`).join("")),d.length===0&&(p='<p style="color:#16a34a;text-align:center;padding:12px 0;font-size:.9rem;font-weight:700;">\u2705 Tienes stock suficiente para todos los pedidos activos.</p>'+p),d.length>0&&(p+=`<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
                <button onclick="window._lcWhatsApp()" style="flex:1;min-width:160px;background:#25d366;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">\u{1F4F2} Enviar por WhatsApp al proveedor</button>
                <button onclick="window._lcExportCSV()" style="flex:1;min-width:140px;background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar CSV</button>
            </div>`);const f=(window.products||[]).filter(u=>(!u.tipo||u.tipo==="producto"||u.tipo==="producto_interno"||u.tipo==="pack")&&Array.isArray(u.mpComponentes)&&u.mpComponentes.length>0).map(u=>({prod:u,producibles:typeof calcularProducibles=="function"?calcularProducibles(u)??0:0})).sort((u,m)=>m.producibles-u.producibles).slice(0,5);if(f.length>0){let u=`<div style="margin-top:20px;padding:14px 16px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;">
                <p style="font-size:.7rem;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">\u{1F3ED} Top 5 m\xE1s producibles ahora</p>
                <div style="display:flex;flex-direction:column;gap:6px;">`;f.forEach(({prod:m,producibles:g})=>{const w=g>=5?"#16a34a":g>=1?"#d97706":"#dc2626",y=g>=5?"#d1fae5":g>=1?"#fef3c7":"#fee2e2";u+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
                    <span style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(m.name)}</span>
                    <span style="padding:2px 10px;border-radius:99px;font-size:.75rem;font-weight:700;background:${y};color:${w};">${g} uds</span>
                </div>`}),u+="</div></div>",p+=u}c.innerHTML=p}window._lcToggleComprado=function(d){window._listaComprasChecked||(window._listaComprasChecked={}),window._listaComprasChecked[d]=!0,mostrarListaCompras(!0)},window._lcWhatsApp=function(){const d=r.filter(m=>m.faltan>0);if(!d.length)return;const s=_fechaHoy(),p=d.reduce((m,g)=>m+g.costoTotal,0);let f=`\u{1F4E6} Lista de compras Maneki Store
Fecha: ${s}

`;d.forEach(m=>{const g=m.nombre+(m.variante?` (${m.variante})`:"");m.costoUnit>0?f+=`\u2022 ${g}: ${m.faltan} uds ($${m.costoUnit.toFixed(2)} c/u = $${m.costoTotal.toFixed(2)})
`:f+=`\u2022 ${g}: ${m.faltan} uds
`}),p>0&&(f+=`
\u{1F4B0} Total estimado: $${p.toFixed(2)}`);const u="https://api.whatsapp.com/send?text="+encodeURIComponent(f);window.open(u,"_blank")},window._lcExportCSV=function(){const d=r.filter(w=>w.faltan>0),s=["Producto","Variante","Cantidad requerida","Stock actual","Faltante","Costo unitario","Costo total"],p=d.map(w=>[w.nombre,w.variante||"",w.necesario,w.disponible,w.faltan,w.costoUnit.toFixed(2),w.costoTotal.toFixed(2)]);let f=s.join(",")+`
`;p.forEach(w=>{f+=w.map(y=>`"${String(y).replace(/"/g,'""')}"`).join(",")+`
`});const u=new Blob([f],{type:"text/csv;charset=utf-8;"}),m=URL.createObjectURL(u),g=document.createElement("a");g.href=m,g.download=`lista-compras-${_fechaHoy()}.csv`,g.click(),URL.revokeObjectURL(m)},openModal("listaComprasModal")}window.mostrarListaCompras=mostrarListaCompras,window._listaComprasModo=_listaComprasModo;function syncStockFromVariants(t){t.variants&&t.variants.length>0&&(t.stock=t.variants.reduce((e,i)=>e+(parseInt(i.qty)||0),0))}function setupImageUpload(){["productImage","mpProductImage"].forEach(t=>{const e=document.getElementById(t);!e||e._mkBound||(e._mkBound=!0,e.addEventListener("change",function(i){const o=i.target.files[0];if(!o)return;window.currentProductImageFile=o;const n=new FileReader,a=t==="mpProductImage";n.onload=r=>{const c=document.getElementById(a?"mpPreviewImg":"previewImg"),l=document.getElementById(a?"mpImagePreview":"imagePreview");c&&(c.src=r.target.result),l&&l.classList.remove("hidden")},n.readAsDataURL(o)}))})}window.setupImageUpload=setupImageUpload;function sortInventory(t){window._invSortDir=window._invSortCol===t&&window._invSortDir==="asc"?"desc":"asc",window._invSortCol=t,window._invCurrentPage=1,document.querySelectorAll(".sortable-th").forEach(e=>{e.classList.remove("asc","desc"),e.getAttribute("onclick")===`sortInventory('${t}')`&&e.classList.add(window._invSortDir)}),renderInventoryTable()}window.sortInventory=sortInventory;let _lastTelegramAlert=window._lastTelegramStockAlert||0;function _pedidosQueUsanMP(t){const e=["confirmado","pago","produccion","envio","salida","retirar","pendiente"];return(window.pedidos||[]).filter(i=>e.includes(i.status||"")?(i.productosInventario||[]).some(o=>{const n=(window.products||[]).find(a=>String(a.id)===String(o.id));return n?(n.mpComponentes||[]).some(a=>String(a.id)===String(t)):!1}):!1)}window._pedidosQueUsanMP=_pedidosQueUsanMP;function checkStockAlerts(){const t=window.products||[],e=t.filter(l=>getStockEfectivo(l)===0),i=t.filter(l=>{const d=getStockEfectivo(l);return d>0&&d<=(l.puntoReorden??l.stockMin??5)}),o=i.filter(l=>l.tipo==="materia_prima"),n=e.filter(l=>l.tipo==="materia_prima");[...n,...o].forEach(l=>{const d=_pedidosQueUsanMP(l.id);if(d.length>0){const s=d.map(p=>p.folio||p.id).slice(0,5).join(", ");manekiToastExport(`\u{1F6A8} URGENTE: "${l.name}" con stock cr\xEDtico \u2014 afecta pedidos: ${s}`,"err")}}),e.length&&manekiToastExport(`\u{1F534} ${e.length} producto(s) agotado(s)`,"warn"),i.length&&manekiToastExport(`\u26A0\uFE0F ${i.length} producto(s) con stock bajo`,"warn"),n.length?manekiToastExport(`\u{1F3ED} ${n.length} materia(s) prima(s) AGOTADAS \u2014 producci\xF3n bloqueada`,"err"):o.length&&manekiToastExport(`\u{1F3ED} ${o.length} materia(s) prima(s) con stock bajo`,"warn");const r=document.getElementById("sidebarBadgeMP");if(r){const l=o.length+n.length;l>0?(r.textContent=l,r.style.display="inline-block"):r.style.display="none"}(e.length>0||i.length>0)&&_notificarStockTelegram({agotados:e,bajos:i,mpAgotadas:n,mpBajas:o}),(n.length||o.length)&&_alertaStockWA(n,o)}window.checkStockAlerts=checkStockAlerts;async function _notificarStockTelegram({agotados:t,bajos:e,mpAgotadas:i,mpBajas:o}){const n=Date.now();if(n-_lastTelegramAlert<3600*1e3)return;window._lastTelegramStockAlert=n,_lastTelegramAlert=n;const a=window.storeConfig||{},r=a.telegramBotToken;if(!r){console.warn("Telegram: telegramBotToken no configurado, omitiendo notificaci\xF3n de stock.");return}const c=[a.telegramChatId1,a.telegramChatId2].filter(Boolean);if(!c.length)return;const l=[];t.length&&(l.push(`\u{1F534} *Agotados (${t.length}):*`),t.slice(0,10).forEach(s=>l.push(`  \u2022 ${s.name} \u2014 stock: 0`))),e.length&&(l.push(`\u26A0\uFE0F *Stock bajo (${e.length}):*`),e.slice(0,10).forEach(s=>l.push(`  \u2022 ${s.name} \u2014 stock: ${s.stock} (m\xEDn: ${s.stockMin||5})`))),i.length&&l.push(`\u{1F3ED} *MP AGOTADAS \u2014 producci\xF3n bloqueada:* ${i.map(s=>s.name).join(", ")}`);const d=`\u{1F4E6} *Alerta de inventario \u2014 Maneki Store*

${l.join(`
`)}`;for(const s of c)try{await fetch(`https://api.telegram.org/bot${r}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:s,text:d,parse_mode:"Markdown"})})}catch(p){console.warn("Telegram stock alert error:",p)}}window._notificarStockTelegram=_notificarStockTelegram;function _alertaStockWA(t,e){const i=document.getElementById("_mkStockWAAlert");i&&i.remove();const o=[];t.length&&o.push(`\u{1F534} Agotadas: ${t.map(r=>r.name).join(", ")}`),e.length&&o.push(`\u26A0\uFE0F Stock bajo: ${e.map(r=>r.name).join(", ")}`);const n=encodeURIComponent(`\u{1F3ED} *Maneki \u2014 Alerta de Inventario*

${o.join(`
`)}

_Reabastece pronto para no detener producci\xF3n._`),a=document.createElement("div");a.id="_mkStockWAAlert",a.style.cssText="position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;border:2px solid #25D366;border-radius:14px;padding:14px 18px;box-shadow:0 4px 24px rgba(0,0,0,0.15);max-width:300px;font-size:13px;line-height:1.4;",a.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#1f2937;font-size:14px;">\u{1F3ED} MP cr\xEDtica</strong>
            <button onclick="document.getElementById('_mkStockWAAlert').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;line-height:1;">\xD7</button>
        </div>
        <div style="color:#6b7280;margin-bottom:10px;">${o.map(r=>_esc(r)).join("<br>")}</div>
        <button onclick="window.open('https://api.whatsapp.com/send?text=${n}','_blank')" style="width:100%;padding:8px 12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">
            \u{1F4F1} Avisar por WhatsApp
        </button>`,document.body.appendChild(a)}window._alertaStockWA=_alertaStockWA;function exportarInventarioCSV(){const t=["SKU","Nombre","Categor\xEDa","Tipo","Costo","Precio","Stock","Stock M\xEDn","Margen%","Producibles","Proveedor","Proveedor URL","Estado","Tags","Variantes","\xDAltima actualizaci\xF3n"],e=(window.products||[]).map(r=>{const c=((window.categories||[]).find(u=>u.id===r.category)||{}).name||r.category,l=r.cost&&r.price?((r.price-r.cost)/r.price*100).toFixed(0)+"%":"",d=typeof getStockEfectivo=="function"?getStockEfectivo(r):r.stock||0,s=d===0?"Agotado":d<=(r.stockMin||5)?"Bajo Stock":"Disponible",p=typeof calcularProducibles=="function"?calcularProducibles(r)??"":"",f=r.updatedAt?new Date(r.updatedAt).toLocaleString("es-MX"):"";return[r.sku,r.name,c,r.tipo||"producto",r.cost||0,r.price||0,d,r.stockMin||5,l,p,r.proveedor||"",r.proveedorUrl||"",s,(r.tags||[]).join("; "),(r.variants||[]).map(u=>`${u.type}:${u.value}(${u.qty??0})`).join("; "),f].map(u=>`"${String(u).replace(/"/g,'""')}"`).join(",")}),i=[t.join(","),...e].join(`
`),o=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(o),a=document.createElement("a");a.href=n,a.download=`inventario_${_fechaHoy()}.csv`,a.click(),URL.revokeObjectURL(n),manekiToastExport("\u{1F4E5} Inventario exportado como CSV","ok")}window.exportarInventarioCSV=exportarInventarioCSV;function editarStockInline(t){const e=(window.products||[]).find(n=>String(n.id)===String(t));if(!e)return;const i=document.getElementById(`stock-cell-${t}`);if(!i)return;i.innerHTML=`
        <div style="display:flex;align-items:center;gap:4px;">
            <input id="inline-stock-${t}" type="number" min="0" value="${typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0}"
                style="width:60px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;"
                onkeydown="if(event.key==='Enter')confirmarStockInline('${t}');if(event.key==='Escape')renderInventoryTable();">
            <button onclick="confirmarStockInline('${t}')"
                style="width:24px;height:24px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">\u2713</button>
            <button onclick="renderInventoryTable()"
                style="width:24px;height:24px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;cursor:pointer;font-size:12px;">\u2715</button>
        </div>`;const o=document.getElementById(`inline-stock-${t}`);o&&o.focus()}window.editarStockInline=editarStockInline;function confirmarStockInline(t){const e=(window.products||[]).find(a=>String(a.id)===String(t));if(!e)return;const i=document.getElementById(`inline-stock-${t}`);if(!i)return;const o=parseInt(i.value);if(isNaN(o)||o<0){manekiToastExport("Stock inv\xE1lido","err");return}const n=typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0;if(e.stock=o,Array.isArray(e.variants)&&e.variants.length>0){const a=o-n;a!==0&&e.variants[0]&&(e.variants[0].qty=Math.max(0,(parseInt(e.variants[0].qty)||0)+a)),typeof syncStockFromVariants=="function"&&syncStockFromVariants(e)}registrarMovimiento({productoId:e.id,productoNombre:e.name,tipo:"ajuste",cantidad:o-n,motivo:"Edici\xF3n inline",stockAntes:n,stockDespues:o}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),manekiToastExport(`\u2705 Stock de "${e.name}" \u2192 ${o}`,"ok")}window.confirmarStockInline=confirmarStockInline;function poblarFiltroProveedores(){const t=document.getElementById("inventoryProveedorFilter");if(!t)return;const e=t.value,i=[...new Set((window.products||[]).map(o=>(o.proveedor||"").trim()).filter(Boolean))].sort((o,n)=>o.localeCompare(n,"es"));t.innerHTML='<option value="">\u{1F3EA} Todos los proveedores</option>'+i.map(o=>`<option value="${_esc(o)}"${e===o?"selected":""}>${_esc(o)}</option>`).join("")}window.poblarFiltroProveedores=poblarFiltroProveedores;function invInlineEditStock(t,e){const i=(window.products||[]).find(r=>String(r.id)===String(t));if(!i)return;const o=parseFloat(i.stock)||0,n=document.createElement("input");n.type="number",n.min="0",n.step="0.01",n.value=o,n.style.cssText="width:60px;padding:2px 6px;border:1.5px solid #7c3aed;border-radius:6px;font-size:.85rem;text-align:center;";const a=async()=>{const r=parseFloat(n.value);if(!isNaN(r)&&r!==o){const c=o;i.stock=r,registrarMovimiento({productoId:i.id,productoNombre:i.name,tipo:"ajuste",cantidad:r-c,motivo:"Edici\xF3n inline",stockAntes:c,stockDespues:r}),saveProducts(),manekiToastExport(`Stock actualizado: ${i.name} \u2192 ${r}`,"ok")}renderInventoryTable()};n.addEventListener("blur",a),n.addEventListener("keydown",r=>{r.key==="Enter"&&n.blur(),r.key==="Escape"&&(n.value=o,n.blur())}),e.innerHTML="",e.appendChild(n),n.focus(),n.select()}window.invInlineEditStock=invInlineEditStock;function invInlineEditPrice(t,e){const i=(window.products||[]).find(r=>String(r.id)===String(t));if(!i)return;const o=parseFloat(i.price)||0,n=document.createElement("input");n.type="number",n.min="0",n.step="0.01",n.value=o.toFixed(2),n.style.cssText="width:80px;padding:2px 6px;border:1.5px solid #C5973B;border-radius:6px;font-size:.85rem;text-align:center;font-weight:700;";const a=()=>{const r=parseFloat(n.value);!isNaN(r)&&r>=0&&r!==o&&(i.historialPrecios||(i.historialPrecios=[]),i.historialPrecios.push({precio:o,fecha:_fechaHoy()}),i.price=r,typeof saveProducts=="function"&&saveProducts(),typeof manekiToastExport=="function"&&manekiToastExport(`Precio actualizado: ${i.name} \u2192 $${r.toFixed(2)}`,"ok")),typeof renderInventoryTable=="function"&&renderInventoryTable()};n.addEventListener("blur",a),n.addEventListener("keydown",r=>{r.key==="Enter"&&n.blur(),r.key==="Escape"&&(n.value=o.toFixed(2),n.blur())}),e.innerHTML="",e.appendChild(n),n.focus(),n.select()}window.invInlineEditPrice=invInlineEditPrice;async function registrarMerma(t){const e=(window.products||[]).find(a=>String(a.id)===String(t));if(!e){manekiToastExport("Producto no encontrado","err");return}const i=await new Promise(a=>{const r=document.getElementById("mkMermaModal");r&&r.remove();const c=document.createElement("div");c.id="mkMermaModal",c.className="mk-modal-overlay",c.innerHTML=`<div class="mk-modal-box" style="max-width:380px">
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">\u{1F4C9} Registrar Merma</h3>
            <label style="font-size:.8rem;color:#6b7280;">Cantidad (${e.unidad||"pza"})</label>
            <input id="mkMermaCant" type="number" min="0.01" step="0.01" value="1" class="mk-input w-full mt-1 mb-3" placeholder="Ej: 2.5">
            <label style="font-size:.8rem;color:#6b7280;">Motivo</label>
            <input id="mkMermaMotivo" type="text" class="mk-input w-full mt-1 mb-4" value="Material da\xF1ado" placeholder="Ej: Material da\xF1ado">
            <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkMermaModal').remove();window._mkMermaResolve(null)">Cancelar</button>
                <button type="button" class="mk-btn-primary" onclick="window._mkMermaResolve({cantidad:document.getElementById('mkMermaCant').value,motivo:document.getElementById('mkMermaMotivo').value})">Confirmar</button>
            </div>
        </div>`,window._mkMermaResolve=l=>{c.remove(),a(l)},document.body.appendChild(c),setTimeout(()=>document.getElementById("mkMermaCant")?.focus(),50)});if(!i||!i.cantidad||parseFloat(i.cantidad)<=0)return;const o=parseFloat(i.cantidad);if(!o||o<=0){manekiToastExport("\u26A0\uFE0F Cantidad inv\xE1lida","warn");return}const n=i.motivo||"Sin especificar";if(Array.isArray(e.variants)&&e.variants.length){const a=e.variants.reduce((d,s)=>d+(parseFloat(s.qty)||0),0),r=[...e.variants].sort((d,s)=>(parseFloat(s.qty)||0)-(parseFloat(d.qty)||0));let c=o;for(const d of r){if(c<=0)break;const s=e.variants.find(u=>u.type===d.type&&u.value===d.value);if(!s)continue;const p=parseFloat(s.qty)||0,f=Math.min(p,c);s.qty=Math.max(0,p-f),c-=f}typeof syncStockFromVariants=="function"&&syncStockFromVariants(e);const l=e.variants.reduce((d,s)=>d+(parseFloat(s.qty)||0),0);registrarMovimiento({productoId:e.id,productoNombre:e.name,tipo:"merma",cantidad:-o,motivo:n||"Sin especificar",stockAntes:a,stockDespues:l})}else{const a=parseFloat(e.stock)||0,r=Math.max(0,a-o);e.stock=r,registrarMovimiento({productoId:e.id,productoNombre:e.name,tipo:"merma",cantidad:-o,motivo:n||"Sin especificar",stockAntes:a,stockDespues:r})}saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),manekiToastExport(`\u{1F4C9} Merma: -${o} ${e.unidad||"pza"} de "${e.name}"`,"warn")}window.registrarMerma=registrarMerma;function addVariant(){const t=document.getElementById("variantType"),e=document.getElementById("variantValue"),i=t?t.value.trim():"",o=e?e.value.trim():"";if(!i||!o){typeof manekiToastExport=="function"&&manekiToastExport("Por favor completa tipo y valor de la variante","warn");return}if((window.currentVariants||[]).some(a=>a.type===i&&a.value===o)){typeof manekiToastExport=="function"&&manekiToastExport(`\u26A0\uFE0F La variante ${i}: ${o} ya existe`,"warn");return}window.currentVariants.push({type:i,value:o,qty:0}),renderVariantsList(),t&&(t.value=""),e&&(e.value=""),t&&t.focus()}window.addVariant=addVariant;function updateVariantQty(t,e){const i=parseInt(e);!isNaN(i)&&i>=0&&(window.currentVariants[t].qty=i)}window.updateVariantQty=updateVariantQty;function renderVariantsList(){const t=document.getElementById("variantsList");if(t){if(!window.currentVariants||window.currentVariants.length===0){t.innerHTML='<span class="text-xs text-gray-400 italic">Sin variantes agregadas</span>';return}t.innerHTML=window.currentVariants.map((e,i)=>`
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
        </div>`).join("")}}window.renderVariantsList=renderVariantsList;function removeVariant(t){window.currentVariants.splice(t,1),renderVariantsList()}window.removeVariant=removeVariant;function descontarStockVariante(t,e,i,o){const n=(window.products||[]).find(r=>String(r.id)===String(t));if(!n||!n.variants)return;const a=n.variants.find(r=>r.type===e&&r.value===i);a&&(a.qty=Math.max(0,(a.qty||0)-o)),syncStockFromVariants(n),saveProducts()}window.descontarStockVariante=descontarStockVariante;function generateSKU(t){const i={tazas:"TAZ",llaveros:"LLV",libretas:"LIB",peluches:"PEL",otros:"OTR"}[t]||"PRD",o=(window.products||[]).filter(a=>a.category===t&&a.sku&&a.sku.startsWith(`MNK-${i}-`)).map(a=>parseInt((a.sku||"").split("-").pop())||0),n=(o.length?Math.max(...o):0)+1;return`MNK-${i}-${String(n).padStart(3,"0")}`}window.generateSKU=generateSKU;function skuEsUnico(t,e){const i=t.toLowerCase();return!(window.products||[]).some(o=>{if(!o.sku||o.sku.toLowerCase()!==i||e&&String(o.id)===String(e))return!1;if(e){const n=(window.products||[]).find(a=>String(a.id)===String(e));if(n&&n.sku&&n.sku.toLowerCase()===i)return!1}return!0})}window._ptGaleriaUrls=window._ptGaleriaUrls??[],window._ptGaleriaFiles=window._ptGaleriaFiles??[];function ptRenderGaleria(){const t=document.getElementById("ptGaleriaPreview"),e=document.getElementById("ptGaleriaVacia");if(!t)return;const i=window._ptGaleriaUrls||[],o=window._ptGaleriaFiles||[],n=i.length+o.length;e&&(e.style.display=n?"none":"block"),[...t.children].forEach(a=>{a.id!=="ptGaleriaVacia"&&a.remove()}),i.forEach((a,r)=>{const c=document.createElement("div");c.style="position:relative;width:120px;height:120px;",c.innerHTML=`<img src="${a}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #e5e7eb;">
            <button type="button" onclick="ptEliminarFotoGaleria('url',${r})"
                style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.75rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;">\u2715</button>`,t.appendChild(c)}),o.forEach((a,r)=>{const c=document.createElement("div");c.style="position:relative;width:120px;height:120px;",c.dataset.fileIdx=r;const l=document.createElement("img");l.style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #C5973B;opacity:.85;";const d=new FileReader;d.onload=p=>{l.src=p.target.result},d.readAsDataURL(a);const s=document.createElement("button");s.type="button",s.innerHTML="\u2715",s.style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.7rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;",s.onclick=()=>ptEliminarFotoGaleria("file",r),c.appendChild(l),c.appendChild(s),t.appendChild(c)})}window.ptRenderGaleria=ptRenderGaleria;function ptAgregarFotosGaleria(t){if(!t||!t.length)return;const e=20,i=(window._ptGaleriaUrls||[]).length+(window._ptGaleriaFiles||[]).length,o=e-i;if(o<=0){manekiToastExport(`Ya tienes ${e} fotos en la galer\xEDa`,"warn");return}const n=Array.from(t).slice(0,o);window._ptGaleriaFiles=[...window._ptGaleriaFiles||[],...n],ptRenderGaleria();const a=document.getElementById("ptGaleriaInput");a&&(a.value="")}window.ptAgregarFotosGaleria=ptAgregarFotosGaleria;function ptEliminarFotoGaleria(t,e){t==="url"?(window._ptGaleriaUrls||[]).splice(e,1):(window._ptGaleriaFiles||[]).splice(e,1),ptRenderGaleria()}window.ptEliminarFotoGaleria=ptEliminarFotoGaleria;function openAddProductModal(){injectPtModal(),window.modoEdicion=!1,window.edicionProductoId=null,window.currentVariants=[],window.currentProductImage=null,window.currentProductImageFile=null,window._ptMpComponentes=[],window._ptVariants=[],window._ptTagsActuales=[],window._tagsActuales=[],window._ptGaleriaUrls=[],window._ptGaleriaFiles=[];const t=document.getElementById("ptForm");t&&t.reset();const e=document.getElementById("ptImagePreview");e&&e.classList.add("hidden"),renderPtMpList(),renderVariantsListPt(),recalcularCostoPt(),ptRenderGaleria(),typeof updateCategorySelects=="function"&&updateCategorySelects();const i=document.querySelector("#ptModal h3");i&&(i.textContent="\u{1F4E6} Nuevo Producto Terminado");const o=document.getElementById("ptSubmitBtn");o&&(o.textContent="\u2705 Agregar Producto"),typeof openModal=="function"&&openModal("ptModal")}window.openAddProductModal=openAddProductModal;function closePtModal(){typeof closeModal=="function"&&closeModal("ptModal");const t=document.getElementById("ptForm");t&&t.reset(),window.modoEdicion=!1,window.edicionProductoId=null,window.currentVariants=[],window.currentProductImage=null,window.currentProductImageFile=null,window._ptMpComponentes=[],window._ptVariants=[],window._ptTagsActuales=[],window._tagsActuales=[],window._ptGaleriaUrls=[],window._ptGaleriaFiles=[]}window.closePtModal=closePtModal;function closeAddProductModal(){closePtModal()}window.closeAddProductModal=closeAddProductModal,window.openPtModal=openAddProductModal,window.openMpModal=function(){typeof window.injectMpModal=="function"&&window.injectMpModal(),typeof openModal=="function"&&openModal("mpModal")},window.openSvcModal=function(){typeof window.injectSvcModal=="function"&&window.injectSvcModal(),typeof openModal=="function"&&openModal("svcModal")};function parseCsvLine(t){const e=[];let i="",o=!1;for(let n=0;n<t.length;n++){const a=t[n];a==='"'?o&&t[n+1]==='"'?(i+='"',n++):o=!o:a===","&&!o?(e.push(i),i=""):i+=a}return e.push(i),e}window.parseCsvLine=parseCsvLine;async function importarInventarioCSV(t){const e=t.files[0];if(!e)return;const o=(await e.text()).split(`
`).map(l=>l.trim()).filter(Boolean);if(o.length<2){manekiToastExport("\u26A0\uFE0F CSV vac\xEDo o sin datos","warn");return}const n=o[0].replace(/^\uFEFF/,""),a=parseCsvLine(n).map(l=>l.toLowerCase().trim());let r=0,c=0;for(let l=1;l<o.length;l++){const d=parseCsvLine(o[l]),s={};if(a.forEach((b,x)=>{s[b]=(d[x]||"").trim()}),!s.nombre){c++;continue}const p=(s.tipo||"pt").toLowerCase(),f=parseFloat(s.costo)||0,u=parseFloat(s.precio)||0,m=parseFloat(s.stock)||0,g=parseInt(s.stock_min)||5;if((window.products||[]).find(b=>b.name.trim().toLowerCase()===s.nombre.toLowerCase())){c++;continue}const w=s.sku||"IMP-"+mkId().split("-")[0].toUpperCase(),y={id:mkId(),name:s.nombre,sku:w,cost:f,price:u,stock:m,stockMin:g,proveedor:s.proveedor||"",notas:s.notas||"",image:p==="mp"||p==="materia_prima"?"\u{1F3ED}":p==="svc"||p==="servicio"?"\u2699\uFE0F":"\u{1F4E6}",tags:[],historialPrecios:[],historialCostos:[],variants:[]};p==="mp"||p==="materia_prima"?y.tipo="materia_prima":p==="svc"||p==="servicio"?(y.tipo="servicio",y.stock=0):y.tipo=u>0?"producto":"producto_interno",window.products||(window.products=[]),window.products.push(y),r++}r>0?(saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),manekiToastExport(`\u2705 Importados ${r} productos${c>0?` (${c} errores/duplicados omitidos)`:""}`,"ok")):manekiToastExport(`\u26A0\uFE0F No se import\xF3 ning\xFAn producto. ${c} errores/duplicados.`,"warn"),t.value=""}window.importarInventarioCSV=importarInventarioCSV;function descargarTemplateCSV(){const t="tipo,nombre,sku,categoria,costo,precio,stock,stock_min,proveedor,notas",e=["pt,Taza personalizada,,Tazas,45.00,150.00,10,3,Proveedor ABC,Taza blanca 11oz","mp,Vinil blanco mate,,Materiales,15.00,,50,10,Distribuidora XYZ,Hoja 60x30cm","svc,Impresi\xF3n directa,,Servicios,8.00,,0,0,,Por hoja impresa"].join(`
`),i=t+`
`+e,o=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(o),a=document.createElement("a");a.href=n,a.download="template_inventario_maneki.csv",a.click(),URL.revokeObjectURL(n)}window.descargarTemplateCSV=descargarTemplateCSV;async function guardarSnapshotInventario(){if(!window.products||window.products.length===0){manekiToastExport("No hay productos para guardar snapshot","warn");return}window.inventarioSnapshots||(window.inventarioSnapshots=[]);const t=_fechaHoy(),e=window.inventarioSnapshots.find(o=>o.fecha===t);if(e){if(!await showConfirm(`Ya hay un snapshot del ${t}. \xBFReemplazarlo?`))return;const o=window.inventarioSnapshots.indexOf(e);window.inventarioSnapshots.splice(o,1)}const i={fecha:t,hora:new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),totalProductos:window.products.length,valorTotal:window.products.reduce((o,n)=>o+(parseFloat(n.cost)||0)*(parseFloat(n.stock)||0),0),items:window.products.map(o=>({id:o.id,name:o.name,tipo:o.tipo||"pt",stock:o.stock||0,cost:o.cost||0,price:o.price||0,sku:o.sku||""}))};if(window.inventarioSnapshots.unshift(i),window.inventarioSnapshots=window.inventarioSnapshots.slice(0,30),typeof sbSave=="function")sbSave("inventarioSnapshots",window.inventarioSnapshots);else try{localStorage.setItem("inventarioSnapshots",JSON.stringify(window.inventarioSnapshots))}catch{}manekiToastExport(`\u{1F4F8} Snapshot guardado: ${t} \u2014 ${i.totalProductos} productos, $${i.valorTotal.toFixed(2)} en inventario`,"ok")}window.guardarSnapshotInventario=guardarSnapshotInventario;function verSnapshotsInventario(){const t=window.inventarioSnapshots||[];if(!t.length){manekiToastExport("Sin snapshots guardados a\xFAn","warn");return}const e=t.map(o=>`
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
    </div>`,openModal("_snapshotModal")}window.verSnapshotsInventario=verSnapshotsInventario;function exportarSnapshotCSV(t){const e=(window.inventarioSnapshots||[]).find(l=>l.fecha===t);if(!e)return;const i="nombre,tipo,sku,stock,costo,precio",o=e.items.map(l=>[l.name,l.tipo,l.sku,l.stock,l.cost,l.price].map(d=>`"${String(d||"").replace(/"/g,'""')}"`).join(",")),n="\uFEFF"+i+`
`+o.join(`
`),a=new Blob([n],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(a),c=document.createElement("a");c.href=r,c.download=`snapshot_inventario_${t}.csv`,c.click(),URL.revokeObjectURL(r)}window.exportarSnapshotCSV=exportarSnapshotCSV;function abrirBulkEditPrecios(){const t=(window.products||[]).filter(n=>n.tipo!=="materia_prima"&&n.tipo!=="servicio"&&Number(n.price||0)>0);if(t.length===0){manekiToastExport("No hay productos con precio para editar","warn");return}let e=document.getElementById("_bulkEditModal");e||(e=document.createElement("div"),e.id="_bulkEditModal",e.style.cssText="position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;",document.body.appendChild(e));const i=[...new Set(t.map(n=>n.category||n.categoria||"Sin categor\xEDa"))];e.innerHTML=`
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
                    style="flex:2;padding:10px;background:linear-gradient(135deg,var(--mk-gold-500),var(--mk-gold-400));color:#fff;border:none;border-radius:12px;font-size:.85rem;font-weight:700;cursor:pointer;">
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
                ${o.slice(0,30).map(n=>{const a=_calcBulkPrecio(Number(n.price),e,i),r=a-Number(n.price),c=r>0?"#16A34A":r<0?"#DC2626":"#6B7280";return`<tr style="border-bottom:1px solid #F3F4F6;">
                        <td style="padding:6px 10px;font-size:.78rem;color:#374151;">${_esc(n.name)}</td>
                        <td style="padding:6px 10px;font-size:.78rem;color:#6B7280;text-align:right;">$${Number(n.price).toFixed(2)}</td>
                        <td style="padding:6px 10px;font-size:.78rem;font-weight:700;color:${c};text-align:right;">$${a.toFixed(2)}</td>
                    </tr>`}).join("")}
                ${o.length>30?`<tr><td colspan="3" style="padding:6px 10px;font-size:.72rem;color:#9CA3AF;text-align:center;">... y ${o.length-30} m\xE1s</td></tr>`:""}
            </tbody>
        </table>`}window._renderBulkPreview=_renderBulkPreview;async function _aplicarBulkPrecios(){const t=document.getElementById("_bulkTipo")?.value||"pct_up",e=parseFloat(document.getElementById("_bulkValor")?.value||"0"),i=_getBulkProductos();if(!e||e<=0||i.length===0){manekiToastExport("Configura un valor v\xE1lido","warn");return}const o=t==="pct_up"?`+${e}%`:t==="pct_dn"?`-${e}%`:`precio fijo $${e}`;await(typeof showConfirm=="function"?showConfirm(`\xBFAplicar ${o} a ${i.length} producto(s)?`,"Confirmar cambio masivo"):Promise.resolve(confirm(`\xBFAplicar ${o} a ${i.length} producto(s)?`)))&&(i.forEach(a=>{const r=Math.max(.01,_calcBulkPrecio(Number(a.price),t,e));a.historialPrecios||(a.historialPrecios=[]),a.historialPrecios.push({precio:Number(a.price),fecha:_fechaHoy(),motivo:`Bulk: ${o}`}),a.price=parseFloat(r.toFixed(2))}),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof window._rebuildProductMap=="function"&&window._rebuildProductMap(),document.getElementById("_bulkEditModal").style.display="none",manekiToastExport(`\u2705 ${o} aplicado a ${i.length} producto(s)`,"ok"))}window._aplicarBulkPrecios=_aplicarBulkPrecios;function imprimirEtiquetasBatch(t){const e=t?(window.products||[]).filter(n=>t.includes(String(n.id))):(window.products||[]).filter(n=>n.tipo!=="materia_prima"&&n.tipo!=="servicio"&&Number(n.price||0)>0);if(e.length===0){manekiToastExport("No hay productos para imprimir etiquetas","warn");return}const i=e.map(n=>`
        <div style="width:63mm;height:38mm;border:1px solid #ddd;border-radius:6px;padding:5mm 4mm;
                    display:inline-flex;flex-direction:column;justify-content:space-between;
                    margin:2mm;page-break-inside:avoid;box-sizing:border-box;vertical-align:top;">
            <div>
                <div style="font-size:9pt;font-weight:800;color:#1a0533;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.2;">${_esc(n.name)}</div>
                ${n.sku?`<div style="font-size:7pt;color:#9ca3af;margin-top:1mm;">SKU: ${_esc(n.sku)}</div>`:""}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                <div style="font-size:16pt;font-weight:900;color:#C5973B;">$${Number(n.price).toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:2})}</div>
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
        <div class="header no-print">${e.length} etiquetas \xB7 Maneki Store \xB7 <button onclick="window.print()" style="padding:4px 12px;background:#C5973B;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:8pt;">\u{1F5A8}\uFE0F Imprimir</button></div>
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
</div>`,document.body.appendChild(t.firstElementChild)}function _calcPrecio(){const t=parseFloat(document.getElementById("calcCostoMP")?.value)||0,e=parseFloat(document.getElementById("calcHoras")?.value)||0,i=parseFloat(document.getElementById("calcTarifa")?.value)||0,o=parseFloat(document.getElementById("calcMargen")?.value)||0,n=e*i,a=t+n,r=a*(1+o/100),c=document.getElementById("calcResultado"),l=document.getElementById("calcPrecioFinal"),d=document.getElementById("calcDesglose"),s=document.getElementById("calcAplicarBtn");if(a<=0){c&&c.classList.add("hidden"),s&&s.classList.add("hidden");return}const p=r-a;c&&c.classList.remove("hidden"),l&&(l.textContent=`$${r.toFixed(2)}`),d&&(d.textContent=`Mat: $${t.toFixed(2)} + M.O.: $${n.toFixed(2)} + Ganancia: $${p.toFixed(2)}`),s&&_calcPrecioProdId&&s.classList.remove("hidden")}window._calcPrecio=_calcPrecio;function _aplicarPrecioCalculado(){if(!_calcPrecioProdId)return;const t=document.getElementById("calcPrecioFinal");if(!t)return;const e=parseFloat(t.textContent?.replace("$","")||"0");if(!e||e<=0){manekiToastExport("Calcula un precio primero","warn");return}const i=["ptPrice","productPrice","mpPrice"];let o=!1;for(const n of i){const a=document.getElementById(n);if(a){a.value=e.toFixed(2),a.dispatchEvent(new Event("input")),o=!0;break}}if(!o){const n=(window.products||[]).find(a=>String(a.id)===String(_calcPrecioProdId));n&&(n.price=e,saveProducts(),renderInventoryTable())}closeModal("calculadoraPrecioModal"),manekiToastExport(`\u2705 Precio $${e.toFixed(2)} aplicado`,"ok")}window._aplicarPrecioCalculado=_aplicarPrecioCalculado;function abrirCalculadoraPrecio(t){_inyectarCalculadoraModal(),_calcPrecioProdId=t||null;const e=t?(window.products||[]).find(a=>String(a.id)===String(t)):null,i=document.getElementById("calcCostoMP");i&&e&&(i.value=String(parseFloat(e.costo||e.cost||0)||0));const o=document.getElementById("calcResultado");o&&o.classList.add("hidden");const n=document.getElementById("calcAplicarBtn");n&&n.classList.add("hidden"),openModal("calculadoraPrecioModal")}window.abrirCalculadoraPrecio=abrirCalculadoraPrecio;function _registrarCambioHistorialCosto(t,e){const i=parseFloat(t.costo||t.cost||0);if(isNaN(i))return;const o=parseFloat(String(e))||0;if(i===o)return;t.costoHistorial||(t.costoHistorial=[]),t.costoHistorial.length===0&&o>0&&t.costoHistorial.push({fecha:_fechaHoy(),valor:o}),t.costoHistorial.push({fecha:_fechaHoy(),valor:i}),t.costoHistorial.length>20&&(t.costoHistorial=t.costoHistorial.slice(-20));const n=t.costoHistorial;if(n.length>=2){const a=n[n.length-2].valor,r=n[n.length-1].valor;if(a>0&&r>a*1.1){const c=((r-a)/a*100).toFixed(1);manekiToastExport(`\u26A0\uFE0F El costo de "${t.name}" subi\xF3 ${c}% (de $${a.toFixed(2)} a $${r.toFixed(2)})`,"warn")}}}window._registrarCambioHistorialCosto=_registrarCambioHistorialCosto;let _compraProdId=null;function _inyectarRegistrarCompraModal(){if(document.getElementById("registrarCompraModal"))return;const t=document.createElement("div");t.innerHTML=`<div id="registrarCompraModal" class="fixed inset-0 z-50 hidden items-center justify-center" style="background:rgba(0,0,0,0.5);">
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
</div>`,document.body.appendChild(t.firstElementChild)}function registrarCompraRecibida(t,e,i){const o=(window.products||[]).find(d=>String(d.id)===String(t));if(!o){manekiToastExport("Producto no encontrado","err");return}const n=parseFloat(String(e))||0;if(n<=0){manekiToastExport("Cantidad inv\xE1lida","warn");return}const a=parseFloat(o.costo||o.cost||0)||0;if(Array.isArray(o.variants)&&o.variants.length>0){const d=[...o.variants].sort((p,f)=>(parseFloat(f.qty)||0)-(parseFloat(p.qty)||0)),s=o.variants.find(p=>p.type===d[0].type&&p.value===d[0].value);s&&(s.qty=(parseFloat(s.qty)||0)+n),typeof syncStockFromVariants=="function"&&syncStockFromVariants(o)}else o.stock=(parseFloat(o.stock)||0)+n;let r=a;i&&i>0&&(r=i,o.costo=i,o.cost=i,_registrarCambioHistorialCosto(o,a)),window.expenses||(window.expenses=[]);const c=n*r;c>0&&(window.expenses.push({id:mkId(),concepto:`Compra de MP: ${o.name}`,monto:c,fecha:_fechaHoy(),categoria:"Inventario",nota:`${n} uds \xD7 $${r.toFixed(2)}`}),typeof saveExpenses=="function"&&saveExpenses()),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard();const l=c>0?` \xB7 Gasto de $${c.toFixed(2)} en Balance`:"";manekiToastExport(`\u2705 Compra registrada: +${n} unidades de ${o.name}${l}`,"ok")}window.registrarCompraRecibida=registrarCompraRecibida;function abrirRegistrarCompra(t){_inyectarRegistrarCompraModal(),_compraProdId=t||null;const e=t?(window.products||[]).find(a=>String(a.id)===String(t)):null,i=document.getElementById("compraProductoNombre");i&&e&&(i.value=e.name||"");const o=document.getElementById("compraCantidad");o&&(o.value="");const n=document.getElementById("compraCosto");n&&e&&(n.value=String(parseFloat(e.costo||e.cost||0)||"")),openModal("registrarCompraModal")}window.abrirRegistrarCompra=abrirRegistrarCompra;function _confirmarCompra(){if(!_compraProdId)return;const t=document.getElementById("compraCantidad"),e=document.getElementById("compraCosto"),i=parseFloat(t?.value||"0"),o=parseFloat(e?.value||"0");if(!i||i<=0){manekiToastExport("Ingresa una cantidad v\xE1lida","warn");return}closeModal("registrarCompraModal"),registrarCompraRecibida(_compraProdId,i,o)}window._confirmarCompra=_confirmarCompra;let _qrStream=null,_qrDetectorInst=null,_qrScanInterval=null;window._abrirQRScanner=async function(){typeof window.openModal=="function"&&window.openModal("qrScannerModal");const t=document.getElementById("qrVideo"),e=document.getElementById("qrStatus"),i=document.getElementById("qrManualWrap");if(t&&(t.style.display=""),!(typeof window.BarcodeDetector<"u")){t&&(t.style.display="none"),e&&(e.textContent="Esc\xE1ner no disponible en este navegador."),i&&(i.style.display="");return}try{if(_qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}),!t)return;t.srcObject=_qrStream,await t.play(),_qrDetectorInst=new window.BarcodeDetector({formats:["qr_code","ean_13","ean_8","upc_a","upc_e","code_128","code_39","data_matrix"]}),e&&(e.textContent="Buscando c\xF3digo..."),_qrScanInterval=setInterval(async()=>{if(t.videoWidth)try{const n=await _qrDetectorInst.detect(t);if(n&&n.length>0){const a=String(n[0].rawValue||"").trim();if(!a)return;window._cerrarQRScanner();const r=document.getElementById("inventorySearch");r&&(r.value=a,r.dispatchEvent(new Event("input"))),typeof window.manekiToastExport=="function"&&window.manekiToastExport(`\u{1F4F7} C\xF3digo: ${a}`,"ok")}}catch{}},350)}catch{e&&(e.textContent="No se pudo acceder a la c\xE1mara."),i&&(i.style.display="")}},window._cerrarQRScanner=function(){typeof window.closeModal=="function"&&window.closeModal("qrScannerModal"),_qrScanInterval&&(clearInterval(_qrScanInterval),_qrScanInterval=null),_qrStream&&(_qrStream.getTracks().forEach(e=>e.stop()),_qrStream=null);const t=document.getElementById("qrVideo");t&&(t.srcObject=null)},window._qrManualBuscar=function(){const t=document.getElementById("qrManualInput");if(!t||!t.value.trim())return;const e=t.value.trim();window._cerrarQRScanner();const i=document.getElementById("inventorySearch");i&&(i.value=e,i.dispatchEvent(new Event("input")))},window._ptMpComponentes=window._ptMpComponentes??[],window._ptVariants=window._ptVariants??[],window._ptTagsActuales=window._ptTagsActuales??[];const TAGS_PT=["Oferta","Nuevo","Destacado","Favorito","Agotado"];
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
                    <label style="padding:6px 14px;background:#C5973B;color:#fff;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
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
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
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
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                    <input type="text" id="ptVarValor" placeholder="Valor: M, Rojo..."
                        style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;"
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();agregarVariantePt();}">
                    <button type="button" onclick="agregarVariantePt()"
                        style="padding:10px 14px;background:#C5973B;color:#fff;border:none;border-radius:10px;font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;">+ Agregar</button>
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
                                style="padding:6px 12px;background:#C5973B;color:#fff;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;">Aplicar</button>
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
                        style="width:100%;padding:12px 16px 12px 28px;border:2px solid #C5973B;border-radius:12px;font-size:1.1rem;font-weight:700;outline:none;box-sizing:border-box;color:#1a0533;"
                        onfocus="this.style.borderColor='#E8B84B'" onblur="this.style.borderColor='#C5973B'">
                </div>
                <div id="ptMargenInfo" style="font-size:.78rem;color:#6b7280;margin-top:6px;"></div>
            </div>

            <!-- RENDIMIENTO POR HOJA (stickers, etc.) -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F3AF} Piezas por hoja / unidad de MP <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <input type="number" id="ptRendimientoPorHoja" min="1" placeholder="Ej: 12 (stickers que caben en 1 hoja)"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                <p style="font-size:.72rem;color:#9ca3af;margin-top:5px;">Si vendes por cantidad (ej. 100 stickers), el sistema divide entre este n\xFAmero para calcular cu\xE1ntas hojas descontar del inventario y calcular el costo.</p>
            </div>

            <!-- STOCK M\xCDNIMO -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F514} Stock m\xEDnimo de alerta</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="number" id="ptStockMin" min="0" step="1" value="5"
                        style="width:100px;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                    <span style="font-size:.8rem;color:#6b7280;">Se te notificar\xE1 cuando el stock baje de este n\xFAmero</span>
                </div>
            </div>

            <!-- DESCRIPCI\xD3N PARA WEB -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">\u{1F310} Descripci\xF3n para tienda online <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
                <textarea id="ptDescripcionWeb" rows="2" placeholder="Ej: Taza personalizada con foto y nombre, ideal para regalo. Incluye dise\xF1o gratis."
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                <p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">Aparece bajo el nombre del producto en manekistore.com.mx</p>
            </div>

            <!-- OCASIONES -->
            <div>
                <label style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:10px;">\u{1F389} Ocasiones <span style="font-weight:400;color:#9ca3af;">(para filtrar en tienda)</span></label>
                <div id="ptOcasionesGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${[{id:"cumpleanos",emoji:"\u{1F382}",label:"Cumplea\xF1os"},{id:"san-valentin",emoji:"\u{1F495}",label:"San Valent\xEDn"},{id:"bodas-xv",emoji:"\u{1F48D}",label:"Bodas y XV a\xF1os"},{id:"graduaciones",emoji:"\u{1F393}",label:"Graduaciones"},{id:"empresarial",emoji:"\u{1F3E2}",label:"Empresarial"},{id:"navidad",emoji:"\u{1F384}",label:"Navidad y A\xF1o Nuevo"}].map(o=>`
                        <label id="ptOcLabel_${o.id}" style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:.82rem;font-weight:500;color:#374151;transition:all .15s;">
                            <input type="checkbox" id="ptOc_${o.id}" value="${o.id}" style="accent-color:#C5973B;width:15px;height:15px;cursor:pointer;"
                                onchange="(function(el){var lbl=document.getElementById('ptOcLabel_${o.id}');lbl.style.borderColor=el.checked?'#C5973B':'#e5e7eb';lbl.style.background=el.checked?'#fdf8f0':''})(this)">
                            ${o.emoji} ${o.label}
                        </label>`).join("")}
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
                style="width:100%;padding:16px;background:linear-gradient(135deg,var(--mk-gold-500),var(--mk-gold-400));color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:800;cursor:pointer;margin-top:8px;letter-spacing:.02em;">
                \u2705 Agregar Producto
            </button>
        </form>
    </div>`,document.body.appendChild(t),setTimeout(()=>{const o=document.getElementById("ptProductImage");o&&!o._mkBound&&(o._mkBound=!0,o.addEventListener("change",function(d){const l=d.target.files[0];if(!l)return;window.currentProductImageFile=l;const m=new FileReader;m.onload=b=>{const h=document.getElementById("ptPreviewImg"),g=document.getElementById("ptImagePreview");h&&(h.src=b.target.result),g&&g.classList.remove("hidden"),window.currentProductImage=b.target.result},m.readAsDataURL(l)}));const i=document.getElementById("ptPublicarTienda"),n=document.getElementById("ptToggleTrack"),a=document.getElementById("ptToggleThumb");if(i&&n&&a){const d=()=>{n.style.background=i.checked?"#10b981":"#d1d5db",a.style.transform=i.checked?"translateX(22px)":"translateX(0)"};i.addEventListener("change",d),d()}poblarCategoriasPt(),renderTagsPt();const s=document.getElementById("ptPrecio");if(s&&s.addEventListener("input",()=>ptMostrarMargenInfo()),!document.getElementById("ptProveedorNombre")){const d=document.getElementById("ptSubmitBtn");d&&d.insertAdjacentHTML("beforebegin",`
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
            border:1.5px solid ${o?"#C5973B":"#e5e7eb"};background:${o?"#FFF9F0":"#fff"};color:${o?"#92400e":"#6b7280"};">
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
        </div>`).join("")}}window.renderVariantsListPt=renderVariantsListPt;function abrirSelectorMpPt(){const e=document.getElementById("ptMpSelector");e&&(e.style.display=e.style.display==="none"?"block":"none",e.style.display==="block"&&(filtrarMpSelector(),document.getElementById("ptMpSearch")?.focus()))}window.abrirSelectorMpPt=abrirSelectorMpPt;function filtrarMpSelector(){const e=(document.getElementById("ptMpSearch")?.value||"").toLowerCase(),t=(window.products||[]).filter(n=>n.tipo==="materia_prima"||n.tipo==="servicio"),o=document.getElementById("ptMpResults");if(!o)return;const i=e?t.filter(n=>(n.name||"").toLowerCase().includes(e)):t;if(!i.length){o.innerHTML='<p style="font-size:.8rem;color:#9ca3af;padding:8px;">No hay materias primas ni servicios registrados</p>';return}o.innerHTML=i.map(n=>{const a=(window._ptMpComponentes||[]).some(m=>String(m.id)===String(n.id)),s=n.tipo==="servicio",d=n.imageUrl?`<img src="${n.imageUrl}" alt="${_esc(n.name||"")}" style="width:32px;height:32px;object-fit:cover;border-radius:6px;">`:`<span style="font-size:1.4rem;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${n.image||(s?"\u2699\uFE0F":"\u{1F3ED}")}</span>`,l=s?`<div style="font-size:.72rem;color:#6d28d9;font-weight:600;">\u2699\uFE0F Servicio \xB7 $${Number(n.cost||0).toFixed(2)}/uso</div>`:`<div style="font-size:.72rem;color:#6b7280;">Stock: ${n.stock||0} \xB7 Costo: $${Number(n.cost||0).toFixed(2)}</div>`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${a?"#f0fdf4":"#fff"};border:1.5px solid ${a?"#6ee7b7":"#e5e7eb"};cursor:pointer;transition:all .1s;"
            onclick="seleccionarMpPt('${String(n.id).replace(/'/g,"\\'")}')">
            ${d}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(n.name)}</div>
                ${l}
            </div>
            <span style="font-size:.78rem;font-weight:700;color:${a?"#059669":"#7c3aed"};">${a?"\u2713 Agregado":"+ Agregar"}</span>
        </div>`}).join("")}window.filtrarMpSelector=filtrarMpSelector;function seleccionarMpPt(e){const t=(window.products||[]).find(i=>String(i.id)===String(e)&&(i.tipo==="materia_prima"||i.tipo==="servicio"));if(!t)return;if(window._ptMpComponentes=window._ptMpComponentes||[],window._ptMpComponentes.find(i=>String(i.id)===String(e))){manekiToastExport(`"${t.name}" ya fue agregado`,"warn");return}if(window._ptMpComponentes.push({id:t.id,nombre:t.name,imageUrl:t.imageUrl||null,imagen:t.image||"\u{1F3ED}",qty:1,costUnit:Number(t.cost||0)}),Array.isArray(t.variants)&&t.variants.length>0){window._ptVariants=window._ptVariants||[];let i=0;t.variants.forEach(n=>{const a=n.type||n.tipo||"",s=n.value||n.valor||"";if(!a||!s)return;window._ptVariants.some(l=>(l.type||l.tipo)===a&&(l.value||l.valor)===s)||(window._ptVariants.push({type:a,value:s,qty:n.qty||0}),i++)}),i>0&&(renderVariantsListPt(),manekiToastExport(`\u2705 Se importaron ${i} variante(s) de "${t.name}"`,"ok"))}renderPtMpList(),recalcularCostoPt(),filtrarMpSelector()}window.seleccionarMpPt=seleccionarMpPt;function quitarMpPt(e){(window._ptMpComponentes||[]).splice(e,1),renderPtMpList(),recalcularCostoPt()}window.quitarMpPt=quitarMpPt;function updateMpQtyPt(e,t){window._ptMpComponentes&&window._ptMpComponentes[e]&&(window._ptMpComponentes[e].qty=Math.max(.01,parseFloat(t)||1),recalcularCostoPt())}window.updateMpQtyPt=updateMpQtyPt;function renderPtMpList(){const e=document.getElementById("ptMpList");if(!e)return;const t=window._ptMpComponentes||[];if(!t.length){e.innerHTML='<p style="font-size:.8rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin materias primas agregadas</p>',document.getElementById("ptDisponibilidadBox")&&(document.getElementById("ptDisponibilidadBox").style.display="none");return}e.innerHTML=t.map((o,i)=>{const n=o.imageUrl?`<img src="${o.imageUrl}" alt="${_esc(o.nombre||o.name||"")}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;flex-shrink:0;">`:`<span style="font-size:1.4rem;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${o.imagen||"\u{1F3ED}"}</span>`,a=(o.qty*o.costUnit).toFixed(2);return`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;">
            ${n}
            <div style="flex:1;min-width:0;">
                <div style="font-size:.85rem;font-weight:700;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(o.nombre)}</div>
                <div style="font-size:.72rem;color:#6b7280;">$${o.costUnit.toFixed(2)}/ud \xB7 Subtotal: <b style="color:#92400e;">$${a}</b></div>
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
        </div>`}).join(""),calcularDisponibilidadPt()}window.renderPtMpList=renderPtMpList;function recalcularCostoPt(){const e=window._ptMpComponentes||[],t=e.reduce((n,a)=>n+a.qty*a.costUnit,0),o=document.getElementById("ptCosto");o&&(o.value=t.toFixed(2));const i=document.getElementById("ptCostoDesglose");i&&e.length?i.textContent=e.map(n=>`${n.nombre} \xD7${n.qty} = $${(n.qty*n.costUnit).toFixed(2)}`).join(" \xB7 "):i&&(i.textContent=""),ptMostrarMargenInfo(),calcularDisponibilidadPt()}window.recalcularCostoPt=recalcularCostoPt;function calcularDisponibilidadPt(){const e=window._ptMpComponentes||[],t=document.getElementById("ptDisponibilidadBox"),o=document.getElementById("ptDisponibilidadNum"),i=document.getElementById("ptDisponibilidadDetalle");if(!t||!e.length){t&&(t.style.display="none");return}t.style.display="block";let n=1/0;const a=e.map(s=>{const d=(window.products||[]).find(b=>String(b.id)===String(s.id));if(d&&d.tipo==="servicio")return`${s.nombre}: \u2699\uFE0F servicio (sin l\xEDmite de stock)`;const l=d&&d.stock||0,m=s.qty>0?Math.floor(l/s.qty):0;return m<n&&(n=m),`${s.nombre}: ${l} uds \xF7 ${s.qty} = ${m} piezas`});isFinite(n)||(n=0),o&&(o.textContent=n,o.style.color=n>0?"#059669":"#ef4444"),i&&(i.innerHTML=a.join("<br>"))}window.calcularDisponibilidadPt=calcularDisponibilidadPt;function ptAplicarMargen(e){const t=parseFloat(document.getElementById("ptCosto")?.value||0)||0;if(!t){manekiToastExport("\u26A0\uFE0F Define el costo primero","warn");return}const o=t*(1+e/100),i=document.getElementById("ptPrecio");i&&(i.value=o.toFixed(2),ptMostrarMargenInfo())}window.ptAplicarMargen=ptAplicarMargen;function ptAplicarMargenCustom(){const e=parseFloat(document.getElementById("ptMargenCustom")?.value||0);!e||e<=0||ptAplicarMargen(e)}window.ptAplicarMargenCustom=ptAplicarMargenCustom;function ptActualizarPrecioSugerido(){ptMostrarMargenInfo()}window.ptActualizarPrecioSugerido=ptActualizarPrecioSugerido;function ptMostrarMargenInfo(){const e=parseFloat(document.getElementById("ptCosto")?.value||0)||0,t=parseFloat(document.getElementById("ptPrecio")?.value||0)||0,o=document.getElementById("ptMargenInfo");if(!o)return;if(!e||!t){o.textContent="";return}const i=((t-e)/t*100).toFixed(1),n=(t-e).toFixed(2),a=parseFloat(i)>=40?"#059669":parseFloat(i)>=20?"#d97706":"#ef4444";o.innerHTML=`<span style="color:${a};font-weight:700;">${i}% de margen</span> \xB7 Ganancia por pieza: <b style="color:${a};">$${n}</b>`}window.ptMostrarMargenInfo=ptMostrarMargenInfo;async function guardarProductoTerminado(){const e=p=>{const u=document.getElementById(p);return u?u.value:""},t=e("ptNombre").trim(),o=e("ptSku").trim(),i=e("ptCategory"),n=parseFloat(e("ptCosto"))||0,a=parseFloat(e("ptPrecio"))||0,s=parseInt(e("ptStockMin"))||5,d=parseFloat(e("ptRendimientoPorHoja"))||0,l=e("ptProveedorNombre").trim(),m=e("ptProveedorNotas").trim();if(!t){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn"),document.getElementById("ptNombre")?.focus();return}if(!a||a<=0){manekiToastExport("\u26A0\uFE0F El precio de venta debe ser mayor a $0","warn"),document.getElementById("ptPrecio")?.focus();return}if(a<n){manekiToastExport("\u26A0\uFE0F El precio no puede ser menor al costo","warn"),document.getElementById("ptPrecio")?.focus();return}const b=window.modoEdicion?window.edicionProductoId:null,h=(window.products||[]).find(p=>(p.name||"").trim().toLowerCase()===t.toLowerCase()&&String(p.id)!==String(b));if(h){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${h.name}". Usa un nombre diferente o edita el existente.`,"warn"),document.getElementById("ptNombre")?.focus();return}if(typeof _fuzzyMatch=="function"){const p=(window.products||[]).find(u=>{if(String(u.id)===String(b))return!1;const c=t.toLowerCase(),f=(u.name||"").toLowerCase();if(c===f)return!1;const x=Math.max(c.length,f.length);return x<4?!1:typeof window._levenshtein=="function"?1-window._levenshtein(c,f)/x>=.8:!1});p&&manekiToastExport(`\u26A0\uFE0F Nombre similar a "${p.name}" ya existente. Si es diferente, contin\xFAa guardando.`,"warn")}if(o&&!skuEsUnico(o,b)){manekiToastExport(`\u26A0\uFE0F El SKU "${o}" ya est\xE1 en uso`,"warn");return}let g=n;const C=window._ptMpComponentes||[];if(g===0)if(C.length>0){const p=C.reduce((u,c)=>{const f=(window.products||[]).find(x=>String(x.id)===String(c.id));return u+(c.qty||0)*(f&&f.cost?f.cost:c.costUnit||0)},0);if(p>0&&await showConfirm(`El costo calculado basado en materias primas es $${p.toFixed(2)}. \xBFDeseas usarlo como costo del producto?`)){g=p;const c=document.getElementById("ptCosto");c&&(c.value=g.toFixed(2))}}else manekiToastExport("\u26A0\uFE0F El costo del producto est\xE1 en $0. Considera agregar un costo.","warn");const k=document.getElementById("ptSubmitBtn"),I=typeof btnLoading=="function"?btnLoading(k):()=>{};k&&(k.disabled=!0);try{if(window.currentProductImageFile){manekiToastExport("\u23F3 Subiendo imagen principal...","ok");const r=await subirImagenStorage(window.currentProductImageFile).catch(()=>null);r?window.currentProductImage=r:manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen principal. Intenta de nuevo.","warn"),window.currentProductImageFile=null}const p=window._ptGaleriaFiles||[];if(p.length>0){manekiToastExport(`\u23F3 Subiendo ${p.length} foto(s) de galer\xEDa...`,"ok");const r=await Promise.all(p.map(v=>subirImagenStorage(v).catch(()=>null))),y=r.filter(Boolean),w=r.filter(v=>v===null).length;w>0&&manekiToastExport(`\u26A0\uFE0F ${w} foto(s) de galer\xEDa no se pudieron subir.`,"warn"),window._ptGaleriaUrls=[...window._ptGaleriaUrls||[],...y],window._ptGaleriaFiles=[]}const u=[...window._ptGaleriaUrls||[]],c=document.getElementById("ptPublicarTienda")?.checked??!1,f=document.getElementById("ptDescripcionWeb")?.value?.trim()||"",x=["cumpleanos","san-valentin","bodas-xv","graduaciones","empresarial","navidad"].filter(r=>document.getElementById(`ptOc_${r}`)?.checked),P=(window.categories||[]).find(r=>r.id===i),M=o||generateSKU(i),T=[...window._ptTagsActuales||[]],z=[...window._ptMpComponentes||[]];if(window.currentVariants=[...window._ptVariants||[]],window.modoEdicion&&window.edicionProductoId!==null){const r=(window.products||[]).findIndex(B=>String(B.id)===String(window.edicionProductoId));if(r===-1){manekiToastExport("Error: producto no encontrado","err");return}const y=window.products[r].stock,w=window.products[r],v=w.price,$=w.cost,S=w.historialPrecios||[];(v!==a||$!==g)&&S.push({fecha:new Date().toISOString(),precioAntes:v,costoAntes:$,precioNuevo:a,costoNuevo:g}),window.products[r]=Object.assign({},window.products[r],{name:t,category:i,tipo:c?"producto":"producto_interno",cost:g,price:a,stockMin:s,tags:T,sku:M,mpComponentes:z,publicarTienda:c,descripcionWeb:f,ocasiones:x,image:P?P.emoji:window.products[r].image,imageUrl:window.currentProductImage||window.products[r].imageUrl,imageUrls:u.length>0?u:window.products[r].imageUrls||[],variants:[...window.currentVariants],historialPrecios:S,rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:m,movimientos:window.products[r].movimientos||[]}),syncStockFromVariants(window.products[r]);const E=getStockEfectivo(window.products[r]);E!==y&&registrarMovimiento({productoId:window.edicionProductoId,productoNombre:t,tipo:"ajuste",cantidad:E-y,motivo:"Edici\xF3n",stockAntes:y,stockDespues:E});const _=E-y;_!==0&&(window.products[r].movimientos=window.products[r].movimientos||[],window.products[r].movimientos.unshift({id:Date.now(),fecha:_fechaHoy(),delta:_,stockResultante:E,motivo:"Edici\xF3n manual",usuario:"local"}),window.products[r].movimientos.length>30&&(window.products[r].movimientos=window.products[r].movimientos.slice(0,30))),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),I(!0),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto actualizado","ok")}else{const r={id:_genId(),name:t,category:i,tipo:c?"producto":"producto_interno",cost:g,price:a,stock:0,stockMin:s,tags:T,sku:M,mpComponentes:z,publicarTienda:c,descripcionWeb:f,ocasiones:x,image:P?P.emoji:"\u{1F4E6}",imageUrl:window.currentProductImage||null,imageUrls:u,variants:[...window.currentVariants],rendimientoPorHoja:d,proveedorNombre:l,proveedorNotas:m,movimientos:[]};syncStockFromVariants(r),window.products.push(r),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),I(!0),closePtModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Producto agregado exitosamente","ok")}}finally{k&&(k.disabled=!1)}}window.guardarProductoTerminado=guardarProductoTerminado;
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
                    onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- PRODUCTOS DEL PACK -->
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <label style="font-size:.85rem;font-weight:700;color:#374151;">\u{1F4E6} Productos en el Pack</label>
                    <button type="button" onclick="packAbrirSelectorPT()"
                        style="padding:6px 14px;background:linear-gradient(135deg,var(--mk-gold-500),var(--mk-gold-400));color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
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
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
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
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
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
                style="width:100%;padding:14px;background:linear-gradient(135deg,var(--mk-gold-500),var(--mk-gold-400));color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:.02em;">
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
                        onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'">
                </div>
                <div style="text-align:center;">
                    <div style="font-size:.68rem;color:#9ca3af;margin-bottom:2px;">Costo pack</div>
                    <div style="position:relative;">
                        <span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.75rem;">$</span>
                        <input type="number" min="0" step="0.01" value="${Number(t.costoCustom).toFixed(2)}"
                            onchange="packActualizarCosto('${t.productoId}', this.value)"
                            style="width:72px;padding:4px 6px 4px 16px;border:1.5px solid #fde68a;border-radius:8px;font-size:.82rem;outline:none;"
                            onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#fde68a'">
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
                border:1.5px solid ${n?"#C5973B":"#e5e7eb"};
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
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:#C5973B">+ Agregar</button>
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
"use strict";async function guardarMateriaPrima(){const i=m=>{const E=document.getElementById(m);return E?E.value:""},e=i("mpNombre").trim(),o=parseInt(i("mpStock"))||0,n=parseInt(i("mpStockMin"))||5,r=i("mpSku").trim(),a=i("mpProveedor").trim(),t=i("mpProveedorUrl").trim(),s=i("mpUnidad")||"pza",l=i("mpNotas").trim(),c=document.getElementById("mpUsaPaquete")?.checked||!1,d=parseFloat(i("mpPaqueteCantidad"))||0,u=parseFloat(i("mpPaquetePrecio"))||0;let p=0;if(c){if(d<=0||u<=0){manekiToastExport("\u26A0\uFE0F Ingresa la cantidad y precio del paquete","warn");return}p=u/d}else p=parseFloat(i("mpCosto"))||0;if(!e){manekiToastExport("\u26A0\uFE0F El nombre es requerido","warn");return}if(p<=0){manekiToastExport("\u26A0\uFE0F El costo debe ser mayor a 0","warn");return}const w=window.modoEdicion?window.edicionProductoId:null,h=(window.products||[]).find(m=>m.name.trim().toLowerCase()===e.toLowerCase()&&String(m.id)!==String(w));if(h){manekiToastExport(`\u26A0\uFE0F Ya existe un producto llamado "${h.name}". Usa un nombre diferente o edita el existente.`,"warn");return}if(r&&!skuEsUnico(r,w)){manekiToastExport(`\u26A0\uFE0F El SKU "${r}" ya est\xE1 en uso`,"warn");return}if(window.currentProductImageFile){manekiToastExport("\u23F3 Subiendo imagen...","ok");const m=await subirImagenStorage(window.currentProductImageFile).catch(()=>null);m?window.currentProductImage=m:manekiToastExport("\u26A0\uFE0F No se pudo subir la imagen. Intenta de nuevo.","warn"),window.currentProductImageFile=null}const b=document.getElementById("mpEsEmpaque")?.checked||!1,f=[...window._mpTagsActuales||[]],v=mkId().split("-")[0].toUpperCase(),k=r||"MP-"+v,S=document.getElementById("mpUsaVariantes")?.checked||!1,y=S?[...window._mpVariantes||[]]:[],g=S?y.reduce((m,E)=>m+(parseInt(E.qty)||0),0):o;if(window.modoEdicion&&window.edicionProductoId!==null){const m=(window.products||[]).findIndex(x=>String(x.id)===String(window.edicionProductoId));if(m===-1){manekiToastExport("Error: producto no encontrado","err");return}const E=window.products[m].stock,M=window.products[m].cost||0,I=[...window.products[m].historialCostos||[]];p!==M&&I.push({fecha:new Date().toISOString(),costoAntes:M,costoNuevo:p}),window.products[m]=Object.assign({},window.products[m],{name:e,tipo:"materia_prima",cost:p,price:0,stock:g,stockMin:n,sku:k,tags:f,proveedor:a,proveedorUrl:t,unidad:s,notas:l,imageUrl:window.currentProductImage||window.products[m].imageUrl,compraPaquete:c?{cantidad:d,precio:u}:null,variants:y,usaVariantes:S,historialCostos:I,esEmpaque:b}),g!==E&&registrarMovimiento({productoId:window.edicionProductoId,productoNombre:e,tipo:"ajuste",cantidad:g-E,motivo:"Edici\xF3n",stockAntes:E,stockDespues:g}),p!==M&&_cascadeCostMP(window.edicionProductoId,p),S&&y.length>0&&_cascadeVariantesMP(window.edicionProductoId,y),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closeMateriaPrimaModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Materia prima actualizada","ok")}else{const m={id:_genId(),name:e,tipo:"materia_prima",category:"materiales",cost:p,price:0,stock:g,stockMin:n,sku:k,tags:f,proveedor:a,proveedorUrl:t,unidad:s,notas:l,image:"\u{1F3ED}",imageUrl:window.currentProductImage||null,variants:y,usaVariantes:S,compraPaquete:c?{cantidad:d,precio:u}:null,esEmpaque:b};window.products.unshift(m),window._invCurrentPage=1,g>0&&registrarMovimiento({productoId:m.id,productoNombre:m.name,tipo:"creacion",cantidad:g,motivo:"Alta de materia prima",stockAntes:0,stockDespues:g}),saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),closeMateriaPrimaModal(),window.MKS&&MKS.notify(),manekiToastExport("\u2705 Materia prima agregada","ok")}}window.guardarMateriaPrima=guardarMateriaPrima;function _cascadeCostMP(i,e){const o=[];(window.products||[]).forEach(t=>{if(t.tipo==="materia_prima"||t.tipo==="servicio"||!Array.isArray(t.mpComponentes)||!t.mpComponentes.length)return;const s=t.mpComponentes.find(d=>String(d.id)===String(i));if(!s)return;const l=t.cost||0;s.costUnit=e;const c=t.mpComponentes.reduce((d,u)=>d+(u.costUnit||0)*(u.qty||1),0);t.cost=Math.round(c*100)/100,t.historialPrecios||(t.historialPrecios=[]),t.historialPrecios.push({fecha:new Date().toISOString(),costoAntes:l,costoNuevo:t.cost,precioAntes:t.price,precioNuevo:t.price}),o.push(t.name)}),o.length&&manekiToastExport(`\u{1F4B0} Costo recalculado en: ${o.join(", ")}`,"ok");const n=(window.products||[]).filter(t=>(t.mpComponentes||[]).some(s=>String(s.id)===String(i))),r=new Set(n.map(t=>String(t.id))),a=(window.pedidos||[]).filter(t=>!["cancelado","finalizado"].includes(t.status||"")&&(t.productosInventario||[]).some(s=>r.has(String(s.id))));if(a.length>0){const t=a.map(s=>s.folio||s.id).join(", ");manekiToastExport(`\u{1F4A1} ${a.length} pedido(s) activo(s) usan productos afectados por este cambio de costo (${t}). Revisa sus precios.`,"warn")}}window._cascadeCostMP=_cascadeCostMP;function _cascadeVariantesMP(i,e){if(!Array.isArray(e)||!e.length)return;const o=[];(window.products||[]).forEach(n=>{n.tipo==="materia_prima"||n.tipo==="servicio"||!Array.isArray(n.mpComponentes)||!n.mpComponentes.length||n.mpComponentes.some(r=>String(r.id)===String(i))&&(n.variants=e.map(r=>{const a=(n.variants||[]).find(t=>(t.type||t.tipo)===(r.type||r.tipo)&&(t.value||t.valor)===(r.value||r.valor));return a?{...r,qty:a.qty??r.qty}:{...r}}),n.usaVariantes=!0,o.push(n.name))}),o.length&&manekiToastExport(`\u{1F3A8} Variantes sincronizadas en: ${o.join(", ")}`,"ok")}window._cascadeVariantesMP=_cascadeVariantesMP;function editProduct(i){const e=(window.products||[]).find(o=>String(o.id)===String(i));if(!e){console.warn("editProduct: no encontrado",i);return}e.tipo==="materia_prima"?(injectMpModal(),window.modoEdicion=!0,window.edicionProductoId=i,window.currentProductImage=e.imageUrl||null,window.currentProductImageFile=null,window._mpTagsActuales=[...e.tags||[]],setTimeout(()=>{const o=document.getElementById("mpForm");o&&o.reset();const n=(d,u)=>{const p=document.getElementById(d);p&&(p.value=u??"")};n("mpNombre",e.name),n("mpSku",e.sku||""),n("mpStock",e.stock||0),n("mpStockMin",e.stockMin||5),n("mpProveedor",e.proveedor||""),n("mpProveedorUrl",e.proveedorUrl||""),n("mpNotas",e.notas||""),setTimeout(()=>{const d=document.getElementById("mpUnidad");d&&(d.value=e.unidad||"pza")},10);const r=document.getElementById("mpUsaPaquete");if(e.compraPaquete&&e.compraPaquete.cantidad>0?(r&&(r.checked=!0,mpTogglePaquete()),n("mpPaqueteCantidad",e.compraPaquete.cantidad),n("mpPaquetePrecio",e.compraPaquete.precio),mpCalcCostoUnidad()):(r&&(r.checked=!1,mpTogglePaquete()),n("mpCosto",e.cost||0)),e.usaVariantes&&Array.isArray(e.variants)&&e.variants.length>0){window._mpVariantes=[...e.variants];const d=document.getElementById("mpUsaVariantes");d&&(d.checked=!0,mpToggleVariantes()),renderVariantesMp()}else _resetMpVariantesUI(),n("mpStock",e.stock||0);const a=document.getElementById("mpPreviewImg"),t=document.getElementById("mpImagePreview");e.imageUrl&&a?(a.src=e.imageUrl,t&&t.classList.remove("hidden")):t&&t.classList.add("hidden");const s=document.getElementById("mpEsEmpaque");s&&(s.checked=!!e.esEmpaque),renderMpTags();const l=document.querySelector("#mpModal h3");l&&(l.textContent="\u{1F3ED} Editar Materia Prima");const c=document.getElementById("mpSubmitBtn");c&&(c.textContent="\u{1F4BE} Guardar Cambios"),typeof openModal=="function"&&openModal("mpModal")},150)):e.tipo==="producto_variable"?(typeof injectVariableProductModal=="function"&&injectVariableProductModal(),typeof openVariableProductModal=="function"&&openVariableProductModal(i)):(injectPtModal(),window.modoEdicion=!0,window.edicionProductoId=i,window._ptVariants=Array.isArray(e.variants)?[...e.variants]:[],window._ptMpComponentes=Array.isArray(e.mpComponentes)?[...e.mpComponentes]:[],window._ptTagsActuales=[...e.tags||[]],window.currentVariants=[...window._ptVariants],window.currentProductImage=e.imageUrl||null,window.currentProductImageFile=null,window._ptGaleriaUrls=Array.isArray(e.imageUrls)?[...e.imageUrls]:[],window._ptGaleriaFiles=[],setTimeout(()=>{const o=(d,u)=>{const p=document.getElementById(d);p&&(p.value=u??"")};if(o("ptNombre",e.name),o("ptSku",e.sku||""),o("ptCosto",e.cost||0),o("ptPrecio",e.price||0),o("ptStockMin",e.stockMin??5),o("ptRendimientoPorHoja",e.rendimientoPorHoja||""),setTimeout(()=>{o("ptProveedorNombre",e.proveedorNombre||""),o("ptProveedorNotas",e.proveedorNotas||"")},200),poblarCategoriasPt(),setTimeout(()=>{const d=document.getElementById("ptCategory");d&&(d.value=e.category)},80),e.imageUrl){const d=document.getElementById("ptPreviewImg"),u=document.getElementById("ptImagePreview");d&&(d.src=e.imageUrl),u&&u.classList.remove("hidden")}ptRenderGaleria(),renderTagsPt(),renderVariantsListPt(),renderPtMpList(),recalcularCostoPt(),ptMostrarMargenInfo();const n=document.getElementById("ptPublicarTienda"),r=document.getElementById("ptToggleTrack"),a=document.getElementById("ptToggleThumb");n&&(n.checked=e.publicarTienda===!0||e.tipo==="producto",r&&(r.style.background=n.checked?"#10b981":"#d1d5db"),a&&(a.style.transform=n.checked?"translateX(22px)":"translateX(0)"));const t=document.getElementById("ptDescripcionWeb");t&&(t.value=e.descripcionWeb||""),["cumpleanos","san-valentin","bodas-xv","graduaciones","empresarial","navidad"].forEach(d=>{const u=document.getElementById(`ptOc_${d}`),p=document.getElementById(`ptOcLabel_${d}`);u&&(u.checked=Array.isArray(e.ocasiones)&&e.ocasiones.includes(d),p&&(p.style.borderColor=u.checked?"#C5973B":"#e5e7eb",p.style.background=u.checked?"#fdf8f0":""))});const l=document.querySelector("#ptModal h3");l&&(l.textContent="\u270F\uFE0F Editar Producto Terminado");const c=document.getElementById("ptSubmitBtn");c&&(c.textContent="\u{1F4BE} Guardar Cambios")},120),typeof openModal=="function"&&openModal("ptModal"))}window.editProduct=editProduct,document.addEventListener("DOMContentLoaded",function(){setTimeout(()=>{try{const n=localStorage.getItem("mkStockMovements");if(n){const r=JSON.parse(n);Array.isArray(r)&&r.length>0&&((!window.stockMovements||window.stockMovements.length===0)&&(window.stockMovements=r,window.stockMovimientos=r,saveStockMovements(),console.log("[Migraci\xF3n] stockMovements: "+r.length+" movimientos migrados a SQLite/Supabase.")),localStorage.removeItem("mkStockMovements"))}}catch(n){console.warn("[Migraci\xF3n] Error migrando stockMovements:",n)}},3e3),injectMpModal(),injectPtModal(),setupImageUpload(),["inventorySearch","inventoryTagFilter","inventoryTipoFilter","inventoryProveedorFilter"].forEach(n=>{function r(){const a=document.getElementById(n);a&&!a._invPagListenerAdded&&(a.addEventListener("input",()=>{window._invCurrentPage=1,renderInventoryTable()}),a.addEventListener("change",()=>{window._invCurrentPage=1,renderInventoryTable()}),a._invPagListenerAdded=!0)}r(),setTimeout(r,800),setTimeout(r,2e3)}),setTimeout(patchInventoryButtons,400);const e=document.getElementById("inventorySection")||document.querySelector('section[id*="inventor"]')||document.querySelector('[data-section="inventory"]');e&&new MutationObserver(r=>{for(const a of r)if(a.attributeName==="class"||a.attributeName==="style"){const t=a.target;!t.classList.contains("hidden")&&t.style.display!=="none"&&t.offsetParent!==null&&setTimeout(patchInventoryButtons,80)}}).observe(e,{attributes:!0});const o=document.getElementById("addProductForm");o&&!o._mkSubmitBound&&(o._mkSubmitBound=!0,o.addEventListener("submit",function(n){n.preventDefault(),openAddProductModal()}))});function patchInventoryButtons(){const i=document.querySelector('[onclick="openAddProductModal()"]');if(!i)return;const e=i.parentElement;if(i.innerHTML="\u{1F4E6} Producto Terminado",i.title="Agregar producto terminado",[{selector:'[onclick="toggleMovimientos()"]',html:"\u{1F550} Movimientos"},{selector:'[onclick="imprimirInventario()"]',html:"\u{1F5A8}\uFE0F Imprimir"},{selector:`[onclick="manekiExportar('inventario')"]`,html:"\u{1F4CA} Exportar Excel"}].forEach(({selector:n,html:r})=>{const a=document.querySelector(n);a&&(a.innerHTML=r)}),!e.querySelector("[data-mp-btn]")){const n=document.createElement("button");n.setAttribute("data-mp-btn","1"),n.onclick=()=>{injectMpModal(),openAddMateriaPrimaModal()},n.className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2",n.style.cssText="background:linear-gradient(135deg,#7c3aed,#a855f7);",n.innerHTML="\u{1F9EA} Materia Prima",n.title="Agregar materia prima",e.insertBefore(n,i)}}window.patchInventoryButtons=patchInventoryButtons;function ajustarStock(i){const e=(window.products||[]).find(u=>String(u.id)===String(i));if(!e)return;window._ajustarStockId=String(i),window.__ajustarStockIdBackup=String(i);const o=document.getElementById("ajustarStockNombre"),n=document.getElementById("ajustarStockActual"),r=document.getElementById("ajustarStockCantidad"),a=document.getElementById("ajustarStockMotivo");o&&(o.textContent=e.name),n&&(n.textContent=getStockEfectivo(e)),r&&(r.value="",setTimeout(()=>r.focus&&r.focus(),250)),a&&(a.value="");const t=document.getElementById("ajusteStockPuntoReorden");t&&(t.value=e.puntoReorden!=null?e.puntoReorden:"");const s=document.getElementById("_ajusteCostoPonderadoWrap"),l=document.getElementById("ajusteStockCostoNuevo");s&&(s.style.display="none"),l&&(l.value="");const c=document.getElementById("ajustarStockModal");c&&(c.dataset.productId=String(i)),_inyectarCamposAjusteStock(c),_renderUltimosMovimientosProducto(i,c),_renderSugerenciaReorden(e,c);const d=document.getElementById("ajustarStockCantidad");d&&!d._costoPondListener&&(d._costoPondListener=!0,d.addEventListener("input",function(){const u=document.getElementById("_ajusteCostoPonderadoWrap"),p=document.getElementById("ajusteStockCostoNuevo");u&&(u.style.display=parseInt(this.value)>0?"":"none"),p&&parseInt(this.value)<=0&&(p.value="")})),typeof openModal=="function"&&openModal("ajustarStockModal")}window.ajustarStock=ajustarStock;function _inyectarCamposAjusteStock(i){if(!i||i.querySelector("#ajusteStockMotivoSelect"))return;const e=i.querySelector(".space-y-3");if(!e)return;const o=e.querySelector("#ajusteStockPuntoReorden")?.parentElement,n=document.createElement("div");n.id="_ajusteStockExtraFields",n.innerHTML=`
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
        <div id="_ajusteCostoPonderadoWrap" style="margin-top:8px;display:none;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">
                Costo por unidad <span style="font-weight:400;color:#9ca3af;">(recalcula promedio ponderado)</span>
            </label>
            <input type="number" id="ajusteStockCostoNuevo" placeholder="Ej: 25.50" min="0" step="0.01"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;">
        </div>
        <div style="margin-top:8px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Notas adicionales <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
            <input type="text" id="ajusteStockNotasExtra" placeholder="Ej: Lote da\xF1ado por humedad"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;">
        </div>`,o?e.insertBefore(n,o):e.appendChild(n)}window._inyectarCamposAjusteStock=_inyectarCamposAjusteStock;function _renderUltimosMovimientosProducto(i,e){if(!e)return;if(!e.querySelector("#_ajusteUltMovimientos")){const t=e.querySelector(".bg-white");if(!t)return;const s=document.createElement("div");s.id="_ajusteUltMovimientos",s.style.cssText="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;",t.appendChild(s)}const n=e.querySelector("#_ajusteUltMovimientos");if(!n)return;const r=(window.stockMovements||[]).filter(t=>String(t.productoId)===String(i)).slice(0,5);if(!r.length){n.innerHTML='<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin movimientos registrados</p>';return}const a={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};n.innerHTML=`
        <p style="font-size:.72rem;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">\xDAltimos movimientos</p>
        ${r.map(t=>{const s=new Date(t.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),l=t.cantidad>=0?`+${t.cantidad}`:`${t.cantidad}`;return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f9fafb;font-size:.75rem;">
                <span style="font-size:13px;">${a[t.tipo]||"\u26AA"}</span>
                <div style="flex:1;min-width:0;">
                    <span style="font-weight:600;color:#374151;">${t.tipo}</span>
                    <span style="color:#9ca3af;margin-left:4px;">${_esc(t.motivo||"")}</span>
                    <div style="color:#9ca3af;font-size:.68rem;">${s}</div>
                </div>
                <span style="font-weight:700;color:${t.cantidad>=0?"#10b981":"#ef4444"};white-space:nowrap;">${l} uds</span>
            </div>`}).join("")}`}window._renderUltimosMovimientosProducto=_renderUltimosMovimientosProducto;function confirmarAjusteStock(){const i=document.getElementById("ajustarStockModal"),e=i&&i.dataset.productId||window._ajustarStockId||window.__ajustarStockIdBackup;if(!e){manekiToastExport("\u274C Error: no se encontr\xF3 el producto","err");return}const o=(window.products||[]).find(f=>String(f.id)===String(e));if(!o){manekiToastExport("\u274C Error: producto no encontrado","err");return}const n=document.getElementById("ajustarStockCantidad"),r=document.getElementById("ajustarStockMotivo"),a=document.getElementById("ajusteStockMotivoSelect"),t=document.getElementById("ajusteStockNotasExtra");if(!n){manekiToastExport("\u274C Error: formulario no disponible","err");return}const s=parseInt(n.value),l=a?a.value.trim():"",c=r?r.value.trim():"",d=l||c||"",u=t?t.value.trim():"";if(isNaN(s)||n.value.trim()===""){manekiToastExport("\u26A0\uFE0F Ingresa una cantidad v\xE1lida (+para agregar / -para restar)","warn"),n.focus&&n.focus();return}const p=getStockEfectivo(o),w=parseInt(o.stock)||0;if(o.stock=Math.max(0,w+s),s>0){const f=document.getElementById("ajusteStockCostoNuevo");if(f&&f.value.trim()!==""){const v=parseFloat(f.value);if(!isNaN(v)&&v>0){const k=Number(o.cost||o.costo||0),S=w+s;o.cost=S>0?(w*k+s*v)/S:v,o.cost=Math.round(o.cost*100)/100;const y=(window.products||[]).findIndex(g=>String(g.id)===String(o.id));if(y>=0){const g=[...window.products[y].historialCostos||[]];g.push({fecha:new Date().toISOString(),costoAntes:k,costoNuevo:o.cost,motivo:"Promedio ponderado"}),window.products[y].historialCostos=g,o.historialCostos=g}}}}if(o.variants&&o.variants.length>0&&s!==0){if(s>0)o.variants[0].qty=(o.variants[0].qty||0)+s;else{let f=Math.abs(s);for(const v of o.variants){const k=Math.min(v.qty||0,f);if(v.qty=(v.qty||0)-k,f-=k,f<=0)break}}syncStockFromVariants(o)}const h=getStockEfectivo(o);registrarMovimiento({productoId:o.id,productoNombre:o.name,tipo:s>=0?"entrada":"salida",cantidad:s,motivo:d,stockAntes:p,stockDespues:h});const b=document.getElementById("ajusteStockPuntoReorden");if(b&&b.value.trim()!==""){const f=parseInt(b.value);!isNaN(f)&&f>=0&&(o.puntoReorden=f)}saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard(),typeof closeModal=="function"&&closeModal("ajustarStockModal"),window._ajustarStockId=null,window.__ajustarStockIdBackup=null,i&&delete i.dataset.productId,window.MKS&&MKS.tick(),manekiToastExport(`\u2705 Stock de "${o.name}": ${p} \u2192 ${h}`,"ok")}window.confirmarAjusteStock=confirmarAjusteStock;function closeAjustarStockModal(){if(typeof closeModal=="function")closeModal("ajustarStockModal");else{const e=document.getElementById("ajustarStockModal");e&&(e.style.display="none")}window._ajustarStockId=null,window.__ajustarStockIdBackup=null;const i=document.getElementById("ajustarStockModal");i&&delete i.dataset.productId}window.closeAjustarStockModal=closeAjustarStockModal;function _renderSugerenciaReorden(i,e){if(!e)return;let o=e.querySelector("#_sugerenciaReorden");if(!o){const d=e.querySelector(".bg-white")||e.querySelector(".space-y-3")?.parentElement;if(!d)return;o=document.createElement("div"),o.id="_sugerenciaReorden",o.style.cssText="margin-top:12px;padding:10px 12px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;",d.appendChild(o)}const n=(window.salesHistory||[]).filter(d=>{if(!d.date||d.method==="Cancelado")return!1;const u=new Date;u.setDate(u.getDate()-30);const p=`${u.getFullYear()}-${String(u.getMonth()+1).padStart(2,"0")}-${String(u.getDate()).padStart(2,"0")}`;return d.date>=p});let r=0;n.forEach(d=>{(d.products||[]).forEach(u=>{(String(u.id)===String(i.id)||(u.name||"").toLowerCase()===(i.name||"").toLowerCase())&&(r+=Number(u.quantity||1))})});const a=r/30,t=i.leadTime||7,s=Math.ceil(a*3),l=Math.ceil(a*t)+s,c=Math.max(0,Math.ceil(a*30)-(getStockEfectivo(i)||0));if(r===0){o.innerHTML='<p style="font-size:.75rem;color:#92400E;margin:0;">\u{1F4CA} Sin ventas en los \xFAltimos 30 d\xEDas \u2014 no hay datos para sugerir reorden.</p>';return}o.innerHTML=`
        <p style="font-size:.72rem;font-weight:800;color:#92400E;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;">\u{1F4CA} Sugerencia de reorden</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Venta promedio</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${a.toFixed(1)}/d\xEDa</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Punto reorden sugerido</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${l} uds</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Pedir ahora</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${c>0?c+" uds":"\u2705 OK"}</p>
            </div>
            <div style="background:#FEF3C7;border-radius:8px;padding:6px 8px;text-align:center;">
                <p style="font-size:.65rem;color:#92400E;margin:0;">Lead time</p>
                <p style="font-size:.9rem;font-weight:700;color:#78350F;margin:2px 0 0;">${t}d
                    <button onclick="_mkEditLeadTime('${i.id}',${t})"
                       style="font-size:.6rem;background:none;border:none;cursor:pointer;color:#B45309;">\u270F\uFE0F</button>
                </p>
            </div>
        </div>`}function aplicarMargen(i){if(!i||isNaN(i)||i<=0){manekiToastExport("Margen inv\xE1lido","err");return}const e=parseFloat(document.getElementById("productCost").value);if(!e||e<=0){manekiToastExport("Primero ingresa el costo","warn");return}const o=e/(1-i/100);document.getElementById("productPrice").value=o.toFixed(2);const n=document.getElementById("precioSugeridoLabel");n&&(n.textContent=`\u{1F4A1} Con ${i}% de margen: costo $${e.toFixed(2)} \u2192 precio $${o.toFixed(2)} (ganancia $${(o-e).toFixed(2)})`)}window.aplicarMargen=aplicarMargen;async function cambiarTipoProducto(i){const e=(window.products||[]).find(a=>String(a.id)===String(i));if(!e)return;const o=(e.tipo||"producto")==="materia_prima",n=o?"producto":"materia_prima",r=o?"Producto Terminado \u{1F4E6}":"Materia Prima \u{1F3ED}";if(!o){const a=(window.pedidos||[]).filter(t=>!["cancelado","finalizado"].includes(t.status||"")&&(t.productosInventario||[]).some(s=>String(s.id)===String(i)));if(a.length>0){const t=a.map(l=>l.folio||l.id).join(", ");if(!await showConfirm(`\u26A0\uFE0F "${e.name}" est\xE1 en ${a.length} pedido(s) activo(s):
${t}

Convertirlo a Materia Prima puede romper esos pedidos. \xBFContinuar de todas formas?`))return}}showConfirm(`\xBFCambiar "${e.name}" a ${r}?

${o?"Se habilitar\xE1 precio de venta y variantes.":"Se ocultar\xE1 precio de venta. Solo se usar\xE1 el costo."}`,`Convertir a ${r}`).then(a=>{a&&(e.tipo=n,n==="materia_prima"?(e.price=0,e.variants=[]):(!e.price||e.price<=0)&&(e.price=(e.cost||0)*2),saveProducts(),renderInventoryTable(),manekiToastExport(`\u2705 "${e.name}" ahora es ${r}`,"ok"))})}window.cambiarTipoProducto=cambiarTipoProducto;async function deleteProduct(i){const e=(window.products||[]).find(t=>String(t.id)===String(i));if(!e)return;const o=(window.pedidos||[]).filter(t=>!["cancelado","finalizado"].includes(t.status||"")&&(t.productosInventario||[]).some(s=>String(s.id)===String(i)));if(o.length>0){const t=o.map(l=>l.folio||l.id).join(", ");if(!await showConfirm(`\u26A0\uFE0F Este producto est\xE1 en ${o.length} pedido(s) activo(s):
${t}

Eliminar puede romper esos pedidos. \xBFContinuar de todas formas?`))return}const n=(window.products||[]).filter(t=>t.isKit&&t.kitComponentes&&t.kitComponentes.some(s=>String(s.id)===String(i))),r=o;let a=`\xBFEliminar "${e.name}"?`;e.stock>0&&(a+=`

Tiene ${e.stock} unidades en stock.`),n.length&&(a+=`

\u26A0\uFE0F Es componente de ${n.length} kit(s): ${n.map(t=>t.name).join(", ")}.`),r.length&&(a+=`

\u{1F6A8} Est\xE1 en ${r.length} pedido(s) activo(s): ${r.map(t=>t.folio||t.id).join(", ")}. Eliminar el producto puede afectar esos pedidos.`),a+=`

Esta acci\xF3n no se puede deshacer.`,showConfirm(a,"\u{1F5D1}\uFE0F Eliminar producto permanentemente").then(async t=>{if(!t)return;window.MKS&&MKS.del();const s=JSON.parse(JSON.stringify(e)),l=window.products.findIndex(c=>String(c.id)===String(i));typeof window.mkPushUndo=="function"&&(window.mkPushUndo(`Eliminar "${e.name}"`,()=>{window.products.some(c=>String(c.id)===String(s.id))||(window.products.splice(l,0,s),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof window._rebuildProductMap=="function"&&window._rebuildProductMap())}),typeof window.mkMostrarUndoHint=="function"&&window.mkMostrarUndoHint(`Eliminar "${e.name}"`)),window.products=window.products.filter(c=>String(c.id)!==String(i));try{products=window.products}catch{}saveProducts(),renderInventoryTable(),typeof updateDashboard=="function"&&updateDashboard();try{await db.from("products").delete().eq("id",String(i))}catch(c){console.warn("deleteProduct: no se pudo borrar de products:",c)}manekiToastExport(`\u{1F5D1}\uFE0F "${e.name}" eliminado`,"ok")})}window.deleteProduct=deleteProduct;function calcularDisponibilidadDesdeMP(i,e,o){if(!i.mpComponentes||i.mpComponentes.length===0)return null;const n=e||window.productMap,r=n?c=>n.get(String(c)):c=>(window.products||[]).find(d=>String(d.id)===String(c)),a=o?c=>o.get(String(c.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(c):parseInt(c.stock)||0):c=>typeof getStockEfectivo=="function"?getStockEfectivo(c):parseInt(c.stock)||0;if(!i.mpComponentes.some(c=>{const d=r(c.id);return!d||d.tipo!=="servicio"}))return null;let s=1/0;const l=[];for(const c of i.mpComponentes){const d=r(c.id);if(d&&d.tipo==="servicio")continue;if(!d){i._tieneComponentesHuerfanos=!0;continue}const u=a(d),p=c.qty||1,w=Math.floor(u/p);l.push({nombre:c.nombre||(d?d.name:"?"),stock:u,qty:p,posibles:w}),w<s&&(s=w)}return{piezas:s===1/0?0:s,detalle:l}}window.calcularDisponibilidadDesdeMP=calcularDisponibilidadDesdeMP;async function _mkEditLeadTime(i,e){const o=document.getElementById("_mkLeadTimeModal");o&&o.remove();const n=document.createElement("div");n.id="_mkLeadTimeModal",n.innerHTML=`
        <div style="position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:16px;padding:28px 32px;width:320px;box-shadow:0 8px 32px #0003;">
                <h3 style="font-size:1rem;font-weight:700;margin:0 0 12px;">\u23F1 Lead Time del Proveedor</h3>
                <p style="font-size:.85rem;color:#6b7280;margin:0 0 16px;">\xBFCu\xE1ntos d\xEDas tarda tu proveedor en entregar?</p>
                <input id="_mkLeadTimeInput" type="number" min="1" max="365" value="${e}"
                    style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:10px;font-size:1rem;box-sizing:border-box;margin-bottom:20px;">
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button onclick="document.getElementById('_mkLeadTimeModal').remove()"
                        style="padding:8px 18px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Cancelar</button>
                    <button onclick="(function(){
                        var v=document.getElementById('_mkLeadTimeInput').value;
                        if(v&&!isNaN(Number(v))&&Number(v)>0){
                            var p=(window.products||[]).find(x=>String(x.id)==='${i}');
                            if(p){p.leadTime=parseInt(v);if(typeof saveProducts==='function')saveProducts();if(typeof renderInventoryTable==='function')renderInventoryTable();if(typeof manekiToastExport==='function')manekiToastExport('\u2705 Lead time guardado: '+v+' d\xEDas','ok');}
                        }
                        document.getElementById('_mkLeadTimeModal').remove();
                    })()" class="mk-btn-primary"
                        style="padding:8px 18px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Guardar</button>
                </div>
            </div>
        </div>`,document.body.appendChild(n);const r=document.getElementById("_mkLeadTimeInput");r&&(r.focus(),r.select())}window._mkEditLeadTime=_mkEditLeadTime;
//# sourceMappingURL=inventory-4.js.map

;
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
        </div>`;return}const g=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",c=(document.getElementById("inventoryTagFilter")||{}).value||"",k=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"";function y(t){const x=window._normSearch||(v=>String(v||"").toLowerCase()),f=x(g),w=x(k),$=v=>!c||v.tags&&v.tags.includes(c),S=v=>!k||x(v.proveedor||"").includes(w);if(!g)return t.filter(v=>$(v)&&S(v));const M=t.filter(v=>(x(v.name).includes(f)||x(v.sku||"").includes(f)||x(v.proveedor||"").includes(f)||x(v.notas||"").includes(f)||(v.tags||[]).some(W=>x(W).includes(f)))&&$(v)&&S(v));return M.length>0?M:t.filter(v=>(_fuzzyMatch(f,v.name||"")||_fuzzyMatch(f,v.sku||"")||_fuzzyMatch(f,v.proveedor||""))&&$(v)&&S(v))}const T=y(a.filter(t=>t.tipo==="materia_prima")),b=y(a.filter(t=>t.tipo==="servicio")),B=y(a.filter(t=>t.tipo==="producto_variable")),A=y(a.filter(t=>!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack")),G=new Set([...A,...B].map(t=>String(t.id))),_=window.productMap||new Map(a.map(t=>[String(t.id),t])),z=new Map;for(const t of a)t.mpComponentes&&t.mpComponentes.length>0&&G.has(String(t.id))&&z.set(String(t.id),calcularDisponibilidadDesdeMP(t,_,l));function L(t){if(!window._invSortCol)return t;const x=window._invSortCol,f=window._invSortDir;return[...t].sort((w,$)=>{let S,M;return x==="name"?(S=(w.name||"").toLowerCase(),M=($.name||"").toLowerCase()):x==="sku"?(S=(w.sku||"").toLowerCase(),M=($.sku||"").toLowerCase()):x==="category"?(S=(w.category||"").toLowerCase(),M=($.category||"").toLowerCase()):x==="price"?(S=Number(w.price)||0,M=Number($.price)||0):x==="stock"?(S=Number(w.stock)||0,M=Number($.stock)||0):x==="margin"&&(S=w.cost&&w.price?(w.price-w.cost)/w.price:-1,M=$.cost&&$.price?($.price-$.cost)/$.price:-1),S<M?f==="asc"?-1:1:S>M?f==="asc"?1:-1:0})}function u(t,x){const f=String(t.id),w=l.get(f)??(typeof getStockEfectivo=="function"?getStockEfectivo(t):parseInt(t.stock)||0),$=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${t.image||"\u{1F3ED}"}</span>`;let S;w===0?S='<span class="badge-danger">\u{1F534} Agotado</span>':w<=(t.stockMin||5)?S='<span class="badge-warning">\u26A0\uFE0F Bajo Stock</span>':S='<span class="badge-success">\u2705 Disponible</span>';const M=(window.categories||[]).find(N=>N.id===t.category),v=M?M.name:t.category||"";return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${$}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    ${t.historialCostos&&t.historialCostos.length?`<span title="Este producto ha tenido ${t.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#7c3aed;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">\u{1F4C8} ${t.historialCostos.length} cambio${t.historialCostos.length>1?"s":""}</span>`:""}
                    ${t.compraPaquete?`<div style="font-size:10px;color:#7c3aed;margin-top:2px;">\u{1F4E6} Paquete: ${t.compraPaquete.cantidad} uds \xB7 $${Number(t.compraPaquete.precio).toFixed(2)}</div>`:""}
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map(N=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#7c3aed;border:1px solid #e9d5ff;">${_esc(N)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(v)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(t.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(t.proveedor||"\u2014")}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${f}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${f}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${w} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(t.unidad||"pza")}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${S}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;align-items:center;">
                    <button type="button" onclick="editProduct('${f}')" title="Editar" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">\u270F\uFE0F</button>
                    <button type="button" onclick="ajustarStock('${f}')" title="Ajustar stock" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">\u{1F4E6}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" onclick="_invMpMenu(this,'${f}',${!!t.proveedorUrl},'${t.activo===!1?"desarchivar":"archivar"}')" title="M\xE1s acciones" style="width:30px;height:30px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;font-weight:700;color:#6b7280;">\xB7\xB7\xB7</button>
                    </div>
                </div>
            </td>
        </tr>`}function h(t,x){const f=String(t.id),w=`<span style="font-size:1.6rem;">${t.image||"\u2699\uFE0F"}</span>`;return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-indigo-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map($=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc($)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(t.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${f}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>
                    <button onclick="deleteProduct('${f}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function P(t,x){const f=String(t.id),w=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${t.image||"\u{1F4E6}"}</span>`,$=(window.categories||[]).find(m=>m.id===t.category),S=$?$.name:t.category||"",M=z.get(f)??null;let v,N;if(M!==null){const m=M.piezas,I=m===0?"#ef4444":m<=3?"#f59e0b":"#10b981",j=m===0?"#fee2e2":m<=3?"#fef3c7":"#d1fae5",E=M.detalle.map(R=>`${R.nombre}: ${R.stock}\xF7${R.qty}=${R.posibles}pzs`).join(" | ");v=`
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(E)}"
                        style="padding:3px 12px;border-radius:8px;background:${j};color:${I};
                               font-weight:700;font-size:.95rem;border:1px solid ${I}33;cursor:help;">
                        ${m}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`,N=m===0?'<span class="badge-danger">Sin stock MP</span>':m<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else{const m=l.get(String(t.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(t):t.stock||0),I=t.stockMin||5,j=m===0?"#ef4444":m<=I?"#f59e0b":"#10b981";v=`<span style="padding:3px 12px;border-radius:8px;background:${m===0?"#fee2e2":m<=I?"#fef3c7":"#d1fae5"};color:${j};font-weight:700;font-size:.95rem;">${m}</span>`,N=m===0?'<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">\u{1F534} Agotado</span>':m<=I?'<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">\u26A0\uFE0F Bajo Stock</span>':'<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">\u2705 Disponible</span>'}const W=`_invVar_${f}_open`,H=window[W]===!0,Y=t.variants&&t.variants.length>0?`<div>
                <button onclick="(()=>{window['_invVar_${f}_open']=!window['_invVar_${f}_open'];renderInventoryTable()})()" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${H?"\u25B2":"\u25B6"} ${t.variants.length} variante${t.variants.length!==1?"s":""}
                </button>
                ${H?'<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">'+t.variants.map(m=>`
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(m.type)}:</span>
                        ${_mkColorDot(m.type,_esc(m.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(m.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${m.qty??0}</span>
                    </div>`).join("")+"</div>":""}
               </div>`:'<span class="text-xs text-gray-400">Sin variantes</span>',Z=Number(t.cost)||0,q=Number(t.price)||0,X=Z&&q?(()=>{const m=(q-Z)/q*100,I=m>=40?"#10b981":m>=20?"#f59e0b":"#ef4444";return`<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${I};">${m.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,m).toFixed(0)}%;background:${I};border-radius:99px;"></div>
                    </div></div>`})():'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-amber-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
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
                    ${(()=>{const m=calcularProducibles(t);if(m===null)return"";const I=m>=5?"#16a34a":m>=1?"#d97706":"#dc2626",j=m>=5?"#d1fae5":m>=1?"#fef3c7":"#fee2e2",E=m===0?"Sin stock MP":`Producibles: ${m}`;return`<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${j};color:${I};border:1px solid ${I}33;">\u{1F3ED} ${E}</span></div>`})()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(S)}</td>
            <td class="px-4 py-3">${Y}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${f}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(t.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${f}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${v}</td>
            <td class="px-4 py-3">${N}</td>
            <td class="px-4 py-3">${X}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${t.tipo==="pack"?`<button type="button" onclick="openPackModal('${f}')" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`:`<button type="button" onclick="editProduct('${f}')" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u270F\uFE0F</button>`}
                    <button type="button" onclick="duplicarProducto('${f}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>
                    ${t.tipo!=="pack"?`<button type="button" onclick="cambiarTipoProducto('${f}')" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">\u2192\u{1F9EA}</button>`:""}
                    ${t.movimientos&&t.movimientos.length?`<button type="button" onclick="verMovimientosProducto('${f}')" title="Ver movimientos de stock (${t.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4CB}</button>`:""}
                    <button type="button" onclick="abrirMovimientoProducto('${f}')" title="Gr\xE1fica de movimientos \xFAltimos 90 d\xEDas" aria-label="Ver gr\xE1fica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F4C8}</button>
                    <button type="button" onclick="archivarProducto('${f}')" title="${t.activo===!1?"Desarchivar producto (activar)":"Archivar producto (ocultar)"}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${t.activo===!1?"\u{1F513}":"\u{1F4C1}"}</button>
                    <button type="button" onclick="deleteProduct('${f}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">\u{1F5D1}\uFE0F</button>
                </div>
            </td>
        </tr>`}function U(t,x){const f=String(t.id),w=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`:`<span style="font-size:1.6rem;">${t.image||"\u{1F3AF}"}</span>`,$=(t.tablaPreciosVariable||[]).slice().sort((C,Q)=>C.cantidadMin-Q.cantidadMin),S=$.length?$.map(C=>`<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${C.cantidadMin} pzas = $${Number(C.precio).toFixed(2)}</span>`).join(" "):'<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>',M=(t.mpComponentes||[]).length,v=(window.categories||[]).find(C=>String(C.id)===String(t.category)),N=v?`${v.emoji||""} ${v.name}`:"\u2014",W=$,H=W.length?W[0].precio/(W[0].cantidadMin||1):0,re=H>0?`<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${H.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`:'<span style="color:#9ca3af;font-size:.8rem;">\u2014</span>',Y=z.get(String(t.id))??null;let Z,q;if(Y!==null){const C=Y.piezas,Q=C===0?"#ef4444":C<=3?"#f59e0b":"#10b981",de=C===0?"#fee2e2":C<=3?"#fef3c7":"#d1fae5",se=Y.detalle.map(te=>`${te.nombre}: ${te.stock}\xF7${te.qty}=${te.posibles}pzs`).join(" | ");Z=`<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(se)}" style="padding:3px 12px;border-radius:8px;background:${de};color:${Q};font-weight:700;font-size:.95rem;border:1px solid ${Q}33;cursor:help;">${C}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`,q=C===0?'<span class="badge-danger">Sin stock MP</span>':C<=3?'<span class="badge-warning">MP bajo</span>':'<span class="badge-success">Disponible</span>'}else Z='<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>',q='<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>';const X=(t.mpComponentes||[]).reduce((C,Q)=>C+(parseFloat(Q.costUnit)||0)*(parseFloat(Q.qty)||1),0),m=t.rendimientoPorHoja||1,I=m>0?X/m:X,j=H>0?Math.round((H-I)/H*100):0,E=j>=40?"#10b981":j>=20?"#f59e0b":"#ef4444",R=H>0?`<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${E};">${j}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,j)}%;background:${E};border-radius:99px;"></div>
                </div></div>`:'<span class="text-gray-300 text-xs">\u2014</span>';return`
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${x*.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${f}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${w}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(t.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${t.rendimientoPorHoja?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">\u{1F5D2}\uFE0F ${t.rendimientoPorHoja} uds/hoja \xB7 ${M} MP${M!==1?"s":""}</div>`:M>0?`<div style="font-size:10px;color:#6b7280;margin-top:2px;">${M} MP${M!==1?"s":""}</div>`:""}
                    ${t.notas?`<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(t.notas)}">${_esc(t.notas)}</div>`:""}
                    ${t.tags&&t.tags.length?`<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${t.tags.map(C=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(C)}</span>`).join("")}</div>`:""}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(t.sku||"\u2014")}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(N)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${S}</div></td>
            <td class="px-4 py-3 text-right">${re}</td>
            <td class="px-4 py-3">${Z}</td>
            <td class="px-4 py-3">${q}</td>
            <td class="px-4 py-3">${R}</td>
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
        </tr>`}function K({id:t,title:x,titleColor:f,titleBg:w,btnLabel:$,btnOnclick:S,btnColor:M,extraBtnHTML:v,products:N,renderFila:W,headers:H,emptyMsg:re}){const Y=document.getElementById("inventoryTipoFilter")?.value||"";if(Y==="materia"&&t!=="mp"||Y==="producto"&&t==="mp")return"";const Z=(document.getElementById("inventorySearch")?.value?.trim()||"").length>0;if(N.length===0&&Z)return"";const q=L(N),X=`_invPage_${t}`,m=window._invPageSize||10;window[X]=window[X]||1;const I=q.length,j=Math.max(1,Math.ceil(I/m));window[X]>j&&(window[X]=1);const E=window[X],R=(E-1)*m,C=q.slice(R,R+m),Q=C.length===0?`<tr><td colspan="${H.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${re}</td></tr>`:C.map((V,ne)=>W(V,ne)).join(""),de=H.map(V=>{const ne=V.colId==="sku"?" inv-col-hidden-sku":V.colId==="proveedor"?" inv-col-hidden-prov":"",ie=V.align==="right"?" text-right":" text-left";return V.sortKey?`<th class="px-4 py-3${ie} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${ne}" onclick="sortInventory('${V.sortKey}')" style="white-space:nowrap;">${V.label} \u2195</th>`:`<th class="px-4 py-3${ie} text-xs font-semibold text-gray-500 uppercase tracking-wide${ne}" style="white-space:nowrap;">${V.label}</th>`}).join("");let se="";if(j>1||I>m){const V=Math.min(R+m,I);se=`
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${R+1}\u2013${V}</b> de <b>${I}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${t}',${E-1})" ${E<=1?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${E<=1?"default":"pointer"};opacity:${E<=1?.4:1};font-size:13px;">\u2039</button>
                    ${Array.from({length:Math.min(5,j)},(ne,ie)=>{let F=E<=3?ie+1:E+ie-2;return F<1&&(F=null),F>j&&(F=null),F===null?"":`<button onclick="invSectionPage('${t}',${F})" style="min-width:30px;padding:4px 8px;border:1px solid ${F===E?"#C5973B":"#e5e7eb"};border-radius:7px;background:${F===E?"#C5973B":"#fff"};color:${F===E?"#fff":"#374151"};font-weight:${F===E?700:400};font-size:13px;cursor:${F===E?"default":"pointer"};" ${F===E?"disabled":""}>${F}</button>`}).join("")}
                    <button onclick="invSectionPage('${t}',${E+1})" ${E>=j?"disabled":""} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${E>=j?"default":"pointer"};opacity:${E>=j?.4:1};font-size:13px;">\u203A</button>
                </div>
            </div>`}const te=`_invSec_${t}_collapsed`,ce=window[te]===!0;return`
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${f}33;box-shadow:0 2px 12px ${f}11;">
            <!-- Header de secci\xF3n (clicable para colapsar) -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${w};border-bottom:${ce?"none":"1.5px solid "+f+"33"};cursor:pointer;" onclick="(()=>{const k='_invSec_${t}_collapsed';window[k]=!window[k];renderInventoryTable()})()">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${f};transition:transform .2s;">${ce?"\u25B6":"\u25BC"}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${f};">${x}</span>
                    <span style="background:${f};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${I}</span>
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
        </div>`}const O=a.filter(t=>!t.deletedAt),D=O.length,ee=O.reduce((t,x)=>{const f=l.get(String(x.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(x):parseInt(x.stock)||0);return t+(Number(x.cost)||0)*Math.max(0,f)},0),J=O.filter(t=>(l.get(String(t.id))??(typeof getStockEfectivo=="function"?getStockEfectivo(t):parseInt(t.stock)||0))<=(t.stockMin||5)).length,ae=O.filter(t=>(!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack")&&Number(t.price)>0),le=ae.length?ae.reduce((t,x)=>{const f=Number(x.price)||0,w=Number(x.cost)||0;return t+(f>0?(f-w)/f*100:0)},0)/ae.length:0;let oe=document.getElementById("invKpiBar");oe||(oe=document.createElement("div"),oe.id="invKpiBar",n.parentNode.insertBefore(oe,n)),oe.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${D}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#7c3aed;">$${ee.toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
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
    </div>`;const pe=[{id:"pt",title:"\u{1F4E6} Productos Terminados",titleColor:"#C5973B",titleBg:"linear-gradient(135deg,#fffbeb,#fef9f0)",btnLabel:"+ Producto",btnOnclick:"openAddProductModal()",extraBtnHTML:'<button type="button" onclick="injectPackModal();openPackModal()" class="mk-toolbar-btn">\u{1F381} Crear Pack</button><button type="button" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">\u{1F4CA} Actualizar precios</button>',products:A,renderFila:P,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Producto",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Variantes"},{label:"Precio",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margin"},{label:"Acciones"}],emptyMsg:"Sin productos terminados. Agrega uno con el bot\xF3n +"},{id:"pv",title:"\u{1F3AF} Productos Variables (Stickers, Tarjetas...)",titleColor:"#0369a1",titleBg:"linear-gradient(135deg,#f0f9ff,#e0f2fe)",btnLabel:"+ Producto Variable",btnOnclick:"injectVariableProductModal();openVariableProductModal()",products:B,renderFila:U,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Tabla de precios"},{label:"Precio/pza",sortKey:"price",align:"right"},{label:"Disponible"},{label:"Estado"},{label:"Margen",sortKey:"margen"},{label:"Acciones"}],emptyMsg:"Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad."},{id:"mp",title:"\u{1F3ED} Materias Primas",titleColor:"#7c3aed",titleBg:"linear-gradient(135deg,#faf5ff,#f5f3ff)",btnLabel:"+ Materia Prima",btnOnclick:"injectMpModal();openAddMateriaPrimaModal()",extraBtnHTML:'<button type="button" onclick="abrirBulkStockModal()" class="mk-toolbar-btn">\u{1F4E6} Ajustar stock masivo</button>',products:T,renderFila:u,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Categor\xEDa",sortKey:"category"},{label:"Costo",align:"right"},{label:"Proveedor",colId:"proveedor"},{label:"Stock",sortKey:"stock"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin materias primas. Agrega una con el bot\xF3n +"},{id:"svc",title:"\u2699\uFE0F Servicios y Consumibles",titleColor:"#6d28d9",titleBg:"linear-gradient(135deg,#f5f3ff,#ede9fe)",btnLabel:"+ Nuevo Servicio",btnOnclick:"injectSvcModal();openServicioModal()",products:b,renderFila:h,headers:[{label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#7c3aed;">',sortKey:null},{label:""},{label:"Nombre",sortKey:"name"},{label:"SKU",sortKey:"sku",colId:"sku"},{label:"Costo/uso",align:"right"},{label:"Estado"},{label:"Acciones"}],emptyMsg:"Sin servicios. Agrega el uso del l\xE1ser, vinil por pieza, etc."}],fe=(g||c||k).length>0;let ue=!1;for(const t of pe){const x=K(t);x&&(ue=!0);let f=document.getElementById(`invSec_${t.id}`);f||(f=document.createElement("div"),f.id=`invSec_${t.id}`,n.appendChild(f));const w=t.products.length+"_"+t.products.reduce(($,S)=>$+String(S.id),"")+"_"+(window[`_invPage_${t.id}`]||1)+"_"+(window._invSortCol||"")+(window._invSortDir||"")+"_"+r;f._hash!==w&&(f.innerHTML=x,f._hash=w)}const ge=new Set(pe.map(t=>`invSec_${t.id}`));for(let t=n.children.length-1;t>=0;t--){const x=n.children[t];x.id&&x.id.startsWith("invSec_")&&!ge.has(x.id)&&x.remove()}fe&&!ue&&(n.innerHTML=`
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">\u{1F50D}</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu b\xFAsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro t\xE9rmino o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar b\xFAsqueda
            </button>
        </div>`)}function invSectionPage(e,o){const r=`_invPage_${e}`,s=window.products||[],i=e==="mp"?s.filter(c=>c.tipo==="materia_prima"):e==="svc"?s.filter(c=>c.tipo==="servicio"):e==="pv"?s.filter(c=>c.tipo==="producto_variable"):s.filter(c=>!c.tipo||c.tipo==="producto"||c.tipo==="producto_interno"||c.tipo==="pack"),n=(document.getElementById("inventorySearch")||{}).value?.trim().toLowerCase()||"",a=(document.getElementById("inventoryTagFilter")||{}).value||"",l=(document.getElementById("inventoryProveedorFilter")||{}).value?.trim().toLowerCase()||"",d=i.filter(c=>{const k=!n||c.name.toLowerCase().includes(n)||(c.sku||"").toLowerCase().includes(n)||(c.proveedor||"").toLowerCase().includes(n)||(c.notas||"").toLowerCase().includes(n)||(c.tags||[]).some(b=>b.toLowerCase().includes(n)),y=!a||c.tags&&c.tags.includes(a),T=!l||(c.proveedor||"").toLowerCase().includes(l);return k&&y&&T}),g=Math.max(1,Math.ceil(d.length/(window._invPageSize||10)));window[r]=Math.max(1,Math.min(o,g)),renderInventoryTable()}window.invSectionPage=invSectionPage;function _renderInventoryPagination(e,o,r,s,i){let n=document.getElementById("inventoryPaginationBar");if(!n){const g=document.getElementById("inventoryTable")?.closest('table, .overflow-x-auto, [class*="overflow"]');if(!g)return;n=document.createElement("div"),n.id="inventoryPaginationBar",g.insertAdjacentElement("afterend",n)}if(o<=1&&r<=i){n.innerHTML="";return}const a=Math.min(s+i,r),l=`Mostrando <b>${s+1}\u2013${a}</b> de <b>${r}</b> productos`;function d(){const g=[],c=(k,y)=>{for(let T=k;T<=y;T++)g.push(T)};return o<=7?c(1,o):(g.push(1),e>4&&g.push("..."),c(Math.max(2,e-2),Math.min(o-1,e+2)),e<o-3&&g.push("..."),g.push(o)),g.map(k=>{if(k==="...")return'<span style="padding:0 4px;color:#9ca3af;">\u2026</span>';const y=k===e;return`<button onclick="invGoToPage(${k})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${y?"#C5973B":"#e5e7eb"};
                       background:${y?"#C5973B":"white"};color:${y?"white":"#374151"};
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
        <button onclick="duplicarProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#7c3aed","#f5f3ff")}>\u{1F4CB} Duplicar</button>
        <button onclick="cambiarTipoProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#b45309","#fef9c3")}>\u2192\u{1F4E6} Convertir a PT</button>
        <button onclick="abrirMovimientoProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#4338ca","#eef2ff")}>\u{1F4C8} Ver gr\xE1fica</button>
        ${r?`<button onclick="(()=>{const p=(window.products||[]).find(x=>String(x.id)==='${o}');if(p?.proveedorUrl)window.open(p.proveedorUrl,'_blank');document.getElementById('_invMpMenuDrop')?.remove()})()" ${a("#16a34a","#f0fdf4")}>\u{1F517} Abrir proveedor</button>`:""}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button onclick="archivarProducto('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#6b7280","#f9fafb")}>\u{1F4C1} ${s==="desarchivar"?"Desarchivar":"Archivar"}</button>
        <button onclick="deleteProduct('${o}');document.getElementById('_invMpMenuDrop')?.remove()" ${a("#dc2626","#fef2f2")}>\u{1F5D1}\uFE0F Eliminar</button>
    `,document.body.appendChild(n);const l=e.getBoundingClientRect();n.style.top=l.bottom+window.scrollY+4+"px",n.style.left=Math.min(l.left+window.scrollX,window.innerWidth-180)+"px",setTimeout(()=>document.addEventListener("click",function d(g){n.contains(g.target)||(n.remove(),document.removeEventListener("click",d))}),0)}window._invMpMenu=_invMpMenu;let _inventorySearchTimer=null;function _debounceInventorySearch(){_inventorySearchTimer&&clearTimeout(_inventorySearchTimer),_inventorySearchTimer=setTimeout(renderInventoryTable,300)}window._debounceInventorySearch=_debounceInventorySearch;function renderMovimientos(){const o=document.getElementById("movimientosLista");if(!o)return;const r=(document.getElementById("movBuscar")||{}).value?.trim().toLowerCase()||"",s=(document.getElementById("movTipoFilter")||{}).value||"";let i=window.stockMovements||[];r&&(i=i.filter(b=>b.productoNombre?.toLowerCase().includes(r)||(b.motivo||"").toLowerCase().includes(r))),s&&(i=i.filter(b=>(b.tipo||"")===s));const n=_fechaHoy(),a=(window.stockMovements||[]).filter(b=>{try{const B=new Date(b.fecha);return B.getFullYear()+"-"+("0"+(B.getMonth()+1)).slice(-2)+"-"+("0"+B.getDate()).slice(-2)===n}catch{return!1}}),l={};a.forEach(b=>{l[b.tipo]=(l[b.tipo]||0)+1});const d={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"},g={entrada:"Entradas",salida:"Salidas",ajuste:"Ajustes",creacion:"Creaciones",venta:"Ventas",merma:"Mermas"};let c=document.getElementById("movResumenHoy");c||(c=document.createElement("div"),c.id="movResumenHoy",o.parentNode.insertBefore(c,o));const k=Object.keys(l).map(b=>`${d[b]||"\u26AA"} ${g[b]||b}: <strong>${l[b]}</strong>`);c.innerHTML=k.length?`<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${k.join("&nbsp;&nbsp;")}
           </div>`:"";let y=document.getElementById("movExportCSVBtn");if(y||(y=document.createElement("button"),y.id="movExportCSVBtn",y.textContent="\u{1F4E5} Exportar historial CSV",y.style.cssText="background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;",y.onclick=function(){const b=window.stockMovements||[];let A=["Fecha","Producto","Tipo","Cantidad","Motivo","Stock antes","Stock despu\xE9s"].join(",")+`
`;b.forEach(L=>{const u=[new Date(L.fecha).toLocaleString("es-MX"),L.productoNombre||"",L.tipo||"",L.cantidad,L.motivo||"",L.stockAntes??"",L.stockDespues??""];A+=u.map(h=>`"${String(h).replace(/"/g,'""')}"`).join(",")+`
`});const G=new Blob([A],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(G),z=document.createElement("a");z.href=_,z.download=`movimientos-${n}.csv`,z.click(),URL.revokeObjectURL(_)},o.parentNode.insertBefore(y,o)),!i.length){o.innerHTML='<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';return}const T={entrada:"\u{1F7E2}",salida:"\u{1F534}",ajuste:"\u{1F7E1}",creacion:"\u{1F535}",venta:"\u{1F7E0}",merma:"\u{1F7E4}"};o.innerHTML=i.slice(0,200).map(b=>{const B=new Date(b.fecha).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}),A=b.cantidad>=0?`+${b.cantidad}`:`${b.cantidad}`;return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${T[b.tipo]||"\u26AA"}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(b.productoNombre||(b.productoId&&!(window.products||[]).find(G=>String(G.id)===String(b.productoId))?"(producto eliminado)":"\u2014"))}</div>
                <div style="color:#6b7280;font-size:11px;">${B} \xB7 ${b.tipo} \xB7 ${_esc(b.motivo||"Sin motivo")}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${b.cantidad>=0?"#10b981":"#ef4444"};">${A} uds</div>
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
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#7c3aed;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">\u{1F4E5} Exportar</button>
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
          onfocus="this.style.borderColor='#C5973B'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">\u2705 Aplicar ajustes</button>
    </div>`;_mkInvModal("mkConteo","\u{1F4CB} Conteo F\xEDsico de Inventario",s,"780px")}window.abrirConteoFisico=abrirConteoFisico,window._mkAplicarConteoFisico=function(){const e=document.querySelectorAll("#mkConteo_ov .conteo-input");let o=0;if(e.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.sistema),n=Number(r.value);if(isNaN(n)||n===i)return;const a=(window.products||[]).find(d=>String(d.id)===String(s));if(!a)return;const l=n-i;a.stock=n,typeof registrarMovimiento=="function"&&registrarMovimiento({productoId:a.id,productoNombre:a.name,tipo:l>0?"entrada_manual":"salida_manual",cantidad:Math.abs(l),motivo:"Conteo f\xEDsico",stockAntes:i,stockDespues:n}),o++}),o===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin diferencias que ajustar","warn");return}typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkConteo_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 ${o} ajuste${o!==1?"s":""} aplicados`,"ok")};function abrirReabastecimiento(){const e=(window.products||[]).filter(i=>i.tipo==="servicio"||i.activo===!1?!1:(typeof getStockEfectivo=="function"?getStockEfectivo(i):Number(i.stock)||0)<=(Number(i.stockMin)||5));if(!e.length){typeof manekiToastExport=="function"&&manekiToastExport("\u2705 Sin productos bajo stock m\xEDnimo","ok");return}const o=_esc,r={};e.forEach(i=>{const n=i.proveedor||"Sin proveedor";r[n]||(r[n]=[]),r[n].push(i)});const s=Object.entries(r).map(([i,n])=>{const a=o(i),l=n.map(c=>{const k=typeof getStockEfectivo=="function"?getStockEfectivo(c):Number(c.stock)||0,y=Number(c.stockMin)||5,T=Math.max(1,y*2-k);return`<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${o(c.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${k}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${y}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#C5973B;">${T}</td>
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
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([r],{type:"text/csv;charset=utf-8;"}));const i=new Date,n=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`;s.download=`reabastecimiento_${n}.csv`,s.click()};function mostrarDonutCategoria(){const e=_esc,o={};(window.products||[]).forEach(l=>{if(l.tipo==="servicio"||l.activo===!1)return;const d=typeof getStockEfectivo=="function"?getStockEfectivo(l):Number(l.stock)||0,g=(Number(l.price)||0)*d,c=l.category||"Sin categor\xEDa";o[c]=(o[c]||0)+g});const r=Object.entries(o).sort((l,d)=>d[1]-l[1]),s=r.reduce((l,[,d])=>l+d,0),i=["#C5973B","#7c3aed","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#f97316","#14b8a6"],n=r.map(([l,d],g)=>{const c=s>0?(d/s*100).toFixed(1):"0";return`<tr>
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
        <input type="checkbox" checked data-pid="${e(a.id)}" data-nuevo="${g}" class="mkStockMinCb" style="accent-color:#C5973B;width:16px;height:16px;">
      </td>
    </tr>`}).join("")}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">\u{1F916} Aplicar seleccionados</button>
    </div>`;_mkInvModal("mkStockMin","\u{1F916} Stock M\xEDnimo Sugerido",n,"780px")}window.sugerirStockMinimo=sugerirStockMinimo,window._mkAplicarStockMinSugerido=function(){const e=document.querySelectorAll("#mkStockMin_ov .mkStockMinCb:checked");let o=0;e.forEach(r=>{const s=r.dataset.pid,i=Number(r.dataset.nuevo),n=(window.products||[]).find(a=>String(a.id)===String(s));!n||isNaN(i)||(n.stockMin=i,o++)}),o&&(typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),document.getElementById("mkStockMin_ov")?.remove(),typeof manekiToastExport=="function"&&manekiToastExport(`\u2705 Stock m\xEDnimo actualizado en ${o} producto${o!==1?"s":""}`,"ok"))};function archivarProducto(e){const o=(window.products||[]).find(n=>String(n.id)===String(e));if(!o)return;const r=o.activo!==!1,s=r?"archivar":"desarchivar",i=r?`\xBFArchivar "${o.name}"? Dejar\xE1 de aparecer en inventario y b\xFAsquedas, pero se conserva el historial.`:`\xBFDesarchivar "${o.name}"? Volver\xE1 a aparecer en inventario.`;typeof showConfirm=="function"&&showConfirm(i,r?"\u{1F4C1} Archivar":"\u{1F513} Desarchivar").then(n=>{n&&(o.activo=!r,o.updatedAt=new Date().toISOString(),typeof saveProducts=="function"&&saveProducts(),typeof renderInventoryTable=="function"&&renderInventoryTable(),typeof manekiToastExport=="function"&&manekiToastExport(r?`\u{1F4C1} "${o.name}" archivado`:`\u{1F513} "${o.name}" desarchivado`,"ok"))})}window.archivarProducto=archivarProducto;function abrirMovimientoProducto(e){const o=_esc,r=(window.products||[]).find(u=>String(u.id)===String(e));if(!r){typeof manekiToastExport=="function"&&manekiToastExport("Producto no encontrado","warn");return}const s=Date.now()-90*864e5,i=new Set,n=[],a=u=>{if(!u)return;const h=u.fecha?new Date(u.fecha+(u.hora?"T"+u.hora:"")).getTime():u.timestamp?new Date(u.timestamp).getTime():0;if(h&&h<s)return;const P=u.id||String(u.productoId||e)+"_"+h+"_"+(u.cantidad||0);i.has(P)||(i.add(P),n.push({...u,_ts:h||Date.now()}))};(r.movimientos||[]).forEach(a),(window.stockMovimientos||[]).filter(u=>String(u.productoId)===String(e)).forEach(a),n.sort((u,h)=>h._ts-u._ts);const l=[];for(let u=12;u>=0;u--){const h=new Date(Date.now()-u*7*864e5),P=new Date(h.getTime()-7*864e5),U=`${P.getDate()}/${P.getMonth()+1}`;let K=0,O=0;n.forEach(D=>{if(D._ts>=P.getTime()&&D._ts<h.getTime()){const ee=D.stockDespues!=null&&D.stockAntes!=null?Number(D.stockDespues)-Number(D.stockAntes):0,J=(D.tipo||"").toLowerCase();ee>0||J.includes("entrada")||J.includes("compra")||J.includes("ajuste_positivo")?K+=Math.abs(Number(D.cantidad)||Math.abs(ee)||1):O+=Math.abs(Number(D.cantidad)||Math.abs(ee)||1)}}),l.push({label:U,entradas:K,salidas:O})}const d=Math.max(1,...l.map(u=>Math.max(u.entradas,u.salidas))),g=480,c=100,k=Math.floor((g-20)/l.length/2)-1,y=l.map((u,h)=>{const P=10+h*(k*2+4),U=Math.round(u.entradas/d*(c-20)),K=Math.round(u.salidas/d*(c-20));return`
      <rect x="${P}" y="${c-10-U}" width="${k}" height="${U}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${u.entradas}"/>
      <rect x="${P+k+1}" y="${c-10-K}" width="${k}" height="${K}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${u.salidas}"/>
      <text x="${P+k}" y="${c-1}" text-anchor="middle" font-size="8" fill="#9ca3af">${u.label}</text>`}).join(""),T=n.length===0?'<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los \xFAltimos 90 d\xEDas</p>':`
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
    </div>`,b={entrada_manual:"\u{1F4E5} Entrada manual",compra:"\u{1F6D2} Compra",ajuste_positivo:"\u2795 Ajuste +",salida_manual:"\u{1F4E4} Salida manual",merma:"\u{1F5D1}\uFE0F Merma",venta:"\u{1F4B0} Venta",descuento_pedido:"\u{1F4E6} Pedido",ajuste_negativo:"\u2796 Ajuste \u2212"},B=n.slice(0,30).map(u=>{const h=u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):"\u2014"),P=u.hora||"",U=b[u.tipo||""]||u.tipo||"\u2014",K=u.stockDespues!=null&&u.stockAntes!=null?Number(u.stockDespues)-Number(u.stockAntes):0,O=Number(u.cantidad)||Math.abs(K)||0,D=K>0||(u.tipo||"").includes("entrada")||(u.tipo||"").includes("compra"),ee=D?"#10b981":"#ef4444",J=D?`+${O}`:`-${O}`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${o(h)} ${P?`<span style="color:#9ca3af;font-size:.72rem;">${o(P.substring(0,5))}</span>`:""}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${o(U)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${ee};">${J}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${u.stockDespues!=null?u.stockDespues:"\u2014"}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o(u.motivo||"")}">${o(u.motivo||"")}</td>
    </tr>`}).join(""),A=typeof getStockEfectivo=="function"?getStockEfectivo(r):Number(r.stock)||0,G=n.reduce((u,h)=>{const P=h.stockDespues!=null&&h.stockAntes!=null?Number(h.stockDespues)-Number(h.stockAntes):0;return u+(P>0||(h.tipo||"").includes("entrada")||(h.tipo||"").includes("compra")?Math.abs(Number(h.cantidad)||Math.abs(P)||0):0)},0),_=n.reduce((u,h)=>{const P=h.stockDespues!=null&&h.stockAntes!=null?Number(h.stockDespues)-Number(h.stockAntes):0,U=P>0||(h.tipo||"").includes("entrada")||(h.tipo||"").includes("compra");return u+(U?0:Math.abs(Number(h.cantidad)||Math.abs(P)||0))},0),z=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${A}</div>
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
        var movs=${JSON.stringify(n.map(u=>({fecha:u.fecha||(u._ts?new Date(u._ts).toLocaleDateString("es-MX"):""),hora:u.hora||"",tipo:u.tipo||"",cantidad:u.cantidad||0,motivo:u.motivo||"",stockAntes:u.stockAntes??"",stockDespues:u.stockDespues??""})))};
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
    ${z}`;_mkInvModal("mkMovProd",`\u{1F4C8} Movimientos \u2014 ${o(r.name||"Producto")} (90d)`,L,"780px")}window.abrirMovimientoProducto=abrirMovimientoProducto;function abrirTendenciaInventario(){const e=window.inventarioSnapshots||[];if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin datos hist\xF3ricos a\xFAn. Los snapshots se generan autom\xE1ticamente.","warn");return}const o=[...e].sort((_,z)=>(_.fecha||"").localeCompare(z.fecha||"")),r=o.map(_=>_.fecha||""),s=o.map(_=>Number(_.valorTotal||_.valor||0)),i=540,n=140,a=Math.max(1,...s),l=Math.min(...s),d=a-l||1,c=`<polyline points="${s.map((_,z)=>{const L=20+z/Math.max(1,s.length-1)*(i-40),u=n-20-(_-l)/d*(n-40);return`${L},${u}`}).join(" ")}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`,k=s.map((_,z)=>{const L=20+z/Math.max(1,s.length-1)*(i-40),u=n-20-(_-l)/d*(n-40);return`<circle cx="${L}" cy="${u}" r="3.5" fill="#6366f1" opacity=".9"><title>${r[z]}: $${_.toLocaleString("es-MX")}</title></circle>`}).join(""),y=r.filter((_,z)=>z===0||z===r.length-1||z%Math.ceil(r.length/6)===0).map((_,z,L)=>`<text x="${20+r.indexOf(_)/Math.max(1,r.length-1)*(i-40)}" y="${n-2}" text-anchor="middle" font-size="9" fill="#9ca3af">${_.slice(5)}</text>`).join(""),T=s[s.length-1]||0,b=s[0]||0,B=b>0?((T-b)/b*100).toFixed(1):"\u2014",A=Number(B)>=0?"#10b981":"#ef4444",G=`
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${T.toLocaleString("es-MX",{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${A};">${Number(B)>=0?"+":""}${B}%</div>
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
    </div>`;_mkInvModal("mkTendenciaInv","\u{1F4C8} Tendencia del Valor de Inventario",G,"640px")}window.abrirTendenciaInventario=abrirTendenciaInventario;function abrirMovimientosRecientes(){const e=_esc,o=[...window.stockMovements||window.stockMovimientos||[]].slice(0,50);if(o.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin movimientos registrados a\xFAn","warn");return}const r={ajuste:"#6366f1",entrada:"#10b981",compra:"#10b981",merma:"#ef4444",salida:"#ef4444",descuento:"#f59e0b",produccion:"#f59e0b",conteo:"#3b82f6",ajuste_positivo:"#10b981"},s=o.map(n=>{const a=(n.fecha||"").split("T"),l=a[0]||"",d=(a[1]||"").substring(0,5),g=(n.tipo||"").toLowerCase(),c=n.stockDespues!=null&&n.stockAntes!=null?Number(n.stockDespues)-Number(n.stockAntes):0,k=c>0||g.includes("entrada")||g.includes("compra")||g.includes("ajuste_positivo"),y=Number(n.cantidad)||Math.abs(c)||0,T=k?`<span style="color:#10b981;font-weight:700;">+${y}</span>`:`<span style="color:#ef4444;font-weight:700;">\u2212${y}</span>`,b=r[g]||"#6b7280",B=`<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${b}22;color:${b};font-size:.7rem;font-weight:700;">${e(n.tipo||"\u2014")}</span>`,A=n.productoId?`<button onclick="abrirMovimientoProducto('${e(String(n.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${e(n.productoNombre||n.productoId)}</button>`:`<span style="font-size:.8rem;">${e(n.productoNombre||"\u2014")}</span>`;return`<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${e(l)} <span style="color:#9ca3af;font-size:.7rem;">${d}</span></td>
      <td style="padding:6px 10px;">${A}</td>
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
