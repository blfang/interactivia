import type { ComponentType } from 'react';

export interface StepProps {
  title?: string;
  onCompleteChange?: (complete: boolean) => void;
}

export interface Lesson {
  /** Unique URL slug, e.g. "markov-inequality" */
  id: string;
  /** Display title shown on the lessons index page */
  title: string;
  /** Short description shown on the index page */
  description: string;
  /** Ordered step components that make up the lesson */
  steps: ComponentType<StepProps>[];
  /** Titles for each step */
  stepTitles?: string[];
  /** Small preview widget shown on the lessons index page */
  preview?: ComponentType;
}
