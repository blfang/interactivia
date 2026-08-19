import { useEffect, useState } from 'react';
import Markdown from '../../../components/Markdown';
import MathComponent from '../../../components/Math';
import DragBlank, { type DragBlankOption } from '../components/DragBlank';
import type { StepProps } from '../../types';
import styles from './ExpectedLength.module.css';
import { COLOR_SUCCESS as GREEN, COLOR_DANGER as RED } from '../../../styles/colors';

interface Blank {
  id: string;
  correct: DragBlankOption;
  distractors: DragBlankOption[];
}

const PROOF_BLANKS: Blank[] = [
  {
    id: 'proof-term1',
    correct: { id: 'proof-term1-correct', label: 'E[X^2]', text: 'E[X²]' },
    distractors: [
      { id: 'proof-term1-d1', label: 'E[X]', text: 'E[X]' },
      { id: 'proof-term1-d2', label: '\\text{Var}(X)', text: 'Var(X)' },
    ],
  },
  {
    id: 'proof-term2',
    correct: { id: 'proof-term2-correct', label: 'E[X]^2', text: 'E[X]²' },
    distractors: [
      { id: 'proof-term2-d1', label: 'E[X]', text: 'E[X]' },
      { id: 'proof-term2-d2', label: '2E[X]', text: '2E[X]' },
    ],
  },
  {
    id: 'proof-relation',
    correct: { id: 'proof-relation-correct', label: '\\geq', text: '≥' },
    distractors: [
      { id: 'proof-relation-d1', label: '\\leq', text: '≤' },
      { id: 'proof-relation-d2', label: '=', text: '=' },
    ],
  },
  {
    id: 'proof-then',
    correct: { id: 'proof-then-correct', label: '\\geq', text: '≥' },
    distractors: [
      { id: 'proof-then-d1', label: '\\leq', text: '≤' },
      { id: 'proof-then-d2', label: '=', text: '=' },
    ],
  },
  {
    id: 'proof-final',
    correct: { id: 'proof-final-correct', label: '\\geq', text: '≥' },
    distractors: [
      { id: 'proof-final-d1', label: '\\leq', text: '≤' },
      { id: 'proof-final-d2', label: '=', text: '=' },
    ],
  },
];

function ExerciseBlank({
  blank,
  onResolved,
}: {
  blank: Blank;
  onResolved: (id: string) => void;
}) {
  return (
    <DragBlank
      options={[blank.correct, ...blank.distractors]}
      correctId={blank.correct.id}
      onResolved={() => onResolved(blank.id)}
    />
  );
}

export default function ExpectedLength({ onCompleteChange }: StepProps) {
  const [proofResolved, setProofResolved] = useState<Set<string>>(new Set());

  const proofComplete = proofResolved.size === PROOF_BLANKS.length;

  useEffect(() => {
    onCompleteChange?.(proofComplete);
  }, [proofComplete, onCompleteChange]);

  const resolveProof = (id: string) => setProofResolved((s) => new Set(s).add(id));

  return (
    <>
      <Markdown>{`
Let $X$ denote the time between two consecutive bus arrivals — the interval length you've been simulating.

It turns out the expected length of the interval containing a fixed time (like 10am) is
$E[X^2] / E[X]$.
      `}</Markdown>
      <p>
        This is the average length of the{' '}
        <span style={{ color: GREEN, fontWeight: 'bold' }}>green</span> intervals from the simulation.
      </p>
      <Markdown>{`
Also, the expected wait from that fixed time (10am) to the next arrival is half of that: $E[X^2] / (2E[X])$.
      `}</Markdown>
      <p>
        This is the average length of the{' '}
        <span style={{ color: RED, fontWeight: 'bold' }}>red</span> intervals from the simulation.
      </p>
      <Markdown>{`
Let's prove that this interval length is always greater than the mean, i.e. that $E[X^2]/E[X] > E[X]$.

Recall the definition of variance:
      `}</Markdown>
      <div className={styles.exerciseLine}>
        <MathComponent math="\text{Var}(X) =" />
        <ExerciseBlank blank={PROOF_BLANKS[0]} onResolved={resolveProof} />
        <MathComponent math="-" />
        <ExerciseBlank blank={PROOF_BLANKS[1]} onResolved={resolveProof} />
      </div>
      <div className={styles.exerciseLine}>
        <MathComponent math="\text{How does } \text{Var}(X) \text{ relate to } 0\text{?} \quad \text{Var}(X)" />
        <ExerciseBlank blank={PROOF_BLANKS[2]} onResolved={resolveProof} />
        <MathComponent math="0" />
      </div>
      <div className={styles.exerciseLine}>
        <MathComponent math="\text{So: } E[X^2]" />
        <ExerciseBlank blank={PROOF_BLANKS[3]} onResolved={resolveProof} />
        <MathComponent math="E[X]^2" />
      </div>
      <div className={styles.exerciseLine}>
        <MathComponent math="\text{Dividing both sides by } E[X] > 0 \text{:} \quad E[X^2]/E[X]" />
        <ExerciseBlank blank={PROOF_BLANKS[4]} onResolved={resolveProof} />
        <MathComponent math="E[X]" />
      </div>

      {proofComplete && (
        <Markdown>{`
That's the inspection paradox in one line: as long as $X$ isn't constant (so $\\text{Var}(X) > 0$), the interval you land in is expected to be **strictly longer** than a typical interval.
        `}</Markdown>
      )}
    </>
  );
}
