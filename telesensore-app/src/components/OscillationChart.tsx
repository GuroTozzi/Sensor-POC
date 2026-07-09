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
import { FFTChart } from "./FFTChart";
import { findGapBoundaries } from "../hooks/useWindowedSeries";
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

  const xMin = Math.max(0, now - windowSeconds);
  const xMax = Math.max(windowSeconds, now);

  return (
    <Card
      title="Oscillazione"
      tooltip="Mostra lo spostamento orizzontale e verticale nel tempo."
      headerExtra={
        <div className={styles.headerControls}>
          <div className={styles.channelLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: "var(--accent-purple-light)" }} />
              Canale 1
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: "var(--accent-cyan)" }} />
              Canale 2
            </span>
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
                domain={[xMin, xMax]}
                tickCount={6}
                tickFormatter={(v: number) => String(Math.round(v))}
                stroke="var(--text-muted)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-soft)" }}
              />
              <YAxis
                domain={[-0.4, 0.4]}
                ticks={[-0.4, -0.2, 0, 0.2, 0.4]}
                tickFormatter={(v) => v.toFixed(1)}
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
                labelFormatter={(t) => `${Math.round(Number(t))}s`}
                formatter={(value, name) => [
                  value === null || value === undefined ? "—" : `${Number(value).toFixed(3)} mm`,
                  String(name),
                ]}
              />
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
