import { useState, useMemo } from "react";
import { AlertTriangle, Play, Save, Square } from "lucide-react";
import type { SeriesPoint } from "../data/types";
import { AppLayout } from "../components/AppLayout";
import { VisualizationToolbar } from "../components/VisualizationToolbar";
import { CorrelationChart } from "../components/CorrelationChart";
import { OscillationChart } from "../components/OscillationChart";
import { Button } from "../components/Button";
import { useAppState } from "../state/AppStateContext";
import { sampleAt, SAMPLE_RATE_HZ } from "../data/mockSensorData";
import { useLiveClock } from "../hooks/useLiveClock";
import styles from "./VisualizationPage.module.css";

const FLAT_LINE: SeriesPoint[] = [
  { t: 0, correlation: 0, channelX: 0, channelY: 0 },
  { t: 120, correlation: 0, channelX: 0, channelY: 0 },
];

export function VisualizationGraphsPage() {
  const {
    sensorStatus,
    acquisition,
    config,
    updateVisParam,
    startAcquisition,
    stopAcquisition,
    addToast,
  } = useAppState();

  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isAcquiring = sensorStatus === "acquiring";
  const isLive = isAcquiring && !acquisition.isPaused;
  const liveTime = useLiveClock(isLive, 0);

  const windowSeconds = config.visualization.timeWindow;

  // Recording mode: grow data from t=0 to t=liveTime, filling the chart left→right
  const recordedData = useMemo(() => {
    if (liveTime <= 0) return [];
    const step = 1 / SAMPLE_RATE_HZ;
    const points: SeriesPoint[] = [];
    for (let t = 0; t <= Math.min(liveTime, 120) + 1e-6; t += step) {
      points.push(sampleAt(Number(t.toFixed(3))));
    }
    return points;
  }, [liveTime]);

  const preAcquisition = !isAcquiring && !hasUnsavedData;
  const data = preAcquisition ? FLAT_LINE : recordedData;

  function handleStartAcquisition() {
    if (hasUnsavedData) {
      setShowConfirmDialog(true);
      return;
    }
    startAcquisition();
  }

  function handleStopAcquisition() {
    stopAcquisition();
    setHasUnsavedData(true);
  }

  function handleSaveData() {
    addToast("Dati salvati sul dispositivo.", "success");
    setHasUnsavedData(false);
  }

  function handleConfirmDiscard() {
    setShowConfirmDialog(false);
    setHasUnsavedData(false);
    startAcquisition();
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <VisualizationToolbar
          active="graphs"
          rightSlot={
            isAcquiring ? (
              <Button variant="stop" size="md" icon={<Square size={16} />} onClick={handleStopAcquisition}>
                Ferma acquisizione
              </Button>
            ) : (
              <Button variant="success" size="md" icon={<Play size={16} />} onClick={handleStartAcquisition}>
                Avvia acquisizione
              </Button>
            )
          }
        />

        {hasUnsavedData && !isAcquiring && (
          <div className={styles.unsavedBanner}>
            <AlertTriangle size={16} />
            <span>Ci sono dati di misurazione da salvare prima di avviare una nuova analisi.</span>
            <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSaveData}>
              Salva dati
            </Button>
          </div>
        )}

        <div className={styles.chartsColumn}>
          <CorrelationChart
            data={data}
            now={liveTime}
            windowSeconds={windowSeconds}
            onWindowChange={(seconds) => updateVisParam({ timeWindow: seconds })}
            showPeaks={config.visualization.showCorrelationPeaks}
            onTogglePeaks={(value) => updateVisParam({ showCorrelationPeaks: value })}
          />
          <OscillationChart
            data={data}
            now={liveTime}
            windowSeconds={windowSeconds}
            showFFT={config.visualization.showFFT}
            onToggleFFT={(value) => updateVisParam({ showFFT: value })}
          />
        </div>


      </div>

      {showConfirmDialog && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmHeader}>
              <AlertTriangle size={20} color="var(--accent-amber)" />
              Dati non salvati
            </div>
            <p className={styles.confirmBody}>
              Sei sicuro di voler avviare una nuova analisi? Ci sono dati da salvare: se procedi verranno scartati.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost" size="md" onClick={() => setShowConfirmDialog(false)}>
                Annulla
              </Button>
              <Button variant="stop" size="md" onClick={handleConfirmDiscard}>
                Procedi e scarta i dati
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
