// ── FIX C1: escape para atributos onclick con datos de cliente ────────────────
function _escAttr(v) {
    return String(v == null ? '' : v)
        .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

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

// ============== CLIENTS MODULE ==============
        
        function renderClientsTable() {
            const tbody = document.getElementById('clientsTable');
            
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
            
            // NTH-12: colores de avatar por inicial
            const _avatarColors = ['#C5A572','#7C3AED','#0891B2','#16A34A','#DC2626','#D97706','#9333EA','#0284C7','#059669','#E11D48'];
            function _avatarColor(name) {
                const c = (name||'A').toUpperCase().charCodeAt(0) - 65;
                return _avatarColors[((c % _avatarColors.length) + _avatarColors.length) % _avatarColors.length];
            }
            tbody.innerHTML = _getSortedClients().map((client, rowIndex) => {
                const esVIP = client.isVIP || client.type === 'vip';
                // NTH-12: inicial coloreada
                const inicial = (client.name || '?').trim().charAt(0).toUpperCase();
                const avatarColor = _avatarColor(client.name);
                // NTH-11: snippet de nota más reciente vinculada a este cliente
                const notasCliente = (window.notas || []).filter(n =>
                    n.cliente && n.cliente.toLowerCase() === (client.name||'').toLowerCase()
                ).sort((a,b) => (b.fechaCreacion||b.fecha||'').localeCompare(a.fechaCreacion||a.fecha||''));
                const snippetNota = notasCliente.length > 0
                    ? `<div class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title="${_escAttr(notasCliente[0].texto)}">📝 ${_esc((notasCliente[0].texto||'').substring(0,40))}${(notasCliente[0].texto||'').length>40?'…':''}</div>`
                    : '';
                return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background:${avatarColor};color:#fff;font-weight:800;font-size:1rem;">
                                ${inicial}
                            </div>
                            <div>
                                <span class="font-semibold text-gray-800">${_esc(client.name)}</span>
                                ${snippetNota}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">
    ${client.phone ? `<a href="https://wa.me/52${_esc(client.phone).replace(/\D/g,'')}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(client.phone)}</a>` : ''}
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
    const type = document.getElementById('clientType').value || 'regular';

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
            client.notas = document.getElementById('clientNotas').value.trim();
        }
    } else {
        // ── CREAR ──
        const newClient = {
            // BUG #8 FIX: randomUUID evita colisión de IDs cuando dos clientes
            // se crean en el mismo milisegundo.
            id: (typeof crypto !== 'undefined' && crypto.randomUUID)
                  ? crypto.randomUUID()
                  : Date.now() + '-' + Math.random().toString(36).slice(2),
            name,
            phone,
            facebook,
            email,
            type,
            isVIP: type === 'vip', // keep both fields in sync
                    notas: document.getElementById('clientNotas').value.trim(),
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
    document.getElementById('clientNotas').value = client.notas || '';
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
                const filteredClients = clients.filter(c =>
                    _normC(c.name).includes(q) ||
                    _normC(c.email || '').includes(q) ||
                    (c.phone || c.telefono || '').includes(q)
                );
                
                const tbody = document.getElementById('clientsTable');
                tbody.innerHTML = filteredClients.map(client => {
                    const esVIP = client.isVIP || client.type === 'vip';
                    return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: rgba(197,151,59,0.18) !important;">
                                    <i class="fas fa-user" style="color: #C5A572 !important;"></i>
                                </div>
                                <span class="font-semibold text-gray-800">${_esc(client.name)}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">
    ${client.phone ? `<a href="https://wa.me/52${_esc(client.phone).replace(/\D/g,'')}" target="_blank" class="text-sm flex items-center gap-1 text-green-600 hover:text-green-800"><i class="fab fa-whatsapp"></i>${_esc(client.phone)}</a>` : ''}
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