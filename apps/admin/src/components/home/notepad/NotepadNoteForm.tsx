"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useStaffNotes } from "@/hooks/useStaffNotes";
import type { NoteDestination } from "@/types/staffNote";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NotepadPINInput } from "./NotepadPINInput";

interface NotepadNoteFormProps {
  destination: NoteDestination;
  onSent?: () => void;
}

export function NotepadNoteForm({ destination, onSent }: NotepadNoteFormProps) {
  const [content, setContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const { sendNote, isSending } = useStaffNotes(destination, { fetchEnabled: false });

  const canSend = content.trim().length > 0;

  const handleSendClick = () => {
    setPin("");
    setPinError("");
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (pin.length !== 4) return;
    setPinError("");

    try {
      await sendNote({ destination, content: content.trim(), pin });
      toast.success(
        destination === "admin"
          ? "Message envoyé à l'admin"
          : "Message laissé pour l'équipe",
      );
      setContent("");
      setPin("");
      setDialogOpen(false);
      onSent?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      if (
        message.toLowerCase().includes("code") ||
        message.toLowerCase().includes("pin")
      ) {
        setPinError("Code incorrect");
      } else {
        toast.error(message);
        setDialogOpen(false);
      }
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              destination === "admin"
                ? "Notez ici vos évènements de caisse et/ou de terrain à signaler à l'admin tels que suppression, erreur, remise, annulation... (indiquez les heures)"
                : "Laissez une note pour l'équipe du lendemain..."
            }
            maxLength={1000}
            rows={3}
            className="text-sm bg-card resize-none placeholder:italic placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={!canSend}
            onClick={handleSendClick}
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700 h-8 text-xs"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Envoyer
          </Button>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSending) setDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Confirmer l&apos;envoi
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <NotepadPINInput
              value={pin}
              onChange={(v) => {
                setPin(v);
                setPinError("");
              }}
              disabled={isSending}
              error={pinError}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={isSending}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfirm}
              disabled={pin.length !== 4 || isSending}
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
