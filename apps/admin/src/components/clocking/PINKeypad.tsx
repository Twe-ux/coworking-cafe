'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Delete } from 'lucide-react'
import { useState } from 'react'

interface PINKeypadProps {
  onSubmit: (pin: string) => void
  onCancel: () => void
  isLoading?: boolean
  error?: string
  employeeName?: string
  pinLength?: number // Longueur du PIN (4 pour pointage, 6 pour admin)
}

export default function PINKeypad({
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  employeeName,
  pinLength = 4, // Par défaut 4 chiffres pour le pointage
}: PINKeypadProps) {
  const [pin, setPin] = useState('')
  const PIN_LENGTH = pinLength

  const handleNumberPress = (number: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + number
      setPin(newPin)

      // Auto-valider dès que le PIN est complet
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          onSubmit(newPin)
        }, 100) // Petit délai pour feedback visuel
      }
    }
  }

  const handleClear = () => {
    setPin('')
  }

  const handleCancel = () => {
    setPin('')
    onCancel()
  }

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', ''],
  ]

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-medium">Code PIN requis</CardTitle>
        {employeeName && (
          <Badge variant="secondary" className="mx-auto">
            {employeeName}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PIN Display */}
        <div className="text-center">
          <div className="mb-2 flex justify-center space-x-2">
            {Array.from({ length: PIN_LENGTH }).map((_, index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full border-2 ${
                  index < pin.length
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Saisissez votre code PIN à {PIN_LENGTH} chiffres
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Keypad */}
        <div className="space-y-3">
          {numbers.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-3">
              {row.map((number, colIndex) => (
                <Button
                  key={colIndex}
                  variant={number ? 'outline' : 'ghost'}
                  size="lg"
                  className={`h-16 w-16 text-xl font-semibold ${
                    !number ? 'invisible' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => number && handleNumberPress(number)}
                  disabled={isLoading || !number}
                >
                  {number}
                </Button>
              ))}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex flex-1 items-center justify-center gap-2"
            onClick={handleClear}
            disabled={isLoading || pin.length === 0}
          >
            <Delete className="h-4 w-4" />
            Effacer
          </Button>
          <Button
            variant="outline"
            className="flex flex-1 items-center justify-center gap-2"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
