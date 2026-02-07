"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import type { ClientData } from "./types";

interface ClientEditFormProps {
  editClient: ClientData;
  loading: boolean;
  error?: string;
  onChange: (client: ClientData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ClientEditForm({
  editClient,
  loading,
  error,
  onChange,
  onSave,
  onCancel,
}: ClientEditFormProps) {
  return (
    <div className="space-y-4">
      <Label>Modifier le client</Label>
      <div className="rounded-md border p-4 bg-muted/50 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="edit-client-name">Nom complet *</Label>
          <Input
            id="edit-client-name"
            placeholder="Jean Dupont"
            value={editClient.name}
            onChange={(e) =>
              onChange({ ...editClient, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-client-email">Email *</Label>
          <Input
            id="edit-client-email"
            type="email"
            placeholder="jean.dupont@example.com"
            value={editClient.email}
            onChange={(e) =>
              onChange({ ...editClient, email: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-client-phone">Téléphone</Label>
          <Input
            id="edit-client-phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={editClient.phone}
            onChange={(e) =>
              onChange({ ...editClient, phone: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-client-company">Société</Label>
          <Input
            id="edit-client-company"
            placeholder="Nom de l'entreprise"
            value={editClient.company}
            onChange={(e) =>
              onChange({ ...editClient, company: e.target.value })
            }
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={onSave}
            disabled={!editClient.name || !editClient.email || loading}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
