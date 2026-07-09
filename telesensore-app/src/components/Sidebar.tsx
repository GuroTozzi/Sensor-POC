import { Activity, HelpCircle, Radar, Settings, Wifi } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";
import type { SensorStatus } from "../data/types";
import styles from "./Sidebar.module.css";

function connectionRouteForStatus(status: SensorStatus): string {
  if (status === "unreachable" || status === "lost") return "/connection/unreachable";
  if (status === "starting") return "/connection/starting";
  return "/connection/ready";
}

interface NavEntry {
  label: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function Sidebar() {
  const { sensorStatus, addToast } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const isUnlocked = sensorStatus !== "unreachable" && sensorStatus !== "starting" && sensorStatus !== "lost";

  const goToUnavailable = (label: string) => {
    addToast(`${label}: schermata non inclusa in questo prototipo.`, "info");
  };

  const entries: NavEntry[] = [
    {
      label: "Connessione",
      icon: <Wifi size={17} />,
      match: (p) => p.startsWith("/connection"),
      onClick: () => navigate(connectionRouteForStatus(sensorStatus)),
    },
    ...(isUnlocked
      ? [
          {
            label: "Visualizzazione",
            icon: <Activity size={17} />,
            match: (p: string) => p.startsWith("/visualization"),
            onClick: () => navigate("/visualization/graphs"),
          },
          {
            label: "Configurazione",
            icon: <Settings size={17} />,
            match: (p: string) => p.startsWith("/configuration"),
            onClick: () => navigate("/configuration"),
          },
        ]
      : []),
  ];

  const statusMeta: Record<SensorStatus, { tone: string; title: string; subtitle: string }> = {
    unreachable: { tone: "var(--accent-red)", title: "Non raggiungibile", subtitle: "Verifica la connessione" },
    starting: { tone: "var(--accent-amber)", title: "In avvio", subtitle: "Inizializzazione in corso" },
    ready: { tone: "var(--accent-green)", title: "Sistema pronto", subtitle: "Tutto operativo" },
    acquiring: { tone: "var(--accent-purple-light)", title: "In acquisizione", subtitle: "Dati in arrivo" },
    reconfiguring: { tone: "var(--accent-amber)", title: "Riconfigurazione", subtitle: "Applico parametri..." },
    lost: { tone: "var(--accent-red)", title: "Connessione persa", subtitle: "Sensore non raggiungibile" },
  };

  const meta = statusMeta[sensorStatus];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <Radar size={20} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Telesensore</span>
          <span className={styles.brandVersion}>v1.0.0</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {entries.map((entry) => {
          const active = entry.match(location.pathname);
          return (
            <button
              key={entry.label}
              type="button"
              className={[styles.navItem, active ? styles.active : "", entry.disabled ? styles.disabled : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={entry.onClick}
            >
              <span className={styles.navIcon}>{entry.icon}</span>
              <span className={styles.navLabel}>{entry.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button type="button" className={styles.navItem} onClick={() => goToUnavailable("Aiuto")}>
          <span className={styles.navIcon}>
            <HelpCircle size={17} />
          </span>
          <span className={styles.navLabel}>Aiuto</span>
        </button>
      </div>

      <div className={styles.statusCard}>
        <span className={styles.statusDot} style={{ background: meta.tone, boxShadow: `0 0 8px ${meta.tone}` }} />
        <div className={styles.statusText}>
          <span className={styles.statusTitle}>{meta.title}</span>
          <span className={styles.statusSubtitle}>{meta.subtitle}</span>
        </div>
      </div>
    </aside>
  );
}
