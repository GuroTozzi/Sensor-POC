import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./NumericInput.module.css";

interface NumericInputProps {
  label: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  precision?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function NumericInput({
  label,
  value,
  unit,
  step = 1,
  min,
  max,
  precision = 2,
  disabled = false,
  onChange,
}: NumericInputProps) {
  const clamp = (v: number) => {
    let next = v;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return Number(next.toFixed(precision));
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={[styles.inputRow, disabled ? styles.disabled : ""].filter(Boolean).join(" ")}>
        <input
          className={styles.input}
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            if (!Number.isNaN(parsed)) onChange(clamp(parsed));
          }}
        />
        {unit && <span className={styles.unit}>{unit}</span>}
        <span className={styles.stepper}>
          <button
            type="button"
            className={styles.stepButton}
            disabled={disabled || (max !== undefined && value >= max)}
            onClick={() => onChange(clamp(value + step))}
            aria-label="Aumenta"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            className={styles.stepButton}
            disabled={disabled || (min !== undefined && value <= min)}
            onClick={() => onChange(clamp(value - step))}
            aria-label="Diminuisci"
          >
            <ChevronDown size={12} />
          </button>
        </span>
      </div>
    </div>
  );
}
