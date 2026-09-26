const fs = require('node:fs');
const path = require('node:path');

const root = fs.realpathSync(process.argv[2] || path.resolve(__dirname, '..'));
const output = path.join(root, 'dist', 'cloudflare');
// ponytail: lista explicita de assets, igual que Docker; nunca publicar el repositorio.
const files = ['index.html', 'manifest.json', 'sw.js', 'logo.png', 'maneki-premium.css'];
for (const file of files) fs.accessSync(path.join(root, file));
fs.accessSync(path.join(root, 'cloudflare', 'auth-worker.mjs'));
for (const dir of ['dist', 'dist/cloudflare']) {
  const target = path.join(root, dir);
  if (fs.existsSync(target) && (fs.lstatSync(target).isSymbolicLink() || !fs.realpathSync(target).startsWith(root + path.sep))) {
    throw new Error('Destino fuera del proyecto: ' + target);
  }
}
if (fs.existsSync(output)) fs.rmSync(output, { recursive: true });
fs.mkdirSync(output, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(output, file));
for (const dir of ['css', 'js', 'img']) {
  fs.cpSync(path.join(root, dir), path.join(output, dir), {
    recursive: true,
    filter: source => {
      const stat = fs.lstatSync(source);
      return !stat.isSymbolicLink() && !path.basename(source).startsWith('.') &&
        (stat.isDirectory() || /\.(css|js|webp|png|jpg|jpeg|svg|ico|woff2?)$/i.test(source));
    }
  });
}
fs.writeFileSync(path.join(output, '_headers'), `/*
  Cache-Control: no-cache
  X-Content-Type-Options: nosniff
  X-Robots-Tag: noindex, nofollow
/sw.js
  Service-Worker-Allowed: /
`);
fs.copyFileSync(path.join(root, 'cloudflare', 'auth-worker.mjs'), path.join(output, '_worker.js'));
fs.writeFileSync(path.join(output, '_routes.json'), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
console.log('Paquete Cloudflare listo: ' + output);
