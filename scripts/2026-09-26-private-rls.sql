-- Aplicar solo despues de publicar y verificar el login del POS.
-- Conserva politicas anteriores; las guardas restrictivas se combinan con AND.
-- No cambia user_roles ni concede roles a personas nuevas.
BEGIN;
SET LOCAL lock_timeout='5s';
DO $policy$
DECLARE t text; policy_command text;
BEGIN
  FOREACH t IN ARRAY ARRAY['abonos','activity_log','clients','envioAnillos','expenses','gastosRecurrentes','incomes','orders','orders_finalizados','payables','pedidos','quotes','receivables','reminders','roiConfig','roiHistorial','sales','sales_history','stock_movements'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='pos_admin_guard') THEN
      EXECUTE format('CREATE POLICY pos_admin_guard ON public.%I AS RESTRICTIVE FOR ALL TO public USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))',t);
    END IF;
  END LOOP;
  FOREACH t IN ARRAY ARRAY['products','categories'] LOOP
    FOREACH policy_command IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
      IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='pos_guard_'||lower(policy_command)) THEN
        EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR %s TO public %s',
          'pos_guard_'||lower(policy_command),t,policy_command,
          CASE policy_command WHEN 'INSERT' THEN 'WITH CHECK (public.is_admin(auth.uid()))'
                   WHEN 'UPDATE' THEN 'USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))'
                   ELSE 'USING (public.is_admin(auth.uid()))' END);
      END IF;
    END LOOP;
  END LOOP;
END $policy$;
CREATE POLICY pos_published_products ON public.products AS RESTRICTIVE FOR SELECT TO public
  USING (public.is_admin(auth.uid()) OR publicar_tienda IS TRUE);
-- Categorias publicas legibles; administradores existentes pueden mantenerlas.
CREATE POLICY pos_admin_categories ON public.categories FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
COMMIT;
