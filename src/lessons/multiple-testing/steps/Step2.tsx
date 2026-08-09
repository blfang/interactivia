import Markdown from '../../../components/Markdown';
import SimulationGrid from '../components/SimulationGrid';

export default function Step2() {
  return (
    <>
      <Markdown>{`
Now we run **many of these tests at the same time** — testing 25 fair coins for bias, or testing whether each color of jelly bean causes acne.

Click **Simulate** to run all tests at once; try clicking it repeatedly. Again, there is no true effect in any of these tests. But how often does at least one test discover something?
      `}</Markdown>
      <SimulationGrid numPlots={25} columns={5} />
    </>
  );
}