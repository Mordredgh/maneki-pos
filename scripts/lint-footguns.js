/**
 * lint-footguns.js — Guardrail anti-bugs recurrentes de Maneki POS.
 *
 * Cada regla corresponde a una CLASE de bug que ha vuelto a aparecer en
 * auditorías (S20-S24). El objetivo no es "ser más cuidadosos" — es que el
 * build TRUENE automáticamente cuando un footgun conocido regresa, lo detecte
 * un humano o no.
 *
 * Filosofía: cero falsos positivos. Una regla que grita en falso se ignora y
 * se desactiva en una semana. Por eso cada patrón prohibido lleva su escape
 * legítimo explícito (el fallback guardado, el archivo dueño del helper, etc).
 *
 * Uso:
 *   node scripts/lint-footguns.js          → corre y termina (exit 1 si falla)
 *   require('./lint-footguns.js')           → lanza Error si encuentra algo
 *
 * Para añadir una excepción puntual y consciente en una línea, agrega el
 * comentario  // footgun-ok: <razón>  al final de esa línea.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// ── Reglas ──────────────────────────────────────────────────────────────────
// match: regex que marca una línea sospechosa.
// allow: (opcional) si la línea TAMBIÉN cumple esto, es un uso legítimo → se ignora.
// onlyIn: (opcional) archivos donde el patrón SÍ es legítimo (se ignora ahí).
// hint: qué usar en su lugar.
const RULES = [
  {
    id: 'fecha-utc',
    match: /toISOString\(\)\.split/,
    allow: /_fechaHoy/,                     // fallback guardado es válido
    hint: 'Usa _fechaHoy() para fechas de negocio (toISOString() corre en UTC y desfasa de noche). Bug A2/B3.',
  },
  {
    id: 'uuid-directo',
    match: /crypto\.randomUUID/,
    onlyIn: ['db.ts'],                      // mkId() vive aquí, es su única casa
    hint: 'Usa mkId() en vez de crypto.randomUUID() directo.',
  },
  {
    id: 'dialogo-nativo',
    match: /(^|[^.\w])(confirm|alert|prompt)\s*\(/,
    allow: /showConfirm|window\.(confirm|alert|prompt)|manekiToast/,  // fallback explícito window.* es consciente
    hint: 'Usa showConfirm(msg, titulo) del design system, no confirm()/alert()/prompt() nativos. Bug D3.',
  },
  {
    id: 'nombre-global-prohibido',
    match: /\b_fechaLocal\b/,
    hint: '_fechaLocal colisiona con helpers existentes. Usa _fechaHoy().',
  },
];

// Reglas que escanean scripts de build / package.json (config, no src).
const CONFIG_RULES = [
  {
    id: 'esbuild-iife',
    match: /--format=iife|--global-name/,
    hint: 'esbuild con --format=iife o --global-name rompe el orden de carga de bundles. Prohibido.',
  },
];

// ── Motor ─────────────────────────────────────────────────────────────────
function scan(files, rules, label) {
  const hits = [];
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const base = path.basename(file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (/^(\/\/|\*|\/\*)/.test(trimmed)) return;          // línea de comentario → no es código
      if (/\/\/\s*footgun-ok/.test(line)) return;           // escape consciente por línea
      // Ventana de contexto: el fallback guardado de un ternario multilínea pone el
      // helper (showConfirm / _fechaHoy) en la línea de arriba — míralo también.
      const ctx = [lines[i - 1], line, lines[i + 1]].filter(Boolean).join('\n');
      for (const r of rules) {
        if (!r.match.test(line)) continue;
        if (r.allow && r.allow.test(ctx)) continue;
        if (r.onlyIn && r.onlyIn.includes(base)) continue;
        hits.push({ rule: r, file: rel, line: i + 1, text: trimmed });
      }
    });
  }
  return hits;
}

function listTs(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.ts')).map(f => path.join(dir, f));
}

function run() {
  const srcFiles = listTs(SRC);
  const configFiles = [
    ...fs.readdirSync(path.join(ROOT, 'scripts'))
      .filter(f => f.endsWith('.js') && f !== 'lint-footguns.js')
      .map(f => path.join(ROOT, 'scripts', f)),
    path.join(ROOT, 'package.json'),
  ].filter(fs.existsSync);

  const hits = [
    ...scan(srcFiles, RULES, 'src'),
    ...scan(configFiles, CONFIG_RULES, 'config'),
  ];

  if (hits.length === 0) {
    console.log('  Footgun lint: OK (0 problemas)');
    return true;
  }

  console.error(`\n  ✖ Footgun lint: ${hits.length} problema(s) — el build NO continuará:\n`);
  // Agrupar por regla para un reporte legible.
  const byRule = {};
  for (const h of hits) (byRule[h.rule.id] ||= []).push(h);
  for (const [id, list] of Object.entries(byRule)) {
    console.error(`  [${id}] ${list[0].rule.hint}`);
    for (const h of list) console.error(`     ${h.file}:${h.line}  →  ${h.text}`);
    console.error('');
  }
  console.error('  Corrige los anteriores o, si es un uso legítimo y deliberado,');
  console.error('  añade  // footgun-ok: <razón>  al final de esa línea.\n');
  return false;
}

// Standalone vs require()
if (require.main === module) {
  process.exit(run() ? 0 : 1);
} else {
  if (!run()) throw new Error('Footgun lint falló — corrige los problemas listados arriba.');
}
