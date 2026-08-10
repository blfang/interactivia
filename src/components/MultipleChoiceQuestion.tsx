import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './MultipleChoiceQuestion.module.css';

interface MultipleChoiceQuestionProps {
  /** Answer options; each must be a unique string (used as both key and default label). */
  options: string[];
  correctAnswer: string;
  /** Customize how an option is displayed, e.g. rendering it as math. Defaults to plain text. */
  renderOption?: (option: string) => ReactNode;
  /** Randomize option order on mount. Defaults to true. */
  shuffle?: boolean;
  /** Called whenever the "is the current selection correct" status changes, including on mount. */
  onAnswerChange?: (isCorrect: boolean) => void;
  /** Rendered below the options once the correct answer has been selected. */
  children?: ReactNode;
}

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MultipleChoiceQuestion({
  options,
  correctAnswer,
  renderOption = (option) => option,
  shuffle = true,
  onAnswerChange,
  children,
}: MultipleChoiceQuestionProps) {
  const [displayOptions] = useState(() =>
    shuffle ? shuffleArray(options) : options,
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Set<string>>(
    new Set(),
  );

  const isCorrect = selectedAnswer === correctAnswer;
  const onAnswerChangeRef = useRef(onAnswerChange);
  onAnswerChangeRef.current = onAnswerChange;

  useEffect(() => {
    onAnswerChangeRef.current?.(isCorrect);
  }, [isCorrect]);

  const handleSelect = (value: string) => {
    if (selectedAnswer === null || selectedAnswer !== correctAnswer) {
      setSelectedAnswer(value);
      if (value !== correctAnswer) {
        setIncorrectAnswers((prev) => new Set(prev).add(value));
      }
    }
  };

  return (
    <>
      <div className={styles.buttonGrid}>
        {displayOptions.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={isCorrect && selectedAnswer !== option}
            className={`${styles.button} ${
              isCorrect && option === correctAnswer
                ? styles['button--correct']
                : incorrectAnswers.has(option)
                  ? styles['button--incorrect']
                  : ''
            }`}
          >
            {renderOption(option)}
          </button>
        ))}
      </div>
      {isCorrect && children}
    </>
  );
}
