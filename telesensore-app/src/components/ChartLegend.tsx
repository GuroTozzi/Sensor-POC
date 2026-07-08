interface LegendEntry {
  value?: string;
  color?: string;
}

export function DotLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload) return null;
  return (
    <div style={{ display: "flex", gap: 18, justifyContent: "flex-end", paddingTop: 10 }}>
      {payload.map((entry) => (
        <span
          key={entry.value}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color, display: "inline-block" }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
}
