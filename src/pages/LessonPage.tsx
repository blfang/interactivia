import { useState, useCallback, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import type { StepProps } from '../lessons/types';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import styles from './LessonPage.module.css';

interface LessonPageProps {
  steps: ComponentType<StepProps>[];
  title?: string;
  stepTitles?: string[];
}

export default function LessonPage({ steps, title, stepTitles }: LessonPageProps) {
  const [step, setStep] = useState(0);
  const [hasReported, setHasReported] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const StepComponent = steps[step];

  const handleCompleteChange = useCallback((complete: boolean) => {
    setHasReported(true);
    setIsComplete(complete);
  }, []);

  // Reset completion state synchronously when navigating.
  // The newly mounted step component will report via onCompleteChange
  // in its own effect, which runs *before* any parent effects.
  const goToStep = (newStep: number) => {
    setHasReported(false);
    setIsComplete(false);
    setStep(newStep);
    window.scrollTo(0, 0);
  };

  return (
    <div className={styles.container}>
      <SiteHeader />
      {title && (
        <p className={styles.lessonTitle}>
          {title}
        </p>
      )}
      {stepTitles && stepTitles[step] && (
        <h2 className={styles.stepTitle}>
          {stepTitles[step]}
        </h2>
      )}
      <StepComponent onCompleteChange={handleCompleteChange} />

      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        {steps.map((_, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className={styles.navigation}>
        <button
          disabled={step === 0}
          onClick={() => goToStep(step - 1)}
          className={`${styles.button} ${step === 0 ? styles.buttonDisabled : styles.buttonSecondary}`}
        >
          ← Previous
        </button>

        <span className={styles.stepCounter}>
          {step + 1} / {steps.length}
        </span>

        {step < steps.length - 1 ? (
          <button
            disabled={hasReported && !isComplete}
            onClick={() => goToStep(step + 1)}
            className={`${styles.button} ${hasReported && !isComplete ? styles.buttonDisabled : styles.buttonPrimary}`}
          >
            Next →
          </button>
        ) : (
          <Link to="/" className={`${styles.button} ${styles.buttonPrimary}`}>
            Pick another lesson
          </Link>
        )}
      </div>
      <Footer />
    </div>
  );
}