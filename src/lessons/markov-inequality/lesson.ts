import type { Lesson } from '../types';
import MeanIntro from './steps/MeanIntro';
import Example1 from './steps/Example1';
import Example2 from './steps/Example2';
import Example3 from './steps/Example3';
import Example4 from './steps/Example4';
import Example5 from './steps/Example5';
import TableSummary from './steps/TableSummary';
import MeanPersistent from './steps/MeanPersistent';
import BinomialPMF from './steps/BinomialPMF';
import Takeaways from './steps/Takeaways';
import Preview from './components/Preview';

const markovInequality: Lesson = {
  id: 'markov-inequality',
  title: "Markov's Inequality",
  description:
    "Build intuition for Markov's inequality by sliding probability mass along a number line.",
  steps: [
    MeanIntro,
    Example1,
    Example2,
    Example3,
    Example4,
    Example5,
    TableSummary,
    MeanPersistent,
    BinomialPMF,
    Takeaways,
  ],
  stepTitles: [
    'A lean, mean seesaw machine',
    'How many rich people can there be?',
    'How many rich people can there be? (Part 2)',
    'How many rich people can there be? (Part 3)',
    'How many rich people can there be? (Part 4)',
    'How many rich people can there be? (Part 5)',
    'Intuition and a pattern',
    'Proving the bound: slide to the left',
    'Proving the bound: slide to the left',
    'Takeaways',
  ],
  preview: Preview,
};

export default markovInequality;