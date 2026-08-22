import { useState } from 'react';
import Markdown from '../../../components/Markdown';
import PairedSimulationWidget from '../components/PairedSimulationWidget';
import ImportanceWeightExplorer from '../components/ImportanceWeightExplorer';
import {
  sampleStandardNormal,
  sampleUniform,
  sampleNormal,
  standardNormalPdf,
  uniformPdf,
  normalPdf,
} from '../simulation';
import { RARE_INTERVAL, RARE_INTERVAL_LABEL, RARE_DOMAIN, RARE_TRUE_VALUE, RARE_RUNNING_ESTIMATE_Y_MAX } from '../rareEvent';
import type { StepProps } from '../../types';
import styles from './Step4.module.css';

const [PROPOSAL_LO, PROPOSAL_HI] = RARE_INTERVAL;
const PROPOSAL_NORMAL_MEAN = (PROPOSAL_LO + PROPOSAL_HI) / 2;

type Proposal = 'uniform' | 'normal';

export default function Step4({ onCompleteChange }: StepProps) {
  const [proposal, setProposal] = useState<Proposal>('normal');

  const proposalSampler =
    proposal === 'uniform' ? () => sampleUniform(PROPOSAL_LO, PROPOSAL_HI) : () => sampleNormal(PROPOSAL_NORMAL_MEAN, 1);
  const proposalPdf =
    proposal === 'uniform'
      ? (x: number) => uniformPdf(x, PROPOSAL_LO, PROPOSAL_HI)
      : (x: number) => normalPdf(x, PROPOSAL_NORMAL_MEAN, 1);

  return (
    <>
      <Markdown>{`
Instead of sampling from the target distribution density of $N(0,1)$ (with density $f$), let's sample from a **proposal distribution** with density $g$ that puts its mass right where we're looking: near $${RARE_INTERVAL_LABEL}$.

If we take the fraction of samples that lie in the interval, we'll get the wrong answer: that's the probability under the proposal distribution, not the original distribution!

To correct for this, we instead take a **weighted** fraction, where a sample $x_i$ has **importance weight** $w(x_i) = f(x_i)/g(x_i)$.

$$\\dfrac{1}{N}\\sum_{i : x_i \\in [3, 5]} w(x_i).$$

This is a generalization of direct sampling from the target distribution, which is the special case $w(x_i) = f(x_i)/f(x_i) = 1$.

Click on the diagram to see weights of different points. Where are weights large and where are they small?
      `}</Markdown>
      <ImportanceWeightExplorer
        proposalMean={PROPOSAL_NORMAL_MEAN}
        domain={RARE_DOMAIN}
        interval={RARE_INTERVAL}
      />
      <Markdown>{`
This estimator is still unbiased for $P(X \\in ${RARE_INTERVAL_LABEL})$ under $f$. It just reweights each draw by how much more (or less) likely $f$ was to produce it than $g$ was.

---

Below, each click of **Simulate** runs *both* approaches at once, so you can compare them directly: the naive estimator keeps drawing from $N(0,1)$ itself (as in the previous step), while the importance-sampling estimator draws from $g$ and reweights.

With the default proposal distribution $N(${PROPOSAL_NORMAL_MEAN}, 1)$, occasional draws fall outside ${RARE_INTERVAL_LABEL} and contribute a weight but no hit. Try **Simulate** and **Simulate ×100**, and watch the importance-sampling estimate settle down quickly while the naive estimate keeps lagging.

You can also try $\\text{Uniform}(${PROPOSAL_LO}, ${PROPOSAL_HI})$ as another proposal distribution: every draw then lands in ${RARE_INTERVAL_LABEL}, so samples are not "wasted."
      `}</Markdown>
      <div className={styles.toggleRow}>
        <span>Importance-sampling proposal:</span>
        <button
          className={`${styles.toggleButton} ${proposal === 'normal' ? styles['toggleButton--active'] : ''}`}
          onClick={() => setProposal('normal')}
        >
          N({PROPOSAL_NORMAL_MEAN}, 1)
        </button>
        <button
          className={`${styles.toggleButton} ${proposal === 'uniform' ? styles['toggleButton--active'] : ''}`}
          onClick={() => setProposal('uniform')}
        >
          Uniform({PROPOSAL_LO}, {PROPOSAL_HI})
        </button>
      </div>
      <PairedSimulationWidget
        key={proposal}
        targetSampler={sampleStandardNormal}
        targetPdf={standardNormalPdf}
        proposalSampler={proposalSampler}
        proposalPdf={proposalPdf}
        interval={RARE_INTERVAL}
        intervalLabel={RARE_INTERVAL_LABEL}
        trueValue={RARE_TRUE_VALUE}
        domain={RARE_DOMAIN}
        runningEstimateYMax={RARE_RUNNING_ESTIMATE_Y_MAX}
        onCompleteChange={onCompleteChange}
      />
    </>
  );
}
