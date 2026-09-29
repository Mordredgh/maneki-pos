// Herramientas operativas: calculos puros compartidos y dialogos nativos.
function posMatrizVariantes(product:any,orders:any[]){
    const variants=(product.variants||[]).map((v:any,index:number)=>({...v,index,size:v.size||String(v.value||'').split('/')[0]?.trim(),color:v.color||String(v.value||'').split('/')[1]?.trim()})).filter((v:any)=>v.size&&v.color);
    const sizes=[...new Set<string>(variants.map((v:any)=>v.size))],colors=[...new Set<string>(variants.map((v:any)=>v.color))];
    return {sizes,colors,cells:sizes.flatMap(size=>colors.map(color=>{
        const v=variants.find((x:any)=>x.size===size&&x.color===color);const key=v?`${v.type}:${v.value}`:'';
        const comprometidas=v?(orders||[]).filter(p=>!p.inventarioDescontado&&!['cancelado','finalizado','entregado','completado'].includes(p.status)).reduce((sum,p)=>sum+(p.productosInventario||[]).filter((i:any)=>String(i.id)===String(product.id)&&i.variante===key).reduce((n:number,i:any)=>n+Number(i.quantity||i.cantidad||0),0),0):0;
        const terminadas=Number(v?.qty)||0;return {size,color,index:v?.index??-1,terminadas,comprometidas,libres:Math.max(0,terminadas-comprometidas),faltantes:Math.max(0,comprometidas-terminadas)};
    }))};
}
window.posMatrizVariantes=posMatrizVariantes;
function posRentabilidad(pedido:any,costos:any){
    const cents=(v:any)=>{const n=Number(v);if(!Number.isFinite(n)||n<0)throw Error('Los costos deben ser importes positivos o cero.');return Math.round(n*100);};
    const total=cents(pedido.total||0),estimado=costos.estimado==null?null:cents(costos.estimado);
    const reposiciones=(pedido.posDetalle?.reposiciones||[]).reduce((s:number,r:any)=>s+cents(r.costo),0);
    const real=costos.reales==null?null:['materiales','empaque','comisiones','envio','merma'].reduce((s,k)=>s+cents(costos.reales[k]??0),reposiciones);
    return {estimado:estimado==null?null:estimado/100,real:real==null?null:real/100,ganancia:real==null?null:(total-real)/100,margen:real==null||!total?null:Math.round((total-real)/total*10000)/100,diferencia:estimado==null||real==null?null:(real-estimado)/100};
}
window.posRentabilidad=posRentabilidad;
function posFirmaDiseno(p:any){return JSON.stringify([p.concepto||'',(p.productosInventario||[]).map((i:any)=>[i.id,i.variante||'',i.quantity||i.cantidad||1]),p.referenciasUrls||[],p.referenciaUrl||'']);}
window.posFirmaDiseno=posFirmaDiseno;

async function posAbrirMatriz(id?:string){
    if(typeof window.ensureInventario==='function')await window.ensureInventario();
    const available=(window.products||[]).filter(p=>(p.variants||[]).some(v=>v.type==='Talla/Color'||(v.size&&v.color)));
    const product=available.find(p=>String(p.id)===String(id))||available[0];
    const dialog=posDialog('Existencias por talla y color');dialog.classList.add('pos-wide-dialog');
    if(!product){dialog.append('No hay productos con combinaciones de talla y color. Configúralas en la ficha del producto.');return;}
    const select=document.createElement('select');select.setAttribute('aria-label','Producto');
    available.forEach(p=>{const option=document.createElement('option');option.value=String(p.id);option.textContent=p.name;option.selected=p===product;select.appendChild(option);});
    select.onchange=()=>{dialog.close();posAbrirMatriz(select.value);};dialog.appendChild(select);
    const matrix=posMatrizVariantes(product,window.pedidos||[]),before=JSON.stringify(product);
    const form=document.createElement('form');const scroll=document.createElement('div');scroll.className='pos-table-scroll';
    const table=document.createElement('table');table.className='pos-data-table';
    table.innerHTML=`<caption>Modifica piezas terminadas. Los pedidos en producción ya fueron descontados. La capacidad de fabricación comparte materiales entre combinaciones y no se suma.</caption><thead><tr><th>Talla</th>${matrix.colors.map(c=>`<th>${_esc(c)}</th>`).join('')}</tr></thead>`;
    const body=document.createElement('tbody');
    for(const size of matrix.sizes){const row=document.createElement('tr');const header=document.createElement('th');header.textContent=size;row.appendChild(header);
      for(const color of matrix.colors){const cell=matrix.cells.find(c=>c.size===size&&c.color===color)!;const td=document.createElement('td');
        if(cell.index<0){td.textContent='Sin combinación';td.className='pos-cell-missing';}
        else{const v=product.variants[cell.index];const input=document.createElement('input');input.name='variant-'+cell.index;input.type='number';input.min='0';input.step='1';input.required=true;input.value=String(cell.terminadas);input.setAttribute('aria-label',`${size}, ${color}: piezas terminadas`);td.appendChild(input);
          const hint=document.createElement('small');let fabricables=0;
          if((product.mpComponentes||[]).length){const capacities=product.mpComponentes.filter(c=>(window.products||[]).find(p=>String(p.id)===String(c.id))?.tipo!=='servicio').map(c=>{const mp=(window.products||[]).find(p=>String(p.id)===String(c.id));const variant=mp?.variants?.length&&typeof window.pvVarianteMaterial==='function'?window.pvVarianteMaterial(mp,`${v.type}:${v.value}`):null;const stock=mp?.variants?.length?Number(variant?.qty)||0:Number(mp?.stock)||0;return Math.floor(stock/(Number(c.qty)||1))*(Number(product.rendimientoPorHoja)||1);});fabricables=capacities.length?Math.min(...capacities):0;}
          hint.textContent=`${cell.comprometidas} comprometidas · ${cell.libres} libres · ${fabricables} fabricables${cell.faltantes?' · faltan '+cell.faltantes+' terminadas':''}`;td.appendChild(hint);}
        row.appendChild(td);
      }body.appendChild(row);
    }table.appendChild(body);scroll.appendChild(table);form.appendChild(scroll);
    const label=document.createElement('label');label.textContent='Motivo del ajuste';const reason=document.createElement('input');reason.required=true;reason.maxLength=500;reason.placeholder='Ej. conteo físico';label.appendChild(reason);form.appendChild(label);
    const status=document.createElement('p');status.setAttribute('role','status');const submit=document.createElement('button');submit.type='submit';submit.className='btn-primary';submit.textContent='Guardar existencias';form.append(status,submit);dialog.appendChild(form);
    form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;status.textContent='Guardando…';try{
      if(JSON.stringify((window.products||[]).find(p=>String(p.id)===String(product.id)))!==before)throw Error('El producto cambió. Vuelve a abrir la matriz.');
      const changes=Array.from(form.querySelectorAll('input[name^="variant-"]') as NodeListOf<HTMLInputElement>).map(input=>({index:Number(input.name.slice(8)),qty:Number(input.value)}));
      if(!reason.value.trim()||changes.some(c=>!Number.isSafeInteger(c.qty)||c.qty<0))throw Error('Revisa las cantidades y el motivo.');
      await posRunOperation(async()=>{for(const change of changes){const v=product.variants[change.index],previous=Number(v.qty)||0;if(previous===change.qty)continue;v.qty=change.qty;await registrarMovimiento({productoId:product.id,productoNombre:product.name,tipo:'ajuste',cantidad:change.qty-previous,motivo:`${reason.value.trim()} · ${v.value}`,stockAntes:previous,stockDespues:change.qty});}product.stock=product.variants.reduce((s,v)=>s+(Number(v.qty)||0),0);await saveProducts();},'Conteo de variantes');
      status.textContent='Existencias guardadas y movimientos registrados.';submit.textContent='Guardado';form.querySelectorAll('input').forEach(i=>i.disabled=true);renderInventoryTable();
    }catch(err:any){status.textContent=err.message||'No se pudo guardar.';submit.disabled=!!err.pendingSync;}};
}
window.posAbrirMatriz=posAbrirMatriz;

function posAbrirFicha(id?:string){
    document.querySelector('dialog.pos-order-drawer')?.close();
    const allOrders=[...(window.pedidos||[]),...(window.pedidosFinalizados||[])];
    const visibleIds=Array.from(document.querySelectorAll('#vistaKanban [data-kanban-open]')).map(el=>el.dataset.kanbanOpen);
    const orders=id&&visibleIds.includes(String(id))?visibleIds.map(key=>allOrders.find(p=>String(p.id)===key)).filter(Boolean):allOrders;
    const p=orders.find(p=>String(p.id)===String(id))||orders[0];const dialog=posDialog('Ficha del pedido',false);dialog.classList.add('pos-wide-dialog','pos-order-drawer');
    if(!p){dialog.append('Todavía no hay pedidos.');return;}
    const nav=document.createElement('div');nav.className='pos-order-drawer-nav';const previous=document.createElement('button');previous.type='button';previous.textContent='← Anterior';const next=document.createElement('button');next.type='button';next.textContent='Siguiente →';const index=orders.indexOf(p);previous.disabled=index<=0;next.disabled=index>=orders.length-1;previous.onclick=()=>posAbrirFicha(String(orders[index-1].id));next.onclick=()=>posAbrirFicha(String(orders[index+1].id));nav.append(previous,next);dialog.appendChild(nav);
    const selector=document.createElement('select');selector.setAttribute('aria-label','Pedido');orders.forEach(ped=>{const option=document.createElement('option');option.value=String(ped.id);option.textContent=`${ped.folio||ped.id} · ${ped.cliente||'Sin cliente'}`;option.selected=ped===p;selector.appendChild(option);});selector.onchange=()=>posAbrirFicha(selector.value);dialog.appendChild(selector);
    const sync=document.createElement('small');sync.className='pos-record-sync';sync.dataset.syncTable=(window.pedidosFinalizados||[]).includes(p)?'orders_finalizados':'orders';sync.dataset.syncId=String(p.id);const current=window.posRecordSyncStatus?.(sync.dataset.syncTable,sync.dataset.syncId);sync.textContent=current?.text||'Estado no disponible';sync.dataset.state=current?.state||'unknown';dialog.appendChild(sync);
    const before=JSON.stringify(p),detail=p.posDetalle||{};const form=document.createElement('form');
    const heading=document.createElement('p');heading.textContent=`${p.status} · Entrega: ${p.entrega||'sin fecha'} · ${p.lugarEntrega||'sin dirección'} · Total ${fmtMoney(p.total||0)} · Pagado ${fmtMoney(posTotalPagado(p))} · Saldo ${fmtMoney(calcSaldoPendiente(p))}`;form.appendChild(heading);
    const lines=document.createElement('ul');for(const line of p.productosInventario||[]){const li=document.createElement('li');li.textContent=`${line.quantity||line.cantidad||1} × ${line.name||line.nombre||line.id} · ${line.variante||'Sin variante'}`;lines.appendChild(li);}form.appendChild(lines);
    const refs=document.createElement('details');refs.innerHTML='<summary>Referencias y materiales</summary>';
    for(const url of [...(p.referenciasUrls||[]),p.referenciaUrl].filter(Boolean)){try{const parsed=new URL(url);if(parsed.protocol!=='https:')continue;const a=document.createElement('a');a.href=parsed.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ver referencia';refs.appendChild(a);}catch{}}
    for(const line of p.productosInventario||[]){const prod=(window.products||[]).find(x=>String(x.id)===String(line.id));for(const c of prod?.mpComponentes||[]){const row=document.createElement('p');row.textContent=`${prod.name}: ${c.qty||1} × ${(window.products||[]).find(x=>String(x.id)===String(c.id))?.name||c.name||'Material eliminado'} por lote de ${prod.rendimientoPorHoja||1} pieza(s)`;refs.appendChild(row);}}form.appendChild(refs);
    const versions:any[]=[...(detail.versionesDiseno||[])];
    const versionBox=document.createElement('fieldset');versionBox.className='pos-order-subsection';versionBox.innerHTML='<legend>Versiones del diseño</legend><p>Agrega propuestas y consulta sus referencias cuando las necesites.</p>';
    const versionList=document.createElement('div');versionList.className='pos-version-list';versionBox.appendChild(versionList);
    const versionName=document.createElement('input');versionName.placeholder='Ej. Arte con fondo dorado';versionName.maxLength=120;versionName.setAttribute('aria-label','Nombre de nueva versión');
    const versionUrl=document.createElement('input');versionUrl.type='url';versionUrl.placeholder='Enlace HTTPS al diseño (opcional)';versionUrl.setAttribute('aria-label','Enlace de nueva versión');
    const addVersion=document.createElement('button');addVersion.type='button';addVersion.textContent='Agregar versión';versionBox.append(versionName,versionUrl,addVersion);form.appendChild(versionBox);
    const renderVersions=()=>{versionList.replaceChildren();for(const v of versions){const row=document.createElement('div');row.className='pos-version-row';const name=document.createElement('span');name.textContent=`${v.nombre} · ${new Date(v.fecha).toLocaleDateString('es-MX')}`;row.append(name);if(v.url){try{const url=new URL(v.url);if(url.protocol==='https:'){const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ver diseño';row.appendChild(link);}}catch{}}versionList.appendChild(row);}};
    addVersion.onclick=()=>{const nombre=versionName.value.trim(),url=versionUrl.value.trim();if(!nombre){versionName.setCustomValidity('Escribe el nombre de la versión.');versionName.reportValidity();return;}versionName.setCustomValidity('');if(url){try{if(new URL(url).protocol!=='https:')throw Error();}catch{versionUrl.setCustomValidity('Usa un enlace HTTPS.');versionUrl.reportValidity();return;}}versionUrl.setCustomValidity('');versions.push({id:mkId(),nombre,url,fecha:new Date().toISOString()});versionName.value='';versionUrl.value='';renderVersions();};
    renderVersions();
    const costs=document.createElement('fieldset');costs.innerHTML='<legend>Rentabilidad del pedido</legend><p>Captura costos, sin duplicar empaque ni envío en materiales. Esto no registra egresos en Balance.</p>';
    const fields:any={};for(const [key,text] of Object.entries({estimado:'Costo estimado total',materiales:'Materiales reales',empaque:'Empaque real',comisiones:'Comisiones reales',envio:'Envío real',merma:'Merma real'})){const label=document.createElement('label');label.textContent=text;const input=document.createElement('input');input.type='number';input.min='0';input.step='0.01';input.placeholder='Sin capturar';input.value=String((key==='estimado'?detail.costos?.estimado:detail.costos?.reales?.[key])??'');fields[key]=input;label.appendChild(input);costs.appendChild(label);}form.appendChild(costs);
    const profit=document.createElement('p');profit.setAttribute('role','status');costs.appendChild(profit);
    const reworks:any[]=[...(detail.reposiciones||[])];
    const reworkBox=document.createElement('fieldset');reworkBox.className='pos-order-subsection';reworkBox.innerHTML='<legend>Reposiciones y retrabajos</legend><p>Registra motivo y costo adicional en este pedido. No crea otra venta ni modifica existencias.</p>';
    const reworkList=document.createElement('div');reworkList.className='pos-rework-list';reworkBox.appendChild(reworkList);
    const reworkReason=document.createElement('input');reworkReason.placeholder='Motivo de la reposición';reworkReason.maxLength=300;reworkReason.setAttribute('aria-label','Motivo de la reposición');
    const reworkCost=document.createElement('input');reworkCost.type='number';reworkCost.min='0';reworkCost.step='0.01';reworkCost.placeholder='Costo adicional';reworkCost.setAttribute('aria-label','Costo de la reposición');
    const addRework=document.createElement('button');addRework.type='button';addRework.textContent='Agregar reposición';reworkBox.append(reworkReason,reworkCost,addRework);form.appendChild(reworkBox);
    const renderReworks=()=>{reworkList.replaceChildren();for(const r of reworks){const row=document.createElement('p');row.textContent=`${new Date(r.fecha).toLocaleDateString('es-MX')} · ${r.motivo} · ${fmtMoney(r.costo)}`;reworkList.appendChild(row);}};
    renderReworks();
    const collect=()=>({estimado:fields.estimado.value===''?null:Number(fields.estimado.value),reales:['materiales','empaque','comisiones','envio','merma'].every(k=>fields[k].value==='')?null:Object.fromEntries(['materiales','empaque','comisiones','envio','merma'].map(k=>[k,fields[k].value===''?null:Number(fields[k].value)]))});
    const preview=()=>{try{const values=collect();if(values.reales&&Object.values(values.reales).some(v=>v===null)){profit.textContent='Completa todos los costos reales; usa 0 donde no hubo costo.';return;}const result=posRentabilidad({...p,posDetalle:{...detail,reposiciones:reworks}},values);profit.textContent=result.real==null?'Costos reales sin capturar':`Costo real ${fmtMoney(result.real)} · Ganancia ${fmtMoney(result.ganancia)} · Margen ${result.margen??0}%${result.margen!=null&&result.margen<20?' · Revisar: margen menor al 20%':''}${result.diferencia!=null?' · Diferencia vs estimado '+fmtMoney(result.diferencia):''}`;}catch(e:any){profit.textContent=e.message;}};costs.oninput=preview;preview();
    addRework.onclick=()=>{const motivo=reworkReason.value.trim(),costo=Number(reworkCost.value);if(!motivo){reworkReason.setCustomValidity('Escribe el motivo.');reworkReason.reportValidity();return;}reworkReason.setCustomValidity('');if(reworkCost.value===''||!Number.isFinite(costo)||costo<0){reworkCost.setCustomValidity('Escribe un costo válido, incluido 0.');reworkCost.reportValidity();return;}reworkCost.setCustomValidity('');reworks.push({id:mkId(),fecha:new Date().toISOString(),motivo,costo});reworkReason.value='';reworkCost.value='';renderReworks();preview();};
    const history=document.createElement('details');history.innerHTML='<summary>Historial y pagos</summary>';for(const event of [...(p.historialEstados||[]),...(p.pagos||[]),...(detail.historial||[])]){const item=document.createElement('p');item.textContent=`${event.fecha||''} ${event.hora||''} · ${event.estado||event.accion||event.tipo||'Pago'}${event.monto!=null?' · '+fmtMoney(event.monto):''}${event.metodo?' · '+event.metodo:''}`;history.appendChild(item);}form.appendChild(history);
    const status=document.createElement('p');status.setAttribute('role','status');const button=document.createElement('button');button.type='submit';button.className='btn-primary';button.textContent='Guardar ficha';form.append(status,button);dialog.appendChild(form);
    form.onsubmit=async e=>{e.preventDefault();button.disabled=true;try{if(JSON.stringify(orders.find(x=>x===p))!==before)throw Error('El pedido cambió. Vuelve a abrir su ficha.');const costValues=collect();if(costValues.reales&&Object.values(costValues.reales).some(v=>v===null))throw Error('Completa cada costo real; escribe 0 cuando no aplique.');posRentabilidad({...p,posDetalle:{...detail,reposiciones:reworks}},costValues);
      await posRunOperation(async()=>{p.posDetalle={...detail,costos:costValues,reposiciones:reworks,versionesDiseno:versions,historial:[...(detail.historial||[]),{fecha:new Date().toISOString(),accion:'Ficha actualizada'}]};if((window.pedidos||[]).includes(p))await savePedidos();else await savePedidosFinalizados();},'Actualizar ficha y costos del pedido');
      status.textContent='Ficha guardada.';form.querySelectorAll('input,button').forEach(el=>el.disabled=true);if(typeof renderPedidosTable==='function')renderPedidosTable();
    }catch(err:any){status.textContent=err.message||'No se pudo guardar.';button.disabled=!!err.pendingSync;}};
}
window.posAbrirFicha=posAbrirFicha;
async function posAbrirSalud(){
 const dialog=posDialog('Salud del POS');const status=document.createElement('p');status.textContent='Comprobando conexión…';dialog.appendChild(status);
 const list=document.createElement('dl');list.className='pos-health-list';dialog.appendChild(list);
 const row=(label:string,value:string,kind='ok')=>{const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;dd.dataset.state=kind;list.append(dt,dd);};
 row('Navegador',navigator.onLine?'En línea':'Sin conexión',navigator.onLine?'ok':'warn');const sync=typeof posSyncStatus==='function'?posSyncStatus():null;row('Sincronización',sync?.text||'No disponible',sync?.state==='saved'?'ok':sync?.state==='conflict'?'error':'warn');
 try{const {error}=await db.from('store').select('key').limit(1);if(error)throw error;row('Base de datos','Disponible','ok');status.textContent='Comprobación terminada';}catch(e:any){row('Base de datos','No se pudo comprobar · '+(e.message||'error'),'error');status.textContent='Comprobación con advertencias';}
 try{const {data,error}=await db.from('store').select('value').eq('key','pos_backup_status').maybeSingle();if(error)throw error;if(!data?.value)throw Error('Sin respaldo verificado registrado');const backup=JSON.parse(data.value);if(!backup.verifiedAt||!Number.isFinite(Number(backup.images)))throw Error('Estado de respaldo inválido');const date=new Date(backup.verifiedAt);const hours=(Date.now()-date.getTime())/3600000;if(!Number.isFinite(hours)||hours<0)throw Error('Fecha de respaldo inválida');row('Respaldo remoto',`${date.toLocaleString('es-MX')} · ${backup.tables} tablas · ${backup.images} imágenes`,hours>48?'warn':'ok');}catch(e:any){row('Respaldo remoto',e.message||'Sin estado disponible','warn');}
}
window.posAbrirSalud=posAbrirSalud;
async function posAjustarInventario(id:string,field:string,value:number,reason:string){
    if(!reason.trim())throw Error('Escribe el motivo del cambio.');
    if(!['stock','price'].includes(field)||!Number.isFinite(value)||value<0)throw Error('Importe o cantidad invalida.');
    if(field==='stock'&&!Number.isInteger(value))throw Error('El stock requiere unidades enteras.');
    const product=(window.products||[]).find(p=>String(p.id)===String(id));if(!product)throw Error('Producto no encontrado.');
    if(field==='stock'&&((product.variants||[]).length||(product.mpComponentes||[]).length))throw Error('Edita las variantes o los materiales desde la ficha del producto.');
    const before=Number(product[field])||0;if(before===value)return;
    await posRunOperation(async()=>{
        product[field]=field==='price'?mkRound2(value):value;
        if(field==='stock')await registrarMovimiento({productoId:product.id,productoNombre:product.name,tipo:'ajuste',cantidad:value-before,cantidadSolicitada:value-before,motivo:reason,stockAntes:before,stockDespues:value});
        else{product.historialPrecios=product.historialPrecios||[];product.historialPrecios.push({precio:before,fecha:_fechaHoy()});}
        await saveProducts();
    },reason);
}
function posEditarInventario(id:any,field='stock'){
    const product=(window.products||[]).find(p=>String(p.id)===String(id));if(!product)return;
    const dialog=posDialog(field==='stock'?'Ajustar existencias':'Editar precio');
    const name=document.createElement('p');name.textContent=product.name;dialog.appendChild(name);
    const form=document.createElement('form');form.innerHTML=`<label>${field==='stock'?'Nueva existencia':'Nuevo precio'}<input name="value" type="number" min="0" step="${field==='stock'?'1':'0.01'}" required></label><label>Motivo<input name="reason" maxlength="500" required placeholder="Ej. conteo físico o cambio de precio"></label><p role="status" aria-live="polite"></p><button type="submit">Guardar cambio</button>`;
    (form.elements.namedItem('value') as HTMLInputElement).value=String(Number(product[field])||0);dialog.appendChild(form);
    const before=JSON.stringify(product);
    form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button')!;button.disabled=true;const status=form.querySelector('[role=status]')!;status.textContent='Guardando…';
      try{if(JSON.stringify((window.products||[]).find(p=>String(p.id)===String(id)))!==before)throw Error('El producto cambió. Cierra y vuelve a abrir para revisar sus datos.');
        await posAjustarInventario(String(id),field,Number((form.elements.namedItem('value') as HTMLInputElement).value),(form.elements.namedItem('reason') as HTMLInputElement).value.trim());
        status.textContent='Cambio guardado en la base de datos.';button.textContent='Guardado';form.querySelectorAll('input').forEach(el=>el.disabled=true);renderInventoryTable();updateDashboard();
      }catch(err:any){status.textContent=err.message||'No se pudo guardar.';button.disabled=!!err.pendingSync;}
    };
}
function posMetodo(value:any):string {
    const s=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(s.includes('efectivo'))return 'efectivo';
    if(s.includes('transfer')||s.includes('spei'))return 'transferencia';
    if(s.includes('tarjeta')||s.includes('debito')||s.includes('credito'))return 'tarjeta';
    return 'sin_clasificar';
}
function posResumenCaja(date:string,sales:any[],income:any[],expense:any[],opening=0):any {
    const result:any={totalCobrado:0,movimientos:[]};
    for(const method of ['efectivo','transferencia','tarjeta','sin_clasificar'])result[method]={entradas:0,salidas:0,esperado:0};
    const receipts=new Map<string,any>();
    for(const s of sales||[])if(posFechaLocal(s.date)===date && s.method!=='Cancelado' && s.type!=='pedido')receipts.set(String(s.id),{...s,amount:s.total,source:'venta'});
    for(const i of income||[])if(posFechaLocal(i.date)===date && !receipts.has(String(i.id)))receipts.set(String(i.id),{...i,source:'ingreso'});
    const add=(row:any,out=false)=>{const method=posMetodo(row.method||row.metodo);const cents=posCentavos(row.amount);result[method][out?'salidas':'entradas']+=cents;result.movimientos.push({id:String(row.id),origen:out?'gasto':row.source,metodo:method,importe:cents/100});};
    receipts.forEach(r=>add(r));
    for(const e of expense||[])if(posFechaLocal(e.date)===date)add(e,true);
    for(const method of ['efectivo','transferencia','tarjeta','sin_clasificar']){const r=result[method];result.totalCobrado+=r.entradas;r.esperado=(r.entradas-r.salidas+(method==='efectivo'?posCentavos(opening):0))/100;r.entradas/=100;r.salidas/=100;}
    result.totalCobrado/=100;return result;
}
function posDialog(title:string,modal=true):HTMLDialogElement {
    const trigger=document.activeElement as HTMLElement;
    const dialog=document.createElement('dialog');dialog.className='pos-sync-dialog pos-operation-dialog';dialog.setAttribute('aria-label',title);
    const header=document.createElement('div');header.className='pos-dialog-header';
    const h=document.createElement('h2');h.textContent=title;header.appendChild(h);
    const close=document.createElement('button');close.textContent='Cerrar';close.type='button';close.className='pos-dialog-close';close.onclick=()=>dialog.close();header.appendChild(close);dialog.appendChild(header);
    dialog.addEventListener('close',()=>{dialog.remove();if(trigger?.isConnected)trigger.focus();},{once:true});document.body.appendChild(dialog);if(modal)dialog.showModal();else dialog.show();return dialog;
}
async function posCargarCaja(date:string,opening:number){
    const {data,error}=await db.rpc('pos_cash_movements',{p_date:date,p_zone:Intl.DateTimeFormat().resolvedOptions().timeZone});
    if(error)throw error;if(!data)throw Error('La base de datos no devolvió los movimientos.');
    return posResumenCaja(date,data.sales_history,data.incomes,data.expenses,opening);
}
async function abrirHistorialCambios(){
    const dialog=posDialog('Historial de cambios');const status=document.createElement('p');status.textContent='Consultando últimos cambios…';dialog.appendChild(status);
    try{
        const {data,error}=await db.rpc('pos_list_changes',{p_limit:100});if(error)throw error;
        status.textContent=data?.length?'Últimos 100 cambios como máximo. El historial comienza al activar esta función.':'Todavía no hay cambios registrados.';
        for(const row of data||[]){
            const detail=document.createElement('details');const title=document.createElement('summary');
            title.textContent=`${new Date(row.occurred_at).toLocaleString('es-MX')} · ${row.actor_label||'Usuario'} · ${row.reason} · ${row.new_data?.folio||row.new_data?.name||row.old_data?.name||row.record_id}`;detail.appendChild(title);
            const text=document.createElement('pre');const names={INSERT:'Registro creado',UPDATE:'Registro actualizado',DELETE:'Registro eliminado'};
            const keys=[...new Set([...Object.keys(row.old_data||{}),...Object.keys(row.new_data||{})])].filter(k=>k!=='updated_at'&&!_sameStoredValue(row.old_data?.[k],row.new_data?.[k]));
            text.textContent=names[row.action]+'\n'+keys.map(k=>`${k.replace(/_/g,' ')}: ${JSON.stringify(row.old_data?.[k]??null)} → ${JSON.stringify(row.new_data?.[k]??null)}`).join('\n');detail.appendChild(text);dialog.appendChild(detail);
        }
    }catch(e:any){status.textContent='No se pudo consultar el historial. '+(e.message||'Intenta de nuevo.');}
}
async function abrirCorteCaja(){
    const dialog=posDialog('Corte y conciliación de caja');
    const form=document.createElement('form');form.innerHTML=`<p>Cuenta el dinero y compara con los cobros registrados. Las ventas pendientes de pago no entran en caja.</p>
    <label>Fecha<input name="date" type="date" required value="${_fechaHoy()}"></label>
    <label>Fondo inicial en efectivo<input name="opening" type="number" min="0" step="0.01" value="0" required></label>
    <button type="button" name="refresh">Actualizar movimientos</button><div class="pos-cash-summary"></div><label>Motivo de diferencias / observaciones<textarea name="notes" maxlength="2000"></textarea></label>
    <p role="status" aria-live="polite"></p><button type="submit" class="pos-primary">Guardar corte</button>`;dialog.appendChild(form);
    const methods={efectivo:'Efectivo',transferencia:'Transferencias',tarjeta:'Tarjeta',sin_clasificar:'Sin clasificar'};
    let snapshot:any;const date=form.elements.namedItem('date') as HTMLInputElement;const opening=form.elements.namedItem('opening') as HTMLInputElement;
    const summary=form.querySelector('.pos-cash-summary')!;const status=form.querySelector('[role=status]')!;
    let request=0;
    const render=async()=>{const currentRequest=++request;const submit=form.querySelector('[type=submit]') as HTMLButtonElement;submit.disabled=true;status.textContent='Consultando movimientos completos…';
      try{const next=await posCargarCaja(date.value,Number(opening.value));if(currentRequest!==request)return;
      const counts=Object.fromEntries(Object.keys(methods).map(m=>[m,(form.elements.namedItem(m) as HTMLInputElement)?.value||'']));snapshot=next;summary.replaceChildren();
        for(const [method,label] of Object.entries(methods)){const row=document.createElement('label');row.className='pos-cash-row';const span=document.createElement('span');span.textContent=`${label}: esperado ${fmtMoney(snapshot[method].esperado)} · entradas ${fmtMoney(snapshot[method].entradas)} · salidas ${fmtMoney(snapshot[method].salidas)}`;const input=document.createElement('input');input.type='number';input.step='0.01';input.min='0';input.required=true;input.name=method;input.value=counts[method];input.placeholder='Importe contado / comprobado';const delta=document.createElement('span');delta.className='pos-cash-delta';input.oninput=()=>{delta.textContent=input.value===''?'':`Diferencia: ${fmtMoney(mkRound2(Number(input.value)-snapshot[method].esperado))}`;};row.append(span,input,delta);summary.appendChild(row);}
      status.textContent=`${snapshot.movimientos.length} movimientos consultados.`;submit.disabled=false;
      }catch(e:any){if(currentRequest===request){snapshot=null;status.textContent=e.message||'No se pudo consultar la caja.';}}
    };
    date.onchange=render;opening.oninput=render;(form.elements.namedItem('refresh') as HTMLButtonElement).onclick=render;render();
    const id=mkId();
    form.onsubmit=async event=>{event.preventDefault();const submit=form.querySelector('[type=submit]') as HTMLButtonElement;if(submit.disabled)return;submit.disabled=true;
        try{
            if(window._pendingSync || _posOperation)throw Error('Sincroniza los cambios pendientes antes de guardar el corte.');
            const current=await posCargarCaja(date.value,Number(opening.value));
            if(JSON.stringify(current)!==JSON.stringify(snapshot)){render();throw Error('Los movimientos cambiaron. Revisa y vuelve a contar.');}
            const counted=Object.fromEntries(Object.keys(methods).map(m=>[m,mkRound2((form.elements.namedItem(m) as HTMLInputElement).value)]));
            const differences=Object.fromEntries(Object.keys(methods).map(m=>[m,mkRound2(counted[m]-snapshot[m].esperado)]));
            const notes=(form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim();
            if((Object.values(differences).some(n=>n!==0)||snapshot.sin_clasificar.entradas||snapshot.sin_clasificar.salidas)&&!notes)throw Error('Explica las diferencias o los movimientos sin clasificar antes de guardar.');
            const existing=await sbLoad('cashClosures',[]);const {data}=await db.auth.getSession();
            const entry={id,date:date.value,createdAt:new Date().toISOString(),actor:data?.session?.user?.id,opening:Number(opening.value),snapshot,counted,differences,notes};
            await sbSave('cashClosures',[...existing.filter(r=>r.id!==id),entry]);status.textContent='Corte guardado. Los movimientos posteriores requieren un nuevo corte.';
            (form.elements.namedItem('refresh') as HTMLButtonElement).disabled=true;
            form.querySelectorAll('input,textarea').forEach(el=>{(el as HTMLInputElement).disabled=true;});submit.textContent='Corte guardado';
        }catch(e:any){status.textContent=e.message||'No se pudo guardar el corte.';submit.disabled=false;}
    };
    const history=document.createElement('details');const label=document.createElement('summary');label.textContent='Cortes anteriores';history.appendChild(label);dialog.appendChild(history);
    try{const rows=await sbLoad('cashClosures',[]);for(const row of rows.slice(-20).reverse()){const p=document.createElement('p');p.textContent=`${row.date} · efectivo esperado ${fmtMoney(row.snapshot?.efectivo?.esperado)} · contado ${fmtMoney(row.counted?.efectivo)} · diferencia ${fmtMoney(row.differences?.efectivo)} · ${row.notes||'Sin diferencias'}`;history.appendChild(p);}}catch{history.append('No se pudo cargar el historial.');}
}

function posLimpiarFiltrosInventario(){
 for(const id of ['inventorySearch','inventoryTipoFilter','inventoryTagFilter','inventoryProveedorFilter']){const el=document.getElementById(id);if(el)el.value='';}
 renderInventoryTable();
}
