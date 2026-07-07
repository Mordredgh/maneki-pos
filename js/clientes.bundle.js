"use strict";function _validEmail(n){return!n||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)}const _escAttr=window._esc,_RFM_SEGMENTS=[{key:"campeon",label:"Campeones",emoji:"\u{1F3C6}",color:"#065f46",bg:"#d1fae5",desc:"Compran frecuente y reciente"},{key:"leal",label:"Leales",emoji:"\u2B50",color:"#1e40af",bg:"#dbeafe",desc:"Clientes constantes de alto valor"},{key:"prometedor",label:"Prometedores",emoji:"\u{1F331}",color:"#4d7c0f",bg:"#ecfccb",desc:"Recientes pero pocos pedidos"},{key:"en_riesgo",label:"En riesgo",emoji:"\u26A0\uFE0F",color:"#9a3412",bg:"#ffedd5",desc:"Sol\xEDan comprar, ahora ausentes"},{key:"hibernando",label:"Hibernando",emoji:"\u2744\uFE0F",color:"#1e3a5f",bg:"#e0f2fe",desc:"Sin actividad reciente"},{key:"ocasional",label:"Ocasionales",emoji:"\u{1F535}",color:"#374151",bg:"#f3f4f6",desc:"Compras espor\xE1dicas"}];function _calcRFMScores(){const n=window.pedidosFinalizados||[];if(!n.length)return null;const o=new Date,t={};n.forEach(r=>{const p=String(r.cliente||r.clientName||"").trim();if(!p)return;const f=r.fechaFinalizado||r.fechaPedido||r.fecha||"",a=f?new Date(f+(f.length===10?"T12:00:00":"")):o,d=Math.max(0,Math.floor((o.getTime()-a.getTime())/864e5)),u=Number(r.total||0);t[p]?(t[p].recenciaDias=Math.min(t[p].recenciaDias,d),t[p].frecuencia+=1,t[p].monto+=u):t[p]={recenciaDias:d,frecuencia:1,monto:u}});const i=Object.values(t);if(!i.length)return null;const s=(r,p,f=!1)=>{const a=[...r].sort((g,y)=>g-y);if(!a||a.length===0)return 1;const d=a.filter(g=>g<=p).length,u=Math.ceil(d/a.length*5)||1;return f?6-u:u},l=i.map(r=>r.recenciaDias),e=i.map(r=>r.frecuencia),c=i.map(r=>r.monto),m={};return Object.entries(t).forEach(([r,p])=>{const f=s(l,p.recenciaDias,!0),a=s(e,p.frecuencia),d=s(c,p.monto);let u="ocasional";f>=4&&a>=4?u="campeon":a>=3&&d>=3||f>=4&&d>=4?u="leal":f>=3&&a<=2?u="prometedor":f<=2&&a>=3?u="en_riesgo":f===1&&a<=2&&(u="hibernando"),m[r]={r:f,f:a,m:d,segment:u,recenciaDias:p.recenciaDias,frecuencia:p.frecuencia,monto:p.monto}}),m}window._calcRFMScores=_calcRFMScores;const rfmDescriptions={Campeones:"Compraron recientemente, con alta frecuencia y alto gasto. Tus mejores clientes.",Leales:"Compran con frecuencia y buen gasto. Son confiables y responden a promociones.",Prometedores:"Compraron recientemente pero con baja frecuencia. Potencial de crecer.","En riesgo":"Compraron bastante antes pero no han vuelto. Requieren re-engagement.",Hibernando:"Hace mucho que no compran. Dif\xEDcil recuperarlos pero vale intentarlo.",Ocasionales:"Compran poco, espor\xE1dicamente y gastan poco."};function renderRFMPanel(){const n=document.getElementById("rfmPanelWrapper");if(!n)return;if((window.pedidosFinalizados||[]).length<5){n.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const t=_calcRFMScores();if(!t){n.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const i={};_RFM_SEGMENTS.forEach(l=>{i[l.key]=[]}),Object.entries(t).forEach(([l,e])=>{i[e.segment]&&i[e.segment].push(l)});const s=_RFM_SEGMENTS.map(l=>{const e=i[l.key]||[],c=e.slice(0,3).map(p=>`<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${(_escAttr||_esc)(p)}</span>`).join(" "),m=e.length>3?`<span style="font-size:.7rem;color:#9ca3af">+${e.length-3} m\xE1s</span>`:"",r=(_escAttr||_esc)(rfmDescriptions[l.label]||l.desc);return`<div style="background:${l.bg};border-radius:14px;padding:14px;cursor:help;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${l.key}')"
            title="${r}"
            data-tooltip="${r}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${l.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${l.color}">${l.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${l.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${l.color}">${e.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${c}${m}</div>
        </div>`}).join("");n.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${s}</div>`}window.renderRFMPanel=renderRFMPanel,window._rfmVerSegmento=function(n){const o=_calcRFMScores();if(!o)return;const t=_RFM_SEGMENTS.find(e=>e.key===n);if(!t)return;const i=Object.entries(o).filter(([,e])=>e.segment===n),s=document.getElementById("rfmDetallePanel");if(!s)return;if(!i.length){s.innerHTML='<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>',s.style.display="";return}const l=i.sort(([,e],[,c])=>c.monto-e.monto).map(([e,c])=>{const m=d=>String(d||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),r=(window.clients||[]).find(d=>(d.name||"").toLowerCase().trim()===e.toLowerCase().trim()),p=r&&(r.phone||r.telefono)||"",f=p?`https://wa.me/52${p.replace(/\D/g,"")}`:"",a=f?`<a href="${f}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:8px;background:#dcfce7;color:#15803d;font-size:.72rem;font-weight:700;text-decoration:none;" title="Abrir WhatsApp">\u{1F4F1} WA</a>`:'<span style="font-size:.7rem;color:#d1d5db;padding:3px 6px;">Sin tel.</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${m(e)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${c.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">${fmtMoney(c.monto)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${c.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${t.bg};color:${t.color}">${c.r}\xB7${c.f}\xB7${c.m}</span></td>
                <td style="padding:7px 10px;text-align:center">${a}</td>
            </tr>`}).join("");s.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${t.color}">${t.emoji} ${t.label} \u2014 ${i.length} cliente${i.length!==1?"s":""}</span>
            <button onclick="document.getElementById('rfmDetallePanel').style.display='none'" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.1rem"><i class="fas fa-xmark"></i></button>
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
            <tbody>${l}</tbody>
        </table>
        </div>`,s.style.display="",s.scrollIntoView({behavior:"smooth",block:"nearest"})};let _cliSortSaved=null;try{_cliSortSaved=JSON.parse(localStorage.getItem("mk_clientes_sort")||"null")}catch{_cliSortSaved=null}let _clientesSortCol=_cliSortSaved?.col||"name",_clientesSortDir=_cliSortSaved?.dir||"asc";function sortClientes(n){_clientesSortCol===n?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=n,_clientesSortDir=n==="totalPurchases"?"desc":"asc");try{localStorage.setItem("mk_clientes_sort",JSON.stringify({col:_clientesSortCol,dir:_clientesSortDir}))}catch{}renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const n=_clientesSortCol,o=_clientesSortDir==="asc"?1:-1;return[...clients].sort((t,i)=>{let s,l;return n==="totalPurchases"?(s=Number(t.totalPurchases||0),l=Number(i.totalPurchases||0),o*(s-l)):n==="lastPurchase"?(s=t.lastPurchase||"",l=i.lastPurchase||"",o*s.localeCompare(l)):(s=(t.name||"").toLowerCase(),l=(i.name||"").toLowerCase(),o*s.localeCompare(l))})}function _sortArrow(n){return _clientesSortCol!==n?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#FFD166">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(n){const o=[...window.pedidos||[],...window.pedidosFinalizados||[]],t=window.pedidosFinalizados||[],i=d=>String(d||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),s=i(n),l=d=>d.clienteId&&String(d.clienteId)===String(n)||d.clientId&&String(d.clientId)===String(n)?!0:i(d.cliente||d.clientName||"")===s,e=o.filter(l),c=t.filter(l),m=e.length,r=c.reduce((d,u)=>d+(Number(u.total)||0),0),p=c.length>0?r/c.length:0,a=e.map(d=>d.fechaPedido||d.fechaCreacion||d.fecha||d.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:m,totalGastado:r,ticketPromedio:p,ultimoPedido:a}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(n){const o=_calcClienteStats(n.nombre||n.name||"");if(!o.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const t=new Date,i=new Date(o.ultimoPedido),s=Math.floor((t-i)/(1e3*60*60*24));return s<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:s<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(n){let o=String(n||"").replace(/[\s\-\(\)]/g,""),t;o.startsWith("+")||o.startsWith("52")?t=`https://wa.me/${o.replace("+","")}`:t=`https://wa.me/521${o}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(t):window.open(t,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(n){const o=String(n||"").toLowerCase().trim(),s=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(c=>(c.cliente||"").toLowerCase().trim()===o).slice().sort((c,m)=>(m.fechaPedido||"").localeCompare(c.fechaPedido||"")).slice(0,8);if(s.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const l=c=>{const m=(c||"").toLowerCase();return m==="entregado"||m==="finalizado"?"\u2705":m==="cancelado"?"\u274C":m==="en proceso"||m==="produccion"||m==="producci\xF3n"?"\u{1F504}":m==="pendiente"?"\u23F3":m==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${s.map(c=>{const m=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(c):Math.max(0,Number(c.total||0)-Number(c.anticipo||0)),r=m>0?`<span style="color:#dc2626">$${m.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(c.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${c.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(c.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${r}</td>
            <td style="padding:6px 8px;font-size:.75rem">${l(c.status)} ${_esc(c.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const n=window._clienteFiltroTag||"";return n?clients.filter(o=>_tagActividad(o).clase===n):[...clients]}function _renderFiltrosActividad(){const n=document.getElementById("searchClient")?.parentElement?.parentElement;if(!n||document.getElementById("_mkFiltrosActividad"))return;const o=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],t=document.createElement("div");t.id="_mkFiltrosActividad",t.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",o.forEach(i=>{const s=document.createElement("button");s.dataset.filtroTag=i.tag,s.textContent=i.label;const l=(window._clienteFiltroTag||"")===i.tag;s.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${l?i.color:"transparent"};background:${i.bg};color:${i.color};transition:border .15s;`,s.onclick=()=>{window._clienteFiltroTag=i.tag,t.querySelectorAll("button").forEach(e=>{const c=o.find(r=>r.tag===e.dataset.filtroTag);if(!c)return;const m=e.dataset.filtroTag===i.tag;e.style.border=`2px solid ${m?c.color:"transparent"}`}),renderClientsTable()},t.appendChild(s)}),n.parentElement.insertBefore(t,n)}function renderClientsTable(){const n=window.clients||[],o=n.length+"_"+n.reduce((a,d)=>a+Number(d.totalPurchases||0),0).toFixed(0),t=document.getElementById("clientsTable");if(t&&t._lastHash===o){typeof renderRFMPanel=="function"&&renderRFMPanel();return}t&&(t._lastHash=o),_renderFiltrosActividad(),typeof renderRFMPanel=="function"&&renderRFMPanel();const i=document.getElementById("clientsTable"),s=_clientesFiltrados();if(clients.length===0){i.innerHTML=`<tr><td colspan="99" class="text-center py-14">
  <div class="text-5xl mb-3">\u{1F465}</div>
  <p class="text-lg font-medium text-gray-500">Sin clientes registrados</p>
  <button onclick="document.getElementById('addClientBtn')?.click()"
          class="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
    + Agregar primer cliente
  </button>
</td></tr>`,updateClientStats();return}if(s.length===0){i.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const l=i.closest("table")?.querySelector("thead tr");if(l){const a=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];l.innerHTML=a.map(d=>{const u=d.key==="totalPurchases"?"text-right":"text-left";return d.key?`<th class="px-6 py-3 ${u} text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(d.key)}')">${d.label} ${_sortArrow(d.key)}</th>`:`<th class="px-6 py-3 ${u} text-xs font-semibold text-gray-500 uppercase tracking-wider">${d.label}</th>`}).join("")}function e(a){const d=(a||"").trim().toLowerCase().charCodeAt(0);return d>=97&&d<=101?"mk-avatar-gold":d>=102&&d<=108?"mk-avatar-lila":d>=109&&d<=114?"mk-avatar-peach":"mk-avatar-green"}function c(a){const d=(a||"").trim().split(" ");return((d[0]||"")[0]||"")+(d[1]?d[1][0]:"")}const m=_clientesSortCol,r=_clientesSortDir==="asc"?1:-1,p=[...s].sort((a,d)=>{let u,g;return m==="totalPurchases"?(u=Number(a.totalPurchases||0),g=Number(d.totalPurchases||0),r*(u-g)):m==="lastPurchase"?(u=a.lastPurchase||"",g=d.lastPurchase||"",r*u.localeCompare(g)):(u=(a.name||"").toLowerCase(),g=(d.name||"").toLowerCase(),r*u.localeCompare(g))}),f={};(window.clientes||clients||[]).forEach(a=>{const d=a.id||a.nombre||a.name||"";f[d]=_calcClienteStats(a.id||a.nombre||a.name||"")}),i.innerHTML=p.map((a,d)=>{const u=a.isVIP||a.type==="vip",g=c(a.name||"?").toUpperCase()||(a.name||"?").trim().charAt(0).toUpperCase(),y=e(a.name),h=(window.notas||[]).filter(x=>x.cliente&&x.cliente.toLowerCase()===(a.name||"").toLowerCase()).sort((x,C)=>(C.fechaCreacion||C.fecha||"").localeCompare(x.fechaCreacion||x.fecha||"")),k=h.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(h[0].texto)}">\u{1F4DD} ${_esc((h[0].texto||"").substring(0,40))}${(h[0].texto||"").length>40?"\u2026":""}</div>`:"",$=a.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(a.notas)}">\u{1F4DD} ${_esc(a.notas.substring(0,60))}${a.notas.length>60?"\u2026":""}</div>`:"",w=a.id||a.nombre||a.name||"",b=f[w]||_calcClienteStats(w),_=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${b.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${b.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${b.ticketPromedio.toFixed(0)}</span>
                    ${b.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${b.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(a),E=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,S=a.phone?`<button onclick="_abrirWhatsApp('${_escAttr(a.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${y}">
                                ${g}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(a.name)}</span>
                                    ${E}
                                </div>
                                ${k}
                                ${$}
                                ${_}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${a.phone?`<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(a.phone).replace(/\D/g,"")}" target="_blank" rel="noopener noreferrer" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(a.phone)}</a>
        ${S}
    </div>`:""}
${a.facebook?`<a href="${_esc(a.facebook).startsWith("http")?_esc(a.facebook):"https://"+_esc(a.facebook)}" target="_blank" rel="noopener noreferrer" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(a.facebook)}</a>`:""}
${!a.phone&&!a.facebook?"\u2014":""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${a.email?_esc(a.email):"\u2014"}</td>
                    <td class="px-6 py-4 text-right text-gray-800 font-semibold">${fmtMoney(a.totalPurchases||0)}</td>
                    <td class="px-6 py-4 text-gray-600">${a.lastPurchase||"\u2014"}</td>
                    <td class="px-6 py-4">
                        ${u?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
                    </td>
                    <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(a.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(a.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(a.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                </tr>
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(o=>o.isVIP||o.type==="vip").length;const n=clients.reduce((o,t)=>o+(Number(t.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=fmtMoney(n)}let selectedClientType="regular";function selectClientType(n){selectedClientType=n,document.getElementById("clientType").value=n;const o=document.getElementById("btnClientRegular"),t=document.getElementById("btnClientVip");n==="vip"?(t.style.borderColor="#FFD166",t.style.background="#FFF9F0",t.style.color="#FFD166",o.style.borderColor="#E5E7EB",o.style.background="white",o.style.color="#6B7280"):(o.style.borderColor="#FFD166",o.style.background="#FFF9F0",o.style.color="#FFD166",t.style.borderColor="#E5E7EB",t.style.background="white",t.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(n){n.preventDefault();const o=document.getElementById("editClientId").value,t=document.getElementById("clientName").value.trim(),i=document.getElementById("clientPhone").value.trim(),s=document.getElementById("clientFacebook").value.trim(),l=document.getElementById("clientEmail").value.trim();if(!_validEmail(l)){manekiToastExport("Email inv\xE1lido","warn");return}const e=document.getElementById("clientType").value||"regular",c=(document.getElementById("clientNotas")?.value||"").trim();if(o){const r=clients.find(p=>String(p.id)===String(o));r&&(r.name=t,r.phone=i,r.facebook=s,r.email=l,r.type=e,r.isVIP=e==="vip",r.notas=c)}else{let p=function(u){return String(u||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var m=p;const r={id:mkId(),name:t,phone:i,facebook:s,email:l,type:e,isVIP:e==="vip",notas:c,totalPurchases:0,lastPurchase:null},f=p(t),a=String(i||"").replace(/\D/g,"").slice(-8),d=clients.find(u=>{const g=p(u.name||"")===f&&f!=="",y=a.length>=6&&String(u.phone||"").replace(/\D/g,"").slice(-8)===a;return g||y});d&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${d.name}". Verifica si es el mismo.`,"warn"),clients.push(r)}saveClients(),typeof window._mkModalSaved=="function"&&window._mkModalSaved("addClientModal"),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(n){const o=clients.find(t=>String(t.id)===String(n));o&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=n,document.getElementById("clientName").value=o.name||"",document.getElementById("clientPhone").value=o.phone||"",document.getElementById("clientFacebook").value=o.facebook||"",document.getElementById("clientEmail").value=o.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=o.notas||""),selectClientType(o.type||"regular"),openModal("addClientModal"))}function deleteClient(n){const o=clients.find(c=>String(c.id)===String(n)),t=o?o.name:"este cliente",s=(window.pedidos||[]).filter(c=>String(c.clienteId||"")===String(n)||String(c.cliente||"").toLowerCase()===String(t).toLowerCase()).filter(c=>c.status!=="finalizado"&&c.status!=="cancelado"&&c.status!=="entregado"),l=s.length>0?`Este cliente tiene ${s.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

Se eliminar\xE1 permanentemente "${_esc(t)}". Esta acci\xF3n no se puede deshacer.`:`Se eliminar\xE1 permanentemente "${_esc(t)}". Esta acci\xF3n no se puede deshacer.`,e=s.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\xBFEliminar cliente?";showConfirm(l,e).then(c=>{if(!c)return;const m=String(n);clients=clients.filter(r=>String(r.id)!==m),saveClients(),typeof window.deleteClientFromDB=="function"&&window.deleteClientFromDB(m),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard()})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(n){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const o=e=>String(e||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),t=o(n.target.value||""),s=_clientesFiltrados().filter(e=>o(e.name).includes(t)||o(e.email||"").includes(t)||(e.phone||e.telefono||"").includes(t)),l=document.getElementById("clientsTable");if(s.length===0){l.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}l.innerHTML=s.map(e=>{const c=e.isVIP||e.type==="vip",m=_tagActividad(e),r=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${m.color}">${m.label}</span>`,p=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",f=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(255,209,102,0.18) !important;">
                                    <i class="fas fa-user" style="color: #FFD166 !important;"></i>
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
        ${f}
    </div>`:""}
${e.facebook?`<a href="${_esc(e.facebook).startsWith("http")?_esc(e.facebook):"https://"+_esc(e.facebook)}" target="_blank" rel="noopener noreferrer" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(e.facebook)}</a>`:""}
${!e.phone&&!e.facebook?"\u2014":""}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${e.email?_esc(e.email):"\u2014"}</td>
                        <td class="px-6 py-4 text-right text-gray-800 font-semibold">${fmtMoney(e.totalPurchases||0)}</td>
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
                `}).join("")},180)})}const _MK_CLI_TAG_LABEL={activo:"Activos","en-riesgo":"En riesgo",inactivo:"Inactivos",nuevo:"Nuevos"},_mkCliNorm=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();window._mkCliClearSearch=function(){const n=document.getElementById("searchClient");n&&(n.value="",n.dispatchEvent(new Event("input")))},window._mkCliClearTag=function(){window._clienteFiltroTag="",document.querySelectorAll("#_mkFiltrosActividad button").forEach(n=>{n.style.border="2px solid transparent"}),typeof window.renderClientsTable=="function"&&window.renderClientsTable()};function _mkCliRenderInfo(){const n=document.getElementById("_mkFiltrosActividad")||document.getElementById("searchClient")?.closest("div");if(!n||!n.parentElement)return;let o=document.getElementById("mkCliFilterInfo");o||(o=document.createElement("div"),o.id="mkCliFilterInfo",o.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 24px 0;",n.parentElement.insertBefore(o,n.nextSibling));const t=window.clients||[],i=t.length,s=(document.getElementById("searchClient")?.value||"").trim(),l=window._clienteFiltroTag||"";let e=t;if(l&&typeof window._tagActividad=="function"&&(e=e.filter(r=>window._tagActividad(r).clase===l)),s){const r=_mkCliNorm(s);e=e.filter(p=>_mkCliNorm(p.name).includes(r)||_mkCliNorm(p.email||"").includes(r)||String(p.phone||p.telefono||"").includes(r))}const c=[];s&&c.push(`<span class="mk-filter-chip">Buscar: ${_esc(s)}<button data-tip="Quitar" onclick="_mkCliClearSearch()"><i class="fas fa-xmark"></i></button></span>`),l&&c.push(`<span class="mk-filter-chip">Filtro: ${_esc(_MK_CLI_TAG_LABEL[l]||l)}<button data-tip="Quitar" onclick="_mkCliClearTag()"><i class="fas fa-xmark"></i></button></span>`);let m=`<span class="mk-result-count">Mostrando <b>${e.length}</b> de ${i} cliente${i!==1?"s":""}</span>`;c.length&&(m+=`<div class="mk-filter-chips">${c.join("")}<button class="mk-filter-clear" onclick="_mkCliClearSearch();_mkCliClearTag();">Limpiar todo</button></div>`),o.innerHTML=m}window._mkCliRenderInfo=_mkCliRenderInfo,(function(){let o=null;const t=()=>{const i=document.getElementById("clientsTable");if(!i){setTimeout(t,800);return}new MutationObserver(()=>{clearTimeout(o),o=setTimeout(_mkCliRenderInfo,30)}).observe(i,{childList:!0}),_mkCliRenderInfo()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):t()})();function abrirFusionarClientes(){if(!document.getElementById("fusionarClientesModal")){const s=document.createElement("div");s.id="fusionarClientesModal",s.className="fixed inset-0 z-50 hidden items-center justify-center",s.style.background="rgba(0,0,0,0.5)",s.innerHTML=`
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                <h3 class="text-base font-bold text-gray-800 mb-4">\u{1F500} Fusionar clientes duplicados</h3>
                <p class="text-xs text-gray-500 mb-3">Los pedidos del cliente a fusionar se mover\xE1n al cliente principal.</p>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs text-gray-500">Cliente principal (se preserva)</label>
                        <select id="fusionClientePrincipal" class="w-full border rounded-xl px-3 py-2 text-sm mt-1"></select>
                    </div>
                    <div>
                        <label class="text-xs text-gray-500">Cliente a fusionar (desaparece)</label>
                        <select id="fusionClienteAFusionar" class="w-full border rounded-xl px-3 py-2 text-sm mt-1"></select>
                    </div>
                </div>
                <div class="flex gap-2 mt-4">
                    <button onclick="closeModal('fusionarClientesModal')" class="flex-1 btn-secondary py-2 rounded-xl text-sm">Cancelar</button>
                    <button onclick="_ejecutarFusion()" class="flex-1 btn-primary py-2 rounded-xl text-sm">Fusionar</button>
                </div>
            </div>
        `,document.body.appendChild(s)}const n=(window.clients||[]).slice().sort((s,l)=>(s.name||"").localeCompare(l.name||"")),o=n.map(s=>`<option value="${_esc(String(s.id))}">${_esc(s.name)}</option>`).join(""),t=document.getElementById("fusionClientePrincipal"),i=document.getElementById("fusionClienteAFusionar");t&&(t.innerHTML=o),i&&(i.innerHTML=o),i&&n.length>1&&(i.selectedIndex=1),openModal("fusionarClientesModal")}function _ejecutarFusion(){const n=document.getElementById("fusionClientePrincipal"),o=document.getElementById("fusionClienteAFusionar");if(!n||!o)return;const t=n.value,i=o.value;if(t===i){typeof window.manekiToastExport=="function"&&window.manekiToastExport("Selecciona dos clientes diferentes","warn");return}const s=window.clients||[],l=s.find(r=>String(r.id)===String(t)),e=s.find(r=>String(r.id)===String(i));if(!l||!e)return;const c=window.showConfirm;(typeof c=="function"?c(`\xBFFusionar "${_esc(e.name)}" \u2192 "${_esc(l.name)}"?

Sus pedidos e historial se mover\xE1n al cliente principal. Esta acci\xF3n no se puede deshacer.`,"\u{1F500} Fusionar clientes"):Promise.resolve(window.confirm(`\xBFFusionar "${e.name}" en "${l.name}"?`))).then(r=>{if(!r)return;const p=(e.name||"").toLowerCase().trim();(window.pedidos||[]).forEach(f=>{((f.cliente||"").toLowerCase().trim()===p||String(f.clienteId)===String(i))&&(f.cliente=l.name,f.clienteId=l.id)}),(window.pedidosFinalizados||[]).forEach(f=>{(f.cliente||"").toLowerCase().trim()===p&&(f.cliente=l.name)}),(window.salesHistory||[]).forEach(f=>{(f.customer||"").toLowerCase().trim()===p&&(f.customer=l.name)}),!l.phone&&e.phone&&(l.phone=e.phone),!l.email&&e.email&&(l.email=e.email),!l.notas&&e.notas&&(l.notas=e.notas),window.clients=s.filter(f=>String(f.id)!==String(i)),typeof window.saveClients=="function"&&window.saveClients(),typeof window.savePedidos=="function"&&window.savePedidos(),typeof window.saveSalesHistory=="function"&&window.saveSalesHistory(),typeof window.deleteClientFromDB=="function"&&window.deleteClientFromDB(String(i)),closeModal("fusionarClientesModal"),typeof window.renderClientsTable=="function"&&window.renderClientsTable(),typeof window.manekiToastExport=="function"&&window.manekiToastExport(`\u2705 "${e.name}" fusionado con "${l.name}"`,"ok")})}window.abrirFusionarClientes=abrirFusionarClientes,window._ejecutarFusion=_ejecutarFusion,(function(){const o=()=>{if(document.getElementById("_mkBtnFusionarClientes"))return;const t=document.getElementById("addClientBtn");if(!t){setTimeout(o,800);return}const i=document.createElement("button");i.id="_mkBtnFusionarClientes",i.type="button",i.title="Fusionar clientes duplicados",i.innerHTML='<i class="fas fa-code-branch"></i> Fusionar duplicados',i.className="mk-toolbar-btn",i.style.cssText="margin-left:8px;",i.addEventListener("click",()=>abrirFusionarClientes()),t.insertAdjacentElement("afterend",i)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o):o()})();
//# sourceMappingURL=clientes.js.map
