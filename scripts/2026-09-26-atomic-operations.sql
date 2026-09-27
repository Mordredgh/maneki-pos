-- Operaciones completas: todo se confirma o todo se revierte. Id estable para reenvios.
BEGIN;
CREATE TABLE IF NOT EXISTS public.pos_operation_receipts (
 id text PRIMARY KEY, payload_hash text NOT NULL, result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_operation_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY pos_receipts_admin ON public.pos_operation_receipts TO authenticated
 USING(public.is_admin(auth.uid())) WITH CHECK(public.is_admin(auth.uid()));
GRANT SELECT,INSERT ON public.pos_operation_receipts TO authenticated;
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
 FOR item IN SELECT value FROM jsonb_array_elements(p_operations) LOOP
   result:=result||jsonb_build_array(public.pos_apply_write(item->>'table',nullif(item->'rows','null'::jsonb),item->'expected',item->>'field',item->>'value'));
 END LOOP;
 INSERT INTO public.pos_operation_receipts(id,payload_hash,result) VALUES(p_id,fingerprint,result);
 RETURN result;
END $fn$;
REVOKE ALL ON FUNCTION public.pos_apply_operation(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pos_apply_operation(text,jsonb) TO authenticated;
COMMIT;
