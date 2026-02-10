import { useEffect, useRef } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ReservationCard } from "./ReservationCard";
import type { Booking } from "@/types/booking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReservationsTableProps {
  bookings: Booking[];
  onRowClick: (booking: Booking) => void;
  onConfirm: (bookingId: string) => void;
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

export function ReservationsTable({
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
}: ReservationsTableProps) {

  // Format month for display
  const formatMonth = (monthStr: string) => {
    if (!monthStr || monthStr === "all") return "Tous les mois";
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  // Auto-scroll to today's bookings when "smart" sort is selected
  const todayRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = bookings.findIndex(b => b.startDate === today);

  useEffect(() => {
    if (sortOrder === "smart" && todayIndex >= 0 && todayRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [sortOrder, todayIndex]);

  if (bookings.length === 0) {
    return (
      <StyledAlert variant="info">Aucune réservation trouvée.</StyledAlert>
    );
  }

  // Group bookings by date for visual separators
  let lastDate = "";

  return (
    <>
      <CardHeader className="px-0 flex flex-row items-center justify-between">
        <CardTitle>Liste des réservations ({bookings.length})</CardTitle>
        <div className="flex gap-2">
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "smart" | "asc" | "desc")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smart">📍 Aujourd'hui en premier</SelectItem>
              <SelectItem value="desc">⬇️ Plus récent en haut</SelectItem>
              <SelectItem value="asc">⬆️ Plus ancien en haut</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {bookings.map((booking, index) => {
          const showDateSeparator = booking.startDate !== lastDate;
          const isToday = booking.startDate === today;
          const isFirstToday = index === todayIndex;
          lastDate = booking.startDate;

          // Format date label
          const dateLabel = (isToday && sortOrder === "smart")
            ? "📍 Aujourd'hui"
            : new Date(booking.startDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

          return (
            <div
              key={booking._id}
              ref={isFirstToday ? todayRef : null}
            >
              {showDateSeparator && index > 0 && (
                <div className={`flex items-center gap-4 my-4 ${isToday ? 'py-2' : ''}`}>
                  <div className={`flex-1 border-t ${isToday ? 'border-primary' : 'border-border'}`}></div>
                  <span className={`text-sm font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {dateLabel}
                  </span>
                  <div className={`flex-1 border-t ${isToday ? 'border-primary' : 'border-border'}`}></div>
                </div>
              )}
              <ReservationCard
                booking={booking}
                onRowClick={onRowClick}
                onConfirm={onConfirm}
                onEdit={onEdit}
                onCancel={onCancel}
                isConfirming={isConfirming}
                isCancelling={isCancelling}
              />
            </div>
          );
        })}
      </CardContent>
    </>
  );
}
