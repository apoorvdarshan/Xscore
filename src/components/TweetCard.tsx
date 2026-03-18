"use client";

import type { TweetAnalysis } from "@/lib/algorithm";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function TweetCard({ analysis, rank }: { analysis: TweetAnalysis; rank: number }) {
  const { tweet, signals, normalizedScore } = analysis;
  const m = tweet.public_metrics;

  const color = normalizedScore >= 70 ? "var(--green)" : normalizedScore >= 40 ? "var(--amber)" : "var(--red)";
  const colorHex = normalizedScore >= 70 ? "#34d399" : normalizedScore >= 40 ? "#ffc040" : "#fb4f5e";

  const metrics = [
    { label: "likes", value: m.like_count },
    { label: "reposts", value: m.retweet_count },
    { label: "replies", value: m.reply_count },
    { label: "quotes", value: m.quote_count },
    { label: "views", value: m.impression_count },
    { label: "saves", value: m.bookmark_count },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden hover-lift group">
      <div className="flex">
        {/* Score sidebar */}
        <div
          className="w-14 shrink-0 flex flex-col items-center justify-center gap-1 relative"
          style={{ background: `${colorHex}06`, borderRight: `1px solid ${colorHex}15` }}
        >
          {/* Score fill bar from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-700"
            style={{ height: `${normalizedScore}%`, background: `${colorHex}08` }}
          />
          <span className="mono relative z-10" style={{ fontSize: "1.1rem", fontWeight: 600, color, lineHeight: 1 }}>
            {normalizedScore}
          </span>
          <span className="mono relative z-10" style={{ fontSize: "0.45rem", color: "var(--text-ghost)", letterSpacing: "0.12em" }}>
            SCORE
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          {/* Top row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="mono inline-flex items-center justify-center w-5 h-5 rounded text-[0.6rem]"
                style={{ background: "var(--bg-elevated)", color: "var(--text-ghost)", border: "1px solid var(--border-dim)" }}
              >
                {rank}
              </span>
              <span className="mono" style={{ fontSize: "0.6rem", color: "var(--text-ghost)" }}>
                P(fav) <span style={{ color: "var(--cyan)" }}>{(signals.primaryScore * 100).toFixed(3)}%</span>
              </span>
            </div>
            <span className="mono" style={{ fontSize: "0.55rem", color: "var(--text-ghost)" }}>
              {new Date(tweet.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Text */}
          <p className="serif leading-[1.7] mb-3" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {tweet.text.length > 240 ? tweet.text.slice(0, 240) + "..." : tweet.text}
          </p>

          {/* Metrics */}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {metrics.map(({ label, value }) => (
              <span key={label} className="mono" style={{ fontSize: "0.62rem", color: "var(--text-ghost)" }}>
                <span style={{ color: value > 0 ? "var(--text-tertiary)" : undefined }}>{fmt(value)}</span>
                {" "}{label}
              </span>
            ))}
          </div>

          {/* Formula */}
          <div className="mt-1.5 mono" style={{ fontSize: "0.52rem", color: "var(--text-invisible)" }}>
            Σ(w·P) = {signals.weightedScore.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
}
