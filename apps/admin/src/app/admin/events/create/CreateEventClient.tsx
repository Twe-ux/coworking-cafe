"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ArrowLeft, X } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";
import type { EventFormData } from "@/components/events/EventForm";

export function CreateEventClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      setMessage(null);

      console.log("📤 Données envoyées à l'API:", data);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("📥 Réponse HTTP:", response.status, response.statusText);

      const result = await response.json();
      console.log("📥 Résultat API:", result);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Événement créé avec succès !",
        });

        // Redirect to events list after 1.5 seconds
        setTimeout(() => {
          router.push("/admin/events");
        }, 1500);
      } else {
        console.error("❌ Erreur API:", result);
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la création",
        });
      }
    } catch (error) {
      console.error("❌ Exception:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de la création de l'événement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/events");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={handleCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer un événement</h1>
          <p className="text-muted-foreground">
            Ajouter un nouvel événement au site public
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="relative">
          <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
            {message.text}
          </StyledAlert>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Form */}
      <EventForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
