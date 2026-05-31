// ══════════════════════════════════════════════════════════════
// MANEKI STORE — TypeScript Definitions
// Habilita autocompletado e IntelliSense en VS Code sin reescribir JS
// ══════════════════════════════════════════════════════════════

interface ManekiProduct {
    id: string;
    name: string;
    sku?: string;
    category?: string;
    tipo?: 'producto' | 'materia_prima' | 'servicio' | 'producto_variable' | 'producto_interno' | 'pack';
    cost?: number;
    price?: number;
    stock?: number;
    stockMin?: number;
    puntoReorden?: number;
    image?: string;
    imageUrl?: string;
    tags?: string[];
    variants?: ManekiVariant[];
    mpComponentes?: ManekiComponent[];
    proveedor?: string;
    proveedorUrl?: string;
    unidad?: string;
    notas?: string;
    esEmpaque?: boolean;
    usaVariantes?: boolean;
    rendimientoPorHoja?: number;
    historialPrecios?: any[];
    historialCostos?: any[];
    movimientos?: any[];
    updatedAt?: string;
}

interface ManekiVariant {
    type?: string;
    tipo?: string;
    value?: string;
    valor?: string;
    qty?: number;
}

interface ManekiComponent {
    id: string;
    name?: string;
    qty?: number;
    costUnit?: number;
}

interface ManekiPedido {
    id: string;
    folio?: string;
    cliente?: string;
    telefono?: string;
    whatsapp?: string;
    redes?: string;
    facebook?: string;
    fechaPedido?: string;
    entrega?: string;
    concepto?: string;
    cantidad?: number;
    costo?: number;
    total?: number;
    anticipo?: number;
    resta?: number;
    notas?: string;
    notasInternas?: string;
    lugarEntrega?: string;
    costoMateriales?: number;
    prioridad?: 'alta' | 'normal' | 'baja';
    status?: string;
    pagos?: ManekiPago[];
    productosInventario?: ManekiPedidoItem[];
    empaques?: ManekiPedidoItem[];
    historialEstados?: ManekiEstadoEntry[];
    inventarioDescontado?: boolean;
    empaquesDescontados?: boolean;
    fechaCreacion?: string;
    fechaUltimoEstado?: string;
    fechaFinalizado?: string;
    fechaCancelado?: string;
}

interface ManekiPago {
    id: string;
    tipo: string;
    monto: number;
    fecha: string;
    hora?: string;
    metodo?: string;
    nota?: string;
}

interface ManekiPedidoItem {
    id: string;
    name?: string;
    nombre?: string;
    price?: number;
    precio?: number;
    quantity?: number;
    cantidad?: number;
    variante?: string;
}

interface ManekiEstadoEntry {
    estado?: string;
    status?: string;
    fecha: string;
    hora?: string;
    nota?: string;
}

interface ManekiClient {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    facebook?: string;
    type?: 'regular' | 'vip';
    totalPurchases?: number;
    lastPurchase?: string;
    notas?: string;
}

interface ManekiSale {
    id: string;
    folio?: string;
    date?: string;
    time?: string;
    customer?: string;
    concept?: string;
    note?: string;
    total?: number;
    method?: string;
    type?: 'venta' | 'pedido' | 'abono' | 'anticipo';
    products?: ManekiPedidoItem[];
    subtotal?: number;
    discount?: number;
    tax?: number;
}

interface ManekiStoreConfig {
    name?: string;
    slogan?: string;
    emoji?: string;
    phone?: string;
    facebook?: string;
    email?: string;
    footer?: string;
    address?: string;
    logo?: string;
    logoMode?: string;
    metaMensual?: number;
}

interface ManekiNamespace {
    products: ManekiProduct[];
    pedidos: ManekiPedido[];
    pedidosFinalizados: ManekiPedido[];
    clients: ManekiClient[];
    salesHistory: ManekiSale[];
    expenses: any[];
    incomes: any[];
    categories: any[];
    storeConfig: ManekiStoreConfig;
    fechaHoy: string;
    esc: (s: string) => string;
    saldo: (p: ManekiPedido) => number;
    stockOf: (p: ManekiProduct) => number;
    save: (key: string) => Promise<void>;
    toast: (msg: string, type?: string) => void;
    navigate: (section: string) => void;
    version: string;
}

// Global data
declare var MK: ManekiNamespace;
declare var products: ManekiProduct[];
declare var pedidos: ManekiPedido[];
declare var pedidosFinalizados: ManekiPedido[];
declare var clients: ManekiClient[];
declare var salesHistory: ManekiSale[];
declare var storeConfig: ManekiStoreConfig;
declare var categories: any[];
declare var incomes: any[];
declare var expenses: any[];
declare var receivables: any[];
declare var payables: any[];
declare var quotes: any[];
declare var abonos: any[];
declare var equipos: any[];
declare var notas: any[];
declare var db: any;
declare var gastosRecurrentes: any[];
declare var stockMovimientos: any[];
declare var ipcRenderer: any;
declare var _allVentasCache: any;
declare var autocompleteIndex: any;

// External libs
declare var supabase: any;
declare var Chart: any;
declare var html2pdf: any;
declare var XLSX: any;
declare var L: any;
declare var webkitAudioContext: any;

// DB & storage
declare function _fechaHoy(): string;
declare function _esc(s: string): string;
declare function calcSaldoPendiente(p: ManekiPedido): number;
declare function getStockEfectivo(p: ManekiProduct): number;
declare function sbSave(key: string, data: any): Promise<void>;
declare function sbLoad(key: string, def?: any): Promise<any>;
declare var sqliteStorage: { set(key: string, data: any): Promise<boolean>; get(key: string, def?: any): Promise<any>; getAll(keys: string[]): Promise<any>; getSize(): Promise<any>; };
declare function _setupRealtime(): void;
declare function _migrateToRelationalIfEmpty(): Promise<void>;
declare function sincronizarPendientes(): Promise<void>;
declare function subirImagenStorage(file: File): Promise<string | null>;

// Save functions
declare function saveProducts(): Promise<void>;
declare function savePedidos(): Promise<void>;
declare function savePedidosFinalizados(): Promise<void>;
declare function saveClients(): void;
declare function saveSalesHistory(): void;
declare function saveIncomes(): void;
declare function saveExpenses(): void;
declare function saveCategories(): void;
declare function saveQuotes(): void;
declare function saveReceivables(): void;
declare function savePayables(): void;
declare function saveStockMovimientos(): void;
declare function saveGastosRecurrentes(): void;

// Navigation & UI
declare function showSection(name: string): void;
declare function openModal(id: string): void;
declare function closeModal(id: string | HTMLElement): void;
declare function showConfirm(message: string, title?: string): Promise<boolean>;
declare function manekiToastExport(msg: string, tipo?: string): void;
declare function mostrarBannerConexion(online: boolean, msg: string): void;

// Renders
declare function renderInventoryTable(): void;
declare function renderPedidosTable(): void;
declare function renderClientsTable(): void;
declare function renderBalance(): void;
declare function renderSalesHistory(): void;
declare function renderAnalisis(): void;
declare function renderBienvenida(): void;
declare function renderKanban(): void;
declare function renderQuotesTable(): void;
declare function updateDashboard(): void;
declare function initChart(): void;
declare function initReports(): void;
declare function initCategoryChart(): void;
declare function updateStorePreview(): void;
declare function loadStoreConfigUI(): void;

// Helpers
declare function _mkAvatar(name: string): string;
declare function _mkColorDot(color: string): string;
declare function _mkColorEmoji(status: string): string;
declare function _mkTimeline(status: string): string;
declare function _mkUpdatePedidosTotals(): void;
declare function _money(n: number): string;
declare function _sumLineas(items: any[]): number;
declare function setupSearchFilter(): void;
declare function setupMobileMenu(): void;
declare function openProductModal(id?: string): void;
declare function poblarSelectPedido(): void;
declare function guardarDatos(): void;
declare function actualizarBadgePOS(): void;

declare function registrarMovimiento(productoId: string, productoNombre: string, tipo: string, cantidad: number, motivo?: string): void;

declare var MKS: any;
