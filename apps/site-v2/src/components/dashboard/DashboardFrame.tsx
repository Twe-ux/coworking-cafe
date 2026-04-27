"use client";
import { applySafeAreaColor } from "@/lib/safeArea";
import type { DashboardSection } from "@/types/dashboard";
import { MOCK_USER } from "@/types/dashboard";
import { useEffect } from "react";
import { DashboardBrowserNav } from "./DashboardBrowserNav";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";

interface DashboardFrameProps {
  section: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  children: React.ReactNode;
}

/** Background color per section — drives body/html bg (bottom safe-area / home indicator) */
const SECTION_BG: Record<DashboardSection, string> = {
  home: "#1A1A1A", // var(--body) — dark home indicator zone
  reservations: "#FAF6EE", // var(--cream)
  history: "#FAF6EE",
  wallet: "#FAF6EE",
  loyalty: "#FAF6EE",
  profile: "#FAF6EE",
  events: "#FAF6EE",
  directory: "#FAF6EE",
};

/**
 * theme-color override for meta[theme-color] only (status bar top in browser mode).
 * In PWA black-translucent the status bar is transparent so this has no visual effect.
 * For home: match the hero gradient start color so there's no dark/green step in browser.
 */
const SECTION_TOP_COLOR: Partial<Record<DashboardSection, string>> = {
  home: "#417972", // matches HomeHero gradient start (var(--main))
};

export function DashboardFrame({
  section,
  onNavigate,
  children,
}: DashboardFrameProps) {
  const bg = SECTION_BG[section];
  const isDark = section === "home";

  useEffect(() => {
    applySafeAreaColor(bg, SECTION_TOP_COLOR[section]);
    return () => {
      // Restore auth-page color on unmount (signout → /login)
      applySafeAreaColor("#DDE6DE");
    };
  }, [bg, section]);

  return (
    <>
      {/* Mobile
          browser:    h-dvh  → fills the dynamic viewport (100dvh adapts as address bar shows/hides)
          standalone: h-full → resolves via body 100svh set by iOS PWA shell              */}
      <div
        className="md:hidden h-full "
        style={{ background: isDark ? "var(--body)" : "var(--cream)" }}
      >
        {/* Scrollable content */}
        <div className="h-full overflow-y-auto" style={{ paddingBottom: 80 }}>
          {children}
        </div>

        {/* Floating hamburger — browser mode only (position: fixed) */}
        <div className="standalone:hidden">
          <DashboardBrowserNav section={section} onNavigate={onNavigate} />
        </div>

        {/* TabBar pill — PWA standalone only (position: fixed) */}
        <div className="hidden standalone:block">
          <TabBar section={section} onNavigate={onNavigate} />
        </div>
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
