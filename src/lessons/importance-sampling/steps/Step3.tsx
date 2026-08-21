import Markdown from '../../../components/Markdown';
import MonteCarloWidget from '../components/MonteCarloWidget';
import { sampleStandardNormal, standardNormalPdf } from '../simulation';
import { RARE_INTERVAL, RARE_INTERVAL_LABEL, RARE_DOMAIN, RARE_TRUE_VALUE, RARE_RUNNING_ESTIMATE_Y_MAX } from '../rareEvent';
import type { StepProps } from '../../types';

export default function Step3({ onCompleteChange }: StepProps) {
  const [lo, hi] = RARE_INTERVAL;

  return (
    <>
      <Markdown>{`
Now let's estimate a **rare** event instead: $P(${lo} \\le X \\le ${hi})$. Same idea — draw from $N(0,1)$, check whether the sample landed in ${RARE_INTERVAL_LABEL}, track the running fraction.

Before clicking, guess: out of 100 draws, how many do you expect to land in ${RARE_INTERVAL_LABEL}?

Click **Simulate** and **Simulate ×100** repeatedly. You'll likely see long stretches where the estimate sits at exactly 0 — most draws simply never land anywhere near ${RARE_INTERVAL_LABEL}, so the estimator barely moves. This is naive Monte Carlo's weak spot: for a rare event, almost every sample is "wasted," and the estimator has huge *relative* variance until $n$ gets enormous.
      `}</Markdown>
      <MonteCarloWidget
        sampler={sampleStandardNormal}
        interval={RARE_INTERVAL}
        intervalLabel={RARE_INTERVAL_LABEL}
        trueValue={RARE_TRUE_VALUE}
        targetPdf={standardNormalPdf}
        domain={RARE_DOMAIN}
        runningEstimateYMax={RARE_RUNNING_ESTIMATE_Y_MAX}
        onCompleteChange={onCompleteChange}
      />
    </>
  );
}
