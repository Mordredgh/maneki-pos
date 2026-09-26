# Auditoria Bicho Capricho POS — 2026-09-26

Estado: correcciones locales verificadas; cierre de produccion y seguridad pendiente.
Informe inicial conservado abajo; estado vigente en VALIDACION-2026-09-26.md y CLOUDFLARE.md. Cloudflare ya sirve produccion. No se ejecutaron migraciones SQL ni se crearon ventas de prueba en produccion.

## Alcance y metodo

Consulta del proyecto y memoria en Obsidian, grafo de codigo, revision de persistencia, inventario, pedidos, anticipos, reportes, respaldo, sincronizacion, dependencias y despliegue. Skills: ponytail, tdd y diagnosing-bugs. Las regresiones nuevas ejecutan los modulos TypeScript reales en una VM; solo sustituyen navegador y transporte de Supabase. Los fallos corregidos se reprodujeron antes de modificar su implementacion.

Esta revision no certifica todos los flujos del negocio: no hubo cobros, cancelaciones ni restauraciones de prueba sobre la base productiva. No se dispuso de una base de staging ni de acceso SQL administrativo para verificar triggers, funciones, indices, transacciones o politicas completas.

## Correcciones

| Area | Fallo comprobado | Cambio |
| --- | --- | --- |
| Ventas | Escritura de updated_at inexistente; tipo de cobro perdido | Payload compatible con sales_history; conserva tipo y referencias |
| Ingresos y gastos | updated_at inexistente bloqueaba escrituras; incomes tampoco tiene method | Retira columnas inexistentes; fallback de method solo ante error explicito de esa columna |
| Guardado | Errores absorbidos y respaldo local solo tras exito remoto | Siete entidades conservan espejo antes de escribir y propagan error; aviso visible al fallar |
| Inventario y pedidos | Descripcion web y ocasion se perdian al recargar | Mapeos relacionales completos |
| Realtime | Mapeo duplicado incompleto, DELETE con new vacio, pedidos terminados reaparecian | Mapeo canonico, uso de old en DELETE y filtro de estados finales |
| Realtime vacio | Segunda recarga consultaba updated_at en tablas sin esa columna | Recarga completa y manejo explicito de error |
| Reportes | Pedido legacy desaparecia por doble deduplicacion | Se excluye la copia legacy y se conserva la venta derivada del pedido |
| Anticipos | Doble descuento del anticipo en saldos ya netos y doble conteo al iniciar | Distingue total completo de saldo; considera cobros existentes al reconstruir anticipos |
| Cache | Centavos, fechas y tipos podian quedar obsoletos | Invalidacion basada en las entradas completas |
| Respaldos | Categorias y kardex se restauraban en store, pero se leian de otras tablas | Restauracion en categories y stock_movements; validacion de listas y texto fiel al upsert |
| Sincronizacion KV | Reconectar marcaba sincronizado sin reenviar datos | Cola persistente por clave, reintento real, orden de escritura y confirmacion esperable |
| Mensajes offline | Promesa de sincronizacion total que no existe | Mensaje prudente para conservar sesion y revisar pendientes |
| Dependencias | Avisos en herramientas de desarrollo | Actualizacion dentro de rangos existentes; package.json sin dependencias nuevas |

Archivos fuente: src/db.ts, src/config.ts, src/reportes.ts, src/backup.ts, src/ui-extras.ts. Pruebas: tests/persistence.test.ts. Generados JS, bundles, mapas y sw.js regenerados con el build oficial.

## Supabase: evidencia de lectura

Proyecto confirmado: hoqcrljgmamaumtdrtzi. Se consultaron esquema disponible por REST, conteos y agregados; el informe omite nombres, telefonos y credenciales.

| Tabla | Filas observadas |
| --- | ---: |
| products | 113 |
| orders | 0 |
| orders_finalizados | 55 |
| sales_history | 102 |
| incomes | 2 |
| expenses | 0 |
| clients | 0 |
| stock_movements | 360 |
| categories | 13 |

Comprobaciones sobre los registros consultados: cero existencias negativas, cero costos negativos, cero componentes de materia prima huerfanos, cero saldos de pedido inconsistentes con max(total - anticipo, 0), cero folios repetidos entre finalizados y cero importes negativos en ventas. Los 102 registros de sales_history usan el tipo legacy venta; no se reclasificaron ni reconciliaron automaticamente.

Columnas relevantes: sales_history carece de updated_at, status y total_pedido; incomes carece de updated_at y method; expenses carece de updated_at. El fallback conserva el importe del ingreso, pero su metodo de pago no persistira en servidor hasta aplicar scripts/2026-09-26-incomes-method.sql. Esa migracion aditiva esta preparada, no aplicada, y no puede recuperar metodos historicos desconocidos.

## Validacion

- node scripts/build.js: correcto; typecheck, 108 pruebas (79 existentes y 29 nuevas), lint sin problemas, 34 archivos TS y 8 bundles.
- npm run build:check: correcto.
- Service Worker: maneki-c37afc4c09, calculado sobre 47 archivos.
- Navegador local: 11 secciones navegables, incluyendo inventario, pedidos, cotizaciones, balance, clientes, categorias, analisis, reportes, equipos y configuracion. Inventario y reportes comprobados otra vez con la compilacion final; Supabase conectado, 113 productos y sin errores/advertencias capturados en consola.
- npm audit: cero vulnerabilidades tras actualizar el lockfile.
- Trivy fs del proyecto activo, incluyendo dependencias de desarrollo y excluyendo node_modules, .git, graphify-out y cache .netlify: cero vulnerabilidades y cero secretos detectados. Esto no prueba ausencia de vulnerabilidades de logica o permisos.
- graphify update .: correcto, 3114 nodos y 4677 relaciones. El comando antiguo graphify . --update intento extraccion semantica y pidio clave LLM; se uso la actualizacion AST local documentada por la herramienta.

## Pendientes y limites al terminar la auditoria inicial (ver actualizacion)

1. **Alta prioridad: lectura anonima de datos de negocio.** La clave publica permite leer pedidos finalizados y otras tablas sin Supabase Auth. No equivale a demostrar escritura anonima, que no se probo. Hace falta definir usuarios/roles e implementar autenticacion antes de restringir politicas compartidas con web, CRM y bot. Pendiente respuesta sobre cuentas autorizadas; no se cambiaron RLS ni credenciales.
2. **Produccion no verificable desde esta sesion.** pos.manekistore.com.mx resolvio al VPS esperado, pero HTTPS y la consulta GET a Coolify agotaron el tiempo. No se puede concluir la causa ni asegurar que el servicio este caido para todos. No se desplego: .ralph/AGENT.md requiere solicitud explicita.
3. **Migracion incomes.method pendiente.** Requiere acceso administrativo al proyecto Supabase correcto. La compatibilidad local permite guardar ingresos sin destruir filas, pero no sustituye la columna ausente.
4. **Offline relacional y atomicidad.** La cola implementada corresponde a claves de store. Las operaciones sobre tablas relacionales conservan espejo y notifican fallos, pero no tienen replay transaccional completo. Un fallo entre varias tablas puede requerir conciliacion; no reintentar cobros a ciegas ni garantizar cierre offline. La capacidad de localStorage tambien limita el respaldo local.
5. **Contenedor no probado.** Docker Desktop no tenia motor activo. Trivy de configuracion reporto DS-0002 (usuario root) y DS-0026 (sin HEALTHCHECK) en Dockerfile. Endurecimiento pendiente con prueba real del contenedor antes de cambiar la imagen/configuracion de produccion.
6. **Cache antigua de Netlify.** El escaneo inicial encontro 19 avisos en .netlify/plugins/package-lock.json, cache local ignorada y distinta del lockfile activo usado por Docker. No se borro ni se atribuye al despliegue Coolify. Revisarla antes de reutilizar ese flujo.
7. **Decisiones previas conservadas.** No se cambio el criterio contable de Balance (N8) ni skipWaiting/claim del Service Worker (D7). No hubo ensayo multicliente concurrente, impresion fisica, recuperacion integral ante caida ni prueba end-to-end de transacciones reales.

Orden de cierre: definir Auth/roles y revisar politicas administrativas; aplicar migracion aditiva; probar cobro/pedido/abono/cancelacion/restauracion en staging; validar contenedor; recuperar acceso a Coolify; desplegar con solicitud explicita y comprobar produccion.
