import { Switch } from "../ui/switch";

type SwitchWithTextProps = {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  firstText: string;
  secondText: string;
};

export default function SwitchWithText({
  checked,
  setChecked,
  firstText,
  secondText,
}: SwitchWithTextProps) {
  return (
    <div className="flex items-center gap-2">
      <span>{firstText}</span>
      <Switch
        className="data-[state=checked]:bg-(--chart-4) data-[state=unchecked]:bg-(--chart-5)"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <span>{secondText}</span>
    </div>
  );
}
