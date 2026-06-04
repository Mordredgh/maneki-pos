const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');

const ASSETS_TO_HASH = [
  'index.html',
  'maneki-premium.css',
  'manifest.json',
  'logo.png',
  'css/tailwind.css',
  'css/styles.css',
  'css/ui-redesign.css',
  'css/responsive.css',
];

const jsDir = path.join(ROOT, 'js');
const jsFiles = fs.readdirSync(jsDir)
  .filter(f => f.endsWith('.js'))
  .map(f => path.join('js', f));

const allFiles = [...ASSETS_TO_HASH, ...jsFiles];

const hash = crypto.createHash('sha256');
let fileCount = 0;

for (const rel of allFiles) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) {
    hash.update(fs.readFileSync(abs));
    fileCount++;
  }
}

const digest = hash.digest('hex').substring(0, 10);
const cacheName = `maneki-${digest}`;

let sw = fs.readFileSync(SW_PATH, 'utf8');
sw = sw.replace(/^const CACHE_NAME = ".*";/, `const CACHE_NAME = "${cacheName}";`);
fs.writeFileSync(SW_PATH, sw, 'utf8');

console.log(`SW cache: ${cacheName} (${fileCount} files hashed)`);
