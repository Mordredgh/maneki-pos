import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';
import {randomUUID} from 'node:crypto';
import {createTestDatabase} from '../staging/database.mjs';
function app(){const window:any={};const ctx:any={window,console,structuredClone};runInNewContext(transformSync(readFileSync('src/inventory-count.ts','utf8'),{loader:'ts'}).code,ctx);return ctx;}
const playera={id:'p',name:'Playera',tipo:'producto_variable',stock:17,variants:[{type:'Talla/Color',value:'M / Negro',size:'M',color:'Negro',qty:12},{type:'Talla/Color',value:'L / Blanco',size:'L',color:'Blanco',qty:5}]};
it('compara cada combinacion contada y conserva ventas posteriores y apartados',()=>{
 const a=app(),lines=a.window.posLineasConteo([playera]);
 expect(lines).toHaveLength(2);
 const session={id:'c',lines:lines.map((l:any)=>({...l,baseline:l.value,counted:l.color==='Negro'?10:null}))};
 const now={...playera,variants:[{...playera.variants[0],qty:9},playera.variants[1]]};
 const view=a.window.posCompararConteo(session,{products:[now],orders:[]});
 expect(view).toHaveLength(1);expect(view[0]).toMatchObject({baseline:12,counted:10,current:9,movements:-3,difference:-2,target:7,availableTarget:7});
 const reserved={id:'o',status:'confirmado',posDetalle:{apartado:{activo:true}},productosInventario:[{id:'p',variante:'Talla/Color:M / Negro',quantity:2}]};
 const physical=a.window.posCompararConteo({...session,lines:[{...session.lines[0],baseline:14,counted:13}]},{products:[now],orders:[reserved]})[0];
 expect(physical).toMatchObject({current:11,difference:-1,target:10,availableTarget:8});
 expect(playera.variants[0].qty).toBe(12);
});
it('ajusta solo la combinacion elegida y reintenta una respuesta perdida sin duplicar',async()=>{
 const database=await createTestDatabase();const store=disk();let lose=true;
 const connect=()=>{const a=withStorage(store,[]);a.db={from(table:string){const q:any={select(){return q;},order(){return q;},range(){return q;},then(resolve:any){return database.query('SELECT * FROM public.'+table).then(r=>({data:r.rows,error:null})).then(resolve);}};return q;},async rpc(name:string,args:any){try{const r=await database.query('SELECT public.pos_apply_operation($1,$2::jsonb) AS result',[args.p_id,JSON.stringify(args.p_operations)]);if(lose){lose=false;return {error:{message:'Respuesta perdida'}};}return {data:r.rows[0].result,error:null};}catch(e:any){return {error:{message:e.message,code:e.code}};}}};return a;};
 try{
  await database.query('INSERT INTO products(id,name,tipo,stock,variants) VALUES ($1,$2,$3,$4,$5::jsonb)',['p','Playera','producto_variable',17,JSON.stringify(playera.variants)]);
  const a=connect(),s=await a.window.posCrearConteo();await a.window.posContarLinea(s.id,s.lines[0].key,'10');await a.window.posContarLinea(s.id,s.lines[1].key,'4');
  await database.query('UPDATE products SET stock=14,variants=$1::jsonb WHERE id=$2',[JSON.stringify([{...playera.variants[0],qty:9},playera.variants[1]]),'p']);
  await expect(a.window.posAplicarConteo(s.id,[s.lines[0].key])).rejects.toThrow('Respuesta perdida');
  const b=connect(),saved=(await b.window.posCargarConteos())[0];expect(saved.attempt).toBeTruthy();await b.window.posAplicarConteo(saved.id,[]);
  const latest=await b.window.posLeerConteo();expect(latest.products[0].variants.map((v:any)=>v.qty)).toEqual([7,5]);
  expect(saved.lines[0].applied).toBe(true);expect(saved.lines[1]).toMatchObject({counted:4,applied:false});
  await expect(b.window.posAplicarConteo(saved.id,[saved.lines[0].key])).rejects.toThrow('Selecciona');
  await b.window.posAplicarConteo(saved.id,[saved.lines[1].key]);expect((await b.window.posLeerConteo()).products[0].variants.map((v:any)=>v.qty)).toEqual([7,4]);
 }finally{await database.close();}
},30000);
function disk(){const data=new Map();return {open(){const r:any={};queueMicrotask(()=>{r.result={transaction(){const tx:any={objectStore(){return {get(k:string){const q:any={};queueMicrotask(()=>{q.result=structuredClone(data.get(k));q.onsuccess?.();tx.oncomplete?.();});return q;},put(v:any,k:string){data.set(k,structuredClone(v));queueMicrotask(()=>tx.oncomplete?.());return {};}};}};return tx;}};r.onsuccess?.();});return r;}};}
function withStorage(store:any,rows:any[]){const a=app();a.indexedDB=store;a.document={addEventListener(){},getElementById(){return null;}};a.mkId=randomUUID;runInNewContext(transformSync(readFileSync('src/operations.ts','utf8'),{loader:'ts'}).code,a);a._RELATIONAL_TABLES={products:{map:(r:any)=>r},pedidos:{map:(r:any)=>r}};a.db={from(table:string){const q:any={select(){return q;},order(){return q;},range(){return q;},then(resolve:any){return Promise.resolve({data:table==='products'?structuredClone(rows):[],error:null}).then(resolve);}};return q;}};return a;}
it('guarda el conteo parcial y recupera cero como contado tras recargar',async()=>{
 const store=disk(),a=withStorage(store,[playera]);const session=await a.window.posCrearConteo();
 await a.window.posContarLinea(session.id,session.lines[0].key,'0');
 const b=withStorage(store,[{...playera,variants:[{...playera.variants[0],qty:10},playera.variants[1]]}]);
 const recovered=(await b.window.posCargarConteos())[0];expect(recovered.lines[0]).toMatchObject({counted:0,baseline:12});expect(recovered.lines[1].counted).toBeNull();
 const compare=b.window.posCompararConteo(recovered,await b.window.posLeerConteo());expect(compare[0]).toMatchObject({movements:-2,difference:-12,availableTarget:-2});expect(compare[0].error).toBeTruthy();
 await expect(b.window.posContarLinea(recovered.id,recovered.lines[1].key,'-1')).rejects.toThrow();
 expect(recovered.lines[1].counted).toBeNull();
});
it('no confunde capacidad fabricable con piezas ni permite un conteo recuperado dañado',()=>{
 const a=app();const lines=a.window.posLineasConteo([{id:'mp',name:'Vinil',tipo:'materia_prima',stock:2.5},{id:'fabricable',name:'Diseño',stock:50,mpComponentes:[{id:'mp',qty:1}]}]);
 expect(lines.map((l:any)=>l.productId)).toEqual(['mp']);
 const result=a.window.posCompararConteo({lines:[{...lines[0],counted:1.5,baseline:'dato dañado'}]},{products:[{id:'mp',stock:2.5}],orders:[]});expect(result[0].error).toContain('Vuelve a contar');
});
it('detecta otro ajuste de la misma talla sin confundirlo con una venta o con otra talla',()=>{
 const a=app(),line={...a.window.posLineasConteo([playera])[0],counted:10,baseline:12,movementIds:[]};
 const now={...playera,variants:[{...playera.variants[0],qty:10},playera.variants[1]]};
 const snapshot={products:[now],orders:[],movements:[{id:'adjust',producto_id:'p',tipo:'ajuste',motivo:'Conteo físico · Talla/Color:M / Negro'}]};
 expect(a.window.posCompararConteo({lines:[line]},snapshot)[0].error).toContain('otro ajuste');
 snapshot.movements[0].tipo='venta';expect(a.window.posCompararConteo({lines:[line]},snapshot)[0].error).toBe('');
 snapshot.movements[0].tipo='ajuste';snapshot.movements[0].motivo='Conteo físico · Talla/Color:L / Blanco';expect(a.window.posCompararConteo({lines:[line]},snapshot)[0].error).toBe('');
});
it('volver a cargar el conteo espera una cantidad que aun se esta guardando',async()=>{
 const a=withStorage(disk(),[playera]),session=await a.window.posCrearConteo();let release:any;const gate=new Promise(resolve=>release=resolve);const original=a.db.from;a.db.from=(table:string)=>{const q=original(table),then=q.then;q.then=(resolve:any)=>gate.then(()=>then(resolve));return q;};
 const capture=a.window.posContarLinea(session.id,session.lines[0].key,'8');const reload=a.window.posCargarConteos();release();await capture;const recovered=await reload;expect(recovered[0].lines[0]).toMatchObject({counted:8,baseline:12});expect((await a.window.posCargarConteos())[0].lines[0].counted).toBe(8);
});
