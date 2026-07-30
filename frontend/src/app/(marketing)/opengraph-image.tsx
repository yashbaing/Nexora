import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TICKERS = ["xAAPL", "xNVDA", "xTSLA", "xMSFT", "xGOOGL", "xAMZN"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#06060a",
          padding: "72px",
          position: "relative",
        }}
      >
        {/* Accent wash */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: -160,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(52,229,160,0.30) 0%, rgba(6,6,10,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -300,
            right: -180,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(122,107,255,0.26) 0%, rgba(6,6,10,0) 70%)",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 32 32">
              <path
                d="M5 27V5l22 22V5"
                fill="none"
                stroke="#34e5a0"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#f6f6f4", letterSpacing: -1 }}>
            {site.name}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              lineHeight: 1.02,
              color: "#f6f6f4",
              letterSpacing: -3.5,
              maxWidth: 940,
            }}
          >
            Own a slice of Apple in about ten seconds.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: "#9d9dab",
              maxWidth: 900,
            }}
          >
            Fractional tokenized equities, settled in USDC on Avalanche. Non-custodial.
          </div>
        </div>

        {/* Ticker row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {TICKERS.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#9d9dab",
                fontSize: 24,
              }}
            >
              {t}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              padding: "12px 26px",
              borderRadius: 9999,
              background: "#34e5a0",
              color: "#04120c",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Join the waitlist
          </div>
        </div>
      </div>
    ),
    size,
  );
}
