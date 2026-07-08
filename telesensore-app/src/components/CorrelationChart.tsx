import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "./Card";
import { Toggle } from "./Toggle";
import { TIME_WINDOW_OPTIONS } from "../data/mockSensorData";
import { findGapBoundaries, formatRelativeSeconds } from "../hooks/useWindowedSeries";
import type { SeriesPoint } from "../data/types";
import styles from "./CorrelationChart.module.css";

const PEAK_THRESHOLD = 0.45;

interface CorrelationChartProps {
  data: SeriesPoint[];
  now: number;
  windowSeconds: number;
  onWindowChange: (seconds: number) => void;
  showPeaks: boolean;
  onTogglePeaks: (value: boolean) => void;
}

export function CorrelationChart({
  data,
  now,
  windowSeconds,
  onWindowChange,
  showPeaks,
  onTogglePeaks,
}: CorrelationChartProps) {
  const gapBoundaries = useMemo(() => findGapBoundaries(data, "correlation"), [data]);

  return (
    <Card
      title="Qualità della correlazione"
      tooltip="Mostra quanto la misura è affidabile nel tempo."
      headerExtra={
        <div className={styles.headerControls}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Finestra temporale</span>
            <select
              className={styles.select}
              value={windowSeconds}
              onChange={(e) => onWindowChange(Number(e.target.value))}
            >
              {TIME_WINDOW_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}s
                </option>
              ))}
            </select>
          </div>
          <Toggle checked={showPeaks} onChange={onTogglePeaks} label="Mostra picchi correlazione" />
        </div>
      }
    >
      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="var(--border-soft)" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[now - windowSeconds, now]}
              tickFormatter={(t) => formatRelativeSeconds(now, t)}
              stroke="var(--text-muted)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-soft)" }}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => v.toFixed(2)}
              stroke="var(--text-muted)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-medium)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelFormatter={(t) => formatRelativeSeconds(now, Number(t))}
              formatter={(value) =>
                value === null || value === undefined ? ["—", "Correlazione"] : [Number(value).toFixed(3), "Correlazione"]
              }
            />
            {gapBoundaries.map((t) => (
              <ReferenceLine key={t} x={t} stroke="var(--border-medium)" strokeDasharray="3 4" />
            ))}
            <Line
              type="monotone"
              dataKey="correlation"
              stroke="var(--accent-purple-light)"
              strokeWidth={1.5}
              dot={(props: { cx?: number; cy?: number; payload?: SeriesPoint; index?: number }) => {
                const { cx, cy, payload, index } = props;
                const isPeak = showPeaks && payload?.correlation !== null && payload?.correlation !== undefined && payload.correlation < PEAK_THRESHOLD;
                if (!isPeak || cx === undefined || cy === undefined) {
                  return <circle key={`dot-${index}`} cx={cx ?? 0} cy={cy ?? 0} r={0} fill="transparent" />;
                }
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="var(--accent-red)"
                    stroke="var(--bg-card)"
                    strokeWidth={1.5}
                  />
                );
              }}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
