import type { Lesson } from '../types';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Takeaways from './steps/Takeaways';
import Preview from './components/Preview';

const simpsonsParadox: Lesson = {
  id: 'simpsons-paradox',
  title: "Simpson's Paradox",
  description:
    "Discover how to create examples of Simpson's paradox by playing a game of dragging vectors.",
  steps: [Step1, Step2, Step3, Step4, Takeaways],
  stepTitles: ["A vector game", 'Relating vectors to ratios', 'Batting averages', 'Kidney stones treatments', 'Takeaways'],
  preview: Preview,
};

export default simpsonsParadox;