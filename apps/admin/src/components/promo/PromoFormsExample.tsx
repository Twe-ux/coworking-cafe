'use client'

import { useState } from 'react'
import { PromoCreateForm, PromoMarketingForm } from '@/components/promo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CreatePromoCodeRequest, MarketingContent } from '@/types/promo'

/**
 * Exemple d'utilisation des formulaires Promo
 *
 * Ce composant montre comment intégrer les formulaires dans une page
 *
 * @example
 * ```tsx
 * // Dans une page
 * export default function PromoPage() {
 *   return <PromoFormsExample />
 * }
 * ```
 */
export function PromoFormsExample() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Données initiales pour le formulaire marketing (exemple)
  const initialMarketingData: MarketingContent = {
    title: 'Scannez pour révéler votre code promo !',
    message:
      'Profitez d\'une <strong>réduction exclusive</strong> en scannant ce QR code. ' +
      'Votre code promo sera révélé après le scan.',
    imageUrl: 'https://example.com/promo-banner.jpg',
    ctaText: 'Révéler mon code promo',
  }

  /**
   * Gère la création d'un nouveau code promo
   */
  const handleCreatePromoCode = async (data: CreatePromoCodeRequest) => {
    setIsCreating(true)

    try {
      const response = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création')
      }

      console.log('Code promo créé:', result.data)
      // Ici: refetch, redirect, etc.
    } catch (error) {
      console.error('Erreur création code promo:', error)
      throw error // Re-throw pour que le formulaire puisse gérer l'erreur
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Gère la mise à jour du contenu marketing
   */
  const handleUpdateMarketing = async (data: MarketingContent) => {
    setIsUpdating(true)

    try {
      const response = await fetch('/api/promo/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      console.log('Marketing mis à jour:', result.data)
      // Ici: refetch, notification, etc.
    } catch (error) {
      console.error('Erreur mise à jour marketing:', error)
      throw error // Re-throw pour que le formulaire puisse gérer l'erreur
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Codes Promo</h1>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Créer un code</TabsTrigger>
          <TabsTrigger value="marketing">Contenu marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau code promo</CardTitle>
              <CardDescription>
                Configurez un code promo avec ses conditions et sa période de validité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromoCreateForm onSubmit={handleCreatePromoCode} loading={isCreating} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Contenu de la page scan</CardTitle>
              <CardDescription>
                Personnalisez le message affiché après le scan du QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromoMarketingForm
                initialData={initialMarketingData}
                onSubmit={handleUpdateMarketing}
                loading={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
