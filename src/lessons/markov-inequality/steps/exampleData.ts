export interface ExampleMeta {
  mean: number;
  threshold: number;
  n: number;
}

/** Static metadata for each example (index 0 = Example1, etc.) */
export const EXAMPLE_DATA: ExampleMeta[] = [
  { mean: 20, threshold: 50, n: 5 },   // Example 1
  { mean: 20, threshold: 90, n: 5 },   // Example 2
  { mean: 20, threshold: 100, n: 5 },  // Example 3
  { mean: 20, threshold: 50, n: 6 },   // Example 4
  { mean: 20, threshold: 70, n: 6 },   // Example 5
];

/** Markov bound: max people above threshold = floor(mean / threshold * n) */
export function optimalK(mean: number, threshold: number, n: number): number {
  return Math.floor((mean / threshold) * n);
}