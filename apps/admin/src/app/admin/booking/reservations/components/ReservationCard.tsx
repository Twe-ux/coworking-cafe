import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Check,
  X,
  Pencil,
} from "lucide-react";
import type { Booking } from "@/types/booking";
import {
  getStatusLabel,
  getStatusBadgeClass,
  getReservationTypeLabel,
  getReservationTypeBadgeClass,
  formatDate,
  formatPrice,
  formatTimeDisplay,
  getCalculatedReservationType,
} from "../utils";
import {
  getBorderClassBySpace,
  capitalize,
} from "./reservationCardUtils";

interface ReservationCardProps {
  booking: Booking;
  onRowClick: (booking: Booking) => void;
  onConfirm: (bookingId: string) => void;
  onEdit: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isConfirming: boolean;
  isCancelling: boolean;
}

export function ReservationCard({
  booking,
  onRowClick,
  onConfirm,
  onEdit,
  onCancel,
  isConfirming,
  isCancelling,
}: ReservationCardProps) {
  const displayName = booking.clientCompany || booking.clientName;

  return (
    <Card
      className={`${getBorderClassBySpace(booking.spaceName)} cursor-pointer hover:bg-muted/50 transition-colors`}
      onClick={() => onRowClick(booking)}
    >
      <CardContent className="py-3 px-4 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {/* Espace */}
            <div className="w-[100px] truncate">
              <span className="font-bold">{capitalize(booking.spaceName)}</span>
            </div>

            {/* Statut */}
            <div className="w-[100px]">
              <Badge
                variant="outline"
                className={getStatusBadgeClass(booking.status)}
              >
                {getStatusLabel(booking.status)}
              </Badge>
            </div>

            {/* Client */}
            <div className="w-[175px] truncate">
              <span className="font-semibold text-blue-600">
                {displayName || "Client"}
              </span>
            </div>

            {/* Type */}
            <div className="w-[100px] ">
              <Badge
                variant="outline"
                className={getReservationTypeBadgeClass(
                  getCalculatedReservationType(
                    booking.startTime,
                    booking.endTime,
                    booking.reservationType,
                  ),
                )}
              >
                {getReservationTypeLabel(
                  getCalculatedReservationType(
                    booking.startTime,
                    booking.endTime,
                    booking.reservationType,
                  ),
                )}
              </Badge>
            </div>

            {/* Date */}
            <div className="w-[130px] flex items-center gap-1 font-medium text-foreground">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {formatDate(booking.startDate)}
            </div>

            {/* Heures */}
            <div className="w-[200px]">
              {booking.startTime && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {formatTimeDisplay(booking.startTime, booking.endTime)}
                </span>
              )}
            </div>

            {/* Personnes */}
            <div className="w-[70px] flex items-center gap-1 font-medium text-foreground">
              <Users className="w-4 h-4 text-muted-foreground" />
              {booking.numberOfPeople}
            </div>
          </div>

          {/* Prix + Actions */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary w-[200px] text-right text-sm">
              {booking.isAdminBooking && booking.invoiceOption
                ? "Paiement sur facture"
                : formatPrice(booking.totalPrice)}
            </span>

            <div
              className="flex items-center gap-1 w-[108px] justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              {booking.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => booking._id && onConfirm(booking._id)}
                    disabled={isConfirming}
                    title="Valider"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    onClick={() => onEdit(booking)}
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={() => booking._id && onCancel(booking._id)}
                    disabled={isCancelling}
                    title="Annuler"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {booking.status === "confirmed" && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    onClick={() => onEdit(booking)}
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={() => booking._id && onCancel(booking._id)}
                    disabled={isCancelling}
                    title="Annuler"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
