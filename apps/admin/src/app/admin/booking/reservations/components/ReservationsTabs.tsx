"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import type { Booking } from "@/types/booking";
import { ReservationsTable } from "./ReservationsTable";

interface ReservationsTabsProps {
  bookings: Booking[];
  onRowClick: (booking: Booking) => void;
  onConfirm: (bookingId: string) => Promise<void>;
  onEdit: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isConfirming: boolean;
  isCancelling: boolean;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  sortOrder: "smart" | "asc" | "desc";
  setSortOrder: (value: "smart" | "asc" | "desc") => void;
  availableMonths: string[];
}

export function ReservationsTabs({
  bookings,
  onRowClick,
  onConfirm,
  onEdit,
  onCancel,
  isConfirming,
  isCancelling,
  monthFilter,
  setMonthFilter,
  sortOrder,
  setSortOrder,
  availableMonths,
}: ReservationsTabsProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const today = new Date().toISOString().split("T")[0];

  // Filter bookings by tab
  const { upcomingBookings, historyBookings, cancelledBookings } = useMemo(() => {
    const upcoming = bookings.filter(
      (b) =>
        (b.status === "pending" || b.status === "confirmed") &&
        b.startDate >= today
    );
    const history = bookings.filter(
      (b) =>
        (b.status === "completed" || b.status === "no-show") &&
        b.startDate < today
    );
    const cancelled = bookings.filter((b) => b.status === "cancelled");

    return {
      upcomingBookings: upcoming,
      historyBookings: history,
      cancelledBookings: cancelled,
    };
  }, [bookings, today]);

  // Apply search filters
  const filterBookings = (list: Booking[]) => {
    let filtered = list;

    if (nameFilter.trim()) {
      const searchTerm = nameFilter.toLowerCase().trim();
      filtered = filtered.filter((b) => {
        const name = (b.clientName || "").toLowerCase();
        const company = (b.clientCompany || "").toLowerCase();
        return name.includes(searchTerm) || company.includes(searchTerm);
      });
    }

    if (dateFilter.trim()) {
      filtered = filtered.filter((b) => b.startDate === dateFilter);
    }

    return filtered;
  };

  const filteredUpcoming = filterBookings(upcomingBookings);
  const filteredHistory = filterBookings(historyBookings);
  const filteredCancelled = filterBookings(cancelledBookings);

  return (
    <div className="space-y-4">
      {/* Search Filters */}
      <Card className="p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou entreprise..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative w-48">
            <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          {(nameFilter || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setNameFilter("");
                setDateFilter("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3"
            >
              Effacer
            </button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="relative">
            À venir
            {filteredUpcoming.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
                {filteredUpcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="relative">
            Historique
            {filteredHistory.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
                {filteredHistory.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="relative">
            Annulées
            {filteredCancelled.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
                {filteredCancelled.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <ReservationsTable
            bookings={filteredUpcoming}
            onRowClick={onRowClick}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onCancel={onCancel}
            isConfirming={isConfirming}
            isCancelling={isCancelling}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            availableMonths={availableMonths}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ReservationsTable
            bookings={filteredHistory}
            onRowClick={onRowClick}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onCancel={onCancel}
            isConfirming={isConfirming}
            isCancelling={isCancelling}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            availableMonths={availableMonths}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          <ReservationsTable
            bookings={filteredCancelled}
            onRowClick={onRowClick}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onCancel={onCancel}
            isConfirming={isConfirming}
            isCancelling={isCancelling}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            availableMonths={availableMonths}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
