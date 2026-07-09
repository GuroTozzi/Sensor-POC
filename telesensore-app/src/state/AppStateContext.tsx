import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import {
  SENSOR_PARAMS_DEFAULTS,
  VISUALIZATION_PARAMS_DEFAULTS,
} from "../data/mockSensorData";
import type {
  DataQualityState,
  SensorParams,
  SensorStatus,
  ThreeDShape,
  ToastMessage,
  ToastVariant,
  VisualizationParams,
} from "../data/types";

interface AcquisitionState {
  isAcquiring: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  packetsReceived: number;
  packetsLost: number;
}

interface View3DState {
  zoom: number;
  panX: number;
  panY: number;
  shape: ThreeDShape;
  dataState: DataQualityState;
  amplification: number;
}

interface ConfigState {
  sensor: SensorParams;
  visualization: VisualizationParams;
  outputFileName: string;
  dirty: boolean;
  savedSensor: SensorParams;
  savedVisualization: VisualizationParams;
}

interface AppState {
  sensorStatus: SensorStatus;
  acquisition: AcquisitionState;
  config: ConfigState;
  view3D: View3DState;
  toasts: ToastMessage[];
  reconfiguring: boolean;
  simulatedTime: number;
}

type Action =
  | { type: "SET_STATUS"; status: SensorStatus }
  | { type: "RETRY_CONNECTION" }
  | { type: "SENSOR_READY" }
  | { type: "START_ACQUISITION" }
  | { type: "PAUSE_ACQUISITION" }
  | { type: "RESUME_ACQUISITION" }
  | { type: "STOP_ACQUISITION" }
  | { type: "TICK_ACQUISITION" }
  | { type: "LOSE_CONNECTION" }
  | { type: "UPDATE_SENSOR_PARAM"; key: keyof SensorParams; value: number }
  | { type: "UPDATE_VIS_PARAM"; param: Partial<VisualizationParams> }
  | { type: "UPDATE_OUTPUT_FILENAME"; value: string }
  | { type: "RESET_CONFIG" }
  | { type: "BEGIN_SAVE_CONFIG" }
  | { type: "COMMIT_SAVE_CONFIG" }
  | { type: "UPDATE_VIEW3D"; patch: Partial<View3DState> }
  | { type: "RESET_VIEW3D" }
  | { type: "ADD_TOAST"; message: string; variant: ToastVariant; id: string }
  | { type: "REMOVE_TOAST"; id: string };

const initialView3D: View3DState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  shape: "cube",
  dataState: "valid",
  amplification: 12,
};

function getInitialStatus(): SensorStatus {
  const path = window.location.pathname;
  if (path.includes("/connection/starting")) return "starting";
  if (path.includes("/connection/ready")) return "ready";
  return "unreachable";
}

const initialState: AppState = {
  sensorStatus: getInitialStatus(),
  acquisition: {
    isAcquiring: false,
    isPaused: false,
    elapsedSeconds: 0,
    packetsReceived: 0,
    packetsLost: 0,
  },
  config: {
    sensor: { ...SENSOR_PARAMS_DEFAULTS },
    visualization: { ...VISUALIZATION_PARAMS_DEFAULTS },
    outputFileName: "acquisizione_001",
    dirty: false,
    savedSensor: { ...SENSOR_PARAMS_DEFAULTS },
    savedVisualization: { ...VISUALIZATION_PARAMS_DEFAULTS },
  },
  view3D: initialView3D,
  toasts: [],
  reconfiguring: false,
  // Non-zero so charts have a full window of history to render before
  // acquisition ever starts (time only advances further while acquiring).
  simulatedTime: 120,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, sensorStatus: action.status };
    case "RETRY_CONNECTION":
      return { ...state, sensorStatus: "starting" };
    case "SENSOR_READY":
      return { ...state, sensorStatus: "ready" };
    case "START_ACQUISITION":
      return {
        ...state,
        sensorStatus: "acquiring",
        acquisition: {
          isAcquiring: true,
          isPaused: false,
          elapsedSeconds: 0,
          packetsReceived: 0,
          packetsLost: 0,
        },
      };
    case "PAUSE_ACQUISITION":
      return { ...state, acquisition: { ...state.acquisition, isPaused: true } };
    case "RESUME_ACQUISITION":
      return { ...state, acquisition: { ...state.acquisition, isPaused: false } };
    case "STOP_ACQUISITION":
      return {
        ...state,
        sensorStatus: "ready",
        acquisition: { ...state.acquisition, isAcquiring: false, isPaused: false },
      };
    case "TICK_ACQUISITION":
      if (!state.acquisition.isAcquiring || state.acquisition.isPaused) return state;
      return {
        ...state,
        simulatedTime: state.simulatedTime + 0.25,
        acquisition: {
          ...state.acquisition,
          elapsedSeconds: state.acquisition.elapsedSeconds + 0.25,
          packetsReceived: state.acquisition.packetsReceived + Math.round(state.config.sensor.acquisitionFrequency * 0.25),
        },
      };
    case "LOSE_CONNECTION":
      return {
        ...state,
        sensorStatus: "lost",
        acquisition: { ...state.acquisition, isAcquiring: false, isPaused: false },
      };
    case "UPDATE_SENSOR_PARAM":
      return {
        ...state,
        config: {
          ...state.config,
          sensor: { ...state.config.sensor, [action.key]: action.value },
          dirty: true,
        },
      };
    case "UPDATE_VIS_PARAM":
      return {
        ...state,
        config: {
          ...state.config,
          visualization: { ...state.config.visualization, ...action.param },
          dirty: true,
        },
      };
    case "UPDATE_OUTPUT_FILENAME":
      return {
        ...state,
        config: { ...state.config, outputFileName: action.value, dirty: true },
      };
    case "RESET_CONFIG":
      return {
        ...state,
        config: {
          ...state.config,
          sensor: { ...state.config.savedSensor },
          visualization: { ...state.config.savedVisualization },
          dirty: false,
        },
      };
    case "BEGIN_SAVE_CONFIG":
      return { ...state, reconfiguring: true };
    case "COMMIT_SAVE_CONFIG":
      return {
        ...state,
        reconfiguring: false,
        config: {
          ...state.config,
          savedSensor: { ...state.config.sensor },
          savedVisualization: { ...state.config.visualization },
          dirty: false,
        },
      };
    case "UPDATE_VIEW3D":
      return { ...state, view3D: { ...state.view3D, ...action.patch } };
    case "RESET_VIEW3D":
      return { ...state, view3D: { ...initialView3D, shape: state.view3D.shape, dataState: state.view3D.dataState } };
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { id: action.id, message: action.message, variant: action.variant }],
      };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  retryConnection: () => void;
  markSensorReady: () => void;
  startAcquisition: () => void;
  pauseAcquisition: () => void;
  resumeAcquisition: () => void;
  stopAcquisition: () => void;
  loseConnection: () => void;
  updateSensorParam: (key: keyof SensorParams, value: number) => void;
  updateVisParam: (param: Partial<VisualizationParams>) => void;
  updateOutputFileName: (value: string) => void;
  resetConfig: () => void;
  saveConfig: () => void;
  updateView3D: (patch: Partial<View3DState>) => void;
  resetView3D: () => void;
  setSensorStatus: (status: SensorStatus) => void;
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `toast-${++toastIdRef.current}`;
    dispatch({ type: "ADD_TOAST", message, variant, id });
    window.setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 3600);
  }, []);

  const removeToast = useCallback((id: string) => dispatch({ type: "REMOVE_TOAST", id }), []);

  // Auto-advance starting -> ready
  useEffect(() => {
    if (state.sensorStatus !== "starting") return;
    const timeout = window.setTimeout(() => {
      dispatch({ type: "SENSOR_READY" });
      addToast("Sensore pronto e raggiungibile.", "success");
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [state.sensorStatus, addToast]);

  // Acquisition clock
  useEffect(() => {
    if (!state.acquisition.isAcquiring) return;
    const interval = window.setInterval(() => dispatch({ type: "TICK_ACQUISITION" }), 250);
    return () => window.clearInterval(interval);
  }, [state.acquisition.isAcquiring]);

  // Reconfiguring overlay auto-resolve
  useEffect(() => {
    if (!state.reconfiguring) return;
    const timeout = window.setTimeout(() => {
      dispatch({ type: "COMMIT_SAVE_CONFIG" });
      addToast("Configurazione salvata", "success");
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [state.reconfiguring, addToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      retryConnection: () => dispatch({ type: "RETRY_CONNECTION" }),
      markSensorReady: () => dispatch({ type: "SENSOR_READY" }),
      startAcquisition: () => dispatch({ type: "START_ACQUISITION" }),
      pauseAcquisition: () => dispatch({ type: "PAUSE_ACQUISITION" }),
      resumeAcquisition: () => dispatch({ type: "RESUME_ACQUISITION" }),
      stopAcquisition: () => dispatch({ type: "STOP_ACQUISITION" }),
      loseConnection: () => {
        dispatch({ type: "LOSE_CONNECTION" });
        addToast("Connessione al sensore persa.", "error");
      },
      updateSensorParam: (key, val) => dispatch({ type: "UPDATE_SENSOR_PARAM", key, value: val }),
      updateVisParam: (param) => dispatch({ type: "UPDATE_VIS_PARAM", param }),
      updateOutputFileName: (val) => dispatch({ type: "UPDATE_OUTPUT_FILENAME", value: val }),
      resetConfig: () => dispatch({ type: "RESET_CONFIG" }),
      saveConfig: () => dispatch({ type: "BEGIN_SAVE_CONFIG" }),
      updateView3D: (patch) => dispatch({ type: "UPDATE_VIEW3D", patch }),
      resetView3D: () => dispatch({ type: "RESET_VIEW3D" }),
      setSensorStatus: (status) => dispatch({ type: "SET_STATUS", status }),
      addToast,
      removeToast,
    }),
    [state, addToast, removeToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
