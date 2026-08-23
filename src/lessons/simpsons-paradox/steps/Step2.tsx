import Markdown from '../../../components/Markdown';
import ArrowPlots from '../components/ArrowPlots';
import type { StepProps } from '../../types';
import { COLOR_PRIMARY as BLUE, COLOR_SUCCESS as GREEN } from '../../../styles/colors';

export default function Step2({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
To make the connection to Simpson's paradox:

* The the slope of a vector $(x, y)$ is the fraction $y / x$. It represents the fraction of $x$ trials that led to a success (e.g., fraction of college applications who were accepted).
* If $y_1/x_1$ and $y_2/x_2$ are the slopes of the vectors in Groups 1 and 2,
the slope in the combined plot is $\\dfrac{y_1+y_2}{x_1+x_2}$. This represents the overall fraction of success across both groups.

The paradox:
      `}</Markdown>
      <ul>
        <li>
          <span style={{ color: BLUE, fontWeight: 'bold' }}>Blue</span> has a{' '}
          <strong>higher</strong> fraction (steeper slope) than{' '}
          <span style={{ color: GREEN, fontWeight: 'bold' }}>green</span> in
          both Group 1 and Group 2.
        </li>
        <li>
          However, when the groups are combined,{' '}
          <span style={{ color: BLUE, fontWeight: 'bold' }}>Blue</span> has a{' '}
          <strong>lower</strong> fraction (shallower slope) than{' '}
          <span style={{ color: GREEN, fontWeight: 'bold' }}>Green</span>.
        </li>
      </ul>
      <Markdown>{`
Play the same game as before, but notice the fractions in the table below.
      `}</Markdown>
      <p>
        What does the hint (long steep{' '}
        <span style={{ color: GREEN, fontWeight: 'bold' }}>green</span> vector
        in one group, and long shallow{' '}
        <span style={{ color: BLUE, fontWeight: 'bold' }}>blue</span> vector
        in the other) imply about the fractions?
      </p>
      <ArrowPlots showTable onParadoxChange={onCompleteChange} />
    </>
  );
}
