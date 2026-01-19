'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Delete } from 'lucide-react'
import { useState } from 'react'

interface PINLoginProps {
  onSubmit: (pin: string) => void
  isLoading?: boolean
  error?: string
  title?: string
  pinLength?: number
}

export function PINLogin({
  onSubmit,
  isLoading = false,
  error,
  title = "Connexion Admin",
  pinLength = 6,
}: PINLoginProps) {
  const [pin, setPin] = useState('')

  const handleNumberPress = (number: string) => {
    if (pin.length < pinLength) {
      const newPin = pin + number
      setPin(newPin)

      // Auto-valider dès que 6 chiffres sont saisis
      if (newPin.length === pinLength) {
        setTimeout(() => {
          onSubmit(newPin)
        }, 100) // Petit délai pour feedback visuel
      }
    }
  }

  const handleClear = () => {
    setPin('')
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
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Saisissez votre code PIN à {pinLength} chiffres
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PIN Display */}
        <div className="text-center">
          <div className="mb-2 flex justify-center space-x-2">
            {Array.from({ length: pinLength }).map((_, index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full border-2 ${
                  index < pin.length
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>
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
                    !number ? 'invisible' : ''
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

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 w-full"
            onClick={handleClear}
            disabled={isLoading || pin.length === 0}
          >
            <Delete className="h-4 w-4" />
            Effacer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
