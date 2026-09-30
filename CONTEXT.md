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
