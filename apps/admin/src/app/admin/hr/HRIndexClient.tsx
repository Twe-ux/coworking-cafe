"use client";

import { useEmployees } from "@/hooks/useEmployees";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import type { TimeEntry } from "@/types/timeEntry";
import { useEffect, useState } from "react";
import { MainSections } from "./components/MainSections";
import { QuickActions } from "./components/QuickActions";
import { QuickStats } from "./components/QuickStats";

interface TimeEntriesStats {
  totalEntries: number;
  totalHours: number;
  activeShifts: number;
}

export function HRIndexClient() {
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const { counts } = useSidebarCounts();
  const [timeStats, setTimeStats] = useState<TimeEntriesStats>({
    totalEntries: 0,
    totalHours: 0,
    activeShifts: 0,
  });
  const [loadingTimeStats, setLoadingTimeStats] = useState(true);

  useEffect(() => {
    const fetchTimeStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const response = await fetch(
          `/api/time-entries?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          const entries = result.data as TimeEntry[];
          const totalHours = entries.reduce(
            (sum: number, entry: TimeEntry) => sum + (entry.totalHours || 0),
            0,
          );
          const activeShifts = entries.filter(
            (entry: TimeEntry) => entry.status === "active",
          ).length;

          setTimeStats({
            totalEntries: entries.length,
            totalHours: Math.round(totalHours * 10) / 10,
            activeShifts,
          });
        }
      } catch (error) {
        console.error("Error fetching time stats:", error);
      } finally {
        setLoadingTimeStats(false);
      }
    };

    fetchTimeStats();
  }, []);

  const activeEmployees = employees.filter((e) => e.isActive).length;
  const draftEmployees = employees.filter((e) => e.status === "draft").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion RH</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la gestion des ressources humaines
        </p>
      </div>

      <QuickStats
        loadingEmployees={loadingEmployees}
        activeEmployees={activeEmployees}
        draftEmployees={draftEmployees}
        totalEmployees={employees.length}
        loadingTimeStats={loadingTimeStats}
        timeStats={timeStats}
      />

      <MainSections pendingJustifications={counts.pendingJustifications} />

      <QuickActions />
    </div>
  );
}
