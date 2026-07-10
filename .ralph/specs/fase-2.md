# Fase 2 — Inventario: unificar cálculo MP→piezas

## Raíz común

Existen 5 implementaciones divergentes del cálculo "cuánto puedo fabricar de un producto con kit según stock de materia prima (MP)":

| Función | Componente MP borrado | rendimientoPorHoja (rph) | Variantes |
|---|---|---|---|
| `getStockEfectivo._calcFabricableMP` (inventory-1.ts:179-189) | lo salta → sobre-cuenta | ignora | suma |
| `calcularDisponibilidadDesdeMP` (inventory-4.ts:915-928) | salta + flag `_tieneComponentesHuerfanos` | ignora | — |
| `calcularProducibles` (inventory-5.ts:33) | devuelve 0 (correcto) | ignora | — |
| `_descontarInventarioPedido` (pedidos-2.ts:128-140) | — | usa `Math.ceil(piezas/rph)*qty` (correcto, es el que manda) | suma (bug I3, ya en fase 1) |
| `_calcStockParaSupabase` (db.ts:1127-1145) | — | ignora | ignora |

Resultado real hoy: un mismo kit con componente borrado muestra simultáneamente "Disponible: 50" (I1) y "Producibles: 0" (I2) en la misma fila — contradicción visible al usuario.

## Fix: función canónica

Crear en `src/inventory-1.ts` (se carga primero en el orden de bundles):

```typescript
/**
 * Calcula cuántas piezas de un producto tipo kit se pueden fabricar
 * según el stock disponible de sus componentes de materia prima (MP).
 * Es la ÚNICA fuente de verdad para este cálculo — todo otro sitio delega aquí.
 */
window.calcularPiezasFabricables = function(prod) {
  if (!prod || !Array.isArray(prod.mpComponentes) || prod.mpComponentes.length === 0) {
    return Infinity; // no es kit, no aplica límite de MP
  }
  let minPiezas = Infinity;
  for (const comp of prod.mpComponentes) {
    if (comp.tipo === 'servicio') continue; // servicios no limitan stock físico
    const mp = window.products.find(p => p.id === comp.id);
    if (!mp) return 0; // componente borrado → NO fabricable, no saltar
    const rph = mp.rendimientoPorHoja || 1;
    const stockMp = mp.stock || 0;
    const hojas = Math.floor(stockMp / (comp.qty || 1));
    const piezas = hojas * rph;
    if (piezas < minPiezas) minPiezas = piezas;
  }
  return minPiezas === Infinity ? 0 : minPiezas;
};
```

La fórmula `floor(stock/qty) * rph` es la inversa exacta del descuento real en `_descontarInventarioPedido`: `Math.ceil(piezas/rph) * qty` hojas consumidas.

## Parches (delegar, no reescribir cada sitio)

1. **`I1`** `_calcFabricableMP` (inventory-1.ts:179-189) → sustituir su lógica interna por una llamada a `calcularPiezasFabricables(prod)`.
2. **`I1`+`I7`** `calcularDisponibilidadDesdeMP` (inventory-4.ts:915-928) → llamar a la canónica para el número; mantener su propio cache `_dispCache` (memoización) intacto. El flag `_tieneComponentesHuerfanos` debe:
   - Setearse `true` cuando la canónica devolvió 0 por componente borrado (puedes reusar la misma detección o hacer que la canónica opcionalmente reporte la razón).
   - **Resetearse a `false`** explícitamente cuando el resultado es sano — hoy nunca se limpia (bug I7), así que un componente re-agregado deja el warning fantasma.
3. **`I2`/`I4`** `calcularProducibles` (inventory-5.ts:33) → ya devolvía 0 correctamente para componente borrado, pero ignoraba rph. Sustituir por llamada a la canónica (resuelve I4 ahí también).
4. **`I4`** `inventory-2-pt.ts:562` → mismo problema de rph ignorado, aplicar la misma fórmula (llamar canónica si el contexto lo permite, o replicar la fórmula si es un cálculo parcial distinto — verificar el contexto exacto antes de decidir).
5. **`I5`** `_calcStockParaSupabase` (db.ts:1127-1145) → hoy ignora stock de variantes y rph, lo que hace que el `stock` publicado a la tabla `products` (consumida por la web pública) diverja de lo que ve el POS. Fix:
   - Sumar el stock de vitrina de todas las variantes (igual que `getStockEfectivo` ya hace en inventory-1.ts:192-198).
   - Sumar piezas fabricables vía `window.calcularPiezasFabricables(prod)` con fallback seguro si la función no está cargada en ese contexto (db.ts puede ejecutarse antes de que inventory-1.ts registre el global — verificar orden de carga real en `scripts/build.js` antes de asumir; si el orden no garantiza disponibilidad, usar `typeof window.calcularPiezasFabricables === 'function' ? ... : 0` como fallback defensivo, nunca lanzar excepción).

## Invalidación de cache

Verificar que `_dispCache` (usado por `calcularDisponibilidadDesdeMP`) se invalida cuando:
- `registrarMovimiento` cambia el stock de un componente MP.
- `saveProducts` persiste cambios de stock.

Si no hay invalidación explícita hoy, agregarla (borrar la entrada del cache correspondiente al producto afectado, o limpiar todo el cache si es más simple y el volumen de productos no penaliza performance).

## I6 [MEDIO] Movimientos de stock no cuadran al truncar a 0

**Archivo:** `pedidos-2.ts:109-118`

**Bug:** `registrarMovimiento` guarda `cantidad = -cantidadPedida` junto con `stockAntes`/`stockDespues`, pero el stock real se trunca con `Math.max(0, ...)`. Si `antesPT=3` y se piden 5: se registra `cantidad=-5, stockAntes=3, stockDespues=0` → `3 + (-5) = -2 ≠ 0`, el kardex no reconcilia.

**Fix:** calcular `cantidad` como la diferencia real aplicada, no lo solicitado:
```js
const cantidadReal = stockDespues - stockAntes; // ej: 0 - 3 = -3, no -5
```
Si se quiere trazar que se pidieron 5 pero solo había 3, guardar el dato solicitado en un campo aparte (`cantidadSolicitada`) sin que afecte la reconciliación `antes + cantidad === despues`.

## I8 [BAJO] `saveStockMovements` blob muerto + tabla sin recorte

**Archivo:** `inventory-1.ts:123-142`

**Bug:** `saveStockMovements` hace `sbSave('stockMovimientos', ...)` pero esa key está en `_RELATIONAL_TABLES` (apunta a tabla `stock_movements`), así que ese blob nunca se lee de vuelta — es escritura muerta. Además la tabla relacional crece sin límite (el recorte a 500 solo aplica al array/blob local).

**Fix:**
1. Quitar la llamada `sbSave` muerta dentro de `saveStockMovements`.
2. Agregar recorte real: en `initApp` (una vez por sesión, no en cada movimiento), hacer DELETE de filas de `stock_movements` más antiguas que las últimas 500 (por fecha o id). Este DELETE es el fix correcto, no una violación de la regla — la regla protege arrays que reflejan estado de negocio, no housekeeping de logs.
