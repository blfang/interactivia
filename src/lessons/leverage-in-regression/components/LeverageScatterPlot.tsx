import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { fitSimpleLinearRegression, type Point2D } from '../regression';
import styles from './LeverageScatterPlot.module.css';

const BLUE = '#2563eb';
const ORANGE = '#ea580c';
const GRAY = '#64748b';

interface LeverageScatterPlotProps {
  basePoints: Point2D[];
  extraPoint: Point2D;
  title: string;
  xRange: [number, number];
  yRange: [number, number];
}

export default function LeverageScatterPlot({
  basePoints,
  extraPoint,
  title,
  xRange,
  yRange,
}: LeverageScatterPlotProps) {
  const { slope, intercept } = fitSimpleLinearRegression([...basePoints, extraPoint]);
  const lineX = xRange;
  const lineY: [number, number] = [slope * lineX[0] + intercept, slope * lineX[1] + intercept];

  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: basePoints.map((p) => p.x),
      y: basePoints.map((p) => p.y),
      marker: { color: BLUE, size: 7, opacity: 0.7 },
      name: 'Data',
      hoverinfo: 'skip',
    },
    {
      type: 'scatter',
      mode: 'lines',
      x: lineX,
      y: lineY,
      line: { color: GRAY, width: 3 },
      name: 'Fitted line',
      hoverinfo: 'skip',
    },
    {
      type: 'scatter',
      mode: 'markers',
      x: [extraPoint.x],
      y: [extraPoint.y],
      marker: { color: ORANGE, size: 13, line: { color: '#ffffff', width: 1.5 } },
      name: 'Special point',
      hoverinfo: 'skip',
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 40, r: 20, t: 10, b: 40 },
    xaxis: { range: xRange, zeroline: false, gridcolor: '#e2e8f0' },
    yaxis: { range: yRange, zeroline: false, gridcolor: '#e2e8f0' },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: false,
  };

  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}</span>
      <div className={styles.plotBox}>
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, staticPlot: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
