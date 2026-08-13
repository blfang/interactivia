import Markdown from '../../../components/Markdown';
import CorrelatedTestingPlot from '../components/CorrelatedTestingPlot';

export default function Step6() {
  return (
    <>
      <Markdown>{`
The previous plot assumed the $m$ tests were independent. But what if they're correlated — for example, several jelly bean colors tested using overlapping data?

Suppose the $m$ test statistics come from a multivariate normal distribution where every pair has the same correlation $\\rho$. Drag the slider below to change $\\rho$ from 0 (independent) to 1 (perfectly correlated), and see how the probability of at least one mistaken discovery changes, both without correction (blue) and with the Bonferroni correction (green).
      `}</Markdown>
      <CorrelatedTestingPlot width={600} height={400} />
      <Markdown>{`
When $\\rho = 0$, this matches the plot from before. As $\\rho \\to 1$, all $m$ tests start behaving like a single test: the uncorrected error rate stays flat around 5%, while the Bonferroni-corrected rate keeps shrinking, toward $0.05/m$.

Either way, the Bonferroni-corrected curve (green) never rises above 5% — no matter how correlated the tests are.
      `}</Markdown>
    </>
  );
}
