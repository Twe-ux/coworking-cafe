'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface JustificationReadDialogProps {
  open: boolean
  onClose: () => void
  onConfirmRead: () => void
  isLoading?: boolean
  justificationNote: string
  clockIn: string
  clockOut?: string | null
  date: string
  employeeName: string
}

/**
 * Modal pour afficher une justification de pointage hors planning
 * et permettre à l'admin de marquer comme lue
 */
export function JustificationReadDialog({
  open,
  onClose,
  onConfirmRead,
  isLoading = false,
  justificationNote,
  clockIn,
  clockOut,
  date,
  employeeName,
}: JustificationReadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Justification de pointage hors planning</DialogTitle>
          <DialogDescription>
            Employé : <span className="font-semibold">{employeeName}</span>
            <br />
            Date : <span className="font-semibold">{date}</span>
            <br />
            Horaires : <span className="font-semibold">{clockIn} - {clockOut || '--:--'}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-medium text-orange-900 mb-2">
              Raison fournie par l'employé :
            </p>
            <p className="whitespace-pre-wrap text-sm text-orange-800">
              {justificationNote}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            En cliquant sur "J'ai lu", vous confirmez avoir pris connaissance de cette justification.
            L'icône deviendra verte et le badge du menu sera mis à jour.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirmRead}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                J'ai lu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
