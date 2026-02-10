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
}: ReservationsTableProps) {
  // Generate list of available months from bookings
  const availableMonths = Array.from(
    new Set(bookings.map((b) => b.startDate.substring(0, 7)))
  ).sort((a, b) => b.localeCompare(a)); // Descending order

  // Format month for display
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return "Tous les mois";
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

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
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les mois" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les mois</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {bookings.map((booking, index) => {
          const showDateSeparator = booking.startDate !== lastDate;
          lastDate = booking.startDate;

          return (
            <div key={booking._id}>
              {showDateSeparator && index > 0 && (
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 border-t border-border"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {new Date(booking.startDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex-1 border-t border-border"></div>
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
