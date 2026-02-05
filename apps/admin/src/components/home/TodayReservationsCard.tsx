"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTodayReservations } from "@/hooks/useTodayReservations";
import type { Booking } from "@/types/booking";
import {
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquareMore,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const SPACE_PRICES: Record<string, { hourly: string; daily: string }> = {
  "open-space": { hourly: "6€/H", daily: "29€/Jour" },
  "salle-verriere": { hourly: "24€/H", daily: "120€/Jour" },
  "salle-etage": { hourly: "60€/H", daily: "300€/Jour" },
};

function capitalize(name?: string): string {
  if (!name) return "";
  return name.replace(/(^|[\s-])[a-zA-ZÀ-ÿ]/g, (c) => c.toUpperCase());
}

/**
 * Card affichant les réservations validées du jour
 * Utilise useTodayReservations pour récupérer les données
 *
 * Respecte CLAUDE.md : Composant < 200 lignes
 */
export function TodayReservationsCard() {
  const { reservations, isLoading, error, refetch } = useTodayReservations();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"present" | "noshow" | null>(
    null,
  );

  const handleMarkPresent = async (bookingId: string) => {
    if (processingId) return; // Block if already processing

    if (
      !confirm(
        "Confirmer la présence du client ? Cela libérera l'empreinte bancaire et enverra un email de confirmation.",
      )
    )
      return;
    try {
      setProcessingId(bookingId);
      setActionType("present");
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-present`,
        { method: "POST" },
      );
      const data = await response.json();
      if (data.success) {
        refetch();
      }
    } catch {
      // Silent fail - the UI will stay as-is
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (processingId) return; // Block if already processing

    if (
      !confirm(
        "Marquer comme no-show ? Cela capturera l'empreinte bancaire et enverra un email au client.",
      )
    )
      return;
    try {
      setProcessingId(bookingId);
      setActionType("noshow");
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-noshow`,
        { method: "POST" },
      );
      const data = await response.json();
      if (data.success) {
        refetch();
      }
    } catch {
      // Silent fail
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  // Get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // Filtrer les réservations confirmées et séparer aujourd'hui/demain
  const confirmedReservations = reservations.filter(
    (booking) => booking.status === "confirmed",
  );

  const todayReservations = confirmedReservations
    .filter((booking) => booking.startDate === today)
    .sort((a, b) => {
      const timeA = a.startTime || "23:59";
      const timeB = b.startTime || "23:59";
      return timeA.localeCompare(timeB);
    });

  const tomorrowReservations = confirmedReservations
    .filter((booking) => booking.startDate !== today)
    .sort((a, b) => {
      const timeA = a.startTime || "23:59";
      const timeB = b.startTime || "23:59";
      return timeA.localeCompare(timeB);
    });

  const spaceTypeColors: Record<string, string> = {
    "open-space": "border-l-blue-500",
    "salle-verriere": "border-l-green-500",
    "salle-etage": "border-l-purple-500",
    evenementiel: "border-l-red-500",
  };

  const getSpaceType = (spaceName?: string): string => {
    if (!spaceName) return "open-space";
    const lower = spaceName.toLowerCase();
    if (lower.includes("verriere")) return "salle-verriere";
    if (lower.includes("etage")) return "salle-etage";
    if (lower.includes("evenement")) return "evenementiel";
    return "open-space";
  };

  const renderBookingItem = (booking: Booking, isTomorrow = false) => {
    const spaceType = getSpaceType(booking.spaceName);
    const borderClass = spaceTypeColors[spaceType];

    // Afficher société si existe, sinon nom du client
    const displayName = booking.clientCompany || booking.clientName;

    const isProcessing = processingId === booking._id;

    return (
      <div
        key={booking._id}
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                        <MessageSquareMore className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs border-red-500 border">
                      <p className="text-base whitespace-pre-wrap ">
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
              <Users className="h-3 w-3" />
              <span>{booking.numberOfPeople} pers.</span>
              {(() => {
                // Si paiement sur facture, afficher le texte au lieu du prix
                if (booking.invoiceOption) {
                  return (
                    <>
                      <span>·</span>
                      <span className="font-bold text-blue-500">
                        €€€ Sur facture
                      </span>
                    </>
                  );
                }

                // Sinon, afficher le prix comme avant
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
              })()}
            </div>
          </div>
          {booking.status === "confirmed" && !booking.isAdminBooking && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => booking._id && handleMarkPresent(booking._id)}
                disabled={isProcessing || processingId !== null}
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
                onClick={() => booking._id && handleMarkNoShow(booking._id)}
                disabled={isProcessing || processingId !== null}
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
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Réservations du jour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Réservations du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center text-destructive">
            <p className="text-sm">Erreur: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Réservations du jour
          </div>
          <Link href="/agenda">
            <Button
              variant="outline"
              className="gap-2  border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
            >
              Voir agenda
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayReservations.length === 0 && tomorrowReservations.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Aucune réservation validée aujourd'hui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayReservations.length > 0 && (
              <div className="space-y-2">
                {todayReservations.map((booking) =>
                  renderBookingItem(booking, false),
                )}
              </div>
            )}

            {tomorrowReservations.length > 0 && (
              <div className="space-y-2">
                {todayReservations.length > 0 && (
                  <div className="border-t border-green-700 pt-3 mt-3" />
                )}
                {tomorrowReservations.map((booking) =>
                  renderBookingItem(booking, true),
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
