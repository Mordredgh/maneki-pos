// ── Helper centralizado para fecha local YYYY-MM-DD (evita UTC shift de noche) ──
function _fechaHoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
window._fechaHoy = _fechaHoy;

// ============== HISTORIAL DE CLIENTE ==============

function openClientHistory(clientId) {
    const client = (window.clients || clients || []).find(c => String(c.id) === String(clientId));
    if (!client) return;

    // Datos del cliente
    document.getElementById('historyClientName').textContent  = client.name;
    document.getElementById('historyClientPhone').textContent = client.phone ? '📱 ' + client.phone : '';
    document.getElementById('historyClientEmail').textContent = client.email ? '✉️ ' + client.email : '';
    document.getElementById('historyClientEmoji').textContent = client.type === 'vip' ? '⭐' : '👤';

    const clientName = client.name.toLowerCase().trim();

    // Buscar ventas POS
    const ventas = salesHistory.filter(s =>
        s.customer && s.customer.toLowerCase().trim() === clientName
    );

    // Buscar pedidos (activos + finalizados)
    const todosLosPedidos = [
        ...(window.pedidos || []),
        ...(window.pedidosFinalizados || [])
    ];
    const pedidosCliente = todosLosPedidos.filter(p => {
        const nombre = (p.cliente || '').toLowerCase().trim();
        return (p.clienteId && String(p.clienteId) === String(clientId)) ||
               nombre === clientName;
    });

    // Buscar abonos (variable puede no existir)
    const abonosCliente = (typeof abonos !== 'undefined' ? abonos : []).filter(a =>
        a.cliente && a.cliente.toLowerCase().trim() === clientName
    );

    // Calcular total gastado
    const totalVentas  = ventas.reduce((s, v) => s + (v.total || 0), 0);
    const totalPedidos = pedidosCliente.reduce((s, p) => s + (p.total || 0), 0);
    const totalAbonos  = abonosCliente.reduce((s, a) => s + (a.total || 0), 0);
    const totalGastado = totalVentas + totalPedidos + totalAbonos;

    // Última compra
    const todasFechas = [
        ...ventas.map(v => v.date),
        ...pedidosCliente.map(p => p.fechaPedido),
        ...abonosCliente.map(a => a.fecha)
    ].filter(Boolean).sort().reverse();

    document.getElementById('historyTotalSpent').textContent    = '$' + totalGastado.toFixed(2);
    document.getElementById('historyTotalSales').textContent    = ventas.length;
    document.getElementById('historyTotalPedidos').textContent  = pedidosCliente.length + abonosCliente.length;
    document.getElementById('historyLastPurchase').textContent  = todasFechas[0] || '—';

    // Render ventas
    const ventasList = document.getElementById('historyVentasList');
    if (ventas.length === 0) {
        ventasList.innerHTML = '<p class="text-gray-400 text-center py-8 text-sm">Sin ventas registradas en POS</p>';
    } else {
        ventasList.innerHTML = ventas.slice().reverse().map(v => `
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                    <p class="font-semibold text-gray-800 text-sm">${v.folio || '—'}</p>
                    <p class="text-xs text-gray-500">${v.date} · ${v.method || ''}</p>
                    <p class="text-xs text-gray-400">${(v.products || []).map(p => _esc(p.name)).join(', ')}</p>
                </div>
                <span class="font-bold text-gray-800">$${(v.total || 0).toFixed(2)}</span>
            </div>
        `).join('');
    }

    // Render pedidos
    const pedidosList = document.getElementById('historyPedidosList');
    if (pedidosCliente.length === 0) {
        pedidosList.innerHTML = '<p class="text-gray-400 text-center py-8 text-sm">Sin pedidos por encargo</p>';
    } else {
        pedidosList.innerHTML = pedidosCliente.slice().reverse().map(p => {
            const saldoP = typeof window.calcSaldoPendiente === 'function'
                ? window.calcSaldoPendiente(p)
                : Math.max(0, Number(p.total||0) - Number(p.anticipo||0));
            return `
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                    <p class="font-semibold text-gray-800 text-sm">${p.folio || '—'}</p>
                    <p class="text-xs text-gray-500">${p.fechaPedido || ''} · Entrega: ${p.fechaEntrega || '—'}</p>
                    <p class="text-xs text-gray-400">${_esc(p.concepto || '')}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-800">$${(p.total || 0).toFixed(2)}</p>
                    <p class="text-xs ${saldoP > 0 ? 'text-red-500' : 'text-green-500'}">
                        ${saldoP > 0 ? 'Resta $' + saldoP.toFixed(2) : 'Pagado ✓'}
                    </p>
                </div>
            </div>
        `;
        }).join('');
    }

    // Saldo pendiente (abonosList fue removido del HTML, solo calculamos el saldo)
    const saldoPedidos = pedidosCliente.reduce((s, p) =>
        s + (typeof window.calcSaldoPendiente === 'function'
            ? window.calcSaldoPendiente(p)
            : Math.max(0, Number(p.total||0) - Number(p.anticipo||0))), 0);
    const saldoAbonos  = abonosCliente.reduce((s, a) => s + (Number(a.resta) || 0), 0);
    const saldoTotal   = saldoPedidos + saldoAbonos;
    const saldoEl    = document.getElementById('historySaldoPendiente');
    const saldoDetEl = document.getElementById('historySaldoDetalle');
    if (saldoEl) { saldoEl.textContent = '$' + saldoTotal.toFixed(2); saldoEl.style.color = saldoTotal > 0 ? '#B91C1C' : '#15803D'; }
    if (saldoDetEl) saldoDetEl.textContent = saldoTotal > 0
        ? `Pedidos: $${saldoPedidos.toFixed(2)} · Abonos: $${saldoAbonos.toFixed(2)}`
        : '✅ Todo pagado';

    // Notas del cliente
    const notasEl = document.getElementById('historyClientNotas');
    if (notasEl) notasEl.textContent = client.notas || 'Sin notas';

    // Productos más comprados
    const prodMap = {};
    ventas.forEach(v => (v.products || []).forEach(p => {
        prodMap[p.name] = (prodMap[p.name] || 0) + (p.quantity || 1);
    }));
    pedidosCliente.forEach(p => {
        if (p.concepto) prodMap[p.concepto] = (prodMap[p.concepto] || 0) + 1;
    });
    const topProds = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEl = document.getElementById('historyTopProductos');
    if (topEl) topEl.innerHTML = topProds.length > 0
        ? topProds.map(([name, qty]) => `<span class="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold">${name} ×${qty}</span>`).join('')
        : '<span class="text-xs text-gray-400">Sin datos</span>';

    switchHistoryTab('ventas');
    openModal('clientHistoryModal');
}

function closeClientHistoryModal() {
    closeModal('clientHistoryModal');
}

function switchHistoryTab(tab) {
    ['ventas', 'pedidos'].forEach(t => {
        const content = document.getElementById('tabContent' + t.charAt(0).toUpperCase() + t.slice(1));
        const btn     = document.getElementById('tab'        + t.charAt(0).toUpperCase() + t.slice(1));
        if (content) content.classList.add('hidden');
        if (btn)     { btn.style.borderColor = 'transparent'; btn.style.color = '#9CA3AF'; }
    });
    const activeContent = document.getElementById('tabContent' + tab.charAt(0).toUpperCase() + tab.slice(1));
    const activeBtn     = document.getElementById('tab'        + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (activeContent) activeContent.classList.remove('hidden');
    if (activeBtn)     { activeBtn.style.borderColor = '#C5A572'; activeBtn.style.color = '#C5A572'; }
}

// ============== STORE CONFIG ==============
let storeConfig = {
    emoji:    '🐱',
    name:     'Maneki Store',
    slogan:   'Regalos Personalizados',
    phone:    '',
    facebook: '',
    email:    '',
    address:  '',
    footer:   '¡Gracias por tu compra!',
    logo:     null,
    logoMode: 'image'
};

function saveStoreConfig() {
    const btn  = document.querySelector('button[onclick="saveStoreConfig()"]');
    const done = btnLoading(btn);
    storeConfig = {
        emoji:    document.getElementById('configEmoji').value,
        name:     document.getElementById('configName').value || 'Maneki Store',
        slogan:   document.getElementById('configSlogan').value,
        phone:    document.getElementById('configPhone').value,
        facebook: document.getElementById('configFacebook').value,
        email:    document.getElementById('configEmail').value,
        footer:   document.getElementById('configFooter').value || 'Gracias por tu compra!',
        logo:     storeLogo || storeConfig.logo || null,
        logoMode: 'image',
        theme:    storeConfig.theme || 'dorado',
        address:  (document.getElementById('configAddress') || {}).value || storeConfig.address || '',
        // Feature 2: Chat IDs de Telegram para alertas de stock
        telegramChatId1: (document.getElementById('configTelegramChatId1') || {}).value?.trim() || storeConfig.telegramChatId1 || '',
        telegramChatId2: (document.getElementById('configTelegramChatId2') || {}).value?.trim() || storeConfig.telegramChatId2 || '',
        // Sync meta mensual — design-system.js la guarda en mk_monthly_goal; aquí la persistimos en storeConfig también
        metaMensual: parseFloat(localStorage.getItem('mk_monthly_goal') || '0') || storeConfig.metaMensual || 5000,
    };
    // R2-A1: advertir si no hay logo válido al guardar
    if (!storeConfig.logo) {
        manekiToastExport('Agrega un logo válido antes de guardar', 'warn');
    }

    sbSave('storeConfig', storeConfig).then(() => done(true)).catch(() => done(false));

    const sidebarH1 = document.querySelector('#sidebar .sidebar-store-name');
    const sidebarP  = document.querySelector('#sidebar .sidebar-store-slogan');
    if (sidebarH1) sidebarH1.textContent = storeConfig.name;
    if (sidebarP)  sidebarP.textContent  = storeConfig.slogan;
    updateSidebarLogo();
    manekiToastExport('Configuración guardada ✓', 'ok');
}

function updateSidebarLogo() {
    const c = document.getElementById('sidebarLogoContainer');
    if (!c) return;
    if (storeConfig.logo) {
        c.innerHTML = `<img src="${storeConfig.logo}" style="width:52px;height:52px;object-fit:contain;border-radius:12px;" alt="Logo">`;
    } else {
        c.innerHTML = `<span style="font-size:30px">${storeConfig.emoji || '🐱'}</span>`;
    }
}

function renderBienvenida() {
    const now = new Date();
    const h   = now.getHours();
    const saludo = h < 12 ? '¡Buenos días!' : h < 19 ? '¡Buenas tardes!' : '¡Buenas noches!';

    const lc = document.getElementById('welcomeLogoContainer');
    if (lc) {
        lc.innerHTML = storeConfig.logo
            ? `<img src="${storeConfig.logo}" style="width:56px;height:56px;object-fit:contain;border-radius:12px;" alt="Logo">`
            : `<span style="font-size:28px">${storeConfig.emoji || '🐱'}</span>`;
    }

    const elSet = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    elSet('welcomeGreeting',  saludo);
    elSet('welcomeDate',      now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }));
    elSet('welcomeStoreName', storeConfig.name || 'Maneki Store');
    elSet('welcomeTime',      now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));

    if (!window._bienvenidaClock) {
        window._bienvenidaClock = setInterval(() => {
            const n       = new Date();
            const timeEl  = document.getElementById('welcomeTime');
            const greetEl = document.getElementById('welcomeGreeting');
            if (!timeEl) { clearInterval(window._bienvenidaClock); window._bienvenidaClock = null; return; }
            timeEl.textContent = n.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const hh = n.getHours();
            if (greetEl) greetEl.textContent = hh < 12 ? '¡Buenos días!' : hh < 19 ? '¡Buenas tardes!' : '¡Buenas noches!';
        }, 60000);
    }

    try {
        const hoy      = _fechaHoy();
        const currency = v => '$' + (v || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        const ventas    = window.salesHistory || JSON.parse(localStorage.getItem('maneki_ventas') || '[]');
        const ventasHoy = ventas.filter(v => (v.date || '').startsWith(hoy));
        const totalHoy  = ventasHoy.reduce((s, v) => s + (parseFloat(v.total) || 0), 0);
        const totalAyer = (() => {
            const ayer = new Date(now); ayer.setDate(ayer.getDate() - 1);
            const str  = `${ayer.getFullYear()}-${String(ayer.getMonth()+1).padStart(2,'0')}-${String(ayer.getDate()).padStart(2,'0')}`;
            return ventas.filter(v => (v.date || '').startsWith(str)).reduce((s, v) => s + (parseFloat(v.total) || 0), 0);
        })();
        elSet('mornDailySales', currency(totalHoy));
        const diffEl = document.getElementById('mornSalesSub');
        if (diffEl) {
            if (totalAyer > 0) {
                const pct = ((totalHoy - totalAyer) / totalAyer * 100).toFixed(0);
                diffEl.textContent = (pct >= 0 ? '▲ +' : '▼ ') + Math.abs(pct) + '% vs ayer';
                diffEl.style.color = pct >= 0 ? '#16a34a' : '#dc2626';
            } else {
                diffEl.textContent = `${ventasHoy.length} venta${ventasHoy.length !== 1 ? 's' : ''} hoy`;
            }
        }

        const pedidosArr = window.pedidos || JSON.parse(localStorage.getItem('maneki_pedidos') || '[]');
        const urgentes   = pedidosArr.filter(p => p.entrega === hoy && !['finalizado', 'cancelado'].includes(p.status || ''));
        elSet('mornUrgentCount', urgentes.length);
        const urgCard = document.getElementById('mornUrgentCard');
        if (urgCard) urgCard.style.background = urgentes.length > 0
            ? 'linear-gradient(135deg,#fef2f2,#fee2e2)'
            : 'linear-gradient(135deg,#f0fdf9,#ecfdf5)';

        const listEl = document.getElementById('mornUrgentList');
        if (listEl) {
            listEl.innerHTML = urgentes.length === 0
                ? '<p style="font-size:.78rem;color:#9ca3af;text-align:center;padding:12px 0;">✅ Sin entregas urgentes para hoy</p>'
                : urgentes.slice(0, 4).map(p => `
                    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:#fff5f5;border-left:3px solid #ef4444;margin-bottom:6px;cursor:pointer;" onclick="showSection('pedidos')">
                        <div style="flex:1;">
                            <p style="font-size:.78rem;font-weight:700;color:#1f2937;margin:0;">${p.customer || p.cliente || 'Sin nombre'}</p>
                            <p style="font-size:.68rem;color:#6b7280;margin:1px 0 0;">${p.items?.length || 0} producto${(p.items?.length || 0) !== 1 ? 's' : ''} · ${p.status || 'pendiente'}</p>
                        </div>
                        <span style="font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:99px;background:#fee2e2;color:#dc2626;">HOY</span>
                    </div>
                `).join('') + (urgentes.length > 4 ? `<p style="font-size:.7rem;color:#9ca3af;text-align:center;margin-top:4px;">+${urgentes.length - 4} más...</p>` : '');
        }

        const productos = window.products || JSON.parse(localStorage.getItem('maneki_productos') || '[]');
        const criticos  = productos.filter(p => (parseInt(p.stock) || 0) <= (storeConfig.stockMinimo || 5) && p.activo !== false);
        elSet('mornLowStock', criticos.length);

        // Calcular "me deben" desde pedidos activos con saldo pendiente
        // igual que el dashboard completo — no usar balanceItems que es otra cosa
        const totalDeben = pedidosArr
            .filter(p => !['finalizado','cancelado','entregado'].includes((p.status||'').toLowerCase()))
            .reduce((s, p) => {
                const resta = p.resta ?? Math.max(0, Number(p.total||0) - Number(p.anticipo||0));
                return s + resta;
            }, 0);
        elSet('mornReceivable', currency(totalDeben));

    } catch (e) {
        console.warn('Error cargando KPIs morning dashboard:', e);
    }
}

function updateStorePreview() {
    if (storeConfig.logoMode === 'image' && typeof storeLogo !== 'undefined' && storeLogo) {
        document.getElementById('previewEmoji').innerHTML =
            `<img src="${storeLogo}" style="width:80px;height:80px;object-fit:contain;border-radius:12px;display:block;margin:0 auto;">`;
    } else {
        document.getElementById('previewEmoji').textContent = document.getElementById('configEmoji').value || '🐱';
    }
    document.getElementById('previewName').textContent   = document.getElementById('configName').value || 'Maneki Store';
    document.getElementById('previewSlogan').textContent = document.getElementById('configSlogan').value || '';
    const phone = document.getElementById('configPhone').value;
    const fb    = document.getElementById('configFacebook').value;
    const email = document.getElementById('configEmail').value;
    let contactHTML = '';
    if (phone) contactHTML += `<p>📱 ${phone}</p>`;
    if (fb)    contactHTML += `<p>📘 ${fb}</p>`;
    if (email) contactHTML += `<p>✉️ ${email}</p>`;
    document.getElementById('previewContact').innerHTML = contactHTML;
}

function loadStoreConfigUI() {
    document.getElementById('configEmoji').value    = storeConfig.emoji;
    document.getElementById('configName').value     = storeConfig.name;
    document.getElementById('configSlogan').value   = storeConfig.slogan;
    document.getElementById('configPhone').value    = storeConfig.phone;
    document.getElementById('configFacebook').value = storeConfig.facebook;
    document.getElementById('configEmail').value    = storeConfig.email;
    document.getElementById('configFooter').value   = storeConfig.footer;
    const addrEl = document.getElementById('configAddress');
    if (addrEl) addrEl.value = storeConfig.address || '';
    const goalEl = document.getElementById('dashMonthGoal');
    const metaMensual = storeConfig.metaMensual ||
        parseFloat(localStorage.getItem('mk_monthly_goal') || '0') || 5000;
    if (goalEl) goalEl.value = metaMensual;
    // Feature 2: cargar Chat IDs de Telegram
    const tg1 = document.getElementById('configTelegramChatId1');
    const tg2 = document.getElementById('configTelegramChatId2');
    if (tg1) tg1.value = storeConfig.telegramChatId1 || '';
    if (tg2) tg2.value = storeConfig.telegramChatId2 || '';
    updateStorePreview();
}

// ============== TAGS DE PRODUCTOS ==============
let _tagsActuales = [];

function renderTagsSeleccionados(tags) {
    _tagsActuales = [...tags];
    const cont = document.getElementById('tagsSeleccionados');
    if (!cont) return;
    cont.innerHTML = _tagsActuales.map(t =>
        `<span class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            ${t} <button type="button" onclick="eliminarTag('${t}')" class="ml-1 text-amber-600 hover:text-red-500">✕</button>
        </span>`
    ).join('');
    const tagInput = document.getElementById('productTags');
    if (tagInput) tagInput.value = JSON.stringify(_tagsActuales);
}

function toggleTagPredefinido(tag) {
    if (_tagsActuales.includes(tag)) {
        _tagsActuales = _tagsActuales.filter(t => t !== tag);
    } else {
        _tagsActuales.push(tag);
    }
    renderTagsSeleccionados(_tagsActuales);
    document.querySelectorAll('#tagsPredefinidos .tag-btn').forEach(btn => {
        if (btn.textContent.trim() === tag) {
            btn.classList.toggle('bg-yellow-200',  _tagsActuales.includes(tag));
            btn.classList.toggle('border-yellow-400', _tagsActuales.includes(tag));
        }
    });
}

function agregarTagCustom() {
    const input = document.getElementById('tagCustomInput');
    const val   = input.value.trim();
    if (!val || _tagsActuales.includes(val)) return;
    _tagsActuales.push(val);
    renderTagsSeleccionados(_tagsActuales);
    input.value = '';
}

function eliminarTag(tag) {
    _tagsActuales = _tagsActuales.filter(t => t !== tag);
    renderTagsSeleccionados(_tagsActuales);
}

// ── PARCHE: ampliar closeAddProductModal con limpieza de tags ──
document.addEventListener('DOMContentLoaded', function () {
    const _origClose = typeof closeAddProductModal === 'function'
        ? closeAddProductModal
        : function () {};

    closeAddProductModal = function () {
        _tagsActuales = [];
        renderTagsSeleccionados([]);
        document.querySelectorAll('#tagsPredefinidos .tag-btn').forEach(btn => {
            btn.classList.remove('bg-yellow-200', 'border-yellow-400');
        });
        _kitComponentes = [];
        _origClose();
    };
});

// ============== TIPO DE PRODUCTO ==============
function setTipoProducto(tipo) {
    document.getElementById('productTipo').value = tipo;
    const btnProducto = document.getElementById('tipoBtnProducto');
    const btnMateria  = document.getElementById('tipoBtnMateria');
    if (tipo === 'producto') {
        btnProducto.className = 'flex-1 py-2 rounded-xl text-sm font-semibold border-2 border-amber-400 bg-amber-50 text-amber-800';
        btnMateria.className  = 'flex-1 py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-500';
    } else {
        btnMateria.className  = 'flex-1 py-2 rounded-xl text-sm font-semibold border-2 border-blue-400 bg-blue-50 text-blue-800';
        btnProducto.className = 'flex-1 py-2 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-500';
    }
}

// ============== KIT DE PRODUCTOS ==============
let _kitComponentes = [];

function toggleKitSection() {
    const isKit   = document.getElementById('productIsKit').checked;
    const section = document.getElementById('kitSection');
    section.classList.toggle('hidden', !isKit);
    if (isKit) poblarKitSelect();
}

function poblarKitSelect() {
    const sel      = document.getElementById('kitComponentSelect');
    const materias = products.filter(p => p.tipo === 'materia');
    sel.innerHTML  = '<option value="">-- Seleccionar materia prima --</option>' +
        materias.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');
}

function agregarComponenteKit() {
    const sel  = document.getElementById('kitComponentSelect');
    const cant = parseInt(document.getElementById('kitComponentCantidad').value) || 1;
    const pid  = sel.value;
    if (!pid) { manekiToastExport('Selecciona un componente', 'warn'); return; }
    const prod = products.find(p => String(p.id) === String(pid));
    if (!prod) return;
    const existing = _kitComponentes.find(c => String(c.id) === String(pid));
    if (existing) { existing.quantity += cant; }
    else { _kitComponentes.push({ id: prod.id, name: prod.name, quantity: cant }); }
    renderKitComponentesList();
}

function renderKitComponentesList() {
    const container = document.getElementById('kitComponentesList');
    if (!container) return;
    container.innerHTML = _kitComponentes.length === 0
        ? '<p class="text-xs text-gray-400">Sin componentes</p>'
        : _kitComponentes.map((c, i) =>
            `<div class="flex justify-between items-center bg-white rounded-lg px-3 py-1 text-sm border border-gray-100">
                <span>${c.name} x${c.quantity}</span>
                <button type="button" onclick="eliminarComponenteKit(${i})" class="text-red-400 hover:text-red-600">✕</button>
            </div>`
        ).join('');
    document.getElementById('productKitComponentes').value = JSON.stringify(_kitComponentes);
}

function eliminarComponenteKit(index) {
    _kitComponentes.splice(index, 1);
    renderKitComponentesList();
}

// ============== IMPRIMIR INVENTARIO ==============
function imprimirInventario() {
    const fecha = new Date().toLocaleDateString('es-MX');
    const filas = products.map(p => {
        const cat    = (categories.find(c => c.id === p.category) || {}).name || p.category || '';
        const tags   = (p.tags || []).join(', ');
        const estado = p.stock === 0 ? 'Agotado' : p.stock <= 10 ? 'Bajo Stock' : 'Disponible';
        return `<tr>
            <td>${p.image || ''} ${p.name}</td>
            <td>${p.sku || ''}</td>
            <td>${cat}</td>
            <td>$${(p.price || 0).toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>${estado}</td>
            <td>${tags}</td>
        </tr>`;
    }).join('');

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
        <title>Inventario - ${fecha}</title>
        <style>
            body  { font-family:Arial,sans-serif; padding:20px; font-size:12px; }
            h1    { font-size:18px; margin-bottom:4px; }
            p     { color:#666; margin-bottom:16px; }
            table { width:100%; border-collapse:collapse; }
            th    { background:#f3f4f6; text-align:left; padding:8px; border:1px solid #ddd; }
            td    { padding:6px 8px; border:1px solid #eee; }
            tr:nth-child(even) { background:#f9f9f9; }
            @media print { button { display:none; } }
        </style>
    </head><body>
        <h1>📦 Inventario</h1>
        <p>Generado el ${fecha} · ${products.length} productos</p>
        <button onclick="window.print()" style="margin-bottom:16px;padding:8px 16px;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;">🖨️ Imprimir / Guardar PDF</button>
        <table>
            <thead><tr>
                <th>Producto</th><th>SKU</th><th>Categoría</th>
                <th>Precio</th><th>Stock</th><th>Estado</th><th>Tags</th>
            </tr></thead>
            <tbody>${filas}</tbody>
        </table>
    </body></html>`);
    win.document.close();
}

// ============== INICIALIZACIÓN ==============
document.addEventListener('DOMContentLoaded', function () {
    try { showSection('bienvenida'); } catch (e) {}
    initApp();
});

async function initApp() {
    function splashProgress(step, label) {
        try {
            if (typeof ipcRenderer !== 'undefined' && ipcRenderer)
                ipcRenderer.send('splash-progress', { step, total: 6, label });
        } catch (e) {}
    }

    try {
        splashProgress(0, 'Conectando a Supabase...');
        categories = await sbLoad('categories', defaultCategories);
        splashProgress(1, 'Cargando datos...');

        const [
            _products, _clients, _salesHistory, _quotes,
            _incomes, _expenses, _receivables, _payables,
            _pedidos, _stockMov, _gastosRec, _pedidosFin, _storeConf, _ingresosRec
        ] = await Promise.all([
            sbLoad('products', []),
            sbLoad('clients', []),
            sbLoad('salesHistory', []),
            sbLoad('quotes', []),
            sbLoad('incomes', []),
            sbLoad('expenses', []),
            sbLoad('receivables', []),
            sbLoad('payables', []),
            sbLoad('pedidos', []),
            sbLoad('stockMovimientos', []),
            sbLoad('gastosRecurrentes', []),
            sbLoad('pedidosFinalizados', []),
            sbLoad('storeConfig', storeConfig),
            sbLoad('ingresosRecurrentes', []),
        ]);

        products             = _products;
        clients              = _clients;
        salesHistory         = _salesHistory;
        quotes               = _quotes;
        incomes              = _incomes;
        expenses             = _expenses;
        receivables          = _receivables;
        payables             = _payables;
        pedidos              = _pedidos;
        stockMovimientos     = _stockMov;
        gastosRecurrentes    = _gastosRec;
        pedidosFinalizados   = _pedidosFin;
        storeConfig          = _storeConf;
        window.ingresosRecurrentes = _ingresosRec;

        splashProgress(4, 'Cargando configuración...');

        const [_notas, _equipos, _roiHist, _roiConf, _envioAnillos] = await Promise.all([
            sbLoad('notas', []),
            sbLoad('equipos', []),
            sbLoad('roiHistorial', []),
            sbLoad('roiConfig', { porcentaje: 10 }),
            sbLoad('envioAnillos', [
                { km: 5,  precio: 60,  nombre: 'Anillo 1 (0-5 km)' },
                { km: 12, precio: 90,  nombre: 'Anillo 2 (5-12 km)' },
                { km: 20, precio: 130, nombre: 'Anillo 3 (12-20 km)' },
                { km: 35, precio: 180, nombre: 'Anillo 4 (20-35 km)' },
            ]),
        ]);

        notas        = _notas;
        equipos      = _equipos;
        roiHistorial = _roiHist;
        roiConfig    = _roiConf;
        envioAnillos = _envioAnillos;

        if (storeConfig.baseLat && storeConfig.baseLng) {
            ENVIO_BASE.lat = storeConfig.baseLat;
            ENVIO_BASE.lng = storeConfig.baseLng;
        }

        splashProgress(6, '¡Listo!');
        try { if (typeof ipcRenderer !== 'undefined' && ipcRenderer) ipcRenderer.send('splash-done'); } catch (e) {}

        const roiPctEl = document.getElementById('roiPorcentajeGlobal');
        if (roiPctEl) roiPctEl.value = roiConfig.porcentaje || 10;

        // ── UI sin DOM pesado — ejecutar primero ──
        renderNotas();
        loadThemeUI();
        loadLogoUI();
        updateSidebarLogo();
        loadStoreConfigUI();
        if (typeof renderBienvenida === 'function') renderBienvenida();

        // --- Indicador conexión Supabase ---
        let _sbConectado = null;

        async function verificarConexionSupabase() {
            const dot = document.getElementById('supabaseStatusDot');
            const txt = document.getElementById('supabaseStatusText');
            if (!dot || !txt) return;
            try {
                const { error } = await db.from('store').select('key').limit(1);
                if (error) throw error;
                dot.className   = 'w-2 h-2 rounded-full bg-green-500 inline-block';
                txt.textContent = 'Supabase conectado';
                txt.className   = 'text-green-700';
                if (_sbConectado === false) {
                    if (typeof mostrarBannerConexion === 'function')
                        mostrarBannerConexion(true, 'Conexión restaurada — sincronizando datos...');
                    try { if (typeof require !== 'undefined') require('electron').ipcRenderer.send('notify-connection', { connected: true }); } catch (e) {}
                }
                _sbConectado = true;
            } catch (e) {
                dot.className   = 'w-2 h-2 rounded-full bg-red-500 inline-block';
                txt.textContent = 'Sin conexión';
                txt.className   = 'text-red-600';
                if (_sbConectado !== false) {
                    if (typeof mostrarBannerConexion === 'function')
                        mostrarBannerConexion(false, 'Sin conexión a la nube — trabajando en modo offline.');
                    try { if (typeof require !== 'undefined') require('electron').ipcRenderer.send('notify-connection', { connected: false }); } catch (e) {}
                }
                _sbConectado = false;
            }
        }
        verificarConexionSupabase();
        if (window._sbCheckInterval) clearInterval(window._sbCheckInterval);
        window._sbCheckInterval = setInterval(verificarConexionSupabase, 30000);

        const sbH1 = document.querySelector('#sidebar h1');
        const sbP  = document.querySelector('#sidebar p');
        if (sbH1) sbH1.textContent = storeConfig.name;
        if (sbP)  sbP.textContent  = storeConfig.slogan;

        const today = _fechaHoy();
        const vu    = new Date(); vu.setDate(vu.getDate() + 15);
        const qv    = document.getElementById('quoteValidUntil');
        const td    = document.getElementById('transactionDate');
        if (qv) qv.value = vu.toISOString().split('T')[0];
        if (td) td.value = today;

        // ── Setups sin DOM pesado — ejecutar antes de los renders ──
        if (typeof setupSearchFilter === 'function') setupSearchFilter();
        // FIX BUG-011: clientes.js puede no haber cargado si tiene un SyntaxError en producción.
        // Llamar con guard para que un fallo aquí no aborte toda la inicialización de la app.
        try { if (typeof setupClientSearch === 'function') setupClientSearch(); } catch(e) { console.warn('setupClientSearch error:', e); }
        setupMobileMenu();
        setupImageUpload();
        // Sincroniza variables globales con window.* para que todos los módulos
        // lean siempre los datos frescos de Supabase/SQLite y nunca de localStorage
        function _syncWindowVars() {
            window.pedidos            = pedidos;
            window.products           = products;
            window.salesHistory       = salesHistory;
            window.clients            = clients;
            window.categories         = categories;
            window.receivables        = receivables;
            window.payables           = payables;
            window.incomes            = incomes;
            window.expenses           = expenses;
            window.quotes             = quotes;
            window.pedidosFinalizados = pedidosFinalizados;
            window.stockMovimientos   = stockMovimientos;
            window.stockMovements     = stockMovimientos; // inventory.js usa este nombre
            window.gastosRecurrentes  = gastosRecurrentes;
            window.ingresosRecurrentes = window.ingresosRecurrentes || [];
            window.storeConfig        = storeConfig;
            window.notas              = notas;
            window.equipos            = equipos;
            window.roiHistorial       = roiHistorial;
            window.roiConfig          = roiConfig;
            window.envioAnillos       = envioAnillos;
        }
        _syncWindowVars();

        // Normalizar resta de pedidos ANTES del primer render — garantiza consistencia
        if (typeof normalizarResta === 'function') normalizarResta();

        // FIX TIMING: Inyectar anticipos iniciales de pedidos en salesHistory UNA SOLA VEZ.
        // Los abonos posteriores ya se guardan en salesHistory con id propio (pedidos.js).
        // El anticipo inicial (pagos[0] o p.anticipo sin pagos) NO queda en salesHistory.
        // Al inyectarlo aquí, dashboard.js y ui-extras.js ya no necesitan buscarlo — 
        // leen solo salesHistory y los valores son siempre consistentes entre recargas.
        (function _inyectarAnticiposEnSalesHistory() {
            const shIds = new Set((salesHistory || []).map(s => String(s.id || '')).filter(Boolean));
            [...(window.pedidos || []), ...(window.pedidosFinalizados || [])].forEach(p => {
                // Para cada pedido, el anticipo inicial es lo que no está ya en salesHistory
                const sumAbonosEnSH = (salesHistory || [])
                    .filter(s => s.folio === p.folio && s.type === 'abono')
                    .reduce((acc, s) => acc + Number(s.total || 0), 0);
                // anticipo inicial = total pagado (p.anticipo) - abonos ya en salesHistory
                const anticipoInicial = Math.max(0, Number(p.anticipo || 0) - sumAbonosEnSH);
                if (anticipoInicial <= 0) return;
                // Generar id estable — mismo pedido siempre produce mismo id
                const syntheticId = 'anticipo-init-' + String(p.id || p.folio || '');
                if (shIds.has(syntheticId)) return; // ya inyectado
                const fecha = (p.fechaCreacion || p.fecha || new Date().toISOString()).split('T')[0];
                salesHistory.push({
                    id: syntheticId,
                    type: 'anticipo',
                    folio: p.folio || '',
                    date: fecha,
                    customer: p.cliente || '',
                    concept: 'Anticipo pedido ' + (p.folio || ''),
                    products: [],
                    total: anticipoInicial,
                    method: p.metodoPago || 'Efectivo',
                    note: 'Anticipo inicial (generado automáticamente)'
                });
                shIds.add(syntheticId);
            });
            window.salesHistory = salesHistory;
        })();

        // ✅ FIX Forced Reflow: renders DOM divididos en 3 frames separados
        // Cada requestAnimationFrame da al navegador ~16ms para pintar
        // antes del siguiente bloque, evitando recálculos de layout masivos.

        // Frame 1: secciones principales visibles al iniciar
        requestAnimationFrame(() => {
            updateDashboard();
            // renderProducts() eliminado — módulo POS removido
            renderBalance();
            updateCategorySelects();

            // Frame 2: tablas secundarias
            requestAnimationFrame(() => {
                renderInventoryTable();
                renderClientsTable();
                renderCategoriesGrid();
                // renderQuotesTable() eliminado — módulo POS removido
                renderPedidosTable();

                // Frame 3: charts y reportes (los más costosos)
                requestAnimationFrame(() => {
                    initChart();
                    initReports();
                    try { showSection('bienvenida'); } catch (e) {}
                    // Activar Live Sync después de que todo esté listo
                    if (typeof _setupRealtime === 'function') _setupRealtime();
                    console.log('Maneki - Supabase OK + Realtime activo');
                });
            });
        });

    } catch (err) {
        console.error('initApp error:', err);
    }
}
