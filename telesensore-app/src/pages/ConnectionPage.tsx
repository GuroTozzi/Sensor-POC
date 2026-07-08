import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Info,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
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
  const { sensorStatus, retryConnection, markSensorReady, addToast } = useAppState();

  const view = (params.state as ConnectionRouteState) ?? "unreachable";

  // Keep the URL in sync with the global sensor status (handles the
  // automatic starting -> ready timeout, or a connection drop mid-flow).
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
            </div>
          )}

          {view === "starting" && (
            <div className={styles.ctaStack}>
              <Button variant="primary" size="lg" disabled loading>
                Inizializzazione in corso
              </Button>
            </div>
          )}

          {view === "ready" && (
            <div className={styles.ctaStack}>
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={16} />}
                onClick={() => navigate("/visualization/graphs")}
              >
                Visualizza
              </Button>
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
        <p style={{ whiteSpace: "nowrap" }}>Sensore connesso e pronto. I dati in tempo reale sono disponibili.</p>
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
          icon={<RefreshCw size={18} color="var(--accent-green)" />}
          title="Attendi avvio del sensore"
          desc="Il sensore ha completato l'inizializzazione."
          active={false}
        />
        <StepCard
          number={3}
          icon={<ArrowRight size={18} color="var(--accent-purple-light)" />}
          title="Accedi alla visualizzazione"
          desc="Il sensore è pronto, puoi accedere ai dati."
          active
        />
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
