import Markdown from '../../../components/Markdown';
import MultipleChoiceQuestion from '../../../components/MultipleChoiceQuestion';
import ClassSizeWidget from '../components/ClassSizeWidget';

const CORRECT_ANSWER = 'Higher than 30';
const OPTIONS = ['Lower than 30', 'Equal to 30', CORRECT_ANSWER];

export default function ClassSize() {
  return (
    <>
      <Markdown>{`
A school has 4 classes: two of size 50, and two of size 10. The average class size is (50+50+10+10) / 4 = 30.

Suppose we survey 20 random students and ask each how big their class is, then average their 20 answers.
Will this survey average tend to be...
      `}</Markdown>

      <MultipleChoiceQuestion options={OPTIONS} correctAnswer={CORRECT_ANSWER}>
        <Markdown>{`
Right! Because the large classes have far more students in them, they're more likely to be surveyed — so the average answer tends to come out well above 30.

Try it yourself below.
        `}</Markdown>
        <ClassSizeWidget />

        <Markdown>{`
This is the **inspection paradox**: the thing you "inspect" (a randomly chosen student, or — as we'll see next — a randomly chosen moment in time) tends to land in a larger-than-average interval or group.
      `}</Markdown>
      </MultipleChoiceQuestion>
    </>
  );
}
