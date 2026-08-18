import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import type { Point2D } from '../regression';
import styles from './LeverageScatterPlot.module.css';

const BLUE = '#2563eb';

interface PredictorCloudPlotProps {
  basePoints: Point2D[];
  extraPoint: Point2D;
  pointColor: string;
  title: string;
  xyRange: [number, number];
}

// a plain top-down (x, y) scatter of the predictor cloud, with no fitted line —
// used to show where a point sits in predictor space before jumping into the 3D fit
export default function PredictorCloudPlot({ basePoints, extraPoint, pointColor, title, xyRange }: PredictorCloudPlotProps) {
  const data: Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: basePoints.map((p) => p.x),
      y: basePoints.map((p) => p.y),
      marker: { color: BLUE, size: 7, opacity: 0.7 },
      hoverinfo: 'skip',
    },
    {
      type: 'scatter',
      mode: 'markers',
      x: [extraPoint.x],
      y: [extraPoint.y],
      marker: { color: pointColor, size: 13, line: { color: '#ffffff', width: 1.5 } },
      hoverinfo: 'skip',
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 40, r: 20, t: 10, b: 40 },
    xaxis: { range: xyRange, zeroline: false, gridcolor: '#e2e8f0', title: { text: 'x' } },
    yaxis: { range: xyRange, zeroline: false, gridcolor: '#e2e8f0', title: { text: 'y' }, scaleanchor: 'x' },
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
