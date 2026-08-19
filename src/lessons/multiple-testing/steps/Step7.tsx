import Markdown from '../../../components/Markdown';
import MathComponent from '../../../components/Math';
import UnionBoundWidget from '../components/UnionBoundWidget';

const RED = '#ef4444'; // matches UnionBoundWidget's circle color

export default function Step7() {
  return (
    <>
      <Markdown>{`
It turns out Bonferroni works because of the **union bound**.

For *any* events $A_1, \\dots, A_m$ (can be independent or dependent),

$$P(A_1 \\cup A_2 \\cup \\dots \\cup A_m) \\le P(A_1) + P(A_2) + \\dots + P(A_m).$$
      `}</Markdown>
      <p>
        Below, each <span style={{ color: RED, fontWeight: 'bold' }}>red</span> circle is an event{' '}
        <MathComponent math="A_i" /> with a fixed probability. Drag the slider to change how much the
        events overlap.
      </p>
      <UnionBoundWidget />
      <p>
        Notice that the union (the actual{' '}
        <span style={{ color: RED, fontWeight: 'bold' }}>red</span>-shaded area) is always{' '}
        <strong>less than or equal to</strong> the sum of the individual probabilities — with equality
        only when the events can't happen together (mutually exclusive), and shrinking as they overlap
        more. This holds no matter how the events depend on each other.
      </p>
      <Markdown>{`
Now let $A_i$ be the event that test $i$ makes a mistake. If we use the Bonferroni correction — requiring each test to be mistaken with probability at most $0.05/m$ — the union bound gives

$$P(\\text{at least one mistake}) = P(A_1 \\cup \\dots \\cup A_m) \\le \\sum_{i=1}^m P(A_i) \\le m \\times \\frac{0.05}{m} = 0.05.$$

This bound doesn't require the tests to be independent. Unlike the exact formula $1-(1-0.05)^m$ from before, which only holds for independent tests, Bonferroni keeps the overall chance of a mistaken discovery at or below 5% **regardless of how the tests depend on each other**.
      `}</Markdown>
    </>
  );
}
