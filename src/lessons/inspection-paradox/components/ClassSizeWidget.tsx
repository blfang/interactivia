import { useEffect, useRef, useState } from 'react';
import styles from './ClassSizeWidget.module.css';

interface ClassInfo {
  label: string;
  size: number;
  color: string;
}

interface Student {
  id: number;
  classIndex: number;
  size: number;
  color: string;
  x: number;
  y: number;
}

const CLASSES: ClassInfo[] = [
  { label: 'Class A', size: 50, color: '#3b82f6' },
  { label: 'Class B', size: 50, color: '#10b981' },
  { label: 'Class C', size: 10, color: '#f59e0b' },
  { label: 'Class D', size: 10, color: '#ef4444' },
];

const SAMPLE_SIZE = 20;
const REVEAL_DELAY_MS = 900;
const FLY_DURATION_MS = 900;

const W = 700;
const H = 230;
const R = 6;
const DX = 16;
const DY = 16;
const FLOOR_Y = 172;

const TOP_ROW_Y = 40;
const TOP_ROW_DY = 22;
const TOP_COLS = 10;
const TOP_SLOT_DX = 32;
const TOP_AREA_LEFT = W / 2 - (TOP_COLS - 1) * TOP_SLOT_DX * 0.5;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Lay out each class as a grid of circles, stacked upward from a shared floor. */
function buildStudents(): Student[] {
  const students: Student[] = [];
  let id = 0;
  const blockGap = 50;
  let blockX = 30;

  for (const cls of CLASSES) {
    const cols = cls.size >= 50 ? 10 : 5;
    for (let i = 0; i < cls.size; i++) {
      const col = i % cols;
      const rowFromBottom = Math.floor(i / cols);
      students.push({
        id: id++,
        classIndex: CLASSES.indexOf(cls),
        size: cls.size,
        color: cls.color,
        x: blockX + col * DX,
        y: FLOOR_Y - rowFromBottom * DY,
      });
    }
    const blockWidth = (cols - 1) * DX + 2 * R;
    blockX += blockWidth + blockGap;
  }
  return students;
}

const ALL_STUDENTS = buildStudents();

function pickSample(k: number): Student[] {
  const pool = [...ALL_STUDENTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, k);
}

function targetSlot(index: number): { x: number; y: number } {
  const col = index % TOP_COLS;
  const row = Math.floor(index / TOP_COLS);
  return {
    x: TOP_AREA_LEFT + col * TOP_SLOT_DX,
    y: TOP_ROW_Y + row * TOP_ROW_DY,
  };
}

export default function ClassSizeWidget() {
  const [phase, setPhase] = useState<'idle' | 'revealed' | 'flying' | 'done'>(
    'idle',
  );
  const [selected, setSelected] = useState<Student[]>([]);
  const [progress, setProgress] = useState(0);

  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startFly = () => {
    setPhase('flying');
    const startTime = performance.now();
    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / FLY_DURATION_MS);
      setProgress(easeInOutCubic(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPhase('done');
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  const handleSurvey = () => {
    if (phase === 'revealed' || phase === 'flying') return;
    setSelected(pickSample(SAMPLE_SIZE));
    setProgress(0);
    setPhase('revealed');
    revealTimeoutRef.current = setTimeout(startFly, REVEAL_DELAY_MS);
  };

  const selectedIds =
    phase === 'idle' ? null : new Set(selected.map((s) => s.id));
  const average =
    phase === 'done'
      ? selected.reduce((sum, s) => sum + s.size, 0) / selected.length
      : null;

  return (
    <div className={styles.card}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
      >
        {ALL_STUDENTS.map((student) => (
          <circle
            key={student.id}
            cx={student.x}
            cy={student.y}
            r={R}
            fill={student.color}
            opacity={
              selectedIds === null || selectedIds.has(student.id) ? 1 : 0.25
            }
          />
        ))}

        {CLASSES.map((cls) => {
          const cols = cls.size >= 50 ? 10 : 5;
          const rows = Math.ceil(cls.size / cols);
          const first = ALL_STUDENTS.find((s) => s.classIndex === CLASSES.indexOf(cls));
          if (!first) return null;
          const blockCenterX = first.x + ((cols - 1) * DX) / 2;
          const topY = FLOOR_Y - (rows - 1) * DY;
          const labelY = topY - R - 10;
          return (
            <text
              key={cls.label}
              x={blockCenterX}
              y={labelY}
              fontSize={13}
              fontWeight="bold"
              fill={cls.color}
              textAnchor="middle"
            >
              {cls.label} ({cls.size})
            </text>
          );
        })}

        {phase !== 'idle' &&
          selected.map((student) => (
            <circle
              key={`ring-${student.id}`}
              cx={student.x}
              cy={student.y}
              r={R + 3}
              fill="none"
              stroke="#1e293b"
              strokeWidth={2}
            />
          ))}

        {(phase === 'flying' || phase === 'done') &&
          selected.map((student, i) => {
            const start = { x: student.x, y: student.y - R - 10 };
            const end = targetSlot(i);
            const pos =
              phase === 'flying'
                ? { x: lerp(start.x, end.x, progress), y: lerp(start.y, end.y, progress) }
                : end;
            return (
              <text
                key={`label-${student.id}`}
                x={pos.x}
                y={pos.y}
                fontSize={13}
                fontWeight="bold"
                fill={student.color}
                textAnchor="middle"
              >
                {student.size}
              </text>
            );
          })}

        {average !== null && (
          <text
            x={W / 2}
            y={TOP_ROW_Y - 20}
            fontSize={15}
            fontWeight="bold"
            fill="#1e293b"
            textAnchor="middle"
          >
            Average reported class size: {average.toFixed(2)}
          </text>
        )}
      </svg>
      <button
        onClick={handleSurvey}
        disabled={phase === 'revealed' || phase === 'flying'}
        className={`${styles.button} ${styles['button--primary']}`}
      >
        Survey 20 people
      </button>
    </div>
  );
}
