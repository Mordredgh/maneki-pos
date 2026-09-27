// Solo lo sirve staging/server.mjs; no se empaqueta en Cloudflare.
(()=>{
 if(location.origin!=='http://127.0.0.1:8978')throw Error('Solo entorno de pruebas local');
 const request=body=>fetch('/__qa/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
 const session={user:{id:'00000000-0000-4000-8000-000000000001'}};
 let signedIn=sessionStorage.getItem('qa_signed_out')!=='1';
 const client={
 auth:{getSession:async()=>({data:{session:signedIn?session:null}}),signInWithPassword:async()=>{signedIn=true;sessionStorage.removeItem('qa_signed_out');return {data:{session}};},signOut:async()=>{signedIn=false;sessionStorage.setItem('qa_signed_out','1');return {error:null};},onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
 rpc:(rpc,args)=>request({rpc,args}),
 from(table){const body={table,filters:[]};const q={select(){return q;},order(col,opts={}){body.order=col;body.ascending=opts.ascending;return q;},limit(n){body.limit=n;return q;},range(a,b){body.offset=a;body.limit=b-a+1;return q;},eq(c,v){body.filters.push(['eq',c,String(v)]);return q;},not(){return q;},maybeSingle(){body.single=true;return request(body);},single(){body.single=true;return request(body);},then(a,b){return request(body).then(a,b);}};return q;},
 channel(){const q={on(){return q;},subscribe(){return q;},unsubscribe(){}};return q;},removeChannel(){},removeAllChannels(){},
 storage:{from(){return {upload:async()=>({error:{message:'Imagenes no habilitadas en pruebas'}}),remove:async()=>({error:null}),getPublicUrl:()=>({data:{publicUrl:''}})};}}
 };
 window.supabase={createClient:()=>client};
 if(navigator.serviceWorker)navigator.serviceWorker.register=async()=>({});
 document.addEventListener('DOMContentLoaded',()=>{
 const banner=document.createElement('div');banner.textContent='ENTORNO DE PRUEBAS · Datos ficticios · Acceso simulado';banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#723a90;color:white;text-align:center;padding:5px;font:700 13px system-ui;pointer-events:none';document.body.appendChild(banner);
 });
})();
