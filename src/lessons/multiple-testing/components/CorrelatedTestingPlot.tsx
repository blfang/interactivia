import { useMemo, useState } from 'react';
import { simulateZ, bonferroniCutoff } from '../simulation';
import styles from './CorrelatedTestingPlot.module.css';
import { ChartFrame, makeChartScale, MAX_TESTS, ALPHA } from './plotShared';

const TRIALS = 100000;

function simulate(rho: number): { uncorrected: number[]; bonferroni: number[] } {
  const sqrtRho = Math.sqrt(rho);
  const sqrtOneMinusRho = Math.sqrt(1 - rho);
  const cutoffs = Array.from({ length: MAX_TESTS + 1 }, (_, m) => (m === 0 ? 0 : bonferroniCutoff(m, ALPHA)));

  const uncorrectedHits = new Array(MAX_TESTS + 1).fill(0);
  const bonferroniHits = new Array(MAX_TESTS + 1).fill(0);

  for (let t = 0; t < TRIALS; t++) {
    const w = simulateZ();
    let maxAbsZ = 0;
    for (let i = 1; i <= MAX_TESTS; i++) {
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

  const { toSvgX, toSvgY } = makeChartScale(width, height);

  const curvePoints = Array.from({ length: MAX_TESTS }, (_, i) => {
    const m = i + 1;
    return `${toSvgX(m).toFixed(2)},${toSvgY(uncorrected[m]).toFixed(2)}`;
  }).join(' ');

  const curvePointsBonferroni = Array.from({ length: MAX_TESTS }, (_, i) => {
    const m = i + 1;
    return `${toSvgX(m).toFixed(2)},${toSvgY(bonferroni[m]).toFixed(2)}`;
  }).join(' ');

  return (
    <div className={styles.container}>
      <ChartFrame
        width={width}
        height={height}
        className={styles.plot}
        legend={[
          { color: '#3b82f6', label: 'Uncorrected' },
          { color: '#10b981', label: 'Bonferroni' },
        ]}
      >
        <polyline points={curvePoints} fill="none" stroke="#3b82f6" strokeWidth={3} />
        <polyline points={curvePointsBonferroni} fill="none" stroke="#10b981" strokeWidth={3} />
      </ChartFrame>

      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Independent (&rho; = 0)</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={rho}
          onChange={(e) => setRho(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderLabel}>Perfectly correlated (&rho; = 1)</span>
      </div>
      <div className={styles.rhoValue}>&rho; = {rho.toFixed(2)}</div>
    </div>
  );
}
