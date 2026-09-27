import http from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {createTestDatabase} from './database.mjs';
const db=await createTestDatabase();
await db.exec(`INSERT INTO categories VALUES ('qa','Pruebas','🎁','#FFD166');
INSERT INTO products(id,name,sku,category,tipo,cost,price,stock,stock_min,activo,publicar_tienda,variants,mp_componentes,tags) VALUES ('qa-product','Taza de prueba','QA-001','qa','producto',40,100,10,3,true,false,'[]','[]','[]');
INSERT INTO clients(id,name,phone,type,total_purchases) VALUES ('qa-client','Cliente de prueba','0000000000','regular',0);
INSERT INTO store VALUES ('storeConfig','{"name":"Bicho · PRUEBAS","slogan":"Datos ficticios","emoji":"🐛"}');
`);
const root=resolve('dist/cloudflare');
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
 if(req.headers.host!=='127.0.0.1:8978'){res.writeHead(403).end();return;}
 const url=new URL(req.url,'http://127.0.0.1:8978');
 try{
 if(url.pathname==='/__qa/query'&&req.method==='POST'){
  if(req.headers.origin && req.headers.origin!=='http://127.0.0.1:8978')throw Error('Origen rechazado');
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
server.listen(8978,'127.0.0.1',()=>console.log('Pruebas aisladas: http://127.0.0.1:8978 · solo datos ficticios · reiniciar restablece datos'));
