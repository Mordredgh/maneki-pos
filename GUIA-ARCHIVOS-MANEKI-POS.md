# 📘 GUÍA DE ARCHIVOS Y REGISTRO DE BUGS — MANEKI POS
> Última actualización: 2026-03-06 (Chat 6)
> Sistema: Maneki Store POS v3.0 · Electron + Supabase + SQLite

---

## 🗂️ ÍNDICE

1. [Arquitectura general](#arquitectura)
2. [Mapa de archivos y funciones](#archivos)
3. [Registro de bugs](#bugs)
4. [Registro de mejoras](#mejoras)
5. [Tabla resumen](#tabla)
6. [Notas críticas para desarrollo futuro](#notas)
7. [Nice to have — Backlog de mejoras](#nth)
8. [Bugs pendientes de resolver](#pendientes)

---

## 🏗️ ARQUITECTURA GENERAL

**Maneki POS** es una app Electron de escritorio con persistencia dual:

| Capa | Tecnología | Función |
|---|---|---|
| Frontend | HTML + Tailwind + JS vanilla | Interfaz de usuario |
| Persistencia local | SQLite (via IPC) | Cache offline, velocidad |
| Persistencia cloud | Supabase (PostgreSQL) | Sync multi-dispositivo |
| Realtime | Supabase Realtime (WebSocket) | Actualizaciones en vivo |
| Imágenes | Supabase Storage | Bucket `product-images` |

### Modelo de datos — Tablas Supabase

| Tabla | Tipo | Descripción |
|---|---|---|
| `store` | Key-value (legacy) | Blobs JSON para arrays principales |
| `products` | Relacional | Inventario de productos |
| `orders` | Relacional | Pedidos activos |
| `orders_finalizados` | Relacional | Pedidos completados |
| `sales_history` | Relacional | Historial de ventas POS |

### Orden de carga de scripts (index.html)

```
db.js → app-data.js → equipos.js → config.js → dashboard.js → pos.js
→ inventory.js → balance.js → clientes.js → categorias.js → reportes.js
→ envios.js → ui-extras.js → whatsapp.js → backup.js → design-system.js
```

> ⚠️ **Crítico:** `config.js` se carga antes de `clientes.js`. Si `clientes.js` tiene un error de sintaxis, `setupClientSearch()` no estará definida cuando `initApp()` la llame. El fix en `config.js` protege esta llamada con un guard `typeof`.

---

## 📁 MAPA DE ARCHIVOS Y FUNCIONES

---

### `js/db.js` · v4 · 2026-03-06
**Rol:** Capa de persistencia. Conexión Supabase, Realtime, SQLite, imágenes, modales globales.

| Función | Descripción |
|---|---|
| `_setupRealtime()` | Inicia canal WebSocket para live sync. Escucha tabla `store` con debounce 800ms |
| `_rtInPlace(arr, fresh)` | Actualiza arrays in-place para preservar referencias de otras variables |
| `_applyRTDesktop(key)` | Recibe cambio Realtime de `store`, recarga de Supabase y dispara re-render del módulo correspondiente |
| `_comprimirFile(file)` | Comprime imagen File a máx 1200px / calidad 0.82 con Canvas antes de subir |
| `_comprimirBase64(dataUrl)` | Comprime imagen base64 a máx 1200px / calidad 0.82 |
| `subirImagenStorage(file)` | Sube imagen comprimida a Supabase Storage. Fallback offline a base64 (400px) |
| `_migrarBase64AStorage(p)` | Migra imágenes base64 antiguas al bucket. Usa `atob()` para decodificar |
| `_calcStockParaSupabase(p)` | Calcula stock total sumando variantes para tabla relacional `products` |
| `sbSave(key, data)` | Guarda en Supabase tabla `store` (upsert por key) y en SQLite local |
| `sbLoad(key, def)` | Carga desde SQLite (cache) o Supabase. Retorna `def` si no existe |
| `sbSaveConFeedback(key, data, nombre)` | Wrapper de sbSave con toast de confirmación |
| `saveProducts()` | Guarda en `store` Y en tabla relacional `products` vía `_calcStockParaSupabase` |
| `savePedidos()` | Guarda en `store` Y en tabla relacional `orders` |
| `savePedidosFinalizados()` | Guarda en `store` Y en `orders_finalizados` |
| `saveSalesHistory()` | Guarda en `store` Y en `sales_history` |
| `saveClients()` / `saveIncomes()` / `saveExpenses()` / `saveQuotes()` etc. | Helpers de persistencia para cada colección |
| `registrarMovimiento(productoId, nombre, tipo, cantidad, motivo)` | Registra en `stockMovimientos[]` con fecha/hora |
| `getNextFolio(tipo)` | Genera folio secuencial (PE-XXXX, POS-XXXX). Usa `.maybeSingle()` — no error 406 |
| `encolarVentaOffline(saleRecord)` | Guarda venta en SQLite pendiente cuando no hay conexión |
| `sincronizarPendientes()` | Al reconectar: sube ventas offline y sincroniza claves pendientes |
| `openModal(idOrEl)` / `closeModal(idOrEl)` | Control global de modales con clase `.active` |
| `actualizarIndicadorConexion(online)` | Actualiza badge Supabase en sidebar |
| `verificarEspacioAlmacenamiento()` / `mostrarEstadoAlmacenamiento()` | Uso del bucket de Storage |

---

### `js/app-data.js` · v3 · 2026-03-06
**Rol:** Variables globales, datos por defecto, funciones compartidas de Balance y UI general.

**Arrays globales principales:**
```
categories, products, clients, salesHistory, quotes,
incomes, expenses, receivables, payables, pedidos,
pedidosFinalizados, stockMovimientos, gastosRecurrentes,
notas, equipos, roiHistorial, roiConfig, envioAnillos
```

| Función | Descripción |
|---|---|
| `deleteBalanceItem(type, id)` | Elimina ingreso o egreso manual con confirmación |
| `editBalanceItem(type, id)` | Abre modal de transacción pre-cargado con datos existentes |
| `closeTransactionModal()` | Cierra modal de transacción manual |
| `openCancelPedidoModal(pedidoId)` / `confirmarCancelPedido()` | Control del modal de cancelación de pedidos |
| `switchLogoTab(tab)` / `handleLogoUpload(input)` / `removeLogo()` | Gestión del logo de tienda |
| `renderEmojiGrid(filter)` / `selectEmoji(emoji)` / `filterEmojis(value)` | Picker de emojis para productos |
| `renderEquipoEmojiGrid(filter)` / `selectEquipoEmoji(emoji)` | Picker de emojis para equipos |
| `openAddCategoryModal()` | Abre modal de nueva categoría |
| `toggleDarkMode()` / `applyDarkMode(enabled)` | Control de modo oscuro |
| `refrescarPagina()` | Recarga la aplicación |

> **BUG-S12 FIX (Chat 4):** Al convertir cotización en pedido, `fechaCreacion` y `fechaEntrega` usan fecha local.

---

### `js/config.js` · v4 · 2026-03-06
**Rol:** Historial de clientes, configuración de tienda, inicialización de la app (`initApp`).

| Función | Descripción |
|---|---|
| `openClientHistory(clientId)` | Modal con historial completo: ventas POS, pedidos, saldo pendiente, top productos |
| `closeClientHistoryModal()` / `switchHistoryTab(tab)` | Control del modal de historial |
| `saveStoreConfig()` | Guarda configuración de la tienda en Supabase |
| `updateSidebarLogo()` / `renderBienvenida()` / `loadStoreConfigUI()` | UI de configuración de tienda |
| `updateStorePreview()` | Actualiza preview en tiempo real |
| `renderTagsSeleccionados(tags)` / `toggleTagPredefinido(tag)` / `agregarTagCustom()` / `eliminarTag(tag)` | Gestión de tags de productos |
| `setTipoProducto(tipo)` | Alterna entre producto terminado / materia prima / servicio |
| `toggleKitSection()` / `poblarKitSelect()` / `agregarComponenteKit()` / `renderKitComponentesList()` / `eliminarComponenteKit(i)` | Gestión de kits de productos |
| `imprimirInventario()` | Abre ventana de impresión HTML del inventario |
| `initApp()` | **Función principal de arranque.** Carga datos, sincroniza `window.*`, inicia Realtime, llama renders iniciales |

> ⚠️ **BUG-011-PROD FIX:** `setupClientSearch()` se llama con guard `typeof` en línea 629.
> **BUG-S04 FIX (Chat 4):** `poblarKitSelect()` — typo `tipo === 'materia'` → `tipo === 'materia_prima'`; dropdown de kits ya muestra las materias primas.
> **BUG-S05 FIX (Chat 4):** Morning briefing (hoy/ayer) y `quoteValidUntil` usan fecha local.

---

### `js/dashboard.js` · v4 · 2026-03-06
**Rol:** KPIs principales, alertas de entregas, badges de sidebar, reloj en vivo.

| Función | Descripción |
|---|---|
| `animarNumero(el, desde, hasta, dur, prefijo, sufijo)` | Anima un número en el DOM con easing cúbico. Cancela animación previa en el mismo elemento |
| `updateDashboard()` | Wrapper con throttle de 150ms — evita renders en paralelo |
| `_updateDashboardImpl()` | Calcula todos los KPIs del dashboard en una sola ejecución |
| `checkAlertasEntregas()` | Muestra banner de pedidos con entrega en ≤2 días |
| `cerrarAlertaEntregas()` | Cierra el banner de alertas |
| `actualizarSidebarBadges()` | Contadores en sidebar: pedidos activos (rojo/ámbar) e inventario bajo stock |
| `checkPedidosSinMovimiento()` | Detecta pedidos activos sin cambio de estado en ≥3 días y muestra banner |

**KPIs que calcula `_updateDashboardImpl()`:**
Ventas del día, ganancia neta, meta mensual con barra, stock bajo con días estimados (ventas últimos 30 días), cuentas por cobrar, pedidos activos, entregas próximas 7 días, pedidos por estado, comparativa mes actual vs anterior, top 5 materiales usados en pedidos finalizados.

> **BUG-015 FIX (Chat 3):** SyntaxError por bloque `accountsReceivable` duplicado.
> **BUG-016 FIX (Chat 3):** `console.table` de pedidos eliminado de producción.

---

### `js/pos.js` · v2 · 2026-03-05
**Rol:** Punto de Venta — catálogo, carrito, cobro, recibos y cotizaciones.

Funciones principales: `renderProducts()`, `renderPosCategoryTabs()`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `finalizarVenta()`, `generateReceipt()`, `generateQuoteDocument()`, `renderCart()`.

> **BUG-004 FIX:** Filtra `p.tipo !== 'materia_prima' && p.tipo !== 'servicio'`.
> **BUG-007/013 FIX:** IDs con `crypto.randomUUID()`.
> **BUG-014 FIX:** `_esc()` en todos los campos de usuario en recibos y cotizaciones.

---

### `js/inventory.js` · v4 · 2026-03-06
**Rol:** Gestión de inventario — CRUD de productos, variantes, kits, materias primas, movimientos de stock, tienda web.

Funciones principales: `renderInventoryTable()`, `renderProducts()`, `openAddProductModal()`, `saveProduct()`, `deleteProduct()`, `ajustarStock()`, `renderMovimientos()`, `renderCategoriasInventario()`.

> **BUG-012 FIX:** `stockMovimientos.slice(-500)` conserva los 500 más recientes.
> **BUG-026 FIX (Chat 3):** `producto_interno` visible en tabla Productos Terminados — filtros incluyen `p.tipo === 'producto_interno'`.
> **BUG-S02 FIX (Chat 4):** `descontarMpPorVenta` aplica también a `producto_interno`.

---

### `js/pedidos.js` · v4 · 2026-03-06
**Rol:** Pedidos por encargo — kanban, tabla, creación, edición, cobros, finalización, historial.

Funciones principales: `renderPedidosTable()`, `renderKanban()`, `crearPedido()`, `editarPedido()`, `guardarCambiosPedido()`, `finalizarPedido()`, `confirmarAbonoPedido()`, `renderHistorialPedidos()`, `openPedidoStatusModal()`, `generarFolioPedido()`, `normalizarResta()`, `updatePedidosStats()`.

> **BUG-005 FIX:** `folioCounter` usa `.maybeSingle()`.
> **BUG-006 FIX:** Abonos se registran en `incomes[]` y `salesHistory[]`.
> **MEJORA-01:** Al finalizar un pedido: push a `salesHistory[]` con `type:'pedido'` y deduplicación por folio.
> **BUG-018 FIX (Chat 3):** `fechaFinalizado` usa fecha local, no UTC.
> **BUG-019 FIX (Chat 3):** Modal — fecha y entrega default usan fecha local.
> **BUG-S06 FIX (Chat 4):** `updatePedidosStats()` excluye pedidos cancelados de "Por cobrar" y "Anticipos".

---

### `js/balance.js` · v4 · 2026-03-06
**Rol:** Balance financiero mensual — ingresos, egresos, neto, movimientos de stock.

Funciones principales: `renderBalance()`, `renderBalanceMensual()`, `cambiarMesBalance(dir)`, `renderMovimientos()`, `toggleMovimientos()`, `limpiarMovimientos()`, `eliminarPedidoFinalizado(folio)`, `markAsPaid()`.

> **BUG-011 FIX:** IDs con `crypto.randomUUID()`.
> **MEJORA-02:** `renderBalanceMensual()` usa `pedidosFinalizados[]` filtrados por `fechaFinalizado`.
> **MEJORA-03:** `renderBalance()` suma POS + pedidos finalizados + ingresos manuales sin duplicar.
> **BUG-020 FIX (Chat 3):** Anticipos sintéticos excluidos del total POS.
> **BUG-021 FIX (Chat 3):** `markAsPaid` usa fecha local.
> **BUG-022 FIX (Chat 3):** `eliminarPedidoFinalizado` limpia orphan incomes por folio.
> **BUG-S07 FIX (Chat 4):** `renderBalanceMensual` excluye `type:'abono'` y `type:'anticipo'` de ventas POS.
> **BUG-S08 FIX (Chat 4):** `rec.amount` y `pay.amount` con guard `Number(||0)` antes de `.toFixed()`.

---

### `js/reportes.js` · v4 · 2026-03-06
**Rol:** Estadísticas históricas — comparativa de meses, top productos, categorías, top clientes, historial con filtros.

Funciones principales: `updateMonthlyStats()`, `initComparativaMeses()`, `initTopProductosChart()`, `renderTopProducts()`, `initCategoryChart()`, `renderSalesHistory()`, `renderTopClientes()`, `renderValorInventario()`, `filtrarProductosPedido()`.

> **MEJORA-04:** Todas las métricas unifican `salesHistory[]` + `pedidosFinalizados[]` históricos.
> **BUG-S03 FIX (Chat 4):** Todos los filtros de ventas excluyen `type:'anticipo'` — evita que anticipos sintéticos inflen estadísticas.
> **BUG-S04 FIX (Chat 4):** `s.total` con guard en exportación CSV — no crashea si total es null/undefined.
> **BUG-S09 FIX (Chat 4):** `renderValorInventario` — typo `'materia'` → `'materia_prima'`; ahora excluye también servicios.
> **BUG-S10 FIX (Chat 4):** `filtrarProductosPedido` — mismo typo corregido; servicios ya no aparecen en el selector de productos de pedidos.

---

### `js/design-system.js` · v4 · 2026-03-06
**Rol:** Efectos visuales, animaciones, Web Worker para `renderAnalisis`, patching de funciones en runtime.

> ⚠️ **Patrón especial:** Este archivo **sobreescribe funciones de otros módulos** mediante polling en `setInterval`. Al encontrar `window.renderAnalisis`, `window.renderProducts`, etc., los reemplaza con versiones mejoradas con Web Workers y animaciones.

Comportamientos principales:
- `_ssPoll` — espera y parchea `renderAnalisis` con versión Web Worker
- `_ppPoll` — parchea `renderProducts` con efecto confetti al vender
- `_raPoll` — sobreescribe `window.renderAnalisis` con datos correctos
- `_actPoll` — activa animaciones KPI al cargar dashboard
- Worker interno — procesa `salesHistory` + `pedidosFinalizados` para tabla de análisis y ABC

> ⚠️ **Regla crítica:** Si se modifica `renderAnalisis()` en `reportes.js` y se agregan nuevos datos, **también actualizar el `postMessage` en `design-system.js`** (~línea 628). De lo contrario el cambio no tendrá efecto porque esta versión reemplaza la de reportes.js.
> **MEJORA-05 FIX:** `postMessage` incluye `pedidosFinalizados`.
> **BUG-S11 FIX (Chat 4):** Worker excluye `type:'anticipo'` — anticipos sintéticos ya no inflan top productos ni análisis de ventas.

---

### `js/clientes.js` · v4 · 2026-03-06
**Rol:** Tabla de clientes, CRUD, búsqueda con filtro, estadísticas.

| Función | Descripción |
|---|---|
| `renderClientsTable()` | Renderiza tabla de clientes con botones de editar, historial y eliminar |
| `updateClientStats()` | Actualiza contadores: total, VIP, total compras |
| `selectClientType(type)` | Alterna visualmente entre "Regular" y "VIP" en el formulario |
| `openAddClientModal()` / `closeAddClientModal()` | Control del modal de nuevo/editar cliente |
| `editClient(clientId)` | Pre-carga el formulario de edición |
| `deleteClient(id)` | Elimina cliente con confirmación |
| `setupClientSearch()` | Registra listener en `#searchClient` para filtrar la tabla en tiempo real |
| `openClientHistory(clientId)` | Historial completo del cliente |

> **BUG-011-PROD FIX:** SyntaxError en producción corregido.
> **BUG-017 FIX (Chat 3):** `client.totalPurchases` con guard `||0` — no crashea con clientes legacy.
> **BUG-024 FIX (Chat 3):** Resultados de búsqueda incluyen botón "Ver historial".
> **BUG-025 FIX (Chat 3):** `lastPurchase` usa fecha local al crear cliente y al finalizar pedido.

---

### `js/ui-extras.js` · v2 · 2026-03-06
**Rol:** Exportaciones Excel, borrado de datos, sparklines, búsqueda global, utilidades de UI.

| Función | Descripción |
|---|---|
| `clearAllData()` | Borra TODOS los datos con doble confirmación. Resetea variables globales y llama todos los renders |
| `manekiExportar(tipo)` | Exporta a Excel (.xlsx) con SheetJS. Tipos: `'ventas'`, `'pedidos'`, `'clientes'`, `'inventario'` |
| `renderSparkline()` | Gráfica de línea de ganancias últimos 7 días (Chart.js) |
| `renderComparativaSemanal()` | Widget de comparativa esta semana vs semana anterior |
| `togglePrivacidad()` | Oculta/muestra montos sensibles con asteriscos |
| `manekiToastExport(msg, tipo)` / `manekiToast(msg, tipo)` | Sistema de notificaciones tipo toast |
| `fuzzyMatch(str, query)` | Búsqueda aproximada: todos los caracteres del query aparecen en orden |
| `busquedaGlobal(query)` | Busca en productos, clientes y pedidos simultáneamente |
| `cerrarBusquedaGlobal()` | Cierra el dropdown de búsqueda global |
| `irAProducto()` / `irACliente()` / `irAPedido()` / `irAReportes()` | Navegación desde búsqueda global |
| `btnLoading(btn)` | Muestra estado de carga en botones |
| `dismissToast(toast)` | Anima y elimina un toast del DOM |

---

### `js/whatsapp.js` · v1 · 2026-03-05
**Rol:** Mensajes de WhatsApp y Messenger para pedidos.

| Función | Descripción |
|---|---|
| `_waMensajes(p)` | Genera 4 plantillas de mensaje para un pedido (confirmación, recordatorio, listo, cobro) |
| `abrirWhatsAppPedido(id)` | Abre modal con el pedido seleccionado |
| `aplicarPlantillaWA(tipo)` | Carga una plantilla en el textarea |
| `copiarMensajeWA()` / `enviarWhatsApp()` | Copia al portapapeles / abre WhatsApp Web |
| `cerrarWhatsAppModal()` | Cierra el modal |
| `abrirMessengerPedido(id)` / `construirUrlMessenger(redes)` | Abre Facebook Messenger con el cliente |

---

### `js/backup.js` · v4 · 2026-03-06
**Rol:** Exportar e importar backup completo en JSON.

| Función | Descripción |
|---|---|
| `abrirModalBackup()` / `cerrarBackupModal()` | Control del modal |
| `exportarBackupJSON()` | Exporta JSON completo: products, clients, salesHistory, pedidos, pedidosFinalizados, incomes, expenses, quotes, receivables, payables, notas, storeConfig, gastosRecurrentes, stockMovimientos |
| `cargarArchivoBackup(event)` / `handleBackupDrop(e)` | Cargan archivo JSON desde input o drag & drop |
| `procesarArchivoBackup(file)` | Parsea y valida el JSON |
| `restaurarBackup()` | Restaura todos los arrays globales y guarda en Supabase |

> **BUG-008 FIX:** Incluye `clients`, `storeConfig`, `gastosRecurrentes` y `stockMovimientos`.
> **BUG-023 FIX (Chat 3):** Agrega `pedidosFinalizados`, `payables` y `notas` al export/restore. Versión bumped a 2.1. Modal muestra contador combinado de pedidos activos + finalizados.

---

### `js/categorias.js` · v1 · 2026-03-05
**Rol:** CRUD de categorías de productos.

Funciones principales: `renderCategorias()`, `openAddCategoryModal()`, `saveCategory()`, `deleteCategory()`, `updateCategorySelects()` (actualiza todos los `<select>` de categorías en el sistema).

---

### `js/envios.js` · v1 · 2026-03-05
**Rol:** Cotizador de envíos con mapa de cobertura por anillos y cálculo de tarifas.

| Función | Descripción |
|---|---|
| `guardarAnillosStorage()` | Persiste la configuración de anillos de cobertura |
| `haversineKm(lat1, lng1, lat2, lng2)` | Calcula distancia en km entre dos coordenadas |
| `getTarifaParaKm(km)` | Retorna la tarifa correspondiente a la distancia |
| `switchQuoteTab(tab)` | Alterna entre tabs del cotizador |
| `initMapaCoberturaView()` | Inicializa mapa Leaflet de vista de cobertura |
| `_redrawLeafletAnillos(mapa, layerGroup, mode)` | Dibuja círculos de cobertura en el mapa |
| `initAutocompleteEnvio()` | Inicia autocomplete de dirección de destino (Nominatim) |
| `buscarNominatim(q)` / `seleccionarNominatim(lat, lng, name)` | Geocodificación con OpenStreetMap |
| `procesarDestino(lat, lng, label)` | Calcula tarifa y muestra resumen al seleccionar destino |
| `buscarDestinoCotizador()` | Disparado por botón/Enter en el buscador de destino |
| `renderTablaAnillos()` / `renderAnillosLista()` | Visualización de configuración de anillos |
| `abrirConfigAnillos()` / `cerrarConfigAnillos()` | Control del panel de configuración |
| `copiarCotizacionEnvio()` | Copia cotización al portapapeles |

---

### `js/equipos.js` · v1 · 2026-03-05
**Rol:** Gestión de equipos/maquinaria, cálculo de ROI, notas de producción.

| Función | Descripción |
|---|---|
| `saveEquipos()` / `saveRoiHistorial()` / `saveRoiConfig()` | Persistencia de datos de equipos |
| `openEquipoModal(id)` / `closeEquipoModal()` / `saveEquipo()` / `deleteEquipo(id)` | CRUD de equipos |
| `renderEquiposGrid()` | Tarjetas de equipos con métricas de rentabilidad |
| `renderRoiHistorial()` | Lista historial de cálculos de ROI por pedido |
| `abrirRoiEquiposModal(pedido)` / `actualizarCalculoRoi()` / `confirmarRoiEquipos()` | Modal de cálculo de ROI por pedido |
| `limpiarRoiDePedido(pedidoId)` | Elimina entrada de ROI de un pedido |
| `agregarNota()` / `toggleNota(id)` / `eliminarNota(id)` / `renderNotas()` | CRUD de notas de producción |
| `searchClientAutocomplete(query)` | Autocomplete de cliente para notas |

---

### `js/config-init.js` · v1 · 2026-03-05
**Rol:** Inicialización mínima antes del DOM — detecta Electron, expone `ipcRenderer`.

### `js/icons.js` · v1 · 2026-03-05
**Rol:** Array de emojis disponibles para productos y categorías. Solo datos, sin lógica.

---

## 🐛 REGISTRO DE BUGS

---

### 🔴 CRÍTICOS

#### BUG-001 — `_migrarBase64AStorage` usaba `fetch()` en lugar de `atob()`
**Archivo:** `js/db.js` · **Estado:** ✅ RESUELTO — 2026-03-05

`fetch()` con data URLs falla por CSP. El archivo en producción ya usaba `atob()` correctamente.

---

#### BUG-002 — Límite de 2 MB en bucket `product-images`
**Archivo:** Supabase Storage · **Estado:** ✅ RESUELTO — 2026-03-05

Límite subido a 50 MB. `_comprimirBase64()` comprime a máx 1200px / 0.82 antes de subir.

---

#### BUG-003 — Políticas RLS bloqueaban uploads anónimos
**Archivo:** Supabase Storage Policies · **Estado:** ✅ RESUELTO — 2026-03-05

```sql
CREATE POLICY "product_images_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_insert_anon" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product_images_update_anon" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'product-images');
CREATE POLICY "product_images_delete_anon" ON storage.objects FOR DELETE TO public USING (bucket_id = 'product-images');
```

---

#### BUG-004 — POS filtraba con `p.type` pero el campo es `p.tipo`
**Archivo:** `js/pos.js` · **Estado:** ✅ RESUELTO — 2026-03-05

```javascript
const vendibles = products.filter(p => p.tipo !== 'materia_prima' && p.tipo !== 'servicio');
```

---

#### BUG-005 — `getNextFolio` usaba `.single()` → error 406
**Archivo:** `js/pedidos.js` · **Estado:** ✅ RESUELTO — 2026-03-05

```javascript
await db.from('store').select('value').eq('key', 'folioCounter').maybeSingle();
```

---

#### BUG-011-PROD — `clientes.js` en producción tenía SyntaxError que abortaba toda la app
**Archivos:** `js/clientes.js` + `js/config.js` · **Estado:** ✅ RESUELTO — 2026-03-06

**Descripción:**
El `clientes.js` desplegado tenía un `SyntaxError: Unexpected end of input` (línea 221 de la versión antigua). El archivo no se ejecutaba, `setupClientSearch` nunca se registraba, y al llegar a esa llamada en `initApp()` se lanzaba `ReferenceError`. El `catch` externo de `initApp()` abortaba toda la inicialización — inventario, pedidos, reportes y balance aparecían vacíos.

**Solución (dos partes):**

1. Desplegar el `clientes.js` correcto (el subido ya no tiene el error).
2. Guard en `config.js` línea 629:
```javascript
// Antes — si falla, aborta toda la app:
setupClientSearch();

// Ahora — si falla, solo avisa y continúa:
try { if (typeof setupClientSearch === 'function') setupClientSearch(); } catch(e) { console.warn('setupClientSearch error:', e); }
```

---

### 🟠 IMPORTANTES

#### BUG-006 — Abonos no se registraban en Balance ni Reportes
**Archivo:** `js/pedidos.js` · **Estado:** ✅ RESUELTO — 2026-03-06

```javascript
window.incomes.push({ id: abonoId, concept: `Abono pedido ${p.folio}`, amount: monto, date: hoy });
saveIncomes();
window.salesHistory.push({ id: abonoId, type: 'abono', folio: p.folio, date: hoy, customer: p.cliente, total: monto, method: metodo });
saveSalesHistory();
```

---

#### BUG-007 — IDs de ventas con `Date.now()` colisionables
**Archivo:** `js/pos.js` · **Estado:** ✅ RESUELTO — 2026-03-05 · `crypto.randomUUID()`

---

#### BUG-008 — Backup incompleto (faltaban clients, storeConfig, gastosRecurrentes, stockMovimientos)
**Archivo:** `js/backup.js` · **Estado:** ✅ RESUELTO — 2026-03-05

---

#### BUG-009 — `subirImagenStorage()` no comprimía antes de subir
**Archivo:** `js/db.js` · **Estado:** ✅ RESUELTO — 2026-03-05

`_comprimirFile()` con Canvas (máx 1200px / 0.82) se llama antes del upload.

---

#### BUG-010 — Realtime solo escuchaba tabla `store`
**Archivo:** `js/db.js` · **Estado:** ✅ RESUELTO — 2026-03-06

Canal `maneki-desktop-store` para tabla `store`. `_applyRTDesktop()` y `_applyRTRelacional()` manejan cambios de `products`, `orders`, `orders_finalizados`, `sales_history` con debounce 800ms y UPDATE in-place de arrays.

---

### 🟡 MENORES

| ID | Archivo | Descripción | Solución | Estado |
|---|---|---|---|---|
| BUG-011 | balance.js | IDs flotantes en incomes/expenses | `crypto.randomUUID()` | ✅ |
| BUG-012 | inventory.js | stockMovimientos truncado desde inicio | `.slice(-500)` | ✅ |
| BUG-013 | pos.js | IDs de cotizaciones colisionables | `crypto.randomUUID()` | ✅ |
| BUG-014 | pos.js | XSS en documento de cotización | `_esc()` en todos los campos | ✅ |

---

### 🟠 BUGS CHAT 3 (2026-03-06)

#### BUG-015 🔴 — `dashboard.js` SyntaxError — bloque `accountsReceivable` duplicado
**Archivo:** `js/dashboard.js` · **Estado:** ✅ RESUELTO — Chat 3

Array literal de `accountsReceivable` abierto, cerrado con `.reduce()`, y luego bloque `...receivables.filter()` suelto. `dashboard.js` no parseaba, todo el dashboard fallaba.

**Solución:** Eliminado el bloque duplicado.

---

#### BUG-016 🟠 — `console.table` de pedidos imprimiendo en producción
**Archivo:** `js/dashboard.js` · **Estado:** ✅ RESUELTO — Chat 3

`console.table()` imprimía todos los pedidos con datos financieros en cada `updateDashboard()`.

**Solución:** Eliminado.

---

#### BUG-017 🟠 — `clientes.js` crash en `totalPurchases` undefined
**Archivo:** `js/clientes.js` · **Estado:** ✅ RESUELTO — Chat 3

`client.totalPurchases.toFixed(2)` sin guard. Clientes creados antes del fix tenían el campo `undefined`.

**Solución:** `(client.totalPurchases||0).toFixed(2)`. También corregido en `updateClientStats` reduce.

---

#### BUG-018 🟠 — `pedidos.js` `fechaFinalizado` en UTC
**Archivo:** `js/pedidos.js` · **Estado:** ✅ RESUELTO — Chat 3

`fechaFinalizado: new Date().toISOString()` → fecha equivocada después de las 6 PM. Afectaba reportes mensuales.

**Solución:** Construcción de fecha local `${y}-${m}-${d}T${h}:${min}:${sec}`.

---

#### BUG-019 🟡 — Modal de pedido — fecha y entrega default en UTC
**Archivo:** `js/pedidos.js` · **Estado:** ✅ RESUELTO — Chat 3

`new Date().toISOString().split('T')[0]` en campos `fecha` y `entrega` del modal.

**Solución:** Construcción de fecha local en ambos campos.

---

#### BUG-020 🟠 — `balance.js` anticipos sintéticos contados doble en total POS
**Archivo:** `js/balance.js` · **Estado:** ✅ RESUELTO — Chat 3

Entradas `type:'anticipo'` en `salesHistory` se sumaban al total POS. El filtro solo excluía `type:'pedido'` y `type:'abono'`.

**Solución:** Agregado `s.type !== 'anticipo'` al filtro.

---

#### BUG-021 🟡 — `balance.js` `markAsPaid` usaba UTC
**Archivo:** `js/balance.js` · **Estado:** ✅ RESUELTO — Chat 3

Fecha de pago de CxC/CxP usaba `toISOString()` → ±1 día de noche.

**Solución:** Construcción de fecha local en ambos casos.

---

#### BUG-022 🟡 — `balance.js` `eliminarPedidoFinalizado` dejaba ingresos huérfanos
**Archivo:** `js/balance.js` · **Estado:** ✅ RESUELTO — Chat 3

Al eliminar un pedido finalizado se limpiaba `salesHistory` por folio pero quedaban entradas huérfanas en `incomes[]` con `concept: 'Abono pedido PE-XXXX'`. Balance seguía sumándolas.

**Solución:** Limpieza adicional de `window.incomes` filtrando por concepto con el folio.

---

#### BUG-023 🟠 — `backup.js` no exportaba `pedidosFinalizados`, `payables` ni `notas`
**Archivo:** `js/backup.js` · **Estado:** ✅ RESUELTO — Chat 3

Restaurar un backup perdía todo el historial de pedidos finalizados.

**Solución:** Agregados al export object (versión bumped a 2.1) y a `restaurarBackup()`. Contador del modal muestra pedidos activos + finalizados.

---

#### BUG-024 🟡 — `clientes.js` resultados de búsqueda sin botón historial
**Archivo:** `js/clientes.js` · **Estado:** ✅ RESUELTO — Chat 3

Render de búsqueda tenía solo editar + eliminar. No se podía ver el historial de un cliente desde la búsqueda.

**Solución:** Agregado botón `openClientHistory` al render de resultados.

---

#### BUG-025 🟡 — `clientes.js` `lastPurchase` en UTC
**Archivo:** `js/clientes.js` · **Estado:** ✅ RESUELTO — Chat 3

`new Date().toISOString().split('T')[0]` al crear cliente y al finalizar pedido.

**Solución:** Construcción de fecha local en ambos lugares.

---

#### BUG-026 🟠 — `inventory.js` `producto_interno` invisible en Productos Terminados
**Archivo:** `js/inventory.js` · **Estado:** ✅ RESUELTO — Chat 3

Al crear un PT con "Publicar en tienda" OFF se guarda como `tipo: 'producto_interno'`. Los filtros en `renderInventoryTable` solo matcheaban `!p.tipo || p.tipo === 'producto'`.

**Solución:** Agregado `|| p.tipo === 'producto_interno'` a ambos filtros (líneas 2338 y 2687).

---

### 🔵 BUGS SILENCIOSOS CHAT 4 (2026-03-06)

> Bugs que no crashean visiblemente pero producen datos incorrectos. Encontrados mediante análisis estático sistemático de todos los archivos.

#### BUG-S01 — `reportes.js` `renderValorInventario` typo en tipo *(renombrado BUG-S09)*
Ver BUG-S09.

#### BUG-S02 🟠 — `inventory.js` `descontarMpPorVenta` ignoraba `producto_interno`
**Archivo:** `js/inventory.js` · **Estado:** ✅ RESUELTO — Chat 4

Al vender un `producto_interno` con receta (`mpComponentes`), no se descontaba su stock de materias primas porque la condición solo chequeaba `prod.tipo === 'producto'`.

**Solución:** `prod.tipo === 'producto' || prod.tipo === 'producto_interno'`.

---

#### BUG-S03 🟠 — `reportes.js` filtros no excluían `type:'anticipo'`
**Archivo:** `js/reportes.js` · **Estado:** ✅ RESUELTO — Chat 4

`updateMonthlyStats`, `initComparativaMeses`, `initTopProductosChart` y `renderTopProducts` filtraban `type !== 'abono'` pero no `type !== 'anticipo'`. Anticipos sintéticos inflaban estadísticas de ventas.

**Solución:** Agregado `&& s.type !== 'anticipo'` a todos los filtros.

---

#### BUG-S04 🟡 — `reportes.js` `s.total.toFixed()` sin guard en CSV export
**Archivo:** `js/reportes.js` · **Estado:** ✅ RESUELTO — Chat 4

`s.total.toFixed(2)` en la función de exportación CSV crasheaba si `total` era `null` o `undefined`.

**Solución:** `Number(s.total||0).toFixed(2)`.

---

#### BUG-S05 🟠 — `config.js` morning briefing y cotizaciones usaban UTC
**Archivo:** `js/config.js` · **Estado:** ✅ RESUELTO — Chat 4

Tres lugares usaban `toISOString().split('T')[0]` para fechas de negocio: `hoy` y `ayer` del morning briefing, y `quoteValidUntil`. Mostraba ventas del día equivocado de noche.

**Solución:** Construcción de fecha local en los tres lugares.

---

#### BUG-S06 🟠 — `pedidos.js` `updatePedidosStats` incluía pedidos cancelados
**Archivo:** `js/pedidos.js` · **Estado:** ✅ RESUELTO — Chat 4

Los KPIs "Por cobrar" y "Anticipos" sumaban también pedidos con `status:'cancelado'`. Generaba dinero fantasma en el panel de pedidos.

**Solución:** `const activos = lista.filter(p => p.status !== 'cancelado')` antes de los reduces.

---

#### BUG-S07 🟠 — `balance.js` balance mensual inflado con abonos y anticipos
**Archivo:** `js/balance.js` · **Estado:** ✅ RESUELTO — Chat 4

`renderBalanceMensual` excluía `type:'pedido'` de ventas POS pero no `type:'abono'` ni `type:'anticipo'`. Total del mes se inflaba con entradas duplicadas.

**Solución:** Filtro adicional `s.type !== 'abono' && s.type !== 'anticipo'`.

---

#### BUG-S08 🟡 — `balance.js` `rec.amount` y `pay.amount` sin guard
**Archivo:** `js/balance.js` · **Estado:** ✅ RESUELTO — Chat 4

`rec.amount.toFixed(2)` y `pay.amount.toFixed(2)` en el render de CxC y CxP crasheaban si `amount` era `undefined`.

**Solución:** `Number(rec.amount||0).toFixed(2)` / `Number(pay.amount||0).toFixed(2)`.

---

#### BUG-S09 🟠 — `reportes.js` `renderValorInventario` typo `'materia'`
**Archivo:** `js/reportes.js` · **Estado:** ✅ RESUELTO — Chat 4

`p.tipo !== 'materia'` — ningún producto tiene `tipo:'materia'`, el valor real es `'materia_prima'`. Servicios incluidos en el valor del inventario, materias primas también incluidas.

**Solución:** `p.tipo !== 'materia_prima' && p.tipo !== 'servicio'`.

---

#### BUG-S10 🟠 — `reportes.js` `filtrarProductosPedido` mismo typo
**Archivo:** `js/reportes.js` · **Estado:** ✅ RESUELTO — Chat 4

`p.tipo !== 'materia'` en el buscador de productos al crear un pedido desde reportes. Servicios y materias primas aparecían como opciones seleccionables.

**Solución:** `p.tipo !== 'materia_prima' && p.tipo !== 'servicio'`.

---

#### BUG-S11 🟠 — `design-system.js` Worker inflaba top productos con anticipos
**Archivo:** `js/design-system.js` · **Estado:** ✅ RESUELTO — Chat 4

El Web Worker que procesa análisis de productos filtraba `type === 'abono'` pero no `type === 'anticipo'`. Los anticipos sintéticos se contaban como ventas reales, inflando el top de productos.

**Solución:** `if (sale.type === 'abono' || sale.type === 'anticipo') return;`

---

#### BUG-S12 🟠 — `app-data.js` pedido desde cotización con fechas UTC
**Archivo:** `js/app-data.js` · **Estado:** ✅ RESUELTO — Chat 4

Al convertir una cotización en pedido, `fechaCreacion` y `fechaEntrega` (hoy + 15 días) usaban `toISOString()` → fecha de entrega equivocada de noche.

**Solución:** Construcción de fecha local para ambas fechas.

---

#### BUG-S04-CFG 🟠 — `config.js` `poblarKitSelect` typo — dropdown de kits siempre vacío
**Archivo:** `js/config.js` · **Estado:** ✅ RESUELTO — Chat 4

`products.filter(p => p.tipo === 'materia')` — ningún producto tiene `tipo:'materia'`. El dropdown de componentes de kits siempre aparecía vacío, imposible crear kits.

**Solución:** `p.tipo === 'materia_prima'`.

---

### ✅ BUGS HISTÓRICOS

| ID | Archivo | Descripción | Solución |
|---|---|---|---|
| BUG-H01 | db.js | Error 406 en `sbLoad` con `.single()` | `.maybeSingle()` |
| BUG-H02 | clientes.js | IDs de clientes colisionaban | `crypto.randomUUID()` |
| BUG-H03 | clientes.js | `c.email.toLowerCase()` crasheaba si undefined | `(c.email \|\| '').toLowerCase()` |
| BUG-H04 | pos.js | Costo del producto cambiaba retroactivamente | Guardar `costoAlVender` en cada venta |
| BUG-H05 | pos.js | XSS en recibo de venta | `_esc()` en `generateReceipt()` |
| BUG-H06 | db.js | `subirImagenStorage()` guardaba base64 enorme si Storage fallaba | Fallback offline comprime a 400px / 70% |
| BUG-H07 | db.js + Supabase | Imagen de producto no aparecía en tienda web | Combinación BUG-001 + BUG-002 + BUG-003 |

---

## 🟣 REGISTRO DE MEJORAS

---

### MEJORA-01 — Pedidos finalizados se registran en `salesHistory`
**Archivo:** `js/pedidos.js` · ✅ 2026-03-06

Al finalizar un pedido: push a `salesHistory[]` con `type:'pedido'` y deduplicación por folio. Todos los reportes financieros incluyen automáticamente los pedidos por encargo.

---

### MEJORA-02 — Balance usa totales reales de pedidos finalizados
**Archivo:** `js/balance.js` · ✅ 2026-03-06

`renderBalanceMensual()` lee `pedidosFinalizados[]` filtrados por `fechaFinalizado`, no anticipos de pedidos activos.

---

### MEJORA-03 — Total Ingresos consolida POS + pedidos + manuales
**Archivo:** `js/balance.js` · ✅ 2026-03-06

`renderBalance()` suma tres fuentes sin duplicar: `incomes[]` manuales + `pedidosFinalizados[]` + `salesHistory[]` tipo POS.

---

### MEJORA-04 — Reportes incluye pedidos en todas las métricas
**Archivo:** `js/reportes.js` · ✅ 2026-03-06

`updateMonthlyStats()`, `initComparativaMeses()`, `initTopProductosChart()`, `renderTopProducts()`, `initCategoryChart()` y `renderSalesHistory()` unifican `salesHistory[]` + `pedidosFinalizados[]`.

---

### MEJORA-05 — Análisis de Productos incluye pedidos por encargo
**Archivo:** `js/design-system.js` · ✅ 2026-03-06

`postMessage` al Worker incluye `pedidosFinalizados`. El Worker procesa ambas fuentes, corrige ID de tabla (`analisisTabla`) y llama `renderAnalisisABC()` con datos completos.

---

## 📊 TABLA RESUMEN

| ID | Tipo | Sev. | Chat | Estado | Archivo | Descripción corta |
|---|---|---|---|---|---|---|
| BUG-001 | Bug | 🔴 | 1 | ✅ | db.js | `_migrarBase64AStorage` usaba fetch() |
| BUG-002 | Bug | 🔴 | 1 | ✅ | Supabase | Límite 2MB rechazaba uploads |
| BUG-003 | Bug | 🔴 | 1 | ✅ | Supabase | RLS bloqueaba uploads anónimos |
| BUG-004 | Bug | 🔴 | 1 | ✅ | pos.js | POS mostraba materias primas |
| BUG-005 | Bug | 🔴 | 1 | ✅ | pedidos.js | folioCounter usaba .single() |
| BUG-006 | Bug | 🟠 | 1 | ✅ | pedidos.js | Abonos invisibles en Balance y Reportes |
| BUG-007 | Bug | 🟠 | 1 | ✅ | pos.js | IDs de ventas colisionables |
| BUG-008 | Bug | 🟠 | 1 | ✅ | backup.js | Backup incompleto |
| BUG-009 | Bug | 🟠 | 1 | ✅ | db.js | Imágenes no comprimidas al subir |
| BUG-010 | Bug | 🟠 | 1 | ✅ | db.js | Realtime solo escuchaba tabla `store` |
| BUG-011 | Bug | 🟡 | 1 | ✅ | balance.js | IDs flotantes en incomes/expenses |
| BUG-012 | Bug | 🟡 | 1 | ✅ | inventory.js | stockMovimientos truncado desde inicio |
| BUG-013 | Bug | 🟡 | 1 | ✅ | pos.js | IDs de cotizaciones colisionables |
| BUG-014 | Bug | 🟡 | 1 | ✅ | pos.js | XSS en documento de cotización |
| BUG-011-PROD | Bug | 🔴 | 2 | ✅ | clientes.js + config.js | SyntaxError abortaba toda la app |
| MEJORA-01 | Mejora | 🟣 | 2 | ✅ | pedidos.js | Pedidos finalizados → salesHistory |
| MEJORA-02 | Mejora | 🟣 | 2 | ✅ | balance.js | Balance usa totales reales |
| MEJORA-03 | Mejora | 🟣 | 2 | ✅ | balance.js | Total ingresos consolida todas las fuentes |
| MEJORA-04 | Mejora | 🟣 | 2 | ✅ | reportes.js | Reportes incluye pedidos en métricas |
| MEJORA-05 | Mejora | 🟣 | 2 | ✅ | design-system.js | Análisis incluye pedidos por encargo |
| BUG-015 | Bug | 🔴 | 3 | ✅ | dashboard.js | SyntaxError — bloque duplicado |
| BUG-016 | Bug | 🟠 | 3 | ✅ | dashboard.js | console.table en producción |
| BUG-017 | Bug | 🟠 | 3 | ✅ | clientes.js | Crash en totalPurchases undefined |
| BUG-018 | Bug | 🟠 | 3 | ✅ | pedidos.js | fechaFinalizado en UTC |
| BUG-019 | Bug | 🟡 | 3 | ✅ | pedidos.js | Modal fechas default en UTC |
| BUG-020 | Bug | 🟠 | 3 | ✅ | balance.js | Anticipos contados doble en POS |
| BUG-021 | Bug | 🟡 | 3 | ✅ | balance.js | markAsPaid usaba UTC |
| BUG-022 | Bug | 🟡 | 3 | ✅ | balance.js | Ingresos huérfanos al eliminar pedido |
| BUG-023 | Bug | 🟠 | 3 | ✅ | backup.js | Faltaban pedidosFinalizados/payables/notas |
| BUG-024 | Bug | 🟡 | 3 | ✅ | clientes.js | Búsqueda sin botón historial |
| BUG-025 | Bug | 🟡 | 3 | ✅ | clientes.js | lastPurchase en UTC |
| BUG-026 | Bug | 🟠 | 3 | ✅ | inventory.js | producto_interno invisible en inventario |
| BUG-S02 | Bug silencioso | 🟠 | 4 | ✅ | inventory.js | descontarMpPorVenta ignoraba producto_interno |
| BUG-S03 | Bug silencioso | 🟠 | 4 | ✅ | reportes.js | Anticipo inflaba estadísticas de ventas |
| BUG-S04 | Bug silencioso | 🟡 | 4 | ✅ | reportes.js | s.total.toFixed sin guard en CSV |
| BUG-S04-CFG | Bug silencioso | 🟠 | 4 | ✅ | config.js | poblarKitSelect typo — kits siempre vacíos |
| BUG-S05 | Bug silencioso | 🟠 | 4 | ✅ | config.js | Morning briefing y cotizaciones en UTC |
| BUG-S06 | Bug silencioso | 🟠 | 4 | ✅ | pedidos.js | Stats pedidos incluía cancelados |
| BUG-S07 | Bug silencioso | 🟠 | 4 | ✅ | balance.js | Balance mensual inflado con abonos/anticipos |
| BUG-S08 | Bug silencioso | 🟡 | 4 | ✅ | balance.js | rec/pay.amount.toFixed sin guard |
| BUG-S09 | Bug silencioso | 🟠 | 4 | ✅ | reportes.js | renderValorInventario typo tipo |
| BUG-S10 | Bug silencioso | 🟠 | 4 | ✅ | reportes.js | filtrarProductosPedido typo tipo |
| BUG-S11 | Bug silencioso | 🟠 | 4 | ✅ | design-system.js | Worker inflaba top productos con anticipos |
| BUG-S12 | Bug silencioso | 🟠 | 4 | ✅ | app-data.js | Pedido desde cotización con fechas UTC |

---

## ⚙️ NOTAS CRÍTICAS PARA DESARROLLO FUTURO

### 1. Efecto dominó de `design-system.js`
Sobreescribe funciones en runtime. Si modificas `renderAnalisis()` en `reportes.js`, **también debes actualizar el `postMessage` en `design-system.js`** (~línea 628). Sin eso, la función de reportes.js nunca se ejecuta.

### 2. Guard en `setupClientSearch` (config.js línea 629)
La llamada está protegida con `typeof` para que cualquier error futuro en `clientes.js` no aborte toda la inicialización de la app. No eliminar esta protección.

### 3. Doble fuente de ingresos
Cualquier KPI financiero debe consolidar **dos fuentes**:
- `salesHistory[]` — ventas POS y abonos
- `pedidosFinalizados[]` — pedidos por encargo completados

### 4. Tablas relacionales vs tabla `store`
Las funciones `saveProducts()`, `savePedidos()`, `savePedidosFinalizados()` y `saveSalesHistory()` escriben en **ambas** (tabla `store` para compatibilidad + tablas relacionales para Lovable/APIs externas).

### 5. Pendientes de mejora identificados
Ver documento `MANEKI-MEJORAS-2026.docx` para el plan de 18 mejoras identificadas, incluyendo XSS global (MEJ-01), optimización de performance (MEJ-04), integridad de datos y más.

---

## 📁 ARCHIVOS MODIFICADOS — Estado de producción

| Archivo | Versión | Última mod. | Cambios incluidos |
|---|---|---|---|
| `js/db.js` | v4 | 2026-03-06 | BUG-001, BUG-009, BUG-010 |
| `js/app-data.js` | v3 | 2026-03-06 | BUG-S12 |
| `js/config.js` | v4 | 2026-03-06 | BUG-011-PROD (guard), BUG-S04-CFG, BUG-S05 |
| `js/dashboard.js` | v4 | 2026-03-06 | BUG-015, BUG-016 |
| `js/pos.js` | v2 | 2026-03-05 | BUG-004, BUG-007, BUG-013, BUG-014 |
| `js/inventory.js` | v4 | 2026-03-06 | BUG-012, BUG-026, BUG-S02 |
| `js/pedidos.js` | v4 | 2026-03-06 | BUG-005, BUG-006, BUG-018, BUG-019, BUG-S06, MEJORA-01 |
| `js/balance.js` | v4 | 2026-03-06 | BUG-011, BUG-020, BUG-021, BUG-022, BUG-S07, BUG-S08, MEJORA-02, MEJORA-03 |
| `js/clientes.js` | v4 | 2026-03-06 | BUG-011-PROD, BUG-017, BUG-024, BUG-025 |
| `js/backup.js` | v4 | 2026-03-06 | BUG-008, BUG-023 |
| `js/reportes.js` | v4 | 2026-03-06 | BUG-S03, BUG-S04, BUG-S09, BUG-S10, MEJORA-04 |
| `js/design-system.js` | v4 | 2026-03-06 | BUG-S11, MEJORA-05 |
| `js/ui-extras.js` | v2 | 2026-03-06 | Documentado |
| `js/whatsapp.js` | v1 | 2026-03-05 | Documentado |
| `js/envios.js` | v1 | 2026-03-05 | Documentado |
| `js/equipos.js` | v1 | 2026-03-05 | Documentado |
| `js/categorias.js` | v1 | 2026-03-05 | Documentado |

---

*Maneki POS v3.0 · 44 bugs documentados · 12 resueltos en Chat 4 · 2026-03-06*

---

## 🌟 NICE TO HAVE — Backlog de mejoras <a name="nth"></a>

> Ideas identificadas durante los chats de bug hunting. Ordenadas por impacto percibido.
> 🔥 = Alto impacto / muy pedido · 🟡 = Medio · 🔵 = Bajo / cosmético

### Pedidos

| ID | Prio | Descripción |
|---|---|---|
| NTH-01 | 🔥 | **Duplicar pedido** — botón en kanban/tabla para clonar un pedido existente con nuevo folio |
| NTH-03 | 🟡 | **Filtro kanban por urgencia** — mostrar solo pedidos con entrega en X días |
| NTH-04 | 🟡 | **Thumbnail foto referencia en tarjeta kanban** — si el pedido tiene imagen adjunta, mostrarla en miniatura en la tarjeta |
| NTH-05 | 🟡 | **Campo prioridad en pedido** — Alta / Normal / Baja, visible en kanban y tabla |
| NTH-06 | 🔵 | **Paginación historial finalizados** — actualmente carga todos, lento con muchos pedidos |
| NTH-20 | 🔵 | **Buscar pedidos desde buscador global** — el buscador global no indexa pedidos activos por folio |

### Dashboard y reportes

| ID | Prio | Descripción |
|---|---|---|
| NTH-02 | 🔥 | **Meta mensual persistente en Supabase** — actualmente se pierde al recargar; guardar en `storeConfig` |
| NTH-08 | 🟡 | **Widget "Día más rentable de la semana"** — en dashboard, qué día de la semana genera más ventas históricamente |
| NTH-16 | 🟡 | **Fecha en historial ROI** — la lista de ROI por pedido no muestra la fecha de cálculo |
| NTH-17 | 🔵 | **ROI manual sin pedido** — registrar ganancia de una actividad sin vincularla a un pedido |

### Clientes

| ID | Prio | Descripción |
|---|---|---|
| NTH-10 | 🔥 | **Ordenar tabla clientes** — clic en columna para ordenar por nombre, total compras, última visita |
| NTH-11 | 🟡 | **Notas visibles en tarjeta cliente** — mostrar snippet de la nota más reciente en la fila de la tabla |
| NTH-12 | 🔵 | **Avatar/foto de cliente** — subir foto o usar inicial coloreada |
| NTH-09 | 🔵 | **Notificación push pedidos sin movimiento** — alertar cuando un pedido lleva X días sin cambio de status |

### Balance y finanzas

| ID | Prio | Descripción |
|---|---|---|
| NTH-13 | 🔥 | **Categorías de gastos con gráfica** — etiquetar gastos (Materiales, Envío, Renta, etc.) y ver pastel/barras |
| NTH-14 | 🟡 | **Exportar balance a PDF/Excel** — botón en la vista mensual para descargar el resumen del mes |
| NTH-15 | 🟡 | **Gastos recurrentes con día visible** — en la lista de recurrentes, mostrar el día del mes en que caen |

### UX general

| ID | Prio | Descripción |
|---|---|---|
| NTH-18 | 🟡 | **Modo oscuro completo** — varios componentes no respetan la preferencia de modo oscuro |
| NTH-19 | 🟡 | **Atajos de teclado** — `N` = nuevo pedido/producto según sección, `Esc` = cerrar modal, `R` = recargar dashboard |

---

## 🚨 BUGS PENDIENTES DE RESOLVER <a name="pendientes"></a>

> **Chat 5 (2026-03-06): todos los bugs pendientes fueron resueltos. Sin pendientes activos.**

---

### ✅ PENDIENTE-01 🟢 — "Me deben" muestra valores distintos en cada carga *(RESUELTO Chat 5)*

**Causa raíz confirmada:** `updateDashboard()` se ejecutaba en el Frame 1 del init antes de que `renderPedidosTable()` (Frame 2) llamara a `normalizarResta()`. El primer render del widget usaba valores de `p.anticipo` sin normalizar provenientes de Supabase.

**Fix aplicado — `dashboard.js` `_updateDashboardImpl()`:**
Añadida llamada a `normalizarResta()` al inicio de la función, antes del cálculo de `accountsReceivable`. Garantiza que `p.anticipo` y `p.resta` sean correctos en cada render del dashboard, independientemente del orden de inicialización.

**Regla para futuras modificaciones:**
- `normalizarResta()` recalcula desde `p.pagos[]` como fuente de verdad — nunca desde `p.resta` o `p.anticipo` directamente
- NO llamar `savePedidos()` desde `normalizarResta()` → loop infinito

---

### ✅ PENDIENTE-02 🟢 — Gráficas siempre en $0 (Sparkline, Comparativa) *(RESUELTO Chat 5)*

**Causa raíz — dos problemas combinados:**
- **Problema A:** `_totalVentasDia()` excluía entradas `type:'anticipo'` y `type:'abono'` de salesHistory, que son los ÚNICOS registros de pago para pedidos activos → siempre $0 para tiendas sin POS.
- **Problema B:** Pagos legacy con `ab.fecha` en UTC no coincidían con `dStr` local → 0 resultados aunque hubiera datos.

**Fix aplicado — `ui-extras.js` `_totalVentasDia()`:**
Reescrita con lógica de deduplicación por folio:
1. Construye set de `foliosFinalizados` (pedidos con `type:'pedido'` en salesHistory)
2. Cuenta `type:'anticipo'/'abono'` SOLO para folios NO finalizados (pedidos activos)
3. Cuenta `type:'pedido'` para finalizados (evita doble conteo con sus anticipos/abonos)
4. Añade fuente secundaria desde `p.pagos[]` para pagos no registrados en salesHistory
5. Normaliza fechas UTC con `.split('T')[0]`

**Regla para futuras modificaciones:**
- NO excluir blindly `type:'anticipo'` y `type:'abono'` — son la única fuente de ingreso para pedidos activos
- El patrón correcto: excluirlos SOLO si `foliosFinalizados.has(s.folio)` para ese registro

---

## ⚙️ REGLAS ABSOLUTAS PARA FUTUROS CHATS

### 1. NUNCA usar `toISOString()` para fechas de negocio
Siempre: `` `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` ``

### 2. NUNCA llamar `savePedidos()` desde `normalizarResta()`
Loop infinito: savePedidos → Supabase → Realtime → recarga → normalizarResta → ∞

### 3. Fuente de verdad de pedidos: `p.pagos[]`
No confiar en `p.anticipo` ni `p.resta` guardados — pueden estar corruptos. Calcular siempre desde `p.pagos[]`.

### 4. Pagos legacy sin `id`
Pagos registrados antes de Chat 2 no tienen campo `id`. Deduplicar por `fecha+monto` como fallback.

### 5. Doble fuente de ingresos siempre
Cualquier KPI financiero debe consolidar `salesHistory[]` + `pedidosFinalizados[]`.

### 6. `design-system.js` sobreescribe funciones en runtime
Si modificas `renderAnalisis()` en `reportes.js`, **también actualizar el `postMessage` en `design-system.js`** (~línea 628).

### 7. `tipo` de producto — valores válidos
`'producto'`, `'producto_interno'`, `'materia_prima'`, `'servicio'`. El typo `'materia'` no existe — cualquier filtro que lo use siempre devuelve vacío.

### 8. `type` de salesHistory — deduplicación correcta por folio
`'pos'`, `'pedido'`, `'abono'`, `'anticipo'`. Reglas:
- `'pedido'`: total del pedido al finalizar — NO excluir
- `'abono'`/`'anticipo'`: cobros parciales de pedidos ACTIVOS — NO excluir
- Si un folio tiene `type:'pedido'`, excluir sus `'abono'`/`'anticipo'` para ese folio (ya están en el total)
- POS sales (sin type): siempre contar
- Ver `_totalVentasDia()` en `ui-extras.js` como referencia del patrón correcto.

### 9. Empezar con diagnóstico de datos, no con código
Para bugs de valores incorrectos, ver los datos reales en Supabase antes de tocar cualquier archivo. Sin datos reales, los fixes son adivinanzas.

### 10. Guard en `setupClientSearch` (config.js)
La llamada está protegida con `typeof`. No eliminar esta protección — cualquier error en `clientes.js` no debe abortar toda la inicialización.

---

---

## 🔵 BUGS RESUELTOS EN AUDITORÍA PROFUNDA — CHAT 5 (2026-03-06)

### BUG-A01 ✅ — POS: fecha UTC en ventas nocturnas (pos.js)
Ventas registradas después de las ~18h quedaban con fecha del día siguiente (UTC+6h México).
**Fix:** `new Date().toISOString().split('T')[0]` → helper local `_fechaVenta` con año/mes/día local.

### BUG-A02 ✅ — POS: doble conteo en Balance (pos.js + balance.js)
POS pushaba a `salesHistory` Y a `incomes`. `renderBalance()` sumaba ambas fuentes → dinero x2.
**Fix:** Marcar income de POS con `fromPOS: true`. `totalIncomeManual` filtra `!i.fromPOS`.

### BUG-A03 ✅ — Balance: abonos de pedidos finalizados contados dos veces (pedidos.js + balance.js)
Abono se registraba en `incomes` sin `folioOrigen`. Al finalizar el pedido, `totalPedidosFin` sumaba el total completo, y `totalIncomeManual` también sumaba cada abono → doble conteo.
**Fix:** Abono en incomes ahora incluye `folioOrigen: p.folio`. `foliosEnIncomes` en balance.js usa `i.folio || i.folioOrigen`.

### BUG-A04 ✅ — Balance: `p.resta` crudo en cuentas por cobrar (balance.js)
`renderBalance()` usaba `p.resta ??` raw de Supabase (puede estar corrupto).
**Fix:** Calcular desde `p.pagos[]` como fuente de verdad, igual que dashboard.js.

### BUG-A05 ✅ — Pedidos: editar anticipo no actualizaba p.pagos[] (pedidos.js)
Al editar un pedido y cambiar el anticipo, el valor se sobreescribía en el objeto pero `normalizarResta()` lo revertía al recalcular desde `p.pagos[]` (antiguo).
**Fix:** El bloque de edición ahora ajusta `p.pagos[]` para reflejar el anticipo nuevo antes de guardar.

### BUG-A06 ✅ — savePedidos: campos faltantes en tabla relacional (db.js)
`pagos`, `lugarEntrega`, `costoMateriales`, `whatsapp`, `facebook`, `referenciasUrls`, `referenciasPaths`, `fechaUltimoEstado` no se guardaban en `public.orders` ni `public.orders_finalizados`.
**Fix:** Añadidos todos los campos al mapping de ambas funciones `savePedidos` y `savePedidosFinalizados`.

### BUG-A07 ✅ — POS receipt: XSS en nombre de producto y nota (pos.js)
`item.name` y `sale.note` en `generateReceipt()` se inyectaban sin sanitizar en innerHTML.
**Fix:** `_esc(item.name)` y `_esc(sale.note)`.

### BUG-A08 ✅ — Balance: XSS en concept/date/id de incomes y expenses (balance.js)
`renderIncomeList()` y `renderExpenseList()` inyectaban concept, date, categoría e id sin `_esc()`.
**Fix:** Todos los campos de usuario envueltos en `_esc()`. IDs en onclick como strings con comillas.

### BUG-A09 ✅ — Pedidos: status comparison case-sensitive en kanban y tabla (pedidos.js)
`p.status === col` y `p.status === _pedidoFiltroActivo` — si Realtime traía 'Confirmado' (mayúscula), los filtros mostraban 0 resultados.
**Fix:** Todas las comparaciones de status usan `.toLowerCase()`.

### BUG-A10 ✅ — Clientes: editClient ID type mismatch (clientes.js)
`clients.find(c => c.id === clientId)` — si `c.id` era número y `clientId` era string (desde HTML), la comparación siempre fallaba y `editClient()` no hacía nada.
**Fix:** `String(c.id) === String(clientId)`.

---

### Patrones fijados en esta auditoría

| Patrón | Regla |
|---|---|
| Fechas | Nunca `toISOString().split('T')[0]` → siempre helper local año/mes/día |
| IDs en onclick | Siempre como string con comillas: `onclick="fn('${_esc(id)}')"` |
| incomes POS | Marcar con `fromPOS: true`, filtrar en totalIncomeManual |
| incomes abonos | Incluir `folioOrigen: p.folio` para deduplicación en balance |
| status comparisons | Siempre `.toLowerCase()` en ambos lados |
| IDs numéricos vs string | Siempre `String(a) === String(b)` |

---

## 🔐 AUDITORÍA DE SEGURIDAD + BUGS CRÍTICOS — Chat 6 (2026-03-06)

### SEC-CRÍTICA-01 ✅ — Anon key de Supabase hardcodeada en renderer (db.js)
La key estaba como fallback en `db.js` (renderer), visible en DevTools.
**Fix:** Eliminado el fallback. Si `ipcRenderer` y `contextBridge` fallan, el app opera en modo offline (SQLite). Las credenciales solo viven en `main.js` (proceso Node).

### SEC-ALTA-01 ✅ — nodeIntegration:true en splash screen (main.js)
El splash usaba `require('electron')` directamente. XSS en splash.html → RCE vía Node.
**Fix:** `nodeIntegration: false, contextIsolation: true, preload: preload-splash.js`. Creado `preload-splash.js` que expone solo `splashAPI.onProgress()`, `splashAPI.onExit()` y `splashAPI.exitDone()` via contextBridge. Actualizado `splash.html` para usar `window.splashAPI`.

### SEC-ALTA-02 ✅ — showSection() sin whitelist en executeJavaScript (main.js)
`showAndNav(section)` interpolaba directamente en `executeJavaScript`. Valor no confiable → inyección JS.
**Fix:** `_VALID_SECTIONS = new Set([...])` — secciones permitidas. Se rechaza cualquier valor fuera del set.

### BUG-PED-005 ✅ — XSS en kanbanCardHTML (pedidos.js)
`p.folio`, `p.cliente`, `p.concepto`, `p.lugarEntrega` insertados sin sanitizar en kanban y tabla.
**Fix:** `_e = window._esc || fallback` aplicado en kanbanCardHTML() y renderTablaPedidos().

### BUG-PED-016 ✅ — Doble event listener en pedidoForm (pedidos.js)
El primer listener (línea ~156) cerraba el modal sin guardar cuando editId era `__finalizado__xxx`, porque no encontraba el pedido en `window.pedidos`.
**Fix:** Guard al inicio del primer listener: `if (editId && editId.startsWith('__finalizado__')) return;`

### BUG-PED-001 ✅ — Race condition en confirmarAbonoPedido (pedidos.js)
Doble-clic registraba el mismo abono dos veces antes de que se cerrara el modal.
**Fix:** Flag `_abonoEnProceso` + `try/finally` para liberar siempre. Botón deshabilitado durante proceso.

### BUG-PED-012 ✅ — fecha vs fechaPedido en savePedidos (db.js)
`fecha: p.fecha || null` — pero el campo real del pedido es `p.fechaPedido`. Causaba fecha null en Supabase relacional.
**Fix:** `fecha: p.fechaPedido || p.fecha || null` en ambas funciones (orders y orders_finalizados).

### BUG-PED-006 ✅ — Sin validación de costo y cantidad (pedidos.js)
El formulario no validaba `cantidad > 0` ni `costo >= 0`.
**Fix:** Guards antes de guardar: `if (cantidad <= 0)` y `if (costo < 0)`.

### BUG-PED-007 ✅ — Anticipo edit: bug en reducción a 0 (pedidos.js)
Cuando el usuario editaba anticipo = 0 existiendo un pago previo, el bloque `if (idxAnticipo >= 0 && anticipo > 0)` no entraba → pagos[] no se actualizaban.
**Fix:** Reescrita la lógica: `nuevoMontoAnticipo = max(0, anticipo - sumAbonos)` → siempre actualiza el pago tipo 'anticipo', incluso a $0.

### BUG-INV-SKU ✅ — SKU autogenerado para servicios no único (inventory.js)
`SVC-${String(Date.now()).slice(-5)}` → solo 5 dígitos → colisión en ventana de 100 segundos.
**Fix:** `crypto.randomUUID().split('-')[0].toUpperCase()` como sufijo.

---

### Patrones adicionales — Chat 6

| Patrón | Regla |
|---|---|
| Renderer credentials | Nunca hardcodear anon key en renderer — solo ipcRenderer/contextBridge |
| Splash security | Siempre preload separado para splash, `nodeIntegration: false` |
| IPC section nav | Validar con whitelist antes de `executeJavaScript` |
| XSS en innerHTML | `window._esc` en TODO texto de usuario en kanban, tabla, modales |
| Edit anticipo | Calcular `nuevoMonto = max(0, anticipo - sumAbonos)` y actualizar siempre |
| doble submit | Flag + try/finally para forms críticos (abono, venta POS) |

---

*Maneki POS v3.0 · Chat 6 completado · 2026-03-06*
*Total bugs resueltos: 66 · Bugs pendientes: 0 · Nice to have catalogados: 20*

