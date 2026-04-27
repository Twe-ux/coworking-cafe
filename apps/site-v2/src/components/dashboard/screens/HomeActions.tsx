"use client";
import type { DashboardSection, DashboardStats } from "@/types/dashboard";
import { LoyaltyCard } from "./LoyaltyCard";
import { PromoCarousel } from "./PromoCarousel";
import { QuickActions } from "./QuickActions";
import { StatsGrid } from "./StatsGrid";

interface HomeActionsProps {
  stats: DashboardStats;
  onNavigate: (section: DashboardSection) => void;
}

export function HomeActions({ stats, onNavigate }: HomeActionsProps) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <QuickActions
        active={stats.active}
        hoursBooked={stats.hoursBooked}
        onNavigate={onNavigate}
      />
      <LoyaltyCard
        memberPoints={stats.memberPoints}
        nextReward={stats.nextReward}
      />
      <StatsGrid
        active={stats.active}
        hoursBooked={stats.hoursBooked}
        savings={stats.savings}
      />
      <PromoCarousel />
    </div>
  );
}
