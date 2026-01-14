import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartControlsProps {
  daysRange: 7 | 30 | 90;
  chartType: "area" | "bar";
  onDaysRangeChange: (value: 7 | 30 | 90) => void;
  onChartTypeChange: (value: "area" | "bar") => void;
}

export function ChartControls({
  daysRange,
  chartType,
  onDaysRangeChange,
  onChartTypeChange,
}: ChartControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={daysRange.toString()}
        onValueChange={(value: string) =>
          onDaysRangeChange(parseInt(value) as 7 | 30 | 90)
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7 jours</SelectItem>
          <SelectItem value="30">30 jours</SelectItem>
          <SelectItem value="90">90 jours</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={chartType}
        onValueChange={(value: string) =>
          onChartTypeChange(value as "area" | "bar")
        }
      >
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="area">Zone</SelectItem>
          <SelectItem value="bar">Barres</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
