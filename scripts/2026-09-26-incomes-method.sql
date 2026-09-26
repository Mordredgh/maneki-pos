-- Bicho Core: hoqcrljgmamaumtdrtzi
-- Preparada durante la auditoria. NO ejecutada contra produccion.
-- Aditiva: conserva filas existentes y deja NULL donde no se conoce el metodo.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.incomes ADD COLUMN IF NOT EXISTS method text;
NOTIFY pgrst, 'reload schema';
COMMIT;

-- Verificacion posterior (solo lectura):
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'incomes' AND column_name = 'method';
