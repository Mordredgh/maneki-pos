import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { transformSync } from 'esbuild';

it('el ticket muestra datos como texto y abre la ventana antes de esperar la red', async () => {
  let html = '', opened = false, openedBeforeFetch = false;
  const ctx: any = createContext({
    URL, Number, console,
    pedidos: [{id:'ticket-test', folio:'<b>FOLIO</b>', cliente:'<img src=x onerror=alert(1)>',
      total:100, anticipo:25, pagos:[{monto:25},{monto:30}],
      productosInventario:[{id:'p1',name:'<script>bad()</script>',variante:'<b>:<img src=x>',quantity:1,price:100}]}],
    location: {href:'https://pos.example/'},
    fetch: async () => { openedBeforeFetch = opened; throw new Error('sin logo'); },
    open: () => { opened=true; return {document:{write(s:string){html=s;},close(){}}}; },
    manekiToastExport() {},
    _esc: (v:any) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')
  });
  ctx.window=ctx;
  runInContext(transformSync(readFileSync('src/pedidos-3.ts','utf8').split('// ── Exponer funciones de pedidos globalmente')[0],{loader:'ts'}).code,ctx);
  await ctx.imprimirTicketPedido('ticket-test');
  expect(openedBeforeFetch).toBe(true);
  expect(html).not.toContain('<script>bad()');
  expect(html).not.toContain('<img src=x');
  expect(html).toContain('&lt;b&gt;FOLIO&lt;/b&gt;');
  expect(html).toContain('$45.00');
  expect(html).toContain('BICHO CAPRICHO');
});


it('el PDF conserva extras de personalizacion y su importe junto a los productos',async()=>{
 let html='';const node:any={style:{},innerHTML:'',remove(){}};
 const chain:any={set(){return chain},from(el:any){html=el.innerHTML;return chain},save:async()=>{}};
 const ctx:any=createContext({console,URL,Number,Date,fetch:async()=>{throw Error('sin logo')},location:{href:'https://pos.example/'},document:{createElement:()=>node,body:{appendChild(){}}},html2pdf:()=>chain,manekiToastExport(){},_esc:(s:any)=>String(s||''),pedidos:[{id:'extras',folio:'PE-EXTRA',total:130,productosInventario:[{id:'p',name:'Taza',quantity:1,price:100},{id:'libre',name:'Personalizacion · Nombre',quantity:2,price:15}]}]});ctx.window=ctx;
 const source=readFileSync('src/pedidos-3.ts','utf8');runInContext(transformSync(source.slice(source.indexOf('async function exportarPedidoPDF'),source.indexOf('window.exportarPedidoPDF')+ 'window.exportarPedidoPDF = exportarPedidoPDF;'.length),{loader:'ts'}).code,ctx);
 await ctx.exportarPedidoPDF('extras');expect(html).toContain('Personalizacion · Nombre');expect(html).toContain('$30.00');
});
