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
