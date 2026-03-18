"use client";

import { useState, useRef, useEffect } from "react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { SignalBar } from "@/components/SignalBar";
import { TweetCard } from "@/components/TweetCard";
import {
  ACTIONS,
  ACTION_LABELS,
  SIGNAL_POLARITY,
  type AccountAnalysis,
} from "@/lib/algorithm";
import { decode } from "@/lib/codec";

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

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [decodeError, setDecodeError] = useState("");
  const [activeTab, setActiveTab] = useState<"signals" | "tweets" | "insights">("signals");
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check for #data= hash on mount and hash changes
  useEffect(() => {
    function loadFromHash() {
      const hash = window.location.hash;
      if (hash.startsWith("#data=")) {
        try {
          const encoded = hash.slice(6);
          const decoded = decode(encoded);
          setResult(decoded);
          setDecodeError("");
          setActiveTab("signals");
        } catch {
          setDecodeError("Invalid or corrupted results link. Run the CLI again.");
          setResult(null);
        }
      } else {
        setResult(null);
        setDecodeError("");
      }
    }

    loadFromHash();
    window.addEventListener("hashchange", loadFromHash);
    return () => window.removeEventListener("hashchange", loadFromHash);
  }, []);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const scoreColor = result
    ? result.analysis.overallScore >= 70 ? "var(--green)" : result.analysis.overallScore >= 40 ? "var(--amber)" : "var(--red)"
    : "var(--cyan)";

  const tabs = [
    { key: "signals" as const, label: "Signals", sub: "19 actions" },
    { key: "tweets" as const, label: "Tweets", sub: result ? `${result.analysis.tweets.length} ranked` : "" },
    { key: "insights" as const, label: "Insights", sub: "reach analysis" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText("npx -y @apoorvdarshan/xscore @username");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen relative">
      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] transition-all duration-[2s]"
          style={{
            background: result
              ? `radial-gradient(ellipse 50% 40% at center, ${scoreColor}06, transparent)`
              : "radial-gradient(ellipse 40% 35% at center, rgba(0,212,255,0.03), transparent)",
          }}
        />
        <div className="absolute top-0 left-[15%] w-px h-full" style={{ background: "linear-gradient(to bottom, transparent, var(--border-dim) 30%, var(--border-dim) 70%, transparent)" }} />
        <div className="absolute top-0 right-[15%] w-px h-full" style={{ background: "linear-gradient(to bottom, transparent, var(--border-dim) 30%, var(--border-dim) 70%, transparent)" }} />
      </div>

      <div className="relative max-w-[960px] mx-auto px-5 sm:px-8 pb-32">
        {/* ─── HERO ─── */}
        <header className="pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div className="fade-up text-center">
            <h1 className="display" style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)", lineHeight: 0.9, letterSpacing: "-0.04em", fontWeight: 400 }}>
              <span style={{ color: "var(--text-primary)" }}>x</span>
              <span style={{ color: "var(--cyan)", fontStyle: "italic" }}>score</span>
            </h1>
            <p className="mono mt-5" style={{ fontSize: "0.68rem", color: "var(--text-ghost)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" style={{ background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)", animation: "pulse-dot 2.5s ease-in-out infinite" }} />
              Algorithm Analysis Engine
            </p>
          </div>

          {/* ─── LANDING (no results) ─── */}
          {!result && (
            <div className="mt-14 max-w-lg mx-auto fade-up stagger-2">
              {/* Terminal card */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-dim)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                {/* Terminal header */}
                <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-dim)" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                  <span className="mono ml-2" style={{ fontSize: "0.55rem", color: "var(--text-ghost)" }}>terminal</span>
                </div>

                {/* Command */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="mono flex items-center gap-2" style={{ fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--green)" }}>$</span>
                    <span style={{ color: "var(--text-primary)" }}>npx -y @apoorvdarshan/xscore</span>
                    <span style={{ color: "var(--cyan)" }}>@username</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="mono px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-80 shrink-0"
                    style={{
                      fontSize: "0.6rem",
                      background: copied ? "rgba(52,211,153,0.1)" : "var(--bg-elevated)",
                      border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "var(--border-dim)"}`,
                      color: copied ? "var(--green)" : "var(--text-ghost)",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Run the CLI", desc: "Fetches tweets using your browser cookies" },
                  { step: "2", title: "Local scoring", desc: "Algorithm scores 19 engagement signals" },
                  { step: "3", title: "View results", desc: "Opens shareable results page here" },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="text-center">
                    <div
                      className="mono inline-flex items-center justify-center w-7 h-7 rounded-full mb-2"
                      style={{ fontSize: "0.65rem", fontWeight: 600, background: "var(--cyan-dim)", color: "var(--cyan)", border: "1px solid rgba(0,212,255,0.15)" }}
                    >
                      {step}
                    </div>
                    <p className="mono" style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--text-secondary)" }}>{title}</p>
                    <p className="mono mt-1" style={{ fontSize: "0.5rem", color: "var(--text-ghost)", lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>

              {/* Privacy note */}
              <div className="mt-8 text-center">
                <p className="mono" style={{ fontSize: "0.52rem", color: "var(--text-ghost)", letterSpacing: "0.04em" }}>
                  <span style={{ color: "var(--green)" }}>●</span>{" "}
                  Your data never touches our servers. Everything runs on your machine.
                </p>
              </div>

              {/* Prerequisites */}
              <div
                className="mt-6 rounded-xl p-4"
                style={{ background: "var(--cyan-glow)", border: "1px solid rgba(0,212,255,0.06)" }}
              >
                <p className="mono" style={{ fontSize: "0.58rem", color: "var(--text-tertiary)", lineHeight: 1.7 }}>
                  <span style={{ color: "var(--cyan)", fontWeight: 500 }}>Prerequisites:</span>{" "}
                  Node.js 18+ · Logged into{" "}
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)", textDecoration: "underline", textUnderlineOffset: "2px" }}>x.com</a>
                  {" "}in Chrome/Edge/Brave · Uses{" "}
                  <a href="https://www.npmjs.com/package/@steipete/bird" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)", textDecoration: "underline", textUnderlineOffset: "2px" }}>@steipete/bird</a>
                  {" "}for cookie-based data access
                </p>
              </div>

              {/* Hint */}
              <p className="mono text-center mt-5" style={{ fontSize: "0.58rem", color: "var(--text-ghost)" }}>
                based on{" "}
                <a href="https://github.com/xai-org/x-algorithm" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--cyan)]" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  xai-org/x-algorithm
                </a>
                {" "}· 19 engagement signals · phoenix weighted scorer
              </p>

              {/* Decode error */}
              {decodeError && (
                <div className="fade-up mt-6 mono text-center py-3 px-4 rounded-xl" style={{ fontSize: "0.75rem", color: "var(--red)", background: "var(--red-dim)", border: "1px solid rgba(251,79,94,0.15)" }}>
                  {decodeError}
                </div>
              )}
            </div>
          )}
        </header>

        {/* ─── RESULTS ─── */}
        {result && (
          <div ref={resultsRef} className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => { window.location.hash = ""; setResult(null); }}
              className="mono px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-80 fade-up"
              style={{ fontSize: "0.6rem", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", color: "var(--text-ghost)" }}
            >
              ← Analyze another
            </button>

            {/* Profile Hero */}
            <section className="fade-up glass-card rounded-2xl overflow-hidden">
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent 10%, ${scoreColor}, transparent 90%)` }} />
              <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 flex items-center gap-5 min-w-0">
                    {result.user.profileImageUrl && (
                      <div className="relative shrink-0">
                        <img src={result.user.profileImageUrl} alt="" className="w-[72px] h-[72px] rounded-2xl" style={{ border: "2px solid var(--border-base)" }} />
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center mono" style={{ fontSize: "0.6rem", fontWeight: 600, background: "var(--bg-card)", border: "1px solid var(--border-base)" }}>𝕏</div>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="display truncate" style={{ fontSize: "1.6rem", fontWeight: 600, lineHeight: 1.15 }}>{result.user.name}</h2>
                      <span className="mono block mt-0.5" style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>@{result.user.username}</span>
                      {result.user.description && (
                        <p className="serif mt-2 line-clamp-2" style={{ fontSize: "0.8rem", color: "var(--text-ghost)", lineHeight: 1.5 }}>{result.user.description}</p>
                      )}
                    </div>
                  </div>
                  <ScoreGauge score={result.analysis.overallScore} size="lg" />
                </div>
                <div className="mt-6 pt-5 flex flex-wrap gap-x-8 gap-y-3" style={{ borderTop: "1px solid var(--border-dim)" }}>
                  {[
                    { label: "Followers", value: fmt(result.user.followers) },
                    { label: "Posts", value: fmt(result.user.tweetCount) },
                    { label: "Analyzed", value: `${result.analysis.tweets.length} tweets` },
                    { label: "Top Signal", value: ACTION_LABELS[ACTIONS.filter(a => SIGNAL_POLARITY[a] === "positive").sort((a, b) => result.analysis.signalAverages[b] - result.analysis.signalAverages[a])[0]] },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <span className="mono block" style={{ fontSize: "0.5rem", color: "var(--text-ghost)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{stat.label}</span>
                      <span className="mono" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 sm:px-8 py-2.5 mono flex items-center gap-2" style={{ borderTop: "1px solid var(--border-dim)", fontSize: "0.52rem", color: "var(--text-ghost)", letterSpacing: "0.04em" }}>
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--amber)" }} />
                Score = Σ(w × P(action)) · phoenix/runners.py ·
                <span style={{ color: "var(--amber)" }}>weights not disclosed — ±1.0 placeholders</span>
              </div>
            </section>

            {/* Share */}
            <div className="fade-up stagger-2">
              <button
                onClick={() => {
                  const topSignal = ACTIONS.filter(a => SIGNAL_POLARITY[a] === "positive")
                    .sort((a, b) => result.analysis.signalAverages[b] - result.analysis.signalAverages[a])[0];
                  const text = `My @${result.user.username} algorithm score is ${result.analysis.overallScore}/100\n\nTop signal: ${ACTION_LABELS[topSignal]} (${(result.analysis.signalAverages[topSignal] * 100).toFixed(2)}%)\n\nBuilt by @apoorvdarshan\n\nCheck yours: xscores.vercel.app`;
                  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="mono px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-80"
                style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", color: "var(--text-secondary)" }}
              >
                Share on 𝕏
              </button>
            </div>

            {/* Tabs */}
            <nav className="fade-up stagger-2 flex gap-0 rounded-xl overflow-hidden glass-card">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-3.5 relative transition-colors duration-200"
                  style={{ background: activeTab === tab.key ? "var(--bg-elevated)" : "transparent" }}
                >
                  <span className="mono block" style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-ghost)" }}>
                    {tab.label}
                  </span>
                  <span className="mono block mt-0.5" style={{ fontSize: "0.5rem", color: "var(--text-ghost)" }}>{tab.sub}</span>
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full" style={{ background: "var(--cyan)" }} />
                  )}
                </button>
              ))}
            </nav>

            {/* ─── SIGNALS TAB ─── */}
            {activeTab === "signals" && (
              <section className="fade-up stagger-3 glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-dim)" }}>
                  <div>
                    <h3 className="display" style={{ fontSize: "1.2rem", fontWeight: 600 }}>Signal Spectrum</h3>
                    <span className="mono" style={{ fontSize: "0.52rem", color: "var(--text-ghost)", letterSpacing: "0.08em" }}>
                      AVG P(ACTION) ACROSS {result.analysis.tweets.length} TWEETS
                    </span>
                  </div>
                  <div className="flex gap-4 mono" style={{ fontSize: "0.52rem", color: "var(--text-ghost)" }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-[2px] rounded" style={{ background: "var(--cyan)" }} /> positive
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-[2px] rounded" style={{ background: "var(--red)" }} /> negative
                    </span>
                  </div>
                </div>
                <div className="px-5 py-3">
                  {ACTIONS.map((action, i) => {
                    const maxProb = Math.max(...ACTIONS.filter(a => SIGNAL_POLARITY[a] === SIGNAL_POLARITY[action]).map(a => result.analysis.signalAverages[a]));
                    return (
                      <SignalBar key={action} action={action} label={ACTION_LABELS[action]} probability={result.analysis.signalAverages[action]} index={i} maxProb={maxProb} />
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── TWEETS TAB ─── */}
            {activeTab === "tweets" && (
              <section className="space-y-2.5">
                <p className="fade-up mono px-1 mb-3" style={{ fontSize: "0.52rem", color: "var(--text-ghost)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Ranked by P(favorite) desc · phoenix/runners.py
                </p>
                {result.analysis.tweets.map((ta, i) => (
                  <div key={ta.tweet.id} className="fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <TweetCard analysis={ta} rank={i + 1} />
                  </div>
                ))}
              </section>
            )}

            {/* ─── INSIGHTS TAB ─── */}
            {activeTab === "insights" && (
              <section className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { tweet: result.analysis.bestTweet, label: "Top Performing", rank: 1, color: "var(--green)", hex: "#34d399" },
                    { tweet: result.analysis.worstTweet, label: "Lowest Performing", rank: result.analysis.tweets.length, color: "var(--red)", hex: "#fb4f5e" },
                  ].filter(x => x.tweet).map(({ tweet, label, rank, color, hex }) => (
                    <div key={label} className="fade-up glass-card rounded-2xl overflow-hidden">
                      <div className="px-4 py-2.5 flex items-center gap-2 mono" style={{ borderBottom: `1px solid ${hex}15`, fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        {label}
                      </div>
                      <div className="p-3">
                        <TweetCard analysis={tweet!} rank={rank} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { items: result.analysis.helpingReach, label: "Boosting Reach", color: "var(--green)", sign: "+" },
                    { items: result.analysis.hurtingReach, label: "Hurting Reach", color: "var(--red)", sign: "−" },
                  ].map(({ items, label, color, sign }) => (
                    <div key={label} className="fade-up glass-card rounded-2xl overflow-hidden">
                      <div className="px-5 py-2.5 flex items-center gap-2 mono" style={{ borderBottom: "1px solid var(--border-dim)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        {label}
                      </div>
                      <ul className="p-5 space-y-3">
                        {items.map((item, i) => (
                          <li key={i} className="flex gap-3 serif" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                            <span className="mono shrink-0" style={{ color, fontWeight: 500 }}>{sign}</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="fade-up stagger-5 glass-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-2.5 mono" style={{ borderBottom: "1px solid var(--border-dim)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cyan)" }}>
                    Algorithm Pipeline
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { n: "Source", d: "Thunder + retrieval", f: "candidate-pipeline/" },
                        { n: "Filter", d: "Eligibility", f: "candidate-pipeline/" },
                        { n: "Phoenix", d: "sigmoid(logits)", f: "phoenix/" },
                        { n: "Weighted", d: "Σ(w·P)", f: "README.md", active: true },
                        { n: "Diversity", d: "Author dedup", f: "home-mixer/" },
                        { n: "OON", d: "OON adjust", f: "home-mixer/" },
                      ].map((s, i) => (
                        <div key={s.n} className="flex items-center gap-2">
                          <div className="px-3 py-2 rounded-lg" style={{ background: s.active ? "var(--cyan-dim)" : "var(--bg-elevated)", border: `1px solid ${s.active ? "rgba(0,212,255,0.2)" : "var(--border-dim)"}` }}>
                            <span className="mono block" style={{ fontSize: "0.65rem", fontWeight: 500, color: s.active ? "var(--cyan)" : "var(--text-primary)" }}>{s.n}</span>
                            <span className="mono block" style={{ fontSize: "0.48rem", color: "var(--text-ghost)" }}>{s.d}</span>
                          </div>
                          {i < 5 && <span className="mono" style={{ fontSize: "0.6rem", color: "var(--border-bright)" }}>→</span>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 mono p-3.5 rounded-lg" style={{ fontSize: "0.6rem", lineHeight: 1.7, color: "var(--text-tertiary)", background: "var(--cyan-glow)", border: "1px solid rgba(0,212,255,0.06)" }}>
                      P(action) approximated from tweet metrics. Real Phoenix model uses Grok transformer with candidate isolation (phoenix/recsys_model.py). Production weights undisclosed.
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <footer className={`text-center ${result ? "mt-20" : ""} fade-up stagger-4`}>
          {!result && (
            <div className="mono flex items-center justify-center gap-4 mb-6" style={{ fontSize: "0.55rem", color: "var(--text-ghost)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {["19 signals", "phoenix scorer", "grok transformer"].map((item, i) => (
                <span key={item}>
                  {i > 0 && <span className="mr-4" style={{ color: "var(--border-base)" }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="mono mb-4" style={{ fontSize: "0.55rem", color: "var(--text-ghost)" }}>
            powered by{" "}
            <a href="https://github.com/xai-org/x-algorithm" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--cyan)]" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>xai-org/x-algorithm</a>
            {" "}· data via{" "}
            <a href="https://www.npmjs.com/package/@steipete/bird" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--cyan)]" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>@steipete/bird</a>
          </div>

          <div className="mono mb-4" style={{ fontSize: "0.5rem", color: "var(--text-ghost)", maxWidth: "36rem", margin: "0 auto 1rem" }}>
            Disclaimer: This is an independent tool not affiliated with X. Uses @steipete/bird for data access and xai-org/x-algorithm for scoring logic. Use at your own discretion.
          </div>

          <div className="mono pt-4 flex items-center justify-center gap-3 flex-wrap" style={{ borderTop: "1px solid var(--border-dim)", fontSize: "0.55rem" }}>
            <span style={{ color: "var(--text-tertiary)" }}>Built by Apoorv Darshan</span>
            {[
              { label: "Source", href: "https://github.com/apoorvdarshan/Xscore" },
              { label: "GitHub", href: "https://github.com/apoorvdarshan" },
              { label: "𝕏", href: "https://x.com/apoorvdarshan" },
              { label: "LinkedIn", href: "https://linkedin.com/in/apoorvdarshan" },
              { label: "Email", href: "mailto:ad13dtu@gmail.com" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="transition-colors hover:text-[var(--cyan)]" style={{ color: "var(--text-ghost)" }}>
                {label}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
