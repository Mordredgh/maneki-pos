# Maneki POS — Web App (Coolify)

> **Última actualización:** 2 junio 2026 — Sesión 8 (Auditoría exhaustiva: 30 fixes bugs/perf/ux)
> **Versión app:** 2.2.0 | **Service Worker:** v2.3.4 | **Branch:** fresh-start → master

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

// REPORTES — caché memoizada
_getAllVentas()                  // ✅ en reportes.js — no bypasear
// ⚠️  invalidar via window._invalidarCacheVentas() — NO asignar _allVentasCache = null directo (es variable privada)

// REALTIME — guard contra canales duplicados
window._mkRTSetupDone           // se checa antes de llamar _setupRealtime()
```

---

## Comandos Útiles

```bash
# Compilar un archivo TS (SIEMPRE con --minify en producción)
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

## 🚨 PENDIENTES — Próxima Sesión

### 🔴 Bugs — Quedan sin aplicar

| # | Área | Descripción | Dificultad |
|---|------|-------------|-----------|
| B2 | Storage | Fotos huérfanas en Supabase Storage: `_eliminarFotoStorageAlFinalizar()` falla silenciosamente; usuario no sabe que hay archivos no borrados. Agregar toast visible si falla. | Baja |
| B3 | Pedidos | Doble-click en "Guardar Pedido" puede crear 2 pedidos simultáneos. `_folioGenerando` protege el folio pero no el form submit. Fix: `btn.disabled = true` en submit, restaurar en error. | Baja |
| B8 | Pedidos | Dos fuentes de verdad para pagos: `p.anticipo` (legacy) + `p.pagos[]` (actual). Pueden desincronizarse. Requiere migración de datos y limpieza de código. | Alta |
| B10 | Pedidos | `pedidoForm` submit muta `cp.stock` en `window.products[]` directamente al procesar kits. Si el usuario no guarda después, hay stock incorrecto en memoria hasta el siguiente sync. | Media |

### 🟠 Performance — Quedan sin aplicar

| # | Área | Descripción | Impacto |
|---|------|-------------|---------|
| P1 | Global | Re-render completo de `renderInventoryTable`, `renderPedidosTable`, `renderClientsTable` aunque cambie 1 registro. Requiere diff-patch con hash por fila. | Alto |
| P3 | Inventario | `patchInventoryButtons()` se ejecuta con 3 `setTimeout` (400/800/1500ms). Reemplazar con `MutationObserver` que dispara cuando el modal es visible. | Medio |
| P4 | Realtime | 5 canales Supabase realtime con debounces independientes (600-800ms cada uno). Consolidar en un único debounce con flags `{productsChanged, pedidosChanged, …}`. | Alto |
| P5 | DB | Queries `sbLoad()` sin `.limit()` en `config.ts`. Con 2000+ registros descargan todo. Agregar `.limit(2000).order('updated_at',{ascending:false})` en cada tabla. | Alto |
| P8 | Reportes | `_getAllVentas()` se llama 3 veces por `initReports()` (comparativaMeses, comparativaAnio, topProductos). La caché interna ayuda pero el cacheKey se recalcula 3 veces. Pasar el resultado como parámetro. | Bajo |
| P9 | Realtime | `_applyRTRelacional()` descarga la tabla completa en cada cambio. Implementar `_lastSyncAt` y usar `.gt('updated_at', _lastSyncAt)` para solo descargar el delta. | Alto |

### 🟡 UX — Quedan sin aplicar

| # | Módulo | Descripción | Esfuerzo |
|---|--------|-------------|---------|
| UX2 | Inventario | Bulk edit sin vista previa antes de ejecutar. Mostrar tabla "Precio anterior → Precio nuevo" antes de confirmar cambio masivo. | Medio |
| UX4 | Pedidos | Columnas kanban vacías sin estado decorativo. Agregar SVG minimalista + texto "Sin pedidos en este estado" en columnas vacías. | Pequeño |
| UX7 | Pedidos | Fecha en tabla mobile trunca "2026-06-02 14:30" a "2026-06-...". Mostrar solo fecha en celda, hora en `title` tooltip o segunda línea gris. | Pequeño |
| UX9 | Balance | Campo descripción en ingresos/gastos es texto libre sin historial. Agregar `<datalist>` con últimas 10 descripciones desde localStorage. | Pequeño |
| UX11 | Clientes | Panel RFM sin acción directa. Agregar botón "📱 Contactar por WA" en el detalle de cada segmento para abrir WhatsApp masivamente. | Pequeño |
| UX12 | Inventario | Editar producto requiere 4 clicks. Doble-click en celda de precio/stock = campo editable inline. | Grande |
| UX13 | Reportes | Filtros de fecha requieren escribir YYYY-MM-DD. Agregar selector "Mes actual \| Mes anterior \| Últimos 3 meses \| Rango". | Medio |
| UX15 | Config | Si el onboarding se rechazó no hay forma de reactivarlo. Agregar botón "Ver tutorial de nuevo" en Configuración → zona de ayuda. | Pequeño |

### ℹ️ Nota de seguridad permanente

| # | Área | Nota |
|---|------|------|
| S2 | Supabase | RLS **verificado activo** en tabla `store` y todas las 27 tablas. Telegram Token en `storeConfig` sigue como string plano — fix real requiere backend proxy (Edge Function). No hay solución frontend-only segura. |

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
