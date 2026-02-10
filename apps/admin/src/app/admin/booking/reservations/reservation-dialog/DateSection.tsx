"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateSectionProps } from "./types";
import type { DateRange } from "react-day-picker";

export function DateSection({
  startDate,
  endDate,
  onDatesChange,
  error,
}: DateSectionProps) {
  const [open, setOpen] = useState(false);
  // Convert string dates to Date objects for calendar
  const dateRange: DateRange | undefined =
    startDate && endDate
      ? {
          from: new Date(startDate),
          to: new Date(endDate),
        }
      : startDate
        ? {
            from: new Date(startDate),
            to: undefined,
          }
        : undefined;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    console.log("🗓️ DateSection - handleDateRangeSelect:", range);

    if (range?.from) {
      const fromString = format(range.from, "yyyy-MM-dd");

      // Si "to" existe, utiliser cette date, sinon utiliser "from" (même jour)
      if (range.to) {
        const toString = format(range.to, "yyyy-MM-dd");
        console.log("🗓️ DateSection - Setting dates (range):", fromString, "to", toString);
        onDatesChange(fromString, toString);
        setOpen(false);
      } else {
        // Si seulement "from" est sélectionné, startDate = endDate = même date
        console.log("🗓️ DateSection - Setting dates (single day):", fromString);
        onDatesChange(fromString, fromString);
        setOpen(false);
      }
    } else {
      // Reset si aucune date sélectionnée
      console.log("🗓️ DateSection - Resetting dates");
      onDatesChange("", "");
    }
  };

  const formatDateRangeText = () => {
    if (!startDate) {
      return "Sélectionner une période";
    }

    const from = format(new Date(startDate), "dd MMM yyyy", { locale: fr });

    if (!endDate || startDate === endDate) {
      return from;
    }

    const to = format(new Date(endDate), "dd MMM yyyy", { locale: fr });
    return `${from} - ${to}`;
  };

  return (
    <div className="space-y-3 ">
      <Label>Période *</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRangeText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={1}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            initialFocus
            locale={fr}
          />
        </PopoverContent>
      </Popover>

      {startDate && endDate && startDate !== endDate && (
        <p className="text-xs text-muted-foreground">
          Réservation du{" "}
          {format(new Date(startDate), "dd MMMM", { locale: fr })} au{" "}
          {format(new Date(endDate), "dd MMMM yyyy", { locale: fr })}
        </p>
      )}

      {startDate && (!endDate || startDate === endDate) && (
        <p className="text-xs text-muted-foreground">
          Réservation pour le{" "}
          {format(new Date(startDate), "dd MMMM yyyy", { locale: fr })}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
