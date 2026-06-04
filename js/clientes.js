function _validEmail(t){return!t||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}const _escAttr=window._esc,_RFM_SEGMENTS=[{key:"campeon",label:"Campeones",emoji:"\u{1F3C6}",color:"#065f46",bg:"#d1fae5",desc:"Compran frecuente y reciente"},{key:"leal",label:"Leales",emoji:"\u2B50",color:"#1e40af",bg:"#dbeafe",desc:"Clientes constantes de alto valor"},{key:"prometedor",label:"Prometedores",emoji:"\u{1F331}",color:"#4d7c0f",bg:"#ecfccb",desc:"Recientes pero pocos pedidos"},{key:"en_riesgo",label:"En riesgo",emoji:"\u26A0\uFE0F",color:"#9a3412",bg:"#ffedd5",desc:"Sol\xEDan comprar, ahora ausentes"},{key:"hibernando",label:"Hibernando",emoji:"\u2744\uFE0F",color:"#1e3a5f",bg:"#e0f2fe",desc:"Sin actividad reciente"},{key:"ocasional",label:"Ocasionales",emoji:"\u{1F535}",color:"#374151",bg:"#f3f4f6",desc:"Compras espor\xE1dicas"}];function _calcRFMScores(){const t=window.pedidosFinalizados||[];if(!t.length)return null;const a=new Date,n={};t.forEach(r=>{const p=String(r.cliente||r.clientName||"").trim();if(!p)return;const u=r.fechaFinalizado||r.fechaPedido||r.fecha||"",o=u?new Date(u+(u.length===10?"T12:00:00":"")):a,s=Math.max(0,Math.floor((a.getTime()-o.getTime())/864e5)),f=Number(r.total||0);n[p]?(n[p].recenciaDias=Math.min(n[p].recenciaDias,s),n[p].frecuencia+=1,n[p].monto+=f):n[p]={recenciaDias:s,frecuencia:1,monto:f}});const c=Object.values(n);if(!c.length)return null;const l=(r,p,u=!1)=>{const o=[...r].sort((g,b)=>g-b);if(!o||o.length===0)return 1;const s=o.filter(g=>g<=p).length,f=Math.ceil(s/o.length*5)||1;return u?6-f:f},d=c.map(r=>r.recenciaDias),e=c.map(r=>r.frecuencia),i=c.map(r=>r.monto),m={};return Object.entries(n).forEach(([r,p])=>{const u=l(d,p.recenciaDias,!0),o=l(e,p.frecuencia),s=l(i,p.monto);let f="ocasional";u>=4&&o>=4?f="campeon":o>=3&&s>=3||u>=4&&s>=4?f="leal":u>=3&&o<=2?f="prometedor":u<=2&&o>=3?f="en_riesgo":u===1&&o<=2&&(f="hibernando"),m[r]={r:u,f:o,m:s,segment:f,recenciaDias:p.recenciaDias,frecuencia:p.frecuencia,monto:p.monto}}),m}window._calcRFMScores=_calcRFMScores;const rfmDescriptions={Campeones:"Compraron recientemente, con alta frecuencia y alto gasto. Tus mejores clientes.",Leales:"Compran con frecuencia y buen gasto. Son confiables y responden a promociones.",Prometedores:"Compraron recientemente pero con baja frecuencia. Potencial de crecer.","En riesgo":"Compraron bastante antes pero no han vuelto. Requieren re-engagement.",Hibernando:"Hace mucho que no compran. Dif\xEDcil recuperarlos pero vale intentarlo.",Ocasionales:"Compran poco, espor\xE1dicamente y gastan poco."};function renderRFMPanel(){const t=document.getElementById("rfmPanelWrapper");if(!t)return;if((window.pedidosFinalizados||[]).length<5){t.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const n=_calcRFMScores();if(!n){t.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const c={};_RFM_SEGMENTS.forEach(d=>{c[d.key]=[]}),Object.entries(n).forEach(([d,e])=>{c[e.segment]&&c[e.segment].push(d)});const l=_RFM_SEGMENTS.map(d=>{const e=c[d.key]||[],i=e.slice(0,3).map(p=>`<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${(_escAttr||_esc)(p)}</span>`).join(" "),m=e.length>3?`<span style="font-size:.7rem;color:#9ca3af">+${e.length-3} m\xE1s</span>`:"",r=(_escAttr||_esc)(rfmDescriptions[d.label]||d.desc);return`<div style="background:${d.bg};border-radius:14px;padding:14px;cursor:help;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${d.key}')"
            title="${r}"
            data-tooltip="${r}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${d.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${d.color}">${d.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${d.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${d.color}">${e.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${i}${m}</div>
        </div>`}).join("");t.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${l}</div>`}window.renderRFMPanel=renderRFMPanel,window._rfmVerSegmento=function(t){const a=_calcRFMScores();if(!a)return;const n=_RFM_SEGMENTS.find(e=>e.key===t);if(!n)return;const c=Object.entries(a).filter(([,e])=>e.segment===t),l=document.getElementById("rfmDetallePanel");if(!l)return;if(!c.length){l.innerHTML='<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>',l.style.display="";return}const d=c.sort(([,e],[,i])=>i.monto-e.monto).map(([e,i])=>{const m=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),r=(window.clients||[]).find(s=>(s.name||"").toLowerCase().trim()===e.toLowerCase().trim()),p=r&&(r.phone||r.telefono)||"",u=p?`https://wa.me/52${p.replace(/\D/g,"")}`:"",o=u?`<a href="${u}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:8px;background:#dcfce7;color:#15803d;font-size:.72rem;font-weight:700;text-decoration:none;" title="Abrir WhatsApp">\u{1F4F1} WA</a>`:'<span style="font-size:.7rem;color:#d1d5db;padding:3px 6px;">Sin tel.</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${m(e)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${i.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">$${i.monto.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${i.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${n.bg};color:${n.color}">${i.r}\xB7${i.f}\xB7${i.m}</span></td>
                <td style="padding:7px 10px;text-align:center">${o}</td>
            </tr>`}).join("");l.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${n.color}">${n.emoji} ${n.label} \u2014 ${c.length} cliente${c.length!==1?"s":""}</span>
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
        </div>`,l.style.display="",l.scrollIntoView({behavior:"smooth",block:"nearest"})};const _cliSortSaved=JSON.parse(localStorage.getItem("mk_clientes_sort")||"null");let _clientesSortCol=_cliSortSaved?.col||"name",_clientesSortDir=_cliSortSaved?.dir||"asc";function sortClientes(t){_clientesSortCol===t?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=t,_clientesSortDir=t==="totalPurchases"?"desc":"asc");try{localStorage.setItem("mk_clientes_sort",JSON.stringify({col:_clientesSortCol,dir:_clientesSortDir}))}catch{}renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const t=_clientesSortCol,a=_clientesSortDir==="asc"?1:-1;return[...clients].sort((n,c)=>{let l,d;return t==="totalPurchases"?(l=Number(n.totalPurchases||0),d=Number(c.totalPurchases||0),a*(l-d)):t==="lastPurchase"?(l=n.lastPurchase||"",d=c.lastPurchase||"",a*l.localeCompare(d)):(l=(n.name||"").toLowerCase(),d=(c.name||"").toLowerCase(),a*l.localeCompare(d))})}function _sortArrow(t){return _clientesSortCol!==t?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(t){const a=[...window.pedidos||[],...window.pedidosFinalizados||[]],n=window.pedidosFinalizados||[],c=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),l=c(t),d=s=>s.clienteId&&String(s.clienteId)===String(t)||s.clientId&&String(s.clientId)===String(t)?!0:c(s.cliente||s.clientName||"")===l,e=a.filter(d),i=n.filter(d),m=e.length,r=i.reduce((s,f)=>s+(Number(f.total)||0),0),p=i.length>0?r/i.length:0,o=e.map(s=>s.fechaPedido||s.fechaCreacion||s.fecha||s.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:m,totalGastado:r,ticketPromedio:p,ultimoPedido:o}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(t){const a=_calcClienteStats(t.nombre||t.name||"");if(!a.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const n=new Date,c=new Date(a.ultimoPedido),l=Math.floor((n-c)/(1e3*60*60*24));return l<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:l<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(t){let a=String(t||"").replace(/[\s\-\(\)]/g,""),n;a.startsWith("+")||a.startsWith("52")?n=`https://wa.me/${a.replace("+","")}`:n=`https://wa.me/521${a}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(n):window.open(n,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(t){const a=String(t||"").toLowerCase().trim(),l=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(i=>(i.cliente||"").toLowerCase().trim()===a).slice().sort((i,m)=>(m.fechaPedido||"").localeCompare(i.fechaPedido||"")).slice(0,8);if(l.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const d=i=>{const m=(i||"").toLowerCase();return m==="entregado"||m==="finalizado"?"\u2705":m==="cancelado"?"\u274C":m==="en proceso"||m==="produccion"||m==="producci\xF3n"?"\u{1F504}":m==="pendiente"?"\u23F3":m==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${l.map(i=>{const m=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(i):Math.max(0,Number(i.total||0)-Number(i.anticipo||0)),r=m>0?`<span style="color:#dc2626">$${m.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(i.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${i.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(i.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${r}</td>
            <td style="padding:6px 8px;font-size:.75rem">${d(i.status)} ${_esc(i.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const t=window._clienteFiltroTag||"";return t?clients.filter(a=>_tagActividad(a).clase===t):[...clients]}function _renderFiltrosActividad(){const t=document.getElementById("searchClient")?.parentElement?.parentElement;if(!t||document.getElementById("_mkFiltrosActividad"))return;const a=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],n=document.createElement("div");n.id="_mkFiltrosActividad",n.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",a.forEach(c=>{const l=document.createElement("button");l.dataset.filtroTag=c.tag,l.textContent=c.label;const d=(window._clienteFiltroTag||"")===c.tag;l.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${d?c.color:"transparent"};background:${c.bg};color:${c.color};transition:border .15s;`,l.onclick=()=>{window._clienteFiltroTag=c.tag,n.querySelectorAll("button").forEach(e=>{const i=a.find(r=>r.tag===e.dataset.filtroTag);if(!i)return;const m=e.dataset.filtroTag===c.tag;e.style.border=`2px solid ${m?i.color:"transparent"}`}),renderClientsTable()},n.appendChild(l)}),t.parentElement.insertBefore(n,t)}function renderClientsTable(){const t=window.clients||[],a=t.length+"_"+t.reduce((o,s)=>o+Number(s.totalPurchases||0),0).toFixed(0),n=document.getElementById("clientsTable");if(n&&n._lastHash===a){typeof renderRFMPanel=="function"&&renderRFMPanel();return}n&&(n._lastHash=a),_renderFiltrosActividad(),typeof renderRFMPanel=="function"&&renderRFMPanel();const c=document.getElementById("clientsTable"),l=_clientesFiltrados();if(clients.length===0){c.innerHTML=`<tr><td colspan="99" class="text-center py-14">
  <div class="text-5xl mb-3">\u{1F465}</div>
  <p class="text-lg font-medium text-gray-500">Sin clientes registrados</p>
  <button onclick="document.getElementById('addClientBtn')?.click()"
          class="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
    + Agregar primer cliente
  </button>
</td></tr>`,updateClientStats();return}if(l.length===0){c.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const d=c.closest("table")?.querySelector("thead tr");if(d){const o=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];d.innerHTML=o.map(s=>{const f=s.key==="totalPurchases"?"text-right":"text-left";return s.key?`<th class="px-6 py-3 ${f} text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(s.key)}')">${s.label} ${_sortArrow(s.key)}</th>`:`<th class="px-6 py-3 ${f} text-xs font-semibold text-gray-500 uppercase tracking-wider">${s.label}</th>`}).join("")}function e(o){const s=(o||"").trim().toLowerCase().charCodeAt(0);return s>=97&&s<=101?"mk-avatar-gold":s>=102&&s<=108?"mk-avatar-lila":s>=109&&s<=114?"mk-avatar-peach":"mk-avatar-green"}function i(o){const s=(o||"").trim().split(" ");return((s[0]||"")[0]||"")+(s[1]?s[1][0]:"")}const m=_clientesSortCol,r=_clientesSortDir==="asc"?1:-1,p=[...l].sort((o,s)=>{let f,g;return m==="totalPurchases"?(f=Number(o.totalPurchases||0),g=Number(s.totalPurchases||0),r*(f-g)):m==="lastPurchase"?(f=o.lastPurchase||"",g=s.lastPurchase||"",r*f.localeCompare(g)):(f=(o.name||"").toLowerCase(),g=(s.name||"").toLowerCase(),r*f.localeCompare(g))}),u={};(window.clientes||clients||[]).forEach(o=>{const s=o.id||o.nombre||o.name||"";u[s]=_calcClienteStats(o.id||o.nombre||o.name||"")}),c.innerHTML=p.map((o,s)=>{const f=o.isVIP||o.type==="vip",g=i(o.name||"?").toUpperCase()||(o.name||"?").trim().charAt(0).toUpperCase(),b=e(o.name),y=(window.notas||[]).filter(x=>x.cliente&&x.cliente.toLowerCase()===(o.name||"").toLowerCase()).sort((x,C)=>(C.fechaCreacion||C.fecha||"").localeCompare(x.fechaCreacion||x.fecha||"")),$=y.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(y[0].texto)}">\u{1F4DD} ${_esc((y[0].texto||"").substring(0,40))}${(y[0].texto||"").length>40?"\u2026":""}</div>`:"",k=o.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(o.notas)}">\u{1F4DD} ${_esc(o.notas.substring(0,60))}${o.notas.length>60?"\u2026":""}</div>`:"",w=o.id||o.nombre||o.name||"",h=u[w]||_calcClienteStats(w),_=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${h.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${h.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${h.ticketPromedio.toFixed(0)}</span>
                    ${h.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${h.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(o),E=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,S=o.phone?`<button onclick="_abrirWhatsApp('${_escAttr(o.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${b}">
                                ${g}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(o.name)}</span>
                                    ${E}
                                </div>
                                ${$}
                                ${k}
                                ${_}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${o.phone?`<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(o.phone).replace(/\D/g,"")}" target="_blank" rel="noopener noreferrer" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(o.phone)}</a>
        ${S}
    </div>`:""}
${o.facebook?`<a href="${_esc(o.facebook).startsWith("http")?_esc(o.facebook):"https://"+_esc(o.facebook)}" target="_blank" rel="noopener noreferrer" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(o.facebook)}</a>`:""}
${!o.phone&&!o.facebook?"\u2014":""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${o.email?_esc(o.email):"\u2014"}</td>
                    <td class="px-6 py-4 text-right text-gray-800 font-semibold">$${(o.totalPurchases||0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${o.lastPurchase||"\u2014"}</td>
                    <td class="px-6 py-4">
                        ${f?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
                    </td>
                    <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(o.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(o.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(o.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                </tr>
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(a=>a.isVIP||a.type==="vip").length;const t=clients.reduce((a,n)=>a+(Number(n.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=`$${t.toFixed(2)}`}let selectedClientType="regular";function selectClientType(t){selectedClientType=t,document.getElementById("clientType").value=t;const a=document.getElementById("btnClientRegular"),n=document.getElementById("btnClientVip");t==="vip"?(n.style.borderColor="#C5A572",n.style.background="#FFF9F0",n.style.color="#C5A572",a.style.borderColor="#E5E7EB",a.style.background="white",a.style.color="#6B7280"):(a.style.borderColor="#C5A572",a.style.background="#FFF9F0",a.style.color="#C5A572",n.style.borderColor="#E5E7EB",n.style.background="white",n.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(t){t.preventDefault();const a=document.getElementById("editClientId").value,n=document.getElementById("clientName").value.trim(),c=document.getElementById("clientPhone").value.trim(),l=document.getElementById("clientFacebook").value.trim(),d=document.getElementById("clientEmail").value.trim();if(!_validEmail(d)){manekiToastExport("Email inv\xE1lido","warn");return}const e=document.getElementById("clientType").value||"regular",i=(document.getElementById("clientNotas")?.value||"").trim();if(a){const r=clients.find(p=>String(p.id)===String(a));r&&(r.name=n,r.phone=c,r.facebook=l,r.email=d,r.type=e,r.isVIP=e==="vip",r.notas=i)}else{let p=function(f){return String(f||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var m=p;const r={id:mkId(),name:n,phone:c,facebook:l,email:d,type:e,isVIP:e==="vip",notas:i,totalPurchases:0,lastPurchase:null},u=p(n),o=String(c||"").replace(/\D/g,"").slice(-8),s=clients.find(f=>{const g=p(f.name||"")===u&&u!=="",b=o.length>=6&&String(f.phone||"").replace(/\D/g,"").slice(-8)===o;return g||b});s&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${s.name}". Verifica si es el mismo.`,"warn"),clients.push(r)}saveClients(),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(t){const a=clients.find(n=>String(n.id)===String(t));a&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=t,document.getElementById("clientName").value=a.name||"",document.getElementById("clientPhone").value=a.phone||"",document.getElementById("clientFacebook").value=a.facebook||"",document.getElementById("clientEmail").value=a.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=a.notas||""),selectClientType(a.type||"regular"),openModal("addClientModal"))}function deleteClient(t){const a=clients.find(i=>String(i.id)===String(t)),n=a?a.name:"este cliente",l=(window.pedidos||[]).filter(i=>String(i.clienteId||"")===String(t)||String(i.cliente||"").toLowerCase()===String(n).toLowerCase()).filter(i=>i.status!=="finalizado"&&i.status!=="cancelado"&&i.status!=="entregado"),d=l.length>0?`Este cliente tiene ${l.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

Se eliminar\xE1 permanentemente "${_esc(n)}". Esta acci\xF3n no se puede deshacer.`:`Se eliminar\xE1 permanentemente "${_esc(n)}". Esta acci\xF3n no se puede deshacer.`,e=l.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\xBFEliminar cliente?";showConfirm(d,e).then(i=>{i&&(clients=clients.filter(m=>String(m.id)!==String(t)),saveClients(),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard())})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(t){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const a=e=>String(e||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),n=a(t.target.value||""),l=_clientesFiltrados().filter(e=>a(e.name).includes(n)||a(e.email||"").includes(n)||(e.phone||e.telefono||"").includes(n)),d=document.getElementById("clientsTable");if(l.length===0){d.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}d.innerHTML=l.map(e=>{const i=e.isVIP||e.type==="vip",m=_tagActividad(e),r=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${m.color}">${m.label}</span>`,p=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",u=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(197,151,59,0.18) !important;">
                                    <i class="fas fa-user" style="color: #C5A572 !important;"></i>
                                </div>
                                <div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span class="font-semibold text-gray-800">${_esc(e.name)}</span>
                                        ${r}
                                    </div>
                                    ${p}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">
    ${e.phone?`<div style="display:flex;flex-direction:column;gap:2px">
        <a href="https://wa.me/521${_esc(e.phone).replace(/\D/g,"")}" target="_blank" rel="noopener noreferrer" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(e.phone)}</a>
        ${u}
    </div>`:""}
${e.facebook?`<a href="${_esc(e.facebook).startsWith("http")?_esc(e.facebook):"https://"+_esc(e.facebook)}" target="_blank" rel="noopener noreferrer" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(e.facebook)}</a>`:""}
${!e.phone&&!e.facebook?"\u2014":""}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${e.email?_esc(e.email):"\u2014"}</td>
                        <td class="px-6 py-4 text-right text-gray-800 font-semibold">$${(e.totalPurchases||0).toFixed(2)}</td>
                        <td class="px-6 py-4 text-gray-600">${e.lastPurchase||"\u2014"}</td>
                        <td class="px-6 py-4">
                            ${i?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
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
                `}).join("")},180)})}const _MK_CLI_TAG_LABEL={activo:"Activos","en-riesgo":"En riesgo",inactivo:"Inactivos",nuevo:"Nuevos"},_mkCliNorm=t=>String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();window._mkCliClearSearch=function(){const t=document.getElementById("searchClient");t&&(t.value="",t.dispatchEvent(new Event("input")))},window._mkCliClearTag=function(){window._clienteFiltroTag="",document.querySelectorAll("#_mkFiltrosActividad button").forEach(t=>{t.style.border="2px solid transparent"}),typeof window.renderClientsTable=="function"&&window.renderClientsTable()};function _mkCliRenderInfo(){const t=document.getElementById("_mkFiltrosActividad")||document.getElementById("searchClient")?.closest("div");if(!t||!t.parentElement)return;let a=document.getElementById("mkCliFilterInfo");a||(a=document.createElement("div"),a.id="mkCliFilterInfo",a.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 24px 0;",t.parentElement.insertBefore(a,t.nextSibling));const n=window.clients||[],c=n.length,l=(document.getElementById("searchClient")?.value||"").trim(),d=window._clienteFiltroTag||"";let e=n;if(d&&typeof window._tagActividad=="function"&&(e=e.filter(r=>window._tagActividad(r).clase===d)),l){const r=_mkCliNorm(l);e=e.filter(p=>_mkCliNorm(p.name).includes(r)||_mkCliNorm(p.email||"").includes(r)||String(p.phone||p.telefono||"").includes(r))}const i=[];l&&i.push(`<span class="mk-filter-chip">Buscar: ${_esc(l)}<button data-tip="Quitar" onclick="_mkCliClearSearch()">\u2715</button></span>`),d&&i.push(`<span class="mk-filter-chip">Filtro: ${_esc(_MK_CLI_TAG_LABEL[d]||d)}<button data-tip="Quitar" onclick="_mkCliClearTag()">\u2715</button></span>`);let m=`<span class="mk-result-count">Mostrando <b>${e.length}</b> de ${c} cliente${c!==1?"s":""}</span>`;i.length&&(m+=`<div class="mk-filter-chips">${i.join("")}<button class="mk-filter-clear" onclick="_mkCliClearSearch();_mkCliClearTag();">Limpiar todo</button></div>`),a.innerHTML=m}window._mkCliRenderInfo=_mkCliRenderInfo,(function(){let a=null;const n=()=>{const c=document.getElementById("clientsTable");if(!c){setTimeout(n,800);return}new MutationObserver(()=>{clearTimeout(a),a=setTimeout(_mkCliRenderInfo,30)}).observe(c,{childList:!0}),_mkCliRenderInfo()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n()})();
//# sourceMappingURL=clientes.js.map
