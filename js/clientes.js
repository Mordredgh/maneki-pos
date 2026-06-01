function _validEmail(e) {
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
const _escAttr = window._esc;
let _clientesSortCol = "name";
let _clientesSortDir = "asc";
function sortClientes(col) {
  if (_clientesSortCol === col) {
    _clientesSortDir = _clientesSortDir === "asc" ? "desc" : "asc";
  } else {
    _clientesSortCol = col;
    _clientesSortDir = col === "totalPurchases" ? "desc" : "asc";
  }
  renderClientsTable();
}
window.sortClientes = sortClientes;
function _getSortedClients() {
  const col = _clientesSortCol;
  const dir = _clientesSortDir === "asc" ? 1 : -1;
  return [...clients].sort((a, b) => {
    let va, vb;
    if (col === "totalPurchases") {
      va = Number(a.totalPurchases || 0);
      vb = Number(b.totalPurchases || 0);
      return dir * (va - vb);
    }
    if (col === "lastPurchase") {
      va = a.lastPurchase || "";
      vb = b.lastPurchase || "";
      return dir * va.localeCompare(vb);
    }
    va = (a.name || "").toLowerCase();
    vb = (b.name || "").toLowerCase();
    return dir * va.localeCompare(vb);
  });
}
function _sortArrow(col) {
  if (_clientesSortCol !== col) return '<span style="opacity:.3;font-size:.65rem">\u2195</span>';
  return `<span style="font-size:.65rem;color:#C5A572">${_clientesSortDir === "asc" ? "\u2191" : "\u2193"}</span>`;
}
function _calcClienteStats(clienteNombreOrId) {
  const todos = [...window.pedidos || [], ...window.pedidosFinalizados || []];
  const finalizados = window.pedidosFinalizados || [];
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = norm(clienteNombreOrId);
  const matchPedido = (p) => {
    if (p.clienteId && String(p.clienteId) === String(clienteNombreOrId)) return true;
    if (p.clientId && String(p.clientId) === String(clienteNombreOrId)) return true;
    return norm(p.cliente || p.clientName || "") === q;
  };
  const pedidosCliente = todos.filter(matchPedido);
  const finalizadosCliente = finalizados.filter(matchPedido);
  const totalPedidos = pedidosCliente.length;
  const totalGastado = finalizadosCliente.reduce((s, p) => s + (Number(p.total) || 0), 0);
  const ticketPromedio = finalizadosCliente.length > 0 ? totalGastado / finalizadosCliente.length : 0;
  const fechas = pedidosCliente.map((p) => p.fechaPedido || p.fechaCreacion || p.fecha || p.fechaFinalizado || "").filter(Boolean).sort().reverse();
  const ultimoPedido = fechas[0] || null;
  return { totalPedidos, totalGastado, ticketPromedio, ultimoPedido };
}
window._calcClienteStats = _calcClienteStats;
const _tagStyles = {
  "nuevo": "background:#dbeafe;color:#1e40af",
  "activo": "background:#dcfce7;color:#15803d",
  "en-riesgo": "background:#fed7aa;color:#c2410c",
  "inactivo": "background:#fee2e2;color:#dc2626"
};
function _tagActividad(cliente) {
  const stats = _calcClienteStats(cliente.nombre || cliente.name || "");
  if (!stats.ultimoPedido) {
    return { label: "Nuevo", color: _tagStyles["nuevo"], clase: "nuevo" };
  }
  const hoy = /* @__PURE__ */ new Date();
  const ultimo = new Date(stats.ultimoPedido);
  const diffDias = Math.floor((hoy - ultimo) / (1e3 * 60 * 60 * 24));
  if (diffDias <= 60) {
    return { label: "Activo", color: _tagStyles["activo"], clase: "activo" };
  } else if (diffDias <= 120) {
    return { label: "En riesgo", color: _tagStyles["en-riesgo"], clase: "en-riesgo" };
  } else {
    return { label: "Inactivo", color: _tagStyles["inactivo"], clase: "inactivo" };
  }
}
window._tagActividad = _tagActividad;
function _abrirWhatsApp(telefono) {
  let num = String(telefono || "").replace(/[\s\-\(\)]/g, "");
  let url;
  if (num.startsWith("+") || num.startsWith("52")) {
    url = `https://wa.me/${num.replace("+", "")}`;
  } else {
    url = `https://wa.me/521${num}`;
  }
  if (window.electron?.shell?.openExternal) {
    window.electron.shell.openExternal(url);
  } else {
    window.open(url, "_blank");
  }
}
window._abrirWhatsApp = _abrirWhatsApp;
function renderHistorialClienteModal(clienteNombre) {
  const normQ = String(clienteNombre || "").toLowerCase().trim();
  const todos = [...window.pedidos || [], ...window.pedidosFinalizados || []];
  const pedidosCliente = todos.filter((p) => {
    const nombre = (p.cliente || "").toLowerCase().trim();
    return nombre === normQ;
  });
  const ultimos = pedidosCliente.slice().sort((a, b) => (b.fechaPedido || "").localeCompare(a.fechaPedido || "")).slice(0, 8);
  if (ultimos.length === 0) {
    return '<p class="text-gray-400 text-center py-4 text-sm">Sin pedidos registrados</p>';
  }
  const statusEmoji = (s) => {
    const st = (s || "").toLowerCase();
    if (st === "entregado" || st === "finalizado") return "\u2705";
    if (st === "cancelado") return "\u274C";
    if (st === "en proceso" || st === "produccion" || st === "producci\xF3n") return "\u{1F504}";
    if (st === "pendiente") return "\u23F3";
    if (st === "listo") return "\u{1F4E6}";
    return "\u{1F535}";
  };
  const filas = ultimos.map((p) => {
    const saldo = typeof window.calcSaldoPendiente === "function" ? window.calcSaldoPendiente(p) : Math.max(0, Number(p.total || 0) - Number(p.anticipo || 0));
    const saldoHtml = saldo > 0 ? `<span style="color:#dc2626">$${saldo.toFixed(2)}</span>` : `<span style="color:#15803d">Pagado \u2713</span>`;
    return `<tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#374151">${_esc(p.folio || "\u2014")}</td>
            <td style="padding:6px 8px;font-size:.75rem;color:#6b7280">${p.fechaPedido || "\u2014"}</td>
            <td style="padding:6px 8px;font-size:.75rem;font-weight:600;color:#111827">$${Number(p.total || 0).toFixed(2)}</td>
            <td style="padding:6px 8px;font-size:.75rem">${saldoHtml}</td>
            <td style="padding:6px 8px;font-size:.75rem">${statusEmoji(p.status)} ${_esc(p.status || "\u2014")}</td>
        </tr>`;
  }).join("");
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
window._clienteFiltroTag = "";
function _clientesFiltrados() {
  const tag = window._clienteFiltroTag || "";
  if (!tag) return [...clients];
  return clients.filter((c) => {
    const t = _tagActividad(c);
    return t.clase === tag;
  });
}
function _renderFiltrosActividad() {
  const searchWrap = document.getElementById("searchClient")?.parentElement?.parentElement;
  if (!searchWrap) return;
  if (document.getElementById("_mkFiltrosActividad")) return;
  const filtros = [
    { tag: "", label: "Todos", bg: "#f3f4f6", color: "#374151" },
    { tag: "activo", label: "Activos", bg: "#dcfce7", color: "#15803d" },
    { tag: "en-riesgo", label: "En riesgo", bg: "#fed7aa", color: "#c2410c" },
    { tag: "inactivo", label: "Inactivos", bg: "#fee2e2", color: "#dc2626" },
    { tag: "nuevo", label: "Nuevos", bg: "#dbeafe", color: "#1e40af" }
  ];
  const wrapper = document.createElement("div");
  wrapper.id = "_mkFiltrosActividad";
  wrapper.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;padding:12px 24px 0;";
  filtros.forEach((f) => {
    const btn = document.createElement("button");
    btn.dataset.filtroTag = f.tag;
    btn.textContent = f.label;
    const isActive = (window._clienteFiltroTag || "") === f.tag;
    btn.style.cssText = `padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:600;cursor:pointer;border:2px solid ${isActive ? f.color : "transparent"};background:${f.bg};color:${f.color};transition:border .15s;`;
    btn.onclick = () => {
      window._clienteFiltroTag = f.tag;
      wrapper.querySelectorAll("button").forEach((b) => {
        const bf = filtros.find((x) => x.tag === b.dataset.filtroTag);
        if (!bf) return;
        const activo = b.dataset.filtroTag === f.tag;
        b.style.border = `2px solid ${activo ? bf.color : "transparent"}`;
      });
      renderClientsTable();
    };
    wrapper.appendChild(btn);
  });
  searchWrap.parentElement.insertBefore(wrapper, searchWrap);
}
function renderClientsTable() {
  _renderFiltrosActividad();
  const tbody = document.getElementById("clientsTable");
  const listaClientes = _clientesFiltrados();
  if (clients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">
  <div class="mk-empty">
    <div class="mk-empty-icon">\u{1F465}</div>
    <p class="mk-empty-title">Sin clientes a\xFAn</p>
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
  const thead = tbody.closest("table")?.querySelector("thead tr");
  if (thead) {
    const cols = [
      { key: "name", label: "Cliente" },
      { key: null, label: "Contacto" },
      { key: null, label: "Email" },
      { key: "totalPurchases", label: "Total Compras" },
      { key: "lastPurchase", label: "\xDAltima Compra" },
      { key: null, label: "Tipo" },
      { key: null, label: "Acciones" }
    ];
    thead.innerHTML = cols.map(
      (c) => c.key ? `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-amber-600 select-none" onclick="sortClientes('${_escAttr(c.key)}')">${c.label} ${_sortArrow(c.key)}</th>` : `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${c.label}</th>`
    ).join("");
  }
  function _avatarClass(name) {
    const c = (name || "").trim().toLowerCase().charCodeAt(0);
    if (c >= 97 && c <= 101) return "mk-avatar-gold";
    if (c >= 102 && c <= 108) return "mk-avatar-lila";
    if (c >= 109 && c <= 114) return "mk-avatar-peach";
    return "mk-avatar-green";
  }
  function _getInitiales(nombre) {
    const partes = (nombre || "").trim().split(" ");
    return ((partes[0] || "")[0] || "") + (partes[1] ? partes[1][0] : "");
  }
  const col = _clientesSortCol;
  const dir = _clientesSortDir === "asc" ? 1 : -1;
  const listaOrdenada = [...listaClientes].sort((a, b) => {
    let va, vb;
    if (col === "totalPurchases") {
      va = Number(a.totalPurchases || 0);
      vb = Number(b.totalPurchases || 0);
      return dir * (va - vb);
    }
    if (col === "lastPurchase") {
      va = a.lastPurchase || "";
      vb = b.lastPurchase || "";
      return dir * va.localeCompare(vb);
    }
    va = (a.name || "").toLowerCase();
    vb = (b.name || "").toLowerCase();
    return dir * va.localeCompare(vb);
  });
  const _statsCache = {};
  (window.clientes || clients || []).forEach((c) => {
    const key = c.id || c.nombre || c.name || "";
    _statsCache[key] = _calcClienteStats(c.id || c.nombre || c.name || "");
  });
  tbody.innerHTML = listaOrdenada.map((client, rowIndex) => {
    const esVIP = client.isVIP || client.type === "vip";
    const iniciales = _getInitiales(client.name || "?").toUpperCase() || (client.name || "?").trim().charAt(0).toUpperCase();
    const avatarClass = _avatarClass(client.name);
    const notasCliente = (window.notas || []).filter(
      (n) => n.cliente && n.cliente.toLowerCase() === (client.name || "").toLowerCase()
    ).sort((a, b) => (b.fechaCreacion || b.fecha || "").localeCompare(a.fechaCreacion || a.fecha || ""));
    const snippetNota = notasCliente.length > 0 ? `<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(notasCliente[0].texto)}">\u{1F4DD} ${_esc((notasCliente[0].texto || "").substring(0, 40))}${(notasCliente[0].texto || "").length > 40 ? "\u2026" : ""}</div>` : "";
    const notasClienteSnippet = client.notas ? `<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(client.notas)}">\u{1F4DD} ${_esc(client.notas.substring(0, 60))}${client.notas.length > 60 ? "\u2026" : ""}</div>` : "";
    const _cacheKey = client.id || client.nombre || client.name || "";
    const stats = _statsCache[_cacheKey] || _calcClienteStats(_cacheKey);
    const statsHtml = `<div style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                    <span title="Total pedidos">\u{1F4E6} ${stats.totalPedidos}</span>
                    <span title="Total gastado">\u{1F4B0} $${stats.totalGastado.toFixed(0)}</span>
                    <span title="Ticket promedio">\u{1F3AF} $${stats.ticketPromedio.toFixed(0)}</span>
                    ${stats.ultimoPedido ? `<span title="\xDAltimo pedido">\u{1F550} ${stats.ultimoPedido}</span>` : ""}
                </div>`;
    const tag = _tagActividad(client);
    const tagBadge = `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${tag.color}">${tag.label}</span>`;
    const waBtn = client.phone ? `<button onclick="_abrirWhatsApp('${_escAttr(client.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer" title="Abrir WhatsApp">\u{1F4F1} WhatsApp</button>` : "";
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
        <a href="https://wa.me/521${_esc(client.phone).replace(/\D/g, "")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(client.phone)}</a>
        ${waBtn}
    </div>` : ""}
${client.facebook ? `<a href="${_esc(client.facebook).startsWith("http") ? _esc(client.facebook) : "https://" + _esc(client.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(client.facebook)}</a>` : ""}
${!client.phone && !client.facebook ? "\u2014" : ""}
</td>
<td class="px-6 py-4 text-gray-600 text-sm">${client.email ? _esc(client.email) : "\u2014"}</td>
                    <td class="px-6 py-4 text-gray-800 font-semibold">$${(client.totalPurchases || 0).toFixed(2)}</td>
                    <td class="px-6 py-4 text-gray-600">${client.lastPurchase || "\u2014"}</td>
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
            `;
  }).join("");
  updateClientStats();
}
function updateClientStats() {
  document.getElementById("totalClients").textContent = clients.length;
  document.getElementById("vipClients").textContent = clients.filter((c) => c.isVIP || c.type === "vip").length;
  const totalPurchases = clients.reduce((sum, c) => sum + (Number(c.totalPurchases) || 0), 0);
  document.getElementById("totalPurchases").textContent = `$${totalPurchases.toFixed(2)}`;
}
let selectedClientType = "regular";
function selectClientType(type) {
  selectedClientType = type;
  document.getElementById("clientType").value = type;
  const btnR = document.getElementById("btnClientRegular");
  const btnV = document.getElementById("btnClientVip");
  if (type === "vip") {
    btnV.style.borderColor = "#C5A572";
    btnV.style.background = "#FFF9F0";
    btnV.style.color = "#C5A572";
    btnR.style.borderColor = "#E5E7EB";
    btnR.style.background = "white";
    btnR.style.color = "#6B7280";
  } else {
    btnR.style.borderColor = "#C5A572";
    btnR.style.background = "#FFF9F0";
    btnR.style.color = "#C5A572";
    btnV.style.borderColor = "#E5E7EB";
    btnV.style.background = "white";
    btnV.style.color = "#6B7280";
  }
}
function openAddClientModal() {
  document.getElementById("clientModalTitle").textContent = "Nuevo Cliente";
  document.getElementById("clientSubmitBtn").innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cliente';
  document.getElementById("editClientId").value = "";
  document.getElementById("addClientForm").reset();
  selectClientType("regular");
  openModal("addClientModal");
}
function closeAddClientModal() {
  closeModal("addClientModal");
  document.getElementById("addClientForm").reset();
}
document.getElementById("addClientForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const editId = document.getElementById("editClientId").value;
  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const facebook = document.getElementById("clientFacebook").value.trim();
  const email = document.getElementById("clientEmail").value.trim();
  if (!_validEmail(email)) {
    manekiToastExport("Email inv\xE1lido", "warn");
    return;
  }
  const type = document.getElementById("clientType").value || "regular";
  const notas = (document.getElementById("clientNotas")?.value || "").trim();
  if (editId) {
    const client = clients.find((c) => String(c.id) === String(editId));
    if (client) {
      client.name = name;
      client.phone = phone;
      client.facebook = facebook;
      client.email = email;
      client.type = type;
      client.isVIP = type === "vip";
      client.notas = notas;
    }
  } else {
    let _normNombre2 = function(s) {
      return String(s || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
    };
    var _normNombre = _normNombre2;
    const newClient = {
      // BUG #8 FIX: randomUUID evita colisión de IDs cuando dos clientes
      // se crean en el mismo milisegundo.
      id: mkId(),
      name,
      phone,
      facebook,
      email,
      type,
      isVIP: type === "vip",
      // keep both fields in sync
      notas,
      totalPurchases: 0,
      lastPurchase: null
      // BA-05 FIX: null para clientes nuevos sin compras aún
    };
    const _nombreNuevo = _normNombre2(name);
    const _telNuevo = String(phone || "").replace(/\D/g, "").slice(-8);
    const _posibleDuplicado = clients.find((cx) => {
      const mismoNombre = _normNombre2(cx.name || "") === _nombreNuevo && _nombreNuevo !== "";
      const mismoTel = _telNuevo.length >= 6 && String(cx.phone || "").replace(/\D/g, "").slice(-8) === _telNuevo;
      return mismoNombre || mismoTel;
    });
    if (_posibleDuplicado) {
      manekiToastExport(`\u26A0\uFE0F Ya existe un cliente similar: "${_posibleDuplicado.name}". Verifica si es el mismo.`, "warn");
    }
    clients.push(newClient);
  }
  saveClients();
  closeAddClientModal();
  renderClientsTable();
  updateDashboard();
});
function editClient(clientId) {
  const client = clients.find((c) => String(c.id) === String(clientId));
  if (!client) return;
  document.getElementById("clientModalTitle").textContent = "Editar Cliente";
  document.getElementById("clientSubmitBtn").innerHTML = '<i class="fas fa-save mr-2"></i>Actualizar Cliente';
  document.getElementById("editClientId").value = clientId;
  document.getElementById("clientName").value = client.name || "";
  document.getElementById("clientPhone").value = client.phone || "";
  document.getElementById("clientFacebook").value = client.facebook || "";
  document.getElementById("clientEmail").value = client.email || "";
  if (document.getElementById("clientNotas")) {
    document.getElementById("clientNotas").value = client.notas || "";
  }
  selectClientType(client.type || "regular");
  openModal("addClientModal");
}
function deleteClient(id) {
  const c = clients.find((x) => String(x.id) === String(id));
  const _pedidosCliente = (window.pedidos || []).filter(
    (p) => String(p.clienteId || "") === String(id) || String(p.cliente || "").toLowerCase() === String(c ? c.name : "").toLowerCase()
  );
  const _pedidosActivos = _pedidosCliente.filter(
    (p) => p.status !== "finalizado" && p.status !== "cancelado" && p.status !== "entregado"
  );
  const _msgConfirm = _pedidosActivos.length > 0 ? `Este cliente tiene ${_pedidosActivos.length} pedido(s) activo(s). \xBFDeseas eliminarlo de todas formas? Los pedidos quedar\xE1n sin cliente asignado.

"${c ? c.name : "este cliente"}" y su historial ser\xE1n eliminados.` : `"${c ? c.name : "este cliente"}" y su historial ser\xE1n eliminados.`;
  const _titleConfirm = _pedidosActivos.length > 0 ? "\u26A0\uFE0F Eliminar cliente con pedidos" : "\u26A0\uFE0F Eliminar cliente";
  showConfirm(_msgConfirm, _titleConfirm).then((ok) => {
    if (!ok) return;
    clients = clients.filter((c2) => String(c2.id) !== String(id));
    saveClients();
    renderClientsTable();
    if (typeof updateDashboard === "function") updateDashboard();
  });
}
function setupClientSearch() {
  document.getElementById("searchClient").addEventListener("input", function(e) {
    clearTimeout(window._clientSearchT);
    window._clientSearchT = setTimeout(() => {
      const _normC = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      const q = _normC(e.target.value || "");
      const baseList = _clientesFiltrados();
      const filteredClients = baseList.filter(
        (c) => _normC(c.name).includes(q) || _normC(c.email || "").includes(q) || (c.phone || c.telefono || "").includes(q)
      );
      const tbody = document.getElementById("clientsTable");
      if (filteredClients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><p style="text-align:center;padding:32px;color:#9ca3af;font-size:.9rem">Sin resultados</p></td></tr>`;
        return;
      }
      tbody.innerHTML = filteredClients.map((client) => {
        const esVIP = client.isVIP || client.type === "vip";
        const tag = _tagActividad(client);
        const tagBadge = `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.68rem;font-weight:700;${tag.color}">${tag.label}</span>`;
        const notasSnippet = client.notas ? `<div style="font-size:.72rem;color:#6b7280;margin-top:2px" title="${_escAttr(client.notas)}">\u{1F4DD} ${_esc(client.notas.substring(0, 60))}${client.notas.length > 60 ? "\u2026" : ""}</div>` : "";
        const waBtn = client.phone ? `<button onclick="_abrirWhatsApp('${_escAttr(client.phone)}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:#22c55e;color:#fff;border-radius:12px;font-size:.72rem;font-weight:600;border:none;cursor:pointer;margin-top:4px">\u{1F4F1} WhatsApp</button>` : "";
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
        <a href="https://wa.me/521${_esc(client.phone).replace(/\D/g, "")}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(client.phone)}</a>
        ${waBtn}
    </div>` : ""}
${client.facebook ? `<a href="${_esc(client.facebook).startsWith("http") ? _esc(client.facebook) : "https://" + _esc(client.facebook)}" target="_blank" class="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1"><i class="fab fa-facebook-messenger"></i>${_esc(client.facebook)}</a>` : ""}
${!client.phone && !client.facebook ? "\u2014" : ""}
</td>
                        <td class="px-6 py-4 text-gray-600 text-sm">${client.email ? _esc(client.email) : "\u2014"}</td>
                        <td class="px-6 py-4 text-gray-800 font-semibold">$${(client.totalPurchases || 0).toFixed(2)}</td>
                        <td class="px-6 py-4 text-gray-600">${client.lastPurchase || "\u2014"}</td>
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
                `;
      }).join("");
    }, 180);
  });
}
//# sourceMappingURL=clientes.js.map
