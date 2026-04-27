"use client";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/types/dashboard";
import { useState } from "react";
import { NavDrawer } from "./NavDrawer";

interface DashboardBrowserNavProps {
  section: DashboardSection;
  onNavigate: (s: DashboardSection) => void;
}

export function DashboardBrowserNav({
  section,
  onNavigate,
}: DashboardBrowserNavProps) {
  const [open, setOpen] = useState(false);
  const isDark = section === "home";

  function navigate(s: DashboardSection) {
    onNavigate(s);
    setOpen(false);
  }

  return (
    <>
      {/* Floating hamburger button — top-right, below status bar */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isDark
            ? "rgba(255,255,255,0.12)"
            : "rgba(26,26,26,0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(26,26,26,0.08)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 30,
        }}
      >
        <Icon
          name="menu"
          size={20}
          stroke={isDark ? "rgba(255,255,255,0.9)" : "var(--body)"}
        />
      </button>

      <NavDrawer
        open={open}
        section={section}
        onClose={() => setOpen(false)}
        onNavigate={navigate}
      />
    </>
  );
}
