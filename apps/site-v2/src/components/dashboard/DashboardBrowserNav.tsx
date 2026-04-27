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
      {/* Top bar — respects safe-area-inset-top for notched phones */}
      <div
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          background: isDark ? "var(--body)" : "var(--cream)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "var(--line)"}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 20,
          }}
        >
          <span
            className="font-serif"
            style={{
              fontSize: 17,
              letterSpacing: "-0.01em",
              color: isDark ? "var(--white)" : "var(--body)",
            }}
          >
            CoworKing Café
          </span>
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Icon
              name="menu"
              size={22}
              stroke={isDark ? "var(--white)" : "var(--body)"}
            />
          </button>
        </div>
      </div>

      {/* Drawer */}
      <NavDrawer
        open={open}
        section={section}
        onClose={() => setOpen(false)}
        onNavigate={navigate}
      />
    </>
  );
}
