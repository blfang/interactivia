import { useEffect } from 'react';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

export default function MarkovStatement({ onCompleteChange }: StepProps) {
  useEffect(() => {
    onCompleteChange?.(true);
  }, [onCompleteChange]);

  return (
    <>
      <Markdown>{`
In every example above, the maximum fraction of people at or above the threshold was bounded by the ratio **mean / threshold**. To state this result formally, we first need to set up our notation in the context of the examples.

In the context of our examples, $X$ represents a randomly chosen person's amount of money,
$\\mathbb{E}[X] = 20$ is the mean, and $a$ is the threshold.
The inequality says that the fraction of people with
$a$ or more can never exceed $\\mathbb{E}[X] / a$.

With this setup, we can now state the result formally.

## Formal Statement

**Markov's Inequality.** Let $X$ be a **non-negative** random variable (i.e., $X \\geq 0$) and let $a$ be a **positive** real number (i.e., $a > 0$). Then:

$$P(X \\geq a) \\;\\leq\\; \\frac{\\mathbb{E}[X]}{a}$$

where:

- $P(X \\geq a)$ is the **probability** that $X$ takes a value of at least $a$,
- $\\mathbb{E}[X]$ is the **expected value** (mean) of $X$, and
- $a$ is the **threshold** above which we measure the probability.
      `}</Markdown>
    </>
  );
}