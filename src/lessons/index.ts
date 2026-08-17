import type { Lesson } from './types';
import markovInequality from './markov-inequality/lesson';
import simpsonsParadox from './simpsons-paradox/lesson';
import multipleTesting from './multiple-testing/lesson';
import inspectionParadox from './inspection-paradox/lesson';
import leverageInRegression from './leverage-in-regression/lesson';

export const LESSONS: Lesson[] = [
  simpsonsParadox,
  multipleTesting,
  leverageInRegression,
  inspectionParadox,
  markovInequality,
];

export function getLessonById(id: string | undefined): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export type { Lesson, StepProps } from './types';