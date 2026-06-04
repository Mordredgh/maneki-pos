"use strict";window._mkMigrationPrep={async estimateDataSize(){const e=["products","pedidos","pedidosFinalizados","salesHistory","clients","expenses","incomes","categories","quotes","receivables","payables","equipos","stockMovimientos"],T={};let o=0;for(const t of e){const E=window[t]||[],a=JSON.stringify(E),r=Math.round(a.length/1024*10)/10;T[t]={records:Array.isArray(E)?E.length:1,sizeKB:r,avgRecordBytes:Array.isArray(E)&&E.length>0?Math.round(a.length/E.length):0},o+=r}return T._total={totalKB:Math.round(o*10)/10},T._recommendation=o>500?"\u{1F534} URGENTE: M\xE1s de 500KB en JSON blobs \u2014 migrar a tablas individuales":o>100?"\u{1F7E1} PRONTO: Datos creciendo \u2014 planear migraci\xF3n":"\u{1F7E2} OK por ahora, pero migrar antes de llegar a 500 registros por tabla",T},getTargetSQL(){return`
-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
-- MANEKI STORE \u2014 Schema objetivo (tablas relacionales)
-- Ejecutar en Supabase SQL Editor
-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

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

-- Pol\xEDtica: anon key puede leer/escribir todo (app single-tenant)
CREATE POLICY "allow_all" ON mk_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON mk_incomes FOR ALL USING (true) WITH CHECK (true);

-- \xCDndices para queries comunes
CREATE INDEX IF NOT EXISTS idx_orders_folio ON mk_orders(folio);
CREATE INDEX IF NOT EXISTS idx_orders_status ON mk_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_cliente ON mk_orders(cliente);
CREATE INDEX IF NOT EXISTS idx_orders_fecha ON mk_orders(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_sales_date ON mk_sales(date);
CREATE INDEX IF NOT EXISTS idx_products_tipo ON mk_products(tipo);
CREATE INDEX IF NOT EXISTS idx_products_category ON mk_products(category);
`},async report(){const e=await this.estimateDataSize();return console.log("%c\u{1F4CA} Maneki Migration Report","font-size:14px;font-weight:800;color:#C5A572"),console.table(e),console.log(e._recommendation),typeof manekiToastExport=="function"&&manekiToastExport(`\u{1F4CA} Datos: ${e._total.totalKB}KB en JSON blobs. ${e._recommendation}`,"info"),e}},console.log("%c\u{1F4A1} Migration prep loaded \u2014 run _mkMigrationPrep.report() to see data analysis","color:#9ca3af;font-size:10px");
//# sourceMappingURL=migration-prep.js.map
