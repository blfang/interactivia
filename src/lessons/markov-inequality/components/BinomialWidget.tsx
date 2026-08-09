import React, { useMemo, useState, useRef, useEffect } from 'react';
import styles from './BinomialWidget.module.css';

interface BinomialWidgetProps {
  n: number;
  p: number;
  threshold: number;
}

const W = 600;
const H = 350;
const PADDING = { left: 50, right: 30, top: 50, bottom: 50 };
const AXIS_Y = H - PADDING.bottom;
const PLOT_TOP = PADDING.top;
const PLOT_BOTTOM = AXIS_Y;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;
const ANIMATION_MS = 1200;

/** Binomial coefficient C(n, k) */
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/** P(X = k) for X ~ Binomial(n, p) */
function pmf(n: number, p: number, k: number): number {
  return binomial(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/** Ease-in-out cubic for a smooth start/stop. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Compute the displayed histogram at a given progress (0 = original, 1 = collapsed).
 *
 * Each unit of mass slides left toward its target (0 if below threshold, threshold
 * if above) and is smeared over one bin width. The displayed height of each bin is
 * the sum of overlaps of all flowing masses with that bin's interval. This keeps
 * bars at integer positions while heights change smoothly, and total mass is
 * conserved at every instant.
 */
function flowedDistribution(
  values: number[],
  threshold: number,
  n: number,
  progress: number,
): number[] {
  const result = new Array<number>(n + 1).fill(0);
  for (let k = 0; k <= n; k++) {
    const v = values[k];
    if (v === 0) continue;
    const target = k < threshold ? 0 : k > threshold ? threshold : k;
    const pos = k - progress * (k - target);
    const left = pos - 0.5;
    const right = pos + 0.5;
    for (let j = 0; j <= n; j++) {
      const binLeft = j - 0.5;
      const binRight = j + 0.5;
      const overlap = Math.max(0, Math.min(right, binRight) - Math.max(left, binLeft));
      if (overlap > 0) {
        result[j] += v * overlap;
      }
    }
  }
  return result;
}

export default function BinomialWidget({
  n,
  p,
  threshold,
}: BinomialWidgetProps): React.ReactNode {
  const originalValues = useMemo(() => {
    const arr: number[] = [];
    for (let k = 0; k <= n; k++) arr.push(pmf(n, p, k));
    return arr;
  }, [n, p]);

  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const originalMean = n * p;
  const probAbove = useMemo(
    () => originalValues.slice(threshold).reduce((sum, v) => sum + v, 0),
    [originalValues, threshold],
  );
  const thresholdTimesFraction = threshold * probAbove;

  const collapsed = progress >= 1;

  const displayedValues = useMemo(
    () => flowedDistribution(originalValues, threshold, n, progress),
    [originalValues, threshold, n, progress],
  );

  const currentMean = useMemo(
    () => displayedValues.reduce((sum, v, k) => sum + v * k, 0),
    [displayedValues],
  );

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleCollapse = () => {
    if (collapsed || animating) return;
    setAnimating(true);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const t = Math.min(1, elapsed / ANIMATION_MS);
      setProgress(easeInOutCubic(t));
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(animate);
      } else {
        setAnimating(false);
      }
    };

    rafRef.current = window.requestAnimationFrame(animate);
  };

  const handleReset = () => {
    if (animating) return;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
  };

  const graphWidth = W - PADDING.left - PADDING.right;
  const barWidth = graphWidth / (n + 1);
  const barGap = 2;

  // Y-axis fixed to [0, 1] so bars grow as mass accumulates
  const valueToY = (v: number) => PLOT_BOTTOM - v * PLOT_HEIGHT;
  const originalMeanX = PADDING.left + (originalMean / n) * graphWidth;
  const thresholdX = PADDING.left + (threshold / n) * graphWidth;
  const thresholdTimesFractionX =
    PADDING.left + (thresholdTimesFraction / n) * graphWidth;
  const currentMeanX = PADDING.left + (currentMean / n) * graphWidth;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        Binomial({n}, {p}) PMF
      </h3>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
      >
        {/* ===== Threshold shaded region ===== */}
        <rect
          x={thresholdX}
          y={PLOT_TOP}
          width={W - PADDING.right - thresholdX}
          height={PLOT_HEIGHT}
          fill="#eff6ff"
        />

        {/* ===== Axis line ===== */}
        <line
          x1={PADDING.left}
          y1={AXIS_Y}
          x2={W - PADDING.right}
          y2={AXIS_Y}
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* ===== Original mean line (green) ===== */}
        <line
          x1={originalMeanX}
          y1={PLOT_TOP}
          x2={originalMeanX}
          y2={AXIS_Y}
          stroke="#16a34a"
          strokeWidth="2"
        />
        <text
          x={originalMeanX}
          y={PADDING.top - 8}
          fill="#16a34a"
          fontSize="13"
          fontWeight="bold"
          textAnchor="middle"
        >
          original mean = {originalMean.toFixed(2)}
        </text>

        {/* ===== Threshold * fraction line (blue) ===== */}
        <line
          x1={thresholdTimesFractionX}
          y1={PLOT_TOP}
          x2={thresholdTimesFractionX}
          y2={AXIS_Y}
          stroke="#2563eb"
          strokeWidth="2"
        />
        <text
          x={thresholdTimesFractionX}
          y={PADDING.top - 40}
          fill="#2563eb"
          fontSize="13"
          fontWeight="bold"
          textAnchor="middle"
        >
          threshold * fraction = {thresholdTimesFraction.toFixed(2)}
        </text>

        {/* ===== Current mean line (dotted) ===== */}
        <line
          x1={currentMeanX}
          y1={PLOT_TOP}
          x2={currentMeanX}
          y2={AXIS_Y}
          stroke="#000000"
          strokeWidth={1.5}
          strokeDasharray="2,4"
        />
        <text
          x={currentMeanX}
          y={PADDING.top - 24}
          fill="#000000"
          fontSize="13"
          textAnchor="middle"
        >
          Mean: {currentMean.toFixed(2)}
        </text>

        {/* ===== Bars ===== */}
        {displayedValues.map((v, k) => {
          const x = PADDING.left + k * barWidth;
          const y = valueToY(v);
          const isAbove = k >= threshold;
          return (
            <g key={k}>
              <rect
                x={x + barGap / 2}
                y={y}
                width={barWidth - barGap}
                height={PLOT_BOTTOM - y}
                fill={isAbove ? '#2563eb' : '#94a3b8'}
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={AXIS_Y + 18}
                fill="#64748b"
                fontSize="12"
                textAnchor="middle"
              >
                {k}
              </text>
            </g>
          );
        })}

        {/* ===== Probability label ===== */}
        <text
          x={W - PADDING.right}
          y={PLOT_TOP + 16}
          fill="#2563eb"
          fontSize="13"
          fontWeight="bold"
          textAnchor="end"
        >
          P(X ≥ {threshold}) = {probAbove.toFixed(4)}
        </text>
      </svg>

      <button
        onClick={collapsed ? handleReset : handleCollapse}
        disabled={animating}
        className={`${styles.button} ${styles['button--primary']} ${animating ? styles['button--disabled'] : ''}`}
      >
        {collapsed ? 'Reset' : 'Collapse'}
      </button>
    </div>
  );
}