import { useState } from 'react';
import styles from './ImportanceWeightExplorer.module.css';
import { COLOR_PRIMARY, COLOR_DANGER, COLOR_TEXT_MUTED } from '../../../styles/colors';
import { standardNormalPdf, normalPdf, importanceWeight } from '../simulation';

const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };
const SHADE_FILL = '#a7f3d0'; // light green, the interval of interest

function curve(
  pdf: (x: number) => number,
  xMin: number,
  xMax: number,
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number
) {
  const pts: string[] = [];
  const N = 150;
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    pts.push(`${toSvgX(x).toFixed(2)},${toSvgY(pdf(x)).toFixed(2)}`);
  }
  return pts.join(' ');
}

// lets the user click anywhere on the target-vs-proposal pdf plot to see the
// importance weight w(x) = f(x)/g(x) at that point
export default function ImportanceWeightExplorer({
  proposalMean,
  proposalSd = 1,
  domain,
  interval,
  width = 420,
  height = 200,
}: {
  proposalMean: number;
  proposalSd?: number;
  domain: [number, number];
  interval: [number, number];
  width?: number;
  height?: number;
}) {
  const [selectedX, setSelectedX] = useState<number | null>(null);

  const targetPdf = standardNormalPdf;
  const proposalPdf = (x: number) => normalPdf(x, proposalMean, proposalSd);

  const [xMin, xMax] = domain;
  const [lo, hi] = interval;
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const peak = (() => {
    let p = 0;
    const N = 150;
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      p = Math.max(p, targetPdf(x), proposalPdf(x));
    }
    return p;
  })();
  const yMax = peak * 1.15;

  const toSvgX = (x: number) => MARGIN.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => MARGIN.top + (1 - y / yMax) * plotH;

  const updateSelectedX = (e: { clientX: number; currentTarget: SVGSVGElement }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const x = Math.max(xMin, Math.min(xMax, xMin + ((svgX - MARGIN.left) / plotW) * (xMax - xMin)));
    setSelectedX(x);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSelectedX(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons === 0) return;
    updateSelectedX(e);
  };

  const weight = selectedX !== null ? importanceWeight(selectedX, targetPdf, proposalPdf) : null;

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.plot}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        role="img"
        aria-label="Click or drag to see the importance weight at a point"
      >
        {/* shaded interval of interest */}
        <rect
          x={toSvgX(Math.max(lo, xMin))}
          y={MARGIN.top}
          width={toSvgX(Math.min(hi, xMax)) - toSvgX(Math.max(lo, xMin))}
          height={plotH}
          fill={SHADE_FILL}
          opacity={0.5}
        />

        {/* proposal distribution g */}
        <polyline
          points={curve(proposalPdf, xMin, xMax, toSvgX, toSvgY)}
          fill="none"
          stroke={COLOR_DANGER}
          strokeWidth={2}
          strokeDasharray="5 4"
        />

        {/* target distribution f */}
        <polyline
          points={curve(targetPdf, xMin, xMax, toSvgX, toSvgY)}
          fill="none"
          stroke={COLOR_PRIMARY}
          strokeWidth={2}
        />

        {/* clicked point */}
        {selectedX !== null && (
          <line
            x1={toSvgX(selectedX)}
            y1={MARGIN.top}
            x2={toSvgX(selectedX)}
            y2={height - MARGIN.bottom}
            stroke="#1e293b"
            strokeWidth={1.5}
          />
        )}

        {/* x-axis */}
        <line
          x1={MARGIN.left}
          y1={toSvgY(0)}
          x2={width - MARGIN.right}
          y2={toSvgY(0)}
          stroke={COLOR_TEXT_MUTED}
          strokeWidth={1}
        />
      </svg>
      <div className={styles.readout}>
        {selectedX !== null ? (
          <>
            At x = {selectedX.toFixed(2)}: w(x) = f(x)/g(x) = {targetPdf(selectedX).toFixed(4)} /{' '}
            {proposalPdf(selectedX).toFixed(4)} = <strong>{weight!.toFixed(4)}</strong>
          </>
        ) : (
          <span className={styles.readoutHint}>Click or drag across the plot to see the importance weight there.</span>
        )}
      </div>
    </div>
  );
}
