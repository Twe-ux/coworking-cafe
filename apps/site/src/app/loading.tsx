"use client";

import { LoadingLogo } from "@/components/layout/LoadingLogo";
import { useEffect, useState } from "react";

/**
 * Global loading UI shown during app-level transitions
 * Uses the same design as PWA loading screen for consistency
 * Background and logo adapt to light/dark theme automatically
 */
export default function RootLoading() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect system theme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulseAnimation {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95);
          }
        }
        .loading-logo {
          animation: pulseAnimation 1.5s ease-in-out infinite;
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#142220",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: "background-color 0.3s ease",
        }}
      >
        <LoadingLogo />
      </div>
    </>
  );
}
