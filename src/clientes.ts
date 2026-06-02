// ── Validación de email ──────────────────────────────────────────────────────
function _validEmail(e) { return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

const _escAttr = window._esc;

// ── N9: Segmentación RFM ─────────────────────────────────────────────────────
const _RFM_SEGMENTS = [
    { key: 'campeon',     label: 'Campeones',    emoji: '🏆', color: '#065f46', bg: '#d1fae5', desc: 'Compran frecuente y reciente' },
    { key: 'leal',        label: 'Leales',       emoji: '⭐', color: '#1e40af', bg: '#dbeafe', desc: 'Clientes constantes de alto valor' },
    { key: 'prometedor',  label: 'Prometedores', emoji: '🌱', color: '#4d7c0f', bg: '#ecfccb', desc: 'Recientes pero pocos pedidos' },
    { key: 'en_riesgo',   label: 'En riesgo',    emoji: '⚠️', color: '#9a3412', bg: '#ffedd5', desc: 'Solían comprar, ahora ausentes' },
    { key: 'hibernando',  label: 'Hibernando',   emoji: '❄️', color: '#1e3a5f', bg: '#e0f2fe', desc: 'Sin actividad reciente' },
    { key: 'ocasional',   label: 'Ocasionales',  emoji: '🔵', color: '#374151', bg: '#f3f4f6', desc: 'Compras esporádicas' },
];

function _calcRFMScores(): Record<string, {r:number, f:number, m:number, segment:string, recenciaDias:number, frecuencia:number, monto:number}> | null {
    const pf = (window as any).pedidosFinalizados || [];
    if (!pf.length) return null;
    const now = new Date();

    // Construir mapa por cliente
    const mapa: Record<string, {recenciaDias:number, frecuencia:number, monto:number}> = {};
    pf.forEach((p: any) => {
        const nombre = String(p.cliente || p.clientName || '').trim();
        if (!nombre) return;
        const fechaStr = p.fechaFinalizado || p.fechaPedido || p.fecha || '';
        const fecha = fechaStr ? new Date(fechaStr + (fechaStr.length === 10 ? 'T12:00:00' : '')) : now;
        const dias = Math.max(0, Math.floor((now.getTime() - fecha.getTime()) / 86400000));
        const total = Number(p.total || 0);
        if (!mapa[nombre]) {
            mapa[nombre] = { recenciaDias: dias, frecuencia: 1, monto: total };
        } else {
            mapa[nombre].recenciaDias = Math.min(mapa[nombre].recenciaDias, dias);
            mapa[nombre].frecuencia += 1;
            mapa[nombre].monto += total;
        }
    });

    const entries = Object.values(mapa);
    if (!entries.length) return null;

    // Scoring en quintiles (1-5). Recencia: menos días = mejor = score 5.
    const quantileScore = (arr: number[], val: number, invertir = false): number => {
        const sorted = [...arr].sort((a, b) => a - b);
        const rank = sorted.filter(x => x <= val).length;
        const raw = Math.ceil((rank / sorted.length) * 5) || 1;
        return invertir ? (6 - raw) : raw;
    };
    const allR = entries.map(v => v.recenciaDias);
    const allF = entries.map(v => v.frecuencia);
    const allM = entries.map(v => v.monto);

    const result: Record<string, any> = {};
    Object.entries(mapa).forEach(([nombre, v]) => {
        const r = quantileScore(allR, v.recenciaDias, true); // invertir: menor recencia = score más alto
        const f = quantileScore(allF, v.frecuencia);
        const m = quantileScore(allM, v.monto);

        let segment = 'ocasional';
        if (r >= 4 && f >= 4) segment = 'campeon';
        else if ((f >= 3 && m >= 3) || (r >= 4 && m >= 4)) segment = 'leal';
        else if (r >= 3 && f <= 2) segment = 'prometedor';
        else if (r <= 2 && f >= 3) segment = 'en_riesgo';
        else if (r === 1 && f <= 2) segment = 'hibernando';

        result[nombre] = { r, f, m, segment, recenciaDias: v.recenciaDias, frecuencia: v.frecuencia, monto: v.monto };
    });
    return result;
}
window._calcRFMScores = _calcRFMScores;

function renderRFMPanel() {
    const wrapper = document.getElementById('rfmPanelWrapper');
    if (!wrapper) return;

    const rfm = _calcRFMScores();
    if (!rfm) {
        wrapper.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:20px;font-size:.85rem">Sin pedidos finalizados para calcular RFM</p>';
        return;
    }

    const counts: Record<string, string[]> = {};
    _RFM_SEGMENTS.forEach(s => { counts[s.key] = []; });
    Object.entries(rfm).forEach(([nombre, v]) => {
        if (counts[v.segment]) counts[v.segment].push(nombre);
    });

    const cards = _RFM_SEGMENTS.map(seg => {
        const lista = counts[seg.key] || [];
        const preview = lista.slice(0, 3).map(n => `<span style="font-size:.7rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1px 8px;color:#374151">${_escAttr ? _escAttr(n) : n}</span>`).join(' ');
        const mas = lista.length > 3 ? `<span style="font-size:.7rem;color:#9ca3af">+${lista.length - 3} más</span>` : '';
        return `<div style="background:${seg.bg};border-radius:14px;padding:14px;cursor:pointer;transition:box-shadow .15s"
            onclick="window._rfmVerSegmento('${seg.key}')" title="${seg.desc}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.3rem">${seg.emoji}</span>
                <div>
                    <div style="font-weight:700;font-size:.85rem;color:${seg.color}">${seg.label}</div>
                    <div style="font-size:.7rem;color:#6b7280">${seg.desc}</div>
                </div>
                <span style="margin-left:auto;font-size:1.4rem;font-weight:800;color:${seg.color}">${lista.length}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:20px">${preview}${mas}</div>
        </div>`;
    }).join('');

    wrapper.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:4px 0">${cards}</div>`;
}
window.renderRFMPanel = renderRFMPanel;

window._rfmVerSegmento = function(segKey: string) {
    const rfm = _calcRFMScores();
    if (!rfm) return;
    const seg = _RFM_SEGMENTS.find(s => s.key === segKey);
    if (!seg) return;
    const entries = Object.entries(rfm).filter(([,v]) => v.segment === segKey);
    const panel = document.getElementById('rfmDetallePanel');
    if (!panel) return;

    if (!entries.length) {
        panel.innerHTML = `<p style="padding:12px;color:#9ca3af;font-size:.85rem">Sin clientes en este segmento</p>`;
        panel.style.display = '';
        return;
    }

    const filas = entries
        .sort(([,a],[,b]) => b.monto - a.monto)
        .map(([nombre, v]) => {
            const _e = (s: string) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return `<tr style="border-bottom:1px solid #f3f4f6">
                <td style="padding:7px 10px;font-size:.8rem;font-weight:600;color:#374151">${_e(nombre)}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:center">${v.frecuencia}</td>
                <td style="padding:7px 10px;font-size:.8rem;font-weight:700;color:#059669;text-align:right">$${v.monto.toLocaleString('es-MX',{maximumFractionDigits:0})}</td>
                <td style="padding:7px 10px;font-size:.8rem;color:#6b7280;text-align:right">${v.recenciaDias}d</td>
                <td style="padding:7px 10px;text-align:center"><span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${seg.bg};color:${seg.color}">${v.r}·${v.f}·${v.m}</span></td>
            </tr>`;
        }).join('');

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px 6px;border-bottom:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:.9rem;color:${seg.color}">${seg.emoji} ${seg.label} — ${entries.length} cliente${entries.length!==1?'s':''}</span>
            <button onclick="document.getElementById('rfmDetallePanel').style.display='none'" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1.1rem">✕</button>
        </div>
        <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:#fafafa">
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:left">Cliente</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:center"># Pedidos</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:right">Total</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:right">Recencia</th>
                <th style="padding:5px 10px;font-size:.7rem;color:#6b7280;text-align:center">R·F·M</th>
            </tr></thead>
            <tbody>${filas}</tbody>
        </table>
        </div>`;
    panel.style.display = '';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// ── NTH-10: Ordenamiento de tabla de clientes ────────────────────────────────
let _clientesSortCol = 'name';
let _clientesSortDir = 'asc';

function sortClientes(col) {
    if (_clientesSortCol === col) {
        _clientesSortDir = _clientesSortDir === 'asc' ? 'desc' : 'asc';
    } else {
        _clientesSortCol = col;
        _clientesSortDir = col === 'totalPurchases' ? 'desc' : 'asc';
    }
    renderClientsTable();
}
window.sortClientes = sortClientes;

function _getSortedClients() {
    const col = _clientesSortCol;
    const dir = _clientesSortDir === 'asc' ? 1 : -1;
    return [...clients].sort((a, b) => {
        let va, vb;
        if (col === 'totalPurchases') { va = Number(a.totalPurchases||0); vb = Number(b.totalPurchases||0); return dir * (va - vb); }
        if (col === 'lastPurchase')   { va = a.lastPurchase||''; vb = b.lastPurchase||''; return dir * va.localeCompare(vb); }
        va = (a.name||'').toLowerCase(); vb = (b.name||'').toLowerCase();
        return dir * va.localeCompare(vb);
    });
}

function _sortArrow(col) {
    if (_clientesSortCol !== col) return '<span style="opacity:.3;font-size:.65rem">↕</span>';
    return `<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir === 'asc' ? '↑' : '↓'}</span>`;
}

// ── MEJORA 1: Stats del cliente ───────────────────────────────────────────────
function _calcClienteStats(clienteNombreOrId) {
    const todos = [...(window.pedidos||[]), ...(window.pedidosFinalizados||[])];
    const finalizados = (window.pedidosFinalizados||[]);

    // Filtrar: primero intentar por ID, luego por nombre normalizado
    const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const q = norm(clienteNombreOrId);

    const matchPedido = p => {
        if (p.clienteId && String(p.clienteId) === String(clienteNombreOrId)) return true;
        if (p.clientId && String(p.clientId) === String(clienteNombreOrId)) return true;
        return norm(p.cliente || p.clientName || '') === q;
    };

    const pedidosCliente = todos.filter(matchPedido);
    const finalizadosCliente = finalizados.filter(matchPedido);

    const totalPedidos = pedidosCliente.length;
    const totalGastado = finalizadosCliente.reduce((s,p) => s + (Number(p.total)||0), 0);
    const ticketPromedio = finalizadosCliente.length > 0 ? totalGastado / finalizadosCliente.length : 0;

    // Obtener fecha más reciente de cualquier campo de fecha disponible
    const fechas = pedidosCliente
        .map(p => p.fechaPedido || p.fechaCreacion || p.fecha || p.fechaFinalizado || '')
        .filter(Boolean).sort().reverse();
    const ultimoPedido = fechas[0] || null;

    return { totalPedidos, totalGastado, ticketPromedio, ultimoPedido };
}
window._calcClienteStats = _calcClienteStats;

// ── MEJORA 2: Tags de actividad automáticos ───────────────────────────────────
const _tagStyles = {
    'nuevo':    'background:#dbeafe;color:#1e40af',
    'activo':   'background:#dcfce7;color:#15803d',
    'en-riesgo':'background:#fed7aa;color:#c2410c',
    'inactivo': 'background:#fee2e2;color:#dc2626'
};

function _tagActividad(cliente) {
    const stats = _calcClienteStats(cliente.nombre || cliente.name || '');

    if (!stats.ultimoPedido) {
        return { label: 'Nuevo', color: _tagStyles['nuevo'], clase: 'nuevo' };
    }

    const hoy = new Date();
    const ultimo = new Date(stats.ultimoPedido);
    const diffDias = Math.floor((hoy - ultimo) / (1000 * 60 * 60 * 24));

    if (diffDias <= 60) {
        return { label: 'Activo', color: _tagStyles['activo'], clase: 'activo' };
    } else if (diffDias <= 120) {
        return { label: 'En riesgo', color: _tagStyles['en-riesgo'], clase: 'en-riesgo' };
    } else {
        return { label: 'Inactivo', color: _tagStyles['inactivo'], clase: 'inactivo' };
    }
}
window._tagActividad = _tagActividad;

// ── MEJORA 3: Botón WhatsApp ──────────────────────────────────────────────────
function _abrirWhatsApp(telefono) {
    let num = String(telefono || '').replace(/[\s\-\(\)]/g, '');
    let url;
    if (num.startsWith('+') || num.startsWith('52')) {
        url = `https://wa.me/${num.replace('+', '')}`;
    } else {
        url = `https://wa.me/521${num}`;
    }
    if (window.electron?.shell?.openExternal) {
        window.electron.shell.openExternal(url);
    } else {
        window.open(url, '_blank');
    }
}
window._abrirWhatsApp = _abrirWhatsApp;

// ── MEJORA 5: Historial de pedidos en ficha del cliente ───────────────────────
function renderHistorialClienteModal(clienteNombre) {
    const normQ = String(clienteNombre || '').toLowerCase().trim();
    const todos = [...(window.pedidos || []), ...(window.pedidosFinalizados || [])];

    const pedidosCliente = todos.filter(p => {
        const nombre = (p.cliente || '').toLowerCase().trim();
        return nombre === normQ;
    });

    // Ordenar por fecha desc, tomar 8 últimos
    const ultimos = pedidosCliente
        .slice()
        .sort((a, b) => (b.fechaPedido || '').localeCompare(a.fechaPedido || ''))
        .slice(0, 8);

    if (ultimos.length === 0) {
        return '<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';
    }

    const statusEmoji = s => {
        const st = (s || '').toLowerCase();
        if (st === 'entregado' || st === 'finalizado') return '✅';
        if (st === 'cancelado') return '❌';
        if (st === 'en proceso' || st === 'produccion' || st === 'producción') return '🔄';
        if (st === 'pendiente') return '⏳';
        if (st === 'listo') return '📦';
        return '🔵';
    };

    const filas = ultimos.map(p => {
        const saldo = typeof window.calcSaldoPendiente === 'function'
            ? window.calcSaldoPendiente(p)
            : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
        const saldoHtml = saldo > 0
            ? `<span style="color:#dc2626">$${saldo.toFixed(2)}</span>`
            : `<span style="color:#15803d">Pagado ✓</span>`;
        return `<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(p.folio || '—')}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${p.fechaPedido || '—'}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(p.total || 0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${saldoHtml}</td>
            <td style="padding:6px 8px;font-size:.75rem">${statusEmoji(p.status)} ${_esc(p.status || '—')}</td>
        </tr>`;
    }).join('');

    return `<table style="width:100%;border-collapse:collapse">
        <thead>
            <tr style="background:#f9fafb">
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Folio</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Fecha</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Total</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Saldo</th>
                <th style="padding:6px 8px;font-size:.7rem;font-weight:700;color:#6b7280;text-align:left">Status</th>
            </tr>
        </thead>
        <tbody>${filas}</tbody>
    </table>`;
}
window.renderHistorialClienteModal = renderHistorialClienteModal;

// ── MEJORA 6: Estado activo de filtro de actividad ────────────────────────────
window._clienteFiltroTag = '';

// ── Helper: obtener clientes a renderizar según filtro activo ─────────────────
function _clientesFiltrados() {
    const tag = window._clienteFiltroTag || '';
    if (!tag) return [...clients];
    return clients.filter(c => {
        const t = _tagActividad(c);
        return t.clase === tag;
    });
}

// ── MEJORA 6: Render de botones de filtro de actividad ────────────────────────
function _renderFiltrosActividad() {
    const searchWrap = document.getElementById('searchClient')?.parentElement?.parentElement;
    if (!searchWrap) return;

    // No duplicar
    if (document.getElementById('_mkFiltrosActividad')) return;

    const filtros = [
        { tag: '',         label: 'Todos',     bg: '#f3f4f6', color: '#374151' },
        { tag: 'activo',   label: 'Activos',   bg: '#dcfce7', color: '#15803d' },
        { tag: 'en-riesgo',label: 'En riesgo', bg: '#fed7aa', color: '#c2410c' },
        { tag: 'inactivo', label: 'Inactivos', bg: '#fee2e2', color: '#dc2626' },
        { tag: 'nuevo',    label: 'Nuevos',    bg: '#dbeafe', color: '#1e40af' },
    ];

    const wrapper = document.createElement('div');
    wrapper.id = '_mkFiltrosActividad';
    wrapper.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;';

    filtros.forEach(f => {
        const btn = document.createElement('button');
        btn.dataset.filtroTag = f.tag;
        btn.textContent = f.label;
        const isActive = (window._clienteFiltroTag || '') === f.tag;
        btn.style.cssText = `padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${isActive ? f.color : 'transparent'};background:${f.bg};color:${f.color};transition:border .15s;`;
        btn.onclick = () => {
            window._clienteFiltroTag = f.tag;
            // Actualizar estilos activos
            wrapper.querySelectorAll('button').forEach(b => {
                const bf = filtros.find(x => x.tag === b.dataset.filtroTag);
                if (!bf) return;
                const activo = b.dataset.filtroTag === f.tag;
                b.style.border = `2px solid ${activo ? bf.color : 'transparent'}`;
            });
            renderClientsTable();
        };
        wrapper.appendChild(btn);
    });

    // Insertar antes del div del buscador
    searchWrap.parentElement.insertBefore(wrapper, searchWrap);
}

// ============== CLIENTS MODULE ==============

        function renderClientsTable() {
            // MEJORA 6: inicializar filtros si no existen
            _renderFiltrosActividad();
            // N9: actualizar panel RFM
            if (typeof renderRFMPanel === 'function') renderRFMPanel();

            const tbody = document.getElementById('clientsTable');
            const listaClientes = _clientesFiltrados();

            if (clients.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7">
  <div class="mk-empty">
    <div class="mk-empty-icon">👥</div>
    <p class="mk-empty-title">Sin clientes aún</p>
    <p class="mk-empty-sub">Agrega tu primer cliente para llevar un registro de compras y datos de contacto.</p>
    <div class="mk-empty-action">
      <button onclick="openAddClientModal()" class="btn-primary px-6 py-2.5 rounded-xl text-sm">
        + Agregar primer cliente
      </button>
    </div>
  </div>
</td></tr>`;
                updateClientStats();
                return;
            }

            if (listaClientes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin clientes con ese filtro</p></td></tr>`;
                updateClientStats();
                return;
            }

            // NTH-10: render sortable header
            const thead = tbody.closest('table')?.querySelector('thead tr');
            if (thead) {
                const cols = [
                    { key:'name',           label:'Cliente' },
                    { key:null,             label:'Contacto' },
                    { key:null,             label:'Email' },
                    { key:'totalPurchases', label:'Total Compras' },
                    { key:'lastPurchase',   label:'Última Compra' },
                    { key:null,             label:'Tipo' },
                    { key:null,             label:'Acciones' },
                ];
                thead.innerHTML = cols.map(c => c.key
                    ? `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(c.key)}')">${c.label} ${_sortArrow(c.key)}</th>`
                    : `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${c.label}</th>`
                ).join('');
            }

            // NTH-12: colores de avatar por inicial — usando clases mk-avatar del ui-redesign
            function _avatarClass(name) {
                const c = (name || '').trim().toLowerCase().charCodeAt(0);
                if (c >= 97 && c <= 101) return 'mk-avatar-gold';
                if (c >= 102 && c <= 108) return 'mk-avatar-lila';
                if (c >= 109 && c <= 114) return 'mk-avatar-peach';
                return 'mk-avatar-green';
            }
            function _getInitiales(nombre) {
                const partes = (nombre || '').trim().split(' ');
                return ((partes[0]||'')[0] || '') + (partes[1] ? partes[1][0] : '');
            }

            // Aplicar ordenamiento a la lista filtrada
            const col = _clientesSortCol;
            const dir = _clientesSortDir === 'asc' ? 1 : -1;
            const listaOrdenada = [...listaClientes].sort((a, b) => {
                let va, vb;
                if (col === 'totalPurchases') { va = Number(a.totalPurchases||0); vb = Number(b.totalPurchases||0); return dir * (va - vb); }
                if (col === 'lastPurchase')   { va = a.lastPurchase||''; vb = b.lastPurchase||''; return dir * va.localeCompare(vb); }
                va = (a.name||'').toLowerCase(); vb = (b.name||'').toLowerCase();
                return dir * va.localeCompare(vb);
            });

            // FIX-2: pre-calcular stats de todos los clientes una sola vez (evita O(n×m))
            const _statsCache = {};
            (window.clientes || clients || []).forEach(c => {
                const key = c.id || c.nombre || c.name || '';
                _statsCache[key] = _calcClienteStats(c.id || c.nombre || c.name || '');
            });

            tbody.innerHTML = listaOrdenada.map((client, rowIndex) => {
                const esVIP = client.isVIP || client.type === 'vip';
                // NTH-12: avatar con clases mk-avatar del ui-redesign
                const iniciales = _getInitiales(client.name || '?').toUpperCase() || (client.name || '?').trim().charAt(0).toUpperCase();
                const avatarClass = _avatarClass(client.name);

                // NTH-11: snippet de nota más reciente vinculada a este cliente
                const notasCliente = (window.notas || []).filter(n =>
                    n.cliente && n.cliente.toLowerCase() === (client.name||'').toLowerCase()
                ).sort((a,b) => (b.fechaCreacion||b.fecha||'').localeCompare(a.fechaCreacion||a.fecha||''));
                const snippetNota = notasCliente.length > 0
                    ? `<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(notasCliente[0].texto)}">📝 ${_esc((notasCliente[0].texto||'').substring(0,40))}${(notasCliente[0].texto||'').length>40?'…':''}</div>`
                    : '';

                // MEJORA 4: notas del cliente en la tarjeta
                const notasClienteSnippet = client.notas
                    ? `<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(client.notas)}">📝 ${_esc(client.notas.substring(0, 60))}${client.notas.length > 60 ? '…' : ''}</div>`
                    : '';

                // MEJORA 1: stats del cliente — leer desde cache pre-calculado
                const _cacheKey = client.id || client.nombre || client.name || '';
                const stats = _statsCache[_cacheKey] || _calcClienteStats(_cacheKey);
                const statsHtml = `<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">📦 ${stats.totalPedidos}</span>
                    <span title="Total gastado">💰 $${stats.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">🎯 $${stats.ticketPromedio.toFixed(0)}</span>
                    ${stats.ultimoPedido ? `<span title="Último pedido">🕐 ${stats.ultimoPedido}</span>` : ''}
                </div>`;

                // MEJORA 2: tag de actividad
                const tag = _tagActividad(client);
                const tagBadge = `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${tag.color}">${tag.label}</span>`;

                // MEJORA 3: botón WhatsApp
                const waBtn = client.phone
                    ? `<button onclick="_abrirWhatsApp('${_escAttr(client.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">📱 WhatsApp</button>`
                    : '';

                return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="mk-avatar ${avatarClass}">
                                ${iniciales}
                            </div>
                            <div>
                                <div style="display:flex;align-items:center;gap:6px">
                                    <span class="font-semibold text-gray-800">${_esc(client.name)}</span>
                                    ${tagBadge}
                                </div>
                                ${snippetNota}
                                ${notasClienteSnippet}
                                ${statsHtml}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${client.phone ? `<div style="display:flex;flex-direction:column;gap:4px">
        <a href="https://wa.me/521${_esc(client.phone).replace(/\D/g,'')}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(client.phone)}</a>
        ${waBtn}
    </div>` : ''}
${client.facebook ? `<a href="${_esc(client.facebook).startsWith('http') ? _esc(client.facebook) : 'https://'+_esc(client.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(client.facebook)}</a>` : ''}
${!client.phone && !client.facebook ? '—' : ''}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${client.email ? _esc(client.email) : '—'}</td>
                    <td class="px-6 py-4 text-gray-800 font-semibold">$${(client.totalPurchases||0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${client.lastPurchase || '—'}</td>
                    <td class="px-6 py-4">
                        ${esVIP ? '<span class="badge-vip">VIP</span>' : '<span class="badge-success">Regular</span>'}
                    </td>
                    <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(client.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(client.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(client.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                </tr>
            `; }).join('');

            updateClientStats();
        }

        function updateClientStats() {
            document.getElementById('totalClients').textContent = clients.length;
            document.getElementById('vipClients').textContent = clients.filter(c => c.isVIP || c.type === 'vip').length;
            const totalPurchases = clients.reduce((sum, c) => sum + (Number(c.totalPurchases)||0), 0);
            document.getElementById('totalPurchases').textContent = `$${totalPurchases.toFixed(2)}`;
        }

        let selectedClientType = 'regular';

function selectClientType(type) {
    selectedClientType = type;
    document.getElementById('clientType').value = type;
    const btnR = document.getElementById('btnClientRegular');
    const btnV = document.getElementById('btnClientVip');
    if (type === 'vip') {
        btnV.style.borderColor = '#C5A572'; btnV.style.background = '#FFF9F0'; btnV.style.color = '#C5A572';
        btnR.style.borderColor = '#E5E7EB'; btnR.style.background = 'white'; btnR.style.color = '#6B7280';
    } else {
        btnR.style.borderColor = '#C5A572'; btnR.style.background = '#FFF9F0'; btnR.style.color = '#C5A572';
        btnV.style.borderColor = '#E5E7EB'; btnV.style.background = 'white'; btnV.style.color = '#6B7280';
    }
}

function openAddClientModal() {
    document.getElementById('clientModalTitle').textContent = 'Nuevo Cliente';
    document.getElementById('clientSubmitBtn').innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cliente';
    document.getElementById('editClientId').value = '';
    document.getElementById('addClientForm').reset();
    selectClientType('regular');
    openModal('addClientModal');
}

function closeAddClientModal() {
    closeModal('addClientModal');
    document.getElementById('addClientForm').reset();
}

// editClient definida en el módulo de clientes (carga nombre, teléfono, fb, email, notas)

        document.getElementById('addClientForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const editId = document.getElementById('editClientId').value;
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const facebook = document.getElementById('clientFacebook').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    // Validar email antes de guardar
    if (!_validEmail(email)) { manekiToastExport('Email inválido', 'warn'); return; }
    const type = document.getElementById('clientType').value || 'regular';
    // MEJORA 4: leer notas del cliente
    const notas = (document.getElementById('clientNotas')?.value || '').trim();

    if (editId) {
        // ── EDITAR ──
        const client = clients.find(c => String(c.id) === String(editId));
        if (client) {
            client.name = name;
            client.phone = phone;
            client.facebook = facebook;
            client.email = email;
            client.type = type;
            client.isVIP = type === 'vip'; // keep both fields in sync
            client.notas = notas;
        }
    } else {
        // ── CREAR ──
        const newClient = {
            // BUG #8 FIX: randomUUID evita colisión de IDs cuando dos clientes
            // se crean en el mismo milisegundo.
            id: mkId(),
            name,
            phone,
            facebook,
            email,
            type,
            isVIP: type === 'vip', // keep both fields in sync
            notas,
            totalPurchases: 0,
            lastPurchase: null // BA-05 FIX: null para clientes nuevos sin compras aún
        };
        // FIX M2: detectar posibles duplicados antes de guardar
        function _normNombre(s) {
            return String(s || '').toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
                .replace(/\s+/g,' ');
        }
        const _nombreNuevo = _normNombre(name);
        const _telNuevo = String(phone || '').replace(/\D/g,'').slice(-8);
        const _posibleDuplicado = clients.find(cx => {
            const mismoNombre = _normNombre(cx.name || '') === _nombreNuevo && _nombreNuevo !== '';
            const mismoTel = _telNuevo.length >= 6 && String(cx.phone || '').replace(/\D/g,'').slice(-8) === _telNuevo;
            return mismoNombre || mismoTel;
        });
        if (_posibleDuplicado) {
            manekiToastExport(`⚠️ Ya existe un cliente similar: "${_posibleDuplicado.name}". Verifica si es el mismo.`, 'warn');
            // Solo aviso — el usuario decide si continúa
        }

        clients.push(newClient);
    }

    saveClients();
    closeAddClientModal();
    renderClientsTable();
    updateDashboard();
});

        function editClient(clientId) {
    // BUG-CLI-01 FIX: usar String() para comparar — clientId puede llegar como string desde HTML
    // pero c.id puede ser número si vino de datos legacy, causando c.id===clientId siempre false.
    const client = clients.find(c => String(c.id) === String(clientId));
    if (!client) return;
    document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
    document.getElementById('clientSubmitBtn').innerHTML = '<i class="fas fa-save mr-2"></i>Actualizar Cliente';
    document.getElementById('editClientId').value = clientId;
    document.getElementById('clientName').value = client.name || '';
    document.getElementById('clientPhone').value = client.phone || '';
    document.getElementById('clientFacebook').value = client.facebook || '';
    document.getElementById('clientEmail').value = client.email || '';
    // MEJORA 4: cargar notas en el formulario
    if (document.getElementById('clientNotas')) {
        document.getElementById('clientNotas').value = client.notas || '';
    }
    selectClientType(client.type || 'regular');
    openModal('addClientModal');
}

        function deleteClient(id) {
            const c = clients.find(x => String(x.id) === String(id));

            // FIX A3: verificar pedidos activos antes de confirmar borrado
            const _pedidosCliente = (window.pedidos || []).filter(p =>
                String(p.clienteId || '') === String(id) ||
                String(p.cliente || '').toLowerCase() === String(c ? c.name : '').toLowerCase()
            );
            const _pedidosActivos = _pedidosCliente.filter(p =>
                p.status !== 'finalizado' && p.status !== 'cancelado' && p.status !== 'entregado'
            );

            const _msgConfirm = _pedidosActivos.length > 0
                ? `Este cliente tiene ${_pedidosActivos.length} pedido(s) activo(s). ¿Deseas eliminarlo de todas formas? Los pedidos quedarán sin cliente asignado.\n\n"${c ? c.name : 'este cliente'}" y su historial serán eliminados.`
                : `"${c ? c.name : 'este cliente'}" y su historial serán eliminados.`;
            const _titleConfirm = _pedidosActivos.length > 0 ? '⚠️ Eliminar cliente con pedidos' : '⚠️ Eliminar cliente';

            showConfirm(_msgConfirm, _titleConfirm).then(ok => {
                if (!ok) return;
                clients = clients.filter(c => String(c.id) !== String(id));
                saveClients();
                renderClientsTable();
                // BUG-CLI-03 FIX: actualizar dashboard al eliminar cliente
                if (typeof updateDashboard === 'function') updateDashboard();
            });
        }

        function setupClientSearch() {
            // BUG #7 FIX: c.email.toLowerCase() y c.phone.includes() crashean si el campo
            // es undefined (campos opcionales). Usar optional chaining y coalescencia nula.
            document.getElementById('searchClient').addEventListener('input', function(e) {
                clearTimeout(window._clientSearchT);
                window._clientSearchT = setTimeout(() => {
                // BUG-CLI-01 FIX: normalizar acentos en búsqueda de clientes
                const _normC = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
                const q = _normC(e.target.value || '');
                // Aplicar filtro de tag activo también en la búsqueda
                const baseList = _clientesFiltrados();
                const filteredClients = baseList.filter(c =>
                    _normC(c.name).includes(q) ||
                    _normC(c.email || '').includes(q) ||
                    (c.phone || c.telefono || '').includes(q)
                );

                const tbody = document.getElementById('clientsTable');

                if (filteredClients.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>`;
                    return;
                }

                tbody.innerHTML = filteredClients.map(client => {
                    const esVIP = client.isVIP || client.type === 'vip';
                    // MEJORA 2: tag actividad en búsqueda
                    const tag = _tagActividad(client);
                    const tagBadge = `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${tag.color}">${tag.label}</span>`;
                    // MEJORA 4: notas en búsqueda
                    const notasSnippet = client.notas
                        ? `<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(client.notas)}">📝 ${_esc(client.notas.substring(0, 60))}${client.notas.length > 60 ? '…' : ''}</div>`
                        : '';
                    // MEJORA 3: WhatsApp en búsqueda
                    const waBtn = client.phone
                        ? `<button onclick="_abrirWhatsApp('${_escAttr(client.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">📱 WhatsApp</button>`
                        : '';
                    return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(197,151,59,0.18) !important;">
                                    <i class="fas fa-user" style="color: #C5A572 !important;"></i>
                                </div>
                                <div>
                                    <div style="display:flex;align-items:center;gap:6px">
                                        <span class="font-semibold text-gray-800">${_esc(client.name)}</span>
                                        ${tagBadge}
                                    </div>
                                    ${notasSnippet}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">
    ${client.phone ? `<div style="display:flex;flex-direction:column;gap:2px">
        <a href="https://wa.me/521${_esc(client.phone).replace(/\D/g,'')}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(client.phone)}</a>
        ${waBtn}
    </div>` : ''}
${client.facebook ? `<a href="${_esc(client.facebook).startsWith('http') ? _esc(client.facebook) : 'https://'+_esc(client.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(client.facebook)}</a>` : ''}
${!client.phone && !client.facebook ? '—' : ''}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${client.email ? _esc(client.email) : '—'}</td>
                        <td class="px-6 py-4 text-gray-800 font-semibold">$${(client.totalPurchases || 0).toFixed(2)}</td>
                        <td class="px-6 py-4 text-gray-600">${client.lastPurchase || '—'}</td>
                        <td class="px-6 py-4">
                            ${esVIP ? '<span class="badge-vip">VIP</span>' : '<span class="badge-success">Regular</span>'}
                        </td>
                        <td class="px-6 py-4">
    <div class="flex items-center gap-3">
        <button onclick="editClient('${_escAttr(client.id)}')" class="text-yellow-500 hover:text-yellow-700" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button onclick="openClientHistory('${_escAttr(client.id)}')" class="text-blue-500 hover:text-blue-700" title="Ver historial">
            <i class="fas fa-history"></i>
        </button>
        <button onclick="deleteClient('${_escAttr(client.id)}')" class="text-red-500 hover:text-red-700" title="Eliminar">
            <i class="fas fa-trash"></i>
        </button>
    </div>
</td>
                    </tr>
                `; }).join('');
                }, 180); // fin debounce setTimeout
            });
        }
