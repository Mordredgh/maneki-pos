import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';

function load(file:string,document:any={addEventListener(){},getElementById(){return null;}}) {
  const window:any = {};
  const ctx:any = {window,document,console,structuredClone};
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

it('la cotización abre un documento revisable y espera la orden de imprimir',()=>{
  const c=load('src/pedidos-1-extra.ts');
  let html='';
  let printed=false;
  c.window.quotes=[{id:'q1',folio:'COT-001',customer:'Ana <script>',date:'2026-09-29',total:280,products:[{name:'Playera',quantity:1,price:280}]}];
  c.window.open=()=>({document:{write:(value:string)=>{html=value;},close(){}},focus(){},print(){printed=true;}});
  c.fmtMoney=(value:number)=>'$'+Number(value).toFixed(2);
  c.imprimirCotizacionVista('q1');
  expect(html).toContain('Imprimir / guardar PDF');
  expect(html).toContain('pos-document-logo');
  expect(html).toContain('nunito.woff2');
  expect(html).toContain('Ana &lt;script&gt;');
  expect(html).toContain('$280.00');
  expect(printed).toBe(false);
});

it('guarda un pedido completo desde Productos sin exigir la revision',()=>{
 const c=load('src/pedidos-1-views.ts');const handlers:any={};let saved=0;
 const form:any={dataset:{},querySelectorAll:()=>[],addEventListener:(type:string,cb:any)=>{handlers[type]=cb;},dispatchEvent:(e:any)=>{handlers.submit?.(e);if(!e.defaultPrevented)saved++;}};
 const elements:any={pedidoForm:form,pedidoCosto:{value:'100'},'pos-pedido-save':{hidden:true}};
 c.document.getElementById=(id:string)=>elements[id]||null;c.document.querySelectorAll=()=>[];
 c.mkRound2=(v:any)=>Number(v)||0;c.fmtMoney=String;c.Event=Event;
 c.window.pedidoResumenAntesDeGuardar=()=>({missing:[]});
 c._updatePedidoStep(2);c.posPedidoGuardar();
 expect(saved).toBe(1);expect(form.dataset.step).toBe('2');expect(elements['pos-pedido-save'].hidden).toBe(false);
 c.window.pedidoResumenAntesDeGuardar=()=>({missing:['Nombre del cliente']});c.posPedidoGuardar();expect(saved).toBe(1);
});
it('sugiere costo por materiales sin reemplazar el costo manual hasta solicitarlo',()=>{
 const c=load('src/inventory-2-pt.ts');const elements:any={ptCosto:{value:'42'},ptCostoDesglose:{textContent:''},ptUsarCostoBtn:{hidden:true}};
 c.document.getElementById=(id:string)=>elements[id]||null;
 c.window._ptMpComponentes=[{id:'m',nombre:'Tela',qty:2,costUnit:10}];
 c.recalcularCostoPt();expect(elements.ptCosto.value).toBe('42');expect(elements.ptCostoDesglose.textContent).toContain('20.00');expect(elements.ptUsarCostoBtn.hidden).toBe(false);
 c.ptUsarCostoCalculado();expect(elements.ptCosto.value).toBe('20.00');
 c.window._ptMpComponentes=[];c.recalcularCostoPt();expect(elements.ptUsarCostoBtn.hidden).toBe(true);
});

it('encuentra palabras en distinto orden, acentos y un error sin confundir tallas ni numeros',()=>{
 const c=load('src/operations.ts');
 expect(c.posBusquedaCoincide('negro playera','Playera juvenil color Negro')).toBe(true);
 expect(c.posBusquedaCoincide('jsoe garcia','José García')).toBe(true);
 expect(c.posBusquedaCoincide('tza','Taza')).toBe(false);
 expect(c.posBusquedaCoincide('M','Playera talla L')).toBe(false);
 expect(c.posBusquedaCoincide('0063','PE-0062')).toBe(false);
 expect(c.posBusquedaCoincide('blanco playera','Playera negra')).toBe(false);
});

it('edita fecha, prioridad y nota juntos sin alterar saldo ni perder cambios concurrentes',async()=>{
 const c=load('src/operations.ts');const p:any={id:'p',fecha:'2026-09-29',entrega:'2026-10-01',prioridad:'normal',total:180,pagos:[{monto:90}]};
 c.window.pedidos=[p];c.posRunOperation=async(fn:any)=>fn();let saved=0;c.savePedidos=async()=>{saved++;};
 const before=JSON.stringify(p);await c.posGuardarPedidoRapido('p',{entrega:'2026-10-02',prioridad:'alta',notas:'Nombre en dorado'},before);
 expect(p).toMatchObject({entrega:'2026-10-02',prioridad:'alta',notas:'Nombre en dorado',total:180,pagos:[{monto:90}]});expect(saved).toBe(1);
 await expect(c.posGuardarPedidoRapido('p',{entrega:'2026-10-03',prioridad:'baja',notas:''},before)).rejects.toThrow('cambió');
 await expect(c.posGuardarPedidoRapido('p',{entrega:'2026-09-28',prioridad:'normal',notas:''})).rejects.toThrow('fecha');
});
it('los filtros cuentan solo pedidos activos por fecha local y saldo',()=>{
 const c=load('src/operations.ts');c.calcSaldoPendiente=(p:any)=>p.saldo;
 const orders=[{status:'confirmado',entrega:'2026-09-29',saldo:10},{status:'retirar',entrega:'2026-09-28',saldo:0},{status:'finalizado',entrega:'2026-09-29',saldo:20},{status:'pago',saldo:5}];
 expect(c.posFiltrarPedidosRapidos(orders,'hoy','2026-09-29')).toHaveLength(1);
 expect(c.posFiltrarPedidosRapidos(orders,'vencido','2026-09-29')).toHaveLength(1);
 expect(c.posFiltrarPedidosRapidos(orders,'saldo','2026-09-29')).toHaveLength(2);
 expect(c.posFiltrarPedidosRapidos(orders,'todos','2026-09-29')).toHaveLength(3);
});

it('el tablero agrupa entregas de hoy usando la fecha y no el objeto del pedido',()=>{
 const c=load('src/pedidos-1-views.ts');const col:any={children:[{}],innerHTML:'',closest:()=>null};
 c.document.getElementById=(id:string)=>id==='kCol-confirmado'?col:null;
 c.window.pedidos=[{id:'p',status:'confirmado',entrega:'2026-09-29'}];
 c._fechaHoy=()=> '2026-09-29';c.posBusquedaCoincide=()=>true;c.posFiltrarPedidosRapidos=(orders:any[])=>orders;
 c.kanbanCardHTML=()=> 'Tarjeta';c.window.diasHastaEntrega=(fecha:any)=>fecha==='2026-09-29'?0:null;
 c.renderKanbanBoard();expect(col.innerHTML).toContain('Urgente (1)');
});

it('rechaza fechas inexistentes en la edicion rapida antes de guardar',async()=>{
 const c=load('src/operations.ts');c.window.pedidos=[{id:'p'}];c.posRunOperation=async(fn:any)=>fn();let saved=0;c.savePedidos=async()=>{saved++;};
 await expect(c.posGuardarPedidoRapido('p',{entrega:'2026-02-31',prioridad:'normal'})).rejects.toThrow('fecha');expect(saved).toBe(0);
});

it('recuerda selecciones locales sin aplicar opciones eliminadas ni fallar si almacenamiento esta bloqueado',()=>{
 const c=load('src/operations.ts');const saved=new Map<string,string>();const el:any={value:'cat-2',options:[{value:'cat-1'},{value:'cat-2'}]};
 c.localStorage={getItem:(k:string)=>saved.get(k)||null,setItem:(k:string,v:string)=>saved.set(k,v)};c.document.getElementById=()=>el;
 c.posRecordarCaptura(['ptCategory']);el.value='cat-1';c.posRestaurarCaptura(['ptCategory']);expect(el.value).toBe('cat-2');
 el.options=[{value:'cat-1'}];el.value='cat-1';c.posRestaurarCaptura(['ptCategory']);expect(el.value).toBe('cat-1');
 c.localStorage.getItem=()=>{throw Error('Bloqueado');};expect(()=>c.posRestaurarCaptura(['ptCategory'])).not.toThrow();
});
it('al volver al inventario restaura el desplazamiento y foco del producto sin reiniciar pagina',()=>{
 const c=load('src/operations.ts');let top=150,scroll:any,focused=false;
 const row:any={getBoundingClientRect:()=>({top}),classList:{add(){},remove(){}},querySelector:()=>({focus:()=>{focused=true;}})};
 const item:any={closest:()=>row};c.document.getElementById=()=>({querySelectorAll:()=>[item]});item.dataset={id:'p'};
 c.window.scrollY=400;c.window._invPage_pt=3;c.window.scrollTo=(v:any)=>{scroll=v;};c.requestAnimationFrame=(fn:any)=>fn();c.setTimeout=()=>{};
 c.posGuardarLugarInventario('p');top=220;c.posRestaurarLugarInventario();
 expect(scroll.top).toBe(470);expect(c.window._invPage_pt).toBe(3);expect(focused).toBe(true);
});

it('Balance cierra despues de guardar y conserva la advertencia si el guardado falla',async()=>{
 let submit:any;const modal:any={dataset:{},_mkDirty:true};const fields:any={transactionModal:modal,transactionType:{value:'income'},transactionConcept:{value:'Prueba'},transactionAmount:{value:'10'},transactionDate:{value:'2026-09-29'},transactionMethod:{value:'transferencia'},transactionForm:{addEventListener:(t:string,fn:any)=>{if(t==='submit')submit=fn;},reset(){}}};
 const c=load('src/balance.ts',{addEventListener(){},getElementById:(id:string)=>fields[id]||null});
 let saved=false,closedDirty:any;let fail=false;c.incomes=[];c.mkId=()=> 'prueba';c.saveIncomes=async()=>{if(fail)throw Error('Sin red');saved=true;};
 c.window._mkModalSaved=()=>{modal._mkDirty=false;};c.closeModal=()=>{closedDirty=modal._mkDirty;};c.posRecordarCaptura=()=>{};c.renderBalance=()=>{};c.updateDashboard=()=>{};c.manekiToastExport=()=>{};
 await submit({preventDefault(){},target:{querySelector:()=>null}});expect(saved).toBe(true);expect(closedDirty).toBe(false);
 fail=true;modal._mkDirty=true;closedDirty=undefined;await submit({preventDefault(){},target:{querySelector:()=>null}});expect(modal._mkDirty).toBe(true);expect(closedDirty).toBeUndefined();
});

it('el buscador global encuentra clientes con errata y escapa resultados y consultas',()=>{
 const c=load('src/operations.ts');const panel:any={innerHTML:'',classList:{add(){},remove(){}}};c.document.getElementById=()=>panel;
 const source=readFileSync('src/ui-extras.ts','utf8');runInNewContext(transformSync(source.slice(source.indexOf('function busquedaGlobal(query)'),source.indexOf('function cerrarBusquedaGlobal()')),{loader:'ts'}).code,c);
 c.fuzzyMatch=(text:any,q:any)=>c.posBusquedaCoincide(q,text);
 c._esc=(value:any)=>String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 c.window.clients=[{name:'Cliente de prueba " <script>'}];c.window.pedidos=[{cliente:'Cliente de prueba " <script>',folio:'PE-1',concepto:'Playera <script>'}];c.window.salesHistory=[];
 expect(()=>c.busquedaGlobal('prueba clietne')).not.toThrow();expect(panel.innerHTML).toContain('Cliente de prueba &quot; &lt;script&gt;');expect(panel.innerHTML).not.toContain('<script>');
 c.busquedaGlobal('<img src=x>');expect(panel.innerHTML).not.toContain('<img src=x>');expect(panel.innerHTML).toContain('&lt;img src=x&gt;');
});


it('la tabla distingue hoy, manana, vencidos y fecha exacta sin depender de UTC',()=>{
 const c=load('src/pedidos-1-views.ts');
 expect(c.posTablaFechaEntrega('2026-09-30','2026-09-30')).toEqual({label:'Hoy',date:'30/09/2026',state:'today'});
 expect(c.posTablaFechaEntrega('2026-10-01','2026-09-30').label).toBe('Mañana');
 expect(c.posTablaFechaEntrega('2026-09-27','2026-09-30').label).toBe('Vencido hace 3 días');
 expect(c.posTablaFechaEntrega('2026-02-31','2026-09-30').label).toBe('Sin fecha válida');
});

it('la tabla muestra lo realmente cobrado y actualiza cliente sin cambiar importes',()=>{
 const body:any={innerHTML:'',closest(){return {parentElement:{appendChild(){}}};}};
 const doc:any={addEventListener(){},getElementById(id:string){return id==='pedidosTable'?body:id==='pedidosTablePaginador'?{innerHTML:''}:null;},querySelectorAll(){return [];}};
 const c=load('src/pedidos-1-views.ts',doc);c._inyectarBuscadorTabla=()=>{};c._pedidoVistaActual='tabla';c._pedidoFiltroActivo='todos';c._pedidosTablePage=1;c._PEDIDOS_PER_PAGE=20;c._esc=(v:any)=>String(v??'');c._fmtFechaCorta=(v:string)=>v;c.fmtMoney=(v:number)=>'$'+v.toFixed(2);c.calcSaldoPendiente=()=>45;c.posTotalPagado=()=>55;
 c.window.pedidos=[{id:'p1',folio:'PE-001',cliente:'Ana',concepto:'Playera azul',total:100,anticipo:25,entrega:'2026-09-30'}];
 c.renderTablaPedidos();expect(body.innerHTML).toContain('Cobrado');expect(body.innerHTML).toContain('$55.00');expect(body.innerHTML).toContain('data-action="openPedidoModal" data-arg="p1"');
 c.window.posTablaSelectedId='p1';c.window.pedidos[0].cliente='Beatriz';c.renderTablaPedidos();expect(body.innerHTML).toContain('pos-order-selected');expect(body.innerHTML).toContain('Beatriz');expect(body.innerHTML).not.toContain('>Ana<');
});

it('Enter en campos de captura no guarda; conserva textarea, botones y atajos explicitos',()=>{
 const handlers:any={};load('src/csp-delegate.ts',{addEventListener:(name:string,fn:any)=>{handlers[name]=fn;}});
 const input:any={tagName:'INPUT',type:'text',dataset:{},closest:()=>({id:'pedidoForm'})};let prevented=0;
 handlers.keydown({key:'Enter',target:input,preventDefault:()=>{prevented++;}});expect(prevented).toBe(1);
 input.tagName='TEXTAREA';handlers.keydown({key:'Enter',target:input,preventDefault:()=>{prevented++;}});expect(prevented).toBe(1);
 input.tagName='INPUT';input.type='submit';handlers.keydown({key:'Enter',target:input,preventDefault:()=>{prevented++;}});expect(prevented).toBe(1);
 input.type='text';handlers.keydown({key:'Tab',target:input,preventDefault:()=>{prevented++;}});expect(prevented).toBe(1);
});


it('historial muestra stock y precios con valores legibles, sin ruido tecnico',()=>{
 const c=load('src/operations.ts');c.fmtMoney=(n:number)=>'$'+n.toFixed(2);c._sameStoredValue=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
 const detail=c.posTextoCambio({action:'UPDATE',old_data:{stock:12,price:180,updated_at:'ayer'},new_data:{stock:8,price:200,updated_at:'hoy'}});
 expect(detail).toContain('Existencias: 12 → 8');expect(detail).toContain('Precio: $180.00 → $200.00');expect(detail).not.toContain('updated');
});


function uiDisk(){const data=new Map();return {open(){const r:any={};queueMicrotask(()=>{const db:any={objectStoreNames:{contains:()=>true},transaction(){const tx:any={objectStore(){return {get(k:string){const q:any={};queueMicrotask(()=>{q.result=structuredClone(data.get(k));q.onsuccess?.();tx.oncomplete?.();});return q;},put(v:any,k:string){const q:any={};data.set(k,structuredClone(v));queueMicrotask(()=>{q.onsuccess?.();tx.oncomplete?.();});return q;},delete(k:string){const q:any={};data.delete(k);queueMicrotask(()=>{q.onsuccess?.();tx.oncomplete?.();});return q;}};}};return tx;}};r.result=db;r.onsuccess?.();});return r;}};}
it('recupera campos y variantes del borrador tras otra carga y lo borra al guardar',async()=>{
 const disk=uiDisk();const field:any={id:'pedidoCliente',type:'text',value:'Ana',checked:false};const modal:any={id:'pedidoModal',dataset:{posDraftKey:'pedidoModal:nuevo'},querySelectorAll:()=>[field],querySelector:()=>null,_mkDirty:true,classList:{contains:()=>true}};
 const a=load('src/operations.ts');a.indexedDB=disk;a.window.pedidoProductosSeleccionados=[{id:'p1',variante:'M / Negro',quantity:2}];a.window.pedidoEmpaquesSeleccionados=[];
 await a.posGuardarBorrador(modal);
 const b=load('src/operations.ts');b.indexedDB=disk;b.document.getElementById=(id:string)=>id===field.id?field:null;b.window.renderPedidoProductosList=()=>{};b.window.renderPedidoEmpaquesList=()=>{};b.window.calcPedidoTotal=()=>{};b.window.manekiToastExport=()=>{};
 field.value='';expect(await b.posRecuperarBorrador(modal)).toBe(true);expect(field.value).toBe('Ana');expect(b.window.pedidoProductosSeleccionados[0].quantity).toBe(2);
 await b.posBorrarBorrador(modal);field.value='';expect(await b.posRecuperarBorrador(modal)).toBe(false);expect(field.value).toBe('');
});

it('el borrador de producto conserva archivos de foto y galeria sin base64',async()=>{
 const c=load('src/operations.ts');c.indexedDB=uiDisk();c.window.currentProductImageFile=new Blob(['foto'],{type:'image/webp'});c.window._ptGaleriaFiles=[new Blob(['galeria'])];
 const modal:any={id:'ptModal',dataset:{posDraftKey:'ptModal:nuevo'},querySelectorAll:()=>[],_mkDirty:true,classList:{contains:()=>true}};await c.posGuardarBorrador(modal);c.window.currentProductImageFile=null;c.window._ptGaleriaFiles=[];expect(await c.posRecuperarBorrador(modal)).toBe(true);expect(await c.window.currentProductImageFile.text()).toBe('foto');expect(await c.window._ptGaleriaFiles[0].text()).toBe('galeria');
});

it('listas usan miniaturas y la galeria conserva foto original',async()=>{
 const c=load('src/operations.ts');c.indexedDB=uiDisk();c.AbortSignal=AbortSignal;let downloads=0;c.fetch=async()=>{downloads++;return {ok:true,blob:async()=>new Blob(['original'])};};c._comprimirFile=async(file:any,size:number)=>{expect(size).toBe(240);return new Blob(['miniatura'],{type:'image/webp'});};
 expect(await (await c.posMiniatura('https://example.test/foto.webp')).text()).toBe('miniatura');await c.posMiniatura('https://example.test/foto.webp');expect(downloads).toBe(1);
 const inv=load('src/inventory-5.ts');inv._esc=String;inv.fmtMoney=String;const html=inv.inventoryCardHTML({id:'p1',name:'Foto',imageUrl:'https://example.test/foto.webp',price:10},2,'pt');expect(html).toContain('data-pos-thumb="https://example.test/foto.webp"');expect(html).not.toContain('src="https://example.test/foto.webp"');
});
it('Balance reintenta la captura recuperada con el mismo ID sin duplicar dinero',async()=>{
 let submit:any;const modal:any={dataset:{posDraftWriteId:'estable'},_mkDirty:true};const fields:any={transactionModal:modal,transactionType:{value:'income'},transactionConcept:{value:'Prueba'},transactionAmount:{value:'10'},transactionDate:{value:'2026-10-02'},transactionMethod:{value:'transferencia'},transactionForm:{addEventListener:(t:string,fn:any)=>{if(t==='submit')submit=fn;},reset(){}}};
 const c=load('src/balance.ts',{addEventListener(){},getElementById:(id:string)=>fields[id]||null});c.incomes=[{id:'estable',amount:10}];c.mkId=()=> 'otro';c.saveIncomes=async()=>{throw Error('Sin red');};let copied=0;c.window.posGuardarBorrador=async()=>{copied++;};c.renderBalance=()=>{};c.updateDashboard=()=>{};c.manekiToastExport=()=>{};
 await submit({preventDefault(){},target:{querySelector:()=>null}});await submit({preventDefault(){},target:{querySelector:()=>null}});
 expect(c.incomes).toHaveLength(1);expect(c.incomes[0].id).toBe('estable');expect(copied).toBe(4);
});

it('cancelar cierre en Balance conserva campos y registro editado',async()=>{
 const modal:any={dataset:{editId:'i1',editType:'income'},classList:{contains:()=>true}};let resets=0;const c=load('src/balance.ts',{addEventListener(){},getElementById:(id:string)=>id==='transactionModal'?modal:id==='transactionForm'?{addEventListener(){},reset(){resets++;}}:null});c.closeModal=async()=>{};await c.closeTransactionModal();expect(resets).toBe(0);expect(modal.dataset.editId).toBe('i1');
});
it('cambiar talla o color conserva piezas, precio y personalizacion de la linea',()=>{
 const c=load('src/operations.ts');c.window.products=[{id:'p',variants:[{type:'Talla/Color',value:'M / Negro'},{type:'Talla/Color',value:'L / Blanco'}]}];c.window.pedidoProductosSeleccionados=[{id:'p',name:'Playera',quantity:2,price:175,variante:'Talla/Color:M / Negro',posPersonalizacion:{nombre:'Ana'},posPromocion:{id:'combo',nombre:'Regalo'}}];
 c.editarVariantePedidoProducto(0,'Talla/Color:L / Blanco');expect(c.window.pedidoProductosSeleccionados[0]).toMatchObject({quantity:2,price:175,variante:'Talla/Color:L / Blanco',posPersonalizacion:{nombre:'Ana'},posPromocion:{id:'combo'}});
 expect(()=>c.editarVariantePedidoProducto(0,'Talla/Color:Inexistente')).toThrow();
});

it('avisa pedidos similares sin confundir variantes, cantidades ni el mismo registro',()=>{
 const c=load('src/operations.ts');c.posCentavos=(n:any)=>Math.round(Number(n)*100);const a={id:'a',folio:'PE-1',cliente:'José García',total:360,status:'confirmado',productosInventario:[{id:'p',quantity:2,price:180,variante:'M / Negro'}]};
 const draft={cliente:'jose garcia',total:360,productosInventario:[{id:'p',quantity:1,price:180,variante:'M / Negro'},{id:'p',quantity:1,price:180,variante:'M / Negro'}]};
 expect(c.posPedidosSimilares(draft,[a])).toHaveLength(1);expect(c.posPedidosSimilares({...draft,id:'a'},[a])).toHaveLength(0);expect(c.posPedidosSimilares({...draft,productosInventario:[{id:'p',quantity:2,price:180,variante:'L / Negro'}]},[a])).toHaveLength(0);expect(c.posPedidosSimilares({...draft,total:361},[a])).toHaveLength(0);
});
it('revision informativa relaciona saldo, cobros y stock sin alterar registros',()=>{
 const c=load('src/operations.ts');c.posCentavos=(n:any)=>Math.round(Number(n)*100);c.posTotalPagado=(p:any)=>p.pagos?.length?p.pagos.reduce((s:number,x:any)=>s+x.monto,0):p.anticipo||0;
 const snapshot={orders:[{id:'o',folio:'PE-2',cliente:'Ana',total:200,resta:180,pagos:[{monto:50}],productosInventario:[{id:'p',quantity:2,price:100}]}],incomes:[{id:'i',pedidoId:'o',amount:30}],products:[{id:'p',name:'Playera',stock:5,variants:[{qty:2},{qty:2}]}],movements:[{id:'m',productoId:'p',cantidad:-1,stockAntes:5,stockDespues:2}]};const before=JSON.stringify(snapshot);
 const issues=c.posRevisarConsistencia(snapshot);expect(issues.map((x:any)=>x.field)).toEqual(expect.arrayContaining(['saldo','cobros','stock','movimiento']));expect(issues.find((x:any)=>x.field==='saldo')).toMatchObject({id:'o',expected:150,actual:180});expect(JSON.stringify(snapshot)).toBe(before);
 const clean={orders:[{id:'o',total:200,resta:150,pagos:[{monto:50}],productosInventario:[{id:'p',quantity:2,price:100}]}],incomes:[{pedidoId:'o',amount:50}],products:[{id:'p',name:'Playera',stock:4,variants:[{qty:2},{qty:2}]}],movements:[{id:'m',productoId:'p',cantidad:-1,stockAntes:5,stockDespues:4}]};expect(c.posRevisarConsistencia(clean)).toEqual([]);
});
