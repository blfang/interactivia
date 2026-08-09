import Markdown from '../../../components/Markdown';
import ArrowPlots from '../components/ArrowPlots';
import type { StepProps } from '../../types';

export default function Step2({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
To make the connection to Simpson's paradox, note that the slope of the vector (x, y) is the fraction y / x.

The paradox:

* Blue has a **higher** fraction (steeper slope) than green in both Group 1 and Group 2.
* However, when the groups are combined, Blue has a **lower** fraction (shallower slope) than Green.

Play the same game as before, but notice the fractions in the table below.
What does the hint (long steep green vector in one group, and long shallow blue vector in the other) imply about the fractions?
      `}</Markdown>
      <ArrowPlots showTable onParadoxChange={onCompleteChange} />
    </>
  );
}