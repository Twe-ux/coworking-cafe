import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ReservationCard } from "./ReservationCard";
import type { Booking } from "@/types/booking";

interface ReservationsTableProps {
  bookings: Booking[];
  onRowClick: (booking: Booking) => void;
  onConfirm: (bookingId: string) => void;
  onEdit: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isConfirming: boolean;
  isCancelling: boolean;
}

export function ReservationsTable({
  bookings,
  onRowClick,
  onConfirm,
  onEdit,
  onCancel,
  isConfirming,
  isCancelling,
}: ReservationsTableProps) {
  if (bookings.length === 0) {
    return (
      <StyledAlert variant="info">Aucune réservation trouvée.</StyledAlert>
    );
  }

  return (
    <>
      <CardHeader className="px-0">
        <CardTitle>Liste des réservations ({bookings.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {bookings.map((booking) => (
          <ReservationCard
            key={booking._id}
            booking={booking}
            onRowClick={onRowClick}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onCancel={onCancel}
            isConfirming={isConfirming}
            isCancelling={isCancelling}
          />
        ))}
      </CardContent>
    </>
  );
}
