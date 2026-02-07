"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, X } from "lucide-react";

interface ClientSearchInputProps {
  searchQuery: string;
  loading: boolean;
  initialLoading: boolean;
  onChange: (query: string) => void;
  onClear: () => void;
}

export function ClientSearchInput({
  searchQuery,
  loading,
  initialLoading,
  onChange,
  onClear,
}: ClientSearchInputProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Label>Client</Label>
        {initialLoading && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Chargement...</span>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client par nom, email ou société..."
          value={searchQuery}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9"
          disabled={loading && !initialLoading}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Message de chargement si recherche pendant le chargement initial */}
      {searchQuery && initialLoading && (
        <div className="rounded-md border p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Chargement des clients en cours...</span>
          </div>
        </div>
      )}
    </>
  );
}
