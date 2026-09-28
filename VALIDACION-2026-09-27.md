# Segunda etapa integral

## Cambios
- Guardado de filas modificadas con las mismas bases optimistas y colas de reintento.
- Calculo de centavos y saldos disponible desde el nucleo; reportes usan fecha local para pagos ISO.
- Caja con consulta del dia completo, metodos, fondo inicial, conteo y diferencias justificadas. Cortes en store.cashClosures con escritura optimista.
- Auditoria protegida de diez tablas, actor, motivo, valores anteriores/nuevos y operacion agrupada. Comienza al activar la migracion; no inventa historial anterior.
- Pedidos en cuatro pasos con validacion, resumen fijo y confirmacion.
- Ajuste rapido de stock/precio con motivo, guardado confirmado y operacion atomica de stock/movimiento. Variantes y productos fabricables se editan desde su ficha.
- Filtros de inventario etiquetados, limpieza de filtros, acciones explicitas de teclado/tacto y contraste del boton principal.
- Respaldo completo de datos cifrado y verificado en R2 posteriormente en esta fecha; tarea Windows activa. Ver BACKUPS.md para la evidencia vigente.

## Evidencia
160 pruebas automatizadas, typecheck, lint y compilacion de 37 TS correctos.
Navegador de pruebas: crear pedido 100.25, anticipo 20.10, saldo 80.15; corte con un cobro de 20.10 sin duplicarlo; ajuste de stock 10 a 7 con motivo y confirmacion; resumen de confirmacion visible. Ancho movil 390 px: pasos en dos filas; botones flotantes ocultos mientras el modal esta abierto.
Sesion real existente en 127.0.0.1:8977: consulta autenticada de caja e historial, sin crear cortes ni ventas reales.
Supabase produccion: scripts audit/cash/backup aplicados. Prueba con rol authenticated del administrador valida escritura, actor/motivo/operacion, caja y snapshot; ROLLBACK. Anonimo y authenticated ajeno rechazados. Cero filas QA persistentes en ingresos, recibos y auditoria.
Restauracion cifrada ensayada en otra base local: conteos, importe y cortes preservados; clave incorrecta y alteracion rechazadas.

## Limites
El entorno sintetico no reproduce todas las restricciones de produccion; por eso tambien se verificaron RPC/RLS reales con rollback. No se probaron cobros reales nuevos ni dispositivos fisicos. Impresora y PWA fisicas siguen aplazadas por el propietario.
La automatizacion vigente corre en Windows y envia a R2. Falta independizarla del PC, incluir imagenes y conservar una copia separada de la clave de recuperacion. Las verificaciones de esta seccion corresponden a la etapa indicada; no acreditan esas ampliaciones.

## Publicacion
Cloudflare Pages: https://5ebff075.bicho-capricho-pos.pages.dev.
Dominio: https://pos.manekistore.com.mx. HTTP 401 sin credenciales y 200 autorizado; bundles servidos y SW maneki-d7ac161133 verificados. El adapter QA no esta publicado (ruta inexistente devuelve el fallback SPA, sin contenido QA).
Trivy local de secretos: sin hallazgos en archivos revisados; excluye secretos locales, dependencias y dist. No equivale a auditoria integral de dependencias.
Grafo MCP reindexado y graphify update ejecutado sin LLM.

## Verificacion posterior de ficha, matriz y respaldo

- 177 pruebas, typecheck, lint y paquete Cloudflare correctos. Prueba de persistencia nueva: sin aprobacion y checklist, el pedido no pasa a produccion ni finalizacion y no crea cobros.
- En staging aislado con pedido y playera ficticios: matriz muestra 2 comprometidas y 2 libres en M/Negro; ficha y matriz revisadas en escritorio y 390 px. El intento real de avanzar muestra «Completa la ficha» y conserva el estado.
- R2: dos ejecuciones de 24 tablas y 113 imagenes cifradas con rutas unicas. Restauracion aislada real: 24 tablas y 113 imagenes comprobadas con tamaño y SHA-256; estado verificado guardado en `store.pos_backup_status`.
- Publicado https://5dcdffb8.bicho-capricho-pos.pages.dev; dominio y deployment 401 anonimo / 200 autorizado para HTML, JS y SW; hash `maneki-237079d1bc`.
- Propietario pospone ejecucion independiente del PC y guardara la clave de recuperacion por separado despues. La tarea Windows sigue vigente.
