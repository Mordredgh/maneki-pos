import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';
function app(){const window:any={};const ctx:any={window,console};runInNewContext(transformSync(readFileSync('src/operations.ts','utf8'),{loader:'ts'}).code,ctx);return ctx;}
it('separa demanda pendiente del inventario ya descontado y detecta combinaciones ausentes',()=>{
 const c=app();const product={id:'p',variants:[{type:'Talla/Color',value:'M / Negro',size:'M',color:'Negro',qty:8},{type:'Talla/Color',value:'L / Blanco',size:'L',color:'Blanco',qty:2}]};
 const line={id:'p',variante:'Talla/Color:M / Negro',quantity:3};
 const matrix=c.posMatrizVariantes(product,[{status:'confirmado',productosInventario:[line]},{status:'produccion',inventarioDescontado:true,productosInventario:[line]},{status:'cancelado',productosInventario:[line]}]);
 expect(matrix.cells.find(x=>x.size==='M'&&x.color==='Negro')).toMatchObject({terminadas:8,comprometidas:3,libres:5,index:0});
 expect(matrix.cells.find(x=>x.size==='M'&&x.color==='Blanco').index).toBe(-1);
});
it('distingue costo real pendiente de cero y suma costos sin duplicar categorias',()=>{
 const c=app();expect(c.posRentabilidad({total:1000},{}).real).toBe(null);
 expect(c.posRentabilidad({total:1000},{estimado:400,reales:{materiales:300,empaque:40,comisiones:30,envio:70,merma:10}})).toMatchObject({real:450,ganancia:550,margen:55,diferencia:50});
 expect(()=>c.posRentabilidad({total:100},{reales:{materiales:-1}})).toThrow();
});
it('incluye reposiciones en costo real sin sumar otra venta',()=>{
 const c=app();const p={total:500,posDetalle:{reposiciones:[{motivo:'Estampado incorrecto',costo:30},{motivo:'Nueva talla',costo:20}]}};
 expect(c.posRentabilidad(p,{reales:{materiales:100,empaque:10,comisiones:0,envio:0,merma:0}})).toMatchObject({real:160,ganancia:340,margen:68});
 expect(()=>c.posRentabilidad({total:500,posDetalle:{reposiciones:[{costo:-2}]}},{reales:{materiales:100}})).toThrow();
});

it('permite costos parciales sin presentar ganancia definitiva',()=>{
 const c=app();
 expect(c.posRentabilidad({total:500},{reales:{materiales:120,empaque:null}})).toMatchObject({real:120,incompleto:true,ganancia:null,margen:null,diferencia:null});
 expect(c.posRentabilidad({total:500},{reales:{materiales:0,empaque:0,comisiones:0,envio:0,merma:0}})).toMatchObject({real:0,incompleto:false,ganancia:500});
});
