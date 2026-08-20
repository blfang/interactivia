import { useEffect } from 'react';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

export default function Intro({ onCompleteChange }: StepProps) {
  useEffect(() => {
    onCompleteChange?.(true);
  }, [onCompleteChange]);

  return (
    <Markdown>{`
Suppose $X \\sim N(0, 1)$, a standard normal random variable. How often does $X$ land beyond 3 — say, somewhere in $[3, 5]$?

One way to answer this: **simulate**. Draw a huge number of samples from $N(0,1)$, and count what fraction land in $[3, 5]$.

This works great for *common* events. But for *rare* events, naive simulation runs into trouble — most of your simulated draws are simply wasted, because they almost never land where you're looking.

Here's the plan:

1. First, estimate an easy, common event: $P(-2 \\le X \\le 2)$.
2. Then try the same approach on a rare event: $P(3 \\le X \\le 5)$, and watch it struggle.
3. Finally, fix it with **importance sampling** — sample from a smarter distribution, and correct for the mismatch by reweighting.
    `}</Markdown>
  );
}
