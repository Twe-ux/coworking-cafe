'use client';

import { usePINAuth } from '@/contexts/PINAuthContext';
import { PINSetup } from './PINSetup';
import { PINLogin } from './PINLogin';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Wrapper d'authentification PWA
 * Affiche :
 * - PINSetup si première connexion (après login email/password)
 * - PINLogin si PIN déjà configuré
 * - Contenu normal si PIN vérifié ou pas en mode PWA
 */
export function PWAAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { isPWA, isPINSet, isPINVerified, isLoading } = usePINAuth();
  const router = useRouter();

  console.log('[PWAAuth]', { isPWA, isPINSet, isPINVerified, isLoading, status, hasSession: !!session });

  // Si pas en mode PWA, afficher le contenu normalement
  if (!isPWA) {
    console.log('[PWAAuth] Mode Web détecté, pas de vérification PIN localStorage');
    return <>{children}</>;
  }

  // Loading
  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas de session → Redirect vers login email/password
  if (!session) {
    router.push('/login');
    return null;
  }

  // Si PIN pas encore configuré → Setup PIN
  if (!isPINSet) {
    return <PINSetup />;
  }

  // Si PIN configuré mais pas vérifié → Login PIN
  if (!isPINVerified) {
    return <PINLogin />;
  }

  // PIN vérifié → Afficher le contenu
  return <>{children}</>;
}
