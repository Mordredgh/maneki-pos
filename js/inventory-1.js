// ============== INVENTORY MODULE ==============
// ── Fallback: showSection puede no estar definida todavía al cargar este módulo ──
// design-system.js la define más tarde — este fallback evita ReferenceError
if (typeof window.showSection === 'undefined') {
    window.showSection = function(name) {
        // Fallback: intentar ocultar/mostrar secciones manualmente
        document.querySelectorAll('section[id$="-section"], section[id$="Section"]').forEach(s => {
            s.classList.add('hidden');
            s.style.display = '';
        });
        const sec = document.getElementById(name + '-section') || document.getElementById(name + 'Section');
        if (sec) { sec.classList.remove('hidden'); }
    };
}
// ── Helper: círculo de color para variantes ──
// Uso HTML (modales, tablas):  _mkColorDot('Color', 'Rojo')
// Uso select (emoji):          _mkColorEmoji('Color', 'Rojo')
(function(){
    const COLORES = {
        rojo:'#ef4444', roja:'#ef4444', red:'#ef4444',
        azul:'#3b82f6', azules:'#3b82f6', blue:'#3b82f6', 'azul marino':'#1e3a8a', 'marino':'#1e3a8a',
        verde:'#22c55e', green:'#22c55e',
        amarillo:'#eab308', amarilla:'#eab308', yellow:'#eab308', dorado:'#d97706', gold:'#d97706',
        negro:'#1f2937', negra:'#1f2937', black:'#1f2937',
        blanco:'#f9fafb', blanca:'#f9fafb', white:'#f9fafb',
        rosa:'#ec4899', pink:'#ec4899', 'rosa mexicano':'#e91e8c',
        morado:'#a855f7', morada:'#a855f7', violeta:'#8b5cf6', lila:'#c084fc', lavanda:'#c4b5fd', purple:'#a855f7',
        naranja:'#f97316', orange:'#f97316',
        gris:'#9ca3af', grise:'#9ca3af', gray:'#9ca3af', grey:'#9ca3af', plateado:'#94a3b8', silver:'#94a3b8',
        café:'#92400e', cafe:'#92400e', 'marrón':'#92400e', marron:'#92400e', brown:'#78350f', beige:'#e5c9a0', crema:'#fef3c7',
        turquesa:'#06b6d4', celeste:'#7dd3fc', cian:'#22d3ee', cyan:'#22d3ee', aqua:'#22d3ee',
        coral:'#f87171', salmon:'#fca5a5', salmón:'#fca5a5',
        oliva:'#84cc16', olive:'#65a30d',
        magenta:'#e879f9', fucsia:'#e879f9', fuchsia:'#e879f9',
        vino:'#9f1239', burgundy:'#9f1239', guinda:'#9f1239',
        indigo:'#6366f1',
        'azul cielo':'#7dd3fc', 'azul rey':'#2563eb', 'azul claro':'#93c5fd',
        'verde militar':'#4d7c0f', 'verde limón':'#a3e635', 'verde menta':'#6ee7b7', 'verde oliva':'#65a30d',
        'rojo vino':'#9f1239',
    };
    const EMOJI = {
        rojo:'🔴', roja:'🔴', red:'🔴',
        azul:'🔵', blue:'🔵', 'azul marino':'🔵', marino:'🔵',
        verde:'🟢', green:'🟢',
        amarillo:'🟡', amarilla:'🟡', yellow:'🟡', dorado:'🟡', gold:'🟡',
        negro:'⚫', negra:'⚫', black:'⚫',
        blanco:'⚪', blanca:'⚪', white:'⚪',
        rosa:'🩷', pink:'🩷', 'rosa mexicano':'🩷',
        morado:'🟣', morada:'🟣', violeta:'🟣', lila:'🟣', purple:'🟣',
        naranja:'🟠', orange:'🟠',
        café:'🟤', cafe:'🟤', marrón:'🟤', marron:'🟤', brown:'🟤', beige:'🟤', crema:'🟡',
        gris:'🩶', plateado:'🩶', silver:'🩶', gray:'🩶', grey:'🩶',
        turquesa:'🔵', celeste:'🔵', cian:'🔵', cyan:'🔵',
        coral:'🔴', salmon:'🩷', salmón:'🩷',
        vino:'🔴', burgundy:'🔴', guinda:'🔴',
        magenta:'🟣', fucsia:'🟣', fuchsia:'🟣',
        indigo:'🟣',
    };
    const esColor = t => /color|colour|color\s*\/\s*tono/i.test(t||'');
    window._mkColorDot = function(tipo, valor) {
        if (!esColor(tipo)) return `<span style="font-weight:600;">${valor}</span>`;
        const key = (valor||'').toLowerCase().trim();
        const css = COLORES[key];
        const borde = (key === 'blanco' || key === 'blanca' || key === 'white' || key === 'crema') ? '#d1d5db' : 'transparent';
        if (css) return `<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${css};border:1.5px solid ${borde};flex-shrink:0;"></span>${valor}</span>`;
        // Color no mapeado: mostrar circulo con texto como color CSS directo si es válido
        return `<span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;">
            <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${valor.startsWith('#')||/^(rgb|hsl)/.test(valor)?valor:'#d1d5db'};border:1.5px solid #e5e7eb;flex-shrink:0;"></span>${valor}</span>`;
    };
    window._mkColorEmoji = function(tipo, valor) {
        if (!esColor(tipo)) return valor;
        const key = (valor||'').toLowerCase().trim();
        const em = EMOJI[key];
        return em ? `${em} ${valor}` : valor;
    };
})();

// ── Helper: normalizar texto para búsquedas sin problema de acentos/diacríticos ──
window._normSearch = function _normSearch(str) {
    return String(str || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // quita diacríticos
};

// ── Helper financiero: redondeo correcto de dinero (evita 0.1+0.2=0.30000000000004) ──
// Usa "multiply-round-divide" para operar siempre en centavos enteros.
// Uso: _money(precio * cantidad) en lugar de precio * cantidad directamente.
window._money = function(v) { return Math.round((parseFloat(v) || 0) * 100) / 100; };
// Suma un arreglo de elementos con precio × cantidad, redondeando cada línea primero.
window._sumLineas = function(items, precioKey, cantKey) {
    precioKey = precioKey || 'price'; cantKey = cantKey || 'quantity';
    return items.reduce((s, it) => {
        const linea = Math.round((parseFloat(it[precioKey]) || 0) * 100) * (parseInt(it[cantKey]) || 1);
        return s + linea;
    }, 0) / 100;
};

// v3.0 — Modales separados para Producto Terminado y Materia Prima
//   • Botones separados para cada tipo de producto
//   • Modal de Materia Prima con tags de materiales específicos
//   • Modal de Producto Terminado sin proveedor/notas
//   • Variantes con cantidad editable directamente

// ── Estado global en window (safe para multi-script) ──────────────────────
window._ajustarStockId         = window._ajustarStockId         ?? null;
window.currentVariants         = window.currentVariants         ?? [];
window.currentProductImage     = window.currentProductImage     ?? null;
window.currentProductImageFile = window.currentProductImageFile ?? null;
window.modoEdicion             = window.modoEdicion             ?? false;
window.edicionProductoId       = window.edicionProductoId       ?? null;
window._invSortCol             = window._invSortCol             ?? null;
window._invSortDir             = window._invSortDir             ?? 'asc';
window._invCurrentPage         = window._invCurrentPage         ?? 1;
window._invPageSize            = window._invPageSize            ?? 10;
// stockMovements apunta al mismo array que stockMovimientos (cargado vía sbLoad en config.js)
// Si aún no cargó (orden de scripts), se inicializa vacío y se sincroniza en DOMContentLoaded
window.stockMovements = window.stockMovements ?? window.stockMovimientos ?? [];
window._kitComponentes         = window._kitComponentes         ?? [];

// ── Historial de movimientos ───────────────────────────────────────────────
function saveStockMovements() {
    // Guardar en SQLite + Supabase (mismo canal que el resto de los datos)
    window.stockMovimientos = window.stockMovements; // mantener ambas referencias sincronizadas
    sbSave('stockMovimientos', window.stockMovements);
}

function registrarMovimiento({ productoId, productoNombre, tipo, cantidad, motivo, stockAntes, stockDespues }) {
    window.stockMovements.unshift({
        id:             (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(),
        fecha:          new Date().toISOString(),
        productoId, productoNombre, tipo, cantidad,
        motivo:         motivo || '',
        stockAntes, stockDespues
    });
    if (window.stockMovements.length > 500) window.stockMovements = window.stockMovements.slice(0, 500); // BUG-012 FIX: conservar los 500 más recientes (unshift → index 0 = más nuevo → slice(0,500) = primeros 500 = más recientes)
    saveStockMovements();
}
window.registrarMovimiento = registrarMovimiento;

// ── Helpers ────────────────────────────────────────────────────────────────
// BUG-NEW-11 FIX: no re-declarar _esc con const — causa SyntaxError si db.js
// ya la declaró en el mismo scope global. Usar guard typeof en su lugar.
if (typeof _esc === 'undefined') {
    window._esc = function(str) {
        if (str == null) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
    };
}

function _genId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID)
        return 'p' + crypto.randomUUID().replace(/-/g, '');
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Si el producto tiene variantes, el stock es la suma de todas las variantes
function getStockEfectivo(product) {
    if (product.variants && product.variants.length > 0) {
        return product.variants.reduce((sum, v) => sum + (parseInt(v.qty) || 0), 0);
    }
    // Si NO tiene variantes pero SÍ componentes, el stock es el mínimo posible a fabricar
    if (product.mpComponentes && product.mpComponentes.length > 0) {
        const allServices = product.mpComponentes.every(c => {
            const mp = (window.products||[]).find(x=>String(x.id)===String(c.id));
            return mp && mp.tipo === 'servicio';
        });
        if (allServices) return parseInt(product.stock) || 0; // Si son puros servicios, usa el stock manual
        
        let minPiezas = Infinity;
        product.mpComponentes.forEach(c => {
            const mp = (window.products||[]).find(x=>String(x.id)===String(c.id));
            if (mp && mp.tipo !== 'servicio') {
                const stockMp = mp.stock || 0;
                const qty = parseFloat(c.qty) || 1;
                const pzas = Math.floor(stockMp / qty);
                if (pzas < minPiezas) minPiezas = pzas;
            }
        });
        
        // Sumamos el stock manual existente al que se puede fabricar
        // para que si el usuario tiene stock ya hecho en tienda se tome en cuenta.
        const stockManual = parseInt(product.stock) || 0;
        const stockFabricable = minPiezas === Infinity ? 0 : minPiezas;
        return stockManual + stockFabricable;
    }
    
    return parseInt(product.stock) || 0;
}
window.getStockEfectivo = getStockEfectivo;

// ── Lista de compras automática ──────────────────────────────────────────────
function mostrarListaCompras(esRerender) {
    // Resetear checkboxes solo en apertura fresca (no en re-renders por toggle)
    if (!esRerender) window._listaComprasChecked = {};
    // Pedidos que aún no han sido descontados del inventario
    const estadosPendientes = ['confirmado', 'pago', 'produccion', 'envio', 'salida', 'retirar'];
    const pedidosPendientes = (window.pedidos || []).filter(p =>
        estadosPendientes.includes(p.status) && !p.inventarioDescontado
    );

    // Acumular necesidades por producto+variante
    const necesidades = {};
    pedidosPendientes.forEach(ped => {
        (ped.productosInventario || []).forEach(item => {
            const key = (item.id || item.name) + '|' + (item.variante || item.variant || '');
            if (!(item.id || item.name)) return;
            if (!necesidades[key]) {
                necesidades[key] = {
                    id: item.id, nombre: item.name || item.nombre,
                    variante: item.variante || item.variant || '',
                    necesario: 0, pedidosRef: []
                };
            }
            necesidades[key].necesario += (item.quantity || item.cantidad || 1);
            necesidades[key].pedidosRef.push(ped.folio || ped.id);
        });
    });

    // Comparar con stock actual
    const resultado = Object.values(necesidades).map(n => {
        const prod = (window.products || []).find(p => String(p.id) === String(n.id));
        let disponible = 0;
        if (prod) {
            if (n.variante) {
                const variante = (prod.variants || []).find(v =>
                    v.value === n.variante ||
                    `${v.type}: ${v.value}` === n.variante
                );
                disponible = variante ? (variante.qty || 0) : getStockEfectivo(prod);
            } else {
                disponible = typeof getStockEfectivo === 'function' ? getStockEfectivo(prod) : (prod.stock || 0);
            }
        }
        const faltan = Math.max(0, n.necesario - disponible);
        return { ...n, disponible, faltan };
    }).sort((a, b) => b.faltan - a.faltan);

    // A1: Enriquecer resultados con costo unitario del producto
    resultado.forEach(r => {
        const prod = (window.products || []).find(p => String(p.id) === String(r.id));
        r.costoUnit = prod ? (parseFloat(prod.cost) || 0) : 0;
        r.costoTotal = r.faltan * r.costoUnit;
    });

    const content = document.getElementById('listaComprasContent');
    if (!content) return;

    if (resultado.length === 0) {
        content.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:32px 0;font-size:.875rem;">No hay pedidos activos con materiales asignados.</p>';
    } else {
        const faltantes = resultado.filter(r => r.faltan > 0);
        const suficientes = resultado.filter(r => r.faltan === 0);

        let html = '';

        if (faltantes.length > 0) {
            const totalEstimado = faltantes.reduce((s, r) => s + r.costoTotal, 0);
            html += `<p style="font-size:.7rem;font-weight:800;color:#b45309;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">⚠️ Necesitas comprar (${faltantes.length})</p>`;
            html += `<table style="width:100%;border-collapse:collapse;font-size:.78rem;margin-bottom:4px;">
                <thead><tr style="background:#fef9c3;color:#92400e;font-size:.68rem;">
                    <th style="padding:6px 8px;text-align:left;border-bottom:1px solid #fcd34d;">Producto</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Stock</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Necesitas</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">Faltan</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo c/u</th>
                    <th style="padding:6px 8px;text-align:right;border-bottom:1px solid #fcd34d;">Costo est.</th>
                    <th style="padding:6px 8px;text-align:center;border-bottom:1px solid #fcd34d;">✓</th>
                </tr></thead><tbody>`;
            faltantes.forEach(r => {
                const key = (r.id || r.nombre) + '|' + (r.variante || '');
                const comprado = !!window._listaComprasChecked[key];
                const rowStyle = comprado
                    ? 'background:#f0fdf4;text-decoration:line-through;color:#6b7280;'
                    : 'background:#fef3c7;';
                const escapedKey = key.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
                const prod = (window.products || []).find(p => String(p.id) === String(r.id));
                const provUrl = prod && prod.proveedorUrl ? prod.proveedorUrl.trim() : '';
                const buyBtn = provUrl
                    ? `<a href="${_esc(provUrl)}" target="_blank" style="display:inline-block;margin-top:3px;font-size:.65rem;padding:2px 6px;border-radius:999px;background:#dbeafe;color:#1d4ed8;text-decoration:none;font-weight:700;">🛒 Comprar</a>`
                    : '';
                html += `<tr style="${rowStyle}border-bottom:1px solid #fde68a;">
                    <td style="padding:8px 8px;">
                        <span style="font-weight:700;">${_esc(r.nombre)}</span>${r.variante ? ` <span style="font-weight:400;color:#92400e;font-size:.7rem;">(${_esc(r.variante)})</span>` : ''}
                        <div style="font-size:.65rem;color:#9ca3af;">Pedidos: ${[...new Set(r.pedidosRef)].join(', ')}</div>
                        ${buyBtn}
                    </td>
                    <td style="text-align:center;padding:8px 6px;">${r.disponible}</td>
                    <td style="text-align:center;padding:8px 6px;">${r.necesario}</td>
                    <td style="text-align:center;padding:8px 6px;font-weight:900;color:#d97706;">${r.faltan}</td>
                    <td style="text-align:right;padding:8px 6px;">${r.costoUnit > 0 ? '$'+r.costoUnit.toFixed(2) : '—'}</td>
                    <td style="text-align:right;padding:8px 6px;font-weight:700;color:#b45309;">${r.costoTotal > 0 ? '$'+r.costoTotal.toFixed(2) : '—'}</td>
                    <td style="text-align:center;padding:8px 6px;">
                        ${comprado
                            ? '<span style="color:#16a34a;font-size:.75rem;font-weight:700;">✓ Comprado</span>'
                            : `<input type="checkbox" onchange="window._lcToggleComprado('${escapedKey}')" style="width:16px;height:16px;cursor:pointer;">`}
                    </td>
                </tr>`;
            });
            html += `</tbody><tfoot><tr style="background:#fef9c3;font-weight:800;color:#b45309;">
                <td colspan="5" style="padding:8px 8px;text-align:right;font-size:.78rem;">💰 Total estimado:</td>
                <td style="padding:8px 6px;text-align:right;font-size:.85rem;">$${totalEstimado.toFixed(2)}</td>
                <td></td>
            </tr></tfoot></table>`;
        }

        if (suficientes.length > 0) {
            html += `<p style="font-size:.7rem;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;margin:16px 0 8px;">✅ Stock suficiente (${suficientes.length})</p>`;
            html += suficientes.map(r => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:4px;">
                    <p style="font-size:.8rem;font-weight:600;color:#374151;">${_esc(r.nombre)}${r.variante ? ` <span style="font-weight:400;color:#6b7280;">(${_esc(r.variante)})</span>` : ''}</p>
                    <p style="font-size:.78rem;color:#16a34a;font-weight:700;">Stock: ${r.disponible} / Necesitas: ${r.necesario}</p>
                </div>`).join('');
        }

        if (faltantes.length === 0) {
            html = '<p style="color:#16a34a;text-align:center;padding:12px 0;font-size:.9rem;font-weight:700;">✅ Tienes stock suficiente para todos los pedidos activos.</p>' + html;
        }

        // A3 & A4: Botones WhatsApp y CSV
        if (faltantes.length > 0) {
            html += `<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
                <button onclick="window._lcWhatsApp()" style="flex:1;min-width:160px;background:#25d366;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">📲 Enviar por WhatsApp al proveedor</button>
                <button onclick="window._lcExportCSV()" style="flex:1;min-width:140px;background:#3b82f6;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:.82rem;font-weight:700;cursor:pointer;">📥 Exportar CSV</button>
            </div>`;
        }

        content.innerHTML = html;
    }

    // A2: Toggle checkbox "ya comprado" — re-render conservando estado
    window._lcToggleComprado = function(key) {
        if (!window._listaComprasChecked) window._listaComprasChecked = {};
        window._listaComprasChecked[key] = true;
        mostrarListaCompras(true); // esRerender=true para no resetear checkboxes
    };

    // A3: Abrir WhatsApp con la lista de compras
    window._lcWhatsApp = function() {
        const faltantes = resultado.filter(r => r.faltan > 0);
        if (!faltantes.length) return;
        const fecha = _fechaHoy();
        const totalEst = faltantes.reduce((s, r) => s + r.costoTotal, 0);
        let msg = `📦 Lista de compras Maneki Store\nFecha: ${fecha}\n\n`;
        faltantes.forEach(r => {
            const nombre = r.nombre + (r.variante ? ` (${r.variante})` : '');
            if (r.costoUnit > 0) {
                msg += `• ${nombre}: ${r.faltan} uds ($${r.costoUnit.toFixed(2)} c/u = $${r.costoTotal.toFixed(2)})\n`;
            } else {
                msg += `• ${nombre}: ${r.faltan} uds\n`;
            }
        });
        if (totalEst > 0) msg += `\n💰 Total estimado: $${totalEst.toFixed(2)}`;
        const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
    };

    // A4: Exportar lista de compras como CSV
    window._lcExportCSV = function() {
        const faltantes = resultado.filter(r => r.faltan > 0);
        const headers = ['Producto','Variante','Cantidad requerida','Stock actual','Faltante','Costo unitario','Costo total'];
        const rows = faltantes.map(r => [
            r.nombre, r.variante || '', r.necesario, r.disponible, r.faltan,
            r.costoUnit.toFixed(2), r.costoTotal.toFixed(2)
        ]);
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') + '\n';
        });
        const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lista-compras-${_fechaHoy()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    openModal('listaComprasModal');
}
window.mostrarListaCompras = mostrarListaCompras;

// Sincroniza el campo stock del producto con la suma de sus variantes
function syncStockFromVariants(product) {
    if (product.variants && product.variants.length > 0) {
        product.stock = product.variants.reduce((sum, v) => sum + (parseInt(v.qty) || 0), 0);
    }
}

// ── Imagen ─────────────────────────────────────────────────────────────────
function setupImageUpload() {
    ['productImage','mpProductImage'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (!input || input._mkBound) return;
        input._mkBound = true;
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            window.currentProductImageFile = file;
            const reader = new FileReader();
            const isMp = inputId === 'mpProductImage';
            reader.onload = ev => {
                const img = document.getElementById(isMp ? 'mpPreviewImg' : 'previewImg');
                const pre = document.getElementById(isMp ? 'mpImagePreview' : 'imagePreview');
                if (img) img.src = ev.target.result;
                if (pre) pre.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });
    });
}
window.setupImageUpload = setupImageUpload;

// ── Sort ───────────────────────────────────────────────────────────────────
function sortInventory(col) {
    window._invSortDir = window._invSortCol === col
        ? (window._invSortDir === 'asc' ? 'desc' : 'asc')
        : 'asc';
    window._invSortCol = col;
    window._invCurrentPage = 1; // volver a página 1 al ordenar
    document.querySelectorAll('.sortable-th').forEach(th => {
        th.classList.remove('asc','desc');
        if (th.getAttribute('onclick') === `sortInventory('${col}')`) th.classList.add(window._invSortDir);
    });
    renderInventoryTable();
}
window.sortInventory = sortInventory;

// ── Alertas de stock bajo ──────────────────────────────────────────────────
let _lastTelegramAlert = window._lastTelegramStockAlert || 0;
function checkStockAlerts() {
    const todos    = window.products||[];
    const agotados = todos.filter(p => getStockEfectivo(p) === 0);
    const bajos    = todos.filter(p => { const s = getStockEfectivo(p); return s > 0 && s <= (p.puntoReorden ?? p.stockMin ?? 5); });
    const mpBajas  = bajos.filter(p => p.tipo === 'materia_prima');
    const mpAgotadas = agotados.filter(p => p.tipo === 'materia_prima');

    if (agotados.length) manekiToastExport(`🔴 ${agotados.length} producto(s) agotado(s)`, 'warn');
    if (bajos.length)    manekiToastExport(`⚠️ ${bajos.length} producto(s) con stock bajo`, 'warn');
    // Alerta específica para materias primas — bloquean producción
    if (mpAgotadas.length) manekiToastExport(`🏭 ${mpAgotadas.length} materia(s) prima(s) AGOTADAS — producción bloqueada`, 'err');
    else if (mpBajas.length) manekiToastExport(`🏭 ${mpBajas.length} materia(s) prima(s) con stock bajo`, 'warn');

    // Actualizar badge MP crítico en sidebar/inventario si existe
    const mpBadge = document.getElementById('sidebarBadgeMP');
    if (mpBadge) {
        const total = mpBajas.length + mpAgotadas.length;
        if (total > 0) { mpBadge.textContent = total; mpBadge.style.display = 'inline-block'; }
        else mpBadge.style.display = 'none';
    }

    // Notificar por Telegram si hay productos críticos
    const hayProblemas = agotados.length > 0 || bajos.length > 0;
    if (hayProblemas) _notificarStockTelegram({ agotados, bajos, mpAgotadas, mpBajas });
    // Alerta WhatsApp para MP crítica
    if (mpAgotadas.length || mpBajas.length) _alertaStockWA(mpAgotadas, mpBajas);
}
window.checkStockAlerts = checkStockAlerts;

// ── Notificación Telegram para stock bajo ──────────────────────────────────
async function _notificarStockTelegram({ agotados, bajos, mpAgotadas, mpBajas }) {
    const now = Date.now();
    if (now - _lastTelegramAlert < 60 * 60 * 1000) return; // máximo 1 alerta por hora
    window._lastTelegramStockAlert = now;
    _lastTelegramAlert = now;
    const cfg = window.storeConfig || {};
    const BOT_TOKEN = cfg.telegramBotToken;
    if (!BOT_TOKEN) { console.warn('Telegram: telegramBotToken no configurado, omitiendo notificación de stock.'); return; }
    // Chat IDs configurables — hasta 2 destinatarios
    const chatIds = [cfg.telegramChatId1, cfg.telegramChatId2].filter(Boolean);
    if (!chatIds.length) return; // No configurado → sin enviar

    const lineas = [];
    if (agotados.length) {
        lineas.push(`🔴 *Agotados (${agotados.length}):*`);
        agotados.slice(0,10).forEach(p => lineas.push(`  • ${p.name} — stock: 0`));
    }
    if (bajos.length) {
        lineas.push(`⚠️ *Stock bajo (${bajos.length}):*`);
        bajos.slice(0,10).forEach(p => lineas.push(`  • ${p.name} — stock: ${p.stock} (mín: ${p.stockMin||5})`));
    }
    if (mpAgotadas.length) lineas.push(`🏭 *MP AGOTADAS — producción bloqueada:* ${mpAgotadas.map(p=>p.name).join(', ')}`);

    const msg = `📦 *Alerta de inventario — Maneki Store*\n\n${lineas.join('\n')}`;
    for (const chatId of chatIds) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
            });
        } catch(e) { console.warn('Telegram stock alert error:', e); }
    }
}
window._notificarStockTelegram = _notificarStockTelegram;

// ── Alerta flotante de WhatsApp para MP agotada/baja ──────────────────────
function _alertaStockWA(agotadas, bajas) {
    const existente = document.getElementById('_mkStockWAAlert');
    if (existente) existente.remove();
    const partes = [];
    if (agotadas.length) partes.push(`🔴 Agotadas: ${agotadas.map(p=>p.name).join(', ')}`);
    if (bajas.length)    partes.push(`⚠️ Stock bajo: ${bajas.map(p=>p.name).join(', ')}`);
    const msgWA = encodeURIComponent(`🏭 *Maneki — Alerta de Inventario*\n\n${partes.join('\n')}\n\n_Reabastece pronto para no detener producción._`);
    const div = document.createElement('div');
    div.id = '_mkStockWAAlert';
    div.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;border:2px solid #25D366;border-radius:14px;padding:14px 18px;box-shadow:0 4px 24px rgba(0,0,0,0.15);max-width:300px;font-size:13px;line-height:1.4;';
    div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#1f2937;font-size:14px;">🏭 MP crítica</strong>
            <button onclick="document.getElementById('_mkStockWAAlert').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;line-height:1;">×</button>
        </div>
        <div style="color:#6b7280;margin-bottom:10px;">${partes.join('<br>')}</div>
        <button onclick="window.open('https://api.whatsapp.com/send?text=${msgWA}','_blank')" style="width:100%;padding:8px 12px;background:#25D366;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">
            📱 Avisar por WhatsApp
        </button>`;
    document.body.appendChild(div);
}
window._alertaStockWA = _alertaStockWA;

// ── Exportar CSV ───────────────────────────────────────────────────────────
function exportarInventarioCSV() {
    const headers = ['SKU','Nombre','Categoría','Tipo','Costo','Precio','Stock','Stock Mín','Margen%','Proveedor','Estado','Tags','Variantes'];
    const rows = (window.products||[]).map(p => {
        const cat    = ((window.categories||[]).find(c => c.id === p.category)||{}).name || p.category;
        const margen = (p.cost && p.price) ? (((p.price-p.cost)/p.price)*100).toFixed(0)+'%' : '';
        const _stExport = typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (p.stock || 0);
        const estado = _stExport===0 ? 'Agotado' : _stExport<=(p.stockMin||5) ? 'Bajo Stock' : 'Disponible';
        return [p.sku, p.name, cat, p.tipo||'producto', p.cost||0, p.price||0, _stExport, p.stockMin||5,
                margen, p.proveedor||'', estado, (p.tags||[]).join('; '),
                (p.variants||[]).map(v=>`${v.type}:${v.value}(${v.qty??0})`).join('; ')]
            .map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',');
    });
    const csv  = [headers.join(','),...rows].join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `inventario_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    manekiToastExport('📥 Inventario exportado como CSV', 'ok');
}
window.exportarInventarioCSV = exportarInventarioCSV;

// ── Edición inline de stock ────────────────────────────────────────────────
function editarStockInline(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) return;
    const cell = document.getElementById(`stock-cell-${id}`);
    if (!cell) return;
    cell.innerHTML = `
        <div style="display:flex;align-items:center;gap:4px;">
            <input id="inline-stock-${id}" type="number" min="0" value="${p.stock||0}"
                style="width:60px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;"
                onkeydown="if(event.key==='Enter')confirmarStockInline('${id}');if(event.key==='Escape')renderInventoryTable();">
            <button onclick="confirmarStockInline('${id}')"
                style="width:24px;height:24px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">✓</button>
            <button onclick="renderInventoryTable()"
                style="width:24px;height:24px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;cursor:pointer;font-size:12px;">✕</button>
        </div>`;
    const inp = document.getElementById(`inline-stock-${id}`);
    if (inp) inp.focus();
}
window.editarStockInline = editarStockInline;

function confirmarStockInline(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) return;
    const inp = document.getElementById(`inline-stock-${id}`);
    if (!inp) return;
    const nuevo = parseInt(inp.value);
    if (isNaN(nuevo)||nuevo<0) { manekiToastExport('Stock inválido','err'); return; }
    const antes = p.stock||0;
    p.stock = nuevo;
    registrarMovimiento({ productoId:p.id, productoNombre:p.name, tipo:'ajuste',
        cantidad:nuevo-antes, motivo:'Edición inline', stockAntes:antes, stockDespues:nuevo });
    saveProducts(); renderInventoryTable();
    if (typeof updateDashboard === 'function') updateDashboard();
    manekiToastExport(`✅ Stock de "${p.name}" → ${nuevo}`, 'ok');
}
window.confirmarStockInline = confirmarStockInline;

// ── Poblar filtro de proveedores ───────────────────────────────────────────
function poblarFiltroProveedores() {
    const sel = document.getElementById('inventoryProveedorFilter');
    if (!sel) return;
    const current = sel.value;
    const proveedores = [...new Set(
        (window.products||[])
            .map(p => (p.proveedor||'').trim())
            .filter(Boolean)
    )].sort((a,b) => a.localeCompare(b, 'es'));
    sel.innerHTML = '<option value="">🏪 Todos los proveedores</option>' +
        proveedores.map(pr => `<option value="${_esc(pr)}"${current===pr?'selected':''}>${_esc(pr)}</option>`).join('');
}
window.poblarFiltroProveedores = poblarFiltroProveedores;

// ── Edición inline de stock para PT (doble-click en celda) ────────────────
function invInlineEditStock(id, td) {
    const product = (window.products||[]).find(p => String(p.id) === String(id));
    if (!product) return;
    const prev = parseFloat(product.stock)||0;
    const input = document.createElement('input');
    input.type = 'number'; input.min = '0'; input.step = '0.01';
    input.value = prev;
    input.style.cssText = 'width:60px;padding:2px 6px;border:1.5px solid #7c3aed;border-radius:6px;font-size:.85rem;text-align:center;';
    const commit = async () => {
        const nv = parseFloat(input.value);
        if (!isNaN(nv) && nv !== prev) {
            const antes = prev;
            product.stock = nv;
            registrarMovimiento({ productoId: product.id, productoNombre: product.name,
                tipo: 'ajuste', cantidad: nv - antes, motivo: 'Edición inline',
                stockAntes: antes, stockDespues: nv });
            saveProducts();
            manekiToastExport(`Stock actualizado: ${product.name} → ${nv}`, 'ok');
        }
        renderInventoryTable();
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { input.value = prev; input.blur(); }
    });
    td.innerHTML = '';
    td.appendChild(input);
    input.focus(); input.select();
}
window.invInlineEditStock = invInlineEditStock;

// ── Registrar merma (pérdida/daño de material) ────────────────────────────
async function registrarMerma(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) { manekiToastExport('Producto no encontrado','err'); return; }
    const cantStr = prompt(`¿Cuántas ${p.unidad||'pza'} de "${p.name}" se perdieron o dañaron?`, '1');
    if (cantStr === null) return;
    const cant = parseInt(cantStr);
    if (!cant || cant <= 0) { manekiToastExport('⚠️ Cantidad inválida','warn'); return; }
    const motivo = prompt('¿Motivo de la merma?', 'Material dañado');
    if (motivo === null) return;
    const stAntes = getStockEfectivo(p);
    const stDespues = Math.max(0, stAntes - cant);
    p.stock = stDespues;
    if (Array.isArray(p.variants) && p.variants.length) {
        let restante = cant;
        for (const v of p.variants) {
            if (restante <= 0) break;
            const q = parseInt(v.qty)||0;
            const rem = Math.min(q, restante);
            v.qty = q - rem;
            restante -= rem;
        }
        if (typeof syncStockFromVariants === 'function') syncStockFromVariants(p);
    }
    registrarMovimiento({ productoId: p.id, productoNombre: p.name, tipo: 'merma',
        cantidad: -cant, motivo: motivo||'Sin especificar', stockAntes: stAntes, stockDespues: stDespues });
    saveProducts(); renderInventoryTable();
    if (typeof updateDashboard === 'function') updateDashboard();
    manekiToastExport(`📉 Merma: -${cant} ${p.unidad||'pza'} de "${p.name}"`, 'warn');
}
window.registrarMerma = registrarMerma;

// ══════════════════════════════════════════════════════════════════════════
// ── VARIANTES CON CANTIDAD EDITABLE ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

function addVariant() {
    const typeEl  = document.getElementById('variantType');
    const valueEl = document.getElementById('variantValue');
    const type  = typeEl  ? typeEl.value.trim()  : '';
    const value = valueEl ? valueEl.value.trim() : '';
    if (!type || !value) {
        if (typeof manekiToastExport === 'function')
            manekiToastExport('Por favor completa tipo y valor de la variante', 'warn');
        return;
    }
    const existe = (window.currentVariants || []).some(v => v.type === type && v.value === value);
    if (existe) {
        if (typeof manekiToastExport === 'function')
            manekiToastExport(`⚠️ La variante ${type}: ${value} ya existe`, 'warn');
        return;
    }
    window.currentVariants.push({ type, value, qty: 0 });
    renderVariantsList();
    if (typeEl)  typeEl.value  = '';
    if (valueEl) valueEl.value = '';
    if (typeEl)  typeEl.focus();
}
window.addVariant = addVariant;

function updateVariantQty(index, val) {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) {
        window.currentVariants[index].qty = n;
    }
}
window.updateVariantQty = updateVariantQty;

function renderVariantsList() {
    const container = document.getElementById('variantsList');
    if (!container) return;
    if (!window.currentVariants || window.currentVariants.length === 0) {
        container.innerHTML = '<span class="text-xs text-gray-400 italic">Sin variantes agregadas</span>';
        return;
    }
    container.innerHTML = window.currentVariants.map((v, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:6px;">
            <div style="flex:1;min-width:0;">
                <span style="font-size:12px;color:#374151;">${_esc(v.type)}: ${_mkColorDot(v.type,_esc(v.value))}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                <label style="font-size:11px;color:#6b7280;font-weight:600;white-space:nowrap;">Piezas:</label>
                <div style="display:flex;align-items:center;gap:2px;">
                    <button type="button" onclick="(function(){var n=parseInt(document.getElementById('vqty-${i}').value)||0;if(n>0){document.getElementById('vqty-${i}').value=n-1;updateVariantQty(${i},n-1);}})()"
                        style="width:22px;height:22px;border:1px solid #d1d5db;border-radius:5px;background:#fff;cursor:pointer;font-size:13px;font-weight:bold;color:#6b7280;display:flex;align-items:center;justify-content:center;padding:0;">−</button>
                    <input id="vqty-${i}" type="number" min="0" value="${v.qty ?? 0}"
                        oninput="updateVariantQty(${i}, this.value)"
                        style="width:54px;padding:2px 6px;border:1px solid #6366f1;border-radius:6px;font-size:13px;text-align:center;font-weight:600;color:#4f46e5;">
                    <button type="button" onclick="(function(){var n=parseInt(document.getElementById('vqty-${i}').value)||0;document.getElementById('vqty-${i}').value=n+1;updateVariantQty(${i},n+1);})()"
                        style="width:22px;height:22px;border:1px solid #d1d5db;border-radius:5px;background:#fff;cursor:pointer;font-size:13px;font-weight:bold;color:#6b7280;display:flex;align-items:center;justify-content:center;padding:0;">+</button>
                </div>
                <span style="font-size:11px;color:#9ca3af;">pzs</span>
            </div>
            <button type="button" onclick="removeVariant(${i})"
                style="width:24px;height:24px;background:#fee2e2;border:none;border-radius:6px;color:#ef4444;cursor:pointer;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
        </div>`).join('');
}
window.renderVariantsList = renderVariantsList;

function removeVariant(index) {
    window.currentVariants.splice(index, 1);
    renderVariantsList();
}
window.removeVariant = removeVariant;

function descontarStockVariante(productoId, variantType, variantValue, cantidad) {
    const p = (window.products || []).find(x => String(x.id) === String(productoId));
    if (!p || !p.variants) return;
    const v = p.variants.find(v => v.type === variantType && v.value === variantValue);
    if (v) v.qty = Math.max(0, (v.qty || 0) - cantidad);
    syncStockFromVariants(p);
    saveProducts();
}
window.descontarStockVariante = descontarStockVariante;

// ── SKU ────────────────────────────────────────────────────────────────────
function generateSKU(categoryId) {
    const map = { tazas:'TAZ', llaveros:'LLV', libretas:'LIB', peluches:'PEL', otros:'OTR' };
    const prefix = map[categoryId] || 'PRD';
    const nums = (window.products || [])
        .filter(p => p.category === categoryId && p.sku && p.sku.startsWith(`MNK-${prefix}-`))
        .map(p => parseInt((p.sku || '').split('-').pop()) || 0);
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `MNK-${prefix}-${String(next).padStart(3,'0')}`;
}
window.generateSKU = generateSKU;

function skuEsUnico(sku, excludeId) {
    // BUG-S13 FIX: excluir el producto siendo editado ya sea por su ID
    // o por el hecho de que ya tiene ese mismo SKU asignado
    // (el ID puede no coincidir si Realtime actualizó el objeto desde la tabla relacional)
    const skuLow = sku.toLowerCase();
    return !(window.products || []).some(p => {
        if (!p.sku || p.sku.toLowerCase() !== skuLow) return false;
        // Excluir si es el mismo producto por ID
        if (excludeId && String(p.id) === String(excludeId)) return false;
        // Excluir si este producto YA TENÍA ese SKU antes de editar (mismo producto, ID desincronizado)
        if (excludeId) {
            const actual = (window.products || []).find(x => String(x.id) === String(excludeId));
            if (actual && actual.sku && actual.sku.toLowerCase() === skuLow) return false;
        }
        return true;
    });
}

// ══════════════════════════════════════════════════════════════════════════
// ── MODAL PRODUCTO TERMINADO ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// ── Galería de fotos PT ──
window._ptGaleriaUrls   = window._ptGaleriaUrls   ?? []; // URLs ya subidas
window._ptGaleriaFiles  = window._ptGaleriaFiles  ?? []; // archivos pendientes de subir

function ptRenderGaleria() {
    const cont = document.getElementById('ptGaleriaPreview');
    const vacia = document.getElementById('ptGaleriaVacia');
    if (!cont) return;
    const urls   = window._ptGaleriaUrls  || [];
    const files  = window._ptGaleriaFiles || [];
    const total  = urls.length + files.length;
    if (vacia) vacia.style.display = total ? 'none' : 'block';
    // Limpiar previews anteriores (mantener el párrafo vacío)
    [...cont.children].forEach(el => { if (el.id !== 'ptGaleriaVacia') el.remove(); });
    // Renderizar URLs ya guardadas
    urls.forEach((url, i) => {
        const div = document.createElement('div');
        div.style = 'position:relative;width:120px;height:120px;';
        div.innerHTML = `<img src="${url}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #e5e7eb;">
            <button type="button" onclick="ptEliminarFotoGaleria('url',${i})"
                style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.75rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;">✕</button>`;
        cont.appendChild(div);
    });
    // Renderizar archivos nuevos (preview local)
    files.forEach((file, i) => {
        const div = document.createElement('div');
        div.style = 'position:relative;width:120px;height:120px;';
        div.dataset.fileIdx = i;
        const img = document.createElement('img');
        img.style = 'width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid #C5A572;opacity:.85;';
        const reader = new FileReader();
        reader.onload = ev => { img.src = ev.target.result; };
        reader.readAsDataURL(file);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = '✕';
        btn.style = 'position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#ef4444;color:#fff;border:none;border-radius:50%;font-size:.7rem;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;';
        btn.onclick = () => ptEliminarFotoGaleria('file', i);
        div.appendChild(img); div.appendChild(btn);
        cont.appendChild(div);
    });
}
window.ptRenderGaleria = ptRenderGaleria;

function ptAgregarFotosGaleria(fileList) {
    if (!fileList || !fileList.length) return;
    const MAX = 20;
    const actual = (window._ptGaleriaUrls || []).length + (window._ptGaleriaFiles || []).length;
    const disponibles = MAX - actual;
    if (disponibles <= 0) { manekiToastExport(`Ya tienes ${MAX} fotos en la galería`, 'warn'); return; }
    const archivos = Array.from(fileList).slice(0, disponibles);
    window._ptGaleriaFiles = [...(window._ptGaleriaFiles || []), ...archivos];
    ptRenderGaleria();
    // Limpiar input para permitir seleccionar los mismos archivos de nuevo
    const input = document.getElementById('ptGaleriaInput');
    if (input) input.value = '';
}
window.ptAgregarFotosGaleria = ptAgregarFotosGaleria;

function ptEliminarFotoGaleria(tipo, idx) {
    if (tipo === 'url') {
        (window._ptGaleriaUrls || []).splice(idx, 1);
    } else {
        (window._ptGaleriaFiles || []).splice(idx, 1);
    }
    ptRenderGaleria();
}
window.ptEliminarFotoGaleria = ptEliminarFotoGaleria;

function openAddProductModal() {
    injectPtModal();
    window.modoEdicion = false; window.edicionProductoId = null;
    window.currentVariants = []; window.currentProductImage = null; window.currentProductImageFile = null;
    window._ptMpComponentes = [];
    window._tagsActuales = [];
    window._ptGaleriaUrls  = [];
    window._ptGaleriaFiles = [];

    const form = document.getElementById('ptForm');
    if (form) form.reset();
    const pre = document.getElementById('ptImagePreview');
    if (pre) pre.classList.add('hidden');
    renderPtMpList();
    renderVariantsListPt();
    recalcularCostoPt();
    ptRenderGaleria();

    if (typeof updateCategorySelects === 'function') updateCategorySelects();

    const title = document.querySelector('#ptModal h3');
    if (title) title.textContent = '📦 Nuevo Producto Terminado';
    const btn = document.getElementById('ptSubmitBtn');
    if (btn) btn.textContent = '✅ Agregar Producto';

    if (typeof openModal === 'function') openModal('ptModal');
}
window.openAddProductModal = openAddProductModal;

function closePtModal() {
    if (typeof closeModal === 'function') closeModal('ptModal');
    const form = document.getElementById('ptForm');
    if (form) form.reset();
    window.modoEdicion = false; window.edicionProductoId = null;
    window.currentVariants = []; window.currentProductImage = null; window.currentProductImageFile = null;
    window._ptMpComponentes = [];
    window._tagsActuales = [];
    window._ptGaleriaUrls = [];
    window._ptGaleriaFiles = [];
}
window.closePtModal = closePtModal;
// Alias para compatibilidad
function closeAddProductModal() { closePtModal(); }
window.closeAddProductModal = closeAddProductModal;

// ══════════════════════════════════════════════════════════════════════════
// ── IMPORTACIÓN CSV ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// Parser CSV básico que maneja comillas y valores entre comillas dobles
function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}
window.parseCsvLine = parseCsvLine;

async function importarInventarioCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { manekiToastExport('⚠️ CSV vacío o sin datos', 'warn'); return; }

    // Parsear header (ignorar BOM si existe)
    const firstLine = lines[0].replace(/^\uFEFF/, '');
    const headers = parseCsvLine(firstLine).map(h => h.toLowerCase().trim());
    // Columnas esperadas: tipo, nombre, sku, categoria, costo, precio, stock, stock_min, proveedor, notas

    let importados = 0, errores = 0;

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });

        if (!row.nombre) { errores++; continue; }

        const tipo = (row.tipo || 'pt').toLowerCase();
        const costo = parseFloat(row.costo) || 0;
        const precio = parseFloat(row.precio) || 0;
        const stock = parseFloat(row.stock) || 0;
        const stockMin = parseInt(row.stock_min) || 5;

        // Verificar nombre duplicado
        if ((window.products || []).find(p => p.name.trim().toLowerCase() === row.nombre.toLowerCase())) {
            errores++;
            continue; // Skip duplicados
        }

        const sku = row.sku || ('IMP-' + (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().split('-')[0].toUpperCase()
            : Math.random().toString(36).slice(2, 7).toUpperCase()));

        const baseProduct = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now() + Math.random())),
            name: row.nombre,
            sku,
            cost: costo,
            price: precio,
            stock,
            stockMin,
            proveedor: row.proveedor || '',
            notas: row.notas || '',
            image: tipo === 'mp' || tipo === 'materia_prima' ? '🏭' : tipo === 'svc' || tipo === 'servicio' ? '⚙️' : '📦',
            tags: [],
            historialPrecios: [],
            historialCostos: [],
            variants: [],
        };

        if (tipo === 'mp' || tipo === 'materia_prima') {
            baseProduct.tipo = 'materia_prima';
        } else if (tipo === 'svc' || tipo === 'servicio') {
            baseProduct.tipo = 'servicio';
            baseProduct.stock = 0;
        } else {
            // PT por defecto
            baseProduct.tipo = precio > 0 ? 'producto' : 'producto_interno';
        }

        if (!window.products) window.products = [];
        window.products.push(baseProduct);
        importados++;
    }

    if (importados > 0) {
        saveProducts();
        renderInventoryTable();
        if (typeof updateDashboard === 'function') updateDashboard();
        manekiToastExport(`✅ Importados ${importados} productos${errores > 0 ? ` (${errores} errores/duplicados omitidos)` : ''}`, 'ok');
    } else {
        manekiToastExport(`⚠️ No se importó ningún producto. ${errores} errores/duplicados.`, 'warn');
    }

    // Reset input para permitir re-importar el mismo archivo
    input.value = '';
}
window.importarInventarioCSV = importarInventarioCSV;

function descargarTemplateCSV() {
    const headers = 'tipo,nombre,sku,categoria,costo,precio,stock,stock_min,proveedor,notas';
    const examples = [
        'pt,Taza personalizada,,Tazas,45.00,150.00,10,3,Proveedor ABC,Taza blanca 11oz',
        'mp,Vinil blanco mate,,Materiales,15.00,,50,10,Distribuidora XYZ,Hoja 60x30cm',
        'svc,Impresión directa,,Servicios,8.00,,0,0,,Por hoja impresa'
    ].join('\n');
    const csv = headers + '\n' + examples;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'template_inventario_maneki.csv'; a.click();
    URL.revokeObjectURL(url);
}
window.descargarTemplateCSV = descargarTemplateCSV;

// ── Snapshots de inventario ────────────────────────────────────────────────
function guardarSnapshotInventario() {
  if (!window.products || window.products.length === 0) {
    manekiToastExport('No hay productos para guardar snapshot', 'warn'); return;
  }
  if (!window.inventarioSnapshots) window.inventarioSnapshots = [];
  const fecha = _fechaHoy();
  const existeHoy = window.inventarioSnapshots.find(s => s.fecha === fecha);
  if (existeHoy) {
    if (!confirm(`Ya hay un snapshot del ${fecha}. ¿Reemplazarlo?`)) return;
    const idx = window.inventarioSnapshots.indexOf(existeHoy);
    window.inventarioSnapshots.splice(idx, 1);
  }
  const snapshot = {
    fecha,
    hora: new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'}),
    totalProductos: window.products.length,
    valorTotal: window.products.reduce((s,p) => s + (parseFloat(p.cost)||0)*(parseFloat(p.stock)||0), 0),
    items: window.products.map(p => ({
      id: p.id, name: p.name, tipo: p.tipo||'pt',
      stock: p.stock||0, cost: p.cost||0, price: p.price||0,
      sku: p.sku||''
    }))
  };
  window.inventarioSnapshots.unshift(snapshot);
  window.inventarioSnapshots = window.inventarioSnapshots.slice(0, 30);
  if (typeof sbSave === 'function') {
    sbSave('inventarioSnapshots', window.inventarioSnapshots);
  } else {
    try { localStorage.setItem('inventarioSnapshots', JSON.stringify(window.inventarioSnapshots)); } catch(e) {}
  }
  manekiToastExport(`📸 Snapshot guardado: ${fecha} — ${snapshot.totalProductos} productos, $${snapshot.valorTotal.toFixed(2)} en inventario`, 'ok');
}
window.guardarSnapshotInventario = guardarSnapshotInventario;

function verSnapshotsInventario() {
  const snaps = window.inventarioSnapshots || [];
  if (!snaps.length) { manekiToastExport('Sin snapshots guardados aún', 'warn'); return; }
  const listHtml = snaps.map(s => `
    <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:700;color:#1a0533;">${s.fecha} <span style="color:#9ca3af;font-weight:400;font-size:.8rem;">${s.hora||''}</span></div>
        <div style="font-size:.8rem;color:#6b7280;">${s.totalProductos} productos · $${Number(s.valorTotal||0).toFixed(2)} en inventario</div>
      </div>
      <button onclick="exportarSnapshotCSV('${s.fecha}')" style="padding:4px 12px;border-radius:8px;border:1px solid #e5e7eb;background:#f9fafb;font-size:.75rem;cursor:pointer;">📥 CSV</button>
    </div>`).join('');

  let modal = document.getElementById('_snapshotModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = '_snapshotModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;max-width:500px;width:100%;margin:auto;max-height:80vh;overflow-y:auto;padding:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:1.1rem;font-weight:800;color:#1a0533;">📸 Snapshots de Inventario</h3>
        <button onclick="closeModal('_snapshotModal')" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;">×</button>
      </div>
      <p style="font-size:.8rem;color:#9ca3af;margin-bottom:12px;">Fotografías del estado del inventario en fechas específicas.</p>
      ${listHtml}
    </div>`;
  openModal('_snapshotModal');
}
window.verSnapshotsInventario = verSnapshotsInventario;

function exportarSnapshotCSV(fecha) {
  const snap = (window.inventarioSnapshots||[]).find(s => s.fecha === fecha);
  if (!snap) return;
  const headers = 'nombre,tipo,sku,stock,costo,precio';
  const rows = snap.items.map(p => [p.name, p.tipo, p.sku, p.stock, p.cost, p.price].map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(','));
  const csv = '\ufeff' + headers + '\n' + rows.join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `snapshot_inventario_${fecha}.csv`; a.click();
  URL.revokeObjectURL(url);
}
window.exportarSnapshotCSV = exportarSnapshotCSV;

// ══════════════════════════════════════════════════════════════════════════
// ── MODAL PRODUCTO TERMINADO — inyectado dinámicamente ───────────────────
// ══════════════════════════════════════════════════════════════════════════

window._ptMpComponentes = window._ptMpComponentes ?? []; // [{id, nombre, imageUrl, imagen, qty, costUnit}]
window._ptVariants      = window._ptVariants      ?? [];
window._ptTagsActuales  = window._ptTagsActuales  ?? [];
const TAGS_PT = ['Oferta','Nuevo','Destacado','Favorito','Agotado'];
