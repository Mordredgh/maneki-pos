import {it,expect,vi} from 'vitest';
import {createHash} from 'node:crypto';
import {backupStorage,restoreStorage} from '../scripts/backup-storage.mjs';
const key='clave-ficticia-para-pruebas-2026';
it('crea una copia inmutable con manifiesto y restaura exactamente cada imagen',async()=>{
 const objects=new Map<string,Buffer>();const original=Buffer.from([0,1,2,255,10]);
 const response=(body:any)=>({ok:true,json:async()=>body,arrayBuffer:async()=>original});
 const fetcher=vi.fn(async(url:string,opts:any)=>{
  if(url.includes('/object/list/product-images'))return response(JSON.parse(opts.body).prefix==='camisetas/'?[{name:'M.webp',id:'1',metadata:{size:original.length}}]:[{name:'camisetas',id:null}]);
  if(url.includes('/object/list/pedidos-referencias'))return response([]);
  if(url.includes('/object/product-images/camisetas/M.webp'))return response(null);
  throw Error('Ruta inesperada '+url);
 });
 const client:any={send:async(c:any)=>{const name=c.constructor.name,k=c.input.Key;
  if(name==='PutObjectCommand'){expect(objects.has(k)).toBe(false);objects.set(k,Buffer.from(c.input.Body));return {};}
  const data=objects.get(k);return {Body:data&&{transformToByteArray:async()=>data}};
 }};
 const manifest=await backupStorage({supabaseUrl:'https://example.test',serviceKey:'fake',r2Client:client,r2Bucket:'bucket',password:key,runId:'bicho-pos-2026-09-27'} as any,{fetcher});
 expect(manifest.entries).toEqual([{bucket:'product-images',name:'camisetas/M.webp',key:'runs/bicho-pos-2026-09-27/product-images/camisetas%2FM.webp.bichoblob',sha256:createHash('sha256').update(original).digest('hex'),size:5}]);
 const restored=await restoreStorage({r2Client:client,r2Bucket:'bucket',password:key,runId:'bicho-pos-2026-09-27'} as any);
 expect(restored[0].data).toEqual(original);
 const blob=objects.get(manifest.entries[0].key)!;blob[blob.length-1]^=1;
 await expect(restoreStorage({r2Client:client,r2Bucket:'bucket',password:key,runId:'bicho-pos-2026-09-27'} as any)).rejects.toThrow();
});
