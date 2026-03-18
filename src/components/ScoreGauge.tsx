"use client";

import { useEffect, useState } from "react";

export function ScoreGauge({
  score,
  label,
  size = "lg",
}: {
  score: number;
  label: string;
  size?: "sm" | "lg";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLarge = size === "lg";
  const dim = isLarge ? 220 : 120;
  const strokeWidth = isLarge ? 6 : 4;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = mounted ? (score / 100) * circumference : 0;
  const offset = circumference - progress;

  const color =
    score >= 70
      ? "var(--positive)"
      : score >= 40
        ? "var(--accent-amber)"
        : "var(--negative)";

  const glowColor =
    score >= 70
      ? "rgba(0,230,118,0.3)"
      : score >= 40
        ? "rgba(255,179,0,0.3)"
        : "rgba(255,61,87,0.3)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Glow backdrop */}
        {isLarge && (
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-opacity duration-1000"
            style={{ background: glowColor }}
          />
        )}

        <svg
          width={dim}
          height={dim}
          className="-rotate-90"
          style={{ filter: isLarge ? `drop-shadow(0 0 12px ${glowColor})` : undefined }}
        >
          {/* Track marks */}
          {isLarge &&
            Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 360;
              const rad = (angle * Math.PI) / 180;
              const inner = radius - 12;
              const outer = radius - (i % 5 === 0 ? 6 : 9);
              return (
                <line
                  key={i}
                  x1={dim / 2 + Math.cos(rad) * inner}
                  y1={dim / 2 + Math.sin(rad) * inner}
                  x2={dim / 2 + Math.cos(rad) * outer}
                  y2={dim / 2 + Math.sin(rad) * outer}
                  stroke={
                    i / 60 <= score / 100
                      ? color
                      : "var(--border-dim)"
                  }
                  strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
                  opacity={i / 60 <= score / 100 ? 0.6 : 0.3}
                />
              );
            })}

          {/* Background ring */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="var(--border-dim)"
            strokeWidth={strokeWidth}
          />

          {/* Progress ring */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span
            className="transition-all duration-700"
            style={{
              color,
              fontFamily: "var(--font-mono)",
              fontSize: isLarge ? "3.5rem" : "1.75rem",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          {isLarge && (
            <span
              className="mt-1 uppercase tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "var(--text-tertiary)",
              }}
            >
              / 100
            </span>
          )}
        </div>
      </div>

      <span
        className="uppercase tracking-[0.15em]"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: isLarge ? "0.7rem" : "0.6rem",
          color: "var(--text-tertiary)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
