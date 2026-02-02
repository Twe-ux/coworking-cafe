import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";
import type { PeriodFilter } from "@/types/accounting";

interface PeriodSelectorProps {
  period1: PeriodFilter | null;
  period2: PeriodFilter | null;
  onPeriod1Change: (period: PeriodFilter) => void;
  onPeriod2Change: (period: PeriodFilter) => void;
}

interface Preset {
  label: string;
  period1: PeriodFilter;
  period2: PeriodFilter;
}

export function PeriodSelector({
  period1,
  period2,
  onPeriod1Change,
  onPeriod2Change,
}: PeriodSelectorProps) {
  // Générer les presets dynamiquement
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const presets: Preset[] = [
    {
      label: "Ce mois vs mois dernier",
      period1: {
        startDate: new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10),
        endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10),
        label: getMonthLabel(currentYear, currentMonth),
      },
      period2: {
        startDate: new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10),
        endDate: new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10),
        label: getMonthLabel(currentYear, currentMonth - 1),
      },
    },
    {
      label: "Même mois année dernière",
      period1: {
        startDate: new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10),
        endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10),
        label: getMonthLabel(currentYear, currentMonth),
      },
      period2: {
        startDate: new Date(currentYear - 1, currentMonth, 1).toISOString().slice(0, 10),
        endDate: new Date(currentYear - 1, currentMonth + 1, 0).toISOString().slice(0, 10),
        label: getMonthLabel(currentYear - 1, currentMonth),
      },
    },
    {
      label: "Cette année vs année dernière",
      period1: {
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`,
        label: `Année ${currentYear}`,
      },
      period2: {
        startDate: `${currentYear - 1}-01-01`,
        endDate: `${currentYear - 1}-12-31`,
        label: `Année ${currentYear - 1}`,
      },
    },
  ];

  const handlePresetClick = (preset: Preset) => {
    onPeriod1Change(preset.period1);
    onPeriod2Change(preset.period2);
  };

  const handleSwapPeriods = () => {
    if (period1 && period2) {
      onPeriod1Change(period2);
      onPeriod2Change(period1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Sélection des périodes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets rapides */}
        <div>
          <p className="text-sm font-medium mb-2">Comparaisons rapides :</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sélecteurs manuels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Période 1 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Période 1</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Date de début</label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={period1?.startDate || ""}
                  onChange={(e) =>
                    onPeriod1Change({
                      startDate: e.target.value,
                      endDate: period1?.endDate || e.target.value,
                      label: period1?.label,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Date de fin</label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={period1?.endDate || ""}
                  onChange={(e) =>
                    onPeriod1Change({
                      startDate: period1?.startDate || e.target.value,
                      endDate: e.target.value,
                      label: period1?.label,
                    })
                  }
                />
              </div>
              {period1 && (
                <p className="text-xs text-muted-foreground">
                  {period1.label || formatPeriodRange(period1.startDate, period1.endDate)}
                </p>
              )}
            </div>
          </div>

          {/* Bouton swap */}
          <div className="flex items-center justify-center md:col-span-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapPeriods}
              disabled={!period1 || !period2}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Inverser les périodes
            </Button>
          </div>

          {/* Période 2 */}
          <div className="space-y-2 md:col-start-2 md:row-start-1">
            <label className="text-sm font-semibold text-secondary">Période 2</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Date de début</label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={period2?.startDate || ""}
                  onChange={(e) =>
                    onPeriod2Change({
                      startDate: e.target.value,
                      endDate: period2?.endDate || e.target.value,
                      label: period2?.label,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Date de fin</label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={period2?.endDate || ""}
                  onChange={(e) =>
                    onPeriod2Change({
                      startDate: period2?.startDate || e.target.value,
                      endDate: e.target.value,
                      label: period2?.label,
                    })
                  }
                />
              </div>
              {period2 && (
                <p className="text-xs text-muted-foreground">
                  {period2.label || formatPeriodRange(period2.startDate, period2.endDate)}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helpers
function getMonthLabel(year: number, month: number): string {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // Gérer les mois négatifs (année précédente)
  if (month < 0) {
    return getMonthLabel(year - 1, 12 + month);
  }

  return `${months[month]} ${year}`;
}

function formatPeriodRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
