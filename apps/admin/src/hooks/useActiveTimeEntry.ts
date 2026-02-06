import type { TimeEntry } from "@/types/timeEntry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getTodayStr(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface FetchActiveEntryParams {
  employeeId: string;
}

/**
 * Fetch active time entry for an employee
 */
async function fetchActiveEntry({
  employeeId,
}: FetchActiveEntryParams): Promise<TimeEntry | null> {
  const today = getTodayStr();
  const timestamp = Date.now();
  const activeUrl = `/api/time-entries?employeeId=${employeeId}&status=active&limit=1&_t=${timestamp}`;

  const response = await fetch(activeUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (response.status === 401 || !response.ok) {
    return null;
  }

  const data = await response.json();
  const todayActiveEntry = (data.data || []).find(
    (entry: TimeEntry) => entry.date === today,
  );

  return todayActiveEntry || null;
}

/**
 * Clock-in mutation
 */
interface ClockInParams {
  employeeId: string;
  pin?: string;
  justificationNote?: string;
}

async function clockIn(params: ClockInParams): Promise<TimeEntry> {
  const response = await fetch("/api/time-entries/clock-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Erreur lors du pointage");
  }

  return result.data;
}

/**
 * Clock-out mutation
 */
interface ClockOutParams {
  employeeId: string;
  pin?: string;
  justificationNote?: string;
}

async function clockOut(params: ClockOutParams): Promise<TimeEntry> {
  const response = await fetch("/api/time-entries/clock-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Erreur lors de l'arrêt du pointage");
  }

  return result.data;
}

/**
 * Hook for active time entry with React Query
 *
 * Features:
 * - Shared cache across all components
 * - Automatic invalidation after clock-in/out
 * - Optimistic updates
 * - Automatic refetch on window focus
 * - Intelligent polling (only when page is visible)
 * - 10s timeout on all requests
 *
 * Cache behavior:
 * - First access: Fetch fresh data
 * - Subsequent accesses: Use cached data (30s stale time)
 * - After clock-in/out: Automatic refetch
 * - Polling: Every 10s when page is visible, paused when inactive
 *
 * Performance:
 * - With 1-2 active employees: ~2-4 req/min when page visible
 * - If page inactive 50% of time: ~1-2 req/min total
 * - MongoDB impact: ~0.02-0.03 req/sec (negligible)
 */
export function useActiveTimeEntry(employeeId: string) {
  const queryClient = useQueryClient();
  const today = getTodayStr();

  // Query for active entry
  const {
    data: activeEntry,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["activeEntry", employeeId, today],
    queryFn: () => fetchActiveEntry({ employeeId }),
    staleTime: 30000, // 30s
    refetchOnWindowFocus: true,
    retry: 2,
    // 🔄 Polling intelligent : uniquement si la page est visible (active)
    // Économise ~50% des requêtes si l'écran est souvent inactif
    refetchInterval: (query) => {
      // Si la page n'est pas visible, ne pas poll
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        return false;
      }
      // Si visible, poll toutes les 10 secondes
      return 10000;
    },
  });

  // Clock-in mutation
  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onMutate: async (variables) => {
      // Optimistic update: set activeEntry immediately
      await queryClient.cancelQueries({
        queryKey: ["activeEntry", variables.employeeId, today],
      });

      const previousEntry = queryClient.getQueryData<TimeEntry | null>([
        "activeEntry",
        variables.employeeId,
        today,
      ]);

      // Optimistically set a temporary entry
      queryClient.setQueryData<TimeEntry | null>(
        ["activeEntry", variables.employeeId, today],
        {
          id: "temp-" + Date.now(),
          employeeId: variables.employeeId,
          date: today,
          clockIn: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          status: "active",
          shiftNumber: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as TimeEntry,
      );

      return { previousEntry };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEntry !== undefined) {
        queryClient.setQueryData(
          ["activeEntry", variables.employeeId, today],
          context.previousEntry,
        );
      }
      toast.error(error.message);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch after 100ms
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["activeEntry", variables.employeeId, today],
        });
        // Also invalidate home page data to refresh employee list
        queryClient.invalidateQueries({ queryKey: ["homePage"] });
      }, 100);

      toast.success("Pointage démarré avec succès");
    },
  });

  // Clock-out mutation
  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onMutate: async (variables) => {
      // Optimistic update: remove activeEntry immediately
      await queryClient.cancelQueries({
        queryKey: ["activeEntry", variables.employeeId, today],
      });

      const previousEntry = queryClient.getQueryData<TimeEntry | null>([
        "activeEntry",
        variables.employeeId,
        today,
      ]);

      // Optimistically set to null (no active entry)
      queryClient.setQueryData<TimeEntry | null>(
        ["activeEntry", variables.employeeId, today],
        null,
      );

      return { previousEntry };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousEntry !== undefined) {
        queryClient.setQueryData(
          ["activeEntry", variables.employeeId, today],
          context.previousEntry,
        );
      }
      toast.error(error.message);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch after 100ms
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["activeEntry", variables.employeeId, today],
        });
        // Also invalidate home page data to refresh employee list
        queryClient.invalidateQueries({ queryKey: ["homePage"] });
      }, 100);

      toast.success("Pointage arrêté avec succès");
    },
  });

  return {
    activeEntry: activeEntry || null,
    isLoading,
    error: error ? String(error) : null,
    refetch,
    clockIn: clockInMutation.mutateAsync,
    clockOut: clockOutMutation.mutateAsync,
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
  };
}
