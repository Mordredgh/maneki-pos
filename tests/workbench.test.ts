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
it('requiere aprobacion vigente al producir y empaque al entregar',()=>{
 const c=app();const p:any={concepto:'Playera',productosInventario:[{id:'p',quantity:2,variante:'M'}],checklist:{material:true},posDetalle:{}};
 expect(c.posPendientesPreparacion(p,'produccion')).toContain('Diseño aprobado');
 p.posDetalle.aprobacion={referencia:'Arte v2',fecha:'2026-09-27',firma:c.posFirmaDiseno(p)};
 expect(c.posPendientesPreparacion(p,'produccion')).toEqual([]);
 p.productosInventario[0].quantity=3;
 expect(c.posPendientesPreparacion(p,'produccion')).toContain('Diseño aprobado');
 expect(c.posPendientesPreparacion(p,'finalizado')).toContain('Pedido empacado');
});
