let _waPedidoActual = null;
function _wa(str) {
  if (!str) return "";
  return String(str).replace(/[*_~`|]/g, "").trim();
}
const _WA_PROMOS = [
  "🎁 Tenemos regalos únicos para cada ocasión, ¡cuéntanos qué necesitas!",
  "⭐ ¿Te gustó tu pedido? ¡Una reseña nos ayuda mucho a crecer!",
  "👯 Refiere a un amigo y obtén un detalle especial en tu próximo pedido.",
  "🎨 ¿Sabías que personalizamos casi cualquier cosa? ¡Escríbenos sin compromiso!",
  "🛍️ Mira todo nuestro catálogo en: www.manekistore.com.mx"
];
const _WA_FB = "facebook.com/ManekiPrints";
function _waFooter() {
  const key = "maneki_wa_promo_idx";
  const prev = parseInt(localStorage.getItem(key) || "-1");
  const next = (prev + 1) % _WA_PROMOS.length;
  localStorage.setItem(key, next);
  return `
${_WA_PROMOS[next]}
📘 Síguenos: ${_WA_FB}`;
}
function _waMensajes(p) {
  const nombre = _wa(p.cliente || "cliente");
  const folio = _wa(p.folio || "—");
  const concepto = _wa(p.concepto || "—");
  const entrega = _wa(p.entrega || "por confirmar");
  const total = Number(p.total || 0);
  const anticipo = Number(p.anticipo || 0);
  const totalPagado = (p.pagos || []).reduce((s, ab) => s + Number(ab.monto || 0), 0);
  const resta = totalPagado > 0 ? Math.max(0, total - totalPagado) : typeof window.calcSaldoPendiente === "function" ? window.calcSaldoPendiente(p) : Math.max(0, total - anticipo);
  let listaProductos = "";
  if (p.productosInventario && p.productosInventario.length > 0) {
    listaProductos = "\n🛍️ Productos:\n" + p.productosInventario.map(
      (i) => `   • ${_wa(i.name || i.nombre || "")}${i.quantity ? " x" + i.quantity : ""} — $${Number(i.price || i.precio || 0).toFixed(2)}`
    ).join("\n") + "\n";
  }
  const pagoLinea = resta > 0 ? `💳 Saldo pendiente: *$${resta.toFixed(2)}*` : `✅ Pedido *liquidado*`;
  const notas = p.notas ? "\n📝 " + _wa(p.notas) : "";
  const footer = p._waFooterCached || _waFooter();
  const ultimoPago = p.pagos && p.pagos.length > 0 ? p.pagos[p.pagos.length - 1] : null;
  const montoUltimoPago = ultimoPago ? Number(ultimoPago.monto || 0) : anticipo;
  return {
    // ── Plantillas existentes ──────────────────
    confirmacion: `¡Hola ${nombre}! 👋

Te escribimos de *Maneki Store* 🐱 para confirmarte tu pedido:

📋 Folio: *${folio}*
📦 Concepto: ${concepto}${listaProductos}
📅 Fecha de entrega: *${entrega}*
💰 Total: *$${total.toFixed(2)}*
${pagoLinea}
${notas}

¡Gracias por tu confianza! ✨
${footer}`,
    recordatorio: `¡Hola ${nombre}! 🔔

Solo un recordatorio de *Maneki Store* 🐱:

Tu pedido *${folio}* tiene fecha de entrega el *${entrega}*.
${resta > 0 ? `
💳 Recuerda que tienes un saldo pendiente de *$${resta.toFixed(2)}*.
` : ""}
¡Cualquier duda, aquí estamos! 😊
${footer}`,
    entrega: `¡Hola ${nombre}! 📦

¡Buenas noticias! Tu pedido de *Maneki Store* 🐱 ya está *listo para entregarse*:

📋 Folio: *${folio}*
📦 ${concepto}
${resta > 0 ? `
💳 Saldo al recoger: *$${resta.toFixed(2)}*
` : "\n✅ Pedido liquidado\n"}
Coordinemos la entrega, ¿cuándo te queda bien? 😊
${footer}`,
    cobro: `¡Hola ${nombre}! 💳

Te escribimos de *Maneki Store* 🐱 sobre tu pedido *${folio}*:

💰 Total del pedido: *$${total.toFixed(2)}*
✅ Ya abonado: *$${anticipo.toFixed(2)}*
⚠️ Saldo pendiente: *$${resta.toFixed(2)}*

¿Cómo prefieres hacer el pago? ¡Estamos para ayudarte! 😊
${footer}`,
    // ── Nuevas plantillas ──────────────────────
    produccion: `¡Hola ${nombre}! 🔨

Queremos avisarte que tu pedido de *Maneki Store* 🐱 ya entró en *producción*:

📋 Folio: *${folio}*
📦 ${concepto}
📅 Fecha de entrega estimada: *${entrega}*

Estamos trabajando con todo el cariño para que quede perfecto. 💛
Te avisamos en cuanto esté listo.
${footer}`,
    pagoRecibido: `¡Hola ${nombre}! ✅

Confirmamos que recibimos tu pago en *Maneki Store* 🐱:

📋 Folio: *${folio}*
💵 Abono registrado: *$${montoUltimoPago.toFixed(2)}*
${resta > 0 ? `💳 Saldo restante: *$${resta.toFixed(2)}*` : "🎉 Tu pedido está completamente *liquidado*"}

¡Gracias! Cualquier duda estamos aquí. 😊
${footer}`,
    seguimiento: `¡Hola ${nombre}! 📊

Aquí te compartimos una actualización de tu pedido en *Maneki Store* 🐱:

📋 Folio: *${folio}*
📦 Concepto: ${concepto}
📅 Entrega estimada: *${entrega}*
${pagoLinea}
${notas}

¿Tienes alguna duda o ajuste? ¡Cuéntanos! 😊
${footer}`,
    gracias: `¡Hola ${nombre}! 🙏

Muchas gracias por confiar en *Maneki Store* 🐱 para tu pedido *${folio}*.

Esperamos que lo hayas disfrutado mucho. 💛
Si tienes cualquier comentario o necesitas algo más, aquí estamos siempre.

¡Fue un placer atenderte! 🐱✨
${footer}`
  };
}
function abrirWhatsAppPedido(id) {
  const p = (window.pedidos || []).find((x) => String(x.id) === String(id));
  if (!p) return;
  _waPedidoActual = p;
  _waPedidoActual._waFooterCached = _waFooter();
  document.getElementById("waClienteNombre").textContent = p.cliente || "—";
  document.getElementById("waTelefono").value = (p.telefono || p.whatsapp || "").replace(/\D/g, "");
  if (!p.telefono && !p.whatsapp) {
    const telInput = document.getElementById("waTelefono");
    if (telInput) {
      telInput.placeholder = "Sin teléfono registrado — ingresa uno para enviar";
      telInput.style.borderColor = "#f59e0b";
    }
  }
  const estadoDefault = p.status === "produccion" || p.status === "retirar" || p.status === "salida" ? "entrega" : "confirmacion";
  aplicarPlantillaWA(estadoDefault);
  const waModal = document.getElementById("whatsappPedidoModal");
  waModal.style.display = "";
  openModal(waModal);
}
function aplicarPlantillaWA(tipo) {
  if (!_waPedidoActual) return;
  const mensajes = _waMensajes(_waPedidoActual);
  document.getElementById("waMensaje").value = mensajes[tipo] || "";
  ["confirmacion", "recordatorio", "entrega", "cobro", "produccion", "pagoRecibido", "seguimiento", "gracias"].forEach((t) => {
    const btn = document.getElementById("btnTpl" + t.charAt(0).toUpperCase() + t.slice(1));
    if (!btn) return;
    if (t === tipo) {
      btn.style.cssText = "border-color:#25D366;background:#f0fdf4;color:#16a34a;";
    } else {
      btn.style.cssText = "border-color:#e5e7eb;background:white;color:#4b5563;";
    }
  });
}
function copiarMensajeWA() {
  const msg = document.getElementById("waMensaje").value;
  if (!msg) return;
  navigator.clipboard.writeText(msg).then(() => {
    const btn = document.getElementById("btnCopiarWA");
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
    btn.style.cssText = "border-color:#25D366;background:#f0fdf4;color:#16a34a;";
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.cssText = "";
    }, 2e3);
  }).catch(() => {
    const ta = document.getElementById("waMensaje");
    ta.select();
    document.execCommand("copy");
    manekiToastExport("Mensaje copiado al portapapeles", "ok");
  });
}
function cerrarWhatsAppModal() {
  closeModal("whatsappPedidoModal");
  _waPedidoActual = null;
}
window.abrirWhatsAppPedido = abrirWhatsAppPedido;
window.cerrarWhatsAppModal = cerrarWhatsAppModal;
window.aplicarPlantillaWA = aplicarPlantillaWA;
window.copiarMensajeWA = copiarMensajeWA;
window.enviarWhatsApp = enviarWhatsApp;
window.abrirMessengerPedido = abrirMessengerPedido;
function enviarWhatsApp() {
  const tel = document.getElementById("waTelefono").value.replace(/\D/g, "");
  const msg = document.getElementById("waMensaje").value.trim();
  if (!tel || tel.length < 10) {
    manekiToastExport("Por favor ingresa un número de teléfono válido (10 dígitos).", "err");
    document.getElementById("waTelefono").focus();
    return;
  }
  if (!msg) {
    manekiToastExport("El mensaje no puede estar vacío.", "warn");
    return;
  }
  const numero = tel.startsWith("52") ? tel : "52" + tel;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  cerrarWhatsAppModal();
}
function construirUrlMessenger(redes) {
  if (!redes) return "#";
  const r = redes.trim();
  if (r.startsWith("http://") || r.startsWith("https://")) {
    try {
      const url = new URL(r);
      if (url.protocol !== "https:") return "#";
    } catch (e) {
      return "#";
    }
    return r.replace("facebook.com", "messenger.com/t").replace("messenger.com/t/t/", "messenger.com/t/");
  }
  const usuario = r.replace(/^@/, "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!usuario) return "#";
  return `https://m.me/${usuario}`;
}
function abrirMessengerPedido(id) {
  const p = (window.pedidos || []).find((x) => String(x.id) === String(id));
  if (!p || !p.redes) return;
  const url = construirUrlMessenger(p.redes);
  window.open(url, "_blank");
}
(function() {
  const _modal = document.getElementById("whatsappPedidoModal");
  if (_modal) {
    _modal.addEventListener("click", function(e) {
      if (e.target === this) cerrarWhatsAppModal();
    });
  } else {
    document.addEventListener("DOMContentLoaded", function() {
      const m = document.getElementById("whatsappPedidoModal");
      if (m) m.addEventListener("click", function(e) {
        if (e.target === this) cerrarWhatsAppModal();
      });
    });
  }
})();
//# sourceMappingURL=whatsapp.js.map
