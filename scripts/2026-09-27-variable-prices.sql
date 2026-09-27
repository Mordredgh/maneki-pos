-- Conserva los rangos de precio de los productos variables tras recargar el POS.
BEGIN;
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS tabla_precios_variable jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Rescata rangos historicos del respaldo KV del mismo proyecto. Solo rellena vacios.
WITH legacy AS (
    SELECT jsonb_array_elements(value::jsonb) AS product
    FROM public.store
    WHERE key = 'products'
)
UPDATE public.products AS current_product
SET tabla_precios_variable = legacy.product->'tablaPreciosVariable'
FROM legacy
WHERE current_product.id = legacy.product->>'id'
  AND current_product.tipo = 'producto_variable'
  AND current_product.tabla_precios_variable = '[]'::jsonb
  AND jsonb_typeof(legacy.product->'tablaPreciosVariable') = 'array'
  AND jsonb_array_length(legacy.product->'tablaPreciosVariable') > 0;
COMMIT;
