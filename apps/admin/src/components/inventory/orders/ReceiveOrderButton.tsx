'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { ReceiveOrderModal } from './ReceiveOrderModal'

/**
 * Bouton "Réceptionner" pour la page staff
 * Ouvre un modal pour réceptionner les commandes en attente
 */
export function ReceiveOrderButton() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
        onClick={() => setModalOpen(true)}
      >
        <Package className="mr-2 h-4 w-4" />
        Réceptionner
      </Button>

      <ReceiveOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
