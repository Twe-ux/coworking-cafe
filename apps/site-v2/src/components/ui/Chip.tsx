import { cn } from "@/lib/cn";

type ChipVariant = "default" | "dark" | "btn" | "success" | "error" | "warning";

interface ChipProps {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<ChipVariant, string> = {
  default: "bg-main/10 text-[var(--main)]",
  dark:    "bg-[rgba(255,255,255,0.08)] text-white",
  btn:     "bg-[var(--btn)] text-[var(--body)]",
  success: "bg-success/12 text-success",
  error:   "bg-danger/12 text-[var(--danger)]",
  warning: "bg-btn/20 text-[var(--btn-dark)]",
};

export function Chip({ variant = "default", className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        "px-3 py-[7px] text-[11.5px] font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  color = "var(--main)",
}: { color?: string }) {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
