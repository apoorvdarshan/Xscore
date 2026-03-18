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
        ? "var(--warning)"
        : "var(--negative)";

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          #{rank} — Primary Score (P(favorite)): {(signals.primaryScore * 100).toFixed(3)}%
        </span>
        <span className="text-lg font-bold" style={{ color }}>
          {normalizedScore}
        </span>
      </div>
      <p className="text-sm mb-3 leading-relaxed">{tweet.text}</p>
      <div className="flex gap-4 text-xs" style={{ color: "var(--muted)" }}>
        <span>♥ {m.like_count.toLocaleString()}</span>
        <span>↻ {m.retweet_count.toLocaleString()}</span>
        <span>💬 {m.reply_count.toLocaleString()}</span>
        <span>❝ {m.quote_count.toLocaleString()}</span>
        <span>👁 {m.impression_count.toLocaleString()}</span>
        <span>🔖 {m.bookmark_count.toLocaleString()}</span>
      </div>
      <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
        Weighted Score: {signals.weightedScore.toFixed(4)} — {new Date(tweet.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
