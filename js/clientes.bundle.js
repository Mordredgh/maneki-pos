"use strict";function _validEmail(n){return!n||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)}const _escAttr=window._esc,_RFM_SEGMENTS=[{key:"campeon",label:"Campeones",emoji:"\u{1F3C6}",color:"#065f46",bg:"#d1fae5",desc:"Compran frecuente y reciente"},{key:"leal",label:"Leales",emoji:"\u2B50",color:"#1e40af",bg:"#dbeafe",desc:"Clientes constantes de alto valor"},{key:"prometedor",label:"Prometedores",emoji:"\u{1F331}",color:"#4d7c0f",bg:"#ecfccb",desc:"Recientes pero pocos pedidos"},{key:"en_riesgo",label:"En riesgo",emoji:"\u26A0\uFE0F",color:"#9a3412",bg:"#ffedd5",desc:"Sol\xEDan comprar, ahora ausentes"},{key:"hibernando",label:"Hibernando",emoji:"\u2744\uFE0F",color:"#1e3a5f",bg:"#e0f2fe",desc:"Sin actividad reciente"},{key:"ocasional",label:"Ocasionales",emoji:"\u{1F535}",color:"#374151",bg:"#f3f4f6",desc:"Compras espor\xE1dicas"}];function _calcRFMScores(){const n=window.pedidosFinalizados||[];if(!n.length)return null;const o=new Date,t={};n.forEach(l=>{const p=String(l.cliente||l.clientName||"").trim();if(!p)return;const u=l.fechaFinalizado||l.fechaPedido||l.fecha||"",i=u?new Date(u+(u.length===10?"T12:00:00":"")):o,d=Math.max(0,Math.floor((o.getTime()-i.getTime())/864e5)),f=Number(l.total||0);t[p]?(t[p].recenciaDias=Math.min(t[p].recenciaDias,d),t[p].frecuencia+=1,t[p].monto+=f):t[p]={recenciaDias:d,frecuencia:1,monto:f}});const a=Object.values(t);if(!a.length)return null;const s=(l,p,u=!1)=>{const i=[...l].sort((g,y)=>g-y);if(!i||i.length===0)return 1;const d=i.filter(g=>g<=p).length,f=Math.ceil(d/i.length*5)||1;return u?6-f:f},r=a.map(l=>l.recenciaDias),e=a.map(l=>l.frecuencia),c=a.map(l=>l.monto),m={};return Object.entries(t).forEach(([l,p])=>{const u=s(r,p.recenciaDias,!0),i=s(e,p.frecuencia),d=s(c,p.monto);let f="ocasional";u>=4&&i>=4?f="campeon":i>=3&&d>=3||u>=4&&d>=4?f="leal":u>=3&&i<=2?f="prometedor":u<=2&&i>=3?f="en_riesgo":u===1&&i<=2&&(f="hibernando"),m[l]={r:u,f:i,m:d,segment:f,recenciaDias:p.recenciaDias,frecuencia:p.frecuencia,monto:p.monto}}),m}window._calcRFMScores=_calcRFMScores;const rfmDescriptions={Campeones:"Compraron recientemente, con alta frecuencia y alto gasto. Tus mejores clientes.",Leales:"Compran con frecuencia y buen gasto. Son confiables y responden a promociones.",Prometedores:"Compraron recientemente pero con baja frecuencia. Potencial de crecer.","En riesgo":"Compraron bastante antes pero no han vuelto. Requieren re-engagement.",Hibernando:"Hace mucho que no compran. Dif\xEDcil recuperarlos pero vale intentarlo.",Ocasionales:"Compran poco, espor\xE1dicamente y gastan poco."};function renderRFMPanel(){const n=document.getElementById("rfmPanelWrapper");if(!n)return;if((window.pedidosFinalizados||[]).length<5){n.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const t=_calcRFMScores();if(!t){n.innerHTML=`<div class="text-center py-10 text-gray-400">
  <div class="text-4xl mb-2">\u{1F4CA}</div>
  <p class="font-medium">Sin datos suficientes para segmentaci\xF3n</p>
  <p class="text-sm mt-1">Necesitas pedidos finalizados para ver el an\xE1lisis RFM</p>
</div>`;return}const a={};_RFM_SEGMENTS.forEach(r=>{a[r.key]=[]}),Object.entries(t).forEach(([r,e])=>{a[e.segment]&&a[e.segment].push(r)});const s=_RFM_SEGMENTS.map(r=>{const e=a[r.key]||[],c=e.slice(0,3).map(p=>`<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${(_escAttr||_esc)(p)}</span>`).join(" "),m=e.length>3?`<span style="font-size:.7rem;color:#9ca3af">+${e.length-3} m\xE1s</span>`:"",l=(_escAttr||_esc)(rfmDescriptions[r.label]||r.desc);return`<div style="background:${r.bg};border-radius:14px;padding:14px;cursor:help;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${r.key}')"
            title="${l}"
            data-tooltip="${l}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${r.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${r.color}">${r.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${r.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${r.color}">${e.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${c}${m}</div>
        </div>`}).join("");n.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${s}</div>`}window.renderRFMPanel=renderRFMPanel,window._rfmVerSegmento=function(n){const o=_calcRFMScores();if(!o)return;const t=_RFM_SEGMENTS.find(e=>e.key===n);if(!t)return;const a=Object.entries(o).filter(([,e])=>e.segment===n),s=document.getElementById("rfmDetallePanel");if(!s)return;if(!a.length){s.innerHTML='<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>',s.style.display="";return}const r=a.sort(([,e],[,c])=>c.monto-e.monto).map(([e,c])=>{const m=d=>String(d||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),l=(window.clients||[]).find(d=>(d.name||"").toLowerCase().trim()===e.toLowerCase().trim()),p=l&&(l.phone||l.telefono)||"",u=p?`https://wa.me/52${p.replace(/\D/g,"")}`:"",i=u?`<a href="${u}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:8px;background:#dcfce7;color:#15803d;font-size:.72rem;font-weight:700;text-decoration:none;" title="Abrir WhatsApp">\u{1F4F1} WA</a>`:'<span style="font-size:.7rem;color:#d1d5db;padding:3px 6px;">Sin tel.</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${m(e)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${c.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">$${c.monto.toLocaleString("es-MX",{maximumFractionDigits:0})}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${c.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${t.bg};color:${t.color}">${c.r}\xB7${c.f}\xB7${c.m}</span></td>
                <td style="padding:7px 10px;text-align:center">${i}</td>
            </tr>`}).join("");s.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${t.color}">${t.emoji} ${t.label} \u2014 ${a.length} cliente${a.length!==1?"s":""}</span>
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
            <tbody>${r}</tbody>
        </table>
        </div>`,s.style.display="",s.scrollIntoView({behavior:"smooth",block:"nearest"})};const _cliSortSaved=JSON.parse(localStorage.getItem("mk_clientes_sort")||"null");let _clientesSortCol=_cliSortSaved?.col||"name",_clientesSortDir=_cliSortSaved?.dir||"asc";function sortClientes(n){_clientesSortCol===n?_clientesSortDir=_clientesSortDir==="asc"?"desc":"asc":(_clientesSortCol=n,_clientesSortDir=n==="totalPurchases"?"desc":"asc");try{localStorage.setItem("mk_clientes_sort",JSON.stringify({col:_clientesSortCol,dir:_clientesSortDir}))}catch{}renderClientsTable()}window.sortClientes=sortClientes;function _getSortedClients(){const n=_clientesSortCol,o=_clientesSortDir==="asc"?1:-1;return[...clients].sort((t,a)=>{let s,r;return n==="totalPurchases"?(s=Number(t.totalPurchases||0),r=Number(a.totalPurchases||0),o*(s-r)):n==="lastPurchase"?(s=t.lastPurchase||"",r=a.lastPurchase||"",o*s.localeCompare(r)):(s=(t.name||"").toLowerCase(),r=(a.name||"").toLowerCase(),o*s.localeCompare(r))})}function _sortArrow(n){return _clientesSortCol!==n?'<span style="opacity:.3;font-size:.65rem">\u2195</span>':`<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir==="asc"?"\u2191":"\u2193"}</span>`}function _calcClienteStats(n){const o=[...window.pedidos||[],...window.pedidosFinalizados||[]],t=window.pedidosFinalizados||[],a=d=>String(d||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),s=a(n),r=d=>d.clienteId&&String(d.clienteId)===String(n)||d.clientId&&String(d.clientId)===String(n)?!0:a(d.cliente||d.clientName||"")===s,e=o.filter(r),c=t.filter(r),m=e.length,l=c.reduce((d,f)=>d+(Number(f.total)||0),0),p=c.length>0?l/c.length:0,i=e.map(d=>d.fechaPedido||d.fechaCreacion||d.fecha||d.fechaFinalizado||"").filter(Boolean).sort().reverse()[0]||null;return{totalPedidos:m,totalGastado:l,ticketPromedio:p,ultimoPedido:i}}window._calcClienteStats=_calcClienteStats;const _tagStyles={nuevo:"background:#dbeafe;color:#1e40af",activo:"background:#dcfce7;color:#15803d","en-riesgo":"background:#fed7aa;color:#c2410c",inactivo:"background:#fee2e2;color:#dc2626"};function _tagActividad(n){const o=_calcClienteStats(n.nombre||n.name||"");if(!o.ultimoPedido)return{label:"Nuevo",color:_tagStyles.nuevo,clase:"nuevo"};const t=new Date,a=new Date(o.ultimoPedido),s=Math.floor((t-a)/(1e3*60*60*24));return s<=60?{label:"Activo",color:_tagStyles.activo,clase:"activo"}:s<=120?{label:"En riesgo",color:_tagStyles["en-riesgo"],clase:"en-riesgo"}:{label:"Inactivo",color:_tagStyles.inactivo,clase:"inactivo"}}window._tagActividad=_tagActividad;function _abrirWhatsApp(n){let o=String(n||"").replace(/[\s\-\(\)]/g,""),t;o.startsWith("+")||o.startsWith("52")?t=`https://wa.me/${o.replace("+","")}`:t=`https://wa.me/521${o}`,window.electron?.shell?.openExternal?window.electron.shell.openExternal(t):window.open(t,"_blank")}window._abrirWhatsApp=_abrirWhatsApp;function renderHistorialClienteModal(n){const o=String(n||"").toLowerCase().trim(),s=[...window.pedidos||[],...window.pedidosFinalizados||[]].filter(c=>(c.cliente||"").toLowerCase().trim()===o).slice().sort((c,m)=>(m.fechaPedido||"").localeCompare(c.fechaPedido||"")).slice(0,8);if(s.length===0)return'<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';const r=c=>{const m=(c||"").toLowerCase();return m==="entregado"||m==="finalizado"?"\u2705":m==="cancelado"?"\u274C":m==="en proceso"||m==="produccion"||m==="producci\xF3n"?"\u{1F504}":m==="pendiente"?"\u23F3":m==="listo"?"\u{1F4E6}":"\u{1F535}"};return`<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${s.map(c=>{const m=typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(c):Math.max(0,Number(c.total||0)-Number(c.anticipo||0)),l=m>0?`<span style="color:#dc2626">$${m.toFixed(2)}</span>`:'<span style="color:#15803d">Pagado \u2713</span>';return`<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(c.folio||"\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${c.fechaPedido||"\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(c.total||0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${l}</td>
            <td style="padding:6px 8px;font-size:.75rem">${r(c.status)} ${_esc(c.status||"\u2014")}</td>
        </tr>`}).join("")}</tbody>
    </table>`}window.renderHistorialClienteModal=renderHistorialClienteModal,window._clienteFiltroTag="";function _clientesFiltrados(){const n=window._clienteFiltroTag||"";return n?clients.filter(o=>_tagActividad(o).clase===n):[...clients]}function _renderFiltrosActividad(){const n=document.getElementById("searchClient")?.parentElement?.parentElement;if(!n||document.getElementById("_mkFiltrosActividad"))return;const o=[{tag:"",label:"Todos",bg:"#f3f4f6",color:"#374151"},{tag:"activo",label:"Activos",bg:"#dcfce7",color:"#15803d"},{tag:"en-riesgo",label:"En riesgo",bg:"#fed7aa",color:"#c2410c"},{tag:"inactivo",label:"Inactivos",bg:"#fee2e2",color:"#dc2626"},{tag:"nuevo",label:"Nuevos",bg:"#dbeafe",color:"#1e40af"}],t=document.createElement("div");t.id="_mkFiltrosActividad",t.style.cssText="display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;",o.forEach(a=>{const s=document.createElement("button");s.dataset.filtroTag=a.tag,s.textContent=a.label;const r=(window._clienteFiltroTag||"")===a.tag;s.style.cssText=`padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${r?a.color:"transparent"};background:${a.bg};color:${a.color};transition:border .15s;`,s.onclick=()=>{window._clienteFiltroTag=a.tag,t.querySelectorAll("button").forEach(e=>{const c=o.find(l=>l.tag===e.dataset.filtroTag);if(!c)return;const m=e.dataset.filtroTag===a.tag;e.style.border=`2px solid ${m?c.color:"transparent"}`}),renderClientsTable()},t.appendChild(s)}),n.parentElement.insertBefore(t,n)}function renderClientsTable(){const n=window.clients||[],o=n.length+"_"+n.reduce((i,d)=>i+Number(d.totalPurchases||0),0).toFixed(0),t=document.getElementById("clientsTable");if(t&&t._lastHash===o){typeof renderRFMPanel=="function"&&renderRFMPanel();return}t&&(t._lastHash=o),_renderFiltrosActividad(),typeof renderRFMPanel=="function"&&renderRFMPanel();const a=document.getElementById("clientsTable"),s=_clientesFiltrados();if(clients.length===0){a.innerHTML=`<tr><td colspan="99" class="text-center py-14">
  <div class="text-5xl mb-3">\u{1F465}</div>
  <p class="text-lg font-medium text-gray-500">Sin clientes registrados</p>
  <button onclick="document.getElementById('addClientBtn')?.click()"
          class="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
    + Agregar primer cliente
  </button>
</td></tr>`,updateClientStats();return}if(s.length===0){a.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>',updateClientStats();return}const r=a.closest("table")?.querySelector("thead tr");if(r){const i=[{key:"name",label:"Cliente"},{key:null,label:"Contacto"},{key:null,label:"Email"},{key:"totalPurchases",label:"Total Compras"},{key:"lastPurchase",label:"\xDAltima Compra"},{key:null,label:"Tipo"},{key:null,label:"Acciones"}];r.innerHTML=i.map(d=>{const f=d.key==="totalPurchases"?"text-right":"text-left";return d.key?`<th class="px-6 py-3 ${f} text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(d.key)}')">${d.label} ${_sortArrow(d.key)}</th>`:`<th class="px-6 py-3 ${f} text-xs font-semibold text-gray-500 uppercase tracking-wider">${d.label}</th>`}).join("")}function e(i){const d=(i||"").trim().toLowerCase().charCodeAt(0);return d>=97&&d<=101?"mk-avatar-gold":d>=102&&d<=108?"mk-avatar-lila":d>=109&&d<=114?"mk-avatar-peach":"mk-avatar-green"}function c(i){const d=(i||"").trim().split(" ");return((d[0]||"")[0]||"")+(d[1]?d[1][0]:"")}const m=_clientesSortCol,l=_clientesSortDir==="asc"?1:-1,p=[...s].sort((i,d)=>{let f,g;return m==="totalPurchases"?(f=Number(i.totalPurchases||0),g=Number(d.totalPurchases||0),l*(f-g)):m==="lastPurchase"?(f=i.lastPurchase||"",g=d.lastPurchase||"",l*f.localeCompare(g)):(f=(i.name||"").toLowerCase(),g=(d.name||"").toLowerCase(),l*f.localeCompare(g))}),u={};(window.clientes||clients||[]).forEach(i=>{const d=i.id||i.nombre||i.name||"";u[d]=_calcClienteStats(i.id||i.nombre||i.name||"")}),a.innerHTML=p.map((i,d)=>{const f=i.isVIP||i.type==="vip",g=c(i.name||"?").toUpperCase()||(i.name||"?").trim().charAt(0).toUpperCase(),y=e(i.name),h=(window.notas||[]).filter(x=>x.cliente&&x.cliente.toLowerCase()===(i.name||"").toLowerCase()).sort((x,C)=>(C.fechaCreacion||C.fecha||"").localeCompare(x.fechaCreacion||x.fecha||"")),$=h.length>0?`<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(h[0].texto)}">\u{1F4DD} ${_esc((h[0].texto||"").substring(0,40))}${(h[0].texto||"").length>40?"\u2026":""}</div>`:"",k=i.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(i.notas)}">\u{1F4DD} ${_esc(i.notas.substring(0,60))}${i.notas.length>60?"\u2026":""}</div>`:"",w=i.id||i.nombre||i.name||"",b=u[w]||_calcClienteStats(w),E=`<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${b.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${b.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${b.ticketPromedio.toFixed(0)}</span>
                    ${b.ultimoPedido?`<span title="\xDAltimo pedido">\u{1F550} ${b.ultimoPedido}</span>`:""}
                </div>`,v=_tagActividad(i),_=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${v.color}">${v.label}</span>`,S=i.phone?`<button onclick="_abrirWhatsApp('${_escAttr(i.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>`:"";return`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${y}">
                                ${g}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(i.name)}</span>
                                    ${_}
                                </div>
                                ${$}
                                ${k}
                                ${E}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${i.phone?`<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(i.phone).replace(/\D/g,"")}" target="_blank" rel="noopener noreferrer" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(i.phone)}</a>
        ${S}
    </div>`:""}
${i.facebook?`<a href="${_esc(i.facebook).startsWith("http")?_esc(i.facebook):"https://"+_esc(i.facebook)}" target="_blank" rel="noopener noreferrer" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(i.facebook)}</a>`:""}
${!i.phone&&!i.facebook?"\u2014":""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${i.email?_esc(i.email):"\u2014"}</td>
                    <td class="px-6 py-4 text-right text-gray-800 font-semibold">$${(i.totalPurchases||0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${i.lastPurchase||"\u2014"}</td>
                    <td class="px-6 py-4">
                        ${f?'<span class="badge-vip">VIP</span>':'<span class="badge-success">Regular</span>'}
                    </td>
                    <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(i.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(i.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(i.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                </tr>
            `}).join(""),updateClientStats()}function updateClientStats(){document.getElementById("totalClients").textContent=clients.length,document.getElementById("vipClients").textContent=clients.filter(o=>o.isVIP||o.type==="vip").length;const n=clients.reduce((o,t)=>o+(Number(t.totalPurchases)||0),0);document.getElementById("totalPurchases").textContent=`$${n.toFixed(2)}`}let selectedClientType="regular";function selectClientType(n){selectedClientType=n,document.getElementById("clientType").value=n;const o=document.getElementById("btnClientRegular"),t=document.getElementById("btnClientVip");n==="vip"?(t.style.borderColor="#C5A572",t.style.background="#FFF9F0",t.style.color="#C5A572",o.style.borderColor="#E5E7EB",o.style.background="white",o.style.color="#6B7280"):(o.style.borderColor="#C5A572",o.style.background="#FFF9F0",o.style.color="#C5A572",t.style.borderColor="#E5E7EB",t.style.background="white",t.style.color="#6B7280")}function openAddClientModal(){document.getElementById("clientModalTitle").textContent="Nuevo Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Guardar Cliente',document.getElementById("editClientId").value="",document.getElementById("addClientForm").reset(),selectClientType("regular"),openModal("addClientModal")}function closeAddClientModal(){closeModal("addClientModal"),document.getElementById("addClientForm").reset()}document.getElementById("addClientForm").addEventListener("submit",function(n){n.preventDefault();const o=document.getElementById("editClientId").value,t=document.getElementById("clientName").value.trim(),a=document.getElementById("clientPhone").value.trim(),s=document.getElementById("clientFacebook").value.trim(),r=document.getElementById("clientEmail").value.trim();if(!_validEmail(r)){manekiToastExport("Email inv\xE1lido","warn");return}const e=document.getElementById("clientType").value||"regular",c=(document.getElementById("clientNotas")?.value||"").trim();if(o){const l=clients.find(p=>String(p.id)===String(o));l&&(l.name=t,l.phone=a,l.facebook=s,l.email=r,l.type=e,l.isVIP=e==="vip",l.notas=c)}else{let p=function(f){return String(f||"").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ")};var m=p;const l={id:mkId(),name:t,phone:a,facebook:s,email:r,type:e,isVIP:e==="vip",notas:c,totalPurchases:0,lastPurchase:null},u=p(t),i=String(a||"").replace(/\D/g,"").slice(-8),d=clients.find(f=>{const g=p(f.name||"")===u&&u!=="",y=i.length>=6&&String(f.phone||"").replace(/\D/g,"").slice(-8)===i;return g||y});d&&manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${d.name}". Verifica si es el mismo.`,"warn"),clients.push(l)}saveClients(),closeAddClientModal(),renderClientsTable(),updateDashboard()});function editClient(n){const o=clients.find(t=>String(t.id)===String(n));o&&(document.getElementById("clientModalTitle").textContent="Editar Cliente",document.getElementById("clientSubmitBtn").innerHTML='<i class="fas fa-save mr-2"></i>Actualizar Cliente',document.getElementById("editClientId").value=n,document.getElementById("clientName").value=o.name||"",document.getElementById("clientPhone").value=o.phone||"",document.getElementById("clientFacebook").value=o.facebook||"",document.getElementById("clientEmail").value=o.email||"",document.getElementById("clientNotas")&&(document.getElementById("clientNotas").value=o.notas||""),selectClientType(o.type||"regular"),openModal("addClientModal"))}function deleteClient(n){const o=clients.find(c=>String(c.id)===String(n)),t=o?o.name:"este cliente",s=(window.pedidos||[]).filter(c=>String(c.clienteId||"")===String(n)||String(c.cliente||"").toLowerCase()===String(t).toLowerCase()).filter(c=>c.status!=="finalizado"&&c.status!=="cancelado"&&c.status!=="entregado"),r=s.length>0?`Este cliente tiene ${s.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

Se eliminar\xE1 permanentemente "${_esc(t)}". Esta acci\xF3n no se puede deshacer.`:`Se eliminar\xE1 permanentemente "${_esc(t)}". Esta acci\xF3n no se puede deshacer.`,e=s.length>0?"\u26A0\uFE0F Eliminar cliente con pedidos":"\xBFEliminar cliente?";showConfirm(r,e).then(c=>{if(!c)return;const m=String(n);clients=clients.filter(l=>String(l.id)!==m),saveClients(),typeof window.deleteClientFromDB=="function"&&window.deleteClientFromDB(m),renderClientsTable(),typeof updateDashboard=="function"&&updateDashboard()})}function setupClientSearch(){document.getElementById("searchClient").addEventListener("input",function(n){clearTimeout(window._clientSearchT),window._clientSearchT=setTimeout(()=>{const o=e=>String(e||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(),t=o(n.target.value||""),s=_clientesFiltrados().filter(e=>o(e.name).includes(t)||o(e.email||"").includes(t)||(e.phone||e.telefono||"").includes(t)),r=document.getElementById("clientsTable");if(s.length===0){r.innerHTML='<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>';return}r.innerHTML=s.map(e=>{const c=e.isVIP||e.type==="vip",m=_tagActividad(e),l=`<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${m.color}">${m.label}</span>`,p=e.notas?`<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(e.notas)}">\u{1F4DD} ${_esc(e.notas.substring(0,60))}${e.notas.length>60?"\u2026":""}</div>`:"",u=e.phone?`<button onclick="_abrirWhatsApp('${_escAttr(e.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>`:"";return`
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
                `}).join("")},180)})}const _MK_CLI_TAG_LABEL={activo:"Activos","en-riesgo":"En riesgo",inactivo:"Inactivos",nuevo:"Nuevos"},_mkCliNorm=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();window._mkCliClearSearch=function(){const n=document.getElementById("searchClient");n&&(n.value="",n.dispatchEvent(new Event("input")))},window._mkCliClearTag=function(){window._clienteFiltroTag="",document.querySelectorAll("#_mkFiltrosActividad button").forEach(n=>{n.style.border="2px solid transparent"}),typeof window.renderClientsTable=="function"&&window.renderClientsTable()};function _mkCliRenderInfo(){const n=document.getElementById("_mkFiltrosActividad")||document.getElementById("searchClient")?.closest("div");if(!n||!n.parentElement)return;let o=document.getElementById("mkCliFilterInfo");o||(o=document.createElement("div"),o.id="mkCliFilterInfo",o.style.cssText="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 24px 0;",n.parentElement.insertBefore(o,n.nextSibling));const t=window.clients||[],a=t.length,s=(document.getElementById("searchClient")?.value||"").trim(),r=window._clienteFiltroTag||"";let e=t;if(r&&typeof window._tagActividad=="function"&&(e=e.filter(l=>window._tagActividad(l).clase===r)),s){const l=_mkCliNorm(s);e=e.filter(p=>_mkCliNorm(p.name).includes(l)||_mkCliNorm(p.email||"").includes(l)||String(p.phone||p.telefono||"").includes(l))}const c=[];s&&c.push(`<span class="mk-filter-chip">Buscar: ${_esc(s)}<button data-tip="Quitar" onclick="_mkCliClearSearch()">\u2715</button></span>`),r&&c.push(`<span class="mk-filter-chip">Filtro: ${_esc(_MK_CLI_TAG_LABEL[r]||r)}<button data-tip="Quitar" onclick="_mkCliClearTag()">\u2715</button></span>`);let m=`<span class="mk-result-count">Mostrando <b>${e.length}</b> de ${a} cliente${a!==1?"s":""}</span>`;c.length&&(m+=`<div class="mk-filter-chips">${c.join("")}<button class="mk-filter-clear" onclick="_mkCliClearSearch();_mkCliClearTag();">Limpiar todo</button></div>`),o.innerHTML=m}window._mkCliRenderInfo=_mkCliRenderInfo,(function(){let o=null;const t=()=>{const a=document.getElementById("clientsTable");if(!a){setTimeout(t,800);return}new MutationObserver(()=>{clearTimeout(o),o=setTimeout(_mkCliRenderInfo,30)}).observe(a,{childList:!0}),_mkCliRenderInfo()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t):t()})();function abrirFusionarClientes(){if(!document.getElementById("fusionarClientesModal")){const s=document.createElement("div");s.id="fusionarClientesModal",s.className="fixed inset-0 z-50 hidden items-center justify-center",s.style.background="rgba(0,0,0,0.5)",s.innerHTML=`
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
        `,document.body.appendChild(s)}const n=(window.clients||[]).slice().sort((s,r)=>(s.name||"").localeCompare(r.name||"")),o=n.map(s=>`<option value="${_esc(String(s.id))}">${_esc(s.name)}</option>`).join(""),t=document.getElementById("fusionClientePrincipal"),a=document.getElementById("fusionClienteAFusionar");t&&(t.innerHTML=o),a&&(a.innerHTML=o),a&&n.length>1&&(a.selectedIndex=1),openModal("fusionarClientesModal")}function _ejecutarFusion(){const n=document.getElementById("fusionClientePrincipal"),o=document.getElementById("fusionClienteAFusionar");if(!n||!o)return;const t=n.value,a=o.value;if(t===a){typeof window.manekiToastExport=="function"&&window.manekiToastExport("Selecciona dos clientes diferentes","warn");return}const s=window.clients||[],r=s.find(l=>String(l.id)===String(t)),e=s.find(l=>String(l.id)===String(a));if(!r||!e)return;const c=window.showConfirm;(typeof c=="function"?c(`\xBFFusionar "${_esc(e.name)}" \u2192 "${_esc(r.name)}"?

Sus pedidos e historial se mover\xE1n al cliente principal. Esta acci\xF3n no se puede deshacer.`,"\u{1F500} Fusionar clientes"):Promise.resolve(window.confirm(`\xBFFusionar "${e.name}" en "${r.name}"?`))).then(l=>{if(!l)return;const p=(e.name||"").toLowerCase().trim();(window.pedidos||[]).forEach(u=>{((u.cliente||"").toLowerCase().trim()===p||String(u.clienteId)===String(a))&&(u.cliente=r.name,u.clienteId=r.id)}),(window.pedidosFinalizados||[]).forEach(u=>{(u.cliente||"").toLowerCase().trim()===p&&(u.cliente=r.name)}),(window.salesHistory||[]).forEach(u=>{(u.customer||"").toLowerCase().trim()===p&&(u.customer=r.name)}),!r.phone&&e.phone&&(r.phone=e.phone),!r.email&&e.email&&(r.email=e.email),!r.notas&&e.notas&&(r.notas=e.notas),window.clients=s.filter(u=>String(u.id)!==String(a)),typeof window.saveClients=="function"&&window.saveClients(),typeof window.savePedidos=="function"&&window.savePedidos(),typeof window.saveSalesHistory=="function"&&window.saveSalesHistory(),typeof window.deleteClientFromDB=="function"&&window.deleteClientFromDB(String(a)),closeModal("fusionarClientesModal"),typeof window.renderClientsTable=="function"&&window.renderClientsTable(),typeof window.manekiToastExport=="function"&&window.manekiToastExport(`\u2705 "${e.name}" fusionado con "${r.name}"`,"ok")})}window.abrirFusionarClientes=abrirFusionarClientes,window._ejecutarFusion=_ejecutarFusion,(function(){const o=()=>{if(document.getElementById("_mkBtnFusionarClientes"))return;const t=document.getElementById("addClientBtn");if(!t){setTimeout(o,800);return}const a=document.createElement("button");a.id="_mkBtnFusionarClientes",a.type="button",a.title="Fusionar clientes duplicados",a.textContent="\u{1F500} Fusionar duplicados",a.style.cssText="padding:6px 14px;border-radius:10px;font-size:.78rem;font-weight:600;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#374151;transition:border-color .15s;margin-left:8px;",a.addEventListener("mouseenter",()=>{a.style.borderColor="#C5A572",a.style.color="#C5A572"}),a.addEventListener("mouseleave",()=>{a.style.borderColor="#d1d5db",a.style.color="#374151"}),a.addEventListener("click",()=>abrirFusionarClientes()),t.insertAdjacentElement("afterend",a)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o):o()})();
//# sourceMappingURL=clientes.js.map
