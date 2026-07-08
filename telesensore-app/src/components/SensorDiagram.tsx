import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import tabletImage from "../assets/devices/tablet.png";
import telesensoreImage from "../assets/devices/telesensore.png";
import styles from "./SensorDiagram.module.css";

interface SensorDiagramProps {
  state: "unreachable" | "starting" | "ready";
}

export function SensorDiagram({ state }: SensorDiagramProps) {
  const circleClass =
    state === "unreachable" ? styles.danger : state === "starting" ? styles.active : styles.success;
  const lineClass = state === "unreachable" ? styles.danger : state === "starting" ? styles.active : styles.success;

  return (
    <div className={styles.wrapper}>
      <div className={styles.node}>
        <div className={[styles.nodeCircle, circleClass].join(" ")}>
          <img src={tabletImage} alt="Tablet" className={styles.nodeImage} />
          {state === "unreachable" && (
            <span className={[styles.badge, styles.badgeDanger].join(" ")}>
              <X size={12} />
            </span>
          )}
          {state === "ready" && (
            <span className={[styles.badge, styles.badgeSuccess].join(" ")}>
              <CheckCircle2 size={12} />
            </span>
          )}
        </div>
        <span className={styles.nodeLabel}>Tablet</span>
      </div>

      <div className={styles.connector}>
        {state === "unreachable" ? (
          <>
            <div className={[styles.line, lineClass].join(" ")} />
            <span className={styles.gapIcon}>
              <X size={18} />
            </span>
          </>
        ) : (
          <>
            <div className={[styles.line, lineClass].join(" ")} />
            {state === "starting" && (
              <motion.span
                className={styles.pulseSegment}
                animate={{ left: ["0%", "92%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </>
        )}
      </div>

      <div className={styles.node}>
        <div className={[styles.nodeCircle, circleClass].join(" ")}>
          <img src={telesensoreImage} alt="Telesensore" className={styles.nodeImage} />
          {state === "unreachable" && (
            <span className={[styles.badge, styles.badgeDanger].join(" ")}>
              <X size={12} />
            </span>
          )}
          {state === "ready" && (
            <span className={[styles.badge, styles.badgeSuccess].join(" ")}>
              <CheckCircle2 size={12} />
            </span>
          )}
        </div>
        <span className={styles.nodeLabel}>Telesensore</span>
      </div>
    </div>
  );
}
