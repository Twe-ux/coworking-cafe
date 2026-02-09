import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types/booking";
import { Clock, MessageSquareMore, Users } from "lucide-react";

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

  // Déterminer le type de réservation basé sur la durée réelle
  const getReservationType = (): "hourly" | "daily" | "weekly" | "monthly" => {
    // Si reservationType existe et est weekly/monthly, le garder
    if (reservation.reservationType === "weekly") return "weekly";
    if (reservation.reservationType === "monthly") return "monthly";

    // Sinon, déduire entre hourly et daily basé sur les horaires
    if (!reservation.startTime || !reservation.endTime) return "daily";

    const [sH, sM] = reservation.startTime.split(":").map(Number);
    const [eH, eM] = reservation.endTime.split(":").map(Number);
    const hours = eH - sH + (eM - sM) / 60;

    // Si plus de 5h, considérer comme journée
    return hours > 5 ? "daily" : "hourly";
  };

  const reservationType = getReservationType();

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
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isTomorrow && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-300"
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
                    <div className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
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

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {reservation.startTime && reservation.endTime ? (
              <>
                <Clock className="h-3 w-3" />
                <span>
                  {reservation.startTime} - {reservation.endTime}
                </span>
              </>
            ) : (
              <span>Journée complète</span>
            )}
            <span>·</span>
            <Badge
              variant="outline"
              className="text-xs h-5 px-1.5"
            >
              {reservationType === "hourly" && "À l'heure"}
              {reservationType === "daily" && "À la journée"}
              {reservationType === "weekly" && "À la semaine"}
              {reservationType === "monthly" && "Au mois"}
            </Badge>
            <span>·</span>
            <Users className="h-3 w-3" />
            <span>{reservation.numberOfPeople} pers.</span>
            {renderPriceInfo()}
          </div>
        </div>
      </div>
    </div>
  );
}
