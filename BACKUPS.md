# Respaldos del POS

## Estado 2026-09-27

**Respaldo remoto automatico activo y verificado.** Bucket privado `bicho-pos-backups`, Standard, acceso publico deshabilitado. Token de cuenta `bicho-pos-backup`, Object Read & Write solo para ese bucket, sin vencimiento. Credenciales y clave de cifrado solo en `.env.backup.local`, ignorado por Git y excluido del paquete Pages.

La ejecución del 2026-09-27 también verificó 113 objetos binarios de Storage: `product-images` y `pedidos-referencias`. Cada imagen se cifra con AES-256-GCM, se sube bajo `objects/<bucket>/` y se lee de R2 para comprobar autenticidad. Los blobs no se mezclan con la instantánea JSON de tablas.

El 2026-09-27 se verificaron dos archivos cifrados de 24 tablas, 101.1 KB cada uno: ejecucion directa `bicho-pos-2026-09-27T18-12-30-895Z.bichobk` y ejecucion desde el Programador de tareas `bicho-pos-2026-09-27T18-12-42-664Z.bichobk`. Ambos se subieron, descargaron, descifraron y compararon con la instantanea original. Acceso publico Disabled comprobado en Cloudflare.

Tarea Windows `Bicho POS R2 Backup`: todos los dias a las 20:00 (hora local) y al iniciar sesion; `StartWhenAvailable`, limite 15 minutos, usuario actual sin elevacion. Prueba desde el Programador: `LastTaskResult=0`, estado Ready, proxima ejecucion 2026-09-27 20:00. Requiere este equipo encendido y sesion iniciada; no es un servicio independiente en la nube. No elimina copias anteriores.

Guardar una copia de `POS_BACKUP_KEY` en un gestor de contrasenas separado del equipo y del bucket; esto sigue a cargo del propietario. Sin esa clave no se pueden descifrar los archivos ante perdida del equipo. No imprimirla ni adjuntarla a notas o Git. Para comprobar ejecuciones: `Get-ScheduledTaskInfo -TaskName 'Bicho POS R2 Backup'`.

El respaldo KV `store.products` permitio recuperar seis tablas de precios variables, pero vive en la misma base de Supabase y no reemplaza un respaldo externo.

`pos_backup_snapshot()` toma las tablas operativas, configuracion KV (incluye cortes), recibos de operaciones y auditoria en una consulta PostgreSQL. No depende de los limites de carga de la pantalla. Solo administradores existentes y service_role pueden ejecutarla.

Es un respaldo logico de datos del POS. No incluye usuarios/passwords de Supabase Auth, objetos binarios de Storage, esquema SQL completo ni configuracion Cloudflare. Las migraciones y el codigo se conservan en Git. Para recuperacion integral de infraestructura tambien hay que conservar esos componentes.

## Archivo externo
`scripts/backup-external.mjs` obtiene la instantanea desde el proyecto Bicho Core, comprime y cifra con AES-256-GCM y clave derivada mediante scrypt. Escribe primero un archivo temporal, lo descifra y compara antes de renombrarlo. Después copia y verifica los objetos de Storage. No borra respaldos anteriores ni imprime secretos.

`.env.backup.local` (ignorado por Git) contiene `POS_BACKUP_DIR`, `POS_BACKUP_KEY` (aleatoria, minimo 24 caracteres) y `SUPABASE_SERVICE_ROLE_KEY`. Esta credencial es solo del proceso local, nunca del navegador ni del paquete de Pages. Guardar una copia de la clave de cifrado por separado del respaldo.

Comando cuando el destino y las credenciales esten configurados:
```powershell
node --env-file=.env.backup.local scripts/backup-external.mjs
```

Sin las cuatro variables R2, el comando solo guarda la copia local y lo anuncia. Con R2 configurado, verifica el objeto remoto por lectura y descifrado antes de anunciar exito externo.

Despues de comprobar la primera subida real, `scripts/register-backup-task.ps1` registra una tarea Windows a las 20:00 y al iniciar sesion. Corre bajo el usuario actual y requiere que la sesion este iniciada. `StartWhenAvailable` recupera una ejecucion omitida cuando la maquina vuelve a estar disponible; el respaldo no ocurre mientras el equipo esta apagado. Comprobar el resultado de la tarea y la presencia del objeto remoto periodicamente.

## Restauracion ensayada
`tests/backup-archive.test.ts`: cifrado/descifrado, clave incorrecta y archivo alterado.
`tests/atomic-db.test.ts`: snapshot desde PostgreSQL, archivo cifrado, restauracion en otra base vacia, conteos, importes y cortes coincidentes. Datos sinteticos; nunca sobrescribe produccion.

Para un incidente real: recuperar en un proyecto aislado con el esquema correcto, verificar conteos/folios/saldos y luego planear el cambio de origen. No ejecutar un import masivo directamente sobre produccion. La auditoria protegida requiere restauracion por el propietario de la base, no por el cliente web.

El backup del menu de la app sigue siendo una exportacion de los datos cargados en esa sesion. Incluye cortes; no sustituye el snapshot completo. La copia automatica en localStorage vive en el mismo dispositivo y tampoco sustituye el respaldo externo.
