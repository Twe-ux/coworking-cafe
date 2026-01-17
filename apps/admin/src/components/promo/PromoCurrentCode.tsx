import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Percent, Calendar, Users, CircleCheck, CircleX } from 'lucide-react'
import type { PromoCode } from '@/types/promo'

/**
 * Affiche le code promo actuellement actif avec ses détails
 *
 * @param promoCode - Code promo actuel
 */
interface PromoCurrentCodeProps {
  promoCode?: PromoCode
}

export function PromoCurrentCode({ promoCode }: PromoCurrentCodeProps) {
  // Si promoCode est undefined, afficher un état vide
  if (!promoCode) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40 text-gray-500">
          Aucun code promo actif
        </div>
      </Card>
    )
  }

  const getDiscountDisplay = () => {
    switch (promoCode.discountType) {
      case 'percentage':
        return `${promoCode.discountValue}%`
      case 'fixed':
        return `${promoCode.discountValue}€`
      case 'free_item':
        return 'Article offert'
      default:
        return promoCode.discountValue
    }
  }

  const getUsagePercentage = () => {
    if (promoCode.maxUses === 0) return 0
    return Math.round((promoCode.currentUses / promoCode.maxUses) * 100)
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{promoCode.code}</h3>
            <Badge variant={promoCode.isActive ? 'default' : 'secondary'}>
              {promoCode.isActive ? (
                <span className="flex items-center gap-1">
                  <CircleCheck className="w-3 h-3" />
                  Actif
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CircleX className="w-3 h-3" />
                  Inactif
                </span>
              )}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{promoCode.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Percent className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Réduction</p>
            <p className="font-semibold">{getDiscountDisplay()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Utilisations</p>
            <p className="font-semibold">
              {promoCode.currentUses} / {promoCode.maxUses}
              <span className="text-xs text-gray-500 ml-1">({getUsagePercentage()}%)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Valide du</p>
            <p className="font-semibold">{promoCode.validFrom}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Jusqu'au</p>
            <p className="font-semibold">{promoCode.validUntil}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
