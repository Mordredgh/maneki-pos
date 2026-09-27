-- Cobros nuevos usan UUID; conserva literalmente todos los IDs numericos previos.
-- Verificado: sin identity, default ni FK entrantes en ambas tablas.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE public.incomes ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.expenses ALTER COLUMN id TYPE text USING id::text;
NOTIFY pgrst, 'reload schema';
COMMIT;
