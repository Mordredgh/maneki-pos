# Bicho Capricho POS — Web App (Coolify)

> **Última actualización:** 2 julio 2026 — Sesión 28 (rebrand completo Maneki → Bicho Capricho + rediseño visual total de las 15 secciones + GSAP)
> **Sin pendientes de código.** App estable. Guardrails activos: lint pre-build + vitest (65 tests) en Step 0.
> **Nombre anterior del proyecto:** Maneki Store / Maneki POS. El repo, algunos paths y variables internas (`maneki*`, `MK.*`, `manekiToast*`) conservan el nombre viejo a propósito — son identificadores internos, no marca visible. Ver regla en "NO HACER" más abajo.
> **Versión app:** 2.6.2 | **Branch:** fresh-start → master
> **Sistema de diseño:** ver sección **"🎨 Sistema de Diseño — Bicho Capricho"** más abajo antes de tocar cualquier CSS/HTML — define paleta, tipografía, filosofía Restrained, y qué NO tocar.

---

## 🎨 Sistema de Diseño — Bicho Capricho

> Fuente única de tokens: **`maneki-premium.css`** (`:root`, máxima especificidad). Cualquier color/tipografía/spacing nuevo se define ahí, no inline suelto en `index.html` o en los `src/*.ts`.

### Paleta oficial (única fuente de verdad — no inventar variantes)

| Nombre | Hex | Uso |
|---|---|---|
| Bosque | `#1c4f32` | texto primario; fondo sólido de sidebar y topbar (`#global-search-bar`) — Sesión 31; hero del dashboard/bienvenida |
| Lavanda | `#dfbfff` | acento claro, superficies lila |
| Uva | `#9669c4` | acento morado principal (reemplaza CUALQUIER morado/violeta viejo) |
| Lima | `#c3ec9f` | (uso puntual, poco usado en UI actual) |
| Oliva | `#678d47` | (uso puntual) |
| Mantequilla | `#FFD166` | color de marca principal — botones primarios, active states, acentos dorados (reemplaza el "dorado" `#C5973B`/`#C9933A` de la era Maneki) |
| Rosa | `#FFB4C8` | acento cálido (KPIs "Me deben", badges) |
| Crema | `#F8F4EC` | fondo general de la app |

Escala derivada de Mantequilla (tokens `--mk-g*` en `maneki-premium.css`): `#FFDD85`, `#FFE8B0`, `#FFF1D2`, `#FFF6E0`, oscuros `#8a6510`/`#6b4a00` para texto sobre fondo claro.
Escala derivada de Uva/Lavanda (tokens `--mk-p*`): `#7d4fa3`, `#ab84d1`, `#c29fdf`, `#ecd9ff`, `#f6ecff`.

**Colores que NO son de marca y si aparecen son residuo — reemplazar por la tabla de arriba:** cualquier `#7C3AED`/`#8B5CF6`/`#A855F7`/`#6D28D9`/`#9B7BC4`/`#C4A8E0`/`#1A0533` (morado/violeta viejo de Maneki), `#C5973B`/`#C9933A`/`#E8B84B` (dorado viejo de Maneki).

### Tipografía

- `Nunito` — cuerpo, labels, tablas, todo el texto funcional (`var(--font-body)`)
- `Fredoka One` — SOLO 1-2 momentos de marca por vista: saludo del hero, nombre de tienda en sidebar (`var(--font-brand)`). No usar en botones, labels, ni texto denso.
- `DM Mono` — números tabulares puntuales (kbd hints, shortcuts)

### Filosofía: Restrained por defecto, Committed solo donde se gana

Síntesis aplicada en toda la Sesión 28 (viene de `impeccable` registro "product" + guía de marca):

- **Superficies de tarea** (tablas, kanban, formularios, listas): paleta neutra + 1 acento. Nada de "cada card su propio gradiente pastel" — eso es ruido, no personalidad. El color vive en el ícono/badge, no en el fondo de la tarjeta entera.
- **Chrome + momentos de marca** (sidebar, hero del dashboard/bienvenida, celebraciones tipo confetti): aquí sí vive la calidez "juguetona" de Bicho Capricho — colores más saturados, Fredoka One, motion con más presencia.
- **Un solo botón primario por toolbar** (relleno Mantequilla, clase `.mk-btn-primary`), el resto son botones neutros ghost (clase `.mk-toolbar-btn` + ícono con `.mk-tb-ico`). Antes cada toolbar tenía 4-7 botones con gradientes distintos compitiendo — deuda documentada desde la Sesión 13 y nunca resuelta hasta la Sesión 28.
- **Nada de emoji como ícono de UI.** El proyecto tiene un sistema de íconos SVG local offline (`src/icons.ts` / `window.ManekiIcons`) que auto-convierte cualquier `<i class="fas fa-nombre-icono">` a SVG inline — usar eso, no `🎯`/`📋`/`💰` como prefijo de un título o botón. Emoji está bien dentro de mensajes de WhatsApp/toasts como acento de tono, no como ícono funcional.
- **Nada de "gradient text"** (`background-clip:text` con degradado) — usar color sólido. El nombre "Bicho Capricho" en el sidebar usaba esto con degradado dorado; se cambió a Bosque sólido.
- **Nada de acento de borde lateral** (`border-left:3px` decorativo, o un `::before` de 3px de ancho simulándolo) en cards/kanban/list-items — patrón considerado "AI slop" (impeccable `absolute bans`). El indicador de item activo del sidebar usaba esto; ahora es un `#sidebarIndicator` tipo pill que GSAP anima detrás del item activo.
- **Motion:** 150-300ms, easing sin rebote (`--ease-out-quart/quint/expo` en vez de `--spring`/bounce) para transiciones funcionales. Un solo "hero moment" por vista (la entrada escalonada del hero del dashboard), no coreografía en cada carga de sección. Siempre respetar `prefers-reduced-motion` — hay una regla global en `maneki-premium.css` que ya lo hace, y el hero del dashboard usa `gsap.matchMedia()` explícito.

### GSAP

Integrado vía CDN (`cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`, ya permitido por el CSP existente), cargado `defer` antes de `DOMContentLoaded`/`initApp()`. Usos actuales:
- `_mkMoveSidebarIndicator(btn)` (`design-system.ts`) — desliza el `#sidebarIndicator` al item activo del sidebar, llamado desde `showSection()` en `navigation.ts`.
- `_mkAnimateDashboardHero()` (`design-system.ts`) — entrada escalonada del hero del dashboard (`[data-hero-stagger]`), disparada SOLO al entrar a la sección `dashboard` (no en cada refresh de datos).

No se usó GSAP para el drag-and-drop del kanban ni para modales — el CSS existente (`mkModalIn`, `mkKanbanMoved`) ya cumple, y tocar el drag-and-drop es alto riesgo (ver "Áreas frágiles" abajo).

### Patrón de toolbar (aplicar a cualquier sección nueva)

```html
<button class="mk-btn-primary"><i class="fas fa-plus"></i> Acción principal</button>
<button class="mk-toolbar-btn"><i class="fas fa-icon mk-tb-ico"></i> Acción secundaria</button>
```

### Patrón de página (Sesión 31 — aplicar a cualquier sección nueva)

```html
<div class="mk-page-header">
  <div>
    <p class="mk-page-kicker">Categoría breve</p>
    <h1 class="mk-page-title">Nombre de la sección</h1>
    <p class="mk-page-sub">Descripción corta</p>
  </div>
</div>
```
- `.mk-kpi-solid` (combinar con `.mk-card`) para la métrica principal de una vista, cuando haya una candidata obvia — no forzarlo si todas las métricas pesan igual.
- `.mk-view-tabs`/`.mk-view-tab` para selectores de vista, `.mk-filter-pill` para filtros por estado (color vía `--pill-c`/`--pill-bg`), `.mk-status-pill` para badges de estado, `.mk-mini-btn` (+`.success`/`.danger`) para botones de acción densos en filas de tabla/tarjetas.

### Qué NO tocar (decisiones deliberadas)

- **Diccionario de nombres de color en `inventory-1.ts`** (línea ~27: `morado`/`violeta`/`lila`/`lavanda` → hex): el propósito es que el nombre coincida con el color real, no representar la marca. No remapear a la paleta oficial.
- **Badges de urgencia dentro de `kanbanCardHTML`** (`pedidos-1-views.ts`): 🔴 hoy / 🟡 mañana / ⛔ vencido siguen siendo emoji — es información funcional glanceable, no decoración, y son distintos de los *botones* de acción de la tarjeta (esos sí se migraron a íconos FA en la Sesión 31). El drag-and-drop es un área con múltiples bugs históricos (ver changelog Sesión 20/18) — no se tocó la estructura por relación riesgo/beneficio.
- **Selector de "Tema de colores" en Configuración — ELIMINADO en Sesión 29.** Si en algún commit viejo o rama vieja aparece, no restaurarlo: el usuario confirmó explícitamente que nunca se usaba.

---

## Changelog del Programa

> ⚠️ **REGLA:** Actualizar esta sección en CADA deploy. Es el contenido que aparece en el modal "¿Qué hay de nuevo?" de la app. El número de versión vive en `MK.version` (`src/config.ts`) y en el texto del modal (`src/init.ts` o `index.html`).

### v2.6.3 (13 junio 2026) — Auditoría S27 (Dashboard + Pedidos + Inventario)
**Dashboard:**
- 💰 D1: KPI ventas del mes usa `fmtMoney()` — enteros sin decimales, fracciones con 2
- 📅 D2: Día más rentable filtra últimos 90 días (antes sin límite, inflaba con datos viejos)
- 📊 D3: Widget mes vs anterior muestra ganancia neta (ventas − costos), no solo ventas
- ✨ D4: KPI cards con efecto hover (translateY −2px + sombra) — micro-interacción premium
- 🎨 D5: Widget de clima en paleta cálida dorada (antes azul frío)
- 💵 D6: "Me deben" total formateado con `fmtMoney()`
- 🔀 D7: Heatmap de pedidos con toggle Cantidad / Monto
- 🛡️ D8: Fetch de clima con AbortController para cancelar peticiones anteriores
**Pedidos:**
- ⚡ P1: Saldo pendiente pre-calculado en mapa antes del render del kanban (sin recalcular por card)
- 📅 P2: Fechas en tabla de pedidos en formato corto "12 jun" (antes YYYY-MM-DD)
- ⋯ P3: Botones de acción en tabla compactados en menú "···" (menos ruido visual)
- 🔍 P4: Búsqueda en historial de pedidos (ya estaba implementada)
- 📐 P5: Vista kanban tri-estado: Full / Media / Compacta (antes solo Full o Compacto)
- 💳 P6: Historial de pagos en grid 3 columnas con badge de método de pago con color
- 🛑 P7: Guard que evita renderizar tabla de pedidos en vista kanban activa
- 💰 P8: Totales de columna en tabla usan `fmtMoney()`
- 🏭 P9: Resumen de materiales en lista de producción (total acumulado por materia prima)
- ℹ️ P10: Barra contextual en modal de estado (saldo pendiente + días hasta entrega)
**Inventario:**
- 🔧 I1: `_dispCache` calculado solo para productos filtrados (antes recalculaba todos)
- ⋯ I2: Menú "···" en filas de MP con acciones avanzadas (merma, duplicar, convertir, etc.)
- 📋 I3: Panel "Movimientos recientes" global en toolbar de inventario (últimos 50 movimientos)
- 🗂️ I4: Secciones de inventario colapsables (clic en header para expandir/colapsar)
- 📝 I5: Comentario en `saveStockMovements` documenta el doble guardado intencional
- 📦 I6: Ajuste masivo de stock para Materias Primas (bulk stock modal)
- ▶ I7: Variantes de PT expandibles en tabla (antes siempre visibles, mucho ruido)
- 🔴 I8: Lista de compras con modo "Necesitas ahora" vs "Pipeline completo"
- 🏷️ I9: Badges de stock con emojis (🔴 Agotado, ⚠️ Bajo Stock, ✅ Disponible)

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
| CSS | Tailwind v3 build purgado 32.6KB (`css/tailwind.css`) + `maneki-premium.css` (único archivo fuente — `css/app.css` se retiró en la Sesión 32, su contenido vive fusionado aquí) |
| Icons | `js/icons.js` (SVG propio, sin Font Awesome) — diccionario `D` validado en cada build por `scripts/lint-footguns.js` (Sesión 32) |
| PWA | `manifest.json` + `sw.js` (Service Worker) — archivos cacheados vía hash de contenido |
| Deploy | `git push github fresh-start:master` (o `.\deploy.ps1 "msg"`) → Coolify. Build Pack = **Dockerfile** (Sesión 32): el build (tests+lint+compile+bundle) corre en el servidor, no depende de comitear `js/*.js` a mano |

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
  tailwind.css          — Build purgado 32.6 KB (NO usar CDN)
  (app.css ya no existe — retirado en Sesión 32, fusionado a maneki-premium.css)
src/                    — Fuentes TypeScript (compilar con esbuild --minify)
types/maneki.d.ts       — Definiciones de tipos globales
Dockerfile              — Build de 2 etapas (Sesión 32): node:20-alpine corre scripts/build.js, nginx:alpine sirve el resultado
nginx.conf              — Config de nginx (idéntica a la que ya estaba en Coolify), copiada 1:1 al Dockerfile
deploy.ps1              — git push + POST a la API de Coolify (Sesión 32) — deploy sin navegador, requiere $env:COOLIFY_BICHOPOS_TOKEN
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
- ❌ NO quitar un elemento de un array relacional (`incomes`/`expenses`/`salesHistory`/`pedidos`/`pedidosFinalizados`/`clients`) con `X = X.filter(...)` o `X.splice(...)` y solo llamar a `save*()` — los `save*` usan **upsert y NO borran** la fila en Supabase, así que reaparece al recargar (balance descuadrado / venta fantasma). Acompaña SIEMPRE el filtro/splice con su `delete*` de `db.ts` (`deleteIncomeFromDB` · `deleteIncomesByFolio` · `deleteExpenseFromDB` · `deleteSalesHistoryEntry` · `deletePedidoActivo` · `deletePedidoFinalizado` · `deleteClientFromDB`) o un `.delete()` directo de Supabase. El linter `upsert-sin-delete` (Step 0b) **rompe el build** si falta. Clase de bug recurrente S18/S24/S25/S26 — ver [[project_upsert_delete_incomes]].
- ❌ NO renombrar identificadores internos `maneki*`/`Maneki*`/`MK.*` (`mkId`, `mkHandleError`, `manekiToast*`, `ManekiStoreConfig`, `window.ManekiIcons`, nombres de archivo `maneki-premium.css`, repo `maneki-pos`, etc.) al hacer trabajo de marca/diseño — son identificadores internos sin impacto visual, no texto de marca. El rebrand a Bicho Capricho (Sesión 28) tocó SOLO texto visible al usuario y colores/tipografía; el código interno se queda con el nombre viejo a propósito (parche pequeño > renombrar todo el proyecto).
- ❌ NO usar morado/violeta genérico (`#7C3AED`/`#8B5CF6`/`#A855F7`/`#6D28D9`/`#9B7BC4` y similares) ni "dorado" viejo (`#C5973B`/`#C9933A`/`#E8B84B`) en CSS/HTML nuevo — usar la paleta oficial Bicho Capricho (ver sección "🎨 Sistema de Diseño" al inicio de este archivo). Ambos eran el acento de marca de la era Maneki y aparecen reintroducidos fácilmente por copy-paste de patrones viejos.
- ❌ NO usar emoji como ícono funcional de UI (prefijo de título, botón, badge de estado) — usar `<i class="fas fa-nombre">` (sistema SVG local, `src/icons.ts`). Emoji sí está bien dentro de mensajes de WhatsApp/toasts como tono.
- ❌ NO usar `background-clip:text` con degradado ("gradient text") en nombres/títulos — color sólido.
- ❌ NO usar acento de borde lateral decorativo (`border-left:3px` o `::before` simulándolo) en cards/list-items/kanban — patrón "AI slop" descartado en Sesión 28. Para estado activo/seleccionado usar fondo completo (pill) o el patrón `#sidebarIndicator` (GSAP) ya existente.

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

// Keys activas en tabla store (sin tabla relacional propia — store ES la fuente de verdad):
// storeConfig, folioCounter, gastosRecurrentes, ingresosRecurrentes, notas,
// quotes, equipos, roiHistorial, roiConfig, backupMeta, abonos, payables, receivables
```

⚠️ **Clase de bug recurrente: desincronización lectura/escritura `store` vs tabla relacional.**
`sbLoad(key, def)` intenta PRIMERO la tabla relacional listada en `_RELATIONAL_TABLES` (db.ts) —
si esa tabla tiene ≥ `min` filas, la usa y **nunca** consulta `store`. Si el `save*()` de ese key
sigue escribiendo solo en `store` (via el helper genérico `sbSave()`), los cambios se guardan en
un lugar que la app nunca vuelve a leer y **desaparecen al recargar**, aunque el toast diga
"guardado exitosamente" y el dato se vea bien hasta el próximo refresh.

Causa raíz confirmada 2 veces:
- Sesión previa (incomes/expenses): escritura relacional OK, pero `sbLoad` leía del `store` vacío. Fix: agregarlos a `_RELATIONAL_TABLES`.
- **Sesión 30 (2 julio 2026, categories):** al revés — `categories` YA estaba en `_RELATIONAL_TABLES` (lectura correcta), pero `saveCategories()` seguía escribiendo solo en `store.categories` via `sbSave()` genérico. Cualquier categoría creada/editada se guardaba en el blob muerto; al recargar, `sbLoad` traía las 12 filas viejas de la tabla `categories` sin la nueva. Fix: `saveCategories()` ahora hace `upsert` directo en `public.categories`, y se agregó `deleteCategoryFromDB()` (el patrón `upsert-sin-delete` de la regla de lint aplica igual aquí).

**Regla:** si un key aparece en `_RELATIONAL_TABLES`, su `save*()` DEBE escribir directo en esa tabla (patrón de `saveProducts`/`saveClients`/`saveIncomes`/`saveExpenses`/`saveCategories`), nunca via `sbSave()` genérico. Si un `save*()` usa `sbSave()`, su key NO debe estar en `_RELATIONAL_TABLES` (o hay que migrarlo, como se hizo con categories).

🔎 **Pendiente de revisar (mismo patrón, no confirmado si tiene el bug):** `saveStockMovimientos()` en db.ts todavía usa `sbSave('stockMovimientos', ...)` genérico, pero `stockMovimientos` SÍ está en `_RELATIONAL_TABLES` apuntando a `stock_movements` (340 filas). Si se reporta que un movimiento de stock "desaparece" o el historial de movimientos no cuadra, sospechar primero de esto — mismo fix que categories.

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

## ✅ Sesión 28 (2 julio 2026) — Rebrand Bicho Capricho + Rediseño visual total + GSAP

> Sesión más grande del proyecto hasta ahora en alcance de diseño. Dos partes: (1) terminar
> el rebrand Maneki→Bicho Capricho que 2 sesiones anteriores habían dejado a medias
> (colores/nombre en la superficie pero morado y "Maneki" seguían por todos lados en
> `src/*.ts`), y (2) rediseño visual completo de las 15 secciones + sistema de motion GSAP,
> **sin tocar lógica/Supabase/RLS/nombres internos `maneki*`** salvo 2 bugs explícitamente
> autorizados por el usuario. Ver la sección **"🎨 Sistema de Diseño — Bicho Capricho"** al
> inicio de este archivo para las reglas permanentes que salieron de esta sesión.

### Parte 0 — Terminar el rebrand (heredado de 2 sesiones previas incompletas)

| Hallazgo | Fix |
|---|---|
| ~40+ residuos de morado/violeta viejo (`#7C3AED`/`#8B5CF6`/`#6D28D9`/`#9B7BC4`/`#1A0533` y variantes de mayúsculas) | Barrido completo en `index.html`, los 4 `css/*.css`, y 15+ `src/*.ts` → Uva/Lavanda oficiales |
| Texto "Maneki" seguía en 16 archivos `src/*.ts` (banners de consola, nombre default de `storeConfig`, plantillas de WhatsApp, tickets/PDFs, modal "¿Qué hay de nuevo?") | Reemplazado a "Bicho Capricho" en todos los strings visibles; protegidos explícitamente `ManekiStoreConfig` (tipo) y `window.ManekiIcons` (API interna) — esos NO se tocan |
| **RLS de Supabase rota** — otra sesión (trabajando en la web pública, mismo proyecto Supabase `hoqcrljgmamaumtdrtzi`) cerró la escritura `anon` en `store` y `products` para proteger la web, sin saber que el POS usa la `anon key` para TODO (nunca hace login `authenticated`) | Migración `restore_anon_write_store_products_for_pos` — restaura políticas de escritura `anon` en ambas tablas. El POS ya está detrás de Basic Auth de nginx, así que el riesgo real no cambió vs. antes de esta sesión |
| Contraste insuficiente en `.mk-kpi-label` (~3.46:1, bajo WCAG AA 4.5:1) + una regla duplicada en `css/styles.css` que ganaba la cascada y anulaba el primer fix | `#5c7568` en ambos archivos (~5:1) |
| `maneki-premium.css` sin query param de cache-busting (a diferencia de los otros 3 CSS) — causaba que el navegador sirviera una copia vieja tras cada deploy | `?v=4.1` agregado al `<link>` |

### Parte 1 — Sistema de diseño base + GSAP (Fase 1: Sidebar + Topbar + Dashboard)

- Tokens ampliados en `maneki-premium.css`: spacing scale (`--sp-*`), z-index nombrado (`--z-dropdown/sticky/modal/toast/tooltip`), curvas de motion sin rebote (`--ease-out-quart/quint/expo`), `prefers-reduced-motion` global
- GSAP integrado vía CDN, `defer`, antes de `initApp()` — ver detalle en la sección de diseño arriba
- Sidebar: `#sidebarIndicator` (pill animado con GSAP) reemplaza el acento de borde lateral; nombre de marca de degradado a color sólido Bosque
- Dashboard: hero con entrada escalonada GSAP (`data-hero-stagger`), KPIs re-coloreados a paleta oficial, quitados fondos degradados decorativos de los widgets

### Parte 2 — 2 bugs corregidos (autorizados explícitamente por el usuario, fuera del alcance original "solo diseño")

| Bug | Causa raíz | Fix |
|---|---|---|
| `ReferenceError: envioAnillos is not defined` en cada carga de `initApp()` | `envios.ts` declara `envioAnillos`/`ENVIO_BASE` pero vive en su propio bundle lazy-loaded (`envios.bundle.js`), separado de `core.bundle.js` donde corre `initApp()` — asignaba antes de que existiera | Declaradas también en `config.ts` (core bundle); `envios.ts` usa `var x = x || valor` al declarar para no pisar los datos reales ya cargados cuando el usuario navega a Envíos después |
| Dashboard mostraba el saludo/fecha duplicado: el hero nuevo Y el widget `#resumenDia` (preexistente) pintaban cada uno su propio "Buenos días, Bicho Capricho" | `renderResumenDia()` (`dashboard.ts`) ya no dibuja saludo/fecha (el hero los muestra), solo la grilla de 3-4 stats de pedidos (info que el hero no tiene); `renderAccesosRapidos()` con íconos SVG en vez de emoji |

### Parte 3 — Fases 2-11: rediseño de las 15 secciones restantes

Patrón idéntico aplicado a Pedidos/Kanban, Inventario, Balance, Clientes, Categorías, Análisis
de Productos, Reportes, Equipos/ROI, Configuración, Cotizaciones, y Bienvenida (pantalla que
se muestra en CADA carga antes de navegar — tenía el hero completo todavía en degradado
morado→lavanda→durazno, nunca tocado en 2 sesiones de rebrand previas):

- 1 botón primario (`.mk-btn-primary`) + resto neutro (`.mk-toolbar-btn`) por toolbar
- Tarjetas de stats → `.mk-card` + `.mk-kpi-label`
- Headers de sección → `.mk-section-header`
- Emoji-como-ícono → SVG del sistema local (`<i class="fas fa-x">`)
- Paletas de Chart.js (`reportes.ts`, `balance.ts`, `equipos.ts`, `envios.ts`) con violeta viejo → Uva

**Clientes, Categorías y Análisis de Productos ya estaban mayormente limpios** — una sesión
anterior de rebrand los había cubierto parcialmente; solo se completaron detalles sueltos.

### Verificación

Cada fase: `node scripts/build.js` (65 tests + lint-footguns) → commit → push → deploy Coolify
→ verificación visual en producción vía `claude-in-chrome` (Basic Auth) con pestaña limpia
(SW/caché desregistrados) — screenshots, `read_console_messages` sin errores, contraste
verificado con `getComputedStyle`. El bug `ANILLOS_COLORS already declared` que apareció en
consola durante la verificación de Fase 2 era un artefacto de un script de prueba manual
inyectado en esa pestaña (force-load de `envios.bundle.js` para testear el guard), NO un bug
real — confirmado con una pestaña nueva sin ese historial.

### Commits de la sesión (orden cronológico, todos en `fresh-start`)

Rebrand nombre/paleta inicial (2 sesiones previas a esta) → esta sesión: fix RLS Supabase →
limpieza texto "Maneki" en `src/*.ts` → Fase 1 (sistema+Sidebar+Topbar+Dashboard) → fix
contraste `.mk-kpi-label` → fix cascada `css/styles.css` + cache-busting → Fase 2 (Pedidos) →
fix 2 bugs (envioAnillos + resumenDia) → Fases 3-11 + barrido final de morado.

## ✅ Sesión 29 (2 julio 2026) — Limpieza de infra + bienvenida-section + íconos de categorías

> Continuación directa de la Sesión 28 en la misma fecha. Empieza con housekeeping (worktrees
> huérfanos, consolidación CSS) y termina arreglando varios bugs visuales puntuales en
> `bienvenida-section` (la pantalla default al abrir la app) y agregando íconos 3D propios a
> Categorías. Commits `87b90fb`…`2889330`.

| Cambio | Detalle |
|---|---|
| 5 worktrees huérfanos de subagentes | `.claude/worktrees/agent-*` estaban además commiteados por error como gitlinks (modo `160000`) — se destrackearon y se agregó `.claude/worktrees/` a `.gitignore` |
| 4 hojas CSS → 1 | `css/styles.css` + `css/ui-redesign.css` + `css/responsive.css` → `css/app.css`, concatenación literal preservando el orden de cascada exacto (cero cambio visual). `maneki-premium.css` (tokens) y `tailwind.css` (generado) se dejaron aparte. Referencias actualizadas en `index.html`, `sw.js`, `scripts/hash-sw.js` |
| Tarjetas KPI de `bienvenida-section` transparentes, mostrando el verde del hero por debajo | Regla vieja `.mk-card, .kpi-card, [class*="rounded-xl"][class*="shadow"] { background: rgba(255,255,255,0.72); backdrop-filter: blur(12px); }` en `maneki-premium.css` (comentario "glassmorphism", pre-rebrand) aplicaba sin scope a TODA tarjeta `.mk-card` de la app — eliminada por completo, `.mk-card` vuelve a ser opaca (ya estaba bien definida en otra regla) |
| Grid de KPIs de `bienvenida-section` invadido por el hero verde | `margin-top:-32px` (pensado como overlap "premium") ponía la fila de ícono+label dentro de la zona verde — cambiado a `margin-top:16px`, las cards empiezan limpiamente debajo del hero |
| Selector "Tema de colores" en Configuración (6 paletas: Dorado/Rosa/Violeta/Esmeralda/Azul/Coral) | Eliminado por completo a pedido del usuario — nunca se usaba. Quitado el markup, el objeto `themes`, `selectTheme`/`applyTheme`/`loadThemeUI` (inyectaban un `<style>` dinámico que pisaba colores de sidebar/botones/KPIs con `!important`), y las 3 referencias sueltas (`config.ts`, `envios.ts`) |
| Categorías con emoji de sistema en vez de íconos 3D de marca | 12 íconos 3D generados por el usuario (`F:/PROYECTOS/BICHO CAPRICHO/ICONOS/CATEGORIAS`) convertidos a WebP (8MB→460KB, `sharp`) y copiados a `img/categorias/`. `renderCategoriesGrid()` (`categorias.ts`) mapea nombre de categoría normalizado → ícono; si no hay match cae al emoji de siempre. Alcance deliberadamente acotado a la tarjeta visual — `cat.emoji` se sigue usando igual en dropdowns/tickets/WhatsApp (20+ usos de solo texto donde una imagen no puede renderizar) |

## ✅ Sesión 30 (2 julio 2026) — Bug: categoría nueva desaparece al recargar

> Ver nota permanente en la sección "Base de Datos Supabase" arriba (clase de bug recurrente
> store-vs-tabla-relacional). Resumen aquí para el historial. Commits `c33a41a`…`42ebf9d`.

| Causa | Fix |
|---|---|
| Diálogo falso "¿Cerrar sin guardar?" al crear/editar categoría, siempre, aunque el guardado funcionara | El guard `closeModal()` (H52) marca el modal `_mkDirty` al escribir en un input y no se limpiaba antes de cerrar tras un guardado exitoso. Ahora se llama `_mkModalSaved()` antes de cerrar |
| La categoría se guardaba pero desaparecía al recargar | `saveCategories()` escribía solo en `store.categories` (blob JSON) vía `sbSave()` genérico, pero `sbLoad()` prioriza la tabla relacional `categories` (ya tenía 12 filas) — el blob nunca se leía. Fix: `saveCategories()` reescrito para hacer `upsert` directo en `public.categories`; nueva `deleteCategoryFromDB()` para el patrón `upsert-sin-delete` |
| Segunda vuelta: seguía sin guardar tras el fix anterior | El upsert no revisaba `{error}` de la respuesta — un fallo del servidor se tragaba en silencio y el caller creía que había guardado bien. Se agregó el chequeo y se relanza el error para mostrar un toast real |

## ✅ Sesión 31 (2 julio 2026) — "Solo cambiaron los colores": rediseño estructural real + limpieza de deuda CSS

> El usuario señaló que el rediseño de la Sesión 28 se sentía como un reskin superficial, no
> una restructura real. Auditoría de código confirmó el diagnóstico: el sistema de tokens
> premium solo se aplicaba de verdad en el 30-40% del HTML (el chrome pasivo: sidebar, topbar,
> dashboard); las superficies de trabajo diario (tablas, kanban, botones de acción, headers de
> sección) seguían con Tailwind genérico o emoji-como-ícono. Se validó una dirección visual
> nueva con una **maqueta** (herramienta `visualize`, sin tocar código real) antes de aplicarla,
> para no repetir el error de adivinar sin feedback intermedio. Commits `445e5fa`…`b073d3f`.

### Componentes nuevos en `maneki-premium.css`
| Clase | Para qué |
|---|---|
| `.mk-page-header` / `.mk-page-kicker` / `.mk-page-title` / `.mk-page-sub` | Header editorial (etiqueta pequeña + título grande Fredoka) — reemplaza el banner de gradiente `.mk-section-header` en las 11 secciones |
| `.mk-kpi-solid` | Tarjeta KPI con color de marca sólido (verde bosque) para la métrica principal de una vista, en vez de blanco+texto de color — ancla la jerarquía visual |
| `.mk-view-tabs` / `.mk-view-tab` | Grupo de pestañas de vista (ej. Kanban/Tabla/Calendario en Pedidos) |
| `.mk-filter-pill` | Pills de filtro por estado, color vía variables CSS `--pill-c`/`--pill-bg` |
| `.mk-status-pill` | Badge de estado con ícono — reemplaza emoji+texto en tablas/kanban |
| `.mk-mini-btn` (+ `.success`/`.danger`) | Botón de acción denso para filas de tabla / tarjetas kanban |

### Aplicado a toda la app
- Las 11 secciones migradas de `.mk-section-header` (banner de gradiente) a `.mk-page-header`
- ~30 tarjetas `bg-white rounded-2xl/xl border border-gray-100 (shadow-sm)` → `.mk-card` (Balance, Clientes, Análisis, Categorías, Reportes, Equipos, Pedidos, Inventario)
- Pedidos: selector de vista y pills de filtro → `.mk-view-tab`/`.mk-filter-pill`; `statusLabel` de la tabla y botones de acción (tabla + kanban) → `.mk-status-pill`/`.mk-mini-btn` con íconos FA en vez de emoji (⚡✏️🗑⋯📷⧉🖨️📄🏷️)
- Inventario: botones sueltos → `.mk-toolbar-btn`; emoji en botones de acción y badges de stock (🔴⚠️✅) de los 4 templates de fila → íconos FA
- Balance: hero "Neto del mes" pasó de fondo pastel+texto de color a **sólido** (verde bosque si es positivo, rojo sólido si es negativo)
- Emoji-como-ícono limpiado en Balance/Clientes/Reportes/Equipos (9 casos: exportar/eliminar/cerrar filtro/fusionar/ver-detalle/ver-pagos)
- Modales de crear pedido/producto: botones ad-hoc → `.mk-btn-primary`/`.mk-toolbar-btn` + íconos. **No** se hizo reflow a 2 columnas (evaluado y descartado): el modal de pedido ya tiene agrupación visual real por color y toca decenas de IDs con lógica JS interdependiente — restructurar el DOM completo era mucho riesgo por ganancia marginal
- Sidebar y topbar (`#global-search-bar`) de crema a **verde bosque sólido**, texto de la sidebar al crema que antes era el fondo (`#FBF8F3`), activo/hover en dorado de marca

### 3 bugs de especificidad CSS encontrados en el camino (mismo patrón, 3 veces)
`css/app.css` (consolidado en Sesión 29 desde 3 hojas viejas) tiene reglas residuales de al
menos 3 limpiezas previas nunca depuradas del todo, que cargan después de `maneki-premium.css`
y con igual especificidad ganan por orden de carga:
1. `.mk-kpi-solid` (Pedidos) no se veía → `.mk-card { background: var(--surface-primary) !important; }` en `app.css` ganaba. Fix: subir especificidad a `.mk-card.mk-kpi-solid`.
2. Sidebar/topbar seguían crema tras cambiarlos a verde → **dos causas**: (a) duplicados de `.sidebar`/`.sidebar-item` en `app.css` con igual especificidad — fix con prefijo `html` en los selectores de `maneki-premium.css`; (b) causa real: un `<style id="maneki-sidebar-override">` completo pegado en el `<head>` de `index.html`, sobrante de una sesión vieja, con selector `#sidebar.sidebar` (ID+clase) que le gana a CUALQUIER regla basada en clases sin importar cuántos prefijos se usen — eliminado por completo (se confirmó que `app.css` ya tenía el equivalente de modo oscuro antes de borrar).
3. **Auditoría completa de `css/app.css`**: script que detecta selectores duplicados fuera de `@media` encontró 40 grupos. Para cada uno se calculó — propiedad por propiedad, no bloque por bloque — cuál valor gana hoy según cascada real (importancia > especificidad > orden), y se consolidó en una sola regla con ese resultado (cero cambio visual, solo se borró código ya muerto). 897→861 bloques de selector, 4299→4194 líneas. Quedan ~19 "duplicados" marcados por la auditoría que en realidad son variantes legítimas de `@media` (responsive) — no se tocan.

### Bug adicional: botones casi invisibles por variable CSS sin fallback
6 botones en modales JS-renderizados (`init.ts`, `inventory-1.ts`, `inventory-2-pt.ts`,
`inventory-2-pack.ts`) usaban `background: linear-gradient(135deg, var(--mk-gold-500), var(--mk-gold-400))`
sin valor de respaldo. CSS no hace fallback parcial: si la variable no resuelve, TODA la
declaración de `background` se invalida y el botón queda sin fondo visible. Todos migrados a
`.mk-btn-primary` (ya no dependen de reconstruir el gradiente a mano). Confirmado con grep que
no queda ningún otro botón con ese patrón en la app.

### Pendiente / no hecho esta sesión
- Reflow a 2 columnas de los modales de pedido/producto (evaluado y descartado, ver arriba)
- Los ~19 duplicados restantes en `app.css` marcados como variantes de `@media` — no requieren acción
- KPI sólida y header editorial NO se profundizaron más allá de Pedidos/Balance — Análisis/Reportes/Equipos quedaron solo con el header nuevo, sin una métrica "ancla" sólida (no había un candidato obvio de una sola métrica dominante en esas vistas)

## ✅ Sesión 32 (3 julio 2026) — Auditoría de duplicados/basura + deploy automatizado

Pedido explícito: "auditoría para eliminar todo lo duplicado, inservible" (continuación de la
Sesión 31), seguido de varios bugs reales encontrados en el camino y, al final, un cambio de
infraestructura de deploy.

### Limpieza de duplicados (todo el codebase)
- **`maneki-premium.css`**: mismo método que Sesión 31 en `app.css` — script detecta selectores
  duplicados fuera de `@media`, se consolidó cada grupo por propiedad. 10 grupos reales
  (`table thead th`, `.mk-empty-*`, `body.dark .bg-gray-*`, `body.dark table thead th`, etc.), 3
  falsos positivos confirmados como variantes `@media` legítimas.
- **`css/app.css` vs `maneki-premium.css` (entre archivos)**: 81 selectores existían en ambos. 6
  eran duplicados byte-idénticos (borrados de `app.css`). Los otros **75 tenían valores
  DISTINTOS** — como `app.css` cargaba después, sus valores viejos (paleta morada "Maneki")
  le ganaban silenciosamente a los nuevos (paleta Bicho Capricho) en cascada, sin que se notara
  visualmente como error. Se eliminaron las 69 reglas conflictivas de `app.css` (dejando ganar
  siempre a `maneki-premium.css`), verificado con `postcss.parse()` antes de escribir.
- **`css/app.css` retirado por completo**: su contenido restante (ya sin duplicados) se fusionó
  al final de `maneki-premium.css` — mismo orden de carga, cero cambio de comportamiento, pero
  ahora hay un solo archivo fuente de verdad. `index.html`/`sw.js`/`scripts/hash-sw.js`
  actualizados para no referenciarlo.
- **JS compilado huérfano**: `js/inventory-2.js` y `js/pedidos-1.js` (sobras de antes de la
  división en archivos más chicos, Sesión previa a D26) sin `.ts` fuente ni referencia en
  `index.html`/`sw.js` — borrados junto con sus `.map`.
- Auditado también: `package.json` (4 devDependencies, todas usadas), `img/categorias/*.webp`
  (13 archivos, los 13 mapeados 1:1 en `CATEGORY_ICON_MAP`), `console.log` en `src/*.ts` (todos
  detrás de flag `MK_DEBUG` o banners de marca intencionales) — nada más que limpiar.

### Bug real: 19 íconos `fas fa-X` invisibles en toda la app
La app **no usa Font Awesome real** — nunca se cargó el CSS/font de FA en `index.html` (solo hay
un `preconnect`). El sistema real es `src/icons.ts`: un `MutationObserver` que busca
`<i class="fas fa-X">` en el DOM y le inyecta un SVG propio buscando `"fa-X"` en un diccionario
`D`. Si la clase usada no está en `D`, el `<i>` se queda vacío — un botón sin ícono, sin ningún
error en consola.

Encontrado por el usuario viendo la columna ACCIONES de Inventario: el botón "Editar" (`fa-pen`)
y "Archivar" (`fa-box-archive`/`fa-lock-open`) se veían en blanco en TODAS las filas. Auditoría
completa (`fas fa-` en `src/*.ts` + `index.html` vs. claves de `D`): 19 nombres en uso sin
definición — mezcla de nombres FontAwesome 6 que no coinciden con los FA5 ya definidos
(`fa-circle-check` vs `fa-check-circle`, etc.) y iconos nunca agregados (`fa-pen`,
`fa-box-archive`, `fa-ellipsis`, `fa-gift`, `fa-image`, `fa-envelope`, `fa-wrench`, `fa-route`,
`fa-layer-group`, `fa-list`, `fa-code-branch`, `fa-bolt`, `fa-file-pdf`, `fa-lock-open`,
`fa-clone`, `fa-xmark`, `fa-triangle-exclamation`, `fa-circle-check`, `fa-circle-xmark`).

Fix: se agregaron las 19 definiciones al diccionario `D` (rutas SVG 24×24 estilo Feather/Lucide,
mismo estilo que las 96 existentes; los que tenían equivalente semántico en FA5 reusan el mismo
path). Corrige TODAS las apariciones en la app de un solo golpe — no se tocó ningún call site.

**Guardrail nuevo:** `scripts/lint-footguns.js` ahora también valida esto en cada build
(`checkIconDictionary()`) — compara clases `fa-X` usadas contra `D` y truena el build si falta
alguna. Este bug de clase no puede volver a llegar silenciosamente a producción.

### Bug de proceso: el fix "deployado" no se veía en producción
Después de arreglar los íconos y hacer commit+push, el usuario seguía viendo el bug en
producción. Causa: el commit solo incluyó `src/icons.ts` (fuente) — el `.js` compilado real que
Coolify servía (`js/icons.js`, bundles) se quedó sin comitear en el working tree. `git status`
completo lo hubiera mostrado; el hábito de solo `git add <archivos que edité>` en vez de revisar
todo el status fue la causa raíz. Se corrigió subiendo el JS faltante, y se documentó en memoria
para no repetirlo.

### Cambio de infraestructura: deploy automatizado (Coolify Build Pack Static → Dockerfile)
Causa raíz del bug anterior, resuelta de fondo: Coolify tenía el Build Pack en **"Static"** —
copiaba los archivos del repo tal cual a un contenedor `nginx:alpine`, sin ningún paso de build.
Por eso el compilado en `js/*.js` SIEMPRE tenía que generarse local (`node scripts/build.js`) y
comitearse a mano; si se olvidaba, producción servía JS viejo sin ningún error visible.

Fix: `Dockerfile` de 2 etapas agregado al repo —
1. `node:20-alpine`: `npm ci && node scripts/build.js` (tests, footgun lint, icon lint, compila
   TS→JS, arma bundles, hashea el SW cache) — corre DENTRO del contenedor en el servidor.
2. `nginx:alpine`: sirve solo lo necesario (`index.html`, `manifest.json`, `sw.js`, `logo.png`,
   `maneki-premium.css`, `css/`, `js/`, `img/`) con la misma config de nginx que ya estaba en
   Coolify (`nginx.conf`, copiada 1:1 del panel antes de tocar nada).

Build Pack cambiado de "Static" a "Dockerfile" en Coolify (confirmado con el usuario antes de
tocar producción). Verificado: log de build en Coolify completo en verde (65 tests + lint +
34/34 TS), `curl` directo al contenedor devolvió `HTTP 200`, `pos.manekistore.com.mx` devolvió
`401` (Basic Auth normal, no error). De aquí en adelante, comitear `js/*.js` ya no es necesario
para que el fix llegue a producción — el servidor siempre reconstruye desde `src/*.ts` fresco.

### Deploy sin navegador: `deploy.ps1` + token dedicado
El usuario pidió no depender de que Claude se conecte al navegador para cada deploy (mismo
patrón ya usado en el proyecto Dungeon). Se creó un token de API en Coolify ("BICHO-POS",
permisos `deploy`+`read`, sin expiración) guardado como variable de entorno de usuario
`COOLIFY_BICHOPOS_TOKEN` (nunca en el repo), y `deploy.ps1` en la raíz del proyecto: `git push`
+ `POST /api/v1/deploy` a la API de Coolify + verificación con `curl`. Uso:
`.\deploy.ps1 "mensaje del commit"`.

### Changelog de la app actualizado
El modal "¿Qué hay de nuevo?" (`src/init.ts`, función `_changelog`) es una lista mantenida a
mano — se había quedado desactualizada durante toda la sesión. Se actualizó a v2.7.0
(`window.MK.version` en `config.ts`) con los 4 cambios visibles de esta sesión. **Recordatorio
para el futuro:** actualizar esta lista + bump de versión en cada sesión con cambios visibles
para el usuario, no solo al final de rediseños grandes.

### Auditoría de los 23 modales de la app
Los modales quedaron fuera del rediseño de Sesión 31 (evaluado el reflow a 2 columnas del modal
de Pedido y descartado por riesgo). Se hizo un inventario completo de los 23 modales
(`index.html`) para decidir con el usuario qué valía la pena arreglar sin ese riesgo:

- **`backupModal` y `configAnillosModal` usaban `style="display:none;position:fixed..."` a mano**
  en vez de `class="modal"` — la diferencia NO era solo de código: `.modal.active` en
  `maneki-premium.css` da el fondo verde bosque de marca + animación de entrada
  (`mkModalBgIn`/spring en el contenido); estos dos con estilo inline tenían fondo negro genérico
  SIN animación. Fix: `class="modal"` en el HTML + las funciones de abrir/cerrar
  (`abrirModalBackup`/`cerrarBackupModal` en `backup.ts`, `abrirConfigAnillos`/`cerrarConfigAnillos`
  en `envios.ts`) cambiaron de `.style.display` a `.classList.add/remove('active')`.
- **Emoji decorativos → íconos SVG** en labels de modales (🏷️→`fa-tag`, ⚠️→`fa-triangle-exclamation`,
  📦→`fa-box`, 📝→`fa-edit`, 🔔→`fa-bell` [nuevo en el diccionario `D` de `icons.ts`],
  💡→`fa-percentage`, 🔧→`fa-wrench`, 🗺️→`fa-route`). **NO se tocaron** los emoji que son parte del
  *contenido* de un mensaje (los botones de plantilla de WhatsApp en el modal de Pedido, ej.
  `data-arg="🎁 Como regalo"` — esos emoji se insertan literalmente en el texto que lee el
  cliente) ni el selector de estado del pedido (✅💰🔧📦🚚🏪🎉❌ — grande, colorido, funciona bien
  como está, cambiarlo a íconos monocromáticos hubiera sido un downgrade visual).
- **Accesibilidad:** `role="dialog" aria-modal="true"` agregado a los 25 `class="modal"`, y
  `aria-label="Cerrar"` a los botones de cerrar que solo tenían un símbolo (×/✕/&times;) sin
  texto — antes no tenían forma de que un lector de pantalla anunciara su propósito.
- **Selector de emoji+color duplicado 3 veces (Categoría nueva/editar, Equipos) — arreglado**
  (ver detalle abajo, "Dedup del selector de emoji/color").
- **Modal de Pedido — agrupado en 3 secciones plegables** (`<details open class="mk-pedido-section">`,
  nativo HTML, sin JS nuevo): Cliente / Productos / Detalles y pago. Todas quedan `open` por
  defecto — el comportamiento visual es idéntico a antes salvo el separador visual y la
  posibilidad de colapsar; cero riesgo de romper validación de campos requeridos o lógica JS
  existente porque ningún `id` ni estructura interna se tocó, solo se envolvió en `<details>`.

### Dedup del selector de emoji/color (lo que se había pospuesto — arreglado después)
El usuario pidió explícitamente arreglar esto tras verlo pospuesto en el punto anterior. Había
3 copias del selector de emoji (categoría nueva, categoría editar, equipos) y 2 copias del
selector de color (categoría nueva, categoría editar) — mismo patrón visual, misma lógica de
resaltado, cada una con su propia función global casi idéntica.

**Cómo se dedupeó sin tocar el HTML ni los nombres de función que usan `onclick`/`data-oninput`
en `index.html`:** se extrajeron 3 funciones genéricas y parametrizadas en `app-data.ts`
(`_renderEmojiPickerGrid(gridId, cats, keywordMap, filter, btnClass, onSelectFnName)`,
`_selectEmojiGeneric(emoji, hiddenId, displayId, btnClass)`,
`_selectColorGeneric(color, hiddenId, btnClass)`). Las 8 funciones globales originales
(`renderEmojiGrid`/`selectEmoji`/`filterEmojis`, `renderEditEmojiGrid`/`selectEditEmoji`/
`filterEditEmojis`, `renderEquipoEmojiGrid`/`selectEquipoEmoji`/`filterEquipoEmojis`,
`selectCategoryColor`, `selectEditColor`) siguen existiendo con el mismo nombre, pero ahora son
wrappers de una línea que llaman al motor genérico con su propia configuración (grid, IDs,
diccionario de búsqueda, clase de botón). El HTML en `index.html` no cambió ni una letra —
cero riesgo ahí. `app-data.ts` carga antes que `categorias.ts` en `core.bundle.js` (orden de
`scripts/build.js`), así que las funciones genéricas están disponibles quando `categorias.ts`
las usa — mismo patrón cross-file que ya existía (`categorias.ts` ya leía `emojiCategories`,
definido en `app-data.ts`, antes de este cambio).

**Efecto colateral bueno, no buscado:** el diccionario de búsqueda por palabra clave del picker
de "editar categoría" tenía solo 6 entradas (copy-paste incompleto de hace tiempo) contra las 15
entradas del de "nueva categoría" — al unificar ambos bajo `CATEGORY_EMOJI_KEYWORDS` (la lista
completa de 15), buscar emoji al editar una categoría ahora encuentra tantos resultados como al
crear una nueva. No se buscaba este fix, salió gratis de la unificación.

Verificado: build completo en verde (65 tests + lint + 34/34 TS), y los bundles se hicieron más
chicos (`core.bundle.js` -1.3 KB, `inventario.bundle.js` -1.7 KB) — confirma que sí se eliminó
código real, no solo se movió.

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

### Nota: la clase de bug F1/B5 — ✅ ahora guardada por el linter

`eliminarVentaHistorial` confirmó que el patrón "quitar de array local sin DELETE en BD" reaparece
en flujos nuevos (4 sesiones: S18/S24/S25/S26). Ver [[project_upsert_delete_incomes]]. **Resuelto a
nivel guardrail:** se añadió la regla `upsert-sin-delete` a `scripts/lint-footguns.js` (Step 0b) que
rompe el build si una reasignación `X = X.filter(`/`X.splice(` sobre un array relacional no lleva un
`delete*` (o `.delete()`) en su ventana de contexto. Detalle en la tabla del guardrail más abajo.

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
| `upsert-sin-delete` | `X = X.filter(` / `X.splice(` sobre array relacional (`incomes`/`expenses`/`salesHistory`/`pedidos`/`pedidosFinalizados`/`clients`, con o sin `window.`) sin un `delete*` cerca | acompañar con `deleteIncomeFromDB` / `deleteIncomesByFolio` / `deleteExpenseFromDB` / `deleteSalesHistoryEntry` / `deletePedidoActivo` / `deletePedidoFinalizado` / `deleteClientFromDB` o `.delete()` directo |

- **Salta comentarios** (`//`, `*`, `/*`)
- **Ventana de contexto ±1 línea** por defecto para fallbacks multilinea guardados; las reglas pueden ampliarla con `windowBack`/`windowFwd` (p.ej. `upsert-sin-delete` mira 8 atrás / 12 adelante, porque el `delete*` casi siempre va varias líneas DESPUÉS del filtro). El backref `\2` exige el mismo array a ambos lados del `=`, así una lectura `const ids = salesHistory.filter(...)` no dispara. El `delete*` puede ser un helper de `db.ts`, un `.delete()` de Supabase, o el id acumulado en un `_ids*` para borrado en lote.
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

> ⚠️ **Nota de marca vs. infraestructura:** la app se llama "Bicho Capricho POS" para el usuario final (nombre, colores, tipografía — Sesión 28), pero el repo, dominio, VPS y proyecto Supabase **siguen con el nombre `maneki`** — son identificadores de infraestructura, no se renombraron (renombrar dominio/repo es una operación aparte, no pedida). No confundir "la app ya no dice Maneki en ningún lado" con "la infraestructura se renombró".

| Campo | Valor |
|-------|-------|
| Proyecto local | `F:\PROYECTOS\MANEKI ECOSISTEMA\mi-punto-de-venta` |
| GitHub | https://github.com/Mordredgh/maneki-pos.git |
| Web (Coolify) | https://pos.manekistore.com.mx |
| VPS | 195.26.247.101 |
| Auth | nginx Basic Auth (host-level, no en contenedor), usuario `manekimaster` |
| Supabase | https://hoqcrljgmamaumtdrtzi.supabase.co — ⚠️ **compartido con la web pública de Bicho Capricho** (proyecto Lovable/React aparte). Cambios de RLS en tablas que el POS usa (`store`, `products`, y potencialmente otras) afectan a ambos consumidores de la misma `anon key`. Ver Sesión 28 para el incidente donde otra sesión cerró `anon` en `store`/`products` para proteger la web y rompió el guardado del POS. |
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

> Ver AGENTS.md en la raiz de este repo — reglas compartidas entre Claude, Codex y Antigravity (mapa de codigo graphify, cuando actualizarlo).
