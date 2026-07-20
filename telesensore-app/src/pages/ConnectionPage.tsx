import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Cpu,
  RefreshCw,
  Settings2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import type { CalibrationStored } from "../data/types";
import { AppLayout } from "../components/AppLayout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SensorDiagram } from "../components/SensorDiagram";
import { ConnectionTimeline } from "../components/ConnectionTimeline";
import { useAppState } from "../state/AppStateContext";
import type { SensorStatus } from "../data/types";
import styles from "./ConnectionPage.module.css";

type ConnectionRouteState = "unreachable" | "starting" | "ready";

function routeForStatus(status: SensorStatus): string {
  if (status === "unreachable" || status === "lost") return "/connection/unreachable";
  if (status === "starting") return "/connection/starting";
  return "/connection/ready";
}

export function ConnectionPage() {
  const params = useParams<{ state: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { sensorStatus, retryConnection, addToast, calibration } = useAppState();
  const [calibDetailOpen, setCalibDetailOpen] = useState(false);
  const view = (params.state as ConnectionRouteState) ?? "unreachable";

  useEffect(() => {
    const target = routeForStatus(sensorStatus);
    if (location.pathname.startsWith("/connection") && location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [sensorStatus, location.pathname, navigate]);

  return (
    <AppLayout>
      <div className={styles.grid}>
        <div className={styles.mainArea}>
          {view === "unreachable" && <UnreachableContent />}
          {view === "starting" && <StartingContent />}
          {view === "ready" && <ReadyContent />}
        </div>

        <div className={styles.sidePanel}>
          <Card title="Diagnostica connessione">
            <DiagnosticsBlock view={view} />
          </Card>

          <Card title="Altri stati possibili">
            <ConnectionTimeline current={sensorStatus} />
          </Card>

          {view === "unreachable" && (
            <div className={styles.ctaStack}>
              <Button
                variant="primary"
                size="lg"
                icon={<Settings2 size={16} />}
                onClick={() => addToast("Apertura impostazioni Wi-Fi (simulato).", "info")}
              >
                Apri impostazioni Wi-Fi
              </Button>
              <Button
                variant="success"
                size="lg"
                icon={<Wifi size={16} />}
                onClick={() => retryConnection()}
              >
                Avvia connessione
              </Button>
            </div>
          )}

          {view === "starting" && (
            <div className={`${styles.ctaStack} ${styles.ctaStackFill}`}>
              <Button variant="primary" size="lg" disabled loading>
                Inizializzazione in corso
              </Button>
            </div>
          )}

          {view === "ready" && (
            <div className={styles.ctaStack}>
              {calibration.hasStored && calibration.stored ? (
                <>
                  <button
                    type="button"
                    className={styles.calibFoundBanner}
                    onClick={() => setCalibDetailOpen(true)}
                  >
                    <CheckCircle2 size={13} />
                    <div>
                      <strong>Calibrazione precedente trovata</strong>
                      <span>{calibration.stored.distance} m · Tocca per i dettagli</span>
                    </div>
                    <ChevronRight size={13} className={styles.calibFoundChevron} />
                  </button>
                  {calibDetailOpen && calibration.stored && (
                    <CalibrationPopover
                      stored={calibration.stored}
                      onClose={() => setCalibDetailOpen(false)}
                    />
                  )}
                  <Button
                    variant="success"
                    size="lg"
                    icon={<ArrowRight size={15} />}
                    onClick={() => navigate("/visualization/graphs")}
                  >
                    Usa questa calibrazione
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<RefreshCw size={15} />}
                    onClick={() => navigate("/calibration")}
                  >
                    Ricalibrare
                  </Button>
                </>
              ) : (
                <>
                  <div className={styles.calibNeededBanner}>
                    <Crosshair size={13} />
                    <span>Nessuna calibrazione trovata. Il dispositivo deve essere calibrato.</span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={15} />}
                    onClick={() => navigate("/calibration")}
                  >
                    Avvia calibrazione
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StepCard({
  number,
  icon,
  title,
  desc,
  active,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  active: boolean;
}) {
  return (
    <div className={[styles.step, active ? styles.stepActive : ""].filter(Boolean).join(" ")}>
      <span className={styles.stepNumber}>{number}</span>
      {icon}
      <span className={styles.stepTitle}>{title}</span>
      <span className={styles.stepDesc}>{desc}</span>
    </div>
  );
}

function UnreachableContent() {
  return (
    <>
      <h1 className={styles.title}>Sensore non raggiungibile</h1>
      <div className={styles.paragraphs}>
        <p>Il tablet deve essere connesso alla rete wireless esposta dal dispositivo.</p>
        <p>L'app verifica la reale raggiungibilità del sensore prima di consentire l'accesso alla visualizzazione.</p>
      </div>

      <div className={styles.diagramArea}>
        <SensorDiagram state="unreachable" />
      </div>

      <div className={styles.steps}>
        <StepCard
          number={1}
          icon={<Wifi size={18} color="var(--accent-purple-light)" />}
          title="Collegati alla rete del dispositivo"
          desc="Connettiti alla rete Wi-Fi esposta dal telesensore."
          active={false}
        />
        <StepCard
          number={2}
          icon={<RefreshCw size={18} color="var(--text-muted)" />}
          title="Attendi verifica del sensore"
          desc="L'app verifica automaticamente lo stato del dispositivo."
          active={false}
        />
        <StepCard
          number={3}
          icon={<ArrowRight size={18} color="var(--text-muted)" />}
          title="Accedi alla visualizzazione"
          desc="Quando il sensore è pronto, potrai accedere ai dati."
          active={false}
        />
      </div>
    </>
  );
}

function StartingContent() {
  return (
    <>
      <h1 className={styles.title}>Sensore in avvio</h1>
      <div className={styles.paragraphs}>
        <p>Il tablet è connesso alla rete del dispositivo.</p>
        <p>Il sensore sta completando l'inizializzazione delle telecamere e dei componenti.</p>
      </div>

      <div className={styles.diagramArea}>
        <SensorDiagram state="starting" />
      </div>

      <div className={styles.steps}>
        <StepCard
          number={1}
          icon={<Wifi size={18} color="var(--accent-green)" />}
          title="Collegati alla rete del dispositivo"
          desc="Sei connesso alla rete Wi-Fi del tablet e del sensore."
          active={false}
        />
        <StepCard
          number={2}
          icon={<RefreshCw size={18} className="spin" color="var(--accent-purple-light)" />}
          title="Attendi avvio del sensore"
          desc="Stiamo verificando e inizializzando le componenti del sensore."
          active
        />
        <StepCard
          number={3}
          icon={<ArrowRight size={18} color="var(--text-muted)" />}
          title="Accedi alla visualizzazione"
          desc="Quando il sensore è pronto, potrai accedere ai dati."
          active={false}
        />
      </div>
    </>
  );
}

function ReadyContent() {
  return (
    <>
      <h1 className={styles.title}>Sensore pronto</h1>
      <div className={styles.paragraphs}>
        <p>Connessione stabilita. Calibrare il dispositivo prima di avviare l'acquisizione dati.</p>
      </div>

      <div className={styles.diagramArea}>
        <SensorDiagram state="ready" />
      </div>

      <div className={styles.steps}>
        <StepCard
          number={1}
          icon={<Wifi size={18} color="var(--accent-green)" />}
          title="Collegati alla rete del dispositivo"
          desc="Sei connesso alla rete Wi-Fi del tablet e del sensore."
          active={false}
        />
        <StepCard
          number={2}
          icon={<CheckCircle2 size={18} color="var(--accent-green)" />}
          title="Avvio sensore"
          desc="Il sensore ha completato l'inizializzazione."
          active={false}
        />
        <StepCard
          number={3}
          icon={<Crosshair size={18} color="var(--accent-purple-light)" />}
          title="Calibra il dispositivo"
          desc="Punta il sensore sull'obiettivo e calibra la distanza."
          active
        />
      </div>
    </>
  );
}

function computeParamsFromDistance(distance: number) {
  return {
    acquisitionFrequency: 120,
    exposure: Math.round((0.3 + distance * 0.6) * 10) / 10,
    gain: Math.round(distance * 2.8),
    correlationThreshold: 0.6,
    corrShortPass: 8,
    corrHighPass: 35,
  };
}

function CalibrationPopover({
  stored,
  onClose,
}: {
  stored: CalibrationStored;
  onClose: () => void;
}) {
  const date = new Date(stored.timestamp);
  const formattedDate = date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const p = computeParamsFromDistance(stored.distance);

  return (
    <>
      <div className={styles.popoverBackdrop} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.popoverPanel}
        role="dialog"
        aria-modal="true"
        aria-label="Dettagli calibrazione"
      >
        <div className={styles.popoverHeader}>
          <div className={styles.popoverHeaderLeft}>
            <CheckCircle2 size={14} className={styles.popoverHeaderIcon} />
            <span>Dettagli calibrazione</span>
          </div>
          <button
            type="button"
            className={styles.popoverClose}
            onClick={onClose}
            aria-label="Chiudi"
          >
            <X size={14} />
          </button>
        </div>

        <div className={styles.popoverHero}>
          <div className={styles.popoverDistanceRow}>
            <span className={styles.popoverDistValue}>{stored.distance}</span>
            <span className={styles.popoverDistUnit}>m</span>
          </div>
          <div className={styles.popoverHeroMeta}>
            <span className={styles.popoverHeroLabel}>distanza rilevata</span>
            <span className={styles.popoverMetaDot}>·</span>
            <span>{formattedDate}, {formattedTime}</span>
          </div>
        </div>

        <div className={styles.popoverParamsSection}>
          <p className={styles.popoverParamsTitle}>Parametri calcolati</p>
          <div className={styles.popoverParams}>
            <div className={styles.popoverParam}>
              <span className={styles.popoverParamLabel}>Frequenza</span>
              <span className={styles.popoverParamValue}>{p.acquisitionFrequency} fps</span>
            </div>
            <div className={styles.popoverParam}>
              <span className={styles.popoverParamLabel}>Esposizione</span>
              <span className={styles.popoverParamValue}>{p.exposure} ms</span>
            </div>
            <div className={styles.popoverParam}>
              <span className={styles.popoverParamLabel}>Gain</span>
              <span className={styles.popoverParamValue}>{p.gain} dB</span>
            </div>
            <div className={styles.popoverParam}>
              <span className={styles.popoverParamLabel}>Soglia corr.</span>
              <span className={styles.popoverParamValue}>{p.correlationThreshold}</span>
            </div>
            <div className={styles.popoverParam}>
              <span className={styles.popoverParamLabel}>ShortPass</span>
              <span className={styles.popoverParamValue}>{p.corrShortPass}</span>
            </div>
            <div className={styles.popoverParam}>
              <span className={styles.popoverParamLabel}>HighPass</span>
              <span className={styles.popoverParamValue}>{p.corrHighPass}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DiagnosticsBlock({ view }: { view: ConnectionRouteState }) {
  const networkConnected = view !== "unreachable";
  const sensorStateLabel =
    view === "unreachable" ? "Non rilevato" : view === "starting" ? "Inizializzazione in corso" : "Pronto";
  const sensorTone = view === "unreachable" ? "red" : view === "starting" ? "amber" : "green";

  return (
    <>
      <div className={styles.diagRow}>
        <span className={styles.diagIcon}>{networkConnected ? <Wifi size={18} /> : <WifiOff size={18} />}</span>
        <div className={styles.diagText}>
          <span className={styles.diagLabel}>Rete del sensore</span>
          <span className={[styles.diagValue, networkConnected ? styles.green : styles.red].join(" ")}>
            {networkConnected ? "connessa" : "non connessa"}
          </span>
        </div>
      </div>
      <div className={styles.diagRow}>
        <span className={styles.diagIcon}>
          {view === "ready" ? <CheckCircle2 size={18} /> : <Cpu size={18} />}
        </span>
        <div className={styles.diagText}>
          <span className={styles.diagLabel}>Stato sensore</span>
          <span className={[styles.diagValue, styles[sensorTone]].join(" ")}>{sensorStateLabel}</span>
        </div>
      </div>
    </>
  );
}
