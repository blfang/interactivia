import type { Lesson } from '../types';
import Intro from './steps/Intro';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Takeaways from './steps/Takeaways';
import Preview from './components/Preview';

const importanceSampling: Lesson = {
  id: 'importance-sampling',
  title: 'Importance Sampling',
  description:
    'Estimate a rare-event probability by naive simulation, watch it struggle, then fix it by sampling from a smarter distribution and reweighting.',
  steps: [Intro, Step2, Step3, Step4, Takeaways],
  stepTitles: [
    'The problem with rare events',
    'Estimating a common event',
    'Estimating a rare event',
    'Sampling where it matters',
    'Why reweighting works',
  ],
  preview: Preview,
};

export default importanceSampling;
