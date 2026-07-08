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
function calcularPiezasFabricables(product: any, allProducts: any[] = []): number {
  if (!Array.isArray(product?.mpComponentes) || product.mpComponentes.length === 0) return 0;
  let minPiezas = Infinity;
  let tieneMpFisica = false;

  for (const comp of product.mpComponentes) {
    const mp = allProducts.find(x => String(x.id) === String(comp.id));
    if (!mp) return 0;
    if (mp.tipo === 'servicio') continue;

    tieneMpFisica = true;
    const stockMp = Array.isArray(mp.variants) && mp.variants.length > 0
      ? mp.variants.reduce((sum: number, v: any) => sum + (parseFloat(v.qty) || 0), 0)
      : parseFloat(mp.stock) || 0;
    const qty = parseFloat(comp.qty) || 1;
    const rendimiento = parseFloat(comp.rendimientoPorHoja) || parseFloat(product.rendimientoPorHoja) || 1;
    const piezas = Math.floor(stockMp / qty) * rendimiento;
    if (piezas < minPiezas) minPiezas = piezas;
  }

  if (!tieneMpFisica) return 0;
  return minPiezas === Infinity ? 0 : Math.floor(minPiezas);
}

function getStockEfectivo(product: any, allProducts: any[] = []): number {
  const stockVariantes = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum: number, v: any) => sum + (parseInt(v.qty) || 0), 0)
    : null;
  if (product.mpComponentes && product.mpComponentes.length > 0) {
    const allServices = product.mpComponentes.every((c: any) => {
      const mp = allProducts.find(x => String(x.id) === String(c.id));
      return mp && mp.tipo === 'servicio';
    });
    if (allServices) return stockVariantes ?? (parseInt(product.stock) || 0);

    const stockManual = stockVariantes ?? (parseInt(product.stock) || 0);
    return stockManual + calcularPiezasFabricables(product, allProducts);
  }
  if (stockVariantes !== null) return stockVariantes;
  return parseInt(product.stock) || 0;
}

describe('calcularPiezasFabricables', () => {
  it('returns 0 when a physical component was deleted', () => {
    const product = { mpComponentes: [{ id: 'missing', qty: 1 }] };
    expect(calcularPiezasFabricables(product, [])).toBe(0);
  });

  it('uses rendimientoPorHoja as the inverse of MP discount', () => {
    const mp = { id: 'hoja', tipo: 'materia_prima', stock: 3 };
    const product = { rendimientoPorHoja: 12, mpComponentes: [{ id: 'hoja', qty: 1 }] };
    expect(calcularPiezasFabricables(product, [mp])).toBe(36);
  });

  it('ignores service components and uses the limiting physical component', () => {
    const svc = { id: 'svc', tipo: 'servicio', stock: 0 };
    const mp1 = { id: 'mp1', tipo: 'materia_prima', stock: 20 };
    const mp2 = { id: 'mp2', tipo: 'materia_prima', stock: 9 };
    const product = {
      mpComponentes: [
        { id: 'svc', qty: 1 },
        { id: 'mp1', qty: 2 },
        { id: 'mp2', qty: 3 },
      ],
    };
    expect(calcularPiezasFabricables(product, [svc, mp1, mp2])).toBe(3);
  });

  it('returns 0 when all components are services', () => {
    const svc = { id: 'svc', tipo: 'servicio' };
    const product = { mpComponentes: [{ id: 'svc', qty: 1 }] };
    expect(calcularPiezasFabricables(product, [svc])).toBe(0);
  });
});

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

  it('adds variant stock plus MP fabricable stock', () => {
    const mp = { id: 'mp1', tipo: 'materia_prima', stock: 4 };
    const product = {
      stock: 999,
      variants: [{ qty: 2 }, { qty: 3 }],
      mpComponentes: [{ id: 'mp1', qty: 2 }],
    };
    expect(getStockEfectivo(product, [mp])).toBe(7);
  });
});

// ── Margin calculation (inline in inventory-5 renderFilaPT) ────────────────────
function stockFabricadoAntesParaPedido(prod: any, item: any): number {
  let selected: any = null;
  if (Array.isArray(prod.variants) && prod.variants.length > 0) {
    if (item.variante) {
      const varTxt = String(item.variante);
      const colIdx = varTxt.indexOf(':');
      const vType = colIdx !== -1 ? varTxt.slice(0, colIdx).trim() : varTxt;
      const vValue = colIdx !== -1 ? varTxt.slice(colIdx + 1).trim() : '';
      selected = prod.variants.find((v: any) =>
        (v.type || v.tipo || '') === vType && (v.value || v.valor || '') === vValue
      ) || null;
    } else {
      selected = prod.variants.slice().sort((a: any, b: any) => (parseInt(b.qty) || 0) - (parseInt(a.qty) || 0))[0] || null;
    }
  }
  return selected ? (parseInt(selected.qty) || 0) : (prod.stock || 0);
}

describe('descuento por variante específica', () => {
  it('fabrica MP cuando la variante pedida está agotada aunque otra variante tenga stock', () => {
    const prod = {
      stock: 100,
      variants: [
        { type: 'Talla', value: 'M', qty: 0 },
        { type: 'Talla', value: 'L', qty: 100 },
      ],
    };
    const item = { variante: 'Talla: M', quantity: 5 };
    const stockFabricadoAntes = stockFabricadoAntesParaPedido(prod, item);
    const cantidadAFabricar = Math.max(0, item.quantity - stockFabricadoAntes);
    expect(stockFabricadoAntes).toBe(0);
    expect(cantidadAFabricar).toBe(5);
  });
});

describe('movimiento de stock truncado', () => {
  it('records the real delta and keeps requested quantity separately', () => {
    const stockAntes = 3;
    const cantidadSolicitada = -5;
    const stockDespues = Math.max(0, stockAntes + cantidadSolicitada);
    const cantidad = stockDespues - stockAntes;
    expect(cantidad).toBe(-3);
    expect(stockAntes + cantidad).toBe(stockDespues);
    expect(cantidadSolicitada).toBe(-5);
  });
});

function shouldDiscardRealtime(localReg: any, incoming: any, deviceId: string): boolean {
  const ownPayload = incoming._updatedBy && incoming._updatedBy === deviceId;
  const ownExactEcho = localReg && localReg._updatedBy === deviceId &&
    localReg._updatedAt && incoming._updatedAt &&
    incoming._updatedAt === localReg._updatedAt;
  return !!(ownPayload || ownExactEcho);
}

describe('anti-eco por deviceId', () => {
  it('discards own echo', () => {
    const local = { id: '1', _updatedAt: '2026-01-01T10:00:00.000Z', _updatedBy: 'dev-a' };
    const incoming = { id: '1', _updatedAt: '2026-01-01T10:00:00.000Z' };
    expect(shouldDiscardRealtime(local, incoming, 'dev-a')).toBe(true);
  });

  it('applies remote writes even if their timestamp is older', () => {
    const local = { id: '1', _updatedAt: '2026-01-01T10:00:00.000Z', _updatedBy: 'dev-a' };
    const incoming = { id: '1', _updatedAt: '2026-01-01T09:00:00.000Z', _updatedBy: 'dev-b' };
    expect(shouldDiscardRealtime(local, incoming, 'dev-a')).toBe(false);
  });
});

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
  product._tieneComponentesHuerfanos = false;
  if (!tieneMpFisica) return null;
  const detalle: any[] = [];
  for (const comp of product.mpComponentes) {
    const mp = findProd(comp.id);
    if (mp && mp.tipo === 'servicio') continue;
    if (!mp) {
      product._tieneComponentesHuerfanos = true;
      detalle.push({ nombre: comp.nombre || '?', stock: 0, qty: comp.qty || 1, posibles: 0 });
      return { piezas: 0, detalle };
    }
    const stockMp = Array.isArray(mp.variants) && mp.variants.length > 0
      ? mp.variants.reduce((s: number, v: any) => s + (parseFloat(v.qty) || 0), 0)
      : parseFloat(mp.stock) || 0;
    const qtyNecesaria = comp.qty || 1;
    const rendimiento = parseFloat(comp.rendimientoPorHoja) || parseFloat(product.rendimientoPorHoja) || 1;
    const piezasPosibles = Math.floor(stockMp / qtyNecesaria) * rendimiento;
    detalle.push({ nombre: comp.nombre || mp.name, stock: stockMp, qty: qtyNecesaria, posibles: piezasPosibles });
  }
  return { piezas: calcularPiezasFabricables(product, allProducts), detalle };
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

// ── normalizarResta (source: pedidos-1-views.ts) ───────────────────────────────
// ESPEJO de la lógica por-pedido. p.pagos[] es la FUENTE DE VERDAD; p.anticipo y
// p.resta SIEMPRE se recalculan (nunca se confían los valores guardados en Supabase,
// que pueden venir inconsistentes de versiones viejas). Esto es lo que el cliente debe.
function normalizarRestaPedido(p: any): { anticipo: number; resta: number } {
  const totalPagado = (p.pagos || []).reduce((s: number, ab: any) => s + Number(ab.monto || 0), 0);
  if (totalPagado > 0) {
    p.anticipo = totalPagado;
    p.resta = Math.max(0, Number(p.total || 0) - totalPagado);
  } else {
    p.anticipo = Number(p.anticipo || 0);
    p.resta = Math.max(0, Number(p.total || 0) - p.anticipo);
  }
  return { anticipo: p.anticipo, resta: p.resta };
}

describe('normalizarResta', () => {
  it('suma de pagos es la fuente de verdad del anticipo', () => {
    const p = { total: 1000, anticipo: 999, pagos: [{ monto: 300 }, { monto: 200 }] };
    const r = normalizarRestaPedido(p);
    expect(r.anticipo).toBe(500);   // ignora el 999 guardado
    expect(r.resta).toBe(500);
  });

  it('sin pagos → usa el anticipo legacy guardado', () => {
    const p = { total: 1000, anticipo: 400, pagos: [] };
    const r = normalizarRestaPedido(p);
    expect(r.anticipo).toBe(400);
    expect(r.resta).toBe(600);
  });

  it('sin pagos ni anticipo → resta = total completo', () => {
    const r = normalizarRestaPedido({ total: 800 });
    expect(r.anticipo).toBe(0);
    expect(r.resta).toBe(800);
  });

  it('pagos que superan el total → resta nunca negativa', () => {
    const p = { total: 500, pagos: [{ monto: 300 }, { monto: 400 }] };
    const r = normalizarRestaPedido(p);
    expect(r.anticipo).toBe(700);
    expect(r.resta).toBe(0);
  });

  it('pedido totalmente pagado → resta 0', () => {
    const p = { total: 1000, pagos: [{ monto: 1000 }] };
    expect(normalizarRestaPedido(p).resta).toBe(0);
  });

  it('refleja ediciones en pagos existentes (no acumula)', () => {
    const p: any = { total: 1000, pagos: [{ monto: 300 }] };
    normalizarRestaPedido(p);
    expect(p.resta).toBe(700);
    // El usuario edita el abono de 300 a 250 — al renormalizar NO debe acumular.
    p.pagos[0].monto = 250;
    normalizarRestaPedido(p);
    expect(p.anticipo).toBe(250);
    expect(p.resta).toBe(750);
  });

  it('maneja montos como string', () => {
    const p = { total: '1500', pagos: [{ monto: '500' }] };
    const r = normalizarRestaPedido(p);
    expect(r.anticipo).toBe(500);
    expect(r.resta).toBe(1000);
  });
});

// ── descontarVariantePT (source: pedidos-2.ts _descontarInventarioPedido) ───────
// ESPEJO del parseo de variante + decremento. La variante llega como "Tipo: Valor"
// (ej "Color: Rojo"); FIX-3 la separa y descuenta de la variante correcta. Sin
// variante, descuenta de la de mayor stock. prod.stock se recalcula desde las variantes.
function descontarVariantePT(prod: any, item: any): void {
  const cantidad = item.quantity || item.cantidad || 1;
  if (item.variante) {
    const _colIdx = item.variante.indexOf(':');
    const _vType = _colIdx !== -1 ? item.variante.slice(0, _colIdx).trim() : item.variante;
    const _vValue = _colIdx !== -1 ? item.variante.slice(_colIdx + 1).trim() : '';
    const _ptVar = prod.variants.find((v: any) =>
      (v.type || v.tipo || '') === _vType && (v.value || v.valor || '') === _vValue
    );
    if (_ptVar) { _ptVar.qty = Math.max(0, (_ptVar.qty || 0) - cantidad); }
  } else {
    const _varMayor = prod.variants.slice().sort((a: any, b: any) => (parseInt(b.qty) || 0) - (parseInt(a.qty) || 0))[0];
    if (_varMayor) { _varMayor.qty = Math.max(0, (parseInt(_varMayor.qty) || 0) - cantidad); }
  }
  prod.stock = prod.variants.reduce((s: number, v: any) => s + (parseInt(v.qty) || 0), 0);
}

describe('descontarVariantePT', () => {
  it('descuenta de la variante exacta por "Tipo: Valor"', () => {
    const prod = { stock: 8, variants: [
      { type: 'Color', value: 'Rojo', qty: 5 },
      { type: 'Color', value: 'Azul', qty: 3 },
    ]};
    descontarVariantePT(prod, { variante: 'Color: Rojo', quantity: 2 });
    expect(prod.variants[0].qty).toBe(3);
    expect(prod.variants[1].qty).toBe(3);
    expect(prod.stock).toBe(6); // se recalcula desde variantes
  });

  it('soporta esquema en español {tipo, valor}', () => {
    const prod = { stock: 4, variants: [{ tipo: 'Talla', valor: 'M', qty: 4 }] };
    descontarVariantePT(prod, { variante: 'Talla: M', cantidad: 1 });
    expect(prod.variants[0].qty).toBe(3);
    expect(prod.stock).toBe(3);
  });

  it('sin variante → descuenta de la de mayor stock', () => {
    const prod = { stock: 13, variants: [
      { type: 'Color', value: 'Rojo', qty: 2 },
      { type: 'Color', value: 'Azul', qty: 9 },
      { type: 'Color', value: 'Verde', qty: 2 },
    ]};
    descontarVariantePT(prod, { quantity: 4 });
    expect(prod.variants[1].qty).toBe(5); // la de 9 (mayor) baja a 5
    expect(prod.variants[0].qty).toBe(2);
    expect(prod.stock).toBe(9);
  });

  it('variante sin match no toca nada pero recalcula stock', () => {
    const prod = { stock: 99, variants: [{ type: 'Color', value: 'Rojo', qty: 5 }] };
    descontarVariantePT(prod, { variante: 'Color: Negro', quantity: 2 });
    expect(prod.variants[0].qty).toBe(5);       // sin cambios
    expect(prod.stock).toBe(5);                 // stock corregido desde variantes
  });

  it('nunca deja la variante en negativo', () => {
    const prod = { stock: 2, variants: [{ type: 'Color', value: 'Rojo', qty: 2 }] };
    descontarVariantePT(prod, { variante: 'Color: Rojo', quantity: 10 });
    expect(prod.variants[0].qty).toBe(0);
    expect(prod.stock).toBe(0);
  });

  it('variante sin ":" usa el string completo como tipo', () => {
    const prod = { stock: 3, variants: [{ type: 'Rojo', value: '', qty: 3 }] };
    descontarVariantePT(prod, { variante: 'Rojo', quantity: 1 });
    expect(prod.variants[0].qty).toBe(2);
  });

  it('cantidad por defecto = 1 cuando no se especifica', () => {
    const prod = { stock: 5, variants: [{ type: 'Color', value: 'Rojo', qty: 5 }] };
    descontarVariantePT(prod, { variante: 'Color: Rojo' });
    expect(prod.variants[0].qty).toBe(4);
  });
});

// ── reactivarPedido cleanup (source: pedidos-2.ts reactivarPedido, BUG C1 FIX) ─
// ESPEJO de las 4 operaciones de limpieza que ocurren al reactivar un pedido.
// Antes del fix C1: nada se limpiaba → si el pedido se volvía a finalizar,
// salesHistory y incomes acumulaban entradas duplicadas → doble conteo en reportes.
//
// Lógica extraída (sin efectos secundarios de DB ni toasts):
//   a) F2-S25: quitar de salesHistory los registros folio===p.folio con type 'pedido' O 'abono'
//   b) filtrar incomes quitando los de folioOrigen===p.folio o type==='cobro_entrega'
//   c) revertir totalPurchases del cliente
//   d) F1-S25: devolver el PLAN de borrados en BD (dbDeletes) que el flujo real debe emitir,
//      porque saveIncomes()/saveSalesHistory() son upsert-only y no borran filas.
function limpiarAlReactivar(p: any, state: { salesHistory: any[]; incomes: any[]; clients: any[] }) {
  // a) salesHistory — F2: 'pedido' y 'abono' (cobro al entregar) del mismo folio
  const shAEliminar = state.salesHistory.filter(s => s.folio === p.folio && (s.type === 'pedido' || s.type === 'abono'));
  const shIdsEliminados = shAEliminar.map(s => s.id);
  state.salesHistory = state.salesHistory.filter(s => !shIdsEliminados.includes(s.id));

  // b) incomes
  const incomesAntes = state.incomes.length;
  state.incomes = state.incomes.filter(inc =>
    inc.folioOrigen !== p.folio && !(inc.type === 'cobro_entrega' && inc.folio === p.folio)
  );
  const incomesEliminados = incomesAntes - state.incomes.length;

  // c) totalPurchases del cliente
  const cli = state.clients.find(c =>
    (p.clienteId && String(c.id) === String(p.clienteId)) ||
    (c.name || '').toLowerCase().trim() === (p.cliente || '').toLowerCase().trim()
  );
  if (cli && Number(p.total || 0) > 0) {
    cli.totalPurchases = Math.max(0, (Number(cli.totalPurchases) || 0) - Number(p.total || 0));
  }

  // d) F1: el flujo real DEBE borrar estas filas en Supabase (upsert no las quita)
  const dbDeletes = {
    salesHistoryIds: shIdsEliminados,
    incomesByFolio: incomesEliminados > 0 ? p.folio : null,
  };

  return { shIdsEliminados, incomesEliminados, clienteActualizado: !!cli, dbDeletes };
}

describe('reactivarPedido cleanup (C1)', () => {
  // REGRESIÓN C1: sin limpieza, finalizar dos veces duplica salesHistory e incomes.
  it('C1: salesHistory type:pedido se elimina al reactivar', () => {
    const state = {
      salesHistory: [
        { id: 'sh-1', folio: 'PE-010', type: 'pedido', total: 1000 },
        { id: 'sh-2', folio: 'PE-011', type: 'pedido', total: 500 },  // otro pedido
      ],
      incomes: [],
      clients: [],
    };
    limpiarAlReactivar({ folio: 'PE-010', total: 1000 }, state);
    expect(state.salesHistory).toHaveLength(1);
    expect(state.salesHistory[0].folio).toBe('PE-011');  // el otro queda intacto
  });

  it('F2-S25: salesHistory type:pedido Y type:abono se eliminan; anticipo permanece', () => {
    const state = {
      salesHistory: [
        { id: 'sh-1', folio: 'PE-010', type: 'pedido', total: 1000 },
        { id: 'sh-2', folio: 'PE-010', type: 'abono',  total: 300 },  // cobro al entregar → F2 lo quita
        { id: 'sh-3', folio: 'PE-010', type: 'anticipo', total: 200 }, // anticipo NO se toca
      ],
      incomes: [],
      clients: [],
    };
    const r = limpiarAlReactivar({ folio: 'PE-010', total: 1000 }, state);
    expect(state.salesHistory).toHaveLength(1);
    expect(state.salesHistory[0].type).toBe('anticipo');
    // F1: ambos ids (pedido + abono) deben programarse para borrado en BD
    expect(r.dbDeletes.salesHistoryIds.sort()).toEqual(['sh-1', 'sh-2']);
  });

  it('F1-S25: el plan dbDeletes incluye el folio cuando se quitaron incomes', () => {
    const state = {
      salesHistory: [{ id: 'sh-1', folio: 'PE-010', type: 'pedido' }],
      incomes: [{ id: 'i-1', amount: 600, folioOrigen: 'PE-010' }],
      clients: [],
    };
    const r = limpiarAlReactivar({ folio: 'PE-010', total: 1000 }, state);
    // Sin este DELETE en BD, el income reaparece al recargar y descuadra el balance (anula C1)
    expect(r.dbDeletes.incomesByFolio).toBe('PE-010');
    expect(r.dbDeletes.salesHistoryIds).toContain('sh-1');
  });

  it('F1-S25: sin incomes removidos, dbDeletes.incomesByFolio es null', () => {
    const state = {
      salesHistory: [],
      incomes: [{ id: 'i-9', amount: 100, folioOrigen: 'PE-999' }], // otro pedido
      clients: [],
    };
    const r = limpiarAlReactivar({ folio: 'PE-010', total: 1000 }, state);
    expect(r.dbDeletes.incomesByFolio).toBeNull();
    expect(state.incomes).toHaveLength(1);
  });

  it('C1: incomes con folioOrigen del pedido se eliminan', () => {
    const state = {
      salesHistory: [],
      incomes: [
        { id: 'i-1', amount: 600, folioOrigen: 'PE-010' },            // anticipo → fuera
        { id: 'i-2', amount: 400, folioOrigen: 'PE-010' },            // abono → fuera
        { id: 'i-3', amount: 200, folioOrigen: 'PE-999' },            // otro pedido → queda
        { id: 'i-4', amount: 150 },                                    // manual → queda
      ],
      clients: [],
    };
    const r = limpiarAlReactivar({ folio: 'PE-010', total: 1000 }, state);
    expect(state.incomes).toHaveLength(2);
    expect(r.incomesEliminados).toBe(2);
    expect(state.incomes.map(i => i.id)).toEqual(['i-3', 'i-4']);
  });

  it('C1: income type:cobro_entrega del mismo folio se elimina', () => {
    const state = {
      salesHistory: [],
      incomes: [
        { id: 'c-1', type: 'cobro_entrega', folio: 'PE-010', amount: 400 },
        { id: 'c-2', type: 'cobro_entrega', folio: 'PE-999', amount: 200 }, // otro → queda
      ],
      clients: [],
    };
    limpiarAlReactivar({ folio: 'PE-010', total: 1000 }, state);
    expect(state.incomes).toHaveLength(1);
    expect(state.incomes[0].folio).toBe('PE-999');
  });

  it('C1: totalPurchases del cliente se reduce en p.total', () => {
    const state = {
      salesHistory: [],
      incomes: [],
      clients: [{ id: '42', name: 'Ana López', totalPurchases: 5000 }],
    };
    limpiarAlReactivar({ folio: 'PE-010', total: 1000, clienteId: '42' }, state);
    expect(state.clients[0].totalPurchases).toBe(4000);
  });

  it('C1: totalPurchases nunca cae a negativo', () => {
    const state = {
      salesHistory: [],
      incomes: [],
      clients: [{ id: '1', name: 'Juan', totalPurchases: 200 }],
    };
    limpiarAlReactivar({ folio: 'PE-010', total: 9999, clienteId: '1' }, state);
    expect(state.clients[0].totalPurchases).toBe(0);
  });

  it('C1: cliente sin nombre match deja totalPurchases intacto', () => {
    const state = {
      salesHistory: [],
      incomes: [],
      clients: [{ id: '99', name: 'Otro', totalPurchases: 3000 }],
    };
    const r = limpiarAlReactivar({ folio: 'PE-010', total: 500, cliente: 'Nadie' }, state);
    expect(r.clienteActualizado).toBe(false);
    expect(state.clients[0].totalPurchases).toBe(3000);
  });

  it('C1: pedido sin salesHistory previo no rompe nada', () => {
    const state = { salesHistory: [], incomes: [], clients: [] };
    expect(() => limpiarAlReactivar({ folio: 'PE-NEW', total: 500 }, state)).not.toThrow();
  });
});
