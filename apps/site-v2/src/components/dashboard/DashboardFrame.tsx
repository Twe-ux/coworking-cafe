"use client";
import { applySafeAreaColor } from "@/lib/safeArea";
import type { DashboardSection } from "@/types/dashboard";
import { MOCK_USER } from "@/types/dashboard";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";

interface DashboardFrameProps {
  section: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  children: React.ReactNode;
}

/** Background color per section — drives both safe-area bars */
const SECTION_BG: Record<DashboardSection, string> = {
  home: "#1A1A1A", // var(--body) — dark safe-area on home
  reservations: "#FAF6EE", // var(--cream)
  history: "#FAF6EE",
  wallet: "#FAF6EE",
  loyalty: "#FAF6EE",
  profile: "#FAF6EE",
  events: "#FAF6EE",
  directory: "#FAF6EE",
};

export function DashboardFrame({
  section,
  onNavigate,
  children,
}: DashboardFrameProps) {
  const bg = SECTION_BG[section];
  const isDark = section === "home";

  useEffect(() => {
    applySafeAreaColor(bg);
    return () => {
      // Restore auth-page color on unmount (signout → /login)
      applySafeAreaColor("#DDE6DE");
    };
  }, [bg]);

  return (
    <>
      {/* Mobile PWA */}
      <div
        className="md:hidden"
        style={{
          height: "100%",
          overflow: "hidden",
          background: isDark ? "var(--body)" : "var(--cream)",
        }}
      >
        {/* Scrollable content */}
        <div className="h-full overflow-y-auto" style={{ paddingBottom: 80 }}>
          {children}
        </div>

        {/* TabBar — fixed pill, immune to scroll and svh recalculation */}
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
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--cream)" }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
