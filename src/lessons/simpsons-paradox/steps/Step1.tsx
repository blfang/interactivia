import Markdown from '../../../components/Markdown';
import Spoiler from '../../../components/Spoiler';
import ArrowPlots from '../components/ArrowPlots';
import styles from './Step1.module.css';
import type { StepProps } from '../../types';
import { COLOR_PRIMARY as BLUE, COLOR_SUCCESS as GREEN, COLOR_TEXT_MUTED as GRAY } from '../../../styles/colors';

export default function Step1({ onCompleteChange }: StepProps) {
  return (
    <>
      <Markdown>{`
Drag the vectors in the "Group 1" and "Group 2" plots below, following these rules:
      `}</Markdown>
      <ul>
        <li>
          The vectors must stay out of the{' '}
          <span style={{ color: GRAY, fontWeight: 'bold' }}>gray</span> area.
        </li>
        <li>
          In these two plots, the{' '}
          <span style={{ color: BLUE, fontWeight: 'bold' }}>blue</span> vector
          must be steeper than the{' '}
          <span style={{ color: GREEN, fontWeight: 'bold' }}>green</span>{' '}
          vector.
        </li>
      </ul>
      <Markdown>{`
The "combined" plot below adds the two vectors together for each color.
      `}</Markdown>
      <p>
        <strong>
          Goal: in the combined plot, make the sum of the{' '}
          <span style={{ color: GREEN }}>green</span> vectors steeper than the
          sum of the <span style={{ color: BLUE }}>blue</span> vectors.
        </strong>
      </p>
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
