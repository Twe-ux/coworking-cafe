"use client";

/**
 * PWA entry point — start_url in manifest.ts
 *
 * This page is intentionally outside the middleware matcher so iOS never
 * receives a server-side 307 redirect (which breaks standalone mode).
 * Auth routing is done client-side: authenticated → dashboard, else → login.
 */

import { Icon } from "@/components/ui/Icon";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LaunchPage() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      window.location.replace("/dashboard");
    } else {
      window.location.replace("/login");
    }
  }, [status]);

  return (
    <div
      className="launch-page"
      style={{
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--body)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "var(--btn)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="building" size={28} stroke="var(--body)" sw={1.6} />
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: "center" }}>
        <div
          className="font-serif"
          style={{
            fontSize: 22,
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          CoworKing Café
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Espace membre
        </div>
      </div>

      {/* Loading dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--btn)",
          opacity: 0.6,
          marginTop: 8,
          animation: "pulse 1.2s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
