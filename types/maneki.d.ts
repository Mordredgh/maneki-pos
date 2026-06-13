// ══════════════════════════════════════════════════════════════
// MANEKI STORE — TypeScript Definitions
// ══════════════════════════════════════════════════════════════

// ── DOM type extensions ──────────────────────────────────────────────────
// This codebase uses getElementById/querySelector liberally and accesses
// .value/.checked/.disabled on the results. Rather than cast 700+ sites,
// we extend the base DOM types.

interface HTMLElement {
    value: any;
    checked: boolean;
    disabled: boolean;
    files: FileList | null;
    src: string;
    selectedIndex: number;
    options: HTMLOptionsCollection;
    type: string;
    name: string;
    placeholder: string;
    readOnly: boolean;
    required: boolean;
    min: string;
    max: string;
    step: string;
    multiple: boolean;
    accept: string;
    href: string;
    htmlFor: string;
    width: number;
    height: number;
    reset(): void;
    select(): void;
    setCustomValidity(msg: string): void;
    reportValidity(): boolean;
    checkValidity(): boolean;
    _mkBound: boolean;
    _mkSubmitBound: boolean;
    _syncHandler: Function;
    _lastVal: any;
    _timer: any;
    _mkDirty: boolean;
    [key: string]: any;
}

interface Element {
    value: any;
    checked: boolean;
    disabled: boolean;
    files: FileList | null;
    src: string;
    type: string;
    name: string;
    width: number;
    height: number;
    [key: string]: any;
}

interface EventTarget {
    value: any;
    checked: boolean;
    disabled: boolean;
    files: FileList | null;
    dataset: DOMStringMap;
    closest(selectors: string): Element | null;
    classList: DOMTokenList;
    tagName: string;
    style: CSSStyleDeclaration;
    parentElement: HTMLElement | null;
    id: string;
}

interface Node {
    matches(selectors: string): boolean;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    querySelector(selectors: string): Element | null;
}

interface Function {
    _mk4: any;
    _enviosHook: any;
}

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
    packComponentes?: any[];
    proveedor?: string;
    proveedorUrl?: string;
    proveedorNombre?: string;
    proveedorNotas?: string;
    unidad?: string;
    notas?: string;
    esEmpaque?: boolean;
    usaVariantes?: boolean;
    rendimientoPorHoja?: number;
    tablaPreciosVariable?: any[];
    historialPrecios?: any[];
    historialCostos?: any[];
    movimientos?: any[];
    compraPaquete?: { cantidad: number; precio: number };
    updatedAt?: string;
    deletedAt?: string;
    _tieneComponentesHuerfanos?: boolean;
    [key: string]: any;
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
    nombre?: string;
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
    prioridad?: string;
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
    tipoEntrega?: string;
    direccionEntrega?: string;
    fotosReferencia?: string[];
    [key: string]: any;
}

interface ManekiPago {
    id: string;
    tipo: string;
    monto: number;
    amount?: number;
    fecha: string;
    hora?: string;
    metodo?: string;
    nota?: string;
    [key: string]: any;
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
    type?: string;
    totalPurchases?: number;
    lastPurchase?: string;
    notas?: string;
    tags?: string[];
    updated_at?: string;
    [key: string]: any;
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
    type?: string;
    products?: ManekiPedidoItem[];
    subtotal?: number;
    discount?: number;
    tax?: number;
    [key: string]: any;
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
    logo?: any;
    logoMode?: string;
    metaMensual?: number;
    telegramToken?: string;
    telegramChatId?: string;
    telegramChatId1?: string;
    telegramChatId2?: string;
    theme?: string;
    stockMinimo?: number;
    [key: string]: any;
}

interface ManekiState {
    _ptVariants: any[];
    _ptMpComponentes: any[];
    _mpVariantes: any[];
    _mpTagsActuales: string[];
    _packComponentes: any[];
    _packMpDirectos: any[];
    _pvMpComponentes: any[];
    _pvTablaPreciosVariable: any[];
    edicionProductoId: string | null;
    currentProductImageFile: File | null;
    currentProductImage: string | null;
    currentVariants: any[];
    modoEdicion: boolean;
    _invSortCol: string;
    _invSortDir: string;
    _invStockCache: Map<string, number>;
    _invPageSize: number;
    pedidoProductosSeleccionados: any[];
    pedidoEmpaquesSeleccionados: any[];
    _folioCounter: number;
    _folioCounterReady: Promise<void>;
    _kanbanExpandidos: Set<string>;
    _kanbanTouchAbort: AbortController;
    _mk4: any;
    _errorLog: any[];
    _entregasCheckInterval: any;
    _mkRTSetupDone: boolean;
    _autoBackupInterval: any;
    _ajustarStockId: string | null;
    [key: string]: any;
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
    saldo: (p: any) => number;
    stockOf: (p: any) => number;
    save: (key: string) => Promise<void>;
    toast: (msg: string, type?: string) => void;
    navigate: (section: string) => void;
    version: string;
    state: ManekiState;
}

// ── Window interface extension ──────────────────────────────────────────────
interface Window {
    // Core data
    products: ManekiProduct[];
    pedidos: ManekiPedido[];
    pedidosFinalizados: ManekiPedido[];
    clients: ManekiClient[];
    salesHistory: ManekiSale[];
    incomes: any[];
    expenses: any[];
    categories: any[];
    storeConfig: ManekiStoreConfig;
    quotes: any[];
    equipos: any[];
    notas: any[];
    gastosRecurrentes: any[];
    ingresosRecurrentes: any[];
    stockMovimientos: any[];
    receivables: any[];
    payables: any[];
    abonos: any[];
    productMap: Map<string, ManekiProduct>;

    // Namespace
    MK: ManekiNamespace;
    MKS: any;

    // Module state — inventory
    _ptVariants: any[];
    _ptMpComponentes: any[];
    _mpVariantes: any[];
    _mpTagsActuales: string[];
    _packComponentes: any[];
    _packMpDirectos: any[];
    _pvMpComponentes: any[];
    _pvTablaPreciosVariable: any[];
    edicionProductoId: string | null;
    currentProductImageFile: File | null;
    currentProductImage: string | null;
    currentVariants: any[];
    modoEdicion: boolean;

    // Module state — pedidos
    pedidoProductosSeleccionados: any[];
    pedidoEmpaquesSeleccionados: any[];
    _folioCounter: number;
    _folioCounterReady: Promise<void>;
    _kanbanExpandidos: Set<string>;
    _kanbanTouchAbort: AbortController;

    // Module state — config
    _mk4: any;
    _errorLog: any[];
    _entregasCheckInterval: any;
    _mkRTSetupDone: boolean;

    // Module state — inventory sorting/pagination
    _invSortCol: string;
    _invSortDir: string;
    _invStockCache: Map<string, number>;
    _invPageSize: number;

    // Functions — core
    _fechaHoy: () => string;
    _fechaLocalDe: (d: Date) => string;
    _esc: (s: string) => string;
    _escAttr: (s: string) => string;
    _safeLogo: (url: string) => string;
    _normSearch: (s: string) => string;
    mkId: () => string;
    mkHandleError: (err: any, context?: string) => void;
    calcSaldoPendiente: (p: any) => number;
    getStockEfectivo: (p: any) => number;
    calcularDisponibilidadDesdeMP: (p: any, pMap?: Map<string, any>, sCache?: Map<string, number>) => any;
    calcularProducibles: (p: any) => number | null;

    // Functions — save
    saveProducts: () => Promise<void>;
    savePedidos: () => Promise<void>;
    savePedidosFinalizados: () => Promise<void>;
    saveClients: () => void;
    saveSalesHistory: () => void;
    saveIncomes: () => void;
    saveExpenses: () => void;
    saveCategories: () => void;
    saveQuotes: () => void;

    // Functions — navigation & UI
    showSection: (name: string) => void;
    openModal: (id: string) => void;
    closeModal: (id: string | HTMLElement) => void;
    showConfirm: (msg: string, title?: string) => Promise<boolean>;
    manekiToastExport: (msg: string, tipo?: string) => void;
    _mkTrapFocus: (el: HTMLElement) => void;
    _mkReleaseFocus: (el: HTMLElement) => void;
    _mkModalSaved: (el: HTMLElement) => void;

    // Functions — renders
    renderInventoryTable: () => void;
    renderPedidosTable: () => void;
    renderKanbanBoard: () => void;
    renderClientsTable: () => void;
    renderBalance: () => void;
    updateDashboard: () => void;
    initReports: () => void;

    // Functions — inventory modals
    openAddProductModal: (id?: string) => void;
    openAddMateriaPrimaModal: () => void;
    openServicioModal: (id?: string) => void;
    openVariableProductModal: (id?: string) => void;
    openPackModal: (id?: string) => void;
    openPtModal: () => void;
    openMpModal: () => void;
    openSvcModal: () => void;
    injectPtModal: () => void;
    injectMpModal: () => void;
    injectSvcModal: () => void;
    injectPackModal: () => void;
    injectVariableProductModal: () => void;
    editProduct: (id: string) => void;
    deleteProduct: (id: string) => void;

    // Functions — pedidos
    openPedidoModal: (id?: string) => void;
    closePedidoModal: () => void;
    _migrarAnticiposLegacy: () => void;
    _descontarEmpaquesInventario: (p: any) => number;
    eliminarPedidoFinalizado: (id: string) => void;
    _invalidarCacheVentas: () => void;
    _kanbanVerMas: (col: string) => void;
    checkAlertasEntregas: () => void;
    checkAlertasCobro: () => void;

    // Functions — misc
    registrarMovimiento: (data: any) => void;
    sbSave: (key: string, data: any) => Promise<void>;
    sbLoad: (key: string, def?: any) => Promise<any>;
    subirImagenStorage: (file: File) => Promise<string | null>;
    _setupRealtime: () => void;
    mkOpenCommandPalette: () => void;
    mkToggleDensidad: (modo?: string) => void;
    mkAplicarDensidad: () => void;

    // External libs
    supabase: any;
    Chart: any;
    html2pdf: any;
    XLSX: any;
    L: any;
    pako: any;

    // Allow arbitrary window properties
    [key: string]: any;
}

// ── External libraries (not in our source) ──────────────────────────────────
declare var supabase: any;
declare var Chart: any;
declare var html2pdf: any;
declare var XLSX: any;
declare var L: any;
declare var pako: any;

// ── Globals set on window.* only (no top-level var/let/const in source) ──────
declare var MK: ManekiNamespace;
declare var productMap: Map<string, ManekiProduct>;

// ── Functions inside IIFEs/closures (need declare to be visible cross-file) ──
declare function _esc(s: string): string;
declare function _escAttr(s: string): string;
declare function renderClientsTable(): void;
declare function checkAlertasEntregas(): void;
declare function renderBalance(): void;
declare function showConfirm(message: string, title?: string): Promise<boolean>;

// ── Cross-file helpers (TS2304 missing name contexts) ────────────────────────
declare function _mkColorDot(color: string): string;
declare function _mkAvatar(name: string): string;
declare function _mkColorEmoji(name: string): string;
declare function _mkUpdatePedidosTotals(): void;
declare function _mkTimeline(entries: any[]): string;
declare function _sumLineas(items: any[]): number;
declare function openProductModal(tipo?: string, id?: string): void;
declare function renderKanban(): void;
declare function mkDebounce(fn: Function, ms: number): Function;
declare function setupSearchFilter(inputId: string, containerId: string, renderFn: Function): void;
declare function renderQuotesTable(): void;
declare function guardarDatos(): void;
declare function _money(n: number): string;
declare function fmtMoney(amount: any): string;
declare function eliminarPedidoFinalizado(id: string): void;
declare function _invalidarCacheVentas(): void;
declare function _safeLogo(url: string): string;
declare function _normSearch(s: string): string;
declare function mkId(): string;
declare function mkHandleError(err: any, context?: string): void;
declare function _fechaLocalDe(d: Date): string;
declare function mkOpenCommandPalette(): void;
declare function mkToggleDensidad(modo?: string): void;
declare function mkAplicarDensidad(): void;
declare function openAddProductModal(id?: string): void;
declare function injectMpModal(): void;
declare function injectSvcModal(): void;
declare function injectPackModal(): void;
declare function injectVariableProductModal(): void;
declare function closePedidoModal(): void;
declare function deleteProduct(id: string): void;
declare function _descontarEmpaquesInventario(p: any): number;
declare function _kanbanVerMas(col: string): void;
declare function _migrarAnticiposLegacy(): void;
declare function closeTransactionModal(): void;
declare var MKS: any;
declare var autocompleteIndex: number;
declare var webkitAudioContext: any;
