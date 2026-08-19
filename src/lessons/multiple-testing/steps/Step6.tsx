import Markdown from '../../../components/Markdown';
import CorrelatedTestingPlot from '../components/CorrelatedTestingPlot';

export default function Step6() {
  return (
    <>
      <Markdown>{`
The previous plot assumed the $m$ tests were independent. But what if they're correlated? (Maybe blue jelly beans' acne-causing properties are correlated with red ones.)
In general, we don't necessarily know how different tests are correlated.
Despite this, the Bonferroni correction still keeps the probability of a false discovery below 5%.

For illustration, we can consider a specific example correlation structure where each pair of tests has correlation $\\rho$.
Drag the slider below to change $\\rho$ from 0 (independent) to 1 (perfectly correlated), and see how the probability of at least one mistaken discovery changes, both without correction (blue) and with the Bonferroni correction (green).
      `}</Markdown>
      <CorrelatedTestingPlot width={600} height={400} />
      <Markdown>{`
When $\\rho = 0$, this matches the plot from before. As $\\rho \\to 1$, all $m$ tests start behaving like a single test: the uncorrected error rate stays flat around 5%, while the Bonferroni-corrected rate keeps shrinking, toward $0.05/m$.

Either way, for this particular correlation structure, the Bonferroni-corrected curve (green) stays below 5%, no matter how correlated the tests are.
Is this true in general? Why can the Bonferroni correction keep the probability of a false discovery below 5% despite not knowing the correlation structure at all?
      `}</Markdown>
    </>
  );
}
