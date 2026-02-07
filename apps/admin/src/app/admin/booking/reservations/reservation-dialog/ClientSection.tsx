"use client";

import { useMemo, useState } from "react";
import { useClientsCache } from "@/hooks/useClientsCache";
import { useClientManagement } from "./hooks/useClientManagement";
import { ClientEditForm } from "./ClientEditForm";
import { SelectedClientDisplay } from "./SelectedClientDisplay";
import { ClientSearchInput } from "./ClientSearchInput";
import { ClientSearchResults } from "./ClientSearchResults";
import { ClientCreateForm } from "./ClientCreateForm";
import type { ClientData, ClientSectionProps } from "./types";

export function ClientSection({
  selectedClient,
  onChange,
  error,
}: ClientSectionProps) {
  // Utiliser le hook de cache pour les clients
  const {
    clients,
    loading: initialLoading,
    addToCache,
    updateInCache,
  } = useClientsCache();

  const [searchQuery, setSearchQuery] = useState("");

  // Utiliser le hook de gestion des clients
  const {
    loading,
    newClient,
    editClient,
    isEditing,
    setNewClient,
    setEditClient,
    handleCreateNewClient,
    handleSaveEdit,
    handleEditClient,
    handleCancelEdit,
  } = useClientManagement({
    onClientChange: onChange,
    addToCache,
    updateInCache,
  });

  // Filtrer les clients en fonction de la recherche
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.company && client.company.toLowerCase().includes(query)),
    );
  }, [clients, searchQuery]);

  const handleSelectClient = (client: ClientData) => {
    console.log("✅ Client sélectionné:", client);
    console.log("🔑 ID du client:", client.id);
    onChange(client);
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setNewClient({ name: "", email: "", phone: "", company: "" });
  };

  const handleCreateClient = async () => {
    await handleCreateNewClient();
    setSearchQuery("");
  };

  // Si un client est déjà sélectionné, afficher ses infos
  if (selectedClient) {
    // Mode édition
    if (isEditing && editClient) {
      return (
        <ClientEditForm
          editClient={editClient}
          loading={loading}
          error={error}
          onChange={setEditClient}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      );
    }

    // Mode affichage normal
    return (
      <SelectedClientDisplay
        client={selectedClient}
        error={error}
        onEdit={() => handleEditClient(selectedClient)}
        onChange={onChange}
      />
    );
  }

  // Afficher le champ de recherche
  return (
    <div className="space-y-4">
      <ClientSearchInput
        searchQuery={searchQuery}
        loading={loading}
        initialLoading={initialLoading}
        onChange={setSearchQuery}
        onClear={handleClearSearch}
      />

      {/* Résultats de recherche */}
      {searchQuery && !initialLoading && filteredClients.length > 0 && (
        <ClientSearchResults
          clients={filteredClients}
          onSelect={handleSelectClient}
        />
      )}

      {/* Aucun résultat trouvé - Afficher le formulaire de création */}
      {searchQuery && !initialLoading && filteredClients.length === 0 && (
        <ClientCreateForm
          newClient={newClient}
          loading={loading}
          searchQuery={searchQuery}
          onChange={setNewClient}
          onCreate={handleCreateClient}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
