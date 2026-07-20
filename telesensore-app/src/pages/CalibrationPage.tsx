import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Crosshair,
  RefreshCw,
  Ruler,
  Scan,
  Zap,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/Button";
import { useAppState } from "../state/AppStateContext";
import type { SensorParams } from "../data/types";
import styles from "./CalibrationPage.module.css";

// ── Auto-calculate sensor params from measured distance ───────────────────────

function calculateParams(distance: number): SensorParams {
  return {
    acquisitionFrequency: 120,
    exposure: Math.round((0.3 + distance * 0.6) * 10) / 10,
    gain: Math.round(distance * 2.8),
    correlationThreshold: 0.6,
    corrShortPass: 8,
    corrHighPass: 35,
  };
}

function formatStoredDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

// ── Camera feed components ────────────────────────────────────────────────────

function IRCameraFeed({ locked }: { locked: boolean }) {
  return (
    <div className={styles.cameraPanel}>
      <div className={styles.irFeed}>
        {/* Scanline texture overlay */}
        <div className={styles.scanlines} aria-hidden="true" />

        {/* Reticle rings */}
        <div className={styles.reticleRing} style={{ width: 120, height: 120 }} aria-hidden="true" />
        <div className={styles.reticleRing} style={{ width: 72, height: 72 }} aria-hidden="true" />
        <div className={styles.reticleRing} style={{ width: 32, height: 32, opacity: 0.5 }} aria-hidden="true" />

        {/* Crosshair lines */}
        <div className={styles.crosshairH} aria-hidden="true" />
        <div className={styles.crosshairV} aria-hidden="true" />

        {/* IR dot (locked/measuring = hidden) */}
        {!locked && <div className={styles.irDot} aria-hidden="true" />}

        {/* Corner brackets */}
        <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

        {/* LIVE badge */}
        <div className={styles.liveBadge}>
          <span className={styles.liveDotRed} />
          <span>LIVE</span>
        </div>
      </div>
      <div className={styles.cameraLabel}>
        <Scan size={13} />
        Camera IR | Puntamento
      </div>
    </div>
  );
}

function NormalCameraFeed({ locked }: { locked: boolean }) {
  return (
    <div className={styles.cameraPanel}>
      <div className={styles.normalFeed}>
        {/* Scene gradient */}
        <div className={styles.normalScene} aria-hidden="true" />

        {/* Fine crosshair */}
        <div className={styles.normalCrosshairH} aria-hidden="true" />
        <div className={styles.normalCrosshairV} aria-hidden="true" />

        {/* Center mark */}
        {!locked && <div className={styles.normalCenter} aria-hidden="true" />}

        {/* Corner brackets */}
        <div className={`${styles.corner} ${styles.cornerTL} ${styles.cornerLight}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerTR} ${styles.cornerLight}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBL} ${styles.cornerLight}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBR} ${styles.cornerLight}`} aria-hidden="true" />

        {/* LIVE badge */}
        <div className={styles.liveBadge}>
          <span className={styles.liveDotGreen} />
          <span>LIVE</span>
        </div>
      </div>
      <div className={styles.cameraLabel}>
        <Crosshair size={13} />
        Camera visuale | Inquadratura
      </div>
    </div>
  );
}

// ── Action bar ────────────────────────────────────────────────────────────────

type Phase = "aiming" | "measuring" | "measured";

function ActionBar({
  phase,
  distance,
  params,
  onMeasure,
  onRemeasure,
  onContinue,
}: {
  phase: Phase;
  distance: number | null;
  params: SensorParams | null;
  onMeasure: () => void;
  onRemeasure: () => void;
  onContinue: () => void;
}) {
  if (phase === "aiming") {
    return (
      <div className={styles.actionBar}>
        <div className={styles.actionHint}>
          <Crosshair size={15} className={styles.hintIcon} />
          <span>
            Centrare il punto IR rosso sull'obiettivo da esaminare, quindi avviare la calibrazione della distanza.
          </span>
        </div>
        <Button variant="primary" size="lg" icon={<Ruler size={15} />} onClick={onMeasure}>
          Calibra distanza
        </Button>
      </div>
    );
  }

  if (phase === "measuring") {
    return (
      <div className={styles.actionBar}>
        <div className={styles.measuringState}>
          <RefreshCw size={16} className="spin" />
          <span>Rilevamento distanza in corso...</span>
        </div>
      </div>
    );
  }

  // measured
  return (
    <div className={`${styles.actionBar} ${styles.actionBarMeasured}`}>
      <div className={styles.resultBlock}>
        <div className={styles.resultDistance}>
          <CheckCircle2 size={18} className={styles.resultCheck} />
          <div>
            <span className={styles.resultLabel}>Distanza rilevata</span>
            <span className={styles.resultValue}>{distance?.toFixed(1)} m</span>
          </div>
        </div>

        <div className={styles.resultDivider} />

        <div className={styles.resultParams}>
          <span className={styles.resultParamsTitle}>Parametri aggiornati automaticamente</span>
          <div className={styles.resultParamsGrid}>
            <span className={styles.paramName}>Frequenza</span>
            <span className={styles.paramVal}>{params?.acquisitionFrequency} fps</span>
            <span className={styles.paramName}>Esposizione</span>
            <span className={styles.paramVal}>{params?.exposure} ms</span>
            <span className={styles.paramName}>Gain</span>
            <span className={styles.paramVal}>{params?.gain} dB</span>
          </div>
        </div>
      </div>

      <div className={styles.resultActions}>
        <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={onRemeasure}>
          Ricalibrare
        </Button>
        <Button variant="success" icon={<ArrowRight size={14} />} onClick={onContinue}>
          Continua
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function CalibrationPage() {
  const navigate = useNavigate();
  const { calibration, acceptCalibration, sensorStatus } = useAppState();

  const [phase, setPhase] = useState<Phase>("aiming");
  const [distance, setDistance] = useState<number | null>(null);
  const [params, setParams] = useState<SensorParams | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // If sensor is no longer connected, go back to connection page
  useEffect(() => {
    if (sensorStatus === "unreachable" || sensorStatus === "lost") {
      navigate("/connection/unreachable", { replace: true });
    }
  }, [sensorStatus, navigate]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleMeasure() {
    setPhase("measuring");
    timerRef.current = window.setTimeout(() => {
      const d = Math.round((2.5 + Math.random() * 6) * 10) / 10;
      const p = calculateParams(d);
      setDistance(d);
      setParams(p);
      setPhase("measured");
    }, 2000);
  }

  function handleRemeasure() {
    setPhase("aiming");
    setDistance(null);
    setParams(null);
  }

  function handleContinue() {
    if (distance === null || !params) return;
    acceptCalibration(distance, params);
    navigate("/visualization/graphs");
  }

  return (
    <AppLayout>
      <div className={styles.page}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Calibrazione Telesensore</h1>
            <p className={styles.subtitle}>
              Puntare il dispositivo verso l'obiettivo da esaminare e calibrare la distanza.
            </p>
            {calibration.hasStored && calibration.stored && (
              <div className={styles.storedNote}>
                <Zap size={12} />
                Calibrazione precedente: {calibration.stored.distance} m
                · {formatStoredDate(calibration.stored.timestamp)}
              </div>
            )}
          </div>
        </div>

        {/* ── Camera feeds ── */}
        <div className={styles.camerasRow}>
          <IRCameraFeed locked={phase !== "aiming"} />
          <NormalCameraFeed locked={phase !== "aiming"} />
        </div>

        {/* ── Action bar ── */}
        <ActionBar
          phase={phase}
          distance={distance}
          params={params}
          onMeasure={handleMeasure}
          onRemeasure={handleRemeasure}
          onContinue={handleContinue}
        />

      </div>
    </AppLayout>
  );
}
