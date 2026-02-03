"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit2, Save, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ClientData, ClientSectionProps } from "./types";

export function ClientSection({
  selectedClient,
  onChange,
  error,
}: ClientSectionProps) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form pour nouveau client
  const [newClient, setNewClient] = useState<ClientData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  // Form pour édition client
  const [editClient, setEditClient] = useState<ClientData | null>(null);

  // Fetch clients existants
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // Exclure les abonnés newsletter - uniquement les vrais utilisateurs
      const response = await fetch("/api/users?excludeNewsletterOnly=true");
      const data = await response.json();

      if (data.success) {
        // L'API retourne déjà uniquement les clients (filtre côté serveur)
        const clientsData: ClientData[] = data.data.map((user: any) => ({
          id: user.id, // L'API retourne "id" pas "_id"
          name: user.givenName || user.username || user.email,
          email: user.email,
          phone: user.phone || "",
          company: user.companyName || "",
        }));
        console.log("👥 Clients récupérés:", clientsData);
        setClients(clientsData);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateNewClient = async () => {
    if (!newClient.name) {
      return;
    }

    try {
      setLoading(true);

      // Si email + téléphone fournis → créer un compte user
      if (newClient.email) {
        // Récupérer le roleId du rôle "client"
        const rolesResponse = await fetch("/api/hr/roles");
        const rolesData = await rolesResponse.json();

        const clientRole = rolesData.data?.find(
          (role: any) => role.slug === "client",
        );
        if (!clientRole) {
          console.error("❌ Rôle 'client' introuvable");
          return;
        }

        // Créer le nouveau client dans la base users
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newClient.email,
            givenName: newClient.name,
            phone: newClient.phone,
            companyName: newClient.company,
            roleId: clientRole.id,
            password: Math.random().toString(36).slice(-12), // Mot de passe temporaire
            newsletter: false,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("✅ Compte client créé:", data.data);

          // Générer le token d'activation
          const activationToken = crypto.randomUUID();
          const tokenExpires = new Date();
          tokenExpires.setHours(tokenExpires.getHours() + 48); // Token valide 48h

          // Sauvegarder le token dans le user
          await fetch(`/api/users/${data.data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activationToken,
              activationTokenExpires: tokenExpires.toISOString(),
            }),
          });

          // Envoyer l'email d'activation
          try {
            const emailResponse = await fetch("/api/email/send-activation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: data.data.email,
                userName: data.data.givenName || data.data.email,
                activationToken,
              }),
            });

            const emailData = await emailResponse.json();
            if (emailData.success) {
              console.log("✅ Email d'activation envoyé à", data.data.email);
            } else {
              console.error(
                "❌ Erreur envoi email d'activation:",
                emailData.error,
              );
            }
          } catch (emailError) {
            console.error("❌ Erreur envoi email:", emailError);
          }

          // Retourner le client créé avec son ID
          onChange({
            id: data.data.id,
            name: data.data.givenName || data.data.email,
            email: data.data.email,
            phone: data.data.phone || "",
            company: data.data.companyName || "",
          });

          // Rafraîchir la liste des clients
          await fetchClients();
        } else {
          console.error("❌ Erreur lors de la création du client:", data.error);
        }
      } else {
        // Pas d'email → client simple sans compte (juste contact info)
        console.log("✅ Client simple créé (sans compte):", newClient);

        onChange({
          id: undefined, // Pas d'ID user
          name: newClient.name,
          email: "",
          phone: newClient.phone || "",
          company: newClient.company || "",
        });
      }

      setSearchQuery("");
      setNewClient({ name: "", email: "", phone: "", company: "" });
    } catch (error) {
      console.error("❌ Erreur lors de la création du client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setNewClient({ name: "", email: "", phone: "", company: "" });
  };

  const handleEditClient = () => {
    setEditClient({ ...selectedClient! });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditClient(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editClient || !editClient.id) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/users/${editClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          givenName: editClient.name,
          email: editClient.email,
          phone: editClient.phone,
          companyName: editClient.company,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Client modifié:", data.data);

        // Mettre à jour le client sélectionné
        onChange({
          id: data.data.id,
          name: data.data.givenName || data.data.email,
          email: data.data.email,
          phone: data.data.phone || "",
          company: data.data.companyName || "",
        });

        // Rafraîchir la liste des clients
        await fetchClients();

        setIsEditing(false);
        setEditClient(null);
      } else {
        console.error(
          "❌ Erreur lors de la modification du client:",
          data.error,
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de la modification du client:", error);
    } finally {
      setLoading(false);
    }
  };

  // Si un client est déjà sélectionné, afficher ses infos
  if (selectedClient) {
    // Mode édition
    if (isEditing && editClient) {
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
                  setEditClient({ ...editClient, name: e.target.value })
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
                  setEditClient({ ...editClient, email: e.target.value })
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
                  setEditClient({ ...editClient, phone: e.target.value })
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
                  setEditClient({ ...editClient, company: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editClient.name || !editClient.email || loading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
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

    // Mode affichage normal
    return (
      <div className="space-y-4">
        <Label>Client</Label>
        <div className="rounded-md border p-4 bg-muted/50">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{selectedClient.name}</p>
                {!selectedClient.id ? (
                  <Badge variant="outline" className="text-xs">
                    Client simple
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Avec compte
                  </Badge>
                )}
              </div>
              {selectedClient.email ? (
                <p className="text-sm text-muted-foreground">
                  {selectedClient.email}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Pas d'email renseigné
                </p>
              )}
              {selectedClient.phone && (
                <p className="text-sm text-muted-foreground">
                  {selectedClient.phone}
                </p>
              )}
              {selectedClient.company && (
                <p className="text-sm text-muted-foreground font-medium">
                  {selectedClient.company}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditClient}
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

  // Sinon, afficher le champ de recherche
  return (
    <div className="space-y-4">
      <Label>Client</Label>

      {/* Champ de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client par nom, email ou société..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
          disabled={loading}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {searchQuery && filteredClients.length > 0 && (
        <div className="rounded-md border max-h-[300px] overflow-y-auto">
          <div className="p-2">
            <p className="text-sm text-muted-foreground px-2 py-1">
              {filteredClients.length} client
              {filteredClients.length > 1 ? "s" : ""} trouvé
              {filteredClients.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-1 p-2">
            {filteredClients.map((client) => (
              <button
                key={client.id || client.email}
                type="button"
                onClick={() => handleSelectClient(client)}
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
      )}

      {/* Aucun résultat trouvé - Afficher le formulaire de création */}
      {searchQuery && filteredClients.length === 0 && (
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
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">
                Email <span className="text-xs text-muted-foreground">(optionnel - requis pour créer un compte)</span>
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="jean.dupont@example.com"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
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
                  setNewClient({ ...newClient, phone: e.target.value })
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
                  setNewClient({ ...newClient, company: e.target.value })
                }
              />
            </div>

            <Button
              type="button"
              onClick={handleCreateNewClient}
              disabled={!newClient.name}
              className={cn(
                "w-full",
                newClient.email
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              )}
            >
              {newClient.email
                ? "Créer un compte client"
                : "Créer un client simple"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
