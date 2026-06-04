# 🔍 Auditoría completa — Maneki POS (junio 2026)

> Revisión end-to-end del código, interfaz, UX, rendimiento y seguridad.
> **52 hallazgos** con ubicación (archivo:línea) y recomendación.
> Severidad: 🔴 alta · 🟡 media · 🟢 baja. Estado: ✳️ nuevo · 📌 ya anotado en CLAUDE.md.

---

## A. Bugs de código / programa (funcionales)

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 1 | 🔴 ✳️ | **7 iconos Font Awesome NO existen en el diccionario de `icons.js` → renderizan vacíos/invisibles**: `fa-barcode` (¡botón "Escanear" de inventario!), `fa-calendar-alt`, `fa-expand-alt`, `fa-play-circle`, `fa-question-circle`, `fa-shopping-cart`, `fa-telegram`. FA no se carga por CDN; `icons.js` sólo sustituye los `fa-*` que tiene en su diccionario `D`. | `src/icons.ts` (dicc.), usos en `index.html` y varios `src/*.ts` | Agregar los 7 paths SVG al diccionario `D` de `icons.ts`. |
| 2 | 🟡 ✳️ | **135 de 250 `<button>` sin `type`** → dentro de un `<form>` (login PIN, modales) el default es `submit` y puede recargar/enviar el formulario por accidente. | `index.html` (global) | Añadir `type="button"` a todo botón que no envíe formulario. |
| 3 | 🟡 ✳️ | **31 bloques `catch {}` vacíos** → errores silenciados, depuración imposible. | `balance.ts:731,758`, `config.ts:584,813`, `dashboard.ts:440,441`, `config-init.ts:19,26`, +23 | Al menos `console.warn(e)` o `mkHandleError`. |
| 4 | 🟢 ✳️ | **75 `parseInt()` sin radix** → parseo inconsistente potencial. | múltiples `src/*.ts` | `parseInt(x, 10)` o `Number()`. |
| 5 | 🟡 ✳️ | **9 `target="_blank"` sin `rel="noopener"`** → reverse tabnabbing. | `balance.ts`, `clientes.ts`, `inventory-1.ts`, `pedidos-1.ts` | Añadir `rel="noopener noreferrer"`. |
| 6 | 🟡 ✳️ | Tras update realtime de `products` (`_applyRTDesktopConDatos`) **no se invalida `productMap`/`_getProductById` ni `_invStockCache`** explícitamente → lookups O(1) podrían quedar obsoletos con cambios remotos. | `src/db.ts:331-334` | Reconstruir `productMap` y limpiar cachés tras RT de products. |
| 7 | 🟢 ✳️ | `_applyRTRelacional`: si el array local está vacío y llega un INSERT, hace **query completa a DB** en vez de insertar el payload. | `src/db.ts:255-260` | Insertar el `rowData` directamente también cuando `length===0`. |

## B. Bugs / deuda de interfaz

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 8 | 🔴 ✳️ | **~15 diálogos nativos `confirm()`/`prompt()`/`alert()`** → rompen el look premium, bloquean el hilo, ignoran dark mode y se ven mal en WebView/móvil. Ya existe `showConfirm()` del design system. | `inventory-1.ts:721,725,1129,1332`, `inventory-2.ts:619`, `inventory-4.ts:770,808`, `inventory-5.ts:195,1148,1344,1346,1384`, `dashboard.ts:1192`, `backup.ts:126`, `pedidos-3.ts:1309` | Reemplazar por `showConfirm`/modales/`prompt` estilizado. |
| 9 | 🟡 ✳️ | **Cambiar categoría en lote** pide el ID por `prompt()` mostrando una lista de IDs en texto plano. | `inventory-5.ts:1384` | Modal con `<select>` de categorías. |
| 10 | 🟡 ✳️ | **Registrar merma** usa 2 `prompt()` (cantidad + motivo) sin validación numérica. | `inventory-1.ts:721,725` | Modal único con input numérico validado. |
| 11 | 🟡 ✳️ | **20 `<img>` dinámicos + 1 estático sin `alt`** → imagen rota sin texto, a11y. | `src/*.ts` (innerHTML), `index.html` | `alt="${_esc(producto.name)}"`. |
| 12 | 🟡 ✳️ | **Botones solo-ícono sin `aria-label`** (editar/duplicar/eliminar en tablas) → lectores de pantalla los leen vacíos. | renders de inventario/pedidos/clientes | Añadir `aria-label`/`data-tip`. |
| 13 | 🟢 ✳️ | **Sin `<noscript>`** → pantalla en blanco si JS falla, sin explicación. | `index.html` | Mensaje "Activa JavaScript". |

## C. Diseño UI / UX (por secciones)

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 14 | 🟡 ✳️ | **CSP con `unsafe-inline`** en `script-src` y `style-src` (forzado por 264 onclick + 413 style inline) → la CSP no protege contra XSS inyectado. | `index.html:5` | Migrar a listeners/clases y endurecer CSP. |
| 15 | 🟡 ✳️ | **413 estilos inline + 264 `onclick` inline** en `index.html` → deuda de mantenimiento y duplicación. | `index.html` | Mover a clases `.mk-*` y delegación de eventos. |
| 16 | 🟡 ✳️ | Inventario: la tabla "dual" **oculta la `<table>` estática del HTML** y construye 4 sub-tablas → el `<thead>` estático de 11 columnas queda muerto en el DOM. | `inventory-5.ts:227`, `index.html:906` | Eliminar la tabla estática o reutilizarla. |
| 17 | 🟡 ✳️ | Inventario: **4 botones de sección con gradientes distintos** (`btnColor` por sección) reintroducen la "competencia de color". | `inventory-5.ts:791,817,842,866` | 1 primario + ghosts (clases `.mk-toolbar-btn`). |
| 18 | 🟢 ✳️ | **Falta skeleton de carga** en kanban y al cambiar de mes en Balance (sólo inventario/pedidos/clients lo tienen). | `pedidos-*`, `balance.ts` | Reusar `.mk-table-skeleton`. |
| 19 | 🟡 ✳️ | **Modales sin focus-trap ni `aria-modal`/`role="dialog"`**; Esc cierra pero el foco no se gestiona. | sistema de modales | Trampa de foco + `aria-modal="true"`. |
| 20 | 🟢 ✳️ | **Sin "skip to content" ni landmark `role="main"`**. | `index.html` | Añadir enlace de salto y landmarks. |
| 21 | 🟡 ✳️ | **Gráficas Chart.js sin alternativa textual** → datos inaccesibles para lectores de pantalla (Reportes/Balance/Dashboard). | `reportes.ts`, `balance.ts`, `dashboard.ts` | Tabla equivalente oculta o `aria-label` con resumen. |
| 22 | 🟢 ✳️ | Inventario: tag/proveedor siguen como `<select>` nativos mientras tipo ya es segmented → inconsistencia visual. | `index.html:890,899` | Unificar estilo de filtros. |
| 23 | 🟢 ✳️ | **Buscadores inconsistentes**: global con overlay, por-sección inline, distintos debounces. | varios | Unificar componente de búsqueda. |

## D. Rendimiento

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 24 | 🟡 ✳️ | **`icons.js`: MutationObserver hace `querySelectorAll` full-DOM en cada batch** de mutaciones (RAF). En una app que re-renderiza tablas grandes constantemente es caro. | `src/icons.ts:8,11` | Escanear sólo `m.addedNodes`, no todo `document`. |
| 25 | 🟡 ✳️ | **Sin bundler**: ~25k líneas en 30 scripts cargados por separado → muchos round-trips. | build | Concatenar/bundle para producción. |
| 26 | 🟢 ✳️ | **Archivos monolíticos** (`inventory-2.ts` 1896, `pedidos-1.ts` 1857, `pedidos-2.ts` 1815, `ui-extras.ts` 1756). | `src/*.ts` | Dividir por responsabilidad. |
| 27 | 🟡 ✳️ | `renderInventoryTable` reconstruye **todo el dualContainer con innerHTML** en cada cambio (pese al hash-guard). | `inventory-5.ts:895` | Render incremental/virtualización para inventarios grandes. |
| 28 | 🟡 ✳️ | `calcularDisponibilidadDesdeMP`/`calcularProducibles` se llaman **por fila en cada render** → potencial O(n×m). | `inventory-5.ts:455,530` | Cachear como `_stockCache`. |
| 29 | 🟢 ✳️ | El wrapper `_mkInvSummaryRow` recorre `window.products` en cada render. | `inventory-5.ts` (S14) | Reusar el set ya filtrado del render. |

## E. Seguridad

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 30 | 🟡 📌 | anon key partida en 3 (ofuscación) — la seguridad real depende 100% de **RLS**. | código JS | Verificar RLS en TODAS las tablas periódicamente. |
| 31 | 🟡 📌 | **Token de Telegram en `storeConfig` como string plano**. | storeConfig | Edge Function proxy. |
| 32 | 🟡 📌 | **nginx Basic Auth sin rate-limiting** → brute force. | VPS nginx | `limit_req_zone`. |
| 33 | 🟡 📌 | **Folios multi-tab sin UNIQUE en DB** → colisión. | Supabase | Constraint UNIQUE + retry. |
| 34 | 🟢 ✳️ | **`console.log` en producción** (`db.ts` ×7 + logs realtime) → fuga de estado/esquema en consola. | `db.ts`, realtime | Gate por flag `DEBUG`. |

## F. Código / mantenibilidad

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 35 | 🟡 ✳️ | **`tsconfig strict:false` + decenas de errores `tsc --noEmit`** (p.ej. `whatsapp.ts` `.value` sobre HTMLElement, `calcSaldoPendiente` no en Window) → sin red de tipos; el build real (esbuild) no checa tipos. | `tsconfig.json`, `whatsapp.ts`, varios | Tipar gradualmente y arreglar errores. |
| 36 | 🟢 ✳️ | Patrón frágil `(document.getElementById('x')||{}).value` repetido cientos de veces. | global | Helper tipado `$id<T>(id)`. |
| 37 | 🟢 ✳️ | **Lógica de filtro de búsqueda duplicada** (inventario/clientes/historial). | varios | Extraer `matchSearch()`. |
| 38 | 🟢 ✳️ | **Patrón de fecha `_fechaHoy() ?? toISOString().split`** repetido ~20 veces. | varios | Centralizar en un único helper. |
| 39 | 🟡 ✳️ | **`window.*` como bus de estado global** (productMap, cachés, filtros, decenas) → sin encapsulación. | global | Namespacing `MK.state.*`. |
| 40 | 🔴 ✳️ | **Sin tests automatizados** (solo `build:check`) → módulos de dinero (saldo, márgenes, rollback) sin red de regresión. | proyecto | Tests unitarios de `calcSaldoPendiente`, márgenes, rollback. |
| 41 | 🟢 ✳️ | Comentarios de bugs históricos ("BUG-IDX-10 FIX", "FIX-3") embebidos → ruido. | varios | Mover a CHANGELOG. |

## G. PWA / Offline

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 42 | 🟡 ✳️ | **SW cachea por nombre**; al recompilar mismo nombre depende del **bump manual** de `CACHE_NAME` → riesgo de servir JS viejo. | `sw.js:1` | Hash de contenido automático en build. |
| 43 | 🟢 ✳️ | Actualización sólo vía toast `SW_UPDATED` → el usuario puede quedarse con versión vieja si lo ignora. | `sw.js`, `init.ts` | Banner persistente "Recargar para actualizar". |
| 44 | 🟡 ✳️ | localStorage como fallback con productos ~255KB → **manejar `QuotaExceededError`**. | `db.ts`/persistencia | try/catch específico + aviso. |

## H. Mejoras UX específicas

| # | Sev | Hallazgo | Ubicación | Recomendación |
|---|-----|----------|-----------|---------------|
| 45 | 🟢 ✳️ | Inventario: el toggle "Mostrar SKU/Proveedor" es un botón gris suelto, fuera del patrón de toolbar. | `inventory-5.ts:255` | Integrarlo al `.mk-segmented`/toolbar. |
| 46 | 🟢 ✳️ | Kanban: hay totales por columna (S14) pero **sin colapsar columnas vacías**. | `pedidos-1.ts` | Colapsar columna sin pedidos. |
| 47 | 🟢 ✳️ | Clientes: el orden activo de columna no se indica de forma persistente entre renders. | `clientes.ts` | Flecha de orden persistente. |
| 48 | 🟢 ✳️ | Balance: conceptos por `datalist` sin categorías con color → difícil escanear. | `balance.ts` | Categorías predefinidas con chip de color. |
| 49 | 🟢 ✳️ | Reportes: hay presets de fecha pero **sin "vs periodo anterior" en los KPIs** (solo en gráfica). | `reportes.ts` | Delta % en cada KPI. |
| 50 | 🟢 ✳️ | Dashboard: widget de clima sin fallback visible si falla la red (más allá del guard silencioso). | `dashboard.ts` | Estado "clima no disponible". |
| 51 | 🟡 ✳️ | **Sin indicador global persistente "guardando…/guardado"** para operaciones de red (solo toasts efímeros). | global | Badge de estado de sincronización fijo. |
| 52 | 🟡 ✳️ | **Sin aviso de "cambios sin guardar"** al cerrar modales de edición con datos. | sistema de modales | Confirmar descarte de cambios. |

---

## Prioridad sugerida de ataque

| Prio | Items | Por qué |
|------|-------|---------|
| 🥇 Inmediato | **1** (iconos invisibles), **8** (diálogos nativos), **2** (botones submit), **6** (productMap RT) | Bugs visibles/funcionales en producción. |
| 🥈 Alto | **3, 5, 11, 12, 19, 24, 40** | Robustez, a11y, rendimiento, red de tests. |
| 🥉 Medio | **14, 15, 16, 17, 27, 28, 35, 42, 51, 52** | Deuda estructural y UX de fondo. |
| ⭐ Bajo | El resto | Pulido incremental. |

> Recomendación: empezar por el 🥇 (rápido y de alto impacto) y luego el 🥈.
