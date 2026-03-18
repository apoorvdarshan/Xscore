"use client";

import { SIGNAL_POLARITY, WEIGHTS, ActionName } from "@/lib/algorithm";

export function SignalBar({
  action,
  label,
  probability,
  index,
}: {
  action: ActionName;
  label: string;
  probability: number;
  index: number;
}) {
  const polarity = SIGNAL_POLARITY[action];
  const weight = WEIGHTS[action];
  const isNegative = polarity === "negative";
  const barColor = isNegative ? "var(--negative)" : "var(--accent-cyan)";
  const barBg = isNegative ? "var(--negative-dim)" : "var(--accent-cyan-dim)";
  const pct = Math.min(probability * 100, 100);
  // Scale up small values for bar visibility (engagement rates are typically <5%)
  const barWidth = Math.min(pct * 10, 100);

  return (
    <div
      className="animate-fade-up group relative"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Row */}
      <div className="flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]">
        {/* Index */}
        <span
          className="w-5 text-right shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-ghost)",
          }}
        >
          {String(index).padStart(2, "0")}
        </span>

        {/* Label + Tag */}
        <div className="w-44 shrink-0 flex items-center gap-2">
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              color: isNegative ? "var(--negative)" : "var(--text-primary)",
            }}
          >
            {label}
          </span>
          {isNegative && (
            <span
              className="text-[0.55rem] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
              style={{
                background: "var(--negative-dim)",
                color: "var(--negative)",
                fontFamily: "var(--font-mono)",
              }}
            >
              neg
            </span>
          )}
        </div>

        {/* Bar */}
        <div className="flex-1 h-1 rounded-full relative overflow-hidden" style={{ background: barBg }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${Math.max(barWidth, 1)}%`,
              backgroundColor: barColor,
              animation: `bar-fill 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
              transformOrigin: "left",
            }}
          />
        </div>

        {/* Value */}
        <span
          className="w-20 text-right shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: isNegative ? "var(--negative)" : "var(--accent-cyan)",
            fontWeight: 500,
          }}
        >
          {pct < 0.001 ? "< 0.001" : pct.toFixed(3)}%
        </span>

        {/* Weight badge (on hover) */}
        <span
          className="w-10 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--text-ghost)",
          }}
        >
          w:{weight.value > 0 ? "+" : ""}{weight.value}
        </span>
      </div>

      {/* Weight source tooltip on hover */}
      <div
        className="hidden group-hover:block absolute right-0 -bottom-5 z-10 px-2 py-1 rounded text-[0.55rem] whitespace-nowrap"
        style={{
          fontFamily: "var(--font-mono)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-dim)",
          color: "var(--text-tertiary)",
        }}
      >
        {weight.source}
      </div>
    </div>
  );
}
