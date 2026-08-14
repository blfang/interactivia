import { useState, type ReactNode } from 'react';
import styles from './Spoiler.module.css';

interface SpoilerProps {
  children: ReactNode;
}

export default function Spoiler({ children }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={() => setRevealed(true)}
      className={`${styles.spoiler} ${revealed ? styles.revealed : styles.hidden}`}
    >
      {children}
    </span>
  );
}
