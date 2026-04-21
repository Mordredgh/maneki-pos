async function imprimirTicketPedido(id) {
    const p = [...(window.pedidosFinalizados || []), ...(window.pedidos || [])].find(x => String(x.id) === String(id));
    if (!p) return;

    // Convertir logo a base64 para que funcione en la ventana nueva (Electron / file://)
    let logoBase64 = '';
    try {
        const logoUrl = new URL('logo.png', window.location.href).href;
        const resp    = await fetch(logoUrl);
        const blob    = await resp.blob();
        logoBase64    = await new Promise(res => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.readAsDataURL(blob);
        });
    } catch(_) { /* sin logo — continúa igual */ }

    const total    = Number(p.total    || 0);
    const anticipo = Number(p.anticipo || 0);
    const sumPagos = (p.pagos||[]).reduce((s,ab)=>s+Number(ab.monto||0),0);
    const totalPagado = sumPagos > 0 ? sumPagos : Number(p.anticipo||0);
    const resta = Math.max(0, Number(p.total||0) - totalPagado);
    const fecha    = (p.fechaFinalizado || p.fechaPedido || '').split('T')[0] || '—';
    const entrega  = p.entrega || '—';

    // Mostrar todos los items de productosInventario; si no hay, mostrar concepto como fila
    const items = (p.productosInventario || []).filter(it => it.id !== 'libre');

    const itemsHtml = items.length > 0
        ? items.map(it => {
            const qty      = Number(it.quantity || 1);
            const precio   = Number(it.price || 0);
            const subtotal = qty * precio;
            // Parsear variante "Negro:S" → dos chips: tipo + valor
            let varianteHtml = '';
            if (it.variante) {
                const colonIdx = it.variante.indexOf(':');
                const vTipo  = colonIdx !== -1 ? it.variante.slice(0, colonIdx).trim() : '';
                const vValor = colonIdx !== -1 ? it.variante.slice(colonIdx + 1).trim() : it.variante.trim();
                varianteHtml = `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;">
                    ${vTipo ? `<span style="background:#f3f4f6;color:#6b7280;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${vTipo}</span>` : ''}
                    <span style="background:#fffbeb;color:#92400e;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;text-transform:uppercase;">${vValor}</span>
                </div>`;
            }
            const precioStr   = precio > 0 ? `$${precio.toFixed(2)}`   : '<span style="color:#d1d5db;">—</span>';
            const subtotalStr = precio > 0 ? `$${subtotal.toFixed(2)}` : '<span style="color:#d1d5db;">—</span>';
            return `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <div style="font-weight:600;color:#1f2937;font-size:13px;">${it.name || '—'}</div>
                    ${varianteHtml}
                </td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;font-size:13px;vertical-align:middle;">${qty}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;color:#6b7280;font-size:13px;vertical-align:middle;">${precioStr}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;color:#1f2937;font-size:13px;vertical-align:middle;">${subtotalStr}</td>
            </tr>`;
          }).join('')
        : `<tr><td colspan="4" style="padding:16px 12px;text-align:center;color:#9ca3af;font-style:italic;font-size:13px;">${p.concepto || 'Pedido personalizado'}</td></tr>`;

    const logoHtml = logoBase64
        ? `<img src="${logoBase64}" style="height:72px;object-fit:contain;margin-bottom:8px;" alt="Maneki Store">`
        : `<div style="font-size:2rem;">🐱</div>`;

    const notasHtml = p.notas ? `
        <div style="margin:20px 0;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
            <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">📝 Notas</div>
            <div style="font-size:12px;color:#78350f;">${p.notas}</div>
        </div>` : '';

    const lugarHtml = p.lugarEntrega ? `
        <div style="margin-top:4px;font-size:11px;color:#9ca3af;">📍 ${p.lugarEntrega}</div>` : '';

    const win = window.open('', '_blank', 'width=480,height=750,scrollbars=yes');
    if (!win) {
        manekiToastExport('⚠️ El navegador bloqueó la ventana de impresión. Permite popups para este sitio.', 'warn');
        return;
    }
    win.document.write(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comprobante ${p.folio} — Maneki Store</title>
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
    ${logoHtml}
    <div class="brand-name">MANEKI STORE</div>
    <div class="brand-sub">Personalización con amor</div>
  </div>

  <!-- INFO DEL PEDIDO -->
  <div class="info-block">
    <div class="folio-badge">✦ ${p.folio}</div>
    <div class="info-grid">
      <div class="info-cell full">
        <div class="info-label">Cliente</div>
        <div class="info-value" style="font-size:15px;">${p.cliente || '—'}</div>
        ${lugarHtml}
      </div>
      <div class="info-cell">
        <div class="info-label">Fecha</div>
        <div class="info-value">${fecha}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Entrega</div>
        <div class="info-value" style="color:${(entrega && entrega !== '—' && fecha && fecha !== '—' && entrega < fecha) ? '#dc2626' : '#1f2937'};">${entrega}</div>
      </div>
      ${p.concepto ? `
      <div class="info-cell full">
        <div class="info-label">Concepto</div>
        <div class="info-value" style="font-weight:500;font-size:12px;">${p.concepto}</div>
      </div>` : ''}
    </div>
  </div>

  <!-- PRODUCTOS -->
  <div class="section-title">Productos</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;padding:8px 12px;">Descripción</th>
        <th>Cant</th>
        <th>P/U</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <!-- SEPARADOR -->
  <div style="height:16px;"></div>

  <!-- TOTALES -->
  <div class="section-title">Resumen de pago</div>
  <div class="totals">
    <div class="total-row grand">
      <span>Total del pedido</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Anticipo recibido</span>
      <span style="color:#16a34a;font-weight:700;">− $${anticipo.toFixed(2)}</span>
    </div>
    <div class="total-row ${resta <= 0 ? 'saldo-ok' : 'saldo-pen'}">
      <span>${resta <= 0 ? '✅ Pagado completo' : '⏳ Saldo pendiente'}</span>
      <span>$${Math.max(0, resta).toFixed(2)}</span>
    </div>
  </div>

  <!-- NOTAS -->
  ${notasHtml ? `<div style="padding:0 24px;">${notasHtml}</div>` : ''}

  <!-- FOOTER -->
  <div class="footer">
    <div style="font-size:18px;margin-bottom:6px;">🐱</div>
    <div>¡Gracias por tu pedido!</div>
    <div style="margin-top:4px;"><strong>manekistore.com.mx</strong></div>
  </div>

  <!-- BOTONES -->
  <div class="actions">
    <button class="btn btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ Cerrar</button>
  </div>

</div>
</body></html>`);
    win.document.close();
}
window.imprimirTicketPedido = imprimirTicketPedido;

// ── Exponer funciones de pedidos globalmente ──
window.openPedidoModal = openPedidoModal;
window.closePedidoModal = closePedidoModal;
window.openPedidoStatusModal = openPedidoStatusModal;
window.closePedidoStatusModal = closePedidoStatusModal;
window.setPedidoStatus = setPedidoStatus;
// ── NTH-01: Duplicar pedido ──────────────────────────────────────────────────
function duplicarPedido(id) {
    const original = (window.pedidos || []).find(p => String(p.id) === String(id))
                  || (window.pedidosFinalizados || []).find(p => String(p.id) === String(id));
    if (!original) return;
    const nuevoId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
    const hoy = typeof _fechaHoy === 'function' ? _fechaHoy() : (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
    const copia = {
        ...original,
        id: nuevoId,
        folio: generarFolioPedido(),
        status: 'confirmado',
        anticipo: 0,
        resta: original.total || 0,
        pagos: [],
        fechaCreacion: new Date().toISOString(),
        fechaUltimoEstado: new Date().toISOString(),
        fechaPedido: hoy,
        entrega: '',
        productosInventario: JSON.parse(JSON.stringify(original.productosInventario || []))
    };
    copia.inventarioDescontado = false;
    delete copia.fechaFinalizado;
    delete copia._inventarioYaFinalizado;
    delete copia.fechaCancelado;
    copia.referenciasUrls = [];
    copia.referenciasPaths = [];
    delete copia.referenciaUrl;
    delete copia.referenciaPath;
    if (!window.pedidos) window.pedidos = [];
    window.pedidos.push(copia);
    savePedidos();
    renderPedidosTable();
    updatePedidosStats();
    manekiToastExport(`✅ Pedido duplicado: ${copia.folio} — recuerda ajustar la fecha de entrega.`, 'ok');
    setTimeout(() => { if (typeof openPedidoModal === 'function') openPedidoModal(copia.id); }, 400);
}
window.duplicarPedido = duplicarPedido;

window.openAbonoPedido = openAbonoPedido;
window.cerrarAbonoPedido = cerrarAbonoPedido;
window.confirmarAbonoPedido = confirmarAbonoPedido;
window.selectAbonoPedidoMethod = selectAbonoPedidoMethod;
window.eliminarPedido = eliminarPedido;
window.renderPedidosTable = renderPedidosTable;
window.renderKanbanBoard = renderKanbanBoard;
window.renderTablaPedidos = renderTablaPedidos;
window.updatePedidosStats = updatePedidosStats;
window.renderHistorialPedidos = renderHistorialPedidos;
window.kanbanCardHTML = kanbanCardHTML;
window.kanbanDragStart = kanbanDragStart;
window.kanbanDragEnd = kanbanDragEnd;
window.kanbanDragOver = kanbanDragOver;
window.kanbanDragLeave = kanbanDragLeave;
window.kanbanDrop = kanbanDrop;
window.setVistaPedidos = setVistaPedidos;
window.filterPedidos = filterPedidos;
window.toggleKanbanCompacto = toggleKanbanCompacto;
window.generarFolioPedido = generarFolioPedido;
window.openCancelPedidoModal = openCancelPedidoModal;
window.closeCancelPedidoModal = closeCancelPedidoModal;
window.confirmarCancelPedido = confirmarCancelPedido;
window.eliminarPedidoFinalizado = eliminarPedidoFinalizado;
// ── Buscador de productos en modal de pedido ────────────────────────────────
// Incluye: Productos Terminados Y Materias Primas (para pedidos que requieren MP específica)
function filtrarProductosPedido() {
    const q = (document.getElementById('pedidoBuscadorProducto')?.value || '').toLowerCase().trim();
    const grid = document.getElementById('pedidoProductoGrid');
    if (!grid) return;

    // Productos terminados + variables (excluye MP y servicios)
    const productos = (window.products || []).filter(p =>
        (!p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno' || p.tipo === 'pack' || p.tipo === 'producto_variable') &&
        (!q || (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
    );

    if (!q && productos.length === 0) { grid.classList.add('hidden'); return; }
    grid.classList.remove('hidden');

    if (productos.length === 0) {
        grid.innerHTML = '<p class="text-sm text-gray-400 text-center py-2">No se encontraron productos</p>';
        return;
    }

    grid.innerHTML = productos.map(p => {
        const img = p.imageUrl
            ? `<img src="${p.imageUrl}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">`
            : `<span class="text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0">${p.image || '📦'}</span>`;
        const esMp  = p.tipo === 'materia_prima';
        const esSvc = p.tipo === 'servicio';
        const esPV  = p.tipo === 'producto_variable';
        const precio = esPV
            ? (() => { const t=(p.tablaPreciosVariable||[]).slice().sort((a,b)=>a.cantidadMin-b.cantidadMin); return t.length ? t.map(r=>`${r.cantidadMin}=$${Number(r.precio).toFixed(0)}`).join(' / ') : 'Precio variable'; })()
            : p.price ? `$${Number(p.price).toFixed(2)}` : (p.cost ? `Costo: $${Number(p.cost).toFixed(2)}` : '');
        const tipoLabel = esSvc
            ? `<span style="font-size:.65rem;background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:99px;font-weight:700;">⚙️ Serv</span>`
            : esMp
            ? `<span style="font-size:.65rem;background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:99px;font-weight:700;">MP</span>`
            : esPV
            ? `<span style="font-size:.65rem;background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:99px;font-weight:700;">🎯 Var</span>`
            : `<span style="font-size:.65rem;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;font-weight:700;">PT</span>`;
        const tieneVariantes = _variantesPedido(p).length > 0;
        const varLabel = tieneVariantes
            ? `<span style="font-size:.65rem;color:#6366f1;">🎨 ${_variantesPedido(p).length} variantes</span>`
            : '';
        return `
            <div onclick="seleccionarProductoPedido('${p.id}')"
                class="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                ${img}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1 flex-wrap">
                        <span class="font-semibold text-sm text-gray-800 truncate">${p.name}</span>
                        ${tipoLabel}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-amber-700">${precio}</span>
                        ${varLabel}
                    </div>
                </div>
            </div>`;
    }).join('');
}
window.filtrarProductosPedido = filtrarProductosPedido;

// ── Helper: variantes efectivas para un producto en pedido ──────────────────
// Si el PT tiene mpComponentes con variantes → usa las del MP (siempre actualizadas).
// Así el select en pedidos hereda automáticamente cualquier cambio hecho en la MP.
function _variantesPedido(p) {
    if (!p) return [];
    // PT con mpComponentes: buscar el primer MP que tenga variantes
    if (Array.isArray(p.mpComponentes) && p.mpComponentes.length > 0) {
        for (const comp of p.mpComponentes) {
            const mp = (window.products || []).find(x => String(x.id) === String(comp.id));
            if (mp && Array.isArray(mp.variants) && mp.variants.length > 0) return mp.variants;
        }
    }
    // Fallback: variantes propias del producto (MP directo o PT sin componentes)
    return Array.isArray(p.variants) ? p.variants : [];
}
window._variantesPedido = _variantesPedido;

function seleccionarProductoPedido(id) {
    const p = (window.products || []).find(x => String(x.id) === String(id));
    if (!p) return;

    document.getElementById('pedidoProductoSelect').value = id;
    document.getElementById('pedidoProductoGrid').classList.add('hidden');
    document.getElementById('pedidoBuscadorProducto').value = '';

    // Mostrar fila de selección
    const selRow = document.getElementById('pedidoProductoSelRow');
    if (selRow) selRow.classList.remove('hidden');

    const imgEl = document.getElementById('pedidoProductoSelImg');
    if (imgEl) {
        if (p.imageUrl) { imgEl.src = p.imageUrl; imgEl.style.display = ''; }
        else imgEl.style.display = 'none';
    }
    const nomEl = document.getElementById('pedidoProductoSelNombre');
    if (nomEl) nomEl.textContent = p.name;
    const preEl = document.getElementById('pedidoProductoSelPrecio');
    if (preEl) {
        if (p.tipo === 'producto_variable') {
            const tabla = (p.tablaPreciosVariable||[]).slice().sort((a,b)=>a.cantidadMin-b.cantidadMin);
            preEl.textContent = tabla.length
                ? tabla.map(r=>`${r.cantidadMin} pzas=$${Number(r.precio).toFixed(0)}`).join(' · ')
                : 'Precio variable';
        } else {
            const esMp = p.tipo === 'materia_prima';
            preEl.textContent = p.price
                ? `$${Number(p.price).toFixed(2)}`
                : (esMp && p.cost ? `Costo: $${Number(p.cost).toFixed(2)}` : '');
        }
    }

    // ── Variantes ──
    // Aplica para AMBOS: Producto Terminado (PT) y Materia Prima (MP) con variantes
    const varRow = document.getElementById('pedidoVarianteRow');
    const varSel = document.getElementById('pedidoVarianteSelect');
    if (varRow && varSel) {
        const _effVariants = _variantesPedido(p);
        if (_effVariants.length > 0) {
            varSel.innerHTML = _effVariants.map(v => {
                const stockLabel = (v.qty !== undefined && v.qty !== null)
                    ? ` (${v.qty} pzs)` : '';
                const emojiPfx = typeof _mkColorEmoji === 'function' ? _mkColorEmoji(v.type, v.value) : v.value;
                return `<option value="${v.type}:${v.value}">${v.type}: ${emojiPfx}${stockLabel}</option>`;
            }).join('');
            varRow.classList.remove('hidden');

            // Cambiar label según tipo de producto
            const varLabel = varRow.querySelector('label');
            if (varLabel) {
                varLabel.textContent = p.tipo === 'materia_prima'
                    ? '🎨 Selecciona variante (Talla / Color):'
                    : '🎨 Variante:';
            }
        } else {
            varRow.classList.add('hidden');
        }
    }

    // Autocompletar costo unitario (solo para productos terminados con precio)
    const costoEl = document.getElementById('pedidoCosto');
    if (costoEl && p.price && p.tipo !== 'materia_prima') {
        costoEl.value = Number(p.price).toFixed(2);
    }
    // Autocompletar precio en el input de producto seleccionado
    const precioInputEl = document.getElementById('pedidoProductoPrecio');
    if (precioInputEl) {
        if (p.tipo === 'producto_variable' && typeof pvGetPrecio === 'function') {
            const qty = parseInt(document.getElementById('pedidoProductoCantidad')?.value) || 1;
            precioInputEl.value = pvGetPrecio(p, qty).toFixed(2);
            _pvMostrarHint(p, qty);
        } else {
            precioInputEl.value = p.price ? Number(p.price).toFixed(2) : '';
            _pvOcultarHint();
        }
    }
    // Mostrar fotos de galería del producto
    if (typeof _mostrarGaleriaPtEnPedido === 'function') _mostrarGaleriaPtEnPedido(p);
    if (typeof calcPedidoTotal === 'function') calcPedidoTotal();
}
window.seleccionarProductoPedido = seleccionarProductoPedido;

function limpiarSeleccionProductoPedido() {
    document.getElementById('pedidoProductoSelect').value = '';
    const selRow = document.getElementById('pedidoProductoSelRow');
    if (selRow) selRow.classList.add('hidden');
    const varRow = document.getElementById('pedidoVarianteRow');
    if (varRow) varRow.classList.add('hidden');
    const precioInput = document.getElementById('pedidoProductoPrecio');
    if (precioInput) precioInput.value = '';
    const cantInput = document.getElementById('pedidoProductoCantidad');
    if (cantInput) cantInput.value = 1;
    const galStrip = document.getElementById('pedidoPtGaleriaStrip');
    if (galStrip) galStrip.innerHTML = '';
    _pvOcultarHint();
}
window.limpiarSeleccionProductoPedido = limpiarSeleccionProductoPedido;

// ── Hint de rango activo para Producto Variable ───────────────────────────────
function _pvMostrarHint(p, qty) {
    let hint = document.getElementById('pedidoPvHint');
    if (!hint) {
        const selRow = document.getElementById('pedidoProductoSelRow');
        if (!selRow) return;
        hint = document.createElement('div');
        hint.id = 'pedidoPvHint';
        hint.style.cssText = 'font-size:.75rem;color:#0369a1;background:#e0f2fe;border-radius:8px;padding:5px 10px;margin-top:6px;';
        selRow.appendChild(hint);
    }
    const tabla = (p.tablaPreciosVariable||[]).slice().sort((a,b)=>a.cantidadMin-b.cantidadMin);
    if (!tabla.length) { hint.style.display='none'; return; }
    let rangoActivo = tabla[0];
    for (const r of tabla) { if (qty >= r.cantidadMin) rangoActivo = r; else break; }
    const unitPrice = rangoActivo.precio / (rangoActivo.cantidadMin || 1);
    const total = unitPrice * qty;
    hint.style.display = '';
    hint.innerHTML = `🎯 Rango: <b>${rangoActivo.cantidadMin}+ pzas</b> → <b>$${unitPrice.toFixed(2)}/pza</b> &nbsp;|&nbsp; Total: <b style="color:#059669">$${total.toFixed(2)}</b>`;
}
window._pvMostrarHint = _pvMostrarHint;

function _pvOcultarHint() {
    const hint = document.getElementById('pedidoPvHint');
    if (hint) hint.style.display = 'none';
}
window._pvOcultarHint = _pvOcultarHint;

function _pvCantidadChange(val) {
    const id = document.getElementById('pedidoProductoSelect')?.value;
    if (!id) return;
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p || p.tipo !== 'producto_variable') return;
    const qty = parseInt(val) || 1;
    const unitPrice = typeof pvGetPrecio === 'function' ? pvGetPrecio(p, qty) : 0;
    const precioEl = document.getElementById('pedidoProductoPrecio');
    if (precioEl) precioEl.value = unitPrice.toFixed(2);
    _pvMostrarHint(p, qty);
}
window._pvCantidadChange = _pvCantidadChange;

function agregarProductoPedido() {
    const id = document.getElementById('pedidoProductoSelect')?.value;
    if (!id) { manekiToastExport('⚠️ Selecciona un producto primero', 'warn'); return; }
    const p = (window.products || []).find(x => String(x.id) === String(id));
    if (!p) return;
    const qty = parseInt(document.getElementById('pedidoProductoCantidad')?.value) || 1;
    const precioInput = document.getElementById('pedidoProductoPrecio');
    const precioCustom = precioInput && precioInput.value !== '' ? parseFloat(precioInput.value) : null;
    let precioFinal;
    if (p.tipo === 'producto_variable' && typeof pvGetPrecio === 'function') {
        precioFinal = pvGetPrecio(p, qty);
    } else {
        precioFinal = precioCustom !== null ? precioCustom : (parseFloat(p.price) || 0);
    }
    const varSel = document.getElementById('pedidoVarianteSelect');
    const tieneVariantes = _variantesPedido(p).length > 0;
    const variante = (varSel && tieneVariantes && !document.getElementById('pedidoVarianteRow')?.classList.contains('hidden'))
        ? varSel.value : null;

    // Validar que se haya seleccionado variante si el producto las tiene
    if (tieneVariantes && !variante) {
        manekiToastExport('⚠️ Este producto tiene variantes. Selecciona una.', 'warn');
        return;
    }

    window.pedidoProductosSeleccionados = window.pedidoProductosSeleccionados || [];
    const existe = window.pedidoProductosSeleccionados.find(x => x.id === id && x.variante === variante);
    if (existe) { existe.quantity = (existe.quantity || 1) + qty; }
    else { window.pedidoProductosSeleccionados.push({ id, name: p.name, price: precioFinal, quantity: qty, variante }); }

    // Advertir si el stock es insuficiente (considerando rendimientoPorHoja para productos variables)
    if (p.tipo === 'producto_variable') {
        const rph = p.rendimientoPorHoja || 0;
        if (rph > 0 && Array.isArray(p.mpComponentes) && p.mpComponentes.length) {
            const hojasNecesarias = Math.ceil(qty / rph);
            // Revisar stock del primer MP componente (la hoja base)
            const mpBase = (window.products || []).find(x => String(x.id) === String(p.mpComponentes[0].id));
            if (mpBase) {
                const hojasDisp = typeof getStockEfectivo === 'function' ? getStockEfectivo(mpBase) : (mpBase.stock || 0);
                if (hojasNecesarias > hojasDisp) {
                    manekiToastExport(`⚠️ Necesitas ${hojasNecesarias} hojas pero solo hay ${hojasDisp} de "${mpBase.name}"`, 'warn');
                }
            }
        }
    } else {
        const stockDisp = typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (p.stock||0);
        if (stockDisp < qty) {
            manekiToastExport(`⚠️ "${p.name||p.nombre}" tiene solo ${stockDisp} en stock`, 'warn');
        }
    }

    renderPedidoProductosList();
    limpiarSeleccionProductoPedido();
}
window.agregarProductoPedido = agregarProductoPedido;

function renderPedidoProductosList() {
    const list = document.getElementById('pedidoProductosList');
    if (!list) return;
    const items = window.pedidoProductosSeleccionados || [];
    if (!items.length) { list.innerHTML = ''; return; }
    const subtotal = items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);
    list.innerHTML = items.map((item, i) => {
        const precio = parseFloat(item.price) || 0;
        const lineaTotal = precio * (item.quantity || 1);
        return `
        <div class="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-sm">
            <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-800 truncate">${item.name}${item.variante ? ` <span class="text-xs text-purple-600 font-semibold">(${(()=>{const p=item.variante.indexOf(':');if(p===-1)return item.variante;const t=item.variante.slice(0,p).trim(),val=item.variante.slice(p+1).trim();return t+': '+(typeof _mkColorDot==='function'?_mkColorDot(t,val):val);})()})</span>` : ''}</div>
                <div class="flex items-center gap-1 mt-1">
                    <span class="text-xs text-gray-500">×</span>
                    <input type="number" min="1" value="${item.quantity || 1}"
                        oninput="(function(el,idx){var v=parseInt(el.value)||1;var it=window.pedidoProductosSeleccionados&&window.pedidoProductosSeleccionados[idx];if(it){it.quantity=v;var pr=(window.products||[]).find(function(x){return String(x.id)===String(it.id);});if(pr&&pr.tipo==='producto_variable'&&typeof pvGetPrecio==='function'){it.price=pvGetPrecio(pr,v);renderPedidoProductosList();return;}}if(typeof calcPedidoTotal==='function')calcPedidoTotal();})(this,${i})"
                        onchange="editarCantidadPedidoProducto(${i}, this.value)"
                        class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 outline-none">
                    <span class="text-xs text-gray-500">a $</span>
                    <input type="number" step="0.01" min="0" value="${precio.toFixed(2)}"
                        oninput="(function(el,idx){var v=parseFloat(el.value);if(!isNaN(v)&&window.pedidoProductosSeleccionados&&window.pedidoProductosSeleccionados[idx]!=null){window.pedidoProductosSeleccionados[idx].price=v;}if(typeof calcPedidoTotal==='function')calcPedidoTotal();})(this,${i})"
                        onchange="editarPrecioPedidoProducto(${i}, this.value)"
                        class="w-20 px-2 py-0.5 border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 outline-none" style="background:#fffbeb">
                    <span class="text-xs text-gray-400">= <span class="font-semibold text-gray-700">$${lineaTotal.toFixed(2)}</span></span>
                </div>
            </div>
            <button onclick="quitarProductoPedido(${i})" class="text-gray-400 hover:text-red-400 text-base flex-shrink-0">✕</button>
        </div>`;
    }).join('') + `
        <div class="flex justify-end px-3 pt-1 pb-0.5 text-xs font-bold text-gray-700">
            Subtotal productos: <span class="ml-1 text-amber-700">$${subtotal.toFixed(2)}</span>
        </div>`;
    if (typeof calcPedidoTotal === 'function') calcPedidoTotal();
}
window.renderPedidoProductosList = renderPedidoProductosList;

// ── Empaques ──────────────────────────────────────────────────────────────────
function poblarSelectEmpaquesPedido() {
    const sel = document.getElementById('pedidoEmpaquesSelect');
    if (!sel) return;
    const empaques = (window.products || []).filter(p =>
        (p.tags || []).some(t => t.toLowerCase() === 'empaques' || t.toLowerCase() === 'empaque')
    );
    sel.innerHTML = '<option value="">— Seleccionar empaque —</option>' +
        empaques.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock || 0})</option>`).join('');
}
window.poblarSelectEmpaquesPedido = poblarSelectEmpaquesPedido;

function agregarEmpaquePedido() {
    const sel = document.getElementById('pedidoEmpaquesSelect');
    const cantEl = document.getElementById('pedidoEmpaquesCantidad');
    if (!sel || !sel.value) return;
    const prod = (window.products || []).find(p => String(p.id) === sel.value);
    if (!prod) return;
    const qty = parseInt(cantEl?.value) || 1;
    if (!window.pedidoEmpaquesSeleccionados) window.pedidoEmpaquesSeleccionados = [];
    const existente = window.pedidoEmpaquesSeleccionados.find(e => String(e.id) === String(prod.id));
    if (existente) {
        existente.quantity += qty;
    } else {
        window.pedidoEmpaquesSeleccionados.push({ id: prod.id, name: prod.name, quantity: qty });
    }
    if (cantEl) cantEl.value = 1;
    renderPedidoEmpaquesList();
    if (typeof calcPedidoTotal === 'function') calcPedidoTotal();
}
window.agregarEmpaquePedido = agregarEmpaquePedido;

function renderPedidoEmpaquesList() {
    const list = document.getElementById('pedidoEmpaquesList');
    if (!list) return;
    const items = window.pedidoEmpaquesSeleccionados || [];
    if (!items.length) { list.innerHTML = ''; return; }
    list.innerHTML = items.map((emp, i) => {
        const mp = (window.products || []).find(p => String(p.id) === String(emp.id));
        const costoUnit = parseFloat(mp?.cost || 0);
        const costoTotal = (costoUnit * (emp.quantity || 1)).toFixed(2);
        return `
        <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-lg text-sm">
            <span class="flex-1 text-gray-700">📦 ${emp.name}</span>
            <span class="text-xs text-gray-400">$${costoUnit.toFixed(2)}c/u = <span class="font-semibold text-gray-600">$${costoTotal}</span></span>
            <input type="number" min="1" value="${emp.quantity}"
                onchange="editarCantidadEmpaquePedido(${i}, this.value)"
                class="w-14 px-2 py-0.5 border border-gray-300 rounded-lg text-xs text-center outline-none">
            <button onclick="quitarEmpaquePedido(${i})" class="text-gray-400 hover:text-red-400 text-sm">✕</button>
        </div>`;
    }).join('');
}
window.renderPedidoEmpaquesList = renderPedidoEmpaquesList;

function quitarEmpaquePedido(idx) {
    (window.pedidoEmpaquesSeleccionados || []).splice(idx, 1);
    renderPedidoEmpaquesList();
    if (typeof calcPedidoTotal === 'function') calcPedidoTotal();
}
window.quitarEmpaquePedido = quitarEmpaquePedido;

function editarCantidadEmpaquePedido(idx, valor) {
    const v = parseInt(valor) || 1;
    if (window.pedidoEmpaquesSeleccionados && window.pedidoEmpaquesSeleccionados[idx] != null) {
        window.pedidoEmpaquesSeleccionados[idx].quantity = v;
    }
    renderPedidoEmpaquesList();
    if (typeof calcPedidoTotal === 'function') calcPedidoTotal();
}
window.editarCantidadEmpaquePedido = editarCantidadEmpaquePedido;

function quitarProductoPedido(idx) {
    (window.pedidoProductosSeleccionados || []).splice(idx, 1);
    renderPedidoProductosList();
}
window.quitarProductoPedido = quitarProductoPedido;

function editarPrecioPedidoProducto(idx, valor) {
    const items = window.pedidoProductosSeleccionados || [];
    if (items[idx] !== undefined) {
        items[idx].price = parseFloat(valor) || 0;
        renderPedidoProductosList();
    }
}
window.editarPrecioPedidoProducto = editarPrecioPedidoProducto;

function editarCantidadPedidoProducto(idx, valor) {
    const items = window.pedidoProductosSeleccionados || [];
    if (items[idx] !== undefined) {
        const qty = parseInt(valor) || 1;
        items[idx].quantity = qty;
        // Auto-actualizar precio si es producto variable
        const prod = (window.products || []).find(x => String(x.id) === String(items[idx].id));
        if (prod && prod.tipo === 'producto_variable' && typeof pvGetPrecio === 'function') {
            items[idx].price = pvGetPrecio(prod, qty);
        }
        renderPedidoProductosList();
    }
}
window.editarCantidadPedidoProducto = editarCantidadPedidoProducto;

// ══════════════════════════════════════════════════════════
// ── TICKET / RECIBO PDF DEL PEDIDO ───────────────────────
// ══════════════════════════════════════════════════════════

function generarTicketPedido(id) {
    const p = [...(window.pedidos||[]), ...(window.pedidosFinalizados||[])].find(x => String(x.id) === String(id));
    if (!p) return;
    const cfg = window.storeConfig || {};
    const _e = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
    const fmtFecha = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}); };
    const productos = (p.productosInventario||[]);
    const filasProductos = productos.length > 0
        ? productos.map(it => '<tr><td>'+_e(it.name||it.nombre||'—')+'</td><td style="text-align:center">'+(it.quantity||it.cantidad||1)+'</td><td style="text-align:right">$'+Number(it.price||0).toFixed(2)+'</td><td style="text-align:right">$'+(Number(it.price||0)*(it.quantity||it.cantidad||1)).toFixed(2)+'</td></tr>').join('')
        : '<tr><td colspan="4" style="color:#6b7280;font-style:italic;">'+_e(p.concepto||'Sin detalle')+'</td></tr>';

    const logoHtml = cfg.logoMode === 'image' && cfg.logo
        ? '<img src="'+cfg.logo+'" style="width:60px;height:60px;object-fit:contain;border-radius:10px;">'
        : _e(cfg.emoji||'🐱');

    const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ticket '+_e(p.folio||'')+'</title><style>'
        + '*{box-sizing:border-box;margin:0;padding:0;}'
        + 'body{font-family:"Helvetica Neue",Arial,sans-serif;padding:32px;max-width:480px;margin:auto;color:#1a1a1a;}'
        + '.logo{text-align:center;font-size:2.5rem;margin-bottom:4px;}'
        + '.tienda{text-align:center;font-size:1.3rem;font-weight:800;color:#1a0533;}'
        + '.slogan{text-align:center;font-size:.8rem;color:#6b7280;margin-bottom:4px;}'
        + '.contacto{text-align:center;font-size:.75rem;color:#9ca3af;margin-bottom:12px;}'
        + '.folio-badge{background:#f5ede0;border:1.5px solid #C5A572;border-radius:8px;padding:6px 16px;text-align:center;font-weight:800;color:#92400e;font-size:.9rem;margin-bottom:16px;}'
        + '.divider{border:none;border-top:1.5px dashed #e5e7eb;margin:12px 0;}'
        + '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}'
        + '.info-item label{display:block;font-size:.7rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;}'
        + '.info-item span{font-size:.85rem;font-weight:600;}'
        + 'table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.82rem;}'
        + 'th{background:#f9f5ef;padding:7px 10px;text-align:left;font-weight:700;font-size:.72rem;text-transform:uppercase;color:#92400e;}'
        + 'td{padding:6px 10px;border-bottom:1px solid #f3f4f6;}'
        + '.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem;color:#374151;}'
        + '.total-final{display:flex;justify-content:space-between;padding:10px 0;font-size:1.1rem;font-weight:800;border-top:2px solid #C5A572;color:#1a0533;margin-top:4px;}'
        + '.saldo-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#dc2626;}'
        + '.pagado-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.9rem;font-weight:700;color:#16a34a;}'
        + '.notas{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:.8rem;color:#374151;}'
        + '.footer{text-align:center;font-size:.75rem;color:#9ca3af;margin-top:16px;line-height:1.6;}'
        + '@media print{body{padding:12px;}.no-print{display:none!important;}}'
        + '</style></head><body>'
        + '<div class="logo">'+logoHtml+'</div>'
        + '<div class="tienda">'+_e(cfg.name||'Maneki Store')+'</div>'
        + '<div class="slogan">'+_e(cfg.slogan||'Regalos Personalizados')+'</div>'
        + '<div class="contacto">'+(cfg.phone ? '📱 '+_e(cfg.phone) : '')+(cfg.phone&&cfg.facebook?' · ':'')+(cfg.facebook ? '📘 '+_e(cfg.facebook) : '')+'</div>'
        + '<div class="folio-badge">📋 Pedido '+_e(p.folio||'—')+'</div>'
        + '<hr class="divider">'
        + '<div class="info-grid">'
        + '<div class="info-item"><label>Cliente</label><span>'+_e(p.cliente||'—')+'</span></div>'
        + '<div class="info-item"><label>Teléfono</label><span>'+_e(p.telefono||p.whatsapp||'—')+'</span></div>'
        + '<div class="info-item"><label>Fecha del pedido</label><span>'+fmtFecha(p.fechaPedido)+'</span></div>'
        + '<div class="info-item"><label>Fecha de entrega</label><span>'+fmtFecha(p.entrega)+'</span></div>'
        + (p.lugarEntrega ? '<div class="info-item" style="grid-column:1/-1"><label>Lugar de entrega</label><span>'+_e(p.lugarEntrega)+'</span></div>' : '')
        + '</div>'
        + '<hr class="divider">'
        + '<div style="font-size:.75rem;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Concepto</div>'
        + '<div style="font-size:.85rem;color:#374151;margin-bottom:12px;">'+_e(p.concepto||'—')+'</div>'
        + '<table><thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Total</th></tr></thead>'
        + '<tbody>'+filasProductos+'</tbody></table>'
        + '<hr class="divider">'
        + '<div class="total-final"><span>Total del pedido</span><span>$'+Number(p.total||0).toFixed(2)+'</span></div>'
        + '<div class="total-row"><span>Anticipo recibido</span><span style="color:#16a34a;font-weight:700;">— $'+Number(p.anticipo||0).toFixed(2)+'</span></div>'
        + (Number(p.resta||0) > 0
            ? '<div class="saldo-row"><span>💰 Saldo pendiente</span><span>$'+Number(p.resta||0).toFixed(2)+'</span></div>'
            : '<div class="pagado-row"><span>✅ Liquidado</span><span>$0.00</span></div>')
        + (p.notas ? '<div class="notas"><b>Notas:</b> '+_e(p.notas)+'</div>' : '')
        + '<hr class="divider">'
        + '<div class="footer">'+_e(cfg.footer||'¡Gracias por tu compra!')+'<br>'+(cfg.facebook ? _e(cfg.facebook)+'<br>' : '')+'<span style="color:#C5A572;font-weight:700;">✨ Maneki Store</span></div>'
        + '<div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:10px 16px;display:flex;gap:8px;">'
        + '<button onclick="window.print()" style="flex:1;padding:10px;background:#C5A572;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.9rem;">🖨️ Imprimir / Guardar PDF</button>'
        + '<button onclick="window.close()" style="padding:10px 16px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;">✕ Cerrar</button>'
        + '</div>'
        + '<div style="height:64px;"></div>'
        + '</body></html>';

    const win = window.open('', '_blank', 'width=540,height=780');
    if (!win) { manekiToastExport('Permite ventanas emergentes para ver el ticket', 'warn'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
}
window.generarTicketPedido = generarTicketPedido;


// ══════════════════════════════════════════════════════════
// ── FOTOS DEL PT AL SELECCIONAR EN PEDIDO ────────────────
// ══════════════════════════════════════════════════════════

function _mostrarGaleriaPtEnPedido(prod) {
    let galDiv = document.getElementById('pedidoPtGaleriaStrip');
    if (!galDiv) {
        galDiv = document.createElement('div');
        galDiv.id = 'pedidoPtGaleriaStrip';
        galDiv.style = 'margin-top:8px;';
        const selRow = document.getElementById('pedidoProductoSelRow');
        if (selRow) selRow.appendChild(galDiv);
    }
    const urls = Array.isArray(prod.imageUrls) && prod.imageUrls.length > 0
        ? prod.imageUrls
        : prod.imageUrl ? [prod.imageUrl] : [];
    if (urls.length === 0) { galDiv.innerHTML = ''; return; }
    galDiv.innerHTML = '<div style="font-size:.72rem;color:#92400e;font-weight:700;margin-bottom:6px;">🖼️ Fotos del producto ('+urls.length+')</div>'
        + '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">'
        + urls.map(url => '<img src="'+url+'" onclick="window.open(\''+url+'\',\'_blank\')" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1.5px solid #e5e7eb;flex-shrink:0;cursor:pointer;" title="Ver foto completa">').join('')
        + '</div>';
}
window._mostrarGaleriaPtEnPedido = _mostrarGaleriaPtEnPedido;


// ══════════════════════════════════════════════════════════
// ── CALENDARIO DE ENTREGAS ────────────────────────────────
// ══════════════════════════════════════════════════════════

let _calMes  = new Date().getMonth();
let _calAnio = new Date().getFullYear();

function renderCalendarioPedidos() {
    const cont = document.getElementById('vistaCalendario');
    if (!cont) return;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const pedidos = window.pedidos || [];
    const porFecha = {};
    pedidos.forEach(p => {
        if (!p.entrega) return;
        const key = p.entrega.substring(0,10);
        if (!porFecha[key]) porFecha[key] = [];
        porFecha[key].push(p);
    });
    const primerDia  = new Date(_calAnio, _calMes, 1);
    const ultimoDia  = new Date(_calAnio, _calMes + 1, 0);
    const diasAntes  = primerDia.getDay();
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    let celdas = '';
    for (let i = 0; i < diasAntes; i++) celdas += '<div></div>';
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
        const fecha  = _calAnio+'-'+String(_calMes+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        const esHoy  = new Date(_calAnio, _calMes, d).getTime() === hoy.getTime();
        const items  = porFecha[fecha] || [];
        celdas += '<div style="min-height:80px;border:1px solid #f3f4f6;border-radius:10px;padding:6px;background:'+(esHoy?'#fef9f0':'#fff')+';'+(esHoy?'border-color:#C5A572;border-width:2px;':'')+';">'
            + '<div style="font-size:.75rem;font-weight:'+(esHoy?'800':'600')+';color:'+(esHoy?'#92400e':'#374151')+';margin-bottom:3px;">'+d+(esHoy?' 📍':'')+'</div>'
            + items.slice(0,3).map(p => '<div onclick="openPedidoModal(\''+p.id+'\')" style="font-size:.65rem;background:'+(Number(p.resta||0)>0?'#fef2f2':'#f0fdf4')+';color:'+(Number(p.resta||0)>0?'#991b1b':'#166534')+';border-radius:4px;padding:2px 5px;margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+p.cliente+' — '+p.concepto+'">'+p.folio+' '+p.cliente+'</div>').join('')
            + (items.length > 3 ? '<div style="font-size:.6rem;color:#9ca3af;text-align:center;">+'+(items.length-3)+' más</div>' : '')
            + '</div>';
    }

    cont.innerHTML = '<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
        + '<button onclick="_calNavegar(-1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">‹</button>'
        + '<h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">'+MESES[_calMes]+' '+_calAnio+'</h3>'
        + '<button onclick="_calNavegar(1)" style="padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:.9rem;">›</button>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">'
        + DIAS.map(d => '<div style="text-align:center;font-size:.7rem;font-weight:700;color:#9ca3af;padding:4px 0;">'+d+'</div>').join('')
        + '</div>'
        + '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">'+celdas+'</div>'
        + '<div style="display:flex;gap:12px;margin-top:12px;font-size:.72rem;color:#6b7280;">'
        + '<span><span style="display:inline-block;width:10px;height:10px;background:#fef2f2;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #fca5a5;"></span>Con saldo pendiente</span>'
        + '<span><span style="display:inline-block;width:10px;height:10px;background:#f0fdf4;border-radius:2px;margin-right:4px;vertical-align:middle;border:1px solid #86efac;"></span>Pagado</span>'
        + '</div></div>';
}
window.renderCalendarioPedidos = renderCalendarioPedidos;

function _calNavegar(dir) {
    _calMes += dir;
    if (_calMes > 11) { _calMes = 0; _calAnio++; }
    if (_calMes < 0)  { _calMes = 11; _calAnio--; }
    renderCalendarioPedidos();
}
window._calNavegar = _calNavegar;

// ══════════════════════════════════════════════════════════
// ── RECORDATORIO DE COBRO ─────────────────────────────────
// ══════════════════════════════════════════════════════════

function checkAlertasCobro() {
    const banner = document.getElementById('alertaCobro');
    const lista  = document.getElementById('alertaCobroLista');
    const sub    = document.getElementById('alertaCobroSubtitulo');
    if (!banner || !lista) return;

    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const pedidos = window.pedidos || [];

    // Pedidos con saldo pendiente y entrega vencida o proxima (<=5 dias)
    const pendientes = pedidos.filter(p => {
        const _saldoAlert = typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : Math.max(0, Number(p.total||0) - (p.pagos||[]).reduce((s,ab)=>s+Number(ab.monto||0),0));
        if (_saldoAlert <= 0) return false;
        if (!p.entrega) return false;
        const fe = new Date(p.entrega + 'T00:00:00');
        const diff = Math.round((fe - hoy) / 86400000);
        return diff <= 5;
    }).sort((a, b) => {
        const da = new Date(a.entrega + 'T00:00:00');
        const db = new Date(b.entrega + 'T00:00:00');
        return da - db;
    });

    if (pendientes.length === 0) {
        banner.classList.add('hidden');
        return;
    }

    banner.classList.remove('hidden');
    const vencidos = pendientes.filter(p => {
        const diff = Math.round((new Date(p.entrega + 'T00:00:00') - hoy) / 86400000);
        return diff < 0;
    }).length;
    sub.textContent = pendientes.length + ' pedido' + (pendientes.length > 1 ? 's' : '') + ' con saldo pendiente'
        + (vencidos > 0 ? ' \u00b7 ' + vencidos + ' vencido' + (vencidos > 1 ? 's' : '') : '');

    const _e = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;'));
    lista.innerHTML = pendientes.map(p => {
        const _saldoAlert = typeof calcSaldoPendiente === 'function' ? calcSaldoPendiente(p) : Math.max(0, Number(p.total||0) - (p.pagos||[]).reduce((s,ab)=>s+Number(ab.monto||0),0));
        const fe = new Date(p.entrega + 'T00:00:00');
        const diff = Math.round((fe - hoy) / 86400000);
        let etiquetaDiff = '';
        if (diff < 0)       etiquetaDiff = '<span style="background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\u26d4 Vencido ' + Math.abs(diff) + 'd</span>';
        else if (diff === 0) etiquetaDiff = '<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\uD83D\uDD34 Hoy</span>';
        else if (diff === 1) etiquetaDiff = '<span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\uD83D\uDFE0 Ma\u00f1ana</span>';
        else                 etiquetaDiff = '<span style="background:#fef9f0;color:#78350f;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;">\uD83D\uDFE1 ' + diff + ' d\u00edas</span>';

        const tel = (p.telefono || '').replace(/\D/g,'');
        const msgWA = encodeURIComponent(
            'Hola ' + (p.cliente||'') + ' \uD83D\uDC4B, te recordamos que tu pedido *' + (p.folio||'') + '* '
            + (p.concepto ? '(' + p.concepto + ') ' : '')
            + 'tiene un saldo pendiente de *$' + _saldoAlert.toFixed(2) + '* con fecha de entrega el *' + (p.entrega||'') + '*. '
            + '\u00a1Cualquier duda estamos para ayudarte! \uD83D\uDC31'
        );
        const waHref = tel ? 'https://wa.me/52' + tel + '?text=' + msgWA : '#';

        return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;border-radius:10px;padding:8px 10px;border:1px solid #fecaca;">'
            + '<div style="display:flex;align-items:center;gap:8px;min-width:0;">'
            + etiquetaDiff
            + '<div style="min-width:0;">'
            + '<p style="font-size:.78rem;font-weight:700;color:#1a0533;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + _e(p.folio) + ' \u00b7 ' + _e(p.cliente) + '</p>'
            + '<p style="font-size:.68rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + _e(p.concepto||'') + '</p>'
            + '</div></div>'
            + '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">'
            + '<span style="font-size:.78rem;font-weight:800;color:#dc2626;">$' + _saldoAlert.toFixed(2) + '</span>'
            + (tel
                ? '<a href="' + waHref + '" target="_blank" style="display:flex;align-items:center;gap:3px;background:#25D366;color:#fff;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;text-decoration:none;">\uD83D\uDCF2 Cobrar</a>'
                : '<button onclick="openPedidoModal(\'' + p.id + '\')" style="background:#e5e7eb;color:#374151;border-radius:8px;padding:4px 8px;font-size:.7rem;font-weight:700;border:none;cursor:pointer;">Ver</button>'
              )
            + '</div></div>';
    }).join('');
}
window.checkAlertasCobro = checkAlertasCobro;


// ══════════════════════════════════════════════════════════
// ── ETIQUETA IMPRIMIBLE ───────────────────────────────────
// ══════════════════════════════════════════════════════════

function imprimirEtiquetaPedido(id) {
    const p = (window.pedidos || []).find(x => x.id === id)
           || (window.pedidosFinalizados || []).find(x => x.id === id);
    if (!p) return;

    const productos = Array.isArray(p.productosInventario) && p.productosInventario.length > 0
        ? p.productosInventario.map(item => {
            const qty  = item.quantity || item.cantidad || 1;
            const name = item.name || item.nombre || item.id || '\u2014';
            const price = Number(item.price || item.precio || 0);
            return qty + 'x ' + name + (price > 0 ? '  $' + price.toFixed(2) : '');
          }).join('\n')
        : (p.concepto || '\u2014');

    const total     = Number(p.total    || 0).toFixed(2);
    const anticipo  = Number(p.anticipo || 0).toFixed(2);
    const resta     = Math.max(0, Number(p.resta || 0)).toFixed(2);
    // FIX-6: usar _fechaHoy() para evitar UTC shift; reformatear a dd/mm/yyyy para mostrar
    const _hoyISO = typeof _fechaHoy === 'function' ? _fechaHoy() : (()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
    const fechaImpresion = _hoyISO.split('-').reverse().join('/');

    const _ee = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const html = '<!DOCTYPE html>\n'
        + '<html lang="es"><head><meta charset="UTF-8"><title>Etiqueta ' + _ee(p.folio||'') + '</title>'
        + '<style>'
        + '@page{size:10cm 15cm;margin:0;}'
        + '*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}'
        + 'body{width:10cm;min-height:15cm;padding:10px;background:#fff;}'
        + '.hdr{border-bottom:2px solid #C5A572;padding-bottom:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;}'
        + '.brand{font-size:13px;font-weight:900;color:#1a0533;}'
        + '.folio{font-size:11px;font-weight:800;color:#C5A572;text-align:right;}'
        + '.row{margin-bottom:6px;}'
        + '.lbl{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;font-weight:700;}'
        + '.val{font-size:10px;color:#1a0533;font-weight:600;}'
        + '.val.big{font-size:13px;font-weight:900;}'
        + '.prods{background:#faf7f2;border-radius:6px;padding:6px 8px;margin-bottom:6px;}'
        + '.prods .val{font-size:9px;white-space:pre-line;}'
        + '.tots{border-top:1.5px dashed #e5e7eb;padding-top:6px;margin-top:4px;}'
        + '.trow{display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px;color:#374151;}'
        + '.trow.main{font-size:11px;font-weight:800;color:#1a0533;}'
        + '.trow.red{color:#dc2626;font-weight:800;}'
        + '.footer{margin-top:10px;text-align:center;font-size:7.5px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;}'
        + '.badge{display:inline-block;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700;}'
        + '</style></head><body>'
        + '<div class="hdr">'
        +   '<div><div class="brand">\uD83D\uDC31 Maneki Store</div>'
        +   '<div style="font-size:8px;color:#6b7280;">Regalos personalizados \u00b7 Monterrey</div></div>'
        +   '<div><div class="folio">' + _ee(p.folio||'') + '</div>'
        +   '<div style="font-size:8px;color:#9ca3af;text-align:right;">Imp. ' + fechaImpresion + '</div></div>'
        + '</div>'
        + '<div class="row"><div class="lbl">Cliente</div>'
        +   '<div class="val big">' + _ee(p.cliente||'\u2014') + '</div>'
        +   (p.telefono ? '<div style="font-size:9px;color:#6b7280;">\uD83D\uDCF1 ' + _ee(p.telefono) + '</div>' : '')
        + '</div>'
        + (p.entrega
            ? '<div class="row"><div class="lbl">Fecha de entrega</div>'
            + '<div class="val big" style="color:#C5A572;">\uD83D\uDCC5 ' + _ee(p.entrega) + '</div></div>'
            : '')
        + (p.lugarEntrega
            ? '<div class="row"><div class="lbl">Lugar de entrega</div>'
            + '<div class="val">\uD83D\uDCCD ' + _ee(p.lugarEntrega) + '</div></div>'
            : '')
        + '<div class="prods"><div class="lbl" style="margin-bottom:3px;">Productos / Concepto</div>'
        +   '<div class="val">' + _ee(productos) + '</div></div>'
        + (p.notas
            ? '<div class="row"><div class="lbl">Notas</div>'
            + '<div class="val" style="font-size:9px;color:#6b7280;">' + _ee(p.notas) + '</div></div>'
            : '')
        + '<div class="tots">'
        +   '<div class="trow main"><span>Total</span><span>$' + total + '</span></div>'
        +   '<div class="trow"><span>Anticipo recibido</span><span>$' + anticipo + '</span></div>'
        +   '<div class="trow red"><span>Saldo pendiente</span><span>$' + resta + '</span></div>'
        + '</div>'
        + '<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">'
        +   '<span class="badge">' + _ee(p.status||'Pendiente') + '</span>'
        +   '<span style="font-size:7.5px;color:#9ca3af;">Maneki POS</span>'
        + '</div>'
        + '<div class="footer">\u00a1Gracias por tu pedido! \u00b7 manekistore.com</div>'
        + '</body></html>';

    const win = window.open('', '_blank', 'width=420,height=620');
    if (!win) { alert('Activa las ventanas emergentes para imprimir la etiqueta.'); return; }
    win.document.write(html);
    win.document.close();
    win.onload = function() { setTimeout(function() { win.focus(); win.print(); }, 200); };
}
window.imprimirEtiquetaPedido = imprimirEtiquetaPedido;

// ── Recordatorio de entregas próximas (Telegram + toast) ──────────────────
async function verificarEntregasProximas({ silencioso = false } = {}) {
    const cfg = window.storeConfig || {};
    const BOT_TOKEN = cfg.telegramBotToken;
    if (!BOT_TOKEN) { console.debug('Telegram: telegramBotToken no configurado, omitiendo recordatorio de entregas.'); return; }
    const chatIds = [cfg.telegramChatId1, cfg.telegramChatId2].filter(Boolean);

    const hoy   = new Date(); hoy.setHours(0,0,0,0);
    const en24  = new Date(hoy); en24.setDate(en24.getDate() + 1);
    const en48  = new Date(hoy); en48.setDate(en48.getDate() + 2);

    const activos = window.pedidos || [];
    const proximos = activos.filter(p => {
        if (!p.entrega) return false;
        if (p.status === 'cancelado') return false;
        const fe = new Date(p.entrega + 'T00:00:00');
        return fe >= hoy && fe <= en48;
    });

    const vencidos = activos.filter(p => {
        if (!p.entrega) return false;
        if (p.status === 'cancelado') return false;
        const fe = new Date(p.entrega + 'T00:00:00');
        return fe < hoy;
    });

    const total = proximos.length + vencidos.length;
    if (total === 0) {
        if (!silencioso) manekiToastExport('✅ Sin entregas pendientes en las próximas 48 hrs', 'ok');
        return;
    }

    // Toast en la app
    if (proximos.length) manekiToastExport(`🔔 ${proximos.length} entrega(s) en las próximas 48 hrs`, 'warn');
    if (vencidos.length) manekiToastExport(`🚨 ${vencidos.length} entrega(s) VENCIDA(S)`, 'err');

    // Mensaje Telegram
    if (!chatIds.length) return;

    const fmt = fecha => {
        if (!fecha) return '—';
        const [y,m,d] = fecha.split('-');
        return `${d}/${m}/${y}`;
    };

    const lineas = [];
    if (vencidos.length) {
        lineas.push(`🚨 *VENCIDOS (${vencidos.length}):*`);
        vencidos.forEach(p => lineas.push(`  • [${p.folio}] ${p.cliente} — entrega: ${fmt(p.entrega)} — ${p.status||'confirmado'}`));
    }
    if (proximos.length) {
        lineas.push(`🔔 *Próximos 48 hrs (${proximos.length}):*`);
        proximos.forEach(p => {
            const fe = new Date(p.entrega + 'T00:00:00');
            const esHoy   = fe.getTime() === hoy.getTime();
            const esManana = fe.getTime() === en24.getTime();
            const cuando  = esHoy ? '🔴 HOY' : esManana ? '🟡 Mañana' : '🟢 Pasado mañana';
            lineas.push(`  • [${p.folio}] ${p.cliente} — ${cuando} (${fmt(p.entrega)}) — ${p.status||'confirmado'}`);
        });
    }

    const msg = `📦 *Recordatorio de entregas — Maneki Store*\n\n${lineas.join('\n')}`;
    for (const chatId of chatIds) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
            });
        } catch(e) { console.warn('Telegram entrega reminder error:', e); }
    }
}
window.verificarEntregasProximas = verificarEntregasProximas;

// Ejecutar automáticamente al cargar y cada 12 horas
(function initRecordatorioEntregas() {
    // Esperar a que los datos estén cargados antes del primer chequeo
    setTimeout(() => verificarEntregasProximas({ silencioso: true }), 8000);
    setInterval(() => verificarEntregasProximas({ silencioso: true }), 12 * 60 * 60 * 1000);
})();
