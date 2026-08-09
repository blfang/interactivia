import { Fragment } from 'react';
import {
  makeScale,
  PlotCard,
  PlotFrame,
  PlotLayout,
  PlotRow,
  ValueTable,
  type Margin,
  type Point,
} from './plotShared';
import styles from './plotShared.module.css';

export interface ScenarioSeries {
  key: string;
  label: string;
  tipLabel?: string;
  color: string;
}

export interface ScenarioLabelSpec {
  dx: number;
  dy: number;
  anchor: 'start' | 'middle' | 'end';
}

export interface ScenarioPlotData {
  title: string;
  series: Record<string, { point: Point; label: ScenarioLabelSpec }>;
  segments?: Record<string, Point[]>;
}

export interface ScenarioConfig {
  sizeX: number;
  sizeY: number;
  margin: Margin;
  xMax: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  markerPrefix: string;
  series: ScenarioSeries[];
  plots: ScenarioPlotData[];
  decimals?: number;
}

export function ScenarioPlot({ config }: { config: ScenarioConfig }) {
  const {
    sizeX,
    sizeY,
    margin,
    xMax,
    yMax,
    xTicks,
    yTicks,
    xLabel,
    yLabel,
    markerPrefix,
    series,
    plots,
    decimals = 2,
  } = config;
  const plotW = sizeX - margin.left - margin.right;
  const plotH = sizeY - margin.top - margin.bottom;
  const scale = makeScale(xMax, yMax, margin, plotW, plotH);
  const { toSvgX, toSvgY } = scale;

  const markerId = (seriesKey: string, index: number) =>
    `${markerPrefix}-${seriesKey}-${index}`;

  const renderPlot = (plot: ScenarioPlotData, index: number) => {
    const markers = series.map((s) => ({
      id: markerId(s.key, index),
      color: s.color,
    }));
    return (
      <PlotCard title={plot.title}>
        <PlotFrame
          width={sizeX}
          height={sizeY}
          margin={margin}
          plotW={plotW}
          plotH={plotH}
          scale={scale}
          xTicks={xTicks}
          yTicks={yTicks}
          xLabel={xLabel}
          yLabel={yLabel}
          markers={markers}
          shadeYGreaterThanX={{ max: Math.min(xMax, yMax) }}
        >
          {plot.segments
            ? series.map((s) => {
                const pts = plot.segments![s.key];
                const last = pts[pts.length - 1];
                return (
                  <Fragment key={s.key}>
                    {/* dashed resultant from origin to the combined tip */}
                    <line
                      x1={toSvgX(0)}
                      y1={toSvgY(0)}
                      x2={toSvgX(last.x)}
                      y2={toSvgY(last.y)}
                      stroke={s.color}
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      opacity={0.5}
                      markerEnd={`url(#${markerId(s.key, index)})`}
                    />
                    {/* solid segments connecting consecutive points */}
                    {pts.slice(0, -1).map((p, k) => (
                      <line
                        key={`seg-${k}`}
                        x1={toSvgX(p.x)}
                        y1={toSvgY(p.y)}
                        x2={toSvgX(pts[k + 1].x)}
                        y2={toSvgY(pts[k + 1].y)}
                        stroke={s.color}
                        strokeWidth={2.5}
                        markerEnd={`url(#${markerId(s.key, index)})`}
                      />
                    ))}
                  </Fragment>
                );
              })
            : series.map((s) => {
                const pt = plot.series[s.key].point;
                return (
                  <line
                    key={s.key}
                    x1={toSvgX(0)}
                    y1={toSvgY(0)}
                    x2={toSvgX(pt.x)}
                    y2={toSvgY(pt.y)}
                    stroke={s.color}
                    strokeWidth={2.5}
                    markerEnd={`url(#${markerId(s.key, index)})`}
                  />
                );
              })}

          {/* labels at the tips */}
          {series.map((s) => {
            const { point, label } = plot.series[s.key];
            const sx = toSvgX(point.x);
            const sy = toSvgY(point.y);
            const tip = s.tipLabel ?? s.label;
            return (
              <text
                key={`label-${s.key}`}
                x={sx + label.dx}
                y={sy + label.dy}
                fontSize={12}
                fontWeight={600}
                fill={s.color}
                textAnchor={label.anchor}
                stroke="#ffffff"
                strokeWidth={3}
                className={styles.tipLabel}
              >
                {`${tip} ${point.y}/${point.x}`}
              </text>
            );
          })}
        </PlotFrame>
      </PlotCard>
    );
  };

  const tableColumns = series.map((s) => ({
    key: s.key,
    label: s.label,
    color: s.color,
  }));
  const tableRows = plots.map((p) => {
    const values: Record<string, Point> = {};
    for (const s of series) values[s.key] = p.series[s.key].point;
    return { group: p.title, values };
  });

  const lastIndex = plots.length - 1;

  return (
    <PlotLayout>
      {plots.slice(0, lastIndex).map((p, i) => (
        <Fragment key={p.title}>{renderPlot(p, i)}</Fragment>
      ))}
      <PlotRow>
        {renderPlot(plots[lastIndex], lastIndex)}
        <ValueTable columns={tableColumns} rows={tableRows} decimals={decimals} />
      </PlotRow>
    </PlotLayout>
  );
}