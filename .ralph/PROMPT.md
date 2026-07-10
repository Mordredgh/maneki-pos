# RALPH — Fix bugs auditoría S34 Bicho Capricho POS

## Meta

Arreglar los 26 bugs confirmados en `.ralph/fix_plan.md` (19 de la auditoría original + 7 de una segunda auditoría independiente del 2026-07-09), por fases, sin romper nada existente. Auditoría original: `C:\Users\gerar\.claude\plans\vectorized-cuddling-steele.md`. Auditoría 2 (Fase 5): typecheck real ausente del build, contrato `cantidadSolicitada` incompleto, innerHTML inseguro, catches silenciosos — detalle en `.ralph/specs/fase-5.md`.

## Restricciones técnicas (obligatorias, no negociables)

1. **upsert-sin-delete**: cualquier removal de un array local (`pedidos`, `incomes`, `stockMovimientos`, etc.) debe ir acompañado de su `delete*FromDB()` explícito en Supabase. El lint de build lo bloquea — no lo bypasees.
2. **NUNCA renombrar variables/globals legacy**: `maneki*`, `MK.*`, `window.pedidos`, `window.products`, etc. Son identificadores usados en toda la app y en la DB.
3. **Parches mínimos sobre reescrituras**: no refactorices archivos completos. Toca solo las funciones/líneas necesarias para el bug.
4. **Hash del Service Worker**: si tocas cualquier `.ts`/`.css`, el build regenera el hash de `sw.js` automáticamente (`scripts/build.js` paso 5) — no lo hagas a mano, solo asegúrate de correr el build completo.
5. **No tocar** los bugs marcados `[NO TOCAR]` en el fix_plan (D7, N8) — están documentados a propósito, no son tareas.
6. **Money**: si agregas redondeo, usar helper único, no reinventar por archivo.

## Orden de trabajo

Trabaja **fase por fase, en orden** (1 → 2 → 3 → 4 → 5). Dentro de cada fase, sigue el orden del checklist. No saltes a fase 3 con fase 1 incompleta.

**Excepción ya aplicada:** H2 (Fase 5, ReferenceError en `inventory-5.ts:1983`) ya se arregló fuera de orden porque era un bug trivial de una línea, confirmado, y no dependía de ninguna otra fase. Está marcado `[x]` en `fix_plan.md`. No repetir ese fix.

**Nota sobre Fase 5 y H1 específicamente:** activar el gate de `npx tsc --noEmit` en `scripts/build.js` (H1/H6) ANTES de terminar la limpieza masiva de tipos (H4) puede romper el build para las fases restantes si hay muchos errores preexistentes. Leer `.ralph/specs/fase-5.md` sección H1/H6 para las dos opciones y elegir según el volumen real de errores encontrado al momento de ejecutar.

Después de cada fase completa:
1. Correr el comando de `.ralph/AGENT.md`.
2. Si build limpio (tests + lint + compilación pasan), marcar los items de esa fase como `[x]` en `fix_plan.md`.
3. Continuar con la siguiente fase.

Si un bug requiere una decisión de producto no cubierta en las specs (ambigüedad real, no técnica), detente y dejalo `[ ]` con una nota `<!-- BLOQUEADO: razón -->` en fix_plan.md en vez de adivinar.

## Dónde está el detalle técnico

Cada fase tiene su spec en `.ralph/specs/fase-N.md` con: archivo, línea, bug exacto, y fix propuesto. Úsalos como fuente de verdad — son extracto directo de la auditoría de 3 agentes read-only que ya validaron el código real.

## Verificación final

Antes de dar la sesión por terminada: `.ralph/fix_plan.md` con TODOS los items no bloqueados en `[x]`, build limpio, y un resumen de qué se tocó por fase.
