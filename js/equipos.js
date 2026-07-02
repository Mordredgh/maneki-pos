"use strict";let equipos=[],roiHistorial=[],roiConfig={porcentaje:10},_roiPedidoData=null;function saveEquipos(){sbSave("equipos",equipos)}function saveRoiHistorial(){sbSave("roiHistorial",roiHistorial)}function saveAbonos(){}function saveRoiConfig(){const t=parseFloat(document.getElementById("roiPorcentajeGlobal").value)||10;roiConfig.porcentaje=Math.min(100,Math.max(1,t)),sbSave("roiConfig",roiConfig),manekiToastExport("\u2705 Porcentaje ROI guardado: "+roiConfig.porcentaje+"%","ok")}function openEquipoModal(t){const e=document.getElementById("equipoModal");document.getElementById("equipoEditId").value="",document.getElementById("equipoNombre").value="",document.getElementById("equipoEmoji").value="\u{1F527}",document.getElementById("equipoCostoOriginal").value="",document.getElementById("equipoMetaReemplazo").value="",document.getElementById("equipoModalTitle").textContent="Agregar Equipo";const o=document.getElementById("equipoEmojiDisplay");o&&(o.textContent="\u{1F527}");const n=document.getElementById("equipoEmojiSearch");n&&(n.value=""),_ensureMetaMensualField();const i=document.getElementById("equipoMetaMensual");if(i&&(i.value=""),t){const a=equipos.find(s=>s.id===t);a&&(document.getElementById("equipoEditId").value=a.id,document.getElementById("equipoNombre").value=a.nombre,document.getElementById("equipoEmoji").value=a.emoji||"\u{1F527}",o&&(o.textContent=a.emoji||"\u{1F527}"),document.getElementById("equipoCostoOriginal").value=a.costoOriginal,document.getElementById("equipoMetaReemplazo").value=a.metaReemplazo,i&&(i.value=a.metaMensual||""),document.getElementById("equipoModalTitle").textContent="Editar Equipo")}openModal(e),setTimeout(()=>renderEquipoEmojiGrid(),50)}function _ensureMetaMensualField(){if(document.getElementById("equipoMetaMensual"))return;const t=document.querySelector("#equipoModal .grid.grid-cols-2");if(!t)return;const e=document.createElement("div");e.style.marginTop="4px",e.innerHTML=`<label class="block text-sm font-semibold text-gray-600 mb-1" for="equipoMetaMensual">Meta mensual ($)</label>
        <input type="number" id="equipoMetaMensual" placeholder="Ej: 5000" min="0"
               class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:outline-none">
        <p class="text-xs text-gray-400 mt-1">Cu\xE1nto quieres recuperar por mes con este equipo</p>`,t.insertAdjacentElement("afterend",e)}function closeEquipoModal(){closeModal("equipoModal")}function saveEquipo(){const t=document.getElementById("equipoNombre").value.trim(),e=document.getElementById("equipoEmoji").value.trim()||"\u{1F527}",o=parseFloat(document.getElementById("equipoCostoOriginal").value)||0,n=parseFloat(document.getElementById("equipoMetaReemplazo").value)||o,i=parseFloat(document.getElementById("equipoMetaMensual")?.value)||0;if(!t){manekiToastExport("\u26A0\uFE0F Ingresa el nombre del equipo","warn");return}if(!o){manekiToastExport("\u26A0\uFE0F Ingresa el costo original del equipo","warn");return}const a=document.getElementById("equipoEditId").value;if(a){const s=equipos.findIndex(r=>String(r.id)===String(a));s!==-1&&(equipos[s]={...equipos[s],nombre:t,emoji:e,costoOriginal:o,metaReemplazo:n,metaMensual:i,historialPagos:equipos[s].historialPagos||[]}),manekiToastExport("\u2705 Equipo actualizado","ok")}else equipos.push({id:mkId(),nombre:t,emoji:e,costoOriginal:o,metaReemplazo:n,metaMensual:i,recuperado:0,historialPagos:[]}),manekiToastExport("\u2705 Equipo agregado","ok");saveEquipos(),closeEquipoModal(),renderEquiposGrid()}function deleteEquipo(t){showConfirm("\xBFEliminar este equipo? Se perder\xE1 su historial de ROI.","\u{1F5D1}\uFE0F Eliminar equipo").then(e=>{e&&(equipos=equipos.filter(o=>o.id!==t),roiHistorial=roiHistorial.filter(o=>!o.equiposIds.includes(t)),saveEquipos(),saveRoiHistorial(),renderEquiposGrid(),renderRoiHistorial(),manekiToastExport("\u{1F5D1}\uFE0F Equipo eliminado","ok"))})}function renderEquiposGrid(){const t=document.getElementById("equiposGrid");if(t){if(equipos.length===0){t.innerHTML=`<div class="col-span-full text-center py-16 text-gray-400">
            <i class="fas fa-tools text-5xl mb-4 block opacity-30"></i>
            <p class="text-lg font-medium">A\xFAn no tienes equipos registrados</p>
            <p class="text-sm mt-1">Agrega tu primer equipo para empezar a calcular el ROI</p>
            <button onclick="openEquipoModal()" class="mt-4 px-6 py-2 rounded-xl text-white font-semibold" style="background:#FFD166;">+ Agregar equipo</button>
        </div>`;return}t.innerHTML=equipos.map(e=>{e.historialPagos||(e.historialPagos=[]);const o=e.costoOriginal>0?Math.min(100,e.recuperado/e.costoOriginal*100):0,n=e.metaReemplazo>0?Math.min(100,e.recuperado/e.metaReemplazo*100):0,i=Math.max(0,e.costoOriginal-e.recuperado),a=Math.max(0,e.metaReemplazo-e.recuperado),r=o>=100?"#10B981":"#FFD166",l=n>=100?"#10B981":"#9669c4",p=_fechaHoy().substring(0,7),g=(e.historialPagos||[]).filter(c=>c.fecha&&c.fecha.startsWith(p)).reduce((c,d)=>c+Number(d.monto||0),0),u=Number(e.metaMensual)||0;let f="";if(u>0){const c=!u||isNaN(u)?0:Math.min(100,g/u*100),d=isNaN(c)?0:parseFloat(c.toFixed(1)),m=d<50?"#ef4444":d<80?"#f59e0b":"#10b981";f=`
            <!-- MEJ-4: Meta mensual -->
            <div class="mb-3" style="padding-top:8px;border-top:1px solid #f3f4f6;">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>\u{1F4C5} Meta mensual</span>
                    <span class="font-semibold" style="color:${m}">${d.toFixed(1)}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${d}%;background:${m};"></div>
                </div>
                <p class="text-xs mt-1" style="color:${m};">Meta: $${u.toLocaleString("es-MX")} | Recuperado: $${g.toLocaleString("es-MX")} (${d.toFixed(0)}%)</p>
            </div>`}const x=[...e.historialPagos||[]].reverse().slice(0,5),y=x.length===0?'<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin pagos registrados a\xFAn</p>':x.map(c=>`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f9fafb;font-size:.72rem;">
                    <div>
                        <span style="color:#374151;font-weight:600;">$${Number(c.monto||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</span>
                        ${c.concepto?`<span style="color:#9ca3af;margin-left:6px;">${_esc(c.concepto)}</span>`:""}
                    </div>
                    <span style="color:#9ca3af;">${c.fecha||""}</span>
                </div>`).join("");return`<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${_esc(e.emoji||"\u{1F527}")}</span>
                    <div>
                        <h4 class="font-bold text-gray-800 text-lg leading-tight">${_esc(e.nombre)}</h4>
                        <p class="text-xs text-gray-400">Inversi\xF3n: $${e.costoOriginal.toLocaleString("es-MX")}</p>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="openEquipoModal('${e.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50"><i class="fas fa-edit text-sm"></i></button>
                    <button onclick="deleteEquipo('${e.id}')" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><i class="fas fa-trash text-sm"></i></button>
                </div>
            </div>

            <!-- Recuperado de inversi\xF3n -->
            <div class="mb-3">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>\u{1F4B0} Recuperado de inversi\xF3n</span>
                    <span class="font-semibold" style="color:${r}">${o.toFixed(1)}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${o}%;background:${r};"></div>
                </div>
                <div class="flex justify-between text-xs mt-1">
                    <span class="text-green-600 font-medium">$${e.recuperado.toLocaleString("es-MX")} ahorrado</span>
                    <span class="text-red-400">${i>0?"Falta $"+i.toLocaleString("es-MX"):"\u2705 \xA1Inversi\xF3n recuperada!"}</span>
                </div>
            </div>

            <!-- Meta de reemplazo -->
            <div class="mb-1">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>\u{1F195} Meta reemplazo ($${e.metaReemplazo.toLocaleString("es-MX")})</span>
                    <span class="font-semibold" style="color:${l}">${n.toFixed(1)}%</span>
                </div>
                <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width:${n}%;background:${l};"></div>
                </div>
                <p class="text-xs mt-1 text-right" style="color:${l}">${a>0?"Falta $"+a.toLocaleString("es-MX")+" para equipo nuevo":"\u2705 \xA1Ya puedes comprar equipo nuevo!"}</p>
            </div>

            ${f}

            <!-- MEJ-5: bot\xF3n Ver pagos + historial -->
            <div style="margin-top:10px;border-top:1px solid #f3f4f6;padding-top:8px;">
                <button onclick="_togglePagosEquipo('${e.id}')"
                        style="font-size:.72rem;color:#6b7280;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:3px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;">
                    <i class="fas fa-list"></i> Ver pagos <span id="pagosCount_${e.id}" style="background:#f3f4f6;border-radius:99px;padding:1px 6px;">${e.historialPagos.length}</span>
                </button>
                <div id="pagosHistorial_${e.id}" style="display:none;margin-top:8px;">${y}</div>
            </div>
        </div>`}).join("")}}function _togglePagosEquipo(t){const e=document.getElementById("pagosHistorial_"+t);e&&(e.style.display=e.style.display==="none"?"block":"none")}window._togglePagosEquipo=_togglePagosEquipo;function _registrarPagoEquipo(t,e,o,n,i){const a=equipos.findIndex(l=>l.id===t);if(a===-1)return;equipos[a].historialPagos||(equipos[a].historialPagos=[]);const s=_fechaHoy(),r={id:Date.now(),fecha:s,monto:Number(e)||0,concepto:o||"",tipo:"pago"};n&&(r.pedidoId=n),i&&(r.folio=i),equipos[a].historialPagos.push(r)}window._registrarPagoEquipo=_registrarPagoEquipo;function renderRoiHistorial(){const t=document.getElementById("roiHistorialBody");if(!t)return;if(roiHistorial.length===0){t.innerHTML='<tr><td colspan="5"><div class="mk-empty" style="padding:36px 24px;"><div class="mk-empty-icon">\u2696\uFE0F</div><p class="mk-empty-title">Sin movimientos a\xFAn</p><p class="mk-empty-sub">Registra ingresos o gastos para ver tu balance aqu\xED.</p></div></td></tr>';return}const e=[...roiHistorial].reverse();t.innerHTML=e.map(o=>{const n=o.equiposIds.map(s=>{const r=equipos.find(l=>l.id===s);return r?`${_esc(r.emoji||"\u{1F527}")} ${_esc(r.nombre)}`:"(equipo eliminado)"}).join(", "),i=o.fecha?`<div class="text-xs text-gray-400">${o.fecha}</div>`:"";return`<tr class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3">${o.folio==="__manual__"?`<span class="text-xs text-gray-500 italic">${_esc(o.concepto||"Manual")}</span>`:`<span class="font-semibold text-amber-700">${_esc(o.folio||"\u2014")}</span>`}${i}</td>
            <td class="px-4 py-3 text-gray-600 text-xs">${n}</td>
            <td class="px-4 py-3 text-right text-green-600 font-medium">$${Number(o.ganancia||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
            <td class="px-4 py-3 text-right text-amber-600 font-medium">$${Number(o.totalRoi||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
            <td class="px-4 py-3 text-right text-purple-600 font-medium">$${Number(o.porEquipo||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
        </tr>`}).join("")}function abrirRoiEquiposModal(t){if(equipos.length===0)return;_roiPedidoData=t;const e=t.total||0;document.getElementById("roiPedidoFolio").textContent=t.folio,document.getElementById("roiGananciaEstimada").textContent="$"+e.toLocaleString("es-MX",{minimumFractionDigits:2}),document.getElementById("roiPctDisplay").textContent=roiConfig.porcentaje+"%",document.getElementById("roiPedidoId").value=t.id;const o=document.getElementById("roiEquiposLista");o.innerHTML=equipos.map(i=>`
        <label class="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-amber-300 cursor-pointer transition-all" id="roiEqLabel_${i.id}">
            <input type="checkbox" value="${i.id}" class="roi-equipo-check w-4 h-4 accent-amber-500" onchange="actualizarCalculoRoi()">
            <span class="text-xl">${_esc(i.emoji||"\u{1F527}")}</span>
            <span class="font-medium text-gray-700">${_esc(i.nombre)}</span>
        </label>
    `).join(""),_ensureRoiConceptoField();const n=document.getElementById("roiConceptoPago");n&&(n.value=`ROI pedido ${t.folio||""}`.trim()),actualizarCalculoRoi(),openModal("roiEquiposModal")}function _ensureRoiConceptoField(){if(document.getElementById("roiConceptoPago"))return;const t=document.getElementById("roiEquiposLista");if(!t)return;const e=document.createElement("div");e.style.marginBottom="12px",e.innerHTML=`<label style="font-size:.78rem;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Concepto del pago (opcional)</label>
        <input type="text" id="roiConceptoPago" placeholder="Ej: ROI pedido MAN-045"
               style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;box-sizing:border-box;"
               onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'">`,t.insertAdjacentElement("afterend",e)}function cerrarRoiEquiposModal(){closeModal("roiEquiposModal"),_roiPedidoData=null}function limpiarRoiDePedido(t){const e=((window.pedidos||pedidos||[]).find(n=>n.id===t)||{}).folio,o=roiHistorial.filter(n=>n.pedidoId===t||e&&n.folio===e);o.length!==0&&(o.forEach(n=>{n.equiposIds.forEach(i=>{const a=equipos.findIndex(s=>s.id===i);a!==-1&&(equipos[a].recuperado=Math.max(0,(equipos[a].recuperado||0)-n.porEquipo),Array.isArray(equipos[a].historialPagos)&&(equipos[a].historialPagos=equipos[a].historialPagos.filter(s=>s.pedidoId!==t&&(!e||s.folio!==e))))})}),saveEquipos(),roiHistorial=roiHistorial.filter(n=>n.pedidoId?n.pedidoId!==t:!0),saveRoiHistorial(),document.getElementById("equipos-section")&&!document.getElementById("equipos-section").classList.contains("hidden")&&(renderEquiposGrid(),renderRoiHistorial()))}function actualizarCalculoRoi(){const e=document.querySelectorAll(".roi-equipo-check:checked").length,o=document.getElementById("roiPedidoId").value,n=_roiPedidoData,a=(n&&n.total||0)*(roiConfig.porcentaje/100),s=e>0?a/e:0;document.getElementById("roiEquiposCount").textContent=e,document.getElementById("roiPorEquipoDisplay").textContent="$"+s.toLocaleString("es-MX",{minimumFractionDigits:2}),document.querySelectorAll(".roi-equipo-check").forEach(r=>{const l=r.closest("label");r.checked?(l.style.borderColor="#FFD166",l.style.background="#FFF9F0"):(l.style.borderColor="",l.style.background="")})}function confirmarRoiEquipos(){const t=Array.from(document.querySelectorAll(".roi-equipo-check:checked"));if(t.length===0){manekiToastExport("\u26A0\uFE0F Selecciona al menos un equipo","warn");return}const e=_roiPedidoData,o=e.total||0,n=o*(roiConfig.porcentaje/100),i=n/t.length,a=t.map(r=>r.value),s=document.getElementById("roiConceptoPago")?.value.trim()||`ROI pedido ${e.folio||""}`.trim();a.forEach(r=>{const l=equipos.findIndex(p=>p.id===r);l!==-1&&(equipos[l].recuperado=(equipos[l].recuperado||0)+i,_registrarPagoEquipo(r,i,s,e.id,e.folio))}),saveEquipos(),roiHistorial.push({fecha:_fechaHoy(),folio:e.folio,pedidoId:e.id,equiposIds:a,ganancia:o,totalRoi:n,porEquipo:i}),saveRoiHistorial(),cerrarRoiEquiposModal(),renderEquiposGrid(),renderRoiHistorial(),manekiToastExport(`\u{1F4B0} ROI registrado: $${i.toLocaleString("es-MX",{minimumFractionDigits:2})} por equipo`,"ok")}function abrirRoiManualModal(){const t=document.getElementById("roiManualEquiposLista");t&&(t.innerHTML=equipos.map(i=>`
            <label class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-amber-50" style="border-color:#e5e7eb;">
                <input type="checkbox" class="roi-manual-check" value="${i.id}" onchange="calcRoiManual()" style="accent-color:#FFD166;">
                <span class="text-lg">${i.emoji||"\u{1F527}"}</span>
                <span class="text-sm font-semibold text-gray-700">${_esc(i.nombre)}</span>
            </label>`).join(""));const e=document.getElementById("roiManualPct");e&&(e.textContent=roiConfig.porcentaje+"%");const o=document.getElementById("roiManualGanancia");o&&(o.value="");const n=document.getElementById("roiManualPorEquipo");n&&(n.textContent="$0.00"),openModal(document.getElementById("roiManualModal"))}function cerrarRoiManualModal(){closeModal("roiManualModal")}function calcRoiManual(){const t=parseFloat(document.getElementById("roiManualGanancia")?.value)||0,o=Array.from(document.querySelectorAll(".roi-manual-check:checked")).length,n=t*(roiConfig.porcentaje/100),i=o>0?n/o:0,a=document.getElementById("roiManualPct");a&&(a.textContent=roiConfig.porcentaje+"%");const s=document.getElementById("roiManualPorEquipo");s&&(s.textContent="$"+i.toLocaleString("es-MX",{minimumFractionDigits:2})),document.querySelectorAll(".roi-manual-check").forEach(r=>{const l=r.closest("label");r.checked?(l.style.borderColor="#FFD166",l.style.background="#FFF9F0"):(l.style.borderColor="",l.style.background="")})}function confirmarRoiManual(){const t=document.getElementById("roiManualConcepto")?.value.trim(),e=parseFloat(document.getElementById("roiManualGanancia")?.value)||0,o=Array.from(document.querySelectorAll(".roi-manual-check:checked"));if(!t){manekiToastExport("\u26A0\uFE0F Ingresa un concepto","warn");return}if(!e){manekiToastExport("\u26A0\uFE0F Ingresa el monto de ganancia","warn");return}if(o.length===0){manekiToastExport("\u26A0\uFE0F Selecciona al menos un equipo","warn");return}const n=e*(roiConfig.porcentaje/100),i=n/o.length,a=o.map(s=>s.value);a.forEach(s=>{const r=equipos.findIndex(l=>l.id===s);r!==-1&&(equipos[r].recuperado=(equipos[r].recuperado||0)+i,_registrarPagoEquipo(s,i,t))}),saveEquipos(),roiHistorial.push({fecha:_fechaHoy(),folio:"__manual__",concepto:t,pedidoId:null,equiposIds:a,ganancia:e,totalRoi:n,porEquipo:i}),saveRoiHistorial(),cerrarRoiManualModal(),renderEquiposGrid(),renderRoiHistorial(),manekiToastExport(`\u{1F4B0} ROI manual registrado: $${i.toLocaleString("es-MX",{minimumFractionDigits:2})} por equipo`,"ok")}let notas=[];function agregarNota(){const t=document.getElementById("notaInput"),e=t.value.trim();if(!e)return;const o={id:mkId(),texto:e,fecha:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short"}),hora:new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),done:!1};notas.unshift(o),t.value="",sbSave("notas",notas),renderNotas()}function toggleNota(t){const e=notas.find(o=>o.id===t);e&&(e.done=!e.done,sbSave("notas",notas),renderNotas())}function eliminarNota(t){notas=notas.filter(e=>e.id!==t),sbSave("notas",notas),renderNotas()}function renderNotas(){const t=document.getElementById("notasList"),e=document.getElementById("notasCount");if(!t)return;const o=notas.filter(n=>!n.done).length;if(e&&(e.textContent=o+" pendiente"+(o!==1?"s":"")),notas.length===0){t.innerHTML='<p class="text-gray-400 text-xs text-center py-4">Sin notas por ahora</p>';return}t.innerHTML=notas.map(n=>`
        <div class="flex items-start gap-3 p-3 rounded-xl border transition-all ${n.done?"bg-gray-50 border-gray-100 opacity-60":"bg-white border-gray-200"}">
            <button onclick="toggleNota('${n.id}')"
                    class="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${n.done?"border-green-400 bg-green-400":"border-gray-300 hover:border-yellow-400"}"
                    style="${n.done,""}">
                ${n.done?'<i class="fas fa-check text-white" style="font-size:9px"></i>':""}
            </button>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 ${n.done?"line-through text-gray-400":""}">${_esc(n.texto)}</p>
                <p class="text-xs text-gray-400 mt-0.5">${n.fecha} \xB7 ${n.hora}</p>
            </div>
            <button onclick="eliminarNota('${n.id}')"
                    class="text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                <i class="fas fa-times text-xs"></i>
            </button>
        </div>
    `).join("")}function handleAutocompleteKey(t){const e=document.getElementById("clientAutocompleteDropdown"),o=e.querySelectorAll(".autocomplete-item[data-index]");t.key==="ArrowDown"?(t.preventDefault(),autocompleteIndex=Math.min(autocompleteIndex+1,o.length-1),o.forEach((n,i)=>n.classList.toggle("selected",i===autocompleteIndex))):t.key==="ArrowUp"?(t.preventDefault(),autocompleteIndex=Math.max(autocompleteIndex-1,0),o.forEach((n,i)=>n.classList.toggle("selected",i===autocompleteIndex))):t.key==="Enter"&&autocompleteIndex>=0?(t.preventDefault(),o[autocompleteIndex]?.click()):t.key==="Escape"&&e.classList.add("hidden")}document.addEventListener("click",function(t){if(!t.target.closest("#customerName")&&!t.target.closest("#clientAutocompleteDropdown")){const e=document.getElementById("clientAutocompleteDropdown");e&&e.classList.add("hidden")}});function switchEquipoTab(t){["equipos","roi","historial"].forEach(function(e){const o=document.getElementById("equipoTab-"+e),n=document.getElementById("equipoTabPanel-"+e);!o||!n||(e===t?(o.style.background="#FFD166",o.style.color="white",n.classList.remove("hidden")):(o.style.background="",o.style.color="",n.classList.add("hidden")))}),t==="roi"&&typeof renderGraficaROI=="function"&&renderGraficaROI()}window.switchEquipoTab=switchEquipoTab;
//# sourceMappingURL=equipos.js.map
