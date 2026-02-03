'use client';

import { useState } from 'react';
import { usePINAuth } from '@/contexts/PINAuthContext';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { StyledAlert } from '@/components/ui/styled-alert';

/**
 * Écran de saisie du PIN
 * Affiché à chaque ouverture de la PWA (après le premier setup)
 */
export function PINLogin() {
  const { verifyPIN, resetPIN } = usePINAuth();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 6) {
      setError('Le PIN doit contenir 6 chiffres');
      return;
    }

    try {
      setLoading(true);
      const isValid = await verifyPIN(pin);

      if (!isValid) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');

        if (newAttempts >= 3) {
          setError('Trop de tentatives incorrectes. Veuillez vous reconnecter.');
          // Après 3 tentatives, reset PIN et logout
          setTimeout(() => {
            resetPIN();
            signOut({ callbackUrl: '/login' });
          }, 2000);
        } else {
          setError(`Code PIN incorrect (${newAttempts}/3 tentatives)`);
        }
      }
      // Si valide, le composant PWAAuth va automatiquement afficher le contenu
    } catch (err) {
      setError('Erreur lors de la vérification du PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPIN = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre PIN ? Vous devrez vous reconnecter avec votre email et mot de passe.')) {
      resetPIN();
      signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Entrez votre Code PIN</CardTitle>
          <CardDescription>
            Saisissez votre code PIN à 6 chiffres
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="text-center text-3xl tracking-widest"
                autoFocus
                disabled={attempts >= 3}
              />
            </div>

            {error && (
              <StyledAlert variant="destructive">
                {error}
              </StyledAlert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || attempts >= 3 || pin.length !== 6}
            >
              {loading ? 'Vérification...' : 'Déverrouiller'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={handleForgotPIN}
            >
              PIN oublié ? Se reconnecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
