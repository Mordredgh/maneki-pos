const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const SW_PATH = path.join(ROOT, 'sw.js');

// ── Swap index.html ──────────────────────────────────────────────────────────
let html = fs.readFileSync(INDEX, 'utf8');

const INDIVIDUAL_BLOCK = `  <!-- 1. Base: Supabase, SQLite, sync, offline -->
  <script src="js/db.js"></script>

  <!-- 2. Datos globales, variables, temas, emojis -->
  <script src="js/app-data.js"></script>

  <!-- 3. Core siempre necesario -->
  <script src="js/equipos.js"></script>
  <script src="js/config.js"></script>
  <script src="js/dashboard.js"></script>
  <script src="js/ui-extras.js"></script>
  <script src="js/navigation.js"></script>

  <!-- 4. Cargador diferido — descarga secciones bajo demanda -->
  <script src="js/lazy-loader.js"></script>

  <!-- 5. Sistema visual y arranque final -->
  <script src="js/design-system.js"></script>
  <script src="js/templates.js"></script>
  <script src="js/init.js"></script>`;

const BUNDLE_BLOCK = `  <!-- D25: Core bundle (12 scripts → 1 request) -->
  <script src="js/core.bundle.js"></script>`;

if (html.includes('js/core.bundle.js')) {
  console.log('  index.html already uses core bundle.');
} else if (html.includes(INDIVIDUAL_BLOCK)) {
  html = html.replace(INDIVIDUAL_BLOCK, BUNDLE_BLOCK);
  fs.writeFileSync(INDEX, html, 'utf8');
  console.log('  index.html: 12 scripts → core.bundle.js');
} else {
  console.warn('  WARN: Could not match individual scripts block in index.html');
}

// ── Swap sw.js asset lists ───────────────────────────────────────────────────
let sw = fs.readFileSync(SW_PATH, 'utf8');

const OLD_CRITICAL = `const CRITICAL_ASSETS = [
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
];`;

const NEW_CRITICAL = `const CRITICAL_ASSETS = [
  "/",
  "/index.html",
  "/css/tailwind.css",
  "/css/styles.css",
  "/css/ui-redesign.css",
  "/css/responsive.css",
  "/maneki-premium.css",
  "/logo.png",
  "/js/core.bundle.js",
];`;

const OLD_SECONDARY = `const SECONDARY_ASSETS = [
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
];`;

const NEW_SECONDARY = `const SECONDARY_ASSETS = [
  "/js/inventario.bundle.js",
  "/js/pedidos.bundle.js",
  "/js/balance.bundle.js",
  "/js/reportes.bundle.js",
  "/js/clientes.bundle.js",
  "/js/envios.bundle.js",
  "/js/backup.bundle.js"
];`;

if (sw.includes('core.bundle.js')) {
  console.log('  sw.js already uses bundles.');
} else {
  if (sw.includes(OLD_CRITICAL)) sw = sw.replace(OLD_CRITICAL, NEW_CRITICAL);
  if (sw.includes(OLD_SECONDARY)) sw = sw.replace(OLD_SECONDARY, NEW_SECONDARY);
  fs.writeFileSync(SW_PATH, sw, 'utf8');
  console.log('  sw.js: asset lists swapped to bundles (30 → 9 cached)');
}
