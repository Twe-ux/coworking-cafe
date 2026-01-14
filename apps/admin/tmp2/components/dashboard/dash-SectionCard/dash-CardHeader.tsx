import { Badge } from "@/components/ui/badge";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

type DashCardHeaderProps = {
  description_header: string;
  value_TTC: number;
  value_HT: number;
  checked: boolean;
  compareTTC: number; // Pourcentage de comparaison TTC (déjà calculé)
  compareHT: number; // Pourcentage de comparaison HT (déjà calculé)
  compareValueTTC: number; // Valeur absolue TTC de la période de comparaison
  compareValueHT: number; // Valeur absolue HT de la période de comparaison
  value: number;
};

export function DashCardHeader({
  description_header,
  value_TTC,
  value_HT,
  checked,
  value: _value,
  compareTTC, // Pourcentage déjà calculé
  compareHT, // Pourcentage déjà calculé
  compareValueTTC, // Valeur absolue TTC de comparaison
  compareValueHT, // Valeur absolue HT de comparaison
}: DashCardHeaderProps) {
  const AmountFormatter = new Intl.NumberFormat("fr", {
    style: "currency",
    currency: "eur",
  });

  // Utiliser directement les pourcentages reçus
  const percentageChangeTTC = compareTTC;
  const percentageChangeHT = compareHT;

  const textColor =
    (checked ? percentageChangeTTC : percentageChangeHT) > 0
      ? "text-green-500"
      : "text-red-500";

  // if (percentageChangeHT < 0) {
  //   setTrendinHeader(<TrendingDown className="size-4" />);
  //   textColor = "text-red-500";
  // } else {
  //   setTrendinHeader(<TrendingUp className="size-4" />);
  //   textColor = "text-green-500";
  // }

  return (
    <CardHeader>
      <CardDescription>{description_header}</CardDescription>
      <CardTitle className="flex gap-2 text-2xl font-semibold tabular-nums">
        {!checked ? (
          <>
            <div className="text-end">
              <div>{AmountFormatter.format(value_HT)}</div>
              <div className="text-sm">{AmountFormatter.format(value_TTC)}</div>
              {/* <div className="text-sm">{percentageChange.toFixed(2)}%</div> */}
            </div>
            <div className="text-start">
              <div>HT</div>
              <div className="text-sm">TTC</div>
            </div>
          </>
        ) : (
          <>
            <div className="text-end">
              <div>{AmountFormatter.format(value_TTC)}</div>
              <div className="text-sm">{AmountFormatter.format(value_HT)}</div>
            </div>
            <div className="text-start">
              <div>TTC</div>
              <div className="text-sm">HT</div>
            </div>
          </>
        )}
      </CardTitle>
      <CardAction>
        <div className="flex flex-col items-center gap-1">
          <Badge variant="outline">
            {(checked ? percentageChangeTTC : percentageChangeHT) > 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}

            <span className={textColor}>
              {checked
                ? percentageChangeTTC.toFixed(2)
                : percentageChangeHT.toFixed(2)}
              %
            </span>
          </Badge>
          <div className="text-sm font-bold text-gray-400">
            {checked
              ? AmountFormatter.format(compareValueTTC)
              : AmountFormatter.format(compareValueHT)}
          </div>
        </div>
      </CardAction>
    </CardHeader>
  );
}
