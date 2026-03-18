"use client";

import { useRef, useState, useCallback } from "react";
import {
  ACTIONS,
  ACTION_LABELS,
  SIGNAL_POLARITY,
  type AccountAnalysis,
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

  const scoreColor =
    analysis.overallScore >= 70
      ? "#00e676"
      : analysis.overallScore >= 40
        ? "#ffb300"
        : "#ff3d57";

  const topSignals = ACTIONS
    .filter((a) => SIGNAL_POLARITY[a] === "positive")
    .map((a) => ({ action: a, prob: analysis.signalAverages[a] }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 5);

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  const downloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
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
      // silent fail
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

  return (
    <div>
      {/* The Card */}
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
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 32,
                color: "#e8eaed",
                lineHeight: 1,
              }}
            >
              xscore
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
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

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
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
                fontFamily: "'DM Mono', monospace",
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
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 20,
                color: "#e8eaed",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
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
            fontFamily: "'DM Mono', monospace",
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
                    fontFamily: "'DM Mono', monospace",
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
                    fontFamily: "'DM Mono', monospace",
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
                    fontFamily: "'DM Mono', monospace",
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
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: "#2e3338",
              letterSpacing: "0.1em",
            }}
          >
            {analysis.tweets.length} TWEETS ANALYZED · PHOENIX WEIGHTED SCORER
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: "#5a6068",
            }}
          >
            xscore · github.com/apoorvdarshan/Xscore
          </span>
        </div>
      </div>

      {/* Action buttons below the card */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={downloadImage}
          disabled={downloading}
          className="px-5 py-2.5 rounded-lg text-xs transition-all hover:opacity-90"
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
          className="px-5 py-2.5 rounded-lg text-xs transition-all hover:opacity-80"
          style={{
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-dim)",
            color: "var(--text-secondary)",
          }}
        >
          Share on 𝕏
        </button>
      </div>
    </div>
  );
}
