# Fix plan — Auditoría S34 Bicho Capricho POS

## Migracion Cloudflare Pages 2026-09-26

- [x] Confirmar cuenta Cloudflare disponible y autorizacion de migracion/despliegue.
- [x] Preparar empaquetado explicito de assets sin fuentes, secretos ni respaldos; prueba rojo/verde.
- [x] Validar build completo (116 pruebas), typecheck y paquete protegido de publicacion (65 archivos).
- [x] Basic Auth en Worker para todas las rutas; secretos cifrados POS_USER/POS_PASSWORD. Usuario eligio contrasena.
- [x] Publicar en Cloudflare Pages; HTTP 401 sin acceso/clave incorrecta y 200 autorizado; JS, SW y manifest 200.
- [ ] Validar navegacion PWA publicada en navegador: IAB devuelve ERR_BLOCKED_BY_CLIENT ante Basic Auth; HTTP verificado.
- [x] Asociar dominio existente y verificar DNS/HTTPS. Cloudflare active; CNAME confirmado por 1.1.1.1, 8.8.8.8 y autoritativo. HTTPS validado: 401 anonimo y 200 autorizado.
- [x] Documentar despliegue y actualizar memoria Obsidian.

## Auditoria 2026-09-26

- [x] Contrastar esquema Supabase por GET sin escribir datos de negocio.
- [x] Corregir escrituras de sales_history/incomes/expenses incompatibles con columnas reales.
- [x] Conservar descripcionWeb y ocasion en la carga relacional.
- [x] Unificar transformacion Realtime y corregir DELETE con new vacio.
- [x] Conservar respaldo local ante fallos de red en siete entidades.
- [x] Corregir doble deduplicacion y descuento de anticipos en reportes.
- [x] Revisar sincronizacion, errores de guardado y cache de reportes.
- [x] Auditar dependencias, despliegue, interfaz y seguridad; limitaciones en AUDITORIA-2026-09-26.md.
- [x] Ejecutar build completo (108 tests), build:check y revisar diff final.
- [x] Documentar resultados, limitaciones y memoria Obsidian; actualizar grafo AST.
- [x] Cerrar lectura anonima de tablas privadas y claves privadas de store; Auth/roles y POS verificados.
- [x] Aplicar incomes.method; SQL real con RLS y ROLLBACK verificado.
- [ ] Validar transacciones reales en staging e impresion fisica. <!-- BLOQUEADO: sin staging ni impresora conectada; produccion migrada a Cloudflare, contenedor ya no forma parte del despliegue. -->

## Fase 1 — Críticos (integridad de datos)

- [x] D1: Espejo localStorage en save* (products/pedidos/pedidosFinalizados/clients/salesHistory/incomes/expenses) + sbLoad distingue fallo de red vs vacío legítimo
- [x] I3: `_descontarInventarioPedido` usa stock de la variante específica, no la suma de todas
- [x] D2: `limpiarMovimientos` (balance.ts) delega a `limpiarMovimientosInventario` (borra tabla relacional)

## Fase 2 — Inventario: unificar cálculo MP→piezas

- [x] Crear `window.calcularPiezasFabricables(prod)` canónica en inventory-1.ts
- [x] I1: `_calcFabricableMP` (inventory-1.ts) delega a canónica
- [x] I1/I7: `calcularDisponibilidadDesdeMP` (inventory-4.ts) delega a canónica, resetea `_tieneComponentesHuerfanos` en rama sana
- [x] I2/I4: `calcularProducibles` (inventory-5.ts) delega a canónica
- [x] I4: `inventory-2-pt.ts:562` aplica rendimientoPorHoja
- [x] I5: `_calcStockParaSupabase` (db.ts) suma stock variantes + usa canónica
- [x] Verificar invalidación de `_dispCache` tras registrarMovimiento/saveProducts
- [x] I6: movimientos registran `cantidad = stockDespues - stockAntes` (kardex cuadra)
- [x] I8: quitar `sbSave` muerto en `saveStockMovements`; recorte de tabla relacional >500 en initApp

## Fase 3 — Sync/Realtime

- [x] D3: anti-eco por `_deviceId` en vez de comparación de timestamps de reloj
- [x] D4: `_applyRTRelacional` aplica filter de status en recarga completa
- [x] D5: rama genérica en `_applyRTDesktopConDatos` para keys KV (quotes/receivables/payables/gastosRecurrentes/storeConfig)
- [x] D6: `sales_history` mapea `_updatedAt` al cargar
- [x] D8: `initApp` espera `window._dbReady` cuando existe `__mkCfg`

## Fase 4 — Negocio

- [x] N1: anticipo al crear pedido → registro `salesHistory` type:'anticipo' + income con method (criterio de caja, decidido)
- [x] N2: `_ajustarStockDiferencia` reemplazado por revertir(`_restaurarInventarioPedido`)+reaplicar(`_descontarInventarioPedido`)
- [x] N3: editar pedido finalizado ajusta stock (mismo patrón revertir+reaplicar) y actualiza salesHistory del folio
- [x] N4: `renderCxCPedidos` excluye mismos estados que el KPI (cancelado/finalizado/entregado)
- [x] N5: `reactivarPedido` solo revierte `totalPurchases` si venía de finalizado
- [x] N6: incomes de abono/cobro-al-entregar incluyen `method` real
- [x] N7: helper `window.mkRound2()` aplicado en reduce de balance.ts y reportes.ts

## Fase 5 — Auditoría 2026-07-09 (typecheck + contrato movimientos + XSS)

- [x] H2: `inventory-5.ts:1983` ReferenceError `p` fuera de scope en `abrirReabastecimiento` — línea muerta eliminada (`waUrl`/`waTxt` sin uso real, el href real ya recalcula inline con `pr`) — **hecho de inmediato, fuera de orden, bug trivial confirmado**
- [x] H1/H6: gate `npx tsc --noEmit` agregado como Step 0 en `scripts/build.js` (antes de tests, falla rápido). Verificado: `node scripts/build.js` completo pasa limpio (typecheck + 79 tests + lint + 34/34 compile + 8 bundles).
- [x] H3: fix real más simple que el propuesto — `registrarMovimiento` (inventory-1.ts:153) recibe `cantidadSolicitada = cantidad` como default en la destructuración. TS infería la propiedad como obligatoria por no tener default; con el default, las 12 llamadas sin `cantidadSolicitada` explícita ahora caen al fallback correcto (mismo comportamiento que el helper propuesto, sin duplicar función). Verificado: 0 errores tsc con "cantidadSolicitada" tras el fix.
- [x] H4: limpiados los 355 errores tsc restantes (369 iniciales − 14 de H3) en 32 archivos + 3 declaraciones incorrectas en `types/maneki.d.ts` (`_esc`/`_escAttr` muy estrictos, `_mkColorDot`/`_mkColorEmoji`/`_sumLineas`/`_money`/`_mkTimeline`/`setupSearchFilter`/`_syncHandler`/`_mkModalSaved` con firma real distinta a la declarada). Patrones repetidos: `parseInt`/`parseFloat` sobre campos ya-`number` → `Number()`; resta de `Date` directa → `.getTime()`; `.textContent = <number>` → `String()`; parámetros destructurados sin default (TS los infiere obligatorios) → default agregado; objetos dinámicos empujados a arrays tipados (`window.products.push`) → cast `as ManekiProduct`; `catch(e)` con `.message` → `catch(e: any)` (afecta `useUnknownInCatchVariables` de `strict`); `FileReader.result` (`string|ArrayBuffer`) → cast `as string` (siempre string por `readAsDataURL`). Cero cambios de comportamiento — solo tipos. 79 tests siguen pasando después de cada archivo.
- [x] H5: `config-init.ts` — innerHTML con concatenación reemplazado por `document.createElement('img')` + `.src` (nunca parseado como HTML). Agregado check de protocolo mínimo local (https/http/data) porque `_validateImgUrl`/`_safeLogo` de app-data.ts/config.ts aún no cargan en este punto (config-init corre síncrono en `<head>`).
- [x] H7: revisados los 12 catches silenciosos en los 4 archivos — NINGUNO está en ruta real de datos/persistencia/inventario/pedidos. balance.ts/clientes.ts: historial de autocompletado UI (localStorage). config-init.ts: bootstrap decorativo del sidebar. dashboard.ts: renders de widgets (sparkline, heatmap, clima, etc.), no persistencia. Conclusión: no aplica cambio — el criterio explícito del hallazgo ("dejar silenciosos los de decoración no crítica") ya los cubre tal como están.

## No tocar (documentado, no son tareas)

- [NO TOCAR] D7: SW skipWaiting/claim mezcla versiones a mitad de sesión — sesión dedicada futura
- [NO TOCAR] N8: Balance atribuye total completo al mes de finalización — decisión contable, N1 ya resuelve Reportes

## Verificación por fase

- [x] Fase 1: `node scripts/build.js` limpio
- [x] Fase 2: `node scripts/build.js` limpio
- [x] Fase 3: `node scripts/build.js` limpio
- [x] Fase 4: `node scripts/build.js` limpio
- [x] Fase 5 completa: `node scripts/build.js` limpio con gate de typecheck activo (0 errores tsc + 79 tests + lint + 34/34 TS compile + 8 bundles). H1-H7 todos resueltos.
- [x] Tests Vitest nuevos agregados (7 casos de fase 2/4 — confirmado en corrida: 79 tests pasan, incluye tests de fase 4 con nombres exactos del plan)


## Puntos 3, 4 y 5 — 2026-09-26

- [x] Pruebas de negocio y persistencia: 133 correctas; detalle y limites en VALIDACION-2026-09-26.md.
- [x] Cola relacional persistente, reenvio tras reinicio, kardex y borrados individuales; regresiones verificadas.
- [x] Publicar y validar HTTP 401/200, assets y SW maneki-e4be814737 en dominio original.
- [ ] Prueba fisica de impresion/PWA y operaciones contra staging real. <!-- BLOQUEADO: sin equipo fisico/staging; IAB bloquea Basic Auth. -->
- [x] Preparar cambios verificados para commit y push en github/fresh-start.

## Seguridad y concurrencia 2026-09-26
- [x] Login administrador probado por propietario y datos cargados tras RLS.
- [x] Aplicar incomes.method y comprobar bajo ROLE authenticated con ROLLBACK.
- [x] Corregir autoasignacion/recursion de user_roles; guardar 19 tablas privadas con RLS.
- [x] Instalar RPC optimistas, verificar conflictos y reenvios en SQL real sin datos QA persistentes.
- [x] Bloquear segunda pestaña; comprobar arranque offline; corregir indicador y ticket.
- [x] Publicar 1742889c, SW maneki-1ed0b2f342; 140 pruebas y build:check correctos.
- [x] Aplicar store RLS: bot retirado segun propietario. Lectura privada/escritura anonima bloqueadas; RPC admin y POS verificados.
- [ ] Impresion e instalacion PWA fisicas; falta equipo/modelo de impresora.
