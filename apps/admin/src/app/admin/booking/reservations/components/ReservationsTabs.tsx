"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClockIcon, CheckCircle, XCircle, Search, Calendar as CalendarIcon, CheckCircle2, UserX } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/booking";
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

  // Status filter per tab
  const [upcomingStatusFilter, setUpcomingStatusFilter] = useState<BookingStatus | "all">("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<BookingStatus | "all">("all");

  const today = new Date().toISOString().split("T")[0];

  // Calculate stats for each tab
  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "pending" && b.startDate >= today).length;
    const confirmed = bookings.filter((b) => b.status === "confirmed" && b.startDate >= today).length;
    const completed = bookings.filter((b) => b.status === "completed" && b.startDate < today).length;
    const noShow = bookings.filter((b) => b.status === "no-show" && b.startDate < today).length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    return { pending, confirmed, completed, noShow, cancelled };
  }, [bookings, today]);

  // Sort by time within same date
  const sortByTime = (a: Booking, b: Booking, ascending = true) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;

    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    const minutesA = timeA[0] * 60 + (timeA[1] || 0);
    const minutesB = timeB[0] * 60 + (timeB[1] || 0);

    return ascending ? minutesA - minutesB : minutesB - minutesA;
  };

  // Filter bookings by tab and status
  const getFilteredBookings = () => {
    let filtered = bookings;

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (b) => (b.status === "pending" || b.status === "confirmed") && b.startDate >= today
      );
      // Filter by status within tab
      if (upcomingStatusFilter !== "all") {
        filtered = filtered.filter((b) => b.status === upcomingStatusFilter);
      }
    } else if (activeTab === "history") {
      filtered = filtered.filter(
        (b) => (b.status === "completed" || b.status === "no-show") && b.startDate < today
      );
      // Filter by status within tab
      if (historyStatusFilter !== "all") {
        filtered = filtered.filter((b) => b.status === historyStatusFilter);
      }
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((b) => b.status === "cancelled");
    }

    // Apply search filters
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

    // Smart sorting: today first, then future, then past
    const todayBookings = filtered.filter(b => b.startDate === today);
    const futureBookings = filtered.filter(b => b.startDate > today);
    const pastBookings = filtered.filter(b => b.startDate < today);

    // Sort each group
    todayBookings.sort((a, b) => sortByTime(a, b, true)); // Ascending time
    futureBookings.sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate); // Ascending date
      return sortByTime(a, b, true); // Ascending time
    });
    pastBookings.sort((a, b) => {
      if (a.startDate !== b.startDate) return b.startDate.localeCompare(a.startDate); // Descending date
      return sortByTime(a, b, false); // Descending time
    });

    return [...todayBookings, ...futureBookings, ...pastBookings];
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées</TabsTrigger>
        </TabsList>

        {/* Onglet À venir */}
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${upcomingStatusFilter === "pending" ? "ring-2 ring-orange-500" : ""}`}
              onClick={() => setUpcomingStatusFilter(upcomingStatusFilter === "pending" ? "all" : "pending")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <ClockIcon className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${upcomingStatusFilter === "confirmed" ? "ring-2 ring-green-500" : ""}`}
              onClick={() => setUpcomingStatusFilter(upcomingStatusFilter === "confirmed" ? "all" : "confirmed")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmed}</div>
              </CardContent>
            </Card>

            {/* Espace vide pour alignement */}
            <div className="hidden md:block"></div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filtres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nom/Entreprise"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                <div className="relative">
                  <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                {(nameFilter || dateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameFilter("");
                      setDateFilter("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center pt-1"
                  >
                    Effacer
                  </button>
                )}
              </CardContent>
            </Card>
          </div>

          <ReservationsTable
            bookings={filteredBookings}
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

        {/* Onglet Historique */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${historyStatusFilter === "completed" ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setHistoryStatusFilter(historyStatusFilter === "completed" ? "all" : "completed")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terminées</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${historyStatusFilter === "no-show" ? "ring-2 ring-red-500" : ""}`}
              onClick={() => setHistoryStatusFilter(historyStatusFilter === "no-show" ? "all" : "no-show")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No-show</CardTitle>
                <UserX className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.noShow}</div>
              </CardContent>
            </Card>

            {/* Espace vide pour alignement */}
            <div className="hidden md:block"></div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filtres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nom/Entreprise"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                <div className="relative">
                  <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                {(nameFilter || dateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameFilter("");
                      setDateFilter("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center pt-1"
                  >
                    Effacer
                  </button>
                )}
              </CardContent>
            </Card>
          </div>

          <ReservationsTable
            bookings={filteredBookings}
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

        {/* Onglet Annulées */}
        <TabsContent value="cancelled" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annulées</CardTitle>
                <XCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cancelled}</div>
              </CardContent>
            </Card>

            {/* Espaces vides pour alignement */}
            <div className="hidden md:block"></div>
            <div className="hidden md:block"></div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filtres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nom/Entreprise"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                <div className="relative">
                  <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                {(nameFilter || dateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameFilter("");
                      setDateFilter("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center pt-1"
                  >
                    Effacer
                  </button>
                )}
              </CardContent>
            </Card>
          </div>

          <ReservationsTable
            bookings={filteredBookings}
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
