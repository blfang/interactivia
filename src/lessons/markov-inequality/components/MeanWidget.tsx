import React, { useRef, useState, useMemo, useEffect } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import styles from './MeanWidget.module.css';

export interface Person {
  label: string;
  value: number;
  color: string;
}

interface MeanWidgetProps {
  people: Person[];
  target: number;
  showTarget?: boolean;
  persistentMean?: boolean;
  maxValue?: number;
  threshold?: number | null;
  onPeopleChange?: (people: Person[]) => void;
  collapseMode?: boolean;
  solveValues?: number[];
  optimalK?: number;
}

const PADDING = { left: 50, right: 30, top: 50, bottom: 120 };
const W = 600;
const H = 350;
const AXIS_Y = H - PADDING.bottom;
// Height when no seesaw is drawn (showTarget=false): plot + tick labels only
const H_NO_SEESAW = AXIS_Y + 30;

function valueToX(value: number, maxValue: number): number {
  const graphWidth = W - PADDING.left - PADDING.right;
  return PADDING.left + (value / maxValue) * graphWidth;
}

function xToValue(x: number, maxValue: number): number {
  const graphWidth = W - PADDING.left - PADDING.right;
  const clamped = Math.max(PADDING.left, Math.min(W - PADDING.right, x));
  return Math.round(((clamped - PADDING.left) / graphWidth) * maxValue);
}

/** Approximate pixel width of bold 13px sans-serif text */
function estimateTextWidth(text: string): number {
  // Rough average: ~7.8px per character for this font
  return text.length * 7.8;
}

export default function MeanWidget({
  people: initialPeople,
  target,
  showTarget = true,
  persistentMean = false,
  maxValue = 120,
  threshold,
  onPeopleChange,
  collapseMode = false,
  solveValues,
  optimalK,
}: MeanWidgetProps): React.ReactNode {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [collapsed, setCollapsed] = useState(false);
  const [solveReached, setSolveReached] = useState(false);
  const [animating, setAnimating] = useState(false);
  const draggingRef = useRef<number>(-1);
  const draggingPointerIdRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onPeopleChangeRef = useRef(onPeopleChange);
  const animationRef = useRef<number | null>(null);
  onPeopleChangeRef.current = onPeopleChange;

  const chartH = showTarget ? H : H_NO_SEESAW;
  const axisY = showTarget ? AXIS_Y : chartH - 30;

  useEffect(() => {
    setPeople(initialPeople);
  }, [initialPeople]);

  // Notify parent of changes
  const prevPeopleRef = useRef(people);
  useEffect(() => {
    if (onPeopleChangeRef.current && people !== prevPeopleRef.current) {
      prevPeopleRef.current = people;
      onPeopleChangeRef.current(people);
    }
  }, [people]);

  const mean = useMemo(
    () => people.reduce((sum, p) => sum + p.value, 0) / people.length,
    [people],
  );
  const meanRounded = Math.round(mean * 100) / 100;
  const meanMatch = mean === target;

  const originalMean = useMemo(
    () =>
      initialPeople.reduce((sum, p) => sum + p.value, 0) / initialPeople.length,
    [initialPeople],
  );
  const originalMeanRounded = Math.round(originalMean * 100) / 100;

  // --- SVG coordinate helper ---
  const getSVGCoord = (
    e: ReactPointerEvent<SVGSVGElement>,
  ): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = chartH / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // --- Seesaw geometry ---
  const seesawProps = useMemo(() => {
    if (!showTarget) return null;
    const seesawY = axisY + 80;
    const plankLeft = PADDING.left;
    const plankRight = W - PADDING.right;
    const tX = valueToX(target, maxValue);
    const maxAngle = Math.PI / 12;
    const angle = ((mean - target) / maxValue) * maxAngle;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const fulcrumHalfBase = 15;
    const fulcrumHeight = 26;
    const fulcrumTopY = seesawY;

    const leftX = tX + (plankLeft - tX) * cosA;
    const leftY = fulcrumTopY + (plankLeft - tX) * sinA;
    const rightX = tX + (plankRight - tX) * cosA;
    const rightY = fulcrumTopY + (plankRight - tX) * sinA;

    return {
      targetX: tX,
      fulcrumHalfBase,
      fulcrumHeight,
      leftX,
      leftY,
      rightX,
      rightY,
      fulcrumTopY,
    };
  }, [mean, target, maxValue, showTarget]);

  // --- Hit detection ---
  const findDraggableIndex = (x: number, y: number): number => {
    for (let i = 0; i < people.length; i++) {
      const px = valueToX(people[i].value, maxValue);
      // Check person silhouette at axis
      const dist = Math.sqrt((x - px) ** 2 + (y - axisY) ** 2);
      if (dist < 20) return i;
      // Check label rectangle
      const labelText = `${people[i].label}: $${people[i].value}`;
      const textWidth = estimateTextWidth(labelText);
      const rectW = textWidth + 16;
      const rectH = 18;
      const labelY = PADDING.top + 20 + i * 20;
      const rectX = px - rectW / 2;
      const rectY = labelY - 16;
      if (x >= rectX && x <= rectX + rectW && y >= rectY && y <= rectY + rectH)
        return i;
    }
    return -1;
  };

  // --- Event handlers ---
  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    // Ignore a second finger/pointer while one drag is already active.
    if (draggingPointerIdRef.current !== null) return;
    e.preventDefault();
    const { x, y } = getSVGCoord(e);
    const index = findDraggableIndex(x, y);
    if (index < 0) return;
    svg.setPointerCapture(e.pointerId);
    draggingPointerIdRef.current = e.pointerId;
    draggingRef.current = index;
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x, y } = getSVGCoord(e);

    if (
      draggingRef.current >= 0 &&
      e.pointerId === draggingPointerIdRef.current
    ) {
      const newValue = xToValue(x, maxValue);
      const draggingIndex = draggingRef.current;
      setPeople((prev) => {
        if (draggingIndex < 0 || draggingIndex >= prev.length) return prev;
        const next = [...prev];
        const currentValue = next[draggingIndex].value;
        let clampedValue = newValue;
        if (persistentMean && thresholdValue !== null) {
          if (currentValue < thresholdValue) {
            clampedValue = Math.min(clampedValue, thresholdValue - 1);
          } else {
            clampedValue = Math.max(clampedValue, thresholdValue);
          }
        }
        next[draggingIndex] = {
          ...next[draggingIndex],
          value: clampedValue,
        };
        return next;
      });
      return;
    }

    svg.style.cursor = findDraggableIndex(x, y) >= 0 ? 'grab' : 'default';
  };

  const handlePointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.pointerId !== draggingPointerIdRef.current) return;
    draggingPointerIdRef.current = null;
    draggingRef.current = -1;
  };

  const handlePersonMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handlePersonMouseLeave = () => {
    setHoveredIndex(-1);
  };

  // --- Generic animation helper ---
  const animateTo = (targetValues: number[], onComplete: () => void) => {
    const startValues = people.map((p) => p.value);

    const allAtTarget = startValues.every((v, i) => v === targetValues[i]);
    if (allAtTarget) {
      onComplete();
      return;
    }

    const startTime = performance.now();
    const duration = 1500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      setPeople((prev) =>
        prev.map((p, i) => ({
          ...p,
          value: Math.round(
            startValues[i] + (targetValues[i] - startValues[i]) * eased,
          ),
        })),
      );

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimating(false);
        onComplete();
      }
    };

    setAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  // --- Collapse animation ---
  const handleCollapse = () => {
    if (collapsed || animating) return;
    const thresholdVal =
      threshold !== null && threshold !== undefined ? threshold : null;
    if (thresholdVal === null) return;

    const targetValues = people.map((p) =>
      p.value < thresholdVal ? 0 : thresholdVal,
    );

    animateTo(targetValues, () => setCollapsed(true));
  };

  // --- Solve animation ---
  const handleSolve = () => {
    if (solveReached || animating || !solveValues) return;
    animateTo(solveValues, () => setSolveReached(true));
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Reset to original positions (no animation)
  const handleReset = () => {
    if (animating) return;
    setPeople(initialPeople);
    setCollapsed(false);
    setSolveReached(false);
  };

  // --- Derived values ---
  const thresholdValue: number | null =
    threshold !== null && threshold !== undefined ? threshold : null;
  const thresholdX = thresholdValue != null ? valueToX(thresholdValue, maxValue) : null;

  const step = maxValue <= 50 ? 10 : 20;
  const ticks: number[] = [];
  for (let v = 0; v <= maxValue; v += step) ticks.push(v);

  const targetX = valueToX(target, maxValue);
  const meanX = valueToX(mean, maxValue);
  const originalMeanX = valueToX(originalMean, maxValue);

  const countAbove =
    thresholdValue !== null
      ? people.filter((p) => p.value >= thresholdValue).length
      : 0;
  const goalAchieved =
    mean === target && (optimalK === undefined || countAbove === optimalK);
  const interactionDisabled =
    collapseMode || (solveValues && goalAchieved) || animating;
  const probAbove = countAbove / people.length;
  const markovValue =
    thresholdValue !== null ? thresholdValue * probAbove : 0;
  const markovValueRounded = Math.round(markovValue * 100) / 100;
  const markovX = valueToX(markovValue, maxValue);

  return (
    <div className={styles.card}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${chartH}`}
        className={styles.chart}
        style={{ touchAction: 'none' }}
        onPointerDown={interactionDisabled ? undefined : handlePointerDown}
        onPointerMove={interactionDisabled ? undefined : handlePointerMove}
        onPointerUp={interactionDisabled ? undefined : handlePointerUp}
        onPointerCancel={interactionDisabled ? undefined : handlePointerUp}
      >
        <defs>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* ===== Threshold shaded region & label ===== */}
        {thresholdValue !== null && thresholdX !== null && (
          <>
            <rect
              x={thresholdX}
              y={PADDING.top}
              width={W - PADDING.right - thresholdX}
              height={axisY - PADDING.top}
              fill="#eff6ff"
            />
            <text
              x={W - PADDING.right}
              y={PADDING.top - 8}
              fill="#2563eb"
              fontSize="13"
              fontWeight="bold"
              textAnchor="end"
            >
              {(() => {
                const count = people.filter((p) => p.value >= thresholdValue!)
                  .length;
                return `${count} ${count === 1 ? 'person' : 'people'} with ≥$${thresholdValue!}`;
              })()}
            </text>
          </>
        )}

        {/* ===== Axis line ===== */}
        <line
          x1={PADDING.left}
          y1={axisY}
          x2={W - PADDING.right}
          y2={axisY}
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* ===== Target line & label ===== */}
        {showTarget && (
          <>
            <line
              x1={targetX}
              y1={PADDING.top}
              x2={targetX}
              y2={axisY}
              stroke="#16a34a"
              strokeWidth="2"
            />
            <text
              x={targetX}
              y={PADDING.top - 8}
              fill="#16a34a"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              Target: ${target.toFixed(2)}
            </text>
          </>
        )}

        {/* ===== Original mean line & label (persistent mode) ===== */}
        {persistentMean && (
          <>
            <line
              x1={originalMeanX}
              y1={PADDING.top}
              x2={originalMeanX}
              y2={axisY}
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
              original mean = ${originalMeanRounded.toFixed(2)}
            </text>
          </>
        )}

        {/* ===== Mean line & label ===== */}
        <line
          x1={meanX}
          y1={PADDING.top}
          x2={meanX}
          y2={axisY}
          stroke={meanMatch && showTarget ? '#16a34a' : '#000000'}
          strokeWidth={1.5}
          strokeDasharray="2,4"
        />
        <text
          x={meanX}
          y={PADDING.top - 24}
          fill={meanMatch && showTarget ? '#16a34a' : '#000000'}
          fontSize="13"
          textAnchor="middle"
        >
          Mean: ${meanRounded.toFixed(2)}
        </text>

        {/* ===== Markov bound line & label (persistent mode) ===== */}
        {persistentMean && thresholdValue !== null && (
          <>
            <line
              x1={markovX}
              y1={PADDING.top}
              x2={markovX}
              y2={axisY}
              stroke="#2563eb"
              strokeWidth="2"
            />
            <text
              x={markovX}
              y={PADDING.top - 40}
              fill="#2563eb"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              threshold * fraction = {markovValueRounded.toFixed(2)}
            </text>
          </>
        )}

        {/* ===== Axis labels & tick marks ===== */}
        {ticks.map((v) => {
          const x = valueToX(v, maxValue);
          return (
            <g key={v}>
              <text
                x={x}
                y={axisY + 20}
                fill="#64748b"
                fontSize="12"
                textAnchor="middle"
              >
                ${v}
              </text>
              <line
                x1={x}
                y1={axisY - 4}
                x2={x}
                y2={axisY + 4}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* ===== Seesaw ===== */}
        {seesawProps &&
          (() => {
            const s = seesawProps;

            // Fulcrum triangle
            const fulcrumPoints = [
              `${s.targetX},${s.fulcrumTopY}`,
              `${s.targetX - s.fulcrumHalfBase},${s.fulcrumTopY + s.fulcrumHeight}`,
              `${s.targetX + s.fulcrumHalfBase},${s.fulcrumTopY + s.fulcrumHeight}`,
            ].join(' ');

            return (
              <>
                <polygon
                  points={fulcrumPoints}
                  fill={meanMatch ? '#16a34a' : '#666'}
                />

                {/* Plank */}
                {thresholdValue !== null && thresholdX !== null ? (
                  (() => {
                    const t =
                      (thresholdX - s.leftX) / (s.rightX - s.leftX);
                    const plankMidY =
                      s.leftY + t * (s.rightY - s.leftY);
                    return (
                      <>
                        <line
                          x1={s.leftX}
                          y1={s.leftY}
                          x2={thresholdX}
                          y2={plankMidY}
                          stroke="#8B4513"
                          strokeWidth="6"
                          strokeLinecap="butt"
                        />
                        <line
                          x1={thresholdX}
                          y1={plankMidY}
                          x2={s.rightX}
                          y2={s.rightY}
                          stroke="#2563eb"
                          strokeWidth="6"
                          strokeLinecap="butt"
                        />
                      </>
                    );
                  })()
                ) : (
                  <line
                    x1={s.leftX}
                    y1={s.leftY}
                    x2={s.rightX}
                    y2={s.rightY}
                    stroke="#8B4513"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                )}
              </>
            );
          })()}

        {/* ===== People ===== */}
        {people.map((person, i) => {
          const x = valueToX(person.value, maxValue);
          const labelY = PADDING.top + 20 + i * 20;
          const labelText = `${person.label}: $${person.value}`;
          const textWidth = estimateTextWidth(labelText);
          const rectW = textWidth + 16;
          const rectH = 18;
          const rectX = x - rectW / 2;
          const rectY = labelY - 16;
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => handlePersonMouseEnter(i)}
              onMouseLeave={handlePersonMouseLeave}
              className={styles.personGroup}
              style={{
                filter:
                  isHovered && !persistentMean && !interactionDisabled
                    ? 'url(#dropShadow)'
                    : 'none',
                cursor: persistentMean || interactionDisabled ? 'default' : undefined,
              }}
            >
              {/* Dashed vertical connecting line */}
              <line
                x1={x}
                y1={labelY}
                x2={x}
                y2={axisY}
                stroke={person.color + '40'}
                strokeWidth="1"
                strokeDasharray="3,3"
              />

              {/* Person silhouette */}
              <circle
                cx={x}
                cy={axisY}
                r="8"
                fill={person.color}
              />

              {/* Label rounded rectangle + text */}
              <rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                rx="6"
                fill={person.color}
              />
              <text
                x={x}
                y={rectY + 13}
                fill="#ffffff"
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
              >
                {labelText}
              </text>
            </g>
          );
        })}
      </svg>

      {collapseMode && (
        <button
          onClick={collapsed ? handleReset : handleCollapse}
          disabled={animating}
          className={`${styles.button} ${styles['button--primary']} ${animating ? styles['button--disabled'] : ''}`}
        >
          {collapsed ? 'Reset' : 'Collapse'}
        </button>
      )}

      {solveValues && (
        <button
          onClick={goalAchieved || solveReached ? handleReset : handleSolve}
          disabled={animating}
          className={`${styles.button} ${styles['button--primary']} ${animating ? styles['button--disabled'] : ''}`}
        >
          {goalAchieved || solveReached ? 'Reset' : 'Solve'}
        </button>
      )}
    </div>
  );
}
