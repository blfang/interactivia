import { useEffect, useState } from 'react';
import Markdown from '../../../components/Markdown';
import Leverage3DPlot, { DEFAULT_CAMERA, type SceneCamera } from '../components/Leverage3DPlot';
import VerticalSlider from '../components/VerticalSlider';
import { generateAnisotropicCloud3D, pointOnDiagonal } from '../regression';
import type { StepProps } from '../../types';
import styles from './Step3.module.css';

const TRUE_A = 0.5;
const TRUE_B = -0.4;
const TRUE_C = 2;
const STD_ALONG_DIAGONAL = 3.5;
const STD_ALONG_ANTIDIAGONAL = 0.8;

const DISTANCE_FROM_MEAN = 5;
const DIAGONAL_POINT = pointOnDiagonal(DISTANCE_FROM_MEAN, 'diagonal');
const ANTIDIAGONAL_POINT = pointOnDiagonal(DISTANCE_FROM_MEAN, 'antidiagonal');

const XY_RANGE: [number, number] = [-10, 10];
const Z_RANGE: [number, number] = [-15, 21];
const SLIDER_MIN = -15;
const SLIDER_MAX = 15;

const trueZ = (p: { x: number; y: number }) => TRUE_A * p.x + TRUE_B * p.y + TRUE_C;

export default function Step3({ onCompleteChange }: StepProps) {
  const [basePoints] = useState(() =>
    generateAnisotropicCloud3D(35, STD_ALONG_DIAGONAL, STD_ALONG_ANTIDIAGONAL, TRUE_A, TRUE_B, TRUE_C, 1.2)
  );
  const [shift, setShift] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [camera, setCamera] = useState<SceneCamera>(DEFAULT_CAMERA);

  useEffect(() => {
    onCompleteChange?.(interacted);
  }, [interacted, onCompleteChange]);

  return (
    <>
      <Markdown>{`
So far, leverage has tracked plain distance from the center of the predictor cloud. But that's really a special case — it only works because those clouds were **isotropic** (equally spread out in every direction).

Here's a cloud that isn't: it's stretched out along the $(1, 1)$ direction, and squeezed tight along the $(1, -1)$ direction. Look at it from above (drag to rotate) and you'll see it's shaped like a tilted ellipse rather than a circle.

Now consider two candidate extra points, **the same Euclidean distance from the center** — one out along the cloud's long axis $(1, 1)$, one out along its short axis $(1, -1)$. Drag the slider to shift each point's $z$-value away from the trend plane and compare how much leverage each one has.
      `}</Markdown>

      <div className={styles.plotsRow}>
        <Leverage3DPlot
          title="Same distance, along the long (1, 1) axis"
          basePoints={basePoints}
          extraPoint={{ ...DIAGONAL_POINT, z: trueZ(DIAGONAL_POINT) + shift }}
          xyRange={XY_RANGE}
          zRange={Z_RANGE}
          camera={camera}
          onCameraChange={setCamera}
        />
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
        <Leverage3DPlot
          title="Same distance, along the short (1, -1) axis"
          basePoints={basePoints}
          extraPoint={{ ...ANTIDIAGONAL_POINT, z: trueZ(ANTIDIAGONAL_POINT) + shift }}
          xyRange={XY_RANGE}
          zRange={Z_RANGE}
          camera={camera}
          onCameraChange={setCamera}
        />
      </div>

      <p className={styles.note}>
        Both extra points sit exactly {DISTANCE_FROM_MEAN} units from the center. Yet the plane on the right tilts far more than the plane on the left as you move the slider.
      </p>

      <Markdown>{`
Distance alone doesn't determine leverage — what matters is distance **relative to the spread of the cloud in that direction**. The point along the long axis is unremarkable: plenty of real data points land that far out along $(1, 1)$, so it barely disturbs the fit. The point along the short axis is a genuine outlier in the predictors: almost no data lands that far out along $(1, -1)$, so the fit bends sharply to accommodate it.

This is why leverage, more precisely, is measured in **Mahalanobis distance** — distance rescaled by the covariance of the predictors — rather than ordinary Euclidean distance.
      `}</Markdown>
    </>
  );
}
