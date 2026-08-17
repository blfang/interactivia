import type { Lesson } from '../types';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import Step7 from './steps/Step7';
import Preview from './components/Preview';

const multipleTesting: Lesson = {
  id: 'multiple-testing',
  title: 'Multiple Testing',
  description: 'See how running multiple tests without adjusting the significance level can lead to mistaken discoveries ("green jelly beans cause acne!"), and learn one way to address this.',
  steps: [Step1, Step2, Step3, Step4, Step5, Step6, Step7],
  stepTitles: ['Finding something from nothing',
    'Finding something from a lot of nothing',
    'Probability of at least one false discovery',
    "There's levels to this",
    "Bonferroni correction",
    'Simulating correlated tests',
    'What if the tests are dependent?'],
  preview: Preview,
};

export default multipleTesting;
