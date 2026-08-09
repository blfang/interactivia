const W = 200;
const H = 150;
const PADDING = { left: 30, right: 20, top: 25, bottom: 30 };
const PLOT_W = W - PADDING.left - PADDING.right;
const PLOT_H = H - PADDING.top - PADDING.bottom;
const AXIS_Y = PADDING.top + PLOT_H;
const MAX_VALUE = 120;
const TARGET = 20;
const THRESHOLD = 50;

interface Person {
  label: string;
  value: number;
  color: string;
}

const PEOPLE: Person[] = [
  { label: 'A', value: 10, color: '#3b82f6' },
  { label: 'B', value: 30, color: '#10b981' },
  { label: 'C', value: 40, color: '#f59e0b' },
  { label: 'D', value: 60, color: '#ef4444' },
  { label: 'E', value: 80, color: '#8b5cf6' },
];

const mean = PEOPLE.reduce((s, p) => s + p.value, 0) / PEOPLE.length;

function valueToX(value: number): number {
  return PADDING.left + (value / MAX_VALUE) * PLOT_W;
}

export default function Preview() {
  const tX = valueToX(TARGET);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Threshold shaded region */}
      <rect
        x={valueToX(THRESHOLD)}
        y={PADDING.top}
        width={W - PADDING.right - valueToX(THRESHOLD)}
        height={PLOT_H}
        fill="#eff6ff"
      />

      {/* Axis */}
      <line
        x1={PADDING.left}
        y1={AXIS_Y}
        x2={W - PADDING.right}
        y2={AXIS_Y}
        stroke="#94a3b8"
        strokeWidth="2"
      />

      {/* Target line */}
      <line
        x1={tX}
        y1={PADDING.top}
        x2={tX}
        y2={AXIS_Y}
        stroke="#16a34a"
        strokeWidth="2"
      />

      {/* Mean line */}
      <line
        x1={valueToX(mean)}
        y1={PADDING.top}
        x2={valueToX(mean)}
        y2={AXIS_Y}
        stroke="#000000"
        strokeWidth="1.5"
        strokeDasharray="2,4"
      />

      {/* Axis ticks */}
      {[0, 20, 40, 60, 80, 100, 120].map((v) => (
        <g key={v}>
          <line
            x1={valueToX(v)}
            y1={AXIS_Y - 4}
            x2={valueToX(v)}
            y2={AXIS_Y + 4}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <text
            x={valueToX(v)}
            y={AXIS_Y + 14}
            fill="#64748b"
            fontSize="8"
            textAnchor="middle"
          >
            ${v}
          </text>
        </g>
      ))}

      {/* People */}
      {PEOPLE.map((person, i) => {
        const x = valueToX(person.value);
        const labelY = PADDING.top + 4 + i * 12;
        return (
          <g key={i}>
            {/* Dashed vertical line */}
            <line
              x1={x}
              y1={labelY + 6}
              x2={x}
              y2={AXIS_Y}
              stroke={person.color + '40'}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Person dot */}
            <circle cx={x} cy={AXIS_Y} r="5" fill={person.color} />
            {/* Label */}
            <rect
              x={x - 10}
              y={labelY}
              width={20}
              height={9}
              rx="3"
              fill={person.color}
            />
            <text
              x={x}
              y={labelY + 7}
              fill="#ffffff"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
            >
              {person.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}