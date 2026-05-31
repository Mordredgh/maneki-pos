(function() {
  "use strict";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove("no-transition");
    });
  });
  if (!document.getElementById("mk-ripple-style")) {
    const s = document.createElement("style");
    s.id = "mk-ripple-style";
    s.textContent = "@keyframes mkRipple { to { transform: scale(1); opacity: 0; } }";
    document.head.appendChild(s);
  }
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("button");
    if (!btn || btn.classList.contains("no-ripple")) return;
    const ripple = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    Object.assign(ripple.style, {
      position: "absolute",
      width: size + "px",
      height: size + "px",
      left: x + "px",
      top: y + "px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.22)",
      transform: "scale(0)",
      pointerEvents: "none",
      zIndex: "0",
      animation: "mkRipple 0.55s ease-out forwards"
    });
    const prev = btn.style.position;
    if (!prev || prev === "static") btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(ripple);
    setTimeout(() => {
      try {
        ripple.remove();
      } catch (e2) {
      }
    }, 580);
  }, { passive: true });
  const supaEl = document.getElementById("supabaseStatus");
  if (supaEl && !supaEl.style.background) {
    supaEl.style.background = "rgba(197,151,59,0.08)";
    supaEl.style.border = "1px solid rgba(197,151,59,0.12)";
  }
  console.log("%c🐱 Maneki Store Premium v4.1", "color:#E8B84B;font-size:14px;font-weight:800;");
  console.log("%cDesign System cargado correctamente.", "color:#A855F7;font-size:11px;");
  window.mkConfetti = function() {
    let canvas = document.getElementById("mk-confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "mk-confetti-canvas";
      canvas.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:none;";
      document.body.appendChild(canvas);
    }
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    const colors = ["#C5A572", "#E8B84B", "#F5D080", "#9B7BC4", "#C4A8E0", "#F2A97E", "#10b981", "#ef4444", "#3b82f6"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * innerWidth,
      y: -10 - Math.random() * 40,
      w: 4 + Math.random() * 5,
      h: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: 1.5 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 8,
      opacity: 1
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      pieces.forEach((p) => {
        if (p.opacity <= 0) return;
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        p.vy += 0.04;
        if (p.y > innerHeight) p.opacity -= 0.03;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.opacity > 0) alive++;
      });
      frame++;
      if (alive > 0 && frame < 300) requestAnimationFrame(draw);
      else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
      }
    }
    requestAnimationFrame(draw);
  };
  window._mkNotifSound = function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
    }
  };
  const _sectionNames = {
    dashboard: "Dashboard",
    pedidos: "Pedidos por Encargo",
    quotes: "Cotizaciones",
    inventory: "Inventario",
    inventario: "Inventario",
    balance: "Balance",
    clientes: "Clientes",
    categorias: "Categorías",
    analisis: "Análisis",
    reportes: "Reportes",
    equipos: "Equipos / ROI",
    configuracion: "Configuración",
    bienvenida: "Inicio",
    envios: "Envíos"
  };
  window._mkUpdateBreadcrumb = function(section) {
    let bc = document.getElementById("mk-breadcrumb");
    if (!bc) {
      const bar = document.getElementById("global-search-bar");
      if (!bar) return;
      bc = document.createElement("div");
      bc.id = "mk-breadcrumb";
      bar.insertBefore(bc, bar.firstChild);
    }
    const name = _sectionNames[section] || section;
    bc.innerHTML = `<span style="opacity:.5">🐱</span><span class="bc-sep">›</span><span class="bc-current">${name}</span>`;
  };
  function _setupSidebarAccordion() {
    const sidebar = document.querySelector("#sidebar nav");
    if (!sidebar || sidebar._mkAccordion) return;
    sidebar._mkAccordion = true;
    const targets = ["analisis", "reportes", "equipos"];
    const buttons = targets.map((t) => sidebar.querySelector(`[data-section="${t}"]`)).filter(Boolean);
    if (buttons.length < 2) return;
    const toggle = document.createElement("button");
    toggle.className = "sidebar-accordion-toggle";
    toggle.innerHTML = '<span class="chevron">▼</span> Más herramientas';
    toggle.type = "button";
    const container = document.createElement("div");
    container.className = "sidebar-accordion-items";
    buttons.forEach((b) => container.appendChild(b));
    const configBtn = sidebar.querySelector('[data-section="configuracion"]');
    if (configBtn) {
      sidebar.insertBefore(toggle, configBtn);
      sidebar.insertBefore(container, configBtn);
    }
    let collapsed = localStorage.getItem("mk_accordion_collapsed") === "1";
    if (collapsed) {
      toggle.classList.add("collapsed");
      container.classList.add("collapsed");
    }
    toggle.addEventListener("click", () => {
      collapsed = !collapsed;
      toggle.classList.toggle("collapsed", collapsed);
      container.classList.toggle("collapsed", collapsed);
      localStorage.setItem("mk_accordion_collapsed", collapsed ? "1" : "0");
    });
  }
  setTimeout(_setupSidebarAccordion, 500);
  function _createShortcutsOverlay() {
    if (document.getElementById("mk-shortcuts-overlay")) return;
    const ov = document.createElement("div");
    ov.id = "mk-shortcuts-overlay";
    ov.innerHTML = `<div id="mk-shortcuts-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:1rem;font-weight:800;margin:0;">⌨️ Atajos de teclado</h3>
                <button onclick="document.getElementById('mk-shortcuts-overlay').classList.remove('visible')" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#9ca3af;">✕</button>
            </div>
            <div class="shortcut-row"><span>Nuevo pedido / producto</span><span class="shortcut-key">N</span></div>
            <div class="shortcut-row"><span>Búsqueda global</span><span class="shortcut-key">/</span></div>
            <div class="shortcut-row"><span>Búsqueda rápida</span><span class="shortcut-key">Ctrl K</span></div>
            <div class="shortcut-row"><span>Cerrar modal / overlay</span><span class="shortcut-key">Esc</span></div>
            <div class="shortcut-row"><span>Log de errores</span><span class="shortcut-key">Ctrl ⇧ L</span></div>
            <div class="shortcut-row"><span>Mostrar atajos</span><span class="shortcut-key">?</span></div>
            <p style="font-size:.65rem;color:#9ca3af;margin-top:12px;text-align:center;">Los atajos solo funcionan cuando no estás escribiendo en un campo</p>
        </div>`;
    ov.addEventListener("click", (e) => {
      if (e.target === ov) ov.classList.remove("visible");
    });
    document.body.appendChild(ov);
    const fab = document.createElement("button");
    fab.id = "mk-help-fab";
    fab.textContent = "?";
    fab.setAttribute("data-tip", "Atajos de teclado");
    fab.addEventListener("click", () => ov.classList.add("visible"));
    document.body.appendChild(fab);
  }
  setTimeout(_createShortcutsOverlay, 800);
  document.addEventListener("keydown", (e) => {
    if (e.key === "?" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      const ov = document.getElementById("mk-shortcuts-overlay");
      if (ov) ov.classList.toggle("visible");
    }
  });
  window._mkAvatar = function(nombre) {
    const n = String(nombre || "").trim();
    const parts = n.split(/\s+/);
    const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : n.substring(0, 2).toUpperCase();
    let hash = 0;
    for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
    const colors = ["#C5A572", "#9B7BC4", "#F2A97E", "#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899"];
    const bg = colors[Math.abs(hash) % colors.length];
    return `<span class="mk-avatar" style="background:${bg}">${initials}</span>`;
  };
  const _TIMELINE_STEPS = [
    { key: "confirmado", label: "Confirmado", icon: "✓" },
    { key: "pago", label: "Pago", icon: "$" },
    { key: "produccion", label: "Producción", icon: "🔧" },
    { key: "envio", label: "Envío", icon: "📦" },
    { key: "salida", label: "Salida", icon: "🚚" },
    { key: "retirar", label: "Retirar", icon: "🏪" }
  ];
  window._mkTimeline = function(currentStatus) {
    const curr = (currentStatus || "confirmado").toLowerCase();
    const currIdx = _TIMELINE_STEPS.findIndex((s) => s.key === curr);
    return '<div class="mk-timeline">' + _TIMELINE_STEPS.map((step, i) => {
      const cls = i < currIdx ? "done" : i === currIdx ? "active" : "future";
      const line = i < _TIMELINE_STEPS.length - 1 ? `<div class="mk-timeline-line ${i < currIdx ? "done" : i === currIdx ? "active" : ""}"></div>` : "";
      return `<div class="mk-timeline-step ${cls}">
                    <div class="mk-timeline-dot">${i <= currIdx ? step.icon : ""}</div>
                    <div class="mk-timeline-label">${step.label}</div>
                </div>${line}`;
    }).join("") + "</div>";
  };
  window._mkUpdatePedidosTotals = function() {
    const tabla = document.getElementById("vistaTabla");
    if (!tabla || tabla.classList.contains("hidden")) return;
    let bar = document.getElementById("mk-pedidos-totals-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "mk-pedidos-totals-bar";
      tabla.appendChild(bar);
    }
    const pedidos = window.pedidos || [];
    const activos = pedidos.filter((p) => p.status !== "cancelado");
    const _cs = typeof calcSaldoPendiente === "function" ? calcSaldoPendiente : ((p) => Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0)));
    const totalVenta = activos.reduce((s, p) => s + Number(p.total || 0), 0);
    const totalCobrado = activos.reduce((s, p) => s + (Number(p.total || 0) - _cs(p)), 0);
    const totalPendiente = activos.reduce((s, p) => s + _cs(p), 0);
    bar.innerHTML = `
            <div class="tot-item"><span class="tot-label">Pedidos</span><span class="tot-value tot-gold">${activos.length}</span></div>
            <div class="tot-item"><span class="tot-label">Total</span><span class="tot-value" style="color:#e5e7eb">$${totalVenta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <div class="tot-item"><span class="tot-label">Cobrado</span><span class="tot-value tot-green">$${totalCobrado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>
            <div class="tot-item"><span class="tot-label">Pendiente</span><span class="tot-value tot-red">$${totalPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span></div>`;
  };
  window._mkUpdateSyncTime = function() {
    let el = document.getElementById("mk-sync-time");
    if (!el) {
      const container = document.getElementById("supabaseStatus");
      if (!container) return;
      el = document.createElement("div");
      el.id = "mk-sync-time";
      container.parentElement.appendChild(el);
    }
    const now = /* @__PURE__ */ new Date();
    el.textContent = "↻ Sync " + now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  };
  setTimeout(() => window._mkUpdateSyncTime(), 3e3);
  function _convertTitles() {
    document.querySelectorAll("[title]:not(input):not(select):not(textarea):not([data-tip])").forEach((el) => {
      const t = el.getAttribute("title");
      if (t && t.length > 0 && t.length < 80) {
        el.setAttribute("data-tip", t);
        el.removeAttribute("title");
      }
    });
  }
  setTimeout(_convertTitles, 1e3);
  setTimeout(_convertTitles, 3e3);
  const _tipObs = new MutationObserver(() => requestAnimationFrame(_convertTitles));
  if (document.body) _tipObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["title"] });
  window._mkSkeletonRows = function(cols, rows) {
    cols = cols || 6;
    rows = rows || 5;
    const widths = ["w-40", "w-60", "w-20", "w-40", "w-20", "w-60", "w-40", "w-20"];
    return Array.from(
      { length: rows },
      () => '<tr class="mk-table-skeleton">' + Array.from(
        { length: cols },
        (_, i) => `<td><div class="sk-line ${widths[i % widths.length]}"></div></td>`
      ).join("") + "</tr>"
    ).join("");
  };
  (function _onboardingTour() {
    const KEY = "mk_onboarding_done";
    if (localStorage.getItem(KEY)) return;
    setTimeout(() => {
      const steps = [
        { target: '[data-section="pedidos"]', title: "📋 Pedidos por Encargo", text: "Aquí gestionas todos tus pedidos. Crea nuevos, da seguimiento y cobra." },
        { target: '[data-section="inventory"]', title: "📦 Inventario", text: "Controla tus productos, materias primas y stock en tiempo real." },
        { target: '[data-section="balance"]', title: "💰 Balance", text: "Registra ingresos, gastos y ve cuánto te deben tus clientes." },
        { target: '[data-section="clientes"]', title: "👥 Clientes", text: "Tu base de datos de clientes con historial de pedidos y estadísticas." },
        { target: "#mk-help-fab", title: "⌨️ Atajos", text: "Presiona ? en cualquier momento para ver los atajos de teclado. ¡Bienvenido a Maneki!" }
      ];
      let current = 0;
      const ov = document.createElement("div");
      ov.style.cssText = "position:fixed;inset:0;z-index:99997;background:rgba(0,0,0,0.5);transition:opacity .3s;";
      const tip = document.createElement("div");
      tip.style.cssText = "position:fixed;z-index:99998;background:#fff;border-radius:16px;padding:20px 24px;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.3);";
      function show(idx) {
        if (idx >= steps.length) {
          finish();
          return;
        }
        const s = steps[idx], el = document.querySelector(s.target);
        document.querySelectorAll("._mk-hl").forEach((e) => {
          e.style.zIndex = "";
          e.style.boxShadow = "";
          e.classList.remove("_mk-hl");
        });
        if (el) {
          el.style.zIndex = "99998";
          el.style.boxShadow = "0 0 0 4px rgba(197,151,59,0.5),0 0 20px rgba(197,151,59,0.3)";
          el.classList.add("_mk-hl");
        }
        const r = el ? el.getBoundingClientRect() : { top: innerHeight / 2 - 80, left: innerWidth / 2 - 160, bottom: innerHeight / 2 };
        tip.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h4 style="font-size:1rem;font-weight:800;color:#1a0533;margin:0;">' + s.title + '</h4><span style="font-size:.7rem;color:#9ca3af;">' + (idx + 1) + "/" + steps.length + '</span></div><p style="font-size:.82rem;color:#6b7280;margin:0 0 14px;line-height:1.5;">' + s.text + '</p><div style="display:flex;justify-content:space-between;"><button id="_ts" style="background:none;border:none;color:#9ca3af;font-size:.78rem;cursor:pointer;">Saltar</button><button id="_tn" style="background:linear-gradient(135deg,#C5973B,#E8B84B);color:white;border:none;border-radius:10px;padding:8px 20px;font-weight:700;font-size:.82rem;cursor:pointer;">' + (idx === steps.length - 1 ? "¡Empezar! 🚀" : "Siguiente →") + "</button></div>";
        tip.style.top = (r.bottom + 12 + 200 > innerHeight ? r.top - 180 : r.bottom + 12) + "px";
        tip.style.left = Math.max(16, Math.min(r.left || 100, innerWidth - 340)) + "px";
        document.getElementById("_tn").onclick = () => {
          current++;
          show(current);
        };
        document.getElementById("_ts").onclick = finish;
      }
      function finish() {
        localStorage.setItem(KEY, "1");
        ov.remove();
        tip.remove();
        document.querySelectorAll("._mk-hl").forEach((e) => {
          e.style.zIndex = "";
          e.style.boxShadow = "";
          e.classList.remove("_mk-hl");
        });
      }
      document.body.appendChild(ov);
      document.body.appendChild(tip);
      show(0);
    }, 2500);
  })();
})();
//# sourceMappingURL=init.js.map
