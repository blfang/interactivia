const WIDTH = 120;
const HEIGHT = 80;
const MARGIN = 10;

// fixed points: a small cloud plus one high-leverage outlier pulling the line
const POINTS = [
  { x: 0.1, y: 0.15 }, { x: 0.9, y: 0.95 }, { x: 1.4, y: 1.5 }, { x: 2.0, y: 1.7 },
  { x: 2.3, y: 2.2 }, { x: 2.9, y: 2.6 }, { x: 3.3, y: 2.85 }, { x: 3.8, y: 3.6 },
];
const OUTLIER = { x: 6.0, y: 3.0 };

const X_MIN = 0;
const X_MAX = 7;
const Y_MIN = 0;
const Y_MAX = 4;

export default function Preview() {
  const w = WIDTH - 2 * MARGIN;
  const h = HEIGHT - 2 * MARGIN;
  const toSvgX = (x: number) => MARGIN + ((x - X_MIN) / (X_MAX - X_MIN)) * w;
  const toSvgY = (y: number) => MARGIN + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * h;

  const allPoints = [...POINTS, OUTLIER];
  const n = allPoints.length;
  const meanX = allPoints.reduce((s, p) => s + p.x, 0) / n;
  const meanY = allPoints.reduce((s, p) => s + p.y, 0) / n;
  let covXY = 0, varX = 0;
  for (const p of allPoints) {
    covXY += (p.x - meanX) * (p.y - meanY);
    varX += (p.x - meanX) ** 2;
  }
  const slope = covXY / varX;
  const intercept = meanY - slope * meanX;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
      <line
        x1={toSvgX(X_MIN)}
        y1={toSvgY(slope * X_MIN + intercept)}
        x2={toSvgX(X_MAX)}
        y2={toSvgY(slope * X_MAX + intercept)}
        stroke="#64748b"
        strokeWidth={2}
      />
      {POINTS.map((p, i) => (
        <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={2.5} fill="#2563eb" fillOpacity={0.8} />
      ))}
      <circle cx={toSvgX(OUTLIER.x)} cy={toSvgY(OUTLIER.y)} r={4} fill="#ea580c" />
    </svg>
  );
}
