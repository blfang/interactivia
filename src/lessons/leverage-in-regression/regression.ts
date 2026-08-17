// draw a standard normal random variable via the Box-Muller transform
export function gaussianNoise(std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * std;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// ordinary least squares fit of y = slope * x + intercept
export function fitSimpleLinearRegression(points: Point2D[]): { slope: number; intercept: number } {
  const n = points.length;
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;

  let covXY = 0;
  let varX = 0;
  for (const p of points) {
    covXY += (p.x - meanX) * (p.y - meanY);
    varX += (p.x - meanX) ** 2;
  }

  const slope = covXY / varX;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

// Gaussian elimination with partial pivoting, solves A * x = b
function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const A = matrix.map((row) => [...row]);
  const b = [...rhs];

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[pivotRow][col])) pivotRow = row;
    }
    [A[col], A[pivotRow]] = [A[pivotRow], A[col]];
    [b[col], b[pivotRow]] = [b[pivotRow], b[col]];

    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / A[col][col];
      for (let c = col; c < n; c++) A[row][c] -= factor * A[col][c];
      b[row] -= factor * b[col];
    }
  }

  const solution = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];
    for (let col = row + 1; col < n; col++) sum -= A[row][col] * solution[col];
    solution[row] = sum / A[row][row];
  }
  return solution;
}

// ordinary least squares fit of z = a * x + b * y + c, via the normal equations
export function fitPlaneRegression(points: Point3D[]): { a: number; b: number; c: number } {
  let sxx = 0, sxy = 0, sx = 0, syy = 0, sy = 0, sn = points.length;
  let sxz = 0, syz = 0, sz = 0;

  for (const p of points) {
    sxx += p.x * p.x;
    sxy += p.x * p.y;
    sx += p.x;
    syy += p.y * p.y;
    sy += p.y;
    sxz += p.x * p.z;
    syz += p.y * p.z;
    sz += p.z;
  }

  const matrix = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, sn],
  ];
  const rhs = [sxz, syz, sz];
  const [a, b, c] = solveLinearSystem(matrix, rhs);
  return { a, b, c };
}

export function generateCloud2D(
  n: number,
  xRange: [number, number],
  trueSlope: number,
  trueIntercept: number,
  noiseStd: number,
): Point2D[] {
  const [xMin, xMax] = xRange;
  return Array.from({ length: n }, () => {
    const x = xMin + Math.random() * (xMax - xMin);
    const y = trueSlope * x + trueIntercept + gaussianNoise(noiseStd);
    return { x, y };
  });
}

export function generateCloud3D(
  n: number,
  radius: number,
  trueA: number,
  trueB: number,
  trueC: number,
  noiseStd: number,
): Point3D[] {
  return Array.from({ length: n }, () => {
    const x = gaussianNoise(radius);
    const y = gaussianNoise(radius);
    const z = trueA * x + trueB * y + trueC + gaussianNoise(noiseStd);
    return { x, y, z };
  });
}

// like generateCloud3D, but the (x, y) cloud is stretched along the (1, 1)
// direction and squeezed along the (1, -1) direction
export function generateAnisotropicCloud3D(
  n: number,
  stdAlongDiagonal: number,
  stdAlongAntiDiagonal: number,
  trueA: number,
  trueB: number,
  trueC: number,
  noiseStd: number,
): Point3D[] {
  return Array.from({ length: n }, () => {
    const u = gaussianNoise(stdAlongDiagonal);
    const v = gaussianNoise(stdAlongAntiDiagonal);
    const x = (u + v) / Math.SQRT2;
    const y = (u - v) / Math.SQRT2;
    const z = trueA * x + trueB * y + trueC + gaussianNoise(noiseStd);
    return { x, y, z };
  });
}

// a point at distance r from the origin along the (1, 1) or (1, -1) direction
export function pointOnDiagonal(r: number, direction: 'diagonal' | 'antidiagonal'): { x: number; y: number } {
  const sign = direction === 'diagonal' ? 1 : -1;
  return { x: r / Math.SQRT2, y: (sign * r) / Math.SQRT2 };
}
