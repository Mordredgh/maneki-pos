// ═══════════════════════════════════════════════════════════════════
// PRODUCTO VARIABLE — Stickers, tarjetas, cualquier producto con
// precio por rangos de cantidad
// ═══════════════════════════════════════════════════════════════════

window._pvMpComponentes = [];
window._pvTablaPreciosVariable = [];
window._pvCombinaciones = [];

function pvNormalizarCombinaciones(rows:any[]):any[]{
    const seen=new Set<string>();
    return rows.map(row=>{
        const size=String(row.size||'').trim(),color=String(row.color||'').trim();
        const qty=Number(row.qty),priceDelta=Number(row.priceDelta||0);
        if(!size||!color)throw Error('Cada combinación necesita talla y color.');
        if(!Number.isInteger(qty)||qty<0)throw Error('Existencias inválidas: usa piezas enteras desde cero.');
        if(!Number.isFinite(priceDelta)||priceDelta<0)throw Error('Recargo inválido: usa cero o un importe positivo.');
        const key=`${size.toLocaleLowerCase('es-MX')}|${color.toLocaleLowerCase('es-MX')}`;
        if(seen.has(key))throw Error('Hay una combinación de talla y color repetida.');seen.add(key);
        return {type:'Talla/Color',value:`${size} / ${color}`,size,color,qty,priceDelta:mkRound2(priceDelta)};
    });
}
function pvAgregarCombinacion(){window._pvCombinaciones.push({size:'',color:'',qty:0,priceDelta:0});pvRenderCombinaciones();}
function pvEditarCombinacion(index:number,field:string,value:string){
    const row=window._pvCombinaciones[index];if(!row)return;
    row[field]=['qty','priceDelta'].includes(field)?Number(value):value;
}
function pvQuitarCombinacion(index:number){window._pvCombinaciones.splice(index,1);pvRenderCombinaciones();}
function pvRenderCombinaciones(){
    const list=document.getElementById('pvCombinacionesList');if(!list)return;
    list.replaceChildren();
    if(!window._pvCombinaciones.length){list.textContent='Sin tallas y colores: el producto se venderá sin elección de variante.';pvRenderVentaPreview();return;}
    window._pvCombinaciones.forEach((row:any,i:number)=>{
        const line=document.createElement('div');line.className='pv-combination-row';
        for(const [field,label,kind] of [['size','Talla','text'],['color','Color','text'],['qty','Existencias listas','number'],['priceDelta','Recargo por pieza','number']]){
            const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement('input');input.type=kind;input.value=String(row[field]??'');
            if(kind==='number'){input.min='0';input.step=field==='qty'?'1':'0.01';}input.required=true;input.oninput=()=>pvEditarCombinacion(i,field,input.value);wrap.appendChild(input);line.appendChild(wrap);
        }
        const remove=document.createElement('button');remove.type='button';remove.textContent='Quitar';remove.onclick=()=>pvQuitarCombinacion(i);line.appendChild(remove);list.appendChild(line);
    });
    pvRenderVentaPreview();
}
window.pvAgregarCombinacion=pvAgregarCombinacion;

function injectVariableProductModal() {
    const existing = document.getElementById('pvModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'pvModal';
    modal.className = 'modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','pvModalTitle');
    modal.innerHTML = `
    <div class="modal-content" style="max-width:580px;max-height:90vh;overflow-y:auto;border-radius:20px;padding:28px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 id="pvModalTitle" style="font-size:1.3rem;font-weight:800;color:#1a0533;">Producto con precio por cantidad</h3>
            <button type="button" onclick="closeModal('pvModal')" aria-label="Cerrar formulario de producto" class="pv-close">×</button>
        </div>
        <form id="pvForm" style="display:flex;flex-direction:column;gap:16px;">
            <input type="hidden" id="pvEditId" value="">

            <!-- IMAGEN -->
            <div>
                <label for="pvProductImage" style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Imagen del producto</label>
                <input type="file" id="pvProductImage" accept="image/*"
                    style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;box-sizing:border-box;">
                <div id="pvImagePreview" class="hidden" style="margin-top:10px;text-align:center;">
                    <img id="pvPreviewImg" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;margin:auto;" src="" alt="">
                </div>
            </div>

            <!-- Nombre -->
            <div>
                <label for="pvNombre" class="block text-sm font-semibold text-gray-700 mb-2">Nombre del producto *</label>
                <input type="text" id="pvNombre" required placeholder="Ej: Stickers 5x5 cm, Tarjetas de presentación"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
            </div>

            <!-- Rendimiento por hoja -->
            <div>
                <label for="pvRendimiento" class="block text-sm font-semibold text-gray-700 mb-2">Piezas por hoja o unidad de material</label>
                <input type="number" id="pvRendimiento" min="1" placeholder="Ej: 12 (cuántas piezas caben en 1 hoja)"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
                <p class="text-xs text-gray-400 mt-1">El sistema dividirá la cantidad del pedido entre este número para calcular hojas a descontar.</p>
            </div>

            <!-- Materias primas -->
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <label for="pvBuscarMP" class="text-sm font-semibold text-gray-700">Materiales y servicios</label>
                    <button type="button" onclick="pvAgregarComponente()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:linear-gradient(135deg,#9669c4,#ab84d1);">+ Agregar componente</button>
                </div>
                <div style="margin-bottom:8px;">
                    <input type="text" id="pvBuscarMP" placeholder="Buscar materia prima..."
                        oninput="pvFiltrarMP(this.value)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
                    <div id="pvMpSuggestions" style="display:none;background:#fff;border:1px solid #e5e7eb;border-radius:12px;margin-top:4px;max-height:150px;overflow-y:auto;z-index:10;position:relative;"></div>
                </div>
                <div id="pvMpList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>

            <!-- Tabla de precios -->
            <section class="pv-workflow-card" aria-labelledby="pvCombTitle">
                <h4 id="pvCombTitle">Tallas y colores</h4>
                <p>Opcional para playeras. Una fila es una combinación; las existencias son piezas ya listas. Deja cero si se fabrica al recibir el pedido.</p>
                <div id="pvCombinacionesList"></div>
                <button type="button" data-action="pvAgregarCombinacion">Agregar talla y color</button>
            </section>
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span class="text-sm font-semibold text-gray-700">Precio por cantidad</span>
                    <button type="button" onclick="pvAgregarRangoPrecio()"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style="background:#059669;">+ Agregar rango</button>
                </div>
                <p class="text-xs text-gray-400 mb-2">Si el cliente pide una cantidad que no está exacta, se usa el precio del rango inferior más cercano.</p>
                <div id="pvTablaPreciosList" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>
            <section class="pv-sale-preview" aria-label="Vista previa de venta">
                <span>Así aparecerá al venderlo</span>
                <strong id="pvSalePreviewName">Nombre del producto</strong>
                <p id="pvSalePreviewDetails">Agrega una talla, color y rango para ver el precio por pieza.</p>
            </section>

            <!-- SKU -->
            <div>
                <label for="pvSku" class="block text-sm font-semibold text-gray-700 mb-2">Código SKU <span class="text-gray-400 font-normal">(opcional)</span></label>
                <input type="text" id="pvSku" placeholder="Se genera automáticamente si lo dejas vacío"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm">
            </div>

            <!-- CATEGORÍA -->
            <div>
                <label for="pvCategory" style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Categoría</label>
                <select id="pvCategory"
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.9rem;outline:none;background:#fff;box-sizing:border-box;">
                    <option value="">Sin categoría</option>
                </select>
            </div>

            <!-- TAGS -->
            <div>
                <span style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Etiquetas</span>
                <div style="display:flex;flex-wrap:wrap;gap:8px;" id="pvTagsGrid"></div>
            </div>

            <!-- NOTAS -->
            <div>
                <label for="pvNotas" style="display:block;font-size:.85rem;font-weight:700;color:#374151;margin-bottom:8px;">Notas internas <span style="font-weight:400;color:#5c5366;">(opcional)</span></label>
                <textarea id="pvNotas" rows="2" placeholder="Especificaciones, materiales, observaciones..."
                    style="width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
            </div>

            <button type="submit" id="pvSubmitBtn"
                class="w-full py-3 rounded-xl text-white font-bold text-base mt-2"
                style="background:linear-gradient(135deg,#9669c4,#ab84d1);">
                Guardar producto
            </button>
        </form>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#pvForm')?.addEventListener('submit',guardarProductoVariable);
    modal.querySelector('#pvForm')?.addEventListener('input',pvRenderVentaPreview);
}
window.injectVariableProductModal = injectVariableProductModal;

function pvRenderVentaPreview(){
    const name=document.getElementById('pvSalePreviewName');
    const details=document.getElementById('pvSalePreviewDetails');
    if(!name||!details)return;
    name.textContent=document.getElementById('pvNombre')?.value.trim()||'Nombre del producto';
    const first=window._pvCombinaciones?.[0];
    const tier=(window._pvTablaPreciosVariable||[]).filter(r=>Number(r.cantidadMin)>0&&Number(r.precio)>0).sort((a,b)=>a.cantidadMin-b.cantidadMin)[0];
    const variant=first?.size&&first?.color?`${first.size} / ${first.color} · `:'';
    const price=tier?`desde $${(Number(tier.precio)/Number(tier.cantidadMin)+(Number(first?.priceDelta)||0)).toFixed(2)} por pieza`:'agrega un rango para mostrar el precio';
    details.textContent=`${variant}${price}`;
}

function pvFiltrarMP(q) {
    const box = document.getElementById('pvMpSuggestions');
    if (!box) return;
    const mps = (window.products || []).filter(p =>
        p.tipo === 'materia_prima' || p.tipo === 'servicio'
    ).filter(p => !q || (p.name || '').toLowerCase().includes(q.toLowerCase()));
    if (!mps.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML = mps.slice(0, 8).map(p =>
        `<div onclick="pvSeleccionarMP('${p.id}')"
            style="padding:8px 12px;cursor:pointer;font-size:.85rem;border-bottom:1px solid #f3f4f6;"
            onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background=''">
            ${_esc(p.name || '')} <span style="color:#9ca3af;font-size:.75rem;">$${Number(p.cost||0).toFixed(2)}/ud</span>
        </div>`
    ).join('');
}
window.pvFiltrarMP = pvFiltrarMP;

function pvSeleccionarMP(id) {
    const mp = (window.products || []).find(p => String(p.id) === String(id));
    if (!mp) return;
    if ((window._pvMpComponentes || []).find(c => String(c.id) === String(id))) {
        manekiToastExport('Ya está agregado', 'warn'); return;
    }
    window._pvMpComponentes.push({ id: mp.id, name: mp.name, qty: 1, costUnit: mp.cost || 0 });
    document.getElementById('pvBuscarMP').value = '';
    document.getElementById('pvMpSuggestions').style.display = 'none';
    pvRenderMpList();
}
window.pvSeleccionarMP = pvSeleccionarMP;

function pvAgregarComponente() {
    const input = document.getElementById('pvBuscarMP');
    if (input) { input.focus(); pvFiltrarMP(input.value || ''); }
}
window.pvAgregarComponente = pvAgregarComponente;

function pvRenderMpList() {
    const list = document.getElementById('pvMpList');
    if (!list) return;
    const comps = window._pvMpComponentes || [];
    if (!comps.length) { list.innerHTML = '<p class="text-xs text-gray-400">Sin componentes aún.</p>'; return; }
    const costoTotal = comps.reduce((s, c) => s + (parseFloat(c.costUnit)||0) * (parseFloat(c.qty)||1), 0);
    list.innerHTML = comps.map((c, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f5f3ff;border-radius:10px;font-size:.82rem;">
            <span style="flex:1;font-weight:600;color:#4c1d95;">${_esc(c.name || '')}</span>
            <span style="color:#9ca3af;">qty:</span>
            <input type="number" min="0.01" step="0.01" value="${c.qty}"
                onchange="pvEditarQtyComp(${i}, this.value)"
                style="width:50px;padding:3px 6px;border:1px solid #ddd6fe;border-radius:6px;text-align:center;font-size:.8rem;">
            <span style="color:#9669c4;font-weight:600;min-width:55px;text-align:right;">$${((parseFloat(c.costUnit)||0)*(parseFloat(c.qty)||1)).toFixed(2)}</span>
            <button onclick="pvQuitarComp(${i})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">✕</button>
        </div>`).join('') +
        `<div style="text-align:right;font-size:.78rem;color:#9669c4;font-weight:700;padding:4px 10px 0;">Costo por hoja: $${costoTotal.toFixed(2)}</div>`;
}
window.pvRenderMpList = pvRenderMpList;

function pvEditarQtyComp(idx, val) {
    if (window._pvMpComponentes[idx]) window._pvMpComponentes[idx].qty = parseFloat(val) || 1;
    pvRenderMpList();
}
window.pvEditarQtyComp = pvEditarQtyComp;

function pvQuitarComp(idx) {
    window._pvMpComponentes.splice(idx, 1);
    pvRenderMpList();
}
window.pvQuitarComp = pvQuitarComp;

function pvAgregarRangoPrecio() {
    if (!window._pvTablaPreciosVariable) window._pvTablaPreciosVariable = [];
    window._pvTablaPreciosVariable.push({ cantidadMin: '', precio: '' });
    pvRenderTablaPreciosList();
}
window.pvAgregarRangoPrecio = pvAgregarRangoPrecio;

function pvRenderTablaPreciosList() {
    const list = document.getElementById('pvTablaPreciosList');
    if (!list) return;
    if(!list._pvBound){
        list.addEventListener('input',(event:any)=>{
            const input=event.target;
            const idx=Number(input?.dataset?.priceIndex);
            const field=input?.dataset?.priceField;
            if(!Number.isInteger(idx)||!['cantidadMin','precio'].includes(field))return;
            pvEditarRango(idx,field,input.value);
            const row=input.closest('.pv-price-row');
            const value=row?.querySelector('.pv-price-unit');
            const range=window._pvTablaPreciosVariable[idx];
            if(value&&range)value.textContent=range.cantidadMin>0&&range.precio>0?`$${(range.precio/range.cantidadMin).toFixed(2)}`:'$—';
        });
        list._pvBound=true;
    }
    const tabla = window._pvTablaPreciosVariable || [];
    if (!tabla.length) {
        list.innerHTML = '<p class="text-xs text-gray-400">Sin rangos. Agrega al menos uno.</p>';
        return;
    }
    list.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;margin-bottom:4px;padding:0 4px;">
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Cantidad mínima</span>
            <span style="font-size:.72rem;font-weight:700;color:#6b7280;">Precio total ($)</span>
            <span style="font-size:.72rem;font-weight:700;color:#0369a1;">$/pieza</span>
            <span></span>
        </div>` +
        tabla.map((r, i) => {
            const unitario = (r.cantidadMin > 0 && r.precio > 0)
                ? (r.precio / r.cantidadMin).toFixed(2)
                : '—';
            return `
        <div class="pv-price-row" style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:center;">
            <input type="number" min="1" placeholder="Ej: 10" value="${r.cantidadMin}" data-price-index="${i}" data-price-field="cantidadMin" aria-label="Cantidad mínima del rango ${i+1}"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-center">
            <input type="number" min="0" step="0.01" placeholder="Ej: 50.00" value="${r.precio}" data-price-index="${i}" data-price-field="precio" aria-label="Precio total del rango ${i+1}"
                class="px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none text-center"
                style="color:#059669;font-weight:600;">
            <span class="pv-price-unit" style="font-size:.85rem;font-weight:700;color:#0369a1;text-align:center;padding:8px 4px;background:#e0f2fe;border-radius:8px;">$${unitario}</span>
            <button onclick="pvQuitarRango(${i})"
                style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;padding:0 4px;">✕</button>
        </div>`;
        }).join('');
    pvRenderVentaPreview();
}
window.pvRenderTablaPreciosList = pvRenderTablaPreciosList;

function pvEditarRango(idx, campo, valor) {
    if (window._pvTablaPreciosVariable[idx]) {
        window._pvTablaPreciosVariable[idx][campo] = campo === 'cantidadMin' ? parseInt(valor)||0 : parseFloat(valor)||0;
    }
}
window.pvEditarRango = pvEditarRango;

function pvQuitarRango(idx) {
    window._pvTablaPreciosVariable.splice(idx, 1);
    pvRenderTablaPreciosList();
}
window.pvQuitarRango = pvQuitarRango;

function openVariableProductModal(editId) {
    if(editId)posGuardarLugarInventario(String(editId));
    injectVariableProductModal();
    window._pvMpComponentes = [];
    window._pvTablaPreciosVariable = [];
    window._pvCombinaciones = [];
    window._pvTagsActuales = [];
    window._pvProductImage = null;
    window._pvProductImageFile = null;

    // Configurar listener de imagen
    setTimeout(() => {
        const imgInput = document.getElementById('pvProductImage');
        if (imgInput && !imgInput._mkBound) {
            imgInput._mkBound = true;
            imgInput.addEventListener('change', function(e) {
                const file = e.target.files[0]; if (!file) return;
                window._pvProductImageFile = file;
                const reader = new FileReader();
                reader.onload = ev => {
                    const img = document.getElementById('pvPreviewImg');
                    const pre = document.getElementById('pvImagePreview');
                    if (img) img.src = ev.target.result as string;
                    if (pre) pre.classList.remove('hidden');
                    window._pvProductImage = ev.target.result as string;
                };
                reader.readAsDataURL(file);
            });
        }
        poblarCategoriasPv();
        if(!editId)posRestaurarCaptura(['pvCategory']);
        renderTagsPv();
    }, 80);

    if (editId) {
        const p = (window.products || []).find(x => String(x.id) === String(editId));
        if (p) {
            window._pvMpComponentes = (p.mpComponentes || []).map(c => ({...c}));
            window._pvTablaPreciosVariable = (p.tablaPreciosVariable || []).map(r => ({...r}));
            window._pvCombinaciones = (p.variants||[]).filter(v=>v.type==='Talla/Color').map(v=>({size:v.size||'',color:v.color||'',qty:v.qty||0,priceDelta:v.priceDelta||0}));
            window._pvTagsActuales = [...(p.tags || [])];
            window._pvProductImage = p.imageUrl || null;
            setTimeout(() => {
                const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
                set('pvNombre', p.name);
                set('pvSku', p.sku || '');
                set('pvRendimiento', p.rendimientoPorHoja || '');
                set('pvEditId', editId);
                set('pvNotas', p.notas || '');
                // Categoría
                const catSel = document.getElementById('pvCategory');
                if (catSel && p.category) catSel.value = p.category;
                // Imagen previa
                if (p.imageUrl) {
                    const img = document.getElementById('pvPreviewImg');
                    const pre = document.getElementById('pvImagePreview');
                    if (img) img.src = p.imageUrl;
                    if (pre) pre.classList.remove('hidden');
                }
                pvRenderMpList();
                pvRenderTablaPreciosList();
                pvRenderCombinaciones();
                renderTagsPv();
                const title = document.querySelector('#pvModal h3');
                if (title) title.textContent = 'Editar producto con precio por cantidad';
                const btn = document.getElementById('pvSubmitBtn');
                if (btn) btn.textContent = 'Guardar cambios';
                pvRenderVentaPreview();
            }, 80);
        }
    } else {
        setTimeout(() => {
            pvRenderMpList();
            pvRenderTablaPreciosList();
            pvRenderCombinaciones();
        }, 80);
    }
    openModal('pvModal');
}
window.openVariableProductModal = openVariableProductModal;

async function guardarProductoVariable(e) {
    if (e) e.preventDefault();
    if (document.getElementById('pvSubmitBtn')?.disabled) return;
    const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const nombre = gv('pvNombre').trim();
    const sku = gv('pvSku').trim();
    const rendimiento = parseFloat(gv('pvRendimiento')) || 0;
    const editId = gv('pvEditId');
    const category = gv('pvCategory') || '';
    const notas = gv('pvNotas').trim();
    const tags = [...(window._pvTagsActuales || [])];

    if (!nombre) { manekiToastExport('⚠️ El nombre es requerido', 'warn'); return; }
    const tabla = (window._pvTablaPreciosVariable || []).filter(r => r.cantidadMin > 0 && r.precio > 0);
    if (!tabla.length) { manekiToastExport('⚠️ Agrega al menos un rango de precio', 'warn'); return; }
    let combinations:any[];
    try{combinations=pvNormalizarCombinaciones(window._pvCombinaciones||[]);}catch(err:any){manekiToastExport(err.message,'warn');return;}
    if(new Set(tabla.map(r=>Number(r.cantidadMin))).size!==tabla.length){manekiToastExport('Los rangos de precio no pueden repetir la cantidad mínima.','warn');return;}

    // Spinner
    const _btn = document.getElementById('pvSubmitBtn');
    if (_btn) { _btn.disabled = true; _btn.textContent = '⏳ Guardando...'; }
    const _restore = () => { if (_btn) { _btn.disabled = false; _btn.textContent = editId ? 'Guardar cambios' : 'Guardar producto'; } };

    try {
    // Subir imagen si hay archivo nuevo
    let imageUrl = window._pvProductImage || '';
    if (window._pvProductImageFile) {
        manekiToastExport('⏳ Subiendo imagen...', 'ok');
        const uploaded = await subirImagenStorage(window._pvProductImageFile);
        if (uploaded) { imageUrl = uploaded; window._pvProductImage = uploaded; }
        window._pvProductImageFile = null;
    }

    // Ordenar tabla por cantidadMin ascendente
    tabla.sort((a, b) => a.cantidadMin - b.cantidadMin);
    const mpComps = (window._pvMpComponentes || []).map(c => ({...c}));
    const costoHoja = mpComps.reduce((s, c) => s + (parseFloat(c.costUnit)||0) * (parseFloat(c.qty)||1), 0);

    const finalSku = sku || ('PV-' + mkId().split('-')[0].toUpperCase());

    if (editId) {
        const idx = (window.products || []).findIndex(x => String(x.id) === String(editId));
        if (idx === -1) { manekiToastExport('Producto no encontrado', 'err'); _restore(); return; }
        window.products[idx] = Object.assign({}, window.products[idx], {
            name: nombre, tipo: 'producto_variable',
            sku: finalSku, rendimientoPorHoja: rendimiento,
            mpComponentes: mpComps, tablaPreciosVariable: tabla,
            variants:[...(window.products[idx].variants||[]).filter(v=>v.type!=='Talla/Color'),...combinations],
            cost: costoHoja, price: tabla[tabla.length - 1].precio,
            category, tags, notas,
            imageUrl: imageUrl || window.products[idx].imageUrl || '',
        });
    } else {
        const np = {
            id: _genId(), name: nombre, tipo: 'producto_variable',
            sku: finalSku, rendimientoPorHoja: rendimiento,
            mpComponentes: mpComps, tablaPreciosVariable: tabla,
            cost: costoHoja, price: tabla[tabla.length - 1].precio,
            stock: 0, variants:combinations,image: '🎨', category, tags, notas, imageUrl,
        };
        window.products.unshift(np as ManekiProduct);
        document.getElementById('pvEditId').value = String(np.id);
        await window.posGuardarBorrador?.(document.getElementById('pvModal')).catch(()=>{});
    }

        await saveProducts();
        posRecordarCaptura(['pvCategory']);
        renderInventoryTable();
        const modal=document.getElementById('pvModal');
        if(modal)modal._mkDirty=false;
        await closeModal('pvModal');
        manekiToastExport(editId?'✅ Producto variable actualizado':'✅ Producto variable creado','ok');
    }
    catch(err:any){_restore();manekiToastExport('No se confirmó el guardado: '+(err.message||'revisa la sincronización'),'warn');}
}
window.guardarProductoVariable = guardarProductoVariable;

// Función para obtener precio de un producto variable según cantidad
function pvGetPrecio(product, cantidad, variante?:string) {
    // precio guardado es el TOTAL del rango (ej: 50 pzas = $150 total)
    // devolvemos precio UNITARIO para que el pedido multiplique por cantidad correctamente
    const tabla = (product.tablaPreciosVariable || []).slice().sort((a, b) => a.cantidadMin - b.cantidadMin);
    if (!tabla.length) return 0;
    let rangoElegido = tabla[0];
    for (const rango of tabla) {
        if (cantidad >= rango.cantidadMin) rangoElegido = rango;
        else break;
    }
    const min = rangoElegido.cantidadMin || 1;
    const selected=(product.variants||[]).find(v=>`${v.type}:${v.value}`===variante);
    return mkRound2(rangoElegido.precio / min + Number(selected?.priceDelta||0));
}
window.pvGetPrecio = pvGetPrecio;

function pvRecalcularLineas(items:any[],products:any[]){
    const totals=new Map<string,number>();
    for(const item of items)totals.set(String(item.id),(totals.get(String(item.id))||0)+(Number(item.quantity)||0));
    for(const item of items){
        const p=products.find(x=>String(x.id)===String(item.id));
        if(p?.tipo==='producto_variable'&&!item.posPromocion)item.price=pvGetPrecio(p,totals.get(String(item.id))||1,item.variante);
    }
}
window.pvRecalcularLineas=pvRecalcularLineas;

function pvVarianteMaterial(mp:any,variante?:string){
    const selected=String(variante||'');
    const own=(mp.variants||[]).find((v:any)=>`${v.type||v.tipo}:${v.value||v.valor}`===selected);
    if(own)return own;
    if(!selected.startsWith('Talla/Color:'))return null;
    const [size,color]=selected.slice('Talla/Color:'.length).split('/').map(x=>x.trim());
    return (mp.variants||[]).find((v:any)=>{
        const type=String(v.type||v.tipo||'').toLocaleLowerCase('es-MX');
        const value=String(v.value||v.valor||'').toLocaleLowerCase('es-MX');
        return (type==='talla'&&value===size.toLocaleLowerCase('es-MX'))||
            (type==='color'&&value===color.toLocaleLowerCase('es-MX'));
    })||null;
}
window.pvVarianteMaterial=pvVarianteMaterial;

function pvPlanMateriales(product:any,cantidad:number,variante:string|undefined,products:any[]){
    const selected=(product.variants||[]).find((v:any)=>`${v.type}:${v.value}`===variante);
    const terminadas=Number(selected?.qty??product.stock)||0;
    const fabricar=Math.max(0,cantidad-terminadas);
    const rendimiento=Number(product.rendimientoPorHoja)||1;
    if(!(product.mpComponentes||[]).length){
        return [{nombre:'piezas terminadas',necesario:cantidad,disponible:terminadas,faltante:fabricar}];
    }
    return product.mpComponentes.map((comp:any)=>{
        const mp=products.find(x=>String(x.id)===String(comp.id));
        const requerido=Math.ceil(fabricar/rendimiento)*(Number(comp.qty)||1);
        const materialVar=mp?.variants?.length?pvVarianteMaterial(mp,variante):null;
        const disponible=mp?Number(mp.variants?.length?materialVar?.qty:mp.stock)||0:0;
        return {nombre:mp?.name||comp.name||'Material no encontrado',necesario:requerido,disponible,faltante:Math.max(0,requerido-disponible)};
    });
}
window.pvPlanMateriales=pvPlanMateriales;

// ── Mejora 2: Modal de movimientos de stock por producto ──────────────────
function verMovimientosProducto(pid) {
    const prod = (window.products || []).find(p => String(p.id) === String(pid));
    if (!prod) return;
    // FIX-1: migrar campo en runtime para productos heredados sin movimientos
    if (!prod.movimientos) prod.movimientos = [];
    const movs = (prod.movimientos || []).slice(0, 5);

    // Remover modal previo si existe
    const _prev = document.getElementById('_mkMovimientosModal');
    if (_prev) _prev.remove();

    const filas = movs.length ? movs.map(m => {
        const clr = m.delta > 0 ? '#059669' : '#dc2626';
        const bg  = m.delta > 0 ? '#d1fae5' : '#fee2e2';
        const signo = m.delta > 0 ? '+' : '';
        return `<tr>
            <td style="padding:6px 10px;font-size:.8rem;color:#6b7280;">${_esc(m.fecha||'—')}</td>
            <td style="padding:6px 10px;text-align:center;">
                <span style="background:${bg};color:${clr};font-weight:700;padding:2px 10px;border-radius:8px;font-size:.8rem;">${signo}${m.delta}</span>
            </td>
            <td style="padding:6px 10px;text-align:center;font-size:.8rem;font-weight:600;color:#374151;">${m.stockResultante}</td>
            <td style="padding:6px 10px;font-size:.78rem;color:#6b7280;">${_esc(m.motivo||'—')}</td>
        </tr>`;
    }).join('') : `<tr><td colspan="4" style="padding:14px;text-align:center;font-size:.8rem;color:#9ca3af;">Sin movimientos registrados</td></tr>`;

    const modal = document.createElement('div');
    modal.id = '_mkMovimientosModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);';
    modal.innerHTML = `
    <div style="background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,0.2);max-width:560px;width:95%;padding:24px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <div style="font-size:1.05rem;font-weight:800;color:#1a0533;">📋 Últimos movimientos de stock</div>
                <div style="font-size:.78rem;color:#9ca3af;margin-top:2px;">${_esc(prod.name)}</div>
            </div>
            <button onclick="document.getElementById('_mkMovimientosModal').remove()"
                style="font-size:1.4rem;background:none;border:none;cursor:pointer;color:#9ca3af;line-height:1;">×</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:#f9fafb;">
                    <th style="padding:6px 10px;text-align:left;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Fecha</th>
                    <th style="padding:6px 10px;text-align:center;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Cambio</th>
                    <th style="padding:6px 10px;text-align:center;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Stock final</th>
                    <th style="padding:6px 10px;text-align:left;font-size:.75rem;font-weight:700;color:#6b7280;border-bottom:1.5px solid #e5e7eb;">Motivo</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        ${movs.length === 0 || (prod.movimientos || []).length <= 5 ? '' : `<p style="font-size:.72rem;color:#9ca3af;text-align:center;margin-top:10px;">Mostrando los últimos 5 de ${(prod.movimientos || []).length} movimientos</p>`}
    </div>`;
    document.body.appendChild(modal);
    // Cerrar al hacer clic fuera del panel
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}
window.verMovimientosProducto = verMovimientosProducto;
