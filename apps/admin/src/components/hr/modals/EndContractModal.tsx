'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Employee } from '@/types/hr'

interface EndContractModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
  onConfirm: (endDate: string, reason: string) => Promise<void>
}

interface EndContractFormData {
  endDate: string
  endContractReason: 'démission' | 'fin-periode-essai' | 'rupture'
}

export function EndContractModal({
  employee,
  open,
  onClose,
  onConfirm,
}: EndContractModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<EndContractFormData>({
    defaultValues: {
      endDate: '',
      endContractReason: 'démission',
    },
  })

  const onSubmit = async (data: EndContractFormData) => {
    if (!employee) return

    setLoading(true)
    try {
      await onConfirm(data.endDate, data.endContractReason)
      reset()
      onClose()
    } catch (error) {
      console.error('Error ending contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fin de contrat</DialogTitle>
          <DialogDescription>
            Terminer le contrat de {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">
              Date de fin de contrat <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="endDate"
              control={control}
              rules={{ required: 'La date de fin est requise' }}
              render={({ field }) => (
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                  placeholder="Sélectionner la date de fin"
                />
              )}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endContractReason">
              Raison <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  'endContractReason',
                  value as 'démission' | 'fin-periode-essai' | 'rupture'
                )
              }
              defaultValue="démission"
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une raison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="démission">Démission</SelectItem>
                <SelectItem value="fin-periode-essai">
                  Fin de période d'essai
                </SelectItem>
                <SelectItem value="rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
