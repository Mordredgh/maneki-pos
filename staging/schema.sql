-- Estructura de columnas observada en information_schema 2026-09-26.
-- Solo datos sinteticos. No replica triggers/constraints de produccion.
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION public.is_admin(uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT $1='00000000-0000-4000-8000-000000000001'::uuid $$;
CREATE TABLE public.categories (id text PRIMARY KEY,name text,emoji text,color text);
CREATE TABLE public.clients (id text PRIMARY KEY,name text,phone text,facebook text,email text,type text,notas text,total_purchases numeric,last_purchase text,is_vip boolean,created_at timestamp with time zone,address text,tags jsonb,updated_at timestamp with time zone);
CREATE TABLE public.expenses (id bigint PRIMARY KEY,concept text,amount numeric,date text,category text,etiqueta text,notas text,from_payable boolean,created_at timestamp with time zone);
CREATE TABLE public.incomes (id bigint PRIMARY KEY,concept text,amount numeric,date text,client text,from_pos boolean,folio_origen text,pedido_id text,created_at timestamp with time zone,method text);
CREATE TABLE public.orders (id text PRIMARY KEY,folio text,cliente text,telefono text,redes text,fecha text,entrega text,concepto text,cantidad integer,costo numeric,anticipo numeric,total numeric,resta numeric,notas text,status text,fecha_creacion text,productos_inventario jsonb,inventario_descontado boolean,from_quote text,created_at timestamp with time zone,updated_at timestamp with time zone,whatsapp text,facebook text,lugar_entrega text,costo_materiales numeric,prioridad text,notas_internas text,pagos jsonb,empaques jsonb,historial_estados jsonb,fecha_ultimo_estado text,fecha_pedido text,empaques_descontados boolean,inventario_ya_finalizado boolean,ocasion text);
CREATE TABLE public.orders_finalizados (LIKE public.orders INCLUDING ALL); ALTER TABLE public.orders_finalizados ADD COLUMN fecha_finalizado text;
CREATE TABLE public.products (id text PRIMARY KEY,name text,sku text,category text,tipo text,cost numeric,price numeric,stock integer,stock_min integer,image text,image_url text,tags jsonb,variants jsonb,tabla_precios_variable jsonb DEFAULT '[]'::jsonb,mp_componentes jsonb,proveedor text,notas text,historial_precios jsonb,publicar_tienda boolean,created_at timestamp with time zone,updated_at timestamp with time zone,unidad text,proveedor_url text,es_empaque boolean,usa_variantes boolean,rendimiento_por_hoja integer,punto_reorden integer,historial_costos jsonb,movimientos jsonb,compra_paquete jsonb,kit_componentes jsonb,is_kit boolean,activo boolean,description text,ocasiones jsonb,precio_texto text,badge text,badge_pos text,color_representativo text,colores jsonb,size_guide text,free_shipping boolean);
CREATE TABLE public.sales_history (id text PRIMARY KEY,folio text,date text,"time" text,customer text,concept text,note text,products jsonb,subtotal numeric,discount numeric,tax numeric,total numeric,method text,created_at timestamp with time zone,type text,discount_percent numeric,tax_percent numeric,pedido_id text,folio_origen text);
CREATE TABLE public.stock_movements (id uuid PRIMARY KEY,producto_id text,producto_nombre text,tipo text,cantidad integer,motivo text,stock_antes integer,stock_despues integer,fecha timestamp with time zone);
CREATE TABLE public.store (key text PRIMARY KEY,value text);
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
DO $policy$ DECLARE t text; BEGIN
FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
EXECUTE format('CREATE POLICY admin ON public.%I TO authenticated USING(public.is_admin(auth.uid())) WITH CHECK(public.is_admin(auth.uid()))',t);
END LOOP; END $policy$;
