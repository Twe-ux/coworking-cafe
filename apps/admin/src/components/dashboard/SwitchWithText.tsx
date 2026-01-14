"use client";

import { Switch } from "@/components/ui/switch";

interface SwitchWithTextProps {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  firstText: string;
  secondText: string;
}

/**
 * SwitchWithText - Toggle entre deux modes d'affichage (ex: HT/TTC)
 */
export default function SwitchWithText({
  checked,
  setChecked,
  firstText,
  secondText,
}: SwitchWithTextProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-medium transition-colors ${
          !checked ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {firstText}
      </span>
      <Switch checked={checked} onCheckedChange={setChecked} />
      <span
        className={`text-sm font-medium transition-colors ${
          checked ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {secondText}
      </span>
    </div>
  );
}
