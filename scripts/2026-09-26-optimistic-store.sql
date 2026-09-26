BEGIN;
SET LOCAL lock_timeout='5s';
CREATE OR REPLACE FUNCTION public.pos_apply_store(p_key text,p_value text,p_expected jsonb)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $fn$
DECLARE current_value text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Acceso no autorizado' USING ERRCODE='42501'; END IF;
  IF p_key IS NULL OR p_key='' OR p_value IS NULL OR jsonb_typeof(p_expected) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Guardado invalido'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('store:'||p_key,0));
  SELECT value INTO current_value FROM public.store WHERE key=p_key FOR UPDATE;
  IF current_value IS NOT DISTINCT FROM p_value THEN RETURN current_value; END IF;
  IF NOT p_expected @> jsonb_build_array(current_value) THEN
    RAISE EXCEPTION 'Conflicto: % cambio en otro dispositivo. Cambios locales conservados.',p_key USING ERRCODE='40001';
  END IF;
  INSERT INTO public.store(key,value) VALUES(p_key,p_value) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value;
  RETURN p_value;
END $fn$;
REVOKE ALL ON FUNCTION public.pos_apply_store(text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pos_apply_store(text,text,jsonb) TO authenticated;
COMMIT;
