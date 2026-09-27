// Vista local con Supabase real. No simula autenticacion ni modifica respuestas.
import http from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist/cloudflare');
http.createServer((req,res)=>{
 if(req.headers.host!=='127.0.0.1:8977'){res.writeHead(403).end();return;}
 const pathname=new URL(req.url,'http://127.0.0.1:8977').pathname;
 const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+sep)||!existsSync(file)||file.endsWith('_worker.js')){res.writeHead(404).end();return;}
 const types={'.html':'text/html;charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
 try{res.end(readFileSync(file));}catch{res.writeHead(404).end();}
}).listen(8977,'127.0.0.1',()=>console.log('Vista real en 127.0.0.1:8977'));
