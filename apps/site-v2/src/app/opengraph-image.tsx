import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CoworKing Cafe Strasbourg";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background:
            "linear-gradient(160deg, #1A1A1A 0%, #2F5955 60%, #417972 110%)",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            color: "#F2D381",
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: "monospace",
          }}
        >
          COWORKING - CAFE - STRASBOURG
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 68,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            fontWeight: 400,
            marginBottom: 28,
            fontFamily: "serif",
          }}
        >
          Travailler mieux,
          <br />
          un cafe a la fois.
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.68)",
            fontSize: 18,
            fontFamily: "sans-serif",
          }}
        >
          Ouvert 7j/7 - 9h-20h - Strasbourg Centre
        </div>
      </div>
    ),
    { ...size }
  );
}
