# Fix plan — Auditoría S34 Bicho Capricho POS

## Migracion Cloudflare Pages 2026-09-26

- [x] Confirmar cuenta Cloudflare disponible y autorizacion de migracion/despliegue.
- [x] Preparar empaquetado explicito de assets sin fuentes, secretos ni respaldos; prueba rojo/verde.
- [x] Validar build completo (116 pruebas), typecheck y paquete protegido de publicacion (65 archivos).
- [x] Basic Auth en Worker para todas las rutas; secretos cifrados POS_USER/POS_PASSWORD. Usuario eligio contrasena.
- [x] Publicar en Cloudflare Pages; HTTP 401 sin acceso/clave incorrecta y 200 autorizado; JS, SW y manifest 200.
- Limitacion documentada: IAB bloquea Basic Auth publicado; interfaz del mismo paquete probada localmente y HTTP remoto verificado. Instalacion fisica aplazada.
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
- [x] Transacciones verificadas en PostgreSQL local y Supabase con ROLLBACK. Impresion fisica aplazada.

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
- Staging local verificado. Impresion/PWA fisica aplazada por el propietario.
- [x] Preparar cambios verificados para commit y push en github/fresh-start.

## Seguridad y concurrencia 2026-09-26
- [x] Login administrador probado por propietario y datos cargados tras RLS.
- [x] Aplicar incomes.method y comprobar bajo ROLE authenticated con ROLLBACK.
- [x] Corregir autoasignacion/recursion de user_roles; guardar 19 tablas privadas con RLS.
- [x] Instalar RPC optimistas, verificar conflictos y reenvios en SQL real sin datos QA persistentes.
- [x] Bloquear segunda pestaña; comprobar arranque offline; corregir indicador y ticket.
- [x] Publicar 1742889c, SW maneki-1ed0b2f342; 140 pruebas y build:check correctos.
- [x] Aplicar store RLS: bot retirado segun propietario. Lectura privada/escritura anonima bloqueadas; RPC admin y POS verificados.
- Aplazado por el propietario: impresion e instalacion PWA fisicas.

## Mejoras integrales solicitadas 2026-09-26
- [x] Inicio compacto, contraste, alertas y acciones visibles; estado de guardado.
- [x] Bloqueo y cierre de sesion conservando pendientes.
- [x] Comparacion y resolucion de conflictos desde interfaz.
- [x] Operaciones de pedido/inventario/cobro atomicas y reintento idempotente.
- [x] Entorno separado con datos sinteticos y pruebas extremo a extremo.
- [x] Validar, publicar y documentar.

## Segunda etapa integral solicitada 2026-09-27
- [x] Activar respaldos externos automaticos: bucket R2 privado, credencial local y tarea diaria verificados el 2026-09-27.
- [x] Preparar respaldo cifrado completo y ensayar restauracion en base aislada.
- [x] Pruebas completas con autenticacion y permisos reales.
- [x] Persistir solo filas modificadas, conservando conflictos y reintentos.
- [x] Centralizar calculos de dinero, saldos, fechas y redondeos.
- [x] Corte y conciliacion por metodo: esperado, contado y diferencia.
- [x] Historial protegido con autor, motivo y valores anteriores/nuevos.
- [x] Pedidos por pasos y resumen fijo; inventario con filtros/edicion clara.
- [x] Consistencia visual, estados de error/vacio y operacion movil.
- [x] Validar, publicar y registrar resultados/limites en Obsidian.

## Productos variables: talla y color 2026-09-27
- [x] Validar combinaciones y guardar existencias/recargo en variants JSONB.
- [x] Recalcular rangos por cantidad total entre tallas del mismo producto.
- [x] Mostrar combinación, precio unitario, total y faltantes de materiales antes de agregar.
- [x] Empatar talla o color con la variante de materia prima al descontar.
- [x] Publicar en Cloudflare; verificar dominio, autenticacion y hash de SW.
- [x] Validar visualmente en staging: edicion, guardado, recarga, selector, faltante, cancelar y aceptar; revisar movil.
- [x] Persistir rangos en JSONB y rescatar 6/6 productos variables del respaldo KV en Supabase.
- [x] Evitar que Cancelar confirme por tratar el texto "false" como verdadero.
- [x] Publicar correcciones de verificacion y comprobar dominio y Service Worker.

## Claridad visual de pedidos y variantes 2026-09-27

- [x] Mostrar avance del pedido, resumen final detallado y controles claros de cantidad/precio.
- [x] Elegir talla/color mediante botones accesibles y mostrar precio, material y total por linea.
- [x] Simplificar nombres en inventario y actualizar en vivo la vista previa de rangos.
- [x] Corregir acceso a Nuevo pedido desde inicio y guardar rangos editados.
- [x] Probar en staging el flujo completo y la vista movil con datos ficticios.
- [x] Construir, publicar y verificar 401/200 y hash de Service Worker en ambos dominios.

## Respaldo externo y alertas operativas 2026-09-27

- [x] Preparar subida cifrada a R2 con descarga y verificacion remota.
- [x] Probar que un archivo remoto alterado no se acepta como respaldo valido.
- [x] Activar R2 y crear bucket privado bicho-pos-backups, clase Standard.
- [x] Crear clave local y comprobar snapshot cifrado real de 24 tablas desde Supabase.
- [x] Crear token R2 limitado al bucket, comprobar subida/descarga de 24 tablas y tarea diaria con LastTaskResult=0.
- [x] Mostrar entregas vencidas y enlaces directos a pedidos, cobros e inventario.
- [x] Actualizar alertas ante cambios de estado, saldo o stock sin variar conteos.
- [x] Probar 170 casos, tipos, lint y flujo visual en staging; publicar y verificar HTTP/SW.

## Uniformidad visual de Inventario y Balance 2026-09-27

- [x] Unificar tamaño, color, estados y foco de botones de Inventario y Balance.
- [x] Etiquetar acciones de Balance y controles solo icono de Inventario.
- [x] Evitar que la columna Acciones se pierda al desplazar la tabla; adaptar barra de sección y acciones a móvil.
- [x] Comprobar visualmente escritorio/móvil, publicar y verificar dominio/SW.

- [x] Extender controles compartidos a Pedidos, Clientes, Categorias, Cotizaciones, Reportes y Equipos; corregir contraste amarillo y etiquetas de iconos.

## Mejora integral autorizada 2026-09-27

- [x] Reindexar codigo y contrastar alcance con respaldo, variantes, descuento de inventario y checklist existentes.
- [x] Corregir documentacion desactualizada: R2 y tarea Windows ya activos.
- [x] Cubrir los flujos con pruebas de persistencia, variantes, respaldo y bloqueo de estado; 177 pruebas correctas.
- [x] Panel de salud: conexion comprobada y cola/conflictos; no inventa una fecha de respaldo que el navegador no puede consultar.
- [x] Incluir product-images y pedidos-referencias en el respaldo cifrado y verificado; conservar copias sin retencion destructiva.
- [x] Propietario eligio mantener el respaldo programado en su PC por ahora; no ampliar Workers ni activar pagos.
- [ ] Propietario guardara despues una copia separada de la clave de recuperacion; nunca en Git/Obsidian.
- [x] Cuadricula talla/color: terminadas, fabricables, comprometidas sin duplicar descuentos, ajustes masivos con motivo y faltantes.
- [x] Ficha unica de pedido con referencias/aprobacion, variantes, materiales, pagos, entrega e historial; validacion antes de producir/entregar.
- [x] Costos estimados frente a reales por pedido: materiales, empaque, comisiones, envio y merma; advertencia de margen bajo.
- [x] Consolidar dialogos de matriz, ficha y salud; revisar matriz/ficha en escritorio y 390 px, y bloqueo de estado con pedido ficticio.
- [x] Validar cada flujo, build/typecheck, actualizar SW, publicar y verificar produccion.
- [x] Actualizar evidencia, grafo y memoria de Obsidian con resultados y limites reales.

## Correccion Kanban 2026-09-28

- [x] Reproducir con prueba el avance por arrastre sin aprobacion/checklist.
- [x] Aplicar el bloqueo en Kanban, pasar 178 pruebas y publicar con SW actualizado.
- [x] Verificar 401/200 en deployment y dominio; registrar evidencia y memoria.

## Aviso de faltantes en Kanban 2026-09-28

- [x] Mostrar en cada densidad los requisitos reales para producir o entregar y acceso directo a la ficha.
- [x] Retirar el indicador anterior que podia mostrar diseño listo sin aprobacion vigente.
- [x] Probar flujo en staging, 179 pruebas, tipos y lint; publicar y verificar dominio/SW.
