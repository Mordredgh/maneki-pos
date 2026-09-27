# Publicacion en Cloudflare Pages

Migracion solicitada el 2026-09-26. Cuenta verificada en el navegador; proyecto creado: `bicho-capricho-pos`. Carga directa, sin integracion Git. No usar `deploy.ps1`: ese script sigue apuntando al VPS anterior.

## Build reproducible

```powershell
npm ci
npm run build:cloudflare
Compress-Archive -Path 'dist\cloudflare\*' -DestinationPath 'dist\bicho-capricho-pos-cloudflare.zip' -Force
```

El build ejecuta typecheck, 133 pruebas, lint, compilacion, bundles y hash del Service Worker. El empaquetador produce `dist/cloudflare` con una lista explicita de archivos publicos, sin mapas, TypeScript, documentos, SQL, respaldos ni archivos .env. Supabase conserva los datos; esta migracion no copia ni modifica tablas.

Para la carga desde el panel, elegir el ZIP generado; para Wrangler, usar la carpeta `dist/cloudflare`. No publicar la raiz del repositorio. El proyecto usa Direct Upload: una futura integracion Git nativa necesita otro proyecto o un flujo de CI que cargue el paquete mediante Wrangler.

## Estado publicado

- Produccion: https://bicho-capricho-pos.pages.dev
- Deployment: https://f5aa43a9.bicho-capricho-pos.pages.dev (rama de produccion main confirmada por API).
- Build completo: 133 pruebas, lint y 34 TS correctos; build:check tambien correcto. npm audit: cero vulnerabilidades.
- Paquete: 65 archivos; Worker y _routes.json incluyen autenticacion para todas las rutas. Secretos POS_USER/POS_PASSWORD cifrados en Cloudflare; copia local solo .env.local ignorado por Git.
- Acceso comprobado en ambos hosts: sin credenciales/incorrectas 401; credenciales correctas 200. JS, Service Worker y manifest responden 200 autenticados. Respuestas privadas no-store.
- Navegador integrado no abre Basic Auth (ERR_BLOCKED_BY_CLIENT); falta comprobar navegacion publicada en navegador normal. Las 11 secciones se probaron previamente en local.
- Wrangler fijado a 4.141.0 en devDependencies; configuracion wrangler.toml. No usar el ZIP anterior de 63 archivos sin Worker: regenerarlo antes de cargas manuales.

```powershell
npx wrangler pages secret bulk .env.local --project-name bicho-capricho-pos
npx wrangler pages deploy dist/cloudflare --project-name bicho-capricho-pos --branch main --commit-dirty=true
```

No publicar previews sin configurar sus secretos: el Worker falla cerrado con 503 si faltan. Basic Auth protege la red; no bloquea datos almacenados previamente en el dispositivo ni sustituye RLS.

## Herramientas Cloudflare para Codex

Guia ejecutada: https://developers.cloudflare.com/agent-setup/prompt.md
14 skills oficiales instaladas en C:/Users/gerar/.agents/skills. Cinco MCP registrados en C:/Users/gerar/.codex/config.toml, con respaldo previo config.toml.cloudflare-setup.bak. Principal, builds y observability autenticados; bindings pendiente de OAuth; docs publico. Reiniciar Codex para cargar herramientas. Permisos del principal limitados a usuario, cuenta, acceso persistente y metadatos de Pages. Wrangler usa autorizacion separada con Pages Write.

## Dominio

Objetivo existente: `pos.manekistore.com.mx`. DNS autoritativos observados: `ns1.dns-parking.com`, `ns2.dns-parking.com`, externos a esta cuenta Cloudflare.

Dominio asociado en Pages por API el 2026-09-26. Hostinger actualizado: eliminado A pos -> 195.26.247.101 (TTL anterior 14400) y creado CNAME pos -> bicho-capricho-pos.pages.dev (TTL 300). Nameserver autoritativo confirma destino. Propagacion confirmada por 1.1.1.1, 8.8.8.8 y autoritativo. Cloudflare informa dominio, verificacion y validacion active. HTTPS correcto: 401 anonimo y 200 autorizado, sin desactivar validacion TLS. No cambiar servidores DNS del dominio completo ni tocar registros de correo u otros subdominios. Verificar HTTPS, acceso, inventario, reportes y actualizacion PWA desde el dominio original. Conservarlo mantiene el origen de almacenamiento local del navegador.

La lectura anonima de datos de Supabase detectada en AUDITORIA-2026-09-26.md sigue pendiente: proteger el sitio no sustituye Auth/RLS de la base de datos.

Proveedor DNS confirmado: Hostinger. Cambio realizado desde sesion autorizada del propietario. El editor no permite convertir A en CNAME (422 conflicto RRset); se sustituyo solo pos. Reversion: retirar CNAME pos y restaurar A 195.26.247.101 TTL 14400.

## Actualizacion de produccion

Vigente 2026-09-27, alertas operativas: https://9876233e.bicho-capricho-pos.pages.dev, SW `maneki-20343b8796`. 170 pruebas, 37 TS, lint y paquete Cloudflare correctos. Dominio y deployment: 401 anonimo, 200 autorizado; JS y SW 200 con el mismo hash. Incluye entregas vencidas, acceso a cobros/pedidos/inventario y actualizacion por cambios de saldo/stock/estado. R2 es un script local preparado, no un servicio activo: la cuenta aun requiere suscripcion, bucket y credenciales. Ver BACKUPS.md.

Vigente 2026-09-27, rediseño de pedidos y productos variables: https://1f79592f.bicho-capricho-pos.pages.dev, SW `maneki-3d9b3af01e`. Build Cloudflare: 168 pruebas, 37 TS, lint y empaquetado correctos; `build:check` y `git diff --check` correctos. En el dominio `pos.manekistore.com.mx` y en el deployment, HTTP 401 anonimo y 200 autorizado; `sw.js` responde 200 con el mismo hash. Staging local con datos ficticios: producto variable, selector talla/color, precio por cantidad, pedido completo y vista movil comprobados. No se escribieron ventas de prueba en produccion.

Vigente 2026-09-27: https://5ebff075.bicho-capricho-pos.pages.dev, SW `maneki-d7ac161133`. 160 pruebas, 37 TS, lint y tipos correctos. Incluye caja, auditoria, wizard de pedidos y ajustes de inventario. Migraciones audit/cash/backup aplicadas. Dominio verificado: 401 anonimo, 200 autorizado, mismo hash SW. Respaldo externo aun sin activar; ver BACKUPS.md.

Historico 2026-09-26: https://d56ec9a7.bicho-capricho-pos.pages.dev, SW `maneki-d3509c7401`. 152 pruebas; 36 TS, lint y tipos correctos. Nuevas migraciones `financial-ids` y `atomic-operations` aplicadas y verificadas en Supabase; cero QA persistente. Incluye inicio compacto, bloqueo/cierre, revision de conflictos y transacciones de negocio. Staging local excluido del despliegue. Los parrafos anteriores y entradas siguientes describen el historial; pendientes de RLS/bot ya cerrados.
2026-09-26: https://1742889c.bicho-capricho-pos.pages.dev, SW maneki-1ed0b2f342. 140 pruebas, 36 TS y build:check correctos. Login Supabase administrador ademas de Basic Auth. RLS parcial aplicada; store pendiente por compatibilidad del bot. Detalles vigentes en VALIDACION-2026-09-26.md.

2026-09-26, cierre posterior: propietario confirma bot eliminado. RLS de store aplicada y probada; ya no queda pendiente de compatibilidad. Lectura de claves privadas y escritura anonima bloqueadas, administrador operativo.


## Botones y acciones uniformes — 2026-09-27

Publicado https://b41f5101.bicho-capricho-pos.pages.dev; SW `maneki-9be41d3892`. Jerarquia de botones compartida, contraste oscuro sobre amarillo, iconos de accion accesibles, Inventario con acciones visibles al desplazar tabla y cabeceras moviles; Balance con botones etiquetados y tarjetas. Revisadas secciones principales en staging con datos ficticios y vista de 390 px; apertura/cierre de ingreso sin guardar datos. 170 pruebas, typecheck, lint de iconos y build correctos. Dominio y deployment: 401 anonimo, 200 autorizado, CSS y SW 200 con hash verificado. Respaldo R2 sigue pendiente del token y programacion; este cambio es visual.


## Respaldo R2 activo — 2026-09-27

Propietario autorizo continuar. Token bicho-pos-backup limitado a Object Read & Write en bicho-pos-backups; secreto solo en .env.backup.local ignorado. Dos archivos cifrados reales, 24 tablas, comprobados por subida/descarga/descifrado. Tarea Windows Bicho POS R2 Backup activa a las 20:00 y al iniciar sesion; ejecucion de prueba exitosa (resultado 0). Bucket privado, sin acceso publico. Depende del equipo encendido y sesion iniciada. Ver BACKUPS.md; las notas anteriores de bloqueo quedaron resueltas. No hubo cambios al sitio ni nuevo despliegue.
