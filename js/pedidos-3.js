"use strict";async function imprimirTicketPedido(i){const e=[...window.pedidosFinalizados||[],...window.pedidos||[]].find(m=>String(m.id)===String(i));if(!e)return;const o=window.open("","_blank","width=480,height=750,scrollbars=yes");if(!o){manekiToastExport("\u26A0\uFE0F El navegador bloque\xF3 la ventana de impresi\xF3n. Permite popups para este sitio.","warn");return}let t="";try{const m=new URL("logo.png",window.location.href).href,w=await(await fetch(m)).blob();t=await new Promise(y=>{const v=new FileReader;v.onload=()=>y(v.result),v.readAsDataURL(w)})}catch{}const d=Number(e.total||0),s=Number(e.anticipo||0),g=(e.pagos||[]).reduce((m,b)=>m+Number(b.monto||0),0),l=g>0?g:Number(e.anticipo||0),a=Math.max(0,Number(e.total||0)-l),p=(e.fechaFinalizado||e.fechaPedido||"").split("T")[0]||"\u2014",n=e.entrega||"\u2014",f=(e.productosInventario||[]).filter(m=>m.id!=="libre"),c=f.length>0?f.map(m=>{const b=Number(m.quantity||1),w=Number(m.price||0),y=b*w;let v="";if(m.variante){const h=m.variante.indexOf(":"),P=h!==-1?m.variante.slice(0,h).trim():"",E=h!==-1?m.variante.slice(h+1).trim():m.variante.trim();v=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;">
                    ${P?`<span style="background:#f3f4f6;color:#6b7280;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${_esc(P)}</span>`:""}
                    <span style="background:#fffbeb;color:#92400e;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${_esc(E)}</span>
                </div>`}const $=w>0?`$${w.toFixed(2)}`:'<span style="color:#d1d5db;">\u2014</span>',k=w>0?`$${y.toFixed(2)}`:'<span style="color:#d1d5db;">\u2014</span>';return`
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <div style="font-weight:600;color:#1f2937;font-size:13px;">${_esc(m.name||"\u2014")}</div>
                    ${v}
                </td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;font-size:13px;vertical-align:middle;">${b}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;color:#6b7280;font-size:13px;vertical-align:middle;">${$}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;color:#1f2937;font-size:13px;vertical-align:middle;">${k}</td>
            </tr>`}).join(""):`<tr><td colspan="4" style="padding:16px 12px;text-align:center;color:#9ca3af;font-style:italic;font-size:13px;">${_esc(e.concepto||"Pedido personalizado")}</td></tr>`,u=t?`<img src="${t}" style="height:72px;object-fit:contain;margin-bottom:8px;" alt="Bicho Capricho">`:'<div style="font-size:2rem;">\u{1F41B}</div>',r=e.notas?`
        <div style="margin:20px 0;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
            <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">\u{1F4DD} Notas</div>
            <div style="font-size:12px;color:#78350f;">${_esc(e.notas)}</div>
        </div>`:"",x=e.lugarEntrega?`
        <div style="margin-top:4px;font-size:11px;color:#9ca3af;">\u{1F4CD} ${_esc(e.lugarEntrega)}</div>`:"";o.document.write(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comprobante ${_esc(e.folio)} \u2014 Bicho Capricho</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #f8f5f0;
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 24px 16px;
  }
  .ticket {
    background: #fff;
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,.12);
    overflow: hidden;
  }
  /* Cabecera dorada */
  .header {
    background: linear-gradient(135deg, #1a0533 0%, #2d0a4e 100%);
    padding: 28px 24px 24px;
    text-align: center;
    position: relative;
  }
  .header::after {
    content: '';
    display: block;
    position: absolute;
    bottom: -12px; left: 0; right: 0;
    height: 24px;
    background: #fff;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 800;
    color: #FFDD85;
    letter-spacing: .04em;
    margin-top: 6px;
  }
  .brand-sub {
    font-size: 11px;
    color: rgba(255,221,133,.65);
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-top: 3px;
  }
  /* Info del pedido */
  .info-block {
    padding: 28px 24px 16px;
  }
  .folio-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg,#FFD166,#FFDD85);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    padding: 4px 12px;
    border-radius: 99px;
    letter-spacing: .05em;
    margin-bottom: 16px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .info-cell {
    background: #fafafa;
    border: 1px solid #f3f4f6;
    border-radius: 10px;
    padding: 10px 12px;
  }
  .info-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #9ca3af;
    margin-bottom: 3px;
  }
  .info-value {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
  }
  .info-cell.full { grid-column: 1 / -1; }
  /* Tabla de productos */
  .section-title {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: #9ca3af;
    padding: 0 24px 8px;
  }
  .divider {
    border: none;
    border-top: 1px solid #f3f4f6;
    margin: 0 24px;
  }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #9ca3af;
    padding: 8px 12px;
    background: #fafafa;
  }
  thead th:first-child { text-align: left; }
  thead th:not(:first-child) { text-align: right; }
  /* Totales */
  .totals {
    margin: 0 24px 20px;
    background: #fafafa;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    overflow: hidden;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
    color: #6b7280;
  }
  .total-row:last-child { border-bottom: none; }
  .total-row.grand {
    background: linear-gradient(135deg,#1a0533,#2d0a4e);
    color: #FFDD85;
    font-weight: 800;
    font-size: 15px;
    padding: 14px 16px;
  }
  .total-row.saldo-ok { color: #16a34a; font-weight: 700; }
  .total-row.saldo-pen { color: #dc2626; font-weight: 700; }
  /* Footer */
  .footer {
    text-align: center;
    padding: 16px 24px 24px;
    color: #9ca3af;
    font-size: 11px;
    line-height: 1.6;
  }
  .footer strong { color: #FFD166; }
  /* Acciones */
  .actions {
    display: flex;
    gap: 10px;
    padding: 0 24px 24px;
  }
  .btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity .15s;
  }
  .btn:hover { opacity: .88; }
  .btn-print {
    background: linear-gradient(135deg,#FFD166,#FFDD85);
    color: #fff;
  }
  .btn-close {
    background: #f3f4f6;
    color: #6b7280;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .ticket { box-shadow: none; border-radius: 0; max-width: 100%; }
    .actions { display: none; }
    .header::after { display: none; }
  }
</style>
</head><body>
<div class="ticket">

  <!-- CABECERA -->
  <div class="header">
    ${u}
    <div class="brand-name">BICHO CAPRICHO</div>
    <div class="brand-sub">Personalizaci\xF3n con amor</div>
  </div>

  <!-- INFO DEL PEDIDO -->
  <div class="info-block">
    <div class="folio-badge">\u2726 ${_esc(e.folio)}</div>
    <div class="info-grid">
      <div class="info-cell full">
        <div class="info-label">Cliente</div>
        <div class="info-value" style="font-size:15px;">${_esc(e.cliente||"\u2014")}</div>
        ${x}
      </div>
      <div class="info-cell">
        <div class="info-label">Fecha</div>
        <div class="info-value">${_esc(p)}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Entrega</div>
        <div class="info-value" style="color:${n&&n!=="\u2014"&&p&&p!=="\u2014"&&n<p?"#dc2626":"#1f2937"};">${_esc(n)}</div>
      </div>
      ${e.concepto?`
      <div class="info-cell full">
        <div class="info-label">Concepto</div>
        <div class="info-value" style="font-weight:500;font-size:12px;">${_esc(e.concepto||"")}</div>
      </div>`:""}
    </div>
  </div>

  <!-- PRODUCTOS -->
  <div class="section-title">Productos</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;padding:8px 12px;">Descripci\xF3n</th>
        <th>Cant</th>
        <th>P/U</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${c}</tbody>
  </table>

  <!-- SEPARADOR -->
  <div style="height:16px;"></div>

  <!-- TOTALES -->
  <div class="section-title">Resumen de pago</div>
  <div class="totals">
    <div class="total-row grand">
      <span>Total del pedido</span>
      <span>$${d.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Anticipo recibido</span>
      <span style="color:#16a34a;font-weight:700;">\u2212 $${s.toFixed(2)}</span>
    </div>
    <div class="total-row ${a<=0?"saldo-ok":"saldo-pen"}">
      <span>${a<=0?"\u2705 Pagado completo":"\u23F3 Saldo pendiente"}</span>
      <span>$${Math.max(0,a).toFixed(2)}</span>
    </div>
  </div>

  <!-- NOTAS -->
  ${r?`<div style="padding:0 24px;">${r}</div>`:""}

  <!-- FOOTER -->
  <div class="footer">
    <div style="font-size:18px;margin-bottom:6px;">\u{1F41B}</div>
    <div>\xA1Gracias por tu pedido!</div>
    <div style="margin-top:4px;"><strong>manekistore.com.mx</strong></div>
  </div>

  <!-- BOTONES -->
  <div class="actions">
    <button class="btn btn-print" onclick="window.print()">\u{1F5A8}\uFE0F Imprimir / Guardar PDF</button>
    <button class="btn btn-close" onclick="window.close()">\u2715 Cerrar</button>
  </div>

</div>
</body></html>`),o.document.close()}window.imprimirTicketPedido=imprimirTicketPedido,window.openPedidoModal=openPedidoModal,window.closePedidoModal=closePedidoModal,window.openPedidoStatusModal=openPedidoStatusModal,window.closePedidoStatusModal=closePedidoStatusModal,window.setPedidoStatus=setPedidoStatus;async function duplicarPedido(i){const e=(window.pedidos||[]).find(s=>String(s.id)===String(i))||(window.pedidosFinalizados||[]).find(s=>String(s.id)===String(i));if(!e)return;const o=mkId(),t=_fechaHoy(),d={...e,id:o,folio:await generarFolioPedido(),status:"confirmado",anticipo:0,resta:e.total||0,pagos:[],fechaCreacion:new Date().toISOString(),fechaUltimoEstado:new Date().toISOString(),fechaPedido:t,entrega:"",productosInventario:JSON.parse(JSON.stringify(e.productosInventario||[])),empaques:e.empaques?e.empaques.map(s=>({...s})):[],empaquesDescontados:!1,inventarioDescontado:!1,_inventarioYaFinalizado:!1};delete d.fechaFinalizado,delete d.fechaCancelado,d.referenciasUrls=[],d.referenciasPaths=[],delete d.referenciaUrl,delete d.referenciaPath,window.pedidos||(window.pedidos=[]),window.pedidos.push(d),savePedidos(),renderPedidosTable(),updatePedidosStats(),manekiToastExport(`\u2705 Pedido duplicado: ${d.folio} \u2014 recuerda ajustar la fecha de entrega.`,"ok"),setTimeout(()=>{typeof openPedidoModal=="function"&&openPedidoModal(d.id)},400)}window.duplicarPedido=duplicarPedido;async function exportarPedidoPDF(i){const e=[...window.pedidosFinalizados||[],...window.pedidos||[]].find(r=>String(r.id)===String(i));if(!e){manekiToastExport("Pedido no encontrado","warn");return}if(typeof html2pdf>"u"){manekiToastExport("\u23F3 Cargando generador de PDF...","info");try{await new Promise((r,x)=>{const m=document.createElement("script");m.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",m.onload=r,m.onerror=x,document.head.appendChild(m)})}catch{manekiToastExport("\u274C No se pudo cargar el generador PDF","err");return}}let o="";try{const x=await(await fetch(new URL("logo.png",window.location.href).href)).blob();o=await new Promise(m=>{const b=new FileReader;b.onload=()=>m(b.result),b.readAsDataURL(x)})}catch{}const t=Number(e.total||0),d=(e.pagos||[]).reduce((r,x)=>r+Number(x.monto||0),0),s=d>0?d:Number(e.anticipo||0),g=Math.max(0,t-s),l=(e.productosInventario||[]).filter(r=>r.id!=="libre"),a=window.storeConfig?.name||"Bicho Capricho",p=window.storeConfig?.phone||"",n=_esc,f=l.length>0?l.map(r=>{const x=Number(r.quantity||1),m=Number(r.price||0);return`<tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${n(r.name||"\u2014")}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;">${x}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;">$${m.toFixed(2)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;font-size:13px;">$${(x*m).toFixed(2)}</td>
            </tr>`}).join(""):`<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af;font-style:italic;">${n(e.concepto||"Pedido personalizado")}</td></tr>`,c=(e.pagos||[]).length>0?`<div style="margin-top:16px;"><h4 style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Historial de pagos</h4>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
            ${(e.pagos||[]).map(r=>`<tr><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${r.fecha||"\u2014"}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${r.tipo||"abono"}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;color:#16a34a;">$${Number(r.monto||0).toFixed(2)}</td></tr>`).join("")}
            </table></div>`:"",u=document.createElement("div");u.style.cssText="width:480px;font-family:Segoe UI,system-ui,sans-serif;background:#fff;",u.innerHTML=`
        <div style="background:linear-gradient(135deg,#1a0533,#2d0a4e);padding:28px 24px;text-align:center;color:white;border-radius:12px 12px 0 0;">
            ${o?`<img src="${o}" alt="${n(a)}" style="height:52px;margin-bottom:8px;">`:""}
            <div style="font-size:20px;font-weight:800;color:#FFDD85;">${n(a)}</div>
            ${p?`<div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:4px;">${n(p)}</div>`:""}
        </div>
        <div style="padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div><span style="font-size:18px;font-weight:800;color:#FFD166;">${n(e.folio||"")}</span></div>
                <div style="text-align:right;">
                    <div style="font-size:11px;color:#9ca3af;">Fecha: ${n(e.fechaPedido||"\u2014")}</div>
                    <div style="font-size:11px;color:#9ca3af;">Entrega: ${n(e.entrega||"\u2014")}</div>
                </div>
            </div>
            <div style="background:#faf9f7;border-radius:10px;padding:14px;margin-bottom:20px;">
                <div style="font-size:14px;font-weight:700;color:#1f2937;">${n(e.cliente||"\u2014")}</div>
                ${e.telefono?`<div style="font-size:12px;color:#6b7280;margin-top:2px;">\u{1F4F1} ${n(e.telefono)}</div>`:""}
                ${e.lugarEntrega?`<div style="font-size:12px;color:#9669c4;margin-top:2px;">\u{1F4CD} ${n(e.lugarEntrega)}</div>`:""}
            </div>
            ${e.concepto?`<div style="font-size:12px;color:#6b7280;margin-bottom:12px;"><strong>Concepto:</strong> ${n(e.concepto)}</div>`:""}
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#f9fafb;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Producto</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;">Cant</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;">Precio</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;">Subtotal</th>
                </tr></thead>
                <tbody>${f}</tbody>
            </table>
            <div style="margin-top:16px;padding:14px;background:#faf9f7;border-radius:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;color:#374151;">Total</span><span style="font-size:16px;font-weight:900;color:#1f2937;">$${t.toFixed(2)}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:#16a34a;">Pagado</span><span style="font-size:13px;font-weight:700;color:#16a34a;">$${s.toFixed(2)}</span></div>
                ${g>0?`<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:2px dashed #fde68a;"><span style="font-size:13px;font-weight:700;color:#dc2626;">Saldo pendiente</span><span style="font-size:15px;font-weight:900;color:#dc2626;">$${g.toFixed(2)}</span></div>`:'<div style="text-align:center;padding-top:6px;color:#16a34a;font-weight:700;font-size:13px;">\u2705 LIQUIDADO</div>'}
            </div>
            ${c}
            ${e.notas?`<div style="margin-top:16px;padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#78350f;"><strong>\u{1F4DD} Notas:</strong> ${n(e.notas)}</div>`:""}
            <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;">
                <p style="font-size:10px;color:#9ca3af;">Documento generado el ${new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</p>
                <p style="font-size:10px;color:#FFD166;font-weight:600;margin-top:4px;">\xA1Gracias por tu preferencia! \u{1F41B}</p>
            </div>
        </div>`,document.body.appendChild(u);try{await html2pdf().set({margin:0,filename:`${e.folio||"pedido"}_${n(e.cliente||"").replace(/\s+/g,"_")}.pdf`,image:{type:"jpeg",quality:.95},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:[120,280],orientation:"portrait"}}).from(u).save(),manekiToastExport("\u{1F4C4} PDF descargado","ok")}catch(r){console.error("PDF error:",r),manekiToastExport("\u274C Error al generar PDF","err")}u.remove()}window.exportarPedidoPDF=exportarPedidoPDF,window.openAbonoPedido=openAbonoPedido,window.cerrarAbonoPedido=cerrarAbonoPedido,window.confirmarAbonoPedido=confirmarAbonoPedido,window.selectAbonoPedidoMethod=selectAbonoPedidoMethod,window.eliminarPedido=eliminarPedido,window.renderPedidosTable=renderPedidosTable,window.renderKanbanBoard=renderKanbanBoard,window.renderTablaPedidos=renderTablaPedidos,window.updatePedidosStats=updatePedidosStats,window.renderHistorialPedidos=renderHistorialPedidos,window.kanbanCardHTML=kanbanCardHTML,window.kanbanDragStart=kanbanDragStart,window.kanbanDragEnd=kanbanDragEnd,window.kanbanDragOver=kanbanDragOver,window.kanbanDragLeave=kanbanDragLeave,window.kanbanDrop=kanbanDrop,window.setVistaPedidos=setVistaPedidos,window.filterPedidos=filterPedidos,window.toggleKanbanCompacto=toggleKanbanCompacto,window.generarFolioPedido=generarFolioPedido,window.openCancelPedidoModal=openCancelPedidoModal,window.closeCancelPedidoModal=closeCancelPedidoModal,window.confirmarCancelPedido=confirmarCancelPedido;function filtrarProductosPedido(){const i=(document.getElementById("pedidoBuscadorProducto")?.value||"").toLowerCase().trim(),e=document.getElementById("pedidoProductoGrid");if(!e)return;const o=(window.products||[]).filter(t=>(!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack"||t.tipo==="producto_variable")&&(!i||(t.name||"").toLowerCase().includes(i)||(t.sku||"").toLowerCase().includes(i)));if(!i&&o.length===0){e.classList.add("hidden");return}if(e.classList.remove("hidden"),o.length===0){e.innerHTML='<p class="text-sm text-gray-400 text-center py-2">No se encontraron productos</p>';return}e.innerHTML=o.map(t=>{const d=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">`:`<span class="text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0">${t.image||"\u{1F4E6}"}</span>`,s=t.tipo==="materia_prima",g=t.tipo==="servicio",l=t.tipo==="producto_variable",a=l?(()=>{const c=(t.tablaPreciosVariable||[]).slice().sort((u,r)=>u.cantidadMin-r.cantidadMin);return c.length?c.map(u=>`${u.cantidadMin}=$${Number(u.precio).toFixed(0)}`).join(" / "):"Precio variable"})():t.price?`$${Number(t.price).toFixed(2)}`:t.cost?`Costo: $${Number(t.cost).toFixed(2)}`:"",p=g?'<span style="font-size:.65rem;background:#f6ecff;color:#7d4fa3;padding:1px 6px;border-radius:99px;font-weight:700;">\u2699\uFE0F Serv</span>':s?'<span style="font-size:.65rem;background:#f6ecff;color:#9669c4;padding:1px 6px;border-radius:99px;font-weight:700;">MP</span>':l?'<span style="font-size:.65rem;background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:99px;font-weight:700;">\u{1F3AF} Var</span>':'<span style="font-size:.65rem;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;font-weight:700;">PT</span>',f=_variantesPedido(t).length>0?`<span style="font-size:.65rem;color:#6366f1;">\u{1F3A8} ${_variantesPedido(t).length} variantes</span>`:"";return`
            <div onclick="seleccionarProductoPedido('${t.id}')"
                class="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                ${d}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1 flex-wrap">
                        <span class="font-semibold text-sm text-gray-800 truncate">${_esc(t.name||"")}</span>
                        ${p}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-amber-700">${a}</span>
                        ${f}
                    </div>
                </div>
            </div>`}).join("")}window.filtrarProductosPedido=filtrarProductosPedido;function _variantesPedido(i){if(!i)return[];if(Array.isArray(i.variants)&&i.variants.length>0)return i.variants;if(Array.isArray(i.mpComponentes)&&i.mpComponentes.length>0)for(const e of i.mpComponentes){const o=(window.products||[]).find(t=>String(t.id)===String(e.id));if(o&&Array.isArray(o.variants)&&o.variants.length>0)return o.variants}return[]}window._variantesPedido=_variantesPedido;function seleccionarProductoPedido(i){const e=(window.products||[]).find(n=>String(n.id)===String(i));if(!e)return;document.getElementById("pedidoProductoSelect").value=i,document.getElementById("pedidoProductoGrid").classList.add("hidden"),document.getElementById("pedidoBuscadorProducto").value="";const o=document.getElementById("pedidoProductoSelRow");o&&o.classList.remove("hidden");const t=document.getElementById("pedidoProductoSelImg");t&&(e.imageUrl?(t.src=e.imageUrl,t.style.display=""):t.style.display="none");const d=document.getElementById("pedidoProductoSelNombre");d&&(d.textContent=e.name);const s=document.getElementById("pedidoProductoSelPrecio");if(s)if(e.tipo==="producto_variable"){const n=(e.tablaPreciosVariable||[]).slice().sort((f,c)=>f.cantidadMin-c.cantidadMin);s.textContent=n.length?n.map(f=>`${f.cantidadMin} pzas=$${Number(f.precio).toFixed(0)}`).join(" \xB7 "):"Precio variable"}else{const n=e.tipo==="materia_prima";s.textContent=e.price?`$${Number(e.price).toFixed(2)}`:n&&e.cost?`Costo: $${Number(e.cost).toFixed(2)}`:""}const g=document.getElementById("pedidoVarianteRow"),l=document.getElementById("pedidoVarianteSelect");if(g&&l){l._pvBound||(l.addEventListener("change",()=>_pvCantidadChange(document.getElementById("pedidoProductoCantidad")?.value)),l._pvBound=!0);const n=_variantesPedido(e);if(n.length>0){l.innerHTML=n.map(c=>{const u=c.qty!==void 0&&c.qty!==null?` (${c.qty} pzs)`:"",r=typeof _mkColorEmoji=="function"?_mkColorEmoji(c.type,c.value):c.value,x=Number(c.priceDelta)||0,m=c.type==="Talla/Color"?`${c.value} \xB7 ${c.qty||0} listas${x?` \xB7 +$${x.toFixed(2)}/pza`:""}`:`${c.type}: ${r}${u}`;return`<option value="${_esc(c.type)}:${_esc(c.value)}">${_esc(m)}</option>`}).join(""),g.classList.remove("hidden");const f=g.querySelector("label");f&&(f.textContent=e.tipo==="materia_prima"?"\u{1F3A8} Selecciona variante (Talla / Color):":e.tipo==="producto_variable"?"Talla y color:":"\u{1F3A8} Variante:")}else g.classList.add("hidden")}const a=document.getElementById("pedidoCosto");a&&e.price&&e.tipo!=="materia_prima"&&(a.value=Number(e.price).toFixed(2));const p=document.getElementById("pedidoProductoPrecio");if(p)if(e.tipo==="producto_variable"&&typeof pvGetPrecio=="function"){const n=parseInt(document.getElementById("pedidoProductoCantidad")?.value)||1;p.readOnly=!0,_pvCantidadChange(n)}else p.readOnly=!1,p.value=e.price?Number(e.price).toFixed(2):"",_pvOcultarHint();typeof _mostrarGaleriaPtEnPedido=="function"&&_mostrarGaleriaPtEnPedido(e),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.seleccionarProductoPedido=seleccionarProductoPedido;function limpiarSeleccionProductoPedido(){document.getElementById("pedidoProductoSelect").value="";const i=document.getElementById("pedidoProductoSelRow");i&&i.classList.add("hidden");const e=document.getElementById("pedidoVarianteRow");e&&e.classList.add("hidden");const o=document.getElementById("pedidoProductoPrecio");o&&(o.value="");const t=document.getElementById("pedidoProductoCantidad");t&&(t.value=1);const d=document.getElementById("pedidoPtGaleriaStrip");d&&(d.innerHTML=""),_pvOcultarHint()}window.limpiarSeleccionProductoPedido=limpiarSeleccionProductoPedido;function _pvMostrarHint(i,e,o=e){let t=document.getElementById("pedidoPvHint");if(!t){const c=document.getElementById("pedidoProductoSelRow");if(!c)return;t=document.createElement("div"),t.id="pedidoPvHint",t.style.cssText="font-size:.75rem;color:#0369a1;background:#e0f2fe;border-radius:8px;padding:5px 10px;margin-top:6px;",c.appendChild(t)}const d=(i.tablaPreciosVariable||[]).slice().sort((c,u)=>c.cantidadMin-u.cantidadMin);if(!d.length){t.style.display="none";return}let s=d[0];for(const c of d)if(e>=c.cantidadMin)s=c;else break;const g=document.getElementById("pedidoVarianteSelect")?.value,l=pvGetPrecio(i,e,g),a=l*o;t.style.display="";const p=typeof pvPlanMateriales=="function"?pvPlanMateriales(i,e,g,window.products||[]):[],n=p.filter(c=>c.faltante>0),f=p.length?n.length?" \xB7 Faltan: "+n.map(c=>`${c.faltante} de ${c.nombre}`).join(", "):" \xB7 Material disponible":" \xB7 Sin materiales configurados";t.textContent=`${g?.startsWith("Talla/Color:")?g.slice(12)+" \xB7 ":""}Rango ${s.cantidadMin}+ pzas \xB7 $${l.toFixed(2)} por pieza \xB7 Estas ${o} pzas: $${a.toFixed(2)}${f}`,t.classList.toggle("pv-stock-warning",n.length>0)}window._pvMostrarHint=_pvMostrarHint;function _pvOcultarHint(){const i=document.getElementById("pedidoPvHint");i&&(i.style.display="none")}window._pvOcultarHint=_pvOcultarHint;function _pvCantidadChange(i){const e=document.getElementById("pedidoProductoSelect")?.value;if(!e)return;const o=(window.products||[]).find(a=>String(a.id)===String(e));if(!o||o.tipo!=="producto_variable")return;const t=parseInt(typeof i=="object"?i?.value:i)||1,d=document.getElementById("pedidoVarianteSelect")?.value,s=(window.pedidoProductosSeleccionados||[]).filter(a=>String(a.id)===String(e)).reduce((a,p)=>a+(Number(p.quantity)||0),0),g=typeof pvGetPrecio=="function"?pvGetPrecio(o,t+s,d):0,l=document.getElementById("pedidoProductoPrecio");l&&(l.value=g.toFixed(2)),_pvMostrarHint(o,t+s,t)}window._pvCantidadChange=_pvCantidadChange;async function agregarProductoPedido(){const i=document.getElementById("pedidoProductoSelect")?.value;if(!i){manekiToastExport("\u26A0\uFE0F Selecciona un producto primero","warn");return}const e=(window.products||[]).find(n=>String(n.id)===String(i));if(!e)return;const o=parseInt(document.getElementById("pedidoProductoCantidad")?.value)||1,t=document.getElementById("pedidoProductoPrecio"),d=t&&t.value!==""?parseFloat(t.value):null,s=document.getElementById("pedidoVarianteSelect"),g=_variantesPedido(e).length>0,l=s&&g&&!document.getElementById("pedidoVarianteRow")?.classList.contains("hidden")?s.value:null,a=e.tipo==="producto_variable"&&typeof pvGetPrecio=="function"?pvGetPrecio(e,o,l):d!==null?d:Number(e.price)||0;if(g&&!l){manekiToastExport("\u26A0\uFE0F Este producto tiene variantes. Selecciona una.","warn");return}if(window.pedidoProductosSeleccionados=window.pedidoProductosSeleccionados||[],e.tipo==="producto_variable"){const n=window.pedidoProductosSeleccionados.filter(u=>String(u.id)===String(i)&&u.variante===l).reduce((u,r)=>u+(Number(r.quantity)||0),0),c=(typeof pvPlanMateriales=="function"?pvPlanMateriales(e,o+n,l,window.products||[]):[]).filter(u=>u.faltante>0);if(c.length){const u=c.map(r=>`${r.nombre}: faltan ${r.faltante} (hay ${r.disponible}, se necesitan ${r.necesario})`).join(`
`);if(!await showConfirm(`Falta material para ${e.name}${l?" "+l:""}:
${u}

\xBFAgregar al pedido y reponer despu\xE9s?`,"Material insuficiente"))return}}else{const n=typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0;n<o&&manekiToastExport(`\u26A0\uFE0F "${e.name||e.nombre}" tiene solo ${n} en stock`,"warn")}const p=window.pedidoProductosSeleccionados.find(n=>String(n.id)===String(i)&&n.variante===l);p?p.quantity=(p.quantity||1)+o:window.pedidoProductosSeleccionados.push({id:i,name:e.name,price:a,quantity:o,variante:l}),typeof pvRecalcularLineas=="function"&&pvRecalcularLineas(window.pedidoProductosSeleccionados,window.products||[]),renderPedidoProductosList(),limpiarSeleccionProductoPedido()}window.agregarProductoPedido=agregarProductoPedido;function renderPedidoProductosList(){const i=document.getElementById("pedidoProductosList");if(!i)return;i._pvBound||(i.addEventListener("change",t=>{const d=t.target;d?.dataset?.pedidoQty!==void 0&&editarCantidadPedidoProducto(Number(d.dataset.pedidoQty),d.value),d?.dataset?.pedidoPrice!==void 0&&editarPrecioPedidoProducto(Number(d.dataset.pedidoPrice),d.value)}),i._pvBound=!0);const e=window.pedidoProductosSeleccionados||[];if(!e.length){i.innerHTML="";return}const o=e.reduce((t,d)=>t+(parseFloat(d.price)||0)*(d.quantity||1),0);i.innerHTML=e.map((t,d)=>{const s=parseFloat(t.price)||0,g=s*(t.quantity||1);return`
        <div class="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-sm">
            <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-800 truncate">${_esc(t.name||"")}${t.variante?` <span class="text-xs text-purple-600 font-semibold">(${(()=>{const l=t.variante.indexOf(":");if(l===-1)return _esc(t.variante);const a=t.variante.slice(0,l).trim(),p=t.variante.slice(l+1).trim();return _esc(a)+": "+(typeof _mkColorDot=="function"?_mkColorDot(a,p):_esc(p))})()})</span>`:""}</div>
                <div class="flex items-center gap-1 mt-1">
                    <span class="text-xs text-gray-500">\xD7</span>
                    <input type="number" min="1" value="${t.quantity||1}" data-pedido-qty="${d}" aria-label="Cantidad de ${_esc(t.name||"producto")}"
                        class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 outline-none">
                    <span class="text-xs text-gray-500">a $</span>
                    <input type="number" step="0.01" min="0" value="${s.toFixed(2)}" data-pedido-price="${d}" aria-label="Precio por pieza de ${_esc(t.name||"producto")}"
                        ${(window.products||[]).find(l=>String(l.id)===String(t.id))?.tipo==="producto_variable"?'readonly title="Precio autom\xE1tico seg\xFAn cantidad, talla y color"':""}
                        class="w-20 px-2 py-0.5 border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 outline-none" style="background:#fffbeb">
                    <span class="text-xs text-gray-400">= <span class="font-semibold text-gray-700">$${g.toFixed(2)}</span></span>
                </div>
            </div>
            <button type="button" data-action="quitarProductoPedido" data-arg="${d}" aria-label="Quitar ${_esc(t.name||"producto")}" class="text-gray-400 hover:text-red-400 text-base flex-shrink-0">\u2715</button>
        </div>`}).join("")+`
        <div class="flex justify-end px-3 pt-1 pb-0.5 text-xs font-bold text-gray-700">
            Subtotal productos: <span class="ml-1 text-amber-700">$${o.toFixed(2)}</span>
        </div>`,typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.renderPedidoProductosList=renderPedidoProductosList;function poblarSelectEmpaquesPedido(){const i=document.getElementById("pedidoEmpaquesSelect");if(!i)return;const e=(window.products||[]).filter(o=>(o.tags||[]).some(t=>t.toLowerCase()==="empaques"||t.toLowerCase()==="empaque"));i.innerHTML='<option value="">\u2014 Seleccionar empaque \u2014</option>'+e.map(o=>{const t=typeof getStockEfectivo=="function"?getStockEfectivo(o):o.stock||0;return`<option value="${o.id}">${_esc(o.name||"")} (Stock: ${t})</option>`}).join("")}window.poblarSelectEmpaquesPedido=poblarSelectEmpaquesPedido;function agregarEmpaquePedido(){const i=document.getElementById("pedidoEmpaquesSelect"),e=document.getElementById("pedidoEmpaquesCantidad");if(!i||!i.value)return;const o=(window.products||[]).find(s=>String(s.id)===i.value);if(!o)return;const t=parseInt(e?.value)||1;window.pedidoEmpaquesSeleccionados||(window.pedidoEmpaquesSeleccionados=[]);const d=window.pedidoEmpaquesSeleccionados.find(s=>String(s.id)===String(o.id));d?d.quantity+=t:window.pedidoEmpaquesSeleccionados.push({id:o.id,name:o.name,quantity:t}),e&&(e.value=1),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.agregarEmpaquePedido=agregarEmpaquePedido;function renderPedidoEmpaquesList(){const i=document.getElementById("pedidoEmpaquesList");if(!i)return;const e=window.pedidoEmpaquesSeleccionados||[];if(!e.length){i.innerHTML="";return}i.innerHTML=e.map((o,t)=>{const d=(window.products||[]).find(l=>String(l.id)===String(o.id)),s=Number(d?.cost||0),g=(s*(o.quantity||1)).toFixed(2);return`
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-lg text-sm">
            <span class="flex-1 text-gray-700">\u{1F4E6} ${o.name}</span>
            <span class="text-xs text-gray-400">$${s.toFixed(2)}c/u = <span class="font-semibold text-gray-600">$${g}</span></span>
            <input type="number" min="1" value="${o.quantity}"
                onchange="editarCantidadEmpaquePedido(${t}, this.value)"
                class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs text-center outline-none">
            <button onclick="quitarEmpaquePedido(${t})" class="text-gray-400 hover:text-red-400 text-sm">\u2715</button>
        </div>`}).join("")}window.renderPedidoEmpaquesList=renderPedidoEmpaquesList;function quitarEmpaquePedido(i){(window.pedidoEmpaquesSeleccionados||[]).splice(i,1),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.quitarEmpaquePedido=quitarEmpaquePedido;function editarCantidadEmpaquePedido(i,e){const o=parseInt(e)||1;window.pedidoEmpaquesSeleccionados&&window.pedidoEmpaquesSeleccionados[i]!=null&&(window.pedidoEmpaquesSeleccionados[i].quantity=o),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.editarCantidadEmpaquePedido=editarCantidadEmpaquePedido;function quitarProductoPedido(i){(window.pedidoProductosSeleccionados||[]).splice(i,1),typeof pvRecalcularLineas=="function"&&pvRecalcularLineas(window.pedidoProductosSeleccionados||[],window.products||[]),renderPedidoProductosList()}window.quitarProductoPedido=quitarProductoPedido;function editarPrecioPedidoProducto(i,e){const o=window.pedidoProductosSeleccionados||[];o[i]!==void 0&&(o[i].price=parseFloat(e)||0,renderPedidoProductosList())}window.editarPrecioPedidoProducto=editarPrecioPedidoProducto;function editarCantidadPedidoProducto(i,e){const o=window.pedidoProductosSeleccionados||[];if(o[i]!==void 0){const t=parseInt(e)||1;o[i].quantity=t,typeof pvRecalcularLineas=="function"&&pvRecalcularLineas(o,window.products||[]),renderPedidoProductosList()}}window.editarCantidadPedidoProducto=editarCantidadPedidoProducto;function generarTicketPedido(i){const e=[...window.pedidos||[],...window.pedidosFinalizados||[]].find(n=>String(n.id)===String(i));if(!e)return;const o=window.storeConfig||{},t=n=>String(n||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;"),d=n=>n?new Date(n).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}):"\u2014",s=e.productosInventario||[],g=s.length>0?s.map(n=>"<tr><td>"+t(n.name||n.nombre||"\u2014")+'</td><td style="text-align:center">'+(n.quantity||n.cantidad||1)+'</td><td style="text-align:right">$'+Number(n.price||0).toFixed(2)+'</td><td style="text-align:right">$'+(Number(n.price||0)*(n.quantity||n.cantidad||1)).toFixed(2)+"</td></tr>").join(""):'<tr><td colspan="4" style="color:#6b7280;font-style:italic;">'+t(e.concepto||"Sin detalle")+"</td></tr>",l=o.logoMode==="image"&&o.logo?'<img src="'+o.logo+'" alt="'+t(o.name||"Logo")+'" style="width:60px;height:60px;object-fit:contain;border-radius:10px;">':t(o.emoji||"\u{1F41B}"),a='<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ticket '+t(e.folio||"")+'</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:"Helvetica Neue",Arial,sans-serif;padding:32px;max-width:480px;margin:auto;color:#1a1a1a;}.logo{text-align:center;font-size:2.5rem;margin-bottom:4px;}.tienda{text-align:center;font-size:1.3rem;font-weight:800;color:#1a0533;}.slogan{text-align:center;font-size:.8rem;color:#6b7280;margin-bottom:4px;}.contacto{text-align:center;font-size:.75rem;color:#9ca3af;margin-bottom:12px;}.folio-badge{background:#f5ede0;border:1.5px solid #FFD166;border-radius:8px;padding:6px 16px;text-align:center;font-weight:800;color:#92400e;font-size:.9rem;margin-bottom:16px;}.divider{border:none;border-top:1.5px dashed #e5e7eb;margin:12px 0;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}.info-item label{display:block;font-size:.7rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;}.info-item span{font-size:.85rem;font-weight:600;}table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.82rem;}th{background:#f9f5ef;padding:7px 10px;text-align:left;font-weight:700;font-size:.72rem;text-transform:uppercase;color:#92400e;}td{padding:6px 10px;border-bottom:1px solid #f3f4f6;}.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem;color:#374151;}.total-final{display:flex;justify-content:space-between;padding:10px 0;font-size:1.1rem;font-weight:800;border-top:2px solid #FFD166;color:#1a0533;margin-top:4px;}.saldo-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#dc2626;}.pagado-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#16a34a;}.notas{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:.8rem;color:#374151;}.footer{text-align:center;font-size:.75rem;color:#9ca3af;margin-top:16px;line-height:1.6;}@media print{body{padding:12px;}.no-print{display:none!important;}}</style></head><body><div class="logo">'+l+'</div><div class="tienda">'+t(o.name||"Bicho Capricho")+'</div><div class="slogan">'+t(o.slogan||"Regalos Personalizados")+'</div><div class="contacto">'+(o.phone?"\u{1F4F1} "+t(o.phone):"")+(o.phone&&o.facebook?" \xB7 ":"")+(o.facebook?"\u{1F4D8} "+t(o.facebook):"")+'</div><div class="folio-badge">\u{1F4CB} Pedido '+t(e.folio||"\u2014")+'</div><hr class="divider"><div class="info-grid"><div class="info-item"><label>Cliente</label><span>'+t(e.cliente||"\u2014")+'</span></div><div class="info-item"><label>Tel\xE9fono</label><span>'+t(e.telefono||e.whatsapp||"\u2014")+'</span></div><div class="info-item"><label>Fecha del pedido</label><span>'+d(e.fechaPedido)+'</span></div><div class="info-item"><label>Fecha de entrega</label><span>'+d(e.entrega)+"</span></div>"+(e.lugarEntrega?'<div class="info-item" style="grid-column:1/-1"><label>Lugar de entrega</label><span>'+t(e.lugarEntrega)+"</span></div>":"")+'</div><hr class="divider"><div style="font-size:.75rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Concepto</div><div style="font-size:.85rem;color:#374151;margin-bottom:12px;">'+t(e.concepto||"\u2014")+'</div><table><thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Total</th></tr></thead><tbody>'+g+'</tbody></table><hr class="divider"><div class="total-final"><span>Total del pedido</span><span>$'+Number(e.total||0).toFixed(2)+'</span></div><div class="total-row"><span>Anticipo recibido</span><span style="color:#16a34a;font-weight:700;">\u2014 $'+Number(e.anticipo||0).toFixed(2)+"</span></div>"+(calcSaldoPendiente(e)>0?'<div class="saldo-row"><span>\u{1F4B0} Saldo pendiente</span><span>$'+calcSaldoPendiente(e).toFixed(2)+"</span></div>":'<div class="pagado-row"><span>\u2705 Liquidado</span><span>$0.00</span></div>')+(e.notas?'<div class="notas"><b>Notas:</b> '+t(e.notas)+"</div>":"")+'<hr class="divider"><div class="footer">'+t(o.footer||"\xA1Gracias por tu compra!")+"<br>"+(o.facebook?t(o.facebook)+"<br>":"")+'<span style="color:#FFD166;font-weight:700;">\u2728 Bicho Capricho</span></div><div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:10px 16px;display:flex;gap:8px;"><button onclick="window.print()" style="flex:1;padding:10px;background:#FFD166;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.9rem;">\u{1F5A8}\uFE0F Imprimir / Guardar PDF</button><button onclick="window.close()" style="padding:10px 16px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;">\u2715 Cerrar</button></div><div style="height:64px;"></div></body></html>',p=window.open("","_blank","width=540,height=780");if(!p){manekiToastExport("Permite ventanas emergentes para ver el ticket","warn");return}p.document.write(a),p.document.close(),p.focus()}window.generarTicketPedido=generarTicketPedido;function _mostrarGaleriaPtEnPedido(i){let e=document.getElementById("pedidoPtGaleriaStrip");if(!e){e=document.createElement("div"),e.id="pedidoPtGaleriaStrip",e.style.cssText="margin-top:8px;";const d=document.getElementById("pedidoProductoSelRow");d&&d.appendChild(e),e.addEventListener("click",function(s){const g=s.target.closest("img[data-foto-url]");if(!g)return;const l=g.dataset.fotoUrl;l&&window.open(l,"_blank","noopener,noreferrer")})}const o=Array.isArray(i.imageUrls)&&i.imageUrls.length>0?i.imageUrls:i.imageUrl?[i.imageUrl]:[];if(o.length===0){e.innerHTML="";return}const t=_esc;e.innerHTML='<div style="font-size:.72rem;color:#92400e;font-weight:700;margin-bottom:6px;">\u{1F5BC}\uFE0F Fotos del producto ('+o.length+')</div><div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">'+o.map((d,s)=>'<img src="'+t(d)+'" alt="Foto producto '+(s+1)+'" data-foto-url="'+t(d)+'" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1.5px solid #e5e7eb;flex-shrink:0;cursor:pointer;" title="Ver foto completa">').join("")+"</div>"}window._mostrarGaleriaPtEnPedido=_mostrarGaleriaPtEnPedido;let _calMes=new Date().getMonth(),_calAnio=new Date().getFullYear();function renderCalendarioPedidos(){const i=document.getElementById("vistaCalendario");if(!i)return;const e=new Date;e.setHours(0,0,0,0);const o=window.pedidos||[],t={};o.forEach(n=>{if(!n.entrega)return;const f=n.entrega.substring(0,10);t[f]||(t[f]=[]),t[f].push(n)});const d=new Date(_calAnio,_calMes,1),s=new Date(_calAnio,_calMes+1,0),g=d.getDay(),l=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],a=["Dom","Lun","Mar","Mi\xE9","Jue","Vie","S\xE1b"];let p="";for(let n=0;n<g;n++)p+="<div></div>";for(let n=1;n<=s.getDate();n++){const f=_calAnio+"-"+String(_calMes+1).padStart(2,"0")+"-"+String(n).padStart(2,"0"),c=new Date(_calAnio,_calMes,n).getTime()===e.getTime(),u=t[f]||[];p+='<div style="min-height:80px;border:1px solid #f3f4f6;border-radius:10px;padding:6px;background:'+(c?"#fef9f0":"#fff")+";"+(c?"border-color:#FFD166;border-width:2px;":"")+';"><div style="font-size:.75rem;font-weight:'+(c?"800":"600")+";color:"+(c?"#92400e":"#374151")+';margin-bottom:3px;">'+n+(c?" \u{1F4CD}":"")+"</div>"+u.slice(0,3).map(r=>{const x=_esc;return`<div onclick="openPedidoModal('`+r.id+`')" style="font-size:.65rem;background:`+(calcSaldoPendiente(r)>0?"#fef2f2":"#f0fdf4")+";color:"+(calcSaldoPendiente(r)>0?"#991b1b":"#166534")+';border-radius:4px;padding:2px 5px;margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+x(r.cliente)+" \u2014 "+x(r.concepto)+'">'+x(r.folio)+" "+x(r.cliente)+"</div>"}).join("")+(u.length>3?'<div style="font-size:.6rem;color:#9ca3af;text-align:center;">+'+(u.length-3)+" m\xE1s</div>":"")+"</div>"}i.innerHTML='<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><button onclick="_calNavegar(-1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">\u2039</button><h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">'+l[_calMes]+" "+_calAnio+'</h3><button onclick="_calNavegar(1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">\u203A</button></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">'+a.map(n=>'<div style="text-align:center;font-size:.7rem;font-weight:700;color:#9ca3af;padding:4px 0;">'+n+"</div>").join("")+'</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">'+p+'</div><div style="display:flex;gap:12px;margin-top:12px;font-size:.72rem;color:#6b7280;"><span><span style="display:inline-block;width:10px;height:10px;background:#fef2f2;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #fca5a5;"></span>Con saldo pendiente</span><span><span style="display:inline-block;width:10px;height:10px;background:#f0fdf4;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #86efac;"></span>Pagado</span></div></div>'}window.renderCalendarioPedidos=renderCalendarioPedidos;function _calNavegar(i){_calMes+=i,_calMes>11&&(_calMes=0,_calAnio++),_calMes<0&&(_calMes=11,_calAnio--),renderCalendarioPedidos()}window._calNavegar=_calNavegar;function checkAlertasCobro(){const i=document.getElementById("alertaCobro"),e=document.getElementById("alertaCobroLista"),o=document.getElementById("alertaCobroSubtitulo");if(!i||!e)return;const t=new Date;t.setHours(0,0,0,0);const s=(window.pedidos||[]).filter(a=>{if(calcSaldoPendiente(a)<=0||!a.entrega)return!1;const n=new Date(a.entrega+"T00:00:00");return Math.round((n.getTime()-t.getTime())/864e5)<=5}).sort((a,p)=>{const n=new Date(a.entrega+"T00:00:00"),f=new Date(p.entrega+"T00:00:00");return n.getTime()-f.getTime()});if(s.length===0){i.classList.add("hidden");return}i.classList.remove("hidden");const g=s.filter(a=>Math.round((new Date(a.entrega+"T00:00:00").getTime()-t.getTime())/864e5)<0).length;o.textContent=s.length+" pedido"+(s.length>1?"s":"")+" con saldo pendiente"+(g>0?" \xB7 "+g+" vencido"+(g>1?"s":""):"");const l=_esc;e.innerHTML=s.map(a=>{const p=calcSaldoPendiente(a),n=new Date(a.entrega+"T00:00:00"),f=Math.round((n.getTime()-t.getTime())/864e5);let c="";f<0?c='<span style="background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u26D4 Vencido '+Math.abs(f)+"d</span>":f===0?c='<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F534} Hoy</span>':f===1?c='<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F7E0} Ma\xF1ana</span>':c='<span style="background:#fef9f0;color:#78350f;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F7E1} '+f+" d\xEDas</span>";const u=(a.telefono||"").replace(/\D/g,""),r=encodeURIComponent("Hola "+(a.cliente||"")+" \u{1F44B}, te recordamos que tu pedido *"+(a.folio||"")+"* "+(a.concepto?"("+a.concepto+") ":"")+"tiene un saldo pendiente de *$"+p.toFixed(2)+"* con fecha de entrega el *"+(a.entrega||"")+"*. \xA1Cualquier duda estamos para ayudarte! \u{1F431}"),x=u?"https://wa.me/52"+u+"?text="+r:"#";return'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;border-radius:10px;padding:8px 10px;border:1px solid #fecaca;"><div style="display:flex;align-items:center;gap:8px;min-width:0;">'+c+'<div style="min-width:0;"><p style="font-size:.78rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+l(a.folio)+" \xB7 "+l(a.cliente)+'</p><p style="font-size:.68rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+l(a.concepto||"")+'</p></div></div><div style="display:flex;align-items:center;gap:6px;flex-shrink:0;"><span style="font-size:.78rem;font-weight:800;color:#dc2626;">$'+p.toFixed(2)+"</span>"+(u?'<a href="'+x+'" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:3px;background:#25D366;color:#fff;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;text-decoration:none;">\u{1F4F2} Cobrar</a>':`<button onclick="openPedidoModal('`+a.id+`')" style="background:#e5e7eb;color:#374151;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;border:none;cursor:pointer;">Ver</button>`)+"</div></div>"}).join("")}window.checkAlertasCobro=checkAlertasCobro;function imprimirEtiquetaPedido(i){const e=(window.pedidos||[]).find(f=>f.id===i)||(window.pedidosFinalizados||[]).find(f=>f.id===i);if(!e)return;const o=Array.isArray(e.productosInventario)&&e.productosInventario.length>0?e.productosInventario.map(f=>{const c=f.quantity||f.cantidad||1,u=f.name||f.nombre||f.id||"\u2014",r=Number(f.price||f.precio||0);return c+"x "+u+(r>0?"  $"+r.toFixed(2):"")}).join(`
`):e.concepto||"\u2014",t=Number(e.total||0).toFixed(2),d=Number(e.anticipo||0).toFixed(2),s=calcSaldoPendiente(e).toFixed(2),l=_fechaHoy().split("-").reverse().join("/"),a=f=>String(f||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),p=`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Etiqueta `+a(e.folio||"")+'</title><style>@page{size:10cm 15cm;margin:0;}*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}body{width:10cm;min-height:15cm;padding:10px;background:#fff;}.hdr{border-bottom:2px solid #FFD166;padding-bottom:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;}.brand{font-size:13px;font-weight:900;color:#1a0533;}.folio{font-size:11px;font-weight:800;color:#FFD166;text-align:right;}.row{margin-bottom:6px;}.lbl{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;font-weight:700;}.val{font-size:10px;color:#1a0533;font-weight:600;}.val.big{font-size:13px;font-weight:900;}.prods{background:#faf7f2;border-radius:6px;padding:6px 8px;margin-bottom:6px;}.prods .val{font-size:9px;white-space:pre-line;}.tots{border-top:1.5px dashed #e5e7eb;padding-top:6px;margin-top:4px;}.trow{display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px;color:#374151;}.trow.main{font-size:11px;font-weight:800;color:#1a0533;}.trow.red{color:#dc2626;font-weight:800;}.footer{margin-top:10px;text-align:center;font-size:7.5px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;}.badge{display:inline-block;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700;}</style></head><body><div class="hdr"><div><div class="brand">\u{1F431} Bicho Capricho</div><div style="font-size:8px;color:#6b7280;">Regalos personalizados \xB7 Monterrey</div></div><div><div class="folio">'+a(e.folio||"")+'</div><div style="font-size:8px;color:#9ca3af;text-align:right;">Imp. '+l+'</div></div></div><div class="row"><div class="lbl">Cliente</div><div class="val big">'+a(e.cliente||"\u2014")+"</div>"+(e.telefono?'<div style="font-size:9px;color:#6b7280;">\u{1F4F1} '+a(e.telefono)+"</div>":"")+"</div>"+(e.entrega?'<div class="row"><div class="lbl">Fecha de entrega</div><div class="val big" style="color:#FFD166;">\u{1F4C5} '+a(e.entrega)+"</div></div>":"")+(e.lugarEntrega?'<div class="row"><div class="lbl">Lugar de entrega</div><div class="val">\u{1F4CD} '+a(e.lugarEntrega)+"</div></div>":"")+'<div class="prods"><div class="lbl" style="margin-bottom:3px;">Productos / Concepto</div><div class="val">'+a(o)+"</div></div>"+(e.notas?'<div class="row"><div class="lbl">Notas</div><div class="val" style="font-size:9px;color:#6b7280;">'+a(e.notas)+"</div></div>":"")+'<div class="tots"><div class="trow main"><span>Total</span><span>$'+t+'</span></div><div class="trow"><span>Anticipo recibido</span><span>$'+d+'</span></div><div class="trow red"><span>Saldo pendiente</span><span>$'+s+'</span></div></div><div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;"><span class="badge">'+a(e.status||"Pendiente")+'</span><span style="font-size:7.5px;color:#9ca3af;">Bicho Capricho POS</span></div><div class="footer">\xA1Gracias por tu pedido! \xB7 manekistore.com</div></body></html>',n=window.open("","_blank","width=420,height=620");if(!n){manekiToastExport("\u26A0\uFE0F Activa las ventanas emergentes para imprimir la etiqueta.","warn");return}n.document.write(p),n.document.close(),n.onload=function(){setTimeout(function(){n.focus(),n.print()},200)}}window.imprimirEtiquetaPedido=imprimirEtiquetaPedido;async function verificarEntregasProximas({silencioso:i=!1}={}){const e=window.storeConfig||{},o=e.telegramBotToken;if(!o){console.debug("Telegram: telegramBotToken no configurado, omitiendo recordatorio de entregas.");return}const t=[e.telegramChatId1,e.telegramChatId2].filter(Boolean),d=new Date;d.setHours(0,0,0,0);const s=new Date(d);s.setDate(s.getDate()+1);const g=new Date(d);g.setDate(g.getDate()+2);const l=window.pedidos||[],a=l.filter(r=>{if(!r.entrega||r.status==="cancelado")return!1;const x=new Date(r.entrega+"T00:00:00");return x>=d&&x<=g}),p=l.filter(r=>!r.entrega||r.status==="cancelado"?!1:new Date(r.entrega+"T00:00:00")<d);if(a.length+p.length===0){i||manekiToastExport("\u2705 Sin entregas pendientes en las pr\xF3ximas 48 hrs","ok");return}if(a.length&&manekiToastExport(`\u{1F514} ${a.length} entrega(s) en las pr\xF3ximas 48 hrs`,"warn"),p.length&&manekiToastExport(`\u{1F6A8} ${p.length} entrega(s) VENCIDA(S)`,"err"),!t.length)return;const f=r=>{if(!r)return"\u2014";const[x,m,b]=r.split("-");return`${b}/${m}/${x}`},c=[];p.length&&(c.push(`\u{1F6A8} *VENCIDOS (${p.length}):*`),p.forEach(r=>c.push(`  \u2022 [${r.folio}] ${r.cliente} \u2014 entrega: ${f(r.entrega)} \u2014 ${r.status||"confirmado"}`))),a.length&&(c.push(`\u{1F514} *Pr\xF3ximos 48 hrs (${a.length}):*`),a.forEach(r=>{const x=new Date(r.entrega+"T00:00:00"),m=x.getTime()===d.getTime(),b=x.getTime()===s.getTime(),w=m?"\u{1F534} HOY":b?"\u{1F7E1} Ma\xF1ana":"\u{1F7E2} Pasado ma\xF1ana";c.push(`  \u2022 [${r.folio}] ${r.cliente} \u2014 ${w} (${f(r.entrega)}) \u2014 ${r.status||"confirmado"}`)}));const u=`\u{1F4E6} *Recordatorio de entregas \u2014 Bicho Capricho*

${c.join(`
`)}`;for(const r of t)try{await fetch(`https://api.telegram.org/bot${o}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:r,text:u,parse_mode:"Markdown"})})}catch(x){console.warn("Telegram entrega reminder error:",x)}}window.verificarEntregasProximas=verificarEntregasProximas;function imprimirOrdenProduccion(){const i=["pago","produccion","salida"],e=(window.pedidos||[]).filter(a=>i.includes(a.status||""));if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin pedidos en producci\xF3n hoy","warn");return}const o=_fechaHoy(),t=_esc,d=a=>({pago:"\u{1F4B0} Pagado",produccion:"\u{1F527} Producci\xF3n",salida:"\u{1F69A} Sali\xF3"})[a]||a,s=e.map(a=>{const p=(a.productosInventario||[]).map(n=>`<li>${t(n.name||n.concepto||"\u2014")} \xD7 ${n.quantity||1}${n.variante?` <span style="color:#9669c4;">[${t(n.variante)}]</span>`:""}</li>`).join("");return`
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;break-inside:avoid;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                    <span style="font-weight:800;color:#FFD166;font-size:1.1rem;">${t(a.folio)}</span>
                    <span style="margin-left:10px;font-size:.8rem;background:#f3f4f6;padding:2px 8px;border-radius:99px;">${d(a.status)}</span>
                    ${a.ocasion?`<span style="margin-left:6px;font-size:.78rem;background:#f5f3ff;color:#9669c4;padding:2px 8px;border-radius:99px;">${t(a.ocasion)}</span>`:""}
                </div>
                <span style="font-size:.82rem;color:#6b7280;">Entrega: <b>${a.entrega||"\u2014"}</b></span>
            </div>
            <p style="font-weight:700;font-size:.95rem;margin-bottom:4px;">${t(a.cliente)}</p>
            <p style="color:#6b7280;font-size:.82rem;margin-bottom:8px;">${t(a.concepto||"")}</p>
            ${p?`<ul style="margin:0;padding-left:20px;font-size:.82rem;color:#374151;">${p}</ul>`:""}
            ${a.notas?`<p style="margin-top:8px;font-size:.78rem;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;">\u{1F4DD} ${t(a.notas)}</p>`:""}
        </div>`}).join(""),g=`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Orden de Producci\xF3n \u2014 ${o}</title>
<style>
  body{font-family:system-ui,sans-serif;color:#1f2937;padding:24px;max-width:860px;margin:0 auto;}
  h1{color:#FFD166;margin-bottom:4px;}
  @media print{body{padding:0;}}
</style>
</head><body>
<h1>\u{1F527} Orden de Producci\xF3n</h1>
<p style="color:#6b7280;margin-bottom:20px;">Fecha: <b>${o}</b> \xB7 ${e.length} pedido${e.length!==1?"s":""} en producci\xF3n</p>
${s}
<p style="margin-top:24px;font-size:.75rem;color:#d1d5db;text-align:center;">Bicho Capricho \xB7 generado ${new Date().toLocaleString("es-MX")}</p>
</body></html>`,l=window.open("","_blank");if(!l){typeof manekiToastExport=="function"&&manekiToastExport("Permite ventanas emergentes para imprimir","warn");return}l.document.write(g),l.document.close(),l.focus(),setTimeout(()=>l.print(),600)}window.imprimirOrdenProduccion=imprimirOrdenProduccion,(function(){setTimeout(()=>verificarEntregasProximas({silencioso:!0}),8e3),window._entregasCheckInterval&&clearInterval(window._entregasCheckInterval),window._entregasCheckInterval=setInterval(()=>verificarEntregasProximas({silencioso:!0}),720*60*1e3)})();
//# sourceMappingURL=pedidos-3.js.map
