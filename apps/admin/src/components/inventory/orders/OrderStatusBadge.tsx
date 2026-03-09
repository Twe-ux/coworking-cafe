import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/inventory'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'En attente',
    className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100'
  },
  validated: {
    label: 'Validée',
    className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100'
  },
  sent: {
    label: 'Envoyée',
    className: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-100'
  },
  received: {
    label: 'Reçue',
    className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100'
  },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
