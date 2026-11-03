import { describe, expect, it } from 'vitest';
import { valueImpactOf } from './valueImpact';

describe('value impact', () => {
  it('is the new value less the PO value', () => {
    // $750 to $770 on 1,400 pieces, as in the session
    expect(valueImpactOf(750, 1400, 770, null)).toBe(28_000);
    expect(valueImpactOf(750, 1400, null, 1000)).toBe(-300_000);
    expect(valueImpactOf(750, 1400, 770, 1000)).toBe(770 * 1000 - 750 * 1400);
  });

  it('is empty without a change or without PO price and quantity', () => {
    expect(valueImpactOf(750, 1400, null, null)).toBeNull();
    expect(valueImpactOf(null, 1400, 770, null)).toBeNull();
    expect(valueImpactOf(750, null, 770, null)).toBeNull();
  });

  it('keeps four decimals', () => {
    expect(valueImpactOf(10.33333, 1, 10, null)).toBe(-0.3333);
  });
});
