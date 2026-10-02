function posColorMuestra(color:string){const palette={negro:'#191919',blanco:'#ffffff',rojo:'#cb3540',azul:'#3172bc',verde:'#32855d',amarillo:'#e8b52f',rosa:'#e17da1',morado:'#8654b6',gris:'#969a9e',crema:'#eee1c8'};const key=String(color||'').toLowerCase().trim(),value=palette[key]||(/^#[0-9a-f]{6}$/i.test(key)?key:null);return value?`<span class="pedido-color-swatch" style="background:${value}" aria-hidden="true"></span>`:'';}
(window as any).posColorMuestra=posColorMuestra;
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
    const incompleto=costos.reales!=null&&['materiales','empaque','comisiones','envio','merma'].some(k=>costos.reales[k]==null);
    return {incompleto,estimado:estimado==null?null:estimado/100,real:real==null?null:real/100,ganancia:real==null||incompleto?null:(total-real)/100,margen:real==null||incompleto||!total?null:Math.round((total-real)/total*10000)/100,diferencia:estimado==null||real==null||incompleto?null:(real-estimado)/100};
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
    table.innerHTML=`<caption>Modifica piezas terminadas. Los pedidos en producción ya fueron descontados. La capacidad de fabricación comparte materiales entre combinaciones y no se suma.</caption><thead><tr><th>Talla</th>${matrix.colors.map(c=>`<th>${posColorMuestra(c)}${_esc(c)}</th>`).join('')}</tr></thead>`;
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
    const tableVisible=!document.getElementById('vistaTabla')?.classList.contains('hidden');
    const visibleIds=Array.from(document.querySelectorAll(tableVisible?'#pedidosTable [data-table-open]':'#vistaKanban [data-kanban-open]')).map(el=>tableVisible?el.dataset.tableOpen:el.dataset.kanbanOpen);
    const orders=id&&visibleIds.includes(String(id))?visibleIds.map(key=>allOrders.find(p=>String(p.id)===key)).filter(Boolean):allOrders;
    const p=orders.find(p=>String(p.id)===String(id))||orders[0];const dialog=posDialog('Ficha del pedido',false);dialog.classList.add('pos-wide-dialog','pos-order-drawer');
    if(!p){dialog.append('Todavía no hay pedidos.');return;}
    window.posTablaSelectedId=String(p.id);
    const scroll=document.querySelector('.pos-order-table-scroll') as HTMLElement,top=scroll?.scrollTop,left=scroll?.scrollLeft,pageY=window.scrollY;
    document.querySelectorAll('#pedidosTable [data-table-open]').forEach((row:any)=>row.classList.toggle('pos-order-selected',row.dataset.tableOpen===String(p.id)));
    dialog.addEventListener('close',()=>{if(scroll){scroll.scrollTop=top;scroll.scrollLeft=left;}window.scrollTo({top:pageY,behavior:'instant'});},{once:true});

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
    const preview=()=>{try{const values=collect();const result=posRentabilidad({...p,posDetalle:{...detail,reposiciones:reworks}},values);profit.textContent=result.real==null?'Costos reales sin capturar':result.incompleto?`Costo incompleto · Capturado ${fmtMoney(result.real)}. Puedes guardar y completar después.`:`Costo real ${fmtMoney(result.real)} · Ganancia ${fmtMoney(result.ganancia)} · Margen ${result.margen??0}%${result.margen!=null&&result.margen<20?' · Revisar: margen menor al 20%':''}${result.diferencia!=null?' · Diferencia vs estimado '+fmtMoney(result.diferencia):''}`;}catch(e:any){profit.textContent=e.message;}};costs.oninput=preview;preview();
    addRework.onclick=()=>{const motivo=reworkReason.value.trim(),costo=Number(reworkCost.value);if(!motivo){reworkReason.setCustomValidity('Escribe el motivo.');reworkReason.reportValidity();return;}reworkReason.setCustomValidity('');if(reworkCost.value===''||!Number.isFinite(costo)||costo<0){reworkCost.setCustomValidity('Escribe un costo válido, incluido 0.');reworkCost.reportValidity();return;}reworkCost.setCustomValidity('');reworks.push({id:mkId(),fecha:new Date().toISOString(),motivo,costo});reworkReason.value='';reworkCost.value='';renderReworks();preview();};
    const history=document.createElement('details');history.innerHTML='<summary>Historial y pagos</summary>';for(const event of [...(p.historialEstados||[]),...(p.pagos||[]),...(detail.historial||[])]){const item=document.createElement('p');item.textContent=`${event.fecha||''} ${event.hora||''} · ${event.estado||event.accion||event.tipo||'Pago'}${event.monto!=null?' · '+fmtMoney(event.monto):''}${event.metodo?' · '+event.metodo:''}`;history.appendChild(item);}form.appendChild(history);
    const status=document.createElement('p');status.setAttribute('role','status');const button=document.createElement('button');button.type='submit';button.className='btn-primary';button.textContent='Guardar ficha';form.append(status,button);dialog.appendChild(form);
    form.onsubmit=async e=>{e.preventDefault();button.disabled=true;try{if(JSON.stringify(orders.find(x=>x===p))!==before)throw Error('El pedido cambió. Vuelve a abrir su ficha.');const costValues=collect();posRentabilidad({...p,posDetalle:{...detail,reposiciones:reworks}},costValues);
      await posRunOperation(async()=>{p.posDetalle={...detail,costos:costValues,reposiciones:reworks,versionesDiseno:versions,historial:[...(detail.historial||[]),{fecha:new Date().toISOString(),accion:'Ficha actualizada'}]};if((window.pedidos||[]).includes(p))await savePedidos();else await savePedidosFinalizados();},'Actualizar ficha y costos del pedido');
      status.textContent='Ficha guardada.';form.querySelectorAll('input,button').forEach(el=>el.disabled=true);if(typeof renderPedidosTable==='function')renderPedidosTable();
    }catch(err:any){status.textContent=err.message||'No se pudo guardar.';button.disabled=!!err.pendingSync;}};
}
window.posAbrirFicha=posAbrirFicha;
async function posAbrirSalud(){
 const dialog=posDialog('Salud del POS');const status=document.createElement('p');status.textContent='Comprobando conexión…';dialog.appendChild(status);
 const consistency=document.createElement('button');consistency.className='mk-btn-secondary';consistency.textContent='Revisar consistencia';consistency.onclick=()=>{dialog.close();posAbrirConsistencia();};dialog.appendChild(consistency);
 const list=document.createElement('dl');list.className='pos-health-list';dialog.appendChild(list);
 const row=(label:string,value:string,kind='ok')=>{const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;dd.dataset.state=kind;list.append(dt,dd);};
 row('Navegador',navigator.onLine?'En línea':'Sin conexión',navigator.onLine?'ok':'warn');const sync=typeof posSyncStatus==='function'?posSyncStatus():null;row('Sincronización',sync?.text||'No disponible',sync?.state==='saved'?'ok':sync?.state==='conflict'?'error':'warn');
 try{const {error}=await db.from('store').select('key').limit(1);if(error)throw error;row('Base de datos','Disponible','ok');status.textContent='Comprobación terminada';}catch(e:any){row('Base de datos','No se pudo comprobar · '+(e.message||'error'),'error');status.textContent='Comprobación con advertencias';}
 try{const {data,error}=await db.from('store').select('value').eq('key','pos_backup_status').maybeSingle();if(error)throw error;if(!data?.value)throw Error('Sin respaldo verificado registrado');const backup=JSON.parse(data.value);if(!backup.verifiedAt||!Number.isFinite(Number(backup.images)))throw Error('Estado de respaldo inválido');const date=new Date(backup.verifiedAt);const hours=(Date.now()-date.getTime())/3600000;if(!Number.isFinite(hours)||hours<0)throw Error('Fecha de respaldo inválida');row('Respaldo remoto',`${date.toLocaleString('es-MX')} · ${backup.tables} tablas · ${backup.images} imágenes`,hours>48?'warn':'ok');}catch(e:any){row('Respaldo remoto',e.message||'Sin estado disponible','warn');}
}
window.posAbrirSalud=posAbrirSalud;
async function posAjustarInventario(id:string,field:string,value:number,reason:string){
    reason=reason.trim()||(field==='price'?'Actualización de precio':'');
    if(!reason)throw Error('Escribe el motivo del cambio.');
    if(!['stock','price'].includes(field)||!Number.isFinite(value)||value<0)throw Error('Importe o cantidad invalida.');
    if(field==='stock'&&!Number.isInteger(value))throw Error('El stock requiere unidades enteras.');
    const product=(window.products||[]).find(p=>String(p.id)===String(id));if(!product)throw Error('Producto no encontrado.');
    if(field==='stock'&&((product.variants||[]).length||(product.mpComponentes||[]).length))throw Error('Edita las variantes o los materiales desde la ficha del producto.');
    const before=Number(product[field])||0;if(before===value)return;
    await posRunOperation(async()=>{
        product[field]=field==='price'?mkRound2(value):value;
        if(field==='stock')await registrarMovimiento({productoId:product.id,productoNombre:product.name,tipo:'ajuste',cantidad:value-before,cantidadSolicitada:value-before,motivo:reason,stockAntes:before,stockDespues:value});
        else{product.historialPrecios=product.historialPrecios||[];product.historialPrecios.push({precio:before,fecha:_fechaHoy(),motivo:reason});}
        await saveProducts();
    },reason);
}
function posEditarInventario(id:any,field='stock'){
    const product=(window.products||[]).find(p=>String(p.id)===String(id));if(!product)return;
    posGuardarLugarInventario(String(id));
    const dialog=posDialog(field==='stock'?'Ajustar existencias':'Editar precio');
    dialog.addEventListener('close',posRestaurarLugarInventario,{once:true});
    const name=document.createElement('p');name.textContent=product.name;dialog.appendChild(name);
    const form=document.createElement('form');form.innerHTML=`<label>${field==='stock'?'Nueva existencia':'Nuevo precio'}<input name="value" type="number" min="0" step="${field==='stock'?'1':'0.01'}" required></label><label>${field==='stock'?'Motivo':'Nota (opcional)'}<input name="reason" maxlength="500" ${field==='stock'?'required':''} placeholder="${field==='stock'?'Ej. conteo físico':'Actualización de precio'}"></label><p role="status" aria-live="polite"></p><button type="submit">Guardar cambio</button>`;
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
    dialog.addEventListener('close',()=>{dialog.remove();window._flushRTDeferred?.();if(trigger?.isConnected)trigger.focus();},{once:true});document.body.appendChild(dialog);if(modal)dialog.showModal();else dialog.show();return dialog;
}
async function posCargarCaja(date:string,opening:number){
    const {data,error}=await db.rpc('pos_cash_movements',{p_date:date,p_zone:Intl.DateTimeFormat().resolvedOptions().timeZone});
    if(error)throw error;if(!data)throw Error('La base de datos no devolvió los movimientos.');
    return posResumenCaja(date,data.sales_history,data.incomes,data.expenses,opening);
}
function posTextoCambio(row:any):string {
 const labels:Record<string,string>={stock:'Existencias',stock_min:'Stock mínimo',price:'Precio',cost:'Costo',total:'Total',amount:'Importe',anticipo:'Anticipo',name:'Nombre',cliente:'Cliente',status:'Estado',entrega:'Entrega',fecha:'Fecha',concepto:'Descripción',notas:'Notas',category:'Categoría',sku:'SKU',variants:'Variantes',proveedor:'Proveedor'};
 const money=['price','cost','total','amount','anticipo'];
 const value=(key:string,v:any):string=>v==null?'—':money.includes(key)?fmtMoney(Number(v)):typeof v==='boolean'?(v?'Sí':'No'):Array.isArray(v)?v.map(x=>typeof x==='object'?`${x.value||x.name||x.nombre||x.id||''}${x.qty!=null?' ('+x.qty+' piezas)':''}`:String(x)).join(', '):typeof v==='object'?JSON.stringify(v):String(v);
 const keys=[...new Set([...Object.keys(row.old_data||{}),...Object.keys(row.new_data||{})])].filter(k=>!['updated_at','created_at','device_id'].includes(k)&&!_sameStoredValue(row.old_data?.[k],row.new_data?.[k]));
 return ({INSERT:'Registro creado',UPDATE:'Registro actualizado',DELETE:'Registro eliminado'}[row.action]||'Cambio')+'\n'+keys.map(k=>`${labels[k]||k.replace(/_/g,' ')}: ${value(k,row.old_data?.[k])} → ${value(k,row.new_data?.[k])}`).join('\n');
}
window.posTextoCambio=posTextoCambio;
async function abrirHistorialCambios(){
    const dialog=posDialog('Historial de cambios');const status=document.createElement('p');status.textContent='Consultando últimos cambios…';dialog.appendChild(status);
    try{
        const {data,error}=await db.rpc('pos_list_changes',{p_limit:100});if(error)throw error;
        status.textContent=data?.length?'Últimos 100 cambios como máximo. El historial comienza al activar esta función.':'Todavía no hay cambios registrados.';
        for(const row of data||[]){
            const detail=document.createElement('details');const title=document.createElement('summary');
            title.textContent=`${new Date(row.occurred_at).toLocaleString('es-MX')} · ${row.actor_label||'Usuario'} · ${row.reason} · ${row.new_data?.folio||row.new_data?.name||row.old_data?.name||row.record_id}`;detail.appendChild(title);
            const text=document.createElement('pre');text.textContent=posTextoCambio(row);detail.appendChild(text);dialog.appendChild(detail);
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

// ponytail: una errata por palabra de 4+ letras; numeros y tallas requieren coincidencia exacta.
function posBusquedaCoincide(query:any,target:any):boolean {
 const normal=(v:any)=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=normal(query).trim(),text=normal(target);if(!q)return true;if(text.includes(q))return true;
 const words=text.split(/[^a-z0-9]+/).filter(Boolean);
 const oneEdit=(a:string,b:string)=>{
   if(Math.abs(a.length-b.length)>1)return false;
   let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;
   if(i===Math.min(a.length,b.length))return true;
   if(a.length===b.length)return a.slice(i+1)===b.slice(i+1)||(a[i]===b[i+1]&&a[i+1]===b[i]&&a.slice(i+2)===b.slice(i+2));
   return a.length>b.length?a.slice(i+1)===b.slice(i):a.slice(i)===b.slice(i+1);
 };
 return q.split(/[^a-z0-9]+/).filter(Boolean).every(token=>words.some(word=>word.includes(token)||(token.length>=4&&!/\d/.test(token)&&oneEdit(token,word))));
}
window.posBusquedaCoincide=posBusquedaCoincide;

function posFiltrarPedidosRapidos(orders:any[],filter:string,hoy:string):any[] {
 return orders.filter(p=>['confirmado','pago','produccion','envio','salida','retirar'].includes(p.status||'confirmado')&&(
   filter==='hoy'?p.entrega===hoy:filter==='vencido'?!!p.entrega&&p.entrega<hoy:filter==='saldo'?calcSaldoPendiente(p)>0:
   filter==='pronto'?!!p.entrega&&p.entrega>=hoy&&p.entrega<=_posFechaMasDos(hoy):true));
}
function _posFechaMasDos(hoy:string):string { const d=new Date(hoy+'T12:00:00');d.setDate(d.getDate()+2);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
window.posFiltrarPedidosRapidos=posFiltrarPedidosRapidos;
async function posGuardarPedidoRapido(id:string,values:any,before?:string) {
 const p=(window.pedidos||[]).find(p=>String(p.id)===String(id));if(!p)throw Error('Pedido no encontrado.');
 if(before!=null&&JSON.stringify(p)!==before)throw Error('El pedido cambió. Vuelve a abrir la edición rápida.');
 const fecha=new Date(values.entrega+'T12:00:00');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(values.entrega)||!Number.isFinite(fecha.getTime())||fecha.getDate()!==Number(values.entrega.slice(-2))||(p.fecha&&values.entrega<p.fecha))throw Error('Revisa la fecha de entrega.');
 if(!['normal','alta','baja'].includes(values.prioridad))throw Error('Prioridad inválida.');
 await posRunOperation(async()=>{p.entrega=values.entrega;p.prioridad=values.prioridad;p.notas=String(values.notas||'').trim().slice(0,2000);await savePedidos();},'Edición rápida de pedido');
}
window.posGuardarPedidoRapido=posGuardarPedidoRapido;
function posEditarPedidoRapido(id:string) {
 const p=(window.pedidos||[]).find(p=>String(p.id)===String(id));if(!p)return;
 const before=JSON.stringify(p),dialog=posDialog(`Edición rápida · ${p.folio||'Pedido'}`),form=document.createElement('form');
 form.innerHTML='<label>Fecha de entrega<input name="entrega" type="date" required></label><label>Prioridad<select name="prioridad"><option value="normal">Normal</option><option value="alta">Alta</option><option value="baja">Baja</option></select></label><label>Nota del pedido<textarea name="notas" rows="3" maxlength="2000" placeholder="Ej. Nombre en dorado"></textarea></label><p role="status"></p><button type="submit" class="mk-btn-primary">Guardar cambios</button>';
 const field=(name:string)=>form.elements.namedItem(name) as HTMLInputElement;
 field('entrega').value=p.entrega||'';field('entrega').min=p.fecha||'';field('prioridad').value=p.prioridad||'normal';field('notas').value=p.notas||'';dialog.appendChild(form);
 form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button')!;button.disabled=true;try{
 await posGuardarPedidoRapido(id,{entrega:field('entrega').value,prioridad:field('prioridad').value,notas:field('notas').value},before);
 dialog.close();renderPedidosTable();if(typeof updateDashboard==='function')updateDashboard();
 }catch(err:any){form.querySelector('[role=status]')!.textContent=err.message||'No se pudo guardar.';button.disabled=!!err.pendingSync;}};
}
window.posEditarPedidoRapido=posEditarPedidoRapido;

const _posCapturaClaves:Record<string,string>={ptCategory:'categoriaProducto',pvCategory:'categoriaProducto',ptProveedorNombre:'proveedor',mpProveedor:'proveedor',transactionMethod:'metodoBalance',transactionCategoria:'categoriaEgreso'};
function posRecordarCaptura(ids:string[]) { for(const id of ids){const el=document.getElementById(id) as HTMLInputElement|null;const key=_posCapturaClaves[id];if(el&&key)try{localStorage.setItem('pos_captura_'+key,el.value.trim());}catch{}} }
function posRestaurarCaptura(ids:string[]) { for(const id of ids){const el=document.getElementById(id) as HTMLSelectElement|null;const key=_posCapturaClaves[id];if(!el||!key)continue;try{const value=localStorage.getItem('pos_captura_'+key);if(value!=null&&(!el.options||Array.from(el.options).some(o=>o.value===value)))el.value=value;}catch{}} }
window.posRecordarCaptura=posRecordarCaptura;window.posRestaurarCaptura=posRestaurarCaptura;
let _posLugarInventario:any=null;
function _posFilaInventario(id:string):HTMLElement|null {
 const section=document.getElementById('inventory-section');
 const node=(Array.from(section?.querySelectorAll('[data-id]')||[]) as HTMLElement[]).find(el=>el.dataset.id===String(id));
 return (node?.closest('tr,article') as HTMLElement)||node||null;
}
function posGuardarLugarInventario(id:string) { const row=_posFilaInventario(id);_posLugarInventario={id,y:window.scrollY,top:row?.getBoundingClientRect().top}; }
function posRestaurarLugarInventario() {
 if(!_posLugarInventario)return;const place=_posLugarInventario;_posLugarInventario=null;
 requestAnimationFrame(()=>{const row=_posFilaInventario(place.id);window.scrollTo({top:row&&place.top!=null?window.scrollY+row.getBoundingClientRect().top-place.top:place.y,behavior:'instant'});
 if(row){row.classList.add('pos-inv-resumed');(row.querySelector('button') as HTMLButtonElement|null)?.focus({preventScroll:true});setTimeout(()=>row.classList.remove('pos-inv-resumed'),2500);}});
}
window.posGuardarLugarInventario=posGuardarLugarInventario;window.posRestaurarLugarInventario=posRestaurarLugarInventario;


// Borradores locales: IndexedDB conserva File/Blob sin base64 ni servidor.
let _posUIDB:Promise<IDBDatabase>|null=null;
function posUIStore(action:'get'|'put'|'delete',key:string,value?:any):Promise<any>{
 if(!_posUIDB)_posUIDB=new Promise((resolve,reject)=>{const r=indexedDB.open('bicho-ui',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>resolve(r.result);r.onerror=()=>{_posUIDB=null;reject(r.error);};});
 return _posUIDB.then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('kv',action==='get'?'readonly':'readwrite'),store=tx.objectStore('kv');let result:any;const r=action==='get'?store.get(key):action==='put'?store.put(value,key):store.delete(key);r.onsuccess=()=>result=r.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);}));
}
const _posDraftAux:Record<string,string[]>={
 pedidoModal:['pedidoProductosSeleccionados','pedidoEmpaquesSeleccionados'],
 ptModal:['modoEdicion','edicionProductoId','currentProductImage','currentProductImageFile','_ptMpComponentes','_ptVariants','_ptTagsActuales','_ptGaleriaUrls','_ptGaleriaFiles'],
 pvModal:['_pvMpComponentes','_pvTablaPreciosVariable','_pvCombinaciones','_pvTagsActuales','_pvProductImage','_pvProductImageFile'],
 transactionModal:[]
};
const _posDraftWrites:Record<string,Promise<any>>={};
function posDraftKey(modal:any):string{
 if(!modal.dataset.posDraftKey){const id=modal.id==='pedidoModal'?document.getElementById('editPedidoId')?.value:modal.id==='pvModal'?document.getElementById('pvEditId')?.value:modal.id==='ptModal'&&window.modoEdicion?window.edicionProductoId:modal.dataset.editId;modal.dataset.posDraftKey=modal.id+':'+(modal.id==='transactionModal'?(document.getElementById('transactionType')?.value||'')+':':'')+(id||'nuevo');}
 return 'draft:'+modal.dataset.posDraftKey;
}
async function posGuardarBorrador(modal:any){
 if(!_posDraftAux[modal.id]||!modal._mkDirty)return;
 const key=posDraftKey(modal),fields=Array.from(modal.querySelectorAll('input[id],select[id],textarea[id]') as NodeListOf<HTMLInputElement>).filter(el=>!['password','file'].includes(el.type)).map(el=>({id:el.id,value:el.value,checked:el.checked}));
 const aux=Object.fromEntries(_posDraftAux[modal.id].map(key=>[key,window[key]]));
 const draft={fields,aux:structuredClone(aux),writeId:modal.dataset.posDraftWriteId,at:Date.now()};
 _posDraftWrites[key]=(_posDraftWrites[key]||Promise.resolve()).catch(()=>{}).then(()=>posUIStore('put',key,draft));
 return _posDraftWrites[key];
}
async function posBorrarBorrador(modal:any){const key=posDraftKey(modal);modal._mkDirty=false;_posDraftWrites[key]=(_posDraftWrites[key]||Promise.resolve()).catch(()=>{}).then(()=>posUIStore('delete',key));return _posDraftWrites[key];}
async function posRecuperarBorrador(modal:any){
 if(!_posDraftAux[modal.id])return false;const generation=modal._posDraftGeneration||0,key=posDraftKey(modal);await _posDraftWrites[key];const draft=await posUIStore('get',key);
 if(!draft)return false;if(Date.now()-draft.at>7*86400000){await posUIStore('delete',key);return false;}
 if((modal._posDraftGeneration||0)!==generation||!modal.classList.contains('active'))return false;
 if(draft.writeId)modal.dataset.posDraftWriteId=draft.writeId;
 for(const f of draft.fields||[]){const el=document.getElementById(f.id) as HTMLInputElement;if(el){el.value=f.value;el.checked=f.checked;}}
 for(const name of _posDraftAux[modal.id])if(name in (draft.aux||{}))window[name]=draft.aux[name];modal._mkDirty=true;
 if(modal.id==='pedidoModal'){window.renderPedidoProductosList?.();window.renderPedidoEmpaquesList?.();window.calcPedidoTotal?.();window.posPedidoResumen?.();}
 if(modal.id==='ptModal'){window.renderPtMpList?.();window.renderTagsPt?.();window.renderVariantsListPt?.();window.ptRenderGaleria?.();const img=document.getElementById('ptPreviewImg') as HTMLImageElement;if(img&&window.currentProductImage){img.src=window.currentProductImage;document.getElementById('ptImagePreview')?.classList.remove('hidden');}}
 if(modal.id==='pvModal'){window.pvRenderMpList?.();window.pvRenderTablaPreciosList?.();window.renderTagsPv?.();window.pvRenderCombinaciones?.();const img=document.getElementById('pvPreviewImg') as HTMLImageElement;if(img&&window._pvProductImage){img.src=window._pvProductImage;document.getElementById('pvImagePreview')?.classList.remove('hidden');}}
 const label=document.getElementById('pedidoSubmitBtn');if(modal.id==='pedidoModal'&&label)label.textContent=document.getElementById('editPedidoId')?.value?'Actualizar Pedido':'Guardar Pedido';
 window.manekiToastExport?.('Captura recuperada en este dispositivo.','ok');return true;
}
window.posGuardarBorrador=posGuardarBorrador;window.posBorrarBorrador=posBorrarBorrador;window.posRecuperarBorrador=posRecuperarBorrador;
if(typeof document!=='undefined')for(const type of ['input','change','click'])document.addEventListener(type,(e:Event)=>{const modal=((e.target as HTMLElement)?.closest?.('.modal.active')||(type==='click'?document.querySelector('.modal.active'):null)) as any;if(!modal||!_posDraftAux[modal.id])return;if(type!=='click'){modal._mkDirty=true;modal._posDraftGeneration=(modal._posDraftGeneration||0)+1;}setTimeout(()=>{if(modal.classList.contains('active')&&modal._mkDirty)posGuardarBorrador(modal).catch(()=>window.manekiToastExport?.('No se pudo guardar la copia de la captura en este dispositivo. Mantén la ficha abierta.','warn'));},0);},true);
window.addEventListener?.('pagehide',()=>{document.querySelectorAll('.modal.active').forEach(modal=>{posGuardarBorrador(modal).catch(()=>{});});});


const _posThumbPending:Record<string,Promise<Blob>>={};
let _posThumbIndexWrite=Promise.resolve();
async function posMiniatura(url:string):Promise<Blob>{
 const key='thumb:'+url;if(_posThumbPending[key])return _posThumbPending[key];
 return _posThumbPending[key]=(async()=>{const cached=await posUIStore('get',key);if(cached)return cached;
 const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('No se pudo cargar la foto');const blob=await response.blob();const thumb=await _comprimirFile(blob,240);await posUIStore('put',key,thumb);
 _posThumbIndexWrite=_posThumbIndexWrite.catch(()=>{}).then(async()=>{const keys:string[]=await posUIStore('get','thumb:index')||[];if(!keys.includes(key))keys.push(key);while(keys.length>200)await posUIStore('delete',keys.shift()!);await posUIStore('put','thumb:index',keys);});await _posThumbIndexWrite;return thumb;
 })().finally(()=>delete _posThumbPending[key]);
}
window.posMiniatura=posMiniatura;
function posCargarMiniaturas(root:HTMLElement){
 if(!root)return;(root as any)._posThumbObserver?.disconnect();
 const load=async(img:HTMLImageElement)=>{const source=img.dataset.posThumb!;delete img.dataset.posThumb;try{const blob=await posMiniatura(source);if(!img.isConnected)return;const url=URL.createObjectURL(blob);img.onload=img.onerror=()=>{URL.revokeObjectURL(url);img.onload=img.onerror=null;};img.src=url;}catch{if(img.isConnected)img.src=source;}};
 const images=root.querySelectorAll('img[data-pos-thumb]');if(typeof IntersectionObserver==='undefined'){images.forEach(img=>load(img as HTMLImageElement));return;}
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);load(entry.target as HTMLImageElement);}}, {rootMargin:'100px'});(root as any)._posThumbObserver=observer;images.forEach(img=>observer.observe(img));
}
window.posCargarMiniaturas=posCargarMiniaturas;

function editarVariantePedidoProducto(index:number,key:string){
 const item=window.pedidoProductosSeleccionados?.[index],product=(window.products||[]).find(p=>String(p.id)===String(item?.id));
 const variants=window._variantesPedido?window._variantesPedido(product||{}):product?.variants||[];
 if(!item||!variants.some(v=>`${v.type}:${v.value}`===key))throw Error('Esta combinación ya no está disponible en el producto.');
 // ponytail: cambia la combinación; el precio acordado y los extras pertenecen a la línea.
 item.variante=key;
 const modal=document.getElementById('pedidoModal') as any;if(modal){modal._mkDirty=true;modal._posDraftGeneration=(modal._posDraftGeneration||0)+1;}
 window.renderPedidoProductosList?.();if(modal)window.posGuardarBorrador?.(modal).catch(()=>{});
}
window.editarVariantePedidoProducto=editarVariantePedidoProducto;

function posPedidosSimilares(draft:any,orders:any[]):any[]{
 const norm=(v:any)=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
 const signature=(p:any)=>{const lines=new Map<string,number>();for(const i of p.productosInventario||[]){const key=JSON.stringify([String(i.id||''),norm(i.id==='libre'?i.name:''),norm(i.variante),posCentavos(i.price),!!i.posPersonalizacion]);lines.set(key,(lines.get(key)||0)+Number(i.quantity||1));}return JSON.stringify([...lines].sort((a,b)=>a[0].localeCompare(b[0])));};
 if(!norm(draft.cliente)||!(Number(draft.total)>0))return [];
 const key=signature(draft),hasItems=!!draft.productosInventario?.length;
 return orders.filter(p=>String(p.id)!==String(draft.id)&&!['cancelado','finalizado','entregado','completado'].includes(p.status)&&norm(p.cliente)===norm(draft.cliente)&&posCentavos(p.total)===posCentavos(draft.total)&&
  (hasItems?signature(p)===key:(!p.productosInventario?.length||p.productosInventario.every(i=>i.id==='libre'&&!i.posPersonalizacion))&&!!norm(draft.concepto)&&norm(p.concepto)===norm(draft.concepto)));
}
window.posPedidosSimilares=posPedidosSimilares;
function posAvisoPedidoSimilar(){
 const modal=document.getElementById('pedidoModal');if(!modal?.classList.contains('active'))return;
 const val=(id:string)=>document.getElementById(id)?.value||'';
 const matches=posPedidosSimilares({id:val('editPedidoId'),cliente:val('pedidoCliente'),total:val('pedidoCosto'),concepto:val('pedidoConcepto'),productosInventario:window.pedidoProductosSeleccionados||[]},window.pedidos||[]);
 let notice=document.getElementById('pos-pedido-similar');if(!notice){const anchor=document.getElementById('pos-pedido-summary');if(!anchor)return;notice=document.createElement('p');notice.id='pos-pedido-similar';notice.className='pos-inline-notice';notice.setAttribute('role','status');anchor.after(notice);}
 notice.hidden=!matches.length;notice.textContent=matches.length?`Pedido parecido: ${matches.slice(0,3).map(p=>p.folio||'Sin folio').join(', ')}${matches.length>3?` y ${matches.length-3} más`:''}. Puedes guardar si es otro encargo.`:'';
}
window.posAvisoPedidoSimilar=posAvisoPedidoSimilar;

function posRevisarConsistencia(data:any):any[]{
 const issues:any[]=[],products=data.products||[],orders=data.orders||[];
 const add=(entity:string,record:any,field:string,message:string,expected?:number,actual?:number)=>issues.push({entity,id:String(record.id),field,message,expected,actual,record});
 for(const p of orders){
  if(p.status==='cancelado')continue;
  const paid=posCentavos(posTotalPagado(p)),total=posCentavos(p.total),saldo=Math.max(0,total-paid);
  if(p.resta!=null&&posCentavos(p.resta)!==saldo)add('pedido',p,'saldo','El saldo guardado difiere del total menos los pagos.',saldo/100,Number(p.resta));
  const cash=(data.incomes||[]).filter(i=>String(i.pedidoId||'')===String(p.id)||(p.folio&&i.folioOrigen===p.folio));
  const collected=cash.reduce((s,i)=>s+posCentavos(i.amount??i.monto),0);
  if(collected!==paid)add('pedido',p,'cobros','Los pagos del pedido difieren de los ingresos vinculados. Revisa también registros antiguos sin vínculo.',paid/100,collected/100);
  const items=p.productosInventario||[];
  if(items.length&&items.every(i=>i.price!=null&&Number.isFinite(Number(i.price)))){const subtotal=items.reduce((s,i)=>s+Math.round(posCentavos(i.price)*Number(i.quantity||1)),0);if(subtotal!==total)add('pedido',p,'total','El importe de las líneas difiere del total guardado.',subtotal/100,total/100);}
  for(const item of items)if(item.id&&item.id!=='libre'&&!products.some(x=>String(x.id)===String(item.id)))add('pedido',p,'producto',`Producto referenciado sin registro actual: ${item.name||item.id}. Puede haber sido retirado del catálogo.`);
 }
 for(const p of products){
  if(!Number.isFinite(Number(p.stock))||Number(p.stock)<0)add('producto',p,'stock','Las existencias no son una cantidad válida.',undefined,Number(p.stock));
  else if(p.variants?.length){const sum=p.variants.reduce((s,v)=>s+Number(v.qty||0),0);if(!Number.isFinite(sum)||p.variants.some(v=>Number(v.qty)<0)||Math.abs(sum-Number(p.stock))>.000001)add('producto',p,'stock','Las existencias guardadas difieren de la suma de variantes.',sum,Number(p.stock));}
 }
 // ponytail: verifica cada movimiento; un kardex recortado no permite reconstruir todo el stock.
 for(const m of data.movements||[])if(m.stockAntes!=null&&m.stockDespues!=null&&m.cantidad!=null){const before=Number(m.stockAntes),after=Number(m.stockDespues),delta=Number(m.cantidad);if(![before,after,delta].every(Number.isFinite)||Math.abs(after-before-delta)>.000001)add('movimiento',m,'movimiento','La variación de existencias no coincide con la cantidad del movimiento.',before+delta,after);}
 return issues;
}
window.posRevisarConsistencia=posRevisarConsistencia;
async function posCargarConsistencia(){
 if(window._pendingSync)throw Error('Hay cambios pendientes de sincronizar. La comparación con la nube todavía no es definitiva.');
 const data:any={products:[],orders:[],incomes:[],movements:[]};
 for(const [key,target] of [['products','products'],['pedidos','orders'],['pedidosFinalizados','orders'],['incomes','incomes'],['stockMovimientos','movements']]){
  const cfg=_RELATIONAL_TABLES[key];
  for(let offset=0;;offset+=1000){const {data:rows,error}=await db.from(cfg.table).select('*').order('id').range(offset,offset+999);if(error)throw error;data[target].push(...(rows||[]).map(row=>({...cfg.map(row),id:row.id})));if(!rows||rows.length<1000)break;}
 }
 if(window._pendingSync)throw Error('Hay cambios pendientes de sincronizar. La comparación con la nube todavía no es definitiva.');
 return data;
}
window.posCargarConsistencia=posCargarConsistencia;
async function posAbrirConsistencia(){
 const dialog=posDialog('Revisión de consistencia');dialog.classList.add('pos-wide-dialog');const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Leyendo pedidos, ingresos e inventario…';dialog.appendChild(status);
 const note=document.createElement('p');note.className='pos-review-note';note.textContent='Solo consulta. Estas diferencias son pistas para revisar; no se corrige ni se bloquea ningún registro.';dialog.appendChild(note);
 try{const data=await posCargarConsistencia();if(!dialog.isConnected)return;const issues=posRevisarConsistencia(data);status.textContent=issues.length?`${issues.length} diferencias para revisar`:`Sin diferencias en ${data.orders.length} pedidos, ${data.products.length} productos y ${data.movements.length} movimientos consultados.`;
 const money=new Set(['saldo','cobros','total']);for(const issue of issues){const details=document.createElement('details');details.className='pos-consistency-row';const summary=document.createElement('summary');summary.textContent=`${issue.record.folio||issue.record.name||issue.record.productoNombre||issue.id} · ${issue.field}`;details.appendChild(summary);const text=document.createElement('p');text.textContent=issue.message;details.appendChild(text);if(issue.expected!=null){const values=document.createElement('p');values.textContent=`Calculado: ${money.has(issue.field)?fmtMoney(issue.expected):issue.expected} · Guardado: ${money.has(issue.field)?fmtMoney(issue.actual):issue.actual}`;details.appendChild(values);}const record=document.createElement('p');record.textContent=`Registro ${issue.id}${issue.record.cliente?' · '+issue.record.cliente:''}${issue.record.entrega?' · Entrega '+issue.record.entrega:''}${issue.record.motivo?' · '+issue.record.motivo:''}`;details.appendChild(record);
 if(issue.entity==='pedido'&&(window.pedidos||[]).some(p=>String(p.id)===issue.id)){const open=document.createElement('button');open.className='mk-btn-secondary';open.textContent='Abrir pedido';open.onclick=async()=>{dialog.close();await window.ensurePedidos?.();window.openPedidoModal?.(issue.id);};details.appendChild(open);}dialog.appendChild(details);}
 }catch(e:any){status.textContent='No se pudo completar la revisión: '+(e.message||'error de conexión');const retry=document.createElement('button');retry.className='mk-btn-secondary';retry.textContent='Reintentar revisión';retry.onclick=()=>{dialog.close();posAbrirConsistencia();};dialog.appendChild(retry);}
}
window.posAbrirConsistencia=posAbrirConsistencia;
