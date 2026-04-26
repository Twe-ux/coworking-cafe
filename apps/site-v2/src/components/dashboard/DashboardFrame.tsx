"use client"
import { TabBar } from "./TabBar"
import { Sidebar } from "./Sidebar"
import { MOCK_USER } from "@/types/dashboard"
import type { DashboardSection } from "@/types/dashboard"

interface DashboardFrameProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
  children: React.ReactNode
}

const DARK_SCREENS: DashboardSection[] = ["home"]

export function DashboardFrame({ section, onNavigate, children }: DashboardFrameProps) {
  const isDark = DARK_SCREENS.includes(section)

  return (
    <>
      {/* Mobile PWA */}
      <div
        className="md:hidden"
        style={{
          height: "100svh",
          position: "relative",
          overflow: "hidden",
          background: isDark ? "var(--body)" : "var(--cream)",
        }}
      >
        {/* Scrollable content — padding bottom clears the floating pill */}
        <div className="h-full overflow-y-auto" style={{ paddingBottom: 102 }}>
          {children}
        </div>
        <TabBar section={section} onNavigate={onNavigate} />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <Sidebar
          section={section}
          onNavigate={onNavigate}
          userName={MOCK_USER.name}
          userMemberSince={MOCK_USER.memberSince}
          userPlan={MOCK_USER.plan}
        />
        <main className="flex-1 overflow-y-auto" style={{ background: "var(--cream)" }}>
          {children}
        </main>
      </div>
    </>
  )
}
