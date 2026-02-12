import { useQuery } from "@tanstack/react-query";
import type { CashRegisterEntry, EmployeeInfo } from "@/types/cashRegister";

interface AdminUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CashRegisterData {
  lastEntry: CashRegisterEntry | null;
  clockedEmployees: EmployeeInfo[];
  adminUsers: AdminUser[];
}

async function fetchCashRegisterData(): Promise<CashRegisterData> {
  const [lastEntryRes, employeesRes, adminsRes] = await Promise.all([
    fetch("/api/cash-register/list?limit=1"),
    fetch("/api/hr/employees/clocked"),
    fetch("/api/admins"),
  ]);

  const [lastEntryData, employeesData, adminsData] = await Promise.all([
    lastEntryRes.json(),
    employeesRes.json(),
    adminsRes.json(),
  ]);

  return {
    lastEntry:
      lastEntryData.success && lastEntryData.data.entries.length > 0
        ? lastEntryData.data.entries[0]
        : null,
    clockedEmployees: employeesData.success ? employeesData.data || [] : [],
    adminUsers: adminsData.success ? adminsData.data || [] : [],
  };
}

/**
 * Hook React Query for cash register data
 * - Silent refetch every 30s (no flash)
 * - Refetch on window focus
 * - No background refetch
 */
export function useCashRegister() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["cashRegister", "latest"],
    queryFn: fetchCashRegisterData,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  return {
    lastEntry: data?.lastEntry ?? null,
    clockedEmployees: data?.clockedEmployees ?? [],
    adminUsers: data?.adminUsers ?? [],
    isLoading,
    isFetching,
    error: error ? String(error) : null,
    refetch,
  };
}

export type { AdminUser };
