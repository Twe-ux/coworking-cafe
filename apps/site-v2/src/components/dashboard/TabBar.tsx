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

/** Dark sections (dark bg) → use light pill */
const DARK_SECTIONS: DashboardSection[] = ["home"];

export function TabBar({ section, onNavigate }: TabBarProps) {
  const onDark = DARK_SECTIONS.includes(section);

  // Pill
  const pillBg = onDark ? "rgba(250,246,238,0.95)" : "var(--body)";
  const pillShadow = onDark
    ? "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)"
    : "0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14)";

  // Active tab
  const activeTabBg = onDark ? "var(--main)" : "var(--btn)";
  const activeIconStroke = onDark ? "#fff" : "var(--body)";
  const activeLabelColor = onDark ? "var(--body)" : "#fff";

  // Inactive tab
  const inactiveIconStroke = onDark
    ? "rgba(26,26,26,0.4)"
    : "rgba(255,255,255,0.55)";
  const inactiveLabelColor = onDark
    ? "rgba(26,26,26,0.45)"
    : "rgba(255,255,255,0.5)";

  return (
    <div
      style={{
        position: "fixed",
        left: 14,
        right: 14,
        bottom: 20,
        height: 70,
        borderRadius: 32,
        background: pillBg,
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        paddingInline: 8,
        boxShadow: pillShadow,
        zIndex: 40,
      }}
    >
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
                background: isActive ? activeTabBg : "transparent",
              }}
            >
              <Icon
                name={tab.icon}
                size={18}
                stroke={isActive ? activeIconStroke : inactiveIconStroke}
                sw={isActive ? 2 : 1.6}
              />
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: isActive ? activeLabelColor : inactiveLabelColor,
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
