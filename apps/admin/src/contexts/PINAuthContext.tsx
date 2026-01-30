'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useIsPWA } from '@/components/PWADetector';

interface PINAuthContextType {
  isPWA: boolean;
  isPINSet: boolean;
  isPINVerified: boolean;
  isLoading: boolean;
  setupPIN: (pin: string) => Promise<void>;
  verifyPIN: (pin: string) => Promise<boolean>;
  resetPIN: () => void;
}

const PINAuthContext = createContext<PINAuthContextType | undefined>(undefined);

export function PINAuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const isPWA = useIsPWA();

  const [isPINSet, setIsPINSet] = useState(false);
  const [isPINVerified, setIsPINVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si PIN existe dans localStorage
  useEffect(() => {
    if (!isPWA) {
      // Si pas en mode PWA, pas de vérification PIN
      setIsPINVerified(true);
      setIsLoading(false);
      return;
    }

    // Vérifier si PIN existe
    const storedPINHash = localStorage.getItem('pin_hash');
    const storedUserId = localStorage.getItem('pin_user_id');

    if (storedPINHash && storedUserId === session?.user?.id) {
      setIsPINSet(true);
      // PIN existe mais pas encore vérifié
      setIsPINVerified(false);
    } else {
      setIsPINSet(false);
      setIsPINVerified(false);
    }

    setIsLoading(false);
  }, [isPWA, session?.user?.id]);

  /**
   * Configurer un PIN pour la première fois
   * Appelé après login email/password réussi
   */
  const setupPIN = async (pin: string): Promise<void> => {
    if (!session?.user?.id) {
      throw new Error('Utilisateur non connecté');
    }

    // Hasher le PIN côté client (simple pour l'exemple, améliorer en prod)
    const pinHash = await hashPIN(pin);

    // Sauvegarder dans localStorage
    localStorage.setItem('pin_hash', pinHash);
    localStorage.setItem('pin_user_id', session.user.id);
    localStorage.setItem('pin_setup_date', new Date().toISOString());

    setIsPINSet(true);
    setIsPINVerified(true);
  };

  /**
   * Vérifier un PIN
   * Appelé à chaque ouverture de la PWA
   */
  const verifyPIN = async (pin: string): Promise<boolean> => {
    const storedHash = localStorage.getItem('pin_hash');
    if (!storedHash) return false;

    const pinHash = await hashPIN(pin);

    if (pinHash === storedHash) {
      setIsPINVerified(true);
      return true;
    }

    return false;
  };

  /**
   * Réinitialiser le PIN
   * Force l'utilisateur à refaire login email/password
   */
  const resetPIN = (): void => {
    localStorage.removeItem('pin_hash');
    localStorage.removeItem('pin_user_id');
    localStorage.removeItem('pin_setup_date');
    setIsPINSet(false);
    setIsPINVerified(false);
  };

  return (
    <PINAuthContext.Provider
      value={{
        isPWA,
        isPINSet,
        isPINVerified,
        isLoading,
        setupPIN,
        verifyPIN,
        resetPIN,
      }}
    >
      {children}
    </PINAuthContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte PIN Auth
 */
export function usePINAuth() {
  const context = useContext(PINAuthContext);
  if (!context) {
    throw new Error('usePINAuth doit être utilisé dans un PINAuthProvider');
  }
  return context;
}

/**
 * Hasher un PIN (SHA-256)
 * En production, utiliser une lib comme bcrypt côté serveur
 */
async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
