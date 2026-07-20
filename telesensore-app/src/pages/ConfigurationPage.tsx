import { AlertTriangle, ChevronDown, Crosshair, Lock, Moon, RotateCcw, Save, Sun, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/Button";
import { NumericInput } from "../components/NumericInput";
import { StatusPill } from "../components/StatusPill";
import { useTheme } from "../hooks/useTheme";
import { useAppState } from "../state/AppStateContext";
import styles from "./ConfigurationPage.module.css";

/* ── Language dropdown ───────────────────────────────────────── */

const LANG_OPTIONS = [
  { value: "it" as const, flag: "🇮🇹", label: "Italiano" },
  { value: "en" as const, flag: "🇬🇧", label: "English" },
];

function LangDropdown({
  value,
  onChange,
}: {
  value: "it" | "en";
  onChange: (v: "it" | "en") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANG_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className={styles.langDropdown}>
      <button
        type="button"
        className={styles.langTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Lingua: ${current.label}`}
      >
        <span className={styles.langFlag}>{current.flag}</span>
        <span className={styles.langLabel}>{current.label}</span>
        <ChevronDown
          size={13}
          className={[styles.langChevron, open ? styles.langChevronOpen : ""]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={styles.langMenu} role="listbox" aria-label="Seleziona lingua">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={[
                styles.langOption,
                opt.value === value ? styles.langOptionActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className={styles.langFlag}>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export function ConfigurationPage() {
  const { sensorStatus, config, reconfiguring, calibration, updateSensorParam, resetConfig, saveConfig, addToast } =
    useAppState();

  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const [lang, setLang] = useState<"it" | "en">(() => {
    return (localStorage.getItem("app-lang") as "it" | "en") ?? "it";
  });

  function setLanguage(value: "it" | "en") {
    setLang(value);
    localStorage.setItem("app-lang", value);
  }

  const isConnected =
    sensorStatus !== "unreachable" && sensorStatus !== "lost" && sensorStatus !== "starting";
  const isAcquiring = sensorStatus === "acquiring";
  const sensorLocked = isAcquiring || reconfiguring;
  const paramsDisabled = !isConnected || sensorLocked;

  return (
    <AppLayout>
      <div className={styles.page}>

        {/* ── Header: title + action buttons inline ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Configurazione</h1>
            <p className={styles.subtitle}>Impostazioni di sistema e parametri dispositivo</p>
          </div>
          <div className={styles.headerActions}>
            {isAcquiring && (
              <StatusPill label="In acquisizione" tone="purple" pulsing />
            )}
            {isConnected && (
              <Button
                variant="secondary"
                icon={<Crosshair size={15} />}
                disabled={isAcquiring}
                onClick={() => navigate("/calibration")}
              >
                {calibration.hasStored ? "Ricalibrare" : "Avvia calibrazione"}
              </Button>
            )}
            <Button
              variant="secondary"
              icon={<RotateCcw size={15} />}
              onClick={resetConfig}
              disabled={!config.dirty || paramsDisabled}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              icon={<Save size={15} />}
              loading={reconfiguring}
              disabled={!isConnected || isAcquiring}
              onClick={saveConfig}
            >
              {reconfiguring ? "Riconfigurazione..." : "Salva configurazione"}
            </Button>
          </div>
        </div>

        {/* Banner: acquiring */}
        {isAcquiring && (
          <div className={styles.banner}>
            <AlertTriangle size={16} />
            <span>I parametri del sensore non possono essere modificati durante l'acquisizione.</span>
          </div>
        )}

        {/* ── Unified settings panel ── */}
        <div className={styles.panel}>

          {/* Section 1: Preferenze interfaccia (always enabled) */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Preferenze interfaccia</h2>
                <p className={styles.sectionSubtitle}>
                  Controlli locali, sempre disponibili
                </p>
              </div>
            </div>

            <div className={styles.settingsList}>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Tema dell'interfaccia</span>
                  <span className={styles.settingDesc}>Scegli tra tema chiaro e scuro</span>
                </div>
                <div className={styles.segPill} role="group" aria-label="Tema">
                  <button
                    type="button"
                    className={[styles.segBtn, theme === "light" ? styles.segActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => theme !== "light" && toggleTheme()}
                    aria-pressed={theme === "light"}
                    aria-label="Tema chiaro"
                  >
                    <Sun size={14} />
                    <span>Chiaro</span>
                  </button>
                  <button
                    type="button"
                    className={[styles.segBtn, theme === "dark" ? styles.segActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => theme !== "dark" && toggleTheme()}
                    aria-pressed={theme === "dark"}
                    aria-label="Tema scuro"
                  >
                    <Moon size={14} />
                    <span>Scuro</span>
                  </button>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Lingua</span>
                  <span className={styles.settingDesc}>Lingua dell'interfaccia utente</span>
                </div>
                <LangDropdown value={lang} onChange={setLanguage} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.sectionDivider} />

          {/* Section 2: Parametri sensore */}
          <div className={styles.sensorSection}>
            {/* Overlay when disconnected */}
            {!isConnected && (
              <div className={styles.sensorOverlay}>
                <div className={styles.sensorOverlayCard}>
                  <div className={styles.overlayIconWrap}>
                    <Lock size={24} />
                  </div>
                  <div className={styles.overlayBody}>
                    <span className={styles.overlayTitle}>Dispositivo non connesso</span>
                    <span className={styles.overlayMessage}>
                      Connetti il sensore per accedere alle impostazioni del dispositivo.
                      Le preferenze dell'interfaccia sono sempre disponibili.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Parametri sensore</h2>
                <p className={styles.sectionSubtitle}>
                  Configurazione hardware del dispositivo
                </p>
              </div>
              {!isConnected && (
                <span className={styles.lockedTag}>
                  <Lock size={11} />
                  Dispositivo non connesso
                </span>
              )}
              {isConnected && sensorLocked && (
                <span className={styles.lockedTag}>
                  <Lock size={11} />
                  Bloccati durante l'acquisizione
                </span>
              )}
              {isConnected && !sensorLocked && config.dirty && (
                <span className={styles.dirtyTag}>Modifiche non salvate</span>
              )}
            </div>

            {/* Fields area: dimmed when disabled */}
            <div className={paramsDisabled ? styles.fieldsDisabled : ""}>
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
                    disabled={paramsDisabled}
                    onChange={(v) => updateSensorParam("acquisitionFrequency", v)}
                  />
                  <NumericInput
                    label="Esposizione"
                    value={config.sensor.exposure}
                    unit="ms"
                    step={0.1}
                    min={0.1}
                    max={50}
                    disabled={paramsDisabled}
                    onChange={(v) => updateSensorParam("exposure", v)}
                  />
                  <NumericInput
                    label="Gain"
                    value={config.sensor.gain}
                    unit="dB"
                    step={1}
                    min={0}
                    max={60}
                    disabled={paramsDisabled}
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
                    disabled={paramsDisabled}
                    onChange={(v) => updateSensorParam("correlationThreshold", v)}
                  />
                  <NumericInput
                    label="Filtro ShortPass"
                    value={config.sensor.corrShortPass}
                    step={1}
                    min={1}
                    max={50}
                    precision={0}
                    disabled={paramsDisabled}
                    onChange={(v) => updateSensorParam("corrShortPass", v)}
                  />
                  <NumericInput
                    label="Filtro HighPass"
                    value={config.sensor.corrHighPass}
                    step={1}
                    min={1}
                    max={100}
                    precision={0}
                    disabled={paramsDisabled}
                    onChange={(v) => updateSensorParam("corrHighPass", v)}
                  />
                </div>
              </div>

              <div className={styles.paramFooter}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Wand2 size={14} />}
                  disabled={paramsDisabled}
                  onClick={() => addToast("Esposizione regolata automaticamente.", "success")}
                >
                  Regola esposizione automaticamente
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

