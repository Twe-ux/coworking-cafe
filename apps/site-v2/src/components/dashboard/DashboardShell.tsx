"use client";
import { useState } from "react";
import { DashboardFrame } from "./DashboardFrame";
import { HomeScreen } from "./screens/HomeScreen";
import { BookingsScreen } from "./screens/BookingsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { LoyaltyScreen } from "./screens/LoyaltyScreen";
import { EventsScreen } from "./screens/EventsScreen";
import { DirectoryScreen } from "./screens/DirectoryScreen";
import type { DashboardSection } from "@/types/dashboard";

interface DashboardShellProps {
  initialSection?: DashboardSection;
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
        return <HistoryScreen />;
      case "wallet":
        return <WalletScreen />;
      case "loyalty":
        return <LoyaltyScreen />;
      case "events":
        return <EventsScreen />;
      case "directory":
        return <DirectoryScreen />;
    }
  }

  return (
    <DashboardFrame section={section} onNavigate={setSection}>
      {renderScreen()}
    </DashboardFrame>
  );
}
