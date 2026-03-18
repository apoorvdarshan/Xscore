"use client";

import { useState, useRef, useEffect } from "react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { SignalBar } from "@/components/SignalBar";
import { TweetCard } from "@/components/TweetCard";
import {
  ACTIONS,
  ACTION_LABELS,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

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
      setActiveTab("signals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { key: "signals" as const, label: "Signals", count: 19 },
    { key: "tweets" as const, label: "Tweets", count: result?.analysis.tweets.length },
    { key: "insights" as const, label: "Insights", count: null },
  ];

  return (
    <main className="min-h-screen relative">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: result
            ? `radial-gradient(ellipse 60% 40% at 50% 0%, ${
                result.analysis.overallScore >= 70
                  ? "rgba(0,230,118,0.04)"
                  : result.analysis.overallScore >= 40
                    ? "rgba(255,179,0,0.04)"
                    : "rgba(255,61,87,0.04)"
              }, transparent)`
            : "radial-gradient(ellipse 50% 30% at 50% 0%, rgba(0,229,255,0.03), transparent)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 pb-24">
        {/* Header */}
        <header className="pt-16 pb-20 text-center">
          <div className="animate-fade-up">
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              xscore
            </h1>
            <div
              className="mt-4 flex items-center justify-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--text-ghost)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--accent-cyan)",
                  boxShadow: "0 0 6px var(--accent-cyan)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              <span>Algorithm Analysis Engine</span>
              <span style={{ color: "var(--border-base)" }}>·</span>
              <a
                href="https://github.com/xai-org/x-algorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--accent-cyan)]"
              >
                xai-org/x-algorithm
              </a>
            </div>
          </div>

          {/* Search */}
          <form
            onSubmit={handleAnalyze}
            className="mt-12 max-w-xl mx-auto animate-fade-up stagger-2"
          >
            <div
              className="relative group"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-dim)",
                borderRadius: "12px",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
            >
              {/* @ prefix */}
              <span
                className="absolute left-5 top-1/2 -translate-y-1/2"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1rem",
                  color: "var(--text-ghost)",
                }}
              >
                @
              </span>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full py-4 pl-10 pr-32 bg-transparent outline-none"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                  caretColor: "var(--accent-cyan)",
                }}
                disabled={loading}
                onFocus={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.borderColor = "var(--accent-cyan)";
                    parent.style.boxShadow = "0 0 0 1px rgba(0,229,255,0.15), 0 8px 32px rgba(0,0,0,0.3)";
                  }
                }}
                onBlur={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.borderColor = "var(--border-dim)";
                    parent.style.boxShadow = "none";
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background: loading ? "var(--bg-elevated)" : "var(--accent-cyan)",
                  color: loading ? "var(--text-tertiary)" : "var(--bg-deep)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"
                    />
                    Scanning
                  </span>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div
              className="mt-6 max-w-xl mx-auto animate-fade-up"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                color: "var(--negative)",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--negative-dim)",
                border: "1px solid rgba(255,61,87,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="mt-16 space-y-4 max-w-xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shimmer-loading rounded-lg"
                  style={{
                    height: i === 1 ? "120px" : "60px",
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </header>

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="space-y-8">
            {/* Profile + Score Hero */}
            <section
              className="animate-fade-up rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-dim)",
              }}
            >
              {/* Top accent line */}
              <div
                className="h-[1px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${
                    result.analysis.overallScore >= 70
                      ? "var(--positive)"
                      : result.analysis.overallScore >= 40
                        ? "var(--accent-amber)"
                        : "var(--negative)"
                  }, transparent)`,
                }}
              />

              <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                {/* User info */}
                <div className="flex-1 flex items-center gap-5">
                  {result.user.profileImageUrl && (
                    <div className="relative">
                      <img
                        src={result.user.profileImageUrl}
                        alt=""
                        className="w-16 h-16 rounded-full"
                        style={{
                          border: "2px solid var(--border-base)",
                        }}
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-base)",
                          fontSize: "0.55rem",
                        }}
                      >
                        𝕏
                      </div>
                    </div>
                  )}
                  <div>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.75rem",
                        lineHeight: 1.1,
                      }}
                    >
                      {result.user.name}
                    </h2>
                    <span
                      className="block mt-0.5"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      @{result.user.username}
                    </span>
                    <div
                      className="flex gap-4 mt-2"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.68rem",
                        color: "var(--text-ghost)",
                      }}
                    >
                      <span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {formatNumber(result.user.followers)}
                        </span>{" "}
                        followers
                      </span>
                      <span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {formatNumber(result.user.tweetCount)}
                        </span>{" "}
                        posts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score gauge */}
                <ScoreGauge
                  score={result.analysis.overallScore}
                  label="Algorithm Score"
                  size="lg"
                />
              </div>

              {/* Source citation bar */}
              <div
                className="px-8 py-3 flex items-center gap-2"
                style={{
                  borderTop: "1px solid var(--border-dim)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-ghost)",
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  className="inline-block w-1 h-1 rounded-full"
                  style={{ background: "var(--accent-amber)" }}
                />
                <span>
                  Score = Σ(w × P(action)) · phoenix/runners.py ·{" "}
                  <span style={{ color: "var(--accent-amber)" }}>
                    weights not disclosed in repo — using ±1.0 placeholders
                  </span>
                </span>
              </div>
            </section>

            {/* Tab bar */}
            <nav
              className="animate-fade-up stagger-2 flex items-center gap-1 p-1 rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-dim)",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-3 rounded-lg transition-all relative"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-ghost)",
                    background: activeTab === tab.key ? "var(--bg-elevated)" : "transparent",
                  }}
                >
                  {tab.label}
                  {tab.count != null && (
                    <span
                      className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[0.55rem]"
                      style={{
                        background: activeTab === tab.key ? "var(--accent-cyan-dim)" : "var(--bg-elevated)",
                        color: activeTab === tab.key ? "var(--accent-cyan)" : "var(--text-ghost)",
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Signals Tab */}
            {activeTab === "signals" && (
              <section
                className="animate-fade-up stagger-3 rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-dim)",
                }}
              >
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border-dim)" }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.25rem",
                      }}
                    >
                      Signal Spectrum
                    </h3>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--text-ghost)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      AVG P(ACTION) ACROSS {result.analysis.tweets.length} TWEETS ·
                      PHOENIX/RUNNERS.PY
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-4"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--text-ghost)",
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-0.5 rounded"
                        style={{ background: "var(--accent-cyan)" }}
                      />
                      positive
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-0.5 rounded"
                        style={{ background: "var(--negative)" }}
                      />
                      negative
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {ACTIONS.map((action, i) => (
                    <SignalBar
                      key={action}
                      action={action}
                      label={ACTION_LABELS[action]}
                      probability={result.analysis.signalAverages[action]}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Tweets Tab */}
            {activeTab === "tweets" && (
              <section className="space-y-3">
                <div
                  className="animate-fade-up px-1 mb-4"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--text-ghost)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Ranked by P(favorite) desc · phoenix/runners.py · ranked_indices = jnp.argsort(-primary_scores)
                </div>
                {result.analysis.tweets.map((ta, i) => (
                  <div
                    key={ta.tweet.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <TweetCard analysis={ta} rank={i + 1} />
                  </div>
                ))}
              </section>
            )}

            {/* Insights Tab */}
            {activeTab === "insights" && (
              <section className="space-y-6">
                {/* Best / Worst grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {result.analysis.bestTweet && (
                    <div className="animate-fade-up">
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid rgba(0,230,118,0.15)",
                        }}
                      >
                        <div
                          className="px-5 py-3 flex items-center gap-2"
                          style={{
                            borderBottom: "1px solid rgba(0,230,118,0.1)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--positive)",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "var(--positive)" }}
                          />
                          Top Performing
                        </div>
                        <div className="p-4">
                          <TweetCard analysis={result.analysis.bestTweet} rank={1} />
                        </div>
                      </div>
                    </div>
                  )}

                  {result.analysis.worstTweet && (
                    <div className="animate-fade-up stagger-2">
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid rgba(255,61,87,0.15)",
                        }}
                      >
                        <div
                          className="px-5 py-3 flex items-center gap-2"
                          style={{
                            borderBottom: "1px solid rgba(255,61,87,0.1)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--negative)",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "var(--negative)" }}
                          />
                          Lowest Performing
                        </div>
                        <div className="p-4">
                          <TweetCard
                            analysis={result.analysis.worstTweet}
                            rank={result.analysis.tweets.length}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Helping + Hurting */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div
                    className="animate-fade-up stagger-3 rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-dim)",
                    }}
                  >
                    <div
                      className="px-5 py-3 flex items-center gap-2"
                      style={{
                        borderBottom: "1px solid var(--border-dim)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--positive)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--positive)" }}
                      />
                      Boosting Reach
                    </div>
                    <ul className="p-5 space-y-3">
                      {result.analysis.helpingReach.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "var(--positive)", flexShrink: 0 }}>+</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="animate-fade-up stagger-4 rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-dim)",
                    }}
                  >
                    <div
                      className="px-5 py-3 flex items-center gap-2"
                      style={{
                        borderBottom: "1px solid var(--border-dim)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--negative)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--negative)" }}
                      />
                      Hurting Reach
                    </div>
                    <ul className="p-5 space-y-3">
                      {result.analysis.hurtingReach.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "var(--negative)", flexShrink: 0 }}>−</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Algorithm Pipeline */}
                <div
                  className="animate-fade-up stagger-5 rounded-2xl overflow-hidden"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-dim)",
                  }}
                >
                  <div
                    className="px-5 py-3"
                    style={{
                      borderBottom: "1px solid var(--border-dim)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    Algorithm Pipeline
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "Source", desc: "Thunder + Phoenix retrieval", file: "candidate-pipeline/source.rs" },
                        { name: "Filter", desc: "Eligibility checks", file: "candidate-pipeline/filter.rs" },
                        { name: "Phoenix", desc: "Transformer → sigmoid(logits)", file: "phoenix/recsys_model.py" },
                        { name: "Weighted", desc: "Σ(w × P(action))", file: "README.md" },
                        { name: "Diversity", desc: "Author dedup", file: "home-mixer/" },
                        { name: "OON", desc: "Out-of-network adjust", file: "home-mixer/" },
                      ].map((stage, i) => (
                        <div key={stage.name} className="flex items-center gap-3">
                          <div
                            className="px-4 py-2.5 rounded-lg"
                            style={{
                              background: i === 3 ? "var(--accent-cyan-dim)" : "var(--bg-elevated)",
                              border: `1px solid ${i === 3 ? "rgba(0,229,255,0.2)" : "var(--border-dim)"}`,
                            }}
                          >
                            <span
                              className="block"
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.72rem",
                                fontWeight: 500,
                                color: i === 3 ? "var(--accent-cyan)" : "var(--text-primary)",
                              }}
                            >
                              {stage.name}
                            </span>
                            <span
                              className="block"
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.55rem",
                                color: "var(--text-ghost)",
                              }}
                            >
                              {stage.desc}
                            </span>
                            <span
                              className="block"
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.5rem",
                                color: "var(--text-ghost)",
                                opacity: 0.5,
                              }}
                            >
                              {stage.file}
                            </span>
                          </div>
                          {i < 5 && (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.7rem",
                                color: "var(--border-bright)",
                              }}
                            >
                              →
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div
                      className="mt-5 p-4 rounded-lg"
                      style={{
                        background: "var(--accent-cyan-glow)",
                        border: "1px solid rgba(0,229,255,0.08)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        lineHeight: 1.7,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      This tool approximates P(action) from observable tweet metrics.
                      The real Phoenix model processes user embeddings + history sequences
                      through a Grok-based transformer with candidate isolation
                      (phoenix/recsys_model.py). Actual production weights are not
                      disclosed in the open-source repo.
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Footer — always visible */}
        <footer
          className={`text-center ${result ? "mt-16" : ""} animate-fade-up stagger-4`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--text-ghost)",
            letterSpacing: "0.06em",
          }}
        >
          {!result && !loading && (
            <div className="flex items-center justify-center gap-6 mb-5">
              {["19 signals", "phoenix scorer", "grok transformer"].map((item, i) => (
                <span key={item} className="flex items-center gap-2">
                  {i > 0 && <span style={{ color: "var(--border-base)" }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="mb-3">
            powered by{" "}
            <a
              href="https://github.com/xai-org/x-algorithm"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-cyan)]"
            >
              xai-org/x-algorithm
            </a>
            {" "}· data via{" "}
            <a
              href="https://www.npmjs.com/package/@steipete/bird"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-cyan)]"
            >
              @steipete/bird
            </a>
          </div>

          {/* Author links */}
          <div
            className="pt-4 flex items-center justify-center gap-4"
            style={{ borderTop: "1px solid var(--border-dim)" }}
          >
            <span style={{ color: "var(--text-tertiary)" }}>Built by Apoorv Darshan</span>
            <span style={{ color: "var(--border-base)" }}>·</span>
            <a
              href="https://github.com/apoorvdarshan/Xscore"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-cyan)]"
            >
              GitHub
            </a>
            <a
              href="https://x.com/apoorvdarshan"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-cyan)]"
            >
              𝕏
            </a>
            <a
              href="https://linkedin.com/in/apoorvdarshan"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-cyan)]"
            >
              LinkedIn
            </a>
            <a
              href="mailto:ad13dtu@gmail.com"
              className="transition-colors hover:text-[var(--accent-cyan)]"
            >
              Email
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
