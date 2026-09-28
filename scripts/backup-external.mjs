// Ejecutar con --env-file=.env.backup.local. No imprime credenciales ni datos.
import {mkdir,writeFile,readFile,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {encryptSnapshot,decryptSnapshot} from './backup-lib.mjs';
import {createR2Client,uploadVerifiedBackup} from './backup-r2.mjs';
import {backupStorage} from './backup-storage.mjs';
const {POS_BACKUP_DIR,POS_BACKUP_KEY,SUPABASE_SERVICE_ROLE_KEY}=process.env;
if(!POS_BACKUP_DIR||!POS_BACKUP_KEY||!SUPABASE_SERVICE_ROLE_KEY)throw Error('Configura destino, clave de cifrado y credencial de respaldo en .env.backup.local');
const headers={apikey:SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
if(!SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_'))headers.Authorization=`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
const response=await fetch('https://hoqcrljgmamaumtdrtzi.supabase.co/rest/v1/rpc/pos_backup_snapshot',{method:'POST',headers,body:'{}',signal:AbortSignal.timeout(120000)});
if(!response.ok)throw Error('No se pudo obtener respaldo: HTTP '+response.status);
const snapshot=await response.json(),encrypted=encryptSnapshot(snapshot,POS_BACKUP_KEY);
const folder=resolve(POS_BACKUP_DIR);await mkdir(folder,{recursive:true});
const file=join(folder,`bicho-pos-${new Date().toISOString().replace(/[:.]/g,'-')}.bichobk`),temp=file+'.partial';
await writeFile(temp,encrypted,{flag:'wx'});const verified=decryptSnapshot(await readFile(temp),POS_BACKUP_KEY);
if(JSON.stringify(verified)!==JSON.stringify(snapshot))throw Error('Verificacion del respaldo fallida');
await rename(temp,file);
const {R2_ACCOUNT_ID,R2_BUCKET,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY}=process.env;
if([R2_ACCOUNT_ID,R2_BUCKET,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY].some(Boolean)){
 if(![R2_ACCOUNT_ID,R2_BUCKET,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY].every(Boolean))throw Error('Configuracion R2 incompleta; respaldo local conservado');
 const r2Client=createR2Client(R2_ACCOUNT_ID,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY),runId=file.split(/[\\/]/).pop().replace(/\.bichobk$/,'');
 await uploadVerifiedBackup(r2Client,R2_BUCKET,runId+'.bichobk',encrypted,POS_BACKUP_KEY,snapshot);
 const manifest=await backupStorage({supabaseUrl:'https://hoqcrljgmamaumtdrtzi.supabase.co',serviceKey:SUPABASE_SERVICE_ROLE_KEY,r2Client,r2Bucket:R2_BUCKET,password:POS_BACKUP_KEY,runId});
 const statusResponse=await fetch('https://hoqcrljgmamaumtdrtzi.supabase.co/rest/v1/store?on_conflict=key',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({key:'pos_backup_status',value:JSON.stringify({runId,verifiedAt:new Date().toISOString(),tables:Object.keys(snapshot.tables).length,images:manifest.entries.length})}),signal:AbortSignal.timeout(30000)});
 if(!statusResponse.ok)throw Error('Respaldo R2 verificado, pero no se pudo registrar su estado: HTTP '+statusResponse.status);
 console.log('Respaldo cifrado verificado en R2. Tablas: '+Object.keys(snapshot.tables).length+'. Imagenes: '+manifest.entries.length+'. Ejecucion: '+runId);
}else{
 console.log('Respaldo cifrado local verificado; destino externo no configurado. Tablas: '+Object.keys(snapshot.tables).length);
}
