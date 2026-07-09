import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Visualization3D } from "../components/Visualization3D";
import { ThreeDViewportControls } from "../components/ThreeDViewportControls";
import { useAppState } from "../state/AppStateContext";
import { sampleAt, SAMPLE_RATE_HZ } from "../data/mockSensorData";
import type { SeriesPoint } from "../data/types";
import styles from "./VisualizationLayoutPage.module.css";

const FLAT_LINE: SeriesPoint[] = [
  { t: 0, correlation: 0, channelX: 0, channelY: 0 },
  { t: 120, correlation: 0, channelX: 0, channelY: 0 },
];

export function VisualizationLayoutPage() {
  const { simulatedTime, view3D, updateView3D, resetView3D, acquisition } = useAppState();

  // ── 3D interaction (shared view3D state, same as Vista 3D) ──
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartMouse = useRef<{ x: number; y: number } | null>(null);
  const dragStartPan = useRef<{ x: number; y: number } | null>(null);
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

  function stopDrag() {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartMouse.current = null;
    dragStartPan.current = null;
  }

  // ── 2D chart data ────────────────────────────────────────────
  const elapsedSeconds = acquisition.elapsedSeconds;

  const recordedData = useMemo(() => {
    if (elapsedSeconds <= 0) return FLAT_LINE;
    const step = 1 / SAMPLE_RATE_HZ;
    const points: SeriesPoint[] = [];
    for (let t = 0; t <= Math.min(elapsedSeconds, 120) + 1e-6; t += step) {
      points.push(sampleAt(Number(t.toFixed(3))));
    }
    return points;
  }, [elapsedSeconds]);

  const data = elapsedSeconds > 0 ? recordedData : FLAT_LINE;

  const xAxis = {
    dataKey: "t",
    type: "number" as const,
    domain: [0, 120] as [number, number],
    ticks: [0, 60, 120],
    tick: { fontSize: 10, fill: "var(--text-muted)" },
    tickLine: false,
    axisLine: { stroke: "var(--border-soft)" },
  };

  const yAxis = {
    domain: [-0.4, 0.4] as [number, number],
    ticks: [-0.4, 0, 0.4],
    tickFormatter: (v: number) => v.toFixed(1),
    tick: { fontSize: 10, fill: "var(--text-muted)" },
    tickLine: false,
    axisLine: false,
    width: 38,
  };

  const lineProps = {
    dot: false,
    isAnimationActive: false,
    connectNulls: false,
    strokeWidth: 1.5,
  };

  return (
    <div className={styles.page}>
      <div className={styles.splitGrid}>

        {/* ── Left: 3D panel ──────────────────────────────── */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Vista 3D</span>
          </div>
          <div
            ref={canvasBoxRef}
            className={styles.canvasBox}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
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
            <div className={styles.vpOverlay}>
              <ThreeDViewportControls
                onZoomIn={() => updateView3D({ zoom: Math.min(2.4, view3D.zoom + 0.15) })}
                onZoomOut={() => updateView3D({ zoom: Math.max(0.5, view3D.zoom - 0.15) })}
                onPan={(dx, dy) => updateView3D({ panX: view3D.panX + dx, panY: view3D.panY + dy })}
                onReset={resetView3D}
              />
            </div>
          </div>
        </div>

        {/* ── Right: 2D charts stacked ─────────────────────── */}
        <div className={styles.rightCol}>

          {/* Oscillazione */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Oscillazione</span>
              <div className={styles.legend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "var(--accent-purple-light)" }} />
                  Canale 1
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "var(--accent-cyan)" }} />
                  Canale 2
                </span>
              </div>
            </div>
            <div className={styles.chartFill}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -8 }}>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis {...xAxis} />
                  <YAxis {...yAxis} />
                  <Line type="monotone" dataKey="channelX" stroke="var(--accent-purple-light)" {...lineProps} />
                  <Line type="monotone" dataKey="channelY" stroke="var(--accent-cyan)" {...lineProps} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Qualità correlazione */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Qualità correlazione</span>
            </div>
            <div className={styles.chartFill}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -8 }}>
                  <CartesianGrid stroke="var(--border-soft)" vertical={false} />
                  <XAxis {...xAxis} />
                  <YAxis {...yAxis} />
                  <Line type="monotone" dataKey="correlation" stroke="var(--accent-purple-light)" {...lineProps} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
