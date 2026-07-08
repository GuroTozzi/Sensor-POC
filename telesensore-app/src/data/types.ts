export type SensorStatus =
  | "unreachable"
  | "starting"
  | "ready"
  | "acquiring"
  | "reconfiguring"
  | "lost";

export type DataQualityState = "valid" | "unreliable" | "missing";

export type ThreeDShape = "cube" | "box" | "sphere";

export interface SeriesPoint {
  /** seconds, monotonically increasing */
  t: number;
  correlation: number | null;
  channelX: number | null;
  channelY: number | null;
}

export interface FFTPoint {
  frequency: number;
  amplitudeX: number;
  amplitudeY: number;
}

export interface SensorParams {
  acquisitionFrequency: number;
  exposure: number;
  gain: number;
  correlationThreshold: number;
  corrShortPass: number;
  corrHighPass: number;
}

export interface VisualizationParams {
  timeWindow: number;
  showFFT: boolean;
  showCorrelationPeaks: boolean;
}

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}
