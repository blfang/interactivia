import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

export default function Takeaways(_props: StepProps) {
  return (
    <Markdown>{`
When a trend appears in different groups of data, but reverses when the groups are combined, we have **Simpson's Paradox**.

It can occur when each group's comparison has imbalance in the amount of data:
* Jeter had most of his at-bats in 1996 (which was a good year for both), while Justice had most of his in 1995 (which was a bad year for both).
* Treatment A was used more often for large stones (which are difficult for both treatments), while treatment B was used mostly for small stones (which are easier for both treatments).

Whether to interpret the comparison with combined groups or separate groups depends on context.
* For the baseball example, it might make more sense to compare the combined seasons since at-bats in different seasons are generally the same.
* For the kidney stones example, it might make sense to compare within each group, since the choice of treatment depended on the size of the stone.

Regardless, if comparing fractions between two entites and there is heavy imbalance after slicing the data into two groups, tread carefully.
    `}</Markdown>
  );
}