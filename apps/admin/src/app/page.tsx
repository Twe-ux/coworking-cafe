import Image from 'next/image'
import Link from 'next/link'
import logoCircle from '@/../public/logo/logo-circle.webp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, UserCog } from 'lucide-react'

/**
 * Page d'accueil
 * Accessible sans authentification (restriction IP locale)
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted p-6">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={logoCircle}
          alt="CoworKing Café Logo"
          width={120}
          height={120}
          className="object-cover rounded-full"
        />
        <h1 className="text-3xl font-bold text-center">CoworKing Café</h1>
        <p className="text-muted-foreground text-center">
          Bienvenue sur le système de gestion
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Pointage */}
        <Link href="/clocking" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Pointage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Pointer votre arrivée ou départ avec votre code PIN (4 chiffres)
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Dashboard Admin */}
        <Link href="/login" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <UserCog className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Dashboard Admin</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Accéder au panneau d'administration (PIN 6 chiffres)
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
