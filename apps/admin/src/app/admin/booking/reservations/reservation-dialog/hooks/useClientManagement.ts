import { useState } from "react";
import type { ClientData } from "../types";
import type { ApiResponse } from "@/types/timeEntry";
import type { Role, User } from "@/types/user";

interface UseClientManagementProps {
  onClientChange: (client: ClientData | null) => void;
  addToCache: (newClient: ClientData) => void;
  updateInCache: (updatedClient: ClientData) => void;
}

interface UseClientManagementReturn {
  loading: boolean;
  newClient: ClientData;
  editClient: ClientData | null;
  isEditing: boolean;
  setNewClient: (client: ClientData) => void;
  setEditClient: (client: ClientData | null) => void;
  setIsEditing: (editing: boolean) => void;
  handleCreateNewClient: () => Promise<void>;
  handleSaveEdit: () => Promise<void>;
  handleEditClient: (client: ClientData) => void;
  handleCancelEdit: () => void;
}

export function useClientManagement({
  onClientChange,
  addToCache,
  updateInCache,
}: UseClientManagementProps): UseClientManagementReturn {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newClient, setNewClient] = useState<ClientData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [editClient, setEditClient] = useState<ClientData | null>(null);

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
        const rolesData: ApiResponse<Role[]> = await rolesResponse.json();

        const clientRole = rolesData.data?.find(
          (role) => role.slug === "client",
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

        const data: ApiResponse<User> = await response.json();

        if (data.success && data.data) {
          console.log("✅ Compte client créé:", data.data);

          const createdUser = data.data;

          // Générer le token d'activation
          const activationToken = crypto.randomUUID();
          const tokenExpires = new Date();
          tokenExpires.setHours(tokenExpires.getHours() + 48); // Token valide 48h

          // Sauvegarder le token dans le user
          await fetch(`/api/users/${createdUser.id}`, {
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
                email: createdUser.email,
                userName: createdUser.givenName || createdUser.email,
                activationToken,
              }),
            });

            const emailData: ApiResponse<{ messageId: string }> =
              await emailResponse.json();
            if (emailData.success) {
              console.log("✅ Email d'activation envoyé à", createdUser.email);
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
          const createdClient = {
            id: createdUser.id,
            name: createdUser.givenName || createdUser.email,
            email: createdUser.email,
            phone: createdUser.phone || "",
            company: createdUser.companyName || "",
          };
          onClientChange(createdClient);

          // Ajouter au cache
          addToCache(createdClient);
        } else {
          console.error("❌ Erreur lors de la création du client:", data.error);
        }
      } else {
        // Pas d'email → client simple sans compte (juste contact info)
        console.log("✅ Client simple créé (sans compte):", newClient);

        onClientChange({
          id: undefined, // Pas d'ID user
          name: newClient.name,
          email: "",
          phone: newClient.phone || "",
          company: newClient.company || "",
        });
      }

      setNewClient({ name: "", email: "", phone: "", company: "" });
    } catch (error) {
      console.error("❌ Erreur lors de la création du client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: ClientData) => {
    setEditClient({ ...client });
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

      const data: ApiResponse<User> = await response.json();

      if (data.success && data.data) {
        console.log("✅ Client modifié:", data.data);

        const updatedUser = data.data;

        // Mettre à jour le client sélectionné
        const updatedClient = {
          id: updatedUser.id,
          name: updatedUser.givenName || updatedUser.email,
          email: updatedUser.email,
          phone: updatedUser.phone || "",
          company: updatedUser.companyName || "",
        };
        onClientChange(updatedClient);

        // Mettre à jour le cache
        updateInCache(updatedClient);

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

  return {
    loading,
    newClient,
    editClient,
    isEditing,
    setNewClient,
    setEditClient,
    setIsEditing,
    handleCreateNewClient,
    handleSaveEdit,
    handleEditClient,
    handleCancelEdit,
  };
}
