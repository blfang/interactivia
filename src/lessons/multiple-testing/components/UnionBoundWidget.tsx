import { useMemo, useState } from 'react';
import styles from './UnionBoundWidget.module.css';

const M = 6;
const P = 0.05;
const SUM_P = M * P;

const SQUARE = 300;
const MARGIN = 20;
const VIEW = SQUARE + 2 * MARGIN;

const RADIUS = Math.sqrt((P * SQUARE * SQUARE) / Math.PI);
const RING_R0 = 90;

const GRID_N = 150;
const MAX_BAR_P = 0.4;

function circleCenters(overlap: number): { x: number; y: number }[] {
  const ring = RING_R0 * (1 - overlap);
  const cx = SQUARE / 2;
  const cy = SQUARE / 2;
  return Array.from({ length: M }, (_, i) => {
    const angle = (2 * Math.PI * i) / M - Math.PI / 2;
    return {
      x: cx + ring * Math.cos(angle),
      y: cy + ring * Math.sin(angle),
    };
  });
}

function inUnion(x: number, y: number, centers: { x: number; y: number }[]): boolean {
  return centers.some((c) => (x - c.x) ** 2 + (y - c.y) ** 2 <= RADIUS * RADIUS);
}

function estimateUnionProbability(centers: { x: number; y: number }[]): number {
  let hits = 0;
  for (let i = 0; i < GRID_N; i++) {
    const x = ((i + 0.5) / GRID_N) * SQUARE;
    for (let j = 0; j < GRID_N; j++) {
      const y = ((j + 0.5) / GRID_N) * SQUARE;
      if (inUnion(x, y, centers)) hits++;
    }
  }
  return hits / (GRID_N * GRID_N);
}

export default function UnionBoundWidget() {
  const [overlap, setOverlap] = useState(0);

  const centers = useMemo(() => circleCenters(overlap), [overlap]);
  const unionP = useMemo(() => estimateUnionProbability(centers), [centers]);

  const sumBarWidth = (SUM_P / MAX_BAR_P) * 100;
  const unionBarWidth = (unionP / MAX_BAR_P) * 100;

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className={styles.diagram}>
        <rect
          x={MARGIN}
          y={MARGIN}
          width={SQUARE}
          height={SQUARE}
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth={2}
        />
        <g transform={`translate(${MARGIN}, ${MARGIN})`}>
          {centers.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={RADIUS}
              fill="#ef4444"
              fillOpacity={0.22}
              stroke="#ef4444"
              strokeOpacity={0.5}
              strokeWidth={1}
            />
          ))}
        </g>
      </svg>

      <div className={styles.sliderRow}>
        <label htmlFor="overlap-slider" className={styles.sliderLabel}>
          Mutually exclusive
        </label>
        <input
          id="overlap-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={overlap}
          onChange={(e) => setOverlap(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderLabel}>Perfectly dependent</span>
      </div>

      <div className={styles.bars}>
        <div className={styles.barRow}>
          <span className={styles.barText}>
            Sum of individual probabilities: &Sigma; P(A<sub>i</sub>) = {SUM_P.toFixed(2)}
          </span>
          <div className={styles.barTrack}>
            <div className={styles.barFillSum} style={{ width: `${sumBarWidth}%` }} />
          </div>
        </div>
        <div className={styles.barRow}>
          <span className={styles.barText}>
            Probability of the union: P(A<sub>1</sub> &cup; &hellip; &cup; A<sub>{M}</sub>) &approx;{' '}
            {unionP.toFixed(2)}
          </span>
          <div className={styles.barTrack}>
            <div className={styles.barFillUnion} style={{ width: `${unionBarWidth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
