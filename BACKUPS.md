# Respaldos del POS

## Estado 2026-09-27

R2 ya esta activado por el propietario. Bucket privado `bicho-pos-backups`, clase Standard, acceso publico deshabilitado. `.env.backup.local` existe solo en este equipo con una clave de cifrado aleatoria y una clave privada existente de Supabase; no esta en Git ni en Pages. Primera instantanea local cifrada y descifrada: 24 tablas. **El respaldo remoto automatico aun no esta activo**: falta crear el token R2 limitado al bucket, comprobar subida/descarga y registrar la tarea programada.

`scripts/backup-external.mjs` conserva el archivo cifrado local y, al configurar R2, lo sube y vuelve a descargarlo para comprobar descifrado y contenido. El ciclo remoto paso una prueba automatizada con transporte simulado. Para terminar la configuracion, agregar a `.env.backup.local` `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY`. Solo declarar operativo el respaldo cuando la ejecucion real confirme la descarga remota. Guardar la clave de cifrado en un gestor de contrasenas separado del bucket. Nunca incluir esta configuracion en Cloudflare Pages ni en Git.

El respaldo KV `store.products` permitio recuperar seis tablas de precios variables, pero vive en la misma base de Supabase y no reemplaza un respaldo externo.

`pos_backup_snapshot()` toma las tablas operativas, configuracion KV (incluye cortes), recibos de operaciones y auditoria en una consulta PostgreSQL. No depende de los limites de carga de la pantalla. Solo administradores existentes y service_role pueden ejecutarla.

Es un respaldo logico de datos del POS. No incluye usuarios/passwords de Supabase Auth, objetos binarios de Storage, esquema SQL completo ni configuracion Cloudflare. Las migraciones y el codigo se conservan en Git. Para recuperacion integral de infraestructura tambien hay que conservar esos componentes.

## Archivo externo
`scripts/backup-external.mjs` obtiene la instantanea desde el proyecto Bicho Core, comprime y cifra con AES-256-GCM y clave derivada mediante scrypt. Escribe primero un archivo temporal, lo descifra y compara antes de renombrarlo. No borra respaldos anteriores ni imprime secretos.

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
