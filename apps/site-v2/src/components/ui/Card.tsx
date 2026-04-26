import { cn } from "@/lib/cn";

type CardVariant = "default" | "cream" | "dark";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white border border-[var(--line)]",
  cream:   "bg-[var(--cream)] border border-[var(--line)]",
  dark:    "bg-[var(--body)] border border-[rgba(255,255,255,0.1)] text-white",
};

export function Card({
  variant = "default",
  className,
  children,
  style,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] p-[clamp(18px,2vw,24px)]",
        variantClasses[variant],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
