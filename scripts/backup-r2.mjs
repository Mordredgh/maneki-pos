import {S3Client,PutObjectCommand,GetObjectCommand} from '@aws-sdk/client-s3';
import {decryptSnapshot} from './backup-lib.mjs';

export function createR2Client(accountId,accessKeyId,secretAccessKey){
 if(!/^[a-f0-9]{32}$/.test(accountId)||!accessKeyId||!secretAccessKey)throw Error('Credenciales R2 incompletas');
 return new S3Client({region:'auto',endpoint:`https://${accountId}.r2.cloudflarestorage.com`,credentials:{accessKeyId,secretAccessKey}});
}

export async function uploadVerifiedBackup(client,bucket,key,encrypted,password,snapshot){
 if(!/^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket)||!/^bicho-pos-[\w-]+\.bichobk$/.test(key))throw Error('Destino R2 invalido');
 await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:encrypted,ContentType:'application/octet-stream'}));
 const response=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
 if(!response.Body)throw Error('R2 no devolvio el respaldo');
 const remote=Buffer.from(await response.Body.transformToByteArray());
 if(JSON.stringify(decryptSnapshot(remote,password))!==JSON.stringify(snapshot))throw Error('El respaldo remoto no coincide con la instantanea');
}
