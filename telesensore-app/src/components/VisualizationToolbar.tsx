import type { ReactNode } from "react";
import { Activity, Box, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../pages/VisualizationPage.module.css";

export function VisualizationToolbar({
  active,
  rightSlot,
}: {
  active: "graphs" | "3d" | "layout";
  rightSlot?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.toolbar}>
      <div className={styles.viewSwitch}>
        <button
          type="button"
          className={[styles.switchButton, active === "layout" ? styles.active : ""].filter(Boolean).join(" ")}
          onClick={() => navigate("/visualization/layout")}
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
          Vista 2D
        </button>
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </div>
  );
}
