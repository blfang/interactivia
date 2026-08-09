import { useState, useEffect } from 'react';
import MeanWidget from '../components/MeanWidget';
import type { Person } from '../components/MeanWidget';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

const PEOPLE: Person[] = [
  { label: 'A', value: 5, color: '#3b82f6' },
  { label: 'B', value: 10, color: '#10b981' },
  { label: 'C', value: 15, color: '#f59e0b' },
  { label: 'D', value: 30, color: '#ef4444' },
  { label: 'E', value: 40, color: '#8b5cf6' },
];

const THRESHOLD = 30;

export default function MeanPersistent({ onCompleteChange }: StepProps) {
  const [, setPeople] = useState<Person[]>(PEOPLE);

  useEffect(() => {
    onCompleteChange?.(true);
  }, [onCompleteChange]);

  return (
    <>
      <Markdown>{`
From the previous examples, we saw **mean ≥ threshold * (fraction at or above threshold)**.
Why does this product appear?

Look at the example below where threshold = 30, mean = 20, and fraction at or above threshold = 2/5. We also marked threshold * fraction = 30 * 2/5 = 12.

What happens to the mean if we **shift everyone to the left** in the following way?

- Every person with less than \\$30 shifts down to \\$0.
- Every person at or above \\$30 shifts down to \\$30.

Click "Collapse" and watch how the mean changes.


      `}</Markdown>
      <MeanWidget
        people={PEOPLE}
        target={THRESHOLD}
        showTarget={false}
        persistentMean
        maxValue={50}
        threshold={THRESHOLD}
        onPeopleChange={setPeople}
        collapseMode
      />
        <Markdown>{`
The main takeaways are:

* The quantity "threshold * (fraction at or above threshold)" is the mean in the _special case_ where everyone is either at the threshold or at zero.
* When we slide everyone to the left to arrive at the special case, the mean also moves down, which establishes the inequality **mean ≥ threshold * (fraction at or above threshold)**.
`}</Markdown>
    </>
  );
}