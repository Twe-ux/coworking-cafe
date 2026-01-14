import { TrendingUp } from "lucide-react";

interface ChartSummaryProps {
  thisYearTotal: number;
  lastYearTotal: number;
  growth: number;
}

export function ChartSummary({
  thisYearTotal,
  lastYearTotal,
  growth,
}: ChartSummaryProps) {
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div>
            <div className="text-xs text-muted-foreground">Année -1</div>
            <div className="font-semibold">
              €{Math.round(lastYearTotal).toLocaleString()}
            </div>
          </div>
          <div className="h-3 w-3 rounded bg-blue-500" />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div>
            <div className="text-xs text-muted-foreground">Cette année</div>
            <div className="font-semibold">
              €{Math.round(thisYearTotal).toLocaleString()}
            </div>
          </div>
          <div className="h-3 w-3 rounded bg-green-500" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center rounded-lg bg-muted/50 p-3">
        <TrendingUp
          className={`mr-2 h-4 w-4 ${
            growth >= 0 ? "text-green-600" : "text-red-600"
          }`}
        />
        <span className="text-sm font-medium">
          {growth >= 0 ? "+" : ""}
          {growth.toFixed(1)}% vs année précédente
        </span>
      </div>
    </>
  );
}
