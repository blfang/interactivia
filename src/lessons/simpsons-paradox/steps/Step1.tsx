import Markdown from '../../../components/Markdown';
import Spoiler from '../../../components/Spoiler';
import ArrowPlots from '../components/ArrowPlots';
import styles from './Step1.module.css';
import type { StepProps } from '../../types';

export default function Step1({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
Drag the vectors in the "Group 1" and "Group 2" plots below, following these rules:
* The vectors must stay out of the gray area.
* In these two plots, the blue vector must be steeper than the green vector.

The "combined" plot below adds the two vectors together for each color.

**Goal: in the combined plot, make the sum of the green vectors steeper than the sum of the blue vectors.**
      `}</Markdown>
      <p className={styles.hint}>
        <strong>Hint:</strong>{' '}
        <Spoiler>
          Try making one group's green arrow long and steep, while the other
          group's blue arrow long and shallow.
        </Spoiler>
      </p>
      <ArrowPlots onParadoxChange={onCompleteChange} />
    </>
  );
}