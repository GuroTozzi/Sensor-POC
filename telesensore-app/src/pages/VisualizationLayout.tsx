import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AlertTriangle, Play, Save, Square } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { VisualizationToolbar } from "../components/VisualizationToolbar";
import { Button } from "../components/Button";
import { useAppState } from "../state/AppStateContext";
import styles from "./VisualizationPage.module.css";

export interface VisualizationOutletContext {
  hasUnsavedData: boolean;
}

export function VisualizationLayout() {
  const { sensorStatus, startAcquisition, stopAcquisition, addToast } = useAppState();
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const location = useLocation();

  const isAcquiring = sensorStatus === "acquiring";
  const active = location.pathname.endsWith("/3d") ? "3d" : "graphs";

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
          active={active}
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

        <div className={styles.pageBody}>
          <Outlet context={{ hasUnsavedData }} />
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
