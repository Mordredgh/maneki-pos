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

function _buildBackupObject() {
    return {
        version: '2.1',
        fecha: new Date().toISOString(),
        tienda: (window.storeConfig && window.storeConfig.name) || 'Maneki Store',
        datos: {
            products: window.products || [],
            salesHistory: window.salesHistory || [],
            pedidos: window.pedidos || [],
            pedidosFinalizados: window.pedidosFinalizados || [],
            abonos: window.abonos || [],
            receivables: window.receivables || [],
            payables: window.payables || [],
            incomes: window.incomes || [],
            expenses: window.expenses || [],
            categories: window.categories || [],
            quotes: window.quotes || [],
            equipos: equipos || [],
            roiHistorial: roiHistorial || [],
            roiConfig: roiConfig || { porcentaje: 10 },
            envioAnillos: envioAnillos || [],
            notas: window.notas || [],
            clients: window.clients || [],
            storeConfig: window.storeConfig || {},
            gastosRecurrentes: window.gastosRecurrentes || [],
            stockMovimientos: window.stockMovimientos || window.stockMovements || [],
            folioCounter: window._folioCounter || 0
        }
    };
}

function exportarBackupJSON() {
    const backup = _buildBackupObject();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Maneki_Backup_${(typeof _fechaHoy === 'function') ? _fechaHoy() : new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function exportarBackupComprimido() {
    const backup = _buildBackupObject();
    const json = JSON.stringify(backup);
    const datosStr = JSON.stringify(backup.datos);
    let hash = 0;
    for (let i = 0; i < datosStr.length; i++) {
        hash = ((hash << 5) - hash + datosStr.charCodeAt(i)) | 0;
    }
    backup.checksum = hash;

    const pakoUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js';
    if (typeof window.pako === 'undefined') {
        await window._mkLoadCDN(pakoUrl);
    }

    try {
        const jsonFinal = JSON.stringify(backup);
        const compressed = window.pako.gzip(jsonFinal);
        const blob = new Blob([compressed], { type: 'application/gzip' });
        const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
        const originalMB = (jsonFinal.length / 1024 / 1024).toFixed(2);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Maneki_Backup_${(typeof _fechaHoy === 'function') ? _fechaHoy() : new Date().toISOString().split('T')[0]}.json.gz`;
        a.click();
        URL.revokeObjectURL(url);
        manekiToastExport(`📦 Backup comprimido: ${originalMB}MB → ${sizeMB}MB (${Math.round((1 - blob.size / jsonFinal.length) * 100)}% menos)`, 'ok');
    } catch (e) {
        console.error('[Backup] Error comprimiendo:', e);
        manekiToastExport('⚠️ Error al comprimir, exportando sin comprimir...', 'warn');
        exportarBackupJSON();
    }
}
window.exportarBackupComprimido = exportarBackupComprimido;

function handleBackupDrop(e) {
    e.preventDefault();
    document.getElementById('dropZone').style.borderColor = '#BFDBFE';
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.json.gz') || file.name.endsWith('.gz'))) procesarArchivoBackup(file);
    else { manekiToastExport('Por favor selecciona un archivo .json o .json.gz válido.', 'err'); }
}

function cargarArchivoBackup(event) {
    const file = event.target.files[0];
    if (file) procesarArchivoBackup(file);
}

function _activarBackupPendiente(data, fileName) {
    if (!data.datos) throw new Error('Formato inválido');

    // SEC-4: Validar versión del backup antes de habilitar la restauración
    const EXPECTED_VERSION = '2.1';
    if (!data.version) {
        (window as any).manekiToastExport?.('⚠️ Backup sin versión — puede ser muy antiguo. Revisa los datos restaurados.', 'warn') ||
        alert('⚠️ Backup sin versión detectada. Puede estar incompleto.');
    } else if (data.version !== EXPECTED_VERSION && data.version < EXPECTED_VERSION) {
        (window as any).manekiToastExport?.(`⚠️ Backup versión ${data.version} (actual: ${EXPECTED_VERSION}) — algunos datos pueden faltar`, 'warn');
    }

    backupDataPendiente = data;
    const label = document.getElementById('dropZoneFileName');
    label.textContent = `✅ ${fileName}`;
    label.classList.remove('hidden');
    const btn = document.getElementById('btnRestaurar');
    btn.disabled = false;
    btn.style.background = '#2563EB';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';
}

function procesarArchivoBackup(file) {
    const isGz = file.name.endsWith('.gz');

    if (isGz) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const pakoUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js';
                if (typeof window.pako === 'undefined') await window._mkLoadCDN(pakoUrl);
                const compressed = new Uint8Array(e.target.result);
                const jsonStr = window.pako.ungzip(compressed, { to: 'string' });
                const data = JSON.parse(jsonStr);
                _activarBackupPendiente(data, file.name);
            } catch(err) {
                manekiToastExport('El archivo comprimido no es un backup válido.', 'err');
                backupDataPendiente = null;
            }
        };
        reader.readAsArrayBuffer(file);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            _activarBackupPendiente(data, file.name);
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
            if (d.products !== undefined)     { window.products = d.products; products = d.products; await saveProducts(); }
            if (d.salesHistory !== undefined) { window.salesHistory = d.salesHistory; salesHistory = d.salesHistory; await saveSalesHistory(); }
            if (d.pedidos !== undefined)      { window.pedidos = d.pedidos; pedidos = d.pedidos; await savePedidos(); }
            // R2-C3 FIX: abonos tiene su propia clave en Supabase/SQLite (ui-extras.js usa sbSave('abonos',...)).
            // Restaurar la clave para que tras el reload la app cargue los abonos correctamente.
            if (d.abonos !== undefined) {
                window.abonos = Array.isArray(d.abonos) ? d.abonos : [];
                await sbSave('abonos', window.abonos);
            }
            if (d.pedidosFinalizados !== undefined) { window.pedidosFinalizados = d.pedidosFinalizados; pedidosFinalizados = d.pedidosFinalizados; await savePedidosFinalizados(); }
            if (d.notas !== undefined)             { window.notas = d.notas; await sbSave('notas', window.notas); }
            if (d.receivables !== undefined)       { window.receivables = d.receivables; await sbSave('receivables', receivables); }
            if (d.payables !== undefined)          { window.payables = d.payables; await sbSave('payables', window.payables); }
            if (d.incomes !== undefined)      { window.incomes = d.incomes; incomes = d.incomes; await saveIncomes(); }
            if (d.expenses !== undefined)     { window.expenses = d.expenses; expenses = d.expenses; await saveExpenses(); }
            if (d.categories !== undefined)   { window.categories = d.categories; await sbSave('categories', categories); }
            if (d.quotes !== undefined)       { window.quotes = d.quotes; await sbSave('quotes', quotes); }
            if (d.equipos !== undefined)      { equipos = d.equipos; await sbSave('equipos', equipos); }
            if (d.roiHistorial !== undefined) { roiHistorial = d.roiHistorial; await sbSave('roiHistorial', roiHistorial); }
            if (d.roiConfig !== undefined)    { roiConfig = d.roiConfig; await sbSave('roiConfig', roiConfig); }
            if (d.envioAnillos !== undefined) { envioAnillos = d.envioAnillos; await sbSave('envioAnillos', envioAnillos); }
            // BUG-008 FIX: restaurar campos que faltaban
            if (d.clients !== undefined)           { window.clients = d.clients; clients = d.clients; await saveClients(); }
            if (d.storeConfig !== undefined)        { window.storeConfig = d.storeConfig; await sbSave('storeConfig', storeConfig); }
            if (d.gastosRecurrentes !== undefined)  { window.gastosRecurrentes = d.gastosRecurrentes; await sbSave('gastosRecurrentes', gastosRecurrentes); }
            if (d.stockMovimientos !== undefined)   { window.stockMovimientos = d.stockMovimientos; window.stockMovements = d.stockMovimientos; await sbSave('stockMovimientos', window.stockMovimientos); }
            // Restaurar folioCounter para evitar folios duplicados
            if (d.folioCounter !== undefined && Number(d.folioCounter) > 0) {
                window._folioCounter = Number(d.folioCounter);
                await sbSave('folioCounter', String(window._folioCounter));
                try { localStorage.setItem('maneki_folioCounter', String(window._folioCounter)); } catch(_){}
            }

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

    // FIX AB-01: guardar auto-backup en SQLite/localStorage en lugar de descargar archivo.
    // exportarBackupJSON() descargaba un .json al disco, lo cual es intrusivo e inesperado
    // como acción automática. Ahora se guarda silenciosamente en almacenamiento local.
    async function _doAutoBackup() {
        try {
            const backup = {
                version: '2.1',
                fecha: new Date().toISOString(),
                tienda: (window.storeConfig && window.storeConfig.name) || 'Maneki Store',
                datos: {
                    products: window.products || [],
                    salesHistory: window.salesHistory || [],
                    pedidos: window.pedidos || [],
                    pedidosFinalizados: window.pedidosFinalizados || [],
                    abonos: window.abonos || [],
                    receivables: window.receivables || [],
                    payables: window.payables || [],
                    incomes: window.incomes || [],
                    expenses: window.expenses || [],
                    categories: window.categories || [],
                    quotes: window.quotes || [],
                    equipos: (typeof equipos !== 'undefined' ? equipos : []),
                    roiHistorial: (typeof roiHistorial !== 'undefined' ? roiHistorial : []),
                    roiConfig: (typeof roiConfig !== 'undefined' ? roiConfig : { porcentaje: 10 }),
                    envioAnillos: (typeof envioAnillos !== 'undefined' ? envioAnillos : []),
                    notas: window.notas || [],
                    clients: window.clients || [],
                    storeConfig: window.storeConfig || {},
                    gastosRecurrentes: window.gastosRecurrentes || [],
                    stockMovimientos: window.stockMovimientos || window.stockMovements || [],
                    folioCounter: window._folioCounter || 0
                }
            };
            // Guardar en SQLite si está disponible, sino en localStorage
            if (typeof sqliteStorage !== 'undefined' && sqliteStorage.set) {
                await sqliteStorage.set('autoBackup', backup);
                await sqliteStorage.set('autoBackupDate', new Date().toISOString());
            } else {
                try { localStorage.setItem('maneki_autoBackup', JSON.stringify(backup)); } catch(e) { /* localStorage lleno — silenciar */ }
            }
            localStorage.setItem(LS_KEY, new Date().toISOString());
        } catch(e) {
            console.warn('[AutoBackup]', e);
        }
    }

    if (window._autoBackupInterval) clearInterval(window._autoBackupInterval);
    window._autoBackupInterval = setInterval(_doAutoBackup, INTERVAL_MS);

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