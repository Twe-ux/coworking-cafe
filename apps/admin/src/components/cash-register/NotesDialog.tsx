import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function NotesDialog({
  open,
  onOpenChange,
  notes,
  onNotesChange,
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={notes ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
          title="Ajouter une note"
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Note additionnelle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Remarques, incidents, etc."
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onNotesChange("");
                onOpenChange(false);
              }}
            >
              Effacer
            </Button>
            <Button onClick={() => onOpenChange(false)}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
