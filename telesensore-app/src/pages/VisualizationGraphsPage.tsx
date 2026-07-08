import { Camera, Cpu, Flag, MapPin, Pause, Play, Radio, SignalHigh } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { VisualizationToolbar } from "../components/VisualizationToolbar";
import { CorrelationChart } from "../components/CorrelationChart";
import { OscillationChart } from "../components/OscillationChart";
import { BottomStatusBar, StatusActions, StatusRow, StatusSegment } from "../components/BottomStatusBar";
import { Button } from "../components/Button";
import { useAppState } from "../state/AppStateContext";
import { useWindowedSeries } from "../hooks/useWindowedSeries";
import { useLiveClock } from "../hooks/useLiveClock";
import { SENSOR_INFO } from "../data/mockSensorData";
import styles from "./VisualizationPage.module.css";

function formatDuration(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function VisualizationGraphsPage() {
  const { sensorStatus, acquisition, config, updateVisParam, pauseAcquisition, resumeAcquisition, addToast } =
    useAppState();

  const isAcquiring = sensorStatus === "acquiring";
  // The live feed keeps scrolling whenever the sensor is connected, like a
  // real monitoring instrument — formal "acquisizione" only governs whether
  // the session is being recorded/counted, not whether data is visible.
  const isLive =
    (sensorStatus === "ready" || sensorStatus === "acquiring" || sensorStatus === "reconfiguring") &&
    !(isAcquiring && acquisition.isPaused);
  const liveTime = useLiveClock(isLive, 120);

  const windowSeconds = config.visualization.timeWindow;
  const data = useWindowedSeries(liveTime, windowSeconds);
  const latest = data[data.length - 1];

  return (
    <AppLayout>
      <VisualizationToolbar active="graphs" />

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

      <BottomStatusBar>
        <StatusSegment icon={<Radio size={14} />} title="Stato acquisizione">
          <StatusRow
            label="Stato"
            value={isAcquiring ? (acquisition.isPaused ? "In pausa" : "In acquisizione") : "Inattivo"}
            tone={isAcquiring && !acquisition.isPaused ? "green" : undefined}
          />
          <StatusRow label="Durata" value={formatDuration(acquisition.elapsedSeconds)} />
          <StatusRow label="Frequenza campionamento" value={`${config.sensor.acquisitionFrequency.toFixed(0)} Hz`} />
          <StatusRow label="Pacchetti ricevuti" value={acquisition.packetsReceived.toLocaleString("it-IT")} />
          <StatusRow label="Perdite pacchetti" value={`${acquisition.packetsLost} (0.0%)`} />
        </StatusSegment>

        <StatusSegment icon={<MapPin size={14} />} title="Posizione corrente">
          <StatusRow label="Nodo" value="TS-04" />
          <StatusRow label="Punto di misura" value="P12" />
          <StatusRow label="Tempo sistema" value={formatDuration(liveTime)} />
        </StatusSegment>

        <StatusSegment icon={<SignalHigh size={14} />} title="Segnale">
          <StatusRow label="Qualità segnale" value="Eccellente" tone="green" />
          <StatusRow label="Livello RMS Ch1" value={`${Math.abs(latest?.channelX ?? 0).toFixed(3)} mm`} />
          <StatusRow label="Livello RMS Ch2" value={`${Math.abs(latest?.channelY ?? 0).toFixed(3)} mm`} />
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
              icon={<Flag size={14} />}
              onClick={() => addToast("Evento segnato sulla timeline.", "success")}
            >
              Segna evento
            </Button>
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
