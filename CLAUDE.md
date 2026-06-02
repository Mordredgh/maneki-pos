# Maneki POS — Web App (Coolify)

> **Última actualización:** 2 junio 2026 — Sesión 4 (Auditoría #1 + Auditoría #2 + Fixes)
> **Versión app:** 2.2.0 | **Service Worker:** v2.3.2 | **Branch:** fresh-start → master

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
// ⚠️  invalidar con _allVentasCache = null después de mutaciones en salesHistory

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

---

## 🚨 PENDIENTES — Próxima Sesión (Auditoría #2)

### BUGS A CORREGIR

#### BUG-1 🟠 — Código Electron TODAVÍA presente en config.ts
**Archivo:** `src/config.ts:593, 664, 693, 703`
```javascript
// 4 restos de Electron — nunca se ejecutan pero confunden:
try { if (typeof ipcRenderer !== 'undefined' && ipcRenderer) ipcRenderer.send('splash-progress'...) } catch(e) {}
try { if (typeof ipcRenderer !== 'undefined') ipcRenderer.send('splash-done'); } catch(e) {}
try { if (typeof require !== 'undefined') require('electron').ipcRenderer.send('notify-connection'...); } catch(e) {}
```
**Fix:** Eliminar las 4 líneas completamente.

#### BUG-2 🟠 — `splashProgress()` función fantasma en initApp()
**Archivo:** `src/config.ts:588-593`
```javascript
function splashProgress(step, label) {
    try {
        if (typeof ipcRenderer !== 'undefined' && ipcRenderer)
            ipcRenderer.send('splash-progress', { step, total: 6, label });
    } catch (e) {}
}
// Se llama 6 veces: splashProgress(0,'Conectando...') hasta splashProgress(6,'¡Listo!')
// NUNCA hace nada en web. Eliminar la función y sus 6 invocaciones.
```
**Fix:** Eliminar `splashProgress()` y sus 6 llamadas en `initApp()`.

#### BUG-3 🔴 — `_allVentasCache` NO se invalida desde pedidos-2
**Archivo:** `src/pedidos-2.ts:1003, 789`
```javascript
// ❌ ESTO NO FUNCIONA — _allVentasCache es let local en reportes.ts, no global
if (typeof _allVentasCache !== 'undefined') _allVentasCache = null;
```
`_allVentasCache` es una variable `let` privada en `reportes.ts`. Desde `pedidos-2.ts`,
`typeof _allVentasCache` siempre devuelve `'undefined'` — NUNCA se invalida.
**Fix:** En `reportes.ts`, exponer una función global:
```javascript
window._invalidarCacheVentas = function() { _allVentasCache = null; _allVentasCacheKey = ''; };
```
Y en `pedidos-2.ts` (líneas 789 y 1003), reemplazar con:
```javascript
if (typeof window._invalidarCacheVentas === 'function') window._invalidarCacheVentas();
```

#### BUG-4 🟠 — `guardarDatos` referenciada pero no definida
**Archivo:** `src/pedidos-2.ts:1029`
```javascript
guardarDatos ? guardarDatos() : savePedidos(); // ❌ guardarDatos nunca se define
```
**Fix:** Eliminar el ternario y usar directamente `savePedidos()`:
```javascript
savePedidos();
```

#### BUG-5 🟠 — Doble conteo en historial de cliente (`totalAbonos`)
**Archivo:** `src/config.ts:44-47`
```javascript
// Los abonos ya están incluidos en totalPedidos (via p.total)
const totalGastado = totalVentas + totalPedidos + totalAbonos; // ❌ totalAbonos duplica
```
**Fix:**
```javascript
const totalGastado = totalVentas + totalPedidos; // abonos ya están en totalPedidos
```

#### BUG-6 🟠 — URL sin sanitizar en onclick de galería de fotos
**Archivo:** `src/pedidos-3.ts:1065`
```javascript
// url puede contener ' y romper el onclick
urls.map(url => '<img ... onclick="window.open(\''+url+'\',\'_blank\')"...')
```
**Fix:** Usar `data-url` + event listener, o escapar:
```javascript
const _safeUrl = url.replace(/'/g, '%27').replace(/"/g, '%22');
'<img ... onclick="window.open(\''+_safeUrl+'\',\'_blank\')"...'
```

#### BUG-7 🟠 — `_descontarEmpaquesInventario` rollback no revierte variantes
**Archivo:** `src/pedidos-2.ts:178-203`
El rollback de empaques solo guarda `mp.stock` pero NO guarda `variantsBefore`.
Si el empaque tiene variantes, el stock de variantes queda corrompido al hacer rollback.
**Fix:** Espejo exacto de `_descontarInventarioPedido` — guardar también `variantsBefore`:
```javascript
const stockOriginal = [];
for (const emp of empaques) {
    const mp = ...;
    stockOriginal.push({
        mp,
        antes: mp.stock || 0,
        variantsBefore: Array.isArray(mp.variants) && mp.variants.length > 0
            ? mp.variants.map(v => ({...v}))
            : null
    });
    mp.stock = Math.max(0, (mp.stock || 0) - qty);
}
// En el catch del rollback:
stockOriginal.forEach(({ mp, antes, variantsBefore }) => {
    mp.stock = antes;
    if (variantsBefore && Array.isArray(mp.variants)) {
        variantsBefore.forEach((snap, i) => { if (mp.variants[i]) mp.variants[i].qty = snap.qty; });
    }
});
```

---

### SEGURIDAD A CORREGIR

#### S1 🔴 — XSS en `proveedorUrl` dentro de onclick (single quote)
**Archivo:** `src/inventory-5.ts:322`
```javascript
// ❌ _esc() NO escapa single quotes — el onclick puede quebrarse
`<button onclick="window.open('${_esc(product.proveedorUrl)}','_blank')"...`
```
**Fix:** Usar `data-url` approach:
```javascript
`<button onclick="window.open(this.dataset.url,'_blank')" data-url="${_esc(product.proveedorUrl)}"...`
```

#### S2 🟡 — Telegram Bot Token en plaintext en Supabase
`storeConfig.telegramBotToken` va a la tabla `store` como string plano.
No hay fix sin un backend proxy. **Acción:** Confirmar que RLS esté activo en tabla `store`.

#### S3 🟡 — 13+ `catch(e) {}` silenciosos en db.ts
`saveClients`, `saveIncomes`, `saveExpenses` tienen `catch(e){}` vacíos — errores de Supabase invisibles para el usuario.
**Fix parcial:** Agregar al menos `console.warn('[save] error:', e?.message)` en cada catch vacío relevante.

---

### PERFORMANCE A OPTIMIZAR

#### P1 🟡 — `verificarConexionSupabase()` ping cada 30s (excesivo)
**Archivo:** `src/config.ts:710`
```javascript
window._sbCheckInterval = setInterval(verificarConexionSupabase, 30000);
// Esto hace SELECT cada 30s = ~2,880 queries/día solo para verificar conexión
```
**Fix:** Reducir a 5 minutos (300,000ms) o eliminar — Supabase Realtime ya notifica desconexiones:
```javascript
window._sbCheckInterval = setInterval(verificarConexionSupabase, 5 * 60 * 1000);
```

#### P2 🟡 — `_allVentasCache` key insuficiente
**Archivo:** `src/reportes.ts:17`
```javascript
const cacheKey = `${sh.length}_${pf.length}`; // solo cuenta elementos, no detecta ediciones
```
**Fix:** Incluir suma de totales como proxy de cambio:
```javascript
const cacheKey = `${sh.length}_${pf.length}_${pf.reduce((s,p)=>s+Number(p.total||0),0).toFixed(0)}`;
```

#### P3 🟡 — 4 familias de Google Fonts (4 round-trips)
Outfit + Cormorant Garamond + Space Grotesk + DM Mono en `index.html <head>`.
Cormorant Garamond solo se usa en `h1, h2, .brand-serif` — prácticamente no visible en la app de gestión.
**Fix nice-to-have:** Eliminar Cormorant Garamond del `<link>` de Google Fonts y de `styles.css`:
```css
/* Eliminar esta regla: */
h1, h2, .brand-serif { font-family: 'Cormorant Garamond', serif; }
```

#### P4 🟡 — Skeleton screens no usadas automáticamente
`_mkSkeletonRows(cols, rows)` existe en `init.ts` pero ninguna tabla la usa al cargar datos.
`initApp()` carga 14 promises en paralelo mostrando tablas vacías 1-3 segundos.
**Fix nice-to-have:** Inyectar skeletons en `renderInventoryTable`, `renderPedidosTable`, `renderClientsTable` antes de recibir datos.

---

### DEUDA TÉCNICA A LIMPIAR

#### D1 🟡 — `netlify.toml` sigue en raíz (legacy)
Archivo del deploy antiguo en Netlify. El deploy actual es Coolify.
**Fix:** Eliminar el archivo `netlify.toml`.

#### D2 🟡 — `MK.version = '4.1'` no coincide con versión del proyecto
**Archivo:** `src/config.ts:868`
El namespace MK dice `'4.1'`, `package.json` dice `'2.2.0'`, el changelog dice `'2.1.0'`.
**Fix:** Unificar a `window.MK.version = '2.2.0'`.

#### D3 🟡 — Dos sistemas CSS en conflicto (`:root` duplicado)
`styles.css` y `maneki-premium.css` definen las mismas variables CSS con valores distintos:
- `--mk-purple-500`: `#9B7BC4` (lila pastel en styles.css) vs `#7C3AED` (morado intenso en premium)
- `--spring`, `--out`, `--snap`, `--ease`: mismos valores (inofensivos pero redundantes)
- Sidebar: `styles.css` crema/dorado vs `maneki-premium.css` morado oscuro (gana premium por ID specificity)
**Fix:** Agregar comentario en `styles.css` documentando que `maneki-premium.css` sobreescribe el sidebar vía `#sidebar` (ID specificity > class).

#### D4 🟡 — `saveToLocalStorage()` no-op sin advertencia
**Archivo:** `src/db.ts:736`
```javascript
function saveToLocalStorage(key, data) {} // no-op intencional pero silencioso
```
**Fix:** Agregar log en development:
```javascript
function saveToLocalStorage(key, data) {
    // No-op intencional: Supabase + localStorage via sbSave() son los canales de persistencia.
    // Esta función existe por compatibilidad con código legacy que la llamaba directamente.
}
```

#### D5 🟡 — `catch(e) {}` en saveIncomes, saveExpenses, saveClients silencia errores
**Archivo:** `src/db.ts:972, 1015, 1029`
```javascript
} catch(e){} // ← el usuario nunca sabe que falló el guardado
```
**Fix:** Al menos loggear:
```javascript
} catch(e){ console.warn('[saveIncomes] Error al guardar en Supabase:', e?.message); }
```

---

### UX / DISEÑO NICE-TO-HAVE

#### U1 🟡 — Mobile: Bottom nav sin labels de texto
5 íconos sin texto en mobile. Para usuarios nuevos es confuso.
**Fix:** Agregar `<span>` pequeño debajo de cada ícono en `#mobileBottomNav`.

#### U2 🟡 — Skeleton screens en carga inicial
Ver P4 arriba — implementar `_mkSkeletonRows` en las 3 tablas principales.

#### U3 🟡 — Kanban sin paginación (todos los pedidos a la vez)
Con 50+ pedidos activos, las 6 columnas cargan todos los cards con imágenes y event listeners.
**Fix nice-to-have:** Mostrar máx 10 cards por columna con "Ver más" al final.

#### U4 🟡 — Swipe gesture para sidebar en mobile
El hamburger es el único mecanismo. En mobile es más natural hacer swipe desde el borde.
**Fix nice-to-have:** Agregar touch event listener para swipe derecho > 50px desde borde izquierdo.

#### U5 🟡 — PWA: install prompt no implementado
El SW y manifest están listos pero no hay listener para `beforeinstallprompt`.
**Fix nice-to-have:**
```javascript
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._installPrompt = e;
    // Mostrar banner discreto después de 3 visitas
});
```

---

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| Proyecto local | `F:\PROYECTOS\MANEKI ECOSISTEMA\mi-punto-de-venta` |
| GitHub | https://github.com/Mordredgh/maneki-pos.git |
| Web (Coolify) | https://pos.manekistore.com.mx |
| VPS | 195.26.247.101 |
| Auth | nginx Basic Auth |
| Supabase | https://hoqcrljgmamaumtdrtzi.supabase.co |

---

## Cómo Empezar una Nueva Sesión

1. Leer este CLAUDE.md completo
2. Correr `git status` para ver el estado actual del branch
3. Si hay cambios recientes: `git log --oneline -5` para ver el historial
4. Revisar la sección **PENDIENTES** arriba para saber qué atacar
5. Al compilar TS siempre usar: `npx esbuild src/X.ts --outfile=js/X.js --sourcemap --target=es2020 --minify`
6. Al terminar: `git push github fresh-start:master`
