import { useState, type ReactNode } from 'react';

interface SpoilerProps {
  children: ReactNode;
}

export default function Spoiler({ children }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={() => setRevealed(true)}
      style={{
        cursor: 'pointer',
        backgroundColor: revealed ? 'transparent' : 'gray',
        color: revealed ? 'inherit' : 'gray',
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </span>
  );
}