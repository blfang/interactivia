import Markdown from '../../../components/Markdown';
import MultipleTestingPlot from '../components/MultipleTestingPlot';
import styles from './Step5.module.css';

export default function Step5() {
  return (
    <>
      <Markdown>{`
In general if we have $m$ tests, we can require each individual test to be mistaken only $5\\%/m$ of the time, rather than $5\\%$ of the time.
This is known as the Bonferroni correction.

For **m independent tests**, the probability of at least one mistake with Bonferroni correction is
$1 - (1 - 0.05/m)^m$.

Compare this to the uncorrected probability: $1 - (1 - 0.05)^m$.

Notice how the Bonferroni-corrected curve (green) stays below 0.05 even as the number of tests increases, while the uncorrected curve (blue) rises quickly toward 1.
      `}</Markdown>
      <div className={styles.plotContainer}>
        <MultipleTestingPlot width={600} height={400} showSecondCurve={true} showPoints={false} />
      </div>
    </>
  );
}