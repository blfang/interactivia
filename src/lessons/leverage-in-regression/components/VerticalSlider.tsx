import styles from './VerticalSlider.module.css';

interface VerticalSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
  height?: number;
}

export default function VerticalSlider({ min, max, step, value, onChange, label, height = 220 }: VerticalSliderProps) {
  return (
    <div className={styles.container} style={{ height }}>
      <input
        type="range"
        className={styles.slider}
        style={{ width: height }}
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
