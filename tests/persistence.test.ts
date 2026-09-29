import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { randomUUID } from 'node:crypto';

// Ejecuta el módulo real; solo sustituye navegador y transporte de Supabase.
function app(schema: Record<string, string[]> = {}, initialStorage?: Map<string, string>) {
  const stored = new Map<string, string>(initialStorage);
  const rows: Record<string, any[]> = {};
  let failure = false;
  let loseAck = false;
  const api = { from(table: string) {
    const query: any = {
      select() { return query; }, order() { return query; }, limit() { return query; },
      not() { return query; }, delete() { query.deleting = true; return query; },
      eq(field: string, key: string) { query.key = key; query.field = field; return query; },
      async maybeSingle() { return { data: (rows[table] || []).find(r => r.key === query.key) ?? null, error: null }; },
      then(resolve: any, reject: any) {
        if (failure) return Promise.resolve({data: null, error: {message: 'Fallo de red simulado'}}).then(resolve, reject);
        if (query.deleting) rows[table] = (rows[table] || []).filter(r => String(r[query.field]) !== String(query.key));
        return Promise.resolve({ data: rows[table] || [], error: null }).then(resolve, reject);
      },
      async insert(data: any) { return query.upsert([data]); },
      async upsert(data: any[]) {
        if (failure) return { error: { message: 'Fallo de red simulado' } };
        const unknown = schema[table] && data.flatMap(Object.keys).find(k => !schema[table].includes(k));
        if (unknown) return { error: { code: 'PGRST204', message: `Could not find the '${unknown}' column in the schema cache` } };
        for (const row of structuredClone(Array.isArray(data) ? data : [data])) {
          const key = table === 'store' ? 'key' : 'id';
          const existing = rows[table] || (rows[table] = []);
          const i = existing.findIndex(r => r[key] === row[key]);
          if (i < 0) existing.push(row); else existing[i] = row;
        }
        if (loseAck) { loseAck = false; return {error: {message: 'Respuesta perdida'}}; }
        return { error: null };
      }
    };
    return query;
  }};
  const ctx: any = createContext({
    console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: (k: string) => stored.get(k) ?? null,
      setItem: (k: string, v: string) => stored.set(k, v) },
    document: { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } },
    addEventListener() {}, setTimeout: (fn: any, ms: number) => { const t = setTimeout(fn, ms); t.unref(); return t; },
    clearTimeout, crypto: { randomUUID },
    __mkCfg: { getSupabase: () => new Promise(() => {}) },
    products: [], clients: [], salesHistory: [], incomes: [], expenses: [], categories: [],
    testApi: api
  });
  ctx.window = ctx;
  runInContext(transformSync(readFileSync('src/db.ts', 'utf8'), { loader: 'ts', target: 'es2020' }).code, ctx);
  runInContext('db = testApi', ctx);
  return { ctx, rows, stored, loseAck: () => { loseAck = true; }, fail: () => { failure = true; }, recover: () => { failure = false; }, load(file: string) {
    runInContext(transformSync(readFileSync(file, 'utf8'), { loader: 'ts', target: 'es2020' }).code, ctx);
  } };
}

it('conserva aprobacion, checklist, referencias y costos tras recargar pedidos',async()=>{
 const a=app();a.ctx.pedidos=[{id:'ficha-1',total:100,posDetalle:{aprobacion:{referencia:'Diseno v2',fecha:'2026-09-27'},costos:{estimado:40,reales:{materiales:30}}},checklist:{disenio:true},referenciasUrls:['https://example.test/diseno.webp'],referenciasPaths:['ficha-1/diseno.webp']}];
 await a.ctx.savePedidos();a.ctx.pedidos=[];
 const rows=await a.ctx.sbLoad('pedidos',[]);
 expect(rows[0]).toMatchObject({posDetalle:{aprobacion:{referencia:'Diseno v2'},costos:{estimado:40}},checklist:{disenio:true},referenciasPaths:['ficha-1/diseno.webp']});
});
it('el estado de guardado identifica solo el registro pendiente',async()=>{
 const a=app();
 a.ctx.products=[{id:'p1',name:'Prueba',price:10,stock:1}];
 a.fail();
 await expect(a.ctx.saveProducts()).rejects.toThrow();
 expect(a.ctx.posRecordSyncStatus('products','p1').state).toBe('pending');
 expect(a.ctx.posRecordSyncStatus('products','p2').state).toBe('saved');
});
function businessApp() {
  const a = app();
  const fields: Record<string, any> = {};
  const submits: Array<(e: any) => Promise<void>> = [];
  a.ctx.document.readyState = 'loading';
  a.ctx.document.getElementById = (id: string) => fields[id] || null;
  for (const id of ['pedidoForm','editPedidoId','pedidoCliente','pedidoTelefono','pedidoRedes','pedidoFecha',
    'pedidoEntrega','pedidoConcepto','pedidoAnticipo','pedidoNotas','pedidoLugarEntrega','pedidoCostoMateriales',
    'pedidoPrioridad','pedidoOcasion','pedidoPrecioLibre','pedidoStatusId']) {
    fields[id] = {value:'', style:{}, addEventListener(event: string, fn: any) {
      if (id === 'pedidoForm' && event === 'submit') submits.push(fn);
    }};
  }
  a.ctx.manekiToastExport = () => {};
  a.ctx._fechaHoy = () => '2026-09-26';
  a.ctx.showConfirm = async () => true;
  a.ctx.closeModal = () => {};
  a.ctx.setInterval = () => 0;
  a.load('src/pedidos-1-modal.ts');
  a.load('src/pedidos-1-views.ts');
  a.load('src/pedidos-2.ts');
  a.load('src/operations.ts');
  a.load('src/balance.ts');
  a.load('src/reportes.ts');
  // Solo presentacion/confirmaciones del navegador; reglas y persistencia son reales.
  a.ctx.renderPedidosTable = () => {};
  a.ctx.posAbrirFicha = () => {};
  a.ctx.updatePedidosStats = () => {};
  a.ctx._fotosArray = () => ({paths:[]});
  return {...a, fields, submit: () => submits[0]({preventDefault() {}})};
}

it('el resumen previo muestra variante, anticipo y campos por corregir',()=>{
 const a=businessApp();
 a.fields.pedidoCliente.value='Prueba';a.fields.pedidoFecha.value='2026-09-29';a.fields.pedidoEntrega.value='2026-09-30';a.fields.pedidoAnticipo.value='50';
 a.ctx.pedidoProductosSeleccionados=[{name:'Playera',variante:'Talla/Color:M / Negro',quantity:2,price:100}];
 const summary=a.ctx.pedidoResumenAntesDeGuardar();
 expect(summary.items[0].variante).toBe('Talla/Color:M / Negro');
 expect(summary.total).toBe(200);expect(summary.anticipo).toBe(50);expect(summary.saldo).toBe(150);expect(summary.missing).toEqual([]);
 a.fields.pedidoEntrega.value='';expect(a.ctx.pedidoResumenAntesDeGuardar().missing).toContain('Fecha de entrega');
});

it('Kanban permite abrir ficha sin mostrar controles de preparacion en cada densidad', () => {
  const a = businessApp();
  const p:any = {id:'pedido-1',folio:'PE-1',cliente:'Ana',status:'confirmado',total:100,checklist:{material:false},posDetalle:{}};
  for (const density of ['full','medium','compact']) {
    runInContext(`_kanbanCompacto = '${density}'`, a.ctx);
    const html = a.ctx.kanbanCardHTML(p);
    expect(html).not.toContain('mk-kanban-pending');
    expect(html).not.toContain('Diseño aprobado');
    expect(html).not.toContain('Material revisado');
    expect(html).toContain('data-kanban-open="pedido-1"');
    expect(html).toContain('tabindex="0"');
  }
  p.checklist.material = true;
  p.posDetalle.aprobacion = {referencia:'Arte aprobado',fecha:'2026-09-28',firma:a.ctx.posFirmaDiseno(p)};
  expect(a.ctx.kanbanCardHTML(p)).not.toContain('mk-kanban-pending');
  p.status = 'produccion';
  expect(a.ctx.kanbanCardHTML(p)).not.toContain('Pedido empacado');
});

it('editar un producto transmite solo esa fila y no toca otros productos',async()=>{
 const a=app();a.ctx.products=[{id:'p1',name:'Taza',price:100,stock:10},{id:'p2',name:'Bolsa',price:20,stock:5}];
 await a.ctx.saveProducts();
 const sent:any[]=[];
 a.ctx.testApi.rpc=async(_name:string,args:any)=>{sent.push(...args.p_rows);return {data:args.p_rows,error:null};};
 a.ctx.products[1].stock=4;
 await a.ctx.saveProducts();
 expect(sent.map(r=>r.id)).toEqual(['p2']);
 sent.splice(0);await a.ctx.saveProducts();expect(sent).toEqual([]);
});
it('conserva la tabla de precios variables despues de guardar y recargar',async()=>{
 const a=app();a.ctx.products=[{id:'pv-1',name:'Playera',tipo:'producto_variable',stock:0,
  tablaPreciosVariable:[{cantidadMin:1,precio:100},{cantidadMin:10,precio:800}],variants:[{type:'Talla/Color',value:'M / Negro',qty:2,priceDelta:10}]}];
 await a.ctx.saveProducts();
 expect(a.rows.products[0].tabla_precios_variable).toEqual([{cantidadMin:1,precio:100},{cantidadMin:10,precio:800}]);
 const loaded=await a.ctx.sbLoad('products',[]);
 expect(loaded[0].tablaPreciosVariable).toEqual([{cantidadMin:1,precio:100},{cantidadMin:10,precio:800}]);
});
it('calcula saldo y centavos igual antes de cargar Balance',()=>{
 const a=app();
 expect(a.ctx.mkRound2(1.005)).toBe(1.01);
 expect(a.ctx.mkRound2(-1.005)).toBe(-1.01);
 expect(a.ctx.calcSaldoPendiente({total:0.30,pagos:[{monto:0.10},{monto:0.20}]})).toBe(0);
 expect(a.ctx.calcSaldoPendiente({total:100,anticipo:25})).toBe(75);
 expect(a.ctx.calcSaldoPendiente({total:100,anticipo:80,pagos:[{monto:20}]})).toBe(80);
});
it('caja cuenta cobros una vez y separa saldos por cobrar del efectivo',()=>{
 const a=app();a.load('src/operations.ts');
 const result=a.ctx.posResumenCaja('2026-09-27',[
  {id:'a',date:'2026-09-27',type:'anticipo',total:50,method:'Efectivo'},
  {id:'unpaid',date:'2026-09-27',type:'pedido',total:90,method:'Efectivo'}
 ],[{id:'a',date:'2026-09-27',amount:50,method:'Efectivo'},{id:'b',date:'2026-09-27',amount:20,method:'Transferencia'}],
 [{id:'e',date:'2026-09-27',amount:10,method:'Efectivo'}],100);
 expect(result.efectivo).toMatchObject({entradas:50,salidas:10,esperado:140});
 expect(result.transferencia.esperado).toBe(20);
 expect(result.totalCobrado).toBe(70);
});

it('resume diferencias de conflicto sin incluir registros ajenos',()=>{
 const a=app();
 const text=a.ctx.posDescribeConflicts([{table:'products',rows:[{id:'p',name:'Taza',stock:9}],expected:{p:{id:'p',name:'Taza',stock:10}}}],{products:{p:{id:'p',name:'Taza',stock:8},other:{name:'Privado'}}},{},{});
 expect(text).toContain('Taza');expect(text).toContain('Existencias: dispositivo 9 · nube 8');expect(text).not.toContain('Privado');
});
it('los cierres nocturnos usan el dia local y conservan fechas sin hora',()=>{
 const a=app();const date=new Date(2026,8,26,23,30);
 expect(a.ctx.posFechaLocal(date.toISOString())).toBe('2026-09-26');
 expect(a.ctx.posFechaLocal('2026-09-26')).toBe('2026-09-26');
});

describe('Persistencia real del POS', () => {
  it('ajuste rapido exige motivo y conserva juntos stock y movimiento al fallar la red',async()=>{
    const a=app();a.load('src/operations.ts');a.load('src/inventory-1.ts');
    a.ctx.products=[{id:'p1',name:'Taza',stock:5}];a.ctx.stockMovements=[];a.ctx._fechaHoy=()=> '2026-09-27';
    await expect(a.ctx.posAjustarInventario('p1','stock',3,'')).rejects.toThrow('motivo');
    expect(a.ctx.products[0].stock).toBe(5);
    a.fail();await expect(a.ctx.posAjustarInventario('p1','stock',3,'Conteo fisico')).rejects.toMatchObject({pendingSync:true});
    const pending=JSON.parse(a.stored.get('maneki_pendingRows')||'[]');
    expect(pending.some(r=>r.table==='products')).toBe(true);expect(pending.some(r=>r.table==='stock_movements')).toBe(true);
    expect(new Set(pending.map(r=>r.batch)).size).toBe(1);
  });
  it('un fallo de red conserva el lote completo y reintenta con el mismo identificador', async()=>{
    const a=app();const ids:string[]=[];let offline=true;
    a.ctx.testApi.rpc=async (_name:string,args:any)=>{ids.push(args.p_id);return offline?{error:{message:'sin red'}}:{data:args.p_operations.map((o:any)=>o.rows)};};
    await expect(a.ctx.posRunOperation(async()=>{await a.ctx._upsertRelational('orders',[{id:'o1'}]);await a.ctx._upsertRelational('incomes',[{id:1,amount:20}]);})).rejects.toThrow('pendiente');
    expect(JSON.parse(a.stored.get('maneki_pendingRows')!)).toHaveLength(2);
    offline=false;await a.ctx._flushPendingRows();
    expect(ids[0]).toBe(ids[1]);expect(JSON.parse(a.stored.get('maneki_pendingRows')!)).toHaveLength(0);
  });
  it('resolver conserva como base exactamente la version de nube revisada',async()=>{
    const a=app();a.ctx.testApi.rpc=async()=>({error:{code:'40001',message:'Conflicto'}});
    await expect(a.ctx._upsertRelational('products',[{id:'p1',stock:9}])).rejects.toThrow();
    a.ctx.posRebasePending({products:{p1:{id:'p1',stock:8}}},{});
    const op=JSON.parse(a.stored.get('maneki_pendingRows')!)[0];
    expect(op.expected.p1.stock).toBe(8);expect(op.rows[0].stock).toBe(9);
  });

  it('un pedido y su ingreso se envian juntos en una sola operacion atomica', async () => {
    const a=app();const calls:any[]=[];
    a.ctx.testApi.rpc=async(name:string,args:any)=>{calls.push({name,args});return {data:args.p_operations.map((o:any)=>o.rows),error:null};};
    await a.ctx.posRunOperation(async()=>{
      await a.ctx._upsertRelational('orders',[{id:'o1',total:100}]);
      expect(calls).toHaveLength(0);
      await a.ctx._upsertRelational('incomes',[{id:1,amount:50}]);
    });
    expect(calls).toHaveLength(1);expect(calls[0].name).toBe('pos_apply_operation');
    expect(calls[0].args.p_operations.map((o:any)=>o.table)).toEqual(['orders','incomes']);
  });

  it('una respuesta tardia no anuncia conexion cuando el navegador esta offline', () => {
    const a=app();
    const fields:any={supabaseStatusDot:{},supabaseStatusText:{},supabaseStatus:{style:{}},'mk-offline-banner':{style:{},remove(){}}};
    a.ctx.document.getElementById=(id:string)=>fields[id] || null;
    a.ctx.navigator={onLine:false};
    a.ctx.actualizarIndicadorConexion(true);
    expect(fields.supabaseStatusText.textContent).toBe('Sin conexión (local)');
  });
  it('una cotizacion remota cambiada no es sobrescrita por otro dispositivo', async () => {
    const a=app();
    a.rows.store=[{key:'quotes',value:'[{"id":"q1","total":100}]'}];
    const local=await a.ctx.sbLoad('quotes',[]);
    a.rows.store[0].value='[{"id":"q1","total":120}]'; local[0].total=110;
    a.ctx.testApi.rpc=async (name:string,args:any)=>{
      expect(name).toBe('pos_apply_store');
      expect(args.p_expected).toContain('[{"id":"q1","total":100}]');
      return {error:{code:'40001',message:'Conflicto en cotizacion'}};
    };
    await expect(a.ctx.sbSave('quotes',local)).rejects.toThrow('Conflicto');
    expect(JSON.parse(a.rows.store[0].value)[0].total).toBe(120);
    expect((await a.ctx.sbLoad('quotes',[]))[0].total).toBe(110);
  });
  it('un cambio remoto concurrente rechaza el guardado y conserva la copia local pendiente', async () => {
    const a=app();
    a.rows.products=[{id:'p-concurrent',name:'Original',stock:10,price:100}];
    a.ctx.products=await a.ctx.sbLoad('products',[]);
    a.rows.products[0].stock=8;
    a.ctx.products[0].stock=9;
    a.ctx.testApi.rpc=async (_name:string,args:any) => {
      expect(args.p_expected['p-concurrent'].stock).toBe(10);
      return {error:{code:'40001',message:'Conflicto: cambio en otro dispositivo'}};
    };
    await expect(a.ctx.saveProducts()).rejects.toMatchObject({pendingSync:true});
    expect(a.rows.products[0].stock).toBe(8);
    expect(JSON.parse(a.stored.get('maneki_pendingRows')!)[0].rows[0].stock).toBe(9);
  });
  it('al finalizar y cobrar saldo conserva el cobro en ventas y Balance', async () => {
    const a = businessApp();
    const pedido:any = {id:'o1', folio:'PE-TEST', total:100, anticipo:25, resta:75, pagos:[{id:'a1',monto:25}],checklist:{material:true,producido:true,empacado:true},posDetalle:{}};
    pedido.posDetalle.aprobacion={referencia:'Arte aprobado',fecha:'2026-09-27',firma:a.ctx.posFirmaDiseno(pedido)};
    a.ctx.pedidos = [pedido];
    a.ctx.salesHistory = [{id:'a1',folio:'PE-TEST',type:'anticipo',total:25}];
    a.fields.pedidoStatusId.value = 'o1';
    await a.ctx.setPedidoStatus('finalizado');
    await new Promise(resolve => setTimeout(resolve, 0));
    await a.ctx.sincronizarPendientes();
    expect(await a.ctx.sbLoad('pedidos', [])).toEqual([]);
    expect((await a.ctx.sbLoad('pedidosFinalizados', []))[0]).toMatchObject({id:'o1',status:'finalizado'});
    expect(a.rows.orders_finalizados[0]).toMatchObject({resta:0,anticipo:100});
    expect((await a.ctx.sbLoad('salesHistory', [])).reduce((n: number, s: any)=>n+s.total,0)).toBe(100);
    expect((await a.ctx.sbLoad('incomes', []))[0]).toMatchObject({amount:75});
  });
  it('cancelar sin materiales persiste el estado y no crea cobros', async () => {
    const a = businessApp();
    a.ctx.pedidos = [{id:'o1',folio:'PE-CANCEL',total:100,status:'confirmado',pagos:[]}];
    a.fields.pedidoStatusId.value = 'o1';
    await a.ctx.setPedidoStatus('cancelado');
    await new Promise(resolve => setTimeout(resolve, 0));
    await a.ctx.sincronizarPendientes();
    expect((await a.ctx.sbLoad('pedidos', []))[0]).toMatchObject({status:'cancelado'});
    expect(await a.ctx.sbLoad('salesHistory', [])).toEqual([]);
  });
  it('produce y finaliza sin exigir aprobacion ni checklist', async () => {
    const a = businessApp();
    a.ctx.pedidos = [{id:'o1',folio:'PE-PEND',total:100,status:'confirmado',checklist:{material:true}}];
    a.fields.pedidoStatusId.value = 'o1';
    await a.ctx.setPedidoStatus('produccion');
    expect(a.ctx.pedidos[0].status).toBe('produccion');
    await a.ctx.setPedidoStatus('finalizado');
    expect(a.ctx.pedidos).toEqual([]);
    expect(a.ctx.pedidosFinalizados[0]).toMatchObject({id:'o1',status:'finalizado'});
  });
  it('arrastrar en Kanban avanza sin exigir aprobacion ni checklist', async () => {
    const a = businessApp();
    a.ctx.pedidos = [{id:'o1',folio:'PE-DRAG',total:100,status:'confirmado',productosInventario:[],checklist:{material:false}}];
    a.ctx.kanbanDragStart({dataTransfer:{},currentTarget:{style:{}}},'o1');
    await a.ctx.kanbanDrop({preventDefault(){}},'produccion');
    expect(a.ctx.pedidos[0].status).toBe('produccion');
    expect(a.rows.orders[0]).toMatchObject({id:'o1',status:'produccion'});
  });
  it('crea pedido con anticipo offline y lo recupera en Balance y Reportes', async () => {
    const first = businessApp();
    first.fields.pedidoCliente.value = 'Cliente Prueba';
    first.fields.pedidoConcepto.value = 'Servicio';
    first.fields.pedidoPrecioLibre.value = '100';
    first.fields.pedidoAnticipo.value = '25';
    first.fail();
    await first.submit();
    await first.ctx.sincronizarPendientes();
    const next = app({}, first.stored);
    await next.ctx.sincronizarPendientes();
    expect((await next.ctx.sbLoad('pedidos', []))[0]).toMatchObject({total:100, anticipo:25, resta:75});
    expect(await next.ctx.sbLoad('salesHistory', [])).toEqual([expect.objectContaining({type:'anticipo', total:25})]);
    expect(await next.ctx.sbLoad('incomes', [])).toEqual([expect.objectContaining({amount:25})]);
  });
  it('una respuesta perdida no duplica la venta al reintentar', async () => {
    const { ctx, loseAck } = app();
    ctx.salesHistory = [{id:'s-ack', total:45, type:'pos'}];
    loseAck();
    await expect(ctx.saveSalesHistory()).rejects.toMatchObject({pendingSync:true});
    await ctx.sincronizarPendientes();
    await ctx.sincronizarPendientes();
    expect(await ctx.sbLoad('salesHistory', [])).toEqual([expect.objectContaining({id:'s-ack', total:45})]);
  });
  it('si el dispositivo no puede guardar la cola, rechaza antes de escribir remotamente', async () => {
    const { ctx } = app();
    ctx.salesHistory = [{id:'sin-espacio', total:45}];
    ctx.localStorage.setItem = () => { throw new Error('Disco lleno'); };
    await expect(ctx.saveSalesHistory()).rejects.toThrow('Disco lleno');
    expect(await ctx.sbLoad('salesHistory', [])).toEqual([]);
  });
  it('una notificacion remota no pisa el cambio local pendiente', async () => {
    const { ctx, fail } = app();
    ctx.products = [{id:'p1', name:'Taza', stock:3}];
    fail();
    await expect(ctx.saveProducts()).rejects.toBeDefined();
    await ctx._applyRTRelacional('products', {eventType:'UPDATE',new:{id:'p1',name:'Taza',stock:5}});
    expect(ctx.products[0].stock).toBe(3);
  });
  it.each([
    ['products','saveProducts'], ['clients','saveClients'], ['categories','saveCategories'],
    ['pedidos','savePedidos'], ['pedidosFinalizados','savePedidosFinalizados'],
    ['incomes','saveIncomes'], ['expenses','saveExpenses']
  ])('reenvia %s desde disco sin depender de los arrays abiertos', async (key, save) => {
    const first = app();
    first.ctx[key] = [{id:'offline-1', name:'Prueba', amount:25, total:100}];
    first.fail();
    await expect(first.ctx[save]()).rejects.toBeDefined();
    const next = app({}, first.stored);
    await next.ctx.sincronizarPendientes();
    expect((await next.ctx.sbLoad(key, [])).map((r: any)=>r.id)).toEqual(['offline-1']);
    expect(next.ctx._pendingSync).toBe(false);
  });
  it('un abono offline conserva saldo e ingreso y venta al reconectar', async () => {
    const first = app();
    first.ctx.document.readyState = 'loading';
    first.load('src/pedidos-1-views.ts');
    first.ctx.document.getElementById = (id: string) => id === 'pedidoForm' ? {onsubmit: null, addEventListener() {}} : null;
    first.load('src/pedidos-2.ts');
    const fields: any = { abonoPedidoId: {value:'o1'}, abonoPedidoMonto: {value:'30'}, abonoPedidoNota: {value:'Prueba'} };
    first.ctx.document.getElementById = (id: string) => fields[id] || null;
    first.ctx.manekiToastExport = () => {};
    first.ctx._abonoPedidoMetodo = 'cash';
    first.ctx.renderPedidosTable = () => {};
    first.ctx.pedidos = [{id:'o1', folio:'PE-TEST', total:100, anticipo:0, resta:100, pagos:[]}];
    first.fail();
    await first.ctx.confirmarAbonoPedido();
    expect(first.ctx.pedidos[0].resta).toBe(70);
    const next = app({}, first.stored);
    await next.ctx.sincronizarPendientes();
    expect((await next.ctx.sbLoad('pedidos', []))[0]).toMatchObject({anticipo:30, resta:70});
    expect(await next.ctx.sbLoad('incomes', [])).toEqual([expect.objectContaining({amount:30})]);
    expect(await next.ctx.sbLoad('salesHistory', [])).toEqual([expect.objectContaining({total:30, type:'abono'})]);
  });
  it('conserva el kardex offline y lo reenvia una sola vez', async () => {
    const first = app();
    first.load('src/inventory-1.ts');
    first.ctx._fechaHoy = () => '2026-09-26';
    first.ctx.stockMovements = [];
    first.fail();
    await expect(first.ctx.registrarMovimiento({ productoId: 'p1', productoNombre: 'Taza', tipo: 'salida', cantidad: -2, stockAntes: 5, stockDespues: 3 })).rejects.toBeDefined();
    const next = app({}, first.stored);
    await next.ctx.sincronizarPendientes();
    await next.ctx.sincronizarPendientes();
    expect(await next.ctx.sbLoad('stockMovimientos', [])).toEqual([expect.objectContaining({productoId: 'p1', cantidad: -2, stockDespues: 3})]);
  });
  it('recupera un borrado fallido sin resucitar el pedido al reiniciar', async () => {
    const first = app();
    first.ctx.pedidos = [{ id: 'o1', total: 125 }];
    await first.ctx.savePedidos();
    first.fail();
    await expect(first.ctx.deletePedidoActivo('o1')).rejects.toBeDefined();
    const next = app({}, first.stored);
    next.rows.orders = first.rows.orders;
    expect(await next.ctx.sbLoad('pedidos', [])).toEqual([]);
    await next.ctx.sincronizarPendientes();
    expect(await next.ctx.sbLoad('pedidos', [])).toEqual([]);
    expect(next.ctx._pendingSync).toBe(false);
  });
  it('reenvia una venta pendiente tras reiniciar sin perderla al leer el servidor', async () => {
    const first = app();
    first.ctx.salesHistory = [{ id: 'offline-sale', type: 'pos', total: 125 }];
    first.fail();
    await expect(first.ctx.saveSalesHistory()).rejects.toBeDefined();
    const next = app({}, first.stored);
    expect((await next.ctx.sbLoad('salesHistory', [])).map((s: any) => s.id)).toContain('offline-sale');
    await next.ctx.sincronizarPendientes();
    next.stored.delete('maneki_salesHistory');
    expect(await next.ctx.sbLoad('salesHistory', [])).toEqual([expect.objectContaining({ id: 'offline-sale', total: 125 })]);
    expect(next.ctx._pendingSync).toBe(false);
  });
  it('conserva la descripción web y ocasión del pedido al guardar y recargar', async () => {
    const { ctx } = app();
    ctx.products = [{ id: 'p1', name: 'Taza', descripcionWeb: 'Taza personalizada' }];
    ctx.pedidos = [{ id: 'o1', ocasion: 'Cumpleaños' }];
    await ctx.saveProducts();
    await ctx.savePedidos();
    expect((await ctx.sbLoad('products', []))[0].descripcionWeb).toBe('Taza personalizada');
    expect((await ctx.sbLoad('pedidos', []))[0].ocasion).toBe('Cumpleaños');
  });
  it('guarda ventas en el esquema real y conserva el tipo de cobro al recargar', async () => {
    const { ctx } = app({ sales_history: ['id', 'folio', 'date', 'time', 'customer', 'concept', 'note',
      'products', 'subtotal', 'discount', 'tax', 'total', 'method', 'created_at', 'type',
      'discount_percent', 'tax_percent', 'pedido_id', 'folio_origen'] });
    ctx.salesHistory = [{ id: 's1', folio: 'PE-9001', type: 'anticipo', total: 200, method: 'Tarjeta' }];
    await ctx.saveSalesHistory();
    expect(await ctx.sbLoad('salesHistory', [])).toEqual([
      expect.objectContaining({ id: 's1', type: 'anticipo', total: 200, method: 'Tarjeta' })
    ]);
  });
  it('guarda ingresos y gastos con metodo sin exigir updated_at', async () => {
    const { ctx } = app({
      incomes: ['id', 'concept', 'amount', 'date', 'client', 'from_pos', 'folio_origen', 'pedido_id', 'method'],
      expenses: ['id', 'concept', 'amount', 'date', 'category', 'etiqueta', 'notas', 'from_payable', 'method']
    });
    ctx.incomes = [{ id: 'i1', amount: 50, method: 'Tarjeta' }];
    ctx.expenses = [{ id: 'e1', amount: 25 }];
    await ctx.saveIncomes();
    await ctx.saveExpenses();
    expect((await ctx.sbLoad('incomes', []))[0]?.amount).toBe(50);
    expect((await ctx.sbLoad('expenses', []))[0]?.amount).toBe(25);
  });
  it.each([
    ['products', 'saveProducts'], ['clients', 'saveClients'], ['salesHistory', 'saveSalesHistory'],
    ['incomes', 'saveIncomes'], ['expenses', 'saveExpenses'], ['pedidos', 'savePedidos'],
    ['pedidosFinalizados', 'savePedidosFinalizados']
  ])('conserva %s en el dispositivo cuando falla la red', async (key, save) => {
    const { ctx, stored, fail } = app();
    ctx[key] = [{ id: 'local-1', name: 'Pendiente', total: 125 }];
    fail();
    await expect(ctx[save]()).rejects.toMatchObject({ message: 'Fallo de red simulado' });
    expect(JSON.parse(stored.get('maneki_' + key) || '[]')).toEqual([
      expect.objectContaining({ id: 'local-1', total: 125 })
    ]);
  });
  it('Realtime conserva campos de inventario y tipo de venta igual que una recarga', async () => {
    const { ctx } = app();
    await ctx._applyRTRelacional('products', { eventType: 'INSERT', new: {
      id: 'p1', name: 'Papel', tipo: 'materia_prima', rendimiento_por_hoja: 6,
      unidad: 'hoja', es_empaque: true, description: 'Papel especial'
    } });
    await ctx._applyRTRelacional('sales_history', { eventType: 'INSERT', new: { id: 's1', type: 'anticipo', total: 200 } });
    expect(ctx.products[0]).toMatchObject({ rendimientoPorHoja: 6, unidad: 'hoja', esEmpaque: true, descripcionWeb: 'Papel especial' });
    expect(ctx.salesHistory[0].type).toBe('anticipo');
  });
  it('aplica un DELETE de Realtime cuyo campo new está vacío', async () => {
    const { ctx } = app();
    ctx.products = [{ id: 'p1' }, { id: 'p2' }];
    await ctx._applyRTRelacional('products', { eventType: 'DELETE', new: {}, old: { id: 'p1' } });
    expect(ctx.products.map((p: any) => p.id)).toEqual(['p2']);
  });
  it('reporta una vez un pedido histórico con venta legacy duplicada', () => {
    const { ctx, load } = app();
    load('src/reportes.ts');
    ctx.salesHistory = [{ id: 's1', type: 'venta', folio: 'PE-1', total: 1000 }];
    ctx.pedidosFinalizados = [{ id: 'p1', folio: 'PE-1', total: 1000 }];
    expect(ctx._getAllVentas().reduce((n: number, s: any) => n + s.total, 0)).toBe(1000);
  });
  it.each([[200, 800], [1000, 0]])('reporta anticipo %s y saldo %s sin descontar dos veces', (anticipo, saldo) => {
    const { ctx, load } = app();
    load('src/reportes.ts');
    ctx.salesHistory = [
      { id: 'a1', type: 'anticipo', folio: 'PE-1', total: anticipo },
      { id: 's1', type: 'pedido', folio: 'PE-1', total: saldo }
    ];
    ctx.pedidosFinalizados = [{ id: 'p1', folio: 'PE-1', total: 1000 }];
    expect(ctx._getAllVentas().reduce((n: number, s: any) => n + s.total, 0)).toBe(1000);
  });
  it('un pedido histórico totalmente anticipado no vuelve a contar el total al cerrar', () => {
    const { ctx, load } = app();
    load('src/reportes.ts');
    ctx.salesHistory = [{ id: 'a1', type: 'anticipo', folio: 'PE-1', total: 1000 }];
    ctx.pedidosFinalizados = [{ id: 'p1', folio: 'PE-1', total: 1000 }];
    expect(ctx._getAllVentas().reduce((n: number, s: any) => n + s.total, 0)).toBe(1000);
  });
  it('actualiza reportes al cambiar centavos sin cambiar la cantidad de ventas', () => {
    const { ctx, load } = app();
    load('src/reportes.ts');
    ctx.salesHistory = [{ id: 's1', type: 'pos', total: 100.10 }];
    ctx._getAllVentas();
    ctx.salesHistory = [{ id: 's1', type: 'pos', total: 100.20 }];
    expect(ctx._getAllVentas()[0].total).toBe(100.20);
  });
  it('calcula disponibilidad con el módulo de inventario real', () => {
    const { ctx, load } = app();
    load('src/inventory-1.ts');
    ctx.products = [{ id: 'mp1', tipo: 'materia_prima', stock: 5 }];
    expect(ctx.calcularPiezasFabricables({ mpComponentes: [{ id: 'mp1', qty: 2 }], rendimientoPorHoja: 4 })).toBe(8);
  });
  it('el arranque no duplica anticipos ya guardados con su id original', () => {
    const { ctx, load } = app();
    load('src/config.ts');
    ctx.salesHistory = [{ id: 'anticipo-original', type: 'anticipo', folio: 'PE-1', total: 200 }];
    ctx.pedidos = [{ id: 'p1', folio: 'PE-1', total: 1000, anticipo: 200 }];
    ctx._inyectarAnticiposEnSalesHistory();
    expect(ctx.salesHistory.reduce((n: number, s: any) => n + s.total, 0)).toBe(200);
  });
  it('rechaza un respaldo con productos malformados antes de habilitar restauración', () => {
    const { ctx, load } = app();
    ctx.document.getElementById = (id: string) => id === 'backupModal' ? { addEventListener() {} } : null;
    ctx.setInterval = () => 0;
    load('src/backup.ts');
    expect(() => ctx._activarBackupPendiente({ version: '2.1', datos: { products: 'corrupto' } }, 'backup.json'))
      .toThrow('products');
  });
  it('restaura categorías en la tabla que usa la carga inicial', async () => {
    const { ctx, load } = app();
    ctx.document.getElementById = (id: string) => id === 'backupModal' ? { addEventListener() {} } : null;
    ctx.setInterval = () => 0;
    load('src/backup.ts');
    await ctx.restaurarDatosBackup({ categories: [{ id: 'tazas', name: 'Tazas' }] });
    expect(await ctx.sbLoad('categories', [])).toEqual([expect.objectContaining({ id: 'tazas', name: 'Tazas' })]);
  });
  it('restaura el kardex en la tabla relacional de movimientos', async () => {
    const { ctx, load } = app();
    ctx.document.getElementById = (id: string) => id === 'backupModal' ? { addEventListener() {} } : null;
    ctx.setInterval = () => 0;
    load('src/backup.ts');
    await ctx.restaurarDatosBackup({ stockMovimientos: [{ id: 'm1', productoId: 'p1', tipo: 'salida',
      cantidad: -2, stockAntes: 5, stockDespues: 3, fecha: '2026-09-26T10:00:00Z' }] });
    expect((await ctx.sbLoad('stockMovimientos', []))[0]).toMatchObject({ id: 'm1', cantidad: -2, stockDespues: 3 });
  });
  it('reintenta los datos KV al reconectar antes de marcarlos sincronizados', async () => {
    const { ctx, stored, fail, recover } = app();
    fail();
    await expect(ctx.sbSave('quotes', [{ id: 'q1', total: 50 }])).rejects.toThrow();
    recover();
    await ctx.sincronizarPendientes();
    stored.delete('maneki_quotes');
    expect(await ctx.sbLoad('quotes', [])).toEqual([expect.objectContaining({ id: 'q1', total: 50 })]);
    expect(ctx._pendingSync).toBe(false);
  });
  it('recupera la cola KV después de cerrar y volver a abrir la app', async () => {
    const first = app();
    first.fail();
    await expect(first.ctx.sbSave('quotes', [{ id: 'q2' }])).rejects.toThrow();
    const next = app({}, first.stored);
    await next.ctx.sincronizarPendientes();
    next.stored.delete('maneki_quotes');
    expect(await next.ctx.sbLoad('quotes', [])).toEqual([expect.objectContaining({ id: 'q2' })]);
  });
  it('Realtime no devuelve pedidos finalizados al tablero activo', async () => {
    const { ctx } = app();
    await ctx._applyRTRelacional('orders', { eventType: 'INSERT', new: { id: 'p1', status: 'finalizado' } });
    expect(ctx.pedidos).toEqual([]);
  });
  it('Realtime recarga gastos sin depender de una columna updated_at inexistente', async () => {
    const { ctx, rows } = app();
    await ctx._applyRTRelacional('expenses', { eventType: 'UPDATE' });
    rows.expenses = [{ id: 'e1', amount: 25 }];
    await ctx._applyRTRelacional('expenses', { eventType: 'UPDATE' });
    expect(ctx.expenses).toEqual([expect.objectContaining({ id: 'e1', amount: 25 })]);
  });
  it.each([['quotes', 'saveQuotes'], ['receivables', 'saveReceivables'], ['payables', 'savePayables']])(
    '%s permite esperar la confirmación del guardado', async (key, save) => {
      const { ctx } = app();
      ctx[key] = [{ id: 'kv1' }];
      const pending = ctx[save]();
      expect(typeof pending?.then).toBe('function');
      await pending;
      expect(ctx._pendingSync).toBe(false);
    });
});
