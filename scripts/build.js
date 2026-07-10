const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'js');

// ── Step 0: Typecheck — tsc --noEmit, falla rápido antes de tests/compile ──────
console.log('Typecheck...');
try {
  execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('\n  ✖ Typecheck falló. Corrige errores TypeScript antes de buildear.\n');
  process.exit(1);
}

// ── Step 0a: Tests de regresión — no se puede deployar con lógica rota ─────────
console.log('Tests...');
try {
  execSync('npx vitest run --reporter=verbose', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('\n  ✖ Tests fallaron — corrige los tests antes de buildear.\n');
  process.exit(1);
}

// ── Step 0b: Footgun lint (rompe el build si regresa un bug de clase conocida) ─
console.log('Footgun lint...');
require('./lint-footguns.js');   // lanza Error y aborta el build si encuentra algo

// ── Step 1: Compile TS → JS (individual files, needed for dev) ──────────────
const tsFiles = fs.readdirSync(SRC).filter(f => f.endsWith('.ts'));
console.log(`Compiling ${tsFiles.length} TypeScript files...`);

let errors = 0;
for (const file of tsFiles) {
  const name = file.replace('.ts', '.js');
  const cmd = `npx esbuild "${path.join(SRC, file)}" --outfile="${path.join(OUT, name)}" --sourcemap --target=es2020 --minify`;
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    console.error(`FAIL: ${file} — ${e.stderr?.toString().trim()}`);
    errors++;
  }
}
console.log(`Compiled: ${tsFiles.length - errors}/${tsFiles.length} files${errors ? ` (${errors} errors)` : ''}`);

// ── Step 2: Bundle groups (concat in order) ─────────────────────────────────
const BUNDLES = {
  'core.bundle.js': [
    'icons.js', 'db.js', 'app-data.js', 'equipos.js',
    'config.js', 'dashboard.js', 'ui-extras.js', 'navigation.js',
    'lazy-loader.js', 'design-system.js', 'templates.js', 'csp-delegate.js', 'init.js'
  ],
  'inventario.bundle.js': [
    'categorias.js', 'inventory-1.js', 'inventory-2-pt.js', 'inventory-2-pack.js',
    'inventory-2-pv.js', 'inventory-3.js', 'inventory-4.js', 'inventory-5.js'
  ],
  'pedidos.bundle.js': [
    'whatsapp.js', 'pedidos-1-modal.js', 'pedidos-1-views.js',
    'pedidos-1-extra.js', 'pedidos-2.js', 'pedidos-3.js'
  ],
  'balance.bundle.js': ['balance.js'],
  'reportes.bundle.js': ['reportes.js'],
  'clientes.bundle.js': ['clientes.js'],
  'envios.bundle.js': ['envios.js'],
  'backup.bundle.js': ['backup.js'],
};

console.log('Creating bundles...');
let bundleCount = 0;
for (const [bundleName, files] of Object.entries(BUNDLES)) {
  const parts = [];
  for (const f of files) {
    const p = path.join(OUT, f);
    if (fs.existsSync(p)) {
      parts.push(fs.readFileSync(p, 'utf8'));
    } else {
      console.warn(`  WARN: ${f} not found, skipping in ${bundleName}`);
    }
  }
  fs.writeFileSync(path.join(OUT, bundleName), parts.join('\n;\n'), 'utf8');
  const size = (Buffer.byteLength(parts.join('\n;\n')) / 1024).toFixed(1);
  console.log(`  ${bundleName} — ${size} KB (${files.length} files)`);
  bundleCount++;
}
console.log(`Bundled: ${bundleCount} bundles`);

// ── Step 3: Swap index.html to use core bundle ────────────────────────────
console.log('Swapping index.html to bundles...');
require('./swap-bundles.js');

// ── Step 4: Hash SW cache ───────────────────────────────────────────────────
console.log('Hashing SW cache...');
require('./hash-sw.js');

console.log('Build complete.');
