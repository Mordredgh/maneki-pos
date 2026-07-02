"use strict";(function(){"use strict";const B=`
/* == MODAL CONTENT \u2014 sin glassmorphism blur == */
.modal > div {
    background: rgba(255,255,255,0.97) !important;
    border: 1px solid rgba(255,255,255,0.6) !important;
    box-shadow:
        0 2px 0 rgba(255,255,255,0.75) inset,
        0 32px 80px rgba(21,4,50,0.20),
        0 12px 28px rgba(150,105,196,0.13) !important;
}
body.dark .modal > div {
    background: rgba(14,4,32,0.96) !important;
    border-color: rgba(255,209,102,0.22) !important;
}

/* == TIPOGRAF\xCDA EXPRESIVA \u2014 Nunito en KPIs grandes == */
.mk-kpi-value,
#dailySales, #netProfit, #accountsReceivable {
    font-family: 'Nunito', sans-serif !important;
    font-size: clamp(1.6rem, 2.5vw, 2.4rem) !important;
    font-weight: 700 !important;
    font-style: normal !important;
    letter-spacing: -0.03em !important;
    line-height: 1.05 !important;
}
.mk-kpi-label {
    font-family: 'Nunito', sans-serif !important;
    font-style: normal !important;
    font-size: 0.7rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    opacity: 0.65 !important;
}

/* == SIDEBAR ACTIVE INDICATOR ==
   Reemplaza el acento de borde lateral (banned pattern) por un indicador
   tipo pill que GSAP desliza detr\xE1s del item activo \u2014 ver _mkMoveSidebarIndicator. */
.sidebar-item { position: relative !important; overflow: hidden; z-index: 1; }
#sidebarIndicator {
    position: absolute;
    left: 16px; right: 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(255,209,102,0.22) 0%, rgba(255,221,133,0.12) 100%);
    border: 1px solid rgba(255,209,102,0.30);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 16px rgba(255,209,102,0.14);
    pointer-events: none;
    z-index: 0;
    opacity: 0;
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
    border: 1.5px solid rgba(255,209,102,0.12) !important;
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
    border-color: rgba(255,209,102,0.35) !important;
    box-shadow: 0 14px 36px rgba(150,105,196,0.14), 0 5px 14px rgba(255,209,102,0.14) !important;
}
.product-card:active:not(.mk-out-of-stock) {
    transform: scale(0.96) !important; transition-duration:0.08s !important;
}
.mk-pc-img { width:100%;height:110px;overflow:hidden;flex-shrink:0; }
.mk-pc-img img { width:100%;height:100%;object-fit:cover;transition:transform 0.35s ease; }
.product-card:hover .mk-pc-img img { transform:scale(1.07); }
.mk-pc-emoji { width:100%;height:96px;display:flex;align-items:center;justify-content:center;
    font-size:2.6rem;background:linear-gradient(135deg,rgba(150,105,196,0.05),rgba(255,209,102,0.04)); }
.mk-pc-body { padding:10px 12px 12px;flex:1;display:flex;flex-direction:column;gap:4px; }
.mk-pc-name { font-size:0.79rem;font-weight:700;color:#1c4f32;line-height:1.3;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
.mk-pc-price { font-family:'Nunito',sans-serif;font-size:1.2rem;
    font-weight:600;font-style:italic;color:#FFD166;margin-top:auto; }
.mk-pc-stock-ok  { font-size:0.65rem;font-weight:700;color:#10B981; }
.mk-pc-stock-low { font-size:0.65rem;font-weight:700;color:#F59E0B; }
.mk-pc-stock-out { font-size:0.65rem;font-weight:700;color:#EF4444; }
.mk-out-of-stock { opacity:0.52;filter:grayscale(25%);cursor:not-allowed !important; }
.mk-pc-tags { display:flex;flex-wrap:wrap;gap:3px;margin-top:2px; }
.mk-pc-tag { background:rgba(255,221,133,0.1);color:#92400e;border:1px solid rgba(255,209,102,0.2);
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
    border:1px solid rgba(255,209,102,0.25);
    box-shadow:0 4px 14px rgba(21,4,50,0.1),inset 0 1px 0 rgba(255,255,255,0.85);
    cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;
    transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
#mk-sound-btn:hover { transform:scale(1.15); }
#mk-sound-btn.muted { opacity:0.4; }

/* == META EDITABLE == */
.mk-goal-edit-btn {
    cursor:pointer;font-size:0.65rem;padding:1px 5px;border-radius:6px;
    background:rgba(255,209,102,0.1);color:#92400e;border:1px dashed rgba(255,209,102,0.4);
    transition:background 0.15s;margin-left:6px;font-weight:700;letter-spacing:0.04em;
}
.mk-goal-edit-btn:hover { background:rgba(255,209,102,0.22); }

/* == SKELETON LOADING == */
.mk-skeleton {
    background:linear-gradient(90deg,rgba(255,209,102,0.06) 25%,rgba(255,209,102,0.13) 50%,rgba(255,209,102,0.06) 75%);
    background-size:200% 100%;
    animation:mkSkeletonShimmer 1.6s ease-in-out infinite;
    border-radius:8px;
}
@keyframes mkSkeletonShimmer {
    0%  { background-position:200% 0; }
    100%{ background-position:-200% 0; }
}
`,w=document.createElement("style");w.id="mk-premium-v4",w.textContent=B,document.head.appendChild(w);function z(){if(document.getElementById("mk-particles"))return;const e=document.createElement("canvas");e.id="mk-particles",document.body.insertBefore(e,document.body.firstChild);const t=e.getContext("2d");let n,i;function s(){n=e.width=innerWidth,i=e.height=innerHeight}s(),addEventListener("resize",s);const r=["rgba(255,209,102,OP)","rgba(255,221,133,OP)","rgba(150,105,196,OP)","rgba(171,132,209,OP)"],d=Array.from({length:26},(l,c)=>({x:Math.random(),y:Math.random(),r:Math.random()*2+.7,color:r[c%r.length].replace("OP",(Math.random()*.22+.04).toFixed(2)),vx:(Math.random()-.5)*35e-5,vy:(Math.random()-.5)*35e-5,phase:Math.random()*Math.PI*2}));let a;function o(l){t.clearRect(0,0,n,i),d.forEach((c,L)=>{c.x=(c.x+c.vx+1)%1,c.y=(c.y+c.vy+1)%1,t.globalAlpha=.35+.3*Math.sin(l*.001+c.phase),t.fillStyle=c.color,t.beginPath(),t.arc(c.x*n,c.y*i,c.r,0,Math.PI*2),t.fill()}),t.globalAlpha=1,a=requestAnimationFrame(o)}o(0),document.addEventListener("visibilitychange",()=>{document.hidden?cancelAnimationFrame(a):a=requestAnimationFrame(o)})}z();function R(){if(document.getElementById("mk-confetti"))return;const e=document.createElement("canvas");e.id="mk-confetti",document.body.appendChild(e);const t=e.getContext("2d");function n(){e.width=innerWidth,e.height=innerHeight}n(),addEventListener("resize",n);const i=["#FFDD85","#FFE8B0","#9669c4","#ab84d1","#10B981","#FF6B9D","#fff"];let s=[],r;window.mkConfetti=function(){window._mkConfettiRaf&&(cancelAnimationFrame(window._mkConfettiRaf),window._mkConfettiRaf=null),e.style.display="block",s=[];for(let d=0;d<88;d++)s.push({x:e.width/2+(Math.random()-.5)*280,y:e.height*.42,vx:(Math.random()-.5)*11,vy:-(Math.random()*13+5),r:Math.random()*5+2.5,rot:Math.random()*360,rotV:(Math.random()-.5)*9,color:i[Math.floor(Math.random()*i.length)],life:1,decay:Math.random()*.017+.009});cancelAnimationFrame(r),(function d(){t.clearRect(0,0,e.width,e.height);let a=!1;s.forEach(o=>{o.x+=o.vx,o.y+=o.vy,o.vy+=.44,o.vx*=.995,o.rot+=o.rotV,o.life-=o.decay,o.life>0&&(a=!0),t.save(),t.globalAlpha=Math.max(0,o.life),t.translate(o.x,o.y),t.rotate(o.rot*Math.PI/180),t.fillStyle=o.color,t.fillRect(-o.r,-o.r/2,o.r*2,o.r),t.restore()}),a?(r=requestAnimationFrame(d),window._mkConfettiRaf=r):(window._mkConfettiRaf=null,t.clearRect(0,0,e.width,e.height),e.style.display="none")})()}}R();const u={_ctx:null,muted:localStorage.getItem("mk_muted")==="1",_ac(){if(!this._ctx)try{this._ctx=new(AudioContext||webkitAudioContext)}catch{}return this._ctx},_play(e,t){const n=this._ac();if(!n)return;const i=()=>e.forEach(([s,r,d,a=.28])=>{const o=n.createOscillator(),l=n.createGain();o.connect(l),l.connect(n.destination),o.type=t,o.frequency.value=s;const c=n.currentTime;l.gain.setValueAtTime(0,c+r),l.gain.linearRampToValueAtTime(a,c+r+.012),l.gain.exponentialRampToValueAtTime(.001,c+r+d),o.start(c+r),o.stop(c+r+d+.05)});n.state==="suspended"?n.resume().then(i):i()},_tone(e,t="sine"){this.muted||this._play(e,t)},tick(){this._tone([[880,0,.08,.22],[1100,.06,.06,.15]])},sale(){this._tone([[523,0,.12,.28],[659,.1,.14,.28],[784,.22,.32,.28]],"triangle")},error(){this._tone([[220,0,.16,.28],[190,.1,.12,.22]])},notify(){this._tone([[880,0,.08,.25],[1108,.09,.09,.22]])},del(){this._tone([[440,0,.08,.22],[330,.06,.1,.18]])},toggle(){this.muted=!this.muted,localStorage.setItem("mk_muted",this.muted?"1":"0");const e=document.getElementById("mk-sound-btn");e&&(e.textContent=this.muted?"\u{1F507}":"\u{1F50A}",e.classList.toggle("muted",this.muted))}};if(window.MKS=u,!document.getElementById("mk-sound-btn")){const e=document.createElement("button");e.id="mk-sound-btn",e.title="Sonidos",e.textContent=u.muted?"\u{1F507}":"\u{1F50A}",u.muted&&e.classList.add("muted"),e.onclick=()=>u.toggle(),document.body.appendChild(e)}let p=document.getElementById("mk-morph-overlay");p||(p=document.createElement("div"),p.id="mk-morph-overlay",document.body.appendChild(p));const v={dashboard:"rgba(150,105,196,0.10)",bienvenida:"rgba(150,105,196,0.10)",pedidos:"rgba(150,105,196,0.09)",inventory:"rgba(16,185,129,0.09)",balance:"rgba(245,158,11,0.09)",clientes:"rgba(255,107,157,0.09)",analisis:"rgba(255,209,102,0.09)",reportes:"rgba(99,102,241,0.09)",configuracion:"rgba(150,105,196,0.09)",categorias:"rgba(249,115,22,0.09)",equipos:"rgba(100,116,139,0.09)",quotes:"rgba(255,209,102,0.09)"};let x="bienvenida";function D(e){const t=v[x]||"rgba(150,105,196,0.08)",n=v[e]||"rgba(150,105,196,0.08)";p.style.background=`linear-gradient(135deg,${t},${n})`,p.classList.remove("active"),requestAnimationFrame(()=>requestAnimationFrame(()=>{p.classList.add("active"),setTimeout(()=>p.classList.remove("active"),420)})),x=e}window._mkMorphTo=D;function b(e){const t=e&&e.closest?e.closest("nav"):null,n=document.getElementById("sidebarIndicator");if(!t||!n)return;const i=t.getBoundingClientRect(),s=e.getBoundingClientRect(),r=s.top-i.top+t.scrollTop,d=s.height,a=typeof window.gsap<"u",o=n.style.opacity!==""&&n.style.opacity!=="0";a?window.gsap.to(n,{top:r,height:d,opacity:1,duration:o?.32:.01,ease:o?"expo.out":"none",overwrite:!0}):(n.style.top=r+"px",n.style.height=d+"px",n.style.opacity="1")}window._mkMoveSidebarIndicator=b;function N(){if(typeof window.gsap>"u")return;const e=window.gsap,t=document.getElementById("mkDashHero");if(!t)return;const n=[t.querySelector('[data-hero-stagger="1"]'),t.querySelector('[data-hero-stagger="2"]'),document.querySelector('#dashboard-section [data-hero-stagger="3"]')].filter(Boolean);n.length&&e.matchMedia().add({reduced:"(prefers-reduced-motion: reduce)",full:"(prefers-reduced-motion: no-preference)"},i=>{if(i.conditions.reduced){e.set(n,{opacity:1,y:0});return}e.fromTo(n,{opacity:0,y:14},{opacity:1,y:0,duration:.5,ease:"expo.out",stagger:.09,overwrite:!0})})}window._mkAnimateDashboardHero=N,document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelector(".sidebar-item.active");e&&requestAnimationFrame(()=>b(e))}),window.addEventListener("resize",()=>{const e=document.querySelector(".sidebar-item.active");e&&b(e)});function k(e,t,n,i){if(!e||isNaN(t))return;const s=performance.now();e.classList.add("mk-count-pop");const r=d=>n==="$"?"$"+d.toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2}):d.toLocaleString("es-MX",{maximumFractionDigits:0});(function d(a){const o=Math.min((a-s)/i,1),l=1-Math.pow(1-o,3);e.textContent=r(t*l),o<1?requestAnimationFrame(d):e.textContent=r(t)})(s)}function _(){[{id:"dailySales",prefix:"$"},{id:"netProfit",prefix:"$"},{id:"accountsReceivable",prefix:"$"},{id:"dashActivePedidos",prefix:""}].forEach(({id:t,prefix:n})=>{const i=document.getElementById(t);if(!i)return;const s=parseFloat((i.textContent||"").replace(/[^0-9.-]/g,""));!isNaN(s)&&s>0&&k(i,s,n,820)}),document.querySelectorAll(".mk-kpi-value").forEach(t=>{const n=parseFloat((t.textContent||"").replace(/[^0-9.-]/g,"")),i=(t.textContent||"").trim().startsWith("$")?"$":"";!isNaN(n)&&n>0&&k(t,n,i,820)})}window._mkAnimateKPIs=_;function E(){const e=document.getElementById("dashMonthGoal");if(!e)return;const t=localStorage.getItem("mk_monthly_goal");t&&!isNaN(parseFloat(t))&&(e.value=parseFloat(t));const n=document.getElementById("dashGoalPercent");if(n&&!document.getElementById("mk-goal-edit")){const i=document.createElement("button");i.id="mk-goal-edit",i.className="mk-goal-edit-btn",i.type="button",i.textContent="\u270E META",i.onclick=()=>{const s=i,r=document.getElementById("dashGoalPercent"),d=e.value||"5000",a=document.createElement("input");a.type="number",a.value=d,a.min="1",a.style.cssText="width:110px;padding:2px 6px;border:1.5px solid #FFDD85;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;",i.style.display="none",i.parentNode.insertBefore(a,i.nextSibling),a.focus(),a.select();const o=()=>{const l=parseFloat(a.value);l>0&&(e.value=l,localStorage.setItem("mk_monthly_goal",l),window.updateDashboard&&window.updateDashboard(),window.manekiToastExport&&manekiToastExport("Meta mensual actualizada: $"+l.toLocaleString("es-MX"),"ok")),a.remove(),i.style.display=""};a.addEventListener("blur",o),a.addEventListener("keydown",l=>{l.key==="Enter"&&(l.preventDefault(),a.blur()),l.key==="Escape"&&(a.removeEventListener("blur",o),a.remove(),i.style.display="")})},n.parentNode.insertBefore(i,n.nextSibling)}}const O=`
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
`;let h=null;function q(){if(h)return h;try{const e=new Blob([O],{type:"application/javascript"});h=new Worker(URL.createObjectURL(e))}catch{return null}return h}const S=new Set;function I(e,t){const n="section-"+e,i=document.getElementById(n)||document.querySelector('[data-section="'+e+'"]');if(!i)return;const s="__mk_spin_"+e;if(t){if(i.querySelector("#"+s))return;const r=document.createElement("div");if(r.id=s,r.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.7);z-index:99;border-radius:12px;",r.innerHTML='<div style="width:36px;height:36px;border:3px solid #f3f3f3;border-top:3px solid #FFD166;border-radius:50%;animation:mkSpin .7s linear infinite;"></div>',!document.getElementById("mk-spin-style")){const d=document.createElement("style");d.id="mk-spin-style",d.textContent="@keyframes mkSpin{to{transform:rotate(360deg)}}",document.head.appendChild(d)}i.style.position=i.style.position||"relative",i.appendChild(r)}else{const r=i.querySelector("#"+s);r&&r.remove()}}function $(e){if(S.has(e))return;S.add(e);const t=async()=>{(e==="balance"||e==="reportes"||e==="analisis")&&window._mkEnsureChartJs&&await window._mkEnsureChartJs(),e==="analisis"&&window.renderAnalisis&&window.renderAnalisis(),e==="reportes"&&window.renderSalesHistory&&window.renderSalesHistory(),e==="clientes"&&window.renderClientsTable&&window.renderClientsTable(),e==="balance"&&window.renderBalance&&window.renderBalance(),e==="quotes"&&window.renderQuotesTable&&window.renderQuotesTable(),(e==="inventory"||e==="inventario"||e==="categorias")&&(window.updateCategorySelects&&window.updateCategorySelects(),window.renderInventoryTable&&window.renderInventoryTable()),e==="pedidos"&&(window.renderPedidosTable&&window.renderPedidosTable(),window.renderKanbanBoard&&window.renderKanbanBoard(),window.renderHistorialPedidos&&window.renderHistorialPedidos())};if(!window._mkLazyLoad||window._mkGrupoListo(e)){(window._mkLazyLoad?window._mkLazyLoad(e):Promise.resolve()).then(()=>setTimeout(t,80));return}I(e,!0),window._mkLazyLoad(e).then(()=>{I(e,!1),setTimeout(t,80)})}window._lazyLoad=$;function A(){const e=document.getElementById("inventorySearch");e&&!e._mkD&&(e._mkD=!0)}function C(){return window.showSection&&(window.showSection._mk4=!0),!0}function T(){if(window.renderAnalisis&&!window.renderAnalisis._mk4){const e=window.renderAnalisis;return window.renderAnalisis=function(){const t=q();if(!t||!window.salesHistory){e.apply(this,arguments);return}const n=document.getElementById("analisisTabla");n&&(n.innerHTML=Array(5).fill(`<tr>${Array(8).fill('<td class="px-6 py-3"><div class="mk-skeleton" style="height:13px;width:75%;"></div></td>').join("")}</tr>`).join(""));const i=window.analisisPeriodoActual||"mes",s=document.getElementById("analisisOrden")?.value||"unidades",r=document.getElementById("analisisDesde")?.value||"",d=document.getElementById("analisisHasta")?.value||"";t.onmessage=function(o){const{rows:l,kpis:c}=o.data;[["analisisKpiProductos",c.products,""],["analisisKpiUnidades",c.units,""],["analisisKpiIngresos",c.revenue,"$"],["analisisKpiGanancia",c.profit,"$"]].forEach(([m,f,g])=>{const y=document.getElementById(m);y&&(y.textContent=g?g+""+Number(f).toFixed(2):f)});const L=c.revenue||1;if(n&&(n.innerHTML=l.slice(0,120).map((m,f)=>{const g=(m.revenue/L*100).toFixed(1),y=m.margin>=40?"text-green-600":m.margin>=20?"text-amber-500":"text-red-500",j=U=>String(U||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<tr class="hover:bg-amber-50 transition-colors">
                        <td class="px-6 py-3 text-gray-400 font-bold text-center">${f+1}</td>
                        <td class="px-6 py-3 font-semibold text-gray-800">${j(m.name)}</td>
                        <td class="px-6 py-3 text-center font-bold text-gray-800">${m.units}</td>
                        <td class="px-6 py-3 text-right font-bold text-gray-800">$${m.revenue.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right text-gray-500">$${m.cost.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right font-bold ${m.profit>=0?"text-green-600":"text-red-600"}">$${m.profit.toFixed(2)}</td>
                        <td class="px-6 py-3 text-center font-semibold ${y}">${m.margin.toFixed(0)}%</td>
                        <td class="px-6 py-3">
                            <div style="display:flex;align-items:center;gap:6px;">
                                <div style="flex:1;height:5px;background:#f3f4f6;border-radius:99px;overflow:hidden;">
                                    <div style="height:100%;width:${g}%;background:linear-gradient(90deg,#FFD166,#FFDD85);border-radius:99px;"></div>
                                </div>
                                <span style="font-size:0.7rem;color:#6b7280;width:38px;text-align:right;">${g}%</span>
                            </div>
                        </td></tr>`}).join("")),typeof window.renderAnalisisABC=="function"){var V=l.map(function(m){return{nombre:m.name,unidades:m.units,ingresos:m.revenue,costoTotal:m.cost,ganancia:m.profit,margen:m.margin,emoji:"\u{1F4E6}"}}),K=l.reduce(function(m,f){return m+f.profit},0);window.renderAnalisisABC(V,K)}var P=document.getElementById("analisisVacio");P&&P.classList[l.length===0?"remove":"add"]("hidden")},t.onerror=()=>e.apply(this,arguments);const a={};(window.products||[]).forEach(function(o){(o.tipo==="materia_prima"||o.tipo==="servicio")&&(o.name&&(a[o.name]=1),o.id&&(a["id:"+String(o.id)]=1))}),t.postMessage({salesHistory:window.salesHistory||[],pedidosFinalizados:window.pedidosFinalizados||[],period:i,orden:s,desde:r,hasta:d,mpSet:a})},window.renderAnalisis._mk4=!0,!0}return!1}function F(){if(!(window.manekiToastExport&&window.deleteProduct&&window.deleteClient))return!1;if(!window.manekiToastExport._mk4){const t=window.manekiToastExport;window.manekiToastExport=function(n,i){t(n,i),i==="err"&&u.error()},window.manekiToastExport._mk4=!0}if(!window.deleteProduct._mk4){const t=window.deleteProduct;window.deleteProduct=function(){u.del(),t.apply(this,arguments)},window.deleteProduct._mk4=!0}if(!window.deleteClient._mk4){const t=window.deleteClient;window.deleteClient=function(){u.del(),t.apply(this,arguments)},window.deleteClient._mk4=!0}return!0}document.addEventListener("maneki:ready",function(e){const t=e?.detail?.module||"";(t==="reportes"||t==="showSection")&&C(),(t==="analisis"||t==="renderAnalisis")&&T(),(t==="app"||t==="toast")&&F()});let H=0;const G=setInterval(()=>{C(),T(),F();const e=window.showSection?._mk4&&window.renderAnalisis?._mk4&&window.manekiToastExport?._mk4;(e||++H>30)&&(clearInterval(G),e&&document.dispatchEvent(new CustomEvent("maneki:ready",{detail:{module:"design-system"}})))},300);function M(){A(),E(),setTimeout(()=>{A(),E()},1200);const e=localStorage.getItem("maneki_activeSection");(!e||e==="dashboard"||e==="bienvenida")&&setTimeout(_,900),e==="inventory"&&window.patchInventoryButtons&&setTimeout(window.patchInventoryButtons,800)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",M):M(),console.log("%c\u{1F41B} Bicho Capricho Premium v4.1 \xB7","color:#FFDD85;font-weight:800;font-size:12px;","Glassmorphism \xB7 Sound \xB7 Particles \xB7 Workers \xB7 Morph \xB7 InvPatch \u2713")})();
//# sourceMappingURL=design-system.js.map
