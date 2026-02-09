import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types/booking";
import { Clock, MessageSquareMore, Users } from "lucide-react";
import {
  getCalculatedReservationType,
  getReservationTypeLabel,
  getReservationTypeBadgeClass,
} from "@/app/admin/booking/reservations/utils";

interface StaffReservationRowProps {
  reservation: Booking;
  borderClass: string;
  displayName: string | undefined;
  isTomorrow?: boolean;
}

const SPACE_PRICES: Record<string, { hourly: string; daily: string }> = {
  "open-space": { hourly: "6€/H", daily: "29€/Jour" },
  "salle-verriere": { hourly: "24€/H", daily: "120€/Jour" },
  "salle-etage": { hourly: "60€/H", daily: "300€/Jour" },
};

function capitalize(name?: string): string {
  if (!name) return "";
  return name.replace(/(^|[\s-])[a-zA-ZÀ-ÿ]/g, (c) => c.toUpperCase());
}

function getSpaceType(spaceName?: string): string {
  if (!spaceName) return "open-space";
  const lower = spaceName.toLowerCase();
  if (lower.includes("verriere")) return "salle-verriere";
  if (lower.includes("etage")) return "salle-etage";
  if (lower.includes("evenement")) return "evenementiel";
  return "open-space";
}

export function StaffReservationRow({
  reservation,
  borderClass,
  displayName,
  isTomorrow = false,
}: StaffReservationRowProps) {
  const spaceType = getSpaceType(reservation.spaceName);

  // Utiliser la fonction utilitaire pour déterminer le type
  const reservationType = getCalculatedReservationType(
    reservation.startTime,
    reservation.endTime
  );

  const renderPriceInfo = () => {
    // Afficher "Sur facture" UNIQUEMENT si c'est une réservation admin ET invoiceOption
    if (reservation.isAdminBooking && reservation.invoiceOption) {
      return (
        <>
          <span>·</span>
          <span className="font-bold text-blue-500">€€€ Sur facture</span>
        </>
      );
    }

    const prices = SPACE_PRICES[spaceType];
    if (!prices) return null;

    let isDaily = !reservation.startTime || !reservation.endTime;
    if (!isDaily && reservation.startTime && reservation.endTime) {
      const [sH, sM] = reservation.startTime.split(":").map(Number);
      const [eH, eM] = reservation.endTime.split(":").map(Number);
      const hours = eH - sH + (eM - sM) / 60;
      if (hours > 5) isDaily = true;
    }

    return (
      <>
        <span>·</span>
        <span className="font-bold text-blue-500">
          {isDaily ? prices.daily : prices.hourly}
        </span>
      </>
    );
  };

  return (
    <div
      className={`border rounded-lg border-l-4 ${borderClass} py-2.5 px-3 hover:bg-muted/50 transition-colors`}
    >
      <div className="flex items-center gap-3">
        {/* Colonne principale avec 2 lignes */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          {/* Ligne 1: Badge Demain + Espace + Client + Notes */}
          <div className="flex items-center gap-2 flex-wrap">
            {isTomorrow && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-300 flex-shrink-0"
              >
                Demain
              </Badge>
            )}
            <span className="font-medium text-sm truncate">
              {capitalize(reservation.spaceName)}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-sm font-semibold truncate">
              {displayName}
            </span>
            {reservation.notes && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-red-500 hover:text-red-600 transition-colors cursor-pointer flex-shrink-0">
                      <MessageSquareMore className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs border-red-500 border">
                    <p className="text-base whitespace-pre-wrap">
                      {reservation.notes}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Ligne 2: Horaires + Type + Personnes + Prix - TOUT SUR UNE LIGNE */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-nowrap">
            {reservation.startTime && reservation.endTime ? (
              <>
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {reservation.startTime} - {reservation.endTime}
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap">Journée complète</span>
            )}
            <span className="flex-shrink-0">·</span>
            <Badge
              variant="outline"
              className={`text-xs h-5 px-1.5 flex-shrink-0 ${getReservationTypeBadgeClass(reservationType)}`}
            >
              {getReservationTypeLabel(reservationType)}
            </Badge>
            <span className="flex-shrink-0">·</span>
            <Users className="h-3 w-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{reservation.numberOfPeople} pers.</span>
            {renderPriceInfo()}
          </div>
        </div>
      </div>
    </div>
  );
}
