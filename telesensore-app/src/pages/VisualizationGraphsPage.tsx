import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { SeriesPoint } from "../data/types";
import { CorrelationChart } from "../components/CorrelationChart";
import { OscillationChart } from "../components/OscillationChart";
import { useAppState } from "../state/AppStateContext";
import { sampleAt, SAMPLE_RATE_HZ } from "../data/mockSensorData";
import type { VisualizationOutletContext } from "./VisualizationLayout";
import styles from "./VisualizationPage.module.css";

const FLAT_LINE: SeriesPoint[] = [
  { t: 0, correlation: 0, channelX: 0, channelY: 0 },
  { t: 120, correlation: 0, channelX: 0, channelY: 0 },
];

export function VisualizationGraphsPage() {
  const { sensorStatus, acquisition, config, updateVisParam } = useAppState();
  const { hasUnsavedData } = useOutletContext<VisualizationOutletContext>();

  const isAcquiring = sensorStatus === "acquiring";
  const elapsedSeconds = acquisition.elapsedSeconds;
  const windowSeconds = config.visualization.timeWindow;

  const recordedData = useMemo(() => {
    if (elapsedSeconds <= 0) return [];
    const step = 1 / SAMPLE_RATE_HZ;
    const points: SeriesPoint[] = [];
    for (let t = 0; t <= Math.min(elapsedSeconds, 120) + 1e-6; t += step) {
      points.push(sampleAt(Number(t.toFixed(3))));
    }
    return points;
  }, [elapsedSeconds]);

  const preAcquisition = !isAcquiring && !hasUnsavedData;
  const data = preAcquisition ? FLAT_LINE : recordedData;

  return (
    <div className={styles.chartsColumn}>
      <CorrelationChart
        data={data}
        now={elapsedSeconds}
        windowSeconds={windowSeconds}
        onWindowChange={(seconds) => updateVisParam({ timeWindow: seconds })}
        showPeaks={config.visualization.showCorrelationPeaks}
        onTogglePeaks={(value) => updateVisParam({ showCorrelationPeaks: value })}
      />
      <OscillationChart
        data={data}
        now={elapsedSeconds}
        windowSeconds={windowSeconds}
        showFFT={config.visualization.showFFT}
        onToggleFFT={(value) => updateVisParam({ showFFT: value })}
      />
    </div>
  );
}
