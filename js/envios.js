// ══════════════════════════════════════════════════════════════
// SISTEMA DE COTIZACIÓN DE ENVÍOS POR ANILLOS
// ══════════════════════════════════════════════════════════════

// ── Configuración base ──
// ENVIO_BASE: se puede configurar desde Configuración > Dirección base
// Por defecto: José Manuel Herrera 2103, Garza Nieto, MTY
var ENVIO_BASE = { lat: 25.7002136, lng: -100.3303952 };
// Se actualiza en initApp si storeConfig tiene coordenadas guardadas
const ANILLOS_COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];

// ── Storage de anillos ──
var envioAnillos = [];

function guardarAnillosStorage() {
    sbSave('envioAnillos', envioAnillos);
}

// ── Calcular distancia haversine (km) ──
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

// ── Obtener tarifa según km ──
function getTarifaParaKm(km) {
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    for (let i = 0; i < sorted.length; i++) {
        if (km <= sorted[i].km) return { anillo: sorted[i], index: i };
    }
    return null; // fuera de rango
}

// ══ SWITCH TABS ══
function switchQuoteTab(tab) {
    const tabProductos = document.getElementById('tabContentProductos');
    const tabEnvios = document.getElementById('tabContentEnvios');
    const btnP = document.getElementById('tabQuoteProductos');
    const btnE = document.getElementById('tabQuoteEnvios');
    const headerBtns = document.getElementById('quotesHeaderButtons');

    if (tab === 'productos') {
        tabProductos.classList.remove('hidden');
        tabEnvios.classList.add('hidden');
        btnP.style.cssText = 'background:#C5A572;color:white;padding:10px 24px;border-radius:12px;font-size:0.875rem;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;';
        btnE.style.cssText = 'background:transparent;color:#6B7280;padding:10px 24px;border-radius:12px;font-size:0.875rem;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;';
        headerBtns.innerHTML = `<button onclick="openQuoteModal()" class="btn-primary px-6 py-3 rounded-xl text-white font-semibold"><i class="fas fa-plus mr-2"></i>Nueva Cotización</button>`;
    } else {
        tabProductos.classList.add('hidden');
        tabEnvios.classList.remove('hidden');
        btnE.style.cssText = 'background:#C5A572;color:white;padding:10px 24px;border-radius:12px;font-size:0.875rem;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;';
        btnP.style.cssText = 'background:transparent;color:#6B7280;padding:10px 24px;border-radius:12px;font-size:0.875rem;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;';
        headerBtns.innerHTML = `<button onclick="abrirConfigAnillos()" class="px-5 py-3 rounded-xl text-white font-semibold flex items-center gap-2" style="background:linear-gradient(135deg,#7C3AED,#6D28D9)"><i class="fas fa-sliders-h"></i> Configurar Anillos</button>`;
        setTimeout(() => { initMapaCoberturaView(); renderTablaAnillos(); initAutocompleteEnvio(); }, 200);
    }
}

// ══ MAPA DE COBERTURA (vista) — Leaflet/OSM ══
var _mapaCobView = null;
var _mapaCobMarker = null;
var _mapaAnillosLayerGroup = null;

function initMapaCoberturaView() {
    const el = document.getElementById('mapaCoberturaView');
    if (!el) return;
    if (_mapaCobView) {
        // Ya existe, solo redibujar anillos
        _redrawLeafletAnillos(_mapaCobView, _mapaAnillosLayerGroup, 'cob');
        return;
    }
    _mapaCobView = L.map(el, { zoomControl: true, attributionControl: false }).setView([ENVIO_BASE.lat, ENVIO_BASE.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(_mapaCobView);
    // Marcador base
    const baseIcon = L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#C5A572;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize:[14,14], iconAnchor:[7,7], className:'' });
    L.marker([ENVIO_BASE.lat, ENVIO_BASE.lng], { icon: baseIcon, title:'Tu base' }).addTo(_mapaCobView).bindPopup(`<b>📍 Tu base</b><br>${storeConfig.address || 'Base configurada'}`).openPopup();
    // Anillos
    _mapaAnillosLayerGroup = L.layerGroup().addTo(_mapaCobView);
    _redrawLeafletAnillos(_mapaCobView, _mapaAnillosLayerGroup, 'cob');
    // Click en mapa para cotizar
    _mapaCobView.on('click', function(e) {
        const km = haversineKm(ENVIO_BASE.lat, ENVIO_BASE.lng, e.latlng.lat, e.latlng.lng);
        if (_mapaCobMarker) _mapaCobMarker.remove();
        const destIcon = L.divIcon({ html: '<div style="width:12px;height:12px;border-radius:50%;background:#7C3AED;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize:[12,12], iconAnchor:[6,6], className:'' });
        _mapaCobMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon: destIcon }).addTo(_mapaCobView);
        procesarDestino(e.latlng.lat, e.latlng.lng, 'Punto seleccionado en mapa');
    });
}

function _redrawLeafletAnillos(mapa, layerGroup, mode) {
    if (!mapa || !layerGroup) return;
    layerGroup.clearLayers();
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    sorted.forEach((anillo, i) => {
        const color = ANILLOS_COLORS[i % ANILLOS_COLORS.length];
        const circle = L.circle([ENVIO_BASE.lat, ENVIO_BASE.lng], {
            radius: anillo.km * 1000,
            color: color, weight: 2.5, opacity: 0.85,
            fillColor: color, fillOpacity: 0.07
        }).addTo(layerGroup);
        circle.bindTooltip(`<b>${anillo.label}</b><br>hasta ${anillo.km} km → <b>$${anillo.precio}</b>`, { sticky: true });
    });
}

function dibujarAnillosEnMapa(mapa, readOnly) { /* legacy stub */ }
function limpiarCirculos() { if (_mapaAnillosLayerGroup) _mapaAnillosLayerGroup.clearLayers(); }

// ══ AUTOCOMPLETE con Nominatim (OSM) ══
var _autocomplete = null;
var _nominatimTimeout = null;
var _nominatimDropdown = null;

function initAutocompleteEnvio() {
    const inp = document.getElementById('envioDestinoDireccion');
    if (!inp || _autocomplete) return;
    _autocomplete = true;
    // Crear dropdown de sugerencias
    _nominatimDropdown = document.createElement('div');
    _nominatimDropdown.id = 'nominatimDropdown';
    _nominatimDropdown.style.cssText = 'position:absolute;z-index:9999;background:white;border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);max-height:220px;overflow-y:auto;display:none;left:0;right:0;top:100%;margin-top:4px;';
    inp.parentElement.style.position = 'relative';
    inp.parentElement.appendChild(_nominatimDropdown);

    inp.addEventListener('input', function() {
        clearTimeout(_nominatimTimeout);
        const q = inp.value.trim();
        if (q.length < 3) { _nominatimDropdown.style.display = 'none'; return; }
        _nominatimTimeout = setTimeout(() => buscarNominatim(q), 400);
    });
    document.addEventListener('click', function(e) {
        if (!inp.contains(e.target) && !_nominatimDropdown.contains(e.target)) {
            _nominatimDropdown.style.display = 'none';
        }
    });
}


function _geocodeFetch(query, limit) {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('format', 'json');
    params.set('limit', String(limit));
    params.set('countrycodes', 'mx');
    params.set('addressdetails', '1');
    params.set('accept-language', 'es');
    params.set('viewbox', '-100.7,26.0,-99.8,25.4');
    params.set('bounded', '0');
    const nominatimUrl = 'https://nominatim.openstreetmap.org/search?' + params.toString();
    // En Electron no hay problema CORS; en browser local usamos proxy
    const esElectron = (typeof ipcRenderer !== 'undefined' && ipcRenderer !== null);
    const url = esElectron ? nominatimUrl : ('https://corsproxy.io/?' + encodeURIComponent(nominatimUrl));
    return fetch(url, { headers: { 'Accept': 'application/json' } });
}

function buscarNominatim(q) {
    _geocodeFetch(q + ', Monterrey, Nuevo León', 6)
    .then(r => { if (!r.ok) throw new Error('nominatim ' + r.status); return r.json(); })
    .then(data => {
        if (!data.length) { _nominatimDropdown.style.display = 'none'; return; }
        _nominatimDropdown.innerHTML = data.map((r) => {
            const label = _esc(r.display_name || 'Dirección');
            const safeName = label.replace(/'/g,"&#39;");
            return `<div onclick="seleccionarNominatim(${r.lat},${r.lon},'${safeName}')"
                style="padding:10px 14px;cursor:pointer;font-size:0.82rem;color:#374151;border-bottom:1px solid #F3F4F6;transition:background 0.15s;"
                onmouseover="this.style.background='#FFF9F0'" onmouseout="this.style.background='white'">
                <i class="fas fa-map-marker-alt" style="color:#C5A572;margin-right:6px;"></i>${label.split(',').slice(0,3).join(',')}
            </div>`;
        }).join('');
        _nominatimDropdown.style.display = 'block';
    })
    .catch(() => { _nominatimDropdown.style.display = 'none'; });
}

function seleccionarNominatim(lat, lng, displayName) {
    document.getElementById('envioDestinoDireccion').value = displayName.split(',').slice(0,3).join(',').trim();
    _nominatimDropdown.style.display = 'none';
    procesarDestino(parseFloat(lat), parseFloat(lng), displayName);
}

// ── Copiar cotización de envío para WhatsApp ──
function copiarCotizacionEnvio() {
    const direccion = document.getElementById('envioDestinoDireccion').value.trim() || 'Destino';
    const anillo    = document.getElementById('envioAnilloLabel').textContent.trim();
    const distancia = document.getElementById('envioDistanciaLabel').textContent.trim();
    const precio    = document.getElementById('envioPrecioLabel').textContent.trim();
    const texto = `🛵 *Cotización de Envío - Maneki Store*\n\n📍 *Destino:* ${direccion}\n🗺️ *Zona:* ${anillo}\n📏 *Distancia aprox.:* ${distancia}\n💰 *Tarifa estimada:* ${precio}\n\n⚠️ _La tarifa puede variar según condiciones del envío_`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto)
            .then(() => manekiToastExport('✅ Copiado al portapapeles', 'ok'))
            .catch(() => _copiarFallback(texto));
    } else {
        _copiarFallback(texto);
    }
}
function _copiarFallback(texto) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); manekiToastExport('✅ Copiado al portapapeles', 'ok'); }
    catch(e) { manekiToastExport('No se pudo copiar, cópialo manualmente', 'warn'); }
    document.body.removeChild(ta);
}

// ── Procesar destino seleccionado: calcular distancia y mostrar tarifa ──
function procesarDestino(lat, lng, label) {
    const km = haversineKm(ENVIO_BASE.lat, ENVIO_BASE.lng, lat, lng);
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    const anillo = sorted.find(a => km <= a.km);

    // Marcar destino en mapa
    if (_mapaCobView) {
        if (_mapaCobMarker) _mapaCobMarker.remove();
        const destIcon = L.divIcon({ html: '<div style="width:12px;height:12px;border-radius:50%;background:#7C3AED;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize:[12,12], iconAnchor:[6,6], className:'' });
        _mapaCobMarker = L.marker([lat, lng], { icon: destIcon }).addTo(_mapaCobView);
        _mapaCobView.panTo([lat, lng]);
    }

    const elResultado = document.getElementById('envioCotizacionResultado');
    const elFuera    = document.getElementById('envioFueraRango');

    if (!anillo) {
        elResultado.classList.add('hidden');
        elFuera.classList.remove('hidden');
        return;
    }

    elFuera.classList.add('hidden');
    elResultado.classList.remove('hidden');
    document.getElementById('envioAnilloLabel').textContent   = anillo.label || ('Anillo ' + (sorted.indexOf(anillo)+1));
    document.getElementById('envioDistanciaLabel').textContent = km.toFixed(1) + ' km';
    document.getElementById('envioPrecioLabel').textContent   = '$' + (anillo.precio || 0);
}

function buscarDestinoCotizador() {
    const dir = document.getElementById('envioDestinoDireccion').value.trim();
    if (!dir) { manekiToastExport('Escribe una dirección para buscar', 'warn'); return; }
    buscarNominatim(dir);
    // Búsqueda directa
    _geocodeFetch(dir + ', Monterrey, Nuevo León', 1)
    .then(r => { if (!r.ok) throw new Error('nominatim ' + r.status); return r.json(); })
    .then(data => {
        if (data.length) {
            seleccionarNominatim(data[0].lat, data[0].lon, data[0].display_name);
        } else {
            manekiToastExport('No se encontró la dirección. Prueba con: "Colonia Valle Verde, Monterrey"', 'warn');
        }
    })
    .catch(() => manekiToastExport('Error de conexión al buscar dirección', 'err'));
}

// ══ Inicializar tab de envíos cuando se entra a Cotizaciones ══
// FIX: No sobreescribir window.showSection en el cuerpo del script.
// Lo hacemos de forma segura en DOMContentLoaded, cuando todos los scripts ya cargaron.
document.addEventListener('DOMContentLoaded', function () {
    // Hook showSection para refrescar tabla de anillos al entrar a quotes
    if (typeof window.showSection === 'function' && !window.showSection._enviosHook) {
        const _origShowSection = window.showSection;
        window.showSection = function (sectionName) {
            _origShowSection(sectionName);
            if (sectionName === 'quotes') {
                setTimeout(() => { renderTablaAnillos(); }, 300);
            }
        };
        window.showSection._enviosHook = true;
    }

    // Iniciar autocomplete
    setTimeout(function() {
        const inp = document.getElementById('envioDestinoDireccion');
        if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarDestinoCotizador(); } });
        initAutocompleteEnvio();
    }, 1000);
});

// ══ TABLA DE ANILLOS (panel cotizador) ══
function renderTablaAnillos() {
    const el = document.getElementById('tablaAnillos');
    if (!el) return;
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    if (!sorted.length) { el.innerHTML = '<p class="text-xs text-gray-400 text-center py-3">Sin anillos configurados</p>'; return; }
    el.innerHTML = sorted.map((a, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:#F9FAFB;border:1px solid #F3F4F6;">
            <div style="width:12px;height:12px;border-radius:50%;flex-shrink:0;background:${ANILLOS_COLORS[i % ANILLOS_COLORS.length]};"></div>
            <div style="flex:1;min-width:0;">
                <p style="font-size:0.8rem;font-weight:700;color:#1F2937;margin:0">${_esc(a.label)}</p>
                <p style="font-size:0.72rem;color:#9CA3AF;margin:0">hasta ${a.km} km</p>
            </div>
            <span style="font-size:0.95rem;font-weight:800;color:#C5A572">$${a.precio}</span>
        </div>`).join('');
}

// ══ MODAL CONFIGURADOR DE ANILLOS — con Leaflet ══
var _mapaConfig = null;
var _mapaConfigLayerGroup = null;
var _mapaClickMarker = null;

function abrirConfigAnillos() {
    document.getElementById('configAnillosModal').style.display = 'flex';
    renderAnillosLista();
    setTimeout(initMapaConfigLeaflet, 250);
}

function cerrarConfigAnillos() {
    document.getElementById('configAnillosModal').style.display = 'none';
}

function renderAnillosLista() {
    const el = document.getElementById('anillosLista');
    if (!el) return;
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    el.innerHTML = sorted.map((a, i) => `
        <div style="display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:#F9FAFB;border:1px solid #F3F4F6;">
            <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:6px;background:${ANILLOS_COLORS[i % ANILLOS_COLORS.length]};"></div>
            <div style="display:flex;flex-direction:column;gap:5px;flex:1;">
                <input type="text" value="${_esc(a.label).replace(/"/g, '&quot;')}" 
                    oninput="updateAnilloByIndex(${i},'label',this.value)"
                    style="border:1px solid #E5E7EB;border-radius:8px;padding:5px 8px;font-size:0.75rem;font-weight:600;color:#374151;width:100%;outline:none;box-sizing:border-box;">
                <div style="display:flex;gap:6px;align-items:center;">
                    <div style="display:flex;align-items:center;gap:4px;flex:1;">
                        <span style="font-size:0.7rem;color:#9CA3AF;white-space:nowrap;">Hasta</span>
                        <input type="number" value="${a.km}" min="1" max="200"
                            oninput="updateAnilloByIndex(${i},'km',+this.value);redrawMapaConfig();"
                            style="width:52px;border:1px solid #E5E7EB;border-radius:8px;padding:4px 6px;font-size:0.8rem;font-weight:700;color:#374151;outline:none;text-align:center;">
                        <span style="font-size:0.7rem;color:#9CA3AF;">km</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;flex:1;">
                        <span style="font-size:0.7rem;color:#9CA3AF;">$</span>
                        <input type="number" value="${a.precio}" min="0"
                            oninput="updateAnilloByIndex(${i},'precio',+this.value)"
                            style="width:60px;border:1px solid #E5E7EB;border-radius:8px;padding:4px 6px;font-size:0.8rem;font-weight:700;color:#C5A572;outline:none;text-align:center;">
                    </div>
                    <button onclick="eliminarAnilloByIndex(${i})" 
                        style="background:none;border:none;cursor:pointer;color:#EF4444;font-size:0.9rem;padding:2px 4px;flex-shrink:0;" title="Eliminar">✕</button>
                </div>
            </div>
        </div>`).join('');
}

function updateAnilloByIndex(sortedIndex, field, value) {
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    if (sortedIndex < sorted.length) {
        const target = sorted[sortedIndex];
        const orig = envioAnillos.find(a => a === target);
        if (orig) orig[field] = value;
    }
}

function eliminarAnilloByIndex(sortedIndex) {
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    if (sortedIndex < sorted.length) {
        const target = sorted[sortedIndex];
        envioAnillos = envioAnillos.filter(a => a !== target);
    }
    renderAnillosLista();
    redrawMapaConfig();
}

function agregarAnillo() {
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    const lastKm = sorted.length > 0 ? sorted[sorted.length - 1].km : 0;
    const n = envioAnillos.length + 1;
    envioAnillos.push({ km: lastKm + 10, precio: 150, label: `Anillo ${n} (${lastKm}-${lastKm+10} km)` });
    renderAnillosLista();
    redrawMapaConfig();
}

function guardarAnillos() {
    guardarAnillosStorage();
    cerrarConfigAnillos();
    renderTablaAnillos();
    // Re-dibujar mapa cobertura
    if (_mapaCobView && _mapaAnillosLayerGroup) {
        _redrawLeafletAnillos(_mapaCobView, _mapaAnillosLayerGroup, 'cob');
    }
    manekiToastExport('✅ Anillos de envío guardados', 'ok');
}

// ── Mapa de configuración con Leaflet ──
function initMapaConfigLeaflet() {
    const el = document.getElementById('mapaAnillos');
    if (!el) return;
    if (_mapaConfig) {
        // Ya existe: solo invalidar y redibujar
        setTimeout(() => { _mapaConfig.invalidateSize(); redrawMapaConfig(); }, 100);
        return;
    }
    _mapaConfig = L.map(el, { zoomControl: true, attributionControl: false }).setView([ENVIO_BASE.lat, ENVIO_BASE.lng], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(_mapaConfig);
    // Marcador base
    const baseIcon = L.divIcon({ html: '<div style="width:16px;height:16px;border-radius:50%;background:#C5A572;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>', iconSize:[16,16], iconAnchor:[8,8], className:'' });
    L.marker([ENVIO_BASE.lat, ENVIO_BASE.lng], { icon: baseIcon }).addTo(_mapaConfig)
        .bindPopup(`<b>📍 Tu base</b><br>${storeConfig.address || 'Base configurada'}`).openPopup();
    // Layer group para anillos
    _mapaConfigLayerGroup = L.layerGroup().addTo(_mapaConfig);
    redrawMapaConfig();
    // Click para ver distancia
    _mapaConfig.on('click', function(e) {
        const km = haversineKm(ENVIO_BASE.lat, ENVIO_BASE.lng, e.latlng.lat, e.latlng.lng);
        if (_mapaClickMarker) _mapaClickMarker.remove();
        const icon = L.divIcon({ html: '<div style="width:12px;height:12px;border-radius:50%;background:#7C3AED;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>', iconSize:[12,12], iconAnchor:[6,6], className:'' });
        _mapaClickMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon }).addTo(_mapaConfig);
        const t = getTarifaParaKm(km);
        const msg = t ? `📍 ${km.toFixed(1)} km → ${t.anillo.label} — $${t.anillo.precio}` : `📍 ${km.toFixed(1)} km → ⛔ Fuera de cobertura`;
        document.getElementById('mapaAnillosMsg').textContent = msg;
    });
}

function redrawMapaConfig() {
    if (!_mapaConfig || !_mapaConfigLayerGroup) return;
    _mapaConfigLayerGroup.clearLayers();
    const sorted = [...envioAnillos].sort((a, b) => a.km - b.km);
    sorted.forEach((anillo, i) => {
        const color = ANILLOS_COLORS[i % ANILLOS_COLORS.length];
        L.circle([ENVIO_BASE.lat, ENVIO_BASE.lng], {
            radius: anillo.km * 1000,
            color: color, weight: 2.5, opacity: 0.9,
            fillColor: color, fillOpacity: 0.08
        }).addTo(_mapaConfigLayerGroup)
          .bindTooltip(`<b>${anillo.label}</b> — $${anillo.precio}`, { sticky: true });
    });
}

// ── EXPORTAR FUNCIONES AL SCOPE GLOBAL ─────────────────────────────────────
// FIX CRÍTICO: El bloque original usaba _exp('nombre', referenciaDirecta) lo que
// lanza ReferenceError si la función vive en otro script (ej: agregarProductoPedido).
// Solución: _safeExp busca la función EN window por nombre (string), nunca evalúa
// una referencia que podría no existir en este scope.
(function () {
    /**
     * Registra window[name] si aún no está definido.
     * Busca la función en window por nombre — nunca lanza ReferenceError.
     */
    function _safeExp(name) {
        if (typeof window[name] === 'function') return; // ya registrada, no sobreescribir
        // Intentar resolver desde el scope local de este IIFE (funciones definidas arriba en este archivo)
        // usando un mapa explícito para las que SÍ pertenecen a envios.js:
        const local = {
            switchQuoteTab, buscarDestinoCotizador, seleccionarNominatim,
            copiarCotizacionEnvio, abrirConfigAnillos, cerrarConfigAnillos,
            guardarAnillos, agregarAnillo, eliminarAnilloByIndex,
            updateAnilloByIndex, redrawMapaConfig, renderTablaAnillos,
        };
        if (typeof local[name] === 'function') {
            window[name] = local[name];
        }
        // Para todo lo demás: ya fue registrado en window por inventory.js / reportes.js / otros.
        // No hacemos nada — si no está, se registrará cuando cargue el script correspondiente.
    }

    const names = [
        // POS / Ticket
        'addToTicket','removeFromTicket','updateQuantity','clearTicket',
        'processPayment','printReceipt','downloadReceipt','shareReceipt',
        'selectPaymentMethod','closeReceiptModal',
        // Inventario
        'openAddProductModal','closeAddProductModal','setTipoProducto',
        'addVariant','removeVariant','agregarComponenteKit','eliminarComponenteKit',
        'ajustarStock','confirmarAjusteStock','closeAjustarStockModal',
        'duplicarProducto','imprimirInventario',
        // Clientes
        'openAddClientModal','closeAddClientModal','editClient','deleteClient',
        'openClientHistory','closeClientHistoryModal','selectClientType',
        'clearSelectedClient','selectClientFromAutocomplete',
        // Categorías
        'openAddCategoryModal','closeAddCategoryModal','editCategory','deleteCategory',
        'saveEditCategory','closeEditCategoryModal','selectCategoryColor','selectEmoji',
        'selectEditColor','selectEditEmoji','switchCategoryTab',
        // Balance
        'openIncomeModal','openExpenseModal','openReceivableModal','openPayableModal',
        'markAsPaid','editBalanceItem','deleteBalanceItem','closeTransactionModal',
        'cambiarMesBalance','eliminarRecurrente','toggleRecurrentesPanel','limpiarMovimientos',
        // Cotizaciones
        'openQuoteModal','closeQuoteModal','viewQuote','shareQuote','deleteQuote',
        'convertQuoteToPedido','addProductToQuote','removeQuoteProduct',
        'aplicarMargen','buscarDestinoCotizador','seleccionarNominatim',
        'copiarCotizacionEnvio','switchQuoteTab',
        // Pedidos
        'openPedidoModal','closePedidoModal','setPedidoStatus',
        'openPedidoStatusModal','closePedidoStatusModal',
        'openCancelPedidoModal','closeCancelPedidoModal','confirmarCancelPedido',
        'confirmarAbonoPedido','cerrarAbonoPedido','openAbonoPedido','selectAbonoPedidoMethod',
        'filterPedidos','setVistaPedidos',
        'agregarProductoPedido','quitarProductoPedido',
        'limpiarSeleccionProductoPedido','seleccionarProductoPedido',
        'agregarNota','eliminarNota','toggleNota',
        'agregarTagCustom','eliminarTag','toggleTagPredefinido',
        'eliminarPedido','eliminarPedidoFinalizado',
        'filtrarProduccion','imprimirListaProduccion','toggleListaProduccion',
        // Ventas / Análisis
        'abrirDetalleSale','abrirDetalleSaleById','cerrarDetalleSale',
        'eliminarVentaHistorial','renderSalesHistory','switchHistoryTab',
        'mostrarResumenDia','descargarReporteVentas','exportarAnalisisCSV',
        'setAnalisisPeriodo','renderTopClientes','limpiarFiltroFechas',
        // Config / Tema
        'saveStoreConfig','selectTheme','toggleDarkMode','refrescarPagina',
        'removeLogo','togglePrivacidad',
        // Backup
        'abrirModalBackup','cerrarBackupModal','exportarBackupJSON',
        'restaurarBackup','clearAllData','manekiExportar',
        // Equipos / ROI
        'openEquipoModal','closeEquipoModal','saveEquipo','deleteEquipo',
        'abrirRoiEquiposModal','cerrarRoiEquiposModal','confirmarRoiEquipos',
        'saveRoiConfig','selectEquipoEmoji','renderGraficaROI',
        // Envío / Anillos
        'abrirConfigAnillos','cerrarConfigAnillos','guardarAnillos',
        'agregarAnillo','eliminarAnilloByIndex','updateAnilloByIndex','redrawMapaConfig',
        // oninput / onchange
        'filterEmojis','filterEditEmojis','filterEquipoEmojis',
        'calcPedidoTotal','toggleKitSection','updateQuoteTotal','updateStorePreview',
        'busquedaGlobal','cerrarBusquedaGlobal','searchClientAutocomplete',
        'handleLogoUpload','cargarArchivoBackup','filtrarProductosPedido',
        'handleAutocompleteKey','renderAnalisis','actualizarCalculoRoi',
        // HTML estático
        'updateDashboard','updateTotals','renderInventoryTable',
    ];

    names.forEach(_safeExp);
})();
