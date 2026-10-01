import http from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {createTestDatabase} from './database.mjs';
const db=await createTestDatabase();
await db.exec(`INSERT INTO categories VALUES ('qa','Pruebas','🎁','#FFD166');
INSERT INTO products(id,name,sku,category,tipo,cost,price,stock,stock_min,activo,publicar_tienda,variants,mp_componentes,tags) VALUES ('qa-product','Taza de prueba','QA-001','qa','producto',40,100,10,3,true,false,'[]','[]','[]');
INSERT INTO products(id,name,sku,category,tipo,cost,price,stock,stock_min,activo,publicar_tienda,variants,mp_componentes,tags,image_url) VALUES ('qa-playera','Playera de prueba','QA-002','qa','producto_variable',65,180,12,3,true,false,'[{"type":"Talla/Color","value":"M / Negro","size":"M","color":"Negro","qty":4,"priceDelta":0},{"type":"Talla/Color","value":"M / Blanco","size":"M","color":"Blanco","qty":3,"priceDelta":0},{"type":"Talla/Color","value":"L / Negro","size":"L","color":"Negro","qty":2,"priceDelta":10},{"type":"Talla/Color","value":"L / Blanco","size":"L","color":"Blanco","qty":3,"priceDelta":10}]','[]','[]','/img/categorias/ropa-y-textiles.webp');
UPDATE products SET tabla_precios_variable='[{"cantidadMin":1,"precio":180}]' WHERE id='qa-playera';
INSERT INTO clients(id,name,phone,type,total_purchases) VALUES ('qa-client','Cliente de prueba','0000000000','regular',0);
INSERT INTO orders(id,folio,cliente,fecha,entrega,concepto,total,status,productos_inventario,pagos) VALUES ('qa-order','PE-QA-001','Cliente de prueba','2026-09-27','2026-09-30','Playeras con diseño aprobado',360,'confirmado','[{"id":"qa-playera","name":"Playera de prueba","quantity":2,"variante":"Talla/Color:M / Negro"}]','[]');
INSERT INTO orders(id,folio,cliente,fecha,entrega,concepto,total,anticipo,resta,status,productos_inventario,pagos) SELECT 'qa-order-'||n,'PE-QA-'||lpad((n+1)::text,3,'0'),'Cliente de prueba '||n,'2026-09-27',to_char(DATE '2026-09-30'+(n%6)-3,'YYYY-MM-DD'),'Playera personalizada · talla M, color Negro',180,CASE WHEN n%3=0 THEN 180 ELSE 90 END,CASE WHEN n%3=0 THEN 0 ELSE 90 END,CASE WHEN n%4=0 THEN 'produccion' ELSE 'confirmado' END,'[{"id":"qa-playera","name":"Playera de prueba","quantity":1,"variante":"Talla/Color:M / Negro","price":180}]','[]' FROM generate_series(1,23) AS n;
INSERT INTO store VALUES ('storeConfig','{"name":"Bicho · PRUEBAS","slogan":"Datos ficticios","emoji":"🐛"}');
`);
const root=resolve('dist/cloudflare');
const port=Number(process.env.POS_STAGING_PORT||8978);
if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('Puerto de pruebas inválido');
const origin=`http://127.0.0.1:${port}`;
const tables=new Set(['products','clients','orders','orders_finalizados','sales_history','incomes','expenses','categories','stock_movements','store']);
const ident=s=>{if(!/^[a-z_]+$/.test(s))throw Error('Identificador invalido');return '"'+s+'"';};
let folio=0;
async function query(body){
 if(body.rpc){const a=body.args||{};if(body.rpc==='is_admin')return true;
 if(body.rpc==='maneki_next_folio')return ++folio;
 if(body.rpc==='pos_list_changes')return (await db.query('SELECT * FROM public.pos_list_changes($1)',[a.p_limit||100])).rows;
 const functions={pos_cash_movements:['p_date','p_zone'],pos_apply_operation:['p_id','p_operations'],pos_apply_write:['p_table','p_rows','p_expected','p_field','p_value'],pos_apply_store:['p_key','p_value','p_expected']};
 const params=functions[body.rpc];if(!params)throw Error('RPC no permitida');
 return (await db.query(`SELECT public.${ident(body.rpc)}(${params.map((_,i)=>'$'+(i+1)).join(',')}) AS result`,params.map(k=>typeof a[k]==='object'&&a[k]!==null?JSON.stringify(a[k]):a[k]??null))).rows[0].result;
 }
 if(!tables.has(body.table))return [];
 const params=[];const where=(body.filters||[]).map(([op,col,val])=>{params.push(val);return `${ident(col)}::text ${op==='eq'?'=':'<>'} $${params.length}`;});
 let sql=`SELECT * FROM public.${ident(body.table)}`+(where.length?' WHERE '+where.join(' AND '):'');
 if(body.order)sql+=` ORDER BY ${ident(body.order)} ${body.ascending===false?'DESC':'ASC'}`;
 sql+=' LIMIT '+Math.min(Number(body.limit)||1000,5000)+' OFFSET '+(Number(body.offset)||0);
 const rows=(await db.query(sql,params)).rows;
 return body.single?(rows[0]||null):rows;
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 // Nunca abrir acceso al servidor desde otros origenes o interfaces.
 if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403).end();return;}
 const url=new URL(req.url,origin);
 try{
 if(url.pathname==='/__qa/query'&&req.method==='POST'){
  if(req.headers.origin && req.headers.origin!==origin)throw Error('Origen rechazado');
  if(!String(req.headers['content-type']).startsWith('application/json'))throw Error('Tipo rechazado');
  let body='';for await(const part of req){body+=part;if(body.length>4000000)throw Error('Solicitud grande');}
  try{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({data:await query(JSON.parse(body)),error:null}));}catch(e){res.end(JSON.stringify({data:null,error:{message:e.message,code:e.code}}));}return;
 }
 if(url.pathname==='/__qa/client.js'){res.setHeader('Content-Type','text/javascript');res.end(readFileSync('staging/client.js'));return;}
 const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+sep)||!existsSync(file)){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
 res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
 res.setHeader('Content-Security-Policy',"connect-src 'self'; form-action 'self'; frame-src 'none'; object-src 'none'");
 let content=readFileSync(file);
 if(extname(file)==='.html')content=content.toString().replace('<script src="js/core.bundle.js"','<script src="/__qa/client.js"></script><script src="js/core.bundle.js"').replace('<body','<body data-staging="true"');
 res.end(content);
 }catch(e){res.writeHead(400).end(e.message);}
});
server.listen(port,'127.0.0.1',()=>console.log(`Pruebas aisladas: ${origin} · solo datos ficticios · reiniciar restablece datos`));
