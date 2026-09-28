import {createHash} from 'node:crypto';
import {encryptBlob,decryptBlob} from './backup-blob.mjs';
import {PutObjectCommand,GetObjectCommand} from '@aws-sdk/client-s3';

const buckets=['product-images','pedidos-referencias'];
const digest=data=>createHash('sha256').update(data).digest('hex');
const validRun=id=>/^bicho-pos-[A-Za-z0-9-]+$/.test(id);
async function readR2(client,bucket,key){
 const result=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
 if(!result.Body)throw Error('Falta objeto del respaldo: '+key);
 return Buffer.from(await result.Body.transformToByteArray());
}

// Cada ejecución usa rutas propias. El manifiesto se publica al final y acredita la copia completa.
export async function backupStorage({supabaseUrl,serviceKey,r2Client,r2Bucket,password,runId},{fetcher=fetch}={}){
 if(!validRun(runId))throw Error('Identificador de respaldo inválido');
 const headers={apikey:serviceKey,'Content-Type':'application/json'};
 if(!serviceKey.startsWith('sb_secret_'))headers.Authorization=`Bearer ${serviceKey}`;
 const entries=[];
 for(const bucket of buckets){
  const visit=async prefix=>{
   for(let offset=0;;offset+=100){
    const response=await fetcher(`${supabaseUrl}/storage/v1/object/list/${bucket}`,{method:'POST',headers,body:JSON.stringify({prefix,limit:100,offset,sortBy:{column:'name',order:'asc'}}),signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw Error(`No se pudo listar Storage (${bucket}): HTTP ${response.status}`);
    const objects=await response.json();if(!Array.isArray(objects))throw Error('Listado Storage inválido');
    for(const object of objects){if(!object.name)continue;
     const name=prefix+object.name;
     if(!object.id){await visit(name+'/');continue;}
     const path=name.split('/').map(encodeURIComponent).join('/');
     const file=await fetcher(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`,{headers,signal:AbortSignal.timeout(60000)});
     if(!file.ok)throw Error(`No se pudo descargar Storage (${bucket}/${name}): HTTP ${file.status}`);
     const source=Buffer.from(await file.arrayBuffer());
     const key=`runs/${runId}/${bucket}/${encodeURIComponent(name)}.bichoblob`;
     await r2Client.send(new PutObjectCommand({Bucket:r2Bucket,Key:key,Body:encryptBlob(source,password),ContentType:'application/octet-stream'}));
     const remote=decryptBlob(await readR2(r2Client,r2Bucket,key),password);
     if(!remote.equals(source))throw Error('El objeto remoto no coincide: '+bucket+'/'+name);
     entries.push({bucket,name,key,sha256:digest(source),size:source.length});
    }
    if(objects.length<100)break;
   }
  };
  await visit('');
 }
 const manifest={format:'bicho-pos-storage-v1',runId,createdAt:new Date().toISOString(),entries};
 const key=`runs/${runId}/manifest.bichoblob`,body=encryptBlob(Buffer.from(JSON.stringify(manifest)),password);
 await r2Client.send(new PutObjectCommand({Bucket:r2Bucket,Key:key,Body:body,ContentType:'application/octet-stream'}));
 if(decryptBlob(await readR2(r2Client,r2Bucket,key),password).toString()!==JSON.stringify(manifest))throw Error('Manifiesto remoto distinto');
 return manifest;
}

// Devuelve bytes para escribirlos sólo en un destino aislado elegido por el operador.
export async function restoreStorage({r2Client,r2Bucket,password,runId}){
 if(!validRun(runId))throw Error('Identificador de respaldo inválido');
 const key=`runs/${runId}/manifest.bichoblob`;
 const manifest=JSON.parse(decryptBlob(await readR2(r2Client,r2Bucket,key),password).toString());
 if(manifest.format!=='bicho-pos-storage-v1'||manifest.runId!==runId||!Array.isArray(manifest.entries))throw Error('Manifiesto inválido');
 const restored=[];
 for(const entry of manifest.entries){
  if(!buckets.includes(entry.bucket)||typeof entry.name!=='string'||entry.name.includes('..')||entry.name.startsWith('/')||entry.key!==`runs/${runId}/${entry.bucket}/${encodeURIComponent(entry.name)}.bichoblob`)throw Error('Ruta de imagen inválida');
  const data=decryptBlob(await readR2(r2Client,r2Bucket,entry.key),password);
  if(data.length!==entry.size||digest(data)!==entry.sha256)throw Error('Imagen no coincide con el manifiesto: '+entry.name);
  restored.push({bucket:entry.bucket,name:entry.name,data});
 }
 return restored;
}
