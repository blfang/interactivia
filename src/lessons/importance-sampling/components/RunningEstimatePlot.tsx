import styles from './RunningEstimatePlot.module.css';
import { COLOR_PRIMARY, COLOR_TEXT_MUTED } from '../../../styles/colors';

const MARGIN = { top: 10, right: 14, bottom: 24, left: 44 };

export default function RunningEstimatePlot({
  history,
  trueValue,
  yMax,
  width = 400,
  height = 180,
}: {
  history: number[];
  trueValue: number;
  yMax?: number;
  width?: number;
  height?: number;
}) {
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const resolvedYMax = yMax ?? Math.max(trueValue * 1.4, ...history, 1e-9) * 1.1;
  const n = history.length;
  const xMax = Math.max(n - 1, 1);

  const toSvgX = (i: number) => MARGIN.left + (i / xMax) * plotW;
  const toSvgY = (y: number) => MARGIN.top + (1 - y / resolvedYMax) * plotH;

  const linePoints = history
    .map((y, i) => `${toSvgX(i).toFixed(2)},${toSvgY(y).toFixed(2)}`)
    .join(' ');

  const currentEstimate = n > 0 ? history[n - 1] : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.plot}>
      {/* axes */}
      <line
        x1={MARGIN.left}
        y1={MARGIN.top}
        x2={MARGIN.left}
        y2={height - MARGIN.bottom}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
      />
      <line
        x1={MARGIN.left}
        y1={height - MARGIN.bottom}
        x2={width - MARGIN.right}
        y2={height - MARGIN.bottom}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
      />
      <text x={MARGIN.left - 6} y={MARGIN.top + 4} textAnchor="end" fontSize={10} fill={COLOR_TEXT_MUTED}>
        {resolvedYMax.toFixed(resolvedYMax < 0.01 ? 4 : 2)}
      </text>
      <text x={MARGIN.left - 6} y={height - MARGIN.bottom} textAnchor="end" fontSize={10} fill={COLOR_TEXT_MUTED}>
        0
      </text>
      <text x={MARGIN.left} y={height - MARGIN.bottom + 14} textAnchor="start" fontSize={10} fill={COLOR_TEXT_MUTED}>
        0
      </text>
      <text
        x={width - MARGIN.right}
        y={height - MARGIN.bottom + 14}
        textAnchor="end"
        fontSize={10}
        fill={COLOR_TEXT_MUTED}
      >
        {n} draws
      </text>

      {/* true value reference line */}
      <line
        x1={MARGIN.left}
        y1={toSvgY(trueValue)}
        x2={width - MARGIN.right}
        y2={toSvgY(trueValue)}
        stroke={COLOR_TEXT_MUTED}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <text x={width - MARGIN.right} y={toSvgY(trueValue) - 4} textAnchor="end" fontSize={10} fill={COLOR_TEXT_MUTED}>
        true value
      </text>

      {/* running estimate */}
      {n > 1 && <polyline points={linePoints} fill="none" stroke={COLOR_PRIMARY} strokeWidth={2} />}
      {n > 0 && (
        <circle cx={toSvgX(n - 1)} cy={toSvgY(currentEstimate)} r={3} fill={COLOR_PRIMARY} />
      )}
    </svg>
  );
}
