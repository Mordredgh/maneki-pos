# Contexto del POS

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
