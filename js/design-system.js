(function() {
'use strict';

// ─────────────────────────────────────────────────────────────────
// 0. ESTILOS PREMIUM — inyectados en <head>
// ─────────────────────────────────────────────────────────────────
const _css = `
/* == MODAL CONTENT — sin glassmorphism blur == */
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

/* == TIPOGRAFÍA EXPRESIVA — Cormorant en KPIs grandes == */
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

/* == ADD-TO-TICKET PULSE == */
@keyframes mkCartPulse {
    0%  { box-shadow:0 0 0 0 rgba(197,151,59,0.6); }
    70% { box-shadow:0 0 0 12px rgba(197,151,59,0); }
    100%{ box-shadow:0 0 0 0 rgba(197,151,59,0); }
}
.mk-cart-pulse { animation:mkCartPulse 0.5s ease; }

/* == COUNT-UP POP == */
@keyframes mkCountPop {
    0%   { transform:scale(0.8); opacity:0.5; }
    60%  { transform:scale(1.08); }
    100% { transform:scale(1); opacity:1; }
}
.mk-count-pop { animation:mkCountPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }

/* == TICKET ITEM SLIDE IN == */
@keyframes mkTicketIn {
    from { opacity:0; transform:translateX(16px) scale(0.93); }
    to   { opacity:1; transform:translateX(0) scale(1); }
}
#ticketItems > * { animation:mkTicketIn 0.28s cubic-bezier(0.34,1.4,0.64,1) both; }

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
`;
const _styleEl = document.createElement('style');
_styleEl.id = 'mk-premium-v4';
_styleEl.textContent = _css;
document.head.appendChild(_styleEl);

// ─────────────────────────────────────────────────────────────────
// 1. PARTICLES — canvas ambiental de fondo
// ─────────────────────────────────────────────────────────────────
function initParticles() {
    if (document.getElementById('mk-particles')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'mk-particles';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
    resize();
    addEventListener('resize', resize);

    const COLS = ['rgba(197,151,59,OP)','rgba(232,184,75,OP)','rgba(124,58,237,OP)','rgba(168,85,247,OP)'];
    const pts = Array.from({length:26}, (_, i) => ({
        x: Math.random(), y: Math.random(),
        r: Math.random()*2+0.7,
        color: COLS[i%COLS.length].replace('OP', (Math.random()*0.22+0.04).toFixed(2)),
        vx: (Math.random()-.5)*0.00035,
        vy: (Math.random()-.5)*0.00035,
        phase: Math.random()*Math.PI*2
    }));

    let raf;
    function draw(t) {
        ctx.clearRect(0,0,W,H);
        pts.forEach((p, i) => {
            p.x = ((p.x + p.vx) + 1) % 1;
            p.y = ((p.y + p.vy) + 1) % 1;
            ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t * 0.001 + p.phase);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
    }
    draw(0);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(draw);
    });
}
initParticles();

// ─────────────────────────────────────────────────────────────────
// 2. CONFETTI — al finalizar una venta
// ─────────────────────────────────────────────────────────────────
function initConfetti() {
    if (document.getElementById('mk-confetti')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'mk-confetti';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    resize();
    addEventListener('resize', resize);

    const PCOLS = ['#E8B84B','#F5D080','#7C3AED','#A855F7','#10B981','#FF6B9D','#fff'];
    let parts = [], rafC;

    window.mkConfetti = function() {
        if (window._mkConfettiRaf) { cancelAnimationFrame(window._mkConfettiRaf); window._mkConfettiRaf = null; }
        canvas.style.display = 'block';
        parts = [];
        for (let i = 0; i < 88; i++) {
            parts.push({
                x: canvas.width/2 + (Math.random()-.5)*280,
                y: canvas.height*0.42,
                vx: (Math.random()-.5)*11,
                vy: -(Math.random()*13+5),
                r: Math.random()*5+2.5,
                rot: Math.random()*360, rotV: (Math.random()-.5)*9,
                color: PCOLS[Math.floor(Math.random()*PCOLS.length)],
                life: 1, decay: Math.random()*0.017+0.009
            });
        }
        cancelAnimationFrame(rafC);
        (function loop() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            let alive = false;
            parts.forEach(p => {
                p.x+=p.vx; p.y+=p.vy; p.vy+=0.44; p.vx*=0.995;
                p.rot+=p.rotV; p.life-=p.decay;
                if (p.life>0) { alive=true; }
                ctx.save();
                ctx.globalAlpha = Math.max(0,p.life);
                ctx.translate(p.x,p.y);
                ctx.rotate(p.rot*Math.PI/180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
                ctx.restore();
            });
            if (alive) { rafC = requestAnimationFrame(loop); window._mkConfettiRaf = rafC; }
            else { window._mkConfettiRaf = null; ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }
        })();
    };
}
initConfetti();

// ─────────────────────────────────────────────────────────────────
// 3. SOUND DESIGN — Web Audio API, sin archivos externos
// ─────────────────────────────────────────────────────────────────
const MKS = {
    _ctx: null,
    muted: localStorage.getItem('mk_muted') === '1',
    _ac() {
        if (!this._ctx) try { this._ctx = new (AudioContext||webkitAudioContext)(); } catch(e){}
        return this._ctx;
    },
    _play(notes, type) {
        const ctx = this._ac(); if (!ctx) return;
        const run = () => notes.forEach(([f,s,d,v=0.28]) => {
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type=type; o.frequency.value=f;
            const t=ctx.currentTime;
            g.gain.setValueAtTime(0,t+s);
            g.gain.linearRampToValueAtTime(v,t+s+0.012);
            g.gain.exponentialRampToValueAtTime(0.001,t+s+d);
            o.start(t+s); o.stop(t+s+d+0.05);
        });
        if (ctx.state==='suspended') ctx.resume().then(run); else run();
    },
    _tone(notes, type='sine') {
        if (this.muted) return;
        this._play(notes, type);
    },
    tick()   { this._tone([[880,0,0.08,0.22],[1100,0.06,0.06,0.15]]); },
    sale()   { this._tone([[523,0,0.12,0.28],[659,0.1,0.14,0.28],[784,0.22,0.32,0.28]],'triangle'); },
    error()  { this._tone([[220,0,0.16,0.28],[190,0.1,0.12,0.22]]); },
    notify() { this._tone([[880,0,0.08,0.25],[1108,0.09,0.09,0.22]]); },
    del()    { this._tone([[440,0,0.08,0.22],[330,0.06,0.10,0.18]]); },
    toggle() {
        this.muted = !this.muted;
        localStorage.setItem('mk_muted', this.muted ? '1' : '0');
        const b = document.getElementById('mk-sound-btn');
        if (b) { b.textContent=this.muted?'🔇':'🔊'; b.classList.toggle('muted',this.muted); }
    }
};
window.MKS = MKS;

// Sound button
if (!document.getElementById('mk-sound-btn')) {
    const _sb = document.createElement('button');
    _sb.id='mk-sound-btn'; _sb.title='Sonidos';
    _sb.textContent = MKS.muted ? '🔇' : '🔊';
    if (MKS.muted) _sb.classList.add('muted');
    _sb.onclick = () => MKS.toggle();
    document.body.appendChild(_sb);
}

// ─────────────────────────────────────────────────────────────────
// 4. MORPH OVERLAY — transición de color entre secciones
// ─────────────────────────────────────────────────────────────────
let _overlay = document.getElementById('mk-morph-overlay');
if (!_overlay) {
    _overlay = document.createElement('div');
    _overlay.id = 'mk-morph-overlay';
    document.body.appendChild(_overlay);
}

const SECTION_PALETTE = {
    dashboard:'rgba(124,58,237,0.10)', bienvenida:'rgba(124,58,237,0.10)',
    pedidos:'rgba(139,92,246,0.09)',
    inventory:'rgba(16,185,129,0.09)', balance:'rgba(245,158,11,0.09)',
    clientes:'rgba(255,107,157,0.09)', analisis:'rgba(197,151,59,0.09)',
    reportes:'rgba(99,102,241,0.09)', configuracion:'rgba(139,92,246,0.09)',
    categorias:'rgba(249,115,22,0.09)', equipos:'rgba(100,116,139,0.09)',
    quotes: 'rgba(197,151,59,0.09)',
};

let _prevSection = 'bienvenida';
function _morphTo(name) {
    const from = SECTION_PALETTE[_prevSection] || 'rgba(124,58,237,0.08)';
    const to   = SECTION_PALETTE[name]         || 'rgba(124,58,237,0.08)';
    _overlay.style.background = `linear-gradient(135deg,${from},${to})`;
    _overlay.classList.remove('active');
    void _overlay.offsetWidth;
    _overlay.classList.add('active');
    setTimeout(() => _overlay.classList.remove('active'), 420);
    _prevSection = name;
}

// ─────────────────────────────────────────────────────────────────
// 5. COUNT-UP — KPIs dashboard animan desde 0
// ─────────────────────────────────────────────────────────────────
function _countUp(el, target, prefix, duration) {
    if (!el || isNaN(target)) return;
    const t0 = performance.now();
    el.classList.add('mk-count-pop');
    const fmt = (v) => prefix === '$'
        ? '$' + v.toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})
        : v.toLocaleString('es-MX',{maximumFractionDigits:0});
    (function frame(now) {
        const p = Math.min((now-t0)/duration, 1);
        const e = 1-Math.pow(1-p,3); // cubic ease-out
        el.textContent = fmt(target*e);
        if (p<1) requestAnimationFrame(frame);
        else el.textContent = fmt(target);
    })(t0);
}

function _animateKPIs() {
    const ids = [
        {id:'dailySales',prefix:'$'},{id:'netProfit',prefix:'$'},
        {id:'accountsReceivable',prefix:'$'},{id:'dashActivePedidos',prefix:''}
    ];
    ids.forEach(({id,prefix}) => {
        const el = document.getElementById(id);
        if (!el) return;
        const raw = parseFloat((el.textContent||'').replace(/[^0-9.-]/g,''));
        if (!isNaN(raw) && raw > 0) _countUp(el, raw, prefix, 820);
    });
    document.querySelectorAll('.mk-kpi-value').forEach(el => {
        const raw = parseFloat((el.textContent||'').replace(/[^0-9.-]/g,''));
        const prefix = (el.textContent||'').trim().startsWith('$') ? '$' : '';
        if (!isNaN(raw) && raw > 0) _countUp(el, raw, prefix, 820);
    });
}

// ─────────────────────────────────────────────────────────────────
// 6. META MENSUAL EDITABLE
// ─────────────────────────────────────────────────────────────────
function _initEditableGoal() {
    const goalInput = document.getElementById('dashMonthGoal');
    if (!goalInput) return;
    const saved = localStorage.getItem('mk_monthly_goal');
    if (saved && !isNaN(parseFloat(saved))) goalInput.value = parseFloat(saved);

    const pct = document.getElementById('dashGoalPercent');
    if (pct && !document.getElementById('mk-goal-edit')) {
        const btn = document.createElement('button');
        btn.id = 'mk-goal-edit'; btn.className = 'mk-goal-edit-btn'; btn.type = 'button';
        btn.textContent = '✎ META';
        btn.onclick = () => {
            const goalEl = btn;
            const pctEl = document.getElementById('dashGoalPercent');
            // Find a nearby editable display element or create an inline input
            const currentVal = goalInput.value || '5000';
            const inlineInput = document.createElement('input');
            inlineInput.type = 'number';
            inlineInput.value = currentVal;
            inlineInput.min = '1';
            inlineInput.style.cssText = 'width:110px;padding:2px 6px;border:1.5px solid #E8B84B;border-radius:8px;font-size:0.85rem;outline:none;font-family:inherit;';
            btn.style.display = 'none';
            btn.parentNode.insertBefore(inlineInput, btn.nextSibling);
            inlineInput.focus();
            inlineInput.select();
            const saveGoal = () => {
                const newVal = parseFloat(inlineInput.value);
                if (newVal > 0) {
                    goalInput.value = newVal;
                    localStorage.setItem('mk_monthly_goal', newVal);
                    if (window.updateDashboard) window.updateDashboard();
                    if (window.manekiToastExport) manekiToastExport('Meta mensual actualizada: $'+newVal.toLocaleString('es-MX'), 'ok');
                }
                inlineInput.remove();
                btn.style.display = '';
            };
            inlineInput.addEventListener('blur', saveGoal);
            inlineInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); inlineInput.blur(); }
                if (e.key === 'Escape') {
                    inlineInput.removeEventListener('blur', saveGoal);
                    inlineInput.remove();
                    btn.style.display = '';
                }
            });
        };
        pct.parentNode.insertBefore(btn, pct.nextSibling);
    }
}

// ─────────────────────────────────────────────────────────────────
// 7. WEB WORKER — renderAnalisis en background thread
// ─────────────────────────────────────────────────────────────────
const _WORKER_SRC = `
self.onmessage = function(ev) {
    var d = ev.data, sh = d.salesHistory||[], period = d.period, orden = d.orden,
        desde = d.desde||'', hasta = d.hasta||'';
    var today = new Date().toISOString().split('T')[0];
    var fom = today.substring(0,7);
    var d30 = new Date(); d30.setDate(d30.getDate()-30); var s30=d30.toISOString().split('T')[0];
    var d90 = new Date(); d90.setDate(d90.getDate()-90); var s90=d90.toISOString().split('T')[0];
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
        if (sale.type === 'abono' || sale.type === 'anticipo') return; // BUG-S11 FIX: anticipos sintéticos no son ventas
        (sale.products||[]).forEach(function(item){
            var k = String(item.name||item.id||'?');
            if (mpSet[k] || (item.id && mpSet['id:'+String(item.id)])) return;
            if (!map[k]) map[k]={name:item.name||'—',units:0,revenue:0,cost:0};
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
`;
let _worker = null;
function _getWorker() {
    if (_worker) return _worker;
    try {
        const blob = new Blob([_WORKER_SRC],{type:'application/javascript'});
        _worker = new Worker(URL.createObjectURL(blob));
    } catch(e) { return null; }
    return _worker;
}

// ─────────────────────────────────────────────────────────────────
// 8. LAZY LOADED SECTIONS — tracking
// ─────────────────────────────────────────────────────────────────
const _lazySections = new Set();
function _lazyLoad(name) {
    if (_lazySections.has(name)) return;
    _lazySections.add(name);
    setTimeout(() => {
        if (name==='analisis' && window.renderAnalisis) window.renderAnalisis();
        if (name==='reportes' && window.renderSalesHistory) window.renderSalesHistory();
        if (name==='clientes' && window.renderClientsTable) window.renderClientsTable();
        if (name==='balance'  && window.renderBalance) window.renderBalance();
        if (name==='quotes'   && window.renderQuotesTable) window.renderQuotesTable();
    }, 80);
}

// ─────────────────────────────────────────────────────────────────
// 10. DEBOUNCE en inputs de búsqueda
// ─────────────────────────────────────────────────────────────────
function _applyDebounces() {
    const ps = document.getElementById('searchProduct');
    if (ps && !ps._mkD) {
        ps.oninput = null; ps.removeAttribute('oninput');
        let _t;
        ps.addEventListener('input', () => { clearTimeout(_t); _t=setTimeout(()=>{if(window.renderProducts)renderProducts();},150); });
        ps._mkD = true;
    }
    const is = document.getElementById('inventorySearch');
    if (is && !is._mkD) { is._mkD=true; }
}

// ─────────────────────────────────────────────────────────────────
// 11. PATCH showSection — morph + sound + lazy + KPI counter
//     MEJ-08: escuchar CustomEvent 'maneki:ready' en lugar de polling
//     Cada módulo debe disparar: document.dispatchEvent(new CustomEvent('maneki:ready', {detail:{module:'reportes'}}))
// ─────────────────────────────────────────────────────────────────
function _patchShowSection() {
    if (window.showSection && !window.showSection._mk4) {
        const _orig = window.showSection;
        window.showSection = function(name) {
            if (window._posSearchTimeout) { clearTimeout(window._posSearchTimeout); window._posSearchTimeout = null; }
            _morphTo(name);
            _orig.call(this, name);
            if (name==='dashboard') setTimeout(_animateKPIs, 220);
            _lazyLoad(name);
            if (name==='inventory' && window.patchInventoryButtons) {
                setTimeout(window.patchInventoryButtons, 120);
            }
        };
        window.showSection._mk4 = true;
        return true;
    }
    return false;
}

// ─────────────────────────────────────────────────────────────────
// 13. PATCH renderAnalisis — usar Web Worker
// ─────────────────────────────────────────────────────────────────
function _patchRenderAnalisis() {
    if (window.renderAnalisis && !window.renderAnalisis._mk4) {
        const _orig = window.renderAnalisis;
        window.renderAnalisis = function() {
            const wk = _getWorker();
            if (!wk || !window.salesHistory) { _orig.apply(this,arguments); return; }
            const tbody = document.getElementById('analisisTabla');
            if (tbody) tbody.innerHTML=Array(5).fill(
                `<tr>${Array(8).fill(`<td class="px-6 py-3"><div class="mk-skeleton" style="height:13px;width:75%;"></div></td>`).join('')}</tr>`
            ).join('');
            const period = window.analisisPeriodoActual||'mes';
            const orden  = document.getElementById('analisisOrden')?.value||'unidades';
            const desde  = document.getElementById('analisisDesde')?.value||'';
            const hasta  = document.getElementById('analisisHasta')?.value||'';
            wk.onmessage = function(ev) {
                const {rows, kpis} = ev.data;
                [['analisisKpiProductos',kpis.products,''],
                 ['analisisKpiUnidades', kpis.units,''],
                 ['analisisKpiIngresos', kpis.revenue,'$'],
                 ['analisisKpiGanancia', kpis.profit,'$']].forEach(([id,val,pre])=>{
                    const el=document.getElementById(id);
                    if (el) el.textContent = pre ? (pre+''+Number(val).toFixed(2)) : val;
                });
                const totRev = kpis.revenue||1;
                if (tbody) tbody.innerHTML = rows.slice(0,120).map((r,i)=>{
                    const pct = ((r.revenue/totRev)*100).toFixed(1);
                    const mc  = r.margin>=40?'text-green-600':r.margin>=20?'text-amber-500':'text-red-500';
                    const _e  = s=>String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                    return `<tr class="hover:bg-amber-50 transition-colors">
                        <td class="px-6 py-3 text-gray-400 font-bold text-center">${i+1}</td>
                        <td class="px-6 py-3 font-semibold text-gray-800">${_e(r.name)}</td>
                        <td class="px-6 py-3 text-center font-bold text-gray-800">${r.units}</td>
                        <td class="px-6 py-3 text-right font-bold text-gray-800">$${r.revenue.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right text-gray-500">$${r.cost.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right font-bold ${r.profit>=0?'text-green-600':'text-red-600'}">$${r.profit.toFixed(2)}</td>
                        <td class="px-6 py-3 text-center font-semibold ${mc}">${r.margin.toFixed(0)}%</td>
                        <td class="px-6 py-3">
                            <div style="display:flex;align-items:center;gap:6px;">
                                <div style="flex:1;height:5px;background:#f3f4f6;border-radius:99px;overflow:hidden;">
                                    <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#C5A572,#E8B84B);border-radius:99px;"></div>
                                </div>
                                <span style="font-size:0.7rem;color:#6b7280;width:38px;text-align:right;">${pct}%</span>
                            </div>
                        </td></tr>`;
                }).join('');
                if (typeof window.renderAnalisisABC === 'function') {
                    var listaParaABC = rows.map(function(r){
                        return {nombre:r.name, unidades:r.units, ingresos:r.revenue, costoTotal:r.cost, ganancia:r.profit, margen:r.margin, emoji:'📦'};
                    });
                    var totalGanancia = rows.reduce(function(s,r){return s+r.profit;},0);
                    window.renderAnalisisABC(listaParaABC, totalGanancia);
                }
                var vacio = document.getElementById('analisisVacio');
                if (vacio) vacio.classList[rows.length===0?'remove':'add']('hidden');
            };
            wk.onerror = ()=>_orig.apply(this,arguments);
            const _mpSet = {}; (window.products||[]).forEach(function(p){ if(p.tipo==="materia_prima"||p.tipo==="servicio"){ if(p.name)_mpSet[p.name]=1; if(p.id)_mpSet["id:"+String(p.id)]=1; } }); wk.postMessage({salesHistory:window.salesHistory||[],pedidosFinalizados:window.pedidosFinalizados||[],period,orden,desde,hasta,mpSet:_mpSet});
        };
        window.renderAnalisis._mk4 = true;
        return true;
    }
    return false;
}

// ─────────────────────────────────────────────────────────────────
// 14. SOUND on error toasts, delete actions
// ─────────────────────────────────────────────────────────────────
function _patchSoundActions() {
    const allReady = window.manekiToastExport && window.deleteProduct && window.deleteClient;
    if (!allReady) return false;
    if (!window.manekiToastExport._mk4) {
        const _o=window.manekiToastExport;
        window.manekiToastExport=function(m,t){_o(m,t);if(t==='err')MKS.error();};
        window.manekiToastExport._mk4=true;
    }
    if (!window.deleteProduct._mk4) {
        const _o=window.deleteProduct;
        window.deleteProduct=function(){MKS.del();_o.apply(this,arguments);};
        window.deleteProduct._mk4=true;
    }
    if (!window.deleteClient._mk4) {
        const _o=window.deleteClient;
        window.deleteClient=function(){MKS.del();_o.apply(this,arguments);};
        window.deleteClient._mk4=true;
    }
    return true;
}

// MEJ-08: Escuchar CustomEvent 'maneki:ready' para parchear módulos de forma determinística.
// Cada módulo debe disparar al final de su carga:
//   document.dispatchEvent(new CustomEvent('maneki:ready', { detail: { module: 'reportes' } }))
// Esto elimina los 4 setInterval de polling y hace el sistema predecible.
document.addEventListener('maneki:ready', function(e) {
    const mod = e?.detail?.module || '';
    if (mod === 'reportes' || mod === 'showSection') _patchShowSection();
    if (mod === 'analisis' || mod === 'renderAnalisis') _patchRenderAnalisis();
    if (mod === 'app' || mod === 'toast') _patchSoundActions();
});

// Compatibilidad hacia atrás: intentar aplicar patches inmediatamente si los símbolos
// ya están disponibles (cuando design-system.js carga después de los módulos).
// También mantener un único intervalo de rescate con limite estricto — solo como fallback.
let _mkPatchAttempts = 0;
const _mkPatchFallback = setInterval(() => {
    _patchShowSection();
    _patchRenderAnalisis();
    _patchSoundActions();
    const allDone = window.showSection?._mk4 &&
                    window.renderAnalisis?._mk4 && window.manekiToastExport?._mk4;
    if (allDone || ++_mkPatchAttempts > 30) {
        clearInterval(_mkPatchFallback);
        if (allDone) {
            document.dispatchEvent(new CustomEvent('maneki:ready', { detail: { module: 'design-system' } }));
        }
    }
}, 300);

// ─────────────────────────────────────────────────────────────────
// 15. INICIALIZACIÓN — esperar a que todo esté listo
// ─────────────────────────────────────────────────────────────────
function _onReady() {
    _applyDebounces();
    _initEditableGoal();
    setTimeout(()=>{ _applyDebounces(); _initEditableGoal(); }, 1200);
    const initSection = localStorage.getItem('maneki_activeSection');
    if (!initSection || initSection==='dashboard' || initSection==='bienvenida') {
        setTimeout(_animateKPIs, 900);
    }
    // Si la app arranca directamente en inventario, parchar botones también
    if (initSection === 'inventory' && window.patchInventoryButtons) {
        setTimeout(window.patchInventoryButtons, 800);
    }
}

if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', _onReady);
else _onReady();

console.log('%c🐱 Maneki Premium v4.1 ·', 'color:#E8B84B;font-weight:800;font-size:12px;',
            'Glassmorphism · Sound · Particles · Workers · Morph · InvPatch ✓');

})();
