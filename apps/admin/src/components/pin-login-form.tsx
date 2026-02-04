"use client";

import logoCircle from "@/../public/logo/logo-circle.webp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { PINLogin } from "./auth/PINLogin";
import { EmailPasswordLogin } from "./auth/EmailPasswordLogin";

type LoginMode = 'email' | 'pin';

export function PINLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>('email'); // Email par défaut

  const handlePINSubmit = async (pin: string) => {
    setError("");
    setLoading(true);

    try {
      // Vérifier que c'est bien un PIN de 6 chiffres
      if (!/^\d{6}$/.test(pin)) {
        setError("Le PIN doit contenir exactement 6 chiffres");
        setLoading(false);
        return;
      }

      // Connecter avec NextAuth en utilisant le PIN uniquement (pas d'email)
      const result = await signIn("credentials", {
        email: "", // Pas d'email pour l'authentification par PIN
        password: pin, // PIN 6 chiffres
        redirect: false, // Gérer la redirection manuellement
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.ok) {
        // Force un refresh complet pour éviter les problèmes de cache
        // et garantir que la nouvelle session est bien prise en compte
        window.location.replace('/admin');
      } else {
        setError("Une erreur s'est produite lors de la connexion");
        setLoading(false);
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la connexion");
      setLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      // Connecter avec NextAuth en utilisant email + password
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Gérer la redirection manuellement
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.ok) {
        // Force un refresh complet pour éviter les problèmes de cache
        // et garantir que la nouvelle session est bien prise en compte
        window.location.replace('/admin');
      } else {
        setError("Une erreur s'est produite lors de la connexion");
        setLoading(false);
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la connexion");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <a href="/" className="flex justify-center mb-4">
            <Image
              src={logoCircle}
              alt="CoworKing Café Logo"
              width={100}
              height={100}
              className="object-cover rounded-full"
            />
          </a>

          <CardTitle className="text-xl">Bienvenue sur CoworKing Café</CardTitle>
          <CardDescription>
            {mode === 'email'
              ? "Connectez-vous avec votre email et mot de passe"
              : "Connectez-vous avec votre code PIN"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'email' ? (
            <EmailPasswordLogin
              onSubmit={handleEmailPasswordSubmit}
              isLoading={loading}
              error={error}
            />
          ) : (
            <PINLogin
              onSubmit={handlePINSubmit}
              isLoading={loading}
              error={error}
              title=""
              pinLength={6}
            />
          )}

          {/* Toggle entre les modes */}
          <div className="text-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode(mode === 'email' ? 'pin' : 'email');
                setError('');
              }}
              disabled={loading}
            >
              {mode === 'email'
                ? "🔢 Connexion avec PIN"
                : "📧 Connexion avec email"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
