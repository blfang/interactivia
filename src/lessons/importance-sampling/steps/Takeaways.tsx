import { useEffect } from 'react';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

export default function Takeaways({ onCompleteChange }: StepProps) {
  useEffect(() => {
    onCompleteChange?.(true);
  }, [onCompleteChange]);

  return (
    <Markdown>{`
**Importance sampling** estimates $E_f[\\phi(X)]$ (here, $\\phi(x) = \\mathbb{1}(x \\in A)$) by sampling from a different, more convenient distribution $g$ and reweighting:

$$\\hat\\theta = \\frac{1}{N}\\sum_{i=1}^N \\phi(X_i) \\cdot \\frac{f(X_i)}{g(X_i)}, \\qquad X_i \\sim g$$

* This estimator is **unbiased** for any $g$ with $g(x) > 0$ wherever $f(x)\\phi(x) \\ne 0$ (the *support condition*) — the reweighting exactly undoes the mismatch between where we sampled and where the target distribution actually puts its mass.
* **Naive Monte Carlo** is the special case $g = f$ (weight always 1). It's unbiased too, but for rare events, its *relative* variance is enormous — almost every draw is wasted, so it takes a huge number of samples to pin down a small probability.
* **A well-chosen proposal** concentrates draws on the region that matters, so every sample "counts," sharply cutting variance for the same sample size.
* Proposal choice matters: a proposal that's still far from the event of interest, or one whose tails are much thinner than the target's, can make importance sampling worse than naive Monte Carlo — a poor $g$ can produce huge, unstable weights.
    `}</Markdown>
  );
}
