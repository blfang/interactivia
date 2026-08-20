import styles from './TargetVsProposalPlot.module.css';
import { COLOR_PRIMARY, COLOR_DANGER, COLOR_TEXT_MUTED } from '../../../styles/colors';

const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
const SHADE_FILL = '#a7f3d0'; // light green, the interval of interest

function curve(
  pdf: (x: number) => number,
  xMin: number,
  xMax: number,
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number
) {
  const pts: string[] = [];
  const N = 150;
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    pts.push(`${toSvgX(x).toFixed(2)},${toSvgY(pdf(x)).toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function TargetVsProposalPlot({
  targetPdf,
  proposalPdf,
  domain,
  interval,
  lastSample = null,
  width = 400,
  height = 180,
}: {
  targetPdf: (x: number) => number;
  proposalPdf?: (x: number) => number;
  domain: [number, number];
  interval: [number, number];
  lastSample?: number | null;
  width?: number;
  height?: number;
}) {
  const [xMin, xMax] = domain;
  const [lo, hi] = interval;
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const peak = (() => {
    let p = 0;
    const N = 150;
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      p = Math.max(p, targetPdf(x), proposalPdf ? proposalPdf(x) : 0);
    }
    return p;
  })();
  const yMax = peak * 1.15;

  const toSvgX = (x: number) => MARGIN.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => MARGIN.top + (1 - y / yMax) * plotH;

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

      {/* proposal distribution g, when sampling from something other than the target */}
      {proposalPdf && (
        <polyline
          points={curve(proposalPdf, xMin, xMax, toSvgX, toSvgY)}
          fill="none"
          stroke={COLOR_DANGER}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
      )}

      {/* target distribution f */}
      <polyline
        points={curve(targetPdf, xMin, xMax, toSvgX, toSvgY)}
        fill="none"
        stroke={COLOR_PRIMARY}
        strokeWidth={2}
      />

      {/* most recent draw */}
      {lastSample !== null && (
        <line
          x1={toSvgX(lastSample)}
          y1={MARGIN.top}
          x2={toSvgX(lastSample)}
          y2={height - MARGIN.bottom}
          stroke="#1e293b"
          strokeWidth={1.5}
        />
      )}

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
