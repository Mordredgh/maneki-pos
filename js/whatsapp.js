"use strict";let _waPedidoActual=null;function _wa(o){return o?String(o).replace(/[*_~`|]/g,"").trim():""}const _WA_PROMOS=["\u{1F381} Tenemos regalos \xFAnicos para cada ocasi\xF3n, \xA1cu\xE9ntanos qu\xE9 necesitas!","\u2B50 \xBFTe gust\xF3 tu pedido? \xA1Una rese\xF1a nos ayuda mucho a crecer!","\u{1F46F} Refiere a un amigo y obt\xE9n un detalle especial en tu pr\xF3ximo pedido.","\u{1F3A8} \xBFSab\xEDas que personalizamos casi cualquier cosa? \xA1Escr\xEDbenos sin compromiso!","\u{1F6CD}\uFE0F Mira todo nuestro cat\xE1logo en: www.manekistore.com.mx"],_WA_FB="facebook.com/ManekiPrints";function _waFooter(){const o="maneki_wa_promo_idx",t=(parseInt(localStorage.getItem(o)||"-1")+1)%_WA_PROMOS.length;return localStorage.setItem(o,t),`
${_WA_PROMOS[t]}
\u{1F4D8} S\xEDguenos: ${_WA_FB}`}function _waMensajes(o){const e=_wa(o.cliente||"cliente"),t=_wa(o.folio||"\u2014"),n=_wa(o.concepto||"\u2014"),a=_wa(o.entrega||"por confirmar"),c=Number(o.total||0),d=Number(o.anticipo||0),l=(o.pagos||[]).reduce((s,$)=>s+Number($.monto||0),0),r=l>0?Math.max(0,c-l):typeof window.calcSaldoPendiente=="function"?window.calcSaldoPendiente(o):Math.max(0,c-d);let u="";o.productosInventario&&o.productosInventario.length>0&&(u=`
\u{1F6CD}\uFE0F Productos:
`+o.productosInventario.map(s=>`   \u2022 ${_wa(s.name||s.nombre||"")}${s.quantity?" x"+s.quantity:""} \u2014 $${Number(s.price||s.precio||0).toFixed(2)}`).join(`
`)+`
`);const m=r>0?`\u{1F4B3} Saldo pendiente: *$${r.toFixed(2)}*`:"\u2705 Pedido *liquidado*",p=o.notas?`
\u{1F4DD} `+_wa(o.notas):"",i=o._waFooterCached||_waFooter(),g=o.pagos&&o.pagos.length>0?o.pagos[o.pagos.length-1]:null,f=g?Number(g.monto||0):d;return{confirmacion:`\xA1Hola ${e}! \u{1F44B}

Te escribimos de *Maneki Store* \u{1F431} para confirmarte tu pedido:

\u{1F4CB} Folio: *${t}*
\u{1F4E6} Concepto: ${n}${u}
\u{1F4C5} Fecha de entrega: *${a}*
\u{1F4B0} Total: *$${c.toFixed(2)}*
${m}
${p}

\xA1Gracias por tu confianza! \u2728
${i}`,recordatorio:`\xA1Hola ${e}! \u{1F514}

Solo un recordatorio de *Maneki Store* \u{1F431}:

Tu pedido *${t}* tiene fecha de entrega el *${a}*.
${r>0?`
\u{1F4B3} Recuerda que tienes un saldo pendiente de *$${r.toFixed(2)}*.
`:""}
\xA1Cualquier duda, aqu\xED estamos! \u{1F60A}
${i}`,entrega:`\xA1Hola ${e}! \u{1F4E6}

\xA1Buenas noticias! Tu pedido de *Maneki Store* \u{1F431} ya est\xE1 *listo para entregarse*:

\u{1F4CB} Folio: *${t}*
\u{1F4E6} ${n}
${r>0?`
\u{1F4B3} Saldo al recoger: *$${r.toFixed(2)}*
`:`
\u2705 Pedido liquidado
`}
Coordinemos la entrega, \xBFcu\xE1ndo te queda bien? \u{1F60A}
${i}`,cobro:`\xA1Hola ${e}! \u{1F4B3}

Te escribimos de *Maneki Store* \u{1F431} sobre tu pedido *${t}*:

\u{1F4B0} Total del pedido: *$${c.toFixed(2)}*
\u2705 Ya abonado: *$${d.toFixed(2)}*
\u26A0\uFE0F Saldo pendiente: *$${r.toFixed(2)}*

\xBFC\xF3mo prefieres hacer el pago? \xA1Estamos para ayudarte! \u{1F60A}
${i}`,produccion:`\xA1Hola ${e}! \u{1F528}

Queremos avisarte que tu pedido de *Maneki Store* \u{1F431} ya entr\xF3 en *producci\xF3n*:

\u{1F4CB} Folio: *${t}*
\u{1F4E6} ${n}
\u{1F4C5} Fecha de entrega estimada: *${a}*

Estamos trabajando con todo el cari\xF1o para que quede perfecto. \u{1F49B}
Te avisamos en cuanto est\xE9 listo.
${i}`,pagoRecibido:`\xA1Hola ${e}! \u2705

Confirmamos que recibimos tu pago en *Maneki Store* \u{1F431}:

\u{1F4CB} Folio: *${t}*
\u{1F4B5} Abono registrado: *$${f.toFixed(2)}*
${r>0?`\u{1F4B3} Saldo restante: *$${r.toFixed(2)}*`:"\u{1F389} Tu pedido est\xE1 completamente *liquidado*"}

\xA1Gracias! Cualquier duda estamos aqu\xED. \u{1F60A}
${i}`,seguimiento:`\xA1Hola ${e}! \u{1F4CA}

Aqu\xED te compartimos una actualizaci\xF3n de tu pedido en *Maneki Store* \u{1F431}:

\u{1F4CB} Folio: *${t}*
\u{1F4E6} Concepto: ${n}
\u{1F4C5} Entrega estimada: *${a}*
${m}
${p}

\xBFTienes alguna duda o ajuste? \xA1Cu\xE9ntanos! \u{1F60A}
${i}`,gracias:`\xA1Hola ${e}! \u{1F64F}

Muchas gracias por confiar en *Maneki Store* \u{1F431} para tu pedido *${t}*.

Esperamos que lo hayas disfrutado mucho. \u{1F49B}
Si tienes cualquier comentario o necesitas algo m\xE1s, aqu\xED estamos siempre.

\xA1Fue un placer atenderte! \u{1F431}\u2728
${i}`}}function abrirWhatsAppPedido(o){const e=(window.pedidos||[]).find(a=>String(a.id)===String(o));if(!e)return;if(_waPedidoActual=e,_waPedidoActual._waFooterCached=_waFooter(),document.getElementById("waClienteNombre").textContent=e.cliente||"\u2014",document.getElementById("waTelefono").value=(e.telefono||e.whatsapp||"").replace(/\D/g,""),!e.telefono&&!e.whatsapp){const a=document.getElementById("waTelefono");a&&(a.placeholder="Sin tel\xE9fono registrado \u2014 ingresa uno para enviar",a.style.borderColor="#f59e0b")}const t=e.status==="produccion"||e.status==="retirar"||e.status==="salida"?"entrega":"confirmacion";aplicarPlantillaWA(t);const n=document.getElementById("whatsappPedidoModal");n.style.display="",openModal(n)}function aplicarPlantillaWA(o){if(!_waPedidoActual)return;const e=_waMensajes(_waPedidoActual);document.getElementById("waMensaje").value=e[o]||"",["confirmacion","recordatorio","entrega","cobro","produccion","pagoRecibido","seguimiento","gracias"].forEach(t=>{const n=document.getElementById("btnTpl"+t.charAt(0).toUpperCase()+t.slice(1));n&&(t===o?n.style.cssText="border-color:#25D366;background:#f0fdf4;color:#16a34a;":n.style.cssText="border-color:#e5e7eb;background:white;color:#4b5563;")})}function copiarMensajeWA(){const o=document.getElementById("waMensaje").value;o&&navigator.clipboard.writeText(o).then(()=>{const e=document.getElementById("btnCopiarWA"),t=e.innerHTML;e.innerHTML='<i class="fas fa-check"></i> \xA1Copiado!',e.style.cssText="border-color:#25D366;background:#f0fdf4;color:#16a34a;",setTimeout(()=>{e.innerHTML=t,e.style.cssText=""},2e3)}).catch(()=>{document.getElementById("waMensaje").select(),document.execCommand("copy"),manekiToastExport("Mensaje copiado al portapapeles","ok")})}function cerrarWhatsAppModal(){closeModal("whatsappPedidoModal"),_waPedidoActual=null}window.abrirWhatsAppPedido=abrirWhatsAppPedido,window.cerrarWhatsAppModal=cerrarWhatsAppModal,window.aplicarPlantillaWA=aplicarPlantillaWA,window.copiarMensajeWA=copiarMensajeWA,window.enviarWhatsApp=enviarWhatsApp,window.abrirMessengerPedido=abrirMessengerPedido;function enviarWhatsApp(){const o=document.getElementById("waTelefono").value.replace(/\D/g,""),e=document.getElementById("waMensaje").value.trim();if(!o||o.length<10){manekiToastExport("Por favor ingresa un n\xFAmero de tel\xE9fono v\xE1lido (10 d\xEDgitos).","err"),document.getElementById("waTelefono").focus();return}if(!e){manekiToastExport("El mensaje no puede estar vac\xEDo.","warn");return}const n=`https://wa.me/${o.startsWith("52")?o:"52"+o}?text=${encodeURIComponent(e)}`;window.open(n,"_blank"),cerrarWhatsAppModal()}function construirUrlMessenger(o){if(!o)return"#";const e=o.trim();if(e.startsWith("http://")||e.startsWith("https://")){try{if(new URL(e).protocol!=="https:")return"#"}catch{return"#"}return e.replace("facebook.com","messenger.com/t").replace("messenger.com/t/t/","messenger.com/t/")}const t=e.replace(/^@/,"").replace(/[^a-zA-Z0-9._-]/g,"");return t?`https://m.me/${t}`:"#"}function abrirMessengerPedido(o){const e=(window.pedidos||[]).find(n=>String(n.id)===String(o));if(!e||!e.redes)return;const t=construirUrlMessenger(e.redes);window.open(t,"_blank")}(function(){const o=document.getElementById("whatsappPedidoModal");o?o.addEventListener("click",function(e){e.target===this&&cerrarWhatsAppModal()}):document.addEventListener("DOMContentLoaded",function(){const e=document.getElementById("whatsappPedidoModal");e&&e.addEventListener("click",function(t){t.target===this&&cerrarWhatsAppModal()})})})();
//# sourceMappingURL=whatsapp.js.map
