import { useState, useEffect, useRef } from 'react';
import MeanWidget from '../components/MeanWidget';
import type { Person } from '../components/MeanWidget';
import RunningTable from '../components/RunningTable';
import type { TableRow } from '../components/RunningTable';
import Markdown from '../../../components/Markdown';
import { EXAMPLE_DATA, optimalK } from './exampleData';
import type { StepProps } from '../../types';

const PEOPLE: Person[] = [
  { label: 'A', value: 10, color: '#3b82f6' },
  { label: 'B', value: 30, color: '#10b981' },
  { label: 'C', value: 40, color: '#f59e0b' },
  { label: 'D', value: 60, color: '#ef4444' },
  { label: 'E', value: 80, color: '#8b5cf6' },
  { label: 'F', value: 90, color: '#ec4899' },
];

const MY_INDEX = 3;
const ME = EXAMPLE_DATA[MY_INDEX];

export default function Example4({ onCompleteChange }: StepProps) {
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const [k, setK] = useState(
    PEOPLE.filter((p) => p.value >= ME.threshold).length,
  );
  const onCompleteChangeRef = useRef(onCompleteChange);
  onCompleteChangeRef.current = onCompleteChange;

  const mean = people.reduce((sum, p) => sum + p.value, 0) / people.length;
  const optimal = optimalK(ME.mean, ME.threshold, ME.n);

  useEffect(() => {
    onCompleteChangeRef.current?.(mean === ME.mean && k === optimal);
  }, [mean, k, optimal]);

  const rows: TableRow[] = [
    ...EXAMPLE_DATA.slice(0, MY_INDEX).map((d) => ({
      mean: d.mean,
      threshold: d.threshold,
      n: d.n,
      k: optimalK(d.mean, d.threshold, d.n),
    })),
    { mean: ME.mean, threshold: ME.threshold, n: ME.n, k },
  ];

  const handlePeopleChange = (updated: Person[]) => {
    setPeople(updated);
    setK(updated.filter((p) => p.value >= ME.threshold).length);
  };

  return (
    <>
      <Markdown>{`
Let's try an example with six people. **Maximize the number of people with at least \\$50.** Are you finding a general strategy?
      `}</Markdown>
      <MeanWidget
        people={PEOPLE}
        target={ME.mean}
        threshold={ME.threshold}
        onPeopleChange={handlePeopleChange}
        solveValues={[0, 0, 0, 0, 50, 70]}
        optimalK={optimal}
      />
      <RunningTable rows={rows} currentIndex={MY_INDEX} />
    </>
  );
}