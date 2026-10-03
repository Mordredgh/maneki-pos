import {it,expect,vi,afterEach} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';
afterEach(()=>vi.useRealTimers());
function events(){
 const handlers:any={},window:any={},ctx:any={window,document:{addEventListener:(name:string,fn:any)=>{handlers[name]=fn;}},setTimeout,clearTimeout,console};
 runInNewContext(transformSync(readFileSync('src/csp-delegate.ts','utf8'),{loader:'ts'}).code,ctx);
 return {handlers,window,ctx};
}
function row(id:string,money:string){
 const cell=()=>({innerHTML:'',writes:0});const identity=cell(),amount=cell();identity.innerHTML=id;amount.innerHTML=money;
 return {dataset:{tableOpen:id},className:'pos-order-row',children:[identity,amount],parent:null as any,remove(){const parent=this.parent;if(parent)parent.children.splice(parent.children.indexOf(this),1);}};
}
it('una actualizacion conserva filas y cliente, cambia solo el importe afectado y respeta filtros y orden',()=>{
 const doc:any={addEventListener(){},getElementById(){return null;},activeElement:null};const ctx:any={window:{},document:doc,console};
 runInNewContext(transformSync(readFileSync('src/pedidos-1-views.ts','utf8'),{loader:'ts'}).code,ctx);
 const a=row('a','100'),b=row('b','200');const body:any={children:[a,b],insertBefore(r:any,next:any){r.remove();const i=this.children.indexOf(next);this.children.splice(i<0?this.children.length:i,0,r);r.parent=this;}};a.parent=b.parent=body;
 const identity=a.children[0];ctx.posTablaActualizarFilas(body,[row('a','90'),row('b','200')]);
 expect(body.children[0]).toBe(a);expect(body.children[1]).toBe(b);expect(a.children[0]).toBe(identity);expect(a.children[1].innerHTML).toBe('90');
 ctx.posTablaActualizarFilas(body,[row('b','200'),row('c','300')]);expect(body.children.map((r:any)=>r.dataset.tableOpen)).toEqual(['b','c']);expect(body.children[0]).toBe(b);
});
it('si cambia la celda enfocada restaura el mismo boton sin desplazar la tabla',()=>{
 const a:any=row('a','100'),next:any=row('a','90');next.children[0].innerHTML='Cliente corregido';
 const restore=vi.fn(),focused:any={dataset:{action:'posTablaAbrirFicha',arg:'a'},isConnected:true,closest:()=>a};
 let html='a';Object.defineProperty(a.children[0],'innerHTML',{get:()=>html,set:(value)=>{html=value;focused.isConnected=false;}});
 a.querySelectorAll=()=>[{dataset:{action:'posTablaAbrirFicha',arg:'a'},focus:restore}];
 const ctx:any={window:{},document:{addEventListener(){},getElementById(){return null;},activeElement:focused},console};
 runInNewContext(transformSync(readFileSync('src/pedidos-1-views.ts','utf8'),{loader:'ts'}).code,ctx);
 const body:any={children:[a]};ctx.posTablaActualizarFilas(body,[next]);expect(restore).toHaveBeenCalledWith({preventScroll:true});expect(body.children[0]).toBe(a);
});
it('la busqueda de pedidos agrupa teclas y entrega solo el texto final sin reemplazar el campo',()=>{
 vi.useFakeTimers();const {handlers,window}=events(),render=vi.fn();window._pedidosResetPageAndRender=render;
 const field:any={dataset:{oninput:'_pedidosResetPageAndRender'},value:'ka',isConnected:true};
 handlers.input({target:field});field.value='karen';handlers.input({target:field});expect(render).not.toHaveBeenCalled();
 vi.advanceTimersByTime(180);expect(render).toHaveBeenCalledOnce();expect(render).toHaveBeenCalledWith(field);
});
it('composicion no busca texto incompleto y campos de captura siguen respondiendo inmediatamente',()=>{
 vi.useFakeTimers();const {handlers,window}=events();window._pedidosResetPageAndRender=vi.fn();window.calcular=vi.fn();
 const field:any={dataset:{oninput:'_pedidosResetPageAndRender'},isConnected:true};
 handlers.input({target:field,isComposing:true});vi.advanceTimersByTime(300);expect(window._pedidosResetPageAndRender).not.toHaveBeenCalled();
 handlers.compositionend({target:field});vi.advanceTimersByTime(180);expect(window._pedidosResetPageAndRender).toHaveBeenCalledOnce();
 handlers.input({target:{dataset:{oninput:'calcular'}}});expect(window.calcular).toHaveBeenCalledOnce();
});
it('una busqueda cancelada al navegar no renderiza la seccion anterior',()=>{
 vi.useFakeTimers();const {handlers,window}=events();window._pedidosResetPageAndRender=vi.fn();
 handlers.input({target:{dataset:{oninput:'_pedidosResetPageAndRender'},isConnected:true}});clearTimeout(window._posSearchTimeout);vi.advanceTimersByTime(300);expect(window._pedidosResetPageAndRender).not.toHaveBeenCalled();
});
it.each([['_mkDebounceInv','renderInventoryTable'],['_mkDebounceInc','renderIncomeList'],['_mkDebounceExp','renderExpenseList'],['_mkDebouncePed','renderPedidosTable'],['_mkDebounceHp','renderHistorialPedidos'],['_mkDebounceMov','renderMovimientos']])('la busqueda %s se cancela tambien al cambiar de seccion',(action,render)=>{
 vi.useFakeTimers();const {window,ctx}=events();ctx[render]=vi.fn();window[action]();clearTimeout(window._posSearchTimeout);vi.advanceTimersByTime(300);expect(ctx[render]).not.toHaveBeenCalled();
});
