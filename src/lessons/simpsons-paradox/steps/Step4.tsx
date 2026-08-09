import Markdown from '../../../components/Markdown';
import KidneyStones from '../components/KidneyStones';

export default function Step4() {
  return (
    <>
      <Markdown>{`
Here is a [real study](https://www.bmj.com/content/309/6967/1480.full) comparing two treatments for kidney stones.

The ratio *successes / cases* is the success rate. A steeper line from the origin means a higher success rate.

For patients with **small stones**, Treatment A succeeded in 81/87 cases (93.1%), better than Treatment B's 234/270 (86.7%).

For patients with **large stones**, Treatment A again succeeded in 192/263 cases (73.0%), better than Treatment B's 55/80 (68.75%).

Yet when all patients are combined, Treatment B looks better overall:

- Treatment A: (81 + 192) / (87 + 263) = **273/350 (78.0%)**
- Treatment B: (234 + 55) / (270 + 80) = **289/350 (82.6%)**

The paradox is driven by the confounder: Treatment B was used mostly on the easier small-stone cases, while Treatment A was used mostly on the harder large-stone cases.
      `}</Markdown>
      <KidneyStones />
    </>
  );
}