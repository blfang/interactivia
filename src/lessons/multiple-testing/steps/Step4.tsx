import Markdown from '../../../components/Markdown';
import MultipleChoiceQuestion from '../../../components/MultipleChoiceQuestion';
import SimulationGrid from '../components/SimulationGrid';
import type { StepProps } from '../../types';
import styles from './Step4.module.css';

const CORRECT_ANSWER = 'Decrease it';

const OPTIONS = [
  'Increase it',
  CORRECT_ANSWER,
  'Keep it the same',
];

export default function Step4({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
To keep the overall chance of at least one mistaken finding at 5% when running $m$ tests, we need to adjust each individual test's threshold for declaring a finding.

Should we **increase** or **decrease** each individual test's significance level from 5%?
      `}</Markdown>

      <MultipleChoiceQuestion
        options={OPTIONS}
        correctAnswer={CORRECT_ANSWER}
        onAnswerChange={onCompleteChange}
      >
        <div className={styles.explanation}>
          <Markdown>{`
Right! We need to make each individual test **more stringent**, so that it declares a finding only for more extreme values than before.

A natural way to do this: split the 5% budget evenly across the $m$ tests, giving each one a threshold of $0.05/m$. This is the **Bonferroni correction**.

For $m=25$ tests, that's $0.05/25=0.002=0.2\\%$: the test will only declare a finding when it encounters very extreme values.

Click **Simulate** repeatedly to see what happens when we use this more conservative threshold.
          `}</Markdown>
          <SimulationGrid numPlots={25} columns={5} cutoff={3.09} />
        </div>
      </MultipleChoiceQuestion>
    </>
  );
}
