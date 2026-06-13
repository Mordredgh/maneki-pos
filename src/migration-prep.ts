// ══════════════════════════════════════════════════════════════
// MANEKI — Preparación para migración de Supabase
//
// ESTADO ACTUAL: Todo en tabla `store` como key-value JSON blobs
//   { key: 'products', value: '[...todo el array como string...]' }
//   Problema: cada save de 1 producto sube TODOS los productos
//
// ESTADO OBJETIVO: Tablas relacionales individuales
//   products(id, name, sku, price, cost, stock, category_id, ...)
//   orders(id, folio, cliente, total, status, ...)
//   order_items(id, order_id, product_id, quantity, price, ...)
//   clients(id, name, phone, email, type, ...)
//   sales(id, folio, date, total, method, customer, ...)
//   expenses(id, concept, amount, date, category, ...)
//
// PLAN DE MIGRACIÓN (para ejecutar en sesión dedicada):
// 1. Crear tablas con RLS en Supabase (SQL)
// 2. Migrar datos de store.value → tablas individuales
// 3. Reescribir sbSave/sbLoad para usar INSERT/UPDATE individuales
// 4. Mantener store como fallback durante transición
// ══════════════════════════════════════════════════════════════

window._mkMigrationPrep = {
    // Estimar tamaño de datos actuales
    async estimateDataSize() {
        const keys = ['products','pedidos','pedidosFinalizados','salesHistory',
                      'clients','expenses','incomes','categories','quotes',
                      'receivables','payables','equipos','stockMovimientos'];
        const report = {};
        let totalKB = 0;

        for (const key of keys) {
            const data = window[key] || [];
            const json = JSON.stringify(data);
            const kb = Math.round(json.length / 1024 * 10) / 10;
            report[key] = {
                records: Array.isArray(data) ? data.length : 1,
                sizeKB: kb,
                avgRecordBytes: Array.isArray(data) && data.length > 0
                    ? Math.round(json.length / data.length) : 0
            };
            totalKB += kb;
        }

        report._total = { totalKB: Math.round(totalKB * 10) / 10 };
        report._recommendation = totalKB > 500
            ? '🔴 URGENTE: Más de 500KB en JSON blobs — migrar a tablas individuales'
            : totalKB > 100
                ? '🟡 PRONTO: Datos creciendo — planear migración'
                : '🟢 OK por ahora, pero migrar antes de llegar a 500 registros por tabla';

        return report;
    },

    // SQL para crear las tablas objetivo (dry-run — solo muestra el SQL)
    getTargetSQL() {
        return `
-- ══════════════════════════════════════════════════
-- MANEKI STORE — Schema objetivo (tablas relacionales)
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════════════

-- Productos / Inventario
CREATE TABLE IF NOT EXISTS mk_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT,
    price NUMERIC(10,2) DEFAULT 0,
    cost NUMERIC(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    stock_min INTEGER DEFAULT 5,
    category TEXT,
    tipo TEXT DEFAULT 'producto',
    image TEXT,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    proveedor TEXT,
    notas TEXT,
    variants JSONB DEFAULT '[]',
    mp_componentes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pedidos por Encargo
CREATE TABLE IF NOT EXISTS mk_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE,
    cliente TEXT NOT NULL,
    telefono TEXT,
    redes TEXT,
    concepto TEXT,
    total NUMERIC(10,2) DEFAULT 0,
    anticipo NUMERIC(10,2) DEFAULT 0,
    resta NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'confirmado',
    fecha_pedido DATE,
    fecha_entrega DATE,
    fecha_finalizado TIMESTAMPTZ,
    notas TEXT,
    notas_internas TEXT,
    lugar_entrega TEXT,
    costo_materiales NUMERIC(10,2) DEFAULT 0,
    prioridad TEXT DEFAULT 'normal',
    pagos JSONB DEFAULT '[]',
    productos_inventario JSONB DEFAULT '[]',
    empaques JSONB DEFAULT '[]',
    historial_estados JSONB DEFAULT '[]',
    inventario_descontado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes
CREATE TABLE IF NOT EXISTS mk_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    facebook TEXT,
    type TEXT DEFAULT 'normal',
    total_purchases NUMERIC(10,2) DEFAULT 0,
    last_purchase DATE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de Ventas
CREATE TABLE IF NOT EXISTS mk_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT,
    date DATE,
    time TEXT,
    customer TEXT,
    concept TEXT,
    total NUMERIC(10,2),
    method TEXT,
    type TEXT DEFAULT 'venta',
    products JSONB DEFAULT '[]',
    discount NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Gastos
CREATE TABLE IF NOT EXISTS mk_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept TEXT,
    amount NUMERIC(10,2),
    date DATE,
    category TEXT,
    etiqueta TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ingresos
CREATE TABLE IF NOT EXISTS mk_incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept TEXT,
    amount NUMERIC(10,2),
    date DATE,
    client TEXT,
    from_pos BOOLEAN DEFAULT false,
    folio_origen TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (habilitar row-level security)
ALTER TABLE mk_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mk_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mk_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE mk_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mk_incomes ENABLE ROW LEVEL SECURITY;

-- Política: anon key puede leer/escribir todo (app single-tenant)
CREATE POLICY "allow_all" ON mk_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_incomes FOR ALL USING (true) WITH CHECK (true);

-- Índices para queries comunes
CREATE INDEX IF NOT EXISTS idx_orders_folio ON mk_orders(folio);
CREATE INDEX IF NOT EXISTS idx_orders_status ON mk_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_cliente ON mk_orders(cliente);
CREATE INDEX IF NOT EXISTS idx_orders_fecha ON mk_orders(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_sales_date ON mk_sales(date);
CREATE INDEX IF NOT EXISTS idx_products_tipo ON mk_products(tipo);
CREATE INDEX IF NOT EXISTS idx_products_category ON mk_products(category);
`;
    },

    // Mostrar reporte en consola
    async report() {
        const data = await this.estimateDataSize();
        console.log('%c📊 Maneki Migration Report', 'font-size:14px;font-weight:800;color:#C5973B');
        console.table(data);
        console.log(data._recommendation);
        // SQL schema omitted from console in production — call this.getTargetSQL() manually if needed
        if (typeof manekiToastExport === 'function') {
            manekiToastExport(`📊 Datos: ${data._total.totalKB}KB en JSON blobs. ${data._recommendation}`, 'info');
        }
        return data;
    }
};

// Accesible desde consola: _mkMigrationPrep.report()
console.log('%c💡 Migration prep loaded — run _mkMigrationPrep.report() to see data analysis', 'color:#9ca3af;font-size:10px');
