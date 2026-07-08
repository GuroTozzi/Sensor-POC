import { Activity, Database, Info, Lock, RotateCcw, Save, SlidersHorizontal, SquareSlash, Wand2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Toggle } from "../components/Toggle";
import { NumericInput } from "../components/NumericInput";
import { StatusPill } from "../components/StatusPill";
import { useAppState } from "../state/AppStateContext";
import { TIME_WINDOW_OPTIONS } from "../data/mockSensorData";
import styles from "./ConfigurationPage.module.css";

export function ConfigurationPage() {
  const {
    sensorStatus,
    config,
    reconfiguring,
    updateSensorParam,
    updateVisParam,
    updateOutputFileName,
    resetConfig,
    saveConfig,
    view3D,
    updateView3D,
    resetView3D,
    startAcquisition,
    stopAcquisition,
    addToast,
  } = useAppState();

  const isAcquiring = sensorStatus === "acquiring";
  const sensorLocked = isAcquiring || reconfiguring;

  return (
    <AppLayout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Configurazione</h1>
          <p className={styles.subtitle}>Parametri del sensore e della visualizzazione</p>
        </div>
        {isAcquiring ? (
          <StatusPill label="In acquisizione — Parametri sensore bloccati" tone="purple" pulsing />
        ) : (
          <StatusPill label="Pronto e fermo — Modifiche consentite" tone="green" />
        )}
      </div>

      <div className={styles.banner}>
        <Info size={16} />
        <span>I parametri del sensore non possono essere modificati durante l'acquisizione.</span>
      </div>

      <div className={styles.cardsRow}>
        <Card
          title="Parametri sensore"
          headerExtra={
            sensorLocked ? (
              <span className={styles.lockedTag}>
                <Lock size={11} />
                Bloccati durante l'acquisizione
              </span>
            ) : config.dirty ? (
              <span className={styles.dirtyTag}>Modifiche non salvate</span>
            ) : undefined
          }
        >
          <div className={styles.fieldsGrid}>
            <NumericInput
              label="Frequenza acquisizione"
              value={config.sensor.acquisitionFrequency}
              unit="fps"
              step={10}
              min={1}
              max={5000}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("acquisitionFrequency", v)}
            />
            <NumericInput
              label="Esposizione"
              value={config.sensor.exposure}
              unit="ms"
              step={0.1}
              min={0.1}
              max={50}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("exposure", v)}
            />
            <NumericInput
              label="Gain"
              value={config.sensor.gain}
              unit="dB"
              step={1}
              min={0}
              max={60}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("gain", v)}
            />
            <NumericInput
              label="Soglia correlazione"
              value={config.sensor.correlationThreshold}
              step={0.05}
              min={0}
              max={1}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("correlationThreshold", v)}
            />
            <NumericInput
              label="Corr. ShortPass"
              value={config.sensor.corrShortPass}
              step={1}
              min={1}
              max={50}
              precision={0}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("corrShortPass", v)}
            />
            <NumericInput
              label="Corr. HighPass"
              value={config.sensor.corrHighPass}
              step={1}
              min={1}
              max={100}
              precision={0}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("corrHighPass", v)}
            />
          </div>
          <Button
            variant="secondary"
            fullWidth
            icon={<Wand2 size={16} />}
            disabled={sensorLocked}
            onClick={() => addToast("Esposizione regolata automaticamente.", "success")}
          >
            Regola esposizione
          </Button>
        </Card>

        <Card title="Visualizzazione">
          <div className={styles.vizControlsBlock}>
            <NumericInput
              label="Finestra temporale"
              value={config.visualization.timeWindow}
              unit="s"
              step={5}
              min={TIME_WINDOW_OPTIONS[0]}
              max={TIME_WINDOW_OPTIONS[TIME_WINDOW_OPTIONS.length - 1]}
              precision={0}
              onChange={(v) => updateVisParam({ timeWindow: v })}
            />

            <div className={styles.togglesRow}>
              <Toggle
                label="Mostra FFT"
                checked={config.visualization.showFFT}
                onChange={(v) => updateVisParam({ showFFT: v })}
              />
              <Toggle
                label="Mostra picchi correlazione"
                checked={config.visualization.showCorrelationPeaks}
                onChange={(v) => updateVisParam({ showCorrelationPeaks: v })}
              />
            </div>

            <div>
              <span className={styles.sectionLabel}>Controlli vista</span>
              <div className={styles.viewButtonsRow} style={{ marginTop: 8 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => updateView3D({ zoom: Math.min(2.4, view3D.zoom + 0.2) })}
                >
                  Zoom in
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => updateView3D({ zoom: Math.max(0.5, view3D.zoom - 0.2) })}
                >
                  Zoom out
                </Button>
                <Button variant="ghost" size="sm" fullWidth onClick={resetView3D}>
                  Reset vista
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.noteText}>
            <Info size={13} />
            Questi parametri possono essere modificati liberamente anche durante l'acquisizione.
          </div>
        </Card>
      </div>

      <Card title="Dati e sessione">
        <div className={styles.sessionCard}>
          <OutputFileNameField
            label="Nome file output"
            value={config.outputFileName}
            onChange={updateOutputFileName}
          />
          <div className={styles.sessionButtons}>
            <Button
              variant="secondary"
              icon={<Database size={16} />}
              onClick={() => addToast(`Dati salvati in ${config.outputFileName}.csv`, "success")}
            >
              Salva dati
            </Button>
            <Button
              variant="secondary"
              icon={<SquareSlash size={16} />}
              onClick={() => addToast("Anteprima avviata (simulata).", "info")}
            >
              Avvia anteprima
            </Button>
            {isAcquiring ? (
              <Button variant="danger" icon={<Activity size={16} />} onClick={stopAcquisition}>
                Ferma acquisizione
              </Button>
            ) : (
              <Button variant="primary" icon={<Activity size={16} />} onClick={startAcquisition}>
                Avvia acquisizione
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className={styles.actionBar}>
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={resetConfig} disabled={!config.dirty}>
          Reset
        </Button>
        <Button
          variant="primary"
          icon={<Save size={16} />}
          loading={reconfiguring}
          onClick={saveConfig}
        >
          {reconfiguring ? "Riconfigurazione in corso..." : "Salva configurazione"}
        </Button>
      </div>
    </AppLayout>
  );
}

function OutputFileNameField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.fileField}>
      <span className={styles.fileLabel}>
        <SlidersHorizontal size={12} />
        {label}
      </span>
      <input className={styles.fileInput} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
