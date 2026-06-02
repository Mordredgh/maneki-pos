const CACHE_NAME = "maneki-v2.3.1";
const STATIC_ASSETS = [
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
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
