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
import { PINLogin } from "./auth/PINLogin";

export function PINLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin`
          : "/admin";

      const result = await signIn("credentials", {
        email: "", // Pas d'email pour l'authentification par PIN
        password: pin, // PIN 6 chiffres
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        setError(result.error);
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
            Connectez-vous au dashboard administrateur avec votre code PIN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PINLogin
            onSubmit={handlePINSubmit}
            isLoading={loading}
            error={error}
            title=""
            pinLength={6}
          />
        </CardContent>
      </Card>
    </div>
  );
}
