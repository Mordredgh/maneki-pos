import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

it('empaqueta el POS sin secretos, fuentes, mapas ni restos de una publicacion anterior', () => {
  const root = mkdtempSync(join(tmpdir(), 'bicho-pages-'));
  try {
    for (const dir of ['css', 'js', 'img', 'cloudflare', 'dist/cloudflare']) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, 'cloudflare/auth-worker.mjs'), 'export default {};');
    for (const file of ['index.html', 'manifest.json', 'sw.js', 'logo.png', 'maneki-premium.css',
      'css/tailwind.css', 'js/core.bundle.js', 'img/producto.webp']) writeFileSync(join(root, file), 'publico');
    for (const file of ['.env', 'js/private.env', 'js/core.bundle.js.map', 'js/source.ts', 'dist/cloudflare/.env']) {
      writeFileSync(join(root, file), 'no publicar');
    }
    execFileSync(process.execPath, [resolve('scripts/package-cloudflare.cjs'), root]);
    const output = join(root, 'dist/cloudflare');
    expect(readFileSync(join(output, 'js/core.bundle.js'), 'utf8')).toBe('publico');
    expect(existsSync(join(output, 'img/producto.webp'))).toBe(true);
    expect(readFileSync(join(output, '_headers'), 'utf8')).toContain('Cache-Control: no-cache');
    expect(readFileSync(join(output, '_worker.js'), 'utf8')).toBe('export default {};');
    expect(JSON.parse(readFileSync(join(output, '_routes.json'), 'utf8'))).toEqual({ version: 1, include: ['/*'], exclude: [] });
    for (const file of ['.env', 'js/private.env', 'js/core.bundle.js.map', 'js/source.ts']) {
      expect(existsSync(join(output, file)), file).toBe(false);
    }
  } finally {
    // Directorio temporal creado arriba; nunca apunta al proyecto ni a datos de negocio.
    rmSync(root, { recursive: true, force: true });
  }
});
