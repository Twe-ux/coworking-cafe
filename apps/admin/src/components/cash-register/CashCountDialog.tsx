import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CashCountHelper } from "@/components/cash-register/CashCountHelper";
import { Calculator } from "lucide-react";
import type { CashCountDetails } from "@/types/cashRegister";

interface CashCountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTotalCalculated: (total: number, details: CashCountDetails) => void;
}

export function CashCountDialog({
  open,
  onOpenChange,
  onTotalCalculated,
}: CashCountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
          title="Aide au comptage"
        >
          <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aide au comptage</DialogTitle>
        </DialogHeader>
        <CashCountHelper onTotalCalculated={onTotalCalculated} />
      </DialogContent>
    </Dialog>
  );
}
