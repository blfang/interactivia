import { useRef, useState, useEffect } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  makeScale,
  PlotCard,
  PlotFrame,
  PlotLayout,
  PlotRow,
  ValueTable,
  type Point,
} from './plotShared';
import styles from './plotShared.module.css';
import { COLOR_PRIMARY as BLUE, COLOR_SUCCESS as GREEN } from '../../../styles/colors';

const SIZE = 300;
const MARGIN = { top: 8, right: 18, bottom: 36, left: 40 };
const PLOT_W = SIZE - MARGIN.left - MARGIN.right;
const PLOT_H = SIZE - MARGIN.top - MARGIN.bottom;
const TIP_R = 14;
const MIN_HEAD_DIST = 8;

interface Points {
  blue: Point;
  green: Point;
}

interface ArrowSpec {
  color: Color;
  from: Point;
  to: Point;
  dashed?: boolean;
}

type Color = 'blue' | 'green';

interface DragState {
  plot: 0 | 1;
  color: Color;
}

interface PlotConfig {
  title: string;
  max: number;
  ticks: number[];
}

const PLOT_CONFIGS: PlotConfig[] = [
  { title: 'Group 1', max: 50, ticks: [0, 10, 20, 30, 40, 50] },
  { title: 'Group 2', max: 50, ticks: [0, 10, 20, 30, 40, 50] },
  { title: 'Combined', max: 100, ticks: [0, 20, 40, 60, 80, 100] },
];

const INITIAL_PLOT1: Points = {
  blue: { x: 35, y: 20 },
  green: { x: 40, y: 10 },
};

const INITIAL_PLOT2: Points = {
  blue: { x: 40, y: 25 },
  green: { x: 30, y: 10 },
};

interface PlotViewProps {
  config: PlotConfig;
  points: Points;
  draggable?: boolean;
  plotIndex?: 0 | 1;
  drag?: DragState | null;
  extraArrows?: ArrowSpec[];
  badge?: string;
  onDragStart?: (color: Color) => void;
  onDragMove?: (plot: 0 | 1, color: Color, point: Point) => void;
  onDragEnd?: () => void;
}

function PlotView({
  config,
  points,
  draggable = false,
  plotIndex,
  drag,
  extraArrows,
  badge,
  onDragStart,
  onDragMove,
  onDragEnd,
}: PlotViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { title, max, ticks } = config;
  const scale = makeScale(max, max, MARGIN, PLOT_W, PLOT_H);
  const { toSvgX, toSvgY } = scale;

  const handleTipPointerDown = (
    color: Color,
    e: ReactPointerEvent<SVGCircleElement>
  ) => {
    if (!draggable || plotIndex === undefined) return;
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    onDragStart?.(color);
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag || plotIndex === undefined || drag.plot !== plotIndex) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * SIZE;
    const svgY = ((e.clientY - rect.top) / rect.height) * SIZE;

    // snap to integer coordinate values
    let x = Math.round(((svgX - MARGIN.left) / PLOT_W) * max);
    let y = Math.round(((MARGIN.top + PLOT_H - svgY) / PLOT_H) * max);

    // clamp to the plot range
    x = Math.min(max, Math.max(0, x));
    y = Math.min(max, Math.max(0, y));

    // keep the tip out of the gray region (y > x)
    y = Math.min(x, y);

    // disallow the origin; nudge x over if the point is exactly (0, 0)
    if (x === 0 && y === 0) {
      x = 1;
    }

    // enforce slope_blue > slope_green strictly (skip if either point is at the origin)
    const other = drag.color === 'blue' ? points.green : points.blue;
    const atOrigin = (p: Point) => p.x === 0 && p.y === 0;
    if (x > 0 && !atOrigin({ x, y }) && !atOrigin(other)) {
      if (drag.color === 'blue') {
        // blue slope must be strictly greater than the green slope
        y = Math.min(max, Math.max(y, Math.ceil((other.y / other.x) * x) + 1));
      } else {
        // green slope must be strictly less than the blue slope
        y = Math.max(0, Math.min(y, Math.floor((other.y / other.x) * x) - 1));
      }
    }

    onDragMove?.(plotIndex, drag.color, { x, y });
  };

  const handlePointerUp = () => {
    if (!drag) return;
    onDragEnd?.();
  };

  const isDragging = (color: Color): boolean =>
    drag != null && drag.plot === plotIndex && drag.color === color;

  return (
    <PlotCard title={title} badge={badge}>
      <PlotFrame
        width={SIZE}
        height={SIZE}
        margin={MARGIN}
        plotW={PLOT_W}
        plotH={PLOT_H}
        scale={scale}
        xTicks={ticks}
        yTicks={ticks}
        xLabel="x"
        yLabel="y"
        yLabelX={14}
        markers={[
          { id: `arrowhead-blue-${plotIndex ?? 'static'}`, color: BLUE },
          { id: `arrowhead-green-${plotIndex ?? 'static'}`, color: GREEN },
        ]}
        shadeYGreaterThanX={{ max }}
        svgRef={svgRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        svgStyle={{ touchAction: 'none' }}
      >
        {/* arrows */}
        <line
          x1={toSvgX(0)}
          y1={toSvgY(0)}
          x2={toSvgX(points.blue.x)}
          y2={toSvgY(points.blue.y)}
          stroke={BLUE}
          strokeWidth={2.5}
          markerEnd={
            points.blue.x * points.blue.x + points.blue.y * points.blue.y >=
            MIN_HEAD_DIST * MIN_HEAD_DIST
              ? `url(#arrowhead-blue-${plotIndex ?? 'static'})`
              : undefined
          }
        />
        <line
          x1={toSvgX(0)}
          y1={toSvgY(0)}
          x2={toSvgX(points.green.x)}
          y2={toSvgY(points.green.y)}
          stroke={GREEN}
          strokeWidth={2.5}
          markerEnd={
            points.green.x * points.green.x + points.green.y * points.green.y >=
            MIN_HEAD_DIST * MIN_HEAD_DIST
              ? `url(#arrowhead-green-${plotIndex ?? 'static'})`
              : undefined
          }
        />

        {/* concatenated arrows from plot 2, starting at plot 1 tips */}
        {extraArrows?.map((arrow, j) => {
          const dx = arrow.to.x - arrow.from.x;
          const dy = arrow.to.y - arrow.from.y;
          const lenSq = dx * dx + dy * dy;
          const showHead = lenSq >= MIN_HEAD_DIST * MIN_HEAD_DIST;
          return (
            <line
              key={`extra-${j}`}
              x1={toSvgX(arrow.from.x)}
              y1={toSvgY(arrow.from.y)}
              x2={toSvgX(arrow.to.x)}
              y2={toSvgY(arrow.to.y)}
              stroke={arrow.color === 'blue' ? BLUE : GREEN}
              strokeWidth={2.5}
              strokeDasharray={arrow.dashed ? '6 4' : undefined}
              opacity={arrow.dashed ? 0.5 : 1}
              markerEnd={
                showHead
                  ? `url(#arrowhead-${arrow.color}-${plotIndex ?? 'static'})`
                  : undefined
              }
            />
          );
        })}

        {/* draggable tips */}
        {draggable && plotIndex !== undefined && (
          <>
            <circle
              cx={toSvgX(points.blue.x)}
              cy={toSvgY(points.blue.y)}
              r={TIP_R}
              fill="transparent"
              className={isDragging('blue') ? styles.cursorGrabbing : styles.cursorGrab}
              onPointerDown={(e) => handleTipPointerDown('blue', e)}
            />
            <circle
              cx={toSvgX(points.blue.x)}
              cy={toSvgY(points.blue.y)}
              r={5}
              fill={BLUE}
              stroke="#ffffff"
              strokeWidth={1.5}
              pointerEvents="none"
            />
            <circle
              cx={toSvgX(points.green.x)}
              cy={toSvgY(points.green.y)}
              r={TIP_R}
              fill="transparent"
              className={isDragging('green') ? styles.cursorGrabbing : styles.cursorGrab}
              onPointerDown={(e) => handleTipPointerDown('green', e)}
            />
            <circle
              cx={toSvgX(points.green.x)}
              cy={toSvgY(points.green.y)}
              r={5}
              fill={GREEN}
              stroke="#ffffff"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          </>
        )}
      </PlotFrame>
    </PlotCard>
  );
}

export default function ArrowPlots({
  showTable = false,
  onParadoxChange,
}: {
  showTable?: boolean;
  onParadoxChange?: (paradox: boolean) => void;
}) {
  const [plot1, setPlot1] = useState<Points>(INITIAL_PLOT1);
  const [plot2, setPlot2] = useState<Points>(INITIAL_PLOT2);
  const [drag, setDrag] = useState<DragState | null>(null);

  const updatePoint = (plot: 0 | 1, color: Color, point: Point) => {
    const setter = plot === 0 ? setPlot1 : setPlot2;
    setter((prev) => ({ ...prev, [color]: point }));
  };

  const combinedArrows: ArrowSpec[] = [
    {
      color: 'blue',
      from: { x: 0, y: 0 },
      to: {
        x: plot1.blue.x + plot2.blue.x,
        y: plot1.blue.y + plot2.blue.y,
      },
      dashed: true,
    },
    {
      color: 'green',
      from: { x: 0, y: 0 },
      to: {
        x: plot1.green.x + plot2.green.x,
        y: plot1.green.y + plot2.green.y,
      },
      dashed: true,
    },
    {
      color: 'blue',
      from: plot1.blue,
      to: {
        x: plot1.blue.x + plot2.blue.x,
        y: plot1.blue.y + plot2.blue.y,
      },
    },
    {
      color: 'green',
      from: plot1.green,
      to: {
        x: plot1.green.x + plot2.green.x,
        y: plot1.green.y + plot2.green.y,
      },
    },
  ];

  const combinedBlue = {
    x: plot1.blue.x + plot2.blue.x,
    y: plot1.blue.y + plot2.blue.y,
  };
  const combinedGreen = {
    x: plot1.green.x + plot2.green.x,
    y: plot1.green.y + plot2.green.y,
  };
  const slopeOf = (p: Point): number | undefined =>
    p.x === 0 ? undefined : p.y / p.x;
  const blueSlope = slopeOf(combinedBlue);
  const greenSlope = slopeOf(combinedGreen);
  const paradox =
    blueSlope !== undefined &&
    greenSlope !== undefined &&
    greenSlope > blueSlope;

  useEffect(() => {
    onParadoxChange?.(paradox);
  }, [paradox, onParadoxChange]);

  const tableColumns = [
    { key: 'blue', label: 'Blue', color: BLUE },
    { key: 'green', label: 'Green', color: GREEN },
  ];
  const tableRows = [
    {
      group: 'Group 1',
      values: {
        blue: plot1.blue,
        green: plot1.green,
      },
    },
    {
      group: 'Group 2',
      values: {
        blue: plot2.blue,
        green: plot2.green,
      },
    },
    {
      group: 'Combined',
      values: {
        blue: combinedBlue,
        green: combinedGreen,
      },
    },
  ];

  return (
    <PlotLayout>
      <PlotView
        config={PLOT_CONFIGS[0]}
        points={plot1}
        draggable
        plotIndex={0}
        drag={drag}
        onDragStart={(color) => setDrag({ plot: 0, color })}
        onDragMove={updatePoint}
        onDragEnd={() => setDrag(null)}
      />
      <PlotView
        config={PLOT_CONFIGS[1]}
        points={plot2}
        draggable
        plotIndex={1}
        drag={drag}
        onDragStart={(color) => setDrag({ plot: 1, color })}
        onDragMove={updatePoint}
        onDragEnd={() => setDrag(null)}
      />
      {showTable ? (
        <PlotRow>
          <PlotView
            config={PLOT_CONFIGS[2]}
            points={plot1}
            draggable={false}
            extraArrows={combinedArrows}
            badge={paradox ? 'Paradox!' : undefined}
          />
          <ValueTable columns={tableColumns} rows={tableRows} />
        </PlotRow>
      ) : (
        <PlotView
          config={PLOT_CONFIGS[2]}
          points={plot1}
          draggable={false}
          extraArrows={combinedArrows}
          badge={paradox ? 'Paradox!' : undefined}
        />
      )}
    </PlotLayout>
  );
}