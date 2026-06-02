function _validEmail(a){return!a||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)}const _escAttr=window._esc,_RFM_SEGMENTS=[{key:"campeon",label:"Campeones",emoji:"\u{1F3C6}",color:"#065f46",bg:"#d1fae5",desc:"Compran frecuente y reciente"},{key:"leal",label:"Leales",emoji:"\u2B50",color:"#1e40af",bg:"#dbeafe",desc:"Clientes constantes de alto valor"},{key:"prometedor",label:"Prometedores",emoji:"\u{1F331}",color:"#4d7c0f",bg:"#ecfccb",desc:"Recientes pero pocos pedidos"},{key:"en_riesgo",label:"En riesgo",emoji:"\u26A0\uFE0F",color:"#9a3412",bg:"#ffedd5",desc:"Sol\xEDan comprar, ahora ausentes"},{key:"hibernando",label:"Hibernando",emoji:"\u2744\uFE0F",color:"#1e3a5f",bg:"#e0f2fe",desc:"Sin actividad reciente"},{key:"ocasional",label:"Ocasionales",emoji:"\u{1F535}",color:"#374151",bg:"#f3f4f6",desc:"Compras espor\xE1dicas"}];function _calcRFMScores(){const a=window.pedidosFinalizados||[];if(!a.length)return null;const n=new Date,o={};a.forEach(e=>{const i=String(e.cliente||e.clientName||"").trim();if(!i)return;const m=e.fechaFinalizado||e.fechaPedido||e.fecha||"",f=m?new Date(m+(m.length===10?"T12:00:00":"")):n,p=Math.max(0,Math.floor((n.getTime()-f.getTime())/864e5)),u=Number(e.total||0);o[i]?(o[i].recenciaDias=Math.min(o[i].recenciaDias,p),o[i].frecuencia+=1,o[i].monto+=u):o[i]={recenciaDias:p,frecuencia:1,monto:u}});const l=Object.values(o);if(!l.length)return null;const s=(e,i,m=!1)=>{const f=[...e].sort((g,b)=>g-b),p=f.filter(g=>g<=i).length,u=Math.ceil(p/f.length*5)||1;return m?6-u:u},c=l.map(e=>e.recenciaDias),t=l.map(e=>e.frecuencia),r=l.map(e=>e.monto),d={};return Object.entries(o).forEach(([e,i])=>{const m=s(c,i.recenciaDias,!0),f=s(t,i.frecuencia),p=s(r,i.monto);let u="ocasional";m>=4&&f>=4?u="campeon":f>=3&&p>=3||m>=4&&p>=4?u="leal":m>=3&&f<=2?u="prometedor":m<=2&&f>=3?u="en_riesgo":m===1&&f<=2&&(u="hibernando"),d[e]={r:m,f,m:p,segment:u,recenciaDias:i.recenciaDias,frecuencia:i.frecuencia,monto:i.monto}}),d}window._calcRFMScores=_calcRFMScores;function renderRFMPanel(){const a=document.getElementById("rfmPanelWrapper");if(!a)return;const n=_calcRFMScores();if(!n){a.innerHTML='<p style="text-align:center;color:#9ca3af;padding:20px;font-size:.85rem">Sin pedidos finalizados para calcular RFM</p>';return}const o={};_RFM_SEGMENTS.forEach(s=>{o[s.key]=[]}),Object.entries(n).forEach(([s,c])=>{o[c.segment]&&o[c.segment].push(s)});const l=_RFM_SEGMENTS.map(s=>{const c=o[s.key]||[],t=c.slice(0,3).map(d=>`<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${_escAttr?_escAttr(d):d}</span>`).join(" "),r=c.length>3?`<span style="font-size:.7rem;color:#9ca3af">+${c.length-3} m\xE1s</span>`:"";return`<div style="background:${s.bg};border-radius:14px;padding:14px;cursor:pointer;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${s.key}')" title="${s.desc}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${s.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${s.color}">${s.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${s.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${s.color}">${c.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${t}${r}</div>
        </div>`}).join("");a.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${l}</div>`}window.renderRFMPanel=renderRFMPanel,window._rfmVerSegmento=function(a){const n=_calcRFMScores();if(!n)return;const o=_RFM_SEGMENTS.find(t=>t.key===a);if(!o)return;const l=Object.entries(n).filter(([,t])=>t.segment===a),s=document.getElementById("rfmDetallePanel");if(!s)return;if(!l.length){s.innerHTML='<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>',s.style.display="";return}const c=l.sort(([,t],[,r])=>r.monto-t.monto).map(([t,r])=>`<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${(e=>String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"))(t)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${r.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">$${r.monto.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${r.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${o.bg};color:${o.color}">${r.r}\xB7${r.f}\xB7${r.m}</span></td>
            </tr>`).join("");s.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${o.color}">${o.emoji} ${o.label} \u2014 ${l.length} cliente${l.length!==1?"s":""}</span>
            <button onclick="document.getElementById('rfmDetallePanel').style.display='none'" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.1rem">\u2715</button>
        </div>
        <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:#fafafa">
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:left">Cliente</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:center"># Pedidos</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:right">Total</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:right">Recencia</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:center">R\xB7F\xB7M</th>
            </tr></thead>
            <tbody>${c}</tbody>
        </table>
        </div>`,s.style.display="",s.scrollIntoView({behavior:"smooth",block:"nearest"})};let _clientesSortCol="name",_clientesSortDir="asc";function sortClientes(a){_clientesSortCol===a?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=a,_clientesSortDir=a==="totalPurchases"?"desc":"asc"),renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const a=_clientesSortCol,n=_clientesSortDir==="asc"?1:-1;return[...clients].sort((o,l)=>{let s,c;return a==="totalPurchases"?(s=Number(o.totalPurchases||0),c=Number(l.totalPurchases||0),n*(s-c)):a==="lastPurchase"?(s=o.lastPurchase||"",c=l.lastPurchase||"",n*s.localeCompare(c)):(s=(o.name||"").toLowerCase(),c=(l.name||"").toLowerCase(),n*s.localeCompare(c))})}function _sortArrow(a){return _clientesSortCol!==a?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(a){const n=[...window.pedidos||[],...window.pedidosFinalizados||[]],o=window.pedidosFinalizados||[],l=p=>String(p||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),s=l(a),c=p=>p.clienteId&&String(p.clienteId)===String(a)||p.clientId&&String(p.clientId)===String(a)?!0:l(p.cliente||p.clientName||"")===s,t=n.filter(c),r=o.filter(c),d=t.length,e=r.reduce((p,u)=>p+(Number(u.total)||0),0),i=r.length>0?e/r.length:0,f=t.map(p=>p.fechaPedido||p.fechaCreacion||p.fecha||p.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:d,totalGastado:e,ticketPromedio:i,ultimoPedido:f}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(a){const n=_calcClienteStats(a.nombre||a.name||"");if(!n.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const o=new Date,l=new Date(n.ultimoPedido),s=Math.floor((o-l)/(1e3*60*60*24));return s<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:s<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(a){let n=String(a||"").replace(/[\s\-\(\)]/g,""),o;n.startsWith("+")||n.startsWith("52")?o=`https://wa.me/${n.replace("+","")}`:o=`https://wa.me/521${n}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(o):window.open(o,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(a){const n=String(a||"").toLowerCase().trim(),s=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(r=>(r.cliente||"").toLowerCase().trim()===n).slice().sort((r,d)=>(d.fechaPedido||"").localeCompare(r.fechaPedido||"")).slice(0,8);if(s.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const c=r=>{const d=(r||"").toLowerCase();return d==="entregado"||d==="finalizado"?"\u2705":d==="cancelado"?"\u274C":d==="en proceso"||d==="produccion"||d==="producci\xF3n"?"\u{1F504}":d==="pendiente"?"\u23F3":d==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${s.map(r=>{const d=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(r):Math.max(0,Number(r.total||0)-Number(r.anticipo||0)),e=d>0?`<span style="color:#dc2626">$${d.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(r.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${r.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(r.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${e}</td>
            <td style="padding:6px 8px;font-size:.75rem">${c(r.status)} ${_esc(r.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const a=window._clienteFiltroTag||"";return a?clients.filter(n=>_tagActividad(n).clase===a):[...clients]}function _renderFiltrosActividad(){const a=document.getElementById("searchClient")?.parentElement?.parentElement;if(!a||document.getElementById("_mkFiltrosActividad"))return;const n=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],o=document.createElement("div");o.id="_mkFiltrosActividad",o.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",n.forEach(l=>{const s=document.createElement("button");s.dataset.filtroTag=l.tag,s.textContent=l.label;const c=(window._clienteFiltroTag||"")===l.tag;s.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${c?l.color:"transparent"};background:${l.bg};color:${l.color};transition:border .15s;`,s.onclick=()=>{window._clienteFiltroTag=l.tag,o.querySelectorAll("button").forEach(t=>{const r=n.find(e=>e.tag===t.dataset.filtroTag);if(!r)return;const d=t.dataset.filtroTag===l.tag;t.style.border=`2px solid ${d?r.color:"transparent"}`}),renderClientsTable()},o.appendChild(s)}),a.parentElement.insertBefore(o,a)}function renderClientsTable(){_renderFiltrosActividad(),typeof renderRFMPanel=="function"&&renderRFMPanel();const a=document.getElementById("clientsTable"),n=_clientesFiltrados();if(clients.length===0){a.innerHTML=`<tr><td colspan="7">
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
</td></tr>`,updateClientStats();return}if(n.length===0){a.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const o=a.closest("table")?.querySelector("thead tr");if(o){const e=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];o.innerHTML=e.map(i=>i.key?`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(i.key)}')">${i.label} ${_sortArrow(i.key)}</th>`:`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${i.label}</th>`).join("")}function l(e){const i=(e||"").trim().toLowerCase().charCodeAt(0);return i>=97&&i<=101?"mk-avatar-gold":i>=102&&i<=108?"mk-avatar-lila":i>=109&&i<=114?"mk-avatar-peach":"mk-avatar-green"}function s(e){const i=(e||"").trim().split(" ");return((i[0]||"")[0]||"")+(i[1]?i[1][0]:"")}const c=_clientesSortCol,t=_clientesSortDir==="asc"?1:-1,r=[...n].sort((e,i)=>{let m,f;return c==="totalPurchases"?(m=Number(e.totalPurchases||0),f=Number(i.totalPurchases||0),t*(m-f)):c==="lastPurchase"?(m=e.lastPurchase||"",f=i.lastPurchase||"",t*m.localeCompare(f)):(m=(e.name||"").toLowerCase(),f=(i.name||"").toLowerCase(),t*m.localeCompare(f))}),d={};(window.clientes||clients||[]).forEach(e=>{const i=e.id||e.nombre||e.name||"";d[i]=_calcClienteStats(e.id||e.nombre||e.name||"")}),a.innerHTML=r.map((e,i)=>{const m=e.isVIP||e.type==="vip",f=s(e.name||"?").toUpperCase()||(e.name||"?").trim().charAt(0).toUpperCase(),p=l(e.name),u=(window.notas||[]).filter(h=>h.cliente&&h.cliente.toLowerCase()===(e.name||"").toLowerCase()).sort((h,w)=>(w.fechaCreacion||w.fecha||"").localeCompare(h.fechaCreacion||h.fecha||"")),g=u.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(u[0].texto)}">\u{1F4DD} ${_esc((u[0].texto||"").substring(0,40))}${(u[0].texto||"").length>40?"\u2026":""}</div>`:"",b=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",y=e.id||e.nombre||e.name||"",x=d[y]||_calcClienteStats(y),$=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${x.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${x.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${x.ticketPromedio.toFixed(0)}</span>
                    ${x.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${x.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(e),C=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,k=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${p}">
                                ${f}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(e.name)}</span>
                                    ${C}
                                </div>
                                ${g}
                                ${b}
                                ${$}
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
                        ${m?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(n=>n.isVIP||n.type==="vip").length;const a=clients.reduce((n,o)=>n+(Number(o.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=`$${a.toFixed(2)}`}let selectedClientType="regular";function selectClientType(a){selectedClientType=a,document.getElementById("clientType").value=a;const n=document.getElementById("btnClientRegular"),o=document.getElementById("btnClientVip");a==="vip"?(o.style.borderColor="#C5A572",o.style.background="#FFF9F0",o.style.color="#C5A572",n.style.borderColor="#E5E7EB",n.style.background="white",n.style.color="#6B7280"):(n.style.borderColor="#C5A572",n.style.background="#FFF9F0",n.style.color="#C5A572",o.style.borderColor="#E5E7EB",o.style.background="white",o.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(a){a.preventDefault();const n=document.getElementById("editClientId").value,o=document.getElementById("clientName").value.trim(),l=document.getElementById("clientPhone").value.trim(),s=document.getElementById("clientFacebook").value.trim(),c=document.getElementById("clientEmail").value.trim();if(!_validEmail(c)){manekiToastExport("Email inv\xE1lido","warn");return}const t=document.getElementById("clientType").value||"regular",r=(document.getElementById("clientNotas")?.value||"").trim();if(n){const e=clients.find(i=>String(i.id)===String(n));e&&(e.name=o,e.phone=l,e.facebook=s,e.email=c,e.type=t,e.isVIP=t==="vip",e.notas=r)}else{let i=function(u){return String(u||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var d=i;const e={id:mkId(),name:o,phone:l,facebook:s,email:c,type:t,isVIP:t==="vip",notas:r,totalPurchases:0,lastPurchase:null},m=i(o),f=String(l||"").replace(/\D/g,"").slice(-8),p=clients.find(u=>{const g=i(u.name||"")===m&&m!=="",b=f.length>=6&&String(u.phone||"").replace(/\D/g,"").slice(-8)===f;return g||b});p&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${p.name}". Verifica si es el mismo.`,"warn"),clients.push(e)}saveClients(),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(a){const n=clients.find(o=>String(o.id)===String(a));n&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=a,document.getElementById("clientName").value=n.name||"",document.getElementById("clientPhone").value=n.phone||"",document.getElementById("clientFacebook").value=n.facebook||"",document.getElementById("clientEmail").value=n.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=n.notas||""),selectClientType(n.type||"regular"),openModal("addClientModal"))}function deleteClient(a){const n=clients.find(t=>String(t.id)===String(a)),l=(window.pedidos||[]).filter(t=>String(t.clienteId||"")===String(a)||String(t.cliente||"").toLowerCase()===String(n?n.name:"").toLowerCase()).filter(t=>t.status!=="finalizado"&&t.status!=="cancelado"&&t.status!=="entregado"),s=l.length>0?`Este cliente tiene ${l.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

"${n?n.name:"este cliente"}" y su historial ser\xE1n eliminados.`:`"${n?n.name:"este cliente"}" y su historial ser\xE1n eliminados.`,c=l.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\u26A0\uFE0F Eliminar cliente";showConfirm(s,c).then(t=>{t&&(clients=clients.filter(r=>String(r.id)!==String(a)),saveClients(),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard())})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(a){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const n=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),o=n(a.target.value||""),s=_clientesFiltrados().filter(t=>n(t.name).includes(o)||n(t.email||"").includes(o)||(t.phone||t.telefono||"").includes(o)),c=document.getElementById("clientsTable");if(s.length===0){c.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}c.innerHTML=s.map(t=>{const r=t.isVIP||t.type==="vip",d=_tagActividad(t),e=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${d.color}">${d.label}</span>`,i=t.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(t.notas)}">\u{1F4DD} ${_esc(t.notas.substring(0,60))}${t.notas.length>60?"\u2026":""}</div>`:"",m=t.phone?`<button onclick="_abrirWhatsApp('${_escAttr(t.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
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
                                    ${i}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">
    ${t.phone?`<div style="display:flex;flex-direction:column;gap:2px">
        <a href="https://wa.me/521${_esc(t.phone).replace(/\D/g,"")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(t.phone)}</a>
        ${m}
    </div>`:""}
${t.facebook?`<a href="${_esc(t.facebook).startsWith("http")?_esc(t.facebook):"https://"+_esc(t.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(t.facebook)}</a>`:""}
${!t.phone&&!t.facebook?"\u2014":""}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${t.email?_esc(t.email):"\u2014"}</td>
                        <td class="px-6 py-4 text-gray-800 font-semibold">$${(t.totalPurchases||0).toFixed(2)}</td>
                        <td class="px-6 py-4 text-gray-600">${t.lastPurchase||"\u2014"}</td>
                        <td class="px-6 py-4">
                            ${r?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
