import styles from './MultipleTestingPlot.module.css';
import { ChartFrame, makeChartScale, MAX_TESTS, ALPHA } from './plotShared';

export default function MultipleTestingPlot({
  width = 600,
  height = 400,
  showSecondCurve = false,
  showPoints = true,
}: {
  width?: number;
  height?: number;
  showSecondCurve?: boolean;
  showPoints?: boolean;
}) {
  // Calculate the probability for each m
  const probability = (m: number) => 1 - Math.pow(1 - ALPHA, m);
  const probabilityBonferroni = (m: number) => 1 - Math.pow(1 - ALPHA / m, m);

  const { toSvgX, toSvgY } = makeChartScale(width, height);

  // Generate curve points
  const curvePoints: string[] = [];
  const curvePoints2: string[] = [];
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const m = 1 + (i / N) * (MAX_TESTS - 1);
    const p = probability(m);
    curvePoints.push(`${toSvgX(m).toFixed(2)},${toSvgY(p).toFixed(2)}`);
    if (showSecondCurve) {
      const p2 = probabilityBonferroni(m);
      curvePoints2.push(`${toSvgX(m).toFixed(2)},${toSvgY(p2).toFixed(2)}`);
    }
  }

  return (
    <ChartFrame
      width={width}
      height={height}
      className={styles.plot}
      legend={
        showSecondCurve
          ? [
              { color: '#3b82f6', label: '1 - (1-0.05)^m' },
              { color: '#10b981', label: '1 - (1-0.05/m)^m' },
            ]
          : undefined
      }
    >
      {/* Curve */}
      <polyline points={curvePoints.join(' ')} fill="none" stroke="#3b82f6" strokeWidth={3} />

      {/* Second curve (Bonferroni correction) */}
      {showSecondCurve && (
        <polyline points={curvePoints2.join(' ')} fill="none" stroke="#10b981" strokeWidth={3} />
      )}

      {/* Highlighted points */}
      {showPoints && (
        <>
          {/* Point for m=1, p=0.05 */}
          <circle cx={toSvgX(1)} cy={toSvgY(0.05)} r={6} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
          {!showSecondCurve && (
            <text
              x={toSvgX(1) + 15}
              y={toSvgY(0.05)}
              fontSize={12}
              fontWeight="bold"
              fill="#3b82f6"
              dominantBaseline="middle"
            >
              m=1, p=0.05
            </text>
          )}

          {/* Point for m=25, p≈0.72 */}
          <circle cx={toSvgX(25)} cy={toSvgY(0.7226)} r={6} fill="#3b82f6" stroke="#ffffff" strokeWidth={2} />
          {!showSecondCurve && (
            <text
              x={toSvgX(25) + 15}
              y={toSvgY(0.72)}
              fontSize={12}
              fontWeight="bold"
              fill="#3b82f6"
              dominantBaseline="middle"
            >
              m=25, p=0.72
            </text>
          )}

          {/* Points for second curve (Bonferroni) */}
          {showSecondCurve && (
            <>
              {/* Point for m=1 on Bonferroni curve */}
              <circle
                cx={toSvgX(1)}
                cy={toSvgY(probabilityBonferroni(1))}
                r={6}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
              {/* Point for m=25 on Bonferroni curve */}
              <circle
                cx={toSvgX(25)}
                cy={toSvgY(probabilityBonferroni(25))}
                r={6}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </>
          )}
        </>
      )}
    </ChartFrame>
  );
}