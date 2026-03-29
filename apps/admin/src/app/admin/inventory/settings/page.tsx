'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { TemplateCard } from '@/components/inventory/settings/TemplateCard'
import { TemplateDialog } from '@/components/inventory/settings/TemplateDialog'

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

export default function InventorySettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchTemplates(), fetchSuppliers()])
    setLoading(false)
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/inventory/tasks/templates')
      const data = await res.json()
      if (data.success) {
        // Ensure supplierIds is always an array
        const templatesWithDefaults = (data.data || []).map((t: Template) => ({
          ...t,
          supplierIds: t.supplierIds || [],
        }))
        setTemplates(templatesWithDefaults)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/inventory/suppliers')
      const data = await res.json()
      if (data.success) {
        setSuppliers(
          (data.data || []).map((s: any) => ({
            id: s._id || s.id, // API returns _id
            name: s.name,
            isActive: s.isActive,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleToggleActive = async (templateId: string) => {
    try {
      const res = await fetch(`/api/inventory/tasks/templates/${templateId}`, {
        method: 'PATCH',
      })
      const data = await res.json()
      if (data.success) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId ? { ...t, active: data.data.active } : t
          )
        )
        toast({
          title: data.data.active ? 'Template activé' : 'Template désactivé',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le statut',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return
    }

    try {
      const res = await fetch(`/api/inventory/tasks/templates/${templateId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId))
        toast({
          title: 'Template supprimé',
          description: 'Le template a été supprimé avec succès',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le template',
        variant: 'destructive',
      })
    }
  }

  const handleSaveDialog = () => {
    fetchTemplates()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Gérer les templates d'inventaires récurrents
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer un template
        </Button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Aucun template configuré. Créez-en un pour démarrer.
          </p>
          <Button
            onClick={handleCreate}
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer un template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              suppliers={suppliers}
              onToggleActive={handleToggleActive}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
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
              • <strong>Jours</strong> : Configurez les jours de récurrence (semaine/mois)
            </li>
            <li>
              • <strong>Fournisseurs</strong> : Sélectionnez les fournisseurs à inventorier
            </li>
            <li>
              • <strong>Tâches automatiques</strong> : Les tâches apparaissent sur
              /admin/inventory aux jours configurés
            </li>
            <li>
              • <strong>Modifier</strong> : Cliquez sur l'icône crayon pour modifier un
              template
            </li>
            <li>
              • <strong>Supprimer</strong> : Cliquez sur l'icône poubelle pour supprimer un
              template
            </li>
          </ul>
        </div>
      )}

      {/* Template Dialog */}
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        suppliers={suppliers}
        onSave={handleSaveDialog}
      />
    </div>
  )
}
