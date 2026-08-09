// draw a standard normal random variable via the Box-Muller transform
export function simulateZ(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// a z-score is "significant" when it falls beyond the specified cutoff
export function isSignificant(z: number, cutoff: number = 1.96): boolean {
  return Math.abs(z) > cutoff;
}
