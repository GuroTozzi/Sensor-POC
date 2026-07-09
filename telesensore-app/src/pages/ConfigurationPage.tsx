import { AlertTriangle, Lock, RotateCcw, Save, Wand2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { NumericInput } from "../components/NumericInput";
import { StatusPill } from "../components/StatusPill";
import { useAppState } from "../state/AppStateContext";
import styles from "./ConfigurationPage.module.css";

export function ConfigurationPage() {
  const {
    sensorStatus,
    config,
    reconfiguring,
    updateSensorParam,
    resetConfig,
    saveConfig,
    addToast,
  } = useAppState();

  const isAcquiring = sensorStatus === "acquiring";
  const sensorLocked = isAcquiring || reconfiguring;

  return (
    <AppLayout>
      <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Configurazione</h1>
          <p className={styles.subtitle}>Parametri acquisizione del sensore</p>
        </div>
        {isAcquiring && (
          <StatusPill label="In acquisizione — Parametri bloccati" tone="purple" pulsing />
        )}
      </div>

      {isAcquiring && (
        <div className={styles.banner}>
          <AlertTriangle size={16} />
          <span>I parametri del sensore non possono essere modificati durante l'acquisizione.</span>
        </div>
      )}

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
        <div className={styles.paramSection}>
          <span className={styles.paramSectionLabel}>Acquisizione</span>
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
          </div>
        </div>

        <div className={styles.paramSection}>
          <span className={styles.paramSectionLabel}>Correlazione</span>
          <div className={styles.fieldsGrid}>
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
              label="Filtro ShortPass"
              value={config.sensor.corrShortPass}
              step={1}
              min={1}
              max={50}
              precision={0}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("corrShortPass", v)}
            />
            <NumericInput
              label="Filtro HighPass"
              value={config.sensor.corrHighPass}
              step={1}
              min={1}
              max={100}
              precision={0}
              disabled={sensorLocked}
              onChange={(v) => updateSensorParam("corrHighPass", v)}
            />
          </div>
        </div>

        <div className={styles.cardFooter}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Wand2 size={14} />}
            disabled={sensorLocked}
            onClick={() => addToast("Esposizione regolata automaticamente.", "success")}
          >
            Regola esposizione automaticamente
          </Button>
        </div>
      </Card>

      <div className={styles.actionBar}>
        <Button
          variant="secondary"
          icon={<RotateCcw size={16} />}
          onClick={resetConfig}
          disabled={!config.dirty || sensorLocked}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          icon={<Save size={16} />}
          loading={reconfiguring}
          disabled={isAcquiring}
          onClick={saveConfig}
        >
          {reconfiguring ? "Riconfigurazione in corso..." : "Salva configurazione"}
        </Button>
      </div>
      </div>
    </AppLayout>
  );
}
