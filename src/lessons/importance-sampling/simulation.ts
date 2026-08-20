// draw a standard normal random variable via the Box-Muller transform
export function sampleStandardNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function sampleNormal(mean: number, sd: number): number {
  return mean + sd * sampleStandardNormal();
}

export function sampleUniform(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

export function standardNormalPdf(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

export function normalPdf(x: number, mean: number, sd: number): number {
  return standardNormalPdf((x - mean) / sd) / sd;
}

export function uniformPdf(x: number, lo: number, hi: number): number {
  return x >= lo && x <= hi ? 1 / (hi - lo) : 0;
}

export function inInterval(x: number, lo: number, hi: number): boolean {
  return x >= lo && x <= hi;
}

// the importance weight for reweighting a sample drawn from the proposal
// distribution back to what it "should" count for under the target distribution
export function importanceWeight(
  x: number,
  targetPdf: (x: number) => number,
  proposalPdf: (x: number) => number
): number {
  return targetPdf(x) / proposalPdf(x);
}

// standard normal CDF via the Abramowitz-Stegun erf approximation (max error ~1.5e-7)
export function normalCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  const signedErf = x < 0 ? -erf : erf;
  return 0.5 * (1 + signedErf);
}

export function normalIntervalProbability(lo: number, hi: number): number {
  return normalCdf(hi) - normalCdf(lo);
}

export interface EstimatorState {
  n: number;
  weightedHitSum: number;
}

export const INITIAL_ESTIMATOR_STATE: EstimatorState = { n: 0, weightedHitSum: 0 };

// update the running Monte Carlo estimator with one new draw x from the sampling
// distribution; weightFn defaults to 1 (naive Monte Carlo, no reweighting)
export function updateEstimator(
  state: EstimatorState,
  x: number,
  interval: [number, number],
  weightFn?: (x: number) => number
): EstimatorState {
  const [lo, hi] = interval;
  const hit = inInterval(x, lo, hi) ? (weightFn ? weightFn(x) : 1) : 0;
  return { n: state.n + 1, weightedHitSum: state.weightedHitSum + hit };
}

export function estimate(state: EstimatorState): number {
  return state.n === 0 ? 0 : state.weightedHitSum / state.n;
}
