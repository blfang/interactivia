import Markdown from '../../../components/Markdown';
import CorrelatedTestingPlot from '../components/CorrelatedTestingPlot';
import { COLOR_PRIMARY, COLOR_SUCCESS, COLOR_DANGER } from '../../../styles/colors';

export default function Step6() {
  return (
    <>
      <Markdown>{`
The previous plot assumed the $m$ tests were independent. But what if they're correlated?
      `}</Markdown>
      <p>
        (Maybe blue jelly beans' acne-causing properties are correlated with red ones.)
      </p>
      <Markdown>{`
In general, we don't necessarily know how different tests are correlated.
Despite this, the Bonferroni correction still keeps the probability of a false discovery below 5%.

For illustration, we can consider a specific example correlation structure where each pair of tests has correlation $\\rho$.
Drag the slider below to change $\\rho$ from 0 (uncorrelated) to 1 (perfectly correlated), and see how the probability of at least one false discovery changes.
      `}</Markdown>
      <p>
        The plot below shows the results both without correction (
        <span style={{ color: COLOR_PRIMARY, fontWeight: 'bold' }}>blue</span>) and with the Bonferroni
        correction (<span style={{ color: COLOR_SUCCESS, fontWeight: 'bold' }}>green</span>).
      </p>
      <CorrelatedTestingPlot width={600} height={400} />
      <Markdown>{`
When $\\rho = 0$, this matches the plot from before. As $\\rho \\to 1$, all $m$ tests start behaving like a single test: the uncorrected error rate stays flat around 5%, while the Bonferroni-corrected rate keeps shrinking, toward $0.05/m$.
      `}</Markdown>
      <p>
        Either way, for this particular correlation structure, the Bonferroni-corrected curve (
        <span style={{ color: COLOR_SUCCESS, fontWeight: 'bold' }}>green</span>) stays below 5%, no matter how correlated the tests are.
        Is this true in general? Why can the Bonferroni correction keep the probability of a false discovery below 5% despite not knowing the correlation structure at all?
      </p>
    </>
  );
}
