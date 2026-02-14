"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { EmailPasswordLogin } from "./auth/EmailPasswordLogin";
import { PINLogin } from "./auth/PINLogin";

/**
 * Formulaire de connexion adaptatif selon l'IP
 *
 * - IP validée (commerce) → Formulaire PIN
 * - IP non validée (extérieur) → Formulaire Email + Password
 */
export function PINLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isIPAllowed, setIsIPAllowed] = useState<boolean | null>(null);
  const [checkingIP, setCheckingIP] = useState(true);

  // Vérifier l'IP au chargement
  useEffect(() => {
    async function checkIP() {
      try {
        const response = await fetch('/api/auth/check-ip');
        const data = await response.json();

        if (data.success) {
          setIsIPAllowed(data.isAllowed);
        } else {
          // En cas d'erreur, considérer l'IP comme non autorisée (sécurité)
          setIsIPAllowed(false);
        }
      } catch (error) {
        // En cas d'erreur, considérer l'IP comme non autorisée
        setIsIPAllowed(false);
      } finally {
        setCheckingIP(false);
      }
    }

    checkIP();
  }, []);

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

  const handlePINSubmit = async (pin: string) => {
    setError("");
    setLoading(true);

    try {
      // Connecter avec NextAuth en utilisant PIN uniquement (pas d'email)
      const result = await signIn("credentials", {
        password: pin, // PIN envoyé comme password
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.ok) {
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

  // Afficher un skeleton pendant la vérification IP
  if (checkingIP) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <a href="/" className="flex justify-center mb-4">
              <Image
                src="/images/logo-circle.webp"
                alt="CoworKing Café Logo"
                width={100}
                height={100}
                className="object-cover rounded-full"
              />
            </a>
            <CardTitle className="text-xl">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Afficher le formulaire PIN si IP autorisée
  if (isIPAllowed) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="text-center mb-4">
          <a href="/" className="flex justify-center mb-4">
            <Image
              src="/images/logo-circle.webp"
              alt="CoworKing Café Logo"
              width={100}
              height={100}
              className="object-cover rounded-full"
            />
          </a>
        </div>
        <PINLogin
          onSubmit={handlePINSubmit}
          isLoading={loading}
          error={error}
          title="Connexion Admin"
        />
      </div>
    );
  }

  // Afficher le formulaire email/password si IP non autorisée
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <a href="/" className="flex justify-center mb-4">
            <Image
              src="/images/logo-circle.webp"
              alt="CoworKing Café Logo"
              width={100}
              height={100}
              className="object-cover rounded-full"
            />
          </a>

          <CardTitle className="text-xl">Bienvenue sur CoworKing Café</CardTitle>
          <CardDescription>
            Connectez-vous avec votre email et mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPasswordLogin
            onSubmit={handleEmailPasswordSubmit}
            isLoading={loading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
