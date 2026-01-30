'use client';

import { useState } from 'react';
import { usePINAuth } from '@/contexts/PINAuthContext';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

/**
 * Écran de configuration du PIN
 * Affiché après le premier login email/password
 */
export function PINSetup() {
  const { data: session } = useSession();
  const { setupPIN } = usePINAuth();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (pin.length !== 6) {
      setError('Le PIN doit contenir exactement 6 chiffres');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('Le PIN doit contenir uniquement des chiffres');
      return;
    }

    if (pin !== confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      await setupPIN(pin);
      // Le composant PWAAuth va automatiquement passer au mode "vérifié"
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la configuration du PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Configurer votre Code PIN</CardTitle>
          <CardDescription>
            Bienvenue {session?.user?.name || session?.user?.email} !<br />
            Créez un code PIN à 6 chiffres pour un accès rapide.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium mb-2">
                Code PIN (6 chiffres)
              </label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium mb-2">
                Confirmer le Code PIN
              </label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Configuration...' : 'Configurer le PIN'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Ce code PIN sera utilisé pour un accès rapide à l'application.
              <br />
              Vous pourrez le modifier dans les paramètres.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
