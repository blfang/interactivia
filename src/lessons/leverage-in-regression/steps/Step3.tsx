import { useEffect, useState } from 'react';
import Markdown from '../../../components/Markdown';
import MathComponent from '../../../components/Math';
import Leverage3DPlot, { DEFAULT_CAMERA, type SceneCamera } from '../components/Leverage3DPlot';
import PredictorCloudPlot from '../components/PredictorCloudPlot';
import VerticalSlider from '../components/VerticalSlider';
import { generateAnisotropicCloud3D, pointOnDiagonal } from '../regression';
import type { StepProps } from '../../types';
import styles from './Step3.module.css';
import { COLOR_SUCCESS, COLOR_DANGER } from '../../../styles/colors';

const TRUE_A = 0.5;
const TRUE_B = -0.4;
const TRUE_C = 2;
const STD_ALONG_DIAGONAL = 3.5;
const STD_ALONG_ANTIDIAGONAL = 0.8;

const DISTANCE_FROM_MEAN = 5;
const DIAGONAL_OFFSET = pointOnDiagonal(DISTANCE_FROM_MEAN, 'diagonal');
const ANTIDIAGONAL_OFFSET = pointOnDiagonal(DISTANCE_FROM_MEAN, 'antidiagonal');

const LOW_LEVERAGE_COLOR = COLOR_SUCCESS;
const HIGH_LEVERAGE_COLOR = COLOR_DANGER;

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

  const sampleCentroid = {
    x: basePoints.reduce((sum, p) => sum + p.x, 0) / basePoints.length,
    y: basePoints.reduce((sum, p) => sum + p.y, 0) / basePoints.length,
  };
  const diagonalPoint = { x: sampleCentroid.x + DIAGONAL_OFFSET.x, y: sampleCentroid.y + DIAGONAL_OFFSET.y };
  const antidiagonalPoint = { x: sampleCentroid.x + ANTIDIAGONAL_OFFSET.x, y: sampleCentroid.y + ANTIDIAGONAL_OFFSET.y };

  useEffect(() => {
    onCompleteChange?.(interacted);
  }, [interacted, onCompleteChange]);

  return (
    <>
      <Markdown>{`
Here's a cloud that isn't equally spread out in all directions: it's stretched out along the $(1, 1)$ direction, and squeezed tight along the $(1, -1)$ direction.
Viewed from directly above, in the $(x, y)$ plane, it's shaped like a tilted ellipse rather than a circle.
      `}</Markdown>
      <p>
        The two plots below place the extra point the same Euclidean distance from the center: one out along
        the cloud's long axis <MathComponent math="(1, 1)" />, shown in{' '}
        <span style={{ color: LOW_LEVERAGE_COLOR, fontWeight: 'bold' }}>green</span>, one out along its short
        axis <MathComponent math="(1, -1)" />, shown in{' '}
        <span style={{ color: HIGH_LEVERAGE_COLOR, fontWeight: 'bold' }}>red</span>:
      </p>

      <div className={styles.scatterRow}>
        <PredictorCloudPlot
          title="Same distance, along the long (1, 1) axis"
          basePoints={basePoints}
          extraPoint={diagonalPoint}
          pointColor={LOW_LEVERAGE_COLOR}
          xyRange={XY_RANGE}
        />
        <PredictorCloudPlot
          title="Same distance, along the short (1, -1) axis"
          basePoints={basePoints}
          extraPoint={antidiagonalPoint}
          pointColor={HIGH_LEVERAGE_COLOR}
          xyRange={XY_RANGE}
        />
      </div>

      <Markdown>{`
Now let's see how that affects the fitted plane. Drag the slider to shift each point's $z$-value away from the trend plane and compare how much leverage each one has.
      `}</Markdown>

      <div className={styles.plotsRow}>
        <div className={styles.plotsStack}>
          <Leverage3DPlot
            title="Same distance, along the long (1, 1) axis"
            basePoints={basePoints}
            extraPoint={{ ...diagonalPoint, z: trueZ(diagonalPoint) + shift }}
            pointColor={LOW_LEVERAGE_COLOR}
            xyRange={XY_RANGE}
            zRange={Z_RANGE}
            camera={camera}
            onCameraChange={setCamera}
          />
          <Leverage3DPlot
            title="Same distance, along the short (1, -1) axis"
            basePoints={basePoints}
            extraPoint={{ ...antidiagonalPoint, z: trueZ(antidiagonalPoint) + shift }}
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


      <Markdown>{`
Distance from the mean by itself doesn't determine leverage. What matters is distance **relative to the spread of the cloud in that direction**. The point along the long axis is unremarkable: plenty of real data points land that far out along $(1, 1)$, so it barely disturbs the fit. The point along the short axis is a genuine outlier in the predictors: almost no data lands that far out along $(1, -1)$, so the fit bends sharply to accommodate it.

This is why leverage, more precisely, is measured in **Mahalanobis distance** (distance rescaled by the covariance of the predictors) rather than ordinary Euclidean distance.
      `}</Markdown>
    </>
  );
}
