import { Badge } from "@/components/ui/badge";

interface StaffReservationsFooterProps {
  reservationsCount: number;
  isAdminOrDev: boolean;
}

export function StaffReservationsFooter({
  reservationsCount,
  isAdminOrDev,
}: StaffReservationsFooterProps) {
  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total réservations</span>
        <Badge variant="outline" className="font-semibold">
          {reservationsCount}
        </Badge>
      </div>
      {isAdminOrDev && (
        <p className="text-xs text-muted-foreground mt-2">
          Affichage admin : tous les statuts
        </p>
      )}
    </div>
  );
}
