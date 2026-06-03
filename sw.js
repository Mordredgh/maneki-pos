const CACHE_NAME = "maneki-v2.3.5";

// P6: assets críticos (deben estar en caché para que la app arranque)
const CRITICAL_ASSETS = [
  "/",
  "/index.html",
  "/css/tailwind.css",
  "/css/styles.css",
  "/css/ui-redesign.css",
  "/css/responsive.css",
  "/maneki-premium.css",
  "/logo.png",
  "/js/icons.js",
  "/js/config-init.js",
  "/js/db.js",
  "/js/config.js",
  "/js/init.js",
  "/js/design-system.js",
  "/js/navigation.js",
];

// Assets secundarios: se intentan cachear pero no bloquean el install si fallan
const SECONDARY_ASSETS = [
  "/js/lazy-loader.js",
  "/js/templates.js",
  "/js/ui-extras.js",
  "/js/dashboard.js",
  "/js/app-data.js",
  "/js/equipos.js",
  "/js/pedidos-1.js",
  "/js/pedidos-2.js",
  "/js/pedidos-3.js",
  "/js/inventory-1.js",
  "/js/inventory-2.js",
  "/js/inventory-3.js",
  "/js/inventory-4.js",
  "/js/inventory-5.js",
  "/js/balance.js",
  "/js/reportes.js",
  "/js/clientes.js",
  "/js/whatsapp.js",
  "/js/backup.js",
  "/js/envios.js",
  "/js/categorias.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Críticos: si alguno falla, el install falla (comportamiento esperado)
      return cache.addAll(CRITICAL_ASSETS).then(() => {
        // Secundarios: se cachean individualmente; un fallo no rompe el install
        return Promise.allSettled(
          SECONDARY_ASSETS.map(url => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ includeUncontrolled: true, type: "window" }))
      .then((clients) => {
        // SW-NOTIFY: avisar a todas las pestañas abiertas que hay una nueva versión.
        // El listener en init.js muestra un toast para que el usuario pueda recargar.
        if (clients.length > 0) {
          clients.forEach((c) => c.postMessage({ type: "SW_UPDATED", version: CACHE_NAME }));
        }
      })
  );
});

self.addEventListener("fetch", (e) => {
  // cache.put() solo soporta http/https — ignorar chrome-extension:// y similares
  if (!e.request.url.startsWith("http")) return;

  const url = new URL(e.request.url);

  if (url.origin.includes("supabase.co") || url.origin.includes("telegram")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  if (url.origin.includes("cdn.jsdelivr.net") || url.origin.includes("cdnjs.cloudflare.com") || url.origin.includes("unpkg.com") || url.origin.includes("fonts.googleapis.com") || url.origin.includes("fonts.gstatic.com")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // P-6: Para assets locales (mismo hostname) → cache-first
  if (url.hostname === self.location.hostname) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((response) => {
          if (response.ok && e.request.method === "GET") {
            caches.open(CACHE_NAME).then((c) => c.put(e.request, response.clone()));
          }
          return response;
        }).catch(() => caches.match(e.request));
      })
    );
    return;
  }

  // Resto (otros orígenes no cubiertos arriba): network-first
  e.respondWith(
    fetch(e.request).then((response) => {
      if (response.ok && e.request.method === "GET") {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
