import { useMemo, useState, type ChangeEvent } from 'react';
import MathComponent from '../../../components/Math';
import styles from './DragBlank.module.css';

export interface DragBlankOption {
  id: string;
  /** KaTeX source, used to render the confirmed answer once resolved. */
  label: string;
  /** Plain text shown in the dropdown (native <option> can't render KaTeX). */
  text: string;
}

interface DragBlankProps {
  options: DragBlankOption[];
  correctId: string;
  onResolved?: () => void;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DragBlank({ options, correctId, onResolved }: DragBlankProps) {
  const shuffled = useMemo(() => shuffle(options), [options]);
  const [selectedId, setSelectedId] = useState('');
  const [resolved, setResolved] = useState(false);

  const correctOption = options.find((o) => o.id === correctId)!;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id === correctId) {
      setResolved(true);
      onResolved?.();
    }
  };

  if (resolved) {
    return (
      <span className={styles.resolved}>
        <MathComponent math={correctOption.label} />
      </span>
    );
  }

  const isWrong = selectedId !== '' && selectedId !== correctId;

  return (
    <select
      className={`${styles.select} ${isWrong ? styles.selectWrong : ''}`}
      value={selectedId}
      onChange={handleChange}
    >
      <option value="" disabled>
        ?
      </option>
      {shuffled.map((option) => (
        <option key={option.id} value={option.id}>
          {option.text}
        </option>
      ))}
    </select>
  );
}
