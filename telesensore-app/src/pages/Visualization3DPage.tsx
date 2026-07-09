import { Lock } from "lucide-react";
import { Card } from "../components/Card";
import { Visualization3D } from "../components/Visualization3D";
import { ThreeDViewportControls } from "../components/ThreeDViewportControls";
import { useAppState } from "../state/AppStateContext";
import { sampleAt } from "../data/mockSensorData";
import type { ThreeDShape } from "../data/types";
import styles from "./Visualization3DPage.module.css";

const SHAPES: { id: ThreeDShape; label: string }[] = [
  { id: "cube", label: "Cubo" },
  { id: "box", label: "Parallelepipedo" },
  { id: "sphere", label: "Sfera" },
];

export function Visualization3DPage() {
  const { simulatedTime, view3D, updateView3D, resetView3D } = useAppState();

  const sample = sampleAt(simulatedTime);
  const amplitudeX = Math.abs(sample.channelX ?? 0);
  const amplitudeY = Math.abs(sample.channelY ?? 0);

  return (
    <div className={styles.canvasWrapper}>
      <Card variant="elevated" className={styles.canvasCard}>
        <div className={styles.canvasHeader}>
          <div className={styles.shapeSwitch}>
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={[styles.shapeButton, view3D.shape === s.id ? styles.active : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => updateView3D({ shape: s.id })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.canvasBox}>
          <Visualization3D
            amplitudeX={amplitudeX}
            amplitudeY={amplitudeY}
            dataState={view3D.dataState}
            shape={view3D.shape}
            zoom={view3D.zoom}
            panX={view3D.panX}
            panY={view3D.panY}
            amplification={view3D.amplification}
          />

          <div className={styles.overlay}>
            <div className={styles.overlayValue}>
              Ampiezza X<strong>{amplitudeX.toFixed(3)} mm</strong>
            </div>
            <div className={styles.overlayValue}>
              Ampiezza Y<strong>{amplitudeY.toFixed(3)} mm</strong>
            </div>
          </div>

          <div className={styles.cameraBadge}>
            <Lock size={12} />
            Camera fissa
          </div>

          <div className={styles.axisGizmo}>
            <span className={styles.axisChip} style={{ color: "var(--accent-green)" }}>
              <span className={styles.axisDot} style={{ background: "var(--accent-green)" }} />Z
            </span>
            <span className={styles.axisChip} style={{ color: "#EF4444" }}>
              <span className={styles.axisDot} style={{ background: "#EF4444" }} />Y
            </span>
            <span className={styles.axisChip} style={{ color: "var(--accent-purple-light)" }}>
              <span className={styles.axisDot} style={{ background: "var(--accent-purple-light)" }} />X
            </span>
          </div>

          <div className={styles.viewportControlsOverlay}>
            <ThreeDViewportControls
              onZoomIn={() => updateView3D({ zoom: Math.min(2.4, view3D.zoom + 0.2) })}
              onZoomOut={() => updateView3D({ zoom: Math.max(0.5, view3D.zoom - 0.2) })}
              onPan={(dx, dy) => updateView3D({ panX: view3D.panX + dx * 0.4, panY: view3D.panY + dy * 0.4 })}
              onReset={resetView3D}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
