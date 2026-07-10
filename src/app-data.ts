// ============== SECURITY: URL VALIDATION FOR IMG SRC ==============
function _validateImgUrl(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        if (!['https:', 'http:', 'blob:', 'data:'].includes(u.protocol)) return '';
        return url;
    } catch { return url.startsWith('data:image/') ? url : ''; }
}

// ============== DEFAULT DATA ==============
        const defaultCategories = [
            { id: 'tazas', name: 'Tazas', emoji: '☕' },
            { id: 'llaveros', name: 'Llaveros', emoji: '🔑' },
            { id: 'libretas', name: 'Libretas', emoji: '📓' },
            { id: 'peluches', name: 'Peluches', emoji: '🧸' },
            { id: 'otros', name: 'Otros', emoji: '🎁' }
        ];
        
        // ============== DATA (Supabase - se carga en initApp) ==============
let categories = [];
let products = [];
let clients = [];
let salesHistory = [];
let quotes = [];
let incomes = [];
let expenses = [];
let receivables = [];
let payables = [];
        
        let categoryChart = null;
        let salesWeekChart = null;
        let currentVariants = [];
        let currentProductImage = null;
        let currentProductImageFile = null;
        let currentQuoteProducts = [];
        // ============== EDITAR / ELIMINAR BALANCE ==============

function deleteBalanceItem(type, id) {
    showConfirm('Este registro será eliminado. Esta acción no se puede deshacer.', '⚠️ Eliminar registro').then(ok => {
        if (!ok) return;
        if (type === 'income') {
            incomes = incomes.filter(i => String(i.id) !== String(id));
            window.incomes = incomes;
            saveIncomes();
            // DELETE explícito: saveIncomes usa upsert relacional y no borra filas
            if (typeof db !== 'undefined' && db) {
                db.from('incomes').delete().eq('id', id).catch(e => console.warn('[deleteBalanceItem] income delete:', e));
            }
        } else if (type === 'expense') {
            expenses = expenses.filter(e => String(e.id) !== String(id));
            window.expenses = expenses;
            saveExpenses();
            // DELETE explícito: saveExpenses usa upsert relacional y no borra filas
            if (typeof db !== 'undefined' && db) {
                db.from('expenses').delete().eq('id', id).catch(e => console.warn('[deleteBalanceItem] expense delete:', e));
            }
        }
        renderBalance();
        updateDashboard();
    });
}

// editBalanceItem and closeTransactionModal are defined in balance.ts
        // ============== CANCELAR PEDIDO ==============

let pedidoACancelar = null;

function openCancelPedidoModal(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    pedidoACancelar = pedidoId;
    document.getElementById('cancelPedidoFolio').textContent = pedido.folio || '—';
    document.getElementById('cancelPedidoCliente').textContent =
        `Cliente: ${pedido.cliente || '—'} · Total: $${(pedido.total || 0).toFixed(2)}`;
    document.getElementById('cancelMotivo').value = '';
    openModal('cancelPedidoModal');
}

function closeCancelPedidoModal() {
    pedidoACancelar = null;
    closeModal('cancelPedidoModal');
}

function confirmarCancelPedido() {
    const pedido = pedidos.find(p => p.id === pedidoACancelar);
    if (!pedido) return;

    const motivo = document.getElementById('cancelMotivo').value.trim();
    const fecha = _fechaHoy();
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const cancelacion = {
        id: mkId(),
        tipo: 'cancelacion_pedido',
        folio: pedido.folio,
        cliente: pedido.cliente,
        concepto: pedido.concepto,
        total: pedido.total,
        anticipo: pedido.anticipo || 0,
        motivo: motivo || 'Sin motivo especificado',
        fecha: fecha,
        hora: hora
    };

    salesHistory.push({
        id: mkId(),
        folio: pedido.folio + '-CANCEL',
        date: fecha,
        time: hora,
        customer: pedido.cliente || '—',
        concept: '❌ Cancelación: ' + (pedido.concepto || ''),
        note: 'Motivo: ' + (motivo || 'Sin motivo especificado'),
        products: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        method: 'Cancelado',
        cancelacion: cancelacion
    });
    saveSalesHistory();
    if (typeof _allVentasCache !== 'undefined') _allVentasCache = null;

    const tieneProductos = pedido.productosInventario && pedido.productosInventario.length > 0;
    function _ejecutarCancelacion(regresarStock) {
        if (regresarStock && pedido.inventarioDescontado === true) {
            // Usar _regresarInventarioPedido (maneja variantes, servicios, syncStockFromVariants)
            if (typeof _regresarInventarioPedido === 'function') {
                _regresarInventarioPedido(pedido);
            } else {
                pedido.productosInventario.forEach(function(item) {
                    const prod = products.find(function(p) { return String(p.id) === String(item.id); });
                    if (prod && prod.tipo !== 'servicio') prod.stock += (item.quantity || item.cantidad || 1);
                });
            }
            // Regresar empaques si se habían descontado
            if (pedido.empaquesDescontados && typeof _regresarEmpaquesInventario === 'function') {
                _regresarEmpaquesInventario(pedido);
            }
            if (typeof saveProducts === 'function') saveProducts();
            if (typeof renderInventoryTable === 'function') renderInventoryTable();
        }
        pedidos = pedidos.filter(function(p) { return p.id !== pedidoACancelar; });
        savePedidos();
        // Borrar de Supabase orders — upsert no elimina filas y el pedido reaparece al recargar
        if (typeof (window as any).deletePedidoActivo === 'function') {
            (window as any).deletePedidoActivo(String(pedido.id));
        }
        // Limpiar historial ROI de este pedido y revertir recuperado en equipos
        if (typeof limpiarRoiDePedido === 'function') limpiarRoiDePedido(pedidoACancelar);
        closeCancelPedidoModal();
        renderPedidosTable();
        updateDashboard();
        const msgStock = regresarStock
            ? ' ✅ Stock regresado al inventario.'
            : (tieneProductos ? ' ⚠️ Stock NO regresado (producto ya terminado).' : '');
        manekiToastExport('✅ Pedido ' + pedido.folio + ' cancelado.' + msgStock, 'ok');
    }
    if (tieneProductos) {
        const lista = pedido.productosInventario.map(function(i) { return i.name + ' x' + (i.quantity || i.cantidad || 1); }).join(', ');
        showConfirm('¿Regresar productos al inventario?\n(' + lista + ')\n\nAceptar = NO está hecho, regresa al stock.\nCancelar = ya terminado.', '¿Regresar stock?')
            .then(function(regresar) { _ejecutarCancelacion(regresar); });
    } else {
        _ejecutarCancelacion(false);
    }
}

let storeLogo = null; // Base64 de la imagen

function switchLogoTab(tab) {
    // Solo modo imagen disponible
    storeConfig.logoMode = 'image';
    updateStorePreview();
}

async function handleLogoUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 600000) {
        manekiToastExport('La imagen es muy grande. Por favor usa una imagen menor a 500kb.', 'err');
        return;
    }

    // Preview inmediato con URL local mientras sube
    const previewUrl = URL.createObjectURL(file);
    const container = document.getElementById('logoPreviewContainer');
    container.innerHTML = `<img src="${_validateImgUrl(previewUrl)}" class="w-full h-full object-contain rounded-xl">`;
    document.getElementById('removeLogoBtn').classList.remove('hidden');

    // Subir a Supabase Storage (mismo método que los productos)
    try {
        const ext = file.name.split('.').pop();
        const fileName = `logo_tienda.${ext}`;
        const { data, error } = await db.storage
            .from('product-images')
            .upload(fileName, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = db.storage
            .from('product-images')
            .getPublicUrl(fileName);
        storeLogo = urlData.publicUrl;
    } catch(e) {
        console.warn('Storage no disponible, guardando logo localmente:', e);
        // Fallback offline: base64
        storeLogo = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = ev => resolve(ev.target.result);
            reader.readAsDataURL(file);
        });
    }

    storeConfig.logo = storeLogo;
    updateStorePreview();
}

function removeLogo() {
    storeLogo = null;
    storeConfig.logo = null;
    document.getElementById('logoPreviewContainer').innerHTML =
        '<span class="text-gray-300 text-xs text-center">Sin logo</span>';
    document.getElementById('removeLogoBtn').classList.add('hidden');
    document.getElementById('logoFileInput').value = '';
    updateStorePreview();
}

function loadLogoUI() {
    // Siempre modo imagen
    storeConfig.logoMode = 'image';
    // Cargar logo guardado si existe
    if (storeConfig.logo) {
        storeLogo = storeConfig.logo;
        const container = document.getElementById('logoPreviewContainer');
        if (container) {
            container.innerHTML = `<img src="${_validateImgUrl(storeLogo)}" class="w-full h-full object-contain rounded-xl">`;
            document.getElementById('removeLogoBtn')?.classList.remove('hidden');
        }
    }
    updateStorePreview();
}
// ============== SELECTOR DE EMOJIS ==============
// Motor genérico compartido por los 3 pickers de emoji de la app (categoría nueva,
// categoría editar, equipos) — cada uno sigue exponiendo sus mismas funciones globales
// (renderXGrid/filterX/selectX) como wrappers delgados, así el HTML no cambia.
function _renderEmojiPickerGrid(gridId, cats, keywordMap: Record<string, any[]>, filter, btnClass, onSelectFnName) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const q = (filter || '').toLowerCase().trim();
    const btnHtml = e => `<button type="button" onclick="${onSelectFnName}('${e}')" class="${btnClass} w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${e}</button>`;
    if (q) {
        let found = [];
        Object.entries(keywordMap).forEach(([key, emojis]) => {
            if (key.includes(q) || q.includes(key)) found.push(...emojis);
        });
        if (found.length === 0) found = cats.flatMap(cat => cat.emojis);
        grid.innerHTML = `<div class="flex flex-wrap gap-1">${[...new Set(found)].map(btnHtml).join('')}</div>`;
        return;
    }
    grid.innerHTML = cats.map(cat => `
        <div class="mb-2">
            <p class="text-xs font-semibold text-gray-400 mb-1">${cat.label}</p>
            <div class="flex flex-wrap gap-1">${cat.emojis.map(btnHtml).join('')}</div>
        </div>`).join('');
}
function _selectEmojiGeneric(emoji, hiddenId, displayId, btnClass) {
    document.getElementById(hiddenId).value = emoji;
    const disp = document.getElementById(displayId);
    if (disp) disp.textContent = emoji;
    document.querySelectorAll('.' + btnClass).forEach(btn => {
        const sel = btn.textContent.trim() === emoji;
        btn.style.background = sel ? '#FFF9F0' : '';
        btn.style.border = sel ? '2px solid #FFD166' : '';
    });
}
function _selectColorGeneric(color, hiddenId, btnClass) {
    document.getElementById(hiddenId).value = color;
    document.querySelectorAll('.' + btnClass).forEach(btn => {
        btn.style.borderColor = btn.dataset.color === color ? '#374151' : 'transparent';
        btn.style.transform = btn.dataset.color === color ? 'scale(1.2)' : 'scale(1)';
    });
}

const emojiCategories = [
    {
        label: '🎁 Regalos y accesorios',
        emojis: ['🎁','🎀','🎊','🎉','🎈','🧧','💝','💖','💗','💓','💞','💕','🎗️','🛍️','👜','👛','💍','💎','📿','🪬']
    },
    {
        label: '🐾 Animales',
        emojis: ['🐛','🐶','🐰','🐻','🐼','🐨','🦊','🐸','🐙','🦋','🐝','🦄','🐯','🦁','🐮','🐷','🐧','🦆','🐺','🦝']
    },
    {
        label: '☕ Hogar y cocina',
        emojis: ['☕','🍵','🧁','🎂','🍰','🍩','🧇','🫖','🥂','🍷','🫙','🍶','🥛','🧃','🪴','🕯️','🪔','🫗','🍽️','🥄']
    },
    {
        label: '👗 Moda y ropa',
        emojis: ['👗','👘','🥻','👙','👒','🎩','👟','👠','👡','🧣','🧤','🧥','👔','👕','🩱','🩲','🩳','🧦','🪖','💄']
    },
    {
        label: '📚 Papelería y arte',
        emojis: ['📚','📓','📒','📔','📕','📗','📘','📙','📝','✏️','🖊️','🖌️','🎨','🖍️','📐','📏','✂️','🗂️','📌','🔖']
    },
    {
        label: '🧸 Juguetes y bebés',
        emojis: ['🧸','🪆','🎮','🎯','🎲','🪀','🪁','🧩','🎠','🎡','🪄','🎭','🪅','🛹','🤸','🧒','👶','🍼','🧷','🪃']
    },
    {
        label: '💆 Bienestar y spa',
        emojis: ['💆','🧘','🛁','🪷','🌸','🌺','🌻','🌹','💐','🍃','🌿','🌱','🫧','🧴','🧼','💅','💊','🩺','🫁','🪽']
    },
    {
        label: '🏠 Casa y decoración',
        emojis: ['🏠','🛋️','🪑','🛏️','🪞','🖼️','🪟','🚪','🧹','🪣','🪤','💡','🔦','🪔','⏰','📦','🗑️','🪣','🧺','🪴']
    },
    {
        label: '⭐ Estrellas y símbolos',
        emojis: ['⭐','🌟','✨','💫','🌈','☀️','🌙','❄️','🔥','💧','🌊','🍀','🌺','🌸','🌼','🌻','🦋','🌍','🎵','🎶']
    },
    {
        label: '🔑 Objetos variados',
        emojis: ['🔑','🗝️','📷','📸','🎙️','📱','💻','⌚','🔮','🪄','🧲','🔧','🪛','⚙️','🔩','🧰','📦','🗃️','🪝','🎪']
    }
];

let allEmojis = emojiCategories.flatMap(cat => cat.emojis.map(e => ({ emoji: e, label: cat.label })));

// Búsqueda plana por palabra clave (categoría nueva/editar comparten esta lista)
const CATEGORY_EMOJI_KEYWORDS = {
    'regalo': ['🎁','🎀','🎊','🎉','💝','🛍️'],
    'caja': ['📦','🗃️'],
    'gato': ['🐛'], 'perro': ['🐶'], 'conejo': ['🐰'],
    'ropa': ['👗','👘','👕','👔','🧥'],
    'taza': ['☕','🍵','🫖'],
    'libro': ['📚','📓','📒','📔'],
    'bebe': ['👶','🍼','🧸','🧷'], 'bebé': ['👶','🍼','🧸','🧷'],
    'flor': ['🌸','🌺','🌻','🌹','💐','🌼'],
    'estrella': ['⭐','🌟','✨','💫'],
    'corazon': ['💝','💖','💗','💓','💞','💕'], 'corazón': ['💝','💖','💗','💓','💞','💕'],
    'joya': ['💍','💎','📿'], 'joyeria': ['💍','💎','📿'], 'joyería': ['💍','💎','📿'],
    'spa': ['💆','🧘','🛁','🪷','🌿'],
    'juguete': ['🧸','🪆','🎮','🎯','🎲'],
    'arte': ['🎨','🖌️','✏️','🖍️'],
};

function renderEmojiGrid(filter = '') {
    _renderEmojiPickerGrid('emojiGrid', emojiCategories, CATEGORY_EMOJI_KEYWORDS, filter, 'emoji-btn', 'selectEmoji');
}

function selectEmoji(emoji) {
    _selectEmojiGeneric(emoji, 'categoryEmoji', 'selectedEmojiDisplay', 'emoji-btn');
}

function filterEmojis(value) {
    renderEmojiGrid(value);
}

// ============ EQUIPO EMOJI PICKER ============
const equipoEmojiCats = [
    {
        label: '🖨️ Impresión',
        emojis: ['🖨️','📠','🖥️','💻','📱','📷','📸','🎞️','🗃️','📋','🗄️','🖱️','⌨️','🖲️']
    },
    {
        label: '⚙️ Herramientas y máquinas',
        emojis: ['⚙️','🔧','🪛','🔩','🧰','🔨','🪚','⛏️','🪝','🪤','🧲','🔬','🔭','⚗️','🧪','🔋','💡','🔌','🪫','🛠️']
    },
    {
        label: '✂️ Corte y diseño',
        emojis: ['✂️','🪡','🧵','📐','📏','🖊️','🖌️','✏️','🎨','🖍️','📌','🗂️','📎','🖋️','✒️']
    },
    {
        label: '🔥 Calor y prensado',
        emojis: ['🔥','♨️','🌡️','💨','⚡','☀️','🌊','❄️','💧','🫧','🌬️']
    },
    {
        label: '🤖 Tecnología',
        emojis: ['🤖','💾','💿','📀','🖧','📡','🛰️','🔐','🔑','🗝️','📟','📠','⌚','🕹️','🎮']
    },
    {
        label: '📦 Producción',
        emojis: ['📦','🏭','🏗️','🚜','🔄','♻️','📤','📥','🪣','🗑️','📊','📈','📉','🗺️','📍']
    }
];

const allEquipoEmojis = equipoEmojiCats.flatMap(cat => cat.emojis);

const EQUIPO_EMOJI_KEYWORDS = {
    'impresora': ['🖨️','📠'], 'laser': ['🔬','⚡','💡','🔥'], 'cricut': ['✂️','🪡','🖊️'],
    'plancha': ['🔥','♨️','🌡️'], 'prensa': ['🔧','⚙️','🛠️'], 'dtf': ['🖨️','🔥','♨️'],
    'sublimacion': ['🖨️','♨️','🔥'], 'sublimación': ['🖨️','♨️','🔥'],
    'laminadora': ['📋','🗃️','⚙️'], '3d': ['🤖','⚙️','🔧'], 'rotador': ['🔄','⚙️'],
    'atomstack': ['🔬','⚡','💡'], 'mini': ['⚙️','🔧'], 'cpu': ['💻','🖥️','🖱️'],
    'computadora': ['💻','🖥️'], 'herramienta': ['🔧','🪛','🛠️','🧰'],
    'corte': ['✂️','🪚'], 'calor': ['🔥','♨️'], 'maquina': ['⚙️','🏭','🤖'], 'máquina': ['⚙️','🏭','🤖'],
};

function renderEquipoEmojiGrid(filter = '') {
    _renderEmojiPickerGrid('equipoEmojiGrid', equipoEmojiCats, EQUIPO_EMOJI_KEYWORDS, filter, 'equipo-emoji-btn', 'selectEquipoEmoji');
}

function selectEquipoEmoji(emoji) {
    _selectEmojiGeneric(emoji, 'equipoEmoji', 'equipoEmojiDisplay', 'equipo-emoji-btn');
}

function filterEquipoEmojis(value) {
    renderEquipoEmojiGrid(value);
}

// Inicializar grid cuando se abre el modal
const _origOpenAddCategoryModal = typeof openAddCategoryModal === 'function' ? openAddCategoryModal : null;
function openAddCategoryModal() {
    openModal('addCategoryModal');
    // Reset completo: emoji, color y búsqueda
    document.getElementById('categoryEmoji').value = '📦';
    document.getElementById('selectedEmojiDisplay').textContent = '📦';
    document.getElementById('emojiSearch').value = '';
    document.getElementById('categoryColor').value = '#FFD166';
    setTimeout(() => selectCategoryColor('#FFD166'), 50);
    renderEmojiGrid();
}
        // ============== REFRESCO DE PÁGINA ==============
function refrescarPagina() {
    const icon = document.getElementById('iconRefrescar');
    if (icon) {
        icon.style.transition = 'transform 0.6s ease';
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => { icon.style.transform = ''; }, 650);
    }
    // Determinar sección activa y re-renderizarla
    const seccion = localStorage.getItem('maneki_activeSection') || 'bienvenida';
    try {
        if (seccion === 'dashboard') { updateDashboard(); initChart(); }
        else if (seccion === 'inventory') { renderInventoryTable(); }
        else if (seccion === 'pedidos') { renderPedidosTable(); }
        else if (seccion === 'balance') { renderBalance && renderBalance(); }
        else if (seccion === 'clientes') { renderClientsTable && renderClientsTable(); }
        else if (seccion === 'categorias') { renderCategoriesGrid && renderCategoriesGrid(); }
        else if (seccion === 'analisis') { renderAnalisis && renderAnalisis(); }
        else if (seccion === 'reportes') { renderSalesHistory && renderSalesHistory(); initCategoryChart && initCategoryChart(); }
        else if (seccion === 'equipos') { renderEquiposGrid(); renderRoiHistorial(); }
        manekiToastExport('🔄 Página refrescada', 'ok');
    } catch(e) {
        // Si falla el refresco suave, recargar completo
        location.reload();
    }
}

        // ============== MODO OSCURO ==============

let darkMode = false;

function toggleDarkMode() {
    darkMode = !darkMode;
    applyDarkMode(darkMode);
    localStorage.setItem('maneki_darkMode', darkMode ? '1' : '0');
}

function applyDarkMode(enabled) {
    const body = document.body;
    const icon = document.getElementById('darkModeIcon');
    const btn = document.getElementById('darkModeBtn');

    if (enabled) {
        body.classList.add('dark');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        if (btn) btn.title = 'Modo claro';
    } else {
        body.classList.remove('dark');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        if (btn) btn.title = 'Modo oscuro';
    }
}

// Cargar preferencia guardada al iniciar
(function() {
    const saved = localStorage.getItem('maneki_darkMode');
    if (saved === '1') {
        darkMode = true;
        // Aplicar inmediatamente para evitar flash blanco
        document.addEventListener('DOMContentLoaded', () => applyDarkMode(true));
    }
})();
        // ============== COTIZACIÓN → PEDIDO ==============

async function convertQuoteToPedido(quoteId) {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    showConfirm(`¿Convertir la cotización ${quote.folio} de ${quote.customer} en un pedido por encargo?`, 'Convertir cotización')
    .then(async ok => {
        if (!ok) return;

        // Armar concepto desde los productos de la cotización
        const concepto = quote.products && quote.products.length > 0
            ? quote.products.map(p => `${p.quantity}x ${p.name}`).join(', ')
            : quote.notes || 'Pedido desde cotización';

        // Calcular fecha de entrega sugerida (15 días) — fecha local, no UTC
        const _dCot = new Date();
        const hoy = `${_dCot.getFullYear()}-${String(_dCot.getMonth()+1).padStart(2,'0')}-${String(_dCot.getDate()).padStart(2,'0')}`;
        const fechaEntrega = new Date(_dCot);
        fechaEntrega.setDate(fechaEntrega.getDate() + 15);
        const fechaEntregaStr = `${fechaEntrega.getFullYear()}-${String(fechaEntrega.getMonth()+1).padStart(2,'0')}-${String(fechaEntrega.getDate()).padStart(2,'0')}`;

        // Crear el pedido
        const nuevoPedido = {
            id: mkId(),
            folio: await generarFolioPedido(),
            cliente: quote.customer,
            telefono: '',
            redes: '',
            fecha: hoy,
            entrega: fechaEntregaStr,
            concepto: concepto,
            cantidad: quote.products ? quote.products.reduce((s, p) => s + p.quantity, 0) : 1,
            costo: 0,
            anticipo: 0,
            total: quote.total,
            resta: quote.total,
            notas: quote.notes || '',
            status: 'confirmado',
            fechaCreacion: hoy,
            productosInventario: quote.productosInventario || quote.products || [],
            fromQuote: quote.folio
        };

        pedidos.push(nuevoPedido);
        savePedidos();

        // Marcar cotización como convertida
        quote.convertedToPedido = true;
        quote.status = 'approved';
        saveQuotes();

        if (typeof renderQuotesTable === 'function') renderQuotesTable();
        renderPedidosTable();
        updateDashboard();

        manekiToastExport(`✅ Pedido ${nuevoPedido.folio} creado desde cotización`, 'ok');

        // Preguntar si ir a pedidos
        showConfirm(`Pedido ${nuevoPedido.folio} creado exitosamente. ¿Ir a Pedidos para ajustar detalles?`, '✅ Pedido creado')
        .then(ir => { if (ir) showSection('pedidos'); });
    });
}