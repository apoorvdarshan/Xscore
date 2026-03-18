"use client";

import type { TweetAnalysis } from "@/lib/algorithm";

export function TweetCard({
  analysis,
  rank,
}: {
  analysis: TweetAnalysis;
  rank: number;
}) {
  const { tweet, signals, normalizedScore } = analysis;
  const m = tweet.public_metrics;

  const color =
    normalizedScore >= 70
      ? "var(--positive)"
      : normalizedScore >= 40
        ? "var(--accent-amber)"
        : "var(--negative)";

  const borderColor =
    normalizedScore >= 70
      ? "rgba(0,230,118,0.15)"
      : normalizedScore >= 40
        ? "rgba(255,179,0,0.15)"
        : "rgba(255,61,87,0.15)";

  return (
    <div
      className="relative rounded-lg overflow-hidden transition-all duration-300 hover:translate-y-[-1px]"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Score accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Header: rank + scores */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                fontWeight: 500,
                background: "var(--bg-elevated)",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border-dim)",
              }}
            >
              {rank}
            </span>
            <div>
              <span
                className="block"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-ghost)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                P(fav)
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--accent-cyan)",
                }}
              >
                {(signals.primaryScore * 100).toFixed(3)}%
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className="block text-2xl font-medium"
              style={{
                fontFamily: "var(--font-mono)",
                color,
                lineHeight: 1,
              }}
            >
              {normalizedScore}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: "var(--text-ghost)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              score
            </span>
          </div>
        </div>

        {/* Tweet text */}
        <p
          className="mb-4 leading-[1.65]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
          }}
        >
          {tweet.text}
        </p>

        {/* Metrics row */}
        <div
          className="flex flex-wrap gap-x-5 gap-y-1 pt-3"
          style={{ borderTop: "1px solid var(--border-dim)" }}
        >
          {[
            { icon: "♥", value: m.like_count, label: "likes" },
            { icon: "↻", value: m.retweet_count, label: "reposts" },
            { icon: "↩", value: m.reply_count, label: "replies" },
            { icon: "❝", value: m.quote_count, label: "quotes" },
            { icon: "◉", value: m.impression_count, label: "views" },
            { icon: "⊏", value: m.bookmark_count, label: "saves" },
          ].map(({ icon, value, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "var(--text-tertiary)",
              }}
            >
              <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>{icon}</span>
              {value.toLocaleString()}
            </span>
          ))}
        </div>

        {/* Bottom meta */}
        <div
          className="flex justify-between mt-2 pt-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--text-ghost)",
          }}
        >
          <span>
            Σ(w·P) = {signals.weightedScore.toFixed(4)}
          </span>
          <span>
            {new Date(tweet.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
