"use client";

import { cn } from "@/lib/utils";

// Formateur de devises français
const AmountFormatter = new Intl.NumberFormat("fr", {
  style: "currency",
  currency: "EUR",
});

// Formateur de dates français
const DateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Props pour les composants
type AmountDisplayProps = {
  amount: number | string;
  className?: string;
  showSign?: boolean;
  variant?: "default" | "positive" | "negative" | "muted";
};

type DateDisplayProps = {
  date: string | Date;
  className?: string;
  format?: "short" | "long" | "custom";
  customFormat?: Intl.DateTimeFormatOptions;
};

type LabelValuePairProps = {
  label: string;
  value: string | number;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  orientation?: "horizontal" | "vertical";
};

// Composant pour afficher un montant formaté
export function AmountDisplay({
  amount,
  className,
  showSign = false,
  variant = "default",
}: AmountDisplayProps) {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return <span className={cn("text-muted-foreground", className)}>-</span>;
  }

  const formattedAmount = AmountFormatter.format(numericAmount);
  const displayAmount =
    showSign && numericAmount > 0 ? `+${formattedAmount}` : formattedAmount;

  const variantClasses = {
    default: "",
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    muted: "text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        variantClasses[variant],
        className,
      )}
    >
      {displayAmount}
    </span>
  );
}

// Composant pour afficher une date formatée
export function DateDisplay({
  date,
  className,
  format = "short",
  customFormat,
}: DateDisplayProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        Date invalide
      </span>
    );
  }

  let formattedDate: string;

  if (format === "custom" && customFormat) {
    const formatter = new Intl.DateTimeFormat("fr-FR", customFormat);
    formattedDate = formatter.format(dateObj);
  } else if (format === "long") {
    const formatter = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    formattedDate = formatter.format(dateObj);
  } else {
    formattedDate = DateFormatter.format(dateObj);
  }

  return <span className={cn("text-sm", className)}>{formattedDate}</span>;
}

// Composant pour afficher une paire label/valeur
export function LabelValuePair({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  orientation = "horizontal",
}: LabelValuePairProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex gap-2",
        isVertical ? "flex-col" : "items-center justify-between",
        className,
      )}
    >
      <span
        className={cn(
          "text-muted-foreground text-sm font-medium",
          !isVertical && "min-w-fit",
          labelClassName,
        )}
      >
        {label}:
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          !isVertical && "text-right",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

// Composant pour une liste de paires label/valeur
export function LabelValueList({
  items,
  className,
  orientation = "vertical",
}: {
  items: { label: string; value: string | number; className?: string }[];
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      className={cn(
        "space-y-2",
        orientation === "horizontal" && "flex flex-wrap space-y-0 space-x-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <LabelValuePair
          key={index}
          label={item.label}
          value={item.value}
          className={item.className}
          orientation={orientation}
        />
      ))}
    </div>
  );
}

// Composant pour afficher des entrées avec labels et montants (pour prestaB2B/dépenses)
export function LabelAmountList({
  entries,
  className,
  emptyMessage = "Aucune entrée",
}: {
  entries: Array<{ label: string; value: number }>;
  className?: string;
  emptyMessage?: string;
}) {
  if (!entries || entries.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground py-2 text-center text-sm",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  const validEntries = entries.filter(
    (entry) => entry.label && entry.value !== undefined && entry.value !== null,
  );

  if (validEntries.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground py-2 text-center text-sm",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {validEntries.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <span className="min-w-12 flex-1 text-right text-sm font-medium">
            {entry.label}:
          </span>
          <AmountDisplay
            amount={entry.value}
            className="min-w-16 text-right text-sm"
          />
        </div>
      ))}
    </div>
  );
}
