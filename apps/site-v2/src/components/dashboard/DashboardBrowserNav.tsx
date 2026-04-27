"use client";
import type { IconName } from "@/components/ui/Icon";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/types/dashboard";
import { MOCK_USER } from "@/types/dashboard";
import { useState } from "react";

interface DashboardBrowserNavProps {
  section: DashboardSection;
  onNavigate: (s: DashboardSection) => void;
}

const NAV_ITEMS: { key: DashboardSection; label: string; icon: IconName }[] = [
  { key: "home", label: "Accueil", icon: "home" },
  { key: "reservations", label: "Réservations", icon: "calendar" },
  { key: "history", label: "Historique", icon: "clock" },
  { key: "profile", label: "Profil", icon: "user" },
];

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function DashboardBrowserNav({
  section,
  onNavigate,
}: DashboardBrowserNavProps) {
  const [open, setOpen] = useState(false);

  function navigate(s: DashboardSection) {
    onNavigate(s);
    setOpen(false);
  }

  return (
    <>
      {/* Floating hamburger — bottom-left, auto-inverts via mix-blend-mode */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
          left: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          /* white circle — mix-blend-mode:difference inverts it automatically:
             over cream (#FAF6EE) → appears near-black
             over dark (#1A1A1A) → appears near-white   */
          background: "rgba(255,255,255,0.92)",
          mixBlendMode: "difference",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 31,
          border: "none",
        }}
      >
        {/* Icon always white — blends with the already-inverted button bg */}
        <Icon name={open ? "x" : "menu"} size={20} stroke="white" />
      </button>

      {/* Transparent scrim — closes popover on outside click */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 29 }}
        />
      )}

      {/* iOS-style popover menu — opens upward from bottom button */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 74px)",
            left: 12,
            width: 230,
            background: "rgba(28,28,30,0.96)",
            borderRadius: 16,
            zIndex: 30,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* Nav items */}
          <div style={{ padding: "6px 6px 0" }}>
            {NAV_ITEMS.map((item, i) => {
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    background: active ? "rgba(242,211,129,0.12)" : "transparent",
                    color: active ? "var(--btn)" : "rgba(255,255,255,0.88)",
                    marginBottom: i < NAV_ITEMS.length - 1 ? 1 : 0,
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    stroke={active ? "var(--btn)" : "rgba(255,255,255,0.6)"}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />

          {/* User row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px 14px",
            }}
          >
            <div
              className="font-serif"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "var(--white)",
                flexShrink: 0,
              }}
            >
              {getInitials(MOCK_USER.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--white)", fontFamily: "Inter, sans-serif" }}>
                {MOCK_USER.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {MOCK_USER.plan}
              </div>
            </div>
            <button style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="logout" size={16} stroke="rgba(255,255,255,0.35)" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
