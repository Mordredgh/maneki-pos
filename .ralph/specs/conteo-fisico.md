# Conteo fisico por partes

Decision: conservar existencias disponibles y apartados separados. Cada combinacion se cuenta y captura en el momento; no congelar todo el catalogo ni detener ventas.

- Referencia = disponible + apartados activos al capturar. Cero significa contado; vacio significa sin contar.
- Diferencia = contado - referencia. Existencia final = existencia actual + diferencia. Asi se conservan entradas y ventas posteriores a la captura.
- Matriz talla/color; las otras variantes conservan captura individual dentro del mismo producto. Filtrar tipo, categoria o producto sin perder el avance.
- Sesiones y filtros locales en IndexedDB nativo. Guardar antes de informar exito. Reabrir y capturar comparten una cola para evitar reemplazar el avance.
- Ajustar solo filas seleccionadas; ninguna seleccion automatica. No permitir existencia negativa ni consumir piezas apartadas mediante el ajuste.
- Si hubo otro ajuste de la misma combinacion, pedir recaptura para evitar descontar dos veces. Si se perdio la referencia del historial, no inventar movimientos.
- Productos derivados sin variantes cuya existencia combina capacidad fabricable y piezas manuales no admiten conteo independiente fiable: contar sus materiales. No deducir piezas terminadas restando capacidad actual.
- Aplicar mediante pos_apply_operation: productos con expected completos y movimientos en una transaccion. Persistir ID y payload antes de enviar. Reintento exacto tras respuesta perdida; conflicto real requiere actualizar, nunca forzar.
- Tras confirmar, leer existencias actuales; un recibo antiguo no reemplaza ventas recientes. No escribir SQL nuevo ni cambiar permisos.

Validacion: API publica de conteo, IndexedDB con almacenamiento simulado, SQL RPC real en PGlite; conteo parcial, cero, ventas, apartados, ajustes concurrentes y respuesta perdida. UI con datos ficticios; no ajustar existencias de produccion durante QA.
