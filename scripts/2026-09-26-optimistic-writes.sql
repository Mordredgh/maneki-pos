-- Bicho Core. No modifica datos existentes ni agrega privilegios sobre tablas.
-- Bloquea filas y compara la version leida antes de escribir; lotes atomicos por tabla.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE OR REPLACE FUNCTION public.pos_apply_write(
  p_table text, p_rows jsonb, p_expected jsonb, p_field text DEFAULT NULL, p_value text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $fn$
DECLARE item jsonb; current_row jsonb; expected_row jsonb; typed_row jsonb;
  projected jsonb; columns_sql text; select_sql text; update_sql text;
  result jsonb := '[]'::jsonb; record_id text; seen text[] := '{}';
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Acceso no autorizado' USING ERRCODE='42501'; END IF;
  IF p_table <> ALL(ARRAY['products','clients','orders','orders_finalizados','sales_history','incomes','expenses','categories','stock_movements'])
     OR p_table IS NULL OR jsonb_typeof(p_expected) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Operacion POS invalida' USING ERRCODE='22023';
  END IF;
  IF p_rows IS NOT NULL THEN
    IF jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows)>5000 THEN RAISE EXCEPTION 'Lote invalido'; END IF;
    -- Orden estable evita deadlocks entre lotes con las mismas filas.
    FOR item IN SELECT value FROM jsonb_array_elements(p_rows) ORDER BY value->>'id' LOOP
      record_id := item->>'id';
      IF record_id IS NULL OR record_id='' OR record_id=ANY(seen) THEN RAISE EXCEPTION 'Id invalido o repetido'; END IF;
      seen := array_append(seen,record_id);
      PERFORM pg_advisory_xact_lock(hashtextextended(p_table||':'||record_id,0));
      EXECUTE format('SELECT to_jsonb(t) FROM public.%I t WHERE id::text=$1 FOR UPDATE',p_table) INTO current_row USING record_id;
      EXECUTE format('SELECT to_jsonb(jsonb_populate_record(NULL::public.%I,$1))',p_table) INTO typed_row USING item;
      SELECT jsonb_object_agg(k,typed_row->k) INTO projected FROM jsonb_object_keys(item) k WHERE k<>'updated_at';
      -- Reenvio tras perder la respuesta: mismos valores ya guardados, sin duplicar.
      IF current_row IS NOT NULL AND current_row @> projected THEN
        result:=result||jsonb_build_array(current_row); CONTINUE;
      END IF;
      expected_row:=p_expected->record_id;
      IF current_row IS NULL THEN
        IF expected_row IS NOT NULL AND expected_row<>'null'::jsonb THEN
          RAISE EXCEPTION 'Conflicto: % / % fue eliminado. Cambios locales conservados.',p_table,record_id USING ERRCODE='40001';
        END IF;
      ELSE
        IF expected_row IS NULL OR expected_row='null'::jsonb THEN
          RAISE EXCEPTION 'Conflicto: % / % ya existe. Cambios locales conservados.',p_table,record_id USING ERRCODE='40001';
        END IF;
        EXECUTE format('SELECT to_jsonb(jsonb_populate_record(NULL::public.%I,$1))',p_table) INTO typed_row USING expected_row;
        SELECT jsonb_object_agg(k,typed_row->k) INTO projected FROM jsonb_object_keys(expected_row) k WHERE k<>'updated_at';
        IF NOT current_row @> projected THEN
          RAISE EXCEPTION 'Conflicto: % / % cambio en otro dispositivo. Cambios locales conservados.',p_table,record_id USING ERRCODE='40001';
        END IF;
      END IF;
      SELECT string_agg(format('%I',k),','),string_agg(format('r.%I',k),','),
             string_agg(format('%I=EXCLUDED.%I',k,k),',') FILTER(WHERE k<>'id')
      INTO columns_sql,select_sql,update_sql FROM jsonb_object_keys(item) k;
      EXECUTE format('INSERT INTO public.%I AS t (%s) SELECT %s FROM jsonb_populate_record(NULL::public.%I,$1) r ON CONFLICT(id) DO UPDATE SET %s RETURNING to_jsonb(t)',
          p_table,columns_sql,select_sql,p_table,coalesce(update_sql,'id=EXCLUDED.id')) INTO current_row USING item;
      result:=result||jsonb_build_array(current_row);
    END LOOP;
  ELSE
    IF p_field IS NULL OR p_field<>ALL(ARRAY['id','folio_origen','pedido_id']) OR p_value IS NULL THEN RAISE EXCEPTION 'Borrado invalido'; END IF;
    FOR current_row IN EXECUTE format('SELECT to_jsonb(t) FROM public.%I t WHERE %I::text=$1 ORDER BY id FOR UPDATE',p_table,p_field) USING p_value LOOP
      record_id:=current_row->>'id'; expected_row:=p_expected->record_id;
      IF expected_row IS NOT NULL AND expected_row<>'null'::jsonb THEN
        EXECUTE format('SELECT to_jsonb(jsonb_populate_record(NULL::public.%I,$1))',p_table) INTO typed_row USING expected_row;
        SELECT jsonb_object_agg(k,typed_row->k) INTO projected FROM jsonb_object_keys(expected_row) k WHERE k<>'updated_at';
      ELSE projected:=NULL; END IF;
      IF projected IS NULL OR NOT current_row @> projected THEN
        RAISE EXCEPTION 'Conflicto al borrar % / %. Cambios locales conservados.',p_table,record_id USING ERRCODE='40001';
      END IF;
      EXECUTE format('DELETE FROM public.%I WHERE id::text=$1',p_table) USING record_id;
    END LOOP;
  END IF;
  RETURN result;
END $fn$;
REVOKE ALL ON FUNCTION public.pos_apply_write(text,jsonb,jsonb,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pos_apply_write(text,jsonb,jsonb,text,text) TO authenticated;
COMMIT;
