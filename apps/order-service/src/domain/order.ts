export type NormalizedItem = { productId: string; qty: number };

export function normalizeItems(
  raw: unknown,
): { ok: true; items: NormalizedItem[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: 'items must be a non-empty array' };
  }

  const items: NormalizedItem[] = [];
  for (const it of raw as Array<{ productId?: unknown; qty?: unknown }>) {
    const productId = typeof it.productId === 'string' ? it.productId : '';
    const qty = typeof it.qty === 'number' ? it.qty : NaN;

    if (!productId) return { ok: false, error: 'productId is required' };
    if (!Number.isInteger(qty) || qty <= 0) {
      return { ok: false, error: 'qty must be a positive integer' };
    }

    items.push({ productId, qty });
  }

  return { ok: true, items };
}

export function calcTotal(pricedItems: Array<{ qty: number; priceSnapshot: number }>): number {
  return pricedItems.reduce((sum, it) => sum + it.priceSnapshot * it.qty, 0);
}
