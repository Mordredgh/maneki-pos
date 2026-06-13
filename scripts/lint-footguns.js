/**
 * lint-footguns.js — Guardrail anti-bugs recurrentes de Maneki POS.
 *
 * Cada regla corresponde a una CLASE de bug que ha vuelto a aparecer en
 * auditorías (S18-S26). El objetivo no es "ser más cuidadosos" — es que el
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
// allow: (opcional) si el CONTEXTO alrededor de la línea TAMBIÉN cumple esto, es
//        un uso legítimo → se ignora. El contexto es ±1 línea por defecto.
// windowBack/windowFwd: (opcional) líneas de contexto hacia atrás/adelante para el
//        test de `allow` (default 1 y 1). Útil cuando el "antídoto" (p.ej. el DELETE
//        que acompaña a un filter) vive varias líneas más abajo, no justo al lado.
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
  {
    // "upsert no elimina" — la clase de bug más recurrente (S18, S24, S25, S26).
    // saveIncomes/saveExpenses/saveSalesHistory/savePedidos*/saveClients usan upsert,
    // que NUNCA borra filas. Si quitas un elemento del array relacional LOCAL
    // (X = X.filter(...) o X.splice(...)) y solo llamas al save*, la fila sigue en
    // Supabase y reaparece al recargar → balance descuadrado / venta fantasma.
    id: 'upsert-sin-delete',
    // Reasignación `X = X.filter(` (con/sin window.) o `X.splice(` sobre un array
    // relacional. \2 obliga a que el mismo array esté a ambos lados del `=`
    // (así `const ids = salesHistory.filter(...)` —una lectura— NO dispara).
    match: /\b(window\.)?(pedidosFinalizados|pedidos|incomes|expenses|salesHistory|clients)\s*(?:=\s*(?:window\.)?\2\s*\.filter|\.splice)\s*\(/,
    // Uso legítimo: hay un DELETE que acompaña al filtro/splice en el contexto:
    //   · un helper de borrado de db.ts (deleteIncomeFromDB, deletePedidoActivo, …)
    //   · un .delete() directo de Supabase (db.from('incomes').delete())
    //   · el id se acumuló en un array _ids* para borrado en lote más abajo
    //     (p.ej. _idsFinalizadosLote.push(id) → forEach(deletePedidoActivo) al final).
    allow: /delete(IncomesByFolio|IncomeFromDB|ExpenseFromDB|SalesHistoryEntry|PedidoActivo|PedidoFinalizado|ClientFromDB)\b|\.delete\s*\(|_ids\w*\.push\s*\(/,
    // El DELETE casi siempre va DESPUÉS del filtro → ventana sesgada hacia adelante.
    windowBack: 8,
    windowFwd: 12,
    hint: 'Quitaste un elemento de un array relacional (incomes/expenses/salesHistory/pedidos/pedidosFinalizados/clients) del estado LOCAL, pero save*() usa upsert y NO borra la fila en Supabase → reaparece al recargar (balance descuadrado / venta fantasma). Acompaña el filter/splice con su delete de db.ts: deleteIncomeFromDB · deleteIncomesByFolio · deleteExpenseFromDB · deleteSalesHistoryEntry · deletePedidoActivo · deletePedidoFinalizado · deleteClientFromDB. Bug clase S18/S24/S25/S26.',
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
      for (const r of rules) {
        if (!r.match.test(line)) continue;
        if (r.allow) {
          // Ventana de contexto para el escape legítimo. Por defecto ±1 línea (el
          // fallback guardado de un ternario multilínea pone showConfirm/_fechaHoy
          // en la línea de arriba). Reglas que necesitan ver más lejos —p.ej. el
          // DELETE que acompaña a un filter/splice varias líneas abajo— amplían la
          // ventana con windowBack/windowFwd.
          const back = r.windowBack || 1;
          const fwd  = r.windowFwd  || 1;
          const ctx  = lines.slice(Math.max(0, i - back), i + fwd + 1).join('\n');
          if (r.allow.test(ctx)) continue;
        }
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
