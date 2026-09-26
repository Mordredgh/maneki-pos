-- Ejecutar en una sola solicitud. Fila sintetica dentro de transaccion revertida.
-- Verificado previamente: incomes no tiene triggers de usuario.
BEGIN;
DO $qa$
DECLARE ident bigint:=-20260926150001; first_row jsonb; next_row jsonb; answer jsonb; rejected boolean:=false;
BEGIN
IF EXISTS(SELECT 1 FROM public.incomes WHERE id=ident) THEN RAISE EXCEPTION 'Identificador QA ocupado'; END IF;
PERFORM set_config('request.jwt.claim.sub',(SELECT user_id::text FROM public.user_roles WHERE role='admin' LIMIT 1),true);
answer:=public.pos_apply_write('incomes',jsonb_build_array(jsonb_build_object('id',ident,'concept','QA temporal rollback','amount',1,'method','efectivo')),jsonb_build_object(ident::text,NULL));
first_row:=answer->0;
IF first_row->>'method'<>'efectivo' THEN RAISE EXCEPTION 'Metodo no persistido'; END IF;
answer:=public.pos_apply_write('incomes',jsonb_build_array(jsonb_build_object('id',ident,'amount',2)),jsonb_build_object(ident::text,first_row)); next_row:=answer->0;
BEGIN
PERFORM public.pos_apply_write('incomes',jsonb_build_array(jsonb_build_object('id',ident,'amount',3)),jsonb_build_object(ident::text,first_row));
EXCEPTION WHEN serialization_failure THEN rejected:=true; END;
IF NOT rejected THEN RAISE EXCEPTION 'No detecto conflicto'; END IF;
answer:=public.pos_apply_write('incomes',jsonb_build_array(jsonb_build_object('id',ident,'amount',2)),jsonb_build_object(ident::text,first_row));
IF (answer->0->>'amount')::numeric<>2 THEN RAISE EXCEPTION 'Reenvio incorrecto'; END IF;
rejected:=false;
BEGIN
PERFORM public.pos_apply_write('incomes',NULL,jsonb_build_object(ident::text,first_row),'id',ident::text);
EXCEPTION WHEN serialization_failure THEN rejected:=true; END;
IF NOT rejected THEN RAISE EXCEPTION 'Borrado concurrente no protegido'; END IF;
PERFORM public.pos_apply_write('incomes',NULL,jsonb_build_object(ident::text,next_row),'id',ident::text);
IF EXISTS(SELECT 1 FROM public.incomes WHERE id=ident) THEN RAISE EXCEPTION 'Borrado no aplicado'; END IF;
END $qa$;
ROLLBACK;
SELECT 'OK: metodo, actualizacion, conflicto, reenvio y borrado; rollback completo' AS verificacion;
