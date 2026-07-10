# Fase 4 — Negocio

## N1 [ALTO] Anticipos invisibles para Reportes — criterio de caja (decisión ya tomada por el dueño)

**Archivos:** `pedidos-1-modal.ts:668-675` (crear pedido), `pedidos-2.ts:581-613` (finalizar pedido), `reportes.ts:23-25,92`

**Bug:** el anticipo capturado al CREAR un pedido se guarda solo dentro de `pagos[]` del pedido — nunca entra a `salesHistory` ni a `incomes`. Al FINALIZAR, `pedidos-2.ts:610` solo empuja a `salesHistory` el **saldo restante**, y solo si `_saldoFinal > 0`. En `_getAllVentas` (reportes.ts), como ese folio ya aparece registrado (por el registro `type:'pedido'` del saldo), la función `pfComoVentas` lo excluye de cualquier otro conteo — el dinero del anticipo simplemente nunca entra a Reportes, mientras Dashboard y Balance sí cuentan `p.total` completo. Reportes sistemáticamente muestra menos ventas que Dashboard/Balance para todo pedido con anticipo inicial.

**Decisión del dueño (2026-07-07):** criterio de CAJA — el anticipo cuenta como venta en el mes en que se cobró, no en el mes de finalización.

**Fix:**
1. Al **crear** un pedido con `anticipo > 0` (`pedidos-1-modal.ts:668-675`): además de guardarlo en `pagos[]` (ya lo hace, no tocar eso), empujar un registro a `salesHistory` con:
   - `type: 'anticipo'`
   - `folio` del pedido
   - `monto: anticipo`
   - fecha = fecha real de creación/cobro (no la de finalización)
   - `method` = método de pago capturado en el modal (ver N6 para consistencia)
   - Y su `income` correspondiente en la tabla `incomes` con el mismo `method`.
2. Al **finalizar** (`pedidos-2.ts:581-613`): sigue registrando solo el saldo restante como hoy — no cambiar esa parte.
3. Verificar en `reportes.ts` (`_getAllVentas` / `updateMonthlyStats`) que la suma sea: `anticipo` (registrado al crear) + `abono`(s) intermedios (ya se registran, confirmar) + `saldo final` (registrado al finalizar) = `p.total`, **sin doble conteo por folio**. El filtro `pfComoVentas` que excluye pedidos con folio ya presente en `salesHistory` debe seguir funcionando para no duplicar, pero ahora el anticipo YA está en salesHistory desde la creación — confirmar que la lógica de exclusión no termine excluyendo el saldo también por error.

**Datos históricos:** NO migrar pedidos ya creados/finalizados antes de este fix. Aplica solo hacia adelante. No escribir script de backfill salvo que el dueño lo pida explícitamente después.

## N2 [ALTO] `_ajustarStockDiferencia` ignora materia prima y variantes al editar pedido

**Archivo:** `pedidos-1-modal.ts:702-726` (llamado desde `:604-606`)

**Bug:** cuando se edita un pedido que ya tiene `inventarioDescontado === true`, el ajuste actual solo hace `prod.stock = Math.max(0, (prod.stock||0) - diff)` — un número plano. Problemas:
- Para productos con `mpComponentes`: cambiar la cantidad pedida no ajusta el stock de materia prima en absoluto — MP queda desincronizada del pedido real.
- Para productos con variantes: modifica `prod.stock` directo, pero en algún punto `syncStockFromVariants` recalcula ese campo desde la suma de variantes y **sobreescribe el ajuste**, perdiéndolo.
- Agrupa por `id` de producto ignorando `variante`: si el usuario cambia de una variante a otra del mismo producto, el diff calculado da 0 (mismo id, misma cantidad neta) pero en realidad hay que restaurar una variante y descontar otra.

**Fix:** eliminar la lógica de diff casera. Sustituir por el patrón **revertir + re-aplicar**, usando funciones ya existentes y correctas:
1. Llamar `_restaurarInventarioPedido` (pedidos-2.ts:180-203, ya usa snapshot rollback correctamente) con los `items` VIEJOS del pedido (antes de la edición).
2. Llamar `_descontarInventarioPedido` (pedidos-2.ts, ya arreglado en Fase 1 con el fix de I3) con los `items` NUEVOS (después de la edición).

Esto cubre variantes, MP y agrupación correctamente de forma gratuita porque reusa la lógica ya validada de creación/cancelación, en vez de mantener una tercera implementación paralela.

**Riesgo aceptado:** esto genera 2 tandas de movimientos de stock por cada edición (una de entrada al revertir, una de salida al reaplicar) en vez de un solo movimiento neto. Es aceptable — el kardex queda más verboso pero honesto y trazable. Cuidar el orden de `await`: la reversión debe completarse antes de iniciar el nuevo descuento, para no dejar estado a medias si algo falla en medio (usar try/catch con rollback si es necesario, siguiendo el mismo patrón de snapshot que ya usa `_restaurarInventarioPedido`).

## N3 [MEDIO] Editar pedido finalizado no ajusta stock por diferencia ni sincroniza salesHistory

**Archivo:** `pedidos-2.ts:1995-2038`

**Bug:**
- El stock solo se descuenta si `_esPrimeraFin` (el pedido nunca había descontado inventario antes, :2032-2038). Si YA estaba descontado y se editan las cantidades/items de un pedido finalizado, no hay ningún ajuste de stock por la diferencia.
- No se actualiza el registro de `salesHistory` (`type:'pedido'`/`type:'abono'`) de ese folio. Balance usa `p.total` directamente (se actualiza bien), pero Reportes sigue leyendo el `salesHistory` viejo con el monto anterior → Balance y Reportes divergen después de cualquier edición de un pedido ya finalizado.

**Fix:**
1. **Stock:** aplicar el mismo patrón revertir+reaplicar de N2 cuando `inventarioDescontado === true` y los items cambiaron (comparar snapshot viejo vs nuevo).
2. **salesHistory:** al detectar que cambió el total/saldo de un pedido finalizado, buscar el registro `type:'pedido'` de ese folio en `window.salesHistory`, actualizar su `total`/monto, y persistir con `saveSalesHistory()` — como el registro ya tiene `id`, el upsert lo actualiza en vez de duplicar.

## N4 [MEDIO] Pedidos cancelados con saldo aparecen en lista CxC pero no en el KPI total

**Archivo:** `balance.ts:734-741` (lista `renderCxCPedidos`) vs `balance.ts:584-586` (KPI `totalReceivables`)

**Bug:** `renderCxCPedidos` filtra solo por `calcSaldoPendiente(p) > 0`, sin excluir por `status`. Los pedidos cancelados permanecen en `window.pedidos` con `status:'cancelado'` (no se hace splice al cancelar). El KPI, en cambio, sí excluye explícitamente `['finalizado','cancelado','entregado']`. Resultado: un pedido cancelado con saldo pendiente aparece en la lista de "CxC de pedidos activos" (con botón de cobro/WhatsApp incluido) pero no suma al total mostrado arriba — lista y total no cuadran, y se puede intentar cobrar algo cancelado.

**Fix:** aplicar el mismo filtro de exclusión de estados (`['finalizado','cancelado','entregado']`) usado en el KPI (`balance.ts:585`) también en el filtro de `renderCxCPedidos` (`balance.ts:734`). Cambio de una línea.

## N5 [MEDIO] `reactivarPedido` resta `totalPurchases` del cliente incluso si nunca se sumó

**Archivo:** `pedidos-2.ts:1304-1313` (reversión) vs `:633` (incremento original)

**Bug:** `totalPurchases` del cliente solo se INCREMENTA cuando un pedido se FINALIZA (`:633`). Pero el bloque de reversión en `reactivarPedido` corre sin verificar el origen del pedido — resta `p.total` de `totalPurchases` para CUALQUIER pedido reactivado, incluyendo uno que estaba `cancelado` (que nunca sumó nada). Esto resta un monto que nunca se agregó, corrompiendo (bajando incorrectamente) el historial de compras acumulado del cliente.

**Fix:** condicionar la reversión de `totalPurchases` a que el pedido efectivamente venía de estado `finalizado` (verificar con `p.status === 'finalizado'` o la presencia de `p.fechaFinalizado` antes de la reactivación — usar la señal más confiable disponible en el objeto pedido). Si venía de `cancelado`, saltar la reversión de `totalPurchases` por completo.

## N6 [MEDIO] Cierre de caja agrupa todos los cobros como "Efectivo"

**Archivo:** `pedidos-1-extra.ts:898-903` (agrupación por método) — origen del problema en `pedidos-2.ts:902-908` (abono) y `pedidos-2.ts:520-526` (cobro al entregar)

**Bug:** la sección "Por método de pago" del cierre de caja agrupa `incomes` con `(i.method || i.metodo || 'Efectivo').trim()`. Pero los `incomes` generados por abono y por cobro-al-entregar se insertan sin campo `method`/`metodo` — el método real de pago solo vive en `pagos[]` del pedido y en el registro de `salesHistory`, nunca se copia al `income`. Resultado: el cierre de caja siempre muestra el 100% como Efectivo aunque el cliente haya pagado por transferencia o tarjeta.

**Fix:** al crear esos `incomes` (en los dos puntos de origen mencionados), incluir el campo `method` con el valor real que ya viaja disponible en `pagos[]`/el modal de cobro en ese momento. Los `incomes` históricos que ya se crearon sin método seguirán mostrándose como Efectivo — es aceptable, no requiere backfill.

## N7 [BAJO] Aritmética de dinero mixta (floats vs redondeo)

**Archivos:** `balance.ts:10-14,64,70,76,567`, `reportes.ts:20`

**Bug:** el flujo de finalización de pedido y `calcPedidoTotal` redondean correctamente por centavos (`Math.round(precio*100)`), pero `calcSaldoPendiente`, los totales de Balance, y las sumas de Reportes usan suma flotante cruda (`reduce((s,v) => s + Number(v), 0)`). Mezclar ambos estilos produce derivas de centavos (el clásico problema `0.1 + 0.2`) que aparecen como descuadres de $0.01-$0.02 entre Dashboard/Balance/Reportes.

**Fix:** crear un helper único `window.mkRound2(n)` que redondee a 2 decimales de forma consistente (`Math.round(n * 100) / 100`), y aplicarlo en los `reduce` de sumas de dinero en `balance.ts` y `reportes.ts`, y en `calcSaldoPendiente`. NO tocar el flujo de finalización de pedido (`calcPedidoTotal`) — ya redondea correctamente, no duplicar lógica ahí.
