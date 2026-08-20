import { useEffect, useState } from 'react';
import Markdown from '../../../components/Markdown';
import Leverage3DPlot, { DEFAULT_CAMERA, type SceneCamera } from '../components/Leverage3DPlot';
import PredictorCloudPlot from '../components/PredictorCloudPlot';
import VerticalSlider from '../components/VerticalSlider';
import { generateCloud3D } from '../regression';
import type { StepProps } from '../../types';
import styles from './Step2.module.css';
import { COLOR_SUCCESS, COLOR_DANGER } from '../../../styles/colors';

const TRUE_A = 0.5;
const TRUE_B = -0.4;
const TRUE_C = 2;
const CLOUD_RADIUS = 3;

const LOW_LEVERAGE_OFFSET = { x: 1.5, y: 1 };
const HIGH_LEVERAGE_POINT = { x: 9, y: 9 };

const LOW_LEVERAGE_COLOR = COLOR_SUCCESS;
const HIGH_LEVERAGE_COLOR = COLOR_DANGER;

const XY_RANGE: [number, number] = [-10, 10];
const Z_RANGE: [number, number] = [-15, 20];
const SLIDER_MIN = -15;
const SLIDER_MAX = 15;

const trueZ = (p: { x: number; y: number }) => TRUE_A * p.x + TRUE_B * p.y + TRUE_C;

export default function Step2({ onCompleteChange }: StepProps) {
  const [basePoints] = useState(() => generateCloud3D(35, CLOUD_RADIUS, TRUE_A, TRUE_B, TRUE_C, 1.2));
  const [shift, setShift] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [camera, setCamera] = useState<SceneCamera>(DEFAULT_CAMERA);

  const sampleCentroid = {
    x: basePoints.reduce((sum, p) => sum + p.x, 0) / basePoints.length,
    y: basePoints.reduce((sum, p) => sum + p.y, 0) / basePoints.length,
  };
  const lowLeveragePoint = { x: sampleCentroid.x + LOW_LEVERAGE_OFFSET.x, y: sampleCentroid.y + LOW_LEVERAGE_OFFSET.y };

  useEffect(() => {
    onCompleteChange?.(interacted);
  }, [interacted, onCompleteChange]);

  return (
    <>
      <Markdown>{`
Leverage isn't just a 1D idea — it generalizes to any number of predictors. Here, points are drawn from an isotropic cloud around $(x, y) = (0, 0)$, with $z = ax + by + c + \\text{noise}$.

Here's the $(x, y)$ predictor cloud viewed from directly above, with the extra point placed near (but not exactly at) the center in the first plot, shown in green, and far from it in the second, shown in red:
      `}</Markdown>

      <div className={styles.scatterRow}>
        <PredictorCloudPlot
          title="Extra point near the cloud's center"
          basePoints={basePoints}
          extraPoint={lowLeveragePoint}
          pointColor={LOW_LEVERAGE_COLOR}
          xyRange={XY_RANGE}
        />
        <PredictorCloudPlot
          title="Extra point far from the cloud's center"
          basePoints={basePoints}
          extraPoint={HIGH_LEVERAGE_POINT}
          pointColor={HIGH_LEVERAGE_COLOR}
          xyRange={XY_RANGE}
        />
      </div>

      <Markdown>{`
Now let's see how that translates into 3D. We add this same extra point to two identical copies of the cloud, starting out exactly on the trend plane. Drag the slider to shift its $z$-value up or down (by the same amount in both plots), and watch the fitted plane $\\hat{z} = \\hat{a}x + \\hat{b}y + \\hat{c}$ tilt. You can also drag either plot to rotate it — both plots stay in sync, so you can compare them from any angle.
      `}</Markdown>

      <div className={styles.plotsRow}>
        <div className={styles.plotsStack}>
          <Leverage3DPlot
            title="Extra point near the cloud's center"
            basePoints={basePoints}
            extraPoint={{ ...lowLeveragePoint, z: trueZ(lowLeveragePoint) + shift }}
            pointColor={LOW_LEVERAGE_COLOR}
            xyRange={XY_RANGE}
            zRange={Z_RANGE}
            camera={camera}
            onCameraChange={setCamera}
          />
          <Leverage3DPlot
            title="Extra point far from the cloud's center"
            basePoints={basePoints}
            extraPoint={{ ...HIGH_LEVERAGE_POINT, z: trueZ(HIGH_LEVERAGE_POINT) + shift }}
            pointColor={HIGH_LEVERAGE_COLOR}
            xyRange={XY_RANGE}
            zRange={Z_RANGE}
            camera={camera}
            onCameraChange={setCamera}
          />
        </div>
        <VerticalSlider
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={0.5}
          value={shift}
          onChange={(v) => {
            setShift(v);
            setInteracted(true);
          }}
          label="Shift extra point's z value"
        />
      </div>

      <p className={styles.note}>
        The top plane barely tilts as you move the slider. The bottom plane pivots dramatically around the rest of the cloud, since the far-out point has much more leverage.
      </p>

      <Markdown>{`
This is why points that are outliers in their **predictors** — not just in the outcome — deserve extra scrutiny in a regression: a single high-leverage point can dominate the fit, even if it's the only point that "disagrees" with the trend.
      `}</Markdown>
    </>
  );
}
