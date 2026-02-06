import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/types/cashRegister";

interface AmountWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountDifference: number;
  lastAmount: number | null;
  currentAmount: number;
  onContinue: () => void;
}

export function AmountWarningDialog({
  open,
  onOpenChange,
  amountDifference,
  lastAmount,
  currentAmount,
  onContinue,
}: AmountWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg">
            ⚠️ Écart important détecté
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-xs sm:text-sm">
            <p>
              Le montant saisi diffère de{" "}
              <span className="font-bold text-destructive">
                {formatCurrency(Math.abs(amountDifference))}
              </span>{" "}
              par rapport au dernier enregistrement.
            </p>
            {lastAmount !== null && (
              <p className="text-xs sm:text-sm">
                Dernier montant :{" "}
                <span className="font-semibold">
                  {formatCurrency(lastAmount)}
                </span>
              </p>
            )}
            <p className="text-xs sm:text-sm">
              Montant actuel :{" "}
              <span className="font-semibold">{formatCurrency(currentAmount)}</span>
            </p>
            <p className="font-semibold text-orange-600 mt-4 text-xs sm:text-sm">
              Veuillez prévenir le responsable avant de continuer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="m-0 text-sm">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} className="m-0 text-sm">
            J'ai prévenu, continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
