import Markdown from '../../../components/Markdown';
import SimulationGrid from '../components/SimulationGrid';
import { COLOR_DANGER } from '../../../styles/colors';

export default function Step1() {
  return (
    <>
      <Markdown>{`
Suppose we're testing for something that doesn't exist, like testing for bias in a fair coin, or [testing if jelly beans cause acne](https://xkcd.com/882/).

Suppose also that the test is designed so that chance of mistakenly discovering something ("The coin is biased!" or "Jelly beans cause acne!") is at most 5%.

Click **Simulate** several times to repeatedly run the test.
      `}</Markdown>
      <p>
        A false discovery occurs when you get a value extreme enough to be in the{' '}
        <span style={{ color: COLOR_DANGER, fontWeight: 'bold' }}>red</span> tails of the distribution.
        Check that in the long run, this only happens 5% of the time.
      </p>
      <SimulationGrid numPlots={1} columns={1} plotWidth={400} plotHeight={267} />
    </>
  );
}