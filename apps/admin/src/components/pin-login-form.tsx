"use client";

import logoCircle from "@/../public/logo/logo-circle.webp";
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
import { useState } from "react";
import { EmailPasswordLogin } from "./auth/EmailPasswordLogin";

/**
 * Formulaire de connexion - Email + Password uniquement
 *
 * Note: Le mode PIN est réservé au bouton "Admin" dans la sidebar staff.
 * La page login n'affiche que Email + Password pour plus de sécurité.
 */
export function PINLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
