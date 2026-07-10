# Fix plan — Auditoría S34 Bicho Capricho POS

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
- [BLOQUEADO] H1/H6: NO activado. 369 errores tsc preexistentes repartidos en 32 archivos al momento de evaluar — activar el gate ahora rompería `node scripts/build.js` para todo el equipo. Requiere sesión dedicada a H4 primero (limpieza masiva) o supresiones puntuales documentadas. Ver `.ralph/specs/fase-5.md` para las 2 opciones.
- [x] H3: fix real más simple que el propuesto — `registrarMovimiento` (inventory-1.ts:153) recibe `cantidadSolicitada = cantidad` como default en la destructuración. TS infería la propiedad como obligatoria por no tener default; con el default, las 12 llamadas sin `cantidadSolicitada` explícita ahora caen al fallback correcto (mismo comportamiento que el helper propuesto, sin duplicar función). Verificado: 0 errores tsc con "cantidadSolicitada" tras el fix.
- [BLOQUEADO] H4: no abordado esta sesión — 369 errores es demasiado volumen para limpiar sin una sesión dedicada por categoría. Ver desglose por archivo en `.ralph/specs/fase-5.md`.
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
- [x] Fase 5 parcial: `node scripts/build.js` limpio (79 tests, lint, 34/34 TS compile, bundles). `npm run build:check` sigue con errores preexistentes (H4 bloqueado) — gate NO activado (H1 bloqueado). H2/H3/H5/H7 completos.
- [x] Tests Vitest nuevos agregados (7 casos de fase 2/4 — confirmado en corrida: 79 tests pasan, incluye tests de fase 4 con nombres exactos del plan)
