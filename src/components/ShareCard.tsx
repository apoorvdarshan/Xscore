"use client";

import { useRef, useState, useCallback } from "react";
import {
  ACTIONS,
  ACTION_LABELS,
  SIGNAL_POLARITY,
  type AccountAnalysis,
  type ActionName,
} from "@/lib/algorithm";

interface UserInfo {
  name: string;
  username: string;
  followers: number;
  profileImageUrl: string;
}

export function ShareCard({
  user,
  analysis,
}: {
  user: UserInfo;
  analysis: AccountAnalysis;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const scoreColor =
    analysis.overallScore >= 70
      ? "#00e676"
      : analysis.overallScore >= 40
        ? "#ffb300"
        : "#ff3d57";

  // Top 5 positive signals by probability
  const topSignals = ACTIONS
    .filter((a) => SIGNAL_POLARITY[a] === "positive")
    .map((a) => ({ action: a, prob: analysis.signalAverages[a] }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 5);

  const downloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#030304",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `xscore-${user.username}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: copy text summary
      await copyText();
    } finally {
      setDownloading(false);
    }
  }, [user.username]);

  const shareOnX = useCallback(() => {
    const text = `My @${user.username} algorithm score is ${analysis.overallScore}/100 on xscore\n\nTop signal: ${ACTION_LABELS[topSignals[0]?.action]} (${(topSignals[0]?.prob * 100).toFixed(2)}%)\n\nAnalyze yours:`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }, [user.username, analysis.overallScore, topSignals]);

  const copyText = useCallback(async () => {
    const signals = topSignals
      .map((s) => `  ${ACTION_LABELS[s.action]}: ${(s.prob * 100).toFixed(2)}%`)
      .join("\n");
    const text = `xscore Analysis — @${user.username}\nAlgorithm Score: ${analysis.overallScore}/100\n\nTop Signals:\n${signals}\n\nTweets Analyzed: ${analysis.tweets.length}\n${typeof window !== "undefined" ? window.location.origin : ""}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [user.username, analysis, topSignals]);

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowCard(!showCard)}
          className="px-4 py-2 rounded-lg text-xs transition-all"
          style={{
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            background: showCard ? "var(--accent-cyan-dim)" : "var(--bg-elevated)",
            border: `1px solid ${showCard ? "rgba(0,229,255,0.2)" : "var(--border-dim)"}`,
            color: showCard ? "var(--accent-cyan)" : "var(--text-secondary)",
          }}
        >
          {showCard ? "Hide Card" : "Share Score"}
        </button>

        {showCard && (
          <>
            <button
              onClick={downloadImage}
              disabled={downloading}
              className="px-4 py-2 rounded-lg text-xs transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
                background: "var(--accent-cyan)",
                color: "var(--bg-deep)",
                fontWeight: 500,
                opacity: downloading ? 0.6 : 1,
              }}
            >
              {downloading ? "Generating..." : "Download PNG"}
            </button>

            <button
              onClick={shareOnX}
              className="px-4 py-2 rounded-lg text-xs transition-all hover:opacity-80"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                color: "var(--text-secondary)",
              }}
            >
              Post on 𝕏
            </button>

            <button
              onClick={copyText}
              className="px-4 py-2 rounded-lg text-xs transition-all hover:opacity-80"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                color: copied ? "var(--positive)" : "var(--text-secondary)",
              }}
            >
              {copied ? "Copied!" : "Copy Text"}
            </button>
          </>
        )}
      </div>

      {/* Downloadable Card */}
      {showCard && (
        <div className="mt-4 animate-fade-up">
          <div
            ref={cardRef}
            style={{
              width: 600,
              padding: 40,
              background: "linear-gradient(145deg, #0a0b0d 0%, #030304 50%, #0a0b0d 100%)",
              borderRadius: 20,
              border: `1px solid ${scoreColor}22`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${scoreColor}08, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            {/* Grid pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.03,
                backgroundImage:
                  "linear-gradient(var(--text-ghost) 1px, transparent 1px), linear-gradient(90deg, var(--text-ghost) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 32,
                    color: "#e8eaed",
                    lineHeight: 1,
                  }}
                >
                  xscore
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "#2e3338",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase" as const,
                    marginTop: 4,
                  }}
                >
                  Algorithm Analysis
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 64,
                    fontWeight: 500,
                    color: scoreColor,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {analysis.overallScore}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "#5a6068",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  / 100
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                margin: "24px 0",
                background: `linear-gradient(90deg, ${scoreColor}33, transparent)`,
              }}
            />

            {/* User info */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              {user.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt=""
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "2px solid #252a2f",
                  }}
                  crossOrigin="anonymous"
                />
              )}
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 20,
                    color: "#e8eaed",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#5a6068",
                  }}
                >
                  @{user.username} · {formatNum(user.followers)} followers
                </div>
              </div>
            </div>

            {/* Top signals */}
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "#2e3338",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                marginBottom: 12,
              }}
            >
              Top Engagement Signals
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
              {topSignals.map((s, i) => {
                const pct = s.prob * 100;
                const barWidth = Math.min(pct * 10, 100);
                return (
                  <div key={s.action} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: "#2e3338",
                        width: 16,
                        textAlign: "right" as const,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: "#9aa0a8",
                        width: 140,
                      }}
                    >
                      {ACTION_LABELS[s.action]}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: "rgba(0,229,255,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(barWidth, 2)}%`,
                          height: "100%",
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: scoreColor,
                        width: 60,
                        textAlign: "right" as const,
                      }}
                    >
                      {pct.toFixed(3)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 16,
                borderTop: "1px solid #1a1d21",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: "#2e3338",
                  letterSpacing: "0.1em",
                }}
              >
                {analysis.tweets.length} TWEETS ANALYZED · PHOENIX WEIGHTED SCORER
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: "#5a6068",
                }}
              >
                xscore · github.com/apoorvdarshan/Xscore
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
