import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(145deg, #0a0b0d 0%, #030304 50%, #0a0b0d 100%)",
          position: "relative",
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(#2e3338 1px, transparent 1px), linear-gradient(90deg, #2e3338 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,255,0.08), transparent 70%)",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontFamily: "Georgia, serif",
              color: "#e8eaed",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            xscore
          </div>

          <div
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              color: "#5a6068",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            X Algorithm Analyzer
          </div>

          {/* Divider */}
          <div
            style={{
              width: 200,
              height: 1,
              background: "linear-gradient(90deg, transparent, #00e5ff, transparent)",
              marginTop: 8,
              marginBottom: 8,
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: 20,
              fontFamily: "Georgia, serif",
              color: "#9aa0a8",
              maxWidth: 500,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Score any X account against the open-source recommendation algorithm
          </div>

          {/* Signals pill */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 16,
              fontSize: 11,
              fontFamily: "monospace",
              color: "#2e3338",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span>19 signals</span>
            <span style={{ color: "#1a1d21" }}>·</span>
            <span>phoenix scorer</span>
            <span style={{ color: "#1a1d21" }}>·</span>
            <span>grok transformer</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
