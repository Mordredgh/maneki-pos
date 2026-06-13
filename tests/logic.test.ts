import { describe, it, expect, beforeEach } from 'vitest';

// ── calcSaldoPendiente (source: balance.ts) ────────────────────────────────────
// Pure extraction — no window dependency
function calcSaldoPendiente(p: any): number {
  const sumPagos = (p.pagos || []).reduce((s: number, ab: any) => s + Number(ab.monto || 0), 0);
  const totalPagado = sumPagos > 0 ? sumPagos : Number(p.anticipo || 0);
  return Math.max(0, Number(p.total || 0) - totalPagado);
}

describe('calcSaldoPendiente', () => {
  it('returns full total when no payments', () => {
    expect(calcSaldoPendiente({ total: 1000 })).toBe(1000);
  });

  it('subtracts pagos array from total', () => {
    const p = { total: 1000, pagos: [{ monto: 300 }, { monto: 200 }] };
    expect(calcSaldoPendiente(p)).toBe(500);
  });

  it('falls back to anticipo when pagos empty', () => {
    const p = { total: 1000, anticipo: 400, pagos: [] };
    expect(calcSaldoPendiente(p)).toBe(600);
  });

  it('uses anticipo when pagos is missing', () => {
    const p = { total: 500, anticipo: 500 };
    expect(calcSaldoPendiente(p)).toBe(0);
  });

  it('never returns negative', () => {
    const p = { total: 100, pagos: [{ monto: 200 }] };
    expect(calcSaldoPendiente(p)).toBe(0);
  });

  it('handles string numbers', () => {
    const p = { total: '1500', pagos: [{ monto: '500' }] };
    expect(calcSaldoPendiente(p)).toBe(1000);
  });

  it('handles null/undefined gracefully', () => {
    expect(calcSaldoPendiente({})).toBe(0);
    expect(calcSaldoPendiente({ total: null })).toBe(0);
  });

  it('prefers pagos sum over anticipo when pagos exist', () => {
    const p = { total: 1000, anticipo: 999, pagos: [{ monto: 100 }] };
    expect(calcSaldoPendiente(p)).toBe(900);
  });

  it('handles multiple small payments', () => {
    const p = { total: 100, pagos: Array.from({ length: 10 }, () => ({ monto: 10 })) };
    expect(calcSaldoPendiente(p)).toBe(0);
  });
});

// ── getStockEfectivo (source: inventory-1.ts) ──────────────────────────────────
// Extracted with injected product lookup
function getStockEfectivo(product: any, allProducts: any[] = []): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum: number, v: any) => sum + (parseInt(v.qty) || 0), 0);
  }
  if (product.mpComponentes && product.mpComponentes.length > 0) {
    const allServices = product.mpComponentes.every((c: any) => {
      const mp = allProducts.find(x => String(x.id) === String(c.id));
      return mp && mp.tipo === 'servicio';
    });
    if (allServices) return parseInt(product.stock) || 0;

    let minPiezas = Infinity;
    product.mpComponentes.forEach((c: any) => {
      const mp = allProducts.find(x => String(x.id) === String(c.id));
      if (mp && mp.tipo !== 'servicio') {
        const stockMp = mp.stock || 0;
        const qty = parseFloat(c.qty) || 1;
        const pzas = Math.floor(stockMp / qty);
        if (pzas < minPiezas) minPiezas = pzas;
      }
    });

    const stockManual = parseInt(product.stock) || 0;
    const stockFabricable = minPiezas === Infinity ? 0 : minPiezas;
    return stockManual + stockFabricable;
  }
  return parseInt(product.stock) || 0;
}

describe('getStockEfectivo', () => {
  it('returns stock from variants sum', () => {
    const p = { stock: 99, variants: [{ qty: 5 }, { qty: 3 }, { qty: 2 }] };
    expect(getStockEfectivo(p)).toBe(10);
  });

  it('returns raw stock for simple product', () => {
    expect(getStockEfectivo({ stock: 42 })).toBe(42);
  });

  it('handles string stock', () => {
    expect(getStockEfectivo({ stock: '15' })).toBe(15);
  });

  it('returns 0 for missing stock', () => {
    expect(getStockEfectivo({})).toBe(0);
  });

  it('calculates fabricable stock from MP components', () => {
    const mp1 = { id: 'mp1', tipo: 'materia_prima', stock: 20 };
    const mp2 = { id: 'mp2', tipo: 'materia_prima', stock: 9 };
    const product = {
      stock: 2,
      mpComponentes: [
        { id: 'mp1', qty: 2 },
        { id: 'mp2', qty: 3 },
      ],
    };
    // mp1: floor(20/2) = 10, mp2: floor(9/3) = 3 → min = 3
    // stockManual(2) + fabricable(3) = 5
    expect(getStockEfectivo(product, [mp1, mp2])).toBe(5);
  });

  it('ignores service components', () => {
    const svc = { id: 's1', tipo: 'servicio', stock: 0 };
    const mp = { id: 'mp1', tipo: 'materia_prima', stock: 10 };
    const product = {
      stock: 1,
      mpComponentes: [
        { id: 's1', qty: 1 },
        { id: 'mp1', qty: 5 },
      ],
    };
    // svc ignored, mp1: floor(10/5) = 2, stock(1) + 2 = 3
    expect(getStockEfectivo(product, [svc, mp])).toBe(3);
  });

  it('returns manual stock if all components are services', () => {
    const svc1 = { id: 's1', tipo: 'servicio' };
    const svc2 = { id: 's2', tipo: 'servicio' };
    const product = {
      stock: 7,
      mpComponentes: [{ id: 's1', qty: 1 }, { id: 's2', qty: 1 }],
    };
    expect(getStockEfectivo(product, [svc1, svc2])).toBe(7);
  });

  it('handles zero stock MP → fabricable = 0', () => {
    const mp = { id: 'mp1', tipo: 'materia_prima', stock: 0 };
    const product = { stock: 0, mpComponentes: [{ id: 'mp1', qty: 1 }] };
    expect(getStockEfectivo(product, [mp])).toBe(0);
  });
});

// ── Margin calculation (inline in inventory-5 renderFilaPT) ────────────────────
function calcMarginPct(cost: number, price: number): number {
  if (!cost || !price || price === 0) return 0;
  return (price - cost) / price * 100;
}

describe('calcMarginPct', () => {
  it('calculates correct margin', () => {
    expect(calcMarginPct(60, 100)).toBe(40);
  });

  it('returns 0 when no cost', () => {
    expect(calcMarginPct(0, 100)).toBe(0);
  });

  it('returns 0 when no price', () => {
    expect(calcMarginPct(50, 0)).toBe(0);
  });

  it('handles negative margin', () => {
    expect(calcMarginPct(120, 100)).toBe(-20);
  });

  it('handles 100% margin', () => {
    expect(calcMarginPct(0.01, 100)).toBeCloseTo(99.99, 1);
  });
});

// ── _descontarEmpaquesInventario rollback logic ────────────────────────────────
function descontarEmpaquesInventario(pedido: any, products: any[]): { descontados: number; products: any[]; saveFailed: boolean } {
  const empaques = pedido.empaques || [];
  if (!empaques.length) return { descontados: 0, products, saveFailed: false };
  let descontados = 0;
  const stockOriginal: { mp: any; antes: number; variantsBefore: any[] | null }[] = [];

  const esEmpaque = (mp: any) => mp && mp.tipo === 'materia_prima';

  for (const emp of empaques) {
    const mp = products.find(p => String(p.id) === String(emp.id));
    if (!esEmpaque(mp)) continue;
    const qty = emp.quantity || 1;
    const antes = mp.stock || 0;
    const variantsBefore = Array.isArray(mp.variants) && mp.variants.length > 0
      ? mp.variants.map((v: any) => ({ ...v }))
      : null;
    stockOriginal.push({ mp, antes, variantsBefore });
    mp.stock = Math.max(0, antes - qty);
    descontados++;
  }

  return { descontados, products, saveFailed: false };
}

function rollbackStock(products: any[], stockOriginal: { mp: any; antes: number; variantsBefore: any[] | null }[]) {
  stockOriginal.forEach(({ mp, antes, variantsBefore }) => {
    mp.stock = antes;
    if (variantsBefore && Array.isArray(mp.variants)) {
      variantsBefore.forEach((snap: any, i: number) => { if (mp.variants[i]) mp.variants[i].qty = snap.qty; });
    }
  });
}

describe('descontarEmpaquesInventario', () => {
  it('discounts empaque stock correctly', () => {
    const products = [
      { id: '1', tipo: 'materia_prima', stock: 10 },
      { id: '2', tipo: 'materia_prima', stock: 5 },
    ];
    const pedido = {
      folio: 'MK-001',
      empaques: [{ id: '1', quantity: 3 }, { id: '2', quantity: 2 }],
    };
    const result = descontarEmpaquesInventario(pedido, products);
    expect(result.descontados).toBe(2);
    expect(products[0].stock).toBe(7);
    expect(products[1].stock).toBe(3);
  });

  it('never goes below 0', () => {
    const products = [{ id: '1', tipo: 'materia_prima', stock: 2 }];
    const pedido = { empaques: [{ id: '1', quantity: 10 }] };
    descontarEmpaquesInventario(pedido, products);
    expect(products[0].stock).toBe(0);
  });

  it('returns 0 when no empaques', () => {
    const result = descontarEmpaquesInventario({ empaques: [] }, []);
    expect(result.descontados).toBe(0);
  });

  it('ignores non-materia_prima products', () => {
    const products = [{ id: '1', tipo: 'servicio', stock: 10 }];
    const pedido = { empaques: [{ id: '1', quantity: 5 }] };
    const result = descontarEmpaquesInventario(pedido, products);
    expect(result.descontados).toBe(0);
    expect(products[0].stock).toBe(10);
  });
});

describe('rollbackStock', () => {
  it('restores stock after failed save', () => {
    const mp1 = { id: '1', stock: 7 };
    const mp2 = { id: '2', stock: 3 };
    const original = [
      { mp: mp1, antes: 10, variantsBefore: null },
      { mp: mp2, antes: 5, variantsBefore: null },
    ];
    rollbackStock([mp1, mp2], original);
    expect(mp1.stock).toBe(10);
    expect(mp2.stock).toBe(5);
  });

  it('restores variant quantities', () => {
    const mp = { id: '1', stock: 0, variants: [{ qty: 3 }, { qty: 1 }] };
    const original = [
      { mp, antes: 10, variantsBefore: [{ qty: 5 }, { qty: 5 }] },
    ];
    rollbackStock([mp], original);
    expect(mp.stock).toBe(10);
    expect(mp.variants[0].qty).toBe(5);
    expect(mp.variants[1].qty).toBe(5);
  });
});

// ── calcularDisponibilidadDesdeMP (source: inventory-4.ts) ─────────────────────
function calcularDisponibilidadDesdeMP(product: any, allProducts: any[]): { piezas: number; detalle: any[] } | null {
  if (!product.mpComponentes || product.mpComponentes.length === 0) return null;
  const findProd = (id: string) => allProducts.find(x => String(x.id) === String(id));
  const tieneMpFisica = product.mpComponentes.some((c: any) => {
    const p = findProd(c.id);
    return !p || p.tipo !== 'servicio';
  });
  if (!tieneMpFisica) return null;
  let minPiezas = Infinity;
  const detalle: any[] = [];
  for (const comp of product.mpComponentes) {
    const mp = findProd(comp.id);
    if (mp && mp.tipo === 'servicio') continue;
    if (!mp) continue;
    const stockMp = parseInt(mp.stock) || 0;
    const qtyNecesaria = comp.qty || 1;
    const piezasPosibles = Math.floor(stockMp / qtyNecesaria);
    detalle.push({ nombre: comp.nombre || mp.name, stock: stockMp, qty: qtyNecesaria, posibles: piezasPosibles });
    if (piezasPosibles < minPiezas) minPiezas = piezasPosibles;
  }
  return { piezas: minPiezas === Infinity ? 0 : minPiezas, detalle };
}

describe('calcularDisponibilidadDesdeMP', () => {
  it('returns null for products without MP', () => {
    expect(calcularDisponibilidadDesdeMP({ name: 'test' }, [])).toBeNull();
  });

  it('returns null when all components are services', () => {
    const svc = { id: 's1', tipo: 'servicio' };
    const product = { mpComponentes: [{ id: 's1', qty: 1 }] };
    expect(calcularDisponibilidadDesdeMP(product, [svc])).toBeNull();
  });

  it('calculates min fabricable pieces', () => {
    const mp1 = { id: 'm1', tipo: 'materia_prima', stock: 20, name: 'Vinil' };
    const mp2 = { id: 'm2', tipo: 'materia_prima', stock: 6, name: 'Tinta' };
    const product = {
      mpComponentes: [
        { id: 'm1', qty: 2, nombre: 'Vinil' },
        { id: 'm2', qty: 3, nombre: 'Tinta' },
      ],
    };
    const result = calcularDisponibilidadDesdeMP(product, [mp1, mp2])!;
    expect(result.piezas).toBe(2); // mp1: 20/2=10, mp2: 6/3=2 → min=2
    expect(result.detalle).toHaveLength(2);
  });

  it('handles zero stock component', () => {
    const mp = { id: 'm1', tipo: 'materia_prima', stock: 0, name: 'X' };
    const product = { mpComponentes: [{ id: 'm1', qty: 1 }] };
    const result = calcularDisponibilidadDesdeMP(product, [mp])!;
    expect(result.piezas).toBe(0);
  });
});

// ── renderBalance totals (source: balance.ts renderBalance) ────────────────────
// ESPEJO de la lógica real de balance.ts. Si tocas las fórmulas allá, ACTUALIZA aquí.
// Las reglas (y por qué existen):
//  · totalIncomeManual = incomes SIN fromPOS y SIN folioOrigen.
//      fromPOS:true ya se cuenta en totalPOS (ventas directas) — excluir evita doble conteo.
//      folioOrigen (abono/anticipo) ya está dentro de p.total del pedido — excluir evita doble conteo.
//  · totalPedidosFin = suma de p.total de pedidos finalizados. SIN filtrar por incomes (fix C3).
//  · totalPOS = salesHistory que NO es pedido/abono/anticipo y NO está Cancelado.
//  · totalExpenses = expenses SIN fromPayable (ya contado al pagar el payable).
function calcBalanceTotals(state: any) {
  const incomes = state.incomes || [];
  const pedidosFinalizados = state.pedidosFinalizados || [];
  const salesHistory = state.salesHistory || [];
  const expenses = state.expenses || [];

  const totalIncomeManual = incomes
    .filter((i: any) => !i.fromPOS && !i.folioOrigen)
    .reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);

  const totalPedidosFin = pedidosFinalizados
    .reduce((s: number, p: any) => s + Number(p.total || 0), 0);

  const totalPOS = salesHistory
    .filter((s: any) => s.type !== 'pedido' && s.type !== 'abono' && s.type !== 'anticipo' && s.method !== 'Cancelado')
    .reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);

  const totalIncome = totalIncomeManual + totalPedidosFin + totalPOS;

  const totalExpenses = expenses
    .filter((e: any) => !e.fromPayable)
    .reduce((s: number, e: any) => s + (Number(e.amount ?? e.monto) || 0), 0);

  return { totalIncomeManual, totalPedidosFin, totalPOS, totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
}

describe('calcBalanceTotals', () => {
  it('empty state → todo en 0', () => {
    const t = calcBalanceTotals({});
    expect(t.totalIncome).toBe(0);
    expect(t.totalExpenses).toBe(0);
    expect(t.balance).toBe(0);
  });

  it('income manual se suma; fromPOS y folioOrigen se excluyen', () => {
    const t = calcBalanceTotals({
      incomes: [
        { amount: 500 },                          // manual → cuenta
        { amount: 300, fromPOS: true },           // ya en POS → no
        { amount: 200, folioOrigen: 'PE-001' },   // abono de pedido → no
      ],
    });
    expect(t.totalIncomeManual).toBe(500);
  });

  it('pedido finalizado cuenta su total una sola vez', () => {
    const t = calcBalanceTotals({
      pedidosFinalizados: [{ folio: 'PE-001', total: 1000 }, { folio: 'PE-002', total: 250 }],
    });
    expect(t.totalPedidosFin).toBe(1250);
    expect(t.totalIncome).toBe(1250);
  });

  // ── REGRESIÓN C3 — el bug que hacía desaparecer ingresos ──────────────────────
  // Antes: si un pedido finalizado tenía un income con folioOrigen (abono/anticipo),
  // el filtro foliosEnIncomes lo excluía de totalPedidosFin, Y el income se excluía
  // de totalIncomeManual por tener folioOrigen → el ingreso desaparecía de AMBOS.
  it('C3: pedido finalizado CON abono registrado como income no desaparece ni se duplica', () => {
    const t = calcBalanceTotals({
      pedidosFinalizados: [{ folio: 'PE-077', total: 1500 }],
      incomes: [
        { amount: 600, folioOrigen: 'PE-077', concept: 'Abono pedido PE-077' }, // anticipo
      ],
    });
    // El pedido aporta su total completo (1500) exactamente una vez.
    expect(t.totalPedidosFin).toBe(1500);
    // El abono NO se cuenta aparte (ya está dentro del 1500).
    expect(t.totalIncomeManual).toBe(0);
    // Ingreso total = 1500, ni perdido ni duplicado.
    expect(t.totalIncome).toBe(1500);
  });

  it('C3 múltiples abonos sobre el mismo pedido siguen sin afectar el total', () => {
    const t = calcBalanceTotals({
      pedidosFinalizados: [{ folio: 'PE-077', total: 1500 }],
      incomes: [
        { amount: 500, folioOrigen: 'PE-077' },
        { amount: 400, folioOrigen: 'PE-077' },
        { amount: 600, folioOrigen: 'PE-077' },
      ],
    });
    expect(t.totalIncome).toBe(1500);
  });

  it('ventas POS: excluye Cancelado y tipos pedido/abono/anticipo', () => {
    const t = calcBalanceTotals({
      salesHistory: [
        { total: 100 },                       // venta directa → cuenta
        { total: 50, method: 'Cancelado' },   // cancelada → no
        { total: 999, type: 'pedido' },       // es pedido → no (ya en pedidosFinalizados)
        { total: 80, type: 'abono' },         // abono → no
        { total: 70, type: 'anticipo' },      // anticipo → no
      ],
    });
    expect(t.totalPOS).toBe(100);
  });

  it('gastos: excluye los originados por un payable pagado (fromPayable)', () => {
    const t = calcBalanceTotals({
      expenses: [
        { amount: 300 },                    // gasto normal
        { monto: 150 },                     // campo legacy "monto"
        { amount: 999, fromPayable: true }, // ya contado al pagar el payable → no
      ],
    });
    expect(t.totalExpenses).toBe(450);
  });

  it('balance combina todas las fuentes correctamente', () => {
    const t = calcBalanceTotals({
      incomes: [{ amount: 1000 }, { amount: 500, fromPOS: true }],
      pedidosFinalizados: [{ folio: 'PE-1', total: 2000 }],
      salesHistory: [{ total: 800 }, { total: 100, method: 'Cancelado' }],
      expenses: [{ amount: 700 }, { amount: 300, fromPayable: true }],
    });
    // ingresos = 1000 (manual) + 2000 (pedido) + 800 (POS) = 3800
    // gastos   = 700
    expect(t.totalIncome).toBe(3800);
    expect(t.totalExpenses).toBe(700);
    expect(t.balance).toBe(3100);
  });

  it('maneja números como string', () => {
    const t = calcBalanceTotals({
      pedidosFinalizados: [{ total: '1500' }],
      incomes: [{ amount: '250' }],
      expenses: [{ amount: '100' }],
    });
    expect(t.totalIncome).toBe(1750);
    expect(t.totalExpenses).toBe(100);
    expect(t.balance).toBe(1650);
  });
});
