import Markdown from '../../../components/Markdown';
import ArrivalsTimelineWidget from '../components/ArrivalsTimelineWidget';

const GREEN = '#16a34a';
const RED = '#dc2626';

export default function ArrivalsParadox() {
  return (
    <>
      <p>
        Now suppose you arrive at the bus stop at 10am every day (marked with a{' '}
        <span style={{ color: GREEN, fontWeight: 'bold' }}>green star</span>).
      </p>
      <Markdown>{`
What is your average waiting time until the next bus?

Since there is one hour on average between consecutive buses and you arrive somewhere between them, you might think you will wait 1/2 an hour on average.

In the simulation, we keep track of two new kinds of intervals:
      `}</Markdown>
      <ul>
        <li>
          Your waiting interval (between 10am and the next bus), in{' '}
          <span style={{ color: RED, fontWeight: 'bold' }}>red</span>. Is this 1/2 an hour?
        </li>
        <li>
          The interval between buses containing 10am, in{' '}
          <span style={{ color: GREEN, fontWeight: 'bold' }}>green</span>. How does this compare to the average 1 hour between consecutive buses?
        </li>
      </ul>
      <Markdown>{`
      `}</Markdown>
      <ArrivalsTimelineWidget highlightTenAm />
    </>
  );
}
