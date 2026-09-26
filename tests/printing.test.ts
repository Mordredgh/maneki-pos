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
