import styles from './SampleHistogramPlot.module.css';
import { COLOR_PRIMARY, COLOR_SUCCESS, COLOR_TEXT_MUTED } from '../../../styles/colors';

const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
const NUM_BINS = 30;
const SHADE_FILL = '#a7f3d0'; // light green, the interval of interest

export default function SampleHistogramPlot({
  samples,
  targetPdf,
  domain,
  interval,
  width = 400,
  height = 180,
}: {
  samples: number[];
  targetPdf: (x: number) => number;
  domain: [number, number];
  interval: [number, number];
  width?: number;
  height?: number;
}) {
  const [xMin, xMax] = domain;
  const [lo, hi] = interval;
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const binWidth = (xMax - xMin) / NUM_BINS;
  const counts = new Array(NUM_BINS).fill(0);
  for (const x of samples) {
    if (x < xMin || x > xMax) continue;
    const bin = Math.min(NUM_BINS - 1, Math.floor((x - xMin) / binWidth));
    counts[bin]++;
  }
  const n = samples.length || 1;
  const densities = counts.map((c) => c / (n * binWidth));

  // sample the target pdf across the domain to find a stable y-scale
  const pdfPeak = (() => {
    let peak = 0;
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      peak = Math.max(peak, targetPdf(x));
    }
    return peak;
  })();
  const yMax = Math.max(pdfPeak, ...densities, 1e-9) * 1.15;

  const toSvgX = (x: number) => MARGIN.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => MARGIN.top + (1 - y / yMax) * plotH;

  const pdfPoints = (() => {
    const pts: string[] = [];
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      pts.push(`${toSvgX(x).toFixed(2)},${toSvgY(targetPdf(x)).toFixed(2)}`);
    }
    return pts.join(' ');
  })();

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.plot}>
      {/* shaded interval of interest */}
      <rect
        x={toSvgX(Math.max(lo, xMin))}
        y={MARGIN.top}
        width={toSvgX(Math.min(hi, xMax)) - toSvgX(Math.max(lo, xMin))}
        height={plotH}
        fill={SHADE_FILL}
        opacity={0.5}
      />

      {/* histogram bars */}
      {densities.map((d, i) => {
        const x0 = xMin + i * binWidth;
        return (
          <rect
            key={i}
            x={toSvgX(x0) + 0.5}
            y={toSvgY(d)}
            width={Math.max(toSvgX(x0 + binWidth) - toSvgX(x0) - 1, 0)}
            height={toSvgY(0) - toSvgY(d)}
            fill={COLOR_SUCCESS}
            opacity={0.6}
          />
        );
      })}

      {/* target pdf curve */}
      <polyline points={pdfPoints} fill="none" stroke={COLOR_PRIMARY} strokeWidth={2} />

      {/* x-axis */}
      <line
        x1={MARGIN.left}
        y1={toSvgY(0)}
        x2={width - MARGIN.right}
        y2={toSvgY(0)}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
      />
    </svg>
  );
}
