import type { ReactNode } from "react";
import { Info } from "lucide-react";
import styles from "./Card.module.css";

interface CardProps {
  title?: string;
  tooltip?: string;
  headerExtra?: ReactNode;
  variant?: "default" | "elevated" | "soft";
  children: ReactNode;
  className?: string;
}

export function Card({ title, tooltip, headerExtra, variant = "default", children, className }: CardProps) {
  const variantClass = variant === "elevated" ? styles.elevated : variant === "soft" ? styles.soft : "";
  return (
    <div className={[styles.card, variantClass, className].filter(Boolean).join(" ")}>
      {(title || headerExtra) && (
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {tooltip && (
              <span className={styles.infoIcon} title={tooltip}>
                <Info size={14} />
              </span>
            )}
          </div>
          {headerExtra}
        </div>
      )}
      {children}
    </div>
  );
}
