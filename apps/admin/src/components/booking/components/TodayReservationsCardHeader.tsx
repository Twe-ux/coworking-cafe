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
  // Même style pour admin et staff - comme dans commit 1e000f4
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
