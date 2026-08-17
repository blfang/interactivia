import Markdown from '../../../components/Markdown';
import ArrivalsTimelineWidget from '../components/ArrivalsTimelineWidget';

export default function ArrivalsTimeline() {
  return (
    <>
      <Markdown>{`
Imagine a bus stop where buses arrive at random throughout the day.
Each time a bus arrives, the time until the *next* bus is random, with a mean of 1 hour.

Watch the timeline below as it plays out. Each dot is an arrival, and the labeled bracket above it shows the length of the interval that just ended.

You can choose from three distributions for the time between arrivals (each having mean 1):
* Exponential: a common distribution used to model waiting times
* Uniform between 0 and 2 hours.
* An adversarial distribution where the waiting time is either a quick 0.2 hours or a grueling 5 hours.

At the top of the plot, we track of the running average of interval lengths. Check that it is close to 1 hour.
      `}</Markdown>
      <ArrivalsTimelineWidget />
    </>
  );
}
