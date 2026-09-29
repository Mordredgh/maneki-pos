import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';

function load(file:string) {
  const window:any = {};
  const ctx:any = {window,document:{addEventListener(){},getElementById(){return null;}},console};
  runInNewContext(transformSync(readFileSync(file,'utf8'),{loader:'ts'}).code,ctx);
  return ctx;
}

it('la tarjeta de inventario muestra foto, precio, existencias y edición',()=>{
  const c=load('src/inventory-5.ts');
  c._esc=(x:string)=>String(x);
  c.fmtMoney=(n:number)=>'$'+Number(n).toFixed(2);
  const html=c.inventoryCardHTML({id:'p1',name:'Playera M',imageUrl:'https://example.test/playera.webp',price:180,stockMin:3},2,'pt');
  expect(html).toContain('playera.webp');
  expect(html).toContain('Playera M');
  expect(html).toContain('$180.00');
  expect(html).toContain('2 disponibles');
  expect(html).toContain('data-action="editProduct"');
 expect(html).toContain('data-id="p1"');
});

it('la tarjeta de playera distingue existencias, fabricación compartida y faltantes',()=>{
  const c=load('src/inventory-5.ts');
  c._esc=(x:string)=>String(x);
  c.fmtMoney=(n:number)=>'$'+Number(n).toFixed(2);
  c.calcularPiezasFabricables=()=>2;
  const product={id:'p1',name:'Playera',price:180,mpComponentes:[{id:'mp1',qty:1}],variants:[
    {type:'Talla/Color',value:'M / Azul',size:'M',color:'Azul',qty:3},
    {type:'Talla/Color',value:'M / Rojo',size:'M',color:'Rojo',qty:0},
  ]};
  const html=c.inventoryCardHTML(product,3,'pt');
  expect(html).toContain('pos-variant-available');
  expect(html).toContain('pos-variant-makeable');
  expect(html).toContain('2 fabricables con material compartido');
  expect(html).toContain('data-action="posAbrirMatriz"');
});

it('la línea de Balance no duplica un cobro registrado en ventas e ingresos',()=>{
  const c=load('src/balance.ts');
  const rows=c.posBalanceMovimientos([
    {id:'v1',date:'2026-09-20',total:120,concept:'Venta'},
    {id:'p1',date:'2026-09-20',total:500,type:'pedido'},
  ],[{id:'v1',date:'2026-09-20',amount:120,concept:'Cobro POS'},
     {id:'i2',date:'2026-09-21',amount:30,concept:'Anticipo'}],
    [{id:'e1',date:'2026-09-21',amount:50,concept:'Material'}],'2026-09');
  expect(rows.map((r:any)=>r.amount)).toEqual([120,30,-50]);
  expect(rows.map((r:any)=>r.balance)).toEqual([120,150,100]);
});

it('el selector de mes convierte los atributos HTML a números',()=>{
  const c=load('src/balance.ts');
  expect(c.posBalanceMesOffset(0,'-1')).toBe(-1);
  expect(c.posBalanceMesOffset(-1,'1')).toBe(0);
});

it('la línea de Balance no usa section, que la navegación oculta',()=>{
  const c=load('src/balance.ts');
  let createdTag='';
  const anchor={parentElement:{insertBefore(){}},nextSibling:null};
  c.document.getElementById=(id:string)=>id==='balMesNetoBg'?anchor:null;
  c.document.createElement=(tag:string)=>{createdTag=tag;return {id:'',innerHTML:''};};
  c.fmtMoney=() => '$0.00';
  c.renderBalanceTimeline('2026-09');
  expect(createdTag).toBe('div');
});
