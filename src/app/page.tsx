"use client";

import { useState } from "react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { SignalBar } from "@/components/SignalBar";
import { TweetCard } from "@/components/TweetCard";
import {
  ACTIONS,
  ACTION_LABELS,
  type ActionName,
  type AccountAnalysis,
} from "@/lib/algorithm";

interface UserInfo {
  name: string;
  username: string;
  followers: number;
  following: number;
  tweetCount: number;
  profileImageUrl: string;
  description: string;
}

interface AnalysisResponse {
  user: UserInfo;
  analysis: AccountAnalysis;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"signals" | "tweets" | "insights">("signals");

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/analyze?username=${encodeURIComponent(username.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">xscore</h1>
        <p style={{ color: "var(--muted)" }} className="text-sm max-w-lg mx-auto">
          Analyze any X account against the{" "}
          <a
            href="https://github.com/xai-org/x-algorithm"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--accent)" }}
          >
            open-source X recommendation algorithm
          </a>
          . Scores based on the Phoenix weighted scorer formula.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleAnalyze} className="flex gap-3 max-w-md mx-auto mb-10">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="@username"
          className="flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
            color: "var(--fg)",
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div
          className="max-w-md mx-auto mb-6 p-4 rounded-xl border text-sm text-center"
          style={{
            background: "rgba(244,33,46,0.08)",
            borderColor: "var(--negative)",
            color: "var(--negative)",
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* User Profile + Overall Score */}
          <div
            className="rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-6"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
          >
            <img
              src={result.user.profileImageUrl}
              alt={result.user.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">{result.user.name}</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                @{result.user.username}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {result.user.followers.toLocaleString()} followers ·{" "}
                {result.user.tweetCount.toLocaleString()} tweets
              </p>
            </div>
            <ScoreGauge
              score={result.analysis.overallScore}
              label="Overall Score"
            />
          </div>

          {/* Algorithm Citation */}
          <div
            className="rounded-xl border p-4 text-xs"
            style={{
              background: "rgba(29,155,240,0.06)",
              borderColor: "rgba(29,155,240,0.2)",
              color: "var(--muted)",
            }}
          >
            <strong style={{ color: "var(--accent)" }}>Algorithm Source:</strong>{" "}
            Score = Σ(weight × P(action)) per{" "}
            <a
              href="https://github.com/xai-org/x-algorithm"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              xai-org/x-algorithm
            </a>{" "}
            README.md. 19 action signals from phoenix/runners.py. Primary ranking by P(favorite).{" "}
            <strong style={{ color: "var(--warning)" }}>
              Actual weights are not disclosed in the repo — all weights shown as ±1.0 placeholders.
            </strong>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--card)" }}>
            {(["signals", "tweets", "insights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize"
                style={{
                  background: activeTab === tab ? "var(--card-border)" : "transparent",
                  color: activeTab === tab ? "var(--fg)" : "var(--muted)",
                }}
              >
                {tab === "signals"
                  ? "Signal Breakdown"
                  : tab === "tweets"
                    ? `Tweets (${result.analysis.tweets.length})`
                    : "Insights"}
              </button>
            ))}
          </div>

          {/* Signals Tab */}
          {activeTab === "signals" && (
            <div
              className="rounded-xl border p-6 space-y-5"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>
                Average P(action) across {result.analysis.tweets.length} tweets
                <span className="block text-xs font-normal mt-1">
                  Source: xai-org/x-algorithm/phoenix/runners.py — ACTIONS list (19 signals)
                </span>
              </h3>
              {ACTIONS.map((action) => (
                <SignalBar
                  key={action}
                  action={action}
                  label={ACTION_LABELS[action]}
                  probability={result.analysis.signalAverages[action]}
                />
              ))}
            </div>
          )}

          {/* Tweets Tab */}
          {activeTab === "tweets" && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Ranked by P(favorite) descending — mirrors phoenix/runners.py:
                ranked_indices = jnp.argsort(-primary_scores)
              </p>
              {result.analysis.tweets.map((ta, i) => (
                <TweetCard key={ta.tweet.id} analysis={ta} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === "insights" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Best Tweet */}
              {result.analysis.bestTweet && (
                <div
                  className="rounded-xl border p-5"
                  style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
                >
                  <h3
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "var(--positive)" }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--positive)" }} />
                    Best Performing Tweet
                  </h3>
                  <TweetCard analysis={result.analysis.bestTweet} rank={1} />
                </div>
              )}

              {/* Worst Tweet */}
              {result.analysis.worstTweet && (
                <div
                  className="rounded-xl border p-5"
                  style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
                >
                  <h3
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "var(--negative)" }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--negative)" }} />
                    Worst Performing Tweet
                  </h3>
                  <TweetCard
                    analysis={result.analysis.worstTweet}
                    rank={result.analysis.tweets.length}
                  />
                </div>
              )}

              {/* Helping Reach */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: "var(--positive)" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--positive)" }} />
                  What&apos;s Working
                </h3>
                <ul className="space-y-2">
                  {result.analysis.helpingReach.map((item, i) => (
                    <li key={i} className="text-sm" style={{ color: "var(--muted)" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hurting Reach */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: "var(--negative)" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--negative)" }} />
                  What&apos;s Hurting Reach
                </h3>
                <ul className="space-y-2">
                  {result.analysis.hurtingReach.map((item, i) => (
                    <li key={i} className="text-sm" style={{ color: "var(--muted)" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Algorithm Pipeline Info */}
              <div
                className="md:col-span-2 rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  How the Algorithm Works
                </h3>
                <div className="text-sm space-y-2" style={{ color: "var(--muted)" }}>
                  <p>
                    The X For You feed pipeline (per{" "}
                    <a
                      href="https://github.com/xai-org/x-algorithm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "var(--accent)" }}
                    >
                      xai-org/x-algorithm
                    </a>
                    ):
                  </p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>
                      <strong>Source</strong> — In-network (Thunder) + out-of-network (Phoenix retrieval)
                      candidates are gathered.{" "}
                      <span className="text-xs">(candidate-pipeline/source.rs)</span>
                    </li>
                    <li>
                      <strong>Filter</strong> — Candidates are filtered for eligibility.{" "}
                      <span className="text-xs">(candidate-pipeline/filter.rs)</span>
                    </li>
                    <li>
                      <strong>Phoenix Scorer</strong> — A Grok-based transformer predicts 19
                      engagement probabilities via sigmoid(logits).{" "}
                      <span className="text-xs">(phoenix/recsys_model.py, phoenix/runners.py)</span>
                    </li>
                    <li>
                      <strong>Weighted Scorer</strong> — Final Score = Σ(weight × P(action)).{" "}
                      <span className="text-xs">(README.md — weights not disclosed)</span>
                    </li>
                    <li>
                      <strong>Author Diversity</strong> — Reduces repeated authors in feed.
                    </li>
                    <li>
                      <strong>OON Scorer</strong> — Adjusts out-of-network content scores.
                    </li>
                  </ol>
                  <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: "rgba(255,212,0,0.08)" }}>
                    Note: This tool approximates P(action) from observable tweet metrics since we
                    cannot run the actual Phoenix transformer model. The real model uses user
                    embeddings, history sequences, and candidate embeddings processed through a
                    transformer with candidate isolation (phoenix/recsys_model.py).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!result && !loading && (
        <div className="text-center mt-16 text-xs" style={{ color: "var(--muted)" }}>
          <p className="mb-2">
            Built on the{" "}
            <a
              href="https://github.com/xai-org/x-algorithm"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              xai-org/x-algorithm
            </a>{" "}
            open-source release.
          </p>
          <p>19 engagement signals · Phoenix weighted scorer · Grok-based transformer architecture</p>
        </div>
      )}
    </main>
  );
}
