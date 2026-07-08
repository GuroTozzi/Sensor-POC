import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { SensorStatus } from "../data/types";
import styles from "./ConnectionTimeline.module.css";

interface TimelineEntry {
  status: Extract<SensorStatus, "starting" | "ready" | "unreachable">;
  title: string;
  description: string;
}

const ENTRIES: TimelineEntry[] = [
  {
    status: "unreachable",
    title: "Non raggiungibile",
    description: "Sensore non raggiungibile. Verifica la connessione.",
  },
  {
    status: "starting",
    title: "In avvio",
    description: "Connessione in corso e inizializzazione del sensore in atto.",
  },
  {
    status: "ready",
    title: "Pronto",
    description: "Sensore connesso e pronto. Dati in tempo reale disponibili.",
  },
];

const ICONS = {
  starting: Loader2,
  ready: CheckCircle2,
  unreachable: XCircle,
};

const TONES = {
  starting: "amber",
  ready: "green",
  unreachable: "red",
};

export function ConnectionTimeline({ current }: { current: SensorStatus }) {
  const normalized = current === "lost" ? "unreachable" : current;

  return (
    <div className={styles.list}>
      {ENTRIES.map((entry, index) => {
        const Icon = ICONS[entry.status];
        const isCurrent = entry.status === normalized;
        const tone = TONES[entry.status];
        return (
          <div key={entry.status} className={[styles.item, isCurrent ? styles.current : ""].filter(Boolean).join(" ")}>
            <div className={styles.iconCol}>
              <span className={[styles.iconCircle, styles[tone]].join(" ")}>
                <Icon size={14} className={entry.status === "starting" && isCurrent ? "spin" : undefined} />
              </span>
              {index < ENTRIES.length - 1 && <span className={styles.connectorLine} />}
            </div>
            <div className={styles.textCol}>
              <span className={styles.title}>{entry.title}</span>
              <span className={styles.desc}>{entry.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
