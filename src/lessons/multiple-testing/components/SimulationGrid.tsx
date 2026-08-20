import { useState } from 'react';
import NormalPlot from './NormalPlot';
import { simulateZ, isSignificant } from '../simulation';
import styles from './SimulationGrid.module.css';

export default function SimulationGrid({
  numPlots,
  columns,
  plotWidth = 120,
  plotHeight = 80,
  cutoff = 1.96,
}: {
  numPlots: number;
  columns: number;
  plotWidth?: number;
  plotHeight?: number;
  cutoff?: number;
}) {
  const [zScores, setZScores] = useState<(number | null)[]>(
    Array(numPlots).fill(null)
  );
  const [simulations, setSimulations] = useState(0);
  const [simulationsWithFinding, setSimulationsWithFinding] = useState(0);

  const handleSimulate = (batchSize: number = 1) => {
    let finalZScores: number[] = [];
    let additionalFindings = 0;
    for (let i = 0; i < batchSize; i++) {
      finalZScores = Array.from({ length: numPlots }, () => simulateZ());
      if (finalZScores.some((z) => isSignificant(z, cutoff))) {
        additionalFindings++;
      }
    }
    setZScores(finalZScores);
    setSimulations((s) => s + batchSize);
    setSimulationsWithFinding((s) => s + additionalFindings);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.buttonRow}>
          <button
            className={`${styles.button} ${styles['button--primary']}`}
            onClick={() => handleSimulate(1)}
          >
            Simulate
          </button>
          <button
            className={`${styles.button} ${styles['button--secondary']}`}
            onClick={() => handleSimulate(100)}
          >
            Simulate ×100
          </button>
        </div>
        <span
          className={
            simulations > 0
              ? styles.counter
              : `${styles.counter} ${styles['counter--hidden']}`
          }
        >
          Fraction of simulations with {numPlots > 1 ? 'at least one' : 'a'} false discovery:{' '}
          <span className={styles.highlight}>{simulationsWithFinding}</span> / {simulations} ={' '}
          {simulations > 0 ? (simulationsWithFinding / simulations).toFixed(2) : '0.00'}
        </span>
      </div>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {zScores.map((z, i) => (
          <NormalPlot key={i} zScore={z} width={plotWidth} height={plotHeight} cutoff={cutoff} />
        ))}
      </div>
    </div>
  );
}