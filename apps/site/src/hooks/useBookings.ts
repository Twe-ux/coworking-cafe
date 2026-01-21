/**
 * useBookings Hook
 * Hook pour gérer les réservations utilisateur avec filtres et pagination
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReservationDetails, ApiResponse, PaginatedResult, BookingStatus } from '@/types';

interface UseBookingsParams {
  status?: 'upcoming' | 'past' | 'cancelled';
  pageSize?: number;
}

interface UseBookingsReturn {
  bookings: ReservationDetails[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  refresh: () => Promise<void>;
  setStatusFilter: (status: 'upcoming' | 'past' | 'cancelled' | undefined) => void;
}

export function useBookings(params: UseBookingsParams = {}): UseBookingsReturn {
  const { status: initialStatus, pageSize = 10 } = params;

  const [bookings, setBookings] = useState<ReservationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'cancelled' | undefined>(
    initialStatus
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/user/bookings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result: ApiResponse<PaginatedResult<ReservationDetails>> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load bookings');
      }

      setBookings(result.data.items);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
      setHasNext(result.data.hasNext);
      setHasPrevious(result.data.hasPrevious);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const refresh = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const handleSetStatusFilter = useCallback(
    (status: 'upcoming' | 'past' | 'cancelled' | undefined) => {
      setStatusFilter(status);
      setPage(1); // Reset to page 1 when filter changes
    },
    []
  );

  return {
    bookings,
    loading,
    error,
    total,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    goToPage,
    refresh,
    setStatusFilter: handleSetStatusFilter,
  };
}
