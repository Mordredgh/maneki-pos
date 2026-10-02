# Contexto del POS

## Decision 2026-09-27: respaldo remoto y alertas

El respaldo externo usa R2 privado mediante S3 API. Se cifra antes de salir del equipo y se lee de vuelta para validar descifrado y contenido. Sin las cuatro variables R2, el script conserva solo la copia local y no declara exito remoto. R2 esta activo: dos copias de 24 tablas verificadas el 2026-09-27 y tarea Windows diaria a las 20:00 y al iniciar sesion, con resultado 0. Depende del equipo encendido y la sesion iniciada; aun no incluye los binarios de Storage. El dashboard muestra entregas vencidas y acciones hacia pedidos, cobros e inventario. El hash de actualizacion incluye estado, saldo y stock, no solo cantidad de filas.

## Decision 2026-09-27: productos variables

`producto_variable` significa precio por rango de cantidad. Una combinacion de talla y color es una variante propia en `products.variants` con `type: Talla/Color`, `size`, `color`, `qty` (piezas terminadas) y `priceDelta` (recargo por pieza). El pedido agrupa todas las combinaciones del mismo producto para elegir el rango de precio; cada linea conserva su propio recargo. Si faltan piezas terminadas, calcula materias primas para fabricar la diferencia. Una materia prima con variantes por talla o color se descuenta de la variante correspondiente.

La tabla de rangos vive en `products.tabla_precios_variable` (JSONB). La migracion `scripts/2026-09-27-variable-prices.sql` se aplico a Bicho Core y rescato los seis productos variables existentes del respaldo KV `store.products`: seis de seis rangos coinciden con la fuente. El guardado y la recarga de un producto ficticio se probaron en PGlite aislado. La confirmacion visual debe convertir `data-arg="false"` a booleano para que Cancelar no acepte acciones.

## Decision 2026-09-27: caja, auditoria y respaldo
El cliente envia solo filas modificadas, conservando snapshots optimistas y lotes atomicos. Dinero se calcula en centavos en el nucleo, antes de cargar Balance. Caja consulta el dia completo por RPC, no los arrays limitados de la pantalla; no incluye ventas de pedidos sin cobro. Ingresos/gastos conservan metodo; valores historicos desconocidos quedan sin clasificar.

Los cortes se agregan a store.cashClosures con concurrencia optimista. La auditoria por triggers captura diez tablas y solo permite lectura al administrador. Operaciones agrupadas transmiten motivo y recibo estable. No se reconstruye retrospectivamente historial inexistente.

El respaldo completo de datos usa una instantanea SQL, comprimida y cifrada fuera del navegador. Destino R2 y credenciales configurados; programacion local activa. La ejecucion independiente del PC, las imagenes y la copia separada de la clave de recuperacion siguen pendientes. Ver BACKUPS.md. No introducir infraestructura de pago por defecto.

## Decision 2026-09-26: operacion de negocio atomica

Pedido, cobros, historial y movimientos de inventario se preparan como una unidad con `posRunOperation`. El journal local conserva el lote completo antes del envio. `pos_apply_operation` ejecuta las escrituras con comparacion optimista dentro de una transaccion PostgreSQL. Un recibo por identificador permite reenviar una respuesta perdida sin repetir cobros.

Los flujos de alta/edicion de pedido, cambio de estado, abono, reactivacion y cancelacion usan esta unidad. La configuracion KV conserva su propia cola optimista. Una interrupcion durante la preparacion, antes de persistir el journal, no tiene garantia de recuperacion; el navegador avisa al intentar salir. No es un respaldo automatico externo.

Ingresos y gastos usan IDs de texto: acepta UUID nuevos y conserva IDs numericos existentes sin renumerarlos. SQL aplicado en Bicho Core: `2026-09-26-financial-ids.sql` y `2026-09-26-atomic-operations.sql`. Sin FK entrantes, identity o default en los IDs al migrar. RLS administrador conservada.

## Conflictos

La revision compara campos del dispositivo y nube. Requiere eleccion explicita y descarga un respaldo antes de sobrescribir o descartar pendientes. La escritura conserva la version observada: una modificacion posterior en otro dispositivo vuelve a generar conflicto. No mezcla automaticamente inventarios o importes.

## Pruebas locales

`npm run build:cloudflare` y luego `npm run staging`. Abrir http://127.0.0.1:8978/.

PostgreSQL PGlite en memoria; datos ficticios, autenticacion simulada, sin conexion con Supabase real. Reiniciar el servidor reinicia datos; la cola del navegador se conserva, por lo que conviene terminar o descartar pendientes antes de reiniciar. Solo escucha loopback y bloquea solicitudes externas con CSP. No se publica `staging/` en Cloudflare.

El esquema reproduce columnas y tipos observados; no todos los triggers, constraints o Storage de produccion. SQL tambien validado bajo rol administrador real en Supabase con ROLLBACK. Este entorno permite probar flujos sin usar datos comerciales; no sustituye pruebas de impresora fisica ni autenticacion real.

## Infraestructura

Cloudflare Pages: bicho-capricho-pos. Dominio: https://pos.manekistore.com.mx. Supabase: hoqcrljgmamaumtdrtzi. Coolify/VPS ya no es destino de despliegue. Bot retirado por el propietario.

## Captura simple 2026-09-29

Precio rapido: nota opcional con motivo automatico Actualizacion de precio; ajustes de stock conservan motivo obligatorio. Costos de ficha pueden quedar parciales: faltantes se guardan como null, se muestra Costo incompleto y no se calcula ganancia/margen definitivo. Pedido permite guardar desde cualquier paso con datos esenciales validos; revision opcional. Costo PT calculado por componentes se sugiere inline y solo reemplaza costo manual al pulsar Usar costo calculado. Confirmaciones de cierre sin guardar y finalizacion/cobro permanecen intactas.

## Experiencia agil 2026-09-29

Kanban prioriza cliente/producto, fecha/saldo y notas; Estado, Editar rapido y Abono quedan visibles. Mas acciones agrupa herramientas secundarias. Edicion rapida guarda entrega/prioridad/nota en operacion atomica y rechaza cambios concurrentes o fechas inexistentes. Los filtros cuentan pedidos activos dentro de la busqueda/ocasion actual; no agregan requisitos de avance.

Busqueda compartida tolera acentos, palabras en distinto orden y una errata en palabras de al menos cuatro letras; tallas, numeros y folios conservan coincidencia precisa. Inventario conserva filtros/pagina y restaura posicion/foco al cerrar el editor. Categoria, proveedor y metodo son preferencias locales de captura, editables y solo restauradas si la opcion existe. No se cambia esquema de Supabase. Balance limpia la marca de cambios solo despues de confirmar guardado; ante fallo mantiene abierto el formulario.


## Identidad Bicho - 2026-09-30

Direccion visual aprobada en DESIGN.md: taller creativo mate, crema/verde bosque/mantequilla, Nunito y Fredoka One locales, mascotas originales WebP. css/bicho-brand.css se carga al final; inventario conserva tabla/tarjetas y variantes, Pedidos usa fichas legibles, Balance vacios con Tago. Sin cambios de reglas comerciales, SQL o controles de avance. Fuentes/estilos entran en cache critico del SW; mascotas en secundario.


## Tabla de encargos - 2026-10-01
Cliente y descripcion son la identidad principal. Cobrado usa posTotalPagado y saldo calcSaldoPendiente; fechas civiles validas muestran etiqueta relativa y fecha exacta. Editar/Abonar/Estado/Mas quedan visibles incluso en movil; contacto conserva WhatsApp/Facebook. Columnas opcionales se guardan en pos-table-hidden y se filtran por lista permitida. La ficha usa el orden visible de tabla, restaura scroll y conserva posTablaSelectedId al renderizar. Densidad usa preferencia mk-dense existente. Barras fijas requieren overflow clip/visible en main y secciones; scroll de tabla mantiene sus encabezados. Sin cambios de SQL ni requisitos comerciales.
Documentos usan logo existente, Nunito local, bosque/crema y numeros tabulares; imprimir sigue siendo una accion explicita. UI verificada con 24 encargos sinteticos, variantes M/Blanco, columnas tras recarga, ficha/seleccion, encabezado y Estado en movil. Los tres HTML se generaron con funciones reales para revision visual, porque IAB no expuso las ventanas emergentes. No se probo impresora fisica.


## Operacion comercial - 2026-10-01
src/commerce.ts carga en core despues de operations. Apartados de PT usan posDetalle.apartado, retiran disponibilidad sin consumir MP; inventarioDescontado evita doble salida al finalizar. Liberacion/cancelacion devuelve items guardados y variantes exactas. Valor fisico conserva apartados activos; tarjetas/tabla muestran disponibilidad y apartado por separado.
Promociones reutilizables en store.posPromociones: lineas reales, reparto exacto en centavos y grupo inmutable en captura. Quitar un componente quita el paquete. Extras id libre/posPersonalizacion suman al pedido y documentos sin stock.
Cambios/devoluciones solo sobre venta cerrada: posDetalle.devoluciones e itemsCambio conservan original; recuperacion de pieza requiere seleccion explicita. Diferencias entran a incomes/expenses y al kardex mediante posRunOperation. Limites por piezas restantes y dinero cobrado neto; no se permite reescribir/reactivar/eliminar venta con devoluciones registradas.
Capacidad diaria store.posCapacidad.piezas: referencia de 30 dias, incluye confirmado/pago/produccion, excluye apartado terminado, nunca bloquea captura. Tiempo por pedido en posDetalle.tiempos con actividad/fecha/minutos, ganancia/hora usa costos completos de ficha y ajustes de devolucion.
Backup manual incluye promociones/capacidad; respaldo externo ya incluye store y orders.pos_detalle. Sin nuevas tablas, dependencias, permisos ni cargo. Las reglas nuevas reutilizan transacciones optimistas/recibos existentes.

## Mascotas - 2026-10-01
Una mascota distinta por encabezado: Inicio Mugsy, Pedidos Crafty, Cotizaciones Garabato, Inventario Estampilla, Balance Tago, Clientes Tote, Categorias Ticker. Originales WebP transparentes; sin fondo/padding/marco CSS. Balance no repite mascotas en estados vacios. Los siete assets se incluyen en cache y hash SW.

## Revision de molestias - 2026-10-01
Carga diferida: errores de script rechazan la promesa, eliminan el recurso fallido y liberan el grupo para reintentar; solo carga completa se marca lista. Precargas opcionales no generan errores sin manejar. La seccion limpia el spinner y permite volver a entrar tras fallo; el spinner vive en la seccion real, no en el boton lateral. Balance muestra tablas sin esperar Chart.js ni el retraso artificial de 80ms. Inventario solo enfoca buscador en escritorio y si sigue activo; preventScroll evita saltos. Exportador informa fallo de descarga.
Balance adapta selector/resumen/exportar al ancho movil; flechas y controles tactiles 44px, contraste de tema oscuro. Controles mk-btn-secondary/pos-dialog-close usan superficie y texto comunes; tema real body.dark tambien en formularios comerciales y color-scheme nativo. KPI de cobrado/pendiente reutilizan fmtMoney. Sin reglas, SQL, nuevas dependencias ni pasos obligatorios.
Validacion: 221 pruebas (4 regresiones nuevas), tipos/lint/build correctos. Guardados pendientes, reconexion y cobros idempotentes cubiertos por suites existentes. UI ficticia escritorio/390px: Balance, cambio de mes, Inventario sin autofoco movil, transicion rapida, capacidad oscura y tabla con separadores. Publicacion 62b476c1, dominio protegido 401/200 y HTML/CSS/bundles/SW identicos a locales; SW maneki-1b49648b77. Revision acotada; no simula todos los flujos ni impresora fisica.


## Guardado y captura - 2026-10-01
Pedido espera posRunOperation antes de cerrar/limpiar/anunciar exito; un mutex exterior cubre el flush. Al crear se conserva editPedidoId para actualizar el mismo registro tras pendingSync; errores previos a preparar restauran ID original. pos-pedido-save es button type=button y pedidoSubmitBtn su span: bloquear/restaurar ambos correctamente. PT/PV retienen identificador tras primer intento, esperan saveProducts y conservan fotos/campos al fallar. Galeria PT sube secuencialmente y retira solo archivos confirmados.
Fotos: MIME imagen, maximo 20 MB de entrada, dimension mayor 1200, WebP 0.82; errores de lectura/decodificacion/canvas rechazan y procesamiento tiene limite 15 segundos. Fallback de Storage usa blob reducido. Realtime espera .modal.active o dialog[open] y se libera al cerrar posDialog. Enter no envia implicitamente pedidoForm/pvForm/ptForm/transactionForm desde inputs ordinarios; textarea, botones y data-onkeydown explicitos conservan comportamiento. Sin borrador completo de recarga forzada ni nuevos requisitos comerciales.
Validacion 227 pruebas y UI ficticia de captura, error, reintento, Enter y Tab; sin ventas reales.

Publicado d11cda84; SW maneki-e3b125f4d1; dominio 401/200 y archivos identicos al paquete compilado.

## Recuperacion de capturas - 2026-10-02
IndexedDB nativo bicho-ui/kv guarda una captura por tipo de modal y registro, con vencimiento de 7 dias. Balance separa income/expense/receivable/payable. Snapshot de campos y auxiliares (productos, empaques, variantes, componentes, File/Blob y galeria) sin base64 ni dependencia. Restauracion solo al abrir la misma captura y si el usuario no ha escrito mientras carga. Guardado confirmado o descarte explicito elimina borrador; cancelar cierre lo conserva. Es local al dispositivo/navegador, no respaldo externo. Pedido/PT/PV retienen ID preparado tras fallo; Balance usa posDraftWriteId y reemplaza por ID al reintentar, tambien plantilla recurrente.
Historial con nombres, fmtMoney y anterior -> nuevo; excluye timestamps/dispositivo. Miniaturas WebP240 bajo demanda al entrar en pantalla, cache local hasta 200 URLs. Primera generacion descarga original; vistas posteriores reutilizan miniatura. Galeria usa originales. Sin SQL ni datos reales modificados.
Validacion: 233 pruebas, tipos/lint/build; UI ficticia recupera Pedido/Balance tras recarga, cancelar cierre conserva y descartar cierra con una sola confirmacion. Lista240px frente a galeria1024px. SW maneki-df42d95317.

Publicado en Cloudflare 442d2201; dominio 401 anonimo/200 autorizado, index/core/inventario/pedidos/balance/SW identicos al paquete. SW maneki-df42d95317.

## Captura agil y consistencia - 2026-10-02
Referencias: Ctrl+V en el modal de fotos, seleccion multiple, estado por archivo y reintento individual. Ruta UUID estable y upload upsert:false; tras respuesta perdida verifica bytes existentes antes de enlazar. Si Storage confirma pero savePedidos falla, conserva URL y reintenta solo persistencia. WebP1200, 5MB de entrada, 20 fotos por pedido. Pendientes de subida viven en la sesion; cerrar/reabrir modal las conserva, recargar la pagina no conserva esa cola.
Variante editable en la linea conserva cantidad, precio, extras y promocion; no recalcula precio al cambiar combinacion. Selector completo en una fila. Aviso de pedido parecido compara cliente, total y composicion agregada; excluye propio registro y estados cerrados. Es informativo, sin confirmacion ni bloqueo.
Salud del POS -> Revisar consistencia consulta paginas completas de pedidos activos/finalizados, productos, ingresos y movimientos. Informa origen, saldo calculado/guardado, cobros vinculados, total de lineas, stock/variantes y ecuacion de movimientos. No modifica datos ni reconstruye inventario desde kardex parcial. Registros antiguos sin vinculo de cobro requieren revision manual. Lectura incompleta o sincronizacion pendiente no se presenta como comprobacion terminada.
Validacion: 241 pruebas, tipos/lint/build correctos. UI aislada: talla/precio conservado, aviso duplicado con guardado habilitado, guardado real en base ficticia, seleccion de fotos, Ctrl+V con imagen, error individual y reintento. Escritorio y controles de 390px sin overflow de modal; selector movil250px. Storage de staging rechaza a proposito: exito/reintentos/lost-ack comprobados por pruebas de persistencia con transporte simulado. Detector: cero avisos CSS marca; 164 avisos legacy HTML/TS fuera del diff. Sin SQL, cambios de permisos ni datos reales usados para pruebas.
Publicado Cloudflare6058b76f. Dominio401 anonimo/200 autorizado; index/CSS/core/pedidos/SW identicos al paquete. Cache maneki-c3577f6f60. Grafo MCP5338 nodos.
