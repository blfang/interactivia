import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './ArrivalsTimelineWidget.module.css';

const W = 700;
const H = 220;
const PADDING = { left: 20, right: 20, top: 70, bottom: 40 };
const PLOT_W = W - PADDING.left - PADDING.right;
const AXIS_Y = H - PADDING.bottom;
const BRACKET_Y = AXIS_Y - 24;
/** Vertical spacing between stacked interval-label levels, when labels would otherwise overlap. */
const LEVEL_HEIGHT = 26;
const LABEL_GAP = 4;

/** How many hours of the timeline are visible at once. */
const VISIBLE_HOURS = 10;
/** Where "now" sits along the visible window, as a fraction from the left edge. */
const NOW_POSITION_FRACTION = 4 / 5;
const NOW_OFFSET_HOURS = VISIBLE_HOURS * NOW_POSITION_FRACTION;
const FUTURE_HOURS = VISIBLE_HOURS - NOW_OFFSET_HOURS;
const PIXELS_PER_HOUR = PLOT_W / VISIBLE_HOURS;
/** Real seconds per simulated hour at 1x speed (the original, slower pace). */
const BASE_SECONDS_PER_HOUR = 1;
const MIN_SPEED = 1;
const MAX_SPEED = 100;
const LOG_MIN_SPEED = Math.log(MIN_SPEED);
const LOG_MAX_SPEED = Math.log(MAX_SPEED);
/** Pop-in/fade-in animation durations at 1x speed; scaled down as speed increases. */
const BASE_DOT_POP_MS = 300;
const BASE_INTERVAL_FADE_MS = 400;
/** Clock time at simulated hour 0. */
const START_HOUR = 0;
/** The clock hour highlighted by the "inspect at a fixed time" feature. */
const HIGHLIGHT_HOUR = 10;
/** How far above the blue bracket the red "10am to next arrival" bracket is drawn. */
const RED_BRACKET_OFFSET = 33;

/** Small PDF/PMF preview shown alongside the distribution picker. */
const MINI_PLOT_W = 150;
const MINI_PLOT_H = 56;
const MINI_PLOT_PADDING = { left: 4, right: 4, top: 4, bottom: 4 };
const DISTRIBUTION_MEAN = 1;

interface RevealedArrival {
  time: number;
  length: number;
  coversHighlightHour: boolean;
  /** The highlighted hour's timestamp within this interval, if any. */
  highlightHourTime: number | null;
}

interface IntervalDistribution {
  id: string;
  label: string;
  sample: () => number;
}

const DISTRIBUTIONS: IntervalDistribution[] = [
  { id: 'exponential', label: 'Exponential(1)', sample: () => -Math.log(1 - Math.random()) },
  { id: 'uniform', label: 'Uniform[0, 2]', sample: () => Math.random() * 2 },
  {
    id: 'two-point',
    label: 'Long or short (1/5 w.p. 5/6, 5 w.p. 1/6)',
    sample: () => (Math.random() < 5 / 6 ? 1 / 5 : 5),
  },
];

function hourToX(hour: number): number {
  return PADDING.left + hour * PIXELS_PER_HOUR;
}

function formatClockHour(hour: number): string {
  const h = (((START_HOUR + Math.round(hour)) % 24) + 24) % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour} ${period}`;
}

function ticksForHour(currentHour: number): number[] {
  const low = Math.max(0, currentHour - NOW_OFFSET_HOURS - 1);
  const high = currentHour + FUTURE_HOURS + 1;
  const ticks: number[] = [];
  for (let h = low; h <= high; h++) ticks.push(h);
  return ticks;
}

function isHighlightHour(hour: number): boolean {
  return (((START_HOUR + hour) % 24) + 24) % 24 === HIGHLIGHT_HOUR;
}

/** The highlighted clock hour's timestamp within (prevTime, time], if any. */
function findHighlightHourInInterval(prevTime: number, time: number): number | null {
  const firstK = Math.ceil((prevTime - HIGHLIGHT_HOUR) / 24);
  for (let k = firstK; HIGHLIGHT_HOUR + 24 * k <= time; k++) {
    const t = HIGHLIGHT_HOUR + 24 * k;
    if (t > prevTime) return t;
  }
  return null;
}

/** Approximate pixel width of an 11px label like "0.42". */
function estimateLabelWidth(text: string): number {
  return text.length * 6.5;
}

/**
 * Greedily assign each interval a vertical stack level (0, 1, 2, ...) so that
 * labels whose horizontal footprints would overlap land on different levels,
 * like a waterfall/ladder layout.
 */
function assignLabelLevels(arrivals: RevealedArrival[]): number[] {
  const levelEndX: number[] = [];
  return arrivals.map((arrival) => {
    const midX = hourToX(arrival.time - arrival.length / 2);
    const halfWidth = estimateLabelWidth(arrival.length.toFixed(2)) / 2 + LABEL_GAP;
    const left = midX - halfWidth;
    const right = midX + halfWidth;
    let level = 0;
    while (levelEndX[level] !== undefined && left < levelEndX[level]) level++;
    levelEndX[level] = right;
    return level;
  });
}

/** A small preview of the selected distribution's PDF/PMF, with a dashed line at its mean. */
function DistributionMiniPlot({ distributionId }: { distributionId: string }) {
  const plotW = MINI_PLOT_W - MINI_PLOT_PADDING.left - MINI_PLOT_PADDING.right;
  const plotH = MINI_PLOT_H - MINI_PLOT_PADDING.top - MINI_PLOT_PADDING.bottom;
  const baseY = MINI_PLOT_H - MINI_PLOT_PADDING.bottom;

  const domainMax = 5.5;
  const xToPx = (x: number) => MINI_PLOT_PADDING.left + (x / domainMax) * plotW;
  const meanX = xToPx(DISTRIBUTION_MEAN);

  let shape: ReactNode;
  if (distributionId === 'uniform') {
    const height = plotH * 0.6;
    const x0 = xToPx(0);
    const x1 = xToPx(2);
    const topY = baseY - height;
    shape = (
      <>
        <rect x={x0} y={topY} width={x1 - x0} height={height} fill="#2563eb" fillOpacity={0.25} />
        <line x1={x0} y1={topY} x2={x1} y2={topY} stroke="#2563eb" strokeWidth={1.5} />
      </>
    );
  } else if (distributionId === 'two-point') {
    const bars = [
      { x: 1 / 5, prob: 5 / 6 },
      { x: 5, prob: 1 / 6 },
    ];
    const barWidth = 6;
    shape = (
      <>
        {bars.map((bar) => (
          <rect
            key={bar.x}
            x={xToPx(bar.x) - barWidth / 2}
            y={baseY - bar.prob * plotH}
            width={barWidth}
            height={bar.prob * plotH}
            fill="#2563eb"
          />
        ))}
      </>
    );
  } else {
    const steps = 40;
    const curvePoints: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * domainMax;
      curvePoints.push(`${xToPx(x)},${baseY - Math.exp(-x) * plotH}`);
    }
    const areaPoints = [`${xToPx(0)},${baseY}`, ...curvePoints, `${xToPx(domainMax)},${baseY}`];
    shape = (
      <>
        <polygon points={areaPoints.join(' ')} fill="#2563eb" fillOpacity={0.25} stroke="none" />
        <polyline points={curvePoints.join(' ')} fill="none" stroke="#2563eb" strokeWidth={1.5} />
      </>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${MINI_PLOT_W} ${MINI_PLOT_H}`}
      className={styles.miniPlot}
    >
      {distributionId !== 'uniform' && (
        <line
          x1={MINI_PLOT_PADDING.left}
          y1={baseY}
          x2={MINI_PLOT_W - MINI_PLOT_PADDING.right}
          y2={baseY}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
      )}
      {shape}
      <line
        x1={meanX}
        y1={MINI_PLOT_PADDING.top}
        x2={meanX}
        y2={baseY}
        stroke="#16a34a"
        strokeWidth={1.5}
        strokeDasharray="3,2"
      />
    </svg>
  );
}

interface ArrivalsTimelineWidgetProps {
  /** Show the "inspect at a fixed clock hour" feature: hourly stars, duplicate green
   * intervals for the interval containing that hour, and their own running average. */
  highlightTenAm?: boolean;
}

export default function ArrivalsTimelineWidget({
  highlightTenAm = false,
}: ArrivalsTimelineWidgetProps) {
  const [ticks, setTicks] = useState<number[]>(() => ticksForHour(0));
  const [visibleArrivals, setVisibleArrivals] = useState<RevealedArrival[]>([]);
  const [stats, setStats] = useState({ count: 0, sum: 0 });
  const [highlightStats, setHighlightStats] = useState({ count: 0, sum: 0 });
  const [redStats, setRedStats] = useState({ count: 0, sum: 0 });
  const [speed, setSpeed] = useState(MIN_SPEED);
  const [distributionId, setDistributionId] = useState(DISTRIBUTIONS[0].id);

  const groupRef = useRef<SVGGElement | null>(null);

  const speedRef = useRef(speed);
  speedRef.current = speed;
  const highlightEnabledRef = useRef(highlightTenAm);
  highlightEnabledRef.current = highlightTenAm;
  const samplerRef = useRef(DISTRIBUTIONS[0].sample);
  const simTimeRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const arrivalsRef = useRef<number[]>([]);
  const nextArrivalIndexRef = useRef(0);
  const prevArrivalTimeRef = useRef(0);
  const lastHourRef = useRef(-1);

  const handleDistributionChange = (id: string) => {
    const dist = DISTRIBUTIONS.find((d) => d.id === id);
    if (!dist) return;
    samplerRef.current = dist.sample;
    arrivalsRef.current = [];
    nextArrivalIndexRef.current = 0;
    prevArrivalTimeRef.current = 0;
    simTimeRef.current = 0;
    lastFrameTimeRef.current = null;
    lastHourRef.current = -1;
    setVisibleArrivals([]);
    setStats({ count: 0, sum: 0 });
    setHighlightStats({ count: 0, sum: 0 });
    setRedStats({ count: 0, sum: 0 });
    setTicks(ticksForHour(0));
    setDistributionId(id);
  };

  useEffect(() => {
    const ensureArrivalsGenerated = (horizonHour: number) => {
      const arrivals = arrivalsRef.current;
      let last = arrivals.length > 0 ? arrivals[arrivals.length - 1] : 0;
      while (last < horizonHour) {
        last += samplerRef.current();
        arrivals.push(last);
      }
    };

    const animate = (now: number) => {
      if (lastFrameTimeRef.current === null) lastFrameTimeRef.current = now;
      const deltaSeconds = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      const secondsPerHour = BASE_SECONDS_PER_HOUR / speedRef.current;
      simTimeRef.current += deltaSeconds / secondsPerHour;
      const currentSimTime = simTimeRef.current;
      const scrollOffsetHours = currentSimTime - NOW_OFFSET_HOURS;

      if (groupRef.current) {
        groupRef.current.setAttribute(
          'transform',
          `translate(${-scrollOffsetHours * PIXELS_PER_HOUR}, 0)`,
        );
      }
      ensureArrivalsGenerated(currentSimTime + 1);

      const newArrivals: RevealedArrival[] = [];
      const arrivals = arrivalsRef.current;
      while (
        nextArrivalIndexRef.current < arrivals.length &&
        arrivals[nextArrivalIndexRef.current] <= currentSimTime
      ) {
        const time = arrivals[nextArrivalIndexRef.current];
        const prevTime = prevArrivalTimeRef.current;
        const length = time - prevTime;
        const highlightHourTime = highlightEnabledRef.current
          ? findHighlightHourInInterval(prevTime, time)
          : null;
        prevArrivalTimeRef.current = time;
        nextArrivalIndexRef.current += 1;
        newArrivals.push({
          time,
          length,
          coversHighlightHour: highlightHourTime !== null,
          highlightHourTime,
        });
      }

      const currentHour = Math.floor(currentSimTime);
      if (newArrivals.length > 0) {
        setStats((prev) => ({
          count: prev.count + newArrivals.length,
          sum: prev.sum + newArrivals.reduce((s, a) => s + a.length, 0),
        }));
        const newHighlightArrivals = newArrivals.filter((a) => a.coversHighlightHour);
        if (newHighlightArrivals.length > 0) {
          setHighlightStats((prev) => ({
            count: prev.count + newHighlightArrivals.length,
            sum: prev.sum + newHighlightArrivals.reduce((s, a) => s + a.length, 0),
          }));
          setRedStats((prev) => ({
            count: prev.count + newHighlightArrivals.length,
            sum:
              prev.sum +
              newHighlightArrivals.reduce((s, a) => s + (a.time - a.highlightHourTime!), 0),
          }));
        }
        setVisibleArrivals((prev) => {
          const cutoff = currentSimTime - NOW_OFFSET_HOURS - 1;
          return [...prev, ...newArrivals].filter((a) => a.time >= cutoff);
        });
      }
      if (currentHour !== lastHourRef.current) {
        lastHourRef.current = currentHour;
        setTicks(ticksForHour(currentHour));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const average = stats.count > 0 ? stats.sum / stats.count : null;
  const highlightAverage =
    highlightStats.count > 0 ? highlightStats.sum / highlightStats.count : null;
  const redAverage = redStats.count > 0 ? redStats.sum / redStats.count : null;
  const minTick = ticks[0] ?? 0;
  const maxTick = ticks[ticks.length - 1] ?? 0;
  const labelLevels = assignLabelLevels(visibleArrivals);
  const dotPopDurationMs = BASE_DOT_POP_MS / speed;
  const intervalFadeDurationMs = BASE_INTERVAL_FADE_MS / speed;

  return (
    <div className={styles.card}>
      <div className={styles.controlsRow}>
        <fieldset className={styles.distributionControl}>
          <legend>Interval length distribution</legend>
          {DISTRIBUTIONS.map((dist) => (
            <label key={dist.id} className={styles.radioOption}>
              <input
                type="radio"
                name="distribution"
                value={dist.id}
                checked={distributionId === dist.id}
                onChange={() => handleDistributionChange(dist.id)}
              />
              {dist.label}
            </label>
          ))}
        </fieldset>
        <div className={styles.miniPlotContainer}>
          <span className={styles.miniPlotLabel}>Length distribution (mean = {DISTRIBUTION_MEAN})</span>
          <DistributionMiniPlot distributionId={distributionId} />
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
      >
        <clipPath id="arrivalsPlotClip">
          <rect x={PADDING.left} y={0} width={PLOT_W} height={H} />
        </clipPath>
        <text
          x={PADDING.left}
          y={26}
          fontSize={15}
          fontWeight="bold"
          fill="#2563eb"
          textAnchor="start"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          Average time between consecutive buses: {average !== null ? average.toFixed(2) : '—'}
          {average !== null ? ` (n = ${stats.count})` : ''}
        </text>
        {highlightTenAm && (
          <text
            x={PADDING.left}
            y={46}
            fontSize={15}
            fontWeight="bold"
            fill="#dc2626"
            textAnchor="start"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            Average time between {HIGHLIGHT_HOUR}am and next bus:{' '}
            {redAverage !== null ? redAverage.toFixed(2) : '—'}
            {redAverage !== null ? ` (n = ${redStats.count})` : ''}
          </text>
        )}
        {highlightTenAm && (
          <text
            x={PADDING.left}
            y={66}
            fontSize={15}
            fontWeight="bold"
            fill="#16a34a"
            textAnchor="start"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            Average time between buses just before and after {HIGHLIGHT_HOUR}am:{' '}
            {highlightAverage !== null ? highlightAverage.toFixed(2) : '—'}
            {highlightAverage !== null ? ` (n = ${highlightStats.count})` : ''}
          </text>
        )}
        <g clipPath="url(#arrivalsPlotClip)">
          <g ref={groupRef}>
            <line
              x1={hourToX(minTick)}
              y1={AXIS_Y}
              x2={hourToX(maxTick)}
              y2={AXIS_Y}
              stroke="#94a3b8"
              strokeWidth={2}
            />
            {ticks.map((h) => {
              const x = hourToX(h);
              return (
                <g key={h}>
                  <line
                    x1={x}
                    y1={AXIS_Y - 4}
                    x2={x}
                    y2={AXIS_Y + 4}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={AXIS_Y + 20}
                    fontSize={12}
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {formatClockHour(h)}
                  </text>
                  {highlightTenAm && isHighlightHour(h) && (
                    <>
                      <line
                        x1={x}
                        y1={PADDING.top - 10}
                        x2={x}
                        y2={AXIS_Y + 4}
                        stroke="#16a34a"
                        strokeWidth={1.5}
                      />
                      <text
                        x={x}
                        y={(BRACKET_Y + AXIS_Y) / 2}
                        fontSize={16}
                        fill="#16a34a"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        ★
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            {visibleArrivals.map((arrival, i) => {
              const x = hourToX(arrival.time);
              const prevTime = arrival.time - arrival.length;
              const prevX = hourToX(prevTime);
              const midX = (x + prevX) / 2;
              const labelY = BRACKET_Y - 8 - labelLevels[i] * LEVEL_HEIGHT;
              return (
                <g
                  key={arrival.time}
                  className={styles.intervalGroup}
                  style={{ animationDuration: `${intervalFadeDurationMs}ms` }}
                >
                  <line
                    x1={prevX}
                    y1={BRACKET_Y}
                    x2={x}
                    y2={BRACKET_Y}
                    stroke="#2563eb"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={prevX}
                    y1={BRACKET_Y - 4}
                    x2={prevX}
                    y2={BRACKET_Y + 4}
                    stroke="#2563eb"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={x}
                    y1={BRACKET_Y - 4}
                    x2={x}
                    y2={BRACKET_Y + 4}
                    stroke="#2563eb"
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={labelY}
                    fontSize={11}
                    fill="#2563eb"
                    textAnchor="middle"
                  >
                    {arrival.length.toFixed(2)}
                  </text>
                  <circle
                    cx={x}
                    cy={AXIS_Y}
                    r={5}
                    fill="#2563eb"
                    className={styles.arrivalDot}
                    style={{ animationDuration: `${dotPopDurationMs}ms` }}
                  />
                  {arrival.coversHighlightHour && (
                    <>
                      <line
                        x1={prevX}
                        y1={BRACKET_Y}
                        x2={x}
                        y2={BRACKET_Y}
                        stroke="#16a34a"
                        strokeWidth={1.5}
                      />
                      <line
                        x1={prevX}
                        y1={BRACKET_Y - 4}
                        x2={prevX}
                        y2={BRACKET_Y + 4}
                        stroke="#16a34a"
                        strokeWidth={1.5}
                      />
                      <line
                        x1={x}
                        y1={BRACKET_Y - 4}
                        x2={x}
                        y2={BRACKET_Y + 4}
                        stroke="#16a34a"
                        strokeWidth={1.5}
                      />
                      <text
                        x={midX}
                        y={labelY}
                        fontSize={11}
                        fill="#16a34a"
                        textAnchor="middle"
                      >
                        {arrival.length.toFixed(2)}
                      </text>
                    </>
                  )}
                  {arrival.highlightHourTime !== null && (
                    <>
                      {(() => {
                        const redX = hourToX(arrival.highlightHourTime!);
                        const redMidX = (redX + x) / 2;
                        const redY = BRACKET_Y - RED_BRACKET_OFFSET;
                        const redLength = arrival.time - arrival.highlightHourTime!;
                        return (
                          <>
                            <line
                              x1={redX}
                              y1={redY}
                              x2={x}
                              y2={redY}
                              stroke="#dc2626"
                              strokeWidth={1.5}
                            />
                            <line
                              x1={redX}
                              y1={redY - 4}
                              x2={redX}
                              y2={redY + 4}
                              stroke="#dc2626"
                              strokeWidth={1.5}
                            />
                            <line
                              x1={x}
                              y1={redY - 4}
                              x2={x}
                              y2={redY + 4}
                              stroke="#dc2626"
                              strokeWidth={1.5}
                            />
                            <text
                              x={redMidX}
                              y={redY - 8}
                              fontSize={11}
                              fill="#dc2626"
                              textAnchor="middle"
                            >
                              {redLength.toFixed(2)}
                            </text>
                          </>
                        );
                      })()}
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </g>
        <line
          x1={hourToX(NOW_OFFSET_HOURS)}
          y1={PADDING.top - 10}
          x2={hourToX(NOW_OFFSET_HOURS)}
          y2={AXIS_Y + 4}
          stroke="#16a34a"
          strokeDasharray="3,3"
          strokeWidth={1.5}
          opacity={0}
        />
      </svg>
      <label className={styles.speedControl}>
        Speed: {speed.toFixed(0)}x
        <input
          type="range"
          min={LOG_MIN_SPEED}
          max={LOG_MAX_SPEED}
          step={(LOG_MAX_SPEED - LOG_MIN_SPEED) / 200}
          value={Math.log(speed)}
          onChange={(e) => setSpeed(Math.exp(Number(e.target.value)))}
        />
      </label>
    </div>
  );
}
