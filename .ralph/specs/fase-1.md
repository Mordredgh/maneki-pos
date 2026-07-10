# Fase 1 — Críticos (integridad de datos)

## D1 [CRÍTICO] Entidades relacionales sin caché localStorage

**Archivos:** `src/db.ts` — `saveProducts` (:1147), `savePedidos` (:1300), `savePedidosFinalizados` (:1358), `saveClients` (:1203), `saveSalesHistory` (:1223), `saveIncomes` (:1253), `saveExpenses` (:1272)

**Bug:** ninguno de estos escribe `localStorage['maneki_'+key]` (solo `sbSave` lo hacía, y estos ya no lo llaman — hacen upsert directo a la tabla relacional). Si `_loadFromTable` sufre timeout al arrancar (`_withTimeout` 8-10s, db.ts:868), `sbLoad` cae a localStorage vacío → devuelve `[]` → inventario/pedidos/clientes/balance aparecen vacíos en pantalla aunque los datos existan en Supabase.

**Fix:**
1. En cada `save*` mencionado, después del upsert exitoso a la tabla relacional, escribir espejo local:
   ```js
   try { localStorage.setItem('maneki_'+key, JSON.stringify(arr)) } catch (e) {}
   ```
2. En `sbLoad`, distinguir dos casos cuando la tabla relacional no da datos:
   - **Fallo de red/timeout real** (excepción, timeout) → usar el espejo localStorage como fallback.
   - **Tabla vacía legítima** (query exitosa, 0 filas) → NO usar el espejo, devolver `[]` de verdad.
3. Para `salesHistory`/`pedidosFinalizados` (pueden crecer mucho): recortar el espejo a los últimos ~500 registros antes de `setItem`, y envolver en try/catch por si `QuotaExceededError` (~5MB límite navegador) — que falle silenciosamente el espejo, nunca la operación principal.

## I3 [CRÍTICO] Variante sin stock no descuenta materia prima

**Archivo:** `src/pedidos-2.ts:74,128-140` (`_descontarInventarioPedido`)

**Bug:** `antesPT = prod.stock` es la suma de TODAS las variantes del producto. `_cantidadAFabricar = Math.max(0, cantidad - antesPT)`. Si el pedido es de 5 unidades de variante "Talla M" con stock 0, pero el producto tiene variante "Talla L" con stock 100, entonces `antesPT = 100` (suma) y `_cantidadAFabricar = max(0, 5-100) = 0` → la materia prima nunca se descuenta, aunque la M no tenía nada en vitrina y debía fabricarse.

**Escenario de prueba:** PT con variantes `[M: stock 0, L: stock 100]`, componente MP `A` (qty 1, rendimientoPorHoja 1, stock 50). Pedido de 5 uds de variante M.
- Esperado: MP A baja a 45 (se fabricaron las 5 piezas de M).
- Actual: MP A se queda en 50.

**Fix:** cuando el item del pedido trae `variante`, usar el stock de **esa variante específica** (no `prod.stock` sumado) como base para calcular `_cantidadAFabricar`:
```js
const stockVarianteEspecifica = /* buscar la variante exacta dentro de prod.variantes */;
const _cantidadAFabricar = Math.max(0, cantidad - stockVarianteEspecifica);
```
Registrar el movimiento de stock con antes/después de esa variante puntual, no del total sumado.

## D2 [CRÍTICO — viola regla dura del proyecto] `limpiarMovimientos` no borra en Supabase

**Archivo:** `src/balance.ts:392`, expuesta globalmente en `envios.ts:493`

**Bug:** hace `stockMovimientos=[]` seguido de `saveStockMovimientos()`. Pero `saveStockMovimientos` (`inventory-1.ts:123`) solo hace `sbSave('stockMovimientos', ...)`, que escribe el blob KV en tabla `store` — NO borra la tabla relacional `stock_movements`, que es de donde `sbLoad` realmente lee (`registrarMovimiento` inserta ahí directo, `inventory-1.ts:144-157`). Resultado: al recargar la página, todos los movimientos "limpiados" reaparecen. Es la violación exacta de la regla `upsert-sin-delete` que el lint del proyecto existe para prevenir.

**Fix:** ya existe la función correcta — `limpiarMovimientosInventario` (`inventory-5.ts:1418`), que sí hace el DELETE en la tabla relacional. Dos opciones (elegir la de menor riesgo tras revisar call sites):
1. Hacer que `limpiarMovimientos` (balance.ts:392) delegue/llame a `limpiarMovimientosInventario`.
2. Si nadie más llama `limpiarMovimientos` fuera de `envios.ts:493`, eliminar la función duplicada y apuntar esa exposición global a `limpiarMovimientosInventario` directamente.

Antes de borrar cualquier función, grep de todos los call sites de `limpiarMovimientos` en el repo para no romper nada.
