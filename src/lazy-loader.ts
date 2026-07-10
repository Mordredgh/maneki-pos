// ═══════════════════════════════════════════════════════════════
//  MANEKI LAZY LOADER v2 — módulos JS + librerías CDN bajo demanda
//  JS inicial: ~317 KB  |  CDN diferido: ~1.7 MB (xlsx, pdf, leaflet)
// ═══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── URLs de librerías CDN pesadas ────────────────────────────
    var CDN = {
        chartjs:  'https://cdn.jsdelivr.net/npm/chart.js',
        xlsx:     'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
        html2pdf: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
        pako:     'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js',
        leafletCSS: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        leafletJS:  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    };

    // ── Detectar si bundles existen (build de producción) ───────
    var _useBundles = !!document.querySelector('script[src="js/core.bundle.js"]');

    // ── Grupos de scripts por sección ───────────────────────────
    var _GRUPOS = _useBundles ? {
        inventario: ['js/inventario.bundle.js'],
        pedidos:    ['js/balance.bundle.js', 'js/pedidos.bundle.js'],
        balance:    ['js/balance.bundle.js'],
        reportes:   ['js/reportes.bundle.js'],
        clientes:   ['js/clientes.bundle.js'],
        envios:     ['js/envios.bundle.js'],
        backup:     ['js/backup.bundle.js']
    } : {
        inventario: [
            'js/categorias.js',
            'js/inventory-1.js',
            'js/inventory-2-pt.js',
            'js/inventory-2-pack.js',
            'js/inventory-2-pv.js',
            'js/inventory-3.js',
            'js/inventory-4.js',
            'js/inventory-5.js'
        ],
        pedidos: [
            'js/whatsapp.js',
            'js/balance.js',
            'js/pedidos-1-modal.js',
            'js/pedidos-1-views.js',
            'js/pedidos-1-extra.js',
            'js/pedidos-2.js',
            'js/pedidos-3.js'
        ],
        balance:  ['js/balance.js'],
        reportes: ['js/reportes.js'],
        clientes: ['js/clientes.js'],
        envios:   ['js/envios.js'],
        backup:   ['js/backup.js']
    };

    // ── Mapa sección → grupo ─────────────────────────────────────
    var _SECCION_A_GRUPO = {
        inventory:   'inventario',
        inventario:  'inventario',
        categorias:  'inventario',
        pedidos:     'pedidos',
        quotes:      'pedidos',
        balance:     'balance',
        reportes:    'reportes',
        analisis:    'reportes',
        clientes:    'clientes',
        envios:      'envios',
        backup:      'backup'
    };

    var _cargados = new Set();
    var _cargando = new Map(); // url/grupo → Promise
    var _scriptPromises = new Map(); // url → Promise (para deduplicar scripts en vuelo)

    // ── Inyecta un <script> y resuelve cuando carga ──────────────
    // BUG FIX: mantener mapa de promises por URL para reutilizar la promise
    // en vuelo — evita que un querySelector encuentre un tag ya insertado
    // por otro grupo y resuelva prematuramente antes de que el script ejecute.
    function _cargarScript(src) {
        // Si ya hay una promise para este src (cargando o cargado), reutilizarla
        if (_scriptPromises.has(src)) return _scriptPromises.get(src);

        // Si el script ya está en el DOM con readyState 'complete', resolver inmediato
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing && (existing as any).readyState === 'complete') {
            var resolved = Promise.resolve();
            _scriptPromises.set(src, resolved);
            return resolved;
        }
        // Si el script está en el DOM pero aún cargando, esperar su onload
        if (existing) {
            var waitExisting = new Promise(function(resolve) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', resolve, { once: true }); // resolver aunque falle
            });
            _scriptPromises.set(src, waitExisting);
            return waitExisting;
        }

        // Script no existe: crear, insertar, esperar
        var p = new Promise<void>(function (resolve) {
            var el = document.createElement('script');
            el.src = src;
            el.onload  = () => resolve();
            el.onerror = function () {
                console.warn('[Bicho Capricho Lazy] No se pudo cargar:', src);
                resolve();
            };
            document.body.appendChild(el);
        });
        _scriptPromises.set(src, p);
        return p;
    }

    // ── Inyecta un <link> CSS y resuelve cuando carga ────────────
    function _cargarCSS(href) {
        return new Promise<void>(function (resolve) {
            if (document.querySelector('link[href="' + href + '"]')) {
                resolve(); return;
            }
            var el = document.createElement('link');
            el.rel  = 'stylesheet';
            el.href = href;
            el.onload  = () => resolve();
            el.onerror = function () {
                console.warn('[Bicho Capricho Lazy] No se pudo cargar CSS:', href);
                resolve();
            };
            document.head.appendChild(el);
        });
    }

    // ── Carga un recurso (JS o CSS según extensión/tipo) ─────────
    function _cargarRecurso(src) {
        if (src.includes('.css') || src.includes('leaflet.css')) return _cargarCSS(src);
        return _cargarScript(src);
    }

    // ── Carga todos los recursos de un grupo ────────────────────
    // CDN externos + primer módulo local en paralelo (acelera espera inicial),
    // resto de locales en serie (respeta dependencias entre módulos).
    function _cargarGrupo(grupo) {
        if (_cargados.has(grupo))  return Promise.resolve();
        if (_cargando.has(grupo))  return _cargando.get(grupo);

        var promise = (async function () {
            var recursos   = _GRUPOS[grupo] || [];
            var cdnItems   = recursos.filter(function(r){ return r.startsWith('http'); });
            var localItems = recursos.filter(function(r){ return !r.startsWith('http'); });
            // CDN + primer local en paralelo
            var primeros = cdnItems.concat(localItems.slice(0, 1));
            var resto    = localItems.slice(1);
            if (primeros.length) await Promise.all(primeros.map(_cargarRecurso));
            // Resto en orden (pueden tener dependencias entre sí)
            for (var i = 0; i < resto.length; i++) {
                await _cargarRecurso(resto[i]);
            }
            _cargados.add(grupo);
        })();

        _cargando.set(grupo, promise);
        return promise;
    }

    // ── API pública ──────────────────────────────────────────────

    // Carga el grupo de una sección; devuelve Promise
    window._mkLazyLoad = function (seccion) {
        var grupo = _SECCION_A_GRUPO[seccion];
        return grupo ? _cargarGrupo(grupo) : Promise.resolve();
    };

    // Carga una URL CDN arbitraria bajo demanda (JS o CSS)
    window._mkLoadCDN = function (url) {
        if (_cargando.has(url)) return _cargando.get(url);
        var p = _cargarRecurso(url).then(function () { _cargados.add(url); });
        _cargando.set(url, p);
        return p;
    };

    // Verdadero si el grupo ya está listo
    window._mkGrupoListo = function (seccion) {
        var grupo = _SECCION_A_GRUPO[seccion];
        return !grupo || _cargados.has(grupo);
    };

    // ── Garantizar Chart.js bajo demanda (balance y reportes) ───────
    window._mkEnsureChartJs = function () {
        return _cargarScript(CDN.chartjs);
    };

    // ── Garantizar Leaflet bajo demanda (envios — mapas) ────────────
    // CSS + JS deben cargarse juntos antes de usar L.*
    window._mkEnsureLeaflet = function () {
        return Promise.all([_cargarCSS(CDN.leafletCSS), _cargarScript(CDN.leafletJS)]);
    };

    // ── Prefetch agresivo — todos los grupos en paralelo a 300ms ──
    // Chart.js y Leaflet arrancan de inmediato (sin esperar 300ms)
    // para que estén listos cuando el usuario interactúe con ellos.
    window.addEventListener('load', function () {
        // Chart.js: al terminar de cargar, re-renderizar el gráfico de flujo de caja
        // si el dashboard está activo (en la carga inicial, la gráfica queda en blanco
        // porque Chart.js CDN aún no había respondido cuando updateDashboard() corrió)
        _cargarScript(CDN.chartjs).then(function () {
            var dash = document.getElementById('dashboard-section');
            if (dash && !dash.classList.contains('hidden')) {
                if (typeof window.renderCashFlowChart === 'function') window.renderCashFlowChart();
            }
        });
        _cargarCSS(CDN.leafletCSS); _cargarScript(CDN.leafletJS);  // para envios/mapas
        setTimeout(function () {
            _cargarGrupo('pedidos');
            _cargarGrupo('inventario');
            _cargarGrupo('balance');
            _cargarGrupo('clientes');
            _cargarGrupo('reportes');
            _cargarGrupo('envios');
            _cargarGrupo('backup');
        }, 300);
    }, { once: true });

})();
