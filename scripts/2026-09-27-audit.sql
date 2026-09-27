BEGIN;
CREATE TABLE IF NOT EXISTS public.pos_audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 actor uuid, actor_label text, table_name text NOT NULL, record_id text, action text NOT NULL,
 reason text NOT NULL, operation_id text, old_data jsonb, new_data jsonb
);
ALTER TABLE public.pos_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pos_audit_log FROM anon,authenticated;
GRANT SELECT ON public.pos_audit_log TO authenticated;
CREATE POLICY pos_audit_admin_read ON public.pos_audit_log FOR SELECT TO authenticated USING(public.is_admin(auth.uid()));
CREATE INDEX IF NOT EXISTS pos_audit_recent ON public.pos_audit_log(occurred_at DESC);
CREATE OR REPLACE FUNCTION public.pos_record_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE before_row jsonb; after_row jsonb; who uuid:=auth.uid(); claims jsonb;
BEGIN
 before_row:=CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END;
 after_row:=CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END;
 IF TG_OP='UPDATE' AND (before_row-'updated_at') IS NOT DISTINCT FROM (after_row-'updated_at') THEN RETURN NEW; END IF;
 claims:=coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb;
 INSERT INTO public.pos_audit_log(actor,actor_label,table_name,record_id,action,reason,operation_id,old_data,new_data)
 VALUES(who,coalesce(claims->>'email',CASE WHEN who IS NULL THEN 'Mantenimiento de base' ELSE 'Usuario '||left(who::text,8) END),TG_TABLE_NAME,
 coalesce(after_row->>'id',before_row->>'id',after_row->>'key',before_row->>'key'),TG_OP,
 coalesce(nullif(current_setting('pos.reason',true),''),after_row->>'motivo',CASE TG_OP WHEN 'INSERT' THEN 'Alta de registro' WHEN 'DELETE' THEN 'Eliminacion de registro' ELSE 'Edicion de registro' END),
 nullif(current_setting('pos.operation_id',true),''),before_row,after_row);
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $fn$;
REVOKE ALL ON FUNCTION public.pos_record_change() FROM PUBLIC,anon,authenticated;
DO $triggers$ DECLARE name text; BEGIN
 FOREACH name IN ARRAY ARRAY['products','clients','orders','orders_finalizados','sales_history','incomes','expenses','categories','stock_movements','store'] LOOP
 EXECUTE format('CREATE TRIGGER pos_audit_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.pos_record_change()',name);
 END LOOP;
END $triggers$;
CREATE OR REPLACE FUNCTION public.pos_list_changes(p_limit integer DEFAULT 100)
RETURNS SETOF public.pos_audit_log LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public
AS $$ SELECT * FROM public.pos_audit_log ORDER BY occurred_at DESC LIMIT greatest(1,least(p_limit,200)) $$;
REVOKE ALL ON FUNCTION public.pos_list_changes(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pos_list_changes(integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.pos_apply_operation(p_id text,p_operations jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $fn$
DECLARE item jsonb; result jsonb:='[]'::jsonb; prior public.pos_operation_receipts; fingerprint text;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Acceso no autorizado' USING ERRCODE='42501'; END IF;
 IF p_id IS NULL OR length(p_id)>100 OR jsonb_typeof(p_operations) IS DISTINCT FROM 'array' OR jsonb_array_length(p_operations)>100 THEN RAISE EXCEPTION 'Operacion invalida'; END IF;
 fingerprint:=md5(p_operations::text);
 PERFORM pg_advisory_xact_lock(hashtextextended('operation:'||p_id,0));
 SELECT * INTO prior FROM public.pos_operation_receipts WHERE id=p_id;
 IF FOUND THEN
   IF prior.payload_hash<>fingerprint THEN RAISE EXCEPTION 'Identificador reutilizado con otros datos' USING ERRCODE='40001'; END IF;
   RETURN prior.result;
 END IF;
 PERFORM set_config('pos.operation_id',p_id,true);
 FOR item IN SELECT value FROM jsonb_array_elements(p_operations) LOOP
   PERFORM set_config('pos.reason',left(coalesce(item->>'reason','Operacion del POS'),500),true);
   result:=result||jsonb_build_array(public.pos_apply_write(item->>'table',nullif(item->'rows','null'::jsonb),item->'expected',item->>'field',item->>'value'));
 END LOOP;
 INSERT INTO public.pos_operation_receipts(id,payload_hash,result) VALUES(p_id,fingerprint,result);
 RETURN result;
END $fn$;
COMMIT;
