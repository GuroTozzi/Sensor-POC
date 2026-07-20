import {
  Activity,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Radar,
  Settings,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";
import type { SensorStatus } from "../data/types";
import styles from "./Sidebar.module.css";

function connectionRouteForStatus(status: SensorStatus): string {
  if (status === "unreachable" || status === "lost") return "/connection/unreachable";
  if (status === "starting") return "/connection/starting";
  return "/connection/ready";
}

function statusDotColor(status: SensorStatus): string {
  if (status === "unreachable" || status === "lost") return "var(--accent-red)";
  if (status === "starting" || status === "reconfiguring") return "var(--accent-amber)";
  return "var(--accent-green)";
}

export function Sidebar() {
  const { sensorStatus, addToast } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("sidebar-collapsed") === "true"
  );

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  const isUnlocked =
    sensorStatus !== "unreachable" && sensorStatus !== "starting" && sensorStatus !== "lost";

  const navEntries = [
    {
      label: "Connessione",
      icon: <Wifi size={17} />,
      path: "/connection",
      onClick: () => navigate(connectionRouteForStatus(sensorStatus)),
    },
    ...(isUnlocked
      ? [
          {
            label: "Visualizzazione",
            icon: <Activity size={17} />,
            path: "/visualization",
            onClick: () => navigate("/visualization/graphs"),
          },
        ]
      : []),
  ];

  const dotColor = statusDotColor(sensorStatus);
  const sidebarClass = [styles.sidebar, collapsed ? styles.sidebarCollapsed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClass}>

      {/* ── Collapse / expand toggle ──────────────────── */}
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Espandi menu" : "Riduci menu"}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* ── Nav ──────────────────────────────────────── */}
      <nav className={styles.nav}>
        {navEntries.map((entry) => (
          <button
            key={entry.label}
            type="button"
            title={collapsed ? entry.label : undefined}
            className={[
              styles.navItem,
              location.pathname.startsWith(entry.path) ? styles.active : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={entry.onClick}
          >
            <span className={styles.navIcon}>{entry.icon}</span>
            <span className={styles.navLabel}>{entry.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Footer: Configurazione → Aiuto ───────────── */}
      <div className={styles.footer}>
        <button
          type="button"
          title={collapsed ? "Configurazione" : undefined}
          className={[
            styles.navItem,
            location.pathname.startsWith("/configuration") ? styles.active : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => navigate("/configuration")}
        >
          <span className={styles.navIcon}>
            <Settings size={17} />
          </span>
          <span className={styles.navLabel}>Configurazione</span>
        </button>

        <button
          type="button"
          title={collapsed ? "Aiuto" : undefined}
          className={styles.navItem}
          onClick={() => addToast("Aiuto: schermata non inclusa in questo prototipo.", "info")}
        >
          <span className={styles.navIcon}>
            <HelpCircle size={17} />
          </span>
          <span className={styles.navLabel}>Aiuto</span>
        </button>
      </div>

      {/* ── Brand + status dot ───────────────────────── */}
      <div className={styles.brandBottom}>
        <div className={styles.logoWrap}>
          <div className={styles.logo}>
            <Radar size={20} />
          </div>
          <span
            className={styles.statusBadge}
            style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
            aria-hidden="true"
          />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Telesensore</span>
          <span className={styles.brandVersion}>v1.0.0</span>
        </div>
      </div>

    </aside>
  );
}
