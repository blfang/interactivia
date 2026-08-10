import Markdown from '../../../components/Markdown';
import Spoiler from '../../../components/Spoiler';
import MathComponent from '../../../components/Math';
import MultipleChoiceQuestion from '../../../components/MultipleChoiceQuestion';
import MultipleTestingPlot from '../components/MultipleTestingPlot';
import type { StepProps } from '../../types';
import styles from './Step3.module.css';

const CORRECT_ANSWER = '1-(1-0.05)^m';

const OPTIONS = [
  '0.05',
  '1 - 0.05',
  '0.05m',
  '(1 - 0.05)m',
  '1-0.05m',
  '1-(1-0.05)m',
  '1-0.05^m',
  CORRECT_ANSWER,
];

export default function Step3({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
When an individual test has a 5% chance of mistakenly discovering something when there is nothing, what is the probability of at least one mistaken discovery among **m independent tests**?
      `}</Markdown>

      <p className={styles.hint}>
        <strong>Hint:</strong>{' '}
        <Spoiler>
          What is the complement of "at least one mistake?"
        </Spoiler>
      </p>

      <MultipleChoiceQuestion
        options={OPTIONS}
        correctAnswer={CORRECT_ANSWER}
        renderOption={(option) => <MathComponent math={option} />}
        onAnswerChange={onCompleteChange}
      >
        <div className={styles.plotContainer}>
          <div className={styles.plotWrapper}>
            <div className={styles.explanation}>
              <Markdown>{`
Right! Here's the reasoning:

- The probability of **no mistake** in a single test is $1 - 0.05 = 0.95$.
- For **m independent tests**, the probability of no mistakes in all tests is $(1 - 0.05)^m$.
- The probability of **at least one mistake** is the complement: $1 - (1 - 0.05)^m$.

If we plot this against $m$, we see the probability of at least one mistake grows very quickly: it is 72% when there are 25 tests, which matches what you may have seen in the previous example!
              `}</Markdown>
            </div>

            <h3 className={styles.plotTitle}>
              Probability of at least one mistake vs. number of tests
            </h3>
            <MultipleTestingPlot width={600} height={400} />
            <div className={styles.explanation}>
              <Markdown>{`
As long as you have a large number of tests,
there is a high chance of a mistaken discovery.
This problem is known as **multiple testing.**
              `}</Markdown>
            </div>
          </div>
        </div>
      </MultipleChoiceQuestion>
    </>
  );
}