# Respaldos del POS

## Estado 2026-09-27

**Respaldo remoto automatico activo y verificado.** Bucket privado `bicho-pos-backups`, Standard, acceso publico deshabilitado. Token de cuenta `bicho-pos-backup`, Object Read & Write solo para ese bucket, sin vencimiento. Credenciales y clave de cifrado solo en `.env.backup.local`, ignorado por Git y excluido del paquete Pages.

La ejecución del 2026-09-27 verificó 113 objetos binarios de Storage: `product-images` y `pedidos-referencias`. Cada imagen se cifra con AES-256-GCM bajo `runs/<ejecucion>/<bucket>/`; un manifiesto cifrado con tamaño y SHA-256 se publica al final. Así una ejecución no sobrescribe otra. La restauración aislada descargó y verificó los 113 archivos y las 24 tablas. No se borran copias anteriores.

El 2026-09-27 se verificaron dos archivos cifrados de 24 tablas, 101.1 KB cada uno: ejecucion directa `bicho-pos-2026-09-27T18-12-30-895Z.bichobk` y ejecucion desde el Programador de tareas `bicho-pos-2026-09-27T18-12-42-664Z.bichobk`. Ambos se subieron, descargaron, descifraron y compararon con la instantanea original. Acceso publico Disabled comprobado en Cloudflare.

Tarea Windows `Bicho POS R2 Backup`: todos los dias a las 20:00 (hora local) y al iniciar sesion; `StartWhenAvailable`, limite 15 minutos, usuario actual sin elevacion. Prueba desde el Programador: `LastTaskResult=0`, estado Ready, proxima ejecucion 2026-09-27 20:00. Requiere este equipo encendido y sesion iniciada; no es un servicio independiente en la nube. No elimina copias anteriores.

El propietario eligió conservar por ahora la tarea en el PC y guardar después una copia separada de `POS_BACKUP_KEY`. Sin esa clave no se pueden descifrar los archivos ante pérdida del equipo. No imprimirla ni adjuntarla a notas o Git. Para comprobar ejecuciones: `Get-ScheduledTaskInfo -TaskName 'Bicho POS R2 Backup'`.

El respaldo KV `store.products` permitio recuperar seis tablas de precios variables, pero vive en la misma base de Supabase y no reemplaza un respaldo externo.

`pos_backup_snapshot()` toma las tablas operativas, configuracion KV (incluye cortes), recibos de operaciones y auditoria en una consulta PostgreSQL. No depende de los limites de carga de la pantalla. Solo administradores existentes y service_role pueden ejecutarla.

Es un respaldo lógico de tablas y de los dos buckets de imágenes del POS. No incluye usuarios/passwords de Supabase Auth, esquema SQL completo ni configuración Cloudflare. Las migraciones y el código se conservan en Git. Para recuperación integral de infraestructura también hay que conservar esos componentes.

## Archivo externo
`scripts/backup-external.mjs` obtiene la instantanea desde el proyecto Bicho Core, comprime y cifra con AES-256-GCM y clave derivada mediante scrypt. Escribe primero un archivo temporal, lo descifra y compara antes de renombrarlo. Después copia y verifica los objetos de Storage. No borra respaldos anteriores ni imprime secretos.

`.env.backup.local` (ignorado por Git) contiene `POS_BACKUP_DIR`, `POS_BACKUP_KEY` (aleatoria, minimo 24 caracteres) y `SUPABASE_SERVICE_ROLE_KEY`. Esta credencial es solo del proceso local, nunca del navegador ni del paquete de Pages. Guardar una copia de la clave de cifrado por separado del respaldo.

Comando cuando el destino y las credenciales esten configurados:
```powershell
node --env-file=.env.backup.local scripts/backup-external.mjs
```

Sin las cuatro variables R2, el comando solo guarda la copia local y lo anuncia. Con R2 configurado, verifica el objeto remoto por lectura y descifrado antes de anunciar exito externo.

El panel «Salud del POS» lee de `store.pos_backup_status` la fecha, tablas e imágenes de la última copia remota verificada. El proceso escribe ese estado sólo después de publicar y comprobar el manifiesto de Storage.

Despues de comprobar la primera subida real, `scripts/register-backup-task.ps1` registra una tarea Windows a las 20:00 y al iniciar sesion. Corre bajo el usuario actual y requiere que la sesion este iniciada. `StartWhenAvailable` recupera una ejecucion omitida cuando la maquina vuelve a estar disponible; el respaldo no ocurre mientras el equipo esta apagado. Comprobar el resultado de la tarea y la presencia del objeto remoto periodicamente.

## Restauracion ensayada
`tests/backup-archive.test.ts`: cifrado/descifrado, clave incorrecta y archivo alterado.
`tests/atomic-db.test.ts`: snapshot desde PostgreSQL, archivo cifrado, restauracion en otra base vacia, conteos, importes y cortes coincidentes. Datos sinteticos; nunca sobrescribe produccion.

Para un incidente real: recuperar en un proyecto aislado con el esquema correcto, verificar conteos/folios/saldos y luego planear el cambio de origen. No ejecutar un import masivo directamente sobre produccion. La auditoria protegida requiere restauracion por el propietario de la base, no por el cliente web.

Para inspeccionar una ejecución real sin tocar producción:
```powershell
node --env-file=.env.backup.local scripts/restore-external.mjs <ejecucion> <carpeta-nueva>
```
El comando crea una carpeta nueva con `snapshot.json` y ambos buckets, valida manifiesto y SHA-256, y falla si faltan o se alteraron archivos. La prueba real recuperó 24 tablas y 113 imágenes.

El backup del menu de la app sigue siendo una exportacion de los datos cargados en esa sesion. Incluye cortes; no sustituye el snapshot completo. La copia automatica en localStorage vive en el mismo dispositivo y tampoco sustituye el respaldo externo.
