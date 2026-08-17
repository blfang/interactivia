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

Since there is one hour on average between consecutive buses and you arrive somewhere between them, you might think you will wait 30 minutes on average.

In the simulation, we keep track of two new kinds of interval lengths:
      `}</Markdown>
      <ul>
        <li>
          Your waiting time until the next bus, in{' '}
          <span style={{ color: RED, fontWeight: 'bold' }}>red</span>. Was the above guess of "30 minutes on average" correct?
        </li>
        <li>
          The time between the bus just before and just after your arrival, in{' '}
          <span style={{ color: GREEN, fontWeight: 'bold' }}>green</span>. Is the the average the same as the 1 hour average between consecutive buses?
        </li>
      </ul>
      <Markdown>{`
      `}</Markdown>
      <ArrivalsTimelineWidget highlightTenAm />
    </>
  );
}
