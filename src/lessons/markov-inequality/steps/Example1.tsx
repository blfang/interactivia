import { useState, useEffect, useRef } from 'react';
import MeanWidget from '../components/MeanWidget';
import type { Person } from '../components/MeanWidget';
import Markdown from '../../../components/Markdown';
import { optimalK } from './exampleData';
import type { StepProps } from '../../types';

const PEOPLE: Person[] = [
  { label: 'A', value: 10, color: '#3b82f6' },
  { label: 'B', value: 30, color: '#10b981' },
  { label: 'C', value: 40, color: '#f59e0b' },
  { label: 'D', value: 60, color: '#ef4444' },
  { label: 'E', value: 80, color: '#8b5cf6' },
];

const TARGET = 20;
const THRESHOLD = 50;
const N = PEOPLE.length;

export default function Example1({ onCompleteChange }: StepProps) {
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const onCompleteChangeRef = useRef(onCompleteChange);
  onCompleteChangeRef.current = onCompleteChange;

  const mean = people.reduce((sum, p) => sum + p.value, 0) / people.length;
  const k = people.filter((p) => p.value >= THRESHOLD).length;
  const optimal = optimalK(TARGET, THRESHOLD, N);

  useEffect(() => {
    onCompleteChangeRef.current?.(mean === TARGET && k === optimal);
  }, [mean, k, optimal]);

  return (
    <>
      <Markdown>{`
Let's make it a little more interesting.
**While making the mean equal to \\$20, what is the maximum number of people having \\$50 or more?**
      `}</Markdown>
      <MeanWidget
        people={PEOPLE}
        target={TARGET}
        threshold={THRESHOLD}
        onPeopleChange={setPeople}
        solveValues={[0, 0, 0, 50, 50]}
        optimalK={optimal}
      />
    </>
  );
}