BEGIN;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pos_detalle jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.orders_finalizados ADD COLUMN IF NOT EXISTS pos_detalle jsonb NOT NULL DEFAULT '{}'::jsonb;
NOTIFY pgrst, 'reload schema';
COMMIT;
