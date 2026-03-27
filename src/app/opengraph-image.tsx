import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Claude Code Builder — Visual Project Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 18,
            background: "#7C3AED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#7C3AED" />
            <path d="M8 10h6v6H8z" fill="#FDE68A" />
            <path d="M18 10h6v6h-6z" fill="#93C5FD" />
            <path d="M8 20h6v2H8z" fill="#6EE7B7" />
            <path d="M18 20h6v2h-6z" fill="#FCA5A5" />
            <path d="M11 16v4" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M21 16v4" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Claude Code Builder
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Visual drag &amp; drop builder for Claude Code project structures
        </div>

        {/* URL badge */}
        <div
          style={{
            marginTop: 48,
            padding: "10px 24px",
            borderRadius: 999,
            background: "#3f3f46",
            color: "#e4e4e7",
            fontSize: 18,
          }}
        >
          ccbuilder.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
