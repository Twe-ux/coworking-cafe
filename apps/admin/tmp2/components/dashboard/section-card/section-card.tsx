import { Card } from "@/components/ui/card";
import { useReportingData } from "@/hooks/use-reporting";
import type { ReportingRange } from "@/store/reporting/api";
import { ReactNode, useEffect } from "react";
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
  // Utiliser notre hook pour récupérer toutes les données (HT et TTC)
  const {
    data: mainData,
    isLoading: mainLoading,
    error: mainError,
  } = useReportingData(range, compare);

  // Utiliser le hook pour les données de comparaison (pour le footer)
  const {
    data: compareData,
    isLoading: compareLoading,
    error: compareError,
  } = useReportingData(secRange);

  // Optimisation du rendu
  useEffect(() => {
    // Track state changes for optimization
  }, [
    mainData,
    compareData,
    mainLoading,
    compareLoading,
    mainError,
    compareError,
    range,
  ]);

  // Affichage optimisé : montrer le contenu dès que possible
  if (mainLoading && !mainData) {
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

  if (!mainData) {
    return (
      <Card className="@container/card">
        <div className="p-4 text-center text-gray-500">
          <div className="text-sm">Données principales non disponibles</div>
          <div className="mt-1 text-xs text-gray-400">
            Range: {range} ({mainData ? "✓" : "✗"})
          </div>
          {mainError && (
            <div className="mt-2 text-xs text-red-500">{mainError}</div>
          )}
        </div>
      </Card>
    );
  }

  // Affichage avec données principales disponibles (même si compareData manque)
  // Cela permet un affichage plus rapide
  const safeCompareData = compareData || {
    totals: { HT: 0, TTC: 0, formattedHT: "0 €", formattedTTC: "0 €" },
  };

  return (
    <Card className="@container/card">
      <DashCardHeader
        description_header={description_header}
        value_TTC={mainData.totals.TTC}
        value_HT={mainData.totals.HT}
        checked={checked}
        compareTTC={mainData.comparison?.changes.TTC.percentage || 0}
        compareHT={mainData.comparison?.changes.HT.percentage || 0}
        compareValueTTC={mainData.comparison?.previous.TTC || 0}
        compareValueHT={mainData.comparison?.previous.HT || 0}
        value={checked ? mainData.totals.HT : mainData.totals.TTC}
      />
      <DashCardFooter
        text_trendin={text_trendin}
        valueChartData={{
          HT: safeCompareData.totals.HT,
          TTC: safeCompareData.totals.TTC,
        }}
        checked={checked}
        percentageChangeHT={mainData.comparison?.changes.HT.percentage || 0}
        percentageChangeTTC={mainData.comparison?.changes.TTC.percentage || 0}
        description_footer={`Comparé à ${secRange === "yesterday" ? "hier" : secRange === "week" ? "la semaine précédente" : secRange === "month" ? "le mois précédent" : "l'année précédente"} - ${checked ? safeCompareData.totals.formattedHT : safeCompareData.totals.formattedTTC}${compareLoading ? " (en cours...)" : ""}`}
      />
    </Card>
  );
}
