"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientData } from "./types";

interface ClientCreateFormProps {
  newClient: ClientData;
  loading: boolean;
  searchQuery: string;
  onChange: (client: ClientData) => void;
  onCreate: () => void;
}

export function ClientCreateForm({
  newClient,
  loading,
  searchQuery,
  onChange,
  onCreate,
}: ClientCreateFormProps) {
  return (
    <div className="space-y-3 rounded-md border p-4 bg-muted/50">
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground">
          Aucun client trouvé pour "{searchQuery}"
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Créer un client simple (nom uniquement) ou avec compte (nom + email)
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="space-y-2">
          <Label htmlFor="client-name">Nom complet *</Label>
          <Input
            id="client-name"
            placeholder="Jean Dupont"
            value={newClient.name}
            onChange={(e) =>
              onChange({ ...newClient, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-email">
            Email{" "}
            <span className="text-xs text-muted-foreground">
              (optionnel - requis pour créer un compte)
            </span>
          </Label>
          <Input
            id="client-email"
            type="email"
            placeholder="jean.dupont@example.com"
            value={newClient.email}
            onChange={(e) =>
              onChange({ ...newClient, email: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-phone">Téléphone</Label>
          <Input
            id="client-phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={newClient.phone}
            onChange={(e) =>
              onChange({ ...newClient, phone: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-company">Société</Label>
          <Input
            id="client-company"
            placeholder="Nom de l'entreprise"
            value={newClient.company}
            onChange={(e) =>
              onChange({ ...newClient, company: e.target.value })
            }
          />
        </div>

        <Button
          type="button"
          onClick={onCreate}
          disabled={!newClient.name || loading}
          className={cn(
            "w-full",
            newClient.email
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              {newClient.email
                ? "Créer un compte client"
                : "Créer un client simple"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
