BEGIN;
CREATE OR REPLACE FUNCTION public.pos_backup_snapshot()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $fn$
DECLARE result jsonb:='{}'; t text; rows jsonb;
BEGIN
 IF current_user<>'service_role' AND NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Acceso no autorizado' USING ERRCODE='42501'; END IF;
 FOREACH t IN ARRAY ARRAY['categories','clients','products','orders','orders_finalizados','sales_history','incomes','expenses','stock_movements','store','pos_operation_receipts','pos_audit_log','abonos','activity_log','envioAnillos','gastosRecurrentes','payables','pedidos','quotes','receivables','reminders','roiConfig','roiHistorial','sales'] LOOP
  IF to_regclass(format('public.%I',t)) IS NOT NULL THEN
   EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(r)),''[]''::jsonb) FROM public.%I r',t) INTO rows;
   result:=result||jsonb_build_object(t,rows);
  END IF;
 END LOOP;
 RETURN jsonb_build_object('format','bicho-pos-tables-v1','createdAt',now(),'tables',result);
END $fn$;
REVOKE ALL ON FUNCTION public.pos_backup_snapshot() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pos_backup_snapshot() TO authenticated;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN GRANT EXECUTE ON FUNCTION public.pos_backup_snapshot() TO service_role; END IF; END $$;
COMMIT;
