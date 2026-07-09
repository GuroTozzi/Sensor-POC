import { useEffect, useRef, useState } from "react";
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

  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartMouse = useRef<{ x: number; y: number } | null>(null);
  const dragStartPan = useRef<{ x: number; y: number } | null>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(view3D.zoom);
  zoomRef.current = view3D.zoom;

  useEffect(() => {
    const el = canvasBoxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      updateView3D({ zoom: Math.max(0.5, Math.min(2.4, zoomRef.current - e.deltaY * 0.002)) });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [updateView3D]);

  const sample = sampleAt(simulatedTime);
  const amplitudeX = Math.abs(sample.channelX ?? 0);
  const amplitudeY = Math.abs(sample.channelY ?? 0);

  function handleMouseDown(e: React.MouseEvent) {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartPan.current = { x: view3D.panX, y: view3D.panY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDraggingRef.current || !dragStartMouse.current || !dragStartPan.current) return;
    const dx = e.clientX - dragStartMouse.current.x;
    const dy = e.clientY - dragStartMouse.current.y;
    updateView3D({
      panX: dragStartPan.current.x + dx * 0.006,
      panY: dragStartPan.current.y - dy * 0.006,
    });
  }

  function handleMouseUp() {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartMouse.current = null;
    dragStartPan.current = null;
  }

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

        <div
          ref={canvasBoxRef}
          className={styles.canvasBox}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
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
