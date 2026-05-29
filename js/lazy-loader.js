// ═══════════════════════════════════════════════════════════════
//  MANEKI LAZY LOADER — carga módulos por sección bajo demanda
//  Reduce el JS inicial de ~1.1 MB a ~317 KB (71% menos)
// ═══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── Grupos de scripts por sección ───────────────────────────
    const _GRUPOS = {
        inventario: [
            'js/categorias.js',
            'js/inventory-1.js',
            'js/inventory-2.js',
            'js/inventory-3.js',
            'js/inventory-4.js',
            'js/inventory-5.js'
        ],
        pedidos: [
            'js/whatsapp.js',
            'js/pedidos-1.js',
            'js/pedidos-2.js',
            'js/pedidos-3.js'
        ],
        balance:  ['js/balance.js'],
        reportes: ['js/reportes.js'],
        clientes: ['js/clientes.js'],
        envios:   ['js/envios.js'],
        pos:      ['js/pos.js'],
        backup:   ['js/backup.js']
    };

    // ── Mapa sección → grupo ─────────────────────────────────────
    const _SECCION_A_GRUPO = {
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
        pos:         'pos',
        backup:      'backup'
    };

    const _cargados  = new Set();
    const _cargando  = new Map(); // grupo → Promise

    // ── Inyecta un <script> y resuelve cuando carga ──────────────
    function _cargarScript(src) {
        return new Promise(function (resolve) {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve(); return;
            }
            var el = document.createElement('script');
            el.src = src;
            el.onload  = resolve;
            el.onerror = function () {
                console.warn('[Maneki Lazy] No se pudo cargar:', src);
                resolve(); // no bloquear el resto
            };
            document.body.appendChild(el);
        });
    }

    // ── Carga todos los scripts de un grupo en orden ─────────────
    function _cargarGrupo(grupo) {
        if (_cargados.has(grupo))  return Promise.resolve();
        if (_cargando.has(grupo))  return _cargando.get(grupo);

        var promise = (async function () {
            var scripts = _GRUPOS[grupo] || [];
            for (var i = 0; i < scripts.length; i++) {
                await _cargarScript(scripts[i]);
            }
            _cargados.add(grupo);
        })();

        _cargando.set(grupo, promise);
        return promise;
    }

    // ── API pública ──────────────────────────────────────────────
    // Llamar antes de mostrar una sección; devuelve Promise
    window._mkLazyLoad = function (seccion) {
        var grupo = _SECCION_A_GRUPO[seccion];
        return grupo ? _cargarGrupo(grupo) : Promise.resolve();
    };

    // Verdadero si el grupo ya está listo
    window._mkGrupoListo = function (seccion) {
        var grupo = _SECCION_A_GRUPO[seccion];
        return !grupo || _cargados.has(grupo);
    };

    // ── Prefetch en segundo plano tras el arranque ───────────────
    // Los módulos más usados se descargan silenciosamente para que
    // estén listos antes de que el usuario los necesite.
    window.addEventListener('load', function () {
        setTimeout(function () { _cargarGrupo('pedidos');   }, 800);
        setTimeout(function () { _cargarGrupo('inventario');}, 1600);
        setTimeout(function () { _cargarGrupo('balance');   }, 2800);
        setTimeout(function () { _cargarGrupo('clientes');  }, 3800);
        setTimeout(function () { _cargarGrupo('reportes');  }, 5000);
        setTimeout(function () { _cargarGrupo('envios');    }, 6200);
        setTimeout(function () { _cargarGrupo('pos');       }, 7000);
        setTimeout(function () { _cargarGrupo('backup');    }, 7800);
    }, { once: true });

})();
