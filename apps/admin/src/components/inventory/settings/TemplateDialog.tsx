'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  title: string
  description: string
  priority: string
  recurrenceType: 'weekly' | 'monthly'
  recurrenceDays: number[]
  active: boolean
  inventoryType: 'weekly' | 'monthly'
  supplierIds: string[]
}

interface Supplier {
  id: string
  name: string
  isActive: boolean
}

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  suppliers: Supplier[]
  onSave: () => void
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
]

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1)

export function TemplateDialog({
  open,
  onOpenChange,
  template,
  suppliers,
  onSave,
}: TemplateDialogProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    recurrenceType: 'weekly' as 'weekly' | 'monthly',
    inventoryType: 'weekly' as 'weekly' | 'monthly',
    recurrenceDays: [] as number[],
    supplierIds: [] as string[],
    active: true,
  })

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        description: template.description || '',
        priority: template.priority as 'low' | 'medium' | 'high',
        recurrenceType: template.recurrenceType,
        inventoryType: template.inventoryType,
        recurrenceDays: template.recurrenceDays || [],
        supplierIds: template.supplierIds || [],
        active: template.active,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        recurrenceType: 'weekly',
        inventoryType: 'weekly',
        recurrenceDays: [],
        supplierIds: [],
        active: true,
      })
    }
  }, [template, open])

  const handleSave = async () => {
    if (!formData.title) {
      toast({
        title: 'Erreur',
        description: 'Le titre est requis',
        variant: 'destructive',
      })
      return
    }

    if (formData.recurrenceDays.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Sélectionnez au moins un jour',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const url = template
        ? `/api/inventory/tasks/templates/${template.id}`
        : '/api/inventory/tasks/templates'
      const method = template ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: template ? 'Template modifié' : 'Template créé',
          description: 'Configuration sauvegardée avec succès',
        })
        onSave()
        onOpenChange(false)
      } else {
        toast({
          title: 'Erreur',
          description: data.error || 'Impossible de sauvegarder',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter((d) => d !== day)
        : [...prev.recurrenceDays, day].sort((a, b) => a - b),
    }))
  }

  const toggleSupplier = (supplierId: string) => {
    setFormData((prev) => ({
      ...prev,
      supplierIds: prev.supplierIds.includes(supplierId)
        ? prev.supplierIds.filter((id) => id !== supplierId)
        : [...prev.supplierIds, supplierId],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Modifier le template' : 'Créer un template'}
          </DialogTitle>
          <DialogDescription>
            Configurez un template d'inventaire récurrent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ex: Inventaire fruits et légumes"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Description optionnelle"
              rows={2}
            />
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="inventoryType">Type d'inventaire *</Label>
            <Select
              value={formData.inventoryType}
              onValueChange={(value: 'weekly' | 'monthly') =>
                setFormData((prev) => ({
                  ...prev,
                  inventoryType: value,
                  recurrenceType: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priorité *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                setFormData((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence Days */}
          <div>
            <Label>
              {formData.recurrenceType === 'weekly'
                ? 'Jours de la semaine *'
                : 'Jours du mois *'}
            </Label>
            <div
              className={
                formData.recurrenceType === 'weekly'
                  ? 'flex flex-wrap gap-2 mt-2'
                  : 'grid grid-cols-7 gap-2 mt-2'
              }
            >
              {formData.recurrenceType === 'weekly'
                ? DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.recurrenceDays.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))
                : DAYS_OF_MONTH.map((day) => (
                    <div key={day} className="flex items-center gap-1">
                      <Checkbox
                        id={`day-${day}`}
                        checked={formData.recurrenceDays.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className="text-sm cursor-pointer"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
            </div>
          </div>

          {/* Suppliers */}
          <div>
            <Label>Fournisseurs à inventorier</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {suppliers
                .filter((s) => s.isActive)
                .map((supplier) => (
                  <div key={supplier.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`supplier-${supplier.id}`}
                      checked={formData.supplierIds.includes(supplier.id)}
                      onCheckedChange={() => toggleSupplier(supplier.id)}
                    />
                    <label
                      htmlFor={`supplier-${supplier.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {supplier.name}
                    </label>
                  </div>
                ))}
            </div>
            {suppliers.filter((s) => s.isActive).length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Aucun fournisseur actif
              </p>
            )}
            {formData.supplierIds.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Si aucun fournisseur sélectionné, tous seront inclus
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
