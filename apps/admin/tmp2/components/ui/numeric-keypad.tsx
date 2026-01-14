"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NumericKeypadProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  enteredPassword: string;
  onKeypadPress: (key: string) => void;
  onKeypadClear: () => void;
  onKeypadDelete: () => void;
  onSubmit: () => void;
  maxLength?: number;
};

export function NumericKeypad({
  isOpen,
  onClose,
  title,
  enteredPassword,
  onKeypadPress,
  onKeypadClear,
  onKeypadDelete,
  onSubmit,
  maxLength = 4,
}: NumericKeypadProps) {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "⌫"],
  ];

  const handleKeyClick = (key: string) => {
    if (key === "C") {
      onKeypadClear();
    } else if (key === "⌫") {
      onKeypadDelete();
    } else if (key !== "C" && key !== "⌫") {
      if (enteredPassword.length < maxLength) {
        onKeypadPress(key);
      }
    }
  };

  const handleSubmit = () => {
    if (enteredPassword.length === maxLength) {
      onSubmit();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Affichage du mot de passe masqué */}
          <div className="flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: maxLength }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-4 w-4 rounded-full border-2",
                    index < enteredPassword.length
                      ? "bg-primary border-primary"
                      : "bg-muted border-muted-foreground/30",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Clavier numérique */}
          <div className="grid grid-cols-3 gap-3">
            {keys.flat().map((key) => (
              <Button
                key={key}
                variant={
                  key === "C"
                    ? "destructive"
                    : key === "⌫"
                      ? "secondary"
                      : "outline"
                }
                size="lg"
                className={cn(
                  "h-12 text-lg font-semibold",
                  "transition-transform hover:scale-105 active:scale-95",
                  key === "0" && "col-span-1",
                )}
                onClick={() => handleKeyClick(key)}
                disabled={
                  key !== "C" &&
                  key !== "⌫" &&
                  enteredPassword.length >= maxLength
                }
              >
                {key}
              </Button>
            ))}
          </div>

          {/* Bouton de validation */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={enteredPassword.length !== maxLength}
              className="flex-1"
            >
              Valider
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
