function _validEmail(o){return!o||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o)}const _escAttr=window._esc,_RFM_SEGMENTS=[{key:"campeon",label:"Campeones",emoji:"\u{1F3C6}",color:"#065f46",bg:"#d1fae5",desc:"Compran frecuente y reciente"},{key:"leal",label:"Leales",emoji:"\u2B50",color:"#1e40af",bg:"#dbeafe",desc:"Clientes constantes de alto valor"},{key:"prometedor",label:"Prometedores",emoji:"\u{1F331}",color:"#4d7c0f",bg:"#ecfccb",desc:"Recientes pero pocos pedidos"},{key:"en_riesgo",label:"En riesgo",emoji:"\u26A0\uFE0F",color:"#9a3412",bg:"#ffedd5",desc:"Sol\xEDan comprar, ahora ausentes"},{key:"hibernando",label:"Hibernando",emoji:"\u2744\uFE0F",color:"#1e3a5f",bg:"#e0f2fe",desc:"Sin actividad reciente"},{key:"ocasional",label:"Ocasionales",emoji:"\u{1F535}",color:"#374151",bg:"#f3f4f6",desc:"Compras espor\xE1dicas"}];function _calcRFMScores(){const o=window.pedidosFinalizados||[];if(!o.length)return null;const a=new Date,n={};o.forEach(r=>{const m=String(r.cliente||r.clientName||"").trim();if(!m)return;const u=r.fechaFinalizado||r.fechaPedido||r.fecha||"",e=u?new Date(u+(u.length===10?"T12:00:00":"")):a,s=Math.max(0,Math.floor((a.getTime()-e.getTime())/864e5)),f=Number(r.total||0);n[m]?(n[m].recenciaDias=Math.min(n[m].recenciaDias,s),n[m].frecuencia+=1,n[m].monto+=f):n[m]={recenciaDias:s,frecuencia:1,monto:f}});const d=Object.values(n);if(!d.length)return null;const l=(r,m,u=!1)=>{const e=[...r].sort((g,b)=>g-b);if(!e||e.length===0)return 1;const s=e.filter(g=>g<=m).length,f=Math.ceil(s/e.length*5)||1;return u?6-f:f},c=d.map(r=>r.recenciaDias),t=d.map(r=>r.frecuencia),i=d.map(r=>r.monto),p={};return Object.entries(n).forEach(([r,m])=>{const u=l(c,m.recenciaDias,!0),e=l(t,m.frecuencia),s=l(i,m.monto);let f="ocasional";u>=4&&e>=4?f="campeon":e>=3&&s>=3||u>=4&&s>=4?f="leal":u>=3&&e<=2?f="prometedor":u<=2&&e>=3?f="en_riesgo":u===1&&e<=2&&(f="hibernando"),p[r]={r:u,f:e,m:s,segment:f,recenciaDias:m.recenciaDias,frecuencia:m.frecuencia,monto:m.monto}}),p}window._calcRFMScores=_calcRFMScores;const rfmDescriptions={Campeones:"Compraron recientemente, con alta frecuencia y alto gasto. Tus mejores clientes.",Leales:"Compran con frecuencia y buen gasto. Son confiables y responden a promociones.",Prometedores:"Compraron recientemente pero con baja frecuencia. Potencial de crecer.","En riesgo":"Compraron bastante antes pero no han vuelto. Requieren re-engagement.",Hibernando:"Hace mucho que no compran. Dif\xEDcil recuperarlos pero vale intentarlo.",Ocasionales:"Compran poco, espor\xE1dicamente y gastan poco."};function renderRFMPanel(){const o=document.getElementById("rfmPanelWrapper");if(!o)return;if((window.pedidosFinalizados||[]).length<5){o.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const n=_calcRFMScores();if(!n){o.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const d={};_RFM_SEGMENTS.forEach(c=>{d[c.key]=[]}),Object.entries(n).forEach(([c,t])=>{d[t.segment]&&d[t.segment].push(c)});const l=_RFM_SEGMENTS.map(c=>{const t=d[c.key]||[],i=t.slice(0,3).map(m=>`<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${_escAttr?_escAttr(m):m}</span>`).join(" "),p=t.length>3?`<span style="font-size:.7rem;color:#9ca3af">+${t.length-3} m\xE1s</span>`:"",r=_escAttr?_escAttr(rfmDescriptions[c.label]||c.desc):rfmDescriptions[c.label]||c.desc;return`<div style="background:${c.bg};border-radius:14px;padding:14px;cursor:help;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${c.key}')"
            title="${r}"
            data-tooltip="${r}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${c.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${c.color}">${c.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${c.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${c.color}">${t.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${i}${p}</div>
        </div>`}).join("");o.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${l}</div>`}window.renderRFMPanel=renderRFMPanel,window._rfmVerSegmento=function(o){const a=_calcRFMScores();if(!a)return;const n=_RFM_SEGMENTS.find(t=>t.key===o);if(!n)return;const d=Object.entries(a).filter(([,t])=>t.segment===o),l=document.getElementById("rfmDetallePanel");if(!l)return;if(!d.length){l.innerHTML='<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>',l.style.display="";return}const c=d.sort(([,t],[,i])=>i.monto-t.monto).map(([t,i])=>{const p=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),r=(window.clients||[]).find(s=>(s.name||"").toLowerCase().trim()===t.toLowerCase().trim()),m=r&&(r.phone||r.telefono)||"",u=m?`https://wa.me/52${m.replace(/\D/g,"")}`:"",e=u?`<a href="${u}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:8px;background:#dcfce7;color:#15803d;font-size:.72rem;font-weight:700;text-decoration:none;" title="Abrir WhatsApp">\u{1F4F1} WA</a>`:'<span style="font-size:.7rem;color:#d1d5db;padding:3px 6px;">Sin tel.</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${p(t)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${i.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">$${i.monto.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${i.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${n.bg};color:${n.color}">${i.r}\xB7${i.f}\xB7${i.m}</span></td>
                <td style="padding:7px 10px;text-align:center">${e}</td>
            </tr>`}).join("");l.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${n.color}">${n.emoji} ${n.label} \u2014 ${d.length} cliente${d.length!==1?"s":""}</span>
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
            <tbody>${c}</tbody>
        </table>
        </div>`,l.style.display="",l.scrollIntoView({behavior:"smooth",block:"nearest"})};let _clientesSortCol="name",_clientesSortDir="asc";function sortClientes(o){_clientesSortCol===o?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=o,_clientesSortDir=o==="totalPurchases"?"desc":"asc"),renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const o=_clientesSortCol,a=_clientesSortDir==="asc"?1:-1;return[...clients].sort((n,d)=>{let l,c;return o==="totalPurchases"?(l=Number(n.totalPurchases||0),c=Number(d.totalPurchases||0),a*(l-c)):o==="lastPurchase"?(l=n.lastPurchase||"",c=d.lastPurchase||"",a*l.localeCompare(c)):(l=(n.name||"").toLowerCase(),c=(d.name||"").toLowerCase(),a*l.localeCompare(c))})}function _sortArrow(o){return _clientesSortCol!==o?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(o){const a=[...window.pedidos||[],...window.pedidosFinalizados||[]],n=window.pedidosFinalizados||[],d=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),l=d(o),c=s=>s.clienteId&&String(s.clienteId)===String(o)||s.clientId&&String(s.clientId)===String(o)?!0:d(s.cliente||s.clientName||"")===l,t=a.filter(c),i=n.filter(c),p=t.length,r=i.reduce((s,f)=>s+(Number(f.total)||0),0),m=i.length>0?r/i.length:0,e=t.map(s=>s.fechaPedido||s.fechaCreacion||s.fecha||s.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:p,totalGastado:r,ticketPromedio:m,ultimoPedido:e}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(o){const a=_calcClienteStats(o.nombre||o.name||"");if(!a.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const n=new Date,d=new Date(a.ultimoPedido),l=Math.floor((n-d)/(1e3*60*60*24));return l<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:l<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(o){let a=String(o||"").replace(/[\s\-\(\)]/g,""),n;a.startsWith("+")||a.startsWith("52")?n=`https://wa.me/${a.replace("+","")}`:n=`https://wa.me/521${a}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(n):window.open(n,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(o){const a=String(o||"").toLowerCase().trim(),l=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(i=>(i.cliente||"").toLowerCase().trim()===a).slice().sort((i,p)=>(p.fechaPedido||"").localeCompare(i.fechaPedido||"")).slice(0,8);if(l.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const c=i=>{const p=(i||"").toLowerCase();return p==="entregado"||p==="finalizado"?"\u2705":p==="cancelado"?"\u274C":p==="en proceso"||p==="produccion"||p==="producci\xF3n"?"\u{1F504}":p==="pendiente"?"\u23F3":p==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${l.map(i=>{const p=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(i):Math.max(0,Number(i.total||0)-Number(i.anticipo||0)),r=p>0?`<span style="color:#dc2626">$${p.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(i.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${i.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(i.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${r}</td>
            <td style="padding:6px 8px;font-size:.75rem">${c(i.status)} ${_esc(i.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const o=window._clienteFiltroTag||"";return o?clients.filter(a=>_tagActividad(a).clase===o):[...clients]}function _renderFiltrosActividad(){const o=document.getElementById("searchClient")?.parentElement?.parentElement;if(!o||document.getElementById("_mkFiltrosActividad"))return;const a=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],n=document.createElement("div");n.id="_mkFiltrosActividad",n.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",a.forEach(d=>{const l=document.createElement("button");l.dataset.filtroTag=d.tag,l.textContent=d.label;const c=(window._clienteFiltroTag||"")===d.tag;l.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${c?d.color:"transparent"};background:${d.bg};color:${d.color};transition:border .15s;`,l.onclick=()=>{window._clienteFiltroTag=d.tag,n.querySelectorAll("button").forEach(t=>{const i=a.find(r=>r.tag===t.dataset.filtroTag);if(!i)return;const p=t.dataset.filtroTag===d.tag;t.style.border=`2px solid ${p?i.color:"transparent"}`}),renderClientsTable()},n.appendChild(l)}),o.parentElement.insertBefore(n,o)}function renderClientsTable(){const o=window.clients||[],a=o.length+"_"+o.reduce((e,s)=>e+Number(s.totalPurchases||0),0).toFixed(0),n=document.getElementById("clientsTable");if(n&&n._lastHash===a){typeof renderRFMPanel=="function"&&renderRFMPanel();return}n&&(n._lastHash=a),_renderFiltrosActividad(),typeof renderRFMPanel=="function"&&renderRFMPanel();const d=document.getElementById("clientsTable"),l=_clientesFiltrados();if(clients.length===0){d.innerHTML=`<tr><td colspan="99" class="text-center py-14">
  <div class="text-5xl mb-3">\u{1F465}</div>
  <p class="text-lg font-medium text-gray-500">Sin clientes registrados</p>
  <button onclick="document.getElementById('addClientBtn')?.click()"
          class="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
    + Agregar primer cliente
  </button>
</td></tr>`,updateClientStats();return}if(l.length===0){d.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const c=d.closest("table")?.querySelector("thead tr");if(c){const e=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];c.innerHTML=e.map(s=>s.key?`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(s.key)}')">${s.label} ${_sortArrow(s.key)}</th>`:`<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${s.label}</th>`).join("")}function t(e){const s=(e||"").trim().toLowerCase().charCodeAt(0);return s>=97&&s<=101?"mk-avatar-gold":s>=102&&s<=108?"mk-avatar-lila":s>=109&&s<=114?"mk-avatar-peach":"mk-avatar-green"}function i(e){const s=(e||"").trim().split(" ");return((s[0]||"")[0]||"")+(s[1]?s[1][0]:"")}const p=_clientesSortCol,r=_clientesSortDir==="asc"?1:-1,m=[...l].sort((e,s)=>{let f,g;return p==="totalPurchases"?(f=Number(e.totalPurchases||0),g=Number(s.totalPurchases||0),r*(f-g)):p==="lastPurchase"?(f=e.lastPurchase||"",g=s.lastPurchase||"",r*f.localeCompare(g)):(f=(e.name||"").toLowerCase(),g=(s.name||"").toLowerCase(),r*f.localeCompare(g))}),u={};(window.clientes||clients||[]).forEach(e=>{const s=e.id||e.nombre||e.name||"";u[s]=_calcClienteStats(e.id||e.nombre||e.name||"")}),d.innerHTML=m.map((e,s)=>{const f=e.isVIP||e.type==="vip",g=i(e.name||"?").toUpperCase()||(e.name||"?").trim().charAt(0).toUpperCase(),b=t(e.name),y=(window.notas||[]).filter(h=>h.cliente&&h.cliente.toLowerCase()===(e.name||"").toLowerCase()).sort((h,C)=>(C.fechaCreacion||C.fecha||"").localeCompare(h.fechaCreacion||h.fecha||"")),$=y.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(y[0].texto)}">\u{1F4DD} ${_esc((y[0].texto||"").substring(0,40))}${(y[0].texto||"").length>40?"\u2026":""}</div>`:"",k=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",w=e.id||e.nombre||e.name||"",x=u[w]||_calcClienteStats(w),E=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${x.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${x.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${x.ticketPromedio.toFixed(0)}</span>
                    ${x.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${x.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(e),_=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,S=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${b}">
                                ${g}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(e.name)}</span>
                                    ${_}
                                </div>
                                ${$}
                                ${k}
                                ${E}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${e.phone?`<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(e.phone).replace(/\D/g,"")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(e.phone)}</a>
        ${S}
    </div>`:""}
${e.facebook?`<a href="${_esc(e.facebook).startsWith("http")?_esc(e.facebook):"https://"+_esc(e.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(e.facebook)}</a>`:""}
${!e.phone&&!e.facebook?"\u2014":""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${e.email?_esc(e.email):"\u2014"}</td>
                    <td class="px-6 py-4 text-gray-800 font-semibold">$${(e.totalPurchases||0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${e.lastPurchase||"\u2014"}</td>
                    <td class="px-6 py-4">
                        ${f?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(a=>a.isVIP||a.type==="vip").length;const o=clients.reduce((a,n)=>a+(Number(n.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=`$${o.toFixed(2)}`}let selectedClientType="regular";function selectClientType(o){selectedClientType=o,document.getElementById("clientType").value=o;const a=document.getElementById("btnClientRegular"),n=document.getElementById("btnClientVip");o==="vip"?(n.style.borderColor="#C5A572",n.style.background="#FFF9F0",n.style.color="#C5A572",a.style.borderColor="#E5E7EB",a.style.background="white",a.style.color="#6B7280"):(a.style.borderColor="#C5A572",a.style.background="#FFF9F0",a.style.color="#C5A572",n.style.borderColor="#E5E7EB",n.style.background="white",n.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(o){o.preventDefault();const a=document.getElementById("editClientId").value,n=document.getElementById("clientName").value.trim(),d=document.getElementById("clientPhone").value.trim(),l=document.getElementById("clientFacebook").value.trim(),c=document.getElementById("clientEmail").value.trim();if(!_validEmail(c)){manekiToastExport("Email inv\xE1lido","warn");return}const t=document.getElementById("clientType").value||"regular",i=(document.getElementById("clientNotas")?.value||"").trim();if(a){const r=clients.find(m=>String(m.id)===String(a));r&&(r.name=n,r.phone=d,r.facebook=l,r.email=c,r.type=t,r.isVIP=t==="vip",r.notas=i)}else{let m=function(f){return String(f||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var p=m;const r={id:mkId(),name:n,phone:d,facebook:l,email:c,type:t,isVIP:t==="vip",notas:i,totalPurchases:0,lastPurchase:null},u=m(n),e=String(d||"").replace(/\D/g,"").slice(-8),s=clients.find(f=>{const g=m(f.name||"")===u&&u!=="",b=e.length>=6&&String(f.phone||"").replace(/\D/g,"").slice(-8)===e;return g||b});s&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${s.name}". Verifica si es el mismo.`,"warn"),clients.push(r)}saveClients(),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(o){const a=clients.find(n=>String(n.id)===String(o));a&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=o,document.getElementById("clientName").value=a.name||"",document.getElementById("clientPhone").value=a.phone||"",document.getElementById("clientFacebook").value=a.facebook||"",document.getElementById("clientEmail").value=a.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=a.notas||""),selectClientType(a.type||"regular"),openModal("addClientModal"))}function deleteClient(o){const a=clients.find(i=>String(i.id)===String(o)),n=a?a.name:"este cliente",l=(window.pedidos||[]).filter(i=>String(i.clienteId||"")===String(o)||String(i.cliente||"").toLowerCase()===String(n).toLowerCase()).filter(i=>i.status!=="finalizado"&&i.status!=="cancelado"&&i.status!=="entregado"),c=l.length>0?`Este cliente tiene ${l.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

Se eliminar\xE1 permanentemente "${_esc(n)}". Esta acci\xF3n no se puede deshacer.`:`Se eliminar\xE1 permanentemente "${_esc(n)}". Esta acci\xF3n no se puede deshacer.`,t=l.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\xBFEliminar cliente?";showConfirm(c,t).then(i=>{i&&(clients=clients.filter(p=>String(p.id)!==String(o)),saveClients(),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard())})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(o){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const a=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),n=a(o.target.value||""),l=_clientesFiltrados().filter(t=>a(t.name).includes(n)||a(t.email||"").includes(n)||(t.phone||t.telefono||"").includes(n)),c=document.getElementById("clientsTable");if(l.length===0){c.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}c.innerHTML=l.map(t=>{const i=t.isVIP||t.type==="vip",p=_tagActividad(t),r=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${p.color}">${p.label}</span>`,m=t.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(t.notas)}">\u{1F4DD} ${_esc(t.notas.substring(0,60))}${t.notas.length>60?"\u2026":""}</div>`:"",u=t.phone?`<button onclick="_abrirWhatsApp('${_escAttr(t.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(197,151,59,0.18) !important;">
                                    <i class="fas fa-user" style="color: #C5A572 !important;"></i>
                                </div>
                                <div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span class="font-semibold text-gray-800">${_esc(t.name)}</span>
                                        ${r}
                                    </div>
                                    ${m}
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
                            ${i?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
