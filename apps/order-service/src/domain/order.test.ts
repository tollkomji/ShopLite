import { describe, it, expect } from 'vitest';
import { normalizeItems, calcTotal } from './order';

describe('normalizeItems', () => {
  it('rejects non-array', () => {
    expect(normalizeItems(null)).toEqual({ ok: false, error: 'items must be a non-empty array' });
  });

  it('rejects empty array', () => {
    expect(normalizeItems([])).toEqual({ ok: false, error: 'items must be a non-empty array' });
  });

  it('rejects missing productId', () => {
    expect(normalizeItems([{ qty: 1 }])).toEqual({ ok: false, error: 'productId is required' });
  });

  it('rejects invalid qty', () => {
    expect(normalizeItems([{ productId: 'x', qty: 0 }])).toEqual({
      ok: false,
      error: 'qty must be a positive integer',
    });
  });

  it('accepts valid items', () => {
    expect(normalizeItems([{ productId: 'p1', qty: 2 }])).toEqual({
      ok: true,
      items: [{ productId: 'p1', qty: 2 }],
    });
  });
});

describe('calcTotal', () => {
  it('calculates sum', () => {
    expect(
      calcTotal([
        { qty: 2, priceSnapshot: 10 },
        { qty: 1, priceSnapshot: 5 },
      ]),
    ).toBe(25);
  });
});
