# Comandos de ejecución y verificación

## Validación (correr después de cada fase)

```bash
node scripts/build.js
```

Hace, en orden:
1. 65+ tests Vitest
2. Lint footguns (`scripts/lint-footguns.js`) — bloquea: `upsert-sin-delete`, íconos SVG faltantes, nombres globales prohibidos
3. Compilación de los ~34 archivos TS → `js/*.js`
4. 8 bundles de producción
5. Regenera hash SHA-256 del Service Worker (`sw.js`)

**Salida esperada:** exit code 0, sin errores de test ni de lint. Si falla, leer el output completo antes de tocar más código — no hacer commit con build roto.

## Typecheck (comando separado hasta que Fase 5/H1 lo integre a build.js)

```bash
npm run build:check
```

Ejecuta `npx tsc --noEmit`. **Hoy NO forma parte de `node scripts/build.js`** — puede pasar el build normal aunque este comando falle (bug H1/H6 de `.ralph/specs/fase-5.md`). Hasta que ese fix se aplique, correr este comando manualmente antes de dar por buena cualquier fase que toque tipos, y especialmente antes/después de la Fase 5. Una vez H1 esté resuelto, este comando queda integrado dentro de `node scripts/build.js` y esta sección se vuelve redundante (no borrar hasta confirmar que el gate real está activo).

## Deploy (solo si el usuario lo pide explícitamente, no automático dentro del loop)

```powershell
.\deploy.ps1
```

Hace: `git add -A` → `git commit` → `git push github fresh-start:master` → trigger deploy en Coolify vía API (`COOLIFY_BICHOPOS_TOKEN`) → espera 60s y verifica.

## Tests nuevos

Agregar en `tests/` (Vitest). Ver casos requeridos en `.ralph/specs/fase-2.md`, `.ralph/specs/fase-4.md` y `.ralph/specs/fase-5.md` (contrato `cantidadSolicitada`). Deben correr dentro del mismo `node scripts/build.js`, no como comando aparte.

## EXIT_SIGNAL

Solo `true` cuando:
1. Todos los items no bloqueados de `fix_plan.md` están `[x]`
2. `node scripts/build.js` sale limpio (exit 0) en la última corrida
3. `npm run build:check` sale limpio (exit 0) en la última corrida (hasta que Fase 5 lo integre a `build.js`, verificarlo aparte)
4. No quedan bugs de ninguna de las 2 auditorías (original 19 bugs + auditoría 2026-07-09, 7 hallazgos) sin abordar o sin nota `<!-- BLOQUEADO -->`
