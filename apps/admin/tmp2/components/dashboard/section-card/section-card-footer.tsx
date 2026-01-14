import { CardFooter } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

type DashCardFooterProps = {
  text_trendin: React.ReactNode;
  description_footer: React.ReactNode;
  percentageChangeHT: number; // Optional, can be used for future enhancements.
  percentageChangeTTC: number; // Optional, can be used for future enhancements.
  valueChartData: {
    HT: number;
    TTC: number;
  }; // Optional, can be used for future enhancements.
  checked: boolean;
};

export function DashCardFooter({
  text_trendin,
  percentageChangeHT,
  percentageChangeTTC,
  valueChartData,

  checked, // Optional, can be used for future enhancements.
}: DashCardFooterProps) {
  const AmountFormatter = new Intl.NumberFormat("fr", {
    style: "currency",
    currency: "eur",
  });

  const value_TTC = Math.round(valueChartData.TTC * 100);
  const value_HT = Math.round(valueChartData.HT * 100);

  return (
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      <div className="line-clamp-1 flex items-center gap-4 font-medium">
        <span className="">{text_trendin}</span>
        <span className="">
          {percentageChangeHT && percentageChangeTTC > 0 ? (
            <TrendingUp className="size-4 text-green-500" />
          ) : (
            <TrendingDown className="size-4 text-red-500" />
          )}
        </span>
      </div>
      <div className="">
        {checked
          ? `${AmountFormatter.format(value_TTC / 100)} TTC`
          : `${AmountFormatter.format(value_HT / 100)} HT`}
      </div>
    </CardFooter>
  );
}
