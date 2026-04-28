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

/** Dark sections (dark bg) → use light button + light menu */
const DARK_SECTIONS: DashboardSection[] = ["home"];

function getTheme(onDark: boolean) {
  return {
    btnBg:          onDark ? "rgba(250,246,238,0.92)" : "rgba(26,26,26,0.90)",
    btnBorder:      onDark ? "rgba(0,0,0,0.2)"        : "rgba(250,246,238,0.25)",
    btnIcon:        onDark ? "var(--body)"             : "#fff",
    menuBg:         onDark ? "rgba(250,246,238,0.97)"  : "rgba(26,26,26,0.97)",
    menuBorder:     onDark ? "rgba(0,0,0,0.2)"         : "rgba(255,255,255,0.08)",
    menuShadow:     onDark
      ? "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)"
      : "0 8px 40px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.06)",
    itemColor:      onDark ? "var(--body)"             : "rgba(255,255,255,0.88)",
    itemIconColor:  onDark ? "var(--gry)"              : "rgba(255,255,255,0.55)",
    activeItemBg:   onDark ? "rgba(65,121,114,0.10)"   : "rgba(242,211,129,0.12)",
    activeItemColor:onDark ? "var(--main)"             : "var(--btn)",
    separatorColor: onDark ? "rgba(0,0,0,0.08)"        : "rgba(255,255,255,0.08)",
    userNameColor:  onDark ? "var(--body)"             : "#fff",
    userPlanColor:  onDark ? "var(--gry)"              : "rgba(255,255,255,0.4)",
    logoutIconColor:onDark ? "rgba(0,0,0,0.3)"         : "rgba(255,255,255,0.35)",
  };
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function UserFooter({ nameColor, planColor, logoutColor }: { nameColor: string; planColor: string; logoutColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px 14px" }}>
      <div className="font-serif" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", flexShrink: 0 }}>
        {getInitials(MOCK_USER.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: nameColor, fontFamily: "Inter, sans-serif" }}>{MOCK_USER.name}</div>
        <div style={{ fontSize: 11, color: planColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{MOCK_USER.plan}</div>
      </div>
      <button style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
        <Icon name="logout" size={16} stroke={logoutColor} />
      </button>
    </div>
  );
}

export function DashboardBrowserNav({
  section,
  onNavigate,
}: DashboardBrowserNavProps) {
  const [open, setOpen] = useState(false);
  const t = getTheme(DARK_SECTIONS.includes(section));

  function navigate(s: DashboardSection) {
    onNavigate(s);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        style={{
          position: "fixed",
          bottom: "env(safe-area-inset-bottom, 0px)",
          left: 34,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: t.btnBg,
          border: `2px solid ${t.btnBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 31,
        }}
      >
        <Icon name={open ? "x" : "menu"} size={20} stroke={t.btnIcon} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 29 }}
        />
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)",
            left: 24,
            width: 230,
            background: t.menuBg,
            borderRadius: 16,
            zIndex: 30,
            border: `1px solid ${t.menuBorder}`,
            overflow: "hidden",
            boxShadow: t.menuShadow,
          }}
        >
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
                    background: active ? t.activeItemBg : "transparent",
                    color: active ? t.activeItemColor : t.itemColor,
                    marginBottom: i < NAV_ITEMS.length - 1 ? 1 : 0,
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                    stroke={active ? t.activeItemColor : t.itemIconColor}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: t.separatorColor, margin: "6px 0" }} />
          <UserFooter nameColor={t.userNameColor} planColor={t.userPlanColor} logoutColor={t.logoutIconColor} />
        </div>
      )}
    </>
  );
}
