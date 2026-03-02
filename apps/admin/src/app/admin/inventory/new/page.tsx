'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ClipboardPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { InventoryType, APIResponse, InventoryEntry } from '@/types/inventory'

export default function NewInventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-fill from task link: ?taskId=xxx&type=weekly|monthly
  const taskId = searchParams.get('taskId')
  const presetType = searchParams.get('type') as InventoryType | null

  const [type, setType] = useState<InventoryType>(presetType || 'monthly')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/inventory/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, date, taskId }),
      })

      const data = (await res.json()) as APIResponse<InventoryEntry>

      if (data.success && data.data) {
        router.push(`/admin/inventory/${data.data._id}`)
      } else {
        setError(data.error || "Erreur lors de la creation")
      }
    } catch {
      setError('Erreur reseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-lg">
      <Button variant="ghost" onClick={() => router.push('/admin/inventory')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardPlus className="h-5 w-5" />
            Nouvel inventaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskId && (
            <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded text-sm mb-4 border border-blue-200">
              Cet inventaire est lie a une tache planifiee. Il sera automatiquement marque comme complete a la finalisation.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type d&apos;inventaire</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as InventoryType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    Mensuel (tous les produits)
                  </SelectItem>
                  <SelectItem value="weekly">
                    Hebdomadaire (DLC courte uniquement)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creation en cours...' : 'Creer l\'inventaire'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
