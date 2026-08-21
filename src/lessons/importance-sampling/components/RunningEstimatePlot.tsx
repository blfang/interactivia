import styles from './RunningEstimatePlot.module.css';
import { COLOR_TEXT_MUTED } from '../../../styles/colors';

const MARGIN = { top: 18, right: 14, bottom: 24, left: 44 };

export interface EstimateSeries {
  history: number[];
  totalDraws?: number;
  color: string;
  label?: string;
}

export default function RunningEstimatePlot({
  series,
  trueValue,
  yMax,
  width = 400,
  height = 180,
}: {
  series: EstimateSeries[];
  trueValue: number;
  yMax?: number;
  width?: number;
  height?: number;
}) {
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const maxLen = Math.max(1, ...series.map((s) => s.history.length));
  const allValues = series.flatMap((s) => s.history);
  const resolvedYMax = yMax ?? Math.max(trueValue * 1.4, ...allValues, 1e-9) * 1.1;
  const xMax = Math.max(maxLen - 1, 1);
  const n = Math.max(0, ...series.map((s) => s.history.length));
  const total = Math.max(0, ...series.map((s) => s.totalDraws ?? s.history.length));
  const drawsLabel = total > n ? `last ${n} of ${total} draws` : `${n} draws`;
  const hasLabels = series.some((s) => s.label);

  const toSvgX = (i: number) => MARGIN.left + (i / xMax) * plotW;
  const toSvgY = (y: number) => MARGIN.top + (1 - y / resolvedYMax) * plotH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.plot}>
      {/* legend, when series are labeled */}
      {hasLabels &&
        series.map((s, i) => (
          <g key={i} transform={`translate(${MARGIN.left + i * 140}, 10)`}>
            <circle cx={4} cy={0} r={3} fill={s.color} />
            <text x={10} y={3} fontSize={9} fill={COLOR_TEXT_MUTED}>
              {s.label}
            </text>
          </g>
        ))}

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
        {drawsLabel}
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

      {/* running estimate(s) */}
      {series.map((s, i) => {
        const sn = s.history.length;
        const linePoints = s.history
          .map((y, j) => `${toSvgX(j).toFixed(2)},${toSvgY(y).toFixed(2)}`)
          .join(' ');
        const currentEstimate = sn > 0 ? s.history[sn - 1] : 0;
        return (
          <g key={i}>
            {sn > 1 && <polyline points={linePoints} fill="none" stroke={s.color} strokeWidth={2} />}
            {sn > 0 && <circle cx={toSvgX(sn - 1)} cy={toSvgY(currentEstimate)} r={3} fill={s.color} />}
          </g>
        );
      })}
    </svg>
  );
}
