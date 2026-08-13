import Markdown from '../../../components/Markdown';
import UnionBoundWidget from '../components/UnionBoundWidget';

export default function Step7() {
  return (
    <>
      <Markdown>{`
In the previous plot, the Bonferroni-corrected curve stayed at or below 5% no matter how correlated the tests were — even when every test was driven by the same underlying random variable. Why does the correction hold up so well, when the exact formula $1-(1-0.05)^m$ only applies to **independent** tests?

It turns out Bonferroni works for a reason that has nothing to do with independence: the **union bound**.

For *any* events $A_1, \\dots, A_m$ — independent, dependent, anything —

$$P(A_1 \\cup A_2 \\cup \\dots \\cup A_m) \\le P(A_1) + P(A_2) + \\dots + P(A_m).$$

Below, each red circle is an event $A_i$ with a fixed probability. Drag the slider to change how much the events overlap.
      `}</Markdown>
      <UnionBoundWidget />
      <Markdown>{`
Notice that the union (the actual red-shaded area) is always **less than or equal to** the sum of the individual probabilities — with equality only when the events can't happen together (mutually exclusive), and shrinking as they overlap more. This holds no matter how the events depend on each other.

Now let $A_i$ be the event that test $i$ makes a mistake. If we use the Bonferroni correction — requiring each test to be mistaken with probability at most $0.05/m$ — the union bound gives

$$P(\\text{at least one mistake}) = P(A_1 \\cup \\dots \\cup A_m) \\le \\sum_{i=1}^m P(A_i) \\le m \\times \\frac{0.05}{m} = 0.05.$$

This bound doesn't require the tests to be independent. Unlike the exact formula $1-(1-0.05)^m$ from before, which only holds for independent tests, Bonferroni keeps the overall chance of a mistaken discovery at or below 5% **regardless of how the tests depend on each other**.
      `}</Markdown>
    </>
  );
}
