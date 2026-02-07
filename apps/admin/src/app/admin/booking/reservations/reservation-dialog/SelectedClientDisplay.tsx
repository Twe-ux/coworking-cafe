"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import type { ClientData } from "./types";

interface SelectedClientDisplayProps {
  client: ClientData;
  error?: string;
  onEdit: () => void;
  onChange: (client: ClientData | null) => void;
}

export function SelectedClientDisplay({
  client,
  error,
  onEdit,
  onChange,
}: SelectedClientDisplayProps) {
  return (
    <div className="space-y-4">
      <Label>Client</Label>
      <div className="rounded-md border p-4 bg-muted/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{client.name}</p>
              {!client.id ? (
                <Badge variant="outline" className="text-xs">
                  Client simple
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Avec compte
                </Badge>
              )}
            </div>
            {client.email ? (
              <p className="text-sm text-muted-foreground">{client.email}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Pas d'email renseigné
              </p>
            )}
            {client.phone && (
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            )}
            {client.company && (
              <p className="text-sm text-muted-foreground font-medium">
                {client.company}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              Changer
            </Button>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
