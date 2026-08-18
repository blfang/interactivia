import styles from './VerticalSlider.module.css';

interface VerticalSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export default function VerticalSlider({ min, max, step, value, onChange, label }: VerticalSliderProps) {
  return (
    <div className={styles.container}>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
