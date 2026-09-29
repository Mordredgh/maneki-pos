import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';

function load(file:string) {
  const window:any = {};
  const ctx:any = {window,document:{addEventListener(){}},console};
  runInNewContext(transformSync(readFileSync(file,'utf8'),{loader:'ts'}).code,ctx);
  return ctx;
}

it('la tarjeta de inventario muestra foto, precio, existencias y edición',()=>{
  const c=load('src/inventory-5.ts');
  c._esc=(x:string)=>String(x);
  const html=c.inventoryCardHTML({id:'p1',name:'Playera M',imageUrl:'https://example.test/playera.webp',price:180,stockMin:3},2,'pt');
  expect(html).toContain('playera.webp');
  expect(html).toContain('Playera M');
  expect(html).toContain('$180.00');
  expect(html).toContain('2 disponibles');
  expect(html).toContain('data-action="editProduct"');
 expect(html).toContain('data-id="p1"');
});
