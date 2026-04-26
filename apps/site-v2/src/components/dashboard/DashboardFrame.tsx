"use client"
import { TabBar } from "./TabBar"
import { Sidebar } from "./Sidebar"
import type { DashboardSection } from "@/types/dashboard"

interface DashboardFrameProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
  children: React.ReactNode
}

const DARK_SCREENS: DashboardSection[] = ['home']

export function DashboardFrame({ section, onNavigate, children }: DashboardFrameProps) {
  const isDark = DARK_SCREENS.includes(section)

  return (
    <>
      {/* Mobile PWA */}
      <div
        className="md:hidden flex flex-col"
        style={{ height: '100svh', overflow: 'hidden', background: isDark ? 'var(--body)' : 'var(--cream)' }}
      >
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <TabBar section={section} onNavigate={onNavigate} />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <Sidebar section={section} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--cream)' }}>
          {children}
        </main>
      </div>
    </>
  )
}
