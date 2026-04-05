function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;

    // Buscar o crear contenedor dual (reemplaza la tabla original)
    let dualContainer = document.getElementById('invDualContainer');
    if (!dualContainer) {
        // Envolver la tabla existente en un contenedor dual
        const tableWrapper = tbody.closest('table, .overflow-x-auto, [class*="overflow"]') || tbody.parentElement;
        dualContainer = document.createElement('div');
        dualContainer.id = 'invDualContainer';
        dualContainer.style.cssText = 'display:flex;flex-direction:column;gap:0;';
        tableWrapper.parentNode.insertBefore(dualContainer, tableWrapper);
        tableWrapper.style.display = 'none'; // ocultar tabla original
    }

    const allProducts = window.products || [];

    if (allProducts.length === 0) {
        dualContainer.innerHTML = `
        <div class="mk-empty" style="padding:48px 24px;text-align:center;">
            <div class="mk-empty-icon">📦</div>
            <p class="mk-empty-title">Sin productos aún</p>
            <p class="mk-empty-sub">Tu inventario está vacío. Agrega tu primer producto para empezar.</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
                <button onclick="openAddProductModal()" class="btn-primary px-5 py-2.5 rounded-xl text-sm">
                    📦 Agregar Producto Terminado
                </button>
                <button onclick="injectMpModal();openAddMateriaPrimaModal()"
                    class="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
                    🏭 Agregar Materia Prima
                </button>
            </div>
        </div>`;
        return;
    }

    // ── Filtros globales compartidos ─────────────────────────────────────────
    const q     = (document.getElementById('inventorySearch')         ||{}).value?.trim().toLowerCase() || '';
    const tagQ  = (document.getElementById('inventoryTagFilter')       ||{}).value || '';
    const provQ = (document.getElementById('inventoryProveedorFilter') ||{}).value?.trim().toLowerCase() || '';

    function applyFilters(list) {
        return list.filter(p => {
            const nombreMatch = !q || p.name.toLowerCase().includes(q)
                || (p.sku||'').toLowerCase().includes(q)
                || (p.proveedor||'').toLowerCase().includes(q)
                || (p.notas||'').toLowerCase().includes(q)
                || (p.tags||[]).some(t => t.toLowerCase().includes(q));
            const tagMatch  = !tagQ  || (p.tags && p.tags.includes(tagQ));
            const provMatch = !provQ || (p.proveedor||'').toLowerCase().includes(provQ);
            return nombreMatch && tagMatch && provMatch;
        });
    }

    const mps  = applyFilters(allProducts.filter(p => p.tipo === 'materia_prima'));
    const svcs = applyFilters(allProducts.filter(p => p.tipo === 'servicio'));
    const pvs  = applyFilters(allProducts.filter(p => p.tipo === 'producto_variable'));
    const pts  = applyFilters(allProducts.filter(p => !p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno' || p.tipo === 'pack'));

    // Ordenamiento
    function applySortInventory(list) {
        if (!window._invSortCol) return list;
        const col = window._invSortCol, dir = window._invSortDir;
        return [...list].sort((a,b) => {
            let va, vb;
            if      (col==='name')     { va=(a.name||'').toLowerCase();     vb=(b.name||'').toLowerCase(); }
            else if (col==='sku')      { va=(a.sku||'').toLowerCase();      vb=(b.sku||'').toLowerCase(); }
            else if (col==='category') { va=(a.category||'').toLowerCase(); vb=(b.category||'').toLowerCase(); }
            else if (col==='price')    { va=Number(a.price)||0;             vb=Number(b.price)||0; }
            else if (col==='stock')    { va=Number(a.stock)||0;             vb=Number(b.stock)||0; }
            else if (col==='margin')   {
                va=(a.cost&&a.price)?(a.price-a.cost)/a.price:-1;
                vb=(b.cost&&b.price)?(b.price-b.cost)/b.price:-1;
            }
            if (va<vb) return dir==='asc'?-1:1;
            if (va>vb) return dir==='asc'?1:-1;
            return 0;
        });
    }

    // ── Render fila de MATERIA PRIMA ──────────────────────────────────────────
    function renderFilaMP(product, ri) {
        const pid     = String(product.id);
        const stockEf = getStockEfectivo(product);
        const imgHTML = product.imageUrl
            ? `<img src="${product.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`
            : `<span style="font-size:1.6rem;">${product.image||'🏭'}</span>`;
        let badge;
        if      (stockEf === 0)                    badge = '<span class="badge-danger">Agotado</span>';
        else if (stockEf <= (product.stockMin||5)) badge = '<span class="badge-warning">Bajo Stock</span>';
        else                                        badge = '<span class="badge-success">Disponible</span>';
        const cat = (window.categories||[]).find(c => c.id === product.category);
        const catName = cat ? cat.name : (product.category||'');
        return `
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${ri*0.03}s" class="hover:bg-purple-50">
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    ${product.historialCostos && product.historialCostos.length ? `<span title="Este producto ha tenido ${product.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#7c3aed;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">📈 ${product.historialCostos.length} cambio${product.historialCostos.length>1?'s':''}</span>` : ''}
                    ${product.compraPaquete ? `<div style="font-size:10px;color:#7c3aed;margin-top:2px;">📦 Paquete: ${product.compraPaquete.cantidad} uds · $${Number(product.compraPaquete.precio).toFixed(2)}</div>` : ''}
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#7c3aed;border:1px solid #e9d5ff;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(catName)}</td>
            <td class="px-4 py-3" style="font-size:.85rem;color:#7c3aed;font-weight:600;">$${Number(product.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm">${_esc(product.proveedor||'—')}</td>
            <td class="px-4 py-3 font-semibold" id="stock-cell-${pid}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span ondblclick="editarStockInline('${pid}')" title="Doble clic para editar"
                        style="cursor:pointer;padding:2px 10px;border-radius:8px;background:#f3f4f6;border:1px dashed #d1d5db;font-size:.95rem;">
                        ${stockEf} <span style="font-size:10px;color:#9ca3af;font-weight:400;">${_esc(product.unidad||'pza')}</span>
                    </span>
                </div>
            </td>
            <td class="px-4 py-3">${badge}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button onclick="editProduct('${pid}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>
                    <button onclick="ajustarStock('${pid}')" title="Ajustar stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📦</button>
                    <button onclick="duplicarProducto('${pid}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📋</button>
                    <button onclick="registrarMerma('${pid}')" title="Registrar merma/pérdida"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.25);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📉</button>
                    ${product.proveedorUrl ? `<button onclick="window.open('${_esc(product.proveedorUrl)}','_blank')" title="Abrir proveedor" style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🔗</button>` : ''}
                    <button onclick="cambiarTipoProducto('${pid}')" title="Convertir a Producto Terminado"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">→📦</button>
                    <button onclick="deleteProduct('${pid}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🗑️</button>
                </div>
            </td>
        </tr>`;
    }

    // ── Render fila de SERVICIO ────────────────────────────────────────────────
    function renderFilaServicio(product, ri) {
        const pid = String(product.id);
        const imgHTML = `<span style="font-size:1.6rem;">${product.image||'⚙️'}</span>`;
        return `
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${ri*0.03}s" class="hover:bg-indigo-50">
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(product.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3"><span style="font-size:11px;background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:99px;font-weight:700;">Sin stock</span></td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;">
                    <button onclick="openServicioModal('${pid}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>
                    <button onclick="deleteProduct('${pid}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🗑️</button>
                </div>
            </td>
        </tr>`;
    }

    // ── Render fila de PRODUCTO TERMINADO ──────────────────────────────────────
    function renderFilaPT(product, ri) {
        const pid     = String(product.id);
        const imgHTML = product.imageUrl
            ? `<img src="${product.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`
            : `<span style="font-size:1.6rem;">${product.image||'📦'}</span>`;
        const cat = (window.categories||[]).find(c => c.id === product.category);
        const catName = cat ? cat.name : (product.category||'');

        // Disponibilidad calculada desde MPs
        const disp = calcularDisponibilidadDesdeMP(product);
        let stockCell, badgeCell;

        if (disp !== null) {
            // Tiene MPs configuradas → mostrar disponibilidad calculada
            const piezas = disp.piezas;
            const clr = piezas === 0 ? '#ef4444' : piezas <= 3 ? '#f59e0b' : '#10b981';
            const bgClr = piezas === 0 ? '#fee2e2' : piezas <= 3 ? '#fef3c7' : '#d1fae5';
            const tooltip = disp.detalle.map(d => `${d.nombre}: ${d.stock}÷${d.qty}=${d.posibles}pzs`).join(' | ');
            stockCell = `
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                    <span title="${_esc(tooltip)}"
                        style="padding:3px 12px;border-radius:8px;background:${bgClr};color:${clr};
                               font-weight:700;font-size:.95rem;border:1px solid ${clr}33;cursor:help;">
                        ${piezas}
                    </span>
                    <span style="font-size:10px;color:#6b7280;">desde MP</span>
                </div>`;
            badgeCell = piezas === 0
                ? '<span class="badge-danger">Sin stock MP</span>'
                : piezas <= 3
                    ? '<span class="badge-warning">MP bajo</span>'
                    : '<span class="badge-success">Disponible</span>';
        } else {
            // Sin MPs configuradas → sin stock relevante
            stockCell = `<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>`;
            badgeCell = `<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>`;
        }

        const varsHTML = product.variants && product.variants.length > 0
            ? product.variants.map(v => `
                <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;background:#f3f4f6;border-radius:8px;font-size:11px;margin:1px;">
                    <b>${_esc(v.type)}:</b>${_mkColorDot(v.type,_esc(v.value))}
                    <span style="background:#e0f2fe;color:#0369a1;padding:0 4px;border-radius:99px;font-weight:600;">${v.qty??0}</span>
                </span>`).join('')
            : '<span class="text-xs text-gray-400">Sin variantes</span>';

        const c = Number(product.cost)||0, pr = Number(product.price)||0;
        const margenHTML = (c && pr)
            ? (() => {
                const pct = (pr-c)/pr*100;
                const clr = pct>=40 ? '#10b981' : pct>=20 ? '#f59e0b' : '#ef4444';
                return `<div style="min-width:56px;">
                    <div style="font-weight:600;font-size:13px;color:${clr};">${pct.toFixed(0)}%</div>
                    <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                        <div style="height:100%;width:${Math.min(100,pct).toFixed(0)}%;background:${clr};border-radius:99px;"></div>
                    </div></div>`;
            })()
            : '<span class="text-gray-300 text-xs">—</span>';

        return `
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${ri*0.03}s" class="hover:bg-amber-50">
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    ${product.tipo === 'pack' ? `<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">🎁 Pack</span>` : ''}
                    ${product.tipo === 'pack' && product.packComponentes && product.packComponentes.length ? `<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${product.packComponentes.map(c=>`${c.qty > 1 ? c.qty+'× ' : ''}${_esc(c.nombre)}`).join(' + ')}</div>` : ''}
                    ${product.historialPrecios && product.historialPrecios.length ? `<span title="Este producto ha tenido ${product.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">📈 ${product.historialPrecios.length} cambio${product.historialPrecios.length>1?'s':''}</span>` : ''}
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(catName)}</td>
            <td class="px-4 py-3">${varsHTML}</td>
            <td class="px-4 py-3 text-gray-800 font-semibold" style="font-size:.95rem;">$${Number(product.price||0).toFixed(2)}</td>
            <td class="px-4 py-3">${stockCell}</td>
            <td class="px-4 py-3">${badgeCell}</td>
            <td class="px-4 py-3">${margenHTML}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${product.tipo === 'pack'
                        ? `<button onclick="openPackModal('${pid}')" title="Editar Pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>`
                        : `<button onclick="editProduct('${pid}')" title="Editar"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>`
                    }
                    <button onclick="duplicarProducto('${pid}')" title="Duplicar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📋</button>
                    ${product.tipo !== 'pack' ? `<button onclick="cambiarTipoProducto('${pid}')" title="Convertir a Materia Prima"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">→🧪</button>` : ''}
                    <button onclick="deleteProduct('${pid}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🗑️</button>
                </div>
            </td>
        </tr>`;
    }

    // ── Render fila de PRODUCTO VARIABLE ──────────────────────────────────────
    function renderFilaVariable(product, ri) {
        const pid = String(product.id);
        const imgHTML = product.imageUrl
            ? `<img src="${product.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`
            : `<span style="font-size:1.6rem;">${product.image||'🎯'}</span>`;
        const tabla = (product.tablaPreciosVariable || []).slice().sort((a,b) => a.cantidadMin - b.cantidadMin);
        const tablaHTML = tabla.length
            ? tabla.map(r => `<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${r.cantidadMin} pzas = $${Number(r.precio).toFixed(2)}</span>`).join(' ')
            : '<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>';
        const nMps = (product.mpComponentes || []).length;
        // Calcular margen estimado del PV usando el rango de menor cantidad
        const _pvTabla = (product.tablaPreciosVariable || []).slice().sort((a,b) => a.cantidadMin - b.cantidadMin);
        const _pvPrecioMin = _pvTabla.length ? _pvTabla[0].precio / (_pvTabla[0].cantidadMin || 1) : 0;
        const _pvCostoComp = (product.mpComponentes || []).reduce((s, c) => s + (parseFloat(c.costUnit)||0) * (parseFloat(c.qty)||1), 0);
        const _pvRph = product.rendimientoPorHoja || 1;
        const _pvCostoUnit = _pvRph > 0 ? _pvCostoComp / _pvRph : _pvCostoComp;
        const _pvMargen = _pvPrecioMin > 0 ? Math.round((_pvPrecioMin - _pvCostoUnit) / _pvPrecioMin * 100) : 0;
        const _pvMargenColor = _pvMargen >= 40 ? '#16a34a' : _pvMargen >= 20 ? '#d97706' : '#dc2626';
        return `
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${ri*0.03}s" class="hover:bg-sky-50">
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${product.rendimientoPorHoja ? `<div style="font-size:10px;color:#6b7280;margin-top:2px;">🗒️ ${product.rendimientoPorHoja} uds/hoja</div>` : ''}
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3">
                <div style="display:flex;flex-wrap:wrap;gap:3px;">${tablaHTML}</div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">${nMps} MP${nMps !== 1 ? 's' : ''}</td>
            <td style="padding:10px 16px;">
                ${_pvPrecioMin > 0 ? `<span style="color:${_pvMargenColor};font-weight:700;font-size:.85rem;">${_pvMargen}%</span>` : '<span style="color:#9ca3af;font-size:.8rem;">—</span>'}
            </td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button onclick="editProduct('${pid}')" title="Editar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>
                    <button onclick="deleteProduct('${pid}')" title="Eliminar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🗑️</button>
                </div>
            </td>
        </tr>`;
    }

    // ── Construir HTML de cada sección ────────────────────────────────────────
    function buildSection({ id, title, titleColor, titleBg, btnLabel, btnOnclick, btnColor, extraBtnHTML, products: list, renderFila, headers, emptyMsg }) {
        const sorted = applySortInventory(list);

        // Paginación propia por sección
        const pagKey  = `_invPage_${id}`;
        const pageSize = window._invPageSize || 10;
        window[pagKey] = window[pagKey] || 1;
        const total    = sorted.length;
        const totalPgs = Math.max(1, Math.ceil(total / pageSize));
        if (window[pagKey] > totalPgs) window[pagKey] = 1;
        const page     = window[pagKey];
        const startIdx = (page - 1) * pageSize;
        const paginated = sorted.slice(startIdx, startIdx + pageSize);

        const rowsHTML = paginated.length === 0
            ? `<tr><td colspan="${headers.length}" style="padding:32px;text-align:center;color:#9ca3af;font-size:.85rem;">${emptyMsg}</td></tr>`
            : paginated.map((p, i) => renderFila(p, i)).join('');

        const headersHTML = headers.map(h =>
            h.sortKey
                ? `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none"
                      onclick="sortInventory('${h.sortKey}')" style="white-space:nowrap;">${h.label} ↕</th>`
                : `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide" style="white-space:nowrap;">${h.label}</th>`
        ).join('');

        // Paginación
        let pagHTML = '';
        if (totalPgs > 1 || total > pageSize) {
            const end = Math.min(startIdx + pageSize, total);
            pagHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                        gap:8px;padding:10px 16px;border-top:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;">Mostrando <b>${startIdx+1}–${end}</b> de <b>${total}</b></span>
                <div style="display:flex;gap:4px;">
                    <button onclick="invSectionPage('${id}',${page-1})" ${page<=1?'disabled':''} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${page<=1?'default':'pointer'};opacity:${page<=1?0.4:1};font-size:13px;">‹</button>
                    ${Array.from({length:Math.min(5,totalPgs)},(_,i)=>{
                        let p2 = page <= 3 ? i+1 : page + i - 2;
                        if (p2 < 1) p2 = null; if (p2 > totalPgs) p2 = null;
                        if (p2 === null) return '';
                        return `<button onclick="invSectionPage('${id}',${p2})" style="min-width:30px;padding:4px 8px;border:1px solid ${p2===page?'#C5973B':'#e5e7eb'};border-radius:7px;background:${p2===page?'#C5973B':'#fff'};color:${p2===page?'#fff':'#374151'};font-weight:${p2===page?700:400};font-size:13px;cursor:${p2===page?'default':'pointer'};" ${p2===page?'disabled':''}>${p2}</button>`;
                    }).join('')}
                    <button onclick="invSectionPage('${id}',${page+1})" ${page>=totalPgs?'disabled':''} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${page>=totalPgs?'default':'pointer'};opacity:${page>=totalPgs?0.4:1};font-size:13px;">›</button>
                </div>
            </div>`;
        }

        return `
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${titleColor}33;box-shadow:0 2px 12px ${titleColor}11;">
            <!-- Header de sección -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:${titleBg};border-bottom:1.5px solid ${titleColor}33;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;font-weight:800;color:${titleColor};">${title}</span>
                    <span style="background:${titleColor};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${total}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${extraBtnHTML || ''}
                    <button onclick="${btnOnclick}"
                        style="padding:7px 16px;background:${btnColor};color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${btnLabel}
                    </button>
                </div>
            </div>
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${headersHTML}</tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
            ${pagHTML}
        </div>`;
    }

    dualContainer.innerHTML =
        buildSection({
            id: 'pt',
            title: '📦 Productos Terminados',
            titleColor: '#C5973B',
            titleBg: 'linear-gradient(135deg,#fffbeb,#fef9f0)',
            btnLabel: '+ Producto',
            btnOnclick: 'openAddProductModal()',
            btnColor: 'linear-gradient(135deg,#C5A572,#E8B84B)',
            extraBtnHTML: `<button onclick="injectPackModal();openPackModal()" style="padding:7px 16px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">🎁 Crear Pack</button>`,
            products: pts,
            renderFila: renderFilaPT,
            headers: [
                {label:''},
                {label:'Producto', sortKey:'name'},
                {label:'SKU', sortKey:'sku'},
                {label:'Categoría', sortKey:'category'},
                {label:'Variantes'},
                {label:'Precio', sortKey:'price'},
                {label:'Disponible'},
                {label:'Estado'},
                {label:'Margen', sortKey:'margin'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin productos terminados. Agrega uno con el botón +'
        }) +
        buildSection({
            id: 'pv',
            title: '🎯 Productos Variables (Stickers, Tarjetas...)',
            titleColor: '#0369a1',
            titleBg: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
            btnLabel: '+ Producto Variable',
            btnOnclick: 'injectVariableProductModal();openVariableProductModal()',
            btnColor: 'linear-gradient(135deg,#0284c7,#38bdf8)',
            products: pvs,
            renderFila: renderFilaVariable,
            headers: [
                {label:''},
                {label:'Nombre', sortKey:'name'},
                {label:'SKU', sortKey:'sku'},
                {label:'Tabla de precios'},
                {label:'Materiales'},
                {label:'Margen'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad.'
        }) +
        buildSection({
            id: 'mp',
            title: '🏭 Materias Primas',
            titleColor: '#7c3aed',
            titleBg: 'linear-gradient(135deg,#faf5ff,#f5f3ff)',
            btnLabel: '+ Materia Prima',
            btnOnclick: 'injectMpModal();openAddMateriaPrimaModal()',
            btnColor: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            products: mps,
            renderFila: renderFilaMP,
            headers: [
                {label:''},
                {label:'Nombre', sortKey:'name'},
                {label:'SKU', sortKey:'sku'},
                {label:'Categoría', sortKey:'category'},
                {label:'Costo'},
                {label:'Proveedor'},
                {label:'Stock', sortKey:'stock'},
                {label:'Estado'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin materias primas. Agrega una con el botón +'
        }) +
        buildSection({
            id: 'svc',
            title: '⚙️ Servicios y Consumibles',
            titleColor: '#6d28d9',
            titleBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
            btnLabel: '+ Nuevo Servicio',
            btnOnclick: 'injectSvcModal();openServicioModal()',
            btnColor: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
            products: svcs,
            renderFila: renderFilaServicio,
            headers: [
                {label:''},
                {label:'Nombre', sortKey:'name'},
                {label:'SKU', sortKey:'sku'},
                {label:'Costo/uso'},
                {label:'Estado'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin servicios. Agrega el uso del láser, vinil por pieza, etc.'
        });
}

// Paginación por sección independiente
function invSectionPage(sectionId, page) {
    const pagKey = `_invPage_${sectionId}`;
    const allProducts = window.products || [];
    const list = sectionId === 'mp'
        ? allProducts.filter(p => p.tipo === 'materia_prima')
        : sectionId === 'svc'
        ? allProducts.filter(p => p.tipo === 'servicio')
        : sectionId === 'pv'
        ? allProducts.filter(p => p.tipo === 'producto_variable')
        : allProducts.filter(p => !p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno');
    // Apply active filters (same logic as renderInventoryTable) before computing totalPgs
    const q     = (document.getElementById('inventorySearch')         ||{}).value?.trim().toLowerCase() || '';
    const tagQ  = (document.getElementById('inventoryTagFilter')       ||{}).value || '';
    const provQ = (document.getElementById('inventoryProveedorFilter') ||{}).value?.trim().toLowerCase() || '';
    const filteredList = list.filter(p => {
        const nombreMatch = !q || p.name.toLowerCase().includes(q)
            || (p.sku||'').toLowerCase().includes(q)
            || (p.proveedor||'').toLowerCase().includes(q)
            || (p.notas||'').toLowerCase().includes(q)
            || (p.tags||[]).some(t => t.toLowerCase().includes(q));
        const tagMatch  = !tagQ  || (p.tags && p.tags.includes(tagQ));
        const provMatch = !provQ || (p.proveedor||'').toLowerCase().includes(provQ);
        return nombreMatch && tagMatch && provMatch;
    });
    const totalPgs = Math.max(1, Math.ceil(filteredList.length / (window._invPageSize||10)));
    window[pagKey] = Math.max(1, Math.min(page, totalPgs));
    renderInventoryTable();
}
window.invSectionPage = invSectionPage;

// ── Paginación del inventario ──────────────────────────────────────────────
function _renderInventoryPagination(page, totalPages, totalItems, startIdx, pageSize) {
    // Buscar o crear el contenedor de paginación
    let container = document.getElementById('inventoryPaginationBar');
    if (!container) {
        // Insertar después del wrapper de la tabla
        const tableWrapper = document.getElementById('inventoryTable')?.closest('table, .overflow-x-auto, [class*="overflow"]');
        if (!tableWrapper) return;
        container = document.createElement('div');
        container.id = 'inventoryPaginationBar';
        tableWrapper.insertAdjacentElement('afterend', container);
    }

    if (totalPages <= 1 && totalItems <= pageSize) {
        container.innerHTML = '';
        return;
    }

    const endIdx   = Math.min(startIdx + pageSize, totalItems);
    const showing  = `Mostrando <b>${startIdx + 1}–${endIdx}</b> de <b>${totalItems}</b> productos`;

    // Generar números de página (max 7 visibles con elipsis)
    function pageButtons() {
        const btns = [];
        const range = (from, to) => {
            for (let i = from; i <= to; i++) btns.push(i);
        };
        if (totalPages <= 7) {
            range(1, totalPages);
        } else {
            btns.push(1);
            if (page > 4)          btns.push('...');
            range(Math.max(2, page - 2), Math.min(totalPages - 1, page + 2));
            if (page < totalPages - 3) btns.push('...');
            btns.push(totalPages);
        }
        return btns.map(p => {
            if (p === '...') return `<span style="padding:0 4px;color:#9ca3af;">…</span>`;
            const active = p === page;
            return `<button onclick="invGoToPage(${p})"
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${active ? '#C5973B' : '#e5e7eb'};
                       background:${active ? '#C5973B' : 'white'};color:${active ? 'white' : '#374151'};
                       font-weight:${active ? '700' : '500'};font-size:13px;cursor:${active ? 'default' : 'pointer'};
                       transition:all 0.15s;"
                ${active ? 'disabled' : ''}>${p}</button>`;
        }).join('');
    }

    container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
                    gap:10px;padding:14px 4px;border-top:1px solid #f3f4f6;margin-top:4px;">
            <!-- Info + selector de tamaño -->
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:13px;color:#6b7280;">${showing}</span>
                <select onchange="invChangePageSize(this.value)"
                    style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;padding:4px 8px;
                           background:white;color:#374151;cursor:pointer;outline:none;">
                    ${[10,25,50,100].map(s =>
                        `<option value="${s}" ${s === pageSize ? 'selected' : ''}>${s} por página</option>`
                    ).join('')}
                </select>
            </div>
            <!-- Controles de página -->
            <div style="display:flex;align-items:center;gap:4px;">
                <button onclick="invGoToPage(1)" ${page === 1 ? 'disabled' : ''}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${page===1?'default':'pointer'};opacity:${page===1?0.4:1};font-size:13px;"
                    title="Primera página">⟨⟨</button>
                <button onclick="invGoToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${page===1?'default':'pointer'};opacity:${page===1?0.4:1};font-size:13px;"
                    title="Página anterior">‹</button>
                ${pageButtons()}
                <button onclick="invGoToPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${page===totalPages?'default':'pointer'};opacity:${page===totalPages?0.4:1};font-size:13px;"
                    title="Página siguiente">›</button>
                <button onclick="invGoToPage(${totalPages})" ${page === totalPages ? 'disabled' : ''}
                    style="height:34px;padding:0 10px;border-radius:8px;border:1px solid #e5e7eb;
                           background:white;cursor:${page===totalPages?'default':'pointer'};opacity:${page===totalPages?0.4:1};font-size:13px;"
                    title="Última página">⟩⟩</button>
            </div>
        </div>`;
}

function invGoToPage(p) {
    const totalPages = Math.ceil((window.products||[]).length / window._invPageSize);
    window._invCurrentPage = Math.max(1, Math.min(p, totalPages));
    renderInventoryTable();
    // Scroll suave al inicio de la tabla
    const tabla = document.getElementById('inventoryTable');
    if (tabla) tabla.closest('section, .section, main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function invChangePageSize(size) {
    window._invPageSize    = parseInt(size);
    window._invCurrentPage = 1;
    renderInventoryTable();
}

window.invGoToPage       = invGoToPage;
window.invChangePageSize = invChangePageSize;

// Reset de página al buscar/filtrar (llamar desde los inputs de filtro)
function invResetPage() {
    window._invCurrentPage = 1;
}
window.invResetPage = invResetPage;

window.renderInventoryTable = renderInventoryTable;

// ── Historial de movimientos: render ──────────────────────────────────────
function renderMovimientos() {
    const containerId = 'movimientosLista';
    const container = document.getElementById(containerId);
    if (!container) return;
    const q = (document.getElementById('movBuscar')||{}).value?.trim().toLowerCase() || '';
    let movs = window.stockMovements || [];
    if (q) movs = movs.filter(m => m.productoNombre?.toLowerCase().includes(q) || (m.motivo||'').toLowerCase().includes(q));
    if (!movs.length) {
        container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';
        return;
    }
    const icons = { entrada:'🟢', salida:'🔴', ajuste:'🟡', creacion:'🔵', venta:'🟠', merma:'🟤' };
    container.innerHTML = movs.slice(0,200).map(m => {
        const f = new Date(m.fecha).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'});
        const s = m.cantidad >= 0 ? `+${m.cantidad}` : `${m.cantidad}`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${icons[m.tipo]||'⚪'}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(m.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${f} · ${m.tipo} · ${_esc(m.motivo||'Sin motivo')}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${m.cantidad>=0?'#10b981':'#ef4444'};">${s} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${m.stockAntes} → ${m.stockDespues}</div>
            </div>
        </div>`;
    }).join('');
}
window.renderMovimientos = renderMovimientos;

function limpiarMovimientosInventario() {
    if (!confirm('¿Borrar todo el historial de movimientos?')) return;
    window.stockMovements = [];
    saveStockMovements();
    renderMovimientos();
}
window.limpiarMovimientosInventario = limpiarMovimientosInventario;

function toggleMovimientosInventario() {
    const panel = document.getElementById('movimientosPanel');
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderMovimientos();
}
window.toggleMovimientosInventario = toggleMovimientosInventario;

function renderStockMovements(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!window.stockMovements || !window.stockMovements.length) {
        container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Sin movimientos registrados</p>';
        return;
    }
    const icons = { entrada:'🟢', salida:'🔴', ajuste:'🟡', creacion:'🔵', venta:'🟠', merma:'🟤' };
    container.innerHTML = window.stockMovements.slice(0,100).map(m => {
        const f = new Date(m.fecha).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'});
        const s = m.cantidad >= 0 ? `+${m.cantidad}` : `${m.cantidad}`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="font-size:16px;">${icons[m.tipo]||'⚪'}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(m.productoNombre)}</div>
                <div style="color:#6b7280;font-size:11px;">${f} · ${m.tipo} · ${_esc(m.motivo||'Sin motivo')}</div>
            </div>
            <div style="text-align:right;white-space:nowrap;">
                <div style="font-weight:700;color:${m.cantidad>=0?'#10b981':'#ef4444'};">${s} uds</div>
                <div style="font-size:11px;color:#9ca3af;">${m.stockAntes} → ${m.stockDespues}</div>
            </div>
        </div>`;
    }).join('');
}
window.renderStockMovements = renderStockMovements;

// ── Feature 9: Duplicar producto ───────────────────────────────────────────
function duplicarProducto(id) {
    const orig = (window.products||[]).find(p => String(p.id) === String(id));
    if (!orig) { manekiToastExport('Producto no encontrado', 'err'); return; }
    const copia = JSON.parse(JSON.stringify(orig)); // deep clone
    copia.id   = _genId();
    copia.name = 'Copia de ' + orig.name;
    copia.sku  = (orig.sku || '') + '-C';
    copia.stock = 0; // Stock en cero — el usuario lo ajusta manualmente
    copia.historialPrecios = [];
    copia.historialCostos  = [];
    window.products.unshift(copia);
    saveProducts();
    renderInventoryTable();
    if (typeof renderProducts === 'function') renderProducts();
    manekiToastExport(`📋 "${copia.name}" creado — edítalo para ajustar stock y SKU`, 'ok');
}
window.duplicarProducto = duplicarProducto;

// ── Feature 5: Reporte de rentabilidad ────────────────────────────────────
function abrirReporteRentabilidad() {
    const pts = (window.products||[]).filter(p => !p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno');
    const conMargen = pts.map(p => {
        const margen = (p.price > 0 && p.cost > 0) ? ((p.price - p.cost) / p.price) * 100 : null;
        return { ...p, _margen: margen };
    }).sort((a, b) => (b._margen ?? -Infinity) - (a._margen ?? -Infinity));

    const filas = conMargen.map((p, i) => {
        const margen = p._margen !== null ? p._margen.toFixed(1) + '%' : '—';
        const ganancia = p.price > 0 && p.cost > 0 ? '$' + (p.price - p.cost).toFixed(2) : '—';
        const color = p._margen === null ? '#9ca3af' : p._margen >= 50 ? '#16a34a' : p._margen >= 30 ? '#d97706' : '#dc2626';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        return `<tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 12px;font-weight:600;color:#374151;">${medal}</td>
            <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1f2937;">${_esc(p.name)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">$${Number(p.cost||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;">$${Number(p.price||0).toFixed(2)}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;">${ganancia}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:${color};font-size:14px;">${margen}</td>
        </tr>`;
    }).join('');

    const promedio = conMargen.filter(p => p._margen !== null).reduce((s, p, _, a) => s + p._margen / a.length, 0);
    const topProducto = conMargen[0];

    let modal = document.getElementById('_mkRentabilidadModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = '_mkRentabilidadModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:white;border-radius:20px;width:min(820px,95vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
            <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#fef3c7,#fff7ed);">
                <div>
                    <h2 style="font-size:1.2rem;font-weight:700;color:#92400e;margin:0;">📊 Reporte de Rentabilidad</h2>
                    <p style="font-size:12px;color:#b45309;margin:4px 0 0;">Ranking de productos por margen de ganancia</p>
                </div>
                <button onclick="document.getElementById('_mkRentabilidadModal').style.display='none'"
                    style="width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:white;cursor:pointer;font-size:16px;">✕</button>
            </div>
            <div style="display:flex;gap:16px;padding:16px 24px;background:#fffbeb;border-bottom:1px solid #fef3c7;">
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Margen promedio</div>
                    <div style="font-size:1.6rem;font-weight:800;color:#d97706;">${conMargen.some(p => p._margen !== null) ? promedio.toFixed(1) + '%' : '—'}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Más rentable</div>
                    <div style="font-size:.95rem;font-weight:700;color:#16a34a;margin-top:4px;">${topProducto ? _esc(topProducto.name) : '—'}</div>
                </div>
                <div style="flex:1;background:white;border-radius:12px;padding:12px 16px;border:1px solid #fde68a;">
                    <div style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Total productos</div>
                    <div style="font-size:1.6rem;font-weight:800;color:#374151;">${pts.length}</div>
                </div>
            </div>
            <div style="overflow-y:auto;flex:1;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="position:sticky;top:0;background:#f9fafb;">
                        <tr>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">#</th>
                            <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Producto</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Costo</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Precio</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Ganancia</th>
                            <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">Margen</th>
                        </tr>
                    </thead>
                    <tbody>${filas || '<tr><td colspan="6" style="padding:32px;text-align:center;color:#9ca3af;">Sin productos con precio/costo definidos</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
    modal.style.display = 'flex';
}
window.abrirReporteRentabilidad = abrirReporteRentabilidad;
