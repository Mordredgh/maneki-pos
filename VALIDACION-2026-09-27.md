# Segunda etapa integral

## Cambios
- Guardado de filas modificadas con las mismas bases optimistas y colas de reintento.
- Calculo de centavos y saldos disponible desde el nucleo; reportes usan fecha local para pagos ISO.
- Caja con consulta del dia completo, metodos, fondo inicial, conteo y diferencias justificadas. Cortes en store.cashClosures con escritura optimista.
- Auditoria protegida de diez tablas, actor, motivo, valores anteriores/nuevos y operacion agrupada. Comienza al activar la migracion; no inventa historial anterior.
- Pedidos en cuatro pasos con validacion, resumen fijo y confirmacion.
- Ajuste rapido de stock/precio con motivo, guardado confirmado y operacion atomica de stock/movimiento. Variantes y productos fabricables se editan desde su ficha.
- Filtros de inventario etiquetados, limpieza de filtros, acciones explicitas de teclado/tacto y contraste del boton principal.
- Respaldo completo cifrado preparado; activacion externa pendiente del destino y credencial. Ver BACKUPS.md.

## Evidencia
160 pruebas automatizadas, typecheck, lint y compilacion de 37 TS correctos.
Navegador de pruebas: crear pedido 100.25, anticipo 20.10, saldo 80.15; corte con un cobro de 20.10 sin duplicarlo; ajuste de stock 10 a 7 con motivo y confirmacion; resumen de confirmacion visible. Ancho movil 390 px: pasos en dos filas; botones flotantes ocultos mientras el modal esta abierto.
Sesion real existente en 127.0.0.1:8977: consulta autenticada de caja e historial, sin crear cortes ni ventas reales.
Supabase produccion: scripts audit/cash/backup aplicados. Prueba con rol authenticated del administrador valida escritura, actor/motivo/operacion, caja y snapshot; ROLLBACK. Anonimo y authenticated ajeno rechazados. Cero filas QA persistentes en ingresos, recibos y auditoria.
Restauracion cifrada ensayada en otra base local: conteos, importe y cortes preservados; clave incorrecta y alteracion rechazadas.

## Limites
El entorno sintetico no reproduce todas las restricciones de produccion; por eso tambien se verificaron RPC/RLS reales con rollback. No se probaron cobros reales nuevos ni dispositivos fisicos. Impresora y PWA fisicas siguen aplazadas por el propietario.
No hay automatizacion externa de respaldo activa. No afirmar que esta etapa esta completa mientras siga pendiente.

## Publicacion
Cloudflare Pages: https://5ebff075.bicho-capricho-pos.pages.dev.
Dominio: https://pos.manekistore.com.mx. HTTP 401 sin credenciales y 200 autorizado; bundles servidos y SW maneki-d7ac161133 verificados. El adapter QA no esta publicado (ruta inexistente devuelve el fallback SPA, sin contenido QA).
Trivy local de secretos: sin hallazgos en archivos revisados; excluye secretos locales, dependencias y dist. No equivale a auditoria integral de dependencias.
Grafo MCP reindexado y graphify update ejecutado sin LLM.
