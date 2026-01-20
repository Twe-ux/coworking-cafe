/**
 * Dialog footer actions component
 */

import { Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type { DialogActionsProps } from './types'

export function DialogActions({
  isEditing,
  isSubmitting,
  onDelete,
  onClose,
  onSubmit,
}: DialogActionsProps) {
  return (
    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
      {isEditing && (
        <Button
          variant="destructive"
          onClick={onDelete}
          className="flex w-full items-center gap-2 sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
          Delete Shift
        </Button>
      )}

      <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 sm:flex-none"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex flex-1 items-center gap-2 sm:flex-none"
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? 'Saving...'
            : isEditing
              ? 'Update Shift'
              : 'Add Shift'}
        </Button>
      </div>
    </DialogFooter>
  )
}
