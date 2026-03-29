'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle, Loader2, Save, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
]

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}))

export default function InventorySettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchSuppliers()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/inventory/tasks/templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/inventory/suppliers')
      const data = await res.json()
      if (data.success) {
        setSuppliers(
          (data.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            isActive: s.isActive,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/inventory/tasks/setup', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Templates créés',
          description: `${data.data.created} template(s) créé(s), ${data.data.existing} existant(s)`,
        })
        await fetchTemplates()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer les templates',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleSave = async (template: Template) => {
    setSaving(template.id)
    try {
      const res = await fetch(`/api/inventory/tasks/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recurrenceDays: template.recurrenceDays,
          active: template.active,
          supplierIds: template.supplierIds,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Sauvegardé',
          description: 'Configuration mise à jour avec succès',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive',
      })
    } finally {
      setSaving(null)
    }
  }

  const handleToggleDay = (templateId: string, day: number) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          const days = t.recurrenceDays.includes(day)
            ? t.recurrenceDays.filter((d) => d !== day)
            : [...t.recurrenceDays, day].sort((a, b) => a - b)
          return { ...t, recurrenceDays: days }
        }
        return t
      })
    )
  }

  const handleToggleActive = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, active: !t.active } : t))
    )
  }

  const handleToggleSupplier = (templateId: string, supplierId: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          const supplierIds = t.supplierIds.includes(supplierId)
            ? t.supplierIds.filter((id) => id !== supplierId)
            : [...t.supplierIds, supplierId]
          return { ...t, supplierIds }
        }
        return t
      })
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const weeklyTemplate = templates.find((t) => t.inventoryType === 'weekly')
  const monthlyTemplate = templates.find((t) => t.inventoryType === 'monthly')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push('/admin/inventory')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Configuration Inventaires</h1>
          <p className="text-muted-foreground mt-1">
            Configurer les inventaires récurrents automatiques
          </p>
        </div>
      </div>

      {/* No templates yet */}
      {templates.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aucun template configuré</CardTitle>
            <CardDescription>
              Créez les templates pour activer les inventaires récurrents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreate}
              disabled={creating}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer les templates
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Template */}
      {weeklyTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Inventaire Hebdomadaire</CardTitle>
                <Badge variant="destructive">Haute priorité</Badge>
                {weeklyTemplate.active && (
                  <Badge variant="default" className="bg-green-600">
                    Actif
                  </Badge>
                )}
              </div>
              <Switch
                checked={weeklyTemplate.active}
                onCheckedChange={() => handleToggleActive(weeklyTemplate.id)}
              />
            </div>
            <CardDescription>
              Inventaire hebdomadaire des produits à DLC courte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Jours de la semaine
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`week-${day.value}`}
                      checked={weeklyTemplate.recurrenceDays.includes(day.value)}
                      onCheckedChange={() =>
                        handleToggleDay(weeklyTemplate.id, day.value)
                      }
                    />
                    <label
                      htmlFor={`week-${day.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Fournisseurs à inventorier
              </label>
              <div className="flex flex-wrap gap-2">
                {suppliers
                  .filter((s) => s.isActive)
                  .map((supplier) => (
                    <div key={supplier.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`week-supplier-${supplier.id}`}
                        checked={weeklyTemplate.supplierIds.includes(supplier.id)}
                        onCheckedChange={() =>
                          handleToggleSupplier(weeklyTemplate.id, supplier.id)
                        }
                      />
                      <label
                        htmlFor={`week-supplier-${supplier.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {supplier.name}
                      </label>
                    </div>
                  ))}
              </div>
              {suppliers.filter((s) => s.isActive).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucun fournisseur actif
                </p>
              )}
              {weeklyTemplate.supplierIds.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Si aucun fournisseur sélectionné, tous les fournisseurs seront
                  inclus
                </p>
              )}
            </div>

            <Button
              onClick={() => handleSave(weeklyTemplate)}
              disabled={saving === weeklyTemplate.id}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {saving === weeklyTemplate.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Monthly Template */}
      {monthlyTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Inventaire Mensuel</CardTitle>
                <Badge variant="secondary">Priorité normale</Badge>
                {monthlyTemplate.active && (
                  <Badge variant="default" className="bg-green-600">
                    Actif
                  </Badge>
                )}
              </div>
              <Switch
                checked={monthlyTemplate.active}
                onCheckedChange={() => handleToggleActive(monthlyTemplate.id)}
              />
            </div>
            <CardDescription>
              Inventaire mensuel complet de tous les produits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Jours du mois
              </label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_MONTH.map((day) => (
                  <div key={day.value} className="flex items-center gap-1">
                    <Checkbox
                      id={`month-${day.value}`}
                      checked={monthlyTemplate.recurrenceDays.includes(day.value)}
                      onCheckedChange={() =>
                        handleToggleDay(monthlyTemplate.id, day.value)
                      }
                    />
                    <label
                      htmlFor={`month-${day.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Fournisseurs à inventorier
              </label>
              <div className="flex flex-wrap gap-2">
                {suppliers
                  .filter((s) => s.isActive)
                  .map((supplier) => (
                    <div key={supplier.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`month-supplier-${supplier.id}`}
                        checked={monthlyTemplate.supplierIds.includes(supplier.id)}
                        onCheckedChange={() =>
                          handleToggleSupplier(monthlyTemplate.id, supplier.id)
                        }
                      />
                      <label
                        htmlFor={`month-supplier-${supplier.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {supplier.name}
                      </label>
                    </div>
                  ))}
              </div>
              {suppliers.filter((s) => s.isActive).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucun fournisseur actif
                </p>
              )}
              {monthlyTemplate.supplierIds.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Si aucun fournisseur sélectionné, tous les fournisseurs seront
                  inclus
                </p>
              )}
            </div>

            <Button
              onClick={() => handleSave(monthlyTemplate)}
              disabled={saving === monthlyTemplate.id}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {saving === monthlyTemplate.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      {templates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-medium text-blue-900 mb-2">ℹ️ Comment ça fonctionne ?</p>
          <ul className="space-y-1 text-blue-700">
            <li>
              • <strong>Activer/Désactiver</strong> : Toggle pour activer ou désactiver
              temporairement
            </li>
            <li>
              • <strong>Jours</strong> : Sélectionnez un ou plusieurs jours pour la
              récurrence
            </li>
            <li>
              • <strong>Banner</strong> : Les tâches apparaissent automatiquement sur
              /admin/inventory
            </li>
            <li>
              • <strong>Démarrer</strong> : Cliquez sur "Démarrer" pour créer
              l'inventaire pré-rempli
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
