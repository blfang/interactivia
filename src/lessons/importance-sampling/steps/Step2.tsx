import Markdown from '../../../components/Markdown';
import MonteCarloWidget from '../components/MonteCarloWidget';
import { sampleStandardNormal, standardNormalPdf, normalIntervalProbability } from '../simulation';
import type { StepProps } from '../../types';

const INTERVAL: [number, number] = [-1, 1];
const DOMAIN: [number, number] = [-4, 4];
const TRUE_VALUE = normalIntervalProbability(...INTERVAL);

export default function Step2({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
We can estimate a probability like $P(-1 \\le X \\le 1)$ for $X \\sim N(0,1)$ by **simulating**: draw a lot of samples, and see what fraction land in the interval.

Click **Simulate** to draw a sample from $N(0,1)$. Each sample either lands in $[-1, 1]$ or it doesn't — the running estimate below is just the fraction of samples so far that landed inside.

This is **naive Monte Carlo**: draw from the target distribution itself, and count. Try it a few times, then try **Simulate ×100** to get more samples quickly. The estimate should settle in near the true value (about 0.6827) fairly quickly.
      `}</Markdown>
      <MonteCarloWidget
        sampler={sampleStandardNormal}
        interval={INTERVAL}
        intervalLabel="[-1, 1]"
        trueValue={TRUE_VALUE}
        targetPdf={standardNormalPdf}
        domain={DOMAIN}
        onCompleteChange={onCompleteChange}
      />
    </>
  );
}
