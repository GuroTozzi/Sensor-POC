import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
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
import { FFTChart } from "./FFTChart";
import { DotLegend } from "./ChartLegend";
import { findGapBoundaries, formatRelativeSeconds } from "../hooks/useWindowedSeries";
import type { SeriesPoint } from "../data/types";
import styles from "./OscillationChart.module.css";

interface OscillationChartProps {
  data: SeriesPoint[];
  now: number;
  windowSeconds: number;
  showFFT: boolean;
  onToggleFFT: (value: boolean) => void;
}

export function OscillationChart({ data, now, windowSeconds, showFFT, onToggleFFT }: OscillationChartProps) {
  const gapBoundaries = useMemo(() => findGapBoundaries(data, "channelX"), [data]);

  return (
    <Card
      title="Oscillazione"
      tooltip="Mostra lo spostamento orizzontale e verticale nel tempo."
      headerExtra={
        <div className={styles.headerControls}>
          <div className={styles.segmented}>
            <button
              type="button"
              className={[styles.segmentButton, !showFFT ? styles.active : ""].filter(Boolean).join(" ")}
              onClick={() => onToggleFFT(false)}
            >
              Tempo
            </button>
            <button
              type="button"
              className={[styles.segmentButton, showFFT ? styles.active : ""].filter(Boolean).join(" ")}
              onClick={() => onToggleFFT(true)}
            >
              FFT
            </button>
          </div>
          <Toggle checked={showFFT} onChange={onToggleFFT} label="Mostra FFT" />
        </div>
      }
    >
      <div className={styles.chartBox}>
        {showFFT ? (
          <FFTChart />
        ) : (
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
                domain={[-2, 2]}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="var(--text-muted)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={42}
                unit=" mm"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelFormatter={(t) => formatRelativeSeconds(now, Number(t))}
                formatter={(value, name) => [
                  value === null || value === undefined ? "—" : `${Number(value).toFixed(3)} mm`,
                  String(name),
                ]}
              />
              <Legend content={<DotLegend />} />
              {gapBoundaries.map((t) => (
                <ReferenceLine key={t} x={t} stroke="var(--border-medium)" strokeDasharray="3 4" />
              ))}
              <Line
                type="monotone"
                dataKey="channelX"
                name="Canale 1"
                stroke="var(--accent-purple-light)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="channelY"
                name="Canale 2"
                stroke="var(--accent-cyan)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
