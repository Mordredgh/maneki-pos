import {readFile} from 'node:fs/promises';
import {encryptBlob,decryptBlob} from './backup-blob.mjs';
import {PutObjectCommand,GetObjectCommand} from '@aws-sdk/client-s3';
const buckets=['product-images','pedidos-referencias'];
export async function backupStorage({supabaseUrl,key,serviceKey,r2Client,r2Bucket,password}){
 const headers={apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'};let count=0;
 for(const bucket of buckets){
  const list=await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`,{method:'POST',headers,body:JSON.stringify({prefix:'',limit:5000,offset:0,sortBy:{column:'name',order:'asc'}})});
  if(!list.ok){if(list.status===404)continue;throw Error(`No se pudo listar Storage (${bucket}): HTTP ${list.status}`);}
  const objects=await list.json();for(const object of objects){if(!object.name||object.id===null)continue;
   const safe=encodeURIComponent(object.name);const file=await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${object.name.split('/').map(encodeURIComponent).join('/')}`,{headers});
   if(!file.ok)throw Error(`No se pudo descargar Storage (${bucket}/${object.name}): HTTP ${file.status}`);
   const encrypted=encryptBlob(Buffer.from(await file.arrayBuffer()),password),keyName=`objects/${bucket}/${safe}.bichoblob`;
   await r2Client.send(new PutObjectCommand({Bucket:r2Bucket,Key:keyName,Body:encrypted,ContentType:'application/octet-stream'}));
   const remote=await r2Client.send(new GetObjectCommand({Bucket:r2Bucket,Key:keyName}));if(!remote.Body||!decryptBlob(Buffer.from(await remote.Body.transformToByteArray()),password).length&&Number(object.metadata?.size||0)>0)throw Error(`Verificación Storage fallida: ${keyName}`);count++;
  }
 }
 return count;
}
