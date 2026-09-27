"use strict";async function imprimirTicketPedido(i){const e=[...window.pedidosFinalizados||[],...window.pedidos||[]].find(m=>String(m.id)===String(i));if(!e)return;const o=window.open("","_blank","width=480,height=750,scrollbars=yes");if(!o){manekiToastExport("\u26A0\uFE0F El navegador bloque\xF3 la ventana de impresi\xF3n. Permite popups para este sitio.","warn");return}let t="";try{const m=new URL("logo.png",window.location.href).href,v=await(await fetch(m)).blob();t=await new Promise(h=>{const w=new FileReader;w.onload=()=>h(w.result),w.readAsDataURL(v)})}catch{}const r=Number(e.total||0),l=Number(e.anticipo||0),u=(e.pagos||[]).reduce((m,b)=>m+Number(b.monto||0),0),s=u>0?u:Number(e.anticipo||0),d=Math.max(0,Number(e.total||0)-s),f=(e.fechaFinalizado||e.fechaPedido||"").split("T")[0]||"\u2014",a=e.entrega||"\u2014",c=(e.productosInventario||[]).filter(m=>m.id!=="libre"),p=c.length>0?c.map(m=>{const b=Number(m.quantity||1),v=Number(m.price||0),h=b*v;let w="";if(m.variante){const P=m.variante.indexOf(":"),$=P!==-1?m.variante.slice(0,P).trim():"",S=P!==-1?m.variante.slice(P+1).trim():m.variante.trim();w=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;">
                    ${$?`<span style="background:#f3f4f6;color:#6b7280;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${_esc($)}</span>`:""}
                    <span style="background:#fffbeb;color:#92400e;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${_esc(S)}</span>
                </div>`}const y=v>0?`$${v.toFixed(2)}`:'<span style="color:#d1d5db;">\u2014</span>',E=v>0?`$${h.toFixed(2)}`:'<span style="color:#d1d5db;">\u2014</span>';return`
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <div style="font-weight:600;color:#1f2937;font-size:13px;">${_esc(m.name||"\u2014")}</div>
                    ${w}
                </td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;font-size:13px;vertical-align:middle;">${b}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;color:#6b7280;font-size:13px;vertical-align:middle;">${y}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;color:#1f2937;font-size:13px;vertical-align:middle;">${E}</td>
            </tr>`}).join(""):`<tr><td colspan="4" style="padding:16px 12px;text-align:center;color:#9ca3af;font-style:italic;font-size:13px;">${_esc(e.concepto||"Pedido personalizado")}</td></tr>`,g=t?`<img src="${t}" style="height:72px;object-fit:contain;margin-bottom:8px;" alt="Bicho Capricho">`:'<div style="font-size:2rem;">\u{1F41B}</div>',n=e.notas?`
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
    ${g}
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
        <div class="info-value">${_esc(f)}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Entrega</div>
        <div class="info-value" style="color:${a&&a!=="\u2014"&&f&&f!=="\u2014"&&a<f?"#dc2626":"#1f2937"};">${_esc(a)}</div>
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
    <tbody>${p}</tbody>
  </table>

  <!-- SEPARADOR -->
  <div style="height:16px;"></div>

  <!-- TOTALES -->
  <div class="section-title">Resumen de pago</div>
  <div class="totals">
    <div class="total-row grand">
      <span>Total del pedido</span>
      <span>$${r.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Anticipo recibido</span>
      <span style="color:#16a34a;font-weight:700;">\u2212 $${l.toFixed(2)}</span>
    </div>
    <div class="total-row ${d<=0?"saldo-ok":"saldo-pen"}">
      <span>${d<=0?"\u2705 Pagado completo":"\u23F3 Saldo pendiente"}</span>
      <span>$${Math.max(0,d).toFixed(2)}</span>
    </div>
  </div>

  <!-- NOTAS -->
  ${n?`<div style="padding:0 24px;">${n}</div>`:""}

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
</body></html>`),o.document.close()}window.imprimirTicketPedido=imprimirTicketPedido,window.openPedidoModal=openPedidoModal,window.closePedidoModal=closePedidoModal,window.openPedidoStatusModal=openPedidoStatusModal,window.closePedidoStatusModal=closePedidoStatusModal,window.setPedidoStatus=setPedidoStatus;async function duplicarPedido(i){const e=(window.pedidos||[]).find(l=>String(l.id)===String(i))||(window.pedidosFinalizados||[]).find(l=>String(l.id)===String(i));if(!e)return;const o=mkId(),t=_fechaHoy(),r={...e,id:o,folio:await generarFolioPedido(),status:"confirmado",anticipo:0,resta:e.total||0,pagos:[],fechaCreacion:new Date().toISOString(),fechaUltimoEstado:new Date().toISOString(),fechaPedido:t,entrega:"",productosInventario:JSON.parse(JSON.stringify(e.productosInventario||[])),empaques:e.empaques?e.empaques.map(l=>({...l})):[],empaquesDescontados:!1,inventarioDescontado:!1,_inventarioYaFinalizado:!1};delete r.fechaFinalizado,delete r.fechaCancelado,r.referenciasUrls=[],r.referenciasPaths=[],delete r.referenciaUrl,delete r.referenciaPath,window.pedidos||(window.pedidos=[]),window.pedidos.push(r),savePedidos(),renderPedidosTable(),updatePedidosStats(),manekiToastExport(`\u2705 Pedido duplicado: ${r.folio} \u2014 recuerda ajustar la fecha de entrega.`,"ok"),setTimeout(()=>{typeof openPedidoModal=="function"&&openPedidoModal(r.id)},400)}window.duplicarPedido=duplicarPedido;async function exportarPedidoPDF(i){const e=[...window.pedidosFinalizados||[],...window.pedidos||[]].find(n=>String(n.id)===String(i));if(!e){manekiToastExport("Pedido no encontrado","warn");return}if(typeof html2pdf>"u"){manekiToastExport("\u23F3 Cargando generador de PDF...","info");try{await new Promise((n,x)=>{const m=document.createElement("script");m.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",m.onload=n,m.onerror=x,document.head.appendChild(m)})}catch{manekiToastExport("\u274C No se pudo cargar el generador PDF","err");return}}let o="";try{const x=await(await fetch(new URL("logo.png",window.location.href).href)).blob();o=await new Promise(m=>{const b=new FileReader;b.onload=()=>m(b.result),b.readAsDataURL(x)})}catch{}const t=Number(e.total||0),r=(e.pagos||[]).reduce((n,x)=>n+Number(x.monto||0),0),l=r>0?r:Number(e.anticipo||0),u=Math.max(0,t-l),s=(e.productosInventario||[]).filter(n=>n.id!=="libre"),d=window.storeConfig?.name||"Bicho Capricho",f=window.storeConfig?.phone||"",a=_esc,c=s.length>0?s.map(n=>{const x=Number(n.quantity||1),m=Number(n.price||0);return`<tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${a(n.name||"\u2014")}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;">${x}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;">$${m.toFixed(2)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;font-size:13px;">$${(x*m).toFixed(2)}</td>
            </tr>`}).join(""):`<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af;font-style:italic;">${a(e.concepto||"Pedido personalizado")}</td></tr>`,p=(e.pagos||[]).length>0?`<div style="margin-top:16px;"><h4 style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Historial de pagos</h4>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
            ${(e.pagos||[]).map(n=>`<tr><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${n.fecha||"\u2014"}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${n.tipo||"abono"}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;color:#16a34a;">$${Number(n.monto||0).toFixed(2)}</td></tr>`).join("")}
            </table></div>`:"",g=document.createElement("div");g.style.cssText="width:480px;font-family:Segoe UI,system-ui,sans-serif;background:#fff;",g.innerHTML=`
        <div style="background:linear-gradient(135deg,#1a0533,#2d0a4e);padding:28px 24px;text-align:center;color:white;border-radius:12px 12px 0 0;">
            ${o?`<img src="${o}" alt="${a(d)}" style="height:52px;margin-bottom:8px;">`:""}
            <div style="font-size:20px;font-weight:800;color:#FFDD85;">${a(d)}</div>
            ${f?`<div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:4px;">${a(f)}</div>`:""}
        </div>
        <div style="padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div><span style="font-size:18px;font-weight:800;color:#FFD166;">${a(e.folio||"")}</span></div>
                <div style="text-align:right;">
                    <div style="font-size:11px;color:#9ca3af;">Fecha: ${a(e.fechaPedido||"\u2014")}</div>
                    <div style="font-size:11px;color:#9ca3af;">Entrega: ${a(e.entrega||"\u2014")}</div>
                </div>
            </div>
            <div style="background:#faf9f7;border-radius:10px;padding:14px;margin-bottom:20px;">
                <div style="font-size:14px;font-weight:700;color:#1f2937;">${a(e.cliente||"\u2014")}</div>
                ${e.telefono?`<div style="font-size:12px;color:#6b7280;margin-top:2px;">\u{1F4F1} ${a(e.telefono)}</div>`:""}
                ${e.lugarEntrega?`<div style="font-size:12px;color:#9669c4;margin-top:2px;">\u{1F4CD} ${a(e.lugarEntrega)}</div>`:""}
            </div>
            ${e.concepto?`<div style="font-size:12px;color:#6b7280;margin-bottom:12px;"><strong>Concepto:</strong> ${a(e.concepto)}</div>`:""}
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#f9fafb;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Producto</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;">Cant</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;">Precio</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;">Subtotal</th>
                </tr></thead>
                <tbody>${c}</tbody>
            </table>
            <div style="margin-top:16px;padding:14px;background:#faf9f7;border-radius:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;color:#374151;">Total</span><span style="font-size:16px;font-weight:900;color:#1f2937;">$${t.toFixed(2)}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:#16a34a;">Pagado</span><span style="font-size:13px;font-weight:700;color:#16a34a;">$${l.toFixed(2)}</span></div>
                ${u>0?`<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:2px dashed #fde68a;"><span style="font-size:13px;font-weight:700;color:#dc2626;">Saldo pendiente</span><span style="font-size:15px;font-weight:900;color:#dc2626;">$${u.toFixed(2)}</span></div>`:'<div style="text-align:center;padding-top:6px;color:#16a34a;font-weight:700;font-size:13px;">\u2705 LIQUIDADO</div>'}
            </div>
            ${p}
            ${e.notas?`<div style="margin-top:16px;padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#78350f;"><strong>\u{1F4DD} Notas:</strong> ${a(e.notas)}</div>`:""}
            <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;">
                <p style="font-size:10px;color:#9ca3af;">Documento generado el ${new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</p>
                <p style="font-size:10px;color:#FFD166;font-weight:600;margin-top:4px;">\xA1Gracias por tu preferencia! \u{1F41B}</p>
            </div>
        </div>`,document.body.appendChild(g);try{await html2pdf().set({margin:0,filename:`${e.folio||"pedido"}_${a(e.cliente||"").replace(/\s+/g,"_")}.pdf`,image:{type:"jpeg",quality:.95},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:[120,280],orientation:"portrait"}}).from(g).save(),manekiToastExport("\u{1F4C4} PDF descargado","ok")}catch(n){console.error("PDF error:",n),manekiToastExport("\u274C Error al generar PDF","err")}g.remove()}window.exportarPedidoPDF=exportarPedidoPDF,window.openAbonoPedido=openAbonoPedido,window.cerrarAbonoPedido=cerrarAbonoPedido,window.confirmarAbonoPedido=confirmarAbonoPedido,window.selectAbonoPedidoMethod=selectAbonoPedidoMethod,window.eliminarPedido=eliminarPedido,window.renderPedidosTable=renderPedidosTable,window.renderKanbanBoard=renderKanbanBoard,window.renderTablaPedidos=renderTablaPedidos,window.updatePedidosStats=updatePedidosStats,window.renderHistorialPedidos=renderHistorialPedidos,window.kanbanCardHTML=kanbanCardHTML,window.kanbanDragStart=kanbanDragStart,window.kanbanDragEnd=kanbanDragEnd,window.kanbanDragOver=kanbanDragOver,window.kanbanDragLeave=kanbanDragLeave,window.kanbanDrop=kanbanDrop,window.setVistaPedidos=setVistaPedidos,window.filterPedidos=filterPedidos,window.toggleKanbanCompacto=toggleKanbanCompacto,window.generarFolioPedido=generarFolioPedido,window.openCancelPedidoModal=openCancelPedidoModal,window.closeCancelPedidoModal=closeCancelPedidoModal,window.confirmarCancelPedido=confirmarCancelPedido;function filtrarProductosPedido(){const i=(document.getElementById("pedidoBuscadorProducto")?.value||"").toLowerCase().trim(),e=document.getElementById("pedidoProductoGrid");if(!e)return;const o=(window.products||[]).filter(t=>(!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack"||t.tipo==="producto_variable")&&(!i||(t.name||"").toLowerCase().includes(i)||(t.sku||"").toLowerCase().includes(i)));if(!i&&o.length===0){e.classList.add("hidden");return}if(e.classList.remove("hidden"),o.length===0){e.innerHTML='<p class="text-sm text-gray-400 text-center py-2">No se encontraron productos</p>';return}e.innerHTML=o.map(t=>{const r=t.imageUrl?`<img src="${t.imageUrl}" alt="${_esc(t.name||"")}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">`:`<span class="text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0">${t.image||"\u{1F4E6}"}</span>`,l=t.tipo==="materia_prima",u=t.tipo==="servicio",s=t.tipo==="producto_variable",d=s?(()=>{const p=(t.tablaPreciosVariable||[]).slice().sort((g,n)=>g.cantidadMin-n.cantidadMin);return p.length?p.map(g=>`${g.cantidadMin}=$${Number(g.precio).toFixed(0)}`).join(" / "):"Precio variable"})():t.price?`$${Number(t.price).toFixed(2)}`:t.cost?`Costo: $${Number(t.cost).toFixed(2)}`:"",f=u?'<span style="font-size:.65rem;background:#f6ecff;color:#7d4fa3;padding:1px 6px;border-radius:99px;font-weight:700;">\u2699\uFE0F Serv</span>':l?'<span style="font-size:.65rem;background:#f6ecff;color:#9669c4;padding:1px 6px;border-radius:99px;font-weight:700;">MP</span>':s?'<span style="font-size:.65rem;background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:99px;font-weight:700;">\u{1F3AF} Var</span>':'<span style="font-size:.65rem;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;font-weight:700;">PT</span>',c=_variantesPedido(t).length>0?`<span style="font-size:.65rem;color:#6366f1;">\u{1F3A8} ${_variantesPedido(t).length} variantes</span>`:"";return`
            <div onclick="seleccionarProductoPedido('${t.id}')"
                class="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                ${r}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1 flex-wrap">
                        <span class="font-semibold text-sm text-gray-800 truncate">${_esc(t.name||"")}</span>
                        ${f}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-amber-700">${d}</span>
                        ${c}
                    </div>
                </div>
            </div>`}).join("")}window.filtrarProductosPedido=filtrarProductosPedido;function _variantesPedido(i){if(!i)return[];if(Array.isArray(i.variants)&&i.variants.length>0)return i.variants;if(Array.isArray(i.mpComponentes)&&i.mpComponentes.length>0)for(const e of i.mpComponentes){const o=(window.products||[]).find(t=>String(t.id)===String(e.id));if(o&&Array.isArray(o.variants)&&o.variants.length>0)return o.variants}return[]}window._variantesPedido=_variantesPedido;function seleccionarProductoPedido(i){const e=(window.products||[]).find(c=>String(c.id)===String(i));if(!e)return;document.getElementById("pedidoProductoSelect").value=i,document.getElementById("pedidoProductoGrid").classList.add("hidden"),document.getElementById("pedidoBuscadorProducto").value="";const o=document.getElementById("pedidoProductoSelRow");o&&o.classList.remove("hidden");const t=document.getElementById("pedidoProductoSelImg");t&&(e.imageUrl?(t.src=e.imageUrl,t.style.display=""):t.style.display="none");const r=document.getElementById("pedidoProductoSelNombre");r&&(r.textContent=e.name);const l=document.getElementById("pedidoProductoSelPrecio");if(l)if(e.tipo==="producto_variable"){const c=(e.tablaPreciosVariable||[]).slice().sort((p,g)=>p.cantidadMin-g.cantidadMin);l.textContent=c.length?c.map(p=>`${p.cantidadMin}+ pzas: $${(Number(p.precio)/(Number(p.cantidadMin)||1)).toFixed(2)}/pza`).join(" \xB7 "):"Precio variable"}else{const c=e.tipo==="materia_prima";l.textContent=e.price?`$${Number(e.price).toFixed(2)}`:c&&e.cost?`Costo: $${Number(e.cost).toFixed(2)}`:""}const u=document.getElementById("pedidoVarianteRow"),s=document.getElementById("pedidoVarianteSelect"),d=document.getElementById("pedidoVarianteChoices");if(u&&s){s._pvBound||(s.addEventListener("change",()=>{_pvCantidadChange(document.getElementById("pedidoProductoCantidad")?.value),_pedidoSyncVariantChoices()}),s._pvBound=!0),d&&!d._pvBound&&(d.addEventListener("click",p=>{const g=p.target.closest("button[data-variant-value]");g&&(s.value=g.dataset.variantValue,s.dispatchEvent(new Event("change",{bubbles:!0})))}),d._pvBound=!0);const c=_variantesPedido(e);if(c.length>0){s.innerHTML=c.map(n=>{const x=n.qty!==void 0&&n.qty!==null?` (${n.qty} pzs)`:"",m=typeof _mkColorEmoji=="function"?_mkColorEmoji(n.type,n.value):n.value,b=Number(n.priceDelta)||0,v=n.type==="Talla/Color"?`${n.value} \xB7 ${n.qty||0} listas${b?` \xB7 +$${b.toFixed(2)}/pza`:""}`:`${n.type}: ${m}${x}`;return`<option value="${_esc(n.type)}:${_esc(n.value)}">${_esc(v)}</option>`}).join(""),u.classList.remove("hidden");const p=e.tipo==="producto_variable"&&c.some(n=>n.type==="Talla/Color");s.classList.toggle("pedido-variant-select--chips",p),s.tabIndex=p?-1:0,s.setAttribute("aria-hidden",String(p)),d&&(d.hidden=!p,d.innerHTML=p?c.filter(n=>n.type==="Talla/Color").map(n=>{const x=`${n.type}:${n.value}`,m=Number(n.qty)||0,b=Number(n.priceDelta)||0,v=String(n.color||n.value.split("/")[1]?.trim()||""),h=`${n.size||n.value.split("/")[0]?.trim()||""} \xB7 ${v}`,y={negro:"#191919",blanco:"#fff",rojo:"#cb3540",azul:"#3172bc",verde:"#32855d",amarillo:"#e8b52f",rosa:"#e17da1",morado:"#8654b6",gris:"#969a9e",crema:"#eee1c8"}[v.toLowerCase()]||(/^#[0-9a-f]{6}$/i.test(v)?v:null);return`<button type="button" data-variant-value="${_esc(x)}" aria-label="${_esc(h)}; ${m>0?`${m} listas`:"se fabrica"}${b?`; recargo $${b.toFixed(2)} por pieza`:""}" aria-pressed="false"><span class="pedido-variant-name">${y?`<span class="pedido-color-swatch" style="background:${y}" aria-hidden="true"></span>`:""}${_esc(h)}</span><span class="pedido-variant-stock">${m>0?`${m} listas`:"Se fabrica"}${b?` \xB7 +$${b.toFixed(2)}/pza`:""}</span></button>`}).join(""):"",_pedidoSyncVariantChoices());const g=u.querySelector("label");g&&(g.textContent=e.tipo==="materia_prima"?"\u{1F3A8} Selecciona variante (Talla / Color):":e.tipo==="producto_variable"?"Talla y color:":"\u{1F3A8} Variante:")}else u.classList.add("hidden"),s.classList.remove("pedido-variant-select--chips"),s.tabIndex=0,s.removeAttribute("aria-hidden"),d&&(d.hidden=!0,d.innerHTML="")}const f=document.getElementById("pedidoCosto");f&&e.price&&e.tipo!=="materia_prima"&&(f.value=Number(e.price).toFixed(2));const a=document.getElementById("pedidoProductoPrecio");if(a)if(e.tipo==="producto_variable"&&typeof pvGetPrecio=="function"){const c=parseInt(document.getElementById("pedidoProductoCantidad")?.value)||1;a.readOnly=!0,_pvCantidadChange(c)}else a.readOnly=!1,a.value=e.price?Number(e.price).toFixed(2):"",_pvOcultarHint();typeof _mostrarGaleriaPtEnPedido=="function"&&_mostrarGaleriaPtEnPedido(e),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.seleccionarProductoPedido=seleccionarProductoPedido;function limpiarSeleccionProductoPedido(){document.getElementById("pedidoProductoSelect").value="";const i=document.getElementById("pedidoProductoSelRow");i&&i.classList.add("hidden");const e=document.getElementById("pedidoVarianteRow");e&&e.classList.add("hidden");const o=document.getElementById("pedidoVarianteChoices");o&&(o.hidden=!0,o.innerHTML="");const t=document.getElementById("pedidoProductoPrecio");t&&(t.value="");const r=document.getElementById("pedidoProductoCantidad");r&&(r.value=1);const l=document.getElementById("pedidoPtGaleriaStrip");l&&(l.innerHTML=""),_pvOcultarHint()}window.limpiarSeleccionProductoPedido=limpiarSeleccionProductoPedido;function _pedidoSyncVariantChoices(){const i=document.getElementById("pedidoVarianteSelect")?.value;document.querySelectorAll("#pedidoVarianteChoices button[data-variant-value]").forEach(e=>{e.setAttribute("aria-pressed",String(e.dataset.variantValue===i))})}function _pvMostrarHint(i,e,o=e){let t=document.getElementById("pedidoPvHint");if(!t){const p=document.getElementById("pedidoProductoSelRow");if(!p)return;t=document.createElement("div"),t.id="pedidoPvHint",t.className="pedido-price-preview",t.setAttribute("role","status"),p.appendChild(t)}const r=(i.tablaPreciosVariable||[]).slice().sort((p,g)=>p.cantidadMin-g.cantidadMin);if(!r.length){t.style.display="none";return}let l=r[0];for(const p of r)if(e>=p.cantidadMin)l=p;else break;const u=document.getElementById("pedidoVarianteSelect")?.value,s=pvGetPrecio(i,e,u),d=s*o;t.style.display="";const a=(typeof pvPlanMateriales=="function"?pvPlanMateriales(i,e,u,window.products||[]):[]).filter(p=>p.faltante>0),c=a.length?"Faltan materiales: "+a.map(p=>`${p.faltante} ${p.nombre}`).join(", "):"Materiales disponibles";t.innerHTML=`<span class="pedido-price-range">Precio por ${l.cantidadMin}+ piezas</span><strong>$${s.toFixed(2)} por pieza</strong><span>${o} ${o===1?"pieza":"piezas"} \xB7 Total $${d.toFixed(2)}</span><span class="pedido-material-status">${_esc(c)}</span>`,t.classList.toggle("pv-stock-warning",a.length>0)}window._pvMostrarHint=_pvMostrarHint;function _pvOcultarHint(){const i=document.getElementById("pedidoPvHint");i&&(i.style.display="none")}window._pvOcultarHint=_pvOcultarHint;function _pvCantidadChange(i){const e=document.getElementById("pedidoProductoSelect")?.value;if(!e)return;const o=(window.products||[]).find(d=>String(d.id)===String(e));if(!o||o.tipo!=="producto_variable")return;const t=parseInt(typeof i=="object"?i?.value:i)||1,r=document.getElementById("pedidoVarianteSelect")?.value,l=(window.pedidoProductosSeleccionados||[]).filter(d=>String(d.id)===String(e)).reduce((d,f)=>d+(Number(f.quantity)||0),0),u=typeof pvGetPrecio=="function"?pvGetPrecio(o,t+l,r):0,s=document.getElementById("pedidoProductoPrecio");s&&(s.value=u.toFixed(2)),_pvMostrarHint(o,t+l,t)}window._pvCantidadChange=_pvCantidadChange;async function agregarProductoPedido(){const i=document.getElementById("pedidoProductoSelect")?.value;if(!i){manekiToastExport("\u26A0\uFE0F Selecciona un producto primero","warn");return}const e=(window.products||[]).find(a=>String(a.id)===String(i));if(!e)return;const o=parseInt(document.getElementById("pedidoProductoCantidad")?.value)||1,t=document.getElementById("pedidoProductoPrecio"),r=t&&t.value!==""?parseFloat(t.value):null,l=document.getElementById("pedidoVarianteSelect"),u=_variantesPedido(e).length>0,s=l&&u&&!document.getElementById("pedidoVarianteRow")?.classList.contains("hidden")?l.value:null,d=e.tipo==="producto_variable"&&typeof pvGetPrecio=="function"?pvGetPrecio(e,o,s):r!==null?r:Number(e.price)||0;if(u&&!s){manekiToastExport("\u26A0\uFE0F Este producto tiene variantes. Selecciona una.","warn");return}if(window.pedidoProductosSeleccionados=window.pedidoProductosSeleccionados||[],e.tipo==="producto_variable"){const a=window.pedidoProductosSeleccionados.filter(g=>String(g.id)===String(i)&&g.variante===s).reduce((g,n)=>g+(Number(n.quantity)||0),0),p=(typeof pvPlanMateriales=="function"?pvPlanMateriales(e,o+a,s,window.products||[]):[]).filter(g=>g.faltante>0);if(p.length){const g=p.map(n=>`${n.nombre}: faltan ${n.faltante} (hay ${n.disponible}, se necesitan ${n.necesario})`).join(`
`);if(!await showConfirm(`Falta material para ${e.name}${s?" "+s:""}:
${g}

\xBFAgregar al pedido y reponer despu\xE9s?`,"Material insuficiente"))return}}else{const a=typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0;a<o&&manekiToastExport(`\u26A0\uFE0F "${e.name||e.nombre}" tiene solo ${a} en stock`,"warn")}const f=window.pedidoProductosSeleccionados.find(a=>String(a.id)===String(i)&&a.variante===s);f?f.quantity=(f.quantity||1)+o:window.pedidoProductosSeleccionados.push({id:i,name:e.name,price:d,quantity:o,variante:s}),typeof pvRecalcularLineas=="function"&&pvRecalcularLineas(window.pedidoProductosSeleccionados,window.products||[]),renderPedidoProductosList(),limpiarSeleccionProductoPedido()}window.agregarProductoPedido=agregarProductoPedido;function renderPedidoProductosList(){const i=document.getElementById("pedidoProductosList");if(!i)return;i._pvBound||(i.addEventListener("change",t=>{const r=t.target;r?.dataset?.pedidoQty!==void 0&&editarCantidadPedidoProducto(Number(r.dataset.pedidoQty),r.value),r?.dataset?.pedidoPrice!==void 0&&editarPrecioPedidoProducto(Number(r.dataset.pedidoPrice),r.value)}),i._pvBound=!0);const e=window.pedidoProductosSeleccionados||[];if(!e.length){i.innerHTML="";return}const o=e.reduce((t,r)=>t+(parseFloat(r.price)||0)*(r.quantity||1),0);i.innerHTML=e.map((t,r)=>{const l=parseFloat(t.price)||0,u=l*(t.quantity||1);return`
        <div class="pedido-line-item">
            <div class="flex-1 min-w-0">
                <div class="pedido-line-title">${_esc(t.name||"")}</div>
                ${t.variante?`<div class="pedido-line-variant">${_esc(t.variante.startsWith("Talla/Color:")?t.variante.slice(12).trim():t.variante)}</div>`:""}
                <div class="pedido-line-controls">
                    <label>Cantidad
                    <input type="number" min="1" value="${t.quantity||1}" data-pedido-qty="${r}" aria-label="Cantidad de ${_esc(t.name||"producto")}"
                        class="pedido-line-input"></label>
                    <label>Precio por pieza
                    <input type="number" step="0.01" min="0" value="${l.toFixed(2)}" data-pedido-price="${r}" aria-label="Precio por pieza de ${_esc(t.name||"producto")}"
                        ${(window.products||[]).find(s=>String(s.id)===String(t.id))?.tipo==="producto_variable"?'readonly title="Precio autom\xE1tico seg\xFAn cantidad, talla y color"':""}
                        class="pedido-line-input"></label>
                    <span class="pedido-line-total">$${u.toFixed(2)}</span>
                </div>
            </div>
            <button type="button" data-action="quitarProductoPedido" data-arg="${r}" aria-label="Quitar ${_esc(t.name||"producto")}" class="pedido-line-remove">\u2715</button>
        </div>`}).join("")+`
        <div class="flex justify-end px-3 pt-1 pb-0.5 text-xs font-bold text-gray-700">
            Subtotal productos: <span class="ml-1 text-amber-700">$${o.toFixed(2)}</span>
        </div>`,typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.renderPedidoProductosList=renderPedidoProductosList;function poblarSelectEmpaquesPedido(){const i=document.getElementById("pedidoEmpaquesSelect");if(!i)return;const e=(window.products||[]).filter(o=>(o.tags||[]).some(t=>t.toLowerCase()==="empaques"||t.toLowerCase()==="empaque"));i.innerHTML='<option value="">\u2014 Seleccionar empaque \u2014</option>'+e.map(o=>{const t=typeof getStockEfectivo=="function"?getStockEfectivo(o):o.stock||0;return`<option value="${o.id}">${_esc(o.name||"")} (Stock: ${t})</option>`}).join("")}window.poblarSelectEmpaquesPedido=poblarSelectEmpaquesPedido;function agregarEmpaquePedido(){const i=document.getElementById("pedidoEmpaquesSelect"),e=document.getElementById("pedidoEmpaquesCantidad");if(!i||!i.value)return;const o=(window.products||[]).find(l=>String(l.id)===i.value);if(!o)return;const t=parseInt(e?.value)||1;window.pedidoEmpaquesSeleccionados||(window.pedidoEmpaquesSeleccionados=[]);const r=window.pedidoEmpaquesSeleccionados.find(l=>String(l.id)===String(o.id));r?r.quantity+=t:window.pedidoEmpaquesSeleccionados.push({id:o.id,name:o.name,quantity:t}),e&&(e.value=1),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.agregarEmpaquePedido=agregarEmpaquePedido;function renderPedidoEmpaquesList(){const i=document.getElementById("pedidoEmpaquesList");if(!i)return;const e=window.pedidoEmpaquesSeleccionados||[];if(!e.length){i.innerHTML="";return}i.innerHTML=e.map((o,t)=>{const r=(window.products||[]).find(s=>String(s.id)===String(o.id)),l=Number(r?.cost||0),u=(l*(o.quantity||1)).toFixed(2);return`
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-lg text-sm">
            <span class="flex-1 text-gray-700">\u{1F4E6} ${o.name}</span>
            <span class="text-xs text-gray-400">$${l.toFixed(2)}c/u = <span class="font-semibold text-gray-600">$${u}</span></span>
            <input type="number" min="1" value="${o.quantity}"
                onchange="editarCantidadEmpaquePedido(${t}, this.value)"
                class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs text-center outline-none">
            <button onclick="quitarEmpaquePedido(${t})" class="text-gray-400 hover:text-red-400 text-sm">\u2715</button>
        </div>`}).join("")}window.renderPedidoEmpaquesList=renderPedidoEmpaquesList;function quitarEmpaquePedido(i){(window.pedidoEmpaquesSeleccionados||[]).splice(i,1),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.quitarEmpaquePedido=quitarEmpaquePedido;function editarCantidadEmpaquePedido(i,e){const o=parseInt(e)||1;window.pedidoEmpaquesSeleccionados&&window.pedidoEmpaquesSeleccionados[i]!=null&&(window.pedidoEmpaquesSeleccionados[i].quantity=o),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.editarCantidadEmpaquePedido=editarCantidadEmpaquePedido;function quitarProductoPedido(i){(window.pedidoProductosSeleccionados||[]).splice(i,1),typeof pvRecalcularLineas=="function"&&pvRecalcularLineas(window.pedidoProductosSeleccionados||[],window.products||[]),renderPedidoProductosList()}window.quitarProductoPedido=quitarProductoPedido;function editarPrecioPedidoProducto(i,e){const o=window.pedidoProductosSeleccionados||[];o[i]!==void 0&&(o[i].price=parseFloat(e)||0,renderPedidoProductosList())}window.editarPrecioPedidoProducto=editarPrecioPedidoProducto;function editarCantidadPedidoProducto(i,e){const o=window.pedidoProductosSeleccionados||[];if(o[i]!==void 0){const t=parseInt(e)||1;o[i].quantity=t,typeof pvRecalcularLineas=="function"&&pvRecalcularLineas(o,window.products||[]),renderPedidoProductosList()}}window.editarCantidadPedidoProducto=editarCantidadPedidoProducto;function generarTicketPedido(i){const e=[...window.pedidos||[],...window.pedidosFinalizados||[]].find(a=>String(a.id)===String(i));if(!e)return;const o=window.storeConfig||{},t=a=>String(a||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;"),r=a=>a?new Date(a).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}):"\u2014",l=e.productosInventario||[],u=l.length>0?l.map(a=>"<tr><td>"+t(a.name||a.nombre||"\u2014")+'</td><td style="text-align:center">'+(a.quantity||a.cantidad||1)+'</td><td style="text-align:right">$'+Number(a.price||0).toFixed(2)+'</td><td style="text-align:right">$'+(Number(a.price||0)*(a.quantity||a.cantidad||1)).toFixed(2)+"</td></tr>").join(""):'<tr><td colspan="4" style="color:#6b7280;font-style:italic;">'+t(e.concepto||"Sin detalle")+"</td></tr>",s=o.logoMode==="image"&&o.logo?'<img src="'+o.logo+'" alt="'+t(o.name||"Logo")+'" style="width:60px;height:60px;object-fit:contain;border-radius:10px;">':t(o.emoji||"\u{1F41B}"),d='<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ticket '+t(e.folio||"")+'</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:"Helvetica Neue",Arial,sans-serif;padding:32px;max-width:480px;margin:auto;color:#1a1a1a;}.logo{text-align:center;font-size:2.5rem;margin-bottom:4px;}.tienda{text-align:center;font-size:1.3rem;font-weight:800;color:#1a0533;}.slogan{text-align:center;font-size:.8rem;color:#6b7280;margin-bottom:4px;}.contacto{text-align:center;font-size:.75rem;color:#9ca3af;margin-bottom:12px;}.folio-badge{background:#f5ede0;border:1.5px solid #FFD166;border-radius:8px;padding:6px 16px;text-align:center;font-weight:800;color:#92400e;font-size:.9rem;margin-bottom:16px;}.divider{border:none;border-top:1.5px dashed #e5e7eb;margin:12px 0;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}.info-item label{display:block;font-size:.7rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;}.info-item span{font-size:.85rem;font-weight:600;}table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.82rem;}th{background:#f9f5ef;padding:7px 10px;text-align:left;font-weight:700;font-size:.72rem;text-transform:uppercase;color:#92400e;}td{padding:6px 10px;border-bottom:1px solid #f3f4f6;}.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem;color:#374151;}.total-final{display:flex;justify-content:space-between;padding:10px 0;font-size:1.1rem;font-weight:800;border-top:2px solid #FFD166;color:#1a0533;margin-top:4px;}.saldo-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#dc2626;}.pagado-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#16a34a;}.notas{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:.8rem;color:#374151;}.footer{text-align:center;font-size:.75rem;color:#9ca3af;margin-top:16px;line-height:1.6;}@media print{body{padding:12px;}.no-print{display:none!important;}}</style></head><body><div class="logo">'+s+'</div><div class="tienda">'+t(o.name||"Bicho Capricho")+'</div><div class="slogan">'+t(o.slogan||"Regalos Personalizados")+'</div><div class="contacto">'+(o.phone?"\u{1F4F1} "+t(o.phone):"")+(o.phone&&o.facebook?" \xB7 ":"")+(o.facebook?"\u{1F4D8} "+t(o.facebook):"")+'</div><div class="folio-badge">\u{1F4CB} Pedido '+t(e.folio||"\u2014")+'</div><hr class="divider"><div class="info-grid"><div class="info-item"><label>Cliente</label><span>'+t(e.cliente||"\u2014")+'</span></div><div class="info-item"><label>Tel\xE9fono</label><span>'+t(e.telefono||e.whatsapp||"\u2014")+'</span></div><div class="info-item"><label>Fecha del pedido</label><span>'+r(e.fechaPedido)+'</span></div><div class="info-item"><label>Fecha de entrega</label><span>'+r(e.entrega)+"</span></div>"+(e.lugarEntrega?'<div class="info-item" style="grid-column:1/-1"><label>Lugar de entrega</label><span>'+t(e.lugarEntrega)+"</span></div>":"")+'</div><hr class="divider"><div style="font-size:.75rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Concepto</div><div style="font-size:.85rem;color:#374151;margin-bottom:12px;">'+t(e.concepto||"\u2014")+'</div><table><thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Total</th></tr></thead><tbody>'+u+'</tbody></table><hr class="divider"><div class="total-final"><span>Total del pedido</span><span>$'+Number(e.total||0).toFixed(2)+'</span></div><div class="total-row"><span>Anticipo recibido</span><span style="color:#16a34a;font-weight:700;">\u2014 $'+Number(e.anticipo||0).toFixed(2)+"</span></div>"+(calcSaldoPendiente(e)>0?'<div class="saldo-row"><span>\u{1F4B0} Saldo pendiente</span><span>$'+calcSaldoPendiente(e).toFixed(2)+"</span></div>":'<div class="pagado-row"><span>\u2705 Liquidado</span><span>$0.00</span></div>')+(e.notas?'<div class="notas"><b>Notas:</b> '+t(e.notas)+"</div>":"")+'<hr class="divider"><div class="footer">'+t(o.footer||"\xA1Gracias por tu compra!")+"<br>"+(o.facebook?t(o.facebook)+"<br>":"")+'<span style="color:#FFD166;font-weight:700;">\u2728 Bicho Capricho</span></div><div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:10px 16px;display:flex;gap:8px;"><button onclick="window.print()" style="flex:1;padding:10px;background:#FFD166;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.9rem;">\u{1F5A8}\uFE0F Imprimir / Guardar PDF</button><button onclick="window.close()" style="padding:10px 16px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;">\u2715 Cerrar</button></div><div style="height:64px;"></div></body></html>',f=window.open("","_blank","width=540,height=780");if(!f){manekiToastExport("Permite ventanas emergentes para ver el ticket","warn");return}f.document.write(d),f.document.close(),f.focus()}window.generarTicketPedido=generarTicketPedido;function _mostrarGaleriaPtEnPedido(i){let e=document.getElementById("pedidoPtGaleriaStrip");if(!e){e=document.createElement("div"),e.id="pedidoPtGaleriaStrip",e.style.cssText="margin-top:8px;";const r=document.getElementById("pedidoProductoSelRow");r&&r.appendChild(e),e.addEventListener("click",function(l){const u=l.target.closest("img[data-foto-url]");if(!u)return;const s=u.dataset.fotoUrl;s&&window.open(s,"_blank","noopener,noreferrer")})}const o=Array.isArray(i.imageUrls)&&i.imageUrls.length>0?i.imageUrls:i.imageUrl?[i.imageUrl]:[];if(o.length===0){e.innerHTML="";return}const t=_esc;e.innerHTML='<div style="font-size:.72rem;color:#92400e;font-weight:700;margin-bottom:6px;">\u{1F5BC}\uFE0F Fotos del producto ('+o.length+')</div><div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">'+o.map((r,l)=>'<img src="'+t(r)+'" alt="Foto producto '+(l+1)+'" data-foto-url="'+t(r)+'" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1.5px solid #e5e7eb;flex-shrink:0;cursor:pointer;" title="Ver foto completa">').join("")+"</div>"}window._mostrarGaleriaPtEnPedido=_mostrarGaleriaPtEnPedido;let _calMes=new Date().getMonth(),_calAnio=new Date().getFullYear();function renderCalendarioPedidos(){const i=document.getElementById("vistaCalendario");if(!i)return;const e=new Date;e.setHours(0,0,0,0);const o=window.pedidos||[],t={};o.forEach(a=>{if(!a.entrega)return;const c=a.entrega.substring(0,10);t[c]||(t[c]=[]),t[c].push(a)});const r=new Date(_calAnio,_calMes,1),l=new Date(_calAnio,_calMes+1,0),u=r.getDay(),s=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],d=["Dom","Lun","Mar","Mi\xE9","Jue","Vie","S\xE1b"];let f="";for(let a=0;a<u;a++)f+="<div></div>";for(let a=1;a<=l.getDate();a++){const c=_calAnio+"-"+String(_calMes+1).padStart(2,"0")+"-"+String(a).padStart(2,"0"),p=new Date(_calAnio,_calMes,a).getTime()===e.getTime(),g=t[c]||[];f+='<div style="min-height:80px;border:1px solid #f3f4f6;border-radius:10px;padding:6px;background:'+(p?"#fef9f0":"#fff")+";"+(p?"border-color:#FFD166;border-width:2px;":"")+';"><div style="font-size:.75rem;font-weight:'+(p?"800":"600")+";color:"+(p?"#92400e":"#374151")+';margin-bottom:3px;">'+a+(p?" \u{1F4CD}":"")+"</div>"+g.slice(0,3).map(n=>{const x=_esc;return`<div onclick="openPedidoModal('`+n.id+`')" style="font-size:.65rem;background:`+(calcSaldoPendiente(n)>0?"#fef2f2":"#f0fdf4")+";color:"+(calcSaldoPendiente(n)>0?"#991b1b":"#166534")+';border-radius:4px;padding:2px 5px;margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+x(n.cliente)+" \u2014 "+x(n.concepto)+'">'+x(n.folio)+" "+x(n.cliente)+"</div>"}).join("")+(g.length>3?'<div style="font-size:.6rem;color:#9ca3af;text-align:center;">+'+(g.length-3)+" m\xE1s</div>":"")+"</div>"}i.innerHTML='<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><button onclick="_calNavegar(-1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">\u2039</button><h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">'+s[_calMes]+" "+_calAnio+'</h3><button onclick="_calNavegar(1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">\u203A</button></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">'+d.map(a=>'<div style="text-align:center;font-size:.7rem;font-weight:700;color:#9ca3af;padding:4px 0;">'+a+"</div>").join("")+'</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">'+f+'</div><div style="display:flex;gap:12px;margin-top:12px;font-size:.72rem;color:#6b7280;"><span><span style="display:inline-block;width:10px;height:10px;background:#fef2f2;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #fca5a5;"></span>Con saldo pendiente</span><span><span style="display:inline-block;width:10px;height:10px;background:#f0fdf4;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #86efac;"></span>Pagado</span></div></div>'}window.renderCalendarioPedidos=renderCalendarioPedidos;function _calNavegar(i){_calMes+=i,_calMes>11&&(_calMes=0,_calAnio++),_calMes<0&&(_calMes=11,_calAnio--),renderCalendarioPedidos()}window._calNavegar=_calNavegar;function checkAlertasCobro(){const i=document.getElementById("alertaCobro"),e=document.getElementById("alertaCobroLista"),o=document.getElementById("alertaCobroSubtitulo");if(!i||!e)return;const t=new Date;t.setHours(0,0,0,0);const l=(window.pedidos||[]).filter(d=>{if(calcSaldoPendiente(d)<=0||!d.entrega)return!1;const a=new Date(d.entrega+"T00:00:00");return Math.round((a.getTime()-t.getTime())/864e5)<=5}).sort((d,f)=>{const a=new Date(d.entrega+"T00:00:00"),c=new Date(f.entrega+"T00:00:00");return a.getTime()-c.getTime()});if(l.length===0){i.classList.add("hidden");return}i.classList.remove("hidden");const u=l.filter(d=>Math.round((new Date(d.entrega+"T00:00:00").getTime()-t.getTime())/864e5)<0).length;o.textContent=l.length+" pedido"+(l.length>1?"s":"")+" con saldo pendiente"+(u>0?" \xB7 "+u+" vencido"+(u>1?"s":""):"");const s=_esc;e.innerHTML=l.map(d=>{const f=calcSaldoPendiente(d),a=new Date(d.entrega+"T00:00:00"),c=Math.round((a.getTime()-t.getTime())/864e5);let p="";c<0?p='<span style="background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u26D4 Vencido '+Math.abs(c)+"d</span>":c===0?p='<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F534} Hoy</span>':c===1?p='<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F7E0} Ma\xF1ana</span>':p='<span style="background:#fef9f0;color:#78350f;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F7E1} '+c+" d\xEDas</span>";const g=(d.telefono||"").replace(/\D/g,""),n=encodeURIComponent("Hola "+(d.cliente||"")+" \u{1F44B}, te recordamos que tu pedido *"+(d.folio||"")+"* "+(d.concepto?"("+d.concepto+") ":"")+"tiene un saldo pendiente de *$"+f.toFixed(2)+"* con fecha de entrega el *"+(d.entrega||"")+"*. \xA1Cualquier duda estamos para ayudarte! \u{1F431}"),x=g?"https://wa.me/52"+g+"?text="+n:"#";return'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;border-radius:10px;padding:8px 10px;border:1px solid #fecaca;"><div style="display:flex;align-items:center;gap:8px;min-width:0;">'+p+'<div style="min-width:0;"><p style="font-size:.78rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s(d.folio)+" \xB7 "+s(d.cliente)+'</p><p style="font-size:.68rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s(d.concepto||"")+'</p></div></div><div style="display:flex;align-items:center;gap:6px;flex-shrink:0;"><span style="font-size:.78rem;font-weight:800;color:#dc2626;">$'+f.toFixed(2)+"</span>"+(g?'<a href="'+x+'" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:3px;background:#25D366;color:#fff;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;text-decoration:none;">\u{1F4F2} Cobrar</a>':`<button onclick="openPedidoModal('`+d.id+`')" style="background:#e5e7eb;color:#374151;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;border:none;cursor:pointer;">Ver</button>`)+"</div></div>"}).join("")}window.checkAlertasCobro=checkAlertasCobro;function imprimirEtiquetaPedido(i){const e=(window.pedidos||[]).find(c=>c.id===i)||(window.pedidosFinalizados||[]).find(c=>c.id===i);if(!e)return;const o=Array.isArray(e.productosInventario)&&e.productosInventario.length>0?e.productosInventario.map(c=>{const p=c.quantity||c.cantidad||1,g=c.name||c.nombre||c.id||"\u2014",n=Number(c.price||c.precio||0);return p+"x "+g+(n>0?"  $"+n.toFixed(2):"")}).join(`
`):e.concepto||"\u2014",t=Number(e.total||0).toFixed(2),r=Number(e.anticipo||0).toFixed(2),l=calcSaldoPendiente(e).toFixed(2),s=_fechaHoy().split("-").reverse().join("/"),d=c=>String(c||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),f=`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Etiqueta `+d(e.folio||"")+'</title><style>@page{size:10cm 15cm;margin:0;}*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}body{width:10cm;min-height:15cm;padding:10px;background:#fff;}.hdr{border-bottom:2px solid #FFD166;padding-bottom:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;}.brand{font-size:13px;font-weight:900;color:#1a0533;}.folio{font-size:11px;font-weight:800;color:#FFD166;text-align:right;}.row{margin-bottom:6px;}.lbl{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;font-weight:700;}.val{font-size:10px;color:#1a0533;font-weight:600;}.val.big{font-size:13px;font-weight:900;}.prods{background:#faf7f2;border-radius:6px;padding:6px 8px;margin-bottom:6px;}.prods .val{font-size:9px;white-space:pre-line;}.tots{border-top:1.5px dashed #e5e7eb;padding-top:6px;margin-top:4px;}.trow{display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px;color:#374151;}.trow.main{font-size:11px;font-weight:800;color:#1a0533;}.trow.red{color:#dc2626;font-weight:800;}.footer{margin-top:10px;text-align:center;font-size:7.5px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;}.badge{display:inline-block;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700;}</style></head><body><div class="hdr"><div><div class="brand">\u{1F431} Bicho Capricho</div><div style="font-size:8px;color:#6b7280;">Regalos personalizados \xB7 Monterrey</div></div><div><div class="folio">'+d(e.folio||"")+'</div><div style="font-size:8px;color:#9ca3af;text-align:right;">Imp. '+s+'</div></div></div><div class="row"><div class="lbl">Cliente</div><div class="val big">'+d(e.cliente||"\u2014")+"</div>"+(e.telefono?'<div style="font-size:9px;color:#6b7280;">\u{1F4F1} '+d(e.telefono)+"</div>":"")+"</div>"+(e.entrega?'<div class="row"><div class="lbl">Fecha de entrega</div><div class="val big" style="color:#FFD166;">\u{1F4C5} '+d(e.entrega)+"</div></div>":"")+(e.lugarEntrega?'<div class="row"><div class="lbl">Lugar de entrega</div><div class="val">\u{1F4CD} '+d(e.lugarEntrega)+"</div></div>":"")+'<div class="prods"><div class="lbl" style="margin-bottom:3px;">Productos / Concepto</div><div class="val">'+d(o)+"</div></div>"+(e.notas?'<div class="row"><div class="lbl">Notas</div><div class="val" style="font-size:9px;color:#6b7280;">'+d(e.notas)+"</div></div>":"")+'<div class="tots"><div class="trow main"><span>Total</span><span>$'+t+'</span></div><div class="trow"><span>Anticipo recibido</span><span>$'+r+'</span></div><div class="trow red"><span>Saldo pendiente</span><span>$'+l+'</span></div></div><div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;"><span class="badge">'+d(e.status||"Pendiente")+'</span><span style="font-size:7.5px;color:#9ca3af;">Bicho Capricho POS</span></div><div class="footer">\xA1Gracias por tu pedido! \xB7 manekistore.com</div></body></html>',a=window.open("","_blank","width=420,height=620");if(!a){manekiToastExport("\u26A0\uFE0F Activa las ventanas emergentes para imprimir la etiqueta.","warn");return}a.document.write(f),a.document.close(),a.onload=function(){setTimeout(function(){a.focus(),a.print()},200)}}window.imprimirEtiquetaPedido=imprimirEtiquetaPedido;async function verificarEntregasProximas({silencioso:i=!1}={}){const e=window.storeConfig||{},o=e.telegramBotToken;if(!o){console.debug("Telegram: telegramBotToken no configurado, omitiendo recordatorio de entregas.");return}const t=[e.telegramChatId1,e.telegramChatId2].filter(Boolean),r=new Date;r.setHours(0,0,0,0);const l=new Date(r);l.setDate(l.getDate()+1);const u=new Date(r);u.setDate(u.getDate()+2);const s=window.pedidos||[],d=s.filter(n=>{if(!n.entrega||n.status==="cancelado")return!1;const x=new Date(n.entrega+"T00:00:00");return x>=r&&x<=u}),f=s.filter(n=>!n.entrega||n.status==="cancelado"?!1:new Date(n.entrega+"T00:00:00")<r);if(d.length+f.length===0){i||manekiToastExport("\u2705 Sin entregas pendientes en las pr\xF3ximas 48 hrs","ok");return}if(d.length&&manekiToastExport(`\u{1F514} ${d.length} entrega(s) en las pr\xF3ximas 48 hrs`,"warn"),f.length&&manekiToastExport(`\u{1F6A8} ${f.length} entrega(s) VENCIDA(S)`,"err"),!t.length)return;const c=n=>{if(!n)return"\u2014";const[x,m,b]=n.split("-");return`${b}/${m}/${x}`},p=[];f.length&&(p.push(`\u{1F6A8} *VENCIDOS (${f.length}):*`),f.forEach(n=>p.push(`  \u2022 [${n.folio}] ${n.cliente} \u2014 entrega: ${c(n.entrega)} \u2014 ${n.status||"confirmado"}`))),d.length&&(p.push(`\u{1F514} *Pr\xF3ximos 48 hrs (${d.length}):*`),d.forEach(n=>{const x=new Date(n.entrega+"T00:00:00"),m=x.getTime()===r.getTime(),b=x.getTime()===l.getTime(),v=m?"\u{1F534} HOY":b?"\u{1F7E1} Ma\xF1ana":"\u{1F7E2} Pasado ma\xF1ana";p.push(`  \u2022 [${n.folio}] ${n.cliente} \u2014 ${v} (${c(n.entrega)}) \u2014 ${n.status||"confirmado"}`)}));const g=`\u{1F4E6} *Recordatorio de entregas \u2014 Bicho Capricho*

${p.join(`
`)}`;for(const n of t)try{await fetch(`https://api.telegram.org/bot${o}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:n,text:g,parse_mode:"Markdown"})})}catch(x){console.warn("Telegram entrega reminder error:",x)}}window.verificarEntregasProximas=verificarEntregasProximas;function imprimirOrdenProduccion(){const i=["pago","produccion","salida"],e=(window.pedidos||[]).filter(d=>i.includes(d.status||""));if(e.length===0){typeof manekiToastExport=="function"&&manekiToastExport("Sin pedidos en producci\xF3n hoy","warn");return}const o=_fechaHoy(),t=_esc,r=d=>({pago:"\u{1F4B0} Pagado",produccion:"\u{1F527} Producci\xF3n",salida:"\u{1F69A} Sali\xF3"})[d]||d,l=e.map(d=>{const f=(d.productosInventario||[]).map(a=>`<li>${t(a.name||a.concepto||"\u2014")} \xD7 ${a.quantity||1}${a.variante?` <span style="color:#9669c4;">[${t(a.variante)}]</span>`:""}</li>`).join("");return`
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;break-inside:avoid;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                    <span style="font-weight:800;color:#FFD166;font-size:1.1rem;">${t(d.folio)}</span>
                    <span style="margin-left:10px;font-size:.8rem;background:#f3f4f6;padding:2px 8px;border-radius:99px;">${r(d.status)}</span>
                    ${d.ocasion?`<span style="margin-left:6px;font-size:.78rem;background:#f5f3ff;color:#9669c4;padding:2px 8px;border-radius:99px;">${t(d.ocasion)}</span>`:""}
                </div>
                <span style="font-size:.82rem;color:#6b7280;">Entrega: <b>${d.entrega||"\u2014"}</b></span>
            </div>
            <p style="font-weight:700;font-size:.95rem;margin-bottom:4px;">${t(d.cliente)}</p>
            <p style="color:#6b7280;font-size:.82rem;margin-bottom:8px;">${t(d.concepto||"")}</p>
            ${f?`<ul style="margin:0;padding-left:20px;font-size:.82rem;color:#374151;">${f}</ul>`:""}
            ${d.notas?`<p style="margin-top:8px;font-size:.78rem;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;">\u{1F4DD} ${t(d.notas)}</p>`:""}
        </div>`}).join(""),u=`<!DOCTYPE html>
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
${l}
<p style="margin-top:24px;font-size:.75rem;color:#d1d5db;text-align:center;">Bicho Capricho \xB7 generado ${new Date().toLocaleString("es-MX")}</p>
</body></html>`,s=window.open("","_blank");if(!s){typeof manekiToastExport=="function"&&manekiToastExport("Permite ventanas emergentes para imprimir","warn");return}s.document.write(u),s.document.close(),s.focus(),setTimeout(()=>s.print(),600)}window.imprimirOrdenProduccion=imprimirOrdenProduccion,(function(){setTimeout(()=>verificarEntregasProximas({silencioso:!0}),8e3),window._entregasCheckInterval&&clearInterval(window._entregasCheckInterval),window._entregasCheckInterval=setInterval(()=>verificarEntregasProximas({silencioso:!0}),720*60*1e3)})();
//# sourceMappingURL=pedidos-3.js.map
