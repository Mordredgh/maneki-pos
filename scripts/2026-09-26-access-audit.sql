-- Solo lectura. Ejecutar en Bicho Core antes de proponer cambios RLS.
-- No retorna clientes, pedidos, tokens ni credenciales.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname;

SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee IN ('anon','authenticated')
ORDER BY table_name, grantee, privilege_type;

SELECT p.proname, p.prosecdef AS security_definer,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' ORDER BY p.proname;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_schema='public' AND table_name='incomes'
ORDER BY ordinal_position;
