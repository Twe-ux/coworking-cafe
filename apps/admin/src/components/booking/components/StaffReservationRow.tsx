import { Badge } from "@/components/ui/badge";
import type { Booking, BookingStatus } from "@/types/booking";
import { Clock, MapPin, Users } from "lucide-react";

interface StaffReservationRowProps {
  reservation: Booking;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const STATUS_COLORS: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "outline",
};

export function StaffReservationRow({
  reservation,
}: StaffReservationRowProps) {
  return (
    <div className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {reservation.clientName || "Client inconnu"}
          </p>
          {reservation.clientCompany && (
            <p className="text-sm text-muted-foreground truncate">
              {reservation.clientCompany}
            </p>
          )}
        </div>
        <Badge
          variant={STATUS_COLORS[reservation.status]}
          className="shrink-0 text-xs"
        >
          {STATUS_LABELS[reservation.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{reservation.spaceName || "Espace"}</span>
        </div>

        {reservation.startTime && reservation.endTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {reservation.startTime} - {reservation.endTime}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>{reservation.numberOfPeople} pers.</span>
        </div>

        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <span>{reservation.totalPrice}€</span>
        </div>
      </div>

      {reservation.notes && (
        <p className="text-xs text-muted-foreground italic border-t pt-2 truncate">
          {reservation.notes}
        </p>
      )}
    </div>
  );
}
