"use client";

import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeriodSelectorProps {
  view: "year" | "month" | "week";
  onViewChange: (view: "year" | "month" | "week") => void;
}

export function PeriodSelector({ view, onViewChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={view === "year" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("year")}
        className="gap-2"
      >
        <CalendarRange className="h-4 w-4" />
        Mensuel
      </Button>

      <Button
        variant={view === "week" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("week")}
        className="gap-2"
      >
        <CalendarDays className="h-4 w-4" />
        Semaine
      </Button>

      <Button
        variant={view === "month" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("month")}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Jours
      </Button>
    </div>
  );
}
