"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { MonthlyCombinedTable } from "./MonthlyCombinedTable";
import { PeriodSelector } from "./PeriodSelector";
import { WeeklyCombinedTable } from "./WeeklyCombinedTable";
import { YearSelector } from "./YearSelector";
import { YearlyCombinedTable } from "./YearlyCombinedTable";

type ViewType = "year" | "month" | "week";

export function DetailedView() {
  const [view, setView] = useState<ViewType>("year");
  const [currentYear, setCurrentYear] = useState(2026);
  const [previousYear, setPreviousYear] = useState(2025);
  const [mode, setMode] = useState<"ht" | "ttc">("ht"); // Default HT
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mois actuel

  return (
    <div className="space-y-6 pb-14">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <PeriodSelector view={view} onViewChange={setView} />

        <div className="flex items-center gap-4">
          {view === "month" && (
            <div className="flex items-center gap-2">
              <Label htmlFor="month-select" className="text-sm">
                Mois
              </Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(val) => setSelectedMonth(parseInt(val))}
              >
                <SelectTrigger id="month-select" className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2000, i).toLocaleDateString("fr-FR", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <YearSelector
            currentYear={currentYear}
            previousYear={previousYear}
            onCurrentYearChange={setCurrentYear}
            onPreviousYearChange={setPreviousYear}
          />

          <div className="flex items-center gap-2">
            <Label htmlFor="mode-toggle">HT</Label>
            <Switch
              id="mode-toggle"
              checked={mode === "ttc"}
              onCheckedChange={(checked) => setMode(checked ? "ttc" : "ht")}
            />
            <Label htmlFor="mode-toggle">TTC</Label>
          </div>
        </div>
      </div>

      {view === "year" && (
        <YearlyCombinedTable
          currentYear={currentYear}
          previousYear={previousYear}
          mode={mode}
        />
      )}

      {view === "month" && (
        <MonthlyCombinedTable
          year={currentYear}
          month={selectedMonth}
          previousYear={previousYear}
          mode={mode}
        />
      )}

      {view === "week" && (
        <WeeklyCombinedTable
          currentYear={currentYear}
          previousYear={previousYear}
          mode={mode}
        />
      )}
    </div>
  );
}
