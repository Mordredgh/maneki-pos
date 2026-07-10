# Fase 3 — Sync/Realtime

## D3 [ALTO] Anti-eco compara relojes de clientes distintos

**Archivo:** `db.ts:346-350`

**Bug:** `if (transformed._updatedAt <= localReg._updatedAt) return;` usa `_updatedAt` sellado con `new Date().toISOString()` del reloj del navegador de cada cliente. Si el dispositivo B edita a las 10:00:05 (su reloj) y el dispositivo A edita después en tiempo real pero su reloj está 4s atrasado (estampa 10:00:03), cuando B recibe el evento realtime de A evalúa `10:00:03 <= 10:00:05` → descarta la edición de A, que era más nueva en tiempo real. Pérdida de datos silenciosa hasta que alguien recarga.

**Fix — anti-eco por identidad, no por tiempo:**
1. Generar un `_deviceId` (uuid v4) una sola vez por navegador, persistido en `localStorage` (`maneki_device_id`), creado en `init.ts` o `config.ts` si no existe.
2. En cada `save*`, incluir ese id dentro del JSON del registro guardado: `_updatedBy: window._deviceId`. No requiere migración de esquema si Supabase guarda el registro completo como JSON/columnas ya existentes — si el modelo es columnar estricto, usar un campo ya disponible o agregar columna mínima; preferir campo dentro del payload existente si es posible.
3. En el handler realtime (donde hoy está la comparación de timestamp, db.ts:346-350):
   - Si `transformed._updatedBy === window._deviceId` → es eco de mi propio guardado, descartar (return).
   - Si es de otro dispositivo → aplicar el cambio SIEMPRE (last-write-wins del servidor, sin comparar tiempos de reloj local).
4. El campo `_updatedAt` puede seguir existiendo para mostrar "última edición" en UI, pero deja de ser el criterio de descarte.

## D4 [MEDIO] Recarga realtime sin filtro de status resucita pedidos finalizados

**Archivo:** `db.ts:314-317` (`_applyRTRelacional`, rama de recarga completa cuando `window[key]` está vacío)

**Bug:** cuando `window[key]` está vacío y llega un evento realtime que no es INSERT, el código hace `db.from(tabla).select('*').limit(2000)` SIN aplicar el `filter` que sí usa `_loadFromTable` (`_RELATIONAL_TABLES.pedidos.filter` excluye `finalizado/completado/entregado`, ver db.ts:794). Si un pedido finalizado quedó por error en la tabla `orders` (ej. un `deletePedidoActivo` que falló a medias), esta recarga lo trae de vuelta a `window.pedidos`, y como el guard de `_applyRTDesktopConDatos` (db.ts:399) solo excluye pedidos que YA están en `pedidosFinalizados` local, si ese finalizado no está en el array local en ese momento, **resucita visualmente en el kanban de pedidos activos**.

**Fix:** aplicar el mismo `_RELATIONAL_TABLES[key].filter` (si existe) a la query de recarga completa en `_applyRTRelacional`, igual que hace `_loadFromTable`. Una línea de `.eq()`/`.not()` adicional según cómo esté definido el filtro existente.

## D5 [MEDIO] Updates de entidades KV vía canal store se descartan silenciosamente

**Archivo:** `db.ts:394-435` (`_applyRTDesktopConDatos`)

**Bug:** esta función solo tiene ramas explícitas para `pedidos/products/clients/pedidosFinalizados/salesHistory/incomes/expenses`. Para eventos del canal `store` sobre las keys KV (`quotes`, `receivables`, `payables`, `gastosRecurrentes`, `storeConfig`), la función que las trae (`_applyRTDesktop`, db.ts:377) sí hace el `sbLoad` y obtiene `fresh`, pero no existe ninguna rama en `_applyRTDesktopConDatos` que la aplique a `window[key]` — el dato fresco se descarta sin usar. Cambios multi-dispositivo a cotizaciones, CxC, CxP, gastos recurrentes o config del negocio NO se propagan en vivo (solo se ven al recargar la página).

**Fix:** agregar una rama genérica al final del switch/if-chain existente:
```js
const KV_KEYS = ['quotes', 'receivables', 'payables', 'gastosRecurrentes', 'storeConfig'];
if (KV_KEYS.includes(key)) {
  window[key] = fresh;
  // re-render si la sección correspondiente está visible — usar el mapa de
  // funciones de render que ya exista en el proyecto para cada sección
  // (revisar navigation.ts / showSection() para el patrón correcto)
}
```
Verificar contra el patrón real de re-render usado para las otras keys en esta misma función, para mantener consistencia (no inventar un patrón nuevo).

## D6 [BAJO] `sales_history` no mapea `_updatedAt` al cargar

**Archivo:** `db.ts:784`

**Bug:** el `map` de carga de `sales_history` es `row => ({ ...row })`, sin agregar `_updatedAt` desde `row.updated_at`. Las filas recién cargadas no tienen `_updatedAt` hasta el primer save local, dejando una ventana donde el guard anti-eco no protege el primer update remoto.

**Fix:** `map: row => ({ ...row, _updatedAt: row.updated_at })`. Nota: con D3 aplicado (anti-eco por deviceId en vez de timestamp) este bug pierde relevancia, pero sigue siendo correcto agregarlo por consistencia con el resto de las tablas.

## D8 [BAJO] `initApp` no espera `_dbReady` cuando existe config remota

**Archivo:** `config.ts:574`

**Bug:** en el caso normal, `db` se crea síncronamente en el IIFE de `db.ts:69` antes de `DOMContentLoaded`, así que normalmente está listo cuando corren los `sbLoad` iniciales. Pero si existe `window.__mkCfg` (config embebida remota), el IIFE hace `await __mkCfg.getSupabase()` de forma asíncrona, y `db` puede seguir siendo `null` cuando `initApp` dispara sus `sbLoad` iniciales — cargando todo como `[]` sin re-fetch posterior.

**Fix:** en `config.ts:574`, antes de los `sbLoad` iniciales, esperar: `await window._dbReady` (si existe esa promesa expuesta desde db.ts) con un timeout de gracia razonable (ej. 5s) para no colgar la carga indefinidamente si algo falla. Si `window._dbReady` no existe como promesa expuesta hoy, exponerla desde el IIFE de db.ts (resolver cuando `db` queda asignado).
