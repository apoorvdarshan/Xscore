"use client";

import { SIGNAL_POLARITY, WEIGHTS, ActionName } from "@/lib/algorithm";

export function SignalBar({
  action,
  label,
  probability,
}: {
  action: ActionName;
  label: string;
  probability: number;
}) {
  const polarity = SIGNAL_POLARITY[action];
  const weight = WEIGHTS[action];
  const isNegative = polarity === "negative";
  const barColor = isNegative ? "var(--negative)" : "var(--positive)";
  const pct = Math.min(probability * 100, 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: barColor }}
          />
          {label}
          {isNegative && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(244,33,46,0.15)", color: "var(--negative)" }}>
              negative
            </span>
          )}
        </span>
        <span style={{ color: "var(--muted)" }}>{(probability * 100).toFixed(3)}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--card-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(pct * 10, 0.5)}%`, // Scale up for visibility (rates are small)
            backgroundColor: barColor,
            maxWidth: "100%",
          }}
        />
      </div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        Weight: {weight.value > 0 ? "+" : ""}
        {weight.value} — <span className="italic">{weight.source}</span>
      </div>
    </div>
  );
}
