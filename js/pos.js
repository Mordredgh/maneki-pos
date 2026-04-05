// ============== POS MODULE ==============
        
        let _posActiveCat = 'Todos';
        let _posSearchTimeout = null;

        function renderPosCategoryTabs() {
            const tabsEl = document.getElementById('posCategoryTabs');
            if (!tabsEl) return;
            // Only show tabs for finished products
            const vendibles = products.filter(p => p.tipo !== 'materia_prima' && p.tipo !== 'servicio') // BUG-004 FIX: campo correcto es p.tipo con valor 'materia_prima';
            const cats = ['Todos', ...new Set(vendibles.map(p => p.category).filter(Boolean))];
            tabsEl.innerHTML = cats.map(cat => `
                <button class="pos-cat-tab ${cat === _posActiveCat ? 'active' : ''}"
                        onclick="_posActiveCat='${cat.replace(/'/g,"\\'")}'; renderProducts();">
                    ${cat}
                </button>`).join('');
        }

        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            const countEl = document.getElementById('posProductCount');
            // Filter: exclude raw materials
            const vendibles = products.filter(p => p.tipo !== 'materia_prima' && p.tipo !== 'servicio') // BUG-004 FIX: campo correcto es p.tipo con valor 'materia_prima';
            // Apply category filter
            const searchTerm = (document.getElementById('searchProduct')?.value || '').toLowerCase();
            let filtered = _posActiveCat === 'Todos'
                ? vendibles
                : vendibles.filter(p => p.category === _posActiveCat);
            // Apply search filter
            if (searchTerm) {
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    (p.category || '').toLowerCase().includes(searchTerm) ||
                    (p.sku || '').toLowerCase().includes(searchTerm)
                );
            }

            if (countEl) countEl.textContent = filtered.length + ' producto(s)';

            if (filtered.length === 0) {
                grid.innerHTML = products.length === 0
                    ? `<div class="col-span-full">
  <div class="mk-empty">
    <div class="mk-empty-icon">📦</div>
    <p class="mk-empty-title">Sin productos en el catálogo</p>
    <p class="mk-empty-sub">Ve a Inventario para agregar tu primer producto antes de hacer ventas.</p>
    <div class="mk-empty-action">
      <button onclick="showSection('inventory')" class="btn-primary px-5 py-2 rounded-xl text-sm">Ir a Inventario →</button>
    </div>
  </div>
</div>`
                    : `<div class="col-span-full">
  <div class="mk-empty" style="padding:32px 24px;">
    <div class="mk-empty-icon" style="font-size:1.6rem;width:60px;height:60px;">🔍</div>
    <p class="mk-empty-title">Sin resultados</p>
    <p class="mk-empty-sub">Intenta con otro término de búsqueda.</p>
  </div>
</div>`;
                return;
            }

            grid.innerHTML = filtered.map(product => {
                const imageDisplay = product.imageUrl
                    ? `<img src="${product.imageUrl}" class="w-full h-24 object-cover rounded-lg mb-2" loading="lazy">`
                    : `<div class="text-4xl mb-3 text-center">${product.image}</div>`;
                // FIX: usar getStockEfectivo para que variantes cuenten correctamente
                const stockEf = typeof getStockEfectivo === 'function' ? getStockEfectivo(product) : (product.stock || 0);
                const stockClass = stockEf > 10 ? 'text-green-600' : stockEf > 0 ? 'text-orange-600' : 'text-red-600';
                const outOfStock = stockEf <= 0;
                return `
                    <div class="product-card bg-gray-50 rounded-xl p-4 border-2 ${outOfStock ? 'border-red-100 opacity-60' : 'border-transparent'} hover:shadow-lg ${outOfStock ? 'cursor-not-allowed' : ''}"
                         ${outOfStock ? 'style="pointer-events:none"' : `onclick="addToTicket(${product.id})"`}>
                        ${imageDisplay}
                        <h4 class="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">${product.name}</h4>
                        ${(product.tags && product.tags.length > 0) ? `<div class="flex flex-wrap gap-1 mb-1">${product.tags.map(t => `<span class="px-2 py-0 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-300">${t}</span>`).join('')}</div>` : ''}
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-bold" style="color: #E8B84B !important;">$${product.price.toFixed(2)}</span>
                            <span class="text-xs font-semibold ${stockClass}">
                                ${outOfStock ? '🚫 Agotado' : 'Stock: ' + stockEf}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');

            renderPosCategoryTabs();
        }
        
        function addToTicket(productId) {
            const product = products.find(p => String(p.id) === String(productId));
            if (!product) { manekiToastExport('Producto no encontrado', 'err'); return; }
            const _stockActual = typeof getStockEfectivo === 'function' ? getStockEfectivo(product) : (product.stock || 0);
            if (_stockActual <= 0) {
                manekiToastExport(`🚫 "${product.name}" está agotado`, 'err');
                return;
            }

            // ── Micro-interacción: "pop" en la card del producto ──
            const allCards = document.querySelectorAll('.product-card');
            allCards.forEach(card => {
                if (card.textContent.includes(product.name)) {
                    card.style.transition = 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.12s ease';
                    card.style.transform = 'scale(0.93)';
                    card.style.boxShadow = '0 2px 8px rgba(197,165,114,0.2)';
                    setTimeout(() => {
                        card.style.transform = 'scale(1.04)';
                        card.style.boxShadow = '0 8px 20px rgba(197,165,114,0.35)';
                        setTimeout(() => { card.style.transform = ''; card.style.boxShadow = ''; }, 150);
                    }, 100);
                }
            });
            
            const stockDisponible = _stockActual; // ya calculado arriba
            const existingItem = ticket.find(item => String(item.id) === String(productId));
            if (existingItem) {
                if (existingItem.quantity < stockDisponible) {
                    existingItem.quantity++;
                } else {
                    manekiToastExport(`Stock insuficiente — solo hay ${stockDisponible} piezas disponibles`, 'err');
                    return;
                }
            } else {
                ticket.push({ ...product, quantity: 1 });
            }
            
            renderTicket();
        }
        
        function renderTicket() {
            const container = document.getElementById('ticketItems');
            
            if (ticket.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:28px 12px;"><div style="font-size:2rem;margin-bottom:8px;opacity:0.35;">🛍️</div><p style="color:rgba(139,107,174,0.5);font-size:0.78rem;font-weight:500;">Selecciona productos<br>del catálogo</p></div>';
                updateTotals();
                return;
            }
            
            container.innerHTML = ticket.map((item, idx) => `
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl" style="animation: ticketItemIn 0.25s ${idx * 0.04}s cubic-bezier(0.34,1.4,0.64,1) both;">
                    <span class="text-2xl">${item.image}</span>
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-800 text-sm truncate">${item.name}</p>
                        <p class="text-xs text-gray-500">$${item.price.toFixed(2)} c/u</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="updateQuantity(${item.id}, -1)" 
                                class="w-6 h-6 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="w-8 text-center font-semibold">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" 
                                class="w-6 h-6 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                    <button onclick="removeFromTicket(${item.id})" 
                            class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            `).join('');
            
            updateTotals();
        }
        
        function updateQuantity(productId, change) {
            const item = ticket.find(i => String(i.id) === String(productId));
            const product = products.find(p => String(p.id) === String(productId));
            
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    removeFromTicket(productId);
                } else if (product) {
                    const stockMax = typeof getStockEfectivo === 'function' ? getStockEfectivo(product) : (product.stock || 0);
                    if (item.quantity > stockMax) {
                        item.quantity = stockMax;
                        manekiToastExport(`Stock máximo alcanzado (${stockMax} pzs)`, 'warn');
                    }
                }
                renderTicket();
            }
        }
        
        function removeFromTicket(productId) {
            ticket = ticket.filter(item => String(item.id) !== String(productId));
            renderTicket();
        }
        
        function updateTotals() {
            // FIX: evitar errores de punto flotante redondeando cada línea en centavos enteros
            const subtotal = window._sumLineas ? _sumLineas(ticket) :
                ticket.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const discountPercent = Math.min(100, Math.max(0, parseFloat(document.getElementById('discountPercent').value) || 0));
            const discountAmount = window._money ? _money(subtotal * discountPercent / 100) : subtotal * (discountPercent / 100);
            const subtotalAfterDiscount = window._money ? _money(subtotal - discountAmount) : subtotal - discountAmount;

            const includeTax = document.getElementById('includeTax').checked;
            const taxPercent = Math.min(100, Math.max(0, parseFloat(document.getElementById('taxPercent').value) || 0));
            const taxAmount = includeTax ? (window._money ? _money(subtotalAfterDiscount * taxPercent / 100) : subtotalAfterDiscount * (taxPercent / 100)) : 0;

            const total = window._money ? _money(subtotalAfterDiscount + taxAmount) : subtotalAfterDiscount + taxAmount;
            
            document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('discountAmount').textContent = `-$${discountAmount.toFixed(2)}`;
            document.getElementById('tax').textContent = `$${taxAmount.toFixed(2)}`;
            document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        }
        
        function selectPaymentMethod(method) {
            selectedPaymentMethod = method;
            document.querySelectorAll('.payment-method-btn').forEach(btn => {
                btn.classList.remove('border-gray-200');
                btn.style.borderColor = '#E5E7EB';
                btn.style.background = 'white';
            });
            const selectedBtn = event.target.closest('.payment-method-btn');
            selectedBtn.style.borderColor = '#C5A572';
            selectedBtn.style.background = '#FFF9F0';
        }
        
        // BUG-NEW-05 FIX: mutex para evitar doble cobro por doble click
        let _procesandoPago = false;

        function processPayment() {
            if (_procesandoPago) { manekiToastExport('Procesando pago, espera...', 'warn'); return; }
            _procesandoPago = true;
            if (ticket.length === 0) {
                manekiToastExport('Agrega productos al ticket primero', 'warn');
                _procesandoPago = false;
                return;
            }
            const btn = document.querySelector('button[onclick="processPayment()"]');
            const _donePayment = btnLoading(btn);
            try {
            const customerName = document.getElementById('customerName').value || 'Cliente General';
            const concept = document.getElementById('saleNotes').value || 'Venta de productos';
            const note = document.getElementById('saleNote').value || '';
            
            const subtotal = ticket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountPercent = Math.min(100, Math.max(0, parseFloat(document.getElementById('discountPercent').value) || 0));
            const discountAmount = subtotal * (discountPercent / 100);
            const subtotalAfterDiscount = subtotal - discountAmount;

            const includeTax = document.getElementById('includeTax').checked;
            const taxPercent = Math.min(100, Math.max(0, parseFloat(document.getElementById('taxPercent').value) || 0));
            const taxAmount = includeTax ? subtotalAfterDiscount * (taxPercent / 100) : 0;
            
            const total = subtotalAfterDiscount + taxAmount;
            
            // Descontar stock — con null guard y soporte para kits
            ticket.forEach(item => {
                const product = products.find(p => String(p.id) === String(item.id));
                if (!product) return; // guard: producto eliminado mientras estaba en ticket
                if (product.isKit && product.kitComponentes && product.kitComponentes.length > 0) {
                    // Descontar componentes del kit
                    product.kitComponentes.forEach(comp => {
                        const compProd = products.find(p => String(p.id) === String(comp.id));
                        if (compProd) compProd.stock = Math.max(0, compProd.stock - (comp.quantity * item.quantity));
                    });
                } else if (product.mpComponentes && product.mpComponentes.length > 0) {
                    // R2-C1 FIX: PT con mpComponentes — no descontar product.stock aquí.
                    // El hook en inventory-4.js llama descontarMpPorVenta() y descuenta el stock
                    // de las materias primas componentes. Descontar product.stock además sería
                    // una deducción doble (PT stock + MP stock para el mismo ítem vendido).
                } else {
                    product.stock = Math.max(0, product.stock - item.quantity);
                }
            });
            
            const paymentMethodNames = {
                'cash': 'Efectivo',
                'card': 'Tarjeta',
                'transfer': 'Transferencia'
            };
            
            // BUG-007 FIX: Usar crypto.randomUUID() en lugar de Date.now() para evitar colisiones
            const _saleId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + '-' + Math.random().toString(36).slice(2));
            const _saleFolioNum = salesHistory.reduce((max, s) => {
                const n = parseInt((s.folio || '').replace('V-', '')) || 0;
                return n > max ? n : max;
            }, 0) + 1;
            // BUG-POS-01 FIX: usar fecha local (no UTC) para evitar que ventas nocturnas
            // queden registradas con la fecha del día siguiente (UTC adelanta 6h en México)
            const _ahora = new Date();
            const _fechaVenta = `${_ahora.getFullYear()}-${String(_ahora.getMonth()+1).padStart(2,'0')}-${String(_ahora.getDate()).padStart(2,'0')}`;
            const saleRecord = {
                id: _saleId,
                folio: `V-${String(_saleFolioNum).padStart(6, '0')}`,
                date: _fechaVenta,
                time: _ahora.toLocaleTimeString('es-MX'),
                customer: customerName,
                concept: concept,
                note: note,
                products: ticket.map(item => ({
                    ...item,
                    costoAlVender: item.cost || 0  // BUG10 FIX: costo fijo al momento de la venta
                })),
                subtotal: subtotal,
                discount: discountAmount,
                discountPercent: discountPercent,
                tax: taxAmount,
                taxPercent: includeTax ? taxPercent : 0,
                total: total,
                method: paymentMethodNames[selectedPaymentMethod]
            };
            
            salesHistory.push(saleRecord);
            lastReceipt = saleRecord;
            
            // BUG-POS-02 FIX: marcar income de POS con fromPOS:true para que renderBalance()
            // no lo duplique con totalPOS (que ya lo cuenta desde salesHistory).
            incomes.push({
                id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
                concept: `Venta ${saleRecord.folio}`,
                amount: total,
                date: saleRecord.date,
                fromPOS: true
            });
            
            ticket.forEach(item => {
                registrarMovimiento(item.id, item.name, 'salida', item.quantity, `Venta POS ${saleRecord.folio}`);
            });
            saveProducts();
            saveSalesHistory();
            saveIncomes();

            // ===== NOTIFICACIONES DE STOCK BAJO =====
            if (ipcRenderer) {
                ticket.forEach(item => {
                    const prod = products.find(p => p.id === item.id);
                    if (prod && prod.stock === 0) {
                        ipcRenderer.send('notify-stock', prod.name + ' (AGOTADO)');
                    } else if (prod && prod.stock <= (prod.stockMin || 5)) {
                        ipcRenderer.send('notify-stock', prod.name);
                    }
                });
            }
            // ========================================

            // ===== MODO OFFLINE: guardar venta en SQLite si no hay conexión =====
            if (ipcRenderer && !navigator.onLine) {
                ipcRenderer.send('save-venta-pendiente', saleRecord);
                showToast('📴 Sin internet — venta guardada localmente, se sincronizará al reconectar', 'warn');
            }
            // ====================================================================
            
            generateReceipt(saleRecord);
            openModal('receiptModal');
            _donePayment(true);
            _procesandoPago = false;

            clearTicket();
            renderProducts();
            renderInventoryTable();
            updateDashboard();
            renderBalance();

            if (salesWeekChart) {
                salesWeekChart.destroy();
            }
            initChart();
            return true; // BUG-DS-01 FIX: señal a design-system para disparar confetti solo en éxito
            } catch(e) {
                _procesandoPago = false;
                if (typeof _donePayment === 'function') _donePayment(false);
                manekiToastExport('Error al procesar pago, intenta de nuevo', 'err');
                console.error('[processPayment] Error:', e);
                return false; // BUG-DS-01 FIX: señal a design-system para NO disparar confetti en error
            }
        }
        
        function clearTicket() {
            ticket = [];
            document.getElementById('customerName').value = '';
            document.getElementById('saleNotes').value = '';
            document.getElementById('saleNote').value = '';
            document.getElementById('discountPercent').value = '0';
            document.getElementById('includeTax').checked = false;
            renderTicket();
        }
        
        // ============== RECEIPT GENERATION ==============
        // BUG #9 FIX: storeConfig.name, sale.customer y otros campos se insertaban
        // directamente como innerHTML sin sanear, permitiendo XSS si un cliente
        // guardaba código malicioso en su nombre. Se usa _esc() para escapar.
        function _esc(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function generateReceipt(sale) {
            const receiptHTML = `
                <div class="receipt-header">
                    <div class="receipt-logo">
    ${storeConfig.logoMode === 'image' && storeConfig.logo
        ? `<img src="${_esc(storeConfig.logo)}" style="width:80px;height:80px;object-fit:contain;margin:0 auto;display:block;border-radius:12px;">`
        : _esc(storeConfig.emoji)}
</div>
                    <h1 class="text-3xl font-bold mb-2" style="color: #000;">${_esc(storeConfig.name)}</h1>
                    <p class="text-gray-600">${_esc(storeConfig.slogan)}</p>
                    ${storeConfig.phone || storeConfig.facebook || storeConfig.email ? `
                    <div class="mt-2 text-sm text-gray-500">
                        ${storeConfig.phone ? `<p>📱 ${_esc(storeConfig.phone)}</p>` : ''}
                        ${storeConfig.facebook ? `<p>📘 ${_esc(storeConfig.facebook)}</p>` : ''}
                        ${storeConfig.email ? `<p>✉️ ${_esc(storeConfig.email)}</p>` : ''}
                    </div>` : ''}
                    <div class="mt-4" style="background: #E6D5E6; padding: 8px 16px; border-radius: 8px; display: inline-block;">
                        <p class="text-sm font-bold" style="color: #E8B84B !important;">Folio: ${_esc(sale.folio)}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p class="text-sm text-gray-600">Cliente</p>
                        <p class="font-semibold text-gray-800">${_esc(sale.customer)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Fecha y Hora</p>
                        <p class="font-semibold text-gray-800">${_esc(sale.date)} ${_esc(sale.time)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Método de Pago</p>
                        <p class="font-semibold text-gray-800">${_esc(sale.method)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Concepto</p>
                        <p class="font-semibold text-gray-800">${_esc(sale.concept)}</p>
                    </div>
                </div>
                
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Precio</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.products.map(item => `
                            <tr>
                                <td>${_esc(item.name)}</td>
                                <td>${item.quantity}</td>
                                <td>$${Number(item.price||0).toFixed(2)}</td>
                                <td>$${(Number(item.price||0) * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="space-y-2 mt-6 text-right">
                    <div class="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>$${sale.subtotal.toFixed(2)}</span>
                    </div>
                    ${sale.discount > 0 ? `
                        <div class="flex justify-between text-red-600">
                            <span>Descuento (${sale.discountPercent}%):</span>
                            <span>-$${sale.discount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    ${sale.tax > 0 ? `
                        <div class="flex justify-between text-gray-700">
                            <span>IVA (${sale.taxPercent}%):</span>
                            <span>$${sale.tax.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-2xl font-bold pt-3 border-t-2" style="border-color: #C5A572; color: #000;">
                        <span>Total:</span>
                        <span>$${sale.total.toFixed(2)}</span>
                    </div>
                </div>
                
                ${sale.note ? `
                    <div class="mt-6 p-4 rounded-lg" style="background: #FFF9F0;">
                        <p class="text-sm font-semibold text-gray-700 mb-1">Nota:</p>
                        <p class="text-sm text-gray-600">${_esc(sale.note)}</p>
                    </div>
                ` : ''}
                
                <div class="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p class="text-sm text-gray-600">${storeConfig.footer}</p>
                    ${storeConfig.facebook ? `<p class="text-xs text-gray-500 mt-2">${storeConfig.facebook}</p>` : ''}
                </div>
            `;
            
            document.getElementById('receiptContent').innerHTML = receiptHTML;
        }
        
        function downloadReceipt() {
            const element = document.getElementById('receiptContent');
            const opt = {
                margin: 10,
                filename: `Maneki-${lastReceipt.folio}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().set(opt).from(element).save();
        }
        
        function printReceipt() {
            window.print();
        }
        
        function shareReceipt() {
            const shareText = `Comprobante de compra\n\nFolio: ${lastReceipt.folio}\nCliente: ${lastReceipt.customer}\nTotal: $${lastReceipt.total.toFixed(2)}\n\n¡Gracias por tu compra!`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Comprobante Maneki Store',
                    text: shareText,
                }).catch(err => console.log('Error sharing', err));
            } else {
                navigator.clipboard.writeText(shareText);
                manekiToastExport('✅ Texto copiado al portapapeles. Puedes pegarlo en WhatsApp o donde desees.', 'ok');
            }
        }
        
        function closeReceiptModal() {
            closeModal('receiptModal');
        }
        
        // ============== QUOTES MODULE ==============
        
        function openQuoteModal() {
            currentQuoteProducts = [];
            document.getElementById('quoteProductsContainer').innerHTML = '';
            openModal('quoteModal');
            updateQuoteTotal();
        }
        
        function closeQuoteModal() {
            closeModal('quoteModal');
            document.getElementById('quoteForm').reset();
            currentQuoteProducts = [];
        }
        
        function addProductToQuote() {
            if (products.length === 0) {
                manekiToastExport('No hay productos disponibles. Agrega productos primero en Inventario.', 'warn');
                return;
            }
            
            const productSelect = `
                <div class="flex gap-2 items-start p-3 bg-gray-50 rounded-lg quote-product-row">
                    <select class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onchange="updateQuoteTotal()">
                        <option value="">Seleccionar producto...</option>
                        ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} - $${p.price}</option>`).join('')}
                    </select>
                    <input type="number" min="1" value="1" placeholder="Cant." 
                           class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                           onchange="updateQuoteTotal()">
                    <button type="button" onclick="removeQuoteProduct(this)" class="text-red-500 hover:text-red-700 px-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            document.getElementById('quoteProductsContainer').insertAdjacentHTML('beforeend', productSelect);
            updateQuoteTotal();
        }
        
        function removeQuoteProduct(button) {
            button.closest('.quote-product-row').remove();
            updateQuoteTotal();
        }
        
        function updateQuoteTotal() {
            let total = 0;
            const productRows = document.getElementById('quoteProductsContainer').querySelectorAll('.quote-product-row');
            
            productRows.forEach(row => {
                const select = row.querySelector('select');
                const quantityInput = row.querySelector('input[type="number"]');
                const selectedOption = select.options[select.selectedIndex];
                
                if (selectedOption && selectedOption.value) {
                    const price = parseFloat(selectedOption.dataset.price);
                    const quantity = parseInt(quantityInput.value) || 1;
                    total += price * quantity;
                }
            });
            
            document.getElementById('quoteTotal').textContent = `$${total.toFixed(2)}`;
        }
        
        document.getElementById('quoteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const customer = document.getElementById('quoteCustomer').value;
            const validUntil = document.getElementById('quoteValidUntil').value;
            const notes = document.getElementById('quoteNotes').value;
            
            const productRows = document.getElementById('quoteProductsContainer').querySelectorAll('.quote-product-row');
            const quoteProducts = [];
            let total = 0;
            
            productRows.forEach(row => {
                const select = row.querySelector('select');
                const quantityInput = row.querySelector('input[type="number"]');
                const selectedOption = select.options[select.selectedIndex];
                
                if (selectedOption && selectedOption.value) {
                    const productId = parseInt(selectedOption.value);
                    const product = products.find(p => p.id === productId);
                    const quantity = parseInt(quantityInput.value) || 1;
                    const subtotal = product.price * quantity;
                    
                    quoteProducts.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: quantity,
                        subtotal: subtotal
                    });
                    
                    total += subtotal;
                }
            });
            
            if (quoteProducts.length === 0) {
                manekiToastExport('Agrega al menos un producto a la cotización', 'warn');
                return;
            }
            
            // BUG-007/BUG-013 FIX: Usar crypto.randomUUID() para evitar colisiones de ID en cotizaciones
            const newQuote = {
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + '-' + Math.random().toString(36).slice(2)),
                folio: `COT-${String(quotes.reduce((max, q) => { const n = parseInt((q.folio || '').replace('COT-', '')) || 0; return n > max ? n : max; }, 0) + 1).padStart(6, '0')}`,
                customer: customer,
                date: new Date().toISOString().split('T')[0],
                validUntil: validUntil,
                products: quoteProducts,
                notes: notes,
                total: total,
                status: 'pending'
            };
            
            quotes.push(newQuote);
            saveQuotes();
            
            manekiToastExport('✅ Cotización generada exitosamente', 'ok');
            closeQuoteModal();
            renderQuotesTable();
            
            generateQuoteDocument(newQuote);
        });
        
        function renderQuotesTable() {
            const tbody = document.getElementById('quotesTable');
            
            if (quotes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6"><div class="mk-empty">
    <div class="mk-empty-icon">📋</div>
    <p class="mk-empty-title">Sin cotizaciones</p>
    <p class="mk-empty-sub">Crea tu primera cotización para enviarle un presupuesto a un cliente.</p>
    <div class="mk-empty-action">
      <button onclick="openQuoteModal()" class="btn-primary px-6 py-2.5 rounded-xl text-sm">+ Nueva cotización</button>
    </div>
  </div></td></tr>'`;
                return;
            }
            
            tbody.innerHTML = quotes.map(quote => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-semibold" style="color: #E8B84B !important;">${quote.folio}</td>
                    <td class="px-6 py-4 text-gray-800">${quote.customer}</td>
                    <td class="px-6 py-4 text-gray-600">${quote.date}</td>
                    <td class="px-6 py-4 text-gray-800 font-semibold">$${quote.total.toFixed(2)}</td>
                    <td class="px-6 py-4">
                        <span class="badge-${quote.status === 'pending' ? 'warning' : 'success'}">
                            ${quote.status === 'pending' ? 'Pendiente' : 'Aprobada'}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        ${quote.convertedToPedido ? `
    <span class="text-xs text-green-600 font-semibold mr-3">
        <i class="fas fa-check-circle mr-1"></i>Convertida
    </span>
` : `
    <button onclick="convertQuoteToPedido(${quote.id})" 
            class="text-purple-600 hover:text-purple-800 mr-3" title="Convertir a Pedido">
        <i class="fas fa-arrow-right"></i>
    </button>
`}
<button onclick="viewQuote(${quote.id})" class="text-blue-600 hover:text-blue-800 mr-3" title="Ver">
    <i class="fas fa-eye"></i>
</button>
<button onclick="shareQuote(${quote.id})" class="text-green-600 hover:text-green-800 mr-3" title="Compartir">
    <i class="fas fa-share-alt"></i>
</button>
<button onclick="deleteQuote(${quote.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
    <i class="fas fa-trash"></i>
</button>
                    </td>
                </tr>
            `).join('');
        }
        
        function generateQuoteDocument(quote) {
            const quoteHTML = `
                <div class="receipt-header">
                  <div class="receipt-logo">
    ${storeConfig.logoMode === 'image' && storeConfig.logo
        ? `<img src="${_esc(storeConfig.logo)}" style="width:80px;height:80px;object-fit:contain;margin:0 auto;display:block;border-radius:12px;">`
        : _esc(storeConfig.emoji)}
</div>
                    <h1 class="text-3xl font-bold mb-2" style="color: #000;">${_esc(storeConfig.name)}</h1>
                    <p class="text-gray-600">Cotización</p>
                    ${storeConfig.phone || storeConfig.facebook || storeConfig.email ? `
                    <div class="mt-2 text-sm text-gray-500">
                        ${storeConfig.phone ? `<p>📱 ${_esc(storeConfig.phone)}</p>` : ''}
                        ${storeConfig.facebook ? `<p>📘 ${_esc(storeConfig.facebook)}</p>` : ''}
                        ${storeConfig.email ? `<p>✉️ ${_esc(storeConfig.email)}</p>` : ''}
                    </div>` : ''}
                    <div class="mt-4" style="background: #E6D5E6; padding: 8px 16px; border-radius: 8px; display: inline-block;">
                        <p class="text-sm font-bold" style="color: #E8B84B !important;">Folio: ${_esc(quote.folio)}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p class="text-sm text-gray-600">Cliente</p>
                        <p class="font-semibold text-gray-800">${_esc(quote.customer)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Fecha</p>
                        <p class="font-semibold text-gray-800">${_esc(quote.date)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Válido hasta</p>
                        <p class="font-semibold text-gray-800">${_esc(quote.validUntil)}</p>
                    </div>
                </div>
                
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.products.map(item => `
                            <tr>
                                <td>${_esc(item.name)}</td>
                                <td>${_esc(String(item.quantity))}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>$${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="text-right mt-6">
                    <div class="text-2xl font-bold" style="color: #000;">
                        Total: <span style="color: #E8B84B !important;">$${quote.total.toFixed(2)}</span>
                    </div>
                </div>
                
                ${quote.notes ? `
                    <div class="mt-6 p-4 rounded-lg" style="background: #FFF9F0;">
                        <p class="text-sm font-semibold text-gray-700 mb-1">Observaciones:</p>
                        <p class="text-sm text-gray-600">${_esc(quote.notes)}</p>
                    </div>
                ` : ''}
                
                <div class="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p class="text-sm text-gray-600">Esta cotización es válida hasta ${_esc(quote.validUntil)}</p>
                    <p class="text-xs text-gray-500 mt-2">www.manekistore.com</p>
                </div>
            `; // BUG-014 FIX: todos los campos de usuario escapados con _esc() para prevenir XSS
            
            document.getElementById('receiptContent').innerHTML = quoteHTML;
            lastReceipt = quote;
            openModal('receiptModal');
        }
        
        function viewQuote(id) {
            const quote = quotes.find(q => q.id === id);
            if (quote) {
                generateQuoteDocument(quote);
            }
        }
        
        function shareQuote(id) {
            const quote = quotes.find(q => q.id === id);
            if (!quote) return;
            
            const shareText = `📋 *Cotización ${quote.folio}*\n\n` +
                `Cliente: ${quote.customer}\n` +
                `Fecha: ${quote.date}\n` +
                `Válido hasta: ${quote.validUntil}\n\n` +
                `*Productos:*\n` +
                quote.products.map(p => `• ${p.name} (${p.quantity}) - $${p.subtotal.toFixed(2)}`).join('\n') +
                `\n\n*Total: $${quote.total.toFixed(2)}*\n\n` +
                (quote.notes ? `Observaciones: ${quote.notes}\n\n` : '') +
                `¡Gracias por tu preferencia!\n` +
                `Maneki Store - Regalos Personalizados`;
            
            if (navigator.share) {
                navigator.share({
                    title: `Cotización ${quote.folio}`,
                    text: shareText,
                }).catch(err => console.log('Error sharing', err));
            } else {
                navigator.clipboard.writeText(shareText);
                manekiToastExport('✅ Cotización copiada al portapapeles. Puedes pegarla en WhatsApp u otro lugar.', 'ok');
            }
        }
        
        function deleteQuote(id) {
            showConfirm('Esta cotización será eliminada permanentemente.', '⚠️ Eliminar cotización').then(ok => {
                if (!ok) return;
                quotes = quotes.filter(q => q.id !== id);
                saveQuotes();
                renderQuotesTable();
            });
        }