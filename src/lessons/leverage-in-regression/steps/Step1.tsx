import { useEffect, useState } from 'react';
import Markdown from '../../../components/Markdown';
import LeverageScatterPlot from '../components/LeverageScatterPlot';
import VerticalSlider from '../components/VerticalSlider';
import { generateCloud2D } from '../regression';
import type { StepProps } from '../../types';
import styles from './Step1.module.css';
import { COLOR_SUCCESS, COLOR_DANGER } from '../../../styles/colors';

const TRUE_SLOPE = 0.6;
const TRUE_INTERCEPT = 1;
const CLOUD_X_RANGE: [number, number] = [0, 8];

const LOW_LEVERAGE_OFFSET = 1.0;
const HIGH_LEVERAGE_X = 13;

const LOW_LEVERAGE_COLOR = COLOR_SUCCESS;
const HIGH_LEVERAGE_COLOR = COLOR_DANGER;

const PLOT_X_RANGE: [number, number] = [-1, 14];
const PLOT_Y_RANGE: [number, number] = [-8, 20];
const SLIDER_MIN = -10;
const SLIDER_MAX = 10;

const trueY = (x: number) => TRUE_SLOPE * x + TRUE_INTERCEPT;

export default function Step1({ onCompleteChange }: StepProps) {
  const [basePoints] = useState(() => generateCloud2D(25, CLOUD_X_RANGE, TRUE_SLOPE, TRUE_INTERCEPT, 1));
  const [shift, setShift] = useState(0);
  const [interacted, setInteracted] = useState(false);

  const sampleMeanX = basePoints.reduce((sum, p) => sum + p.x, 0) / basePoints.length;
  const lowLeverageX = sampleMeanX + LOW_LEVERAGE_OFFSET;

  useEffect(() => {
    onCompleteChange?.(interacted);
  }, [interacted, onCompleteChange]);

  return (
    <>
      <p>
        Here's a cloud of points roughly following a line. In the top plot, there's an additional{' '}
        <span style={{ color: LOW_LEVERAGE_COLOR, fontWeight: 'bold' }}>green</span> point near the middle of the cloud. In the bottom
        plot, there's instead an additional <span style={{ color: HIGH_LEVERAGE_COLOR, fontWeight: 'bold' }}>red</span> point far from
        the cloud. Drag the slider to shift the extra point's y-value up or down (by the same amount in both plots), and watch what
        happens to the fitted line.
      </p>

      <div className={styles.plotsRow}>
        <div className={styles.plotsStack}>
          <LeverageScatterPlot
            title="Extra point near the sample mean of x"
            basePoints={basePoints}
            extraPoint={{ x: lowLeverageX, y: trueY(lowLeverageX) + shift }}
            pointColor={LOW_LEVERAGE_COLOR}
            xRange={PLOT_X_RANGE}
            yRange={PLOT_Y_RANGE}
          />
          <LeverageScatterPlot
            title="Extra point far from the sample mean of x"
            basePoints={basePoints}
            extraPoint={{ x: HIGH_LEVERAGE_X, y: trueY(HIGH_LEVERAGE_X) + shift }}
            pointColor={HIGH_LEVERAGE_COLOR}
            xRange={PLOT_X_RANGE}
            yRange={PLOT_Y_RANGE}
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
          label="Shift extra point's y value"
        />
      </div>

      <p className={styles.note}>
        Drag the slider up and down. Notice that the top plot's line barely moves, while the bottom plot's line swings dramatically.
      </p>

      <Markdown>{`
A point far from the sample mean of $x$ has more **leverage** over the fitted line: it can pull the line toward it much more easily, because a small tilt of the line moves the fitted value at that $x$ by a large amount. A point near the sample mean of $x$ has little leverage, since the line pivots close to its own location — tilting the line doesn't move the fitted value there very much.
      `}</Markdown>
    </>
  );
}
