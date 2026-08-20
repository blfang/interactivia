import { describe, it, expect } from 'vitest';
import {
  sampleStandardNormal,
  sampleUniform,
  standardNormalPdf,
  normalPdf,
  uniformPdf,
  importanceWeight,
  normalCdf,
  normalIntervalProbability,
  updateEstimator,
  estimate,
  INITIAL_ESTIMATOR_STATE,
} from './simulation';

describe('sampleStandardNormal', () => {
  it('produces draws centered near 0 with sd near 1', () => {
    const n = 10000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const x = sampleStandardNormal();
      sum += x;
      sumSq += x * x;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    expect(mean).toBeGreaterThan(-0.1);
    expect(mean).toBeLessThan(0.1);
    expect(variance).toBeGreaterThan(0.9);
    expect(variance).toBeLessThan(1.1);
  });
});

describe('sampleUniform', () => {
  it('stays within [lo, hi]', () => {
    for (let i = 0; i < 1000; i++) {
      const x = sampleUniform(3, 5);
      expect(x).toBeGreaterThanOrEqual(3);
      expect(x).toBeLessThanOrEqual(5);
    }
  });
});

describe('pdfs', () => {
  it('standardNormalPdf matches known values', () => {
    expect(standardNormalPdf(0)).toBeCloseTo(0.3989, 3);
    expect(standardNormalPdf(1)).toBeCloseTo(0.24197, 4);
  });

  it('normalPdf(x, mean, sd) matches a shifted/scaled standard normal', () => {
    expect(normalPdf(4, 4, 1)).toBeCloseTo(standardNormalPdf(0), 6);
    expect(normalPdf(5, 4, 1)).toBeCloseTo(standardNormalPdf(1), 6);
  });

  it('uniformPdf is flat inside [lo, hi] and zero outside', () => {
    expect(uniformPdf(4, 3, 5)).toBeCloseTo(0.5, 6);
    expect(uniformPdf(3, 3, 5)).toBeCloseTo(0.5, 6);
    expect(uniformPdf(5, 3, 5)).toBeCloseTo(0.5, 6);
    expect(uniformPdf(2.9, 3, 5)).toBe(0);
    expect(uniformPdf(5.1, 3, 5)).toBe(0);
  });
});

describe('importanceWeight', () => {
  it('equals target pdf over proposal pdf', () => {
    const target = (x: number) => standardNormalPdf(x);
    const proposal = (x: number) => uniformPdf(x, 3, 5);
    const w = importanceWeight(4, target, proposal);
    expect(w).toBeCloseTo(standardNormalPdf(4) / 0.5, 6);
  });
});

describe('normalCdf', () => {
  it('matches known standard normal CDF values', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 4);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
    expect(normalCdf(3)).toBeCloseTo(0.99865, 4);
    expect(normalCdf(5)).toBeCloseTo(0.9999997, 4);
  });
});

describe('normalIntervalProbability', () => {
  it('matches the known rare-tail probability for [3, 5]', () => {
    expect(normalIntervalProbability(3, 5)).toBeCloseTo(0.00135, 4);
  });

  it('matches the known common-event probability for [-2, 2]', () => {
    expect(normalIntervalProbability(-2, 2)).toBeCloseTo(0.9545, 3);
  });
});

describe('updateEstimator / estimate', () => {
  it('tracks naive Monte Carlo hit fraction with no weight function', () => {
    let state = INITIAL_ESTIMATOR_STATE;
    state = updateEstimator(state, 1, [-2, 2]); // hit
    state = updateEstimator(state, 3, [-2, 2]); // miss
    state = updateEstimator(state, 0, [-2, 2]); // hit
    expect(state.n).toBe(3);
    expect(estimate(state)).toBeCloseTo(2 / 3, 6);
  });

  it('applies the weight function only to samples that land in the interval', () => {
    let state = INITIAL_ESTIMATOR_STATE;
    const weightFn = () => 2;
    state = updateEstimator(state, 4, [3, 5], weightFn); // hit, weighted
    state = updateEstimator(state, 0, [3, 5], weightFn); // miss, contributes 0
    expect(state.n).toBe(2);
    expect(estimate(state)).toBeCloseTo(1, 6); // (2 + 0) / 2
  });

  it('estimate is 0 when no draws have been made', () => {
    expect(estimate(INITIAL_ESTIMATOR_STATE)).toBe(0);
  });
});
