import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { generateFFT } from "../data/mockSensorData";
import { DotLegend } from "./ChartLegend";

export function FFTChart() {
  const data = useMemo(() => generateFFT(), []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="var(--border-soft)" vertical={false} />
        <XAxis
          dataKey="frequency"
          type="number"
          tickFormatter={(f) => `${f} Hz`}
          stroke="var(--text-muted)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border-soft)" }}
        />
        <YAxis
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
          labelFormatter={(f) => `${f} Hz`}
        />
        <Legend content={<DotLegend />} />
        <Line
          type="monotone"
          dataKey="amplitudeX"
          name="Canale 1"
          stroke="var(--accent-purple-light)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="amplitudeY"
          name="Canale 2"
          stroke="var(--accent-cyan)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
