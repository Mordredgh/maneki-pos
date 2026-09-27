BEGIN;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS method text;
-- Un resultado agregado evita el limite de filas de PostgREST.
CREATE OR REPLACE FUNCTION public.pos_cash_movements(p_date text,p_zone text DEFAULT 'America/Matamoros')
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $fn$
DECLARE result jsonb:='{}'; t text; rows jsonb;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Acceso no autorizado' USING ERRCODE='42501'; END IF;
 IF p_date !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Fecha invalida'; END IF;
 FOREACH t IN ARRAY ARRAY['sales_history','incomes','expenses'] LOOP
  EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id),''[]''::jsonb) FROM public.%I r WHERE CASE WHEN r.date LIKE ''%%T%%'' THEN (r.date::timestamptz AT TIME ZONE $2)::date ELSE nullif(r.date,'''')::date END = $1::date',t)
  INTO rows USING p_date,p_zone;
  result:=result||jsonb_build_object(t,rows);
 END LOOP;
 RETURN result;
END $fn$;
REVOKE ALL ON FUNCTION public.pos_cash_movements(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pos_cash_movements(text,text) TO authenticated;
COMMIT;
