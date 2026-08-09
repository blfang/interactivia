import { Fragment } from 'react';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  PointerEventHandler,
  ReactNode,
  Ref,
} from 'react';
import styles from './plotShared.module.css';

export interface Point {
  x: number;
  y: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Scale {
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
}

export function makeScale(
  maxX: number,
  maxY: number,
  margin: Margin,
  plotW: number,
  plotH: number
): Scale {
  return {
    toSvgX: (x) => margin.left + (x / maxX) * plotW,
    toSvgY: (y) => margin.top + plotH - (y / maxY) * plotH,
  };
}

// Styles moved to plotShared.module.css

export function PlotCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      {children}
      {badge && (
        <div className={styles.badge}>
          {badge}
        </div>
      )}
    </div>
  );
}

export interface MarkerSpec {
  id: string;
  color: string;
}

interface PlotFrameProps {
  width: number;
  height: number;
  margin: Margin;
  plotW: number;
  plotH: number;
  scale: Scale;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  yLabelX?: number;
  markers: MarkerSpec[];
  shadeYGreaterThanX?: { max: number };
  svgRef?: Ref<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
  svgStyle?: CSSProperties;
  children: ReactNode;
}

export function PlotFrame({
  width,
  height,
  margin,
  plotW,
  plotH,
  scale,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  yLabelX = 16,
  markers,
  shadeYGreaterThanX,
  svgRef,
  onPointerMove,
  onPointerUp,
  svgStyle,
  children,
}: PlotFrameProps) {
  const { toSvgX, toSvgY } = scale;
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={svgStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <defs>
        {markers.map((m) => (
          <marker
            key={m.id}
            id={m.id}
            markerWidth="18"
            markerHeight="18"
            refX="15"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L16,4 L0,8 Z" fill={m.color} />
          </marker>
        ))}
      </defs>

      {/* gridlines */}
      {xTicks.map((t) => (
        <line
          key={`grid-x-${t}`}
          x1={toSvgX(t)}
          y1={margin.top}
          x2={toSvgX(t)}
          y2={margin.top + plotH}
          stroke="#e2e8f0"
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`grid-y-${t}`}
          x1={margin.left}
          y1={toSvgY(t)}
          x2={margin.left + plotW}
          y2={toSvgY(t)}
          stroke="#e2e8f0"
        />
      ))}

      {/* shade region y > x */}
      {shadeYGreaterThanX && (
        <>
          <polygon
            points={[
              `${toSvgX(0)},${toSvgY(0)}`,
              `${toSvgX(shadeYGreaterThanX.max)},${toSvgY(shadeYGreaterThanX.max)}`,
              `${toSvgX(0)},${toSvgY(shadeYGreaterThanX.max)}`,
            ].join(' ')}
            fill="#f1f5f9"
          />
          <line
            x1={toSvgX(0)}
            y1={toSvgY(0)}
            x2={toSvgX(shadeYGreaterThanX.max)}
            y2={toSvgY(shadeYGreaterThanX.max)}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        </>
      )}

      {/* axes */}
      <line
        x1={margin.left}
        y1={margin.top + plotH}
        x2={margin.left + plotW}
        y2={margin.top + plotH}
        stroke="#475569"
      />
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={margin.top + plotH}
        stroke="#475569"
      />

      {/* tick labels */}
      {xTicks.map((t) => (
        <text
          key={`label-x-${t}`}
          x={toSvgX(t)}
          y={margin.top + plotH + 17}
          fontSize={11}
          fill="#64748b"
          textAnchor="middle"
        >
          {t}
        </text>
      ))}
      {yTicks.map((t) => (
        <text
          key={`label-y-${t}`}
          x={margin.left - 9}
          y={toSvgY(t) + 4}
          fontSize={11}
          fill="#64748b"
          textAnchor="end"
        >
          {t}
        </text>
      ))}

      {/* axis labels */}
      <text
        x={margin.left + plotW / 2}
        y={height - 3}
        fontSize={13}
        fill="#334155"
        textAnchor="middle"
        fontStyle="italic"
      >
        {xLabel}
      </text>
      <text
        x={yLabelX}
        y={margin.top + plotH / 2}
        fontSize={13}
        fill="#334155"
        textAnchor="middle"
        fontStyle="italic"
        transform={`rotate(-90 ${yLabelX} ${margin.top + plotH / 2})`}
      >
        {yLabel}
      </text>

      {children}
    </svg>
  );
}

export interface TableColumn {
  key: string;
  label: string;
  color: string;
}

export interface TableRow {
  group: string;
  values: Record<string, Point>;
}

export function ValueTable({
  columns,
  rows,
  decimals = 2,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  decimals?: number;
}) {
  const ratioOf = (p: Point): number | undefined =>
    p.x === 0 ? undefined : p.y / p.x;

  const formatCell = (p: Point): string =>
    p.x === 0 ? '\u2014' : `${p.y} / ${p.x} = ${(p.y / p.x).toFixed(decimals)}`;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Group</th>
          {columns.map((c) => (
            <th key={c.key} className={`${styles.th} ${styles.thRight}`}>
              <span className={styles.swap}>
                <span className={styles.dot} style={{ background: c.color }} />
                {c.label}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const ratios = columns.map((c) => ({
            key: c.key,
            ratio: ratioOf(row.values[c.key]),
          }));
          const defined = ratios.filter((r) => r.ratio !== undefined);
          let maxKey: string | undefined;
          if (defined.length > 0) {
            const maxRatio = Math.max(...defined.map((d) => d.ratio as number));
            const winners = defined.filter((d) => d.ratio === maxRatio);
            if (winners.length === 1) maxKey = winners[0].key;
          }
          return (
            <tr key={row.group}>
              <td className={styles.td}>{row.group}</td>
              {columns.map((c) => {
                const color = maxKey === c.key ? c.color : undefined;
                return (
                  <td key={c.key} className={`${styles.td} ${styles.tdRight}`} style={{ color }}>
                    {formatCell(row.values[c.key])}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export interface CombinedArrowSpec {
  color: string;
  markerId: string;
  combined: Point;
  segments: { from: Point; to: Point }[];
}

export function CombinedArrows({
  arrows,
  scale,
}: {
  arrows: CombinedArrowSpec[];
  scale: Scale;
}) {
  const { toSvgX, toSvgY } = scale;
  return (
    <>
      {arrows.map((a, i) => (
        <line
          key={`dashed-${i}`}
          x1={toSvgX(0)}
          y1={toSvgY(0)}
          x2={toSvgX(a.combined.x)}
          y2={toSvgY(a.combined.y)}
          stroke={a.color}
          strokeWidth={2.5}
          strokeDasharray="6 4"
          opacity={0.5}
          markerEnd={`url(#${a.markerId})`}
        />
      ))}
      {arrows.map((a, i) =>
        a.segments.map((seg, k) => (
          <line
            key={`seg-${i}-${k}`}
            x1={toSvgX(seg.from.x)}
            y1={toSvgY(seg.from.y)}
            x2={toSvgX(seg.to.x)}
            y2={toSvgY(seg.to.y)}
            stroke={a.color}
            strokeWidth={2.5}
            markerEnd={`url(#${a.markerId})`}
          />
        ))
      )}
    </>
  );
}

export function PlotLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      {children}
    </div>
  );
}

export function PlotRow({ children }: { children: ReactNode }) {
  return (
    <div className={styles.row}>
      {children}
    </div>
  );
}

export interface ArrowPlotSeries {
  key: string;
  color: string;
}

export interface ExtraArrowSpec {
  key: string;
  seriesKey: string;
  color: string;
  from: Point;
  to: Point;
  dashed?: boolean;
}

export interface TipLabelSpec {
  key: string;
  text: string;
  point: Point;
  dx: number;
  dy: number;
  anchor: 'start' | 'middle' | 'end';
  color: string;
}

export interface DraggableTipSpec {
  key: string;
  point: Point;
  color: string;
  isDragging: boolean;
  onPointerDown: (e: ReactPointerEvent<SVGCircleElement>) => void;
}

interface ArrowPlotViewProps {
  title: string;
  badge?: string;
  width: number;
  height: number;
  margin: Margin;
  xMax: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  yLabelX?: number;
  markerPrefix: string;
  plotIndex?: number;
  series: ArrowPlotSeries[];
  points: Record<string, Point>;
  showOriginArrows?: boolean;
  extraArrows?: ExtraArrowSpec[];
  labels?: TipLabelSpec[];
  draggableTips?: DraggableTipSpec[];
  shadeYGreaterThanX?: { max: number };
  svgRef?: Ref<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
  svgStyle?: CSSProperties;
}

export function ArrowPlotView({
  title,
  badge,
  width,
  height,
  margin,
  xMax,
  yMax,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  yLabelX = 16,
  markerPrefix,
  plotIndex,
  series,
  points,
  showOriginArrows = true,
  extraArrows,
  labels,
  draggableTips,
  shadeYGreaterThanX,
  svgRef,
  onPointerMove,
  onPointerUp,
  svgStyle,
}: ArrowPlotViewProps) {
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const scale = makeScale(xMax, yMax, margin, plotW, plotH);
  const { toSvgX, toSvgY } = scale;
  const markerId = (key: string) =>
    `${markerPrefix}-${key}-${plotIndex ?? 'static'}`;
  const MIN_HEAD_DIST = 8;
  const TIP_R = 14;

  return (
    <PlotCard title={title} badge={badge}>
      <PlotFrame
        width={width}
        height={height}
        margin={margin}
        plotW={plotW}
        plotH={plotH}
        scale={scale}
        xTicks={xTicks}
        yTicks={yTicks}
        xLabel={xLabel}
        yLabel={yLabel}
        yLabelX={yLabelX}
        markers={series.map((s) => ({ id: markerId(s.key), color: s.color }))}
        shadeYGreaterThanX={shadeYGreaterThanX}
        svgRef={svgRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        svgStyle={svgStyle}
      >
        {/* origin arrows */}
        {showOriginArrows &&
          series.map((s) => {
            const p = points[s.key];
            if (!p) return null;
            const lenSq = p.x * p.x + p.y * p.y;
            return (
              <line
                key={`origin-${s.key}`}
                x1={toSvgX(0)}
                y1={toSvgY(0)}
                x2={toSvgX(p.x)}
                y2={toSvgY(p.y)}
                stroke={s.color}
                strokeWidth={2.5}
                markerEnd={
                  lenSq >= MIN_HEAD_DIST * MIN_HEAD_DIST
                    ? `url(#${markerId(s.key)})`
                    : undefined
                }
              />
            );
          })}

        {/* extra (concatenated / segment) arrows */}
        {extraArrows?.map((a) => {
          const dx = a.to.x - a.from.x;
          const dy = a.to.y - a.from.y;
          const lenSq = dx * dx + dy * dy;
          const showHead = lenSq >= MIN_HEAD_DIST * MIN_HEAD_DIST;
          return (
            <line
              key={`extra-${a.key}`}
              x1={toSvgX(a.from.x)}
              y1={toSvgY(a.from.y)}
              x2={toSvgX(a.to.x)}
              y2={toSvgY(a.to.y)}
              stroke={a.color}
              strokeWidth={2.5}
              strokeDasharray={a.dashed ? '6 4' : undefined}
              opacity={a.dashed ? 0.5 : 1}
              markerEnd={
                showHead ? `url(#${markerId(a.seriesKey)})` : undefined
              }
            />
          );
        })}

        {/* tip labels */}
        {labels?.map((l) => (
          <text
            key={`label-${l.key}`}
            x={toSvgX(l.point.x) + l.dx}
            y={toSvgY(l.point.y) + l.dy}
            fontSize={12}
            fontWeight={600}
            fill={l.color}
            textAnchor={l.anchor}
            stroke="#ffffff"
            strokeWidth={3}
            className={styles.tipLabel}
          >
            {l.text}
          </text>
        ))}

        {/* draggable tips */}
        {draggableTips?.map((t) => (
          <Fragment key={`tip-${t.key}`}>
            <circle
              cx={toSvgX(t.point.x)}
              cy={toSvgY(t.point.y)}
              r={TIP_R}
              fill="transparent"
              className={t.isDragging ? styles.cursorGrabbing : styles.cursorGrab}
              onPointerDown={t.onPointerDown}
            />
            <circle
              cx={toSvgX(t.point.x)}
              cy={toSvgY(t.point.y)}
              r={5}
              fill={t.color}
              stroke="#ffffff"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          </Fragment>
        ))}
      </PlotFrame>
    </PlotCard>
  );
}
