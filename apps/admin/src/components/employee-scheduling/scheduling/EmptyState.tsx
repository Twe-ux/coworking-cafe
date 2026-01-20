'use client'

import { Calendar } from 'lucide-react'

interface EmptyStateProps {
  className?: string
}

/**
 * Empty state when no shifts are scheduled
 */
export function EmptyState({ className = '' }: EmptyStateProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="py-12 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Aucun creneau planifie
        </h3>
        <p className="text-gray-600">
          Vous n&apos;avez aucun creneau de travail programme pour les semaines a venir.
        </p>
      </div>
    </div>
  )
}

/**
 * Fallback for non-staff users
 */
export function NonStaffFallback({ className = '' }: EmptyStateProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="py-12 text-center">
        <p className="text-gray-600">
          Ce composant est reserve au personnel (staff).
        </p>
      </div>
    </div>
  )
}
