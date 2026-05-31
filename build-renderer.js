const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Lista de archivos JS del renderer en orden de carga (debe coincidir con index.html)
// Los módulos lazy (pedidos-1/2/3, inventory-1..5, balance, reportes, etc.) no van aquí
// porque se cargan bajo demanda por lazy-loader.js
const entryFiles = [
    'js/icons.js',
    'js/config-init.js',
    'js/db.js',
    'js/app-data.js',
    'js/equipos.js',
    'js/config.js',
    'js/dashboard.js',
    'js/ui-extras.js',
    'js/navigation.js',
    'js/lazy-loader.js',
    'js/design-system.js',
    'js/templates.js',
    'js/init.js',
    'js/migration-prep.js'
];

// Bundle para produccion
esbuild.build({
    entryPoints: entryFiles,
    bundle: false, // No bundlear -- mantener archivos separados pero minificados
    outdir: 'dist/js',
    minify: true,
    sourcemap: true,
    target: ['chrome100'], // Electron usa Chromium
    format: 'iife',
    charset: 'utf8',
}).then(() => {
    console.log('Renderer JS built successfully');

    // Copiar CSS minificado
    const cssFiles = ['css/styles.css', 'css/responsive.css', 'css/ui-redesign.css', 'maneki-premium.css'];
    if (!fs.existsSync('dist/css')) fs.mkdirSync('dist/css', { recursive: true });
    cssFiles.forEach(f => {
        if (fs.existsSync(f)) {
            fs.copyFileSync(f, path.join('dist', f));
        }
    });
    console.log('CSS copied');
}).catch((e) => {
    console.error('Build failed:', e);
    process.exit(1);
});
