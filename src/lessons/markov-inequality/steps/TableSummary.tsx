import { useEffect } from 'react';
import RunningTable from '../components/RunningTable';
import type { TableRow } from '../components/RunningTable';
import { EXAMPLE_DATA, optimalK } from './exampleData';
import type { StepProps } from '../../types';
import Spoiler from '../../../components/Spoiler';
import Markdown from '../../../components/Markdown';

const rows: TableRow[] = EXAMPLE_DATA.map((d) => ({
  mean: d.mean,
  threshold: d.threshold,
  n: d.n,
  k: optimalK(d.mean, d.threshold, d.n),
}));

export default function TableSummary({ onCompleteChange }: StepProps) {
  useEffect(() => {
    onCompleteChange?.(true);
  }, [onCompleteChange]);

  return (
    <>
      <Markdown>{`
In each of the previous examples, you tried to maximize the number of people above a certain threshold while keeping the mean at \\$20.
What prevented you from putting too many people above the thresold?

* People with large values need to be counterbalanced by people with low values in order to achieve the mean of \\$20. (The seesaw needs to be balanced.)
* However, we can't achieve balance by giving people very negative values, since negative values are not allowed. So the best we can do to achieve balance is to *pile a lot of people at zero*.

Here's a summary of the results. The last column is the product of the threshold with the fraction of people above the threshold. How does this compare to the mean?
      `}</Markdown>

      <RunningTable rows={rows} currentIndex={-1} showRatioFormat={true} />
      Answer: <Spoiler>
        The last column (threshold * (fraction above threshold)) is less than or equal to the mean. This is <b>Markov's inequality</b>.
      </Spoiler>
    </>
  );
}