import { useState, useEffect, useRef } from 'react';
import MeanWidget from '../components/MeanWidget';
import type { Person } from '../components/MeanWidget';
import Markdown from '../../../components/Markdown';
import type { StepProps } from '../../types';

const PEOPLE: Person[] = [
  { label: 'A', value: 10, color: '#3b82f6' },
  { label: 'B', value: 30, color: '#10b981' },
  { label: 'C', value: 40, color: '#f59e0b' },
  { label: 'D', value: 60, color: '#ef4444' },
  { label: 'E', value: 80, color: '#8b5cf6' },
];

const TARGET = 20;

export default function MeanIntro({ onCompleteChange }: StepProps) {
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const onCompleteChangeRef = useRef(onCompleteChange);
  onCompleteChangeRef.current = onCompleteChange;

  const mean = people.reduce((sum, p) => sum + p.value, 0) / people.length;

  useEffect(() => {
    onCompleteChangeRef.current?.(mean === TARGET);
  }, [mean]);

  return (
    <>
      <Markdown>{`
The plot below shows how much money five people have.

**Goal: Modify each person's amount (by dragging them) so that the average amount among the five people is $20.**

Tips:

- For physical intuition, move the people such that the seesaw is balanced at $20.
- You can also drag each person's label.
      `}</Markdown>
      <MeanWidget
        people={PEOPLE}
        target={TARGET}
        onPeopleChange={setPeople}
        solveValues={[10, 10, 10, 20, 50]}
      />
    </>
  );
}