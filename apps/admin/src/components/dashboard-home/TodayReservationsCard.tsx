"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Users, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useTodayReservations } from "@/hooks/useTodayReservations";
import type { BookingStatus } from "@/types/booking";

/**
 * Card des réservations du jour pour la page d'accueil
 * Affiche les réservations en format liste
 * Filtré par rôle : staff voit seulement confirmées, admin/dev voit tout
 *
 * Respecte CLAUDE.md :
 * - Composant < 200 lignes
 * - Logique extraite dans useTodayReservations hook
 * - Types importés depuis /types/
 * - Dates en format string
 */

// Mapping des statuts en français
const statusLabels: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const statusColors: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "outline",
};

export function TodayReservationsCard() {
  const { reservations, isLoading, error, isAdminOrDev } =
    useTodayReservations();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Réservations du jour</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
        <Link href="/admin/booking/reservations">
          <Button variant="ghost" size="sm" className="gap-2">
            Voir toutes
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Chargement...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Erreur: {error}</div>
        ) : reservations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {isAdminOrDev
              ? "Aucune réservation aujourd'hui"
              : "Aucune réservation confirmée aujourd'hui"}
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Première ligne : Nom client + Badge statut */}
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
                    variant={statusColors[reservation.status]}
                    className="shrink-0 text-xs"
                  >
                    {statusLabels[reservation.status]}
                  </Badge>
                </div>

                {/* Deuxième ligne : Infos réservation */}
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {reservation.spaceName || "Espace"}
                    </span>
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

                {/* Notes si présentes */}
                {reservation.notes && (
                  <p className="text-xs text-muted-foreground italic border-t pt-2 truncate">
                    {reservation.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && reservations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total réservations
              </span>
              <Badge variant="outline" className="font-semibold">
                {reservations.length}
              </Badge>
            </div>
            {isAdminOrDev && (
              <p className="text-xs text-muted-foreground mt-2">
                Affichage admin : tous les statuts
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
