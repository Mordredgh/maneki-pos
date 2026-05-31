(function() {
  "use strict";
  var CDN = {
    chartjs: "https://cdn.jsdelivr.net/npm/chart.js",
    xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    html2pdf: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
    leafletCSS: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    leafletJS: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  };
  var _GRUPOS = {
    inventario: [
      "js/categorias.js",
      "js/inventory-1.js",
      "js/inventory-2.js",
      "js/inventory-3.js",
      "js/inventory-4.js",
      "js/inventory-5.js"
    ],
    pedidos: [
      "js/whatsapp.js",
      "js/balance.js",
      // pedidos-3.js necesita eliminarPedidoFinalizado
      CDN.chartjs,
      // pedidos-2.js usa Chart para ROI
      "js/pedidos-1.js",
      "js/pedidos-2.js",
      "js/pedidos-3.js"
    ],
    balance: ["js/balance.js"],
    reportes: [CDN.chartjs, "js/reportes.js"],
    clientes: ["js/clientes.js"],
    envios: [CDN.leafletCSS, CDN.leafletJS, "js/envios.js"],
    backup: ["js/backup.js"]
  };
  var _SECCION_A_GRUPO = {
    inventory: "inventario",
    inventario: "inventario",
    categorias: "inventario",
    pedidos: "pedidos",
    quotes: "pedidos",
    balance: "balance",
    reportes: "reportes",
    analisis: "reportes",
    clientes: "clientes",
    envios: "envios",
    backup: "backup"
  };
  var _cargados = /* @__PURE__ */ new Set();
  var _cargando = /* @__PURE__ */ new Map();
  function _cargarScript(src) {
    return new Promise(function(resolve) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var el = document.createElement("script");
      el.src = src;
      el.onload = resolve;
      el.onerror = function() {
        console.warn("[Maneki Lazy] No se pudo cargar:", src);
        resolve();
      };
      document.body.appendChild(el);
    });
  }
  function _cargarCSS(href) {
    return new Promise(function(resolve) {
      if (document.querySelector('link[href="' + href + '"]')) {
        resolve();
        return;
      }
      var el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      el.onload = resolve;
      el.onerror = function() {
        console.warn("[Maneki Lazy] No se pudo cargar CSS:", href);
        resolve();
      };
      document.head.appendChild(el);
    });
  }
  function _cargarRecurso(src) {
    if (src.includes(".css") || src.includes("leaflet.css")) return _cargarCSS(src);
    return _cargarScript(src);
  }
  function _cargarGrupo(grupo) {
    if (_cargados.has(grupo)) return Promise.resolve();
    if (_cargando.has(grupo)) return _cargando.get(grupo);
    var promise = (async function() {
      var recursos = _GRUPOS[grupo] || [];
      var cdnItems = recursos.filter(function(r) {
        return r.startsWith("http");
      });
      var localItems = recursos.filter(function(r) {
        return !r.startsWith("http");
      });
      var primeros = cdnItems.concat(localItems.slice(0, 1));
      var resto = localItems.slice(1);
      if (primeros.length) await Promise.all(primeros.map(_cargarRecurso));
      for (var i = 0; i < resto.length; i++) {
        await _cargarRecurso(resto[i]);
      }
      _cargados.add(grupo);
    })();
    _cargando.set(grupo, promise);
    return promise;
  }
  window._mkLazyLoad = function(seccion) {
    var grupo = _SECCION_A_GRUPO[seccion];
    return grupo ? _cargarGrupo(grupo) : Promise.resolve();
  };
  window._mkLoadCDN = function(url) {
    if (_cargando.has(url)) return _cargando.get(url);
    var p = _cargarRecurso(url).then(function() {
      _cargados.add(url);
    });
    _cargando.set(url, p);
    return p;
  };
  window._mkGrupoListo = function(seccion) {
    var grupo = _SECCION_A_GRUPO[seccion];
    return !grupo || _cargados.has(grupo);
  };
  window.addEventListener("load", function() {
    setTimeout(function() {
      _cargarScript(CDN.chartjs);
      _cargarGrupo("pedidos");
      _cargarGrupo("inventario");
      _cargarGrupo("balance");
      _cargarGrupo("clientes");
      _cargarGrupo("reportes");
      _cargarGrupo("envios");
      _cargarGrupo("backup");
    }, 300);
  }, { once: true });
})();
//# sourceMappingURL=lazy-loader.js.map
