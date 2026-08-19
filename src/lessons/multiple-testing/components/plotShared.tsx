import type { ReactNode } from 'react';

export const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
export const MAX_TESTS = 40;
export const ALPHA = 0.05;
export const Y_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
export const X_TICKS = [10, 20, 30, 40];

export function makeChartScale(width: number, height: number) {
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const toSvgX = (m: number) => MARGIN.left + (m / MAX_TESTS) * plotW;
  const toSvgY = (p: number) => MARGIN.top + (1 - p) * plotH;
  return { plotW, plotH, toSvgX, toSvgY };
}

export interface LegendEntry {
  color: string;
  label: string;
}

interface ChartFrameProps {
  width: number;
  height: number;
  className?: string;
  legend?: LegendEntry[];
  children?: ReactNode;
}

// shared scaffolding for the "probability of a false discovery vs. number of tests" charts:
// background, gridlines, axes, the 5% reference line, tick labels, and axis titles.
// callers compute their own curve/point positions via makeChartScale() and pass them as children.
export function ChartFrame({ width, height, className, legend, children }: ChartFrameProps) {
  const { plotW, plotH, toSvgX, toSvgY } = makeChartScale(width, height);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className}>
      {/* Background */}
      <rect x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} fill="#f8fafc" />

      {/* Grid lines */}
      {Y_TICKS.map((tick) => (
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
      {X_TICKS.map((tick) => (
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

      {/* 5% reference line */}
      <line
        x1={MARGIN.left}
        y1={toSvgY(0.05)}
        x2={MARGIN.left + plotW}
        y2={toSvgY(0.05)}
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {children}

      {/* Legend */}
      {legend && (
        <g>
          {legend.map((entry, i) => (
            <g key={entry.label}>
              <line
                x1={MARGIN.left + 10}
                y1={MARGIN.top + 10 + i * 15}
                x2={MARGIN.left + 40}
                y2={MARGIN.top + 10 + i * 15}
                stroke={entry.color}
                strokeWidth={3}
              />
              <text x={MARGIN.left + 50} y={MARGIN.top + 14 + i * 15} fontSize={11} fill="#1e293b">
                {entry.label}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Y-axis labels */}
      {Y_TICKS.map((tick) => (
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
      {X_TICKS.map((tick) => (
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

      {/* Axis titles */}
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
        Probability of at least one false discovery
      </text>
    </svg>
  );
}
