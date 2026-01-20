"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { CalendarDay, MonthlyCalendarProps, WeekData } from "./types";
import {
  formatMonthYear,
  generateCalendarDays,
  getDataForDate,
  getWeekEnd,
  getWeekStart,
  groupDaysByWeek,
  isCurrentMonth,
  isToday,
} from "./utils";

const DAYS_HEADERS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/**
 * Composant calendrier mensuel réutilisable
 *
 * Permet d'afficher n'importe quel type de données dans un calendrier mensuel
 * avec une colonne latérale optionnelle et un rendu personnalisé des cellules
 *
 * @example
 * // Afficher des shifts
 * <MonthlyCalendar
 *   currentDate={date}
 *   onDateChange={setDate}
 *   data={shifts}
 *   getDateForData={(shift) => shift.date}
 *   renderCell={(date, dayShifts) => (
 *     <ShiftCell shifts={dayShifts} />
 *   )}
 *   showSidebar
 *   sidebarItems={employees}
 *   renderSidebarWeek={(week, items) => <WeekSummary />}
 * />
 */
export function MonthlyCalendar<T = any>({
  currentDate,
  onDateChange,
  data,
  getDateForData,
  renderCell,
  renderSidebarWeek,
  onCellClick,
  readOnly = false,
  showSidebar = false,
  sidebarTitle = "Staff",
  sidebarItems = [],
  className = "",
  cellHeight = 120,
  legendComponent,
  actionButton,
}: MonthlyCalendarProps<T>) {
  // Calculer les jours du calendrier
  const calendarDays = useMemo(
    () => generateCalendarDays(currentDate),
    [currentDate],
  );

  // Grouper par semaine
  const weeks = useMemo(() => groupDaysByWeek(calendarDays), [calendarDays]);

  // Préparer les informations de chaque jour
  const daysWithInfo = useMemo(
    (): CalendarDay[] =>
      calendarDays.map((date) => ({
        date,
        isCurrentMonth: isCurrentMonth(date, currentDate),
        isToday: isToday(date),
      })),
    [calendarDays, currentDate],
  );

  // Navigation
  const goToPreviousMonth = () => {
    onDateChange(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    onDateChange(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Handler de clic sur cellule
  const handleCellClick = (date: Date) => {
    if (!readOnly && onCellClick) {
      const dayData = getDataForDate(data, date, getDateForData);
      onCellClick(date, dayData);
    }
  };

  return (
    <Card className={className}>
      {/* Header avec navigation */}
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="h-9 w-9 p-0"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="min-w-[180px] text-center text-lg font-semibold capitalize">
              {formatMonthYear(currentDate)}
            </h2>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="h-9 w-9 p-0"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd&apos;hui
            </Button>
          </div>

          {legendComponent && (
            <div className="flex items-center">{legendComponent}</div>
          )}

          {actionButton && (
            <div className="flex items-center">{actionButton}</div>
          )}
        </div>
      </CardHeader>

      {/* Calendrier */}
      <CardContent className="pt-0">
        <div className="flex gap-4">
          {/* Colonne latérale optionnelle */}
          {showSidebar && (
            <div className="w-32 flex-shrink-0 rounded-lg border bg-gray-50 border-gray-400">
              {/* En-tête */}
              <div className="flex min-h-[40px] items-center justify-center rounded-t-lg bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
                {sidebarTitle}
              </div>

              {/* Cases par semaine */}
              {weeks.map((weekDays, weekIndex) => {
                const weekStart = getWeekStart(weekDays[0]);
                const weekEnd = getWeekEnd(weekDays[0]);

                // Helper to normalize date to YYYY-MM-DD for comparison
                const formatDateForComparison = (
                  date: Date | string,
                ): string => {
                  if (typeof date === "string") {
                    return date.split("T")[0];
                  }
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                };

                const weekStartStr = formatDateForComparison(weekStart);
                const weekEndStr = formatDateForComparison(weekEnd);

                // Filtrer les données de cette semaine (compare strings to avoid timezone issues)
                const weekData: T[] = data.filter((item) => {
                  const itemDate = getDateForData(item);
                  const itemDateStr = formatDateForComparison(itemDate);
                  return (
                    itemDateStr >= weekStartStr && itemDateStr <= weekEndStr
                  );
                });

                const weekInfo: WeekData = {
                  weekStart,
                  weekEnd,
                  days: weekDays.map(
                    (date, idx) => daysWithInfo[weekIndex * 7 + idx],
                  ),
                };

                return (
                  <div
                    key={weekIndex}
                    className="flex flex-col rounded-b-lg border-t border-gray-400 bg-gray-50 p-2"
                    style={{ minHeight: cellHeight }}
                  >
                    {renderSidebarWeek ? (
                      renderSidebarWeek(weekInfo, weekData)
                    ) : (
                      <div className="flex-1 space-y-1">
                        {sidebarItems.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded px-1 text-xs font-medium text-white ${
                              item.color || "bg-gray-400"
                            } flex h-5 items-center`}
                          >
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Grille calendrier */}
          <div className="flex-1 rounded-lg border border-gray-400">
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-400">
              {/* En-têtes des jours */}
              {DAYS_HEADERS.map((day) => (
                <div
                  key={day}
                  className="flex min-h-[40px] items-center justify-center bg-gray-50 p-2 text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}

              {/* Cellules des jours */}
              {daysWithInfo.map((dayInfo, index) => {
                const dayData = getDataForDate(
                  data,
                  dayInfo.date,
                  getDateForData,
                );

                return (
                  <div
                    key={index}
                    className={`
                      flex flex-col bg-white p-2
                      ${
                        !dayInfo.isCurrentMonth
                          ? "bg-gray-50 text-gray-400"
                          : ""
                      }
                      ${
                        dayInfo.isToday ? "ring-2 ring-blue-500 ring-inset" : ""
                      }
                      ${
                        !readOnly && onCellClick
                          ? "cursor-pointer transition-colors hover:bg-gray-50"
                          : ""
                      }
                    `}
                    style={{ minHeight: cellHeight }}
                    onClick={() => handleCellClick(dayInfo.date)}
                  >
                    {/* Numéro du jour */}
                    <div
                      className={`mb-1 text-sm font-medium ${
                        dayInfo.isToday ? "text-blue-600" : ""
                      }`}
                    >
                      {dayInfo.date.getDate()}
                    </div>

                    {/* Contenu personnalisé */}
                    <div className="flex-1 overflow-hidden">
                      {renderCell(dayInfo.date, dayData, dayInfo)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
