# Maneki POS — Web App (Coolify)

> **Última actualización:** 13 junio 2026 — Sesión 26 (auditoría S26: 1 bug ghost + 4 fixes menores + 4 mejoras UI/UX)
> **Sin pendientes de código.** App estable. Guardrails activos: lint pre-build + vitest (65 tests) en Step 0.
> **Versión app:** 2.6.2 | **SW hash:** maneki-422db4a0fa | **Branch:** fresh-start → master

---

## Changelog del Programa

> ⚠️ **REGLA:** Actualizar esta sección en CADA deploy. Es el contenido que aparece en el modal "¿Qué hay de nuevo?" de la app. El número de versión vive en `MK.version` (`src/config.ts`) y en el texto del modal (`src/init.ts` o `index.html`).

### v2.6.2 (13 junio 2026) — Auditoría S26 (bug ghost + UI/UX)
**Bugs:**
- 🐛 B5: eliminar venta del historial ahora emite DELETE en `sales_history` y `orders_finalizados` (eran upsert-only → la venta/pedido reaparecía al recargar). Misma clase F1 de S25.
- 🛡️ B1: `JSON.parse` de `mk_clientes_sort` con try/catch — un localStorage corrupto ya no rompe la sección Clientes
- 🔧 B3: invalidación completa del cache de ventas (`_allVentasCacheKey` incluido)
**UI/UX:**
- 💵 U1: formato de dinero unificado vía `fmtMoney()` (clientes, RFM, "Me deben", totales)
- 🎨 U2: botones de acción a `.mk-btn-primary`; gradientes oro inline → token `var(--mk-gold-*)`
- ⛔ U3: pedidos vencidos resaltados con borde rojo en kanban (incluida la vista compacta, antes sin indicador)
- 📲 U4: en "Me deben" del dashboard, botón WhatsApp por cliente + "Copiar desglose"

### v2.6.1 (13 junio 2026) — Auditoría S25 (integridad Supabase + rendimiento)
- 🐛 F1: ingresos/ventas fantasma — reactivar/eliminar pedido ahora borra los incomes y salesHistory de Supabase (antes solo del array local; `saveIncomes/saveSalesHistory` son upsert-only y reaparecían al recargar, descuadrando el balance y anulando el fix C1)
- 🐛 F2: reactivar pedido limpia también el salesHistory `type:'abono'` (cobro al entregar), no solo `type:'pedido'` — sin ventas fantasma acumuladas
- ⚡ F3: handlers realtime usan `window.renderBalance` (debounced 200ms) en vez del símbolo bare sin debounce — evita hasta 4 re-renders completos de Balance por flush RT
- 🛡️ F4: `saveExpenses` genera `mkId()` si falta el id (igual que `saveIncomes`) — evita upsert con id undefined/duplicado
- 🔧 F5: `saveIncomes/saveExpenses/saveClients/saveSalesHistory` ahora retornan Promise awaitable

### v2.6.0 (12 junio 2026) — Auditoría Dual S24
**Bugs críticos (Agentes 1+2+3):**
- 🐛 C1: reactivar pedido ahora limpia salesHistory, incomes y totalPurchases del cliente
- 🐛 C2: race condition en descuento de inventario resuelto (await correcto, inventarioDescontado solo true si guardado)
- 🐛 C3: balance descuadraba cuando pedido tenía abono/anticipo — eliminado filtro foliosEnIncomes de totalPedidosFin
- 🐛 A1: id de salesHistory en lotes usa mkId() en vez de pedidoFin.id (evita colisión upsert)
- 🐛 A2: UTC shift en vista Carga Semanal corregido (fechas locales con getFullYear/getMonth/getDate)
- 🐛 A4: bienvenida usa p.cliente||p.customer y productosInventario||productos (campos correctos)
- 🐛 A5: valuación e inventario por categoría usan getStockEfectivo() en vez de p.stock crudo
- 🐛 B3: nombre de archivo CSV de reabastecimiento usa fecha local
- 🐛 B1: gráficas de reportes usan chart.update('none') en vez de destroy()+new Chart()
**Diseño premium:**
- 🎨 D1: token oro #C5A572 → #C5973B (--mk-g500 canónico) en 24 archivos
- 🔲 D2: toolbar inventario usa mk-btn-primary en vez de gradiente inline
- 💬 D3: confirm()/alert()/prompt() nativos → showConfirm() + mini-modal para lead time
- 🎯 D4: 7 section-headers migrados de emoji HTML-entity a íconos FA SVG

### v2.5.0 (12 junio 2026)
- 🔧 Auditoría S23: 8 bugs corregidos y mejoras de estabilidad
- 🎨 10 íconos faltantes añadidos al sistema de íconos SVG (botones ya no aparecen en blanco)
- 🧹 "Limpiar movimientos" ahora borra también la tabla relacional `stock_movements` en Supabase
- 💰 El campo de costo se limpia al cambiar de producto en el ajuste de stock
- 📊 El costo promedio ponderado ya alimenta el historial de costos del producto
- 🔍 Productos eliminados muestran "(producto eliminado)" en lugar de nombre en blanco en movimientos
- ⚡ Índice de BD agregado en `stock_movements.producto_id` para consultas más rápidas
- 🖼️ Emojis en dashboard y navegación mobile reemplazados por íconos SVG consistentes

### v2.4.0 (12 junio 2026)
- 🛡️ Seguridad BD: eliminados pedidos zombi PE-0064/PE-0068, corregido `search_path` de funciones Postgres, política RLS de abonos reforzada
- 📋 Archivar productos: botón 📁 en cada fila para ocultar descontinuados sin borrar el historial
- 📅 Vista "Carga Semanal": 14 días con semáforo verde/amarillo/rojo según pedidos agendados
- 💬 WA Masivo Retiro: abre WhatsApp de todos los pedidos con +3 días esperando ser retirados
- 💰 Cierre de Caja: resumen diario de cobros agrupados por método de pago
- 📥 Exportar Kardex CSV: descarga el historial de movimientos de cualquier producto
- 📈 Tendencia de Inventario: gráfica de línea con el valor histórico del inventario
- 🔍 Búsqueda de productos dentro de pedidos: el buscador del kanban ahora encuentra por nombre de artículo
- 🎀 Filtro por ocasión en kanban: dropdown XV/Boda/Graduación/Baby/Aniversario/Navidad
- ⚠️ Alerta de stock insuficiente: aviso visible cuando se finaliza un pedido con más cantidad que stock disponible
- 🆔 Ingresos siempre con ID: los cobros sin ID generan uno automáticamente antes del upsert (evita errores silenciosos)
- 🔎 Detector de duplicados similares: al crear un producto, advierte si ya existe uno con nombre >80% similar

### v2.3.0 (12 junio 2026)
- 💳 Barra de progreso de pago en cada tarjeta kanban (rojo → amarillo → verde)
- 🎉 Campo "Ocasión" en pedidos (XV, boda, graduación, baby shower, etc.) con badge en kanban
- ⏳ Recordatorio automático cuando un pedido lleva +3 días en "Retirar" (con botón WA)
- 💰 Cobro al entregar: al finalizar un pedido con saldo pendiente, se ofrece registrar el cobro
- 🖨️ Orden de Producción imprimible con todos los pedidos en producción del día
- 🔍 Ctrl+K ahora busca pedidos por folio y cliente directamente desde la paleta de comandos
- 💾 Indicador visual de guardado (✓ Guardado / Guardando...) en esquina de la pantalla
- 📋 Conteo físico de inventario: ajusta stock masivo con un solo clic
- 🛒 Lista de reabastecimiento por proveedor con exportación WA y CSV
- 📊 Gráfica donut de valor de inventario por categoría
- 🤖 Stock mínimo sugerido automáticamente desde el consumo real de los últimos 60 días

### v2.2.0 (11 junio 2026)
- ⚡ Carga más rápida — scripts agrupados en bundles, una sola petición al abrir la app
- 📦 Inventario sin lag — búsqueda y filtros con render incremental, no congela la pantalla
- 🔄 Actualización automática — el SW detecta cambios y muestra aviso para recargar
- 📊 Disponibilidad de materias primas con caché — abre pedidos al instante
- 📱 Sidebar y botones corregidos en móvil — ya no se bloqueaban los clicks
- 🛒 Pedidos se guardan completos — corregido bug donde artículos agregados o borrados se revertían solos
- 🗂️ Kanban más compacto — tarjetas pequeñas y columnas con ancho fijo
- ⏱️ Secciones ya no se quedan cargando — Balance, Reportes, Pedidos y Envíos abren al instante

### v2.1.0 (3 junio 2026)
- 🎨 Rediseño premium del dashboard con KPIs y gráficas mejoradas
- 🔍 Command palette (Ctrl+K) para navegar y ejecutar acciones sin mouse
- 📊 Comparativa año a año en reportes con variación porcentual
- 👥 Segmentación RFM de clientes (Campeones, Leales, En riesgo, etc.)
- 🔒 Seguridad: eliminado inline onclick, CSP reforzado, XSS corregido en múltiples puntos

### v2.0.0 (1 junio 2026)
- 🌐 Migración completa de app de escritorio a PWA web (Coolify)
- ☁️ Supabase como fuente de verdad con realtime y soporte offline
- 📲 Instalable como app en celular y escritorio
- 🚀 Service Worker con caché inteligente para uso sin conexión

---

## Runtime Environment

This is a **web application** deployed on Coolify (VPS: 195.26.247.101).
URL: https://pos.manekistore.com.mx
Protected by nginx Basic Auth (usuario: manekimaster).

- **NO Electron, NO desktop app, NO SQLite local.**
- Do NOT reference electron, ipcRenderer, preload.js, or SQLite.
- Verification is done by reading source files, not by launching a server.

---

## Stack

| Campo | Valor |
|-------|-------|
| Frontend | HTML + CSS + Vanilla JavaScript (sin bundler/framework) |
| Source | TypeScript en `src/*.ts`, compilado con esbuild a `js/*.js` |
| DB Remota | Supabase (fuente de verdad, realtime, RLS) |
| Cache Local | localStorage (fallback básico) |
| CSS | Tailwind v3 build purgado 32.6KB (`css/tailwind.css`) + `styles.css` + `ui-redesign.css` + `responsive.css` + `maneki-premium.css` |
| Icons | `js/icons.js` (SVG propio, sin Font Awesome) |
| PWA | `manifest.json` + `sw.js` (Service Worker v2.3.2) — 38 archivos cacheados |
| Deploy | `git push github fresh-start:master` → Coolify auto-deploy |

---

## Project Layout

```
index.html              — SPA principal (~3300 líneas)
sw.js                   — Service Worker v2.3.2
manifest.json           — PWA manifest
maneki-premium.css      — Design system premium (sidebar oscuro, tokens CSS)
js/
  db.js                 — Supabase client, realtime, mkId, mkHandleError
  config.js             — initApp, storeConfig, helpers (_fechaHoy, calcSaldoPendiente)
  config-init.js        — Pre-carga storeConfig desde caché para sidebar instantáneo
  init.js               — Confetti, sonido, breadcrumb, onboarding, SW listener
  design-system.js      — Tema, dark mode, showSection, lazy loader
  navigation.js         — showSection con History API (URL routing)
  pedidos-1.js          — Modal pedido, tabla, filtros, folios, kanban cards
  pedidos-2.js          — Kanban, cambio de status, batch, descuento inventario+rollback
  pedidos-3.js          — Imprimir ticket, duplicar, WhatsApp, calendario, PDF export
  inventory-1..5.js     — CRUD productos, variantes, stock, alertas, materias primas
  balance.js            — CxC, CxP, ingresos, gastos, balance mensual
  reportes.js           — Gráficas Chart.js, stats, historial de ventas
  dashboard.js          — KPIs, alertas entrega, flujo de caja, sparkline, clima
  clientes.js           — CRUD clientes, historial, tags actividad
  app-data.js           — Cotizaciones, análisis ABC de productos
  backup.js             — Export/import JSON con validación y checksum, soporte .gz
  equipos.js            — ROI por equipo, tabs Equipos/Avance ROI/Historial
  envios.js             — Cálculo de envíos, mapas Leaflet con guard offline
  whatsapp.js           — Templates de mensajes WhatsApp
  ui-extras.js          — Modales, toast, undo, exportar Excel, clearAllData
css/
  styles.css            — Paleta Cream+Dorado+Lila, tokens CSS, sidebar light
  ui-redesign.css       — Status pills, mejoras UI
  responsive.css        — Media queries desktop/tablet/mobile/XS
  tailwind.css          — Build purgado 32.6 KB (NO usar CDN)
src/                    — Fuentes TypeScript (compilar con esbuild --minify)
types/maneki.d.ts       — Definiciones de tipos globales
```

---

## Key Conventions (CRÍTICO — nunca romper)

```javascript
// FECHAS — nunca usar toISOString() para fechas locales (UTC shift de noche)
_fechaHoy()                     // ✅ YYYY-MM-DD local
new Date().toISOString()        // ✅ solo para timestamps (fechaCreacion, updated_at)
new Date().toISOString().split('T')[0] // ❌ PROHIBIDO para fechas del negocio

// SALDO — fuente de verdad unificada
calcSaldoPendiente(p)           // ✅ calcula desde p.pagos[] array
p.resta                         // ❌ NUNCA leer directo — puede estar desactualizado

// STOCK — maneja variantes correctamente
getStockEfectivo(p)             // ✅ stock real considerando variantes
p.stock                         // ⚠️  solo como dato crudo, no para stock efectivo

// PRODUCTOS — lookup O(1)
_getProductById(id)             // ✅ vía productMap
products.find(p => p.id === id) // ⚠️  solo cuando productMap no está disponible

// UUID
mkId()                          // ✅ único generador unificado
crypto.randomUUID()             // ❌ NO usar directo

// ERRORES
mkHandleError(err, context)     // ✅ handler centralizado

// DIÁLOGOS — siempre modales async (nunca bloqueantes)
showConfirm(msg, title)              // ✅ Promise<boolean>
showPrompt(msg, defaultValue, title) // ✅ Promise<string|null> — reemplaza prompt() nativo
confirm() / alert() / prompt()       // ❌ PROHIBIDO — el linter de build lo rechaza

// FOOTGUN LINTER — scripts/lint-footguns.js corre como Step 0b del build
// Para uso legítimo y deliberado añadir al final de la línea: // footgun-ok: <razón>

// REPORTES — caché memoizada
_getAllVentas()                  // ✅ en reportes.js — no bypasear
// ⚠️  invalidar via window._invalidarCacheVentas() — NO asignar _allVentasCache = null directo (es variable privada)

// REALTIME — guard contra canales duplicados
window._mkRTSetupDone           // se checa antes de llamar _setupRealtime()
```

---

## Comandos Útiles

```bash
# Build completo (vitest → lint-footguns → esbuild → bundles → sw hash)
node scripts/build.js
# ⚠️  Falla si hay tests rotos O si hay un footgun detectado en src/

# Correr solo los 63 tests de regresión (sin compilar)
npx vitest run --reporter=verbose

# Compilar un archivo TS individual (SIEMPRE con --minify en producción)
npx esbuild src/X.ts --outfile=js/X.js --sourcemap --target=es2020 --minify
# ⚠️  NO usar --format=iife ni --global-name=_

# Rebuildar CSS de Tailwind purgado
npx tailwindcss -i ./css/tailwind-input.css -o ./css/tailwind.css --minify

# Deploy a producción
git push github fresh-start:master

# Type-check sin compilar
npm run build:check

# Reset tour de onboarding (para testing)
localStorage.removeItem("mk_onboarding_done")

# Guardar pedidos manualmente desde consola
MK.save("pedidos")

# Ver uso de almacenamiento
mostrarEstadoAlmacenamiento()
```

---

## NO HACER (reglas absolutas)

- ❌ NO mencionar Electron, ipcRenderer, require('electron'), SQLite, preload.js
- ❌ NO usar `new Date().toISOString().split('T')[0]` para fechas del negocio
- ❌ NO leer `p.resta` directamente — usar `calcSaldoPendiente(p)`
- ❌ NO proponer: dark mode auto, favoritos, frecuencia compra, alertas riesgo, cupones, tags pedidos, timeline de actividad, plantillas de pedido
- ❌ NO proponer feature de cumpleaños de clientes
- ❌ NO mencionar precio por cantidad, modo kiosco, ni productos relacionados en catálogo
- ❌ NO usar `preview_*` tools ni workflow de verificación (es web en Coolify, no dev server)
- ❌ NO usar `--format=iife` ni `--global-name=_` en esbuild
- ❌ NO usar `crypto.randomUUID()` directo — usar `mkId()`
- ❌ NO parsear `JSON.parse()` la tabla `store` de Supabase sin try/catch — es JSON string
- ❌ NO usar `prompt()` / `confirm()` / `alert()` nativos — usar `showPrompt()` / `showConfirm()` / `manekiToast()`
- ❌ NO usar el nombre `_fechaLocal` en ningún módulo — colisiona con función de ui-extras (renombrar a `_fechaStr` u otro)

---

## Base de Datos Supabase

### Tablas Relacionales (fuente de verdad principal)
| Tabla | Descripción |
|-------|-------------|
| `products` | Catálogo de productos y materias primas |
| `orders` | Pedidos activos |
| `orders_finalizados` | Pedidos completados/cancelados |
| `sales_history` | Historial de ventas POS y cobros de pedidos |
| `clients` | Base de clientes |
| `incomes` | Ingresos registrados en Balance |
| `expenses` | Gastos registrados en Balance |
| `categories` | Categorías de productos |

### Tabla `store` (key/value — legacy, aún activa)
```javascript
// ⚠️ SIEMPRE parsear manualmente — el valor es STRING JSON
const { data } = await supabase.from('store').select('*').eq('key', 'storeConfig').maybeSingle();
const config = JSON.parse(data.value); // ← obligatorio el JSON.parse()

// Keys activas en tabla store:
// storeConfig, folioCounter, stockMovimientos, gastosRecurrentes,
// ingresosRecurrentes, notas, quotes, equipos, roiHistorial, roiConfig,
// envioAnillos, backupMeta, categories (en migración)
```

### Supabase RLS
- La anon key es pública en el código JS (split en 3 partes como ofuscamiento básico)
- La seguridad real depende de Row Level Security activo en TODAS las tablas
- **Verificar periódicamente que RLS esté activo** — especialmente en tablas nuevas

---

## Sesiones de Trabajo — Historial Completo

### Sesión 1 (31 mayo 2026) — 34 mejoras
- Bugs críticos: rollback variantes, cola realtime, folio counter, retry con backoff
- Backup con checksum, lock optimista, mkHandleError centralizado
- productMap O(1), diff update realtime, mkId unificado
- Migración completa de Electron a web PWA
- IndexedDB, URL routing, notificaciones browser, PWA instalable
- Ctrl+1-9 navegación, resumen WA, clima, bulk precios, etiquetas batch, backup .gz

### Sesión 2 (1 junio 2026) — 20+ mejoras
- **ELIMINADO** todo código Electron/ipcRenderer/sqliteStorage de `src/db.ts` (~300 líneas)
- **CREADO** `mkId()` global, `mkHandleError()` global
- **CORREGIDO** 13+ lecturas directas de `p.resta` → `calcSaldoPendiente(p)`
- Tailwind CDN (350KB) → build purgado `css/tailwind.css` (32.6KB) — ahorro 317KB
- JS Bundle: 26 archivos minificados (~834KB)
- Service Worker v2.3.0 → 38 archivos cacheados (antes 13)
- Rediseños: Balance, Reportes, Análisis

### Sesión 3 (1 junio 2026) — 60+ mejoras (Auditoría completa 4 agentes)
**Bugs críticos corregidos (6/6):**
- `savePedidos()` ahora async + await al crear/editar
- `await window._folioCounterReady` antes de `generarFolioPedido()`
- `_descontarEmpaquesInventario`: rollback si `saveProducts()` falla
- `_allVentasCache = null` en 4 sitios: reportes, balance, app-data, pedidos-2
- Fecha anticipo usa `_fechaHoy()` (corrige UTC bug después de 6pm)
- `getNextFolio`: límite de 20 reintentos

**Seguridad (7/7):**
- XSS: `_esc(descripcion)` en toast undo
- XSS: `_esc(i)` en alertas dashboard
- XSS: `_esc(name)` en breadcrumb
- Logo: `_safeLogo()` bloquea `javascript:` protocol
- Emoji storeConfig vía `textContent` (no innerHTML)
- SQL schema eliminado del `console.log` en producción
- `clearInterval` antes de `setInterval` en auto-backup

**Performance:**
- Tailwind build purgado ✅ (ya hecho en S2)
- `renderBalance` debounce 200ms
- `normalizarResta` con guard de hash

**Rediseños UI/UX (6 secciones):**
- Dashboard: KPIs limpios, reloj discreto
- Pedidos: header 2 filas, columna "Cobro" unificada, drawer Lista Producción
- Inventario: toggle SKU/Proveedor ocultos por default
- Clientes: stat-cards → barra horizontal compacta
- Equipos: tabs Equipos | Avance ROI | Historial
- Configuración: theme buttons accesibles, preview inline, zona peligrosa con borde rojo

### Sesión 4 (2 junio 2026) — Fixes post-auditoría
**Fixes aplicados (6/6):**

| # | Fix | Archivos |
|---|-----|----------|
| 1 | **XSS tags onclick** — `data-tag="${_esc(t)}"` + `onclick="eliminarTag(this.dataset.tag)"` | `src/config.ts` |
| 2 | **Toast config** — movido dentro de `.then()` de sbSave; `.catch()` muestra error visible | `src/config.ts` |
| 3 | **SW v2.3.2** — `postMessage({type:'SW_UPDATED'})` al activar; listener en `init.ts` muestra toast | `sw.js`, `src/init.ts` |
| 4 | **iOS Safari scroll** — `background-attachment: scroll` para tablets ≤1023px | `css/responsive.css` |
| 5 | **Comentarios fantasma** — removidos `// 2)` en saveProducts, savePedidos, savePedidosFinalizados, saveSalesHistory | `src/db.ts` |
| 6 | **Archivos basura** — eliminados `inventory.js.bak.old`, `pedidos.js.bak.old`, `split_files.js` | raíz |

### Sesión 5 (2 junio 2026) — Auditoría #2 completa (19 fixes)

| # | Fix | Archivos |
|---|-----|----------|
| BUG-1/2 | **Código Electron eliminado** — `splashProgress()` + 4 restos `ipcRenderer`/`require('electron')` | `src/config.ts` |
| BUG-3 | **`_allVentasCache`** — expuesta `window._invalidarCacheVentas()` en `reportes.ts`; usada desde `pedidos-2.ts` líneas 789 y 1003 | `src/reportes.ts`, `src/pedidos-2.ts` |
| BUG-4 | **`guardarDatos` indefinida** — ternario reemplazado por `savePedidos()` directo | `src/pedidos-2.ts` |
| BUG-5 | **Doble conteo cliente** — `totalGastado` ya no suma `totalAbonos` (ya incluidos en `totalPedidos`) | `src/config.ts` |
| BUG-6 | **Galería fotos XSS** — URLs escapadas con `%27/%22` antes de inyectar en `onclick` | `src/pedidos-3.ts` |
| BUG-7 | **Rollback empaques** — `variantsBefore` guardado y restaurado en `_descontarEmpaquesInventario` | `src/pedidos-2.ts` |
| S1 | **XSS `proveedorUrl`** — `data-url` approach, `onclick` usa `this.dataset.url` | `src/inventory-5.ts` |
| S3 | **catch silenciosos** — `console.warn` en `saveClients`, `saveIncomes`, `saveExpenses` | `src/db.ts` |
| P1 | **`verificarConexionSupabase`** — interval 30s → 5 min (−2,760 queries/día) | `src/config.ts` |
| P2-cache | **`_allVentasCache` key** — incluye suma de totales para detectar ediciones | `src/reportes.ts` |
| P2-hash | **`normalizarResta` hash** — incluye suma de montos de pagos, no solo conteo | `src/pedidos-1.ts` |
| P4 | **Cormorant Garamond** eliminado de Google Fonts (−1 round-trip) | `index.html` |
| D1 | **`netlify.toml`** eliminado (deploy actual: Coolify, no Netlify) | raíz |
| D2 | **`MK.version`** unificado a `'2.2.0'` (antes `'4.1'`) | `src/config.ts` |
| D3 | **CSS conflict** documentado en `styles.css` | `css/styles.css` |
| D4 | **`saveToLocalStorage`** comentada como no-op intencional con explicación | `src/db.ts` |
| U3/N4 | **Skeleton screens** inyectadas en `inventoryTable`, `pedidosTable`, `clientsTable` antes del Promise.all | `src/config.ts` |
| N1 | **PWA install prompt** — `beforeinstallprompt` capturado; banner tras 3 visitas | `src/init.ts` |

### Sesión 9 (2 junio 2026) — 18 pendientes aplicados

| Categoría | Fixes |
|-----------|-------|
| Bugs (4) | B2 toast foto Storage, B8 migración anticipo legacy→pagos[], B10 guard kit stock con rollback |
| Performance (6) | P1 hash guards tablas, P3 setTimeout redundante eliminado, P4 debounce realtime consolidado, P5 limit+orderBy en _RELATIONAL_TABLES, P8 pre-calentado _getAllVentas, P9 _lastSyncAt delta sync |
| UX (8) | UX2 preview bulk edit con showConfirm, UX4 SVG columnas kanban vacías, UX7 fechas date-only en tabla mobile, UX9 datalist balance conceptos, UX11 botón WA en RFM, UX12 dblclick precio inline PT, UX13 presets fecha reportes, UX15 botón tutorial restart config |

### Sesión 8 (2 junio 2026) — Auditoría exhaustiva (3 agentes: bugs, performance, UX)

**Metodología:** Se lanzaron 3 agentes en paralelo para auditar bugs, performance y UX/nice-to-have. De ~43 hallazgos se aplicaron 17 en esta sesión; el resto queda en PENDIENTES abajo.

#### ✅ Bugs aplicados

| # | Fix | Archivos |
|---|-----|---------|
| B1 | **Folio offline warning** — el IIFE fire-and-forget de Supabase ahora muestra toast `⚠️ Folio guardado localmente` si falla la persistencia | `src/pedidos-1.ts` |
| B4 | **AbortController en swipe kanban** — `_kanbanTouchAbort.abort()` antes de añadir nuevos listeners; elimina acumulación de handlers | `src/pedidos-2.ts` |
| B6 | **`Array.isArray(window.incomes)`** — reemplaza `!== undefined`; protege contra `null` en rollback de abonos | `src/pedidos-2.ts` |
| B7 | **Precio libre inválido** — `parseFloat("$500")` → NaN → toast `⚠️ Precio inválido` + limpia el campo | `src/pedidos-1.ts` |
| B9 | **`_esDomicilio` sin asumir vacío** — ya no requiere dirección cuando `tipoEntrega` está vacío; solo si contiene "domicilio/envio/envío" explícitamente | `src/pedidos-2.ts` |

#### ✅ Performance aplicada

| # | Fix | Archivos |
|---|-----|---------|
| P2 | **`_stockCache` pre-calculado** — `renderInventoryTable()` crea un `Map<id→stock>` antes del loop; elimina llamadas redundantes a `getStockEfectivo()` | `src/inventory-5.ts` |
| P6 | **SW v2.3.4 install 2 fases** — assets críticos con `addAll()` (falla = install falla), secundarios con `Promise.allSettled()` (un 404 ya no mata el install) | `sw.js` |
| P7 | **`chart.update('none')`** — `initComparativaMeses()` e `initComparativaAnio()` usan update en-place en visitas posteriores; elimina destroy+new y ~180ms de flicker | `src/reportes.ts` |

#### ✅ UX aplicada

| # | Fix | Archivos |
|---|-----|---------|
| UX1 | **Loading en kanban drop** — card se pone `opacity:0.45 + pointerEvents:none` mientras procesa el cambio de estado | `src/pedidos-2.ts` |
| UX5 | **Badge stock en sidebar** — `sidebarBadgeInventory` se actualiza con `lowStock + outOfStock` en cada `_updateDashboardImpl()` | `src/dashboard.ts` |
| UX6 | **Botón "?" de shortcuts** — visible junto al perfil en sidebar inferior; abre el overlay de atajos de teclado | `index.html` |
| UX8 | **Hint swipe kanban mobile** — "← Desliza las tarjetas →" aparece 1 sola vez (flag en localStorage) | `src/pedidos-2.ts` |
| UX10 | **Tabla año a año** — debajo del chart: mes, $año_actual, $año_anterior, variación %; fila de total | `src/reportes.ts`, `index.html` |
| UX16/17 | **Mobile topbar mejorado** — botones 44×44px min-tap-target, `aria-label`, `transition:transform` en hamburguesa | `index.html` |
| UX19 | **Meta mensual protegida** — `min="1"` + `Math.max(1,…)` evita meta en cero o negativa | `index.html` |

#### ℹ️ Ya existían (confirmados, no requerían cambio)

- **UX3** Confirmar eliminar cliente — `showConfirm()` ya estaba
- **UX14** Copy toast — clipboard handlers ya mostraban toast
- **UX18** cursor:pointer en KPIs — CSS `[onclick], .clickable { cursor:pointer }` ya lo cubría
- **UX20** CxC mora coloring — `bg-red-50/orange-50/blue-50` ya en `balance.ts`
- **B5** División por cero en márgenes — ya guardado por `filter(price > 0)` en línea 470

### Sesión 7 (2 junio 2026) — N2/N3/N6/N9/S2

| # | Mejora | Archivos |
|---|--------|---------|
| N2 | **Swipe kanban mobile** — touch delegado en `#vistaKanban`; swipe derecha avanza estado, izquierda retrocede; cancela si vertical; añadido `data-id` a cards | `src/pedidos-1.ts`, `src/pedidos-2.ts` |
| N3 | **QR/barcode scan inventario** — botón "Escanear" junto a buscador; usa `BarcodeDetector` API; fallback entrada manual; modal `qrScannerModal` | `src/inventory-1.ts`, `index.html` |
| N6 | **Comparativa año a año** — gráfica de líneas 12 meses actual vs anterior; badge variación %; `initComparativaAnio()` en `initReports()` | `src/reportes.ts`, `index.html` |
| N9 | **Segmentación RFM** — scoring quintiles R/F/M; 6 segmentos (Campeones/Leales/Prometedores/En riesgo/Hibernando/Ocasionales); click → tabla detalle | `src/clientes.ts`, `index.html` |
| S2 | **RLS verificado** — `rowsecurity=true` confirmado en `store` y todas las tablas vía Supabase MCP | — |

### Sesión 6 (2 junio 2026) — Errores consola + Kanban + nginx PWA fix

**Errores de consola corregidos (4/4):**

| Error | Causa raíz | Fix aplicado | Archivo |
|-------|-----------|-------------|---------|
| `sw.js TypeError: chrome-extension://` | SW intentaba cachear URLs no-http | Guard `if (!url.startsWith("http")) return` al inicio del fetch listener | `sw.js` |
| `manifest.json 401 Unauthorized` | nginx host-level aplica `auth_basic` a TODOS los paths | Nuevo `location ~ ^/(manifest\.json\|sw\.js\|logo\.png)$` con `auth_basic off` en `/etc/nginx/sites-available/pos.manekistore.com.mx` + `nginx -t && systemctl reload nginx` | nginx VPS |
| CSP bloquea `api.open-meteo.com` | Widget de clima no estaba en `connect-src` | Agregado `https://api.open-meteo.com` al CSP meta tag | `index.html` |
| `apple-mobile-web-app-capable` deprecated | Solo existía el meta tag de Apple | Agregado `<meta name="mobile-web-app-capable" content="yes">` (estándar W3C) | `index.html` |

**Pendientes de lista aplicados:**

| # | Fix | Archivos |
|---|-----|----------|
| U3 | **Kanban paginación** — máx 10 cards por columna; botón "↓ Ver X más" expande la columna. `_kanbanExpandidos` Set reset al cambiar filtro de urgencia. `window._kanbanVerMas(col)` expuesto globalmente | `src/pedidos-1.ts` |
| U4 | **Swipe sidebar** — ya estaba implementado desde S3 (`touchstart < 30px + dx > 60 → openSidebar`) | — |
| U2 | **Labels mobile nav** — ya estaban implementados | — |
| N5 | **CSV export balance** — ya estaba implementado (`exportarBalanceMesCSV`) | — |
| N8 | **Undo visual** — ya estaba implementado (`mkMostrarUndoHint` + Ctrl+Z + toast) | — |

---

## ✅ Sesión 14 (3 junio 2026) — Auditoría de Diseño/UX APLICADA

> Se aplicaron las 6 oportunidades de la auditoría de Sesión 13. Implementación con
> **parches pequeños** y **wrappers post-render** para no tocar los renderizadores complejos.

| Op | Qué se aplicó | Archivos |
|----|---------------|---------|
| **1** | Clases utilitarias premium `.mk-btn-primary`, `.mk-toolbar-btn`, `.mk-chip` (anti-deriva de tokens). Empty-state de inventario migrado a 1 primario + 1 ghost (quitado gradiente inline). | `maneki-premium.css`, `src/inventory-5.ts` |
| **2** | `font-variant-numeric: tabular-nums` global en celdas numéricas + `.text-right`. **Toggle densidad Cómodo/Compacto** (`body.mk-dense`) persistido en `localStorage` (`mk_density`), control segmentado inyectado en toolbar de inventario. **Fila resumen sticky** en inventario: valor de inventario + N productos + Y bajo stock. | `maneki-premium.css`, `src/ui-extras.ts`, `src/inventory-5.ts` |
| **3** | Toolbars con disciplina de color (botón primario lleno + resto neutros ghost). Toolbar de inventario ya era neutro de sesiones previas; KPIs con accent-color son intencionales y se conservan. | `maneki-premium.css` |
| **4** | **Contador de resultados** "Mostrando X de Y" + **chips de filtro activo removibles** + "Limpiar todo" en inventario. **Segmented control** (pills) reemplaza el `<select>` de tipo (Todos/Productos/Materia Prima), conservando el select oculto como fuente de verdad. | `maneki-premium.css`, `src/inventory-5.ts` |
| **5** | **Command palette Ctrl+K** (`mkOpenCommandPalette`): navega y *ejecuta* (Nuevo pedido, Ir a sección, Exportar, densidad, modo oscuro…) con teclado. Hint `⌘K` clickeable en buscador global. **Totales en vivo por columna kanban** ($ total + saldo pendiente). Barra flotante de selección ya existía (`invBulkBar`). | `maneki-premium.css`, `src/ui-extras.ts`, `src/pedidos-1.ts`, `index.html` |
| **6** | `aria-live="polite"` + `aria-atomic` en contenedor de toasts. Sombras `.shadow-sm` migradas a token `--sh-sm` (tinte morado). Alertas de dashboard ya se ocultan cuando no hay urgencias (`#alertaEntregas` toggle `.visible`). | `maneki-premium.css`, `src/ui-extras.ts` |

### Convenciones nuevas (Sesión 14)

```
// DENSIDAD: localStorage 'mk_density' = 'compact' | 'comfortable'
//   window.mkToggleDensidad(modo?), window.mkAplicarDensidad(), window.mkRenderDensityToggle()
//   CSS: body.mk-dense compacta padding de tablas

// COMMAND PALETTE: window.mkOpenCommandPalette() — Ctrl+K rebind en ui-extras.ts
//   Comandos definidos en _mkBuildCommands(); cada acción usa _mkCall(fn) defensivo

// INVENTARIO: renderInventoryTable() está ENVUELTO (wrapper post-render en inventory-5.ts)
//   que inyecta contador/chips/segmented/densidad/resumen. NO re-envolver.
//   Helpers globales: _mkInvSetTipo, _mkInvClearOne, _mkInvClearFilters

// KANBAN: elemento kTotal-<col> inyectado antes de cada columna kCol-<col>

// Clases utilitarias: .mk-btn-primary / .mk-toolbar-btn / .mk-chip / .mk-segmented /
//   .mk-filter-chip / .mk-result-count / .mk-table-summary / .mk-cmdk / .mk-kbd-hint
```

### Pendientes menores — APLICADOS (continuación Sesión 14)

- ✅ **Contador + chips de filtro en Clientes** — `_mkCliRenderInfo()` vía MutationObserver sobre `#clientsTable` (cubre filtro por tag y búsqueda con debounce). Chips: Buscar / Filtro de actividad. Helpers `_mkCliClearSearch`, `_mkCliClearTag`. Columna "Total Compras" alineada a la derecha. → `src/clientes.ts`
- ✅ **Contador + chips de filtro en Historial de pedidos** — bloque inyectado en `renderHistorialPedidos()` tras filtrar. Chips: Buscar / Mes / Estado / Desde / Hasta. Helper global `_mkHistClear(field)`. → `src/pedidos-2.ts`
- ✅ **Alineación a la derecha por columna en inventario** — columnas de dinero (Precio, Precio/pza, Costo, Costo/uso) con `text-right` en `<th>` (vía `align:'right'` en `buildSection`) y en `<td>` de los 4 renderizadores. Stock/Margen se conservan como indicadores visuales (pills/barras). → `src/inventory-5.ts`

### Pendientes que se decidió NO aplicar (justificado)

- **Barra "calma"** en dashboard cuando no hay alertas: el banner `#alertaEntregas` ya se oculta solo; añadir una barra permanente metería ruido visual.
- **Consolidar Reportes/Herramientas en menú `⋯ Más`**: los toolbars actuales ya son neutros y no tienen ese exceso de botones.

---

## 🎨 Auditoría de Diseño/UX — detalle original (Sesión 13)

> Referencia. La mayoría aplicado en Sesión 14 (ver tabla arriba).

### Oportunidad 1 — Disciplina del sistema de diseño (estructural)
El `index.html` hardcodea colores y gradientes inline en casi todos lados en vez de usar los tokens de `maneki-premium.css`. Ejemplo: `style="background:linear-gradient(135deg,#7c3aed,#a855f7)"` repetido con variaciones en cada botón de toolbar.
- Crear clases utilitarias premium: `.mk-btn-primary`, `.mk-btn-warning`, `.mk-chip`, `.mk-toolbar-btn`
- Reemplazar todos los `style="background:linear-gradient(...)"` inline de botones/headers por esas clases
- Resultado: consistencia perfecta, cambiar marca = cambiar 1 token

### Oportunidad 2 — Legibilidad de datos en tablas (ALTO IMPACTO, bajo esfuerzo)
La tabla de inventario tiene 11 columnas; los números están alineados a la izquierda sin tipografía tabular.
- **`font-variant-numeric: tabular-nums`** en `.mk-kpi-value` y todas las celdas de cifras `$` — los dígitos se alinean por unidad/decena y el ojo los compara instantáneamente
- **Alinear Precio/Stock/Margen/Total a la DERECHA** en todas las tablas (`text-right` en `<th>` y `<td>`)
- **Toggle densidad Cómodo / Compacto** — en compacto ver ~2× más filas sin scroll. Guardar preferencia en `localStorage`
- **Agrupar columnas:** SKU como subtítulo gris bajo el nombre del producto; Categoría como chip pequeño → de 11 a ~8 columnas
- **Fila de resumen sticky al pie de tabla:** "Valor total: $X · N productos · Y bajo stock"

### Oportunidad 3 — Disciplina de color en toolbars (look premium)
En inventario hay 4 botones de gradientes distintos compitiendo. Un producto de alta gama usa el color solo para la acción principal.
- **1 solo botón primario lleno de color:** `+ Agregar`
- **Resto como botones ghost neutros** (borde sutil, ícono, texto gris — color solo en hover)
- **Consolidar "Reportes" y "Herramientas" en un solo menú `⋯ Más`**
- Aplicar el mismo patrón en Balance, Clientes y Pedidos

### Oportunidad 4 — Filtros con feedback visual
Los filtros no muestran qué está activo ni cuántos resultados hay.
- **Contador de resultados:** "Mostrando 23 de 187 productos" junto al buscador (en inventario, clientes, historial)
- **Chips de filtro activo removibles:** al filtrar por tag/proveedor, aparece chip "Proveedor: ABC ✕" + botón "Limpiar todo"
- **Tipo como segmented control (pills):** reemplazar el `<select>` "Todos / Productos / Materia Prima" por toggle de 3 botones visuales. Mismo patrón en Balance (ingresos/egresos)

### Oportunidad 5 — Velocidad de trabajo (nice-to-have)
- **Command palette (Ctrl+K):** elevar `busquedaGlobal()` existente a paleta de comandos que además *ejecuta*: "Nuevo pedido", "Ir a Balance", "Exportar inventario". Sin mouse.
- **Barra de acción flotante por selección:** cuando hay items seleccionados en inventario (`Ctrl+A` ya existe), que flote barra inferior: "3 seleccionados · Cambiar precio · Etiquetas · Eliminar"
- **Totales en vivo por columna kanban:** mostrar `$` total y conteo de pedidos en el sub-header de cada columna
- **Hints de atajo visibles:** añadir `⌘K` como placeholder en el buscador global; `data-tip="Ctrl+K"` en el botón de búsqueda

### Oportunidad 6 — Micro-pulido de alta gama
- **Estados vacíos con acción primaria:** cada tabla vacía debe ofrecer el botón de acción ("Aún no hay productos — + Agregar el primero"). Ya existe `.mk-empty`, faltan acciones en algunas secciones
- **Alertas del dashboard colapsadas:** las 2 tarjetas de alerta (entregas urgentes / sin movimiento) compiten con los KPIs. Colapsarlas a una sola barra discreta cuando no hay urgencias; se expanden solo cuando hay alertas reales
- **Migrar sombras Tailwind a tokens premium:** muchas tarjetas usan `shadow-sm` en vez de `--sh-md/--sh-lg` con tinte morado. Resultado: profundidad premium uniforme en toda la app
- **`aria-live="polite"`** en el contenedor de toasts

### Prioridad de aplicación

| Prio | Mejora | Impacto | Esfuerzo |
|------|--------|---------|----------|
| 🥇 | Tipografía tabular + alineación derecha en tablas | Altísimo | Bajo |
| 🥇 | Toggle densidad Cómodo/Compacto | Alto | Bajo |
| 🥈 | Contador de resultados + chips de filtro activo | Alto | Medio |
| 🥈 | Disciplina de color en toolbars | Alto (look) | Medio |
| 🥉 | Command palette Ctrl+K | Alto (wow factor) | Medio-Alto |
| 🥉 | Fila de totales sticky en tablas | Medio | Medio |
| ⭐ | Clases utilitarias anti-deriva de tokens | Estructural | Medio |
| ⭐ | Micro-pulido (empty states, alertas, sombras, aria) | Medio | Bajo |

---

## ✅ Sesión 24 (12 junio 2026) — Mejoras UI/UX D1-D4, commit `c7c7e95`

| Cambio | Fix | Archivos |
|--------|-----|---------|
| D1 | Token de oro #C5A572 → #C5973B (--mk-g500 canónico) en 24 archivos (22 src/ + css/styles.css + index.html) | 22 src/*.ts, css/styles.css, index.html |
| D2 | Botones de toolbar en inventory-5: `style="background:linear-gradient(...)"` → `class="mk-btn-primary"` | src/inventory-5.ts |
| D3a | `invBulkEliminar()`: 2× `confirm()` → `await showConfirm()` con fallback | src/inventory-5.ts |
| D3b | `deleteQuote()` else-branch: `confirm()` eliminado (path principal ya usaba showConfirm) | src/pedidos-1-extra.ts |
| D3c | `backup.ts`: `alert()` → `manekiToastExport()` sin fallback nativo | src/backup.ts |
| D3d | `prompt()` lead time → `_mkEditLeadTime(id, dias)`: mini-modal inline sin bloqueante | src/inventory-4.ts |
| D4 | 7 section-headers: `&#NNNNN;` emoji → `<i class="fas fa-*">` del sistema SVG local | index.html |

### Mapeo D4 (emojis → íconos)
| Sección | Emoji antes | Ícono FA |
|---------|-------------|---------|
| Cotizaciones | &#128203; (📋) | fa-clipboard-list |
| Inventario | &#128230; (📦) | fa-box |
| Clientes | &#128150; (💖) | fa-users |
| Categorías | &#127991; (🏷) | fa-tag |
| Equipos/ROI | &#9881; (⚙) | fa-tools |
| Pedidos por Encargo | &#128236; (📬) | fa-shopping-bag |
| Configuración | &#9881; (⚙) | fa-cog |

## ✅ Sesión 26 (13 junio 2026) — Auditoría profunda + mejoras UI/UX (v2.6.2)

> Veredicto: la capa de datos/lógica/Supabase quedó SÓLIDA tras S24–S25 (fechas guardadas,
> JSON.parse protegidos, descuento con rollback, memoización correcta). Solo apareció 1 bug
> ghost nuevo (misma clase F1) + ajustes menores. El grueso fue UI/UX (lo nuevo del pedido).

| ID | Sev/Tipo | Fix | Archivos |
|----|----------|-----|---------|
| B5 | 🟠 Bug | `eliminarVentaHistorial` filtraba salesHistory y pedidosFinalizados localmente pero `saveSalesHistory/savePedidosFinalizados` son upsert-only → reaparecían al recargar. Ahora emite `deleteSalesHistoryEntry(id)` + `deletePedidoFinalizado(id)`. | `reportes.ts` |
| B1 | 🟡 Bug | `JSON.parse(mk_clientes_sort)` a nivel de módulo sin try/catch abortaba `clientes.bundle.js` si el valor estaba corrupto. | `clientes.ts` |
| B3 | 🔵 Bug | Cache de ventas: resetear `_allVentasCache` Y `_allVentasCacheKey`. | `reportes.ts` |
| U1 | 💵 UI | Dinero unificado vía `fmtMoney()` (entero sin decimales, fracción con 2). Antes: clientes $1,500 vs Me deben $1,500.00. | `clientes.ts`, `dashboard.ts`, `types/maneki.d.ts` |
| U2 | 🎨 UI | 4 botones de acción → `.mk-btn-primary` (hover/active premium); gradiente oro inline → `var(--mk-gold-500/400)` en 4 archivos. Print CSS y tints decorativos intactos. | `inventory-5.ts`, `inventory-1/2-pt/2-pack.ts`, `init.ts` |
| U3 | ⛔ UX | Pedidos vencidos (entrega < hoy, no finalizado/cancelado) con `border-left:3px #dc2626` en ambas vistas + badge ⛔ en la compacta (antes sin ningún indicador). | `pedidos-1-views.ts` |
| U4 | 📲 NTH | Desglose "Me deben": link WhatsApp por cliente (recordatorio de saldo con teléfono del pedido) + botón "Copiar desglose" (clipboard con fallback execCommand). | `dashboard.ts` |

### Nota: la clase de bug F1/B5 sigue viva — candidata a regla de lint

`eliminarVentaHistorial` confirma que el patrón "quitar de array local sin DELETE en BD" reaparece
en flujos nuevos. Ver [[project_upsert_delete_incomes]]. Considerar una regla de footgun que detecte
`Array = Array.filter`/`.splice` sobre tablas relacionales sin un `delete*` cercano.

### Estado de `npm run build:check` (tsc strict)

Tiene ~25 errores **preexistentes** (require en reportes, `.message` sobre unknown, tipos en ui-extras/
whatsapp). NO bloquean el deploy (esbuild transpila sin type-check). Limpieza pendiente como deuda futura.

---

## ✅ Sesión 25 (13 junio 2026) — Auditoría profunda: integridad Supabase + rendimiento (v2.6.1)

> Auditoría enfocada en el patrón "upsert no elimina" y rendimiento de realtime.
> Hallazgo central: el fix C1 de S24 tenía una fuga de persistencia que lo revertía al recargar.

| ID | Severidad | Fix | Archivos |
|----|-----------|-----|---------|
| F1 | 🔴 Crítico | Ingresos/ventas fantasma: `reactivarPedido` y `eliminarPedido` quitaban incomes/salesHistory del array local pero `saveIncomes/saveSalesHistory` son **upsert-only** → reaparecían al recargar y descuadraban el balance (anulaba C1). Se añadieron `deleteIncomesByFolio(folio, pedidoId)`, `deleteIncomeFromDB(id)`, `deleteExpenseFromDB(id)` en db.ts y se llaman tras el filtro local. | `db.ts`, `pedidos-2.ts`, `pedidos-1-extra.ts` |
| F2 | 🟠 Medio | `reactivarPedido` solo limpiaba salesHistory `type:'pedido'`; el `type:'abono'` (cobro al entregar) quedaba como venta fantasma. Ahora limpia ambos + `deleteSalesHistoryEntry` por cada id. | `pedidos-2.ts` |
| F3 | 🟠 Medio | Handlers RT llamaban al símbolo bare `renderBalance()` (sin debounce) en vez de `window.renderBalance` (debounced 200ms) → hasta 4 re-renders de Balance por flush consolidado. | `db.ts` |
| F4 | 🟡 Bajo | `saveExpenses` enviaba `id: undefined` para gastos sin id (a diferencia de `saveIncomes` que genera `mkId()`). Ahora genera id antes del upsert. | `db.ts` |
| F5 | 🟡 Bajo | `saveIncomes/saveExpenses/saveClients/saveSalesHistory` ahora `return` su Promise interna → awaitables. | `db.ts` |

### Convención reforzada (S25)

```javascript
// PATRÓN UPSERT-DELETE (extiende S18 a incomes/expenses):
// Al quitar un income/expense/sale del array local SIEMPRE emitir el DELETE en BD:
//   deleteIncomesByFolio(folio, pedidoId)  → incomes ligados a un pedido (abono/cobro)
//   deleteIncomeFromDB(id) / deleteExpenseFromDB(id) → fila individual
//   deleteSalesHistoryEntry(id)            → sales_history
// saveIncomes()/saveSalesHistory() son upsert-only — NUNCA borran filas.

// RT RENDER: en db.ts usar window.renderBalance() (debounced), NO el bare renderBalance().
```

### Tests S25 (65 total, +2 vs S24)

- `limpiarAlReactivar` ahora modela F2 (limpia 'pedido' Y 'abono') y devuelve `dbDeletes` (plan de borrado en BD).
- Nuevos: `F1-S25 dbDeletes.incomesByFolio` incluye folio cuando se quitan incomes; es `null` si no; `F2-S25` ambos ids (pedido+abono) programados para borrado.

---

## ✅ Sesión 24 — Parte 2 (13 junio 2026) — Bugs S24 (C1–C3, A1–A5, B1–B3) + Guardrail de build + 63 tests, commits `befa834`…`d7c163d`

### Bugs críticos (Agentes 1+2+3 S24)

| ID | Fix | Archivos |
|----|-----|---------|
| C1 | `reactivarPedido` limpia: salesHistory (type:'pedido'), incomes (folioOrigen o cobro_entrega), totalPurchases del cliente | `src/pedidos-2.ts` |
| C2 | Race condition en descuento de inventario: `await` correcto, `inventarioDescontado` solo `true` si guardado exitoso | `src/pedidos-2.ts` |
| C3 | **Balance descuadraba** con pedidos que tenían abono/anticipo — eliminado filtro `foliosEnIncomes` de `totalPedidosFin`; ahora suma TODO `pedidosFinalizados` sin filtrar | `src/balance.ts` |
| A1 | id de salesHistory en lotes usa `mkId()` en vez de `pedidoFin.id` (evita colisión upsert) | `src/pedidos-2.ts` |
| A2 | UTC shift en vista Carga Semanal — fechas locales con `getFullYear/getMonth/getDate` | `src/pedidos-2.ts` |
| A4 | Bienvenida WA usa `p.cliente||p.customer` y `productosInventario||productos` (campos correctos) | `src/pedidos-3.ts` |
| A5 | Valuación e inventario por categoría usan `getStockEfectivo()` en vez de `p.stock` crudo | `src/inventory-5.ts` |
| B3 | Nombre de archivo CSV de reabastecimiento usa fecha local | `src/inventory-5.ts` |
| B1 | Gráficas de reportes usan `chart.update('none')` en vez de `destroy()+new Chart()` | `src/reportes.ts` |

### C3 — lógica de balance corregida

```typescript
// ANTES (bug): excluía pedidos que tenían income con folioOrigen (abono) → descuadre
const foliosEnIncomes = new Set(listaIncomes.map(i => i.folio || i.folioOrigen).filter(Boolean));
const totalPedidosFin = pedidosFinalizados.filter(p => !foliosEnIncomes.has(p.folio)).reduce(...)

// DESPUÉS (fix): el pedido siempre cuenta completo; el income manual excluye el abono vía folioOrigen
const totalIncomeManual = listaIncomes.filter(i => !i.fromPOS && !i.folioOrigen).reduce(...)
const totalPedidosFin   = pedidosFinalizados.reduce((sum, p) => sum + Number(p.total||0), 0)
```

### Guardrail anti-footguns (`scripts/lint-footguns.js`) — Step 0b del build

Corre automáticamente en `node scripts/build.js`. Si detecta una regla, **aborta el build** con mensaje descriptivo.

| Regla | Patrón detectado | Escape correcto |
|-------|-----------------|----------------|
| `fecha-utc` | `toISOString().split` | `_fechaHoy()` |
| `uuid-directo` | `crypto.randomUUID` fuera de `db.ts` | `mkId()` |
| `dialogo-nativo` | `confirm(` / `alert(` / `prompt(` sin `showConfirm`/`showPrompt`/`window.` cerca | `showConfirm()` / `showPrompt()` |
| `nombre-global-prohibido` | nombre `_fechaLocal` en cualquier archivo | renombrar a `_fechaStr` u otro |
| `esbuild-iife` | `--format=iife` o `--global-name` en scripts | nunca usar en este proyecto |

- **Salta comentarios** (`//`, `*`, `/*`)
- **Ventana de contexto ±1 línea** para fallbacks multilinea guardados
- **Escape hatch:** añadir `// footgun-ok: <razón>` al final de la línea

El linter detectó 2 bugs reales que el audit S24 había pasado por alto:
- `csp-delegate.ts:283` — `prompt()` nativo → migrado a `showPrompt()` con fallback
- `pedidos-2.ts:853` — nombre `_fechaLocal` → renombrado a `_fechaStr` (replace_all en ese módulo)

### `showPrompt(msg, defaultValue, title)` — nuevo helper en `ui-extras.ts`

Equivalente modal de `prompt()` nativo. Retorna `Promise<string|null>` (null si cancelado).

```typescript
// ANTES (prohibido por linter)
const nombre = prompt('¿Nombre del filtro?');

// DESPUÉS
const nombre = await showPrompt('¿Cómo quieres llamar este filtro?', '', 'Guardar filtro');
if (!nombre || !nombre.trim()) return;
```

### Suite de regresión — 63 tests en `tests/logic.test.ts` (Step 0a del build)

Corre antes de compilar con `npx vitest run`. Si falla, el build aborta.

| Función probada | Tests | Qué cubre |
|-----------------|-------|----------|
| `calcSaldoPendiente` | ~8 | Saldo desde `pagos[]`, anticipo, casos edge |
| `getStockEfectivo` | ~7 | Variantes, sin variantes, stock 0 |
| `calcMarginPct` | ~5 | Márgenes, división por cero |
| `_descontarEmpaquesRollback` | ~6 | Rollback de empaques si falla save |
| `calcularDisponibilidadDesdeMP` | ~6 | Disponibilidad desde materias primas |
| **`calcBalanceTotals`** | **9** | **C3 regression: pedido con abono no desaparece ni se duplica** |
| **`normalizarRestaPedido`** | **7** | `p.pagos[]` como fuente de verdad de anticipo/resta |
| **`descontarVariantePT`** | **7** | Descuento de variante exacta vs mayor disponible |
| **`limpiarAlReactivar`** | **8** | **C1 regression: reactivar limpia salesHistory+incomes+totalPurchases** |

El test C3 clave:
```typescript
it('C3: pedido finalizado CON abono NO desaparece del balance', () => {
  const t = calcBalanceTotals({
    pedidosFinalizados: [{ folio: 'PE-077', total: 1500 }],
    incomes: [{ amount: 600, folioOrigen: 'PE-077', concept: 'Abono pedido PE-077' }],
  });
  expect(t.totalPedidosFin).toBe(1500);   // pedido completo
  expect(t.totalIncomeManual).toBe(0);     // abono excluido de income manual
  expect(t.totalIncome).toBe(1500);        // sin doble conteo
});
```

### Pipeline de build actualizado

```
node scripts/build.js
├── Step 0a: npx vitest run --reporter=verbose   ← 63 tests; falla → abort
├── Step 0b: require('./lint-footguns.js')        ← 5 reglas; falla → abort
├── Step 1: esbuild src/*.ts → js/*.js (minify)
├── Step 2: concat → 8 bundles (core/inventario/pedidos/balance/reportes/clientes/envios/backup)
├── Step 3: swap-bundles.js (index.html usa bundles en producción)
└── Step 4: hash-sw.js (SHA-256 de assets → bumpa sw.js cache automáticamente)
```

---

## ✅ Sesión 23 (12 junio 2026) — Bugfixes audit S23, commits `0ad629e` `083809d`

| Bug | Fix | Archivos |
|-----|-----|---------|
| BUG-1 | 10 íconos FA faltantes (`fa-box`, `fa-truck`, `fa-camera`, `fa-palette`, `fa-industry`, `fa-file-import`, `fa-file-download`, `fa-clipboard-check`, `fa-chart-pie`, `fa-robot`) añadidos al diccionario D de `icons.ts` | `src/icons.ts` |
| BUG-2 | `limpiarMovimientosInventario()` usaba `confirm()` nativo y solo limpiaba el blob; ahora usa `showConfirm()` + también borra de `stock_movements` en Supabase | `src/inventory-5.ts` |
| BUG-2b | `clearAllData()` en ui-extras.ts también limpia `stock_movements` relacional en el Promise.all | `src/ui-extras.ts` |
| BUG-4 | Eliminado sistema dual `movimientosStock` en `confirmarAjusteStock()` — el canónico `registrarMovimiento()` ya hacía el trabajo | `src/inventory-4.ts` |
| BUG-5 | Campo costo + wrap de costo ponderado se limpian al abrir modal para nuevo producto en `ajustarStock()` | `src/inventory-4.ts` |
| BUG-6 | Reabastecimiento con promedio ponderado ahora hace push a `p.historialCostos` (antes solo actualizaba `p.cost`) | `src/inventory-4.ts` |
| BUG-9 | Movimientos con producto eliminado muestran `(producto eliminado)` en lugar de string vacío | `src/inventory-5.ts` |
| DB | Índice `idx_stock_movements_producto` creado en Supabase sobre `stock_movements(producto_id)` | Supabase MCP |
| UI | Emojis en 7 títulos de charts del dashboard → `<i class="fas ...">` con FA icons | `index.html` |
| UI | Botón "📋 WA" → `<i class="fas fa-whatsapp">` | `index.html` |
| UI | Nav mobile (5 botones) → FA icons con `font-size:20px` + `aria-label` | `index.html` |

### ⚠️ Deuda técnica registrada (no aplicada)

| # | Motivo | Nota |
|---|--------|------|
| BUG-10 | RT subscription para `stock_movements` | Requiere transformer + anti-echo + wiring; logging table — no crítico |
| BUG-11 | 1 producto sin costo en BD | Data issue, corregir manualmente en la app |
| activity_log UI | Tabla existe pero tiene 0 filas | No es accionable hasta que el código la popule |
| Push notifications | vapid_keys en Supabase | Requiere Edge Function + pg_cron — muy complejo |
| Reporte mensual PDF | jsPDF o similar | Requiere lib externa |

---

## ✅ Sesión 21 (12 junio 2026) — 14 features del audit Fable 5 (commit `58c8f22`)

> Sonnet/Fable aplicaron todas las mejoras UI/UX y nice-to-haves solicitadas.
> Migración Supabase: columna `ocasion` añadida a `orders` y `orders_finalizados`.

| Feature | Archivo(s) | Tipo |
|---------|-----------|------|
| Barra progreso pago en kanban card | `pedidos-1-views.ts` | UI |
| Badge de ocasión en kanban card | `pedidos-1-views.ts` | UI |
| Recordatorio "Retirar >3 días" + botón WA | `pedidos-1-views.ts` | UI |
| Campo "Ocasión" en modal de pedido (select dinámico) | `pedidos-1-modal.ts` | Feature |
| Ocasión persistida en Supabase (orders + orders_finalizados) | `db.ts` + Supabase MCP | BD |
| Cobro al entregar al finalizar pedido | `pedidos-2.ts` | Feature |
| Imprimir Orden de Producción del día | `pedidos-3.ts`, `index.html` | Feature |
| Ctrl+K busca pedidos activos y finalizados recientes | `ui-extras.ts` | UX |
| mkSaveIndicator conectado a savePedidos + saveProducts | `db.ts` | UX |
| Conteo físico de inventario (modal + bulk adjust) | `inventory-5.ts` | Feature |
| Lista de reabastecimiento por proveedor (WA + CSV) | `inventory-5.ts` | Feature |
| Donut chart valor por categoría | `inventory-5.ts` | Feature |
| Stock mínimo sugerido automático (60d consumo) | `inventory-5.ts` | Feature |
| Botones de herramientas en toolbar de inventario | `inventory-5.ts` | UI |

### ⚠️ Patrones usados (Sesión 21)

```javascript
// CONTEO FÍSICO: abrirConteoFisico() → modal con inputs por producto → _mkAplicarConteoFisico()
//   Llama registrarMovimiento({...}) para dejar traza + saveProducts()

// COBRO AL ENTREGAR: en setPedidoStatus('finalizado'), si calcSaldoPendiente > 0:
//   → showConfirm → push a pagos[], incomes[], salesHistory (type:'abono') → saveIncomes()
//   → al calcular _saldoFinal en el step siguiente, ya es 0 → no duplica salesHistory

// OCASIÓN: campo dinámico inyectado en openPedidoModal (como notasInternas)
//   Guardado en pedido.ocasion, columna ocasion TEXT en orders/orders_finalizados

// ORDEN PRODUCCIÓN: imprimirOrdenProduccion() filtra status 'pago','produccion','salida'
//   Genera HTML + window.open + setTimeout 600ms para print()

// STOCK MÍNIMO: sugerirStockMinimo() lee pedidosFinalizados últimos 60d
//   Fórmula: ceil(consumo60d / 60 * 14) → 14 días de cobertura
```

---

## ✅ Sesión 20 (12 junio 2026) — Auditoría Fable 5: 11 bugs, 3 commits

> Fable 5 auditó toda la app buscando bugs del patrón "CDN spinner" y "stale echo". Sonnet aplicó los 11 hallazgos.

| Commit | Bugs | Fixes |
|--------|------|-------|
| `fb48531` | 3 | Empaques rollback muerto (try/catch síncrono sobre async → `.catch()`); `_rtPending` era object (sobrescribía eventos → array accumulator); Cashflow chart en blanco (re-render en `.then()` de Chart.js CDN eager load) |
| `a6c2e15` | 6 | Cancel pedido: 4 sub-bugs (stock empaques, `saveProducts`, `deletePedidoActivo`, ROI); Ghost income: filtrar por folio (salesHistory usa `mkId()` ≠ `pedido.id`); Guard anti-eco en `products`; Multi-device sync (clients/incomes/expenses en RT + `_updatedAt`); `sales_history` sin `updated_at` en upsert Supabase |
| `b8fb78d` | 2 | Folios atómicos: RPC `maneki_next_folio` con `SELECT...FOR UPDATE` en Postgres (migración aplicada via Supabase MCP); `savePedidos` mutex: `_savePedidosQueue` Promise chain serializa saves concurrentes |

### ⚠️ Patrones nuevos (Sesión 20)

```javascript
// GUARD ANTI-ECO: cada save stampea _updatedAt = new Date().toISOString() en todos los ítems
// El RT handler descarta el evento si transformed._updatedAt <= localReg._updatedAt
// Tablas: products, pedidos, pedidosFinalizados, salesHistory, clients, incomes, expenses

// MUTEX SAVES: let _savePedidosQueue: Promise<void> = Promise.resolve()
// savePedidos() encadena: _savePedidosQueue = _savePedidosQueue.then(async () => { ... })
// El segundo save espera al primero y lee el estado actual de pedidos[] (más fresco)

// FOLIOS ATÓMICOS: getNextFolio(tipo) llama db.rpc('maneki_next_folio', { p_tipo: tipo })
// Fallback offline: contador local en _localFolioCounters si RPC falla
// La función Postgres usa SELECT...FOR UPDATE — bloqueo a nivel fila, imposible folio duplicado

// _rtPending: Record<string, any[]> — array, no sobrescribe; flush procesa todos en orden
// _rtTablaAKey cubre: products, orders, orders_finalizados, sales_history, clients, incomes, expenses
```

---

## ✅ Sesión 18 (10 junio 2026) — Integridad de datos + auditoría profunda de bugs — Integridad de datos + auditoría profunda de bugs

> Sesión dedicada a corregir el patrón "upsert no elimina" en Supabase y a una
> auditoría multi-ángulo (7 agentes) sobre todo el programa. 7 commits desplegados.

### Bugs críticos de integridad de datos (patrón: upsert sin DELETE)

| Commit | Bug | Fix |
|--------|-----|-----|
| `e651dcf` | **Pedidos finalizados reaparecían al recargar** — `savePedidos()` usa upsert, que nunca borra la fila de `orders` | Nuevas funciones `deletePedidoActivo(id)` / `deletePedidoFinalizado(id)` en db.ts; llamadas tras finalizar (individual + lote) y reactivar |
| `635a3d9` | **Seguían reapareciendo (PE-0061)** — causa raíz: `_loadFromTable` cargaba TODO de `orders` sin filtro de status | Propiedad `filter` en `_RELATIONAL_TABLES.pedidos`: excluye `finalizado/completado/entregado` al cargar (también en `_loadMoreFromTable`) |
| `ae40409` | **Reportes inflados ~$23,411** — entradas legacy `type='venta'` en salesHistory se contaban ADEMÁS del mismo pedido vía `pfComoVentas` | Paso 1b en `_getAllVentas()`: marca entradas `type='venta'` cuyo folio existe en pedidosFinalizados como legacy → se excluyen de shFiltrado |
| `ac97da0` | **deleteClient y eliminarPedidoFinalizado dejaban filas huérfanas** en `clients`, `orders_finalizados` y `sales_history` | Nuevas `deleteClientFromDB(id)` / `deleteSalesHistoryEntry(id)` en db.ts; llamadas tras los saves correspondientes |

### Bugs de flujo finalización/cancelación (commit `96085b1`)

| # | Bug | Impacto |
|---|-----|---------|
| 1 | `_descontarInventarioPedido` (async) sin `await` al finalizar individual — `Promise > 0` es false → `inventarioDescontado` nunca se marcaba | **Doble descuento de stock** en siguiente transición |
| 2 | Mismo bug en `_aplicarCambioLote` (finalizar en lote) | Igual; fix: fire+flag inmediato (descuento en memoria ocurre antes del primer await) |
| 3 | Lote registraba `pedidoFin.total` en salesHistory en vez de `calcSaldoPendiente` | **Anticipos contados doble** en reportes; agregado guard `yaRegistrado` |
| 4 | Undo de cancelar no restauraba `inventarioDescontado`/`empaquesDescontados` | Cancelar→Undo→producción = doble descuento; ahora captura flags antes y re-descuenta en undo |

### Otros fixes de la sesión

| Commit | Fix |
|--------|-----|
| `f6b024d` | `#closeSidebar` sin `data-action` (muerto tras migración CSP) + `config-init.js` removido de core.bundle (doble ejecución) |
| `d0f3cb2` | Changelog v2.2.0 con novedades reales (estaba congelado en 2.1.0) |
| `d8ff32d` | **Workflow de Netlify eliminado** (`.github/workflows/deploy.yml`) — fallaba en cada push por secrets expirados; el deploy real es Coolify |
| `88f592a` | **Heatmap de actividad compacto** — `aspect-ratio:1` hacía cuadros gigantes en pantallas anchas; ahora altura fija 26px + max-width 520px |

### Auditorías realizadas (resultado: limpio)

- **Supabase:** 0 pedidos fantasma, 0 IDs duplicados cross-table, 0 productos corruptos, 0 pedidos con productos eliminados
- **Código:** productos (`deleteProduct`/`invBulkEliminar`) ya tenían DELETE explícito; CxC/CxP/recurrentes usan `sbSave` full-replace (seguro); ingresos/gastos no tienen flujo de borrado individual

### ⚠️ Convenciones nuevas (Sesión 18)

```javascript
// PATRÓN UPSERT-DELETE: los save* relacionales (savePedidos, savePedidosFinalizados,
// saveClients, saveSalesHistory) usan upsert — NUNCA borran filas.
// Al quitar un elemento de un array hay que llamar el delete explícito:
//   deletePedidoActivo(id)       → orders
//   deletePedidoFinalizado(id)   → orders_finalizados
//   deleteClientFromDB(id)       → clients
//   deleteSalesHistoryEntry(id)  → sales_history
// Las tablas key/value vía sbSave() NO necesitan esto (reemplazo completo del JSON).

// FILTRO DE CARGA: _RELATIONAL_TABLES.pedidos tiene filter() que excluye
// status finalizado/completado/entregado — 'cancelado' SÍ se carga (historial).

// _descontarInventarioPedido es ASYNC — siempre await (o fire+flag consciente
// de que el descuento en memoria ocurre antes del primer await interno).
```

---

## ✅ DEUDA TÉCNICA — Completada en Sesión 17 (commit `8d176ae`)

> Los 9 ítems originales fueron aplicados en sesión dedicada. Ver historial abajo.

| # | Qué se hizo | Commit |
|---|-------------|--------|
| **F40** | Tests automatizados con Vitest para `calcSaldoPendiente`, márgenes, rollback | `8d176ae` |
| **C14/C15** | CSP `unsafe-inline` eliminada; 264 `onclick` → `data-action` delegation (`csp-delegate.ts`) | `8d176ae` |
| **D27** | Render incremental en `renderInventoryTable` — ya no reconstruye todo el DOM | `8d176ae` |
| **D28** | `calcularDisponibilidadDesdeMP` cacheada — O(n×m) → O(1) con invalidación | `8d176ae` |
| **F35** | TypeScript strict mode activado; errores tsc corregidos | `8d176ae` |
| **F39** | `MK.state.*` namespacing — estado separado de globals de negocio | `8d176ae` |
| **D25** | Bundle system: 8 bundles, 30 requests → 1 por sección (esbuild concat) | `8d176ae` |
| **D26** | Archivos monolíticos divididos: `pedidos-1.ts` → 3 archivos; `inventory-2.ts` → 4 | `8d176ae` |
| **G42** | SW cache con hash SHA-256 de contenido — auto-bumpa sin intervención manual | `8d176ae` |

**Post-deploy fixes (commits `9a9ffe9`, `f6b024d`):**
- `#sidebarOverlay` z-index 199→49 (bloqueaba todos los clicks)
- `#closeSidebar` button sin `data-action` → agregado
- `config-init.js` fuera del bundle (doble ejecución del stub showSection)

---

## ✅ Sesión 15 + 16 (3 junio 2026) — 46/52 hallazgos de auditoría aplicados

### Sesión 15 — commit `e2f3c31` (35 hallazgos)

| Categoría | Aplicado |
|-----------|---------|
| Bugs | A1 (7 íconos), A2 (130+ type=button), A6 (productMap RT), A7 (RT INSERT fast-path), A8 (8 diálogos nativos→showConfirm/modal) |
| Seguridad | A5 (noopener×9), E34 (console.log gateado con MK_DEBUG) |
| Performance | D24 (MutationObserver solo addedNodes) |
| Diseño | C17 (gradientes inventario→gold), B13 (noscript), C20 (skip-to-content + role=main) |
| PWA | G43 (banner persistente SW update), G44 (QuotaExceededError + toast) |
| UX | H50 (fallback clima), H51 (mkSaveIndicator global), A3 parcial (config.ts) |

### Sesión 16 — commit `c449175` (11 hallazgos)

| Categoría | Aplicado |
|-----------|---------|
| Accesibilidad | B11 (alt en ~18 imgs), B12 (aria-label en botones tabla inventario), C16 (thead estático eliminado), C19 (focus-trap + role=dialog/aria-modal), C21 (role=img + aria-label en gráficas Chart.js) |
| UX / comportamiento | C18 (skeleton kanban), H46 (colapsar columnas vacías), H47 (sort clientes persistido en localStorage), H49 (delta % vs mes anterior en KPIs reportes), H52 (aviso cambios sin guardar en modales), H48 parcial |

### Convenciones nuevas (Sesión 16)

```javascript
// FOCUS-TRAP: window._mkTrapFocus(modal) al abrir, _mkReleaseFocus(modal) al cerrar
//   Se llama automáticamente desde openModal() en db.ts

// UNSAVED WARNING: modal._mkDirty = true cuando el usuario escribe en un input del modal
//   closeModal() pide confirmación si _mkDirty === true
//   Limpiar con: window._mkModalSaved(modal) al guardar exitosamente

// SORT CLIENTES: localStorage 'mk_clientes_sort' = {col, dir}
//   Se inicializa al cargar clientes.ts

// DELTA KPIs REPORTES: updateMonthlyStats() ahora calcula mes anterior y muestra ▲▼ %
//   Solo aparece cuando prevMonth > 0 para evitar Infinity%
```

---

## ✅ COMPLETADO — Sin pendientes de código (3 junio 2026)

### Sesión 12 (3 junio 2026) — Auditoría profunda 5 agentes: 19 bugs corregidos

**Metodología:** 5 agentes en paralelo con isolation worktree. 4 commits en `fresh-start`.

| Commit | Área | Fixes |
|--------|------|-------|
| `a040faf` | balance + ui-extras | `_fechaLocal` colisión, `renderMovimientos` rename, `registrarMovimiento` posicional, XSS nombres |
| `7d97059` | db | incomes/expenses read path, sbSave promesas, image retry, RT deferred queue, registrarMovimiento duplicado |
| `692850f` | reportes + clientes | `_getAllVentas` muta salesHistory, cacheKey mejorado, trio duplicado eliminado, XSS, escAttr fallback |
| `e02d73b` | inv-2 + config + pedidos + dashboard | rollback saveProducts, ganancia neta correcta, XSS ×6, null guards ×7, setInterval handle |

**Críticos resueltos:**
- `_fechaLocal` en balance.ts sobrescribía la versión de ui-extras → sparkline y comparativa semanal siempre mostraban hoy. **Fix:** eliminada de balance.ts, renombrada en ui-extras a `_fechaLocalDe(d)`.
- `_getAllVentas()` mutaba objetos reales de `salesHistory` → totales podían persistirse alterados. **Fix:** `Object.assign({}, s, {...})` en lugar de mutación directa.
- `saveIncomes`/`saveExpenses` escribían en tabla relacional pero `sbLoad` leía del store vacío → datos desaparecían al recargar. **Fix:** `incomes`/`expenses` agregados a `_RELATIONAL_TABLES`.
- `sbSave()` dejaba promesas colgadas al cancelar debounce. **Fix:** `_sbSavePendingCbs` registry que resuelve/rechaza todos los waiters.
- Realtime descartaba updates con modal abierto. **Fix:** `_rtDeferredQueue` que re-encola y ejecuta al cerrar modal.
- `renderMovimientos` duplicada (balance vs inventory-5) escribía en el mismo `#movimientosLista`. **Fix:** renombrada la de balance a `_renderMovimientosBalance()`.
- Rollback de `saveProducts` era código muerto (fuera del try, sin await). **Fix:** `await saveProducts()` dentro del try con catch que activa `_rollbackData`.
- `registrarMovimiento` duplicada con firmas incompatibles (posicional en db.ts vs objeto en inventory-1.ts). **Fix:** eliminada la posicional de db.ts; corregida llamada en ui-extras.ts.
- Ganancia neta inflada en dashboard: `totalCosts` no incluía pedidos finalizados. **Fix:** `totalCosts += costo` en el loop de pedidosFinalizados.
- `client.name.toLowerCase()` crash con null. **Fix:** `(client.name || '').toLowerCase()`.
- ~15 puntos de `p.name`/`c.name` sin `_esc()` en innerHTML. **Fix:** aplicado en ui-extras, reportes, pedidos-2/3, inventory-2, config.
- Trio `filtrarProductosPedido/seleccionar/limpiar` duplicado en reportes.ts. **Fix:** eliminado (canónico en pedidos-3.ts).
- `setInterval` verificarEntregas sin handle. **Fix:** `window._entregasCheckInterval` con clearInterval previo.
- `_migrationFailed` flag permanente impedía reintentos de migración base64→Storage. **Fix:** eliminado.

### ⚠️ Notas Sesión 12 (convenciones descubiertas)

```
// _fechaLocal: NO usar este nombre en ningún módulo — colisiona
// Usar _fechaHoy() para "hoy" y _fechaLocalDe(d) (ui-extras) para formatear fecha arbitraria

// renderMovimientos: nombre reservado para inventory-5.ts (movimientos de stock)
// la versión de balance se llama _renderMovimientosBalance()

// registrarMovimiento: siempre usar firma de objeto (inventory-1.ts)
//   ✅ registrarMovimiento({ productoId, productoNombre, tipo, cantidad, motivo, stockAntes, stockDespues })
//   ❌ registrarMovimiento(id, nombre, tipo, cantidad, motivo) — eliminado

// _getAllVentas(): nunca mutar los objetos del array devuelto — son referencias a salesHistory
// Usar Object.assign({}, s, {...}) si necesitas modificar propiedades
```

### Sesión 11 (2 junio 2026) — Rediseño dashboard + todas las nice-to-have + fixes

#### Dashboard rediseño v2 (commits `73baaf1`, `a08fe1b`)
- Hero header oscuro premium (`#1A0533→#2D0B5C`) con grain, glow, línea dorada
- KPI row: 5 cards con accent bars de color (meta integrada + ventas/ganancia/pedidos/me deben)
- Layout 3:2 (gráficas izq / info operativa der), stats 3 col + 2 col + notas
- CSS: `.mk-dash-hero`, `.mk-kpi-v2`, `.mk-dash-content-grid`, `.mk-dash-stats-row-2`

#### Nice-to-have aplicadas (commits `5fa059e`, `a08fe1b`)

| Feature | Descripción | Archivos |
|---------|-------------|---------|
| N-KANBAN-002 | Sub-headers urgencia dentro columnas (Urgente/Próximo/Normal) | `pedidos-1.ts` |
| N-KANBAN-004 | Doble-clic en fecha → inline date picker + save inmediato | `pedidos-1.ts` |
| N-KANBAN-005 | Undo visual si falla drop: card shake + regresa a columna | `pedidos-2.ts` |
| N-ANIM-002 | Bounce dorado al mover card exitosamente (`mkKanbanMoved`) | `pedidos-2.ts`, `maneki-premium.css` |
| N-PEDIDOS-004 | Saldo pendiente del cliente visible al abrirse el modal | `pedidos-1.ts` |
| N-PEDIDOS-005 | Precio promedio histórico del cliente como hint | `pedidos-1.ts` |
| UX-3 JS | Wizard steps 1→4 se activan según campo enfocado | `pedidos-1.ts` |
| N-EMPTY-002 | Empty states diferenciados en tabla pedidos | `pedidos-1.ts` |
| N-VIZ-001 | Tendencia lineal (regresión) en gráfica flujo de caja | `dashboard.ts` |
| N-VIZ-002 | Donut chart gastos por categoría en balance mensual | `balance.ts` |
| N-VIZ-003 | Heatmap 7×6 actividad pedidos por día × bloque horario | `dashboard.ts` |
| N-SEARCH-004 | Fuzzy search Levenshtein (threshold=2) en inventario y clientes | `inventory-5.ts`, `clientes.ts` |
| N-TOOLTIP-003 | Tooltips en badges predicción stock (prom/día + stock + días) | `dashboard.ts` |
| DES-006 | Eliminar cliente usa `showConfirm()` del design system | `clientes.ts` |
| N-KEY-001 | Ctrl+A → seleccionar todos en inventario | `ui-extras.ts` |
| N-KEY-002 | Ctrl+Q → abrir cotizaciones | `ui-extras.ts` |
| N-KEY-003 | Ctrl+E → exportar sección activa | `ui-extras.ts` |

#### Fixes de bugs consola (commits `1b97e56`, `c611d18`, `78630ad`, `ad535e8`)

| Bug | Causa | Fix |
|-----|-------|-----|
| Error 400 `clients` | Tabla sin columna `updated_at`, queries fallaban | Migración Supabase + `updated_at` en `saveClients()` upsert |
| SW `TypeError: clone body used` | `response.clone()` dentro de callback async ya consumido | Clonar síncronamente antes de `return response` → v2.3.6 |
| `ReferenceError: eliminarPedidoFinalizado` | `window.X = X` en `pedidos-3.ts` fuera de scope | Mover asignación a `balance.ts` donde la función existe |
| `ReferenceError: openPtModal/MpModal/SvcModal` | Aliases en HTML no existían como funciones globales | Aliases en `inventory-1.ts` que mapean a funciones reales |

#### Performance fixes (commits `ca16d52`, `78630ad`, `757302d`)

| Fix | Impacto |
|-----|---------|
| `animarNumero`: `_fmtFast()` para frames intermedios (~0.1ms vs ~8ms) | Elimina rAF >50ms violation |
| `renderBalancePieChart`: Chart.js init diferido con rAF | Reduce forced reflow al cargar Balance |
| `navigation.ts`: `void target.offsetWidth` → `animationName:none + rAF` | Elimina reflow en **cada** cambio de sección |
| `design-system.ts`: `void _overlay.offsetWidth` → doble rAF | Elimina reflow en morph de sección |
| `dashboard.ts`: 2× `void badge.offsetWidth` → doble rAF | Elimina reflow en actualización de badges |
| `pedidos-2.ts`: `void card.offsetWidth` → doble rAF | Elimina reflow en animación kanban |
| `navigation.ts`: `sidebarBtn.animate()` → rAF | Elimina reflow de Web Animations API |
| Charts en `_updateDashboardImpl` → un único rAF | Defer Chart.js getBoundingClientRect |
| `[DOM] Password not in form` → `<form>` en inputs PIN | Elimina warning DOM en consola |

### ℹ️ Notas permanentes (infraestructura — no solucionable en frontend)

| # | Área | Nota |
|---|------|------|
| S-NGINX | Rate limiting | Pendiente: `limit_req_zone` en nginx contra brute-force Basic Auth |
| S-TOKEN | Telegram token | En `storeConfig` como string plano — fix requiere Edge Function proxy |
| BUG-2 | Folios multi-tab | Race condition requiere UNIQUE constraint en Supabase a nivel DB |

### ⚠️ Convención importante descubierta en Sesión 11

```
// Aliases de modales de inventario (NO cambiar nombres en index.html sin actualizar inventory-1.ts)
window.openPtModal  → openAddProductModal()           // Producto Terminado
window.openMpModal  → injectMpModal() + openModal()   // Materia Prima
window.openSvcModal → injectSvcModal() + openModal()  // Servicio
// Producto Variable tiene su propio modal independiente

// Tabla 'clients' en Supabase tiene columna updated_at (agregada sesión 11)
// saveClients() DEBE incluir updated_at: new Date().toISOString() en el upsert row

// void element.offsetWidth está PROHIBIDO para reiniciar animaciones CSS
// Usar: element.classList.remove('cls'); rAF(() => rAF(() => element.classList.add('cls')));
```

---

## Infraestructura VPS — nginx

El dominio `pos.manekistore.com.mx` está servido por un nginx **del host** (no del contenedor) que actúa como reverse proxy hacia el contenedor Coolify en `http://127.0.0.1:8081`.

**Archivo de config:** `/etc/nginx/sites-available/pos.manekistore.com.mx`
**Backup:** `/etc/nginx/sites-available/pos.manekistore.com.mx.bak`
**htpasswd:** `/etc/nginx/.htpasswd` (usuario: `manekimaster`)
**Panel Coolify:** `http://195.26.247.101:8000` → My first project → production → maneki-pos

```bash
# Para modificar el nginx del host (desde Coolify Terminal → localhost):
nano /etc/nginx/sites-available/pos.manekistore.com.mx
nginx -t && systemctl reload nginx
```

⚠️ **Archivos sin auth (PWA):** `manifest.json`, `sw.js`, `logo.png` tienen `auth_basic off` en un `location ~` antes del `location /`. Esto es necesario para la instalación PWA. Si Coolify redeploya y regenera el nginx del contenedor, el nginx del HOST no se toca — son configuraciones independientes.

---

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| Proyecto local | `F:\PROYECTOS\MANEKI ECOSISTEMA\mi-punto-de-venta` |
| GitHub | https://github.com/Mordredgh/maneki-pos.git |
| Web (Coolify) | https://pos.manekistore.com.mx |
| VPS | 195.26.247.101 |
| Auth | nginx Basic Auth (host-level, no en contenedor) |
| Supabase | https://hoqcrljgmamaumtdrtzi.supabase.co |
| Coolify UI | http://195.26.247.101:8000 |

---

## Cómo Empezar una Nueva Sesión

1. Leer este CLAUDE.md completo
2. Correr `git status` para ver el estado actual del branch
3. Si hay cambios recientes: `git log --oneline -5` para ver el historial
4. Revisar la sección **PENDIENTES** arriba para saber qué atacar
5. Al compilar TS siempre usar: `npx esbuild src/X.ts --outfile=js/X.js --sourcemap --target=es2020 --minify`
6. Al terminar: `git push github fresh-start:master`
7. **Si hay nueva versión:** actualizar la sección **Changelog del Programa** con las novedades en formato de viñetas cortas para el usuario final (no técnicas)
