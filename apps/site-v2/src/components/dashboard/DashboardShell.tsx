"use client";
import { useState } from "react";
import { DashboardFrame } from "./DashboardFrame";
import { HomeScreen } from "./screens/HomeScreen";
import { BookingsScreen } from "./screens/BookingsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import type { DashboardSection } from "@/types/dashboard";

interface DashboardShellProps {
  initialSection?: DashboardSection;
}

function Placeholder({ section }: { section: DashboardSection }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 className="font-serif">{section}</h1>
    </div>
  );
}

export function DashboardShell({
  initialSection = "home",
}: DashboardShellProps) {
  const [section, setSection] = useState<DashboardSection>(initialSection);

  function renderScreen() {
    switch (section) {
      case "home":
        return <HomeScreen onNavigate={setSection} />;
      case "reservations":
        return <BookingsScreen />;
      case "profile":
        return <ProfileScreen />;
      case "history":
        return <Placeholder section={section} />;
      case "wallet":
        return <Placeholder section={section} />;
      case "loyalty":
        return <Placeholder section={section} />;
      case "events":
        return <Placeholder section={section} />;
      case "directory":
        return <Placeholder section={section} />;
    }
  }

  return (
    <DashboardFrame section={section} onNavigate={setSection}>
      {renderScreen()}
    </DashboardFrame>
  );
}
