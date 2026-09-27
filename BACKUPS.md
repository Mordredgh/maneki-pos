# Respaldos del POS

## Estado 2026-09-27
Preparados y probados el formato cifrado, la consulta completa y la restauracion de datos operativos en una segunda base local. **Todavia no hay un respaldo externo programado activo**: falta elegir destino y configurar la credencial del proceso. No se activo ningun servicio de pago.

Verificado de nuevo el 2026-09-27: `.env.backup.local` no existe y el Programador de tareas de Windows no contiene una tarea que ejecute `backup-external.mjs`. El respaldo KV `store.products` permitio recuperar seis tablas de precios variables, pero vive en la misma base de Supabase y no reemplaza un respaldo externo.

`pos_backup_snapshot()` toma las tablas operativas, configuracion KV (incluye cortes), recibos de operaciones y auditoria en una consulta PostgreSQL. No depende de los limites de carga de la pantalla. Solo administradores existentes y service_role pueden ejecutarla.

Es un respaldo logico de datos del POS. No incluye usuarios/passwords de Supabase Auth, objetos binarios de Storage, esquema SQL completo ni configuracion Cloudflare. Las migraciones y el codigo se conservan en Git. Para recuperacion integral de infraestructura tambien hay que conservar esos componentes.

## Archivo externo
`scripts/backup-external.mjs` obtiene la instantanea desde el proyecto Bicho Core, comprime y cifra con AES-256-GCM y clave derivada mediante scrypt. Escribe primero un archivo temporal, lo descifra y compara antes de renombrarlo. No borra respaldos anteriores ni imprime secretos.

Crear `.env.backup.local` (ignorado por Git) con `POS_BACKUP_DIR`, `POS_BACKUP_KEY` (aleatoria, minimo 24 caracteres) y `SUPABASE_SERVICE_ROLE_KEY`. Esta credencial es solo del proceso local, nunca del navegador ni del paquete de Pages. Guardar una copia de la clave de cifrado por separado del respaldo.

Comando cuando el destino y las credenciales esten configurados:
```powershell
node --env-file=.env.backup.local scripts/backup-external.mjs
```

La carpeta puede estar sincronizada con un proveedor ya autorizado. Escribir localmente no demuestra que la sincronizacion externa termino: verificar el archivo remoto antes de declarar operativo el respaldo. R2 requiere configurar un destino distinto; el script actual escribe a carpeta.

## Restauracion ensayada
`tests/backup-archive.test.ts`: cifrado/descifrado, clave incorrecta y archivo alterado.
`tests/atomic-db.test.ts`: snapshot desde PostgreSQL, archivo cifrado, restauracion en otra base vacia, conteos, importes y cortes coincidentes. Datos sinteticos; nunca sobrescribe produccion.

Para un incidente real: recuperar en un proyecto aislado con el esquema correcto, verificar conteos/folios/saldos y luego planear el cambio de origen. No ejecutar un import masivo directamente sobre produccion. La auditoria protegida requiere restauracion por el propietario de la base, no por el cliente web.

El backup del menu de la app sigue siendo una exportacion de los datos cargados en esa sesion. Incluye cortes; no sustituye el snapshot completo. La copia automatica en localStorage vive en el mismo dispositivo y tampoco sustituye el respaldo externo.
