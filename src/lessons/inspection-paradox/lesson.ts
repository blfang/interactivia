import type { Lesson } from '../types';
import ClassSize from './steps/ClassSize';
import ArrivalsTimeline from './steps/ArrivalsTimeline';
import ArrivalsParadox from './steps/ArrivalsParadox';
import ExpectedLength from './steps/ExpectedLength';
import Preview from './components/Preview';

const inspectionParadox: Lesson = {
  id: 'inspection-paradox',
  title: 'Inspection Paradox',
  description:
    'Watch buses arrive at a bus stop throughout the day, and see why the bus you are waiting for seems to take longer to arrive.',
  steps: [ClassSize, ArrivalsTimeline, ArrivalsParadox, ExpectedLength],
  stepTitles: [
    'Class size',
    'Arrivals throughout the day',
    'Inspecting at 10am',
    'How much longer, exactly?',
  ],
  preview: Preview,
};

export default inspectionParadox;
