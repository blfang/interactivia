import type { Lesson } from '../types';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Preview from './components/Preview';

const multipleTesting: Lesson = {
  id: 'multiple-testing',
  title: 'Multiple Testing',
  description: 'Multiple Testing',
  steps: [Step1, Step2, Step3, Step4, Step5],
  stepTitles: ['Finding something from nothing',
    'Finding something from a lot of nothing',
    'Probability of at least one mistaken discovery',
    'Being stricter about findings',
    "Bonferroni correction"],
  preview: Preview,
};

export default multipleTesting;
