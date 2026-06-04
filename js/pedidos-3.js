async function imprimirTicketPedido(i){const e=[...window.pedidosFinalizados||[],...window.pedidos||[]].find(x=>String(x.id)===String(i));if(!e)return;let o="";try{const x=new URL("logo.png",window.location.href).href,v=await(await fetch(x)).blob();o=await new Promise(P=>{const h=new FileReader;h.onload=()=>P(h.result),h.readAsDataURL(v)})}catch{}const t=Number(e.total||0),a=Number(e.anticipo||0),s=(e.pagos||[]).reduce((x,w)=>x+Number(w.monto||0),0),g=s>0?s:Number(e.anticipo||0),c=Math.max(0,Number(e.total||0)-g),r=(e.fechaFinalizado||e.fechaPedido||"").split("T")[0]||"\u2014",p=e.entrega||"\u2014",n=(e.productosInventario||[]).filter(x=>x.id!=="libre"),l=n.length>0?n.map(x=>{const w=Number(x.quantity||1),v=Number(x.price||0),P=w*v;let h="";if(x.variante){const y=x.variante.indexOf(":"),$=y!==-1?x.variante.slice(0,y).trim():"",E=y!==-1?x.variante.slice(y+1).trim():x.variante.trim();h=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;">
                    ${$?`<span style="background:#f3f4f6;color:#6b7280;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${$}</span>`:""}
                    <span style="background:#fffbeb;color:#92400e;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${E}</span>
                </div>`}const S=v>0?`$${v.toFixed(2)}`:'<span style="color:#d1d5db;">\u2014</span>',k=v>0?`$${P.toFixed(2)}`:'<span style="color:#d1d5db;">\u2014</span>';return`
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <div style="font-weight:600;color:#1f2937;font-size:13px;">${x.name||"\u2014"}</div>
                    ${h}
                </td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;font-size:13px;vertical-align:middle;">${w}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;color:#6b7280;font-size:13px;vertical-align:middle;">${S}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;color:#1f2937;font-size:13px;vertical-align:middle;">${k}</td>
            </tr>`}).join(""):`<tr><td colspan="4" style="padding:16px 12px;text-align:center;color:#9ca3af;font-style:italic;font-size:13px;">${e.concepto||"Pedido personalizado"}</td></tr>`,f=o?`<img src="${o}" style="height:72px;object-fit:contain;margin-bottom:8px;" alt="Maneki Store">`:'<div style="font-size:2rem;">\u{1F431}</div>',u=typeof window._esc=="function"?window._esc:(x=>String(x||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")),d=e.notas?`
        <div style="margin:20px 0;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
            <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">\u{1F4DD} Notas</div>
            <div style="font-size:12px;color:#78350f;">${u(e.notas)}</div>
        </div>`:"",m=e.lugarEntrega?`
        <div style="margin-top:4px;font-size:11px;color:#9ca3af;">\u{1F4CD} ${u(e.lugarEntrega)}</div>`:"",b=window.open("","_blank","width=480,height=750,scrollbars=yes");if(!b){manekiToastExport("\u26A0\uFE0F El navegador bloque\xF3 la ventana de impresi\xF3n. Permite popups para este sitio.","warn");return}b.document.write(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comprobante ${e.folio} \u2014 Maneki Store</title>
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
    color: #E8B84B;
    letter-spacing: .04em;
    margin-top: 6px;
  }
  .brand-sub {
    font-size: 11px;
    color: rgba(232,184,75,.65);
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
    background: linear-gradient(135deg,#C5A572,#E8B84B);
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
    color: #E8B84B;
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
  .footer strong { color: #C5A572; }
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
    background: linear-gradient(135deg,#C5A572,#E8B84B);
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
    ${f}
    <div class="brand-name">MANEKI STORE</div>
    <div class="brand-sub">Personalizaci\xF3n con amor</div>
  </div>

  <!-- INFO DEL PEDIDO -->
  <div class="info-block">
    <div class="folio-badge">\u2726 ${e.folio}</div>
    <div class="info-grid">
      <div class="info-cell full">
        <div class="info-label">Cliente</div>
        <div class="info-value" style="font-size:15px;">${e.cliente||"\u2014"}</div>
        ${m}
      </div>
      <div class="info-cell">
        <div class="info-label">Fecha</div>
        <div class="info-value">${r}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Entrega</div>
        <div class="info-value" style="color:${p&&p!=="\u2014"&&r&&r!=="\u2014"&&p<r?"#dc2626":"#1f2937"};">${p}</div>
      </div>
      ${e.concepto?`
      <div class="info-cell full">
        <div class="info-label">Concepto</div>
        <div class="info-value" style="font-weight:500;font-size:12px;">${u(e.concepto||"")}</div>
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
    <tbody>${l}</tbody>
  </table>

  <!-- SEPARADOR -->
  <div style="height:16px;"></div>

  <!-- TOTALES -->
  <div class="section-title">Resumen de pago</div>
  <div class="totals">
    <div class="total-row grand">
      <span>Total del pedido</span>
      <span>$${t.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Anticipo recibido</span>
      <span style="color:#16a34a;font-weight:700;">\u2212 $${a.toFixed(2)}</span>
    </div>
    <div class="total-row ${c<=0?"saldo-ok":"saldo-pen"}">
      <span>${c<=0?"\u2705 Pagado completo":"\u23F3 Saldo pendiente"}</span>
      <span>$${Math.max(0,c).toFixed(2)}</span>
    </div>
  </div>

  <!-- NOTAS -->
  ${d?`<div style="padding:0 24px;">${d}</div>`:""}

  <!-- FOOTER -->
  <div class="footer">
    <div style="font-size:18px;margin-bottom:6px;">\u{1F431}</div>
    <div>\xA1Gracias por tu pedido!</div>
    <div style="margin-top:4px;"><strong>manekistore.com.mx</strong></div>
  </div>

  <!-- BOTONES -->
  <div class="actions">
    <button class="btn btn-print" onclick="window.print()">\u{1F5A8}\uFE0F Imprimir / Guardar PDF</button>
    <button class="btn btn-close" onclick="window.close()">\u2715 Cerrar</button>
  </div>

</div>
</body></html>`),b.document.close()}window.imprimirTicketPedido=imprimirTicketPedido,window.openPedidoModal=openPedidoModal,window.closePedidoModal=closePedidoModal,window.openPedidoStatusModal=openPedidoStatusModal,window.closePedidoStatusModal=closePedidoStatusModal,window.setPedidoStatus=setPedidoStatus;function duplicarPedido(i){const e=(window.pedidos||[]).find(s=>String(s.id)===String(i))||(window.pedidosFinalizados||[]).find(s=>String(s.id)===String(i));if(!e)return;const o=mkId(),t=typeof _fechaHoy=="function"?_fechaHoy():(()=>{const s=new Date;return`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`})(),a={...e,id:o,folio:generarFolioPedido(),status:"confirmado",anticipo:0,resta:e.total||0,pagos:[],fechaCreacion:new Date().toISOString(),fechaUltimoEstado:new Date().toISOString(),fechaPedido:t,entrega:"",productosInventario:JSON.parse(JSON.stringify(e.productosInventario||[]))};a.inventarioDescontado=!1,delete a.fechaFinalizado,delete a._inventarioYaFinalizado,delete a.fechaCancelado,a.referenciasUrls=[],a.referenciasPaths=[],delete a.referenciaUrl,delete a.referenciaPath,window.pedidos||(window.pedidos=[]),window.pedidos.push(a),savePedidos(),renderPedidosTable(),updatePedidosStats(),manekiToastExport(`\u2705 Pedido duplicado: ${a.folio} \u2014 recuerda ajustar la fecha de entrega.`,"ok"),setTimeout(()=>{typeof openPedidoModal=="function"&&openPedidoModal(a.id)},400)}window.duplicarPedido=duplicarPedido;async function exportarPedidoPDF(i){const e=[...window.pedidosFinalizados||[],...window.pedidos||[]].find(d=>String(d.id)===String(i));if(!e){manekiToastExport("Pedido no encontrado","warn");return}if(typeof html2pdf>"u"){manekiToastExport("\u23F3 Cargando generador de PDF...","info");try{await new Promise((d,m)=>{const b=document.createElement("script");b.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",b.onload=d,b.onerror=m,document.head.appendChild(b)})}catch{manekiToastExport("\u274C No se pudo cargar el generador PDF","err");return}}let o="";try{const m=await(await fetch(new URL("logo.png",window.location.href).href)).blob();o=await new Promise(b=>{const x=new FileReader;x.onload=()=>b(x.result),x.readAsDataURL(m)})}catch{}const t=Number(e.total||0),a=(e.pagos||[]).reduce((d,m)=>d+Number(m.monto||0),0),s=a>0?a:Number(e.anticipo||0),g=Math.max(0,t-s),c=(e.productosInventario||[]).filter(d=>d.id!=="libre"),r=window.storeConfig?.name||"Maneki Store",p=window.storeConfig?.phone||"",n=typeof _esc=="function"?_esc:(d=>String(d||"").replace(/</g,"&lt;").replace(/>/g,"&gt;")),l=c.length>0?c.map(d=>{const m=Number(d.quantity||1),b=Number(d.price||0);return`<tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${n(d.name||"\u2014")}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;">${m}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;">$${b.toFixed(2)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;font-size:13px;">$${(m*b).toFixed(2)}</td>
            </tr>`}).join(""):`<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af;font-style:italic;">${n(e.concepto||"Pedido personalizado")}</td></tr>`,f=(e.pagos||[]).length>0?`<div style="margin-top:16px;"><h4 style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Historial de pagos</h4>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
            ${(e.pagos||[]).map(d=>`<tr><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${d.fecha||"\u2014"}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${d.tipo||"abono"}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;color:#16a34a;">$${Number(d.monto||0).toFixed(2)}</td></tr>`).join("")}
            </table></div>`:"",u=document.createElement("div");u.style.cssText="width:480px;font-family:Segoe UI,system-ui,sans-serif;background:#fff;",u.innerHTML=`
        <div style="background:linear-gradient(135deg,#1a0533,#2d0a4e);padding:28px 24px;text-align:center;color:white;border-radius:12px 12px 0 0;">
            ${o?`<img src="${o}" style="height:52px;margin-bottom:8px;">`:""}
            <div style="font-size:20px;font-weight:800;color:#E8B84B;">${n(r)}</div>
            ${p?`<div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:4px;">${n(p)}</div>`:""}
        </div>
        <div style="padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <div><span style="font-size:18px;font-weight:800;color:#C5A572;">${n(e.folio||"")}</span></div>
                <div style="text-align:right;">
                    <div style="font-size:11px;color:#9ca3af;">Fecha: ${n(e.fechaPedido||"\u2014")}</div>
                    <div style="font-size:11px;color:#9ca3af;">Entrega: ${n(e.entrega||"\u2014")}</div>
                </div>
            </div>
            <div style="background:#faf9f7;border-radius:10px;padding:14px;margin-bottom:20px;">
                <div style="font-size:14px;font-weight:700;color:#1f2937;">${n(e.cliente||"\u2014")}</div>
                ${e.telefono?`<div style="font-size:12px;color:#6b7280;margin-top:2px;">\u{1F4F1} ${n(e.telefono)}</div>`:""}
                ${e.lugarEntrega?`<div style="font-size:12px;color:#7c3aed;margin-top:2px;">\u{1F4CD} ${n(e.lugarEntrega)}</div>`:""}
            </div>
            ${e.concepto?`<div style="font-size:12px;color:#6b7280;margin-bottom:12px;"><strong>Concepto:</strong> ${n(e.concepto)}</div>`:""}
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#f9fafb;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Producto</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;">Cant</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;">Precio</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;">Subtotal</th>
                </tr></thead>
                <tbody>${l}</tbody>
            </table>
            <div style="margin-top:16px;padding:14px;background:#faf9f7;border-radius:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;color:#374151;">Total</span><span style="font-size:16px;font-weight:900;color:#1f2937;">$${t.toFixed(2)}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:12px;color:#16a34a;">Pagado</span><span style="font-size:13px;font-weight:700;color:#16a34a;">$${s.toFixed(2)}</span></div>
                ${g>0?`<div style="display:flex;justify-content:space-between;padding-top:6px;border-top:2px dashed #fde68a;"><span style="font-size:13px;font-weight:700;color:#dc2626;">Saldo pendiente</span><span style="font-size:15px;font-weight:900;color:#dc2626;">$${g.toFixed(2)}</span></div>`:'<div style="text-align:center;padding-top:6px;color:#16a34a;font-weight:700;font-size:13px;">\u2705 LIQUIDADO</div>'}
            </div>
            ${f}
            ${e.notas?`<div style="margin-top:16px;padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#78350f;"><strong>\u{1F4DD} Notas:</strong> ${n(e.notas)}</div>`:""}
            <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;">
                <p style="font-size:10px;color:#9ca3af;">Documento generado el ${new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</p>
                <p style="font-size:10px;color:#C5A572;font-weight:600;margin-top:4px;">\xA1Gracias por tu preferencia! \u{1F431}</p>
            </div>
        </div>`,document.body.appendChild(u);try{await html2pdf().set({margin:0,filename:`${e.folio||"pedido"}_${n(e.cliente||"").replace(/\s+/g,"_")}.pdf`,image:{type:"jpeg",quality:.95},html2canvas:{scale:2,useCORS:!0},jsPDF:{unit:"mm",format:[120,280],orientation:"portrait"}}).from(u).save(),manekiToastExport("\u{1F4C4} PDF descargado","ok")}catch(d){console.error("PDF error:",d),manekiToastExport("\u274C Error al generar PDF","err")}u.remove()}window.exportarPedidoPDF=exportarPedidoPDF,window.openAbonoPedido=openAbonoPedido,window.cerrarAbonoPedido=cerrarAbonoPedido,window.confirmarAbonoPedido=confirmarAbonoPedido,window.selectAbonoPedidoMethod=selectAbonoPedidoMethod,window.eliminarPedido=eliminarPedido,window.renderPedidosTable=renderPedidosTable,window.renderKanbanBoard=renderKanbanBoard,window.renderTablaPedidos=renderTablaPedidos,window.updatePedidosStats=updatePedidosStats,window.renderHistorialPedidos=renderHistorialPedidos,window.kanbanCardHTML=kanbanCardHTML,window.kanbanDragStart=kanbanDragStart,window.kanbanDragEnd=kanbanDragEnd,window.kanbanDragOver=kanbanDragOver,window.kanbanDragLeave=kanbanDragLeave,window.kanbanDrop=kanbanDrop,window.setVistaPedidos=setVistaPedidos,window.filterPedidos=filterPedidos,window.toggleKanbanCompacto=toggleKanbanCompacto,window.generarFolioPedido=generarFolioPedido,window.openCancelPedidoModal=openCancelPedidoModal,window.closeCancelPedidoModal=closeCancelPedidoModal,window.confirmarCancelPedido=confirmarCancelPedido;function filtrarProductosPedido(){const i=(document.getElementById("pedidoBuscadorProducto")?.value||"").toLowerCase().trim(),e=document.getElementById("pedidoProductoGrid");if(!e)return;const o=(window.products||[]).filter(t=>(!t.tipo||t.tipo==="producto"||t.tipo==="producto_interno"||t.tipo==="pack"||t.tipo==="producto_variable")&&(!i||(t.name||"").toLowerCase().includes(i)||(t.sku||"").toLowerCase().includes(i)));if(!i&&o.length===0){e.classList.add("hidden");return}if(e.classList.remove("hidden"),o.length===0){e.innerHTML='<p class="text-sm text-gray-400 text-center py-2">No se encontraron productos</p>';return}e.innerHTML=o.map(t=>{const a=t.imageUrl?`<img src="${t.imageUrl}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">`:`<span class="text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0">${t.image||"\u{1F4E6}"}</span>`,s=t.tipo==="materia_prima",g=t.tipo==="servicio",c=t.tipo==="producto_variable",r=c?(()=>{const f=(t.tablaPreciosVariable||[]).slice().sort((u,d)=>u.cantidadMin-d.cantidadMin);return f.length?f.map(u=>`${u.cantidadMin}=$${Number(u.precio).toFixed(0)}`).join(" / "):"Precio variable"})():t.price?`$${Number(t.price).toFixed(2)}`:t.cost?`Costo: $${Number(t.cost).toFixed(2)}`:"",p=g?'<span style="font-size:.65rem;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:99px;font-weight:700;">\u2699\uFE0F Serv</span>':s?'<span style="font-size:.65rem;background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:99px;font-weight:700;">MP</span>':c?'<span style="font-size:.65rem;background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:99px;font-weight:700;">\u{1F3AF} Var</span>':'<span style="font-size:.65rem;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;font-weight:700;">PT</span>',l=_variantesPedido(t).length>0?`<span style="font-size:.65rem;color:#6366f1;">\u{1F3A8} ${_variantesPedido(t).length} variantes</span>`:"";return`
            <div onclick="seleccionarProductoPedido('${t.id}')"
                class="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                ${a}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1 flex-wrap">
                        <span class="font-semibold text-sm text-gray-800 truncate">${_esc(t.name||"")}</span>
                        ${p}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-amber-700">${r}</span>
                        ${l}
                    </div>
                </div>
            </div>`}).join("")}window.filtrarProductosPedido=filtrarProductosPedido;function _variantesPedido(i){if(!i)return[];if(Array.isArray(i.mpComponentes)&&i.mpComponentes.length>0)for(const e of i.mpComponentes){const o=(window.products||[]).find(t=>String(t.id)===String(e.id));if(o&&Array.isArray(o.variants)&&o.variants.length>0)return o.variants}return Array.isArray(i.variants)?i.variants:[]}window._variantesPedido=_variantesPedido;function seleccionarProductoPedido(i){const e=(window.products||[]).find(n=>String(n.id)===String(i));if(!e)return;document.getElementById("pedidoProductoSelect").value=i,document.getElementById("pedidoProductoGrid").classList.add("hidden"),document.getElementById("pedidoBuscadorProducto").value="";const o=document.getElementById("pedidoProductoSelRow");o&&o.classList.remove("hidden");const t=document.getElementById("pedidoProductoSelImg");t&&(e.imageUrl?(t.src=e.imageUrl,t.style.display=""):t.style.display="none");const a=document.getElementById("pedidoProductoSelNombre");a&&(a.textContent=e.name);const s=document.getElementById("pedidoProductoSelPrecio");if(s)if(e.tipo==="producto_variable"){const n=(e.tablaPreciosVariable||[]).slice().sort((l,f)=>l.cantidadMin-f.cantidadMin);s.textContent=n.length?n.map(l=>`${l.cantidadMin} pzas=$${Number(l.precio).toFixed(0)}`).join(" \xB7 "):"Precio variable"}else{const n=e.tipo==="materia_prima";s.textContent=e.price?`$${Number(e.price).toFixed(2)}`:n&&e.cost?`Costo: $${Number(e.cost).toFixed(2)}`:""}const g=document.getElementById("pedidoVarianteRow"),c=document.getElementById("pedidoVarianteSelect");if(g&&c){const n=_variantesPedido(e);if(n.length>0){c.innerHTML=n.map(f=>{const u=f.qty!==void 0&&f.qty!==null?` (${f.qty} pzs)`:"",d=typeof _mkColorEmoji=="function"?_mkColorEmoji(f.type,f.value):f.value;return`<option value="${f.type}:${f.value}">${f.type}: ${d}${u}</option>`}).join(""),g.classList.remove("hidden");const l=g.querySelector("label");l&&(l.textContent=e.tipo==="materia_prima"?"\u{1F3A8} Selecciona variante (Talla / Color):":"\u{1F3A8} Variante:")}else g.classList.add("hidden")}const r=document.getElementById("pedidoCosto");r&&e.price&&e.tipo!=="materia_prima"&&(r.value=Number(e.price).toFixed(2));const p=document.getElementById("pedidoProductoPrecio");if(p)if(e.tipo==="producto_variable"&&typeof pvGetPrecio=="function"){const n=parseInt(document.getElementById("pedidoProductoCantidad")?.value)||1;p.value=pvGetPrecio(e,n).toFixed(2),_pvMostrarHint(e,n)}else p.value=e.price?Number(e.price).toFixed(2):"",_pvOcultarHint();typeof _mostrarGaleriaPtEnPedido=="function"&&_mostrarGaleriaPtEnPedido(e),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.seleccionarProductoPedido=seleccionarProductoPedido;function limpiarSeleccionProductoPedido(){document.getElementById("pedidoProductoSelect").value="";const i=document.getElementById("pedidoProductoSelRow");i&&i.classList.add("hidden");const e=document.getElementById("pedidoVarianteRow");e&&e.classList.add("hidden");const o=document.getElementById("pedidoProductoPrecio");o&&(o.value="");const t=document.getElementById("pedidoProductoCantidad");t&&(t.value=1);const a=document.getElementById("pedidoPtGaleriaStrip");a&&(a.innerHTML=""),_pvOcultarHint()}window.limpiarSeleccionProductoPedido=limpiarSeleccionProductoPedido;function _pvMostrarHint(i,e){let o=document.getElementById("pedidoPvHint");if(!o){const c=document.getElementById("pedidoProductoSelRow");if(!c)return;o=document.createElement("div"),o.id="pedidoPvHint",o.style.cssText="font-size:.75rem;color:#0369a1;background:#e0f2fe;border-radius:8px;padding:5px 10px;margin-top:6px;",c.appendChild(o)}const t=(i.tablaPreciosVariable||[]).slice().sort((c,r)=>c.cantidadMin-r.cantidadMin);if(!t.length){o.style.display="none";return}let a=t[0];for(const c of t)if(e>=c.cantidadMin)a=c;else break;const s=a.precio/(a.cantidadMin||1),g=s*e;o.style.display="",o.innerHTML=`\u{1F3AF} Rango: <b>${a.cantidadMin}+ pzas</b> \u2192 <b>$${s.toFixed(2)}/pza</b> &nbsp;|&nbsp; Total: <b style="color:#059669">$${g.toFixed(2)}</b>`}window._pvMostrarHint=_pvMostrarHint;function _pvOcultarHint(){const i=document.getElementById("pedidoPvHint");i&&(i.style.display="none")}window._pvOcultarHint=_pvOcultarHint;function _pvCantidadChange(i){const e=document.getElementById("pedidoProductoSelect")?.value;if(!e)return;const o=(window.products||[]).find(g=>String(g.id)===String(e));if(!o||o.tipo!=="producto_variable")return;const t=parseInt(i)||1,a=typeof pvGetPrecio=="function"?pvGetPrecio(o,t):0,s=document.getElementById("pedidoProductoPrecio");s&&(s.value=a.toFixed(2)),_pvMostrarHint(o,t)}window._pvCantidadChange=_pvCantidadChange;function agregarProductoPedido(){const i=document.getElementById("pedidoProductoSelect")?.value;if(!i){manekiToastExport("\u26A0\uFE0F Selecciona un producto primero","warn");return}const e=(window.products||[]).find(n=>String(n.id)===String(i));if(!e)return;const o=parseInt(document.getElementById("pedidoProductoCantidad")?.value)||1,t=document.getElementById("pedidoProductoPrecio"),a=t&&t.value!==""?parseFloat(t.value):null;let s;e.tipo==="producto_variable"&&typeof pvGetPrecio=="function"?s=pvGetPrecio(e,o):s=a!==null?a:parseFloat(e.price)||0;const g=document.getElementById("pedidoVarianteSelect"),c=_variantesPedido(e).length>0,r=g&&c&&!document.getElementById("pedidoVarianteRow")?.classList.contains("hidden")?g.value:null;if(c&&!r){manekiToastExport("\u26A0\uFE0F Este producto tiene variantes. Selecciona una.","warn");return}window.pedidoProductosSeleccionados=window.pedidoProductosSeleccionados||[];const p=window.pedidoProductosSeleccionados.find(n=>n.id===i&&n.variante===r);if(p?p.quantity=(p.quantity||1)+o:window.pedidoProductosSeleccionados.push({id:i,name:e.name,price:s,quantity:o,variante:r}),e.tipo==="producto_variable"){const n=e.rendimientoPorHoja||0;if(n>0&&Array.isArray(e.mpComponentes)&&e.mpComponentes.length){const l=Math.ceil(o/n),f=(window.products||[]).find(u=>String(u.id)===String(e.mpComponentes[0].id));if(f){const u=typeof getStockEfectivo=="function"?getStockEfectivo(f):f.stock||0;l>u&&manekiToastExport(`\u26A0\uFE0F Necesitas ${l} hojas pero solo hay ${u} de "${f.name}"`,"warn")}}}else{const n=typeof getStockEfectivo=="function"?getStockEfectivo(e):e.stock||0;n<o&&manekiToastExport(`\u26A0\uFE0F "${e.name||e.nombre}" tiene solo ${n} en stock`,"warn")}renderPedidoProductosList(),limpiarSeleccionProductoPedido()}window.agregarProductoPedido=agregarProductoPedido;function renderPedidoProductosList(){const i=document.getElementById("pedidoProductosList");if(!i)return;const e=window.pedidoProductosSeleccionados||[];if(!e.length){i.innerHTML="";return}const o=e.reduce((t,a)=>t+(parseFloat(a.price)||0)*(a.quantity||1),0);i.innerHTML=e.map((t,a)=>{const s=parseFloat(t.price)||0,g=s*(t.quantity||1);return`
        <div class="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-sm">
            <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-800 truncate">${_esc(t.name||"")}${t.variante?` <span class="text-xs text-purple-600 font-semibold">(${(()=>{const c=t.variante.indexOf(":");if(c===-1)return _esc(t.variante);const r=t.variante.slice(0,c).trim(),p=t.variante.slice(c+1).trim();return _esc(r)+": "+(typeof _mkColorDot=="function"?_mkColorDot(r,p):_esc(p))})()})</span>`:""}</div>
                <div class="flex items-center gap-1 mt-1">
                    <span class="text-xs text-gray-500">\xD7</span>
                    <input type="number" min="1" value="${t.quantity||1}"
                        oninput="(function(el,idx){var v=parseInt(el.value)||1;var it=window.pedidoProductosSeleccionados&&window.pedidoProductosSeleccionados[idx];if(it){it.quantity=v;var pr=(window.products||[]).find(function(x){return String(x.id)===String(it.id);});if(pr&&pr.tipo==='producto_variable'&&typeof pvGetPrecio==='function'){it.price=pvGetPrecio(pr,v);renderPedidoProductosList();return;}}if(typeof calcPedidoTotal==='function')calcPedidoTotal();})(this,${a})"
                        onchange="editarCantidadPedidoProducto(${a}, this.value)"
                        class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 outline-none">
                    <span class="text-xs text-gray-500">a $</span>
                    <input type="number" step="0.01" min="0" value="${s.toFixed(2)}"
                        oninput="(function(el,idx){var v=parseFloat(el.value);if(!isNaN(v)&&window.pedidoProductosSeleccionados&&window.pedidoProductosSeleccionados[idx]!=null){window.pedidoProductosSeleccionados[idx].price=v;}if(typeof calcPedidoTotal==='function')calcPedidoTotal();})(this,${a})"
                        onchange="editarPrecioPedidoProducto(${a}, this.value)"
                        class="w-20 px-2 py-0.5 border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 outline-none" style="background:#fffbeb">
                    <span class="text-xs text-gray-400">= <span class="font-semibold text-gray-700">$${g.toFixed(2)}</span></span>
                </div>
            </div>
            <button onclick="quitarProductoPedido(${a})" class="text-gray-400 hover:text-red-400 text-base flex-shrink-0">\u2715</button>
        </div>`}).join("")+`
        <div class="flex justify-end px-3 pt-1 pb-0.5 text-xs font-bold text-gray-700">
            Subtotal productos: <span class="ml-1 text-amber-700">$${o.toFixed(2)}</span>
        </div>`,typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.renderPedidoProductosList=renderPedidoProductosList;function poblarSelectEmpaquesPedido(){const i=document.getElementById("pedidoEmpaquesSelect");if(!i)return;const e=(window.products||[]).filter(o=>(o.tags||[]).some(t=>t.toLowerCase()==="empaques"||t.toLowerCase()==="empaque"));i.innerHTML='<option value="">\u2014 Seleccionar empaque \u2014</option>'+e.map(o=>{const t=typeof getStockEfectivo=="function"?getStockEfectivo(o):o.stock||0;return`<option value="${o.id}">${_esc(o.name||"")} (Stock: ${t})</option>`}).join("")}window.poblarSelectEmpaquesPedido=poblarSelectEmpaquesPedido;function agregarEmpaquePedido(){const i=document.getElementById("pedidoEmpaquesSelect"),e=document.getElementById("pedidoEmpaquesCantidad");if(!i||!i.value)return;const o=(window.products||[]).find(s=>String(s.id)===i.value);if(!o)return;const t=parseInt(e?.value)||1;window.pedidoEmpaquesSeleccionados||(window.pedidoEmpaquesSeleccionados=[]);const a=window.pedidoEmpaquesSeleccionados.find(s=>String(s.id)===String(o.id));a?a.quantity+=t:window.pedidoEmpaquesSeleccionados.push({id:o.id,name:o.name,quantity:t}),e&&(e.value=1),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.agregarEmpaquePedido=agregarEmpaquePedido;function renderPedidoEmpaquesList(){const i=document.getElementById("pedidoEmpaquesList");if(!i)return;const e=window.pedidoEmpaquesSeleccionados||[];if(!e.length){i.innerHTML="";return}i.innerHTML=e.map((o,t)=>{const a=(window.products||[]).find(c=>String(c.id)===String(o.id)),s=parseFloat(a?.cost||0),g=(s*(o.quantity||1)).toFixed(2);return`
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-lg text-sm">
            <span class="flex-1 text-gray-700">\u{1F4E6} ${o.name}</span>
            <span class="text-xs text-gray-400">$${s.toFixed(2)}c/u = <span class="font-semibold text-gray-600">$${g}</span></span>
            <input type="number" min="1" value="${o.quantity}"
                onchange="editarCantidadEmpaquePedido(${t}, this.value)"
                class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs text-center outline-none">
            <button onclick="quitarEmpaquePedido(${t})" class="text-gray-400 hover:text-red-400 text-sm">\u2715</button>
        </div>`}).join("")}window.renderPedidoEmpaquesList=renderPedidoEmpaquesList;function quitarEmpaquePedido(i){(window.pedidoEmpaquesSeleccionados||[]).splice(i,1),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.quitarEmpaquePedido=quitarEmpaquePedido;function editarCantidadEmpaquePedido(i,e){const o=parseInt(e)||1;window.pedidoEmpaquesSeleccionados&&window.pedidoEmpaquesSeleccionados[i]!=null&&(window.pedidoEmpaquesSeleccionados[i].quantity=o),renderPedidoEmpaquesList(),typeof calcPedidoTotal=="function"&&calcPedidoTotal()}window.editarCantidadEmpaquePedido=editarCantidadEmpaquePedido;function quitarProductoPedido(i){(window.pedidoProductosSeleccionados||[]).splice(i,1),renderPedidoProductosList()}window.quitarProductoPedido=quitarProductoPedido;function editarPrecioPedidoProducto(i,e){const o=window.pedidoProductosSeleccionados||[];o[i]!==void 0&&(o[i].price=parseFloat(e)||0,renderPedidoProductosList())}window.editarPrecioPedidoProducto=editarPrecioPedidoProducto;function editarCantidadPedidoProducto(i,e){const o=window.pedidoProductosSeleccionados||[];if(o[i]!==void 0){const t=parseInt(e)||1;o[i].quantity=t;const a=(window.products||[]).find(s=>String(s.id)===String(o[i].id));a&&a.tipo==="producto_variable"&&typeof pvGetPrecio=="function"&&(o[i].price=pvGetPrecio(a,t)),renderPedidoProductosList()}}window.editarCantidadPedidoProducto=editarCantidadPedidoProducto;function generarTicketPedido(i){const e=[...window.pedidos||[],...window.pedidosFinalizados||[]].find(n=>String(n.id)===String(i));if(!e)return;const o=window.storeConfig||{},t=n=>String(n||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;"),a=n=>n?new Date(n).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}):"\u2014",s=e.productosInventario||[],g=s.length>0?s.map(n=>"<tr><td>"+t(n.name||n.nombre||"\u2014")+'</td><td style="text-align:center">'+(n.quantity||n.cantidad||1)+'</td><td style="text-align:right">$'+Number(n.price||0).toFixed(2)+'</td><td style="text-align:right">$'+(Number(n.price||0)*(n.quantity||n.cantidad||1)).toFixed(2)+"</td></tr>").join(""):'<tr><td colspan="4" style="color:#6b7280;font-style:italic;">'+t(e.concepto||"Sin detalle")+"</td></tr>",c=o.logoMode==="image"&&o.logo?'<img src="'+o.logo+'" style="width:60px;height:60px;object-fit:contain;border-radius:10px;">':t(o.emoji||"\u{1F431}"),r='<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ticket '+t(e.folio||"")+'</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:"Helvetica Neue",Arial,sans-serif;padding:32px;max-width:480px;margin:auto;color:#1a1a1a;}.logo{text-align:center;font-size:2.5rem;margin-bottom:4px;}.tienda{text-align:center;font-size:1.3rem;font-weight:800;color:#1a0533;}.slogan{text-align:center;font-size:.8rem;color:#6b7280;margin-bottom:4px;}.contacto{text-align:center;font-size:.75rem;color:#9ca3af;margin-bottom:12px;}.folio-badge{background:#f5ede0;border:1.5px solid #C5A572;border-radius:8px;padding:6px 16px;text-align:center;font-weight:800;color:#92400e;font-size:.9rem;margin-bottom:16px;}.divider{border:none;border-top:1.5px dashed #e5e7eb;margin:12px 0;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}.info-item label{display:block;font-size:.7rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;}.info-item span{font-size:.85rem;font-weight:600;}table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.82rem;}th{background:#f9f5ef;padding:7px 10px;text-align:left;font-weight:700;font-size:.72rem;text-transform:uppercase;color:#92400e;}td{padding:6px 10px;border-bottom:1px solid #f3f4f6;}.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem;color:#374151;}.total-final{display:flex;justify-content:space-between;padding:10px 0;font-size:1.1rem;font-weight:800;border-top:2px solid #C5A572;color:#1a0533;margin-top:4px;}.saldo-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#dc2626;}.pagado-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#16a34a;}.notas{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:.8rem;color:#374151;}.footer{text-align:center;font-size:.75rem;color:#9ca3af;margin-top:16px;line-height:1.6;}@media print{body{padding:12px;}.no-print{display:none!important;}}</style></head><body><div class="logo">'+c+'</div><div class="tienda">'+t(o.name||"Maneki Store")+'</div><div class="slogan">'+t(o.slogan||"Regalos Personalizados")+'</div><div class="contacto">'+(o.phone?"\u{1F4F1} "+t(o.phone):"")+(o.phone&&o.facebook?" \xB7 ":"")+(o.facebook?"\u{1F4D8} "+t(o.facebook):"")+'</div><div class="folio-badge">\u{1F4CB} Pedido '+t(e.folio||"\u2014")+'</div><hr class="divider"><div class="info-grid"><div class="info-item"><label>Cliente</label><span>'+t(e.cliente||"\u2014")+'</span></div><div class="info-item"><label>Tel\xE9fono</label><span>'+t(e.telefono||e.whatsapp||"\u2014")+'</span></div><div class="info-item"><label>Fecha del pedido</label><span>'+a(e.fechaPedido)+'</span></div><div class="info-item"><label>Fecha de entrega</label><span>'+a(e.entrega)+"</span></div>"+(e.lugarEntrega?'<div class="info-item" style="grid-column:1/-1"><label>Lugar de entrega</label><span>'+t(e.lugarEntrega)+"</span></div>":"")+'</div><hr class="divider"><div style="font-size:.75rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Concepto</div><div style="font-size:.85rem;color:#374151;margin-bottom:12px;">'+t(e.concepto||"\u2014")+'</div><table><thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Total</th></tr></thead><tbody>'+g+'</tbody></table><hr class="divider"><div class="total-final"><span>Total del pedido</span><span>$'+Number(e.total||0).toFixed(2)+'</span></div><div class="total-row"><span>Anticipo recibido</span><span style="color:#16a34a;font-weight:700;">\u2014 $'+Number(e.anticipo||0).toFixed(2)+"</span></div>"+(calcSaldoPendiente(e)>0?'<div class="saldo-row"><span>\u{1F4B0} Saldo pendiente</span><span>$'+calcSaldoPendiente(e).toFixed(2)+"</span></div>":'<div class="pagado-row"><span>\u2705 Liquidado</span><span>$0.00</span></div>')+(e.notas?'<div class="notas"><b>Notas:</b> '+t(e.notas)+"</div>":"")+'<hr class="divider"><div class="footer">'+t(o.footer||"\xA1Gracias por tu compra!")+"<br>"+(o.facebook?t(o.facebook)+"<br>":"")+'<span style="color:#C5A572;font-weight:700;">\u2728 Maneki Store</span></div><div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:10px 16px;display:flex;gap:8px;"><button onclick="window.print()" style="flex:1;padding:10px;background:#C5A572;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.9rem;">\u{1F5A8}\uFE0F Imprimir / Guardar PDF</button><button onclick="window.close()" style="padding:10px 16px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;">\u2715 Cerrar</button></div><div style="height:64px;"></div></body></html>',p=window.open("","_blank","width=540,height=780");if(!p){manekiToastExport("Permite ventanas emergentes para ver el ticket","warn");return}p.document.write(r),p.document.close(),p.focus()}window.generarTicketPedido=generarTicketPedido;function _mostrarGaleriaPtEnPedido(i){let e=document.getElementById("pedidoPtGaleriaStrip");if(!e){e=document.createElement("div"),e.id="pedidoPtGaleriaStrip",e.style.cssText="margin-top:8px;";const a=document.getElementById("pedidoProductoSelRow");a&&a.appendChild(e),e.addEventListener("click",function(s){const g=s.target.closest("img[data-foto-url]");if(!g)return;const c=g.dataset.fotoUrl;c&&window.open(c,"_blank","noopener,noreferrer")})}const o=Array.isArray(i.imageUrls)&&i.imageUrls.length>0?i.imageUrls:i.imageUrl?[i.imageUrl]:[];if(o.length===0){e.innerHTML="";return}const t=typeof _esc=="function"?_esc:a=>String(a||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");e.innerHTML='<div style="font-size:.72rem;color:#92400e;font-weight:700;margin-bottom:6px;">\u{1F5BC}\uFE0F Fotos del producto ('+o.length+')</div><div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">'+o.map(a=>'<img src="'+t(a)+'" data-foto-url="'+t(a)+'" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1.5px solid #e5e7eb;flex-shrink:0;cursor:pointer;" title="Ver foto completa">').join("")+"</div>"}window._mostrarGaleriaPtEnPedido=_mostrarGaleriaPtEnPedido;let _calMes=new Date().getMonth(),_calAnio=new Date().getFullYear();function renderCalendarioPedidos(){const i=document.getElementById("vistaCalendario");if(!i)return;const e=new Date;e.setHours(0,0,0,0);const o=window.pedidos||[],t={};o.forEach(n=>{if(!n.entrega)return;const l=n.entrega.substring(0,10);t[l]||(t[l]=[]),t[l].push(n)});const a=new Date(_calAnio,_calMes,1),s=new Date(_calAnio,_calMes+1,0),g=a.getDay(),c=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],r=["Dom","Lun","Mar","Mi\xE9","Jue","Vie","S\xE1b"];let p="";for(let n=0;n<g;n++)p+="<div></div>";for(let n=1;n<=s.getDate();n++){const l=_calAnio+"-"+String(_calMes+1).padStart(2,"0")+"-"+String(n).padStart(2,"0"),f=new Date(_calAnio,_calMes,n).getTime()===e.getTime(),u=t[l]||[];p+='<div style="min-height:80px;border:1px solid #f3f4f6;border-radius:10px;padding:6px;background:'+(f?"#fef9f0":"#fff")+";"+(f?"border-color:#C5A572;border-width:2px;":"")+';"><div style="font-size:.75rem;font-weight:'+(f?"800":"600")+";color:"+(f?"#92400e":"#374151")+';margin-bottom:3px;">'+n+(f?" \u{1F4CD}":"")+"</div>"+u.slice(0,3).map(d=>{var m=typeof _esc=="function"?_esc:function(b){return String(b||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};return`<div onclick="openPedidoModal('`+d.id+`')" style="font-size:.65rem;background:`+(calcSaldoPendiente(d)>0?"#fef2f2":"#f0fdf4")+";color:"+(calcSaldoPendiente(d)>0?"#991b1b":"#166534")+';border-radius:4px;padding:2px 5px;margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+m(d.cliente)+" \u2014 "+m(d.concepto)+'">'+m(d.folio)+" "+m(d.cliente)+"</div>"}).join("")+(u.length>3?'<div style="font-size:.6rem;color:#9ca3af;text-align:center;">+'+(u.length-3)+" m\xE1s</div>":"")+"</div>"}i.innerHTML='<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><button onclick="_calNavegar(-1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">\u2039</button><h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">'+c[_calMes]+" "+_calAnio+'</h3><button onclick="_calNavegar(1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">\u203A</button></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">'+r.map(n=>'<div style="text-align:center;font-size:.7rem;font-weight:700;color:#9ca3af;padding:4px 0;">'+n+"</div>").join("")+'</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">'+p+'</div><div style="display:flex;gap:12px;margin-top:12px;font-size:.72rem;color:#6b7280;"><span><span style="display:inline-block;width:10px;height:10px;background:#fef2f2;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #fca5a5;"></span>Con saldo pendiente</span><span><span style="display:inline-block;width:10px;height:10px;background:#f0fdf4;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #86efac;"></span>Pagado</span></div></div>'}window.renderCalendarioPedidos=renderCalendarioPedidos;function _calNavegar(i){_calMes+=i,_calMes>11&&(_calMes=0,_calAnio++),_calMes<0&&(_calMes=11,_calAnio--),renderCalendarioPedidos()}window._calNavegar=_calNavegar;function checkAlertasCobro(){const i=document.getElementById("alertaCobro"),e=document.getElementById("alertaCobroLista"),o=document.getElementById("alertaCobroSubtitulo");if(!i||!e)return;const t=new Date;t.setHours(0,0,0,0);const s=(window.pedidos||[]).filter(r=>{if(calcSaldoPendiente(r)<=0||!r.entrega)return!1;const n=new Date(r.entrega+"T00:00:00");return Math.round((n-t)/864e5)<=5}).sort((r,p)=>{const n=new Date(r.entrega+"T00:00:00"),l=new Date(p.entrega+"T00:00:00");return n-l});if(s.length===0){i.classList.add("hidden");return}i.classList.remove("hidden");const g=s.filter(r=>Math.round((new Date(r.entrega+"T00:00:00")-t)/864e5)<0).length;o.textContent=s.length+" pedido"+(s.length>1?"s":"")+" con saldo pendiente"+(g>0?" \xB7 "+g+" vencido"+(g>1?"s":""):"");const c=window._esc||(r=>String(r||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;"));e.innerHTML=s.map(r=>{const p=calcSaldoPendiente(r),n=new Date(r.entrega+"T00:00:00"),l=Math.round((n-t)/864e5);let f="";l<0?f='<span style="background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u26D4 Vencido '+Math.abs(l)+"d</span>":l===0?f='<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F534} Hoy</span>':l===1?f='<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F7E0} Ma\xF1ana</span>':f='<span style="background:#fef9f0;color:#78350f;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u{1F7E1} '+l+" d\xEDas</span>";const u=(r.telefono||"").replace(/\D/g,""),d=encodeURIComponent("Hola "+(r.cliente||"")+" \u{1F44B}, te recordamos que tu pedido *"+(r.folio||"")+"* "+(r.concepto?"("+r.concepto+") ":"")+"tiene un saldo pendiente de *$"+p.toFixed(2)+"* con fecha de entrega el *"+(r.entrega||"")+"*. \xA1Cualquier duda estamos para ayudarte! \u{1F431}"),m=u?"https://wa.me/52"+u+"?text="+d:"#";return'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;border-radius:10px;padding:8px 10px;border:1px solid #fecaca;"><div style="display:flex;align-items:center;gap:8px;min-width:0;">'+f+'<div style="min-width:0;"><p style="font-size:.78rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+c(r.folio)+" \xB7 "+c(r.cliente)+'</p><p style="font-size:.68rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+c(r.concepto||"")+'</p></div></div><div style="display:flex;align-items:center;gap:6px;flex-shrink:0;"><span style="font-size:.78rem;font-weight:800;color:#dc2626;">$'+p.toFixed(2)+"</span>"+(u?'<a href="'+m+'" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:3px;background:#25D366;color:#fff;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;text-decoration:none;">\u{1F4F2} Cobrar</a>':`<button onclick="openPedidoModal('`+r.id+`')" style="background:#e5e7eb;color:#374151;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;border:none;cursor:pointer;">Ver</button>`)+"</div></div>"}).join("")}window.checkAlertasCobro=checkAlertasCobro;function imprimirEtiquetaPedido(i){const e=(window.pedidos||[]).find(l=>l.id===i)||(window.pedidosFinalizados||[]).find(l=>l.id===i);if(!e)return;const o=Array.isArray(e.productosInventario)&&e.productosInventario.length>0?e.productosInventario.map(l=>{const f=l.quantity||l.cantidad||1,u=l.name||l.nombre||l.id||"\u2014",d=Number(l.price||l.precio||0);return f+"x "+u+(d>0?"  $"+d.toFixed(2):"")}).join(`
`):e.concepto||"\u2014",t=Number(e.total||0).toFixed(2),a=Number(e.anticipo||0).toFixed(2),s=calcSaldoPendiente(e).toFixed(2),c=(typeof _fechaHoy=="function"?_fechaHoy():(()=>{const l=new Date;return l.getFullYear()+"-"+String(l.getMonth()+1).padStart(2,"0")+"-"+String(l.getDate()).padStart(2,"0")})()).split("-").reverse().join("/"),r=l=>String(l||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),p=`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Etiqueta `+r(e.folio||"")+'</title><style>@page{size:10cm 15cm;margin:0;}*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}body{width:10cm;min-height:15cm;padding:10px;background:#fff;}.hdr{border-bottom:2px solid #C5A572;padding-bottom:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;}.brand{font-size:13px;font-weight:900;color:#1a0533;}.folio{font-size:11px;font-weight:800;color:#C5A572;text-align:right;}.row{margin-bottom:6px;}.lbl{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;font-weight:700;}.val{font-size:10px;color:#1a0533;font-weight:600;}.val.big{font-size:13px;font-weight:900;}.prods{background:#faf7f2;border-radius:6px;padding:6px 8px;margin-bottom:6px;}.prods .val{font-size:9px;white-space:pre-line;}.tots{border-top:1.5px dashed #e5e7eb;padding-top:6px;margin-top:4px;}.trow{display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px;color:#374151;}.trow.main{font-size:11px;font-weight:800;color:#1a0533;}.trow.red{color:#dc2626;font-weight:800;}.footer{margin-top:10px;text-align:center;font-size:7.5px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;}.badge{display:inline-block;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700;}</style></head><body><div class="hdr"><div><div class="brand">\u{1F431} Maneki Store</div><div style="font-size:8px;color:#6b7280;">Regalos personalizados \xB7 Monterrey</div></div><div><div class="folio">'+r(e.folio||"")+'</div><div style="font-size:8px;color:#9ca3af;text-align:right;">Imp. '+c+'</div></div></div><div class="row"><div class="lbl">Cliente</div><div class="val big">'+r(e.cliente||"\u2014")+"</div>"+(e.telefono?'<div style="font-size:9px;color:#6b7280;">\u{1F4F1} '+r(e.telefono)+"</div>":"")+"</div>"+(e.entrega?'<div class="row"><div class="lbl">Fecha de entrega</div><div class="val big" style="color:#C5A572;">\u{1F4C5} '+r(e.entrega)+"</div></div>":"")+(e.lugarEntrega?'<div class="row"><div class="lbl">Lugar de entrega</div><div class="val">\u{1F4CD} '+r(e.lugarEntrega)+"</div></div>":"")+'<div class="prods"><div class="lbl" style="margin-bottom:3px;">Productos / Concepto</div><div class="val">'+r(o)+"</div></div>"+(e.notas?'<div class="row"><div class="lbl">Notas</div><div class="val" style="font-size:9px;color:#6b7280;">'+r(e.notas)+"</div></div>":"")+'<div class="tots"><div class="trow main"><span>Total</span><span>$'+t+'</span></div><div class="trow"><span>Anticipo recibido</span><span>$'+a+'</span></div><div class="trow red"><span>Saldo pendiente</span><span>$'+s+'</span></div></div><div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;"><span class="badge">'+r(e.status||"Pendiente")+'</span><span style="font-size:7.5px;color:#9ca3af;">Maneki POS</span></div><div class="footer">\xA1Gracias por tu pedido! \xB7 manekistore.com</div></body></html>',n=window.open("","_blank","width=420,height=620");if(!n){manekiToastExport("\u26A0\uFE0F Activa las ventanas emergentes para imprimir la etiqueta.","warn");return}n.document.write(p),n.document.close(),n.onload=function(){setTimeout(function(){n.focus(),n.print()},200)}}window.imprimirEtiquetaPedido=imprimirEtiquetaPedido;async function verificarEntregasProximas({silencioso:i=!1}={}){const e=window.storeConfig||{},o=e.telegramBotToken;if(!o){console.debug("Telegram: telegramBotToken no configurado, omitiendo recordatorio de entregas.");return}const t=[e.telegramChatId1,e.telegramChatId2].filter(Boolean),a=new Date;a.setHours(0,0,0,0);const s=new Date(a);s.setDate(s.getDate()+1);const g=new Date(a);g.setDate(g.getDate()+2);const c=window.pedidos||[],r=c.filter(d=>{if(!d.entrega||d.status==="cancelado")return!1;const m=new Date(d.entrega+"T00:00:00");return m>=a&&m<=g}),p=c.filter(d=>!d.entrega||d.status==="cancelado"?!1:new Date(d.entrega+"T00:00:00")<a);if(r.length+p.length===0){i||manekiToastExport("\u2705 Sin entregas pendientes en las pr\xF3ximas 48 hrs","ok");return}if(r.length&&manekiToastExport(`\u{1F514} ${r.length} entrega(s) en las pr\xF3ximas 48 hrs`,"warn"),p.length&&manekiToastExport(`\u{1F6A8} ${p.length} entrega(s) VENCIDA(S)`,"err"),!t.length)return;const l=d=>{if(!d)return"\u2014";const[m,b,x]=d.split("-");return`${x}/${b}/${m}`},f=[];p.length&&(f.push(`\u{1F6A8} *VENCIDOS (${p.length}):*`),p.forEach(d=>f.push(`  \u2022 [${d.folio}] ${d.cliente} \u2014 entrega: ${l(d.entrega)} \u2014 ${d.status||"confirmado"}`))),r.length&&(f.push(`\u{1F514} *Pr\xF3ximos 48 hrs (${r.length}):*`),r.forEach(d=>{const m=new Date(d.entrega+"T00:00:00"),b=m.getTime()===a.getTime(),x=m.getTime()===s.getTime(),w=b?"\u{1F534} HOY":x?"\u{1F7E1} Ma\xF1ana":"\u{1F7E2} Pasado ma\xF1ana";f.push(`  \u2022 [${d.folio}] ${d.cliente} \u2014 ${w} (${l(d.entrega)}) \u2014 ${d.status||"confirmado"}`)}));const u=`\u{1F4E6} *Recordatorio de entregas \u2014 Maneki Store*

${f.join(`
`)}`;for(const d of t)try{await fetch(`https://api.telegram.org/bot${o}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:d,text:u,parse_mode:"Markdown"})})}catch(m){console.warn("Telegram entrega reminder error:",m)}}window.verificarEntregasProximas=verificarEntregasProximas,(function(){setTimeout(()=>verificarEntregasProximas({silencioso:!0}),8e3),window._entregasCheckInterval&&clearInterval(window._entregasCheckInterval),window._entregasCheckInterval=setInterval(()=>verificarEntregasProximas({silencioso:!0}),720*60*1e3)})();
//# sourceMappingURL=pedidos-3.js.map
