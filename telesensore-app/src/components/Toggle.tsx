import styles from "./Toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={[styles.wrapper, disabled ? styles.disabled : ""].filter(Boolean).join(" ")}>
      {label && <span className={styles.label}>{label}</span>}
      <span
        className={[styles.track, checked ? styles.on : ""].filter(Boolean).join(" ")}
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className={styles.thumb} />
      </span>
    </label>
  );
}
