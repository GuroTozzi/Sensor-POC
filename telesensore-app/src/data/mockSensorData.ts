import type { FFTPoint, SensorParams, SeriesPoint, VisualizationParams } from "./types";

/** Deterministic pseudo-random noise so the prototype looks the same on every reload. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Drop windows: [start, end) in seconds within a 60s repeating cycle, correlation collapses here. */
const DROP_WINDOWS: Array<[number, number]> = [
  [8, 9.2],
  [24, 24.6],
  [25.4, 26.3],
  [41, 42.4],
];

function inDropWindow(tMod: number): [boolean, number] {
  for (const [start, end] of DROP_WINDOWS) {
    if (tMod >= start && tMod < end) {
      const progress = (tMod - start) / (end - start);
      return [true, progress];
    }
  }
  return [false, 0];
}

/** Short null gaps right at the edges of a drop, simulating lost samples. */
const HOLE_WINDOWS: Array<[number, number]> = [
  [9.2, 9.5],
  [26.3, 26.6],
];

function inHoleWindow(tMod: number): boolean {
  return HOLE_WINDOWS.some(([start, end]) => tMod >= start && tMod < end);
}

/**
 * Pure function of simulated time -> sample. Cycles every 60s so the
 * "live" feed can run indefinitely while still looking hand-authored.
 */
export function sampleAt(t: number): SeriesPoint {
  const tMod = t % 60;
  const [dropping, dropProgress] = inDropWindow(tMod);
  const hole = inHoleWindow(tMod);

  if (hole) {
    return { t, correlation: null, channelX: null, channelY: null };
  }

  let correlation: number;
  if (dropping) {
    const dip = 0.1 + 0.2 * Math.abs(Math.sin(dropProgress * Math.PI));
    correlation = Math.min(0.32, dip + noise(t) * 0.04);
  } else {
    correlation = 0.9 + 0.05 * Math.sin(t * 0.35) + (noise(t) - 0.5) * 0.06;
    correlation = Math.max(0.78, Math.min(0.99, correlation));
  }

  const amplitudeScale = dropping ? 0.35 : 1;
  const channelX = (
    0.85 * Math.sin(2 * Math.PI * 0.1 * t) * amplitudeScale +
    0.18 * Math.sin(2 * Math.PI * 0.3 * t) * amplitudeScale +
    (noise(t * 1.7) - 0.5) * 0.08
  ) * 0.36;
  const channelY = (
    0.65 * Math.sin(2 * Math.PI * 0.1 * t + 0.9) * amplitudeScale +
    0.12 * Math.sin(2 * Math.PI * 0.25 * t) * amplitudeScale +
    (noise(t * 2.3) - 0.5) * 0.07
  ) * 0.36;

  return {
    t,
    correlation: Number(((correlation - 0.5) * 0.8).toFixed(4)),
    channelX: Number(channelX.toFixed(4)),
    channelY: Number(channelY.toFixed(4)),
  };
}

export function generateHistory(durationSeconds: number, sampleRateHz = 4): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  const step = 1 / sampleRateHz;
  for (let t = 0; t <= durationSeconds; t += step) {
    points.push(sampleAt(Number(t.toFixed(3))));
  }
  return points;
}

const FFT_PEAKS = [
  { freq: 3.2, amp: 0.92 },
  { freq: 7.8, amp: 0.58 },
  { freq: 14.5, amp: 0.31 },
];

export function generateFFT(maxFrequency = 25, resolution = 0.25): FFTPoint[] {
  const points: FFTPoint[] = [];
  for (let f = 0; f <= maxFrequency; f += resolution) {
    let amplitudeX = 0.03 + noise(f * 3.1) * 0.02;
    let amplitudeY = 0.02 + noise(f * 5.7) * 0.015;
    for (const peak of FFT_PEAKS) {
      const dist = Math.abs(f - peak.freq);
      const width = 0.35;
      const bump = peak.amp * Math.exp(-(dist * dist) / (2 * width * width));
      amplitudeX += bump;
      amplitudeY += bump * 0.7;
    }
    points.push({
      frequency: Number(f.toFixed(2)),
      amplitudeX: Number(amplitudeX.toFixed(4)),
      amplitudeY: Number(amplitudeY.toFixed(4)),
    });
  }
  return points;
}

export const TIME_WINDOW_OPTIONS = [5, 10, 30, 60] as const;

export const SENSOR_PARAMS_DEFAULTS: SensorParams = {
  acquisitionFrequency: 1000.0,
  exposure: 1.0,
  gain: 32.0,
  correlationThreshold: 0.3,
  corrShortPass: 3,
  corrHighPass: 30,
};

export const VISUALIZATION_PARAMS_DEFAULTS: VisualizationParams = {
  timeWindow: 10,
  showFFT: false,
  showCorrelationPeaks: true,
};

export const SENSOR_INFO = {
  deviceType: "Telesensore Speckle",
  mode: "Solo lettura",
  appVersion: "1.0.0",
  model: "TS-5000",
  serialNumber: "SN-042587",
};

export const SAMPLE_RATE_HZ = 4;
