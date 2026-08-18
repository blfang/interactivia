import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { fitPlaneRegression, type Point3D } from '../regression';
import styles from './LeverageScatterPlot.module.css';

const BLUE = '#2563eb';

const GRID_N = 12;

export type SceneCamera = NonNullable<NonNullable<Layout['scene']>['camera']>;

export const DEFAULT_CAMERA: SceneCamera = { eye: { x: 1.6, y: -1.6, z: 1.1 } };

interface Leverage3DPlotProps {
  basePoints: Point3D[];
  extraPoint: Point3D;
  pointColor: string;
  title: string;
  xyRange: [number, number];
  zRange: [number, number];
  camera: SceneCamera;
  onCameraChange: (camera: SceneCamera) => void;
}

export default function Leverage3DPlot({
  basePoints,
  extraPoint,
  pointColor,
  title,
  xyRange,
  zRange,
  camera,
  onCameraChange,
}: Leverage3DPlotProps) {
  const { a, b, c } = fitPlaneRegression([...basePoints, extraPoint]);

  const [lo, hi] = xyRange;
  const grid = Array.from({ length: GRID_N }, (_, i) => lo + (i / (GRID_N - 1)) * (hi - lo));
  const surfaceZ = grid.map((y) => grid.map((x) => a * x + b * y + c));

  const data: Data[] = [
    {
      type: 'surface',
      x: grid,
      y: grid,
      z: surfaceZ,
      showscale: false,
      opacity: 0.6,
      colorscale: [
        [0, '#cbd5e1'],
        [1, '#cbd5e1'],
      ],
      hoverinfo: 'skip',
    },
    {
      type: 'scatter3d',
      mode: 'markers',
      x: basePoints.map((p) => p.x),
      y: basePoints.map((p) => p.y),
      z: basePoints.map((p) => p.z),
      marker: { color: BLUE, size: 4, opacity: 0.8 },
      hoverinfo: 'skip',
    },
    {
      type: 'scatter3d',
      mode: 'markers',
      x: [extraPoint.x],
      y: [extraPoint.y],
      z: [extraPoint.z],
      marker: { color: pointColor, size: 7, line: { color: '#ffffff', width: 1 } },
      hoverinfo: 'skip',
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 0, r: 0, t: 10, b: 0 },
    scene: {
      xaxis: { range: xyRange, title: { text: 'x' } },
      yaxis: { range: xyRange, title: { text: 'y' } },
      zaxis: { range: zRange, title: { text: 'z' } },
      camera,
      aspectmode: 'cube',
    },
    paper_bgcolor: 'transparent',
    showlegend: false,
  };

  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}</span>
      <div className={styles.plotBox}>
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          onRelayout={(event) => {
            const newCamera = (event as Record<string, unknown>)['scene.camera'] as SceneCamera | undefined;
            if (newCamera) onCameraChange(newCamera);
          }}
        />
      </div>
    </div>
  );
}
