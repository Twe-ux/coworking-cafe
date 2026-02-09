import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types/booking";
import {
  Clock,
  Loader2,
  MessageSquareMore,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

interface AdminReservationRowProps {
  booking: Booking;
  borderClass: string;
  displayName: string | undefined;
  isProcessing: boolean;
  actionType: "present" | "noshow" | null;
  onMarkPresent: (bookingId: string) => void;
  onMarkNoShow: (bookingId: string) => void;
  processingDisabled: boolean;
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

export function AdminReservationRow({
  booking,
  borderClass,
  displayName,
  isProcessing,
  actionType,
  onMarkPresent,
  onMarkNoShow,
  processingDisabled,
  isTomorrow = false,
}: AdminReservationRowProps) {
  const spaceType = getSpaceType(booking.spaceName);

  // Déterminer le type de réservation basé sur la durée réelle
  const getReservationType = (): "hourly" | "daily" | "weekly" | "monthly" => {
    // Debug
    console.log('🔍 Booking:', {
      id: booking._id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      endTimeType: typeof booking.endTime,
      reservationType: booking.reservationType
    });

    // Si reservationType existe et est weekly/monthly, le garder
    if (booking.reservationType === "weekly") return "weekly";
    if (booking.reservationType === "monthly") return "monthly";

    // Si endTime vide, absent, ou seulement des espaces → forfait jour
    if (!booking.endTime || booking.endTime.trim() === "") {
      console.log('✅ Détecté comme daily (endTime vide)');
      return "daily";
    }

    // Si pas de startTime → forfait jour
    if (!booking.startTime) {
      console.log('✅ Détecté comme daily (pas de startTime)');
      return "daily";
    }

    // Calculer durée si les deux horaires existent
    const [sH, sM] = booking.startTime.split(":").map(Number);
    const [eH, eM] = booking.endTime.split(":").map(Number);
    const hours = eH - sH + (eM - sM) / 60;

    // Si plus de 5h → forfait jour, sinon → horaire
    const result = hours > 5 ? "daily" : "hourly";
    console.log(`✅ Détecté comme ${result} (durée: ${hours}h)`);
    return result;
  };

  const reservationType = getReservationType();

  const renderPriceInfo = () => {
    // Afficher "Sur facture" UNIQUEMENT si c'est une réservation admin ET invoiceOption
    if (booking.isAdminBooking && booking.invoiceOption) {
      return (
        <>
          <span>·</span>
          <span className="font-bold text-blue-500">€€€ Sur facture</span>
        </>
      );
    }

    const prices = SPACE_PRICES[spaceType];
    if (!prices) return null;

    let isDaily = !booking.startTime || !booking.endTime;
    if (!isDaily && booking.startTime && booking.endTime) {
      const [sH, sM] = booking.startTime.split(":").map(Number);
      const [eH, eM] = booking.endTime.split(":").map(Number);
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
              {capitalize(booking.spaceName)}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-sm font-semibold truncate">
              {displayName}
            </span>
            {booking.notes && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                      <MessageSquareMore className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs border-red-500 border">
                    <p className="text-base whitespace-pre-wrap">
                      {booking.notes}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {booking.startTime && booking.endTime ? (
              <>
                <Clock className="h-3 w-3" />
                <span>
                  {booking.startTime} - {booking.endTime}
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
            <span>{booking.numberOfPeople} pers.</span>
            {renderPriceInfo()}
          </div>
        </div>

        {booking.status === "confirmed" && (
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
              onClick={() => booking._id && onMarkPresent(booking._id)}
              disabled={isProcessing || processingDisabled}
            >
              {isProcessing && actionType === "present" ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <UserCheck className="h-3 w-3 mr-1" />
              )}
              Présent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-orange-500 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
              onClick={() => booking._id && onMarkNoShow(booking._id)}
              disabled={isProcessing || processingDisabled}
            >
              {isProcessing && actionType === "noshow" ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <UserX className="h-3 w-3 mr-1" />
              )}
              No-show
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
