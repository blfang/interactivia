import Markdown from '../../../components/Markdown';
import MonteCarloWidget from '../components/MonteCarloWidget';
import { sampleStandardNormal, standardNormalPdf, normalIntervalProbability } from '../simulation';
import type { StepProps } from '../../types';

const INTERVAL: [number, number] = [3, 5];
const DOMAIN: [number, number] = [-4, 6];
export const RUNNING_ESTIMATE_Y_MAX = 0.005;
const TRUE_VALUE = normalIntervalProbability(...INTERVAL);

export default function Step3({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
Now let's estimate a **rare** event instead: $P(3 \\le X \\le 5)$. Same idea — draw from $N(0,1)$, check whether the sample landed in $[3, 5]$, track the running fraction.

Before clicking, guess: out of 100 draws, how many do you expect to land in $[3, 5]$?

Click **Simulate** and **Simulate ×100** repeatedly. You'll likely see long stretches where the estimate sits at exactly 0 — most draws simply never land anywhere near $[3, 5]$, so the estimator barely moves. This is naive Monte Carlo's weak spot: for a rare event, almost every sample is "wasted," and the estimator has huge *relative* variance until $n$ gets enormous.
      `}</Markdown>
      <MonteCarloWidget
        sampler={sampleStandardNormal}
        interval={INTERVAL}
        intervalLabel="[3, 5]"
        trueValue={TRUE_VALUE}
        targetPdf={standardNormalPdf}
        domain={DOMAIN}
        runningEstimateYMax={RUNNING_ESTIMATE_Y_MAX}
        onCompleteChange={onCompleteChange}
      />
    </>
  );
}
