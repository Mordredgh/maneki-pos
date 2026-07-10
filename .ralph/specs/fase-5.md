# Fase 5 — Auditoría 2026-07-09 (typecheck + contrato movimientos + XSS)

Fuente: auditoría independiente corrida con `node scripts/lint-footguns.js` + `npm run build` + `npm run build:check` sobre el mismo repo. Confirma y añade a la auditoría de 3 agentes original (Fases 1-4): el `build:check` (tsc estricto) NO forma parte del pipeline real de build, así que errores de tipos ya detectados por TypeScript llegan a producción sin bloquear nada.

## H2 [CRÍTICO] — YA ARREGLADO, fuera de orden

**Archivo:** `src/inventory-5.ts:1983` (dentro de `abrirReabastecimiento`)

Era un `ReferenceError: p is not defined` real: dentro del `.map(([prov, items]) => {...})` se usaba `p?.proveedorUrl` sin que `p` existiera en ese scope (`p` solo existe dentro del `items.map((p:any) => ...)` anidado, que es un callback distinto). La variable resultante `waUrl` no se usaba en ningún lado — el `href` real del botón WA (unas líneas más abajo) ya recalculaba todo inline usando `pr` como nombre de parámetro correcto. Se eliminó la línea muerta completa (incluyendo `waTxt`, que tampoco se usaba en otro lado). Verificado con `npx tsc --noEmit` que el error `TS2304: Cannot find name 'p'` en esa línea ya no aparece.

## H1/H6 [CRÍTICO] — build real no ejecuta typecheck

**Archivos:** `package.json`, `scripts/build.js`

**Bug:** `package.json` define `"build": "node scripts/build.js"` y `"build:check": "npx tsc --noEmit"` como comandos separados. `scripts/build.js` corre (en orden): Vitest → lint-footguns → esbuild por archivo → bundling → hash del SW. Nunca invoca `tsc`. Como esbuild transpila sin verificar tipos completos, `npm run build` puede salir en verde con errores que `npm run build:check` ya reporta — el bundle deployado no es type-safe aunque el pipeline diga "OK".

**Fix:** agregar un paso de typecheck a `scripts/build.js`, antes de Vitest o antes de esbuild (decisión: ponerlo primero, para fallar rápido sin gastar tiempo en tests/bundles si los tipos ya están rotos):

```js
console.log('Typecheck...');
try {
  execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('\n  Typecheck falló. Corrige errores TypeScript antes de buildear.\n');
  process.exit(1);
}
```

**Orden de trabajo dentro de esta fase:** hacer este fix DESPUÉS de arreglar H2 (ya hecho) pero ANTES de H4 (limpieza masiva de tipos) — si se activa el gate primero, cualquier error de tipos nuevo introducido durante el resto de la Fase 5 (o fases anteriores, si Ralph las re-toca) se detecta de inmediato en vez de acumularse.

**Riesgo:** al día de la auditoría, `build:check` falla con MUCHOS errores preexistentes (ver H4). Si se activa el gate antes de limpiar esos errores, **el build se rompe por completo** y bloquea cualquier deploy, incluyendo los fixes de las Fases 1-4. Dos opciones, elegir la de menor riesgo:
1. Limpiar primero los errores bloqueantes reales (H3, y los de H4 que sean bugs runtime probables), luego activar el gate.
2. Activar el gate con una lista de excepción temporal (`// @ts-expect-error` puntual en los archivos con deuda vieja no crítica) y remover las excepciones a medida que se limpian, para no bloquear el trabajo de las otras fases mientras tanto.

Evaluar el volumen real de errores de `build:check` en el momento de ejecutar esta fase antes de decidir — si son pocos y localizados, opción 1 es más limpia; si son muchos y dispersos, opción 2 evita parálisis.

## H3 [ALTO] — Contrato `cantidadSolicitada` incompleto en movimientos de stock

**Archivos con llamadas incompletas (confirmado por tsc):**
- `src/inventory-2-pt.ts:761`
- `src/inventory-4.ts:87,110,683`
- `src/inventory-5.ts:212,1943`
- `src/pedidos-2.ts:225,259,300,323,361,403`

**Contexto:** este contrato ya lo introduce el fix I6 de la Fase 2 de este mismo `.ralph/` (`.ralph/specs/fase-2.md`), que exige que `registrarMovimiento` reciba tanto `cantidad` (el cambio real aplicado) como `cantidadSolicitada` (lo que el usuario pidió, puede diferir si el stock se truncó). Los tests ya esperan este campo (por eso `tsc` marca estas ~12 llamadas como incompletas contra el tipo actualizado).

**Fix:** crear un helper único que garantice el campo siempre presente, en vez de tocar cada call site a mano con el riesgo de olvidar alguno:

```typescript
function registrarMovimientoStockSafe(args: {
  productoId: string;
  productoNombre: string;
  tipo: string;
  cantidad: number;
  cantidadSolicitada?: number;
  motivo: string;
  stockAntes: number;
  stockDespues: number;
}) {
  return registrarMovimiento({
    ...args,
    cantidadSolicitada: args.cantidadSolicitada ?? args.cantidad,
  });
}
```

Reemplazar las ~12 llamadas directas a `registrarMovimiento(...)` en los archivos listados arriba por `registrarMovimientoStockSafe(...)`. Donde ya se conoce la cantidad solicitada real (el caso truncado de I6), pasarla explícitamente; en el resto, el fallback `?? cantidad` cubre el caso normal donde no hay truncamiento.

**Orden:** ejecutar junto con o inmediatamente después de I6 (Fase 2) — son el mismo contrato, no dos cambios independientes. Si Fase 2 ya se completó cuando se llegue aquí, este paso es solo terminar de propagar el campo a las llamadas que quedaron sueltas.

## H4 [ALTO] — Errores TypeScript amplios fuera del contrato de movimientos

**Archivo de config:** `tsconfig.json` (`strict: true`, pero `noImplicitAny: false`, `strictNullChecks: false` — strict parcial)

**Categorías de error encontradas por `npm run build:check`** (más allá de H2 y H3, ya cubiertos arriba):
- `unknown` usado como objeto sin narrowing (`app-data.ts:255`, `reportes.ts` varios)
- `number` asignado a campo `string` (`backup.ts:5`)
- `string | ArrayBuffer` asignado a `string`
- Propiedades inexistentes en tipos de productos/pedidos
- Firmas de función inconsistentes / llamadas con argumentos extra (`lazy-loader.ts`, `navigation.ts`)
- `require` sin tipos Node (`reportes.ts:1610,1612`) — falta `@types/node` o ajuste de `tsconfig` para ese archivo específico

**Fix — orden recomendado (no todo de una vez):**
1. Primero los que son bugs runtime probables: variables inexistentes, firmas incorrectas que indican una llamada real mal hecha, propiedades faltantes que podrían ser un typo de campo real.
2. Después los de tipos de datos compartidos — revisar `types/*.d.ts` y ajustar las interfaces para que reflejen la forma real de los objetos (en vez de forzar casts `as any` para silenciar el error).
3. El caso de `require` en `reportes.ts` es probablemente solo un problema de configuración (falta `@types/node` como devDependency, o ese archivo necesita excluirse del `strict` de browser-only) — no un bug de lógica. Resolver como config, no reescribiendo el código.

**No hacer:** no usar `as any`/`as unknown as X` como solución general para silenciar errores — eso reintroduce exactamente el problema que H1 busca prevenir (tipos que mienten). Solo aceptable como último recurso puntual y documentado, no como patrón de limpieza masiva.

## H5 [MEDIO] — innerHTML con dato de localStorage sin sanitizar

**Archivo:** `src/config-init.ts:20`

**Bug:**
```js
c.innerHTML = '<img src="' + cfg.logo + '" style="width:52px;height:52px;object-fit:contain;border-radius:12px;" alt="Logo">';
```
`cfg.logo` viene de `localStorage.maneki_storeConfig`. Si ese valor se corrompe o contiene comillas/HTML, puede romper el atributo `src` o abrir una inyección HTML. Riesgo bajo en la práctica (requiere que localStorage ya esté comprometido) pero es una construcción insegura innecesaria.

**Fix:**
```js
const img = document.createElement('img');
img.src = cfg.logo; // o pasar por una validación de URL tipo _validateImgUrl si existe una función así en el proyecto — revisar antes de escribir una nueva
img.style.cssText = 'width:52px;height:52px;object-fit:contain;border-radius:12px;';
img.alt = 'Logo';
c.replaceChildren(img);
```
Antes de escribir una función de validación nueva, revisar si ya existe algo equivalente a `_validateImgUrl` en el proyecto (mencionado en la auditoría como patrón ya usado en otro lugar) y reutilizarlo.

## H7 [BAJO/MEDIO] — catches silenciosos en rutas críticas

**Archivos:** `balance.ts`, `clientes.ts`, `config-init.ts`, `dashboard.ts` (patrón `catch(e) {}`)

**Bug:** no todos son problema — algunos son fallback visual tolerable. Pero en un POS, un error silencioso en persistencia/inventario/pedidos puede ocultar un estado corrupto sin que nadie se entere.

**Fix:** revisar cada `catch(e) {}` en esos 4 archivos. Para los que estén en el camino de: guardado de datos, carga de inventario/pedidos, backup, o cualquier operación que si falla deja al usuario con datos desactualizados sin saberlo — cambiar a `console.warn('[contexto] mensaje', e)` como mínimo (usar el mismo criterio que ya aplica `mkHandleError` en otras partes del proyecto, no inventar un formato nuevo). Para catches puramente decorativos (ej. un efecto visual opcional que no afecta datos), dejar el catch silencioso tal cual — no hay que tocar todos, solo los de impacto real en datos.
