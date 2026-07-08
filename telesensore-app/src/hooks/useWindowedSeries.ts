import { useMemo } from "react";
import { sampleAt, SAMPLE_RATE_HZ } from "../data/mockSensorData";
import type { SeriesPoint } from "../data/types";

/**
 * Returns the slice of the (deterministic) mock signal that falls within
 * [now - windowSeconds, now]. `now` only advances while acquisition is
 * running (see AppStateContext), so the chart is a frozen snapshot otherwise.
 */
export function useWindowedSeries(now: number, windowSeconds: number): SeriesPoint[] {
  return useMemo(() => {
    const step = 1 / SAMPLE_RATE_HZ;
    const start = Math.max(0, now - windowSeconds);
    const points: SeriesPoint[] = [];
    for (let t = start; t <= now + 1e-6; t += step) {
      points.push(sampleAt(Number(t.toFixed(3))));
    }
    return points;
  }, [now, windowSeconds]);
}

export function formatRelativeSeconds(now: number, t: number): string {
  const delta = Math.round(now - t);
  if (delta <= 0) return "Ora";
  return `-${delta}s`;
}

/** Timestamps where a data gap (null sample) starts or ends, for dashed gap markers. */
export function findGapBoundaries(data: SeriesPoint[], key: keyof Pick<SeriesPoint, "correlation" | "channelX">): number[] {
  const boundaries: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const prevIsNull = data[i - 1][key] === null;
    const currIsNull = data[i][key] === null;
    if (prevIsNull !== currIsNull) boundaries.push(data[i].t);
  }
  return boundaries;
}
