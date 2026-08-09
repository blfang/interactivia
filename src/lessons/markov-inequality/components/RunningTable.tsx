import styles from './RunningTable.module.css';

export interface TableRow {
  mean: number;
  threshold: number;
  n: number;
  k: number;
}

interface RunningTableProps {
  rows: TableRow[];
  currentIndex: number;
  showRatioFormat?: boolean;
}

export default function RunningTable({ rows, currentIndex, showRatioFormat = false }: RunningTableProps) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Example</th>
            <th className={styles.th}>Mean</th>
            <th className={styles.th}>Threshold</th>
            <th className={styles.th}>Fraction at or above threshold</th>
            {showRatioFormat && <th className={styles.th}>Threshold × Fraction</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            const rowClassName = isPast ? styles.tdPast : isCurrent ? styles.tdCurrent : styles.tdFuture;
            return (
              <tr key={i}>
                <td className={`${styles.td} ${rowClassName}`}>{i + 1}</td>
                <td className={`${styles.td} ${rowClassName}`}>${row.mean}</td>
                <td className={`${styles.td} ${rowClassName}`}>${row.threshold}</td>
                <td className={`${styles.td} ${rowClassName}`}>
                  {showRatioFormat ? (
                    <>
                      {row.k} / {row.n} = {(row.k / row.n).toFixed(2)}
                    </>
                  ) : (
                    <>
                      {row.k} / {row.n}
                    </>
                  )}
                </td>
                {showRatioFormat && (
                  <td className={`${styles.td} ${rowClassName}`}>
                    {row.threshold} * {row.k} / {row.n} = {(row.threshold * row.k / row.n).toFixed(2)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
