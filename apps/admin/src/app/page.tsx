'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logoCircle from '@/../public/logo/logo-circle.webp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserCog, CalendarOff, Calendar, ChefHat } from 'lucide-react';
import { RequestUnavailabilityModal } from '@/components/staff/RequestUnavailabilityModal';

/**
 * Page d'accueil
 * Accessible sans authentification (restriction IP locale)
 */
export default function HomePage() {
  const [isUnavailabilityModalOpen, setIsUnavailabilityModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Fetch employees for unavailability modal
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/hr/employees?status=active");
        const result = await response.json();
        if (result.success) {
          setEmployees(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Pointage */}
        <Link href="/clocking" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600" />
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

        {/* Mon Planning */}
        <Link href="/my-schedule" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Mon Planning</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Consulter mon emploi du temps de la semaine
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Demander une indisponibilité */}
        <div onClick={() => setIsUnavailabilityModalOpen(true)} className="cursor-pointer">
          <Card className="hover:bg-muted/50 transition-colors h-full border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <CalendarOff className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle>Demander une indisponibilité</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Déclarer congés, maladie ou absence personnelle
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Menu & Recettes */}
        <Link href="/produits" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <ChefHat className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle>Menu & Recettes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Découvrir le menu et les recettes du café
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Dashboard Admin */}
        <Link href="/login" className="block md:col-span-2 lg:col-span-1">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-2 hover:border-primary bg-primary/5">
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

      {/* Info section */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg max-w-5xl w-full">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Astuce :</strong> Toutes ces fonctionnalités sont accessibles sans connexion sur le poste fixe du café
        </p>
      </div>

      {/* Request Unavailability Modal */}
      <RequestUnavailabilityModal
        isOpen={isUnavailabilityModalOpen}
        employees={employees}
        onClose={() => setIsUnavailabilityModalOpen(false)}
      />
    </div>
  );
}
