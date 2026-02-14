"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Utiliser l'origine actuelle pour supporter mobile/IP réseau
      const callbackUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/admin`
        : '/admin';

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
      });

      // Si signIn retourne (pas de redirect), c'est qu'il y a une erreur
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // Si pas d'erreur, NextAuth redirige automatiquement
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
              src="/images/logo-circle.webp"
              alt="CoworKing Café Logo"
              width={100}
              height={100}
              className="object-cover rounded-full"
            />
          </a>

          <CardTitle className="text-xl">
            Bienvenue sur CoworKing Café
          </CardTitle>
          <CardDescription>
            Connectez-vous au dashboard administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
