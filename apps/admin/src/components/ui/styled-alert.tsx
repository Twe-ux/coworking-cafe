import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

interface StyledAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Alert component with automatic icons and consistent styling
 *
 * @example
 * <StyledAlert variant="success">Operation completed successfully!</StyledAlert>
 * <StyledAlert variant="destructive" title="Error">Something went wrong</StyledAlert>
 */
export function StyledAlert({
  variant = "default",
  title,
  children,
  className
}: StyledAlertProps) {
  const Icon = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
  }[variant];

  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
