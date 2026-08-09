const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
const M = 40;
const ALPHA = 0.05;

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
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  // Calculate the probability for each m
  const probability = (m: number) => 1 - Math.pow(1 - ALPHA, m);
  const probabilityBonferroni = (m: number) => 1 - Math.pow(1 - ALPHA / m, m);

  // Scale functions
  const toSvgX = (m: number) => MARGIN.left + (m / M) * plotW;
  const toSvgY = (p: number) => MARGIN.top + (1 - p) * plotH;

  // Generate curve points
  const curvePoints: string[] = [];
  const curvePoints2: string[] = [];
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const m = 1 + (i / N) * (M - 1);
    const p = probability(m);
    curvePoints.push(`${toSvgX(m).toFixed(2)},${toSvgY(p).toFixed(2)}`);
    if (showSecondCurve) {
      const p2 = probabilityBonferroni(m);
      curvePoints2.push(`${toSvgX(m).toFixed(2)},${toSvgY(p2).toFixed(2)}`);
    }
  }

  // Generate grid lines
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const xTicks = [10, 20, 30, 40];

  return (
    <svg width={width} height={height}>
      {/* Background */}
      <rect x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} fill="#f8fafc" />

      {/* Grid lines */}
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

      {/* Axes */}
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

      {/* Curve */}
      <polyline
        points={curvePoints.join(' ')}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
      />

      {/* Second curve (Bonferroni correction) */}
      {showSecondCurve && (
        <polyline
          points={curvePoints2.join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth={3}
        />
      )}

      {/* Legend */}
      {showSecondCurve && (
        <g>
          <line x1={MARGIN.left + 10} y1={MARGIN.top + 10} x2={MARGIN.left + 40} y2={MARGIN.top + 10} stroke="#3b82f6" strokeWidth={3} />
          <text x={MARGIN.left + 50} y={MARGIN.top + 14} fontSize={11} fill="#1e293b">1 - (1-0.05)^m</text>
          <line x1={MARGIN.left + 10} y1={MARGIN.top + 25} x2={MARGIN.left + 40} y2={MARGIN.top + 25} stroke="#10b981" strokeWidth={3} />
          <text x={MARGIN.left + 50} y={MARGIN.top + 29} fontSize={11} fill="#1e293b">1 - (1-0.05/m)^m</text>
        </g>
      )}

      {/* Highlighted points */}
      {showPoints && (
        <>
          {/* Point for m=1, p=0.05 */}
          <circle
            cx={toSvgX(1)}
            cy={toSvgY(0.05)}
            r={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
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
          <circle
            cx={toSvgX(25)}
            cy={toSvgY(0.7226)}
            r={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
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

      {/* Y-axis labels */}
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

      {/* X-axis labels */}
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

      {/* Axis labels */}
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
  );
}