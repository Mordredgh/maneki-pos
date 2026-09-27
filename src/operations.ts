// Herramientas operativas: calculos puros compartidos y dialogos nativos.
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
function posDialog(title:string):HTMLDialogElement {
    const trigger=document.activeElement as HTMLElement;
    const dialog=document.createElement('dialog');dialog.className='pos-sync-dialog pos-operation-dialog';dialog.setAttribute('aria-label',title);
    const h=document.createElement('h2');h.textContent=title;dialog.appendChild(h);
    const close=document.createElement('button');close.textContent='Cerrar';close.type='button';close.onclick=()=>dialog.close();dialog.appendChild(close);
    dialog.addEventListener('close',()=>{dialog.remove();if(trigger?.isConnected)trigger.focus();},{once:true});document.body.appendChild(dialog);dialog.showModal();return dialog;
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
