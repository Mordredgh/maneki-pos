import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {transformSync} from 'esbuild';

function variable(){
 const ctx:any=createContext({window:{},console,mkRound2:(n:number)=>Math.round(n*100)/100});ctx.window.window=ctx.window;
 runInContext(transformSync(readFileSync('src/inventory-2-pv.ts','utf8'),{loader:'ts',target:'es2020'}).code,ctx);
 return ctx;
}
it('aplica rango al total agregado y recargo de la combinacion',()=>{
 const ctx=variable();const product={tablaPreciosVariable:[{cantidadMin:1,precio:100},{cantidadMin:10,precio:800}],variants:[{type:'Talla/Color',value:'M / Negro',size:'M',color:'Negro',priceDelta:15,qty:4}]};
 expect(ctx.pvGetPrecio(product,2,'Talla/Color:M / Negro')).toBe(115);
 expect(ctx.pvGetPrecio(product,11,'Talla/Color:M / Negro')).toBe(95);
 expect(ctx.pvGetPrecio(product,11)).toBe(80);
});
it('rechaza combinaciones repetidas e importes invalidos',()=>{
 const ctx=variable();
 expect(()=>ctx.pvNormalizarCombinaciones([{size:'M',color:'Negro',qty:2,priceDelta:0},{size:'m',color:'negro',qty:1,priceDelta:0}])).toThrow('repetida');
 expect(()=>ctx.pvNormalizarCombinaciones([{size:'L',color:'Rojo',qty:-1,priceDelta:0}])).toThrow('Existencias');
 expect(ctx.pvNormalizarCombinaciones([{size:'XL',color:'Azul',qty:3,priceDelta:10.5}])[0]).toMatchObject({type:'Talla/Color',value:'XL / Azul',qty:3,priceDelta:10.5});
});
it('recalcula todas las tallas con el volumen total del producto',()=>{
 const ctx=variable();const product={id:'p1',tipo:'producto_variable',tablaPreciosVariable:[{cantidadMin:1,precio:100},{cantidadMin:10,precio:800}],variants:[{type:'Talla/Color',value:'M / Negro',priceDelta:15}]};
 const items=[{id:'p1',variante:'Talla/Color:M / Negro',quantity:4,price:0},{id:'p1',variante:'Talla/Color:L / Azul',quantity:6,price:0}];
 ctx.pvRecalcularLineas(items,[product]);
 expect(items.map(x=>x.price)).toEqual([95,80]);
});
it('muestra materiales faltantes para la talla elegida sin mezclar colores',()=>{
 const ctx=variable();const product={id:'p',variants:[{type:'Talla/Color',value:'M / Negro',size:'M',color:'Negro',qty:1}],mpComponentes:[{id:'tela',qty:1}]};
 const tela={id:'tela',name:'Playera base',variants:[{type:'Talla',value:'M',qty:1},{type:'Talla',value:'L',qty:20}]};
 expect(ctx.pvPlanMateriales(product,3,'Talla/Color:M / Negro',[product,tela])[0]).toMatchObject({necesario:2,disponible:1,faltante:1});
});
it('avisa si faltan piezas terminadas y no hay materiales configurados',()=>{
 const ctx=variable();const product={id:'p',variants:[{type:'Talla/Color',value:'M / Negro',qty:2}],mpComponentes:[]};
 expect(ctx.pvPlanMateriales(product,3,'Talla/Color:M / Negro',[product])[0]).toMatchObject({necesario:3,disponible:2,faltante:1});
});
it('cierra sin pedir descartar cambios despues de confirmar el guardado',async()=>{
 const ctx=variable();let saved=false,closedDirty:any;
 const fields:any={pvNombre:{value:'Playera'},pvSku:{value:'P-1'},pvRendimiento:{value:''},pvEditId:{value:'p'},pvCategory:{value:''},pvNotas:{value:''},pvSubmitBtn:{disabled:false,textContent:''},pvModal:{_mkDirty:true}};
 ctx.document={getElementById:(id:string)=>fields[id]||{value:''}};
 ctx.window.products=[{id:'p',name:'Playera',variants:[]}];
 ctx.window._pvTablaPreciosVariable=[{cantidadMin:1,precio:100}];
 ctx.window._pvCombinaciones=[];ctx.window._pvMpComponentes=[];
 ctx.manekiToastExport=()=>{};ctx.saveProducts=async()=>{saved=true;};ctx.renderInventoryTable=()=>{};
 ctx.closeModal=()=>{closedDirty=fields.pvModal._mkDirty;expect(saved).toBe(true);};
 await ctx.guardarProductoVariable({preventDefault(){}});
 expect(closedDirty).toBe(false);
});
