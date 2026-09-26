-- Bicho Core: hoqcrljgmamaumtdrtzi
-- Aplicada y verificada en produccion el 2026-09-26; prueba revertida con method efectivo.
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
