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

  const handleSimulate = () => {
    const newZScores = Array.from({ length: numPlots }, () => simulateZ());
    setZScores(newZScores);
    setSimulations((s) => s + 1);
    if (newZScores.some((z) => isSignificant(z, cutoff))) {
      setSimulationsWithFinding((s) => s + 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.buttonRow}>
          <button
            className={`${styles.button} ${styles['button--primary']}`}
            onClick={handleSimulate}
          >
            Simulate
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