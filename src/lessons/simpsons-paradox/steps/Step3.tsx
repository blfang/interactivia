import Markdown from '../../../components/Markdown';
import JeterJustice from '../components/JeterJustice';

export default function Step3() {
  return (
    <>
      <Markdown>{`

In baseball, a player's batting average is *hits / at-bats*. A higher average means a
steeper line from the origin.

In **1995**, David Justice had a higher batting average than Derek Jeter.
In **1996**, Justice again had a higher batting average than Jeter.

Yet when we combine both years, Jeter's overall average is higher than Justice's!

- Jeter: 12/48 (1995) and 183/582 (1996) = **195/630 overall**
- Justice: 104/411 (1995) and 45/140 (1996) = **149/551 overall**

The imbalance in the number of at-bats drives the paradox: Jeter had most of his at-bats in a good
year, while Justice had most of his in a bad year.
      `}</Markdown>
      <JeterJustice />
    </>
  );
}