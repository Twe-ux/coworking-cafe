import { Card } from "@/components/ui/card";
import { useDashboardCard } from "@/hooks/use-reporting";
import type { ReportingRange } from "@/store/reporting/api";
import { ReactNode } from "react";
import { DashCardFooter } from "./section-card-footer";
import { DashCardHeader } from "./section-card-header";

interface DashCardProps {
  description_header: string;
  trendin_header: ReactNode;
  trendin_footer: ReactNode;
  text_trendin: string;
  range: ReportingRange;
  secRange: ReportingRange;
  compare: ReportingRange;
  checked: boolean;
  valueChartData: {
    HT: number;
    TTC: number;
  };
}

export function DashCard({
  description_header,
  range,
  secRange,
  checked,
  compare,
  text_trendin,
}: DashCardProps) {
  // Utiliser notre nouveau hook pour les données principales
  const { data: mainData, isLoading: mainLoading } = useDashboardCard(
    range,
    compare,
    checked ? "HT" : "TTC",
  );

  // Utiliser le hook pour les données de comparaison (pour le footer)
  const { data: compareData, isLoading: compareLoading } = useDashboardCard(
    secRange,
    compare,
    checked ? "HT" : "TTC",
  );

  if (mainLoading || compareLoading) {
    return (
      <Card className="@container/card">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="mb-4 h-8 w-1/2 rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!mainData || !compareData) {
    return (
      <Card className="@container/card">
        <div className="p-4 text-center text-gray-500">
          Données non disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <DashCardHeader
        description_header={description_header}
        value_TTC={checked ? 0 : mainData.value}
        value_HT={checked ? mainData.value : 0}
        checked={checked}
        compareTTC={checked ? 0 : mainData.trend?.percentage || 0}
        compareHT={checked ? mainData.trend?.percentage || 0 : 0}
        value={mainData.value}
        compareValueTTC={compareData.value || 0}
        compareValueHT={compareData.value || 0}
      />
      <DashCardFooter
        text_trendin={text_trendin}
        valueChartData={{
          HT: checked ? compareData.value : 0,
          TTC: checked ? 0 : compareData.value,
        }}
        checked={checked}
        percentageChangeHT={checked ? mainData.trend?.percentage || 0 : 0}
        percentageChangeTTC={checked ? 0 : mainData.trend?.percentage || 0}
        description_footer={`Comparé à ${secRange === "previousDay" ? "la journée précédente" : secRange === "previousWeek" ? "la semaine précédente" : secRange === "previousMonth" ? "le mois précédent" : "l'année précédente"} - ${compareData.formattedValue}`}
      />
    </Card>
  );
}
