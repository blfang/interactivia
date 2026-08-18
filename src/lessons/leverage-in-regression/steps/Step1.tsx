import { useEffect, useState } from 'react';
import Markdown from '../../../components/Markdown';
import LeverageScatterPlot from '../components/LeverageScatterPlot';
import VerticalSlider from '../components/VerticalSlider';
import { generateCloud2D } from '../regression';
import type { StepProps } from '../../types';
import styles from './Step1.module.css';

const TRUE_SLOPE = 0.6;
const TRUE_INTERCEPT = 1;
const CLOUD_X_RANGE: [number, number] = [0, 8];
const MEAN_X = (CLOUD_X_RANGE[0] + CLOUD_X_RANGE[1]) / 2;

const LOW_LEVERAGE_X = MEAN_X;
const HIGH_LEVERAGE_X = 13;

const PLOT_X_RANGE: [number, number] = [-1, 14];
const PLOT_Y_RANGE: [number, number] = [-8, 20];
const SLIDER_MIN = -10;
const SLIDER_MAX = 10;

const trueY = (x: number) => TRUE_SLOPE * x + TRUE_INTERCEPT;

export default function Step1({ onCompleteChange }: StepProps) {
  const [basePoints] = useState(() => generateCloud2D(25, CLOUD_X_RANGE, TRUE_SLOPE, TRUE_INTERCEPT, 1));
  const [shift, setShift] = useState(0);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    onCompleteChange?.(interacted);
  }, [interacted, onCompleteChange]);

  return (
    <>
      <Markdown>{`
Here's a cloud of points roughly following a line, $y = ax + b + \\text{noise}$. Suppose we add one more point, and we get to choose how far its $y$-value strays from the trend.

Below, that extra point (in orange) is added to **two identical copies** of the cloud, starting out exactly on the trend line. In the top plot, it sits near the mean of the other $x$-values. In the bottom plot, it sits far out on the $x$-axis. Drag the slider to shift the extra point's $y$-value up or down (by the same amount in both plots), and watch what happens to the fitted line, $\\hat{y} = \\hat{a}x + \\hat{b}$.
      `}</Markdown>

      <div className={styles.plotsRow}>
        <div className={styles.plotsStack}>
          <LeverageScatterPlot
            title="Extra point near the mean of x"
            basePoints={basePoints}
            extraPoint={{ x: LOW_LEVERAGE_X, y: trueY(LOW_LEVERAGE_X) + shift }}
            xRange={PLOT_X_RANGE}
            yRange={PLOT_Y_RANGE}
          />
          <LeverageScatterPlot
            title="Extra point far from the mean of x"
            basePoints={basePoints}
            extraPoint={{ x: HIGH_LEVERAGE_X, y: trueY(HIGH_LEVERAGE_X) + shift }}
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
A point far from the mean of $x$ has more **leverage** over the fitted line: it can pull the line toward it much more easily, because a small tilt of the line moves the fitted value at that $x$ by a large amount. A point near the mean of $x$ has little leverage, since the line pivots close to its own location — tilting the line doesn't move the fitted value there very much.

Formally, for simple linear regression, the leverage of a point $x_i$ is

$$h_i = \\frac{1}{n} + \\frac{(x_i - \\bar{x})^2}{\\sum_j (x_j - \\bar{x})^2}$$

which grows with the squared distance from $x_i$ to the mean $\\bar{x}$.
      `}</Markdown>
    </>
  );
}
