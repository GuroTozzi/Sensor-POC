import type { ReactNode } from "react";
import styles from "./BottomStatusBar.module.css";

export function BottomStatusBar({ children }: { children: ReactNode }) {
  return <div className={styles.bar}>{children}</div>;
}

export function StatusSegment({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={styles.segment}>
      <div className={styles.segmentHeader}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export function StatusRow({ label, value, tone }: { label: string; value: ReactNode; tone?: "green" }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={[styles.rowValue, tone === "green" ? styles.green : ""].filter(Boolean).join(" ")}>
        {value}
      </span>
    </div>
  );
}

export function StatusActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
