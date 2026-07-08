import { Activity, Box, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";
import styles from "../pages/VisualizationPage.module.css";

export function VisualizationToolbar({ active }: { active: "graphs" | "3d" }) {
  const navigate = useNavigate();
  const { addToast } = useAppState();

  return (
    <div className={styles.toolbar}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Visualizzazione</h1>
        <span className={styles.subtitle}>Dati in tempo reale dal telesensore</span>
      </div>
      <div className={styles.viewSwitch}>
        <button
          type="button"
          className={styles.switchButton}
          onClick={() => addToast("Layout: schermata non inclusa in questo prototipo.", "info")}
        >
          <LayoutGrid size={16} />
          Layout
        </button>
        <button
          type="button"
          className={[styles.switchButton, active === "3d" ? styles.active : ""].filter(Boolean).join(" ")}
          onClick={() => navigate("/visualization/3d")}
        >
          <Box size={16} />
          Vista 3D
        </button>
        <button
          type="button"
          className={[styles.switchButton, active === "graphs" ? styles.active : ""].filter(Boolean).join(" ")}
          onClick={() => navigate("/visualization/graphs")}
        >
          <Activity size={16} />
          Vista Grafici
        </button>
      </div>
    </div>
  );
}
