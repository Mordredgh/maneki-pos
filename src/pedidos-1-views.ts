// Fechas civiles: UTC solo se usa para contar dias, nunca para convertir la fecha local.
function posTablaFechaEntrega(value:string,hoy?:string){
 const day=(s:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;const [y,m,d]=s.split('-').map(Number),n=Date.UTC(y,m-1,d);return new Date(n).toISOString().slice(0,10)===s?n:null;};
 const raw=String(value||'').split('T')[0],date=day(raw);
 const now=new Date(),today=day(hoy||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`);
 if(date==null||today==null)return {label:'Sin fecha válida',date:raw,state:'missing'};
 const days=Math.round((date-today)/86400000),exact=raw.split('-').reverse().join('/');
 return {label:days===0?'Hoy':days===1?'Mañana':days<0?`Vencido hace ${-days} ${days===-1?'día':'días'}`:`En ${days} días`,date:exact,state:days<0?'late':days===0?'today':'future'};
}
const posTablaOpcionales={folio:'Folio',concepto:'Detalle adicional',creacion:'Fecha de pedido',entrega:'Entrega',cobro:'Importes',estado:'Estado'};
function posTablaPreferencias(){try{const list=JSON.parse(localStorage.getItem('pos-table-hidden')||'[]');return Array.isArray(list)?list.filter(k=>Object.prototype.hasOwnProperty.call(posTablaOpcionales,k)):[];}catch{return [];}}
function posTablaAplicarColumnas(){const hidden=posTablaPreferencias();document.querySelectorAll('#pedidosTableEl [data-column]').forEach((el:any)=>{el.hidden=hidden.includes(el.dataset.column);});document.querySelectorAll('#posTablaColumnas input').forEach((el:any)=>{el.checked=!hidden.includes(el.value);});}
function posTablaCambiarColumna(input:HTMLInputElement){const hidden=posTablaPreferencias().filter(k=>k!==input.value);if(!input.checked&&Object.prototype.hasOwnProperty.call(posTablaOpcionales,input.value))hidden.push(input.value);try{localStorage.setItem('pos-table-hidden',JSON.stringify(hidden));}catch{}posTablaAplicarColumnas();}
function posTablaAbrirFicha(id:string){posAbrirFicha(id);}
(window as any).posTablaCambiarColumna=posTablaCambiarColumna;
(window as any).posTablaAbrirFicha=posTablaAbrirFicha;

// ── Cambiar vista kanban / tabla ──
function setVistaPedidos(vista) {
    _pedidoVistaActual = vista;
    const kanban  = document.getElementById('vistaKanban');
    const tabla   = document.getElementById('vistaTabla');
    const cal     = document.getElementById('vistaCalendario');
    const btnK    = document.getElementById('btnVistaKanban');
    const btnT    = document.getElementById('btnVistaTabla');
    const btnC    = document.getElementById('btnVistaCalendario');
    // ocultar todo
    [kanban, tabla, cal].forEach(el => el && el.classList.add('hidden'));
    [btnK, btnT, btnC].forEach(b => b && b.classList.remove('active'));
    if (vista === 'kanban') {
        kanban && kanban.classList.remove('hidden');
        if (btnK) btnK.classList.add('active');
    } else if (vista === 'calendario') {
        cal && cal.classList.remove('hidden');
        if (btnC) btnC.classList.add('active');
        if (typeof renderCalendarioPedidos === 'function') renderCalendarioPedidos();
        return;
    } else {
        tabla && tabla.classList.remove('hidden');
        if (btnT) btnT.classList.add('active');
    }
    renderPedidosTable();
}

// ── Filtrar pedidos tabla ──
function filterPedidos(status, btn) {
    _pedidoFiltroActivo = status;
    _pedidosTablePage = 1;
    document.querySelectorAll('.mk-filter-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderTablaPedidos();
}

// ── Render principal ──
function normalizarResta() {
    (window.pedidos || []).forEach(p => {
        p.anticipo=posTotalPagado(p);
        p.resta=calcSaldoPendiente(p);
    });
}
window.normalizarResta = normalizarResta;

// ── Costo de producción visible en modal (MEJORA 1) ──────────────────────────
function _calcularCostoProduccionPedido() {
    const items = window.pedidoProductosSeleccionados || [];
    let costoTotal = 0;
    items.forEach(item => {
        const prod = (window.products || []).find(p => String(p.id) === String(item.id));
        if (!prod) return;
        const qty = item.quantity || item.cantidad || 1;
        // Prioridad: costoMateriales explícito, luego mpComponentes, luego prod.costo
        if (Array.isArray(prod.mpComponentes) && prod.mpComponentes.length > 0) {
            const costoUnit = prod.mpComponentes.reduce((s, c) => s + (Number(c.costUnit) || 0) * (Number(c.qty) || 1), 0);
            const rph = prod.rendimientoPorHoja || 0;
            const hojas = rph > 0 ? Math.ceil(qty / rph) : qty;
            costoTotal += costoUnit * hojas;
        } else if (prod.costoMateriales != null && prod.costoMateriales !== '') {
            costoTotal += (parseFloat(prod.costoMateriales) || 0) * qty;
        } else if (prod.costo != null && prod.costo !== '') {
            costoTotal += (parseFloat(prod.costo) || 0) * qty;
        }
    });

    // Calcular total de venta desde calcPedidoTotal logic
    let total = 0;
    if (items.length > 0) {
        total = window._sumLineas ? _sumLineas(items) :
            items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.quantity || 1), 0);
    } else {
        const plEl = document.getElementById('pedidoPrecioLibre');
        if (plEl) total = parseFloat(plEl.value) || 0;
    }

    const margen = total > 0 ? Math.round((total - costoTotal) / total * 100) : 0;

    // Crear o actualizar el elemento #pedidoCostoProduccion
    let el = document.getElementById('pedidoCostoProduccion');
    if (!el) {
        const footer = document.querySelector('#pedidoModal .pos-wizard-footer');
        if (footer) {
            el = document.createElement('div');
            el.id = 'pedidoCostoProduccion';
            footer.insertBefore(el,footer.querySelector('.pos-wizard-actions'));
        }
    }
    if (el) {
        if (costoTotal > 0 || items.length > 0) {
            el.style.display = '';
            el.textContent = `Costo producción: $${costoTotal.toFixed(2)} | Margen estimado: ${margen}%`;
            el.style.color = margen >= 30 ? '#166534' : margen >= 10 ? '#92400e' : '#991b1b';
            el.style.background = margen >= 30 ? '#f0fdf4' : margen >= 10 ? '#fffbeb' : '#fef2f2';
            el.style.borderColor = margen >= 30 ? '#bbf7d0' : margen >= 10 ? '#fde68a' : '#fecaca';
        } else {
            el.style.display = 'none';
        }
    }
}
window._calcularCostoProduccionPedido = _calcularCostoProduccionPedido;

// Flujo de pedido con validacion por paso y resumen fijo.
let posPedidoPaso=1;
function posPedidoResumen(){
    window.posAvisoPedidoSimilar?.();
    const val=(id:string)=>document.getElementById(id)?.value||'';
    const total=mkRound2(val('pedidoCosto'));const anticipo=mkRound2(val('pedidoAnticipo'));
    const summary=document.getElementById('pos-pedido-summary');
    if(summary)summary.textContent=`Total ${fmtMoney(total)} · Anticipo ${fmtMoney(anticipo)} · Saldo ${fmtMoney(Math.max(0,total-anticipo))}`;
    const review=document.getElementById('pos-pedido-review');
    if(review && typeof window.pedidoResumenAntesDeGuardar === 'function'){
        const data=window.pedidoResumenAntesDeGuardar();review.replaceChildren();
        const intro=document.createElement('p');intro.textContent=`${data.cliente||'Cliente sin nombre'} · Pedido ${val('pedidoFecha')||'sin fecha'} · Entrega ${data.entrega||'sin fecha'}`;review.appendChild(intro);
        const list=document.createElement('ul');for(const item of data.items){const line=document.createElement('li');line.textContent=`${item.quantity||1} × ${item.name||item.nombre||'Producto'}${item.variante?` · ${item.variante}`:''} — ${fmtMoney((Number(item.price)||0)*(Number(item.quantity)||1))}`;list.appendChild(line);}review.appendChild(list);
        const amounts=document.createElement('dl');for(const [label,amount] of [['Total',data.total],['Anticipo cobrado',data.anticipo],['Saldo pendiente',data.saldo]]){const row=document.createElement('div');const term=document.createElement('dt');term.textContent=String(label);const value=document.createElement('dd');value.textContent=fmtMoney(amount);row.append(term,value);amounts.appendChild(row);}review.appendChild(amounts);
        const issues=document.createElement('p');issues.className='pos-pedido-review-issues';issues.textContent=data.missing.length?`Corrige antes de guardar: ${data.missing.join(', ')}.`:'Datos principales completos.';issues.dataset.state=data.missing.length?'warning':'ready';review.appendChild(issues);
    }
}
function _updatePedidoStep(step:number):void{
    const form=document.getElementById('pedidoForm');if(!form)return;
    posPedidoPaso=Math.max(1,Math.min(4,Number(step)));form.dataset.step=String(posPedidoPaso);
    form.querySelectorAll('details.mk-pedido-section').forEach((el:any,i:number)=>{el.hidden=i+1!==posPedidoPaso;el.open=true;});
    const confirm=document.getElementById('pos-pedido-confirm');if(confirm)confirm.hidden=posPedidoPaso!==4;
    for(const [id,hide] of [['pos-pedido-back',posPedidoPaso===1],['pos-pedido-next',posPedidoPaso===4],['pos-pedido-save',false]] as [string,boolean][]){const el=document.getElementById(id);if(el)el.hidden=hide;}
    document.querySelectorAll('#pedido-steps button').forEach((el:any,i:number)=>{if(i+1===posPedidoPaso)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    const stepLabel=document.getElementById('pos-pedido-step-label');
    if(stepLabel)stepLabel.textContent=`${['Cliente','Productos','Detalles','Revisar (opcional)'][posPedidoPaso-1]} · paso ${posPedidoPaso} de 4`;
    const progress=document.getElementById('pos-pedido-progress-fill') as HTMLElement;
    if(progress)progress.style.width=`${posPedidoPaso*25}%`;
    const next=document.getElementById('pos-pedido-next');
    if(next)next.textContent=posPedidoPaso===3?'Revisar pedido':'Continuar';
    if(!form.dataset.wizardBound){form.dataset.wizardBound='1';form.addEventListener('input',posPedidoResumen);form.addEventListener('submit',(e)=>{if(!posPedidoValidar(3)||(window.pedidoResumenAntesDeGuardar?.().missing||[]).length){e.preventDefault();e.stopImmediatePropagation();}},true);}
    const error=document.getElementById('pos-pedido-error');if(error)error.textContent='';
    posPedidoResumen();
}
function posPedidoValidar(until:number):boolean{
    const sections=document.querySelectorAll('#pedidoForm details.mk-pedido-section');
    for(let i=0;i<Math.min(until,3);i++){
      const invalid=sections[i]?.querySelector('input:invalid,select:invalid,textarea:invalid') as HTMLInputElement;
      if(invalid){_updatePedidoStep(i+1);invalid.reportValidity();return false;}
    }
    if(until>=2 && !(Number(document.getElementById('pedidoCosto')?.value)>0)){_updatePedidoStep(2);const error=document.getElementById('pos-pedido-error');if(error)error.textContent='Agrega productos o un precio personalizado mayor a cero.';return false;}
    return true;
}
function posPedidoIr(step:any){const n=Number(step);if(n>posPedidoPaso&&!posPedidoValidar(n-1))return;_updatePedidoStep(n);(document.querySelector('#pedido-steps [aria-current]') as HTMLElement)?.focus();}
function posPedidoAnterior(){posPedidoIr(posPedidoPaso-1);}
function posPedidoSiguiente(){posPedidoIr(posPedidoPaso+1);}
function posPedidoGuardar(){if(!posPedidoValidar(3))return;const missing=window.pedidoResumenAntesDeGuardar?.().missing||[];if(missing.length){posPedidoResumen();const error=document.getElementById('pos-pedido-error');if(error)error.textContent=`Corrige antes de guardar: ${missing.join(', ')}.`;return;}document.getElementById('pedidoForm')?.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}
(window as any)._updatePedidoStep=_updatePedidoStep;

// ── Template chips para el campo de notas ──────────────────────────────────
function pedidoInsertarTemplate(texto) {
    // MEJORA 2: insertar en el campo con foco activo (notas o notasInternas)
    const taInternas = document.getElementById('pedidoNotasInternas');
    const taNormal = document.getElementById('pedidoNotas');
    // Detectar cuál textarea tiene el foco o fue el último activo
    const ta = (taInternas && document.activeElement === taInternas) ? taInternas : taNormal;
    if (!ta) return;
    const actual = ta.value.trim();
    ta.value = actual ? actual + '\n' + texto : texto;
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
}
window.pedidoInsertarTemplate = pedidoInsertarTemplate;

function renderPedidosTable() {
    normalizarResta();
    updatePedidosStats();
    // PERF: solo renderizar la vista activa en lugar de todas
    // SAFE-01: try/catch en cada render para evitar que un error en una vista rompa todo
    const vista = _pedidoVistaActual || 'kanban';
    if (vista === 'kanban')      { try { renderKanbanBoard(); } catch(e) { console.error('[Kanban]', e); } }
    else if (vista === 'tabla')  { try { renderTablaPedidos(); } catch(e) { console.error('[TablaPedidos]', e); } }
    else if (vista === 'calendario' && typeof renderCalendarioPedidos === 'function') { try { renderCalendarioPedidos(); } catch(e) { console.error('[Calendario]', e); } }
    // Historial siempre es ligero (contenedor oculto salvo que esté visible)
    const histPanel = document.getElementById('vistaHistorial');
    if (histPanel && !histPanel.classList.contains('hidden')) { try { renderHistorialPedidos(); } catch(e) { console.error('[Historial]', e); } }
    if (typeof checkAlertasEntregas === 'function') { try { checkAlertasEntregas(); } catch(e) { console.error('[AlertasEntregas]', e); } }
    if (typeof checkAlertasCobro === 'function') { try { checkAlertasCobro(); } catch(e) { console.error('[AlertasCobro]', e); } }
    // Refresh production list if visible
    const panel = document.getElementById('listaProduccionPanel');
    if (panel && !panel.classList.contains('hidden')) { try { renderListaProduccion(); } catch(e) { console.error('[ListaProduccion]', e); } }
}

function updatePedidosStats() {
    const lista = window.pedidos || [];
    // BUG-S06 FIX: excluir cancelados — no representan dinero real por cobrar
    const activos = lista.filter(p => p.status !== 'cancelado');
    const porCobrar = activos.reduce((s, p) => s + calcSaldoPendiente(p), 0);
    const anticipos = activos.reduce((s, p) => s + (Number(p.anticipo) || 0), 0);
    const mesActual = new Date().getMonth();
    const mesYear = new Date().getFullYear();
    const esMes = activos.filter(p => {
        const fechaStr = p.fechaCreacion || p.fechaPedido || '';
        if (!fechaStr) return false;
        const mesStr = `${mesYear}-${String(mesActual+1).padStart(2,'0')}`;
        return fechaStr.startsWith(mesStr);
    }).length;
    const elActivos = document.getElementById('pedidosActivos');
    const elCobrar = document.getElementById('pedidosPorCobrar');
    const elAnticipo = document.getElementById('pedidosAnticipos');
    const elMes = document.getElementById('pedidosMes');
    if (elActivos) elActivos.textContent = String(activos.length);
    if (elCobrar) elCobrar.textContent = fmtMoney(porCobrar);
    if (elAnticipo) elAnticipo.textContent = fmtMoney(anticipos);
    if (elMes) elMes.textContent = String(esMes);
    // Actualizar badge de count en el header de la sección
    const elBadge = document.getElementById('pedidosCountBadge');
    if (elBadge) elBadge.textContent = String(activos.length);
}

// ── Render Kanban ──
// ── NTH-03: Filtro kanban por urgencia ──────────────────────────────────────
let _kanbanUrgenciaFiltro = 'todos'; // 'todos' | 'hoy' | 'pronto' | 'vencido'
const _kanbanExpandidos = new Set<string>(); // columnas con "ver más" expandidas
const _KANBAN_PAGE = 10;

function setKanbanUrgencia(filtro, btn) {
    _kanbanUrgenciaFiltro = filtro;
    _kanbanExpandidos.clear();
    document.querySelectorAll('.btn-kanban-urgencia').forEach(b => {
        b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    if (btn) { btn.style.background = '#FFD166'; btn.style.color = 'white'; btn.style.borderColor = '#FFD166'; }
    renderKanbanBoard();
}
window.setKanbanUrgencia = setKanbanUrgencia;

// ── Filtro por ocasión en kanban ──────────────────────────────────────────────
let _kanbanOcasionFiltro = '';
function setKanbanOcasion(ocasion: string, btn?: HTMLElement) {
    _kanbanOcasionFiltro = ocasion;
    _kanbanExpandidos.clear();
    document.querySelectorAll('.btn-kanban-ocasion').forEach((b: any) => {
        b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
    });
    if (btn) { btn.style.background = '#9669c4'; btn.style.color = 'white'; btn.style.borderColor = '#9669c4'; }
    renderKanbanBoard();
}
(window as any).setKanbanOcasion = setKanbanOcasion;

let _kanbanFocusMode = false;
function toggleKanbanFocus() {
    _kanbanFocusMode = !_kanbanFocusMode;
    const sidebar = document.getElementById('sidebar');
    const main    = document.querySelector('main') as HTMLElement | null;
    const searchBar = document.getElementById('global-search-bar') as HTMLElement | null;
    const btn     = document.getElementById('btnKanbanFocus');
    if (sidebar)   { sidebar.style.transform   = _kanbanFocusMode ? 'translateX(-100%)' : ''; }
    if (main)      { main.style.marginLeft      = _kanbanFocusMode ? '0' : ''; }
    if (searchBar) { searchBar.style.marginLeft = _kanbanFocusMode ? '0' : ''; }
    if (btn) {
        btn.title = _kanbanFocusMode ? 'Salir del modo focus' : 'Modo focus (ocultar sidebar)';
        btn.style.background = _kanbanFocusMode ? '#FFD166' : '';
        btn.style.color      = _kanbanFocusMode ? 'white'   : '';
    }
}
window.toggleKanbanFocus = toggleKanbanFocus;

function renderKanbanBoard() {
    // C18: skeleton mientras carga el kanban por primera vez
    const cols = ['confirmado','pago','produccion','envio','salida','retirar'];
    cols.forEach(col => {
        const el = document.getElementById('kCol-' + col);
        if (el && !el.children.length && typeof (window as any)._mkSkeletonRows === 'function') {
            el.innerHTML = `<div class="mk-table-skeleton" style="height:80px;margin:8px;border-radius:8px;opacity:0.5;"></div>`;
        }
    });
    const buscar = (document.getElementById('kanbanBuscar') || {}).value || '';
    const q = buscar.toLowerCase().trim();
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    let lista = window.pedidos || [];

    const hoyStr=_fechaHoy();
    lista=lista.filter(p=>!_kanbanOcasionFiltro||(p.ocasion||'')===_kanbanOcasionFiltro);
    lista=lista.filter(p=>posBusquedaCoincide(q,[p.folio,p.cliente,p.clienteNombre,p.telefono,p.concepto,p.notas,p.notasInternas,...(p.productosInventario||[]).map(i=>i.name||i.nombre)].join(' ')));
    const filtros=document.getElementById('pos-kanban-filtros');
    if(filtros)filtros.innerHTML=[['todos','Todos'],['hoy','Para hoy'],['vencido','Vencidos'],['saldo','Saldo pendiente'],['pronto','Próximos']].map(([key,label])=>`<button type="button" class="mk-toolbar-btn" data-action="setKanbanUrgencia" data-arg="${key}" aria-pressed="${_kanbanUrgenciaFiltro===key}">${label} <span>${posFiltrarPedidosRapidos(lista,key,hoyStr).length}</span></button>`).join('');
    lista=posFiltrarPedidosRapidos(lista,_kanbanUrgenciaFiltro,hoyStr);

    // P1: pre-computar saldo de todos los pedidos una sola vez evita llamar calcSaldoPendiente
    // O(n) en cada card + O(n) en los totales de columna = O(2n) → O(n)
    const _saldoPreMap: Map<string, number> = new Map();
    if (typeof calcSaldoPendiente === 'function') {
        (lista || []).forEach((p: any) => _saldoPreMap.set(String(p.id), Number(calcSaldoPendiente(p)) || 0));
    }
    (window as any)._kSaldoPreMap = _saldoPreMap;

    let totalVisible = 0;
    cols.forEach(col => {
        const el = document.getElementById('kCol-' + col);
        const badge = document.getElementById('kBadge-' + col);
        if (!el) return;
        const items = lista.filter(p => (p.status||'').toLowerCase() === col);
        totalVisible += items.length;
        if (badge) {
            badge.textContent = String(items.length);
            // N-KANBAN-003: badge de conteo con estilo consistente en todas las columnas
            badge.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:.7rem;font-weight:800;background:rgba(255,255,255,0.6);border-radius:9999px;margin-left:6px;color:inherit;';
        }
        // Op5: totales en vivo por columna — usar Map pre-computado (P1)
        const _totCol = items.reduce((s, p) => s + (Number(p.total) || 0), 0);
        const _saldoCol = items.reduce((s, p) => s + ((window as any)._kSaldoPreMap?.get(String(p.id)) ?? (typeof calcSaldoPendiente === 'function' ? (Number(calcSaldoPendiente(p)) || 0) : 0)), 0);
        let totEl = document.getElementById('kTotal-' + col);
        if (!totEl && el.parentElement) {
            totEl = document.createElement('div');
            totEl.id = 'kTotal-' + col;
            totEl.className = 'mk-kanban-col-total';
            totEl.style.cssText = 'padding:0 8px 6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
            el.parentElement.insertBefore(totEl, el);
        }
        if (totEl) {
            const _fmt = typeof fmtMoney === 'function' ? fmtMoney : (v: number) => '$' + v.toLocaleString('es-MX');
            totEl.innerHTML = items.length
                ? `<span>${_fmt(_totCol)}</span>` +
                  (_saldoCol > 0.5 ? `<span style="color:#dc2626;">⏳ ${_fmt(_saldoCol)}</span>` : '')
                : '';
        }
        const expandido = _kanbanExpandidos.has(col);
        const visibles = expandido ? items : items.slice(0, _KANBAN_PAGE);
        const restantes = items.length - _KANBAN_PAGE;

        // N-KANBAN-002: agrupar cards por urgencia dentro de la columna
        function _kanbanGrupoHeader(label: string, n: number, color: string): string {
            return `<div style="font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:${color};padding:3px 8px 2px;margin:6px 0 3px;border-left:2.5px solid ${color};">${label} (${n})</div>`;
        }
        function _buildKanbanGrupos(cards: any[]): string {
            const urgentes: any[] = [], proximos: any[] = [], normales: any[] = [];
            const _hoyGrp = new Date(); _hoyGrp.setHours(0,0,0,0);
            cards.forEach(p => {
                const dias = (typeof window.diasHastaEntrega === 'function') ? window.diasHastaEntrega(p.entrega) : (p.entrega ? Math.round((new Date(p.entrega + 'T00:00:00').getTime() - _hoyGrp.getTime()) / 86400000) : null);
                if (dias !== null && (dias === 0 || dias === 1)) urgentes.push(p);
                else if (dias !== null && dias >= 2 && dias <= 4) proximos.push(p);
                else normales.push(p);
            });
            let html = '';
            if (urgentes.length) html += _kanbanGrupoHeader('Urgente', urgentes.length, '#dc2626') + urgentes.map(p => kanbanCardHTML(p)).join('');
            if (proximos.length) html += _kanbanGrupoHeader('Próximo', proximos.length, '#f97316') + proximos.map(p => kanbanCardHTML(p)).join('');
            if (normales.length) html += _kanbanGrupoHeader('Normal', normales.length, '#6b7280') + normales.map(p => kanbanCardHTML(p)).join('');
            return html;
        }

        // H46: colapsar columnas vacías (sin pedidos y sin filtro activo)
        const colWrapper = el.closest('[data-kanban-col]') || el.parentElement;
        if (colWrapper) {
            const isEmpty = items.length === 0 && !q && _kanbanUrgenciaFiltro === 'todos';
            colWrapper.style.transition = 'max-width 0.25s ease, opacity 0.25s ease';
            colWrapper.style.maxWidth = isEmpty ? '48px' : '';
            colWrapper.style.opacity = isEmpty ? '0.45' : '';
            colWrapper.style.overflow = isEmpty ? 'hidden' : '';
            const header = colWrapper.querySelector('[class*="kanban-header"],[class*="col-header"],h3,h4');
            if (header) (header as HTMLElement).title = isEmpty ? 'Sin pedidos — click para expandir' : '';
        }
        el.innerHTML = items.length === 0
            ? `<div style="text-align:center;padding:24px 10px;color:#d1d5db;">
                   <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="margin:0 auto 8px;display:block;">
                       <rect x="7" y="7" width="22" height="5" rx="2.5" fill="currentColor"/>
                       <rect x="7" y="16" width="22" height="5" rx="2.5" fill="currentColor" opacity=".5"/>
                       <rect x="7" y="25" width="14" height="5" rx="2.5" fill="currentColor" opacity=".25"/>
                   </svg>
                   <p style="font-size:.72rem;color:#9ca3af;">${q || _kanbanUrgenciaFiltro !== 'todos' ? 'Sin resultados' : 'Sin pedidos'}</p>
               </div>`
            : _buildKanbanGrupos(visibles)
              + (!expandido && restantes > 0
                  ? `<button data-col="${col}" onclick="window._kanbanVerMas(this.dataset.col)"
                       class="w-full mt-2 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors">
                       ↓ Ver ${restantes} más
                     </button>`
                  : '');
    });

    // Mensaje global cuando el filtro no encuentra nada en ninguna columna
    const _noResultsBanner = document.getElementById('kanbanNoResults');
    if (_noResultsBanner) {
        _noResultsBanner.style.display = (totalVisible === 0 && (q || _kanbanUrgenciaFiltro !== 'todos')) ? 'block' : 'none';
        _noResultsBanner.textContent = q
            ? `Sin pedidos que coincidan con "${q}"`
            : 'Sin pedidos con este filtro de urgencia';
    }
    // N2: inicializar swipe touch en mobile (una sola vez por contenedor)
    if (typeof (window as any)._initKanbanTouchSwipe === 'function') (window as any)._initKanbanTouchSwipe();
}

window._kanbanVerMas = function(col: string) {
    _kanbanExpandidos.add(col);
    renderKanbanBoard();
};

// N-KANBAN-004: quick-edit de fecha de entrega con doble-clic en la card
(window as any)._kanbanQuickEditFecha = function(event: MouseEvent, pedidoId: string) {
    const span = event.currentTarget as HTMLElement || event.target as HTMLElement;
    if (!span) return;
    const textoOriginal = span.textContent || '';
    // Obtener fecha actual del pedido
    const pedido = (window.pedidos || []).find((p: any) => String(p.id) === String(pedidoId));
    const fechaActual = pedido ? (pedido.entrega || '') : '';
    let _cambiado = false;

    const input = document.createElement('input');
    input.type = 'date';
    input.value = fechaActual;
    input.style.cssText = 'font-size:.72rem;border:1.5px solid #FFD166;border-radius:6px;padding:2px 6px;background:#fffbf5;outline:none;';

    span.textContent = '';
    span.appendChild(input);
    input.focus();

    input.addEventListener('change', async function() {
        _cambiado = true;
        const newDate = input.value;
        const p = (window.pedidos || []).find((x: any) => String(x.id) === String(pedidoId));
        if (p) {
            p.entrega = newDate;
            if (typeof savePedidos === 'function') await savePedidos();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
        }
        if (typeof (window as any).manekiToastExport === 'function') (window as any).manekiToastExport('✅ Fecha actualizada', 'ok');
    });

    input.addEventListener('blur', function() {
        if (!_cambiado) {
            span.innerHTML = '';
            span.textContent = textoOriginal;
        }
    });

    input.addEventListener('keydown', function(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            _cambiado = false;
            span.innerHTML = '';
            span.textContent = textoOriginal;
            input.blur();
        }
    });
};

const _statusLabel = s => ({confirmado:'✅ Confirmado',pago:'💰 Pagado',produccion:'🔧 Producción',envio:'📦 Envío',salida:'🚚 Salió',retirar:'🏪 Retirar',finalizado:'🎉 Listo',cancelado:'❌ Cancelado'})[s] || s;

function kanbanCardHTML(p) {
 const e=_esc,id=e(String(p.id)),saldo=(window as any)._kSaldoPreMap?.get(String(p.id))??calcSaldoPendiente(p);
 const hoy=_fechaHoy(),vencido=!!p.entrega&&p.entrega<hoy,urgente=p.entrega===hoy;
 const productos=p.concepto||(p.productosInventario||[]).map(i=>`${i.quantity||1} × ${i.name||i.nombre||'Producto'}${i.variante?' · '+i.variante:''}`).join(', ')||'Pedido personalizado';
 const nota=String(p.notas||'').trim(),interna=String(p.notasInternas||'').trim();
 const action=(fn:string,label:string,kind='')=>`<button type="button" data-action="${fn}" data-arg="${id}" class="mk-mini-btn ${kind}">${label}</button>`;
 const selected=window._kanbanSeleccionados?.has(String(p.id));
 return `<div class="kanban-card pos-kanban-card pos-kanban-${_kanbanCompacto}" data-arg="${id}" data-kanban-open="${id}" tabindex="0" aria-label="Abrir ficha del pedido ${e(p.folio||p.id)}" data-status="${e(p.status||'confirmado')}" draggable="true" ondragstart="kanbanDragStart(event,this.dataset.id)" ondragend="kanbanDragEnd(event)">
 <div class="pos-kanban-heading"><span>${e(p.folio||'Pedido')}</span><input type="checkbox" class="_kanban-check" ${selected?'checked':''} aria-label="Seleccionar para acción en lote" onclick="event.stopPropagation()" onchange="_toggleKanbanSelect(this.closest('[data-id]').dataset.id,this.checked)"></div>
 <p class="pos-kanban-client">${e(p.cliente||p.clienteNombre||'Sin cliente')}</p>
 <p class="pos-kanban-product">${e(productos)}</p>
 <div class="pos-kanban-meta"><span class="${vencido?'pos-kanban-overdue':urgente?'pos-kanban-today':''}">Entrega ${e(p.entrega||'Sin fecha')}${vencido?' · Vencido':urgente?' · Hoy':''}</span><strong>${saldo>0?'Saldo '+fmtMoney(saldo):'Liquidado'}</strong></div>
 ${p.prioridad==='alta'?'<span class="pos-kanban-priority">Prioridad alta</span>':''}
 ${nota?`<p class="pos-kanban-note" title="${e(nota)}">Nota: ${e(nota)}</p>`:''}
 ${interna?`<p class="pos-kanban-note" title="${e(interna)}">Interna: ${e(interna)}</p>`:''}
 <div class="pos-kanban-actions">${action('openPedidoStatusModal','Estado')}${action('posEditarPedidoRapido','Editar rápido')}${action('openAbonoPedido','Abono','success')}</div>
 <details class="pos-kanban-more"><summary>Más acciones</summary><div>
 ${action('openPedidoModal','Editar completo')}${action('abrirWhatsAppPedido','WhatsApp')}${action('abrirFotoReferencia','Fotos de referencia')}${action('duplicarPedido','Duplicar')}${action('generarTicketPedido','Imprimir ticket')}${action('exportarPedidoPDF','Descargar PDF')}${action('imprimirEtiquetaPedido','Etiqueta')}${action('eliminarPedido','Eliminar','danger')}
 </div></details></div>`;
}

// La tarjeta abre la ficha sin interceptar sus acciones, selección ni arrastre.
document.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    const card = target.closest<HTMLElement>('[data-kanban-open]');
    if (!card || target.closest('button,a,input,select,textarea,summary,[contenteditable]')) return;
    if (typeof posAbrirFicha === 'function') posAbrirFicha(card.dataset.kanbanOpen);
});
document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target as HTMLElement;
    if (!card.matches?.('[data-kanban-open]')) return;
    event.preventDefault();
    if (typeof posAbrirFicha === 'function') posAbrirFicha(card.dataset.kanbanOpen);
});

// ── Render Tabla ──
// Paginación para tabla de pedidos activos
let _pedidosTablePage = 1;
const _PEDIDOS_PER_PAGE = 25;

function _inyectarBuscadorTabla() {
    if (document.getElementById('tablaPedidosBuscar')) return;
    const tabla = document.getElementById('vistaTabla');
    if (!tabla) return;
    const bar = document.createElement('div');
    bar.id = 'tablaBuscadorBar';
    bar.className='pos-workbar';
    bar.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;';
    bar.innerHTML = `
        <div style="flex:1;min-width:200px;position:relative;">
            <input id="tablaPedidosBuscar" type="text" placeholder="🔍 Buscar por cliente, folio, concepto..."
                style="width:100%;padding:10px 14px 10px 36px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:.85rem;outline:none;background:#fff;"
                data-oninput="_pedidosResetPageAndRender">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:.85rem;opacity:.4;">🔎</span>
        </div>
        <select id="tablaFiltroPago" data-change="_pedidosResetPageAndRender"
            style="padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.8rem;background:#fff;cursor:pointer;">
            <option value="">💰 Pago: Todos</option>
            <option value="liquidado">✅ Liquidado</option>
            <option value="anticipo">🟡 Con anticipo</option>
            <option value="pendiente">🔴 Pendiente</option>
        </select>
        <select id="tablaFiltroUrgencia" data-change="_pedidosResetPageAndRender"
            style="padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:.8rem;background:#fff;cursor:pointer;">
            <option value="">📅 Entrega: Todas</option>
            <option value="hoy">🔴 Hoy</option>
            <option value="semana">🟡 Esta semana</option>
            <option value="vencido">⚫ Vencido</option>
        </select>`;
    const tools=document.createElement('div');tools.className='pos-table-tools';
    tools.innerHTML=`<button class="mk-btn-primary" data-action="openPedidoModal">Nuevo pedido</button><div class="mk-density-toggle" aria-label="Densidad de pedidos"><button data-density="comfortable" data-action="mkToggleDensidad" data-arg="comfortable">Cómodo</button><button data-density="compact" data-action="mkToggleDensidad" data-arg="compact">Compacto</button></div><details id="posTablaColumnas"><summary>Columnas</summary><div>${Object.entries(posTablaOpcionales).map(([key,label])=>`<label><input type="checkbox" value="${key}" data-change="posTablaCambiarColumna" data-pass-el="before"> ${label}</label>`).join('')}</div></details>`;
    bar.appendChild(tools);tabla.prepend(bar);posTablaAplicarColumnas();if(typeof mkAplicarDensidad==='function')mkAplicarDensidad();
}

// P3: menú "···" compacto en tabla — abre dropdown con acciones secundarias
function _mkTblMenu(btn: HTMLElement, id: string) {
    const _existing = document.getElementById('_mkTblMenuDrop');
    if (_existing) { _existing.remove(); if (_existing.dataset.id === id) return; }
    const _e = _esc;
    const menu = document.createElement('div');
    menu.id = '_mkTblMenuDrop';
    menu.dataset.id = id;
    menu.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:160px;overflow:hidden;font-size:.78rem;';
    menu.innerHTML = `<button class="mk-mini-btn" data-action="posAbrirComercial" data-arg="${_e(id)}">Apartado y tiempo</button>
        <button onclick="openPedidoModal('${_e(id)}');document.getElementById('_mkTblMenuDrop')?.remove()" style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:#374151;text-align:left;" onmouseover="this.style.background='#fef9f0'" onmouseout="this.style.background='none'">✏️ Editar pedido</button>
        <button onclick="exportarPedidoPDF('${_e(id)}');document.getElementById('_mkTblMenuDrop')?.remove()" style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:#1d4ed8;text-align:left;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='none'">📄 Descargar PDF</button>
        <button onclick="duplicarPedido('${_e(id)}');document.getElementById('_mkTblMenuDrop')?.remove()" style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:#9669c4;text-align:left;" onmouseover="this.style.background='#f5f3ff'" onmouseout="this.style.background='none'">⧉ Duplicar</button>
        <hr style="margin:4px 0;border:none;border-top:1px solid #f3f4f6;">
        <button onclick="eliminarPedido('${_e(id)}');document.getElementById('_mkTblMenuDrop')?.remove()" style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;cursor:pointer;color:#dc2626;text-align:left;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">🗑 Eliminar</button>
    `;
    document.body.appendChild(menu);
    const rect = btn.getBoundingClientRect();
    const menuW = 190, menuH = 205;
    menu.style.top  = Math.max(8,Math.min(rect.bottom + 4,window.innerHeight-menuH-8)) + 'px';
    menu.style.left = Math.min(rect.left, window.innerWidth - menuW - 8) + 'px';
    setTimeout(() => document.addEventListener('click', function _close(e) {
        if (!menu.contains(e.target as Node)) { menu.remove(); document.removeEventListener('click', _close); }
    }), 0);
}
window._mkTblMenu = _mkTblMenu;

function renderTablaPedidos() {
    _inyectarBuscadorTabla();
    const tbody = document.getElementById('pedidosTable');
    if (!tbody) return;
    // P7: saltar cómputo de hash si la vista activa es kanban (evita trabajo innecesario)
    if ((_pedidoVistaActual || 'kanban') === 'kanban') return;
    // P1: hash guard — saltar re-render si los datos no cambiaron (incluye valores de filtros activos)
    const _qHash = ((document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null)?.value || '') + ((document.getElementById('tablaFiltroPago') as HTMLSelectElement|null)?.value || '') + ((document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null)?.value || '') + ((document.getElementById('pedidoFechaDesde') as HTMLInputElement|null)?.value || '') + ((document.getElementById('pedidoFechaHasta') as HTMLInputElement|null)?.value || '');
    const _tHash = JSON.stringify((window.pedidos||[]).map(p=>[p.id,p.folio,p.cliente,p.concepto,p.entrega,p.fechaPedido,p.fecha,p.status,p.total,p.anticipo,p.resta,p.pagos,p.telefono,p.lugarEntrega,p.posDetalle])) + '_' + (_pedidoFiltroActivo||'') + '_' + (_pedidoVistaActual||'') + '_' + _qHash + '_' + String(window.posTablaSelectedId||'');
    if ((tbody as any)._lastHash === _tHash) return;
    (tbody as any)._lastHash = _tHash;
    const q = ((document.getElementById('tablaPedidosBuscar') || document.getElementById('kanbanBuscar') || {}).value || '').toLowerCase().trim();
    // BUG-PED-03 FIX: comparación case-insensitive para status — Realtime puede traer
    // valores con distinto case (ej: 'Confirmado' vs 'confirmado') que causarían filtros vacíos.
    let lista = _pedidoFiltroActivo === 'todos'
        ? [...(window.pedidos || [])].reverse()
        : (window.pedidos || []).filter(p => (p.status||'').toLowerCase() === _pedidoFiltroActivo.toLowerCase()).reverse();
    if (q) {
        const _nsTabla = window._normSearch || (s => String(s||'').toLowerCase());
        const qN = _nsTabla(q);
        lista = lista.filter(p =>
            _nsTabla(p.cliente||'').includes(qN) ||
            _nsTabla(p.folio||'').includes(qN) ||
            _nsTabla(p.concepto||'').includes(qN) ||
            (p.telefono||'').includes(q) ||
            (p.whatsapp||'').includes(q)
        );
        _pedidosTablePage = 1;
    }
    // Filtro de pago
    const _fp = (document.getElementById('tablaFiltroPago')||{}).value || '';
    if (_fp) {
        lista = lista.filter(p => {
            const _r = calcSaldoPendiente(p);
            const _a = (p.pagos||[]).reduce((s,ab)=>s+Number(ab.monto||0),0) || Number(p.anticipo||0);
            if (_fp==='liquidado') return _r <= 0;
            if (_fp==='anticipo')  return _r > 0 && _a > 0;
            if (_fp==='pendiente') return _r > 0 && _a <= 0;
            return true;
        });
    }
    // Filtro de urgencia de entrega
    const _fu = (document.getElementById('tablaFiltroUrgencia')||{}).value || '';
    if (_fu) {
        const _hoyMs = new Date(); _hoyMs.setHours(0,0,0,0);
        const _fin7 = new Date(_hoyMs); _fin7.setDate(_fin7.getDate()+7);
        lista = lista.filter(p => {
            if (!p.entrega) return _fu==='vencido';
            const [yy,mm,dd] = p.entrega.split('-').map(Number);
            const fe = new Date(yy,mm-1,dd); fe.setHours(0,0,0,0);
            if (_fu==='hoy')    return fe.getTime()===_hoyMs.getTime();
            if (_fu==='semana') return fe>=_hoyMs && fe<=_fin7;
            if (_fu==='vencido') return fe<_hoyMs;
            return true;
        });
    }
    const desde = document.getElementById('pedidoFechaDesde')?.value || '';
    const hasta = document.getElementById('pedidoFechaHasta')?.value || '';
    if (desde || hasta) {
        lista = lista.filter(p => {
            const fe = p.entrega || '';
            if (desde && fe < desde) return false;
            if (hasta && fe > hasta) return false;
            return true;
        });
        _pedidosTablePage = 1;
    }
    const totalItems = lista.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / _PEDIDOS_PER_PAGE));
    if (_pedidosTablePage > totalPages) _pedidosTablePage = totalPages;
    const start = (_pedidosTablePage - 1) * _PEDIDOS_PER_PAGE;
    const page = lista.slice(start, start + _PEDIDOS_PER_PAGE);
    // R3-S31: mismos colores que columnas del kanban y pills de filtro — icono en vez de emoji
    const statusLabel = {
        confirmado: '<span class="mk-status-pill" style="--pill-c:#374151;--pill-bg:#F3F4F6;"><i class="fas fa-check"></i> Confirmado</span>',
        pago:       '<span class="mk-status-pill" style="--pill-c:#065f46;--pill-bg:#D1FAE5;"><i class="fas fa-dollar-sign"></i> Pago</span>',
        produccion: '<span class="mk-status-pill" style="--pill-c:#1e40af;--pill-bg:#DBEAFE;"><i class="fas fa-wrench"></i> Producción</span>',
        envio:      '<span class="mk-status-pill" style="--pill-c:#7d4fa3;--pill-bg:#ecd9ff;"><i class="fas fa-box"></i> Envío</span>',
        salida:     '<span class="mk-status-pill" style="--pill-c:#9a3412;--pill-bg:#FFEDD5;"><i class="fas fa-truck"></i> Salió</span>',
        retirar:    '<span class="mk-status-pill" style="--pill-c:#134e4a;--pill-bg:#CCFBF1;"><i class="fas fa-store"></i> Retirar</span>',
    };
    const _et = _esc;
    // N-EMPTY-002: empty states con y sin filtros activos
    const _hayFiltros = q || _fp || _fu || desde || hasta || _pedidoFiltroActivo !== 'todos';
    if (page.length === 0) {
        if (_hayFiltros) {
            tbody.innerHTML = `<tr><td colspan="99" class="text-center py-12">
                <div class="text-4xl mb-2">🔍</div>
                <p class="font-medium text-gray-500">Sin pedidos con esos filtros</p>
                <button onclick="window._limpiarTodosFiltros?.()" class="mt-3 text-xs text-amber-600 underline">Limpiar filtros</button>
            </td></tr>`;
        } else {
            tbody.innerHTML = `<tr><td colspan="99" class="text-center py-14">
                <div class="text-5xl mb-3">📋</div>
                <p class="text-lg font-medium text-gray-500">Sin pedidos registrados</p>
                <p class="text-sm text-gray-400 mb-4">Crea el primer pedido para empezar</p>
                <button onclick="openPedidoModal()" class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">+ Crear primer pedido</button>
            </td></tr>`;
        }
    } else {
    tbody.innerHTML = page.map(p => {
            const fb=String(p.redes||p.facebook||''),fbUrl=fb?(/^https?:\/\//i.test(fb)?fb:'https://facebook.com/'+fb.replace(/^@/,'')):'';
            const id=_et(String(p.id)),saldo=calcSaldoPendiente(p),cobrado=posTotalPagado(p),fecha=posTablaFechaEntrega(p.entrega);
            return `<tr data-table-open="${id}" class="pos-order-row${String(window.posTablaSelectedId)===String(p.id)?' pos-order-selected':''}">
            <td data-column="folio"><small class="pos-order-folio">${_et(p.folio)||'—'}</small></td>
            <td class="pos-order-identity"><button class="pos-order-open" data-action="posTablaAbrirFicha" data-arg="${id}" aria-label="Abrir ficha de ${_et(p.folio||p.cliente)}"><strong>${_et(p.cliente)||'Sin cliente'}</strong></button><p>${_et(p.concepto)||'Sin descripción'}</p>${p.posDetalle?.apartado?.activo?'<small class="pos-promo-badge">Piezas apartadas</small>':''}</td>
            <td data-column="concepto"><span>${_et(p.lugarEntrega)||'—'}</span>${p.telefono||p.whatsapp?`<button class="mk-mini-btn" data-action="abrirWhatsAppPedido" data-arg="${id}">WhatsApp</button>`:''}${fbUrl?`<a class="mk-mini-btn" href="${_et(fbUrl)}" target="_blank" rel="noopener noreferrer">Facebook</a>`:''}</td>
            <td data-column="creacion"><time>${_et(_fmtFechaCorta((p.fechaPedido||p.fecha||'').split('T')[0].split(' ')[0]))||'—'}</time></td>
            <td data-column="entrega"><span class="pos-order-date" data-state="${fecha.state}">${fecha.label}</span><time datetime="${_et(p.entrega||'')}">${_et(fecha.date)}</time></td>
            <td data-column="cobro"><dl class="pos-order-money"><div><dt>Total</dt><dd>${fmtMoney(Number(p.total)||0)}</dd></div><div><dt>Cobrado</dt><dd>${fmtMoney(cobrado)}</dd></div><div class="pos-order-balance" data-paid="${saldo<=0}"><dt>${saldo<=0?'Pagado':'Saldo'}</dt><dd>${fmtMoney(saldo)}</dd></div></dl></td>
            <td data-column="estado">${statusLabel[(p.status||'').toLowerCase()]||_et(p.status)||'—'}</td>
            <td class="pos-order-actions"><div>
              <button class="mk-mini-btn" data-action="openPedidoModal" data-arg="${id}" aria-label="Editar ${_et(p.folio)}">Editar</button>
              <button class="mk-mini-btn" data-action="openAbonoPedido" data-arg="${id}" aria-label="Abonar ${_et(p.folio)}">Abonar</button>
              <button class="mk-mini-btn" data-action="openPedidoStatusModal" data-arg="${id}" aria-label="Estado de ${_et(p.folio)}">Estado</button>
              <button class="mk-mini-btn" data-action="_mkTblMenu" data-pass-el="before" data-arg="${id}" aria-label="Más acciones de ${_et(p.folio)}" aria-haspopup="true">Más</button>
            </div></td>
        </tr>`;}).join('');
    } // fin del else (page.length > 0)
    posTablaAplicarColumnas();
    // Render pagination controls
    let paginador = document.getElementById('pedidosTablePaginador');
    if (!paginador) {
        paginador = document.createElement('div');
        paginador.id = 'pedidosTablePaginador';
        paginador.className = 'flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500';
        tbody.closest('table')?.parentElement?.appendChild(paginador);
    }
    if (totalPages <= 1) { paginador.innerHTML = `<span>${totalItems} pedido${totalItems!==1?'s':''}</span>`; return; }
    paginador.innerHTML = `
        <span>${totalItems} pedidos · Página ${_pedidosTablePage} de ${totalPages}</span>
        <div class="flex gap-1">
            <button data-action="_pedidosPrevPage" ${_pedidosTablePage===1?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">‹ Anterior</button>
            <button data-action="_pedidosNextPage" data-arg="${totalPages}" ${_pedidosTablePage===totalPages?'disabled':''} class="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Siguiente ›</button>
        </div>`;
    // #11 Totales flotantes
    if (typeof _mkUpdatePedidosTotals === 'function') setTimeout(_mkUpdatePedidosTotals, 50);

    // N-SEARCH-003 + N-SEARCH-005: Renderizar badges de filtros activos + botón limpiar
    _renderFiltrosActivosBadges();
}

function _renderFiltrosActivosBadges() {
    // Leer valores actuales de los inputs de filtro
    const _buscar    = ((document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null)?.value || '').trim();
    const _pago      = ((document.getElementById('tablaFiltroPago') as HTMLSelectElement|null)?.value || '');
    const _urgencia  = ((document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null)?.value || '');
    const _desde     = ((document.getElementById('pedidoFechaDesde') as HTMLInputElement|null)?.value || '');
    const _hasta     = ((document.getElementById('pedidoFechaHasta') as HTMLInputElement|null)?.value || '');
    const _statusFil = _pedidoFiltroActivo !== 'todos' ? _pedidoFiltroActivo : '';

    const filtrosActivos: { label: string; reset: () => void }[] = [];
    if (_buscar)    filtrosActivos.push({ label: `🔍 "${_buscar}"`, reset: () => { const el = document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null; if (el) { el.value = ''; } _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_pago)      filtrosActivos.push({ label: _pago === 'liquidado' ? '✅ Liquidado' : _pago === 'anticipo' ? '🟡 Con anticipo' : '🔴 Pendiente', reset: () => { const el = document.getElementById('tablaFiltroPago') as HTMLSelectElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_urgencia)  filtrosActivos.push({ label: _urgencia === 'hoy' ? '🔴 Hoy' : _urgencia === 'semana' ? '🟡 Esta semana' : '⚫ Vencido', reset: () => { const el = document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_desde)     filtrosActivos.push({ label: `Desde ${_desde}`, reset: () => { const el = document.getElementById('pedidoFechaDesde') as HTMLInputElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_hasta)     filtrosActivos.push({ label: `Hasta ${_hasta}`, reset: () => { const el = document.getElementById('pedidoFechaHasta') as HTMLInputElement|null; if (el) el.value = ''; _pedidosTablePage = 1; renderTablaPedidos(); } });
    if (_statusFil) filtrosActivos.push({ label: `Estado: ${_statusFil}`, reset: () => { filterPedidos('todos', null); } });

    // Buscar o crear el contenedor de badges
    let _badgeContainer = document.getElementById('filtrosActivosBadges');
    if (!_badgeContainer) {
        const _tabla = document.getElementById('vistaTabla');
        const _bar   = document.getElementById('tablaBuscadorBar');
        if (_tabla && _bar) {
            _badgeContainer = document.createElement('div');
            _badgeContainer.id = 'filtrosActivosBadges';
            _badgeContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px;';
            _bar.insertAdjacentElement('afterend', _badgeContainer);
        }
    }
    if (!_badgeContainer) return;

    if (filtrosActivos.length === 0) {
        _badgeContainer.innerHTML = '';
        _badgeContainer.style.display = 'none';
        return;
    }
    _badgeContainer.style.display = 'flex';

    // Renderizar un badge por cada filtro activo + botón limpiar todo
    const _esc2 = _esc;
    _badgeContainer.innerHTML = filtrosActivos.map((f, i) =>
        `<span data-badge-idx="${i}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600;background:#FFF9F0;color:#92622A;border:1px solid #e8d5b0;cursor:pointer;" title="Quitar filtro" data-action="_quitarFiltroBadge" data-arg="${i}">
            ${_esc2(f.label)} <span style="font-size:.7rem;opacity:.7;">✕</span>
        </span>`
    ).join('') +
    `<button data-action="_limpiarTodosFiltros" style="padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;cursor:pointer;">
        ✕ Limpiar filtros
    </button>`;

    // Exponer callbacks globales para los data-action
    (window as any)._quitarFiltroBadge = (idx: any) => {
        const i = typeof idx === 'string' ? parseInt(idx) : idx;
        if (filtrosActivos[i]) filtrosActivos[i].reset();
    };
}

function _pedidosPrevPage() {
    _pedidosTablePage = Math.max(1, _pedidosTablePage - 1);
    renderTablaPedidos();
}
function _pedidosNextPage(totalPages) {
    const pages = parseInt(totalPages as any) || 1;
    _pedidosTablePage = Math.min(pages, _pedidosTablePage + 1);
    renderTablaPedidos();
}
function _pedidosResetPageAndRender() {
    _pedidosTablePage = 1;
    renderTablaPedidos();
}
(window as any)._pedidosPrevPage = _pedidosPrevPage;
(window as any)._pedidosNextPage = _pedidosNextPage;
(window as any)._pedidosResetPageAndRender = _pedidosResetPageAndRender;

(window as any)._limpiarTodosFiltros = function() {
    const _b = document.getElementById('tablaPedidosBuscar') as HTMLInputElement|null;
    const _p = document.getElementById('tablaFiltroPago') as HTMLSelectElement|null;
    const _u = document.getElementById('tablaFiltroUrgencia') as HTMLSelectElement|null;
    const _d = document.getElementById('pedidoFechaDesde') as HTMLInputElement|null;
    const _h = document.getElementById('pedidoFechaHasta') as HTMLInputElement|null;
    if (_b) _b.value = '';
    if (_p) _p.value = '';
    if (_u) _u.value = '';
    if (_d) _d.value = '';
    if (_h) _h.value = '';
    _pedidoFiltroActivo = 'todos';
    _pedidosTablePage = 1;
    // Reflejar en los botones de filtro de status
    document.querySelectorAll('.pedido-filter').forEach((b: any) => {
        b.style.borderColor = '#E5E7EB'; b.style.background = 'white'; b.style.color = '#4B5563';
    });
    renderTablaPedidos();
};

