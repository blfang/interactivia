import { useState, useEffect, useRef } from 'react';
import Markdown from '../../../components/Markdown';
import Spoiler from '../../../components/Spoiler';
import MathComponent from '../../../components/Math';
import MultipleTestingPlot from '../components/MultipleTestingPlot';
import type { StepProps } from '../../types';
import styles from './Step3.module.css';

const CORRECT_ANSWER = '1-(1-0.05)^m';

const ALL_OPTIONS = [
  '0.05',
  '1 - 0.05',
  '0.05m',
  '(1 - 0.05)m',
  '1-0.05m',
  '1-(1-0.05)m',
  '1-0.05^m',
  CORRECT_ANSWER
];

// Shuffle all options to display in random order
const OPTIONS = [...ALL_OPTIONS].sort(() => Math.random() - 0.5);

export default function Step3({ onCompleteChange }: StepProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Set<string>>(new Set());
  const [showPlot, setShowPlot] = useState(false);
  const onCompleteChangeRef = useRef(onCompleteChange);
  onCompleteChangeRef.current = onCompleteChange;

  const isCorrect = selectedAnswer === CORRECT_ANSWER;

  useEffect(() => {
    onCompleteChangeRef.current?.(isCorrect);
  }, [isCorrect]);

  const handleSelect = (value: string) => {
    if (selectedAnswer === null || selectedAnswer !== CORRECT_ANSWER) {
      setSelectedAnswer(value);
      if (value === CORRECT_ANSWER) {
        setShowPlot(true);
      } else {
        setIncorrectAnswers(prev => new Set(prev).add(value));
      }
    }
  };

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

      <div className={styles.buttonGrid}>
        {OPTIONS.map((option) => {
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={selectedAnswer === CORRECT_ANSWER && selectedAnswer !== option}
              className={`${styles.button} ${
                selectedAnswer === CORRECT_ANSWER && option === CORRECT_ANSWER
                  ? styles['button--correct']
                  : incorrectAnswers.has(option)
                  ? styles['button--incorrect']
                  : ''
              }`}
            >
              <MathComponent math={option} />
            </button>
          );
        })}
      </div>

      {showPlot && (
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
      )}
    </>
  );
}