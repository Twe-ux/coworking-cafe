'use client'

import { useCallback, useRef, useState } from 'react'
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
import { FileText, Loader2, Upload, X } from 'lucide-react'
import type { Employee } from '@/types/hr'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface ResignationLetterData {
  filename: string
  contentBase64: string
}

interface EndContractModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
  onConfirm: (
    endDate: string,
    reason: string,
    resignationLetter?: ResignationLetterData
  ) => Promise<void>
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<EndContractFormData>({
    defaultValues: {
      endDate: '',
      endContractReason: 'démission',
    },
  })

  const endContractReason = watch('endContractReason')
  const showFileUpload = endContractReason === 'démission'

  const resetFileState = useCallback(() => {
    setSelectedFile(null)
    setFileBase64(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      setFileError(null)

      if (!file) {
        resetFileState()
        return
      }

      if (file.type !== 'application/pdf') {
        setFileError('Seuls les fichiers PDF sont acceptés')
        resetFileState()
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError('Le fichier ne doit pas dépasser 5 Mo')
        resetFileState()
        return
      }

      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1]
        setFileBase64(base64)
      }
      reader.onerror = () => {
        setFileError('Erreur lors de la lecture du fichier')
        resetFileState()
      }
      reader.readAsDataURL(file)
    },
    [resetFileState]
  )

  const onSubmit = async (data: EndContractFormData) => {
    if (!employee) return

    const resignationLetter =
      showFileUpload && selectedFile && fileBase64
        ? { filename: selectedFile.name, contentBase64: fileBase64 }
        : undefined

    setLoading(true)
    try {
      await onConfirm(data.endDate, data.endContractReason, resignationLetter)
      reset()
      resetFileState()
      onClose()
    } catch (error) {
      console.error('Error ending contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    resetFileState()
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

          {showFileUpload && (
            <div className="space-y-2">
              <Label>Lettre de démission (PDF)</Label>
              {selectedFile ? (
                <div className="flex items-center gap-3 rounded-md border border-gray-300 p-3">
                  <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(0)} Ko
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFileState}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
                >
                  <Upload className="h-4 w-4" />
                  Cliquer pour sélectionner un PDF
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileError && (
                <p className="text-sm text-destructive">{fileError}</p>
              )}
            </div>
          )}

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
