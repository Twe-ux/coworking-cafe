import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface TodayReservationsCardHeaderProps {
  variant: "admin" | "staff";
  viewAllUrl: string;
  viewAllLabel: string;
}

export function TodayReservationsCardHeader({
  variant,
  viewAllUrl,
  viewAllLabel,
}: TodayReservationsCardHeaderProps) {
  if (variant === "staff") {
    return (
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
        <Link href={viewAllUrl}>
          <Button variant="ghost" size="sm" className="gap-2">
            {viewAllLabel}
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
    );
  }

  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Réservations du jour
        </div>
        <Link href={viewAllUrl}>
          <Button
            variant="outline"
            className="gap-2 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
          >
            {viewAllLabel}
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </CardTitle>
    </CardHeader>
  );
}
