import { describe, it, expect } from 'vitest';
import { simulateZ, isSignificant } from './simulation';

describe('simulation', () => {
  it('produces z-scores centered near 0 with sd near 1', () => {
    const n = 10000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const z = simulateZ();
      sum += z;
      sumSq += z * z;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    expect(mean).toBeGreaterThan(-0.1);
    expect(mean).toBeLessThan(0.1);
    expect(variance).toBeGreaterThan(0.9);
    expect(variance).toBeLessThan(1.1);
  });

  it('flags z-scores beyond ±1.96 as significant', () => {
    expect(isSignificant(2.0)).toBe(true);
    expect(isSignificant(-2.0)).toBe(true);
    expect(isSignificant(1.96)).toBe(false);
    expect(isSignificant(0)).toBe(false);
  });

  it('yields roughly 50 significant results out of 1000 runs', () => {
    const runs = 1000;
    let significant = 0;
    for (let i = 0; i < runs; i++) {
      if (isSignificant(simulateZ())) significant++;
    }
    // ~5% of 1000 = 50; allow a wide band to avoid flakiness
    expect(significant).toBeGreaterThan(40);
    expect(significant).toBeLessThan(60);
  });
});