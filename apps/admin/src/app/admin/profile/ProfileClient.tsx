"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PINLogin } from "@/components/auth/PINLogin";
import { useToast } from "@/hooks/use-toast";
import { User, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { toast } = useToast();
  const [showPINChange, setShowPINChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePINSubmit = async (newPIN: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/update-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPIN }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de la mise à jour du PIN");
        setLoading(false);
        return;
      }

      toast({
        title: "PIN mis à jour",
        description: "Votre code PIN a été modifié avec succès",
      });

      setShowPINChange(false);
    } catch (error) {
      setError("Une erreur s'est produite");
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "dev":
        return "default";
      case "admin":
        return "secondary";
      case "staff":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "dev":
        return "Développeur";
      case "admin":
        return "Administrateur";
      case "staff":
        return "Staff";
      default:
        return "Utilisateur";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground mt-2">
          Gérer mes informations personnelles et mon code PIN
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations du profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations
            </CardTitle>
            <CardDescription>
              Vos informations de compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <p className="text-lg font-semibold">{user.name || "Non défini"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changer le PIN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Code PIN
            </CardTitle>
            <CardDescription>
              Modifier votre code PIN de connexion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showPINChange ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Votre code PIN vous permet de vous connecter rapidement à l'application.
                </p>
                <Button onClick={() => setShowPINChange(true)} className="w-full">
                  Changer mon PIN
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Saisissez votre nouveau code PIN (6 chiffres)
                </p>
                <PINLogin
                  onSubmit={handlePINSubmit}
                  isLoading={loading}
                  error={error}
                  title=""
                  pinLength={6}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPINChange(false);
                    setError("");
                  }}
                  className="w-full"
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
