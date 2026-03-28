'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useInventoryTasks } from '@/hooks/inventory/useInventoryTasks'
import { Badge } from '@/components/ui/badge'

export default function InventorySettingsPage() {
  const router = useRouter()
  const { setupTemplates } = useInventoryTasks()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    created: number
    existing: number
    message: string
  } | null>(null)

  const handleSetup = async () => {
    setLoading(true)
    setResult(null)
    try {
      const success = await setupTemplates()
      if (success) {
        // Fetch result details by calling the API again to get the response
        const res = await fetch('/api/inventory/tasks/setup', { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          setResult({
            created: data.data.created,
            existing: data.data.existing,
            message: data.message,
          })
        }
      }
    } catch (error) {
      console.error('Error setting up templates:', error)
    } finally {
      setLoading(false)
    }
  }

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

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Inventaires Récurrents</CardTitle>
          </div>
          <CardDescription>
            Créer des tâches automatiques pour les inventaires hebdomadaires et mensuels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Templates Info */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Inventaire Hebdomadaire</h3>
                <Badge variant="secondary">Haute priorité</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Inventaire hebdomadaire des produits à DLC courte
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Tous les <strong>lundis</strong></span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Inventaire Mensuel</h3>
                <Badge variant="secondary">Priorité normale</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Inventaire mensuel complet de tous les produits
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Le <strong>1er de chaque mois</strong></span>
              </div>
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Configuration réussie !</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.created > 0 && `${result.created} template(s) créé(s). `}
                  {result.existing > 0 && `${result.existing} template(s) déjà existant(s).`}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Les tâches seront générées automatiquement chaque semaine/mois.
                  Elles apparaîtront dans le banner de la page Inventaire.
                </p>
              </div>
            </div>
          )}

          {/* Setup Button */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleSetup}
              disabled={loading}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configuration en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activer les inventaires récurrents
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Cette action est idempotente : si les templates existent déjà, ils ne seront pas recréés.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">ℹ️ Comment ça fonctionne ?</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Les tâches sont générées automatiquement selon la récurrence configurée</li>
              <li>• Un banner apparaît sur /admin/inventory avec les inventaires planifiés</li>
              <li>• Cliquez sur "Démarrer" pour créer l'inventaire pré-rempli</li>
              <li>• Plus besoin de créer manuellement les inventaires chaque semaine/mois</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
