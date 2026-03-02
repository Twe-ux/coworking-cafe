import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/inventory'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  draft: { label: 'Brouillon', variant: 'outline' },
  validated: { label: 'Validée', variant: 'secondary' },
  sent: { label: 'Envoyée', variant: 'default' },
  received: { label: 'Reçue', variant: 'default' },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
