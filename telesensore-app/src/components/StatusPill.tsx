import styles from "./StatusPill.module.css";

export type PillTone = "red" | "amber" | "green" | "purple" | "neutral";

interface StatusPillProps {
  label: string;
  tone: PillTone;
  pulsing?: boolean;
  className?: string;
}

export function StatusPill({ label, tone, pulsing = false, className }: StatusPillProps) {
  return (
    <span className={[styles.pill, styles[tone], className].filter(Boolean).join(" ")}>
      <span className={[styles.dot, pulsing ? "pulse" : ""].filter(Boolean).join(" ")} />
      {label}
    </span>
  );
}
