let backupDataPendiente = null;

function abrirModalBackup() {
    // Actualizar resumen
    document.getElementById('bkProductos').textContent = (window.products || []).length;
    document.getElementById('bkVentas').textContent = (window.salesHistory || []).length;
    document.getElementById('bkPedidos').textContent = ((window.pedidos || []).length + (window.pedidosFinalizados || []).length);

    // Reset zona de drop
    document.getElementById('dropZoneFileName').classList.add('hidden');
    document.getElementById('dropZoneFileName').textContent = '';
    document.getElementById('backupFileInput').value = '';
    const btn = document.getElementById('btnRestaurar');
    btn.disabled = true;
    btn.style.background = '#E5E7EB';
    btn.style.color = '#9CA3AF';
    btn.style.cursor = 'not-allowed';
    backupDataPendiente = null;

    document.getElementById('backupModal').style.display = 'flex';
}

function cerrarBackupModal() {
    document.getElementById('backupModal').style.display = 'none';
}

function exportarBackupJSON() {
    const backup = {
        version: '2.1',
        fecha: new Date().toISOString(),
        tienda: (window.storeConfig && window.storeConfig.name) || 'Maneki Store',
        datos: {
            products: window.products || [],
            salesHistory: window.salesHistory || [],
            pedidos: window.pedidos || [],
            pedidosFinalizados: window.pedidosFinalizados || [],  // BUG FIX: faltaba historial de pedidos
            // abonos: incluidos en pedidos[n].pagos — se exportan también por compatibilidad con backups legacy
            abonos: window.abonos || [],
            receivables: window.receivables || [],
            payables: window.payables || [],                      // BUG FIX: faltaban cuentas por pagar
            incomes: window.incomes || [],
            expenses: window.expenses || [],
            categories: window.categories || [],
            quotes: window.quotes || [],
            equipos: equipos || [],
            roiHistorial: roiHistorial || [],
            roiConfig: roiConfig || { porcentaje: 10 },
            envioAnillos: envioAnillos || [],
            notas: window.notas || [],                            // BUG FIX: faltaban notas
            clients: window.clients || [],
            storeConfig: window.storeConfig || {},
            gastosRecurrentes: window.gastosRecurrentes || [],
            stockMovimientos: window.stockMovimientos || window.stockMovements || []
        }
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Maneki_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function handleBackupDrop(e) {
    e.preventDefault();
    document.getElementById('dropZone').style.borderColor = '#BFDBFE';
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) procesarArchivoBackup(file);
    else { manekiToastExport('Por favor selecciona un archivo .json válido.', 'err'); }
}

function cargarArchivoBackup(event) {
    const file = event.target.files[0];
    if (file) procesarArchivoBackup(file);
}

function procesarArchivoBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.datos) throw new Error('Formato inválido');
            backupDataPendiente = data;

            // Mostrar nombre del archivo
            const label = document.getElementById('dropZoneFileName');
            label.textContent = `✅ ${file.name}`;
            label.classList.remove('hidden');

            // Activar botón restaurar
            const btn = document.getElementById('btnRestaurar');
            btn.disabled = false;
            btn.style.background = '#2563EB';
            btn.style.color = 'white';
            btn.style.cursor = 'pointer';
        } catch(err) {
            manekiToastExport('El archivo no es un backup válido de Maneki Store.', 'err');
            backupDataPendiente = null;
        }
    };
    reader.readAsText(file);
}

function restaurarBackup() {
    if (!backupDataPendiente) return;
    const d = backupDataPendiente.datos;
    const fecha = backupDataPendiente.fecha ? new Date(backupDataPendiente.fecha).toLocaleDateString('es-MX') : 'desconocida';

    showConfirm(
        `⚠️ ACCIÓN IRREVERSIBLE\n\nSe reemplazarán TODOS los datos actuales con el backup del ${fecha}.\n\nSe recomienda exportar un backup de seguridad antes de continuar.\n\n¿Estás completamente seguro?`,
        '🔴 Restaurar backup — esto borrará todo'
    ).then(ok => {
    if (!ok) return;

    (async () => {
        try {
            if (d.products !== undefined)     { window.products = d.products; await sbSave('products', products); }
            if (d.salesHistory !== undefined) { window.salesHistory = d.salesHistory; await sbSave('salesHistory', salesHistory); }
            if (d.pedidos !== undefined)      { window.pedidos = d.pedidos; await sbSave('pedidos', pedidos); }
            // R2-C3 FIX: abonos tiene su propia clave en Supabase/SQLite (ui-extras.js usa sbSave('abonos',...)).
            // Restaurar la clave para que tras el reload la app cargue los abonos correctamente.
            if (d.abonos !== undefined) {
                window.abonos = Array.isArray(d.abonos) ? d.abonos : [];
                await sbSave('abonos', window.abonos);
            }
            if (d.pedidosFinalizados !== undefined) { window.pedidosFinalizados = d.pedidosFinalizados; await sbSave('pedidosFinalizados', window.pedidosFinalizados); }
            if (d.notas !== undefined)             { window.notas = d.notas; await sbSave('notas', window.notas); }
            if (d.receivables !== undefined)       { window.receivables = d.receivables; await sbSave('receivables', receivables); }
            if (d.payables !== undefined)          { window.payables = d.payables; await sbSave('payables', window.payables); }
            if (d.incomes !== undefined)      { window.incomes = d.incomes; await sbSave('incomes', incomes); }
            if (d.expenses !== undefined)     { window.expenses = d.expenses; await sbSave('expenses', expenses); }
            if (d.categories !== undefined)   { window.categories = d.categories; await sbSave('categories', categories); }
            if (d.quotes !== undefined)       { window.quotes = d.quotes; await sbSave('quotes', quotes); }
            if (d.equipos !== undefined)      { equipos = d.equipos; await sbSave('equipos', equipos); }
            if (d.roiHistorial !== undefined) { roiHistorial = d.roiHistorial; await sbSave('roiHistorial', roiHistorial); }
            if (d.roiConfig !== undefined)    { roiConfig = d.roiConfig; await sbSave('roiConfig', roiConfig); }
            if (d.envioAnillos !== undefined) { envioAnillos = d.envioAnillos; await sbSave('envioAnillos', envioAnillos); }
            // BUG-008 FIX: restaurar campos que faltaban
            if (d.clients !== undefined)           { window.clients = d.clients; await sbSave('clients', clients); }
            if (d.storeConfig !== undefined)        { window.storeConfig = d.storeConfig; await sbSave('storeConfig', storeConfig); }
            if (d.gastosRecurrentes !== undefined)  { window.gastosRecurrentes = d.gastosRecurrentes; await sbSave('gastosRecurrentes', gastosRecurrentes); }
            if (d.stockMovimientos !== undefined)   { window.stockMovimientos = d.stockMovimientos; window.stockMovements = d.stockMovimientos; await sbSave('stockMovimientos', window.stockMovimientos); }

            cerrarBackupModal();
            manekiToastExport('✅ Backup restaurado exitosamente. La página se recargará.', 'ok');
            setTimeout(() => location.reload(), 500);
        } catch(err) {
            manekiToastExport('❌ Error al restaurar: ' + err.message, 'error');
        }
    })();
    });
}

// Cerrar al hacer clic fuera
document.getElementById('backupModal').addEventListener('click', function(e) {
    if (e.target === this) cerrarBackupModal();
});

// ── Feature 4: Auto-backup programado ─────────────────────────────────────
(function initAutoBackup() {
    const INTERVAL_MS = 2 * 60 * 60 * 1000; // cada 2 horas
    const LS_KEY      = 'maneki_lastAutoBackup';

    function _doAutoBackup() {
        try {
            exportarBackupJSON();
            localStorage.setItem(LS_KEY, new Date().toISOString());
            // FIX 4: no mostrar toast en auto-backup automático — silencioso por defecto
        } catch(e) {
            console.warn('Auto-backup error:', e);
            if (typeof manekiToastExport === 'function')
                manekiToastExport('❌ Error en auto-backup: ' + (e && e.message || e), 'err');
        }
    }

    setInterval(_doAutoBackup, INTERVAL_MS);

    // Mostrar timestamp en el modal de backup
    window.getUltimoAutoBackup = function() {
        const last = localStorage.getItem(LS_KEY);
        if (!last) return 'Sin auto-backups aún';
        return 'Último auto-backup: ' + new Date(last).toLocaleString('es-MX');
    };

    // Inyectar info en el modal cuando se abra
    const _origAbrir = window.abrirModalBackup;
    window.abrirModalBackup = function() {
        _origAbrir && _origAbrir();
        const el = document.getElementById('bkAutoBackup');
        if (el) el.textContent = window.getUltimoAutoBackup();
    };
})();