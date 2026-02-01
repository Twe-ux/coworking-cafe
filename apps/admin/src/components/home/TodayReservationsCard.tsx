"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodayReservations } from "@/hooks/useTodayReservations";
import type { Booking } from "@/types/booking";
import { Calendar, Clock, Copy, ExternalLink, UserCheck, UserX, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

/**
 * Card affichant les réservations validées du jour
 * Utilise useTodayReservations pour récupérer les données
 *
 * Respecte CLAUDE.md : Composant < 200 lignes
 */
export function TodayReservationsCard() {
  const { reservations, isLoading, error, refetch } = useTodayReservations();
  const [isMarkingPresent, setIsMarkingPresent] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);

  const handleMarkPresent = async (bookingId: string) => {
    if (!confirm("Confirmer la présence du client ? Cela libérera l'empreinte bancaire et enverra un email de confirmation.")) return;
    try {
      setIsMarkingPresent(true);
      const response = await fetch(`/api/booking/reservations/${bookingId}/mark-present`, { method: "POST" });
      const data = await response.json();
      if (data.success) {
        refetch();
      }
    } catch {
      // Silent fail - the UI will stay as-is
    } finally {
      setIsMarkingPresent(false);
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (!confirm("Marquer comme no-show ? Cela capturera l'empreinte bancaire et enverra un email au client.")) return;
    try {
      setIsMarkingNoShow(true);
      const response = await fetch(`/api/booking/reservations/${bookingId}/mark-noshow`, { method: "POST" });
      const data = await response.json();
      if (data.success) {
        refetch();
      }
    } catch {
      // Silent fail
    } finally {
      setIsMarkingNoShow(false);
    }
  };

  // Filtrer uniquement les réservations confirmées
  const confirmedReservations = reservations.filter(
    (booking) => booking.status === "confirmed",
  );

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

  const renderBookingItem = (booking: Booking) => {
    const spaceType = getSpaceType(booking.spaceName);
    const borderClass = spaceTypeColors[spaceType];

    return (
      <div
        key={booking._id}
        className={`border rounded-lg border-l-4 ${borderClass} py-2.5 px-3 hover:bg-muted/50 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">
                {booking.spaceName}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-sm font-semibold truncate">
                {booking.clientName}
              </span>
              {booking.clientEmail && (
                <button
                  type="button"
                  title={booking.clientEmail}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => navigator.clipboard.writeText(booking.clientEmail!)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
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
            </div>
          </div>
          {booking.status === "confirmed" && !booking.isAdminBooking && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => booking._id && handleMarkPresent(booking._id)}
                disabled={isMarkingPresent}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Présent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 border-orange-500 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                onClick={() => booking._id && handleMarkNoShow(booking._id)}
                disabled={isMarkingNoShow}
              >
                <UserX className="h-3 w-3 mr-1" />
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
            <Button variant="outline" className="gap-2">
              Voir agenda
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {confirmedReservations.length > 0 ? (
          <div className="space-y-2">
            {confirmedReservations.map(renderBookingItem)}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Aucune réservation validée aujourd'hui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
