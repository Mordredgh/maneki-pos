function _validEmail(n){return!n||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)}const _escAttr=window._esc;let _clientesSortCol="name",_clientesSortDir="asc";function sortClientes(n){_clientesSortCol===n?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=n,_clientesSortDir=n==="totalPurchases"?"desc":"asc"),renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const n=_clientesSortCol,o=_clientesSortDir==="asc"?1:-1;return[...clients].sort((a,r)=>{let i,c;return n==="totalPurchases"?(i=Number(a.totalPurchases||0),c=Number(r.totalPurchases||0),o*(i-c)):n==="lastPurchase"?(i=a.lastPurchase||"",c=r.lastPurchase||"",o*i.localeCompare(c)):(i=(a.name||"").toLowerCase(),c=(r.name||"").toLowerCase(),o*i.localeCompare(c))})}function _sortArrow(n){return _clientesSortCol!==n?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(n){const o=[...window.pedidos||[],...window.pedidosFinalizados||[]],a=window.pedidosFinalizados||[],r=p=>String(p||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),i=r(n),c=p=>p.clienteId&&String(p.clienteId)===String(n)||p.clientId&&String(p.clientId)===String(n)?!0:r(p.cliente||p.clientName||"")===i,t=o.filter(c),l=a.filter(c),d=t.length,e=l.reduce((p,f)=>p+(Number(f.total)||0),0),s=l.length>0?e/l.length:0,m=t.map(p=>p.fechaPedido||p.fechaCreacion||p.fecha||p.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:d,totalGastado:e,ticketPromedio:s,ultimoPedido:m}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(n){const o=_calcClienteStats(n.nombre||n.name||"");if(!o.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const a=new Date,r=new Date(o.ultimoPedido),i=Math.floor((a-r)/(1e3*60*60*24));return i<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:i<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(n){let o=String(n||"").replace(/[\s\-\(\)]/g,""),a;o.startsWith("+")||o.startsWith("52")?a=`https://wa.me/${o.replace("+","")}`:a=`https://wa.me/521${o}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(a):window.open(a,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(n){const o=String(n||"").toLowerCase().trim(),i=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(l=>(l.cliente||"").toLowerCase().trim()===o).slice().sort((l,d)=>(d.fechaPedido||"").localeCompare(l.fechaPedido||"")).slice(0,8);if(i.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const c=l=>{const d=(l||"").toLowerCase();return d==="entregado"||d==="finalizado"?"\u2705":d==="cancelado"?"\u274C":d==="en proceso"||d==="produccion"||d==="producci\xF3n"?"\u{1F504}":d==="pendiente"?"\u23F3":d==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${i.map(l=>{const d=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(l):Math.max(0,Number(l.total||0)-Number(l.anticipo||0)),e=d>0?`<span style="color:#dc2626">$${d.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(l.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${l.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(l.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${e}</td>
            <td style="padding:6px 8px;font-size:.75rem">${c(l.status)} ${_esc(l.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const n=window._clienteFiltroTag||"";return n?clients.filter(o=>_tagActividad(o).clase===n):[...clients]}function _renderFiltrosActividad(){const n=document.getElementById("searchClient")?.parentElement?.parentElement;if(!n||document.getElementById("_mkFiltrosActividad"))return;const o=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],a=document.createElement("div");a.id="_mkFiltrosActividad",a.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",o.forEach(r=>{const i=document.createElement("button");i.dataset.filtroTag=r.tag,i.textContent=r.label;const c=(window._clienteFiltroTag||"")===r.tag;i.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${c?r.color:"transparent"};background:${r.bg};color:${r.color};transition:border .15s;`,i.onclick=()=>{window._clienteFiltroTag=r.tag,a.querySelectorAll("button").forEach(t=>{const l=o.find(e=>e.tag===t.dataset.filtroTag);if(!l)return;const d=t.dataset.filtroTag===r.tag;t.style.border=`2px solid ${d?l.color:"transparent"}`}),renderClientsTable()},a.appendChild(i)}),n.parentElement.insertBefore(a,n)}function renderClientsTable(){_renderFiltrosActividad();const n=document.getElementById("clientsTable"),o=_clientesFiltrados();if(clients.length===0){n.innerHTML=`<tr><td colspan="7">
  <div class="mk-empty">
    <div class="mk-empty-icon">\u{1F465}</div>
    <p class="mk-empty-title">Sin clientes a\xFAn</p>
    <p class="mk-empty-sub">Agrega tu primer cliente para llevar un registro de compras y datos de contacto.</p>
    <div class="mk-empty-action">
      <button onclick="openAddClientModal()" class="btn-primary px-6 py-2.5 rounded-xl text-sm">
        + Agregar primer cliente
      </button>
    </div>
  </div>
</td></tr>`,updateClientStats();return}if(o.length===0){n.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const a=n.closest("table")?.querySelector("thead tr");if(a){const e=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];a.innerHTML=e.map(s=>s.key?`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(s.key)}')">${s.label} ${_sortArrow(s.key)}</th>`:`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${s.label}</th>`).join("")}function r(e){const s=(e||"").trim().toLowerCase().charCodeAt(0);return s>=97&&s<=101?"mk-avatar-gold":s>=102&&s<=108?"mk-avatar-lila":s>=109&&s<=114?"mk-avatar-peach":"mk-avatar-green"}function i(e){const s=(e||"").trim().split(" ");return((s[0]||"")[0]||"")+(s[1]?s[1][0]:"")}const c=_clientesSortCol,t=_clientesSortDir==="asc"?1:-1,l=[...o].sort((e,s)=>{let u,m;return c==="totalPurchases"?(u=Number(e.totalPurchases||0),m=Number(s.totalPurchases||0),t*(u-m)):c==="lastPurchase"?(u=e.lastPurchase||"",m=s.lastPurchase||"",t*u.localeCompare(m)):(u=(e.name||"").toLowerCase(),m=(s.name||"").toLowerCase(),t*u.localeCompare(m))}),d={};(window.clientes||clients||[]).forEach(e=>{const s=e.id||e.nombre||e.name||"";d[s]=_calcClienteStats(e.id||e.nombre||e.name||"")}),n.innerHTML=l.map((e,s)=>{const u=e.isVIP||e.type==="vip",m=i(e.name||"?").toUpperCase()||(e.name||"?").trim().charAt(0).toUpperCase(),p=r(e.name),f=(window.notas||[]).filter(b=>b.cliente&&b.cliente.toLowerCase()===(e.name||"").toLowerCase()).sort((b,C)=>(C.fechaCreacion||C.fecha||"").localeCompare(b.fechaCreacion||b.fecha||"")),h=f.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(f[0].texto)}">\u{1F4DD} ${_esc((f[0].texto||"").substring(0,40))}${(f[0].texto||"").length>40?"\u2026":""}</div>`:"",x=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",y=e.id||e.nombre||e.name||"",g=d[y]||_calcClienteStats(y),w=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${g.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${g.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${g.ticketPromedio.toFixed(0)}</span>
                    ${g.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${g.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(e),$=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,k=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${p}">
                                ${m}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(e.name)}</span>
                                    ${$}
                                </div>
                                ${h}
                                ${x}
                                ${w}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${e.phone?`<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(e.phone).replace(/\D/g,"")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(e.phone)}</a>
        ${k}
    </div>`:""}
${e.facebook?`<a href="${_esc(e.facebook).startsWith("http")?_esc(e.facebook):"https://"+_esc(e.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(e.facebook)}</a>`:""}
${!e.phone&&!e.facebook?"\u2014":""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${e.email?_esc(e.email):"\u2014"}</td>
                    <td class="px-6 py-4 text-gray-800 font-semibold">$${(e.totalPurchases||0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${e.lastPurchase||"\u2014"}</td>
                    <td class="px-6 py-4">
                        ${u?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
                    </td>
                    <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(e.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(e.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(e.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                </tr>
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(o=>o.isVIP||o.type==="vip").length;const n=clients.reduce((o,a)=>o+(Number(a.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=`$${n.toFixed(2)}`}let selectedClientType="regular";function selectClientType(n){selectedClientType=n,document.getElementById("clientType").value=n;const o=document.getElementById("btnClientRegular"),a=document.getElementById("btnClientVip");n==="vip"?(a.style.borderColor="#C5A572",a.style.background="#FFF9F0",a.style.color="#C5A572",o.style.borderColor="#E5E7EB",o.style.background="white",o.style.color="#6B7280"):(o.style.borderColor="#C5A572",o.style.background="#FFF9F0",o.style.color="#C5A572",a.style.borderColor="#E5E7EB",a.style.background="white",a.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(n){n.preventDefault();const o=document.getElementById("editClientId").value,a=document.getElementById("clientName").value.trim(),r=document.getElementById("clientPhone").value.trim(),i=document.getElementById("clientFacebook").value.trim(),c=document.getElementById("clientEmail").value.trim();if(!_validEmail(c)){manekiToastExport("Email inv\xE1lido","warn");return}const t=document.getElementById("clientType").value||"regular",l=(document.getElementById("clientNotas")?.value||"").trim();if(o){const e=clients.find(s=>String(s.id)===String(o));e&&(e.name=a,e.phone=r,e.facebook=i,e.email=c,e.type=t,e.isVIP=t==="vip",e.notas=l)}else{let s=function(f){return String(f||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var d=s;const e={id:mkId(),name:a,phone:r,facebook:i,email:c,type:t,isVIP:t==="vip",notas:l,totalPurchases:0,lastPurchase:null},u=s(a),m=String(r||"").replace(/\D/g,"").slice(-8),p=clients.find(f=>{const h=s(f.name||"")===u&&u!=="",x=m.length>=6&&String(f.phone||"").replace(/\D/g,"").slice(-8)===m;return h||x});p&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${p.name}". Verifica si es el mismo.`,"warn"),clients.push(e)}saveClients(),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(n){const o=clients.find(a=>String(a.id)===String(n));o&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=n,document.getElementById("clientName").value=o.name||"",document.getElementById("clientPhone").value=o.phone||"",document.getElementById("clientFacebook").value=o.facebook||"",document.getElementById("clientEmail").value=o.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=o.notas||""),selectClientType(o.type||"regular"),openModal("addClientModal"))}function deleteClient(n){const o=clients.find(t=>String(t.id)===String(n)),r=(window.pedidos||[]).filter(t=>String(t.clienteId||"")===String(n)||String(t.cliente||"").toLowerCase()===String(o?o.name:"").toLowerCase()).filter(t=>t.status!=="finalizado"&&t.status!=="cancelado"&&t.status!=="entregado"),i=r.length>0?`Este cliente tiene ${r.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

"${o?o.name:"este cliente"}" y su historial ser\xE1n eliminados.`:`"${o?o.name:"este cliente"}" y su historial ser\xE1n eliminados.`,c=r.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\u26A0\uFE0F Eliminar cliente";showConfirm(i,c).then(t=>{t&&(clients=clients.filter(l=>String(l.id)!==String(n)),saveClients(),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard())})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(n){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const o=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),a=o(n.target.value||""),i=_clientesFiltrados().filter(t=>o(t.name).includes(a)||o(t.email||"").includes(a)||(t.phone||t.telefono||"").includes(a)),c=document.getElementById("clientsTable");if(i.length===0){c.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}c.innerHTML=i.map(t=>{const l=t.isVIP||t.type==="vip",d=_tagActividad(t),e=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${d.color}">${d.label}</span>`,s=t.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(t.notas)}">\u{1F4DD} ${_esc(t.notas.substring(0,60))}${t.notas.length>60?"\u2026":""}</div>`:"",u=t.phone?`<button onclick="_abrirWhatsApp('${_escAttr(t.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(197,151,59,0.18) !important;">
                                    <i class="fas fa-user" style="color: #C5A572 !important;"></i>
                                </div>
                                <div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span class="font-semibold text-gray-800">${_esc(t.name)}</span>
                                        ${e}
                                    </div>
                                    ${s}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">
    ${t.phone?`<div style="display:flex;flex-direction:column;gap:2px">
        <a href="https://wa.me/521${_esc(t.phone).replace(/\D/g,"")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(t.phone)}</a>
        ${u}
    </div>`:""}
${t.facebook?`<a href="${_esc(t.facebook).startsWith("http")?_esc(t.facebook):"https://"+_esc(t.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(t.facebook)}</a>`:""}
${!t.phone&&!t.facebook?"\u2014":""}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${t.email?_esc(t.email):"\u2014"}</td>
                        <td class="px-6 py-4 text-gray-800 font-semibold">$${(t.totalPurchases||0).toFixed(2)}</td>
                        <td class="px-6 py-4 text-gray-600">${t.lastPurchase||"\u2014"}</td>
                        <td class="px-6 py-4">
                            ${l?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
                        </td>
                        <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(t.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(t.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(t.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                    </tr>
                `}).join("")},180)})}
//# sourceMappingURL=clientes.js.map
