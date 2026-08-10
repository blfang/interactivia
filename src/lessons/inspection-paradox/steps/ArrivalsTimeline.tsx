import Markdown from '../../../components/Markdown';
import ArrivalsTimelineWidget from '../components/ArrivalsTimelineWidget';

export default function ArrivalsTimeline() {
  return (
    <>
      <Markdown>{`
Picture a bus stop where buses arrive at random throughout the day. Each time a bus arrives, the average waiting time until the *next* bus is one hour. So on average, an hour passes between arrivals, but the actual gaps vary.

Watch the timeline below as it plays out. Each dot is an arrival, and the labeled bracket above it shows the length of the interval that just ended.

You can try choosing a different time interval distribution, but each one has mean equal to 1 hour.
      `}</Markdown>
      <ArrivalsTimelineWidget />
    </>
  );
}
