import { useState } from 'react';
import Markdown from '../../../components/Markdown';
import MonteCarloWidget from '../components/MonteCarloWidget';
import {
  sampleUniform,
  sampleNormal,
  standardNormalPdf,
  uniformPdf,
  normalPdf,
  normalIntervalProbability,
  importanceWeight,
} from '../simulation';
import { RUNNING_ESTIMATE_Y_MAX } from './Step3';
import type { StepProps } from '../../types';
import styles from './Step4.module.css';

const INTERVAL: [number, number] = [3, 5];
const DOMAIN: [number, number] = [-4, 6];
const TRUE_VALUE = normalIntervalProbability(...INTERVAL);

type Proposal = 'uniform' | 'normal';

export default function Step4({ onCompleteChange }: StepProps) {
  const [proposal, setProposal] = useState<Proposal>('uniform');

  const sampler = proposal === 'uniform' ? () => sampleUniform(3, 5) : () => sampleNormal(4, 1);
  const proposalPdf = proposal === 'uniform' ? (x: number) => uniformPdf(x, 3, 5) : (x: number) => normalPdf(x, 4, 1);

  return (
    <>
      <Markdown>{`
Instead of sampling from the target distribution $N(0,1)$, sample from a **proposal distribution** $g$ that puts its mass right where we're looking — near $[3, 5]$ — then correct for the mismatch by reweighting each sample:

$$\\hat\\theta = \\frac{1}{N}\\sum_{i=1}^N \\mathbb{1}(X_i \\in [3,5]) \\cdot \\frac{f(X_i)}{g(X_i)}, \\qquad X_i \\sim g$$

where $f$ is the $N(0,1)$ density and $w(x) = f(x)/g(x)$ is the **importance weight**. This estimator is still unbiased for $P(X \\in [3,5])$ under $f$ — it just reweights each draw by how much more (or less) likely $f$ was to produce it than $g$ was.

With the default proposal, $g = \\text{Uniform}(3, 5)$, *every* draw lands in $[3,5]$ — nothing is wasted. Try **Simulate** and **Simulate ×100**, and compare how quickly the estimate settles down against the previous step (same y-axis scale on the chart below).

You can also try $g = N(4, 1)$: a more realistic proposal with full support, where occasional draws fall outside $[3,5]$ and contribute a weight but no hit.
      `}</Markdown>
      <div className={styles.toggleRow}>
        <span>Proposal distribution:</span>
        <button
          className={`${styles.toggleButton} ${proposal === 'uniform' ? styles['toggleButton--active'] : ''}`}
          onClick={() => setProposal('uniform')}
        >
          Uniform(3, 5)
        </button>
        <button
          className={`${styles.toggleButton} ${proposal === 'normal' ? styles['toggleButton--active'] : ''}`}
          onClick={() => setProposal('normal')}
        >
          N(4, 1)
        </button>
      </div>
      <MonteCarloWidget
        key={proposal}
        sampler={sampler}
        weightFn={(x) => importanceWeight(x, standardNormalPdf, proposalPdf)}
        interval={INTERVAL}
        intervalLabel="[3, 5]"
        trueValue={TRUE_VALUE}
        targetPdf={standardNormalPdf}
        domain={DOMAIN}
        plotMode="targetVsProposal"
        proposalPdf={proposalPdf}
        runningEstimateYMax={RUNNING_ESTIMATE_Y_MAX}
        onCompleteChange={onCompleteChange}
      />
    </>
  );
}
