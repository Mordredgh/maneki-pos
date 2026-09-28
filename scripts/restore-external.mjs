// Recupera una ejecución en carpeta NUEVA; nunca escribe en Supabase ni en producción.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import {createR2Client} from './backup-r2.mjs';
import {decryptSnapshot} from './backup-lib.mjs';
import {restoreStorage} from './backup-storage.mjs';

const [runId,destination]=process.argv.slice(2);
if(!/^bicho-pos-[A-Za-z0-9-]+$/.test(runId||'')||!destination)throw Error('Uso: node --env-file=.env.backup.local scripts/restore-external.mjs <ejecucion> <carpeta-nueva>');
const {R2_ACCOUNT_ID,R2_BUCKET,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY,POS_BACKUP_KEY}=process.env;
if(![R2_ACCOUNT_ID,R2_BUCKET,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY,POS_BACKUP_KEY].every(Boolean))throw Error('Configuracion R2/clave incompleta');
const client=createR2Client(R2_ACCOUNT_ID,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY);
const db=await client.send(new GetObjectCommand({Bucket:R2_BUCKET,Key:runId+'.bichobk'}));
if(!db.Body)throw Error('No existe la instantanea SQL');
const snapshot=decryptSnapshot(Buffer.from(await db.Body.transformToByteArray()),POS_BACKUP_KEY);
const files=await restoreStorage({r2Client:client,r2Bucket:R2_BUCKET,password:POS_BACKUP_KEY,runId});
const root=resolve(destination);await mkdir(root,{recursive:false});
await writeFile(join(root,'snapshot.json'),JSON.stringify(snapshot));
for(const file of files){const name=resolve(root,file.bucket,file.name);if(!name.startsWith(root+'\\')&&!name.startsWith(root+'/'))throw Error('Ruta fuera del destino');await mkdir(dirname(name),{recursive:true});await writeFile(name,file.data,{flag:'wx'});}
console.log(`Recuperacion aislada verificada: ${Object.keys(snapshot.tables).length} tablas, ${files.length} imagenes. Carpeta: ${root}`);
