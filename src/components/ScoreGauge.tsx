"use client";

import { useEffect, useState } from "react";

export function ScoreGauge({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setAnimated(true)); }, []);

  const large = size === "lg";
  const dim = large ? 200 : 100;
  const sw = large ? 5 : 3;
  const r = (dim - sw * 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = animated ? circ - (score / 100) * circ : circ;

  const color = score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const glow = score >= 70 ? "rgba(52,211,153,0.25)" : score >= 40 ? "rgba(255,192,64,0.25)" : "rgba(251,79,94,0.25)";
  const grade = score >= 85 ? "S" : score >= 70 ? "A" : score >= 55 ? "B" : score >= 40 ? "C" : score >= 25 ? "D" : "F";

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {large && (
        <div
          className="absolute rounded-full blur-[60px] transition-opacity duration-[2s]"
          style={{ width: dim * 0.8, height: dim * 0.8, background: glow, opacity: animated ? 0.4 : 0 }}
        />
      )}
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          {/* Outer tick ring */}
          {large && Array.from({ length: 100 }).map((_, i) => {
            const a = (i / 100) * 360 * (Math.PI / 180);
            const active = i <= score;
            const isMajor = i % 10 === 0;
            const len = isMajor ? 8 : 4;
            const o = r + sw * 2;
            return (
              <line
                key={i}
                x1={dim / 2 + Math.cos(a) * (o - len)}
                y1={dim / 2 + Math.sin(a) * (o - len)}
                x2={dim / 2 + Math.cos(a) * o}
                y2={dim / 2 + Math.sin(a) * o}
                stroke={active ? color : "var(--border-dim)"}
                strokeWidth={isMajor ? 1.5 : 0.5}
                opacity={active ? 0.7 : 0.2}
                style={{ transition: `opacity 0.8s ${i * 8}ms, stroke 0.8s ${i * 8}ms` }}
              />
            );
          })}
          {/* Track */}
          <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="var(--border-dim)" strokeWidth={sw} opacity={0.3} />
          {/* Progress */}
          <circle
            cx={dim/2} cy={dim/2} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s",
              filter: large ? `drop-shadow(0 0 8px ${glow})` : undefined,
            }}
          />
        </svg>
        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="mono"
            style={{
              fontSize: large ? "2.8rem" : "1.5rem",
              fontWeight: 600,
              color,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              transition: "color 0.5s",
            }}
          >
            {score}
          </span>
          {large && (
            <>
              <span className="mono mt-0.5" style={{ fontSize: "0.55rem", color: "var(--text-ghost)", letterSpacing: "0.2em" }}>
                / 100
              </span>
              <span
                className="mono mt-2 px-2 py-0.5 rounded"
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  color,
                  background: `${color}12`,
                  border: `1px solid ${color}22`,
                }}
              >
                GRADE {grade}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
