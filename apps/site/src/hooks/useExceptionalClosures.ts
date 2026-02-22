"use client";

import { useEffect, useState } from "react";

interface ExceptionalClosure {
  date: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
  isFullDay?: boolean;
}

export function useExceptionalClosures() {
  const [upcomingClosures, setUpcomingClosures] = useState<ExceptionalClosure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosures = async () => {
      try {
        const response = await fetch("/api/global-hours");
        const data = await response.json();

        if (data.success && data.data?.exceptionalClosures) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          // Calculate date 30 days from now
          const oneMonthFromNow = new Date(now);
          oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

          // Filter upcoming closures (today and within next 30 days)
          const upcoming = data.data.exceptionalClosures
            .filter((closure: ExceptionalClosure) => {
              const closureDate = new Date(closure.date);
              closureDate.setHours(0, 0, 0, 0);
              // Show only if closure is today or in the future AND within next 30 days
              return closureDate >= now && closureDate <= oneMonthFromNow;
            })
            .sort(
              (a: ExceptionalClosure, b: ExceptionalClosure) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .slice(0, 3); // Show max 3 upcoming closures

          setUpcomingClosures(upcoming);
        }
      } catch (error) {
        console.error("[useExceptionalClosures] Error fetching closures:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClosures();
  }, []);

  return { upcomingClosures, loading };
}
