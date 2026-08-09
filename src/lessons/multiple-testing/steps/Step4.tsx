import Markdown from '../../../components/Markdown';
import SimulationGrid from '../components/SimulationGrid';

export default function Step4() {
  return (
    <>
      <Markdown>{`
To keep the overall chance of at least one mistaken finding at 5% when running 25 tests, we need to make each individual test more stringent.

Before, each individual test makes a mistake at most 5% of the time.
Let's instead require that each test makes a mistake at most **5% / 25 = 0.2%** of the time.
This means the test will only declare a finding when it encounters very extreme values.

Click **Simulate** repeatedly to see what happens when we use this more conservative threshold.
      `}</Markdown>
      <SimulationGrid numPlots={25} columns={5} cutoff={3.09} />
    </>
  );
}