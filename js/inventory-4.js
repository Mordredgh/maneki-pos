async function guardarMateriaPrima() {
    const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const nombre  = gv('mpNombre').trim();
    const stock   = parseInt(gv('mpStock')) || 0;
    const stockMin= parseInt(gv('mpStockMin')) || 5;
    const sku     = gv('mpSku').trim();
    const prov    = gv('mpProveedor').trim();
    const provUrl = gv('mpProveedorUrl').trim();
    const unidad  = gv('mpUnidad') || 'pza';
    const notas   = gv('mpNotas').trim();

    // Leer costo — puede venir del modo simple o del modo paquete
    const usaPaquete = document.getElementById('mpUsaPaquete')?.checked || false;
    const paqueteCantidad = parseFloat(gv('mpPaqueteCantidad')) || 0;
    const paquetePrecio   = parseFloat(gv('mpPaquetePrecio'))   || 0;
    let costo = 0;
    if (usaPaquete) {
        if (paqueteCantidad <= 0 || paquetePrecio <= 0) {
            manekiToastExport('⚠️ Ingresa la cantidad y precio del paquete', 'warn'); return;
        }
        costo = paquetePrecio / paqueteCantidad;
    } else {
        costo = parseFloat(gv('mpCosto')) || 0;
    }

    if (!nombre) { manekiToastExport('⚠️ El nombre es requerido','warn'); return; }
    if (costo <= 0) { manekiToastExport('⚠️ El costo debe ser mayor a 0','warn'); return; }
    // GUARD: detectar nombre duplicado en materias primas
    const _excludeIdMp = window.modoEdicion ? window.edicionProductoId : null;
    const _nombreDupMp = (window.products||[]).find(p =>
        p.name.trim().toLowerCase() === nombre.toLowerCase() && String(p.id) !== String(_excludeIdMp)
    );
    if (_nombreDupMp) {
        manekiToastExport(`⚠️ Ya existe un producto llamado "${_nombreDupMp.name}". Usa un nombre diferente o edita el existente.`, 'warn');
        return;
    }
    if (sku && !skuEsUnico(sku, _excludeIdMp)) {
        manekiToastExport(`⚠️ El SKU "${sku}" ya está en uso`,'warn'); return;
    }

    // Subir imagen si hay
    if (window.currentProductImageFile) {
        manekiToastExport('⏳ Subiendo imagen...','ok');
        const uploaded = await subirImagenStorage(window.currentProductImageFile).catch(() => null);
        if (uploaded) {
            window.currentProductImage = uploaded;
        } else {
            manekiToastExport('⚠️ No se pudo subir la imagen. Intenta de nuevo.', 'warn');
        }
        window.currentProductImageFile = null;
    }

    const esEmpaque = document.getElementById('mpEsEmpaque')?.checked || false;
    const tags = [...(window._mpTagsActuales || [])];
    const _skuRandom = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID().split('-')[0].toUpperCase()
        : Math.random().toString(36).slice(2,7).toUpperCase();
    const finalSku = sku || ('MP-' + _skuRandom);

    // Recoger variantes (si el toggle está activo)
    const usaVariantes = document.getElementById('mpUsaVariantes')?.checked || false;
    const variantesGuardar = usaVariantes ? [...(window._mpVariantes || [])] : [];
    // Stock final: si usa variantes, suma de todas; si no, el campo manual
    const stockFinal = usaVariantes
        ? variantesGuardar.reduce((s, v) => s + (parseInt(v.qty) || 0), 0)
        : stock;

    if (window.modoEdicion && window.edicionProductoId !== null) {
        const idx = (window.products||[]).findIndex(x => String(x.id) === String(window.edicionProductoId));
        if (idx === -1) { manekiToastExport('Error: producto no encontrado','err'); return; }
        const stOld = window.products[idx].stock;
        // Feature 6: Historial de costos para MP
        const costoViejo = window.products[idx].cost || 0;
        const historialCostos = [...(window.products[idx].historialCostos || [])];
        if (costo !== costoViejo) {
            historialCostos.push({ fecha: new Date().toISOString(), costoAntes: costoViejo, costoNuevo: costo });
        }
        window.products[idx] = Object.assign({}, window.products[idx], {
            name: nombre, tipo: 'materia_prima', cost: costo, price: 0,
            stock: stockFinal, stockMin, sku: finalSku, tags, proveedor: prov, proveedorUrl: provUrl,
            unidad, notas,
            imageUrl: window.currentProductImage || window.products[idx].imageUrl,
            compraPaquete: usaPaquete ? { cantidad: paqueteCantidad, precio: paquetePrecio } : null,
            variants: variantesGuardar,
            usaVariantes,
            historialCostos,
            esEmpaque,
        });
        if (stockFinal !== stOld) registrarMovimiento({ productoId: window.edicionProductoId,
            productoNombre: nombre, tipo: 'ajuste', cantidad: stockFinal-stOld,
            motivo: 'Edición', stockAntes: stOld, stockDespues: stockFinal });
        if (costo !== costoViejo) _cascadeCostMP(window.edicionProductoId, costo);
        if (usaVariantes && variantesGuardar.length > 0) _cascadeVariantesMP(window.edicionProductoId, variantesGuardar);
        saveProducts(); renderInventoryTable();
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof updateDashboard === 'function') updateDashboard();
        closeMateriaPrimaModal();
        if (window.MKS) MKS.notify();
        manekiToastExport('✅ Materia prima actualizada','ok');
    } else {
        const np = {
            id: _genId(), name: nombre, tipo: 'materia_prima', category: 'materiales',
            cost: costo, price: 0, stock: stockFinal, stockMin, sku: finalSku, tags,
            proveedor: prov, proveedorUrl: provUrl, unidad, notas,
            image: '🏭', imageUrl: window.currentProductImage || null,
            variants: variantesGuardar, usaVariantes,
            compraPaquete: usaPaquete ? { cantidad: paqueteCantidad, precio: paquetePrecio } : null,
            esEmpaque,
        };
        window.products.unshift(np);
        window._invCurrentPage = 1;
        if (stockFinal > 0) registrarMovimiento({ productoId: np.id, productoNombre: np.name,
            tipo: 'creacion', cantidad: stockFinal, motivo: 'Alta de materia prima', stockAntes: 0, stockDespues: stockFinal });
        saveProducts(); renderInventoryTable();
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof updateDashboard === 'function') updateDashboard();
        closeMateriaPrimaModal();
        if (window.MKS) MKS.notify();
        manekiToastExport('✅ Materia prima agregada','ok');
    }
}
window.guardarMateriaPrima = guardarMateriaPrima;

// ── Cascada de costo: cuando cambia el costo de una MP, recalcula los PT que la usan ──
function _cascadeCostMP(mpId, nuevoCosto) {
    const actualizados = [];
    (window.products||[]).forEach(p => {
        if (p.tipo === 'materia_prima' || p.tipo === 'servicio') return;
        if (!Array.isArray(p.mpComponentes) || !p.mpComponentes.length) return;
        const comp = p.mpComponentes.find(c => String(c.id) === String(mpId));
        if (!comp) return;
        const costoAntes = p.cost || 0;
        comp.costUnit = nuevoCosto;
        const nuevoCostoTotal = p.mpComponentes.reduce((s, c) => s + ((c.costUnit||0) * (c.qty||1)), 0);
        p.cost = Math.round(nuevoCostoTotal * 100) / 100;
        if (!p.historialPrecios) p.historialPrecios = [];
        p.historialPrecios.push({ fecha: new Date().toISOString(), costoAntes, costoNuevo: p.cost, precioAntes: p.price, precioNuevo: p.price });
        actualizados.push(p.name);
    });
    if (actualizados.length)
        manekiToastExport(`💰 Costo recalculado en: ${actualizados.join(', ')}`, 'ok');

    // Advertir si algún pedido activo usa los PT cuyo costo acaba de cambiar
    const ptActualizados = (window.products||[])
        .filter(p => (p.mpComponentes||[]).some(c => String(c.id) === String(mpId)));
    const ptIds = new Set(ptActualizados.map(p => String(p.id)));

    const pedidosAfectados = (window.pedidos||[]).filter(p =>
        !['cancelado','finalizado'].includes(p.status||'') &&
        (p.productosInventario||[]).some(item => ptIds.has(String(item.id)))
    );

    if (pedidosAfectados.length > 0) {
        const folios = pedidosAfectados.map(p => p.folio||p.id).join(', ');
        manekiToastExport(
            `💡 ${pedidosAfectados.length} pedido(s) activo(s) usan productos afectados por este cambio de costo (${folios}). Revisa sus precios.`,
            'warn'
        );
    }
}
window._cascadeCostMP = _cascadeCostMP;

// ── Cascada de variantes: cuando se edita una MP, sincroniza sus variantes
//    a todos los PTs que la usan como componente ──────────────────────────
function _cascadeVariantesMP(mpId, variants) {
    if (!Array.isArray(variants) || !variants.length) return;
    const actualizados = [];
    (window.products || []).forEach(p => {
        if (p.tipo === 'materia_prima' || p.tipo === 'servicio') return;
        if (!Array.isArray(p.mpComponentes) || !p.mpComponentes.length) return;
        if (!p.mpComponentes.some(c => String(c.id) === String(mpId))) return;
        // Sincronizar: nuevas variantes de MP → PT, conservando qty del PT si ya existía
        p.variants = variants.map(mpV => {
            const prev = (p.variants || []).find(pV =>
                (pV.type||pV.tipo) === (mpV.type||mpV.tipo) &&
                (pV.value||pV.valor) === (mpV.value||mpV.valor)
            );
            return prev ? { ...mpV, qty: prev.qty ?? mpV.qty } : { ...mpV };
        });
        p.usaVariantes = true;
        actualizados.push(p.name);
    });
    if (actualizados.length)
        manekiToastExport(`🎨 Variantes sincronizadas en: ${actualizados.join(', ')}`, 'ok');
}
window._cascadeVariantesMP = _cascadeVariantesMP;

// ── editProduct unificado (detecta tipo y abre modal correcto) ─────────────
function editProduct(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) { console.warn('editProduct: no encontrado', id); return; }

    if (p.tipo === 'materia_prima') {
        // Editar en modal de materia prima
        injectMpModal();
        window.modoEdicion = true; window.edicionProductoId = id;
        window.currentProductImage = p.imageUrl || null;
        window.currentProductImageFile = null;
        window._mpTagsActuales = [...(p.tags || [])];

        setTimeout(() => {
            const form = document.getElementById('mpForm');
            if (form) form.reset();
            const set = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v ?? ''; };
            set('mpNombre',      p.name);
            set('mpSku',         p.sku||'');
            set('mpStock',       p.stock||0);
            set('mpStockMin',    p.stockMin||5);
            set('mpProveedor',   p.proveedor||'');
            set('mpProveedorUrl',p.proveedorUrl||'');
            set('mpNotas',       p.notas||'');
            setTimeout(() => { const su = document.getElementById('mpUnidad'); if (su) su.value = p.unidad||'pza'; }, 10);

            // Restaurar modo paquete si aplica
            const paqChk = document.getElementById('mpUsaPaquete');
            if (p.compraPaquete && p.compraPaquete.cantidad > 0) {
                if (paqChk) { paqChk.checked = true; mpTogglePaquete(); }
                set('mpPaqueteCantidad', p.compraPaquete.cantidad);
                set('mpPaquetePrecio',   p.compraPaquete.precio);
                mpCalcCostoUnidad();
            } else {
                if (paqChk) { paqChk.checked = false; mpTogglePaquete(); }
                set('mpCosto', p.cost||0);
            }

            // Restaurar variantes si las tiene
            if (p.usaVariantes && Array.isArray(p.variants) && p.variants.length > 0) {
                window._mpVariantes = [...p.variants];
                const chk = document.getElementById('mpUsaVariantes');
                if (chk) { chk.checked = true; mpToggleVariantes(); }
                renderVariantesMp();
            } else {
                _resetMpVariantesUI();
                set('mpStock', p.stock||0); // <-- Restaurar porque _resetMpVariantesUI pone en 0
            }

            const preImg = document.getElementById('mpPreviewImg');
            const preDiv = document.getElementById('mpImagePreview');
            if (p.imageUrl && preImg) { preImg.src = p.imageUrl; if(preDiv) preDiv.classList.remove('hidden'); }
            else if (preDiv) preDiv.classList.add('hidden');

            const chkEmpaque = document.getElementById('mpEsEmpaque');
            if (chkEmpaque) chkEmpaque.checked = !!p.esEmpaque;

            renderMpTags();

            const title = document.querySelector('#mpModal h3');
            if (title) title.textContent = '🏭 Editar Materia Prima';
            const btn = document.getElementById('mpSubmitBtn');
            if (btn) btn.textContent = '💾 Guardar Cambios';

            if (typeof openModal === 'function') openModal('mpModal');
        }, 150);

    } else if (p.tipo === 'producto_variable') {
        // ── Editar Producto Variable ───────────────────────────────────────
        if (typeof injectVariableProductModal === 'function') injectVariableProductModal();
        if (typeof openVariableProductModal === 'function') openVariableProductModal(id);
    } else {
        // ── Editar Producto Terminado → nuevo ptModal ──────────────────────
        injectPtModal();
        window.modoEdicion = true; window.edicionProductoId = id;
        window._ptVariants      = Array.isArray(p.variants) ? [...p.variants] : [];
        window._ptMpComponentes = Array.isArray(p.mpComponentes) ? [...p.mpComponentes] : [];
        window._ptTagsActuales  = [...(p.tags||[])];
        window.currentVariants  = [...window._ptVariants];
        window.currentProductImage     = p.imageUrl || null;
        window.currentProductImageFile = null;
        window._ptGaleriaUrls  = Array.isArray(p.imageUrls) ? [...p.imageUrls] : [];
        window._ptGaleriaFiles = [];

        setTimeout(() => {
            const set = (eid, v) => { const el=document.getElementById(eid); if(el) el.value=v??''; };
            set('ptNombre', p.name);
            set('ptSku',    p.sku||'');
            set('ptCosto',    p.cost||0);
            set('ptPrecio',   p.price||0);
            set('ptStockMin', p.stockMin ?? 5);
            set('ptRendimientoPorHoja', p.rendimientoPorHoja || '');
            // Mejora 1: campos de proveedor (inyectados con 80ms delay en injectPtModal)
            setTimeout(() => {
                set('ptProveedorNombre', p.proveedorNombre || '');
                set('ptProveedorNotas',  p.proveedorNotas  || '');
            }, 200);
            poblarCategoriasPt();
            setTimeout(()=>{ const s=document.getElementById('ptCategory'); if(s) s.value=p.category; },80);
            if (p.imageUrl) {
                const img=document.getElementById('ptPreviewImg'); const pre=document.getElementById('ptImagePreview');
                if(img) img.src=p.imageUrl; if(pre) pre.classList.remove('hidden');
            }
            ptRenderGaleria();
            renderTagsPt();
            renderVariantsListPt();
            renderPtMpList();
            recalcularCostoPt();
            ptMostrarMargenInfo();
            // Cargar estado del toggle "Publicar en tienda"
            const chk = document.getElementById('ptPublicarTienda');
            const track = document.getElementById('ptToggleTrack');
            const thumb = document.getElementById('ptToggleThumb');
            if (chk) {
                chk.checked = p.publicarTienda === true || p.tipo === 'producto';
                if (track) track.style.background = chk.checked ? '#10b981' : '#d1d5db';
                if (thumb) thumb.style.transform  = chk.checked ? 'translateX(22px)' : 'translateX(0)';
            }
            const title=document.querySelector('#ptModal h3');
            if(title) title.textContent='✏️ Editar Producto Terminado';
            const btn=document.getElementById('ptSubmitBtn');
            if(btn) btn.textContent='💾 Guardar Cambios';
        }, 120);

        if (typeof openModal==='function') openModal('ptModal');
    }
}
window.editProduct = editProduct;

// ── Form submit de PRODUCTO TERMINADO ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // ── Migración one-shot: recuperar historial viejo de localStorage ─────
    // Si stockMovimientos ya tiene datos (cargados de Supabase/SQLite), no hacer nada.
    // Si está vacío y hay datos viejos en mkStockMovements, migrarlos y guardar.
    setTimeout(() => {
        try {
            const oldRaw = localStorage.getItem('mkStockMovements');
            if (oldRaw) {
                const oldMovs = JSON.parse(oldRaw);
                if (Array.isArray(oldMovs) && oldMovs.length > 0) {
                    if (!window.stockMovements || window.stockMovements.length === 0) {
                        // Datos nuevos vacíos y hay datos viejos → migrar completo
                        window.stockMovements = oldMovs;
                        window.stockMovimientos = oldMovs;
                        saveStockMovements();
                        console.log('[Migración] stockMovements: ' + oldMovs.length + ' movimientos migrados a SQLite/Supabase.');
                    }
                    // Borrar la copia vieja en cualquier caso
                    localStorage.removeItem('mkStockMovements');
                }
            }
        } catch(e) { console.warn('[Migración] Error migrando stockMovements:', e); }
    }, 3000); // Esperar a que config.js termine de cargar stockMovimientos

    // Inyectar modales al cargar el DOM
    injectMpModal();
    injectPtModal();

    // Iniciar listener de imagen
    setupImageUpload();

    // ── Reset de página al usar filtros/búsqueda ──────────────────────────
    const filterIds = ['inventorySearch', 'inventoryTagFilter', 'inventoryTipoFilter', 'inventoryProveedorFilter'];
    filterIds.forEach(id => {
        // Intentar adjuntar ahora y también con delay (por si el HTML carga después)
        function attachFilter() {
            const el = document.getElementById(id);
            if (el && !el._invPagListenerAdded) {
                el.addEventListener('input',  () => { window._invCurrentPage = 1; renderInventoryTable(); });
                el.addEventListener('change', () => { window._invCurrentPage = 1; renderInventoryTable(); });
                el._invPagListenerAdded = true;
            }
        }
        attachFilter();
        setTimeout(attachFilter, 800);
        setTimeout(attachFilter, 2000);
    });

    // Primer intento inmediato y reintento con delay
    setTimeout(patchInventoryButtons, 400);
    setTimeout(patchInventoryButtons, 1500);

    // ── MutationObserver: detecta cuando la sección inventario se hace visible ──
    // Esto es independiente de showSection y funciona sin importar qué archivo
    // parchea qué — si el inventario aparece en el DOM, ejecutamos el patch.
    const _invSection = document.getElementById('inventorySection') || 
                        document.querySelector('section[id*="inventor"]') ||
                        document.querySelector('[data-section="inventory"]');
    if (_invSection) {
        const _observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'class' || m.attributeName === 'style') {
                    const el = m.target;
                    const isVisible = !el.classList.contains('hidden') && 
                                      el.style.display !== 'none' &&
                                      el.offsetParent !== null;
                    if (isVisible) setTimeout(patchInventoryButtons, 80);
                }
            }
        });
        _observer.observe(_invSection, { attributes: true });
    }

    // ── Poll para hookear showSection DESPUÉS de que design-system.js lo parchó ──
    // design-system.js parchea showSection con un intervalo de 250ms hasta 40 intentos (~10s)
    // Nosotros esperamos a que el patch de design-system esté listo y luego agregamos el nuestro encima
    let _hookAttempts = 0;
    const _hookPoll = setInterval(() => {
        if (window.showSection && !window.showSection._mkInvPatched) {
            const _prev = window.showSection;
            window.showSection = function(name) {
                _prev.apply(this, arguments);
                if (name === 'inventory') setTimeout(patchInventoryButtons, 100);
            };
            window.showSection._mk4 = true;          // mantener flag de design-system
            window.showSection._mkInvPatched = true;  // nuestro flag
            clearInterval(_hookPoll);
        }
        if (++_hookAttempts > 60) clearInterval(_hookPoll); // timeout 15s
    }, 250);

    // El submit del form addProductForm ya no se usa — el nuevo ptModal tiene su propio botón
    // Mantenemos el listener por si hay código legacy que lo use, pero redirigimos a ptModal
    const legacyForm = document.getElementById('addProductForm');
    if (legacyForm && !legacyForm._mkSubmitBound) {
        legacyForm._mkSubmitBound = true;
        legacyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Redirigir al nuevo modal
            openAddProductModal();
        });
    }
});

// ── Parchar los botones del header de inventario ───────────────────────────
function patchInventoryButtons() {
    const btn = document.querySelector('[onclick="openAddProductModal()"]');
    if (!btn) return;
    const parent = btn.parentElement;

    // Botón Producto Terminado — siempre actualizar texto con emoji
    btn.innerHTML = '📦 Producto Terminado';
    btn.title = 'Agregar producto terminado';

    // Arreglar iconos de botones del header (siempre, no solo una vez)
    // Font Awesome NO funciona en innerHTML dinámico de JS → usamos emojis universales
    const iconFixes = [
        { selector: '[onclick="toggleMovimientos()"]',                html: '🕐 Movimientos' },
        { selector: '[onclick="imprimirInventario()"]',               html: '🖨️ Imprimir' },
        { selector: '[onclick="manekiExportar(\'inventario\')"]',     html: '📊 Exportar Excel' },
    ];
    iconFixes.forEach(({ selector, html }) => {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html; // sin flag — refrescar siempre
    });

    // Botón Materia Prima — agregar solo si no existe ya
    if (!parent.querySelector('[data-mp-btn]')) {
        const mpBtn = document.createElement('button');
        mpBtn.setAttribute('data-mp-btn', '1');
        mpBtn.onclick = () => { injectMpModal(); openAddMateriaPrimaModal(); };
        mpBtn.className = 'px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2';
        mpBtn.style.cssText = 'background:linear-gradient(135deg,#7c3aed,#a855f7);';
        mpBtn.innerHTML = '🧪 Materia Prima';
        mpBtn.title = 'Agregar materia prima';
        parent.insertBefore(mpBtn, btn);
    }
}
window.patchInventoryButtons = patchInventoryButtons;

// ── Descuento automático de MP al vender un Producto Terminado ────────────
// Llamado desde pos.js al procesar un pago. 
// products: [{id, quantity}] — lista de productos vendidos con sus cantidades
function descontarMpPorVenta(productoId, cantidadVendida) {
    const pt = (window.products||[]).find(p=>String(p.id)===String(productoId));
    if (!pt || !pt.mpComponentes || !pt.mpComponentes.length) return;

    pt.mpComponentes.forEach(comp => {
        const mp = (window.products||[]).find(p=>String(p.id)===String(comp.id));
        if (!mp) return;
        const consumo = comp.qty * cantidadVendida;
        const antes = mp.stock||0;
        mp.stock = Math.max(0, antes - consumo);
        registrarMovimiento({
            productoId: mp.id,
            productoNombre: mp.name,
            tipo: 'salida',
            cantidad: -consumo,
            motivo: `Venta de "${pt.name}" ×${cantidadVendida}`,
            stockAntes: antes,
            stockDespues: mp.stock
        });
    });
    saveProducts();
}
window.descontarMpPorVenta = descontarMpPorVenta;

// Hook automático: parchear processPayment para descontar MP
(function _hookProcessPayment() {
    let _att = 0;
    const _poll = setInterval(() => {
        if (window.processPayment && !window.processPayment._mkMpHooked) {
            const _orig = window.processPayment;
            window.processPayment = function() {
                // Capturar ticket ANTES de que se limpie
                const items = window.ticket || [];
                const result = _orig.apply(this, arguments);
                // Descontar MP por cada producto terminado vendido
                items.forEach(item => {
                    const prod = (window.products||[]).find(p=>String(p.id)===String(item.id));
                    if (prod && (prod.tipo==='producto' || prod.tipo==='producto_interno' || prod.tipo==='pack') && prod.mpComponentes && prod.mpComponentes.length) {
                        descontarMpPorVenta(item.id, item.quantity||1);
                    }
                });
                // Recalcular disponibilidad si el modal PT está abierto
                if (document.getElementById('ptModal') && !document.getElementById('ptModal').classList.contains('hidden')) {
                    setTimeout(calcularDisponibilidadPt, 200);
                }
                return result;
            };
            window.processPayment._mkMpHooked = true;
            window.processPayment._mk4 = true;
            clearInterval(_poll);
        }
        if (++_att > 60) clearInterval(_poll);
    }, 300);
})();

// ── Ajustar stock ──────────────────────────────────────────────────────────
function ajustarStock(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) return;

    // Guardar en múltiples lugares para asegurar que no se pierda
    window._ajustarStockId = String(id);
    window.__ajustarStockIdBackup = String(id);

    const n = document.getElementById('ajustarStockNombre');
    const a = document.getElementById('ajustarStockActual');
    const c = document.getElementById('ajustarStockCantidad');
    const m = document.getElementById('ajustarStockMotivo');
    if (n) n.textContent = p.name;
    if (a) a.textContent = getStockEfectivo(p);
    if (c) { c.value = ''; setTimeout(() => c.focus && c.focus(), 250); }
    if (m) m.value = '';
    const prEl = document.getElementById('ajusteStockPuntoReorden');
    if (prEl) prEl.value = p.puntoReorden != null ? p.puntoReorden : '';

    // Guardar id en data attribute del modal como respaldo adicional
    const modal = document.getElementById('ajustarStockModal');
    if (modal) modal.dataset.productId = String(id);

    // Inyectar campo Motivo (select) y Notas si no existen aún
    _inyectarCamposAjusteStock(modal);

    // Renderizar últimos movimientos del producto
    _renderUltimosMovimientosProducto(id, modal);

    if (typeof openModal === 'function') openModal('ajustarStockModal');
}
window.ajustarStock = ajustarStock;

// Inyecta los campos extra de Motivo y Notas en el modal de ajuste de stock
function _inyectarCamposAjusteStock(modal) {
    if (!modal || modal.querySelector('#ajusteStockMotivoSelect')) return;
    // Encontrar el contenedor .space-y-3 para insertar los campos
    const spaceY = modal.querySelector('.space-y-3');
    if (!spaceY) return;

    // Insertar antes del botón de punto de reorden (que tiene style margin-top:12px)
    const prDiv = spaceY.querySelector('#ajusteStockPuntoReorden')?.parentElement;

    const motivoDiv = document.createElement('div');
    motivoDiv.id = '_ajusteStockExtraFields';
    motivoDiv.innerHTML = `
        <div style="margin-top:10px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Motivo del ajuste</label>
            <select id="ajusteStockMotivoSelect"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;background:#fff;cursor:pointer;">
                <option value="">— Selecciona un motivo —</option>
                <option value="Merma">Merma</option>
                <option value="Muestra/Regalo">Muestra / Regalo</option>
                <option value="Ajuste de conteo">Ajuste de conteo</option>
                <option value="Devolución a proveedor">Devolución a proveedor</option>
                <option value="Entrada de mercancía">Entrada de mercancía</option>
                <option value="Otro">Otro</option>
            </select>
        </div>
        <div style="margin-top:8px;">
            <label style="font-size:.82rem;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Notas adicionales <span style="font-weight:400;color:#9ca3af;">(opcional)</span></label>
            <input type="text" id="ajusteStockNotasExtra" placeholder="Ej: Lote dañado por humedad"
                style="width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.85rem;outline:none;">
        </div>`;

    if (prDiv) {
        spaceY.insertBefore(motivoDiv, prDiv);
    } else {
        spaceY.appendChild(motivoDiv);
    }
}
window._inyectarCamposAjusteStock = _inyectarCamposAjusteStock;

// Renderiza los últimos 5 movimientos del producto en el modal de ajuste
function _renderUltimosMovimientosProducto(productoId, modal) {
    if (!modal) return;
    const existente = modal.querySelector('#_ajusteUltMovimientos');
    if (!existente) {
        // Crear el bloque de últimos movimientos al final del contenido del modal
        const inner = modal.querySelector('.bg-white');
        if (!inner) return;
        const div = document.createElement('div');
        div.id = '_ajusteUltMovimientos';
        div.style.cssText = 'margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;';
        inner.appendChild(div);
    }
    const container = modal.querySelector('#_ajusteUltMovimientos');
    if (!container) return;

    const movs = (window.stockMovements || [])
        .filter(m => String(m.productoId) === String(productoId))
        .slice(0, 5);

    if (!movs.length) {
        container.innerHTML = `<p style="font-size:.72rem;color:#9ca3af;text-align:center;padding:8px 0;">Sin movimientos registrados</p>`;
        return;
    }
    const icons = { entrada:'🟢', salida:'🔴', ajuste:'🟡', creacion:'🔵', venta:'🟠', merma:'🟤' };
    container.innerHTML = `
        <p style="font-size:.72rem;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Últimos movimientos</p>
        ${movs.map(m => {
            const f = new Date(m.fecha).toLocaleString('es-MX', {dateStyle:'short', timeStyle:'short'});
            const s = m.cantidad >= 0 ? `+${m.cantidad}` : `${m.cantidad}`;
            return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f9fafb;font-size:.75rem;">
                <span style="font-size:13px;">${icons[m.tipo]||'⚪'}</span>
                <div style="flex:1;min-width:0;">
                    <span style="font-weight:600;color:#374151;">${m.tipo}</span>
                    <span style="color:#9ca3af;margin-left:4px;">${_esc(m.motivo||'')}</span>
                    <div style="color:#9ca3af;font-size:.68rem;">${f}</div>
                </div>
                <span style="font-weight:700;color:${m.cantidad>=0?'#10b981':'#ef4444'};white-space:nowrap;">${s} uds</span>
            </div>`;
        }).join('')}`;
}
window._renderUltimosMovimientosProducto = _renderUltimosMovimientosProducto;

function confirmarAjusteStock() {
    // Leer id desde múltiples fuentes en orden de prioridad
    const modal = document.getElementById('ajustarStockModal');
    const rawId = (modal && modal.dataset.productId)
        || window._ajustarStockId
        || window.__ajustarStockIdBackup;

    if (!rawId) { manekiToastExport('❌ Error: no se encontró el producto', 'err'); return; }

    const p = (window.products||[]).find(x => String(x.id) === String(rawId));
    if (!p) { manekiToastExport('❌ Error: producto no encontrado', 'err'); return; }

    const cantEl  = document.getElementById('ajustarStockCantidad');
    const motEl   = document.getElementById('ajustarStockMotivo');
    const motSelEl = document.getElementById('ajusteStockMotivoSelect');
    const notasEl  = document.getElementById('ajusteStockNotasExtra');
    if (!cantEl) { manekiToastExport('❌ Error: formulario no disponible', 'err'); return; }

    const delta  = parseInt(cantEl.value);
    // Motivo: primero el select, luego el texto libre, luego vacío
    const motivoSelect = motSelEl ? motSelEl.value.trim() : '';
    const motivoTexto  = motEl ? motEl.value.trim() : '';
    const motivo = motivoSelect || motivoTexto || '';
    const notas  = notasEl ? notasEl.value.trim() : '';

    if (isNaN(delta) || cantEl.value.trim() === '') {
        manekiToastExport('⚠️ Ingresa una cantidad válida (+para agregar / -para restar)', 'warn');
        cantEl.focus && cantEl.focus();
        return;
    }

    const antes = getStockEfectivo(p); // Effective total stock before
    const _stockOriginal = parseInt(p.stock) || 0;
    p.stock = Math.max(0, _stockOriginal + delta);

    // Si tiene variantes, ajustar la primera disponible
    if (p.variants && p.variants.length > 0 && delta !== 0) {
        if (delta > 0) {
            p.variants[0].qty = (p.variants[0].qty || 0) + delta;
        } else {
            let restante = Math.abs(delta);
            for (const v of p.variants) {
                const quitar = Math.min(v.qty || 0, restante);
                v.qty = (v.qty || 0) - quitar;
                restante -= quitar;
                if (restante <= 0) break;
            }
        }
        syncStockFromVariants(p);
    }

    const despues = getStockEfectivo(p); // Effective total stock after
    registrarMovimiento({
        productoId: p.id, productoNombre: p.name,
        tipo: delta >= 0 ? 'entrada' : 'salida',
        cantidad: delta, motivo,
        stockAntes: antes, stockDespues: despues
    });

    // FIX-2 + FIX-5: Registrar en movimientosStock (array canónico) con estructura completa
    window.movimientosStock = window.movimientosStock || [];
    const motivoEl  = document.getElementById('ajusteStockMotivoSelect');
    const notasEl2  = document.getElementById('ajusteStockNotasExtra');
    const _mvEntry = {
        id: Date.now() + Math.random(),
        fecha: (typeof _fechaHoy === 'function' ? _fechaHoy() : new Date().toISOString().split('T')[0]),
        productoId: p.id,
        productoNombre: p.name || p.nombre,
        deltaStock: delta,
        stockResultante: despues,
        motivo: motivoEl ? motivoEl.value : (motivo || 'Ajuste manual'),
        notas: notasEl2 ? notasEl2.value : notas,
        usuario: 'local'
    };
    window.movimientosStock.unshift(_mvEntry);
    if (window.movimientosStock.length > 200) window.movimientosStock = window.movimientosStock.slice(0, 200);
    if (typeof sbSave === 'function') sbSave('movimientosStock', window.movimientosStock);
    else if (typeof guardarDatos === 'function') guardarDatos();

    // Guardar punto de reorden si se ingresó
    const prEl = document.getElementById('ajusteStockPuntoReorden');
    if (prEl && prEl.value.trim() !== '') {
        const pr = parseInt(prEl.value);
        if (!isNaN(pr) && pr >= 0) p.puntoReorden = pr;
    }

    saveProducts();
    renderInventoryTable();
    if (typeof renderProducts  === 'function') renderProducts();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof closeModal      === 'function') closeModal('ajustarStockModal');

    // Limpiar backups
    window._ajustarStockId = null;
    window.__ajustarStockIdBackup = null;
    if (modal) delete modal.dataset.productId;

    if (window.MKS) MKS.tick();
    manekiToastExport(`✅ Stock de "${p.name}": ${antes} → ${p.stock}`, 'ok');
}
window.confirmarAjusteStock = confirmarAjusteStock;

// Alias para cerrar el modal (el HTML usaba este nombre)
function closeAjustarStockModal() {
    if (typeof closeModal === 'function') closeModal('ajustarStockModal');
    else {
        const m = document.getElementById('ajustarStockModal');
        if (m) m.style.display = 'none';
    }
    window._ajustarStockId = null;
    window.__ajustarStockIdBackup = null;
    const modal = document.getElementById('ajustarStockModal');
    if (modal) delete modal.dataset.productId;
}
window.closeAjustarStockModal = closeAjustarStockModal;

// ── Margen sugerido ────────────────────────────────────────────────────────
function aplicarMargen(margen) {
    if (!margen||isNaN(margen)||margen<=0) { manekiToastExport('Margen inválido','err'); return; }
    const costo = parseFloat(document.getElementById('productCost').value);
    if (!costo||costo<=0) { manekiToastExport('Primero ingresa el costo','warn'); return; }
    const precio = costo / (1 - margen/100);
    document.getElementById('productPrice').value = precio.toFixed(2);
    const lbl = document.getElementById('precioSugeridoLabel');
    if (lbl) lbl.textContent = `💡 Con ${margen}% de margen: costo $${costo.toFixed(2)} → precio $${precio.toFixed(2)} (ganancia $${(precio-costo).toFixed(2)})`;
}
window.aplicarMargen = aplicarMargen;

// ── Cambiar tipo: materia prima ↔ producto terminado ───────────────────────
function cambiarTipoProducto(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) return;
    const esMat = (p.tipo||'producto') === 'materia_prima';
    const nuevoTipo = esMat ? 'producto' : 'materia_prima';
    const label = esMat ? 'Producto Terminado 📦' : 'Materia Prima 🏭';

    // Si va a convertirse a MP, verificar pedidos activos donde esté como PT/PV
    if (!esMat) {
        const pedidosConEsteProducto = (window.pedidos||[]).filter(ped =>
            !['cancelado','finalizado'].includes(ped.status||'') &&
            (ped.productosInventario||[]).some(item => String(item.id) === String(id))
        );
        if (pedidosConEsteProducto.length > 0) {
            const folios = pedidosConEsteProducto.map(ped => ped.folio||ped.id).join(', ');
            const forzar = confirm(`⚠️ "${p.name}" está en ${pedidosConEsteProducto.length} pedido(s) activo(s):\n${folios}\n\nConvertirlo a Materia Prima puede romper esos pedidos. ¿Continuar de todas formas?`);
            if (!forzar) return;
        }
    }

    showConfirm(
        `¿Cambiar "${p.name}" a ${label}?\n\n${esMat ? 'Se habilitará precio de venta y variantes.' : 'Se ocultará precio de venta. Solo se usará el costo.'}`,
        `Convertir a ${label}`
    ).then(ok => {
        if (!ok) return;
        p.tipo = nuevoTipo;
        if (nuevoTipo === 'materia_prima') {
            p.price = 0;
            p.variants = [];
            // Sincronizar stock (sin variantes)
        } else {
            // Al convertir a terminado, si no tiene precio, ponemos el doble del costo como sugerido
            if (!p.price || p.price <= 0) p.price = (p.cost || 0) * 2;
        }
        saveProducts();
        renderInventoryTable();
        if (typeof renderProducts === 'function') renderProducts();
        manekiToastExport(`✅ "${p.name}" ahora es ${label}`, 'ok');
    });
}
window.cambiarTipoProducto = cambiarTipoProducto;

// ── Eliminar ───────────────────────────────────────────────────────────────
function deleteProduct(id) {
    const p = (window.products||[]).find(x => String(x.id) === String(id));
    if (!p) return;

    // Verificar pedidos activos ANTES de confirmar eliminación
    const pedidosConEsteProducto = (window.pedidos||[]).filter(p =>
        !['cancelado','finalizado'].includes(p.status||'') &&
        (p.productosInventario||[]).some(item => String(item.id) === String(id))
    );
    if (pedidosConEsteProducto.length > 0) {
        const folios = pedidosConEsteProducto.map(p => p.folio||p.id).join(', ');
        const forzar = confirm(`⚠️ Este producto está en ${pedidosConEsteProducto.length} pedido(s) activo(s):\n${folios}\n\nEliminar puede romper esos pedidos. ¿Continuar de todas formas?`);
        if (!forzar) return;
    }

    const kits = (window.products||[]).filter(k =>
        k.isKit && k.kitComponentes && k.kitComponentes.some(c => String(c.id) === String(id)));
    const pedidosActivos = pedidosConEsteProducto;
    let msg = `¿Eliminar "${p.name}"?`;
    if (p.stock > 0) msg += `\n\nTiene ${p.stock} unidades en stock.`;
    if (kits.length) msg += `\n\n⚠️ Es componente de ${kits.length} kit(s): ${kits.map(k=>k.name).join(', ')}.`;
    if (pedidosActivos.length) msg += `\n\n🚨 Está en ${pedidosActivos.length} pedido(s) activo(s): ${pedidosActivos.map(o=>o.folio||o.id).join(', ')}. Eliminar el producto puede afectar esos pedidos.`;
    msg += '\n\nEsta acción no se puede deshacer.';
    showConfirm(msg, '🗑️ Eliminar producto permanentemente').then(async ok => {
        if (!ok) return;
        if (window.MKS) MKS.del();
        window.products = window.products.filter(x => String(x.id) !== String(id));
        try { products = window.products; } catch(e) {}
        saveProducts(); renderInventoryTable();
        if (typeof renderProducts  === 'function') renderProducts();
        if (typeof updateDashboard === 'function') updateDashboard();
        // Borrar de la tabla relacional para que desaparezca de la página web
        try {
            await db.from('products').delete().eq('id', String(id));
        } catch(e) {
            console.warn('deleteProduct: no se pudo borrar de products:', e);
        }
        manekiToastExport(`🗑️ "${p.name}" eliminado`,'ok');
    });
}
window.deleteProduct = deleteProduct;

// ── Helpers para calcular disponibilidad de PT desde sus MPs ─────────────────
function calcularDisponibilidadDesdeMP(product) {
    if (!product.mpComponentes || product.mpComponentes.length === 0) return null;
    // Si todos los componentes son servicios, no hay MPs que limiten — tratar como sin MPs
    const tieneMpFisica = product.mpComponentes.some(c => {
        const p = (window.products||[]).find(x => String(x.id) === String(c.id));
        return !p || p.tipo !== 'servicio';
    });
    if (!tieneMpFisica) return null;
    let minPiezas = Infinity;
    const detalle = [];
    for (const comp of product.mpComponentes) {
        const mp = (window.products||[]).find(p => String(p.id) === String(comp.id));
        if (mp && mp.tipo === 'servicio') continue; // servicios no limitan disponibilidad
        if (!mp) {
            // Componente huérfano — MP fue eliminada
            product._tieneComponentesHuerfanos = true;
            continue;
        }
        const stockMp = mp ? getStockEfectivo(mp) : 0;
        const qtyNecesaria = comp.qty || 1;
        const piezasPosibles = Math.floor(stockMp / qtyNecesaria);
        detalle.push({ nombre: comp.nombre || (mp ? mp.name : '?'), stock: stockMp, qty: qtyNecesaria, posibles: piezasPosibles });
        if (piezasPosibles < minPiezas) minPiezas = piezasPosibles;
    }
    return { piezas: minPiezas === Infinity ? 0 : minPiezas, detalle };
}
window.calcularDisponibilidadDesdeMP = calcularDisponibilidadDesdeMP;

// ── Render tabla de inventario — separada en dos secciones independientes ──