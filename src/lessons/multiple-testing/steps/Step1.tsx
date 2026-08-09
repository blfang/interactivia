import Markdown from '../../../components/Markdown';
import SimulationGrid from '../components/SimulationGrid';

export default function Step1() {
  return (
    <>
      <Markdown>{`
Suppose we're testing for something that doesn't exist, like testing for bias in a fair coin, or [testing if jelly beans cause acne](https://xkcd.com/882/).

Suppose also that the test is designed so that chance of mistakenly discovering something ("The coin is biased!" or "Jelly beans cause acne!") is at most 5%.

Click **Simulate** several times to repeatedly run the test. How often do you mistakenly discover something?
      `}</Markdown>
      <SimulationGrid numPlots={1} columns={1} plotWidth={400} plotHeight={267} />
    </>
  );
}