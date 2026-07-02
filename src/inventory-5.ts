// ── N-SEARCH-004: Búsqueda typo-tolerant (Levenshtein distance) ───────────
function _levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({length: m+1}, (_, i) =>
        Array.from({length: n+1}, (_, j) => j === 0 ? i : 0));
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] :
                1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
}
(window as any)._levenshtein = _levenshtein;
function _fuzzyMatch(query: string, target: string, threshold = 2): boolean {
    query = query.toLowerCase().trim();
    target = target.toLowerCase();
    if (!query) return true;
    if (target.includes(query)) return true;
    const words = target.split(/[\s,.-]+/);
    return words.some(w => {
        const cmp = w.substring(0, query.length + 2);
        return cmp.length >= query.length - 1 && _levenshtein(query, cmp) <= threshold;
    });
}
(window as any)._fuzzyMatch = _fuzzyMatch;

// ── Calcular cuántas unidades se pueden producir desde MP ──────────────────
function calcularProducibles(prod) {
    if (!Array.isArray(prod.mpComponentes) || prod.mpComponentes.length === 0) return null;
    let minFabricable = Infinity;
    for (const comp of prod.mpComponentes) {
        const mp = (window.products || []).find(p => String(p.id) === String(comp.id));
        if (!mp) return 0;
        const stockMp = typeof getStockEfectivo==='function' ? getStockEfectivo(mp) : (mp.stock || 0);
        const qty = parseFloat(comp.qty) || 1;
        minFabricable = Math.min(minFabricable, Math.floor(stockMp / qty));
    }
    return minFabricable === Infinity ? 0 : minFabricable;
}
window.calcularProducibles = calcularProducibles;

// ── Actualización masiva de precios ───────────────────────────────────────
function abrirBulkPrecioModal() {
    let modal = document.getElementById('bulkPrecioModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bulkPrecioModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.body.appendChild(modal);
    }

    // Obtener categorías únicas
    const cats = [...new Set((window.products||[]).map(p => p.category).filter(Boolean))];
    const catOptions = cats.map(cid => {
        const cat = (window.categories||[]).find(c => String(c.id) === String(cid));
        return `<option value="${_esc(cid)}">${_esc(cat ? (cat.emoji ? cat.emoji+' '+cat.name : cat.name) : cid)}</option>`;
    }).join('');

    modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:min(540px,95vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;background:linear-gradient(135deg,#fef3c7,#fff7ed);display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h2 style="font-size:1.1rem;font-weight:800;color:#92400e;margin:0;">📊 Actualizar precios masivamente</h2>
                <p style="font-size:.75rem;color:#b45309;margin:4px 0 0;">Aplica un porcentaje de cambio a múltiples productos</p>
            </div>
            <button onclick="document.getElementById('bulkPrecioModal').style.display='none'"
                style="width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">% de cambio en precio</label>
                <div style="display:flex;align-items:center;gap:8px;">
                    <input type="range" id="bulkPrecioRange" min="-50" max="200" value="0"
                        oninput="document.getElementById('bulkPrecioNum').value=this.value;bulkPrecioPreview()"
                        style="flex:1;">
                    <input type="number" id="bulkPrecioNum" min="-50" max="200" value="0"
                        oninput="document.getElementById('bulkPrecioRange').value=this.value;bulkPrecioPreview()"
                        style="width:72px;padding:6px 8px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;font-weight:700;text-align:center;">
                    <span style="font-size:.9rem;font-weight:700;color:#374151;">%</span>
                </div>
                <p style="font-size:.7rem;color:#9ca3af;margin-top:3px;">Negativo = descuento · Positivo = aumento</p>
            </div>
            <div style="display:flex;gap:20px;flex-wrap:wrap;">
                <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;">
                    <input type="checkbox" id="bulkPrecioSoloPT" onchange="bulkPrecioPreview()" style="accent-color:#FFD166;">
                    Solo Productos Terminados
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;">
                    <input type="checkbox" id="bulkPrecioSoloMP" onchange="bulkPrecioPreview()" style="accent-color:#9669c4;">
                    Solo Materias Primas (costo)
                </label>
            </div>
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Categoría (opcional)</label>
                <select id="bulkPrecioCat" onchange="bulkPrecioPreview()"
                    style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.85rem;outline:none;">
                    <option value="">Todas las categorías</option>
                    ${catOptions}
                </select>
            </div>
            <div id="bulkPrecioPreviewList" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;max-height:220px;overflow-y:auto;padding:8px;">
                <p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ajusta los filtros y haz clic en Vista previa</p>
            </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;gap:8px;justify-content:flex-end;">
            <button onclick="document.getElementById('bulkPrecioModal').style.display='none'"
                style="padding:8px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.85rem;cursor:pointer;">Cancelar</button>
            <button onclick="bulkPrecioPreview()"
                style="padding:8px 18px;border:none;border-radius:10px;background:#e0f2fe;color:#0369a1;font-size:.85rem;font-weight:700;cursor:pointer;">👁 Vista previa</button>
            <button onclick="bulkPrecioAplicar()" class="mk-btn-primary">✅ Aplicar</button>
        </div>
    </div>`;

    modal.style.display = 'flex';
    bulkPrecioPreview();
}
window.abrirBulkPrecioModal = abrirBulkPrecioModal;

// I6: modal de ajuste masivo de stock (análogo al de precios)
function abrirBulkStockModal() {
    let modal = document.getElementById('bulkStockModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bulkStockModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.body.appendChild(modal);
    }
    const cats = [...new Set((window.products||[]).filter(p => p.tipo === 'materia_prima').map(p => p.category).filter(Boolean))];
    const catOptions = cats.map(cid => {
        const cat = (window.categories||[]).find(c => String(c.id) === String(cid));
        return `<option value="${_esc(String(cid))}">${_esc(cat ? (cat.emoji ? cat.emoji+' '+cat.name : cat.name) : String(cid))}</option>`;
    }).join('');
    modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;width:min(520px,95vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="padding:20px 24px;border-bottom:1px solid #f3f4f6;background:linear-gradient(135deg,#f0fdf4,#dcfce7);display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h2 style="font-size:1.1rem;font-weight:800;color:#15803d;margin:0;">📦 Ajuste masivo de stock</h2>
                <p style="font-size:.75rem;color:#16a34a;margin:4px 0 0;">Suma o resta stock a múltiples materias primas</p>
            </div>
            <button onclick="document.getElementById('bulkStockModal').style.display='none'" style="width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;flex:1;">
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Cantidad a ajustar</label>
                <div style="display:flex;align-items:center;gap:8px;">
                    <input type="number" id="bulkStockCantidad" value="0" step="1"
                        oninput="_bulkStockPreview()"
                        style="width:100px;padding:8px 10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:1rem;font-weight:700;text-align:center;">
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <span style="font-size:.75rem;color:#6b7280;">Positivo = suma · Negativo = resta</span>
                        <div style="display:flex;gap:6px;">
                            <button onclick="const el=document.getElementById('bulkStockCantidad');el.value=String(parseInt(el.value||'0')-1);_bulkStockPreview()" style="padding:3px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-weight:700;">−</button>
                            <button onclick="const el=document.getElementById('bulkStockCantidad');el.value=String(parseInt(el.value||'0')+1);_bulkStockPreview()" style="padding:3px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-weight:700;">+</button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Categoría (opcional)</label>
                <select id="bulkStockCat" onchange="_bulkStockPreview()"
                    style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.85rem;outline:none;">
                    <option value="">Todas las categorías</option>
                    ${catOptions}
                </select>
            </div>
            <div id="bulkStockPreviewList" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;max-height:220px;overflow-y:auto;padding:8px;">
                <p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ajusta los parámetros para ver el resultado</p>
            </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #f3f4f6;display:flex;gap:8px;justify-content:flex-end;">
            <button onclick="document.getElementById('bulkStockModal').style.display='none'" style="padding:8px 18px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.85rem;cursor:pointer;">Cancelar</button>
            <button onclick="_bulkStockPreview()" style="padding:8px 18px;border:none;border-radius:10px;background:#d1fae5;color:#065f46;font-size:.85rem;font-weight:700;cursor:pointer;">👁 Vista previa</button>
            <button onclick="_bulkStockAplicar()" style="padding:8px 18px;border:none;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;">✅ Aplicar</button>
        </div>
    </div>`;
    modal.style.display = 'flex';
    _bulkStockPreview();
}
window.abrirBulkStockModal = abrirBulkStockModal;

function _bulkStockPreview() {
    const cantidad = parseInt((document.getElementById('bulkStockCantidad') as HTMLInputElement)?.value || '0');
    const catFiltro = (document.getElementById('bulkStockCat') as HTMLSelectElement)?.value || '';
    const prods = (window.products || []).filter(p =>
        p.tipo === 'materia_prima' && (!catFiltro || String(p.category) === catFiltro)
    );
    const list = document.getElementById('bulkStockPreviewList');
    if (!list) return;
    if (cantidad === 0) { list.innerHTML = '<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Ingresa una cantidad distinta de 0</p>'; return; }
    list.innerHTML = `
        <div style="font-size:.72rem;font-weight:700;color:#6b7280;margin-bottom:6px;">${prods.length} producto${prods.length!==1?'s':''} afectados:</div>
        ${prods.slice(0, 20).map(p => {
            const stk = typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (parseInt(p.stock)||0);
            const nuevo = Math.max(0, stk + cantidad);
            return `<div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f3f4f6;font-size:.76rem;">
                <span>${_esc(p.name)}</span>
                <span>${stk} → <b style="color:${cantidad>0?'#16a34a':'#dc2626'}">${nuevo}</b></span>
            </div>`;
        }).join('')}
        ${prods.length > 20 ? `<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:6px;">...y ${prods.length-20} más</p>` : ''}`;
}
(window as any)._bulkStockPreview = _bulkStockPreview;

async function _bulkStockAplicar() {
    const cantidad = parseInt((document.getElementById('bulkStockCantidad') as HTMLInputElement)?.value || '0');
    const catFiltro = (document.getElementById('bulkStockCat') as HTMLSelectElement)?.value || '';
    if (cantidad === 0) { manekiToastExport('Ingresa una cantidad distinta de 0', 'warn'); return; }
    const prods = (window.products || []).filter(p =>
        p.tipo === 'materia_prima' && (!catFiltro || String(p.category) === catFiltro)
    );
    if (prods.length === 0) { manekiToastExport('Sin productos para ajustar', 'warn'); return; }
    const _gse = typeof getStockEfectivo === 'function' ? getStockEfectivo : (p: any) => parseInt(p.stock)||0;
    prods.forEach(p => {
        const antes = _gse(p);
        p.stock = Math.max(0, antes + cantidad);
        if (typeof registrarMovimiento === 'function') {
            registrarMovimiento({ productoId: p.id, productoNombre: p.name, tipo: cantidad > 0 ? 'entrada' : 'merma', cantidad: Math.abs(cantidad), motivo: `Ajuste masivo ${cantidad > 0 ? '+' : ''}${cantidad}`, stockAntes: antes, stockDespues: p.stock });
        }
    });
    if (typeof saveProducts === 'function') saveProducts();
    renderInventoryTable();
    document.getElementById('bulkStockModal').style.display = 'none';
    manekiToastExport(`✅ Stock ajustado en ${prods.length} producto(s)`, 'ok');
}
(window as any)._bulkStockAplicar = _bulkStockAplicar;

function _bulkPrecioGetAfectados() {
    const pct    = parseFloat(document.getElementById('bulkPrecioNum')?.value) || 0;
    const soloPT = document.getElementById('bulkPrecioSoloPT')?.checked || false;
    const soloMP = document.getElementById('bulkPrecioSoloMP')?.checked || false;
    const catFil = (document.getElementById('bulkPrecioCat')?.value || '').trim();
    return (window.products || []).filter(p => {
        if (catFil && String(p.category) !== catFil) return false;
        if (soloPT && soloMP) return true; // ambos = todos
        if (soloPT && !(!p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno' || p.tipo === 'pack')) return false;
        if (soloMP && p.tipo !== 'materia_prima') return false;
        return true;
    }).map(p => {
        const campoKey = (soloMP && !soloPT) ? 'cost' : 'price';
        const precioActual = parseFloat(p[campoKey]) || 0;
        const precioNuevo  = Math.max(0, Math.round(precioActual * (1 + pct / 100) * 100) / 100);
        return { p, campoKey, precioActual, precioNuevo };
    }).filter(r => r.precioActual > 0);
}

function bulkPrecioPreview() {
    const lista = document.getElementById('bulkPrecioPreviewList');
    if (!lista) return;
    const afectados = _bulkPrecioGetAfectados();
    if (!afectados.length) {
        lista.innerHTML = '<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:16px;">Sin productos que coincidan con los filtros</p>';
        return;
    }
    lista.innerHTML = afectados.slice(0, 50).map(({ p, campoKey, precioActual, precioNuevo }) => {
        const diff = precioNuevo - precioActual;
        const clr  = diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#6b7280';
        const lbl  = campoKey === 'cost' ? 'Costo' : 'Precio';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:.78rem;">
            <span style="font-weight:600;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_esc(p.name)}">${_esc(p.name)}</span>
            <span style="color:#6b7280;white-space:nowrap;margin:0 8px;">${lbl}: $${precioActual.toFixed(2)}</span>
            <span style="font-weight:700;color:${clr};white-space:nowrap;">→ $${precioNuevo.toFixed(2)}</span>
        </div>`;
    }).join('') + (afectados.length > 50 ? `<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px;">...y ${afectados.length - 50} más</p>` : '');
}
window.bulkPrecioPreview = bulkPrecioPreview;

async function bulkPrecioAplicar() {
    const afectados = _bulkPrecioGetAfectados();
    if (!afectados.length) { manekiToastExport('Sin productos que actualizar', 'warn'); return; }
    // UX2: asegurar que la vista previa esté actualizada antes de confirmar
    bulkPrecioPreview();
    const pct = parseFloat(document.getElementById('bulkPrecioNum')?.value) || 0;
    const campoLabel = (document.getElementById('bulkPrecioSoloMP')?.checked && !document.getElementById('bulkPrecioSoloPT')?.checked) ? 'costo' : 'precio';
    const signo = pct > 0 ? '+' : '';
    // Construir resumen de cambios para la confirmación
    const previewHtml = afectados.slice(0, 5).map(({ p, precioActual, precioNuevo }) =>
        `<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:3px 0;border-bottom:1px solid #f3f4f6;">
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;max-width:180px">${_esc(p.name)}</span>
            <span style="color:#9ca3af;margin:0 8px;">$${precioActual.toFixed(2)}</span>
            <span style="font-weight:700;color:${precioNuevo>precioActual?'#16a34a':'#dc2626'};">→ $${precioNuevo.toFixed(2)}</span>
        </div>`
    ).join('') + (afectados.length > 5 ? `<p style="font-size:.72rem;color:#9ca3af;margin-top:4px;">…y ${afectados.length - 5} más</p>` : '');
    if (typeof showConfirm === 'function') {
        showConfirm(
            `<div>
                <p style="font-weight:700;margin-bottom:8px;">Aplicar <strong>${signo}${pct}%</strong> al ${campoLabel} de <strong>${afectados.length}</strong> producto(s):</p>
                ${previewHtml}
             </div>`,
            `✅ Confirmar cambio masivo`
        ).then((ok: boolean) => {
            if (!ok) return;
            afectados.forEach(({ p, campoKey, precioNuevo }) => {
                p[campoKey] = precioNuevo;
                p.updatedAt = new Date().toISOString();
            });
            if (typeof saveProducts === 'function') saveProducts();
            renderInventoryTable();
            document.getElementById('bulkPrecioModal').style.display = 'none';
            manekiToastExport(`✅ Precios actualizados en ${afectados.length} producto(s)`, 'ok');
        });
    } else {
        if (!await showConfirm(`¿Aplicar ${signo}${pct}% a ${afectados.length} producto(s)? Ver preview arriba.`)) return;
        afectados.forEach(({ p, campoKey, precioNuevo }) => {
            p[campoKey] = precioNuevo;
            p.updatedAt = new Date().toISOString();
        });
        if (typeof saveProducts === 'function') saveProducts();
        renderInventoryTable();
        document.getElementById('bulkPrecioModal').style.display = 'none';
        manekiToastExport(`✅ Precios actualizados en ${afectados.length} producto(s)`, 'ok');
    }
}
window.bulkPrecioAplicar = bulkPrecioAplicar;

function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;
    // P1: hash guard — saltar re-render completo si los datos no cambiaron
    const _prods = window.products||[];
    const _tipoQ = (document.getElementById('inventoryTipoFilter') as HTMLSelectElement|null)?.value || '';
    const _iHash = _prods.length + '_' + _prods.reduce((s: number,p: any)=>s+Number(p.stock||0),0).toFixed(0) + '_' + ((document.getElementById('inventorySearch') as HTMLInputElement|null)?.value||'') + '_' + _tipoQ;
    const dualEl = document.getElementById('invDualContainer');
    if (dualEl && (dualEl as any)._lastHash === _iHash) return;
    if (dualEl) (dualEl as any)._lastHash = _iHash;

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

    // P2: pre-cachear getStockEfectivo para evitar recalcular en cada fila del render
    const _stockCache: Map<string, number> = new Map(
        allProducts.map(p => [String(p.id), typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (parseInt(p.stock) || 0)])
    );
    (window as any)._invStockCache = _stockCache;

    // Poblar filtro de proveedores cada vez que se renderiza
    if (typeof poblarFiltroProveedores === 'function') poblarFiltroProveedores();

    // ── Inyectar estilos para columnas ocultas (SKU/Proveedor) ──────────────
    if (!document.getElementById('invExtraColStyles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'invExtraColStyles';
        styleEl.textContent = `
            .inv-col-hidden-sku { display: none; }
            .inv-col-hidden-prov { display: none; }
            .inv-show-extra .inv-col-hidden-sku { display: table-cell; }
            .inv-show-extra .inv-col-hidden-prov { display: table-cell; }
        `;
        document.head.appendChild(styleEl);
    }

    // ── Botón toggle SKU/Proveedor ──────────────────────────────────────────
    let invToggleBtn = document.getElementById('invExtraColToggle');
    if (!invToggleBtn) {
        invToggleBtn = document.createElement('button');
        invToggleBtn.id = 'invExtraColToggle';
        invToggleBtn.style.cssText = 'padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:.8rem;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:10px;';
        invToggleBtn.textContent = 'Mostrar SKU/Proveedor';
        invToggleBtn.addEventListener('click', () => {
            const dc = document.getElementById('invDualContainer');
            if (!dc) return;
            const showing = dc.classList.toggle('inv-show-extra');
            invToggleBtn.textContent = showing ? 'Ocultar SKU/Proveedor' : 'Mostrar SKU/Proveedor';
        });
        dualContainer.parentNode.insertBefore(invToggleBtn, dualContainer);
    }

    if (allProducts.length === 0) {
        dualContainer.innerHTML = `
        <div class="mk-empty" style="padding:48px 24px;text-align:center;">
            <div class="mk-empty-icon">📦</div>
            <p class="mk-empty-title">Sin productos aún</p>
            <p class="mk-empty-sub">Tu inventario está vacío. Agrega tu primer producto para empezar.</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
                <button onclick="openAddProductModal()" class="mk-btn-primary">
                    📦 Agregar Producto Terminado
                </button>
                <button onclick="injectMpModal();openAddMateriaPrimaModal()" class="mk-toolbar-btn">
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
        const _ns = window._normSearch || (s => String(s||'').toLowerCase());
        const qN = _ns(q);
        const provQN = _ns(provQ);
        const tagMatch  = (p) => !tagQ  || (p.tags && p.tags.includes(tagQ));
        const provMatch = (p) => !provQ || _ns(p.proveedor||'').includes(provQN);

        if (!q) return list.filter(p => tagMatch(p) && provMatch(p));

        // Primero: coincidencia exacta (substring)
        const exactos = list.filter(p => {
            const nombreMatch = _ns(p.name).includes(qN)
                || _ns(p.sku||'').includes(qN)
                || _ns(p.proveedor||'').includes(qN)
                || _ns(p.notas||'').includes(qN)
                || (p.tags||[]).some(t => _ns(t).includes(qN));
            return nombreMatch && tagMatch(p) && provMatch(p);
        });

        if (exactos.length > 0) return exactos;

        // Fallback: fuzzy matching si no hay resultados exactos (N-SEARCH-004)
        return list.filter(p =>
            (_fuzzyMatch(qN, p.name || '') ||
             _fuzzyMatch(qN, p.sku || '') ||
             _fuzzyMatch(qN, p.proveedor || '')) &&
            tagMatch(p) && provMatch(p)
        );
    }

    const mps  = applyFilters(allProducts.filter(p => p.tipo === 'materia_prima'));
    const svcs = applyFilters(allProducts.filter(p => p.tipo === 'servicio'));
    const pvs  = applyFilters(allProducts.filter(p => p.tipo === 'producto_variable'));
    const pts  = applyFilters(allProducts.filter(p => !p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno' || p.tipo === 'pack'));

    // I1: _dispCache computado DESPUÉS de filtros — solo para productos que pasan el filtro
    // (evitar O(n) de calcularDisponibilidadDesdeMP en productos no visibles)
    const _filteredIds = new Set([...pts, ...pvs].map(p => String(p.id)));
    const _pMap: Map<string, any> = window.productMap || new Map(allProducts.map(p => [String(p.id), p]));
    const _dispCache: Map<string, any> = new Map();
    for (const p of allProducts) {
        if (p.mpComponentes && p.mpComponentes.length > 0 && _filteredIds.has(String(p.id))) {
            _dispCache.set(String(p.id), calcularDisponibilidadDesdeMP(p, _pMap, _stockCache));
        }
    }

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
        const stockEf = _stockCache.get(pid) ?? (typeof getStockEfectivo === 'function' ? getStockEfectivo(product) : parseInt(product.stock) || 0);
        const imgHTML = product.imageUrl
            ? `<img src="${product.imageUrl}" alt="${_esc(product.name||'')}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`
            : `<span style="font-size:1.6rem;">${product.image||'🏭'}</span>`;
        let badge;
        if      (stockEf === 0)                    badge = '<span class="badge-danger">🔴 Agotado</span>';
        else if (stockEf <= (product.stockMin||5)) badge = '<span class="badge-warning">⚠️ Bajo Stock</span>';
        else                                        badge = '<span class="badge-success">✅ Disponible</span>';
        const cat = (window.categories||[]).find(c => c.id === product.category);
        const catName = cat ? cat.name : (product.category||'');
        return `
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${ri*0.03}s" class="hover:bg-purple-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${pid}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    ${product.historialCostos && product.historialCostos.length ? `<span title="Este producto ha tenido ${product.historialCostos.length} modificaciones de precio o stock" style="font-size:10px;background:#f3e8ff;color:#9669c4;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">📈 ${product.historialCostos.length} cambio${product.historialCostos.length>1?'s':''}</span>` : ''}
                    ${product.compraPaquete ? `<div style="font-size:10px;color:#9669c4;margin-top:2px;">📦 Paquete: ${product.compraPaquete.cantidad} uds · $${Number(product.compraPaquete.precio).toFixed(2)}</div>` : ''}
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#f3e8ff;color:#9669c4;border:1px solid #e9d5ff;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(catName)}</td>
            <td class="px-4 py-3 text-right" style="font-size:.85rem;color:#9669c4;font-weight:600;">$${Number(product.cost||0).toFixed(2)}</td>
            <td class="px-4 py-3 text-gray-500 text-sm inv-col-hidden-prov">${_esc(product.proveedor||'—')}</td>
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
                <div style="display:flex;gap:3px;align-items:center;">
                    <button type="button" onclick="editProduct('${pid}')" title="Editar" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">✏️</button>
                    <button type="button" onclick="ajustarStock('${pid}')" title="Ajustar stock" style="width:30px;height:30px;border-radius:7px;border:1px solid rgba(16,185,129,0.2);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;">📦</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" onclick="_invMpMenu(this,'${pid}',${!!product.proveedorUrl},'${product.activo===false?'desarchivar':'archivar'}')" title="Más acciones" style="width:30px;height:30px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;font-weight:700;color:#6b7280;">···</button>
                    </div>
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
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${pid}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3 text-right" style="font-size:.95rem;font-weight:700;color:#6d28d9;">$${Number(product.cost||0).toFixed(2)}</td>
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
            ? `<img src="${product.imageUrl}" alt="${_esc(product.name||'')}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`
            : `<span style="font-size:1.6rem;">${product.image||'📦'}</span>`;
        const cat = (window.categories||[]).find(c => c.id === product.category);
        const catName = cat ? cat.name : (product.category||'');

        // D28: usar caché pre-computada
        const disp = _dispCache.get(pid) ?? null;
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
            const _stEf = _stockCache.get(String(product.id)) ?? (typeof getStockEfectivo === 'function' ? getStockEfectivo(product) : (product.stock || 0));
            const _stMin = product.stockMin || 5;
            const _clr = _stEf === 0 ? '#ef4444' : _stEf <= _stMin ? '#f59e0b' : '#10b981';
            const _bgClr = _stEf === 0 ? '#fee2e2' : _stEf <= _stMin ? '#fef3c7' : '#d1fae5';
            stockCell = `<span style="padding:3px 12px;border-radius:8px;background:${_bgClr};color:${_clr};font-weight:700;font-size:.95rem;">${_stEf}</span>`;
            badgeCell = _stEf === 0
                ? '<span style="background:#fee2e2;color:#ef4444;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">🔴 Agotado</span>'
                : _stEf <= _stMin
                ? '<span style="background:#fef3c7;color:#f59e0b;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">⚠️ Bajo Stock</span>'
                : '<span style="background:#d1fae5;color:#10b981;padding:2px 10px;border-radius:8px;font-size:.75rem;font-weight:700;">✅ Disponible</span>';
        }

        // I7: desglose de variantes con toggle expandir/colapsar
        const _varKey = `_invVar_${pid}_open`;
        const _varOpen = (window as any)[_varKey] === true;
        const _hasVars = product.variants && product.variants.length > 0;
        const varsHTML = _hasVars
            ? `<div>
                <button onclick="(()=>{window['_invVar_${pid}_open']=!window['_invVar_${pid}_open'];renderInventoryTable()})()" style="font-size:.68rem;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:2px 8px;cursor:pointer;font-weight:600;white-space:nowrap;">
                    ${_varOpen ? '▲' : '▶'} ${product.variants.length} variante${product.variants.length!==1?'s':''}
                </button>
                ${_varOpen ? `<div style="margin-top:4px;display:flex;flex-direction:column;gap:2px;">` +
                    product.variants.map(v => `
                    <div style="display:flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 0;">
                        <span style="color:#6b7280;">${_esc(v.type)}:</span>
                        ${_mkColorDot(v.type,_esc(v.value))}
                        <span style="font-weight:600;color:#374151;">${_esc(v.value)}</span>
                        <span style="background:#e0f2fe;color:#0369a1;padding:0 5px;border-radius:99px;font-weight:700;margin-left:2px;">${v.qty??0}</span>
                    </div>`).join('') + `</div>` : ''}
               </div>`
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
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${pid}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    ${product._tieneComponentesHuerfanos ? `<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;" title="Tiene componentes de inventario eliminados. Edita el producto para corregir.">⚠️ MP faltante</span>` : ''}
                    ${product.tipo === 'pack' ? `<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #fde68a;">🎁 Pack</span>` : ''}
                    ${product.tipo === 'pack' && product.packComponentes && product.packComponentes.length ? `<div style="font-size:.72rem;color:#9ca3af;margin-top:2px;">${product.packComponentes.map(c=>`${c.qty > 1 ? c.qty+'× ' : ''}${_esc(c.nombre)}`).join(' + ')}</div>` : ''}
                    ${product.historialPrecios && product.historialPrecios.length ? `<span title="Este producto ha tenido ${product.historialPrecios.length} modificaciones de precio o stock" style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:99px;margin-left:4px;cursor:help;">📈 ${product.historialPrecios.length} cambio${product.historialPrecios.length>1?'s':''}</span>` : ''}
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.proveedorNombre ? `<div style="margin-top:2px;font-size:.72rem;color:#065f46;display:flex;align-items:center;gap:3px;" title="${_esc(product.proveedorNotas||'')}">🏭 Proveedor: <b>${_esc(product.proveedorNombre)}</b>${product.proveedorNotas ? ' ℹ️' : ''}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;">${_esc(t)}</span>`).join('')}</div>` : ''}
                    ${(() => { const _prod = calcularProducibles(product); if (_prod === null) return ''; const _pclr = _prod >= 5 ? '#16a34a' : _prod >= 1 ? '#d97706' : '#dc2626'; const _pbg = _prod >= 5 ? '#d1fae5' : _prod >= 1 ? '#fef3c7' : '#fee2e2'; const _txt = _prod === 0 ? 'Sin stock MP' : `Producibles: ${_prod}`; return `<div style="margin-top:3px;"><span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;background:${_pbg};color:${_pclr};border:1px solid ${_pclr}33;">🏭 ${_txt}</span></div>`; })()}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3 text-gray-600 text-sm capitalize">${_esc(catName)}</td>
            <td class="px-4 py-3">${varsHTML}</td>
            <td class="px-4 py-3 text-right text-gray-800 font-semibold" ondblclick="invInlineEditPrice('${pid}', this)" style="font-size:.95rem;cursor:pointer;" title="Doble-click para editar precio">$${Number(product.price||0).toFixed(2)}</td>
            <td class="px-4 py-3" ondblclick="invInlineEditStock('${pid}', this)" style="cursor:pointer;" title="Doble-click para editar stock">${stockCell}</td>
            <td class="px-4 py-3">${badgeCell}</td>
            <td class="px-4 py-3">${margenHTML}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    ${product.tipo === 'pack'
                        ? `<button type="button" onclick="openPackModal('${pid}')" title="Editar Pack" aria-label="Editar pack"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>`
                        : `<button type="button" onclick="editProduct('${pid}')" title="Editar" aria-label="Editar producto"
                            style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>`
                    }
                    <button type="button" onclick="duplicarProducto('${pid}')" title="Duplicar" aria-label="Duplicar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📋</button>
                    ${product.tipo !== 'pack' ? `<button type="button" onclick="cambiarTipoProducto('${pid}')" title="Convertir a Materia Prima" aria-label="Convertir tipo de producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">→🧪</button>` : ''}
                    ${product.movimientos && product.movimientos.length ? `<button type="button" onclick="verMovimientosProducto('${pid}')" title="Ver movimientos de stock (${product.movimientos.length})" aria-label="Ver movimientos de stock"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📋</button>` : ''}
                    <button type="button" onclick="abrirMovimientoProducto('${pid}')" title="Gráfica de movimientos últimos 90 días" aria-label="Ver gráfica de movimientos"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📈</button>
                    <button type="button" onclick="archivarProducto('${pid}')" title="${product.activo===false?'Desarchivar producto (activar)':'Archivar producto (ocultar)'}" aria-label="Archivar/Desarchivar"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(107,114,128,0.25);background:rgba(107,114,128,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">${product.activo===false?'🔓':'📁'}</button>
                    <button type="button" onclick="deleteProduct('${pid}')" title="Eliminar" aria-label="Eliminar producto"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🗑️</button>
                </div>
            </td>
        </tr>`;
    }

    // ── Render fila de PRODUCTO VARIABLE ──────────────────────────────────────
    function renderFilaVariable(product, ri) {
        const pid = String(product.id);
        const imgHTML = product.imageUrl
            ? `<img src="${product.imageUrl}" alt="${_esc(product.name||'')}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;" loading="lazy">`
            : `<span style="font-size:1.6rem;">${product.image||'🎯'}</span>`;

        // Tabla de precios como pills
        const tabla = (product.tablaPreciosVariable || []).slice().sort((a,b) => a.cantidadMin - b.cantidadMin);
        const tablaHTML = tabla.length
            ? tabla.map(r => `<span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 7px;border-radius:99px;white-space:nowrap;">${r.cantidadMin} pzas = $${Number(r.precio).toFixed(2)}</span>`).join(' ')
            : '<span style="font-size:10px;color:#9ca3af;">Sin rangos</span>';

        const nMps = (product.mpComponentes || []).length;

        // Categoría
        const catObj = (window.categories||[]).find(c => String(c.id) === String(product.category));
        const catName = catObj ? `${catObj.emoji||''} ${catObj.name}` : '—';

        // Precio mínimo por pieza (primer rango, menor cantidad)
        const _pvTabla = tabla;
        const _pvPrecioMin = _pvTabla.length ? _pvTabla[0].precio / (_pvTabla[0].cantidadMin || 1) : 0;
        const precioCell = _pvPrecioMin > 0
            ? `<div><span class="font-semibold text-gray-800" style="font-size:.95rem;">$${_pvPrecioMin.toFixed(2)}</span><div style="font-size:10px;color:#9ca3af;">por pieza</div></div>`
            : '<span style="color:#9ca3af;font-size:.8rem;">—</span>';

        // D28: usar caché pre-computada
        const disp = _dispCache.get(String(product.id)) ?? null;
        let stockCell, badgeCell;
        if (disp !== null) {
            const piezas = disp.piezas;
            const clr   = piezas === 0 ? '#ef4444' : piezas <= 3 ? '#f59e0b' : '#10b981';
            const bgClr = piezas === 0 ? '#fee2e2' : piezas <= 3 ? '#fef3c7' : '#d1fae5';
            const tooltip = disp.detalle.map(d => `${d.nombre}: ${d.stock}÷${d.qty}=${d.posibles}pzs`).join(' | ');
            stockCell = `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
                <span title="${_esc(tooltip)}" style="padding:3px 12px;border-radius:8px;background:${bgClr};color:${clr};font-weight:700;font-size:.95rem;border:1px solid ${clr}33;cursor:help;">${piezas}</span>
                <span style="font-size:10px;color:#6b7280;">desde MP</span>
            </div>`;
            badgeCell = piezas === 0 ? '<span class="badge-danger">Sin stock MP</span>'
                : piezas <= 3 ? '<span class="badge-warning">MP bajo</span>'
                : '<span class="badge-success">Disponible</span>';
        } else {
            stockCell = `<span style="font-size:.8rem;color:#9ca3af;font-style:italic;">Sin MP config.</span>`;
            badgeCell = `<span style="font-size:11px;background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:99px;">Sin MP config.</span>`;
        }

        // Margen
        const _pvCostoComp = (product.mpComponentes || []).reduce((s, c) => s + (parseFloat(c.costUnit)||0) * (parseFloat(c.qty)||1), 0);
        const _pvRph = product.rendimientoPorHoja || 1;
        const _pvCostoUnit = _pvRph > 0 ? _pvCostoComp / _pvRph : _pvCostoComp;
        const _pvMargen = _pvPrecioMin > 0 ? Math.round((_pvPrecioMin - _pvCostoUnit) / _pvPrecioMin * 100) : 0;
        const _pvMargenColor = _pvMargen >= 40 ? '#10b981' : _pvMargen >= 20 ? '#f59e0b' : '#ef4444';
        const margenHTML = _pvPrecioMin > 0
            ? `<div style="min-width:48px;">
                <div style="font-weight:600;font-size:13px;color:${_pvMargenColor};">${_pvMargen}%</div>
                <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${Math.min(100,_pvMargen)}%;background:${_pvMargenColor};border-radius:99px;"></div>
                </div></div>`
            : '<span class="text-gray-300 text-xs">—</span>';

        return `
        <tr style="animation:mkSectionIn 0.3s ease both;animation-delay:${ri*0.03}s" class="hover:bg-sky-50">
            <td class="px-2 py-3" style="width:32px;">
              <input type="checkbox" class="inv-bulk-cb" data-id="${pid}"
                style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;"
                onchange="invBulkToggle(this)">
            </td>
            <td class="px-4 py-3">${imgHTML}</td>
            <td class="px-4 py-3">
                <div>
                    <span class="font-semibold text-gray-800" style="font-size:.9rem;">${_esc(product.name)}</span>
                    <span style="font-size:10px;background:#e0f2fe;color:#0369a1;padding:1px 8px;border-radius:99px;margin-left:4px;font-weight:700;border:1px solid #bae6fd;">Variable</span>
                    ${product.rendimientoPorHoja ? `<div style="font-size:10px;color:#6b7280;margin-top:2px;">🗒️ ${product.rendimientoPorHoja} uds/hoja · ${nMps} MP${nMps!==1?'s':''}</div>` : (nMps > 0 ? `<div style="font-size:10px;color:#6b7280;margin-top:2px;">${nMps} MP${nMps!==1?'s':''}</div>` : '')}
                    ${product.notas ? `<div class="text-xs text-gray-400 truncate" style="max-width:160px;" title="${_esc(product.notas)}">${_esc(product.notas)}</div>` : ''}
                    ${product.tags && product.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">${product.tags.map(t=>`<span style="padding:1px 6px;border-radius:99px;font-size:10px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">${_esc(t)}</span>`).join('')}</div>` : ''}
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs inv-col-hidden-sku">${_esc(product.sku||'—')}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${_esc(catName)}</td>
            <td class="px-4 py-3"><div style="display:flex;flex-wrap:wrap;gap:3px;">${tablaHTML}</div></td>
            <td class="px-4 py-3 text-right">${precioCell}</td>
            <td class="px-4 py-3">${stockCell}</td>
            <td class="px-4 py-3">${badgeCell}</td>
            <td class="px-4 py-3">${margenHTML}</td>
            <td class="px-2 py-3">
                <div style="display:flex;gap:3px;flex-wrap:wrap;">
                    <button type="button" onclick="editProduct('${pid}')" title="Editar" aria-label="Editar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(59,130,246,0.2);background:rgba(59,130,246,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">✏️</button>
                    <button type="button" onclick="duplicarProducto('${pid}')" title="Duplicar" aria-label="Duplicar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(150,105,196,0.2);background:rgba(150,105,196,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">📋</button>
                    <button type="button" onclick="deleteProduct('${pid}')" title="Eliminar" aria-label="Eliminar servicio"
                        style="width:28px;height:28px;border-radius:7px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;">🗑️</button>
                </div>
            </td>
        </tr>`;
    }

    // ── Construir HTML de cada sección ────────────────────────────────────────
    function buildSection({ id, title, titleColor, titleBg, btnLabel, btnOnclick, btnColor, extraBtnHTML, products: list, renderFila, headers, emptyMsg }) {
        // Filtro por tipo: ocultar sección si no corresponde al tipo seleccionado
        const _tipoFiltro = (document.getElementById('inventoryTipoFilter') as HTMLSelectElement|null)?.value || '';
        if (_tipoFiltro === 'materia' && id !== 'mp') return '';
        if (_tipoFiltro === 'producto' && id === 'mp') return '';
        // Si la lista está vacía y hay búsqueda activa, colapsar sección
        const _searchActive = (document.getElementById('inventorySearch')?.value?.trim() || '').length > 0;
        if (list.length === 0 && _searchActive) return '';

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

        const headersHTML = headers.map(h => {
            const cls = h.colId === 'sku' ? ' inv-col-hidden-sku' : h.colId === 'proveedor' ? ' inv-col-hidden-prov' : '';
            const alignCls = h.align === 'right' ? ' text-right' : ' text-left';
            return h.sortKey
                ? `<th class="px-4 py-3${alignCls} text-xs font-semibold text-gray-500 uppercase tracking-wide sortable-th cursor-pointer select-none${cls}" onclick="sortInventory('${h.sortKey}')" style="white-space:nowrap;">${h.label} ↕</th>`
                : `<th class="px-4 py-3${alignCls} text-xs font-semibold text-gray-500 uppercase tracking-wide${cls}" style="white-space:nowrap;">${h.label}</th>`;
        }).join('');

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
                        return `<button onclick="invSectionPage('${id}',${p2})" style="min-width:30px;padding:4px 8px;border:1px solid ${p2===page?'#FFD166':'#e5e7eb'};border-radius:7px;background:${p2===page?'#FFD166':'#fff'};color:${p2===page?'#fff':'#374151'};font-weight:${p2===page?700:400};font-size:13px;cursor:${p2===page?'default':'pointer'};" ${p2===page?'disabled':''}>${p2}</button>`;
                    }).join('')}
                    <button onclick="invSectionPage('${id}',${page+1})" ${page>=totalPgs?'disabled':''} style="padding:4px 10px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:${page>=totalPgs?'default':'pointer'};opacity:${page>=totalPgs?0.4:1};font-size:13px;">›</button>
                </div>
            </div>`;
        }

        // I4: estado de colapso por sección, persiste en memory
        const _colKey = `_invSec_${id}_collapsed`;
        const _collapsed = (window as any)[_colKey] === true;
        return `
        <div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1.5px solid ${titleColor}33;box-shadow:0 2px 12px ${titleColor}11;">
            <!-- Header de sección (clicable para colapsar) -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:${titleBg};border-bottom:${_collapsed?'none':'1.5px solid '+titleColor+'33'};cursor:pointer;" onclick="(()=>{const k='_invSec_${id}_collapsed';window[k]=!window[k];renderInventoryTable()})()">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:.85rem;color:${titleColor};transition:transform .2s;">${_collapsed?'▶':'▼'}</span>
                    <span style="font-size:1.1rem;font-weight:800;color:${titleColor};">${title}</span>
                    <span style="background:${titleColor};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;">${total}</span>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;" onclick="event.stopPropagation()">
                    ${extraBtnHTML || ''}
                    <button onclick="${btnOnclick}" class="mk-btn-primary"
                        style="padding:7px 16px;border:none;border-radius:10px;font-size:.8rem;font-weight:700;cursor:pointer;">
                        ${btnLabel}
                    </button>
                </div>
            </div>
            ${_collapsed ? '' : `
            <!-- Tabla -->
            <div style="overflow-x:auto;background:#fff;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead style="background:#fafafa;">
                        <tr>${headersHTML}</tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
            ${pagHTML}`}
        </div>`;
    }

    // ── KPI Bar ────────────────────────────────────────────────────────────────
    const activeProds = allProducts.filter(p => !p.deletedAt);
    const totalProductos = activeProds.length;
    const valorInventario = activeProds.reduce((s, p) => {
        const stk = _stockCache.get(String(p.id)) ?? (typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (parseInt(p.stock)||0));
        return s + (Number(p.cost)||0) * Math.max(0, stk);
    }, 0);
    const bajoStock = activeProds.filter(p => {
        const stk = _stockCache.get(String(p.id)) ?? (typeof getStockEfectivo === 'function' ? getStockEfectivo(p) : (parseInt(p.stock)||0));
        return stk <= (p.stockMin||5);
    }).length;
    const ptConPrecio = activeProds.filter(p => (!p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno' || p.tipo === 'pack') && Number(p.price) > 0);
    const margenProm = ptConPrecio.length
        ? ptConPrecio.reduce((s, p) => {
            const pr = Number(p.price)||0, co = Number(p.cost)||0;
            return s + (pr > 0 ? (pr - co) / pr * 100 : 0);
        }, 0) / ptConPrecio.length
        : 0;

    let kpiBar = document.getElementById('invKpiBar');
    if (!kpiBar) {
        kpiBar = document.createElement('div');
        kpiBar.id = 'invKpiBar';
        dualContainer.parentNode.insertBefore(kpiBar, dualContainer);
    }
    kpiBar.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:#374151;">${totalProductos}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Total productos</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.4rem;font-weight:800;color:#9669c4;">$${valorInventario.toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Valor inventario</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${bajoStock > 0 ? '#ef4444' : '#10b981'};">${bajoStock}</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Bajo stock / agotado</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 18px;box-shadow:0 1px 6px #0000000a;">
            <div style="font-size:1.6rem;font-weight:800;color:${margenProm >= 40 ? '#10b981' : margenProm >= 20 ? '#f59e0b' : '#ef4444'};">${margenProm.toFixed(1)}%</div>
            <div style="font-size:.72rem;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;">Margen promedio (PT)</div>
        </div>
    </div>`;

    // D27: render incremental — cada sección tiene su contenedor, solo se reescribe si cambió
    const _sectionDefs = [
        {
            id: 'pt',
            title: '📦 Productos Terminados',
            titleColor: '#FFD166',
            titleBg: 'linear-gradient(135deg,#fffbeb,#fef9f0)',
            btnLabel: '+ Producto',
            btnOnclick: 'openAddProductModal()',
            extraBtnHTML: `<button type="button" onclick="injectPackModal();openPackModal()" class="mk-toolbar-btn">🎁 Crear Pack</button><button type="button" onclick="abrirBulkPrecioModal()" class="mk-toolbar-btn">📊 Actualizar precios</button>`,
            products: pts,
            renderFila: renderFilaPT,
            headers: [
                {label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">', sortKey: null},
                {label:''},
                {label:'Producto', sortKey:'name'},
                {label:'SKU', sortKey:'sku', colId:'sku'},
                {label:'Categoría', sortKey:'category'},
                {label:'Variantes'},
                {label:'Precio', sortKey:'price', align:'right'},
                {label:'Disponible'},
                {label:'Estado'},
                {label:'Margen', sortKey:'margin'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin productos terminados. Agrega uno con el botón +'
        },
        {
            id: 'pv',
            title: '🎯 Productos Variables (Stickers, Tarjetas...)',
            titleColor: '#0369a1',
            titleBg: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
            btnLabel: '+ Producto Variable',
            btnOnclick: 'injectVariableProductModal();openVariableProductModal()',
            products: pvs,
            renderFila: renderFilaVariable,
            headers: [
                {label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">', sortKey: null},
                {label:''},
                {label:'Nombre', sortKey:'name'},
                {label:'SKU', sortKey:'sku', colId:'sku'},
                {label:'Categoría', sortKey:'category'},
                {label:'Tabla de precios'},
                {label:'Precio/pza', sortKey:'price', align:'right'},
                {label:'Disponible'},
                {label:'Estado'},
                {label:'Margen', sortKey:'margen'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin productos variables. Agrega stickers, tarjetas u otros con precio por cantidad.'
        },
        {
            id: 'mp',
            title: '🏭 Materias Primas',
            titleColor: '#9669c4',
            titleBg: 'linear-gradient(135deg,#faf5ff,#f5f3ff)',
            btnLabel: '+ Materia Prima',
            btnOnclick: 'injectMpModal();openAddMateriaPrimaModal()',
            extraBtnHTML: `<button type="button" onclick="abrirBulkStockModal()" class="mk-toolbar-btn">📦 Ajustar stock masivo</button>`,
            products: mps,
            renderFila: renderFilaMP,
            headers: [
                {label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">', sortKey: null},
                {label:''},
                {label:'Nombre', sortKey:'name'},
                {label:'SKU', sortKey:'sku', colId:'sku'},
                {label:'Categoría', sortKey:'category'},
                {label:'Costo', align:'right'},
                {label:'Proveedor', colId:'proveedor'},
                {label:'Stock', sortKey:'stock'},
                {label:'Estado'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin materias primas. Agrega una con el botón +'
        },
        {
            id: 'svc',
            title: '⚙️ Servicios y Consumibles',
            titleColor: '#6d28d9',
            titleBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
            btnLabel: '+ Nuevo Servicio',
            btnOnclick: 'injectSvcModal();openServicioModal()',
            products: svcs,
            renderFila: renderFilaServicio,
            headers: [
                {label:'<input type="checkbox" class="inv-bulk-all" onchange="invBulkToggleAll(this)" style="width:16px;height:16px;cursor:pointer;accent-color:#9669c4;">', sortKey: null},
                {label:''},
                {label:'Nombre', sortKey:'name'},
                {label:'SKU', sortKey:'sku', colId:'sku'},
                {label:'Costo/uso', align:'right'},
                {label:'Estado'},
                {label:'Acciones'},
            ],
            emptyMsg: 'Sin servicios. Agrega el uso del láser, vinil por pieza, etc.'
        }
    ];

    const _searchActiveNow = (q || tagQ || provQ).length > 0;
    let _anyVisible = false;

    for (const secDef of _sectionDefs) {
        const html = buildSection(secDef);
        if (html) _anyVisible = true;

        let secEl = document.getElementById(`invSec_${secDef.id}`);
        if (!secEl) {
            secEl = document.createElement('div');
            secEl.id = `invSec_${secDef.id}`;
            dualContainer.appendChild(secEl);
        }

        const secHash = secDef.products.length + '_' + secDef.products.reduce((s, p) => s + String(p.id), '') + '_' + (window[`_invPage_${secDef.id}`] || 1) + '_' + (window._invSortCol || '') + (window._invSortDir || '') + '_' + _tipoQ;
        if ((secEl as any)._hash !== secHash) {
            secEl.innerHTML = html;
            (secEl as any)._hash = secHash;
        }
    }

    // Limpiar contenedores sobrantes de secciones removidas
    const validIds = new Set(_sectionDefs.map(s => `invSec_${s.id}`));
    for (let i = dualContainer.children.length - 1; i >= 0; i--) {
        const child = dualContainer.children[i] as HTMLElement;
        if (child.id && child.id.startsWith('invSec_') && !validIds.has(child.id)) {
            child.remove();
        }
    }

    if (_searchActiveNow && !_anyVisible) {
        dualContainer.innerHTML = `
        <div style="padding:64px 24px;text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">🔍</div>
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:6px;">Sin resultados para tu búsqueda</p>
            <p style="font-size:.875rem;color:#9ca3af;margin-bottom:20px;">Intenta con otro término o limpia los filtros</p>
            <button onclick="(function(){var el=document.getElementById('inventorySearch');if(el){el.value='';el.dispatchEvent(new Event('input'));}var tEl=document.getElementById('inventoryTagFilter');if(tEl)tEl.value='';var pEl=document.getElementById('inventoryProveedorFilter');if(pEl)pEl.value='';renderInventoryTable();})()"
                class="mk-btn-primary" style="padding:10px 22px;">
                Limpiar búsqueda
            </button>
        </div>`;
    }
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
        : allProducts.filter(p => !p.tipo || p.tipo === 'producto' || p.tipo === 'producto_interno' || p.tipo === 'pack');
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
                style="min-width:34px;height:34px;border-radius:8px;border:1px solid ${active ? '#FFD166' : '#e5e7eb'};
                       background:${active ? '#FFD166' : 'white'};color:${active ? 'white' : '#374151'};
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

// I2: menú "···" para acciones secundarias en fila de materia prima
function _invMpMenu(btn: HTMLElement, pid: string, hasProvUrl: boolean, archivarLabel: string) {
    const _existing = document.getElementById('_invMpMenuDrop');
    if (_existing) { _existing.remove(); if (_existing.dataset.pid === pid) return; }
    const menu = document.createElement('div');
    menu.id = '_invMpMenuDrop';
    menu.dataset.pid = pid;
    menu.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:172px;overflow:hidden;font-size:.78rem;';
    const _btnStyle = (color: string, bg: string) => `style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:${color};text-align:left;" onmouseover="this.style.background='${bg}'" onmouseout="this.style.background='none'"`;
    menu.innerHTML = `
        <button onclick="registrarMerma('${pid}');document.getElementById('_invMpMenuDrop')?.remove()" ${_btnStyle('#d97706','#fffbeb')}>📉 Registrar merma</button>
        <button onclick="duplicarProducto('${pid}');document.getElementById('_invMpMenuDrop')?.remove()" ${_btnStyle('#9669c4','#f5f3ff')}>📋 Duplicar</button>
        <button onclick="cambiarTipoProducto('${pid}');document.getElementById('_invMpMenuDrop')?.remove()" ${_btnStyle('#b45309','#fef9c3')}>→📦 Convertir a PT</button>
        <button onclick="abrirMovimientoProducto('${pid}');document.getElementById('_invMpMenuDrop')?.remove()" ${_btnStyle('#4338ca','#eef2ff')}>📈 Ver gráfica</button>
        ${hasProvUrl ? `<button onclick="(()=>{const p=(window.products||[]).find(x=>String(x.id)==='${pid}');if(p?.proveedorUrl)window.open(p.proveedorUrl,'_blank');document.getElementById('_invMpMenuDrop')?.remove()})()" ${_btnStyle('#16a34a','#f0fdf4')}>🔗 Abrir proveedor</button>` : ''}
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button onclick="archivarProducto('${pid}');document.getElementById('_invMpMenuDrop')?.remove()" ${_btnStyle('#6b7280','#f9fafb')}>📁 ${archivarLabel==='desarchivar'?'Desarchivar':'Archivar'}</button>
        <button onclick="deleteProduct('${pid}');document.getElementById('_invMpMenuDrop')?.remove()" ${_btnStyle('#dc2626','#fef2f2')}>🗑️ Eliminar</button>
    `;
    document.body.appendChild(menu);
    const rect = btn.getBoundingClientRect();
    menu.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    menu.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 180) + 'px';
    setTimeout(() => document.addEventListener('click', function _close(e) {
        if (!menu.contains(e.target as Node)) { menu.remove(); document.removeEventListener('click', _close); }
    }), 0);
}
(window as any)._invMpMenu = _invMpMenu;

// FIX P-1: Debounce para búsqueda de inventario (300ms) — reduce renders mientras el usuario escribe
let _inventorySearchTimer: ReturnType<typeof setTimeout> | null = null;
function _debounceInventorySearch(): void {
    if (_inventorySearchTimer) clearTimeout(_inventorySearchTimer);
    _inventorySearchTimer = setTimeout(renderInventoryTable, 300);
}
(window as any)._debounceInventorySearch = _debounceInventorySearch;

// ── Historial de movimientos: render ──────────────────────────────────────
function renderMovimientos() {
    const containerId = 'movimientosLista';
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = (document.getElementById('movBuscar')||{}).value?.trim().toLowerCase() || '';
    // B1: Filtro por tipo
    const tipoFiltro = (document.getElementById('movTipoFilter')||{}).value || '';

    let movs = window.stockMovements || [];
    if (q) movs = movs.filter(m => m.productoNombre?.toLowerCase().includes(q) || (m.motivo||'').toLowerCase().includes(q));
    if (tipoFiltro) movs = movs.filter(m => (m.tipo||'') === tipoFiltro);

    // B3: Resumen visual por tipo — sólo movimientos de hoy
    const hoy = _fechaHoy();
    const movsHoy = (window.stockMovements || []).filter(m => {
        try { const f=new Date(m.fecha); return f.getFullYear()+'-'+('0'+(f.getMonth()+1)).slice(-2)+'-'+('0'+f.getDate()).slice(-2) === hoy; } catch(e) { return false; }
    });
    const resumenTipos = {};
    movsHoy.forEach(m => { resumenTipos[m.tipo] = (resumenTipos[m.tipo] || 0) + 1; });
    const tipoIconos = { entrada:'🟢', salida:'🔴', ajuste:'🟡', creacion:'🔵', venta:'🟠', merma:'🟤' };
    const tipoLabels = { entrada:'Entradas', salida:'Salidas', ajuste:'Ajustes', creacion:'Creaciones', venta:'Ventas', merma:'Mermas' };

    // Inyectar resumen arriba del contenedor (buscar o crear elemento)
    let resumenEl = document.getElementById('movResumenHoy');
    if (!resumenEl) {
        resumenEl = document.createElement('div');
        resumenEl.id = 'movResumenHoy';
        container.parentNode.insertBefore(resumenEl, container);
    }
    const resumenParts = Object.keys(resumenTipos).map(t =>
        `${tipoIconos[t]||'⚪'} ${tipoLabels[t]||t}: <strong>${resumenTipos[t]}</strong>`
    );
    resumenEl.innerHTML = resumenParts.length
        ? `<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:.75rem;color:#374151;margin-bottom:8px;">
            <span style="font-weight:700;color:#6b7280;margin-right:8px;">Hoy:</span>${resumenParts.join('&nbsp;&nbsp;')}
           </div>`
        : '';

    // B2: Botón exportar CSV (inyectar una sola vez)
    let exportBtn = document.getElementById('movExportCSVBtn');
    if (!exportBtn) {
        exportBtn = document.createElement('button');
        exportBtn.id = 'movExportCSVBtn';
        exportBtn.textContent = '📥 Exportar historial CSV';
        exportBtn.style.cssText = 'background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:.78rem;font-weight:700;cursor:pointer;margin-bottom:10px;';
        exportBtn.onclick = function() {
            const allMovs = window.stockMovements || [];
            const headers = ['Fecha','Producto','Tipo','Cantidad','Motivo','Stock antes','Stock después'];
            let csv = headers.join(',') + '\n';
            allMovs.forEach(m => {
                const row = [
                    new Date(m.fecha).toLocaleString('es-MX'),
                    m.productoNombre||'',
                    m.tipo||'',
                    m.cantidad,
                    m.motivo||'',
                    m.stockAntes ?? '',
                    m.stockDespues ?? ''
                ];
                csv += row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',') + '\n';
            });
            const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `movimientos-${hoy}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        };
        container.parentNode.insertBefore(exportBtn, container);
    }

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
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(m.productoNombre || (m.productoId && !(window.products||[]).find((x:any)=>String(x.id)===String(m.productoId)) ? '(producto eliminado)' : '—'))}</div>
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
    showConfirm('Se borrará permanentemente todo el historial de movimientos de inventario.', '¿Borrar historial?').then(ok => {
        if (!ok) return;
        window.stockMovements = [];
        window.stockMovimientos = [];
        saveStockMovements();
        if (typeof db !== 'undefined' && db) {
            (db as any).from('stock_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000').then(({ error }: any) => {
                if (error) console.warn('[Inv] Error limpiando stock_movements relacional:', error.message);
            });
        }
        renderMovimientos();
    });
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
                <div style="font-weight:600;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(m.productoNombre || (m.productoId && !(window.products||[]).find((x:any)=>String(x.id)===String(m.productoId)) ? '(producto eliminado)' : '—'))}</div>
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

// ── Bulk Operations ────────────────────────────────────────────────────────
function invBulkToggle(cb) {
  invUpdateBulkBar();
}
window.invBulkToggle = invBulkToggle;

function invBulkToggleAll(masterCb) {
  const cbs = document.querySelectorAll('.inv-bulk-cb');
  cbs.forEach(cb => { cb.checked = masterCb.checked; });
  invUpdateBulkBar();
}
window.invBulkToggleAll = invBulkToggleAll;

function invGetSelectedIds() {
  return [...document.querySelectorAll('.inv-bulk-cb:checked')].map(cb => cb.dataset.id);
}
window.invGetSelectedIds = invGetSelectedIds;

function invUpdateBulkBar() {
  const ids = invGetSelectedIds();
  let bar = document.getElementById('invBulkBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'invBulkBar';
    bar.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:500;background:#1a0533;color:white;border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all .2s;';
    document.body.appendChild(bar);
  }
  if (ids.length === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  bar.innerHTML = `
    <span style="font-weight:700;font-size:.9rem;">${ids.length} seleccionado${ids.length>1?'s':''}</span>
    <button onclick="invBulkExportar()" style="padding:6px 14px;border-radius:10px;border:none;background:#9669c4;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">📥 Exportar</button>
    <button onclick="invBulkCambiarCategoria()" style="padding:6px 14px;border-radius:10px;border:none;background:#0369a1;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">📁 Categoría</button>
    <button onclick="invBulkEliminar()" style="padding:6px 14px;border-radius:10px;border:none;background:#dc2626;color:white;font-size:.8rem;font-weight:700;cursor:pointer;">🗑 Eliminar</button>
    <button onclick="invBulkDesseleccionar()" style="padding:6px 14px;border-radius:10px;border:none;background:rgba(255,255,255,0.15);color:white;font-size:.8rem;cursor:pointer;">✕ Cancelar</button>
  `;
}
window.invUpdateBulkBar = invUpdateBulkBar;

function invBulkDesseleccionar() {
  document.querySelectorAll('.inv-bulk-cb, .inv-bulk-all').forEach(cb => cb.checked = false);
  invUpdateBulkBar();
}
window.invBulkDesseleccionar = invBulkDesseleccionar;

async function invBulkEliminar() {
  const ids = invGetSelectedIds();
  if (!ids.length) return;
  // Verificar pedidos activos que usen estos productos
  const _pedAfectados = (window.pedidos||[]).filter(ped =>
      !['cancelado','finalizado'].includes(ped.status||'') &&
      (ped.productosInventario||[]).some(item => ids.includes(String(item.id)))
  );
  if (_pedAfectados.length > 0) {
      const _folios = _pedAfectados.map(p => p.folio||p.id).slice(0,5).join(', ');
      const _okPed = typeof showConfirm === 'function'
          ? await showConfirm(`⚠️ ${_pedAfectados.length} pedido(s) activo(s) usan estos productos (${_folios}). ¿Eliminar de todas formas?`, 'Productos en pedidos activos')
          : confirm(`⚠️ ${_pedAfectados.length} pedido(s) activo(s) usan estos productos (${_folios}). ¿Eliminar de todas formas?`);
      if (!_okPed) return;
  }
  const _okDel = typeof showConfirm === 'function'
      ? await showConfirm(`¿Eliminar ${ids.length} producto(s)? Esta acción no se puede deshacer.`, '🗑 Confirmar eliminación')
      : confirm(`¿Eliminar ${ids.length} producto(s)? Esta acción no se puede deshacer.`);
  if (!_okDel) return;
  // FIX-3: capturar IDs antes de filtrar para poder usarlos en Supabase
  const idsAEliminar = [...ids];
  window.products = (window.products||[]).filter(p => !idsAEliminar.includes(String(p.id)));
  saveProducts();
  renderInventoryTable();
  invUpdateBulkBar();
  // FIX-3: Eliminar de tabla relacional Supabase para que no aparezcan en la web store
  if (typeof db !== 'undefined' && db) {
      try {
          await db.from('products').delete().in('id', idsAEliminar);
      } catch(e) {
          console.warn('[BulkEliminar] Error al eliminar de Supabase relacional:', e);
      }
  }
  manekiToastExport(`🗑 ${idsAEliminar.length} producto(s) eliminados`, 'ok');
}
window.invBulkEliminar = invBulkEliminar;

function invBulkExportar() {
  const ids = invGetSelectedIds();
  const selected = (window.products||[]).filter(p => ids.includes(String(p.id)));
  const headers = 'tipo,nombre,sku,costo,precio,stock,stock_min,proveedor,notas';
  const rows = selected.map(p => [
    p.tipo||'pt', p.name, p.sku||'', p.cost||0, p.price||0, p.stock||0, p.stockMin||5, p.proveedor||'', p.notas||''
  ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  const csv = '\ufeff' + headers + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'inventario_seleccion.csv'; a.click();
  URL.revokeObjectURL(url);
  manekiToastExport(`📥 ${selected.length} productos exportados`, 'ok');
}
window.invBulkExportar = invBulkExportar;

async function invBulkCambiarCategoria() {
  const ids = invGetSelectedIds();
  if (!ids.length) return;
  // A8/B9: modal con select de categorías en vez de prompt con IDs en texto plano
  const catId = await new Promise<string|null>(resolve => {
      const prev = document.getElementById('mkBatchCatModal');
      if (prev) prev.remove();
      const cats = (window.categories || []) as any[];
      const opts = cats.map(c => `<option value="${c.id}">${c.emoji||''} ${c.name}</option>`).join('');
      const modal = document.createElement('div');
      modal.id = 'mkBatchCatModal';
      modal.className = 'mk-modal-overlay';
      modal.innerHTML = `<div class="mk-modal-box" style="max-width:360px">
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:14px;">📁 Cambiar categoría en lote</h3>
          <p style="font-size:.8rem;color:#6b7280;margin-bottom:10px;">${ids.length} producto(s) seleccionado(s)</p>
          <select id="mkBatchCatSel" class="mk-input w-full mb-4">
              <option value="">Seleccionar categoría...</option>
              ${opts}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" class="mk-toolbar-btn" onclick="document.getElementById('mkBatchCatModal').remove();window._mkBCR(null)">Cancelar</button>
              <button type="button" class="mk-btn-primary" onclick="window._mkBCR((document.getElementById('mkBatchCatSel') as HTMLSelectElement).value||null)">Aplicar</button>
          </div>
      </div>`;
      (window as any)._mkBCR = (v: string|null) => { modal.remove(); resolve(v); };
      document.body.appendChild(modal);
      setTimeout(() => (document.getElementById('mkBatchCatSel') as HTMLSelectElement)?.focus(), 50);
  });
  if (!catId) return;
  const cat = (window.categories||[]).find((c: any) => String(c.id) === String(catId));
  if (!cat) { manekiToastExport('Categoría no encontrada', 'warn'); return; }
  (window.products||[]).forEach(p => { if (ids.includes(String(p.id))) p.category = cat.id; });
  saveProducts();
  renderInventoryTable();
  manekiToastExport(`📁 Categoría actualizada en ${ids.length} producto(s)`, 'ok');
}
window.invBulkCambiarCategoria = invBulkCambiarCategoria;

// ══════════════════════════════════════════════════════════════════════════
// Op2/Op4 — Mejoras tabla inventario: contador, chips de filtro activo,
// segmented control de tipo, toggle de densidad y fila resumen sticky.
// Implementado como wrapper post-render para no tocar los 4 renderizadores.
// ══════════════════════════════════════════════════════════════════════════
const _MK_TIPO_LABELS: Record<string,string> = { '': 'Todos', producto: 'Productos', materia: 'Materia Prima' };

(window as any)._mkInvSetTipo = function(v: string) {
  const s = document.getElementById('inventoryTipoFilter') as HTMLSelectElement | null;
  if (s) { s.value = v; s.dispatchEvent(new Event('change')); }
};
(window as any)._mkInvClearOne = function(which: string) {
  const el = document.getElementById(which) as HTMLInputElement | HTMLSelectElement | null;
  if (!el) return;
  el.value = '';
  el.dispatchEvent(new Event(which === 'inventorySearch' ? 'input' : 'change'));
};
(window as any)._mkInvClearFilters = function() {
  ['inventoryTagFilter','inventoryProveedorFilter','inventoryTipoFilter'].forEach(id => {
    const e = document.getElementById(id) as HTMLSelectElement | null; if (e) e.value = '';
  });
  const s = document.getElementById('inventorySearch') as HTMLInputElement | null;
  if (s) { s.value = ''; s.dispatchEvent(new Event('input')); }
  else if (typeof renderInventoryTable === 'function') renderInventoryTable();
};

function _mkInvSyncSeg() {
  const s = document.getElementById('inventoryTipoFilter') as HTMLSelectElement | null;
  const seg = document.getElementById('mkInvTipoSeg');
  if (!s || !seg) return;
  seg.querySelectorAll('button').forEach((b: any) => b.classList.toggle('active', b.dataset.v === s.value));
}

function _mkInvToolbarOnce() {
  const tipoSel = document.getElementById('inventoryTipoFilter') as HTMLSelectElement | null;
  const toolbar = tipoSel?.parentElement as HTMLElement | null;
  if (!tipoSel || !toolbar) return;

  // (a) Segmented control de tipo (oculta el <select>, lo conserva como fuente de verdad)
  if (!document.getElementById('mkInvTipoSeg')) {
    tipoSel.style.display = 'none';
    const seg = document.createElement('div');
    seg.id = 'mkInvTipoSeg';
    seg.className = 'mk-segmented';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Tipo de producto');
    seg.innerHTML = [...tipoSel.options].map(o => {
      const label = _MK_TIPO_LABELS[o.value] ?? (o.textContent || '').replace(/^[^\p{L}]+/u, '').trim();
      return `<button type="button" data-v="${o.value}" onclick="_mkInvSetTipo('${o.value}')">${label}</button>`;
    }).join('');
    tipoSel.parentElement!.insertBefore(seg, tipoSel);
  }

  // (b) Toggle de densidad Cómodo/Compacto
  if (!document.getElementById('mkInvDensity') && typeof (window as any).mkRenderDensityToggle === 'function') {
    const wrap = document.createElement('span');
    wrap.id = 'mkInvDensity';
    wrap.style.marginLeft = 'auto';
    wrap.innerHTML = (window as any).mkRenderDensityToggle();
    toolbar.appendChild(wrap);
    if (typeof (window as any).mkAplicarDensidad === 'function') (window as any).mkAplicarDensidad();
  }

  // (c) Contenedor de contador + chips (debajo de la toolbar)
  if (!document.getElementById('mkInvFilterInfo')) {
    const info = document.createElement('div');
    info.id = 'mkInvFilterInfo';
    info.style.cssText = 'display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:-2px 0 12px;';
    toolbar.parentElement!.insertBefore(info, toolbar.nextSibling);
  }
  // (d) Botones de herramientas avanzadas de inventario
  if (!document.getElementById('mkInvHerramientas')) {
    const btnRow = document.createElement('div');
    btnRow.id = 'mkInvHerramientas';
    btnRow.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;';
    btnRow.innerHTML = `
      <button type="button" onclick="abrirConteoFisico()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Conteo físico de inventario"><i class="fas fa-clipboard-check" style="margin-right:5px;"></i>Conteo físico</button>
      <button type="button" onclick="abrirReabastecimiento()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Lista de reabastecimiento por proveedor"><i class="fas fa-truck" style="margin-right:5px;"></i>Reabastecimiento</button>
      <button type="button" onclick="mostrarDonutCategoria()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Valor de inventario por categoría"><i class="fas fa-chart-pie" style="margin-right:5px;"></i>Por categoría</button>
      <button type="button" onclick="sugerirStockMinimo()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Sugerir stock mínimo automático desde pedidos"><i class="fas fa-robot" style="margin-right:5px;"></i>Stock mínimo</button>
      <button type="button" onclick="abrirTendenciaInventario()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Gráfica de tendencia del valor de inventario"><i class="fas fa-chart-line" style="margin-right:5px;"></i>Tendencia</button>
      <button type="button" onclick="abrirMovimientosRecientes()" class="mk-toolbar-btn" style="font-size:.78rem;padding:4px 10px;" title="Ver últimos movimientos de inventario"><i class="fas fa-history" style="margin-right:5px;"></i>Movimientos recientes</button>
    `;
    const filterInfo = document.getElementById('mkInvFilterInfo');
    if (filterInfo) filterInfo.parentElement!.insertBefore(btnRow, filterInfo);
    else toolbar.parentElement!.insertBefore(btnRow, toolbar.nextSibling);
  }
}

function _mkInvCounterChips() {
  const info = document.getElementById('mkInvFilterInfo');
  if (!info) return;
  const dual = document.getElementById('invDualContainer');
  const shown = dual ? dual.querySelectorAll('.inv-bulk-cb').length : 0;
  const total = (window.products || []).length;

  const search = document.getElementById('inventorySearch') as HTMLInputElement | null;
  const tag    = document.getElementById('inventoryTagFilter') as HTMLSelectElement | null;
  const prov   = document.getElementById('inventoryProveedorFilter') as HTMLSelectElement | null;
  const tipo   = document.getElementById('inventoryTipoFilter') as HTMLSelectElement | null;

  const chips: string[] = [];
  if (search && search.value.trim())
    chips.push(`<span class="mk-filter-chip">Buscar: ${_esc(search.value.trim())}<button data-tip="Quitar" onclick="_mkInvClearOne('inventorySearch')">✕</button></span>`);
  if (tipo && tipo.value)
    chips.push(`<span class="mk-filter-chip">Tipo: ${_esc(_MK_TIPO_LABELS[tipo.value] || tipo.value)}<button data-tip="Quitar" onclick="_mkInvSetTipo('')">✕</button></span>`);
  if (tag && tag.value)
    chips.push(`<span class="mk-filter-chip">Tag: ${_esc(tag.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryTagFilter')">✕</button></span>`);
  if (prov && prov.value)
    chips.push(`<span class="mk-filter-chip">Proveedor: ${_esc(prov.options[prov.selectedIndex]?.text || prov.value)}<button data-tip="Quitar" onclick="_mkInvClearOne('inventoryProveedorFilter')">✕</button></span>`);

  let html = `<span class="mk-result-count">Mostrando <b>${shown}</b> de ${total} producto${total !== 1 ? 's' : ''}</span>`;
  if (chips.length)
    html += `<div class="mk-filter-chips">${chips.join('')}<button class="mk-filter-clear" onclick="_mkInvClearFilters()">Limpiar todo</button></div>`;
  info.innerHTML = html;
  _mkInvSyncSeg();
}

function _mkInvSummaryRow() {
  const dual = document.getElementById('invDualContainer');
  if (!dual || !dual.parentElement) return;
  const ids = new Set([...dual.querySelectorAll('.inv-bulk-cb')].map((cb: any) => String(cb.dataset.id)));
  const stockCache: Map<string, number> | undefined = (window as any)._invStockCache;
  let valor = 0, low = 0, n = 0;
  (window.products || []).forEach((p: any) => {
    if (!ids.has(String(p.id))) return;
    n++;
    const st = stockCache?.get(String(p.id)) ?? (Number(p.stock) || 0);
    valor += (Number(p.cost) || 0) * Math.max(0, st);
    if (st <= (Number(p.stockMin) || 5)) low++;
  });
  let sum = document.getElementById('mkInvSummary');
  if (n === 0) { if (sum) sum.remove(); return; }
  if (!sum) {
    sum = document.createElement('div');
    sum.id = 'mkInvSummary';
    sum.className = 'mk-table-summary';
    sum.style.cssText = 'display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:10px 18px;border-radius:0 0 14px 14px;margin-top:-2px;';
    dual.parentElement.insertBefore(sum, dual.nextSibling);
  }
  sum.innerHTML =
    `<span>Valor en costo: <b>$${valor.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</b></span>` +
    `<span style="color:var(--tx-muted);">${n} producto${n !== 1 ? 's' : ''}</span>` +
    (low > 0 ? `<span style="color:#dc2626;font-weight:800;">⚠ ${low} bajo stock</span>` : `<span style="color:#059669;font-weight:700;">✓ stock saludable</span>`);
}

// Envolver renderInventoryTable para ejecutar las mejoras tras cada render
(function _mkWrapRenderInventory() {
  const orig = (window as any).renderInventoryTable;
  if (typeof orig !== 'function' || (orig as any)._mkWrapped) return;
  const wrapped = function(this: any, ...args: any[]) {
    const r = orig.apply(this, args);
    try { _mkInvToolbarOnce(); _mkInvCounterChips(); _mkInvSummaryRow(); } catch (e) { /* nunca romper el render */ }
    return r;
  };
  (wrapped as any)._mkWrapped = true;
  (window as any).renderInventoryTable = wrapped;
})();

// ══════════════════════════════════════════════════════
// HERRAMIENTAS AVANZADAS DE INVENTARIO
// ══════════════════════════════════════════════════════

// Helper: abrir/cerrar modal inline
function _mkInvModal(id: string, titulo: string, contenidoHtml: string, ancho = '700px') {
  let ov = document.getElementById(id + '_ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = id + '_ov';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div style="background:white;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.2);width:100%;max-width:${ancho};max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <h3 style="margin:0;font-size:1.1rem;font-weight:800;color:#1f2937;">${titulo}</h3>
        <button onclick="document.getElementById('${id}_ov').remove()" style="border:none;background:none;font-size:1.4rem;cursor:pointer;color:#9ca3af;line-height:1;">✕</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;flex:1;">${contenidoHtml}</div>
    </div>`;
  ov.onclick = (e: MouseEvent) => { if (e.target === ov) ov!.remove(); };
  ov.style.display = 'flex';
}

// ── 1. Conteo físico ─────────────────────────────────
function abrirConteoFisico() {
  const prods = (window.products || []).filter((p: any) => p.tipo !== 'servicio' && p.activo !== false);
  if (!prods.length) { if (typeof manekiToastExport==='function') manekiToastExport('Sin productos para contar','warn'); return; }
  const _e = _esc;
  const filas = prods.map((p: any, i: number) => {
    const st = typeof getStockEfectivo==='function' ? getStockEfectivo(p) : (Number(p.stock)||0);
    return `<tr style="${i%2?'background:#f9fafb':''}">
      <td style="padding:7px 10px;font-weight:600;font-size:.85rem;">${_e(p.name)}</td>
      <td style="padding:7px 10px;text-align:center;color:#6b7280;font-size:.82rem;">${_e(p.category||'—')}</td>
      <td style="padding:7px 10px;text-align:center;font-weight:700;">${st}</td>
      <td style="padding:7px 10px;text-align:center;">
        <input type="number" min="0" value="${st}" data-pid="${_e(p.id)}" data-sistema="${st}"
          style="width:70px;border:1.5px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:.85rem;text-align:center;outline:none;"
          onfocus="this.style.borderColor='#FFD166'" onblur="this.style.borderColor='#e5e7eb'" class="conteo-input">
      </td>
    </tr>`;
  }).join('');
  const html = `
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Ingresa las cantidades físicas. Solo se ajustan los productos donde el conteo difiere del sistema.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f9fafb;">
        <th style="padding:8px 10px;text-align:left;font-size:.78rem;color:#6b7280;font-weight:700;">Producto</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Categoría</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Sistema</th>
        <th style="padding:8px 10px;text-align:center;font-size:.78rem;color:#6b7280;font-weight:700;">Conteo físico</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkConteo_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarConteoFisico()" class="mk-btn-primary" style="padding:9px 24px;">✅ Aplicar ajustes</button>
    </div>`;
  _mkInvModal('mkConteo', '📋 Conteo Físico de Inventario', html, '780px');
}
(window as any).abrirConteoFisico = abrirConteoFisico;

(window as any)._mkAplicarConteoFisico = function() {
  const inputs = document.querySelectorAll('#mkConteo_ov .conteo-input');
  let ajustes = 0;
  inputs.forEach((inp: any) => {
    const pid = inp.dataset.pid;
    const sistema = Number(inp.dataset.sistema);
    const conteo = Number(inp.value);
    if (isNaN(conteo) || conteo === sistema) return;
    const prod = (window.products || []).find((p: any) => String(p.id) === String(pid));
    if (!prod) return;
    const diff = conteo - sistema;
    prod.stock = conteo;
    if (typeof registrarMovimiento === 'function') {
      registrarMovimiento({ productoId: prod.id, productoNombre: prod.name, tipo: diff > 0 ? 'entrada_manual' : 'salida_manual', cantidad: Math.abs(diff), motivo: 'Conteo físico', stockAntes: sistema, stockDespues: conteo });
    }
    ajustes++;
  });
  if (ajustes === 0) { if (typeof manekiToastExport==='function') manekiToastExport('Sin diferencias que ajustar','warn'); return; }
  if (typeof saveProducts==='function') saveProducts();
  if (typeof renderInventoryTable==='function') renderInventoryTable();
  document.getElementById('mkConteo_ov')?.remove();
  if (typeof manekiToastExport==='function') manekiToastExport(`✅ ${ajustes} ajuste${ajustes!==1?'s':''} aplicados`, 'ok');
};

// ── 2. Lista de reabastecimiento por proveedor ───────
function abrirReabastecimiento() {
  const bajos = (window.products || []).filter((p: any) => {
    if (p.tipo === 'servicio' || p.activo === false) return false;
    const st = typeof getStockEfectivo==='function' ? getStockEfectivo(p) : (Number(p.stock)||0);
    return st <= (Number(p.stockMin) || 5);
  });
  if (!bajos.length) { if (typeof manekiToastExport==='function') manekiToastExport('✅ Sin productos bajo stock mínimo','ok'); return; }
  const _e = _esc;
  // Agrupar por proveedor
  const grupos: Record<string, any[]> = {};
  bajos.forEach((p: any) => {
    const prov = p.proveedor || 'Sin proveedor';
    if (!grupos[prov]) grupos[prov] = [];
    grupos[prov].push(p);
  });
  const html = Object.entries(grupos).map(([prov, items]) => {
    const provEsc = _e(prov);
    const filas = items.map((p: any) => {
      const st = typeof getStockEfectivo==='function' ? getStockEfectivo(p) : (Number(p.stock)||0);
      const min = Number(p.stockMin)||5;
      const sugerido = Math.max(1, min * 2 - st);
      return `<tr><td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${_e(p.name)}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${st}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${min}</td>
        <td style="padding:6px 10px;text-align:center;font-size:.82rem;font-weight:700;color:#FFD166;">${sugerido}</td>
        <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${_e(p.unidad||'pza')}</td></tr>`;
    }).join('');
    const waTxt = encodeURIComponent(`Hola, necesito reabastecer:\n${items.map((p:any)=>{const st=Number(p.stock)||0;const min=Number(p.stockMin)||5;return `• ${p.name}: ${Math.max(1,min*2-st)} ${p.unidad||'pza'}`}).join('\n')}`);
    const waUrl = p?.proveedorUrl?.startsWith('http') ? p.proveedorUrl : `https://wa.me/?text=${waTxt}`;
    return `<div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
        <b style="font-size:.88rem;">${provEsc} (${items.length})</b>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/?text=${encodeURIComponent(`Hola, necesito reabastecer:\n${items.map((pr:any)=>`• ${pr.name}: ${Math.max(1,(Number(pr.stockMin)||5)*2-(typeof getStockEfectivo==='function'?getStockEfectivo(pr):Number(pr.stock)||0))} ${pr.unidad||'pza'}`).join('\n')}`)}" target="_blank"
            style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#25D366;color:white;text-decoration:none;font-weight:700;">📲 WA</a>
          <button onclick="_mkExportReabCSV('${provEsc}')" style="font-size:.75rem;padding:4px 10px;border-radius:8px;background:#10b981;color:white;border:none;cursor:pointer;font-weight:700;">📥 CSV</button>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="font-size:.75rem;color:#6b7280;">
          <th style="padding:6px 10px;text-align:left;">Producto</th>
          <th style="padding:6px 10px;text-align:center;">Stock</th>
          <th style="padding:6px 10px;text-align:center;">Mín.</th>
          <th style="padding:6px 10px;text-align:center;">Pedir</th>
          <th style="padding:6px 10px;">Unidad</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>
    </div>`;
  }).join('');
  _mkInvModal('mkReab', `🛒 Reabastecimiento — ${bajos.length} productos`, html, '720px');
}
(window as any).abrirReabastecimiento = abrirReabastecimiento;

(window as any)._mkExportReabCSV = function(proveedor: string) {
  const bajos = (window.products || []).filter((p: any) => {
    if (p.tipo==='servicio'||p.activo===false) return false;
    const prov = p.proveedor||'Sin proveedor';
    if (proveedor && prov !== proveedor) return false;
    const st = typeof getStockEfectivo==='function'?getStockEfectivo(p):Number(p.stock)||0;
    return st <= (Number(p.stockMin)||5);
  });
  const csv = ['Producto,Stock actual,Stock mínimo,Cantidad a pedir,Unidad,Proveedor',
    ...bajos.map((p: any)=>{
      const st = typeof getStockEfectivo==='function'?getStockEfectivo(p):Number(p.stock)||0;
      const min = Number(p.stockMin)||5;
      return `"${p.name}",${st},${min},${Math.max(1,min*2-st)},${p.unidad||'pza'},"${p.proveedor||''}"`;
    })].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const _hoy = new Date();
  const _fechaCSV = `${_hoy.getFullYear()}-${String(_hoy.getMonth()+1).padStart(2,'0')}-${String(_hoy.getDate()).padStart(2,'0')}`;
  a.download = `reabastecimiento_${_fechaCSV}.csv`;
  a.click();
};

// ── 3. Donut chart: valor por categoría ─────────────
function mostrarDonutCategoria() {
  const _e = _esc;
  const catMap: Record<string, number> = {};
  (window.products || []).forEach((p: any) => {
    if (p.tipo==='servicio'||p.activo===false) return;
    const st = typeof getStockEfectivo==='function'?getStockEfectivo(p):Number(p.stock)||0;
    const val = (Number(p.price)||0) * st;
    const cat = p.category||'Sin categoría';
    catMap[cat] = (catMap[cat]||0) + val;
  });
  const entries = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const total = entries.reduce((s,[,v])=>s+v, 0);
  const colors = ['#FFD166','#9669c4','#10b981','#3b82f6','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#f97316','#14b8a6'];
  const filas = entries.map(([cat, val], i) => {
    const pct = total > 0 ? (val/total*100).toFixed(1) : '0';
    return `<tr>
      <td style="padding:6px 12px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[i%colors.length]};margin-right:6px;"></span>
        ${_e(cat)}
      </td>
      <td style="padding:6px 12px;text-align:right;font-weight:700;">$${val.toLocaleString('es-MX',{maximumFractionDigits:0})}</td>
      <td style="padding:6px 12px;text-align:right;color:#6b7280;">${pct}%</td>
    </tr>`;
  }).join('');
  const html = `
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:16px;">Valor de inventario (precio × stock) por categoría. Total: <b>$${total.toLocaleString('es-MX',{maximumFractionDigits:0})}</b></p>
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">
      <canvas id="mkDonutCat" width="200" height="200" style="flex-shrink:0;max-width:200px;"></canvas>
      <table style="flex:1;min-width:200px;border-collapse:collapse;">
        <thead><tr style="font-size:.75rem;color:#9ca3af;">
          <th style="padding:6px 12px;text-align:left;">Categoría</th>
          <th style="padding:6px 12px;text-align:right;">Valor</th>
          <th style="padding:6px 12px;text-align:right;">%</th>
        </tr></thead>
        <tbody>${filas}</tbody>
        <tfoot><tr style="border-top:2px solid #e5e7eb;font-weight:800;">
          <td style="padding:8px 12px;">Total</td>
          <td style="padding:8px 12px;text-align:right;">$${total.toLocaleString('es-MX',{maximumFractionDigits:0})}</td>
          <td style="padding:8px 12px;text-align:right;">100%</td>
        </tr></tfoot>
      </table>
    </div>`;
  _mkInvModal('mkDonut', '📊 Valor de Inventario por Categoría', html, '700px');
  // Dibujar donut con Chart.js si está disponible
  setTimeout(() => {
    const canvas = document.getElementById('mkDonutCat') as HTMLCanvasElement|null;
    if (!canvas) return;
    try {
      const Chart = (window as any).Chart;
      if (typeof Chart === 'undefined') { canvas.style.display='none'; return; }
      new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: entries.map(([c])=>c),
          datasets: [{ data: entries.map(([,v])=>Math.round(v)), backgroundColor: entries.map((_,i)=>colors[i%colors.length]), borderWidth: 2 }]
        },
        options: { plugins: { legend: { display: false } }, cutout: '65%', responsive: false }
      });
    } catch(e) { if (canvas) canvas.style.display='none'; }
  }, 100);
}
(window as any).mostrarDonutCategoria = mostrarDonutCategoria;

// ── 4. Stock mínimo sugerido desde consumo de pedidos ──
function sugerirStockMinimo() {
  const _e = _esc;
  // Calcular consumo de los últimos 60 días desde pedidos finalizados
  const hace60 = new Date(); hace60.setDate(hace60.getDate()-60);
  const consumo: Record<string, number> = {};
  (window.pedidosFinalizados || []).forEach((p: any) => {
    const fecha = p.fechaFinalizado || p.entrega || '';
    if (fecha && new Date(fecha) < hace60) return;
    (p.productosInventario || []).forEach((it: any) => {
      if (!it.id || it.id==='libre') return;
      consumo[String(it.id)] = (consumo[String(it.id)]||0) + (Number(it.quantity||it.cantidad)||1);
    });
  });
  const prods = (window.products || []).filter((p: any) => p.tipo!=='servicio' && p.activo!==false && consumo[String(p.id)]);
  if (!prods.length) {
    if (typeof manekiToastExport==='function') manekiToastExport('Sin datos de consumo en los últimos 60 días','warn');
    return;
  }
  const filas = prods.map((p: any) => {
    const total60 = consumo[String(p.id)] || 0;
    const diario = total60 / 60;
    const sugerido = Math.max(1, Math.ceil(diario * 14)); // 14 días de cobertura
    const actual = Number(p.stockMin)||0;
    const cambio = sugerido !== actual ? `<span style="color:${sugerido>actual?'#10b981':'#f59e0b'};font-weight:700;">${sugerido>actual?'▲':'▼'} ${sugerido}</span>` : `<span style="color:#6b7280;">${sugerido} (sin cambio)</span>`;
    return `<tr>
      <td style="padding:6px 10px;font-size:.83rem;font-weight:600;">${_e(p.name)}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${total60}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${diario.toFixed(1)}/día</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${actual}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.82rem;">${cambio}</td>
      <td style="padding:6px 10px;text-align:center;">
        <input type="checkbox" checked data-pid="${_e(p.id)}" data-nuevo="${sugerido}" class="mkStockMinCb" style="accent-color:#FFD166;width:16px;height:16px;">
      </td>
    </tr>`;
  }).join('');
  const html = `
    <p style="font-size:.85rem;color:#6b7280;margin-bottom:14px;">Basado en el consumo real de los últimos 60 días. Stock mínimo sugerido = 14 días de cobertura.</p>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="font-size:.75rem;color:#9ca3af;background:#f9fafb;">
        <th style="padding:7px 10px;text-align:left;">Producto</th>
        <th style="padding:7px 10px;text-align:center;">Uso 60d</th>
        <th style="padding:7px 10px;text-align:center;">Promedio</th>
        <th style="padding:7px 10px;text-align:center;">Actual</th>
        <th style="padding:7px 10px;text-align:center;">Sugerido</th>
        <th style="padding:7px 10px;text-align:center;">✓</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="document.getElementById('mkStockMin_ov').remove()" style="padding:9px 20px;border:1.5px solid #e5e7eb;border-radius:10px;background:white;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="_mkAplicarStockMinSugerido()" class="mk-btn-primary" style="padding:9px 24px;">🤖 Aplicar seleccionados</button>
    </div>`;
  _mkInvModal('mkStockMin', '🤖 Stock Mínimo Sugerido', html, '780px');
}
(window as any).sugerirStockMinimo = sugerirStockMinimo;

(window as any)._mkAplicarStockMinSugerido = function() {
  const cbs = document.querySelectorAll('#mkStockMin_ov .mkStockMinCb:checked');
  let aplicados = 0;
  cbs.forEach((cb: any) => {
    const pid = cb.dataset.pid;
    const nuevo = Number(cb.dataset.nuevo);
    const prod = (window.products||[]).find((p:any)=>String(p.id)===String(pid));
    if (!prod || isNaN(nuevo)) return;
    prod.stockMin = nuevo;
    aplicados++;
  });
  if (!aplicados) return;
  if (typeof saveProducts==='function') saveProducts();
  if (typeof renderInventoryTable==='function') renderInventoryTable();
  document.getElementById('mkStockMin_ov')?.remove();
  if (typeof manekiToastExport==='function') manekiToastExport(`✅ Stock mínimo actualizado en ${aplicados} producto${aplicados!==1?'s':''}`, 'ok');
};

// ── 5. Gráfica de movimientos por producto (últimos 90 días) ──────────────
// ── Archivar / Desarchivar producto ───────────────────────────────────────────
function archivarProducto(pid: string) {
  const prod = (window.products || []).find((p: any) => String(p.id) === String(pid));
  if (!prod) return;
  const estaActivo = prod.activo !== false;
  const accion = estaActivo ? 'archivar' : 'desarchivar';
  const msg = estaActivo
    ? `¿Archivar "${prod.name}"? Dejará de aparecer en inventario y búsquedas, pero se conserva el historial.`
    : `¿Desarchivar "${prod.name}"? Volverá a aparecer en inventario.`;
  if (typeof showConfirm === 'function') {
    showConfirm(msg, estaActivo ? '📁 Archivar' : '🔓 Desarchivar').then((ok: boolean) => {
      if (!ok) return;
      prod.activo = !estaActivo;
      prod.updatedAt = new Date().toISOString();
      if (typeof saveProducts === 'function') saveProducts();
      if (typeof renderInventoryTable === 'function') renderInventoryTable();
      if (typeof manekiToastExport === 'function')
        manekiToastExport(estaActivo ? `📁 "${prod.name}" archivado` : `🔓 "${prod.name}" desarchivado`, 'ok');
    });
  }
}
(window as any).archivarProducto = archivarProducto;

function abrirMovimientoProducto(pid: string) {
  const _e = _esc;
  const prod = (window.products||[]).find((p: any) => String(p.id) === String(pid));
  if (!prod) { if (typeof manekiToastExport==='function') manekiToastExport('Producto no encontrado','warn'); return; }

  // Recolectar movimientos: de product.movimientos + window.stockMovimientos global
  const hace90ms = Date.now() - 90 * 86400000;
  const seenIds = new Set<string>();
  const movs: any[] = [];

  const addMov = (m: any) => {
    if (!m) return;
    const ts = m.fecha ? new Date(m.fecha + (m.hora ? 'T' + m.hora : '')).getTime() : (m.timestamp ? new Date(m.timestamp).getTime() : 0);
    if (ts && ts < hace90ms) return;
    const key = m.id || (String(m.productoId||pid) + '_' + ts + '_' + (m.cantidad||0));
    if (seenIds.has(key)) return;
    seenIds.add(key);
    movs.push({ ...m, _ts: ts || Date.now() });
  };

  (prod.movimientos || []).forEach(addMov);
  ((window as any).stockMovimientos || []).filter((m: any) => String(m.productoId) === String(pid)).forEach(addMov);

  movs.sort((a, b) => b._ts - a._ts);

  // Agrupar por semana (últimas 13 semanas)
  const semanas: { label: string; entradas: number; salidas: number }[] = [];
  for (let w = 12; w >= 0; w--) {
    const fin = new Date(Date.now() - w * 7 * 86400000);
    const ini = new Date(fin.getTime() - 7 * 86400000);
    const label = `${ini.getDate()}/${ini.getMonth()+1}`;
    let entradas = 0, salidas = 0;
    movs.forEach(m => {
      if (m._ts >= ini.getTime() && m._ts < fin.getTime()) {
        const diff = (m.stockDespues != null && m.stockAntes != null) ? (Number(m.stockDespues) - Number(m.stockAntes)) : 0;
        const tipo = (m.tipo || '').toLowerCase();
        const esEntrada = diff > 0 || tipo.includes('entrada') || tipo.includes('compra') || tipo.includes('ajuste_positivo');
        if (esEntrada) entradas += Math.abs(Number(m.cantidad)||Math.abs(diff)||1);
        else salidas += Math.abs(Number(m.cantidad)||Math.abs(diff)||1);
      }
    });
    semanas.push({ label, entradas, salidas });
  }

  // SVG sparkline
  const maxVal = Math.max(1, ...semanas.map(s => Math.max(s.entradas, s.salidas)));
  const W = 480, H = 100, barW = Math.floor((W - 20) / semanas.length / 2) - 1;
  const bars = semanas.map((s, i) => {
    const x = 10 + i * (barW * 2 + 4);
    const hE = Math.round((s.entradas / maxVal) * (H - 20));
    const hS = Math.round((s.salidas / maxVal) * (H - 20));
    return `
      <rect x="${x}" y="${H - 10 - hE}" width="${barW}" height="${hE}" fill="#10b981" rx="2" opacity=".85" title="Entradas: ${s.entradas}"/>
      <rect x="${x + barW + 1}" y="${H - 10 - hS}" width="${barW}" height="${hS}" fill="#ef4444" rx="2" opacity=".75" title="Salidas: ${s.salidas}"/>
      <text x="${x + barW}" y="${H - 1}" text-anchor="middle" font-size="8" fill="#9ca3af">${s.label}</text>`;
  }).join('');

  const svgEl = movs.length === 0 ? '<p style="text-align:center;color:#9ca3af;padding:20px 0;font-size:.85rem;">Sin movimientos en los últimos 90 días</p>' : `
    <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:14px;">
      <div style="display:flex;gap:12px;margin-bottom:6px;font-size:.75rem;font-weight:700;">
        <span style="color:#10b981;">■ Entradas</span>
        <span style="color:#ef4444;">■ Salidas</span>
      </div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="100" style="display:block;">
        <line x1="10" y1="${H-10}" x2="${W-10}" y2="${H-10}" stroke="#e5e7eb" stroke-width="1"/>
        ${bars}
      </svg>
      <div style="font-size:.72rem;color:#9ca3af;margin-top:4px;text-align:right;">← 13 semanas</div>
    </div>`;

  // Tabla de movimientos recientes
  const tipo_label: Record<string, string> = {
    entrada_manual: '📥 Entrada manual', compra: '🛒 Compra', ajuste_positivo: '➕ Ajuste +',
    salida_manual: '📤 Salida manual', merma: '🗑️ Merma', venta: '💰 Venta',
    descuento_pedido: '📦 Pedido', ajuste_negativo: '➖ Ajuste −',
  };
  const tablaMovs = movs.slice(0, 30).map((m: any) => {
    const fecha = m.fecha || (m._ts ? new Date(m._ts).toLocaleDateString('es-MX') : '—');
    const hora = m.hora || '';
    const tipo = tipo_label[m.tipo||''] || (m.tipo||'—');
    const diff = (m.stockDespues != null && m.stockAntes != null) ? Number(m.stockDespues) - Number(m.stockAntes) : 0;
    const cant = Number(m.cantidad) || Math.abs(diff) || 0;
    const esPos = diff > 0 || (m.tipo||'').includes('entrada') || (m.tipo||'').includes('compra');
    const cantColor = esPos ? '#10b981' : '#ef4444';
    const cantStr = esPos ? `+${cant}` : `-${cant}`;
    return `<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.8rem;white-space:nowrap;">${_e(fecha)} ${hora ? `<span style="color:#9ca3af;font-size:.72rem;">${_e(hora.substring(0,5))}</span>` : ''}</td>
      <td style="padding:6px 10px;font-size:.78rem;">${_e(tipo)}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${cantColor};">${cantStr}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${m.stockDespues != null ? m.stockDespues : '—'}</td>
      <td style="padding:6px 10px;font-size:.75rem;color:#9ca3af;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_e(m.motivo||'')}">${_e(m.motivo||'')}</td>
    </tr>`;
  }).join('');

  const stockActual = typeof getStockEfectivo==='function' ? getStockEfectivo(prod) : (Number(prod.stock)||0);
  const totalEntradas = movs.reduce((s, m) => {
    const diff = (m.stockDespues != null && m.stockAntes != null) ? Number(m.stockDespues) - Number(m.stockAntes) : 0;
    return s + (diff > 0 || (m.tipo||'').includes('entrada') || (m.tipo||'').includes('compra') ? Math.abs(Number(m.cantidad)||Math.abs(diff)||0) : 0);
  }, 0);
  const totalSalidas = movs.reduce((s, m) => {
    const diff = (m.stockDespues != null && m.stockAntes != null) ? Number(m.stockDespues) - Number(m.stockAntes) : 0;
    const esPos = diff > 0 || (m.tipo||'').includes('entrada') || (m.tipo||'').includes('compra');
    return s + (!esPos ? Math.abs(Number(m.cantidad)||Math.abs(diff)||0) : 0);
  }, 0);

  const html = `
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">${stockActual}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Stock actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#10b981;">+${totalEntradas}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Entradas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#fef2f2;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#ef4444;">-${totalSalidas}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Salidas 90d</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.4rem;font-weight:800;color:#374151;">${movs.length}</div>
        <div style="font-size:.72rem;color:#6b7280;margin-top:2px;">Movimientos</div>
      </div>
    </div>
    ${svgEl}
    ${movs.length > 0 ? `
    <table style="width:100%;border-collapse:collapse;font-size:.82rem;">
      <thead><tr style="background:#f9fafb;font-size:.73rem;color:#9ca3af;font-weight:700;">
        <th style="padding:7px 10px;text-align:left;">Fecha</th>
        <th style="padding:7px 10px;text-align:left;">Tipo</th>
        <th style="padding:7px 10px;text-align:center;">Cant.</th>
        <th style="padding:7px 10px;text-align:center;">Stock</th>
        <th style="padding:7px 10px;text-align:left;">Motivo</th>
      </tr></thead>
      <tbody>${tablaMovs}</tbody>
    </table>
    ${movs.length > 30 ? `<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:10px;">...y ${movs.length - 30} más</p>` : ''}` : ''}
  `;

  const htmlConBoton = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button onclick="(function(){
        var movs=${JSON.stringify(movs.map(m=>({
          fecha:m.fecha||(m._ts?new Date(m._ts).toLocaleDateString('es-MX'):''),
          hora:m.hora||'',tipo:m.tipo||'',
          cantidad:m.cantidad||0,motivo:m.motivo||'',
          stockAntes:m.stockAntes??'',stockDespues:m.stockDespues??''
        })))};
        var headers=['Fecha','Hora','Tipo','Cantidad','Motivo','Stock antes','Stock después'];
        var csv=headers.join(',')+'\\n';
        movs.forEach(function(m){
          var row=[m.fecha,m.hora,m.tipo,m.cantidad,m.motivo,m.stockAntes,m.stockDespues];
          csv+=row.map(function(v){return '\"'+String(v).replace(/\"/g,'\"\"')+'\"';}).join(',')+'\\n';
        });
        var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
        var url=URL.createObjectURL(blob);
        var a=document.createElement('a');
        a.href=url;a.download='kardex-${_e(prod.name||'producto').replace(/[^a-zA-Z0-9]/g,'_')}-90d.csv';
        a.click();URL.revokeObjectURL(url);
        if(typeof manekiToastExport==='function')manekiToastExport('📥 Kardex exportado','ok');
      })()"
        style="padding:7px 14px;border-radius:10px;background:#3b82f6;color:#fff;border:none;font-size:.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;">
        📥 Exportar CSV
      </button>
    </div>
    ${html}`;
  _mkInvModal('mkMovProd', `📈 Movimientos — ${_e(prod.name||'Producto')} (90d)`, htmlConBoton, '780px');
}
(window as any).abrirMovimientoProducto = abrirMovimientoProducto;

// ── Gráfica de tendencia del valor de inventario ──────────────────────────────
function abrirTendenciaInventario() {
  const snaps = (window as any).inventarioSnapshots || [];
  if (snaps.length === 0) {
    if (typeof manekiToastExport === 'function') manekiToastExport('Sin datos históricos aún. Los snapshots se generan automáticamente.', 'warn');
    return;
  }
  const sorted = [...snaps].sort((a: any, b: any) => (a.fecha||'').localeCompare(b.fecha||''));
  const labels = sorted.map((s: any) => s.fecha || '');
  const valores = sorted.map((s: any) => Number(s.valorTotal || s.valor || 0));
  const W = 540, H = 140;
  const maxVal = Math.max(1, ...valores);
  const minVal = Math.min(...valores);
  const range = maxVal - minVal || 1;
  const pts = valores.map((v, i) => {
    const x = 20 + (i / Math.max(1, valores.length - 1)) * (W - 40);
    const y = H - 20 - ((v - minVal) / range) * (H - 40);
    return `${x},${y}`;
  });
  const polyline = `<polyline points="${pts.join(' ')}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>`;
  const dots = valores.map((v, i) => {
    const x = 20 + (i / Math.max(1, valores.length - 1)) * (W - 40);
    const y = H - 20 - ((v - minVal) / range) * (H - 40);
    return `<circle cx="${x}" cy="${y}" r="3.5" fill="#6366f1" opacity=".9"><title>${labels[i]}: $${v.toLocaleString('es-MX')}</title></circle>`;
  }).join('');
  const xLabels = labels.filter((_: any, i: number) => i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 6) === 0)
    .map((lbl: string, i: number, arr: string[]) => {
      const origIdx = labels.indexOf(lbl);
      const x = 20 + (origIdx / Math.max(1, labels.length - 1)) * (W - 40);
      return `<text x="${x}" y="${H - 2}" text-anchor="middle" font-size="9" fill="#9ca3af">${lbl.slice(5)}</text>`;
    }).join('');
  const ultimo = valores[valores.length - 1] || 0;
  const primero = valores[0] || 0;
  const variacion = primero > 0 ? ((ultimo - primero) / primero * 100).toFixed(1) : '—';
  const varColor = Number(variacion) >= 0 ? '#10b981' : '#ef4444';
  const html = `
    <div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:100px;background:#eff6ff;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#4f46e5;">$${ultimo.toLocaleString('es-MX',{maximumFractionDigits:0})}</div>
        <div style="font-size:.72rem;color:#6b7280;">Valor actual</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f0fdf4;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:${varColor};">${Number(variacion)>=0?'+':''}${variacion}%</div>
        <div style="font-size:.72rem;color:#6b7280;">Variación total</div>
      </div>
      <div style="flex:1;min-width:100px;background:#f9fafb;border-radius:10px;padding:10px 14px;text-align:center;">
        <div style="font-size:1.2rem;font-weight:800;color:#374151;">${sorted.length}</div>
        <div style="font-size:.72rem;color:#6b7280;">Snapshots</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:12px;margin-bottom:14px;">
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="140" style="display:block;overflow:visible;">
        <line x1="20" y1="${H-20}" x2="${W-10}" y2="${H-20}" stroke="#e5e7eb" stroke-width="1"/>
        ${polyline}${dots}${xLabels}
      </svg>
      <p style="font-size:.72rem;color:#9ca3af;text-align:right;margin-top:4px;">← Valor de inventario en costo · ${sorted.length} puntos</p>
    </div>`;
  _mkInvModal('mkTendenciaInv', '📈 Tendencia del Valor de Inventario', html, '640px');
}
(window as any).abrirTendenciaInventario = abrirTendenciaInventario;

// ── I3: Panel de movimientos recientes globales ───────────────────────────────
function abrirMovimientosRecientes() {
  const _e = _esc;
  const movs: any[] = [...(window.stockMovements || window.stockMovimientos || [])].slice(0, 50);

  if (movs.length === 0) {
    if (typeof manekiToastExport === 'function') manekiToastExport('Sin movimientos registrados aún', 'warn');
    return;
  }

  const tipoColor: Record<string, string> = {
    ajuste: '#6366f1', entrada: '#10b981', compra: '#10b981',
    merma: '#ef4444', salida: '#ef4444', descuento: '#f59e0b',
    produccion: '#f59e0b', conteo: '#3b82f6', ajuste_positivo: '#10b981'
  };

  const rows = movs.map(m => {
    const partes = (m.fecha || '').split('T');
    const fecha = partes[0] || '';
    const hora = (partes[1] || '').substring(0, 5);
    const tipo = (m.tipo || '').toLowerCase();
    const diff = (m.stockDespues != null && m.stockAntes != null)
      ? Number(m.stockDespues) - Number(m.stockAntes) : 0;
    const esPos = diff > 0 || tipo.includes('entrada') || tipo.includes('compra') || tipo.includes('ajuste_positivo');
    const cant = Number(m.cantidad) || Math.abs(diff) || 0;
    const cantStr = esPos ? `<span style="color:#10b981;font-weight:700;">+${cant}</span>` : `<span style="color:#ef4444;font-weight:700;">−${cant}</span>`;
    const tColor = tipoColor[tipo] || '#6b7280';
    const tBadge = `<span style="display:inline-block;padding:1px 7px;border-radius:99px;background:${tColor}22;color:${tColor};font-size:.7rem;font-weight:700;">${_e(m.tipo || '—')}</span>`;
    const productoLink = m.productoId
      ? `<button onclick="abrirMovimientoProducto('${_e(String(m.productoId))}');document.getElementById('mkMovRecientes')?.closest('[id]')?.remove?.();" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:.8rem;padding:0;text-align:left;text-decoration:underline;text-underline-offset:2px;" title="Ver kardex completo">${_e(m.productoNombre || m.productoId)}</button>`
      : `<span style="font-size:.8rem;">${_e(m.productoNombre || '—')}</span>`;
    return `<tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:6px 10px;font-size:.78rem;white-space:nowrap;color:#374151;">${_e(fecha)} <span style="color:#9ca3af;font-size:.7rem;">${hora}</span></td>
      <td style="padding:6px 10px;">${productoLink}</td>
      <td style="padding:6px 10px;">${tBadge}</td>
      <td style="padding:6px 10px;text-align:center;">${cantStr}</td>
      <td style="padding:6px 10px;text-align:center;font-size:.78rem;color:#6b7280;">${m.stockDespues != null ? m.stockDespues : '—'}</td>
      <td style="padding:6px 10px;font-size:.74rem;color:#9ca3af;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${_e(m.motivo || '')}">${_e(m.motivo || '')}</td>
    </tr>`;
  }).join('');

  const html = `
    <p style="font-size:.78rem;color:#9ca3af;margin-bottom:10px;">Últimos ${movs.length} movimientos de inventario · Haz clic en el producto para ver su kardex completo</p>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:.8rem;">
        <thead>
          <tr style="background:#f9fafb;font-size:.72rem;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">
            <th style="padding:7px 10px;text-align:left;">Fecha</th>
            <th style="padding:7px 10px;text-align:left;">Producto</th>
            <th style="padding:7px 10px;text-align:left;">Tipo</th>
            <th style="padding:7px 10px;text-align:center;">Cant.</th>
            <th style="padding:7px 10px;text-align:center;">Stock final</th>
            <th style="padding:7px 10px;text-align:left;">Motivo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  _mkInvModal('mkMovRecientes', '📋 Movimientos Recientes — Inventario', html, '820px');
}
(window as any).abrirMovimientosRecientes = abrirMovimientosRecientes;
