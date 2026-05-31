const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// MANEKI POS — Build Pipeline
//
// Fuente:  src/*.ts  (TypeScript)
// Salida:  js/*.js   (lo que carga el browser/Electron)
//
// Cada archivo se compila individualmente (sin bundle) para
// mantener las variables globales cross-file que la app usa.
// ═══════════════════════════════════════════════════════════════

// Todos los archivos .ts en src/
const allTsFiles = fs.readdirSync('src')
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join('src', f));

const isWatch = process.argv.includes('--watch');
const isProd  = process.argv.includes('--prod');

const buildOptions = {
    entryPoints: allTsFiles,
    bundle: false,       // NO bundlear — cada .ts produce un .js independiente
    outdir: 'js',        // Sobrescribe js/*.js (el browser carga estos)
    minify: isProd,
    sourcemap: !isProd,
    target: ['chrome100'],
    charset: 'utf8',
};

if (isWatch) {
    // Watch mode para desarrollo: recompila al guardar
    esbuild.context(buildOptions).then(ctx => {
        ctx.watch();
        console.log('[Build] Watching src/*.ts → js/*.js ...');
    });
} else {
    esbuild.build(buildOptions).then(() => {
        console.log(`[Build] ${allTsFiles.length} archivos: src/*.ts → js/*.js` + (isProd ? ' (minified)' : ''));

        // Producción: también generar dist/ con minificación
        if (isProd) {
            const distFiles = [
                // Core (carga directa en index.html)
                'js/icons.js', 'js/config-init.js', 'js/db.js', 'js/app-data.js',
                'js/equipos.js', 'js/config.js', 'js/dashboard.js', 'js/ui-extras.js',
                'js/navigation.js', 'js/lazy-loader.js', 'js/design-system.js',
                'js/templates.js', 'js/init.js', 'js/migration-prep.js',
                // Lazy-loaded
                'js/pedidos-1.js', 'js/pedidos-2.js', 'js/pedidos-3.js',
                'js/inventory-1.js', 'js/inventory-2.js', 'js/inventory-3.js',
                'js/inventory-4.js', 'js/inventory-5.js',
                'js/balance.js', 'js/reportes.js', 'js/clientes.js',
                'js/whatsapp.js', 'js/categorias.js', 'js/envios.js', 'js/backup.js'
            ];
            if (!fs.existsSync('dist/js')) fs.mkdirSync('dist/js', { recursive: true });
            distFiles.forEach(f => {
                if (fs.existsSync(f)) fs.copyFileSync(f, path.join('dist', f));
            });

            // CSS
            const cssFiles = ['css/styles.css', 'css/responsive.css', 'css/ui-redesign.css', 'maneki-premium.css'];
            if (!fs.existsSync('dist/css')) fs.mkdirSync('dist/css', { recursive: true });
            cssFiles.forEach(f => {
                if (fs.existsSync(f)) fs.copyFileSync(f, path.join('dist', f));
            });
            console.log('[Build] dist/ ready for production');
        }
    }).catch(e => {
        console.error('Build failed:', e);
        process.exit(1);
    });
}
