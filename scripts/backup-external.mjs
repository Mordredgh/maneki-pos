// Ejecutar con --env-file=.env.backup.local. No imprime credenciales ni datos.
import {mkdir,writeFile,readFile,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {encryptSnapshot,decryptSnapshot} from './backup-lib.mjs';
const {POS_BACKUP_DIR,POS_BACKUP_KEY,SUPABASE_SERVICE_ROLE_KEY}=process.env;
if(!POS_BACKUP_DIR||!POS_BACKUP_KEY||!SUPABASE_SERVICE_ROLE_KEY)throw Error('Configura destino, clave de cifrado y credencial de respaldo en .env.backup.local');
const response=await fetch('https://hoqcrljgmamaumtdrtzi.supabase.co/rest/v1/rpc/pos_backup_snapshot',{method:'POST',headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(120000)});
if(!response.ok)throw Error('No se pudo obtener respaldo: HTTP '+response.status);
const snapshot=await response.json(),encrypted=encryptSnapshot(snapshot,POS_BACKUP_KEY);
const folder=resolve(POS_BACKUP_DIR);await mkdir(folder,{recursive:true});
const file=join(folder,`bicho-pos-${new Date().toISOString().replace(/[:.]/g,'-')}.bichobk`),temp=file+'.partial';
await writeFile(temp,encrypted,{flag:'wx'});const verified=decryptSnapshot(await readFile(temp),POS_BACKUP_KEY);
if(JSON.stringify(verified)!==JSON.stringify(snapshot))throw Error('Verificacion del respaldo fallida');
await rename(temp,file);
console.log('Respaldo cifrado escrito y verificado. Tablas: '+Object.keys(snapshot.tables).length);
