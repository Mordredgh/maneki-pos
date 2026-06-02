function _validEmail(a){return!a||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)}const _escAttr=window._esc,_RFM_SEGMENTS=[{key:"campeon",label:"Campeones",emoji:"\u{1F3C6}",color:"#065f46",bg:"#d1fae5",desc:"Compran frecuente y reciente"},{key:"leal",label:"Leales",emoji:"\u2B50",color:"#1e40af",bg:"#dbeafe",desc:"Clientes constantes de alto valor"},{key:"prometedor",label:"Prometedores",emoji:"\u{1F331}",color:"#4d7c0f",bg:"#ecfccb",desc:"Recientes pero pocos pedidos"},{key:"en_riesgo",label:"En riesgo",emoji:"\u26A0\uFE0F",color:"#9a3412",bg:"#ffedd5",desc:"Sol\xEDan comprar, ahora ausentes"},{key:"hibernando",label:"Hibernando",emoji:"\u2744\uFE0F",color:"#1e3a5f",bg:"#e0f2fe",desc:"Sin actividad reciente"},{key:"ocasional",label:"Ocasionales",emoji:"\u{1F535}",color:"#374151",bg:"#f3f4f6",desc:"Compras espor\xE1dicas"}];function _calcRFMScores(){const a=window.pedidosFinalizados||[];if(!a.length)return null;const n=new Date,o={};a.forEach(l=>{const m=String(l.cliente||l.clientName||"").trim();if(!m)return;const u=l.fechaFinalizado||l.fechaPedido||l.fecha||"",t=u?new Date(u+(u.length===10?"T12:00:00":"")):n,s=Math.max(0,Math.floor((n.getTime()-t.getTime())/864e5)),f=Number(l.total||0);o[m]?(o[m].recenciaDias=Math.min(o[m].recenciaDias,s),o[m].frecuencia+=1,o[m].monto+=f):o[m]={recenciaDias:s,frecuencia:1,monto:f}});const r=Object.values(o);if(!r.length)return null;const i=(l,m,u=!1)=>{const t=[...l].sort((g,b)=>g-b),s=t.filter(g=>g<=m).length,f=Math.ceil(s/t.length*5)||1;return u?6-f:f},d=r.map(l=>l.recenciaDias),e=r.map(l=>l.frecuencia),c=r.map(l=>l.monto),p={};return Object.entries(o).forEach(([l,m])=>{const u=i(d,m.recenciaDias,!0),t=i(e,m.frecuencia),s=i(c,m.monto);let f="ocasional";u>=4&&t>=4?f="campeon":t>=3&&s>=3||u>=4&&s>=4?f="leal":u>=3&&t<=2?f="prometedor":u<=2&&t>=3?f="en_riesgo":u===1&&t<=2&&(f="hibernando"),p[l]={r:u,f:t,m:s,segment:f,recenciaDias:m.recenciaDias,frecuencia:m.frecuencia,monto:m.monto}}),p}window._calcRFMScores=_calcRFMScores;function renderRFMPanel(){const a=document.getElementById("rfmPanelWrapper");if(!a)return;const n=_calcRFMScores();if(!n){a.innerHTML='<p style="text-align:center;color:#9ca3af;padding:20px;font-size:.85rem">Sin pedidos finalizados para calcular RFM</p>';return}const o={};_RFM_SEGMENTS.forEach(i=>{o[i.key]=[]}),Object.entries(n).forEach(([i,d])=>{o[d.segment]&&o[d.segment].push(i)});const r=_RFM_SEGMENTS.map(i=>{const d=o[i.key]||[],e=d.slice(0,3).map(p=>`<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${_escAttr?_escAttr(p):p}</span>`).join(" "),c=d.length>3?`<span style="font-size:.7rem;color:#9ca3af">+${d.length-3} m\xE1s</span>`:"";return`<div style="background:${i.bg};border-radius:14px;padding:14px;cursor:pointer;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${i.key}')" title="${i.desc}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${i.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${i.color}">${i.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${i.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${i.color}">${d.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${e}${c}</div>
        </div>`}).join("");a.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${r}</div>`}window.renderRFMPanel=renderRFMPanel,window._rfmVerSegmento=function(a){const n=_calcRFMScores();if(!n)return;const o=_RFM_SEGMENTS.find(e=>e.key===a);if(!o)return;const r=Object.entries(n).filter(([,e])=>e.segment===a),i=document.getElementById("rfmDetallePanel");if(!i)return;if(!r.length){i.innerHTML='<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>',i.style.display="";return}const d=r.sort(([,e],[,c])=>c.monto-e.monto).map(([e,c])=>{const p=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),l=(window.clients||[]).find(s=>(s.name||"").toLowerCase().trim()===e.toLowerCase().trim()),m=l&&(l.phone||l.telefono)||"",u=m?`https://wa.me/52${m.replace(/\D/g,"")}`:"",t=u?`<a href="${u}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:8px;background:#dcfce7;color:#15803d;font-size:.72rem;font-weight:700;text-decoration:none;" title="Abrir WhatsApp">\u{1F4F1} WA</a>`:'<span style="font-size:.7rem;color:#d1d5db;padding:3px 6px;">Sin tel.</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${p(e)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${c.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">$${c.monto.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${c.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${o.bg};color:${o.color}">${c.r}\xB7${c.f}\xB7${c.m}</span></td>
                <td style="padding:7px 10px;text-align:center">${t}</td>
            </tr>`}).join("");i.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${o.color}">${o.emoji} ${o.label} \u2014 ${r.length} cliente${r.length!==1?"s":""}</span>
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
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:center">WA</th>
            </tr></thead>
            <tbody>${d}</tbody>
        </table>
        </div>`,i.style.display="",i.scrollIntoView({behavior:"smooth",block:"nearest"})};let _clientesSortCol="name",_clientesSortDir="asc";function sortClientes(a){_clientesSortCol===a?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=a,_clientesSortDir=a==="totalPurchases"?"desc":"asc"),renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const a=_clientesSortCol,n=_clientesSortDir==="asc"?1:-1;return[...clients].sort((o,r)=>{let i,d;return a==="totalPurchases"?(i=Number(o.totalPurchases||0),d=Number(r.totalPurchases||0),n*(i-d)):a==="lastPurchase"?(i=o.lastPurchase||"",d=r.lastPurchase||"",n*i.localeCompare(d)):(i=(o.name||"").toLowerCase(),d=(r.name||"").toLowerCase(),n*i.localeCompare(d))})}function _sortArrow(a){return _clientesSortCol!==a?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(a){const n=[...window.pedidos||[],...window.pedidosFinalizados||[]],o=window.pedidosFinalizados||[],r=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),i=r(a),d=s=>s.clienteId&&String(s.clienteId)===String(a)||s.clientId&&String(s.clientId)===String(a)?!0:r(s.cliente||s.clientName||"")===i,e=n.filter(d),c=o.filter(d),p=e.length,l=c.reduce((s,f)=>s+(Number(f.total)||0),0),m=c.length>0?l/c.length:0,t=e.map(s=>s.fechaPedido||s.fechaCreacion||s.fecha||s.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:p,totalGastado:l,ticketPromedio:m,ultimoPedido:t}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(a){const n=_calcClienteStats(a.nombre||a.name||"");if(!n.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const o=new Date,r=new Date(n.ultimoPedido),i=Math.floor((o-r)/(1e3*60*60*24));return i<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:i<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(a){let n=String(a||"").replace(/[\s\-\(\)]/g,""),o;n.startsWith("+")||n.startsWith("52")?o=`https://wa.me/${n.replace("+","")}`:o=`https://wa.me/521${n}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(o):window.open(o,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(a){const n=String(a||"").toLowerCase().trim(),i=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(c=>(c.cliente||"").toLowerCase().trim()===n).slice().sort((c,p)=>(p.fechaPedido||"").localeCompare(c.fechaPedido||"")).slice(0,8);if(i.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const d=c=>{const p=(c||"").toLowerCase();return p==="entregado"||p==="finalizado"?"\u2705":p==="cancelado"?"\u274C":p==="en proceso"||p==="produccion"||p==="producci\xF3n"?"\u{1F504}":p==="pendiente"?"\u23F3":p==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${i.map(c=>{const p=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(c):Math.max(0,Number(c.total||0)-Number(c.anticipo||0)),l=p>0?`<span style="color:#dc2626">$${p.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(c.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${c.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(c.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${l}</td>
            <td style="padding:6px 8px;font-size:.75rem">${d(c.status)} ${_esc(c.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const a=window._clienteFiltroTag||"";return a?clients.filter(n=>_tagActividad(n).clase===a):[...clients]}function _renderFiltrosActividad(){const a=document.getElementById("searchClient")?.parentElement?.parentElement;if(!a||document.getElementById("_mkFiltrosActividad"))return;const n=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],o=document.createElement("div");o.id="_mkFiltrosActividad",o.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",n.forEach(r=>{const i=document.createElement("button");i.dataset.filtroTag=r.tag,i.textContent=r.label;const d=(window._clienteFiltroTag||"")===r.tag;i.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${d?r.color:"transparent"};background:${r.bg};color:${r.color};transition:border .15s;`,i.onclick=()=>{window._clienteFiltroTag=r.tag,o.querySelectorAll("button").forEach(e=>{const c=n.find(l=>l.tag===e.dataset.filtroTag);if(!c)return;const p=e.dataset.filtroTag===r.tag;e.style.border=`2px solid ${p?c.color:"transparent"}`}),renderClientsTable()},o.appendChild(i)}),a.parentElement.insertBefore(o,a)}function renderClientsTable(){const a=window.clients||[],n=a.length+"_"+a.reduce((t,s)=>t+Number(s.totalPurchases||0),0).toFixed(0),o=document.getElementById("clientsTable");if(o&&o._lastHash===n){typeof renderRFMPanel=="function"&&renderRFMPanel();return}o&&(o._lastHash=n),_renderFiltrosActividad(),typeof renderRFMPanel=="function"&&renderRFMPanel();const r=document.getElementById("clientsTable"),i=_clientesFiltrados();if(clients.length===0){r.innerHTML=`<tr><td colspan="7">
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
</td></tr>`,updateClientStats();return}if(i.length===0){r.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const d=r.closest("table")?.querySelector("thead tr");if(d){const t=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];d.innerHTML=t.map(s=>s.key?`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(s.key)}')">${s.label} ${_sortArrow(s.key)}</th>`:`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${s.label}</th>`).join("")}function e(t){const s=(t||"").trim().toLowerCase().charCodeAt(0);return s>=97&&s<=101?"mk-avatar-gold":s>=102&&s<=108?"mk-avatar-lila":s>=109&&s<=114?"mk-avatar-peach":"mk-avatar-green"}function c(t){const s=(t||"").trim().split(" ");return((s[0]||"")[0]||"")+(s[1]?s[1][0]:"")}const p=_clientesSortCol,l=_clientesSortDir==="asc"?1:-1,m=[...i].sort((t,s)=>{let f,g;return p==="totalPurchases"?(f=Number(t.totalPurchases||0),g=Number(s.totalPurchases||0),l*(f-g)):p==="lastPurchase"?(f=t.lastPurchase||"",g=s.lastPurchase||"",l*f.localeCompare(g)):(f=(t.name||"").toLowerCase(),g=(s.name||"").toLowerCase(),l*f.localeCompare(g))}),u={};(window.clientes||clients||[]).forEach(t=>{const s=t.id||t.nombre||t.name||"";u[s]=_calcClienteStats(t.id||t.nombre||t.name||"")}),r.innerHTML=m.map((t,s)=>{const f=t.isVIP||t.type==="vip",g=c(t.name||"?").toUpperCase()||(t.name||"?").trim().charAt(0).toUpperCase(),b=e(t.name),y=(window.notas||[]).filter(h=>h.cliente&&h.cliente.toLowerCase()===(t.name||"").toLowerCase()).sort((h,$)=>($.fechaCreacion||$.fecha||"").localeCompare(h.fechaCreacion||h.fecha||"")),C=y.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(y[0].texto)}">\u{1F4DD} ${_esc((y[0].texto||"").substring(0,40))}${(y[0].texto||"").length>40?"\u2026":""}</div>`:"",k=t.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(t.notas)}">\u{1F4DD} ${_esc(t.notas.substring(0,60))}${t.notas.length>60?"\u2026":""}</div>`:"",w=t.id||t.nombre||t.name||"",x=u[w]||_calcClienteStats(w),_=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${x.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${x.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${x.ticketPromedio.toFixed(0)}</span>
                    ${x.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${x.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(t),E=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,S=t.phone?`<button onclick="_abrirWhatsApp('${_escAttr(t.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${b}">
                                ${g}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(t.name)}</span>
                                    ${E}
                                </div>
                                ${C}
                                ${k}
                                ${_}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${t.phone?`<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(t.phone).replace(/\D/g,"")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(t.phone)}</a>
        ${S}
    </div>`:""}
${t.facebook?`<a href="${_esc(t.facebook).startsWith("http")?_esc(t.facebook):"https://"+_esc(t.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(t.facebook)}</a>`:""}
${!t.phone&&!t.facebook?"\u2014":""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${t.email?_esc(t.email):"\u2014"}</td>
                    <td class="px-6 py-4 text-gray-800 font-semibold">$${(t.totalPurchases||0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${t.lastPurchase||"\u2014"}</td>
                    <td class="px-6 py-4">
                        ${f?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(n=>n.isVIP||n.type==="vip").length;const a=clients.reduce((n,o)=>n+(Number(o.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=`$${a.toFixed(2)}`}let selectedClientType="regular";function selectClientType(a){selectedClientType=a,document.getElementById("clientType").value=a;const n=document.getElementById("btnClientRegular"),o=document.getElementById("btnClientVip");a==="vip"?(o.style.borderColor="#C5A572",o.style.background="#FFF9F0",o.style.color="#C5A572",n.style.borderColor="#E5E7EB",n.style.background="white",n.style.color="#6B7280"):(n.style.borderColor="#C5A572",n.style.background="#FFF9F0",n.style.color="#C5A572",o.style.borderColor="#E5E7EB",o.style.background="white",o.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(a){a.preventDefault();const n=document.getElementById("editClientId").value,o=document.getElementById("clientName").value.trim(),r=document.getElementById("clientPhone").value.trim(),i=document.getElementById("clientFacebook").value.trim(),d=document.getElementById("clientEmail").value.trim();if(!_validEmail(d)){manekiToastExport("Email inv\xE1lido","warn");return}const e=document.getElementById("clientType").value||"regular",c=(document.getElementById("clientNotas")?.value||"").trim();if(n){const l=clients.find(m=>String(m.id)===String(n));l&&(l.name=o,l.phone=r,l.facebook=i,l.email=d,l.type=e,l.isVIP=e==="vip",l.notas=c)}else{let m=function(f){return String(f||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var p=m;const l={id:mkId(),name:o,phone:r,facebook:i,email:d,type:e,isVIP:e==="vip",notas:c,totalPurchases:0,lastPurchase:null},u=m(o),t=String(r||"").replace(/\D/g,"").slice(-8),s=clients.find(f=>{const g=m(f.name||"")===u&&u!=="",b=t.length>=6&&String(f.phone||"").replace(/\D/g,"").slice(-8)===t;return g||b});s&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${s.name}". Verifica si es el mismo.`,"warn"),clients.push(l)}saveClients(),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(a){const n=clients.find(o=>String(o.id)===String(a));n&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=a,document.getElementById("clientName").value=n.name||"",document.getElementById("clientPhone").value=n.phone||"",document.getElementById("clientFacebook").value=n.facebook||"",document.getElementById("clientEmail").value=n.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=n.notas||""),selectClientType(n.type||"regular"),openModal("addClientModal"))}function deleteClient(a){const n=clients.find(e=>String(e.id)===String(a)),r=(window.pedidos||[]).filter(e=>String(e.clienteId||"")===String(a)||String(e.cliente||"").toLowerCase()===String(n?n.name:"").toLowerCase()).filter(e=>e.status!=="finalizado"&&e.status!=="cancelado"&&e.status!=="entregado"),i=r.length>0?`Este cliente tiene ${r.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

"${n?n.name:"este cliente"}" y su historial ser\xE1n eliminados.`:`"${n?n.name:"este cliente"}" y su historial ser\xE1n eliminados.`,d=r.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\u26A0\uFE0F Eliminar cliente";showConfirm(i,d).then(e=>{e&&(clients=clients.filter(c=>String(c.id)!==String(a)),saveClients(),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard())})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(a){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const n=e=>String(e||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),o=n(a.target.value||""),i=_clientesFiltrados().filter(e=>n(e.name).includes(o)||n(e.email||"").includes(o)||(e.phone||e.telefono||"").includes(o)),d=document.getElementById("clientsTable");if(i.length===0){d.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}d.innerHTML=i.map(e=>{const c=e.isVIP||e.type==="vip",p=_tagActividad(e),l=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${p.color}">${p.label}</span>`,m=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",u=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(197,151,59,0.18) !important;">
                                    <i class="fas fa-user" style="color: #C5A572 !important;"></i>
                                </div>
                                <div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span class="font-semibold text-gray-800">${_esc(e.name)}</span>
                                        ${l}
                                    </div>
                                    ${m}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">
    ${e.phone?`<div style="display:flex;flex-direction:column;gap:2px">
        <a href="https://wa.me/521${_esc(e.phone).replace(/\D/g,"")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(e.phone)}</a>
        ${u}
    </div>`:""}
${e.facebook?`<a href="${_esc(e.facebook).startsWith("http")?_esc(e.facebook):"https://"+_esc(e.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(e.facebook)}</a>`:""}
${!e.phone&&!e.facebook?"\u2014":""}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${e.email?_esc(e.email):"\u2014"}</td>
                        <td class="px-6 py-4 text-gray-800 font-semibold">$${(e.totalPurchases||0).toFixed(2)}</td>
                        <td class="px-6 py-4 text-gray-600">${e.lastPurchase||"\u2014"}</td>
                        <td class="px-6 py-4">
                            ${c?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
                `}).join("")},180)})}
//# sourceMappingURL=clientes.js.map
