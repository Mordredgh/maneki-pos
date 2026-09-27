import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';

it('muestra entregas vencidas y acciones directas para cobrar e inventario',()=>{
 const elements:Record<string,any>={
  alertaEntregas:{classList:{add(){},remove(){}}},
  alertaEntregasLista:{innerHTML:''},
  alertaSubtitulo:{textContent:''},
  atencionHoyList:{innerHTML:''}
 };
 const pedidos=[{folio:'PE-1',cliente:'Ana',status:'confirmado',entrega:'2026-09-25',total:100,pagos:[]}];
 const window:any={pedidos,products:[{name:'Playera',stock:0,stockMin:2}],_fechaHoy:()=> '2026-09-27',diasHastaEntrega:()=>-2};
 const source=readFileSync(new URL('../src/dashboard.ts',import.meta.url),'utf8');
 const code=transformSync(source,{loader:'ts',format:'esm'}).code;
 const context:any={window,document:{getElementById:(id:string)=>elements[id]||null},
  calcSaldoPendiente:()=>100,pedidos,products:window.products,storeConfig:{stockMinimo:2},
  _esc:(v:any)=>String(v),fmtMoney:(v:number)=>'$'+v.toFixed(2),console,Date};
 runInNewContext(code,context);
 context.checkAlertasEntregas();
 window._renderAtencionHoy();
 expect(elements.alertaEntregasLista.innerHTML).toContain('Vencido');
 expect(elements.atencionHoyList.innerHTML).toContain('data-arg="balance"');
 expect(elements.atencionHoyList.innerHTML).toContain('data-arg="inventory"');
});
