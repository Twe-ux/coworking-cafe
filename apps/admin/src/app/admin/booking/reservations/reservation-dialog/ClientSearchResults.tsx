"use client";

import { cn } from "@/lib/utils";
import type { ClientData } from "./types";

interface ClientSearchResultsProps {
  clients: ClientData[];
  onSelect: (client: ClientData) => void;
}

export function ClientSearchResults({
  clients,
  onSelect,
}: ClientSearchResultsProps) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border max-h-[300px] overflow-y-auto">
      <div className="p-2">
        <p className="text-sm text-muted-foreground px-2 py-1">
          {clients.length} client
          {clients.length > 1 ? "s" : ""} trouvé
          {clients.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="space-y-1 p-2">
        {clients.map((client) => (
          <button
            key={client.id || client.email}
            type="button"
            onClick={() => onSelect(client)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{client.name}</span>
              <span className="text-sm text-muted-foreground">
                {client.email}
              </span>
              {client.phone && (
                <span className="text-xs text-muted-foreground">
                  {client.phone}
                </span>
              )}
              {client.company && (
                <span className="text-xs text-muted-foreground font-medium">
                  {client.company}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
