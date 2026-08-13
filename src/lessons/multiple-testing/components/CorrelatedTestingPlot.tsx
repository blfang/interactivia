import { useMemo, useState } from 'react';
import { simulateZ, bonferroniCutoff } from '../simulation';
import styles from './CorrelatedTestingPlot.module.css';

const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
const M = 40;
const ALPHA = 0.05;
const TRIALS = 10000;

function simulate(rho: number): { uncorrected: number[]; bonferroni: number[] } {
  const sqrtRho = Math.sqrt(rho);
  const sqrtOneMinusRho = Math.sqrt(1 - rho);
  const cutoffs = Array.from({ length: M + 1 }, (_, m) => (m === 0 ? 0 : bonferroniCutoff(m, ALPHA)));

  const uncorrectedHits = new Array(M + 1).fill(0);
  const bonferroniHits = new Array(M + 1).fill(0);

  for (let t = 0; t < TRIALS; t++) {
    const w = simulateZ();
    let maxAbsZ = 0;
    for (let i = 1; i <= M; i++) {
      const eps = simulateZ();
      const z = sqrtRho * w + sqrtOneMinusRho * eps;
      maxAbsZ = Math.max(maxAbsZ, Math.abs(z));
      if (maxAbsZ > 1.96) uncorrectedHits[i]++;
      if (maxAbsZ > cutoffs[i]) bonferroniHits[i]++;
    }
  }

  return {
    uncorrected: uncorrectedHits.map((h) => h / TRIALS),
    bonferroni: bonferroniHits.map((h) => h / TRIALS),
  };
}

export default function CorrelatedTestingPlot({
  width = 600,
  height = 400,
}: {
  width?: number;
  height?: number;
}) {
  const [rho, setRho] = useState(0);
  const { uncorrected, bonferroni } = useMemo(() => simulate(rho), [rho]);

  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const toSvgX = (m: number) => MARGIN.left + (m / M) * plotW;
  const toSvgY = (p: number) => MARGIN.top + (1 - p) * plotH;

  const curvePoints = Array.from({ length: M }, (_, i) => {
    const m = i + 1;
    return `${toSvgX(m).toFixed(2)},${toSvgY(uncorrected[m]).toFixed(2)}`;
  }).join(' ');

  const curvePointsBonferroni = Array.from({ length: M }, (_, i) => {
    const m = i + 1;
    return `${toSvgX(m).toFixed(2)},${toSvgY(bonferroni[m]).toFixed(2)}`;
  }).join(' ');

  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const xTicks = [10, 20, 30, 40];

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.plot}>
        <rect x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} fill="#f8fafc" />

        {yTicks.map((tick) => (
          <line
            key={`y-${tick}`}
            x1={MARGIN.left}
            y1={toSvgY(tick)}
            x2={MARGIN.left + plotW}
            y2={toSvgY(tick)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}
        {xTicks.map((tick) => (
          <line
            key={`x-${tick}`}
            x1={toSvgX(tick)}
            y1={MARGIN.top}
            x2={toSvgX(tick)}
            y2={MARGIN.top + plotH}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        <line
          x1={MARGIN.left}
          y1={MARGIN.top + plotH}
          x2={MARGIN.left + plotW}
          y2={MARGIN.top + plotH}
          stroke="#334155"
          strokeWidth={2}
        />
        <line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={MARGIN.top + plotH}
          stroke="#334155"
          strokeWidth={2}
        />

        <line
          x1={MARGIN.left}
          y1={toSvgY(0.05)}
          x2={MARGIN.left + plotW}
          y2={toSvgY(0.05)}
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        <polyline points={curvePoints} fill="none" stroke="#3b82f6" strokeWidth={3} />
        <polyline points={curvePointsBonferroni} fill="none" stroke="#10b981" strokeWidth={3} />

        <g>
          <line x1={MARGIN.left + 10} y1={MARGIN.top + 10} x2={MARGIN.left + 40} y2={MARGIN.top + 10} stroke="#3b82f6" strokeWidth={3} />
          <text x={MARGIN.left + 50} y={MARGIN.top + 14} fontSize={11} fill="#1e293b">Uncorrected</text>
          <line x1={MARGIN.left + 10} y1={MARGIN.top + 25} x2={MARGIN.left + 40} y2={MARGIN.top + 25} stroke="#10b981" strokeWidth={3} />
          <text x={MARGIN.left + 50} y={MARGIN.top + 29} fontSize={11} fill="#1e293b">Bonferroni</text>
        </g>

        {yTicks.map((tick) => (
          <text
            key={`y-label-${tick}`}
            x={MARGIN.left - 10}
            y={toSvgY(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={12}
            fill="#64748b"
          >
            {tick.toFixed(1)}
          </text>
        ))}
        {xTicks.map((tick) => (
          <text
            key={`x-label-${tick}`}
            x={toSvgX(tick)}
            y={MARGIN.top + plotH + 20}
            textAnchor="middle"
            fontSize={12}
            fill="#64748b"
          >
            {tick}
          </text>
        ))}

        <text
          x={MARGIN.left + plotW / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill="#1e293b"
        >
          Number of tests (m)
        </text>
        <text
          x={15}
          y={MARGIN.top + plotH / 2}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill="#1e293b"
          transform={`rotate(-90, 15, ${MARGIN.top + plotH / 2})`}
        >
          Probability of at least one mistake
        </text>
      </svg>

      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Independent (&rho; = 0)</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={rho}
          onChange={(e) => setRho(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderLabel}>Perfectly correlated (&rho; = 1)</span>
      </div>
      <div className={styles.rhoValue}>&rho; = {rho.toFixed(1)}</div>
    </div>
  );
}
