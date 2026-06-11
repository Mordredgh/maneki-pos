// ── Eliminar pedido activo ──
// ─── LISTA DE PRODUCCIÓN DEL DÍA ────────────────────────────────────────────
let _produccionFiltro = 'todos';

function toggleListaProduccion() {
    const panel = document.getElementById('listaProduccionPanel');
    if (!panel) return;
    const isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) renderListaProduccion();
}

function filtrarProduccion(filtro, btn) {
    _produccionFiltro = filtro;
    document.querySelectorAll('.prod-filter-btn').forEach(b => {
        b.style.borderColor = '#E5E7EB';
        b.style.background = 'white';
        b.style.color = '#4B5563';
    });
    if (btn) {
        btn.style.borderColor = '#7c3aed';
        btn.style.background = '#f3e8ff';
        btn.style.color = '#7c3aed';
    }
    renderListaProduccion();
}

function renderListaProduccion() {
    const container = document.getElementById('listaProduccionContent');
    if (!container) return;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const mañana = new Date(hoy); mañana.setDate(mañana.getDate() + 1);
    const enSemana = new Date(hoy); enSemana.setDate(enSemana.getDate() + 7);

    let lista = [...(window.pedidos || [])].filter(p => {
        const estadosActivos = ['confirmado','pago','produccion','envio','salida','retirar'];
        return estadosActivos.includes(p.status);
    });

    // Aplicar filtro
    if (_produccionFiltro === 'hoy') {
        lista = lista.filter(p => { if (!p.entrega) return false; const d = new Date(p.entrega + 'T00:00:00'); return d.getTime() === hoy.getTime(); });
    } else if (_produccionFiltro === 'manana') {
        lista = lista.filter(p => { if (!p.entrega) return false; const d = new Date(p.entrega + 'T00:00:00'); return d.getTime() === mañana.getTime(); });
    } else if (_produccionFiltro === 'semana') {
        lista = lista.filter(p => { if (!p.entrega) return false; const d = new Date(p.entrega + 'T00:00:00'); return d >= hoy && d <= enSemana; });
    } else if (_produccionFiltro === 'produccion') {
        lista = lista.filter(p => p.status === 'produccion');
    }

    // Ordenar por fecha de entrega
    lista.sort((a, b) => {
        if (!a.entrega) return 1;
        if (!b.entrega) return -1;
        return new Date(a.entrega) - new Date(b.entrega);
    });

    if (lista.length === 0) {
        container.innerHTML = '<div class="text-center py-10 text-gray-400"><div class="text-4xl mb-2">🎉</div><p class="text-sm">No hay pedidos para este filtro</p></div>';
        return;
    }

    const statusBadge = {
        confirmado: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">✅ Confirmado</span>',
        pago: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">💰 Pago</span>',
        produccion: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">🔧 Producción</span>',
        envio: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">📦 Envío</span>',
        salida: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">🚚 Salió</span>',
        retirar: '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">🏪 Retirar</span>',
    };

    container.innerHTML = lista.map((p, idx) => {
        const entrega = p.entrega ? new Date(p.entrega + 'T00:00:00') : null;
        const diff = entrega ? Math.round((entrega - hoy) / 86400000) : null;
        let urgBg = 'bg-white border-gray-100', urgText = '';
        if (diff !== null && diff < 0) { urgBg = 'bg-red-100 border-red-300'; urgText = '<span class="text-xs font-bold text-red-700">⛔ Vencido ' + Math.abs(diff) + 'd</span>'; }
        else if (diff === 0) { urgBg = 'bg-red-50 border-red-200'; urgText = '<span class="text-xs font-bold text-red-600 animate-pulse">🔴 ¡Hoy!</span>'; }
        else if (diff !== null && diff <= 2) { urgBg = 'bg-amber-50 border-amber-200'; urgText = `<span class="text-xs font-semibold text-amber-600">🟡 ${diff === 1 ? 'Mañana' : diff + ' días'}</span>`; }

        const prods = p.productosInventario && p.productosInventario.length > 0
            ? p.productosInventario.map(i => {
                const _escProd = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
                const varLabel = i.variante ? ` <span style="font-size:.7rem;color:#7c3aed;">(${_escProd((()=>{const p=i.variante.indexOf(':');if(p===-1)return i.variante;const t=i.variante.slice(0,p).trim(),val=i.variante.slice(p+1).trim();return t+': '+(typeof _mkColorDot==='function'?_mkColorDot(t,val):val);})())})</span>` : '';
                return `<span class="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-xs mr-1 mb-1">${_escProd(i.name || i.nombre || '')}${varLabel} ×${i.quantity||1}</span>`;
              }).join('')
            : '';
        const ganancia = p.costoMateriales > 0 ? `<span class="text-xs text-green-600 font-semibold ml-2">💰 Ganancia: $${(p.total - p.costoMateriales).toFixed(2)}</span>` : '';
        const _escP = window._esc || (s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));

        return `<div class="${urgBg} border rounded-xl p-4 flex gap-4 items-start">
            <div class="text-xl font-bold text-gray-300 w-8 text-center flex-shrink-0">${idx+1}</div>
            <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-amber-600">${p.folio||'—'}</span>
                    ${statusBadge[p.status] || ''}
                    ${urgText}
                </div>
                <p class="font-bold text-gray-800">${_escP(p.cliente)||'—'}</p>
                <p class="text-sm text-gray-600 mb-1">${_escP(p.concepto)||'—'}</p>
                ${prods ? `<div class="mb-1">${prods}</div>` : ''}
                <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>📅 Entrega: <strong>${p.entrega||'—'}</strong></span>
                    <span>💵 Total: <strong>$${Number(p.total||0).toFixed(2)}</strong></span>
                    ${calcSaldoPendiente(p) > 0 ? `<span class="text-red-500 font-bold">⚠️ Resta: $${calcSaldoPendiente(p).toFixed(2)}</span>` : '<span class="text-green-600 font-bold">✅ Pagado</span>'}
                    ${ganancia}
                </div>
                ${p.lugarEntrega ? `<p class="text-xs mt-1" style="color:#7c3aed;">📍 ${_escP(p.lugarEntrega)}</p>` : ''}
                ${p.notas ? `<p class="text-xs text-gray-400 mt-1 italic">📝 ${_escP(p.notas)}</p>` : ''}
            </div>
            <div class="flex flex-col gap-1 flex-shrink-0">
                <button onclick="openPedidoStatusModal('${p.id}')" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">⚡</button>
                <button onclick="abrirWhatsAppPedido('${p.id}')" class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-green-50" style="color:#25D366"><i class="fab fa-whatsapp"></i></button>
            </div>
        </div>`;
    }).join('');

    const label = document.getElementById('produccionFechaLabel');
    if (label) label.textContent = `${lista.length} pedido${lista.length!==1?'s':''} activo${lista.length!==1?'s':''} · ${new Date().toLocaleDateString('es-MX', {weekday:'long',day:'numeric',month:'long'})}`;
}

function imprimirListaProduccion() {
    const content = document.getElementById('listaProduccionContent')?.innerHTML || '';
    const storeName = document.querySelector('.sidebar-store-name')?.textContent || 'Maneki Store';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>Lista de Producción</title>
        <style>body{font-family:sans-serif;padding:2rem;} h1{color:#7c3aed;} .item{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;} .folio{color:#C5A572;font-weight:bold;font-size:12px;} .cliente{font-size:14px;font-weight:700;} .concepto{font-size:13px;color:#4B5563;} .meta{font-size:12px;color:#6B7280;margin-top:4px;} @media print{body{padding:0.5rem;}}</style>
    </head><body>
        <h1>🔨 Lista de Producción</h1>
        <p style="color:#6B7280;font-size:13px;">${storeName} · ${new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        <hr style="margin:1rem 0;">
        ${content}
    </body></html>`);
    win.document.close();
    win.print();
}
// ────────────────────────────────────────────────────────────────────────────

function eliminarPedido(id) {
    const pedidoAEliminar = (window.pedidos || []).find(p => String(p.id) === String(id));
    if (!pedidoAEliminar) return;
    const pedido = pedidoAEliminar; // alias para compatibilidad con el resto de la función

    const tieneInventario = (pedido.inventarioDescontado && (pedido.productosInventario || []).length > 0)
        || (pedido.empaquesDescontados && (pedido.empaques || []).length > 0);

    const _ejecutarEliminar = async (regresarInv) => {
        if (regresarInv) {
            _regresarInventarioCompleto(pedido);
            if (pedido.empaquesDescontados && typeof _regresarEmpaquesInventario === 'function') {
                _regresarEmpaquesInventario(pedido);
            }
        }
        if (window.MKS) MKS.del();
        window.pedidos = (window.pedidos || []).filter(p => String(p.id) !== String(id));
        savePedidos();

        // FIX: Limpiar abonos/anticipos del balance que pertenecían a este pedido
        const folioElim = pedidoAEliminar.folio || pedidoAEliminar.id;
        if (window.incomes && folioElim) {
            const antes = window.incomes.length;
            window.incomes = window.incomes.filter(i =>
                !(i.folioOrigen === folioElim || i.pedidoId === String(id))
            );
            if (window.incomes.length < antes) saveIncomes();
        }

        // FIX: Limpiar historial de ventas POS del pedido
        if (window.salesHistory && folioElim) {
            const antes = window.salesHistory.length;
            window.salesHistory = window.salesHistory.filter(s =>
                !(s.folio === folioElim || s.pedidoId === String(id))
            );
            if (window.salesHistory.length < antes) saveSalesHistory();
        }
        try {
            await db.from('orders').delete().eq('id', String(id));
        } catch(e) {
            console.warn('eliminarPedido: no se pudo borrar de orders:', e);
            manekiToastExport('Pedido eliminado localmente. Error al sincronizar con la nube.', 'warn');
        }
        renderPedidosTable();
        manekiToastExport('Pedido eliminado.', 'ok');
    };

    if (tieneInventario) {
        showConfirm('El inventario fue descontado para este pedido.\n¿Regresar productos y materia prima al inventario?', '📦 Regresar inventario').then(regresarInv => {
            showConfirm('¿Eliminar este pedido? Esta acción no se puede deshacer.', '🗑 Eliminar').then(ok => {
                if (!ok) return;
                _ejecutarEliminar(regresarInv);
            });
        });
    } else {
        const _pagado = (pedido.pagos||[]).reduce((s,ab)=>s+Number(ab.monto||0),0);
        const _msgExtra = _pagado > 0 ? `\n\n⚠️ Este pedido tiene $${_pagado.toFixed(2)} en pagos registrados que también se eliminarán.` : '';
        showConfirm('¿Eliminar este pedido? Esta acción no se puede deshacer.' + _msgExtra, '🗑 Eliminar').then(ok => {
            if (!ok) return;
            _ejecutarEliminar(false);
        });
    }
}

// ── Foto de referencia (Supabase Storage: bucket "pedidos-referencias") ─────
const FOTO_BUCKET = 'pedidos-referencias';
let _fotoRefPedidoId = null;

const _FOTO_MAX = 20;

function _fotosArray(p) {
    if (p.referenciasUrls && p.referenciasUrls.length) return { urls: p.referenciasUrls, paths: p.referenciasPaths || [] };
    if (p.referenciaUrl) return { urls: [p.referenciaUrl], paths: p.referenciaPath ? [p.referenciaPath] : [] };
    return { urls: [], paths: [] };
}

function abrirFotoReferencia(id) {
    _fotoRefPedidoId = id;
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    const { urls } = _fotosArray(p);
    const folioEl = document.getElementById('fotoRefFolio');
    if (folioEl) folioEl.textContent = `${p.folio || id} · ${urls.length}/${_FOTO_MAX} fotos`;
    const content = document.getElementById('fotoRefContent');
    if (!content) return;

    if (!urls.length) {
        content.innerHTML = `<div onclick="document.getElementById('fotoRefInput').click()" style="border:2px dashed #d1d5db;border-radius:14px;padding:36px 20px;text-align:center;cursor:pointer;" onmouseover="this.style.borderColor='#C5A572'" onmouseout="this.style.borderColor='#d1d5db'">
            <p style="font-size:2.2rem;">📷</p>
            <p style="font-size:.85rem;color:#6b7280;margin-top:8px;font-weight:600;">Toca para subir fotos de referencia</p>
            <p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">Hasta ${_FOTO_MAX} fotos · JPG, PNG, WEBP · máx 5 MB c/u</p>
        </div>`;
    } else {
        let grid = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:4px;">';
        urls.forEach((url, i) => {
            grid += `<div style="position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#f3f4f6;cursor:pointer;" onclick="window.open('${url}','_blank')">
                <img src="${url}" alt="Foto de referencia ${i+1}" style="width:100%;height:100%;object-fit:cover;">
                <button onclick="event.stopPropagation();eliminarFotoReferencia('${id}',${i})" style="position:absolute;top:3px;right:3px;background:rgba(220,38,38,.85);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:10px;cursor:pointer;line-height:1;">✕</button>
                <button onclick="event.stopPropagation();descargarFotoReferencia('${id}',${i})" style="position:absolute;bottom:3px;right:3px;background:rgba(59,130,246,.85);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:10px;cursor:pointer;line-height:1;">⬇</button>
            </div>`;
        });
        if (urls.length < _FOTO_MAX) {
            grid += `<div onclick="document.getElementById('fotoRefInput').click()" style="aspect-ratio:1;border:2px dashed #d1d5db;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:#fafafa;" onmouseover="this.style.borderColor='#C5A572'" onmouseout="this.style.borderColor='#d1d5db'">
                <span style="font-size:1.4rem;color:#9ca3af;">+</span>
                <span style="font-size:.6rem;color:#9ca3af;margin-top:2px;">Agregar</span>
            </div>`;
        }
        grid += '</div>';
        content.innerHTML = grid;
    }
    openModal('fotoReferenciaModal');
}
window.abrirFotoReferencia = abrirFotoReferencia;

async function subirFotoReferencia() {
    const input = document.getElementById('fotoRefInput');
    if (!input || !input.files.length || !_fotoRefPedidoId) return;
    const p = (window.pedidos || []).find(x => String(x.id) === String(_fotoRefPedidoId));
    if (!p) return;
    const { urls: urlsActuales, paths: pathsActuales } = _fotosArray(p);
    const disponibles = _FOTO_MAX - urlsActuales.length;
    if (disponibles <= 0) { manekiToastExport(`Ya tienes el máximo de ${_FOTO_MAX} fotos.`, 'warn'); input.value = ''; return; }
    const _filesRaw = Array.from(input.files).slice(0, disponibles);
    input.value = '';
    const filesFiltrados = [];
    for (const file of _filesRaw) {
        if (file.size > 5 * 1024 * 1024) {
            manekiToastExport(`"${file.name}" supera 5 MB — omitida.`, 'warn');
        } else {
            filesFiltrados.push(file);
        }
    }
    if (!filesFiltrados.length) return;
    manekiToastExport(`Subiendo ${filesFiltrados.length} foto(s)...`, 'ok');
    const idx = (window.pedidos || []).findIndex(x => String(x.id) === String(p.id));
    const nuevasUrls = [...urlsActuales];
    const nuevasPaths = [...pathsActuales];
    for (const file of filesFiltrados) {
        const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
        const path = `${p.id}/ref_${Date.now()}_${Math.random().toString(36).substr(2,4)}.${ext}`;
        try {
            const { error } = await db.storage.from(FOTO_BUCKET).upload(path, file, { upsert: false });
            if (error) throw error;
            const { data: { publicUrl } } = db.storage.from(FOTO_BUCKET).getPublicUrl(path);
            nuevasUrls.push(publicUrl);
            nuevasPaths.push(path);
        } catch(e) {
            console.error('[Foto] Error completo:', e);
            manekiToastExport(`❌ Error: ${e.message || JSON.stringify(e)}`, 'warn');
        }
    }
    if (idx !== -1) {
        window.pedidos[idx].referenciasUrls = nuevasUrls;
        window.pedidos[idx].referenciasPaths = nuevasPaths;
        delete window.pedidos[idx].referenciaUrl;
        delete window.pedidos[idx].referenciaPath;
        savePedidos();
    }
    manekiToastExport('✅ Foto(s) subidas correctamente.', 'ok');
    abrirFotoReferencia(p.id);
}
window.subirFotoReferencia = subirFotoReferencia;

async function descargarFotoReferencia(id, fotoIdx = 0) {
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    const { paths } = _fotosArray(p);
    const path = paths[fotoIdx];
    if (!path) return;
    try {
        const { data, error } = await db.storage.from(FOTO_BUCKET).download(path);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        const ext = path.split('.').pop().split('?')[0];
        a.href = url; a.download = `referencia_${p.folio || p.id}_${fotoIdx + 1}.${ext}`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(e) { manekiToastExport('❌ Error al descargar.', 'warn'); }
}
window.descargarFotoReferencia = descargarFotoReferencia;

async function eliminarFotoReferencia(id, fotoIdx) {
    const p = (window.pedidos || []).find(x => String(x.id) === String(id));
    if (!p) return;
    showConfirm('¿Eliminar esta foto?', '🗑 Eliminar').then(async ok => {
        if (!ok) return;
        const { urls, paths } = _fotosArray(p);
        const path = paths[fotoIdx];
        if (path) { try { await db.storage.from(FOTO_BUCKET).remove([path]); } catch(e) {} }
        const idx = (window.pedidos || []).findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
            const u = [...urls]; const pt = [...paths];
            u.splice(fotoIdx, 1); pt.splice(fotoIdx, 1);
            window.pedidos[idx].referenciasUrls = u;
            window.pedidos[idx].referenciasPaths = pt;
            delete window.pedidos[idx].referenciaUrl;
            delete window.pedidos[idx].referenciaPath;
            savePedidos();
        }
        abrirFotoReferencia(id);
    });
}
window.eliminarFotoReferencia = eliminarFotoReferencia;

// B8: migración one-time de pedidos con anticipo legacy (sin pagos[]) → crear entrada en pagos[]
// Ejecutar después de que los pedidos carguen; no afecta pedidos que ya tienen pagos[].
function _migrarAnticiposLegacy() {
    let cambios = 0;
    (window.pedidos || []).forEach(p => {
        if (Array.isArray(p.pagos) && p.pagos.length > 0) return; // ya tiene pagos — no tocar
        const anticipo = Number(p.anticipo || 0);
        if (anticipo <= 0) return;
        // Crear entrada de anticipo en pagos[] desde el valor legacy
        p.pagos = [{
            id: typeof mkId === 'function' ? mkId() : (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)),
            tipo: 'anticipo',
            monto: anticipo,
            fecha: p.fechaPedido || (typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0]),
            hora: '00:00',
            metodo: 'efectivo',
            nota: 'Anticipo migrado automáticamente'
        }];
        cambios++;
    });
    if (cambios > 0) {
        console.log(`[Pedidos] B8: ${cambios} anticipo(s) legacy migrados a pagos[]`);
        if (typeof savePedidos === 'function') savePedidos();
    }
}
window._migrarAnticiposLegacy = _migrarAnticiposLegacy;
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(_migrarAnticiposLegacy, 4000); // después de que carguen los pedidos
});

// ══════════════════════════════════════════════════════════════
// FEATURE 2: Módulo de Cotizaciones
// Requiere: window.quotes, saveQuotes(), convertQuoteToPedido()
// ══════════════════════════════════════════════════════════════

// Estado local del modal de cotización
let _quoteModalMode: 'new' | 'view' = 'new';
let _quoteViewId: string | null = null;
let _quoteProductos: any[] = [];

function generarFolioCotizacion(): string {
    const q = (window as any).quotes || [];
    const maxNum = q.reduce((max: number, c: any) => {
        const m = (c.folio || '').match(/COT-(\d+)/);
        return m ? Math.max(max, parseInt(m[1])) : max;
    }, 0);
    return `COT-${String(maxNum + 1).padStart(3, '0')}`;
}

function renderQuotesTable() {
    const tbody = document.getElementById('quotesTableBody');
    if (!tbody) return;
    const q: any[] = (window as any).quotes || [];
    const _e = (window as any)._esc || ((s: any) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    if (q.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Sin cotizaciones</td></tr>';
        return;
    }
    tbody.innerHTML = q.slice().reverse().map((c: any) => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-mono">${_e(c.folio||'')}</td>
            <td class="px-4 py-3 text-sm">${_e(c.customer||c.cliente||'')}</td>
            <td class="px-4 py-3 text-sm">${_e(c.notes||c.concepto||'')}</td>
            <td class="px-4 py-3 text-sm font-semibold">$${(c.total||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-sm">${c.date||c.fecha||''}</td>
            <td class="px-4 py-3">
                <div class="flex gap-1">
                    <button type="button" onclick="viewQuote('${c.id}')" class="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700">Ver</button>
                    ${!c.convertedToPedido ? `<button type="button" onclick="convertQuoteToPedido('${c.id}')" class="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700">→ Pedido</button>` : `<span class="text-xs text-gray-400">Convertida</span>`}
                    <button type="button" onclick="deleteQuote('${c.id}')" class="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700">✕</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function _inyectarQuoteModal() {
    if (document.getElementById('quoteModal')) return;
    const div = document.createElement('div');
    div.innerHTML = `<div id="quoteModal" class="fixed inset-0 z-50 hidden items-center justify-center" style="background:rgba(0,0,0,0.5);">
  <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" style="max-height:90vh;overflow-y:auto;">
    <h3 id="quoteModalTitle" class="text-lg font-bold text-gray-800 mb-4">Nueva Cotización</h3>
    <div class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Cliente</label>
        <input id="quoteCliente" type="text" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Nombre del cliente">
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Notas / Concepto</label>
        <textarea id="quoteNotas" rows="2" class="w-full border rounded-xl px-3 py-2 text-sm resize-none" placeholder="Descripción del trabajo o notas"></textarea>
      </div>
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold text-gray-600">Productos / Servicios</label>
          <button type="button" id="quoteAddProdBtn" onclick="addQuoteProduct()" class="text-xs px-3 py-1 rounded-lg font-semibold" style="background:#7c3aed;color:white;">+ Agregar</button>
        </div>
        <table class="w-full text-xs" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f9fafb;">
              <th class="px-2 py-1 text-left text-gray-500 font-semibold">Producto</th>
              <th class="px-2 py-1 text-center text-gray-500 font-semibold">Cant.</th>
              <th class="px-2 py-1 text-right text-gray-500 font-semibold">Precio</th>
              <th class="px-2 py-1 text-right text-gray-500 font-semibold">Subtotal</th>
              <th class="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody id="quoteProductosBody"></tbody>
        </table>
        <div class="flex justify-end mt-2 font-bold text-sm text-gray-800">
          Total: <span id="quoteTotalDisplay" class="ml-2 text-amber-700">$0.00</span>
        </div>
      </div>
    </div>
    <div class="flex gap-2 mt-5 flex-wrap">
      <button type="button" onclick="closeQuoteModal()" class="flex-1 py-2 rounded-xl text-sm" style="background:#f3f4f6;color:#374151;">Cancelar</button>
      <button type="button" id="quoteSaveBtn" onclick="_guardarCotizacion()" class="flex-1 py-2 rounded-xl text-sm font-semibold" style="background:#7c3aed;color:white;">Guardar cotización</button>
      <button type="button" id="quoteExportBtn" class="hidden flex-1 py-2 rounded-xl text-sm font-semibold" style="background:#C5A572;color:white;" onclick="exportarCotizacionPNG(_quoteViewId)">Guardar PNG</button>
    </div>
  </div>
</div>`;
    document.body.appendChild(div.firstElementChild);
}

function _recalcQuoteTotal() {
    let total = 0;
    _quoteProductos.forEach(p => { total += (p.quantity || 1) * (p.price || 0); });
    const el = document.getElementById('quoteTotalDisplay');
    if (el) el.textContent = '$' + total.toFixed(2);
}

function _renderQuoteProductosBody(readOnly = false) {
    const tbody = document.getElementById('quoteProductosBody');
    if (!tbody) return;
    const _e = (window as any)._esc || ((s: any) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    if (_quoteProductos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3 text-gray-400 text-xs">Sin productos — usa "+ Agregar"</td></tr>';
        return;
    }
    tbody.innerHTML = _quoteProductos.map((p, i) => `
        <tr style="border-bottom:1px solid #f3f4f6;">
            <td class="px-2 py-1">${readOnly
                ? `<span class="text-gray-800">${_e(p.name || '')}</span>`
                : `<input type="text" value="${_e(p.name||'')}" oninput="_quoteProductos[${i}].name=this.value" class="w-full border rounded-lg px-1 py-0.5 text-xs" placeholder="Producto">`
            }</td>
            <td class="px-2 py-1 text-center">${readOnly
                ? `<span>${p.quantity||1}</span>`
                : `<input type="number" min="1" value="${p.quantity||1}" oninput="_quoteProductos[${i}].quantity=parseInt(this.value)||1;_recalcQuoteTotal()" class="w-14 border rounded-lg px-1 py-0.5 text-xs text-center">`
            }</td>
            <td class="px-2 py-1 text-right">${readOnly
                ? `<span>$${(p.price||0).toFixed(2)}</span>`
                : `<input type="number" min="0" step="0.01" value="${(p.price||0).toFixed(2)}" oninput="_quoteProductos[${i}].price=parseFloat(this.value)||0;_recalcQuoteTotal()" class="w-20 border rounded-lg px-1 py-0.5 text-xs text-right">`
            }</td>
            <td class="px-2 py-1 text-right font-semibold text-gray-700 text-xs">$${((p.quantity||1)*(p.price||0)).toFixed(2)}</td>
            <td class="px-2 py-1 text-center">${readOnly ? '' : `<button type="button" onclick="_quoteProductos.splice(${i},1);_renderQuoteProductosBody(false);_recalcQuoteTotal();" class="text-red-400 hover:text-red-600 text-sm">✕</button>`}</td>
        </tr>
    `).join('');
    _recalcQuoteTotal();
}

function addQuoteProduct() {
    _quoteProductos.push({ name: '', quantity: 1, price: 0 });
    _renderQuoteProductosBody(false);
    _recalcQuoteTotal();
}

function openQuoteModal() {
    _inyectarQuoteModal();
    _quoteModalMode = 'new';
    _quoteViewId = null;
    _quoteProductos = [];
    const titleEl = document.getElementById('quoteModalTitle');
    if (titleEl) titleEl.textContent = 'Nueva Cotización';
    const clienteEl = document.getElementById('quoteCliente') as HTMLInputElement|null;
    if (clienteEl) clienteEl.value = '';
    const notasEl = document.getElementById('quoteNotas') as HTMLTextAreaElement|null;
    if (notasEl) notasEl.value = '';
    const saveBtn = document.getElementById('quoteSaveBtn');
    if (saveBtn) saveBtn.classList.remove('hidden');
    const addBtn = document.getElementById('quoteAddProdBtn');
    if (addBtn) addBtn.classList.remove('hidden');
    const exportBtn = document.getElementById('quoteExportBtn');
    if (exportBtn) exportBtn.classList.add('hidden');
    _renderQuoteProductosBody(false);
    openModal('quoteModal');
}

function closeQuoteModal() {
    closeModal('quoteModal');
}

function viewQuote(id: string) {
    _inyectarQuoteModal();
    const q: any[] = (window as any).quotes || [];
    const cot = q.find(x => String(x.id) === String(id));
    if (!cot) return;
    _quoteModalMode = 'view';
    _quoteViewId = id;
    _quoteProductos = (cot.products || []).map((p: any) => ({...p}));
    const titleEl = document.getElementById('quoteModalTitle');
    if (titleEl) titleEl.textContent = `Cotización ${cot.folio || ''} — Solo lectura`;
    const clienteEl = document.getElementById('quoteCliente') as HTMLInputElement|null;
    if (clienteEl) { clienteEl.value = cot.customer || cot.cliente || ''; clienteEl.readOnly = true; }
    const notasEl = document.getElementById('quoteNotas') as HTMLTextAreaElement|null;
    if (notasEl) { notasEl.value = cot.notes || cot.concepto || ''; notasEl.readOnly = true; }
    const saveBtn = document.getElementById('quoteSaveBtn');
    if (saveBtn) saveBtn.classList.add('hidden');
    const addBtn = document.getElementById('quoteAddProdBtn');
    if (addBtn) addBtn.classList.add('hidden');
    const exportBtn = document.getElementById('quoteExportBtn');
    if (exportBtn) exportBtn.classList.remove('hidden');
    _renderQuoteProductosBody(true);
    openModal('quoteModal');
}

function _guardarCotizacion() {
    const clienteEl = document.getElementById('quoteCliente') as HTMLInputElement|null;
    const notasEl = document.getElementById('quoteNotas') as HTMLTextAreaElement|null;
    const cliente = clienteEl?.value.trim() || '';
    const notas = notasEl?.value.trim() || '';
    const total = _quoteProductos.reduce((s, p) => s + (p.quantity||1) * (p.price||0), 0);
    const cot = {
        id: typeof mkId === 'function' ? mkId() : (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)),
        folio: generarFolioCotizacion(),
        customer: cliente,
        cliente: cliente,
        notes: notas,
        concepto: notas,
        products: _quoteProductos.map(p => ({...p})),
        total,
        date: typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0],
        fecha: typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0],
        convertedToPedido: false,
    };
    if (!(window as any).quotes) (window as any).quotes = [];
    (window as any).quotes.push(cot);
    if (typeof (window as any).saveQuotes === 'function') (window as any).saveQuotes();
    renderQuotesTable();
    closeQuoteModal();
    if (typeof manekiToastExport === 'function') manekiToastExport(`✅ Cotización ${cot.folio} guardada.`, 'ok');
}

function deleteQuote(id: string) {
    if (typeof showConfirm === 'function') {
        showConfirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.', '🗑 Eliminar').then((ok: boolean) => {
            if (!ok) return;
            (window as any).quotes = ((window as any).quotes || []).filter((c: any) => String(c.id) !== String(id));
            if (typeof (window as any).saveQuotes === 'function') (window as any).saveQuotes();
            renderQuotesTable();
            if (typeof manekiToastExport === 'function') manekiToastExport('Cotización eliminada.', 'ok');
        });
    } else {
        if (!confirm('¿Eliminar esta cotización?')) return;
        (window as any).quotes = ((window as any).quotes || []).filter((c: any) => String(c.id) !== String(id));
        if (typeof (window as any).saveQuotes === 'function') (window as any).saveQuotes();
        renderQuotesTable();
    }
}

async function exportarCotizacionPNG(quoteId: string) {
    const q: any = ((window as any).quotes || []).find((x: any) => String(x.id) === String(quoteId));
    if (!q) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 700);

    ctx.fillStyle = '#C5A572';
    ctx.fillRect(0, 0, 600, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText((window as any).storeConfig?.name || 'Maneki Store', 30, 40);
    ctx.font = '14px Arial';
    ctx.fillText('COTIZACIÓN', 30, 62);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(q.folio || 'COT-001', 30, 110);
    ctx.font = '13px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`Cliente: ${q.customer || q.cliente || '—'}`, 30, 135);
    ctx.fillText(`Fecha: ${q.date || q.fecha || '—'}`, 30, 155);

    let y = 190;
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(20, y - 20, 560, 30);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial';
    ctx.fillText('Producto', 30, y);
    ctx.fillText('Cant.', 350, y);
    ctx.fillText('Precio', 420, y);
    ctx.fillText('Subtotal', 510, y);
    y += 15;

    ctx.font = '13px Arial';
    (q.products || []).forEach((p: any) => {
        y += 30;
        if (y > 620) return;
        ctx.fillStyle = '#1f2937';
        ctx.fillText((p.name || '').substring(0, 30), 30, y);
        ctx.fillText(String(p.quantity || 1), 360, y);
        ctx.fillText(`$${(p.price || 0).toFixed(2)}`, 420, y);
        ctx.fillText(`$${((p.quantity || 1) * (p.price || 0)).toFixed(2)}`, 510, y);
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(20, y + 8, 560, 1);
        ctx.fillStyle = '#1f2937';
    });

    y += 40;
    ctx.fillStyle = '#C5A572';
    ctx.fillRect(20, y, 560, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`TOTAL: $${(q.total || 0).toFixed(2)}`, 30, y + 26);

    if (q.notes) {
        y += 55;
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.fillText(`Notas: ${q.notes.substring(0, 80)}`, 30, y);
    }

    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Arial';
    ctx.fillText((window as any).storeConfig?.phone ? `📱 ${(window as any).storeConfig.phone}` : '', 30, 680);
    ctx.fillText('Válida por 7 días', 450, 680);

    const link = document.createElement('a');
    link.download = `Cotizacion_${q.folio || 'COT'}_${q.customer || 'cliente'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (typeof manekiToastExport === 'function') manekiToastExport('📄 Cotización exportada como imagen', 'ok');
}

window.renderQuotesTable = renderQuotesTable;
window.openQuoteModal = openQuoteModal;
window.closeQuoteModal = closeQuoteModal;
window.viewQuote = viewQuote;
window.deleteQuote = deleteQuote;
window.addQuoteProduct = addQuoteProduct;
window.exportarCotizacionPNG = exportarCotizacionPNG;
window.generarFolioCotizacion = generarFolioCotizacion;
(window as any)._recalcQuoteTotal = _recalcQuoteTotal;
(window as any)._renderQuoteProductosBody = _renderQuoteProductosBody;
(window as any)._quoteProductos = _quoteProductos;
