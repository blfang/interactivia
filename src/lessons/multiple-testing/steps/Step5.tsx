import Markdown from '../../../components/Markdown';
import MultipleTestingPlot from '../components/MultipleTestingPlot';
import styles from './Step5.module.css';
import { COLOR_PRIMARY, COLOR_SUCCESS } from '../../../styles/colors';

export default function Step5() {
  return (
    <>
      <Markdown>{`
As you just saw, requiring each individual test to be mistaken only $5\\%/m$ of the time — the Bonferroni correction — keeps the overall chance of a mistake under control.

For **m independent tests**, the probability of at least one mistake with Bonferroni correction is
$1 - (1 - 0.05/m)^m$.

Compare this to the uncorrected probability: $1 - (1 - 0.05)^m$.
      `}</Markdown>
      <p>
        Notice how the Bonferroni-corrected curve (
        <span style={{ color: COLOR_SUCCESS, fontWeight: 'bold' }}>green</span>) stays below 0.05 even as
        the number of tests increases, while the uncorrected curve (
        <span style={{ color: COLOR_PRIMARY, fontWeight: 'bold' }}>blue</span>) rises quickly toward 1.
      </p>
      <div className={styles.plotContainer}>
        <MultipleTestingPlot width={600} height={400} showSecondCurve={true} showPoints={false} />
      </div>
    </>
  );
}