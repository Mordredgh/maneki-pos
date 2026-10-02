// ponytail: conteos locales en IndexedDB; inventario y ajustes usan el RPC atomico existente.
function posLineasConteo(products:any[]){
 return products.filter(p=>p.activo!==false&&!['servicio','pack'].includes(p.tipo)).flatMap(p=>{
  // La capacidad fabricable no representa piezas fisicas independientes.
  if(!(p.variants||[]).length&&(p.mpComponentes||[]).length)return [];
  const variants=(p.variants||[]).length?p.variants:[null];
  return variants.map(v=>({key:JSON.stringify([String(p.id),v?.type||v?.tipo||'',v?.value||v?.valor||'']),productId:String(p.id),name:p.name,category:p.category||'',tipo:p.tipo,unit:p.unidad||'pza',variant:v?`${v.type||v.tipo||''}:${v.value||v.valor||''}`:'',size:v?(v.size||String(v.value||v.valor||'').split('/')[0].trim()):'',color:v?(v.color||String(v.value||v.valor||'').split('/')[1]?.trim()||''):'',value:Number(v?v.qty:p.stock)||0,counted:null,baseline:null,applied:false}));
 });
}
function posConteoExistencia(line:any,snapshot:any){
 const p=snapshot.products.find(p=>String(p.id)===line.productId);
 if(!p||p.activo===false||['servicio','pack'].includes(p.tipo))throw Error('El producto ya no está disponible.');
 const v=line.variant?(p.variants||[]).find(v=>`${v.type||v.tipo||''}:${v.value||v.valor||''}`===line.variant):null;
 if(line.variant&&!v||!line.variant&&(p.variants||[]).length)throw Error('Cambió la configuración de variantes. Inicia otro conteo para este producto.');
 const available=Number(v?v.qty:p.stock);
 if(!Number.isFinite(available)||available<0)throw Error('La existencia registrada no es válida.');
 const reserved=(snapshot.orders||[]).filter(o=>!['cancelado','finalizado','entregado','completado'].includes(o.status)&&o.posDetalle?.apartado?.activo).reduce((s,o)=>s+(o.posDetalle.apartado.items||o.productosInventario||[]).filter(i=>String(i.id)===line.productId&&String(i.variante||'')===line.variant).reduce((n,i)=>n+Number(i.quantity||i.cantidad||0),0),0);
 return {p,v,available,reserved,current:available+reserved};
}
function posCompararConteo(session:any,snapshot:any){
 return session.lines.filter(l=>l.counted!==null&&!l.applied).map(l=>{
  try{if(l.baseline===null||!Number.isFinite(Number(l.baseline))||Number(l.baseline)<0||!Number.isFinite(Number(l.counted))||Number(l.counted)<0||Number(l.counted)>1e8||l.tipo!=='materia_prima'&&!Number.isSafeInteger(Number(l.counted)))throw Error('Vuelve a contar esta combinación: la cantidad guardada no es válida.');const s=posConteoExistencia(l,snapshot),difference=Math.round((l.counted-l.baseline)*1e6)/1e6,target=Math.round((s.current+difference)*1e6)/1e6,availableTarget=Math.round((s.available+difference)*1e6)/1e6;
   if(Array.isArray(l.movementIds)){
    const later=(snapshot.movements||[]).filter(m=>String(m.producto_id)===l.productId&&!l.movementIds.includes(String(m.id)));
    const adjusted=later.some(m=>{if(m.tipo!=='ajuste')return false;if(!l.variant)return true;const reason=String(m.motivo||'');const matching=(s.p.variants||[]).filter(v=>reason.endsWith(' · '+`${v.type||v.tipo||''}:${v.value||v.valor||''}`)||reason.endsWith(' · '+String(v.value||v.valor||'')));return !matching.length||matching.some(v=>`${v.type||v.tipo||''}:${v.value||v.valor||''}`===l.variant);});
    if(adjusted)throw Error('Hubo otro ajuste en esta combinación. Vuelve a contar para no aplicar dos veces la diferencia.');
    if(s.current!==l.baseline&&l.movementIds.length&&!(snapshot.movements||[]).some(m=>l.movementIds.includes(String(m.id))))throw Error('El historial desde este conteo ya fue recortado. Vuelve a contar esta combinación.');
   }
   return {...l,current:s.current,reserved:s.reserved,movements:Math.round((s.current-l.baseline)*1e6)/1e6,difference,target,availableTarget,error:availableTarget<0?'El ajuste dejaría menos piezas que las apartadas. Revisa ese apartado antes de ajustar.':''};
  }catch(e:any){return {...l,error:e.message};}
 });
}
Object.assign(window,{posLineasConteo,posCompararConteo});
let _conteosFisicos:any[]=[],_conteoQueue:Promise<any>=Promise.resolve();
function posConteoSerial<T>(fn:()=>Promise<T>):Promise<T>{const next=_conteoQueue.catch(()=>{}).then(fn);_conteoQueue=next;return next;}
async function posCargarConteos(){return posConteoSerial(async()=>{const saved=await posUIStore('get','inventory:counts');_conteosFisicos=Array.isArray(saved)?saved:[];return _conteosFisicos;});}
async function posGuardarConteos(){await posUIStore('put','inventory:counts',_conteosFisicos);}
async function posLeerConteo(){
 if(typeof db==='undefined'||!db)throw Error('No se pudo leer el inventario. Reintenta al recuperar conexión.');
 if(window._pendingSync)throw Error('Hay cambios pendientes de sincronizar. Termina esa sincronización antes de comparar.');
 const read=async(table:string)=>{const rows:any[]=[];for(let offset=0;;offset+=1000){const r=await db.from(table).select('*').order('id').range(offset,offset+999);if(r.error)throw Error(r.error.message||'Lectura incompleta');rows.push(...(r.data||[]));if((r.data||[]).length<1000)break;}return rows;};
 const rawProducts=await read('products'),rawOrders=await read('orders'),movements=await read('stock_movements');
 if(window._pendingSync)throw Error('El inventario tiene cambios pendientes. Vuelve a comparar al terminar la sincronización.');
 return {rawProducts,products:rawProducts.map(_RELATIONAL_TABLES.products.map),orders:rawOrders.map(_RELATIONAL_TABLES.pedidos.map),movements};
}
function posConteoSesion(id:string){const session=_conteosFisicos.find(s=>s.id===id);if(!session)throw Error('Conteo no encontrado.');return session;}
async function posCrearConteo(){return posConteoSerial(async()=>{const snapshot=await posLeerConteo();const session={id:mkId(),created:new Date().toISOString(),scope:{type:'',category:'',search:''},lines:posLineasConteo(snapshot.products)};_conteosFisicos.push(session);try{await posGuardarConteos();}catch(e){_conteosFisicos.pop();throw e;}return session;});}
async function posContarLinea(id:string,key:string,input:string){return posConteoSerial(async()=>{
 const s=posConteoSesion(id),line=s.lines.find(l=>l.key===key);if(!line||line.applied||s.attempt)throw Error('Esta línea ya está ajustada o tiene un ajuste pendiente.');
 const counted=input.trim()===''?null:Number(input);if(counted!==null&&(!Number.isFinite(counted)||counted<0||counted>1e8||line.tipo!=='materia_prima'&&!Number.isSafeInteger(counted)))throw Error('Captura una cantidad válida, mayor o igual a cero.');
 const before={...line};if(counted===null){line.counted=null;line.baseline=null;delete line.countedAt;delete line.movementIds;}else{const snapshot=await posLeerConteo(),state=posConteoExistencia(line,snapshot);line.counted=counted;line.baseline=state.current;line.countedAt=new Date().toISOString();line.movementIds=snapshot.movements.filter(m=>String(m.producto_id)===line.productId).map(m=>String(m.id));}
 try{await posGuardarConteos();}catch(e){Object.assign(line,before);throw e;}return line;
});}
Object.assign(window,{posCargarConteos,posCrearConteo,posLeerConteo,posContarLinea});
async function posAplicarConteo(id:string,selected:string[]){return posConteoSerial(async()=>{
 const session=posConteoSesion(id);
 if(!session.attempt){
  const snapshot=await posLeerConteo(),changes=posCompararConteo(session,snapshot).filter(l=>selected.includes(l.key)&&l.difference!==0);
  if(!changes.length)throw Error('Selecciona las diferencias que quieres ajustar.');
  if(changes.some(l=>l.error))throw Error(changes.find(l=>l.error).error);
  const plans=new Map<string,any>(),movements:any[]=[];
  for(const l of changes){const state=posConteoExistencia(l,snapshot),raw=snapshot.rawProducts.find(p=>String(p.id)===l.productId);
   let plan=plans.get(l.productId);if(!plan){plan={id:l.productId,stock:Number(raw.stock),variants:structuredClone(raw.variants||[]),updated_at:new Date().toISOString()};plans.set(l.productId,plan);}
   plan.stock=Math.round((plan.stock+l.difference)*1e6)/1e6;
   if(l.variant){const v=plan.variants.find(v=>`${v.type||v.tipo||''}:${v.value||v.valor||''}`===l.variant);v.qty=l.availableTarget;}
   movements.push({id:mkId(),producto_id:l.productId,producto_nombre:l.name,tipo:'ajuste',cantidad:l.difference,motivo:`Conteo físico · ${session.created.slice(0,10)}${l.variant?' · '+l.variant:''}`,stock_antes:state.available,stock_despues:l.availableTarget,fecha:new Date().toISOString()});
  }
  const expected=Object.fromEntries([...plans.keys()].map(id=>[id,snapshot.rawProducts.find(p=>String(p.id)===id)]));
  session.attempt={id:mkId(),keys:changes.map(l=>l.key),operations:[{table:'products',rows:[...plans.values()],expected},{table:'stock_movements',rows:movements,expected:Object.fromEntries(movements.map(m=>[m.id,null]))}]};
  // Guardar el payload antes de enviarlo permite repetir exactamente el mismo recibo tras recargar.
  try{await posGuardarConteos();}catch(e){delete session.attempt;throw e;}
 }
 if(typeof db==='undefined'||!db||typeof db.rpc!=='function')throw Error('Sin conexión para ajustar. El conteo está guardado; reintenta al reconectar.');
 const attempt=session.attempt;const call=db.rpc('pos_apply_operation',{p_id:attempt.id,p_operations:attempt.operations});const result=typeof _withTimeout==='function'?await _withTimeout(call,15000):await call;
 if(result.error){if(result.error.code==='40001'&&String(result.error.message).includes('Conflicto')){delete session.attempt;await posGuardarConteos();}throw Error(result.error.message||'No se confirmó el ajuste. Reintenta.');}
 session.lines.filter(l=>attempt.keys.includes(l.key)).forEach(l=>{l.applied=true;l.appliedAt=new Date().toISOString();});delete session.attempt;await posGuardarConteos();
 if(typeof _RELATIONAL_TABLES.stockMovimientos?.map==='function'){
  const old=window.stockMovements||[],known=new Set(old.map(m=>String(m.id)));const moves=(result.data?.[1]||[]).filter(m=>!known.has(String(m.id))).map(m=>({..._RELATIONAL_TABLES.stockMovimientos.map(m),id:m.id}));window.stockMovements=[...moves,...old].slice(0,500);window.stockMovimientos=window.stockMovements;
 }
 // Leer otra vez: un recibo repetido puede contener filas anteriores a una venta posterior.
 try{const fresh=await posLeerConteo();for(const p of fresh.products){const index=(window.products||[]).findIndex(x=>String(x.id)===String(p.id));if(index>=0)window.products[index]=p;}if(typeof _rememberRowBases==='function')_rememberRowBases('products',fresh.rawProducts);}catch(e){console.warn('Conteo confirmado; refresca el inventario para ver los movimientos más recientes.');}
 if(typeof renderInventoryTable==='function')renderInventoryTable();return {adjusted:attempt.keys.length};
});}
window.posAplicarConteo=posAplicarConteo;
async function posAbrirConteoFisico(){
 const existing=document.querySelector('dialog.pos-count-dialog[open]');if(existing)return;
 const dialog=posDialog('Conteo físico');dialog.classList.add('pos-wide-dialog','pos-count-dialog');
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='Cargando conteo…';dialog.appendChild(status);
 const toolbar=document.createElement('div');toolbar.className='pos-count-toolbar';dialog.appendChild(toolbar);
 const panel=document.createElement('div');dialog.appendChild(panel);
 let session:any,snapshot:any,review=false,selected=new Set<string>();
 const say=(msg:string)=>{if(dialog.isConnected)status.textContent=msg;};
 const number=(n:number)=>Number(n).toLocaleString('es-MX',{maximumFractionDigits:6});
 const progress=()=>say(`${session.lines.filter(l=>l.counted!==null).length} de ${session.lines.length} combinaciones contadas · Guardado en este dispositivo${session.attempt?' · Hay ajustes pendientes de confirmar':''}`);
 const button=(text:string,fn:()=>any,primary=false)=>{const b=document.createElement('button');b.type='button';b.className=primary?'mk-btn-primary':'mk-btn-secondary';b.textContent=text;b.onclick=()=>Promise.resolve(fn()).catch(e=>say(e.message||'No se completó la acción. Reintenta.'));return b;};
 const labeled=(text:string,control:HTMLElement)=>{const l=document.createElement('label');l.append(text,control);return l;};
 const option=(select:HTMLSelectElement,value:string,text:string)=>{const o=document.createElement('option');o.value=value;o.textContent=text;select.appendChild(o);};
 const scope=()=>posConteoSerial(async()=>{await posGuardarConteos();});
 const refresh=async()=>{await _conteoQueue.catch(()=>{});snapshot=await posLeerConteo();render();};
 function inputFor(line:any){
  const box=document.createElement('div');box.className='pos-count-cell';
  const input=document.createElement('input');input.type='number';input.min='0';input.step=line.tipo==='materia_prima'?'any':'1';input.inputMode=line.tipo==='materia_prima'?'decimal':'numeric';input.value=line.counted===null?'':String(line.counted);input.placeholder='Sin contar';input.disabled=line.applied||!!session.attempt;input.setAttribute('aria-label',`Contado ${line.name}${line.variant?' '+line.variant:''}`);
  const hint=document.createElement('small');
  const updateHint=()=>{try{const current=posConteoExistencia(line,snapshot).current;hint.textContent=line.applied?'Ajustado':line.counted===null?`Registrado: ${number(current)} ${line.unit}`:`Registrado al contar: ${number(line.baseline)} · ${line.counted===line.baseline?'Coincide':line.counted<line.baseline?'Faltan '+number(line.baseline-line.counted):'Sobran '+number(line.counted-line.baseline)}`;}catch(e:any){hint.textContent=e.message;input.disabled=true;}};
  updateHint();input.onchange=async()=>{const value=input.value,key=line.key,id=session.id;say('Guardando cantidad…');try{await posContarLinea(id,key,value);if(session.id===id){snapshot=await posLeerConteo();updateHint();const summary=box.closest("details")?.querySelector("summary");if(summary){const lines=session.lines.filter(l=>l.productId===line.productId);summary.textContent=`${line.name} · ${lines.filter(l=>l.counted!==null).length}/${lines.length} contadas`;}progress();}}catch(e:any){input.value=line.counted===null?'':String(line.counted);say(e.message);}};
  box.append(input,hint);return box;
 }
 function render(){
  toolbar.replaceChildren();panel.replaceChildren();progress();
  const choose=document.createElement('select');choose.setAttribute('aria-label','Conteo guardado');_conteosFisicos.forEach(s=>option(choose,s.id,`${new Date(s.created).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})} · ${s.lines.filter(l=>l.counted!==null).length} contadas`));choose.value=session.id;choose.onchange=async()=>{try{await _conteoQueue.catch(()=>{});session=posConteoSesion(choose.value);selected.clear();await refresh();}catch(e:any){say(e.message);}};
  toolbar.append(labeled('Continuar conteo',choose),button('Nuevo conteo',async()=>{session=await posCrearConteo();selected.clear();review=false;await refresh();}));
  const type=document.createElement('select');type.setAttribute('aria-label','Tipo de inventario para contar');[['','Todo el inventario'],['terminados','Productos terminados'],['materia_prima','Materiales']].forEach(([v,t])=>option(type,v,t));type.value=session.scope.type;
  const category=document.createElement('select');category.setAttribute('aria-label','Categoría para contar');option(category,'','Todas las categorías');[...new Set<string>(session.lines.map(l=>l.category))].filter(Boolean).forEach(c=>option(category,c,(window.categories||[]).find(x=>String(x.id)===c)?.name||c));category.value=session.scope.category;
  const search=document.createElement('input');search.type='search';search.placeholder='Buscar playeras, tazas…';search.setAttribute('aria-label','Buscar productos en el conteo');search.value=session.scope.search;
  type.onchange=async()=>{try{session.scope.type=type.value;await scope();render();}catch(e:any){say(e.message);}};category.onchange=async()=>{try{session.scope.category=category.value;await scope();render();}catch(e:any){say(e.message);}};search.onchange=async()=>{try{session.scope.search=search.value;await scope();render();}catch(e:any){say(e.message);}};
  toolbar.append(labeled('Inventario',type),labeled('Categoría',category),labeled('Producto',search),button(review?'Volver a contar':'Revisar diferencias',async()=>{review=!review;await refresh();}),button('Actualizar existencias',refresh));
  const note=document.createElement('p');note.className='pos-review-note';note.textContent='Cuenta y captura cada combinación en el momento. Incluye las piezas apartadas que aún tienes físicamente. La cantidad registrada al capturar sirve de referencia; los movimientos posteriores se conservan. Las piezas fabricables se cuentan como sus materiales.';panel.appendChild(note);
  if(session.attempt){panel.appendChild(button('Reintentar ajustes pendientes',async()=>{say('Confirmando ajustes pendientes…');await posAplicarConteo(session.id,[]);await refresh();},true));}
  const visible=session.lines.filter(l=>(!session.scope.type||(session.scope.type==='materia_prima'?l.tipo==='materia_prima':l.tipo!=='materia_prima'))&&(!session.scope.category||l.category===session.scope.category)&&(!session.scope.search||String(l.name).toLocaleLowerCase().includes(session.scope.search.toLocaleLowerCase())));
  if(review){
   const rows=posCompararConteo(session,snapshot).filter(l=>visible.some(v=>v.key===l.key));
   const scroll=document.createElement('div');scroll.className='pos-table-scroll';const table=document.createElement('table');table.className='pos-data-table pos-count-review';table.innerHTML='<caption>Compara la existencia registrada al capturar con lo contado. Selecciona solo las diferencias que quieres aplicar.</caption><thead><tr><th>Ajustar</th><th>Producto / combinación</th><th>Registrado</th><th>Contado</th><th>Diferencia</th></tr></thead>';const tbody=document.createElement('tbody');
   for(const l of rows){const tr=document.createElement('tr'),check=document.createElement('input');check.type='checkbox';check.setAttribute('aria-label',`Ajustar ${l.name}${l.variant?' '+l.variant:''}`);check.checked=selected.has(l.key);check.disabled=!!l.error||l.difference===0||!!session.attempt;check.onchange=()=>{if(check.checked)selected.add(l.key);else selected.delete(l.key);apply.textContent=`Aplicar ${rows.filter(r=>selected.has(r.key)&&!r.error&&r.difference!==0).length} ajustes seleccionados`;};const td=document.createElement('td'),checkLabel=document.createElement('label');checkLabel.className='pos-count-check';checkLabel.append(check,'Ajustar');td.appendChild(checkLabel);tr.appendChild(td);
    const texts=[`${l.name}${l.variant?' · '+l.variant:''}`,number(l.baseline),number(l.counted),l.error||(!l.difference?'Coincide':l.difference<0?'Faltan '+number(-l.difference):'Sobran '+number(l.difference))];texts.forEach((text,index)=>{const cell=document.createElement('td');cell.textContent=text;cell.dataset.label=['Producto','Registrado','Contado','Diferencia'][index];if(index===3&&!l.error){const meta=document.createElement('small');meta.textContent=`Movimiento posterior: ${l.movements>0?'+':''}${number(l.movements)} · Existencia final: ${number(l.target)}`;cell.appendChild(meta);}tr.appendChild(cell);});tbody.appendChild(tr);
   }table.appendChild(tbody);scroll.appendChild(table);panel.appendChild(scroll);
   const apply=button(`Aplicar ${rows.filter(r=>selected.has(r.key)&&!r.error&&r.difference!==0).length} ajustes seleccionados`,async()=>{apply.disabled=true;say('Aplicando ajustes seleccionados…');try{const result=await posAplicarConteo(session.id,rows.filter(r=>selected.has(r.key)&&!r.error&&r.difference!==0).map(r=>r.key));selected.clear();await refresh();say(`${result.adjusted} ajustes confirmados · Guardado en este dispositivo`);}catch(e){await refresh().catch(()=>{});throw e;}finally{apply.disabled=false;}},true);apply.disabled=!!session.attempt||!rows.some(l=>!l.error&&l.difference!==0);panel.appendChild(apply);
   if(!rows.length){const empty=document.createElement('p');empty.textContent='No hay cantidades contadas pendientes de ajuste en esta parte del inventario.';panel.appendChild(empty);}return;
  }
  const groups=new Map<string,any[]>();visible.forEach(l=>{const group=groups.get(l.productId)||[];group.push(l);groups.set(l.productId,group);});let index=0;
  for(const lines of groups.values()){
   const details=document.createElement('details');details.className='pos-count-product';details.open=index++===0;const summary=document.createElement('summary');summary.textContent=`${lines[0].name} · ${lines.filter(l=>l.counted!==null).length}/${lines.length} contadas`;details.appendChild(summary);
   if(lines.every(l=>l.size&&l.color)){
    const sizes=[...new Set<string>(lines.map(l=>l.size))],colors=[...new Set<string>(lines.map(l=>l.color))];const scroll=document.createElement('div');scroll.className='pos-table-scroll';const table=document.createElement('table');table.className='pos-data-table pos-count-matrix';const head=document.createElement('thead'),hr=document.createElement('tr');const first=document.createElement('th');first.textContent='Talla / color';hr.appendChild(first);colors.forEach(c=>{const th=document.createElement('th');th.scope='col';th.innerHTML=typeof posColorMuestra==='function'?posColorMuestra(c):'';th.append(c);hr.appendChild(th);});head.appendChild(hr);table.appendChild(head);const body=document.createElement('tbody');
    sizes.forEach(size=>{const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=size;tr.appendChild(th);colors.forEach(color=>{const cell=document.createElement('td'),line=lines.find(l=>l.size===size&&l.color===color);if(line)cell.appendChild(inputFor(line));else cell.textContent='Sin combinación';tr.appendChild(cell);});body.appendChild(tr);});table.appendChild(body);scroll.appendChild(table);details.appendChild(scroll);
   }else{const list=document.createElement('div');list.className='pos-count-simple';lines.forEach(line=>list.appendChild(labeled(line.variant||`Cantidad física (${line.unit})`,inputFor(line))));details.appendChild(list);}panel.appendChild(details);
  }
  if(!groups.size){const empty=document.createElement('p');empty.textContent='No hay productos físicos en este filtro. Cambia la categoría o la búsqueda.';panel.appendChild(empty);}
 }
 try{await posCargarConteos();session=_conteosFisicos[_conteosFisicos.length-1]||await posCrearConteo();snapshot=await posLeerConteo();if(dialog.isConnected)render();}catch(e:any){say(e.message);panel.appendChild(button('Reintentar carga',async()=>{dialog.close();await posAbrirConteoFisico();}));}
}
window.posAbrirConteoFisico=posAbrirConteoFisico;
