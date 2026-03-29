'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Calendar, Edit, Trash2 } from 'lucide-react'

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

interface TemplateCardProps {
  template: Template
  suppliers: Supplier[]
  onToggleActive: (templateId: string) => void
  onEdit: (template: Template) => void
  onDelete: (templateId: string) => void
}

const DAYS_OF_WEEK = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function TemplateCard({
  template,
  suppliers,
  onToggleActive,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const priorityVariant = {
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  }[template.priority] as 'destructive' | 'secondary' | 'outline'

  const priorityLabel = {
    high: 'Haute priorité',
    medium: 'Priorité normale',
    low: 'Basse priorité',
  }[template.priority]

  const getDaysLabel = () => {
    if (template.recurrenceType === 'weekly') {
      return template.recurrenceDays
        .map((day) => DAYS_OF_WEEK[day])
        .join(', ')
    }
    return template.recurrenceDays.join(', ')
  }

  const getSuppliersLabel = () => {
    if (template.supplierIds.length === 0) {
      return 'Tous les fournisseurs'
    }
    const selectedSuppliers = suppliers.filter((s) =>
      template.supplierIds.includes(s.id)
    )
    return selectedSuppliers.map((s) => s.name).join(', ')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>{template.title}</CardTitle>
            <Badge variant={priorityVariant}>{priorityLabel}</Badge>
            {template.active && (
              <Badge variant="default" className="bg-green-600">
                Actif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={template.active}
              onCheckedChange={() => onToggleActive(template.id)}
            />
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onEdit(template)}
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(template.id)}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{template.description || 'Aucune description'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Type : </span>
          <span className="text-muted-foreground">
            {template.inventoryType === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium">
            {template.recurrenceType === 'weekly'
              ? 'Jours de la semaine : '
              : 'Jours du mois : '}
          </span>
          <span className="text-muted-foreground">{getDaysLabel()}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">Fournisseurs : </span>
          <span className="text-muted-foreground">{getSuppliersLabel()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
