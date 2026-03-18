"use client";

import { SIGNAL_POLARITY, WEIGHTS, ActionName } from "@/lib/algorithm";

export function SignalBar({
  action, label, probability, index, maxProb,
}: {
  action: ActionName;
  label: string;
  probability: number;
  index: number;
  maxProb: number;
}) {
  const isNeg = SIGNAL_POLARITY[action] === "negative";
  const color = isNeg ? "var(--red)" : "var(--cyan)";
  const bg = isNeg ? "var(--red-dim)" : "var(--cyan-dim)";
  const pct = probability * 100;
  // Normalize bar width relative to the strongest signal
  const barWidth = maxProb > 0 ? Math.min((probability / maxProb) * 100, 100) : 0;
  const weight = WEIGHTS[action];

  return (
    <div
      className="group flex items-center gap-3 py-[7px] px-3 -mx-3 rounded-md transition-colors duration-150 hover:bg-[var(--bg-hover)] relative"
      style={{ animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 35}ms both` }}
    >
      {/* Index */}
      <span className="mono w-4 text-right shrink-0" style={{ fontSize: "0.6rem", color: "var(--text-invisible)" }}>
        {String(index).padStart(2, "0")}
      </span>

      {/* Label */}
      <div className="w-36 shrink-0 flex items-center gap-1.5">
        <span className="mono" style={{ fontSize: "0.72rem", color: isNeg ? "var(--red)" : "var(--text-primary)", fontWeight: 400 }}>
          {label}
        </span>
        {isNeg && (
          <span
            className="mono px-1 py-px rounded"
            style={{ fontSize: "0.5rem", background: "var(--red-dim)", color: "var(--red)", letterSpacing: "0.06em" }}
          >
            NEG
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="flex-1 h-[3px] rounded-full overflow-hidden relative" style={{ background: bg }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.max(barWidth, 0.5)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            animation: `bar-grow 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 35 + 200}ms both`,
            transformOrigin: "left",
          }}
        />
      </div>

      {/* Value */}
      <span
        className="mono w-[4.5rem] text-right shrink-0"
        style={{ fontSize: "0.7rem", color, fontWeight: 500, letterSpacing: "-0.01em" }}
      >
        {pct < 0.001 ? "<0.001" : pct.toFixed(3)}%
      </span>

      {/* Weight on hover */}
      <span
        className="mono w-8 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ fontSize: "0.55rem", color: "var(--text-ghost)" }}
      >
        {weight.value > 0 ? "+" : ""}{weight.value}
      </span>

      {/* Tooltip */}
      <div
        className="pointer-events-none absolute right-0 top-full mt-1 z-20 px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-base)",
          fontSize: "0.58rem",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-mono)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        {weight.source}
      </div>
    </div>
  );
}
