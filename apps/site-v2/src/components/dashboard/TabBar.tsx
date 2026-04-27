"use client";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/types/dashboard";

interface TabBarProps {
  section: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
}

const TABS: { key: DashboardSection; label: string; icon: string }[] = [
  { key: "home", label: "Accueil", icon: "home" },
  { key: "reservations", label: "Résas", icon: "calendar" },
  { key: "profile", label: "Profil", icon: "user" },
];

const PILL_STYLE: React.CSSProperties = {
  position: "fixed",
  left: 14,
  right: 14,
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
  height: 70,
  borderRadius: 32,
  background: "var(--body)",
  backdropFilter: "blur(20px)",
  display: "flex",
  alignItems: "center",
  paddingInline: 8,
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
  zIndex: 40,
};

export function TabBar({ section, onNavigate }: TabBarProps) {
  return (
    <div style={PILL_STYLE}>
      {TABS.map((tab) => {
        const isActive = section === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "10px 4px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 42,
                height: 28,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "var(--btn)" : "transparent",
              }}
            >
              <Icon
                name={tab.icon}
                size={18}
                stroke={isActive ? "var(--body)" : "rgba(255,255,255,0.55)"}
                sw={isActive ? 2 : 1.6}
              />
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
