import { useEffect, useRef, useState } from "react";

/**
 * A continuously advancing clock driven by requestAnimationFrame, local to
 * whatever component calls it. Used to make charts scroll smoothly like a
 * live feed instead of stepping in discrete ticks. Independent from the
 * global acquisition clock (which only tracks formal start/stop stats).
 *
 * The underlying time accumulates every frame for accuracy, but React state
 * (and therefore chart re-renders) is only flushed every `updateIntervalMs`
 * to keep a few hundred Recharts points from repainting at 60fps.
 */
export function useLiveClock(running: boolean, startAt = 0, updateIntervalMs = 80): number {
  const [now, setNow] = useState(startAt);
  const lastFrameRef = useRef<number | null>(null);
  const accumulatedRef = useRef(startAt);
  const lastEmitRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!running) {
      lastFrameRef.current = null;
      return;
    }

    function tick(timestamp: number) {
      if (lastFrameRef.current !== null) {
        accumulatedRef.current += (timestamp - lastFrameRef.current) / 1000;
      }
      lastFrameRef.current = timestamp;

      if (timestamp - lastEmitRef.current >= updateIntervalMs) {
        lastEmitRef.current = timestamp;
        setNow(accumulatedRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, updateIntervalMs]);

  return now;
}
