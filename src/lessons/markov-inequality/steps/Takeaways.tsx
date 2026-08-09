import { useEffect } from 'react';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

export default function Takeaways({ onCompleteChange }: StepProps) {
  useEffect(() => {
    onCompleteChange?.(true);
  }, [onCompleteChange]);

  return (
    <Markdown>{`
**Markov's Inequality** provides a bound on the probability that a _non-negative_ random variable exceeds a certain threshold:
**(probability above threshold) ≤ mean / threshold**.

* Intuition: The probability of large values can't be too high, because there needs to be enough probability at small values near zero to "balance the seesaw."
* The quantity "threshold * (probability above threshold)" is the mean in the special case where the distribution has all its probability on 0 or the threshold. We can show this is smaller than the mean of a general distribution (with the same probability above the threshold) by sliding mass to the left.


Limitations:
- Markov's inequality is often quite loose, unless your distribution looks like the special case where probability is all at zero or the threshold.
- It only uses the mean, and ignores all other information about the distribution
- For tighter bounds, you need additional assumptions (e.g., variance for Chebychev's inequality). But interestingly, Markov's inequality can be used to prove these stronger inequalities like Chebycehv's inequality and Chernoff bounds!
    `}</Markdown>
  );
}