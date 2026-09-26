-- Aplicada 2026-09-26: propietario confirma que el bot ya no existe. Verificada con roles anon/authenticated y ROLLBACK.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE POLICY pos_store_read_guard ON public.store AS RESTRICTIVE FOR SELECT TO public
USING (public.is_admin(auth.uid()) OR key=ANY(ARRAY['categories','site_theme','site_badges','storeConfig','site_content']));
CREATE POLICY pos_store_insert_guard ON public.store AS RESTRICTIVE FOR INSERT TO public
WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY pos_store_update_guard ON public.store AS RESTRICTIVE FOR UPDATE TO public
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY pos_store_delete_guard ON public.store AS RESTRICTIVE FOR DELETE TO public
USING (public.is_admin(auth.uid()));
COMMIT;
