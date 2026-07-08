import { Camera, Cpu, Flag, Lock, MapPin, Pause, Play, Radio, SignalHigh } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { VisualizationToolbar } from "../components/VisualizationToolbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { NumericInput } from "../components/NumericInput";
import { Visualization3D } from "../components/Visualization3D";
import { ThreeDViewportControls } from "../components/ThreeDViewportControls";
import { BottomStatusBar, StatusActions, StatusRow, StatusSegment } from "../components/BottomStatusBar";
import { useAppState } from "../state/AppStateContext";
import { sampleAt, SENSOR_INFO, TIME_WINDOW_OPTIONS } from "../data/mockSensorData";
import type { DataQualityState, ThreeDShape } from "../data/types";
import styles from "./Visualization3DPage.module.css";

const SHAPES: { id: ThreeDShape; label: string }[] = [
  { id: "cube", label: "Cubo" },
  { id: "box", label: "Parallelepipedo" },
  { id: "sphere", label: "Sfera" },
];

const DATA_STATES: { id: DataQualityState; label: string }[] = [
  { id: "valid", label: "Dato valido" },
  { id: "unreliable", label: "Dato inaffidabile" },
  { id: "missing", label: "Dato mancante" },
];

function formatDuration(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function Visualization3DPage() {
  const {
    sensorStatus,
    simulatedTime,
    acquisition,
    config,
    view3D,
    updateView3D,
    resetView3D,
    updateVisParam,
    pauseAcquisition,
    resumeAcquisition,
    addToast,
  } = useAppState();

  const sample = sampleAt(simulatedTime);
  const amplitudeX = Math.abs(sample.channelX ?? 0);
  const amplitudeY = Math.abs(sample.channelY ?? 0);
  const isAcquiring = sensorStatus === "acquiring";

  return (
    <AppLayout>
      <VisualizationToolbar active="3d" />

      <div className={styles.grid}>
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
              <span className={styles.axisChip} style={{ color: "var(--accent-cyan)" }}>
                <span className={styles.axisDot} style={{ background: "var(--accent-cyan)" }} />Y
              </span>
              <span className={styles.axisChip} style={{ color: "var(--accent-purple-light)" }}>
                <span className={styles.axisDot} style={{ background: "var(--accent-purple-light)" }} />X
              </span>
            </div>
          </div>
        </Card>

        <div className={styles.sidePanel}>
          <Card title="Parametri di visualizzazione">
            <div className={styles.fieldGroup}>
              <div>
                <span className={styles.controlLabel}>Finestra temporale</span>
                <select
                  className={styles.select}
                  value={config.visualization.timeWindow}
                  onChange={(e) => updateVisParam({ timeWindow: Number(e.target.value) })}
                >
                  {TIME_WINDOW_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}s
                    </option>
                  ))}
                </select>
              </div>

              <NumericInput
                label="Scala amplificazione movimento"
                value={view3D.amplification}
                step={1}
                min={1}
                max={40}
                precision={0}
                onChange={(value) => updateView3D({ amplification: value })}
              />

              <div>
                <span className={styles.controlLabel}>Qualità dato attuale</span>
                <span className={styles.qualityValue}>
                  {sample.correlation !== null ? sample.correlation.toFixed(2) : "N/D"}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Stato dato">
            <div className={styles.dataStateGroup}>
              {DATA_STATES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={[
                    styles.dataStateButton,
                    view3D.dataState === d.id ? styles.active : "",
                    view3D.dataState === d.id ? styles[d.id] : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => updateView3D({ dataState: d.id })}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Controlli vista">
            <ThreeDViewportControls
              onZoomIn={() => updateView3D({ zoom: Math.min(2.4, view3D.zoom + 0.2) })}
              onZoomOut={() => updateView3D({ zoom: Math.max(0.5, view3D.zoom - 0.2) })}
              onPan={(dx, dy) => updateView3D({ panX: view3D.panX + dx * 0.4, panY: view3D.panY + dy * 0.4 })}
              onReset={resetView3D}
            />
          </Card>
        </div>
      </div>

      <BottomStatusBar>
        <StatusSegment icon={<Radio size={14} />} title="Stato acquisizione">
          <StatusRow
            label="Stato"
            value={isAcquiring ? (acquisition.isPaused ? "In pausa" : "In acquisizione") : "Inattivo"}
            tone={isAcquiring && !acquisition.isPaused ? "green" : undefined}
          />
          <StatusRow label="Durata" value={formatDuration(acquisition.elapsedSeconds)} />
          <StatusRow label="Pacchetti ricevuti" value={acquisition.packetsReceived.toLocaleString("it-IT")} />
        </StatusSegment>

        <StatusSegment icon={<MapPin size={14} />} title="Posizione corrente">
          <StatusRow label="Nodo" value="TS-04" />
          <StatusRow label="Punto di misura" value="P12" />
          <StatusRow label="Tempo sistema" value={formatDuration(simulatedTime)} />
        </StatusSegment>

        <StatusSegment icon={<SignalHigh size={14} />} title="Segnale">
          <StatusRow label="Qualità segnale" value="Eccellente" tone="green" />
          <StatusRow label="Ampiezza max" value={`${Math.max(amplitudeX, amplitudeY).toFixed(3)} mm`} />
        </StatusSegment>

        <StatusSegment icon={<Cpu size={14} />} title="Sensore">
          <StatusRow label="Modello" value={SENSOR_INFO.model} />
          <StatusRow label="Numero di serie" value={SENSOR_INFO.serialNumber} />
          <StatusRow label="Temperatura" value="27.8 °C" />
        </StatusSegment>

        <StatusSegment icon={<Flag size={14} />} title="Azioni rapide">
          <StatusActions>
            {isAcquiring ? (
              <Button
                variant="primary"
                size="sm"
                icon={acquisition.isPaused ? <Play size={14} /> : <Pause size={14} />}
                onClick={() => (acquisition.isPaused ? resumeAcquisition() : pauseAcquisition())}
              >
                {acquisition.isPaused ? "Riprendi acquisizione" : "Pausa acquisizione"}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" disabled icon={<Pause size={14} />}>
                Pausa acquisizione
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<Camera size={14} />}
              onClick={() => addToast("Screenshot salvato.", "success")}
            >
              Screenshot
            </Button>
          </StatusActions>
        </StatusSegment>
      </BottomStatusBar>
    </AppLayout>
  );
}
