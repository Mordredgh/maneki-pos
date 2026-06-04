"use strict";(function(){"use strict";const M=`
/* == MODAL CONTENT \u2014 sin glassmorphism blur == */
.modal > div {
    background: rgba(255,255,255,0.97) !important;
    border: 1px solid rgba(255,255,255,0.6) !important;
    box-shadow:
        0 2px 0 rgba(255,255,255,0.75) inset,
        0 32px 80px rgba(21,4,50,0.20),
        0 12px 28px rgba(124,58,237,0.13) !important;
}
body.dark .modal > div {
    background: rgba(14,4,32,0.96) !important;
    border-color: rgba(197,151,59,0.22) !important;
}

/* == TIPOGRAF\xCDA EXPRESIVA \u2014 Cormorant en KPIs grandes == */
.mk-kpi-value,
#dailySales, #netProfit, #accountsReceivable {
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: clamp(1.6rem, 2.5vw, 2.4rem) !important;
    font-weight: 700 !important;
    font-style: normal !important;
    letter-spacing: -0.03em !important;
    line-height: 1.05 !important;
}
.mk-kpi-label {
    font-family: 'Outfit', sans-serif !important;
    font-style: normal !important;
    font-size: 0.7rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    opacity: 0.65 !important;
}

/* == SIDEBAR ACTIVE GLOW == */
.sidebar-item { position: relative !important; overflow: hidden; }
.sidebar-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 15%; height: 70%; width: 3.5px;
    background: linear-gradient(180deg,transparent,#E8B84B 35%,#E8B84B 65%,transparent);
    border-radius: 0 4px 4px 0;
    box-shadow: 0 0 18px rgba(232,184,75,0.85), 0 0 6px rgba(232,184,75,0.5);
    animation: mkSidebarPulse 2.4s ease-in-out infinite;
    pointer-events: none; z-index: 10;
}
.sidebar-item.active::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(232,184,75,0.12) 0%, transparent 70%);
    pointer-events: none;
}
@keyframes mkSidebarPulse {
    0%,100% { opacity: 0.65; box-shadow: 0 0 14px rgba(232,184,75,0.6); }
    50%      { opacity: 1;   box-shadow: 0 0 26px rgba(232,184,75,1), 0 0 10px rgba(232,184,75,0.4); }
}

/* == SECTION MORPH TRANSITION == */
@keyframes mkMorphIn {
    from { opacity:0; transform:translateY(12px) scale(0.988); }
    to   { opacity:1; transform:translateY(0)    scale(1); }
}
section:not(.hidden).active-section {
    animation: mkMorphIn 0.30s cubic-bezier(0.16,1,0.3,1) both;
}

/* == MORPH COLOR OVERLAY == */
#mk-morph-overlay {
    position:fixed;inset:0;z-index:9990;pointer-events:none;
    opacity:0;transition:opacity 0.08s;
}
#mk-morph-overlay.active { opacity:1; animation:mkOverlayAnim 0.38s ease both; }
@keyframes mkOverlayAnim {
    0%   { opacity:0; }
    25%  { opacity:1; }
    75%  { opacity:1; }
    100% { opacity:0; }
}

/* == POS PRODUCT CARDS PREMIUM == */
.product-card {
    background: #fff !important;
    border: 1.5px solid rgba(197,151,59,0.12) !important;
    border-radius: 18px !important;
    box-shadow: 0 2px 8px rgba(21,4,50,0.05), inset 0 1px 0 rgba(255,255,255,0.95) !important;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1) !important;
    overflow: hidden !important;
    padding: 0 !important;
    cursor: pointer;
    display: flex; flex-direction: column;
}
.product-card:hover:not(.mk-out-of-stock) {
    transform: translateY(-5px) scale(1.015) !important;
    border-color: rgba(197,151,59,0.35) !important;
    box-shadow: 0 14px 36px rgba(124,58,237,0.14), 0 5px 14px rgba(197,151,59,0.14) !important;
}
.product-card:active:not(.mk-out-of-stock) {
    transform: scale(0.96) !important; transition-duration:0.08s !important;
}
.mk-pc-img { width:100%;height:110px;overflow:hidden;flex-shrink:0; }
.mk-pc-img img { width:100%;height:100%;object-fit:cover;transition:transform 0.35s ease; }
.product-card:hover .mk-pc-img img { transform:scale(1.07); }
.mk-pc-emoji { width:100%;height:96px;display:flex;align-items:center;justify-content:center;
    font-size:2.6rem;background:linear-gradient(135deg,rgba(124,58,237,0.05),rgba(197,151,59,0.04)); }
.mk-pc-body { padding:10px 12px 12px;flex:1;display:flex;flex-direction:column;gap:4px; }
.mk-pc-name { font-size:0.79rem;font-weight:700;color:#1A0533;line-height:1.3;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
.mk-pc-price { font-family:'Space Grotesk',sans-serif;font-size:1.2rem;
    font-weight:600;font-style:italic;color:#C5973B;margin-top:auto; }
.mk-pc-stock-ok  { font-size:0.65rem;font-weight:700;color:#10B981; }
.mk-pc-stock-low { font-size:0.65rem;font-weight:700;color:#F59E0B; }
.mk-pc-stock-out { font-size:0.65rem;font-weight:700;color:#EF4444; }
.mk-out-of-stock { opacity:0.52;filter:grayscale(25%);cursor:not-allowed !important; }
.mk-pc-tags { display:flex;flex-wrap:wrap;gap:3px;margin-top:2px; }
.mk-pc-tag { background:rgba(232,184,75,0.1);color:#92400e;border:1px solid rgba(197,151,59,0.2);
    font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:99px; }

/* == PARTICLES CANVAS == */
#mk-particles {
    position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.38;
}

/* == CONFETTI CANVAS == */
#mk-confetti {
    position:fixed;inset:0;pointer-events:none;z-index:9999;display:none;
}

/* == SOUND BUTTON == */
#mk-sound-btn {
    position:fixed;bottom:20px;right:20px;z-index:600;
    width:38px;height:38px;border-radius:50%;
    background:rgba(255,255,255,0.88);
    border:1px solid rgba(197,151,59,0.25);
    box-shadow:0 4px 14px rgba(21,4,50,0.1),inset 0 1px 0 rgba(255,255,255,0.85);
    cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;
    transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
#mk-sound-btn:hover { transform:scale(1.15); }
#mk-sound-btn.muted { opacity:0.4; }

/* == META EDITABLE == */
.mk-goal-edit-btn {
    cursor:pointer;font-size:0.65rem;padding:1px 5px;border-radius:6px;
    background:rgba(197,151,59,0.1);color:#92400e;border:1px dashed rgba(197,151,59,0.4);
    transition:background 0.15s;margin-left:6px;font-weight:700;letter-spacing:0.04em;
}
.mk-goal-edit-btn:hover { background:rgba(197,151,59,0.22); }

/* == SKELETON LOADING == */
.mk-skeleton {
    background:linear-gradient(90deg,rgba(197,151,59,0.06) 25%,rgba(197,151,59,0.13) 50%,rgba(197,151,59,0.06) 75%);
    background-size:200% 100%;
    animation:mkSkeletonShimmer 1.6s ease-in-out infinite;
    border-radius:8px;
}
@keyframes mkSkeletonShimmer {
    0%  { background-position:200% 0; }
    100%{ background-position:-200% 0; }
}
`,w=document.createElement("style");w.id="mk-premium-v4",w.textContent=M,document.head.appendChild(w);function z(){if(document.getElementById("mk-particles"))return;const e=document.createElement("canvas");e.id="mk-particles",document.body.insertBefore(e,document.body.firstChild);const t=e.getContext("2d");let o,i;function c(){o=e.width=innerWidth,i=e.height=innerHeight}c(),addEventListener("resize",c);const a=["rgba(197,151,59,OP)","rgba(232,184,75,OP)","rgba(124,58,237,OP)","rgba(168,85,247,OP)"],l=Array.from({length:26},(d,s)=>({x:Math.random(),y:Math.random(),r:Math.random()*2+.7,color:a[s%a.length].replace("OP",(Math.random()*.22+.04).toFixed(2)),vx:(Math.random()-.5)*35e-5,vy:(Math.random()-.5)*35e-5,phase:Math.random()*Math.PI*2}));let r;function n(d){t.clearRect(0,0,o,i),l.forEach((s,L)=>{s.x=(s.x+s.vx+1)%1,s.y=(s.y+s.vy+1)%1,t.globalAlpha=.35+.3*Math.sin(d*.001+s.phase),t.fillStyle=s.color,t.beginPath(),t.arc(s.x*o,s.y*i,s.r,0,Math.PI*2),t.fill()}),t.globalAlpha=1,r=requestAnimationFrame(n)}n(0),document.addEventListener("visibilitychange",()=>{document.hidden?cancelAnimationFrame(r):r=requestAnimationFrame(n)})}z();function F(){if(document.getElementById("mk-confetti"))return;const e=document.createElement("canvas");e.id="mk-confetti",document.body.appendChild(e);const t=e.getContext("2d");function o(){e.width=innerWidth,e.height=innerHeight}o(),addEventListener("resize",o);const i=["#E8B84B","#F5D080","#7C3AED","#A855F7","#10B981","#FF6B9D","#fff"];let c=[],a;window.mkConfetti=function(){window._mkConfettiRaf&&(cancelAnimationFrame(window._mkConfettiRaf),window._mkConfettiRaf=null),e.style.display="block",c=[];for(let l=0;l<88;l++)c.push({x:e.width/2+(Math.random()-.5)*280,y:e.height*.42,vx:(Math.random()-.5)*11,vy:-(Math.random()*13+5),r:Math.random()*5+2.5,rot:Math.random()*360,rotV:(Math.random()-.5)*9,color:i[Math.floor(Math.random()*i.length)],life:1,decay:Math.random()*.017+.009});cancelAnimationFrame(a),(function l(){t.clearRect(0,0,e.width,e.height);let r=!1;c.forEach(n=>{n.x+=n.vx,n.y+=n.vy,n.vy+=.44,n.vx*=.995,n.rot+=n.rotV,n.life-=n.decay,n.life>0&&(r=!0),t.save(),t.globalAlpha=Math.max(0,n.life),t.translate(n.x,n.y),t.rotate(n.rot*Math.PI/180),t.fillStyle=n.color,t.fillRect(-n.r,-n.r/2,n.r*2,n.r),t.restore()}),r?(a=requestAnimationFrame(l),window._mkConfettiRaf=a):(window._mkConfettiRaf=null,t.clearRect(0,0,e.width,e.height),e.style.display="none")})()}}F();const u={_ctx:null,muted:localStorage.getItem("mk_muted")==="1",_ac(){if(!this._ctx)try{this._ctx=new(AudioContext||webkitAudioContext)}catch{}return this._ctx},_play(e,t){const o=this._ac();if(!o)return;const i=()=>e.forEach(([c,a,l,r=.28])=>{const n=o.createOscillator(),d=o.createGain();n.connect(d),d.connect(o.destination),n.type=t,n.frequency.value=c;const s=o.currentTime;d.gain.setValueAtTime(0,s+a),d.gain.linearRampToValueAtTime(r,s+a+.012),d.gain.exponentialRampToValueAtTime(.001,s+a+l),n.start(s+a),n.stop(s+a+l+.05)});o.state==="suspended"?o.resume().then(i):i()},_tone(e,t="sine"){this.muted||this._play(e,t)},tick(){this._tone([[880,0,.08,.22],[1100,.06,.06,.15]])},sale(){this._tone([[523,0,.12,.28],[659,.1,.14,.28],[784,.22,.32,.28]],"triangle")},error(){this._tone([[220,0,.16,.28],[190,.1,.12,.22]])},notify(){this._tone([[880,0,.08,.25],[1108,.09,.09,.22]])},del(){this._tone([[440,0,.08,.22],[330,.06,.1,.18]])},toggle(){this.muted=!this.muted,localStorage.setItem("mk_muted",this.muted?"1":"0");const e=document.getElementById("mk-sound-btn");e&&(e.textContent=this.muted?"\u{1F507}":"\u{1F50A}",e.classList.toggle("muted",this.muted))}};if(window.MKS=u,!document.getElementById("mk-sound-btn")){const e=document.createElement("button");e.id="mk-sound-btn",e.title="Sonidos",e.textContent=u.muted?"\u{1F507}":"\u{1F50A}",u.muted&&e.classList.add("muted"),e.onclick=()=>u.toggle(),document.body.appendChild(e)}let p=document.getElementById("mk-morph-overlay");p||(p=document.createElement("div"),p.id="mk-morph-overlay",document.body.appendChild(p));const y={dashboard:"rgba(124,58,237,0.10)",bienvenida:"rgba(124,58,237,0.10)",pedidos:"rgba(139,92,246,0.09)",inventory:"rgba(16,185,129,0.09)",balance:"rgba(245,158,11,0.09)",clientes:"rgba(255,107,157,0.09)",analisis:"rgba(197,151,59,0.09)",reportes:"rgba(99,102,241,0.09)",configuracion:"rgba(139,92,246,0.09)",categorias:"rgba(249,115,22,0.09)",equipos:"rgba(100,116,139,0.09)",quotes:"rgba(197,151,59,0.09)"};let x="bienvenida";function R(e){const t=y[x]||"rgba(124,58,237,0.08)",o=y[e]||"rgba(124,58,237,0.08)";p.style.background=`linear-gradient(135deg,${t},${o})`,p.classList.remove("active"),requestAnimationFrame(()=>requestAnimationFrame(()=>{p.classList.add("active"),setTimeout(()=>p.classList.remove("active"),420)})),x=e}window._mkMorphTo=R;function k(e,t,o,i){if(!e||isNaN(t))return;const c=performance.now();e.classList.add("mk-count-pop");const a=l=>o==="$"?"$"+l.toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2}):l.toLocaleString("es-MX",{maximumFractionDigits:0});(function l(r){const n=Math.min((r-c)/i,1),d=1-Math.pow(1-n,3);e.textContent=a(t*d),n<1?requestAnimationFrame(l):e.textContent=a(t)})(c)}function v(){[{id:"dailySales",prefix:"$"},{id:"netProfit",prefix:"$"},{id:"accountsReceivable",prefix:"$"},{id:"dashActivePedidos",prefix:""}].forEach(({id:t,prefix:o})=>{const i=document.getElementById(t);if(!i)return;const c=parseFloat((i.textContent||"").replace(/[^0-9.-]/g,""));!isNaN(c)&&c>0&&k(i,c,o,820)}),document.querySelectorAll(".mk-kpi-value").forEach(t=>{const o=parseFloat((t.textContent||"").replace(/[^0-9.-]/g,"")),i=(t.textContent||"").trim().startsWith("$")?"$":"";!isNaN(o)&&o>0&&k(t,o,i,820)})}window._mkAnimateKPIs=v;function E(){const e=document.getElementById("dashMonthGoal");if(!e)return;const t=localStorage.getItem("mk_monthly_goal");t&&!isNaN(parseFloat(t))&&(e.value=parseFloat(t));const o=document.getElementById("dashGoalPercent");if(o&&!document.getElementById("mk-goal-edit")){const i=document.createElement("button");i.id="mk-goal-edit",i.className="mk-goal-edit-btn",i.type="button",i.textContent="\u270E META",i.onclick=()=>{const c=i,a=document.getElementById("dashGoalPercent"),l=e.value||"5000",r=document.createElement("input");r.type="number",r.value=l,r.min="1",r.style.cssText="width:110px;padding:2px 6px;border:1.5px solid #E8B84B;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;",i.style.display="none",i.parentNode.insertBefore(r,i.nextSibling),r.focus(),r.select();const n=()=>{const d=parseFloat(r.value);d>0&&(e.value=d,localStorage.setItem("mk_monthly_goal",d),window.updateDashboard&&window.updateDashboard(),window.manekiToastExport&&manekiToastExport("Meta mensual actualizada: $"+d.toLocaleString("es-MX"),"ok")),r.remove(),i.style.display=""};r.addEventListener("blur",n),r.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),r.blur()),d.key==="Escape"&&(r.removeEventListener("blur",n),r.remove(),i.style.display="")})},o.parentNode.insertBefore(i,o.nextSibling)}}const O=`
self.onmessage = function(ev) {
    var d = ev.data, sh = d.salesHistory||[], period = d.period, orden = d.orden,
        desde = d.desde||'', hasta = d.hasta||'';
    function _fLocal(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
    var today = _fLocal(new Date());
    var fom = today.substring(0,7);
    var d30 = new Date(); d30.setDate(d30.getDate()-30); var s30=_fLocal(d30);
    var d90 = new Date(); d90.setDate(d90.getDate()-90); var s90=_fLocal(d90);
    var filtered = sh.filter(function(s){
        if (!s.date||s.method==='Cancelado') return false;
        if (period==='mes')    return s.date.indexOf(fom)===0;
        if (period==='30')     return s.date>=s30;
        if (period==='90')     return s.date>=s90;
        if (period==='custom') return (!desde||s.date>=desde)&&(!hasta||s.date<=hasta);
        return true;
    });
    var map = {};
    var mpSet = d.mpSet || {};
    filtered.forEach(function(sale){
        if (sale.type === 'abono' || sale.type === 'anticipo') return; // BUG-S11 FIX: anticipos sint\xE9ticos no son ventas
        (sale.products||[]).forEach(function(item){
            var k = String(item.name||item.id||'?');
            if (mpSet[k] || (item.id && mpSet['id:'+String(item.id)])) return;
            if (!map[k]) map[k]={name:item.name||'\u2014',units:0,revenue:0,cost:0};
            var q=Number(item.quantity||1);
            map[k].units+=q;
            map[k].revenue+=Number(item.price||0)*q;
            map[k].cost+=Number(item.costoAlVender||item.cost||0)*q;
        });
        // pedido type with no products[] - use concept
        if (sale.type==='pedido' && !(sale.products||[]).length && (sale.concept||sale.concepto)) {
            var k2 = String(sale.concept||sale.concepto||sale.folio);
            if (!map[k2]) map[k2]={name:k2,units:0,revenue:0,cost:0};
            map[k2].units+=1; map[k2].revenue+=Number(sale.total||0);
        }
    });
    // pedidosFinalizados not already in salesHistory
    var foliosSH = {};
    filtered.forEach(function(s){ if(s.type==='pedido'&&s.folio) foliosSH[s.folio]=true; });
    var pf = d.pedidosFinalizados||[];
    pf.forEach(function(p) {
        var fechaRaw = p.fechaFinalizado||p.fecha||p.fechaPedido||'';
        var fecha = String(fechaRaw).substring(0,10);
        // date filter
        if (period==='mes'    && fecha.indexOf(fom)!==0) return;
        if (period==='30'     && fecha<s30) return;
        if (period==='90'     && fecha<s90) return;
        if (period==='custom' && desde && fecha<desde) return;
        if (period==='custom' && hasta && fecha>hasta) return;
        if (foliosSH[p.folio]) return;
        if ((p.productosInventario||[]).length > 0) {
            p.productosInventario.forEach(function(item) {
                var nombre = item.name||item.nombre||item.concepto||p.concepto||'Producto';
                var k = String(nombre);
                if (mpSet[k] || (item.id && mpSet['id:'+String(item.id)])) return;
                if (!map[k]) map[k]={name:nombre,units:0,revenue:0,cost:0};
                var q=Number(item.quantity||item.cantidad||1);
                map[k].units+=q;
                map[k].revenue+=Number(item.price||item.precio||0)*q;
                map[k].cost+=Number(item.cost||item.costo||0)*q;
            });
        } else {
            var nombre = p.concepto||p.folio||'Pedido encargo';
            var k = String(nombre);
            if (!map[k]) map[k]={name:nombre,units:0,revenue:0,cost:0};
            map[k].units+=1; map[k].revenue+=Number(p.total||0);
        }
    });
    var rows = Object.values(map).map(function(r){
        var gp=r.revenue-r.cost, mg=r.revenue>0?(gp/r.revenue*100):0;
        return {name:r.name,units:r.units,revenue:r.revenue,cost:r.cost,profit:gp,margin:mg};
    });
    rows.sort(function(a,b){
        if (orden==='revenue') return b.revenue-a.revenue;
        if (orden==='margin')  return b.margin-a.margin;
        return b.units-a.units;
    });
    var totRev=rows.reduce(function(s,r){return s+r.revenue;},0);
    var totUn =rows.reduce(function(s,r){return s+r.units;},0);
    var totGp =rows.reduce(function(s,r){return s+r.profit;},0);
    self.postMessage({rows:rows,kpis:{products:rows.length,units:totUn,revenue:totRev,profit:totGp}});
};
`;let h=null;function N(){if(h)return h;try{const e=new Blob([O],{type:"application/javascript"});h=new Worker(URL.createObjectURL(e))}catch{return null}return h}const _=new Set;function S(e,t){const o="section-"+e,i=document.getElementById(o)||document.querySelector('[data-section="'+e+'"]');if(!i)return;const c="__mk_spin_"+e;if(t){if(i.querySelector("#"+c))return;const a=document.createElement("div");if(a.id=c,a.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.7);z-index:99;border-radius:12px;",a.innerHTML='<div style="width:36px;height:36px;border:3px solid #f3f3f3;border-top:3px solid #C9933A;border-radius:50%;animation:mkSpin .7s linear infinite;"></div>',!document.getElementById("mk-spin-style")){const l=document.createElement("style");l.id="mk-spin-style",l.textContent="@keyframes mkSpin{to{transform:rotate(360deg)}}",document.head.appendChild(l)}i.style.position=i.style.position||"relative",i.appendChild(a)}else{const a=i.querySelector("#"+c);a&&a.remove()}}function D(e){if(_.has(e))return;_.add(e);const t=()=>{e==="analisis"&&window.renderAnalisis&&window.renderAnalisis(),e==="reportes"&&window.renderSalesHistory&&window.renderSalesHistory(),e==="clientes"&&window.renderClientsTable&&window.renderClientsTable(),e==="balance"&&window.renderBalance&&window.renderBalance(),e==="quotes"&&window.renderQuotesTable&&window.renderQuotesTable(),(e==="inventory"||e==="inventario"||e==="categorias")&&(window.updateCategorySelects&&window.updateCategorySelects(),window.renderInventoryTable&&window.renderInventoryTable()),e==="pedidos"&&(window.renderPedidosTable&&window.renderPedidosTable(),window.renderKanbanBoard&&window.renderKanbanBoard(),window.renderHistorialPedidos&&window.renderHistorialPedidos())};if(!window._mkLazyLoad||window._mkGrupoListo(e)){(window._mkLazyLoad?window._mkLazyLoad(e):Promise.resolve()).then(()=>setTimeout(t,80));return}S(e,!0),window._mkLazyLoad(e).then(()=>{S(e,!1),setTimeout(t,80)})}window._lazyLoad=D;function A(){const e=document.getElementById("inventorySearch");e&&!e._mkD&&(e._mkD=!0)}function C(){return window.showSection&&(window.showSection._mk4=!0),!0}function I(){if(window.renderAnalisis&&!window.renderAnalisis._mk4){const e=window.renderAnalisis;return window.renderAnalisis=function(){const t=N();if(!t||!window.salesHistory){e.apply(this,arguments);return}const o=document.getElementById("analisisTabla");o&&(o.innerHTML=Array(5).fill(`<tr>${Array(8).fill('<td class="px-6 py-3"><div class="mk-skeleton" style="height:13px;width:75%;"></div></td>').join("")}</tr>`).join(""));const i=window.analisisPeriodoActual||"mes",c=document.getElementById("analisisOrden")?.value||"unidades",a=document.getElementById("analisisDesde")?.value||"",l=document.getElementById("analisisHasta")?.value||"";t.onmessage=function(n){const{rows:d,kpis:s}=n.data;[["analisisKpiProductos",s.products,""],["analisisKpiUnidades",s.units,""],["analisisKpiIngresos",s.revenue,"$"],["analisisKpiGanancia",s.profit,"$"]].forEach(([m,f,g])=>{const b=document.getElementById(m);b&&(b.textContent=g?g+""+Number(f).toFixed(2):f)});const L=s.revenue||1;if(o&&(o.innerHTML=d.slice(0,120).map((m,f)=>{const g=(m.revenue/L*100).toFixed(1),b=m.margin>=40?"text-green-600":m.margin>=20?"text-amber-500":"text-red-500",V=K=>String(K||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<tr class="hover:bg-amber-50 transition-colors">
                        <td class="px-6 py-3 text-gray-400 font-bold text-center">${f+1}</td>
                        <td class="px-6 py-3 font-semibold text-gray-800">${V(m.name)}</td>
                        <td class="px-6 py-3 text-center font-bold text-gray-800">${m.units}</td>
                        <td class="px-6 py-3 text-right font-bold text-gray-800">$${m.revenue.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right text-gray-500">$${m.cost.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right font-bold ${m.profit>=0?"text-green-600":"text-red-600"}">$${m.profit.toFixed(2)}</td>
                        <td class="px-6 py-3 text-center font-semibold ${b}">${m.margin.toFixed(0)}%</td>
                        <td class="px-6 py-3">
                            <div style="display:flex;align-items:center;gap:6px;">
                                <div style="flex:1;height:5px;background:#f3f4f6;border-radius:99px;overflow:hidden;">
                                    <div style="height:100%;width:${g}%;background:linear-gradient(90deg,#C5A572,#E8B84B);border-radius:99px;"></div>
                                </div>
                                <span style="font-size:0.7rem;color:#6b7280;width:38px;text-align:right;">${g}%</span>
                            </div>
                        </td></tr>`}).join("")),typeof window.renderAnalisisABC=="function"){var H=d.map(function(m){return{nombre:m.name,unidades:m.units,ingresos:m.revenue,costoTotal:m.cost,ganancia:m.profit,margen:m.margin,emoji:"\u{1F4E6}"}}),G=d.reduce(function(m,f){return m+f.profit},0);window.renderAnalisisABC(H,G)}var P=document.getElementById("analisisVacio");P&&P.classList[d.length===0?"remove":"add"]("hidden")},t.onerror=()=>e.apply(this,arguments);const r={};(window.products||[]).forEach(function(n){(n.tipo==="materia_prima"||n.tipo==="servicio")&&(n.name&&(r[n.name]=1),n.id&&(r["id:"+String(n.id)]=1))}),t.postMessage({salesHistory:window.salesHistory||[],pedidosFinalizados:window.pedidosFinalizados||[],period:i,orden:c,desde:a,hasta:l,mpSet:r})},window.renderAnalisis._mk4=!0,!0}return!1}function T(){if(!(window.manekiToastExport&&window.deleteProduct&&window.deleteClient))return!1;if(!window.manekiToastExport._mk4){const t=window.manekiToastExport;window.manekiToastExport=function(o,i){t(o,i),i==="err"&&u.error()},window.manekiToastExport._mk4=!0}if(!window.deleteProduct._mk4){const t=window.deleteProduct;window.deleteProduct=function(){u.del(),t.apply(this,arguments)},window.deleteProduct._mk4=!0}if(!window.deleteClient._mk4){const t=window.deleteClient;window.deleteClient=function(){u.del(),t.apply(this,arguments)},window.deleteClient._mk4=!0}return!0}document.addEventListener("maneki:ready",function(e){const t=e?.detail?.module||"";(t==="reportes"||t==="showSection")&&C(),(t==="analisis"||t==="renderAnalisis")&&I(),(t==="app"||t==="toast")&&T()});let $=0;const q=setInterval(()=>{C(),I(),T();const e=window.showSection?._mk4&&window.renderAnalisis?._mk4&&window.manekiToastExport?._mk4;(e||++$>30)&&(clearInterval(q),e&&document.dispatchEvent(new CustomEvent("maneki:ready",{detail:{module:"design-system"}})))},300);function B(){A(),E(),setTimeout(()=>{A(),E()},1200);const e=localStorage.getItem("maneki_activeSection");(!e||e==="dashboard"||e==="bienvenida")&&setTimeout(v,900),e==="inventory"&&window.patchInventoryButtons&&setTimeout(window.patchInventoryButtons,800)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",B):B(),console.log("%c\u{1F431} Maneki Premium v4.1 \xB7","color:#E8B84B;font-weight:800;font-size:12px;","Glassmorphism \xB7 Sound \xB7 Particles \xB7 Workers \xB7 Morph \xB7 InvPatch \u2713")})();
//# sourceMappingURL=design-system.js.map
