const W = 200;
const H = 150;
const PADDING = { left: 15, right: 15, top: 40, bottom: 30 };
const AXIS_Y = H - PADDING.bottom;
const BRACKET_Y = AXIS_Y - 16;

const ARRIVAL_TIMES = [20, 55, 75, 130, 165].map((t) => t + PADDING.left);
const STAR_X = 115;

export default function Preview() {
  let prev = PADDING.left;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Axis */}
      <line
        x1={PADDING.left}
        y1={AXIS_Y}
        x2={W - PADDING.right}
        y2={AXIS_Y}
        stroke="#94a3b8"
        strokeWidth="2"
      />

      {/* Arrivals + interval brackets */}
      {ARRIVAL_TIMES.map((x, i) => {
        const prevX = prev;
        const midX = (x + prevX) / 2;
        prev = x;
        const isGreen = STAR_X > prevX && STAR_X <= x;
        const color = isGreen ? '#16a34a' : '#2563eb';
        return (
          <g key={i}>
            <line x1={prevX} y1={BRACKET_Y} x2={x} y2={BRACKET_Y} stroke={color} strokeWidth="1.5" />
            <line x1={prevX} y1={BRACKET_Y - 3} x2={prevX} y2={BRACKET_Y + 3} stroke={color} strokeWidth="1.5" />
            <line x1={x} y1={BRACKET_Y - 3} x2={x} y2={BRACKET_Y + 3} stroke={color} strokeWidth="1.5" />
            <text x={midX} y={BRACKET_Y - 6} fontSize="7" fill={color} textAnchor="middle">
              {((x - prevX) / 20).toFixed(1)}
            </text>
            <circle cx={x} cy={AXIS_Y} r="4" fill="#2563eb" />
          </g>
        );
      })}

      {/* 10am star */}
      <text
        x={STAR_X}
        y={(BRACKET_Y + AXIS_Y) / 2}
        fontSize="9"
        fill="#16a34a"
        textAnchor="middle"
        dominantBaseline="central"
      >
        ★
      </text>
    </svg>
  );
}
