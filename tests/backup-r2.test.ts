import {it,expect} from 'vitest';
import {encryptSnapshot} from '../scripts/backup-lib.mjs';
import {uploadVerifiedBackup} from '../scripts/backup-r2.mjs';

it('solo confirma respaldo cuando el objeto remoto se puede descifrar',async()=>{
 const snapshot={format:'bicho-pos-tables-v1',tables:{products:[{id:'p1'}],orders:[],incomes:[],expenses:[],store:[]}};
 const password='clave-ficticia-de-prueba-2026';
 const encrypted=encryptSnapshot(snapshot,password);
 let remote=Buffer.alloc(0);
 const client:any={send:async(command:any)=>{
  if(command.constructor.name==='PutObjectCommand'){remote=Buffer.from(command.input.Body);return {};}
  return {Body:{transformToByteArray:async()=>remote}};
 }};
 await expect(uploadVerifiedBackup(client,'bicho-pos-backups','bicho-pos-test.bichobk',encrypted,password,snapshot)).resolves.toBeUndefined();
 remote=Buffer.from(encrypted);remote[remote.length-1]^=1;
 const corrupted:any={send:async()=>({Body:{transformToByteArray:async()=>remote}})};
 await expect(uploadVerifiedBackup(corrupted,'bicho-pos-backups','bicho-pos-test.bichobk',encrypted,password,snapshot)).rejects.toThrow();
});
