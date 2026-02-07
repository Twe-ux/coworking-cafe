"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTodayReservations } from "@/hooks/useTodayReservations";
import { useReservationActions } from "@/hooks/useReservationActions";
import { TodayReservationsCardHeader } from "./components/TodayReservationsCardHeader";
import { AdminReservationRow } from "./components/AdminReservationRow";
import { StaffReservationRow } from "./components/StaffReservationRow";
import { EmptyReservationsState } from "./components/EmptyReservationsState";
import { StaffReservationsFooter } from "./components/StaffReservationsFooter";
import { ReservationsLoadingSkeleton } from "./components/ReservationsLoadingSkeleton";
import { ReservationsErrorState } from "./components/ReservationsErrorState";
import { SPACE_TYPE_COLORS, getSpaceType } from "./components/utils";

interface TodayReservationsCardProps {
  /**
   * Variante du composant
   * - admin: Affichage détaillé avec actions (Présent/No-show) et prix
   * - staff: Affichage simple lecture seule avec statuts
   */
  variant?: "admin" | "staff";

  /**
   * URL pour le lien "Voir toutes" ou "Voir agenda"
   */
  viewAllUrl?: string;

  /**
   * Texte du bouton "Voir toutes"
   */
  viewAllLabel?: string;
}

/**
 * Card affichant les réservations du jour
 * Versions admin (avec actions) et staff (lecture seule)
 */
export function TodayReservationsCard({
  variant = "admin",
  viewAllUrl = variant === "admin" ? "/agenda" : "/admin/booking/reservations",
  viewAllLabel = variant === "admin" ? "Voir agenda" : "Voir toutes",
}: TodayReservationsCardProps) {
  const { reservations, isLoading, error, refetch, isAdminOrDev } =
    useTodayReservations();

  const { processingId, actionType, handleMarkPresent, handleMarkNoShow } =
    useReservationActions({
      onSuccess: refetch,
    });

  // Get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // Filtrer selon la variante
  const filteredReservations =
    variant === "admin"
      ? reservations.filter((b) => b.status === "confirmed")
      : reservations;

  const todayReservations = filteredReservations
    .filter((booking) => booking.startDate === today)
    .sort((a, b) => {
      const timeA = a.startTime || "23:59";
      const timeB = b.startTime || "23:59";
      return timeA.localeCompare(timeB);
    });

  const tomorrowReservations =
    variant === "admin"
      ? filteredReservations
          .filter((booking) => booking.startDate !== today)
          .sort((a, b) => {
            const timeA = a.startTime || "23:59";
            const timeB = b.startTime || "23:59";
            return timeA.localeCompare(timeB);
          })
      : [];

  if (isLoading) {
    return <ReservationsLoadingSkeleton />;
  }

  if (error) {
    return <ReservationsErrorState error={error} />;
  }

  const hasReservations =
    todayReservations.length > 0 || tomorrowReservations.length > 0;

  return (
    <Card className="h-full">
      <TodayReservationsCardHeader
        variant={variant}
        viewAllUrl={viewAllUrl}
        viewAllLabel={viewAllLabel}
      />

      <CardContent>
        {!hasReservations ? (
          <EmptyReservationsState
            variant={variant}
            isAdminOrDev={isAdminOrDev}
          />
        ) : variant === "admin" ? (
          <div className="space-y-4">
            {todayReservations.length > 0 && (
              <div className="space-y-2">
                {todayReservations.map((booking) => {
                  const spaceType = getSpaceType(booking.spaceName);
                  const borderClass = SPACE_TYPE_COLORS[spaceType];
                  const displayName =
                    booking.clientCompany || booking.clientName;
                  const isProcessing = processingId === booking._id;

                  return (
                    <AdminReservationRow
                      key={booking._id}
                      booking={booking}
                      borderClass={borderClass}
                      displayName={displayName}
                      isProcessing={isProcessing}
                      actionType={actionType}
                      onMarkPresent={handleMarkPresent}
                      onMarkNoShow={handleMarkNoShow}
                      processingDisabled={processingId !== null}
                    />
                  );
                })}
              </div>
            )}

            {tomorrowReservations.length > 0 && (
              <div className="space-y-2">
                {todayReservations.length > 0 && (
                  <div className="border-t border-gray-400 pt-3 mx-10 mt-3" />
                )}
                {tomorrowReservations.map((booking) => {
                  const spaceType = getSpaceType(booking.spaceName);
                  const borderClass = SPACE_TYPE_COLORS[spaceType];
                  const displayName =
                    booking.clientCompany || booking.clientName;

                  return (
                    <AdminReservationRow
                      key={booking._id}
                      booking={booking}
                      borderClass={borderClass}
                      displayName={displayName}
                      isProcessing={false}
                      actionType={null}
                      onMarkPresent={handleMarkPresent}
                      onMarkNoShow={handleMarkNoShow}
                      processingDisabled={true}
                      isTomorrow
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {todayReservations.map((reservation) => (
              <StaffReservationRow
                key={reservation._id}
                reservation={reservation}
              />
            ))}
          </div>
        )}

        {variant === "staff" &&
          !isLoading &&
          !error &&
          todayReservations.length > 0 && (
            <StaffReservationsFooter
              reservationsCount={todayReservations.length}
              isAdminOrDev={isAdminOrDev}
            />
          )}
      </CardContent>
    </Card>
  );
}
