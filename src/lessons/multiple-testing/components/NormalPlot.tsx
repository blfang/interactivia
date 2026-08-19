import styles from './NormalPlot.module.css';
import { COLOR_DANGER } from '../../../styles/colors';

const MARGIN = { top: 9, right: 9, bottom: 9, left: 9 };
const BOX_INSET = 1.5; // gap between the svg edge and the significance box, so it stays clear of the plot content
const X_MIN = -4;
const X_MAX = 4;
const Y_MAX = 0.45;
const DEFAULT_CUTOFF = 1.96;
const TAIL_FILL = '#fecaca'; // light red (tail areas under the curve)
const SIGNIFICANT_STROKE = COLOR_DANGER; // red box border for significant plots

// sample the standard normal pdf f(x) = (1/sqrt(2*pi)) * exp(-x^2/2)
const pdf = (x: number) => Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);

// polygon for the area under the curve left of a given x
const tailPolygon = (
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number,
  cutoff: number,
  from: number
) => {
  const pts: string[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const x = from + ((cutoff - from) * i) / N;
    pts.push(`${toSvgX(x).toFixed(2)},${toSvgY(pdf(x)).toFixed(2)}`);
  }
  // close the polygon down to the x-axis
  pts.push(`${toSvgX(cutoff).toFixed(2)},${toSvgY(0).toFixed(2)}`);
  pts.push(`${toSvgX(from).toFixed(2)},${toSvgY(0).toFixed(2)}`);
  return pts.join(' ');
};

export default function NormalPlot({
  zScore = null,
  width = 120,
  height = 80,
  cutoff = DEFAULT_CUTOFF,
}: {
  zScore?: number | null;
  width?: number;
  height?: number;
  cutoff?: number;
}) {
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const toSvgX = (x: number) =>
    MARGIN.left + ((x - X_MIN) / (X_MAX - X_MIN)) * plotW;
  const toSvgY = (y: number) =>
    MARGIN.top + (1 - y / Y_MAX) * plotH;

  const curvePoints = (() => {
    const pts: string[] = [];
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / N;
      pts.push(`${toSvgX(x).toFixed(2)},${toSvgY(pdf(x)).toFixed(2)}`);
    }
    return pts.join(' ');
  })();

  const leftTail = tailPolygon(toSvgX, toSvgY, -cutoff, X_MIN);
  const rightTail = tailPolygon(toSvgX, toSvgY, cutoff, X_MAX);

  const significant = zScore !== null && Math.abs(zScore) > cutoff;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.plot}>
      {/* red box outline when the simulated value is significant;
          drawn around the svg edge, outside the plot content, so it never overlaps the curve or tails */}
      {significant && (
        <rect
          x={BOX_INSET}
          y={BOX_INSET}
          width={width - 2 * BOX_INSET}
          height={height - 2 * BOX_INSET}
          fill="none"
          stroke={SIGNIFICANT_STROKE}
          strokeWidth={3}
        />
      )}

      {/* shaded tail areas */}
      <polygon points={leftTail} fill={TAIL_FILL} />
      <polygon points={rightTail} fill={TAIL_FILL} />

      {/* standard normal pdf */}
      <polyline
        points={curvePoints}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={2}
      />

      {/* simulated value */}
      {zScore !== null && (
        <line
          x1={toSvgX(zScore)}
          y1={MARGIN.top}
          x2={toSvgX(zScore)}
          y2={height - MARGIN.bottom}
          stroke="#1e293b"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}