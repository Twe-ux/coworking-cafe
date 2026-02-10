import { useEffect, useRef } from "react";
import { CardContent } from "@/components/ui/card";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ReservationCard } from "./ReservationCard";
import type { Booking } from "@/types/booking";
import { MapPin } from "lucide-react";

interface ReservationsTableProps {
  bookings: Booking[];
  onRowClick: (booking: Booking) => void;
  onConfirm: (bookingId: string) => void;
  onEdit: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isConfirming: boolean;
  isCancelling: boolean;
  sortOrder: "smart" | "asc" | "desc";
}

export function ReservationsTable({
  bookings,
  onRowClick,
  onConfirm,
  onEdit,
  onCancel,
  isConfirming,
  isCancelling,
  sortOrder,
}: ReservationsTableProps) {

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
    <CardContent className="space-y-3 p-0">
        {bookings.map((booking, index) => {
          const showDateSeparator = booking.startDate !== lastDate;
          const isToday = booking.startDate === today;
          const isFirstToday = index === todayIndex;
          lastDate = booking.startDate;

          // Format date label
          const dateLabel = isToday
            ? null // Will use icon instead
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
              {showDateSeparator && (
                <div className={`flex items-center gap-4 ${index === 0 ? 'mb-4' : 'my-4'} ${isToday ? 'py-2' : ''}`}>
                  <div className={`flex-1 border-t ${isToday ? 'border-primary' : 'border-border'}`}></div>
                  {isToday ? (
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <MapPin className="h-4 w-4" />
                      <span>Aujourd'hui</span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {dateLabel}
                    </span>
                  )}
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
  );
}
