import type { Lesson } from '../types';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Preview from './components/Preview';

const leverageInRegression: Lesson = {
  id: 'leverage-in-regression',
  title: 'Leverage in Regression',
  description: 'See how a single point can dominate a regression fit, depending on how far it sits from the center of the other predictors.',
  steps: [Step1, Step2, Step3],
  stepTitles: ['One point, two positions', 'Leverage in higher dimensions', 'Distance is not enough'],
  preview: Preview,
};

export default leverageInRegression;
