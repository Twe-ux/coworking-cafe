import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "dark" | "ghost" | "ghost-light";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--btn)] text-[var(--body)] font-semibold hover:opacity-90",
  dark:
    "bg-[var(--body)] text-white hover:opacity-90",
  ghost:
    "bg-transparent text-[var(--body)] border border-[var(--line)] hover:bg-[var(--line)]",
  "ghost-light":
    "bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.14)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-[14px] py-[10px] text-[13px]",
  md: "px-[22px] py-[14px] text-[14px]",
  lg: "px-[28px] py-[16px] text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-[10px]",
          "rounded-full font-medium",
          "transition-all duration-150 active:translate-y-px",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-[var(--main)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
