"use client"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import type { DashboardSection } from "@/types/dashboard"

interface TabBarProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
}

type RegularTab = { kind: "regular"; key: DashboardSection; label: string; icon: string }
type TabConfig  = RegularTab | { kind: "center" }

const TABS: TabConfig[] = [
  { kind: "regular", key: "home",         label: "Accueil", icon: "home"     },
  { kind: "regular", key: "reservations", label: "Résas",   icon: "calendar" },
  { kind: "center" },
  { kind: "regular", key: "profile",      label: "Profil",  icon: "user"     },
  { kind: "regular", key: "events",       label: "Plus",    icon: "menu"     },
]

const PILL_STYLE: React.CSSProperties = {
  position: "absolute", left: 14, right: 14, bottom: 16,
  height: 70, borderRadius: 32,
  background: "rgba(20,34,32,0.94)", backdropFilter: "blur(20px)",
  display: "flex", alignItems: "center", paddingInline: 8,
  boxShadow: "0 8px 32px rgba(0,0,0,0.28)", zIndex: 40,
}

export function TabBar({ section, onNavigate }: TabBarProps) {
  return (
    <div style={PILL_STYLE}>
      {TABS.map((tab, i) => {
        if (tab.kind === "center") {
          return (
            <div key="center" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Link
                href="/booking"
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--btn)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name="plus" size={20} stroke="var(--body)" sw={2} />
              </Link>
            </div>
          )
        }

        const isActive = section === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            style={{ flex: 1, display: "flex", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div
              style={{
                width: 64, height: 52, borderRadius: 18,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                background: isActive ? "rgba(242,211,129,0.15)" : "transparent",
                margin: "auto",
              }}
            >
              <Icon
                name={tab.icon} size={18}
                stroke={isActive ? "var(--btn)" : "rgba(255,255,255,0.55)"}
                sw={isActive ? 2 : 1.6}
              />
              <span
                className="font-mono"
                style={{
                  fontSize: 9, textTransform: "uppercase", letterSpacing: "0.04em",
                  color: isActive ? "var(--btn)" : "rgba(255,255,255,0.5)",
                }}
              >
                {tab.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
